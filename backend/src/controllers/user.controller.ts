import type { Request, Response } from "express";
import { type UserService, userService } from "../services/user.service";
import { UnauthorizedError } from "../utils/errors";
import { BaseController } from "./base.controller";
import type { UpdateProfileBody } from "./controller-types";

export class UserController extends BaseController {
	constructor(private userService: UserService) {
		super();
	}

	getProfile = async (req: Request, res: Response) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const profile = await this.userService.getProfile(userId);

		return this.sendResponse(res, profile);
	};

	updateProfile = async (
		req: Request<unknown, unknown, UpdateProfileBody>,
		res: Response,
	) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const { firstName, lastName, image } = req.body;

		const updatedProfile = await this.userService.updateProfile(userId, {
			firstName,
			lastName,
			image,
		});

		return this.sendResponse(
			res,
			updatedProfile,
			"Profile updated successfully",
		);
	};
}

export const userController = new UserController(userService);
