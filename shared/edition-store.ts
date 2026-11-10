import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { calCalendars, calEditionEvents, calEditions, calRevisions, calSectors } from "../database/schema";
import type {
  CalendarContent,
  CalendarRecord,
  EditionEventAction,
  EditionEventRecord,
  EditionRecord,
  EditionStatus,
  RevisionRecord,
  SectorRecord,
} from "../contracts/types";
import { resolveContent } from "./engine/resolve";

// Consultas repetidas entre features: ler edição/calendário/setor, registrar evento do histórico,
// resolver a herança do base.

export type Executor = Pick<typeof db, "select" | "insert" | "update">;

export function toEditionRecord(row: typeof calEditions.$inferSelect): EditionRecord {
  return { ...row, status: row.status as EditionStatus };
}

export async function findEditionById(editionId: string, executor: Executor = db): Promise<EditionRecord | null> {
  const [row] = await executor.select().from(calEditions).where(eq(calEditions.id, editionId)).limit(1);
  return row ? toEditionRecord(row) : null;
}

export async function findCalendarById(calendarId: string, executor: Executor = db): Promise<CalendarRecord | null> {
  const [row] = await executor.select().from(calCalendars).where(eq(calCalendars.id, calendarId)).limit(1);
  return row ?? null;
}

export async function findSectorById(sectorId: string, executor: Executor = db): Promise<SectorRecord | null> {
  const [row] = await executor.select().from(calSectors).where(eq(calSectors.id, sectorId)).limit(1);
  return row ?? null;
}

export async function findRevisionById(revisionId: string): Promise<RevisionRecord | null> {
  const [row] = await db.select().from(calRevisions).where(eq(calRevisions.id, revisionId)).limit(1);
  return row ?? null;
}

export type EditionContext = { edition: EditionRecord; calendar: CalendarRecord; sector: SectorRecord };

export async function loadEditionContext(editionId: string): Promise<EditionContext | null> {
  const edition = await findEditionById(editionId);
  const calendar = edition ? await findCalendarById(edition.calendarId) : null;
  const sector = calendar ? await findSectorById(calendar.sectorId) : null;
  return edition && calendar && sector ? { edition, calendar, sector } : null;
}

// Conteúdo do calendário-base no mesmo ano (null: sem base ou o base ainda não tem edição do ano).
export async function findBaseContent(calendar: CalendarRecord, year: number): Promise<CalendarContent | null> {
  if (!calendar.baseCalendarId) return null;
  const [row] = await db
    .select()
    .from(calEditions)
    .where(and(eq(calEditions.calendarId, calendar.baseCalendarId), eq(calEditions.year, year)))
    .limit(1);
  return row?.content ?? null;
}

// O que vai pro PDF: o conteúdo do calendário com a herança do base aplicada.
export async function resolveEditionContent(calendar: CalendarRecord, edition: EditionRecord): Promise<CalendarContent> {
  return resolveContent(edition.content, await findBaseContent(calendar, edition.year));
}

export async function listEditionEvents(editionId: string): Promise<EditionEventRecord[]> {
  const rows = await db
    .select()
    .from(calEditionEvents)
    .where(eq(calEditionEvents.editionId, editionId))
    .orderBy(desc(calEditionEvents.createdAt));
  return rows.map((row) => ({ ...row, action: row.action as EditionEventAction }));
}

export async function listCalendarYears(calendarId: string): Promise<{ id: string; year: number }[]> {
  return db
    .select({ id: calEditions.id, year: calEditions.year })
    .from(calEditions)
    .where(eq(calEditions.calendarId, calendarId))
    .orderBy(asc(calEditions.year));
}

// Salvar várias vezes seguidas não enche o histórico: o mesmo autor salvando de novo em até 30 min
// só atualiza o horário do último "saved".
const SAVE_COALESCE_WINDOW_MS = 30 * 60 * 1000;

export async function recordEditionEvent(
  executor: Executor,
  event: { editionId: string; action: EditionEventAction; actorId: string; note?: string | null },
): Promise<void> {
  if (event.action === "saved") {
    const [last] = await executor
      .select()
      .from(calEditionEvents)
      .where(eq(calEditionEvents.editionId, event.editionId))
      .orderBy(desc(calEditionEvents.createdAt))
      .limit(1);
    if (
      last &&
      last.action === "saved" &&
      last.actorId === event.actorId &&
      Date.now() - last.createdAt.getTime() < SAVE_COALESCE_WINDOW_MS
    ) {
      await executor.update(calEditionEvents).set({ createdAt: new Date() }).where(eq(calEditionEvents.id, last.id));
      return;
    }
  }

  await executor.insert(calEditionEvents).values({
    editionId: event.editionId,
    action: event.action,
    actorId: event.actorId,
    note: event.note ?? null,
  });
}
