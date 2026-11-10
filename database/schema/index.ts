import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { CalendarContent } from "../../contracts/types";

export const calendariosSchema = pgSchema("calendarios");

// Setor = quem é dono dos calendários e de quem os mantém (Colégio Erasto Gaertner, Faculdade
// Fidelis, Marketing…). É a unidade de permissão: membros atuam num setor, não no sistema todo.
export const calSectors = calendariosSchema.table("sectors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  // Imagem padrão dos eventos do setor (id de mídia, texto solto): vale quando o evento não tem capa própria.
  defaultEventCoverMediaId: text("default_event_cover_media_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Quem atua em cada setor e com o quê. userId é texto solto, sem FK pra auth (um plugin nunca
// referencia o schema de outro). Os papéis globais do RBAC só abrem a porta do plugin; o que a
// pessoa pode fazer em CADA setor sai daqui.
export const calMembers = calendariosSchema.table(
  "members",
  {
    sectorId: text("sector_id")
      .notNull()
      .references(() => calSectors.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    canEdit: boolean("can_edit").notNull().default(false),
    canApprove: boolean("can_approve").notNull().default(false),
    canPublish: boolean("can_publish").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.sectorId, table.userId] }), index("cal_members_user_idx").on(table.userId)],
);

// Calendário = um PDF por ano de um setor (Ensino Fundamental I, Fidelis EaD…). Um calendário pode
// herdar categorias e datas de um "base" do mesmo setor (feriados e recessos comuns); o base não é
// impresso nem aprovado.
export const calCalendars = calendariosSchema.table(
  "calendars",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectorId: text("sector_id")
      .notNull()
      .references(() => calSectors.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    baseCalendarId: text("base_calendar_id").references((): AnyPgColumn => calCalendars.id, { onDelete: "set null" }),
    isBase: boolean("is_base").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    fileNameTemplate: text("file_name_template").notNull().default("Calendário {ano} - {calendario}.pdf"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("cal_calendars_sector_slug_idx").on(table.sectorId, table.slug)],
);

// Edição = calendário × ano letivo. `content` é o documento editável inteiro (contracts/types.ts) e
// `version` é o lock otimista do salvar (duas abas/pessoas editando não se sobrescrevem em silêncio).
// Ids de mídia e de usuário são texto solto, sem FK pra media/auth.
export const calEditions = calendariosSchema.table(
  "editions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    calendarId: text("calendar_id")
      .notNull()
      .references(() => calCalendars.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    status: text("status").notNull().default("draft"),
    content: jsonb("content").$type<CalendarContent>().notNull(),
    version: integer("version").notNull().default(1),
    // Motivo da devolução pela validação — limpo no próximo envio.
    reviewNote: text("review_note"),
    approvedRevisionId: text("approved_revision_id"),
    publishedRevisionId: text("published_revision_id"),
    publishedPdfMediaId: text("published_pdf_media_id"),
    publishedPngMediaId: text("published_png_media_id"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("cal_editions_calendar_year_idx").on(table.calendarId, table.year),
    check("cal_editions_status_check", sql`${table.status} in ('draft', 'in_review', 'approved', 'published')`),
  ],
);

// Revisão = cópia congelada do conteúdo RESOLVIDO (herança já aplicada) na aprovação. O PDF/PNG
// publicado sai sempre de uma revisão (nunca do rascunho vivo): o que foi validado é o que vai pro ar.
export const calRevisions = calendariosSchema.table(
  "revisions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    editionId: text("edition_id")
      .notNull()
      .references(() => calEditions.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    content: jsonb("content").$type<CalendarContent>().notNull(),
    approvedBy: text("approved_by").notNull(),
    approvedAt: timestamp("approved_at", { withTimezone: true }).notNull().defaultNow(),
    pdfMediaId: text("pdf_media_id"),
    pngMediaId: text("png_media_id"),
  },
  (table) => [uniqueIndex("cal_revisions_edition_number_idx").on(table.editionId, table.number)],
);

// Histórico (quem salvou/enviou/validou/devolveu/publicou e quando) mostrado na aba Histórico.
export const calEditionEvents = calendariosSchema.table(
  "edition_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    editionId: text("edition_id")
      .notNull()
      .references(() => calEditions.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    actorId: text("actor_id").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("cal_edition_events_edition_idx").on(table.editionId, table.createdAt)],
);

// Evento público = o que as TVs (Broadcast) e o site anunciam: título, tema/descrição, local e horário.
// É DO SETOR (não de um calendário) e independe do texto impresso e da validação do PDF: o tema de uma
// "Semana Acadêmica" costuma ser definido depois do calendário impresso, e muda sem refazer o PDF.
// Datas e horas são locais ("YYYY-MM-DD" / "HH:MM", sem fuso) — quem consome converte no próprio fuso.
// Sem horário = dia inteiro. endDate nulo = evento de um dia só.
export const calEvents = calendariosSchema.table(
  "events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sectorId: text("sector_id")
      .notNull()
      .references(() => calSectors.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    detail: text("detail"),
    location: text("location"),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }),
    startTime: text("start_time"),
    endTime: text("end_time"),
    // Capa própria do evento (id de mídia, texto solto). Sem ela vale a imagem padrão do setor e, sem essa,
    // um placeholder neutro (ver routes/api/event-cover.ts).
    coverMediaId: text("cover_media_id"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cal_events_sector_start_idx").on(table.sectorId, table.startDate),
    check("cal_events_dates_check", sql`${table.endDate} is null or ${table.endDate} >= ${table.startDate}`),
  ],
);
