/**
 * Carroceria, suspensao, freios, transmissao, direcao, eletrica,
 * arrefecimento, escape e combustivel.
 *
 * Referencial do carro (metros):
 *   +Z = frente     |  +Y = cima  |  +X = lado ESQUERDO (motorista, direcao LHD)
 *   Y = 0 no chao.
 *
 * Medidas reais do Civic Sedan EK 1998:
 *   entre-eixos 2.620 | comprimento 4.445 | largura 1.705 | altura 1.400
 *   bitola diant. 1.475 | bitola tras. 1.470 | pneu 185/65 R14 (raio 0,298 m)
 */
import * as THREE from 'three';
import * as M from '../../core/materials.js';
import * as B from '../../core/builders.js';
import {
  mk, grupo, perfilLateral, arcoCaixaRoda, arcoParalama, colunaEntre,
  moldarCarroceria, fatorLargura,
} from '../comum.js';
import { geometria, temModelo, sondaSuperficie } from '../../core/modelos.js';

/**
 * Carroceria esculpida no Blender por lofting de 21 secoes transversais.
 * Nos exportados: Carroceria, Vidros, Farol, PiscaD, Grade, TomadaAr,
 * Lanterna, PlacaTras. Se o arquivo faltar, tudo abaixo cai na versao por
 * codigo — nenhuma tela depende do GLB existir.
 */
export const MODELO_EK = 'modelos/civic-ek-carroceria.glb';

export const EIXO_D = 1.31;
export const EIXO_T = -1.31;
const MEIA_BITOLA_D = 0.7375;
const MEIA_BITOLA_T = 0.735;
const R_RODA = 0.298;
const LARG_PNEU = 0.185;
const LARGURA = 1.705;

/*
 * Linha do teto, definida UMA vez: o vidro termina nela e o painel do teto
 * nasce dela. Duplicar essa curva foi a origem do vao entre teto e estufa que
 * apareceu antes — mudava-se uma e esquecia-se a outra.
 *
 * Pico adiantado (z = +0,08) com queda longa para tras: e o desenho do EK.
 */
/*
 * Parametros de forma da carroceria. TUDO que encosta na lataria passa por
 * aqui — corpo, vidro, teto, frisos, macanetas, arcos de paralama — senao a
 * peca fica reta contra um corpo curvo e emerge dele nas pontas, desenhando
 * diagonais que parecem amassado.
 */
const FORMA = {
  zBico: 2.24, zRabo: -2.21, cintura: 0.62, yTeto: 1.389,
  afinaPontas: 0.13, tumblehome: 0.10, barriga: 0.018,
};
const MEIA_LARGURA_BASE = 1.677 / 2;

/** Meia largura da lataria num ponto, para assentar detalhes na superficie. */
const naSuperficie = (y, z) => MEIA_LARGURA_BASE * fatorLargura(y, z, FORMA);

const LINHA_TETO = [
  [0.6200, 1.242], [0.4600, 1.292], [0.2800, 1.324], [0.0800, 1.340],
  [-0.1600, 1.342], [-0.4200, 1.334], [-0.6600, 1.316], [-0.8800, 1.280],
];

/* ======================================================== CARROCERIA === */

