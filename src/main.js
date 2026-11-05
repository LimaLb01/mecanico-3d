/**
 * Mecanico 3D — simulador de mecanica dedicado a carros usados especificos.
 *
 * Catalogo atual:
 *   - Honda Civic Sedan LX 1.6 16V 1998 (EK/EJ6, motor D16Y7, transversal)
 *   - Volkswagen Gol G2 Special 1.0 2001 (motor AT/EA111, LONGITUDINAL)
 *
 * Este arquivo so orquestra: monta o visualizador, pede ao veiculo ativo que
 * construa a cena e liga a interface. A geometria vive em src/modules, o
 * conhecimento sobre cada carro vive em src/data/<veiculo>.
 */

import { Viewer } from './core/viewer.js';
import {
  montarArvore, montarBusca, marcarAtivo, renderDetalhe,
  montarFicha, montarAjuda, totalPecas,
} from './ui/interface.js';
import { montarVistoria } from './ui/vistoria.js';
import { montarSintomas } from './ui/sintomas.js';
import { montarFichaCampo } from './ui/ficha-campo.js';
import { criarTour } from './ui/tour.js';
import { peca } from './data/parts.js';
import { veiculoAtivo, definirVeiculoAtivo, listarVeiculos } from './data/catalogo.js';
import { verificarMontagem, resumir } from './core/verificacao.js';
import { diagnosticarInteracao } from './core/diagnostico.js';
import { precarregarModelos } from './core/modelos.js';
import { MODELO_EK } from './modules/civic-ek/chassis.js';
import { MODELO_G2 } from './modules/gol-g2/chassis.js';

const $ = (sel) => document.querySelector(sel);

/* ==================================================== visualizador === */

const viewer = new Viewer($('#canvas3d'), $('#rotulos'));
viewer.motorLigado = false;
viewer.nomeDaPeca = (dbId) => peca(dbId)?.nome ?? null;

/** Raizes 3D do carro atualmente montado (trocadas a cada troca de veiculo). */
let raizes = {};
let pecaAtual = null;

const porNome = (raiz, nome) => raiz?.getObjectByName(nome);

/* ------------------------------------------------ montagem da cena --- */

function montarCena() {
  viewer.limparCena();
  raizes = veiculoAtivo().construir(viewer);
  viewer.enquadrarTudo();
  aplicarTodosOsToggles();
}

/* =========================================================== estado === */

function selecionarPeca(id, { enquadrar = false } = {}) {
  const dbId = id ? id.split('@')[0] : null;
  pecaAtual = dbId;

  viewer.selecionar(dbId, { enquadrar });

  if (dbId && peca(dbId)) {
    $('#detalhe-vazio').classList.add('oculto');
    $('#detalhe-conteudo').classList.remove('oculto');
    renderDetalhe($('#detalhe-conteudo'), dbId, {
      aoEnquadrar: (pid) => viewer.enquadrarPeca(pid),
      aoIsolar: (pid) => {
        $('#tg-fantasma').checked = true;
        viewer.definirFantasma(true);
        viewer.enquadrarPeca(pid);
      },
      aoVerSintomas: (sintomaId) => abrirSintomas(sintomaId),
    });
  } else {
    $('#detalhe-vazio').classList.remove('oculto');
    $('#detalhe-conteudo').classList.add('oculto');
  }
  marcarAtivo(dbId);
}

viewer.aoSelecionar = (dbId) => {
  if (dbId === pecaAtual) return;
  selecionarPeca(dbId);
};

viewer.aoPassarMouse = (id) => {
  const hud = $('#hud-hover');
  const p = id ? peca(id.split('@')[0]) : null;
  if (!p) { hud.classList.add('oculto'); return; }
  hud.classList.remove('oculto');
  hud.innerHTML = `${p.nome}<small>${p.tecnico}</small>`;
};

/* ================================================ seletor de carro === */

function montarSeletor() {
  const sel = $('#seletor-veiculo');
  sel.innerHTML = listarVeiculos()
    .map((v) => `<option value="${v.id}"${v.ativo ? ' selected' : ''}>${v.nome} · ${v.ano}</option>`)
    .join('');
  sel.addEventListener('change', () => trocarVeiculo(sel.value));
  atualizarCabecalho();
}

