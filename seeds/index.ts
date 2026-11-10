import type { PluginSeedFn } from "@venore/plugin-sdk";
import { seedCalendarios2026 } from "./calendarios-2026";

// Ponto de extensão "seeds" do plugin engine — a chave bate com a `key` declarada em manifest.seeds.
export const calendariosSeeds: Record<string, PluginSeedFn> = {
  "calendarios-2026": seedCalendarios2026,
};
