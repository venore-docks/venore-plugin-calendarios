import { headers } from "next/headers";
import { getMediaAssetForTrustedReview } from "@venore/plugin-sdk/media";
import type { LoadedMedia, MediaLoader } from "./pdf/types";
import { CALENDARIOS_PERMISSIONS } from "./permissions";

async function resolveRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

// Lê os bytes de foto/logo/PDF/PNG do plugin. Só chamar com um id que veio do banco (revisão ou
// edição) ou depois de o handler já ter autorizado. getMediaAssetForTrustedReview devolve URL
// assinada curta (o arquivo é "restricted"); o filtro por accessPermission garante que um id
// vindo do documento (editável pelo cliente) só alcança arquivo DESTA categoria — nunca um arquivo
// privado qualquer da plataforma.
export async function createMediaLoader(): Promise<MediaLoader> {
  const origin = await resolveRequestOrigin();
  return async (mediaId): Promise<LoadedMedia | null> => {
    const asset = await getMediaAssetForTrustedReview({ id: mediaId });
    if (!asset.success || !asset.data || asset.data.deletedAt) return null;
    if (asset.data.accessPermission !== CALENDARIOS_PERMISSIONS.read) return null;

    const response = await fetch(new URL(asset.data.url, origin), { cache: "no-store" });
    if (!response.ok) return null;
    return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: asset.data.contentType };
  };
}
