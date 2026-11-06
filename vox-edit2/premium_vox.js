// ============================================================================
//  vox-edit2 — premium_vox.js (work/<prefixo>_b.js): os auxiliares do vox editorial PREMIUM que o Felipe aprovou (15/10 em diante),
//  copiados do projeto audio1031 (ChinaCapitalismo, 31/10/2026): mesa com câmera, entradas sem pulo (entra/pousa/revela), blocos de cor
//  que crescem, matéria real com marca-texto (materia), fotos impressas em pilha, rótulos, fonte do dado, barras e grade de 100,
//  círculo e tela dividida do HeyGen (presBola/presMetade, JAN), celular com o perfil REAL (celular), linha datilografada (linhaDat).
// ============================================================================
const VERM = K.vermelho, TINTA = '#1d1d1d';
// cor forte em dose certa (formato vox-editorial): um bloco de papel liso de cor viva atrás do assunto, revelado com
// uma varredura; papel colorido em tela cheia só nas viradas e no final
function fundo(r, cor) { const b = pblock(r, cor, -30, -30, 1140, 1980); b.style.opacity = 1; return b; }
function bloco(p, cor, x, y, w, h, rot = 0) { const b = pblock(p, cor, x, y, w, h); b.style.transform = `rotate(${rot}deg)`; return b; }
function revela(e, lt, t, o = {}) {
  if (lt < t) { e.style.opacity = 0; return; }
  const q = E.inOut(clamp((lt - t) / (o.d ?? .5)));
  e.style.opacity = 1; e.style.clipPath = `inset(0 ${((1 - q) * 100).toFixed(2)}% 0 0)`;
}
// bloco que cresce junto com o conteúdo: fração visível da largura e da altura (0–1) por quadros-chave
function cresce(e, lt, kw, kh) {
  if (lt < kw[0][0]) { e.style.opacity = 0; return; }
  e.style.opacity = 1;
  e.style.clipPath = `inset(0 ${((1 - kf(lt, kw)) * 100).toFixed(2)}% ${((1 - kf(lt, kh)) * 100).toFixed(2)}% 0)`;
}
function camada(r, vis = true) { return el(r, 'div', `position:absolute;inset:0;display:${vis ? 'block' : 'none'};`); }
// troca de camadas na palavra: lista [[t, camada], ...] (a última com t <= lt fica visível)
function trocaC(lt, lista) { let k = 0; lista.forEach(([t], i) => { if (lt >= t) k = i; }); lista.forEach(([, e], i) => { e.style.display = i === k ? 'block' : 'none'; }); return k; }
// mesa: contêiner que a "câmera" move. m.cam(s, px, py, rot) põe o ponto (px, py) da mesa no centro do quadro com zoom s
function mesa(r) {
  const m = el(r, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 960px;');
  m.cam = (s, px = 540, py = 960, rr = 0) => { m.style.transform = `translate(${(-(px - 540) * s).toFixed(1)}px,${(-(py - 960) * s).toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${rr.toFixed(2)}deg)`; };
  return m;
}
// entrada premium: desfoque + deslize curto + leve escala, sem quique
const entra = (e, lt, t, o = {}) => soft(e, lt, t, { d: .6, dy: 24, s0: 1.03, blur: 7, bob: false, ...o });
// papel pousando na mesa: desce um pouco e assenta (escala 1,05 -> 1, rotação acomoda), sem quique
function pousa(e, lt, t, o = {}) {
  if (lt < t) { e.style.opacity = 0; return 0; }
  const q = E.out5(clamp((lt - t) / (o.d ?? .55)));
  const out = o.out !== undefined && lt > o.out ? E.inOut(clamp((lt - o.out) / (o.od ?? .35))) : 0;
  tx(e, { x: (o.dx ?? 0) * (1 - q) + (o.x ?? 0) + (o.ox ?? 0) * out, y: (o.dy ?? -60) * (1 - q) + (o.y ?? 0) + (o.oy ?? -40) * out,
    s: lerp(o.s0 ?? 1.05, 1, q) * (o.s ?? 1), r: (o.r ?? 0) + (o.r0 ?? 3) * (1 - q), o: clamp((lt - t) / .14) * (1 - out) });
  return q;
}
// traço fino feito à mão (vermelho, 5 px) e círculo à mão
const traco = (svg, d, o = {}) => scribble(svg, d, { c: o.c ?? VERM, w: o.w ?? 5, tf: o.tf });
const anel = (svg, cx, cy, rx, ry, o = {}) => roughRing(svg, cx, cy, rx, ry, { c: o.c ?? VERM, w: o.w ?? 5, seed: o.seed ?? 2 });
// nota datilografada (Special Elite): fontes, rótulos e datas
function nota(p, txt, x, y, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;${o.wrap ? `width:${o.wrap}px;white-space:normal;` : 'white-space:nowrap;'}font-family:Elite;font-size:${o.s ?? 28}px;` +
    `line-height:1.35;color:${o.c ?? '#262626'};text-align:${o.align ?? 'left'};opacity:0;${o.css || ''}`, txt);
  e._base = o.centro ? 'translate(-50%,-50%)' : 'translate(0,-50%)'; e._rot = o.rot ?? 0; e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// faixa-rótulo em caixa alta pequena (estilo Vox): "PROBLEMA 1"
function rotulo(p, txt, x, y, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;font-family:Inter;font-weight:800;font-size:${o.s ?? 26}px;letter-spacing:.16em;` +
    `color:#fff;background:${o.bg ?? VERM};padding:.42em .8em .36em;box-shadow:0 6px 12px rgba(0,0,0,.22);opacity:0;`, txt);
  e._base = o.centro ? 'translate(-50%,-50%)' : 'translate(0,-50%)'; e._rot = o.rot ?? 0; e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// alfinete vermelho e fio (quadro de investigação)
function alfinete(p, x, y) {
  return el(p, 'div', `position:absolute;left:${x - 13}px;top:${y - 13}px;width:26px;height:26px;border-radius:50%;opacity:0;` +
    `background:radial-gradient(circle at 35% 35%, #ff9d94 0 16%, ${VERM} 48%, #7c0d07 100%);box-shadow:0 5px 8px rgba(0,0,0,.45);`);
}
function fio(svg, x0, y0, x1, y1, o = {}) {
  const sag = o.sag ?? 30, d = `M ${x0} ${y0} Q ${(x0 + x1) / 2 + (o.bx ?? 0)} ${(y0 + y1) / 2 + sag} ${x1} ${y1}`;
  const p = prep(sv(svg, 'path', { d, fill: 'none', stroke: o.c ?? '#b3120a', 'stroke-width': o.w ?? 3, 'stroke-linecap': 'round' }));
  p.draw = q => draw(p, q);
  return p;
}
// página de matéria jornalística real com marca-texto; b.pos(k) = centro do trecho
function materia(p, cx, cy, w, h, o) {
  const b = box(p, cx, cy, w, h); b._rot = o.rot ?? -1;
  [[12, 9, 1.6], [6, 4, -.9]].forEach(([dx, dy, rr]) => el(b, 'div', `position:absolute;inset:0;transform:translate(${dx}px,${dy}px) rotate(${rr}deg);background:#f1eee7;box-shadow:0 14px 26px rgba(0,0,0,.28);`));
  const pg = el(b, 'div', `position:absolute;inset:0;background:#fbfaf6 url(${paperTex(540, Math.round(540 * h / w))}) center/100% 100%;box-shadow:0 18px 34px rgba(0,0,0,.38);` +
    `padding:${(w * .06).toFixed(0)}px ${(w * .065).toFixed(0)}px;overflow:hidden;`);
  const sp = {}, seg = (bx, arr) => arr.forEach(([t, k]) => { const s = el(bx, 'span', k ? MK() + 'padding:0 .03em;' : '', esc(t)); if (k) sp[k] = s; });
  const u = o.u ?? w;   // escala do texto (padrão: largura)
  el(pg, 'div', `display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #111;padding-bottom:${(u * .016).toFixed(0)}px;`,
    `<span style="font-family:Inter;font-weight:800;font-size:${(u * .04).toFixed(0)}px;color:#111;">${esc(o.veiculo)}</span>` +
    `<span style="font-family:Inter;font-weight:600;font-size:${(u * .021).toFixed(0)}px;color:#777;letter-spacing:.12em;text-transform:uppercase;">${esc(o.secao)}</span>`);
  seg(el(pg, 'div', `font-family:Playfair;font-weight:700;font-size:${(u * .056).toFixed(0)}px;line-height:1.13;color:#141414;margin-top:${(u * .036).toFixed(0)}px;`), o.titulo);
  if (o.fina) seg(el(pg, 'div', `font-family:Inter;font-weight:500;font-size:${(u * .027).toFixed(0)}px;line-height:1.4;color:#4a4a4a;margin-top:${(u * .024).toFixed(0)}px;`), o.fina);
  if (o.corpo) seg(el(pg, 'div', `font-family:${SERIF};font-size:${(u * .03).toFixed(0)}px;line-height:1.55;color:#222;margin-top:${(u * .026).toFixed(0)}px;border-top:1px solid #d6d2c8;padding-top:${(u * .022).toFixed(0)}px;`), o.corpo);
  for (let i = 0; i < 9; i++) el(pg, 'div', `height:${(u * .011).toFixed(0)}px;border-radius:4px;background:#e2dfd8;margin-top:${(u * .023).toFixed(0)}px;width:${[97, 92, 95, 88, 96, 90, 94, 91, 58][i]}%;`);
  b.sp = sp; b.mk = (k, q) => { if (sp[k]) mkSet(sp[k], q); };
  b.pos = k => {
    const e = sp[k]; let x = e.offsetLeft + e.offsetWidth / 2, y = e.offsetTop + e.offsetHeight / 2, q = e.offsetParent;
    while (q && q !== b) { x += q.offsetLeft; y += q.offsetTop; q = q.offsetParent; }
    return [cx - w / 2 + x, cy - h / 2 + y];
  };
  b.style.transform = `rotate(${b._rot}deg)`; b.style.opacity = 0;
  return b;
}
// mede uma vez (com a cena visível) a posição de um trecho; enquanto não der para medir, usa o padrão
function posDe(S, key, b, k, dflt) { if (!S[key]) { const p = b.pos(k); if (p[1] > 0 && b.sp[k].offsetHeight > 0) S[key] = p; } return S[key] || dflt; }

// ---------- apresentador (gravação vertical: rosto pequeno no quadro -> zoom maior) ----------
const PT = { zoomFn: (lt, c2) => 1.0 + .05 * E.inOut(clamp(lt / c2.dur)) };   // pres4(beats, PT): gravação horizontal, rosto já perto no recorte 9:16
// tela dividida: janela 1080x960 com o apresentador da cintura para cima (work/frames_largos); emenda fina de papel
function presMetade(r, S, lado = 'baixo') {
  const fr = el(r, 'div', `position:absolute;left:0;top:${lado === 'baixo' ? 960 : 0}px;width:1080px;height:960px;overflow:hidden;background:#111;opacity:0;z-index:3;`);
  const img = el(fr, 'img', 'position:absolute;left:0;top:0;width:1080px;height:960px;transform-origin:50% 40%;');
  img.decoding = 'sync';
  const faixa = el(r, 'div', 'position:absolute;left:0;top:955px;width:1080px;height:10px;background:#f1eee7;opacity:0;z-index:3;box-shadow:0 3px 10px rgba(0,0,0,.35);');
  const ph = { fr, img, faixa, lado, cur: -1 };
  (S.async = S.async || []).push(async (tt, c) => {
    if (fr.style.opacity !== '1') return;
    const f = Math.min(NFR - 1, Math.max(0, c.frame));
    if (ph.cur !== f) { img.src = `../work/frames_largos/${String(f + 1).padStart(5, '0')}.jpg`; try { await img.decode(); } catch (e) { } ph.cur = f; }
    img.style.transform = `scale(${(1.06 + .02 * Math.sin(tt * .6)).toFixed(4)})`;
  });
  return ph;
}
function metade(ph, lt, t0, t1) {
  const q = E.out5(clamp((lt - t0) / .35)), qo = E.in(clamp((lt - t1) / .25)), on = lt >= t0 && lt < t1 + .25;
  const dy = (ph.lado === 'baixo' ? 1 : -1) * 980 * ((1 - q) + qo);
  ph.fr.style.opacity = on ? 1 : 0; ph.faixa.style.opacity = on ? 1 : 0;
  ph.fr.style.transform = `translateY(${dy.toFixed(1)}px)`; ph.faixa.style.transform = `translateY(${dy.toFixed(1)}px)`;
}
// círculo (cabeça, ombros e peito) com aro fino de papel, no alto da tela; usa os quadros LARGOS (work/frames_largos,
// 1080x960) como no EfeitoIsca v3 ("muito aproximado" no recorte 9:16). z = zoom sobre o quadro largo, fy = altura do rosto
function presBola(r, S, cx, cy, d = 360, z = 1.18, fy = .36) {
  const fr = el(r, 'div', `position:absolute;left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;background:#111;opacity:0;z-index:3;` +
    'box-shadow:0 0 0 7px #f1eee7, 0 18px 32px rgba(0,0,0,.42);transform-origin:50% 50%;');
  const img = el(fr, 'img', 'position:absolute;left:0;top:0;width:1080px;height:960px;transform-origin:0 0;'); img.decoding = 'sync';
  const k = d / 960 * z, x = (d - 1080 * k) / 2, y = Math.min(0, Math.max(d - 960 * k, d / 2 - fy * 960 * k));
  img.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(4)})`;
  const ph = { fr, img, cur: -1 };
  (S.async = S.async || []).push(async (tt, c) => {
    if (fr.style.opacity === '0') return;
    const f2 = Math.min(NFR - 1, Math.max(0, c.frame));
    if (ph.cur !== f2) { img.src = `../work/frames_largos/${String(f2 + 1).padStart(5, '0')}.jpg`; try { await img.decode(); } catch (e) { } ph.cur = f2; }
  });
  return ph;
}
function bola(ph, lt, t0, t1) {
  const a = E.out5(clamp((lt - t0) / .4)), b = E.in(clamp((lt - t1) / .25));
  ph.fr.style.opacity = lt >= t0 && lt < t1 + .25 ? (a * (1 - b)).toFixed(3) : 0;
  ph.fr.style.transform = `scale(${(lerp(.86, 1, a) * lerp(1, .9, b)).toFixed(3)})`;
}

function papel(p, cx, cy, w, h, o = {}) {
  const b = box(p, cx, cy, w, h, `background:#fbfaf6 url(${paperTex(400, Math.round(400 * h / w))}) center/100% 100%;box-shadow:0 20px 34px rgba(0,0,0,.36);padding:${(w * .08).toFixed(0)}px;box-sizing:border-box;font-family:Elite;color:#222;`);
  b._rot = o.rot ?? 0; b.style.opacity = 0;
  return b;
}
const linhas = (b, n, w0 = 92) => { for (let i = 0; i < n; i++) el(b, 'div', `height:14px;border-radius:4px;background:#e1ded6;margin-top:22px;width:${[w0, 86, 94, 78, 90, 70, 88, 60][i % 8]}%;`); };

