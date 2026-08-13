// Regra 2 — no máximo uma posição Vocal e uma Instrumental por integrante no
// mesmo culto; nunca duas da mesma categoria.
const { test, expect } = require("@playwright/test");
const { gerarEscala, posicoesDe, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("permite acumular 1 Vocal + 1 Instrumental (exemplo válido do documento)", async ({ page }) => {
  const daniel = integrante("Daniel", ["Melodia", "Teclado"]);
  const resultado = await gerarEscala(page, [daniel], posicoes("Teclado", "Melodia"));

  expect(posicoesDe(resultado, "Daniel").sort()).toEqual(["Melodia", "Teclado"]);
});

test("nunca acumula duas posições Instrumentais (mesmo com habilidade nas duas)", async ({ page }) => {
  const marcos = integrante("Marcos", ["Contra baixo", "Flauta"]);
  const resultado = await gerarEscala(page, [marcos], posicoes("Contra baixo", "Flauta"));

  // Contra baixo (C) vem antes de Flauta (F) em ordem alfabética — Regra 1.1.
  expect(posicoesDe(resultado, "Marcos")).toEqual(["Contra baixo"]);
  expect(estaVaga(resultado, "Flauta")).toBe(true);
});

test("nunca acumula duas posições Vocais (mesmo com habilidade nos dois naipes)", async ({ page }) => {
  const lia = integrante("Lia", ["Melodia", "Contralto"]);
  const resultado = await gerarEscala(page, [lia], posicoes("Melodia", "Contralto"));

  // Melodia (prioridade 1) é resolvida antes de Contralto (prioridade 2) — Regra 1.
  expect(posicoesDe(resultado, "Lia")).toEqual(["Melodia"]);
  expect(estaVaga(resultado, "Contralto")).toBe(true);
});
