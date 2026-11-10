import type { PluginManifest } from "@venore/plugin-sdk";

// Faixa escrita à mão, não importada do CORE_VERSION corrente — mesmo motivo do vagasManifest e do
// listasMateriaisManifest: importar a versão corrente tornaria a checagem sempre trivial.
export const calendariosManifest: PluginManifest = {
  manifestVersion: "1.0.0",
  key: "calendarios",
  name: "Calendários",
  version: "0.2.0",
  description:
    "Calendários letivos impressos por setor: o setor marca as datas, valida e publica o PDF e o PNG finais (link estável e página para embutir nos sites) e cadastra os eventos com tema que alimentam as TVs do Broadcast.",
  compatibility: { coreVersion: ">=2.0.0 <3.0.0" },
  migrationsPath: "./migrations",
  permissions: [
    { key: "calendarios.read", label: "Ver calendários e baixar PDF/PNG publicados" },
    {
      key: "calendarios.admin",
      label: "Administrar calendários: setores, membros e todos os calendários (editar, validar, publicar, apagar)",
    },
  ],
  // Foto de cabeçalho, logos e arquivos publicados: legíveis por quem tem calendarios.read.
  restrictedUploadCategories: [{ key: "calendarios.arquivos", accessPermission: "calendarios.read" }],
  navigation: [
    {
      key: "calendarios.admin",
      label: "Calendários",
      href: "/admin/calendarios",
      icon: "calendar-days",
      groupKey: "plugins",
      groupLabel: "Plugins",
      groupOrder: 30,
      order: 45,
      requiredPermission: "calendarios.read",
    },
  ],
  seeds: [
    {
      key: "calendarios-2026",
      label: "Calendários de 2026",
      description: "Colégio Erasto Gaertner (base + 4 calendários) e Faculdade Fidelis (presencial e EaD) com as datas de 2026, reproduzidas dos PDFs do marketing.",
    },
  ],
};
