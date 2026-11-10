import { and, eq, sql } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import type { CalendarContent, EditionRecord } from "../../contracts/types";
import { calEditions } from "../../database/schema";
import { recordEditionEvent, toEditionRecord } from "../../shared/edition-store";

// Update condicional na versão (lock otimista): 0 linhas = alguém salvou antes. Qualquer edição
// volta a edição para rascunho — o publicado continua no ar até a próxima publicação.
export async function updateEditionContent(input: {
  editionId: string;
  expectedVersion: number;
  content: CalendarContent;
  actorId: string;
  eventNote: string | null;
}): Promise<EditionRecord | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(calEditions)
      .set({
        content: input.content,
        status: "draft",
        version: sql`${calEditions.version} + 1`,
        updatedBy: input.actorId,
        updatedAt: new Date(),
      })
      .where(and(eq(calEditions.id, input.editionId), eq(calEditions.version, input.expectedVersion)))
      .returning();
    if (!row) return null;

    await recordEditionEvent(tx, { editionId: input.editionId, action: "saved", actorId: input.actorId, note: input.eventNote });
    return toEditionRecord(row);
  });
}
