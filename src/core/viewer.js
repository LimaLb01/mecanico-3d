/**
 * Nucleo do visualizador 3D.
 *
 * Responsabilidades: render PBR, iluminacao IBL, pos-processamento (AO +
 * contorno), orbita, registro de pecas, selecao por raycast, vista explodida,
 * modo fantasma e enquadramento automatico de peca.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Ambiente procedural de OFICINA, usado como fonte de reflexo (IBL).
 *
 * O que faz metal parecer metal nao e a cor: e o que ele reflete. Um ambiente
 * generico de estudio devolve reflexo difuso e chapado. Aqui montamos um galpao
 * escuro com faixas de luz no teto — o resultado sao aqueles rastros compridos
 * de luz atravessando polias, tubos e o coletor, que e exatamente a assinatura
 * visual de uma peca metalica sob luminaria de oficina.
 */
function ambienteOficina() {
  const cena = new THREE.Scene();
  const caixa = new THREE.BoxGeometry(1, 1, 1);

  const painel = (cor, intensidade, escala, pos) => {
    const m = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({
      color: new THREE.Color(cor).multiplyScalar(intensidade),
    }));
    m.scale.set(...escala);
    m.position.set(...pos);
    cena.add(m);
    return m;
  };

  /*
   * As paredes NAO sao so cenario: elas sao a luz de preenchimento da cena.
   * Deixa-las muito escuras produz um vao de motor bonito e ilegivel — e aqui
   * legibilidade vem antes de clima, porque o objetivo e reconhecer pecas.
   */
  const galpao = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({
    color: 0x555c66, side: THREE.BackSide,
  }));
  galpao.scale.set(22, 10, 22);
  galpao.position.y = 4;
  cena.add(galpao);

  // piso claro, que devolve luz por baixo das pecas
  painel(0x8d949d, 1.25, [22, 0.1, 22], [0, 0.05, 0]);

  // quatro luminarias longas no teto — sao elas que criam os rastros no metal
  for (const z of [-6, -2, 2, 6]) {
    painel(0xffffff, 11, [16, 0.2, 1.1], [0, 8.6, z]);
  }
  // luz de servico lateral, mais quente de um lado e mais fria do outro
  painel(0xffd9b0, 4.2, [0.2, 2.4, 10], [-9, 4.2, 0]);
  painel(0xbfd6ff, 3.2, [0.2, 2.4, 10], [9, 4.6, 0]);
  // faixa clara no fundo, para separar a silhueta do carro do escuro
  painel(0xffffff, 2.6, [12, 3.0, 0.2], [0, 3.4, -10]);

  return cena;
}

/**
 * Visibilidade EFETIVA na cena, subindo toda a cadeia de pais.
 *
 * Object3D.visible so descreve o proprio objeto. Quando se esconde um grupo,
 * os filhos continuam com visible = true — eles somem da tela porque o pai nao
 * e desenhado, mas continuam existindo para quem consulta a flag diretamente.
 * O raycaster do three.js tambem nao pula subarvores invisiveis.
 *
 * Sem isto, esconder a carroceria fazia o capo continuar sendo capturado pelo
 * mouse: o usuario apontava para a bateria e o programa selecionava o capo.
 */
function visivelNaCena(obj) {
  for (let o = obj; o; o = o.parent) {
    if (o.visible === false) return false;
  }
  return true;
}

const GHOST = new THREE.MeshStandardMaterial({
  color: 0x8fa3b8, transparent: true, opacity: 0.07,
  metalness: 0.0, roughness: 1.0, depthWrite: false,
});

