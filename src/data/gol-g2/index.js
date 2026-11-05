/**
 * Pacote do veiculo Volkswagen Gol Special 1.0 MI 2001 (carroceria G2).
 */

import { VEICULO } from './ficha.js';
import { PECAS_MOTOR } from './parts-motor.js';
import { PECAS_CHASSI } from './parts-chassi.js';
import { SINTOMAS } from './sintomas.js';

import { construirMotor } from '../../modules/gol-g2/engine.js';
import {
  construirCarroceria, construirRodas, construirSuspensao, construirTransmissao,
  construirDirecao, construirArrefecimento, construirEletrica,
  construirEscapeCombustivel, construirInterior, construirIluminacao,
  construirComandoFreio,
} from '../../modules/gol-g2/chassis.js';

/** Roteiro do Modo Vistoria, na ordem em que a inspecao acontece. */
const ETAPAS = [
  {
    titulo: '1. Antes de tudo: consulte a placa',
    descricao: 'Este e o carro mais vendido e tambem um dos mais roubados e remontados do Brasil. Num carro barato, debito acumulado pode valer mais que o proprio veiculo. Resolva isso antes de sair de casa.',
    itens: ['documentacao'],
  },
  {
    titulo: '2. Carro FRIO e desligado',
    descricao: 'Chegue antes do combinado e peca para NAO ligarem o carro. O sincronizado do cambio e o ruido de tucho so aparecem a frio.',
    itens: ['vareta-oleo', 'correia-dentada', 'tensor-correia', 'bomba-agua', 'radiador',
      'reservatorio-expansao', 'mangueiras-radiador', 'correia-alternador', 'tampa-valvulas',
      'filtro-ar', 'filtro-oleo', 'fluido-freio', 'cabo-embreagem', 'bateria'],
  },
  {
    titulo: '3. Chave na posicao ligado, sem dar partida',
    descricao: 'Testes de 5 segundos que denunciam o golpe mais comum: lampada de aviso removida do painel.',
    itens: ['painel-instrumentos', 'central-injecao', 'bomba-combustivel', 'tanque-combustivel'],
  },
  {
    titulo: '4. Motor ligado, carro parado',
    descricao: 'De a partida VOCE MESMO, com o motor frio. O "tec-tec" dos primeiros segundos e normal (tucho hidraulico) — o que importa e se ele some.',
    itens: ['motor-partida', 'valvulas', 'bobina-ignicao', 'sensor-rotacao', 'valvula-iac',
      'corpo-borboleta', 'coxins-motor', 'alternador', 'ventoinha', 'valvula-termostatica',
      'bomba-oleo', 'embreagem-plato', 'coxim-amortecedor', 'coletor-escape', 'bicos-injetores'],
  },
  {
    titulo: '5. Test drive',
    descricao: 'Minimo 15 minutos, com radio desligado. Inclua uma rua vazia para o teste de curva e um estacionamento para esterçar tudo. Lembre que a direcao e mecanica: volante pesado parado e normal.',
    itens: ['embreagem-disco', 'caixa-cambio', 'trambulador', 'semi-eixos', 'manga-eixo',
      'amortecedor-dianteiro', 'amortecedor-traseiro', 'caixa-direcao', 'terminal-direcao',
      'volante-direcao', 'disco-freio', 'pastilhas-freio', 'pinca-freio', 'tambor-freio',
      'sonda-lambda', 'catalisador'],
  },
  {
    titulo: '6. Por baixo e ao redor — a parte que decide',
    descricao: 'Ferrugem e prioridade absoluta neste carro. Leve lanterna e um ima. Se possivel, coloque o carro num elevador antes de fechar.',
    itens: ['ferrugem', 'monobloco', 'eixo-torcao', 'carter', 'escapamento', 'pneus', 'rodas',
      'mola-dianteira', 'bandeja-suspensao', 'pivo-suspensao', 'bieleta', 'capo-paralamas',
      'vidros-borrachas', 'farois-lanternas'],
  },
  {
    titulo: '7. Cabine',
    descricao: 'Fechamento: eletrica, acabamento e os itens de seguranca obrigatorios.',
    itens: ['chicote-eletrico', 'painel-console', 'bancos-forracao', 'cintos-seguranca',
      'velas', 'cabos-vela', 'filtro-combustivel'],
  },
];

