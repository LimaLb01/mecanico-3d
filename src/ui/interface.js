/** Arvore de sistemas, busca, painel de detalhe, ficha tecnica e ajuda. */

import {
  SISTEMAS, GRAVIDADES, arvore, buscar, peca, ficha, estatisticas, AVISO_CUSTOS,
} from '../data/parts.js';
import { sintomasDaPeca, CHANCES } from '../data/sintomas.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const moeda = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export function faixaCusto(custo) {
  if (!custo || (!custo[0] && !custo[1])) return 'sem custo direto';
  if (custo[0] === custo[1]) return moeda(custo[0]);
  return `${moeda(custo[0])} a ${moeda(custo[1])}`;
}

/* ========================================================== arvore === */

export function montarArvore(container, aoEscolher) {
  container.innerHTML = '';
  for (const sis of arvore()) {
    const cab = document.createElement('div');
    cab.className = 'sistema-cabecalho';
    cab.innerHTML = `
      <span class="sistema-cor" style="background:${sis.cor}"></span>
      <span class="sistema-nome">${esc(sis.rotulo)}</span>
      <span class="sistema-contagem">${sis.total}</span>
      <span class="sistema-seta">&#9654;</span>`;

    const corpo = document.createElement('div');
    corpo.className = 'sistema-corpo';

    for (const grp of sis.grupos) {
      const gn = document.createElement('div');
      gn.className = 'grupo-nome';
      gn.textContent = grp.nome;
      corpo.appendChild(gn);
      for (const p of grp.pecas) corpo.appendChild(linhaPeca(p, aoEscolher));
    }

    cab.addEventListener('click', () => cab.classList.toggle('aberto'));
    container.append(cab, corpo);
  }
}

function linhaPeca(p, aoEscolher) {
  const el = document.createElement('div');
  el.className = 'item-peca';
  el.dataset.peca = p.id;
  el.innerHTML = `
    <span class="ponto-gravidade" style="background:${GRAVIDADES[p.gravidade].cor}"></span>
    <span class="item-peca-nome">${esc(p.nome)}</span>
    ${p.vistoria ? '<span class="marca-vistoria">VIST</span>' : ''}`;
  el.addEventListener('click', () => aoEscolher(p.id));
  return el;
}

export function marcarAtivo(id) {
  for (const el of document.querySelectorAll('.item-peca')) {
    el.classList.toggle('ativo', el.dataset.peca === id);
  }
  const ativo = document.querySelector('.item-peca.ativo');
  if (ativo) {
    const corpo = ativo.closest('.sistema-corpo');
    const cab = corpo?.previousElementSibling;
    if (cab && !cab.classList.contains('aberto')) cab.classList.add('aberto');
    ativo.scrollIntoView({ block: 'nearest' });
  }
}

/* =========================================================== busca === */

export function montarBusca(input, painelResultado, aoEscolher) {
  input.addEventListener('input', () => {
    const termo = input.value.trim();
    if (termo.length < 2) {
      painelResultado.classList.add('oculto');
      painelResultado.innerHTML = '';
      return;
    }
    const achados = buscar(termo).slice(0, 20);
    painelResultado.classList.remove('oculto');
    if (!achados.length) {
      painelResultado.innerHTML = '<div class="grupo-nome">Nenhuma peca encontrada</div>';
      return;
    }
    painelResultado.innerHTML = `<div class="grupo-nome">${achados.length} resultado(s)</div>`;
    for (const p of achados) painelResultado.appendChild(linhaPeca(p, aoEscolher));
  });

  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    input.value = '';
    painelResultado.classList.add('oculto');
    input.blur();
  });
}

/* ========================================================= detalhe === */

