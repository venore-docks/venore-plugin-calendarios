import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { getMediaAssetUrls } from "@venore/plugin-sdk/media";
import { AdminAccessDenied } from "@venore/plugin-sdk/ui";
import { getEdition } from "../../index";
import { CalendarEditor } from "./calendar-editor";

export default async function CalendarEditorPage({ params }: { params: Promise<{ editionId: string }> }) {
  const gate = await getPluginAdminPageData("calendarios");
  if (!gate.granted) {
    return <AdminAccessDenied message="Você não tem permissão para ver os calendários." />;
  }

  const { editionId } = await params;
  const result = await getEdition({ editionId });
  if (!result.success) {
    return <p className="text-sm text-destructive">{result.error.message}</p>;
  }
  const view = result.data;

  // Miniaturas da foto do cabeçalho e do logo (o documento guarda só o id).
  const ids = [view.edition.content.headerImageMediaId, view.edition.content.logoMediaId].filter((id): id is string => Boolean(id));
  const urls = ids.length > 0 ? await getMediaAssetUrls({ ids, displayWidth: 320 }) : null;
  const media: Record<string, string> = urls?.success ? urls.data : {};

  return <CalendarEditor view={view} initialMedia={media} />;
}
