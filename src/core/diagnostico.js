/**
 * Diagnostico de INTERACAO — o par do verificador geometrico.
 *
 * O verificador (verificacao.js) pergunta "a peca esta no lugar certo?".
 * Este aqui pergunta "a peca responde direito ao mouse?". Nasceu de um bug
 * real: com a carroceria escondida, apontar para a bateria selecionava o capo,
 * porque o teste de visibilidade olhava a flag da propria malha em vez da
 * cadeia de pais.
 *
 * Todas as checagens sao passivas: nada aqui altera a cena de forma permanente.
 */
import * as THREE from 'three';

function visivelNaCena(obj) {
  for (let o = obj; o; o = o.parent) if (o.visible === false) return false;
  return true;
}

/**
 * Varre a tela com o MESMO caminho de codigo que o mouse usa (viewer._pick) e
 * devolve o que foi capturado.
 *
 * Testar o raycaster cru nao serve: ele SEMPRE devolve as malhas escondidas,
 * porque o three.js nao poda subarvores invisiveis. O que precisa ser afirmado
 * e outra coisa — que o _pick, depois de filtrar, nunca entregue uma peca fora
 * da tela. E isso que o usuario percebe.
 */
function varrerTela(viewer, passo = 14) {
  const canvas = viewer.renderer.domElement;
  const r = canvas.getBoundingClientRect();
  const largura = r.width || canvas.width;
  const altura = r.height || canvas.height;

  const capturadas = new Set();
  const escondidas = new Set();
  let amostras = 0;

  for (let y = passo; y < altura; y += passo) {
    for (let x = passo; x < largura; x += passo) {
      amostras++;
      const achado = viewer._pick({ clientX: r.left + x, clientY: r.top + y });
      if (!achado) continue;
      const reg = viewer.pecas.get(achado.id);
      capturadas.add(achado.id.split('@')[0]);
      if (reg && !visivelNaCena(reg.grupo)) escondidas.add(achado.id.split('@')[0]);
    }
  }
  return { capturadas, escondidas: [...escondidas], amostras };
}

export function diagnosticarInteracao(viewer, { pecaExiste }) {
  const achados = [];
  const nota = (regra, peca, detalhe) => achados.push({ regra, peca, detalhe });

  const registros = [...viewer.pecas.values()];

  /* D1 — toda peca registrada precisa existir no banco de dados */
  for (const r of registros) {
    if (!pecaExiste(r.dbId)) {
      nota('sem-ficha', r.dbId, 'objeto 3D clicavel que nao abre nenhuma ficha');
    }
  }

  /* D2 — malha pertencendo a mais de uma peca: o clique fica ambiguo */
  const dono = new Map();
  for (const r of registros) {
    for (const m of r.meshes) {
      if (dono.has(m) && dono.get(m) !== r.id) {
        nota('malha-compartilhada', r.dbId, `mesma malha registrada tambem em ${dono.get(m)}`);
      }
      dono.set(m, r.id);
    }
  }

  /* D3 — peca registrada sem nenhuma malha: item morto na arvore */
  for (const r of registros) {
    if (!r.meshes.length) nota('sem-malha', r.dbId, 'peca sem geometria clicavel');
  }

  /* D4 — userData.pecaId ausente em malha dentro de grupo registrado */
  for (const r of registros) {
    for (const m of r.meshes) {
      if (!m.userData.pecaId) nota('sem-marcacao', r.dbId, 'malha sem pecaId — nunca sera capturada');
    }
  }

  /* D5 — material fantasma preso: peca ficou transparente fora do raio-x */
  if (!viewer.modoFantasma) {
    for (const r of registros) {
      for (const m of r.meshes) {
        if (m.material !== m.userData.materialOriginal) {
          nota('material-preso', r.dbId, 'peca continua com material de raio-x fora do modo');
          break;
        }
      }
    }
  }

  /* D6 — o teste direto do bug relatado: carroceria escondida, varre a tela */
  const carroceria = viewer.raiz.getObjectByName('carroceria');
  const guardar = [];
  for (const nomeGrupo of ['lataria', 'vidros', 'teto', 'detalhes']) {
    const o = carroceria?.getObjectByName(nomeGrupo);
    if (o) { guardar.push([o, o.visible]); o.visible = false; }
  }
  const comCarroceriaOculta = varrerTela(viewer);
  for (const [o, v] of guardar) o.visible = v;

  for (const p of comCarroceriaOculta.escondidas) {
    nota('captura-peca-escondida', p,
      'com a carroceria oculta, o mouse ainda seleciona esta peca');
  }

  /* D7 — mesma varredura com tudo visivel, so para medir alcance */
  const comTudoVisivel = varrerTela(viewer);
  for (const p of comTudoVisivel.escondidas) {
    nota('captura-peca-escondida', p, 'peca oculta capturada mesmo sem esconder carroceria');
  }

  return {
    achados,
    alcancavelComCarroceria: comTudoVisivel.capturadas,
    alcancavelSemCarroceria: comCarroceriaOculta.capturadas,
    amostras: comTudoVisivel.amostras,
  };
}
