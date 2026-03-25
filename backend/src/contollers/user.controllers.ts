import type { Request, Response } from "express";
import { UserService } from "../services/user.services.js";
import type { UpdateProfileBody, UserProfile } from "./controller-types.js";

interface ApiResponse<T = unknown> {
	success?: boolean;
	message?: string;
	error?: string;
	user?: T;
}

export class UserController {
	static async getProfile(
		req: Request,
		res: Response<ApiResponse<UserProfile> | { error: string }>,
	): Promise<Response> {
		try {
			const userId: number | undefined = req.userId;

			if (!userId) {
				return res.status(401).json({ error: "Not authenticated" });
			}

			const profile: UserProfile = await UserService.getProfile(userId);

			return res.json({
				success: true,
				user: profile,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Profile not found";
			return res.status(404).json({ error: message });
		}
	}

	static async updateProfile(
		req: Request<unknown, unknown, UpdateProfileBody>,
		res: Response<ApiResponse<UserProfile> | { error: string }>,
	): Promise<Response> {
		try {
			const userId: number | undefined = req.userId;

			if (!userId) {
				return res.status(401).json({ error: "Not authenticated" });
			}

			const { name, image } = req.body;

			const updatedProfile: UserProfile = await UserService.updateProfile(
				userId,
				{
					name,
					image,
				},
			);

			return res.json({
				success: true,
				message: "Profile updated successfully",
				user: updatedProfile,
			});
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to update profile";
			return res.status(400).json({ error: message });
		}
	}
}
