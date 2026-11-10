import { describe, expect, it } from "vitest";
import type { CalendarContent, MarkType } from "../../contracts/types";
import { carryContentToYear, emptyContent } from "../content-schema";
import { addDays, buildMonthGrid, monthsFrom, parseIsoDate, weekdayOf } from "./dates";
import { easterSunday, nationalHolidays } from "./holidays";
import { buildMonthNotes, formatDayList } from "./notes";
import { legendTypes, resolveContent } from "./resolve";
import { countSchoolDays } from "./school-days";

const type = (key: string, effect: MarkType["effect"], legend = true): MarkType => ({ key, label: key, color: "#112233", effect, legend });

const content = (patch: Partial<CalendarContent>): CalendarContent => ({
  ...emptyContent(2026),
  markTypes: [type("feriado", "off"), type("sabado", "on"), type("bimestre", "none")],
  ...patch,
});

describe("datas", () => {
  it("calcula dia da semana e soma dias sem depender de fuso", () => {
    expect(weekdayOf(2026, 1, 1)).toBe(4); // quinta
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(parseIsoDate("2026-02-30")).toBeNull();
  });

  it("monta a grade de 6 linhas começando no domingo, com os dias de fora marcados", () => {
    const grid = buildMonthGrid(2026, 1);
    expect(grid).toHaveLength(6);
    expect(grid.every((row) => row.length === 7)).toBe(true);
    // Janeiro/2026 começa na quinta: domingo da 1ª linha é 28/12.
    expect(grid[0]![0]).toMatchObject({ date: "2025-12-28", day: 28, outside: true });
    expect(grid[0]![4]).toMatchObject({ date: "2026-01-01", outside: false });
    expect(grid[5]![6]).toMatchObject({ date: "2026-02-07", outside: true });
  });

  it("gera 12 meses a partir de um mês qualquer (EaD começa em fevereiro)", () => {
    const months = monthsFrom("2026-02");
    expect(months[0]).toEqual({ year: 2026, month: 2 });
    expect(months[11]).toEqual({ year: 2027, month: 1 });
  });
});

describe("feriados nacionais", () => {
  it("acha a Páscoa certa (2026 = 5/4, 2027 = 28/3)", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
  });

  it("deriva Carnaval, Sexta-feira Santa e Corpus Christi da Páscoa — conferido com o calendário de 2026", () => {
    const byLabel = Object.fromEntries(nationalHolidays(2026).map((holiday) => [holiday.label, holiday]));
    expect(byLabel["Carnaval"]).toMatchObject({ date: "2026-02-17", fixed: false });
    expect(byLabel["Sexta-feira Santa"]).toMatchObject({ date: "2026-04-03", fixed: false });
    expect(byLabel["Corpus Christi"]).toMatchObject({ date: "2026-06-04", fixed: false });
    expect(byLabel["Natal"]).toMatchObject({ date: "2026-12-25", fixed: true });
  });
});

describe("notas do mês", () => {
  it("formata sequências, pares e listas", () => {
    expect(formatDayList([6, 7, 8, 9, 10, 13, 14, 15, 16, 17])).toBe("6 a 10 e 13 a 17");
    expect(formatDayList([20, 21])).toBe("20 e 21");
    expect(formatDayList([16, 18])).toBe("16 e 18");
    expect(formatDayList([2, 9, 16, 23])).toBe("2, 9, 16 e 23");
    expect(formatDayList([20, 21, 22])).toBe("20 a 22");
  });

  it("junta datas com o mesmo nome numa linha, na ordem das categorias", () => {
    const value = content({
      marks: [
        { date: "2026-02-16", type: "feriado", label: "Recesso" },
        { date: "2026-02-17", type: "feriado", label: "Carnaval" },
        { date: "2026-02-18", type: "feriado", label: "Recesso" },
        { date: "2026-03-01", type: "feriado", label: "Outro mês" },
      ],
    });
    expect(buildMonthNotes(value, "2026-02")).toEqual(["16 e 18 - Recesso", "17 - Carnaval"]);
  });

  it("override do mês substitui as notas geradas", () => {
    const value = content({ marks: [{ date: "2026-02-17", type: "feriado", label: "Carnaval" }], noteOverrides: { "2026-02": "Texto livre\n\nSegunda linha" } });
    expect(buildMonthNotes(value, "2026-02")).toEqual(["Texto livre", "Segunda linha"]);
  });
});

