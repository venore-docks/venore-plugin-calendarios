import { resolveActor } from "../../shared/access";
import { getEdition } from "./service";
import type { GetEditionInput, GetEditionResult } from "./types";

export async function getEditionHandler(input: GetEditionInput): Promise<GetEditionResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return getEdition(actor.data, input);
}
