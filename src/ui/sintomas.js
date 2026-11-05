/**
 * Aba "Ouvi um barulho" — consulta do sintoma para a peca.
 *
 * A ordem importa: o candidato mais provavel vem primeiro, e cada um traz o
 * teste que o CONFIRMA ou DESCARTA. E o que impede a lista de virar chute.
 */

import { sintomas, CATEGORIAS_SINTOMA, CHANCES } from '../data/sintomas.js';
import { peca, GRAVIDADES, normalizar } from '../data/parts.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export function montarSintomas(container, { aoFechar, aoVerPeca, sintomaInicial = null }) {
  let categoriaAtiva = null;
  let termo = '';
  // quando chega de um link vindo do painel da peca, ja abre aquele sintoma
  let expandido = sintomaInicial;

  function filtrados() {
    let lista = sintomas();
    if (categoriaAtiva) lista = lista.filter((s) => s.categoria === categoriaAtiva);
    if (termo.length >= 2) {
      const t = normalizar(termo);
      lista = lista.filter((s) => {
        const alvo = normalizar(`${s.sintoma} ${s.quando} ${s.candidatos.map((c) => peca(c.peca)?.nome ?? '').join(' ')}`);
        return alvo.includes(t) || t.split(/\s+/).some((p) => p.length > 2 && alvo.includes(p));
      });
    }
    return lista;
  }

  function render() {
    const lista = filtrados();

    container.innerHTML = `
      <div class="folha">
        <div class="folha-topo">
          <div>
            <h1>Ouvi um barulho — do sintoma para a peca</h1>
            <p>Aqui voce parte do que percebeu, nao do nome tecnico. Escolha o sintoma e
               veja as pecas candidatas em ordem de probabilidade — cada uma com o teste
               que confirma ou descarta ela. ${sintomas().length} sintomas catalogados
               para este carro.</p>
          </div>
          <button class="botao-fechar" data-fechar>&times;</button>
        </div>

        <div class="folha-corpo">
          <div class="sintoma-filtros">
            <input id="busca-sintoma" type="search" placeholder="Descreva o que voce percebeu (ex: toc-toc, treme, fumaca)" value="${esc(termo)}" />
            <div class="chips">
              <button class="chip ${!categoriaAtiva ? 'ativo' : ''}" data-cat="">Todos</button>
              ${Object.entries(CATEGORIAS_SINTOMA).map(([k, m]) => `
                <button class="chip ${categoriaAtiva === k ? 'ativo' : ''}" data-cat="${k}"
                        style="${categoriaAtiva === k ? `border-color:${m.cor};color:${m.cor}` : ''}">
                  ${esc(m.rotulo)}
                </button>`).join('')}
            </div>
          </div>

          ${lista.length ? lista.map(cartaoSintoma).join('')
            : '<p style="color:var(--texto-fraquissimo);padding:30px 0;text-align:center">Nenhum sintoma corresponde a essa descricao. Tente uma palavra mais simples, como "barulho", "treme" ou "fumaca".</p>'}
        </div>
      </div>`;

    ligar();
  }

  function cartaoSintoma(s) {
    const cat = CATEGORIAS_SINTOMA[s.categoria];
    const grav = GRAVIDADES[s.gravidade];
    const aberto = expandido === s.id;

    return `
      <div class="cartao-sintoma ${aberto ? 'aberto' : ''}" data-sintoma="${esc(s.id)}">
        <div class="sintoma-cabecalho" data-alternar="${esc(s.id)}">
          <span class="sintoma-cor" style="background:${cat.cor}"></span>
          <div class="sintoma-texto">
            <h3>${esc(s.sintoma)}</h3>
            <p>${esc(s.quando)}</p>
          </div>
          <span class="etiqueta-grav" style="color:${grav.cor};border-color:${grav.cor}">${esc(grav.rotulo)}</span>
          <span class="sintoma-seta">&#9654;</span>
        </div>

        ${aberto ? `
          <div class="sintoma-corpo">
            ${s.candidatos.map((c) => {
              const p = peca(c.peca);
              if (!p) return '';
              const ch = CHANCES[c.chance];
              return `
                <div class="candidato">
                  <div class="candidato-topo">
                    <strong>${esc(p.nome)}</strong>
                    <span class="chance" style="color:${ch.cor};border-color:${ch.cor}">${esc(ch.rotulo)}</span>
                    <button class="botao-ver" data-ver="${esc(p.id)}">Ver no 3D</button>
                  </div>
                  <p class="candidato-separar">${esc(c.separar)}</p>
                  <p class="candidato-custo">Custo estimado se for isso: ${esc(faixa(p.custo))}</p>
                </div>`;
            }).join('')}
          </div>` : ''}
      </div>`;
  }

  function faixa(custo) {
    if (!custo || (!custo[0] && !custo[1])) return 'sem custo direto de peca';
    const m = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    return custo[0] === custo[1] ? m(custo[0]) : `${m(custo[0])} a ${m(custo[1])}`;
  }

  function ligar() {
    container.querySelector('[data-fechar]')?.addEventListener('click', aoFechar);

    for (const b of container.querySelectorAll('[data-alternar]')) {
      b.addEventListener('click', () => {
        const id = b.dataset.alternar;
        expandido = expandido === id ? null : id;
        const topo = container.parentElement.scrollTop;
        render();
        container.parentElement.scrollTop = topo;
      });
    }

    for (const b of container.querySelectorAll('[data-cat]')) {
      b.addEventListener('click', () => {
        categoriaAtiva = b.dataset.cat || null;
        expandido = null;
        render();
        container.parentElement.scrollTop = 0;
      });
    }

    for (const b of container.querySelectorAll('[data-ver]')) {
      b.addEventListener('click', () => aoVerPeca(b.dataset.ver));
    }

    const busca = container.querySelector('#busca-sintoma');
    if (busca) {
      busca.addEventListener('input', () => {
        termo = busca.value;
        const pos = busca.selectionStart;
        render();
        const novo = container.querySelector('#busca-sintoma');
        novo.focus();
        novo.setSelectionRange(pos, pos);
      });
    }
  }

  render();

  if (sintomaInicial) {
    container.querySelector(`[data-sintoma="${sintomaInicial}"]`)
      ?.scrollIntoView({ block: 'center' });
  }
}
