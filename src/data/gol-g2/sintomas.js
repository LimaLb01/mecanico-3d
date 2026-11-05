/**
 * Indice reverso do Gol Special 1.0 — do SINTOMA para a peca.
 *
 * Varios sintomas aqui tem candidatos DIFERENTES do Civic, mesmo com a mesma
 * descricao. Os tres casos que mais mudam:
 *   - "tec-tec" a frio no Gol e tucho hidraulico enchendo (normal nos primeiros
 *     segundos); no Civic e valvula desregulada (manutencao atrasada)
 *   - falha a quente no Gol e bobina ou sensor de rotacao; no Civic e distribuidor
 *   - volante pesado parado no Gol e NORMAL (direcao mecanica), nao defeito
 */

export const SINTOMAS = [
  /* ============================================================ RUIDO === */
  {
    id: 'tec-tec-frio',
    categoria: 'ruido',
    sintoma: 'Um "tec-tec-tec" metalico no alto do motor logo depois da partida',
    quando: 'Motor frio, primeiros segundos. Costuma diminuir ou sumir quando esquenta.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'valvulas', chance: 'alta', separar: 'ATENCAO: nos primeiros 10 a 30 segundos isso e NORMAL — sao os tuchos hidraulicos enchendo de oleo. So vire preocupacao se continuar depois de 1 minuto ou nao sumir a quente. Diferente do Civic, aqui NAO existe regulagem de valvula que resolva.' },
      { peca: 'bomba-oleo', chance: 'media', separar: 'Se junto disso a luz de oleo demora a apagar ou pisca em lenta, o problema e pressao, nao o tucho. Isso e grave.' },
      { peca: 'coletor-escape', chance: 'media', separar: 'Coletor trincado tambem faz "tec-tec" a frio, mas o som e mais alto e "soprado", vem da lateral do motor e nao de cima. Procure fuligem preta na juncao com o cabecote.' },
      { peca: 'vareta-oleo', chance: 'baixa', separar: 'Oleo velho e cheio de borra impede o tucho de encher. Antes de condenar peca, olhe a condicao do oleo na vareta.' },
    ],
  },
  {
    id: 'toc-lombada',
    categoria: 'ruido',
    sintoma: 'Um "toc-toc" seco ao passar devagar em lombada ou buraco',
    quando: 'Baixa velocidade, piso irregular.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'bieleta', chance: 'alta', separar: 'Causa mais comum e mais barata. Com o carro suspenso, segure a bieleta e balance: folga confirma. Comece por aqui.' },
      { peca: 'bandeja-suspensao', chance: 'alta', separar: 'Olhe as buchas de borracha nas pontas do braco. O barulho da bucha e mais surdo que o da bieleta.' },
      { peca: 'coxim-amortecedor', chance: 'media', separar: 'Se o barulho tambem aparece ao girar o volante com o carro PARADO, e coxim.' },
      { peca: 'pivo-suspensao', chance: 'media', separar: 'Balance a roda em 12 e 6 horas. Diferente da bieleta, o pivo tambem estala ao esterçar.' },
      { peca: 'amortecedor-traseiro', chance: 'baixa', separar: 'Se o barulho vem de TRAS, olhe os amortecedores traseiros e os batentes pelo porta-malas.' },
    ],
  },
  {
    id: 'estalo-curva-fechada',
    categoria: 'ruido',
    sintoma: 'Estalo ritmado ao fazer curva fechada devagar, tipo manobra',
    quando: 'Volante todo esterçado, velocidade de manobra.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'semi-eixos', chance: 'alta', separar: 'Praticamente certeza: homocinetica externa gasta. Faca um circulo completo esterçando todo para cada lado — o lado que estala mais alto e o defeituoso. Confirme olhando a coifa rasgada e a graxa espalhada.' },
    ],
  },
  {
    id: 'zumbido-curva',
    categoria: 'ruido',
    sintoma: 'Zumbido grave tipo aviao que aumenta com a velocidade',
    quando: 'Acima de 50 km/h. Muda ao fazer curva suave.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'manga-eixo', chance: 'alta', separar: 'TESTE DECISIVO: a 60–80 km/h faca uma curva suave para cada lado. Se o zumbido aumenta numa direcao, o rolamento ruim e o do lado OPOSTO ao da curva.' },
      { peca: 'pneus', chance: 'media', separar: 'Pneu com desgaste irregular tambem zumbe, mas o ruido NAO muda ao curvar.' },
      { peca: 'caixa-cambio', chance: 'baixa', separar: 'Zumbido de cambio muda ao trocar de marcha na mesma velocidade; o de rolamento nao liga para a marcha.' },
    ],
  },
  {
    id: 'chiado-embreagem',
    categoria: 'ruido',
    sintoma: 'Chiado ou zumbido que aparece quando voce pisa na embreagem',
    quando: 'Motor ligado, carro parado, ponto morto.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'embreagem-plato', chance: 'alta', separar: 'Se o ruido APARECE ao pisar e SOME ao tirar o pe, e o rolamento de embreagem. Teste de 10 segundos com o carro parado.' },
      { peca: 'cabo-embreagem', chance: 'media', separar: 'Ruido aspero de "raspando" ao pisar, junto com pedal duro, aponta cabo ressecado por dentro — peca muito mais barata que o kit.' },
      { peca: 'caixa-cambio', chance: 'baixa', separar: 'Se o ruido existe com o pe FORA e some ao pisar, o problema esta dentro do cambio.' },
    ],
  },
  {
    id: 'chiado-partida',
    categoria: 'ruido',
    sintoma: 'Chiado agudo tipo assobio ao dar a partida',
    quando: 'Primeiros segundos apos ligar, principalmente de manha.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'correia-alternador', chance: 'alta', separar: 'Correia frouxa ou vitrificada patina e assobia. Olhe as ranhuras: trinca, fiapo ou brilho de vidro confirmam. Caso mais comum e mais barato.' },
      { peca: 'tensor-correia', chance: 'media', separar: 'Se e um zumbido continuo e nao um assobio no arranque, e rolamento de tensor da correia DENTADA — muito mais serio, porque tensor travado arrebenta a correia e neste motor isso destroi o cabecote.' },
      { peca: 'alternador', chance: 'baixa', separar: 'Rolamento do alternador zumbe continuamente, mesmo depois do motor estabilizar.' },
    ],
  },
  {
    id: 'batida-grave-motor',
    categoria: 'ruido',
    sintoma: 'Batida grave e ritmada no fundo do motor, mais forte ao acelerar',
    quando: 'Marcha lenta e sob carga. Piora com o motor quente.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'virabrequim', chance: 'alta', separar: 'Bronzina batendo. Nao ha teste caseiro que salve. Num Gol, motor completo usado ou retificado e relativamente barato — mas isso muda o valor do negocio por completo.' },
      { peca: 'bomba-oleo', chance: 'media', separar: 'Se a luz de oleo tambem pisca em lenta a quente, pode ter comecado por falta de pressao. Desfecho igual.' },
      { peca: 'pistoes', chance: 'media', separar: 'Peca teste de compressao para saber o estado real antes de qualquer proposta.' },
    ],
  },
  {
    id: 'rangido-frear',
    categoria: 'ruido',
    sintoma: 'Chiado agudo ou rangido metalico ao pisar no freio',
    quando: 'Toda frenagem, ou so nas primeiras do dia.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'pastilhas-freio', chance: 'alta', separar: 'Chiado agudo fino e o sensor de desgaste avisando. Rangido metalico GROSSO ja e a chapa comendo o disco — ai o disco vai junto.' },
      { peca: 'disco-freio', chance: 'media', separar: 'Passe a unha na superficie: borda alta na ponta indica disco muito gasto. Disco solido gasta mais rapido que ventilado.' },
      { peca: 'tambor-freio', chance: 'baixa', separar: 'Se o rangido vem de TRAS, sao as lonas. Confira junto o curso do freio de mao.' },
    ],
  },

  /* ========================================================= VIBRACAO === */
  {
    id: 'volante-treme-freando',
    categoria: 'vibracao',
    sintoma: 'O volante treme quando voce pisa no freio em velocidade',
    quando: 'Frenagem acima de 70 km/h. Some ao soltar o freio.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'disco-freio', chance: 'alta', separar: 'Disco empenado e a causa quase certa. Como o disco aqui e SOLIDO (nao ventilado), ele aquece e empena com mais facilidade que num Civic. Procure manchas azuladas na pista.' },
      { peca: 'pinca-freio', chance: 'media', separar: 'Pinca travando aquece um disco so e empena ele. Depois de rodar, compare o calor das duas rodas dianteiras.' },
    ],
  },
  {
    id: 'vibracao-velocidade',
    categoria: 'vibracao',
    sintoma: 'Vibracao constante numa faixa de velocidade, sem frear',
    quando: 'Aparece por volta de uma velocidade e as vezes some acima dela.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'rodas', chance: 'alta', separar: 'Roda desbalanceada ou empenada e a causa mais comum. Olhe a borda interna do aro procurando amassado.' },
      { peca: 'pneus', chance: 'alta', separar: 'Passe a mao por toda a banda e a lateral procurando ondulacao ou bolha.' },
      { peca: 'semi-eixos', chance: 'baixa', separar: 'Se a vibracao aumenta ao ACELERAR e diminui ao tirar o pe na mesma velocidade, e o semi-eixo.' },
    ],
  },
  {
    id: 'trepidacao-lenta',
    categoria: 'vibracao',
    sintoma: 'O carro treme na marcha lenta e a alavanca de cambio vibra muito',
    quando: 'Parado, motor em lenta.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'coxins-motor', chance: 'alta', separar: 'Com freio de mao puxado, alguem engata a 1a e solta a embreagem devagar: se o conjunto pular muito, os coxins venceram. Como o motor e longitudinal, o coxim traseiro sustenta o cambio e a vibracao vai direto para a alavanca.' },
      { peca: 'valvula-iac', chance: 'media', separar: 'Se junto a rotacao sobe e desce sozinha, o problema e a marcha lenta, nao o coxim.' },
      { peca: 'velas', chance: 'media', separar: 'Falha em um cilindro treme o motor. Tire as velas e compare: se uma esta diferente, achou o cilindro.' },
    ],
  },

  /* =========================================================== MOTOR === */
  {
    id: 'morre-andando',
    categoria: 'motor',
    sintoma: 'O carro morre sozinho andando e so volta a pegar depois de esfriar',
    quando: 'Depois de rodar bastante, com o motor bem quente.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'sensor-rotacao', chance: 'alta', separar: 'ESTE E O DEFEITO MAIS CLASSICO DO GOL. Sem sinal do sensor, a injecao nao da faisca e o motor apaga na hora. Teste: rode ate esquentar, desligue, espere 10 minutos e tente ligar. Se gira e nao pega, e ele. A peca e barata.' },
      { peca: 'bobina-ignicao', chance: 'alta', separar: 'Mesmo sintoma. A diferenca pratica pouco importa para negociar: as duas sao baratas. O que importa e nao aceitar que chamem isso de "so uma revisao".' },
      { peca: 'bomba-combustivel', chance: 'media', separar: 'Gire a chave sem dar partida e ouca o zumbido de 2 segundos vindo de tras. Se sumir quando quente, e a bomba.' },
      { peca: 'chicote-eletrico', chance: 'media', separar: 'Mau contato no chicote ou massa ruim da o mesmo sintoma e e o mais dificil de achar. Mexa nos conectores com o motor ligado e veja se ele falha.' },
    ],
  },
  {
    id: 'nao-pega-quente',
    categoria: 'motor',
    sintoma: 'Pega normal frio, mas custa a pegar depois de rodar e ficar parado',
    quando: 'Motor quente, apos 5 a 15 minutos desligado.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'bobina-ignicao', chance: 'alta', separar: 'Bobina com enrolamento aberto a quente perde faisca. Repare que este carro NAO tem distribuidor — se alguem sugerir trocar tampa e rotor, esta falando de outro carro.' },
      { peca: 'sensor-rotacao', chance: 'alta', separar: 'Mesma familia de defeito. Faca o teste do motor quente na frente do vendedor.' },
      { peca: 'bomba-combustivel', chance: 'media', separar: 'Teste do zumbido ao girar a chave.' },
    ],
  },
  {
    id: 'lenta-oscilando',
    categoria: 'motor',
    sintoma: 'A rotacao sobe e desce sozinha na marcha lenta',
    quando: 'Parado, motor quente, sem pisar no acelerador.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'valvula-iac', chance: 'alta', separar: 'E ela que controla a rotacao com o pe fora. Entupida de carvao, oscila.' },
      { peca: 'corpo-borboleta', chance: 'alta', separar: 'Solte a mangueira de ar e olhe: crosta preta grossa em volta da borboleta atrapalha a lenta. Limpeza e barata e costuma resolver.' },
      { peca: 'coletor-admissao', chance: 'media', separar: 'Entrada de ar falsa pela junta. Procure sujeira preta acumulada na juncao com o cabecote.' },
    ],
  },
  {
    id: 'falha-acelerar',
    categoria: 'motor',
    sintoma: 'O motor falha, engasga ou "tranca" ao acelerar',
    quando: 'Ao pisar. Piora na chuva ou com umidade.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'cabos-vela', chance: 'alta', separar: 'Se piora na CHUVA, e fuga de corrente. A noite, com o capo aberto e o motor ligado, procure faiscas azuis saltando dos cabos.' },
      { peca: 'velas', chance: 'alta', separar: 'Tire as quatro e compare. Vela preta e OLEOSA e sinal grave.' },
      { peca: 'bobina-ignicao', chance: 'media', separar: 'Bobina trincada tambem vaza corrente. Olhe o corpo dela procurando trilha preta de fuga.' },
      { peca: 'bicos-injetores', chance: 'media', separar: 'Se o engasgo e em aceleracao suave e melhora ao pisar fundo, suspeite de bico entupido.' },
    ],
  },
  {
    id: 'sem-forca-alta',
    categoria: 'motor',
    sintoma: 'Anda normal em cidade mas nao desenvolve em subida ou ultrapassagem',
    quando: 'Alta rotacao e sob carga.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'filtro-combustivel', chance: 'alta', separar: 'Intervalo curto (20 a 30 mil km) e quase ninguem troca. E a hipotese mais barata — comece por ela.' },
      { peca: 'catalisador', chance: 'media', separar: 'Catalisador entupido sufoca o motor. Bata por baixo com ele frio: chocalho indica colmeia quebrada.' },
      { peca: 'bomba-combustivel', chance: 'media', separar: 'Bomba fraca nao sustenta pressao sob carga.' },
      { peca: 'filtro-ar', chance: 'baixa', separar: 'Abra a caixa e olhe — 20 segundos, o mais facil de descartar.' },
      { peca: 'pistoes', chance: 'baixa', separar: 'Um 1.0 de 25 anos com compressao baixa simplesmente nao sobe ladeira. Teste de compressao resolve a duvida.' },
    ],
  },
  {
    id: 'luz-injecao',
    categoria: 'motor',
    sintoma: 'A luz de injecao esta acesa no painel',
    quando: 'Constante ou intermitente.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'central-injecao', chance: 'alta', separar: 'NAO ADIVINHE: leve um scanner e leia o codigo. Sem isso voce negocia no escuro e o vendedor sabe.' },
      { peca: 'sonda-lambda', chance: 'media', separar: 'Consumo alto sem outro sintoma reforca a suspeita da sonda.' },
      { peca: 'painel-instrumentos', chance: 'baixa', separar: 'ATENCAO AO CONTRARIO: se a luz NUNCA acende nem ao girar a chave, a lampada pode ter sido removida para esconder defeito.' },
    ],
  },

  /* ================================================ FUMACA E FLUIDOS === */
  {
    id: 'fumaca-azul',
    categoria: 'fluido',
    sintoma: 'Fumaca azulada no escapamento, com cheiro de oleo queimado',
    quando: 'Na partida ou ao acelerar depois de segurar o motor freando.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'pistoes', chance: 'alta', separar: 'Aneis gastos. Confirme com teste de compressao: diferenca acima de 15% entre cilindros e motivo para negociar pesado ou desistir.' },
      { peca: 'valvulas', chance: 'alta', separar: 'Se a fumaca azul aparece SO na partida e depois some, sao os retentores de valvula.' },
      { peca: 'vareta-oleo', chance: 'media', separar: 'Pergunte quanto oleo o dono completa entre trocas. A resposta costuma ser reveladora.' },
    ],
  },
  {
    id: 'fumaca-branca',
    categoria: 'fluido',
    sintoma: 'Fumaca branca densa e adocicada com o motor ja quente',
    quando: 'Motor quente. Nao confundir com o vapor fino das manhas frias.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Junta queimada ou cabecote empenado deixando agua entrar na camara. Confirme abrindo a tampa de oleo com o motor frio: borra creme fecha o diagnostico. Este e O defeito caro deste motor.' },
    ],
  },
  {
    id: 'oleo-leitoso',
    categoria: 'fluido',
    sintoma: 'Borra bege tipo maionese na tampa do bocal de oleo ou na vareta',
    quando: 'Motor frio.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Agua misturando com oleo. E o teste de 30 segundos mais importante da vistoria. Faca ANTES de falar de preco. Num carro deste valor, cabecote aberto muitas vezes nao compensa.' },
      { peca: 'vareta-oleo', chance: 'alta', separar: 'Confirme na vareta tambem: umidade so na tampa pode ser condensacao de carro que anda pouco; na vareta e mistura de verdade.' },
    ],
  },
  {
    id: 'perde-agua',
    categoria: 'fluido',
    sintoma: 'O nivel de agua cai e nao aparece vazamento no chao',
    quando: 'Ao longo de dias. O vendedor costuma dizer que "so completa de vez em quando".',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'Com o motor frio, tire a tampa do radiador e ligue o carro: borbulhar forte e continuo indica gas de combustao na agua.' },
      { peca: 'radiador', chance: 'media', separar: 'Procure crosta branca ou esverdeada nos tanques plasticos laterais.' },
      { peca: 'bomba-agua', chance: 'media', separar: 'Crosta abaixo da tampa da correia dentada aponta bomba — e ela so troca junto com a correia.' },
      { peca: 'reservatorio-expansao', chance: 'baixa', separar: 'Verifique se nao e simplesmente a tampa do reservatorio ou do radiador sem vedar.' },
    ],
  },
  {
    id: 'poca-oleo',
    categoria: 'fluido',
    sintoma: 'Mancha ou poca de oleo no chao onde o carro fica parado',
    quando: 'Depois de horas parado.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'tampa-valvulas', chance: 'alta', separar: 'Vazamento mais comum e mais barato. Olhe toda a borda da tampa. Verifique tambem o respiro do motor entupido, que pressuriza e empurra oleo pelas juntas.' },
      { peca: 'carter', chance: 'media', separar: 'Olhe o bujao e a junta. Verifique se o carter esta amassado — Gol e baixo e raspa.' },
      { peca: 'virabrequim', chance: 'baixa', separar: 'Retentor traseiro exige separar motor e cambio. Se a mancha esta na juncao entre os dois, o custo sobe muito.' },
    ],
  },

  /* ===================================================== TEMPERATURA === */
  {
    id: 'esquenta-demais',
    categoria: 'temperatura',
    sintoma: 'O ponteiro de temperatura passa da metade, principalmente parado no transito',
    quando: 'Parado ou devagar. Melhora quando pega estrada.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'ventoinha', chance: 'alta', separar: 'MELHORAR EM MOVIMENTO E PIORAR PARADO aponta direto para a ventoinha. Deixe o carro ligado parado ate a metade da temperatura: ela TEM que ligar sozinha. Verifique tambem o sensor no radiador e o rele — sao baratos.' },
      { peca: 'valvula-termostatica', chance: 'alta', separar: 'Se esquenta igual parado E andando, a suspeita muda para a termostatica travada fechada.' },
      { peca: 'radiador', chance: 'media', separar: 'Radiador entupido esquenta nas duas situacoes.' },
      { peca: 'bomba-agua', chance: 'media', separar: 'Rotor corroido gira mas nao circula. Costuma vir com ruido e crosta na regiao da correia dentada.' },
    ],
  },
  {
    id: 'ja-ferveu',
    categoria: 'temperatura',
    sintoma: 'O vendedor menciona que o carro "ja ferveu uma vez"',
    quando: 'Historico relatado, nao sintoma atual.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'cabecote', chance: 'alta', separar: 'ESTE E O PONTO CRITICO DESTE MOTOR: cabecote de aluminio sobre bloco de ferro empena com facilidade quando ferve. Abra a tampa de oleo e procure borra creme, e peca teste de compressao. Um "ferveu mas nao deu nada" precisa ser provado, nao acreditado.' },
      { peca: 'valvulas', chance: 'media', separar: 'Superaquecimento tambem queima valvula. Compressao baixa em um cilindro isolado aponta para isso.' },
      { peca: 'ventoinha', chance: 'media', separar: 'Descubra POR QUE ferveu. Se a causa (ventoinha, termostatica, radiador) nao foi resolvida, vai ferver de novo.' },
    ],
  },

  /* =================================================== FREIO/DIRECAO === */
  {
    id: 'volante-pesado',
    categoria: 'freio',
    sintoma: 'O volante e muito pesado para manobrar com o carro parado',
    quando: 'Estacionando, esterçando com o carro parado ou quase.',
    gravidade: 'baixo',
    candidatos: [
      { peca: 'caixa-direcao', chance: 'alta', separar: 'ISSO PROVAVELMENTE NAO E DEFEITO. A versao Special tem direcao MECANICA, sem assistencia — volante pesado parado e a caracteristica normal dela. Nao aceite que vendam isso como "a bomba da direcao esta ruim": este carro nao tem bomba.' },
      { peca: 'pneus', chance: 'media', separar: 'Antes de tudo, calibre os pneus. Pneu murcho deixa a direcao mecanica muito mais pesada.' },
      { peca: 'terminal-direcao', chance: 'baixa', separar: 'Se alem de pesado houver ponto duro ou travamento em parte do curso, ai sim ha desgaste no sistema.' },
    ],
  },
  {
    id: 'pedal-afunda',
    categoria: 'freio',
    sintoma: 'O pedal de freio afunda devagar com o pe pressionado',
    quando: 'Carro parado, motor desligado, pressao mantida por 30 segundos.',
    gravidade: 'critico',
    candidatos: [
      { peca: 'fluido-freio', chance: 'alta', separar: 'Vedacao interna do cilindro mestre vazando por dentro. E o teste de seguranca mais importante feito parado. Se afunda, NAO dirija o carro.' },
      { peca: 'tambor-freio', chance: 'media', separar: 'Se ha vazamento visivel na parte interna do pneu traseiro, e cilindro de roda.' },
    ],
  },
  {
    id: 'puxa-freando',
    categoria: 'freio',
    sintoma: 'O carro puxa para um lado quando voce freia',
    quando: 'So durante a frenagem.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'pinca-freio', chance: 'alta', separar: 'Pinca travada de um lado. Depois de rodar, compare o calor das duas rodas dianteiras com a mao proxima (sem encostar).' },
      { peca: 'pastilhas-freio', chance: 'media', separar: 'Pastilha contaminada ou gasta de forma desigual. Costuma ser consequencia da pinca.' },
    ],
  },
  {
    id: 'carro-flutua',
    categoria: 'freio',
    sintoma: 'O carro balanca demais e parece "solto" na estrada',
    quando: 'Depois de qualquer irregularidade. Piora com passageiros.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'amortecedor-dianteiro', chance: 'alta', separar: 'TESTE DE BALANCO: apoie o peso no canto, balance 3 vezes e solte. Deve subir e PARAR.' },
      { peca: 'amortecedor-traseiro', chance: 'alta', separar: 'Repita atras. Abra o porta-malas e olhe as torres traseiras procurando vazamento e ferrugem.' },
      { peca: 'mola-dianteira', chance: 'media', separar: 'Meça a altura dos 4 cantos com fita metrica. Diferenca acima de 1,5 cm indica mola cansada — ou molas cortadas para rebaixar, o que e pior.' },
      { peca: 'eixo-torcao', chance: 'baixa', separar: 'Buchas do eixo de torcao ressecadas deixam a traseira "andando" em curva. Olhe as duas buchas grandes onde o eixo prende na carroceria.' },
    ],
  },

  /* ================================================ CAMBIO/EMBREAGEM === */
  {
    id: 'engate-impreciso',
    categoria: 'cambio',
    sintoma: 'A alavanca fica "solta" e voce precisa procurar a marcha',
    quando: 'Sempre, principalmente ao engatar 1a e re.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'trambulador', chance: 'alta', separar: 'PONTO FRACO CONHECIDO DO GOL e a hipotese mais provavel de longe. Com o motor desligado, balance a alavanca em ponto morto: folga grande com a alavanca dancando confirma buchas gastas. Conserto BARATO.' },
      { peca: 'caixa-cambio', chance: 'baixa', separar: 'Se alem da imprecisao houver arranhado ao engatar ou marcha pulando, ai sim o problema esta dentro da caixa — e o custo e outro. Nao deixe chamarem trambulador de cambio.' },
      { peca: 'coxins-motor', chance: 'baixa', separar: 'Coxim vencido desalinha o conjunto e piora o engate. Faca o teste do motor pulando.' },
    ],
  },
  {
    id: 'arranha-marcha',
    categoria: 'cambio',
    sintoma: 'A marcha arranha ao engatar, principalmente com o carro frio',
    quando: 'Primeiros minutos de uso.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'caixa-cambio', chance: 'alta', separar: 'Sincronizado gasto. CHEGUE CEDO e peca para nao ligarem o carro antes de voce: depois de quente o defeito some.' },
      { peca: 'cabo-embreagem', chance: 'alta', separar: 'Cabo esticado nao desacopla a embreagem por completo e TODAS as marchas arranham, nao so uma. Verifique o curso do pedal antes de condenar a caixa — o cabo custa uma fracao.' },
      { peca: 'trambulador', chance: 'media', separar: 'Buchas gastas atrapalham o engate e podem parecer sincronizado ruim.' },
    ],
  },
  {
    id: 'embreagem-patina',
    categoria: 'cambio',
    sintoma: 'A rotacao sobe mas o carro nao acelera junto',
    quando: 'Acelerando forte em marcha alta ou em subida.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'embreagem-disco', chance: 'alta', separar: 'TESTE: a 50 km/h em 4a ou 5a, pise fundo. Se o ponteiro dispara e o carro nao vai, patina. Cheiro de queimado apos subida confirma.' },
      { peca: 'embreagem-plato', chance: 'alta', separar: 'Vai junto no kit — o custo e o mesmo. Negocie o kit inteiro.' },
      { peca: 'volante-motor', chance: 'media', separar: 'Pergunte se o volante sera retificado. Kit novo em volante riscado dura pouco.' },
    ],
  },
  {
    id: 'pedal-embreagem-duro',
    categoria: 'cambio',
    sintoma: 'O pedal de embreagem esta duro, aspero ou nao volta sozinho',
    quando: 'Sempre.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'cabo-embreagem', chance: 'alta', separar: 'Aqui a embreagem e por CABO, nao hidraulica. Pedal duro, aspero ou preguicoso para voltar e quase sempre cabo ressecado por dentro. Peca barata — e ela arrebentar deixa o carro parado na hora.' },
      { peca: 'embreagem-plato', chance: 'media', separar: 'Se o cabo estiver novo e o pedal continuar muito duro, o plato pode estar no fim.' },
    ],
  },

  /* ======================================================== ELETRICA === */
  {
    id: 'luz-bateria',
    categoria: 'eletrica',
    sintoma: 'A luz vermelha da bateria fica acesa ou piscando com o motor ligado',
    quando: 'Depois da partida.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'alternador', chance: 'alta', separar: 'Nao esta carregando. Teste: com o motor ligado, ligue farol alto, desembacador e ventilador no maximo — os farois nao podem escurecer visivelmente.' },
      { peca: 'correia-alternador', chance: 'media', separar: 'Correia arrebentada ou frouxa nao gira o alternador. Olhe direto: e o cenario mais barato.' },
      { peca: 'chicote-eletrico', chance: 'media', separar: 'Cabo de massa oxidado da sintoma parecido e custa quase nada.' },
    ],
  },
  {
    id: 'eletrica-maluca',
    categoria: 'eletrica',
    sintoma: 'Coisas eletricas funcionam "quando querem": luz que pisca, painel que apaga, acessorio que para',
    quando: 'Intermitente, as vezes ao passar em buraco.',
    gravidade: 'alto',
    candidatos: [
      { peca: 'chicote-eletrico', chance: 'alta', separar: 'ESTE E O PESADELO MAIS COMUM DO GOL G2. Abra a caixa de fusiveis e procure gambiarra: fio solto, fita isolante, fusivel improvisado. Mexa nos conectores com o motor ligado e veja se algo pisca.' },
      { peca: 'bateria', chance: 'media', separar: 'Terminal frouxo ou sulfatado causa sintoma identico e e trivial de resolver — cheque primeiro.' },
      { peca: 'central-injecao', chance: 'baixa', separar: 'Se junto disso o motor falha ou apaga, leve o carro para leitura de codigo antes de qualquer proposta.' },
    ],
  },
  {
    id: 'partida-arrastada',
    categoria: 'eletrica',
    sintoma: 'A partida gira devagar, "arrastando", antes do motor pegar',
    quando: 'Primeira partida do dia.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'bateria', chance: 'alta', separar: 'Comece pelo mais barato: data no adesivo e estado dos terminais.' },
      { peca: 'motor-partida', chance: 'media', separar: 'Se a bateria e nova e ainda arrasta, sao as escovas. PECA O CARRO FRIO e de a partida voce mesmo.' },
      { peca: 'chicote-eletrico', chance: 'baixa', separar: 'Cabo de massa oxidado da o mesmo sintoma e custa quase nada.' },
    ],
  },
  {
    id: 'luzes-nao-acendem',
    categoria: 'eletrica',
    sintoma: 'Alguma luz externa nao funciona: farol, pisca, luz de freio ou de re',
    quando: 'Teste com ajuda, com o carro parado.',
    gravidade: 'medio',
    candidatos: [
      { peca: 'farois-lanternas', chance: 'alta', separar: 'Comece pelo obvio: lampada queimada ou soquete oxidado. Luz de FREIO e a que quase ninguem testa e que reprova em vistoria.' },
      { peca: 'chicote-eletrico', chance: 'alta', separar: 'No Gol, mau contato e oxidacao de soquete sao mais comuns que lampada queimada. Abra a caixa de fusiveis e procure improviso.' },
      { peca: 'painel-instrumentos', chance: 'baixa', separar: 'Se o aviso no painel tambem nao acende, pode ser a lampada do painel — ou alguem a removeu de proposito.' },
    ],
  },
];
