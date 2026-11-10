import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPluginAdminPageData } from "@venore/plugin-sdk/admin";
import { AdminAccessDenied, AdminPageHeader, Button } from "@venore/plugin-sdk/ui";
import { listMembers } from "../../index";
import { CALENDARIOS_PERMISSIONS } from "../../shared/permissions";
import { MembersEditor } from "./members-editor";

export default async function CalendariosMembersPage({ params }: { params: Promise<{ sectorId: string }> }) {
  const gate = await getPluginAdminPageData("calendarios");
  if (!gate.granted || !(gate.actor.isSuperadmin || gate.actor.permissions.includes(CALENDARIOS_PERMISSIONS.admin))) {
    return <AdminAccessDenied message="Só quem administra os calendários gerencia os membros dos setores." />;
  }

  const { sectorId } = await params;
  const result = await listMembers({ sectorId });
  if (!result.success) return <p className="text-sm text-destructive">{result.error.message}</p>;
  const { sector, members, users } = result.data;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Membros — ${sector.name}`}
        description="Quem atua neste setor e com o quê. Editar: marca datas e envia para validação. Validar: aprova ou devolve. Publicar: gera e publica o PDF e a imagem. A pessoa também precisa do papel com a permissão “Ver calendários” (calendarios.read)."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/calendarios">
              <ArrowLeft className="size-4" />
              Calendários
            </Link>
          </Button>
        }
      />
      <MembersEditor sectorId={sector.id} members={members} users={users} />
    </div>
  );
}
