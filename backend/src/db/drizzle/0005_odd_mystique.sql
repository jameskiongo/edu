ALTER TABLE "users" ADD COLUMN "default_sms_delivery" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_blacklisted" boolean DEFAULT false NOT NULL;