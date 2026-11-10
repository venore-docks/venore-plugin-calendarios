"use client";

import { useMemo, useRef, useState } from "react";
import { CalendarPlus, Eraser, Trash2 } from "lucide-react";
import { Button, Card, CardContent, Input, cn } from "@venore/plugin-sdk/ui";
import type { CalendarContent, MarkType } from "../../contracts/types";
import { monthsFrom, parseIsoDate, weekdayOf } from "../../shared/engine/dates";
import { groupMarksByDate, resolveContent } from "../../shared/engine/resolve";
import { countSchoolDays } from "../../shared/engine/school-days";
import { datesBetween, paintDate, removeMark, updateMarkDetails, type Brush } from "./marks";
import { MonthGrid } from "./month-grid";

type Props = {
  content: CalendarContent;
  resolved: CalendarContent;
  baseContent: CalendarContent | null;
  onChange: (next: CalendarContent) => void;
  readOnly: boolean;
  // Abre o formulário de evento público já preenchido a partir desta data (aba Eventos).
  onCreateEvent?: (draft: { title: string; startDate: string; endDate: string }) => void;
};

const WEEKDAY_NAMES = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function formatDay(date: string): string {
  const parsed = parseIsoDate(date);
  if (!parsed) return date;
  return `${String(parsed.day).padStart(2, "0")}/${String(parsed.month).padStart(2, "0")} ${WEEKDAY_NAMES[weekdayOf(parsed.year, parsed.month, parsed.day)]}`;
}

