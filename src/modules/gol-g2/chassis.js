/**
 * Carroceria, suspensao, freios, transmissao, direcao, eletrica, arrefecimento,
 * escape e combustivel do VW Gol Special 1.0 2001 (carroceria G2).
 *
 * Medidas reais: 3.807 x 1.620 x 1.411 mm | entre-eixos 2.468 mm
 * Pneu 175/70 R13 (raio 0,2876 m) | hatch 2 portas
 *
 * Diferencas estruturais em relacao ao Civic deste mesmo app:
 *   - McPherson na frente: UM braco por roda (o Civic tem dois)
 *   - EIXO DE TORCAO atras: uma viga unica, sem bracos nem pivos
 *   - cambio ATRAS do motor (motor longitudinal)
 *   - direcao MECANICA: sem bomba, sem fluido, sem mangueira
 */
import * as THREE from 'three';
import * as M from '../../core/materials.js';
import * as B from '../../core/builders.js';
import { mk, grupo, perfilLateral, arcoCaixaRoda, arcoParalama, colunaEntre } from '../comum.js';
import { geometria, temModelo, sondaSuperficie } from '../../core/modelos.js';

/** Carroceria esculpida no Blender (modelagem/gol-g2.blend), hatch 2 portas. */
export const MODELO_G2 = 'modelos/gol-g2-carroceria.glb';

export const EIXO_D = 1.234;
export const EIXO_T = -1.234;
const MEIA_BITOLA_D = 0.700;
const MEIA_BITOLA_T = 0.6975;
const R_RODA = 0.2876;
const LARG_PNEU = 0.175;
const LARGURA = 1.620;

/* ======================================================== CARROCERIA === */

