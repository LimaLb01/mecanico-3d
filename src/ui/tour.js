/**
 * Tour guiado — para quem abre o programa sem saber por onde clicar.
 *
 * O roteiro NAO e por gravidade: e a ordem em que voce vai encontrar as coisas
 * numa vistoria de verdade. Cada carro do catalogo traz o seu proprio roteiro,
 * porque o que importa olhar primeiro num Civic 1998 nao e o mesmo de um Gol.
 *
 * A "nota" de cada parada e o motivo de ela estar no tour — o resto do conteudo
 * ja aparece no painel de detalhe, que abre junto.
 */

import { roteiroTour } from '../data/parts.js';

export function criarTour({ viewer, aoSelecionar, aoSair }) {
  const painel = document.querySelector('#tour');
  const elPasso = document.querySelector('#tour-passo');
  const elTitulo = document.querySelector('#tour-titulo');
  const elTexto = document.querySelector('#tour-texto');
  const btAnterior = document.querySelector('#tour-anterior');
  const btProximo = document.querySelector('#tour-proximo');
  const btSair = document.querySelector('#tour-sair');

  let roteiro = [];
  let indice = -1;
  let ativo = false;

  function mostrar(i) {
    indice = Math.max(0, Math.min(roteiro.length - 1, i));
    const parada = roteiro[indice];

    aoSelecionar(parada.peca);
    viewer.enquadrarPeca(parada.peca, 2.6);

    elPasso.textContent = `Parada ${indice + 1} de ${roteiro.length}`;
    elTitulo.textContent = viewer.nomeDaPeca(parada.peca) ?? parada.peca;
    elTexto.textContent = parada.nota;

    btAnterior.disabled = indice === 0;
    btProximo.textContent = indice === roteiro.length - 1 ? 'Concluir tour' : 'Proxima peca';
  }

  function iniciar() {
    roteiro = roteiroTour();          // roteiro do carro ATIVO
    if (!roteiro.length) return;
    ativo = true;
    painel.classList.remove('oculto');
    // o raio-x deixa a peca da vez visivel mesmo quando ela esta enterrada
    const tgFantasma = document.querySelector('#tg-fantasma');
    if (tgFantasma && !tgFantasma.checked) {
      tgFantasma.checked = true;
      viewer.definirFantasma(true);
    }
    mostrar(0);
  }

  function sair() {
    if (!ativo) return;
    ativo = false;
    painel.classList.add('oculto');
    aoSair?.();
  }

  btProximo.addEventListener('click', () => {
    if (indice === roteiro.length - 1) sair();
    else mostrar(indice + 1);
  });
  btAnterior.addEventListener('click', () => mostrar(indice - 1));
  btSair.addEventListener('click', sair);

  addEventListener('keydown', (e) => {
    if (!ativo) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); if (indice < roteiro.length - 1) mostrar(indice + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); if (indice > 0) mostrar(indice - 1); }
  });

  return { iniciar, sair, get ativo() { return ativo; } };
}