export function DatesTab({ content, resolved, baseContent, onChange, readOnly, onCreateEvent }: Props) {
  const [brush, setBrush] = useState<Brush>({ kind: "type", key: resolved.markTypes[0]?.key ?? "" });
  const lastPicked = useRef<string | null>(null);

  const typeByKey = useMemo(() => new Map(resolved.markTypes.map((type) => [type.key, type])), [resolved.markTypes]);
  const typesByDate = useMemo(() => {
    const map = new Map<string, MarkType[]>();
    for (const [date, marks] of groupMarksByDate(resolved.marks)) {
      const types = marks.flatMap((mark) => (typeByKey.get(mark.type!) ? [typeByKey.get(mark.type!)!] : []));
      if (types.length > 0) map.set(date, types);
    }
    return map;
  }, [resolved.marks, typeByKey]);
  // Categorias que vêm do base (e não foram sobrescritas pelo calendário): "data|categoria".
  const inheritedKeys = useMemo(() => {
    const own = new Set(content.marks.filter((mark) => mark.type !== null).map((mark) => `${mark.date}|${mark.type}`));
    const fromBase = new Set((baseContent?.marks ?? []).filter((mark) => mark.type !== null).map((mark) => `${mark.date}|${mark.type}`));
    return new Set(resolved.marks.map((mark) => `${mark.date}|${mark.type}`).filter((key) => fromBase.has(key) && !own.has(key)));
  }, [content.marks, baseContent, resolved.marks]);
  // Datas em que o base contribui com alguma categoria (aro tracejado no mês).
  const inheritedDates = useMemo(() => new Set([...inheritedKeys].map((key) => key.split("|")[0]!)), [inheritedKeys]);
  const counts = useMemo(() => countSchoolDays(resolved), [resolved]);
  const months = monthsFrom(content.startMonth);

  const setMarks = (marks: CalendarContent["marks"]) => onChange({ ...content, marks });

  const pick = (date: string, modifiers: { shift: boolean; add: boolean }) => {
    if (readOnly) return;
    const dates = modifiers.shift && lastPicked.current ? datesBetween(lastPicked.current, date) : [date];
    let marks = content.marks;
    for (const target of dates) {
      // Pintar vários dias de uma vez: cada passo enxerga o resultado do anterior.
      const current = resolveContent({ ...content, marks }, baseContent).marks;
      marks = paintDate(marks, baseContent, current, target, brush, { toggle: dates.length === 1, mode: modifiers.add ? "add" : "replace" });
    }
    lastPicked.current = date;
    setMarks(marks);
  };

  // Datas consecutivas com o mesmo nome viram um evento só ao criar a partir de uma linha.
  const eventDraft = (date: string, label: string | undefined) => {
    const named = label?.trim();
    if (!named) return { title: "", startDate: date, endDate: date };
    const sameName = resolved.marks.filter((mark) => mark.label?.trim().toLocaleLowerCase("pt-BR") === named.toLocaleLowerCase("pt-BR")).map((mark) => mark.date);
    const dates = [...new Set(sameName)].sort();
    let start = date;
    let end = date;
    for (let index = dates.indexOf(date) - 1; index >= 0 && daysApart(dates[index]!, start) === 1; index -= 1) start = dates[index]!;
    for (let index = dates.indexOf(date) + 1; index < dates.length && daysApart(end, dates[index]!) === 1; index += 1) end = dates[index]!;
    return { title: named, startDate: start, endDate: end };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 pt-6">
          <span className="mr-2 text-sm font-medium">Pincel:</span>
          {resolved.markTypes.map((type) => {
            const active = brush.kind === "type" && brush.key === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setBrush({ kind: "type", key: type.key })}
                className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition", active ? "border-foreground bg-muted font-medium" : "hover:bg-muted")}
              >
                <span className="size-3 rounded-full" style={{ backgroundColor: type.color }} />
                {type.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setBrush({ kind: "erase" })}
            className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition", brush.kind === "erase" ? "border-foreground bg-muted font-medium" : "hover:bg-muted")}
          >
            <Eraser className="size-4" />
            Borracha
          </button>
          <p className="basis-full text-xs text-muted-foreground">
            Clique nos dias para pintar com o pincel escolhido (troca a categoria do dia); clicar de novo na mesma cor apaga. <b>Ctrl ou Alt + clique</b> soma uma
            categoria ao dia (até 3 — o círculo sai repartido). Shift + clique pinta do último dia clicado até este.
            {baseContent && " Dias com aro tracejado têm categorias do calendário-base; o que você marca soma a elas (use a borracha ou o lixinho para tirar uma do base)."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            typesByDate={typesByDate}
            inheritedDates={inheritedDates}
            schoolDays={counts.perMonth[`${year}-${String(month).padStart(2, "0")}`]}
            onPick={pick}
            readOnly={readOnly}
          />
        ))}
      </div>

      {resolved.semesters.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Dias letivos:{" "}
          {resolved.semesters.map((semester, index) => (
            <span key={semester.label + index} className="mr-4">
              <span className="font-medium text-foreground">{counts.perSemester[index]}</span> em {semester.label}
            </span>
          ))}
        </p>
      )}

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div>
            <h3 className="text-sm font-medium">Datas marcadas</h3>
            <p className="text-xs text-muted-foreground">
              O nome é <b>só do impresso</b>: aparece nas notas sob o mês quando o calendário mostra notas (ex.: “17 - Carnaval”), curto e sem tema. O que vai para as
              TVs e para o site (tema, horário, local) é cadastrado em <b>Eventos</b>. Datas vizinhas com o mesmo nome viram uma linha só. “Todo ano” leva a data
              para o mesmo dia no próximo ano.
            </p>
          </div>
          {resolved.marks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma data marcada ainda.</p>
          ) : (
            <div className="max-h-96 overflow-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-left text-xs">
                  <tr>
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Categoria</th>
                    <th className="px-3 py-2 font-medium">Nome no impresso</th>
                    <th className="px-3 py-2 text-center font-medium">Todo ano</th>
                    <th className="w-20" />
                  </tr>
                </thead>
                <tbody>
                  {resolved.marks.map((mark) => {
                    const type = mark.type ? typeByKey.get(mark.type) : undefined;
                    const rowKey = `${mark.date}:${mark.type}`;
                    return (
                      <tr key={rowKey} className="border-t">
                        <td className="whitespace-nowrap px-3 py-1.5">
                          {formatDay(mark.date)}
                          {inheritedKeys.has(`${mark.date}|${mark.type}`) && <span className="ml-2 text-xs text-muted-foreground">(base)</span>}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="inline-flex items-center gap-2">
                            <span className="inline-block size-3 rounded-full" style={{ backgroundColor: type?.color }} />
                            {type?.label ?? mark.type}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <Input
                            className="h-8"
                            value={mark.label ?? ""}
                            disabled={readOnly}
                            maxLength={120}
                            onChange={(event) =>
                              setMarks(updateMarkDetails(content.marks, baseContent, resolved.marks, mark.date, mark.type!, { label: event.target.value }))
                            }
                          />
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          <input
                            type="checkbox"
                            aria-label={`Repete todo ano: ${formatDay(mark.date)}`}
                            checked={Boolean(mark.fixed)}
                            disabled={readOnly}
                            onChange={(event) =>
                              setMarks(updateMarkDetails(content.marks, baseContent, resolved.marks, mark.date, mark.type!, { fixed: event.target.checked }))
                            }
                          />
                        </td>
                        <td className="whitespace-nowrap px-1">
                          {onCreateEvent && !readOnly && (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Criar evento a partir de ${formatDay(mark.date)}`}
                              title="Criar evento (TV/site) a partir desta data"
                              onClick={() => onCreateEvent(eventDraft(mark.date, mark.label))}
                            >
                              <CalendarPlus className="size-4" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Remover ${formatDay(mark.date)}`}
                            disabled={readOnly}
                            onClick={() => setMarks(removeMark(content.marks, baseContent, resolved.marks, mark.date, mark.type!))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function daysApart(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
