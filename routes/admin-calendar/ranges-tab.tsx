"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@venore/plugin-sdk/ui";
import type { CalendarContent, DateRange } from "../../contracts/types";
import { countSchoolDays } from "../../shared/engine/school-days";

type Props = {
  content: CalendarContent;
  resolved: CalendarContent;
  onChange: (next: CalendarContent) => void;
  readOnly: boolean;
};

function RangeList({
  ranges,
  onChange,
  readOnly,
  addLabel,
  totals,
}: {
  ranges: DateRange[];
  onChange: (next: DateRange[]) => void;
  readOnly: boolean;
  addLabel: string;
  totals?: number[];
}) {
  const patch = (index: number, change: Partial<DateRange>) => onChange(ranges.map((range, position) => (position === index ? { ...range, ...change } : range)));
  return (
    <div className="space-y-2">
      {ranges.map((range, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1.4fr_1fr_1fr_auto_auto] sm:items-center">
          <Input value={range.label} disabled={readOnly} maxLength={120} aria-label="Nome" onChange={(event) => patch(index, { label: event.target.value })} />
          <Input type="date" value={range.start} disabled={readOnly} aria-label="Início" onChange={(event) => patch(index, { start: event.target.value })} />
          <Input type="date" value={range.end} disabled={readOnly} aria-label="Fim" onChange={(event) => patch(index, { end: event.target.value })} />
          <span className="min-w-24 text-sm text-muted-foreground">{totals ? `${totals[index] ?? 0} dias letivos` : ""}</span>
          <Button size="icon" variant="ghost" aria-label="Remover" disabled={readOnly} onClick={() => onChange(ranges.filter((_, position) => position !== index))}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" size="sm" onClick={() => onChange([...ranges, { label: "", start: "", end: "" }])}>
          <Plus className="size-4" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

export function RangesTab({ content, resolved, onChange, readOnly }: Props) {
  const totals = countSchoolDays(resolved).perSemester;
  const valid = (ranges: DateRange[]) => ranges.filter((range) => range.start && range.end);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Semestres (contagem de dias letivos)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Um dia só é letivo dentro de um destes intervalos. É daqui que saem “N dias letivos” sob cada mês e os totais do rodapé. Fora dos semestres (férias, recessos
            entre períodos) nada é contado.
          </p>
        </CardHeader>
        <CardContent>
          <RangeList
            ranges={content.semesters}
            totals={totals}
            readOnly={readOnly}
            addLabel="Novo semestre"
            onChange={(semesters) => onChange({ ...content, semesters })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faixas do rodapé (bimestres ou semestres)</CardTitle>
          <p className="text-sm text-muted-foreground">As barras amarelas impressas embaixo do calendário (“1º Bimestre - 02/02 até 17/04”). Não alteram a contagem.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <RangeList ranges={content.periods} readOnly={readOnly} addLabel="Nova faixa" onChange={(periods) => onChange({ ...content, periods })} />
          {!readOnly && valid(content.semesters).length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onChange({ ...content, periods: content.semesters.map((range) => ({ ...range })) })}>
              Usar os semestres como faixas
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
