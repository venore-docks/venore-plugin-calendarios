import type { OperationResult } from "@venore/plugin-sdk";

export type PublishedCalendar = {
  // Caminhos relativos à origem do portal; a página/rota monta a URL absoluta.
  sectorSlug: string;
  calendarSlug: string;
  calendarName: string;
  year: number;
  publishedAt: Date;
  pdfPath: string;
  pngPath: string;
};

export type PublishedSector = { slug: string; name: string; calendars: PublishedCalendar[] };

export type ListPublishedResult = OperationResult<PublishedSector[]>;

export type GetPublishedFileInput = {
  sectorSlug: string;
  calendarSlug: string;
  // null = o ano publicado mais recente ("atual").
  year: number | null;
  format: "pdf" | "png";
};

export type PublishedFile = {
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
  // Muda a cada nova publicação: serve de ETag.
  mediaId: string;
};
export type GetPublishedFileResult = OperationResult<PublishedFile>;
