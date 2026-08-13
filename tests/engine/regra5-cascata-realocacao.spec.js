// Regra 5 (+ ADR-0003) — ao realocar alguém para condução, a vaga que ele deixa
// é reavaliada imediatamente, encadeando quantos deslocamentos forem necessários.
const { test, expect } = require("@playwright/test");
const { gerarEscala, integranteDe, estaVaga } = require("../support/motor");
const { posicoes, integrante } = require("../support/catalogo");

test("§7 linha 4 — único apto para condução é realocado; vaga de não-condução é preenchida por outro apto", async ({ page }) => {
  const leo = integrante("Léo", ["Contra baixo", "Bateria"]); // único apto para Bateria
  const marta = integrante("Marta", ["Contra baixo"]); // cobre a vaga deixada
  const resultado = await gerarEscala(page, [leo, marta], posicoes("Bateria", "Contra baixo"));

  expect(integranteDe(resultado, "Bateria")).toBe("Léo");
  expect(integranteDe(resultado, "Contra baixo")).toBe("Marta");
});

test("§7 linha 4 — sem substituto disponível, a vaga de não-condução fica em aberto (informativa)", async ({ page }) => {
  const leo = integrante("Léo", ["Contra baixo", "Bateria"]);
  const resultado = await gerarEscala(page, [leo], posicoes("Bateria", "Contra baixo"));

  expect(integranteDe(resultado, "Bateria")).toBe("Léo");
  expect(estaVaga(resultado, "Contra baixo")).toBe(true);
  expect(resultado.vagas.find((v) => v.posicao === "Contra baixo")).toMatchObject({ conducao: false });
});

test("§7 linha 5 — único apto para Teclado e Piano só cobre o de maior prioridade; o outro fica vaga de condução", async ({ page }) => {
  const uni = integrante("Uni", ["Teclado", "Piano"]);
  const resultado = await gerarEscala(page, [uni], posicoes("Teclado", "Piano"));

  // Teclado (prioridade 1) resolvido antes de Piano (prioridade 2) — Regra 1.
  expect(integranteDe(resultado, "Teclado")).toBe("Uni");
  expect(estaVaga(resultado, "Piano")).toBe(true);
  expect(resultado.vagas.find((v) => v.posicao === "Piano")).toMatchObject({ conducao: true });
});

test("primitiva conducaoAbertaUnicaPara (Regra 3.1) — identifica a posição de condução em aberto de maior prioridade para a qual o candidato é único", async ({ page }) => {
  // Testa a função isolada (window.conducaoAbertaUnicaPara), que é o motor da
  // Regra 3.1/Regra 5: dado um candidato, as posições de condução ainda abertas e
  // quem mais está disponível, deve devolver a vaga que só ele pode cobrir.
  await page.goto("/");

  const candidato = integrante("Léo", ["Bateria"]);
  const posicoesConducao = posicoes("Teclado", "Bateria");
  const estadoAbertoParaAmbas = [
    ["Teclado", null],
    ["Bateria", null],
  ];

  const resultadoUnico = await page.evaluate(
    ([candidato, posicoesConducao, estadoEntries]) =>
      window.conducaoAbertaUnicaPara(candidato, posicoesConducao, new Map(estadoEntries), [candidato], []),
    [candidato, posicoesConducao, estadoAbertoParaAmbas]
  );
  expect(resultadoUnico).toMatchObject({ nome: "Bateria" });

  // Se outro integrante disponível também é apto, o candidato deixa de ser único.
  const outroApto = integrante("Marlon", ["Bateria"]);
  const resultadoComOutro = await page.evaluate(
    ([candidato, posicoesConducao, estadoEntries, outroApto]) =>
      window.conducaoAbertaUnicaPara(candidato, posicoesConducao, new Map(estadoEntries), [candidato, outroApto], []),
    [candidato, posicoesConducao, estadoAbertoParaAmbas, outroApto]
  );
  expect(resultadoComOutro).toBeNull();

  // Se o próprio candidato já ocupa uma posição Instrumental, ele não é reaproveitado.
  const jaOcupado = [{ integrante: "Léo", posicao: "Outra", categoria: "Instrumental" }];
  const resultadoJaOcupado = await page.evaluate(
    ([candidato, posicoesConducao, estadoEntries, jaOcupado]) =>
      window.conducaoAbertaUnicaPara(candidato, posicoesConducao, new Map(estadoEntries), [candidato], jaOcupado),
    [candidato, posicoesConducao, estadoAbertoParaAmbas, jaOcupado]
  );
  expect(resultadoJaOcupado).toBeNull();
});
