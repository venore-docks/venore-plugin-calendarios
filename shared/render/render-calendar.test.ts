import { describe, expect, it } from "vitest";
import type { CalendarContent } from "../../contracts/types";
import { emptyContent } from "../content-schema";
import { renderCalendarDocument } from "./render-calendar";

const content = (patch: Partial<CalendarContent> = {}): CalendarContent => ({
  ...emptyContent(2026),
  subtitle: "ENSINO FUNDAMENTAL I",
  semesters: [{ label: "1º Semestre", start: "2026-02-02", end: "2026-07-03" }],
  marks: [
    { date: "2026-02-17", type: "feriado", label: "Carnaval" },
    { date: "2026-03-14", type: "sabado-letivo" },
  ],
  ...patch,
});

// Só o <body>: o <style> embute o CSS e as fontes em base64, onde qualquer trecho curto aparece.
const body = (value: CalendarContent, assets = { header: null, logo: null }) => {
  const html = renderCalendarDocument(value, assets);
  return html.slice(html.indexOf("<body"));
};

describe("renderCalendarDocument", () => {
  it("escapa o que vem do editor e só deixa as tags inline permitidas na caixa de horário", () => {
    const html = body(content({ subtitle: "<script>alert(1)</script>", infoText: '<b>Início</b> <img src="http://interno/x"> <script>x</script>' }));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=\"http://interno");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("<b>Início</b>");
  });

  it("cor inválida cai no padrão em vez de ir pro CSS", () => {
    const html = body(content({ theme: { primary: "red;} body{display:none", accent: "#f7a600", header: "#6a9cb3" } }));
    expect(html).not.toContain("display:none");
  });

  it("modo compacto: legenda só com categorias usadas, totais e faixas; sem notas", () => {
    const html = body(content({ periods: [{ label: "1º Semestre", start: "2026-02-02", end: "2026-07-03" }] }));
    expect(html).toContain("LEGENDA");
    expect(html).toContain("Feriado");
    expect(html).toContain("Sábado Letivo");
    expect(html).not.toContain("Recesso para alunos");
    expect(html).toContain("1º SEMESTRE: ");
    expect(html).toContain("1º Semestre - 02/02 até 03/07");
    expect(html).not.toContain('class="notes"');
  });

  it("modo com notas (Fidelis): notas sob o mês, sem legenda nem faixas", () => {
    const html = body(content({ display: { legend: false, monthNotes: true, schoolDayCounts: true, semesterTotals: true }, periods: [{ label: "P", start: "2026-02-02", end: "2026-03-02" }] }));
    expect(html).toContain("Carnaval");
    expect(html).toContain('class="notes"');
    expect(html).not.toContain("LEGENDA");
    expect(html).not.toContain("class=\"bar\"");
  });

  it("EaD: 12 meses a partir de fevereiro e o último mostra o ano", () => {
    const html = body(content({ startMonth: "2026-02", marks: [] }));
    expect(html.indexOf("Fevereiro")).toBeLessThan(html.indexOf("Dezembro"));
    expect(html).toContain("Janeiro 2027");
    expect(html).not.toContain(">Janeiro<");
  });

  it("data com duas ou três categorias sai com o círculo repartido", () => {
    const two = body(content({ marks: [{ date: "2026-03-14", type: "sabado-letivo" }, { date: "2026-03-14", type: "feriado" }] }));
    expect(two).toContain("linear-gradient(135deg, #00697f 50%, #f7a600 50%)");
    const three = body(content({ marks: [{ date: "2026-03-14", type: "sabado-letivo" }, { date: "2026-03-14", type: "feriado" }, { date: "2026-03-14", type: "recesso" }] }));
    expect(three).toContain("conic-gradient(#00697f 0 33.34%, #f7a600 33.34% 66.67%, #7ac143 66.67% 100%)");
  });

  it("mês sem dia letivo não mostra contagem", () => {
    const html = body(content({ semesters: [{ label: "S", start: "2026-02-02", end: "2026-02-27" }], marks: [] }));
    expect(html).toContain("20 dias letivos");
    expect(html.match(/dias letivos/g)).toHaveLength(1);
  });
});