export function construirCarroceria(viewer, corPintura = 0x8f1f24) {
  const raiz = grupo('carroceria');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  const usaModelo = temModelo(MODELO_EK);
  // com lataria esculpida a meia largura vem de raycast na malha; sem ela,
  // da formula de FORMA. Os detalhes chamam sempre o mesmo nome.
  const superficie = usaModelo
    ? sondaSuperficie(geometria(MODELO_EK, 'Carroceria'))
    : naSuperficie;

  /* --- lataria inferior, com as caixas de roda recortadas no contorno --- */
  {
    /*
     * Silhueta do EK sedan. O que caracteriza esta geracao, e o que a versao
     * anterior deste modelo nao tinha:
     *
     *   - COWL BAIXO e para-brisa muito deitado. A base do para-brisa vem bem
     *     a frente e baixa; e a assinatura visual do Civic de 96 a 2000.
     *   - CAPO CURTO caindo depressa ate um bico arredondado.
     *   - PICO DO TETO adiantado, sobre os bancos da frente, com queda longa e
     *     suave ate o porta-malas.
     *   - CINTURA quase reta e baixa, subindo de leve para tras.
     *
     * O bevel da extrusao cresce 55 mm para cada lado, entao o contorno e
     * desenhado 55 mm para dentro das cotas finais (4.450 x 1.389 mm).
     */
    const g = grupo('lataria');
    const contorno = [
      [2.1850, 0.520], [2.1780, 0.420], [2.1450, 0.340], [2.0700, 0.288],
      [1.9200, 0.252], [1.7600, 0.246],
      ...arcoCaixaRoda(EIXO_D, 0.268, 0.386),
      [0.6200, 0.234], [0.0000, 0.230], [-0.6200, 0.232],
      ...arcoCaixaRoda(EIXO_T, 0.262, 0.386),
      [-1.7600, 0.250], [-1.9600, 0.276], [-2.0900, 0.330], [-2.1550, 0.440],
      // traseira: painel quase reto e tampa curta
      [-2.1550, 0.792], [-2.0900, 0.868], [-1.9400, 0.906], [-1.7000, 0.922],
      // cintura, subindo pouquissimo para a frente
      [-1.2000, 0.918], [-0.4000, 0.912], [0.4000, 0.906], [0.9000, 0.906],
      // cowl: base do para-brisa, ponto mais alto do capo
      [1.2600, 0.930],
      // capo curto caindo depressa, e o bico arredondado ate o para-choque
      [1.6400, 0.888], [1.9000, 0.838], [2.0400, 0.782],
      [2.1150, 0.716], [2.1620, 0.638],
    ];
    // largura de partida calibrada: o afinamento em planta e o tumblehome
    // reduzem o corpo, entao ele nasce mais largo para terminar nos 1.704 reais
    if (usaModelo) {
      // a malha do Blender ja traz teto, colunas e caixas de roda numa peca so
      g.add(mk(geometria(MODELO_EK, 'Carroceria'), M.pintura(corPintura)));
      for (const nome of ['Grade', 'TomadaAr', 'PlacaTras']) {
        const geo = geometria(MODELO_EK, nome);
        if (geo) g.add(mk(geo, M.plasticoPreto()));
      }
    } else {
      const geoCorpo = perfilLateral(contorno, 1.677, 0.055);
      moldarCarroceria(geoCorpo, FORMA);
      g.add(mk(geoCorpo, M.pintura(corPintura)));
    }

    /*
     * O vinco lateral saiu. Ele era uma caixa reta atravessando um corpo agora
     * curvo, e a intersecao das duas superficies desenhava uma diagonal dura da
     * roda dianteira ate a traseira — lia como amassado, nao como vinco.
     * A lataria do EK e limpa nessa altura; o lugar certo de marcar as portas
     * sao os frisos, que ficam no grupo 'detalhes'.
     */

    /*
     * Manta de isolamento do capo. So aparece com o capo levantado, mas o app
     * esconde a lataria para mostrar o vao — e nesse modo ela e a referencia
     * de onde o capo fecha. Manta rasgada, encharcada ou faltando indica capo
     * ja aberto muitas vezes ou trocado depois de batida.
     */
    const manta = mk(B.roundedBox(1.28, 0.016, 0.86, 0.020, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.98, metalness: 0 }));
    manta.position.set(0, 0.892, 1.680);
    manta.rotation.x = -0.055;
    g.add(manta);
    for (let i = -2; i <= 2; i++) {
      const presilha = mk(B.cyl(0.014, 0.014, 0.010, 10), M.plasticoPreto());
      presilha.position.set(i * 0.29, 0.884, 1.680);
      g.add(presilha);
    }

    reg('capo-paralamas', g, [0, 0.85, 0]);
  }

  /* ------------------------------------------- cabine: vidros e teto --- */
  {
    const g = grupo('vidros');
    /*
     * Estufa envidracada. O para-brisa do EK e MUITO deitado — sobe 44 cm ao
     * longo de 70 cm de comprimento — e o pico do teto fica adiantado, quase
     * sobre os bancos da frente, com queda longa ate a traseira.
     */
    const estufa = [
      [1.2600, 0.928],
      [1.1000, 1.008], [0.9400, 1.092], [0.7800, 1.172],
      ...LINHA_TETO,
      [-1.0600, 1.222], [-1.2400, 1.138],
      [-1.4200, 1.034], [-1.5800, 0.940], [-1.6300, 0.910],
    ];
    if (usaModelo) {
      // no modelo esculpido os vaos sao RECORTADOS na lataria e o vidro os
      // preenche; nao ha mais uma estufa macica atravessando o carro
      g.add(mk(geometria(MODELO_EK, 'Vidros'), M.vidro()));
    } else {
      const geoVidro = perfilLateral(estufa, 1.470, 0.028);
      moldarCarroceria(geoVidro, {
        zBico: 2.24, zRabo: -2.21, cintura: 0.90, yTeto: 1.389,
        afinaPontas: 0.06, tumblehome: 0.13, barriga: 0,
      });
      g.add(mk(geoVidro, M.vidro()));
    }
    /*
     * Grade do para-brisa (cowl). Tira plastica nervurada na base do vidro,
     * bem visivel em toda foto de vao aberto. Nao e enfeite: e por baixo dela
     * que ficam os drenos. Entupidos, a agua entra no vao e depois na cabine —
     * a mesma agua que enche a caixa de fusiveis de verdete.
     * Fica ABAIXO da linha de cintura naquele Z para nao furar a lataria.
     */
    const cowl = mk(B.roundedBox(1.30, 0.028, 0.165, 0.010, 0.003), M.plasticoPreto());
    cowl.position.set(0, 0.876, 1.115);
    g.add(cowl);
    for (let i = -8; i <= 8; i++) {
      const nervura = mk(B.roundedBox(0.014, 0.014, 0.150, 0.003, 0.001),
        new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.9, metalness: 0.05 }));
      nervura.position.set(i * 0.070, 0.892, 1.115);
      g.add(nervura);
    }
    // bracos e palhetas do limpador, apoiados sobre a grade
    for (const [bx, giro] of [[0.34, 0.55], [-0.20, 0.55]]) {
      const braco = mk(B.roundedBox(0.020, 0.012, 0.300, 0.005, 0.002), M.acoPreto());
      braco.position.set(bx, 0.900, 1.180);
      braco.rotation.y = giro;
      g.add(braco);
      const palheta = mk(B.roundedBox(0.014, 0.020, 0.330, 0.005, 0.002), M.borracha());
      palheta.position.set(bx - 0.145, 0.906, 1.255);
      palheta.rotation.y = giro;
      g.add(palheta);
    }

    reg('vidros-borrachas', g, [0, 0.60, 0]);
  }

  // no modelo esculpido teto e colunas nascem da mesma superficie da lataria
  if (!usaModelo) {
    // teto e colunas ficam junto da lataria (mesma peca de negociacao)
    const g = grupo('teto');
    /*
     * O teto NAO pode ser uma chapa reta: a linha do teto e curva, entao uma
     * laje plana fura o vidro no meio e sobra nas pontas. Aqui ele e extrudado
     * a partir da MESMA curva usada na estufa, deslocada 34 mm para baixo.
     */
    const perfilTeto = [
      ...LINHA_TETO.map(([z, y]) => [z, y + 0.027]),
      ...LINHA_TETO.slice().reverse(),
    ];
    const geoTeto = perfilLateral(perfilTeto, 1.486, 0.020);
    moldarCarroceria(geoTeto, {
      zBico: 2.24, zRabo: -2.21, cintura: 0.90, yTeto: 1.389,
      afinaPontas: 0.06, tumblehome: 0.13, barriga: 0,
    });
    const teto = mk(geoTeto, M.pintura(corPintura));
    g.add(teto);

    /*
     * Colunas A, B e C. Cada uma vai da linha de cintura ate o teto seguindo a
     * MESMA silhueta usada na estufa envidracada — por isso a inclinacao e o
     * comprimento sao derivados dos pontos do perfil, e nao chutados: assim a
     * coluna encosta no teto em vez de furar por cima dele.
     */
    // topo levemente abaixo da linha do teto, para a coluna morrer POR BAIXO
    // dele em vez de furar por cima
    // pontos tirados da propria curva da estufa, para a coluna morrer POR BAIXO
    // do teto em vez de furar por cima. Colunas finas: o EK e conhecido pela
    // area envidracada grande e pela visibilidade.
    const colunas = [
      colunaEntre([1.258, 0.926], [0.628, 1.238], 0.062),   // A — para-brisa
      colunaEntre([-0.300, 0.912], [-0.300, 1.310], 0.070), // B — central
      colunaEntre([-1.600, 0.930], [-0.895, 1.252], 0.082), // C — traseira
    ];
    for (const lado of [1, -1]) {
      for (const c of colunas) {
        const p = mk(B.roundedBox(c.esp, c.alt, 0.10, 0.02, 0.006), M.pintura(corPintura));
        // acompanha o fechamento das laterais: quanto mais alto, mais para dentro
        const recuo = 0.716 - 0.055 * ((c.y - 0.90) / (1.389 - 0.90));
        p.position.set(lado * recuo, c.y, c.z);
        p.rotation.x = c.incl;
        g.add(p);
      }
    }
    raiz.add(g);   // parte visual da lataria, sem registro proprio
  }

  /* ------------------------------------- detalhes externos da lataria --- */
  {
    /*
     * Sem estes elementos a lataria le como um bloco solido de sabao. Grade,
     * frisos de porta, macanetas e retrovisores sao o que dao escala ao carro
     * e permitem reconhecer que ali existe uma porta.
     */
    const g = grupo('detalhes');
    const plastico = M.plasticoPreto();

    // Grade e lips so entram na versao por codigo: no modelo esculpido eles ja
    // vem projetados na propria fascia (nos Grade, TomadaAr e PlacaTras), e
    // repetir aqui produziria duas grades em alturas diferentes.
    if (!usaModelo) {
      const molduraGrade = mk(B.roundedBox(0.66, 0.115, 0.035, 0.014, 0.004), plastico);
      molduraGrade.position.set(0, 0.755, 2.095);
      molduraGrade.rotation.x = -0.42;
      g.add(molduraGrade);
      for (let i = 0; i < 3; i++) {
        const travessa = mk(B.roundedBox(0.60, 0.013, 0.030, 0.004, 0.002), M.cromo());
        travessa.position.set(0, 0.723 + i * 0.032, 2.108 + i * 0.014);
        travessa.rotation.x = -0.42;
        g.add(travessa);
      }

      const lipD = mk(B.roundedBox(1.56, 0.10, 0.10, 0.030, 0.008), plastico);
      lipD.position.set(0, 0.375, 2.155);
      g.add(lipD);
      const lipT = mk(B.roundedBox(1.56, 0.10, 0.10, 0.030, 0.008), plastico);
      lipT.position.set(0, 0.375, -2.095);
      g.add(lipT);
    }

    const corFriso = new THREE.MeshStandardMaterial({
      color: 0x14161a, roughness: 0.85, metalness: 0.1,
    });

    /*
     * Peca que corre ao longo do carro (friso horizontal, arco de paralama)
     * precisa ser MOLDADA, porque atravessa regioes de largura diferente.
     * Peca pontual (macaneta, retrovisor, friso vertical) so precisa ser
     * POSICIONADA na superficie — naSuperficie() devolve a meia largura exata
     * naquele ponto.
     */
    const moldado = (geo, material) => {
      moldarCarroceria(geo, FORMA);
      return mk(geo, material);
    };

    for (const lado of [1, -1]) {
      // frisos verticais que separam as portas
      for (const z of [0.95, -0.31, -1.28]) {
        const friso = mk(B.roundedBox(0.016, 0.60, 0.013, 0.003, 0.001), corFriso);
        friso.position.set(lado * (superficie(0.605, z) - 0.002), 0.605, z);
        g.add(friso);
      }

      // friso horizontal na linha de cintura: percorre o carro inteiro, entao
      // e construido, transladado e moldado
      if (!usaModelo) {
        const geoFrisoH = B.roundedBox(2 * naSuperficie(0.905, -0.165), 0.013, 2.16, 0.003, 0.001);
        geoFrisoH.translate(0, 0.905, -0.165);
        g.add(moldado(geoFrisoH, corFriso));
      }

      // macanetas, assentadas na superficie
      for (const z of [0.60, -0.72]) {
        const macaneta = mk(B.roundedBox(0.020, 0.036, 0.112, 0.010, 0.003), M.pintura(corPintura));
        macaneta.position.set(lado * (superficie(0.790, z) + 0.006), 0.790, z);
        g.add(macaneta);
      }

      // retrovisor: a base nasce na superficie, o resto avanca para fora
      const xEspelho = superficie(0.900, 0.905);
      const haste = mk(B.roundedBox(0.052, 0.044, 0.044, 0.012, 0.004), plastico);
      haste.position.set(lado * xEspelho, 0.900, 0.905);
      g.add(haste);
      const carcaca = mk(B.roundedBox(0.052, 0.078, 0.142, 0.026, 0.008), M.pintura(corPintura));
      carcaca.position.set(lado * (xEspelho + 0.052), 0.926, 0.885);
      g.add(carcaca);
      const espelho = mk(B.roundedBox(0.010, 0.060, 0.116, 0.014, 0.003),
        new THREE.MeshStandardMaterial({ color: 0xc8d2da, metalness: 1.0, roughness: 0.04 }));
      espelho.position.set(lado * (xEspelho + 0.078), 0.926, 0.880);
      g.add(espelho);

      // Borda saliente das caixas de roda. No modelo esculpido o arco ja e
      // recortado na propria lataria, com caixa abaulada por tras — colar esta
      // meia-coroa por cima abriria um degrau na boca do arco.
      if (!usaModelo) {
        for (const [z, yc] of [[EIXO_D, 0.268], [EIXO_T, 0.262]]) {
          const geoArco = arcoParalama(z, yc, 0.390, 0.424, 0.038);
          geoArco.translate(lado * (naSuperficie(0.45, z) - 0.018), 0, 0);
          g.add(moldado(geoArco, M.pintura(corPintura)));
        }
      }
    }

    raiz.add(g);
  }

  /* ---------------------------------------------- monobloco e chassi --- */
  {
    const g = grupo('monobloco');
    // assoalho
    const assoalho = mk(B.roundedBox(1.52, 0.030, 2.70, 0.02, 0.006), M.acoPreto());
    assoalho.position.set(0, 0.255, -0.10);
    g.add(assoalho);

    // longarinas dianteiras (o item mais importante da vistoria estrutural)
    for (const lado of [1, -1]) {
      const l = mk(B.roundedBox(0.10, 0.13, 1.15, 0.012, 0.004), M.acoPreto());
      l.position.set(lado * 0.44, 0.44, 1.62);
      g.add(l);
      const lt = mk(B.roundedBox(0.09, 0.11, 0.95, 0.012, 0.004), M.acoPreto());
      lt.position.set(lado * 0.50, 0.40, -1.68);
      g.add(lt);
      // Soleira. Tem de morrer POR DENTRO da lataria: a carroceria esculpida
      // recolhe mais a saia entre as rodas do que a versao por codigo, e o
      // 0,735 fixo deixava uma barra de aco preto aparecendo sob as portas.
      const sol = mk(B.roundedBox(0.085, 0.115, 2.05, 0.014, 0.004), M.acoPreto());
      sol.position.set(lado * (superficie(0.315, -0.10) - 0.050), 0.315, -0.10);
      g.add(sol);
      // torre do amortecedor dianteiro
      // Torre do amortecedor. Antes era um domo preto alto que lia como uma
      // bola no vao; a real e chapa da propria lataria, PINTADA na cor do
      // carro, baixa, com as tres porcas do coxim aparecendo no topo.
      const torre = mk(B.lathe([
        [0, 0], [0.128, 0], [0.124, 0.030], [0.100, 0.058], [0.086, 0.068], [0, 0.070],
      ], 24), M.pintura(corPintura));
      torre.position.set(lado * 0.545, 0.70, EIXO_D);
      g.add(torre);
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.5;
        const porca = mk(B.cyl(0.014, 0.014, 0.014, 6), M.aco());
        porca.position.set(
          lado * 0.545 + Math.cos(a) * 0.058, 0.775, EIXO_D + Math.sin(a) * 0.058);
        g.add(porca);
      }
    }

    // travessa dianteira e parede corta-fogo
    const travessa = mk(B.roundedBox(1.28, 0.09, 0.09, 0.012, 0.004), M.acoPreto());
    travessa.position.set(0, 0.47, 2.10);
    g.add(travessa);

    // Travessa SUPERIOR do radiador, pintada na cor do carro. Nas fotos do vao
    // ela e a barra que fecha a frente por cima. Vale como item de vistoria:
    // e a primeira peca a enrugar numa batida de frente, e junto dela ficam os
    // furos de fabrica que denunciam painel dianteiro trocado.
    const travSup = mk(B.roundedBox(1.22, 0.034, 0.052, 0.008, 0.003), M.pintura(corPintura));
    travSup.position.set(0, 0.872, 2.048);
    g.add(travSup);
    for (const sx of [1, -1]) {
      // montantes ligando a travessa superior as longarinas
      const montante = mk(B.roundedBox(0.058, 0.330, 0.058, 0.008, 0.003), M.pintura(corPintura));
      montante.position.set(sx * 0.548, 0.700, 2.040);
      g.add(montante);
      // furo de fabrica, referencia visual de alinhamento
      const furo = mk(B.cyl(0.013, 0.013, 0.060, 12), M.acoPreto());
      furo.rotation.x = Math.PI / 2;
      furo.position.set(sx * 0.360, 0.872, 2.048);
      g.add(furo);
    }
    const cortaFogo = mk(B.roundedBox(1.44, 0.62, 0.035, 0.02, 0.006), M.acoPreto());
    cortaFogo.position.set(0, 0.63, 1.02);
    cortaFogo.rotation.x = 0.12;
    g.add(cortaFogo);

    // subchassi que ancora a suspensao e o cambio
    const sub = mk(B.roundedBox(1.10, 0.075, 0.46, 0.02, 0.006), M.acoPreto());
    sub.position.set(0, 0.28, 1.26);
    g.add(sub);


    /*
     * Placa do numero de chassi e etiquetas de fabrica, na parede corta-fogo.
     * E o item que fecha a vistoria documental: o numero gravado aqui tem de
     * bater com o documento e com a gravacao do vidro. Rebite mexido, placa
     * repintada ou numero remarcado sao motivo para nao comprar.
     */
    const placaChassi = mk(B.roundedBox(0.150, 0.062, 0.004, 0.004, 0.001),
      new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.42, metalness: 0.75 }));
    placaChassi.position.set(0.36, 0.760, 1.005);
    placaChassi.rotation.x = 0.12;
    g.add(placaChassi);
    for (const sx of [1, -1]) {
      const rebite = mk(B.cyl(0.005, 0.005, 0.006, 8), M.aco());
      rebite.rotation.x = Math.PI / 2;
      rebite.position.set(0.36 + sx * 0.062, 0.760, 1.001);
      g.add(rebite);
    }
    // adesivo de pressao dos pneus e adesivo da correia dentada
    for (const [ax, ay, larg, alt, cor] of [
      [-0.30, 0.772, 0.170, 0.090, 0xe8e6df],
      [-0.30, 0.668, 0.120, 0.058, 0xdcc94a],
    ]) {
      const adesivo = mk(B.roundedBox(larg, alt, 0.003, 0.004, 0.001),
        new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0 }));
      adesivo.position.set(ax, ay, 1.004);
      adesivo.rotation.x = 0.12;
      g.add(adesivo);
    }

    reg('monobloco', g, [0, -0.55, 0]);
  }

  /* ------------------------------------------- marcadores de ferrugem --- */
  {
    const g = grupo('ferrugem');
    const alerta = new THREE.MeshStandardMaterial({
      color: 0xff7a2f, emissive: 0xff5a00, emissiveIntensity: 0.55,
      transparent: true, opacity: 0.45, roughness: 0.6,
    });
    // pontos classicos de corrosao dessa geracao
    const pontos = [
      [0.782, 0.33, -1.72], [-0.782, 0.33, -1.72],   // atras das caixas de roda traseiras
      [0.755, 0.30, -0.60], [-0.755, 0.30, -0.60],   // soleiras
      [0.755, 0.30, 0.40], [-0.755, 0.30, 0.40],
      [0, 0.30, -1.95],                              // bandeja do estepe
      [0.60, 0.27, -0.90], [-0.60, 0.27, -0.90],     // assoalho traseiro
    ];
    for (const p of pontos) {
      const m = mk(new THREE.SphereGeometry(0.062, 16, 12), alerta);
      m.position.set(...p);
      m.castShadow = false;
      g.add(m);
    }
    g.visible = false;   // ligado pelo botao "pontos de ferrugem"
    reg('ferrugem', g);
  }

  return raiz;
}

