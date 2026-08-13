// Regra 1.1 — entre posições do mesmo grupo e mesma prioridade, a ordem de
// resolução é alfabética pelo nome da posição.
const { test, expect } = require("@playwright/test");
const { gerarEscala, integranteDe, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("condução: Teclado (T) é resolvido antes de Violão (V) — ambas prioridade 1", async ({ page }) => {
  // §7, linha 3: integrante único apto para dois instrumentos de condução distintos.
  const rafael = integrante("Rafael", ["Teclado", "Violão"]);
  const resultado = await gerarEscala(page, [rafael], posicoes("Teclado", "Violão"));

  expect(integranteDe(resultado, "Teclado")).toBe("Rafael");
  expect(estaVaga(resultado, "Violão")).toBe(true);

  const vagaViolao = resultado.vagas.find((v) => v.posicao === "Violão");
  expect(vagaViolao).toMatchObject({ conducao: true });
});

test("vocal: Contralto (C) é resolvido antes de Tenor (T) — ambas prioridade 2", async ({ page }) => {
  const sara = integrante("Sara", ["Contralto", "Tenor"]);
  const resultado = await gerarEscala(page, [sara], posicoes("Contralto", "Tenor"));

  expect(integranteDe(resultado, "Contralto")).toBe("Sara");
  expect(estaVaga(resultado, "Tenor")).toBe(true);

  const vagaTenor = resultado.vagas.find((v) => v.posicao === "Tenor");
  expect(vagaTenor).toMatchObject({ conducao: false });
});
