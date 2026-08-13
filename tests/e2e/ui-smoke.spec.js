// Testes E2E "de verdade": interagem com os checkboxes e o botão reais da
// tela, e leem o DOM renderizado — cobrem a integração motor + UI que os
// testes de motor (tests/engine/) não tocam, e o ADR-0001 (catálogo de
// posições fixo, não editável pelo líder por culto).
const { test, expect } = require("@playwright/test");

async function marcarSomente(page, listaId, nomesParaManter) {
  const itens = page.locator(`#${listaId} li`);
  const total = await itens.count();
  for (let i = 0; i < total; i++) {
    const label = itens.nth(i).locator("label");
    const texto = (await label.innerText()).trim();
    const checkbox = label.locator('input[type="checkbox"]');
    const deveFicarMarcado = nomesParaManter.some((nome) => texto.startsWith(nome));
    if ((await checkbox.isChecked()) !== deveFicarMarcado) {
      await checkbox.setChecked(deveFicarMarcado);
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("ADR-0001: painel de posições só permite marcar/desmarcar — sem campos de categoria/prioridade/condução", async ({ page }) => {
  const posicoes = page.locator("#listaPosicoesConfig li");
  await expect(posicoes).toHaveCount(10);

  // Cada linha só tem um checkbox; a única informação extra é a etiqueta
  // "· condução" (somativa, não editável) — nenhum select/input de prioridade.
  for (const nome of ["Teclado", "Violão", "Piano", "Bateria"]) {
    const linha = posicoes.filter({ hasText: nome }).first();
    await expect(linha.locator('input[type="checkbox"]')).toHaveCount(1);
    await expect(linha).toContainText("condução");
  }
  for (const nome of ["Melodia", "Contralto", "Baixo", "Contra baixo", "Flauta", "Guitarra"]) {
    const linha = posicoes.filter({ hasText: nome }).first();
    await expect(linha.locator("select, input:not([type=checkbox])")).toHaveCount(0);
  }
});

test("gera a escala real a partir dos checkboxes: Daniel em Teclado, Miriã em Piano, Cássia em Melodia", async ({ page }) => {
  await marcarSomente(page, "listaIntegrantesConfig", ["Daniel", "Miriã", "Cássia"]);
  await marcarSomente(page, "listaPosicoesConfig", ["Teclado", "Piano", "Melodia"]);

  await page.getByRole("button", { name: "Gerar escala" }).click();

  const linhas = page.locator("#listaEscala .linha-escala");
  await expect(linhas).toHaveCount(3);
  await expect(linhas.filter({ hasText: "Teclado" })).toContainText("Daniel");
  await expect(linhas.filter({ hasText: "Piano" })).toContainText("Miriã");
  await expect(linhas.filter({ hasText: "Melodia" })).toContainText("Cássia");
});

test("vaga de condução sem candidato: mostra aviso e estiliza a linha como vaga-conducao", async ({ page }) => {
  await marcarSomente(page, "listaIntegrantesConfig", []); // ninguém disponível
  await marcarSomente(page, "listaPosicoesConfig", ["Bateria"]);

  await page.getByRole("button", { name: "Gerar escala" }).click();

  const aviso = page.locator("#avisoVagasConducao");
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText("Bateria");

  const linha = page.locator("#listaEscala .linha-escala");
  await expect(linha).toHaveClass(/vaga-conducao/);
  await expect(linha).toContainText("vaga em aberto — condução");
});

test("papéis especiais: selecionar um integrante mostra o badge correspondente", async ({ page }) => {
  const linhaAbertura = page.locator("#listaPapeis .linha-escala").filter({ hasText: "Abertura" });
  await linhaAbertura.locator("select").selectOption("Daniel");

  await expect(linhaAbertura.locator(".badge-abertura")).toHaveText("Abertura");
});

test("cabeçalho: alterar a data do culto atualiza data grande e mês/ano", async ({ page }) => {
  await page.locator("#campoDataCulto").fill("2026-08-16");

  await expect(page.locator("#dataGrandeExibicao")).toHaveText("16/08");
  await expect(page.locator("#subtituloMesAno")).toHaveText("AGOSTO · 2026");
});
