import type { OperationResult } from "@venore/plugin-sdk";

// previa = rascunho vivo (com a herança do base) · validada = revisão congelada · publicada = o
// arquivo que foi pro ar.
export type FileSource = "draft" | "approved" | "published";
export type FileFormat = "pdf" | "png";

export type ExportEditionFileInput = { editionId: string; source: FileSource; format: FileFormat };
export type ExportEditionFileResult = OperationResult<{
  bytes: Uint8Array;
  contentType: string;
  fileName: string;
  skipped: string[];
}>;
