import { notFound } from "next/navigation";
import { isPluginActive } from "@venore/plugin-sdk";
import { listPublished, publishedFilePath } from "../../index";

// Calendário publicado para EMBUTIR em outro site (WordPress) num <iframe>, sem a casca do portal —
// mesmo tipo de rota "standalone" (/ext/…) das telas do Erasto League para as TVs. Sem login.
//   /ext/calendarios/embed/<setor>/<calendario>            ano publicado mais recente
//   /ext/calendarios/embed/<setor>/<calendario>?ano=2026   um ano específico
//
// ATENÇÃO: para um site de fora conseguir embutir, o portal precisa liberar o domínio dele em
// FRAME_ANCESTORS (variável de ambiente do core; ex.: "'self' https://www.erasto.com.br").
export default async function CalendarEmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ sector: string; calendar: string }>;
  searchParams: Promise<{ ano?: string }>;
}) {
  if (!(await isPluginActive("calendarios"))) notFound();

  const { sector, calendar } = await params;
  const { ano } = await searchParams;
  const result = await listPublished();
  const published = result.success ? result.data.find((item) => item.slug === sector)?.calendars.find((item) => item.calendarSlug === calendar) : undefined;
  if (!published) notFound();

  // O link `atual` acompanha o ano publicado mais recente; com ?ano= fixa o ano pedido.
  const year = ano && /^\d{4}$/.test(ano) ? Number(ano) : "atual";
  const png = publishedFilePath(sector, calendar, year, "png");
  const pdf = publishedFilePath(sector, calendar, year, "pdf");
  const label = `Calendário ${year === "atual" ? published.year : year} — ${published.calendarName}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-2 bg-background p-2">
      <a href={png} target="_blank" rel="noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={png} alt={label} className="h-auto w-full" />
      </a>
      <p className="text-center text-sm">
        <a href={pdf} className="text-primary underline underline-offset-2">
          Baixar o PDF
        </a>
      </p>
    </div>
  );
}
