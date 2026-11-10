import { resolveActor } from "../../shared/access";
import { publishEdition } from "./service";
import type { PublishEditionInput, PublishEditionResult } from "./types";

export async function publishEditionHandler(input: PublishEditionInput): Promise<PublishEditionResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return publishEdition(actor.data, input);
}
