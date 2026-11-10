import { resolveActor } from "../../shared/access";
import { createEvent, deleteEvent, listEvents, setSectorEventCover, updateEvent } from "./service";
import type {
  CreateEventInput,
  CreateEventResult,
  DeleteEventInput,
  DeleteEventResult,
  ListEventsInput,
  ListEventsResult,
  SetSectorEventCoverInput,
  SetSectorEventCoverResult,
  UpdateEventInput,
  UpdateEventResult,
} from "./types";

export async function listEventsHandler(input: ListEventsInput): Promise<ListEventsResult> {
  const actor = await resolveActor();
  return actor.success ? listEvents(actor.data, input) : actor;
}

export async function createEventHandler(input: CreateEventInput): Promise<CreateEventResult> {
  const actor = await resolveActor();
  return actor.success ? createEvent(actor.data, input) : actor;
}

export async function updateEventHandler(input: UpdateEventInput): Promise<UpdateEventResult> {
  const actor = await resolveActor();
  return actor.success ? updateEvent(actor.data, input) : actor;
}

export async function deleteEventHandler(input: DeleteEventInput): Promise<DeleteEventResult> {
  const actor = await resolveActor();
  return actor.success ? deleteEvent(actor.data, input) : actor;
}

export async function setSectorEventCoverHandler(input: SetSectorEventCoverInput): Promise<SetSectorEventCoverResult> {
  const actor = await resolveActor();
  return actor.success ? setSectorEventCover(actor.data, input) : actor;
}
