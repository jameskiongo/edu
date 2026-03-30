import type { Request, Response } from "express";
import { teacherCourseService } from "../services/teacher-course.service";
import { BaseController } from "./base.controller";
import { BadRequestError } from "../utils/errors";

export class TeacherCourseController extends BaseController {
	getMyCourses = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const courses = await teacherCourseService.getTeacherCourses(req.userId);
		return this.sendResponse(res, courses);
	};
}

export const teacherCourseController = new TeacherCourseController();
