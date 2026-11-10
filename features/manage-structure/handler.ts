import { resolveActor } from "../../shared/access";
import {
  createCalendar,
  createSector,
  deleteCalendar,
  deleteEdition,
  deleteSector,
  listMembers,
  setMember,
  updateCalendar,
  uploadFile,
} from "./service";
import type {
  CreateCalendarInput,
  CreateCalendarResult,
  CreateSectorInput,
  CreateSectorResult,
  DeleteCalendarInput,
  DeleteCalendarResult,
  DeleteEditionInput,
  DeleteEditionResult,
  DeleteSectorInput,
  DeleteSectorResult,
  ListMembersInput,
  ListMembersResult,
  RemoveMemberInput,
  SetMemberInput,
  SetMemberResult,
  UpdateCalendarInput,
  UpdateCalendarResult,
  UploadFileInput,
  UploadFileResult,
} from "./types";

// Um handler por ação (cada um autentica com resolveActor); a regra de "quem pode em qual setor"
// fica no service, que já tem o setor carregado.
export async function createSectorHandler(input: CreateSectorInput): Promise<CreateSectorResult> {
  const actor = await resolveActor();
  return actor.success ? createSector(actor.data, input) : actor;
}

export async function createCalendarHandler(input: CreateCalendarInput): Promise<CreateCalendarResult> {
  const actor = await resolveActor();
  return actor.success ? createCalendar(actor.data, input) : actor;
}

export async function updateCalendarHandler(input: UpdateCalendarInput): Promise<UpdateCalendarResult> {
  const actor = await resolveActor();
  return actor.success ? updateCalendar(actor.data, input) : actor;
}

export async function deleteEditionHandler(input: DeleteEditionInput): Promise<DeleteEditionResult> {
  const actor = await resolveActor();
  return actor.success ? deleteEdition(actor.data, input) : actor;
}

export async function deleteCalendarHandler(input: DeleteCalendarInput): Promise<DeleteCalendarResult> {
  const actor = await resolveActor();
  return actor.success ? deleteCalendar(actor.data, input) : actor;
}

export async function deleteSectorHandler(input: DeleteSectorInput): Promise<DeleteSectorResult> {
  const actor = await resolveActor();
  return actor.success ? deleteSector(actor.data, input) : actor;
}

export async function listMembersHandler(input: ListMembersInput): Promise<ListMembersResult> {
  const actor = await resolveActor();
  return actor.success ? listMembers(actor.data, input) : actor;
}

export async function setMemberHandler(input: SetMemberInput): Promise<SetMemberResult> {
  const actor = await resolveActor();
  return actor.success ? setMember(actor.data, input) : actor;
}

export async function removeMemberHandler(input: RemoveMemberInput): Promise<SetMemberResult> {
  const actor = await resolveActor();
  return actor.success ? setMember(actor.data, { ...input, canEdit: false, canApprove: false, canPublish: false }) : actor;
}

export async function uploadFileHandler(input: UploadFileInput): Promise<UploadFileResult> {
  const actor = await resolveActor();
  return actor.success ? uploadFile(actor.data, input) : actor;
}
