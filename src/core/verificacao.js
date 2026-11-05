/**
 * Verificador geometrico de montagem.
 *
 * De onde veio esta ideia: no Car Mechanic Simulator a posicao de cada peca e
 * autorada por um artista olhando referencia real do fabricante, e fica gravada
 * no proprio pivo da malha — a posicao e DADO, nao codigo. Aqui nao ha
 * referencia licenciada nem artista, entao o que substitui essa garantia e
 * verificacao automatica: em vez de descobrir de olho que uma peca atravessa o
 * capo, o programa afirma isso sozinho.
 *
 * Cada regra devolve ocorrencias com a peca, o valor medido e o esperado.
 * Nenhuma regra "conserta" nada — o objetivo e ACUSAR, nao mascarar.
 */
import * as THREE from 'three';

/* ------------------------------------------------------- utilidades --- */

const _caixa = new THREE.Box3();
const _v = new THREE.Vector3();

/**
 * Caixa envolvente de um registro de peca, em coordenadas de mundo.
 *
 * ATENCAO: nao chame updateMatrixWorld no proprio grupo da peca. Ele recalcula
 * a matriz a partir do PAI, e se a cadeia acima estiver desatualizada (por
 * exemplo quando nenhum quadro foi desenhado ainda) o resultado sai deslocado —
 * o suficiente para o verificador acusar dezenas de defeitos que nao existem.
 * A atualizacao e feita uma vez so, a partir da raiz, em verificarMontagem.
 */
function caixaDe(registro) {
  _caixa.makeEmpty();
  registro.grupo.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    o.geometry.computeBoundingBox();
    const bb = o.geometry.boundingBox;
    if (!bb) return;
    for (let i = 0; i < 8; i++) {
      _v.set(
        i & 1 ? bb.max.x : bb.min.x,
        i & 2 ? bb.max.y : bb.min.y,
        i & 4 ? bb.max.z : bb.min.z,
      ).applyMatrix4(o.matrixWorld);
      _caixa.expandByPoint(_v);
    }
  });
  return _caixa.isEmpty() ? null : _caixa.clone();
}

/**
 * Altura da silhueta lateral num dado Z, interpolada do contorno da carroceria.
 * E o que permite perguntar "o capo passa por cima desta peca aqui?".
 */
function alturaDaSilhueta(contorno, z) {
  let melhor = null;
  for (let i = 0; i < contorno.length - 1; i++) {
    const [z0, y0] = contorno[i];
    const [z1, y1] = contorno[i + 1];
    if ((z - z0) * (z - z1) > 0) continue;          // z fora deste segmento
    if (Math.abs(z1 - z0) < 1e-6) continue;
    const t = (z - z0) / (z1 - z0);
    const y = y0 + (y1 - y0) * t;
    if (melhor === null || y > melhor) melhor = y;  // aresta superior
  }
  return melhor;
}

/* ------------------------------------------------------------ regras --- */

/**
 * @param {Viewer} viewer
 * @param {object} perfil  descricao geometrica do carro ativo
 */
