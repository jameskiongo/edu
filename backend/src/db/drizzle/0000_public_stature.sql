CREATE TYPE "public"."badge_type" AS ENUM('FIRST_ENROLLMENT', 'COURSE_COMPLETION');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('login', 'verification', 'password_reset', 'password_change');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'TEACHER', 'STUDENT');--> statement-breakpoint
CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"code" varchar(255) NOT NULL,
	"purpose" "otp_purpose" NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"attempts" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(512) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked" boolean DEFAULT false,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "student_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"course_id" integer,
	CONSTRAINT "student_badges_student_badge_unique" UNIQUE("student_id","badge_type","course_id")
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"enrolled_courses_count" integer DEFAULT 0,
	"completed_courses" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"student_id_number" varchar(50),
	CONSTRAINT "student_profiles_student_id_number_unique" UNIQUE("student_id_number")
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"bio" varchar(1000),
	"specialization" varchar(255),
	"years_of_experience" integer DEFAULT 0,
	"rating" numeric(3, 2) DEFAULT '0.00',
	"total_students" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" varchar,
	"password" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"failed_login_attempts" integer DEFAULT 0,
	"lock_until" timestamp,
	"default_sms_delivery" boolean DEFAULT true NOT NULL,
	"is_blacklisted" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "student_badges_student_id_idx" ON "student_badges" USING btree ("student_id");