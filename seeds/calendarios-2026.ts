import { db } from "@venore/plugin-sdk";
import type { OperationResult } from "@venore/plugin-sdk";
import type { CalendarContent } from "../contracts/types";
import { calCalendars, calEditionEvents, calEditions, calSectors } from "../database/schema";
import { uploadCalendariosFile } from "../shared/upload";
import { SEED_ASSETS } from "./assets";
import { CALENDARIOS_2026, type SeedCalendar } from "./data/calendarios-2026";
import { deriveBase } from "./derive-base";

// Calendários de 2026 como o marketing os entregou em PDF — o ponto de partida dos setores (o de
// 2027 nasce com "Iniciar 2027"). Usa o banco direto, sem handler: não há permissão de plugin
// envolvida (mesmo racional do seed do Listas de materiais). Os arquivos sobem pela sessão de quem
// clicou em "Popular dados" em /admin/plugins.
const SEED_ACTOR_ID = "system-seed";

const SECTORS = [
  { slug: "colegio-erasto-gaertner", name: "Colégio Erasto Gaertner", sortOrder: 10 },
  { slug: "faculdade-fidelis", name: "Faculdade Fidelis", sortOrder: 20 },
] as const;

// Nome do arquivo de download, como o marketing nomeava os PDFs.
const FILE_NAME_TEMPLATES: Record<string, string> = {
  "fidelis-presencial": "Calendário Fidelis {ano}.pdf",
  "fidelis-ead": "Calendário Fidelis {ano} - EaD.pdf",
};
const BASE_SLUG = "calendario-base";

// Idempotente por setor: setor já existente (pelo slug) é pulado inteiro, sem reenviar arquivos.
export async function seedCalendarios2026(): Promise<OperationResult<void>> {
  const existing = new Set((await db.select({ slug: calSectors.slug }).from(calSectors)).map((row) => row.slug));
  const pendingSectors = SECTORS.filter((sector) => !existing.has(sector.slug));
  if (pendingSectors.length === 0) return { success: true, data: undefined };

  const pendingCalendars = CALENDARIOS_2026.filter((calendar) => pendingSectors.some((sector) => sector.slug === calendar.sector));

  // Cada arquivo sobe uma vez só, mesmo usado por vários calendários (logo do Colégio).
  const mediaByKey = new Map<string, string>();
  for (const key of new Set(pendingCalendars.flatMap((calendar) => [calendar.header, calendar.logo]))) {
    const asset = SEED_ASSETS[key];
    if (!asset) continue;
    const uploaded = await uploadCalendariosFile({
      filename: asset.filename,
      contentType: asset.contentType,
      data: Buffer.from(await asset.load(), "base64"),
      allowedMimeCategories: ["image"],
    });
    if (!uploaded.success) {
      return { success: false, error: { ...uploaded.error, message: `${uploaded.error.message} Nenhum calendário foi criado.` } };
    }
    mediaByKey.set(key, uploaded.data.id);
  }

  const withMedia = (calendar: SeedCalendar, content: CalendarContent): CalendarContent => ({
    ...content,
    headerImageMediaId: mediaByKey.get(calendar.header) ?? null,
    logoMediaId: mediaByKey.get(calendar.logo) ?? null,
  });

  await db.transaction(async (tx) => {
    const sectorRows = await tx
      .insert(calSectors)
      .values(pendingSectors.map((sector) => ({ ...sector })))
      .returning();
    const sectorId = new Map(sectorRows.map((row) => [row.slug, row.id]));

    const insertEdition = async (calendarId: string, year: number, content: CalendarContent) => {
      const [edition] = await tx.insert(calEditions).values({ calendarId, year, content, updatedBy: SEED_ACTOR_ID }).returning();
      await tx
        .insert(calEditionEvents)
        .values({ editionId: edition!.id, action: "created", actorId: SEED_ACTOR_ID, note: `Importado dos PDFs de ${year} do marketing.` });
    };

    // Colégio: um calendário-base (feriados, recessos…) e os quatro calendários herdando dele.
    const erasto = pendingCalendars.filter((calendar) => calendar.sector === "colegio-erasto-gaertner");
    if (erasto.length > 0) {
      const { base, children } = deriveBase(erasto.map((calendar) => calendar.content));
      const year = erasto[0]!.year;
      const [baseRow] = await tx
        .insert(calCalendars)
        .values({ sectorId: sectorId.get("colegio-erasto-gaertner")!, slug: BASE_SLUG, name: "Calendário base", isBase: true, sortOrder: 0 })
        .returning();
      await insertEdition(baseRow!.id, year, base);

      for (const [index, calendar] of erasto.entries()) {
        const [row] = await tx
          .insert(calCalendars)
          .values({
            sectorId: sectorId.get(calendar.sector)!,
            slug: calendar.slug.replace(/^erasto-/, ""),
            name: calendar.name,
            baseCalendarId: baseRow!.id,
            sortOrder: (index + 1) * 10,
          })
          .returning();
        await insertEdition(row!.id, calendar.year, withMedia(calendar, children[index]!));
      }
    }

    // Faculdade: dois calendários independentes (cada um com as suas datas).
    for (const [index, calendar] of pendingCalendars.filter((candidate) => candidate.sector === "faculdade-fidelis").entries()) {
      const [row] = await tx
        .insert(calCalendars)
        .values({
          sectorId: sectorId.get(calendar.sector)!,
          slug: calendar.slug.replace(/^fidelis-/, ""),
          name: calendar.name,
          sortOrder: (index + 1) * 10,
          fileNameTemplate: FILE_NAME_TEMPLATES[calendar.slug] ?? undefined,
        })
        .returning();
      await insertEdition(row!.id, calendar.year, withMedia(calendar, calendar.content));
    }
  });

  return { success: true, data: undefined };
}

