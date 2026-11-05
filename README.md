# Mecânico 3D — Civic EK 1998 e Gol G2 Special 2001

Simulador de mecânica 3D dedicado a **carros usados específicos**, com um seletor no
topo para alternar entre eles:

| Carro | Motor | Layout | Suspensão |
|---|---|---|---|
| **Honda Civic Sedan LX 1.6 16V — 1998** (6ª geração, EK/EJ6) | D16Y7 1.6 16V, 106 cv | Transversal | Duplo braço triangular nas 4 rodas |
| **VW Gol Special 1.0 MI — 2001** (carroceria G2) | AT / EA111 1.0 8V, 54 cv | **Longitudinal** | McPherson + eixo de torção |

Não é um jogo genérico de oficina. Foi construído para um objetivo específico: **chegar
preparado para ver esses carros pessoalmente**, sabendo o nome de cada peça, onde ela fica,
como testar se está com defeito e quanto custa arrumar.

## Como rodar

```bash
npm install
```

```bash
npm run dev
```

Abra `http://localhost:5180`.

> No Windows, se o PowerShell bloquear o `npm.ps1` com erro de política de execução,
> use `npm.cmd run dev`.

Para gerar a versão estática:

```bash
npm run build
```

## O que tem dentro

**166 peças catalogadas** (87 no Civic, 79 no Gol) e **74 sintomas** no índice reverso.
Peças que existem em mais de um canto — amortecedores, pivôs, rodas — acendem todas juntas
quando você seleciona uma.

Cada peça traz:

- nome em português e o termo técnico usado em oficina e catálogo;
- para que serve, em linguagem de quem não entende de carro;
- onde fica no carro;
- **como inspecionar** — o teste concreto, passo a passo;
- sinais de desgaste;
- especificações (torque, intervalo, folga, capacidade);
- custo estimado de reparo e o argumento para negociar.

### Modos

| Modo | Para quê |
|---|---|
| **Explorar peças** | Gire o carro, clique nas peças, use raio-x e vista explodida |
| **Ouvi um barulho** | Índice reverso: parte do sintoma ("toc-toc na lombada") e chega na peça, com os candidatos em ordem de probabilidade e o teste que separa um do outro |
| **Modo Vistoria** | Roteiro na ordem real da inspeção, com relatório de negociação ao final |
| **Ficha técnica** | Motor, transmissão, suspensão, freios, dimensões, capacidades, torques e plano de manutenção |

Além disso:

- **Tour guiado** — 15 paradas na ordem de uma vistoria real, com a câmera indo até cada
  peça e o raio-x ligado automaticamente. Setas ← → navegam. Cada carro tem o seu roteiro.
- **Ficha de campo** — documento imprimível com os testes, quadradinhos para marcar a
  caneta, lista do que levar na mochila e espaço para anotações. Use "Imprimir" e escolha
  *Salvar como PDF* para levar no celular.

Tudo é por carro: trocar de veículo troca a ficha, o banco de peças, os sintomas, o roteiro
de vistoria, o tour e a cena 3D. As marcações da vistoria também são guardadas em separado,
então o que você anotou no Civic não vaza para o Gol.

### Painéis recolhíveis

As quatro bordas — árvore à esquerda, painel da peça à direita, barra superior e barra de
ferramentas — recolhem e reabrem individualmente.

Há **uma aba por borda, sempre no meio dela**. A mesma aba recolhe e expande: ela não sai
do lugar, só a seta inverte, apontando sempre para onde o painel vai. As quatro moram
dentro do `#palco`, que não rola — dentro dos painéis, que rolam, um elemento posicionado
de forma absoluta rolaria junto com o conteúdo e sairia de vista.

| Atalho | Ação |
|---|---|
| `P` | Modo palco: recolhe as quatro de uma vez (ou devolve todas) |
| `1` `2` `3` `4` | Alterna árvore, painel da peça, barra superior, barra de ferramentas |

O estado fica salvo no navegador. Em 1280×720, o modo palco leva a área útil do 3D de
640×606 para 1280×720 — **+138%**.

Duas notas de implementação, ambas medidas neste projeto:

- **Não declare `transition: grid-template-columns`.** A propriedade *congela* — o valor
  computado nunca muda, nem depois de 1,7 s, mesmo com o estilo inline correto aplicado e
  sem erro nenhum no console. Removida a transição, a mesma atribuição funciona na hora.
  Por isso a animação é feita em JS, escrevendo pixels quadro a quadro.
- **`ResizeObserver` não é entregue em aba em segundo plano.** O `Viewer` observa o
  container, mas o redimensionamento do canvas também é chamado explicitamente dentro da
  animação, para não depender disso.

## A diferença que mais importa entre os dois

**A mesma peça tem risco oposto nos dois carros.** No Civic, o D16Y7 é um motor **não
interferente**: se a correia dentada arrebentar, normalmente as válvulas não batem nos
pistões, e o intervalo de troca é de 100.000 km. No Gol, o AT/EA111 é **interferente**: a
correia arrebentada destrói o cabeçote, com prejuízo na casa de R$ 3.000 a 7.000 — e o
intervalo é de apenas 40.000 a 50.000 km.

