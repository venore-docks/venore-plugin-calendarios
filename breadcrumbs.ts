import type { BreadcrumbSegmentDefinition } from "@venore/plugin-sdk";
import { staticBreadcrumbSegment } from "@venore/plugin-sdk";

export const calendariosBreadcrumbSegments: BreadcrumbSegmentDefinition[] = [
  staticBreadcrumbSegment({ key: "calendarios.admin", segments: ["admin", "calendarios"], label: "Calendários" }),
  staticBreadcrumbSegment({ key: "calendarios.members", segments: ["admin", "calendarios", "membros"], label: "Membros" }),
  staticBreadcrumbSegment({ key: "calendarios.events", segments: ["admin", "calendarios", "eventos"], label: "Eventos" }),
];
