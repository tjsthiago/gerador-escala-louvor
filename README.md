# Gerador de Escala do Grupo de Louvor

Ferramenta que, a partir das habilidades dos integrantes e das posições a serem preenchidas num culto, monta automaticamente a escala semanal aplicando os critérios de priorização definidos em [`docs/regras-preeenchimento-escala-grupo-louvor.md`](docs/regras-preeenchimento-escala-grupo-louvor.md).

O projeto inteiro vive em um único arquivo — [`index.html`](index.html) — sem build, sem dependências externas e sem servidor: basta abrir o arquivo direto no navegador.

## Motivações

Hoje a escala semanal é montada manualmente pelo líder, cruzando duas informações mantidas em planilha: as **habilidades** de cada integrante (quais instrumentos ou vocal cada pessoa sabe tocar/cantar) e as **posições** que precisam ser fechadas naquele culto (categoria, prioridade e se é instrumento de condução).

Esse processo manual tem problemas conhecidos:

- **Inconsistência**: decisões diferentes (humanas ou automatizadas) chegam a escalas diferentes para o mesmo conjunto de pessoas disponíveis — algumas piores que outras em relação ao objetivo de priorizar instrumentos de condução.
- **Risco de vaga de condução vazia**: um integrante com habilidade única para uma posição de condução (ex.: único que toca Teclado) podia ser alocado em Vocal antes de sua posição de condução ser avaliada, deixando-a sem ninguém.
- **Falta de critério de desempate**: quando mais de um candidato disputa a mesma vaga, ou um candidato serve para mais de uma vaga, não havia regra objetiva para decidir.
- **Distribuição via WhatsApp/e-mail**: a ferramenta precisa ser enviada diretamente aos membros do grupo e simplesmente aberta — sem hospedagem, sem instalação, sem servidor.

O objetivo é que qualquer pessoa (ou sistema) que monte a escala aplique o mesmo critério de priorização, de forma consistente, repetível e auditável — com o objetivo declarado de **fechar o máximo possível de posições de instrumentos de condução**.

Documentação de apoio:

- [`CONTEXT.md`](CONTEXT.md) — glossário / linguagem ubíqua do domínio (Integrante, Posição, Culto, Habilidade, Disponibilidade, Escala, Lote de Cultos etc.).
- [`docs/adr/`](docs/adr/) — decisões de arquitetura registradas (ADRs).
- [`AGENTS.md`](AGENTS.md) — instruções para quem for alterar o código (humano ou IA).

## Regras de negócio

A especificação normativa completa está em [`docs/regras-preeenchimento-escala-grupo-louvor.md`](docs/regras-preeenchimento-escala-grupo-louvor.md). Resumo das regras do motor de alocação:

1. **Prioridade geral** — posições de instrumento de condução são resolvidas antes de qualquer posição não-condução ou vocal, independentemente da prioridade destas últimas. Dentro de cada grupo, resolve-se por prioridade crescente; empates de prioridade são desempatados por ordem alfabética do nome da posição (**Regra 1.1**).
2. **Acúmulo de funções** — um integrante pode ser escalado em no máximo **1 posição Vocal + 1 posição Instrumental** no mesmo culto — nunca duas da mesma categoria (fisicamente impossível tocar dois instrumentos, ou cantar duas partes vocais, ao mesmo tempo).
3. **Elegibilidade para condução (Vocal incluído)** — um integrante com habilidade para uma posição de condução em aberto é avaliado para ela mesmo que já esteja (ou venha a ser) escalado no Vocal.
   - **3.1 Proteção de integrante único** — antes de confirmar alguém numa posição não-condução (incluindo Vocal), verifica-se se ele é o único apto para alguma posição de condução ainda em aberto; se for, a condução tem prioridade.
4. **Critério de desempate**, nesta ordem: prioridade da posição → menor número de posições alternativas em aberto no mesmo grupo de resolução → ainda não escalado no culto → ordem alfabética.
5. **Efeito cascata da realocação** — ao mover alguém para condução (Regra 3.1), a vaga que ele deixou é reavaliada imediatamente, podendo disparar novas realocações em cadeia, até que nenhuma realocação adicional aumente o número de posições de condução preenchidas.
6. **Vaga em aberto** — posição sem candidato apto é sempre exibida, nunca omitida, distinguindo severidade: condução (alta) vs. não-condução/vocal (informativa).
7. **Preferência de Contra baixo sobre Violão quando há guitarrista** — se alguém foi escalado em Guitarra, quem está no Violão e também tem habilidade Contra baixo é movido para o Contra baixo (se vago), mesmo sendo único apto para Violão. Exceção deliberada às Regras 1/3.1, específica a esse trio; o Violão fica vago, sem cascata de substituição.

Outros conceitos-chave (ver [`CONTEXT.md`](CONTEXT.md) para definições completas):

- **Disponibilidade** é coletada por Culto em forma negativa (o integrante informa em quais cultos **não pode**); quem não responde é considerado disponível.
- **Lote de Cultos** agrupa todos os cultos de um mês a partir de um único upload do CSV do formulário de Disponibilidade; os domingos do lote vêm sempre do calendário do mês escolhido, nunca das datas do CSV. Só o lote mais recente é mantido (`localStorage`, local ao navegador).
- Papéis litúrgicos (Abertura, Condução do culto, Encerramento) são sempre definidos manualmente por culto e ficam fora do escopo do motor de alocação.

Os cenários de exceção e o catálogo de referência usados como casos de teste estão na seção 7 do documento de regras.

## Como executar localmente

Pré-requisito: [Node.js](https://nodejs.org/) (para instalar as dependências de teste) — o app em si não precisa de Node para rodar.

```bash
npm install
```

O jeito mais simples de usar a ferramenta é abrir [`index.html`](index.html) direto no navegador (duplo clique, ou `file://` na barra de endereço) — é assim que ela é distribuída aos membros do grupo, sem servidor.

Para rodar via servidor local (mesmo modo usado pelos testes):

```bash
npx http-server -p 4173 -c-1 .
```

E acesse `http://127.0.0.1:4173`.

## Como rodar os testes com Playwright

Os testes usam [Playwright](https://playwright.dev/) e sobem automaticamente um servidor local (`http-server` na porta `4173`) apontando para a raiz do repositório — não é preciso iniciar nada manualmente antes de rodar.

Instale as dependências (inclui os browsers do Playwright na primeira vez):

```bash
npm install
npx playwright install chromium
```

Rodar toda a suíte (motor de regras + E2E):

```bash
npm test
```

Rodar com a UI interativa do Playwright (útil para depurar um teste específico):

```bash
npm run test:ui
```

Rodar com o browser visível (headed):

```bash
npm run test:headed
```

Os testes ficam organizados em:

- [`tests/engine/`](tests/engine/) — testes do motor de alocação puro, um arquivo por regra de negócio (ex.: `regra5-cascata-realocacao.spec.js`, `regra7-preferencia-contrabaixo-guitarra.spec.js`).
- [`tests/e2e/`](tests/e2e/) — testes de ponta a ponta que interagem com a UI real no navegador.
- [`tests/support/`](tests/support/) — helpers e fixtures compartilhados (catálogo de posições, lote de cultos, motor).
