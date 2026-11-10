import type { OperationResult } from "@venore/plugin-sdk";

// `content` é o documento do editor, ainda NÃO salvo (a prévia acompanha a edição).
export type RenderPreviewInput = { editionId: string; content: unknown };
export type RenderPreviewResult = OperationResult<{ html: string }>;
