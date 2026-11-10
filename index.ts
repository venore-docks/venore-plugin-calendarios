export { calendariosBreadcrumbSegments } from "./breadcrumbs";
export { calendariosSeeds } from "./seeds";

export { listOverviewHandler as listOverview } from "./features/list-overview/handler";
export { getEditionHandler as getEdition } from "./features/get-edition/handler";
export { saveEditionHandler as saveEdition } from "./features/save-edition/handler";
export { submitEditionHandler as submitEdition } from "./features/submit-edition/handler";
export { reviewEditionHandler as reviewEdition } from "./features/review-edition/handler";
export { publishEditionHandler as publishEdition } from "./features/publish-edition/handler";
export { startNextYearHandler as startNextYear } from "./features/start-next-year/handler";
export { exportEditionFileHandler as exportEditionFile } from "./features/export-edition-file/handler";
export { renderPreviewHandler as renderPreview } from "./features/render-preview/handler";
export { listPublishedHandler as listPublished, getPublishedFileHandler as getPublishedFile } from "./features/public-calendars/handler";
export {
  createSectorHandler as createSector,
  createCalendarHandler as createCalendar,
  updateCalendarHandler as updateCalendar,
  deleteEditionHandler as deleteEdition,
  deleteCalendarHandler as deleteCalendar,
  deleteSectorHandler as deleteSector,
  listMembersHandler as listMembers,
  setMemberHandler as setMember,
  removeMemberHandler as removeMember,
  uploadFileHandler as uploadFile,
} from "./features/manage-structure/handler";

export {
  listEventsHandler as listEvents,
  createEventHandler as createEvent,
  updateEventHandler as updateEvent,
  deleteEventHandler as deleteEvent,
  setSectorEventCoverHandler as setSectorEventCover,
} from "./features/manage-events/handler";
// Leitura pública (sem login) — o Broadcast consome estas duas pelo barrel (dependência opcional).
export { listUpcomingEventsHandler as listUpcomingEvents, listEventSectorsHandler as listEventSectors } from "./features/public-events/handler";

export { publishedFilePath } from "./features/public-calendars/service";

export type {
  CalendarContent,
  CalendarDisplay,
  CalendarRecord,
  CalendarTheme,
  DateRange,
  DayMark,
  EditionEventAction,
  EventRecord,
  PublicEvent,
  EditionEventRecord,
  EditionRecord,
  EditionStatus,
  MarkEffect,
  MarkType,
  MemberRecord,
  RevisionRecord,
  SectorRecord,
} from "./contracts/types";
export type { SectorCaps } from "./shared/access";
export type { ListOverviewResult, SectorOverview, CalendarOverview, EditionSummary } from "./features/list-overview/types";
export type { GetEditionInput, GetEditionResult, EditionView, EditionEventView } from "./features/get-edition/types";
export type { SaveEditionInput, SaveEditionResult } from "./features/save-edition/types";
export type { SubmitEditionInput, SubmitEditionResult } from "./features/submit-edition/types";
export type { ReviewEditionInput, ReviewEditionResult, ReviewDecision } from "./features/review-edition/types";
export type { PublishEditionInput, PublishEditionResult } from "./features/publish-edition/types";
export type { StartNextYearInput, StartNextYearResult } from "./features/start-next-year/types";
export type { ExportEditionFileInput, ExportEditionFileResult, FileFormat, FileSource } from "./features/export-edition-file/types";
export type { RenderPreviewInput, RenderPreviewResult } from "./features/render-preview/types";
export type {
  ListPublishedResult,
  GetPublishedFileInput,
  GetPublishedFileResult,
  PublishedCalendar,
  PublishedSector,
} from "./features/public-calendars/types";
export type {
  CreateSectorInput,
  CreateSectorResult,
  CreateCalendarInput,
  CreateCalendarResult,
  UpdateCalendarInput,
  UpdateCalendarResult,
  DeleteEditionInput,
  DeleteEditionResult,
  DeleteCalendarInput,
  DeleteCalendarResult,
  DeleteSectorInput,
  DeleteSectorResult,
  ListMembersInput,
  ListMembersResult,
  MemberView,
  UserOption,
  SetMemberInput,
  SetMemberResult,
  RemoveMemberInput,
  UploadFileInput,
  UploadFileResult,
} from "./features/manage-structure/types";
export type {
  EventFields,
  ListEventsInput,
  ListEventsResult,
  CreateEventInput,
  CreateEventResult,
  UpdateEventInput,
  UpdateEventResult,
  DeleteEventInput,
  DeleteEventResult,
  SetSectorEventCoverInput,
  SetSectorEventCoverResult,
} from "./features/manage-events/types";
export type {
  ListUpcomingEventsInput,
  ListUpcomingEventsResult,
  EventSector,
  ListEventSectorsResult,
} from "./features/public-events/types";
