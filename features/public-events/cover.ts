import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { calEvents, calSectors } from "../../database/schema";
import { eventCoverPlaceholderSvg } from "../../shared/event-cover";
import { createMediaLoader } from "../../shared/media";

export type CoverFile = { bytes: Uint8Array; contentType: string; etag: string };

const encoder = new TextEncoder();

// Capa própria → imagem padrão do setor → placeholder. Nunca falha por falta de imagem: as TVs e o site
// sempre recebem algo para mostrar. O id da mídia vem do banco (nunca do request).
async function resolveCover(mediaId: string | null, sectorName: string): Promise<CoverFile> {
  if (mediaId) {
    const media = await (await createMediaLoader())(mediaId);
    if (media && media.contentType.startsWith("image/")) return { bytes: media.bytes, contentType: media.contentType, etag: mediaId };
  }
  return { bytes: encoder.encode(eventCoverPlaceholderSvg(sectorName)), contentType: "image/svg+xml", etag: `placeholder-${sectorName}` };
}

// null = evento inexistente.
export async function getEventCover(eventId: string): Promise<CoverFile | null> {
  const [row] = await db
    .select({ cover: calEvents.coverMediaId, fallback: calSectors.defaultEventCoverMediaId, sectorName: calSectors.name })
    .from(calEvents)
    .innerJoin(calSectors, eq(calSectors.id, calEvents.sectorId))
    .where(eq(calEvents.id, eventId))
    .limit(1);
  if (!row) return null;
  return resolveCover(row.cover ?? row.fallback, row.sectorName);
}

// null = setor inexistente.
export async function getSectorDefaultCover(sectorSlug: string): Promise<CoverFile | null> {
  const [row] = await db
    .select({ fallback: calSectors.defaultEventCoverMediaId, sectorName: calSectors.name })
    .from(calSectors)
    .where(and(eq(calSectors.slug, sectorSlug)))
    .limit(1);
  return row ? resolveCover(row.fallback, row.sectorName) : null;
}
