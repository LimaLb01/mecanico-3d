/**
 * Pacote do veiculo Honda Civic Sedan LX 1.6 16V 1998 (EK / EJ6).
 *
 * Reune tudo o que o app precisa saber sobre este carro: ficha, pecas,
 * sintomas, roteiro de vistoria, roteiro do tour e o construtor da cena 3D.
 * O catalogo (src/data/catalogo.js) so conhece este formato.
 */

import { VEICULO } from './ficha.js';
import { PECAS_MOTOR } from './parts-motor.js';
import { PECAS_CHASSI } from './parts-chassi.js';
import { SINTOMAS } from './sintomas.js';

import { construirMotor } from '../../modules/civic-ek/engine.js';
import {
  construirCarroceria, construirRodas, construirSuspensao, construirTransmissao,
  construirDirecao, construirArrefecimento, construirEletrica,
  construirEscapeCombustivel, construirInterior, construirIluminacao,
  construirComandoFreio,
} from '../../modules/civic-ek/chassis.js';

/** Roteiro do Modo Vistoria, na ordem em que a inspecao acontece. */
const ETAPAS = [
  {
    titulo: '1. Carro FRIO e desligado',
    descricao: 'Chegue antes do combinado e peca para NAO ligarem o carro. Metade dos defeitos desse Civic so aparece com o motor frio — depois de quente, somem.',
    itens: ['vareta-oleo', 'correia-dentada', 'tensor-correia', 'bomba-agua', 'radiador',
      'reservatorio-expansao', 'mangueiras-radiador', 'correia-auxiliar', 'tampa-valvulas',
      'filtro-ar', 'filtro-oleo', 'fluido-freio', 'cilindro-embreagem', 'bateria', 'caixa-fusiveis', 'lava-vidros'],
  },
  {
    titulo: '2. Chave na posicao ligado, sem dar partida',
    descricao: 'Dois testes de 5 segundos que denunciam o golpe mais comum em carro antigo: lampada de aviso removida do painel.',
    itens: ['painel-instrumentos', 'central-injecao', 'bomba-combustivel', 'tanque-combustivel'],
  },
  {
    titulo: '3. Motor ligado, carro parado',
    descricao: 'De a partida VOCE MESMO, com o motor frio. Depois deixe em marcha lenta e va escutando por partes.',
    itens: ['motor-partida', 'valvulas', 'distribuidor', 'valvula-iac', 'corpo-borboleta',
      'coxins-motor', 'alternador', 'ventoinha', 'valvula-termostatica', 'bomba-oleo',
      'rolamento-embreagem', 'coxim-amortecedor', 'bomba-direcao', 'ar-condicionado',
      'coletor-escape', 'bicos-injetores'],
  },
  {
    titulo: '4. Test drive',
    descricao: 'Peca no minimo 15 minutos, incluindo uma rua vazia para o teste de curva e um estacionamento para esterçar tudo. Desligue o radio.',
    itens: ['embreagem-disco', 'caixa-cambio', 'homocinetica', 'rolamento-roda',
      'amortecedor-dianteiro', 'suspensao-traseira', 'caixa-direcao', 'terminal-direcao',
      'volante-direcao', 'disco-freio', 'pastilhas-freio', 'pinca-freio', 'tambor-freio',
      'sonda-lambda', 'catalisador'],
  },
  {
    titulo: '5. Por baixo e ao redor',
    descricao: 'A parte que quase ninguem faz e que mais protege voce. Se possivel, leve o carro num elevador antes de fechar negocio.',
    itens: ['monobloco', 'ferrugem', 'carter', 'escapamento', 'pneus', 'rodas',
      'mola-dianteira', 'bandeja-inferior', 'bandeja-superior', 'pivo-suspensao',
      'bieleta', 'capo-paralamas', 'vidros-borrachas', 'farois-lanternas'],
  },
  {
    titulo: '6. Cabine e documentacao',
    descricao: 'O ultimo bloco e o unico que pode custar o carro inteiro se estiver errado.',
    itens: ['bancos-forracao', 'painel-console', 'cintos-seguranca', 'chicote-eletrico',
      'velas', 'cabos-vela', 'filtro-combustivel', 'documentacao'],
  },
];

