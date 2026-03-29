import { relations } from "drizzle-orm";
import { users, teacherProfiles, studentProfiles, studentBadges } from "./users";
import {
	courses,
	sections,
	lessons,
	categories,
	enrollments,
	courseReviews,
	lessonProgress,
} from "./courses";
import { refreshTokens, otpCodes } from "./auth";

// Re-export everything
export * from "./enums";
export * from "./users";
export * from "./courses";
export * from "./auth";

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many, one }) => ({
	refreshTokens: many(refreshTokens),
	otpCodes: many(otpCodes),
	courses: many(courses),
	enrollments: many(enrollments),
	reviews: many(courseReviews),
	lessonProgress: many(lessonProgress),
	teacherProfile: one(teacherProfiles, {
		fields: [users.id],
		references: [teacherProfiles.userId],
	}),
	studentProfile: one(studentProfiles, {
		fields: [users.id],
		references: [studentProfiles.userId],
	}),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
	teacher: one(users, {
		fields: [courses.teacherId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [courses.categoryId],
		references: [categories.id],
	}),
	sections: many(sections),
	enrollments: many(enrollments),
	reviews: many(courseReviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	courses: many(courses),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
	course: one(courses, {
		fields: [sections.courseId],
		references: [courses.id],
	}),
	lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
	section: one(sections, {
		fields: [lessons.sectionId],
		references: [sections.id],
	}),
	progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
	student: one(users, {
		fields: [enrollments.studentId],
		references: [users.id],
	}),
	course: one(courses, {
		fields: [enrollments.courseId],
		references: [courses.id],
	}),
}));

export const courseReviewsRelations = relations(courseReviews, ({ one }) => ({
	course: one(courses, {
		fields: [courseReviews.courseId],
		references: [courses.id],
	}),
	student: one(users, {
		fields: [courseReviews.studentId],
		references: [users.id],
	}),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
	student: one(users, {
		fields: [lessonProgress.studentId],
		references: [users.id],
	}),
	lesson: one(lessons, {
		fields: [lessonProgress.lessonId],
		references: [lessons.id],
	}),
}));

export const teacherProfilesRelations = relations(
	teacherProfiles,
	({ one }) => ({
		user: one(users, {
			fields: [teacherProfiles.userId],
			references: [users.id],
		}),
	}),
);

export const studentProfilesRelations = relations(
	studentProfiles,
	({ one, many }) => ({
		user: one(users, {
			fields: [studentProfiles.userId],
			references: [users.id],
		}),
		badges: many(studentBadges),
	}),
);

export const studentBadgesRelations = relations(studentBadges, ({ one }) => ({
	student: one(users, {
		fields: [studentBadges.studentId],
		references: [users.id],
	}),
	studentProfile: one(studentProfiles, {
		fields: [studentBadges.studentId],
		references: [studentProfiles.userId],
		relationName: "studentProfileBadges",
	}),
}));

// --- TYPES ---

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
export type Section = typeof sections.$inferSelect;
export type NewSection = typeof sections.$inferInsert;
export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
export type CourseReview = typeof courseReviews.$inferSelect;
export type NewCourseReview = typeof courseReviews.$inferInsert;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
