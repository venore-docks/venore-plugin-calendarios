import { describe, expect, it } from "vitest";
import type { CalendarContent, DayMark } from "../../contracts/types";
import { emptyContent } from "../../shared/content-schema";
import { resolveContent } from "../../shared/engine/resolve";
import { datesBetween, paintDate, removeMark, setDate, updateMarkDetails, type Brush } from "./marks";

const base: CalendarContent = {
  ...emptyContent(2026),
  marks: [
    { date: "2026-04-03", type: "feriado", label: "Sexta-feira Santa" },
    { date: "2026-04-20", type: "recesso" },
    { date: "2026-07-03", type: "inicio-termino-aulas" },
    { date: "2026-07-03", type: "inicio-termino-bimestre" },
  ],
};

const resolvedOf = (own: DayMark[], baseContent: CalendarContent | null) => resolveContent({ ...emptyContent(2026), marks: own }, baseContent).marks;
const typesOn = (own: DayMark[], date: string, baseContent: CalendarContent | null = base) =>
  resolvedOf(own, baseContent)
    .filter((mark) => mark.date === date)
    .map((mark) => mark.type);
const paint = (own: DayMark[], date: string, brush: Brush, mode: "replace" | "add" = "replace", baseContent: CalendarContent | null = base) =>
  paintDate(own, baseContent, resolvedOf(own, baseContent), date, brush, { toggle: true, mode });
const type = (key: string): Brush => ({ kind: "type", key });

describe("pincel (clique troca a categoria)", () => {
  it("pinta uma data livre e clicar de novo com a mesma categoria apaga", () => {
    const painted = paint([], "2026-04-11", type("sabado-letivo"));
    expect(painted).toEqual([{ date: "2026-04-11", type: "sabado-letivo" }]);
    expect(paint(painted, "2026-04-11", type("sabado-letivo"))).toEqual([]);
  });

  it("trocar a categoria de uma data do base: grava a nova e exclui a do base; voltar ao do base limpa tudo", () => {
    const own = paint([], "2026-04-20", type("feriado"));
    expect(own).toEqual([
      { date: "2026-04-20", type: "feriado" },
      { date: "2026-04-20", type: null, exclude: "recesso" },
    ]);
    expect(typesOn(own, "2026-04-20")).toEqual(["feriado"]);
    expect(paint(own, "2026-04-20", type("recesso"))).toEqual([]);
  });

  it("apagar data do base vira exclusão da data inteira; apagar data própria remove; sem base nunca deixa exclusão", () => {
    expect(paint([], "2026-04-20", { kind: "erase" })).toEqual([{ date: "2026-04-20", type: null }]);
    expect(typesOn([{ date: "2026-04-20", type: null }], "2026-04-20")).toEqual([]);
    expect(paint([{ date: "2026-04-11", type: "x" }], "2026-04-11", { kind: "erase" })).toEqual([]);
    expect(paint([{ date: "2026-04-11", type: "x" }], "2026-04-11", { kind: "erase" }, "replace", null)).toEqual([]);
  });

  it("clicar numa data com várias categorias do base troca todas pela do pincel", () => {
    const own = paint([], "2026-07-03", type("feriado"));
    expect(typesOn(own, "2026-07-03")).toEqual(["feriado"]);
    expect(own).toEqual(
      expect.arrayContaining([
        { date: "2026-07-03", type: "feriado" },
        { date: "2026-07-03", type: null, exclude: "inicio-termino-aulas" },
        { date: "2026-07-03", type: null, exclude: "inicio-termino-bimestre" },
      ]),
    );
  });
});

describe("herança soma: calendário acrescenta ao que o base já tem (Ctrl/Alt+clique)", () => {
  it("soma até 3 e a quarta é ignorada; repetir a mesma tira", () => {
    let own: DayMark[] = [];
    own = paint(own, "2026-09-07", type("a"));
    own = paint(own, "2026-09-07", type("b"), "add");
    own = paint(own, "2026-09-07", type("c"), "add");
    expect(own.map((mark) => mark.type)).toEqual(["a", "b", "c"]);
    expect(paint(own, "2026-09-07", type("d"), "add")).toEqual(own);
    expect(paint(own, "2026-09-07", type("b"), "add").map((mark) => mark.type)).toEqual(["a", "c"]);
  });

  it("férias no base + reunião de conselho no calendário: a data fica com as duas, e só a nova é gravada", () => {
    const own = paint([], "2026-07-03", type("conselho"), "add");
    expect(own).toEqual([{ date: "2026-07-03", type: "conselho" }]);
    expect(typesOn(own, "2026-07-03")).toEqual(["inicio-termino-aulas", "inicio-termino-bimestre", "conselho"]);
  });

  it("tirar a categoria que tinha somado volta a data ao que o base diz", () => {
    const own = paint([], "2026-07-03", type("conselho"), "add");
    expect(paint(own, "2026-07-03", type("conselho"), "add")).toEqual([]);
  });

  it("tirar UMA categoria do base deixa a outra e grava só a exclusão dela", () => {
    const own = removeMark([], base, resolvedOf([], base), "2026-07-03", "inicio-termino-bimestre");
    expect(own).toEqual([{ date: "2026-07-03", type: null, exclude: "inicio-termino-bimestre" }]);
    expect(typesOn(own, "2026-07-03")).toEqual(["inicio-termino-aulas"]);
  });
});

describe("detalhes da data", () => {
  it("nomear uma categoria do base grava só a versão própria daquela categoria", () => {
    const own = updateMarkDetails([], base, resolvedOf([], base), "2026-07-03", "inicio-termino-aulas", { label: "Término do 1º semestre" });
    expect(own).toEqual([{ date: "2026-07-03", type: "inicio-termino-aulas", label: "Término do 1º semestre" }]);
    const resolved = resolvedOf(own, base).filter((mark) => mark.date === "2026-07-03");
    expect(resolved).toHaveLength(2);
    expect(resolved.find((mark) => mark.type === "inicio-termino-aulas")?.label).toBe("Término do 1º semestre");
  });

  it("nome vazio tira o rótulo e 'repete todo ano' liga/desliga", () => {
    const own: DayMark[] = [{ date: "2026-09-08", type: "feriado", label: "Padroeira", fixed: true }];
    const resolved = resolvedOf(own, null);
    expect(updateMarkDetails(own, null, resolved, "2026-09-08", "feriado", { label: "  " })).toEqual([{ date: "2026-09-08", type: "feriado", fixed: true }]);
    expect(updateMarkDetails(own, null, resolved, "2026-09-08", "feriado", { fixed: false })).toEqual([{ date: "2026-09-08", type: "feriado", label: "Padroeira" }]);
  });
});

describe("conjunto e intervalo", () => {
  it("setDate: igual ao base some, vazio com base vira exclusão da data", () => {
    expect(setDate([{ date: "2026-04-20", type: "feriado" }, { date: "2026-04-20", type: null, exclude: "recesso" }], base, "2026-04-20", [{ date: "2026-04-20", type: "recesso" }])).toEqual([]);
    expect(setDate([], base, "2026-04-20", [])).toEqual([{ date: "2026-04-20", type: null }]);
  });

  it("lista as datas entre duas, em qualquer ordem", () => {
    expect(datesBetween("2026-07-08", "2026-07-06")).toEqual(["2026-07-06", "2026-07-07", "2026-07-08"]);
    expect(datesBetween("2026-02-27", "2026-03-02")).toEqual(["2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02"]);
  });
});
