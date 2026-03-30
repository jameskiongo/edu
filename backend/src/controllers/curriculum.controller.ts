import type { Request, Response } from "express";
import { curriculumService } from "../services/curriculum.service";
import { BaseController } from "./base.controller";
import { BadRequestError } from "../utils/errors";

export class CurriculumController extends BaseController {
	// Sections
	createSection = async (req: Request, res: Response) => {
		const section = await curriculumService.createSection(
			req.userId!,
			Number(req.params.courseId),
			req.body,
		);
		return this.sendResponse(res, section, "Section created successfully", 201);
	};

	updateSection = async (req: Request, res: Response) => {
		const section = await curriculumService.updateSection(
			req.userId!,
			Number(req.params.sectionId),
			req.body,
		);
		return this.sendResponse(res, section);
	};

	deleteSection = async (req: Request, res: Response) => {
		await curriculumService.deleteSection(req.userId!, Number(req.params.sectionId));
		return this.sendResponse(res, null, "Section deleted successfully");
	};

	reorderSections = async (req: Request, res: Response) => {
		await curriculumService.reorderSections(
			req.userId!,
			Number(req.params.courseId),
			req.body.sectionIds,
		);
		return this.sendResponse(res, null, "Sections reordered successfully");
	};

	// Lessons
	createLesson = async (req: Request, res: Response) => {
		const lesson = await curriculumService.createLesson(
			req.userId!,
			Number(req.params.sectionId),
			req.body,
		);
		return this.sendResponse(res, lesson, "Lesson created successfully", 201);
	};

	updateLesson = async (req: Request, res: Response) => {
		const lesson = await curriculumService.updateLesson(
			req.userId!,
			Number(req.params.lessonId),
			req.body,
		);
		return this.sendResponse(res, lesson);
	};

	deleteLesson = async (req: Request, res: Response) => {
		await curriculumService.deleteLesson(req.userId!, Number(req.params.lessonId));
		return this.sendResponse(res, null, "Lesson deleted successfully");
	};

	reorderLessons = async (req: Request, res: Response) => {
		await curriculumService.reorderLessons(
			req.userId!,
			Number(req.params.sectionId),
			req.body.lessonIds,
		);
		return this.sendResponse(res, null, "Lessons reordered successfully");
	};

	uploadContent = async (req: Request, res: Response) => {
		if (!req.file) {
			throw new BadRequestError("No file uploaded");
		}

		const contentUrl = `/uploads/${req.file.filename}`;
		return this.sendResponse(res, { contentUrl }, "Content uploaded successfully");
	};
}

export const curriculumController = new CurriculumController();
