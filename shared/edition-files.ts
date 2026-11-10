import type { CalendarContent, CalendarRecord } from "../contracts/types";
import { createMediaLoader } from "./media";
import { buildCalendarFiles, type CalendarFiles } from "./pdf/build-calendar-files";

// Nome de download a partir do modelo do calendário ("Calendário {ano} - {calendario}.pdf"); o
// modelo termina em .pdf e o PNG troca só a extensão.
export function editionFileName(calendar: Pick<CalendarRecord, "name" | "fileNameTemplate">, year: number, extension: "pdf" | "png"): string {
  const base = calendar.fileNameTemplate
    .replaceAll("{ano}", String(year))
    .replaceAll("{calendario}", calendar.name)
    // Nome de arquivo não aceita barra nem caracteres de controle.
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\.(pdf|png)$/i, "");
  return `${base}.${extension}`;
}

export async function renderEditionFiles(content: CalendarContent): Promise<CalendarFiles> {
  return buildCalendarFiles(content, await createMediaLoader());
}
