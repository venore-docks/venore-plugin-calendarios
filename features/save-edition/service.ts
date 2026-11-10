import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import type { CalendarContent } from "../../contracts/types";
import { requireCap, type Actor } from "../../shared/access";
import { isSameContent } from "../../shared/content-schema";
import { loadEditionContext } from "../../shared/edition-store";
import { failure, STATUS_LABELS } from "../../shared/results";
import { updateEditionContent } from "./store";
import type { SaveEditionResult } from "./types";

const CONFLICT = "Outra pessoa salvou este calendário enquanto você editava. Recarregue a página para ver a versão atual.";

export async function saveEdition(
  actor: Actor,
  command: { editionId: string; expectedVersion: number; content: CalendarContent },
): Promise<SaveEditionResult> {
  const handle = beginOperation({ useCase: "calendarios.save-edition", actor: { id: actor.actorId, type: "user" }, kind: "write" });
  const finish = (result: SaveEditionResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(command.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const { edition, sector } = context;

  const allowed = await requireCap(actor, sector.id, "edit");
  if (!allowed.success) return finish(allowed);

  if (edition.version !== command.expectedVersion) return finish(failure("version_conflict", CONFLICT));
  if (isSameContent(edition.content, command.content)) return finish({ success: true, data: edition });

  // Edição depois de enviada/validada/publicada volta pra rascunho e precisa de nova validação; o
  // PDF publicado continua valendo até a próxima publicação.
  const eventNote =
    edition.status === "draft" ? null : `Alterado quando estava "${STATUS_LABELS[edition.status]}" — voltou para rascunho.`;
  const saved = await updateEditionContent({
    editionId: edition.id,
    expectedVersion: command.expectedVersion,
    content: command.content,
    actorId: actor.actorId,
    eventNote,
  });
  return finish(saved ? { success: true, data: saved } : failure("version_conflict", CONFLICT));
}
