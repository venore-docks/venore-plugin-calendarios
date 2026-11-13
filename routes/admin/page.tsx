import Link from "next/link";
import { CalendarClock, CalendarDays, Download, ExternalLink, FileText, Users } from "lucide-react";
import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { AdminAccessDenied, AdminPageHeader, Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@venore/plugin-sdk/ui";
import { listOverview, publishedFilePath } from "../../index";
import { canSeeWorkInProgress } from "../../shared/access";
import { EditionStatusBadge, fileHref, formatDateTime } from "../../shared/ui/status-badge";
import { CopyLinkButton, DeleteButton, EditCalendarDialog, StartNextYearButton } from "./calendar-tools";
import { CreateCalendarDialog } from "./create-calendar-dialog";
import { CreateSectorDialog } from "./create-sector-dialog";

export default async function CalendariosAdminPage() {
  const gate = await getPluginAdminPageData("calendarios");
  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver os calendários." />;
  }

  const result = await listOverview();
  if (!result.success) {
    return <p className="text-sm text-destructive">Erro ao carregar os calendários: {result.error.message}</p>;
  }
  const { sectors, isAdmin } = result.data;
  const nextSchoolYear = new Date().getFullYear() + 1;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Calendários"
        description="Cada setor marca as datas do seu calendário, valida e publica o PDF e a imagem finais. Os arquivos publicados têm um link fixo para os sites."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/calendarios" target="_blank">
                <ExternalLink className="size-4" />
                Ver página pública
              </Link>
            </Button>
            {isAdmin && <CreateSectorDialog />}
          </div>
        }
      />

      {sectors.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="size-8" strokeWidth={1.5} />}
          title="Nenhum calendário por aqui"
          description={
            isAdmin
              ? "Para trazer os calendários de 2026 (Colégio Erasto Gaertner e Faculdade Fidelis), use “Popular dados de exemplo” deste plugin em Plugins. Também é possível começar criando um setor."
              : "Ainda não há calendário publicado. Quando um setor publicar, ele aparece aqui."
          }
          action={isAdmin ? <CreateSectorDialog /> : undefined}
        />
      ) : (
        sectors.map((sector) => {
          const canEdit = sector.caps.edit;
          // O base pode ser de outro setor ("base geral"): as opções são todos os bases que a pessoa enxerga, os de
          // outros setores com o nome do setor ao lado.
          const bases = sectors.flatMap((owner) =>
            owner.calendars
              .filter((calendar) => calendar.isBase)
              .map((calendar) => ({ id: calendar.id, name: owner.id === sector.id ? calendar.name : `${calendar.name} (${owner.name})` })),
          );
          return (
            <section key={sector.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{sector.name}</h2>
                  {isAdmin && (
                    <Badge variant="outline">
                      {sector.memberCount} {sector.memberCount === 1 ? "membro" : "membros"}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit && <CreateCalendarDialog sectorId={sector.id} sectorName={sector.name} defaultYear={nextSchoolYear - 1} bases={bases} />}
                  {canSeeWorkInProgress(sector.caps) && (
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/calendarios/eventos/${sector.id}`}>
                        <CalendarClock className="size-4" />
                        Eventos (TV e site)
                      </Link>
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/calendarios/membros/${sector.id}`}>
                          <Users className="size-4" />
                          Membros
                        </Link>
                      </Button>
                      <DeleteButton
                        kind="sector"
                        id={sector.id}
                        name={sector.name}
                        description="Apaga o setor com todos os calendários, versões validadas e histórico. Não dá para desfazer, e os links fixos publicados deixam de funcionar."
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sector.calendars.map((calendar) => {
                  const [latest, ...older] = calendar.editions;
                  const lastPublished = calendar.editions.find((edition) => edition.hasPublished);
                  return (
                    <Card key={calendar.id} className="flex flex-col">
                      <CardHeader className="space-y-2">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                          {calendar.name}
                          {calendar.isBase && <Badge variant="secondary">Base</Badge>}
                        </CardTitle>
                        {calendar.baseName && <p className="text-xs text-muted-foreground">Herda de {calendar.baseName}</p>}
                        {latest ? (
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{latest.year}</span>
                            {!calendar.isBase && <EditionStatusBadge status={latest.status} />}
                            <span>atualizado em {formatDateTime(latest.updatedAt)}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sem calendário cadastrado.</p>
                        )}
                      </CardHeader>
                      <CardContent className="mt-auto space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {latest && canSeeWorkInProgress(sector.caps) ? (
                            <Button size="sm" asChild>
                              <Link href={`/admin/calendarios/${latest.id}`}>
                                <FileText className="size-4" />
                                Abrir {latest.year}
                              </Link>
                            </Button>
                          ) : null}
                          {lastPublished && (
                            <>
                              <Button size="sm" variant="outline" asChild>
                                <a href={fileHref(lastPublished.id, "publicada", "pdf")}>
                                  <Download className="size-4" />
                                  PDF {lastPublished.year}
                                </a>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <a href={fileHref(lastPublished.id, "publicada", "png")} target="_blank" rel="noreferrer">
                                  <Download className="size-4" />
                                  PNG {lastPublished.year}
                                </a>
                              </Button>
                            </>
                          )}
                        </div>
                        {lastPublished && (
                          <div className="flex flex-wrap gap-1">
                            <CopyLinkButton label="do PDF" path={publishedFilePath(sector.slug, calendar.slug, "atual", "pdf")} />
                            <CopyLinkButton label="da imagem" path={publishedFilePath(sector.slug, calendar.slug, "atual", "png")} />
                            <CopyLinkButton label="de incorporação (iframe)" path={`/ext/calendarios/embed/${sector.slug}/${calendar.slug}`} />
                          </div>
                        )}
                        {canEdit && (
                          <div className="flex flex-wrap gap-1">
                            {latest && <StartNextYearButton calendarId={calendar.id} calendarName={calendar.name} fromYear={latest.year} />}
                            <EditCalendarDialog
                              calendar={{
                                id: calendar.id,
                                name: calendar.name,
                                baseCalendarId: calendar.baseCalendarId,
                                isBase: calendar.isBase,
                                fileNameTemplate: calendar.fileNameTemplate,
                              }}
                              bases={bases}
                            />
                            {isAdmin && (
                              <DeleteButton
                                kind="calendar"
                                id={calendar.id}
                                name={calendar.name}
                                description="Apaga todos os anos deste calendário, com versões validadas e histórico. Não dá para desfazer, e o link fixo publicado deixa de funcionar."
                              />
                            )}
                          </div>
                        )}
                        {older.length > 0 && sector.caps.edit && (
                          <p className="text-xs text-muted-foreground">
                            Anos anteriores:{" "}
                            {older.map((edition, index) => (
                              <span key={edition.id}>
                                {index > 0 && " · "}
                                <Link className="underline underline-offset-2" href={`/admin/calendarios/${edition.id}`}>
                                  {edition.year}
                                </Link>
                              </span>
                            ))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                {sector.calendars.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum calendário neste setor ainda.</p>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
