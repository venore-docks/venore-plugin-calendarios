import { listUsers } from "@venore/plugin-sdk/auth";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { canSeeWorkInProgress, capsFor, type Actor } from "../../shared/access";
import { isSameContent } from "../../shared/content-schema";
import {
  findBaseContent,
  findCalendarById,
  findRevisionById,
  listCalendarYears,
  listEditionEvents,
  loadEditionContext,
} from "../../shared/edition-store";
import { resolveContent } from "../../shared/engine/resolve";
import { failure } from "../../shared/results";
import type { GetEditionInput, GetEditionResult } from "./types";

const SEED_ACTOR_NAMES: Record<string, string> = { "system-seed": "Importação inicial" };

export async function getEdition(actor: Actor, input: GetEditionInput): Promise<GetEditionResult> {
  const handle = beginOperation({ useCase: "calendarios.get-edition", actor: { id: actor.actorId, type: "user" }, kind: "read" });
  const finish = (result: GetEditionResult) => {
    endOperation(handle, result);
    return result;
  };

  const context = await loadEditionContext(input.editionId);
  if (!context) return finish(failure("edition_not_found", "Calendário não encontrado."));
  const { edition, calendar, sector } = context;

  // Rascunho e validação são do setor; quem só lê usa a página pública / os arquivos publicados.
  const caps = await capsFor(actor, sector.id);
  if (!canSeeWorkInProgress(caps)) {
    return finish(failure("forbidden_sector", "Você não atua neste setor — o calendário publicado está na página pública."));
  }

  const [baseContent, baseCalendar, events, approvedRevision, publishedRevision, siblingYears, users] = await Promise.all([
    findBaseContent(calendar, edition.year),
    calendar.baseCalendarId ? findCalendarById(calendar.baseCalendarId) : null,
    listEditionEvents(edition.id),
    edition.approvedRevisionId ? findRevisionById(edition.approvedRevisionId) : null,
    edition.publishedRevisionId ? findRevisionById(edition.publishedRevisionId) : null,
    listCalendarYears(calendar.id),
    listUsers(),
  ]);

  const resolved = resolveContent(edition.content, baseContent);
  // Só compara com a revisão validada quando a edição ainda está nela (rascunho tem o próprio
  // histórico de edições e não "defasa").
  const frozen = edition.status === "approved" || edition.status === "published" ? approvedRevision : null;
  const outdatedSinceApproval = frozen ? !isSameContent(frozen.content, resolved) : false;

  // Usuário apagado deixa o id órfão no histórico (texto solto, sem FK) — mostra "Usuário removido".
  const nameById = new Map(users.success ? users.data.map((user) => [user.id, user.name ?? user.email]) : []);

  return finish({
    success: true,
    data: {
      sector,
      calendar,
      baseCalendar,
      edition,
      caps,
      resolved,
      baseContent,
      baseHasEdition: baseContent !== null,
      outdatedSinceApproval,
      events: events.map((event) => ({
        ...event,
        actorName: SEED_ACTOR_NAMES[event.actorId] ?? nameById.get(event.actorId) ?? "Usuário removido",
      })),
      approvedRevisionNumber: approvedRevision?.number ?? null,
      publishedRevisionNumber: publishedRevision?.number ?? null,
      siblingYears,
    },
  });
}
