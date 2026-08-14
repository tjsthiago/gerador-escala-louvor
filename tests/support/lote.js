// Chama o motor de importação de disponibilidade (Lote) real (definido em
// index.html) dentro do navegador — mesmo princípio de tests/support/motor.js.
async function analisarCsvDisponibilidade(page, textoCsv, ano) {
  await page.goto("/");
  return page.evaluate(
    ([texto, anoParam]) => window.analisarCsvDisponibilidade(texto, anoParam),
    [textoCsv, ano]
  );
}

async function domingosDoMes(page, ano, mesIndex) {
  await page.goto("/");
  return page.evaluate(([anoParam, mesParam]) => window.domingosDoMes(anoParam, mesParam), [ano, mesIndex]);
}

async function casarNomeFormularioComIntegrante(page, nomeFormulario, integrantesCadastro) {
  await page.goto("/");
  return page.evaluate(
    ([nome, integrantes]) => {
      const resultado = window.casarNomeFormularioComIntegrante(nome, integrantes);
      return { integranteNome: resultado.integrante ? resultado.integrante.nome : null, ambiguo: resultado.ambiguo };
    },
    [nomeFormulario, integrantesCadastro]
  );
}

async function construirLoteDeCultos(page, parametros) {
  await page.goto("/");
  return page.evaluate((p) => {
    const lote = window.construirLoteDeCultos(p);
    return { ...lote, cultos: lote.cultos.map((c) => ({ ...c, posicoesSelecionadas: [...c.posicoesSelecionadas] })) };
  }, parametros);
}

module.exports = { analisarCsvDisponibilidade, domingosDoMes, casarNomeFormularioComIntegrante, construirLoteDeCultos };
