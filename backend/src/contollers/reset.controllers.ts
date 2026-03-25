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
	ChangePasswordBody,
	RequestPasswordResetBody,
	ResetPasswordBody,
	VerifyChangePasswordBody,
} from "./controller-types";

export class ResetPasswordController {
	static async requestPasswordReset(
		req: Request<unknown, unknown, RequestPasswordResetBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { email } = req.body;
			const result: { message: string } =
				await AuthService.requestPasswordReset(email);

			return res.json({
				success: true,
				message: result.message,
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Request failed";
			return res.status(400).json({ error: message });
		}
	}

	static async resetPassword(
		req: Request<unknown, unknown, ResetPasswordBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { email, code, newPassword } = req.body;
			const result: { message: string } = await AuthService.resetPassword(
				email,
				code,
				newPassword,
			);

			return res.json({
				success: true,
				message: result.message,
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Reset failed";
			return res.status(400).json({ error: message });
		}
	}

	static async requestPasswordChange(
		req: Request<{}, {}, ChangePasswordBody>,
		res: Response<ApiResponse<{ email: string; deliveryMethod: "email" }>>,
	): Promise<Response> {
		try {
			const errors: Result<ValidationError> = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors });
			}

			const { email, currentPassword } = req.body;

			const user = await AuthService.validateCredentials(
				email,
				currentPassword,
			);
			if (!user) {
				return res.status(401).json({ error: "Current password is incorrect" });
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
				data: {
					email,
					deliveryMethod: "email",
				},
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to request password change";
			return res.status(400).json({ error: message });
		}
	}

	static async verifyPasswordChange(
		req: Request<{}, {}, VerifyChangePasswordBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const errors: Result<ValidationError> = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors });
			}

			const { email, code, newPassword } = req.body;

			const user = await AuthService.findByEmail(email);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			await OtpService.verifyOTP(user.id, code, "password_change");

			await AuthService.updatePassword(user.id, newPassword);

			await AuthService.logoutAll(user.id);

			return res.json({
				success: true,
				message:
					"Password changed successfully. Please login with your new password.",
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to change password";
			return res.status(400).json({ error: message });
		}
	}
}
