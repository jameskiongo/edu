import { eq, and, asc, sql } from "drizzle-orm";
import { db } from "../db/db";
import { sections, lessons, courses } from "../db/schema";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";

export class CurriculumService {
	// --- SECTIONS ---

	async createSection(teacherId: number, courseId: number, data: { title: string }) {
		// Verify course ownership
		const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)),
		});

		if (!course) throw new ForbiddenError("Not authorized to manage this course");

		// Get current max order index
		const lastSection = await db.query.sections.findFirst({
			where: eq(sections.courseId, courseId),
			orderBy: [sql`${sections.orderIndex} desc`],
		});

		const orderIndex = (lastSection?.orderIndex ?? -1) + 1;

		const [section] = await db
			.insert(sections)
			.values({
				courseId,
				title: data.title,
				orderIndex,
			})
			.returning();

		return section;
	}

	async updateSection(teacherId: number, sectionId: number, data: { title?: string }) {
		const section = await db.query.sections.findFirst({
			where: eq(sections.id, sectionId),
			with: { course: true },
		});

		if (!section) throw new NotFoundError("Section not found");
		if (section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

		const [updated] = await db
			.update(sections)
			.set({ ...data })
			.where(eq(sections.id, sectionId))
			.returning();

		return updated;
	}

	async deleteSection(teacherId: number, sectionId: number) {
		const section = await db.query.sections.findFirst({
			where: eq(sections.id, sectionId),
			with: { course: true },
		});

		if (!section) throw new NotFoundError("Section not found");
		if (section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

		await db.delete(sections).where(eq(sections.id, sectionId));
		return { message: "Section deleted successfully" };
	}

	// --- LESSONS ---

	async createLesson(teacherId: number, sectionId: number, data: { 
		title: string; 
		type: "TEXT" | "DOCUMENT" | "QUIZ";
		contentUrl?: string;
		contentBody?: string;
	}) {
		const section = await db.query.sections.findFirst({
			where: eq(sections.id, sectionId),
			with: { course: true },
		});

		if (!section) throw new NotFoundError("Section not found");
		if (section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

		// Get current max order index in section
		const lastLesson = await db.query.lessons.findFirst({
			where: eq(lessons.sectionId, sectionId),
			orderBy: [sql`${lessons.orderIndex} desc`],
		});

		const orderIndex = (lastLesson?.orderIndex ?? -1) + 1;

		const [lesson] = await db
			.insert(lessons)
			.values({
				sectionId,
				title: data.title,
				type: data.type,
				contentUrl: data.contentUrl,
				contentBody: data.contentBody,
				orderIndex,
			})
			.returning();

		return lesson;
	}

	async updateLesson(teacherId: number, lessonId: number, data: any) {
		const lesson = await db.query.lessons.findFirst({
			where: eq(lessons.id, lessonId),
			with: { section: { with: { course: true } } },
		});

		if (!lesson) throw new NotFoundError("Lesson not found");
		if (lesson.section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

		const [updated] = await db
			.update(lessons)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(lessons.id, lessonId))
			.returning();

		return updated;
	}

	async deleteLesson(teacherId: number, lessonId: number) {
		const lesson = await db.query.lessons.findFirst({
			where: eq(lessons.id, lessonId),
			with: { section: { with: { course: true } } },
		});

		if (!lesson) throw new NotFoundError("Lesson not found");
		if (lesson.section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

		await db.delete(lessons).where(eq(lessons.id, lessonId));
		return { message: "Lesson deleted successfully" };
	}

    async reorderSections(teacherId: number, courseId: number, sectionIds: number[]) {
        const course = await db.query.courses.findFirst({
			where: and(eq(courses.id, courseId), eq(courses.teacherId, teacherId)),
		});

		if (!course) throw new ForbiddenError("Not authorized");

        await db.transaction(async (tx) => {
            for (let i = 0; i < sectionIds.length; i++) {
                await tx.update(sections)
                    .set({ orderIndex: i })
                    .where(and(eq(sections.id, sectionIds[i]), eq(sections.courseId, courseId)));
            }
        });

        return { message: "Sections reordered successfully" };
    }

    async reorderLessons(teacherId: number, sectionId: number, lessonIds: number[]) {
        const section = await db.query.sections.findFirst({
			where: eq(sections.id, sectionId),
			with: { course: true },
		});

		if (!section) throw new NotFoundError("Section not found");
		if (section.course.teacherId !== teacherId) throw new ForbiddenError("Not authorized");

        await db.transaction(async (tx) => {
            for (let i = 0; i < lessonIds.length; i++) {
                await tx.update(lessons)
                    .set({ orderIndex: i })
                    .where(and(eq(lessons.id, lessonIds[i]), eq(lessons.sectionId, sectionId)));
            }
        });

        return { message: "Lessons reordered successfully" };
    }
}

export const curriculumService = new CurriculumService();
