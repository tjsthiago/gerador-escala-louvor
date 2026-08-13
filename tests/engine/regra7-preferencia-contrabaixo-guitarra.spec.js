// Regra 7 (+ ADR-0005) — quando alguém é escalado em Guitarra, o integrante
// escalado em Violão que também tem habilidade Contra baixo é movido para o
// Contra baixo (se vago), mesmo tendo prioridade sobre a Regra 3.1 (integrante
// único) e sem cascata de substituição para o Violão.
const { test, expect } = require("@playwright/test");
const { gerarEscala, integranteDe, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("guitarrista escalado move o violonista (único apto) para o Contra baixo; Violão fica vaga — sobrepõe a Regra 3.1", async ({ page }) => {
  const leo = integrante("Léo", ["Violão", "Contra baixo"]);
  const gui = integrante("Gui", ["Guitarra"]);
  const resultado = await gerarEscala(page, [leo, gui], posicoes("Violão", "Contra baixo", "Guitarra"));

  expect(integranteDe(resultado, "Guitarra")).toBe("Gui");
  expect(integranteDe(resultado, "Contra baixo")).toBe("Léo");
  expect(estaVaga(resultado, "Violão")).toBe(true);

  const vagaViolao = resultado.vagas.find((v) => v.posicao === "Violão");
  expect(vagaViolao).toMatchObject({ conducao: true });
});

test("sem ninguém escalado em Guitarra (posição não selecionada no culto), o violonista permanece no Violão", async ({ page }) => {
  const leo = integrante("Léo", ["Violão", "Contra baixo"]);
  const resultado = await gerarEscala(page, [leo], posicoes("Violão", "Contra baixo"));

  expect(integranteDe(resultado, "Violão")).toBe("Léo");
  expect(estaVaga(resultado, "Contra baixo")).toBe(true);
});

test("sem Contra baixo selecionado no culto, não há para onde mover — violonista permanece no Violão", async ({ page }) => {
  const leo = integrante("Léo", ["Violão", "Contra baixo"]);
  const gui = integrante("Gui", ["Guitarra"]);
  const resultado = await gerarEscala(page, [leo, gui], posicoes("Violão", "Guitarra"));

  expect(integranteDe(resultado, "Violão")).toBe("Léo");
  expect(integranteDe(resultado, "Guitarra")).toBe("Gui");
});

test("Contra baixo já ocupado por outra pessoa: regra não se aplica, ninguém é deslocado", async ({ page }) => {
  const leo = integrante("Léo", ["Violão", "Contra baixo"]);
  const marta = integrante("Marta", ["Contra baixo"]);
  const gui = integrante("Gui", ["Guitarra"]);
  const resultado = await gerarEscala(page, [leo, marta, gui], posicoes("Violão", "Contra baixo", "Guitarra"));

  // Léo já ocupa Instrumental via Violão (Regra 2), então Marta cobre o Contra baixo normalmente.
  expect(integranteDe(resultado, "Violão")).toBe("Léo");
  expect(integranteDe(resultado, "Contra baixo")).toBe("Marta");
  expect(integranteDe(resultado, "Guitarra")).toBe("Gui");
});

test("violonista sem habilidade Contra baixo não é afetado pela regra", async ({ page }) => {
  const rafael = integrante("Rafael", ["Violão"]);
  const gui = integrante("Gui", ["Guitarra"]);
  const resultado = await gerarEscala(page, [rafael, gui], posicoes("Violão", "Contra baixo", "Guitarra"));

  expect(integranteDe(resultado, "Violão")).toBe("Rafael");
  expect(integranteDe(resultado, "Guitarra")).toBe("Gui");
  expect(estaVaga(resultado, "Contra baixo")).toBe(true);
});
