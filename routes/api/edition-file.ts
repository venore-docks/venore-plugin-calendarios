import { asPluginApiHandler, isPluginActive } from "@venore/plugin-sdk";
import { exportEditionFile } from "../../index";
import type { FileFormat, FileSource } from "../../index";

// GET /api/calendarios/edicoes/:editionId/arquivo?versao=previa|validada|publicada&formato=pdf|png
const SOURCE_BY_QUERY: Record<string, FileSource> = { previa: "draft", validada: "approved", publicada: "published" };
const FORMATS: FileFormat[] = ["pdf", "png"];

function contentDisposition(fileName: string, inline: boolean): string {
  const ascii = fileName.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export const getEditionFile = asPluginApiHandler<{ editionId: string }>(async (request, { params }) => {
  if (!(await isPluginActive("calendarios"))) {
    return Response.json({ error: "O plugin Calendários está desabilitado." }, { status: 404 });
  }
  const { editionId } = await params;
  const query = new URL(request.url).searchParams;
  const source = SOURCE_BY_QUERY[query.get("versao") ?? "previa"];
  const format = (query.get("formato") ?? "pdf") as FileFormat;
  if (!source || !FORMATS.includes(format)) return Response.json({ error: "Versão ou formato inválido." }, { status: 400 });

  const result = await exportEditionFile({ editionId, source, format });
  if (!result.success) {
    const code = result.error.code;
    const status = code === "rbac.authorization.unauthenticated" ? 401 : code.startsWith("rbac.") || code.endsWith("forbidden_sector") ? 403 : 404;
    return Response.json({ error: result.error.message }, { status });
  }

  const headers = new Headers({
    "Content-Type": result.data.contentType,
    // PNG abre na aba (para conferir); PDF baixa.
    "Content-Disposition": contentDisposition(result.data.fileName, format === "png" || query.get("abrir") === "1"),
    "Cache-Control": "private, no-store",
  });
  if (result.data.skipped.length > 0) headers.set("X-Calendarios-Itens-Pulados", encodeURIComponent(result.data.skipped.join(", ")));
  return new Response(Buffer.from(result.data.bytes), { status: 200, headers });
});
