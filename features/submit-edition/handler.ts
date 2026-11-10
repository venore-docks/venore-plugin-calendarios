import { resolveActor } from "../../shared/access";
import { submitEdition } from "./service";
import type { SubmitEditionInput, SubmitEditionResult } from "./types";

export async function submitEditionHandler(input: SubmitEditionInput): Promise<SubmitEditionResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return submitEdition(actor.data, input);
}
