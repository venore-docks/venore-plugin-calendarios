import type { OperationResult } from "@venore/plugin-sdk";
import type { CalendarRecord, EditionStatus, SectorRecord } from "../../contracts/types";
import type { SectorCaps } from "../../shared/access";

export type EditionSummary = {
  id: string;
  year: number;
  status: EditionStatus;
  updatedAt: Date;
  // Há PDF/PNG publicado (mesmo que a edição tenha voltado a rascunho depois).
  hasPublished: boolean;
  publishedAt: Date | null;
};

export type CalendarOverview = CalendarRecord & {
  baseName: string | null;
  // Mais recente primeiro.
  editions: EditionSummary[];
};

export type SectorOverview = SectorRecord & {
  caps: SectorCaps;
  memberCount: number;
  calendars: CalendarOverview[];
};

export type ListOverviewResult = OperationResult<{ sectors: SectorOverview[]; isAdmin: boolean }>;
