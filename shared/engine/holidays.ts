import type { DayMark } from "../../contracts/types";
import { addDays, isoDate } from "./dates";

// Páscoa pelo algoritmo gregoriano anônimo (Meeus/Jones/Butcher) — válido para qualquer ano do
// calendário gregoriano.
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return isoDate(year, month, day);
}

type Holiday = { date: string; label: string; fixed: boolean };

// Feriados nacionais do ano, na ordem do calendário. O que é movel (Carnaval, Sexta-feira Santa,
// Corpus Christi) sai da Páscoa; o resto é data fixa e `fixed: true` leva a marcação adiante no
// "Iniciar próximo ano". Carnaval aqui é a terça (a segunda e a quarta de cinzas ficam como
// "recesso" decidido pela escola). Feriado municipal/estadual não entra: cada setor tem o seu.
export function nationalHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  const fixed = (month: number, day: number, label: string): Holiday => ({ date: isoDate(year, month, day), label, fixed: true });
  const movable = (offset: number, label: string): Holiday => ({ date: addDays(easter, offset), label, fixed: false });

  return [
    fixed(1, 1, "Confraternização Universal"),
    movable(-47, "Carnaval"),
    movable(-2, "Sexta-feira Santa"),
    fixed(4, 21, "Tiradentes"),
    fixed(5, 1, "Dia do Trabalho"),
    movable(60, "Corpus Christi"),
    fixed(9, 7, "Independência do Brasil"),
    fixed(10, 12, "Padroeira do Brasil"),
    fixed(11, 2, "Finados"),
    fixed(11, 15, "Proclamação da República"),
    fixed(11, 20, "Consciência Negra"),
    fixed(12, 25, "Natal"),
  ].sort((left, right) => (left.date < right.date ? -1 : 1));
}

export function nationalHolidayMarks(year: number, type: string): DayMark[] {
  return nationalHolidays(year).map((holiday) => ({ date: holiday.date, type, label: holiday.label, fixed: holiday.fixed }));
}
