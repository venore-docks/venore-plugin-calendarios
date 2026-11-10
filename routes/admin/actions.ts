"use server";

import { revalidatePath } from "next/cache";
import { isPluginActive } from "@venore/plugin-sdk";
import {
  createCalendar,
  createEvent,
  createSector,
  deleteCalendar,
  deleteEdition,
  deleteEvent,
  deleteSector,
  publishEdition,
  removeMember,
  renderPreview,
  reviewEdition,
  saveEdition,
  setMember,
  setSectorEventCover,
  startNextYear,
  submitEdition,
  updateCalendar,
  updateEvent,
  uploadFile,
} from "../../index";
import type { EditionRecord, ReviewDecision } from "../../index";

// Toda action passa pelo handler do barrel (resolveActor lá dentro) — nenhuma escreve sem sessão
// autorizada (src/app/server-actions-authorization.test.ts do core).
export type CalendariosActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const BASE_PATH = "/admin/calendarios";
const PLUGIN_DISABLED_ERROR = "O plugin Calendários está desabilitado.";

async function pluginDisabled(): Promise<boolean> {
  return !(await isPluginActive("calendarios"));
}

function revalidateEdition(editionId: string) {
  revalidatePath(BASE_PATH);
  revalidatePath(`${BASE_PATH}/${editionId}`);
}

export async function saveEditionAction(editionId: string, expectedVersion: number, content: unknown): Promise<CalendariosActionResult<EditionRecord>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await saveEdition({ editionId, expectedVersion, content });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidateEdition(editionId);
  return { ok: true, data: result.data };
}

export async function submitEditionAction(editionId: string, expectedVersion: number): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await submitEdition({ editionId, expectedVersion });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidateEdition(editionId);
  return { ok: true, data: undefined };
}

export async function reviewEditionAction(
  editionId: string,
  expectedVersion: number,
  decision: ReviewDecision,
  note: string,
): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await reviewEdition({ editionId, expectedVersion, decision, note });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidateEdition(editionId);
  return { ok: true, data: undefined };
}

export async function publishEditionAction(editionId: string): Promise<CalendariosActionResult<{ skipped: string[] }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await publishEdition({ editionId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidateEdition(editionId);
  revalidatePath("/calendarios");
  return { ok: true, data: { skipped: result.data.skipped } };
}

export async function startNextYearAction(calendarId: string): Promise<CalendariosActionResult<{ editionId: string; year: number }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await startNextYear({ calendarId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { editionId: result.data.id, year: result.data.year } };
}

export async function renderPreviewAction(editionId: string, content: unknown): Promise<CalendariosActionResult<{ html: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await renderPreview({ editionId, content });
  return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error.message };
}

export async function createSectorAction(name: string): Promise<CalendariosActionResult<{ sectorId: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await createSector({ name });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { sectorId: result.data.id } };
}

export async function createCalendarAction(input: {
  sectorId: string;
  name: string;
  year: number;
  baseCalendarId: string | null;
  isBase: boolean;
}): Promise<CalendariosActionResult<{ editionId: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await createCalendar(input);
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { editionId: result.data.edition.id } };
}

export async function updateCalendarAction(input: {
  calendarId: string;
  name: string;
  baseCalendarId: string | null;
  isBase: boolean;
  fileNameTemplate: string;
}): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await updateCalendar(input);
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: undefined };
}

export async function uploadFileAction(formData: FormData): Promise<CalendariosActionResult<{ id: string; url: string; filename: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Selecione um arquivo." };
  const result = await uploadFile({
    filename: file.name,
    contentType: file.type,
    size: file.size,
    data: Buffer.from(await file.arrayBuffer()),
  });
  return result.success ? { ok: true, data: result.data } : { ok: false, error: result.error.message };
}

export async function deleteEditionAction(editionId: string): Promise<CalendariosActionResult<{ year: number }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await deleteEdition({ editionId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { year: result.data.year } };
}

export async function deleteCalendarAction(calendarId: string, confirmName: string): Promise<CalendariosActionResult<{ name: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await deleteCalendar({ calendarId, confirmName });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { name: result.data.name } };
}

export async function deleteSectorAction(sectorId: string, confirmName: string): Promise<CalendariosActionResult<{ name: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await deleteSector({ sectorId, confirmName });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(BASE_PATH);
  return { ok: true, data: { name: result.data.name } };
}

export async function setMemberAction(input: {
  sectorId: string;
  userId: string;
  canEdit: boolean;
  canApprove: boolean;
  canPublish: boolean;
}): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await setMember(input);
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(`${BASE_PATH}/membros/${input.sectorId}`);
  revalidatePath(BASE_PATH);
  return { ok: true, data: undefined };
}

export async function removeMemberAction(sectorId: string, userId: string): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await removeMember({ sectorId, userId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(`${BASE_PATH}/membros/${sectorId}`);
  revalidatePath(BASE_PATH);
  return { ok: true, data: undefined };
}

export type EventFormInput = {
  title: string;
  detail: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  // id de mídia da capa própria; "" = sem capa própria.
  coverMediaId: string;
};

export async function saveEventAction(sectorId: string, eventId: string | null, fields: EventFormInput): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = eventId ? await updateEvent({ eventId, ...fields }) : await createEvent({ sectorId, ...fields });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(`${BASE_PATH}/eventos/${sectorId}`);
  revalidatePath("/calendarios");
  return { ok: true, data: undefined };
}

export async function deleteEventAction(sectorId: string, eventId: string): Promise<CalendariosActionResult<{ title: string }>> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await deleteEvent({ eventId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(`${BASE_PATH}/eventos/${sectorId}`);
  revalidatePath("/calendarios");
  return { ok: true, data: { title: result.data.title } };
}

export async function setSectorEventCoverAction(sectorId: string, mediaId: string | null): Promise<CalendariosActionResult> {
  if (await pluginDisabled()) return { ok: false, error: PLUGIN_DISABLED_ERROR };
  const result = await setSectorEventCover({ sectorId, mediaId });
  if (!result.success) return { ok: false, error: result.error.message };
  revalidatePath(`${BASE_PATH}/eventos/${sectorId}`);
  revalidatePath("/calendarios");
  return { ok: true, data: undefined };
}
