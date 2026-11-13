import type { CalendarContent, MarkType } from "../../contracts/types";
import { buildMonthGrid, formatDayMonth, monthsFrom, MONTH_NAMES, parseYearMonth, type YearMonth } from "../engine/dates";
import { buildMonthNoteItems } from "../engine/notes";
import { groupMarksByDate, legendTypes } from "../engine/resolve";
import { countSchoolDays } from "../engine/school-days";
import { circleBackground } from "./circle";
import { MONTSERRAT_FONT_FACES } from "./fonts.generated";
import { escapeHtml, renderRichText } from "./rich-text";

// O calendário do modelo de 2026 (PDFs do marketing do Colégio Erasto Gaertner e da Faculdade
// Fidelis) refeito em HTML pra imprimir no Chromium. As posições são as dos PDFs originais, medidas
// em pt na página A4 (595.276 × 841.89) — ver CLAUDE.md. Fonte única: Montserrat (o original mistura
// Gotham, licenciada, com Montserrat).
//
// Dois modos de página, escolhidos por `display.monthNotes`:
// - compacto (Erasto): meses numa grade fixa e, embaixo, caixa de horário, faixas de período,
//   legenda, totais e assinatura;
// - com notas (Fidelis): cabeçalho mais baixo, notas escritas sob cada mês e totais no rodapé.
// Esta CSS tem cor/pt/fonte crus de propósito (é um documento, não segue o tema do portal).

export type RenderAssets = {
  // data: URI já carregado (o render não tem rede).
  header: string | null;
  logo: string | null;
};

const PAGE_WIDTH = 595.276;
const PAGE_HEIGHT = 841.89;
const COLUMN_X = [28.35, 166.54, 304.72, 442.91];
const BLOCK_WIDTH = 124.02;
const CONTENT_WIDTH = 538.58;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

type Mode = {
  notes: boolean;
  // Cabeçalho (silhueta da foto, título) sobe este tanto no modo com notas.
  headerShift: number;
  cellPitch: number;
  photoHeight: number;
  disc: { x: number; y: number; r: number };
  titleTop: number;
  subtitleTop: number;
  firstRowY: number;
  // Largura máxima do logo dentro do disco (fração do diâmetro).
  logoScale: number;
};

const COMPACT: Mode = {
  notes: false,
  headerShift: 0,
  cellPitch: 17.43,
  photoHeight: 143.6,
  disc: { x: 122.5, y: 82, r: 45.5 },
  titleTop: 134.45,
  subtitleTop: 162.56,
  firstRowY: 194.94,
  logoScale: 0.7,
};
const WITH_NOTES: Mode = {
  notes: true,
  headerShift: -22.68,
  cellPitch: 18.1,
  photoHeight: 121.0,
  disc: { x: 122.25, y: 64.85, r: 44.75 },
  titleTop: 111.78,
  subtitleTop: 139.88,
  firstRowY: 157.41,
  // O logo da Fidelis ocupa ~84% do disco no PDF do marketing.
  logoScale: 0.8,
};

const color = (value: string | undefined, fallback: string) => (value && HEX_COLOR.test(value) ? value : fallback);

