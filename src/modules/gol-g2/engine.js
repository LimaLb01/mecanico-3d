/**
 * Motor Volkswagen AT / EA111 — 1.0 SOHC 8V, montado LONGITUDINAL.
 *
 * Esta e a diferenca estrutural mais visivel entre este carro e o Civic: aqui o
 * virabrequim aponta para a FRENTE do carro (eixo Z), com a caixa de cambio
 * logo ATRAS do motor. E heranca da plataforma BX, que veio do Passat/Audi.
 * Praticamente nenhum outro hatch popular tem esse arranjo.
 *
 * Consequencias que aparecem na cena:
 *   - a correia dentada fica na PONTA DIANTEIRA, num plano paralelo ao para-choque
 *   - o coletor de admissao fica de um lado e o escape do outro (nao frente/tras)
 *   - os semi-eixos saem do cambio para TRAS do eixo dianteiro e voltam para as rodas
 *
 * Sistema local: Z = eixo do virabrequim (+Z para a frente), Y = 0 na linha de
 * centro do virabrequim, +X = lado esquerdo (motorista).
 */
import * as THREE from 'three';
import * as M from '../../core/materials.js';
import * as B from '../../core/builders.js';
import { grupo } from '../comum.js';

const CIL = [-0.123, -0.041, 0.041, 0.123];   // centro dos 4 cilindros no eixo Z
const R_CIL = 0.0336;                          // raio do cilindro (bore 67,1 mm)
const CURSO = 0.0708;                          // curso 70,8 mm

const mk = (geo, mat) => new THREE.Mesh(geo, mat);

