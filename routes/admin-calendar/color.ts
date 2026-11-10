// Texto branco ou escuro sobre uma cor de categoria (círculo da data na tela), pelo brilho percebido.
export function readableTextColor(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16);
  if (Number.isNaN(value)) return "#ffffff";
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return (red * 299 + green * 587 + blue * 114) / 1000 > 160 ? "#1f2937" : "#ffffff";
}
