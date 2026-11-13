# @venore/plugin-calendarios

Calendários letivos impressos da FEM no Venore Docks (Portal do Colaborador). Cada setor (Colégio Erasto
Gaertner, Faculdade Fidelis, outros que vierem) marca as datas do seu calendário, valida e publica o **PDF**
(para imprimir/enviar aos alunos) e a **imagem PNG** (para o site), com um **link fixo** e uma **página para
embutir** nos sites WordPress. O setor também cadastra os **eventos** (com tema, local e horário) que alimentam
as **TVs do Broadcast**. Qualquer pessoa consulta os publicados e os próximos eventos em `/calendarios`.

Substitui o fluxo manual: marketing diagramando o PDF a cada ano e subindo o PNG no WordPress.

## Conceitos

| Conceito | O que é |
|---|---|
| **Setor** | Dono dos calendários e de quem os mantém. Unidade de permissão. |
| **Calendário** | Um PDF por ano (Ensino Fundamental I, Fidelis EaD…). Pertence a um setor. |
| **Calendário-base** | Opcional: guarda o que é geral — feriados, férias, recessos. Os calendários que **herdam** dele recebem essas datas e categorias e **acrescentam** as suas por cima, mesmo na mesma data (férias no base + reunião de conselho no calendário = as duas). Para tirar uma categoria do base num dia, o calendário a exclui (borracha ou lixinho). Não é validado nem publicado. Pode ser de **outro setor**: um **base geral** (feriados e recessos da instituição) é herdado por calendários do Colégio e da Faculdade — editou o base, todos os que herdam dele mudam (a herança é resolvida a cada leitura, ano a ano). |
| **Edição** | Calendário × ano. Tem o documento completo, versão (lock otimista), histórico e revisões. |
| **Categoria** | Uma "legenda": cor do dia + se conta como dia letivo (`off` feriado/recesso, `on` sábado letivo, `none` só informa). Uma data aceita **até 3 categorias** (o círculo sai repartido). |
| **Evento público** | O que as TVs e o site anunciam (título, tema/descrição, local, horário). É do **setor**, separado do texto impresso, e pode ser editado a qualquer momento sem refazer a validação do PDF. |

Os **dias letivos** (por mês e total de cada semestre) são **calculados**: segunda a sexta dentro de um
semestre, menos o que for categoria "não é dia letivo", mais os sábados letivos. Os números dos PDFs de 2026
são o teste de regressão do motor (`seeds/derive-base.test.ts`).

## Fluxo

| Status | Quem age | O que acontece |
|---|---|---|
| Rascunho | Editor do setor | marca datas, ajusta categorias/períodos/textos/imagens; envia para validação |
| Aguardando validação | Validador do setor | confere a prévia (PDF) e **valida** ou **devolve** com comentário |
| Validado | Publicador do setor | **publica**: gera PDF + PNG da versão validada |
| Publicado | todos | link fixo passa a servir o arquivo novo |

Qualquer edição depois do envio volta o calendário para rascunho; o arquivo já publicado continua no ar até
a próxima publicação. Validar congela uma **revisão com a herança já aplicada** — se o base mudar depois, o
calendário aparece como "defasado" (aviso no editor) e o publicado não muda sozinho. O calendário-base não
tem fluxo: só edita e salva.

"Iniciar 2027" leva a estrutura do último ano, **calcula os feriados nacionais** (Carnaval, Sexta-feira Santa e
Corpus Christi pela Páscoa), leva os feriados de data fixa do setor (marcados "todo ano") e desloca os
períodos em um ano. Recessos e sábados letivos precisam ser marcados de novo.

## Permissões

Dois níveis:

1. **RBAC global** (papéis em `/admin/rbac`) — só abre a porta do plugin:
   - `calendarios.read`: ver calendários e baixar os publicados (todo colaborador).
   - `calendarios.admin`: administra tudo — cria setores, define membros, edita/valida/publica em qualquer
     setor, apaga.
