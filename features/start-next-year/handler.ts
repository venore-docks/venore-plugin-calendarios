import { resolveActor } from "../../shared/access";
import { startNextYear } from "./service";
import type { StartNextYearInput, StartNextYearResult } from "./types";

export async function startNextYearHandler(input: StartNextYearInput): Promise<StartNextYearResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return startNextYear(actor.data, input);
}
