import type { CalendarContent, DayMark, MarkType } from "../contracts/types";
import { canonicalJson, emptyContent } from "../shared/content-schema";

// O Colégio Erasto Gaertner tem quatro calendários que repetem feriados, recessos e semana
// pedagógica. O seed 2026 chega com cada um completo (extraído do PDF); aqui se separa o que é
// comum — vira o calendário-base — do que é só de cada um. Garantia (testada): resolver
// "base + próprio" devolve exatamente o calendário original.

// Legenda unida: parte da mais longa e encaixa as categorias que faltam logo depois da anterior na
// lista de origem — assim cada calendário continua imprimindo a legenda na ordem do PDF dele.
export function mergeMarkTypes(lists: MarkType[][]): MarkType[] {
  const sorted = [...lists].sort((left, right) => right.length - left.length);
  const merged = (sorted[0] ?? []).map((type) => ({ ...type }));
  for (const list of sorted.slice(1)) {
    list.forEach((type, index) => {
      if (merged.some((candidate) => candidate.key === type.key)) return;
      const previous = list[index - 1];
      const at = previous ? merged.findIndex((candidate) => candidate.key === previous.key) + 1 : 0;
      merged.splice(at, 0, { ...type });
    });
  }
  return merged;
}

const keyOf = (mark: DayMark) => `${mark.date}|${mark.type}`;

export function deriveBase(contents: CalendarContent[]): { base: CalendarContent; children: CalendarContent[] } {
  const [first] = contents;
  if (!first) throw new Error("deriveBase precisa de ao menos um calendário.");

  const markTypes = mergeMarkTypes(contents.map((content) => content.markTypes));

  // A herança SOMA: vai pro base toda categoria de data que TODOS os calendários têm (o nome é o do
  // primeiro que tem um); cada calendário guarda só o que acrescenta.
  const sharedMarks: DayMark[] = first.marks
    .filter((mark) => contents.every((content) => content.marks.some((other) => keyOf(other) === keyOf(mark))))
    .map((mark) => {
      const named = contents.map((content) => content.marks.find((other) => keyOf(other) === keyOf(mark))).find((other) => other?.label);
      return { ...mark, ...(named?.label ? { label: named.label } : {}) };
    });
  const sharedByKey = new Map(sharedMarks.map((mark) => [keyOf(mark), mark]));

  const base: CalendarContent = {
    ...emptyContent(Number(first.yearText.slice(0, 4)) || new Date().getFullYear()),
    theme: first.theme,
    markTypes,
    marks: sharedMarks,
  };

  const children = contents.map((content) => ({
    ...content,
    // Categorias iguais às do base não se repetem; só as que diferem (ou não existem lá).
    markTypes: content.markTypes.filter((type) => !markTypes.some((candidate) => canonicalJson(candidate) === canonicalJson(type))),
    // Só o que acrescenta ao base: categorias novas na data ou com nome/"todo ano" diferente do dele.
    marks: content.marks.filter((mark) => {
      const shared = sharedByKey.get(keyOf(mark));
      return !shared || canonicalJson(shared) !== canonicalJson(mark);
    }),
  }));
  return { base, children };
}
