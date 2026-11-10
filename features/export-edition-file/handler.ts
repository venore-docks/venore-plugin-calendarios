import { resolveActor } from "../../shared/access";
import { exportEditionFile } from "./service";
import type { ExportEditionFileInput, ExportEditionFileResult } from "./types";

export async function exportEditionFileHandler(input: ExportEditionFileInput): Promise<ExportEditionFileResult> {
  const actor = await resolveActor();
  if (!actor.success) return actor;
  return exportEditionFile(actor.data, input);
}
