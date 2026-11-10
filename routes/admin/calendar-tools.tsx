"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Link2, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
import { deleteCalendarAction, deleteSectorAction, startNextYearAction, updateCalendarAction } from "./actions";

export function StartNextYearButton({ calendarId, calendarName, fromYear }: { calendarId: string; calendarName: string; fromYear: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await startNextYearAction(calendarId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Calendário de ${result.data.year} criado a partir de ${fromYear}.`);
      router.push(`/admin/calendarios/${result.data.editionId}`);
    });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" disabled={pending}>
          <CalendarPlus className="size-4" />
          Iniciar {fromYear + 1}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Iniciar {fromYear + 1} — {calendarName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Leva a estrutura de {fromYear} (categorias, textos, aparência, assinatura), calcula os feriados nacionais de {fromYear + 1} e
            desloca os períodos em um ano. Recessos, sábados letivos e as demais datas precisam ser marcados de novo. O calendário de {fromYear}{" "}
            continua como está.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirm}>Criar {fromYear + 1}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Link estável do arquivo publicado — é este que vai uma vez só para o WordPress.
export function CopyLinkButton({ path, label }: { path: string; label: string }) {
  const copy = async () => {
    const url = new URL(path, window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Link ${label} copiado.`);
    } catch {
      toast.message(url);
    }
  };
  return (
    <Button size="sm" variant="ghost" onClick={copy}>
      <Link2 className="size-4" />
      Link {label}
    </Button>
  );
}

type BaseOption = { id: string; name: string };
const NO_BASE = "none";

export function EditCalendarDialog({
  calendar,
  bases,
}: {
  calendar: { id: string; name: string; baseCalendarId: string | null; isBase: boolean; fileNameTemplate: string };
  bases: BaseOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(calendar.name);
  const [baseId, setBaseId] = useState(calendar.baseCalendarId ?? NO_BASE);
  const [isBase, setIsBase] = useState(calendar.isBase);
  const [template, setTemplate] = useState(calendar.fileNameTemplate);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateCalendarAction({
        calendarId: calendar.id,
        name,
        baseCalendarId: isBase || baseId === NO_BASE ? null : baseId,
        isBase,
        fileNameTemplate: template,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Calendário atualizado.");
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Settings2 className="size-4" />
          Ajustes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Ajustes do calendário</DialogTitle>
            <DialogDescription>O endereço estável dos arquivos publicados é definido na criação: renomear o calendário não quebra os links já usados nos sites.</DialogDescription>
          </DialogHeader>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Nome</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Nome do arquivo baixado</span>
            <Input value={template} onChange={(event) => setTemplate(event.target.value)} required />
            <span className="block text-xs text-muted-foreground">{"Use {ano} e {calendario}. Ex.: Calendário {ano} - {calendario}.pdf"}</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1" checked={isBase} onChange={(event) => setIsBase(event.target.checked)} />
            <span>
              <span className="font-medium">É um calendário-base</span>
              <span className="block text-muted-foreground">Fonte de datas comuns; não é validado nem publicado.</span>
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
                  {bases
                    .filter((base) => base.id !== calendar.id)
                    .map((base) => (
                      <SelectItem key={base.id} value={base.id}>
                        {base.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending || !name.trim() || !template.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Apagar pede o nome digitado, nos dois níveis (calendário e setor).
export function DeleteButton({
  kind,
  id,
  name,
  description,
}: {
  kind: "calendar" | "sector";
  id: string;
  name: string;
  description: string;
}) {
  const router = useRouter();
  const [confirmName, setConfirmName] = useState("");
  const [pending, startTransition] = useTransition();
  const noun = kind === "calendar" ? "calendário" : "setor";

  const confirm = () =>
    startTransition(async () => {
      const result = kind === "calendar" ? await deleteCalendarAction(id, confirmName) : await deleteSectorAction(id, confirmName);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.data.name} apagado.`);
      router.refresh();
    });

  return (
    <AlertDialog onOpenChange={() => setConfirmName("")}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive" disabled={pending}>
          <Trash2 className="size-4" />
          Apagar {noun}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Apagar {noun} “{name}”?
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <label className="block space-y-1.5 text-sm">
          <span>
            Digite <span className="font-medium">{name}</span> para confirmar
          </span>
          <Input value={confirmName} onChange={(event) => setConfirmName(event.target.value)} />
        </label>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={confirmName.trim() !== name.trim()} onClick={confirm}>
            Apagar {noun}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
