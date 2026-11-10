import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { AdminAccessDenied, AdminPageHeader, Button } from "@venore/plugin-sdk/ui";
import { listEvents } from "../../index";
import { EventsManager } from "./events-manager";

export default async function CalendariosEventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sectorId: string }>;
  searchParams: Promise<{ titulo?: string; inicio?: string; fim?: string }>;
}) {
  const gate = await getPluginAdminPageData("calendarios");
  if (!gate.granted) return <AdminAccessDenied message="Você não tem permissão para ver os calendários." />;

  const { sectorId } = await params;
  const result = await listEvents({ sectorId });
  if (!result.success) return <p className="text-sm text-destructive">{result.error.message}</p>;
  const { sector, caps, events } = result.data;

  // Vindo de "Criar evento a partir da data" no editor: abre o formulário já preenchido.
  const query = await searchParams;
  const draft = query.inicio ? { title: query.titulo ?? "", startDate: query.inicio, endDate: query.fim ?? "" } : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Eventos — ${sector.name}`}
        description="O que as TVs (Broadcast) e o site anunciam: título, tema, local e horário. É separado do texto impresso do calendário e pode ser editado a qualquer momento, sem refazer a validação do PDF."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/calendarios">
              <ArrowLeft className="size-4" />
              Calendários
            </Link>
          </Button>
        }
      />
      <EventsManager
        sectorId={sector.id}
        sectorSlug={sector.slug}
        hasDefaultCover={sector.defaultEventCoverMediaId !== null}
        defaultCoverVersion={sector.defaultEventCoverMediaId ?? "none"}
        events={events}
        canEdit={caps.edit}
        draft={draft}
      />
    </div>
  );
}
