# AGENTS.md

Instruções para qualquer agente (humano ou IA) que for trabalhar neste repositório.

## Sobre o projeto

Gerador da escala semanal do grupo de louvor: a partir dos integrantes disponíveis, das habilidades de cada um e das posições a serem preenchidas no culto, monta a escala aplicando as regras de priorização do grupo.

## Regra de arquitetura (obrigatória, não negociável)

O projeto deve ser **um único arquivo**: `index.html`, na raiz do repositório.

- HTML, CSS (`<style>`) e JavaScript (`<script>`) ficam todos dentro desse mesmo arquivo.
- Não criar `styles.css`, `script.js`, `package.json`, bundler/build step, ou qualquer outro arquivo de código — a menos que explicitamente solicitado.
- Zero dependências externas: nada de CDN, fontes remotas, APIs externas ou requisições de rede em tempo de execução. O arquivo deve funcionar 100% offline, aberto direto no navegador via `file://`, sem instalar nada e sem servidor.
- Motivo: o arquivo precisa ser enviado diretamente para os membros do grupo (WhatsApp, e-mail, etc.) e simplesmente aberto — sem hospedagem, sem setup.

## Fontes de verdade

- **Regras de negócio** (como a escala deve ser preenchida): [`docs/regras-preeenchimento-escala-grupo-louvor.md`](docs/regras-preeenchimento-escala-grupo-louvor.md). Documento normativo — qualquer lógica de alocação implementada em `index.html` deve corresponder exatamente às Regras 1–6 e aos critérios de aceite descritos ali. Releia-o antes de alterar a lógica de alocação; não reinvente o critério a partir do zero.
- **Glossário do domínio**: [`CONTEXT.md`](CONTEXT.md). Terminologia canônica (Integrante, Posição, Culto, Habilidade, Disponibilidade, Escala, etc.) — nomes de variáveis e funções em `index.html` devem seguir esses termos.
- **Layout de referência**: [`docs/referencia-layout-escala-louvor.jpeg`](docs/referencia-layout-escala-louvor.jpeg). A interface deve seguir esse visual: tema escuro, tipografia serifada nos títulos, cabeçalho com data do culto e horário de ensaio, lista de posições com ícone por ocupação, e lista de integrantes com avatar e badges coloridas para papéis especiais (ex.: Abertura, Condução, Encerramento).

## Resumo do motor de alocação

(ver o documento de regras para a especificação completa — isto é só um lembrete, não substitui a leitura)

1. Resolver posições de instrumento de condução antes de vocal/não-condução, por prioridade crescente dentro de cada grupo.
2. Um integrante acumula no máximo **1 posição Vocal + 1 posição Instrumental** por culto — nunca duas da mesma categoria.
3. Antes de confirmar alguém numa posição não-condução (incluindo Vocal), checar se ele é o único apto para alguma posição de condução ainda em aberto; se for, a condução tem prioridade.
4. Desempate, nesta ordem: prioridade da posição → menor número de posições alternativas para as quais o candidato também é apto → ainda não escalado no culto → ordem alfabética.
5. Ao realocar alguém para condução, reavaliar em cascata a vaga que ele deixou, repetindo até não haver mais ganho possível.
6. Vaga sem candidato apto é exibida como "vaga em aberto", nunca omitida — distinguindo severidade (condução vs. não-condução/vocal).
7. Se alguém foi escalado em Guitarra, quem está no Violão e também tem habilidade Contra baixo é movido para o Contra baixo (se vago) — mesmo sendo único apto para Violão. Exceção deliberada à Regra 1/3.1, específica a esse trio; o Violão fica vago, sem cascata de substituição.

## Resumo da importação de disponibilidade (Lote)

(ver `CONTEXT.md` — termo "Lote de Cultos" — e ADR-0006/0007/0008 para as decisões completas)

- O líder faz upload do CSV de respostas do formulário de Disponibilidade (Google Forms) + escolhe o mês; a ferramenta gera de uma vez a Escala de todos os domingos desse mês (um Lote).
- Os domingos do Lote vêm sempre do calendário do mês escolhido, nunca das datas presentes no CSV (ADR-0006).
- Nome do formulário sem correspondência exata no cadastro cai para o primeiro nome; ambiguidade ou ausência de correspondência gera aviso visível, nunca falha silenciosa (Regra 6 aplicada ao matching).
- Posições a fechar partem do catálogo completo, iguais para todos os domingos do Lote, mas ajustáveis depois por domingo; papéis especiais são sempre definidos por domingo (ADR-0007).
- Disponibilidade vinda do CSV continua editável manualmente por domingo depois de gerado — o CSV é a fonte primária, não a única.
- Só o Lote mais recente é salvo (`localStorage`, local a este navegador — não sincroniza entre dispositivos nem viaja com cópias reenviadas do arquivo); um novo upload substitui o anterior (ADR-0008).

## Qualidade de código dentro do arquivo único

Um único arquivo não é desculpa para bagunça. Aplique boas práticas de clean code e desenvolvimento web:

**Estrutura geral**
- Ordem consistente: `<style>` primeiro, depois o `<body>` semântico, depois `<script>` no fim — ou outra ordem, desde que seja sempre a mesma.
- Dentro do `<script>`, separe claramente por responsabilidade: dados (integrantes, habilidades, posições) → motor de regras (alocação) → renderização (DOM). Evite misturar lógica de negócio com manipulação de DOM na mesma função.

**JavaScript**
- Vanilla JS, sem frameworks. `const`/`let`, nunca `var`.
- Funções pequenas e nomeadas por intenção (ex.: `alocarPosicoesDeConducao`, não `process` ou `step1`).
- Prefira funções puras para a lógica de alocação (entrada: integrantes + posições: saída: escala) — isso torna o motor de regras testável isoladamente da renderização.
- Evite duplicação e estado global espalhado.

**CSS**
- Variáveis CSS (`:root`) para cores, espaçamento e tipografia, refletindo o layout de referência.
- Flexbox/Grid em vez de posicionamento manual.
- Responsivo — integrantes podem abrir o arquivo no celular.

**HTML**
- Semântico (`<header>`, `<main>`, `<table>`/`<ul>` conforme o conteúdo, `<label>` em inputs).
- Acessível: `alt` em avatares, contraste adequado ao tema escuro, `aria-*` quando fizer diferença real.

**Comentários**
- Nenhum comentário óbvio. Comente só o não óbvio (uma decisão de regra de negócio não evidente, uma razão para uma escolha específica de implementação).

**Idioma**
- Nomes de variáveis, funções e domínio em português, para casar com a terminologia dos documentos em `docs/`.

## Antes de considerar uma mudança concluída

- Teste manualmente os cenários da seção 7 ("Casos de exceção e exemplos de referência") de `docs/regras-preeenchimento-escala-grupo-louvor.md`.
- Confirme que `index.html` ainda abre via `file://` sem servidor, sem erros no console e sem chamadas de rede.
