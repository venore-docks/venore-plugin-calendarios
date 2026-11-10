CREATE TABLE "calendarios"."events" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"title" text NOT NULL,
	"detail" text,
	"location" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" text,
	"end_time" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cal_events_dates_check" CHECK ("calendarios"."events"."end_date" is null or "calendarios"."events"."end_date" >= "calendarios"."events"."start_date")
);
--> statement-breakpoint
ALTER TABLE "calendarios"."events" ADD CONSTRAINT "events_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "calendarios"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cal_events_sector_start_idx" ON "calendarios"."events" USING btree ("sector_id","start_date");