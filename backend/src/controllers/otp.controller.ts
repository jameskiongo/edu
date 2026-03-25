import type { Request, Response } from "express";
import { type AuthService, authService } from "../services/auth.service";
import { type OtpService, otpService } from "../services/otp.service";
import { NotFoundError } from "../utils/errors";
import { BaseController } from "./base.controller";
import type { TokensResponse, VerifyOtpBody } from "./controller-types";

export class OtpController extends BaseController {
	constructor(
		private authService: AuthService,
		private otpService: OtpService,
	) {
		super();
	}

	verifyLoginOTP = async (
		req: Request<unknown, unknown, VerifyOtpBody>,
		res: Response,
	) => {
		const { userId, code } = req.body;
		const tokens: TokensResponse = await this.authService.completeLogin(
			parseInt(userId, 10),
			code,
		);

		return this.sendResponse(res, tokens, "Login successful");
	};

	verifyRegistrationOTP = async (
		req: Request<unknown, unknown, VerifyOtpBody>,
		res: Response,
	) => {
		const { userId, code } = req.body;
		await this.otpService.verifyOTP(parseInt(userId, 10), code, "verification");

		return this.sendResponse(
			res,
			null,
			"Account verified successfully. You can now login.",
		);
	};

	resendPasswordChangeOTP = async (
		req: Request<{}, {}, { email: string }>,
		res: Response,
	) => {
		this.validate(req);
		const { email } = req.body;

		const user = await this.authService.findByEmail(email);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		await this.otpService.sendOTP(
			user.id,
			user.phoneNumber,
			email,
			"password_change",
		);

		return this.sendResponse(res, null, "Verification code sent to your email");
	};
}

export const otpController = new OtpController(authService, otpService);