export function construirCarroceria(viewer, corPintura = 0xc9ccd1) {
  const raiz = grupo('carroceria');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  const usaModelo = temModelo(MODELO_G2);
  const superficie = usaModelo
    ? sondaSuperficie(geometria(MODELO_G2, 'Carroceria'), 0.79)
    : () => 0.712;

  /* --- lataria: hatch de 2 portas, tres volumes curtos e traseira reta --- */
  {
    const g = grupo('lataria');
    // O bevel do perfilLateral infla a silhueta 50 mm para fora em todo o
    // contorno, entao os extremos sao recuados nessa medida para o carro
    // fechar nos 3.807 mm reais de comprimento.
    const contorno = [
      [1.9040, 0.430], [1.8900, 0.310], [1.8000, 0.262], [1.6600, 0.258],
      ...arcoCaixaRoda(EIXO_D, 0.272, 0.400),
      [0.5600, 0.248], [-0.5600, 0.244],
      ...arcoCaixaRoda(EIXO_T, 0.268, 0.400),
      [-1.6800, 0.260], [-1.7700, 0.300], [-1.8030, 0.420],
      [-1.8030, 0.860], [-1.7600, 0.920], [-1.4000, 0.940],
      [-0.7500, 0.945], [0.2000, 0.938], [0.7000, 0.925],
      [1.0500, 0.905], [1.5300, 0.860], [1.8100, 0.775], [1.8900, 0.620],
    ];
    if (usaModelo) {
      g.add(mk(geometria(MODELO_G2, 'Carroceria'), M.pintura(corPintura)));
      for (const nome of ['Grade', 'TomadaAr', 'PlacaTras']) {
        const geo = geometria(MODELO_G2, nome);
        if (geo) g.add(mk(geo, M.plasticoPreto()));
      }
    } else {
      g.add(mk(perfilLateral(contorno, LARGURA, 0.050), M.pintura(corPintura)));
      // caixa reta atravessando corpo reto: so funciona na versao por codigo
      const vinco = mk(B.roundedBox(LARGURA + 0.006, 0.016, 2.30, 0.005, 0.002), M.pintura(corPintura));
      vinco.position.set(0, 0.535, -0.10);
      g.add(vinco);
    }

    reg('capo-paralamas', g, [0, 0.85, 0]);
  }

  /* ------------------------------------------- cabine: vidros e teto --- */
  {
    const g = grupo('vidros');
    // 2 portas: para-brisa inclinado, janela lateral longa e coluna C larga
    const estufa = [
      [1.0500, 0.9150], [0.8200, 1.0700], [0.5800, 1.2100], [0.3200, 1.3050],
      [0.0000, 1.3600], [-0.4000, 1.3820], [-0.8000, 1.3800], [-1.0500, 1.3450],
      [-1.3000, 1.2050], [-1.5600, 0.9950], [-1.5400, 0.9250],
    ];
    if (usaModelo) {
      // vaos recortados na lataria: para-brisa, vidro da porta, quebra-vento
      // fixo e vigia da tampa. Sem coluna B partindo o vidro, como no sedan.
      g.add(mk(geometria(MODELO_G2, 'Vidros'), M.vidro()));
    } else {
      g.add(mk(perfilLateral(estufa, 1.442, 0.028), M.vidro()));
    }
    reg('vidros-borrachas', g, [0, 0.60, 0]);
  }

  // no modelo esculpido teto e colunas ja nascem da superficie da lataria
  if (!usaModelo) {
    const g = grupo('teto');
    const linhaTeto = [
      [0.3200, 1.3050], [0.0000, 1.3600], [-0.4000, 1.3820],
      [-0.8000, 1.3800], [-1.0500, 1.3450],
    ];
    // O teto fica ACIMA da linha do vidro, nao dentro dela: a estufa e um
    // prisma solido, entao sobrepor os dois deixa duas lajes visiveis.
    const perfilTeto = [
      ...linhaTeto.map(([z, y]) => [z, y + 0.026]),
      ...linhaTeto.slice().reverse().map(([z, y]) => [z, y - 0.014]),
    ];
    const teto = mk(perfilLateral(perfilTeto, 1.470, 0.018), M.pintura(corPintura));
    g.add(teto);

    // 2 portas: coluna A, coluna B no fim da porta (bem recuada) e coluna C larga
    const colunas = [
      colunaEntre([1.050, 0.915], [0.560, 1.198], 0.072),   // A
      colunaEntre([-0.780, 0.945], [-0.780, 1.348], 0.070), // B — fim da porta longa
      colunaEntre([-1.545, 0.965], [-1.060, 1.312], 0.130), // C — larga, tipica do hatch
    ];
    for (const lado of [1, -1]) {
      for (const c of colunas) {
        const p = mk(B.roundedBox(c.esp, c.alt, 0.100, 0.018, 0.005), M.pintura(corPintura));
        p.position.set(lado * 0.712, c.y, c.z);
        p.rotation.x = c.incl;
        g.add(p);
      }
    }
    raiz.add(g);
  }

  /* ------------------------------------- detalhes externos da lataria --- */
  {
    const g = grupo('detalhes');
    const plastico = M.plasticoPreto();

    // Grade e para-choques so na versao por codigo: no modelo esculpido eles
    // vem projetados na fascia (nos Grade, TomadaAr e PlacaTras).
    if (!usaModelo) {
      const molduraGrade = mk(B.roundedBox(0.72, 0.090, 0.030, 0.012, 0.004), plastico);
      molduraGrade.position.set(0, 0.700, 1.905);
      molduraGrade.rotation.x = -0.30;
      g.add(molduraGrade);
      for (let i = 0; i < 2; i++) {
        const travessa = mk(B.roundedBox(0.66, 0.011, 0.026, 0.004, 0.002), M.cromo());
        travessa.position.set(0, 0.680 + i * 0.030, 1.912 + i * 0.010);
        travessa.rotation.x = -0.30;
        g.add(travessa);
      }

      // para-choques plasticos (na Special nao eram pintados na cor)
      // recuados para nao ultrapassar o comprimento real de 3.807 mm
      const pcD = mk(B.roundedBox(1.58, 0.175, 0.115, 0.030, 0.008), plastico);
      pcD.position.set(0, 0.385, 1.893);
      g.add(pcD);
      const pcT = mk(B.roundedBox(1.58, 0.170, 0.110, 0.030, 0.008), plastico);
      pcT.position.set(0, 0.380, -1.797);
      g.add(pcT);
    }

    for (const lado of [1, -1]) {
      const x = lado * 0.815;
      // Detalhe tem de nascer NA pele. Com a lataria esculpida a lateral e
      // mais estreita que os 0,815 fixos (medido: 0,782 a 0,803), entao friso,
      // macaneta e base do retrovisor ficavam boiando 29 a 44 mm fora dela.
      const naPele = (y, z, folga = 0) => lado * (superficie(y, z) + folga);

      // 2 portas: apenas UM recorte de porta por lado, bem comprido
      for (const z of [0.98, -0.78]) {
        const friso = mk(B.roundedBox(0.014, 0.62, 0.013, 0.003, 0.001),
          new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.85, metalness: 0.1 }));
        friso.position.set(naPele(0.610, z, -0.002), 0.610, z);
        g.add(friso);
      }
      const frisoH = mk(B.roundedBox(0.014, 0.013, 1.76, 0.003, 0.001),
        new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.85, metalness: 0.1 }));
      frisoH.position.set(naPele(0.925, 0.10, -0.002), 0.925, 0.10);
      g.add(frisoH);

      const macaneta = mk(B.roundedBox(0.018, 0.034, 0.100, 0.008, 0.003), M.pintura(corPintura));
      macaneta.position.set(naPele(0.790, -0.40, 0.006), 0.790, -0.40);
      g.add(macaneta);

      // carcaca e espelho medem a partir do MESMO ponto da haste: assim o
      // conjunto avanca em bloco em vez de cada peca achar sua propria pele
      const xEspelho = superficie(0.905, 0.865);
      const haste = mk(B.roundedBox(0.050, 0.040, 0.040, 0.010, 0.003), plastico);
      haste.position.set(lado * xEspelho, 0.905, 0.865);
      g.add(haste);
      const carcaca = mk(B.roundedBox(0.048, 0.072, 0.128, 0.022, 0.006), plastico);
      carcaca.position.set(lado * (xEspelho + 0.050), 0.928, 0.848);
      g.add(carcaca);
      const espelho = mk(B.roundedBox(0.009, 0.056, 0.104, 0.012, 0.003),
        new THREE.MeshStandardMaterial({ color: 0xc8d2da, metalness: 1.0, roughness: 0.04 }));
      espelho.position.set(lado * (xEspelho + 0.074), 0.928, 0.844);
      g.add(espelho);

      // Borda saliente das caixas de roda. No modelo esculpido o arco ja e
      // recortado na lataria com caixa abaulada atras; esta meia-coroa por
      // cima virava um aro claro em volta do pneu.
      if (!usaModelo) {
        for (const [z, yc] of [[EIXO_D, 0.272], [EIXO_T, 0.268]]) {
          const arco = mk(arcoParalama(z, yc, 0.398, 0.432, 0.040), M.pintura(corPintura));
          arco.position.x = x - lado * 0.020;
          g.add(arco);
        }
      }
    }
    raiz.add(g);
  }

  /* ---------------------------------------------- monobloco e chassi --- */
  {
    const g = grupo('monobloco');
    const assoalho = mk(B.roundedBox(1.44, 0.028, 2.50, 0.018, 0.005), M.acoPreto());
    assoalho.position.set(0, 0.248, -0.06);
    g.add(assoalho);

    for (const lado of [1, -1]) {
      // comprimento ajustado para a longarina morrer ATRAS do para-choque,
      // em vez de furar a lataria pela frente
      const l = mk(B.roundedBox(0.095, 0.120, 0.94, 0.010, 0.004), M.acoPreto());
      l.position.set(lado * 0.40, 0.430, 1.425);
      g.add(l);
      const lt = mk(B.roundedBox(0.085, 0.100, 0.74, 0.010, 0.004), M.acoPreto());
      lt.position.set(lado * 0.46, 0.390, -1.485);
      g.add(lt);
      // soleira apoiada na lataria real: a esculpida recolhe mais a saia entre
      // as rodas, e o valor fixo deixava aco preto aparecendo sob as portas
      const sol = mk(B.roundedBox(0.080, 0.110, 1.90, 0.012, 0.004), M.acoPreto());
      sol.position.set(lado * (superficie(0.308, -0.06) - 0.048), 0.308, -0.06);
      g.add(sol);
      const torre = mk(B.lathe([[0, 0], [0.125, 0], [0.120, 0.095], [0.078, 0.160], [0, 0.165]], 20), M.acoPreto());
      torre.position.set(lado * 0.505, 0.665, EIXO_D);
      g.add(torre);
    }

    const travessa = mk(B.roundedBox(1.22, 0.085, 0.085, 0.010, 0.004), M.acoPreto());
    travessa.position.set(0, 0.450, 1.84);
    g.add(travessa);
    const cortaFogo = mk(B.roundedBox(1.36, 0.585, 0.030, 0.018, 0.005), M.acoPreto());
    cortaFogo.position.set(0, 0.610, 0.98);
    cortaFogo.rotation.x = 0.14;
    g.add(cortaFogo);
    const sub = mk(B.roundedBox(1.02, 0.070, 0.42, 0.018, 0.005), M.acoPreto());
    sub.position.set(0, 0.272, 1.20);
    g.add(sub);

    reg('monobloco', g, [0, -0.55, 0]);
  }

  /* ------------------------------------------- marcadores de ferrugem --- */
  {
    const g = grupo('ferrugem');
    const alerta = new THREE.MeshStandardMaterial({
      color: 0xff7a2f, emissive: 0xff5a00, emissiveIntensity: 0.55,
      transparent: true, opacity: 0.45, roughness: 0.6,
    });
    // pontos classicos do Gol: caixas de roda, soleiras, torres, bandeja e o
    // proprio eixo de torcao, que e uma viga oca e acumula agua por dentro
    const pontos = [
      [0.745, 0.32, -1.63], [-0.745, 0.32, -1.63],
      [0.745, 0.32, 1.62], [-0.745, 0.32, 1.62],
      [0.715, 0.295, -0.55], [-0.715, 0.295, -0.55],
      [0.715, 0.295, 0.45], [-0.715, 0.295, 0.45],
      [0, 0.29, -1.70],
      [0.505, 0.79, EIXO_D], [-0.505, 0.79, EIXO_D],
      [0, 0.245, EIXO_T],
    ];
    for (const p of pontos) {
      const m = mk(new THREE.SphereGeometry(0.058, 16, 12), alerta);
      m.position.set(...p);
      m.castShadow = false;
      g.add(m);
    }
    g.visible = false;
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

    const gp = grupo(`pneu-${sufixo}`, [x, R_RODA, z]);
    const banda = mk(new THREE.CylinderGeometry(R_RODA, R_RODA, LARG_PNEU, 40, 1, true), M.borracha());
    banda.rotation.z = Math.PI / 2;
    gp.add(banda);
    for (const s of [-1, 1]) {
      const flanco = mk(B.lathe([
        [0.165, 0], [0.225, 0.006], [0.268, 0.016], [R_RODA, 0.026],
      ], 36), M.borracha());
      flanco.rotation.z = s * Math.PI / 2;
      flanco.position.x = s * (LARG_PNEU / 2 - 0.026);
      gp.add(flanco);
    }
    for (let i = 0; i < 4; i++) {
      const sulco = mk(new THREE.CylinderGeometry(R_RODA - 0.006, R_RODA - 0.006, 0.011, 36, 1, true), M.borracha());
      sulco.rotation.z = Math.PI / 2;
      sulco.position.x = -LARG_PNEU / 2 + 0.026 + i * 0.041;
      gp.add(sulco);
    }
    raiz.add(gp);
    viewer.registrar(`pneus@${sufixo}`, gp, [lado * 0.55, 0, 0]);

    const gr = grupo(`roda-${sufixo}`, [x, R_RODA, z]);
    const aro = mk(B.lathe([
      [0.065, -0.070], [0.165, -0.070], [0.158, -0.028], [0.156, 0.028], [0.165, 0.068], [0.065, 0.068],
    ], 34), M.acoPreto());
    aro.rotation.z = Math.PI / 2;
    gr.add(aro);

    const face = mk(B.lathe([
      [0.000, 0.028], [0.034, 0.028], [0.042, 0.023], [0.052, 0.018],
      [0.095, 0.012], [0.138, 0.005], [0.156, -0.004], [0.161, -0.016],
    ], 38), M.aco());
    face.rotation.z = -lado * Math.PI / 2;
    face.position.x = lado * 0.024;
    gr.add(face);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const furo = mk(B.cylX(0.019, 0.028, 14), M.acoPreto());
      furo.position.set(lado * 0.038, Math.cos(a) * 0.092, Math.sin(a) * 0.092);
      gr.add(furo);
    }
    // padrao 4x100, igual ao Civic
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const porcaRoda = mk(B.porca(0.018), M.cromo());
      porcaRoda.rotation.z = -lado * Math.PI / 2;
      porcaRoda.position.set(lado * 0.048, Math.cos(a) * 0.047, Math.sin(a) * 0.047);
      gr.add(porcaRoda);
    }
    const calota = mk(B.lathe([[0, 0.016], [0.019, 0.016], [0.026, 0.010], [0.030, 0.000]], 22),
      new THREE.MeshStandardMaterial({ color: 0xa9afb7, metalness: 0.6, roughness: 0.4 }));
    calota.rotation.z = -lado * Math.PI / 2;
    calota.position.x = lado * 0.046;
    gr.add(calota);

    raiz.add(gr);
    viewer.registrar(`rodas@${sufixo}`, gr, [lado * 0.35, 0, 0]);
  }
  return raiz;
}

