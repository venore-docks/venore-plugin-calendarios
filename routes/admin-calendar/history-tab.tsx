import type { EditionEventAction } from "../../contracts/types";
import type { EditionEventView } from "../../features/get-edition/types";
import { formatDateTime } from "../../shared/ui/status-badge";

const ACTION_LABELS: Record<EditionEventAction, string> = {
  created: "criou o calendário",
  saved: "salvou alterações",
  submitted: "enviou para validação",
  approved: "validou",
  rejected: "devolveu para ajustes",
  published: "publicou o PDF e a imagem",
};

export function HistoryTab({ events }: { events: EditionEventView[] }) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">Sem histórico ainda.</p>;
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-md border p-3 text-sm">
          <p>
            <span className="font-medium">{event.actorName}</span> {ACTION_LABELS[event.action] ?? event.action}
            <span className="ml-2 text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
          </p>
          {event.note && <p className="mt-1 text-muted-foreground">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}