export function renderDetalhe(container, id, { aoEnquadrar, aoIsolar, aoVerSintomas } = {}) {
  const p = peca(id);
  if (!p) return false;

  const sis = SISTEMAS[p.sistema] || { rotulo: p.sistema, cor: '#888' };
  const grav = GRAVIDADES[p.gravidade];
  const larguraBarra = (grav.peso / 4) * 100;

  const secao = (titulo, corpo, classe = '') =>
    corpo ? `<div class="bloco ${classe}"><div class="bloco-titulo">${titulo}</div>${corpo}</div>` : '';

  const passos = (itens) =>
    `<ol class="lista-passos">${itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;

  const marcadores = (itens) =>
    `<ul class="lista-marcadores">${itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

  const specs = (linhas) =>
    `<table class="tabela-specs">${linhas.map(([k, v]) =>
      `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>`;

  container.innerHTML = `
    <div class="peca-cabecalho">
      <div class="peca-sistema"><i style="background:${sis.cor}"></i>${esc(sis.rotulo)} &middot; ${esc(p.grupo)}</div>
      <h2 class="peca-nome">${esc(p.nome)}</h2>
      <p class="peca-tecnico">${esc(p.tecnico)}</p>
      <div class="peca-etiquetas">
        ${p.vistoria ? '<span class="etiqueta etiqueta-vistoria">Entra no Modo Vistoria</span>' : ''}
        <span class="etiqueta etiqueta-custo">Troca: ${esc(faixaCusto(p.custo))}</span>
      </div>
    </div>

    <div class="faixa-gravidade">
      <span class="gravidade-rotulo" style="color:${grav.cor}">${esc(grav.rotulo)}</span>
      <span class="gravidade-barra"><span style="width:${larguraBarra}%;background:${grav.cor}"></span></span>
      <span style="font-size:11px;color:var(--texto-fraquissimo)">${esc(grav.descricao)}</span>
    </div>

    <div class="acoes-peca">
      <button data-acao="enquadrar">Enquadrar no 3D</button>
      <button data-acao="isolar">Isolar (raio-x)</button>
    </div>

    ${secao('Para que serve', `<p>${esc(p.funcao)}</p>`, 'bloco-destaque')}
    ${secao('Onde fica no carro', `<p>${esc(p.ondeFica)}</p>`)}
    ${secao('Como inspecionar', passos(p.inspecao || []), 'bloco-inspecao')}
    ${secao('Sinais de desgaste', marcadores(p.desgaste || []), 'bloco-desgaste')}
    ${p.specs?.length ? secao('Especificacoes', specs(p.specs)) : ''}
    ${secao('Como usar na negociacao', `<p>${esc(p.negociacao)}</p>`, 'bloco-negociacao')}
    ${blocoSintomas(p.id)}

    <div class="aviso-custo">${esc(AVISO_CUSTOS)}</div>
  `;

  container.querySelector('[data-acao="enquadrar"]')?.addEventListener('click', () => aoEnquadrar?.(id));
  container.querySelector('[data-acao="isolar"]')?.addEventListener('click', () => aoIsolar?.(id));
  for (const b of container.querySelectorAll('[data-sintoma]')) {
    b.addEventListener('click', () => aoVerSintomas?.(b.dataset.sintoma));
  }
  container.scrollTop = 0;
  return true;
}

/**
 * Liga a peca aos sintomas em que ela e suspeita. E o caminho inverso do
 * indice de sintomas, e serve para o usuario perceber que uma peca so pode
 * explicar varios barulhos diferentes.
 */
function blocoSintomas(pecaId) {
  const lista = sintomasDaPeca(pecaId);
  if (!lista.length) return '';

  const linhas = lista.map((s) => {
    const c = s.candidatos.find((x) => x.peca === pecaId);
    const ch = CHANCES[c.chance];
    return `
      <button class="link-sintoma" data-sintoma="${esc(s.id)}">
        <span class="link-sintoma-texto">${esc(s.sintoma)}</span>
        <span class="chance" style="color:${ch.cor};border-color:${ch.cor}">${esc(ch.rotulo)}</span>
      </button>`;
  }).join('');

  return `
    <div class="bloco bloco-sintomas">
      <div class="bloco-titulo">Sintomas que esta peca pode causar</div>
      ${linhas}
    </div>`;
}

/* ==================================================== ficha tecnica === */

export function montarFicha(container, aoFechar) {
  const V = ficha();

  const tab = (obj, mapa) => `<table class="tabela-specs">${
    mapa.map(([rotulo, chave]) => obj[chave] === undefined ? '' :
      `<tr><td>${esc(rotulo)}</td><td>${esc(obj[chave])}</td></tr>`).join('')
  }</table>`;

  const listaTab = (linhas) => `<table class="tabela-specs">${
    linhas.map((l) => `<tr><td>${esc(l[0])}</td><td>${esc(l.slice(1).join(' — '))}</td></tr>`).join('')
  }</table>`;

  container.innerHTML = `
    <div class="folha">
      <div class="folha-topo">
        <div>
          <h1>Ficha tecnica — ${esc(V.nome)} ${V.ano}</h1>
          <p>${esc(V.geracao)} &middot; chassi ${esc(V.codigoChassi)} &middot; ${esc(V.carroceria)} &middot; ${esc(V.montagem)}</p>
        </div>
        <button class="botao-fechar" data-fechar>&times;</button>
      </div>
      <div class="folha-corpo">
        <div class="grade-ficha">

          <div class="cartao">
            <h3>Identificacao — confirme antes de negociar</h3>
            ${listaTab(V.identificacao.itens)}
          </div>

          <div class="cartao">
            <h3>Motor</h3>
            ${tab(V.motor, [
              ['Codigo', 'codigo'], ['Familia', 'familia'], ['Configuracao', 'descricao'],
              ['Cilindrada', 'cilindrada'], ['Diametro x curso', 'diametroCurso'],
              ['Taxa de compressao', 'taxaCompressao'], ['Potencia', 'potencia'], ['Torque', 'torque'],
              ['Bloco', 'bloco'], ['Cabecote', 'cabecote'], ['Alimentacao', 'alimentacao'],
              ['Gerenciamento', 'gerenciamento'], ['Ordem de ignicao', 'ordemIgnicao'],
              ['Distribuicao', 'distribuicao'], ['Folga de valvulas', 'folgaValvulas'],
              ['Combustivel', 'combustivel'],
            ])}
            <div class="nota-tecnica">
              <strong>Detalhe que vale dinheiro:</strong> ${esc(V.motor.interferente)}.
              Isso reduz o risco de comprar um carro com a correia vencida — mas nao elimina
              a necessidade de trocar. Use como contrapeso se o vendedor tentar minimizar o assunto.
            </div>
          </div>

          <div class="cartao">
            <h3>Transmissao</h3>
            ${tab(V.transmissao, [
              ['Tipo', 'tipo'], ['Tracao', 'tracao'], ['Embreagem', 'embreagem'],
              ['Fluido', 'fluido'], ['Intervalo do fluido', 'intervaloFluido'],
            ])}
          </div>

          <div class="cartao">
            <h3>Suspensao</h3>
            ${tab(V.suspensao, [['Dianteira', 'dianteira'], ['Traseira', 'traseira']])}
            <div class="nota-tecnica">${esc(V.suspensao.observacao)}</div>
          </div>

          <div class="cartao">
            <h3>Freios</h3>
            ${tab(V.freios, [
              ['Dianteira', 'dianteira'], ['Traseira', 'traseira'],
              ['ABS', 'abs'], ['Fluido', 'fluido'],
            ])}
            <div class="nota-tecnica">${esc(V.freios.observacao)}</div>
          </div>

          <div class="cartao">
            <h3>Direcao, rodas e pneus</h3>
            ${tab(V.direcao, [['Tipo', 'tipo'], ['Fluido', 'fluido']])}
            ${tab(V.rodasPneus, [
              ['Pneu', 'pneu'], ['Roda', 'roda'],
              ['Diametro externo', 'diametroExterno'], ['Torque da roda', 'torqueRoda'],
            ])}
          </div>

          <div class="cartao">
            <h3>Dimensoes e pesos</h3>
            ${tab(V.dimensoes, [
              ['Comprimento', 'comprimento'], ['Largura', 'largura'], ['Altura', 'altura'],
              ['Entre-eixos', 'entreEixos'], ['Bitola dianteira', 'bitolaDianteira'],
              ['Bitola traseira', 'bitolaTraseira'], ['Peso em ordem de marcha', 'pesoOrdemMarcha'],
              ['Tanque', 'tanque'], ['Porta-malas', 'portaMalas'],
            ])}
          </div>

          <div class="cartao">
            <h3>Capacidades e fluidos</h3>
            ${listaTab(V.capacidades)}
          </div>

          <div class="cartao">
            <h3>Torques de aperto</h3>
            ${listaTab(V.torques)}
          </div>

          <div class="cartao">
            <h3>Plano de manutencao</h3>
            ${listaTab(V.manutencao.map(([item, intervalo, grav]) =>
              [item, `${intervalo} (${GRAVIDADES[grav]?.rotulo ?? grav})`]))}
          </div>

          ${V.precisao ? `
          <div class="cartao cartao-largo">
            <h3>De onde vem cada medida</h3>
            <p class="precisao-intro">
              O modelo 3D nao e um CAD de fabrica. Esta tabela existe para voce saber
              em que confiar: as cotas abaixo tem origens diferentes.
            </p>
            <div class="precisao-grade">
              <div class="precisao-bloco precisao-ok">
                <h4>Especificacao publicada</h4>
                <ul>${V.precisao.verificado.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
              </div>
              ${V.precisao.derivado?.length ? `
              <div class="precisao-bloco precisao-calc">
                <h4>Derivado por calculo</h4>
                <ul>${V.precisao.derivado.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
              </div>` : ''}
              <div class="precisao-bloco precisao-aprox">
                <h4>Aproximado</h4>
                <ul>${V.precisao.estimado.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
              </div>
            </div>
          </div>` : ''}

        </div>
      </div>
    </div>`;

  container.querySelector('[data-fechar]').addEventListener('click', aoFechar);
}

/* =========================================================== ajuda === */

export function montarAjuda(container, aoFechar) {
  const passos = [
    ['Gire, aproxime, clique', 'Arraste com o botao esquerdo para orbitar, use a roda do mouse para aproximar e clique em qualquer peca para abrir o guia dela. Duplo clique enquadra a peca na tela.'],
    ['Use os atalhos de vista', 'Os botoes no canto superior direito levam a camera direto para o vao do motor, a suspensao dianteira, a traseira ou embaixo do carro.'],
    ['Ligue o raio-x para achar o que esta escondido', 'O botao "Isolar peca" deixa o resto do carro transparente. E assim que voce enxerga pistoes, virabrequim, embreagem e engrenagens do cambio.'],
    ['Abra o carro na vista explodida', 'O controle deslizante na barra inferior afasta as pecas umas das outras. Otimo para entender como o conjunto se monta e o que fica atras do que.'],
    ['Estude pelo Modo Vistoria', 'A aba "Modo Vistoria" transforma o banco de pecas num roteiro na ordem certa: o que checar com o carro frio, ao girar a chave, com o motor ligado, no test drive e por baixo.'],
    ['Leve o relatorio na hora de ver o carro', 'Marque cada item como OK ou Problema. No fim, o programa gera um relatorio com o total estimado de reparos e os argumentos de negociacao para voce copiar ou baixar.'],
  ];

  container.innerHTML = `
    <div class="folha" style="max-width:760px">
      <div class="folha-topo">
        <div>
          <h1>Como usar este programa</h1>
          <p>Ele foi montado com um objetivo especifico: te deixar preparado para ver um
             Civic 1998 pessoalmente, saber o nome de cada peca e reconhecer desgaste.</p>
        </div>
        <button class="botao-fechar" data-fechar>&times;</button>
      </div>
      <div class="folha-corpo">
        <div class="ajuda-lista">
          ${passos.map(([t, d], i) => `
            <div class="ajuda-item">
              <div class="ajuda-num">${i + 1}</div>
              <div><h4>${esc(t)}</h4><p>${esc(d)}</p></div>
            </div>`).join('')}
        </div>
        <div class="nota-tecnica" style="margin-top:22px">
          <strong>Leve tambem:</strong> um scanner OBD-II simples (o carro e 1998, ja tem OBD-II),
          uma lanterna, um ima pequeno embrulhado em pano (para achar massa plastica),
          uma fita metrica e um pano para checar a vareta de oleo. Custa pouco e muda completamente
          a sua posicao na negociacao.
        </div>
      </div>
    </div>`;

  container.querySelector('[data-fechar]').addEventListener('click', aoFechar);
}

export function totalPecas() {
  return estatisticas();
}
