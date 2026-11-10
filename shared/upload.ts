import { uploadReservedCategoryAsset } from "@venore/plugin-sdk/media";
import type { UploadReservedCategoryAssetResult } from "@venore/plugin-sdk/media";
import { CALENDARIOS_FILES_CATEGORY } from "./permissions";

// Envio pra categoria do plugin. O driver de storage (Vercel Blob/S3) LANÇA em vez de devolver erro
// — ex: "Vercel Blob: This store has been suspended" — e a tela só mostraria uma falha genérica.
export async function uploadCalendariosFile(input: {
  filename: string;
  contentType: string;
  data: Buffer;
  allowedMimeCategories?: string[];
}): Promise<UploadReservedCategoryAssetResult> {
  try {
    return await uploadReservedCategoryAsset({
      filename: input.filename,
      contentType: input.contentType,
      size: input.data.byteLength,
      data: input.data,
      categoryKey: CALENDARIOS_FILES_CATEGORY.key,
      categoryName: CALENDARIOS_FILES_CATEGORY.name,
      allowedMimeCategories: input.allowedMimeCategories,
    });
  } catch (cause) {
    return {
      success: false,
      error: {
        code: "calendarios.storage_failed",
        message: `O armazenamento de arquivos do site recusou "${input.filename}": ${cause instanceof Error ? cause.message : String(cause)}`,
      },
    };
  }
}
