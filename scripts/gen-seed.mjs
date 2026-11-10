// Gera seeds/data/calendarios-2026.ts e seeds/assets/* a partir da extração dos PDFs do marketing
// (JSON por calendário + fotos + logos), feita uma vez em 10/11/2026:
//   node scripts/gen-seed.mjs <pasta seed-extract>
// Os dados saem "achatados" (cada calendário completo); o seed deriva o calendário-base do Colégio
// (seeds/derive-base.ts). Depois que o setor começar a editar no portal, este seed é só o ponto de
// partida — não há reimportação dos PDFs.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Uso: node scripts/gen-seed.mjs <pasta seed-extract>");

const SLUGS = [
  "erasto-educacao-infantil",
  "erasto-ensino-fundamental-i",
  "erasto-ensino-fundamental-ii-medio",
  "erasto-medio-hunters",
  "fidelis-presencial",
  "fidelis-ead",
];
// Fidelis: título e círculo do logo em azul-marinho (o resto do tema é teal), lidos dos PDFs.
const FIDELIS_COLORS = { "fidelis-presencial": { titleColor: "#0a4a7e", discColor: "#0a4a7e" }, "fidelis-ead": { titleColor: "#124278", discColor: "#0a4a7e" } };
const CONTENT_TYPES = { ".jpg": "image/jpeg", ".png": "image/png" };

const out = new URL("../seeds/", import.meta.url);
const assetsDir = new URL("assets/", out);
rmSync(assetsDir, { recursive: true, force: true });
mkdirSync(assetsDir, { recursive: true });
mkdirSync(new URL("data/", out), { recursive: true });

const assets = new Map(); // chave -> { file, filename, contentType }
function addAsset(relativePath) {
  const extension = extname(relativePath);
  const key = basename(relativePath, extension);
  if (!assets.has(key)) assets.set(key, { file: join(source, relativePath), filename: basename(relativePath), contentType: CONTENT_TYPES[extension] });
  return key;
}

const calendars = SLUGS.map((slug) => {
  const data = JSON.parse(readFileSync(join(source, `${slug}.json`), "utf8"));
  // Fotos CMYK de 2480 px vêm também em RGB (o Chromium só renderiza bem a RGB).
  const header = addAsset(data.headerImageFileRgb ?? data.headerImageFile);
  const logo = addAsset(data.logoFile.replace(/\.svg$/, ".png"));
  // Dias "meio a meio" nos PDFs (duas categorias na mesma data) entram como marcações extras da data.
  const secondary = (data.secondaryMarks ?? []).map((mark) => ({ ...mark }));
  const content = { ...data.content, marks: [...data.content.marks, ...secondary], headerImageMediaId: null, logoMediaId: null };
  if (FIDELIS_COLORS[slug]) content.theme = { ...content.theme, ...FIDELIS_COLORS[slug] };
  return { slug, sector: data.sector, name: data.name, year: data.year, header, logo, content };
});

const index = [];
for (const [key, asset] of assets) {
  const data = readFileSync(asset.file).toString("base64");
  writeFileSync(new URL(`${key}.ts`, assetsDir), `// GERADO — ${asset.filename}\nconst data = "${data}";\nexport default data;\n`);
  index.push(`  "${key}": { filename: ${JSON.stringify(asset.filename)}, contentType: "${asset.contentType}", load: async () => (await import("./${key}")).default },`);
}
writeFileSync(
  new URL("index.ts", assetsDir),
  `// GERADO por scripts/gen-seed.mjs — fotos de cabeçalho e logos dos calendários de 2026, um módulo por\n// arquivo, carregado sob demanda pra não pesar no bundle de quem não roda o seed.\nexport type SeedAsset = { filename: string; contentType: string; load: () => Promise<string> };\n\nexport const SEED_ASSETS: Record<string, SeedAsset> = {\n${index.join("\n")}\n};\n`,
);

writeFileSync(
  new URL("data/calendarios-2026.ts", out),
  `// GERADO por scripts/gen-seed.mjs a partir dos PDFs de 2026 do marketing — não editar à mão.\nimport type { CalendarContent } from "../../contracts/types";\n\nexport type SeedCalendar = {\n  slug: string;\n  sector: "colegio-erasto-gaertner" | "faculdade-fidelis";\n  name: string;\n  year: number;\n  // chaves de SEED_ASSETS\n  header: string;\n  logo: string;\n  // Conteúdo completo, sem herança (o seed deriva o calendário-base do Colégio).\n  content: CalendarContent;\n};\n\nexport const CALENDARIOS_2026: SeedCalendar[] = ${JSON.stringify(calendars, null, 2)};\n`,
);
console.log(`ok: ${calendars.length} calendários, ${assets.size} arquivos`);
