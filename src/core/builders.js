/**
 * Helpers de geometria mecanica.
 *
 * Tudo aqui e construido por codigo em METROS, nas proporcoes reais do carro.
 * A ideia e ter o vocabulario de formas que aparece de verdade num motor:
 * flanges, polias, engrenagens, molas helicoidais, mangueiras, correias que
 * realmente contornam as polias, nucleos aletados de radiador.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const TAU = Math.PI * 2;

/**
 * mergeGeometries e exigente: recusa juntar geometrias com conjuntos de
 * atributos diferentes. LatheGeometry e CylinderGeometry vem indexadas,
 * ExtrudeGeometry nao — misturar as duas quebra. Normalizamos tudo para
 * nao-indexado antes de fundir.
 */
function fundir(lista) {
  const normalizadas = lista
    .filter(Boolean)
    .map((g) => (g.index ? g.toNonIndexed() : g));
  return mergeGeometries(normalizadas, false);
}

/* ------------------------------------------------------------- solidos --- */

/** Caixa com cantos arredondados e arestas chanfradas. Dimensoes exatas. */
export function roundedBox(w, h, d, r = 0.008, bevel = 0.003) {
  const bw = Math.max(w - 2 * bevel, 1e-4);
  const bh = Math.max(h - 2 * bevel, 1e-4);
  const bd = Math.max(d - 2 * bevel, 1e-4);
  const rr = Math.min(r, bw / 2 - 1e-4, bh / 2 - 1e-4);

  const s = new THREE.Shape();
  const hw = bw / 2, hh = bh / 2;
  s.moveTo(-hw + rr, -hh);
  s.lineTo(hw - rr, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + rr);
  s.lineTo(hw, hh - rr);
  s.quadraticCurveTo(hw, hh, hw - rr, hh);
  s.lineTo(-hw + rr, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - rr);
  s.lineTo(-hw, -hh + rr);
  s.quadraticCurveTo(-hw, -hh, -hw + rr, -hh);

  const g = new THREE.ExtrudeGeometry(s, {
    depth: bd,
    bevelEnabled: bevel > 0,
    bevelSize: bevel,
    bevelThickness: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  });
  g.translate(0, 0, -bd / 2);
  g.computeVertexNormals();
  return g;
}

/** Cilindro com eixo em Y por padrao. */
export function cyl(rTop, rBottom, h, seg = 32, open = false) {
  return new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1, open);
}

/** Cilindro deitado no eixo X (util para motores transversais). */
export function cylX(r, h, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.rotateZ(Math.PI / 2);
  return g;
}

/** Cilindro deitado no eixo Z. */
export function cylZ(r, h, seg = 32) {
  const g = new THREE.CylinderGeometry(r, r, h, seg);
  g.rotateX(Math.PI / 2);
  return g;
}

/** Tubo furado (anel extrudado) — flanges, arruelas, cubos. */
export function ring(rOuter, rInner, h, seg = 32) {
  const s = new THREE.Shape();
  s.absarc(0, 0, rOuter, 0, TAU, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rInner, 0, TAU, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false, curveSegments: seg });
  g.translate(0, 0, -h / 2);
  g.rotateX(-Math.PI / 2); // eixo em Y
  g.computeVertexNormals();
  return g;
}

/** Perfil revolucionado (LatheGeometry) a partir de pares [raio, altura]. */
export function lathe(profile, seg = 32) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(Math.max(r, 1e-5), y));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------ conexoes --- */

/** Mangueira / chicote / tubulacao seguindo uma curva suave. */
export function hose(points, radius, { segments = 64, radial = 14, closed = false } = {}) {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))),
    closed,
    'catmullrom',
    0.5,
  );
  return new THREE.TubeGeometry(curve, segments, radius, radial, closed);
}

