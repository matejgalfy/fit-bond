ALTER TYPE "public"."notification_type" ADD VALUE 'event_cancelled' BEFORE 'participant_joined';--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "deleted_at" timestamp;