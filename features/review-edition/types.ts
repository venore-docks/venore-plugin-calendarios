import type { OperationResult } from "@venore/plugin-sdk";
import type { EditionRecord } from "../../contracts/types";

export type ReviewDecision = "approve" | "reject";
export type ReviewEditionInput = { editionId: string; expectedVersion: number; decision: ReviewDecision; note?: string };
export type ReviewEditionResult = OperationResult<EditionRecord>;
