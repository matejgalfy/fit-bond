ALTER TABLE "event_interested" DROP CONSTRAINT "event_interested_event_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "event_participants" DROP CONSTRAINT "event_participants_event_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "event_interested" ADD CONSTRAINT "event_interested_user_id_event_id_pk" PRIMARY KEY("user_id","event_id");--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_event_id_pk" PRIMARY KEY("user_id","event_id");