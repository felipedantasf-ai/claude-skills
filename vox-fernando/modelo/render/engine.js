// ============================================================================
//  Motor "documentário estilo Vox": colagem de papel, marcador, mapas e recortes
// ============================================================================
const W = 1080, H = 1920, FPS = 30, LEAD = 0.08, TR = 0.26;
const NS = 'http://www.w3.org/2000/svg';
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t,
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOut5: t => (t < .5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2),
  in: t => t * t * t,
  back: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  spring: t => { if (t >= 1) return 1; return 1 - Math.exp(-7 * t) * Math.cos(t * 11); },
};
const P = (lt, s, d, e = E.out) => e(clamp((lt - s) / d));
const $ = id => document.getElementById(id);
const hrand = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]/g, '').toLowerCase();
let UID = 0;
const uid = p => `${p}${UID++}`;

function el(parent, tag, css, html) {
  const e = document.createElement(tag);
  if (css) e.style.cssText = css;
  if (html !== undefined) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}
function sv(parent, tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}
function box(parent, cx, cy, w, h, css = '') {
  const e = el(parent, 'div', `position:absolute;left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;transform-origin:50% 50%;${css}`);
  e._rot = 0;
  return e;
}
function svgAbs(parent, x, y, w, h, css = '') {
  const s = sv(parent, 'svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
  s.style.cssText = `position:absolute;left:${x}px;top:${y}px;overflow:visible;${css}`;
  return s;
}
function prep(path) {
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len} ${len}`;
  path.style.strokeDashoffset = len;
  path.style.visibility = 'hidden';
  path._len = len;
  return path;
}
function draw(path, p) {
  path.style.strokeDashoffset = (path._len * (1 - clamp(p))).toFixed(2);
  path.style.visibility = p > 0.002 ? 'visible' : 'hidden';
}
function setXf(e, { x = 0, y = 0, s = 1, r = 0, o } = {}) {
  e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(r + (e._rot || 0)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
  if (o !== undefined) e.style.opacity = clamp(o).toFixed(3);
}

// ---------- texturas ----------
const TEX = {};
function noiseCanvas(w, h, base, amp, fibers, extra) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  const d = x.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - .5) * amp;
    d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n * .9;
  }
  x.putImageData(d, 0, 0);
  if (fibers) {
    x.globalAlpha = fibers.a; x.strokeStyle = fibers.c;
    for (let i = 0; i < fibers.n; i++) {
      x.lineWidth = .4 + Math.random() * .9; x.beginPath();
      const px = Math.random() * w, py = Math.random() * h;
      x.moveTo(px, py); x.quadraticCurveTo(px + Math.random() * 30 - 15, py + Math.random() * 30 - 15, px + Math.random() * 50 - 25, py + Math.random() * 50 - 25);
      x.stroke();
    }
    x.globalAlpha = 1;
  }
  if (extra) extra(x, w, h);
  return c.toDataURL('image/jpeg', .9);
}
function makeTextures() {
  TEX.light = noiseCanvas(540, 960, '#ece4d3', 18, { a: .07, c: '#6d5b3c', n: 260 }, (x, w, h) => {
    for (let i = 0; i < 10; i++) {
      const cx = Math.random() * w, cy = Math.random() * h, r = 40 + Math.random() * 140;
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(120,95,50,.06)'); g.addColorStop(1, 'rgba(120,95,50,0)');
      x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
  });
  TEX.dark = noiseCanvas(540, 960, '#22252b', 14, { a: .08, c: '#9aa3b5', n: 160 });
  TEX.navy = noiseCanvas(540, 960, '#1b2a3d', 14, { a: .07, c: '#9fb6d6', n: 160 });
  TEX.yellow = noiseCanvas(540, 960, '#fde047', 20, { a: .08, c: '#7a5d00', n: 220 });
  TEX.red = noiseCanvas(540, 960, '#d9412f', 18, { a: .08, c: '#4a0f08', n: 200 });
  TEX.blue = noiseCanvas(540, 960, '#c9dde3', 14, { a: .06, c: '#3c5d6b', n: 160 });
  TEX.grid = noiseCanvas(540, 960, '#efe9dc', 14, { a: .05, c: '#6d5b3c', n: 160 }, (x, w, h) => {
    x.strokeStyle = 'rgba(70,120,160,.18)'; x.lineWidth = 1;
    for (let i = 0; i < w; i += 27) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 0; j < h; j += 27) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
  });
  TEX.cork = noiseCanvas(540, 960, '#b98f5f', 40, { a: .25, c: '#5c3d1c', n: 900 });
  TEX.felt = noiseCanvas(540, 960, '#1d6b45', 22, { a: .1, c: '#0c3a24', n: 400 });
  TEX.paperW = noiseCanvas(256, 256, '#fbf7ec', 12, { a: .06, c: '#6d5b3c', n: 40 });
  TEX.dred = noiseCanvas(540, 960, '#6e1410', 16, { a: .08, c: '#2a0503', n: 200 });
  TEX.ink = noiseCanvas(540, 960, '#16181c', 12, { a: .07, c: '#8890a0', n: 150 });
  TEX.night = noiseCanvas(540, 960, '#0d1524', 10, { a: .06, c: '#7f98c0', n: 120 });
  TEX.green = noiseCanvas(540, 960, '#1d7046', 16, { a: .08, c: '#062a17', n: 200 });
  TEX.olive = noiseCanvas(540, 960, '#2b2f26', 14, { a: .08, c: '#9aa38a', n: 150 });
  TEX.news = noiseCanvas(256, 256, '#efe7d3', 14, { a: .07, c: '#6d5b3c', n: 50 });
  // grão do filme
  const g = document.createElement('canvas'); g.width = g.height = 256;
  const gx = g.getContext('2d'); const gd = gx.createImageData(256, 256);
  for (let i = 0; i < gd.data.length; i += 4) { const v = Math.random() * 255; gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = v; gd.data[i + 3] = 60 + Math.random() * 40; }
  gx.putImageData(gd, 0, 0);
  $('grain').style.backgroundImage = `url(${g.toDataURL()})`;
  $('cap').style.background = `#fbf7ec url(${TEX.paperW})`;
}