/* ============================================================ RODAS === */

export function construirRodas(viewer) {
  const raiz = grupo('rodas');
  viewer.adicionar(raiz);

  const cantos = [
    ['DE', MEIA_BITOLA_D, EIXO_D], ['DD', -MEIA_BITOLA_D, EIXO_D],
    ['TE', MEIA_BITOLA_T, EIXO_T], ['TD', -MEIA_BITOLA_T, EIXO_T],
  ];

  for (const [sufixo, x, z] of cantos) {
    const lado = Math.sign(x);

    // pneu 185/65 R14
    const gp = grupo(`pneu-${sufixo}`, [x, R_RODA, z]);
    const banda = mk(new THREE.CylinderGeometry(R_RODA, R_RODA, LARG_PNEU, 44, 1, true), M.borracha());
    banda.rotation.z = Math.PI / 2;
    gp.add(banda);
    // flancos
    for (const s of [-1, 1]) {
      const flanco = mk(B.lathe([
        [0.178, 0], [0.245, 0.006], [0.285, 0.016], [R_RODA, 0.028],
      ], 40), M.borracha());
      flanco.rotation.z = s * Math.PI / 2;
      flanco.position.x = s * (LARG_PNEU / 2 - 0.028);
      gp.add(flanco);
    }
    // sulcos longitudinais (leitura de desenho de banda)
    for (let i = 0; i < 4; i++) {
      const sulco = mk(new THREE.CylinderGeometry(R_RODA - 0.006, R_RODA - 0.006, 0.012, 40, 1, true), M.borracha());
      sulco.rotation.z = Math.PI / 2;
      sulco.position.x = -LARG_PNEU / 2 + 0.028 + i * 0.043;
      gp.add(sulco);
    }
    raiz.add(gp);
    viewer.registrar(`pneus@${sufixo}`, gp, [lado * 0.55, 0, 0]);

    // roda de aco + calota (padrao do LX)
    const gr = grupo(`roda-${sufixo}`, [x, R_RODA, z]);
    const aro = mk(B.lathe([
      [0.070, -0.075], [0.178, -0.075], [0.170, -0.030], [0.168, 0.030], [0.178, 0.072], [0.070, 0.072],
    ], 36), M.acoPreto());
    aro.rotation.z = Math.PI / 2;
    gr.add(aro);
    /*
     * Face da roda: perfil revolucionado (prato empenado), nao uma chapa.
     * O lathe gira em torno de +Y, entao giramos -90 graus em Z para o eixo
     * cair em +X quando lado = +1 e a face olhar para fora dos dois lados.
     */
    const face = mk(B.lathe([
      [0.000, 0.030], [0.036, 0.030], [0.044, 0.025], [0.056, 0.020],
      [0.100, 0.014], [0.148, 0.006], [0.168, -0.004], [0.174, -0.018],
    ], 40), M.aco());
    face.rotation.z = -lado * Math.PI / 2;
    face.position.x = lado * 0.026;
    gr.add(face);

    // rebaixos de ventilacao da roda de aco
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const furo = mk(B.cylX(0.021, 0.030, 16), M.acoPreto());
      furo.position.set(lado * 0.040, Math.cos(a) * 0.100, Math.sin(a) * 0.100);
      gr.add(furo);
    }

    // 4 porcas de roda (padrao 4x100) + calota central
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const porcaRoda = mk(B.porca(0.019), M.cromo());
      porcaRoda.rotation.z = -lado * Math.PI / 2;
      porcaRoda.position.set(lado * 0.052, Math.cos(a) * 0.050, Math.sin(a) * 0.050);
      gr.add(porcaRoda);
    }
    const calota = mk(B.lathe([
      [0.000, 0.018], [0.020, 0.018], [0.028, 0.012], [0.032, 0.000],
    ], 24), new THREE.MeshStandardMaterial({ color: 0xa9afb7, metalness: 0.6, roughness: 0.4 }));
    calota.rotation.z = -lado * Math.PI / 2;
    calota.position.x = lado * 0.050;
    gr.add(calota);
    raiz.add(gr);
    viewer.registrar(`rodas@${sufixo}`, gr, [lado * 0.35, 0, 0]);
  }
  return raiz;
}

/* ======================================================== SUSPENSAO === */

/**
 * Um canto de suspensao completo. O Civic EK usa DUPLO BRACO TRIANGULAR nas
 * quatro rodas — por isso ha braco inferior E superior em todos os cantos.
 */
