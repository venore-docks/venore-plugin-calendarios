import { canSeeWorkInProgress, capsFor, resolveActor } from "../../shared/access";
import { parseCalendarContent } from "../../shared/content-schema";
import { findBaseContent, loadEditionContext } from "../../shared/edition-store";
import { resolveContent } from "../../shared/engine/resolve";
import { createMediaLoader } from "../../shared/media";
import { loadRenderAssets } from "../../shared/pdf/build-calendar-files";
import { renderCalendarDocument } from "../../shared/render/render-calendar";
import { failure } from "../../shared/results";
import type { RenderPreviewInput, RenderPreviewResult } from "./types";

// Prévia instantânea no editor: o MESMO HTML que o Chromium imprime no PDF, devolvido como string
// para a tela mostrar num iframe — sem subir navegador a cada alteração.
export async function renderPreviewHandler(input: RenderPreviewInput): Promise<RenderPreviewResult> {
  const content = parseCalendarContent(input.content);
  if (!content) return failure("invalid_content", "Os dados do calendário vieram incompletos ou em formato inválido.");

  const actor = await resolveActor();
  if (!actor.success) return actor;
  const context = await loadEditionContext(input.editionId);
  if (!context) return failure("edition_not_found", "Calendário não encontrado.");
  if (!canSeeWorkInProgress(await capsFor(actor.data, context.sector.id))) {
    return failure("forbidden_sector", "Você não atua neste setor.");
  }

  const resolved = resolveContent(content, await findBaseContent(context.calendar, context.edition.year));
  const { assets } = await loadRenderAssets(resolved, await createMediaLoader());
  return { success: true, data: { html: renderCalendarDocument(resolved, assets) } };
}
