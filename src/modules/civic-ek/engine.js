/**
 * Motor Honda D16Y7 — 1.6 SOHC 16V, montado TRANSVERSAL (eixo do virabrequim
 * no sentido da largura do carro), como e no Civic de traccao dianteira.
 *
 * Sistema de coordenadas local do motor:
 *   X = eixo do virabrequim. +X = lado direito do carro (lado da correia).
 *                            -X = lado esquerdo (lado do cambio).
 *   Y = vertical. Y = 0 na linha de centro do virabrequim.
 *   Z = +Z aponta para a frente do carro (radiador), -Z para o para-brisa.
 *
 * Layout real respeitado: escape para a FRENTE, admissao para TRAS, correia
 * dentada na ponta direita, distribuidor na ponta esquerda do cabecote.
 */
import * as THREE from 'three';
import * as M from '../../core/materials.js';
import * as B from '../../core/builders.js';
import { grupo } from '../comum.js';

/*
 * Geometria interna com medidas publicadas da familia D:
 *   espacamento entre cilindros .... 85 mm
 *   altura de deck (centro do virabrequim ate a face do bloco) ... 212 mm
 *   comprimento da biela (centro a centro) ... 137 mm
 *   diametro x curso ... 75 x 90 mm
 *
 * Os numeros fecham entre si: 212 - (137 + 45) = 30 mm de altura de compressao
 * do pistao. Ou seja, no ponto morto superior a coroa encosta exatamente na
 * face do bloco — e essa consistencia e a prova de que as medidas batem.
 */
const ESPACAMENTO = 0.085;
const CIL = [-1.5, -0.5, 0.5, 1.5].map((n) => n * ESPACAMENTO);
const R_CIL = 0.0375;              // raio do cilindro (diametro 75 mm)
const CURSO = 0.090;               // curso 90 mm
const ALTURA_DECK = 0.212;         // face do bloco, medida do centro do virabrequim
const COMPR_BIELA = 0.137;         // centro a centro
const ALT_COMPRESSAO = ALTURA_DECK - COMPR_BIELA - CURSO / 2;   // = 0,030 m

/**
 * O motor e construido com a correia em +X e o cambio em -X, que e o mais
 * natural de escrever. No carro montado, porem, o cambio do Honda fica do lado
 * do MOTORISTA — que neste referencial (frente em +Z, cima em +Y) e o +X.
 * Por isso o conjunto leva scale.x = -1 no final: isso troca os lados sem mexer
 * no eixo Z, entao a admissao continua voltada para o para-brisa e o escape
 * para o radiador, como e de verdade.
 *
 * Escala negativa inverte o sentido das faces, entao todo material do motor
 * usa side: DoubleSide (clonado uma unica vez por material).
 */
const doisLados = (() => {
  const cache = new Map();
  return (mat) => {
    if (!cache.has(mat)) {
      const c = mat.clone();
      c.side = THREE.DoubleSide;
      cache.set(mat, c);
    }
    return cache.get(mat);
  };
})();

// mk proprio: o motor precisa de materiais DoubleSide por causa do espelhamento
const mk = (geo, mat) => new THREE.Mesh(geo, doisLados(mat));

