import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { calCalendars, calEditions, calSectors } from "../../database/schema";
import { editionFileName } from "../../shared/edition-files";
import { createMediaLoader } from "../../shared/media";
import { failure } from "../../shared/results";
import type { GetPublishedFileInput, GetPublishedFileResult, ListPublishedResult, PublishedSector } from "./types";

// Caminho público e estável de um arquivo publicado. `atual` sempre aponta o ano publicado mais
// recente — é o link que os sites WordPress guardam uma vez e nunca mais precisam trocar.
export function publishedFilePath(sectorSlug: string, calendarSlug: string, year: number | "atual", format: "pdf" | "png"): string {
  return `/api/calendarios/publicados/${sectorSlug}/${calendarSlug}/${year}.${format}`;
}

// Só calendário com arquivo publicado (nunca rascunho, nunca base). Sem login: o calendário
// publicado é para o público externo.
export async function listPublished(): Promise<ListPublishedResult> {
  const rows = await db
    .select({
      sectorSlug: calSectors.slug,
      sectorName: calSectors.name,
      sectorOrder: calSectors.sortOrder,
      calendarSlug: calCalendars.slug,
      calendarName: calCalendars.name,
      calendarOrder: calCalendars.sortOrder,
      year: calEditions.year,
      publishedAt: calEditions.publishedAt,
    })
    .from(calEditions)
    .innerJoin(calCalendars, eq(calCalendars.id, calEditions.calendarId))
    .innerJoin(calSectors, eq(calSectors.id, calCalendars.sectorId))
    .where(and(isNotNull(calEditions.publishedPdfMediaId), isNotNull(calEditions.publishedPngMediaId), eq(calCalendars.isBase, false)))
    .orderBy(asc(calSectors.sortOrder), asc(calCalendars.sortOrder), desc(calEditions.year));

  const sectors = new Map<string, PublishedSector>();
  const seenCalendars = new Set<string>();
  for (const row of rows) {
    const key = `${row.sectorSlug}/${row.calendarSlug}`;
    // Linhas já vêm do ano mais recente pro mais antigo: a primeira de cada calendário é a atual.
    if (seenCalendars.has(key)) continue;
    seenCalendars.add(key);

    const sector = sectors.get(row.sectorSlug) ?? { slug: row.sectorSlug, name: row.sectorName, calendars: [] };
    sectors.set(row.sectorSlug, sector);
    sector.calendars.push({
      sectorSlug: row.sectorSlug,
      calendarSlug: row.calendarSlug,
      calendarName: row.calendarName,
      year: row.year,
      publishedAt: row.publishedAt ?? new Date(0),
      pdfPath: publishedFilePath(row.sectorSlug, row.calendarSlug, "atual", "pdf"),
      pngPath: publishedFilePath(row.sectorSlug, row.calendarSlug, "atual", "png"),
    });
  }
  return { success: true, data: [...sectors.values()] };
}

export async function getPublishedFile(input: GetPublishedFileInput): Promise<GetPublishedFileResult> {
  const [row] = await db
    .select({
      name: calCalendars.name,
      fileNameTemplate: calCalendars.fileNameTemplate,
      year: calEditions.year,
      pdfMediaId: calEditions.publishedPdfMediaId,
      pngMediaId: calEditions.publishedPngMediaId,
    })
    .from(calEditions)
    .innerJoin(calCalendars, eq(calCalendars.id, calEditions.calendarId))
    .innerJoin(calSectors, eq(calSectors.id, calCalendars.sectorId))
    .where(
      and(
        eq(calSectors.slug, input.sectorSlug),
        eq(calCalendars.slug, input.calendarSlug),
        eq(calCalendars.isBase, false),
        isNotNull(calEditions.publishedPdfMediaId),
        isNotNull(calEditions.publishedPngMediaId),
        input.year === null ? undefined : eq(calEditions.year, input.year),
      ),
    )
    .orderBy(desc(calEditions.year))
    .limit(1);
  if (!row) return failure("not_published", "Calendário não publicado.");

  const mediaId = input.format === "pdf" ? row.pdfMediaId : row.pngMediaId;
  if (!mediaId) return failure("not_published", "Calendário não publicado.");

  // O id vem do banco (nunca do request), então este é o único arquivo que a rota pode entregar.
  const media = await (await createMediaLoader())(mediaId);
  if (!media) return failure("file_missing", "O arquivo publicado não foi encontrado no armazenamento.");
  return {
    success: true,
    data: {
      bytes: media.bytes,
      contentType: input.format === "pdf" ? "application/pdf" : "image/png",
      fileName: editionFileName(row, row.year, input.format),
      mediaId,
    },
  };
}
