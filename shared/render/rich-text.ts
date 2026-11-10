// O HTML vai pra um Chromium no servidor: o texto é escapado inteiro e só um punhado de tags inline
// sem atributo volta a valer (nada de <img>, <link>, <style> ou atributos vindos de quem edita).
const ALLOWED_INLINE_TAGS = ["b", "strong", "i", "em", "u"];

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ALLOWED_TAG_PATTERN = new RegExp(`&lt;(/?)(${ALLOWED_INLINE_TAGS.join("|")})&gt;`, "gi");
const BR_PATTERN = /&lt;br\s*\/?&gt;/gi;

export function renderRichText(value: string): string {
  return escapeHtml(value)
    .replace(ALLOWED_TAG_PATTERN, (_, slash: string, tag: string) => `<${slash}${tag.toLowerCase()}>`)
    .replace(BR_PATTERN, "<br>");
}
