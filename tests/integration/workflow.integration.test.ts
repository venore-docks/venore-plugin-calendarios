// Fluxo inteiro contra um Postgres de verdade (PGlite): setor e membros, calendário-base + herdeiro,
// salvar (lock otimista), enviar, validar (revisão congelada COM a herança), publicar, base mudando
// depois, ano seguinte, arquivos públicos e apagar. O PDF/PNG em si é trocado por um stub — o render
// tem teste próprio (shared/render).
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { applyMigrations, db, state } from "./mocks";
import type { CalendarContent, CalendarRecord, EditionRecord, SectorRecord } from "../../contracts/types";
import { calEditionEvents, calRevisions } from "../../database/schema";
import { getEditionHandler } from "../../features/get-edition/handler";
import { listOverviewHandler } from "../../features/list-overview/handler";
import {
  createCalendarHandler,
  createSectorHandler,
  deleteCalendarHandler,
  deleteEditionHandler,
  deleteSectorHandler,
  setMemberHandler,
  updateCalendarHandler,
} from "../../features/manage-structure/handler";
import { createEventHandler, deleteEventHandler, listEventsHandler, setSectorEventCoverHandler, updateEventHandler } from "../../features/manage-events/handler";
import { getEventCover, getSectorDefaultCover } from "../../features/public-events/cover";
import { listEventSectorsHandler, listUpcomingEventsHandler } from "../../features/public-events/handler";
import { getPublishedFileHandler, listPublishedHandler } from "../../features/public-calendars/handler";
import { publishEditionHandler } from "../../features/publish-edition/handler";
import { reviewEditionHandler } from "../../features/review-edition/handler";
import { saveEditionHandler } from "../../features/save-edition/handler";
import { startNextYearHandler } from "../../features/start-next-year/handler";
import { submitEditionHandler } from "../../features/submit-edition/handler";
import { CALENDARIOS_PERMISSIONS as P } from "../../shared/permissions";

vi.mock("../../shared/edition-files", () => ({
  editionFileName: (calendar: { name: string }, year: number, extension: string) => `Calendário ${year} - ${calendar.name}.${extension}`,
  renderEditionFiles: async () => ({ pdf: new Uint8Array([37, 80, 68, 70]), png: new Uint8Array([137, 80, 78, 71]), skipped: [] }),
}));
vi.mock("../../shared/media", () => ({
  createMediaLoader: async () => async (mediaId: string) => ({ bytes: new Uint8Array([1, 2, 3]), contentType: "image/x-test" }),
}));

const admin = { id: "admin-1", name: "Admin", email: "admin@fem.org.br" };
const ana = { id: "ana-1", name: "Ana (edita)", email: "ana@fem.org.br" };
const bia = { id: "bia-1", name: "Bia (valida)", email: "bia@fem.org.br" };
const caio = { id: "caio-1", name: "Caio (publica)", email: "caio@fem.org.br" };
const dan = { id: "dan-1", name: "Dan (só lê)", email: "dan@fem.org.br" };

function as(user: typeof admin, permissions: string[]) {
  state.current = user;
  state.permissions = new Set(permissions);
}
const asAdmin = () => as(admin, [P.read, P.admin]);
const asReader = (user: typeof admin) => as(user, [P.read]);

function ok<T>(result: { success: true; data: T } | { success: false; error: { code: string; message: string } }): T {
  if (!result.success) throw new Error(`${result.error.code}: ${result.error.message}`);
  return result.data;
}

