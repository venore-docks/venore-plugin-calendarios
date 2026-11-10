import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { canSeeWorkInProgress, capsFor, type Actor } from "../../shared/access";
import { editionFileName, renderEditionFiles } from "../../shared/edition-files";
import { findRevisionById, loadEditionContext, resolveEditionContent } from "../../shared/edition-store";
import { createMediaLoader } from "../../shared/media";
import { failure } from "../../shared/results";
import type { ExportEditionFileInput, ExportEditionFileResult } from "./types";

const CONTENT_TYPES = { pdf: "application/pdf", png: "image/png" } as const;

export async function exportEditionFile(actor: Actor, input: ExportEditionFileInput): Promise<ExportEditionFileResult> {
  const handle = beginOperation({ useCase: "calendarios.export-edition-file", actor: { id: actor.actorId, type: "user" }, kind: "read" });
  const finish = (result: ExportEditionFileResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(input.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const { edition, calendar, sector } = context;
  const fileName = editionFileName(calendar, edition.year, input.format);
  const contentType = CONTENT_TYPES[input.format];

  if (input.source === "published") {
    const mediaId = input.format === "pdf" ? edition.publishedPdfMediaId : edition.publishedPngMediaId;
    if (!mediaId) return finish(failure("not_published", "Este calendário ainda não foi publicado."));
    const media = await (await createMediaLoader())(mediaId);
    if (!media) return finish(failure("file_missing", "O arquivo publicado não foi encontrado no armazenamento."));
    return finish({ success: true, data: { bytes: media.bytes, contentType, fileName, skipped: [] } });
  }

  // Rascunho e validado são assunto do setor.
  if (!canSeeWorkInProgress(await capsFor(actor, sector.id))) {
    return finish(failure("forbidden_sector", "Você não atua neste setor — baixe o calendário publicado."));
  }

  let content;
  if (input.source === "approved") {
    const revision = edition.approvedRevisionId ? await findRevisionById(edition.approvedRevisionId) : null;
    if (!revision) return finish(failure("not_approved", "Este calendário ainda não foi validado."));
    content = revision.content;
  } else {
    content = await resolveEditionContent(calendar, edition);
  }

  const files = await renderEditionFiles(content);
  const bytes = input.format === "pdf" ? files.pdf : files.png;
  return finish({ success: true, data: { bytes, contentType, fileName, skipped: files.skipped } });
}