function atualizarCabecalho() {
  const v = veiculoAtivo();
  $('#marca-sigla').textContent = v.sigla;
  $('#marca-resumo').textContent = v.resumo;
  const { total, vistoria, sintomas } = totalPecas();
  $('#contador-pecas').textContent =
    `${total} peças · ${vistoria} na vistoria · ${sintomas} sintomas`;
}

function trocarVeiculo(id) {
  if (id === veiculoAtivo().id) return;

  tour.sair();
  fecharTelas();
  definirVeiculoAtivo(id);

  montarCena();
  montarArvore($('#arvore'), (pid) => selecionarPeca(pid, { enquadrar: true }));
  $('#busca').value = '';
  $('#resultado-busca').classList.add('oculto');
  $('#resultado-busca').innerHTML = '';
  selecionarPeca(null);
  atualizarCabecalho();
}

/* ============================================================== ui === */

montarSeletor();
/*
 * As malhas esculpidas precisam estar em memoria ANTES de montar: o viewer
 * indexa as malhas de cada peca na hora do registro, entao trocar geometria
 * depois deixaria o indice apontando para malha removida. `precarregarModelos`
 * nunca rejeita — se o GLB faltar, a cena e desenhada por codigo.
 */
await precarregarModelos([MODELO_EK, MODELO_G2]);
montarCena();
montarArvore($('#arvore'), (id) => selecionarPeca(id, { enquadrar: true }));
montarBusca($('#busca'), $('#resultado-busca'), (id) => selecionarPeca(id, { enquadrar: true }));

for (const b of document.querySelectorAll('.atalho[data-peca]')) {
  b.addEventListener('click', () => selecionarPeca(b.dataset.peca, { enquadrar: true }));
}

/* ------------------------------------------- paineis recolhiveis --- */

/*
 * Cada uma das quatro bordas recolhe e reabre. O estado fica no proprio #app
 * como atributo (a grade reage sozinha via CSS) e e guardado no navegador, para
 * o programa reabrir do jeito que voce deixou.
 */
const PAINEIS = ['topo', 'lateral', 'detalhe', 'ferramentas'];
const CHAVE_PAINEIS = 'mecanico3d-paineis';
const app = $('#app');

function lerPaineis() {
  try { return JSON.parse(localStorage.getItem(CHAVE_PAINEIS)) || {}; } catch { return {}; }
}

/*
 * Setas das abas. A mesma aba recolhe e expande, entao a seta aponta sempre
 * para onde o painel VAI: aberto, aponta para fora (recolher); recolhido,
 * aponta para dentro do palco (trazer de volta).
 *
 * Fica declarado ANTES de aplicarPaineis porque a primeira chamada acontece na
 * inicializacao — const em modulo tem zona morta temporal, e usar depois nao
 * adianta.
 */
const SETAS = {
  lateral:     { aberto: '◀', recolhido: '▶' },
  detalhe:     { aberto: '▶', recolhido: '◀' },
  topo:        { aberto: '▲', recolhido: '▼' },
  ferramentas: { aberto: '▼', recolhido: '▲' },
};

function atualizarSetas(estado) {
  for (const b of document.querySelectorAll('[data-painel]')) {
    const nome = b.dataset.painel;
    b.dataset.seta = SETAS[nome][estado[nome] ? 'recolhido' : 'aberto'];
  }
}

/* Tamanho corrente de cada borda, em pixel. E o que a grade recebe. */
const bordas = { lateral: 0, detalhe: 0, topo: 0, ferramentas: 0 };
let animacaoBordas = null;
let travaFinal = null;

function escreverGrade() {
  app.style.gridTemplateColumns = `${bordas.lateral}px 1fr ${bordas.detalhe}px`;
  app.style.gridTemplateRows = `${bordas.topo}px 1fr ${bordas.ferramentas}px`;
  // O Viewer ja observa o container, mas ResizeObserver nao e entregue em aba
  // em segundo plano. Chamar aqui torna o ajuste do canvas deterministico.
  viewer.redimensionar();
}

