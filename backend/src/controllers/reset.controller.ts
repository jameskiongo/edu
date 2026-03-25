import type { Request, Response } from "express";
import { type AuthService, authService } from "../services/auth.service";
import { type OtpService, otpService } from "../services/otp.service";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import { BaseController } from "./base.controller";
import type {
	ChangePasswordBody,
	RequestPasswordResetBody,
	ResetPasswordBody,
	VerifyChangePasswordBody,
} from "./controller-types";

export class ResetPasswordController extends BaseController {
	constructor(
		private authService: AuthService,
		private otpService: OtpService,
	) {
		super();
	}

	requestPasswordReset = async (
		req: Request<unknown, unknown, RequestPasswordResetBody>,
		res: Response,
	) => {
		const { email } = req.body;
		const result: { message: string } =
			await this.authService.requestPasswordReset(email);

		return this.sendResponse(res, null, result.message);
	};

	resetPassword = async (
		req: Request<unknown, unknown, ResetPasswordBody>,
		res: Response,
	) => {
		const { email, code, newPassword } = req.body;
		const result: { message: string } = await this.authService.resetPassword(
			email,
			code,
			newPassword,
		);

		return this.sendResponse(res, null, result.message);
	};

	requestPasswordChange = async (
		req: Request<{}, {}, ChangePasswordBody>,
		res: Response,
	) => {
		this.validate(req);
		const { email, currentPassword } = req.body;

		const user = await this.authService.validateCredentials(
			email,
			currentPassword,
		);
		if (!user) {
			throw new UnauthorizedError("Current password is incorrect");
		}

		await this.otpService.sendOTP(
			user.id,
			user.phoneNumber,
			email,
			"password_change",
		);

		return this.sendResponse(
			res,
			{
				email,
				deliveryMethod: "email",
			},
			"Verification code sent to your email",
		);
	};

	verifyPasswordChange = async (
		req: Request<{}, {}, VerifyChangePasswordBody>,
		res: Response,
	) => {
		this.validate(req);
		const { email, code, newPassword } = req.body;

		const user = await this.authService.findByEmail(email);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		await this.otpService.verifyOTP(user.id, code, "password_change");
		await this.authService.updatePassword(user.id, newPassword);
		await this.authService.logoutAll(user.id);

		return this.sendResponse(
			res,
			null,
			"Password changed successfully. Please login with your new password.",
		);
	};
}

export const resetPasswordController = new ResetPasswordController(
	authService,
	otpService,
);