function cantoSuspensao(viewer, raiz, { dianteira, lado }) {
  const x = lado * (dianteira ? MEIA_BITOLA_D : MEIA_BITOLA_T);
  const z = dianteira ? EIXO_D : EIXO_T;
  const sufixo = `${dianteira ? 'D' : 'T'}${lado > 0 ? 'E' : 'D'}`;
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(`${id}@${sufixo}`, g, ex); return g; };

  const xInterno = lado * 0.20;   // ancoragem no subchassi
  const xRoda = lado * (Math.abs(x) - 0.10);

  /* ------------------------------------------------- manga de eixo --- */
  {
    const g = grupo('manga', [xRoda, R_RODA, z]);
    const corpo = mk(B.roundedBox(0.075, 0.235, 0.115, 0.018, 0.006), M.aco());
    g.add(corpo);
    const cubo = mk(B.cylX(0.055, 0.085, 24), M.aco());
    cubo.position.x = lado * 0.045;
    g.add(cubo);
    const bracoDir = mk(B.roundedBox(0.055, 0.045, 0.10, 0.01, 0.004), M.aco());
    bracoDir.position.set(0, 0.01, dianteira ? -0.105 : 0.105);
    g.add(bracoDir);
    reg('manga-eixo', g, [lado * 0.22, 0, 0]);
  }

  {
    const g = grupo('rolamento', [xRoda + lado * 0.045, R_RODA, z]);
    const r = mk(B.ring(0.052, 0.026, 0.055, 28), M.aco());
    r.rotation.z = Math.PI / 2;
    g.add(r);
    // esferas insinuadas na pista
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const e = mk(new THREE.SphereGeometry(0.010, 12, 10), M.cromo());
      e.position.set(0, Math.cos(a) * 0.039, Math.sin(a) * 0.039);
      g.add(e);
    }
    reg('rolamento-roda', g, [lado * 0.40, 0, 0]);
  }

  /* ------------------------------------------------ braco inferior --- */
  {
    const g = grupo('braco-inf', [0, 0, 0]);
    const compr = Math.abs(xRoda - xInterno);
    const braco = mk(B.roundedBox(compr, 0.038, 0.085, 0.012, 0.004), M.acoPreto());
    braco.position.set((xRoda + xInterno) / 2, R_RODA - 0.115, z);
    braco.rotation.z = lado * 0.05;
    g.add(braco);
    // segundo ramo do triangulo (por isso "braco triangular")
    const ramo = mk(B.roundedBox(compr * 0.92, 0.030, 0.055, 0.010, 0.003), M.acoPreto());
    ramo.position.set((xRoda + xInterno) / 2, R_RODA - 0.115, z + (dianteira ? -0.16 : 0.16));
    ramo.rotation.y = lado * (dianteira ? 0.20 : -0.20);
    g.add(ramo);
    // buchas de borracha nas ancoragens
    for (const dz of [0, dianteira ? -0.19 : 0.19]) {
      const bucha = mk(B.ring(0.030, 0.013, 0.048, 20), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.set(xInterno, R_RODA - 0.115, z + dz);
      g.add(bucha);
    }
    reg('bandeja-inferior', g, [lado * 0.18, -0.22, 0]);
  }

  /* ------------------------------------------------ braco superior --- */
  {
    const g = grupo('braco-sup', [0, 0, 0]);
    const xIntSup = lado * 0.36;
    const compr = Math.abs(xRoda - xIntSup);
    const braco = mk(B.roundedBox(compr, 0.032, 0.065, 0.010, 0.003), M.acoPreto());
    braco.position.set((xRoda + xIntSup) / 2, R_RODA + 0.175, z);
    braco.rotation.z = -lado * 0.10;
    g.add(braco);
    const ramo = mk(B.roundedBox(compr * 0.90, 0.026, 0.048, 0.008, 0.003), M.acoPreto());
    ramo.position.set((xRoda + xIntSup) / 2, R_RODA + 0.175, z + (dianteira ? 0.13 : -0.13));
    ramo.rotation.y = -lado * (dianteira ? 0.18 : -0.18);
    g.add(ramo);
    for (const dz of [0, dianteira ? 0.15 : -0.15]) {
      const bucha = mk(B.ring(0.026, 0.011, 0.042, 20), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.set(xIntSup, R_RODA + 0.175, z + dz);
      g.add(bucha);
    }
    reg('bandeja-superior', g, [lado * 0.18, 0.26, 0]);
  }

  /* -------------------------------------------------------- pivos --- */
  {
    const g = grupo('pivos', [0, 0, 0]);
    for (const [py, esc] of [[R_RODA - 0.115, 1], [R_RODA + 0.175, -1]]) {
      const corpo = mk(B.lathe([
        [0, 0], [0.022, 0.002], [0.024, 0.016], [0.017, 0.030], [0, 0.032],
      ], 18), M.aco());
      corpo.position.set(xRoda, py, z);
      corpo.rotation.x = esc > 0 ? 0 : Math.PI;
      g.add(corpo);
      // coifa de borracha (a peca que rasga e condena o pivo)
      const coifa = mk(B.lathe([
        [0.012, 0], [0.021, 0.008], [0.020, 0.018], [0.010, 0.024],
      ], 16), M.borracha());
      coifa.position.set(xRoda, py + esc * 0.030, z);
      coifa.rotation.x = esc > 0 ? 0 : Math.PI;
      g.add(coifa);
    }
    reg('pivo-suspensao', g, [lado * 0.30, 0, 0]);
  }

  /* ----------------------------------------- amortecedor e mola --- */
  {
    const yBase = R_RODA - 0.09;
    const yTopo = dianteira ? 0.865 : 0.80;
    const g = grupo('amortecedor', [0, 0, 0]);

    const corpo = mk(B.cyl(0.030, 0.032, 0.24, 24), M.acoPreto());
    corpo.position.set(xRoda - lado * 0.02, yBase + 0.12, z);
    g.add(corpo);
    const haste = mk(B.cyl(0.0115, 0.0115, yTopo - yBase - 0.20, 16), M.cromo());
    haste.position.set(xRoda - lado * 0.02, yBase + 0.20 + (yTopo - yBase - 0.20) / 2, z);
    g.add(haste);
    const olhal = mk(B.ring(0.026, 0.012, 0.038, 18), M.acoPreto());
    olhal.rotation.z = Math.PI / 2;
    olhal.position.set(xRoda - lado * 0.02, yBase, z);
    g.add(olhal);
    reg(dianteira ? 'amortecedor-dianteiro' : 'suspensao-traseira', g, [lado * 0.16, 0.30, 0]);

    const gm = grupo('mola', [xRoda - lado * 0.02, yBase + 0.06, z]);
    const mola = mk(B.molaHelicoidal(0.062, 0.0105, 6.5, yTopo - yBase - 0.11), M.acoPreto());
    gm.add(mola);
    // pratos de apoio
    for (const py of [0, yTopo - yBase - 0.11]) {
      const prato = mk(B.ring(0.075, 0.030, 0.010, 24), M.acoPreto());
      prato.position.y = py;
      gm.add(prato);
    }
    raiz.add(gm);
    viewer.registrar(`${dianteira ? 'mola-dianteira' : 'suspensao-traseira'}@M${sufixo}`, gm, [lado * 0.16, 0.36, 0]);

    if (dianteira) {
      const gc = grupo('coxim', [xRoda - lado * 0.02, yTopo, z]);
      const coxim = mk(B.lathe([
        [0, 0], [0.062, 0], [0.064, 0.012], [0.050, 0.030], [0, 0.034],
      ], 22), M.borracha());
      gc.add(coxim);
      const rolamentoTopo = mk(B.ring(0.046, 0.022, 0.016, 22), M.aco());
      rolamentoTopo.position.y = -0.014;
      gc.add(rolamentoTopo);
      raiz.add(gc);
      viewer.registrar(`coxim-amortecedor@${sufixo}`, gc, [lado * 0.14, 0.42, 0]);
    }
  }

  /* --------------------------------------------------- bieleta --- */
  {
    const g = grupo('bieleta', [0, 0, 0]);
    const yA = R_RODA - 0.095, yB = R_RODA + 0.075;
    const haste = mk(B.cyl(0.008, 0.008, yB - yA, 12), M.aco());
    haste.position.set(xRoda - lado * 0.10, (yA + yB) / 2, z + (dianteira ? -0.11 : 0.11));
    g.add(haste);
    for (const py of [yA, yB]) {
      const esfera = mk(new THREE.SphereGeometry(0.016, 14, 12), M.aco());
      esfera.position.set(xRoda - lado * 0.10, py, z + (dianteira ? -0.11 : 0.11));
      g.add(esfera);
    }
    reg('bieleta', g, [lado * 0.26, 0.14, 0]);
  }

  /* ---------------------------------------------------- freios --- */
  if (dianteira) {
    /*
     * Disco de 242 mm — a medida do DX/LX. Os 262 x 21 mm sao do EX/Si.
     * Como o app existe para reconhecer a peca certa no carro certo, usar o
     * disco do EX aqui seria ensinar errado.
     */
    const gd = grupo('disco', [xRoda + lado * 0.052, R_RODA, z]);
    const pista = mk(B.lathe([
      [0.030, -0.0105], [0.072, -0.0105], [0.072, -0.005], [0.121, -0.0105],
      [0.121, 0.0105], [0.072, 0.005], [0.072, 0.0105], [0.030, 0.0105],
    ], 40), M.ferroOxidado());
    pista.rotation.z = Math.PI / 2;
    gd.add(pista);
    raiz.add(gd);
    viewer.registrar(`disco-freio@${sufixo}`, gd, [lado * 0.30, 0, 0]);

    // a pinca abraca a borda do disco: com 242 mm de diametro ela fica a
    // ~95 mm do centro da roda, nao a 75
    const gp = grupo('pinca', [xRoda + lado * 0.045, R_RODA + 0.092, z - 0.055]);
    const corpo = mk(B.roundedBox(0.072, 0.105, 0.115, 0.016, 0.005), M.aco());
    gp.add(corpo);
    const ponte = mk(B.roundedBox(0.085, 0.045, 0.055, 0.010, 0.004), M.aco());
    ponte.position.set(0, 0.038, 0.020);
    gp.add(ponte);
    const mangueira = mk(B.hose([
      [0, 0.045, -0.04], [lado * -0.05, 0.13, -0.09], [lado * -0.09, 0.26, -0.10],
    ], 0.008), M.borracha());
    gp.add(mangueira);
    raiz.add(gp);
    viewer.registrar(`pinca-freio@${sufixo}`, gp, [lado * 0.36, 0.10, 0]);

    const gpa = grupo('pastilhas', [xRoda + lado * 0.052, R_RODA + 0.086, z - 0.055]);
    for (const s of [-1, 1]) {
      const p = mk(B.roundedBox(0.016, 0.062, 0.090, 0.004, 0.002), M.lonaFreio());
      p.position.x = s * 0.017;
      gpa.add(p);
      const chapa = mk(B.roundedBox(0.005, 0.070, 0.096, 0.004, 0.002), M.aco());
      chapa.position.x = s * 0.028;
      gpa.add(chapa);
    }
    raiz.add(gpa);
    viewer.registrar(`pastilhas-freio@${sufixo}`, gpa, [lado * 0.44, 0.14, 0]);
  } else {
    // traseira do LX e a TAMBOR — conferir isso ajuda a validar a versao
    // tambor de 203 mm internos (8") e ~248 mm de diametro externo
    const g = grupo('tambor', [xRoda + lado * 0.050, R_RODA, z]);
    const tambor = mk(B.lathe([
      [0.030, -0.020], [0.060, -0.026], [0.122, -0.026], [0.124, 0.030],
      [0.120, 0.034], [0.030, 0.034],
    ], 34), M.ferroOxidado());
    tambor.rotation.z = Math.PI / 2;
    g.add(tambor);
    // lonas correndo na pista interna de 203 mm
    for (const s of [-1, 1]) {
      const lona = mk(B.ring(0.1015, 0.090, 0.040, 24, true), M.lonaFreio());
      lona.rotation.z = Math.PI / 2;
      lona.position.set(-lado * 0.012, s * 0.004, 0);
      g.add(lona);
    }
    raiz.add(g);
    viewer.registrar(`tambor-freio@${sufixo}`, g, [lado * 0.34, 0, 0]);
  }

  /* --------------------------------- semi-eixo e homocinetica (só diant.) --- */
  if (dianteira) {
    const xCambio = lado * 0.16;
    const g = grupo('semi-eixo', [0, 0, 0]);
    const eixo = mk(B.cylX(0.019, Math.abs(xRoda - xCambio) - 0.10, 20), M.aco());
    eixo.position.set((xRoda + xCambio) / 2, R_RODA - 0.02, z - 0.05);
    eixo.rotation.z = 0.04 * lado;
    g.add(eixo);
    raiz.add(g);
    viewer.registrar(`semi-eixos@${sufixo}`, g, [0, -0.30, 0]);

    const gh = grupo('homocinetica', [0, 0, 0]);
    for (const [hx, r] of [[xRoda - lado * 0.02, 0.045], [xCambio + lado * 0.05, 0.040]]) {
      const junta = mk(B.lathe([
        [0, -0.030], [r, -0.030], [r * 1.05, -0.012], [r * 1.05, 0.014], [r * 0.8, 0.030], [0, 0.030],
      ], 22), M.aco());
      junta.rotation.z = Math.PI / 2;
      junta.position.set(hx, R_RODA - 0.02, z - 0.05);
      gh.add(junta);
      // coifa sanfonada — item que rasga e deixa a graxa escapar
      const coifa = mk(B.fole([
        [hx - lado * 0.035, R_RODA - 0.02, z - 0.05],
        [hx - lado * 0.085, R_RODA - 0.02, z - 0.05],
      ], 0.036, { rings: 6, amp: 0.010 }), M.borracha());
      gh.add(coifa);
    }
    raiz.add(gh);
    viewer.registrar(`homocinetica@${sufixo}`, gh, [lado * 0.24, -0.16, 0]);
  }
}

export function construirSuspensao(viewer) {
  const raiz = grupo('suspensao');
  viewer.adicionar(raiz);

  for (const lado of [1, -1]) {
    cantoSuspensao(viewer, raiz, { dianteira: true, lado });
    cantoSuspensao(viewer, raiz, { dianteira: false, lado });
  }

  // barras estabilizadoras dianteira e traseira
  for (const [sufixo, z, largura] of [['D', EIXO_D - 0.14, 1.18], ['T', EIXO_T + 0.14, 1.10]]) {
    const g = grupo(`estabilizadora-${sufixo}`, [0, R_RODA - 0.085, z]);
    const barra = mk(B.cylX(0.013, largura, 18), M.acoPreto());
    g.add(barra);
    for (const lado of [1, -1]) {
      const ponta = mk(B.hose([
        [lado * largura / 2, 0, 0],
        [lado * (largura / 2 + 0.06), 0, sufixo === 'D' ? -0.06 : 0.06],
        [lado * (largura / 2 + 0.075), -0.01, sufixo === 'D' ? -0.11 : 0.11],
      ], 0.013), M.acoPreto());
      g.add(ponta);
      const bucha = mk(B.ring(0.028, 0.014, 0.045, 18), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.x = lado * 0.34;
      g.add(bucha);
    }
    raiz.add(g);
    viewer.registrar(`barra-estabilizadora@${sufixo}`, g, [0, -0.26, 0]);
  }
  return raiz;
}

/* ===================================================== TRANSMISSAO === */

export function construirTransmissao(viewer) {
  const raiz = grupo('transmissao');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  const Y = 0.47, Z = 1.36;

  {
    const g = grupo('caixa-cambio', [0.42, Y - 0.02, Z]);
    // campana da embreagem
    const campana = mk(B.lathe([
      [0, -0.085], [0.165, -0.085], [0.170, -0.060], [0.170, 0.055], [0.150, 0.085], [0, 0.085],
    ], 30), M.aluminioFundido());
    campana.rotation.z = Math.PI / 2;
    campana.position.x = -0.07;
    g.add(campana);
    // corpo da caixa
    const corpo = mk(B.roundedBox(0.24, 0.25, 0.235, 0.035, 0.008), M.aluminioFundido());
    corpo.position.set(0.13, -0.01, 0);
    g.add(corpo);
    // nervuras de fundicao
    for (let i = 0; i < 4; i++) {
      const n = mk(B.roundedBox(0.012, 0.20, 0.24, 0.004, 0.002), M.aluminioFundido());
      n.position.set(0.05 + i * 0.055, -0.01, 0);
      g.add(n);
    }
    // bujoes de nivel e dreno
    const nivel = mk(B.parafuso(0.018, 0.014), M.aco());
    nivel.rotation.z = -Math.PI / 2;
    nivel.position.set(0.25, 0.02, 0.06);
    g.add(nivel);
    reg('caixa-cambio', g, [0.55, 0, 0]);
  }

  {
    // trem de engrenagens (visivel no modo fantasma / vista explodida)
    const g = grupo('engrenagens', [0.50, Y - 0.05, Z]);
    const eixoP = mk(B.cylX(0.016, 0.26, 16), M.aco());
    eixoP.position.y = 0.045;
    g.add(eixoP);
    const eixoS = mk(B.cylX(0.018, 0.26, 16), M.aco());
    eixoS.position.y = -0.055;
    g.add(eixoS);
    const rel = [[22, 0.038], [28, 0.048], [33, 0.056], [37, 0.062], [40, 0.066]];
    rel.forEach(([dentes, r], i) => {
      const gx = -0.10 + i * 0.048;
      const eng = mk(B.engrenagem(dentes, r, 0.020, { rFuro: 0.016 }), M.aco());
      eng.rotation.z = Math.PI / 2;
      eng.position.set(gx, 0.045, 0);
      g.add(eng);
      const par = mk(B.engrenagem(Math.round(dentes * 1.3), r * 1.25, 0.020, { rFuro: 0.018 }), M.aco());
      par.rotation.z = Math.PI / 2;
      par.position.set(gx, -0.055, 0);
      g.add(par);
    });
    reg('caixa-cambio@engrenagens', g, [0.75, 0.10, 0]);
  }

  {
    const g = grupo('volante-motor', [0.28, Y, Z]);
    const volante = mk(B.lathe([
      [0, -0.016], [0.115, -0.016], [0.118, -0.006], [0.118, 0.012], [0.100, 0.018], [0, 0.018],
    ], 34), M.ferroFundido());
    volante.rotation.z = Math.PI / 2;
    g.add(volante);
    // cremalheira de partida
    const cremalheira = mk(B.engrenagem(96, 0.122, 0.014, { rFuro: 0.108 }), M.aco());
    cremalheira.rotation.z = Math.PI / 2;
    g.add(cremalheira);
    raiz.add(g);
    viewer.registrar('volante-motor', g, [0.30, -0.25, 0]);
  }

  {
    const g = grupo('disco-embreagem', [0.315, Y, Z]);
    const disco = mk(B.ring(0.108, 0.028, 0.010, 34), M.lonaFreio());
    disco.rotation.z = Math.PI / 2;
    g.add(disco);
    const cubo = mk(B.lathe([[0, -0.020], [0.038, -0.020], [0.038, 0.020], [0, 0.020]], 22), M.aco());
    cubo.rotation.z = Math.PI / 2;
    g.add(cubo);
    // molas amortecedoras do cubo
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const mola = mk(B.cylX(0.010, 0.026, 10), M.aco());
      mola.position.set(0, Math.cos(a) * 0.055, Math.sin(a) * 0.055);
      g.add(mola);
    }
    reg('embreagem-disco', g, [0.40, 0.28, 0]);
  }

  {
    const g = grupo('plato', [0.345, Y, Z]);
    const carcaca = mk(B.lathe([
      [0.030, -0.014], [0.115, -0.014], [0.118, 0.004], [0.108, 0.026], [0.030, 0.026],
    ], 30), M.aco());
    carcaca.rotation.z = Math.PI / 2;
    g.add(carcaca);
    // diafragma em lamelas
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      const lam = mk(B.roundedBox(0.008, 0.070, 0.014, 0.002, 0.001), M.aco());
      lam.position.set(0.014, Math.cos(a) * 0.055, Math.sin(a) * 0.055);
      lam.rotation.x = -a;
      g.add(lam);
    }
    reg('embreagem-plato', g, [0.48, 0.30, 0]);
  }

  {
    const g = grupo('rolamento-embreagem', [0.385, Y, Z]);
    const r = mk(B.lathe([
      [0.022, -0.018], [0.042, -0.018], [0.042, 0.018], [0.022, 0.018],
    ], 24), M.aco());
    r.rotation.z = Math.PI / 2;
    g.add(r);
    const garfo = mk(B.roundedBox(0.016, 0.14, 0.030, 0.006, 0.002), M.aco());
    garfo.position.set(0.03, 0.055, 0);
    g.add(garfo);
    reg('rolamento-embreagem', g, [0.56, 0.22, 0]);
  }

  {
    const g = grupo('cilindros-embreagem', [0.52, 0.72, 1.10]);
    const mestre = mk(B.lathe([[0, 0], [0.026, 0], [0.026, 0.085], [0.020, 0.092], [0, 0.094]], 20), M.aluminioFundido());
    mestre.rotation.z = Math.PI / 2;
    g.add(mestre);
    const reservatorio = mk(B.roundedBox(0.050, 0.070, 0.050, 0.010, 0.003), M.plasticoPreto());
    reservatorio.position.set(0.03, 0.075, 0);
    g.add(reservatorio);
    const linha = mk(B.hose([
      [0.09, 0.0, 0], [0.12, -0.10, 0.12], [0.02, -0.24, 0.26],
    ], 0.006), M.aco());
    g.add(linha);
    const auxiliar = mk(B.lathe([[0, 0], [0.022, 0], [0.022, 0.060], [0, 0.062]], 18), M.aluminioFundido());
    auxiliar.rotation.z = Math.PI / 2;
    auxiliar.position.set(0.0, -0.245, 0.265);
    g.add(auxiliar);
    reg('cilindro-embreagem', g, [0.30, 0.30, 0]);
  }

  return raiz;
}