const STYLE = `${MONTSERRAT_FONT_FACES}
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Montserrat", "Helvetica", sans-serif; }
.page { position: relative; width: ${PAGE_WIDTH}pt; height: ${PAGE_HEIGHT}pt; overflow: hidden; background: #fff; }
.abs { position: absolute; margin: 0; white-space: nowrap; }
.hdr { position: absolute; left: 0; top: 0; }
.title { font-weight: 700; font-size: 23pt; line-height: 30.87pt; left: 28.35pt; }
.title .yr { font-weight: 800; font-style: italic; }
.subtitle { font-weight: 600; font-size: 10pt; line-height: 13.29pt; left: 28.35pt; color: #231f20; }
.disc { position: absolute; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.disc img { display: block; }
.month { position: absolute; width: ${BLOCK_WIDTH}pt; }
.month .name { position: absolute; left: 0; right: 0; top: 0; text-align: center; font-size: 9pt; line-height: 9.69pt; font-weight: 400; }
.month .rule { position: absolute; left: 0; right: 0; top: 11.46pt; height: 0.5pt; }
.month .count { position: absolute; left: 0; right: 0; top: 13.13pt; text-align: center; font-size: 6pt; line-height: 6.46pt; font-weight: 400; }
.month .band { position: absolute; left: 0; top: 20.42pt; width: ${BLOCK_WIDTH}pt; height: 15.69pt; color: #fff; }
.month .band, .month .grid { display: grid; grid-template-columns: repeat(7, var(--pitch)); justify-content: start; padding-left: 0.9pt; }
.month .band span { text-align: center; font-weight: 700; font-size: 8pt; line-height: 15.69pt; }
.month .grid { position: absolute; left: 0; top: 38.39pt; width: ${BLOCK_WIDTH}pt; background: linear-gradient(#fff, #fefcf6); }
.month .d { height: var(--pitch); display: flex; align-items: center; justify-content: center; font-style: italic; font-weight: 500; font-size: 8.3pt; color: #808285; }
.month .d.sun { color: #e98a90; }
.month .d.out { color: #e2e3e4; }
.month .d i { display: flex; align-items: center; justify-content: center; width: 15.5pt; height: 15.5pt; border-radius: 50%; font-style: italic; color: #fff; }
.month .notes { position: absolute; left: 0; width: ${BLOCK_WIDTH}pt; font-size: var(--nf, 5pt); line-height: var(--nl, 6pt); font-weight: 400; color: #231f20; white-space: normal; }
.month .notes b { font-weight: 700; }
.info { position: absolute; left: 28.35pt; top: 649.13pt; width: ${CONTENT_WIDTH}pt; height: 60.15pt; padding: 0 8.5pt; display: flex; flex-direction: column; justify-content: center; font-weight: 300; font-size: 8pt; line-height: 9.6pt; }
.info b { font-weight: 700; }
.bar { position: absolute; top: 718.6pt; height: 17pt; color: #fff; text-align: center; font-weight: 600; font-size: 7pt; line-height: 17pt; white-space: nowrap; }
.label { font-weight: 700; font-size: 7pt; line-height: 9.39pt; color: #000; }
.legend-col { position: absolute; top: 759.2pt; width: 130pt; }
.legend-item { display: flex; gap: 2.83pt; font-weight: 300; font-size: 6.5pt; line-height: 9pt; color: #231f20; }
.legend-item i { flex: none; width: 5.67pt; height: 5.67pt; margin-top: 1.9pt; }
.total { position: absolute; width: ${BLOCK_WIDTH}pt; height: 14.17pt; color: #fff; text-align: center; font-weight: 600; font-size: 7pt; line-height: 14.17pt; white-space: nowrap; }
.sign-rule { position: absolute; left: 452.83pt; width: 104.18pt; height: 0.5pt; background: #453e3c; }
.sign { position: absolute; left: 452.83pt; width: 104.18pt; text-align: center; font-weight: 300; font-size: 7pt; line-height: 7pt; color: #231f20; white-space: nowrap; }
.footer { position: absolute; left: 0; top: 0; }`;

