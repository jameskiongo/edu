import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["ADMIN", "TEACHER", "STUDENT"]);

export const badgeType = pgEnum("badge_type", [
	"FIRST_ENROLLMENT",
	"COURSE_COMPLETION",
]);

export const otpPurpose = pgEnum("otp_purpose", [
	"login",
	"verification",
	"password_reset",
	"password_change",
	"phone_change",
]);

export const courseStatus = pgEnum("course_status", [
	"DRAFT",
	"PUBLISHED",
	"ARCHIVED",
]);

export const lessonType = pgEnum("lesson_type", [
	"TEXT",
	"DOCUMENT",
	"QUIZ",
]);

export const courseLevel = pgEnum("course_level", [
	"BEGINNER",
	"INTERMEDIATE",
	"ADVANCED",
]);