/* ================================================ FREIO — COMANDO === */

/**
 * Servo-freio, cilindro mestre e reservatorio, na parede corta-fogo do lado do
 * motorista. E aqui que se faz o teste do pedal de 30 segundos.
 */
export function construirComandoFreio(viewer) {
  const raiz = grupo('comando-freio');
  viewer.adicionar(raiz);

  const g = grupo('cilindro-mestre', [0.40, 0.78, 1.10]);

  // servo-freio (o "tambor" grande encostado na parede corta-fogo)
  const servo = mk(B.lathe([
    [0, -0.065], [0.098, -0.065], [0.106, -0.050], [0.106, 0.050], [0.098, 0.065], [0, 0.065],
  ], 30), M.aco());
  servo.rotation.x = Math.PI / 2;
  g.add(servo);

  // cilindro mestre
  const mestre = mk(B.lathe([
    [0, 0], [0.032, 0.004], [0.034, 0.020], [0.034, 0.090], [0.028, 0.100], [0, 0.102],
  ], 24), M.aluminioFundido());
  mestre.rotation.x = -Math.PI / 2;
  mestre.position.z = 0.066;
  g.add(mestre);

  // reservatorio translucido — da para ver a cor do fluido por fora
  const reservatorio = mk(B.roundedBox(0.075, 0.055, 0.135, 0.014, 0.004),
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e9ec, roughness: 0.30, metalness: 0,
      transmission: 0.6, thickness: 0.02, transparent: true, opacity: 0.5,
    }));
  reservatorio.position.set(0, 0.056, 0.105);
  g.add(reservatorio);

  // fluido escuro = vencido; e exatamente o que se olha na inspecao
  const fluidoDentro = mk(B.roundedBox(0.062, 0.030, 0.120, 0.010, 0.003), M.fluido(0x8a6a20));
  fluidoDentro.position.set(0, 0.046, 0.105);
  g.add(fluidoDentro);

  const tampaRes = mk(B.cyl(0.020, 0.020, 0.014, 16), M.plasticoPreto());
  tampaRes.position.set(0, 0.090, 0.105);
  g.add(tampaRes);

  // linhas rigidas saindo para os circuitos dianteiro e traseiro
  for (const [dx, dz] of [[-0.02, 0.16], [0.02, 0.16]]) {
    const linha = mk(B.hose([
      [dx, 0.005, dz], [dx * 3, -0.06, dz + 0.10], [dx * 6, -0.30, dz + 0.05],
    ], 0.005, { segments: 20 }), M.aco());
    g.add(linha);
  }

  raiz.add(g);
  viewer.registrar('fluido-freio', g, [0.20, 0.35, 0.20]);
  return raiz;
}

