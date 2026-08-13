// Chama o motor de regras real (definido em index.html) dentro do navegador.
// `gerarEscala` e as funções que ela usa são `function` de nível superior de um
// <script> clássico (sem type="module"), então o próprio navegador as expõe em
// `window`. Isso permite testar a lógica de negócio com fixtures exatos do
// documento de regras, sem depender do elenco fixo de integrantes/posições da
// tela nem da interação via checkboxes.
async function gerarEscala(page, integrantesDisponiveis, posicoesAbertas) {
  await page.goto("/");
  return page.evaluate(
    ([integrantes, posicoes]) => window.gerarEscala(integrantes, posicoes),
    [integrantesDisponiveis, posicoesAbertas]
  );
}

// Helpers de asserção sobre o formato { linhas, vagas } devolvido por gerarEscala.
function integranteDe(resultado, nomePosicao) {
  const linha = resultado.linhas.find((l) => l.posicao.nome === nomePosicao);
  if (!linha) throw new Error(`Posição "${nomePosicao}" não está no resultado.`);
  return linha.integrante;
}

function estaVaga(resultado, nomePosicao) {
  return integranteDe(resultado, nomePosicao) === null;
}

function posicoesDe(resultado, nomeIntegrante) {
  return resultado.linhas.filter((l) => l.integrante === nomeIntegrante).map((l) => l.posicao.nome);
}

module.exports = { gerarEscala, integranteDe, estaVaga, posicoesDe };