Outras diferenças que mudam a inspeção inteira:

- **Válvulas:** o Civic tem regulagem mecânica (barulho = manutenção atrasada, serviço
  barato). O Gol tem tuchos hidráulicos (o "tec-tec" dos primeiros segundos é normal).
- **Ignição:** o Civic tem distribuidor, e ele é o ponto fraco clássico da geração. O Gol
  tem ignição estática sem distribuidor — o equivalente ali é o sensor de rotação.
- **Direção:** o Civic tem hidráulica (bomba, fluido, mangueira para inspecionar). A
  versão Special do Gol tem direção **mecânica** — volante pesado parado é normal, não
  defeito.
- **Embreagem:** hidráulica no Civic, por **cabo** no Gol.

## Arquitetura

```
src/
  core/
    materials.js   biblioteca PBR com texturas de ruído fBm geradas em runtime
    builders.js    geometria mecânica: polias, engrenagens, molas helicoidais,
                   correias que tangenciam as polias de verdade, núcleos aletados
    viewer.js      render, IBL, oclusão de ambiente (GTAO), contorno de seleção,
                   raycast, vista explodida, raio-x, rótulos e enquadramento
  data/
    catalogo.js    registro dos veículos e qual está ativo
    parts.js       consulta ao banco de peças do veículo ativo + taxonomia comum
    sintomas.js    consulta ao índice reverso do veículo ativo
    civic-ek/      ficha, peças, sintomas, etapas de vistoria e tour do Civic
    gol-g2/        idem, do Gol
  modules/
    comum.js       helpers compartilhados de carroceria
    civic-ek/      motor D16Y7 transversal + chassi do EK
    gol-g2/        motor EA111 longitudinal + chassi do G2
  ui/
    interface.js   árvore, busca, painel de detalhe, ficha técnica, ajuda
    vistoria.js    checklist por etapas e gerador de relatório
    sintomas.js    tela do índice reverso
    ficha-campo.js documento imprimível (CSS de impressão em styles.css)
    tour.js        tour guiado
```

Toda a geometria é construída **nas medidas reais** de cada carro
(Civic: 4.450 × 1.704 × 1.389 mm, entre-eixos 2.620, pneu 185/65 R14 —
Gol: 3.807 × 1.620 × 1.411 mm, entre-eixos 2.468, pneu 175/70 R13).

Há **uma exceção**: as carrocerias dos dois carros vêm de GLB esculpido no Blender por
*lofting* de seções transversais (21 no Civic, 18 no Gol), com subdivisão e vincos
seletivos, vãos de janela recortados e caixas de roda abauladas.

| Carro | GLB | Fonte editável |
|---|---|---|
| Civic EK | `public/modelos/civic-ek-carroceria.glb` | `modelagem/civic-ek.blend` |
| Gol G2 | `public/modelos/gol-g2-carroceria.glb` | `modelagem/gol-g2.blend` |

Cada GLB traz oito nós nomeados — `Carroceria`, `Vidros`, `Farol`, `PiscaD`, `Grade`,
`TomadaAr`, `Lanterna`, `PlacaTras` — e o projeto atribui seus próprios materiais PBR a
cada um. Todo o resto (motor, suspensão, freios, transmissão, elétrica) continua desenhado
por código.

Os dois têm **linhas de recorte** de capô, tampa e portas, feitas como sulcos booleanos de
8 mm que seguem a superfície — três cortes verticais no Civic (sedã, 4 portas) e dois no
Gol (hatch, 2 portas, porta longa).

O vão do motor do Civic foi conferido contra fotografias do D16Y7 real. Isso trouxe caixa
de fusíveis e relés, reservatório do lava-vidros, travessa superior do radiador com os
furos de fábrica, grade do para-brisa com limpadores, mangueiras de aquecimento
atravessando o corta-fogo, tubos rígidos do A/C e a placa do número de chassi. A caixa de
ar foi para o canto dianteiro e o mangote corrugado engrossou de 36 para 52 mm de raio —
nas fotos ele é o segundo elemento mais visível do vão, depois da tampa de válvulas.

Isso custou uma propriedade que o projeto tinha: ele deixou de ser inteiramente
reproduzível a partir do código. O GLB é um binário versionado. A troca foi consciente —
o perfil lateral extrudado não conseguia produzir seção transversal variável, que é o que
separa uma carroceria de um sabonete.

**Nada depende do GLB existir.** `src/core/modelos.js` nunca rejeita: se o arquivo faltar
ou falhar no carregamento, `temModelo()` devolve `false` e a carroceria por código volta a
ser usada, com aviso no console.

Uma restrição de ordem: os modelos são **pré-carregados antes de montar a cena**
(`await precarregarModelos(...)` no `main.js`). O viewer indexa as malhas de cada peça no
momento do registro, então carregar o GLB depois e trocar os filhos do grupo deixaria esse
índice apontando para malha já removida — a peça continuaria na árvore e pararia de
responder ao mouse.

