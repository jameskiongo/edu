import { z } from "zod";

const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
		"Password must contain uppercase, lowercase, number and special character",
	);

const firstNameSchema = z
	.string("First name Cannot be empty")
	.min(2, "Name must be at least 2 characters")
	.max(100, "Name must be less than 100 characters");
const lastNameSchema = z
	.string("Last name cannot be empty")
	.min(2, "Name must be at least 2 characters")
	.max(100, "Name must be less than 100 characters");

const phoneSchema = z
	.string("Phone number cannot be empty")
	.regex(
		/^\+?[1-9]\d{1,14}$/,
		"Valid phone number with country code is required (e.g., +1234567890)",
	);

const emailSchema = z
	.email("Valid email is required")
	.transform((val) => val.toLowerCase().trim());

const otpCodeSchema = z
	.string("OTP cannot be empty")
	.length(6, "Code must be exactly 6 digits")
	.regex(/^\d+$/, "Code must contain only numbers");

export const requestPasswordChangeSchema = z.object({
	email: emailSchema,
	currentPassword: z.string().min(1, "Current password is required"),
	newPassword: passwordSchema,
});

export const verifyPasswordChangeSchema = z.object({
	email: emailSchema,
	code: otpCodeSchema,
	newPassword: passwordSchema,
});

export const registerSchema = z.object({
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	email: emailSchema,
	password: passwordSchema,
	phoneNumber: phoneSchema,
});

export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z
	.object({
		firstName: z.string().optional(),
		lastName: z.string().optional(),
		image: z
			.url("Image must be a valid URL")
			.max(500, "Image URL too long")
			.optional()
			.or(z.literal("")),
	})
	.refine(
		(data) =>
			data.firstName !== undefined ||
			data.lastName !== undefined ||
			data.image !== undefined,
		{
			message: "At least one field (name or image) must be provided",
		},
	);

export const otpSchema = z.object({
	userId: z.coerce.number().int().positive("Valid user ID is required"),
	code: otpCodeSchema,
});

export const passwordResetRequestSchema = z.object({
	email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
	email: emailSchema,
	code: otpCodeSchema,
	newPassword: passwordSchema,
});

export const resendOtpSchema = z.object({
	userId: z.coerce.number().int().positive("Valid user ID is required"),
	purpose: z.enum(
		["login", "verification", "password_reset", "password_change"],
		{
			message:
				"Purpose must be login, verification, password_reset, or password_change",
		},
	),
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RequestPasswordChangeInput = z.infer<
	typeof requestPasswordChangeSchema
>;
export type VerifyPasswordChangeInput = z.infer<
	typeof verifyPasswordChangeSchema
>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type PasswordResetRequestInput = z.infer<
	typeof passwordResetRequestSchema
>;
export type PasswordResetConfirmInput = z.infer<
	typeof passwordResetConfirmSchema
>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
