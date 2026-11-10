import type { OperationResult } from "@venore/plugin-sdk";
import type { EditionRecord } from "../../contracts/types";

// `content` é `unknown` na entrada: vem do editor (cliente) e é validado no handler.
export type SaveEditionInput = { editionId: string; expectedVersion: number; content: unknown };
export type SaveEditionResult = OperationResult<EditionRecord>;
