import { and, eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import type { CalendarContent } from "../../contracts/types";
import { calEditions, calRevisions } from "../../database/schema";
import { requireCap, type Actor } from "../../shared/access";
import { loadEditionContext, recordEditionEvent, resolveEditionContent, toEditionRecord } from "../../shared/edition-store";
import { failure } from "../../shared/results";
import type { ReviewEditionInput, ReviewEditionResult } from "./types";

const STALE = "O calendário não está mais aguardando validação ou foi alterado — recarregue a página.";

const inReviewAt = (editionId: string, version: number) =>
  and(eq(calEditions.id, editionId), eq(calEditions.version, version), eq(calEditions.status, "in_review"));

export async function reviewEdition(actor: Actor, input: ReviewEditionInput): Promise<ReviewEditionResult> {
  const handle = beginOperation({ useCase: `calendarios.${input.decision}-edition`, actor: { id: actor.actorId, type: "user" }, kind: "write" });
  const finish = (result: ReviewEditionResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(input.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const allowed = await requireCap(actor, context.sector.id, "approve");
  if (!allowed.success) return finish(allowed);

  const note = input.note?.trim() || null;
  if (input.decision === "reject") {
    if (!note) return finish(failure("note_required", "Explique o que precisa mudar ao devolver."));
    const rejected = await rejectEdition({ editionId: input.editionId, expectedVersion: input.expectedVersion, actorId: actor.actorId, note });
    return finish(rejected ? { success: true, data: rejected } : failure("invalid_transition", STALE));
  }

  // O conteúdo congelado é o RESOLVIDO (com a herança do base): é exatamente o que o PDF mostrará.
  const resolved = await resolveEditionContent(context.calendar, context.edition);
  const approved = await approveEdition({
    editionId: input.editionId,
    expectedVersion: input.expectedVersion,
    actorId: actor.actorId,
    note,
    resolved,
  });
  return finish(approved ? { success: true, data: approved } : failure("invalid_transition", STALE));
}

// Aprovar = congelar o conteúdo resolvido numa revisão nova (número sequencial por edição).
async function approveEdition(command: {
  editionId: string;
  expectedVersion: number;
  actorId: string;
  note: string | null;
  resolved: CalendarContent;
}) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(calEditions).where(eq(calEditions.id, command.editionId)).limit(1);
    if (!current || current.status !== "in_review" || current.version !== command.expectedVersion) return null;

    const [{ last }] = await tx.select({ last: max(calRevisions.number) }).from(calRevisions).where(eq(calRevisions.editionId, command.editionId));
    const [revision] = await tx
      .insert(calRevisions)
      .values({ editionId: command.editionId, number: (last ?? 0) + 1, content: command.resolved, approvedBy: command.actorId })
      .returning();

    const [row] = await tx
      .update(calEditions)
      .set({ status: "approved", approvedRevisionId: revision.id, reviewNote: null, updatedAt: new Date() })
      .where(inReviewAt(command.editionId, command.expectedVersion))
      .returning();
    if (!row) throw new Error("O calendário mudou durante a validação.");

    await recordEditionEvent(tx, { editionId: command.editionId, action: "approved", actorId: command.actorId, note: command.note });
    return toEditionRecord(row);
  });
}

async function rejectEdition(command: { editionId: string; expectedVersion: number; actorId: string; note: string }) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(calEditions)
      .set({ status: "draft", reviewNote: command.note, updatedAt: new Date() })
      .where(inReviewAt(command.editionId, command.expectedVersion))
      .returning();
    if (!row) return null;
    await recordEditionEvent(tx, { editionId: command.editionId, action: "rejected", actorId: command.actorId, note: command.note });
    return toEditionRecord(row);
  });
}