// Altura da linha de centro do virabrequim em relacao ao chao. Com 0,40 m o
// topo da tampa de valvulas fica em ~0,81 m e as velas em ~0,86 m, passando
// folgadas por baixo da linha do capo (~0,94 m na base do para-brisa).
export function construirMotor(viewer, origem = [0.06, 0.40, 1.36]) {
  const motor = grupo('motor', origem);
  viewer.adicionar(motor);

  const reg = (id, g, explode = [0, 0, 0]) => {
    motor.add(g);
    viewer.registrar(id, g, explode);
    return g;
  };

  /* ================================================== BLOCO DO MOTOR === */
  {
    const g = grupo('bloco');
    // largura derivada do espacamento real: 3 vaos de 85 mm + um diametro de
    // cilindro + paredes externas
    const largura = 3 * ESPACAMENTO + 2 * R_CIL + 0.040;   // ≈ 0,370 m
    // o corpo termina exatamente na altura de deck publicada
    const corpo = mk(B.roundedBox(largura, ALTURA_DECK + 0.012, 0.215, 0.012, 0.005), M.aluminioFundido());
    corpo.position.set(0, ALTURA_DECK / 2 - 0.006, 0);
    g.add(corpo);

    // saia do bloco (parte que desce ate o carter, mais estreita)
    const saia = mk(B.roundedBox(largura - 0.020, 0.115, 0.19, 0.01, 0.004), M.aluminioFundido());
    saia.position.set(0, -0.06, 0);
    g.add(saia);

    // camisas de ferro: sobem do fundo do curso ate a face do bloco
    for (const x of CIL) {
      const camisa = mk(new THREE.CylinderGeometry(R_CIL + 0.004, R_CIL + 0.004, 0.175, 28, 1, true), M.ferroFundido());
      camisa.position.set(x, ALTURA_DECK - 0.0875, 0);
      g.add(camisa);
    }

    // nervuras estruturais na lateral (dao a leitura de bloco fundido)
    for (let i = 0; i < 5; i++) {
      const nerv = mk(B.roundedBox(0.012, 0.15, 0.222, 0.003, 0.001), M.aluminioFundido());
      nerv.position.set(-largura / 2 + 0.028 + i * (largura - 0.056) / 4, 0.085, 0);
      g.add(nerv);
    }

    // flange do cambio (lado esquerdo)
    const flange = mk(B.roundedBox(0.022, 0.29, 0.24, 0.02, 0.004), M.aluminioFundido());
    flange.position.set(-largura / 2 - 0.011, 0.052, 0);
    g.add(flange);

    // gravacao do codigo do motor (placa lisa usinada)
    const placa = mk(B.roundedBox(0.07, 0.03, 0.004, 0.002, 0.001), M.aluminioUsinado());
    placa.position.set(-0.11, 0.140, 0.109);
    g.add(placa);

    reg('bloco-motor', g, [0, 0, 0]);
  }

  /* ============================================== VIRABREQUIM E BIELAS === */
  {
    const g = grupo('virabrequim', [0, 0, 0]);
    // eixo principal
    const eixo = mk(B.cylX(0.024, 0.415, 24), M.aco());
    g.add(eixo);

    // 5 mancais: um entre cada par de cilindros, no espacamento de 85 mm
    for (let i = 0; i < 5; i++) {
      const m = mk(B.cylX(0.032, 0.026, 24), M.aco());
      m.position.x = (i - 2) * ESPACAMENTO;
      g.add(m);
    }

    // 4 munhoes de biela, defasados: 1 e 4 em cima, 2 e 3 embaixo
    const fases = [0, Math.PI, Math.PI, 0];
    CIL.forEach((x, i) => {
      const braco = mk(B.roundedBox(0.020, 0.078, 0.052, 0.006, 0.002), M.aco());
      braco.position.set(x, Math.cos(fases[i]) * CURSO * 0.25, 0);
      braco.rotation.x = 0;
      g.add(braco);
      const munhao = mk(B.cylX(0.021, 0.030, 20), M.aco());
      munhao.position.set(x, Math.cos(fases[i]) * CURSO * 0.5, Math.sin(fases[i]) * 0.001);
      g.add(munhao);
      // contrapeso
      const cp = mk(B.cylX(0.040, 0.016, 20), M.aco());
      cp.position.set(x - 0.026, -Math.cos(fases[i]) * 0.018, 0);
      g.add(cp);
    });
    reg('virabrequim', g, [0, -0.30, 0]);
  }

  {
    const g = grupo('bielas');
    const fases = [0, Math.PI, Math.PI, 0];
    CIL.forEach((x, i) => {
      const yMunhao = Math.cos(fases[i]) * CURSO * 0.5;
      // corpo da biela com o comprimento real de centro a centro
      const b = mk(B.roundedBox(0.016, COMPR_BIELA, 0.030, 0.005, 0.002), M.aco());
      b.position.set(x, yMunhao + COMPR_BIELA / 2, 0);
      g.add(b);
      // olhal maior embaixo (no virabrequim), menor em cima (no pino do pistao)
      const olhalGrande = mk(B.cylX(0.030, 0.024, 18), M.aco());
      olhalGrande.position.set(x, yMunhao, 0);
      g.add(olhalGrande);
      const olhalPequeno = mk(B.cylX(0.017, 0.020, 16), M.aco());
      olhalPequeno.position.set(x, yMunhao + COMPR_BIELA, 0);
      g.add(olhalPequeno);
    });
    reg('bielas', g, [0, -0.16, 0]);
  }

  {
    /*
     * O pistao e posicionado pelo PINO, nao pela coroa. Com o pino em
     * (munhao + 137 mm) e a coroa 30 mm acima dele, o cilindro 1 no ponto morto
     * superior fecha exatamente em 212 mm — a altura de deck real. Se algum
     * desses tres numeros mudar, o encaixe deixa de fechar, e e por isso que
     * eles ficam em constantes no topo do arquivo.
     */
    const g = grupo('pistoes');
    const fases = [0, Math.PI, Math.PI, 0];
    CIL.forEach((x, i) => {
      const yMunhao = Math.cos(fases[i]) * CURSO * 0.5;
      const yPino = yMunhao + COMPR_BIELA;

      const p = mk(B.lathe([
        [0, -0.032], [R_CIL - 0.001, -0.032],
        [R_CIL - 0.001, ALT_COMPRESSAO - 0.016],
        [R_CIL - 0.003, ALT_COMPRESSAO - 0.014],
        [R_CIL - 0.003, ALT_COMPRESSAO - 0.008],
        [R_CIL - 0.001, ALT_COMPRESSAO - 0.006],
        [R_CIL - 0.001, ALT_COMPRESSAO], [0, ALT_COMPRESSAO],
      ], 28), M.aluminioUsinado());
      p.position.set(x, yPino, 0);
      g.add(p);

      // pino do pistao, atravessando a saia
      const pino = mk(B.cylX(0.0095, R_CIL * 1.6, 14), M.aco());
      pino.position.set(x, yPino, 0);
      g.add(pino);

      // tres aneis logo abaixo da coroa
      for (let k = 0; k < 3; k++) {
        const anel = mk(B.ring(R_CIL, R_CIL - 0.004, 0.0022, 26), M.aco());
        anel.position.set(x, yPino + ALT_COMPRESSAO - 0.007 - k * 0.006, 0);
        g.add(anel);
      }
    });
    reg('pistoes', g, [0, 0.22, 0]);
  }

  /* ============================================================ CARTER === */
  {
    const g = grupo('carter', [0, -0.155, 0]);
    const bacia = mk(B.roundedBox(0.375, 0.105, 0.20, 0.016, 0.005), M.aluminioFundido());
    g.add(bacia);
    const flange = mk(B.roundedBox(0.39, 0.010, 0.215, 0.008, 0.002), M.aluminioFundido());
    flange.position.y = 0.055;
    g.add(flange);
    // bujao de dreno
    const bujao = mk(B.parafuso(0.017, 0.014), M.aco());
    bujao.position.set(0.10, -0.052, 0.06);
    bujao.rotation.x = Math.PI;
    g.add(bujao);
    reg('carter', g, [0, -0.34, 0]);
  }

  /* ========================================================== CABECOTE === */
  {
    const g = grupo('cabecote', [0, 0.2695, 0]);
    const corpo = mk(B.roundedBox(0.375, 0.115, 0.235, 0.014, 0.005), M.aluminioFundido());
    g.add(corpo);

    // pocos das velas
    for (const x of CIL) {
      const poco = mk(new THREE.CylinderGeometry(0.019, 0.019, 0.09, 20, 1, true), M.aluminioFundido());
      poco.position.set(x, 0.055, 0);
      g.add(poco);
    }

    // saidas de escape (frente) e admissao (tras)
    for (const x of CIL) {
      const esc = mk(B.cylZ(0.019, 0.05, 18), M.aluminioFundido());
      esc.position.set(x, -0.012, 0.135);
      g.add(esc);
      const adm = mk(B.cylZ(0.021, 0.05, 18), M.aluminioFundido());
      adm.position.set(x, 0.012, -0.135);
      g.add(adm);
    }
    reg('cabecote', g, [0, 0.30, 0]);
  }

  {
    // comando de valvulas + balancins, dentro do cabecote
    const g = grupo('comando', [0, 0.3295, -0.012]);
    const eixo = mk(B.cylX(0.014, 0.372, 20), M.aco());
    g.add(eixo);
    for (let i = 0; i < 8; i++) {
      const x = -0.155 + i * 0.044;
      const lobo = mk(B.cylX(0.021, 0.020, 18), M.aco());
      lobo.position.set(x, 0.004 * (i % 2 ? 1 : -1), 0.004);
      g.add(lobo);
      const mancal = mk(B.cylX(0.020, 0.012, 16), M.aluminioFundido());
      mancal.position.set(x + 0.022, 0, 0);
      g.add(mancal);
    }
    reg('comando-valvulas', g, [0, 0.42, 0]);
  }

  {
    // valvulas: 2 admissao + 2 escape por cilindro, em V
    const g = grupo('valvulas', [0, 0.2845, 0]);
    for (const x of CIL) {
      for (const [dz, inc] of [[-0.026, -0.20], [0.026, 0.20]]) {
        for (const dx of [-0.017, 0.017]) {
          const haste = mk(B.cyl(0.0032, 0.0032, 0.10, 12), M.aco());
          const cabeca = mk(B.lathe([[0, 0], [0.0145, 0.004], [0.0145, 0.007], [0, 0.009]], 18), M.aco());
          const v = new THREE.Group();
          v.add(haste);
          cabeca.position.y = -0.052;
          v.add(cabeca);
          v.position.set(x + dx, 0.02, dz);
          v.rotation.x = inc;
          g.add(v);
        }
      }
    }
    reg('valvulas', g, [0, 0.36, 0]);
  }

  {
    const g = grupo('tampa-valvulas', [0, 0.3595, -0.008]);
    const tampa = mk(B.roundedBox(0.372, 0.070, 0.205, 0.020, 0.006), M.aluminioFundido());
    g.add(tampa);
    // nervura central com o nome estampado
    const nerv = mk(B.roundedBox(0.264, 0.014, 0.055, 0.008, 0.003), M.aluminioFundido());
    nerv.position.set(0, 0.040, -0.02);
    g.add(nerv);
    // bocal de abastecimento de oleo
    const bocal = mk(B.lathe([[0, 0], [0.028, 0], [0.028, 0.030], [0.023, 0.034], [0, 0.034]], 24), M.plasticoPreto());
    bocal.position.set(-0.145, 0.033, 0.052);
    g.add(bocal);
    // parafusaria do perimetro
    const pf = mk(B.parafusosEmRetangulo(0.32, 0.16, 5, 3, 0.010, 0.012), M.aco());
    pf.position.y = 0.036;
    g.add(pf);
    reg('tampa-valvulas', g, [0, 0.50, 0]);
  }

  /* ===================================================== DISTRIBUICAO === */
  // Plano da correia dentada: perpendicular ao virabrequim, na ponta direita.
  const X_CORREIA = 0.225;
  const POLIAS = {
    virabrequim: { z: 0, y: 0, r: 0.048 },
    comando:     { z: -0.012, y: 0.3295, r: 0.094 },   // gira na metade da rotacao -> dobro do diametro
    bomba:       { z: 0.098, y: 0.115, r: 0.036 },
    tensor:      { z: -0.098, y: 0.170, r: 0.033 },
  };

  {
    const g = grupo('polia-comando', [X_CORREIA, POLIAS.comando.y, POLIAS.comando.z]);
    const p = mk(B.polia_dentada(POLIAS.comando.r, 0.020, 38), M.aco());
    p.rotation.z = Math.PI / 2;
    g.add(p);
    motor.add(g);   // parte do comando, nao registrada separadamente
  }

  {
    const g = grupo('correia-dentada', [X_CORREIA, 0, 0]);
    const circulos = Object.values(POLIAS).map((p) => ({ x: p.z, y: p.y, r: p.r }));
    const caminho = B.caminhoCorreia(circulos);
    const geo = B.correia(caminho, 0.020, 0.0035, { dentes: true, passoDente: 0.0095 });
    const c = mk(geo, M.borracha());
    // o caminho foi gerado no plano XY; girar para o plano ZY do motor
    c.rotation.y = Math.PI / 2;
    c.rotation.x = 0;
    g.add(c);
    g.rotation.set(0, 0, 0);
    // reposiciona: caminho.x -> z do motor, caminho.y -> y do motor
    c.rotation.set(0, -Math.PI / 2, 0);
    reg('correia-dentada', g, [0.34, 0, 0]);
  }

  {
    const g = grupo('tensor', [X_CORREIA, POLIAS.tensor.y, POLIAS.tensor.z]);
    const roldana = mk(B.polia(POLIAS.tensor.r, 0.024, { canaletas: 1, gola: 0.003 }), M.aco());
    roldana.rotation.z = Math.PI / 2;
    g.add(roldana);
    const suporte = mk(B.roundedBox(0.014, 0.055, 0.030, 0.004, 0.002), M.aco());
    suporte.position.set(-0.014, -0.030, 0.010);
    g.add(suporte);
    reg('tensor-correia', g, [0.40, 0.10, 0]);
  }

  {
    const g = grupo('polia-virabrequim', [X_CORREIA + 0.055, 0, 0]);
    const p = mk(B.polia(0.068, 0.030, { canaletas: 4 }), M.ferroFundido());
    p.rotation.z = Math.PI / 2;
    g.add(p);
    const anelBorracha = mk(B.ring(0.058, 0.040, 0.028, 30), M.borracha());
    anelBorracha.rotation.z = Math.PI / 2;
    g.add(anelBorracha);
    const parafusoCentral = mk(B.parafuso(0.020, 0.02), M.aco());
    parafusoCentral.rotation.z = -Math.PI / 2;
    parafusoCentral.position.x = 0.017;
    g.add(parafusoCentral);
    reg('polia-virabrequim', g, [0.46, 0, 0]);
  }

  /* ====================================================== LUBRIFICACAO === */
  {
    const g = grupo('bomba-oleo', [0.215, -0.045, 0.02]);
    const corpo = mk(B.lathe([
      [0, -0.020], [0.055, -0.020], [0.058, -0.012], [0.058, 0.012], [0.055, 0.020], [0, 0.020],
    ], 26), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const pescador = mk(B.hose([[0, -0.02, 0], [0, -0.09, 0.01], [-0.02, -0.125, 0.04]], 0.010), M.aco());
    g.add(pescador);
    const peneira = mk(B.roundedBox(0.05, 0.012, 0.05, 0.004, 0.002), M.aco());
    peneira.position.set(-0.02, -0.128, 0.045);
    g.add(peneira);
    reg('bomba-oleo', g, [0.30, -0.16, 0]);
  }

  {
    const g = grupo('filtro-oleo', [0.10, -0.055, 0.145]);
    const f = mk(B.lathe([
      [0, 0], [0.038, 0], [0.040, 0.008], [0.040, 0.082], [0.036, 0.090], [0, 0.090],
    ], 26), M.acoPreto());
    f.rotation.x = Math.PI / 2;
    f.position.z = -0.045;
    g.add(f);
    reg('filtro-oleo', g, [0, -0.10, 0.34]);
  }

  {
    const g = grupo('vareta-oleo', [-0.06, 0.10, 0.115]);
    const tubo = mk(B.hose([[0, 0, 0], [0.01, 0.10, 0.02], [0.02, 0.19, 0.01]], 0.006), M.aco());
    g.add(tubo);
    const alca = mk(B.ring(0.016, 0.008, 0.006, 18), new THREE.MeshStandardMaterial({ color: 0xd8b53a, metalness: 0.2, roughness: 0.5 }));
    alca.position.set(0.02, 0.198, 0.01);
    alca.rotation.x = Math.PI / 2;
    g.add(alca);
    reg('vareta-oleo', g, [0, 0.26, 0.10]);
  }

  /* ===================================================== ARREFECIMENTO === */
  {
    const g = grupo('bomba-agua', [X_CORREIA - 0.03, POLIAS.bomba.y, POLIAS.bomba.z]);
    const corpo = mk(B.lathe([
      [0, -0.026], [0.048, -0.026], [0.050, -0.016], [0.050, 0.014], [0.042, 0.022], [0, 0.022],
    ], 26), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const polia = mk(B.polia_dentada(POLIAS.bomba.r, 0.020, 19), M.aco());
    polia.rotation.z = Math.PI / 2;
    polia.position.x = 0.030;
    g.add(polia);
    const bocal = mk(B.cylZ(0.020, 0.05, 18), M.aluminioFundido());
    bocal.position.set(-0.02, -0.03, 0.05);
    g.add(bocal);
    reg('bomba-agua', g, [0.26, 0.14, 0]);
  }

  {
    const g = grupo('termostatica', [-0.10, -0.02, 0.13]);
    const carcaca = mk(B.lathe([
      [0, 0], [0.030, 0], [0.032, 0.012], [0.026, 0.040], [0.022, 0.055], [0, 0.055],
    ], 22), M.aluminioFundido());
    carcaca.rotation.x = Math.PI / 2;
    carcaca.position.z = -0.028;
    g.add(carcaca);
    const bocal = mk(B.cylZ(0.021, 0.035, 18), M.aluminioFundido());
    bocal.position.z = 0.042;
    g.add(bocal);
    reg('valvula-termostatica', g, [-0.10, -0.10, 0.28]);
  }

  /* ========================================================== ADMISSAO === */
  {
    const g = grupo('coletor-admissao', [0, 0.2345, -0.19]);
    // plenum (camara comum)
    const plenum = mk(B.roundedBox(0.322, 0.085, 0.095, 0.026, 0.006), M.aluminioFundido());
    plenum.position.set(0.01, -0.01, -0.045);
    g.add(plenum);
    // 4 runners curvos ate o cabecote
    CIL.forEach((x) => {
      const r = mk(B.hose([
        [x, 0.055, -0.03], [x, 0.030, 0.02], [x * 0.98, -0.005, 0.055], [x * 0.96, -0.020, 0.075],
      ], 0.021, { segments: 24 }), M.aluminioFundido());
      g.add(r);
    });
    // flange do cabecote
    const flange = mk(B.roundedBox(0.338, 0.055, 0.012, 0.006, 0.002), M.aluminioFundido());
    flange.position.set(0, -0.028, 0.078);
    g.add(flange);
    reg('coletor-admissao', g, [0, 0.10, -0.42]);
  }

  {
    const g = grupo('corpo-borboleta', [0.115, 0.2295, -0.285]);
    const corpo = mk(B.lathe([
      [0, -0.028], [0.034, -0.028], [0.036, -0.018], [0.036, 0.018], [0.034, 0.028], [0, 0.028],
    ], 24), M.aluminioUsinado());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const borboleta = mk(B.ring(0.028, 0.0, 0.002, 22), M.aco());
    borboleta.rotation.x = Math.PI / 2;
    borboleta.rotation.z = 0.5;
    g.add(borboleta);
    const alavanca = mk(B.roundedBox(0.045, 0.030, 0.006, 0.004, 0.002), M.aco());
    alavanca.position.set(0.028, 0.022, 0);
    g.add(alavanca);
    reg('corpo-borboleta', g, [0.16, 0.14, -0.36]);
  }

  {
    const g = grupo('iac', [0.155, 0.2795, -0.245]);
    const c = mk(B.lathe([[0, 0], [0.020, 0], [0.022, 0.008], [0.022, 0.046], [0, 0.046]], 20), M.aluminioFundido());
    g.add(c);
    const conector = mk(B.roundedBox(0.018, 0.014, 0.020, 0.003, 0.001), M.plasticoPreto());
    conector.position.set(0, 0.052, 0);
    g.add(conector);
    reg('valvula-iac', g, [0.22, 0.20, -0.30]);
  }

  {
    const g = grupo('sensor-map', [-0.06, 0.3025, -0.245]);
    const c = mk(B.roundedBox(0.032, 0.030, 0.022, 0.004, 0.002), M.plasticoPreto());
    g.add(c);
    const bico = mk(B.cyl(0.005, 0.005, 0.018, 12), M.plasticoPreto());
    bico.position.y = -0.022;
    g.add(bico);
    reg('sensor-map', g, [-0.10, 0.26, -0.32]);
  }

  {
    // caixa do filtro de ar + duto ate o corpo de borboleta
    // Canto dianteiro do vao, ao lado da bateria — nas fotos a caixa fica bem
    // a frente, e o mangote atravessa o vao inteiro ate a borboleta.
    const g = grupo('filtro-ar', [0.545, 0.300, 0.115]);
    // Caixa real do EK: ~250 x 135 x 205 mm. A anterior estava pequena
    // demais e o duto fino; nas fotos do vao o mangote corrugado grosso e o
    // elemento mais visivel depois da tampa de valvulas.
    const caixa = mk(B.roundedBox(0.245, 0.118, 0.205, 0.022, 0.006), M.plasticoPreto());
    g.add(caixa);
    const tampa = mk(B.roundedBox(0.252, 0.026, 0.212, 0.022, 0.005), M.plasticoPreto());
    tampa.position.y = 0.068;
    g.add(tampa);
    // presilhas metalicas que prendem a tampa na caixa
    for (const dz of [-0.075, 0.075]) {
      const presilha = mk(B.roundedBox(0.030, 0.026, 0.012, 0.004, 0.002), M.aco());
      presilha.position.set(0.128, 0.056, dz);
      g.add(presilha);
    }
    const elemento = mk(B.roundedBox(0.205, 0.036, 0.168, 0.006, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xd8c9a8, roughness: 0.95, metalness: 0 }));
    elemento.position.y = 0.046;
    g.add(elemento);
    // mangote corrugado ate o corpo de borboleta, em arco por cima do coletor
    const duto = mk(B.fole([
      [-0.128, 0.028, -0.035], [-0.220, 0.058, -0.105], [-0.310, 0.062, -0.190],
      [-0.385, 0.030, -0.288], [-0.428, -0.030, -0.372], [-0.436, -0.068, -0.398],
    ], 0.052, { rings: 16, amp: 0.006 }), M.plasticoPreto());
    g.add(duto);
    // abracadeiras nas duas pontas do mangote
    for (const [x, y, z] of [[-0.134, 0.030, -0.038], [-0.430, -0.062, -0.392]]) {
      const abr = mk(B.ring(0.056, 0.049, 0.014, 20), M.aco());
      abr.rotation.z = Math.PI / 2;
      abr.position.set(x, y, z);
      g.add(abr);
    }
    // snorkel de entrada, que puxa ar de tras do farol
    const snorkel = mk(B.hose([[0.124, 0.020, 0], [0.185, 0.030, 0.055], [0.222, 0.018, 0.130]], 0.042), M.plasticoPreto());
    g.add(snorkel);
    reg('filtro-ar', g, [0.30, 0.34, -0.10]);
  }

  /* =========================================================== IGNICAO === */
  {
    const g = grupo('distribuidor', [-0.215, 0.2845, -0.045]);
    const corpo = mk(B.lathe([
      [0, 0], [0.030, 0], [0.032, 0.010], [0.032, 0.055], [0.048, 0.058],
      [0.050, 0.066], [0.046, 0.086], [0.030, 0.096], [0, 0.098],
    ], 26), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    corpo.position.x = -0.05;
    g.add(corpo);
    const tampa = mk(B.lathe([
      [0, 0], [0.046, 0], [0.046, 0.020], [0.036, 0.030], [0, 0.032],
    ], 26), M.plasticoPreto());
    tampa.rotation.z = -Math.PI / 2;
    tampa.position.x = -0.052;
    g.add(tampa);
    // 4 torres dos cabos de vela
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const t = mk(B.cyl(0.011, 0.013, 0.026, 14), M.plasticoPreto());
      t.rotation.z = Math.PI / 2;
      t.position.set(-0.072, Math.cos(a) * 0.030, Math.sin(a) * 0.030);
      g.add(t);
    }
    reg('distribuidor', g, [-0.40, 0.08, 0]);
  }

  {
    const g = grupo('velas', [0, 0.4195, 0]);
    for (const x of CIL) {
      const corpoV = mk(B.lathe([
        [0, 0], [0.009, 0], [0.009, 0.016], [0.012, 0.018], [0.012, 0.024], [0.008, 0.028], [0, 0.028],
      ], 16), M.aco());
      corpoV.position.set(x, 0, 0);
      g.add(corpoV);
      const iso = mk(B.lathe([
        [0, 0], [0.008, 0.002], [0.0075, 0.030], [0.006, 0.044], [0, 0.046],
      ], 16), M.ceramica());
      iso.position.set(x, 0.026, 0);
      g.add(iso);
      const eletrodo = mk(B.cyl(0.0022, 0.0022, 0.016, 10), M.aco());
      eletrodo.position.set(x, -0.010, 0);
      g.add(eletrodo);
    }
    reg('velas', g, [0, 0.60, 0]);
  }

  {
    const g = grupo('cabos-vela', [0, 0, 0]);
    CIL.forEach((x, i) => {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      const cabo = mk(B.hose([
        [x, 0.4595, 0],
        [x, 0.4845 + i * 0.004, -0.03],
        [(x - 0.215) * 0.5 - 0.05, 0.4545, -0.05],
        [-0.28, 0.2845 + Math.cos(a) * 0.030, -0.045 + Math.sin(a) * 0.030],
      ], 0.0055, { segments: 30 }), M.borracha());
      g.add(cabo);
      const capa = mk(B.cyl(0.012, 0.010, 0.030, 14), M.borracha());
      capa.position.set(x, 0.4625, 0);
      g.add(capa);
    });
    reg('cabos-vela', g, [0, 0.30, -0.24]);
  }

  /* ====================================================== COMBUSTIVEL === */
  {
    const g = grupo('injetores', [0, 0.2095, -0.115]);
    // flauta
    const flauta = mk(B.cylX(0.014, 0.32, 18), M.aluminioUsinado());
    flauta.position.y = 0.035;
    g.add(flauta);
    CIL.forEach((x) => {
      const inj = mk(B.lathe([
        [0, 0], [0.009, 0.002], [0.009, 0.026], [0.012, 0.030], [0.012, 0.044], [0.007, 0.050], [0, 0.050],
      ], 16), M.plasticoPreto());
      inj.position.set(x, -0.012, 0);
      g.add(inj);
      const oring = mk(B.ring(0.011, 0.008, 0.004, 14), M.borracha());
      oring.position.set(x, -0.014, 0);
      g.add(oring);
    });
    reg('bicos-injetores', g, [0, 0.22, -0.30]);
  }

  {
    const g = grupo('filtro-combustivel', [-0.24, 0.22, -0.33]);
    const c = mk(B.lathe([[0, 0], [0.026, 0.004], [0.026, 0.090], [0, 0.094]], 20), M.aco());
    g.add(c);
    const linha1 = mk(B.hose([[0, 0.094, 0], [0.02, 0.13, 0.02], [0.09, 0.15, 0.05]], 0.006), M.aco());
    g.add(linha1);
    const linha2 = mk(B.hose([[0, 0, 0], [0.01, -0.05, -0.02], [0.05, -0.09, -0.06]], 0.006), M.aco());
    g.add(linha2);
    reg('filtro-combustivel', g, [-0.30, 0.10, -0.30]);
  }

  /* ============================================================ ESCAPE === */
  {
    const g = grupo('coletor-escape', [0, 0.2045, 0.20]);
    // 4 primarios juntando num coletor unico
    CIL.forEach((x) => {
      const p = mk(B.hose([
        [x, 0.055, -0.06], [x, 0.020, -0.01], [x * 0.55, -0.035, 0.02], [x * 0.15, -0.075, 0.03],
      ], 0.019, { segments: 26 }), M.ferroFundido());
      g.add(p);
    });
    const coletor = mk(B.lathe([[0, 0], [0.036, 0.004], [0.036, 0.055], [0.030, 0.062], [0, 0.064]], 20), M.ferroFundido());
    coletor.position.set(0, -0.135, 0.03);
    g.add(coletor);
    const flange = mk(B.roundedBox(0.320, 0.055, 0.012, 0.006, 0.002), M.ferroFundido());
    flange.position.set(0, 0.048, -0.068);
    g.add(flange);
    // chapa de protecao termica
    const chapa = mk(B.roundedBox(0.312, 0.16, 0.008, 0.010, 0.002), M.aco());
    chapa.position.set(0, -0.01, 0.075);
    g.add(chapa);
    reg('coletor-escape', g, [0, 0.06, 0.40]);
  }

  {
    const g = grupo('sonda-lambda', [0.02, 0.085, 0.245]);
    const c = mk(B.lathe([[0, 0], [0.011, 0], [0.011, 0.020], [0.016, 0.023], [0.016, 0.032], [0, 0.034]], 16), M.aco());
    c.rotation.x = -0.5;
    g.add(c);
    const fio = mk(B.hose([[0, 0.034, 0], [0.02, 0.07, -0.02], [0.06, 0.11, -0.06]], 0.004), M.borracha());
    g.add(fio);
    reg('sonda-lambda', g, [0.10, 0.02, 0.34]);
  }

  /* ======================================================= ACESSORIOS === */
  const X_AUX = 0.315;   // plano da correia auxiliar (por fora da correia dentada)
  const AUX = {
    virabrequim: { z: 0, y: 0, r: 0.068 },
    alternador:  { z: -0.085, y: 0.215, r: 0.032 },
    direcao:     { z: 0.115, y: 0.175, r: 0.046 },
    ar:          { z: 0.095, y: -0.145, r: 0.050 },
  };

  {
    const g = grupo('alternador', [X_AUX - 0.075, AUX.alternador.y, AUX.alternador.z]);
    const corpo = mk(B.lathe([
      [0, -0.055], [0.052, -0.055], [0.055, -0.045], [0.055, 0.045], [0.052, 0.055], [0, 0.055],
    ], 26), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const enrol = mk(B.ring(0.048, 0.030, 0.070, 26), M.cobre());
    enrol.rotation.z = Math.PI / 2;
    g.add(enrol);
    const polia = mk(B.polia(AUX.alternador.r, 0.024, { canaletas: 4, gola: 0.003 }), M.aco());
    polia.rotation.z = Math.PI / 2;
    polia.position.x = 0.075;
    g.add(polia);
    const ventil = mk(B.roundedBox(0.006, 0.055, 0.055, 0.002, 0.001), M.aco());
    ventil.position.x = 0.058;
    g.add(ventil);
    reg('alternador', g, [0.42, 0.24, 0]);
  }

  {
    const g = grupo('bomba-direcao', [X_AUX - 0.065, AUX.direcao.y, AUX.direcao.z]);
    const corpo = mk(B.lathe([
      [0, -0.045], [0.046, -0.045], [0.048, -0.036], [0.048, 0.036], [0.044, 0.045], [0, 0.045],
    ], 24), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const polia = mk(B.polia(AUX.direcao.r, 0.022, { canaletas: 4, gola: 0.003 }), M.aco());
    polia.rotation.z = Math.PI / 2;
    polia.position.x = 0.065;
    g.add(polia);
    const reserv = mk(B.lathe([[0, 0], [0.032, 0.004], [0.032, 0.070], [0.026, 0.078], [0, 0.080]], 20), M.plasticoPreto());
    reserv.position.set(-0.02, 0.048, 0.03);
    g.add(reserv);
    reg('bomba-direcao', g, [0.42, 0.22, 0.10]);
  }

  {
    const g = grupo('compressor-ar', [X_AUX - 0.080, AUX.ar.y, AUX.ar.z]);
    const corpo = mk(B.lathe([
      [0, -0.065], [0.052, -0.065], [0.055, -0.055], [0.055, 0.050], [0.050, 0.060], [0, 0.060],
    ], 26), M.aluminioFundido());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const embreagem = mk(B.polia(AUX.ar.r, 0.026, { canaletas: 4, gola: 0.003 }), M.aco());
    embreagem.rotation.z = Math.PI / 2;
    embreagem.position.x = 0.080;
    g.add(embreagem);

    /*
     * Tubos rigidos de alta e baixa. Contornam o vao ate o condensador, na
     * frente do radiador. Mancha oleosa escura numa conexao e gas vazando
     * junto com o oleo do compressor: o sistema perdeu carga por ali.
     */
    for (const [raio, desvio, cor] of [[0.012, 0.055, 0x9aa0a6], [0.017, -0.050, 0x8d949b]]) {
      const tubo = mk(B.hose([
        [0.030, 0.010, 0.020], [0.010, 0.075, -0.060 + desvio * 0.2],
        [-0.090, 0.130, -0.150 + desvio], [-0.230, 0.115, -0.290 + desvio],
        [-0.330, 0.050, -0.430 + desvio],
      ], raio, { segments: 26 }),
        new THREE.MeshStandardMaterial({ color: cor, roughness: 0.35, metalness: 0.85 }));
      g.add(tubo);
    }
    // conexoes flangeadas do compressor
    for (const dy of [0.022, -0.018]) {
      const flange = mk(B.roundedBox(0.030, 0.024, 0.034, 0.005, 0.002), M.aluminioUsinado());
      flange.position.set(0.026, 0.014 + dy, 0.016);
      g.add(flange);
    }

    reg('ar-condicionado', g, [0.42, -0.22, 0.10]);
  }

  {
    const g = grupo('correia-auxiliar', [X_AUX, 0, 0]);
    const circulos = Object.values(AUX).map((p) => ({ x: p.z, y: p.y, r: p.r }));
    const caminho = B.caminhoCorreia(circulos);
    const c = mk(B.correia(caminho, 0.021, 0.005), M.borracha());
    c.rotation.set(0, -Math.PI / 2, 0);
    g.add(c);
    reg('correia-auxiliar', g, [0.44, 0, 0]);
  }

  /* ============================================================ COXINS === */
  {
    const g = grupo('coxins', [0, 0, 0]);
    const posicoes = [
      [0.255, 0.16, -0.02],    // coxim lado direito (apoia o motor)
      [-0.44, 0.13, -0.02],    // coxim lado esquerdo (no cambio)
      [-0.05, -0.10, 0.20],    // coxim dianteiro
      [-0.05, -0.10, -0.22],   // coxim traseiro
    ];
    for (const [x, y, z] of posicoes) {
      const borrachaCoxim = mk(B.lathe([
        [0, 0], [0.038, 0], [0.040, 0.010], [0.034, 0.038], [0.030, 0.048], [0, 0.050],
      ], 20), M.borracha());
      borrachaCoxim.position.set(x, y, z);
      g.add(borrachaCoxim);
      const suporte = mk(B.roundedBox(0.075, 0.014, 0.060, 0.006, 0.002), M.acoPreto());
      suporte.position.set(x, y - 0.008, z);
      g.add(suporte);
      const parafusoCoxim = mk(B.parafuso(0.014, 0.03), M.aco());
      parafusoCoxim.position.set(x, y + 0.060, z);
      g.add(parafusoCoxim);
    }
    reg('coxins-motor', g, [0, -0.28, 0]);
  }

  // espelha para o lado correto do carro (ver nota em doisLados)
  motor.scale.x = -1;

  return motor;
}
