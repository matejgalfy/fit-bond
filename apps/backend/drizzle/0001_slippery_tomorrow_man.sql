ALTER TABLE "user_preferred_sports" DROP CONSTRAINT "user_preferred_sports_user_id_sport_id_unique";--> statement-breakpoint
ALTER TABLE "user_preferred_sports" DROP CONSTRAINT "user_preferred_sports_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_preferred_sports" DROP CONSTRAINT "user_preferred_sports_sport_id_sports_id_fk";
--> statement-breakpoint
ALTER TABLE "user_preferred_sports" ADD CONSTRAINT "user_preferred_sports_user_id_sport_id_pk" PRIMARY KEY("user_id","sport_id");--> statement-breakpoint
ALTER TABLE "user_preferred_sports" ADD CONSTRAINT "user_preferred_sports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferred_sports" ADD CONSTRAINT "user_preferred_sports_sport_id_sports_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sports"("id") ON DELETE cascade ON UPDATE no action;