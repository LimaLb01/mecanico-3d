/**
 * Modelos GLB esculpidos no Blender (fonte em modelagem/).
 *
 * Por que PRE-carregar em vez de carregar sob demanda: o viewer indexa as
 * malhas de uma peca NO MOMENTO do registro (`registrar` percorre o grupo e
 * guarda a lista em `pecas`). Carregar o GLB depois e trocar os filhos do
 * grupo deixaria esse indice apontando para malha ja removida — a peca
 * continuaria na arvore e pararia de responder ao mouse, que e exatamente a
 * classe de bug que o diagnostico existe para pegar.
 *
 * Se o arquivo faltar ou falhar, nada quebra: `temModelo` devolve false e cada
 * construtor cai na versao por codigo.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/** caminho -> Map(nome do objeto no Blender -> BufferGeometry) */
const carregados = new Map();

const url = (caminho) => `${import.meta.env.BASE_URL}${caminho}`.replace(/([^:])\/{2,}/g, '$1/');

function ler(caminho) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(url(caminho), resolve, undefined, reject);
  });
}

/**
 * Carrega os GLB indicados. NUNCA rejeita: uma falha de rede nao pode impedir
 * o simulador de abrir, so faz o carro voltar a ser desenhado por codigo.
 */
export async function precarregarModelos(caminhos) {
  await Promise.all(caminhos.map(async (caminho) => {
    if (carregados.has(caminho)) return;
    try {
      const gltf = await ler(caminho);
      const geos = new Map();
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        // o exportador pode acrescentar sufixo .001 quando ha nomes repetidos
        geos.set(o.name.replace(/\.\d+$/, ''), o.geometry);
      });
      carregados.set(caminho, geos);
    } catch (erro) {
      console.warn(`[modelos] ${caminho} nao carregou; segue a versao por codigo.`, erro);
      carregados.set(caminho, new Map());
    }
  }));
}

export function temModelo(caminho) {
  return (carregados.get(caminho)?.size ?? 0) > 0;
}

export function geometria(caminho, nome) {
  return carregados.get(caminho)?.get(nome) ?? null;
}

/**
 * Sonda a meia largura real da lataria em (y, z), por raycast.
 *
 * Retrovisor, macaneta e friso precisam nascer NA superficie. Com a lataria
 * desenhada por codigo isso saia de uma formula; vindo de malha esculpida nao
 * ha formula, entao a resposta e medida na propria geometria. Assim o detalhe
 * acompanha a carroceria mesmo depois de eu remodelar no Blender.
 */
export function sondaSuperficie(geo, padrao = 0.83) {
  if (!geo) return () => padrao;
  const malha = new THREE.Mesh(geo);
  malha.updateMatrixWorld(true);
  const raycaster = new THREE.Raycaster();
  const origem = new THREE.Vector3();
  const paraDentro = new THREE.Vector3(-1, 0, 0);

  return (y, z) => {
    origem.set(3, y, z);
    raycaster.set(origem, paraDentro);
    const toques = raycaster.intersectObject(malha, false);
    return toques.length ? toques[0].point.x : padrao;
  };
}
