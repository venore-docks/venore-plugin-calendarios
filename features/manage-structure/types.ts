import type { OperationResult } from "@venore/plugin-sdk";
import type { CalendarRecord, EditionRecord, MemberRecord, SectorRecord } from "../../contracts/types";

export type CreateSectorInput = { name: string };
export type CreateCalendarInput = {
  sectorId: string;
  name: string;
  year: number;
  // Herda categorias e datas deste calendário-base (mesmo setor).
  baseCalendarId?: string | null;
  isBase?: boolean;
};
export type UpdateCalendarInput = {
  calendarId: string;
  name?: string;
  baseCalendarId?: string | null;
  isBase?: boolean;
  fileNameTemplate?: string;
};
export type DeleteEditionInput = { editionId: string };
export type DeleteCalendarInput = { calendarId: string; confirmName: string };
export type DeleteSectorInput = { sectorId: string; confirmName: string };

export type MemberView = MemberRecord & { name: string };
export type UserOption = { id: string; name: string };
export type ListMembersInput = { sectorId: string };
export type SetMemberInput = { sectorId: string; userId: string; canEdit: boolean; canApprove: boolean; canPublish: boolean };
export type RemoveMemberInput = { sectorId: string; userId: string };

export type UploadFileInput = { filename: string; contentType: string; size: number; data: Buffer };

export type CreateSectorResult = OperationResult<SectorRecord>;
export type CreateCalendarResult = OperationResult<{ calendar: CalendarRecord; edition: EditionRecord }>;
export type UpdateCalendarResult = OperationResult<CalendarRecord>;
export type DeleteEditionResult = OperationResult<{ year: number }>;
export type DeleteCalendarResult = OperationResult<{ name: string }>;
export type DeleteSectorResult = OperationResult<{ name: string }>;
export type ListMembersResult = OperationResult<{ sector: SectorRecord; members: MemberView[]; users: UserOption[] }>;
export type SetMemberResult = OperationResult<undefined>;
export type UploadFileResult = OperationResult<{ id: string; url: string; filename: string }>;
