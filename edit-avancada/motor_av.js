// ============================================================================
//  edit-avancada — motor_av.js   (2ª parte do render/scenes.js = work/<prefixo>_b.js; a 1ª, _a.js, é o componentes.js da edit-earn)
//  Soma dos 9 materiais da EarnEdits estudados em 07/11/2026 (números de cada técnica em ANALISE_REFERENCIA.md):
//   Stripe x OpenRouter (.aep), Twitter/Elon (.aep + pacote Retro FX), Discord pixel (.aep), Walkman + Bryan Johnson (.aep),
//   Microsoft Teams (.aep), High heels (.aep, base da vox-edit2), Russia plague (.aep, base da edit-earn), tutoriais Listerine e Lamborghini.
//  Usa da edit-earn: eaPalco/eaCamada/eaAplica (mundo em camadas com profundidade p e câmera {x, y, z, r}), aeEase/aeWiggle, eaPoster,
//  eaFlashOnda, mattes 'ea:matte:*', jornal(), parede(), salaTV(), presEA(), perfilEA() e o vídeo real sempre a 30 q/s (eaClipQuadro).
//
//   0. looks: acabamento + fontes + passo por vídeo ('retro' padrão, 'premium', 'pixel'); extras por cena ('filme', 'vhs')   AV_LOOKS
//   1. curvas do AE e chaves                                                                       AV_C, avE, avKf, avPost
//   2. câmera de nulos (movimentos sobrepostos, chegada com giro, espiral, grua, saída no corte)     avCam
//   3. camadas: sombra longa/adesivo/chão, borda, contorno que ferve, P&B, tremor, bob, degrau 3D, revela, desliza, fps, entra cartao/sobe/corte, pisca
//   4. tipografia: offset, aleatorio, digita (+apaga), selecao, tremido, mexido, contador; palavra gigante atrás   avTexto, avGigante
//   5. rabiscos à mão no passo 12: circulo, sublinha, seta, marca, xis, rabisco, caixa, ondas, interroga          avRisco
//   6. efeitos: holofote, estouro de formas, fila de figuras, folhas de calendário, vento                       avHolofote, avEstouro, avFila, avFolhas
//   7. cenas: cenaAV(beats, o), avViagem(beats, o), presAV(beats, clipe, o)
//   8. passagens: av:formas, av:pagina, av:queima, av:pixel, av:espiral (com a cena velha) e av:flex, av:impacto, av:estalo (no corte)
//   9. acabamento por look + legenda doc (1–2 palavras no meio-baixo, letras tremendo no passo)    renderCaptions
// ============================================================================

// ---------- 0. looks ----------
// retro   = Walkman "Texture+Sauce" + Listerine + Lamborghini + Twitter: retícula em overlay, grunge em screen, papel, persiana,
//           borda borrada com aberração, tremor no passo 12, vinheta, grão, flicker de exposição, passo 15–16, mundo P&B com acento.
// premium = Stripe "Premium Adjustment" (e Teams): vinheta oval, bolha de brilho em add, flicker de exposição no passo 10, ruído duplo,
//           borda borrada + prisma, faixa de luz horizontal tremendo, textura em screen, passo 21, Inter + Playfair itálica.
// pixel   = Discord: letra de pixel, linhas de varredura, aberração forte, mosaico nas trocas, passo 12–15.
const AV_LOOKS = {
  retro: {
    fps: 15, fundo: '#0f0e0c', cores: ['#d8342b', '#f2c14e', '#2f5fa8', '#efe6d2', '#141414'], acento: '#d8342b', marca: '#ffd23f', papel: '#efe6d2',
    leg: { fam: 'Poppins', peso: 600, s: 76, cor: '#fbf7ee', enfFam: 'PlayfairItalic', enfPeso: 600, enfS: 100, enfCor: '#ffd23f', y: 1330, fps: 12, jit: 2.2, rot: 2.2, max: 2 },
    ac: { reticula: .2, grunge: .3, papel: .2, persiana: .06, borda: 6, ca: 1.6, tremor: 5, tremorFps: 12, vinheta: .62, grao: .12, graoFps: 12, flicker: .045, flickerFps: 10, pulso: 12, oval: 0, bolha: 0, faixa: 0, linhas: 0 },
  },
  premium: {
    fps: 21, fundo: '#f3f0ea', cores: ['#6a5cff', '#ff4aa6', '#3dff8b', '#ffffff', '#0f0f12'], acento: '#6a5cff', marca: '#3dff8b', papel: '#ffffff',
    leg: { fam: 'Inter', peso: 600, s: 70, cor: '#ffffff', enfFam: 'PlayfairItalic', enfPeso: 500, enfS: 94, enfCor: '#ffffff', y: 1330, fps: 21, jit: 0, rot: 0, max: 2 },
    ac: { reticula: 0, grunge: .16, papel: 0, persiana: 0, borda: 8, ca: 1.2, tremor: 2, tremorFps: 21, vinheta: 0, grao: .08, graoFps: 16, flicker: .087, flickerFps: 10, pulso: 0, oval: .65, bolha: .14, faixa: .12, linhas: 0 },
    tx: { gru: 'av_tex03' },
  },
  pixel: {
    fps: 12, fundo: '#0d0d14', cores: ['#7b6cff', '#ff4f9a', '#23d18b', '#f5f5f5', '#0d0d14'], acento: '#7b6cff', marca: '#23d18b', papel: '#f5f5f5',
    leg: { fam: 'pixel', peso: 400, s: 84, cor: '#f5f5f5', enfFam: 'pixel', enfPeso: 400, enfS: 100, enfCor: '#23d18b', y: 1330, fps: 12, jit: 0, rot: 0, max: 2 },
    ac: { reticula: .1, grunge: 0, papel: 0, persiana: .1, borda: 4, ca: 2.4, tremor: 3, tremorFps: 12, vinheta: .5, grao: .1, graoFps: 12, flicker: .05, flickerFps: 8, pulso: 0, oval: 0, bolha: 0, faixa: 0, linhas: .16 },
  },
};
// extras por cena (cenaAV {look: 'filme'}): FilmFX e VHSFX do pacote Retro FX do projeto Twitter
const AV_EXTRAS = {
  filme: { sepia: .4, poeira: 1, riscos: 1, tremor: 7, tremorFps: 20, flicker: .1, furos: 1 },
  vhs: { ca: 4.5, faixas: 1, play: 1, flicker: .07, sat: .82 },
};
window.AV_LOOK = window.AV_LOOK || 'retro';
const avLook = () => AV_LOOKS[window.AV_LOOK] || AV_LOOKS.retro;

