import { asc, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import { calEvents, calSectors } from "../../database/schema";
import { canSeeWorkInProgress, capsFor, requireCap, type Actor } from "../../shared/access";
import { findSectorById } from "../../shared/edition-store";
import { isValidIsoDate } from "../../shared/engine/dates";
import { failure } from "../../shared/results";
import type {
  CreateEventInput,
  CreateEventResult,
  DeleteEventInput,
  DeleteEventResult,
  EventFields,
  ListEventsInput,
  ListEventsResult,
  SetSectorEventCoverInput,
  SetSectorEventCoverResult,
  UpdateEventInput,
  UpdateEventResult,
} from "./types";

type Result = { success: boolean };

function track<T extends Result>(actor: Actor, useCase: string, kind: "read" | "write") {
  const handle = beginOperation({ useCase: `calendarios.${useCase}`, actor: { id: actor.actorId, type: "user" }, kind });
  return (result: T): T => {
    endOperation(handle, result as never);
    return result;
  };
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const blank = (value: string | null | undefined) => (value && value.trim() !== "" ? value.trim() : null);

type Clean = {
  title: string;
  detail: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  // undefined = não mexe na capa.
  coverMediaId?: string | null;
};

const MEDIA_ID = /^[\w-]{1,64}$/;

// Normaliza e valida os campos (vêm do formulário, cliente). String de erro = mensagem pro usuário.
function clean(fields: EventFields): Clean | string {
  const title = fields.title?.trim() ?? "";
  if (!title || title.length > 160) return "Informe o título do evento (até 160 caracteres).";
  const detail = blank(fields.detail);
  if (detail && detail.length > 2000) return "O tema/descrição passa de 2000 caracteres.";
  const location = blank(fields.location);
  if (location && location.length > 160) return "O local passa de 160 caracteres.";
  if (!isValidIsoDate(fields.startDate)) return "Informe a data de início.";
  const endDate = blank(fields.endDate);
  if (endDate && !isValidIsoDate(endDate)) return "A data de término é inválida.";
  if (endDate && endDate < fields.startDate) return "O término vem antes do início.";
  const startTime = blank(fields.startTime);
  const endTime = blank(fields.endTime);
  if ((startTime && !TIME.test(startTime)) || (endTime && !TIME.test(endTime))) return "Horário inválido (use HH:MM).";
  if (endTime && !startTime) return "Informe o horário de início junto com o de término.";
  // Mesmo dia com os dois horários: o término tem de vir depois.
  if (startTime && endTime && (endDate ?? fields.startDate) === fields.startDate && endTime <= startTime) return "O horário de término vem antes do de início.";
  const coverMediaId = fields.coverMediaId === undefined ? undefined : blank(fields.coverMediaId);
  if (coverMediaId && !MEDIA_ID.test(coverMediaId)) return "Imagem inválida — envie de novo.";
  return {
    title,
    detail,
    location,
    startDate: fields.startDate,
    endDate: endDate && endDate !== fields.startDate ? endDate : null,
    startTime,
    endTime,
    ...(coverMediaId === undefined ? {} : { coverMediaId }),
  };
}

// Eventos públicos são do setor: quem atua nele vê todos (inclusive os passados, para reaproveitar).
export async function listEvents(actor: Actor, input: ListEventsInput): Promise<ListEventsResult> {
  const finish = track<ListEventsResult>(actor, "list-events", "read");
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  const caps = await capsFor(actor, sector.id);
  if (!canSeeWorkInProgress(caps)) return finish(failure("forbidden_sector", "Você não atua neste setor."));
  const events = await db.select().from(calEvents).where(eq(calEvents.sectorId, sector.id)).orderBy(asc(calEvents.startDate), asc(calEvents.startTime));
  return finish({ success: true, data: { sector, caps, events } });
}

// Cadastrar/editar/apagar evento = quem EDITA o setor. Não passa por validação nem mexe no PDF.
export async function createEvent(actor: Actor, input: CreateEventInput): Promise<CreateEventResult> {
  const finish = track<CreateEventResult>(actor, "create-event", "write");
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  const allowed = await requireCap(actor, sector.id, "edit");
  if (!allowed.success) return finish(allowed);
  const fields = clean(input);
  if (typeof fields === "string") return finish(failure("invalid_event", fields));

  const [row] = await db.insert(calEvents).values({ sectorId: sector.id, ...fields, updatedBy: actor.actorId }).returning();
  return finish({ success: true, data: row! });
}

export async function updateEvent(actor: Actor, input: UpdateEventInput): Promise<UpdateEventResult> {
  const finish = track<UpdateEventResult>(actor, "update-event", "write");
  const [current] = await db.select().from(calEvents).where(eq(calEvents.id, input.eventId)).limit(1);
  if (!current) return finish(failure("event_not_found", "Evento não encontrado."));
  const allowed = await requireCap(actor, current.sectorId, "edit");
  if (!allowed.success) return finish(allowed);
  const fields = clean(input);
  if (typeof fields === "string") return finish(failure("invalid_event", fields));

  const [row] = await db.update(calEvents).set({ ...fields, updatedBy: actor.actorId, updatedAt: new Date() }).where(eq(calEvents.id, current.id)).returning();
  return finish({ success: true, data: row! });
}

export async function deleteEvent(actor: Actor, input: DeleteEventInput): Promise<DeleteEventResult> {
  const finish = track<DeleteEventResult>(actor, "delete-event", "write");
  const [current] = await db.select().from(calEvents).where(eq(calEvents.id, input.eventId)).limit(1);
  if (!current) return finish(failure("event_not_found", "Evento não encontrado."));
  const allowed = await requireCap(actor, current.sectorId, "edit");
  if (!allowed.success) return finish(allowed);
  await db.delete(calEvents).where(eq(calEvents.id, current.id));
  return finish({ success: true, data: { title: current.title } });
}

// Imagem padrão dos eventos do setor (vale quando o evento não tem capa própria). Quem edita o setor.
export async function setSectorEventCover(actor: Actor, input: SetSectorEventCoverInput): Promise<SetSectorEventCoverResult> {
  const finish = track<SetSectorEventCoverResult>(actor, "set-sector-event-cover", "write");
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  const allowed = await requireCap(actor, sector.id, "edit");
  if (!allowed.success) return finish(allowed);
  const mediaId = blank(input.mediaId);
  if (mediaId && !MEDIA_ID.test(mediaId)) return finish(failure("invalid_event", "Imagem inválida — envie de novo."));
  await db.update(calSectors).set({ defaultEventCoverMediaId: mediaId }).where(eq(calSectors.id, sector.id));
  return finish({ success: true, data: undefined });
}