describe("herança do calendário-base", () => {
  const base = content({
    markTypes: [type("feriado", "off"), type("recesso", "off")],
    marks: [
      { date: "2026-04-03", type: "feriado", label: "Sexta-feira Santa" },
      { date: "2026-04-20", type: "recesso" },
    ],
  });

  it("soma categorias e datas: o que o calendário marca se junta ao base; exclusão da data tira as do base", () => {
    const own = content({
      markTypes: [type("sabado", "on")],
      marks: [
        { date: "2026-04-04", type: "sabado" },
        { date: "2026-04-20", type: null },
        { date: "2026-04-03", type: "sabado" },
      ],
    });
    const resolved = resolveContent(own, base);
    expect(resolved.markTypes.map((item) => item.key)).toEqual(["feriado", "recesso", "sabado"]);
    expect(resolved.marks).toEqual([
      { date: "2026-04-03", type: "feriado", label: "Sexta-feira Santa" },
      { date: "2026-04-03", type: "sabado" },
      { date: "2026-04-04", type: "sabado" },
    ]);
  });

  it("exclusão com 'exclude' tira só aquela categoria do base na data", () => {
    const wide = content({
      markTypes: [type("sabado", "on")],
      marks: [{ date: "2026-04-03", type: "sabado" }, { date: "2026-04-03", type: null, exclude: "feriado" }, { date: "2026-04-20", type: null, exclude: "feriado" }],
    });
    // 04-03: o feriado do base sai e fica o sábado; 04-20: o recesso do base continua (a exclusão era de outra categoria).
    expect(resolveContent(wide, base).marks).toEqual([
      { date: "2026-04-03", type: "sabado" },
      { date: "2026-04-20", type: "recesso" },
    ]);
  });

  it("própria com o mesmo tipo do base o sobrescreve (nome) sem duplicar", () => {
    const named = content({ marks: [{ date: "2026-04-03", type: "feriado", label: "Paixão de Cristo" }] });
    expect(resolveContent(named, base).marks.filter((mark) => mark.date === "2026-04-03")).toEqual([
      { date: "2026-04-03", type: "feriado", label: "Paixão de Cristo" },
    ]);
  });

  it("férias no base + reunião no calendário = as duas na mesma data", () => {
    const meeting = content({ markTypes: [type("conselho", "none")], marks: [{ date: "2026-04-20", type: "conselho" }] });
    expect(resolveContent(meeting, base).marks.filter((mark) => mark.date === "2026-04-20").map((mark) => mark.type)).toEqual(["recesso", "conselho"]);
  });

  it("sem base, só tira as exclusões", () => {
    const resolved = resolveContent(content({ marks: [{ date: "2026-04-20", type: null }] }), null);
    expect(resolved.marks).toEqual([]);
  });

  it("legenda mostra só as categorias que têm algum dia e que são de legenda", () => {
    const resolved = resolveContent(content({ markTypes: [type("secreta", "none", false)], marks: [{ date: "2026-04-04", type: "secreta" }] }), base);
    expect(legendTypes(resolved).map((item) => item.key)).toEqual(["feriado", "recesso"]);
  });
});