/** Mangueira sanfonada (coifa de homocinetica, duto de ar). */
export function fole(points, radius, { rings = 10, amp = 0.008, radial = 14 } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => (p.isVector3 ? p : new THREE.Vector3(...p))));
  const segs = rings * 6;
  const geoms = [];
  const frames = curve.computeFrenetFrames(segs, false);
  const pos = [];
  for (let i = 0; i <= segs; i++) pos.push(curve.getPointAt(i / segs));

  const g = new THREE.BufferGeometry();
  const verts = [], norms = [], uvs = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const wave = 1 + amp / radius * Math.sin((i / segs) * rings * TAU);
    const r = radius * wave;
    const N = frames.normals[Math.min(i, segs - 1)];
    const B = frames.binormals[Math.min(i, segs - 1)];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * TAU;
      const nx = Math.cos(a) * N.x + Math.sin(a) * B.x;
      const ny = Math.cos(a) * N.y + Math.sin(a) * B.y;
      const nz = Math.cos(a) * N.z + Math.sin(a) * B.z;
      verts.push(pos[i].x + nx * r, pos[i].y + ny * r, pos[i].z + nz * r);
      norms.push(nx, ny, nz);
      uvs.push(i / segs, j / radial);
    }
  }
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* -------------------------------------------------------------- molas --- */

/** Mola helicoidal real (arame enrolado), nao um cilindro fake. */
export function molaHelicoidal(coilR, wireR, turns, height, { segments = 24 } = {}) {
  const pts = [];
  const total = Math.round(turns * segments);
  for (let i = 0; i <= total; i++) {
    const t = i / total;
    const a = t * turns * TAU;
    // extremidades assentadas: passo diminui no primeiro e ultimo meio giro
    const ease = Math.min(1, t * turns * 2) * Math.min(1, (1 - t) * turns * 2);
    const r = coilR * (0.94 + 0.06 * ease);
    pts.push(new THREE.Vector3(Math.cos(a) * r, t * height, Math.sin(a) * r));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, total, wireR, 12, false);
}

/* -------------------------------------------------- polias e engrenagens --- */

/** Polia lisa/canaletada para correia auxiliar. Eixo em Y. */
export function polia(rExt, largura, { canaletas = 4, gola = 0.004 } = {}) {
  const prof = [];
  const half = largura / 2;
  prof.push([0.006, -half]);
  prof.push([rExt, -half]);
  prof.push([rExt, -half + gola]);
  const step = (largura - 2 * gola) / canaletas;
  for (let i = 0; i < canaletas; i++) {
    const y0 = -half + gola + i * step;
    prof.push([rExt - gola * 1.6, y0 + step * 0.5]);
    prof.push([rExt, y0 + step]);
  }
  prof.push([rExt, half]);
  prof.push([0.006, half]);
  return lathe(prof, 40);
}

/** Polia dentada (comando/virabrequim da correia dentada). Eixo em Y. */
export function polia_dentada(rExt, largura, dentes) {
  const base = lathe([
    [0.008, -largura / 2], [rExt * 0.86, -largura / 2],
    [rExt * 0.86, largura / 2], [0.008, largura / 2],
  ], 40);
  const geoms = [base];
  const dente = roundedBox(rExt * 0.16, rExt * 0.16, largura * 0.86, 0.0015, 0.0008);
  for (let i = 0; i < dentes; i++) {
    const a = (i / dentes) * TAU;
    const g = dente.clone();
    g.rotateX(Math.PI / 2);
    g.rotateY(-a);
    g.translate(Math.cos(a) * rExt * 0.92, 0, Math.sin(a) * rExt * 0.92);
    geoms.push(g);
  }
  // flanges laterais
  const fl = ring(rExt * 1.02, rExt * 0.5, largura * 0.06, 32);
  fl.translate(0, -largura / 2, 0);
  geoms.push(fl);
  const fr = ring(rExt * 1.02, rExt * 0.5, largura * 0.06, 32);
  fr.translate(0, largura / 2, 0);
  geoms.push(fr);
  return fundir(geoms);
}

