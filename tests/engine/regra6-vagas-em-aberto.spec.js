// Regra 6 — nenhuma posição some silenciosamente: sem candidato apto, ela
// aparece nas linhas (integrante: null) e é listada em `vagas`, distinguindo
// severidade condução vs. não-condução/vocal.
const { test, expect } = require("@playwright/test");
const { gerarEscala, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("posição de condução sem candidato apto é sinalizada com severidade maior", async ({ page }) => {
  const alguem = integrante("Alguem", ["Flauta"]); // não apto para Bateria
  const resultado = await gerarEscala(page, [alguem], posicoes("Bateria"));

  expect(estaVaga(resultado, "Bateria")).toBe(true);
  expect(resultado.vagas).toEqual([{ posicao: "Bateria", categoria: "Instrumental", conducao: true }]);
  expect(resultado.linhas.find((l) => l.posicao.nome === "Bateria")).toMatchObject({ integrante: null });
});

test("posição não-condução sem candidato apto é sinalizada como informativa", async ({ page }) => {
  const alguem = integrante("Alguem", ["Bateria"]); // não apto para Guitarra
  const resultado = await gerarEscala(page, [alguem], posicoes("Guitarra"));

  expect(estaVaga(resultado, "Guitarra")).toBe(true);
  expect(resultado.vagas).toEqual([{ posicao: "Guitarra", categoria: "Instrumental", conducao: false }]);
});

test("nenhum integrante disponível: todas as posições abertas aparecem como vaga", async ({ page }) => {
  const resultado = await gerarEscala(page, [], posicoes("Teclado", "Melodia"));

  expect(resultado.linhas).toHaveLength(2);
  expect(resultado.vagas.map((v) => v.posicao).sort()).toEqual(["Melodia", "Teclado"]);
});
