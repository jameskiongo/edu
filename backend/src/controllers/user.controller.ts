import type { Request, Response } from "express";
import { type UserService, userService } from "../services/user.service";
import { BadRequestError, UnauthorizedError } from "../utils/errors";
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

	getAllTeachers = async (_: Request, res: Response) => {
		const teachers = await this.userService.getAllTeachers();
		return this.sendResponse(res, teachers);
	};

	getAllStudents = async (_: Request, res: Response) => {
		const students = await this.userService.getAllStudents();
		return this.sendResponse(res, students);
	};

	updateProfile = async (
		req: Request<unknown, unknown, UpdateProfileBody>,
		res: Response,
	) => {
		const userId: number | undefined = req.userId;

		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const { firstName, lastName, image, defaultSmsDelivery } = req.body;

		const updatedProfile = await this.userService.updateProfile(userId, {
			firstName,
			lastName,
			image,
			defaultSmsDelivery,
		});

		return this.sendResponse(
			res,
			updatedProfile,
			"Profile updated successfully",
		);
	};

	uploadImage = async (req: Request, res: Response) => {
		if (!req.file) {
			throw new BadRequestError("No file uploaded");
		}

		const userId = req.userId;
		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}

		const imageUrl = `${process.env.BACKEND_URL || "http://localhost:3003"}/uploads/${req.file.filename}`;

		// Update user profile with new image
		const updatedProfile = await this.userService.updateProfile(userId, {
			image: imageUrl,
		});

		return this.sendResponse(
			res,
			updatedProfile,
			"Profile image uploaded and updated successfully",
		);
	};

	assignRole = async (
		req: Request<unknown, unknown, AssignRoleBody>,
		res: Response,
	) => {
		const { userId, role } = req.body;

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

	requestPhoneChange = async (req: Request, res: Response) => {
		const userId = req.userId;
		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}
		const { phoneNumber } = req.body;

		const result = await this.userService.requestPhoneChange(
			userId,
			phoneNumber,
		);
		return this.sendResponse(res, result, "Verification code sent");
	};

	verifyPhoneChange = async (req: Request, res: Response) => {
		const userId = req.userId;
		if (!userId) {
			throw new UnauthorizedError("Not authenticated");
		}
		const { phoneNumber, code } = req.body;

		const updatedProfile = await this.userService.verifyPhoneChange(
			userId,
			phoneNumber,
			code,
		);
		return this.sendResponse(
			res,
			updatedProfile,
			"Phone number updated successfully",
		);
	};
}

export const userController = new UserController(userService);