/* ========================================================= DIRECAO === */

export function construirDirecao(viewer) {
  const raiz = grupo('direcao');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  const Y = 0.335, Z = 1.10;

  {
    const g = grupo('caixa-direcao', [0, Y, Z]);
    const carcaca = mk(B.cylX(0.032, 1.02, 22), M.aluminioFundido());
    g.add(carcaca);
    const pinhaoCaixa = mk(B.lathe([[0, 0], [0.040, 0], [0.042, 0.055], [0.030, 0.070], [0, 0.072]], 20), M.aluminioFundido());
    pinhaoCaixa.position.set(0.34, 0.02, 0);
    pinhaoCaixa.rotation.x = -0.25;
    g.add(pinhaoCaixa);
    // coifas das pontas
    for (const lado of [1, -1]) {
      const coifa = mk(B.fole([
        [lado * 0.50, 0, 0], [lado * 0.60, 0, 0],
      ], 0.028, { rings: 6, amp: 0.008 }), M.borracha());
      g.add(coifa);
    }
    // linhas hidraulicas
    const linha = mk(B.hose([
      [0.30, 0.05, 0.02], [0.42, 0.18, 0.12], [0.50, 0.32, 0.28],
    ], 0.007), M.aco());
    g.add(linha);
    reg('caixa-direcao', g, [0, -0.30, 0.20]);
  }

  for (const lado of [1, -1]) {
    const sufixo = lado > 0 ? 'E' : 'D';
    const g = grupo(`terminal-${sufixo}`, [0, 0, 0]);
    const barra = mk(B.cylX(0.014, 0.16, 16), M.aco());
    barra.position.set(lado * 0.68, Y, Z);
    g.add(barra);
    const terminal = mk(B.lathe([
      [0, 0], [0.024, 0.004], [0.026, 0.020], [0.016, 0.034], [0, 0.036],
    ], 18), M.aco());
    terminal.position.set(lado * 0.762, Y, Z + 0.02);
    g.add(terminal);
    const coifinha = mk(B.lathe([[0.012, 0], [0.022, 0.008], [0.020, 0.020], [0.010, 0.026]], 16), M.borracha());
    coifinha.position.set(lado * 0.762, Y + 0.032, Z + 0.02);
    g.add(coifinha);
    const haste = mk(B.cylX(0.013, 0.10, 14), M.aco());
    haste.position.set(lado * 0.79, Y, Z + 0.10);
    haste.rotation.y = -lado * 0.6;
    g.add(haste);
    raiz.add(g);
    viewer.registrar(`terminal-direcao@${sufixo}`, g, [lado * 0.34, 0, 0]);
  }

  {
    // coluna e volante
    const g = grupo('coluna', [0.36, 0.62, 0.62]);
    const coluna = mk(B.cyl(0.020, 0.020, 0.52, 16), M.aco());
    coluna.rotation.x = Math.PI / 2 - 0.42;
    coluna.rotation.z = 0.04;
    g.add(coluna);
    const volante = mk(new THREE.TorusGeometry(0.185, 0.017, 14, 40), M.borracha());
    volante.position.set(0.02, 0.19, -0.20);
    volante.rotation.x = 0.42;
    g.add(volante);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      const raio = mk(B.roundedBox(0.026, 0.175, 0.010, 0.004, 0.002), M.plasticoPreto());
      raio.position.set(0.02 + Math.cos(a) * 0.09, 0.19 + Math.sin(a) * 0.09 * Math.cos(0.42), -0.20 + Math.sin(a) * 0.09 * Math.sin(0.42));
      raio.rotation.set(0.42, 0, -a + Math.PI / 2);
      g.add(raio);
    }
    const cubo = mk(B.lathe([[0, 0], [0.055, 0], [0.055, 0.030], [0, 0.032]], 20), M.plasticoPreto());
    cubo.position.set(0.02, 0.19, -0.20);
    cubo.rotation.x = Math.PI / 2 + 0.42;
    g.add(cubo);
    raiz.add(g);
    viewer.registrar('volante-direcao', g, [0.20, 0.20, -0.30]);
  }

  return raiz;
}

/* ==================================================== ARREFECIMENTO === */

export function construirArrefecimento(viewer) {
  const raiz = grupo('arrefecimento');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    // reassentado depois que o capo baixou para a linha real do EK
    const g = grupo('radiador', [0, 0.570, 1.99]);
    const nucleo = mk(B.nucleoAletado(0.63, 0.36, 0.042, 52), M.aluminioRadiador());
    g.add(nucleo);
    for (const s of [-1, 1]) {
      const tanque = mk(B.roundedBox(0.055, 0.40, 0.055, 0.012, 0.004), M.plasticoPreto());
      tanque.position.x = s * 0.345;
      g.add(tanque);
    }
    const tampa = mk(B.lathe([[0, 0], [0.026, 0], [0.026, 0.020], [0.020, 0.024], [0, 0.026]], 18), M.aco());
    tampa.position.set(-0.30, 0.212, 0);
    g.add(tampa);
    const bocalSup = mk(B.cylZ(0.021, 0.05, 16), M.plasticoPreto());
    bocalSup.position.set(0.30, 0.15, -0.04);
    g.add(bocalSup);
    reg('radiador', g, [0, 0.20, 0.55]);
  }

  {
    const g = grupo('ventoinha', [-0.13, 0.60, 1.90]);
    const carcaca = mk(B.ring(0.185, 0.165, 0.055, 30), M.plasticoPreto());
    carcaca.rotation.x = Math.PI / 2;
    g.add(carcaca);
    const helice = new THREE.Group();
    const cuboV = mk(B.cylZ(0.038, 0.045, 18), M.plasticoPreto());
    helice.add(cuboV);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const pa = mk(B.roundedBox(0.055, 0.145, 0.008, 0.010, 0.002), M.plasticoPreto());
      pa.position.set(Math.cos(a) * 0.095, Math.sin(a) * 0.095, 0);
      pa.rotation.z = -a + Math.PI / 2;
      pa.rotation.y = 0.45;
      helice.add(pa);
    }
    g.add(helice);
    reg('ventoinha', g, [-0.20, 0.10, -0.35]);

    // a ventoinha gira quando o "motor" esta ligado
    viewer.animar((dt) => { if (viewer.motorLigado) helice.rotation.z += dt * 14; });
  }

  {
    const g = grupo('mangueiras', [0, 0, 0]);
    const sup = mk(B.hose([
      [0.30, 0.75, 1.95], [0.28, 0.80, 1.80], [0.12, 0.78, 1.62], [0.02, 0.72, 1.50],
    ], 0.021, { segments: 30 }), M.borracha());
    g.add(sup);
    const inf = mk(B.hose([
      [-0.30, 0.45, 1.95], [-0.28, 0.42, 1.78], [-0.16, 0.44, 1.58], [-0.08, 0.45, 1.49],
    ], 0.021, { segments: 30 }), M.borracha());
    g.add(inf);
    for (const p of [[0.28, 0.79, 1.90], [0.06, 0.74, 1.53], [-0.29, 0.435, 1.90], [-0.10, 0.45, 1.52]]) {
      const abr = mk(B.ring(0.026, 0.021, 0.010, 18), M.aco());
      abr.rotation.x = Math.PI / 2;
      abr.position.set(...p);
      g.add(abr);
    }

    /*
     * Mangueiras de AQUECIMENTO. Saem do cabecote, furam a parede corta-fogo
     * e vao ao radiador do ar quente dentro do painel. Nas fotos do vao sao o
     * par de mangueiras finas que somem no corta-fogo, sempre com abracadeira
     * de rosca sem-fim. Interessam na vistoria: molhado ali e vazamento que
     * escorre para o carpete do passageiro, nao para o chao.
     */
    for (const [dx, yBase] of [[0.10, 0.70], [0.19, 0.66]]) {
      const aquec = mk(B.hose([
        [-0.02, yBase, 1.30], [dx * 0.5, yBase + 0.03, 1.20],
        [dx, yBase + 0.02, 1.10], [dx + 0.03, yBase - 0.01, 1.00],
      ], 0.013, { segments: 24 }), M.borracha());
      g.add(aquec);
      // passagem pelo corta-fogo, com o anel de vedacao
      const passa = mk(B.ring(0.024, 0.014, 0.012, 16), M.borracha());
      passa.rotation.x = Math.PI / 2;
      passa.position.set(dx + 0.028, yBase - 0.008, 1.015);
      g.add(passa);
      const abrAq = mk(B.ring(0.019, 0.013, 0.009, 14), M.aco());
      abrAq.rotation.x = Math.PI / 2;
      abrAq.position.set(0, yBase + 0.008, 1.26);
      g.add(abrAq);
    }

    reg('mangueiras-radiador', g, [0, 0.35, 0.20]);
  }

  {
    const g = grupo('reservatorio', [0.52, 0.740, 1.80]);
    const corpo = mk(B.roundedBox(0.11, 0.19, 0.10, 0.022, 0.005),
      new THREE.MeshPhysicalMaterial({
        color: 0xdfe6ea, roughness: 0.35, metalness: 0,
        transmission: 0.55, thickness: 0.02, transparent: true, opacity: 0.55,
      }));
    g.add(corpo);
    const nivel = mk(B.roundedBox(0.095, 0.085, 0.085, 0.018, 0.004), M.fluido(0x2f8f5a));
    nivel.position.y = -0.045;
    g.add(nivel);
    const tampaR = mk(B.cyl(0.026, 0.026, 0.020, 18), M.plasticoPreto());
    tampaR.position.y = 0.104;
    g.add(tampaR);
    reg('reservatorio-expansao', g, [0.30, 0.25, 0]);
  }

  return raiz;
}

