import { and, eq } from "drizzle-orm";
import { db } from "@venore/plugin-sdk";
import type { OperationResult } from "@venore/plugin-sdk";
import { authorizeActor } from "@venore/plugin-sdk/rbac";
import { calMembers } from "../database/schema";
import { CALENDARIOS_PERMISSIONS } from "./permissions";
import { failure } from "./results";

// Quem está agindo e o que pode em cada setor. O RBAC global só decide se a pessoa entra no plugin
// (read) ou administra tudo (admin); editar/validar/publicar vêm da tabela de membros do setor.
export type Actor = { actorId: string; isAdmin: boolean };
export type SectorCap = "edit" | "approve" | "publish" | "admin";
export type SectorCaps = Record<SectorCap, boolean>;

export const NO_CAPS: SectorCaps = { edit: false, approve: false, publish: false, admin: false };
export const ALL_CAPS: SectorCaps = { edit: true, approve: true, publish: true, admin: true };

export async function resolveActor(): Promise<OperationResult<Actor>> {
  const authz = await authorizeActor([CALENDARIOS_PERMISSIONS.read, CALENDARIOS_PERMISSIONS.admin]);
  if (!authz.authorized) return { success: false, error: authz.error };
  const admin = await authorizeActor(CALENDARIOS_PERMISSIONS.admin);
  return { success: true, data: { actorId: authz.actorId, isAdmin: admin.authorized } };
}

export async function capsFor(actor: Actor, sectorId: string): Promise<SectorCaps> {
  if (actor.isAdmin) return ALL_CAPS;
  const [member] = await db
    .select()
    .from(calMembers)
    .where(and(eq(calMembers.sectorId, sectorId), eq(calMembers.userId, actor.actorId)))
    .limit(1);
  if (!member) return NO_CAPS;
  return { edit: member.canEdit, approve: member.canApprove, publish: member.canPublish, admin: false };
}

const CAP_MESSAGES: Record<SectorCap, string> = {
  edit: "Você não tem permissão para editar os calendários deste setor.",
  approve: "Você não tem permissão para validar calendários deste setor.",
  publish: "Você não tem permissão para publicar calendários deste setor.",
  admin: "Só quem administra os calendários pode fazer isso.",
};

export async function requireCap(actor: Actor, sectorId: string, cap: SectorCap): Promise<OperationResult<SectorCaps>> {
  const caps = await capsFor(actor, sectorId);
  return caps[cap] ? { success: true, data: caps } : failure("forbidden_sector", CAP_MESSAGES[cap]);
}

// Vê rascunhos/validados do setor: qualquer capacidade serve (quem só lê vê o que foi publicado).
export function canSeeWorkInProgress(caps: SectorCaps): boolean {
  return caps.edit || caps.approve || caps.publish || caps.admin;
}
