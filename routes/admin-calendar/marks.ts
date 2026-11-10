import { MAX_CATEGORIES_PER_DATE, type CalendarContent, type DayMark } from "../../contracts/types";

// Edição das marcações de datas do calendário (puro, sem React — testado em marks.test.ts).
// O documento guarda só o que é DIFERENTE do calendário-base: marcações próprias que SOMAM às dele e
// exclusões (`type: null`, com `exclude` = a categoria do base a tirar; sem, todas as do base na data).
// Toda alteração numa data calcula o conjunto FINAL de categorias dela e grava só a diferença para o base
// (setDate): igual ao base = nada próprio; categoria nova = marcação própria; categoria do base que saiu =
// exclusão.

export type Brush = { kind: "type"; key: string } | { kind: "erase" };

const sortByDate = (marks: DayMark[]): DayMark[] =>
  marks
    .map((mark, index) => ({ mark, index }))
    .sort((left, right) => (left.mark.date < right.mark.date ? -1 : left.mark.date > right.mark.date ? 1 : left.index - right.index))
    .map(({ mark }) => mark);

const withoutDate = (marks: DayMark[], date: string): DayMark[] => marks.filter((mark) => mark.date !== date);
const onDate = (marks: DayMark[], date: string): DayMark[] => marks.filter((mark) => mark.date === date && mark.type !== null);
const sameDetails = (left: DayMark, right: DayMark) => left.label === right.label && Boolean(left.fixed) === Boolean(right.fixed);

// Grava o conjunto final de categorias de uma data como diferença em relação ao base.
export function setDate(own: DayMark[], base: CalendarContent | null, date: string, next: DayMark[]): DayMark[] {
  const rest = withoutDate(own, date);
  const inherited = onDate(base?.marks ?? [], date);
  const final = next.slice(0, MAX_CATEGORIES_PER_DATE);

  const out: DayMark[] = [];
  for (const mark of final) {
    const same = inherited.find((candidate) => candidate.type === mark.type);
    // Já vem do base do mesmo jeito: não grava de novo.
    if (same && sameDetails(same, mark)) continue;
    out.push(mark);
  }
  if (final.length === 0) {
    if (inherited.length > 0) out.push({ date, type: null });
  } else {
    for (const gone of inherited.filter((candidate) => !final.some((mark) => mark.type === candidate.type))) {
      out.push({ date, type: null, exclude: gone.type! });
    }
  }
  return sortByDate([...rest, ...out]);
}

// Aplica o pincel numa data.
// - modo "replace" (clique): a data passa a ter só a categoria do pincel — e clicar de novo na mesma
//   (data só com ela) apaga. Num intervalo (`toggle: false`) o que já é só ela fica como está.
// - modo "add" (Ctrl/Alt+clique): soma a categoria às que a data já tem (ou tira, se já tem), até 3.
// - borracha: limpa a data inteira (inclusive o que vem do base).
export function paintDate(
  own: DayMark[],
  base: CalendarContent | null,
  resolved: DayMark[],
  date: string,
  brush: Brush,
  options: { toggle: boolean; mode: "replace" | "add" } = { toggle: true, mode: "replace" },
): DayMark[] {
  if (brush.kind === "erase") return setDate(own, base, date, []);
  const current = onDate(resolved, date);
  const has = current.some((mark) => mark.type === brush.key);

  if (options.mode === "add") {
    if (has) return options.toggle ? setDate(own, base, date, current.filter((mark) => mark.type !== brush.key)) : own;
    if (current.length >= MAX_CATEGORIES_PER_DATE) return own;
    return setDate(own, base, date, [...current, { date, type: brush.key }]);
  }

  if (has && current.length === 1) return options.toggle ? setDate(own, base, date, []) : own;
  const kept = current.find((mark) => mark.type === brush.key);
  return setDate(own, base, date, [{ date, type: brush.key, ...(kept?.label ? { label: kept.label } : {}), ...(kept?.fixed ? { fixed: true } : {}) }]);
}

// Todas as datas entre duas (inclusive), na ordem — para pintar um intervalo com shift+clique.
export function datesBetween(from: string, to: string): string[] {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last && dates.length < 400) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

// Muda o nome (impresso) / "repete todo ano" de UMA categoria de uma data já marcada (própria ou
// herdada). Numa herdada grava a versão própria daquela categoria (sobrescreve a do base).
export function updateMarkDetails(
  own: DayMark[],
  base: CalendarContent | null,
  resolved: DayMark[],
  date: string,
  type: string,
  patch: { label?: string; fixed?: boolean },
): DayMark[] {
  const current = onDate(resolved, date);
  if (!current.some((mark) => mark.type === type)) return own;
  const next = current.map((mark) => {
    if (mark.type !== type) return mark;
    const changed: DayMark = { ...mark };
    if (patch.label !== undefined) {
      if (patch.label.trim() === "") delete changed.label;
      else changed.label = patch.label;
    }
    if (patch.fixed !== undefined) {
      if (patch.fixed) changed.fixed = true;
      else delete changed.fixed;
    }
    return changed;
  });
  return setDate(own, base, date, next);
}

// Tira UMA categoria de uma data (as outras ficam).
export function removeMark(own: DayMark[], base: CalendarContent | null, resolved: DayMark[], date: string, type: string): DayMark[] {
  return setDate(
    own,
    base,
    date,
    onDate(resolved, date).filter((mark) => mark.type !== type),
  );
}