/** Paradas do tour guiado, na ordem de uma vistoria real. */
const TOUR = [
  { peca: 'correia-dentada', nota: 'Comecamos pelo item que mais pesa no preco. Sem nota fiscal comprovando a troca, assuma que precisa fazer agora — e o kit inclui tensor e bomba d\'agua. Pergunte isso ANTES de qualquer outra coisa.' },
  { peca: 'bomba-agua', nota: 'Ela fica atras da correia dentada e e girada por ela. Por isso as duas trocam juntas: separar os servicos significa pagar a mao de obra duas vezes. Se o vendedor disser "so a correia foi trocada", o servico foi mal feito.' },
  { peca: 'vareta-oleo', nota: 'O exame de sangue do motor, e leva 30 segundos. Faca com o motor frio e o carro no plano. Oleo bege leitoso significa agua misturando com oleo — motivo para ir embora, nao para negociar.' },
  { peca: 'cabecote', nota: 'Confirmando o item anterior por outro caminho: abra a tampa do bocal de oleo e olhe por dentro. Borra creme ali fecha o diagnostico de junta de cabecote.' },
  { peca: 'distribuidor', nota: 'O ponto fraco classico desta geracao. A bobina e o modulo de ignicao ficam dentro dele e falham quando esquentam. O teste: rode, desligue, espere 10 minutos e tente ligar de novo. Faca na frente do vendedor.' },
  { peca: 'velas', nota: 'A janela mais barata para dentro do motor. Peca para tirar pelo menos uma. Marrom claro e seco e saude; preta e OLEOSA e oleo entrando na camara — sinal grave, que vale muito mais que o preco do jogo de velas.' },
  { peca: 'coxins-motor', nota: 'Agora com o motor ligado. Freio de mao puxado, alguem engata a 1a e solta a embreagem devagar: se o motor pula muito, os quatro coxins venceram. Teste visivel para qualquer pessoa e conjunto caro — otimo item de abatimento.' },
  { peca: 'ventoinha', nota: 'Deixe o carro ligado parado ate a temperatura chegar na metade. Ela TEM que ligar sozinha e voce vai ouvir claramente. Se nao ligar, o carro ferve no primeiro engarrafamento.' },
  { peca: 'radiador', nota: 'Com o motor frio, olhe o liquido e aperte os tanques plasticos das laterais — e ali que racha. Crosta branca ou esverdeada seca e marca de vazamento antigo, e superaquecimento repetido pode ter empenado o cabecote.' },
  { peca: 'amortecedor-dianteiro', nota: 'Comeca a parte de suspensao. Apoie o peso no canto do carro, balance para baixo tres vezes e solte: ele deve subir e PARAR. Se continuar balancando, venceu. Repita nos quatro cantos.' },
  { peca: 'pivo-suspensao', nota: 'Repare que sao OITO — dois por roda, porque este Civic usa duplo braco triangular nas quatro. Item de seguranca: se quebrar, a roda desmonta. Aqui nao se negocia desconto, se exige a troca.' },
  { peca: 'homocinetica', nota: 'No test drive, num estacionamento vazio: esterce tudo para um lado e ande devagar em circulo. "Tec-tec-tec" ritmado confirma junta gasta. Repita para o outro lado. O vendedor nao consegue esconder isso.' },
  { peca: 'fluido-freio', nota: 'O teste de seguranca mais importante que se faz parado: motor desligado, pise no freio e segure firme por 30 segundos. O pedal NAO pode afundar. Se afundar, nao dirija o carro.' },
  { peca: 'embreagem-disco', nota: 'A 50 km/h em 4a ou 5a, pise fundo. Se a rotacao dispara e o carro nao acelera junto, a embreagem patina. Como exige tirar o cambio, a mao de obra pesa — e um dos maiores abatimentos justificaveis.' },
  { peca: 'monobloco', nota: 'Terminamos pelo mais importante de todos. Abra o capo e compare as duas longarinas: devem ser simetricas, lisas e com a pintura de fabrica. Enrugamento ou solda nova significa batida estrutural — e o melhor negocio passa a ser o que voce nao faz.' },
];

/**
 * Envelope geometrico do carro, usado pelo verificador de montagem.
 * O contorno e a MESMA silhueta lateral que constroi a lataria — se um dia ela
 * mudar, a verificacao acompanha sozinha em vez de virar mentira.
 */
const PERFIL = {
  // Cotas da carroceria esculpida (modelagem/civic-ek.blend): o bico vai a
  // 2.235 e o rabo a -2.215, somando os 4.450 mm publicados. Os valores
  // antigos descreviam a lataria por codigo e acusavam falsamente os farois,
  // que agora nascem projetados na fascia real.
  frente: 2.235,
  tras: -2.215,
  meiaLargura: 0.8525,
  // Silhueta superior, amostrada nas mesmas estacoes do modelo: painel
  // traseiro, tampa, linha de cintura ao longo da cabine, cofre, capo e bico.
  // Nao passa pelo teto de proposito — a regra pergunta se a peca furou a
  // lataria naquele Z, e sob a cabine o limite util e a cintura.
  contorno: [
    [-2.215, 0.888], [-1.930, 0.948], [-1.600, 0.968], [-1.280, 0.982],
    [-1.060, 0.893], [-0.830, 0.899], [-0.080, 0.906], [0.760, 0.895],
    [1.270, 0.914], [1.660, 0.882], [2.000, 0.848], [2.130, 0.815],
    [2.235, 0.775],
  ],
  sistemasSobCapo: ['motor', 'arrefecimento', 'admissao', 'ignicao', 'combustivel'],
  vaoMotor: { zFrente: 2.10, zTras: 0.98 },
  cantos: [['DE', 0.7375, 1.31], ['DD', -0.7375, 1.31], ['TE', 0.735, -1.31], ['TD', -0.735, -1.31]],
  // pecas que legitimamente passam do envelope
  podeUltrapassar: ['pneus', 'rodas', 'escapamento', 'capo-paralamas', 'vidros-borrachas', 'monobloco'],
};

export const CIVIC_EK = {
  id: 'civic-ek',
  nome: 'Honda Civic Sedan LX 1.6',
  ano: 1998,
  sigla: 'EK',
  resumo: '6a geracao (EK/EJ6) · motor D16Y7 1.6 16V · 106 cv · manual 5 marchas',
  corPadrao: 0x8f1f24,

  ficha: VEICULO,
  pecas: [...PECAS_MOTOR, ...PECAS_CHASSI],
  sintomas: SINTOMAS,
  etapas: ETAPAS,
  tour: TOUR,
  perfil: PERFIL,

  /** Monta a cena 3D e devolve as raizes nomeadas que a interface controla. */
  construir(viewer) {
    return {
      carroceria: construirCarroceria(viewer),
      rodas: construirRodas(viewer),
      suspensao: construirSuspensao(viewer),
      motor: construirMotor(viewer),
      transmissao: construirTransmissao(viewer),
      direcao: construirDirecao(viewer),
      comandoFreio: construirComandoFreio(viewer),
      arrefecimento: construirArrefecimento(viewer),
      eletrica: construirEletrica(viewer),
      escape: construirEscapeCombustivel(viewer),
      interior: construirInterior(viewer),
      iluminacao: construirIluminacao(viewer),
    };
  },
};