/* ========================================================= ELETRICA === */

export function construirEletrica(viewer) {
  const raiz = grupo('eletrica');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    const g = grupo('bateria', [-0.50, 0.78, 1.72]);
    const caixa = mk(B.roundedBox(0.24, 0.19, 0.175, 0.012, 0.004), M.plasticoPreto());
    g.add(caixa);
    const tampaB = mk(B.roundedBox(0.245, 0.020, 0.18, 0.010, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.5, metalness: 0.05 }));
    tampaB.position.y = 0.10;
    g.add(tampaB);
    for (const [s, cor] of [[1, 0xb03030], [-1, 0x2a2a2a]]) {
      const polo = mk(B.lathe([[0, 0], [0.013, 0], [0.011, 0.020], [0, 0.022]], 14),
        new THREE.MeshStandardMaterial({ color: cor, metalness: 0.8, roughness: 0.35 }));
      polo.position.set(s * 0.085, 0.112, 0.055);
      g.add(polo);
      const cabo = mk(B.hose([
        [s * 0.085, 0.13, 0.055], [s * 0.15, 0.10, 0.02], [s * 0.20, 0.0, -0.10],
      ], 0.010), M.borracha());
      g.add(cabo);
    }
    reg('bateria', g, [-0.30, 0.35, 0]);
  }

  {
    // Caixa de fusiveis e reles do vao. Fica colada na bateria em todas as
    // fotos do EK, e e onde aparece gambiarra eletrica: fusivel virado fio.
    const g = grupo('caixa-fusiveis', [-0.50, 0.755, 1.945]);
    const corpo = mk(B.roundedBox(0.145, 0.105, 0.115, 0.010, 0.004), M.plasticoPreto());
    g.add(corpo);
    const tampa = mk(B.roundedBox(0.152, 0.018, 0.122, 0.010, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.55, metalness: 0.05 }));
    tampa.position.y = 0.060;
    g.add(tampa);
    // travas laterais da tampa
    for (const sx of [1, -1]) {
      const trava = mk(B.roundedBox(0.010, 0.026, 0.030, 0.003, 0.001), M.plasticoPreto());
      trava.position.set(sx * 0.076, 0.046, 0);
      g.add(trava);
    }
    // chicote grosso descendo por tras
    const feixe = mk(B.hose([
      [0, -0.040, -0.055], [0.04, -0.10, -0.14], [0.10, -0.18, -0.26],
    ], 0.016), M.borracha());
    g.add(feixe);
    reg('caixa-fusiveis', g, [-0.34, 0.30, 0.10]);
  }

  {
    // Reservatorio do lava-vidros: garrafa translucida de tampa colorida.
    const g = grupo('lava-vidros', [0.585, 0.700, 1.470]);
    const garrafa = mk(B.roundedBox(0.105, 0.190, 0.140, 0.024, 0.006),
      new THREE.MeshPhysicalMaterial({
        color: 0xe9edf0, roughness: 0.35, metalness: 0,
        transmission: 0.55, thickness: 0.02, transparent: true, opacity: 0.45,
      }));
    g.add(garrafa);
    const agua = mk(B.roundedBox(0.088, 0.100, 0.122, 0.016, 0.004), M.fluido(0x2f6fa8));
    agua.position.y = -0.038;
    g.add(agua);
    const gargalo = mk(B.cyl(0.026, 0.026, 0.030, 16), M.plasticoPreto());
    gargalo.position.set(-0.020, 0.108, 0.030);
    g.add(gargalo);
    const tampaAzul = mk(B.lathe([[0, 0], [0.030, 0], [0.030, 0.016], [0.024, 0.020], [0, 0.021]], 16),
      new THREE.MeshStandardMaterial({ color: 0x2a5fa8, roughness: 0.45, metalness: 0.05 }));
    tampaAzul.position.set(-0.020, 0.122, 0.030);
    g.add(tampaAzul);
    // bombinha eletrica na base
    const bombinha = mk(B.cyl(0.020, 0.020, 0.034, 14), M.plasticoPreto());
    bombinha.rotation.z = Math.PI / 2;
    bombinha.position.set(-0.062, -0.072, -0.020);
    g.add(bombinha);
    const mangueira = mk(B.hose([
      [-0.078, -0.072, -0.020], [-0.14, -0.02, -0.10], [-0.18, 0.06, -0.22],
    ], 0.006), M.borracha());
    g.add(mangueira);
    reg('lava-vidros', g, [0.34, 0.28, 0.10]);
  }

  {
    const g = grupo('motor-partida', [0.30, 0.36, 1.28]);
    const corpo = mk(B.lathe([
      [0, -0.070], [0.045, -0.070], [0.047, -0.058], [0.047, 0.058], [0.043, 0.070], [0, 0.070],
    ], 24), M.aco());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const solenoide = mk(B.lathe([[0, -0.045], [0.026, -0.045], [0.026, 0.045], [0, 0.045]], 18), M.aco());
    solenoide.rotation.z = Math.PI / 2;
    solenoide.position.set(0.01, 0.055, 0);
    g.add(solenoide);
    const pinhao = mk(B.engrenagem(9, 0.018, 0.024, { rFuro: 0.006 }), M.aco());
    pinhao.rotation.z = Math.PI / 2;
    pinhao.position.x = -0.085;
    g.add(pinhao);
    reg('motor-partida', g, [0.35, -0.28, 0]);
  }

  {
    const g = grupo('caixa-fusiveis', [-0.62, 0.80, 1.30]);
    const caixa = mk(B.roundedBox(0.17, 0.10, 0.13, 0.014, 0.004), M.plasticoPreto());
    g.add(caixa);
    const tampaF = mk(B.roundedBox(0.175, 0.018, 0.135, 0.012, 0.003), M.plasticoPreto());
    tampaF.position.y = 0.058;
    g.add(tampaF);
    // fusiveis coloridos
    const cores = [0xd94f4f, 0x4f8fd9, 0xd9c14f, 0x6fd94f, 0xd97f4f];
    for (let i = 0; i < 10; i++) {
      const f = mk(B.roundedBox(0.013, 0.020, 0.007, 0.002, 0.001),
        new THREE.MeshStandardMaterial({ color: cores[i % 5], roughness: 0.4, metalness: 0 }));
      f.position.set(-0.06 + (i % 5) * 0.030, 0.052, -0.03 + Math.floor(i / 5) * 0.05);
      g.add(f);
    }
    reg('chicote-eletrico', g, [-0.35, 0.30, 0]);
  }

  {
    const g = grupo('ecu', [0.42, 0.30, 0.30]);
    const caixa = mk(B.roundedBox(0.20, 0.045, 0.16, 0.010, 0.003), M.aluminioUsinado());
    g.add(caixa);
    const conector = mk(B.roundedBox(0.055, 0.030, 0.020, 0.004, 0.002), M.plasticoPreto());
    conector.position.set(0, 0, 0.09);
    g.add(conector);
    reg('central-injecao', g, [0.30, -0.25, 0]);
  }

  return raiz;
}

/* ================================================ ESCAPE E COMBUSTIVEL === */

