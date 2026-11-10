"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@venore/plugin-sdk/ui";
import type { CalendarContent, MarkEffect, MarkType } from "../../contracts/types";

type Props = {
  content: CalendarContent;
  baseContent: CalendarContent | null;
  onChange: (next: CalendarContent) => void;
  readOnly: boolean;
};

const EFFECT_LABELS: Record<MarkEffect, string> = {
  off: "Não é dia letivo (feriado, recesso…)",
  on: "É dia letivo (sábado letivo)",
  none: "Só informa (não muda a contagem)",
};

// Cores sugeridas: as do modelo impresso de 2026 (dá pra escolher qualquer uma).
const SUGGESTED_COLORS = ["#e8465f", "#f7a600", "#00697f", "#2fb5c9", "#7ac143", "#b5d334", "#f06ca8", "#7a5fb0", "#6b4a3a"];

export function TypesTab({ content, baseContent, onChange, readOnly }: Props) {
  const ownKeys = new Set(content.markTypes.map((type) => type.key));
  const inherited = (baseContent?.markTypes ?? []).filter((type) => !ownKeys.has(type.key));

  const setTypes = (markTypes: MarkType[]) => onChange({ ...content, markTypes });
  const patchType = (key: string, patch: Partial<MarkType>) =>
    setTypes(content.markTypes.map((type) => (type.key === key ? { ...type, ...patch } : type)));

  const addType = () => {
    const taken = new Set([...ownKeys, ...(baseContent?.markTypes ?? []).map((type) => type.key)]);
    let key = "nova-categoria";
    for (let index = 2; taken.has(key); index += 1) key = `nova-categoria-${index}`;
    setTypes([...content.markTypes, { key, label: "Nova categoria", color: SUGGESTED_COLORS[content.markTypes.length % SUGGESTED_COLORS.length]!, effect: "none", legend: true }]);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        As categorias são a legenda do calendário: cada uma tem uma cor e diz se o dia conta como letivo. Só aparecem na legenda impressa as que têm pelo menos um dia marcado.
      </p>

      {content.markTypes.map((type) => (
        <Card key={type.key}>
          <CardContent className="grid gap-3 pt-6 md:grid-cols-[auto_1fr_1.2fr_auto_auto] md:items-center">
            <input
              type="color"
              aria-label={`Cor de ${type.label}`}
              className="size-9 cursor-pointer rounded border bg-transparent"
              value={type.color}
              disabled={readOnly}
              onChange={(event) => patchType(type.key, { color: event.target.value })}
            />
            <Input value={type.label} disabled={readOnly} maxLength={120} onChange={(event) => patchType(type.key, { label: event.target.value })} aria-label="Nome da categoria" />
            <Select value={type.effect} disabled={readOnly} onValueChange={(effect) => patchType(type.key, { effect: effect as MarkEffect })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EFFECT_LABELS) as MarkEffect[]).map((effect) => (
                  <SelectItem key={effect} value={effect}>
                    {EFFECT_LABELS[effect]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={type.legend} disabled={readOnly} onCheckedChange={(legend) => patchType(type.key, { legend })} />
              Na legenda
            </label>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remover ${type.label}`}
              disabled={readOnly}
              onClick={() => setTypes(content.markTypes.filter((candidate) => candidate.key !== type.key))}
            >
              <Trash2 className="size-4" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {!readOnly && (
        <Button variant="outline" onClick={addType}>
          <Plus className="size-4" />
          Nova categoria
        </Button>
      )}

      {inherited.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium">Herdadas do calendário-base</h3>
          <div className="flex flex-wrap gap-2">
            {inherited.map((type) => (
              <span key={type.key} className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                <span className="size-3 rounded-full" style={{ backgroundColor: type.color }} />
                {type.label}
                {!readOnly && (
                  <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setTypes([...content.markTypes, { ...type }])}>
                    personalizar
                  </button>
                )}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">“Personalizar” cria uma cópia só deste calendário (cor, nome ou efeito diferentes); o base não muda.</p>
        </div>
      )}
    </div>
  );
}
