import type { Request, Response } from "express";
import {
	type Result,
	type ValidationError,
	validationResult,
} from "express-validator";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import type {
	ApiResponse,
	LoginBody,
	LogoutBody,
	RefreshTokenBody,
	RegisterBody,
	TokensResponse,
} from "./controller-types";

declare global {
	namespace Express {
		interface Request {
			userId?: number;
		}
	}
}

export class AuthController {
	static async register(
		req: Request<{}, {}, RegisterBody>,
		res: Response<
			ApiResponse<{ userId: number; deliveryMethod: "sms" | "email" }>
		>,
	): Promise<Response> {
		try {
			const errors: Result<ValidationError> = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors });
			}

			const { name, email, password, phoneNumber } = req.body;

			const result = await AuthService.register(
				name,
				email,
				password,
				phoneNumber,
			);

			return res.status(201).json({
				success: true,
				message: result.message,
				data: {
					userId: result.userId,
					deliveryMethod: result.deliveryMethod, // ADD THIS
				},
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Registration failed";
			return res.status(400).json({ error: message });
		}
	}
	static async login(
		req: Request<{}, {}, LoginBody>,
		res: Response<
			ApiResponse<{
				userId: number;
				message: string;
				requiresOTP: boolean;
				deliveryMethod: "sms" | "email";
				isBlacklisted?: boolean;
			}>
		>,
	): Promise<Response> {
		try {
			const errors: Result<ValidationError> = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors });
			}

			const { email, password } = req.body;
			const result = await AuthService.initiateLogin(email, password);

			return res.json({
				success: true,
				message: result.message,
				data: {
					userId: result.userId,
					message: result.message,
					requiresOTP: result.requiresOTP,
					deliveryMethod: result.deliveryMethod, // NOW EXISTS
					isBlacklisted: result.isBlacklisted,
				},
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Login failed";
			return res.status(401).json({ error: message });
		}
	}

	static async refreshToken(
		req: Request<unknown, unknown, RefreshTokenBody>,
		res: Response<ApiResponse<TokensResponse>>,
	): Promise<Response> {
		try {
			const { refreshToken } = req.body;
			const tokens: TokensResponse =
				await TokenService.refreshTokens(refreshToken);

			return res.json({
				success: true,
				data: tokens,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Token refresh failed";
			return res.status(401).json({ error: message });
		}
	}

	static async logout(
		req: Request<unknown, unknown, LogoutBody>,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const { refreshToken } = req.body;
			await AuthService.logout(refreshToken);

			return res.json({
				success: true,
				message: "Logged out successfully",
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Logout failed";
			return res.status(400).json({ error: message });
		}
	}

	static async logoutAll(
		req: Request,
		res: Response<ApiResponse>,
	): Promise<Response> {
		try {
			const userId: number | undefined = req.userId;

			if (!userId) {
				return res.status(401).json({ error: "Not authenticated" });
			}

			await AuthService.logoutAll(userId);

			return res.json({
				success: true,
				message: "Logged out from all devices",
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Logout failed";
			return res.status(400).json({ error: message });
		}
	}
}
