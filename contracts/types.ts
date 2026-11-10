// Modelo de dados do plugin Calendários. Tudo que a edição de um calendário precisa para ser
// impressa mora em CalendarContent (jsonb em editions.content). O que é "estrutura" (setor,
// calendário, membros, base herdada) vive em tabelas próprias.

// "off"  = não é dia letivo (feriado, recesso, semana pedagógica…): tira o dia da contagem.
// "on"   = é dia letivo mesmo fora de segunda a sexta (sábado letivo): soma na contagem.
// "none" = só informa (início/término de bimestre, recuperação…): a contagem não muda.
export type MarkEffect = "off" | "on" | "none";

// Uma categoria de data (a "legenda"): cor do círculo no calendário + efeito na contagem de dias
// letivos. As categorias são da edição (cada calendário tem a sua legenda) e herdáveis do base.
export type MarkType = {
  key: string;
  label: string;
  // #rrggbb — impresso cru de propósito: o PDF é um documento, não segue o tema do portal.
  color: string;
  effect: MarkEffect;
  // false = a categoria colore o dia mas não aparece na legenda impressa.
  legend: boolean;
};

// Uma categoria numa data. Uma data pode ter até 3 categorias: várias marcações com a mesma `date` e
// `type` diferentes (o círculo sai repartido na cor de cada uma).
// - Herança: as marcações do calendário SOMAM às do calendário-base na mesma data (o base cuida do geral —
//   feriados, férias; o calendário acrescenta o que é dele, mesmo sobreposto). Marcação própria com o mesmo
//   `type` do base o sobrescreve (nome, "todo ano").
// - `type: null` é uma "exclusão": tira marcações do base. Com `exclude` (a categoria), tira só aquela da data;
//   sem `exclude`, tira TODAS as do base naquela data.
// - `label` é o nome que vai no IMPRESSO ("Semana acadêmica"). O texto completo para TVs e sites
//   (tema, horário, local) são os Eventos públicos, que não passam pela validação do PDF. Datas
//   vizinhas com o mesmo rótulo viram uma linha só nas notas do mês ("6 a 17 - Recesso").
// - `fixed` marca feriado de data fixa (08/09, 25/12…) que "Iniciar próximo ano" leva para o mesmo dia.
export const MAX_CATEGORIES_PER_DATE = 3;

export type DayMark = {
  // YYYY-MM-DD, sempre local (sem fuso).
  date: string;
  type: string | null;
  // Só em exclusão (`type: null`): a categoria do base a tirar desta data. Ausente = todas as do base.
  exclude?: string;
  label?: string;
  fixed?: boolean;
};

// Faixa mostrada no rodapé (bimestres/semestres) e/ou intervalo de contagem de dias letivos.
export type DateRange = { label: string; start: string; end: string };

export type CalendarTheme = {
  // Título, nome dos meses, rodapé e totais.
  primary: string;
  // Ano no título, faixas de período.
  accent: string;
  // Fundo da linha D S T Q Q S S.
  header: string;
  // Opcionais: cor do título "CALENDÁRIO" e do círculo atrás do logo (padrão: a principal). A Fidelis
  // usa azul-marinho nos dois e teal no resto.
  titleColor?: string;
  discColor?: string;
};

export type CalendarDisplay = {
  legend: boolean;
  // Notas escritas sob cada mês ("17 - Carnaval").
  monthNotes: boolean;
  // "20 dias letivos" sob o nome de cada mês.
  schoolDayCounts: boolean;
  // Caixa "TOTAL DE DIAS LETIVOS — 1º SEMESTRE: 101".
  semesterTotals: boolean;
};

export type CalendarContent = {
  // "CALENDÁRIO" + ano (em destaque) + subtítulo ("ENSINO FUNDAMENTAL I").
  title: string;
  yearText: string;
  subtitle: string;
  // Primeiro mês exibido, YYYY-MM. São sempre 12 meses (o EaD da Fidelis começa em fevereiro).
  startMonth: string;
  // Ids de mídia (texto solto, sem FK), categoria restrita do plugin.
  headerImageMediaId: string | null;
  logoMediaId: string | null;
  theme: CalendarTheme;
  display: CalendarDisplay;
  markTypes: MarkType[];
  marks: DayMark[];
  // Barras do rodapé (1º Bimestre - 02/02 até 17/04…).
  periods: DateRange[];
  // Intervalos de contagem de dias letivos e dos totais (1º Semestre…). O dia só é letivo dentro
  // de algum deles.
  semesters: DateRange[];
  // Texto da caixa "INÍCIO E TÉRMINO DE AULAS". Aceita <b>, <i>, <u> e quebra de linha.
  infoText: string;
  // Linhas da assinatura ("Hartmut August", "Ato nº 03/2020", "Diretor").
  signature: string[];
  // Substitui, para um mês (YYYY-MM), as notas geradas das marcações.
  noteOverrides: Record<string, string>;
};

export type EditionStatus = "draft" | "in_review" | "approved" | "published";

export type SectorRecord = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  // Imagem padrão dos eventos do setor (vale quando o evento não tem capa própria).
  defaultEventCoverMediaId: string | null;
  createdAt: Date;
};

export type CalendarRecord = {
  id: string;
  sectorId: string;
  slug: string;
  name: string;
  // Calendário-base de quem herdar categorias e marcações (mesmo setor). null = independente.
  baseCalendarId: string | null;
  // Base = só serve de fonte para os outros: não passa por aprovação nem gera PDF.
  isBase: boolean;
  sortOrder: number;
  // Nome do arquivo de download; {ano} e {calendario} são substituídos.
  fileNameTemplate: string;
  createdAt: Date;
};

export type MemberRecord = {
  sectorId: string;
  userId: string;
  canEdit: boolean;
  canApprove: boolean;
  canPublish: boolean;
};

export type EditionRecord = {
  id: string;
  calendarId: string;
  year: number;
  status: EditionStatus;
  content: CalendarContent;
  version: number;
  reviewNote: string | null;
  approvedRevisionId: string | null;
  publishedRevisionId: string | null;
  publishedPdfMediaId: string | null;
  publishedPngMediaId: string | null;
  publishedAt: Date | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RevisionRecord = {
  id: string;
  editionId: string;
  number: number;
  // Conteúdo JÁ RESOLVIDO (herança aplicada): o aprovado é exatamente o que vai pro PDF.
  content: CalendarContent;
  approvedBy: string;
  approvedAt: Date;
  pdfMediaId: string | null;
  pngMediaId: string | null;
};

export type EditionEventAction = "created" | "saved" | "submitted" | "approved" | "rejected" | "published";

export type EditionEventRecord = {
  id: string;
  editionId: string;
  action: EditionEventAction;
  actorId: string;
  note: string | null;
  createdAt: Date;
};

// Evento público (TVs do Broadcast, site e página /calendarios). Datas e horas são locais, sem fuso:
// "YYYY-MM-DD" / "HH:MM". Sem horário = dia inteiro; sem endDate = um dia só.
export type EventRecord = {
  id: string;
  sectorId: string;
  title: string;
  // Tema / descrição — o texto que o impresso não carrega.
  detail: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  // Capa própria (id de mídia); null = imagem padrão do setor ou placeholder.
  coverMediaId: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// O que sai do plugin para consumo externo (barrel público): sem ids de usuário nem datas internas.
export type PublicEvent = {
  id: string;
  sectorSlug: string;
  sectorName: string;
  title: string;
  detail: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  // Caminho (relativo à origem do portal) da imagem do evento: capa própria, padrão do setor ou placeholder.
  // Sempre existe — as TVs e o site mostram o que ele devolver.
  coverPath: string;
};
