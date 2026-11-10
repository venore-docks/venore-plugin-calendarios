import { resolveActor } from "../../shared/access";
import { listOverview } from "./service";
import type { ListOverviewResult } from "./types";

export async function listOverviewHandler(): Promise<ListOverviewResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return listOverview(actor.data);
}