describe("várias categorias na mesma data", () => {
  it("o base vem primeiro e a categoria própria depois, na mesma data", () => {
    const base = content({ markTypes: [type("a", "off"), type("b", "none"), type("c", "none")], marks: [{ date: "2026-05-01", type: "a" }, { date: "2026-05-01", type: "b" }] });
    const own = content({ markTypes: [], marks: [{ date: "2026-05-01", type: "c" }] });
    expect(resolveContent(own, base).marks.map((mark) => mark.type)).toEqual(["a", "b", "c"]);
  });

  it("sem marcação própria na data, valem todas as do base na ordem em que foram marcadas", () => {
    const base = content({ marks: [{ date: "2026-05-01", type: "feriado" }, { date: "2026-05-01", type: "sabado" }] });
    expect(resolveContent(content({ marks: [] }), base).marks.map((mark) => mark.type)).toEqual(["feriado", "sabado"]);
  });

  it("dia letivo: 'não é letivo' vence 'é letivo', que vence 'só informa'", () => {
    const semesters = [{ label: "S", start: "2026-04-01", end: "2026-04-30" }];
    // 10/04 (sexta): feriado + bimestre = off; 11/04 (sábado): sábado letivo + bimestre = on; 18/04 (sábado): sábado letivo + feriado = off
    const value = content({
      semesters,
      marks: [
        { date: "2026-04-10", type: "feriado" }, { date: "2026-04-10", type: "bimestre" },
        { date: "2026-04-11", type: "sabado" }, { date: "2026-04-11", type: "bimestre" },
        { date: "2026-04-18", type: "sabado" }, { date: "2026-04-18", type: "feriado" },
      ],
    });
    // Abril/2026: 22 úteis − 1 (10/04) + 1 (11/04) = 22.
    expect(countSchoolDays(value).perSemester).toEqual([22]);
  });
});

describe("dias letivos", () => {
  const semesters = [{ label: "1º Semestre", start: "2026-04-01", end: "2026-04-30" }];

  it("conta segunda a sexta dentro do semestre e tira feriado/recesso", () => {
    const value = content({
      semesters,
      marks: [
        { date: "2026-04-03", type: "feriado" },
        { date: "2026-04-21", type: "feriado" },
        { date: "2026-04-20", type: "feriado" },
      ],
    });
    // Abril/2026 tem 22 dias úteis; menos 3.
    expect(countSchoolDays(value)).toEqual({ perMonth: { "2026-04": 19 }, perSemester: [19] });
  });

  it("sábado só conta quando é sábado letivo; marcação 'none' não muda nada", () => {
    const value = content({
      semesters,
      marks: [
        { date: "2026-04-11", type: "sabado" },
        { date: "2026-04-18", type: "bimestre" },
        { date: "2026-04-06", type: "bimestre" },
      ],
    });
    expect(countSchoolDays(value).perSemester).toEqual([23]);
  });

  it("não conta nada fora dos intervalos e mês sem dia letivo não aparece", () => {
    const value = content({ semesters: [{ label: "S", start: "2026-02-02", end: "2026-02-03" }], marks: [] });
    expect(countSchoolDays(value)).toEqual({ perMonth: { "2026-02": 2 }, perSemester: [2] });
    expect(countSchoolDays(content({ semesters: [], marks: [] }))).toEqual({ perMonth: {}, perSemester: [] });
  });
});

describe("iniciar próximo ano", () => {
  it("calcula os feriados nacionais do novo ano, leva os fixos do setor e desloca os períodos", () => {
    const current = content({
      yearText: "2026",
      startMonth: "2026-01",
      marks: [
        { date: "2026-09-08", type: "feriado", label: "Nossa Senhora da Luz dos Pinhais", fixed: true },
        { date: "2026-07-06", type: "recesso" },
        { date: "2026-02-17", type: "feriado", label: "Carnaval", fixed: false },
      ],
      periods: [{ label: "1º Bimestre", start: "2026-02-02", end: "2026-04-17" }],
      semesters: [{ label: "1º Semestre", start: "2026-02-02", end: "2026-07-03" }],
      noteOverrides: { "2026-02": "x" },
    });
    const next = carryContentToYear(current, 2026, 2027);
    expect(next.yearText).toBe("2027");
    expect(next.startMonth).toBe("2027-01");
    expect(next.periods[0]).toMatchObject({ start: "2027-02-02", end: "2027-04-17" });
    expect(next.noteOverrides).toEqual({});
    const dates = next.marks.map((mark) => mark.date);
    expect(dates).toContain("2027-09-08"); // fixo do setor
    expect(dates).toContain("2027-02-09"); // Carnaval 2027 (Páscoa 28/3)
    expect(dates).not.toContain("2027-07-06"); // recesso não anda sozinho
    expect(dates).not.toContain("2027-02-17"); // Carnaval de 2026 não vira data de 2027
  });

  it("calendário que herda não gera feriados próprios", () => {
    const next = carryContentToYear(content({ marks: [] }), 2026, 2027, { generateHolidays: false });
    expect(next.marks).toEqual([]);
  });
});
