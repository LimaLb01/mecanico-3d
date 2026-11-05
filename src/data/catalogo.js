/**
 * Catalogo de veiculos.
 *
 * O app inteiro consulta SEMPRE o veiculo ativo. Trocar de carro troca a ficha,
 * o banco de pecas, os sintomas, o roteiro de vistoria, o tour e a cena 3D —
 * nada e compartilhado entre os carros a nao ser a taxonomia (sistemas,
 * gravidades, categorias de sintoma) e a biblioteca de geometria.
 */

import { CIVIC_EK } from './civic-ek/index.js';
import { GOL_G2 } from './gol-g2/index.js';

export const VEICULOS = [CIVIC_EK, GOL_G2];

const CHAVE = 'mecanico3d-veiculo-ativo';

function inicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    const achado = VEICULOS.find((v) => v.id === salvo);
    if (achado) return achado;
  } catch { /* sem storage */ }
  return VEICULOS[0];
}

let ativo = inicial();
const ouvintes = new Set();

export function veiculoAtivo() {
  return ativo;
}

export function definirVeiculoAtivo(id) {
  const novo = VEICULOS.find((v) => v.id === id);
  if (!novo || novo === ativo) return ativo;
  ativo = novo;
  try { localStorage.setItem(CHAVE, id); } catch { /* sem storage */ }
  for (const fn of ouvintes) fn(ativo);
  return ativo;
}

/** Registra um callback chamado quando o veiculo ativo muda. */
export function aoTrocarVeiculo(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

/** Resumo de cada veiculo, para montar o seletor. */
export function listarVeiculos() {
  return VEICULOS.map((v) => ({
    id: v.id, nome: v.nome, ano: v.ano, sigla: v.sigla, resumo: v.resumo,
    ativo: v.id === ativo.id,
    pecas: v.pecas.length,
    sintomas: v.sintomas.length,
  }));
}
