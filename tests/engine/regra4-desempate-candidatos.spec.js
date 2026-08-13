// Regra 4 — critério de desempate entre candidatos: (1) prioridade da posição,
// (2) escassez de habilidade dentro do grupo corrente (ver ADR-0002 — a contagem
// nunca atravessa o grupo condução ↔ não-condução/vocal, pois cada grupo é
// resolvido com sua própria lista de "posições restantes"), (3) já escalado vs.
// livre, (4) ordem alfabética.
const { test, expect } = require("@playwright/test");
const { gerarEscala, integranteDe } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("critério 2 — escassez: candidato com menos alternativas vence a posição mais disputada", async ({ page }) => {
  const bea = integrante("Bea", ["Contra baixo"]); // só serve para Contra baixo
  const gui = integrante("Gui", ["Contra baixo", "Flauta"]); // serve para as duas
  // Contra baixo (C) é processada antes de Flauta (F) — Regra 1.1.
  const resultado = await gerarEscala(page, [bea, gui], posicoes("Contra baixo", "Flauta"));

  expect(integranteDe(resultado, "Contra baixo")).toBe("Bea");
  expect(integranteDe(resultado, "Flauta")).toBe("Gui");
});

test("critério 3 e 4 — empate em escassez: prioriza quem ainda não foi escalado, depois ordem alfabética", async ({ page }) => {
  const ana = integrante("Ana", ["Melodia", "Contralto"]);
  const beto = integrante("Beto", ["Melodia", "Contralto"]);
  const resultado = await gerarEscala(page, [ana, beto], posicoes("Melodia", "Contralto"));

  // Melodia (prioridade 1) primeiro: Ana e Beto empatam em escassez (1 alternativa
  // cada — Contralto) e em "já escalado" (nenhum ainda) → desempate alfabético: Ana.
  expect(integranteDe(resultado, "Melodia")).toBe("Ana");
  // Contralto sobra só para Beto.
  expect(integranteDe(resultado, "Contralto")).toBe("Beto");
});

test("critério 3 explícito: entre dois aptos com mesma escassez, prioriza quem ainda não foi escalado", async ({ page }) => {
  // Eva já garantiu Teclado (condução) antes do grupo vocal ser resolvido;
  // ao competir com Ivo (ainda livre) por Melodia, Ivo deve ganhar.
  const eva = integrante("Eva", ["Melodia", "Teclado"]);
  const ivo = integrante("Ivo", ["Melodia"]);
  const resultado = await gerarEscala(page, [eva, ivo], posicoes("Teclado", "Melodia"));

  expect(integranteDe(resultado, "Teclado")).toBe("Eva");
  expect(integranteDe(resultado, "Melodia")).toBe("Ivo");
});
