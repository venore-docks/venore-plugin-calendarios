import { asPluginApiHandler, isPluginActive } from "@venore/plugin-sdk";
import { getPublishedFile } from "../../index";

// GET /api/calendarios/publicados/:sector/:calendar/:arquivo   (arquivo = atual.pdf | atual.png | 2026.pdf | 2026.png)
//
// SEM LOGIN, de propósito: é o link estável que os sites do colégio e da faculdade (WordPress)
// guardam uma vez. `atual` sempre devolve o ano publicado mais recente; o número do ano, aquele ano.
// ETag = id da mídia publicada: o navegador/CDN revalida barato e só rebaixa quando se publicou de novo.
const FILE_PATTERN = /^(atual|\d{4})\.(pdf|png)$/;

function contentDisposition(fileName: string): string {
  const ascii = fileName.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export const getPublishedCalendarFile = asPluginApiHandler<{ sector: string; calendar: string; arquivo: string }>(async (request, { params }) => {
  if (!(await isPluginActive("calendarios"))) {
    return Response.json({ error: "O plugin Calendários está desabilitado." }, { status: 404 });
  }
  const { sector, calendar, arquivo } = await params;
  const match = FILE_PATTERN.exec(arquivo);
  if (!match) return Response.json({ error: "Arquivo inválido. Use atual.pdf, atual.png, 2026.pdf ou 2026.png." }, { status: 400 });

  const result = await getPublishedFile({
    sectorSlug: sector,
    calendarSlug: calendar,
    year: match[1] === "atual" ? null : Number(match[1]),
    format: match[2] as "pdf" | "png",
  });
  if (!result.success) return Response.json({ error: result.error.message }, { status: 404 });

  const etag = `"${result.data.mediaId}"`;
  const cacheHeaders = {
    ETag: etag,
    // 5 min no navegador/CDN e revalidação em segundo plano por até um dia: uma publicação nova
    // aparece nos sites em minutos, sem derrubar o servidor com cada visita.
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
  };
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: cacheHeaders });

  return new Response(Buffer.from(result.data.bytes), {
    status: 200,
    headers: { ...cacheHeaders, "Content-Type": result.data.contentType, "Content-Disposition": contentDisposition(result.data.fileName) },
  });
});