export function renderCalendarDocument(content: CalendarContent, assets: RenderAssets): string {
  const mode = content.display.monthNotes ? WITH_NOTES : COMPACT;
  const primary = color(content.theme.primary, "#006b82");
  const accent = color(content.theme.accent, "#f7a600");
  const header = color(content.theme.header, "#6a9cb3");
  const titleColor = color(content.theme.titleColor, primary);
  const discColor = color(content.theme.discColor, primary);
  const soft = `color-mix(in srgb, ${primary} 85%, #fff)`;

  const months = monthsFrom(content.startMonth);
  const firstYear = parseYearMonth(content.startMonth)?.year ?? months[0]!.year;
  const counts = countSchoolDays(content);
  const typeByKey = new Map<string, MarkType>(content.markTypes.map((type) => [type.key, type]));
  const typesByDate = new Map<string, MarkType[]>();
  for (const [date, marks] of groupMarksByDate(content.marks)) {
    const types = marks.flatMap((mark) => (typeByKey.get(mark.type!) ? [typeByKey.get(mark.type!)!] : []));
    if (types.length > 0) typesByDate.set(date, types);
  }

  const { ys: rowYs, noteScale } = monthRowPositions(content, mode, months);
  const pieces = [
    renderHeader(mode, assets, primary),
    renderTitle(content, mode, titleColor, accent),
    renderDisc(mode, assets, discColor),
    ...months.map((month, index) => renderMonth(content, mode, month, firstYear, index, rowYs, noteScale, counts.perMonth, typesByDate, typeByKey, { primary, header })),
    mode.notes ? "" : renderInfo(content, primary, soft, header),
    mode.notes ? "" : renderBars(content, accent),
    mode.notes ? "" : renderLegend(content),
    renderTotals(content, mode, counts.perSemester, soft),
    renderSignature(content, mode),
    `<svg class="footer" width="${PAGE_WIDTH}pt" height="${PAGE_HEIGHT}pt" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}"><polygon points="313.07,826.58 265.77,841.89 595.28,841.89 595.28,826.58" fill="${primary}"/></svg>`,
  ];

  return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="UTF-8">
<style>${STYLE}</style>
</head>
<body><div class="page" style="color: ${primary}">${pieces.join("")}</div></body>
</html>`;
}

// Silhueta do cabeçalho: foto recortada por uma onda (curva de Bézier medida no PDF). Sem foto, a
// silhueta fica chapada na cor principal.
function renderHeader(mode: Mode, assets: RenderAssets, primary: string): string {
  const base = 125.49 + mode.headerShift;
  const wave = `M0,-30 H${PAGE_WIDTH} V${base} C${PAGE_WIDTH},${base} 476.76,${base + 40.8} 297.64,${base} C99.17,${base - 45.22} 0,${base} 0,${base} Z`;
  const picture = assets.header
    ? `<image href="${escapeHtml(assets.header)}" x="0" y="0" width="${PAGE_WIDTH}" height="${mode.photoHeight}" preserveAspectRatio="xMidYMid slice" clip-path="url(#wave)"/>`
    : `<path d="${wave}" fill="${primary}"/>`;
  return `<svg class="hdr" width="${PAGE_WIDTH}pt" height="170pt" viewBox="0 0 ${PAGE_WIDTH} 170"><defs><clipPath id="wave"><path d="${wave}"/></clipPath></defs>${picture}</svg>`;
}

function renderTitle(content: CalendarContent, mode: Mode, titleColor: string, accent: string): string {
  const subtitle = content.subtitle.trim();
  return (
    `<p class="abs title" style="top:${mode.titleTop}pt;color:${titleColor}">${escapeHtml(content.title)} <span class="yr" style="color:${accent}">${escapeHtml(content.yearText)}</span></p>` +
    (subtitle ? `<p class="abs subtitle" style="top:${mode.subtitleTop}pt">${escapeHtml(subtitle)}</p>` : "")
  );
}

function renderDisc(mode: Mode, assets: RenderAssets, discColor: string): string {
  if (!assets.logo) return "";
  const { x, y, r } = mode.disc;
  return `<div class="disc" style="left:${x - r}pt;top:${y - r}pt;width:${r * 2}pt;height:${r * 2}pt;background:${discColor}"><img src="${escapeHtml(assets.logo)}" alt="" style="max-width:${mode.logoScale * 100}%;max-height:${mode.logoScale * 100}%"></div>`;
}

// Notas dos meses: 5 pt / 6 pt de entrelinha, e encolhem (como no PDF do marketing, que desce até 4,66 pt)
// quando o ano tem muito texto. O último texto termina em NOTES_BOTTOM (o original: no máx. 759 pt), deixando
// ar até "TOTAL DE DIAS LETIVOS" (784 pt) e a assinatura (792 pt); entre as linhas de meses sobra ao menos MIN_ROW_GAP.
const NOTE_FONT = 5;
const NOTE_LINE = 6;
const MIN_NOTE_SCALE = 0.8;
const NOTES_BOTTOM = 762;
const MIN_ROW_GAP = 8;

// Altura estimada das notas de um mês, em linhas (nota longa quebra: ~44 caracteres por linha a 5 pt).
function noteLines(content: CalendarContent, month: YearMonth, scale: number): number {
  const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
  const perLine = 44 / scale;
  return buildMonthNoteItems(content, key).reduce((lines, note) => lines + Math.max(1, Math.ceil(`${note.days} - ${note.text}`.length / perLine)), 0);
}

type RowLayout = { ys: number[]; noteScale: number };

// Y de cada uma das 3 linhas de meses. Compacto: grade fixa. Com notas: cada linha ocupa a grade +
// as notas mais longas da linha; a sobra da página é repartida entre as linhas e, se não couber, as notas encolhem.
function monthRowPositions(content: CalendarContent, mode: Mode, months: YearMonth[]): RowLayout {
  if (!mode.notes) return { ys: [0, 1, 2].map((row) => mode.firstRowY + row * 150.81), noteScale: 1 };
  const gridHeight = 38.39 + 6 * mode.cellPitch;
  const needsAt = (scale: number) =>
    [0, 1, 2].map((row) => gridHeight + 2 + NOTE_LINE * scale * Math.max(0, ...months.slice(row * 4, row * 4 + 4).map((month) => noteLines(content, month, scale))));
  const total = (needs: number[]) => needs.reduce((sum, need) => sum + need, 0);
  const available = NOTES_BOTTOM - mode.firstRowY;

  let noteScale = 1;
  while (noteScale > MIN_NOTE_SCALE && total(needsAt(noteScale)) + 2 * MIN_ROW_GAP > available) noteScale = Math.round((noteScale - 0.01) * 100) / 100;
  const needs = needsAt(noteScale);
  const gap = Math.min(60, Math.max(4, (available - total(needs)) / 2));
  const ys = [mode.firstRowY];
  for (let row = 1; row < 3; row += 1) ys.push(ys[row - 1]! + needs[row - 1]! + gap);
  return { ys, noteScale };
}

function renderMonth(
  content: CalendarContent,
  mode: Mode,
  month: YearMonth,
  firstYear: number,
  index: number,
  rowYs: number[],
  noteScale: number,
  perMonth: Record<string, number>,
  typesByDate: Map<string, MarkType[]>,
  typeByKey: Map<string, MarkType>,
  colors: { primary: string; header: string },
): string {
  const key = `${month.year}-${String(month.month).padStart(2, "0")}`;
  const x = COLUMN_X[index % 4]!;
  const y = rowYs[Math.floor(index / 4)]!;
  const name = `${MONTH_NAMES[month.month - 1]}${month.year !== firstYear ? ` ${month.year}` : ""}`;
  const days = perMonth[key];

  const cells = buildMonthGrid(month.year, month.month)
    .flat()
    .map((cell) => {
      const types = cell.outside ? undefined : typesByDate.get(cell.date);
      const classes = ["d", cell.outside ? "out" : cell.weekday === 0 ? "sun" : ""].filter(Boolean).join(" ");
      const inner = types ? `<i style="background:${circleBackground(types.slice(0, 3).map((type) => color(type.color, "#999999")))}">${cell.day}</i>` : String(cell.day);
      return `<div class="${classes}">${inner}</div>`;
    })
    .join("");

  const notes = content.display.monthNotes
    ? buildMonthNoteItems(content, key)
        .map((note) => {
          const swatch = color(note.typeKey ? typeByKey.get(note.typeKey)?.color : undefined, "#231f20");
          return note.days
            ? `<div><b style="color:${swatch}">${escapeHtml(note.days)}</b> - ${escapeHtml(note.text)}</div>`
            : `<div>${escapeHtml(note.text)}</div>`;
        })
        .join("")
    : "";

  return `<div class="month" style="left:${x}pt;top:${y}pt;--pitch:${mode.cellPitch}pt;--nf:${NOTE_FONT * noteScale}pt;--nl:${NOTE_LINE * noteScale}pt;color:${colors.primary}">
<div class="name">${escapeHtml(name)}</div><div class="rule" style="background:${colors.primary}"></div>
${content.display.schoolDayCounts && days ? `<div class="count">${days} ${days === 1 ? "dia letivo" : "dias letivos"}</div>` : ""}
<div class="band" style="background:${colors.header}">${["D", "S", "T", "Q", "Q", "S", "S"].map((label) => `<span>${label}</span>`).join("")}</div>
<div class="grid">${cells}</div>
${notes ? `<div class="notes" style="top:${38.39 + 6 * mode.cellPitch + 1}pt">${notes}</div>` : ""}
</div>`;
}

