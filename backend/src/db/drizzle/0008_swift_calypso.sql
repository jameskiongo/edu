ALTER TABLE "otp_codes" ALTER COLUMN "purpose" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."otp_purpose";--> statement-breakpoint
CREATE TYPE "public"."otp_purpose" AS ENUM('login', 'verification', 'password_reset', 'password_change');--> statement-breakpoint
ALTER TABLE "otp_codes" ALTER COLUMN "purpose" SET DATA TYPE "public"."otp_purpose" USING "purpose"::"public"."otp_purpose";