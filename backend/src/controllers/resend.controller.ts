import type { Request, Response } from "express";
import { type OtpService, otpService } from "../services/otp.service";
import { BaseController } from "./base.controller";
import type { ResendOtpBody } from "./controller-types";

export class ResendOtpController extends BaseController {
	constructor(private otpService: OtpService) {
		super();
	}

	resendLoginOTP = async (
		req: Request<unknown, unknown, ResendOtpBody>,
		res: Response,
	) => {
		const { userId } = req.body;
		await this.otpService.resendOTP(parseInt(userId, 10), "login");

		return this.sendResponse(res, null, "Login OTP resent successfully");
	};

	resendVerificationOTP = async (
		req: Request<unknown, unknown, ResendOtpBody>,
		res: Response,
	) => {
		const { userId } = req.body;
		await this.otpService.resendOTP(parseInt(userId, 10), "verification");

		return this.sendResponse(res, null, "Verification OTP resent successfully");
	};
}

export const resendOtpController = new ResendOtpController(otpService);
