// Dois níveis de permissão:
// 1. RBAC global (papéis em /admin/rbac) — só abre a porta do plugin:
//    - read: ver calendários e baixar os arquivos publicados (todo colaborador).
//    - admin: administra tudo — cria setores/calendários, define membros, edita/valida/publica em
//      qualquer setor, apaga.
// 2. Membros por setor (tela "Membros" do plugin) — o que cada pessoa faz em CADA setor:
//    editar, validar (aprovar/devolver) e publicar. Um membro precisa também de `read`.
export const CALENDARIOS_PERMISSIONS = {
  read: "calendarios.read",
  admin: "calendarios.admin",
} as const;

// Categoria reservada de mídia de todos os arquivos do plugin (foto de cabeçalho, logos, PDF e PNG
// publicados). Restrita a calendarios.read no manifesto; a entrega pública dos arquivos publicados
// passa pela rota /api/calendarios/publicados, que só serve o que o banco aponta como publicado.
export const CALENDARIOS_FILES_CATEGORY = { key: "calendarios.arquivos", name: "Calendários" } as const;
