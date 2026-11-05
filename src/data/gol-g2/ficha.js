/**
 * Ficha tecnica do veiculo alvo.
 * Volkswagen Gol Special 1.0 MI — 2001 — carroceria da 2a geracao (G2, "Gol Bolinha")
 * Plataforma VW BX. Producao: Volkswagen do Brasil.
 *
 * Observacao de epoca: em 2001 o Gol G3 ja estava em linha desde 1999, mas a
 * versao Special seguiu sendo produzida sobre a carroceria do G2 como modelo de
 * entrada. Por isso "Gol G2 Special 2001" esta correto.
 */

export const VEICULO = {
  nome: 'Volkswagen Gol Special 1.0 MI',
  ano: 2001,
  geracao: '2a geracao (G2, "Gol Bolinha") — 1995 a 2005 na versao Special',
  codigoChassi: 'Plataforma VW BX',
  carroceria: 'Hatch 2 portas, 5 lugares',
  montagem: 'Volkswagen do Brasil',

  identificacao: {
    titulo: 'Como confirmar que o carro e o que dizem que e',
    itens: [
      ['Prefixo do chassi (VIN)', '9BW... indica fabricacao no Brasil pela Volkswagen.'],
      ['Onde fica o VIN', 'Base do para-brisa (lado do motorista), etiqueta na coluna da porta e gravado na torre do amortecedor / cofre do motor.'],
      ['Codigo do motor', 'Gravado no bloco. A familia e AT (designacao VW Brasil) / EA111. Confirme que e 1.0 8V e nao 1.0 16V.'],
      ['Special x versoes superiores', 'A Special e a versao de entrada: direcao MECANICA (sem hidraulica), sem ar-condicionado de serie, sem vidro/trava eletricos. Se o carro tem esses itens, ou nao e Special ou foram instalados depois.'],
      ['Carroceria G2 x G3', 'O G2 ("Bolinha") tem faroi retangular e para-choque mais simples. Se o carro tem cara de G3 (bico mais alongado), a etiqueta pode nao bater com o que estao vendendo.'],
      ['Gravacao de vidros', 'Todos os vidros devem ter a mesma numeracao e ano. Vidro isolado trocado pode indicar batida ou arrombamento.'],
    ],
  },

  motor: {
    codigo: 'AT (VW Brasil) / familia EA111',
    familia: 'Volkswagen EA111',
    descricao: '1.0 L, 4 cilindros em linha, SOHC 8V (2 valvulas por cilindro)',
    cilindrada: '999 cm³',
    diametroCurso: '67,1 x 70,8 mm',
    taxaCompressao: '10,5 : 1',
    potencia: '54 cv @ 5.000 rpm',
    torque: '8,5 kgfm @ 3.250 rpm',
    bloco: 'Ferro fundido',
    cabecote: 'Aluminio, 1 comando no cabecote (SOHC), 2 valvulas por cilindro',
    alimentacao: 'Injecao eletronica multiponto (MPI)',
    gerenciamento: 'Injecao eletronica — carro 2001 ja atende leitura de falha por scanner',
    disposicao: 'LONGITUDINAL, dianteiro (heranca da plataforma BX) — cambio atras do motor',
    ordemIgnicao: '1 – 3 – 4 – 2',
    distribuicao: 'Correia dentada (135 dentes, 19 mm de largura)',
    interferente: 'SIM, e interferente — se a correia arrebentar, as valvulas batem nos pistoes',
    folgaValvulas: 'Tuchos HIDRAULICOS — nao ha regulagem de valvula',
    combustivel: 'Gasolina',
  },

  transmissao: {
    tipo: 'Manual de 5 marchas',
    tracao: 'Dianteira',
    embreagem: 'Monodisco a seco, acionamento por CABO',
    fluido: 'Oleo de cambio VW (API GL-4) — nao usa fluido do motor',
    intervaloFluido: 'Verificar nivel a cada revisao; troca conforme uso',
  },

  suspensao: {
    dianteira: 'Independente McPherson, mola helicoidal, barra estabilizadora',
    traseira: 'Eixo de torcao (semi-independente) com molas helicoidais',
    observacao: 'Bem mais simples que o duplo braco do Civic: menos pecas para desgastar e conserto muito mais barato, mas conforto e aderencia inferiores. Na traseira, atencao a corrosao do proprio eixo de torcao.',
  },

  freios: {
    dianteira: 'Disco solido de 239 mm, furacao de 4 furos e cubo central de 65 mm',
    traseira: 'Tambor de 180 mm internos (210 mm externos)',
    abs: 'Nao oferecido na versao Special',
    fluido: 'DOT 4 — trocar a cada 2 anos',
    observacao: 'Disco SOLIDO (nao ventilado) aquece mais rapido em uso pesado. A espessura minima vem gravada na peca — sempre medir.',
  },

  direcao: {
    tipo: 'Mecanica (sem assistencia hidraulica) na versao Special',
    fluido: 'Nao se aplica — nao ha bomba nem reservatorio de direcao',
  },

  rodasPneus: {
    pneu: '175/70 R13 (medida de origem das versoes 1.0)',
    roda: 'Aro 13, de aco com calota',
    diametroExterno: '≈ 575 mm',
    torqueRoda: '110 Nm',
  },

  dimensoes: {
    comprimento: '3.807 mm',
    largura: '1.620 mm',
    altura: '1.411 mm',
    entreEixos: '2.468 mm',
    bitolaDianteira: '≈ 1.400 mm',
    bitolaTraseira: '≈ 1.395 mm',
    pesoOrdemMarcha: '≈ 910 kg',
    tanque: '51 L',
    portaMalas: '285 L',
  },

  capacidades: [
    ['Oleo do motor (com filtro)', '≈ 3,0 L', '15W40 ou 20W50 API SL, conforme uso'],
    ['Sistema de arrefecimento', '≈ 5,5 L', 'Aditivo especifico VW (G11/G12 conforme o ano) — nunca agua pura'],
    ['Cambio manual', '≈ 2,0 L', 'Oleo de cambio API GL-4'],
    ['Tanque de combustivel', '51 L', 'Gasolina'],
  ],

  torques: [
    ['Parafuso do bujao de oleo', '30 Nm'],
    ['Filtro de oleo', 'Aperto manual + 3/4 de volta'],
    ['Velas de ignicao', '25 Nm'],
    ['Porca da roda', '110 Nm'],
    ['Porca do cubo / semi-eixo', '265 Nm'],
    ['Parafusos do coletor de admissao', '20 Nm'],
    ['Porcas do coletor de escape', '25 Nm'],
    ['Sensor de oxigenio', '50 Nm'],
    ['Volante do motor', '80 Nm (em cruz)'],
    ['Plato da embreagem', '20 Nm'],
    ['Terminal de direcao', '35 Nm'],
    ['Pinca de freio dianteira', '25 Nm'],
    ['Suporte da pinca dianteira', '65 Nm'],
  ],

  /**
   * Procedencia das medidas usadas no modelo 3D.
   * Existe para voce saber em que confiar: nem tudo aqui tem a mesma origem.
   */
  precisao: {
    verificado: [
      'Entre-eixos, comprimento, largura, altura, peso, tanque e porta-malas',
      'Cilindrada, diametro x curso, taxa de compressao, potencia e torque',
      'Correia dentada: 135 dentes e 19 mm de largura',
      'Disco de freio dianteiro 239 mm solido, cubo central 65 mm',
      'Tambor traseiro 180 mm internos / 210 mm externos',
      'Tipo de suspensao, freio, direcao e transmissao',
      'Disposicao longitudinal do motor e posicao do cambio',
    ],
    derivado: [],
    estimado: [
      'Altura de deck, comprimento de biela e espacamento entre cilindros do EA111 — nao encontrei fonte publica confiavel, entao a geometria interna do motor esta proporcional, nao cotada',
      'Posicao exata do conjunto motor-cambio dentro do vao',
      'Comprimento e ancoragem dos bracos de suspensao e do eixo de torcao',
      'Forma da carroceria: a silhueta segue as cotas reais, mas as curvas sao aproximadas',
      'Formato interno de coletores, carcacas e suportes',
    ],
  },

  manutencao: [
    ['Oleo e filtro de oleo', '5.000 a 7.500 km', 'critico'],
    ['Correia dentada + tensor + bomba d\'agua', '40.000 a 50.000 km', 'critico'],
    ['Velas de ignicao', '20.000 km', 'medio'],
    ['Cabos de vela e bobina', '40.000 km ou ao falhar', 'medio'],
    ['Filtro de ar', '15.000 km', 'baixo'],
    ['Filtro de combustivel', '20.000 a 30.000 km', 'medio'],
    ['Fluido de freio', '2 anos', 'alto'],
    ['Fluido de arrefecimento', '2 anos', 'alto'],
    ['Correia do alternador', '40.000 km ou ao trincar', 'medio'],
    ['Regulagem de valvulas', 'Nao se aplica — tuchos hidraulicos', 'baixo'],
  ],
};
