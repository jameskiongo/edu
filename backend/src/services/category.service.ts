import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { categories } from "../db/schema";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class CategoryService {
	private slugify(text: string): string {
		return text
			.toString()
			.toLowerCase()
			.trim()
			.replace(/\s+/g, "-") // Replace spaces with -
			.replace(/[^\w-]+/g, "") // Remove all non-word chars
			.replace(/--+/g, "-"); // Replace multiple - with single -
	}

	async createCategory(data: {
		name: string;
		description?: string;
	}) {
		const slug = this.slugify(data.name);

		const existingCategory = await db.query.categories.findFirst({
			where: eq(categories.slug, slug),
		});

		if (existingCategory) {
			throw new BadRequestError("Category with this name already exists");
		}

		const [category] = await db
			.insert(categories)
			.values({
				name: data.name,
				slug,
				description: data.description,
			})
			.returning();

		return category;
	}

	async getAllCategories() {
		return db.query.categories.findMany({
			orderBy: (categories, { asc }) => [asc(categories.name)],
		});
	}

	async getCategoryBySlug(slug: string) {
		const category = await db.query.categories.findFirst({
			where: eq(categories.slug, slug),
		});

		if (!category) {
			throw new NotFoundError("Category not found");
		}

		return category;
	}

	async updateCategory(
		id: number,
		data: {
			name?: string;
			description?: string;
		},
	) {
		const category = await db.query.categories.findFirst({
			where: eq(categories.id, id),
		});

		if (!category) {
			throw new NotFoundError("Category not found");
		}

		const updateData: Partial<typeof categories.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (data.name) {
			updateData.name = data.name;
			updateData.slug = this.slugify(data.name);

			// Check if new slug conflicts with another category
			const existingCategory = await db.query.categories.findFirst({
				where: eq(categories.slug, updateData.slug),
			});

			if (existingCategory && existingCategory.id !== id) {
				throw new BadRequestError("Another category with this name already exists");
			}
		}

		if (data.description !== undefined) {
			updateData.description = data.description;
		}

		const [updatedCategory] = await db
			.update(categories)
			.set(updateData)
			.where(eq(categories.id, id))
			.returning();

		return updatedCategory;
	}

	async deleteCategory(id: number) {
		const category = await db.query.categories.findFirst({
			where: eq(categories.id, id),
		});

		if (!category) {
			throw new NotFoundError("Category not found");
		}

		// Check if category has courses
		const coursesInCategory = await db.query.courses.findFirst({
			where: (courses, { eq }) => eq(courses.categoryId, id),
		});

		if (coursesInCategory) {
			throw new BadRequestError("Cannot delete category with existing courses");
		}

		await db.delete(categories).where(eq(categories.id, id));
		return { message: "Category deleted successfully" };
	}
}

export const categoryService = new CategoryService();
