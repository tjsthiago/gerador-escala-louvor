// Regra 3 e 3.1 — um integrante com habilidade Vocal + instrumento de condução
// é avaliado para a condução, não apenas para o Vocal; posições de condução são
// sempre resolvidas antes do grupo não-condução/vocal (Regra 1).
const { test, expect } = require("@playwright/test");
const { gerarEscala, integranteDe, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("Miriã (única apta em Piano e Flauta) é escalada em Piano; Flauta fica em aberto", async ({ page }) => {
  // §7, linha 2.
  const miria = integrante("Miriã", ["Piano", "Flauta"]);
  const resultado = await gerarEscala(page, [miria], posicoes("Piano", "Flauta"));

  expect(integranteDe(resultado, "Piano")).toBe("Miriã");
  expect(estaVaga(resultado, "Flauta")).toBe(true);
  expect(resultado.vagas.find((v) => v.posicao === "Flauta")).toMatchObject({ conducao: false });
});

test("integrante com Vocal + único instrumento de condução não é 'gasto' no Vocal", async ({ page }) => {
  // §7, linha 1: Daniel só tem Teclado como habilidade de condução; se ele também
  // tiver Vocal, não deve ser escalado em Melodia às custas de deixar Teclado vago
  // — mesmo havendo outra pessoa apta em Melodia.
  const daniel = integrante("Daniel", ["Melodia", "Teclado"]);
  const outra = integrante("Outra", ["Melodia"]);
  const resultado = await gerarEscala(page, [daniel, outra], posicoes("Teclado", "Melodia"));

  expect(integranteDe(resultado, "Teclado")).toBe("Daniel");
  expect(integranteDe(resultado, "Melodia")).toBe("Outra");
});
