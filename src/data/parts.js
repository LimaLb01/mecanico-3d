/**
 * Camada de consulta ao banco de pecas do VEICULO ATIVO.
 *
 * Tudo aqui e funcao, nao constante: o conteudo muda quando o usuario troca de
 * carro no seletor. As unicas constantes sao a taxonomia compartilhada
 * (sistemas e gravidades), que vale para qualquer veiculo do catalogo.
 */

import { veiculoAtivo } from './catalogo.js';

/** Sistemas do carro, na ordem em que aparecem na arvore. */
export const SISTEMAS = {
  motor: { rotulo: 'Motor', cor: '#ff8a3d', icone: 'M' },
  arrefecimento: { rotulo: 'Arrefecimento', cor: '#3ec5ff', icone: 'A' },
  admissao: { rotulo: 'Admissao', cor: '#7ee081', icone: 'AD' },
  escape: { rotulo: 'Escape', cor: '#9b8f85', icone: 'E' },
  ignicao: { rotulo: 'Ignicao', cor: '#ffd93d', icone: 'I' },
  combustivel: { rotulo: 'Combustivel', cor: '#ff6b8b', icone: 'C' },
  transmissao: { rotulo: 'Transmissao', cor: '#b48aff', icone: 'T' },
  suspensao: { rotulo: 'Suspensao', cor: '#4dd6c1', icone: 'S' },
  freios: { rotulo: 'Freios', cor: '#ff5f5f', icone: 'F' },
  direcao: { rotulo: 'Direcao', cor: '#5fa8ff', icone: 'D' },
  eletrica: { rotulo: 'Eletrica', cor: '#ffe066', icone: 'EL' },
  carroceria: { rotulo: 'Carroceria', cor: '#c9d1d9', icone: 'CA' },
  rodas: { rotulo: 'Rodas e pneus', cor: '#8b949e', icone: 'R' },
  interior: { rotulo: 'Interior', cor: '#d4a373', icone: 'IN' },
};

export const GRAVIDADES = {
  critico: { rotulo: 'Critico', cor: '#ff4d4d', peso: 4, descricao: 'Pode deixar voce na rua ou destruir o motor' },
  alto: { rotulo: 'Alto', cor: '#ff9f1c', peso: 3, descricao: 'Compromete seguranca ou custa caro' },
  medio: { rotulo: 'Medio', cor: '#ffd93d', peso: 2, descricao: 'Desgaste normal — entra na conta' },
  baixo: { rotulo: 'Baixo', cor: '#7ee081', peso: 1, descricao: 'Cosmetico ou barato' },
};

/** Aviso obrigatorio sobre os valores de custo exibidos no app. */
export const AVISO_CUSTOS =
  'Os valores em R$ sao estimativas de ordem de grandeza para orientar a negociacao, ' +
  'considerando peca de reposicao de linha intermediaria mais mao de obra em oficina ' +
  'independente. Nao sao orcamentos. Confirme o preco na sua cidade antes de usar o ' +
  'numero como argumento.';

/* --------------------------------------------------- indice por carro --- */

const indices = new Map();

function indice() {
  const v = veiculoAtivo();
  if (!indices.has(v.id)) {
    indices.set(v.id, new Map(v.pecas.map((p) => [p.id, p])));
  }
  return indices.get(v.id);
}

export function pecas() {
  return veiculoAtivo().pecas;
}

export function ficha() {
  return veiculoAtivo().ficha;
}

export function peca(id) {
  return indice().get(id) || null;
}

export function existe(id) {
  return indice().has(id);
}

/** Agrupa por sistema -> grupo -> pecas, respeitando a ordem de SISTEMAS. */
export function arvore() {
  const lista = pecas();
  const out = [];
  for (const [chave, meta] of Object.entries(SISTEMAS)) {
    const doSistema = lista.filter((p) => p.sistema === chave);
    if (!doSistema.length) continue;
    const grupos = new Map();
    for (const p of doSistema) {
      if (!grupos.has(p.grupo)) grupos.set(p.grupo, []);
      grupos.get(p.grupo).push(p);
    }
    out.push({
      chave, ...meta,
      total: doSistema.length,
      grupos: [...grupos.entries()].map(([nome, itens]) => ({ nome, pecas: itens })),
    });
  }
  return out;
}

// Remove acentos para que "direcao" ache "direção" e "valvula" ache "válvula".
const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalizar(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICOS, '')
    .trim();
}

/** Busca textual simples e tolerante (nome, termo tecnico, funcao, grupo). */
export function buscar(termo) {
  const t = normalizar(termo);
  if (!t) return [];
  return pecas().map((p) => {
    const alvo = normalizar(`${p.nome} ${p.tecnico} ${p.grupo} ${p.funcao}`);
    let pontos = 0;
    if (normalizar(p.nome).includes(t)) pontos += 10;
    if (normalizar(p.tecnico).includes(t)) pontos += 7;
    if (alvo.includes(t)) pontos += 3;
    for (const palavra of t.split(/\s+/)) {
      if (palavra.length > 2 && alvo.includes(palavra)) pontos += 1;
    }
    return { peca: p, pontos };
  })
    .filter((r) => r.pontos > 0)
    .sort((a, b) => b.pontos - a.pontos)
    .map((r) => r.peca);
}

/** Itens que entram no Modo Vistoria, ordenados por gravidade. */
export function itensVistoria() {
  return pecas().filter((p) => p.vistoria).sort(
    (a, b) => GRAVIDADES[b.gravidade].peso - GRAVIDADES[a.gravidade].peso,
  );
}

/** Etapas do Modo Vistoria do carro ativo, ja com os itens que sobraram. */
export function etapasVistoria() {
  const etapas = veiculoAtivo().etapas;
  const usados = new Set(etapas.flatMap((e) => e.itens));
  const sobras = itensVistoria().filter((p) => !usados.has(p.id)).map((p) => p.id);
  return sobras.length
    ? [...etapas, {
        titulo: `${etapas.length + 1}. Itens complementares`,
        descricao: 'Pontos adicionais que valem uma olhada rapida.',
        itens: sobras,
      }]
    : etapas;
}

/** Paradas do tour guiado do carro ativo. */
export function roteiroTour() {
  return veiculoAtivo().tour;
}

/** Soma o custo estimado de uma lista de ids marcados como problema. */
export function somarCustos(ids) {
  let min = 0, max = 0;
  const idx = indice();
  for (const id of ids) {
    const p = idx.get(id);
    if (!p || !p.custo) continue;
    min += p.custo[0];
    max += p.custo[1];
  }
  return { min, max };
}

export function estatisticas() {
  const v = veiculoAtivo();
  return {
    total: v.pecas.length,
    vistoria: v.pecas.filter((p) => p.vistoria).length,
    sintomas: v.sintomas.length,
  };
}
