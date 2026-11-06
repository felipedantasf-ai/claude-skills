// ============================================================================
//  FORMATO VOX EDITORIAL (skill vox-editorial) — componentes
//  Cole este arquivo como a PRIMEIRA parte de render/scenes.js (ex.: work/xx_a.js) e escreva as cenas depois dele.
//  Papel cinza com fibra como mesa; recortes e fotos em CORES VIVAS (desde 14/10/2026); fotos de arquivo impressas com fita;
//  a fala vira tipografia em serifa (palavra por palavra) integrada a cada cena; blocos de COR VIVA; motions coloridos
//  (traços, raios, formas de papel, cortina de cor); apresentador COLORIDO. Nada de neon, brilho ou degradê colorido.
//  Precisa do CSS de legenda.css no index.html e das fontes Sitka em render/fonts.
// ============================================================================
const K = {
  ink: '#f5f1e8', dark: '#161616', tag: '#111111',                                  // texto claro / texto escuro / etiqueta
  laranja: '#ff5a14', ciano: '#00a6e0', amarelo: '#ffc414', verde: '#16ad4c',        // cores VIVAS (papel liso, chapadas)
  vermelho: '#e8190e', rosa: '#ff2d7a', azul: '#2446ff', roxo: '#7d2cf2',
};
// par complementar de cada cor: objeto numa cor, bloco/fundo no par dela = máximo contraste (ex.: recorte vermelho em bloco ciano)
const PAR = { laranja: 'azul', azul: 'laranja', vermelho: 'ciano', ciano: 'vermelho', amarelo: 'roxo', roxo: 'amarelo', verde: 'rosa', rosa: 'verde' };
const SERIF = 'Sitka';

// ---------- legenda: a fala em serifa, por cena ----------
// S.cap = { mode, y, x, rot, fs } em cada cena (pode mudar no update):
//   title = topo/centro, palavra por palavra; palavras de ligação no começo vão numa linha pequena em cima e o resto em itálico
//   tag   = etiqueta preta com serifa branca (mapas, recortes de jornal, quando o visual já é cheio)
//   glow  = itálico branco com sombra (fotos escuras e apresentador; no apresentador fica no peito, y ~1460)
//   dark  = serifa escura sobre bloco de cor claro/forte (a fala "pousa" no bloco)
//   none  = sem legenda
const STOPW = new Set(('a o as os um uma uns umas de do da dos das em no na nos nas num numa e que para pra por pelo pela pelos pelas com sem se ao aos ' +
  'ja so tal mas ou nem me te lhe eu ele ela eles elas voce voces isso esse essa esses essas este esta aquele aquela aqueles seu sua seus suas ' +
  'foi vai vao ser sao tem ha ate mais muito muita muitos como quando onde quem qual').split(' '));