// Linha de centro do virabrequim a 0,375 m do chao. Quem manda aqui nao sao as
// velas e sim a POLIA DO COMANDO: ela tem 106 mm de raio e fica na ponta
// dianteira do motor, justo onde o capo do Gol ja desceu para ~0,80 m. Foi o
// verificador de montagem que acusou a correia dentada atravessando a lataria.
export function construirMotor(viewer, origem = [0.02, 0.375, 1.50]) {
  const motor = grupo('motor', origem);
  // pequena inclinacao lateral, como o motor e assentado de fabrica
  motor.rotation.z = -0.09;
  viewer.adicionar(motor);

  const reg = (id, g, explode = [0, 0, 0]) => {
    motor.add(g);
    viewer.registrar(id, g, explode);
    return g;
  };

  /* ================================================== BLOCO DO MOTOR === */
  {
    const g = grupo('bloco');
    // bloco de FERRO fundido (diferente do Civic, que e de aluminio)
    const corpo = mk(B.roundedBox(0.185, 0.215, 0.335, 0.010, 0.004), M.ferroFundido());
    corpo.position.set(0, 0.10, 0);
    g.add(corpo);

    const saia = mk(B.roundedBox(0.170, 0.105, 0.315, 0.008, 0.003), M.ferroFundido());
    saia.position.set(0, -0.055, 0);
    g.add(saia);

    for (const z of CIL) {
      const camisa = mk(new THREE.CylinderGeometry(R_CIL + 0.004, R_CIL + 0.004, 0.185, 24, 1, true), M.ferroFundido());
      camisa.position.set(0, 0.115, z);
      g.add(camisa);
    }

    // flange traseiro, onde o cambio se acopla
    const flange = mk(B.roundedBox(0.215, 0.265, 0.020, 0.016, 0.004), M.aluminioFundido());
    flange.position.set(0, 0.055, -0.175);
    g.add(flange);

    reg('bloco-motor', g, [0, 0, 0]);
  }

  /* ============================================== VIRABREQUIM E BIELAS === */
  {
    const g = grupo('virabrequim');
    const eixo = mk(B.cylZ(0.021, 0.36, 22), M.aco());
    g.add(eixo);
    for (let i = 0; i < 5; i++) {
      const m = mk(B.cylZ(0.029, 0.024, 22), M.aco());
      m.position.z = -0.164 + i * 0.082;
      g.add(m);
    }
    const fases = [0, Math.PI, Math.PI, 0];
    CIL.forEach((z, i) => {
      const braco = mk(B.roundedBox(0.046, 0.068, 0.018, 0.005, 0.002), M.aco());
      braco.position.set(0, Math.cos(fases[i]) * CURSO * 0.25, z);
      g.add(braco);
      const munhao = mk(B.cylZ(0.018, 0.026, 18), M.aco());
      munhao.position.set(0, Math.cos(fases[i]) * CURSO * 0.5, z);
      g.add(munhao);
      const cp = mk(B.cylZ(0.036, 0.014, 18), M.aco());
      cp.position.set(0, -Math.cos(fases[i]) * 0.016, z - 0.024);
      g.add(cp);
    });
    reg('virabrequim', g, [0, -0.28, 0]);
  }

  {
    const g = grupo('pistoes');
    const fases = [0, Math.PI, Math.PI, 0];
    CIL.forEach((z, i) => {
      const alt = Math.cos(fases[i]) * CURSO * 0.5 + 0.108;
      const p = mk(B.lathe([
        [0, -0.026], [R_CIL - 0.001, -0.026], [R_CIL - 0.001, 0.020], [0, 0.022],
      ], 24), M.aluminioUsinado());
      p.position.set(0, alt, z);
      g.add(p);
      for (let k = 0; k < 3; k++) {
        const anel = mk(B.ring(R_CIL, R_CIL - 0.003, 0.002, 22), M.aco());
        anel.position.set(0, alt + 0.013 - k * 0.005, z);
        g.add(anel);
      }
      const biela = mk(B.roundedBox(0.014, 0.095, 0.026, 0.004, 0.002), M.aco());
      biela.position.set(0, alt - 0.062, z);
      g.add(biela);
    });
    reg('pistoes', g, [0, 0.22, 0]);
  }

  /* ============================================================ CARTER === */
  {
    const g = grupo('carter', [0, -0.145, 0]);
    const bacia = mk(B.roundedBox(0.165, 0.095, 0.30, 0.014, 0.004), M.aluminioFundido());
    g.add(bacia);
    const flange = mk(B.roundedBox(0.180, 0.010, 0.320, 0.008, 0.002), M.aluminioFundido());
    flange.position.y = 0.050;
    g.add(flange);
    const bujao = mk(B.parafuso(0.016, 0.012), M.aco());
    bujao.position.set(0.05, -0.048, -0.09);
    bujao.rotation.x = Math.PI;
    g.add(bujao);
    reg('carter', g, [0, -0.32, 0]);
  }

  /* ========================================================== CABECOTE === */
  {
    const g = grupo('cabecote', [0, 0.255, 0]);
    const corpo = mk(B.roundedBox(0.195, 0.100, 0.345, 0.012, 0.004), M.aluminioFundido());
    g.add(corpo);
    for (const z of CIL) {
      const poco = mk(new THREE.CylinderGeometry(0.017, 0.017, 0.085, 18, 1, true), M.aluminioFundido());
      poco.position.set(-0.02, 0.048, z);
      g.add(poco);
      // 8 valvulas: uma admissao e uma escape por cilindro
      const adm = mk(B.cylX(0.017, 0.045, 16), M.aluminioFundido());
      adm.position.set(0.115, 0.010, z);
      g.add(adm);
      const esc = mk(B.cylX(0.016, 0.045, 16), M.aluminioFundido());
      esc.position.set(-0.115, -0.005, z);
      g.add(esc);
    }
    reg('cabecote', g, [0, 0.30, 0]);
  }

  {
    const g = grupo('comando', [0.012, 0.312, 0]);
    const eixo = mk(B.cylZ(0.013, 0.345, 18), M.aco());
    g.add(eixo);
    for (let i = 0; i < 8; i++) {
      const z = -0.145 + i * 0.041;
      const lobo = mk(B.cylZ(0.019, 0.018, 16), M.aco());
      lobo.position.set(0, 0.004 * (i % 2 ? 1 : -1), z);
      g.add(lobo);
    }
    reg('comando-valvulas', g, [0, 0.40, 0]);
  }

  {
    // valvulas + tuchos HIDRAULICOS (nao ha parafuso de regulagem)
    const g = grupo('valvulas', [0, 0.27, 0]);
    for (const z of CIL) {
      for (const [dx, inc] of [[0.030, 0.26], [-0.030, -0.26]]) {
        const v = new THREE.Group();
        const haste = mk(B.cyl(0.003, 0.003, 0.090, 12), M.aco());
        v.add(haste);
        const cabeca = mk(B.lathe([[0, 0], [0.0145, 0.004], [0.0145, 0.007], [0, 0.009]], 16), M.aco());
        cabeca.position.y = -0.048;
        v.add(cabeca);
        // tucho hidraulico: copo cilindrico no topo da haste
        const tucho = mk(B.lathe([[0, 0], [0.014, 0], [0.014, 0.022], [0, 0.024]], 16), M.aco());
        tucho.position.y = 0.046;
        v.add(tucho);
        v.position.set(dx, 0.03, z);
        v.rotation.z = inc;
        g.add(v);
      }
    }
    reg('valvulas', g, [0, 0.36, 0]);
  }

  {
    const g = grupo('tampa-valvulas', [0, 0.335, 0]);
    const tampa = mk(B.roundedBox(0.190, 0.062, 0.340, 0.016, 0.005), M.aluminioFundido());
    g.add(tampa);
    const bocal = mk(B.lathe([[0, 0], [0.026, 0], [0.026, 0.028], [0.021, 0.032], [0, 0.032]], 22), M.plasticoPreto());
    bocal.position.set(0.045, 0.030, 0.125);
    g.add(bocal);
    const respiro = mk(B.hose([[-0.05, 0.028, 0.11], [-0.09, 0.02, 0.04], [-0.10, -0.01, -0.05]], 0.010), M.borracha());
    g.add(respiro);
    const pf = mk(B.parafusosEmRetangulo(0.15, 0.29, 3, 5, 0.009, 0.010), M.aco());
    pf.position.y = 0.032;
    g.add(pf);
    reg('tampa-valvulas', g, [0, 0.50, 0]);
  }

  /* ===================================================== DISTRIBUICAO === */
  // Motor longitudinal: o plano da correia dentada e perpendicular ao eixo Z,
  // ou seja, fica de frente para o radiador. E o plano XY nativo do builder.
  const Z_CORREIA = 0.205;
  const POLIAS = {
    virabrequim: { x: 0, y: 0, r: 0.055 },
    comando:     { x: 0.012, y: 0.312, r: 0.106 },
    bomba:       { x: 0.092, y: 0.115, r: 0.036 },
    tensor:      { x: -0.088, y: 0.170, r: 0.032 },
  };

  {
    const g = grupo('polia-comando', [POLIAS.comando.x, POLIAS.comando.y, Z_CORREIA]);
    const p = mk(B.polia_dentada(POLIAS.comando.r, 0.019, 42), M.aco());
    p.rotation.x = Math.PI / 2;
    g.add(p);
    motor.add(g);
  }

  {
    const g = grupo('correia-dentada', [0, 0, Z_CORREIA]);
    const circulos = Object.values(POLIAS).map((p) => ({ x: p.x, y: p.y, r: p.r }));
    const caminho = B.caminhoCorreia(circulos);
    // 135 dentes, 19 mm de largura — dado real desta correia
    const c = mk(B.correia(caminho, 0.019, 0.0035, { dentes: true, passoDente: 0.0095 }), M.borracha());
    g.add(c);
    reg('correia-dentada', g, [0, 0, 0.36]);
  }

  {
    const g = grupo('tensor', [POLIAS.tensor.x, POLIAS.tensor.y, Z_CORREIA]);
    const roldana = mk(B.polia(POLIAS.tensor.r, 0.022, { canaletas: 1, gola: 0.003 }), M.aco());
    roldana.rotation.x = Math.PI / 2;
    g.add(roldana);
    reg('tensor-correia', g, [-0.10, 0.12, 0.40]);
  }

  {
    const g = grupo('polia-virabrequim', [0, 0, Z_CORREIA + 0.055]);
    const p = mk(B.polia(0.062, 0.026, { canaletas: 3 }), M.ferroFundido());
    p.rotation.x = Math.PI / 2;
    g.add(p);
    const parafusoCentral = mk(B.parafuso(0.018, 0.018), M.aco());
    parafusoCentral.rotation.x = -Math.PI / 2;
    parafusoCentral.position.z = 0.016;
    g.add(parafusoCentral);
    reg('polia-virabrequim', g, [0, 0, 0.46]);
  }

  /* ====================================================== LUBRIFICACAO === */
  {
    const g = grupo('bomba-oleo', [0, -0.055, 0.150]);
    const corpo = mk(B.lathe([
      [0, -0.018], [0.048, -0.018], [0.050, -0.010], [0.050, 0.010], [0.048, 0.018], [0, 0.018],
    ], 24), M.aluminioFundido());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const pescador = mk(B.hose([[0, -0.02, 0], [0, -0.09, -0.03], [0, -0.115, -0.10]], 0.009), M.aco());
    g.add(pescador);
    reg('bomba-oleo', g, [0, -0.18, 0.28]);
  }

  {
    const g = grupo('filtro-oleo', [-0.115, -0.030, 0.075]);
    const f = mk(B.lathe([
      [0, 0], [0.035, 0], [0.037, 0.008], [0.037, 0.075], [0.033, 0.082], [0, 0.082],
    ], 24), M.acoPreto());
    f.rotation.z = Math.PI / 2;
    f.position.x = -0.04;
    g.add(f);
    reg('filtro-oleo', g, [-0.32, -0.08, 0]);
  }

  {
    const g = grupo('vareta-oleo', [0.105, 0.06, 0.02]);
    const tubo = mk(B.hose([[0, 0, 0], [0.015, 0.10, 0.01], [0.02, 0.20, 0.02]], 0.005), M.aco());
    g.add(tubo);
    const alca = mk(B.ring(0.015, 0.007, 0.005, 16),
      new THREE.MeshStandardMaterial({ color: 0xd8b53a, metalness: 0.2, roughness: 0.5 }));
    alca.position.set(0.02, 0.208, 0.02);
    alca.rotation.z = Math.PI / 2;
    g.add(alca);
    reg('vareta-oleo', g, [0.22, 0.24, 0]);
  }

  /* ===================================================== ARREFECIMENTO === */
  {
    const g = grupo('bomba-agua', [POLIAS.bomba.x, POLIAS.bomba.y, Z_CORREIA - 0.03]);
    const corpo = mk(B.lathe([
      [0, -0.024], [0.045, -0.024], [0.047, -0.014], [0.047, 0.012], [0.040, 0.020], [0, 0.020],
    ], 24), M.aluminioFundido());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const polia = mk(B.polia_dentada(POLIAS.bomba.r, 0.019, 19), M.aco());
    polia.rotation.x = Math.PI / 2;
    polia.position.z = 0.028;
    g.add(polia);
    reg('bomba-agua', g, [0.20, 0.14, 0.30]);
  }

  {
    const g = grupo('termostatica', [-0.06, -0.02, 0.155]);
    const carcaca = mk(B.lathe([
      [0, 0], [0.028, 0], [0.030, 0.012], [0.024, 0.040], [0, 0.042],
    ], 20), M.aluminioFundido());
    carcaca.rotation.z = Math.PI / 2;
    carcaca.position.x = -0.03;
    g.add(carcaca);
    reg('valvula-termostatica', g, [-0.26, -0.06, 0.20]);
  }

  /* ========================================================== ADMISSAO === */
  {
    // admissao do lado do MOTORISTA (+X); escape do outro lado
    const g = grupo('coletor-admissao', [0.175, 0.24, 0]);
    const plenum = mk(B.roundedBox(0.075, 0.070, 0.290, 0.020, 0.005), M.aluminioFundido());
    plenum.position.set(0.04, 0.02, 0);
    g.add(plenum);
    CIL.forEach((z) => {
      const r = mk(B.hose([
        [0.055, 0.01, z], [0.010, -0.010, z], [-0.045, -0.030, z * 0.98],
      ], 0.018, { segments: 18 }), M.aluminioFundido());
      g.add(r);
    });
    const flange = mk(B.roundedBox(0.010, 0.050, 0.300, 0.005, 0.002), M.aluminioFundido());
    flange.position.set(-0.055, -0.030, 0);
    g.add(flange);
    reg('coletor-admissao', g, [0.36, 0.10, 0]);
  }

  {
    const g = grupo('corpo-borboleta', [0.245, 0.265, 0.115]);
    const corpo = mk(B.lathe([
      [0, -0.024], [0.031, -0.024], [0.033, -0.015], [0.033, 0.015], [0.031, 0.024], [0, 0.024],
    ], 22), M.aluminioUsinado());
    corpo.rotation.z = Math.PI / 2;
    g.add(corpo);
    const alavanca = mk(B.roundedBox(0.006, 0.030, 0.040, 0.003, 0.001), M.aco());
    alavanca.position.set(0, 0.024, 0.022);
    g.add(alavanca);
    // cabo do acelerador (este carro nao tem acelerador eletronico)
    const cabo = mk(B.hose([[0, 0.032, 0.025], [0.02, 0.10, -0.10], [0.0, 0.16, -0.30]], 0.004), M.borracha());
    g.add(cabo);
    reg('corpo-borboleta', g, [0.40, 0.16, 0.10]);
  }

  {
    const g = grupo('iac', [0.285, 0.300, 0.075]);
    const c = mk(B.lathe([[0, 0], [0.018, 0], [0.020, 0.008], [0.020, 0.042], [0, 0.042]], 18), M.aluminioFundido());
    g.add(c);
    reg('valvula-iac', g, [0.40, 0.22, 0]);
  }

  {
    // recuada e rebaixada: o capo do Gol desce rapido nesse ponto
    const g = grupo('filtro-ar', [0.13, 0.255, 0.095]);
    const caixa = mk(B.roundedBox(0.235, 0.090, 0.175, 0.020, 0.005), M.plasticoPreto());
    g.add(caixa);
    const tampa = mk(B.roundedBox(0.240, 0.020, 0.180, 0.020, 0.005), M.plasticoPreto());
    tampa.position.y = 0.052;
    g.add(tampa);
    const elemento = mk(B.roundedBox(0.195, 0.028, 0.140, 0.006, 0.002),
      new THREE.MeshStandardMaterial({ color: 0xd8c9a8, roughness: 0.95, metalness: 0 }));
    elemento.position.y = 0.034;
    g.add(elemento);
    const duto = mk(B.fole([
      [0.13, -0.01, -0.03], [0.17, -0.05, -0.10], [0.16, -0.09, -0.16],
    ], 0.032, { rings: 5, amp: 0.004 }), M.plasticoPreto());
    g.add(duto);
    reg('filtro-ar', g, [0.20, 0.34, 0.10]);
  }

  /* =========================================================== IGNICAO === */
  {
    // ignicao ESTATICA: bobina unica, sem distribuidor
    const g = grupo('bobina', [-0.175, 0.265, -0.075]);
    const corpo = mk(B.roundedBox(0.060, 0.075, 0.105, 0.008, 0.003), M.plasticoPreto());
    g.add(corpo);
    for (let i = 0; i < 4; i++) {
      const t = mk(B.cyl(0.011, 0.013, 0.022, 14), M.plasticoPreto());
      t.rotation.z = Math.PI / 2;
      t.position.set(-0.038, 0.018 - (i % 2) * 0.036, -0.030 + Math.floor(i / 2) * 0.060);
      g.add(t);
    }
    const suporte = mk(B.roundedBox(0.014, 0.070, 0.090, 0.004, 0.002), M.acoPreto());
    suporte.position.x = 0.036;
    g.add(suporte);
    reg('bobina-ignicao', g, [-0.36, 0.16, 0]);
  }

  {
    const g = grupo('sensor-rotacao', [0.070, -0.070, -0.185]);
    const c = mk(B.lathe([[0, 0], [0.011, 0], [0.011, 0.030], [0.016, 0.034], [0.016, 0.048], [0, 0.050]], 16), M.plasticoPreto());
    c.rotation.x = -Math.PI / 2;
    g.add(c);
    const fio = mk(B.hose([[0, 0.01, -0.05], [0.04, 0.10, -0.10], [0.02, 0.20, -0.14]], 0.004), M.borracha());
    g.add(fio);
    reg('sensor-rotacao', g, [0.20, -0.24, -0.20]);
  }

  {
    const g = grupo('velas', [-0.02, 0.395, 0]);
    for (const z of CIL) {
      const corpoV = mk(B.lathe([
        [0, 0], [0.0085, 0], [0.0085, 0.015], [0.011, 0.017], [0.011, 0.023], [0.008, 0.026], [0, 0.026],
      ], 16), M.aco());
      corpoV.position.set(0, 0, z);
      g.add(corpoV);
      const iso = mk(B.lathe([[0, 0], [0.0075, 0.002], [0.007, 0.028], [0.0055, 0.040], [0, 0.042]], 16), M.ceramica());
      iso.position.set(0, 0.024, z);
      g.add(iso);
    }
    reg('velas', g, [0, 0.58, 0]);
  }

  {
    const g = grupo('cabos-vela');
    CIL.forEach((z, i) => {
      const cabo = mk(B.hose([
        [-0.02, 0.435, z],
        [-0.08, 0.45, z],
        [-0.15, 0.36, z * 0.5 - 0.02],
        [-0.213, 0.283 - (i % 2) * 0.036, -0.075 - 0.030 + Math.floor(i / 2) * 0.060],
      ], 0.005, { segments: 26 }), M.borracha());
      g.add(cabo);
      const capa = mk(B.cyl(0.011, 0.009, 0.026, 14), M.borracha());
      capa.position.set(-0.02, 0.438, z);
      g.add(capa);
    });
    reg('cabos-vela', g, [-0.30, 0.30, 0]);
  }

  /* ====================================================== COMBUSTIVEL === */
  {
    const g = grupo('injetores', [0.128, 0.225, 0]);
    const flauta = mk(B.cylZ(0.012, 0.300, 16), M.aluminioUsinado());
    flauta.position.y = 0.030;
    g.add(flauta);
    CIL.forEach((z) => {
      const inj = mk(B.lathe([
        [0, 0], [0.008, 0.002], [0.008, 0.024], [0.011, 0.028], [0.011, 0.040], [0.006, 0.045], [0, 0.045],
      ], 16), M.plasticoPreto());
      inj.rotation.z = 0.5;
      inj.position.set(-0.010, -0.010, z);
      g.add(inj);
    });
    reg('bicos-injetores', g, [0.34, 0.18, 0]);
  }

  /* ============================================================ ESCAPE === */
  {
    // escape do lado oposto a admissao
    const g = grupo('coletor-escape', [-0.175, 0.22, 0]);
    CIL.forEach((z) => {
      const p = mk(B.hose([
        [0.045, 0.02, z], [-0.010, -0.020, z], [-0.045, -0.075, z * 0.35],
      ], 0.017, { segments: 18 }), M.ferroFundido());
      g.add(p);
    });
    const coletor = mk(B.lathe([[0, 0], [0.032, 0.004], [0.032, 0.055], [0.026, 0.062], [0, 0.064]], 20), M.ferroFundido());
    coletor.rotation.z = Math.PI / 2;
    coletor.position.set(-0.075, -0.100, 0);
    g.add(coletor);
    const chapa = mk(B.roundedBox(0.010, 0.150, 0.300, 0.008, 0.002), M.aco());
    chapa.position.set(-0.075, 0.0, 0);
    g.add(chapa);
    reg('coletor-escape', g, [-0.40, 0.06, 0]);
  }

  {
    const g = grupo('sonda-lambda', [-0.225, 0.075, -0.05]);
    const c = mk(B.lathe([[0, 0], [0.010, 0], [0.010, 0.018], [0.015, 0.021], [0.015, 0.030], [0, 0.032]], 16), M.aco());
    c.rotation.z = 0.6;
    g.add(c);
    reg('sonda-lambda', g, [-0.34, 0.02, 0]);
  }

  /* ======================================================= ACESSORIOS === */
  // A Special nao tem direcao hidraulica nem ar-condicionado: a correia auxiliar
  // aciona SO o alternador. Por isso ha apenas duas polias neste circuito.
  const Z_AUX = 0.290;
  {
    const g = grupo('alternador', [0.135, 0.190, Z_AUX - 0.06]);
    const corpo = mk(B.lathe([
      [0, -0.050], [0.048, -0.050], [0.050, -0.040], [0.050, 0.040], [0.048, 0.050], [0, 0.050],
    ], 24), M.aluminioFundido());
    corpo.rotation.x = Math.PI / 2;
    g.add(corpo);
    const enrol = mk(B.ring(0.044, 0.026, 0.062, 24), M.cobre());
    enrol.rotation.x = Math.PI / 2;
    g.add(enrol);
    const polia = mk(B.polia(0.032, 0.022, { canaletas: 3, gola: 0.003 }), M.aco());
    polia.rotation.x = Math.PI / 2;
    polia.position.z = 0.062;
    g.add(polia);
    reg('alternador', g, [0.38, 0.22, 0.20]);
  }

  {
    const g = grupo('correia-alternador', [0, 0, Z_AUX]);
    const caminho = B.caminhoCorreia([
      { x: 0, y: 0, r: 0.062 },
      { x: 0.135, y: 0.190, r: 0.032 },
    ]);
    const c = mk(B.correia(caminho, 0.020, 0.005), M.borracha());
    g.add(c);
    reg('correia-alternador', g, [0, 0, 0.44]);
  }

  /* ============================================================ COXINS === */
  {
    const g = grupo('coxins');
    const posicoes = [
      [0.155, -0.035, 0.10],    // coxim lateral esquerdo
      [-0.155, -0.035, 0.10],   // coxim lateral direito
      [0, -0.075, -0.30],       // coxim traseiro, sustentando o cambio
    ];
    for (const [x, y, z] of posicoes) {
      const borrachaCoxim = mk(B.lathe([
        [0, 0], [0.034, 0], [0.036, 0.010], [0.030, 0.034], [0.026, 0.044], [0, 0.046],
      ], 20), M.borracha());
      borrachaCoxim.position.set(x, y, z);
      g.add(borrachaCoxim);
      const suporte = mk(B.roundedBox(0.070, 0.013, 0.055, 0.005, 0.002), M.acoPreto());
      suporte.position.set(x, y - 0.008, z);
      g.add(suporte);
    }
    reg('coxins-motor', g, [0, -0.28, 0]);
  }

  return motor;
}
