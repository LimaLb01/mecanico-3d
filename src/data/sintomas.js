/**
 * Camada de consulta ao indice reverso (sintoma -> peca) do VEICULO ATIVO.
 *
 * As categorias e os niveis de probabilidade sao taxonomia compartilhada; a
 * lista de sintomas em si vem do pacote de cada carro.
 */

import { veiculoAtivo } from './catalogo.js';

export const CATEGORIAS_SINTOMA = {
  ruido: { rotulo: 'Barulho', cor: '#ff8a3d' },
  vibracao: { rotulo: 'Vibracao e trepidacao', cor: '#b48aff' },
  motor: { rotulo: 'Comportamento do motor', cor: '#7ee081' },
  fluido: { rotulo: 'Fumaca, oleo e agua', cor: '#3ec5ff' },
  temperatura: { rotulo: 'Temperatura', cor: '#ff5f5f' },
  freio: { rotulo: 'Freio e direcao', cor: '#ffd93d' },
  cambio: { rotulo: 'Cambio e embreagem', cor: '#4dd6c1' },
  eletrica: { rotulo: 'Eletrica', cor: '#ffe066' },
};

export const CHANCES = {
  alta: { rotulo: 'Causa mais provavel', peso: 3, cor: '#ff9f1c' },
  media: { rotulo: 'Possivel', peso: 2, cor: '#ffd93d' },
  baixa: { rotulo: 'Menos provavel', peso: 1, cor: '#8b949e' },
};

export function sintomas() {
  return veiculoAtivo().sintomas;
}

/** Sintomas de uma categoria. */
export function sintomasPorCategoria(categoria) {
  return sintomas().filter((s) => s.categoria === categoria);
}

/** Sintomas em que uma peca aparece como candidata (usado no painel da peca). */
export function sintomasDaPeca(pecaId) {
  return sintomas().filter((s) => s.candidatos.some((c) => c.peca === pecaId));
}

export function totalSintomas() {
  return sintomas().length;
}
