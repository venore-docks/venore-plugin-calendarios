// Renderiza os calendários de 2026 extraídos dos PDFs do marketing (JSON + assets) com o MESMO
// código de produção, para conferir o layout contra os originais:
//   (com o junction de node_modules -> core, ver scripts/run-tests.ps1)
//   npx tsx scripts/render-seed.mts <pasta seed-extract> <pasta de saída> [slug]
// Grava <slug>.png e <slug>.pdf. Chrome/Edge local (CALENDARIOS_CHROME_PATH força um binário).
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { CalendarContent } from "../contracts/types";
import { buildCalendarFiles } from "../shared/pdf/build-calendar-files";

const [source, out, only] = process.argv.slice(2);
if (!source || !out) throw new Error("Uso: tsx scripts/render-seed.mts <seed-extract> <saída> [slug]");
mkdirSync(out, { recursive: true });

const SLUGS = ["erasto-educacao-infantil", "erasto-ensino-fundamental-i", "erasto-ensino-fundamental-ii-medio", "erasto-medio-hunters", "fidelis-presencial", "fidelis-ead"];
const mime = (file: string) => (file.endsWith(".png") ? "image/png" : file.endsWith(".svg") ? "image/svg+xml" : "image/jpeg");

for (const slug of SLUGS.filter((candidate) => !only || candidate === only)) {
  const data = JSON.parse(readFileSync(join(source, `${slug}.json`), "utf8")) as {
    content: CalendarContent;
    headerImageFile: string;
    headerImageFileRgb?: string;
    logoFile: string;
    secondaryMarks?: CalendarContent["marks"];
  };
  const header = [data.headerImageFileRgb, data.headerImageFile].find((file) => file && existsSync(join(source, file)));
  const logo = data.logoFile.replace(/\.svg$/, ".png");
  const files: Record<string, string | undefined> = { header, logo };
  const content: CalendarContent = { ...data.content, marks: [...data.content.marks, ...(data.secondaryMarks ?? [])], headerImageMediaId: "header", logoMediaId: "logo" };

  const started = Date.now();
  const result = await buildCalendarFiles(content, async (id) => {
    const file = files[id];
    if (!file) return null;
    return { bytes: new Uint8Array(readFileSync(join(source, file))), contentType: mime(file) };
  });
  writeFileSync(join(out, `${slug}.png`), result.png);
  writeFileSync(join(out, `${slug}.pdf`), result.pdf);
  console.log(`${slug}: ${Date.now() - started} ms, png ${(result.png.byteLength / 1024).toFixed(0)} KB, pdf ${(result.pdf.byteLength / 1024).toFixed(0)} KB${result.skipped.length ? ` (sem: ${result.skipped.join(", ")})` : ""}`);
}
