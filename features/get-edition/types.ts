import type { OperationResult } from "@venore/plugin-sdk";
import type {
  CalendarContent,
  CalendarRecord,
  EditionEventRecord,
  EditionRecord,
  SectorRecord,
} from "../../contracts/types";
import type { SectorCaps } from "../../shared/access";

export type GetEditionInput = { editionId: string };
export type EditionEventView = EditionEventRecord & { actorName: string };

export type EditionView = {
  sector: SectorRecord;
  calendar: CalendarRecord;
  baseCalendar: CalendarRecord | null;
  edition: EditionRecord;
  caps: SectorCaps;
  // Conteúdo com a herança do base aplicada — é o que a prévia e o PDF mostram.
  resolved: CalendarContent;
  // Conteúdo do base no mesmo ano: o editor resolve a herança ao vivo, enquanto a pessoa marca datas.
  baseContent: CalendarContent | null;
  // O base tem edição deste ano? (sem ela, nada é herdado)
  baseHasEdition: boolean;
  // A edição está validada/publicada mas o base mudou depois: o PDF publicado já não corresponde ao
  // que a tela mostra, e é preciso enviar para validação de novo.
  outdatedSinceApproval: boolean;
  events: EditionEventView[];
  approvedRevisionNumber: number | null;
  publishedRevisionNumber: number | null;
  siblingYears: { id: string; year: number }[];
};
export type GetEditionResult = OperationResult<EditionView>;
