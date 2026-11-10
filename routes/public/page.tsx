import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarClock, Download, ExternalLink, MapPin } from "lucide-react";
import { isPluginActive } from "@venore/plugin-sdk";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@venore/plugin-sdk/ui";
import { listPublished, listUpcomingEvents } from "../../index";
import type { PublicEvent } from "../../index";

// Consulta de qualquer colaborador (e do público): os calendários publicados, por setor ou todos.
// Sem login — o calendário publicado é para o público externo; rascunhos nunca chegam aqui.
export default async function CalendariosPublicPage({ searchParams }: { searchParams: Promise<{ setor?: string }> }) {
  if (!(await isPluginActive("calendarios"))) notFound();

  const { setor } = await searchParams;
  const result = await listPublished();
  const sectors = result.success ? result.data : [];
  const visible = setor ? sectors.filter((sector) => sector.slug === setor) : sectors;
  const eventsResult = await listUpcomingEvents({ sectorSlug: setor, limit: 12 });
  const events = eventsResult.success ? eventsResult.data : [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendários</h1>
        <p className="text-sm text-muted-foreground">Calendários letivos publicados. Abra a imagem para ver em tamanho real ou baixe o PDF para imprimir.</p>
      </div>

      {sectors.length > 1 && (
        <nav className="flex flex-wrap gap-2" aria-label="Filtrar por setor">
          <FilterLink href="/calendarios" active={!setor}>
            Todos
          </FilterLink>
          {sectors.map((sector) => (
            <FilterLink key={sector.slug} href={`/calendarios?setor=${sector.slug}`} active={setor === sector.slug}>
              {sector.name}
            </FilterLink>
          ))}
        </nav>
      )}

      {events.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Próximos eventos</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <li key={event.id} className="space-y-1 overflow-hidden rounded-lg border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={event.coverPath} alt="" loading="lazy" className="aspect-video w-full bg-muted object-cover" />
                <div className="space-y-1 p-4">
                <p className="font-medium text-foreground">{event.title}</p>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" />
                  {formatWhen(event)}
                </p>
                {event.location && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {event.location}
                  </p>
                )}
                {event.detail && <p className="whitespace-pre-line pt-1 text-sm text-foreground">{event.detail}</p>}
                {!setor && sectors.length > 1 && <p className="pt-1 text-xs text-muted-foreground">{event.sectorName}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum calendário publicado ainda.</p>
      ) : (
        visible.map((sector) => (
          <section key={sector.slug} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{sector.name}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sector.calendars.map((calendar) => (
                <Card key={calendar.calendarSlug} className="flex flex-col overflow-hidden">
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{calendar.calendarName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{calendar.year}</p>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-4">
                    <a href={calendar.pngPath} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={calendar.pngPath} alt={`Calendário ${calendar.year} — ${calendar.calendarName}`} loading="lazy" className="w-full" />
                    </a>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" asChild>
                        <a href={calendar.pdfPath}>
                          <Download className="size-4" />
                          Baixar PDF
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={calendar.pngPath} target="_blank" rel="noreferrer">
                          <ExternalLink className="size-4" />
                          Abrir imagem
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function formatWhen(event: PublicEvent): string {
  const dates = event.endDate ? `${formatDate(event.startDate)} a ${formatDate(event.endDate)}` : formatDate(event.startDate);
  const times = event.startTime ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ""}` : "";
  return dates + times;
}
