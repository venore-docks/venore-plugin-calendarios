// Datas do calendário são sempre "YYYY-MM-DD" locais — nunca passam por Date com fuso, senão um
// servidor em UTC vê 31/12 onde o usuário em Curitiba marcou 01/01. Toda conta de calendário usa
// Date.UTC só como aritmética de dias (UTC não tem horário de verão).

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;

export type YearMonth = { year: number; month: number }; // month 1-12

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

const pad2 = (value: number) => String(value).padStart(2, "0");

export function isoDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;
}

export function parseIsoDate(value: string): { year: number; month: number; day: number } | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

export function parseYearMonth(value: string): YearMonth | null {
  const match = ISO_MONTH.exec(value);
  if (!match) return null;
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year: Number(match[1]), month } : null;
}

export function yearMonthKey({ year, month }: YearMonth): string {
  return `${String(year).padStart(4, "0")}-${pad2(month)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// 0 = domingo … 6 = sábado.
export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addDays(value: string, amount: number): string {
  const parsed = parseIsoDate(value);
  if (!parsed) throw new Error(`Data inválida: ${value}`);
  const shifted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day + amount));
  return isoDate(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

export function addMonths({ year, month }: YearMonth, amount: number): YearMonth {
  const index = year * 12 + (month - 1) + amount;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

// Os 12 meses exibidos, a partir do primeiro (YYYY-MM).
export function monthsFrom(startMonth: string, count = 12): YearMonth[] {
  const start = parseYearMonth(startMonth);
  if (!start) throw new Error(`Mês inicial inválido: ${startMonth}`);
  return Array.from({ length: count }, (_, index) => addMonths(start, index));
}

// "02/02" a partir de 2026-02-02 (formato das barras de período).
export function formatDayMonth(value: string): string {
  const parsed = parseIsoDate(value);
  return parsed ? `${pad2(parsed.day)}/${pad2(parsed.month)}` : value;
}

// "02/02/2026"
export function formatBrDate(value: string): string {
  const parsed = parseIsoDate(value);
  return parsed ? `${pad2(parsed.day)}/${pad2(parsed.month)}/${parsed.year}` : value;
}

export type GridCell = {
  date: string;
  day: number;
  // Dia de outro mês (cinza claro) — preenche a grade, não é marcação do mês.
  outside: boolean;
  weekday: number;
};

// Grade do mês: sempre 6 linhas × 7 colunas começando no domingo — é o modelo impresso (as semanas
// que sobram aparecem esmaecidas, mesmo quando a última linha é só do mês seguinte).
export function buildMonthGrid(year: number, month: number): GridCell[][] {
  const firstWeekday = weekdayOf(year, month, 1);
  const firstCell = addDays(isoDate(year, month, 1), -firstWeekday);
  const rows: GridCell[][] = [];
  for (let row = 0; row < 6; row += 1) {
    const cells: GridCell[] = [];
    for (let column = 0; column < 7; column += 1) {
      const date = addDays(firstCell, row * 7 + column);
      const parsed = parseIsoDate(date)!;
      cells.push({ date, day: parsed.day, outside: parsed.month !== month, weekday: column });
    }
    rows.push(cells);
  }
  return rows;
}

export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isWithin(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}