/** Tamanho que cada borda deve ter no estado dado, respeitando os pontos de quebra. */
function alvoDasBordas(estado) {
  const raiz = getComputedStyle(document.documentElement);
  const medida = (nome, padrao) => parseFloat(raiz.getPropertyValue(nome)) || padrao;
  return {
    lateral: estado.lateral ? 0 : medida('--lateral-w', 290),
    detalhe: estado.detalhe ? 0 : medida('--detalhe-w', 430),
    topo: estado.topo ? 0 : medida('--topo-h', 58),
    ferramentas: estado.ferramentas ? 0 : medida('--ferramentas-h', 56),
  };
}

/**
 * Aplica o estado dos paineis, animando em JS.
 *
 * A animacao e feita a mao porque `transition: grid-template-columns` congela a
 * propriedade neste navegador (ver nota em styles.css). E ha uma rede de
 * seguranca: requestAnimationFrame nao roda em aba em segundo plano, entao um
 * temporizador crava o valor final de qualquer jeito.
 */
function aplicarPaineis(estado, animar = true) {
  for (const p of PAINEIS) {
    if (estado[p]) app.setAttribute(`data-${p}`, 'recolhido');
    else app.removeAttribute(`data-${p}`);
  }
  try { localStorage.setItem(CHAVE_PAINEIS, JSON.stringify(estado)); } catch { /* sem storage */ }
  atualizarSetas(estado);

  const alvo = alvoDasBordas(estado);
  cancelAnimationFrame(animacaoBordas);
  clearTimeout(travaFinal);

  const cravar = () => { Object.assign(bordas, alvo); escreverGrade(); };
  if (!animar) return cravar();

  const inicio = { ...bordas };
  const t0 = performance.now();
  const duracao = 200;
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / duracao);
    const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;   // easeInOutCubic
    for (const k of PAINEIS) bordas[k] = inicio[k] + (alvo[k] - inicio[k]) * e;
    escreverGrade();
    if (t < 1) animacaoBordas = requestAnimationFrame(passo);
  };
  animacaoBordas = requestAnimationFrame(passo);
  travaFinal = setTimeout(cravar, duracao + 60);
}

// os pontos de quebra mudam a largura de referencia: reescreve sem animar
addEventListener('resize', () => aplicarPaineis(paineis, false));

let paineis = lerPaineis();
aplicarPaineis(paineis, false);   // estado inicial entra sem animacao

function alternarPainel(nome, valor) {
  paineis = { ...paineis, [nome]: valor ?? !paineis[nome] };
  aplicarPaineis(paineis);
}

for (const b of document.querySelectorAll('[data-painel]')) {
  b.addEventListener('click', () => alternarPainel(b.dataset.painel));
}

/** Modo palco: recolhe as quatro bordas de uma vez, ou devolve todas. */
function alternarModoPalco() {
  const tudoRecolhido = PAINEIS.every((p) => paineis[p]);
  paineis = Object.fromEntries(PAINEIS.map((p) => [p, !tudoRecolhido]));
  aplicarPaineis(paineis);
}

$('#btn-palco').addEventListener('click', alternarModoPalco);

/* ------------------------------------------------ controles de vista --- */

for (const b of document.querySelectorAll('.controles-vista button')) {
  b.addEventListener('click', () => {
    const v = b.dataset.vista;
    if (v === 'tudo') viewer.enquadrarTudo();
    else viewer.irParaVista(v);
  });
}

/* ------------------------------------------------------- ferramentas --- */

/**
 * Reaplica o estado de todos os alternadores. Precisa rodar depois de montar
 * uma cena nova, senao o carro recem-carregado ignora o que estava marcado.
 */
function aplicarTodosOsToggles() {
  aplicarCarroceria();
  raizes.interior && (raizes.interior.visible = $('#tg-interior').checked);
  raizes.rodas && (raizes.rodas.visible = $('#tg-rodas').checked);
  const ferrugem = porNome(raizes.carroceria, 'ferrugem');
  if (ferrugem) ferrugem.visible = $('#tg-ferrugem').checked;
  viewer.definirFantasma($('#tg-fantasma').checked);
  viewer.definirChaoVisivel($('#tg-chao').checked);
  viewer.definirExplode(Number($('#explode').value) / 100);
}

