import type { OperationResult } from "@venore/plugin-sdk";
import type { PublicEvent } from "../../contracts/types";

export type ListUpcomingEventsInput = {
  // Omitido = todos os setores.
  sectorSlug?: string;
  // "Hoje" (YYYY-MM-DD) no fuso de quem consome; padrão: hoje em America/Sao_Paulo. Evento que ainda
  // não terminou (endDate ?? startDate >= from) é "próximo", inclusive o que está acontecendo hoje.
  from?: string;
  limit?: number;
};
export type ListUpcomingEventsResult = OperationResult<PublicEvent[]>;

// id: para o admin de quem consome montar o link de edição dos eventos do setor.
export type EventSector = { id: string; slug: string; name: string };
export type ListEventSectorsResult = OperationResult<EventSector[]>;
