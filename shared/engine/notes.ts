import type { CalendarContent } from "../../contracts/types";
import { parseIsoDate } from "./dates";

// Notas escritas sob cada mês ("17 - Carnaval", "6 a 17 - Recesso"), geradas das marcações que têm
// nome. `noteOverrides[YYYY-MM]` substitui as geradas por texto livre (uma nota por linha).

// [6,7,8,9] -> "6 a 9"; [20,21] -> "20 e 21"; [16,18] -> "16 e 18"; [2,9,16,23] -> "2, 9, 16 e 23".
export function formatDayList(days: number[]): string {
  const sorted = [...new Set(days)].sort((left, right) => left - right);
  const runs: number[][] = [];
  for (const day of sorted) {
    const last = runs[runs.length - 1];
    if (last && day === last[last.length - 1]! + 1) last.push(day);
    else runs.push([day]);
  }
  const parts = runs.map((run) => (run.length >= 3 ? `${run[0]} a ${run[run.length - 1]}` : run.join(" e ")));
  if (parts.length <= 1) return parts[0] ?? "";
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

// Uma nota do mês: o "17" / "6 a 17" (impresso na cor da categoria) e o texto. `typeKey` null =
// nota escrita à mão (sem categoria).
export type MonthNote = { days: string; text: string; typeKey: string | null };

export function buildMonthNoteItems(content: CalendarContent, yearMonth: string): MonthNote[] {
  const override = content.noteOverrides[yearMonth];
  if (override !== undefined) {
    return override
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text) => ({ days: "", text, typeKey: null }));
  }

  const typeOrder = new Map(content.markTypes.map((type, index) => [type.key, index]));
  const groups = new Map<string, { label: string; typeKey: string; typeIndex: number; days: number[] }>();
  for (const mark of content.marks) {
    if (mark.type === null || !mark.label?.trim() || !mark.date.startsWith(`${yearMonth}-`)) continue;
    const label = mark.label.trim();
    const key = label.toLocaleLowerCase("pt-BR");
    const day = parseIsoDate(mark.date)!.day;
    const group = groups.get(key);
    if (group) group.days.push(day);
    else groups.set(key, { label, typeKey: mark.type, typeIndex: typeOrder.get(mark.type) ?? 0, days: [day] });
  }

  return [...groups.values()]
    .sort((left, right) => left.typeIndex - right.typeIndex || Math.min(...left.days) - Math.min(...right.days))
    .map((group) => ({ days: formatDayList(group.days), text: group.label, typeKey: group.typeKey }));
}

export function buildMonthNotes(content: CalendarContent, yearMonth: string): string[] {
  return buildMonthNoteItems(content, yearMonth).map((note) => (note.days ? `${note.days} - ${note.text}` : note.text));
}
