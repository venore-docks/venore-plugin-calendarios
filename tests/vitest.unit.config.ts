import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes unitários do plugin (motor de calendário, render, schema) a partir do core — mesmos
// aliases de vitest.plugins.config.ts do core. Rodar com scripts/run-tests.ps1 (cria o junction de
// node_modules). CORE_DIR aponta o clone do core (default ../venore-docks).
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url)).replaceAll("\\", "/");
const core = process.env.CORE_DIR ?? here("../../venore-docks");

export default defineConfig({
  root: core,
  resolve: {
    alias: [
      { find: /^@venore\/plugin-sdk$/, replacement: `${core}/src/sdk/index.ts` },
      { find: /^@venore\/plugin-sdk\/(.*)$/, replacement: `${core}/src/sdk/$1.ts` },
      { find: /^server-only$/, replacement: `${core}/src/test-support/stubs/server-only.ts` },
      { find: "@", replacement: `${core}/src` },
    ],
  },
  server: { fs: { strict: false } },
  test: {
    environment: "node",
    // Só as pastas do plugin (o junction de node_modules fica dentro da raiz do plugin).
    include: ["shared", "features", "seeds", "routes", "contracts"].map((dir) => here(`../${dir}/**/*.test.{ts,tsx}`)),
    exclude: ["**/node_modules/**"],
    testTimeout: 60000,
  },
});
