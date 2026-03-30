import type { Request, Response } from "express";
import { type CourseService, courseService } from "../services/course.service";
import { BaseController } from "./base.controller";
import { BadRequestError } from "../utils/errors";

export class CourseController extends BaseController {
	constructor(private courseService: CourseService) {
		super();
	}

	createCourse = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const course = await this.courseService.createCourse(req.userId, req.body);
		return this.sendResponse(res, course, "Course created successfully as draft", 201);
	};

	getCourseById = async (req: Request, res: Response) => {
		const course = await this.courseService.getCourseById(Number(req.params.id));
		return this.sendResponse(res, course);
	};

	getAllCourses = async (req: Request, res: Response) => {
		const { categoryId, level, status, limit, offset } = req.query;
		const courses = await this.courseService.getAllCourses({
			categoryId: categoryId ? Number(categoryId) : undefined,
			level: level as any,
			status: (status as any) || "PUBLISHED",
			limit: limit ? Number(limit) : undefined,
			offset: offset ? Number(offset) : undefined,
			studentId: req.userId,
		});
		return this.sendResponse(res, courses);
	};

	updateCourse = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const updatedCourse = await this.courseService.updateCourse(
			Number(req.params.id),
			req.userId,
			req.body,
		);
		return this.sendResponse(res, updatedCourse, "Course updated successfully");
	};

	enroll = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const enrollment = await this.courseService.enrollInCourse(
			req.userId,
			Number(req.params.id),
		);
		return this.sendResponse(res, enrollment, "Successfully enrolled in course", 201);
	};

	checkEnrollmentStatus = async (req: Request, res: Response) => {
		if (!req.userId) {
			return this.sendResponse(res, { isEnrolled: false });
		}

		const enrollment = await this.courseService.checkEnrollment(
			req.userId,
			Number(req.params.id),
		);
		return this.sendResponse(res, { isEnrolled: !!enrollment, enrollment });
	};

	getCourseProgress = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const progress = await this.courseService.getCourseProgress(
			req.userId,
			Number(req.params.id),
		);
		return this.sendResponse(res, progress);
	};

	updateLessonProgress = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const { isCompleted } = req.body;
		const result = await this.courseService.updateLessonProgress(
			req.userId,
			Number(req.params.lessonId),
			isCompleted,
		);
		return this.sendResponse(res, result, "Progress updated successfully");
	};

	getCourseReviews = async (req: Request, res: Response) => {
		const reviews = await this.courseService.getCourseReviews(
			Number(req.params.id),
		);
		return this.sendResponse(res, reviews);
	};

	createReview = async (req: Request, res: Response) => {
		if (!req.userId) {
			throw new BadRequestError("User ID is required");
		}

		const review = await this.courseService.createReview(
			req.userId,
			Number(req.params.id),
			req.body,
		);
		return this.sendResponse(res, review, "Review submitted successfully", 201);
	};

	uploadThumbnail = async (req: Request, res: Response) => {
		if (!req.file) {
			throw new BadRequestError("No file uploaded");
		}

		const thumbnailUrl = `/uploads/${req.file.filename}`;
		return this.sendResponse(res, { thumbnailUrl }, "Thumbnail uploaded successfully");
	};
}

export const courseController = new CourseController(courseService);
