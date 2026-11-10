import { z } from "zod";
import { MAX_CATEGORIES_PER_DATE, type CalendarContent, type DateRange, type DayMark, type MarkType } from "../contracts/types";
import { daysInMonth, isValidIsoDate, isoDate, parseIsoDate, parseYearMonth } from "./engine/dates";
import { nationalHolidays } from "./engine/holidays";

// Validação do documento inteiro no salvar (vem do editor, cliente). O texto é livre: o render
// escapa tudo (shared/render/rich-text.ts). Cores vão direto pro CSS do PDF — só #rrggbb.
const id = z.string().min(1).max(64);
const shortText = z.string().max(500);
const longText = z.string().max(10_000);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const isoDay = z.string().refine(isValidIsoDate, "Data inválida");
const isoMonth = z.string().refine((value) => parseYearMonth(value) !== null, "Mês inválido");

const markType = z.object({
  key: z.string().regex(/^[a-z0-9][a-z0-9-]{0,63}$/),
  label: shortText,
  color: hexColor,
  effect: z.enum(["off", "on", "none"]),
  legend: z.boolean(),
}) satisfies z.ZodType<MarkType>;

const dayMark = z.object({
  date: isoDay,
  type: z.string().min(1).max(64).nullable(),
  exclude: z.string().min(1).max(64).optional(),
  label: shortText.optional(),
  fixed: z.boolean().optional(),
}) satisfies z.ZodType<DayMark>;

const dateRange = z
  .object({ label: shortText, start: isoDay, end: isoDay })
  .refine((range) => range.start <= range.end, "O fim vem antes do início") satisfies z.ZodType<DateRange>;

export const calendarContentSchema = z.object({
  title: shortText,
  yearText: z.string().max(40),
  subtitle: shortText,
  startMonth: isoMonth,
  headerImageMediaId: id.nullable(),
  logoMediaId: id.nullable(),
  theme: z.object({ primary: hexColor, accent: hexColor, header: hexColor, titleColor: hexColor.optional(), discColor: hexColor.optional() }),
  display: z.object({ legend: z.boolean(), monthNotes: z.boolean(), schoolDayCounts: z.boolean(), semesterTotals: z.boolean() }),
  markTypes: z.array(markType).max(40),
  marks: z.array(dayMark).max(1500).superRefine((marks, context) => {
    const byDate = new Map<string, DayMark[]>();
    for (const mark of marks) byDate.set(mark.date, [...(byDate.get(mark.date) ?? []), mark]);
    for (const [date, onDate] of byDate) {
      const added = onDate.filter((mark) => mark.type !== null).map((mark) => mark.type);
      const exclusions = onDate.filter((mark) => mark.type === null);
      if (new Set(added).size !== added.length) context.addIssue({ code: "custom", message: `${date}: categoria repetida` });
      if (added.length > MAX_CATEGORIES_PER_DATE) context.addIssue({ code: "custom", message: `${date}: mais de ${MAX_CATEGORIES_PER_DATE} categorias` });
      if (exclusions.filter((mark) => !mark.exclude).length > 1) context.addIssue({ code: "custom", message: `${date}: exclusão da data repetida` });
      if (onDate.some((mark) => mark.type !== null && mark.exclude)) context.addIssue({ code: "custom", message: `${date}: 'exclude' só vale em exclusão` });
    }
  }),
  periods: z.array(dateRange).max(12),
  semesters: z.array(dateRange).max(6),
  infoText: longText,
  signature: z.array(shortText).max(6),
  noteOverrides: z.record(isoMonth, longText),
}) satisfies z.ZodType<CalendarContent>;

export function parseCalendarContent(value: unknown): CalendarContent | null {
  const parsed = calendarContentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

// JSON com chaves ordenadas: o jsonb do Postgres devolve as chaves dos objetos em outra ordem, então
// JSON.stringify puro acusaria "mudou" comparando o salvo com o mesmo conteúdo vindo do editor.
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) =>
    inner && typeof inner === "object" && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : inner,
  );
}

// Problema que o editor consegue explicar em português antes de tentar salvar (o zod só diz
// "inválido"). null = nada a apontar.
export function findContentProblem(content: CalendarContent): string | null {
  for (const [kind, ranges] of [["faixa do rodapé", content.periods], ["semestre", content.semesters]] as const) {
    for (const range of ranges) {
      const name = range.label.trim() || kind;
      if (!range.start || !range.end) return `Preencha o início e o fim de “${name}”.`;
      if (range.start > range.end) return `Em “${name}”, o fim vem antes do início.`;
    }
  }
  const keys = new Set<string>();
  for (const type of content.markTypes) {
    if (!type.label.trim()) return "Toda categoria precisa de um nome.";
    if (keys.has(type.key)) return `A categoria “${type.label}” está repetida.`;
    keys.add(type.key);
  }
  return null;
}