export function construirEscapeCombustivel(viewer) {
  const raiz = grupo('escape-combustivel');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    const g = grupo('catalisador', [-0.04, 0.28, 0.95]);
    const corpo = mk(B.lathe([
      [0.022, -0.16], [0.030, -0.13], [0.055, -0.10], [0.058, 0.10], [0.030, 0.13], [0.022, 0.16],
    ], 22), M.aco());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const blindagem = mk(B.roundedBox(0.14, 0.020, 0.26, 0.010, 0.003), M.aco());
    blindagem.position.y = 0.072;
    g.add(blindagem);
    reg('catalisador', g, [0, -0.35, 0]);
  }

  {
    const g = grupo('escapamento', [0, 0, 0]);
    const tubo = mk(B.hose([
      [-0.04, 0.26, 0.78], [-0.06, 0.235, 0.35], [-0.12, 0.225, -0.20],
      [-0.20, 0.245, -0.85], [-0.26, 0.285, -1.35], [-0.30, 0.30, -1.72],
    ], 0.024, { segments: 46 }), M.aco());
    g.add(tubo);
    const silencioso = mk(B.lathe([
      [0.030, -0.21], [0.060, -0.185], [0.085, -0.16], [0.088, 0.16], [0.060, 0.185], [0.030, 0.21],
    ], 24), M.aco());
    silencioso.rotation.x = Math.PI / 2;
    silencioso.position.set(-0.30, 0.31, -1.85);
    g.add(silencioso);
    const ponteira = mk(B.cylZ(0.026, 0.13, 18), M.cromo());
    ponteira.position.set(-0.30, 0.31, -2.11);
    g.add(ponteira);
    for (const z of [-0.30, -1.20, -1.66]) {
      const coxim = mk(B.roundedBox(0.030, 0.055, 0.012, 0.006, 0.002), M.borracha());
      coxim.position.set(-0.16 - Math.abs(z) * 0.06, 0.325, z);
      g.add(coxim);
    }
    reg('escapamento', g, [0, -0.40, -0.25]);
  }

  {
    const g = grupo('tanque', [0, 0.375, -0.92]);
    const tanque = mk(B.roundedBox(0.94, 0.20, 0.52, 0.055, 0.012), M.acoPreto());
    g.add(tanque);
    const gargalo = mk(B.hose([
      [-0.40, 0.05, -0.15], [-0.62, 0.16, -0.30], [-0.72, 0.30, -0.42],
    ], 0.024), M.acoPreto());
    g.add(gargalo);
    raiz.add(g);
    viewer.registrar('tanque-combustivel', g, [0, -0.35, 0]);
  }

  {
    const g = grupo('bomba-combustivel', [0.16, 0.46, -0.86]);
    const flange = mk(B.lathe([[0, 0], [0.062, 0], [0.062, 0.016], [0, 0.018]], 22), M.plasticoPreto());
    g.add(flange);
    const corpo = mk(B.lathe([[0, -0.10], [0.028, -0.10], [0.028, -0.01], [0, 0]], 18), M.aco());
    g.add(corpo);
    const linha = mk(B.hose([
      [0, 0.018, 0], [0.05, 0.03, 0.20], [0.02, 0.05, 0.90], [-0.20, 0.20, 1.15],
    ], 0.007, { segments: 34 }), M.aco());
    g.add(linha);
    reg('bomba-combustivel', g, [0.20, 0.40, 0]);
  }

  return raiz;
}

/* ========================================================= INTERIOR === */

export function construirInterior(viewer) {
  const raiz = grupo('interior');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    const g = grupo('bancos', [0, 0, 0]);
    const posicoes = [[0.38, 0.35], [-0.38, 0.35], [0.42, -0.55], [-0.42, -0.55], [0, -0.55]];
    posicoes.forEach(([x, z], i) => {
      const traseiro = i >= 2;
      const assento = mk(B.roundedBox(traseiro ? 0.42 : 0.48, 0.14, 0.46, 0.05, 0.012), M.tecido());
      assento.position.set(x, 0.44, z);
      g.add(assento);
      const encosto = mk(B.roundedBox(traseiro ? 0.42 : 0.46, 0.56, 0.13, 0.05, 0.012), M.tecido());
      encosto.position.set(x, 0.70, z - 0.24);
      encosto.rotation.x = -0.18;
      g.add(encosto);
      const apoio = mk(B.roundedBox(0.20, 0.14, 0.10, 0.035, 0.008), M.tecido());
      apoio.position.set(x, 1.00, z - 0.30);
      g.add(apoio);
    });
    reg('bancos-forracao', g, [0, 0.45, 0]);
  }

  {
    const g = grupo('painel', [0, 0.78, 0.86]);
    const corpo = mk(B.roundedBox(1.42, 0.24, 0.36, 0.045, 0.010), M.plasticoPreto());
    corpo.rotation.x = -0.22;
    g.add(corpo);
    const console = mk(B.roundedBox(0.26, 0.30, 0.42, 0.030, 0.008), M.plasticoPreto());
    console.position.set(0, -0.20, -0.34);
    g.add(console);
    // alavanca de cambio (manual, 5 marchas)
    const alavanca = mk(B.cyl(0.014, 0.011, 0.20, 14), M.aco());
    alavanca.position.set(0, -0.09, -0.36);
    alavanca.rotation.x = 0.18;
    g.add(alavanca);
    const manopla = mk(B.lathe([[0, 0], [0.030, 0.010], [0.032, 0.036], [0.022, 0.056], [0, 0.060]], 20), M.plasticoPreto());
    manopla.position.set(0, 0.010, -0.375);
    g.add(manopla);
    // alavanca do freio de mao
    const freioMao = mk(B.roundedBox(0.036, 0.045, 0.30, 0.014, 0.004), M.plasticoPreto());
    freioMao.position.set(0, -0.22, -0.58);
    freioMao.rotation.x = 0.30;
    g.add(freioMao);
    raiz.add(g);
    viewer.registrar('painel-console', g, [0, 0.35, 0.25]);
  }

  {
    const g = grupo('instrumentos', [0.36, 0.84, 0.72]);
    const caixa = mk(B.roundedBox(0.34, 0.16, 0.11, 0.020, 0.005), M.plasticoPreto());
    caixa.rotation.x = -0.30;
    g.add(caixa);
    const vidroP = mk(B.roundedBox(0.30, 0.125, 0.008, 0.014, 0.003),
      new THREE.MeshPhysicalMaterial({ color: 0x11161c, roughness: 0.08, metalness: 0.1, clearcoat: 1 }));
    vidroP.position.set(0, 0.012, 0.055);
    vidroP.rotation.x = -0.30;
    g.add(vidroP);
    for (const dx of [-0.075, 0.075]) {
      const mostrador = mk(B.ring(0.052, 0.010, 0.006, 26),
        new THREE.MeshStandardMaterial({ color: 0x1b2129, roughness: 0.6 }));
      mostrador.rotation.x = Math.PI / 2 - 0.30;
      mostrador.position.set(dx, 0.010, 0.052);
      g.add(mostrador);
    }
    reg('painel-instrumentos', g, [0.20, 0.30, 0.25]);
  }

  {
    const g = grupo('cintos', [0, 0, 0]);
    for (const [x, z] of [[0.63, 0.20], [-0.63, 0.20], [0.66, -0.72], [-0.66, -0.72]]) {
      const fita = mk(B.roundedBox(0.012, 0.62, 0.048, 0.004, 0.001),
        new THREE.MeshStandardMaterial({ color: 0x1e2228, roughness: 0.95 }));
      fita.position.set(x, 0.78, z);
      fita.rotation.z = Math.sign(x) * 0.16;
      fita.rotation.x = 0.10;
      g.add(fita);
      const retrator = mk(B.roundedBox(0.06, 0.09, 0.07, 0.010, 0.003), M.plasticoPreto());
      retrator.position.set(x, 0.44, z);
      g.add(retrator);
    }
    reg('cintos-seguranca', g, [0, 0.30, 0]);
  }

  {
    const g = grupo('ar-cabine', [-0.30, 0.72, 0.98]);
    const caixaEvap = mk(B.roundedBox(0.34, 0.26, 0.24, 0.035, 0.008), M.plasticoPreto());
    g.add(caixaEvap);
    const ventilador = mk(B.lathe([[0, 0], [0.070, 0], [0.070, 0.075], [0, 0.078]], 22), M.plasticoPreto());
    ventilador.position.set(-0.20, -0.02, 0.02);
    g.add(ventilador);
    raiz.add(g);
    viewer.registrar('ar-condicionado@evaporador', g, [-0.25, 0.30, 0.20]);
  }

  {
    const g = grupo('documentos', [0.30, 0.62, 0.30]);
    const pasta = mk(B.roundedBox(0.20, 0.012, 0.28, 0.006, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.9 }));
    pasta.rotation.x = 0.1;
    g.add(pasta);
    reg('documentacao', g, [0.20, 0.35, 0]);
  }

  return raiz;
}

/* ============================================================ FAROIS === */

export function construirIluminacao(viewer) {
  const raiz = grupo('iluminacao');
  viewer.adicionar(raiz);

  const g = grupo('farois');

  /*
   * Com a lataria esculpida, farol, pisca e lanterna vem projetados na propria
   * fascia (nos Farol, PiscaD e Lanterna do GLB), entao ja nascem seguindo a
   * curvatura. As caixas por codigo abaixo eram posicionadas por coordenada
   * fixa contra a silhueta antiga — sobre a nova elas boiariam na frente do
   * paralama. A carcaca refletora continua vindo por codigo nos dois casos:
   * ela fica ATRAS da lente e nao existe na malha exportada.
   */
  if (temModelo(MODELO_EK)) {
    const lenteFarol = new THREE.MeshPhysicalMaterial({
      color: 0xdfe8ee, roughness: 0.06, metalness: 0,
      transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.45,
    });
    for (const [nome, material] of [
      ['Farol', lenteFarol], ['PiscaD', M.lenteAmbar()], ['Lanterna', M.lenteVermelha()],
    ]) {
      const geo = geometria(MODELO_EK, nome);
      if (geo) g.add(mk(geo, material));
    }
    for (const lado of [1, -1]) {
      const carcaca = mk(B.roundedBox(0.42, 0.13, 0.10, 0.026, 0.008), M.refletor());
      carcaca.position.set(lado * 0.500, 0.700, 2.045);
      g.add(carcaca);
    }
    raiz.add(g);
    viewer.registrar('farois-lanternas', g, [0, 0.25, 0.30]);
    return raiz;
  }

  for (const lado of [1, -1]) {
    // As posicoes seguem a silhueta: no bico do carro a lataria ja desceu para
    // ~0,72 m, entao o farol tem que ficar nessa altura para ficar embutido no
    // paralama em vez de flutuar na frente dele.
    const carcaca = mk(B.roundedBox(0.38, 0.15, 0.15, 0.030, 0.008), M.refletor());
    carcaca.position.set(lado * 0.52, 0.720, 2.055);
    g.add(carcaca);
    const lente = mk(B.roundedBox(0.38, 0.15, 0.018, 0.030, 0.006),
      new THREE.MeshPhysicalMaterial({
        color: 0xdfe8ee, roughness: 0.06, metalness: 0,
        transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.4,
      }));
    lente.position.set(lado * 0.52, 0.720, 2.132);
    g.add(lente);
    const pisca = mk(B.roundedBox(0.15, 0.12, 0.016, 0.020, 0.005), M.lenteAmbar());
    pisca.position.set(lado * 0.735, 0.712, 2.105);
    g.add(pisca);

    // lanternas traseiras — a traseira e uma face quase reta em z = -2,15
    const lanterna = mk(B.roundedBox(0.34, 0.17, 0.020, 0.026, 0.006), M.lenteVermelha());
    lanterna.position.set(lado * 0.55, 0.700, -2.155);
    g.add(lanterna);
  }
  raiz.add(g);
  viewer.registrar('farois-lanternas', g, [0, 0.25, 0.30]);
  return raiz;
}