export class Viewer {
  constructor(container, labelContainer) {
    this.container = container;

    /* ------------------------------------------------------- renderer --- */
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(container.clientWidth, container.clientHeight);
    this.labelRenderer.domElement.className = 'camada-rotulos';
    labelContainer.appendChild(this.labelRenderer.domElement);

    /* ---------------------------------------------------------- cena --- */
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d1015);
    this.scene.fog = new THREE.Fog(0x0d1015, 14, 34);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    this.scene.environment = pmrem.fromScene(ambienteOficina(), 0.02).texture;
    this.scene.environmentIntensity = 1.35;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.02, 120);
    this.camera.position.set(3.4, 2.1, 4.2);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.075;
    this.controls.minDistance = 0.18;
    this.controls.maxDistance = 22;
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.target.set(0, 0.6, 0);

    this._luzes();
    this._chao();

    /* --------------------------------------------------- pos-processo --- */
    this.outlineSelecao = null;
    this.outlineHover = null;
    this.usarAO = true;
    this._montarComposer();

    /* ------------------------------------------------------- registro --- */
    this.raycaster = new THREE.Raycaster();
    this.ponteiro = new THREE.Vector2();
    this.pecas = new Map();          // id -> { id, grupo, meshes, base, offsetExplode }
    this.selecionada = null;
    this.hover = null;
    this.raiz = new THREE.Group();
    this.scene.add(this.raiz);

    this.fatorExplode = 0;
    this.fatorExplodeAlvo = 0;
    this.modoFantasma = false;

    this._tween = null;
    this._aoVivo = [];               // callbacks de animacao (correia, ventoinha)
    this._rotulos = [];              // rotulos flutuantes da peca selecionada

    this.aoSelecionar = () => {};
    this.aoPassarMouse = () => {};
    this.nomeDaPeca = () => null;    // preenchido pela camada de UI

    this._ligarEventos();
    this._loop();
  }

  /* ------------------------------------------------------------ setup --- */

  _luzes() {
    const key = new THREE.DirectionalLight(0xfff4e6, 2.6);
    key.position.set(4.5, 6.5, 3.5);
    key.castShadow = true;
    // 4096: a sombra de contato e o que "assenta" o carro no chao. Em 2048 ela
    // sai com escada visivel nas bordas das pecas pequenas.
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    const s = 3.6;
    key.shadow.camera.left = -s;
    key.shadow.camera.right = s;
    key.shadow.camera.top = s;
    key.shadow.camera.bottom = -s;
    key.shadow.bias = -0.0009;
    key.shadow.normalBias = 0.012;
    this.scene.add(key);
    this.luzPrincipal = key;

    const fill = new THREE.DirectionalLight(0xbcd4ff, 1.15);
    fill.position.set(-5, 3, -2.5);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 1.35);
    rim.position.set(-1.5, 2.5, -6);
    this.scene.add(rim);

    // preenchimento por baixo: sem isso o que esta embaixo do carro — que e
    // metade do que se inspeciona — fica no breu
    const porBaixo = new THREE.DirectionalLight(0xc8d6e4, 0.55);
    porBaixo.position.set(0.5, -4, 1.5);
    this.scene.add(porBaixo);

    this.scene.add(new THREE.HemisphereLight(0x9fb8d0, 0x3a342c, 0.75));
  }

  _chao() {
    // Piso de concreto queimado de oficina: escuro, mas com brilho suficiente
    // para devolver as faixas de luz do teto e dar chao ao carro.
    const geo = new THREE.PlaneGeometry(60, 60);
    const mat = new THREE.MeshStandardMaterial({ color: 0x181c22, roughness: 0.58, metalness: 0.18 });
    const chao = new THREE.Mesh(geo, mat);
    chao.rotation.x = -Math.PI / 2;
    chao.receiveShadow = true;
    chao.name = '__chao';
    this.scene.add(chao);
    this.chao = chao;

    const grade = new THREE.GridHelper(40, 80, 0x2a3442, 0x1c232c);
    grade.position.y = 0.001;
    grade.material.transparent = true;
    grade.material.opacity = 0.5;
    grade.name = '__grade';
    this.scene.add(grade);
    this.grade = grade;
  }

  _montarComposer() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (this.composer) this.composer.dispose();

    /*
     * O EffectComposer renderiza num alvo PROPRIO. Sem pedir `samples` aqui, o
     * antialias do canvas e simplesmente descartado e a cena inteira sai
     * serrilhada — era o caso ate agora. HalfFloat evita banding nos degrades
     * do tone mapping.
     */
    const alvo = new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    this.composer = new EffectComposer(this.renderer, alvo);
    this.composer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.composer.setSize(w, h);

    this.composer.addPass(new RenderPass(this.scene, this.camera));

    // Oclusao de ambiente: e ela que "assenta" as pecas umas nas outras e tira
    // o aspecto de peca flutuando. Usamos GTAO (o passe novo do three) — o
    // SSAOPass antigo devolve tela preta nesta versao.
    // O raio esta em METROS: as pecas do motor tem ~5 cm, entao 10 cm de raio
    // pega bem as juntas entre flange, polia e bloco.
    if (this.usarAO) {
      const gtao = new GTAOPass(this.scene, this.camera, w, h);
      gtao.output = GTAOPass.OUTPUT.Default;
      gtao.updateGtaoMaterial({
        radius: 0.10, distanceExponent: 1.0, thickness: 0.30,
        scale: 1.15, samples: 16, screenSpaceRadius: false,
      });
      this.composer.addPass(gtao);
      this.ao = gtao;
    } else {
      this.ao = null;
    }

    // Bloom bem contido: so estoura o brilho especular das quinas polidas e do
    // cromado. Threshold alto para nao lavar a cena inteira.
    const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.22, 0.5, 0.88);
    this.composer.addPass(bloom);

    const mk = (cor, forca, espessura) => {
      const p = new OutlinePass(new THREE.Vector2(w, h), this.scene, this.camera);
      p.visibleEdgeColor.set(cor);
      p.hiddenEdgeColor.set(cor);
      p.edgeStrength = forca;
      p.edgeThickness = espessura;
      p.edgeGlow = 0.25;
      p.pulsePeriod = 0;
      this.composer.addPass(p);
      return p;
    };
    this.outlineSelecao = mk(0xffb340, 5.0, 1.6);
    this.outlineHover = mk(0x7fd4ff, 2.4, 1.0);

    this.composer.addPass(new OutputPass());
  }

  alternarAO(ligado) {
    this.usarAO = ligado;
    this._montarComposer();
    this._restaurarContornos();
  }

  /* --------------------------------------------------------- registro --- */

  /**
   * Registra um grupo como peca inspecionavel.
   *
   * Pecas que existem em mais de um lugar (4 amortecedores, 4 rodas) usam
   * sufixo com arroba: 'amortecedor-dianteiro@DE'. O trecho antes do arroba e
   * a chave no banco de dados; o sufixo identifica a instancia.
   *
   * @param {string} id        id da instancia (dbId ou dbId@sufixo)
   * @param {THREE.Object3D} grupo
   * @param {THREE.Vector3|number[]} explode  deslocamento na vista explodida
   */
  registrar(id, grupo, explode = [0, 0, 0]) {
    grupo.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.userData.pecaId = id;
        o.userData.materialOriginal = o.material;
      }
    });
    const meshes = [];
    grupo.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const registro = {
      id,
      dbId: id.split('@')[0],
      grupo,
      meshes,
      base: grupo.position.clone(),
      offsetExplode: Array.isArray(explode) ? new THREE.Vector3(...explode) : explode.clone(),
      // le a visibilidade real em vez de assumir true: ha grupo que ja nasce
      // escondido (os marcadores de ferrugem, por exemplo)
      visivel: visivelNaCena(grupo),
    };
    this.pecas.set(id, registro);
    return registro;
  }

  /** Todas as instancias 3D de uma peca do banco de dados. */
  instancias(dbId) {
    const out = [];
    for (const p of this.pecas.values()) if (p.dbId === dbId) out.push(p);
    return out;
  }

  limparCena() {
    // Descarta as geometrias do carro anterior. Materiais NAO sao descartados:
    // eles vem de um cache compartilhado e continuam servindo o proximo carro.
    this.raiz.traverse((o) => { if (o.isMesh) o.geometry?.dispose(); });
    this.raiz.clear();
    this.pecas.clear();
    this.selecionada = null;
    this.selecionadaDb = null;
    this.hover = null;
    this._aoVivo = [];
    for (const r of this._rotulos) r.parent?.remove(r);
    this._rotulos = [];
    this._restaurarContornos();
  }

  adicionar(obj) { this.raiz.add(obj); }

  /** Registra um callback chamado a cada quadro (dt em segundos). */
  animar(fn) { this._aoVivo.push(fn); }

  /* ---------------------------------------------------------- selecao --- */

  /**
   * Meshes de todas as instancias de um dbId que estao REALMENTE na tela.
   * Usa a visibilidade efetiva, e nao a flag do registro: a interface esconde
   * carroceria, interior e rodas mexendo direto nos grupos, sem passar pelo
   * registro — entao a flag fica desatualizada e o contorno acendia em peca
   * escondida.
   */
  _meshesDe(dbId) {
    if (!dbId) return [];
    const out = [];
    for (const p of this.pecas.values()) {
      if (p.dbId !== dbId) continue;
      for (const m of p.meshes) if (visivelNaCena(m)) out.push(m);
    }
    return out;
  }

  _restaurarContornos() {
    if (!this.outlineSelecao) return;
    const selDb = this.selecionadaDb;
    const hovDb = this.hover ? this.hover.split('@')[0] : null;
    this.outlineSelecao.selectedObjects = this._meshesDe(selDb);
    this.outlineHover.selectedObjects = hovDb && hovDb !== selDb ? this._meshesDe(hovDb) : [];
  }

  /**
   * Seleciona uma peca. Aceita o id de instancia ou o id do banco de dados —
   * as duas formas destacam TODAS as instancias (os 4 amortecedores acendem
   * juntos, que e o comportamento util para aprender a peca).
   */
  selecionar(id, { enquadrar = false } = {}) {
    this.selecionada = id;
    this.selecionadaDb = id ? id.split('@')[0] : null;
    this._restaurarContornos();
    this._aplicarFantasma();
    this._atualizarRotulo();
    if (enquadrar && id) this.enquadrarPeca(id);
    this.aoSelecionar(this.selecionadaDb, id);
  }

  /**
   * Rotulo flutuante com o nome da peca selecionada, ancorado no topo dela.
   * O texto vem de fora (this.nomeDaPeca) para o viewer nao precisar conhecer
   * o banco de dados. Peca com varias instancias ganha um rotulo em cada uma —
   * e assim que fica obvio que "pivo" sao quatro, e nao um.
   */
  _atualizarRotulo() {
    for (const r of this._rotulos) r.parent?.remove(r);
    this._rotulos = [];
    if (!this.selecionadaDb) return;

    const texto = this.nomeDaPeca?.(this.selecionadaDb);
    if (!texto) return;

    const caixa = new THREE.Box3();
    for (const p of this.instancias(this.selecionadaDb)) {
      if (!visivelNaCena(p.grupo)) continue;   // nao rotula peca fora da tela
      caixa.setFromObject(p.grupo);
      if (caixa.isEmpty()) continue;
      const topo = new THREE.Vector3(
        (caixa.min.x + caixa.max.x) / 2,
        caixa.max.y + 0.03,
        (caixa.min.z + caixa.max.z) / 2,
      );
      const rotulo = this.criarRotulo(texto, topo);
      this.scene.add(rotulo);
      this._rotulos.push(rotulo);
    }
  }

  _pick(evento) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.ponteiro.x = ((evento.clientX - r.left) / r.width) * 2 - 1;
    this.ponteiro.y = -((evento.clientY - r.top) / r.height) * 2 + 1;
    this.raycaster.setFromCamera(this.ponteiro, this.camera);
    const alvos = this.raycaster.intersectObject(this.raiz, true);
    for (const a of alvos) {
      if (!visivelNaCena(a.object)) continue;
      if (a.object.material === GHOST) continue;
      const id = a.object.userData.pecaId;
      if (id) return { id, ponto: a.point };
    }
    return null;
  }

  /* -------------------------------------------------------- visualizacao --- */

  definirExplode(valor) { this.fatorExplodeAlvo = valor; }

  definirFantasma(ligado) {
    this.modoFantasma = ligado;
    this._aplicarFantasma();
  }

  _aplicarFantasma() {
    for (const p of this.pecas.values()) {
      const alvo = this.modoFantasma && this.selecionadaDb && p.dbId !== this.selecionadaDb;
      for (const m of p.meshes) {
        const desejado = alvo ? GHOST : m.userData.materialOriginal;
        if (m.material !== desejado) m.material = desejado;
      }
    }
  }

  /** Mostra/esconde pecas por id de banco de dados (afeta todas as instancias). */
  definirVisibilidade(dbIds, visivel) {
    const alvo = new Set(dbIds);
    for (const p of this.pecas.values()) {
      if (!alvo.has(p.dbId)) continue;
      p.visivel = visivel;
      p.grupo.visible = visivel;
    }
    this._restaurarContornos();
    this._atualizarRotulo();
  }

  mostrarTudo() {
    for (const p of this.pecas.values()) { p.visivel = true; p.grupo.visible = true; }
  }

  definirChaoVisivel(v) {
    this.chao.visible = v;
    this.grade.visible = v;
  }

  /* ----------------------------------------------------------- camera --- */

  _caixaDe(obj) {
    const box = new THREE.Box3();
    box.setFromObject(obj);
    return box;
  }

  enquadrarPeca(id, margem = 2.1) {
    const p = this.pecas.get(id) || this.instancias(id.split('@')[0])[0];
    if (!p) return;
    this.enquadrarObjeto(p.grupo, margem);
  }

  enquadrarObjeto(obj, margem = 2.1) {
    const box = this._caixaDe(obj);
    if (box.isEmpty()) return;
    const centro = box.getCenter(new THREE.Vector3());
    const raio = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.05);
    const dist = (raio / Math.sin((this.camera.fov * Math.PI) / 360)) * margem * 0.55;
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this._irPara(centro.clone().add(dir.multiplyScalar(dist)), centro);
  }

  enquadrarTudo() {
    this._irPara(new THREE.Vector3(3.9, 2.3, 4.8), new THREE.Vector3(0, 0.62, 0));
  }

  irParaVista(nome) {
    const vistas = {
      frente: [[0, 1.0, 6.2], [0, 0.72, 0]],
      tras: [[0, 1.0, -6.2], [0, 0.72, 0]],
      lateral: [[6.4, 1.1, 0.2], [0, 0.68, 0]],
      cima: [[0.01, 6.6, 0.4], [0, 0.5, 0]],
      motor: [[1.05, 1.5, 2.55], [0.02, 0.66, 1.34]],
      dianteira: [[2.2, 0.75, 2.6], [0.62, 0.36, 1.31]],
      traseira: [[-2.2, 0.8, -2.4], [-0.6, 0.35, -1.31]],
      inferior: [[2.6, -1.4, 2.4], [0, 0.25, 0.4]],
    };
    const v = vistas[nome];
    if (!v) return;
    this._irPara(new THREE.Vector3(...v[0]), new THREE.Vector3(...v[1]));
  }

  _irPara(posicao, alvo, duracao = 0.75) {
    this._tween = {
      t: 0, duracao,
      p0: this.camera.position.clone(), p1: posicao,
      a0: this.controls.target.clone(), a1: alvo,
    };
  }

  /* ------------------------------------------------------------ loop --- */

  _ligarEventos() {
    const el = this.renderer.domElement;
    let ultimoMove = 0;

    el.addEventListener('pointermove', (e) => {
      const agora = performance.now();
      if (agora - ultimoMove < 33) return;   // ~30 Hz basta para hover
      ultimoMove = agora;
      const r = this._pick(e);
      const id = r ? r.id : null;
      if (id !== this.hover) {
        this.hover = id;
        this._restaurarContornos();
        el.style.cursor = id ? 'pointer' : 'grab';
        this.aoPassarMouse(id);
      }
    });

    /*
     * Clique x orbita, num unico par de tratadores.
     *
     * A versao anterior media o arrasto num listener e decidia noutro. Como os
     * dois eram registrados no MESMO elemento, os dois rodavam na fase de alvo,
     * em ordem de REGISTRO — a flag de captura nao antecipa nada nesse caso.
     * O tratador que decidia rodava primeiro e lia a distancia do clique
     * ANTERIOR, entao a selecao ficava sempre um gesto atrasada: depois de
     * girar a camera, o clique seguinte era engolido.
     */
    let inicioX = 0, inicioY = 0, botaoValido = false;

    el.addEventListener('pointerdown', (e) => {
      inicioX = e.clientX;
      inicioY = e.clientY;
      botaoValido = e.button === 0;      // so o botao esquerdo seleciona
    });

    el.addEventListener('pointerup', (e) => {
      if (!botaoValido) return;
      botaoValido = false;
      const arrasto = Math.hypot(e.clientX - inicioX, e.clientY - inicioY);
      if (arrasto > 5) return;           // foi orbita, nao clique
      const r = this._pick(e);
      this.selecionar(r ? r.id : null);
    });

    el.addEventListener('dblclick', (e) => {
      const r = this._pick(e);
      if (r) this.enquadrarPeca(r.id);
    });

    addEventListener('resize', () => this.redimensionar());

    /*
     * Recolher um painel muda o tamanho do palco sem disparar resize de janela,
     * e a mudanca e ANIMADA. Um ResizeObserver no proprio container resolve os
     * dois casos de uma vez: ele dispara a cada quadro da transicao, entao o
     * canvas acompanha em vez de esticar e so corrigir no fim.
     */
    if (typeof ResizeObserver !== 'undefined') {
      this._observador = new ResizeObserver(() => this.redimensionar());
      this._observador.observe(this.container);
    }
  }

  redimensionar() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.composer.setSize(w, h);
    if (this.ao) this.ao.setSize(w, h);
  }

  _loop() {
    const relogio = new THREE.Clock();
    const tick = () => {
      requestAnimationFrame(tick);
      const dt = Math.min(relogio.getDelta(), 0.05);

      // tween de camera
      if (this._tween) {
        const tw = this._tween;
        tw.t = Math.min(1, tw.t + dt / tw.duracao);
        const e = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - (-2 * tw.t + 2) ** 3 / 2;  // easeInOutCubic
        this.camera.position.lerpVectors(tw.p0, tw.p1, e);
        this.controls.target.lerpVectors(tw.a0, tw.a1, e);
        if (tw.t >= 1) this._tween = null;
      }

      // vista explodida
      if (Math.abs(this.fatorExplode - this.fatorExplodeAlvo) > 0.001) {
        this.fatorExplode += (this.fatorExplodeAlvo - this.fatorExplode) * Math.min(1, dt * 7);
        for (const p of this.pecas.values()) {
          p.grupo.position.copy(p.base).addScaledVector(p.offsetExplode, this.fatorExplode);
        }
      }

      for (const fn of this._aoVivo) fn(dt);

      this.controls.update();
      this.composer.render();
      this.labelRenderer.render(this.scene, this.camera);
    };
    tick();
  }

  /* ---------------------------------------------------------- rotulos --- */

  criarRotulo(texto, posicao, classe = 'rotulo-peca') {
    const el = document.createElement('div');
    el.className = classe;
    el.textContent = texto;
    const obj = new CSS2DObject(el);
    obj.position.copy(posicao);
    obj.center.set(0, 1);
    return obj;
  }
}
