"use client";

import { useRef, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Switch, Textarea } from "@venore/plugin-sdk/ui";
import type { CalendarContent, CalendarDisplay } from "../../contracts/types";
import { monthsFrom } from "../../shared/engine/dates";
import { buildMonthNotes } from "../../shared/engine/notes";
import { uploadFileAction } from "../admin/actions";

type Props = {
  content: CalendarContent;
  resolved: CalendarContent;
  media: Record<string, string>;
  onMedia: (id: string, url: string) => void;
  onChange: (next: CalendarContent) => void;
  readOnly: boolean;
};

const DISPLAY_LABELS: Record<keyof CalendarDisplay, { label: string; hint: string }> = {
  legend: { label: "Legenda", hint: "Lista as categorias usadas, abaixo dos meses." },
  monthNotes: { label: "Notas sob cada mês", hint: "Ex.: “17 - Carnaval”, geradas dos nomes das datas." },
  schoolDayCounts: { label: "Dias letivos por mês", hint: "“20 dias letivos” sob o nome do mês." },
  semesterTotals: { label: "Total de dias letivos", hint: "Caixa com o total de cada semestre, no rodapé." },
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function ImageField({
  label,
  hint,
  mediaId,
  url,
  onPicked,
  onClear,
  readOnly,
}: {
  label: string;
  hint: string;
  mediaId: string | null;
  url: string | undefined;
  onPicked: (id: string, url: string) => void;
  onClear: () => void;
  readOnly: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const upload = (file: File) =>
    startTransition(async () => {
      const form = new FormData();
      form.set("file", file);
      const result = await uploadFileAction(form);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onPicked(result.data.id, result.data.url);
    });

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {mediaId && url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-xs text-muted-foreground">{mediaId ? "Arquivo enviado" : "Sem imagem"}</span>
          )}
        </div>
        {!readOnly && (
          <div className="flex flex-col gap-1">
            <input
              ref={input}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = "";
              }}
            />
            <Button size="sm" variant="outline" disabled={pending} onClick={() => input.current?.click()}>
              <ImagePlus className="size-4" />
              {mediaId ? "Trocar" : "Enviar"}
            </Button>
            {mediaId && (
              <Button size="sm" variant="ghost" onClick={onClear}>
                <Trash2 className="size-4" />
                Remover
              </Button>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function LayoutTab({ content, resolved, media, onMedia, onChange, readOnly }: Props) {
  const set = <K extends keyof CalendarContent>(key: K, value: CalendarContent[K]) => onChange({ ...content, [key]: value });
  const months = monthsFrom(content.startMonth);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Título e período</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Título">
            <Input value={content.title} disabled={readOnly} maxLength={80} onChange={(event) => set("title", event.target.value)} />
          </Field>
          <Field label="Ano (em destaque)" hint="Ex.: 2026 ou “2026 EAD”.">
            <Input value={content.yearText} disabled={readOnly} maxLength={40} onChange={(event) => set("yearText", event.target.value)} />
          </Field>
          <Field label="Subtítulo" hint="Ex.: ENSINO FUNDAMENTAL I">
            <Input value={content.subtitle} disabled={readOnly} maxLength={200} onChange={(event) => set("subtitle", event.target.value)} />
          </Field>
          <Field label="Primeiro mês exibido" hint="São sempre 12 meses seguidos (o EaD, por exemplo, começa em fevereiro).">
            <Input type="month" value={content.startMonth} disabled={readOnly} onChange={(event) => event.target.value && set("startMonth", event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Imagens</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <ImageField
            label="Foto do cabeçalho"
            hint="Ocupa o topo da página, de ponta a ponta. Use uma foto larga (proporção ≈ 5:1 a 4:1), mínimo 1800 px de largura."
            mediaId={content.headerImageMediaId}
            url={content.headerImageMediaId ? media[content.headerImageMediaId] : undefined}
            readOnly={readOnly}
            onPicked={(id, url) => {
              onMedia(id, url);
              set("headerImageMediaId", id);
            }}
            onClear={() => set("headerImageMediaId", null)}
          />
          <ImageField
            label="Logo"
            hint="Aparece no círculo branco sobre a foto. Prefira PNG com fundo transparente."
            mediaId={content.logoMediaId}
            url={content.logoMediaId ? media[content.logoMediaId] : undefined}
            readOnly={readOnly}
            onPicked={(id, url) => {
              onMedia(id, url);
              set("logoMediaId", id);
            }}
            onClear={() => set("logoMediaId", null)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cores</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["primary", "Principal", "Título, meses, rodapé e totais."],
              ["accent", "Destaque", "Ano no título e faixas de período."],
              ["header", "Dias da semana", "Fundo da linha D S T Q Q S S."],
            ] as const
          ).map(([key, label, hint]) => (
            <Field key={key} label={label} hint={hint}>
              <input
                type="color"
                className="h-9 w-full cursor-pointer rounded border bg-transparent"
                value={content.theme[key]}
                disabled={readOnly}
                onChange={(event) => set("theme", { ...content.theme, [key]: event.target.value })}
              />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que aparece na página</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(DISPLAY_LABELS) as (keyof CalendarDisplay)[]).map((key) => (
            <label key={key} className="flex items-start gap-3 text-sm">
              <Switch checked={content.display[key]} disabled={readOnly} onCheckedChange={(checked) => set("display", { ...content.display, [key]: checked })} />
              <span>
                <span className="font-medium">{DISPLAY_LABELS[key].label}</span>
                <span className="block text-xs text-muted-foreground">{DISPLAY_LABELS[key].hint}</span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Textos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Caixa “Início e término de aulas”" hint="Aceita <b>negrito</b>, <i>itálico</i> e <u>sublinhado</u>. Uma linha por parágrafo. Vazio = sem caixa.">
            <Textarea rows={7} value={content.infoText} disabled={readOnly} onChange={(event) => set("infoText", event.target.value)} />
          </Field>
          <Field label="Assinatura" hint="Uma linha por item (nome, ato, cargo). Vazio = sem assinatura.">
            <Textarea
              rows={7}
              value={content.signature.join("\n")}
              disabled={readOnly}
              onChange={(event) => set("signature", event.target.value.split("\n").slice(0, 6))}
            />
          </Field>
        </CardContent>
      </Card>

      {content.display.monthNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas dos meses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Geradas dos nomes das datas. Para escrever à mão, digite no mês (uma nota por linha); apague o texto para voltar às geradas.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {months.map(({ year, month }) => {
              const key = `${year}-${String(month).padStart(2, "0")}`;
              const generated = buildMonthNotes({ ...resolved, noteOverrides: {} }, key).join("\n");
              const override = content.noteOverrides[key];
              return (
                <label key={key} className="block space-y-1 text-xs">
                  <span className="font-medium">{key}</span>
                  <Textarea
                    rows={3}
                    disabled={readOnly}
                    value={override ?? generated}
                    onChange={(event) => {
                      const next = { ...content.noteOverrides };
                      if (event.target.value === "" || event.target.value === generated) delete next[key];
                      else next[key] = event.target.value;
                      set("noteOverrides", next);
                    }}
                  />
                </label>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
