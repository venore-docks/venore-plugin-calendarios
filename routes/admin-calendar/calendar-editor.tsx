"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Download, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@venore/plugin-sdk/ui";
import type { CalendarContent } from "../../contracts/types";
import type { EditionView } from "../../features/get-edition/types";
import { findContentProblem, isSameContent } from "../../shared/content-schema";
import { resolveContent } from "../../shared/engine/resolve";
import { EditionStatusBadge, fileHref, formatDateTime } from "../../shared/ui/status-badge";
import { saveEditionAction } from "../admin/actions";
import { DatesTab } from "./dates-tab";
import { HistoryTab } from "./history-tab";
import { LayoutTab } from "./layout-tab";
import { PreviewTab } from "./preview-tab";
import { RangesTab } from "./ranges-tab";
import { TypesTab } from "./types-tab";
import { WorkflowActions } from "./workflow-actions";

type Props = {
  view: EditionView;
  // id de mídia -> URL de miniatura (foto do cabeçalho e logo)
  initialMedia: Record<string, string>;
};

export function CalendarEditor({ view, initialMedia }: Props) {
  const router = useRouter();
  const { edition, calendar, sector, caps, baseContent } = view;
  const [content, setContent] = useState<CalendarContent>(edition.content);
  const [version, setVersion] = useState(edition.version);
  const [media, setMedia] = useState(initialMedia);
  const [tab, setTab] = useState("dates");
  const [saving, startSaving] = useTransition();

  // Depois de um router.refresh() (enviar, validar…) o servidor manda a edição nova.
  useEffect(() => {
    setContent(edition.content);
    setVersion(edition.version);
  }, [edition.content, edition.version]);

  const dirty = !isSameContent(content, edition.content);
  const resolved = useMemo(() => resolveContent(content, baseContent), [content, baseContent]);
  const readOnly = !caps.edit;
  const title = `${calendar.name} ${edition.year}`;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => {
    const problem = findContentProblem(content);
    if (problem) {
      toast.error(problem);
      return;
    }
    startSaving(async () => {
      const result = await saveEditionAction(edition.id, version, content);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setVersion(result.data.version);
      toast.success(
        edition.status === "draft" ? "Alterações salvas." : "Alterações salvas — o calendário voltou para rascunho e precisa ser validado de novo.",
      );
      router.refresh();
    });
  };

  const hasPreviewFile = !calendar.isBase;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`${title}${calendar.isBase ? " (base)" : ""}`}
        description={`${sector.name}${view.baseCalendar ? ` · herda de ${view.baseCalendar.name}` : ""}${
          view.approvedRevisionNumber ? ` · versão validada nº ${view.approvedRevisionNumber}` : ""
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/calendarios">
                <ArrowLeft className="size-4" />
                Calendários
              </Link>
            </Button>
            {!calendar.isBase && <EditionStatusBadge status={edition.status} />}
            {hasPreviewFile && (
              <>
                <Button variant="outline" size="sm" asChild disabled={dirty} title={dirty ? "Salve as alterações para baixar a prévia." : undefined}>
                  <a href={fileHref(edition.id, "previa", "pdf")}>
                    <Download className="size-4" />
                    Prévia PDF
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild disabled={dirty}>
                  <a href={fileHref(edition.id, "previa", "png")} target="_blank" rel="noreferrer">
                    <Download className="size-4" />
                    Prévia PNG
                  </a>
                </Button>
              </>
            )}
            {caps.edit && (
              <Button size="sm" onClick={save} disabled={!dirty || saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Salvar
              </Button>
            )}
            <WorkflowActions
              editionId={edition.id}
              version={version}
              status={edition.status}
              dirty={dirty}
              isBase={calendar.isBase}
              caps={caps}
              title={title}
            />
          </div>
        }
      />

      {edition.reviewNote && edition.status === "draft" && (
        <Banner>
          <span className="font-medium">Devolvido para ajustes:</span> {edition.reviewNote}
        </Banner>
      )}
      {view.outdatedSinceApproval && (
        <Banner>
          O calendário-base mudou depois da validação: o que está na tela já não é o que foi {edition.status === "published" ? "publicado" : "validado"}. Envie para
          validação de novo (alterar qualquer coisa e salvar também faz isso).
        </Banner>
      )}
      {calendar.baseCalendarId && !view.baseHasEdition && (
        <Banner>
          O calendário-base {view.baseCalendar ? `“${view.baseCalendar.name}” ` : ""}ainda não tem o ano {edition.year}: nenhuma data é herdada. Crie o ano {edition.year} nele.
        </Banner>
      )}
      {edition.publishedAt && (
        <p className="text-sm text-muted-foreground">
          Publicado em {formatDateTime(edition.publishedAt)}
          {edition.status !== "published" && " (há alterações depois disso; o arquivo publicado continua no ar até a próxima publicação)"}.{" "}
          <a className="underline underline-offset-2" href={fileHref(edition.id, "publicada", "pdf")}>
            PDF publicado
          </a>{" "}
          ·{" "}
          <a className="underline underline-offset-2" href={fileHref(edition.id, "publicada", "png")} target="_blank" rel="noreferrer">
            imagem publicada
          </a>
        </p>
      )}
      {readOnly && !calendar.isBase && <p className="text-sm text-muted-foreground">Você pode ver este calendário, mas não editá-lo.</p>}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="dates">Datas</TabsTrigger>
          <TabsTrigger value="types">Categorias</TabsTrigger>
          <TabsTrigger value="ranges">Períodos</TabsTrigger>
          <TabsTrigger value="layout">Página</TabsTrigger>
          {!calendar.isBase && <TabsTrigger value="preview">Prévia</TabsTrigger>}
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="dates" className="pt-4">
          <DatesTab
            content={content}
            resolved={resolved}
            baseContent={baseContent}
            onChange={setContent}
            readOnly={readOnly}
            onCreateEvent={(draft) => {
              // Nova aba: o calendário aberto aqui pode ter alterações não salvas.
              const query = new URLSearchParams({ titulo: draft.title, inicio: draft.startDate, fim: draft.endDate });
              window.open(`/admin/calendarios/eventos/${sector.id}?${query}`, "_blank");
            }}
          />
        </TabsContent>
        <TabsContent value="types" className="pt-4">
          <TypesTab content={content} baseContent={baseContent} onChange={setContent} readOnly={readOnly} />
        </TabsContent>
        <TabsContent value="ranges" className="pt-4">
          <RangesTab content={content} resolved={resolved} onChange={setContent} readOnly={readOnly} />
        </TabsContent>
        <TabsContent value="layout" className="pt-4">
          <LayoutTab
            content={content}
            resolved={resolved}
            media={media}
            onMedia={(id, url) => setMedia((current) => ({ ...current, [id]: url }))}
            onChange={setContent}
            readOnly={readOnly}
          />
        </TabsContent>
        {!calendar.isBase && (
          <TabsContent value="preview" className="pt-4">
            {tab === "preview" && <PreviewTab editionId={edition.id} content={content} />}
          </TabsContent>
        )}
        <TabsContent value="history" className="pt-4">
          <HistoryTab events={view.events} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning-border bg-warning-soft p-3 text-sm">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
      <p>{children}</p>
    </div>
  );
}
