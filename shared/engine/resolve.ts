import type { CalendarContent, DayMark, MarkType } from "../../contracts/types";

// Herança do calendário-base: só categorias (legenda) e marcações de datas herdam. O resto (período,
// textos, aparência) é de cada calendário. O PDF e a revisão aprovada usam sempre o conteúdo
// RESOLVIDO, por isso uma mudança posterior no base não altera o que já foi aprovado.
//
// - Categoria própria com a mesma key do base substitui a do base (na mesma posição da legenda).
// - Data: as marcações do calendário SOMAM às do base (férias no base + reunião de conselho no
//   calendário = as duas). Própria com o mesmo tipo do base a sobrescreve (nome, "todo ano").
//   Exclusão (`type: null`) tira marcações do base: com `exclude`, só aquela categoria da data; sem, todas
//   as do base naquela data.
export function resolveContent(own: CalendarContent, base: CalendarContent | null): CalendarContent {
  const types = new Map<string, MarkType>();
  for (const type of base?.markTypes ?? []) types.set(type.key, type);
  for (const type of own.markTypes) types.set(type.key, type);

  const clearedDates = new Set<string>();
  const excluded = new Set<string>();
  const ownKeys = new Set<string>();
  for (const mark of own.marks) {
    if (mark.type === null) {
      if (mark.exclude) excluded.add(`${mark.date}|${mark.exclude}`);
      else clearedDates.add(mark.date);
    } else {
      ownKeys.add(`${mark.date}|${mark.type}`);
    }
  }

  const marks: DayMark[] = [
    ...(base?.marks ?? []).filter((mark) => {
      if (mark.type === null || clearedDates.has(mark.date)) return false;
      const key = `${mark.date}|${mark.type}`;
      return !excluded.has(key) && !ownKeys.has(key);
    }),
    ...own.marks.filter((mark) => mark.type !== null),
  ];

  return {
    ...own,
    markTypes: [...types.values()],
    // Mesma data: a ordem em que foram marcadas (a do base primeiro; a primeira é a categoria principal).
    marks: marks
      .map((mark, index) => ({ mark, index }))
      .sort((left, right) => (left.mark.date < right.mark.date ? -1 : left.mark.date > right.mark.date ? 1 : left.index - right.index))
      .map(({ mark }) => mark),
  };
}

// Marcações (já resolvidas) de uma data, agrupadas — a tela e o render pintam o círculo com todas.
export function groupMarksByDate(marks: DayMark[]): Map<string, DayMark[]> {
  const byDate = new Map<string, DayMark[]>();
  for (const mark of marks) {
    if (mark.type === null) continue;
    const bucket = byDate.get(mark.date) ?? [];
    bucket.push(mark);
    byDate.set(mark.date, bucket);
  }
  return byDate;
}

// Legenda impressa: categorias marcadas como "aparece na legenda" que de fato têm ao menos um dia
// neste calendário — herdar do base não deve encher a legenda de categorias que não foram usadas.
export function legendTypes(content: CalendarContent): MarkType[] {
  const used = new Set(content.marks.flatMap((mark) => (mark.type === null ? [] : [mark.type])));
  return content.markTypes.filter((type) => type.legend && used.has(type.key));
}
