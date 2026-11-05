/**
 * Modo Vistoria — transforma o banco de pecas num roteiro na ordem em que a
 * inspecao acontece de verdade no patio: carro frio, chave, motor ligado,
 * test drive, por baixo, cabine e documentos.
 *
 * O resultado marcado vira um relatorio com custo estimado e os argumentos de
 * negociacao ja escritos.
 */

import {
  peca, somarCustos, GRAVIDADES, etapasVistoria, ficha, AVISO_CUSTOS,
} from '../data/parts.js';
import { veiculoAtivo } from '../data/catalogo.js';
import { faixaCusto } from './interface.js';

// A marcacao e por carro: o que voce anotou no Civic nao pode vazar para o Gol.
const chaveArmazenamento = () => `mecanico3d-vistoria-${veiculoAtivo().id}`;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/* --------------------------------------------------------- estado --- */

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(chaveArmazenamento())) || {};
  } catch { return {}; }
}

function salvar(estado) {
  try { localStorage.setItem(chaveArmazenamento(), JSON.stringify(estado)); } catch { /* sem storage */ }
}

/* --------------------------------------------------------- render --- */

export function montarVistoria(container, { aoFechar, aoVerPeca, aoAbrirFichaCampo }) {
  let estado = carregar();
  const etapas = etapasVistoria();
  const V = ficha();

  function render() {
    const marcados = Object.entries(estado);
    const problemas = marcados.filter(([, v]) => v === 'problema').map(([k]) => k);
    const oks = marcados.filter(([, v]) => v === 'ok').length;
    const totalItens = etapas.reduce((n, e) => n + e.itens.filter((i) => peca(i)).length, 0);
    const custo = somarCustos(problemas);
    const criticos = problemas.filter((id) => peca(id)?.gravidade === 'critico').length;

    container.innerHTML = `
      <div class="folha">
        <div class="folha-topo">
          <div>
            <h1>Modo Vistoria — ${esc(V.nome)} ${V.ano}</h1>
            <p>Siga na ordem. Cada item traz o teste concreto a fazer. Marque
               <strong>OK</strong> ou <strong>Problema</strong> e no fim gere o relatorio de negociacao.
               Suas marcacoes ficam salvas neste computador.</p>
          </div>
          <button class="botao-fechar" data-fechar>&times;</button>
        </div>

        <div class="folha-corpo">
          <div class="vistoria-resumo">
            <div class="metrica">
              <div class="metrica-valor">${marcados.length}<span style="font-size:14px;color:var(--texto-fraquissimo)">/${totalItens}</span></div>
              <div class="metrica-rotulo">Itens verificados</div>
            </div>
            <div class="metrica">
              <div class="metrica-valor" style="color:var(--ok)">${oks}</div>
              <div class="metrica-rotulo">Sem problema</div>
            </div>
            <div class="metrica">
              <div class="metrica-valor" style="color:var(--critico)">${problemas.length}</div>
              <div class="metrica-rotulo">Com problema${criticos ? ` (${criticos} critico${criticos > 1 ? 's' : ''})` : ''}</div>
            </div>
            <div class="metrica">
              <div class="metrica-valor" style="color:var(--destaque);font-size:19px">${custo.min || custo.max ? `${fmt(custo.min)} — ${fmt(custo.max)}` : '—'}</div>
              <div class="metrica-rotulo">Reparo estimado (R$)</div>
            </div>
          </div>

          ${etapas.map(renderEtapa).join('')}

          <div class="nota-tecnica">${esc(AVISO_CUSTOS)}</div>
        </div>

        <div class="barra-vistoria">
          <span class="crescer" style="font-size:12px;color:var(--texto-fraquissimo)">
            ${marcados.length ? `${marcados.length} item(ns) marcado(s)` : 'Comece marcando os itens da etapa 1'}
          </span>
          <button class="botao-secundario" data-limpar>Limpar marcacoes</button>
          <button class="botao-secundario" data-campo>Ficha de campo (imprimir)</button>
          <button class="botao-primario" data-relatorio>Gerar relatorio de negociacao</button>
        </div>
      </div>`;

    ligarEventos();
  }

  function renderEtapa(etapa) {
    const itens = etapa.itens.map((id) => peca(id)).filter(Boolean);
    if (!itens.length) return '';
    return `
      <div class="vistoria-etapa">
        <h3>${esc(etapa.titulo)}</h3>
        <p>${esc(etapa.descricao)}</p>
        ${itens.map(renderItem).join('')}
      </div>`;
  }

  function renderItem(p) {
    const marca = estado[p.id];
    const classe = marca === 'ok' ? 'marcado-ok' : marca === 'problema' ? 'marcado-problema' : '';
    const grav = GRAVIDADES[p.gravidade];
    // o primeiro passo da inspecao e o teste mais acionavel — e o que aparece aqui
    const comoTestar = (p.inspecao && p.inspecao[0]) || p.funcao;
    return `
      <div class="item-vistoria ${classe}" data-item="${esc(p.id)}">
        <div class="item-vistoria-info">
          <h4>
            <span class="ponto-gravidade" style="display:inline-block;background:${grav.cor};margin-right:6px"></span>
            ${esc(p.nome)}
          </h4>
          <p class="como">${esc(comoTestar)}</p>
          <p class="custo">Se estiver ruim: ${esc(faixaCusto(p.custo))} &middot; gravidade ${esc(grav.rotulo.toLowerCase())}</p>
        </div>
        <div class="item-vistoria-acoes">
          <button class="ver" data-ver="${esc(p.id)}">Ver 3D</button>
          <button class="${marca === 'ok' ? 'sel-ok' : ''}" data-marca="ok" data-id="${esc(p.id)}">OK</button>
          <button class="${marca === 'problema' ? 'sel-problema' : ''}" data-marca="problema" data-id="${esc(p.id)}">Problema</button>
        </div>
      </div>`;
  }

  function ligarEventos() {
    container.querySelector('[data-fechar]')?.addEventListener('click', aoFechar);

    for (const b of container.querySelectorAll('[data-marca]')) {
      b.addEventListener('click', () => {
        const { id, marca } = b.dataset;
        estado[id] = estado[id] === marca ? undefined : marca;
        if (!estado[id]) delete estado[id];
        salvar(estado);
        const posicao = container.parentElement.scrollTop;
        render();
        container.parentElement.scrollTop = posicao;
      });
    }

    for (const b of container.querySelectorAll('[data-ver]')) {
      b.addEventListener('click', () => aoVerPeca(b.dataset.ver));
    }

    container.querySelector('[data-limpar]')?.addEventListener('click', () => {
      if (!confirm('Apagar todas as marcacoes da vistoria?')) return;
      estado = {};
      salvar(estado);
      render();
    });

    container.querySelector('[data-campo]')?.addEventListener('click', () => aoAbrirFichaCampo?.());

    container.querySelector('[data-relatorio]')?.addEventListener('click', () => {
      mostrarRelatorio(container, estado, () => render(), aoFechar);
    });
  }

  render();
}

