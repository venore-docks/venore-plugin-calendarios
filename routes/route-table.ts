import { asPluginPage, type PluginRouteTable } from "@venore/plugin-sdk";
import AdminPage from "./admin/page";
import EventsPage from "./admin-events/page";
import EmbedPage from "./embed/page";
import CalendarEditorPage from "./admin-calendar/page";
import MembersPage from "./admin-members/page";
import { getEditionFile } from "./api/edition-file";
import { getEventCoverImage, getSectorDefaultCoverImage } from "./api/event-cover";
import { getPublishedCalendarFile } from "./api/published-file";
import PublicPage from "./public/page";

export const calendariosRouteTable: PluginRouteTable = {
  admin: [
    { pattern: "", Component: asPluginPage(AdminPage) },
    { pattern: ":editionId", Component: asPluginPage(CalendarEditorPage) },
    { pattern: "membros/:sectorId", Component: asPluginPage(MembersPage) },
    { pattern: "eventos/:sectorId", Component: asPluginPage(EventsPage) },
  ],
  // `public` é caminho completo: /calendarios é a consulta de qualquer colaborador.
  public: [{ pattern: "calendarios", Component: asPluginPage(PublicPage) }],
  // Sem a casca do portal, para embutir num <iframe> de outro site: /ext/calendarios/embed/<setor>/<calendario>.
  standalone: [{ pattern: "calendarios/embed/:sector/:calendar", Component: asPluginPage(EmbedPage) }],
  api: [
    { pattern: "edicoes/:editionId/arquivo", handlers: { GET: getEditionFile } },
    // Link estável dos arquivos publicados (os sites WordPress apontam pra cá): sem login.
    { pattern: "publicados/:sector/:calendar/:arquivo", handlers: { GET: getPublishedCalendarFile } },
    // Imagem dos eventos (própria → padrão do setor → placeholder), pública: as TVs e o site mostram.
    { pattern: "eventos/:id/capa", handlers: { GET: getEventCoverImage } },
    { pattern: "eventos/padrao/:sector/capa", handlers: { GET: getSectorDefaultCoverImage } },
  ],
};
