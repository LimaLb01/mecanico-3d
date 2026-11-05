/**
 * Ficha tecnica do veiculo alvo.
 * Honda Civic Sedan LX 1.6 16V — 1998 — 6a geracao (EK / chassi EJ6)
 * Producao nacional: Honda Automoveis do Brasil, Sumare/SP.
 */

export const VEICULO = {
  nome: 'Honda Civic Sedan LX 1.6 16V',
  ano: 1998,
  geracao: '6a geracao (1996–2000)',
  codigoChassi: 'EK / EJ6',
  carroceria: 'Sedan 4 portas, 5 lugares',
  montagem: 'Sumare/SP — Honda Automoveis do Brasil',

  identificacao: {
    titulo: 'Como confirmar que o carro e o que dizem que e',
    itens: [
      ['Prefixo do chassi (VIN)', '93H... indica fabricacao no Brasil (Sumare). Chassi importado do Japao comeca com JHM.'],
      ['Onde fica o VIN', 'Base do para-brisa (lado do motorista), etiqueta na coluna da porta do motorista e gravado na longarina do vao do motor.'],
      ['Codigo do motor', 'Gravado no bloco, lado da transmissao, face frontal. Deve ler D16Y7.'],
      ['Confirmacao LX x EX', 'LX = 106 cv, sem VTEC, freio a tambor atras. EX = 127 cv, VTEC (tem a solenoide VTEC no cabecote) e freio a disco nas 4 rodas.'],
      ['Gravacao de vidros', 'Todos os vidros devem ter a mesma numeracao/ano. Vidro trocado isolado pode indicar batida ou arrombamento.'],
    ],
  },

  motor: {
    codigo: 'D16Y7',
    familia: 'Honda D-series',
    descricao: '1.6 L, 4 cilindros em linha, SOHC 16V, sem VTEC',
    cilindrada: '1.593 cm³',
    diametroCurso: '75,0 x 90,0 mm',
    taxaCompressao: '9,4 : 1',
    potencia: '106 cv @ 6.200 rpm',
    torque: '139 Nm (14,2 kgfm) @ 4.600 rpm',
    bloco: 'Aluminio com camisas de ferro fundido',
    espacamento: 'Espacamento entre cilindros 85 mm',
    alturaDeck: 'Altura de deck 212 mm (centro do virabrequim ate a face do bloco)',
    biela: 'Biela de 137 mm entre centros',
    cabecote: 'Aluminio, 1 comando no cabecote (SOHC), 4 valvulas por cilindro',
    alimentacao: 'Injecao eletronica multiponto (PGM-FI / MPFI)',
    gerenciamento: 'OBD-II — le codigo de falha com scanner comum',
    ordemIgnicao: '1 – 3 – 4 – 2',
    distribuicao: 'Correia dentada (NAO e corrente)',
    interferente: 'Nao interferente — se a correia arrebentar, normalmente as valvulas nao batem nos pistoes',
    folgaValvulas: 'Admissao 0,18–0,22 mm | Escape 0,23–0,27 mm (motor frio) — regulagem mecanica, nao hidraulica',
    combustivel: 'Gasolina',
  },

  transmissao: {
    tipo: 'Manual de 5 marchas, caixa Honda S40',
    tracao: 'Dianteira',
    embreagem: 'Monodisco a seco, acionamento hidraulico',
    fluido: 'Honda MTF (fluido de cambio manual Honda) — ~1,8 L na troca',
    intervaloFluido: 'A cada 60.000–90.000 km',
  },

  suspensao: {
    dianteira: 'Independente, duplo braco triangular (double wishbone), mola helicoidal, barra estabilizadora',
    traseira: 'Independente, duplo braco triangular (double wishbone), mola helicoidal, barra estabilizadora',
    observacao: 'Ultima geracao de Civic com duplo braco nas 4 rodas. Roda muito bem, mas tem o dobro de bucas e pivos para desgastar em relacao a um McPherson.',
  },

  freios: {
    dianteira: 'Disco ventilado de 242 mm (DX/LX). Atencao: o EX/Si usa 262 x 21 mm — nao confunda ao comprar peca',
    traseira: 'Tambor de 203 mm (8") internos, versao LX',
    abs: 'Opcional / ausente na maioria dos LX nacionais',
    fluido: 'DOT 3 ou DOT 4 — trocar a cada 2 anos',
    observacao: 'A espessura minima do disco vem gravada na propria peca. Sempre medir em vez de confiar em numero de catalogo.',
  },

  direcao: {
    tipo: 'Pinhao e cremalheira com assistencia hidraulica',
    fluido: 'Honda PSF — nao usar fluido de transmissao automatica no lugar',
  },

  rodasPneus: {
    pneu: '185/65 R14',
    roda: 'Aro 14',
    diametroExterno: '≈ 596 mm',
    torqueRoda: '108 Nm (80 lbf.pe)',
  },

  dimensoes: {
    comprimento: '4.445 mm',
    largura: '1.705 mm',
    altura: '1.400 mm',
    entreEixos: '2.620 mm',
    bitolaDianteira: '≈ 1.475 mm',
    bitolaTraseira: '≈ 1.470 mm',
    pesoOrdemMarcha: '≈ 1.100 kg',
    tanque: '45 L',
    portaMalas: '≈ 350 L',
  },

  capacidades: [
    ['Oleo do motor (com filtro)', '≈ 3,6 L', '5W30 ou 10W30 API SL ou superior'],
    ['Sistema de arrefecimento', '≈ 5,0 L', 'Fluido a base de etilenoglicol, sem silicato (padrao Honda)'],
    ['Cambio manual S40', '≈ 1,8 L', 'Honda MTF'],
    ['Direcao hidraulica', '≈ 0,9 L', 'Honda PSF'],
    ['Tanque de combustivel', '45 L', 'Gasolina'],
  ],

  torques: [
    ['Parafuso do bujao de oleo', '45 Nm'],
    ['Filtro de oleo', '22 Nm (ou 3/4 de volta apos encostar)'],
    ['Velas de ignicao', '18 Nm'],
    ['Porca da roda', '108 Nm'],
    ['Porca do cubo / semi-eixo', '245 Nm'],
    ['Parafusos do coletor de admissao', '23 Nm'],
    ['Porcas do coletor de escape', '31 Nm'],
    ['Sensor de oxigenio', '45 Nm'],
    ['Volante do motor', '118 Nm (em cruz)'],
    ['Plato da embreagem', '26 Nm'],
    ['Terminal de direcao', '39–47 Nm'],
    ['Pinca de freio dianteira', '27–33 Nm'],
    ['Suporte da pinca dianteira', '108 Nm'],
  ],

  /**
   * Procedencia das medidas usadas no modelo 3D.
   * Existe para voce saber em que confiar: nem tudo aqui tem a mesma origem.
   */
  precisao: {
    verificado: [
      'Entre-eixos, comprimento, largura, altura e bitolas',
      'Cilindrada, diametro x curso, taxa de compressao, potencia e torque',
      'Espacamento entre cilindros (85 mm) e altura de deck (212 mm)',
      'Comprimento da biela (137 mm)',
      'Disco de freio dianteiro 242 mm (DX/LX) e tambor traseiro 203 mm',
      'Medida de pneu, torques de aperto e capacidades de fluido',
      'Tipo de suspensao, freio, direcao e transmissao',
    ],
    derivado: [
      'Altura de compressao do pistao: 30 mm, calculada como deck (212) menos biela (137) menos meio curso (45). O encaixe fechar exatamente e a prova de que as tres medidas de origem batem entre si.',
    ],
    estimado: [
      'Posicao exata do motor dentro do vao e angulo de inclinacao',
      'Comprimento e ponto de ancoragem dos bracos de suspensao',
      'Posicao dos acessorios no bloco (alternador, compressor, bomba de direcao)',
      'Forma da carroceria: a silhueta segue as cotas reais, mas as curvas sao aproximadas',
      'Formato interno de coletores, carcacas e suportes',
    ],
  },

  manutencao: [
    ['Oleo e filtro de oleo', '10.000 km ou 12 meses', 'critico'],
    ['Correia dentada + tensor + bomba d\'agua', '100.000 km ou 7 anos', 'critico'],
    ['Regulagem de valvulas', '45.000 km — ou antes, se estiver batendo', 'alto'],
    ['Velas de ignicao', '30.000 km', 'medio'],
    ['Filtro de ar', '30.000 km (limpar a cada 10.000)', 'baixo'],
    ['Filtro de combustivel', '60.000 km', 'medio'],
    ['Fluido de freio', '2 anos', 'alto'],
    ['Fluido de arrefecimento', '5 anos / 100.000 km', 'alto'],
    ['Fluido do cambio manual', '60.000–90.000 km', 'medio'],
    ['Correia do alternador / auxiliar', '60.000 km ou ao apresentar trinca', 'medio'],
  ],
};

// O aviso sobre estimativas de custo e compartilhado e vive em src/data/parts.js.
