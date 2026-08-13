# Regras de Preenchimento da Escala do Grupo de Louvor

**Versão:** 1.0
**Módulo relacionado:** Gerador de escala (`index.html`)

---

## 1. Contexto e objetivo

### 1.1 Contexto

Hoje a escala semanal do grupo de louvor é montada manualmente pelo líder, cruzando duas informações mantidas em planilha: (1) as **habilidades** de cada integrante (quais instrumentos ou vocal cada pessoa sabe tocar/cantar) e (2) as **posições que precisam ser fechadas** naquele culto (com uma categoria, uma prioridade e um sinalizador de "instrumento de condução").

### 1.2 Objetivo

- Qualquer pessoa (ou sistema) que monte a escala aplique o mesmo critério de priorização, de forma consistente e repetível;
- As regras sejam específicas o suficiente para servir de especificação de comportamento para a ferramenta de geração automática de escala, permitindo validar se uma implementação está correta;
- Casos como membros com habilidade única em posições de condução, conflitos de escalação entre múltiplos candidatos, efeito cascata de realocações tenham um comportamento esperado explícito e testável.

Este documento **não** especifica interface, mas sim o comportamento de negócio que qualquer interface (planilha, ferramenta web, processo manual) deve seguir para preencher a escala corretamente.

---

## 2. Problema

Ao preencher a escala manualmente ou com apoio de uma ferramenta, é preciso decidir, para cada posição em aberto, quem deve ocupá-la, dado que:
- Cada integrante tem um conjunto fixo de habilidades (instrumentos e/ou vocal);
- Cada posição tem uma categoria (Vocal/Instrumental), uma prioridade (1 = mais importante, 2 = menos importante) e um sinalizador de instrumento de condução (Sim/Não);
- Uma mesma pessoa pode, em tese, ocupar mais de uma posição no mesmo culto;
- Uma pessoa pode cantar e tocar um instrumento ao mesmo tempo desde que possua as habilidades para tal.
- Nem toda combinação de habilidade "acumulável" é fisicamente possível (ex.: ninguém toca dois instrumentos ao mesmo tempo).
- O objetivo é fechar o máximo possível de posições de instrumentos de condução.
- Outro objetivo é evitar que uma pessoa que possui habilidade de tocar um instrumento de condução e um instrumento que não seja de condução eseja alocada em um instrumento que não é de condução e o instrumento de condução esteja vago na escala.

Sem regras precisas, decisões diferentes (humanas ou automatizadas) chegam a escalas diferentes para o mesmo conjunto de pessoas disponíveis — algumas piores que outras em relação ao objetivo declarado de priorizar instrumentos de condução.

---

## 3. Público-alvo / Stakeholders

- **Líder do grupo de louvor** — usuário principal; aplica as regras (manualmente ou via ferramenta) toda semana.
- **Integrantes do grupo de louvor** — impactados pelo resultado; precisam confiar que a distribuição é justa e segue um critério objetivo.
- **Responsável técnico pela ferramenta de geração de escala** — usa este documento como especificação de comportamento a implementar/validar.

---

## 4. Escopo

**Dentro do escopo deste documento:**
- Regras de elegibilidade (quem pode ocupar qual posição);
- Regras de ordem de preenchimento (o que é resolvido primeiro);
- Regras de acúmulo de função por integrante no mesmo culto;
- Regras de realocação/desempate quando há conflito entre candidatos ou posições;
- Comportamento esperado quando não há candidato disponível para uma posição.

**Fora do escopo:**
- Definição de quem faz Abertura, Condução do culto (no sentido de MC/liderança do momento, distinta de "instrumento de condução") e Encerramento — essa é uma decisão manual do líder, independente das habilidades cadastradas;
- Repertório musical, tonalidade, ordem das músicas;
- Regras de ausência/férias recorrentes ou de rodízio de longo prazo (quem tocou na semana passada) — não fazem parte da priorização atual;
- Interface de usuário da ferramenta (tratada em documento de especificação técnica separado).

---

## 5. Glossário

| Termo | Definição |
|---|---|
| **Posição** | Uma vaga a ser preenchida na escala (ex.: Teclado, Melodia, Contra baixo). |
| **Categoria** | Classificação da posição: `Vocal` ou `Instrumental`. |
| **Prioridade** | Número que indica a importância relativa da posição dentro de sua categoria (1 = maior prioridade). |
| **Instrumento de condução** | Posição instrumental marcada como estrutural para conduzir a música (ex.: Teclado, Piano, Violão, Bateria). Vocal nunca é classificado como instrumento de condução — é tratado à parte (ver Regra 3). |
| **Habilidade** | Uma posição que um integrante está apto a ocupar, conforme cadastro. |
| **Integrante único** | Integrante disponível que é o único, entre todos os disponíveis no culto, com habilidade cadastrada para determinada posição. |
| **Escalado** | Integrante que já recebeu uma posição na escala em construção. |
| **Vaga em aberto** | Posição sem integrante escalado. |