describe("calendários — fluxo (PGlite)", () => {
  let sector: SectorRecord;
  let base: CalendarRecord;
  let child: CalendarRecord;
  let baseEdition: EditionRecord;
  let edition: EditionRecord;

  beforeAll(async () => {
    await applyMigrations(fileURLToPath(new URL("../../migrations", import.meta.url)));
    state.users = [admin, ana, bia, caio, dan];
  });

  it("só quem administra cria setor; membros recebem capacidades por setor", async () => {
    asReader(ana);
    expect(await createSectorHandler({ name: "Colégio Teste" })).toMatchObject({ success: false });

    asAdmin();
    sector = ok(await createSectorHandler({ name: "Colégio Teste" }));
    expect(sector.slug).toBe("colegio-teste");

    ok(await setMemberHandler({ sectorId: sector.id, userId: ana.id, canEdit: true, canApprove: false, canPublish: false }));
    ok(await setMemberHandler({ sectorId: sector.id, userId: bia.id, canEdit: false, canApprove: true, canPublish: false }));
    ok(await setMemberHandler({ sectorId: sector.id, userId: caio.id, canEdit: false, canApprove: false, canPublish: true }));

    asReader(ana);
    expect(await setMemberHandler({ sectorId: sector.id, userId: dan.id, canEdit: true, canApprove: true, canPublish: true })).toMatchObject({ success: false });
  });

  it("base nasce com feriados nacionais; herdeiro nasce sem categorias próprias e valida o base", async () => {
    asReader(dan);
    expect(await createCalendarHandler({ sectorId: sector.id, name: "Base", year: 2026, isBase: true })).toMatchObject({ success: false });

    asReader(ana);
    const baseResult = ok(await createCalendarHandler({ sectorId: sector.id, name: "Calendário base", year: 2026, isBase: true }));
    base = baseResult.calendar;
    baseEdition = baseResult.edition;
    expect(baseEdition.content.marks.map((mark) => mark.label)).toContain("Carnaval");
    expect(baseEdition.content.marks.find((mark) => mark.label === "Carnaval")?.date).toBe("2026-02-17");

    expect(await createCalendarHandler({ sectorId: sector.id, name: "X", year: 2026, baseCalendarId: base.id, isBase: true })).toMatchObject({
      error: { code: "calendarios.base_cannot_inherit" },
    });
    const childResult = ok(await createCalendarHandler({ sectorId: sector.id, name: "Ensino Fundamental I", year: 2026, baseCalendarId: base.id }));
    child = childResult.calendar;
    edition = childResult.edition;
    expect(child.slug).toBe("ensino-fundamental-i");
    expect(edition.content.markTypes).toEqual([]);

    expect(await updateCalendarHandler({ calendarId: child.id, baseCalendarId: child.id })).toMatchObject({ error: { code: "calendarios.invalid_base" } });
    expect(await updateCalendarHandler({ calendarId: base.id, isBase: false })).toMatchObject({ error: { code: "calendarios.base_in_use" } });
  });

  it("um base de OUTRO setor pode ser herdado (base geral) e o herdeiro vê as datas dele", async () => {
    asAdmin();
    const other = ok(await createSectorHandler({ name: "Faculdade Teste" }));
    ok(await setMemberHandler({ sectorId: other.id, userId: ana.id, canEdit: true, canApprove: false, canPublish: false }));

    asReader(ana);
    const created = ok(await createCalendarHandler({ sectorId: other.id, name: "Presencial", year: 2026, baseCalendarId: base.id }));
    expect(created.calendar.baseCalendarId).toBe(base.id);
    expect(created.calendar.sectorId).toBe(other.id);
    const view = ok(await getEditionHandler({ editionId: created.edition.id }));
    expect(view.baseHasEdition).toBe(true);
    expect(view.resolved.marks.map((mark) => mark.date)).toContain("2026-02-17");

    // Só um calendário marcado como base pode ser herdado, venha de onde vier.
    expect(await createCalendarHandler({ sectorId: other.id, name: "Outro", year: 2026, baseCalendarId: created.calendar.id })).toMatchObject({
      error: { code: "calendarios.invalid_base" },
    });

    // Setor descartável: os testes seguintes esperam só o "Colégio Teste".
    asAdmin();
    expect(await deleteSectorHandler({ sectorId: other.id, confirmName: "Faculdade Teste" })).toMatchObject({ success: true });
  });

  it("quem só lê não vê rascunho nem edita; salvar sobe a versão e recusa versão velha", async () => {
    asReader(dan);
    expect(await getEditionHandler({ editionId: edition.id })).toMatchObject({ error: { code: "calendarios.forbidden_sector" } });
    expect(await saveEditionHandler({ editionId: edition.id, expectedVersion: 1, content: edition.content })).toMatchObject({
      error: { code: "calendarios.forbidden_sector" },
    });

    asReader(ana);
    const content: CalendarContent = {
      ...edition.content,
      subtitle: "ENSINO FUNDAMENTAL I",
      markTypes: [{ key: "sabado-letivo", label: "Sábado Letivo", color: "#00697f", effect: "on", legend: true }],
      marks: [{ date: "2026-03-14", type: "sabado-letivo" }],
      semesters: [{ label: "1º Semestre", start: "2026-02-02", end: "2026-07-03" }],
    };
    edition = ok(await saveEditionHandler({ editionId: edition.id, expectedVersion: 1, content }));
    expect(edition.version).toBe(2);
    expect(await saveEditionHandler({ editionId: edition.id, expectedVersion: 1, content })).toMatchObject({ error: { code: "calendarios.version_conflict" } });
    expect(await saveEditionHandler({ editionId: edition.id, expectedVersion: 2, content: { ...content, theme: { ...content.theme, primary: "azul" } } })).toMatchObject({
      error: { code: "calendarios.invalid_content" },
    });

    const view = ok(await getEditionHandler({ editionId: edition.id }));
    expect(view.resolved.markTypes.map((type) => type.key)).toEqual(expect.arrayContaining(["feriado", "sabado-letivo"]));
    expect(view.resolved.marks.map((mark) => mark.date)).toEqual(expect.arrayContaining(["2026-02-17", "2026-03-14"]));
    expect(view.caps).toMatchObject({ edit: true, approve: false, publish: false });
  });

  it("base não passa por validação; herdeiro: enviar → devolver (com motivo) → enviar de novo", async () => {
    asReader(ana);
    expect(await submitEditionHandler({ editionId: baseEdition.id, expectedVersion: 1 })).toMatchObject({ error: { code: "calendarios.base_not_submitted" } });
    ok(await submitEditionHandler({ editionId: edition.id, expectedVersion: edition.version }));

    asReader(ana);
    expect(await reviewEditionHandler({ editionId: edition.id, expectedVersion: edition.version, decision: "approve" })).toMatchObject({
      error: { code: "calendarios.forbidden_sector" },
    });

    asReader(bia);
    expect(await reviewEditionHandler({ editionId: edition.id, expectedVersion: edition.version, decision: "reject" })).toMatchObject({
      error: { code: "calendarios.note_required" },
    });
    const rejected = ok(await reviewEditionHandler({ editionId: edition.id, expectedVersion: edition.version, decision: "reject", note: "Faltou o recesso" }));
    expect(rejected).toMatchObject({ status: "draft", reviewNote: "Faltou o recesso" });

    asReader(ana);
    expect(ok(await submitEditionHandler({ editionId: edition.id, expectedVersion: edition.version }))).toMatchObject({ status: "in_review", reviewNote: null });
    edition = ok(await getEditionHandler({ editionId: edition.id })).edition;
  });

  it("validar congela a revisão com a herança aplicada; só quem publica publica", async () => {
    asReader(bia);
    edition = ok(await reviewEditionHandler({ editionId: edition.id, expectedVersion: edition.version, decision: "approve" }));
    expect(edition.status).toBe("approved");
    const [revision] = await db.select().from(calRevisions).where(eq(calRevisions.editionId, edition.id));
    expect(revision).toMatchObject({ number: 1, approvedBy: bia.id });
    // A revisão tem o que veio do base (feriados) e o que é do herdeiro.
    expect(revision.content.marks.map((mark) => mark.date)).toEqual(expect.arrayContaining(["2026-02-17", "2026-03-14"]));
    expect(revision.content.markTypes.map((type) => type.key)).toEqual(expect.arrayContaining(["feriado", "sabado-letivo"]));

    asReader(ana);
    expect(await publishEditionHandler({ editionId: edition.id })).toMatchObject({ error: { code: "calendarios.forbidden_sector" } });
    asReader(caio);
    const published = ok(await publishEditionHandler({ editionId: edition.id }));
    expect(published.edition).toMatchObject({ status: "published" });
    expect(published.edition.publishedPdfMediaId).toMatch(/^media-/);
    expect(published.edition.publishedPngMediaId).toMatch(/^media-/);
    expect(state.uploads.slice(-2)).toEqual([
      { filename: "Calendário 2026 - Ensino Fundamental I.pdf", categoryKey: "calendarios.arquivos" },
      { filename: "Calendário 2026 - Ensino Fundamental I.png", categoryKey: "calendarios.arquivos" },
    ]);
    edition = published.edition;
  });

  it("base muda depois da validação: o herdeiro aparece defasado, o publicado não muda", async () => {
    asReader(ana);
    const before = ok(await getEditionHandler({ editionId: edition.id }));
    expect(before.outdatedSinceApproval).toBe(false);

    const baseView = ok(await getEditionHandler({ editionId: baseEdition.id }));
    baseEdition = ok(
      await saveEditionHandler({
        editionId: baseEdition.id,
        expectedVersion: baseView.edition.version,
        content: { ...baseView.edition.content, marks: [...baseView.edition.content.marks, { date: "2026-07-06", type: "feriado", label: "Recesso" }] },
      }),
    );
    const after = ok(await getEditionHandler({ editionId: edition.id }));
    expect(after.outdatedSinceApproval).toBe(true);
    expect(after.edition).toMatchObject({ status: "published", publishedPdfMediaId: edition.publishedPdfMediaId });
  });

  it("editar depois de publicado: rascunho novo, arquivos publicados preservados e o link continua servindo", async () => {
    asReader(ana);
    const pdfId = edition.publishedPdfMediaId;
    edition = ok(await saveEditionHandler({ editionId: edition.id, expectedVersion: edition.version, content: { ...edition.content, subtitle: "EF I (ajuste)" } }));
    expect(edition).toMatchObject({ status: "draft", publishedPdfMediaId: pdfId });

    const file = ok(await getPublishedFileHandler({ sectorSlug: sector.slug, calendarSlug: child.slug, year: null, format: "pdf" }));
    expect(file.mediaId).toBe(pdfId);
    const events = await db.select().from(calEditionEvents).where(eq(calEditionEvents.editionId, edition.id));
    expect(events.map((event) => event.action)).toEqual(expect.arrayContaining(["created", "saved", "submitted", "rejected", "approved", "published"]));
  });

  it("ano seguinte: herdeiro não gera feriados, base gera os do novo ano", async () => {
    asReader(ana);
    const nextChild = ok(await startNextYearHandler({ calendarId: child.id }));
    expect(nextChild).toMatchObject({ year: 2027, status: "draft" });
    expect(nextChild.content.marks).toEqual([]);
    expect(nextChild.content.yearText).toBe("2027");

    const nextBase = ok(await startNextYearHandler({ calendarId: base.id }));
    expect(nextBase.content.marks.find((mark) => mark.label === "Carnaval")?.date).toBe("2027-02-09");
    // "Iniciar" sempre parte do último ano que existe: de novo, é o ano depois do 2027.
    expect(ok(await startNextYearHandler({ calendarId: base.id }))).toMatchObject({ year: 2028 });
  });

  it("público: só calendário publicado, nunca o base nem ano sem publicação", async () => {
    const list = ok(await listPublishedHandler());
    expect(list).toHaveLength(1);
    expect(list[0]!.calendars).toEqual([
      expect.objectContaining({
        calendarSlug: "ensino-fundamental-i",
        year: 2026,
        pdfPath: "/api/calendarios/publicados/colegio-teste/ensino-fundamental-i/atual.pdf",
        pngPath: "/api/calendarios/publicados/colegio-teste/ensino-fundamental-i/atual.png",
      }),
    ]);

    expect(await getPublishedFileHandler({ sectorSlug: sector.slug, calendarSlug: child.slug, year: 2027, format: "png" })).toMatchObject({
      error: { code: "calendarios.not_published" },
    });
    expect(await getPublishedFileHandler({ sectorSlug: sector.slug, calendarSlug: base.slug, year: null, format: "pdf" })).toMatchObject({
      error: { code: "calendarios.not_published" },
    });
  });

  it("visão geral: membro vê o trabalho do setor; leitor sem vínculo só vê o publicado (sem base)", async () => {
    asReader(ana);
    const memberView = ok(await listOverviewHandler()).sectors[0]!;
    expect(memberView.calendars.map((calendar) => calendar.slug)).toEqual(["calendario-base", "ensino-fundamental-i"]);

    asReader(dan);
    const readerView = ok(await listOverviewHandler()).sectors[0]!;
    expect(readerView.calendars.map((calendar) => calendar.slug)).toEqual(["ensino-fundamental-i"]);
    expect(readerView.calendars[0]!.editions.map((item) => item.year)).toEqual([2026]);
  });

  it("eventos públicos: editor cria/edita sem tocar no PDF; leitor só consulta; público vê só os que não terminaram", async () => {
    asReader(ana);
    const draftStatus = ok(await getEditionHandler({ editionId: edition.id })).edition.status;

    asReader(dan);
    expect(await createEventHandler({ sectorId: sector.id, title: "X", startDate: "2099-01-01" })).toMatchObject({ error: { code: "calendarios.forbidden_sector" } });
    expect(await listEventsHandler({ sectorId: sector.id })).toMatchObject({ error: { code: "calendarios.forbidden_sector" } });

    asReader(ana);
    expect(await createEventHandler({ sectorId: sector.id, title: "  ", startDate: "2099-01-01" })).toMatchObject({ error: { code: "calendarios.invalid_event" } });
    expect(await createEventHandler({ sectorId: sector.id, title: "X", startDate: "2099-02-10", endDate: "2099-02-01" })).toMatchObject({ error: { code: "calendarios.invalid_event" } });
    expect(await createEventHandler({ sectorId: sector.id, title: "X", startDate: "2099-02-10", startTime: "25:00" })).toMatchObject({ error: { code: "calendarios.invalid_event" } });
    expect(await createEventHandler({ sectorId: sector.id, title: "X", startDate: "2099-02-10", startTime: "10:00", endTime: "09:00" })).toMatchObject({ error: { code: "calendarios.invalid_event" } });

    const future = ok(await createEventHandler({ sectorId: sector.id, title: "Semana Acadêmica", detail: "Tema: Fé e ciência", location: "Auditório", startDate: "2099-03-02", endDate: "2099-03-06", startTime: "19:30", endTime: "21:00" }));
    const oneDay = ok(await createEventHandler({ sectorId: sector.id, title: "Formatura", startDate: "2099-01-15", endDate: "2099-01-15" }));
    expect(oneDay.endDate).toBeNull();
    const past = ok(await createEventHandler({ sectorId: sector.id, title: "Já passou", startDate: "2020-01-01" }));
    const renamed = ok(await updateEventHandler({ eventId: future.id, title: "Semana Acadêmica 2099", detail: "Tema: outro", startDate: "2099-03-02", endDate: "2099-03-06" }));
    expect(renamed).toMatchObject({ title: "Semana Acadêmica 2099", detail: "Tema: outro", startTime: null });

    // O PDF/validação do calendário não foi afetado por editar evento.
    expect(ok(await getEditionHandler({ editionId: edition.id })).edition.status).toBe(draftStatus);

    const upcoming = ok(await listUpcomingEventsHandler({ sectorSlug: sector.slug }));
    expect(upcoming.map((item) => item.title)).toEqual(["Formatura", "Semana Acadêmica 2099"]);
    expect(upcoming[1]).toMatchObject({ sectorSlug: "colegio-teste", sectorName: "Colégio Teste", detail: "Tema: outro" });
    // Evento em andamento ainda é "próximo": hoje fixado no meio do intervalo.
    expect(ok(await listUpcomingEventsHandler({ sectorSlug: sector.slug, from: "2099-03-04" })).map((item) => item.title)).toEqual(["Semana Acadêmica 2099"]);
    expect(ok(await listUpcomingEventsHandler({ sectorSlug: sector.slug, from: "2099-03-07" }))).toEqual([]);
    expect(ok(await listEventSectorsHandler()).some((item) => item.slug === sector.slug)).toBe(true);

    ok(await deleteEventHandler({ eventId: past.id }));
    ok(await deleteEventHandler({ eventId: oneDay.id }));
    ok(await deleteEventHandler({ eventId: future.id }));
    expect(ok(await listUpcomingEventsHandler({ sectorSlug: sector.slug }))).toEqual([]);
  });

  it("capa dos eventos: própria → imagem padrão do setor → placeholder; sempre há um caminho público", async () => {
    asReader(dan);
    expect(await setSectorEventCoverHandler({ sectorId: sector.id, mediaId: "padrao-1" })).toMatchObject({ error: { code: "calendarios.forbidden_sector" } });

    asReader(ana);
    expect(await createEventHandler({ sectorId: sector.id, title: "X", startDate: "2099-05-01", coverMediaId: "../etc/passwd" })).toMatchObject({ error: { code: "calendarios.invalid_event" } });
    const plain = ok(await createEventHandler({ sectorId: sector.id, title: "Sem capa", startDate: "2099-05-01" }));
    const own = ok(await createEventHandler({ sectorId: sector.id, title: "Com capa", startDate: "2099-05-02", coverMediaId: "capa-propria" }));
    expect(own.coverMediaId).toBe("capa-propria");

    // Sem imagem padrão: placeholder (SVG com o nome do setor).
    const placeholder = (await getEventCover(plain.id))!;
    expect(placeholder.contentType).toBe("image/svg+xml");
    expect(new TextDecoder().decode(placeholder.bytes)).toContain("Colégio Teste");
    expect((await getEventCover(own.id))!).toMatchObject({ etag: "capa-propria", contentType: "image/x-test" });
    expect(await getEventCover("nao-existe")).toBeNull();

    // Imagem padrão do setor vale para quem não tem capa própria; a própria continua vencendo.
    ok(await setSectorEventCoverHandler({ sectorId: sector.id, mediaId: "padrao-1" }));
    expect((await getEventCover(plain.id))!.etag).toBe("padrao-1");
    expect((await getEventCover(own.id))!.etag).toBe("capa-propria");
    expect((await getSectorDefaultCover(sector.slug))!.etag).toBe("padrao-1");

    // Remover a capa própria (null) volta ao padrão; remover o padrão volta ao placeholder.
    const cleared = ok(await updateEventHandler({ eventId: own.id, title: "Com capa", startDate: "2099-05-02", coverMediaId: null }));
    expect(cleared.coverMediaId).toBeNull();
    expect((await getEventCover(own.id))!.etag).toBe("padrao-1");
    ok(await setSectorEventCoverHandler({ sectorId: sector.id, mediaId: null }));
    expect((await getEventCover(own.id))!.contentType).toBe("image/svg+xml");

    // Omitir coverMediaId ao editar não mexe na capa.
    ok(await updateEventHandler({ eventId: own.id, title: "Com capa", startDate: "2099-05-02", coverMediaId: "capa-nova" }));
    expect(ok(await updateEventHandler({ eventId: own.id, title: "Com capa 2", startDate: "2099-05-02" })).coverMediaId).toBe("capa-nova");

    // O consumidor externo (Broadcast, site) recebe sempre um caminho de imagem.
    const upcoming = ok(await listUpcomingEventsHandler({ sectorSlug: sector.slug }));
    expect(upcoming.map((item) => item.coverPath)).toEqual([`/api/calendarios/eventos/${plain.id}/capa`, `/api/calendarios/eventos/${own.id}/capa`]);

    ok(await deleteEventHandler({ eventId: plain.id }));
    ok(await deleteEventHandler({ eventId: own.id }));
  });

  it("seed com storage fora do ar: erro claro e nada criado", async () => {
    state.failUploads = true;
    const { seedCalendarios2026 } = await import("../../seeds/calendarios-2026");
    const result = await seedCalendarios2026();
    state.failUploads = false;
    expect(result).toMatchObject({ success: false, error: { code: "calendarios.storage_failed" } });
    expect(!result.success && result.error.message).toContain("store has been suspended");
    expect(ok(await listOverviewHandler()).sectors.map((item) => item.slug)).toEqual(["colegio-teste"]);
  });

  it("seed de 2026: dois setores, base + 4 herdeiros e 2 independentes; rodar de novo não duplica", async () => {
    state.uploads = [];
    const { seedCalendarios2026 } = await import("../../seeds/calendarios-2026");
    ok(await seedCalendarios2026());
    const uploaded = state.uploads.length;
    expect(uploaded).toBe(8);

    asAdmin();
    const sectors = ok(await listOverviewHandler()).sectors;
    const bySlug = Object.fromEntries(sectors.map((item) => [item.slug, item]));
    expect(bySlug["colegio-erasto-gaertner"]!.calendars.map((calendar) => calendar.name)).toEqual([
      "Calendário base",
      "Educação Infantil",
      "Ensino Fundamental I",
      "Ensino Fundamental II e Ensino Médio",
      "Ensino Médio Hunters",
    ]);
    expect(bySlug["faculdade-fidelis"]!.calendars.map((calendar) => calendar.slug)).toEqual(["presencial", "ead"]);

    // Herdeiro: a tela resolve base + próprio e a contagem de dias letivos bate com o PDF de 2026.
    const infantil = bySlug["colegio-erasto-gaertner"]!.calendars.find((calendar) => calendar.slug === "educacao-infantil")!;
    const view = ok(await getEditionHandler({ editionId: infantil.editions[0]!.id }));
    expect(view.baseCalendar?.name).toBe("Calendário base");
    expect(view.resolved.marks.find((mark) => mark.label === "Carnaval")?.date).toBe("2026-02-17");
    expect(view.edition.content.marks.length).toBeLessThan(view.resolved.marks.length);
    expect(view.edition.content.headerImageMediaId).toMatch(/^media-/);

    ok(await seedCalendarios2026());
    expect(state.uploads).toHaveLength(uploaded);
    expect(ok(await listOverviewHandler()).sectors).toHaveLength(sectors.length);
  });

  it("apagar: só admin; ano, calendário e setor (com nome digitado)", async () => {
    asReader(ana);
    expect(await deleteEditionHandler({ editionId: edition.id })).toMatchObject({ success: false });

    asAdmin();
    const next = ok(await listOverviewHandler()).sectors.find((item) => item.id === sector.id)!.calendars.find((calendar) => calendar.id === child.id)!.editions;
    expect(next.map((item) => item.year)).toEqual([2027, 2026]);
    expect(ok(await deleteEditionHandler({ editionId: next[0]!.id }))).toEqual({ year: 2027 });

    expect(await deleteCalendarHandler({ calendarId: child.id, confirmName: "outro" })).toMatchObject({ error: { code: "calendarios.confirm_mismatch" } });
    expect(ok(await deleteCalendarHandler({ calendarId: child.id, confirmName: "Ensino Fundamental I" }))).toEqual({ name: "Ensino Fundamental I" });
    expect(await db.select().from(calRevisions)).toHaveLength(0);

    expect(await deleteSectorHandler({ sectorId: sector.id, confirmName: "Colégio Teste" })).toMatchObject({ success: true });
    expect(ok(await listOverviewHandler()).sectors.map((item) => item.slug)).not.toContain("colegio-teste");
  });
});
