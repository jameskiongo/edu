import type { Request, Response } from "express";
import { type AuthService, authService } from "../services/auth.service";
import { type TokenService, tokenService } from "../services/token.service";
import { UnauthorizedError } from "../utils/errors";
import { BaseController } from "./base.controller";
import type {
	LoginBody,
	LogoutBody,
	RefreshTokenBody,
	RegisterBody,
	TokensResponse,
} from "./controller-types";

export class AuthController extends BaseController {
	constructor(
		private authService: AuthService,
		private tokenService: TokenService,
	) {
		super();
	}

	register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
		this.validate(req);
		const { firstName, lastName, email, password, phoneNumber } = req.body;

		const result = await this.authService.register(
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
		);

		return this.sendResponse(
			res,
			{
				userId: result.userId,
				deliveryMethod: result.deliveryMethod,
			},
			result.message,
			201,
		);
	};

	login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
		this.validate(req);
		const { email, password } = req.body;
		const result = await this.authService.initiateLogin(email, password);

		return this.sendResponse(
			res,
			{
				userId: result.userId,
				message: result.message,
				requiresOTP: result.requiresOTP,
				deliveryMethod: result.deliveryMethod,
				isBlacklisted: result.isBlacklisted,
			},
			result.message,
		);
	};

	refreshToken = async (
		req: Request<unknown, unknown, RefreshTokenBody>,
		res: Response,
	) => {
		const { refreshToken } = req.body;
		const tokens: TokensResponse =
			await this.tokenService.refreshTokens(refreshToken);

		return this.sendResponse(res, tokens);
	};

	logout = async (
		req: Request<unknown, unknown, LogoutBody>,
		res: Response,
	) => {
		const { refreshToken } = req.body;
		await this.authService.logout(refreshToken);

		return this.sendResponse(res, null, "Logged out successfully");
	};

	logoutAll = async (req: Request, res: Response) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		await this.authService.logoutAll(userId);

		return this.sendResponse(res, null, "Logged out from all devices");
	};
}

export const authController = new AuthController(authService, tokenService);
