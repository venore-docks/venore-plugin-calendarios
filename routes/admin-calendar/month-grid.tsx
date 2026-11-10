"use client";

import { buildMonthGrid, MONTH_NAMES } from "../../shared/engine/dates";
import { cn } from "@venore/plugin-sdk/ui";
import type { MarkType } from "../../contracts/types";
import { circleBackground } from "../../shared/render/circle";
import { readableTextColor } from "./color";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

type Props = {
  year: number;
  month: number;
  // data -> categorias (já resolvidas com a herança do base; até 3)
  typesByDate: Map<string, MarkType[]>;
  // data -> a marcação veio do base (mostra um aro tracejado)
  inheritedDates: Set<string>;
  schoolDays: number | undefined;
  onPick: (date: string, modifiers: { shift: boolean; add: boolean }) => void;
  readOnly: boolean;
};

// Um mês clicável. As cores dos círculos vêm da categoria (dado do calendário, não do tema).
export function MonthGrid({ year, month, typesByDate, inheritedDates, schoolDays, onPick, readOnly }: Props) {
  const grid = buildMonthGrid(year, month);
  return (
    <div className="rounded-md border bg-card p-2">
      <div className="mb-1 flex items-baseline justify-between px-1">
        <span className="text-sm font-medium">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        {schoolDays !== undefined && (
          <span className="text-xs text-muted-foreground">
            {schoolDays} {schoolDays === 1 ? "dia letivo" : "dias letivos"}
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {WEEKDAYS.map((label, index) => (
          <span key={index} className="py-0.5 font-medium text-muted-foreground">
            {label}
          </span>
        ))}
        {grid.flat().map((cell) => {
          if (cell.outside) return <span key={cell.date} className="py-1 text-muted-foreground/30">{cell.day}</span>;
          const types = typesByDate.get(cell.date);
          const single = types?.length === 1 ? types[0] : undefined;
          const weekend = cell.weekday === 0;
          return (
            <button
              key={cell.date}
              type="button"
              disabled={readOnly}
              onClick={(event) => onPick(cell.date, { shift: event.shiftKey, add: event.ctrlKey || event.altKey || event.metaKey })}
              title={types?.map((type) => type.label).join(" + ")}
              className={cn(
                "mx-auto flex size-7 items-center justify-center rounded-full transition-colors",
                !types && "hover:bg-muted",
                !types && weekend && "text-destructive/70",
                types && inheritedDates.has(cell.date) && "outline outline-1 outline-dashed outline-offset-1 outline-foreground/40",
                readOnly && "cursor-default",
              )}
              style={types ? { background: circleBackground(types.map((type) => type.color)), color: single ? readableTextColor(single.color) : "#ffffff" } : undefined}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
