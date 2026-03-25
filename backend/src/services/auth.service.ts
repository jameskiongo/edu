import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { and, eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import { otpCodes, refreshTokens, users } from "../db/schema.js";
import { EmailService } from "./email.service.js";
import { type OTPResult, OtpService } from "./otp.service";
import { TokenService, type Tokens } from "./token.service";

dotenv.config();

export class AuthService {
	private static readonly SALT_ROUNDS = 12;
	private static readonly MAX_LOGIN_ATTEMPTS = 5;
	private static readonly LOCK_TIME_MINUTES = 30;
	private static readonly OTP_EXPIRY_MINUTES = 10;

	static async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, AuthService.SALT_ROUNDS);
	}

	static async comparePassword(
		password: string,
		hash: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	static async register(
		name: string,
		email: string,
		password: string,
		phoneNumber: string,
	): Promise<{
		userId: number;
		message: string;
		deliveryMethod: "sms" | "email";
	}> {
		const existingUser = await db
			.select()
			.from(users)
			.where(or(eq(users.email, email), eq(users.phoneNumber, phoneNumber)))
			.limit(1)
			.then((rows) => rows[0]);

		if (existingUser) {
			throw new Error("Email or Phone number already registered");
		}

		const hashedPassword = await AuthService.hashPassword(password);

		const [newUser] = await db
			.insert(users)
			.values({
				name: name,
				email: email,
				password: hashedPassword,
				phoneNumber: phoneNumber,
				isVerified: false,
			})
			.returning();

		const otpResult: OTPResult = await OtpService.sendOTP(
			newUser.id,
			newUser.phoneNumber,
			newUser.email,
			"verification",
		);

		// Adjust message based on delivery method
		const message =
			otpResult.deliveryMethod === "email"
				? "Registration successful. Please verify your email with the OTP sent."
				: "Registration successful. Please verify your phone number with the OTP sent.";

		return {
			userId: newUser.id,
			message: message,
			deliveryMethod: otpResult.deliveryMethod,
		};
	}
	static async initiateLogin(
		email: string,
		password: string,
	): Promise<{
		userId: number;
		message: string;
		requiresOTP: boolean;
		deliveryMethod: "sms" | "email";
		isBlacklisted?: boolean;
	}> {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((row) => row[0]);

		if (!user) {
			throw new Error("Invalid credentials");
		}

		if (user.lockUntil && new Date() < user.lockUntil) {
			const remainingMinutes = Math.ceil(
				(user.lockUntil.getTime() - Date.now()) / 60000,
			);
			throw new Error(
				`Account locked. Try again in ${remainingMinutes} minutes.`,
			);
		}

		const isValidPassword = await AuthService.comparePassword(
			password,
			user.password,
		);
		if (!isValidPassword) {
			const newAttempts = (user.failedLoginAttempts || 0) + 1;
			const updates: any = { failedLoginAttempts: newAttempts };

			if (newAttempts >= AuthService.MAX_LOGIN_ATTEMPTS) {
				updates.lockUntil = new Date(
					Date.now() + AuthService.LOCK_TIME_MINUTES * 60 * 1000,
				);
				updates.failedLoginAttempts = 0;
			}

			await db.update(users).set(updates).where(eq(users.id, user.id));

			if (updates.lockUntil) {
				throw new Error(
					`Too many failed attempts. Account locked for ${AuthService.LOCK_TIME_MINUTES} minutes.`,
				);
			}

			throw new Error("Invalid credentials");
		}

		await db
			.update(users)
			.set({ failedLoginAttempts: 0, lockUntil: null })
			.where(eq(users.id, user.id));

		if (!user.isVerified) {
			const otpResult: OTPResult = await OtpService.sendOTP(
				user.id,
				user.phoneNumber,
				user.email,
				"verification",
			);

			const deliveryLocation =
				otpResult.deliveryMethod === "email" ? "email" : "phone";

			throw new Error(
				`Account not verified. New verification OTP sent to your ${deliveryLocation}.`,
			);
		}

		const otpResult: OTPResult = await OtpService.sendOTP(
			user.id,
			user.phoneNumber,
			user.email,
			"login",
		);

		const deliveryLocation =
			otpResult.deliveryMethod === "email" ? "email address" : "phone number";

		return {
			userId: user.id,
			message: `OTP sent to your registered ${deliveryLocation}.`,
			requiresOTP: true,
			deliveryMethod: otpResult.deliveryMethod,
			isBlacklisted: otpResult.isBlacklisted,
		};
	}

	static async completeLogin(
		userId: number,
		code: string,
	): Promise<Tokens & { userId: number }> {
		await OtpService.verifyOTP(userId, code, "login");
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((row) => row[0]);

		if (!user || !user.isActive) {
			throw new Error("User not found or inactive");
		}

		const tokens = TokenService.generateTokens(userId);

		const decoded = jwt.decode(tokens.refreshToken) as { exp: number };
		await db.insert(refreshTokens).values({
			userId,
			token: tokens.refreshToken,
			expiresAt: new Date(decoded.exp * 1000),
		});
		return {
			userId,
			...tokens,
		};
	}
	static async logout(refreshToken: string) {
		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.token, refreshToken));
	}

	static async logoutAll(userId: number) {
		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.userId, userId));
	}

	static async requestPasswordReset(email: string) {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((row) => row[0]);
		if (!user) {
			return { message: "If an account exists, a reset code has been sent." };
		}

		const code = TokenService.generateOTP();
		const expiresAt = new Date(
			Date.now() + AuthService.OTP_EXPIRY_MINUTES * 60 * 1000,
		);

		await db
			.update(otpCodes)
			.set({ used: true })
			.where(
				and(
					eq(otpCodes.userId, user.id),
					eq(otpCodes.purpose, "password_reset"),
				),
			);

		await db.insert(otpCodes).values({
			userId: user.id,
			code: await bcrypt.hash(code, AuthService.SALT_ROUNDS),
			purpose: "password_reset",
			expiresAt,
		});

		await EmailService.sendPasswordResetEmail(email, code);

		return {
			message:
				"If an account exists, a reset code has been sent to your email.",
		};
	}

	static async resetPassword(email: string, code: string, newPassword: string) {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((row) => row[0]);

		if (!user) {
			throw new Error("Invalid request");
		}

		await OtpService.verifyOTP(user.id, code, "password_reset");

		const hashedPassword = await AuthService.hashPassword(newPassword);

		await db
			.update(users)
			.set({ password: hashedPassword, updatedAt: new Date() })
			.where(eq(users.id, user.id));

		await AuthService.logoutAll(user.id);

		return {
			message:
				"Password reset successful. Please login with your new password.",
		};
	}

	static async validateCredentials(
		email: string,
		password: string,
	): Promise<{ id: number; email: string; phoneNumber: string } | null> {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user || !user.isActive) {
			return null;
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			phoneNumber: user.phoneNumber,
		};
	}
	static async findByEmail(
		email: string,
	): Promise<{ id: number; email: string; phoneNumber: string } | null> {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((rows) => rows[0]);

		if (!user) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			phoneNumber: user.phoneNumber,
		};
	}

	static async updatePassword(
		userId: number,
		newPassword: string,
	): Promise<void> {
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		await db
			.update(users)
			.set({
				password: hashedPassword,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));
	}
}