const isStop = w => STOPW.has(norm(w));
const capTxt = w => esc(w.replace(/[,;:]$/, ''));
let CH2 = null, ch2Key = '';
// blocos de até ~22 letras; não termina bloco em palavra de ligação (passa para o próximo) nem separa número da unidade
const UNIT = new Set(['mil', 'milhoes', 'bilhoes', 'reais', 'dias', 'anos', 'pontos']);
function buildCh2() {
  CH2 = [];
  TIMING.beats.forEach(b => {
    let cur = [];
    const len = a => a.map(x => x.w).join(' ').length;
    const push = () => { if (cur.length) CH2.push({ words: cur }); cur = []; };
    b.words.forEach(w => {
      if (cur.length && len(cur) + 1 + w.w.length > 22 && !/\d/.test(cur[cur.length - 1].w) && !UNIT.has(norm(w.w))) {
        let k = cur.length; while (k > 1 && isStop(cur[k - 1].w)) k--;
        const carry = cur.slice(k); cur = cur.slice(0, k); push(); cur = carry;
      }
      cur.push(w);
      if (/[,.;:?!]$/.test(w.w)) push();
    });
    push();
  });
  CH2.forEach(c => { c.s = c.words[0].s - .03; });
  CH2.forEach((c, i) => { const nx = CH2[i + 1], end = c.words[c.words.length - 1].e; c.e = nx ? Math.min(nx.s, end + .55) : end + .9; });
}
renderCaptions = function (t) {
  if (!CH2) buildCh2();
  const box = $('cap'), S = (window.CUR_SCENE && CUR_SCENE.S) || {}, cfg = S.cap || { mode: 'title', y: 400 };
  let idx = -1;
  for (let i = 0; i < CH2.length; i++) if (t >= CH2[i].s && t < CH2[i].e) { idx = i; break; }
  if (idx < 0 || cfg.mode === 'none') { box.style.opacity = 0; return; }
  const mode = cfg.mode || 'title', key = `${idx}|${mode}|${cfg.fs || ''}`;
  const ws = CH2[idx].words;
  if (key !== ch2Key) {
    ch2Key = key;
    box.className = 'm-' + mode;
    const fs0 = cfg.fs || ({ title: 96, dark: 88, glow: 80, tag: 44 })[mode];
    box.style.setProperty('--fs', `${fs0}px`);
    const sp = (w, i, cls = '') => `<span class="w${cls}" data-i="${i}">${capTxt(w.w)}</span>`;
    if (mode === 'title' || mode === 'dark') {
      let k = 0; while (k < ws.length - 1 && isStop(ws[k].w)) k++;
      const l1 = ws.slice(0, k), l2 = ws.slice(k);
      box.innerHTML = (l1.length ? `<div class="l1">${l1.map((w, i) => sp(w, i)).join(' ')}</div>` : '') +
        `<div class="l2${l1.length && mode === 'title' ? ' it' : ''}">${l2.map((w, i) => sp(w, i + k, isStop(w.w) ? ' sm' : '')).join(' ')}</div>`;
    } else if (mode === 'tag') box.innerHTML = `<span class="tg">${ws.map((w, i) => sp(w, i)).join(' ')}</span>`;
    else box.innerHTML = ws.map((w, i) => sp(w, i)).join(' ');
    box.style.transform = 'translate(-50%,-50%)';
    const maxW = cfg.maxW || 960, wpx = box.scrollWidth;
    if (wpx > maxW) box.style.setProperty('--fs', `${Math.floor(fs0 * maxW / wpx)}px`);
    box._spans = [...box.querySelectorAll('.w')];
  }
  const whole = mode === 'tag' || mode === 'glow', c0 = CH2[idx].s;
  box._spans.forEach(s => {
    const w = ws[+s.dataset.i], q = clamp((t - (whole ? c0 : w.s - .03)) / (whole ? .18 : .15));
    s.style.opacity = q.toFixed(3);
    s.style.transform = q < 1 ? `translateY(${((1 - E.out(q)) * 14).toFixed(1)}px)` : '';
    s.style.filter = q < 1 ? `blur(${((1 - q) * 7).toFixed(1)}px)` : '';
  });
  box.style.opacity = 1;
  box.style.left = `${cfg.x ?? 540}px`; box.style.top = `${cfg.y ?? 400}px`;
  box.style.transform = `translate(-50%,-50%) rotate(${cfg.rot ?? 0}deg)`;
};

// ---------- texturas ----------
const PTX = {};
const ptex = (col, n = 40) => PTX[col + n] || (PTX[col + n] = noiseCanvas(256, 256, col, 10, { a: .07, c: '#3a2f22', n }));
let STMASK = null;
function stampMask() {          // máscara de tinta de carimbo (falhas)
  if (STMASK) return STMASK;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${(.2 + Math.random() * .7).toFixed(2)})`; const r = Math.random() * 3.2; x.beginPath(); x.arc(Math.random() * 512, Math.random() * 256, r, 0, 7); x.fill(); }
  for (let i = 0; i < 9; i++) { x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1 + Math.random() * 2; x.beginPath(); const y = Math.random() * 256; x.moveTo(0, y); x.lineTo(512, y + (Math.random() - .5) * 60); x.stroke(); }
  return (STMASK = c.toDataURL());
}

// ---------- fundos ----------
// papel cinza (mesa da colagem). o.cor tinge o papel (cena inteira numa cor forte), o.b = brilho
function paperBg(r, o = {}) {
  const h = hero(r, 't_papel', { k: 1.08 });
  h.img.style.filter = `grayscale(1) brightness(${o.b ?? .8}) contrast(1.06)`;
  if (o.cor) el(r, 'div', `position:absolute;inset:0;background:${o.cor};mix-blend-mode:multiply;opacity:${o.forca ?? .9};`);
  return h;
}
// foto cinematográfica COLORIDA (padrão desde 14/10): cor reforçada, contraste, vinheta leve e empurrão lento
function plateCor(r, name, o = {}) {
  const h = hero(r, name, { k: o.k ?? 1.08, oy: o.oy ?? 960 });
  h.img.style.filter = `saturate(${o.sat ?? 1.25}) contrast(${o.ct ?? 1.08}) brightness(${o.b ?? 1})`;
  h.vig = el(r, 'div', `position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,${o.vig ?? .42}) 100%);`);
  h.push = (lt, dur, q = {}) => { const u = E.inOut(clamp(lt / Math.max(.1, dur))); h.kb((q.s0 ?? 1) + (q.ds ?? .08) * u, (q.dx ?? 0) * u, (q.dy ?? -16) * u); };
  return h;
}
// foto escura P&B (só como exceção deliberada, ex.: passado; use duotone() para dar cor a uma imagem P&B)
function plateBW(r, name, o = {}) {
  const h = hero(r, name, { k: o.k ?? 1.08, oy: o.oy ?? 960 });
  h.img.style.filter = o.cor ? `saturate(${o.sat ?? 1.15}) contrast(${o.ct ?? 1.06}) brightness(${o.b ?? .95})` : `grayscale(1) contrast(${o.ct ?? 1.06}) brightness(${o.b ?? .92})`;
  h.vig = el(r, 'div', 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 42%, rgba(0,0,0,.62) 100%);');
  h.push = (lt, dur, q = {}) => { const u = E.inOut(clamp(lt / Math.max(.1, dur))); h.kb((q.s0 ?? 1) + (q.ds ?? .08) * u, (q.dx ?? 0) * u, (q.dy ?? -16) * u); };
  return h;
}
// mapa antigo (pergaminho, contorno sépia, Brasil em âmbar forte); M.lab(texto, lon, lat) + M.place(e) para rótulos
function oldMap(r, c, o = {}) {
  const bg = hero(r, 't_pergaminho', { k: 1.08 });
  bg.img.style.filter = 'saturate(1.25) brightness(.98)';
  const M = mapView(r, { c, sea: 'transparent', seaCss: 'background-image:none;', land: o.land ?? 'rgba(201,140,40,.14)', border: o.border ?? '#6b4618' });
  M.svg.style.mixBlendMode = 'multiply';
  M.br = M.hl(o.pais ?? 'Brazil', o.brFill ?? 'rgba(255,170,30,.78)', { stroke: '#4a2c08', 'stroke-width': 2.8 });
  M.lab = (txt, lon, lat, s = 46, ls = '.18em') => { const e = el(M.ui, 'div', `position:absolute;white-space:nowrap;font-family:${SERIF};font-weight:600;font-size:${s}px;letter-spacing:${ls};color:#3e2508;opacity:.92;transform:translate(-50%,-50%);`, txt); e.ll = [lon, lat]; return e; };
  M.place = e => { const [x, y] = M.pt(...e.ll); e.style.left = `${x.toFixed(1)}px`; e.style.top = `${y.toFixed(1)}px`; };
  return M;
}

