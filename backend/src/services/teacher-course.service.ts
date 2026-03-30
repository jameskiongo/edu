import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { courses } from "../db/schema";

export class TeacherCourseService {
	async getTeacherCourses(teacherId: number) {
		return db.query.courses.findMany({
			where: eq(courses.teacherId, teacherId),
			with: {
				category: true,
				enrollments: {
					columns: {
						id: true,
					},
				},
			},
			orderBy: (courses, { desc }) => [desc(courses.createdAt)],
		});
	}
}

export const teacherCourseService = new TeacherCourseService();
