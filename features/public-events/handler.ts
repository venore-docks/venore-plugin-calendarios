import { listEventSectors, listUpcomingEvents } from "./service";
import type { ListEventSectorsResult, ListUpcomingEventsInput, ListUpcomingEventsResult } from "./types";

// Sem authorizeActor DE PROPÓSITO: evento público é o que as TVs e o site anunciam. Só devolve campos
// de divulgação (PublicEvent) — nunca rascunho de calendário nem dado de usuário.
export async function listUpcomingEventsHandler(input?: ListUpcomingEventsInput): Promise<ListUpcomingEventsResult> {
  return listUpcomingEvents(input);
}

// Setores (slug + nome) — o admin do Broadcast usa para ligar uma agenda a um setor.
export async function listEventSectorsHandler(): Promise<ListEventSectorsResult> {
  return listEventSectors();
}