export function isSameContent(left: CalendarContent, right: CalendarContent): boolean {
  return canonicalJson(left) === canonicalJson(right);
}

export const DEFAULT_THEME = { primary: "#006b82", accent: "#f7a600", header: "#6a9cb3" } as const;

// Categorias de partida de um calendário novo (as do modelo de 2026 do Colégio).
export const DEFAULT_MARK_TYPES: MarkType[] = [
  { key: "inicio-termino-aulas", label: "Início e Término das aulas", color: "#e8465f", effect: "none", legend: true },
  { key: "feriado", label: "Feriado", color: "#f7a600", effect: "off", legend: true },
  { key: "sabado-letivo", label: "Sábado Letivo", color: "#00697f", effect: "on", legend: true },
  { key: "semana-pedagogica", label: "Semana Pedagógica", color: "#2fb5c9", effect: "off", legend: true },
  { key: "recesso", label: "Recesso para alunos", color: "#7ac143", effect: "off", legend: true },
];

export function emptyContent(year: number, overrides: Partial<CalendarContent> = {}): CalendarContent {
  return {
    title: "CALENDÁRIO",
    yearText: String(year),
    subtitle: "",
    startMonth: `${year}-01`,
    headerImageMediaId: null,
    logoMediaId: null,
    theme: { ...DEFAULT_THEME },
    display: { legend: true, monthNotes: false, schoolDayCounts: true, semesterTotals: true },
    markTypes: DEFAULT_MARK_TYPES.map((type) => ({ ...type })),
    marks: [],
    periods: [],
    semesters: [],
    infoText: "",
    signature: [],
    noteOverrides: {},
    ...overrides,
  };
}

function shiftDate(value: string, deltaYears: number): string {
  const parsed = parseIsoDate(value);
  if (!parsed) return value;
  const year = parsed.year + deltaYears;
  return isoDate(year, parsed.month, Math.min(parsed.day, daysInMonth(year, parsed.month)));
}

function findHolidayTypeKey(content: CalendarContent): string | null {
  const byKey = content.markTypes.find((type) => type.key === "feriado");
  if (byKey) return byKey.key;
  return content.markTypes.find((type) => /feriado/i.test(type.label))?.key ?? null;
}

// "Iniciar próximo ano": leva a estrutura (categorias, textos, aparência, assinatura) e recomeça as
// datas — feriados nacionais do novo ano são calculados (Carnaval, Sexta-feira Santa e Corpus
// Christi mudam todo ano), feriados de data fixa do setor (marcados `fixed`, ex.: 08/09) vão
// para o mesmo dia, e os períodos/semestres só deslocam um ano (a escola ajusta). Sábados
// letivos, recessos e o resto precisam ser marcados de novo.
export function carryContentToYear(
  content: CalendarContent,
  fromYear: number,
  toYear: number,
  // false num calendário que herda de um base: os feriados já vêm de lá.
  options: { generateHolidays: boolean } = { generateHolidays: true },
): CalendarContent {
  const delta = toYear - fromYear;
  const start = parseYearMonth(content.startMonth);
  const holidayType = options.generateHolidays ? findHolidayTypeKey(content) : null;

  const marks = new Map<string, DayMark>();
  for (const mark of content.marks) {
    if (mark.type !== null && mark.fixed) marks.set(shiftDate(mark.date, delta), { ...mark, date: shiftDate(mark.date, delta) });
  }
  if (holidayType) {
    for (const holiday of nationalHolidays(toYear)) {
      marks.set(holiday.date, { date: holiday.date, type: holidayType, label: holiday.label, fixed: holiday.fixed });
    }
  }

  const shiftRange = (range: DateRange): DateRange => ({
    ...range,
    start: shiftDate(range.start, delta),
    end: shiftDate(range.end, delta),
  });

  return {
    ...content,
    yearText: content.yearText.replaceAll(String(fromYear), String(toYear)),
    startMonth: start ? `${start.year + delta}-${String(start.month).padStart(2, "0")}` : `${toYear}-01`,
    marks: [...marks.values()].sort((left, right) => (left.date < right.date ? -1 : 1)),
    periods: content.periods.map(shiftRange),
    semesters: content.semesters.map(shiftRange),
    noteOverrides: {},
  };
}
