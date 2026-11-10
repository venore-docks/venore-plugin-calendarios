import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { calEditions } from "../../database/schema";
import { requireCap, type Actor } from "../../shared/access";
import { loadEditionContext, recordEditionEvent, toEditionRecord } from "../../shared/edition-store";
import { failure } from "../../shared/results";
import type { SubmitEditionInput, SubmitEditionResult } from "./types";

export async function submitEdition(actor: Actor, input: SubmitEditionInput): Promise<SubmitEditionResult> {
  const handle = beginOperation({ useCase: "calendarios.submit-edition", actor: { id: actor.actorId, type: "user" }, kind: "write" });
  const finish = (result: SubmitEditionResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(input.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const allowed = await requireCap(actor, context.sector.id, "edit");
  if (!allowed.success) return finish(allowed);
  if (context.calendar.isBase) {
    return finish(failure("base_not_submitted", "O calendário-base não passa por validação: ele alimenta os calendários que herdam dele."));
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(calEditions)
      .set({ status: "in_review", reviewNote: null, updatedAt: new Date() })
      .where(and(eq(calEditions.id, input.editionId), eq(calEditions.version, input.expectedVersion), eq(calEditions.status, "draft")))
      .returning();
    if (!row) return null;
    await recordEditionEvent(tx, { editionId: input.editionId, action: "submitted", actorId: actor.actorId });
    return toEditionRecord(row);
  });

  return finish(
    updated
      ? { success: true, data: updated }
      : failure("invalid_transition", "Só um rascunho salvo pode ser enviado para validação — recarregue a página e tente de novo."),
  );
}
