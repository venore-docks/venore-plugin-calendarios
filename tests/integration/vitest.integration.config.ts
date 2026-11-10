import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Config do teste de integração (PGlite) — roda a partir do core (vitest e drizzle-orm dele), ver
// scripts/run-tests.ps1 -Integration. Os imports do SDK viram ./mocks.ts. CORE_DIR aponta o clone do
// core (default ../venore-docks).
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");
const mocks = here("./mocks.ts");

export default defineConfig({
  root: process.env.CORE_DIR ?? here("../../../venore-docks"),
  resolve: {
    alias: [
      { find: /^@venore\/plugin-sdk\/(auth|observability|rbac|media)$/, replacement: mocks },
      { find: /^@venore\/plugin-sdk$/, replacement: mocks },
    ],
  },
  server: { fs: { strict: false } },
  test: {
    environment: "node",
    include: [here("./workflow.integration.test.ts")],
    testTimeout: 60000,
    server: { deps: { inline: [/drizzle-orm/] } },
  },
});
