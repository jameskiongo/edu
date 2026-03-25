import bcrypt from "bcrypt";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/db.js";
import { otpCodes, users } from "../db/schema.js";
import { EmailService } from "./email.service.js";
import { type SMSResult, SMSService } from "./sms.service.js";
import { TokenService } from "./token.service.js";

export interface OTPResult {
	success: boolean;
	message: string;
	deliveryMethod: "sms" | "email";
	isBlacklisted?: boolean;
}

export class OtpService {
	private static readonly SALT_ROUNDS = 12;
	private static readonly OTP_EXPIRY_MINUTES = 10;

	static async sendOTP(
		userId: number,
		phoneNumber: string,
		email: string,
		purpose: "login" | "verification" | "password_reset" | "password_change",
	): Promise<OTPResult> {
		const code = TokenService.generateOTP();
		const expiresAt = new Date(
			Date.now() + OtpService.OTP_EXPIRY_MINUTES * 60 * 1000,
		);

		await db
			.update(otpCodes)
			.set({ used: true })
			.where(and(eq(otpCodes.userId, userId), eq(otpCodes.purpose, purpose)));

		const [otpRecord] = await db
			.insert(otpCodes)
			.values({
				userId,
				code: await bcrypt.hash(code, OtpService.SALT_ROUNDS),
				purpose,
				expiresAt,
			})
			.returning({ id: otpCodes.id });
		if (purpose === "password_change" || purpose === "password_reset") {
			const emailSent: boolean = await EmailService.sendEmailOtp(email, code);

			if (emailSent) {
				return {
					success: true,
					message: "OTP sent to your email",
					deliveryMethod: "email",
				};
			}

			await db
				.update(otpCodes)
				.set({ used: true })
				.where(eq(otpCodes.id, otpRecord.id));

			throw new Error("Failed to send OTP via email");
		}

		const smsResult: SMSResult = await SMSService.sendOTPFetch(
			phoneNumber,
			code,
		);

		if (smsResult.success) {
			return {
				success: true,
				message: "OTP sent to your phone",
				deliveryMethod: "sms",
			};
		}

		console.log(
			`SMS failed for user ${userId}: ${smsResult.message}. Falling back to email.`,
		);

		const emailSent: boolean = await EmailService.sendEmailOtp(email, code);

		if (emailSent) {
			return {
				success: true,
				message: smsResult.isBlacklisted
					? "SMS delivery failed. OTP sent to your email instead."
					: "OTP sent to your email",
				deliveryMethod: "email",
				isBlacklisted: smsResult.isBlacklisted,
			};
		}

		await db
			.update(otpCodes)
			.set({ used: true })
			.where(eq(otpCodes.id, otpRecord.id));

		throw new Error("Failed to send OTP via both SMS and email");
	}

	static async verifyOTP(
		userId: number,
		code: string,
		purpose:
			| "login"
			| "verification"
			| "password_change"
			| "password_reset" = "login",
	) {
		const otpRecord = await db
			.select()
			.from(otpCodes)
			.where(
				and(
					eq(otpCodes.userId, userId),
					eq(otpCodes.purpose, purpose),
					eq(otpCodes.used, false),
					gt(otpCodes.expiresAt, new Date()),
				),
			)
			.limit(1)
			.then((rows) => rows[0]);

		if (!otpRecord) {
			throw new Error("Invalid or expired OTP");
		}

		if ((otpRecord.attempts ?? 0) >= 3) {
			await db
				.update(otpCodes)
				.set({ used: true })
				.where(eq(otpCodes.id, otpRecord.id));
			throw new Error("Too many attempts. Please request a new OTP.");
		}

		await db
			.update(otpCodes)
			.set({ attempts: (otpRecord.attempts ?? 0) + 1 })
			.where(eq(otpCodes.id, otpRecord.id));

		const isValid = await bcrypt.compare(code, otpRecord.code);
		if (!isValid) {
			throw new Error("Invalid OTP");
		}

		await db
			.update(otpCodes)
			.set({ used: true })
			.where(eq(otpCodes.id, otpRecord.id));

		if (purpose === "verification") {
			await db
				.update(users)
				.set({ isVerified: true })
				.where(eq(users.id, userId));
		}

		return { verified: true };
	}

	static async resendOTP(
		userId: number,
		purpose: "login" | "verification" | "password_change",
	): Promise<OTPResult> {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.limit(1)
			.then((row) => row[0]);

		if (!user) {
			throw new Error("User not found");
		}

		if (!user.isActive) {
			throw new Error("Account is deactivated");
		}

		if (purpose === "login" && !user.isVerified) {
			throw new Error(
				"Account not verified. Please complete registration first",
			);
		}

		if (purpose === "verification" && user.isVerified) {
			throw new Error("Account is already verified");
		}

		const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
		const recentOTP = await db
			.select()
			.from(otpCodes)
			.where(
				and(
					eq(otpCodes.userId, userId),
					eq(otpCodes.purpose, purpose),
					eq(otpCodes.used, false),
					gt(otpCodes.createdAt, oneMinuteAgo),
				),
			)
			.limit(1)
			.then((row) => row[0]);

		if (recentOTP) {
			const secondsLeft = Math.ceil(
				(recentOTP.createdAt.getTime() + 60000 - Date.now()) / 1000,
			);
			throw new Error(`Please wait ${secondsLeft} seconds`);
		}

		return OtpService.sendOTP(userId, user.phoneNumber, user.email, purpose);
	}
}
