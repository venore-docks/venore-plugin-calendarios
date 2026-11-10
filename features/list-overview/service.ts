import { asc, desc, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { calCalendars, calEditions, calMembers, calSectors } from "../../database/schema";
import type { EditionStatus } from "../../contracts/types";
import { canSeeWorkInProgress, capsFor, type Actor } from "../../shared/access";
import type { CalendarOverview, ListOverviewResult, SectorOverview } from "./types";

// Visão geral da tela inicial: setores → calendários → edições. Quem não atua no setor só vê as
// edições que têm arquivo publicado (rascunho e validação são assunto interno do setor).
export async function listOverview(actor: Actor): Promise<ListOverviewResult> {
  const handle = beginOperation({ useCase: "calendarios.list-overview", actor: { id: actor.actorId, type: "user" }, kind: "read" });

  const [sectors, calendars, editions, memberCounts] = await Promise.all([
    db.select().from(calSectors).orderBy(asc(calSectors.sortOrder), asc(calSectors.name)),
    db.select().from(calCalendars).orderBy(asc(calCalendars.sortOrder), asc(calCalendars.name)),
    db
      .select({
        id: calEditions.id,
        calendarId: calEditions.calendarId,
        year: calEditions.year,
        status: calEditions.status,
        updatedAt: calEditions.updatedAt,
        publishedPdfMediaId: calEditions.publishedPdfMediaId,
        publishedAt: calEditions.publishedAt,
      })
      .from(calEditions)
      .orderBy(desc(calEditions.year)),
    db
      .select({ sectorId: calMembers.sectorId, total: sql<number>`count(*)::int` })
      .from(calMembers)
      .groupBy(calMembers.sectorId),
  ]);

  const memberCountBySector = new Map(memberCounts.map((row) => [row.sectorId, row.total]));
  const calendarNameById = new Map(calendars.map((calendar) => [calendar.id, calendar.name]));

  const overview: SectorOverview[] = [];
  for (const sector of sectors) {
    const caps = await capsFor(actor, sector.id);
    const seesWork = canSeeWorkInProgress(caps);

    const sectorCalendars: CalendarOverview[] = calendars
      .filter((calendar) => calendar.sectorId === sector.id)
      // Calendário-base é só fonte de dados interna: não aparece pra quem não atua no setor.
      .filter((calendar) => seesWork || !calendar.isBase)
      .map((calendar) => ({
        ...calendar,
        baseName: calendar.baseCalendarId ? (calendarNameById.get(calendar.baseCalendarId) ?? null) : null,
        editions: editions
          .filter((edition) => edition.calendarId === calendar.id)
          .filter((edition) => seesWork || edition.publishedPdfMediaId !== null)
          .map((edition) => ({
            id: edition.id,
            year: edition.year,
            status: edition.status as EditionStatus,
            updatedAt: edition.updatedAt,
            hasPublished: edition.publishedPdfMediaId !== null,
            publishedAt: edition.publishedAt,
          })),
      }))
      .filter((calendar) => seesWork || calendar.editions.length > 0);

    if (!seesWork && sectorCalendars.length === 0) continue;
    overview.push({ ...sector, caps, memberCount: memberCountBySector.get(sector.id) ?? 0, calendars: sectorCalendars });
  }

  const result: ListOverviewResult = { success: true, data: { sectors: overview, isAdmin: actor.isAdmin } };
  endOperation(handle, result);
  return result;
}
