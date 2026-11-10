// Gera shared/render/fonts.generated.ts a partir dos woff2 de @fontsource/montserrat (licença OFL):
//   npm pack @fontsource/montserrat@5.3.0 && tar -xzf fontsource-montserrat-5.3.0.tgz
//   node scripts/gen-fonts.mjs <pasta package/files>
// As fontes vão embutidas em data: URI para o PDF não depender de rede no momento do render. O
// modelo impresso de 2026 usa Gotham (licenciada) + Montserrat; aqui tudo é Montserrat, que é a
// substituta mais próxima de Gotham nos pesos Book/Light/Medium.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("Uso: node scripts/gen-fonts.mjs <pasta com os woff2 do fontsource>");

// peso + estilo realmente usados pelo render (shared/render/style.ts)
const FACES = [
  [300, "normal"],
  [300, "italic"],
  [400, "normal"],
  [500, "italic"],
  [600, "normal"],
  [700, "normal"],
  [800, "italic"],
];

const rules = FACES.map(([weight, style]) => {
  const data = readFileSync(join(dir, `montserrat-latin-${weight}-${style}.woff2`)).toString("base64");
  return `  \`@font-face { font-family: "Montserrat"; font-style: ${style}; font-weight: ${weight}; font-display: block; src: url(data:font/woff2;base64,${data}) format("woff2"); }\``;
});

writeFileSync(
  new URL("../shared/render/fonts.generated.ts", import.meta.url),
  `// GERADO por scripts/gen-fonts.mjs a partir dos woff2 de @fontsource/montserrat 5.3.0 (licença OFL) —
// não editar à mão. Subset latin (cobre o português), pesos 300/400/600/700 e itálicos 300/500/800.
export const MONTSERRAT_FONT_FACES = [\n${rules.join(",\n")},\n].join("\\n");\n`,
);
console.log(`ok: ${FACES.length} fontes`);
