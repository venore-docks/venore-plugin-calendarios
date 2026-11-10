import { defineConfig } from "drizzle-kit";

// Migrations próprias do plugin (mesmo padrão de venore-plugin-listas-materiais/drizzle.config.ts):
// tabela de tracking própria, pra não dividir o cursor de "última migration aplicada" com o core.
export default defineConfig({
  schema: ["./database/schema/index.ts"],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  migrations: { schema: "calendarios_migrations", table: "__drizzle_migrations" },
});
