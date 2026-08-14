# Gerador de Escala do Grupo de Louvor

Ferramenta que, a partir das habilidades dos integrantes e das posições a serem preenchidas num culto, monta automaticamente a escala semanal aplicando os critérios de priorização definidos em [`docs/regras-rreenchimento-escala-grupo-louvor.md`](docs/regras-rreenchimento-escala-grupo-louvor.md).

## Language

### Integrantes

**Integrante**:
Pessoa do grupo de louvor, com um conjunto fixo de Habilidades (cadastro) e uma Disponibilidade que varia a cada Culto.
_Avoid_: Membro (termo usado na planilha original; superado por "Integrante" no documento de regras)

**Habilidade**:
Não é uma entidade própria — é a relação entre um Integrante e uma Posição que ele está apto a ocupar, conforme cadastro. É permanente, ao contrário da Disponibilidade.

**Disponibilidade**:
Sinalização por Culto indicando se um Integrante pode ser escalado naquela semana, independente de suas Habilidades (que são permanentes). Normalmente é coletada de uma vez para vários Cultos futuros (um mês) através de um formulário externo à ferramenta, em forma negativa — o Integrante informa em quais Cultos do período ele **não** pode, não quais pode. Integrante que não responde ao formulário é considerado disponível em todos os Cultos do período.

### Posições

**Posição**:
Uma vaga a ser preenchida na Escala (ex.: Teclado, Melodia, Contra baixo). Pertence a um catálogo fixo — Categoria, Prioridade e o sinalizador de instrumento de condução são definidos uma única vez, não por Culto.
_Avoid_: Vaga (é o estado de uma Posição sem Integrante escalado, não a Posição em si — ver "Vaga em aberto"), Função

**Categoria**:
Classificação de uma Posição: `Vocal` ou `Instrumental`.

**Naipe**:
Termo usado para as Posições da Categoria Vocal (Melodia, Contralto, Tenor) — cada uma é uma parte vocal distinta. Habilidade Vocal é sempre registrada pelo naipe específico; não existe habilidade genérica "Vocal" que conceda aptidão a todos os naipes de uma vez.

**Prioridade**:
Número que indica a importância relativa de uma Posição dentro do seu Grupo de resolução (1 = maior prioridade). Empates de prioridade são comuns no catálogo real e são resolvidos por ordem alfabética do nome da Posição, nunca pela ordem de cadastro.

**Instrumento de condução**:
Sinalizador numa Posição Instrumental marcando-a como estrutural para conduzir a música (ex.: Teclado, Piano, Violão, Bateria). Vocal nunca é instrumento de condução.
_Avoid_: Condução do culto — papel litúrgico/de MC (quem faz Abertura, Condução, Encerramento), decidido manualmente pelo líder e fora do escopo do motor de alocação. Ao se referir ao papel litúrgico, qualifique sempre como "Condução do culto" para não confundir com este termo.

**Grupo de resolução**:
Um dos dois blocos em que a Regra 1 particiona as Posições para fins de ordem de preenchimento: **condução** (Posições Instrumentais marcadas como instrumento de condução), resolvido integralmente antes de **não-condução-ou-vocal** (Posições Instrumentais não-condução e todas as Posições Vocais, numa única sequência ordenada por prioridade).

### Escala

**Culto**:
Instância semanal do serviço: tem uma data, um horário de ensaio, o subconjunto do catálogo de Posições aberto naquela semana e quais Integrantes estão com Disponibilidade naquela semana. Estado como "Escalado" e "Vaga em aberto" é sempre relativo a um único Culto — não se acumula de uma semana para outra.

**Escala**:
O conjunto completo de atribuições Posição → Integrante (ou vaga em aberto) produzido para um Culto.

**Escalado**:
Integrante que já recebeu uma Posição na Escala em construção para o Culto corrente.

**Integrante único**:
Entre os Integrantes disponíveis para um Culto, aquele que é o único apto, por Habilidade cadastrada, para uma determinada Posição de condução em aberto.

**Vaga em aberto**:
Posição sem Integrante escalado ao final do processo de alocação. Sempre exibida, nunca omitida, distinguindo severidade: condução (alta) vs. não-condução/vocal (informativa).

**Lote de Cultos**:
Agrupamento de todos os Cultos de um mês calendário, gerados de uma vez a partir de um único upload do formulário de Disponibilidade (ver ADR-0006, ADR-0007). Os domingos do Lote vêm sempre do calendário do mês escolhido, nunca das datas que aparecem no formulário — um domingo em que ninguém faltou não deixa rastro nele. Dentro do Lote, o catálogo de Posições a fechar é o mesmo para todos os Cultos por padrão (ajustável depois por Culto); os papéis especiais (Abertura, Condução do culto, Encerramento) são sempre definidos individualmente por Culto, nunca herdados do Lote. Depois de gerado, a Disponibilidade de um Integrante num Culto específico do Lote ainda pode ser ajustada manualmente — o formulário é a fonte primária, não a única. Só o Lote mais recente é mantido; um novo upload substitui o anterior.
_Avoid_: Mês de escalas (ambíguo com "mês" no sentido de calendário puro, caso o período de coleta um dia deixe de ser mensal)
