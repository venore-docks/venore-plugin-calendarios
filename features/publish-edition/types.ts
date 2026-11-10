import type { OperationResult } from "@venore/plugin-sdk";
import type { EditionRecord } from "../../contracts/types";

export type PublishEditionInput = { editionId: string };
// skipped: foto/logo que não carregaram (o calendário sai mesmo assim, com aviso).
export type PublishEditionResult = OperationResult<{ edition: EditionRecord; skipped: string[] }>;