2. **Membros por setor** (tela *Membros* do setor, só admin) — o que cada pessoa faz em **cada** setor:
   **Editar**, **Validar**, **Publicar**. Quem é membro também precisa de `calendarios.read`.

Assim a Faculdade Fidelis e o Colégio não mexem nos calendários um do outro, e novos setores entram sem deploy.

## Entrega para os sites (WordPress)

O portal **não guarda credencial dos sites**: o WordPress é que aponta para o portal, de duas formas (sem login, `GET`).

**1. Página para embutir (`<iframe>`)** — a forma recomendada, no mesmo estilo `/ext/` das telas das TVs:

```
/ext/calendarios/embed/<setor>/<calendario>            ← ano publicado mais recente
/ext/calendarios/embed/<setor>/<calendario>?ano=2026   ← um ano específico
```

No WordPress (bloco "HTML personalizado"):

```html
<iframe src="https://SEU-PORTAL/ext/calendarios/embed/colegio-erasto-gaertner/ensino-fundamental-i"
        style="width:100%;border:0;aspect-ratio:1/1.5" loading="lazy" title="Calendário letivo"></iframe>
```

**Obrigatório no portal:** liberar o domínio do site em `FRAME_ANCESTORS` (variável de ambiente do core, CSP
`frame-ancestors`; ex.: `'self' https://www.erasto.com.br https://www.faculdadefidelis.com.br`) — sem isso o navegador
recusa o iframe. É global ao portal (as páginas públicas já são abertas). Os botões **Link de incorporação** em
`/admin/calendarios` copiam a URL de cada calendário.

**2. Link direto da imagem/PDF**, estável:

```
/api/calendarios/publicados/<setor>/<calendario>/atual.png     ← imagem do ano publicado mais recente
/api/calendarios/publicados/<setor>/<calendario>/atual.pdf
/api/calendarios/publicados/<setor>/<calendario>/2026.png      ← um ano específico
```

Serve como `<img src>` ou botão "Baixar PDF" onde o iframe não cabe (cache de 5 min + ETag, CORS aberto).

Ao publicar de novo no portal, os dois passam a mostrar o calendário novo em poucos minutos, **sem upload manual**.
Atenção: `atual` muda assim que um ano novo é publicado; enquanto 2026 ainda vigora e 2027 já foi publicado, use o
endereço com o ano (`?ano=2026` / `2026.png`) até a virada.

## Eventos e TVs (Broadcast)

O texto do **impresso** segue regras de página (ex.: "Semana acadêmica", curto, sem tema). O que as TVs e o site
precisam — o **tema**, o local, o horário — é cadastrado em **Eventos** (`/admin/calendarios/eventos/<setor>`, botão
"Eventos (TV e site)" de cada setor): título, tema/descrição, local, datas (um ou vários dias) e horário (sem
horário = dia inteiro). Quem edita o setor mexe nos eventos a qualquer momento, **sem refazer a validação do PDF**.
Na aba *Datas* de um calendário, o botão de evento ao lado de uma data marcada abre o formulário já preenchido
(título e período vêm do nome da data e das datas vizinhas com o mesmo nome).

Cada evento pode ter uma **imagem** (capa) própria. Sem ela vale a **imagem padrão do setor** (cartão no topo de
*Eventos*, trocável a qualquer momento) e, se o setor também não tiver, um **placeholder** neutro. A imagem certa
é servida num endereço público (`/api/calendarios/eventos/<id>/capa`), usado pela página `/calendarios` e pelas TVs.

Os eventos aparecem em **Próximos eventos** na página `/calendarios` e alimentam as **TVs**:

- No Broadcast (v1.9.16+), a agenda tem o campo **"Eventos vindos do Calendários"**: ligada a um setor (ex.: Faculdade
  Fidelis, Colégio Erasto Gaertner), ela mostra os eventos dele no rodízio e no ticker das TVs vinculadas — fonte
  única, sem digitar duas vezes. O Broadcast só lê (dependência **opcional**: sem o Calendários o campo some e nada muda).
  Eventos cadastrados direto na agenda deixam de entrar no rodízio enquanto ela estiver ligada.
