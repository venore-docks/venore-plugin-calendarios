CREATE SCHEMA "calendarios";
--> statement-breakpoint
CREATE TABLE "calendarios"."calendars" (
	"id" text PRIMARY KEY NOT NULL,
	"sector_id" text NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"base_calendar_id" text,
	"is_base" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"file_name_template" text DEFAULT 'Calendário {ano} - {calendario}.pdf' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendarios"."edition_events" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"action" text NOT NULL,
	"actor_id" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendarios"."editions" (
	"id" text PRIMARY KEY NOT NULL,
	"calendar_id" text NOT NULL,
	"year" integer NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"review_note" text,
	"approved_revision_id" text,
	"published_revision_id" text,
	"published_pdf_media_id" text,
	"published_png_media_id" text,
	"published_at" timestamp with time zone,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cal_editions_status_check" CHECK ("calendarios"."editions"."status" in ('draft', 'in_review', 'approved', 'published'))
);
--> statement-breakpoint
CREATE TABLE "calendarios"."members" (
	"sector_id" text NOT NULL,
	"user_id" text NOT NULL,
	"can_edit" boolean DEFAULT false NOT NULL,
	"can_approve" boolean DEFAULT false NOT NULL,
	"can_publish" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_sector_id_user_id_pk" PRIMARY KEY("sector_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "calendarios"."revisions" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"number" integer NOT NULL,
	"content" jsonb NOT NULL,
	"approved_by" text NOT NULL,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pdf_media_id" text,
	"png_media_id" text
);
--> statement-breakpoint
CREATE TABLE "calendarios"."sectors" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sectors_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "calendarios"."calendars" ADD CONSTRAINT "calendars_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "calendarios"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendarios"."calendars" ADD CONSTRAINT "calendars_base_calendar_id_calendars_id_fk" FOREIGN KEY ("base_calendar_id") REFERENCES "calendarios"."calendars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendarios"."edition_events" ADD CONSTRAINT "edition_events_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "calendarios"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendarios"."editions" ADD CONSTRAINT "editions_calendar_id_calendars_id_fk" FOREIGN KEY ("calendar_id") REFERENCES "calendarios"."calendars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendarios"."members" ADD CONSTRAINT "members_sector_id_sectors_id_fk" FOREIGN KEY ("sector_id") REFERENCES "calendarios"."sectors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "calendarios"."revisions" ADD CONSTRAINT "revisions_edition_id_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "calendarios"."editions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cal_calendars_sector_slug_idx" ON "calendarios"."calendars" USING btree ("sector_id","slug");--> statement-breakpoint
CREATE INDEX "cal_edition_events_edition_idx" ON "calendarios"."edition_events" USING btree ("edition_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cal_editions_calendar_year_idx" ON "calendarios"."editions" USING btree ("calendar_id","year");--> statement-breakpoint
CREATE INDEX "cal_members_user_idx" ON "calendarios"."members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cal_revisions_edition_number_idx" ON "calendarios"."revisions" USING btree ("edition_id","number");