// barra horizontal de dado (valor real, proporcional), cresce com b.at(q)
function barraH(p, x, y, wMax, hgt, cor, frac) {
  const b = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;width:${wMax}px;height:${hgt}px;transform-origin:0 50%;transform:scaleX(0);background:${cor};border-radius:0 10px 10px 0;`);
  b.at = q => { b.style.transform = `scaleX(${(frac * q).toFixed(4)})`; };
  return b;
}
// elemento HTML preso a um ponto do mapa (posição refeita a cada quadro)
function noMapa(e, M, lon, lat, dx = 0, dy = 0) { const [x, y] = M.pt(lon, lat); e.style.left = `${(x + dx).toFixed(1)}px`; e.style.top = `${(y + dy).toFixed(1)}px`; }
// câmera do mapa com zoom exponencial entre dois enquadramentos (q 0–1)
function voo(M, a, b, q) { const u = E.inOut(clamp(q)); M.set({ lon: lerp(a.lon, b.lon, u), lat: lerp(a.lat, b.lat, u), z: a.z * Math.pow(b.z / a.z, u), cy: lerp(a.cy ?? 960, b.cy ?? 960, u) }); }
// grade de 100 pontos (10x10): n acesos na cor viva, o resto apagado
function grade100(p, x, y, passo, cor, n) {
  const ds = [];
  for (let i = 0; i < 100; i++) ds.push(el(p, 'div', `position:absolute;left:${x + (i % 10) * passo}px;top:${y + Math.floor(i / 10) * passo}px;width:${passo * .72}px;height:${passo * .72}px;border-radius:50%;background:#3a3a3a;opacity:0;`));
  ds.at = (lt, t0, t1) => ds.forEach((d, i) => { d.style.opacity = lt >= t0 + i * .006 ? 1 : 0; d.style.background = i < n && lt >= t1 + i * .012 ? cor : '#3a3a3a'; });
  return ds;
}

