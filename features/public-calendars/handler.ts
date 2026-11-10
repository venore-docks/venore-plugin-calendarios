import { getPublishedFile, listPublished } from "./service";
import type { GetPublishedFileInput, GetPublishedFileResult, ListPublishedResult } from "./types";

// Sem authorizeActor DE PROPÓSITO: o calendário publicado é para o público externo (os sites do
// colégio e da faculdade). Só entrega o que o banco aponta como publicado — nunca rascunho, nunca
// um id de mídia vindo do request.
export async function listPublishedHandler(): Promise<ListPublishedResult> {
  return listPublished();
}

export async function getPublishedFileHandler(input: GetPublishedFileInput): Promise<GetPublishedFileResult> {
  return getPublishedFile(input);
}