export function verificarMontagem(viewer, perfil) {
  const achados = [];
  const nota = (regra, peca, detalhe, medido, esperado, gravidade = 'alto') =>
    achados.push({ regra, peca, detalhe, medido, esperado, gravidade });

  // uma unica atualizacao, a partir da raiz da cena: garante que toda a cadeia
  // de matrizes esteja coerente antes de medir qualquer coisa
  viewer.scene.updateMatrixWorld(true);

  const registros = [...viewer.pecas.values()];
  const caixas = new Map();
  for (const r of registros) {
    const c = caixaDe(r);
    if (c) caixas.set(r.id, c);
  }

  /* R1 — peca sem geometria: registrada mas invisivel, so gera clique morto */
  for (const r of registros) {
    if (!caixas.has(r.id)) {
      nota('geometria-vazia', r.dbId, 'peca registrada sem malha renderizavel', '—', 'caixa nao vazia', 'alto');
    }
  }

  /* R2 — nada pode estar abaixo do solo */
  for (const [id, c] of caixas) {
    if (c.min.y < -0.005) {
      nota('abaixo-do-solo', id.split('@')[0],
        'peca atravessa o piso', `${(c.min.y * 1000).toFixed(0)} mm`, '≥ 0 mm', 'medio');
    }
  }

  /* R3 — nada do vao do motor pode furar a linha do capo */
  if (perfil.contorno) {
    for (const r of registros) {
      if (!perfil.sistemasSobCapo.includes(perfil.sistemaDe(r.dbId))) continue;
      const c = caixas.get(r.id);
      if (!c) continue;
      const zMeio = (c.min.z + c.max.z) / 2;
      const linha = alturaDaSilhueta(perfil.contorno, zMeio);
      if (linha === null) continue;
      const folga = linha - c.max.y;
      if (folga < 0) {
        nota('fura-o-capo', r.dbId,
          `topo da peca acima da linha da lataria em z = ${zMeio.toFixed(2)} m`,
          `${(c.max.y * 1000).toFixed(0)} mm`, `≤ ${(linha * 1000).toFixed(0)} mm`, 'alto');
      }
    }
  }

  /* R4 — nada pode ultrapassar o comprimento e a largura reais do carro */
  for (const r of registros) {
    if (perfil.podeUltrapassar.includes(r.dbId)) continue;
    const c = caixas.get(r.id);
    if (!c) continue;
    if (c.max.z > perfil.frente + 0.02 || c.min.z < perfil.tras - 0.02) {
      nota('fora-do-comprimento', r.dbId, 'peca ultrapassa o para-choque',
        `${c.min.z.toFixed(3)} a ${c.max.z.toFixed(3)} m`,
        `${perfil.tras.toFixed(3)} a ${perfil.frente.toFixed(3)} m`, 'medio');
    }
    if (Math.max(Math.abs(c.min.x), Math.abs(c.max.x)) > perfil.meiaLargura + 0.02) {
      nota('fora-da-largura', r.dbId, 'peca ultrapassa a lateral',
        `${(Math.max(Math.abs(c.min.x), Math.abs(c.max.x)) * 1000).toFixed(0)} mm`,
        `≤ ${(perfil.meiaLargura * 1000).toFixed(0)} mm`, 'medio');
    }
  }

  /* R5 — pares esquerda/direita precisam ser espelhados de verdade */
  const pares = new Map();
  for (const r of registros) {
    const m = r.id.match(/^(.*)@(.*)([ED])$/);
    if (!m) continue;
    const chave = `${m[1]}@${m[2]}`;
    if (!pares.has(chave)) pares.set(chave, {});
    pares.get(chave)[m[3]] = r.id;
  }
  for (const [chave, lados] of pares) {
    if (!lados.E || !lados.D) continue;
    const ce = caixas.get(lados.E), cd = caixas.get(lados.D);
    if (!ce || !cd) continue;
    const centroE = ce.getCenter(new THREE.Vector3());
    const centroD = cd.getCenter(new THREE.Vector3());
    const erroX = Math.abs(centroE.x + centroD.x);          // devem ser simetricos
    const erroY = Math.abs(centroE.y - centroD.y);
    const erroZ = Math.abs(centroE.z - centroD.z);
    if (erroX > 0.006 || erroY > 0.006 || erroZ > 0.006) {
      nota('par-assimetrico', chave.split('@')[0],
        'lados esquerdo e direito nao sao espelhados',
        `ΔX ${(erroX * 1000).toFixed(0)} / ΔY ${(erroY * 1000).toFixed(0)} / ΔZ ${(erroZ * 1000).toFixed(0)} mm`,
        '≤ 6 mm', 'alto');
    }
  }

  /* R6 — cada roda tem de caber na sua caixa de roda */
  for (const [sufixo, xEsperado, zEsperado] of perfil.cantos) {
    const c = caixas.get(`rodas@${sufixo}`) || caixas.get(`pneus@${sufixo}`);
    if (!c) continue;
    const centro = c.getCenter(new THREE.Vector3());
    const dz = Math.abs(centro.z - zEsperado);
    const dx = Math.abs(Math.abs(centro.x) - Math.abs(xEsperado));
    if (dz > 0.02 || dx > 0.02) {
      nota('roda-fora-do-eixo', 'rodas',
        `roda ${sufixo} fora da posicao de eixo`,
        `x ${centro.x.toFixed(3)} / z ${centro.z.toFixed(3)} m`,
        `x ${xEsperado.toFixed(3)} / z ${zEsperado.toFixed(3)} m`, 'alto');
    }
  }

  /* R7 — o conjunto motor tem de caber no vao, entre travessa e corta-fogo */
  if (perfil.vaoMotor) {
    const { zFrente, zTras } = perfil.vaoMotor;
    for (const r of registros) {
      if (perfil.sistemaDe(r.dbId) !== 'motor') continue;
      const c = caixas.get(r.id);
      if (!c) continue;
      if (c.max.z > zFrente + 0.03 || c.min.z < zTras - 0.03) {
        nota('motor-fora-do-vao', r.dbId, 'peca de motor fora dos limites do vao',
          `${c.min.z.toFixed(3)} a ${c.max.z.toFixed(3)} m`,
          `${zTras.toFixed(3)} a ${zFrente.toFixed(3)} m`, 'medio');
      }
    }
  }

  return achados;
}

/** Agrupa por regra e devolve um resumo legivel. */
export function resumir(achados) {
  const porRegra = new Map();
  for (const a of achados) {
    if (!porRegra.has(a.regra)) porRegra.set(a.regra, []);
    porRegra.get(a.regra).push(a);
  }
  return [...porRegra.entries()]
    .map(([regra, itens]) => ({ regra, total: itens.length, itens }))
    .sort((a, b) => b.total - a.total);
}
