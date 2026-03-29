import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	integer,
	pgTable,
	serial,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { courseStatus, lessonType, courseLevel } from "./enums";
import { users } from "./users";

export const categories = pgTable("categories", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 100 }).notNull().unique(),
	slug: varchar("slug", { length: 100 }).notNull().unique(),
	description: varchar("description", { length: 500 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
	id: serial("id").primaryKey(),
	teacherId: integer("teacher_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	categoryId: integer("category_id")
		.references(() => categories.id, { onDelete: "set null" }),
	title: varchar("title", { length: 255 }).notNull(),
	description: varchar("description", { length: 2000 }).notNull(),
	thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
	price: decimal("price", { precision: 10, scale: 2 }).default("0.00").notNull(),
	level: courseLevel("level").default("BEGINNER").notNull(),
	status: courseStatus("status").default("DRAFT").notNull(),
	averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default(
		"0.00",
	),
	totalReviews: integer("total_reviews").default(0),
	enrollmentCount: integer("enrollment_count").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sections = pgTable("sections", {
	id: serial("id").primaryKey(),
	courseId: integer("course_id")
		.references(() => courses.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	orderIndex: integer("order_index").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
	id: serial("id").primaryKey(),
	sectionId: integer("section_id")
		.references(() => sections.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	type: lessonType("type").default("TEXT").notNull(),
	contentUrl: varchar("content_url", { length: 500 }),
	contentBody: varchar("content_body", { length: 20000 }),
	orderIndex: integer("order_index").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enrollments = pgTable(
	"enrollments",
	{
		id: serial("id").primaryKey(),
		studentId: integer("student_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		courseId: integer("course_id")
			.references(() => courses.id, { onDelete: "cascade" })
			.notNull(),
		enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
		progressPercent: integer("progress_percent").default(0),
		completedAt: timestamp("completed_at"),
	},
	(t) => [unique("enrollment_unique").on(t.studentId, t.courseId)],
);

export const courseReviews = pgTable(
	"course_reviews",
	{
		id: serial("id").primaryKey(),
		courseId: integer("course_id")
			.references(() => courses.id, { onDelete: "cascade" })
			.notNull(),
		studentId: integer("student_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		rating: integer("rating").notNull(),
		comment: varchar("comment", { length: 1000 }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [unique("review_unique").on(t.courseId, t.studentId)],
);

export const lessonProgress = pgTable(
	"lesson_progress",
	{
		id: serial("id").primaryKey(),
		studentId: integer("student_id")
			.references(() => users.id, { onDelete: "cascade" })
			.notNull(),
		lessonId: integer("lesson_id")
			.references(() => lessons.id, { onDelete: "cascade" })
			.notNull(),
		isCompleted: boolean("is_completed").default(false),
		completedAt: timestamp("completed_at"),
	},
	(t) => [unique("progress_unique").on(t.studentId, t.lessonId)],
);
