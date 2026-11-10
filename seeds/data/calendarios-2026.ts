// GERADO por scripts/gen-seed.mjs a partir dos PDFs de 2026 do marketing — não editar à mão.
import type { CalendarContent } from "../../contracts/types";

export type SeedCalendar = {
  slug: string;
  sector: "colegio-erasto-gaertner" | "faculdade-fidelis";
  name: string;
  year: number;
  // chaves de SEED_ASSETS
  header: string;
  logo: string;
  // Conteúdo completo, sem herança (o seed deriva o calendário-base do Colégio).
  content: CalendarContent;
};

export const CALENDARIOS_2026: SeedCalendar[] = [
  {
    "slug": "erasto-educacao-infantil",
    "sector": "colegio-erasto-gaertner",
    "name": "Educação Infantil",
    "year": 2026,
    "header": "header-erasto-educacao-infantil-rgb",
    "logo": "logo-erasto",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026",
      "subtitle": "EDUCAÇÃO INFANTIL",
      "startMonth": "2026-01",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#007185",
        "accent": "#faa619",
        "header": "#6599aa"
      },
      "display": {
        "legend": true,
        "monthNotes": false,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início e Término das aulas",
          "color": "#e36575",
          "effect": "none",
          "legend": true
        },
        {
          "key": "feriado",
          "label": "Feriado",
          "color": "#faa619",
          "effect": "off",
          "legend": true
        },
        {
          "key": "sabado-letivo",
          "label": "Sábado Letivo",
          "color": "#007185",
          "effect": "on",
          "legend": true
        },
        {
          "key": "semana-pedagogica",
          "label": "Semana Pedagógica",
          "color": "#55c5d0",
          "effect": "off",
          "legend": true
        },
        {
          "key": "conselho-classe",
          "label": "Conselho de Classe em contraturno",
          "color": "#f172ac",
          "effect": "none",
          "legend": true
        },
        {
          "key": "recesso-alunos",
          "label": "Recesso para alunos",
          "color": "#7dc242",
          "effect": "off",
          "legend": true
        },
        {
          "key": "dia-letivo-comemoracoes",
          "label": "Dia letivo - semana de comemorações (Dia das Mães, Dia dos Pais, Semana das Crianças e Natal)",
          "color": "#c8d745",
          "effect": "none",
          "legend": true
        }
      ],
      "marks": [
        {
          "date": "2026-01-01",
          "type": "feriado",
          "label": "Confraternização Universal",
          "fixed": true
        },
        {
          "date": "2026-01-26",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-27",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-28",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-29",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-30",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-02-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Carnaval"
        },
        {
          "date": "2026-02-18",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-03-14",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-03-28",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Sexta-feira Santa"
        },
        {
          "date": "2026-04-20",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Tiradentes",
          "fixed": true
        },
        {
          "date": "2026-04-25",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Dia do Trabalho",
          "fixed": true
        },
        {
          "date": "2026-05-04",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-05-05",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-05-06",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-05-07",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-05-08",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-05-25",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-26",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-27",
          "type": "conselho-classe"
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Corpus Christi"
        },
        {
          "date": "2026-06-05",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-07-06",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-07",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-08",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-09",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-10",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-13",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-14",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-15",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-17",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-20",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-21",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-22",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-08-03",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-08-04",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-08-05",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-08-06",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-08-07",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Independência do Brasil",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Nossa Senhora da Luz dos Pinhais",
          "fixed": true
        },
        {
          "date": "2026-10-05",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-10-06",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-10-07",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-10-08",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-10-09",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Padroeira do Brasil",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado"
        },
        {
          "date": "2026-10-26",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-27",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-28",
          "type": "conselho-classe"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Finados",
          "fixed": true
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Consciência Negra",
          "fixed": true
        },
        {
          "date": "2026-12-01",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-02",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-03",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-04",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-05",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-12-07",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-08",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-09",
          "type": "dia-letivo-comemoracoes"
        },
        {
          "date": "2026-12-10",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "label": "Natal",
          "fixed": true
        },
        {
          "date": "2026-07-20",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-21",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-22",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-12-05",
          "type": "dia-letivo-comemoracoes"
        }
      ],
      "periods": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-07-03"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-23",
          "end": "2026-12-10"
        }
      ],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-06-30"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-01",
          "end": "2026-12-10"
        }
      ],
      "infoText": "<b>INÍCIO E TÉRMINO DE AULAS:</b> <i>13h00 às 17h50 (tarde)</i>\n6 aulas de 45 minutos de segunda-feira a sexta-feira.",
      "signature": [
        "Hartmut August",
        "Ato nº 03/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  },
  {
    "slug": "erasto-ensino-fundamental-i",
    "sector": "colegio-erasto-gaertner",
    "name": "Ensino Fundamental I",
    "year": 2026,
    "header": "header-erasto-ensino-fundamental-i-rgb",
    "logo": "logo-erasto",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026",
      "subtitle": "ENSINO FUNDAMENTAL I",
      "startMonth": "2026-01",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#007185",
        "accent": "#faa619",
        "header": "#6599aa"
      },
      "display": {
        "legend": true,
        "monthNotes": false,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início e Término das aulas",
          "color": "#e36575",
          "effect": "none",
          "legend": true
        },
        {
          "key": "inicio-termino-bimestre",
          "label": "Início e Término de bimestre",
          "color": "#6d4f4e",
          "effect": "none",
          "legend": true
        },
        {
          "key": "feriado",
          "label": "Feriado",
          "color": "#faa619",
          "effect": "off",
          "legend": true
        },
        {
          "key": "recuperacao",
          "label": "Recuperação",
          "color": "#695da8",
          "effect": "none",
          "legend": true
        },
        {
          "key": "sabado-letivo",
          "label": "Sábado Letivo",
          "color": "#007185",
          "effect": "on",
          "legend": true
        },
        {
          "key": "semana-pedagogica",
          "label": "Semana Pedagógica",
          "color": "#55c5d0",
          "effect": "off",
          "legend": true
        },
        {
          "key": "conselho-classe",
          "label": "Conselho de Classe em contraturno",
          "color": "#f172ac",
          "effect": "none",
          "legend": true
        },
        {
          "key": "recesso-alunos",
          "label": "Recesso para alunos",
          "color": "#7dc242",
          "effect": "off",
          "legend": true
        }
      ],
      "marks": [
        {
          "date": "2026-01-01",
          "type": "feriado",
          "label": "Confraternização Universal",
          "fixed": true
        },
        {
          "date": "2026-01-26",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-27",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-28",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-29",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-30",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-02-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Carnaval"
        },
        {
          "date": "2026-02-18",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Sexta-feira Santa"
        },
        {
          "date": "2026-04-17",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-20",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Tiradentes",
          "fixed": true
        },
        {
          "date": "2026-04-22",
          "type": "conselho-classe"
        },
        {
          "date": "2026-04-23",
          "type": "conselho-classe"
        },
        {
          "date": "2026-04-24",
          "type": "recuperacao"
        },
        {
          "date": "2026-04-27",
          "type": "conselho-classe"
        },
        {
          "date": "2026-04-28",
          "type": "conselho-classe"
        },
        {
          "date": "2026-04-29",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Dia do Trabalho",
          "fixed": true
        },
        {
          "date": "2026-05-23",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Corpus Christi"
        },
        {
          "date": "2026-06-05",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-07-06",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-07",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-08",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-09",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-10",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-13",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-14",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-15",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-17",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-20",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-21",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-22",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-07-27",
          "type": "recuperacao"
        },
        {
          "date": "2026-07-28",
          "type": "recuperacao"
        },
        {
          "date": "2026-07-29",
          "type": "recuperacao"
        },
        {
          "date": "2026-08-22",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Independência do Brasil",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Nossa Senhora da Luz dos Pinhais",
          "fixed": true
        },
        {
          "date": "2026-10-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-10-06",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-07",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-08",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Padroeira do Brasil",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado"
        },
        {
          "date": "2026-10-14",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-15",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-16",
          "type": "conselho-classe"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Finados",
          "fixed": true
        },
        {
          "date": "2026-11-07",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-11-14",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Consciência Negra",
          "fixed": true
        },
        {
          "date": "2026-12-10",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-12-14",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-15",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-16",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-17",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "label": "Natal",
          "fixed": true
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-22",
          "type": "recuperacao"
        },
        {
          "date": "2026-04-23",
          "type": "recuperacao"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-07-20",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-21",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-22",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-12-10",
          "type": "inicio-termino-bimestre"
        }
      ],
      "periods": [
        {
          "label": "1º Bimestre",
          "start": "2026-02-02",
          "end": "2026-04-17"
        },
        {
          "label": "2º Bimestre",
          "start": "2026-04-22",
          "end": "2026-07-03"
        },
        {
          "label": "3º Bimestre",
          "start": "2026-07-23",
          "end": "2026-10-02"
        },
        {
          "label": "4º Bimestre",
          "start": "2026-10-05",
          "end": "2026-12-10"
        }
      ],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-07-03"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-23",
          "end": "2026-12-10"
        }
      ],
      "infoText": "<b>INÍCIO E TÉRMINO DE AULAS:</b> <i>7h15 às 12h20 (manhã) / 13h10 às 18h (tarde)</i>\nPara o 1º ano serão ofertadas 6 aulas de 45 minutos, de segunda-feira a sexta-feira, totalizando 4h30 horas diárias.\nPara o 2º ao 5º ano serão ofertadas 6 aulas de 45 minutos, na segunda-feira, terça-feira, quinta-feira e sexta-feira, totalizando 4h30 horas diárias.\nPara o 2º ao 5º ano serão ofertadas 5 aulas de 50 minutos, na quarta-feira, totalizando 4h10 horas diárias.",
      "signature": [
        "Hartmut August",
        "Ato nº 03/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  },
  {
    "slug": "erasto-ensino-fundamental-ii-medio",
    "sector": "colegio-erasto-gaertner",
    "name": "Ensino Fundamental II e Ensino Médio",
    "year": 2026,
    "header": "header-erasto-ensino-fundamental-ii-medio",
    "logo": "logo-erasto",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026",
      "subtitle": "ENSINO FUNDAMENTAL II E ENSINO MÉDIO (1º E 2º EM)",
      "startMonth": "2026-01",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#006b82",
        "accent": "#f7a600",
        "header": "#6c9db0"
      },
      "display": {
        "legend": true,
        "monthNotes": false,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início e Término das aulas",
          "color": "#e36575",
          "effect": "none",
          "legend": true
        },
        {
          "key": "inicio-termino-bimestre",
          "label": "Início e Término de bimestre",
          "color": "#6d4f4e",
          "effect": "none",
          "legend": true
        },
        {
          "key": "feriado",
          "label": "Feriado",
          "color": "#faa619",
          "effect": "off",
          "legend": true
        },
        {
          "key": "recuperacao",
          "label": "Recuperação",
          "color": "#695da8",
          "effect": "none",
          "legend": true
        },
        {
          "key": "sabado-letivo",
          "label": "Sábado Letivo",
          "color": "#007185",
          "effect": "on",
          "legend": true
        },
        {
          "key": "semana-pedagogica",
          "label": "Semana Pedagógica",
          "color": "#55c5d0",
          "effect": "off",
          "legend": true
        },
        {
          "key": "conselho-classe",
          "label": "Conselho de Classe em contraturno",
          "color": "#f172ac",
          "effect": "none",
          "legend": true
        },
        {
          "key": "recesso-alunos",
          "label": "Recesso para alunos",
          "color": "#7dc242",
          "effect": "off",
          "legend": true
        }
      ],
      "marks": [
        {
          "date": "2026-01-01",
          "type": "feriado",
          "label": "Confraternização Universal",
          "fixed": true
        },
        {
          "date": "2026-01-26",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-27",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-28",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-29",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-30",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-02-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Carnaval"
        },
        {
          "date": "2026-02-18",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Sexta-feira Santa"
        },
        {
          "date": "2026-04-11",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-04-17",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-20",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Tiradentes",
          "fixed": true
        },
        {
          "date": "2026-04-22",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-25",
          "type": "recuperacao"
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Dia do Trabalho",
          "fixed": true
        },
        {
          "date": "2026-05-09",
          "type": "recuperacao"
        },
        {
          "date": "2026-05-11",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-12",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-13",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-14",
          "type": "conselho-classe"
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Corpus Christi"
        },
        {
          "date": "2026-06-05",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-06-13",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-07-06",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-07",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-08",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-09",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-10",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-13",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-14",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-15",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-17",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-20",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-21",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-22",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-08-01",
          "type": "recuperacao"
        },
        {
          "date": "2026-08-08",
          "type": "recuperacao"
        },
        {
          "date": "2026-08-10",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-11",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-12",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-13",
          "type": "conselho-classe"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Independência do Brasil",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Nossa Senhora da Luz dos Pinhais",
          "fixed": true
        },
        {
          "date": "2026-09-19",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-10-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-10-05",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-10-10",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Padroeira do Brasil",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado"
        },
        {
          "date": "2026-10-17",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-19",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-20",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-21",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-22",
          "type": "conselho-classe"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Finados",
          "fixed": true
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Consciência Negra",
          "fixed": true
        },
        {
          "date": "2026-11-28",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-12-10",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-12-14",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-15",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-16",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-17",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-18",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-12-21",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "label": "Natal",
          "fixed": true
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-07-20",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-21",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-22",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-12-10",
          "type": "inicio-termino-bimestre"
        }
      ],
      "periods": [
        {
          "label": "1º Bimestre",
          "start": "2026-02-02",
          "end": "2026-04-17"
        },
        {
          "label": "2º Bimestre",
          "start": "2026-04-22",
          "end": "2026-07-03"
        },
        {
          "label": "3º Bimestre",
          "start": "2026-07-23",
          "end": "2026-10-02"
        },
        {
          "label": "4º Bimestre",
          "start": "2026-10-05",
          "end": "2026-12-10"
        }
      ],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-07-03"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-23",
          "end": "2026-12-10"
        }
      ],
      "infoText": "<b>INÍCIO E TÉRMINO DE AULAS:</b> <i>07:20 às 12:20 (manhã)</i>\n6 aulas de 45 minutos, na segunda, terça e quinta-feira, totalizando 4h30 diárias.\n5 aulas de 50 minutos na quarta e sexta-feira, totalizando 4h10 diárias.\nPara complementação da carga horária do EM , serão ofertadas 3 aulas de 45 minutos segunda e quarta-feira das 13h30 às 15:45",
      "signature": [
        "Hartmut August",
        "Ato nº 03/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  },
  {
    "slug": "erasto-medio-hunters",
    "sector": "colegio-erasto-gaertner",
    "name": "Ensino Médio Hunters",
    "year": 2026,
    "header": "header-erasto-medio-hunters-rgb",
    "logo": "logo-erasto",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026",
      "subtitle": "ENSINO MÉDIO HUNTERS (3º EM)",
      "startMonth": "2026-01",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#007185",
        "accent": "#faa619",
        "header": "#6599aa"
      },
      "display": {
        "legend": true,
        "monthNotes": false,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início e Término das aulas",
          "color": "#e36575",
          "effect": "none",
          "legend": true
        },
        {
          "key": "inicio-termino-bimestre",
          "label": "Início e Término de bimestre",
          "color": "#6d4f4e",
          "effect": "none",
          "legend": true
        },
        {
          "key": "feriado",
          "label": "Feriado",
          "color": "#faa619",
          "effect": "off",
          "legend": true
        },
        {
          "key": "recuperacao",
          "label": "Recuperação",
          "color": "#695da8",
          "effect": "none",
          "legend": true
        },
        {
          "key": "sabado-letivo",
          "label": "Sábado Letivo",
          "color": "#007185",
          "effect": "on",
          "legend": true
        },
        {
          "key": "semana-pedagogica",
          "label": "Semana Pedagógica",
          "color": "#55c5d0",
          "effect": "off",
          "legend": true
        },
        {
          "key": "conselho-classe",
          "label": "Conselho de Classe em contraturno",
          "color": "#f172ac",
          "effect": "none",
          "legend": true
        },
        {
          "key": "recesso-alunos",
          "label": "Recesso para alunos",
          "color": "#7dc242",
          "effect": "off",
          "legend": true
        }
      ],
      "marks": [
        {
          "date": "2026-01-01",
          "type": "feriado",
          "label": "Confraternização Universal",
          "fixed": true
        },
        {
          "date": "2026-01-26",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-27",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-28",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-29",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-01-30",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-02-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Carnaval"
        },
        {
          "date": "2026-02-18",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-03-21",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-03-28",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Sexta-feira Santa"
        },
        {
          "date": "2026-04-17",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-20",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Tiradentes",
          "fixed": true
        },
        {
          "date": "2026-04-22",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-04-25",
          "type": "recuperacao"
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Dia do Trabalho",
          "fixed": true
        },
        {
          "date": "2026-05-09",
          "type": "recuperacao"
        },
        {
          "date": "2026-05-11",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-12",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-13",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-14",
          "type": "conselho-classe"
        },
        {
          "date": "2026-05-23",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-05-30",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Corpus Christi"
        },
        {
          "date": "2026-06-05",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-07-06",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-07",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-08",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-09",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-10",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-13",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-14",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-15",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-16",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-17",
          "type": "recesso-alunos",
          "label": "Recesso"
        },
        {
          "date": "2026-07-20",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-21",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-22",
          "type": "recesso-alunos"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-08-01",
          "type": "recuperacao"
        },
        {
          "date": "2026-08-08",
          "type": "recuperacao"
        },
        {
          "date": "2026-08-10",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-11",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-12",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-13",
          "type": "conselho-classe"
        },
        {
          "date": "2026-08-22",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-08-29",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Independência do Brasil",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Nossa Senhora da Luz dos Pinhais",
          "fixed": true
        },
        {
          "date": "2026-09-19",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-09-26",
          "type": "sabado-letivo"
        },
        {
          "date": "2026-10-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-10-05",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-10-10",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Padroeira do Brasil",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado"
        },
        {
          "date": "2026-10-17",
          "type": "recuperacao"
        },
        {
          "date": "2026-10-19",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-20",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-21",
          "type": "conselho-classe"
        },
        {
          "date": "2026-10-22",
          "type": "conselho-classe"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Finados",
          "fixed": true
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Consciência Negra",
          "fixed": true
        },
        {
          "date": "2026-12-04",
          "type": "inicio-termino-aulas"
        },
        {
          "date": "2026-12-14",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-15",
          "type": "recuperacao"
        },
        {
          "date": "2026-12-16",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-17",
          "type": "conselho-classe"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "label": "Natal",
          "fixed": true
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-07-20",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-21",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-22",
          "type": "semana-pedagogica"
        },
        {
          "date": "2026-07-23",
          "type": "inicio-termino-bimestre"
        },
        {
          "date": "2026-12-04",
          "type": "inicio-termino-bimestre"
        }
      ],
      "periods": [
        {
          "label": "1º Bimestre",
          "start": "2026-02-02",
          "end": "2026-04-17"
        },
        {
          "label": "2º Bimestre",
          "start": "2026-04-22",
          "end": "2026-07-03"
        },
        {
          "label": "3º Bimestre",
          "start": "2026-07-23",
          "end": "2026-10-02"
        },
        {
          "label": "4º Bimestre",
          "start": "2026-10-05",
          "end": "2026-12-11"
        }
      ],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-07-03"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-23",
          "end": "2026-12-04"
        }
      ],
      "infoText": "<b>INÍCIO E TÉRMINO DE AULAS:</b> <i>07:20 às 12:20 (manhã)</i>\n6 aulas de 45 minutos, na segunda, terça e quinta-feira, totalizando 4h30 diárias.\n5 aulas de 50 minutos na quarta e sexta-feira, totalizando 4h10 diárias.\nPara complementação da carga horária do EM, serão ofertadas 4 aulas de 45 minutos na segunda-feira, das 13h30 às 16h30 e 3 aulas de 45 minutos na quarta-feira da 13h30 às 15h45.",
      "signature": [
        "Hartmut August",
        "Ato nº 03/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  },
  {
    "slug": "fidelis-presencial",
    "sector": "faculdade-fidelis",
    "name": "Presencial",
    "year": 2026,
    "header": "header-fidelis-presencial",
    "logo": "logo-fidelis",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026",
      "subtitle": "FACULDADE FIDELIS",
      "startMonth": "2026-01",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#007185",
        "accent": "#faa626",
        "header": "#6599aa",
        "titleColor": "#0a4a7e",
        "discColor": "#0a4a7e"
      },
      "display": {
        "legend": false,
        "monthNotes": true,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início e Término das aulas",
          "color": "#e36575",
          "effect": "none",
          "legend": false
        },
        {
          "key": "feriado",
          "label": "Feriado / Recesso",
          "color": "#faa619",
          "effect": "off",
          "legend": false
        },
        {
          "key": "formacao-pedagogica",
          "label": "Formação Pedagógica",
          "color": "#55c5d0",
          "effect": "none",
          "legend": false
        },
        {
          "key": "semana-avaliativa",
          "label": "Semana Avaliativa",
          "color": "#00aeef",
          "effect": "none",
          "legend": false
        },
        {
          "key": "atividade-academica",
          "label": "Atividade / prazo acadêmico",
          "color": "#748ba1",
          "effect": "none",
          "legend": false
        }
      ],
      "marks": [
        {
          "date": "2026-01-01",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-01-28",
          "type": "formacao-pedagogica",
          "label": "Formação Pedagógica"
        },
        {
          "date": "2026-01-29",
          "type": "formacao-pedagogica",
          "label": "Formação Pedagógica"
        },
        {
          "date": "2026-02-02",
          "type": "inicio-termino-aulas",
          "label": "Inicio das aulas"
        },
        {
          "date": "2026-02-11",
          "type": "atividade-academica",
          "label": "Aula Magna"
        },
        {
          "date": "2026-02-13",
          "type": "atividade-academica",
          "label": "Prazo para solicitação de aproveitamento discente extraordinário"
        },
        {
          "date": "2026-02-16",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-02-18",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-03-06",
          "type": "atividade-academica",
          "label": "Prazo Final para matrícula e ajustes de disciplinas"
        },
        {
          "date": "2026-03-11",
          "type": "atividade-academica",
          "label": "Trote Solidário"
        },
        {
          "date": "2026-04-01",
          "type": "atividade-academica",
          "label": "Culto de Páscoa"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-04-13",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-04-14",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-04-15",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-04-16",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-04-17",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-04-20",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente",
          "fixed": true
        },
        {
          "date": "2026-04-22",
          "type": "atividade-academica",
          "label": "Prazo final para lançamento do P1"
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-06-05",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-06-12",
          "type": "atividade-academica",
          "label": "Mostra Acadêmica"
        },
        {
          "date": "2026-06-18",
          "type": "atividade-academica",
          "label": "Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-06-19",
          "type": "atividade-academica",
          "label": "Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-06-22",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-06-23",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-06-24",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-06-25",
          "type": "atividade-academica",
          "label": "Bancas TCC / Segunda chamada provas presenciais disciplinas EAD"
        },
        {
          "date": "2026-06-26",
          "type": "atividade-academica",
          "label": "Bancas TCC / Segunda chamada provas presenciais disciplinas EAD"
        },
        {
          "date": "2026-06-29",
          "type": "atividade-academica",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-06-30",
          "type": "atividade-academica",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-07-01",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-07-02",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-07-03",
          "type": "inicio-termino-aulas",
          "label": "Término e Início das aulas"
        },
        {
          "date": "2026-07-05",
          "type": "atividade-academica",
          "label": "Prazo Final para lançamento do P2"
        },
        {
          "date": "2026-07-07",
          "type": "atividade-academica",
          "label": "Exame Final"
        },
        {
          "date": "2026-07-08",
          "type": "atividade-academica",
          "label": "Exame Final"
        },
        {
          "date": "2026-07-13",
          "type": "atividade-academica",
          "label": "Prazo para lançamento de Exame Final / Rematrícula"
        },
        {
          "date": "2026-07-14",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-07-15",
          "type": "atividade-academica",
          "label": "Reunião Pedagógica / Rematrícula"
        },
        {
          "date": "2026-07-16",
          "type": "atividade-academica",
          "label": "Reunião Pedagógica / Rematrícula"
        },
        {
          "date": "2026-07-17",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-07-20",
          "type": "inicio-termino-aulas",
          "label": "Término e Início das aulas"
        },
        {
          "date": "2026-07-29",
          "type": "atividade-academica",
          "label": "Aula Magna"
        },
        {
          "date": "2026-08-07",
          "type": "atividade-academica",
          "label": "Prazo Final para solicitação de Aproveitamento discente extraordinário"
        },
        {
          "date": "2026-08-14",
          "type": "atividade-academica",
          "label": "Prazo Final para matrícula e ajustes de disciplinas"
        },
        {
          "date": "2026-08-19",
          "type": "atividade-academica",
          "label": "Trote Solidário"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-09-21",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-09-22",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-09-23",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-09-24",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-09-25",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-09-29",
          "type": "atividade-academica",
          "label": "Prazo Final para lançamento do P1"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado",
          "label": "Feriado"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-11-03",
          "type": "atividade-academica",
          "label": "Semana Acadêmica"
        },
        {
          "date": "2026-11-04",
          "type": "atividade-academica",
          "label": "Semana Acadêmica"
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-11-26",
          "type": "atividade-academica",
          "label": "Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-11-27",
          "type": "atividade-academica",
          "label": "Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-11-30",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-12-01",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-12-02",
          "type": "atividade-academica",
          "label": "Bancas TCC"
        },
        {
          "date": "2026-12-03",
          "type": "atividade-academica",
          "label": "Bancas TCC / Segunda chamada Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-12-04",
          "type": "atividade-academica",
          "label": "Bancas TCC / Segunda chamada Provas Presenciais Disciplinas EAD"
        },
        {
          "date": "2026-12-07",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-08",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-09",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-10",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-11",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-13",
          "type": "atividade-academica",
          "label": "Prazo Final para lançamento do P2"
        },
        {
          "date": "2026-12-14",
          "type": "atividade-academica",
          "label": "Exame Final"
        },
        {
          "date": "2026-12-15",
          "type": "atividade-academica",
          "label": "Exame Final"
        },
        {
          "date": "2026-12-17",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-12-18",
          "type": "atividade-academica",
          "label": "Prazo para lançamento de Exame Final / Rematrícula"
        },
        {
          "date": "2026-12-19",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-12-20",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-12-21",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-12-22",
          "type": "atividade-academica",
          "label": "Rematrícula"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "fixed": true
        },
        {
          "date": "2026-07-03",
          "type": "semana-avaliativa",
          "label": "Semana Avaliativa"
        },
        {
          "date": "2026-12-11",
          "type": "inicio-termino-aulas",
          "label": "Término das aulas"
        }
      ],
      "periods": [],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-02-02",
          "end": "2026-07-03"
        },
        {
          "label": "2º Semestre",
          "start": "2026-07-20",
          "end": "2026-12-11"
        }
      ],
      "infoText": "",
      "signature": [
        "Hartmut August",
        "Ato nº 03/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  },
  {
    "slug": "fidelis-ead",
    "sector": "faculdade-fidelis",
    "name": "EaD",
    "year": 2026,
    "header": "header-fidelis-ead",
    "logo": "logo-fidelis",
    "content": {
      "title": "CALENDÁRIO",
      "yearText": "2026 EAD",
      "subtitle": "FACULDADE FIDELIS - BACHARELADO EM TEOLOGIA À DISTÂNCIA",
      "startMonth": "2026-02",
      "headerImageMediaId": null,
      "logoMediaId": null,
      "theme": {
        "primary": "#006b82",
        "accent": "#f7a600",
        "header": "#6c9db0",
        "titleColor": "#124278",
        "discColor": "#0a4a7e"
      },
      "display": {
        "legend": false,
        "monthNotes": true,
        "schoolDayCounts": true,
        "semesterTotals": true
      },
      "markTypes": [
        {
          "key": "inicio-termino-aulas",
          "label": "Início das aulas / do período",
          "color": "#e25f71",
          "effect": "none",
          "legend": false
        },
        {
          "key": "inicio-final-modulo",
          "label": "Início / Final de módulo",
          "color": "#775551",
          "effect": "none",
          "legend": false
        },
        {
          "key": "feriado",
          "label": "Feriado / Recesso",
          "color": "#f7a600",
          "effect": "off",
          "legend": false
        },
        {
          "key": "sabado-letivo",
          "label": "Sábado letivo / Atividades presenciais",
          "color": "#006b82",
          "effect": "on",
          "legend": false
        },
        {
          "key": "recesso-academico",
          "label": "Recesso Acadêmico",
          "color": "#63c3d1",
          "effect": "off",
          "legend": false
        }
      ],
      "marks": [
        {
          "date": "2026-02-16",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-02-17",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-02-18",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-04-03",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-04-20",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-04-21",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente",
          "fixed": true
        },
        {
          "date": "2026-05-01",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-06-04",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-06-05",
          "type": "feriado",
          "label": "Feriado e Recesso para alunos, permuta para corpo docente"
        },
        {
          "date": "2026-09-07",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-09-08",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-09-09",
          "type": "inicio-termino-aulas",
          "label": "Inicio das aulas"
        },
        {
          "date": "2026-09-12",
          "type": "sabado-letivo",
          "label": "Sábado letivo"
        },
        {
          "date": "2026-09-26",
          "type": "sabado-letivo",
          "label": "Sábado letivo"
        },
        {
          "date": "2026-10-03",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-10-12",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-10-13",
          "type": "feriado",
          "label": "Feriado"
        },
        {
          "date": "2026-10-16",
          "type": "inicio-final-modulo",
          "label": "Início / Final de módulo"
        },
        {
          "date": "2026-10-17",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-10-24",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-10-26",
          "type": "inicio-final-modulo",
          "label": "Início / Final de módulo"
        },
        {
          "date": "2026-11-02",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-11-07",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-11-14",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-11-20",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-11-28",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-12-05",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-12-12",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-12-19",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2026-12-21",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-22",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-23",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-24",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-25",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2026-12-26",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-28",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-29",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-30",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2026-12-31",
          "type": "recesso-academico",
          "label": "Recesso Acadêmico"
        },
        {
          "date": "2027-01-01",
          "type": "feriado",
          "label": "Feriado",
          "fixed": true
        },
        {
          "date": "2027-01-02",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2027-01-09",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2027-01-16",
          "type": "sabado-letivo",
          "label": "Sábados letivos"
        },
        {
          "date": "2027-01-22",
          "type": "sabado-letivo",
          "label": "Atividades presenciais"
        },
        {
          "date": "2027-01-23",
          "type": "sabado-letivo",
          "label": "Atividades presenciais / Sábados letivos"
        },
        {
          "date": "2027-01-25",
          "type": "inicio-termino-aulas",
          "label": "Início do período (semestre)"
        },
        {
          "date": "2027-01-25",
          "type": "inicio-final-modulo",
          "label": "Início / Final de módulo"
        }
      ],
      "periods": [],
      "semesters": [
        {
          "label": "1º Semestre",
          "start": "2026-09-09",
          "end": "2027-01-24"
        }
      ],
      "infoText": "",
      "signature": [
        "Hartmut August",
        "Ato nº 04/2020",
        "Diretor"
      ],
      "noteOverrides": {}
    }
  }
];