/* ======================================================== SUSPENSAO === */

/** Um canto dianteiro McPherson: UM braco inferior, sem braco superior. */
function cantoDianteiro(viewer, raiz, lado) {
  const x = lado * MEIA_BITOLA_D;
  const z = EIXO_D;
  const sufixo = `D${lado > 0 ? 'E' : 'D'}`;
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(`${id}@${sufixo}`, g, ex); return g; };

  const xRoda = lado * (Math.abs(x) - 0.095);
  const xInterno = lado * 0.19;

  {
    const g = grupo('manga', [xRoda, R_RODA, z]);
    const corpo = mk(B.roundedBox(0.070, 0.290, 0.105, 0.016, 0.005), M.aco());
    g.add(corpo);
    const cubo = mk(B.cylX(0.050, 0.080, 22), M.aco());
    cubo.position.x = lado * 0.042;
    g.add(cubo);
    // no McPherson a manga sobe e abraca a base do amortecedor
    const abraco = mk(B.roundedBox(0.062, 0.090, 0.080, 0.012, 0.004), M.aco());
    abraco.position.set(0, 0.130, 0);
    g.add(abraco);
    const bracoDir = mk(B.roundedBox(0.050, 0.040, 0.095, 0.010, 0.004), M.aco());
    bracoDir.position.set(0, 0.010, -0.098);
    g.add(bracoDir);
    // rolamento de roda dentro do cubo
    const rolamento = mk(B.ring(0.048, 0.024, 0.050, 26), M.aco());
    rolamento.rotation.z = Math.PI / 2;
    rolamento.position.x = lado * 0.042;
    g.add(rolamento);
    reg('manga-eixo', g, [lado * 0.24, 0, 0]);
  }

  {
    // braco inferior UNICO — a marca do McPherson
    const g = grupo('bandeja');
    const compr = Math.abs(xRoda - xInterno);
    const braco = mk(B.roundedBox(compr, 0.036, 0.090, 0.012, 0.004), M.acoPreto());
    braco.position.set((xRoda + xInterno) / 2, R_RODA - 0.108, z);
    braco.rotation.z = lado * 0.05;
    g.add(braco);
    const ramo = mk(B.roundedBox(compr * 0.88, 0.028, 0.055, 0.010, 0.003), M.acoPreto());
    ramo.position.set((xRoda + xInterno) / 2, R_RODA - 0.108, z - 0.145);
    ramo.rotation.y = lado * 0.20;
    g.add(ramo);
    for (const dz of [0, -0.175]) {
      const bucha = mk(B.ring(0.028, 0.012, 0.046, 20), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.set(xInterno, R_RODA - 0.108, z + dz);
      g.add(bucha);
    }
    reg('bandeja-suspensao', g, [lado * 0.20, -0.24, 0]);
  }

  {
    const g = grupo('pivo');
    const corpo = mk(B.lathe([[0, 0], [0.021, 0.002], [0.023, 0.015], [0.016, 0.028], [0, 0.030]], 18), M.aco());
    corpo.position.set(xRoda, R_RODA - 0.108, z);
    g.add(corpo);
    const coifa = mk(B.lathe([[0.011, 0], [0.020, 0.008], [0.019, 0.017], [0.010, 0.023]], 16), M.borracha());
    coifa.position.set(xRoda, R_RODA - 0.078, z);
    g.add(coifa);
    reg('pivo-suspensao', g, [lado * 0.30, -0.10, 0]);
  }

  {
    // conjunto McPherson: o amortecedor E o elemento estrutural
    const yBase = R_RODA - 0.02;
    const yTopo = 0.835;
    const g = grupo('amortecedor');
    const corpo = mk(B.cyl(0.028, 0.030, 0.30, 22), M.acoPreto());
    corpo.position.set(xRoda, yBase + 0.15, z);
    g.add(corpo);
    const haste = mk(B.cyl(0.0105, 0.0105, yTopo - yBase - 0.28, 16), M.cromo());
    haste.position.set(xRoda, yBase + 0.30 + (yTopo - yBase - 0.28) / 2, z);
    g.add(haste);
    reg('amortecedor-dianteiro', g, [lado * 0.16, 0.30, 0]);

    const gm = grupo('mola', [xRoda, yBase + 0.14, z]);
    const mola = mk(B.molaHelicoidal(0.058, 0.0100, 6.0, yTopo - yBase - 0.18), M.acoPreto());
    gm.add(mola);
    for (const py of [0, yTopo - yBase - 0.18]) {
      const prato = mk(B.ring(0.070, 0.028, 0.009, 22), M.acoPreto());
      prato.position.y = py;
      gm.add(prato);
    }
    raiz.add(gm);
    viewer.registrar(`mola-dianteira@${sufixo}`, gm, [lado * 0.16, 0.36, 0]);

    const gc = grupo('coxim', [xRoda, yTopo, z]);
    const coxim = mk(B.lathe([[0, 0], [0.058, 0], [0.060, 0.011], [0.046, 0.028], [0, 0.032]], 22), M.borracha());
    gc.add(coxim);
    const rolamentoTopo = mk(B.ring(0.042, 0.020, 0.015, 20), M.aco());
    rolamentoTopo.position.y = -0.013;
    gc.add(rolamentoTopo);
    raiz.add(gc);
    viewer.registrar(`coxim-amortecedor@${sufixo}`, gc, [lado * 0.14, 0.42, 0]);
  }

  {
    const g = grupo('bieleta');
    const yA = R_RODA - 0.085, yB = R_RODA + 0.070;
    const haste = mk(B.cyl(0.0075, 0.0075, yB - yA, 12), M.aco());
    haste.position.set(xRoda - lado * 0.085, (yA + yB) / 2, z - 0.105);
    g.add(haste);
    for (const py of [yA, yB]) {
      const esfera = mk(new THREE.SphereGeometry(0.015, 14, 12), M.aco());
      esfera.position.set(xRoda - lado * 0.085, py, z - 0.105);
      g.add(esfera);
    }
    reg('bieleta', g, [lado * 0.26, 0.14, 0]);
  }

  /* ------------------------------------------------------- freios --- */
  {
    const gd = grupo('disco', [xRoda + lado * 0.048, R_RODA, z]);
    // disco SOLIDO de 239 mm — um unico corpo, sem canal de ventilacao no meio
    const pista = mk(B.lathe([
      [0.028, -0.005], [0.068, -0.005], [0.068, -0.0050], [0.1195, -0.0050],
      [0.1195, 0.0050], [0.068, 0.0050], [0.068, 0.005], [0.028, 0.005],
    ], 36), M.ferroOxidado());
    pista.rotation.z = Math.PI / 2;
    gd.add(pista);
    raiz.add(gd);
    viewer.registrar(`disco-freio@${sufixo}`, gd, [lado * 0.30, 0, 0]);

    const gp = grupo('pinca', [xRoda + lado * 0.042, R_RODA + 0.070, z - 0.050]);
    const corpo = mk(B.roundedBox(0.066, 0.095, 0.105, 0.014, 0.005), M.aco());
    gp.add(corpo);
    const ponte = mk(B.roundedBox(0.078, 0.040, 0.050, 0.010, 0.004), M.aco());
    ponte.position.set(0, 0.034, 0.018);
    gp.add(ponte);
    const mangueira = mk(B.hose([
      [0, 0.042, -0.035], [lado * -0.045, 0.12, -0.08], [lado * -0.080, 0.24, -0.09],
    ], 0.0075), M.borracha());
    gp.add(mangueira);
    raiz.add(gp);
    viewer.registrar(`pinca-freio@${sufixo}`, gp, [lado * 0.36, 0.10, 0]);

    const gpa = grupo('pastilhas', [xRoda + lado * 0.048, R_RODA + 0.042, z - 0.050]);
    for (const s of [-1, 1]) {
      const p = mk(B.roundedBox(0.014, 0.056, 0.082, 0.004, 0.002), M.lonaFreio());
      p.position.x = s * 0.014;
      gpa.add(p);
      const chapa = mk(B.roundedBox(0.004, 0.064, 0.088, 0.004, 0.002), M.aco());
      chapa.position.x = s * 0.023;
      gpa.add(chapa);
    }
    raiz.add(gpa);
    viewer.registrar(`pastilhas-freio@${sufixo}`, gpa, [lado * 0.44, 0.14, 0]);
  }

  /* ------------------------------------------------- semi-eixo --- */
  {
    // o cambio fica ATRAS do eixo dianteiro, entao o semi-eixo vem de tras
    const xCambio = lado * 0.14;
    const zCambio = 1.02;
    const g = grupo('semi-eixo');
    const pontos = [
      [xCambio, R_RODA - 0.02, zCambio],
      [(xCambio + xRoda) / 2, R_RODA - 0.03, (zCambio + z) / 2],
      [xRoda - lado * 0.05, R_RODA - 0.02, z],
    ];
    const eixo = mk(B.hose(pontos, 0.017, { segments: 20 }), M.aco());
    g.add(eixo);
    for (const [hx, hy, hz] of [pontos[0], pontos[2]]) {
      const junta = mk(B.lathe([
        [0, -0.026], [0.040, -0.026], [0.042, -0.010], [0.042, 0.012], [0.032, 0.026], [0, 0.026],
      ], 20), M.aco());
      junta.rotation.z = Math.PI / 2;
      junta.position.set(hx, hy, hz);
      g.add(junta);
    }
    const coifa = mk(B.fole([
      [xRoda - lado * 0.075, R_RODA - 0.022, z + 0.010],
      [xRoda - lado * 0.135, R_RODA - 0.026, z + 0.045],
    ], 0.032, { rings: 6, amp: 0.009 }), M.borracha());
    g.add(coifa);
    reg('semi-eixos', g, [lado * 0.24, -0.18, 0]);
  }
}