---

## 6. Regras de preenchimento (versão revisada)

Cada regra abaixo substitui integralmente sua versão original equivalente. As mudanças em relação à versão anterior estão marcadas com **[REVISADO]** ou **[NOVO]**.

### Regra 1 — Prioridade geral

O objetivo é fechar primeiro as posições de instrumentos de condução, seguindo a ordem de prioridade (1 antes de 2, e assim por diante) definida para cada posição.

**Ordem de resolução:** todas as posições marcadas como instrumento de condução são resolvidas antes de qualquer posição não-condução ou vocal, independentemente do número de prioridade destas últimas. Dentro de cada um desses dois grupos, resolve-se por prioridade crescente.

- **Critério de aceite:** ao final do processo, não deve existir uma posição de condução em aberto se houver algum integrante disponível, apto e ainda não integralmente ocupado (ver Regra 6) capaz de preenchê-la.

### Regra 2 — Acúmulo de funções no mesmo culto

Um integrante pode ser escalado em mais de uma função no mesmo culto, desde que:
1. Possua habilidade cadastrada para cada função; e
2. **[REVISADO]** As funções acumuladas sejam **no máximo uma da categoria Vocal e uma da categoria Instrumental** — nunca duas posições da mesma categoria ao mesmo tempo.

**Motivação da revisão:** a versão original não deixava claro que uma pessoa não pode fisicamente tocar dois instrumentos simultaneamente (ex.: Teclado e Violão ao mesmo tempo) nem cantar duas partes vocais ao mesmo tempo (ex.: Melodia e Contralto ao mesmo tempo). O exemplo original dado ("cantar e tocar violão") já sugeria esse limite implicitamente — esta revisão o torna explícito e aplicável a qualquer combinação.

- **Critério de aceite:** nenhum integrante aparece escalado em duas posições da mesma categoria no mesmo culto.
- **Exemplo válido:** Daniel escalado em Teclado (Instrumental) e também em Melodia (Vocal) — permitido.
- **Exemplo inválido:** Daniel escalado em Teclado e também em Violão (ambas Instrumental) — não permitido, mesmo que ele tenha habilidade cadastrada nas duas.

### Regra 3 — Elegibilidade para posições de condução (Vocal incluído)

**[REVISADO]** Um integrante deve ser considerado candidato a uma posição de condução em aberto sempre que tiver a habilidade correspondente, **independentemente da categoria da posição em que já esteja ou venha a ser escalado — incluindo Vocal.**

**Motivação da revisão:** a versão original tratava "instrumento não-condução" como a única situação que disparava a análise de realocação, deixando Vocal de fora por omissão. Isso permitia que um integrante com habilidade em um instrumento de condução único (sem substituto) fosse escalado apenas no Vocal, deixando a posição de condução vazia — o que contraria diretamente a Regra 1.

- **Critério de aceite:** um integrante com habilidade Vocal e habilidade em um instrumento de condução é avaliado para o instrumento de condução, não apenas para o Vocal.

### Regra 3.1 — Proteção de integrante único **[NOVO]**

Antes de confirmar a escalação de um integrante em qualquer posição não-condução (incluindo Vocal), verificar se ele é **integrante único** para alguma posição de condução ainda em aberto.

- Se for, a prioridade é escalá-lo na posição de condução.
- Ele só deve ser escalado na posição não-condução se existir outro integrante disponível e apto para cobrir a posição de condução em seu lugar.

**Motivação:** fecha o principal risco identificado na planilha original — membros como "único apto para Teclado" ou "único apto para Piano" podiam ser alocados em Vocal antes de sua posição de condução ser avaliada, deixando-a vazia.

- **Critério de aceite:** se existe exatamente um integrante disponível apto para uma posição de condução em aberto, esse integrante está escalado nela ao final do processo (a menos que ele já esteja no limite de acúmulo definido na Regra 2 por conta de uma posição de condução ainda mais prioritária).

### Regra 4 — Critério de desempate **[NOVO]**

Quando mais de uma posição em aberto puder ser preenchida pelo mesmo integrante, ou mais de um integrante apto disputar a mesma posição, aplicar nesta ordem:

