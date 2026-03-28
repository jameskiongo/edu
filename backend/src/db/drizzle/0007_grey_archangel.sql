CREATE TYPE "public"."badge_type" AS ENUM('FIRST_ENROLLMENT', 'COURSE_COMPLETION');--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('LOGIN', 'VERIFICATION', 'PASSWORD_RESET', 'PASSWORD_CHANGE');--> statement-breakpoint
CREATE TABLE "student_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"badge_type" "badge_type" NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL,
	"course_id" integer NOT NULL,
	CONSTRAINT "student_badges_student_badge_unique" UNIQUE("student_id","badge_type","course_id")
);
--> statement-breakpoint
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "teacher_profiles" DROP CONSTRAINT "teacher_profiles_user_id_unique";--> statement-breakpoint
ALTER TABLE "otp_codes" ALTER COLUMN "purpose" SET DATA TYPE "public"."otp_purpose" USING "purpose"::"public"."otp_purpose";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "first_name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "last_name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_student_id_student_profiles_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_badges_student_id_idx" ON "student_badges" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" USING btree ("user_id");