export function construirSuspensao(viewer) {
  const raiz = grupo('suspensao');
  viewer.adicionar(raiz);

  for (const lado of [1, -1]) cantoDianteiro(viewer, raiz, lado);

  /* --------------------------------- barra estabilizadora dianteira --- */
  {
    const g = grupo('estabilizadora', [0, R_RODA - 0.075, EIXO_D - 0.135]);
    const barra = mk(B.cylX(0.012, 1.10, 18), M.acoPreto());
    g.add(barra);
    for (const lado of [1, -1]) {
      const ponta = mk(B.hose([
        [lado * 0.55, 0, 0], [lado * 0.585, 0, 0.05], [lado * 0.595, -0.01, 0.09],
      ], 0.012), M.acoPreto());
      g.add(ponta);
      const bucha = mk(B.ring(0.026, 0.013, 0.042, 18), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.x = lado * 0.30;
      g.add(bucha);
    }
    raiz.add(g);
    viewer.registrar('bieleta@barra', g, [0, -0.26, 0]);
  }

  /* ------------------------------------- EIXO DE TORCAO TRASEIRO --- */
  {
    /*
     * A traseira nao tem bracos, pivos nem buchas de braco: e UMA viga em U
     * que liga as duas rodas e se torce. Isso e o oposto do duplo braco
     * traseiro do Civic — muito mais barato, e o item a inspecionar aqui e a
     * CORROSAO da propria viga, que e oca.
     */
    const g = grupo('eixo-torcao');

    const viga = mk(B.roundedBox(1.16, 0.085, 0.075, 0.020, 0.006), M.acoPreto());
    viga.position.set(0, R_RODA - 0.045, EIXO_T - 0.030);
    g.add(viga);

    for (const lado of [1, -1]) {
      // braco longitudinal soldado na viga, indo ate a ancoragem na carroceria
      const braco = mk(B.roundedBox(0.070, 0.080, 0.520, 0.014, 0.005), M.acoPreto());
      braco.position.set(lado * 0.585, R_RODA - 0.045, EIXO_T + 0.235);
      g.add(braco);

      // bucha de ancoragem — item de inspecao
      const bucha = mk(B.ring(0.036, 0.016, 0.055, 20), M.borracha());
      bucha.rotation.z = Math.PI / 2;
      bucha.position.set(lado * 0.585, R_RODA - 0.045, EIXO_T + 0.495);
      g.add(bucha);

      // ponta de eixo traseira + cubo
      const ponta = mk(B.roundedBox(0.075, 0.150, 0.100, 0.012, 0.004), M.aco());
      ponta.position.set(lado * 0.640, R_RODA, EIXO_T);
      g.add(ponta);
      const cubo = mk(B.cylX(0.044, 0.070, 20), M.aco());
      cubo.position.set(lado * 0.672, R_RODA, EIXO_T);
      g.add(cubo);
    }
    raiz.add(g);
    viewer.registrar('eixo-torcao', g, [0, -0.32, 0]);
  }

  for (const lado of [1, -1]) {
    const sufixo = `T${lado > 0 ? 'E' : 'D'}`;

    // mola traseira, separada do amortecedor
    const gm = grupo(`mola-t-${sufixo}`, [lado * 0.545, R_RODA + 0.010, EIXO_T + 0.055]);
    const mola = mk(B.molaHelicoidal(0.055, 0.0095, 5.5, 0.235), M.acoPreto());
    gm.add(mola);
    for (const py of [0, 0.235]) {
      const prato = mk(B.ring(0.066, 0.026, 0.008, 22), M.acoPreto());
      prato.position.y = py;
      gm.add(prato);
    }
    raiz.add(gm);
    viewer.registrar(`mola-dianteira@T${sufixo}`, gm, [lado * 0.16, 0.30, 0]);

    // amortecedor traseiro, quase vertical
    const ga = grupo(`amort-t-${sufixo}`, [lado * 0.625, 0, EIXO_T - 0.020]);
    const corpo = mk(B.cyl(0.024, 0.026, 0.215, 20), M.acoPreto());
    corpo.position.y = R_RODA + 0.045;
    ga.add(corpo);
    const haste = mk(B.cyl(0.0095, 0.0095, 0.190, 14), M.cromo());
    haste.position.y = R_RODA + 0.245;
    ga.add(haste);
    const olhalBaixo = mk(B.ring(0.022, 0.010, 0.032, 18), M.acoPreto());
    olhalBaixo.rotation.z = Math.PI / 2;
    olhalBaixo.position.y = R_RODA - 0.062;
    ga.add(olhalBaixo);
    raiz.add(ga);
    viewer.registrar(`amortecedor-traseiro@${sufixo}`, ga, [lado * 0.16, 0.32, 0]);

    // freio a tambor traseiro
    const gt = grupo(`tambor-${sufixo}`, [lado * (MEIA_BITOLA_T - 0.055), R_RODA, EIXO_T]);
    // tambor de 180 mm internos e 210 mm externos
    const tambor = mk(B.lathe([
      [0.028, -0.018], [0.055, -0.024], [0.103, -0.024], [0.105, 0.028],
      [0.101, 0.032], [0.028, 0.032],
    ], 32), M.ferroOxidado());
    // o perfil do tambor e assimetrico no proprio eixo, entao a rotacao precisa
    // acompanhar o lado — com angulo fixo, o tambor da direita monta virado
    tambor.rotation.z = lado * Math.PI / 2;
    gt.add(tambor);
    for (const s of [-1, 1]) {
      const lona = mk(B.ring(0.090, 0.079, 0.036, 22, true), M.lonaFreio());
      lona.rotation.z = Math.PI / 2;
      lona.position.set(-lado * 0.010, s * 0.004, 0);
      gt.add(lona);
    }
    raiz.add(gt);
    viewer.registrar(`tambor-freio@${sufixo}`, gt, [lado * 0.34, 0, 0]);
  }

  return raiz;
}

/* ===================================================== TRANSMISSAO === */

export function construirTransmissao(viewer) {
  const raiz = grupo('transmissao');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  const Y = 0.375;   // acompanha a linha de centro do virabrequim

  {
    // cambio ATRAS do motor, apontando para dentro do carro
    const g = grupo('caixa-cambio', [0.02, Y - 0.02, 1.10]);
    const campana = mk(B.lathe([
      [0, -0.075], [0.145, -0.075], [0.150, -0.050], [0.150, 0.050], [0.132, 0.075], [0, 0.075],
    ], 28), M.aluminioFundido());
    campana.rotation.x = Math.PI / 2;
    campana.position.z = 0.100;
    g.add(campana);
    const corpo = mk(B.roundedBox(0.215, 0.225, 0.270, 0.030, 0.008), M.aluminioFundido());
    corpo.position.set(0, -0.010, -0.090);
    g.add(corpo);
    for (let i = 0; i < 4; i++) {
      const n = mk(B.roundedBox(0.220, 0.180, 0.011, 0.004, 0.002), M.aluminioFundido());
      n.position.set(0, -0.010, -0.010 - i * 0.050);
      g.add(n);
    }
    // diferencial integrado, de onde saem os semi-eixos
    const dif = mk(B.lathe([[0, -0.070], [0.090, -0.070], [0.092, 0.070], [0, 0.072]], 24), M.aluminioFundido());
    dif.rotation.z = Math.PI / 2;
    dif.position.set(0, -0.045, -0.080);
    g.add(dif);
    reg('caixa-cambio', g, [0, 0, -0.55]);
  }

  {
    const g = grupo('engrenagens', [0.02, Y - 0.05, 0.98]);
    const rel = [[22, 0.036], [27, 0.044], [32, 0.052], [36, 0.058], [39, 0.062]];
    const eixoP = mk(B.cylZ(0.015, 0.245, 16), M.aco());
    eixoP.position.y = 0.042;
    g.add(eixoP);
    const eixoS = mk(B.cylZ(0.017, 0.245, 16), M.aco());
    eixoS.position.y = -0.050;
    g.add(eixoS);
    rel.forEach(([dentes, r], i) => {
      const gz = 0.085 - i * 0.045;
      const eng = mk(B.engrenagem(dentes, r, 0.019, { rFuro: 0.015 }), M.aco());
      eng.rotation.x = Math.PI / 2;
      eng.position.set(0, 0.042, gz);
      g.add(eng);
      const par = mk(B.engrenagem(Math.round(dentes * 1.28), r * 1.22, 0.019, { rFuro: 0.017 }), M.aco());
      par.rotation.x = Math.PI / 2;
      par.position.set(0, -0.050, gz);
      g.add(par);
    });
    reg('caixa-cambio@engrenagens', g, [0.55, 0.12, 0]);
  }

  {
    const g = grupo('trambulador', [0.02, Y - 0.05, 0.62]);
    // haste comprida ligando a alavanca a caixa — o ponto fraco conhecido
    const haste = mk(B.cylZ(0.016, 0.62, 14), M.aco());
    haste.position.set(0, 0.070, -0.28);
    g.add(haste);
    const alavancaBase = mk(B.roundedBox(0.055, 0.090, 0.055, 0.010, 0.003), M.acoPreto());
    alavancaBase.position.set(0, 0.115, -0.58);
    g.add(alavancaBase);
    for (const dz of [0.0, -0.30, -0.56]) {
      const bucha = mk(B.ring(0.026, 0.014, 0.030, 18), M.borracha());
      bucha.rotation.x = Math.PI / 2;
      bucha.position.set(0, 0.070, dz);
      g.add(bucha);
    }
    const forquilha = mk(B.roundedBox(0.070, 0.045, 0.050, 0.008, 0.003), M.aco());
    forquilha.position.set(0, 0.055, 0.03);
    g.add(forquilha);
    reg('trambulador', g, [0, 0.26, -0.30]);
  }

  {
    const g = grupo('volante-motor', [0.02, Y, 1.235]);
    const volante = mk(B.lathe([
      [0, -0.014], [0.105, -0.014], [0.108, -0.005], [0.108, 0.011], [0.092, 0.016], [0, 0.016],
    ], 32), M.ferroFundido());
    volante.rotation.x = Math.PI / 2;
    g.add(volante);
    const cremalheira = mk(B.engrenagem(92, 0.112, 0.013, { rFuro: 0.099 }), M.aco());
    cremalheira.rotation.x = Math.PI / 2;
    g.add(cremalheira);
    reg('volante-motor', g, [0, -0.25, 0.30]);
  }

  {
    const g = grupo('disco-embreagem', [0.02, Y, 1.203]);
    const disco = mk(B.ring(0.098, 0.026, 0.009, 32), M.lonaFreio());
    disco.rotation.x = Math.PI / 2;
    g.add(disco);
    const cubo = mk(B.lathe([[0, -0.018], [0.034, -0.018], [0.034, 0.018], [0, 0.018]], 20), M.aco());
    cubo.rotation.x = Math.PI / 2;
    g.add(cubo);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const mola = mk(B.cylZ(0.009, 0.024, 10), M.aco());
      mola.position.set(Math.cos(a) * 0.050, Math.sin(a) * 0.050, 0);
      g.add(mola);
    }
    reg('embreagem-disco', g, [0, 0.28, 0.40]);
  }

  {
    const g = grupo('plato', [0.02, Y, 1.172]);
    const carcaca = mk(B.lathe([
      [0.028, -0.013], [0.105, -0.013], [0.108, 0.004], [0.098, 0.024], [0.028, 0.024],
    ], 28), M.aco());
    carcaca.rotation.x = -Math.PI / 2;
    g.add(carcaca);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const lam = mk(B.roundedBox(0.013, 0.064, 0.007, 0.002, 0.001), M.aco());
      lam.position.set(Math.cos(a) * 0.050, Math.sin(a) * 0.050, -0.013);
      lam.rotation.z = a;
      g.add(lam);
    }
    const rolamentoEmb = mk(B.lathe([[0.020, -0.016], [0.038, -0.016], [0.038, 0.016], [0.020, 0.016]], 22), M.aco());
    rolamentoEmb.rotation.x = Math.PI / 2;
    rolamentoEmb.position.z = -0.035;
    g.add(rolamentoEmb);
    reg('embreagem-plato', g, [0, 0.30, 0.50]);
  }

  {
    // acionamento por CABO — nao ha cilindro nem fluido
    const g = grupo('cabo-embreagem');
    const cabo = mk(B.hose([
      [0.36, 0.62, 0.90], [0.30, 0.58, 1.00], [0.18, 0.50, 1.08], [0.10, 0.455, 1.10],
    ], 0.008, { segments: 26 }), M.borracha());
    g.add(cabo);
    const garfo = mk(B.roundedBox(0.016, 0.130, 0.030, 0.005, 0.002), M.aco());
    garfo.position.set(0.10, 0.495, 1.115);
    garfo.rotation.z = 0.25;
    g.add(garfo);
    const regulador = mk(B.lathe([[0, 0], [0.015, 0], [0.015, 0.035], [0, 0.036]], 14), M.aco());
    regulador.rotation.z = Math.PI / 2;
    regulador.position.set(0.135, 0.470, 1.105);
    g.add(regulador);
    reg('cabo-embreagem', g, [0.30, 0.30, 0]);
  }

  return raiz;
}

