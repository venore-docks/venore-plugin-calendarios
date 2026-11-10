import { describe, expect, it } from "vitest";
import { countSchoolDays } from "../shared/engine/school-days";
import { resolveContent } from "../shared/engine/resolve";
import { CALENDARIOS_2026 } from "./data/calendarios-2026";
import { deriveBase } from "./derive-base";

const byDateType = <T extends { date: string; type: string | null }>(marks: T[]) => [...marks].sort((left, right) => (left.date + left.type).localeCompare(right.date + right.type));
const erasto = CALENDARIOS_2026.filter((calendar) => calendar.sector === "colegio-erasto-gaertner");

describe("seed 2026 — calendário-base do Colégio", () => {
  const { base, children } = deriveBase(erasto.map((calendar) => calendar.content));

  it("base + próprio reproduz exatamente cada calendário original (datas, nomes e legenda)", () => {
    erasto.forEach((calendar, index) => {
      const resolved = resolveContent(children[index]!, base);
      expect(byDateType(resolved.marks), calendar.slug).toEqual(byDateType(calendar.content.marks));
      // Mesmos tipos, na ordem em que o calendário imprime a legenda (só as usadas aparecem).
      const used = new Set(calendar.content.marks.map((mark) => mark.type));
      const printed = (types: typeof resolved.markTypes) => types.filter((type) => used.has(type.key)).map((type) => type.key);
      expect(printed(resolved.markTypes), calendar.slug).toEqual(printed(calendar.content.markTypes));
    });
  });

  it("o que é comum mora no base (feriados, recesso) e os filhos ficam enxutos", () => {
    expect(base.marks.map((mark) => mark.label)).toEqual(expect.arrayContaining(["Carnaval", "Sexta-feira Santa", "Natal"]));
    erasto.forEach((calendar, index) => expect(children[index]!.marks.length, calendar.slug).toBeLessThan(calendar.content.marks.length));
    expect(base.marks.length).toBeGreaterThan(30);
  });
});

// Os PDFs de 2026 são a REPRESENTAÇÃO dos calendários; o plugin calcula os dias letivos pelas datas. Nos
// quatro calendários cujas datas reproduzem o impresso, os totais viram teste de regressão do motor.
describe("seed 2026 — o motor de dias letivos reproduz os totais dos calendários de referência", () => {
  const expected: Record<string, number[]> = {
    "erasto-educacao-infantil": [101, 99],
    "erasto-ensino-fundamental-i": [102, 98],
    "erasto-medio-hunters": [105, 95],
    "fidelis-presencial": [101, 99],
  };
  it.each(Object.entries(expected))("%s", (slug, totals) => {
    const calendar = CALENDARIOS_2026.find((candidate) => candidate.slug === slug)!;
    expect(countSchoolDays(calendar.content).perSemester).toEqual(totals);
  });

  it("todos os calendários do seed têm semestres e dias letivos calculados", () => {
    for (const calendar of CALENDARIOS_2026) {
      const { perSemester } = countSchoolDays(calendar.content);
      expect(perSemester.length, calendar.slug).toBeGreaterThan(0);
      expect(perSemester.every((total) => total > 0), calendar.slug).toBe(true);
    }
  });

  it("meses do Fundamental I, mês a mês", () => {
    const calendar = CALENDARIOS_2026.find((candidate) => candidate.slug === "erasto-ensino-fundamental-i")!;
    const { perMonth } = countSchoolDays(calendar.content);
    expect(perMonth).toEqual({
      "2026-02": 17, "2026-03": 22, "2026-04": 19, "2026-05": 21, "2026-06": 20, "2026-07": 10,
      "2026-08": 22, "2026-09": 20, "2026-10": 20, "2026-11": 21, "2026-12": 8,
    });
  });
});