const CEL = { w: 680, cx: 540, cy: 1130 };
function celular(p, w, cx, cy) {
  const h = w * 2.05, b = box(p, cx, cy, w, h, `background:#151515;border-radius:${w * .13}px;box-shadow:0 30px 50px rgba(0,0,0,.45);opacity:0;`);
  const ox = w * .045, oy = w * .05, sw = w * .91;
  const scr = el(b, 'div', `position:absolute;left:${ox}px;top:${oy}px;right:${ox}px;bottom:${oy}px;border-radius:${w * .1}px;background:#fff;overflow:hidden;`);
  el(b, 'div', `position:absolute;left:50%;top:${w * .075}px;width:${w * .26}px;height:${w * .055}px;transform:translateX(-50%);border-radius:99px;background:#151515;`);
  // perfil real: avatar (anel do story + nota) e bloco de texto recortados do print, empilhados como no app
  const aw = sw * .42, ah = aw * 544 / 492, at = sw * .1;
  const av = el(scr, 'img', `position:absolute;left:${(sw - aw) / 2}px;top:${at}px;width:${aw}px;height:${ah}px;`); av.src = AS('perfil_avatar').src;
  const tw = sw * .9, th = tw * 588 / 1004, tt = at + ah + sw * .04;
  const tx = el(scr, 'img', `position:absolute;left:${sw * .04}px;top:${tt}px;width:${tw}px;height:${th}px;`); tx.src = AS('perfil_texto').src;
  const by = tt + th + sw * .035, bh = sw * .13, sy = by + bh + sw * .025, shh = sw * .115;
  const bt = el(scr, 'div', `position:absolute;left:${sw * .06}px;right:${sw * .06}px;top:${by}px;height:${bh}px;border-radius:${sw * .03}px;background:${VERM};color:#fff;font-family:${SERIF};font-weight:700;font-size:${sw * .066}px;line-height:${bh}px;text-align:center;`, 'Seguir');
  const sh = el(scr, 'div', `position:absolute;left:${sw * .06}px;right:${sw * .06}px;top:${sy}px;height:${shh}px;border-radius:${sw * .03}px;border:3px solid ${TINTA};box-sizing:border-box;color:${TINTA};font-family:${SERIF};font-weight:600;font-size:${sw * .056}px;line-height:${shh - 6}px;text-align:center;`, 'Compartilhar ↗');
  const g = el(scr, 'div', `position:absolute;left:${sw * .06}px;right:${sw * .06}px;top:${sy + shh + sw * .04}px;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;align-content:start;`);
  CEL_FOTOS.forEach(n => { const i2 = el(g, 'img', `width:100%;height:${sw * .3}px;object-fit:cover;filter:grayscale(1) contrast(1.05);`); i2.src = AS(n).src; });
  // anéis dos toques num SVG dentro do próprio celular (acompanham a inclinação e a câmera)
  b.sv = svgAbs(b, 0, 0, w, h);
  b.pos = { perfil: oy + (at + tt + th) / 2, seguir: oy + by + bh / 2, compartilhar: oy + sy + shh / 2 };   // y no celular
  b.bt = bt; b.sh = sh; b._rot = -1;
  return b;
}

