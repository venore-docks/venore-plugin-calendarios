import { desc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { calEditions } from "../../database/schema";
import { requireCap, type Actor } from "../../shared/access";
import { carryContentToYear } from "../../shared/content-schema";
import { findCalendarById, recordEditionEvent, toEditionRecord } from "../../shared/edition-store";
import { failure } from "../../shared/results";
import type { StartNextYearInput, StartNextYearResult } from "./types";

// Ano novo nunca começa do zero: leva a estrutura do último ano (categorias, textos, aparência,
// assinatura), calcula os feriados nacionais do novo ano e desloca os períodos um ano — a escola
// só marca o que muda (recessos, sábados letivos…). Veja carryContentToYear.
export async function startNextYear(actor: Actor, input: StartNextYearInput): Promise<StartNextYearResult> {
  const handle = beginOperation({ useCase: "calendarios.start-next-year", actor: { id: actor.actorId, type: "user" }, kind: "write" });
  const finish = (result: StartNextYearResult) => {
    endOperation(handle, result);
    return result;
  };

  const calendar = await findCalendarById(input.calendarId);
  if (!calendar) return finish(failure("calendar_not_found", "Calendário não encontrado."));
  const allowed = await requireCap(actor, calendar.sectorId, "edit");
  if (!allowed.success) return finish(allowed);

  const [latest] = await db
    .select()
    .from(calEditions)
    .where(eq(calEditions.calendarId, calendar.id))
    .orderBy(desc(calEditions.year))
    .limit(1);
  if (!latest) return finish(failure("no_previous_edition", "Este calendário ainda não tem nenhum ano para copiar."));

  const year = latest.year + 1;
  const content = carryContentToYear(latest.content, latest.year, year, { generateHolidays: !calendar.baseCalendarId });
  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(calEditions)
      .values({ calendarId: calendar.id, year, content, updatedBy: actor.actorId })
      .onConflictDoNothing()
      .returning();
    if (!row) return null;
    await recordEditionEvent(tx, { editionId: row.id, action: "created", actorId: actor.actorId, note: `Criado a partir de ${latest.year}.` });
    return toEditionRecord(row);
  });
  if (!created) return finish(failure("year_exists", `O calendário de ${year} já existe.`));
  return finish({ success: true, data: created });
}
