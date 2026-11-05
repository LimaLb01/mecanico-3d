/**
 * Indice reverso: do SINTOMA para a peca.
 *
 * O banco de pecas responde "esta peca da que problema?". No patio do vendedor
 * a pergunta chega ao contrario: "ouvi um toc-toc, o que e isso?". Este arquivo
 * cobre esse sentido.
 *
 * Cada sintoma esta escrito como uma pessoa que nao entende de carro
 * descreveria — nao com o nome tecnico do defeito.
 *
 * candidatos[].separar e a parte mais importante: e o teste que DISTINGUE um
 * candidato do outro. Sem isso a lista vira adivinhacao.
 */

// Categorias e niveis de probabilidade sao taxonomia compartilhada e vivem em
// src/data/sintomas.js. Aqui ficam apenas os sintomas deste carro.
export const SINTOMAS = [
  /* ============================================================ RUIDO === */
  {
    id: 'toc-lombada',
    categoria: 'ruido',
    sintoma: 'Um "toc-toc" seco vindo da roda ao passar devagar em lombada ou buraco',
    quando: 'Baixa velocidade, piso irregular. Some no asfalto liso.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'bieleta', chance: 'alta', separar: 'E a causa mais comum e a mais barata. Com o carro suspenso, segure a bieleta e balance: folga na ponta esferica confirma. Comece por aqui.' },
      { peca: 'bandeja-inferior', chance: 'alta', separar: 'Olhe as buchas de borracha nas pontas do braco. Borracha rachada, esmagada ou com o miolo deslocado confirma. O barulho da bucha e mais surdo que o da bieleta.' },
      { peca: 'pivo-suspensao', chance: 'media', separar: 'Segure a roda em 12 e 6 horas e balance. Folga com estalo aponta pivo. Diferente da bieleta, o pivo tambem estala ao esterçar.' },
      { peca: 'coxim-amortecedor', chance: 'media', separar: 'Se o barulho tambem aparece ao girar o volante com o carro PARADO, e coxim, nao bieleta.' },
      { peca: 'barra-estabilizadora', chance: 'baixa', separar: 'Ruido de rangido de borracha, nao de batida metalica. Olhe as duas buchas que prendem a barra no chassi.' },
    ],
  },
  {
    id: 'tec-tec-motor',
    categoria: 'ruido',
    sintoma: 'Um "tec-tec-tec" rapido e metalico vindo da parte de cima do motor',
    quando: 'Mais forte com o motor frio e em marcha lenta. Acompanha a rotacao.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'valvulas', chance: 'alta', separar: 'Este motor NAO tem tucho hidraulico — a folga e regulada com calibrador. Se o ruido vem do alto do cabecote e acompanha a rotacao, e regulagem atrasada. Servico barato, mas denuncia manutencao relaxada.' },
      { peca: 'coletor-escape', chance: 'media', separar: 'Coletor trincado tambem faz "tec-tec" a frio, MAS costuma sumir quando o motor esquenta (o metal dilata e fecha a trinca). Se some a quente, olhe o coletor, nao as valvulas.' },
      { peca: 'bicos-injetores', chance: 'baixa', separar: 'Bico injetor faz um tique-tique fino e regular, e normal. Encoste uma chave de fenda no bico e o ouvido no cabo: se o som e igual nos quatro, e normal.' },
    ],
  },
  {
    id: 'estalo-curva-fechada',
    categoria: 'ruido',
    sintoma: 'Estalo ritmado "tec-tec-tec" ao fazer curva fechada devagar, tipo manobra de estacionamento',
    quando: 'Volante todo esterçado, velocidade de manobra. Acompanha o giro da roda.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'homocinetica', chance: 'alta', separar: 'Praticamente certeza. Faca um circulo completo esterçando todo para a esquerda, depois todo para a direita: o lado que estala mais alto e o defeituoso. Confirme olhando a coifa — rasgada ou com graxa espalhada fecha o diagnostico.' },
      { peca: 'semi-eixos', chance: 'baixa', separar: 'Se o estalo tambem aparece andando reto e acelerando forte, pode ser a junta interna ou o eixo, nao a externa.' },
    ],
  },
  {
    id: 'toc-volante-parado',
    categoria: 'ruido',
    sintoma: 'Um "toc" ou rangido ao girar o volante com o carro parado',
    quando: 'Motor ligado ou desligado, carro parado, girando o volante de um lado ao outro.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'coxim-amortecedor', chance: 'alta', separar: 'O rolamento no topo do amortecedor e o que permite a suspensao girar quando voce esterça. Travado, ele estala. Abra o capo e olhe o topo das torres: borracha rachada confirma.' },
      { peca: 'terminal-direcao', chance: 'media', separar: 'Segure a roda em 3 e 9 horas e balance no sentido horizontal. Folga com estalo aponta terminal, nao coxim.' },
      { peca: 'caixa-direcao', chance: 'baixa', separar: 'Se o barulho vem do meio do carro e nao das rodas, e a caixa. Costuma vir junto com folga morta no volante.' },
    ],
  },
  {
    id: 'zumbido-curva',
    categoria: 'ruido',
    sintoma: 'Zumbido grave tipo aviao que aumenta com a velocidade',
    quando: 'Acima de uns 50 km/h. Muda de intensidade ao fazer curva suave.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'rolamento-roda', chance: 'alta', separar: 'TESTE DECISIVO: numa rua vazia a 60–80 km/h, faca uma curva suave para a direita e depois para a esquerda. Se o zumbido aumenta numa direcao, o rolamento ruim e o do lado OPOSTO ao da curva (a curva transfere peso para o lado de fora).' },
      { peca: 'pneus', chance: 'media', separar: 'Pneu com desgaste irregular tambem zumbe, mas o ruido NAO muda ao curvar. Se o som e igual nas duas curvas, olhe os pneus.' },
      { peca: 'caixa-cambio', chance: 'baixa', separar: 'Zumbido de cambio muda ao trocar de marcha na mesma velocidade. Zumbido de rolamento nao liga para a marcha engatada.' },
    ],
  },
  {
    id: 'chiado-partida',
    categoria: 'ruido',
    sintoma: 'Chiado agudo tipo assobio ao dar a partida ou ao ligar o ar-condicionado',
    quando: 'Nos primeiros segundos apos a partida, ou no instante em que o compressor engata.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'correia-auxiliar', chance: 'alta', separar: 'Correia frouxa ou vitrificada patina na polia e assobia. Olhe as ranhuras: trinca, fiapo ou brilho de vidro confirmam. E o caso mais comum e o mais barato.' },
      { peca: 'tensor-correia', chance: 'media', separar: 'Se o ruido e um zumbido continuo (e nao um assobio no arranque), e rolamento de tensor, nao a correia.' },
      { peca: 'bomba-direcao', chance: 'baixa', separar: 'Se o ruido aparece so quando voce mexe o volante, e a bomba ou o nivel de fluido — nao a correia.' },
    ],
  },
  {
    id: 'chiado-embreagem',
    categoria: 'ruido',
    sintoma: 'Chiado ou zumbido que aparece (ou some) quando voce pisa na embreagem',
    quando: 'Motor ligado, carro parado, ponto morto.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'rolamento-embreagem', chance: 'alta', separar: 'Se o ruido APARECE ao pisar e SOME ao tirar o pe, e o rolamento de embreagem. Teste leva 10 segundos com o carro parado.' },
      { peca: 'caixa-cambio', chance: 'media', separar: 'Se e o contrario — o ruido existe com o pe FORA e some ao pisar — o problema esta no rolamento do eixo piloto, dentro do cambio. Mais caro.' },
    ],
  },
  {
    id: 'batida-grave-motor',
    categoria: 'ruido',
    sintoma: 'Batida grave e ritmada vinda do fundo do motor, que fica mais forte ao acelerar',
    quando: 'Marcha lenta e sob carga. Piora com o motor quente e o oleo mais fino.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'bielas', chance: 'alta', separar: 'A classica "batida de biela". Nao ha teste caseiro que salve: se voce ouve isso, o motor precisa abrir. Nao e desconto, e motivo para procurar outro carro.' },
      { peca: 'virabrequim', chance: 'alta', separar: 'Bronzina de mancal da uma batida ainda mais grave e surda. Mesmo desfecho da biela.' },
      { peca: 'bomba-oleo', chance: 'media', separar: 'Se a luz de oleo tambem pisca em marcha lenta a quente, a origem pode ser falta de pressao. O resultado final e o mesmo: motor comprometido.' },
    ],
  },
  {
    id: 'gemido-volante',
    categoria: 'ruido',
    sintoma: 'Gemido ou ronco alto ao girar o volante, principalmente com o carro parado',
    quando: 'Motor ligado, esterçando ate o fim do curso.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'bomba-direcao', chance: 'alta', separar: 'Primeiro confira o nivel no reservatorio. Se estiver baixo, o gemido e consequencia — e ha um vazamento em algum lugar que voce precisa achar. Se o nivel esta certo e ainda geme, a bomba esta fraca.' },
      { peca: 'caixa-direcao', chance: 'media', separar: 'Se ha oleo escorrendo pela regiao central da caixa ou coifas molhadas, o vazamento esta na caixa. Servico bem mais caro que a bomba.' },
      { peca: 'correia-auxiliar', chance: 'baixa', separar: 'Correia frouxa patina quando a bomba exige forca. Nesse caso o ruido e assobio, nao gemido grave.' },
    ],
  },
  {
    id: 'rangido-frear',
    categoria: 'ruido',
    sintoma: 'Chiado agudo ou rangido metalico ao pisar no freio',
    quando: 'Toda frenagem, ou so nas primeiras do dia.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'pastilhas-freio', chance: 'alta', separar: 'Chiado agudo fino e o sensor de desgaste avisando que acabou. Rangido metalico GROSSO ja e a chapa comendo o disco — nesse caso o disco vai junto e o custo triplica. Olhe a espessura pelo vao da roda.' },
      { peca: 'disco-freio', chance: 'media', separar: 'Passe a unha na superficie do disco de fora para dentro: se engancha numa borda alta na ponta, o disco ja gastou muito.' },
      { peca: 'pinca-freio', chance: 'baixa', separar: 'Se so um lado range e a pastilha daquele lado esta bem mais fina que a do outro, a pinca esta travando.' },
    ],
  },

  /* ========================================================= VIBRACAO === */
  {
    id: 'volante-treme-freando',
    categoria: 'vibracao',
    sintoma: 'O volante treme quando voce pisa no freio em velocidade',
    quando: 'Frenagem acima de uns 70 km/h. Some ao soltar o freio.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'disco-freio', chance: 'alta', separar: 'Disco empenado e a causa quase certa quando a trepidacao aparece SO ao frear. Procure tambem manchas azuladas na pista de atrito, sinal de superaquecimento.' },
      { peca: 'pinca-freio', chance: 'media', separar: 'Pinca travando aquece um disco so e empena ele. Depois de rodar, aproxime a mao (sem encostar) das duas rodas dianteiras: se uma esta muito mais quente, achou.' },
      { peca: 'rolamento-roda', chance: 'baixa', separar: 'Se a trepidacao tambem existe sem frear, nao e o disco.' },
    ],
  },
  {
    id: 'vibracao-velocidade',
    categoria: 'vibracao',
    sintoma: 'Vibracao constante em uma faixa de velocidade especifica, sem frear',
    quando: 'Aparece por volta de uma velocidade (ex: 90 km/h) e as vezes diminui acima dela.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'rodas', chance: 'alta', separar: 'Roda desbalanceada ou empenada e a causa mais comum. Olhe a borda interna do aro procurando amassado — sinal de buraco forte, o que tambem manda voce olhar a suspensao.' },
      { peca: 'pneus', chance: 'alta', separar: 'Pneu deformado ou com bolha vibra igual. Passe a mao por toda a banda e a lateral procurando ondulacao ou bolha (bolha condena o pneu na hora).' },
      { peca: 'semi-eixos', chance: 'baixa', separar: 'Se a vibracao aumenta ao ACELERAR e diminui ao tirar o pe na mesma velocidade, a origem e o semi-eixo, nao a roda.' },
    ],
  },
  {
    id: 'trepidacao-lenta',
    categoria: 'vibracao',
    sintoma: 'O carro inteiro treme na marcha lenta, e piora quando liga o ar-condicionado',
    quando: 'Parado, motor em marcha lenta, cambio em ponto morto ou marcha engatada.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'coxins-motor', chance: 'alta', separar: 'Com o freio de mao puxado, peca para alguem engatar a 1a e soltar a embreagem bem devagar. Se o motor pula muito para frente e para tras, os coxins venceram. Sao 4 e o conjunto custa bem — bom item de negociacao.' },
      { peca: 'valvula-iac', chance: 'media', separar: 'Se junto com a trepidacao a rotacao sobe e desce sozinha, o problema e marcha lenta instavel, nao coxim.' },
      { peca: 'velas', chance: 'media', separar: 'Falha em um cilindro treme o motor. Tire as velas: se uma esta visivelmente diferente das outras, achou o cilindro problematico.' },
    ],
  },
  {
    id: 'trepidacao-arrancada',
    categoria: 'vibracao',
    sintoma: 'O carro engasga e treme ao sair do lugar, como se a embreagem "agarrasse aos pulos"',
    quando: 'Saida da inercia, soltando a embreagem em 1a ou re.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'embreagem-disco', chance: 'alta', separar: 'Disco contaminado com oleo ou com material irregular trepida. Se junto disso a embreagem tambem patina em 4a, o kit inteiro esta no fim.' },
      { peca: 'volante-motor', chance: 'media', separar: 'Volante empenado ou vitrificado trepida mesmo com embreagem nova. Se o vendedor disser que a embreagem "foi trocada recente" e ainda trepida, e provavelmente o volante que nao foi retificado.' },
      { peca: 'coxins-motor', chance: 'media', separar: 'Coxim vencido amplifica qualquer trepidacao. Faca o teste do motor pulando antes de condenar a embreagem.' },
    ],
  },

  /* =========================================================== MOTOR === */
  {
    id: 'lenta-oscilando',
    categoria: 'motor',
    sintoma: 'A rotacao sobe e desce sozinha na marcha lenta, como se o motor estivesse "respirando"',
    quando: 'Parado, motor quente, sem pisar no acelerador.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'valvula-iac', chance: 'alta', separar: 'E ela que controla a rotacao com o pe fora do acelerador. Entupida de carvao, oscila. Ligue o ar: se a rotacao afunda e quase morre, reforca o diagnostico.' },
      { peca: 'corpo-borboleta', chance: 'alta', separar: 'Solte a mangueira de ar e olhe: crosta preta grossa em volta da borboleta atrapalha a lenta. Limpeza e barata e costuma resolver.' },
      { peca: 'coletor-admissao', chance: 'media', separar: 'Entrada de ar falsa pela junta tambem oscila. Procure sujeira preta acumulada em volta da juncao com o cabecote.' },
      { peca: 'sensor-map', chance: 'media', separar: 'Aqui o scanner OBD-II resolve: codigo P0107 ou P0108 aponta o MAP direto, sem chute.' },
    ],
  },
  {
    id: 'nao-pega-quente',
    categoria: 'motor',
    sintoma: 'O carro pega normal frio, mas custa a pegar (ou nao pega) depois de rodar e ficar parado uns minutos',
    quando: 'Motor quente, apos 5 a 15 minutos desligado.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'distribuidor', chance: 'alta', separar: 'ESTE E O DEFEITO CLASSICO DESSA GERACAO. A bobina e o modulo de ignicao ficam DENTRO do distribuidor e falham quando esquentam. Faca exatamente esse teste na frente do vendedor: rode, desligue, espere 10 minutos, tente ligar.' },
      { peca: 'bomba-combustivel', chance: 'media', separar: 'Gire a chave sem dar partida e ouca o zumbido de 2 segundos vindo de tras. Se o zumbido some quando quente, e a bomba, nao o distribuidor.' },
      { peca: 'central-injecao', chance: 'baixa', separar: 'Menos provavel, mas o scanner OBD-II mostra se ha codigo de sensor de rotacao ou de fase armazenado.' },
    ],
  },
  {
    id: 'falha-acelerar',
    categoria: 'motor',
    sintoma: 'O motor falha, engasga ou "tranca" ao acelerar',
    quando: 'Ao pisar, principalmente em aceleracao progressiva. Piora na chuva ou com umidade.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'cabos-vela', chance: 'alta', separar: 'Se piora na CHUVA ou com umidade, e fuga de corrente nos cabos. A noite, com o capo aberto e o motor ligado, procure faiscas azuis saltando dos cabos.' },
      { peca: 'velas', chance: 'alta', separar: 'Tire as quatro e compare. Se uma esta diferente das outras, o problema esta naquele cilindro. Vela preta e OLEOSA e sinal grave (aneis ou retentor).' },
      { peca: 'bicos-injetores', chance: 'media', separar: 'Se o engasgo e mais em aceleracao suave e melhora ao pisar fundo, suspeite de bico entupido. Limpeza em ultrassom e barata.' },
      { peca: 'filtro-combustivel', chance: 'media', separar: 'Se a falta de forca aparece so em alta rotacao e sob carga (subida), o filtro entupido e mais provavel que os bicos.' },
    ],
  },
  {
    id: 'sem-forca-alta',
    categoria: 'motor',
    sintoma: 'O carro anda normal em cidade mas "morre" em alta rotacao, como se batesse num muro',
    quando: 'Acima de 4.000 rpm, subida ou ultrapassagem.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'filtro-combustivel', chance: 'alta', separar: 'Intervalo e 60.000 km e quase ninguem troca. Pergunte quando foi. E a hipotese mais barata, comece por ela.' },
      { peca: 'catalisador', chance: 'media', separar: 'Catalisador entupido sufoca o motor no alto. Bata de leve por baixo com ele FRIO: chocalho interno indica colmeia quebrada. Cheiro de ovo podre reforca.' },
      { peca: 'bomba-combustivel', chance: 'media', separar: 'Bomba fraca nao sustenta pressao sob carga. Se o zumbido ao ligar a chave e muito alto e continuo, ela esta forcando.' },
      { peca: 'filtro-ar', chance: 'baixa', separar: 'Abra a caixa e olhe: leva 20 segundos e nao precisa de ferramenta. Filtro saturado e o mais facil de descartar.' },
    ],
  },
  {
    id: 'luz-injecao',
    categoria: 'motor',
    sintoma: 'A luz de injecao (o desenho do motor) esta acesa no painel',
    quando: 'Constante ou intermitente, com o motor ligado.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'central-injecao', chance: 'alta', separar: 'NAO ADIVINHE. Este carro e 1998, ja tem OBD-II: um scanner ELM327 barato le o codigo exato no soquete embaixo do painel. Sem ler o codigo voce esta negociando no escuro — e o vendedor sabe disso.' },
      { peca: 'sonda-lambda', chance: 'media', separar: 'Codigos P0135 / P0141 apontam a sonda. Consumo alto sem outro sintoma reforca.' },
      { peca: 'sensor-map', chance: 'media', separar: 'Codigos P0107 / P0108. Costuma vir junto com marcha lenta ruim.' },
      { peca: 'painel-instrumentos', chance: 'baixa', separar: 'ATENCAO AO CONTRARIO DISSO: se a luz NUNCA acende nem ao girar a chave, alguem pode ter removido a lampada para esconder defeito. Todas as luzes devem acender antes da partida.' },
    ],
  },

  /* ================================================ FUMACA E FLUIDOS === */
  {
    id: 'fumaca-azul',
    categoria: 'fluido',
    sintoma: 'Fumaca azulada no escapamento, com cheiro de oleo queimado',
    quando: 'Na partida, ou ao acelerar depois de segurar o motor freando numa descida.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'pistoes', chance: 'alta', separar: 'Aneis gastos deixam o oleo passar para a camara. Confirme com teste de compressao: diferenca maior que 10–15% entre o maior e o menor cilindro indica desgaste. Motor para retifica.' },
      { peca: 'valvulas', chance: 'alta', separar: 'Se a fumaca azul aparece SO na partida e depois some, sao os retentores de valvula (oleo escorre para a camara com o motor parado). Menos grave que anel, mas exige abrir o cabecote.' },
      { peca: 'vareta-oleo', chance: 'media', separar: 'Confirme o consumo: mais de 1 litro a cada 1.000 km e anormal. Pergunte ao vendedor quanto oleo ele completa entre trocas — a resposta costuma ser reveladora.' },
    ],
  },
  {
    id: 'fumaca-branca',
    categoria: 'fluido',
    sintoma: 'Fumaca branca densa e adocicada saindo do escapamento',
    quando: 'Com o motor JA QUENTE. Nao confundir com o vapor branco fino das manhas frias, que e normal.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Junta do cabecote deixando agua entrar na camara. Confirme abrindo a tampa de oleo com o motor frio: borra bege tipo maionese fecha o diagnostico. Se der isso, va embora.' },
      { peca: 'radiador', chance: 'media', separar: 'Se o nivel de agua cai sem poca no chao e ha fumaca branca, a agua esta indo para dentro do motor. Mesma conclusao.' },
    ],
  },
  {
    id: 'oleo-leitoso',
    categoria: 'fluido',
    sintoma: 'Borra bege ou creme, tipo maionese, na tampa do bocal de oleo ou na vareta',
    quando: 'Motor frio, tampa de oleo aberta.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Agua misturando com oleo. E o teste de 30 segundos mais importante da vistoria inteira. Faca ANTES de qualquer conversa de preco. Se der positivo, nao ha desconto que compense.' },
      { peca: 'vareta-oleo', chance: 'alta', separar: 'Confirme na vareta tambem, nao so na tampa. Uma leve umidade so na tampa pode ser condensacao de carro que so anda pouco; na vareta, e mistura de verdade.' },
    ],
  },
  {
    id: 'poca-oleo',
    categoria: 'fluido',
    sintoma: 'Mancha ou poca de oleo no chao onde o carro fica parado',
    quando: 'Depois de horas parado. Peca para o vendedor mover o carro e olhe o lugar onde estava.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'tampa-valvulas', chance: 'alta', separar: 'Vazamento mais comum e mais barato. Olhe toda a borda da tampa procurando oleo escorrido pela lateral do cabecote. Tire uma bobina e olhe o poco da vela: oleo ali confirma.' },
      { peca: 'carter', chance: 'media', separar: 'Olhe o bujao de dreno e a junta do carter. Verifique tambem se o carter esta amassado — indica que o carro raspou.' },
      { peca: 'distribuidor', chance: 'media', separar: 'O retentor do eixo do distribuidor vaza e o oleo entra na parte eletrica. Se ha oleo na base do distribuidor, isso explica tambem falha de ignicao.' },
      { peca: 'virabrequim', chance: 'baixa', separar: 'Retentor traseiro do virabrequim exige tirar o cambio para trocar. Se a mancha esta na juncao entre motor e cambio, o custo e alto — argumento forte de negociacao.' },
    ],
  },
  {
    id: 'perde-agua',
    categoria: 'fluido',
    sintoma: 'O nivel de agua do radiador cai e nao aparece vazamento no chao',
    quando: 'Ao longo de dias ou semanas. O vendedor costuma dizer que "so completa de vez em quando".',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Com o motor frio, tire a tampa do radiador e ligue o carro: se borbulhar forte e continuamente, ha gas de combustao passando para a agua. Junta de cabecote.' },
      { peca: 'radiador', chance: 'media', separar: 'Procure crosta branca ou esverdeada seca nos tanques plasticos laterais. Vazamento pequeno evapora antes de pingar no chao.' },
      { peca: 'bomba-agua', chance: 'media', separar: 'Crosta esbranquicada abaixo da tampa da correia dentada aponta bomba. Como fica atras da correia, a troca sai junto do kit inteiro.' },
      { peca: 'mangueiras-radiador', chance: 'baixa', separar: 'Aperte as mangueiras com o motor FRIO. Dura como cano ou mole e pegajosa, esta vencida.' },
    ],
  },

  /* ===================================================== TEMPERATURA === */
  {
    id: 'esquenta-demais',
    categoria: 'temperatura',
    sintoma: 'O ponteiro de temperatura passa da metade, principalmente parado no transito',
    quando: 'Parado ou andando devagar. Melhora quando o carro pega estrada.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'ventoinha', chance: 'alta', separar: 'MELHORAR EM MOVIMENTO E PIORAR PARADO aponta direto para a ventoinha, porque em movimento o vento faz o trabalho dela. Deixe o carro ligado parado ate a temperatura chegar na metade: ela TEM que ligar sozinha e voce vai ouvir.' },
      { peca: 'valvula-termostatica', chance: 'alta', separar: 'Se esquenta igual parado E andando, a suspeita muda para a termostatica travada fechada.' },
      { peca: 'radiador', chance: 'media', separar: 'Radiador entupido por dentro esquenta nas duas situacoes. Olhe se as aletas estao esverdeadas ou massacradas.' },
      { peca: 'bomba-agua', chance: 'media', separar: 'Rotor corroido gira mas nao circula. Costuma vir com ruido e crosta de vazamento na regiao da correia dentada.' },
    ],
  },
  {
    id: 'nao-esquenta',
    categoria: 'temperatura',
    sintoma: 'O ponteiro de temperatura quase nao sai do frio, mesmo depois de rodar',
    quando: 'Apos 10 minutos ou mais de uso normal.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'valvula-termostatica', chance: 'alta', separar: 'Travada aberta: a agua vai direto para o radiador e o motor nunca atinge a temperatura ideal. Peca barata, mas aumenta consumo e desgasta o motor a longo prazo.' },
      { peca: 'painel-instrumentos', chance: 'baixa', separar: 'Antes de condenar a termostatica, confirme que o ponteiro funciona. Um sensor ou ponteiro morto da o mesmo sintoma — e mascara um superaquecimento real.' },
    ],
  },

  /* =================================================== FREIO/DIRECAO === */
  {
    id: 'pedal-afunda',
    categoria: 'freio',
    sintoma: 'O pedal de freio afunda devagar quando voce mantem o pe pressionado',
    quando: 'Carro parado, motor desligado, pressao firme mantida por 30 segundos.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'fluido-freio', chance: 'alta', separar: 'Vedacao interna do cilindro mestre vazando por dentro. E o teste de seguranca mais importante que voce faz parado. Se o pedal afunda, NAO dirija o carro.' },
      { peca: 'pinca-freio', chance: 'media', separar: 'Se ha vazamento visivel em alguma roda, a perda e externa. Olhe atras de cada roda procurando umidade de fluido.' },
    ],
  },
  {
    id: 'pedal-esponjoso',
    categoria: 'freio',
    sintoma: 'O pedal de freio fica "mole", esponjoso, e vai perto do assoalho',
    quando: 'Toda frenagem.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'fluido-freio', chance: 'alta', separar: 'Ar no sistema ou fluido vencido que absorveu agua. Olhe a cor no reservatorio: deve ser amarelo claro. Marrom escuro confirma fluido vencido — intervalo e 2 anos e quase ninguem cumpre.' },
      { peca: 'tambor-freio', chance: 'media', separar: 'Lona traseira muito gasta aumenta o curso do pedal. Confira junto o curso do freio de mao: mais de 10 estalos reforca.' },
    ],
  },
  {
    id: 'puxa-freando',
    categoria: 'freio',
    sintoma: 'O carro puxa para um lado quando voce freia',
    quando: 'So durante a frenagem. Andando solto, vai reto.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'pinca-freio', chance: 'alta', separar: 'Pinca travada de um lado. Depois de rodar, aproxime a mao das duas rodas dianteiras (sem encostar): uma bem mais quente que a outra confirma. Compare tambem a espessura das pastilhas dos dois lados.' },
      { peca: 'pastilhas-freio', chance: 'media', separar: 'Pastilha contaminada com oleo ou gasta de forma desigual puxa. Costuma ser consequencia da pinca, nao causa.' },
    ],
  },
  {
    id: 'puxa-reto',
    categoria: 'freio',
    sintoma: 'O carro puxa para um lado andando reto, e voce precisa segurar o volante torto',
    quando: 'Velocidade constante em piso plano, sem frear.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'pneus', chance: 'alta', separar: 'Comece pelo mais barato: confira a calibragem dos quatro e o desgaste. Pneu comendo mais de um lado indica geometria fora. Se o carro para de puxar depois de calibrar, resolvido.' },
      { peca: 'terminal-direcao', chance: 'alta', separar: 'Folga no terminal desalinha a roda. Balance a roda em 3 e 9 horas procurando folga com estalo.' },
      { peca: 'bandeja-superior', chance: 'media', separar: 'Se o alinhamento "nao fica" depois de feito, o componente esta gasto — nao e servico mal feito. Bom argumento tecnico.' },
      { peca: 'manga-eixo', chance: 'baixa', separar: 'Manga entortada por batida. Procure trincas ou marcas de solda. Se achar, investigue o historico de sinistro do carro inteiro.' },
    ],
  },
  {
    id: 'volante-folgado',
    categoria: 'freio',
    sintoma: 'O volante tem folga: voce gira um pouco e as rodas nao mexem',
    quando: 'Motor ligado, carro parado ou andando devagar.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'terminal-direcao', chance: 'alta', separar: 'Mais barato e mais comum. Comece por aqui: balance cada roda em 3 e 9 horas. E item de seguranca — exija a troca, nao aceite desconto pequeno.' },
      { peca: 'caixa-direcao', chance: 'alta', separar: 'Se os terminais estao firmes e a folga persiste, e a cremalheira. Servico caro — um dos maiores abatimentos que voce consegue justificar.' },
      { peca: 'volante-direcao', chance: 'media', separar: 'A junta cardan da coluna tambem da folga. Balance o volante para cima e para baixo: folga vertical ou estalo aponta a coluna.' },
    ],
  },
  {
    id: 'carro-flutua',
    categoria: 'freio',
    sintoma: 'O carro balanca demais, flutua depois de lombada e parece "solto" na estrada',
    quando: 'Depois de qualquer irregularidade. Piora em velocidade.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'amortecedor-dianteiro', chance: 'alta', separar: 'TESTE DE BALANCO: apoie o peso no canto do carro, balance para baixo 3 vezes com forca e solte. O carro deve subir e PARAR. Se continuar balancando, o amortecedor venceu. Repita nos 4 cantos.' },
      { peca: 'suspensao-traseira', chance: 'alta', separar: 'Faca o mesmo teste atras. Abra o porta-malas e olhe as torres traseiras: e ali que da para ver se o amortecedor esta suando oleo.' },
      { peca: 'mola-dianteira', chance: 'media', separar: 'Meça a altura dos 4 cantos com fita metrica. Diferenca maior que 1,5 cm entre os lados indica mola cansada ou quebrada.' },
    ],
  },

  /* ================================================ CAMBIO/EMBREAGEM === */
  {
    id: 'arranha-segunda',
    categoria: 'cambio',
    sintoma: 'A marcha arranha ao engatar, principalmente a 2a com o carro frio',
    quando: 'Primeiros minutos de uso, motor e cambio frios. Melhora depois de quente.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'caixa-cambio', chance: 'alta', separar: 'Sincronizado da 2a gasto e o ponto fraco conhecido dessa caixa em alto km. CHEGUE CEDO e peca para nao ligarem o carro antes de voce: depois de quente o defeito some e voce nao ve.' },
      { peca: 'cilindro-embreagem', chance: 'media', separar: 'Se a embreagem nao desacopla direito, todas as marchas arranham, nao so a 2a. Verifique o nivel do fluido e se o pedal volta rapido.' },
      { peca: 'painel-console', chance: 'baixa', separar: 'Buchas do trambulador gastas atrapalham o engate. Balance a alavanca em ponto morto: folga grande com trepidacao aponta o trambulador, e o conserto e bem mais barato que o cambio.' },
    ],
  },
  {
    id: 'embreagem-patina',
    categoria: 'cambio',
    sintoma: 'A rotacao sobe mas o carro nao acelera junto, como se "escorregasse"',
    quando: 'Acelerando forte em marcha alta (4a ou 5a), ou em subida.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'embreagem-disco', chance: 'alta', separar: 'TESTE: a 50 km/h em 4a ou 5a, pise fundo. A velocidade deve subir junto com a rotacao. Se o ponteiro dispara e o carro nao vai, a embreagem patina. Cheiro de queimado depois de uma subida fecha o diagnostico.' },
      { peca: 'embreagem-plato', chance: 'alta', separar: 'Vai junto no kit. O custo esta na mao de obra de tirar o cambio, entao o valor e o mesmo — negocie o kit inteiro.' },
      { peca: 'volante-motor', chance: 'media', separar: 'Pergunte se o volante sera retificado. Kit novo em volante riscado dura pouco: e um custo escondido que voce deve trazer para a mesa.' },
    ],
  },
  {
    id: 'marcha-pula',
    categoria: 'cambio',
    sintoma: 'A marcha sai sozinha e volta para o ponto morto',
    quando: 'Em aceleracao ou desaceleracao, geralmente numa marcha especifica.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'caixa-cambio', chance: 'alta', separar: 'Desgaste interno de garfo ou luva. Exige abrir a caixa. Passe TODAS as marchas no test drive, inclusive a re, e insista na que pulou.' },
      { peca: 'coxins-motor', chance: 'media', separar: 'Coxim muito vencido deixa o conjunto se mover e pode desengatar. Faca o teste do motor pulando antes de condenar o cambio — e muito mais barato.' },
    ],
  },

  /* ======================================================== ELETRICA === */
  {
    id: 'luz-bateria',
    categoria: 'eletrica',
    sintoma: 'A luz vermelha da bateria fica acesa ou piscando com o motor ligado',
    quando: 'Depois da partida. Normal e apagar assim que o motor pega.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'alternador', chance: 'alta', separar: 'Nao esta carregando. Teste: com o motor ligado, acenda o farol alto, ligue o ar e o desembacador. Os farois nao podem escurecer visivelmente nem a rotacao cair muito.' },
      { peca: 'correia-auxiliar', chance: 'media', separar: 'Correia arrebentada ou muito frouxa nao gira o alternador. Olhe direto — e visivel a olho nu com o capo aberto e e o cenario mais barato.' },
      { peca: 'bateria', chance: 'baixa', separar: 'Bateria no fim nao acende essa luz sozinha, mas piora tudo. Procure a data no adesivo: mais de 3 anos ja e fim de vida.' },
    ],
  },
  {
    id: 'partida-arrastada',
    categoria: 'eletrica',
    sintoma: 'A partida gira devagar, "arrastando", antes do motor pegar',
    quando: 'Primeira partida do dia, principalmente em manha fria.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'bateria', chance: 'alta', separar: 'Comece pelo mais barato. Procure a data de fabricacao no adesivo e olhe os terminais: crosta branca ou esverdeada indica mau contato. Bateria e consumivel, todo vendedor aceita descontar.' },
      { peca: 'motor-partida', chance: 'media', separar: 'Se a bateria e nova e a partida ainda arrasta, sao as escovas do motor de partida. IMPORTANTE: peca o carro FRIO e de a partida voce mesmo — muito vendedor liga antes para esconder isso.' },
      { peca: 'chicote-eletrico', chance: 'baixa', separar: 'Cabo de massa oxidado da o mesmo sintoma e custa quase nada. Olhe a ligacao do cabo negativo com a carroceria e o motor.' },
    ],
  },
  {
    id: 'luzes-nao-acendem',
    categoria: 'eletrica',
    sintoma: 'Alguma luz externa nao funciona: farol, pisca, luz de freio ou de re',
    quando: 'Teste com ajuda de outra pessoa, com o carro parado.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'farois-lanternas', chance: 'alta', separar: 'Comece pelo obvio: lampada queimada ou soquete oxidado. Luz de FREIO e a que quase ninguem testa e que reprova em vistoria — precisa de alguem olhando enquanto voce pisa.' },
      { peca: 'chicote-eletrico', chance: 'media', separar: 'Abra a caixa de fusiveis e procure gambiarra: fusivel de valor errado, fio solto, fita isolante. Emenda mal feita justifica desconto grande.' },
      { peca: 'painel-instrumentos', chance: 'baixa', separar: 'Se o aviso no painel tambem nao acende, pode ser a lampada do painel — ou alguem a removeu de proposito. Gire a chave: TODAS as luzes devem acender antes da partida.' },
    ],
  },
];

