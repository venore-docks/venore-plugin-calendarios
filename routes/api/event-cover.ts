import { asPluginApiHandler, isPluginActive } from "@venore/plugin-sdk";
import { getEventCover, getSectorDefaultCover, type CoverFile } from "../../features/public-events/cover";

// GET /api/calendarios/eventos/:id/capa                  capa do evento (própria → padrão do setor → placeholder)
// GET /api/calendarios/eventos/padrao/:sector/capa       imagem padrão do setor (ou placeholder)
//
// SEM LOGIN, de propósito: é a imagem que as TVs (Broadcast) e o site mostram. Só entrega o que o banco
// aponta para aquele evento/setor — nunca um id de mídia vindo do request. ETag + cache curto: trocar a
// imagem no plugin aparece em minutos.
function respond(request: Request, cover: CoverFile | null): Response {
  if (!cover) return Response.json({ error: "Não encontrado." }, { status: 404 });
  const etag = `"${cover.etag}"`;
  const headers = {
    ETag: etag,
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
    "Access-Control-Allow-Origin": "*",
  };
  if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
  return new Response(Buffer.from(cover.bytes), { status: 200, headers: { ...headers, "Content-Type": cover.contentType } });
}

export const getEventCoverImage = asPluginApiHandler<{ id: string }>(async (request, { params }) => {
  if (!(await isPluginActive("calendarios"))) return Response.json({ error: "O plugin Calendários está desabilitado." }, { status: 404 });
  const { id } = await params;
  return respond(request, await getEventCover(id));
});

export const getSectorDefaultCoverImage = asPluginApiHandler<{ sector: string }>(async (request, { params }) => {
  if (!(await isPluginActive("calendarios"))) return Response.json({ error: "O plugin Calendários está desabilitado." }, { status: 404 });
  const { sector } = await params;
  return respond(request, await getSectorDefaultCover(sector));
});
