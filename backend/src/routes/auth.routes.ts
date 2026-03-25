import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "../controllers/auth.controller";
import { catchAsync } from "../controllers/base.controller";
import { otpController } from "../controllers/otp.controller";
import { resendOtpController } from "../controllers/resend.controller";
import { resetPasswordController } from "../controllers/reset.controller";
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
	catchAsync(authController.register),
);

router.post(
	"/login",
	authLimiter,
	validate(loginSchema),
	catchAsync(authController.login),
);

router.post(
	"/verify-login",
	otpLimiter,
	validate(otpSchema),
	catchAsync(otpController.verifyLoginOTP),
);

router.post(
	"/verify-registration",
	otpLimiter,
	validate(otpSchema),
	catchAsync(otpController.verifyRegistrationOTP),
);

router.post(
	"/refresh-token",
	validate(refreshTokenSchema),
	catchAsync(authController.refreshToken),
);

router.post(
	"/forgot-password",
	authLimiter,
	validate(passwordResetRequestSchema),
	catchAsync(resetPasswordController.requestPasswordReset),
);

router.post(
	"/reset-password",
	authLimiter,
	validate(passwordResetConfirmSchema),
	catchAsync(resetPasswordController.resetPassword),
);

router.post(
	"/logout",
	validate(logoutSchema),
	catchAsync(authController.logout),
);

router.post("/logout-all", authenticate, catchAsync(authController.logoutAll));

router.post(
	"/resend-login-otp",
	otpLimiter,
	validate(resendOtpSchema),
	catchAsync(resendOtpController.resendLoginOTP),
);

router.post(
	"/resend-verification-otp",
	otpLimiter,
	validate(resendOtpSchema),
	catchAsync(resendOtpController.resendVerificationOTP),
);
router.post(
	"/resend-password-change-otp",
	otpLimiter,
	validate(resendOtpSchema),
	catchAsync(otpController.resendPasswordChangeOTP),
);

router.post(
	"/request-password-change",
	authLimiter,
	validate(requestPasswordChangeSchema),
	catchAsync(resetPasswordController.requestPasswordChange),
);

router.post(
	"/verify-password-change",
	otpLimiter,
	validate(verifyPasswordChangeSchema),
	catchAsync(resetPasswordController.verifyPasswordChange),
);

export default router;