function aplicarCarroceria() {
  const visivel = $('#tg-carroceria').checked;
  for (const nome of ['lataria', 'vidros', 'teto', 'detalhes']) {
    const o = porNome(raizes.carroceria, nome);
    if (o) o.visible = visivel;
  }
  if (raizes.iluminacao) raizes.iluminacao.visible = visivel;
}

$('#explode').addEventListener('input', (e) => {
  const v = Number(e.target.value);
  viewer.definirExplode(v / 100);
  $('#explode-valor').textContent = `${v}%`;
});

$('#tg-fantasma').addEventListener('change', (e) => viewer.definirFantasma(e.target.checked));
$('#tg-ao').addEventListener('change', (e) => viewer.alternarAO(e.target.checked));
$('#tg-chao').addEventListener('change', (e) => viewer.definirChaoVisivel(e.target.checked));
$('#tg-carroceria').addEventListener('change', aplicarCarroceria);
$('#tg-interior').addEventListener('change', (e) => { if (raizes.interior) raizes.interior.visible = e.target.checked; });
$('#tg-rodas').addEventListener('change', (e) => { if (raizes.rodas) raizes.rodas.visible = e.target.checked; });

$('#tg-ferrugem').addEventListener('change', (e) => {
  const o = porNome(raizes.carroceria, 'ferrugem');
  if (o) o.visible = e.target.checked;
  if (e.target.checked && $('#tg-carroceria').checked) {
    $('#tg-carroceria').checked = false;
    aplicarCarroceria();
  }
});

$('#tg-motor-ligado').addEventListener('change', (e) => { viewer.motorLigado = e.target.checked; });

/* ------------------------------------------------------------ abas --- */

const telas = {
  ficha: $('#tela-ficha'),
  sintomas: $('#tela-sintomas'),
  vistoria: $('#tela-vistoria'),
  ajuda: $('#tela-ajuda'),
  campo: $('#tela-campo'),
};

function fecharTelas() {
  for (const t of Object.values(telas)) t.classList.add('oculto');
  for (const b of document.querySelectorAll('.aba-modo')) {
    b.classList.toggle('ativo', b.dataset.modo === 'explorar');
  }
}

function marcarAba(modo) {
  for (const b of document.querySelectorAll('.aba-modo')) {
    b.classList.toggle('ativo', b.dataset.modo === modo);
  }
}

function abrirFicha() {
  montarFicha(telas.ficha, fecharTelas);
  telas.ficha.classList.remove('oculto');
  telas.ficha.scrollTop = 0;
  marcarAba('ficha');
}

function abrirSintomas(sintomaInicial = null) {
  for (const t of Object.values(telas)) t.classList.add('oculto');
  montarSintomas(telas.sintomas, {
    aoFechar: fecharTelas,
    aoVerPeca: (id) => { fecharTelas(); selecionarPeca(id, { enquadrar: true }); },
    sintomaInicial,
  });
  telas.sintomas.classList.remove('oculto');
  if (!sintomaInicial) telas.sintomas.scrollTop = 0;
  marcarAba('sintomas');
}

function abrirFichaCampo() {
  for (const t of Object.values(telas)) t.classList.add('oculto');
  montarFichaCampo(telas.campo, { aoFechar: abrirVistoria });
  telas.campo.classList.remove('oculto');
  telas.campo.scrollTop = 0;
  marcarAba('vistoria');
}

function abrirVistoria() {
  for (const t of Object.values(telas)) t.classList.add('oculto');
  montarVistoria(telas.vistoria, {
    aoFechar: fecharTelas,
    aoVerPeca: (id) => { fecharTelas(); selecionarPeca(id, { enquadrar: true }); },
    aoAbrirFichaCampo: abrirFichaCampo,
  });
  telas.vistoria.classList.remove('oculto');
  telas.vistoria.scrollTop = 0;
  marcarAba('vistoria');
}

for (const b of document.querySelectorAll('.aba-modo')) {
  b.addEventListener('click', () => {
    for (const t of Object.values(telas)) t.classList.add('oculto');
    marcarAba(b.dataset.modo);
    if (b.dataset.modo === 'ficha') abrirFicha();
    else if (b.dataset.modo === 'sintomas') abrirSintomas();
    else if (b.dataset.modo === 'vistoria') abrirVistoria();
  });
}

/* ------------------------------------------------------ tour guiado --- */

