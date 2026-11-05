/**
 * Biblioteca de materiais PBR do simulador.
 *
 * Peca mecanica renderizada com cor lisa parece plastico de brinquedo. O que
 * vende o realismo e a variacao de rugosidade: aluminio fundido tem casca de
 * areia, aluminio usinado tem risco de ferramenta, ferro fundido e poroso.
 * Por isso todo material aqui carrega roughnessMap + normalMap gerados por
 * ruido fBm em runtime (nao dependemos de nenhum arquivo de textura externo).
 */
import * as THREE from 'three';

/* ---------------------------------------------------------------- ruido --- */

function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 362437);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

function smooth(t) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x, y, seed) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

/** Ruido fBm normalizado 0..1 num array Float32 de size*size. */
function fbmField(size, { octaves = 4, frequency = 6, lacunarity = 2.1, gain = 0.5, seed = 1 } = {}) {
  const out = new Float32Array(size * size);
  let min = Infinity, max = -Infinity;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let amp = 1, freq = frequency, sum = 0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum += amp * valueNoise((x / size) * freq, (y / size) * freq, seed + o * 17);
        norm += amp;
        amp *= gain;
        freq *= lacunarity;
      }
      const v = sum / norm;
      out[y * size + x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  const span = max - min || 1;
  for (let i = 0; i < out.length; i++) out[i] = (out[i] - min) / span;
  return out;
}

