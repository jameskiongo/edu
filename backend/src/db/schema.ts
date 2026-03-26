import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	integer,
	pgEnum,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["ADMIN", "TEACHER", "STUDENT"]);

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	firstName: varchar("first_name").notNull(),
	lastName: varchar("last_name").notNull(),
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

export const refreshTokens = pgTable("refresh_tokens", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	token: varchar("token", { length: 512 }).notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	revoked: boolean("revoked").default(false),
});

export const otpCodes = pgTable("otp_codes", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	code: varchar("code", { length: 255 }).notNull(),
	purpose: varchar("purpose", { length: 50 }).notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	used: boolean("used").default(false),
	attempts: integer("attempts").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teacherProfiles = pgTable("teacher_profiles", {
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.primaryKey()
		.unique(),
	bio: varchar("bio", { length: 1000 }),
	specialization: varchar("specialization", { length: 255 }),
	yearsOfExperience: integer("years_of_experience").default(0),
	rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
	totalStudents: integer("total_students").default(0),
});

export const studentProfiles = pgTable("student_profiles", {
	userId: integer("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.primaryKey()
		.unique(),
	enrolledCoursesCount: integer("enrolled_courses_count").default(0),
	completedCourses: integer("completed_courses").default(0),
	totalPoints: integer("total_points").default(0),
	studentIdNumber: varchar("student_id_number", { length: 50 }).unique(),
});

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

export const teacherProfilesRelations = relations(teacherProfiles, ({ one }) => ({
	user: one(users, {
		fields: [teacherProfiles.userId],
		references: [users.id],
	}),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
	user: one(users, {
		fields: [studentProfiles.userId],
		references: [users.id],
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