// ---------- 1. curvas do After Effects e chaves ----------
// avE(saída %, chegada %) = ease temporal do AE com velocidade 0 nas pontas (influências lidas nos .aep).
//  snap  17/100 — "100/17" do Stripe e do Twitter: sai seco e DESLIZA até parar (a curva mais usada nos 5 projetos)
//  seco  1/99   — 99/1 do Twitter: chicote de câmera
//  sobe  100/100 — 17/100 → 100/17: S forte (prédios subindo, travessias)
//  glide 95/90  — 17/95 → 90/0 do Walkman: travessias longas da câmera 3D
//  cartao 1/100 — 33/0 → 100/17 dos cartões do Stripe: chega rápido e assenta numa cauda longa
const avE = (oi, ii) => u => aeEase(u, oi / 100, ii / 100);
const AV_C = {
  snap: avE(17, 100), seco: avE(1, 99), entra: EA_ENTRA, sai: EA_SAI, suave: avE(75, 75), sobe: avE(100, 100), glide: avE(95, 90),
  cartao: avE(1, 100), linear: E.lin, mola: EA_MOLA, back: E.back, inOut: E.inOut,
};
const avCurva = cv => typeof cv === 'function' ? cv : (AV_C[cv] || (typeof EA_CURVAS !== 'undefined' && EA_CURVAS[cv]) || AV_C.snap);
const avPost = (t, fps) => fps ? Math.floor(t * fps + 1e-6) / fps : t;          // posterizeTime(fps)
const avR = n => hrand(n * 1.37 + .123);                                          // 0..1 determinístico
const avS = n => avR(n) * 2 - 1;                                                  // -1..1
function avMix(a, b, q) {
  if (typeof a === 'number') return a + (b - a) * q;
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[k] ?? b[k], y = b[k] ?? a[k]; o[k] = x + (y - x) * q; }
  return o;
}
// avKf([[t, valor, curva], ...]) -> lt => valor (número ou objeto). A curva de cada chave vale para o trecho que começa nela.
function avKf(keys) {
  const K = keys.map(k => ({ t: k[0], v: k[1], cv: avCurva(k[2]) })).sort((a, b) => a.t - b.t);
  return lt => {
    if (lt <= K[0].t) return K[0].v;
    for (let i = 0; i < K.length - 1; i++) if (lt < K[i + 1].t) return avMix(K[i].v, K[i + 1].v, K[i].cv((lt - K[i].t) / (K[i + 1].t - K[i].t)));
    return K[K.length - 1].v;
  };
}
function avRng(seed) { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const avCenaDe = c => (typeof SCENES !== 'undefined' ? SCENES.findIndex(s => s.ctx === c) : -1);
// tempos de cena prontos para as opções (t, sai, ws, nulos, foco...): avW('B02', 'uisque', -.05) = início da palavra − .05 (tempo da cena);
// avB('B03', .1) = c => c.b('B03') + .1. A palavra é procurada INTEIRA primeiro e só depois como prefixo (o c.w do motor pega o 1º
// prefixo: 'que' caía no "Quem"); número = índice da palavra no beat. O montar.py confere toda palavra de avW e de em:.
function avPalavra(b, p) {
  const ws = (TIMING.beats.find(x => x.id === b) || {}).words || [];
  if (typeof p === 'number') return ws[Math.min(p < 0 ? ws.length + p : p, ws.length - 1)] || null;
  const k = norm(String(p));
  return ws.find(x => norm(x.w) === k) || ws.find(x => norm(x.w).startsWith(k)) || null;
}
const avW = (b, p, d = 0) => c => { const w = avPalavra(b, p); return (w ? w.s - c.t0 : c.b(b)) + d; };
const avB = (b, d = 0) => c => c.b(b) + d;

// ---------- 2. câmera de nulos ----------
// avCam(c, o) -> lt => {x, y, z, r} (a câmera do mundo da edit-earn: x, y = ponto do mundo no centro da tela, z = zoom, r = giro em graus)
//  base {x, y, z, r}: para onde a câmera olha (o assunto). Assunto centrado = x 540.
//  nulos [[t, d, {z, x, y, r}, curva], ...]: cada nulo é UM movimento (a cadeia de nulls do Stripe/High heels/Walkman): começa em t, dura d,
//     vai do neutro ao alvo com a curva (padrão 'snap'); z multiplica (escala logarítmica), x/y/r somam. Nulos sobrepostos = movimento
//     em camadas (Stripe: zooms 33% → 60–100% em 0,4–1,2 s, um começando antes do outro acabar).
//  chega (padrão {r: 5, z: 1.1, d: .5}): chegada com giro que assenta (Stripe: 10° → 0,95° → 0,37° → 0; use r 10 só no gancho e nas viradas,
//     porque giro grande em toda cena estoura a régua de leitura); false = sem
//  sai ({z, r, x, y, d, curva: 'sai'}): o último trecho acelera até o corte (o corte pega no pico); false = sem (corte casado)
//  mao (px, padrão 8): câmera na mão = wiggle(1, mao) duas vezes (controlador + câmera, como nos .aep)
//  espiral {t, d: 1.22, r: -121.8, z: 2.4}: um nulo que gira e aproxima junto (a espiral do Stripe)
//  grua {d: .7, y: -2300, z: .55, foco: 18}: a câmera 3D desce do céu até o assunto com o foco puxando (crane do Stripe: y −2292 → 0 em 0,7 s)
function avCam(c, o = {}) {
  const b = { x: 540, y: 960, z: 1, r: 0, ...(o.base || {}) };
  const nul = (o.nulos ? eaT(c, o.nulos) : []).map(([t, d, a, cv]) => ({ t: eaT(c, t), d: d ?? .8, a, cv: avCurva(cv || 'snap') }));
  if (o.espiral) { const e = o.espiral; nul.push({ t: eaT(c, e.t ?? 0), d: e.d ?? 1.22, a: { r: e.r ?? -121.8, z: e.z ?? 2.4 }, cv: avCurva(e.curva || 'snap') }); }
  const ch = o.chega === false ? null : { r: 5, z: 1.1, d: .5, ...(o.chega || {}) };
  const sa = !o.sai ? null : { z: 1.16, r: 0, x: 0, y: 0, d: .4, curva: 'sai', ...(o.sai === true ? {} : o.sai) };
  const gr = o.grua ? { y: -2300, z: .55, d: .7, foco: 18, curva: 'snap', ...o.grua } : null;
  const mao = o.mao ?? 8, sem = (c.t0 * 3.7) % 50;
  return lt => {
    let z = b.z, x = b.x, y = b.y, r = b.r, foco = 0;
    for (const n of nul) {
      const q = n.cv(clamp((lt - n.t) / n.d)); if (q === 0) continue;
      z *= Math.pow(n.a.z ?? 1, q); x += (n.a.x ?? 0) * q; y += (n.a.y ?? 0) * q; r += (n.a.r ?? 0) * q;
    }
    if (ch) { const q = AV_C.snap(clamp(lt / ch.d)); z *= lerp(ch.z, 1, q); r += ch.r * (1 - q); }
    if (gr) { const q = avCurva(gr.curva)(clamp(lt / gr.d)); y += gr.y * (1 - q); z *= lerp(gr.z, 1, q); foco = gr.foco * (1 - q); }
    if (sa) {
      const D = c.dur + (c._trProx || 0), q = avCurva(sa.curva)(clamp((lt - (D - sa.d)) / sa.d));
      if (q > 0) { z *= Math.pow(sa.z, q); r += sa.r * q; x += sa.x * q; y += sa.y * q; }
    }
    if (mao) {
      const k = 1 / Math.max(.4, z);
      x += (aeWiggle(lt, 1, mao, sem) + aeWiggle(lt, 1, mao, sem + 3)) * k; y += (aeWiggle(lt, 1, mao, sem + 6) + aeWiggle(lt, 1, mao, sem + 9)) * k;
      r += aeWiggle(lt, .5, .35, sem + 12);
    }
    return { x, y, z, r, _foco: foco };
  };
}
// saída padrão de uma cena: chicote curto de zoom até o corte; menor quando a passagem seguinte já se mexe; nenhuma na espiral/casado
function avSaiPadrao(c, o) {
  const k = avCenaDe(c), nx = k >= 0 ? SCENES[k + 1] : null; if (!nx) return false;
  const tr = nx.tr || 'cut';
  if (tr === 'match' || tr === 'av:espiral' || o.casado) return false;
  if (tr === 'cut' || tr === 'av:flex' || tr === 'av:impacto' || tr === 'av:estalo') return { z: 1.14, d: .35 };
  return { z: 1.07, d: .4 };
}

// ---------- 3. camadas (extras sobre a eaCamada) ----------
// sombra: 'longa' | 'adesivo' | 'chao' | 'suave' | {tipo, ang, comp, suave, a, dist, achata, inclina}
//    'longa'   Shadow Studio (Stripe/High heels/Listerine: comprimento 145–1012 px, raio ~100–410, suavidade ~10%): 3 cópias encadeadas em ang
//              (graus de tela no sentido do relógio a partir de cima: 135 = para baixo/direita)
//    'adesivo' sombra dura do Twitter (opacidade 100%, direção 292°, distância 18, suavidade 14)
//    'chao'    sombra projetada no chão (CC Slant −36 + blur 33 do Walkman, Netflix): cópia preta achatada e inclinada saindo dos pés
// borda: true | px            borda branca de adesivo (Lamborghini: Simple Choker −50 + Roughen + Fill)
// contorno: cor | {cor, px}   contorno colorido que FERVE (Twitter: Stroke amarelo + 2× Turbulent Displace no posterizeTime)
// pb: true                    camada P&B (mundo P&B com o assunto colorido: placa 'clean' P&B + recorte colorido do Walkman)
// tremor: {f: 8, a: 10, fps: 5, ar}  wiggle no passo (garrafa do Listerine: posterizeTime(5); wiggle(8,10))
// bob: {a: 12, per: .3, fase}        vai e volta (loopOut('pingpong')): passo de quem anda, multidão, nota musical
// degrau: {a: 12, passo: .26}        giro Y em degraus (3D de stop-motion do Twitter: orientação Y em holds a cada ~0,26 s)
// revela: {t, d: .27, passos: 4, de}  papel revelado por máscara redesenhada a cada 2 quadros (Listerine, Lamborghini); de esq|dir|cima|baixo
// desliza: px/s               a camada anda para trás (fundos da viagem)
// fps                         passo próprio da camada (Twitter: cenas a 5,8 / 3 q/s)
// entra.k: 'cartao' (vem de ~1000 px fora com giro de 13–18° e assenta em ±2°: dir, dist, r0, rFim, d 1.0, lado),
//          'sobe' (sobe de baixo: CEOs do Stripe .55 s, prédios do Twitter 1,3 s; dist, d, curva), 'corte' (aparece seco);
//          entra.pisca: true = duas piscadas de entrada (opacidade 1,0,1,0 em 0,13 s, cartões do Stripe)
function avFiltroCamada(op, h = 1000) {
  const out = [];
  if (op.pb) out.push('grayscale(1) contrast(1.12)');
  if (op.borda) { const p = op.borda === true ? 5 : op.borda; out.push(`drop-shadow(${p}px 0 0 #fff) drop-shadow(-${p}px 0 0 #fff) drop-shadow(0 ${p}px 0 #fff) drop-shadow(0 -${p}px 0 #fff)`); }
  if (op.contorno) {
    const k = typeof op.contorno === 'object' ? op.contorno : { cor: op.contorno }, p = k.px ?? 5, cr = k.cor ?? '#ffd400';
    out.push(`drop-shadow(${p}px 0 0 ${cr}) drop-shadow(-${p}px 0 0 ${cr}) drop-shadow(0 ${p}px 0 ${cr}) drop-shadow(0 -${p}px 0 ${cr}) url(#avFerve)`);
  }
  const s = op.sombra; if (!s) return out.join(' ');
  const k = typeof s === 'object' ? s : { tipo: s };
  if (k.tipo === 'adesivo') {
    const a = (k.ang ?? 292) * Math.PI / 180, d = k.dist ?? 18;
    out.push(`drop-shadow(${(Math.sin(a) * d).toFixed(1)}px ${(-Math.cos(a) * d).toFixed(1)}px ${((k.suave ?? 14) / 2).toFixed(1)}px rgba(0,0,0,${k.a ?? .9}))`);
  } else if (k.tipo === 'longa') {
    const a = (k.ang ?? 135) * Math.PI / 180, L = (k.comp ?? 240) / 3, sv_ = k.suave ?? 12, al = k.a ?? .3;
    for (let j = 0; j < 3; j++) out.push(`drop-shadow(${(Math.sin(a) * L).toFixed(1)}px ${(-Math.cos(a) * L).toFixed(1)}px ${(sv_ * (j + 1)).toFixed(0)}px rgba(0,0,0,${(al * (1 - j * .22)).toFixed(3)}))`);
  } else if (k.tipo === 'suave') out.push(`drop-shadow(0 ${(h * .02).toFixed(0)}px ${(h * .03).toFixed(0)}px rgba(0,0,0,${k.a ?? .5}))`);
  return out.join(' ');
}
function avSombraChao(lay, k = {}) {
  if (!lay.inner || lay.inner.tagName !== 'IMG') return null;
  const sh = lay.inner.cloneNode();
  sh.style.transformOrigin = `50% ${((k.pe ?? 1) * 100).toFixed(1)}%`;      // pe = altura dos pés na imagem (recorte com folga embaixo)
  sh.style.transform = `scaleY(${k.achata ?? .3}) skewX(${k.inclina ?? -42}deg)`;
  sh.style.filter = `brightness(0) blur(${k.suave ?? 10}px)`;
  sh.style.opacity = k.a ?? .5;
  lay.L.insertBefore(sh, lay.inner);
  return (lay.sombraChao = sh);
}
const AV_ENTRA = {
  cartao(lay, lt, e) {
    const t = e._t ?? 0, d = e.d ?? 1.0; if (lt < t) return { s: 1, x: 0, y: 0, b: 0, o: 0, r: 0 };
    const q = AV_C.cartao(clamp((lt - t) / d)), sg = e.lado ?? (hrand(lay.x * .013 + lay.y * .007) > .5 ? 1 : -1);
    const dir = { esq: [-1, 0], dir: [1, 0], cima: [0, -1], baixo: [0, 1] }[e.dir || 'baixo'] || [0, 1], dist = e.dist ?? 1000;
    const r0 = e.r0 ?? sg * 15, rf = e.rFim ?? sg * 2;
    return { s: 1, x: dir[0] * dist * (1 - q), y: dir[1] * dist * (1 - q), b: (1 - q) * 10, o: 1, r: r0 + (rf - r0) * q };
  },
  sobe(lay, lt, e) {
    const t = e._t ?? 0, d = e.d ?? .55; if (lt < t) return { s: 1, x: 0, y: 0, b: 0, o: 0, r: 0 };
    const q = avCurva(e.curva || 'snap')(clamp((lt - t) / d));
    return { s: 1, x: 0, y: (e.dist ?? 850) * (1 - q), b: (1 - q) * 6, o: 1, r: 0 };
  },
  corte(lay, lt, e) { return { s: 1, x: 0, y: 0, b: 0, o: lt >= (e._t ?? 0) ? 1 : 0, r: 0 }; },
};
const _avEntra0 = eaEntrada, _avVida0 = eaVida;
eaEntrada = function (lay, lt) {
  const op = lay.op, e = op.entra; if (op.fps) lt = avPost(lt, op.fps);
  const r = e && AV_ENTRA[e.k] ? AV_ENTRA[e.k](lay, lt, e) : _avEntra0(lay, lt);
  if (e && e.pisca) { const k = Math.floor((lt - (e._t ?? 0)) * 30 + 1e-6); if (k === 1 || k === 3) return { ...r, o: 0 }; }
  return r;
};
eaVida = function (lay, lt, i) {
  const op = lay.op; if (op.fps) lt = avPost(lt, op.fps);
  let v = _avVida0(lay, lt, i);
  if (op.tremor || op.bob || op.desliza) v = { ...v };
  if (op.tremor) {
    const k = op.tremor === true ? {} : op.tremor, tt = avPost(lt, k.fps ?? 5), sm = i * 3.1 + 7;
    v.x += aeWiggle(tt, k.f ?? 8, k.a ?? 10, sm); v.y += aeWiggle(tt, k.f ?? 8, k.a ?? 10, sm + 1); v.r += aeWiggle(tt, k.f ?? 8, k.ar ?? 3, sm + 2) / .3;
  }
  if (op.bob) { const k = op.bob === true ? {} : op.bob, f = ((lt + (k.fase ?? 0)) / (k.per ?? .3)) % 2, tri = f < 1 ? f : 2 - f; v.y -= (k.a ?? 12) * E.inOut(tri); }
  if (op.desliza) v.x -= op.desliza * Math.max(0, lt - (op.entra ? (op.entra._t ?? 0) : 0));
  return v;
};
// depois do eaAplica: degrau (giro Y em holds) e revela (máscara de papel rasgado no passo de 2 quadros)
function avPos(S, c) {
  const lt = c.lt;
  (S.pal ? S.pal.camadas : []).forEach((lay, i) => {
    const op = lay.op;
    if (op.degrau) {
      const k = op.degrau === true ? {} : op.degrau, n = Math.floor(lt / (k.passo ?? .26)), a = (k.a ?? 12) * avS(n * 7.1 + i);
      lay.inner.style.transformOrigin = '50% 60%'; lay.inner.style.transform = `perspective(1500px) rotateY(${a.toFixed(2)}deg)`;
    }
    if (op._revela) {
      // o 1º passo já mostra um pedaço (a cena nunca começa com a mesa vazia); antes de t a folha não existe
      const rv = op._revela, u = clamp((lt - rv.t) / rv.d), st = Math.min(rv.passos, Math.floor(u * rv.passos + 1e-6) + 1);
      lay.inner.style.clipPath = u >= 1 || st >= rv.passos ? '' : lt < rv.t ? avRasgo(0) : avRasgo(st / rv.passos, rv.de, i * 13 + st);
    }
  });
}
// polígono de papel rasgado cobrindo a fração p a partir do lado 'de' (borda irregular sorteada por passo)
function avRasgo(p, de = 'esq', sem = 0) {
  if (p <= 0) return 'polygon(0 0, 0 0, 0 0)';
  const n = 9, ed = [];
  for (let j = 0; j <= n; j++) ed.push([j / n * 100, clamp(p * 112 - 6 + avS(sem + j * 1.7) * 9, 0, 100)]);
  const pt = ([a, b]) => ({ esq: `${b.toFixed(1)}% ${a.toFixed(1)}%`, dir: `${(100 - b).toFixed(1)}% ${a.toFixed(1)}%`, cima: `${a.toFixed(1)}% ${b.toFixed(1)}%`, baixo: `${a.toFixed(1)}% ${(100 - b).toFixed(1)}%` })[de];
  const ini = { esq: '0% 0%', dir: '100% 0%', cima: '0% 0%', baixo: '0% 100%' }[de], fim = { esq: '0% 100%', dir: '100% 100%', cima: '100% 0%', baixo: '100% 100%' }[de];
  return `polygon(${[ini, ...ed.map(pt), fim].join(', ')})`;
}
// retângulo do mundo a partir de frações da imagem de uma camada: avRel(lay, [x0, y0, x1, y1]) -> {x, y, w, h} (centro)
function avRel(lay, f) {
  const x0 = parseFloat(lay.inner.style.left), y0 = parseFloat(lay.inner.style.top);
  return { x: x0 + (f[0] + f[2]) / 2 * lay.w, y: y0 + (f[1] + f[3]) / 2 * lay.h, w: (f[2] - f[0]) * lay.w, h: (f[3] - f[1]) * lay.h };
}

// ---------- 4. tipografia ----------
// avTexto(par, S, c, spec): a fala como tipografia. par = r (FIXO na tela, padrão: não anda nem borra) ou o L de uma camada (no mundo).
// spec: {txt, t, d, ws: [tempo de cada palavra], modo, x, y, s, fam, peso, estilo, cor, alinha, larg, lh, track, sombra, css, sai, z,
//        cps (digita), apaga (tempo: apaga de trás para frente), caixa (cor da caixa da seleção), de/ate/fmt/pre/suf (contador), pop}
//  'offset'    as palavras acendem inteiras no lugar, na hora da fala (Range Selector Offset −100 → 100 do Stripe; ws ou espalhadas em d)
//  'aleatorio' as letras acendem em ordem sorteada que muda a cada passo (Randomize Order + Random Seed 0 → 32: nomes de marca do Stripe)
//  'digita'    máquina de escrever (~22 letras/s) com cursor de bloco piscando (Stripe, sobre vídeo); apaga = backspace a partir do tempo
//  'selecao'   caixa de seleção que alarga palavra por palavra com 4 alças nos cantos e brilho piscando (Stripe: 494 → 572 → 676 px)
//  'tremido'   cada letra treme no passo (Walkman/Bryan: posterizeTime(fps); seedRandom(índice + 456 + floor(time*fps)))
//  'mexido'    posição 4–6 px e giro 6° por letra no passo 8 (wiggly selector do tutorial Listerine)
//  'contador'  número rodando até o valor (odômetro do Twitter): de, ate, fmt 'pt' | casas, pre, suf
function avTexto(par, S, c, spec) {
  const L = avLook(), modo = spec.modo || 'offset', fam = spec.fam ?? 'Archivo';
  const pixel = fam === 'pixel', s_ = spec.s ?? 96, cor = spec.cor ?? '#fff';
  const box_ = el(par, 'div', `position:absolute;left:${spec.x ?? 540}px;top:${spec.y ?? 960}px;transform:translate(-50%,-50%);z-index:${spec.z ?? 3};` +
    `font-family:${pixel ? 'Archivo' : fam};font-weight:${spec.peso ?? 400};font-style:${spec.estilo ?? 'normal'};font-size:${s_}px;line-height:${spec.lh ?? 1.04};color:${cor};` +
    `text-align:${spec.alinha ?? 'center'};white-space:${spec.larg ? 'normal' : 'nowrap'};${spec.larg ? `width:${spec.larg}px;` : ''}letter-spacing:${spec.track ?? 0}em;` +
    `text-shadow:${spec.sombra ?? '0 4px 18px rgba(0,0,0,.45)'};pointer-events:none;${pixel ? 'filter:url(#avPixT);' : ''}${spec.css ?? ''}`);
  const t0 = eaT(c, spec.t ?? 0), d = spec.d ?? .6, sai = spec.sai !== undefined ? eaT(c, spec.sai) : null, fps = spec.fps ?? (modo === 'mexido' ? 8 : S.fps ?? L.fps);
  const txt = String(spec.txt ?? ''), palavras = txt.split(' ');
  const obj = { el: box_, visivel: false, janela: [t0, sai] };          // janela: a legenda sabe quando este texto cobre a fala
  let ws = null, chars = [], cursor = null, sel = null;
  if (modo === 'contador') {
    box_.style.fontVariantNumeric = 'tabular-nums';
  } else {
    ws = palavras.map((p, i) => {
      const w = el(box_, 'span', 'display:inline-block;white-space:pre;');
      if (['aleatorio', 'digita', 'tremido', 'mexido'].includes(modo)) [...p].forEach(ch => { const e = el(w, 'span', 'display:inline-block;white-space:pre;'); e.textContent = ch; chars.push(e); });
      else w.textContent = p;
      if (i < palavras.length - 1) { const sp = el(box_, 'span', 'white-space:pre;'); sp.textContent = ' '; if (chars.length && modo !== 'tremido' && modo !== 'mexido') chars.push(sp); }
      return w;
    });
  }
  const tw = spec.ws ? spec.ws.map(x => eaT(c, x)) : palavras.map((_, i) => t0 + i * d / Math.max(1, palavras.length));
  if (spec.som !== false) {         // som tátil do próprio texto (som: false desliga)
    if (modo === 'digita') cue(c, 'type', t0, { g: .32, n: Math.min(40, txt.length) });
    else if (modo === 'selecao') tw.forEach(t => cue(c, 'click', t, { g: .22 }));
    else if (modo === 'aleatorio') cue(c, 'glitch', t0, { g: .16, d: Math.min(.5, d) });
    else if (modo === 'contador') cue(c, 'tick', t0, { g: .3, n: 8 });
  }
  // digita: todas as letras já ocupam o lugar desde o 1º quadro (escondidas) e o cursor anda por cima, então a linha centrada não
  // se recentraliza a cada letra (a v1 fazia as letras andarem 10–15 px/q na régua texto_na_tela)
  if (modo === 'digita') cursor = el(box_, 'span', `position:absolute;left:0;top:0;width:.5em;height:.82em;background:${cor};`);
  if (modo === 'selecao') {
    const ac = spec.caixa ?? L.marca;
    sel = { box: el(box_, 'div', `position:absolute;left:0;top:-8%;height:116%;width:0;border:3px solid ${ac};box-shadow:0 0 18px ${ac}, inset 0 0 12px ${ac}55;pointer-events:none;`), alcas: [], ac, x0: 0, w0: 0 };
    for (let k = 0; k < 4; k++) sel.alcas.push(el(box_, 'div', `position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;background:#fff;border:3px solid ${ac};`));
  }
  const fmt = v => {
    if (spec.fmt === 'pt' || spec.fmt === undefined) return Math.round(v).toLocaleString('pt-BR');
    return v.toFixed(spec.fmt).replace('.', ',');
  };
  obj.up = lt => {
    const on = lt >= t0 - 1e-6 && (sai === null || lt < sai);
    box_.style.display = on ? '' : 'none'; obj.visivel = on;
    if (!on) return;
    const passo = Math.floor(lt * fps + 1e-6);
    if (modo === 'contador') {
      const q = AV_C.snap(clamp((avPost(lt, fps) - t0) / d));
      box_.textContent = (spec.pre ?? '') + fmt(lerp(spec.de ?? 0, spec.ate ?? 0, q)) + (spec.suf ?? '');
      return;
    }
    if (modo === 'offset' || modo === 'selecao' || modo === 'tremido' || modo === 'mexido') {
      let ult = -1;
      ws.forEach((w, i) => { const v = lt >= tw[i] - 1e-6; w.style.visibility = v ? 'visible' : 'hidden'; if (v) ult = i;
        if (spec.pop && v) { const u = clamp((lt - tw[i]) / .12); w.style.transform = `scale(${lerp(1.14, 1, E.out(u)).toFixed(3)})`; } });
      obj.visivel = ult >= 0;
      if (modo === 'selecao' && ult >= 0) {
        const a = ws[0], z = ws[ult], x0 = a.offsetLeft - 18, x1 = z.offsetLeft + z.offsetWidth + 18;
        // sem estado (o render roda em 12 processos, cada um começando no meio): a caixa sai da largura da palavra anterior
        const w0 = ult > 0 ? ws[ult - 1].offsetLeft + ws[ult - 1].offsetWidth + 18 - x0 : 0;
        const tU = tw[ult], u = AV_C.snap(clamp((lt - tU) / .18)), xs = x0, wd = lerp(w0, x1 - x0, u);
        sel.box.style.left = `${xs.toFixed(1)}px`; sel.box.style.width = `${wd.toFixed(1)}px`;
        const H_ = box_.offsetHeight, y0 = -.08 * H_, y1 = 1.08 * H_;
        [[xs, y0], [xs + wd, y0], [xs, y1], [xs + wd, y1]].forEach(([x, y], k) => { sel.alcas[k].style.left = `${x.toFixed(1)}px`; sel.alcas[k].style.top = `${y.toFixed(1)}px`; });
        const pisca = lt - tU < .3 ? (avR(passo * 3.3) > .45 ? 1 : .35) : 1;
        sel.box.style.opacity = pisca; sel.box.style.borderColor = lt - tU < .3 && avR(passo * 1.9) > .6 ? '#fff' : sel.ac;
      }
      if (modo === 'tremido' || modo === 'mexido') {
        const amp = modo === 'mexido' ? 5 : 2.4, rot = modo === 'mexido' ? 6 : 2.2;
        chars.forEach((e, j) => { const sd = j + 456 + passo * 31; e.style.transform = `translate(${(avS(sd) * amp).toFixed(1)}px,${(avS(sd + .5) * amp).toFixed(1)}px) rotate(${(avS(sd + .3) * rot).toFixed(1)}deg)`; });
      }
      return;
    }
    if (modo === 'aleatorio') {
      const N = chars.length, p = clamp((avPost(lt, fps) - t0) / d), k = Math.round(p * N);
      const ord = chars.map((_, j) => [avR(j * 7.3 + (p < 1 ? passo : 0) * 1.91), j]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
      const vis = new Set(ord.slice(0, k));
      chars.forEach((e, j) => { e.style.visibility = p >= 1 || vis.has(j) ? 'visible' : 'hidden'; });
      obj.visivel = k > 0;
      return;
    }
    if (modo === 'digita') {
      const cps = spec.cps ?? 22, N = chars.length, ap = spec.apaga !== undefined ? eaT(c, spec.apaga) : null;
      let k = Math.min(N, Math.floor((lt - t0) * cps + 1e-6));
      if (ap !== null && lt >= ap) k = Math.max(0, N - Math.floor((lt - ap) * cps * 1.6 + 1e-6));
      chars.forEach((e, j) => { e.style.visibility = j < k ? 'visible' : 'hidden'; });
      const ref = chars[Math.max(0, k - 1)];
      if (ref) { cursor.style.left = `${(k > 0 ? ref.offsetLeft + ref.offsetWidth : ref.offsetLeft) + s_ * .06}px`; cursor.style.top = `${ref.offsetTop + ref.offsetHeight * .1}px`; }
      const parado = k >= N || (ap !== null && lt >= ap && k <= 0);
      cursor.style.opacity = parado ? (Math.floor(lt * 2.2) % 2 ? 0 : 1) : 1;
      obj.visivel = true;
    }
  };
  (S.txts = S.txts || []).push(obj);
  return obj;
}
// palavra gigante como CAMADA (atrás do assunto: "$8 Billion" em Bowlby One SC atrás dos CEOs do Stripe). Use em camadas:
//   {...avGigante('JACK', {s: 360}), x: 540, y: 760, p: .9, entra: {k: 'sobe', t: ...}} — ponha ANTES do recorte na lista
function avGigante(txt, o = {}) {
  const s_ = o.s ?? 330, fam = o.fam ?? 'Archivo', peso = o.peso ?? 400;
  const w = Math.ceil(eaLarg(txt, s_, fam, peso, o.estilo ?? 'normal') * (1 + (o.track ?? 0)) + 40), h = Math.ceil(s_ * 1.18);
  const e = document.createElement('div');
  e.style.cssText = `position:absolute;width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;white-space:nowrap;` +
    `font-family:${fam};font-weight:${peso};font-style:${o.estilo ?? 'normal'};font-size:${s_}px;line-height:1;color:${o.cor ?? '#fff'};letter-spacing:${o.track ?? 0}em;` +
    (o.contorno ? `-webkit-text-stroke:${o.contorno};color:transparent;` : '') + (o.css ?? '');
  e.textContent = txt;
  return { el: e, w, h, vida: o.vida ?? 'palavra' };
}

// ---------- 5. rabiscos à mão (comp "Callouts" do Walkman, 12 q/s) ----------
// avRisco(par, S, c, spec): o traço desenha no passo 12 (trim path + posterizeTime(12)) e FERVE (a forma é sorteada de novo a cada passo,
// 2–3 px), como desenho quadro a quadro. Fixo na tela por padrão; spec.camada = índice em S.lay (+ rel: [x0, y0, x1, y1] da imagem) = no mundo.
// spec: {tipo, t, d, x, y, w, h, cor, larg, fps, sai, ferve, ang, a}
//  'circulo' (a volta passa do ponto) | 'sublinha' (ondulado) | 'seta' (curva + ponta; ang gira) | 'marca' (marca-texto em multiply,
//  borda irregular, abre da esquerda) | 'xis' | 'rabisco' (vai-e-vem) | 'caixa' | 'ondas' (anéis 0 → 356 px, traço 7 → 3: doppler do Walkman)
//  | 'interroga' (?)
function avRisco(par, S, c, spec) {
  const L = avLook(), tipo = spec.tipo || 'circulo', fps = spec.fps ?? 12, cor = spec.cor ?? (tipo === 'marca' ? L.marca : L.acento);
  const w = spec.w ?? 300, h = spec.h ?? (tipo === 'sublinha' ? 50 : tipo === 'marca' ? 90 : 220), lg = spec.larg ?? (tipo === 'ondas' ? 7 : 9);
  const svg = svgAbs(par, (spec.x ?? 540) - w / 2, (spec.y ?? 960) - h / 2, w, h, `z-index:${spec.z ?? 3};pointer-events:none;` +
    (tipo === 'marca' ? 'mix-blend-mode:multiply;' : '') + (spec.ang ? `transform:rotate(${spec.ang}deg);transform-origin:50% 50%;` : ''));
  const t0 = eaT(c, spec.t ?? 0), d = spec.d ?? (tipo === 'ondas' ? 1.1 : tipo === 'marca' ? .3 : .42), sai = spec.sai !== undefined ? eaT(c, spec.sai) : null;
  const fv = spec.ferve ?? 2.4, op = spec.a ?? 1;
  if (spec.som !== false) cue(c, tipo === 'marca' ? 'marker' : tipo === 'ondas' ? 'ping' : 'pencil', t0, { g: tipo === 'ondas' ? .16 : .3, d: Math.max(.2, d) });
  const novo = (attrs) => sv(svg, 'path', { fill: 'none', stroke: cor, 'stroke-width': lg, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...attrs });
  const P = [];
  if (tipo === 'marca') P.push(sv(svg, 'path', { fill: cor, opacity: .85 }));
  else if (tipo === 'ondas') for (let k = 0; k < 3; k++) P.push(sv(svg, 'circle', { cx: w / 2, cy: h / 2, r: 0, fill: 'none', stroke: cor, 'stroke-width': lg }));
  else { P.push(novo({})); if (tipo === 'xis' || tipo === 'seta') P.push(novo({})); }
  const J = (sd, k) => avS(sd * 9.7 + k * 3.1) * fv;
  const linha = pts => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
  const forma = sd => {
    const m = lg + fv + 2;
    if (tipo === 'circulo') { const pts = []; for (let k = 0; k <= 52; k++) { const a = -2.0 + k / 52 * Math.PI * 2 * 1.12, rr = 1 + .035 * Math.sin(3 * a + sd) ; pts.push([w / 2 + Math.cos(a) * (w / 2 - m) * rr + J(sd, k), h / 2 + Math.sin(a) * (h / 2 - m) * rr + J(sd, k + 99)]); } return [linha(pts)]; }
    if (tipo === 'sublinha') { const pts = []; for (let k = 0; k <= 26; k++) { const u = k / 26; pts.push([m + u * (w - 2 * m), h / 2 + Math.sin(u * Math.PI * 2.5) * h * .16 + J(sd, k)]); } return [linha(pts)]; }
    if (tipo === 'rabisco') { const pts = []; for (let k = 0; k <= 9; k++) pts.push([m + (k % 2 ? w - 2 * m : 0) + J(sd, k), m + k / 9 * (h - 2 * m) + J(sd, k + 50)]); return [linha(pts)]; }
    if (tipo === 'xis') return [linha([[m + J(sd, 1), m + J(sd, 2)], [w - m + J(sd, 3), h - m + J(sd, 4)]]), linha([[w - m + J(sd, 5), m + J(sd, 6)], [m + J(sd, 7), h - m + J(sd, 8)]])];
    if (tipo === 'caixa') return [linha([[m, m], [w - m, m + 4], [w - m - 3, h - m], [m + 2, h - m - 3], [m + 1, m + 6]].map((p, k) => [p[0] + J(sd, k), p[1] + J(sd, k + 20)]))];
    if (tipo === 'seta') {
      const x0 = m, y0 = h - m, x1 = w - m, y1 = m + h * .1, cx = w * .3, cy = m;
      const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, q = u * u; pts.push([a * x0 + b * cx + q * x1 + J(sd, k), a * y0 + b * cy + q * y1 + J(sd, k + 40)]); }
      const ang = Math.atan2(y1 - pts[17][1], x1 - pts[17][0]), Lc = Math.min(w, h) * .2;
      return [linha(pts), linha([[x1 - Math.cos(ang - .5) * Lc, y1 - Math.sin(ang - .5) * Lc], [x1, y1], [x1 - Math.cos(ang + .5) * Lc, y1 - Math.sin(ang + .5) * Lc]])];
    }
    if (tipo === 'interroga') {
      const k = Math.min(w, h * .62) / 100, cx = w / 2, top = (h - 160 * k) / 2;
      const pts = []; for (let j = 0; j <= 24; j++) { const a = Math.PI * (1.15 - j / 24 * 1.45); pts.push([cx + Math.cos(a) * 38 * k + J(sd, j), top + 40 * k - Math.sin(a) * 38 * k + J(sd, j + 30)]); }
      pts.push([cx + J(sd, 70), top + 112 * k]);
      return [linha(pts) + ` M${(cx + J(sd, 71)).toFixed(1)} ${(top + 148 * k).toFixed(1)} L${(cx + .5).toFixed(1)} ${(top + 150 * k).toFixed(1)}`];
    }
    if (tipo === 'marca') {
      const top = [], bot = []; for (let k = 0; k <= 12; k++) { const x = k / 12 * w; top.push([x, h * .14 + J(sd, k) * 1.6]); bot.push([w - x, h * .86 + J(sd, k + 30) * 1.6]); }
      return [linha([...top, ...bot]) + ' Z'];
    }
    return [''];
  };
  let passoAnt = -1;
  const obj = { visivel: false, el: svg };
  obj.up = lt => {
    const on = lt >= t0 && (sai === null || lt < sai);
    svg.style.display = on ? '' : 'none'; obj.visivel = on; if (!on) return;
    const lp = avPost(lt, fps), passo = Math.floor(lt * fps + 1e-6), p = clamp((lp - t0) / d);
    svg.style.opacity = op * (sai !== null ? 1 - clamp((lt - sai + .12) / .12) : 1);
    if (tipo === 'ondas') {
      P.forEach((cc, k) => { const u = clamp((lp - t0 - k * d * .22) / (d * .78)), R = Math.min(w, h) / 2 - 4;
        cc.setAttribute('r', (R * E.out(u)).toFixed(1)); cc.setAttribute('stroke-width', lerp(lg, 3, u).toFixed(1)); cc.setAttribute('opacity', (u > 0 ? 1 - u : 0).toFixed(3)); });
      return;
    }
    if (passo !== passoAnt) { const f = forma(spec.ferve === 0 ? 1 : passo); P.forEach((e, k) => { e.setAttribute('d', f[k] ?? ''); e._len = e.getTotalLength ? e.getTotalLength() : 0; }); passoAnt = passo; }
    if (tipo === 'marca') { svg.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(1)}% 0 0)`; return; }
    if (P.length === 2 && tipo === 'xis') { avTraco(P[0], clamp(p * 2)); avTraco(P[1], clamp(p * 2 - 1)); return; }
    if (P.length === 2 && tipo === 'seta') { avTraco(P[0], clamp(p / .8)); avTraco(P[1], clamp((p - .8) / .2)); return; }
    avTraco(P[0], p);
  };
  (S.riscos = S.riscos || []).push(obj);
  return obj;
}
function avTraco(path, p) {
  const L_ = path._len || 1;
  path.style.strokeDasharray = `${L_.toFixed(1)} ${(L_ + 10).toFixed(1)}`;
  path.style.strokeDashoffset = (L_ * (1 - p)).toFixed(1);
  path.style.visibility = p > .002 ? 'visible' : 'hidden';
}

// ---------- 6. efeitos de cena ----------
// holofote (CC Spotlight / cone 91 → 24 do Walkman / spotlight do Netflix): escurece tudo fora de uma elipse que fecha no assunto
// {t, d: .6, x, y, r0: 900, r1: 300, k: 1.15 (alongamento vertical), a: .82, sai}
function avHolofote(par, S, c, o) {
  const e = el(par, 'div', 'position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;');
  const t0 = eaT(c, o.t ?? 0), d = o.d ?? .6, sai = o.sai !== undefined ? eaT(c, o.sai) : null;
  (S.efx = S.efx || []).push(lt => {
    if (lt < t0 || (sai !== null && lt > sai + .2)) { e.style.opacity = 0; return; }
    const q = AV_C.snap(clamp((lt - t0) / d)), rr = lerp(o.r0 ?? 900, o.r1 ?? 300, q), fo = sai !== null ? 1 - clamp((lt - sai) / .2) : 1;
    e.style.opacity = (clamp((lt - t0) / .12) * fo).toFixed(3);
    e.style.background = `radial-gradient(ellipse ${rr.toFixed(0)}px ${(rr * (o.k ?? 1.15)).toFixed(0)}px at ${o.x ?? 540}px ${o.y ?? 900}px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 58%, rgba(0,0,0,${o.a ?? .82}) 100%)`;
  });
  return e;
}
// estouro de formas (logo burst do Stripe): 5 formas saem do centro em 0,08 s e derivam girando por ~3,5 s, com anel de flash
// {t, x, y, n: 5, cores, dist: 380, flash (cor do anel), tam}
function avEstouro(par, S, c, o) {
  const L = avLook(), n = o.n ?? 5, t0 = eaT(c, o.t ?? 0), cx = o.x ?? 540, cy = o.y ?? 900, cores = o.cores ?? L.cores;
  const svg = svgAbs(par, 0, 0, 1080, 1920, 'z-index:3;pointer-events:none;');
  const tipos = ['circle', 'rect', 'tri', 'star', 'ring'];
  const it = Array.from({ length: n }, (_, i) => {
    const tp = tipos[i % 5], s_ = (o.tam ?? 50) + avR(i + 9) * 40, cr = cores[i % cores.length];
    let e;
    if (tp === 'circle') e = sv(svg, 'circle', { r: s_ / 2, fill: cr });
    else if (tp === 'rect') e = sv(svg, 'rect', { x: -s_ / 2, y: -s_ / 2, width: s_, height: s_, fill: cr });
    else if (tp === 'tri') e = sv(svg, 'polygon', { points: `0,${-s_ * .6} ${s_ * .55},${s_ * .4} ${-s_ * .55},${s_ * .4}`, fill: cr });
    else if (tp === 'star') { const pts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? s_ * .25 : s_ * .6; pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`); } e = sv(svg, 'polygon', { points: pts.join(' '), fill: cr }); }
    else e = sv(svg, 'circle', { r: s_ / 2, fill: 'none', stroke: cr, 'stroke-width': s_ * .2 });
    return { e, a: (i / n) * Math.PI * 2 + avS(i + 1) * .45 - Math.PI / 2, dist: (o.dist ?? 380) * (.75 + .5 * avR(i + 3)), rot: avS(i + 5) * 200 };
  });
  const anel = sv(svg, 'circle', { cx, cy, r: 10, fill: 'none', stroke: o.flash ?? L.marca, 'stroke-width': 12, opacity: 0 });
  (S.efx = S.efx || []).push(lt => {
    const u = lt - t0; if (u < 0) { svg.style.display = 'none'; return; } svg.style.display = '';
    it.forEach(k => {
      const q = clamp(u / .08), dr = q * k.dist + Math.max(0, u - .08) * 20, fade = 1 - clamp((u - 3.0) / .5);
      k.e.setAttribute('transform', `translate(${(cx + Math.cos(k.a) * dr).toFixed(1)} ${(cy + Math.sin(k.a) * dr).toFixed(1)}) rotate(${(k.rot * clamp(u / 3.5)).toFixed(1)}) scale(${q.toFixed(3)})`);
      k.e.setAttribute('opacity', fade.toFixed(3));
    });
    const qa = clamp(u / .22); anel.setAttribute('r', (20 + 420 * E.out(qa)).toFixed(1)); anel.setAttribute('opacity', (qa > 0 ? 1 - qa : 0).toFixed(3)); anel.setAttribute('stroke-width', (14 * (1 - qa) + 1).toFixed(1));
  });
  return svg;
}
// fila de figuras (n pessoas em grade que pulam uma a uma a cada 'passo'; a 'destaque' menor e colorida): "caçula de 10 irmãos"
// {t, n: 10, porLinha: 5, x, y, esp: 170, tam: 120, passo: .067, destaque: n-1, cor, corDest, escDest: .78}
function avFila(par, S, c, o) {
  const L = avLook(), n = o.n ?? 10, pl = o.porLinha ?? 5, t0 = eaT(c, o.t ?? 0), passo = o.passo ?? .067, esp = o.esp ?? 172, tam = o.tam ?? 120;
  const linhas = Math.ceil(n / pl), dest = o.destaque ?? n - 1, cx = o.x ?? 540, cy = o.y ?? 900, ey = tam * 2.15;
  const svg = svgAbs(par, 0, 0, 1080, 1920, `z-index:${o.z ?? 2};pointer-events:none;overflow:visible;`);
  const figs = Array.from({ length: n }, (_, i) => {
    const li = Math.floor(i / pl), co = i % pl, nl = Math.min(pl, n - li * pl);
    const x = cx + (co - (nl - 1) / 2) * esp, y = cy + (li - (linhas - 1) / 2) * ey, k = i === dest ? (o.escDest ?? .78) : 1, cr = i === dest ? (o.corDest ?? L.acento) : (o.cor ?? L.papel);
    const g = sv(svg, 'g', {}), s_ = tam * k, base = tam;
    sv(g, 'circle', { cx: 0, cy: -s_ * 1.32, r: s_ * .36, fill: cr, stroke: '#141414', 'stroke-width': 5 });
    sv(g, 'path', { d: `M${-s_ * .52} ${-s_ * .78 + s_ * .2} Q${-s_ * .52} ${-s_ * .86} ${-s_ * .3} ${-s_ * .86} L${s_ * .3} ${-s_ * .86} Q${s_ * .52} ${-s_ * .86} ${s_ * .52} ${-s_ * .58} L${s_ * .44} 0 L${-s_ * .44} 0 Z`, fill: cr, stroke: '#141414', 'stroke-width': 5, 'stroke-linejoin': 'round' });
    return { g, x, y: y + base * .5, k };
  });
  (S.efx = S.efx || []).push(lt => {
    const lp = avPost(lt, 15);
    figs.forEach((f, i) => { const u = clamp((lp - t0 - i * passo) / .2), s_ = u <= 0 ? 0 : E.back(u);
      f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${s_.toFixed(3)})`); f.g.setAttribute('opacity', u > 0 ? 1 : 0); });
  });
  return { svg, figs, pos: i => ({ x: figs[i].x, y: figs[i].y - tam * figs[i].k * .7 }) };
}
// folhas de calendário virando para cima, uma a cada 'passo' (o ritmo de 3 quadros do tutorial Listerine), até sobrar o mês de baixo
// {t, passo: .1, x, y, w, h | rel + camada, meses: [...], papel, tinta}
function avFolhas(par, S, c, o) {
  const t0 = eaT(c, o.t ?? 0), passo = o.passo ?? .1, w = o.w ?? 700, h = o.h ?? 760;
  const meses = o.meses ?? ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO'];
  const box_ = el(par, 'div', `position:absolute;left:${(o.x ?? 540) - w / 2}px;top:${(o.y ?? 900) - h / 2}px;width:${w}px;height:${h}px;perspective:2000px;z-index:${o.z ?? 2};pointer-events:none;`);
  const grade = `repeating-linear-gradient(90deg, rgba(60,40,20,.28) 0 3px, transparent 3px ${(w / 7).toFixed(1)}px), repeating-linear-gradient(0deg, rgba(60,40,20,.28) 0 3px, transparent 3px ${(h * .62 / 5).toFixed(1)}px)`;
  const tinta = o.tinta ?? '#2a2018';
  const fol = meses.map((m, i) => {
    const f = el(box_, 'div', `position:absolute;inset:0;transform-origin:50% 0%;background:${o.papel ?? 'linear-gradient(180deg, #efe2c6, #ddc79c)'};` +
      `box-shadow:0 8px 26px rgba(0,0,0,.35), inset 0 0 60px rgba(120,80,30,.25);z-index:${meses.length - i};` +
      `font-family:TimesInv;font-weight:700;font-size:${(w * .1).toFixed(0)}px;letter-spacing:.06em;color:${tinta};text-align:center;padding-top:${(h * .1).toFixed(0)}px;`);
    f._m = el(f, 'span', ''); f._m.textContent = m;
    f._g = el(f, 'div', `position:absolute;left:6%;right:6%;bottom:6%;height:62%;background:${grade};`);
    return f;
  });
  (S.efx = S.efx || []).push(lt => {
    fol.forEach((f, i) => { const u = clamp((lt - t0 - i * passo) / (passo * 1.5)), a = -160 * E.in(u), costas = a < -90;
      f.style.transform = `rotateX(${a.toFixed(1)}deg)`; f.style.opacity = u >= 1 ? 0 : 1; f.style.filter = `brightness(${(1 - .4 * u).toFixed(3)})`;
      f._m.style.visibility = a < -4 ? 'hidden' : 'visible'; f._g.style.opacity = costas ? 0 : 1; });
    // o mês some quando a folha começa a subir (letra voando não se lê: régua texto_na_tela) e o verso é papel liso
    box_.style.display = lt > t0 + meses.length * passo + passo * 1.6 ? 'none' : '';
  });
  return box_;
}
// linhas de vento em screen (viagem do Walkman: overlay de vento em add + turbulência)
function avVento(par, S, c, o = {}) {
  const cv = el(par, 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;z-index:2;pointer-events:none;mix-blend-mode:screen;');
  cv.width = 540; cv.height = 960;
  const x = cv.getContext('2d'), n = o.n ?? 16, v = o.vel ?? 2400, a = o.a ?? .3;
  (S.efx = S.efx || []).push(lt => {
    x.clearRect(0, 0, 540, 960);
    for (let i = 0; i < n; i++) {
      const y = avR(i) * 960, len = 60 + avR(i + 3) * 160, px = ((avR(i + 7) * 1400 - lt * v * (.6 + avR(i + 5) * .8) / 2) % 700 + 700) % 700 - 80;
      const g = x.createLinearGradient(px, 0, px + len, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(px, y, len, 1.4 + avR(i + 11) * 1.6);
    }
  });
  return cv;
}

// ---------- 7. cenas ----------
// cenaAV(beats, o): um MUNDO em camadas com tudo da skill.
// o = {tr, trDur, lead, fps (passo da cena; padrão o do look; vídeo real segue a 30 q/s), camFps (passo só da câmera),
//      fundo, fundoOp {p, fx, fy, folga, repete, from, rate, pb, foco, cor (filtro só do fundo)}, fundoCor, cor (filtro do MUNDO inteiro: 'frio', 'quente' ou CSS),
//      camadas: [{fonte | el, x, y, w | h, p, entra, sai, ate, vida, vida3d, foco, apaga, atras, sombra, borda, contorno, pb, tremor, bob, degrau,
//                 revela, desliza, fps, opacidade, escala, filtro, base}],
//      cam: {base, nulos, chega, sai, mao, espiral, grua} (ou c => {...}),
//      textos: [spec do avTexto (+ camada, rel)], riscos: [spec do avRisco (+ camada, rel)], holofote, estouros: [...],
//      impactos: [t], flex: [t], estalos: [t | [t, d]], flashes: [t] (efeitos no corte de câmera inteiro, no tempo da cena),
//      flash / onda (os da edit-earn: overlay branco + onda turbulenta), pb (tempo: o mundo vira P&B), look ('filme' | 'vhs' só nesta cena),
//      legenda (false = a cena já escreve a fala), legOff [[t0, t1]], legY, legFundo (true = véu escuro atrás da legenda em fundo claro;
//      string = background CSS), enfase ['palavra'] (palavras em serifa itálica na legenda),
//      sons [[tipo, t, {g, d}]], boom, drop, casado (sem saída de câmera), presenter, build(r, S, c), update(S, c),
//      semPulso (true = corte limpo, sem o pulso de desfoque do look: use no corte entre dois enquadramentos do MESMO print/foto; o
//      borrão de .12 s fazia o foco vagar pelo texto e a régua de leitura contava um salto no corte)}
const AV_FX = [];          // efeitos de quadro inteiro no tempo absoluto: {t, k: 'imp' | 'flex' | 'estalo' | 'flash', d}
const AV_ENFASE = new Set();
// o swish de TODO corte já vem da trilha_earn.py (lê os 'eaCorte'): aqui só a textura própria de cada passagem
const AV_SOM_TR = {
  'av:formas': [['pop', .1, { g: .3 }], ['pop', .24, { g: .22 }]], 'av:pagina': [['paper', 0, { g: .5 }], ['flap', .1, { g: .3 }]],
  'av:queima': [['fogo', 0, { g: .5, d: 1 }]], 'av:pixel': [['glitch', 0, { g: .34, d: .4 }]],
  'av:flex': [['glitch', 0, { g: .4, d: .25 }]], 'av:impacto': [['subhit', 0, { g: .5 }]],
  'av:espiral': [['ar', 0, { g: .35, d: .45 }]], 'av:estalo': [['shutter', 0, { g: .38 }], ['click', .07, { g: .22 }]],
};
function avCamadaCena(pal, S, c, op0) {
  const op = { ...op0 };
  if (op.entra) op.entra = { ...op.entra, _t: eaT(c, op.entra.t) ?? 0 };
  if (op.sai) op.sai = { ...op.sai, _t: eaT(c, op.sai.t) };
  if (op.foco) op._foco = op.foco.map(([t, v]) => [eaT(c, t), v]);
  if (op.ate !== undefined) op._ate = eaT(c, op.ate);
  if (op.revela) op._revela = { d: .27, passos: 4, de: 'esq', ...op.revela, t: eaT(c, op.revela.t) ?? 0 };
  if (op.apaga) op._apaga = { a: .3, d: .25, foco: 4, ...op.apaga, t: eaT(c, op.apaga.t) };
  if (op.degrau) op.vida3d = false;
  op.base = [op.base || '', avFiltroCamada(op, op.h ?? 1000)].join(' ').trim();
  const lay = eaCamada(pal, S, op.fonte, op);
  const sb = op.sombra;
  if (sb === 'chao' || (sb && sb.tipo === 'chao')) avSombraChao(lay, typeof sb === 'object' ? sb : {});
  if (op.atras && S.fundo) pal.el.insertBefore(lay.L, S.fundo.L.nextSibling);
  return lay;
}
function avSomPassagem(c, tr) { (AV_SOM_TR[tr] || []).forEach(([k, t, o]) => cue(c, k, Math.max(0, t), o)); }
// tempo absoluto de 'Bxx' (começo do beat) ou 'Bxx:palavra' (começo da palavra, prefixo sem acento como o c.w do motor)
function avTempo(ref) {
  const [id, k] = String(ref).split(':'), b = TIMING.beats.find(x => x.id === id);
  if (!b) { console.warn(`edit-avancada: beat ${id} não existe`); return 0; }
  if (!k) return b.start;
  const w = avPalavra(id, k);
  if (!w) { console.warn(`edit-avancada: '${k}' não está em ${id} (${b.text})`); return b.start; }
  return w.s;
}
function cenaAV(beats, o = {}) {
  // em: 'Bxx:palavra' = a cena começa NA PALAVRA (corte no meio do beat; pre = quanto antes da palavra, padrão 0,08 s).
  // A cena seguinte pode repetir o beat: cenaAV(['B02'], {em: 'B02:uisque'}) depois de cenaAV(['B02'], {...}).
  const lead = o.em ? avTempo(beats[0]) - (avTempo(o.em) - (o.pre ?? LEAD)) : o.lead;
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead, trDur: o.trDur, trCor: o.trCor, trAng: o.trAng, presenter: o.presenter, semPulso: o.semPulso,
    build(r, S, c) {
      const L = avLook();
      S.av = o; S.look = o.look; S.legenda = o.legenda ?? true; S.fps = o.fps ?? L.fps; S.legY = o.legY; S.legFundo = o.legFundo; S.ac = o.ac;
      S.legOff = (o.legOff || []).map(([a, b]) => [eaT(c, a), eaT(c, b)]);
      (o.enfase || []).forEach(w => AV_ENFASE.add(norm(w)));
      const pal = eaPalco(r, S, { cor: o.cor, fundoCor: o.fundoCor ?? L.fundo });
      if (o.fundo) {
        const fo = o.fundoOp || {};
        const f = eaCamada(pal, S, o.fundo, { cobre: true, p: fo.p ?? .85, fx: fo.fx ?? .5, fy: fo.fy ?? .5, folga: fo.folga, vida: false, x: 540, y: 960,
          iw: fo.iw, ih: fo.ih, from: fo.from, rate: fo.rate, repete: fo.repete ?? !String(o.fundo).startsWith('clip:'),
          base: [avFiltroCamada(fo), fo.cor ? eaCor(fo.cor) : ''].join(' ').trim() });       // fundoOp.cor escurece SÓ o fundo (texto/cartões por cima ficam inteiros)
        if (fo.foco) { f.op.foco = true; f.op._foco = fo.foco.map(([t, v]) => [eaT(c, t), v]); }
        S.fundo = f;
      }
      S.txts = S.txts || []; S.riscos = S.riscos || []; S.efx = S.efx || [];
      const TX = o.textos ? eaT(c, o.textos) : [];
      // texto atras: true = dentro do palco ANTES das camadas, então fica atrás do recorte (o "$8 Billion" atrás dos CEOs do Stripe)
      TX.filter(sp => sp.atras).forEach(sp => avTexto(pal.el, S, c, { z: 0, ...sp }));
      S.lay = (o.camadas || []).map(op0 => avCamadaCena(pal, S, c, op0));
      const cc = typeof o.cam === 'function' ? o.cam(c) : (o.cam || {});
      S.camF = avCam(c, { sai: avSaiPadrao(c, o), ...cc });
      S.txts = S.txts || []; S.riscos = S.riscos || []; S.efx = S.efx || [];
      const onde = sp => {
        if (sp.camada === undefined) return { par: r, sp };
        const lay = S.lay[sp.camada]; if (!sp.rel) return { par: lay.L, sp };
        const q = avRel(lay, sp.rel); return { par: lay.L, sp: { ...sp, x: q.x, y: q.y, w: sp.w ?? q.w, h: sp.h ?? q.h } };
      };
      TX.filter(sp => !sp.atras).forEach(sp0 => { const { par, sp } = onde(sp0); avTexto(par, S, c, sp); });
      (o.riscos ? eaT(c, o.riscos) : []).forEach(sp0 => { const { par, sp } = onde(sp0); avRisco(par, S, c, sp); });
      if (o.holofote) avHolofote(r, S, c, o.holofote);
      if (o.janela && AS('av_janela')) {         // luz de janela em multiply derivando devagar (a sombra de folhas em multiply do Stripe)
        const jo = o.janela === true ? {} : o.janela, je = el(r, 'div', 'position:absolute;left:-90px;top:-90px;width:1260px;height:2100px;z-index:2;pointer-events:none;' +
          `background:url(${AS('av_janela').src}) center/cover;mix-blend-mode:multiply;opacity:${jo.a ?? .55};`);
        S.efx.push(lt => { je.style.transform = `translate(${aeWiggle(lt, .25, 40, 3).toFixed(1)}px,${aeWiggle(lt, .25, 30, 4).toFixed(1)}px) rotate(${jo.r ?? -8}deg)`; });
      }
      (o.estouros || []).forEach(e => avEstouro(r, S, c, e));
      [['impactos', 'imp'], ['flex', 'flex'], ['estalos', 'estalo'], ['flashes', 'flash']].forEach(([k, tipo]) => (o[k] ? eaT(c, o[k]) : []).forEach(x => {
        const t = eaT(c, Array.isArray(x) ? x[0] : x), d = Array.isArray(x) ? x[1] : undefined;
        AV_FX.push({ t: c.t0 + t, k: tipo, d });
        if (tipo === 'imp') EVENTS.push({ t: +(c.t0 + t).toFixed(3), type: 'eaHit' });          // o kick vem da trilha_earn.py
        if (tipo === 'flex') cue(c, 'glitch', Math.max(0, t - .02), { g: .32, d: .3 });
        if (tipo === 'estalo') cue(c, 'shutter', t, { g: .28 });
      }));
      S.tPB = o.pb !== undefined ? eaT(c, o.pb) : null;
      if (c.t0 > 0) { EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' }); avSomPassagem(c, o.tr); }
      if (o.drop) EVENTS.push({ t: +(c.t0 + (eaT(c, o.drop === true ? 0 : o.drop) ?? 0)).toFixed(3), type: 'eaDrop' });
      (o.sons ? eaT(c, o.sons) : []).forEach(([k, t, op]) => cue(c, k, eaT(c, t), op || {}));
      if (o.flash || o.onda) eaFlashOnda(r, S, c, o);
      if (o.build) o.build(r, S, c);
    },
    update(S, c0) {
      const c = eaPoster(c0, S.fps);
      const cam = S.camF(o.camFps ? avPost(c0.lt, o.camFps) : c.lt);
      eaAplica(S.pal, S, c, cam);
      avPos(S, c);
      let f = S._cor || '';
      if (S.tPB !== null) { const q = clamp((c.lt - S.tPB) / .25); if (q > 0) f += ` grayscale(${q.toFixed(3)}) contrast(${(1 + .2 * q).toFixed(3)})`; }
      if (cam._foco > .3) f += ` blur(${cam._foco.toFixed(1)}px)`;
      S.pal.el.style.filter = f.trim();
      S.txts.forEach(x => x.up(c.lt)); S.riscos.forEach(x => x.up(c.lt)); S.efx.forEach(fn => fn(c.lt, c));
      (S.upd || []).forEach(fn => fn(S, c));          // flash/onda e os componentes da edit-earn que se registram em S.upd
      if (o.flash || o.onda) eaOndaAplica(S, S.pal.el);
      if (o.update) o.update(S, c);
    },
  });
}
// viagem (Walkman: o avião de lado com os fundos trocando deserto → montanha → mar a cada 0,2–0,27 s): o sujeito fica PARADO no centro
// com o bob do passo, os fundos trocam secos com borrão direcional de 12 px andando para trás, linhas de vento e tremor de turbulência.
// avViagem(beats, {sujeito, sujOp {w, x, y, fx, fy, sombra, bob}, fundos: [src...], de (tempo da 1ª troca), passo: .23, vel: 260 (px/s; 0 = fundo
//   parado, para quem anda PARA DENTRO da imagem), borrao: false (sem o borrão lateral), vento: false, ...cenaAV})
function avViagem(beats, o = {}) {
  const fundos = o.fundos || [], passo = o.passo ?? .23;
  const tI = (c, i) => i === 0 ? 0 : eaT(c, o.de ?? 0) + (i - 1) * passo;
  return cenaAV(beats, {
    ...o, fundo: null,
    camadas: [
      ...fundos.map((src, i) => ({ fonte: src, cobre: true, p: .9, vida: false, repete: true, base: o.borrao === false ? '' : 'url(#avDirH)', desliza: o.vel ?? 260,
        entra: { k: 'corte', t: c => tI(c, i) }, ...(i < fundos.length - 1 ? { ate: c => tI(c, i + 1) } : {}), pb: o.pbFundos })),
      ...(o.sujeito ? [{ fonte: o.sujeito, w: 600, x: 540, y: 1010, vida: false, vida3d: false, bob: { a: 10, per: .28 }, sombra: 'chao', ...(o.sujOp || {}) }] : []),
      ...(o.camadas || []),
    ],
    build(r, S, c) { if (o.vento !== false) avVento(r, S, c, o.vento || {}); if (o.build) o.build(r, S, c); },
    cam: { mao: 14, chega: { r: 3, z: 1.06, d: .3 }, ...(o.cam || {}) },
  });
}
// apresentador em tela cheia (clipe 'clip:nome'): chegada curta de zoom, mão leve e a legenda doc por baixo. o = {from, cam, ac, ...cenaAV}
// Apresentador LIMPO (regra do Felipe em todas as skills): sem retícula/grunge/papel/persiana, grão e tremor mínimos.
function presAV(beats, clipe, o = {}) {
  return cenaAV(beats, { ...o, presenter: true, fundo: clipe, fundoOp: { repete: false, from: o.from, p: 1, folga: 1.04, ...(o.fundoOp || {}) },
    ac: { reticula: 0, grunge: 0, papel: 0, persiana: 0, linhas: 0, grao: .05, borda: 3, ca: .5, tremor: 1.5, flicker: .015, pulso: 6, ...(o.ac || {}) },
    cam: { chega: { r: 0, z: 1.1, d: .35 }, mao: 3, ...(o.cam || {}) } });
}

// ---------- 8. passagens ----------
// Com a cena velha visível (a edit-earn mantém a cena anterior viva até o fim da passagem, via eaDurTr):
//  'av:formas'  hexágono, pentágono, quadrado e triângulo coloridos crescem do centro (1–3 quadros de diferença) e o último CÍRCULO é a
//               matte que revela a cena nova (tutorial Listerine); .5 s
//  'av:pagina'  a cena velha vira como página presa na esquerda, com sombra (CC Page Turn do Twitter/Listerine, 0,31–0,45 s)
//  'av:queima'  a cena nova aparece por buracos queimando com borda de fogo (CC Burn Film 0 → 98 em ~1 s do Walkman), nascendo no meio; .9 s
//  'av:pixel'   mosaico crescendo na velha e diminuindo na nova (S_WipePixelate do Discord, ×40 no projeto); .5 s
//  'av:espiral' a velha gira −50° e mergulha com borrão; a nova chega girando 12° → 0 (espiral do Stripe); .45 s
// No corte (efeito de quadro inteiro, a cena velha some na hora):
//  'av:flex'    1–3 quadros de inversão + RGB separado + superexposição e um assentamento vertical com borrão (preset Flex do Stripe)
//  'av:impacto' tremor de 10 Hz com amplitude 0 → 20 → 0 px + brilho e borrão no mesmo envelope, 0,34 s (preset Impact do Stripe)
//  'av:estalo'  a cena nova pisca P&B/cor a cada 2 quadros por 0,4 s (as 5 cópias alternando cor do Stripe)
const AV_TR_DUR = { 'av:formas': .5, 'av:pagina': .45, 'av:queima': .9, 'av:pixel': .5, 'av:espiral': .45, 'av:flex': 0, 'av:impacto': 0, 'av:estalo': 0 };
const _avDurTr0 = eaDurTr;
eaDurTr = function (s) { const tr = s.tr || ''; return tr.startsWith('av:') ? (s.trDur ?? AV_TR_DUR[tr] ?? 0) : _avDurTr0(s); };
// quanto a cena fica na tela (a edit-earn usa para o vídeo real caber sem travar nem voltar ao início): passagem no corte = a velha some
// na hora (a edit-earn contaria TR); pixel = a velha só aparece na 1ª metade
const _avCenaFim0 = eaCenaFim;
eaCenaFim = function (c) {
  const k = typeof SCENES !== 'undefined' ? SCENES.findIndex(s => s.ctx === c) : -1, nx = k >= 0 ? SCENES[k + 1] : null;
  if (!nx || !String(nx.tr || '').startsWith('av:')) return _avCenaFim0(c);
  const D = eaDurTr(nx);
  return c.dur + (nx.tr === 'av:pixel' ? D / 2 : D);
};
let _avDefs = null;
function avDefs() {
  if (_avDefs) return _avDefs;
  const s_ = sv(document.body, 'svg', { width: 1080, height: 1920, style: 'position:absolute;left:0;top:0;width:0;height:0;overflow:hidden' }), d = sv(s_, 'defs');
  const fF = sv(d, 'filter', { id: 'avFerve', x: '-10%', y: '-10%', width: '120%', height: '120%' });
  const tb = sv(fF, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.022', numOctaves: 2, seed: 1, result: 'n' });
  sv(fF, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 8, xChannelSelector: 'R', yChannelSelector: 'G' });
  const fH = sv(d, 'filter', { id: 'avDirH', x: '-4%', y: '0', width: '108%', height: '100%' }); sv(fH, 'feGaussianBlur', { stdDeviation: '12 0' });
  const fV = sv(d, 'filter', { id: 'avDirV', x: '0', y: '-4%', width: '100%', height: '108%' }); const gV = sv(fV, 'feGaussianBlur', { stdDeviation: '0 0' });
  const ca = id => {
    const f = sv(d, 'filter', { id, x: '0', y: '0', width: '100%', height: '100%', 'color-interpolation-filters': 'sRGB' });
    sv(f, 'feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0', result: 'r' });
    const oR = sv(f, 'feOffset', { in: 'r', dx: 2, dy: 0, result: 'r2' });
    sv(f, 'feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0', result: 'g' });
    sv(f, 'feColorMatrix', { in: 'SourceGraphic', type: 'matrix', values: '0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0', result: 'b' });
    const oB = sv(f, 'feOffset', { in: 'b', dx: -2, dy: 0, result: 'b2' });
    sv(f, 'feBlend', { in: 'r2', in2: 'g', mode: 'screen', result: 'rg' });
    sv(f, 'feBlend', { in: 'rg', in2: 'b2', mode: 'screen' });
    return { oR, oB };
  };
  const pix = id => {
    const f = sv(d, 'filter', { id, x: '0', y: '0', width: '100%', height: '100%' });
    const fl = sv(f, 'feFlood', { x: 4, y: 4, width: 2, height: 2 }), cp = sv(f, 'feComposite', { width: 10, height: 10 });
    sv(f, 'feTile', { result: 'a' }); sv(f, 'feComposite', { in: 'SourceGraphic', in2: 'a', operator: 'in' });
    const mo = sv(f, 'feMorphology', { operator: 'dilate', radius: 5 });
    return { fl, cp, mo };
  };
  const cq = sv(d, 'clipPath', { id: 'avQueimaClip', clipPathUnits: 'userSpaceOnUse' });
  _avDefs = { svg: s_, tb, gV, ca: ca('avCA'), pixA: pix('avPixA'), pixB: pix('avPixB'), pixT: pix('avPixT'), cq, cqC: [] };
  avPixTam(_avDefs.pixT, 7);
  for (let i = 0; i < AV_QN; i++) _avDefs.cqC.push(sv(cq, 'circle', { cx: 0, cy: 0, r: 0 }));
  return _avDefs;
}
function avPixTam(p, B) { B = Math.max(2, Math.round(B)); const h = Math.floor(B / 2); p.fl.setAttribute('x', h - 1); p.fl.setAttribute('y', h - 1); p.cp.setAttribute('width', B); p.cp.setAttribute('height', B); p.mo.setAttribute('radius', h); }
// queima: AV_QN focos de fogo com início e velocidade sorteados PERTO DO MEIO (±300 x ±420 px) + um foco central que abre primeiro e
// garante a tela inteira no fim. Na v3 do teste os buracos nasciam pela tela toda e o olho pulava de um para outro (2 saltos na régua)
const AV_QN = 26;
function avQueimaRaios(u) {
  const R = [];
  for (let i = 0; i < AV_QN - 1; i++) { const s0 = .1 + avR(i + 2) * .4, v = 600 + avR(i + 3) * 800; R.push([540 + (avR(i) - .5) * 600, 960 + (avR(i + .5) - .5) * 840, Math.max(0, u - s0) * v]); }
  R.push([540, 960, u * 1250]);
  return R;
}
let _avTr = null;
function avTrFx() {
  if (_avTr) return _avTr;
  const box_ = el($('scenes'), 'div', 'position:absolute;inset:0;z-index:15;pointer-events:none;display:none;');
  const cls = ['polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0% 50%)', 'polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)',
    'polygon(14% 14%,86% 14%,86% 86%,14% 86%)', 'polygon(50% 4%,100% 92%,0% 92%)'];
  const formas = cls.map(cp => el(box_, 'div', `position:absolute;left:540px;top:960px;width:2400px;height:2400px;margin:-1200px 0 0 -1200px;clip-path:${cp};transform:scale(0);`));
  const q = svgAbs(box_, 0, 0, 1080, 1920, 'position:absolute;left:0;top:0;');
  const dq = sv(q, 'defs');
  const mA = sv(dq, 'mask', { id: 'avQMa', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1080, height: 1920 });
  const mB = sv(dq, 'mask', { id: 'avQMb', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1080, height: 1920 });
  const camadas = [mA, mB].map(m => { sv(m, 'rect', { width: 1080, height: 1920, fill: '#000' }); const gw = sv(m, 'g', { fill: '#fff' }), gb = sv(m, 'g', { fill: '#000' });
    return { w: Array.from({ length: AV_QN }, () => sv(gw, 'circle', { r: 0 })), b: Array.from({ length: AV_QN }, () => sv(gb, 'circle', { r: 0 })) }; });
  sv(q, 'rect', { width: 1080, height: 1920, fill: 'rgba(28,12,4,.9)', mask: 'url(#avQMb)' });
  sv(q, 'rect', { width: 1080, height: 1920, fill: '#ff8a1c', mask: 'url(#avQMa)', style: 'filter:blur(2px)' });
  _avTr = { box: box_, formas, q, camadas };
  return _avTr;
}
const _avSujo = new Set();
function avLimpa() {
  _avSujo.forEach(e => { e.style.clipPath = ''; e.style.visibility = ''; e.style.transformOrigin = ''; e.style.backfaceVisibility = ''; e.style.zIndex = ''; e.style.filter = ''; e.style.transform = ''; e.style.opacity = ''; });
  _avSujo.clear();
  if (_avTr) _avTr.box.style.display = 'none';
}
const avSuja = (...es) => es.forEach(e => e && _avSujo.add(e));
(() => {
  const orig = window.render;
  window.render = async function (t) {
    avLimpa();
    const k = await orig(t);
    if (!window._avIni) {
      window._avIni = 1;
      SCENES.forEach(s => { const m = { 'av:flex': 'flex', 'av:impacto': 'imp', 'av:estalo': 'estalo' }[s.tr]; if (m && s.k > 0) AV_FX.push({ t: s.t0, k: m }); });
    }
    const s = SCENES[k], prev = k > 0 ? SCENES[k - 1] : null, lt = t - s.t0, tr = s.tr || '';
    if (!prev || !tr.startsWith('av:')) return k;
    const D = eaDurTr(s);
    s.root.style.webkitMaskImage = s.root.style.maskImage = '';          // tira o wipe linear que a edit-earn põe quando eaDurTr > 0
    if (D <= 0) {                     // passagem no corte (flex, impacto, estalo): a cena velha some na hora (o motor a mostraria por TR)
      if (lt < TR) { avSuja(prev.root); prev.root.style.visibility = 'hidden'; }
      return k;
    }
    if (lt >= D) return k;
    const u = clamp(lt / D), F = avTrFx();
    avSuja(s.root, prev.root);
    // os textos da cena velha saem no começo da passagem: tipografia girando/voando com a cena não se lê (régua texto_na_tela) e a
    // legenda da fala nova já pode entrar. O update da cena velha os mostra de novo no quadro seguinte; aqui somem depois dele.
    ((prev.S && prev.S.txts) || []).forEach(x => { if (x.el) x.el.style.display = 'none'; });
    if (tr === 'av:formas') {
      F.box.style.display = ''; F.box.style.zIndex = 15; s.root.style.zIndex = 20; prev.root.style.zIndex = 1; F.q.style.display = 'none';
      const fr = lt * 30, cores = avLook().cores;
      F.formas.forEach((e, i) => { const q = AV_C.snap(clamp((fr - i * 2) / 7)); e.style.background = cores[i % cores.length];
        e.style.transform = `rotate(${((i % 2 ? 1 : -1) * 35 * (1 - q)).toFixed(1)}deg) scale(${(q * 1.05).toFixed(4)})`; e.style.display = fr >= i * 2 ? '' : 'none'; });
      const qc = AV_C.snap(clamp((fr - 8) / 6.5));
      s.root.style.clipPath = `circle(${(qc * 1150).toFixed(1)}px at 540px 960px)`;
    } else if (tr === 'av:pagina') {
      prev.root.style.zIndex = 25; s.root.style.zIndex = 1;
      const q = AV_C.suave(u);
      prev.root.style.transformOrigin = '0px 960px'; prev.root.style.backfaceVisibility = 'hidden';
      prev.root.style.transform = `perspective(2600px) rotateY(${(-178 * q).toFixed(2)}deg) rotateX(${(4 * Math.sin(Math.PI * q)).toFixed(2)}deg)`;
      prev.root.style.filter = `brightness(${(1 - .45 * Math.sin(Math.PI / 2 * q)).toFixed(3)})`;
      s.root.style.filter = `brightness(${(.55 + .45 * q).toFixed(3)})`;
    } else if (tr === 'av:queima') {
      const Dd = avDefs(), R = avQueimaRaios(u);
      s.root.style.zIndex = 20; prev.root.style.zIndex = 1; F.box.style.display = ''; F.box.style.zIndex = 30;
      F.formas.forEach(e => { e.style.display = 'none'; }); F.q.style.display = '';
      R.forEach(([x, y, r], i) => {
        Dd.cqC[i].setAttribute('cx', x.toFixed(1)); Dd.cqC[i].setAttribute('cy', y.toFixed(1)); Dd.cqC[i].setAttribute('r', r.toFixed(1));
        F.camadas[0].w[i].setAttribute('cx', x); F.camadas[0].w[i].setAttribute('cy', y); F.camadas[0].w[i].setAttribute('r', r > 0 ? r + 14 : 0);
        F.camadas[0].b[i].setAttribute('cx', x); F.camadas[0].b[i].setAttribute('cy', y); F.camadas[0].b[i].setAttribute('r', r);
        F.camadas[1].w[i].setAttribute('cx', x); F.camadas[1].w[i].setAttribute('cy', y); F.camadas[1].w[i].setAttribute('r', r > 0 ? r + 46 : 0);
        F.camadas[1].b[i].setAttribute('cx', x); F.camadas[1].b[i].setAttribute('cy', y); F.camadas[1].b[i].setAttribute('r', r > 0 ? r + 14 : 0);
      });
      s.root.style.clipPath = 'url(#avQueimaClip)';
      F.q.style.opacity = u > .92 ? (1 - (u - .92) / .08).toFixed(3) : 1;
    } else if (tr === 'av:pixel') {
      const Dd = avDefs();
      if (u < .5) { prev.root.style.zIndex = 25; s.root.style.visibility = 'hidden'; avPixTam(Dd.pixA, lerp(2, 72, E.in(u / .5))); prev.root.style.filter = 'url(#avPixA)'; }
      else { prev.root.style.visibility = 'hidden'; const B = lerp(72, 2, E.out((u - .5) / .5)); avPixTam(Dd.pixB, B); s.root.style.filter = B > 2.5 ? 'url(#avPixB)' : ''; }
    } else if (tr === 'av:espiral') {
      prev.root.style.zIndex = 25; s.root.style.zIndex = 1;
      const q = EA_SAI(u), q2 = AV_C.snap(u);
      prev.root.style.transformOrigin = '540px 960px'; prev.root.style.transform = `rotate(${(-50 * q).toFixed(2)}deg) scale(${(1 + 1.6 * q).toFixed(4)})`;
      prev.root.style.filter = q > .05 ? `blur(${(18 * q).toFixed(1)}px)` : ''; prev.root.style.opacity = (1 - clamp((u - .45) / .55)).toFixed(3);
      s.root.style.transformOrigin = '540px 960px'; s.root.style.transform = `rotate(${(12 * (1 - q2)).toFixed(2)}deg) scale(${(1.25 - .25 * q2).toFixed(4)})`;
    }
    return k;
  };
})();

// ---------- 9. acabamento por look + legenda doc ----------
let _avAc = null;
function avTile(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); return cv.toDataURL(); }
function avAcIni() {
  if (_avAc) return _avAc;
  const st = $('stage'), ov = (css, id) => { const e = el(st, 'div', `position:absolute;inset:0;pointer-events:none;${css}`); if (id) e.id = id; return e; };
  const tx = n => (typeof AS === 'function' && AS(n)) ? AS(n).src : null;
  const ret = avTile(10, 10, (x) => { x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(5, 5, 2.3, 0, 6.29); x.fill(); });
  const gN = (avLook().tx && avLook().tx.gru) || 'av_grunge';      // premium: a "Texture 03" do Stripe em screen no lugar do grunge
  const A = {
    ret: ov(`z-index:4;mix-blend-mode:overlay;background:url(${tx('av_reticula') || ret}) 0 0/${tx('av_reticula') ? '1080px 1920px' : '10px 10px'};opacity:0;`),
    gru: ov(`z-index:4;mix-blend-mode:screen;background:${tx(gN) ? `url(${tx(gN)}) center/cover` : 'none'};opacity:0;`),
    pap: ov(`z-index:4;mix-blend-mode:soft-light;background:${tx('av_papel') ? `url(${tx('av_papel')}) center/cover` : 'none'};opacity:0;`),
    per: ov('z-index:4;mix-blend-mode:overlay;background:repeating-linear-gradient(0deg, rgba(0,0,0,.6) 0 2px, rgba(0,0,0,0) 2px 8px);opacity:0;'),
    lin: ov('z-index:4;background:repeating-linear-gradient(0deg, rgba(0,0,0,.5) 0 2px, rgba(0,0,0,0) 2px 4px);opacity:0;'),
    borda: ov('z-index:4;-webkit-mask-image:radial-gradient(ellipse 62% 56% at 50% 47%, rgba(0,0,0,0) 58%, #000 100%);mask-image:radial-gradient(ellipse 62% 56% at 50% 47%, rgba(0,0,0,0) 58%, #000 100%);opacity:1;'),
    oval: ov('z-index:4;background:radial-gradient(ellipse 52% 68% at 50% 48%, rgba(0,0,0,0) 52%, rgba(0,0,0,1) 100%);opacity:0;'),
    bolha: ov('z-index:4;mix-blend-mode:screen;background:radial-gradient(circle 520px at 50% 50%, rgba(255,255,255,.9), rgba(255,255,255,0) 70%);opacity:0;'),
    faixa: ov(`z-index:4;top:-60px;bottom:-60px;mix-blend-mode:${tx('av_linha') ? 'overlay' : 'screen'};` +
      `background:${tx('av_linha') ? `url(${tx('av_linha')}) 0 0/1080px 1920px repeat` : 'linear-gradient(0deg, rgba(255,255,255,0) 46%, rgba(255,255,255,.75) 50%, rgba(255,255,255,0) 54%)'};opacity:0;`),
    poe: el(st, 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;z-index:4;pointer-events:none;mix-blend-mode:screen;opacity:0;'),
    furos: ov('z-index:4;opacity:0;background:repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 36px, rgba(245,240,230,.85) 36px 70px, rgba(0,0,0,0) 70px 108px) 10px 0/34px 108px repeat-y, repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 36px, rgba(245,240,230,.85) 36px 70px, rgba(0,0,0,0) 70px 108px) 1036px 0/34px 108px repeat-y;'),
    vhs: el(st, 'div', 'position:absolute;left:70px;top:120px;z-index:6;pointer-events:none;font-family:Archivo;font-size:46px;color:#fff;letter-spacing:.06em;text-shadow:3px 0 rgba(255,0,60,.6),-3px 0 rgba(0,200,255,.6);opacity:0;white-space:pre;'),
    faixaV: ov('z-index:4;mix-blend-mode:screen;opacity:0;background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.28) 40%, rgba(255,255,255,0));height:90px;bottom:auto;'),
    grao: el(st, 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;z-index:4;pointer-events:none;mix-blend-mode:overlay;opacity:0;'),
    flash: ov('z-index:7;background:#fff;mix-blend-mode:overlay;opacity:0;'),
    leg: el(st, 'div', 'position:absolute;left:540px;top:1330px;z-index:5;transform:translate(-50%,-50%);white-space:nowrap;text-align:center;pointer-events:none;'),
  };
  A.poe.width = 540; A.poe.height = 960; A.grao.width = 360; A.grao.height = 640;
  A.borda.style.backdropFilter = A.borda.style.webkitBackdropFilter = 'blur(6px)';
  A.graoPasso = -1; A.poePasso = -1; A.legIdx = -2;
  return (_avAc = A);
}
// envelope 0 → 1 → 0 por chaves [t, v]
const avEnv = (u, ks) => { if (u <= ks[0][0] || u >= ks[ks.length - 1][0]) return 0; for (let i = 0; i < ks.length - 1; i++) if (u < ks[i + 1][0]) return lerp(ks[i][1], ks[i + 1][1], (u - ks[i][0]) / (ks[i + 1][0] - ks[i][0])); return 0; };
let AV_CH = null;
function avChunks() {
  if (AV_CH) return AV_CH;
  AV_CH = []; const mx = avLook().leg.max ?? 2;
  TIMING.beats.forEach(b => {
    let cur = [];
    const flush = () => { if (cur.length) { AV_CH.push({ words: cur }); cur = []; } };
    b.words.forEach((w, i) => { cur.push(w); const nx = b.words[i + 1], chars = cur.map(x => x.w).join(' ').length;
      if (/[,.;:?!]$/.test(w.w) || cur.length >= mx || (nx && chars + 1 + nx.w.length > 16)) flush(); });
    flush();
  });
  AV_CH.forEach(ch => { ch.s = ch.words[0].s - .03; });          // todos os começos antes dos fins (o fim olha o começo do seguinte)
  AV_CH.forEach((ch, i) => { const nx = AV_CH[i + 1], fim = ch.words[ch.words.length - 1].e; ch.e = nx ? Math.min(nx.s, fim + .35) : fim + .6; });
  return AV_CH;
}
const avEhEnfase = w => { const n = norm(w); return /\d/.test(w) || [...AV_ENFASE].some(k => k && n.startsWith(k)); };
renderCaptions = function (t) {
  const Dd = avDefs(), A = avAcIni(), Lk = avLook();
  const s = window.CUR_SCENE || SCENES[0], S = (s && s.S) || {};
  const ex = (S.look && AV_EXTRAS[S.look]) || {}, ac = { ...Lk.ac, ...(S.ac || {}) };
  // contornos e rabiscos que usam url(#avFerve) fervem no passo 12
  Dd.tb.setAttribute('seed', String(1 + (Math.floor(t * 12 + 1e-6) % 9)));
  // ---- quadro inteiro: tremor no passo, flicker de exposição, pulso de corte, impactos, flex, estalo ----
  const tf = ex.tremorFps ?? ac.tremorFps, tt = avPost(t, tf), am = ex.tremor ?? ac.tremor;
  let jx = aeWiggle(tt, ex.tremor ? 20 : 1, am, 11), jy = aeWiggle(tt, ex.tremor ? 20 : 1, am, 12), sc = 1 + am * .004;
  let br = 1 + (ex.flicker ?? ac.flicker) * avR(Math.floor(t * ac.flickerFps + 1e-6) + 3), bl = 0, gray = 0, inv = 0, caX = ex.ca ?? ac.ca, dv = 0, fl = 0;
  if (ac.pulso) for (let k = 1; k < SCENES.length; k++) { const dt = t - SCENES[k].t0; if (Math.abs(dt) < .12 && !SCENES[k].semPulso) bl = Math.max(bl, ac.pulso * (1 - Math.abs(dt) / .12)); }
  for (const f of AV_FX) {
    const u = t - f.t; if (u < -.01 || u > 1.2) continue;
    if (f.k === 'imp') { const e = avEnv(u, [[0, 0], [.08, 1], [.1, 1], [.34, 0]]); if (e > 0) { jx += aeWiggle(t, 10, 20 * e, 31); jy += aeWiggle(t, 10, 20 * e, 32); br += .55 * e; bl = Math.max(bl, 16 * e); sc = Math.max(sc, 1 + .065 * e); } }
    else if (f.k === 'flex') {
      const fr = Math.floor(u * 30 + 1e-6);
      if (u < 0) continue;            // quadro um pouco ANTES do corte (u −0,01…0) caía no fr −1 e estourava o brilho (2,6×) na cena velha
      if (fr === 0) inv = 1; else if (fr <= 2) { br += 1.2 - .4 * fr; caX = Math.max(caX, 11); }
      const dy = avEnv(u, [[0, .0325], [.1, .015], [.23, .005], [.26, 0]]); if (u >= 0 && u < .26) { jy += dy * 1920; sc = Math.max(sc, 1 + dy * 2.2); }
      if (u >= 0 && u < .13) dv = Math.max(dv, 55 * (1 - u / .13));
      if (u >= 0 && u < .13) fl = Math.max(fl, 1 - u / .13);
    } else if (f.k === 'estalo') { const fr = Math.floor(u * 30 + 1e-6); if (u >= 0 && u < (f.d ?? .4) && Math.floor(fr / 2) % 2 === 0) { gray = 1; br += .08; } }
    else if (f.k === 'flash') { if (u >= 0 && u < .17) fl = Math.max(fl, 1 - u / .17); }
  }
  const scn = $('scenes'), gr0 = $('grain');
  if (gr0) gr0.style.opacity = 0;                  // o grão do kit sai: o grão daqui é sorteado de novo a cada passo
  scn.style.transformOrigin = '540px 960px';
  scn.style.transform = `translate(${jx.toFixed(2)}px,${jy.toFixed(2)}px) scale(${sc.toFixed(4)})`;
  if (caX > .3) { Dd.ca.oR.setAttribute('dx', caX.toFixed(1)); Dd.ca.oB.setAttribute('dx', (-caX).toFixed(1)); }
  Dd.gV.setAttribute('stdDeviation', `0 ${dv.toFixed(1)}`);
  scn.style.filter = [bl > .3 ? `blur(${bl.toFixed(1)}px)` : '', `brightness(${br.toFixed(4)})`, gray ? 'grayscale(1)' : '', inv ? 'invert(1)' : '',
    ex.sepia ? `sepia(${ex.sepia})` : '', ex.sat ? `saturate(${ex.sat})` : '', caX > .3 ? 'url(#avCA)' : '', dv > .5 ? 'url(#avDirV)' : ''].filter(Boolean).join(' ');
  // ---- camadas de acabamento ----
  const passo = Math.floor(t * 12 + 1e-6);
  A.ret.style.opacity = ac.reticula; A.gru.style.opacity = ac.grunge; A.pap.style.opacity = ac.papel; A.per.style.opacity = ac.persiana; A.lin.style.opacity = ac.linhas;
  A.gru.style.transform = `translate(${(avS(passo) * 14).toFixed(0)}px,${(avS(passo + .5) * 14).toFixed(0)}px) scale(1.03)`;
  A.borda.style.backdropFilter = A.borda.style.webkitBackdropFilter = ac.borda ? `blur(${ac.borda}px)` : 'none';
  A.oval.style.opacity = ac.oval;
  A.bolha.style.opacity = ac.bolha; if (ac.bolha) A.bolha.style.transform = `translate(${aeWiggle(t, .3, 160, 41).toFixed(0)}px,${aeWiggle(t, .3, 220, 42).toFixed(0)}px)`;
  A.faixa.style.opacity = ac.faixa; if (ac.faixa) A.faixa.style.transform = `translateY(${[990, 932, 982][Math.floor(t * 6 + 1e-6) % 3] - 960}px)`;
  const vg = $('vig'); if (vg) vg.style.opacity = ac.vinheta;
  // grão (ruído novo a cada passo)
  const gp = Math.floor(t * ac.graoFps + 1e-6);
  A.grao.style.opacity = ac.grao;
  if (ac.grao && gp !== A.graoPasso) {
    A.graoPasso = gp; const x = A.grao.getContext('2d'), im = x.createImageData(360, 640), rn = avRng(gp * 7919 + 13);
    for (let i = 0; i < im.data.length; i += 4) { const v = rn() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0);
  }
  // filme: poeira, riscos e furos; vhs: PLAY + contador + faixa rolando
  A.furos.style.opacity = ex.furos ? .9 : 0; if (ex.furos) A.furos.style.backgroundPositionY = `${(t * 420) % 108}px`;
  A.poe.style.opacity = ex.poeira ? .85 : 0;
  if (ex.poeira && passo !== A.poePasso) {
    A.poePasso = passo; const x = A.poe.getContext('2d'), rn = avRng(passo * 104729 + 7); x.clearRect(0, 0, 540, 960);
    x.fillStyle = 'rgba(255,250,235,.8)'; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(rn() * 540, rn() * 960, .5 + rn() * (i % 7 ? 1.2 : 3.2), 0, 6.29); x.fill(); }
    x.strokeStyle = 'rgba(255,250,235,.35)'; x.lineWidth = 1; for (let i = 0; i < 2; i++) { if (rn() < .6) { const px = rn() * 540; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (rn() - .5) * 8, 960); x.stroke(); } }
  }
  A.vhs.style.opacity = ex.play ? 1 : 0;
  if (ex.play) { const ss = Math.floor(t); A.vhs.textContent = `PLAY ▶\n${String(Math.floor(ss / 60)).padStart(2, '0')}:${String(ss % 60).padStart(2, '0')}:${String(Math.floor((t % 1) * 30)).padStart(2, '0')}`; }
  A.faixaV.style.opacity = ex.faixas ? 1 : 0; if (ex.faixas) A.faixaV.style.top = `${((t * 520) % 2100) - 120}px`;
  A.flash.style.opacity = fl.toFixed(3);
  // ---- legenda doc: 1–2 palavras no meio-baixo, letras tremendo no passo (Walkman/Bryan) ----
  const box_ = $('cap'); if (box_) box_.style.opacity = 0;
  const lg = { ...Lk.leg }, CH = avChunks();
  let idx = -1; for (let i = 0; i < CH.length; i++) if (t >= CH[i].s && t < CH[i].e) { idx = i; break; }
  const lt = s ? t - s.t0 : 0;
  // sobra de frase: o pedaço que começou numa cena que ESCONDIA a legenda (texto na tela, legenda false) ou que a punha noutra altura
  // (legY) não reaparece na cena nova (o "nasceu" que a data datilografada cobria voltava por 2 quadros na espiral do teste). Pedaço
  // que já estava à vista continua igual depois do corte: esconder todo resto curto fazia a legenda piscar em cada corte e a régua de
  // leitura contava dois saltos de foco por emenda (v2 do teste).
  let sobra = false;
  if (idx >= 0 && s && CH[idx].s < s.t0) {
    let sc0 = null; for (const x of SCENES) { if (x.t0 <= CH[idx].s + 1e-6) sc0 = x; else break; }
    const S0 = sc0 && sc0 !== s ? sc0.S : null, l0 = sc0 ? CH[idx].s - sc0.t0 : 0;
    sobra = !!S0 && (S0.legenda === false || (S0.legY ?? lg.y) !== (S.legY ?? lg.y) ||
      (S0.txts || []).some(x => x.janela && l0 >= x.janela[0] - .12 && (x.janela[1] === null || l0 < x.janela[1])));   // folga: o pedaço começa .03 s antes da palavra e o texto entra NA palavra
  }
  const esconde = idx < 0 || S.legenda === false || sobra || (S.legOff || []).some(([a, b]) => lt >= a && lt < b) || (S.txts || []).some(x => x.visivel);
  A.leg.style.display = esconde ? 'none' : '';
  A.leg.style.top = `${S.legY ?? lg.y}px`;
  // legFundo (cena): véu escuro suave atrás da legenda quando o fundo é claro (papel creme, céu); string = background CSS próprio
  const vf = S.legFundo === true ? 'radial-gradient(ellipse closest-side, rgba(12,9,6,.66) 0%, rgba(12,9,6,.5) 55%, rgba(12,9,6,0) 100%)' : (S.legFundo || '');
  A.leg.style.background = vf; A.leg.style.padding = vf ? '46px 150px' : '';
  if (esconde) return;
  if (idx !== A.legIdx) {
    A.legIdx = idx; A.leg.innerHTML = '';
    const pix = lg.fam === 'pixel';
    A.leg.style.filter = pix ? 'url(#avPixT)' : '';
    CH[idx].words.forEach((w, i) => {
      const enf = avEhEnfase(w.w), txt = w.w.replace(/[,.;:]$/, '');
      const sp = el(A.leg, 'span', `display:inline-block;margin:0 .14em;vertical-align:middle;font-family:${pix ? 'Archivo' : (enf ? lg.enfFam : lg.fam)};` +
        `font-weight:${enf ? lg.enfPeso : lg.peso};font-style:${enf && !pix ? 'italic' : 'normal'};font-size:${enf ? lg.enfS : lg.s}px;color:${enf ? lg.enfCor : lg.cor};` +
        `text-shadow:0 3px 16px rgba(0,0,0,.7), 0 0 3px rgba(0,0,0,.5);line-height:1.1;${pix ? 'text-transform:uppercase;' : ''}`);
      [...txt].forEach(ch => { const e = el(sp, 'span', 'display:inline-block;white-space:pre;'); e.textContent = ch; });
    });
  }
  if (lg.jit) {
    const ps = Math.floor(t * lg.fps + 1e-6);
    A.leg.querySelectorAll('span > span').forEach((e, j) => { const sd = j + 456 + ps * 31; e.style.transform = `translate(${(avS(sd) * lg.jit).toFixed(1)}px,${(avS(sd + .5) * lg.jit).toFixed(1)}px) rotate(${(avS(sd + .3) * lg.rot).toFixed(1)}deg)`; });
  }
};
