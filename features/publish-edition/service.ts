import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { calEditions, calRevisions } from "../../database/schema";
import type { EditionRecord } from "../../contracts/types";
import { requireCap, type Actor } from "../../shared/access";
import { editionFileName, renderEditionFiles } from "../../shared/edition-files";
import { findRevisionById, loadEditionContext, recordEditionEvent, toEditionRecord } from "../../shared/edition-store";
import { failure } from "../../shared/results";
import { uploadCalendariosFile } from "../../shared/upload";
import type { PublishEditionInput, PublishEditionResult } from "./types";

export async function publishEdition(actor: Actor, input: PublishEditionInput): Promise<PublishEditionResult> {
  const handle = beginOperation({ useCase: "calendarios.publish-edition", actor: { id: actor.actorId, type: "user" }, kind: "write" });
  const finish = (result: PublishEditionResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(input.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const { edition, calendar, sector } = context;

  const allowed = await requireCap(actor, sector.id, "publish");
  if (!allowed.success) return finish(allowed);
  if (calendar.isBase) return finish(failure("base_not_published", "O calendário-base não é publicado: ele só alimenta os outros."));
  if (edition.status !== "approved" || !edition.approvedRevisionId) {
    return finish(failure("not_approved", "Só um calendário validado pode ser publicado."));
  }
  const revision = await findRevisionById(edition.approvedRevisionId);
  if (!revision) return finish(failure("revision_missing", "A versão validada não foi encontrada."));

  // O PDF e o PNG publicados saem da revisão congelada na validação, nunca do rascunho vivo.
  const files = await renderEditionFiles(revision.content);
  const [pdf, png] = [
    await uploadCalendariosFile({
      filename: editionFileName(calendar, edition.year, "pdf"),
      contentType: "application/pdf",
      data: Buffer.from(files.pdf),
      allowedMimeCategories: ["document"],
    }),
    await uploadCalendariosFile({
      filename: editionFileName(calendar, edition.year, "png"),
      contentType: "image/png",
      data: Buffer.from(files.png),
      allowedMimeCategories: ["image"],
    }),
  ];
  if (!pdf.success) return finish(pdf);
  if (!png.success) return finish(png);

  const published = await markEditionPublished({
    editionId: edition.id,
    revisionId: revision.id,
    pdfMediaId: pdf.data.id,
    pngMediaId: png.data.id,
    actorId: actor.actorId,
  });
  if (!published) {
    return finish(failure("changed_while_publishing", "O calendário foi alterado enquanto o arquivo era gerado — ele precisa ser validado de novo."));
  }
  return finish({ success: true, data: { edition: published, skipped: files.skipped } });
}

// Só marca publicado se a edição ainda está "approved" NA MESMA revisão de quando o arquivo começou
// a ser gerado — se alguém editou durante a geração, a publicação é descartada.
async function markEditionPublished(command: {
  editionId: string;
  revisionId: string;
  pdfMediaId: string;
  pngMediaId: string;
  actorId: string;
}): Promise<EditionRecord | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(calEditions)
      .set({
        status: "published",
        publishedRevisionId: command.revisionId,
        publishedPdfMediaId: command.pdfMediaId,
        publishedPngMediaId: command.pngMediaId,
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(calEditions.id, command.editionId), eq(calEditions.status, "approved"), eq(calEditions.approvedRevisionId, command.revisionId)))
      .returning();
    if (!row) return null;

    await tx
      .update(calRevisions)
      .set({ pdfMediaId: command.pdfMediaId, pngMediaId: command.pngMediaId })
      .where(eq(calRevisions.id, command.revisionId));
    await recordEditionEvent(tx, { editionId: command.editionId, action: "published", actorId: command.actorId });
    return toEditionRecord(row);
  });
}
