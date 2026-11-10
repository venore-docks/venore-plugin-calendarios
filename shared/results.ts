import type { OperationResult } from "@venore/plugin-sdk";

export function failure<T = never>(code: string, message: string): OperationResult<T> {
  return { success: false, error: { code: `calendarios.${code}`, message } };
}

export const STATUS_LABELS = {
  draft: "Rascunho",
  in_review: "Aguardando validação",
  approved: "Validado",
  published: "Publicado",
} as const;
