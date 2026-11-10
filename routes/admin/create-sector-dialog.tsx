"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input } from "@venore/plugin-sdk/ui";
import { createSectorAction } from "./actions";

export function CreateSectorDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await createSectorAction(name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Setor criado. Defina quem atua nele em Membros.");
      setOpen(false);
      setName("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="size-4" />
          Novo setor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Novo setor</DialogTitle>
            <DialogDescription>
              O setor é dono dos seus calendários e de quem os mantém (ex.: Colégio Erasto Gaertner, Faculdade Fidelis).
            </DialogDescription>
          </DialogHeader>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium">Nome do setor</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Faculdade Fidelis" required />
          </label>
          <DialogFooter>
            <Button type="submit" disabled={pending || !name.trim()}>
              Criar setor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
