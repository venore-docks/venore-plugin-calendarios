// Caminhos públicos da imagem dos eventos (servidos por routes/api/event-cover.ts, sem login).
export function eventCoverPath(eventId: string): string {
  return `/api/calendarios/eventos/${eventId}/capa`;
}

// Imagem padrão de um setor (a que vale para os eventos sem capa própria) — para a tela de eventos.
export function sectorDefaultCoverPath(sectorSlug: string): string {
  return `/api/calendarios/eventos/padrao/${sectorSlug}/capa`;
}

// Placeholder neutro (SVG 16:9) para evento sem capa própria e setor sem imagem padrão. É o último
// recurso: o setor troca por uma imagem de verdade em Eventos → "Imagem padrão". Cores cruas de
// propósito (é uma imagem, não segue o tema do portal).
export function eventCoverPlaceholderSvg(label: string): string {
  const safe = label.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" role="img" aria-label="Imagem do evento">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f6a82"/><stop offset="1" stop-color="#1f8aa5"/></linearGradient></defs>
<rect width="1280" height="720" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.85" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" transform="translate(540 190)">
<rect x="0" y="30" width="200" height="180" rx="22"/><path d="M0 90h200M55 0v50M145 0v50"/>
</g>
<text x="640" y="520" text-anchor="middle" font-family="Montserrat, Helvetica, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${safe}</text>
<text x="640" y="580" text-anchor="middle" font-family="Montserrat, Helvetica, Arial, sans-serif" font-size="30" fill="#ffffff" fill-opacity="0.8">Imagem provisória do evento</text>
</svg>`;
}
