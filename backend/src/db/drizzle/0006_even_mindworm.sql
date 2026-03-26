CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TEACHER', 'STUDENT');--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"enrolled_courses_count" integer DEFAULT 0,
	"completed_courses" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"student_id_number" varchar(50),
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "student_profiles_student_id_number_unique" UNIQUE("student_id_number")
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"bio" varchar(1000),
	"specialization" varchar(255),
	"years_of_experience" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_students" integer DEFAULT 0,
	CONSTRAINT "teacher_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'STUDENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;