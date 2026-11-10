// Fundo do círculo de uma data com 1 a 3 categorias: cor cheia, metade/metade na diagonal (como no
// PDF de 2026) ou três fatias iguais. Recebe só #rrggbb já validado.
export function circleBackground(colors: string[]): string {
  const [first, second, third] = colors;
  if (!first) return "transparent";
  if (!second) return first;
  if (!third) return `linear-gradient(135deg, ${first} 50%, ${second} 50%)`;
  return `conic-gradient(${first} 0 33.34%, ${second} 33.34% 66.67%, ${third} 66.67% 100%)`;
}
