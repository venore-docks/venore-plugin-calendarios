import type { OperationResult } from "@venore/plugin-sdk";
import type { EventRecord, SectorRecord } from "../../contracts/types";
import type { SectorCaps } from "../../shared/access";

export type EventFields = {
  title: string;
  detail?: string | null;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  // Capa própria (id de mídia enviado pela tela). Omitido = mantém; null = remove (volta ao padrão do setor).
  coverMediaId?: string | null;
};

export type ListEventsInput = { sectorId: string };
export type CreateEventInput = EventFields & { sectorId: string };
export type UpdateEventInput = EventFields & { eventId: string };
export type DeleteEventInput = { eventId: string };

export type SetSectorEventCoverInput = { sectorId: string; mediaId: string | null };
export type SetSectorEventCoverResult = OperationResult<undefined>;
export type ListEventsResult = OperationResult<{ sector: SectorRecord; caps: SectorCaps; events: EventRecord[] }>;
export type CreateEventResult = OperationResult<EventRecord>;
export type UpdateEventResult = OperationResult<EventRecord>;
export type DeleteEventResult = OperationResult<{ title: string }>;
