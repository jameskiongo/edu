import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string("Field cannot be empty")
    .min(8, "Password must be at least 6 characters"),
});

const passwordSchema = z
  .string("Field cannot be empty")
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number and special character",
  );

export const registerSchema = z
  .object({
    firstName: z
      .string("Field cannot be empty")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    lastName: z
      .string("Field cannot be empty")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number and special character",
      ),
    phoneNumber: z
      .string("Field cannot be empty")
      .regex(
        /^\+?[1-9]\d{1,14}$/,
        "Please enter a valid phone number with country code (e.g., +254712345678)",
      ),
    role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z
    .string("Field cannot be empty")
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    code: z
      .string("Field cannot be empty")
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
    newPassword: passwordSchema,
    confirmPassword: z.string("Password cannot be empty"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  phoneNumber: z
    .string()
    .min(1, "Phone number cannot be empty")
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Valid phone number with country code is required (e.g., +1234567890)",
    )
    .optional(),
  image: z
    .string()
    .max(500, "URL is too long")
    .optional()
    .or(z.literal("")),
  defaultSmsDelivery: z.boolean().optional(),
  bio: z.string().max(1000, "Bio is too long").optional(),
  specialization: z.string().max(255, "Specialization is too long").optional(),
  yearsOfExperience: z.number().min(0).max(100).optional(),
  totalReviews: z.number().min(0).optional(),
  website: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").max(255).optional().or(z.literal("")),
});
export const requestPasswordChangeSchema = z
  .object({
    email: z.email("Valid email is required"),
    currentPassword: z
      .string("Field cannot be empty")
      .min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const passwordResetConfirmSchema = z
  .object({
    email: z.email("Valid email is required"),
    code: z.string().length(6, "Code must be 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: z.string("Password cannot be empty"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const verifyPasswordChangeSchema = z
  .object({
    email: z.email("Valid email is required"),
    code: z
      .string("Field cannot be empty")
      .length(6, "Code must be exactly 6 digits")
      .regex(/^\d+$/, "Code must contain only numbers"),
    newPassword: passwordSchema,
    confirmPassword: z.string("Password cannot be empty"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    email: z.email("Valid email is required"),
    currentPassword: z
      .string("Field cannot be empty")
      .min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    code: z.string().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