1. **Prioridade da posição** — preencher primeiro a de menor número de prioridade.
2. **Escassez de habilidade** — entre os candidatos aptos para a posição corrente, priorizar quem tem **menos** posições alternativas em aberto para as quais também é apto. Isso evita usar um integrante versátil em uma vaga que outra pessoa também cobre, arriscando deixar sem opção uma vaga que só ele poderia preencher.
3. **Já escalado vs. ainda livre** — entre candidatos empatados nos critérios acima, priorizar quem ainda não foi escalado em nenhuma função naquele culto, para distribuir a participação entre mais integrantes.
4. **Ordem alfabética** — critério de desempate final, apenas para garantir um resultado determinístico quando todos os critérios anteriores empatam.

**Motivação:** a versão original não definia nenhum critério de desempate, deixando a decisão nesses casos inteiramente subjetiva.

### Regra 5 — Efeito em cascata da realocação **[NOVO]**

Ao mover um integrante de uma posição não-condução (ou Vocal) para uma posição de condução, conforme a Regra 3.1, a posição que ele deixou vaga deve ser reavaliada imediatamente:

1. Verificar se outro integrante disponível e apto pode preencher a vaga deixada.
2. Se houver, escalá-lo nela.
3. Se não houver, a vaga permanece em aberto — isso é aceitável, pois a posição de condução tem prioridade maior (Regra 1).
4. Este processo é reaplicado até que nenhuma realocação adicional aumente o número de posições de condução preenchidas (critério de parada explícito, para evitar um ciclo sem fim de trocas).

**Motivação:** a versão original mandava fazer a realocação mas não dizia o que fazer com a posição que ficava vazia como consequência, nem quando parar de reavaliar.

### Regra 6 — Sem candidato disponível

Se, ao final da aplicação das regras acima, uma posição permanecer sem nenhum integrante disponível e apto, ela deve ser sinalizada como **vaga em aberto**, distinguindo:
- **Vaga em aberto — condução:** sinalização de maior severidade, pois contraria diretamente o objetivo da Regra 1.
- **Vaga em aberto — não-condução/vocal:** sinalização informativa.

- **Critério de aceite:** o resultado final da escala nunca omite silenciosamente uma posição sem candidato — ela é sempre listada e sinalizada.

---

## 7. Casos de exceção e exemplos de referência

Os exemplos abaixo usam nomes reais da planilha vigente e servem como casos de teste desta especificação:

| Cenário | Comportamento esperado |
|---|---|
| Daniel (única habilidade de condução disponível: Teclado) também tem Vocal | Daniel é escalado em Teclado. Se ainda tiver capacidade de acúmulo (Regra 2) e houver vaga Vocal em aberto, pode também ser escalado em uma posição Vocal. |
| Miriã tem Piano (condução) e Flauta (não-condução), sendo única apta em ambas | Miriã é escalada em Piano primeiro (Regra 1 + 3.1). Pode acumular Flauta também, pois são de categorias diferentes (Instrumental ambas — **não pode acumular as duas**, ver Regra 2: são da mesma categoria Instrumental, portanto no máximo uma das duas). |
| Um integrante é o único apto para dois instrumentos de condução distintos (ex.: Teclado e Violão) no mesmo culto | Ele é escalado em apenas um deles (o de maior prioridade, Regra 4.1). O outro fica como vaga em aberto — condução (Regra 6), pois fisicamente não é possível ocupar dois instrumentos ao mesmo tempo (Regra 2). |
| Um integrante está escalado em Contra baixo (não-condução) e é o único apto para Bateria (condução, em aberto) | Ele é realocado para Bateria (Regra 3.1). O Contra baixo é reavaliado (Regra 5): se outro integrante apto e disponível existir, assume o Contra baixo; senão, o Contra baixo fica em aberto. |

---

## 8. Métricas de sucesso

- **100% das posições de condução preenchidas** sempre que exista pelo menos um integrante disponível e apto para cada uma delas, considerando os limites de acúmulo da Regra 2.
- **Zero ocorrências** de um mesmo integrante escalado em duas posições da mesma categoria no mesmo culto.
- **Resultado determinístico**: para o mesmo conjunto de integrantes disponíveis e a mesma lista de posições, a aplicação das regras produz sempre o mesmo conjunto de posições de condução preenchidas (podendo haver mais de uma distribuição válida para as posições não-condução/vocal, ver Regra 4).

---

## 9. Histórico / referências

- Regras originais: planilha "Priorização escala grupo de louvor" (abas *Habilidades* e *Posições a serem fechadas*).
- Ambiguidades identificadas na versão original: (1) Vocal não estava explicitamente coberto pela regra de realocação para condução; (2) ausência de critério de desempate entre múltiplos candidatos ou múltiplas vagas possíveis; (3) ausência de tratamento do efeito cascata da realocação; (4) ausência de regra explícita impedindo acúmulo de dois instrumentos simultâneos.
- Esta versão revisada foi implementada e validada na ferramenta de geração automática de escala (`index.html`).