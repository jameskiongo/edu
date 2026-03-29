import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";

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

export const refreshTokens = pgTable(
	"refresh_tokens",
	{
		id: serial("id").primaryKey(),
		userId: integer("user_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		token: varchar("token", { length: 512 }).notNull().unique(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		revoked: boolean("revoked").default(false),
	},
	(t) => [index("refresh_tokens_user_id_idx").on(t.userId)],
);

export const otpCodes = pgTable("otp_codes", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	code: varchar("code", { length: 255 }).notNull(),
	purpose: otpPurpose("purpose").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	used: boolean("used").default(false),
	attempts: integer("attempts").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const usersRelations = relations(users, ({ many, one }) => ({
	refreshTokens: many(refreshTokens),
	otpCodes: many(otpCodes),
	teacherProfile: one(teacherProfiles, {
		fields: [users.id],
		references: [teacherProfiles.userId],
	}),
	studentProfile: one(studentProfiles, {
		fields: [users.id],
		references: [studentProfiles.userId],
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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type OtpCode = typeof otpCodes.$inferSelect;
export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type NewStudentProfile = typeof studentProfiles.$inferInsert;