/* ------------------------------------------------------ relatorio --- */

function fmt(v) {
  return v.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

function gerarTexto(estado) {
  const V = ficha();   // ficha do veiculo ativo no momento da geracao
  const problemas = Object.entries(estado).filter(([, v]) => v === 'problema').map(([k]) => peca(k)).filter(Boolean);
  const oks = Object.entries(estado).filter(([, v]) => v === 'ok').length;
  const custo = somarCustos(problemas.map((p) => p.id));

  const ordem = { critico: 0, alto: 1, medio: 2, baixo: 3 };
  problemas.sort((a, b) => ordem[a.gravidade] - ordem[b.gravidade]);

  const linhas = [];
  const barra = '='.repeat(64);

  linhas.push(barra);
  linhas.push(`RELATORIO DE VISTORIA — ${V.nome} ${V.ano}`);
  linhas.push(`${V.geracao} | chassi ${V.codigoChassi} | motor ${V.motor.codigo}`);
  linhas.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
  linhas.push(barra);
  linhas.push('');
  linhas.push(`Itens verificados sem problema: ${oks}`);
  linhas.push(`Itens com problema encontrado: ${problemas.length}`);
  linhas.push('');

  if (!problemas.length) {
    linhas.push('Nenhum problema marcado ate aqui.');
    linhas.push('');
    linhas.push('Antes de fechar, ainda assim: pague uma vistoria cautelar (R$ 150—300)');
    linhas.push('e exija a nota fiscal da ultima troca da correia dentada.');
    return linhas.join('\n');
  }

  linhas.push('-'.repeat(64));
  linhas.push('CUSTO ESTIMADO PARA DEIXAR O CARRO EM ORDEM');
  linhas.push('-'.repeat(64));
  linhas.push(`R$ ${fmt(custo.min)} a R$ ${fmt(custo.max)}`);
  linhas.push('');
  linhas.push('Estimativa de ordem de grandeza (peca de linha intermediaria + mao de');
  linhas.push('obra em oficina independente). Nao e orcamento: confirme na sua cidade.');
  linhas.push('');

  const porGravidade = {};
  for (const p of problemas) (porGravidade[p.gravidade] ??= []).push(p);

  for (const [grav, lista] of Object.entries(porGravidade)) {
    linhas.push('');
    linhas.push('-'.repeat(64));
    linhas.push(`${GRAVIDADES[grav].rotulo.toUpperCase()} — ${GRAVIDADES[grav].descricao}`);
    linhas.push('-'.repeat(64));
    for (const p of lista) {
      linhas.push('');
      linhas.push(`[ ] ${p.nome} (${p.tecnico})`);
      linhas.push(`    Custo estimado: ${faixaCusto(p.custo)}`);
      linhas.push(`    Argumento: ${quebrar(p.negociacao, 60, '    ')}`);
    }
  }

  linhas.push('');
  linhas.push(barra);
  linhas.push('COMO CONDUZIR A CONVERSA');
  linhas.push(barra);
  linhas.push('');
  linhas.push('1. Nao comece pelo preco. Comece perguntando o historico de manutencao');
  linhas.push('   e pedindo as notas fiscais, especialmente a da correia dentada.');
  linhas.push('');
  linhas.push('2. Apresente os itens em blocos, do mais grave para o menos grave, e');
  linhas.push('   mostre COMO voce chegou na conclusao (o teste que voce fez). Isso');
  linhas.push('   muda a conversa de opiniao para constatacao.');
  linhas.push('');
  linhas.push('3. Peca o abatimento do valor total dos reparos, nao um desconto solto.');
  linhas.push('   Um numero justificado item a item e muito mais dificil de recusar.');
  linhas.push('');
  linhas.push('4. Itens de seguranca (pivo, terminal, freio, cinto) nao sao desconto:');
  linhas.push('   exija que sejam resolvidos antes da entrega ou refaca a proposta.');
  linhas.push('');
  linhas.push('5. Antes de transferir qualquer valor, pague uma vistoria cautelar');
  linhas.push('   (R$ 150—300) e confira debitos, restricao e historico de sinistro.');

  if (problemas.some((p) => p.gravidade === 'critico')) {
    linhas.push('');
    linhas.push(barra);
    linhas.push('ATENCAO');
    linhas.push(barra);
    linhas.push('Ha item marcado como CRITICO nesta vistoria. Antes de negociar preco,');
    linhas.push('avalie se vale a pena seguir com este carro especifico. Em Civic dessa');
    linhas.push('idade existe oferta suficiente para escolher um exemplar melhor.');
  }

  return linhas.join('\n');
}

/** Quebra texto longo mantendo indentacao, para o relatorio em texto puro. */
function quebrar(texto, largura, indento) {
  const palavras = String(texto).split(/\s+/);
  const linhas = [];
  let atual = '';
  for (const p of palavras) {
    if ((atual + ' ' + p).trim().length > largura) {
      linhas.push(atual.trim());
      atual = p;
    } else {
      atual += ' ' + p;
    }
  }
  if (atual.trim()) linhas.push(atual.trim());
  return linhas.join(`\n${indento}`);
}

function mostrarRelatorio(container, estado, aoVoltar, aoFechar) {
  const texto = gerarTexto(estado);
  container.innerHTML = `
    <div class="folha">
      <div class="folha-topo">
        <div>
          <h1>Relatorio de negociacao</h1>
          <p>Copie ou baixe e leve no celular. Cada item traz o custo estimado e o argumento pronto.</p>
        </div>
        <button class="botao-fechar" data-fechar>&times;</button>
      </div>
      <div class="folha-corpo">
        <div class="relatorio">${esc(texto)}</div>
      </div>
      <div class="barra-vistoria">
        <span class="crescer"></span>
        <button class="botao-secundario" data-voltar>Voltar a lista</button>
        <button class="botao-secundario" data-copiar>Copiar texto</button>
        <button class="botao-primario" data-baixar>Baixar .txt</button>
      </div>
    </div>`;

  container.querySelector('[data-fechar]').addEventListener('click', aoFechar);
  container.querySelector('[data-voltar]').addEventListener('click', aoVoltar);

  container.querySelector('[data-copiar]').addEventListener('click', async (e) => {
    try {
      await navigator.clipboard.writeText(texto);
      e.target.textContent = 'Copiado!';
      setTimeout(() => { e.target.textContent = 'Copiar texto'; }, 1800);
    } catch {
      e.target.textContent = 'Falhou — selecione manualmente';
    }
  });

  container.querySelector('[data-baixar]').addEventListener('click', () => {
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vistoria-civic-ek-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
