import type { CalendarContent, MarkEffect } from "../../contracts/types";
import { addDays, isWithin, parseIsoDate, weekdayOf } from "./dates";

export type SchoolDayCounts = {
  // "2026-02" -> 17. Meses sem nenhum dia letivo não aparecem (no impresso não mostram contagem).
  perMonth: Record<string, number>;
  // Um total por item de `semesters`, na mesma ordem.
  perSemester: number[];
};

// Uma data com várias categorias: "não é dia letivo" vence "é dia letivo" (um feriado em cima de um
// sábado letivo continua feriado), que vence "só informa".
function combineEffects(effects: MarkEffect[]): MarkEffect | undefined {
  if (effects.length === 0) return undefined;
  if (effects.includes("off")) return "off";
  if (effects.includes("on")) return "on";
  return "none";
}

function effectsByDate(content: CalendarContent): Map<string, MarkEffect> {
  const effectByType = new Map(content.markTypes.map((type) => [type.key, type.effect]));
  const collected = new Map<string, MarkEffect[]>();
  for (const mark of content.marks) {
    if (mark.type === null) continue;
    const bucket = collected.get(mark.date) ?? [];
    bucket.push(effectByType.get(mark.type) ?? "none");
    collected.set(mark.date, bucket);
  }
  return new Map([...collected].map(([date, effects]) => [date, combineEffects(effects)!]));
}

// Regra de dia letivo (a do calendário impresso de 2026, reproduzida mês a mês nos testes): o dia
// precisa estar dentro de algum intervalo de `semesters` E ser segunda a sexta sem marcação de
// efeito "off" (feriado, recesso, semana pedagógica…) OU sábado/domingo com marcação de efeito
// "on" (sábado letivo). Marcações "none" (início de bimestre, recuperação…) não mudam nada.
export function countSchoolDays(content: CalendarContent): SchoolDayCounts {
  const effectByDate = effectsByDate(content);

  const counted = new Set<string>();
  const perSemester = content.semesters.map((semester) => {
    let total = 0;
    for (let date = semester.start; date <= semester.end; date = addDays(date, 1)) {
      if (!isSchoolDay(date, effectByDate.get(date))) continue;
      counted.add(date);
      total += 1;
    }
    return total;
  });

  const perMonth: Record<string, number> = {};
  for (const date of counted) perMonth[date.slice(0, 7)] = (perMonth[date.slice(0, 7)] ?? 0) + 1;
  return { perMonth, perSemester };
}

function isSchoolDay(date: string, effect: MarkEffect | undefined): boolean {
  const parsed = parseIsoDate(date);
  if (!parsed) return false;
  const weekday = weekdayOf(parsed.year, parsed.month, parsed.day);
  const weekend = weekday === 0 || weekday === 6;
  return weekend ? effect === "on" : effect !== "off";
}

// Para a tela de edição: este dia entra na contagem?
export function isCountedSchoolDay(content: CalendarContent, date: string): boolean {
  if (!content.semesters.some((semester) => isWithin(date, semester.start, semester.end))) return false;
  return isSchoolDay(date, effectsByDate(content).get(date));
}
