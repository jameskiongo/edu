import type { Request, Response } from "express";
import {
	type Result,
	type ValidationError,
	validationResult,
} from "express-validator";
import { AuthService } from "../services/auth.service";
import { OtpService } from "../services/otp.service";
import type {
	ApiResponse,
	TokensResponse,
	VerifyOtpBody,
} from "./controller-types";

export class OtpController {
	static async verifyLoginOTP(
		req: Request<unknown, unknown, VerifyOtpBody>,
		res: Response<ApiResponse<TokensResponse> & { message: string }>,
	): Promise<Response> {
		try {
			const { userId, code } = req.body;
			const tokens: TokensResponse = await AuthService.completeLogin(
				parseInt(userId, 10),
				code,
			);

			return res.json({
				success: true,
				message: "Login successful",
				data: tokens,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Verification failed";
			return res.status(401).json({ message });
		}
	}

	static async verifyRegistrationOTP(
		req: Request<unknown, unknown, VerifyOtpBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { userId, code } = req.body;
			await OtpService.verifyOTP(parseInt(userId, 10), code, "verification");

			return res.json({
				success: true,
				message: "Account verified successfully. You can now login.",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Verification failed";
			return res.status(400).json({ error: message });
		}
	}

	static async resendPasswordChangeOTP(
		req: Request<{}, {}, { email: string }>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const errors: Result<ValidationError> = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors });
			}

			const { email } = req.body;

			const user = await AuthService.findByEmail(email);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			await OtpService.sendOTP(
				user.id,
				user.phoneNumber,
				email,
				"password_change",
			);

			return res.json({
				success: true,
				message: "Verification code sent to your email",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to resend OTP";
			return res.status(400).json({ error: message });
		}
	}
}
