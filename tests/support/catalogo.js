// Espelha CATALOGO_POSICOES de index.html e a tabela §7.1 do documento de regras.
// Mantido separado (não importado do app) porque o app não expõe suas const's em
// `window` — só suas `function`s de nível superior. Ver tests/support/motor.js.
const CATALOGO_POSICOES = [
  { nome: "Melodia", categoria: "Vocal", prioridade: 1, conducao: false },
  { nome: "Contralto", categoria: "Vocal", prioridade: 2, conducao: false },
  { nome: "Baixo", categoria: "Vocal", prioridade: 2, conducao: false },
  { nome: "Teclado", categoria: "Instrumental", prioridade: 1, conducao: true },
  { nome: "Violão", categoria: "Instrumental", prioridade: 1, conducao: true },
  { nome: "Piano", categoria: "Instrumental", prioridade: 2, conducao: true },
  { nome: "Bateria", categoria: "Instrumental", prioridade: 2, conducao: true },
  { nome: "Contra baixo", categoria: "Instrumental", prioridade: 2, conducao: false },
  { nome: "Flauta", categoria: "Instrumental", prioridade: 2, conducao: false },
  { nome: "Guitarra", categoria: "Instrumental", prioridade: 2, conducao: false },
];

function posicao(nome) {
  const p = CATALOGO_POSICOES.find((p) => p.nome === nome);
  if (!p) throw new Error(`Posição desconhecida no catálogo de teste: ${nome}`);
  return p;
}

function posicoes(...nomes) {
  return nomes.map(posicao);
}

function integrante(nome, habilidades) {
  return { nome, habilidades };
}

module.exports = { CATALOGO_POSICOES, posicao, posicoes, integrante };
