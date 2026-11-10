import type { CalendarContent } from "../../contracts/types";
import { renderCalendarDocument, type RenderAssets } from "../render/render-calendar";
import { launchPdfBrowser } from "./browser";
import type { MediaLoader } from "./types";

export type CalendarFiles = {
  pdf: Uint8Array;
  png: Uint8Array;
  // Foto/logo que não carregaram — o calendário sai sem eles, com aviso.
  skipped: string[];
};

// A4 em CSS px (96 dpi): 595.276pt × 841.89pt = 793.7 × 1122.5 px. O PNG é tirado em 2,5× (≈ 1985 ×
// 2806 px): nítido para o site e ainda leve.
const PAGE_PX = { width: 794, height: 1123 };
const PNG_SCALE = 2.5;

async function toDataUri(loadMedia: MediaLoader, mediaId: string | null): Promise<string | null> {
  if (!mediaId) return null;
  const media = await loadMedia(mediaId);
  if (!media || !media.contentType.startsWith("image/")) return null;
  return `data:${media.contentType};base64,${Buffer.from(media.bytes).toString("base64")}`;
}

export async function loadRenderAssets(content: CalendarContent, loadMedia: MediaLoader): Promise<{ assets: RenderAssets; skipped: string[] }> {
  const [header, logo] = await Promise.all([toDataUri(loadMedia, content.headerImageMediaId), toDataUri(loadMedia, content.logoMediaId)]);
  const skipped: string[] = [];
  if (content.headerImageMediaId && !header) skipped.push("Foto do cabeçalho");
  if (content.logoMediaId && !logo) skipped.push("Logo");
  return { assets: { header, logo }, skipped };
}

// HTML → PDF (A4) e PNG, no mesmo Chromium e na mesma página carregada.
export async function buildCalendarFiles(content: CalendarContent, loadMedia: MediaLoader): Promise<CalendarFiles> {
  const { assets, skipped } = await loadRenderAssets(content, loadMedia);
  const html = renderCalendarDocument(content, assets);

  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    // Defesa em profundidade: o HTML já sai escapado (rich-text.ts), e o render nunca precisa de
    // rede — fonte e imagens vão embutidas em data: URI.
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url === "about:blank") void request.continue();
      else void request.abort();
    });

    await page.setViewport({ ...PAGE_PX, deviceScaleFactor: PNG_SCALE });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, ...PAGE_PX } });
    // O A4 é medido em pt exatos (@page size: A4); 8.27×11.69in é 0,2pt mais baixo e jogaria a borda
    // inferior pra uma segunda página.
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    return { pdf, png, skipped };
  } finally {
    await browser.close();
  }
}
