import { and, eq, max } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import { listUsers } from "@venore/plugin-sdk/auth";
import { beginOperation, endOperation } from "@venore/plugin-sdk/observability";
import type { CalendarContent } from "../../contracts/types";
import { calCalendars, calEditions, calMembers, calSectors } from "../../database/schema";
import { requireCap, type Actor } from "../../shared/access";
import { emptyContent } from "../../shared/content-schema";
import { nationalHolidayMarks } from "../../shared/engine/holidays";
import { findCalendarById, findSectorById, recordEditionEvent, toEditionRecord } from "../../shared/edition-store";
import { failure } from "../../shared/results";
import { slugify } from "../../shared/slugify";
import { uploadCalendariosFile } from "../../shared/upload";
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
  SetMemberInput,
  SetMemberResult,
  UpdateCalendarInput,
  UpdateCalendarResult,
  UploadFileInput,
  UploadFileResult,
} from "./types";

type Operation = "write" | "read";

function track<T extends { success: boolean }>(actor: Actor, useCase: string, kind: Operation) {
  const handle = beginOperation({ useCase: `calendarios.${useCase}`, actor: { id: actor.actorId, type: "user" }, kind });
  return (result: T): T => {
    endOperation(handle, result as never);
    return result;
  };
}

async function uniqueSlug(table: "sector" | "calendar", base: string, sectorId?: string): Promise<string> {
  const root = base || "item";
  for (let attempt = 1; attempt < 50; attempt += 1) {
    const candidate = attempt === 1 ? root : `${root}-${attempt}`;
    const taken =
      table === "sector"
        ? await db.select({ id: calSectors.id }).from(calSectors).where(eq(calSectors.slug, candidate)).limit(1)
        : await db
            .select({ id: calCalendars.id })
            .from(calCalendars)
            .where(and(eq(calCalendars.sectorId, sectorId!), eq(calCalendars.slug, candidate)))
            .limit(1);
    if (taken.length === 0) return candidate;
  }
  return `${root}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createSector(actor: Actor, input: CreateSectorInput): Promise<CreateSectorResult> {
  const finish = track<CreateSectorResult>(actor, "create-sector", "write");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários pode criar setores."));
  const name = input.name.trim();
  if (!name || name.length > 120) return finish(failure("invalid_name", "Informe o nome do setor (até 120 caracteres)."));

  const [{ highest }] = await db.select({ highest: max(calSectors.sortOrder) }).from(calSectors);
  const [row] = await db
    .insert(calSectors)
    .values({ slug: await uniqueSlug("sector", slugify(name)), name, sortOrder: (highest ?? 0) + 10 })
    .returning();
  return finish({ success: true, data: row });
}

// Calendário novo já nasce com a edição do ano: sem base, com os feriados nacionais marcados e as
// categorias do modelo; com base, só o que é próprio dele (categorias e datas vêm do base).
export async function createCalendar(actor: Actor, input: CreateCalendarInput): Promise<CreateCalendarResult> {
  const finish = track<CreateCalendarResult>(actor, "create-calendar", "write");
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  const allowed = await requireCap(actor, sector.id, "edit");
  if (!allowed.success) return finish(allowed);

  const name = input.name.trim();
  if (!name || name.length > 120) return finish(failure("invalid_name", "Informe o nome do calendário (até 120 caracteres)."));
  if (!Number.isInteger(input.year) || input.year < 2000 || input.year > 2100) return finish(failure("invalid_year", "Informe um ano válido."));

  const baseCheck = await checkBase(null, input.baseCalendarId ?? null, input.isBase ?? false);
  if (!baseCheck.success) return finish(baseCheck);

  const existing = await db.select({ sortOrder: calCalendars.sortOrder }).from(calCalendars).where(eq(calCalendars.sectorId, sector.id));
  const sortOrder = existing.reduce((highest, row) => Math.max(highest, row.sortOrder), 0) + 10;

  const inherits = Boolean(input.baseCalendarId);
  const holidayType = "feriado";
  const content: CalendarContent = emptyContent(input.year, {
    subtitle: name.toUpperCase(),
    ...(inherits ? { markTypes: [] } : { marks: nationalHolidayMarks(input.year, holidayType) }),
  });

  const slug = await uniqueSlug("calendar", slugify(name), sector.id);
  const created = await db.transaction(async (tx) => {
    const [calendar] = await tx
      .insert(calCalendars)
      .values({
        sectorId: sector.id,
        slug,
        name,
        baseCalendarId: input.baseCalendarId ?? null,
        isBase: input.isBase ?? false,
        sortOrder,
      })
      .returning();
    const [edition] = await tx
      .insert(calEditions)
      .values({ calendarId: calendar.id, year: input.year, content, updatedBy: actor.actorId })
      .returning();
    await recordEditionEvent(tx, { editionId: edition.id, action: "created", actorId: actor.actorId });
    return { calendar, edition: toEditionRecord(edition) };
  });
  return finish({ success: true, data: created });
}

// O base pode ser de OUTRO setor: um "base geral" (feriados e recessos comuns da instituição) é herdado por
// calendários de setores diferentes (Colégio e Faculdade). Quem edita o base é o setor dono dele.
async function checkBase(
  selfId: string | null,
  baseCalendarId: string | null,
  isBase: boolean,
): Promise<{ success: true; data: undefined } | ReturnType<typeof failure<never>>> {
  if (isBase && baseCalendarId) {
    return failure("base_cannot_inherit", "Um calendário-base não herda de outro: escolha uma coisa ou outra.");
  }
  if (baseCalendarId) {
    if (baseCalendarId === selfId) return failure("invalid_base", "Um calendário não pode herdar dele mesmo.");
    const base = await findCalendarById(baseCalendarId);
    if (!base) return failure("invalid_base", "Calendário-base não encontrado.");
    if (!base.isBase) return failure("invalid_base", "Só um calendário marcado como base pode ser herdado.");
  }
  return { success: true, data: undefined };
}

export async function updateCalendar(actor: Actor, input: UpdateCalendarInput): Promise<UpdateCalendarResult> {
  const finish = track<UpdateCalendarResult>(actor, "update-calendar", "write");
  const calendar = await findCalendarById(input.calendarId);
  if (!calendar) return finish(failure("calendar_not_found", "Calendário não encontrado."));
  const allowed = await requireCap(actor, calendar.sectorId, "edit");
  if (!allowed.success) return finish(allowed);

  const name = input.name === undefined ? calendar.name : input.name.trim();
  if (!name || name.length > 120) return finish(failure("invalid_name", "Informe o nome do calendário (até 120 caracteres)."));
  const baseCalendarId = input.baseCalendarId === undefined ? calendar.baseCalendarId : input.baseCalendarId;
  const isBase = input.isBase === undefined ? calendar.isBase : input.isBase;
  const fileNameTemplate = input.fileNameTemplate === undefined ? calendar.fileNameTemplate : input.fileNameTemplate.trim();
  if (!fileNameTemplate || fileNameTemplate.length > 200) return finish(failure("invalid_file_name", "Informe o modelo do nome do arquivo."));

  const baseCheck = await checkBase(calendar.id, baseCalendarId, isBase);
  if (!baseCheck.success) return finish(baseCheck);

  if (calendar.isBase && !isBase) {
    const dependents = await db.select({ id: calCalendars.id }).from(calCalendars).where(eq(calCalendars.baseCalendarId, calendar.id)).limit(1);
    if (dependents.length > 0) {
      return finish(failure("base_in_use", "Outros calendários herdam deste. Troque o base deles antes de desmarcar."));
    }
  }

  const [row] = await db
    .update(calCalendars)
    .set({ name, baseCalendarId, isBase, fileNameTemplate })
    .where(eq(calCalendars.id, calendar.id))
    .returning();
  return finish({ success: true, data: row });
}

export async function deleteEdition(actor: Actor, input: DeleteEditionInput): Promise<DeleteEditionResult> {
  const finish = track<DeleteEditionResult>(actor, "delete-edition", "write");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários pode apagar um ano."));
  const [row] = await db.delete(calEditions).where(eq(calEditions.id, input.editionId)).returning({ year: calEditions.year });
  return finish(row ? { success: true, data: { year: row.year } } : failure("edition_not_found", "Calendário não encontrado."));
}

export async function deleteCalendar(actor: Actor, input: DeleteCalendarInput): Promise<DeleteCalendarResult> {
  const finish = track<DeleteCalendarResult>(actor, "delete-calendar", "write");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários pode apagar um calendário."));
  const calendar = await findCalendarById(input.calendarId);
  if (!calendar) return finish(failure("calendar_not_found", "Calendário não encontrado."));
  if (input.confirmName.trim() !== calendar.name) return finish(failure("confirm_mismatch", "O nome digitado não confere com o do calendário."));
  await db.delete(calCalendars).where(eq(calCalendars.id, calendar.id));
  return finish({ success: true, data: { name: calendar.name } });
}

export async function deleteSector(actor: Actor, input: DeleteSectorInput): Promise<DeleteSectorResult> {
  const finish = track<DeleteSectorResult>(actor, "delete-sector", "write");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários pode apagar um setor."));
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  if (input.confirmName.trim() !== sector.name) return finish(failure("confirm_mismatch", "O nome digitado não confere com o do setor."));
  await db.delete(calSectors).where(eq(calSectors.id, sector.id));
  return finish({ success: true, data: { name: sector.name } });
}

export async function listMembers(actor: Actor, input: ListMembersInput): Promise<ListMembersResult> {
  const finish = track<ListMembersResult>(actor, "list-members", "read");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários gerencia os membros."));
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));

  const [rows, users] = await Promise.all([db.select().from(calMembers).where(eq(calMembers.sectorId, sector.id)), listUsers()]);
  const allUsers = users.success ? users.data : [];
  const nameById = new Map(allUsers.map((user) => [user.id, user.name ?? user.email]));
  const members = rows
    .map(({ sectorId, userId, canEdit, canApprove, canPublish }) => ({
      sectorId,
      userId,
      canEdit,
      canApprove,
      canPublish,
      name: nameById.get(userId) ?? "Usuário removido",
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  const users_ = allUsers.map((user) => ({ id: user.id, name: user.name ?? user.email })).sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  return finish({ success: true, data: { sector, members, users: users_ } });
}

export async function setMember(actor: Actor, input: SetMemberInput): Promise<SetMemberResult> {
  const finish = track<SetMemberResult>(actor, "set-member", "write");
  if (!actor.isAdmin) return finish(failure("forbidden_sector", "Só quem administra os calendários gerencia os membros."));
  const sector = await findSectorById(input.sectorId);
  if (!sector) return finish(failure("sector_not_found", "Setor não encontrado."));
  if (!input.userId) return finish(failure("invalid_user", "Escolha uma pessoa."));

  if (!input.canEdit && !input.canApprove && !input.canPublish) {
    await db.delete(calMembers).where(and(eq(calMembers.sectorId, sector.id), eq(calMembers.userId, input.userId)));
    return finish({ success: true, data: undefined });
  }
  await db
    .insert(calMembers)
    .values({ sectorId: sector.id, userId: input.userId, canEdit: input.canEdit, canApprove: input.canApprove, canPublish: input.canPublish })
    .onConflictDoUpdate({
      target: [calMembers.sectorId, calMembers.userId],
      set: { canEdit: input.canEdit, canApprove: input.canApprove, canPublish: input.canPublish },
    });
  return finish({ success: true, data: undefined });
}

// Subir foto de cabeçalho / logo: quem edita algum setor (ou administra) — o arquivo não é de um
// setor específico até ser escolhido no documento.
export async function uploadFile(actor: Actor, input: UploadFileInput): Promise<UploadFileResult> {
  const finish = track<UploadFileResult>(actor, "upload-file", "write");
  if (!actor.isAdmin) {
    const editable = await db
      .select({ sectorId: calMembers.sectorId })
      .from(calMembers)
      .where(and(eq(calMembers.userId, actor.actorId), eq(calMembers.canEdit, true)))
      .limit(1);
    if (editable.length === 0) return finish(failure("forbidden_sector", "Você não tem permissão para enviar arquivos."));
  }
  const uploaded = await uploadCalendariosFile({
    filename: input.filename,
    contentType: input.contentType,
    data: input.data,
    allowedMimeCategories: ["image"],
  });
  return finish(
    uploaded.success ? { success: true, data: { id: uploaded.data.id, url: uploaded.data.url, filename: uploaded.data.filename } } : uploaded,
  );
}
