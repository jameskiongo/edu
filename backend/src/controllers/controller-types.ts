import type { Request } from "express";
import type { Result, ValidationError } from "express-validator";

export interface ApiResponse<T = unknown> {
	success?: boolean;
	message?: string;
	error?: string;
	errors?: Result<ValidationError>;
	data?: T;
}

export type AuthRequest<P = {}, B = {}, Q = {}> = Request<P, {}, B, Q>;

export interface RegisterBody {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phoneNumber: string;
	role: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface LoginBody {
	email: string;
	password: string;
}

export interface VerifyOtpBody {
	userId: string;
	code: string;
}

export interface RefreshTokenBody {
	refreshToken: string;
}

export interface LogoutBody {
	refreshToken: string;
}

export interface RequestPasswordResetBody {
	email: string;
}

export interface ResetPasswordBody {
	email: string;
	code: string;
	newPassword: string;
}

export interface ResendOtpBody {
	userId: string;
}

export interface ChangePasswordBody {
	email: string;
	currentPassword: string;
	newPassword: string;
}

export interface VerifyChangePasswordBody {
	email: string;
	code: string;
	newPassword: string;
}

// Response data types
export interface RegisterResponseData {
	userId: number;
	deliveryMethod: "sms" | "email";
}

export interface LoginResponseData {
	userId: number;
	message: string;
	requiresOTP: boolean;
	deliveryMethod: "sms" | "email";
	isBlacklisted?: boolean;
}

export interface TokensResponse {
	accessToken: string;
	refreshToken: string;
}

export interface PasswordChangeResponseData {
	email: string;
	deliveryMethod: "email";
}

export interface UpdateProfileBody {
	firstName: string;
	lastName: string;
	image?: string;
	defaultSmsDelivery?: boolean;
}

export interface AssignRoleBody {
	userId: number;
	role: "ADMIN" | "TEACHER" | "STUDENT";
}

export interface UpdateTeacherProfileBody {
	bio?: string;
	specialization?: string;
	yearsOfExperience?: number;
}

export interface UpdateStudentProfileBody {}

export interface UserProfile {
	firstName: string;
	lastName: string;
	email: string;
	image: string | null;
}
