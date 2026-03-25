import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../contollers/auth.controllers";
import { OtpController } from "../contollers/otp.controllers";
import { ResendOtpController } from "../contollers/resend.controllers";
import { ResetPasswordController } from "../contollers/reset.controllers";
import { authenticate, validate } from "../middlewares/auth.middleware";
import {
	loginSchema,
	logoutSchema,
	otpSchema,
	passwordResetConfirmSchema,
	passwordResetRequestSchema,
	refreshTokenSchema,
	registerSchema,
	requestPasswordChangeSchema,
	resendOtpSchema,
	verifyPasswordChangeSchema,
} from "../validators/validations";

const router = Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many attempts, please try again later",
});

const otpLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 3,
	message: "Too many OTP requests, please try again later",
});

router.post(
	"/register",
	authLimiter,
	validate(registerSchema),
	AuthController.register,
);

router.post("/login", authLimiter, validate(loginSchema), AuthController.login);

router.post(
	"/verify-login",
	otpLimiter,
	validate(otpSchema),
	OtpController.verifyLoginOTP,
);

router.post(
	"/verify-registration",
	otpLimiter,
	validate(otpSchema),
	OtpController.verifyRegistrationOTP,
);

router.post(
	"/refresh-token",
	validate(refreshTokenSchema),
	AuthController.refreshToken,
);

router.post(
	"/forgot-password",
	authLimiter,
	validate(passwordResetRequestSchema),
	ResetPasswordController.requestPasswordReset,
);

router.post(
	"/reset-password",
	authLimiter,
	validate(passwordResetConfirmSchema),
	ResetPasswordController.resetPassword,
);

router.post("/logout", validate(logoutSchema), AuthController.logout);

router.post("/logout-all", authenticate, AuthController.logoutAll);

router.post(
	"/resend-login-otp",
	otpLimiter,
	validate(resendOtpSchema),
	ResendOtpController.resendLoginOTP,
);

router.post(
	"/resend-verification-otp",
	otpLimiter,
	validate(resendOtpSchema),
	ResendOtpController.resendVerificationOTP,
);
router.post(
	"/resend-password-change-otp",
	otpLimiter,
	validate(resendOtpSchema),
	OtpController.resendPasswordChangeOTP,
);

router.post(
	"/request-password-change",
	authLimiter,
	validate(requestPasswordChangeSchema),
	ResetPasswordController.requestPasswordChange,
);

router.post(
	"/verify-password-change",
	otpLimiter,
	validate(verifyPasswordChangeSchema),
	ResetPasswordController.verifyPasswordChange,
);

export default router;
