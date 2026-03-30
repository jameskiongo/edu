import { and, eq, sql, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { courses, enrollments, studentProfiles, studentBadges, lessonProgress, sections, lessons, courseReviews } from "../db/schema";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class CourseService {
	async createCourse(teacherId: number, data: {
		title: string;
		description: string;
		categoryId?: number;
		price?: string;
		level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
		thumbnailUrl?: string;
	}) {
		const [course] = await db
			.insert(courses)
			.values({
				teacherId,
				title: data.title,
				description: data.description,
				categoryId: data.categoryId,
				price: data.price || "0.00",
				level: data.level || "BEGINNER",
				thumbnailUrl: data.thumbnailUrl,
				status: "DRAFT",
			})
			.returning();

		return course;
	}

	async getCourseById(id: number) {
		const course = await db.query.courses.findFirst({
			where: eq(courses.id, id),
			with: {
				teacher: {
					columns: {
						password: false,
					},
				},
				category: true,
				sections: {
					with: {
						lessons: true,
					},
					orderBy: (sections, { asc }) => [asc(sections.orderIndex)],
				},
			},
		});

		if (!course) {
			throw new NotFoundError("Course not found");
		}

		return course;
	}

	async getAllCourses(filters: {
		categoryId?: number;
		level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
		status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
		limit?: number;
		offset?: number;
		studentId?: number;
	}) {
		const coursesList = await db.query.courses.findMany({
			where: (courses, { eq, and }) => {
				const conditions = [];
				if (filters.categoryId) conditions.push(eq(courses.categoryId, filters.categoryId));
				if (filters.level) conditions.push(eq(courses.level, filters.level));
				if (filters.status) conditions.push(eq(courses.status, filters.status));
				return conditions.length > 0 ? and(...conditions) : undefined;
			},
			limit: filters.limit,
			offset: filters.offset,
			with: {
				teacher: {
					columns: {
						firstName: true,
						lastName: true,
						image: true,
					},
				},
				category: true,
				sections: {
					with: {
						lessons: {
							columns: {
								id: true,
							},
						},
					},
				},
				enrollments: filters.studentId ? {
					where: eq(enrollments.studentId, filters.studentId),
				} : undefined,
			},
			orderBy: (courses, { desc }) => [desc(courses.createdAt)],
		});

		if (filters.studentId) {
			return coursesList.map(course => ({
				...course,
				isEnrolled: course.enrollments.length > 0,
				enrollment: course.enrollments[0] || null,
			}));
		}

		return coursesList;
	}

	async updateCourse(id: number, teacherId: number, data: Partial<{
		title: string;
		description: string;
		categoryId: number;
		price: string;
		level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
		status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
		thumbnailUrl: string;
	}>) {
		const course = await db.query.courses.findFirst({
			where: eq(courses.id, id),
		});

		if (!course) {
			throw new NotFoundError("Course not found");
		}

		if (course.teacherId !== teacherId) {
			throw new BadRequestError("You are not authorized to update this course");
		}

		const [updatedCourse] = await db
			.update(courses)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(courses.id, id))
			.returning();

		return updatedCourse;
	}

	async enrollInCourse(studentId: number, courseId: number) {
		const course = await db.query.courses.findFirst({
			where: eq(courses.id, courseId),
		});

		if (!course) {
			throw new NotFoundError("Course not found");
		}

		if (course.status !== "PUBLISHED") {
			throw new BadRequestError("Cannot enroll in a course that is not published");
		}

		// Check if already enrolled
		const existingEnrollment = await db.query.enrollments.findFirst({
			where: and(
				eq(enrollments.studentId, studentId),
				eq(enrollments.courseId, courseId),
			),
		});

		if (existingEnrollment) {
			throw new BadRequestError("You are already enrolled in this course");
		}

		return await db.transaction(async (tx) => {
			// Create enrollment
			const [enrollment] = await tx
				.insert(enrollments)
				.values({
					studentId,
					courseId,
				})
				.returning();

			// Update course enrollment count
			await tx
				.update(courses)
				.set({
					enrollmentCount: sql`${courses.enrollmentCount} + 1`,
				})
				.where(eq(courses.id, courseId));

			// Update student profile and check for first enrollment badge
			const [profile] = await tx
				.insert(studentProfiles)
				.values({
					userId: studentId,
					enrolledCoursesCount: 1,
				})
				.onConflictDoUpdate({
					target: studentProfiles.userId,
					set: {
						enrolledCoursesCount: sql`${studentProfiles.enrolledCoursesCount} + 1`,
					},
				})
				.returning();

			// Award badge if it's the first enrollment
			if (profile.enrolledCoursesCount === 1) {
				await tx.insert(studentBadges).values({
					studentId,
					badgeType: "FIRST_ENROLLMENT",
					courseId,
				}).onConflictDoNothing();
			}

			return enrollment;
		});
	}

	async checkEnrollment(studentId: number, courseId: number) {
		const enrollment = await db.query.enrollments.findFirst({
			where: and(
				eq(enrollments.studentId, studentId),
				eq(enrollments.courseId, courseId),
			),
		});
		return enrollment;
	}

	async getCourseProgress(studentId: number, courseId: number) {
		const progress = await db.query.lessonProgress.findMany({
			where: and(
				eq(lessonProgress.studentId, studentId),
				eq(lessonProgress.isCompleted, true),
			),
			with: {
				lesson: {
					with: {
						section: true,
					},
				},
			},
		});

		// Filter for lessons belonging to this course
		return progress.filter((p) => p.lesson.section.courseId === courseId);
	}

	async updateLessonProgress(studentId: number, lessonId: number, isCompleted: boolean) {
		const lesson = await db.query.lessons.findFirst({
			where: eq(lessons.id, lessonId),
			with: {
				section: true,
			},
		});

		if (!lesson) {
			throw new NotFoundError("Lesson not found");
		}

		const courseId = lesson.section.courseId;

		// Check enrollment
		const enrollment = await this.checkEnrollment(studentId, courseId);
		if (!enrollment) {
			throw new BadRequestError("You are not enrolled in this course");
		}

		// Update or insert progress
		await db
			.insert(lessonProgress)
			.values({
				studentId,
				lessonId,
				isCompleted,
				completedAt: isCompleted ? new Date() : null,
			})
			.onConflictDoUpdate({
				target: [lessonProgress.studentId, lessonProgress.lessonId],
				set: {
					isCompleted,
					completedAt: isCompleted ? new Date() : null,
				},
			});

		// Recalculate course progress
		const allLessons = await db.query.lessons.findMany({
			where: inArray(
				lessons.sectionId,
				db
					.select({ id: sections.id })
					.from(sections)
					.where(eq(sections.courseId, courseId)),
			),
		});

		if (allLessons.length === 0) return { progressPercent: 0, isCompleted };

		const completedLessons = await db.query.lessonProgress.findMany({
			where: and(
				eq(lessonProgress.studentId, studentId),
				eq(lessonProgress.isCompleted, true),
				inArray(
					lessonProgress.lessonId,
					allLessons.map((l) => l.id),
				),
			),
		});

		const progressPercent = Math.round(
			(completedLessons.length / allLessons.length) * 100,
		);

		await db
			.update(enrollments)
			.set({
				progressPercent,
				completedAt: progressPercent === 100 ? new Date() : null,
			})
			.where(
				and(
					eq(enrollments.studentId, studentId),
					eq(enrollments.courseId, courseId),
				),
			);

		return { progressPercent, isCompleted };
	}

	async getCourseReviews(courseId: number) {
		return db.query.courseReviews.findMany({
			where: eq(courseReviews.courseId, courseId),
			with: {
				student: {
					columns: {
						firstName: true,
						lastName: true,
						image: true,
					},
				},
			},
			orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
		});
	}

	async createReview(studentId: number, courseId: number, data: { rating: number; comment?: string }) {
		// Check enrollment
		const enrollment = await this.checkEnrollment(studentId, courseId);
		if (!enrollment) {
			throw new BadRequestError("You must be enrolled in this course to leave a review");
		}

		// Check if already reviewed
		const existingReview = await db.query.courseReviews.findFirst({
			where: and(
				eq(courseReviews.studentId, studentId),
				eq(courseReviews.courseId, courseId),
			),
		});

		if (existingReview) {
			throw new BadRequestError("You have already reviewed this course");
		}

		if (data.rating < 1 || data.rating > 5) {
			throw new BadRequestError("Rating must be between 1 and 5");
		}

		return await db.transaction(async (tx) => {
			// Create review
			const [review] = await tx
				.insert(courseReviews)
				.values({
					studentId,
					courseId,
					rating: data.rating,
					comment: data.comment,
				})
				.returning();

			// Recalculate course rating
			const allReviews = await tx.query.courseReviews.findMany({
				where: eq(courseReviews.courseId, courseId),
			});

			const totalReviews = allReviews.length;
			const averageRating = (
				allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
			).toFixed(2);

			await tx
				.update(courses)
				.set({
					averageRating,
					totalReviews,
				})
				.where(eq(courses.id, courseId));

			return review;
		});
	}
}

export const courseService = new CourseService();