// ---------- fotos em sequência (cada uma na sua palavra) ----------
// foto impressa: a imagem fica em b.im
function foto(p, name, cx, cy, w, o = {}) {
  const b = printPhoto(p, name, cx, cy, w, { rot: o.rot ?? 0, tape: o.tape ?? ['tl'], pad: o.pad });
  b.im = b.querySelector('img');
  return b;
}
// itens: { n: 'print_x', x, y, w, r, t, tape, bk: [cor, x, y, w, h, rot], dy, out, oy, s }
function pilha(p, itens) {
  return itens.map(it => {
    const bk = it.bk ? bloco(p, it.bk[0], it.bk[1], it.bk[2], it.bk[3], it.bk[4], it.bk[5] ?? 0) : null;
    const f = foto(p, it.n, it.x, it.y, it.w, { rot: it.r ?? 0, tape: it.tape ?? ['tl'] });
    return { ...it, f, bk };
  });
}
function pilhaAt(lt, P) {
  P.forEach(it => {
    if (it.bk) { revela(it.bk, lt, it.t - .08); if (it.out !== undefined && lt > it.out) it.bk.style.opacity = (1 - ez(lt, it.out, .3)).toFixed(3); }
    pousa(it.f, lt, it.t, { dy: it.dy ?? -90, out: it.out, oy: it.oy ?? -60, s: it.s ?? 1 });
  });
}
const pilhaSom = (c, P, g = .36) => P.forEach(it => { if (it.t > -.05) { cue(c, 'paper', it.t, { g }); cue(c, 'shutter', it.t + .12, { g: .12 }); } });
// foto ocupando a metade de cima (tela dividida) ou a tela toda: g.push(lt, dur)
function fotoTopo(p, name, o = {}) {
  const hh = o.h ?? 960, ww = o.w ?? 1080;
  const g = el(p, 'div', `position:absolute;left:${o.left ?? 0}px;top:${o.top ?? 0}px;width:${ww}px;height:${hh}px;overflow:hidden;opacity:0;background:#222;`);
  const a = AS(name), k = Math.max(ww / a.w, hh / a.h) * (o.k ?? 1.06);
  const im = el(g, 'img', `position:absolute;left:${((ww - a.w * k) / 2 + (o.dx ?? 0)).toFixed(1)}px;top:${((hh - a.h * k) / 2 + (o.dy ?? 0)).toFixed(1)}px;width:${(a.w * k).toFixed(1)}px;height:${(a.h * k).toFixed(1)}px;transform-origin:50% 50%;`);
  im.decoding = 'sync'; im.src = a.src; g.im = im;
  im.style.filter = o.filtro ?? 'saturate(1.05) contrast(1.05)';
  g.push = (lt, d, ds = .07) => { im.style.transform = `scale(${(1 + ds * E.inOut(clamp(lt / Math.max(.1, d)))).toFixed(4)})`; };
  g.vig = el(g, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.4) 100%);');
  return g;
}
// selo redondo (ex.: "77%") em cor viva com texto escuro
function selo(p, cx, cy, d, l1, l2 = '', cor = K.amarelo) {
  const b = box(p, cx, cy, d, d, `border-radius:50%;background:${cor} url(${ptex('#efece4', 30)});background-blend-mode:multiply;border:${d * .04}px solid ${TINTA};box-sizing:border-box;` +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 16px 26px rgba(0,0,0,.35);opacity:0;');
  el(b, 'div', `font-family:${SERIF};font-weight:700;font-size:${d * .3}px;line-height:1;color:${TINTA};`, l1);
  if (l2) el(b, 'div', `margin-top:${d * .03}px;font-family:Inter;font-weight:800;font-size:${d * .07}px;letter-spacing:.12em;color:${TINTA};text-align:center;line-height:1.2;`, l2);
  b._rot = -8;
  return b;
}
// fonte do dado: etiqueta pequena datilografada sobre papel claro
const fonte = (p, txt, x, y, o = {}) => nota(p, txt, x, y, { s: o.s ?? 24, c: '#3a3a3a', centro: o.centro ?? true, wrap: o.wrap, align: o.align ?? 'center', css: `background:#f4f1ea;padding:6px 14px;box-shadow:0 6px 12px rgba(0,0,0,.18);${o.css || ''}`, rot: o.rot ?? 0 });
// barra vertical de dado (cresce de baixo): b.at(fração da altura máxima)
function barraV(p, x, base, w, hMax, cor) {
  const b = el(p, 'div', `position:absolute;left:${x}px;top:${base - hMax}px;width:${w}px;height:${hMax}px;transform-origin:50% 100%;transform:scaleY(0);background:${cor} url(${ptex('#efece4', 30)});background-blend-mode:multiply;box-shadow:0 12px 22px rgba(0,0,0,.25);`);
  b.at = q => { b.style.transform = `scaleY(${Math.max(0, q).toFixed(4)})`; };
  return b;
}

// ponto com pulso preso a lon/lat: e.at(lt, t, {out})
function pinoMapa(M, p, ll, o = {}) {
  const e = el(p, 'div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;');
  const r0 = o.r ?? 18, cor = o.cor ?? VERM;
  const d = el(e, 'div', `position:absolute;left:${-r0}px;top:${-r0}px;width:${2 * r0}px;height:${2 * r0}px;border-radius:50%;background:${cor};border:5px solid #f4f1ea;box-sizing:border-box;box-shadow:0 6px 12px rgba(0,0,0,.35);`);
  const pu = el(e, 'div', `position:absolute;left:${-r0}px;top:${-r0}px;width:${2 * r0}px;height:${2 * r0}px;border-radius:50%;border:5px solid ${cor};box-sizing:border-box;`);
  e.at = (lt, t, q = {}) => {
    const [x, y] = M.pt(...ll); e.style.left = `${x.toFixed(1)}px`; e.style.top = `${y.toFixed(1)}px`;
    if (lt < t) { e.style.opacity = 0; return; }
    const out = q.out !== undefined && lt > q.out ? E.in(clamp((lt - q.out) / .25)) : 0;
    e.style.opacity = (1 - out).toFixed(3);
    d.style.transform = `scale(${E.back(clamp((lt - t) / .35)).toFixed(3)})`;
    const u = ((lt - t) * .9) % 1; pu.style.transform = `scale(${(1 + 2.2 * u).toFixed(3)})`; pu.style.opacity = (o.pulso === false ? 0 : (1 - u) * .9).toFixed(3);
  };
  return e;
}
// rótulo preso ao mapa (etiqueta preta serifada): e.at(lt, t, {out})
function rotMapa(M, p, txt, ll, dx = 0, dy = -58, o = {}) {
  const e = tagL(p, txt, 0, 0, { s: o.s ?? 32, css: o.css });
  e.at = (lt, t, q = {}) => {
    const [x, y] = M.pt(...ll); e.style.left = `${(x + dx).toFixed(1)}px`; e.style.top = `${(y + dy).toFixed(1)}px`;
    if (lt < t) { e.style.opacity = 0; return; }
    const out = q.out !== undefined && lt > q.out ? clamp((lt - q.out) / .2) : 0;
    e.style.opacity = (ez(lt, t, .2) * (1 - out)).toFixed(3);
  };
  return e;
}
// rota curva com ponta de seta (navios, migrantes, dinheiro): p.at(M, q); p.P(t) = ponto da curva
function rotaSeta(svg, a, b, o = {}) {
  const p = sv(svg, 'path', { fill: 'none', stroke: o.c ?? VERM, 'stroke-width': o.w ?? 7, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash ?? '2 14', opacity: 0 });
  const ponta = sv(svg, 'path', { d: 'M -20 -13 L 4 0 L -20 13', fill: 'none', stroke: o.c ?? VERM, 'stroke-width': o.w ?? 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });
  p.at = (M, q) => {
    const [x0, y0] = M.pt(...a), [x1, y1] = M.pt(...b), bend = o.bend ?? .22;
    const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
    const P = t => [(1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1];
    p.P = P;
    const n = 30, k = clamp(q); let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`;
    for (let i = 1; i <= n * k; i++) { const [x, y] = P(i / n); d += ` L${x.toFixed(1)},${y.toFixed(1)}`; }
    p.setAttribute('d', d); p.setAttribute('opacity', q > 0 ? 1 : 0);
    if (q >= 1 && o.seta !== false) {
      const [xa, ya] = P(.97), [xb, yb] = P(1), ang = Math.atan2(yb - ya, xb - xa) * 180 / Math.PI;
      ponta.setAttribute('transform', `translate(${xb.toFixed(1)} ${yb.toFixed(1)}) rotate(${ang.toFixed(1)})`); ponta.setAttribute('opacity', 1);
    } else ponta.setAttribute('opacity', 0);
  };
  return p;
}
// papel que rasga em duas metades (o rasgo em zigue-zague no meio): b.at(q) separa as metades
function rasga(p, name, cx, cy, w, o = {}) {
  const a = AS(name), h = w * a.h / a.w, g = el(p, 'div', `position:absolute;left:${cx - w / 2}px;top:${cy - h / 2}px;width:${w}px;height:${h}px;opacity:0;`);
  const zz = [...Array(11)].map((_, i) => `${(46 + (i % 2 ? 6 : -4) + hrand(i * 7) * 3).toFixed(1)}% ${(i * 10).toFixed(0)}%`);
  const L = el(g, 'div', `position:absolute;inset:0;clip-path:polygon(0 0, ${zz.join(', ')}, 0 100%);filter:drop-shadow(0 16px 20px rgba(0,0,0,.35));`);
  const R = el(g, 'div', `position:absolute;inset:0;clip-path:polygon(100% 0, ${zz.join(', ')}, 100% 100%);filter:drop-shadow(0 16px 20px rgba(0,0,0,.35));`);
  [L, R].forEach(m => { const fr = el(m, 'div', `position:absolute;inset:0;background:#f1eee7;padding:14px;box-sizing:border-box;`); const im = el(fr, 'img', 'width:100%;height:100%;object-fit:cover;display:block;'); im.src = a.src; });
  g.at = (lt, t0, tr) => {
    g.style.opacity = lt >= t0 ? 1 : 0;
    const q = E.out5(clamp((lt - tr) / .5));
    L.style.transform = `translate(${(-70 * q).toFixed(1)}px,${(30 * q).toFixed(1)}px) rotate(${(-7 * q).toFixed(2)}deg)`;
    R.style.transform = `translate(${(70 * q).toFixed(1)}px,${(50 * q).toFixed(1)}px) rotate(${(8 * q).toFixed(2)}deg)`;
  };
  g._rot = o.rot ?? 0;
  return g;
}

// ---------- do audio1031 (ch_c / ch_d) ----------
const AMAR = K.amarelo, LAR = K.laranja, AZUL = K.azul, AMAR_E = '#c99200', VERM_E = '#8f0d06', CREME = '#efe9dc';
const JAN = (id, c) => [APRES[id].t0 - c.t0, APRES[id].t1 - c.t0];
const CAP_TIT = { mode: 'title', y: 330 }, CAP_TAG = { mode: 'tag', y: 1600, fs: 44 }, CAP_GLOW = { mode: 'glow', y: 1560 }, CAP_DARK = { mode: 'dark', y: 330 };
// número que conta (texto do elemento) de v0 a v1 entre t0 e t0+d; fmt(v) formata
function conta(e, lt, t0, d, v0, v1, fmt) { e.textContent = fmt(lerp(v0, v1, E.out(clamp((lt - t0) / d)))); }
const fmtMil = v => Math.round(v).toLocaleString('pt-BR');
function numero(e, lt, t, d, v0, v1, fmt, o = {}) {
  if (lt < t) { e.style.opacity = 0; return; }
  conta(e, lt, t, d, v0, v1, fmt);
  tx(e, { s: soco(lt, t + d, o.a ?? .12) * (o.s ?? 1), r: o.r ?? 0, o: ez(lt, t, .15) });
}
function linhaDat(p, txt, o = {}) {
  const e = el(p, 'div', `position:relative;margin-top:${o.mt ?? 26}px;font-family:Elite;font-size:${o.s ?? 62}px;line-height:1.2;color:${TINTA};white-space:nowrap;height:${Math.round((o.s ?? 62) * 1.2)}px;`);
  const mk = el(e, 'div', `position:absolute;left:-6px;top:${Math.round((o.s ?? 62) * .22)}px;height:${Math.round((o.s ?? 62) * .78)}px;width:0;background:${o.cor ?? AMAR};opacity:.8;`);
  const t = el(e, 'span', 'position:relative;', '');
  e.at = (lt, t0, cps = 20) => {
    if (lt < t0) { t.textContent = ''; mk.style.width = '0px'; return; }
    typeIn(t, txt, lt, t0, cps, false);
    const fim = t0 + txt.length / cps;
    mk.style.width = `${((t.offsetWidth + 12) * ez(lt, fim, .3, E.inOut)).toFixed(1)}px`;
  };
  return e;
}
