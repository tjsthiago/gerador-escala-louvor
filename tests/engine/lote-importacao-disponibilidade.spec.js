// Importação de disponibilidade em Lote (ver CONTEXT.md — "Lote de Cultos" —
// e ADR-0006/0007/0008). Cobre o parsing do CSV do Google Forms, o cálculo
// dos domingos do mês pelo calendário, o matching de nome formulário↔cadastro
// e a montagem do Lote completo.
const { test, expect } = require("@playwright/test");
const {
  analisarCsvDisponibilidade,
  domingosDoMes,
  casarNomeFormularioComIntegrante,
  construirLoteDeCultos,
} = require("../support/lote");
const { posicoes } = require("../support/catalogo");

const CABECALHO_CSV = "Carimbo de data/hora,Qual o seu nome?,Em quais domingos você NÃO pode?,Alguma observação? (opcional)";

test.describe("análise do CSV de disponibilidade", () => {
  test("extrai nome e datas de um campo entre aspas com múltiplos domingos", async ({ page }) => {
    const csv = [
      CABECALHO_CSV,
      '27/07/2026 08:01:44,Pedro Gottems,"1º domingo — 02/08, 2º domingo — 09/08, 3º domingo — 16/08",',
    ].join("\n");

    const respostas = await analisarCsvDisponibilidade(page, csv, 2026);

    expect(respostas).toEqual([
      { nomeFormulario: "Pedro Gottems", domingosIndisponiveis: ["2026-08-02", "2026-08-09", "2026-08-16"] },
    ]);
  });

  test("é robusto a inconsistências reais do formulário (° vs º, hífen vs travessão, sem aspas)", async ({ page }) => {
    const csv = [
      CABECALHO_CSV,
      "27/07/2026 09:54:45,Daniel Vilela,1º domingo — 02/08,Estarei em Contenda no primeiro domingo",
      '28/07/2026 08:04:34,Emanuelle Rosa,"1º domingo — 02/08, 5° domingo- 30/08",',
    ].join("\n");

    const respostas = await analisarCsvDisponibilidade(page, csv, 2026);

    expect(respostas).toEqual([
      { nomeFormulario: "Daniel Vilela", domingosIndisponiveis: ["2026-08-02"] },
      { nomeFormulario: "Emanuelle Rosa", domingosIndisponiveis: ["2026-08-02", "2026-08-30"] },
    ]);
  });

  test("resposta sem nenhum domingo marcado (campo vazio) produz lista vazia, não erro", async ({ page }) => {
    const csv = [CABECALHO_CSV, "27/07/2026 10:00:00,André Ferreira,,"].join("\n");

    const respostas = await analisarCsvDisponibilidade(page, csv, 2026);

    expect(respostas).toEqual([{ nomeFormulario: "André Ferreira", domingosIndisponiveis: [] }]);
  });
});

test.describe("domingos do mês (calendário, não o CSV)", () => {
  test("agosto/2026 tem exatamente 5 domingos", async ({ page }) => {
    const domingos = await domingosDoMes(page, 2026, 7); // mesIndex 0-based: 7 = agosto

    expect(domingos).toEqual(["2026-08-02", "2026-08-09", "2026-08-16", "2026-08-23", "2026-08-30"]);
  });

  test("fevereiro/2026 (mês curto) tem 4 domingos", async ({ page }) => {
    const domingos = await domingosDoMes(page, 2026, 1);

    expect(domingos).toEqual(["2026-02-01", "2026-02-08", "2026-02-15", "2026-02-22"]);
  });
});

test.describe("matching de nome do formulário com o cadastro", () => {
  const CADASTRO = [
    { nome: "Pedro", habilidades: ["Melodia"] },
    { nome: "Matheus Arnoni", habilidades: ["Melodia"] },
    { nome: "Matheus Muzel", habilidades: ["Bateria"] },
  ];

  test("nome completo do formulário cai para o primeiro nome quando não há colisão", async ({ page }) => {
    const resultado = await casarNomeFormularioComIntegrante(page, "Pedro Gottems", CADASTRO);
    expect(resultado).toEqual({ integranteNome: "Pedro", ambiguo: false });
  });

  test("nome completo do formulário bate exato com um cadastro que guarda sobrenome por colisão", async ({ page }) => {
    const resultado = await casarNomeFormularioComIntegrante(page, "Matheus Muzel", CADASTRO);
    expect(resultado).toEqual({ integranteNome: "Matheus Muzel", ambiguo: false });
  });

  test("primeiro nome ambíguo (bate com mais de um integrante) não escolhe nenhum, sinaliza ambiguidade", async ({ page }) => {
    const resultado = await casarNomeFormularioComIntegrante(page, "Matheus Silva", CADASTRO);
    expect(resultado).toEqual({ integranteNome: null, ambiguo: true });
  });

  test("nome sem nenhuma correspondência no cadastro", async ({ page }) => {
    const resultado = await casarNomeFormularioComIntegrante(page, "Fulano Desconhecido", CADASTRO);
    expect(resultado).toEqual({ integranteNome: null, ambiguo: false });
  });
});

test.describe("construção do Lote de Cultos", () => {
  const CADASTRO = [
    { nome: "Pedro", habilidades: ["Melodia"] },
    { nome: "Emanuelle", habilidades: ["Contralto"] },
  ];
  const CATALOGO = posicoes("Melodia", "Contralto");

  test("gera um Culto por domingo do mês, com Disponibilidade derivada do CSV e aviso para nome não reconhecido", async ({ page }) => {
    const csv = [
      CABECALHO_CSV,
      '27/07/2026 08:01:44,Pedro Gottems,"1º domingo — 02/08",',
      "27/07/2026 09:00:00,Fulano Desconhecido,1º domingo — 02/08,",
    ].join("\n");

    const lote = await construirLoteDeCultos(page, {
      ano: 2026,
      mesIndex: 7,
      textoCsv: csv,
      integrantesCadastro: CADASTRO,
      catalogoPosicoes: CATALOGO,
    });

    expect(lote.cultos.map((c) => c.data)).toEqual([
      "2026-08-02", "2026-08-09", "2026-08-16", "2026-08-23", "2026-08-30",
    ]);
    expect(lote.avisos).toHaveLength(1);
    expect(lote.avisos[0]).toContain("Fulano Desconhecido");

    const primeiroDomingo = lote.cultos.find((c) => c.data === "2026-08-02");
    expect(primeiroDomingo.integrantes.find((i) => i.nome === "Pedro").disponivel).toBe(false);
    // Emanuelle não respondeu ao formulário — disponível o mês todo (ver CONTEXT.md).
    expect(primeiroDomingo.integrantes.find((i) => i.nome === "Emanuelle").disponivel).toBe(true);

    const segundoDomingo = lote.cultos.find((c) => c.data === "2026-08-09");
    expect(segundoDomingo.integrantes.find((i) => i.nome === "Pedro").disponivel).toBe(true);

    // Catálogo completo por padrão em todos os domingos do lote (ADR-0007).
    for (const culto of lote.cultos) {
      expect(culto.posicoesSelecionadas.sort()).toEqual(["Contralto", "Melodia"]);
      expect(culto.papeisEspeciais).toEqual({ abertura: "", conducaoDoCulto: "", encerramento: "" });
    }
  });
});
