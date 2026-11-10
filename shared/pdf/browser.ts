import { existsSync } from "node:fs";
import type { Browser } from "puppeteer-core";

// Chromium headless pra imprimir o calendário (PDF) e tirar o PNG — mesmo motor do plugin Listas de
// materiais, então o PDF e a imagem saem idênticos.
//
// - Linux (Vercel / self-host em container): @sparticuz/chromium-min baixa o "pack" do Chromium na
//   primeira execução pra /tmp e reaproveita nas quentes. O pack fica fora do bundle de propósito
//   (limite de tamanho de função da Vercel). CALENDARIOS_CHROMIUM_PACK_URL troca a origem (ex: um
//   bucket próprio, mais perto da função).
// - Windows/macOS (dev local): Chrome/Edge instalado; CALENDARIOS_CHROME_PATH força um binário.
const CHROMIUM_PACK_VERSION = "153.0.0";
const DEFAULT_CHROMIUM_PACK_URL = `https://github.com/Sparticuz/chromium/releases/download/v${CHROMIUM_PACK_VERSION}/chromium-v${CHROMIUM_PACK_VERSION}-pack.x64.tar`;

const LOCAL_BROWSER_CANDIDATES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

export async function launchPdfBrowser(): Promise<Browser> {
  const puppeteer = (await import("puppeteer-core")).default;
  const explicitPath = process.env.CALENDARIOS_CHROME_PATH;

  if (explicitPath || process.platform !== "linux") {
    const executablePath = explicitPath ?? LOCAL_BROWSER_CANDIDATES.find((candidate) => existsSync(candidate));
    if (!executablePath) {
      throw new Error("Nenhum Chrome/Edge encontrado para gerar o PDF — defina CALENDARIOS_CHROME_PATH.");
    }
    return puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  }

  const chromium = (await import("@sparticuz/chromium-min")).default;
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(process.env.CALENDARIOS_CHROMIUM_PACK_URL || DEFAULT_CHROMIUM_PACK_URL),
    headless: true,
  });
}
