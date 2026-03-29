import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { userRole, badgeType } from "./enums";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	firstName: varchar("first_name", { length: 100 }).notNull(),
	lastName: varchar("last_name", { length: 100 }).notNull(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	image: varchar("image"),
	password: varchar("password", { length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
	isVerified: boolean("is_verified").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	failedLoginAttempts: integer("failed_login_attempts").default(0),
	lockUntil: timestamp("lock_until"),
	defaultSmsDelivery: boolean("default_sms_delivery").default(true).notNull(),
	isBlacklisted: boolean("is_blacklisted").default(false).notNull(),
	role: userRole("role").default("STUDENT").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.primaryKey(),
	bio: varchar("bio", { length: 1000 }),
	specialization: varchar("specialization", { length: 255 }),
	yearsOfExperience: integer("years_of_experience").default(0),
	rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
	totalReviews: integer("total_reviews").default(0),
	totalStudents: integer("total_students").default(0),
	website: varchar("website", { length: 255 }),
	twitter: varchar("twitter", { length: 255 }),
	linkedin: varchar("linkedin", { length: 255 }),
	github: varchar("github", { length: 255 }),
});

export const studentProfiles = pgTable("student_profiles", {
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.primaryKey(),
	enrolledCoursesCount: integer("enrolled_courses_count").default(0),
	completedCourses: integer("completed_courses").default(0),
});

export const studentBadges = pgTable(
	"student_badges",
	{
		id: serial("id").primaryKey(),
		studentId: integer("student_id")
			.references(() => studentProfiles.userId, { onDelete: "cascade" })
			.notNull(),
		badgeType: badgeType("badge_type").notNull(),
		earnedAt: timestamp("earned_at").defaultNow().notNull(),
		courseId: integer("course_id"),
	},
	(t) => [
		index("student_badges_student_id_idx").on(t.studentId),
		unique("student_badges_student_badge_unique").on(
			t.studentId,
			t.badgeType,
			t.courseId,
		),
	],
);

// We define relations in a separate step to handle cross-file dependencies
