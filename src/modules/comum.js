/**
 * Helpers de montagem compartilhados entre os carros do catalogo.
 *
 * Referencial usado por TODOS os veiculos (metros):
 *   +Z = frente     |  +Y = cima  |  +X = lado ESQUERDO (motorista, direcao LHD)
 *   Y = 0 no chao.
 */
import * as THREE from 'three';

export const mk = (geo, mat) => new THREE.Mesh(geo, mat);

export function grupo(nome, pos = [0, 0, 0]) {
  const g = new THREE.Group();
  g.name = nome;
  g.position.set(...pos);
  return g;
}

/**
 * Silhueta lateral (pontos em [z, y]) extrudada na largura do carro.
 *
 * ExtrudeGeometry nasce no plano XY com profundidade em Z. Girando -90 graus
 * em Y, o X da forma vira o Z do carro (comprimento) e a profundidade vira o
 * X (largura) — que e exatamente como se desenha a silhueta de um carro.
 */
export function perfilLateral(pontos, largura, bevel = 0.05) {
  const s = new THREE.Shape();
  pontos.forEach(([z, y], i) => (i === 0 ? s.moveTo(z, y) : s.lineTo(z, y)));
  s.closePath();
  const prof = Math.max(largura - 2 * bevel, 0.01);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: prof, bevelEnabled: true,
    bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 12,
  });
  g.translate(0, 0, -prof / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

const suave = (a, b, t) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * Da FORMA a uma carroceria extrudada.
 *
 * A extrusao de uma silhueta lateral acerta o perfil, mas sai com largura
 * constante — um bloco de sabao. Carro de verdade tem duas coisas que faltam ai:
 *
 *   PLANTA:      visto de cima, afina em direcao ao bico e ao rabo
 *   TUMBLEHOME:  visto de frente, as laterais fecham subindo ate o teto
 *
 * Esta funcao deforma os vertices em X para produzir as duas. E aplicada depois
 * da extrusao, entao a silhueta lateral (que veio das cotas reais) fica intacta.
 */
export function fatorLargura(y, z, {
  zBico, zRabo, cintura, yTeto,
  afinaPontas = 0.14, tumblehome = 0.16, barriga = 0.015,
} = {}) {
  const meio = (zBico + zRabo) / 2;
  const meioComprimento = (zBico - zRabo) / 2;

  // 0 no meio do carro, 1 nas extremidades
  const t = Math.min(1, Math.abs(z - meio) / meioComprimento);
  const planta = 1 - afinaPontas * suave(0.45, 1, t);

  // acima da linha de cintura a lateral vai fechando
  const alturaRel = Math.max(0, (y - cintura) / Math.max(yTeto - cintura, 1e-4));
  const fechamento = 1 - tumblehome * suave(0, 1, alturaRel);

  // leve barriga na altura da cintura, onde o carro e mais largo
  const bojo = Math.max(1 + barriga * (1 - Math.abs(alturaRel - 0.05) * 2), 1);

  return planta * fechamento * bojo;
}

export function moldarCarroceria(geo, forma = {}) {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setX(i, pos.getX(i) * fatorLargura(pos.getY(i), pos.getZ(i), forma));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Arco da caixa de roda, amostrado como parte do contorno da lataria. */
export function arcoCaixaRoda(zCentro, yCentro, raio, passos = 16) {
  const pts = [];
  for (let i = 0; i <= passos; i++) {
    const a = (i / passos) * Math.PI;
    pts.push([zCentro + Math.cos(a) * raio, yCentro + Math.sin(a) * raio]);
  }
  return pts;
}

/**
 * Borda saliente da caixa de roda, como meia-coroa CONTINUA.
 * Montar isso com caixinhas espacadas produz um serrilhado de serra — precisa
 * ser uma peca so, extrudada no mesmo referencial da lataria.
 */
export function arcoParalama(zCentro, yCentro, rInterno, rExterno, largura) {
  const forma = new THREE.Shape();
  forma.absarc(zCentro, yCentro, rExterno, 0, Math.PI, false);
  forma.lineTo(zCentro - rInterno, yCentro);
  forma.absarc(zCentro, yCentro, rInterno, Math.PI, 0, true);
  forma.closePath();

  const g = new THREE.ExtrudeGeometry(forma, {
    depth: largura, bevelEnabled: true,
    bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 2, curveSegments: 26,
  });
  g.translate(0, 0, -largura / 2);
  g.rotateY(-Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/**
 * Colunas do teto: recebe os dois extremos em [z, y] e devolve centro,
 * comprimento e inclinacao. Derivar da silhueta (em vez de chutar angulo)
 * garante que a coluna morra POR BAIXO do teto em vez de furar por cima.
 */
export function colunaEntre([z0, y0], [z1, y1], esp) {
  const dz = z1 - z0, dy = y1 - y0;
  return {
    z: (z0 + z1) / 2,
    y: (y0 + y1) / 2,
    incl: Math.atan2(dz, dy),
    alt: Math.hypot(dz, dy),
    esp,
  };
}
