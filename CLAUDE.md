# @venore/plugin-calendarios — instruções para o Claude

Plugin do [Venore Docks](https://github.com/venore-docks/venore-docks), instalado no core como dependência git
(`@venore/plugin-calendarios`). Este repo não roda sozinho: build, lint, typecheck e testes rodam **a partir do core**.
Visão geral, fluxo, permissões e links para o WordPress: `README.md`.

## Regras de arquitetura

As regras são as do core — não copie para cá, leia lá quando a tarefa tocar a área:
- `AGENTS.md` do core (§1 camadas `handler → service → store`, `OperationResult<T>`; §2 padrões proibidos).
- `.claude/rules/plugin-routes.md` do core: toda rota mora em `routes/route-table.ts`, nunca em `app/`.
- `.claude/rules/css-tokens.md` do core: só tokens shadcn no admin. **Exceção**: `shared/render/render-calendar.ts` é o
  CSS do PDF (medidas em pt e cores do modelo de 2026) e tem cor/pt/fonte crus de propósito — mexer nele muda o PDF
  oficial. Cores dos círculos de data na tela vêm da categoria (dado), não do tema.
- Schema: migration gerada com `drizzle-kit generate` (`drizzle.config.ts`), nunca editar `_journal.json` à mão.
- Plugin não importa schema de outro plugin nem do core: ids de mídia e de usuário são texto solto, sem FK.

## Pontos que já morderam

- **Transação + consulta no `db` global trava** num Postgres de conexão única (PGlite) e é erro em qualquer
  driver. Dentro de `db.transaction` só use `tx`; calcule slug/consultas antes (`createCalendar`).
- `content` é jsonb: o Postgres **reordena as chaves**. Comparar documento salvo × editado sempre com
  `canonicalJson`/`isSameContent` (`shared/content-schema.ts`), nunca `JSON.stringify` puro.
- Datas são `"YYYY-MM-DD"` locais, nunca `Date` com fuso (`shared/engine/dates.ts`): um servidor em UTC vê o dia
  errado. Date só como aritmética em UTC.
- **Várias categorias por data** (até 3, `MAX_CATEGORIES_PER_DATE`): são várias marcações com a mesma `date`. A herança
  SOMA: marcações do calendário se juntam às do base na data (própria com o mesmo `type` sobrescreve nome/"todo ano"); `type: null` é
  exclusão (com `exclude` = só aquela categoria do base; sem = todas as do base na data). Toda edição de uma data calcula o conjunto
  final e grava só a diferença para o base (`setDate` em `routes/admin-calendar/marks.ts`). Efeito no dia letivo: `off` vence `on`, que vence `none`.
- **Eventos públicos** (`calEvents`) são do SETOR e ficam FORA do fluxo de validação/revisão: texto do impresso (`label` da marcação)
  e texto de TV/site (tema, local, horário) são coisas diferentes. O Broadcast lê por `listUpcomingEvents` (barrel, dependência
  opcional) — mudar o formato de `PublicEvent`/`EventSector` quebra `venore-plugin-broadcast/runtime/calendarios-agenda.ts`.
- **Capa de evento**: própria → `sectors.default_event_cover_media_id` → placeholder SVG (`shared/event-cover.ts`). A rota pública só
  entrega o id que o banco aponta (nunca um do request). O Broadcast usa `coverPath` como `coverUrl` do card.
- **Herança**: o documento guarda só o que difere do base (marcações próprias e exclusões). A
  **revisão aprovada guarda o conteúdo resolvido** — o PDF publicado nunca depende do base de hoje. `outdatedSinceApproval`
  compara o resolvido de agora com a revisão.
- O id de mídia no documento é editável pelo cliente: `shared/media.ts` só lê arquivo com
  `accessPermission === calendarios.read` (categoria do plugin). A rota pública só entrega o id que o **banco**
  aponta como publicado, nunca um id do request.
- Layout (`render-calendar.ts`): coordenadas em pt medidas nos PDFs do marketing (dumps em
  `seed-extract/layout-*.json`, não versionados). Depois de mexer, rode `scripts/render-seed.mts` e compare com os
  PDFs de 2026. Chromium: `color-mix()` e `clip-path` em SVG já são usados — não trocar por motor mais antigo.
- Dias letivos: regra única em `shared/engine/school-days.ts`, validada contra os números impressos de 2026. Se mudar,
  `seeds/derive-base.test.ts` quebra de propósito.
- Os arquivos do seed (`seeds/assets/*`, `seeds/data/calendarios-2026.ts`) são **gerados** por
  `scripts/gen-seed.mjs` e `shared/render/fonts.generated.ts` por `scripts/gen-fonts.mjs` — não editar à mão.

## Verificar contra o core

```bash
cd ../venore-docks
npm pkg set "dependencies.@venore/plugin-calendarios=file:../venore-plugin-calendarios"   # não commitar
npm install --no-audit --no-fund --loglevel=error
npm run gen:registries:strict && npm run typecheck
npm run test:plugins -- --reporter=dot
git checkout package.json package-lock.json
```

(Sem rede/npm: junction `node_modules/@venore/plugin-calendarios` → este repo e `node_modules` deste repo → core, mais
a entrada no `package.json`; restaure o `package.json` depois e rode `npm run gen:registries`.)
Testes sem instalar nada: `.\scripts\run-tests.ps1` e `.\scripts\run-tests.ps1 -Integration`.

## Versão

`package.json` `version` = tag `vX.Y.Z`. Manter `manifest.ts#version` igual. Publicar = subir a versão e criar a tag
`v<version>` no mesmo commit; o core passa a usar a versão nova com a skill `bump-plugin`.
Todo repo `venore-plugin-*` da org precisa ser **público** no GitHub (senão o install na Vercel falha).
