"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@venore/plugin-sdk/ui";
import { removeMemberAction, setMemberAction } from "../admin/actions";

type Member = { userId: string; name: string; canEdit: boolean; canApprove: boolean; canPublish: boolean };
type UserOption = { id: string; name: string };
type CapKey = "canEdit" | "canApprove" | "canPublish";

const CAPS: { key: CapKey; label: string }[] = [
  { key: "canEdit", label: "Editar" },
  { key: "canApprove", label: "Validar" },
  { key: "canPublish", label: "Publicar" },
];

export function MembersEditor({ sectorId, members, users }: { sectorId: string; members: Member[]; users: UserOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newUserId, setNewUserId] = useState("");
  const memberIds = new Set(members.map((member) => member.userId));
  const candidates = users.filter((user) => !memberIds.has(user.id));

  const run = (task: () => Promise<{ ok: true } | { ok: false; error: string }>, success?: string) =>
    startTransition(async () => {
      const result = await task();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (success) toast.success(success);
      router.refresh();
    });

  const toggle = (member: Member, key: CapKey) =>
    run(() =>
      setMemberAction({
        sectorId,
        userId: member.userId,
        canEdit: member.canEdit,
        canApprove: member.canApprove,
        canPublish: member.canPublish,
        [key]: !member[key],
      }),
    );

  const add = () =>
    run(async () => {
      const result = await setMemberAction({ sectorId, userId: newUserId, canEdit: true, canApprove: false, canPublish: false });
      if (result.ok) setNewUserId("");
      return result;
    }, "Membro adicionado como editor — ajuste o que ele pode fazer.");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quem atua neste setor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguém ainda. Quem administra os calendários continua podendo tudo em todos os setores.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pessoa</TableHead>
                {CAPS.map((cap) => (
                  <TableHead key={cap.key} className="w-24 text-center">
                    {cap.label}
                  </TableHead>
                ))}
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  {CAPS.map((cap) => (
                    <TableCell key={cap.key} className="text-center">
                      <input
                        type="checkbox"
                        aria-label={`${cap.label}: ${member.name}`}
                        checked={member[cap.key]}
                        disabled={pending}
                        onChange={() => toggle(member, cap.key)}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remover ${member.name}`}
                      disabled={pending}
                      onClick={() => run(() => removeMemberAction(sectorId, member.userId), "Membro removido.")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <Select value={newUserId} onValueChange={setNewUserId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Escolha uma pessoa" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={pending || !newUserId}>
            <UserPlus className="size-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
