ALTER TABLE "teacher_profiles" ADD COLUMN "total_reviews" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD COLUMN "website" varchar(255);--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD COLUMN "twitter" varchar(255);--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD COLUMN "linkedin" varchar(255);--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD COLUMN "github" varchar(255);