import { and, asc, eq, gte, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import type { PublicEvent } from "../../contracts/types";
import { calEvents, calSectors } from "../../database/schema";
import { isValidIsoDate } from "../../shared/engine/dates";
import { eventCoverPath } from "../../shared/event-cover";
import type { ListEventSectorsResult, ListUpcomingEventsInput, ListUpcomingEventsResult } from "./types";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// "Hoje" no fuso da instituição (Curitiba). O consumidor pode passar o dele em `from`.
function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

// Eventos públicos que ainda não terminaram, do mais próximo ao mais distante. Sem login: é o que as
// TVs e o site anunciam. Usado pelo Broadcast (barrel) e pelas páginas públicas.
export async function listUpcomingEvents(input: ListUpcomingEventsInput = {}): Promise<ListUpcomingEventsResult> {
  const from = input.from && isValidIsoDate(input.from) ? input.from : todayInSaoPaulo();
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(input.limit ?? DEFAULT_LIMIT)));

  const rows = await db
    .select({
      id: calEvents.id,
      sectorSlug: calSectors.slug,
      sectorName: calSectors.name,
      title: calEvents.title,
      detail: calEvents.detail,
      location: calEvents.location,
      startDate: calEvents.startDate,
      endDate: calEvents.endDate,
      startTime: calEvents.startTime,
      endTime: calEvents.endTime,
    })
    .from(calEvents)
    .innerJoin(calSectors, eq(calSectors.id, calEvents.sectorId))
    .where(
      and(
        input.sectorSlug ? eq(calSectors.slug, input.sectorSlug) : undefined,
        // Ainda não terminou: o último dia (término, ou o próprio início) é hoje ou depois.
        gte(sql`coalesce(${calEvents.endDate}, ${calEvents.startDate})`, from),
      ),
    )
    .orderBy(asc(calEvents.startDate), asc(calEvents.startTime))
    .limit(limit);

  // A capa é servida por /api/calendarios/eventos/:id/capa: capa própria, imagem padrão do setor ou placeholder.
  const events: PublicEvent[] = rows.map((row) => ({ ...row, coverPath: eventCoverPath(row.id) }));
  return { success: true, data: events };
}

export async function listEventSectors(): Promise<ListEventSectorsResult> {
  const rows = await db.select({ id: calSectors.id, slug: calSectors.slug, name: calSectors.name }).from(calSectors).orderBy(asc(calSectors.sortOrder), asc(calSectors.name));
  return { success: true, data: rows };
}
