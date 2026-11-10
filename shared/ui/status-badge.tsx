import { Badge } from "@venore/plugin-sdk/ui";
import type { EditionStatus } from "../../contracts/types";
import { STATUS_LABELS } from "../results";

const VARIANTS: Record<EditionStatus, "secondary" | "outline" | "default"> = {
  draft: "outline",
  in_review: "secondary",
  approved: "secondary",
  published: "default",
};

export function EditionStatusBadge({ status }: { status: EditionStatus }) {
  return <Badge variant={VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>;
}

export type FileVersion = "previa" | "validada" | "publicada";

export function fileHref(editionId: string, version: FileVersion, format: "pdf" | "png"): string {
  return `/api/calendarios/edicoes/${editionId}/arquivo?versao=${version}&formato=${format}`;
}

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function formatDateTime(value: Date | string): string {
  return dateTimeFormat.format(new Date(value));
}