/* ================================================ FREIO — COMANDO === */

export function construirComandoFreio(viewer) {
  const raiz = grupo('comando-freio');
  viewer.adicionar(raiz);

  const g = grupo('cilindro-mestre', [0.36, 0.735, 1.02]);
  const servo = mk(B.lathe([
    [0, -0.060], [0.092, -0.060], [0.098, -0.046], [0.098, 0.046], [0.092, 0.060], [0, 0.060],
  ], 28), M.aco());
  servo.rotation.x = Math.PI / 2;
  g.add(servo);
  const mestre = mk(B.lathe([
    [0, 0], [0.030, 0.004], [0.032, 0.018], [0.032, 0.085], [0.026, 0.094], [0, 0.096],
  ], 22), M.aluminioFundido());
  mestre.rotation.x = -Math.PI / 2;
  mestre.position.z = 0.062;
  g.add(mestre);
  const reservatorio = mk(B.roundedBox(0.070, 0.050, 0.125, 0.012, 0.004),
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e9ec, roughness: 0.30, metalness: 0,
      transmission: 0.6, thickness: 0.02, transparent: true, opacity: 0.5,
    }));
  reservatorio.position.set(0, 0.052, 0.100);
  g.add(reservatorio);
  const fluidoDentro = mk(B.roundedBox(0.058, 0.028, 0.112, 0.010, 0.003), M.fluido(0x8a6a20));
  fluidoDentro.position.set(0, 0.042, 0.100);
  g.add(fluidoDentro);
  const tampaRes = mk(B.cyl(0.018, 0.018, 0.013, 16), M.plasticoPreto());
  tampaRes.position.set(0, 0.084, 0.100);
  g.add(tampaRes);
  for (const dx of [-0.018, 0.018]) {
    const linha = mk(B.hose([
      [dx, 0.005, 0.150], [dx * 2.5, -0.05, 0.22], [dx * 5, -0.28, 0.16],
    ], 0.0045, { segments: 18 }), M.aco());
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

  const Y = 0.325, Z = 1.05;

  {
    // caixa MECANICA: sem linhas hidraulicas, sem reservatorio
    const g = grupo('caixa-direcao', [0, Y, Z]);
    const carcaca = mk(B.cylX(0.028, 0.98, 20), M.aluminioFundido());
    g.add(carcaca);
    const pinhaoCaixa = mk(B.lathe([[0, 0], [0.036, 0], [0.038, 0.050], [0.026, 0.064], [0, 0.066]], 20), M.aluminioFundido());
    pinhaoCaixa.position.set(0.30, 0.02, 0);
    pinhaoCaixa.rotation.x = -0.28;
    g.add(pinhaoCaixa);
    for (const lado of [1, -1]) {
      const coifa = mk(B.fole([[lado * 0.48, 0, 0], [lado * 0.575, 0, 0]], 0.026, { rings: 6, amp: 0.007 }), M.borracha());
      g.add(coifa);
    }
    reg('caixa-direcao', g, [0, -0.30, 0.20]);
  }

  for (const lado of [1, -1]) {
    const sufixo = lado > 0 ? 'E' : 'D';
    const g = grupo(`terminal-${sufixo}`);
    const barra = mk(B.cylX(0.013, 0.14, 16), M.aco());
    barra.position.set(lado * 0.645, Y, Z);
    g.add(barra);
    const terminal = mk(B.lathe([[0, 0], [0.022, 0.004], [0.024, 0.018], [0.015, 0.032], [0, 0.034]], 18), M.aco());
    terminal.position.set(lado * 0.720, Y, Z + 0.02);
    g.add(terminal);
    const coifinha = mk(B.lathe([[0.011, 0], [0.020, 0.008], [0.018, 0.018], [0.009, 0.024]], 16), M.borracha());
    coifinha.position.set(lado * 0.720, Y + 0.030, Z + 0.02);
    g.add(coifinha);
    const haste = mk(B.cylX(0.012, 0.10, 14), M.aco());
    haste.position.set(lado * 0.745, Y, Z + 0.10);
    haste.rotation.y = -lado * 0.6;
    g.add(haste);
    raiz.add(g);
    viewer.registrar(`terminal-direcao@${sufixo}`, g, [lado * 0.34, 0, 0]);
  }

  {
    const g = grupo('coluna', [0.34, 0.60, 0.60]);
    const coluna = mk(B.cyl(0.019, 0.019, 0.50, 16), M.aco());
    coluna.rotation.x = Math.PI / 2 - 0.40;
    g.add(coluna);
    const volante = mk(new THREE.TorusGeometry(0.180, 0.016, 14, 36), M.borracha());
    volante.position.set(0.01, 0.185, -0.19);
    volante.rotation.x = 0.40;
    g.add(volante);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
      const raio = mk(B.roundedBox(0.024, 0.170, 0.009, 0.004, 0.002), M.plasticoPreto());
      raio.position.set(
        0.01 + Math.cos(a) * 0.085,
        0.185 + Math.sin(a) * 0.085 * Math.cos(0.40),
        -0.19 + Math.sin(a) * 0.085 * Math.sin(0.40),
      );
      raio.rotation.set(0.40, 0, -a + Math.PI / 2);
      g.add(raio);
    }
    const cubo = mk(B.lathe([[0, 0], [0.050, 0], [0.050, 0.028], [0, 0.030]], 20), M.plasticoPreto());
    cubo.position.set(0.01, 0.185, -0.19);
    cubo.rotation.x = Math.PI / 2 + 0.40;
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
    const g = grupo('radiador', [0, 0.560, 1.780]);
    const nucleo = mk(B.nucleoAletado(0.58, 0.32, 0.038, 48), M.aluminioRadiador());
    g.add(nucleo);
    for (const s of [-1, 1]) {
      const tanque = mk(B.roundedBox(0.050, 0.355, 0.050, 0.012, 0.004), M.plasticoPreto());
      tanque.position.x = s * 0.318;
      g.add(tanque);
    }
    const bocalSup = mk(B.cylZ(0.019, 0.045, 16), M.plasticoPreto());
    bocalSup.position.set(0.27, 0.135, -0.035);
    g.add(bocalSup);
    const bocalInf = mk(B.cylZ(0.019, 0.045, 16), M.plasticoPreto());
    bocalInf.position.set(-0.27, -0.135, -0.035);
    g.add(bocalInf);
    reg('radiador', g, [0, 0.20, 0.55]);
  }

  {
    const g = grupo('ventoinha', [-0.10, 0.560, 1.700]);
    const carcaca = mk(B.ring(0.170, 0.152, 0.050, 28), M.plasticoPreto());
    carcaca.rotation.x = Math.PI / 2;
    g.add(carcaca);
    const helice = new THREE.Group();
    const cuboV = mk(B.cylZ(0.034, 0.042, 18), M.plasticoPreto());
    helice.add(cuboV);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const pa = mk(B.roundedBox(0.050, 0.130, 0.007, 0.010, 0.002), M.plasticoPreto());
      pa.position.set(Math.cos(a) * 0.085, Math.sin(a) * 0.085, 0);
      pa.rotation.z = -a + Math.PI / 2;
      pa.rotation.y = 0.45;
      helice.add(pa);
    }
    g.add(helice);
    reg('ventoinha', g, [-0.20, 0.10, -0.35]);
    viewer.animar((dt) => { if (viewer.motorLigado) helice.rotation.z += dt * 14; });
  }

  {
    const g = grupo('mangueiras');
    const sup = mk(B.hose([
      [0.27, 0.695, 1.745], [0.24, 0.72, 1.66], [0.10, 0.70, 1.58], [0.02, 0.66, 1.53],
    ], 0.019, { segments: 26 }), M.borracha());
    g.add(sup);
    const inf = mk(B.hose([
      [-0.27, 0.425, 1.745], [-0.24, 0.40, 1.66], [-0.12, 0.40, 1.58], [-0.06, 0.40, 1.52],
    ], 0.019, { segments: 26 }), M.borracha());
    g.add(inf);
    for (const p of [[0.25, 0.71, 1.71], [0.05, 0.67, 1.55], [-0.26, 0.415, 1.71], [-0.08, 0.40, 1.54]]) {
      const abr = mk(B.ring(0.024, 0.019, 0.009, 16), M.aco());
      abr.rotation.x = Math.PI / 2;
      abr.position.set(...p);
      g.add(abr);
    }
    reg('mangueiras-radiador', g, [0, 0.35, 0.20]);
  }

  {
    const g = grupo('reservatorio', [0.47, 0.716, 1.58]);
    const corpo = mk(B.roundedBox(0.105, 0.175, 0.095, 0.020, 0.005),
      new THREE.MeshPhysicalMaterial({
        color: 0xdfe6ea, roughness: 0.35, metalness: 0,
        transmission: 0.55, thickness: 0.02, transparent: true, opacity: 0.55,
      }));
    g.add(corpo);
    const nivel = mk(B.roundedBox(0.090, 0.078, 0.080, 0.016, 0.004), M.fluido(0x2f8f5a));
    nivel.position.y = -0.040;
    g.add(nivel);
    const tampaR = mk(B.cyl(0.024, 0.024, 0.018, 18), M.plasticoPreto());
    tampaR.position.y = 0.096;
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
    const g = grupo('bateria', [-0.44, 0.745, 1.53]);
    const caixa = mk(B.roundedBox(0.215, 0.175, 0.165, 0.012, 0.004), M.plasticoPreto());
    g.add(caixa);
    const tampaB = mk(B.roundedBox(0.220, 0.018, 0.170, 0.010, 0.003),
      new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.5, metalness: 0.05 }));
    tampaB.position.y = 0.092;
    g.add(tampaB);
    for (const [s, cor] of [[1, 0xb03030], [-1, 0x2a2a2a]]) {
      const polo = mk(B.lathe([[0, 0], [0.012, 0], [0.010, 0.018], [0, 0.020]], 14),
        new THREE.MeshStandardMaterial({ color: cor, metalness: 0.8, roughness: 0.35 }));
      polo.position.set(s * 0.078, 0.102, 0.050);
      g.add(polo);
      const cabo = mk(B.hose([
        [s * 0.078, 0.12, 0.050], [s * 0.14, 0.09, 0.02], [s * 0.18, 0.0, -0.09],
      ], 0.009), M.borracha());
      g.add(cabo);
    }
    reg('bateria', g, [-0.30, 0.35, 0]);
  }

  {
    const g = grupo('motor-partida', [0.15, 0.335, 1.245]);
    const corpo = mk(B.lathe([
      [0, -0.062], [0.042, -0.062], [0.044, -0.052], [0.044, 0.052], [0.040, 0.062], [0, 0.062],
    ], 22), M.aco());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const solenoide = mk(B.lathe([[0, -0.040], [0.024, -0.040], [0.024, 0.040], [0, 0.040]], 18), M.aco());
    solenoide.rotation.x = Math.PI / 2;
    solenoide.position.set(0, 0.050, 0.010);
    g.add(solenoide);
    const pinhao = mk(B.engrenagem(9, 0.017, 0.022, { rFuro: 0.006 }), M.aco());
    pinhao.rotation.x = Math.PI / 2;
    pinhao.position.z = 0.075;
    g.add(pinhao);
    reg('motor-partida', g, [0.30, -0.26, 0]);
  }

  {
    const g = grupo('caixa-fusiveis', [0.52, 0.700, 0.86]);
    const caixa = mk(B.roundedBox(0.155, 0.090, 0.120, 0.012, 0.004), M.plasticoPreto());
    g.add(caixa);
    const tampaF = mk(B.roundedBox(0.160, 0.016, 0.125, 0.010, 0.003), M.plasticoPreto());
    tampaF.position.y = 0.052;
    g.add(tampaF);
    const cores = [0xd94f4f, 0x4f8fd9, 0xd9c14f, 0x6fd94f, 0xd97f4f];
    for (let i = 0; i < 10; i++) {
      const f = mk(B.roundedBox(0.012, 0.018, 0.006, 0.002, 0.001),
        new THREE.MeshStandardMaterial({ color: cores[i % 5], roughness: 0.4, metalness: 0 }));
      f.position.set(-0.055 + (i % 5) * 0.028, 0.046, -0.028 + Math.floor(i / 5) * 0.046);
      g.add(f);
    }
    // chicote saindo da caixa
    const chicote = mk(B.hose([
      [-0.07, 0.02, 0.02], [-0.20, -0.02, 0.10], [-0.34, -0.05, 0.16],
    ], 0.016), M.borracha());
    g.add(chicote);
    reg('chicote-eletrico', g, [0.35, 0.30, 0]);
  }

  {
    const g = grupo('ecu', [-0.42, 0.640, 0.90]);
    const caixa = mk(B.roundedBox(0.180, 0.042, 0.145, 0.010, 0.003), M.aluminioUsinado());
    g.add(caixa);
    const conector = mk(B.roundedBox(0.050, 0.028, 0.018, 0.004, 0.002), M.plasticoPreto());
    conector.position.set(0, 0, -0.080);
    g.add(conector);
    reg('central-injecao', g, [-0.30, 0.25, 0]);
  }

  return raiz;
}

