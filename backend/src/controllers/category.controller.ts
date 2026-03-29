import type { Request, Response } from "express";
import { type CategoryService, categoryService } from "../services/category.service";
import { BaseController } from "./base.controller";

export class CategoryController extends BaseController {
	constructor(private categoryService: CategoryService) {
		super();
	}

	createCategory = async (req: Request, res: Response) => {
		const category = await this.categoryService.createCategory(req.body);
		return this.sendResponse(res, category, "Category created successfully", 201);
	};

	getAllCategories = async (_: Request, res: Response) => {
		const categories = await this.categoryService.getAllCategories();
		return this.sendResponse(res, categories);
	};

	getCategoryBySlug = async (req: Request, res: Response) => {
		const category = await this.categoryService.getCategoryBySlug(req.params.slug as string);
		return this.sendResponse(res, category);
	};

	updateCategory = async (req: Request, res: Response) => {
		const updatedCategory = await this.categoryService.updateCategory(
			Number(req.params.id),
			req.body,
		);
		return this.sendResponse(res, updatedCategory, "Category updated successfully");
	};

	deleteCategory = async (req: Request, res: Response) => {
		const result = await this.categoryService.deleteCategory(Number(req.params.id));
		return this.sendResponse(res, result.message);
	};
}

export const categoryController = new CategoryController(categoryService);