- Contrato (barrel, sem login): `listUpcomingEvents({ sectorSlug?, from?, limit? })` (cada evento traz `coverPath`) e `listEventSectors()`.

## Instalação numa instância

1. Core: dependência `@venore/plugin-calendarios` no `package.json` (tag `v0.3.0`) e `calendarios` em
   `instances/<instância>.json`; deploy. Para as TVs, o Broadcast na versão **1.9.16** ou mais nova.
2. `/admin/plugins` → **Instalar**, marcando **Popular com dados de exemplo** (seed "Calendários de 2026":
   Colégio Erasto Gaertner — base + 4 calendários — e Faculdade Fidelis — presencial e EaD).
3. Em `/admin/rbac`, dar `calendarios.read` a todos os colaboradores e `calendarios.admin` a quem administra.
4. Em `/admin/calendarios` → **Membros** de cada setor, marcar quem edita, valida e publica.
5. Cada calendário semeado nasce **rascunho**: enviar para validação, validar e publicar (isso gera os links fixos).
6. Para embutir nos sites: `FRAME_ANCESTORS` com os domínios (ver acima). Para as TVs: no Broadcast, ligar cada agenda ao
   setor correspondente e vinculá-la às telas.

## PDF/PNG

`shared/pdf/` — Chromium headless (`puppeteer-core`), mesma página para o PDF (A4, `@page`) e para o PNG
(2,5×, ≈ 1985×2806 px). Mesma configuração do plugin Listas de materiais:

- **Vercel / Linux**: `@sparticuz/chromium-min` baixa o pack do Chromium na primeira execução de cada
  instância fria (~60 MB, GitHub Releases) para `/tmp`. `CALENDARIOS_CHROMIUM_PACK_URL` troca a origem.
  Recomendado: função com ≥ 1 GB de memória.
- **Dev local (Windows/macOS)**: Chrome/Edge instalado; `CALENDARIOS_CHROME_PATH` força um binário.
- O HTML vai ao navegador sem rede (fonte e imagens embutidas; texto escapado — só `<b>`, `<i>`, `<u>` e quebras
  de linha são aceitos na caixa de horário).

O layout (`shared/render/render-calendar.ts`) reproduz o modelo de 2026 com as coordenadas medidas nos PDFs do
marketing. A fonte é **Montserrat** em todos os pesos: o original mistura Montserrat com Gotham (licenciada),
então a tipografia dos números e meses é muito próxima, não idêntica.

## Limitações conhecidas

- **Várias categorias por data** (até 3): clique troca a categoria do dia; Ctrl/Alt + clique soma outra. Num calendário
  que herda do base, o que você marca soma ao que o base já tem; passar de 3 categorias no dia resolvido mostra só as 3 primeiras.
- **Dois layouts** (compacto do Colégio e com notas da Fidelis), escolhidos por "Notas sob cada mês". Caixa de
  horário, faixas de período e legenda só existem no compacto; no com notas só existem notas e totais.
- Fotos de cabeçalho do Ensino Fundamental II/Médio e da Fidelis vieram em baixa resolução (~100 dpi) dos
  PDFs de 2026 — vale subir fotos novas na aba *Página*.

## Desenvolvimento

Ver `CLAUDE.md`. Testes (a partir do core clonado em `..\venore-docks`):

- unitários (motor, render, schema, herança, seed 2026): `.\scripts\run-tests.ps1`
- fluxo completo contra Postgres em memória (PGlite): `.\scripts\run-tests.ps1 -Integration`
- layout contra os PDFs de 2026: `npx tsx scripts/render-seed.mts <seed-extract> <saída>` com o junction de
  `node_modules` (ver o script de testes). Apague o junction depois.