## Diagnóstico de interação

Par do verificador geométrico. Enquanto aquele pergunta *"a peça está no lugar certo?"*,
este pergunta *"a peça responde direito ao mouse?"*.

```js
__diagnosticar()   // no console do navegador
```

`src/core/diagnostico.js` varre a tela inteira usando o **mesmo caminho de código que o
mouse usa** (`viewer._pick`) e roda sete checagens: peça clicável sem ficha, malha
pertencendo a duas peças, peça sem geometria, malha sem marcação, material de raio-x preso
fora do modo, e — a que originou o módulo — **peça escondida ainda sendo capturada pelo
ponteiro**.

Testar o raycaster cru não serve para isso: o three.js **não poda subárvores invisíveis**,
então ele sempre devolve as malhas escondidas. O que precisa ser afirmado é que o `_pick`,
depois de filtrar, nunca entregue uma peça fora da tela.

Estado atual: **0 ocorrências nos dois carros**, em cinco combinações de controles
(tudo visível, sem carroceria, sem carroceria e rodas, raio-x ligado, e de volta ao normal).

## Verificador de montagem

O Car Mechanic Simulator consegue fidelidade de posição porque **licencia os carros** e tem
artistas posicionando cada peça contra referência do fabricante — a posição fica gravada no
pivô da malha e vira dado, não código. Aqui não há licença nem artista, então o que
substitui essa garantia é **verificação automática**.

```js
__verificar()       // no console do navegador: tabela de ocorrências do carro ativo
__verificar(true)   // também imprime cada ocorrência com medido x esperado
```

`src/core/verificacao.js` roda sete regras geométricas contra o envelope declarado do carro
(`perfil` em `src/data/<veículo>/index.js`):

| Regra | O que acusa |
|---|---|
| `geometria-vazia` | peça registrada sem malha — clique morto na interface |
| `abaixo-do-solo` | peça atravessando o piso |
| `fura-o-capo` | peça do vão do motor acima da linha da lataria naquele Z |
| `fora-do-comprimento` / `fora-da-largura` | peça ultrapassando as cotas reais do carro |
| `par-assimetrico` | lados esquerdo e direito não espelhados |
| `roda-fora-do-eixo` | roda fora da posição de eixo |
| `motor-fora-do-vao` | peça de motor fora dos limites entre travessa e corta-fogo |

O contorno usado pelas regras é a **mesma silhueta** que constrói a lataria, então a
verificação acompanha sozinha se a carroceria mudar.

Estado atual: **0 ocorrências nos dois carros.**

## Fidelidade dimensional

A aba **Ficha técnica** de cada carro termina com um quadro chamado *"De onde vem cada
medida"*, dividido em três: **especificação publicada**, **derivado por cálculo** e
**aproximado**. Existe porque nem tudo no modelo tem a mesma origem, e você merece saber
em que confiar.

O caso mais forte é a geometria interna do motor do Civic. Três medidas publicadas da
família D — altura de deck **212 mm**, biela **137 mm** e curso **90 mm** — fecham entre si:

```
212 − 137 − 45 = 30 mm de altura de compressão do pistão
```

Com o pistão posicionado pelo pino (munhão + 137) e a coroa 30 mm acima dele, o cilindro 1
no ponto morto superior encosta exatamente na face do bloco, a 212 mm. Isso é verificável
no próprio modelo, e é a prova de que as três medidas de origem batem. Elas vivem em
constantes no topo de `src/modules/civic-ek/engine.js` justamente porque o encaixe depende
das três ao mesmo tempo.

Outras correções da mesma passada: espaçamento entre cilindros de **85 mm** (não 90), disco
de freio dianteiro de **242 mm** — o de 262 mm é do EX, e usar o errado aqui ensinaria a
comprar peça errada — e tambor traseiro de **203 mm**. No Gol: disco sólido de **239 mm** e
tambor de **180/210 mm**.

Não encontrei fonte pública confiável para altura de deck, biela e espaçamento do EA111, e
por isso a geometria interna do motor do Gol está declarada como **proporcional, não
cotada**, no próprio app.

## Sobre os valores em R$

Os custos exibidos são **estimativas de ordem de grandeza** para orientar a conversa,
considerando peça de reposição de linha intermediária mais mão de obra em oficina
independente. **Não são orçamentos.** Confirme o preço na sua cidade antes de usar o
número como argumento.

Vale notar que a ordem de grandeza é bem diferente entre os dois: peça de Gol é das mais
baratas e disponíveis do Brasil, então o mesmo defeito costuma pesar bem menos na conta
do que no Civic.

## Ferramenta de desenvolvimento

O `vite.config.js` inclui um plugin **exclusivo de desenvolvimento** que aceita um POST em
`/__snap` e grava um frame do canvas em `.snap/`. Serve para conferir o render sem depender
de captura de tela. Ele não vai para o build de produção (`apply: 'serve'`) e pode ser
removido sem afetar nada.
