ALTER TABLE "student_badges" DROP CONSTRAINT "student_badges_student_id_student_profiles_user_id_fk";
--> statement-breakpoint
ALTER TABLE "student_badges" ADD CONSTRAINT "student_badges_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;