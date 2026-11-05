/**
 * Ficha de campo — a folha que voce leva para o patio.
 *
 * O app roda no PC; a vistoria acontece na rua. Esta tela existe para fechar
 * essa distancia: e um documento imprimivel (ou salvavel em PDF pelo proprio
 * navegador) com os testes na ordem, quadradinhos para marcar a caneta e
 * espaco para anotar.
 *
 * O CSS de impressao vive em styles.css, sob @media print.
 */

import { peca, ficha, etapasVistoria } from '../data/parts.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const LEVAR = [
  'Scanner OBD-II (ELM327) — o carro e 1998, ja le codigo de falha',
  'Lanterna forte',
  'Ima pequeno embrulhado em pano — acha massa plastica escondendo ferrugem ou batida',
  'Fita metrica — mede a altura dos 4 cantos e compara os lados',
  'Pano ou papel toalha — para a vareta de oleo',
  'Uma pessoa para ajudar — luz de freio e re so se testa com alguem olhando',
  'Esta folha e uma caneta',
];

const REGRAS = [
  'Chegue com o carro FRIO e peca para NAO ligarem antes de voce. Metade dos defeitos some depois de quente.',
  'De a partida voce mesmo, com a chave, olhando o painel.',
  'Faca o test drive com o radio DESLIGADO e o vidro aberto.',
  'Nao fale de preco antes de terminar a folha inteira.',
];

export function montarFichaCampo(container, { aoFechar }) {
  const V = ficha();
  const etapas = etapasVistoria()
    .map((e) => ({ ...e, pecas: e.itens.map(peca).filter(Boolean) }))
    .filter((e) => e.pecas.length);

  const total = etapas.reduce((n, e) => n + e.pecas.length, 0);

  container.innerHTML = `
    <div class="folha" id="folha-campo">
      <div class="folha-topo nao-imprimir">
        <div>
          <h1>Ficha de campo</h1>
          <p>${total} testes na ordem da vistoria, para imprimir ou salvar em PDF e levar
             no bolso. Use "Imprimir" e escolha <strong>Salvar como PDF</strong> se preferir
             no celular.</p>
        </div>
        <button class="botao-fechar" data-fechar>&times;</button>
      </div>

      <div class="folha-corpo campo-corpo">

        <header class="campo-cabecalho">
          <div>
            <h2>Vistoria — ${esc(V.nome)} ${V.ano}</h2>
            <p class="campo-sub">${esc(V.geracao)} &middot; motor ${esc(V.motor.codigo)}
               &middot; ${esc(V.transmissao.tipo)}</p>
          </div>
          <div class="campo-identificacao">
            <div><span>Data</span><i></i></div>
            <div><span>Placa</span><i></i></div>
            <div><span>KM</span><i></i></div>
            <div><span>Preco pedido</span><i></i></div>
          </div>
        </header>

        <section class="campo-bloco-duplo">
          <div class="campo-caixa">
            <h3>Levar na mochila</h3>
            <ul class="campo-lista-check">
              ${LEVAR.map((t) => `<li><b></b>${esc(t)}</li>`).join('')}
            </ul>
          </div>
          <div class="campo-caixa campo-caixa-alerta">
            <h3>Quatro regras que mudam o resultado</h3>
            <ol class="campo-regras">
              ${REGRAS.map((t) => `<li>${esc(t)}</li>`).join('')}
            </ol>
          </div>
        </section>

        ${etapas.map(secaoEtapa).join('')}

        <section class="campo-caixa campo-anotacoes">
          <h3>Anotacoes livres</h3>
          <div class="campo-pautas">${'<i></i>'.repeat(8)}</div>
        </section>

        <footer class="campo-rodape">
          Valores de reparo consultados no programa sao estimativas de ordem de grandeza,
          nao orcamentos. Antes de fechar negocio, pague uma vistoria cautelar
          (R$ 150 a R$ 300) e confira debitos, restricao e historico de sinistro.
        </footer>
      </div>

      <div class="barra-vistoria nao-imprimir">
        <span class="crescer" style="font-size:12px;color:var(--texto-fraquissimo)">
          Dica: nas opcoes de impressao, ative "Graficos de plano de fundo" para os quadradinhos sairem visiveis.
        </span>
        <button class="botao-secundario" data-fechar-2>Voltar</button>
        <button class="botao-primario" data-imprimir>Imprimir / Salvar PDF</button>
      </div>
    </div>`;

  const fechar = () => aoFechar();
  container.querySelector('[data-fechar]').addEventListener('click', fechar);
  container.querySelector('[data-fechar-2]').addEventListener('click', fechar);
  container.querySelector('[data-imprimir]').addEventListener('click', () => window.print());
}

function secaoEtapa(etapa) {
  return `
    <section class="campo-etapa">
      <h3>${esc(etapa.titulo)}</h3>
      <p class="campo-etapa-nota">${esc(etapa.descricao)}</p>
      <table class="campo-tabela">
        <thead>
          <tr>
            <th class="col-item">Item e teste</th>
            <th class="col-marca">OK</th>
            <th class="col-marca">Ruim</th>
            <th class="col-nota">Anotacao</th>
          </tr>
        </thead>
        <tbody>
          ${etapa.pecas.map(linhaItem).join('')}
        </tbody>
      </table>
    </section>`;
}

function linhaItem(p) {
  // dois primeiros passos: o teste em si e a leitura do resultado
  const passos = (p.inspecao || []).slice(0, 2).join(' ');
  return `
    <tr>
      <td class="col-item">
        <strong>${esc(p.nome)}</strong>
        <span>${esc(passos)}</span>
      </td>
      <td class="col-marca"><b></b></td>
      <td class="col-marca"><b></b></td>
      <td class="col-nota"></td>
    </tr>`;
}
