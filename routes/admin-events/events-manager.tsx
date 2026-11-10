"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Input,
  Textarea,
} from "@venore/plugin-sdk/ui";
import type { EventRecord } from "../../contracts/types";
import { eventCoverPath, sectorDefaultCoverPath } from "../../shared/event-cover";
import { deleteEventAction, saveEventAction, setSectorEventCoverAction, type EventFormInput } from "../admin/actions";
import { CoverField } from "./cover-field";

type Draft = { title: string; startDate: string; endDate: string };

const EMPTY: EventFormInput = { title: "", detail: "", location: "", startDate: "", endDate: "", startTime: "", endTime: "", coverMediaId: "" };

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

// "14/09 a 18/09 · 19:30–21:00" — datas locais, sem fuso.
function formatWhen(event: EventRecord): string {
  const dates = event.endDate ? `${formatDate(event.startDate)} a ${formatDate(event.endDate)}` : formatDate(event.startDate);
  const times = event.startTime ? ` · ${event.startTime}${event.endTime ? `–${event.endTime}` : ""}` : "";
  return dates + times;
}

function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

export function EventsManager({
  sectorId,
  sectorSlug,
  defaultCoverVersion,
  hasDefaultCover,
  events,
  canEdit,
  draft,
}: {
  sectorId: string;
  sectorSlug: string;
  // Muda quando a imagem padrão do setor muda (evita imagem velha em cache na tela).
  defaultCoverVersion: string;
  hasDefaultCover: boolean;
  events: EventRecord[];
  canEdit: boolean;
  draft: Draft | null;
}) {
  const router = useRouter();
  // Imagem recém-enviada no formulário, ainda não salva (id -> URL para a miniatura).
  const [uploadedCover, setUploadedCover] = useState<{ id: string; url: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string | null; fields: EventFormInput } | null>(
    draft && canEdit ? { id: null, fields: { ...EMPTY, title: draft.title, startDate: draft.startDate, endDate: draft.endDate === draft.startDate ? "" : draft.endDate } } : null,
  );
  const [removing, setRemoving] = useState<EventRecord | null>(null);
  const [pending, startTransition] = useTransition();

  const now = today();
  const upcoming = events.filter((event) => (event.endDate ?? event.startDate) >= now);
  const past = events.filter((event) => (event.endDate ?? event.startDate) < now).reverse();

  const defaultCoverUrl = `${sectorDefaultCoverPath(sectorSlug)}?v=${defaultCoverVersion}`;
  const setDefaultCover = (mediaId: string | null) =>
    startTransition(async () => {
      const result = await setSectorEventCoverAction(sectorId, mediaId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(mediaId ? "Imagem padrão atualizada." : "Imagem padrão removida — volta o placeholder.");
      router.refresh();
    });

  const save = () =>
    startTransition(async () => {
      if (!editing) return;
      const result = await saveEventAction(sectorId, editing.id, editing.fields);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(editing.id ? "Evento atualizado." : "Evento criado.");
      setEditing(null);
      setUploadedCover(null);
      router.replace(`/admin/calendarios/eventos/${sectorId}`);
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      if (!removing) return;
      const result = await deleteEventAction(sectorId, removing.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`“${result.data.title}” apagado.`);
      setRemoving(null);
      router.refresh();
    });

  const fields = editing?.fields;
  const patch = (change: Partial<EventFormInput>) => setEditing((current) => (current ? { ...current, fields: { ...current.fields, ...change } } : current));

  const renderList = (list: EventRecord[]) =>
    list.map((event) => (
      <Card key={event.id}>
        <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${eventCoverPath(event.id)}?v=${new Date(event.updatedAt).getTime()}`} alt="" loading="lazy" className="aspect-video w-32 shrink-0 rounded-md border bg-muted object-cover" />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-medium">{event.title}</p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="size-4" />
                {formatWhen(event)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" />
                  {event.location}
                </span>
              )}
            </p>
            {event.detail && <p className="whitespace-pre-line text-sm">{event.detail}</p>}
          </div>
          {canEdit && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setEditing({
                    id: event.id,
                    fields: {
                      title: event.title,
                      detail: event.detail ?? "",
                      location: event.location ?? "",
                      startDate: event.startDate,
                      endDate: event.endDate ?? "",
                      startTime: event.startTime ?? "",
                      endTime: event.endTime ?? "",
                      coverMediaId: event.coverMediaId ?? "",
                    },
                  })
                }
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setRemoving(event)}>
                <Trash2 className="size-4" />
                Apagar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    ));

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <CoverField
            label="Imagem padrão dos eventos deste setor"
            hint="Aparece nas TVs e no site para todo evento que não tem imagem própria. Sem ela, entra um placeholder neutro. Use uma imagem 16:9 (ex.: 1280×720)."
            previewUrl={defaultCoverUrl}
            isCustom={hasDefaultCover}
            disabled={!canEdit || pending}
            onUploaded={(mediaId) => setDefaultCover(mediaId)}
            onClear={() => setDefaultCover(null)}
          />
        </CardContent>
      </Card>

      {canEdit && (
        <Button onClick={() => setEditing({ id: null, fields: { ...EMPTY } })}>
          <Plus className="size-4" />
          Novo evento
        </Button>
      )}

      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarClock className="size-8" strokeWidth={1.5} />}
          title="Nenhum evento cadastrado"
          description="Cadastre aqui o que deve aparecer nas TVs e no site, com o tema e o horário. Dica: no editor do calendário, o botão de evento ao lado de uma data marcada já abre este formulário preenchido."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              Próximos <Badge variant="secondary">{upcoming.length}</Badge>
            </h2>
            {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum evento futuro.</p> : renderList(upcoming)}
          </section>
          {past.length > 0 && (
            <details className="space-y-3">
              <summary className="cursor-pointer text-sm font-semibold">Passados ({past.length})</summary>
              <div className="mt-3 space-y-3">{renderList(past)}</div>
            </details>
          )}
        </>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          {fields && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                save();
              }}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>{editing?.id ? "Editar evento" : "Novo evento"}</DialogTitle>
                <DialogDescription>Aparece nas TVs ligadas a este setor e na página pública de calendários.</DialogDescription>
              </DialogHeader>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Título</span>
                <Input value={fields.title} maxLength={160} required onChange={(event) => patch({ title: event.target.value })} placeholder="Ex.: Semana Acadêmica" />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Tema / descrição</span>
                <Textarea rows={3} value={fields.detail} maxLength={2000} onChange={(event) => patch({ detail: event.target.value })} placeholder="Ex.: “Fé e ciência: diálogos possíveis”" />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Local</span>
                <Input value={fields.location} maxLength={160} onChange={(event) => patch({ location: event.target.value })} placeholder="Ex.: Auditório principal" />
              </label>
              <CoverField
                label="Imagem do evento"
                hint={fields.coverMediaId ? "Imagem própria deste evento." : "Sem imagem própria: vale a imagem padrão do setor (ou o placeholder)."}
                previewUrl={
                  fields.coverMediaId && uploadedCover?.id === fields.coverMediaId
                    ? uploadedCover.url
                    : fields.coverMediaId && editing?.id
                      ? `${eventCoverPath(editing.id)}?v=${Date.now()}`
                      : defaultCoverUrl
                }
                isCustom={Boolean(fields.coverMediaId)}
                onUploaded={(mediaId, url) => {
                  setUploadedCover({ id: mediaId, url });
                  patch({ coverMediaId: mediaId });
                }}
                onClear={() => patch({ coverMediaId: "" })}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Início</span>
                  <Input type="date" value={fields.startDate} required onChange={(event) => patch({ startDate: event.target.value })} />
                </label>
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Término (se durar mais de um dia)</span>
                  <Input type="date" value={fields.endDate} min={fields.startDate || undefined} onChange={(event) => patch({ endDate: event.target.value })} />
                </label>
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Horário de início</span>
                  <Input type="time" value={fields.startTime} onChange={(event) => patch({ startTime: event.target.value })} />
                </label>
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Horário de término</span>
                  <Input type="time" value={fields.endTime} onChange={(event) => patch({ endTime: event.target.value })} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Sem horário, o evento é de dia inteiro.</p>
              <DialogFooter>
                <Button type="submit" disabled={pending || !fields.title.trim() || !fields.startDate}>
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar “{removing?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>O evento sai das TVs e do site. Não dá para desfazer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={remove}>
              Apagar evento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
