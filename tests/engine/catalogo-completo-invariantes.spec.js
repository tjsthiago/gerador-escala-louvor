// Teste de integração com o catálogo real (§7.1) e o elenco real de
// index.html, checando os invariantes que valem para QUALQUER combinação
// (Regra 2, Regra 6, métricas de sucesso do §8) — não substitui os testes
// unitários por regra, serve para pegar regressões que só aparecem com o
// catálogo completo.
const { test, expect } = require("@playwright/test");
const { gerarEscala, posicoesDe } = require("../support/motor");
const { CATALOGO_POSICOES } = require("../support/catalogo");

// Espelha INTEGRANTES_INICIAIS de index.html.
const ELENCO_REAL = [
  { nome: "André", habilidades: ["Contra baixo", "Violão"] },
  { nome: "Cássia", habilidades: ["Contralto"] },
  { nome: "Cristiane", habilidades: ["Melodia"] },
  { nome: "Daiane", habilidades: ["Melodia"] },
  { nome: "Dani Eduardo", habilidades: ["Contralto", "Bateria"] },
  { nome: "Daniel", habilidades: ["Tenor", "Teclado"] },
  { nome: "Débora", habilidades: ["Melodia"] },
  { nome: "Edivaldo", habilidades: ["Tenor"] },
  { nome: "Eliú", habilidades: ["Contra baixo", "Violão"] },
  { nome: "Gabriel", habilidades: ["Guitarra", "Violão"] },
  { nome: "Jonatas", habilidades: ["Bateria"] },
  { nome: "Leandro", habilidades: ["Bateria", "Contra baixo"] },
  { nome: "Lucas", habilidades: ["Tenor"] },
  { nome: "Manu", habilidades: ["Contralto"] },
  { nome: "Marlon", habilidades: ["Bateria"] },
  { nome: "Mateus Muzel", habilidades: ["Bateria", "Contra baixo", "Violão"] },
  { nome: "Matheus Arnoni", habilidades: ["Melodia", "Contralto", "Bateria"] },
  { nome: "Milene", habilidades: ["Melodia"] },
  { nome: "Miriã", habilidades: ["Flauta", "Piano"] },
  { nome: "Nicole", habilidades: ["Contralto"] },
  { nome: "Pedro", habilidades: ["Melodia"] },
  { nome: "Rafa", habilidades: ["Melodia"] },
  { nome: "Thiago", habilidades: ["Guitarra"] },
];

test("com o elenco e catálogo completos, nenhum integrante acumula duas posições da mesma categoria", async ({ page }) => {
  const resultado = await gerarEscala(page, ELENCO_REAL, CATALOGO_POSICOES);

  for (const integrante of ELENCO_REAL) {
    const categorias = resultado.linhas
      .filter((l) => l.integrante === integrante.nome)
      .map((l) => l.posicao.categoria);
    expect(new Set(categorias).size).toBe(categorias.length);
  }
});

test("com o elenco e catálogo completos, todas as 10 posições aparecem no resultado (nenhuma some silenciosamente)", async ({ page }) => {
  const resultado = await gerarEscala(page, ELENCO_REAL, CATALOGO_POSICOES);
  expect(resultado.linhas).toHaveLength(10);
  expect(resultado.linhas.map((l) => l.posicao.nome).sort()).toEqual(
    [...CATALOGO_POSICOES.map((p) => p.nome)].sort()
  );
});

test("Daniel (único apto para Teclado) e Miriã (única apta para Piano) fecham suas posições de condução", async ({ page }) => {
  const resultado = await gerarEscala(page, ELENCO_REAL, CATALOGO_POSICOES);
  expect(posicoesDe(resultado, "Daniel")).toContain("Teclado");
  expect(posicoesDe(resultado, "Miriã")).toContain("Piano");
});

test("com o elenco completo, todas as posições de condução são preenchidas (§8 — 100% de condução)", async ({ page }) => {
  const resultado = await gerarEscala(page, ELENCO_REAL, CATALOGO_POSICOES);
  const vagasConducao = resultado.vagas.filter((v) => v.conducao);
  expect(vagasConducao).toEqual([]);
});
