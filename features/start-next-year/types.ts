import type { OperationResult } from "@venore/plugin-sdk";
import type { EditionRecord } from "../../contracts/types";

export type StartNextYearInput = { calendarId: string };
export type StartNextYearResult = OperationResult<EditionRecord>;