// ---------- texto ----------
function title(parent, html, cx, cy, o = {}) {
  const e = el(parent, 'div', `position:absolute;left:${cx}px;top:${cy}px;white-space:nowrap;font-family:${o.f || 'Archivo'};font-size:${o.s || 120}px;` +
    `line-height:${o.lh || 1};letter-spacing:${o.ls || '-.01em'};color:${o.c || '#141414'};text-transform:${o.tt || 'uppercase'};text-align:center;${o.css || ''}`, html);
  e._base = `translate(-50%,-50%)`;
  e._rot = o.rot || 0;
  e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
const note = (parent, html, cx, cy, o = {}) => title(parent, html, cx, cy, { f: 'Marker', tt: 'none', ls: '0', c: o.c || '#e63b2e', ...o });
const typed = (parent, html, cx, cy, o = {}) => title(parent, html, cx, cy, { f: 'Elite', tt: 'none', ls: '0', s: o.s || 40, ...o });
function tx(e, { x = 0, y = 0, s = 1, r = 0, o } = {}) {
  e.style.transform = `${e._base || ''} translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(r + (e._rot || 0)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
  if (o !== undefined) e.style.opacity = clamp(o).toFixed(3);
}

// ---------- animações de entrada ----------
// "tapa": entra grande, assenta com leve balanço
function slap(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const d = o.d ?? .42, p = clamp((lt - at) / d);
  const s = lerp(o.s0 ?? 1.45, 1, E.back(p));
  const r = (o.r0 ?? 7) * (1 - E.out5(p));
  tx(e, { s, r, o: clamp((lt - at) / .06) });
  return p;
}
function pop(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const p = clamp((lt - at) / (o.d ?? .5));
  tx(e, { s: lerp(o.s0 ?? .2, 1, E.spring(p)), o: clamp((lt - at) / .08) });
  return p;
}
function slide(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const p = P(lt, at, o.d ?? .45, E.out5);
  tx(e, { x: (o.dx ?? -900) * (1 - p), y: (o.dy ?? 0) * (1 - p), r: (o.r0 ?? 0) * (1 - p), o: 1 });
  return p;
}
function rise(e, lt, at, o = {}) {
  if (lt < at) { e.style.opacity = 0; return 0; }
  const p = P(lt, at, o.d ?? .5, E.out5);
  tx(e, { y: (o.dy ?? 80) * (1 - p), s: lerp(.9, 1, p), o: p });
  return p;
}
function hide(e) { e.style.opacity = 0; }
function shakeXY(lt, hits) {
  let x = 0, y = 0, r = 0;
  for (const [at, amp] of hits) {
    const d = lt - at;
    if (d >= 0 && d < .5) { const a = amp * Math.exp(-d * 10); x += a * Math.sin(d * 90); y += a * Math.cos(d * 77); r += a * .03 * Math.sin(d * 60); }
  }
  return { x, y, r };
}

// ---------- colagem ----------
// adesivo recortado: ícone com borda branca grossa + sombra
function sticker(parent, name, cx, cy, size, color = '#141414', o = {}) {
  const b = box(parent, cx, cy, size, size);
  b._base = '';
  b._rot = o.rot ?? 0;
  const inner = el(b, 'div', `position:absolute;inset:0;filter:drop-shadow(0 ${size * .05}px ${size * .05}px rgba(0,0,0,.38));`);
  const isM = !ICONS[name] && window.MDI && MDI[name];
  const paths = ICONS[name] || (isM ? MDI[name].d : null);
  if (!paths) throw new Error('ícone ausente ' + name);
  const u = isM ? 24 / 256 : 1;
  const s = sv(inner, 'svg', { viewBox: isM ? MDI[name].vb : '0 0 256 256', width: size, height: size });
  s.style.overflow = 'visible';
  if (o.border !== false) paths.forEach(d => sv(s, 'path', { d, fill: '#fff', stroke: '#fff', 'stroke-width': (o.sw ?? 30) * u, 'stroke-linejoin': 'round' }));
  paths.forEach(d => sv(s, 'path', { d, fill: color }));
  if (o.halftone) {
    const pid = uid('ht');
    const pat = sv(sv(s, 'defs'), 'pattern', { id: pid, width: 9 * u, height: 9 * u, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(30)' });
    sv(pat, 'circle', { cx: 4.5 * u, cy: 4.5 * u, r: 2.1 * u, fill: 'rgba(0,0,0,.22)' });
    paths.forEach(d => sv(s, 'path', { d, fill: `url(#${pid})` }));
  }
  b.style.transform = `rotate(${b._rot}deg)`;
  b.inner = inner; b.svg = s;
  return b;
}
// tira de papel rasgado com texto
const _mc = document.createElement('canvas').getContext('2d');
function textW(txt, font) { _mc.font = font; return _mc.measureText(txt).width; }
function strip(parent, html, cx, cy, o = {}) {
  const fam = o.f || 'Archivo';
  const plain = String(html).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
  let fs = o.s || 72;
  let tw = textW((o.tt || 'uppercase') === 'uppercase' ? plain.toUpperCase() : plain, `${fs}px ${fam}`);
  if (tw + 100 > 1000) { fs = fs * 900 / tw; tw = 900; }
  o = { ...o, s: fs };
  const w = Math.max(o.w ?? 760, tw + 100), h = o.h ?? 150;
  cx = clamp(cx, 30 + w / 2, 1050 - w / 2);
  const b = box(parent, cx, cy, w, h);
  b._rot = o.rot ?? -3;
  const pts = [];
  const seed = o.seed ?? 3;
  const n = Math.round(w / 22);
  for (let i = 0; i <= n; i++) pts.push(`${(i / n * 100).toFixed(2)}% ${(hrand(seed + i) * 7).toFixed(2)}%`);
  for (let i = n; i >= 0; i--) pts.push(`${(i / n * 100).toFixed(2)}% ${(100 - hrand(seed + 50 + i) * 7).toFixed(2)}%`);
  const sh = el(b, 'div', `position:absolute;inset:0;filter:drop-shadow(0 10px 12px rgba(0,0,0,.35));`);
  const texUrl = o.tex !== undefined ? o.tex : (o.bg ? null : TEX.paperW);
  const paper = el(sh, 'div', `position:absolute;inset:0;clip-path:polygon(${pts.join(',')});background:${o.bg || '#fbf7ec'}${texUrl ? ` url(${texUrl})` : ''};` +
    `display:flex;align-items:center;justify-content:center;font-family:${o.f || 'Archivo'};font-size:${o.s || 72}px;color:${o.c || '#141414'};` +
    `text-transform:${o.tt || 'uppercase'};letter-spacing:${o.ls || '0'};white-space:nowrap;line-height:1;padding-top:${o.pt ?? 6}px;`, html);
  b.paper = paper;
  b.style.transform = `rotate(${b._rot}deg)`;
  return b;
}
// marca-texto amarelo atrás de um texto (cresce da esquerda)
function highlight(parent, x, y, w, h, o = {}) {
  const e = el(parent, 'div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${o.c || '#ffe600'};` +
    `transform-origin:0 50%;transform:skewX(-8deg) scaleX(0);border-radius:6px;${o.blend === false ? '' : 'mix-blend-mode:multiply;'}opacity:.92;`);
  e.grow = p => { e.style.transform = `skewX(-8deg) scaleX(${clamp(p).toFixed(3)})`; };
  return e;
}
// traço de marcador irregular
function roughPath(points, jit = 4, seed = 1) {
  const pts = points.map(([x, y], i) => [x + (hrand(seed + i * 3.1) - .5) * jit, y + (hrand(seed + i * 5.7) - .5) * jit]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
    d += ` Q${p0[0].toFixed(1)},${p0[1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const L = pts[pts.length - 1];
  return d + ` L${L[0].toFixed(1)},${L[1].toFixed(1)}`;
}
function roughCircle(cx, cy, rx, ry, turns = 1.12, seed = 1) {
  const pts = [], N = 40;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI * .6 + (i / N) * Math.PI * 2 * turns;
    const k = 1 + .05 * Math.sin(i * .9 + seed) + .025 * Math.sin(i * 2.7 + seed * 3);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return roughPath(pts, 3, seed);
}
function marker(svg, d, o = {}) {
  const g = sv(svg, 'g', {});
  const main = prep(sv(g, 'path', { d, fill: 'none', stroke: o.c || '#e63b2e', 'stroke-width': o.w || 12, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .95 }));
  const ghost = prep(sv(g, 'path', { d, fill: 'none', stroke: o.c || '#e63b2e', 'stroke-width': (o.w || 12) * .45, 'stroke-linecap': 'round', opacity: .5, transform: 'translate(2.5 -2)' }));
  g.draw = p => { draw(main, p); draw(ghost, p); };
  g.draw(0);
  return g;
}
// seta desenhada à mão (corpo + ponta)
function arrowPath(x0, y0, x1, y1, bend = .2, seed = 2) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
  const pts = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14; pts.push([(1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1]); }
  const body = roughPath(pts, 3, seed);
  const ang = Math.atan2(y1 - my, x1 - mx), L = 42;
  const a1 = [x1 - L * Math.cos(ang - .5), y1 - L * Math.sin(ang - .5)], a2 = [x1 - L * Math.cos(ang + .5), y1 - L * Math.sin(ang + .5)];
  return { body, head: `M${a1[0].toFixed(1)},${a1[1].toFixed(1)} L${x1},${y1} L${a2[0].toFixed(1)},${a2[1].toFixed(1)}` };
}
function handArrow(svg, x0, y0, x1, y1, o = {}) {
  const { body, head } = arrowPath(x0, y0, x1, y1, o.bend ?? .2, o.seed ?? 2);
  const a = marker(svg, body, o), h = marker(svg, head, o);
  return { draw: p => { a.draw(clamp(p / .78)); h.draw(clamp((p - .75) / .25)); } };
}
function tape(parent, cx, cy, w = 150, rot = -12) {
  const t = box(parent, cx, cy, w, 46, `background:rgba(236,226,198,.82);box-shadow:0 2px 4px rgba(0,0,0,.15);` +
    `clip-path:polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,96% 12%,100% 22%,96% 40%,100% 60%,96% 80%,100% 100%,0 100%,4% 86%,0 70%,4% 50%,0 30%);`);
  t._rot = rot;
  t.style.transform = `rotate(${rot}deg)`;
  return t;
}
// foto (apresentador) em moldura de papel
function photo(parent, x, y, w, h, o = {}) {
  const bd = o.border ?? 18;
  const fr = el(parent, 'div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 50%;` +
    `${bd ? `background:#fbf7ec url(${TEX.paperW});padding:${bd}px;box-shadow:0 26px 46px rgba(0,0,0,.45);` : ''}`);
  fr._rot = o.rot ?? 0;
  fr.style.transform = `rotate(${fr._rot}deg)`;
  const inner = el(fr, 'div', 'position:relative;width:100%;height:100%;overflow:hidden;background:#111;');
  const img = el(inner, 'img', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;');
  const ph = { fr, inner, img, w: w - 2 * bd, h: h - 2 * bd, zoom: o.zoom ?? 1, fy: o.fy ?? .44, cur: -1 };
  if (o.tape !== false && bd) { tape(fr, w * .5, -6, 170, -4 + (o.rot ?? 0) * .4); }
  return ph;
}
async function updatePhoto(ph, frame, zoomMul = 1) {
  const f = Math.min(NFR - 1, Math.max(0, frame));
  if (ph.cur !== f) {
    ph.img.src = `../work/frames/${String(f + 1).padStart(5, "0")}.jpg`;   // o ffmpeg numera a partir de 00001
    try { await ph.img.decode(); } catch (e) { }
    ph.cur = f;
  }
  const fx = FACE.cx[f] ?? 540, fy = FACE.cy[f] ?? 760;
  const k = Math.max(ph.w / 1080, ph.h / 1920) * ph.zoom * zoomMul;
  const txv = clamp(ph.w / 2 - fx * k, ph.w - 1080 * k, 0), tyv = clamp(ph.h * ph.fy - fy * k, ph.h - 1920 * k, 0);
  ph.img.style.transform = `translate(${txv.toFixed(1)}px,${tyv.toFixed(1)}px) scale(${k.toFixed(4)})`;
}
// cédula estilizada
function banknote(parent, cx, cy, w, kind = 'brl', o = {}) {
  const h = w * .46;
  const b = box(parent, cx, cy, w, h);
  b._rot = o.rot ?? 0;
  const col = kind === 'usd' ? ['#9fc79a', '#4f7f4c', '#2f5a2c'] : ['#8fc6d8', '#3f8aa6', '#1f5d75'];
  const sym = kind === 'usd' ? '$' : 'R$';
  const n = el(b, 'div', `position:absolute;inset:0;border-radius:10px;background:linear-gradient(135deg, ${col[0]}, ${col[1]});` +
    `border:${w * .012}px solid #fbf7ec;box-shadow:0 ${w * .03}px ${w * .05}px rgba(0,0,0,.4);overflow:hidden;`);
  el(n, 'div', `position:absolute;inset:${w * .035}px;border:${w * .008}px solid rgba(255,255,255,.55);border-radius:6px;`);
  el(n, 'div', `position:absolute;left:${w * .36}px;top:${h * .18}px;width:${h * .64}px;height:${h * .64}px;border-radius:50%;background:rgba(255,255,255,.25);border:${w * .008}px solid rgba(255,255,255,.5);`);
  el(n, 'div', `position:absolute;left:${w * .07}px;top:${h * .12}px;font-family:Archivo;font-size:${h * .3}px;color:${col[2]};`, sym);
  el(n, 'div', `position:absolute;right:${w * .07}px;bottom:${h * .1}px;font-family:Archivo;font-size:${h * .34}px;color:#fbf7ec;text-shadow:0 2px 0 ${col[2]};`, o.v || '100');
  el(n, 'div', `position:absolute;inset:0;background-image:radial-gradient(rgba(0,0,0,.18) 1.4px, transparent 1.6px);background-size:9px 9px;mix-blend-mode:multiply;opacity:.6;`);
  b.style.transform = `rotate(${b._rot}deg)`;
  return b;
}
// página de calendário
function calPage(parent, cx, cy, w, wd, day, mon, o = {}) {
  const h = w * 1.12;
  const b = box(parent, cx, cy, w, h);
  b._rot = o.rot ?? 0;
  const p = el(b, 'div', `position:absolute;inset:0;background:#fbf7ec url(${TEX.paperW});box-shadow:0 18px 30px rgba(0,0,0,.4);overflow:hidden;`);
  el(p, 'div', `position:absolute;left:0;right:0;top:0;height:${h * .24}px;background:#e63b2e;display:flex;align-items:center;justify-content:center;` +
    `font-family:Archivo;font-size:${w * .14}px;color:#fff;letter-spacing:.04em;`, mon);
  el(p, 'div', `position:absolute;left:0;right:0;top:${h * .28}px;text-align:center;font-family:Archivo;font-size:${w * .5}px;line-height:1;color:#141414;`, day);
  el(p, 'div', `position:absolute;left:0;right:0;bottom:${h * .07}px;text-align:center;font-family:Elite;font-size:${w * .12}px;color:#444;`, wd);
  b.style.transform = `rotate(${b._rot}deg)`;
  return b;
}
// recorte de jornal com trecho marcado
function clipping(parent, cx, cy, w, o) {
  const b = box(parent, cx, cy, w, o.h ?? 330);
  b._rot = o.rot ?? -2;
  const pts = [];
  for (let i = 0; i <= 30; i++) pts.push(`${(i / 30 * 100).toFixed(1)}% ${(hrand(i + 7) * 3).toFixed(1)}%`);
  for (let i = 30; i >= 0; i--) pts.push(`${(i / 30 * 100).toFixed(1)}% ${(100 - hrand(i + 90) * 3).toFixed(1)}%`);
  const sh = el(b, 'div', 'position:absolute;inset:0;filter:drop-shadow(0 16px 18px rgba(0,0,0,.4));');
  const p = el(sh, 'div', `position:absolute;inset:0;clip-path:polygon(${pts.join(',')});background:#efe7d3 url(${TEX.news});padding:34px 40px;`);
  el(p, 'div', `font-family:Elite;font-size:28px;color:#444;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:18px;display:flex;justify-content:space-between;`,
    `<span>${esc(o.src)}</span><span>${esc(o.date)}</span>`);
  const hd = el(p, 'div', `font-family:Playfair;font-weight:900;font-size:${o.s || 52}px;line-height:1.12;color:#141414;`);
  o.segs.forEach(([t, m]) => {
    const sp = el(hd, 'span', m ? 'background:linear-gradient(transparent 10%, #ffe600 10%, #ffe600 92%, transparent 92%);background-repeat:no-repeat;background-size:0% 100%;' : '', esc(t));
    if (m) sp.className = 'mk';
  });
  b.mark = pr => b.querySelectorAll('.mk').forEach(s => { s.style.backgroundSize = `${(clamp(pr) * 100).toFixed(1)}% 100%`; });
  b.style.transform = `rotate(${b._rot}deg)`;
  tape(b, w * .5, -4, 180, 3);
  return b;
}
// urna eletrônica (adesivo)
function urna(parent, cx, cy, size, o = {}) {
  const h = size * .74;
  const b = box(parent, cx, cy, size, h);
  b._rot = o.rot ?? 0;
  const s = svgAbs(b, 0, 0, size, h, 'filter:drop-shadow(0 10px 12px rgba(0,0,0,.35));');
  sv(s, 'rect', { x: -10, y: -10, width: size + 20, height: h + 20, rx: size * .12, fill: '#fff' });
  sv(s, 'rect', { x: 0, y: 0, width: size, height: h, rx: size * .1, fill: '#d7d4cc' });
  sv(s, 'rect', { x: size * .07, y: size * .09, width: size * .5, height: size * .44, rx: size * .035, fill: '#244f86' });
  [[.16, .3], [.24, .22], [.32, .26]].forEach(([y, w]) => sv(s, 'rect', { x: size * .12, y: size * y, width: size * w, height: size * .035, rx: size * .017, fill: 'rgba(255,255,255,.6)' }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) sv(s, 'rect', { x: size * (.63 + c * .11), y: size * (.09 + r * .1), width: size * .085, height: size * .07, rx: size * .015, fill: '#3a3a3c' });
  [['#fbf7ec', .63], ['#ff9f0a', .74], ['#30d158', .85]].forEach(([c, x]) => sv(s, 'rect', { x: size * x, y: size * .52, width: size * .09, height: size * .07, rx: size * .015, fill: c }));
  b.style.transform = `rotate(${b._rot}deg)`;
  return b;
}
// mapa-múndi (países em papel; Brasil em destaque)
function worldMap(parent, o = {}) {
  const k = o.k ?? .9;
  const s = svgAbs(parent, o.x ?? 0, o.y ?? 0, WORLD.w * k, WORLD.h * k);
  const g = sv(s, 'g', { transform: `scale(${k})` });
  WORLD.countries.forEach(c => {
    const br = c.n === 'Brazil';
    sv(g, 'path', { d: c.d, fill: br ? '#ffe600' : '#efe6d0', stroke: br ? '#141414' : '#a8987a', 'stroke-width': br ? 3 / k : 1.4 / k, 'stroke-linejoin': 'round' });
  });
  return { s, g, k, pt: key => [(o.x ?? 0) + WORLD.pts[key][0] * k, (o.y ?? 0) + WORLD.pts[key][1] * k] };
}
// mapa do Brasil com estados
function brMap(parent, cx, cy, w, o = {}) {
  const k = w / 900, hgt = 870 * k;
  const s = svgAbs(parent, cx - w / 2, cy - hgt / 2, w, hgt, `filter:drop-shadow(0 16px 20px rgba(0,0,0,.35));transform-origin:50% 50%;`);
  const g = sv(s, 'g', { transform: `translate(${(-90 * k).toFixed(2)} ${(-510 * k).toFixed(2)}) scale(${k.toFixed(4)})` });
  if (o.border !== false) sv(g, 'path', { d: BRGEO.country, fill: '#fff', stroke: '#fff', 'stroke-width': 26 / k * .5, 'stroke-linejoin': 'round' });
  const fill = sv(g, 'path', { d: BRGEO.country, fill: o.fill || '#ffe600' });
  const pid = uid('ht');
  const pat = sv(sv(s, 'defs'), 'pattern', { id: pid, width: 10 / k, height: 10 / k, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(30)' });
  sv(pat, 'circle', { cx: 5 / k, cy: 5 / k, r: 2.2 / k, fill: 'rgba(0,0,0,.16)' });
  sv(g, 'path', { d: BRGEO.country, fill: `url(#${pid})` });
  const st = sv(g, 'g', { fill: 'none', stroke: o.stateStroke || 'rgba(20,20,20,.35)', 'stroke-width': 1.6 / k, 'stroke-linejoin': 'round' });
  BRGEO.states.forEach(x => sv(st, 'path', { d: x.d }));
  sv(g, 'path', { d: BRGEO.country, fill: 'none', stroke: '#141414', 'stroke-width': 4 / k, 'stroke-linejoin': 'round' });
  const to = (X, Y) => [cx - w / 2 + (X - 90) * k, cy - hgt / 2 + (Y - 510) * k];
  const sp = to(...(BRGEO.states.find(z => z.uf === 'SP') ? [BRGEO.states.find(z => z.uf === 'SP').cx, BRGEO.states.find(z => z.uf === 'SP').cy] : [700, 1150]));
  return { s, fill, st, k, to, sp, states: BRGEO.states.map(z => ({ uf: z.uf, p: to(z.cx, z.cy) })) };
}

// ---------- registro de cenas ----------
const SCENES = [];
const EVENTS = [];
function scene(def) { SCENES.push(def); }
function makeCtx(s, byId) {
  const c = {};
  c.t0 = s.t0;
  c.b = id => byId[id].start - s.t0;
  c.e = id => byId[id].end - s.t0;
  c.findWord = (id, k) => {
    const ws = byId[id].words;
    if (typeof k === 'number') return ws[Math.min(k < 0 ? ws.length + k : k, ws.length - 1)];
    const nk = norm(k);
    return ws.find(w => norm(w.w).startsWith(nk)) ?? ws[0];
  };
  c.w = (id, k) => c.findWord(id, k).s - s.t0;
  return c;
}
let BYID = {};
function setup() {
  makeTextures();
  if (window.extraTex) extraTex();
  TIMING.beats.forEach((b, i) => { BYID[b.id] = { ...b, i }; });
  SCENES.forEach((s, k) => { s.t0 = k === 0 ? 0 : Math.max(0, BYID[s.beats[0]].start - (s.lead ?? LEAD)); });
  SCENES.forEach((s, k) => { s.t1 = k < SCENES.length - 1 ? SCENES[k + 1].t0 : TIMING.videoDur; s.dur = s.t1 - s.t0; s.k = k; });
  SCENES.forEach(s => {
    s.ctx = makeCtx(s, BYID);
    s.ctx.dur = s.dur; s.ctx.lt = 0;
    s.root = el($('scenes'), 'div', 'display:block;visibility:hidden;');
    s.root.className = 'sroot';
    s.bgEl = el(s.root, 'div', '');
    s.bgEl.className = 'sbg';
    s.bgEl.style.backgroundImage = `url(${TEX[s.bg || 'light']})`;
    s.cam = el(s.root, 'div', '');
    s.cam.className = 'scam';
    s.S = { photos: [] };
    s.build(s.cam, s.S, s.ctx);
    s.root.style.display = 'none'; s.root.style.visibility = 'visible';
    if (s.k > 0) EVENTS.push({ t: s.t0, type: 'tr:' + (s.tr || 'slideL') });
  });
  buildCaptionChunks();
  window.EVENTS_OUT = EVENTS;
}

// ---------- legendas (tira de papel, palavra atual com marca-texto) ----------
let CHUNKS = [];
function buildCaptionChunks() {
  TIMING.beats.forEach(b => {
    let cur = [];
    const flush = () => { if (cur.length) { CHUNKS.push({ words: cur }); cur = []; } };
    b.words.forEach((w, i) => {
      cur.push(w);
      const chars = cur.map(x => x.w).join(' ').length;
      const nxt = b.words[i + 1];
      if (/[,.;:?!]$/.test(w.w) || cur.length >= 3 || (nxt && chars + 1 + nxt.w.length > 18)) flush();
    });
    flush();
  });
  CHUNKS.forEach(c => { c.s = c.words[0].s - 0.04; });
  CHUNKS.forEach((c, i) => {
    const nxt = CHUNKS[i + 1];
    const end = c.words[c.words.length - 1].e;
    c.e = nxt ? Math.min(nxt.s, end + .45) : end + .8;
  });
}
let lastChunk = -1;
function renderCaptions(t) {
  const box = $('cap');
  let idx = -1;
  for (let i = 0; i < CHUNKS.length; i++) { if (t >= CHUNKS[i].s && t < CHUNKS[i].e) { idx = i; break; } }
  if (idx !== lastChunk) {
    lastChunk = idx;
    box.innerHTML = idx < 0 ? '' : CHUNKS[idx].words.map(w => `<span>${esc(w.w.replace(/[,.;:]$/, ''))}</span>`).join(' ');
  }
  if (idx < 0) { box.style.opacity = 0; return; }
  const c = CHUNKS[idx];
  const spans = box.querySelectorAll('span');
  let active = -1;
  c.words.forEach((w, i) => { if (t >= w.s - .02) active = i; });
  const CC = window.CAP_COLORS || { done: '#141414', todo: 'rgba(20,20,20,.38)', act: '#141414', actBg: '#ffe600' };
  spans.forEach((sp, i) => {
    sp.style.color = i === active ? CC.act : (i < active ? CC.done : CC.todo);
    sp.style.background = i === active ? CC.actBg : 'transparent';
  });
  const a = P(t, c.s, .12, E.out5);
  box.style.opacity = a.toFixed(3);
  box.style.transform = `translate(-50%,-50%) rotate(${window.CAP_ROT ?? -1.2}deg) scale(${lerp(window.CAP_S0 ?? .86, 1, E.back(clamp((t - c.s) / .2))).toFixed(4)})`;
}

// ---------- quadro ----------
let shown = new Set();
async function render(t) {
  let k = SCENES.length - 1;
  for (let i = 0; i < SCENES.length; i++) { if (t < SCENES[i].t1) { k = i; break; } }
  const s = SCENES[k], prev = k > 0 ? SCENES[k - 1] : null;
  const lt = t - s.t0, frame = Math.round(t * FPS);
  const tr = s.tr || 'slideL';
  const inTr = !!prev && lt < TR && tr !== 'cut' && tr !== 'match';
  const want = new Set([k]); if (inTr) want.add(k - 1);
  SCENES.forEach((x, i) => { const on = want.has(i); if (on !== shown.has(i)) x.root.style.display = on ? 'block' : 'none'; });
  shown = want;
  const run = async (x, tt) => {
    const c = x.ctx; c.lt = tt; c.t = t; c.frame = frame;
    x.update(x.S, c);
    // câmera da cena (movimento contínuo estilo documentário)
    const u = clamp(tt / x.dur);
    const m = x.camMove ? x.camMove(tt, c) : { s: 1 + .09 * u, x: (x.k % 2 ? -1 : 1) * 24 * u, y: -14 * u, r: (x.k % 2 ? .35 : -.35) * u };
    const sh = x.shake ? shakeXY(tt, x.shake(c)) : { x: 0, y: 0, r: 0 };
    x.cam.style.transform = `translate(${(m.x + sh.x).toFixed(1)}px,${(m.y + sh.y).toFixed(1)}px) rotate(${((m.r || 0) + sh.r).toFixed(2)}deg) scale(${m.s.toFixed(4)})`;
    for (const ph of x.S.photos) await updatePhoto(ph, frame, ph.zoomFn ? ph.zoomFn(tt, c) : 1);
    for (const fn of (x.S.async || [])) await fn(tt, c);
  };
  await run(s, lt);
  if (inTr) await run(prev, t - prev.t0);
  // transições
  const r = s.root;
  r.style.zIndex = 2;
  if (inTr) prev.root.style.zIndex = 1;
  const u = clamp(lt / TR), p = E.inOut5(u), bl = Math.sin(Math.PI * u) * 16;
  const setR = (e, x, y, sc, o, b) => {
    e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(4)})`;
    e.style.opacity = o.toFixed(3);
    e.style.filter = b > .4 ? `blur(${b.toFixed(1)}px)` : '';
  };
  r.style.clipPath = ''; r.style.webkitMaskImage = r.style.maskImage = '';
  if (inTr) { prev.root.style.clipPath = ''; prev.root.style.webkitMaskImage = prev.root.style.maskImage = ''; }
  if (!inTr) setR(r, 0, 0, 1, 1, 0);
  else if (tr === 'slideL') { setR(r, (1 - p) * W, 0, 1, 1, bl); setR(prev.root, -p * W * .55, 0, 1, 1, bl); }
  else if (tr === 'slideR') { setR(r, -(1 - p) * W, 0, 1, 1, bl); setR(prev.root, p * W * .55, 0, 1, 1, bl); }
  else if (tr === 'slideU') { setR(r, 0, (1 - p) * H, 1, 1, bl); setR(prev.root, 0, -p * H * .45, 1, 1, bl); }
  else if (tr === 'zoom') { setR(r, 0, 0, lerp(1.7, 1, p), clamp(u * 2.2), (1 - p) * 18); setR(prev.root, 0, 0, lerp(1, 1.8, p), 1 - clamp((u - .3) * 2), bl); }
  else if (tr === 'flash') { setR(r, 0, 0, lerp(1.08, 1, p), 1, 0); setR(prev.root, 0, 0, 1, 0, 0); }
  else if (tr === 'zoomOut') { prev.root.style.zIndex = 3; setR(r, 0, 0, lerp(1.3, 1, p), 1, (1 - p) * 8); setR(prev.root, 0, 0, lerp(1, .42, p), 1 - clamp((u - .45) / .55), bl * .5); }
  else if (tr === 'whip') { setR(r, (1 - p) * W, 0, 1, 1, Math.sin(Math.PI * u) * 34); setR(prev.root, -p * W, 0, 1, 1, Math.sin(Math.PI * u) * 34); }
  else if (tr === 'leak') { setR(r, 0, 0, lerp(1.07, 1, E.out(u)), clamp(u * 1.7), (1 - clamp(u * 1.4)) * 6); setR(prev.root, 0, 0, lerp(1, 1.05, p), 1 - clamp((u - .2) / .6), 0); }
  else if (tr === 'dissolve') { setR(r, 0, 0, lerp(1.03, 1, p), clamp(u), 0); setR(prev.root, 0, 0, 1, 1, 0); }
  else if (tr === 'defocus') { setR(r, 0, 0, lerp(1.04, 1, p), clamp(u * 1.6 - .3), (1 - p) * 16); setR(prev.root, 0, 0, lerp(1, 1.04, p), 1 - clamp(u * 1.4 - .2), p * 16); }
  else if (tr === 'zoomblur') { setR(r, 0, 0, lerp(1.45, 1, E.out(u)), clamp(u * 2.2), (1 - E.out(u)) * 22); prev.root.style.zIndex = 1; setR(prev.root, 0, 0, lerp(1, 1.9, E.in(u)), 1 - clamp((u - .35) / .5), u * 24); }
  else if (tr === 'irisC') { const rr = 1250 * E.inOut(u); r.style.clipPath = `circle(${rr.toFixed(1)}px at ${s.irisX ?? 540}px ${s.irisY ?? 900}px)`; setR(r, 0, 0, lerp(1.18, 1, p), 1, (1 - p) * 6); setR(prev.root, 0, 0, lerp(1, 1.1, p), 1, p * 6); }
  else if (tr === 'stripes') { const k = (E.inOut(u) * 100).toFixed(1); const m = `repeating-linear-gradient(180deg, #000 0, #000 ${k}px, rgba(0,0,0,0) ${k}px, rgba(0,0,0,0) 100px)`; r.style.webkitMaskImage = r.style.maskImage = m; setR(r, (1 - p) * 60, 0, 1, 1, 0); setR(prev.root, -p * 60, 0, 1, 1, 0); }
  else if (tr === 'glitch') { const j = Math.sin(u * 63) * 26 * (1 - u); setR(r, j, 0, 1, u > .35 ? 1 : (Math.sin(u * 90) > 0 ? 1 : 0), 0); r.style.filter = u < .9 ? 'drop-shadow(8px 0 0 rgba(255,40,80,.75)) drop-shadow(-8px 0 0 rgba(40,220,255,.75))' : ''; setR(prev.root, -j, 0, 1, 1 - clamp(u * 2), 0); }
  else if (tr === 'dive') { setR(r, 0, 0, lerp(.35, 1, E.out5(u)), clamp(u * 2.5), (1 - E.out(u)) * 14); prev.root.style.zIndex = 3; setR(prev.root, 0, 0, lerp(1, 3.2, E.in(u)), 1 - clamp((u - .25) / .5), u * 18); }
  else if (tr === 'whipU') { setR(r, 0, (1 - p) * H, 1, 1, Math.sin(Math.PI * u) * 34); setR(prev.root, 0, -p * H, 1, 1, Math.sin(Math.PI * u) * 34); }
  let fl = 0;
  if (tr === 'flash' && prev) fl = .85 * (1 - P(lt, 0, .2));
  if (s.flashes) for (const at of s.flashes(s.ctx)) if (lt >= at && lt < at + .16) fl = Math.max(fl, .8 * (1 - (lt - at) / .16));
  $('flash').style.opacity = fl.toFixed(3);
  let lk = 0, lx = 0;
  if (tr === 'leak' && inTr) { lk = Math.sin(Math.PI * u) * .95; lx = lerp(-260, 260, u); }
  if (s.leaks) for (const at of s.leaks(s.ctx)) { const d = lt - at; if (d >= 0 && d < .55) { const q = d / .55; const v = Math.sin(Math.PI * q) * .85; if (v > lk) { lk = v; lx = lerp(-300, 300, q); } } }
  const LKe = $('leak'); LKe.style.opacity = lk.toFixed(3); LKe.style.transform = `translateX(${lx.toFixed(1)}px)`;
  for (const x of [s, ...(inTr ? [prev] : [])]) await Promise.all([...x.root.querySelectorAll('img')].filter(i => i.src).map(i => i.decode().catch(() => {})));
  window.CAP_LIGHT = (s.S && s.S.capLight !== undefined) ? s.S.capLight : (s.bg === 'light' || s.bg === 'paper7');
  window.CUR_SCENE = s;
  $('cap').style.top = `${(s.S && s.S.capY) || 1560}px`;     // cena pode mover a legenda (ex.: tela dividida -> na emenda)
  renderCaptions(t);
  $('progfill').style.width = `${(clamp(t / TIMING.videoDur) * 900).toFixed(1)}px`;
  $('grain').style.backgroundPosition = `${Math.floor(hrand(frame) * 256)}px ${Math.floor(hrand(frame + .5) * 256)}px`;
  $('fade').style.opacity = clamp((t - (TIMING.videoDur - .5)) / .45).toFixed(3);
  return k;
}
window.render = render;
