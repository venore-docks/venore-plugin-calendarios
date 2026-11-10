export type LoadedMedia = { bytes: Uint8Array; contentType: string };
export type MediaLoader = (mediaId: string) => Promise<LoadedMedia | null>;
