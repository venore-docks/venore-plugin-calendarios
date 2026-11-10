import type { OperationResult } from "@venore/plugin-sdk";
import type { EditionRecord } from "../../contracts/types";

export type SubmitEditionInput = { editionId: string; expectedVersion: number };
export type SubmitEditionResult = OperationResult<EditionRecord>;