/* ================================================ ESCAPE E COMBUSTIVEL === */

export function construirEscapeCombustivel(viewer) {
  const raiz = grupo('escape-combustivel');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    const g = grupo('catalisador', [-0.14, 0.270, 0.92]);
    const corpo = mk(B.lathe([
      [0.020, -0.150], [0.028, -0.120], [0.050, -0.095], [0.052, 0.095], [0.028, 0.120], [0.020, 0.150],
    ], 20), M.aco());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const blindagem = mk(B.roundedBox(0.125, 0.018, 0.245, 0.010, 0.003), M.aco());
    blindagem.position.y = 0.066;
    g.add(blindagem);
    reg('catalisador', g, [0, -0.35, 0]);
  }

  {
    const g = grupo('escapamento');
    const tubo = mk(B.hose([
      [-0.15, 0.255, 0.75], [-0.17, 0.235, 0.30], [-0.22, 0.228, -0.25],
      [-0.28, 0.245, -0.80], [-0.32, 0.280, -1.30], [-0.34, 0.295, -1.62],
    ], 0.022, { segments: 40 }), M.aco());
    g.add(tubo);
    const silencioso = mk(B.lathe([
      [0.026, -0.185], [0.052, -0.160], [0.078, -0.140], [0.080, 0.140], [0.052, 0.160], [0.026, 0.185],
    ], 22), M.aco());
    silencioso.rotation.x = Math.PI / 2;
    silencioso.position.set(-0.34, 0.300, -1.71);
    g.add(silencioso);
    const ponteira = mk(B.cylZ(0.023, 0.115, 16), M.cromo());
    ponteira.position.set(-0.34, 0.300, -1.87);
    g.add(ponteira);
    for (const z of [-0.30, -1.10, -1.52]) {
      const coxim = mk(B.roundedBox(0.026, 0.050, 0.011, 0.005, 0.002), M.borracha());
      coxim.position.set(-0.20 - Math.abs(z) * 0.06, 0.318, z);
      g.add(coxim);
    }
    reg('escapamento', g, [0, -0.40, -0.25]);
  }

  {
    const g = grupo('tanque', [0, 0.368, -0.86]);
    const tanque = mk(B.roundedBox(0.86, 0.195, 0.50, 0.050, 0.010), M.acoPreto());
    g.add(tanque);
    const gargalo = mk(B.hose([
      [-0.36, 0.05, -0.14], [-0.56, 0.15, -0.28], [-0.66, 0.29, -0.38],
    ], 0.022), M.acoPreto());
    g.add(gargalo);
    reg('tanque-combustivel', g, [0, -0.35, 0]);
  }

  {
    const g = grupo('bomba-combustivel', [0.14, 0.450, -0.80]);
    const flange = mk(B.lathe([[0, 0], [0.058, 0], [0.058, 0.015], [0, 0.017]], 20), M.plasticoPreto());
    g.add(flange);
    const corpo = mk(B.lathe([[0, -0.095], [0.026, -0.095], [0.026, -0.010], [0, 0]], 18), M.aco());
    g.add(corpo);
    const linha = mk(B.hose([
      [0, 0.017, 0], [0.05, 0.03, 0.25], [0.02, 0.05, 0.90], [-0.10, 0.20, 1.10],
    ], 0.006, { segments: 30 }), M.aco());
    g.add(linha);
    reg('bomba-combustivel', g, [0.20, 0.40, 0]);
  }

  {
    const g = grupo('filtro-combustivel', [0.30, 0.315, -0.20]);
    const c = mk(B.lathe([[0, -0.055], [0.030, -0.050], [0.030, 0.050], [0, 0.055]], 20), M.aco());
    c.rotation.x = Math.PI / 2;
    g.add(c);
    const suporte = mk(B.roundedBox(0.012, 0.055, 0.045, 0.004, 0.002), M.acoPreto());
    suporte.position.x = 0.036;
    g.add(suporte);
    reg('filtro-combustivel', g, [0.28, -0.20, 0]);
  }

  return raiz;
}

