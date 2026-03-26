import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { and, eq, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/db";
import {
	otpCodes,
	refreshTokens,
	studentProfiles,
	teacherProfiles,
	users,
} from "../db/schema";
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../utils/errors";
import { type EmailService, emailService } from "./email.service";
import { type OTPResult, type OtpService, otpService } from "./otp.service";
import { type TokenService, type Tokens, tokenService } from "./token.service";

dotenv.config();

export class AuthService {
	private readonly SALT_ROUNDS = 12;
	private readonly MAX_LOGIN_ATTEMPTS = 5;
	private readonly LOCK_TIME_MINUTES = 30;
	private readonly OTP_EXPIRY_MINUTES = 10;

	constructor(
		private emailService: EmailService,
		private otpService: OtpService,
		private tokenService: TokenService,
	) {}

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, this.SALT_ROUNDS);
	}

	async comparePassword(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	async register(
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		phoneNumber: string,
		role: "ADMIN" | "TEACHER" | "STUDENT",
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
			throw new BadRequestError("Email or Phone number already registered");
		}

		const hashedPassword = await this.hashPassword(password);

		const newUser = await db.transaction(async (tx) => {
			const [user] = await tx
				.insert(users)
				.values({
					firstName,
					lastName,
					email,
					password: hashedPassword,
					phoneNumber,
					role,
					isVerified: false,
				})
				.returning();

			if (role === "TEACHER") {
				await tx.insert(teacherProfiles).values({ userId: user.id });
			} else if (role === "STUDENT") {
				await tx.insert(studentProfiles).values({ userId: user.id });
			}

			return user;
		});

		const otpResult: OTPResult = await this.otpService.sendOTP(
			newUser.id,
			newUser.phoneNumber,
			newUser.email,
			"verification",
		);

		const message =
			otpResult.deliveryMethod === "email"
				? "Registration successful. Please verify your email with the OTP sent."
				: "Registration successful. Please verify your phone number with the OTP sent.";

		return {
			userId: newUser.id,
			message,
			deliveryMethod: otpResult.deliveryMethod,
		};
	}

	async initiateLogin(
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
			throw new UnauthorizedError("Invalid credentials");
		}

		if (user.lockUntil && new Date() < user.lockUntil) {
			const remainingMinutes = Math.ceil(
				(user.lockUntil.getTime() - Date.now()) / 60000,
			);
			throw new BadRequestError(
				`Account locked. Try again in ${remainingMinutes} minutes.`,
			);
		}

		const isValidPassword = await this.comparePassword(password, user.password);
		if (!isValidPassword) {
			const newAttempts = (user.failedLoginAttempts || 0) + 1;
			const updates: any = { failedLoginAttempts: newAttempts };

			if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
				updates.lockUntil = new Date(
					Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000,
				);
				updates.failedLoginAttempts = 0;
			}

			await db.update(users).set(updates).where(eq(users.id, user.id));

			if (updates.lockUntil) {
				throw new BadRequestError(
					`Too many failed attempts. Account locked for ${this.LOCK_TIME_MINUTES} minutes.`,
				);
			}

			throw new UnauthorizedError("Invalid credentials");
		}

		await db
			.update(users)
			.set({ failedLoginAttempts: 0, lockUntil: null })
			.where(eq(users.id, user.id));

		if (!user.isVerified) {
			const otpResult: OTPResult = await this.otpService.sendOTP(
				user.id,
				user.phoneNumber,
				user.email,
				"verification",
			);

			const deliveryLocation =
				otpResult.deliveryMethod === "email" ? "email" : "phone";

			throw new BadRequestError(
				`Account not verified. New verification OTP sent to your ${deliveryLocation}.`,
			);
		}

		const otpResult: OTPResult = await this.otpService.sendOTP(
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

	async completeLogin(
		userId: number,
		code: string,
	): Promise<Tokens & { userId: number }> {
		await this.otpService.verifyOTP(userId, code, "login");
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((row) => row[0]);

		if (!user || !user.isActive) {
			throw new NotFoundError("User not found or inactive");
		}

		const tokens = this.tokenService.generateTokens(userId);

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

	async logout(refreshToken: string) {
		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.token, refreshToken));
	}

	async logoutAll(userId: number) {
		await db
			.update(refreshTokens)
			.set({ revoked: true })
			.where(eq(refreshTokens.userId, userId));
	}

	async requestPasswordReset(email: string) {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((row) => row[0]);
		if (!user) {
			return { message: "If an account exists, a reset code has been sent." };
		}

		const code = this.tokenService.generateOTP();
		const expiresAt = new Date(
			Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
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
			code: await bcrypt.hash(code, this.SALT_ROUNDS),
			purpose: "password_reset",
			expiresAt,
		});

		await this.emailService.sendPasswordResetEmail(email, code);

		return {
			message:
				"If an account exists, a reset code has been sent to your email.",
		};
	}

	async resetPassword(email: string, code: string, newPassword: string) {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.then((row) => row[0]);

		if (!user) {
			throw new BadRequestError("Invalid request");
		}

		await this.otpService.verifyOTP(user.id, code, "password_reset");

		const hashedPassword = await this.hashPassword(newPassword);

		await db
			.update(users)
			.set({ password: hashedPassword, updatedAt: new Date() })
			.where(eq(users.id, user.id));

		await this.logoutAll(user.id);

		return {
			message:
				"Password reset successful. Please login with your new password.",
		};
	}

	async validateCredentials(
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

		const isValidPassword = await this.comparePassword(password, user.password);
		if (!isValidPassword) {
			return null;
		}

		return {
			id: user.id,
			email: user.email,
			phoneNumber: user.phoneNumber,
		};
	}

	async findByEmail(
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

	async updatePassword(userId: number, newPassword: string): Promise<void> {
		const hashedPassword = await this.hashPassword(newPassword);

		await db
			.update(users)
			.set({
				password: hashedPassword,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId));
	}
}

export const authService = new AuthService(
	emailService,
	otpService,
	tokenService,
);
