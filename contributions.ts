import type { PluginContributions } from "@venore/plugin-sdk";
import { calendariosBreadcrumbSegments } from "./breadcrumbs";
import { calendariosSeeds } from "./seeds";

export const calendariosContributions: PluginContributions = {
  breadcrumbSegments: calendariosBreadcrumbSegments,
  seeds: calendariosSeeds,
};
