import type { Request, Response } from "express";
import { type UserService, userService } from "../services/user.service";
import { UnauthorizedError } from "../utils/errors";
import { BaseController } from "./base.controller";
import type {
	AssignRoleBody,
	UpdateProfileBody,
	UpdateStudentProfileBody,
	UpdateTeacherProfileBody,
} from "./controller-types";

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

	assignRole = async (
		req: Request<unknown, unknown, AssignRoleBody>,
		res: Response,
	) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const { role } = req.body;

		const updatedProfile = await this.userService.assignRole(userId, role);

		return this.sendResponse(res, updatedProfile, `Role assigned as ${role}`);
	};

	updateTeacherProfile = async (
		req: Request<unknown, unknown, UpdateTeacherProfileBody>,
		res: Response,
	) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const updatedProfile = await this.userService.updateTeacherProfile(
			userId,
			req.body,
		);

		return this.sendResponse(
			res,
			updatedProfile,
			"Teacher profile updated successfully",
		);
	};

	updateStudentProfile = async (
		req: Request<unknown, unknown, UpdateStudentProfileBody>,
		res: Response,
	) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const updatedProfile = await this.userService.updateStudentProfile(
			userId,
			req.body,
		);

		return this.sendResponse(
			res,
			updatedProfile,
			"Student profile updated successfully",
		);
	};
}

export const userController = new UserController(userService);