// ---------- elementos ----------
// foto de arquivo impressa (P&B com retícula — prepare com prep_prints.py), borda de papel e fita lilás translúcida
function printPhoto(p, name, cx, cy, w, o = {}) {
  const a = AS(name), h = w * a.h / a.w, pad = o.pad ?? 16;
  const b = box(p, cx, cy, w + 2 * pad, h + 2 * pad, `background:#f1eee7 url(${ptex('#f1eee7', 20)});box-shadow:0 24px 36px rgba(0,0,0,.4), 0 3px 6px rgba(0,0,0,.25);opacity:0;`);
  b._rot = o.rot ?? -6;
  const im = el(b, 'img', `position:absolute;left:${pad}px;top:${pad}px;width:${w}px;height:${h}px;`); im.decoding = 'sync'; im.src = a.src;
  const W2 = w + 2 * pad, H2 = h + 2 * pad;
  const tp = (x, y, r) => el(b, 'div', `position:absolute;left:${x}px;top:${y}px;width:170px;height:50px;transform:rotate(${r}deg);background:rgba(201,192,222,.8) url(${ptex('#c9c0de', 30)});background-blend-mode:multiply;` +
    'clip-path:polygon(0 8%,4% 0,9% 9%,14% 2%,20% 8%,80% 6%,86% 0,91% 8%,96% 1%,100% 9%,100% 92%,95% 100%,90% 91%,84% 99%,78% 92%,22% 94%,16% 100%,10% 92%,5% 99%,0 91%);opacity:.92;');
  const pos = { tl: [-50, -4, -38], tr: [W2 - 120, -4, 38], bl: [-50, H2 - 46, 38], br: [W2 - 120, H2 - 46, -38] };
  b.tapes = (o.tape ?? ['tl']).map(k => tp(...pos[k]));
  b.W2 = W2; b.H2 = H2;
  return b;
}
// entrada de papel: cai girando e assenta (um controlador por elemento por quadro)
function dropIn(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const d = o.d ?? .45, p = clamp((lt - at) / d), q = E.out5(p), bb = bob(lt, o.seed ?? 3, o.amp ?? 2);
  const out = o.out !== undefined && lt > o.out ? E.in(clamp((lt - o.out) / (o.od ?? .3))) : 0;
  tx(e, { x: (o.dx ?? 0) * (1 - q) + bb.x + (o.x ?? 0) + (o.ox ?? 0) * out, y: (o.dy ?? -1100) * (1 - q) + bb.y + (o.y ?? 0) + (o.oy ?? 1400) * out,
    r: (o.r0 ?? 12) * (1 - q) + bb.r * .3, s: (o.s ?? 1) * lerp(o.s0 ?? 1.04, 1, q), o: 1 });
  return q;
}
// sobe de baixo (como os prédios do exemplo); o.dy negativo = desce de cima
function riseIn(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const q = E.out5(clamp((lt - at) / (o.d ?? .55))), bb = bob(lt, o.seed ?? 5, o.amp ?? 1.5);
  const out = o.out !== undefined && lt > o.out ? E.in(clamp((lt - o.out) / (o.od ?? .3))) : 0;
  tx(e, { x: bb.x + (o.x ?? 0), y: (o.dy ?? 1000) * (1 - q) + bb.y + (o.y ?? 0) + 1300 * out, s: o.s ?? 1, r: o.r ?? 0, o: 1 });
  return q;
}
// bloco de COR FORTE (papel liso com fibra) — retângulo ou trapézio (o.clip); anime com riseIn ou scaleY
function pblock(p, col, x, y, w, h, o = {}) {
  return el(p, 'div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${col} url(${ptex('#efece4', 30)});background-blend-mode:multiply;` +
    `${o.clip ? `clip-path:${o.clip};` : `box-shadow:0 12px 26px rgba(0,0,0,.22);`}opacity:0;${o.css || ''}`);
}
// etiqueta preta com serifa branca (rótulos, legendas de mapa, fontes de dados)
function tagL(p, text, cx, cy, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;white-space:nowrap;background:#111;color:${K.ink};font-family:${SERIF};font-weight:500;font-size:${o.s ?? 36}px;` +
    `padding:.16em .45em .24em;box-shadow:0 8px 16px rgba(0,0,0,.3);opacity:0;${o.css || ''}`, text);
  e._base = 'translate(-50%,-50%)'; e._rot = o.rot ?? 0;
  e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// texto grande em serifa (números, anos, rótulos curtos)
