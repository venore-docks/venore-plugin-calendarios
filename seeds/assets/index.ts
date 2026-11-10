// GERADO por scripts/gen-seed.mjs — fotos de cabeçalho e logos dos calendários de 2026, um módulo por
// arquivo, carregado sob demanda pra não pesar no bundle de quem não roda o seed.
export type SeedAsset = { filename: string; contentType: string; load: () => Promise<string> };

export const SEED_ASSETS: Record<string, SeedAsset> = {
  "header-erasto-educacao-infantil-rgb": { filename: "header-erasto-educacao-infantil-rgb.jpg", contentType: "image/jpeg", load: async () => (await import("./header-erasto-educacao-infantil-rgb")).default },
  "logo-erasto": { filename: "logo-erasto.png", contentType: "image/png", load: async () => (await import("./logo-erasto")).default },
  "header-erasto-ensino-fundamental-i-rgb": { filename: "header-erasto-ensino-fundamental-i-rgb.jpg", contentType: "image/jpeg", load: async () => (await import("./header-erasto-ensino-fundamental-i-rgb")).default },
  "header-erasto-ensino-fundamental-ii-medio": { filename: "header-erasto-ensino-fundamental-ii-medio.jpg", contentType: "image/jpeg", load: async () => (await import("./header-erasto-ensino-fundamental-ii-medio")).default },
  "header-erasto-medio-hunters-rgb": { filename: "header-erasto-medio-hunters-rgb.jpg", contentType: "image/jpeg", load: async () => (await import("./header-erasto-medio-hunters-rgb")).default },
  "header-fidelis-presencial": { filename: "header-fidelis-presencial.jpg", contentType: "image/jpeg", load: async () => (await import("./header-fidelis-presencial")).default },
  "logo-fidelis": { filename: "logo-fidelis.png", contentType: "image/png", load: async () => (await import("./logo-fidelis")).default },
  "header-fidelis-ead": { filename: "header-fidelis-ead.jpg", contentType: "image/jpeg", load: async () => (await import("./header-fidelis-ead")).default },
};