const tour = criarTour({
  viewer,
  aoSelecionar: (id) => selecionarPeca(id),
  aoSair: () => {
    $('#tg-fantasma').checked = false;
    viewer.definirFantasma(false);
    viewer.enquadrarTudo();
  },
});

$('#iniciar-tour').addEventListener('click', () => {
  fecharTelas();
  tour.iniciar();
});

$('#btn-ajuda').addEventListener('click', () => {
  montarAjuda(telas.ajuda, fecharTelas);
  telas.ajuda.classList.remove('oculto');
});

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const aberta = Object.values(telas).some((t) => !t.classList.contains('oculto'));
    if (aberta) { fecharTelas(); return; }
    if (tour.ativo) { tour.sair(); return; }
    selecionarPeca(null);
  }
  if (e.key === '/' && document.activeElement !== $('#busca')) {
    e.preventDefault();
    $('#busca').focus();
  }
  // atalhos de painel: P recolhe tudo; 1 a 4 alternam uma borda de cada vez
  const digitando = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
  if (digitando) return;
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); alternarModoPalco(); }
  const atalhos = { 1: 'lateral', 2: 'detalhe', 3: 'topo', 4: 'ferramentas' };
  if (atalhos[e.key]) { e.preventDefault(); alternarPainel(atalhos[e.key]); }
});

/* --------------------------------------------------------- diagnostico --- */

{
  let quadros = 0, ultimo = performance.now();
  const alvo = $('#status-render');
  const atualizar = () => {
    quadros++;
    const agora = performance.now();
    if (agora - ultimo >= 1000) {
      const info = viewer.renderer.info.render;
      alvo.textContent = `${quadros} fps · ${info.triangles.toLocaleString('pt-BR')} triangulos`;
      quadros = 0;
      ultimo = agora;
    }
    requestAnimationFrame(atualizar);
  };
  atualizar();
}

/* --------------------------------------------------------- inicializacao --- */

{
  const dica = $('#dica-palco');
  const esconder = () => { dica.style.opacity = '0'; };
  $('#canvas3d').addEventListener('pointerdown', esconder, { once: true });
  setTimeout(esconder, 12000);
}

// setTimeout e nao requestAnimationFrame: em aba em segundo plano o rAF nao
// dispara, e a tela de carregamento ficaria travada na frente do app.
setTimeout(() => {
  const tela = $('#carregando');
  if (!tela) return;
  tela.classList.add('sumindo');
  setTimeout(() => tela.remove(), 600);
}, 80);

/*
 * Verificador de montagem. No CMS a fidelidade de posicao vem de artista com
 * referencia licenciada; aqui vem de assercao automatica. Rode no console:
 *   __verificar()            -> tabela de ocorrencias do carro ativo
 *   __verificar(true)        -> tambem imprime cada ocorrencia
 */
window.__verificar = (detalhado = false) => {
  const v = veiculoAtivo();
  if (!v.perfil) return console.warn('veiculo sem perfil geometrico');
  const achados = verificarMontagem(viewer, { ...v.perfil, sistemaDe: (id) => peca(id)?.sistema ?? '' });
  const resumo = resumir(achados);
  console.table(resumo.map((r) => ({ regra: r.regra, ocorrencias: r.total })));
  if (detalhado) for (const a of achados) console.log(`[${a.regra}] ${a.peca}: ${a.detalhe} — medido ${a.medido}, esperado ${a.esperado}`);
  return { total: achados.length, resumo, achados };
};

/** Diagnostico de interacao: confere se as pecas respondem direito ao mouse. */
window.__diagnosticar = () => {
  const r = diagnosticarInteracao(viewer, { pecaExiste: (id) => !!peca(id) });
  console.table(r.achados.map((a) => ({ regra: a.regra, peca: a.peca, detalhe: a.detalhe })));
  return {
    ocorrencias: r.achados.length,
    achados: r.achados,
    alcancavelComCarroceria: r.alcancavelComCarroceria.size,
    alcancavelSemCarroceria: r.alcancavelSemCarroceria.size,
    amostras: r.amostras,
  };
};

// auxilio de depuracao: permite inspecionar a cena pelo console do navegador
window.__viewer = viewer;
window.__raizes = () => raizes;
window.__trocarVeiculo = trocarVeiculo;