/** Engrenagem de dentes retos (cambio, diferencial). Eixo em Y. */
export function engrenagem(dentes, rPrimitivo, espessura, { rFuro = 0 } = {}) {
  const mod = (2 * rPrimitivo) / dentes;
  const rExt = rPrimitivo + mod * 0.9;
  const rRaiz = rPrimitivo - mod * 1.1;
  const s = new THREE.Shape();
  for (let i = 0; i < dentes; i++) {
    const a0 = (i / dentes) * TAU;
    const passo = TAU / dentes;
    const pts = [
      [rRaiz, a0],
      [rExt, a0 + passo * 0.18],
      [rExt, a0 + passo * 0.38],
      [rRaiz, a0 + passo * 0.56],
      [rRaiz, a0 + passo],
    ];
    for (const [r, a] of pts) {
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i === 0 && r === rRaiz && a === a0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
  }
  s.closePath();
  if (rFuro > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, rFuro, 0, TAU, true);
    s.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth: espessura, bevelEnabled: false, curveSegments: 4 });
  g.translate(0, 0, -espessura / 2);
  g.rotateX(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/* ------------------------------------------------------------ correias --- */

/**
 * Caminho de correia que realmente tangencia as polias.
 * Recebe circulos {x, y, r} coplanares, monta o fecho convexo e liga cada par
 * com a tangente externa correta, fechando com o arco de contato. E isso que
 * faz a correia dentada "abracar" as polias em vez de flutuar.
 */
export function caminhoCorreia(circulos) {
  // fecho convexo dos centros (poucos pontos, gift wrapping serve)
  const pts = circulos.map((c, i) => ({ ...c, i }));
  const start = pts.reduce((a, b) => (b.x < a.x || (b.x === a.x && b.y < a.y) ? b : a), pts[0]);
  const hull = [];
  let cur = start;
  do {
    hull.push(cur);
    let next = pts[0] === cur ? pts[1] : pts[0];
    for (const p of pts) {
      if (p === cur) continue;
      const cross = (next.x - cur.x) * (p.y - cur.y) - (next.y - cur.y) * (p.x - cur.x);
      if (cross < 0) next = p;
    }
    cur = next;
  } while (cur !== start && hull.length < pts.length + 1);

  // tangentes externas entre circulos consecutivos (percurso anti-horario)
  const tangentes = [];
  for (let k = 0; k < hull.length; k++) {
    const A = hull[k], B = hull[(k + 1) % hull.length];
    const dx = B.x - A.x, dy = B.y - A.y;
    const dist = Math.hypot(dx, dy);
    const theta = Math.atan2(dy, dx);
    const phi = Math.acos(Math.max(-1, Math.min(1, (A.r - B.r) / dist)));
    const ang = theta - phi;
    tangentes.push({
      saida: { c: A, ang },
      chegada: { c: B, ang },
    });
  }

  // monta a polilinha: arco de contato em cada polia + reta ate a proxima
  const caminho = [];
  for (let k = 0; k < tangentes.length; k++) {
    const anterior = tangentes[(k - 1 + tangentes.length) % tangentes.length];
    const atual = tangentes[k];
    const c = atual.saida.c;
    let a0 = anterior.chegada.ang;
    let a1 = atual.saida.ang;
    while (a1 < a0) a1 += TAU;
    const passos = Math.max(3, Math.ceil(((a1 - a0) / TAU) * 48));
    for (let s = 0; s <= passos; s++) {
      const a = a0 + ((a1 - a0) * s) / passos;
      caminho.push([c.x + Math.cos(a) * c.r, c.y + Math.sin(a) * c.r]);
    }
  }
  return caminho;
}

/**
 * Geometria de correia (fita fechada) a partir do caminho 2D no plano XY,
 * extrudada em Z pela largura. `dentes` adiciona os dentes internos da correia
 * dentada.
 */
export function correia(caminho, largura, espessura, { dentes = false, passoDente = 0.0095 } = {}) {
  // centroide para determinar a normal externa (o caminho e convexo)
  let cx = 0, cy = 0;
  for (const [x, y] of caminho) { cx += x; cy += y; }
  cx /= caminho.length; cy /= caminho.length;

  const verts = [], idx = [];
  const n = caminho.length;
  const hw = largura / 2;
  for (let i = 0; i < n; i++) {
    const [x, y] = caminho[i];
    let nx = x - cx, ny = y - cy;
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const ox = x + nx * espessura, oy = y + ny * espessura;
    // 0 int-tras, 1 int-frente, 2 ext-tras, 3 ext-frente
    verts.push(x, y, -hw, x, y, hw, ox, oy, -hw, ox, oy, hw);
  }
  for (let i = 0; i < n; i++) {
    const a = i * 4, b = ((i + 1) % n) * 4;
    idx.push(a + 0, b + 0, a + 1, b + 0, b + 1, a + 1);     // face interna
    idx.push(a + 2, a + 3, b + 2, b + 2, a + 3, b + 3);     // face externa
    idx.push(a + 1, b + 1, a + 3, b + 1, b + 3, a + 3);     // lateral frente
    idx.push(a + 0, a + 2, b + 0, b + 0, a + 2, b + 2);     // lateral tras
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  // UV e obrigatorio para poder fundir com os dentes (ExtrudeGeometry traz uv)
  const uvs = [];
  for (let i = 0; i < n; i++) {
    const u = i / n;
    uvs.push(u, 0, u, 1, u, 0, u, 1);
  }
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();

  if (!dentes) return g;

  // dentes internos espacados por comprimento de arco
  const geoms = [g];
  let acumulado = 0;
  const denteGeo = roundedBox(0.005, 0.004, largura * 0.9, 0.0008, 0.0004);
  for (let i = 0; i < n; i++) {
    const [x0, y0] = caminho[i];
    const [x1, y1] = caminho[(i + 1) % n];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    acumulado += seg;
    if (acumulado < passoDente) continue;
    acumulado = 0;
    let nx = x0 - cx, ny = y0 - cy;
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    const d = denteGeo.clone();
    d.rotateZ(Math.atan2(ny, nx));
    d.translate(x0 - nx * 0.0018, y0 - ny * 0.0018, 0);
    geoms.push(d);
  }
  return fundir(geoms);
}

/* ----------------------------------------------------------- radiador --- */

/** Nucleo aletado (radiador, condensador de A/C, radiador de aquecimento). */
export function nucleoAletado(largura, altura, prof, aletas = 46) {
  const geoms = [];
  const passo = largura / aletas;
  for (let i = 0; i < aletas; i++) {
    const g = roundedBox(passo * 0.42, altura, prof, 0.0004, 0.0002);
    g.translate(-largura / 2 + passo * (i + 0.5), 0, 0);
    geoms.push(g);
  }
  // tubos horizontais entre aletas
  const linhas = Math.max(4, Math.round(altura / 0.035));
  for (let j = 0; j < linhas; j++) {
    const g = roundedBox(largura, 0.004, prof * 0.8, 0.001, 0.0005);
    g.translate(0, -altura / 2 + (altura / (linhas - 1)) * j, 0);
    geoms.push(g);
  }
  return fundir(geoms);
}

/* ------------------------------------------------------- parafusaria --- */

/** Parafuso sextavado. Eixo em Y, cabeca em y=0 subindo. */
export function parafuso(diametro, comprimento) {
  const rCab = diametro * 0.85;
  const cabeca = new THREE.CylinderGeometry(rCab, rCab, diametro * 0.65, 6);
  cabeca.translate(0, diametro * 0.325, 0);
  const haste = new THREE.CylinderGeometry(diametro / 2, diametro / 2, comprimento, 12);
  haste.translate(0, -comprimento / 2, 0);
  return fundir([cabeca, haste]);
}

/** Porca sextavada. */
export function porca(diametro) {
  const s = new THREE.Shape();
  const r = diametro * 0.85;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, diametro / 2, 0, TAU, true);
  s.holes.push(hole);
  const g = new THREE.ExtrudeGeometry(s, { depth: diametro * 0.6, bevelEnabled: false });
  g.translate(0, 0, -diametro * 0.3);
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Distribui parafusos ao longo de um retangulo (flange de tampa de valvula). */
export function parafusosEmRetangulo(w, d, nx, nz, diametro, comprimento) {
  const geoms = [];
  for (let i = 0; i < nx; i++) {
    for (let k = 0; k < nz; k++) {
      if (i > 0 && i < nx - 1 && k > 0 && k < nz - 1) continue; // so no perimetro
      const g = parafuso(diametro, comprimento);
      g.translate(-w / 2 + (w / (nx - 1)) * i, 0, -d / 2 + (d / (nz - 1)) * k);
      geoms.push(g);
    }
  }
  return fundir(geoms);
}

/* ---------------------------------------------------------- utilidades --- */

/** Une geometrias ja posicionadas num unico buffer (reduz draw calls). */
export function unir(geometrias) {
  return fundir(geometrias);
}

/** Aplica translacao/rotacao a uma geometria e devolve ela mesma (encadeavel). */
export function pos(g, [x = 0, y = 0, z = 0] = [], [rx = 0, ry = 0, rz = 0] = []) {
  if (rx) g.rotateX(rx);
  if (ry) g.rotateY(ry);
  if (rz) g.rotateZ(rz);
  g.translate(x, y, z);
  return g;
}
