"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Send, Share2, Undo2 } from "lucide-react";
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
  Textarea,
} from "@venore/plugin-sdk/ui";
import type { EditionStatus } from "../../contracts/types";
import { publishEditionAction, reviewEditionAction, submitEditionAction } from "../admin/actions";

type Props = {
  editionId: string;
  version: number;
  status: EditionStatus;
  dirty: boolean;
  isBase: boolean;
  caps: { edit: boolean; approve: boolean; publish: boolean };
  title: string;
};

// Botões do fluxo, cada um só pra quem pode e só no status certo. Com alteração não salva, nada de
// enviar/validar: o que vai pra frente é sempre a versão salva. O calendário-base não tem fluxo.
export function WorkflowActions({ editionId, version, status, dirty, isBase, caps, title }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  if (isBase) return null;

  const run = (action: () => Promise<{ ok: true; data?: unknown } | { ok: false; error: string }>, success: string) =>
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
      setNote("");
      router.refresh();
    });

  const blockedHint = dirty ? "Salve as alterações primeiro." : undefined;

  return (
    <>
      {caps.edit && status === "draft" && (
        <ConfirmButton
          icon={<Send className="size-4" />}
          label="Enviar para validação"
          title={`Enviar ${title} para validação?`}
          description="Quem valida neste setor recebe o calendário para conferir. Se alguém editar depois do envio, ele volta para rascunho e precisa ser enviado de novo."
          confirmLabel="Enviar"
          disabled={pending || dirty}
          hint={blockedHint}
          onConfirm={() => run(() => submitEditionAction(editionId, version), "Calendário enviado para validação.")}
        />
      )}

      {caps.approve && status === "in_review" && (
        <>
          <ConfirmButton
            icon={<Check className="size-4" />}
            label="Validar"
            title={`Validar ${title}?`}
            description="Esta versão fica congelada e é ela que será publicada. Confira a prévia (PDF) antes, se ainda não conferiu."
            confirmLabel="Validar"
            disabled={pending || dirty}
            hint={blockedHint}
            onConfirm={() => run(() => reviewEditionAction(editionId, version, "approve", note), "Calendário validado.")}
          >
            <Textarea placeholder="Comentário (opcional)" value={note} onChange={(event) => setNote(event.target.value)} />
          </ConfirmButton>
          <ConfirmButton
            variant="outline"
            icon={<Undo2 className="size-4" />}
            label="Devolver"
            title="Devolver para ajustes"
            description="Explique o que precisa mudar — o comentário aparece no topo do calendário para quem for editar."
            confirmLabel="Devolver"
            disabled={pending || dirty}
            confirmDisabled={!note.trim()}
            hint={blockedHint}
            onConfirm={() => run(() => reviewEditionAction(editionId, version, "reject", note), "Calendário devolvido para ajustes.")}
          >
            <Textarea placeholder="O que precisa mudar?" value={note} onChange={(event) => setNote(event.target.value)} />
          </ConfirmButton>
        </>
      )}

      {caps.publish && status === "approved" && (
        <ConfirmButton
          icon={pending ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
          label={pending ? "Gerando arquivos…" : "Publicar"}
          title={`Publicar ${title}?`}
          description="O PDF e a imagem (PNG) são gerados a partir da versão validada e passam a valer nos links fixos dos sites. Pode levar alguns segundos."
          confirmLabel="Publicar"
          disabled={pending}
          onConfirm={() =>
            startTransition(async () => {
              const result = await publishEditionAction(editionId);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              if (result.data.skipped.length > 0) {
                toast.warning(`Publicado sem: ${result.data.skipped.join(", ")} (o arquivo não pôde ser lido).`);
              } else {
                toast.success("PDF e imagem publicados.");
              }
              router.refresh();
            })
          }
        />
      )}
    </>
  );
}

function ConfirmButton({
  icon,
  label,
  title,
  description,
  confirmLabel,
  disabled,
  confirmDisabled,
  hint,
  variant = "default",
  onConfirm,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  disabled?: boolean;
  confirmDisabled?: boolean;
  hint?: string;
  variant?: "default" | "outline";
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant={variant} disabled={disabled} title={hint}>
          {icon}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={confirmDisabled} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
