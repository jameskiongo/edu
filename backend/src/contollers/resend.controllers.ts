import type { Request, Response } from "express";

import { OtpService } from "../services/otp.service";
import type { ApiResponse, ResendOtpBody } from "./controller-types";

export class ResendOtpController {
	static async resendLoginOTP(
		req: Request<unknown, unknown, ResendOtpBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { userId } = req.body;
			await OtpService.resendOTP(parseInt(userId, 10), "login");

			return res.json({
				success: true,
				message: "Login OTP resent successfully",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to resend OTP";
			return res.status(400).json({ error: message });
		}
	}

	static async resendVerificationOTP(
		req: Request<unknown, unknown, ResendOtpBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { userId } = req.body;
			await OtpService.resendOTP(parseInt(userId, 10), "verification");

			return res.json({
				success: true,
				message: "Verification OTP resent successfully",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to resend OTP";
			return res.status(400).json({ error: message });
		}
	}
}