/** Paradas do tour guiado. */
const TOUR = [
  { peca: 'correia-dentada', nota: 'Comecamos pelo item mais critico deste carro, e por um motivo especifico: o motor AT/EA111 e INTERFERENTE. Se a correia arrebentar, as valvulas batem nos pistoes e o prejuizo passa de R$ 3.000. Pior: o intervalo e de apenas 40 a 50 mil km. Sem nota fiscal da troca, trate como servico obrigatorio antes de rodar.' },
  { peca: 'bomba-agua', nota: 'Ela e girada pela correia dentada e fica atras dela. Se travar, arrebenta a correia — e voce ja sabe o que isso significa neste motor. Por isso as duas SEMPRE trocam juntas. Se o vendedor diz que trocou so a correia, o servico esta incompleto.' },
  { peca: 'vareta-oleo', nota: 'O exame de sangue do motor, em 30 segundos. Motor frio, carro no plano. Oleo bege leitoso significa agua misturando com oleo — num carro deste valor, isso costuma significar ir embora.' },
  { peca: 'cabecote', nota: 'Aqui esta a fraqueza estrutural do motor: cabecote de aluminio sobre bloco de ferro. Se o carro ferveu alguma vez, ele provavelmente empenou. Pergunte diretamente "ja ferveu?" e nao aceite um "ja, mas nao deu nada" sem prova.' },
  { peca: 'sensor-rotacao', nota: 'O defeito mais classico do Gol. O carro morre andando sem aviso e so volta a pegar depois de esfriar. A peca e barata, mas o defeito e perigoso porque a direcao e mecanica: sem motor, o volante fica pesadissimo. Teste: rode ate esquentar, desligue 10 minutos e tente ligar.' },
  { peca: 'bobina-ignicao', nota: 'Repare que este carro NAO tem distribuidor — a ignicao e estatica. Se alguem sugerir "trocar tampa e rotor", esta falando de outro carro. Bobina e sensor de rotacao dao o mesmo sintoma e ambos sao baratos.' },
  { peca: 'valvulas', nota: 'Ouca o motor a frio. O "tec-tec" dos primeiros segundos e NORMAL: sao os tuchos hidraulicos enchendo de oleo. Diferente do Civic, aqui nao existe regulagem de valvula. So preocupe se o barulho continuar depois de um minuto.' },
  { peca: 'coxins-motor', nota: 'Como o motor e longitudinal e o cambio fica atras dele, coxim vencido manda a vibracao direto para a alavanca de cambio. Freio de mao puxado, alguem engata a 1a e solta devagar: se o conjunto pular muito, os coxins foram.' },
  { peca: 'ventoinha', nota: 'Deixe o carro ligado parado ate a temperatura chegar na metade. Ela TEM que ligar sozinha. Neste motor ferver significa cabecote empenado, entao este teste protege voce de um prejuizo grande.' },
  { peca: 'trambulador', nota: 'Ponto fraco conhecido e MUITO mal interpretado. Com o motor desligado, balance a alavanca em ponto morto: folga grande e bucha do trambulador, conserto barato. Muita gente foge do carro achando que o cambio esta ruim. Saber diferenciar pode te fazer comprar bem um carro que os outros recusaram.' },
  { peca: 'cabo-embreagem', nota: 'Aqui a embreagem e por CABO, nao hidraulica. Pedal duro ou preguicoso quase sempre e so o cabo — peca de R$ 80. Nao deixe transformarem isso em "a embreagem esta ruim", que e servico de mais de R$ 500.' },
  { peca: 'amortecedor-dianteiro', nota: 'Suspensao McPherson: aqui o amortecedor tambem sustenta a roda, nao so amortece. Apoie o peso no canto, balance 3 vezes e solte — deve subir e PARAR. Amortecedor gasto neste sistema come pneu rapido.' },
  { peca: 'eixo-torcao', nota: 'A traseira nao tem bracos nem pivos: e uma viga unica em U. Como e oca, acumula agua e corroi por dentro. Bata de leve ao longo dela procurando som de chapa fina, e olhe as duas buchas grandes onde ela prende na carroceria.' },
  { peca: 'ferrugem', nota: 'Prioridade absoluta neste carro. Caixas de roda, soleiras, assoalho, bandeja do estepe e torres de amortecedor. Leve um ima embrulhado em pano: onde ele nao gruda, ha massa plastica escondendo alguma coisa.' },
  { peca: 'documentacao', nota: 'Terminamos onde muita gente devia comecar. Gol e um dos carros mais roubados e remontados do pais. Consulte a placa ANTES de negociar e pague a vistoria cautelar antes de transferir qualquer valor — num carro barato, debito acumulado pode valer mais que o veiculo.' },
];

/** Envelope geometrico usado pelo verificador de montagem. */
const PERFIL = {
  // Cotas da carroceria esculpida (modelagem/gol-g2.blend): bico em 1.934 e
  // rabo em -1.873, somando os 3.807 mm publicados. Os valores anteriores
  // descreviam a lataria por codigo, mais curta nas duas pontas.
  frente: 1.934,
  tras: -1.873,
  meiaLargura: 0.810,
  // silhueta superior amostrada nas estacoes do modelo: tampa, linha de
  // cintura ao longo da cabine, cofre, capo e bico
  contorno: [
    [-1.873, 0.868], [-1.750, 0.928], [-1.560, 0.932], [-1.320, 0.906],
    [-0.850, 0.916], [-0.100, 0.922], [0.620, 0.912], [1.000, 0.925],
    [1.180, 0.940], [1.380, 0.918], [1.560, 0.900], [1.720, 0.880],
    [1.850, 0.845], [1.934, 0.800],
  ],
  sistemasSobCapo: ['motor', 'arrefecimento', 'admissao', 'ignicao', 'combustivel'],
  vaoMotor: { zFrente: 1.86, zTras: 0.82 },
  cantos: [['DE', 0.700, 1.234], ['DD', -0.700, 1.234], ['TE', 0.6975, -1.234], ['TD', -0.6975, -1.234]],
  podeUltrapassar: ['pneus', 'rodas', 'escapamento', 'capo-paralamas', 'vidros-borrachas', 'monobloco'],
};

export const GOL_G2 = {
  id: 'gol-g2',
  nome: 'VW Gol Special 1.0',
  ano: 2001,
  sigla: 'G2',
  resumo: 'Carroceria G2 · motor AT/EA111 1.0 8V longitudinal · 54 cv · manual 5 marchas',
  corPadrao: 0xc9ccd1,

  ficha: VEICULO,
  pecas: [...PECAS_MOTOR, ...PECAS_CHASSI],
  sintomas: SINTOMAS,
  etapas: ETAPAS,
  tour: TOUR,
  perfil: PERFIL,

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