/* ========================================================= INTERIOR === */

export function construirInterior(viewer) {
  const raiz = grupo('interior');
  viewer.adicionar(raiz);
  const reg = (id, g, ex = [0, 0, 0]) => { raiz.add(g); viewer.registrar(id, g, ex); return g; };

  {
    const g = grupo('bancos');
    const posicoes = [[0.35, 0.20], [-0.35, 0.20], [0.36, -0.72], [-0.36, -0.72], [0, -0.72]];
    posicoes.forEach(([x, z], i) => {
      const traseiro = i >= 2;
      const assento = mk(B.roundedBox(traseiro ? 0.40 : 0.45, 0.13, 0.44, 0.045, 0.010), M.tecido());
      assento.position.set(x, 0.435, z);
      g.add(assento);
      const encosto = mk(B.roundedBox(traseiro ? 0.40 : 0.43, 0.55, 0.12, 0.045, 0.010), M.tecido());
      encosto.position.set(x, 0.690, z - 0.23);
      encosto.rotation.x = -0.18;
      g.add(encosto);
      const apoio = mk(B.roundedBox(0.185, 0.125, 0.095, 0.032, 0.007), M.tecido());
      apoio.position.set(x, 0.980, z - 0.29);
      g.add(apoio);
    });
    reg('bancos-forracao', g, [0, 0.45, 0]);
  }

  {
    const g = grupo('painel', [0, 0.760, 0.78]);
    const corpo = mk(B.roundedBox(1.34, 0.230, 0.340, 0.040, 0.010), M.plasticoPreto());
    corpo.rotation.x = -0.20;
    g.add(corpo);
    const console = mk(B.roundedBox(0.235, 0.280, 0.400, 0.028, 0.007), M.plasticoPreto());
    console.position.set(0, -0.190, -0.330);
    g.add(console);
    // alavanca de cambio: haste longa e inclinada, tipica do trambulador do Gol
    const alavanca = mk(B.cyl(0.013, 0.010, 0.230, 14), M.aco());
    alavanca.position.set(0, -0.060, -0.340);
    alavanca.rotation.x = 0.22;
    g.add(alavanca);
    const manopla = mk(B.lathe([[0, 0], [0.028, 0.010], [0.030, 0.034], [0.020, 0.052], [0, 0.056]], 20), M.plasticoPreto());
    manopla.position.set(0, 0.055, -0.365);
    g.add(manopla);
    const freioMao = mk(B.roundedBox(0.034, 0.042, 0.285, 0.013, 0.004), M.plasticoPreto());
    freioMao.position.set(0, -0.215, -0.560);
    freioMao.rotation.x = 0.30;
    g.add(freioMao);
    reg('painel-console', g, [0, 0.35, 0.25]);
  }

  {
    const g = grupo('instrumentos', [0.34, 0.820, 0.65]);
    const caixa = mk(B.roundedBox(0.320, 0.150, 0.105, 0.018, 0.005), M.plasticoPreto());
    caixa.rotation.x = -0.28;
    g.add(caixa);
    const vidroP = mk(B.roundedBox(0.285, 0.118, 0.007, 0.013, 0.003),
      new THREE.MeshPhysicalMaterial({ color: 0x11161c, roughness: 0.08, metalness: 0.1, clearcoat: 1 }));
    vidroP.position.set(0, 0.012, 0.052);
    vidroP.rotation.x = -0.28;
    g.add(vidroP);
    for (const dx of [-0.070, 0.070]) {
      const mostrador = mk(B.ring(0.048, 0.010, 0.006, 24),
        new THREE.MeshStandardMaterial({ color: 0x1b2129, roughness: 0.6 }));
      mostrador.rotation.x = Math.PI / 2 - 0.28;
      mostrador.position.set(dx, 0.010, 0.050);
      g.add(mostrador);
    }
    reg('painel-instrumentos', g, [0.20, 0.30, 0.25]);
  }

  {
    const g = grupo('cintos');
    for (const [x, z] of [[0.60, 0.05], [-0.60, 0.05], [0.62, -0.88], [-0.62, -0.88]]) {
      const fita = mk(B.roundedBox(0.011, 0.60, 0.045, 0.004, 0.001),
        new THREE.MeshStandardMaterial({ color: 0x1e2228, roughness: 0.95 }));
      fita.position.set(x, 0.770, z);
      fita.rotation.z = Math.sign(x) * 0.16;
      fita.rotation.x = 0.10;
      g.add(fita);
      const retrator = mk(B.roundedBox(0.055, 0.085, 0.065, 0.010, 0.003), M.plasticoPreto());
      retrator.position.set(x, 0.435, z);
      g.add(retrator);
    }
    reg('cintos-seguranca', g, [0, 0.30, 0]);
  }

  {
    const g = grupo('documentos', [0.28, 0.605, 0.28]);
    const pasta = mk(B.roundedBox(0.185, 0.011, 0.260, 0.005, 0.002),
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

  // com a lataria esculpida as lentes vem projetadas na fascia; as caixas por
  // coordenada fixa abaixo boiariam na frente do paralama novo
  if (temModelo(MODELO_G2)) {
    const lenteFarol = new THREE.MeshPhysicalMaterial({
      color: 0xdfe8ee, roughness: 0.06, metalness: 0,
      transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.45,
    });
    for (const [nome, material] of [
      ['Farol', lenteFarol], ['PiscaD', M.lenteAmbar()], ['Lanterna', M.lenteVermelha()],
    ]) {
      const geo = geometria(MODELO_G2, nome);
      if (geo) g.add(mk(geo, material));
    }
    for (const lado of [1, -1]) {
      const carcaca = mk(B.roundedBox(0.44, 0.125, 0.10, 0.020, 0.006), M.refletor());
      carcaca.position.set(lado * 0.470, 0.716, 1.800);
      g.add(carcaca);
    }
    raiz.add(g);
    viewer.registrar('farois-lanternas', g, [0, 0.25, 0.30]);
    return raiz;
  }

  for (const lado of [1, -1]) {
    // farol retangular grande, marca visual do G2
    const carcaca = mk(B.roundedBox(0.42, 0.135, 0.135, 0.020, 0.006), M.refletor());
    carcaca.position.set(lado * 0.475, 0.720, 1.818);
    g.add(carcaca);
    const lente = mk(B.roundedBox(0.42, 0.135, 0.016, 0.020, 0.005),
      new THREE.MeshPhysicalMaterial({
        color: 0xdfe8ee, roughness: 0.06, metalness: 0,
        transmission: 0.9, thickness: 0.02, transparent: true, opacity: 0.4,
      }));
    lente.position.set(lado * 0.475, 0.720, 1.876);
    g.add(lente);
    const pisca = mk(B.roundedBox(0.135, 0.110, 0.014, 0.016, 0.004), M.lenteAmbar());
    pisca.position.set(lado * 0.735, 0.712, 1.860);
    g.add(pisca);

    const lanterna = mk(B.roundedBox(0.180, 0.330, 0.018, 0.022, 0.005), M.lenteVermelha());
    lanterna.position.set(lado * 0.700, 0.700, -1.792);
    g.add(lanterna);
  }
  raiz.add(g);
  viewer.registrar('farois-lanternas', g, [0, 0.25, 0.30]);
  return raiz;
}
