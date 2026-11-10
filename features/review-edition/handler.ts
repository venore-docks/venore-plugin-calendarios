import { resolveActor } from "../../shared/access";
import { reviewEdition } from "./service";
import type { ReviewEditionInput, ReviewEditionResult } from "./types";

export async function reviewEditionHandler(input: ReviewEditionInput): Promise<ReviewEditionResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return reviewEdition(actor.data, input);
}
