import { resolveActor } from "../../shared/access";
import { parseCalendarContent } from "../../shared/content-schema";
import { failure } from "../../shared/results";
import { saveEdition } from "./service";
import type { SaveEditionInput, SaveEditionResult } from "./types";

export async function saveEditionHandler(input: SaveEditionInput): Promise<SaveEditionResult> {
  const content = parseCalendarContent(input.content);
  if (!content || !input.editionId || !Number.isInteger(input.expectedVersion)) {
    return failure("invalid_content", "Os dados do calendário vieram incompletos ou em formato inválido.");
  }
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return saveEdition(actor.data, { editionId: input.editionId, expectedVersion: input.expectedVersion, content });
}