/** Campo de altura -> DataTexture grayscale (serve como roughnessMap). */
function fieldToGrayTexture(field, size, lo, hi) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < field.length; i++) {
    const v = Math.round((lo + field[i] * (hi - lo)) * 255);
    data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = v;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Campo de altura -> normal map por diferenca central (Sobel simplificado). */
function fieldToNormalTexture(field, size, strength) {
  const data = new Uint8Array(size * size * 4);
  const at = (x, y) => field[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      // normal = normalize(-dx, -dy, 1)
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      data[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      data[i + 1] = Math.round(((-dy / len) * 0.5 + 0.5) * 255);
      data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Campo de altura -> textura de COR (albedo manchado).
 *
 * Esta e a peca que faltava para os carros pararem de parecer zero-quilometro:
 * metal de 25 anos nao tem cor uniforme. Como o `map` MULTIPLICA a cor base do
 * material, esta textura so escurece — o intervalo lo..hi controla o quanto.
 */
function fieldToAlbedoTexture(field, size, lo, hi, tintaFria = 0) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < field.length; i++) {
    // duas oitavas somadas dao manchas grandes com sujeira fina por cima
    const n = field[i];
    const v = lo + (hi - lo) * (n * 0.75 + (n * n) * 0.25);
    const r = Math.round(Math.min(1, v * (1 + tintaFria * 0.06)) * 255);
    const g = Math.round(v * 255);
    const b = Math.round(Math.min(1, v * (1 + tintaFria * 0.14)) * 255);
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

const surfaceCache = new Map();

/**
 * Par (roughnessMap, normalMap) coerente, derivado do mesmo campo de altura.
 * Cacheado por chave para nao estourar memoria de GPU com centenas de pecas.
 */
function surface(key, opts) {
  if (surfaceCache.has(key)) return surfaceCache.get(key);
  const size = opts.size ?? 256;
  const field = fbmField(size, opts);
  const result = {
    roughnessMap: fieldToGrayTexture(field, size, opts.roughLo ?? 0.35, opts.roughHi ?? 0.85),
    normalMap: fieldToNormalTexture(field, size, opts.bump ?? 2.0),
    albedoMap: fieldToAlbedoTexture(
      field, size,
      opts.corLo ?? 0.74, opts.corHi ?? 1.0, opts.tintaFria ?? 0,
    ),
  };
  surfaceCache.set(key, result);
  return result;
}

/**
 * Anisotropia: sem isso a textura vira um borrao em qualquer superficie vista
 * de rasante — que e a maioria das pecas de um motor. 8x e o ponto em que para
 * de melhorar visivelmente.
 */
const ANISOTROPIA = 8;

function repeat(tex, n) {
  const t = tex.clone();
  t.needsUpdate = true;
  t.repeat.set(n, n);
  t.anisotropy = ANISOTROPIA;
  return t;
}

/* ----------------------------------------------------------- materiais --- */

const cache = new Map();

function define(name, factory) {
  return () => {
    if (!cache.has(name)) cache.set(name, factory());
    return cache.get(name);
  };
}

/*
 * Nota sobre intensidade: normalScale acima de ~0,3 num campo de ruido fBm
 * denso faz qualquer peca virar "concreto". O relevo aqui existe so para
 * quebrar o brilho especular — quem carrega a leitura de material e o
 * roughnessMap, nao o normalMap. Mantenha esses valores baixos.
 */

/** Aluminio fundido bruto: bloco, cabecote, carter, caixa de cambio. */
export const aluminioFundido = define('aluminioFundido', () => {
  const s = surface('fundido', {
    octaves: 4, frequency: 26, bump: 2.2, roughLo: 0.42, roughHi: 0.70, seed: 3,
    corLo: 0.80, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0xb8bfc8, metalness: 0.80, roughness: 0.58,
    map: repeat(s.albedoMap, 2),
    roughnessMap: repeat(s.roughnessMap, 2), normalMap: repeat(s.normalMap, 2),
    normalScale: new THREE.Vector2(0.18, 0.18),
  });
});

/** Aluminio usinado/polido: faces de vedacao, tampas, polias. */
export const aluminioUsinado = define('aluminioUsinado', () => {
  const s = surface('usinado', {
    octaves: 3, frequency: 60, bump: 0.8, roughLo: 0.14, roughHi: 0.30, seed: 7,
    corLo: 0.86, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0xccd2d9, metalness: 0.95, roughness: 0.26,
    map: repeat(s.albedoMap, 2),
    roughnessMap: repeat(s.roughnessMap, 2), normalMap: repeat(s.normalMap, 2),
    normalScale: new THREE.Vector2(0.07, 0.07),
  });
});

/** Ferro fundido: coletor de escape, tambor de freio, disco. */
export const ferroFundido = define('ferroFundido', () => {
  const s = surface('ferro', {
    octaves: 4, frequency: 32, bump: 2.4, roughLo: 0.58, roughHi: 0.86, seed: 11,
    corLo: 0.68, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0x7b7e85, metalness: 0.70, roughness: 0.78,
    map: repeat(s.albedoMap, 2),
    roughnessMap: repeat(s.roughnessMap, 2), normalMap: repeat(s.normalMap, 2),
    normalScale: new THREE.Vector2(0.24, 0.24),
  });
});

/** Ferro fundido com oxidacao de superficie (disco de freio em uso). */
export const ferroOxidado = define('ferroOxidado', () => {
  const s = surface('oxidado', {
    octaves: 4, frequency: 36, bump: 2.6, roughLo: 0.60, roughHi: 0.90, seed: 11,
    corLo: 0.62, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0xa87e60, metalness: 0.58, roughness: 0.86,
    map: repeat(s.albedoMap, 3),
    roughnessMap: repeat(s.roughnessMap, 3), normalMap: repeat(s.normalMap, 3),
    normalScale: new THREE.Vector2(0.30, 0.30),
  });
});

/** Aco estrutural: bracos de suspensao, subchassi, eixos. */
export const aco = define('aco', () => {
  const s = surface('aco', {
    octaves: 3, frequency: 34, bump: 1.2, roughLo: 0.28, roughHi: 0.48, seed: 5,
    corLo: 0.82, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0xa9afb8, metalness: 0.92, roughness: 0.38,
    map: repeat(s.albedoMap, 2),
    roughnessMap: repeat(s.roughnessMap, 2), normalMap: repeat(s.normalMap, 2),
    normalScale: new THREE.Vector2(0.10, 0.10),
  });
});

/** Aco pintado de preto: subchassi, suportes, molas. */
export const acoPreto = define('acoPreto', () => {
  const s = surface('acoPreto', {
    octaves: 3, frequency: 34, bump: 1.2, roughLo: 0.28, roughHi: 0.48, seed: 5,
    corLo: 0.74, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0x44474e, metalness: 0.72, roughness: 0.50,
    map: repeat(s.albedoMap, 2),
    roughnessMap: repeat(s.roughnessMap, 2), normalMap: repeat(s.normalMap, 2),
    normalScale: new THREE.Vector2(0.09, 0.09),
  });
});

/** Cromo / aco polido: hastes de amortecedor, parafusaria fina. */
export const cromo = define('cromo', () => new THREE.MeshStandardMaterial({
  color: 0xd8dde3, metalness: 1.0, roughness: 0.08,
}));

/** Borracha: coifas, mangueiras, coxins, pneus. */
export const borracha = define('borracha', () => {
  const s = surface('borracha', {
    octaves: 3, frequency: 48, bump: 1.4, roughLo: 0.78, roughHi: 0.95, seed: 13,
    corLo: 0.76, corHi: 1.0,
  });
  /*
   * Repeticao BAIXA e relevo suave de proposito: coifas e coxins sao feitos com
   * LatheGeometry, e o UV dela comprime fortemente perto do eixo. Com repeat
   * alto, essa compressao vira um redemoinho no normal map — a peca ganha
   * manchas em espiral que nao existem. Menos repeticao resolve na origem.
   */
  return new THREE.MeshStandardMaterial({
    color: 0x2b2d32, metalness: 0.0, roughness: 0.90,
    map: repeat(s.albedoMap, 1.5),
    roughnessMap: repeat(s.roughnessMap, 1.5), normalMap: repeat(s.normalMap, 1.5),
    normalScale: new THREE.Vector2(0.08, 0.08),
  });
});

/** Plastico preto tecnico: coletor de admissao plastico, caixa de filtro, tampas. */
export const plasticoPreto = define('plasticoPreto', () => {
  const s = surface('plastico', {
    octaves: 3, frequency: 70, bump: 0.9, roughLo: 0.46, roughHi: 0.66, seed: 17,
    corLo: 0.74, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0x34363c, metalness: 0.05, roughness: 0.60,
    map: repeat(s.albedoMap, 3),
    roughnessMap: repeat(s.roughnessMap, 3), normalMap: repeat(s.normalMap, 3),
    normalScale: new THREE.Vector2(0.12, 0.12),
  });
});

/** Cobre: enrolamento de alternador e motor de partida. */
export const cobre = define('cobre', () => new THREE.MeshStandardMaterial({
  color: 0xb06b3a, metalness: 1.0, roughness: 0.35,
}));

/** Latao / bronze: buchas, terminais eletricos, nucleo de radiador antigo. */
export const latao = define('latao', () => new THREE.MeshStandardMaterial({
  color: 0xb08d4a, metalness: 1.0, roughness: 0.3,
}));

/** Aluminio de radiador e intercooler (aletado, mais fosco). */
export const aluminioRadiador = define('aluminioRadiador', () => {
  const s = surface('radiador', {
    octaves: 3, frequency: 80, bump: 1.0, roughLo: 0.5, roughHi: 0.72, seed: 23,
    corLo: 0.74, corHi: 1.0, tintaFria: -0.6,
  });
  return new THREE.MeshStandardMaterial({
    color: 0xaeb4bc, metalness: 0.78, roughness: 0.62,
    map: repeat(s.albedoMap, 3),
    roughnessMap: repeat(s.roughnessMap, 3), normalMap: repeat(s.normalMap, 3),
    normalScale: new THREE.Vector2(0.12, 0.12),
  });
});

/** Pintura automotiva com verniz (carroceria). */
export function pintura(cor = 0x9a2a2a) {
  const key = `pintura_${cor}`;
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshPhysicalMaterial({
      color: cor, metalness: 0.55, roughness: 0.22,
      clearcoat: 1.0, clearcoatRoughness: 0.06,
    }));
  }
  return cache.get(key);
}

/** Vidro dos vidros e faroís. */
export const vidro = define('vidro', () => new THREE.MeshPhysicalMaterial({
  color: 0xaebcc4, metalness: 0.0, roughness: 0.05,
  transmission: 0.92, thickness: 0.01, ior: 1.5,
  transparent: true, opacity: 0.35, side: THREE.DoubleSide,
}));

/** Lente de lanterna traseira. */
export const lenteVermelha = define('lenteVermelha', () => new THREE.MeshPhysicalMaterial({
  color: 0xaa1417, metalness: 0.0, roughness: 0.15,
  transmission: 0.6, thickness: 0.01, transparent: true, opacity: 0.75,
}));

/** Lente ambar (pisca). */
export const lenteAmbar = define('lenteAmbar', () => new THREE.MeshPhysicalMaterial({
  color: 0xc87a10, metalness: 0.0, roughness: 0.15,
  transmission: 0.6, thickness: 0.01, transparent: true, opacity: 0.75,
}));

/** Refletor cromado interno de farol. */
export const refletor = define('refletor', () => new THREE.MeshStandardMaterial({
  color: 0xf0f4f8, metalness: 1.0, roughness: 0.03,
}));

/** Ceramica de vela de ignicao. */
export const ceramica = define('ceramica', () => new THREE.MeshStandardMaterial({
  color: 0xe8e4dc, metalness: 0.0, roughness: 0.35,
}));

/** Material de atrito (lona/pastilha). */
export const lonaFreio = define('lonaFreio', () => new THREE.MeshStandardMaterial({
  color: 0x3d3a36, metalness: 0.1, roughness: 0.95,
}));

/** Tecido de banco / forracao. */
export const tecido = define('tecido', () => {
  const s = surface('tecido', {
    octaves: 3, frequency: 110, bump: 1.4, roughLo: 0.86, roughHi: 1.0, seed: 29,
    corLo: 0.80, corHi: 1.0,
  });
  return new THREE.MeshStandardMaterial({
    color: 0x4d5057, metalness: 0.0, roughness: 0.94,
    map: repeat(s.albedoMap, 4),
    roughnessMap: repeat(s.roughnessMap, 4), normalMap: repeat(s.normalMap, 4),
    normalScale: new THREE.Vector2(0.22, 0.22),
  });
});

/** Fluido (oleo, ATF, liquido de arrefecimento) para vistas de nivel. */
export function fluido(cor = 0x1c1408) {
  const key = `fluido_${cor}`;
  if (!cache.has(key)) {
    cache.set(key, new THREE.MeshPhysicalMaterial({
      color: cor, metalness: 0.0, roughness: 0.12,
      transmission: 0.5, thickness: 0.05, transparent: true, opacity: 0.85,
    }));
  }
  return cache.get(key);
}

/** Descarta todas as texturas geradas (usado no teardown). */
export function disposeMaterials() {
  for (const m of cache.values()) m.dispose?.();
  for (const s of surfaceCache.values()) {
    s.roughnessMap.dispose();
    s.normalMap.dispose();
    s.albedoMap.dispose();
  }
  cache.clear();
  surfaceCache.clear();
}