function serifText(p, text, cx, cy, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;white-space:nowrap;font-family:${SERIF};font-weight:${o.wt ?? 600};font-size:${o.s ?? 120}px;line-height:1;color:${o.c ?? K.ink};` +
    `${o.it ? 'font-style:italic;' : ''}text-shadow:${o.sh ?? '-3px 4px 0 rgba(0,0,0,.28), 0 10px 22px rgba(0,0,0,.25)'};opacity:0;${o.css || ''}`, text);
  e._base = 'translate(-50%,-50%)'; e._rot = o.rot ?? 0;
  e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// máquina de escrever com cursor (como o "1799" do exemplo)
function typeIn(e, full, lt, t0, cps = 14, cursor = true) {
  if (lt < t0) { e.style.opacity = 0; return; }
  const n = Math.min(full.length, Math.floor((lt - t0) * cps) + 1), done = n >= full.length;
  e.style.opacity = 1;
  const cur = cursor && (!done || (lt - t0 - full.length / cps) < .5) && Math.floor(lt * 3) % 2 === 0;
  e.innerHTML = esc(full.slice(0, n)) + `<span style="display:inline-block;width:.06em;height:.9em;margin-left:.06em;vertical-align:-.08em;background:currentColor;opacity:${cur ? .9 : 0};"></span>`;
}
// carimbo de tinta (falhas) — anime com stampIn(e, lt, t)
function inkStamp(p, text, cx, cy, o = {}) {
  const m = stampMask(), c = o.c ?? K.vermelho;
  const e = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;white-space:nowrap;font-family:${SERIF};font-weight:700;font-size:${o.s ?? 110}px;letter-spacing:.06em;line-height:1.1;color:${c};` +
    `border:10px solid ${c};padding:4px 34px 0;border-radius:12px;opacity:0;-webkit-mask-image:url(${m});mask-image:url(${m});-webkit-mask-size:100% 100%;mask-size:100% 100%;`, text);
  e._base = 'translate(-50%,-50%)'; e._rot = o.rot ?? -12;
  return e;
}
// traço feito à mão (g.draw(0..1)) — AMARELO e grosso por padrão (motion colorido); passe o.c para outra cor viva
// (em bloco amarelo use K.vermelho/K.dark; K.ink só quando a cor já estiver no resto do quadro)
function scribble(svg, d, o = {}) {
  const g = sv(svg, 'g', { transform: o.tf || '' });
  const pth = prep(sv(g, 'path', { d, fill: 'none', stroke: o.c ?? K.amarelo, 'stroke-width': o.w ?? 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: 'filter:drop-shadow(-1px 2px 0 rgba(0,0,0,.28))' }));
  g.draw = q => draw(pth, q);
  return g;
}
// seta com laço apontando para cima (a do exemplo): ponta em (x, y-90*s), base em (x, y+90*s)
const LOOP_ARROW = 'M 30 190 C 10 150, 15 112, 45 102 C 80 92, 96 122, 76 142 C 56 160, 38 132, 49 106 C 60 76, 56 42, 50 12 M 34 31 L 50 10 L 65 29';
const loopArrow = (svg, x, y, s = 1, rot = 0, o = {}) => scribble(svg, LOOP_ARROW, { ...o, tf: `translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-50 -100)` });
// círculo à mão (contorno irregular)
function roughRing(svg, cx, cy, rx, ry, o = {}) {
  let d = '';
  for (let i = 0; i <= 64; i++) { const a = -Math.PI / 2 + i / 64 * Math.PI * 2.12, k = 1 + .04 * Math.sin(i * 1.7 + (o.seed ?? 1)); d += `${i ? 'L' : 'M'}${(cx + rx * k * Math.cos(a)).toFixed(1)},${(cy + ry * k * Math.sin(a)).toFixed(1)}`; }
  return scribble(svg, d, o);
}
// seta circular (ex.: "devolver") e brilho de 4 pontas
function arcArrow(cx, cy, r, a0, a1) {
  let d = '';
  for (let i = 0; i <= 40; i++) { const a = (a0 + (a1 - a0) * i / 40) * Math.PI / 180, k = 1 + .03 * Math.sin(i * .9); d += `${i ? 'L' : 'M'}${(cx + r * k * Math.cos(a)).toFixed(1)},${(cy + r * k * Math.sin(a)).toFixed(1)}`; }
  const ae = a1 * Math.PI / 180, ex = cx + r * Math.cos(ae), ey = cy + r * Math.sin(ae), dir = Math.sign(a1 - a0), ux = -Math.sin(ae) * dir, uy = Math.cos(ae) * dir, L = 30, w = .55;
  return d + ` M${(ex - L * (ux - w * uy)).toFixed(1)},${(ey - L * (uy + w * ux)).toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${(ex - L * (ux + w * uy)).toFixed(1)},${(ey - L * (uy - w * ux)).toFixed(1)}`;
}
const sparkleD = (x, y, r) => `M${x},${y - r} Q${x},${y} ${x + r},${y} Q${x},${y} ${x},${y + r} Q${x},${y} ${x - r},${y} Q${x},${y} ${x},${y - r}`;
const HEART = 'M 50 88 C 20 66, 4 48, 8 30 C 12 12, 34 8, 50 28 C 66 8, 88 12, 92 30 C 96 48, 80 66, 50 88 Z';
// recorte de jornal (manchete REAL, papel-jornal, fita, marca-texto amarelo nas palavras ditas): g.upd(lt, at, {out}), g.mk(chave, 0..1)
function clipping(p, o) {
  const w = o.w ?? 900;
  const g = el(p, 'div', `position:absolute;left:${(o.cx ?? 540) - w / 2}px;top:${o.top ?? 300}px;width:${w}px;opacity:0;transform-origin:50% 0%;`);
  const card = el(g, 'div', `position:relative;background:#ebe6da url(${ptex('#ebe6da', 60)});padding:38px 46px 34px;box-shadow:0 26px 40px rgba(0,0,0,.42), 0 2px 5px rgba(0,0,0,.25);color:#161616;` +
    'clip-path:polygon(0 1%,3% 0,7% .8%,12% .2%,18% 1%,25% .1%,33% .9%,41% 0,50% .7%,58% .1%,66% 1%,74% .2%,82% .8%,90% 0,96% .9%,100% .3%,99.6% 50%,100% 99%,95% 100%,88% 99.2%,80% 100%,71% 99.3%,62% 100%,53% 99.1%,44% 100%,35% 99.4%,26% 100%,17% 99.2%,8% 100%,0 99.4%,.4% 50%);');
  el(card, 'div', 'font-family:Inter;font-weight:800;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#555;border-bottom:2px solid #1d1d1d;padding-bottom:12px;margin-bottom:18px;', esc(o.kicker));
  g.spans = {};
  const seg = (bx, segs) => segs.forEach(([t, k]) => { const s = el(bx, 'span', k ? MK('#ffe600') + 'padding:0 .05em;' : '', esc(t)); if (k) g.spans[k] = s; });
  seg(el(card, 'div', `font-family:${SERIF};font-weight:700;font-size:${o.ts ?? 54}px;line-height:1.12;`), o.title);
  if (o.body) seg(el(card, 'div', `font-family:${SERIF};font-weight:400;font-size:${o.bs ?? 30}px;line-height:1.45;color:#262626;margin-top:18px;`), o.body);
  if (o.foot) el(card, 'div', 'font-family:Inter;font-weight:500;font-size:21px;color:#666;margin-top:16px;', esc(o.foot));
  const tp = (x, r) => el(g, 'div', `position:absolute;left:${x}px;top:-20px;width:170px;height:48px;transform:rotate(${r}deg);background:rgba(201,192,222,.82) url(${ptex('#c9c0de', 30)});background-blend-mode:multiply;` +
    'clip-path:polygon(0 8%,4% 0,9% 9%,14% 2%,20% 8%,80% 6%,86% 0,91% 8%,96% 1%,100% 9%,100% 92%,95% 100%,90% 91%,84% 99%,78% 92%,22% 94%,16% 100%,10% 92%,5% 99%,0 91%);');
  tp(w * .5 - 85, o.tr ?? 3);
  g.mk = (k, q) => { if (g.spans[k]) mkSet(g.spans[k], q); };
  g.upd = (lt, at, o2 = {}) => {
    if (lt < at) { g.style.opacity = 0; return; }
    const q = E.out5(clamp((lt - at) / .45)), u = lt - at;
    const out = o2.out !== undefined && lt > o2.out ? E.in(clamp((lt - o2.out) / .3)) : 0;
    g.style.opacity = 1;
    g.style.transform = `translate(${(o2.x ?? 0)}px,${((1 - q) * -900 + 1500 * out + (o2.y ?? 0)).toFixed(1)}px) rotate(${((o.rot ?? -1.5) + 6 * (1 - q) + .3 * Math.sin(u * .8)).toFixed(2)}deg) scale(${(o2.s ?? 1).toFixed(3)})`;
  };
  return g;
}
// régua do tempo (marcas claras; o.c = cor viva). marca grande a cada step*big px; set(px) desliza.
// marca grande exatamente em x=540: px ≡ (step*big*m − 740), ex. step 24/big 5 -> 220; step 24/big 10 -> −20 ou 220
function ruler(p, y, o = {}) {
  const step = o.step ?? 24, big = o.big ?? 10, c = o.c ?? K.ink;
  const g = el(p, 'div', `position:absolute;left:0;top:${y}px;width:1080px;height:90px;opacity:0;`);
  g.a = el(g, 'div', `position:absolute;left:-200px;right:-200px;top:30px;height:34px;background:repeating-linear-gradient(90deg, ${c} 0 3px, rgba(0,0,0,0) 3px ${step}px);opacity:.92;`);
  g.b = el(g, 'div', `position:absolute;left:-200px;right:-200px;top:6px;height:58px;background:repeating-linear-gradient(90deg, ${c} 0 4px, rgba(0,0,0,0) 4px ${step * big}px);`);
  g.c = el(g, 'div', `position:absolute;left:-200px;right:-200px;top:62px;height:3px;background:${c};`);
  g.set = px => { const v = `${(-px).toFixed(1)}px 0`; g.a.style.backgroundPosition = v; g.b.style.backgroundPosition = v; };
  g.style.filter = 'drop-shadow(-1px 2px 0 rgba(0,0,0,.25))';
  return g;
}

