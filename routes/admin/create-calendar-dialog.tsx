"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@venore/plugin-sdk/ui";
import { createCalendarAction } from "./actions";

type BaseOption = { id: string; name: string };
const NO_BASE = "none";

export function CreateCalendarDialog({
  sectorId,
  sectorName,
  defaultYear,
  bases,
}: {
  sectorId: string;
  sectorName: string;
  defaultYear: number;
  bases: BaseOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState(String(defaultYear));
  const [baseId, setBaseId] = useState(NO_BASE);
  const [isBase, setIsBase] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createCalendarAction({
        sectorId,
        name,
        year: Number(year),
        baseCalendarId: isBase || baseId === NO_BASE ? null : baseId,
        isBase,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setOpen(false);
      router.push(`/admin/calendarios/${result.data.editionId}`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="size-4" />
          Novo calendário
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Novo calendário — {sectorName}</DialogTitle>
            <DialogDescription>
              Já nasce com os feriados nacionais do ano marcados. Se herdar de um calendário-base, as categorias e as datas dele valem aqui também.
            </DialogDescription>
          </DialogHeader>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Nome</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ensino Fundamental I" required />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Ano</span>
            <Input type="number" value={year} onChange={(event) => setYear(event.target.value)} min={2000} max={2100} required />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={isBase} onChange={(event) => setIsBase(event.target.checked)} />
            <span>
              <span className="font-medium">É um calendário-base</span>
              <span className="block text-muted-foreground">
                Só guarda datas comuns (feriados, recessos) para os outros herdarem. Não é validado nem publicado.
              </span>
            </span>
          </label>
          {!isBase && bases.length > 0 && (
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Herdar de</span>
              <Select value={baseId} onValueChange={setBaseId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_BASE}>Ninguém (calendário independente)</SelectItem>
                  {bases.map((base) => (
                    <SelectItem key={base.id} value={base.id}>
                      {base.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending || !name.trim()}>
              Criar calendário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