function renderInfo(content: CalendarContent, primary: string, soft: string, header: string): string {
  const lines = content.infoText.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return "";
  const body = lines.map((line, index) => `<div style="color:${index === 0 ? primary : soft}">${renderRichText(line)}</div>`).join("");
  return `<div class="info" style="background:color-mix(in srgb, ${header} 22%, #fff)">${body}</div>`;
}

function renderBars(content: CalendarContent, accent: string): string {
  const count = content.periods.length;
  if (count === 0) return "";
  const gap = 14.17;
  const width = (CONTENT_WIDTH - gap * (count - 1)) / count;
  return content.periods
    .map((period, index) => {
      const text = `${period.label} - ${formatDayMonth(period.start)} até ${formatDayMonth(period.end)}`;
      return `<div class="bar" style="left:${28.35 + index * (width + gap)}pt;width:${width}pt;background:color-mix(in srgb, ${accent} 70%, #fff)">${escapeHtml(text)}</div>`;
    })
    .join("");
}

function renderLegend(content: CalendarContent): string {
  if (!content.display.legend) return "";
  const types = legendTypes(content);
  if (types.length === 0) return "";
  const perColumn = Math.max(5, Math.ceil(types.length / 2));
  const columns = [types.slice(0, perColumn), types.slice(perColumn)].filter((column) => column.length > 0);
  const items = columns
    .map(
      (column, index) =>
        `<div class="legend-col" style="left:${COLUMN_X[index]}pt">${column
          .map((type) => `<div class="legend-item"><i style="background:${color(type.color, "#999999")}"></i><span>${escapeHtml(type.label)}</span></div>`)
          .join("")}</div>`,
    )
    .join("");
  return `<p class="abs label" style="left:28.35pt;top:744.17pt">LEGENDA</p>${items}`;
}

function renderTotals(content: CalendarContent, mode: Mode, perSemester: number[], soft: string): string {
  if (!content.display.semesterTotals || content.semesters.length === 0) return "";
  const boxes = content.semesters
    .map((semester, index) => {
      const text = `${semester.label.toUpperCase()}: ${perSemester[index] ?? 0}`;
      const position = mode.notes
        ? `left:${COLUMN_X[index % 4]}pt;top:799.37pt`
        : `left:${COLUMN_X[2]}pt;top:${768.98 + index * 18.71}pt`;
      return `<div class="total" style="${position};background:${soft}">${escapeHtml(text)}</div>`;
    })
    .join("");
  const label = mode.notes ? `left:28.35pt;top:783.9pt` : `left:${COLUMN_X[2]}pt;top:753.52pt`;
  return `<p class="abs label" style="${label}">TOTAL DE DIAS LETIVOS</p>${boxes}`;
}

function renderSignature(content: CalendarContent, mode: Mode): string {
  const lines = content.signature.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return "";
  const shift = mode.notes ? 9.86 : 0;
  return (
    `<div class="sign-rule" style="top:${782.65 + shift}pt"></div>` +
    lines.map((line, index) => `<div class="sign" style="top:${783 + shift + index * 7}pt">${escapeHtml(line)}</div>`).join("")
  );
}