// ---------- COR VIVA E ATENÇÃO (ajuste de 14/10/2026) ----------
// Todo quadro precisa de cor viva ocupando boa parte da tela (confira com checar_cores.py). raios(), formas() e cortina()
// são tempero: 2 a 4 usos de cada por vídeo, nos momentos mais fortes (gancho, viradas, números, final).

// recorte colorido com a cor reforçada: viva(cut(...), 1.2). o sombra = '0 18px 24px rgba(0,0,0,.35)' se quiser sombra
function viva(e, k = 1.2, sombra = '') {
  const im = e.img || e;
  im.style.filter = `saturate(${k}) contrast(1.06)${sombra ? ` drop-shadow(${sombra})` : ''}`;
  return e;
}
// duotone em cores vivas para imagem P&B (biblioteca, foto antiga, foto escura de vídeo anterior): sombras -> escura, luzes -> clara.
// duotone(hero(...).img, '#1b1464', K.amarelo) · duotone(cut(...).img, K.azul, K.laranja). Em foto de pessoa real, prefira a impressão colorida.
function duotone(img, escura, clara, o = {}) {
  const id = 'duo_' + (escura + clara).replace(/[^0-9a-z]/gi, '');
  if (!document.getElementById(id)) {
    let defs = document.getElementById('duodefs');
    if (!defs) { defs = sv(document.body, 'svg', { id: 'duodefs', width: 0, height: 0 }); defs.style.cssText = 'position:absolute;width:0;height:0;'; }
    const hx = c => [1, 3, 5].map(i => (parseInt(c.slice(i, i + 2), 16) / 255).toFixed(3));
    const a = hx(escura), b = hx(clara);
    const f = sv(defs, 'filter', { id, 'color-interpolation-filters': 'sRGB', x: 0, y: 0, width: 1, height: 1 });
    sv(f, 'feColorMatrix', { type: 'matrix', values: '.2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 .2126 .7152 .0722 0 0 0 0 0 1 0' });
    const ct = sv(f, 'feComponentTransfer', {});
    ['R', 'G', 'B'].forEach((ch, i) => sv(ct, `feFunc${ch}`, { type: 'table', tableValues: `${a[i]} ${b[i]}` }));
  }
  img.style.filter = `url(#${id}) contrast(${o.ct ?? 1.08})${o.sombra ? ` drop-shadow(${o.sombra})` : ''}`;
  return img;
}
// soco de escala na palavra-chave; passe como s: em riseIn/dropIn/live (continua um controlador só por elemento)
const soco = (lt, t, a = .14, d = .32) => lt < t ? 1 : 1 + a * Math.sin(Math.PI * clamp((lt - t) / d));
// raios de papel em duas cores vivas atrás do assunto; entram girando com mola e seguem girando devagar.
// b = raios(r, 540, 1050, { c1: K.amarelo, c2: K.laranja, r: 640, n: 18 }) (crie ANTES do recorte); no update: b.at(lt, t, { out })
// o.tela = true: os raios enchem o fundo inteiro em vez de formar um disco
function raios(p, cx, cy, o = {}) {
  const R = o.tela ? Math.hypot(Math.max(cx, 1080 - cx), Math.max(cy, 1920 - cy)) + 30 : (o.r ?? 640);
  const n = o.n ?? 18, st = 360 / n, c1 = o.c1 ?? K.amarelo, c2 = o.c2 ?? K.laranja;
  const e = el(p, 'div', `position:absolute;left:${(cx - R).toFixed(0)}px;top:${(cy - R).toFixed(0)}px;width:${(2 * R).toFixed(0)}px;height:${(2 * R).toFixed(0)}px;border-radius:50%;opacity:0;` +
    `background:url(${ptex('#efece4', 30)}), repeating-conic-gradient(from 0deg, ${c1} 0deg ${st / 2}deg, ${c2} ${st / 2}deg ${st}deg);background-blend-mode:multiply;` +
    (o.tela ? '' : 'box-shadow:0 18px 40px rgba(0,0,0,.25);'));
  e.at = (lt, t, q = {}) => {
    if (lt < t) { e.style.opacity = 0; return 0; }
    const u = lt - t, k = E.back(clamp(u / (q.d ?? .4))), out = q.out !== undefined && lt > q.out ? E.in(clamp((lt - q.out) / .25)) : 0;
    e.style.opacity = 1;
    e.style.transform = `rotate(${((o.rot0 ?? -30) * (1 - k) + u * (o.vel ?? 7)).toFixed(2)}deg) scale(${(k * (1 - out)).toFixed(4)})`;
    return k;
  };
  return e;
}
// formas de papel em cores vivas (círculo, meia-lua, triângulo, zigue-zague, estrela, anel, cruz) que estouram em volta do
// assunto na palavra-chave e ficam flutuando. f = formas(r, 540, 1050, { r: 380, n: 8, seed: 2 }); no update: f.at(lt, t, { out })
function formas(p, cx, cy, o = {}) {
  const n = o.n ?? 8, R = o.r ?? 360, ry = o.ry ?? 1.15, sd = o.seed ?? 3;
  const cores = o.cores ?? [K.amarelo, K.rosa, K.ciano, K.laranja, K.verde, K.roxo, K.azul];
  const tipos = o.tipos ?? ['circulo', 'tri', 'zigue', 'estrela', 'meia', 'anel', 'cruz'];
  const g = el(p, 'div', 'position:absolute;inset:0;pointer-events:none;');
  g.items = [...Array(n)].map((_, i) => {
    const a = -Math.PI / 2 + i / n * 2 * Math.PI + (hrand(sd * 31 + i) - .5) * .5, rr = R * (.82 + .36 * hrand(sd * 17 + i));
    const s = (o.s ?? 100) * (.75 + .5 * hrand(sd * 7 + i)), col = cores[(i + sd) % cores.length], tp = tipos[(i * 3 + sd) % tipos.length];
    const sh = el(g, 'div', `position:absolute;left:${(cx - s / 2).toFixed(0)}px;top:${(cy - s / 2).toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;opacity:0;filter:drop-shadow(-2px 5px 0 rgba(0,0,0,.22));`);
    const tex = `background:${col} url(${ptex('#efece4', 30)});background-blend-mode:multiply;`;
    el(sh, 'div', {
      circulo: `${tex}width:100%;height:100%;border-radius:50%;`,
      meia: `${tex}width:100%;height:50%;margin-top:25%;border-radius:${(s / 2).toFixed(0)}px ${(s / 2).toFixed(0)}px 0 0;`,
      tri: `${tex}width:100%;height:100%;clip-path:polygon(50% 6%,96% 90%,4% 90%);`,
      zigue: `${tex}width:130%;height:38%;margin:31% 0 0 -15%;clip-path:polygon(0 45%,12.5% 0,25% 45%,37.5% 0,50% 45%,62.5% 0,75% 45%,87.5% 0,100% 45%,100% 100%,87.5% 55%,75% 100%,62.5% 55%,50% 100%,37.5% 55%,25% 100%,12.5% 55%,0 100%);`,
      estrela: `${tex}width:100%;height:100%;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);`,
      anel: `width:100%;height:100%;border-radius:50%;border:${(s * .18).toFixed(0)}px solid ${col};box-sizing:border-box;`,
      cruz: `${tex}width:100%;height:100%;clip-path:polygon(37% 0,63% 0,63% 37%,100% 37%,100% 63%,63% 63%,63% 100%,37% 100%,37% 63%,0 63%,0 37%,37% 37%);`,
    }[tp]);
    return { e: sh, x: Math.cos(a) * rr, y: Math.sin(a) * rr * ry, r0: (hrand(sd * 13 + i) - .5) * 90, sp: (hrand(sd * 5 + i) - .5) * 60 };
  });
  g.at = (lt, t, q = {}) => g.items.forEach((it, i) => {
    const u = lt - t - i * .03;
    if (u < 0) { it.e.style.opacity = 0; return; }
    const m = E.out5(clamp(u / .5)), k = E.back(clamp(u / .38)), bb = bob(lt, i + sd, 7);
    const out = q.out !== undefined && lt > q.out ? E.in(clamp((lt - q.out) / .25)) : 0;
    it.e.style.opacity = 1;
    it.e.style.transform = `translate(${(it.x * m + bb.x).toFixed(1)}px,${(it.y * m + bb.y).toFixed(1)}px) rotate(${(it.r0 + it.sp * u).toFixed(1)}deg) scale(${(k * (1 - out)).toFixed(3)})`;
  });
  return g;
}
// cortina de papel colorido atravessando a tela (troca de assunto, capítulo, virada): faixas finas + painel que cobre tudo.
// w = cortina(r, { cores: [K.amarelo, K.rosa, K.azul] }) (a última cor é o painel); no update: w.at(lt, t) -> tela toda coberta em t,
// então troque as camadas exatamente em t. Entre duas cenas: crie igual nas duas e chame w.at(lt, c.dur) na que sai e w.at(lt, 0)
// na que entra (com tr: 'cut'). Som: cue(c, 'whoosh', t - .2, { d: .4 }).
function cortina(r, o = {}) {
  const cs = o.cores ?? [K.amarelo, K.rosa, K.azul], d = o.d ?? .6, ang = o.ang ?? -14, fx = o.faixa ?? 150, P = 2100, R = 800, m = cs.length - 1;
  const seq = [...cs.slice(0, m), cs[m], ...cs.slice(0, m).reverse()];
  const ws = seq.map((_, i) => (i === m ? P : fx)), T = ws.reduce((a, b) => a + b, 0), pc = m * fx + P / 2;
  const g = el(r, 'div', 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:4;');
  const rot = el(g, 'div', `position:absolute;left:540px;top:960px;width:0;height:0;transform:rotate(${ang}deg);`);
  const pk = el(rot, 'div', `position:absolute;left:0;top:-1700px;width:${T}px;height:3400px;display:flex;opacity:0;`);
  seq.forEach((c, i) => el(pk, 'div', `flex:none;width:${ws[i]}px;height:100%;background:${c} url(${ptex('#efece4', 30)});background-blend-mode:multiply;box-shadow:-10px 0 24px rgba(0,0,0,.18);`));
  g.at = (lt, t) => {
    const u = (lt - t) / d;
    if (u <= -.5 || u >= .5) { pk.style.opacity = 0; return; }
    pk.style.opacity = 1;
    pk.style.transform = `translateX(${(-pc - u * (2 * R + T)).toFixed(1)}px)`;
  };
  return g;
}

// ---------- apresentador COLORIDO (corte seco; legenda glow no peito; textos nunca nos olhos) ----------
// uso: pres4(listaDeBeats, { lead, capY, build(L,S,c), update(S,c), pb: true para P&B })
function pres4(beats, o = {}) {
  scene({
    beats, tr: o.tr || 'cut', bg: 'dark', presenter: true, camMove: camStill, lead: o.lead,
    build(r, S, c) {
      S.photos.push(S.ph = photo(r, 0, 0, 1080, 1920, { border: 0, tape: false, fy: .40 }));
      S.ph.zoomFn = o.zoomFn || ((lt, c2) => 1.03 + .06 * E.inOut(clamp(lt / c2.dur)));
      S.ph.fr.style.filter = o.pb ? 'grayscale(1) contrast(1.12) brightness(.92)' : 'saturate(1.12) contrast(1.05)';
      el(r, 'div', `position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 66% at 50% 40%, rgba(0,0,0,0) 52%, rgba(0,0,0,${o.pb ? .6 : .42}) 100%);`);
      S.cap = { mode: 'glow', y: o.capY ?? 1460 };
      const L = S.L = el(r.parentNode, 'div', 'position:absolute;inset:0;z-index:3;pointer-events:none;');
      if (o.build) o.build(L, S, c);
    },
    update(S, c) { if (o.update) o.update(S, c); },
  });
}
