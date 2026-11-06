// ============================================================================
//  VOX V4 (skill vox-v4, 28/10/2026): biblioteca do formato dos vídeos da V4 Company
//  Vox editorial premium com a identidade do brand book 2026 (https://v4-company-brand-book-2026.vercel.app/, resumo em brand_v4.md):
//  a MESA é papel VERMELHO V4 (#E50914); neutros branco/#F2F2F2/grafite #312D2D/vinho #280000; amarelo #FFDD00 só como detalhe;
//  verde #0E8420 só no botão de ação (CTA). Fala em IBM Plex Sans BRANCA sobre o vermelho; números e títulos de impacto em Morganite.
//  Grafismo-assinatura: reverberação (camadas concêntricas do contorno do símbolo, com sombra leve em cada uma). Logo só o SVG oficial.
//  Vai como 2ª parte do render/scenes.js (work/<prefixo>_b.js), depois do componentes.js da vox-editorial (<prefixo>_a.js). Derivada do
//  componentes_fernando.js (mesmas funções e assinaturas: as cenas da vox-fernando funcionam aqui trocando só as cores).
// ============================================================================
const V4 = '#E50914', V4_LUZ = '#FF481F', V4_E = '#650E0F', VINHO = '#280000', GRAFITE = '#312D2D', BRANCO = '#FFFFFF', CINZA_C = '#F2F2F2',
  AMARELO = '#FFDD00', VERDE_CTA = '#0E8420';
// nomes herdados da vox-fernando: VERMELHO = o vermelho V4; PRETO = o vinho #280000 (o "preto" da marca); TINTA = grafite (texto sobre branco)
const VERMELHO = V4, VERM_E = V4_E, PRETO = VINHO, TINTA = GRAFITE;
const MORG = 'Morganite', PLEX = 'Plex';
// a paleta do kit vira a da V4: tudo que usa K.* por padrão (carimbo, traço, formas) cai nessas cores
Object.assign(K, { laranja: V4_LUZ, vermelho: V4, amarelo: AMARELO, verde: VINHO, azul: GRAFITE, ciano: BRANCO, rosa: CINZA_C, roxo: V4_E });
const VERM = VERMELHO;
const MKL = 'rgba(255,221,0,.62)';   // marca-texto amarelo V4 (detalhe/ativação), só sobre papel branco
{ const pf = document.getElementById('progfill'); if (pf) pf.style.background = AMARELO; }
// SAFE ZONE da Meta (anúncios; criativo dinâmico, 29/10/2026, imagem em safezone_meta.jpg): o vídeo é recortado em 9:16, 4:5 e 1:1.
//   0–286 e 1636–1920: a interface do app cobre (faixas vermelhas); 286–420 e 1500–1636: somem no recorte 1:1 (faixas cinzas);
//   420–1500 (o quadrado central 1080x1080): a ÚNICA faixa que aparece em todos. Legenda, números, logos, fontes e rosto ficam aqui.
const SAFE = { y0: 420, y1: 1500, cy: 960, m0: 286, m1: 1636 };
// legendas (contraste do brand book): sobre o vermelho a fala vai BRANCA (CT); sobre papel branco, VINHO (CT_ESCURA);
// em tela vinho, branca (CT também); em foto e apresentador, glow; mapas e quadros cheios, CTAG/CTAGB (tarja vinho).
// Posições dentro da safe zone: CT no alto do quadrado (≈425–580), CGLOW embaixo do queixo na tela dividida (≈1395–1465)
const CT = { mode: 'title', y: 505 }, CT_CLARA = CT, CT_ESCURA = { mode: 'dark', y: 505 }, CTAG = { mode: 'tag', y: 470, fs: 50 }, CTAGB = { mode: 'tag', y: 1450, fs: 48 }, CGLOW = { mode: 'glow', y: 1430 };
// mesa de papel VERMELHO V4 (textura t_v4.jpg, copiada pelo preparar_v4.py: fibra do papel sobre #E50914, luz quente fraca no alto à
// direita e o degradê da marca para #650E0F no canto de baixo); o.cor tinge a mesa, o.b = brilho
function paperBg(r, o = {}) {
  const h = hero(r, o.tex ?? 't_v4', { k: 1.08 });
  h.img.style.filter = o.b ? `brightness(${o.b})` : 'none';
  if (o.cor) el(r, 'div', `position:absolute;inset:0;background:${o.cor};mix-blend-mode:multiply;opacity:${o.forca ?? .9};`);
  return h;
}

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
// traço fino feito à mão (verde, 5 px) e círculo à mão
const traco = (svg, d, o = {}) => scribble(svg, d, { c: o.c ?? PRETO, w: o.w ?? 5, tf: o.tf });
const anel = (svg, cx, cy, rx, ry, o = {}) => roughRing(svg, cx, cy, rx, ry, { c: o.c ?? PRETO, w: o.w ?? 5, seed: o.seed ?? 2 });
// nota em IBM Plex Sans (a marca não tem fonte datilografada): fontes, rótulos e datas
function nota(p, txt, x, y, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;${o.wrap ? `width:${o.wrap}px;white-space:normal;` : 'white-space:nowrap;'}font-family:Plex;font-weight:500;font-size:${o.s ?? 28}px;` +
    `line-height:1.35;color:${o.c ?? '#262626'};text-align:${o.align ?? 'left'};opacity:0;${o.css || ''}`, txt);
  e._base = o.centro ? 'translate(-50%,-50%)' : 'translate(0,-50%)'; e._rot = o.rot ?? 0; e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// faixa-rótulo em caixa alta pequena (estilo Vox): "1 · JUROS"
function rotulo(p, txt, x, y, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;font-family:Plex;font-weight:800;font-size:${o.s ?? 26}px;letter-spacing:.16em;` +
    `color:${o.c ?? '#fff'};background:${o.bg ?? PRETO};padding:.42em .8em .36em;box-shadow:0 6px 12px rgba(0,0,0,.22);opacity:0;`, txt);
  e._base = o.centro ? 'translate(-50%,-50%)' : 'translate(0,-50%)'; e._rot = o.rot ?? 0; e.style.transform = `${e._base} rotate(${e._rot}deg)`;
  return e;
}
// página de documento real (papel, veículo/órgão, título, linha fina, corpo) com marca-texto; b.pos(k) = centro do trecho
function materia(p, cx, cy, w, h, o) {
  const b = box(p, cx, cy, w, h); b._rot = o.rot ?? -1;
  [[12, 9, 1.6], [6, 4, -.9]].forEach(([dx, dy, rr]) => el(b, 'div', `position:absolute;inset:0;transform:translate(${dx}px,${dy}px) rotate(${rr}deg);background:#f1eee7;box-shadow:0 14px 26px rgba(0,0,0,.28);`));
  const pg = el(b, 'div', `position:absolute;inset:0;background:#ffffff url(${paperTex(540, Math.round(540 * h / w))}) center/100% 100%;box-shadow:0 18px 34px rgba(0,0,0,.38);` +
    `padding:${(w * .07).toFixed(0)}px ${(w * .075).toFixed(0)}px;overflow:hidden;`);
  const sp = {}, seg = (bx, arr) => arr.forEach(([t, k, cor]) => { const s = el(bx, 'span', k ? MK(cor ?? MKL) + 'padding:0 .03em;' : '', esc(t)); if (k) sp[k] = s; });
  el(pg, 'div', `display:flex;justify-content:space-between;align-items:baseline;border-bottom:3px solid #111;padding-bottom:${(w * .018).toFixed(0)}px;`,
    `<span style="font-family:Plex;font-weight:800;font-size:${(w * .044).toFixed(0)}px;color:#111;">${esc(o.veiculo)}</span>` +
    `<span style="font-family:Plex;font-weight:600;font-size:${(w * .024).toFixed(0)}px;color:#777;letter-spacing:.12em;text-transform:uppercase;">${esc(o.secao)}</span>`);
  seg(el(pg, 'div', `font-family:Plex;font-weight:700;font-size:${(w * (o.tk ?? .064)).toFixed(0)}px;line-height:1.13;color:#141414;margin-top:${(w * .045).toFixed(0)}px;`), o.titulo);
  if (o.fina) seg(el(pg, 'div', `font-family:Plex;font-weight:500;font-size:${(w * .031).toFixed(0)}px;line-height:1.4;color:#4a4a4a;margin-top:${(w * .028).toFixed(0)}px;`), o.fina);
  if (o.corpo) seg(el(pg, 'div', `font-family:${SERIF};font-size:${(w * (o.ck ?? .035)).toFixed(0)}px;line-height:1.55;color:#222;margin-top:${(w * .03).toFixed(0)}px;border-top:1px solid #d6d2c8;padding-top:${(w * .025).toFixed(0)}px;`), o.corpo);
  for (let i = 0; i < (o.nl ?? 9); i++) el(pg, 'div', `height:${(w * .012).toFixed(0)}px;border-radius:4px;background:#e2dfd8;margin-top:${(w * .026).toFixed(0)}px;width:${[97, 92, 95, 88, 96, 90, 94, 91, 58][i % 9]}%;`);
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

// ---------- apresentador (gravação horizontal 1920x1080, rosto em x≈1000–1090) ----------
const PT = { zoomFn: (lt, c2) => 1.0 + .05 * E.inOut(clamp(lt / c2.dur)), capY: 1430 };   // pres4(beats, PT): legenda em 1430 (safe zone)
// tela dividida: janela 1080x960 com o apresentador (work/frames_largos); emenda fina amarela. o.z = zoom, o.fy = altura do rosto no
// quadro largo (0–1; nesta gravação o rosto fica em ~0,62), o.yt = onde o rosto fica na janela (px)
function presMetade(r, S, lado = 'baixo', o = {}) {
  const fr = el(r, 'div', `position:absolute;left:0;top:${lado === 'baixo' ? 960 : 0}px;width:1080px;height:960px;overflow:hidden;background:#111;opacity:0;z-index:3;`);
  const z = o.z ?? 1.12, fy = o.fy ?? .56, yt = o.yt ?? 230;   // yt 230: rosto em y ≈1190, acima da legenda (1430) e dentro da safe zone
  const img = el(fr, 'img', `position:absolute;left:0;top:0;width:1080px;height:960px;transform-origin:50% ${(fy * 100).toFixed(1)}%;`);
  img.decoding = 'sync';
  const faixa = el(r, 'div', `position:absolute;left:0;top:955px;width:1080px;height:10px;background:${BRANCO};opacity:0;z-index:3;box-shadow:0 3px 10px rgba(0,0,0,.35);`);
  const ph = { fr, img, faixa, lado, cur: -1 };
  (S.async = S.async || []).push(async (tt, c) => {
    if (fr.style.opacity !== '1') return;
    const f = Math.min(NFR - 1, Math.max(0, c.frame));
    if (ph.cur !== f) { img.src = `../work/frames_largos/${String(f + 1).padStart(5, '0')}.jpg`; try { await img.decode(); } catch (e) { } ph.cur = f; }
    img.style.transform = `translateY(${(yt - fy * 960).toFixed(1)}px) scale(${(z * (1 + .015 * Math.sin(tt * .6))).toFixed(4)})`;
  });
  return ph;
}
function metade(ph, lt, t0, t1) {
  const q = E.out5(clamp((lt - t0) / .35)), qo = E.in(clamp((lt - t1) / .25)), on = lt >= t0 && lt < t1 + .25;
  const dy = (ph.lado === 'baixo' ? 1 : -1) * 980 * ((1 - q) + qo);
  ph.fr.style.opacity = on ? 1 : 0; ph.faixa.style.opacity = on ? 1 : 0;
  ph.fr.style.transform = `translateY(${dy.toFixed(1)}px)`; ph.faixa.style.transform = `translateY(${dy.toFixed(1)}px)`;
}
// círculo (cabeça, ombros e peito) com aro amarelo fino, no alto da tela; usa os quadros LARGOS (work/frames_largos, 1080x960)
// z = zoom sobre o quadro largo, fy/fx = centro da janela no quadro largo (nesta gravação o rosto fica em x ~0,555, y ~0,56;
// 2,0 / 0,60 mostram cabeça, ombros e peito)
function presBola(r, S, cx, cy, d = 380, z = 2.0, fy = .60, fx = .555) {
  const fr = el(r, 'div', `position:absolute;left:${cx - d / 2}px;top:${cy - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;overflow:hidden;background:#111;opacity:0;z-index:3;` +
    `box-shadow:0 0 0 8px ${BRANCO}, 0 0 0 11px ${PRETO}, 0 18px 32px rgba(0,0,0,.42);transform-origin:50% 50%;`);
  const img = el(fr, 'img', 'position:absolute;left:0;top:0;width:1080px;height:960px;transform-origin:0 0;'); img.decoding = 'sync';
  const k = d / 960 * z, x = Math.min(0, Math.max(d - 1080 * k, d / 2 - fx * 1080 * k)), y = Math.min(0, Math.max(d - 960 * k, d / 2 - fy * 960 * k));
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
// janela do círculo: do começo do 1º beat ao fim do último (com folga)
const JB = (c, b0, b1) => [c.b(b0) - .05, c.e(b1) + .02];

function papel(p, cx, cy, w, h, o = {}) {
  const b = box(p, cx, cy, w, h, `background:#ffffff url(${paperTex(400, Math.round(400 * h / w))}) center/100% 100%;box-shadow:0 20px 34px rgba(0,0,0,.36);padding:${(w * .08).toFixed(0)}px;box-sizing:border-box;font-family:Plex;color:#222;`);
  b._rot = o.rot ?? 0; b.style.opacity = 0;
  return b;
}
const linhas = (b, n, w0 = 92) => { for (let i = 0; i < n; i++) el(b, 'div', `height:14px;border-radius:4px;background:#e1ded6;margin-top:22px;width:${[w0, 86, 94, 78, 90, 70, 88, 60][i % 8]}%;`); };

// barra horizontal de dado (valor real, proporcional), cresce com b.at(q)
function barraH(p, x, y, wMax, hgt, cor, frac) {
  const b = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;width:${wMax}px;height:${hgt}px;transform-origin:0 50%;transform:scaleX(0);background:${cor} url(${ptex('#efece4', 30)});background-blend-mode:multiply;border-radius:0 10px 10px 0;box-shadow:0 10px 20px rgba(0,0,0,.22);`);
  b.at = q => { b.style.transform = `scaleX(${(frac * q).toFixed(4)})`; };
  return b;
}
// barra vertical de dado (cresce de baixo): b.at(fração da altura máxima)
function barraV(p, x, base, w, hMax, cor) {
  const b = el(p, 'div', `position:absolute;left:${x}px;top:${base - hMax}px;width:${w}px;height:${hMax}px;transform-origin:50% 100%;transform:scaleY(0);background:${cor} url(${ptex('#efece4', 30)});background-blend-mode:multiply;box-shadow:0 12px 22px rgba(0,0,0,.25);`);
  b.at = q => { b.style.transform = `scaleY(${Math.max(0, q).toFixed(4)})`; };
  return b;
}
// selo redondo em cor viva com texto escuro
function selo(p, cx, cy, d, l1, l2 = '', cor = BRANCO) {
  const tc = [V4, V4_E, VINHO, GRAFITE].includes(cor) ? BRANCO : VINHO;
  const b = box(p, cx, cy, d, d, `border-radius:50%;background:${cor} url(${ptex('#efece4', 30)});background-blend-mode:multiply;border:${d * .025}px solid ${VINHO};box-sizing:border-box;` +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 16px 26px rgba(0,0,0,.35);opacity:0;');
  el(b, 'div', `font-family:${MORG};font-weight:700;font-size:${d * .44}px;line-height:.9;letter-spacing:.01em;color:${tc};`, l1);
  if (l2) el(b, 'div', `margin-top:${d * .03}px;font-family:Plex;font-weight:800;font-size:${d * .07}px;letter-spacing:.12em;color:${tc};text-align:center;line-height:1.2;`, l2);
  b._rot = -8;
  return b;
}
// fonte do dado: etiqueta pequena datilografada sobre papel claro
const fonte = (p, txt, x, y, o = {}) => nota(p, txt, x, y, { s: o.s ?? 24, c: '#3a3a3a', centro: o.centro ?? true, wrap: o.wrap, align: o.align ?? 'center', css: `background:#f2f2f2;padding:6px 14px;box-shadow:0 6px 12px rgba(0,0,0,.18);${o.css || ''}`, rot: o.rot ?? 0 });

// ---------- fotos em sequência (cada uma na sua palavra) ----------
// foto impressa: a imagem fica em b.im (duotone: duo(b))
function foto(p, name, cx, cy, w, o = {}) {
  const b = printPhoto(p, name, cx, cy, w, { rot: o.rot ?? 0, tape: o.tape ?? ['tl'], pad: o.pad });
  b.im = b.querySelector('img');
  return b;
}
const duo = (b, esc = '#141414', cla = '#f4efe6') => duotone(b.im || b.img || b, esc, cla, { ct: 1.05 });
// itens: { n: 'print_x', x, y, w, r, t, tape, bk: [cor, x, y, w, h, rot], dy, out, oy, s, duo }
function pilha(p, itens) {
  return itens.map(it => {
    const bk = it.bk ? bloco(p, it.bk[0], it.bk[1], it.bk[2], it.bk[3], it.bk[4], it.bk[5] ?? 0) : null;
    const f = foto(p, it.n, it.x, it.y, it.w, { rot: it.r ?? 0, tape: it.tape ?? ['tl'] });
    if (it.duo) duo(f, ...(it.duo === true ? [] : it.duo));
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
  im.style.filter = o.filtro ?? 'grayscale(1) contrast(1.06)';
  g.push = (lt, d, ds = .07) => { im.style.transform = `scale(${(1 + ds * E.inOut(clamp(lt / Math.max(.1, d)))).toFixed(4)})`; };
  g.vig = el(g, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.4) 100%);');
  return g;
}

// ---------- mapas em papel (estados claros; Brasil e EUA pintados) ----------
function mapaBR(r, c, o = {}) {
  if (!o.semFundo) paperBg(r, { b: o.b });
  const M = mapView(r, { c, sea: 'transparent', seaCss: 'background-image:none;', land: o.land ?? 'rgba(255,255,255,.17)', border: o.border ?? 'rgba(255,255,255,.45)' });
  M.svg.style.filter = 'drop-shadow(0 10px 16px rgba(0,0,0,.22))';
  const ns = { 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' };
  M.ufs = sv(M.top, 'g', { fill: o.br ?? BRANCO, stroke: o.brBorda ?? '#efc9c9', 'stroke-width': 1.4 });
  M.uf = {};
  GEO.br.states.forEach(s => { M.uf[s.uf] = sv(M.ufs, 'path', { d: s.r.map(ringPath).join(''), ...ns }); });
  M.pinta = (lista, cor, borda = '#f2f2f2') => lista.forEach(u => { M.uf[u].setAttribute('fill', cor); M.uf[u].setAttribute('stroke', borda); M.uf[u].setAttribute('stroke-width', 2); });
  return M;
}
// ponto com pulso preso a lon/lat: e.at(lt, t, {out})
function pinoMapa(M, p, ll, o = {}) {
  const e = el(p, 'div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;');
  const r0 = o.r ?? 18, cor = o.cor ?? VERMELHO;
  const d = el(e, 'div', `position:absolute;left:${-r0}px;top:${-r0}px;width:${2 * r0}px;height:${2 * r0}px;border-radius:50%;background:${cor};border:5px solid #f2f2f2;box-sizing:border-box;box-shadow:0 6px 12px rgba(0,0,0,.35);`);
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
// rótulo preso ao mapa (tarja vinho, Plex): e.at(lt, t, {out})
function rotMapa(M, p, txt, ll, dx = 0, dy = -58, o = {}) {
  const e = tagL(p, txt, 0, 0, { s: o.s ?? 32, css: `background:${VINHO};color:#fff;font-weight:600;${o.css || ""}` });
  e.at = (lt, t, q = {}) => {
    const [x, y] = M.pt(...ll); e.style.left = `${(x + dx).toFixed(1)}px`; e.style.top = `${(y + dy).toFixed(1)}px`;
    if (lt < t) { e.style.opacity = 0; return; }
    const out = q.out !== undefined && lt > q.out ? clamp((lt - q.out) / .2) : 0;
    e.style.opacity = (ez(lt, t, .2) * (1 - out)).toFixed(3);
  };
  return e;
}
// rota curva com ponta de seta (navios, comércio): p.at(M, q); p.P(t) = ponto da curva
function rotaSeta(svg, a, b, o = {}) {
  const p = sv(svg, 'path', { fill: 'none', stroke: o.c ?? PRETO, 'stroke-width': o.w ?? 7, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash ?? '2 14', opacity: 0 });
  const ponta = sv(svg, 'path', { d: 'M -20 -13 L 4 0 L -20 13', fill: 'none', stroke: o.c ?? PRETO, 'stroke-width': o.w ?? 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 });
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
// engrenagens de papel girando (o capital trabalhando): s.gira(lt)
function engrenagens(p, cx, cy, R) {
  const s = svgAbs(p, cx - R * 2.2, cy - R * 1.6, R * 4.4, R * 3.2), o = [R * 1.4, R * 1.5], o2 = [R * 3.1, R * 1.9];
  const roda = (c, rr, dentes, cor) => {
    let d = '';
    for (let i = 0; i < dentes * 2; i++) {
      const a = i / (dentes * 2) * 2 * Math.PI, a2 = (i + 1) / (dentes * 2) * 2 * Math.PI, k = i % 2 ? .82 : 1;
      d += `${i ? 'L' : 'M'}${(c[0] + rr * k * Math.cos(a)).toFixed(1)},${(c[1] + rr * k * Math.sin(a)).toFixed(1)} L${(c[0] + rr * k * Math.cos(a2)).toFixed(1)},${(c[1] + rr * k * Math.sin(a2)).toFixed(1)} `;
    }
    const g = sv(s, 'g', {});
    sv(g, 'path', { d: d + 'Z', fill: cor, stroke: TINTA, 'stroke-width': 6 });
    sv(g, 'circle', { cx: c[0], cy: c[1], r: rr * .28, fill: '#efe9dc', stroke: TINTA, 'stroke-width': 6 });
    return g;
  };
  const g1 = roda(o, R, 12, VERMELHO), g2 = roda(o2, R * .66, 8, BRANCO);
  s.style.filter = 'drop-shadow(0 16px 20px rgba(0,0,0,.35))'; s.style.opacity = 0;
  s.gira = lt => { g1.setAttribute('transform', `rotate(${(lt * 40).toFixed(1)} ${o[0]} ${o[1]})`); g2.setAttribute('transform', `rotate(${(-lt * 40 * 12 / 8).toFixed(1)} ${o2[0]} ${o2[1]})`); };
  return s;
}

// ---------- o celular com o perfil REAL do Fernando (@fernandomiranda777; print na biblioteca do kit) ----------
const CEL = { w: 680, cx: 540, cy: 1130 };
function celular(p, w, cx, cy) {
  const h = w * 2.05, b = box(p, cx, cy, w, h, `background:#151515;border-radius:${w * .13}px;box-shadow:0 30px 50px rgba(0,0,0,.45);opacity:0;`);
  const ox = w * .045, oy = w * .05, sw = w * .91;
  const scr = el(b, 'div', `position:absolute;left:${ox}px;top:${oy}px;right:${ox}px;bottom:${oy}px;border-radius:${w * .1}px;background:#fff;overflow:hidden;`);
  el(b, 'div', `position:absolute;left:50%;top:${w * .075}px;width:${w * .26}px;height:${w * .055}px;transform:translateX(-50%);border-radius:99px;background:#151515;`);
  // perfil real: avatar (com o aro do print) e bloco de texto recortados do print, empilhados como no app
  const aw = sw * .44, at = sw * .13;
  const av = el(scr, 'img', `position:absolute;left:${(sw - aw) / 2}px;top:${at}px;width:${aw}px;height:${aw}px;`); av.src = AS('perfil_avatar').src;
  const tw = sw * .92, th = tw * 540 / 1106, tt = at + aw + sw * .05;
  const tx2 = el(scr, 'img', `position:absolute;left:${sw * .04}px;top:${tt}px;width:${tw}px;height:${th}px;`); tx2.src = AS('perfil_texto').src;
  const by = tt + th + sw * .05, bh = sw * .13;
  const bt = el(scr, 'div', `position:absolute;left:${sw * .06}px;right:${sw * .06}px;top:${by}px;height:${bh}px;border-radius:${sw * .03}px;background:${VERDE_CTA};color:#fff;font-family:Plex;font-weight:600;font-size:${sw * .062}px;line-height:${bh}px;text-align:center;`, 'Seguir');
  // grade de posts (cinza) só para compor a tela do app; sem imagens inventadas do perfil
  const g = el(scr, 'div', `position:absolute;left:0;right:0;top:${by + bh + sw * .07}px;bottom:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;align-content:start;`);
  for (let i = 0; i < 9; i++) el(g, 'div', `height:${sw * .4}px;background:${['#dedbd4', '#cfccc5', '#e6e3dc'][i % 3]};`);
  b.sv = svgAbs(b, 0, 0, w, h);
  b.pos = { perfil: oy + (at + tt + th) / 2, seguir: oy + by + bh / 2 };
  b.bt = bt; b._rot = -1;
  return b;
}

const TODAS_UF = () => GEO.br.states.map(s => s.uf);

// buraco rasgado no papel da mesa (borda de papel creme, fundo escuro): s.at(k) = escala (raio base 100 px)
function buraco(p, cx, cy) {
  const s = svgAbs(p, cx - 600, cy - 600, 1200, 1200), g = sv(s, 'g', {});
  const df = sv(sv(s, 'defs', {}), 'radialGradient', { id: 'grBur' });
  sv(df, 'stop', { offset: '0%', 'stop-color': '#000' }); sv(df, 'stop', { offset: '100%', 'stop-color': '#2b2a27' });
  const pts = (R, sd) => {
    let d = '';
    for (let i = 0; i < 60; i++) { const a = i / 60 * 2 * Math.PI, k = 1 + .16 * (hrand(sd + i * 3.7) - .5) + .05 * Math.sin(i * 2.3); d += `${i ? 'L' : 'M'}${(600 + R * k * Math.cos(a)).toFixed(1)},${(600 + R * .78 * k * Math.sin(a)).toFixed(1)}`; }
    return d + 'Z';
  };
  sv(g, 'path', { d: pts(112, 11), fill: '#f3eee2', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 2 });
  sv(g, 'path', { d: pts(100, 29), fill: 'url(#grBur)' });
  s.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,.3))';
  s.at = k => { g.setAttribute('transform', `translate(600 600) scale(${Math.max(.001, k).toFixed(3)}) translate(-600 -600)`); s.style.opacity = k > .01 ? 1 : 0; };
  s.at(0);
  return s;
}
// documento simples em papel (cabeçalho em serifa + linhas cinza): b
function doc(p, cx, cy, w, h, titulo, o = {}) {
  const b = papel(p, cx, cy, w, h, { rot: o.rot ?? 0 });
  if (o.kicker) el(b, 'div', `font-family:Plex;font-weight:800;font-size:${o.ks ?? 20}px;letter-spacing:.16em;color:#777;`, o.kicker);
  el(b, 'div', `font-family:${SERIF};font-weight:700;font-size:${o.ts ?? 44}px;line-height:1.1;color:${TINTA};margin-top:10px;border-bottom:3px solid ${TINTA};padding-bottom:12px;`, titulo);
  if (o.sub) el(b, 'div', `font-family:${SERIF};font-style:italic;font-size:${o.ss ?? 32}px;color:${o.sc ?? VERMELHO};margin-top:10px;`, o.sub);
  linhas(b, o.n ?? 6);
  return b;
}
// termômetro dos juros: s.nivel(q) 0..1
function termometro(p, cx, top, h) {
  const w = 116, s = svgAbs(p, cx - 150, top - 20, 300, h + 240);
  sv(s, 'rect', { x: 150 - w / 2, y: 20, width: w, height: h, rx: w / 2, fill: '#f2f2f2', stroke: TINTA, 'stroke-width': 8 });
  const liq = sv(s, 'rect', { x: 150 - w / 2 + 24, y: 20, width: w - 48, height: h, rx: 18, fill: VERMELHO });
  for (let i = 0; i <= 8; i++) { const y = 70 + (h - 120) * i / 8; sv(s, 'line', { x1: 150 + w / 2 + 6, x2: 150 + w / 2 + (i % 2 ? 22 : 40), y1: y, y2: y, stroke: TINTA, 'stroke-width': 5, 'stroke-linecap': 'round' }); }
  sv(s, 'circle', { cx: 150, cy: h + 100, r: 100, fill: VERMELHO, stroke: TINTA, 'stroke-width': 8 });
  s.style.filter = 'drop-shadow(0 16px 22px rgba(0,0,0,.32))';
  s.nivel = q => { const y = 60 + (h - 80) * (1 - clamp(q)); liq.setAttribute('y', y.toFixed(1)); liq.setAttribute('height', (h + 100 - y).toFixed(1)); };
  s.nivel(.9); s.style.opacity = 0;
  return s;
}
// campo de futebol desenhado (giz creme sobre o papel verde)
function campo(p) {
  const s = svgAbs(p, 0, 0, 1080, 1920), a = { fill: 'none', stroke: '#f2f2f2', 'stroke-width': 7, opacity: .8, 'stroke-linejoin': 'round' };
  sv(s, 'rect', { x: 90, y: 180, width: 900, height: 1560, ...a });
  sv(s, 'line', { x1: 90, x2: 990, y1: 960, y2: 960, ...a });
  sv(s, 'circle', { cx: 540, cy: 960, r: 160, ...a });
  sv(s, 'circle', { cx: 540, cy: 960, r: 9, fill: '#f2f2f2', opacity: .8 });
  [[180, 1], [1740, -1]].forEach(([y, k]) => {
    sv(s, 'rect', { x: 300, y: k > 0 ? y : y - 290, width: 480, height: 290, ...a });
    sv(s, 'rect', { x: 420, y: k > 0 ? y : y - 110, width: 240, height: 110, ...a });
    sv(s, 'path', { d: `M 440 ${y + k * 290} A 130 130 0 0 ${k > 0 ? 0 : 1} 640 ${y + k * 290}`, ...a });
  });
  return s;
}
// ficha de "empresa" (cartão de papel com fábrica em silhueta), para pôr em campo
function ficha(p, x, y) {
  const b = box(p, x, y, 150, 120, `background:#ffffff url(${ptex('#ffffff', 18)});box-shadow:0 10px 16px rgba(0,0,0,.35);border-radius:8px;opacity:0;`);
  const s = svgAbs(b, 15, 18, 120, 84);
  sv(s, 'path', { d: 'M0 84 L0 40 L22 28 L22 40 L44 28 L44 40 L66 28 L66 84 Z M74 84 L74 6 L86 6 L86 84 Z M94 84 L94 22 L106 22 L106 84 Z M66 84 L66 50 L120 50 L120 84 Z', fill: TINTA });
  el(b, 'div', `position:absolute;left:0;right:0;bottom:0;height:10px;background:${VERMELHO};border-radius:0 0 8px 8px;`);
  return b;
}
// botão giratório (a "arma" do governo): b.gira(ângulo)
function dial(p, cx, cy, d) {
  const s = svgAbs(p, cx - d / 2, cy - d / 2, d, d), r = d / 2;
  sv(s, 'circle', { cx: r, cy: r, r: r - 6, fill: '#f2f2f2', stroke: TINTA, 'stroke-width': 10 });
  for (let i = 0; i < 9; i++) { const a = (-135 + i * 33.75) * Math.PI / 180; sv(s, 'line', { x1: r + (r - 26) * Math.sin(a), y1: r - (r - 26) * Math.cos(a), x2: r + (r - 50) * Math.sin(a), y2: r - (r - 50) * Math.cos(a), stroke: TINTA, 'stroke-width': 6, 'stroke-linecap': 'round' }); }
  const g = sv(s, 'g', {});
  sv(g, 'circle', { cx: r, cy: r, r: r * .52, fill: VERMELHO, stroke: TINTA, 'stroke-width': 8 });
  sv(g, 'rect', { x: r - 9, y: r * .5, width: 18, height: r * .55, rx: 9, fill: BRANCO, stroke: TINTA, 'stroke-width': 5 });
  s.style.filter = 'drop-shadow(0 14px 20px rgba(0,0,0,.4))'; s.style.opacity = 0;
  s.gira = a => g.setAttribute('transform', `rotate(${a.toFixed(1)} ${r} ${r})`);
  return s;
}
// balança de pratos desenhada: s.at(ângulo do braço, graus; + = desce à direita)
function balanca(p, cx, cy, w, esq, dir) {
  const H2 = w * .95, s = svgAbs(p, cx - w / 2 - 60, cy - 80, w + 120, H2 + 160), ox = w / 2 + 60, oy = 80;
  sv(s, 'path', { d: `M ${ox - 22} ${oy + 30} L ${ox + 22} ${oy + 30} L ${ox + 40} ${oy + H2} L ${ox - 40} ${oy + H2} Z`, fill: TINTA });
  sv(s, 'rect', { x: ox - 150, y: oy + H2 - 6, width: 300, height: 34, rx: 10, fill: TINTA });
  const braco = sv(s, 'g', {});
  sv(braco, 'rect', { x: ox - w / 2, y: oy - 9, width: w, height: 18, rx: 9, fill: TINTA });
  sv(s, 'circle', { cx: ox, cy: oy, r: 22, fill: BRANCO, stroke: TINTA, 'stroke-width': 6 });
  const prato = (lado, txt, cor, tcor) => {
    const g = sv(s, 'g', {});
    sv(g, 'line', { x1: -110, y1: 210, x2: 0, y2: 0, stroke: TINTA, 'stroke-width': 4 }); sv(g, 'line', { x1: 110, y1: 210, x2: 0, y2: 0, stroke: TINTA, 'stroke-width': 4 });
    sv(g, 'path', { d: 'M -150 210 Q 0 270 150 210 Z', fill: TINTA });
    sv(g, 'rect', { x: -105, y: 112, width: 210, height: 96, rx: 8, fill: cor, stroke: TINTA, 'stroke-width': 5 });
    const t = sv(g, 'text', { x: 0, y: 172, 'text-anchor': 'middle', 'font-family': 'Plex', 'font-weight': 800, 'font-size': 30, 'letter-spacing': '2', fill: tcor }); t.textContent = txt;
    g.lado = lado; return g;
  };
  const pe = prato(-1, esq[0], esq[1], esq[2]), pd = prato(1, dir[0], dir[1], dir[2]);
  s.style.filter = 'drop-shadow(0 16px 22px rgba(0,0,0,.32))'; s.style.opacity = 0;
  s.at = ang => {
    braco.setAttribute('transform', `rotate(${ang.toFixed(2)} ${ox} ${oy})`);
    const a = ang * Math.PI / 180;
    [pe, pd].forEach(g => { const x = ox + g.lado * (w / 2 - 20) * Math.cos(a), y = oy + g.lado * (w / 2 - 20) * Math.sin(a); g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); });
  };
  s.at(0);
  return s;
}
// cofre do fundo parado: s.abre(q) 0..1 (porta gira)
function cofre(p, cx, cy, w) {
  const h = w * 1.05, s = svgAbs(p, cx - w / 2, cy - h / 2, w, h + 40);
  sv(s, 'rect', { x: 0, y: 0, width: w, height: h, rx: 22, fill: PRETO, stroke: TINTA, 'stroke-width': 8 });
  sv(s, 'rect', { x: w * .08, y: h * .07, width: w * .84, height: h * .8, rx: 14, fill: '#262626' });
  sv(s, 'rect', { x: w * .12, y: h + 2, width: w * .16, height: 30, fill: TINTA }); sv(s, 'rect', { x: w * .72, y: h + 2, width: w * .16, height: 30, fill: TINTA });
  const porta = sv(s, 'g', {});
  sv(porta, 'rect', { x: w * .08, y: h * .07, width: w * .84, height: h * .8, rx: 14, fill: VERMELHO, stroke: TINTA, 'stroke-width': 7 });
  sv(porta, 'circle', { cx: w * .5, cy: h * .42, r: w * .17, fill: '#f2f2f2', stroke: TINTA, 'stroke-width': 7 });
  const disco = sv(porta, 'g', {});
  for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; sv(disco, 'line', { x1: w * .5 + w * .1 * Math.cos(a), y1: h * .42 + w * .1 * Math.sin(a), x2: w * .5 + w * .145 * Math.cos(a), y2: h * .42 + w * .145 * Math.sin(a), stroke: TINTA, 'stroke-width': 4 }); }
  sv(disco, 'circle', { cx: w * .5, cy: h * .42, r: w * .05, fill: BRANCO, stroke: TINTA, 'stroke-width': 5 });
  sv(porta, 'rect', { x: w * .78, y: h * .36, width: w * .07, height: h * .14, rx: 8, fill: BRANCO, stroke: TINTA, 'stroke-width': 5 });
  const pl = sv(porta, 'g', {});
  sv(pl, 'rect', { x: w * .3, y: h * .66, width: w * .4, height: h * .12, rx: 6, fill: BRANCO, stroke: TINTA, 'stroke-width': 5 });
  const t = sv(pl, 'text', { x: w * .5, y: h * .74, 'text-anchor': 'middle', 'font-family': 'Plex', 'font-weight': 800, 'font-size': w * .055, 'letter-spacing': 3, fill: TINTA }); t.textContent = 'FUNDO';
  s.style.filter = 'drop-shadow(0 22px 30px rgba(0,0,0,.42))'; s.style.opacity = 0;
  s.abre = (q, lt = 0) => {
    disco.setAttribute('transform', `rotate(${(lt * 30).toFixed(1)} ${w * .5} ${h * .42})`);
    const k = Math.cos(clamp(q) * Math.PI * .46);   // a porta gira para a esquerda (encurta)
    porta.setAttribute('transform', `translate(${(w * .08).toFixed(1)} 0) scale(${k.toFixed(3)} 1) translate(${(-w * .08).toFixed(1)} 0)`);
  };
  s.abre(0);
  return s;
}
// cheque de papel (Tesouro, juros)
function cheque(p, cx, cy, w) {
  const h = w * .44, b = box(p, cx, cy, w, h, `background:#f6f1e6 url(${ptex('#f6f1e6', 22)});background-blend-mode:multiply;box-shadow:0 14px 24px rgba(0,0,0,.35);border:3px solid #b9b2a4;opacity:0;font-family:Plex;color:#2a2a2a;`);
  el(b, 'div', `position:absolute;left:5%;top:9%;font-family:Plex;font-weight:800;font-size:${w * .042}px;letter-spacing:.14em;`, 'TESOURO NACIONAL');
  el(b, 'div', `position:absolute;right:5%;top:9%;font-family:Plex;font-weight:800;font-size:${w * .042}px;color:${VERMELHO};`, 'JUROS');
  el(b, 'div', `position:absolute;left:5%;top:36%;font-size:${w * .04}px;`, 'Pague-se por este cheque');
  el(b, 'div', `position:absolute;left:5%;right:40%;top:60%;border-bottom:2px solid #555;height:${w * .05}px;`);
  el(b, 'div', `position:absolute;right:5%;top:52%;width:32%;height:${w * .09}px;border:2px solid #555;font-size:${w * .045}px;line-height:${w * .09}px;text-align:center;`, 'R$');
  b._rot = -5;
  return b;
}
// etiqueta de preço pendurada (o "preço" do capital): b
function etiqueta(p, cx, cy, w, txt, o = {}) {
  const h = w * .62, b = box(p, cx, cy, w, h, 'opacity:0;transform-origin:8% 50%;');
  const s = svgAbs(b, 0, 0, w, h);
  sv(s, 'path', { d: `M ${w * .16} 4 L ${w - 6} 4 L ${w - 6} ${h - 4} L ${w * .16} ${h - 4} L 6 ${h / 2} Z`, fill: BRANCO, stroke: TINTA, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  sv(s, 'circle', { cx: w * .15, cy: h / 2, r: w * .035, fill: '#f2f2f2', stroke: TINTA, 'stroke-width': 5 });
  sv(s, 'path', { d: `M ${w * .15} ${h / 2} C ${w * .05} ${-h * .4}, ${-w * .1} ${-h * .5}, ${-w * .2} ${-h * .9}`, fill: 'none', stroke: TINTA, 'stroke-width': 4 });
  el(b, 'div', `position:absolute;left:${w * .25}px;top:${h * .14}px;font-family:${SERIF};font-weight:700;font-size:${w * (o.fs ?? .14)}px;color:${TINTA};white-space:nowrap;`, txt);
  el(b, 'div', `position:absolute;left:${w * .25}px;top:${h * .52}px;font-family:Plex;font-weight:800;font-size:${w * .07}px;letter-spacing:.12em;color:${TINTA};`, o.sub ?? 'CUSTO');
  b.sv = svgAbs(b, 0, 0, w, h);
  b.seta = traco(b.sv, `M ${w * .66} ${h * .42} C ${w * .68} ${h * .55}, ${w * .67} ${h * .7}, ${w * .68} ${h * .86} M ${w * .6} ${h * .74} L ${w * .68} ${h * .88} L ${w * .77} ${h * .74}`, { c: VERMELHO, w: 12 });
  b.h = h;
  return b;
}


// tesoura desenhada (tinta, cabos amarelos): s.at(abertura 0..1) — pivô em (cx, cy), lâminas apontando para a esquerda
function tesoura(p, cx, cy, L = 300) {
  const s = svgAbs(p, cx - L, cy - L * .6, L * 2, L * 1.2), ox = L, oy = L * .6;
  const lam = (k) => {
    const g = sv(s, 'g', {});
    sv(g, 'path', { d: `M ${ox} ${oy} L ${ox - L * .95} ${oy - 10 * k} L ${ox - L * .95} ${oy + 8 * k} Z`, fill: '#cfcac0', stroke: TINTA, 'stroke-width': 6, 'stroke-linejoin': 'round' });
    sv(g, 'path', { d: `M ${ox} ${oy} C ${ox + L * .2} ${oy + 30 * k}, ${ox + L * .35} ${oy + 60 * k}, ${ox + L * .5} ${oy + 70 * k}`, fill: 'none', stroke: TINTA, 'stroke-width': 14, 'stroke-linecap': 'round' });
    sv(g, 'ellipse', { cx: ox + L * .62, cy: oy + 80 * k, rx: L * .14, ry: L * .1, fill: VERMELHO, stroke: TINTA, 'stroke-width': 9 });
    return g;
  };
  const a = lam(-1), b = lam(1);
  sv(s, 'circle', { cx: ox, cy: oy, r: 9, fill: VERMELHO, stroke: TINTA, 'stroke-width': 4 });
  s.style.filter = 'drop-shadow(0 12px 16px rgba(0,0,0,.35))'; s.style.opacity = 0;
  s.at = q => { const ang = 16 * clamp(q); a.setAttribute('transform', `rotate(${ang} ${ox} ${oy})`); b.setAttribute('transform', `rotate(${-ang} ${ox} ${oy})`); };
  s.at(1);
  return s;
}
// pilha de moedas amarelas que cresce: s.at(n visíveis)
function moedas(p, cx, base, n = 9, w = 190) {
  const s = svgAbs(p, cx - w / 2 - 20, base - n * 26 - 80, w + 40, n * 26 + 120), C = [];
  for (let i = 0; i < n; i++) {
    const y = n * 26 + 60 - i * 26, x = 20 + (hrand(i * 5 + 2) - .5) * 14;
    const g = sv(s, 'g', {});
    sv(g, 'rect', { x, y: y - 6, width: w, height: 28, fill: '#bdb6a8', stroke: TINTA, 'stroke-width': 5 });
    sv(g, 'ellipse', { cx: x + w / 2, cy: y - 6, rx: w / 2, ry: 18, fill: '#ece7dd', stroke: TINTA, 'stroke-width': 5 });
    C.push(g);
  }
  s.style.filter = 'drop-shadow(0 12px 16px rgba(0,0,0,.3))';
  s.at = (lt, t0) => C.forEach((g, i) => { if (t0 < -5) { g.setAttribute('opacity', i < 4 ? 1 : 0); g.setAttribute('transform', ''); return; } const tt = t0 + Math.max(0, i - 4) * .06, q = i < 4 ? 1 : E.out5(clamp((lt - tt) / .25)); g.setAttribute('opacity', i < 4 || lt >= tt ? 1 : 0); g.setAttribute('transform', `translate(0 ${(-120 * (1 - q)).toFixed(1)})`); });
  return s;
}
// loja: porta de aço de enrolar com toldo amarelo: b.at(q) (0 = fechada, 1 = aberta); atrás, a loja iluminada
function portaAco(p, cx, cy, w, h) {
  const b = box(p, cx, cy, w, h + 70, 'opacity:0;');
  el(b, 'div', `position:absolute;left:-20px;top:0;width:${w + 40}px;height:70px;background:${VERMELHO} url(${ptex('#efece4', 30)});background-blend-mode:multiply;` +
    'clip-path:polygon(0 0,100% 0,96% 100%,4% 100%);box-shadow:0 12px 18px rgba(0,0,0,.3);z-index:2;');
  const fr = el(b, 'div', `position:absolute;left:0;top:70px;width:${w}px;height:${h}px;overflow:hidden;background:#f2ece0;box-shadow:0 18px 30px rgba(0,0,0,.4);border:8px solid ${TINTA};box-sizing:border-box;`);
  for (let i = 0; i < 3; i++) el(fr, 'div', `position:absolute;left:${16 + i * (w - 32) / 3}px;top:${h * .45}px;width:${(w - 32) / 3 - 14}px;height:${h * .5}px;background:#ddd6ca;border-top:6px solid ${VERMELHO};`);
  b.lam = el(fr, 'div', 'position:absolute;left:0;top:0;width:100%;height:100%;background:repeating-linear-gradient(180deg, #b9b6af 0 20px, #8f8c86 20px 23px, #cfccc5 23px 34px, #7d7a74 34px 36px);');
  b.at = q => { b.lam.style.transform = `translateY(${(-h * E.inOut(clamp(q))).toFixed(1)}px)`; };
  b._rot = -2;
  return b;
}
// placa de papelão "PRECISA-SE" (escrita à mão)
function placaPrecisa(p, cx, cy, w) {
  const h = w * .62, b = box(p, cx, cy, w, h, `background:#f7f3ec url(${ptex('#f7f3ec', 30)});background-blend-mode:multiply;box-shadow:0 16px 26px rgba(0,0,0,.38);border-radius:6px;opacity:0;`);
  el(b, 'div', `position:absolute;left:0;right:0;top:${h * .16}px;text-align:center;font-family:Marker;font-size:${w * .15}px;color:${TINTA};`, 'PRECISA-SE');
  el(b, 'div', `position:absolute;left:0;right:0;top:${h * .55}px;text-align:center;font-family:Marker;font-size:${w * .085}px;color:${VERMELHO};`, 'vaga de emprego');
  el(b, 'div', `position:absolute;left:50%;top:-10px;width:16px;height:16px;margin-left:-8px;border-radius:50%;background:${VERMELHO};border:3px solid ${TINTA};`);
  b._rot = -4;
  return b;
}
// relógio de parede desenhado: s.at(lt, flex 0..1) — no "flexível" o mostrador estica e os ponteiros correm
function relogio(p, cx, cy, R) {
  const s = svgAbs(p, cx - R - 20, cy - R - 20, 2 * R + 40, 2 * R + 40), o = R + 20, g = sv(s, 'g', {});
  sv(g, 'circle', { cx: o, cy: o, r: R, fill: '#f2f2f2', stroke: TINTA, 'stroke-width': 12 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; sv(g, 'line', { x1: o + (R - 18) * Math.sin(a), y1: o - (R - 18) * Math.cos(a), x2: o + (R - (i % 3 ? 34 : 46)) * Math.sin(a), y2: o - (R - (i % 3 ? 34 : 46)) * Math.cos(a), stroke: TINTA, 'stroke-width': i % 3 ? 5 : 9, 'stroke-linecap': 'round' }); }
  const hh = sv(g, 'line', { x1: o, y1: o, x2: o, y2: o - R * .45, stroke: TINTA, 'stroke-width': 13, 'stroke-linecap': 'round' });
  const mm = sv(g, 'line', { x1: o, y1: o, x2: o, y2: o - R * .72, stroke: VERMELHO, 'stroke-width': 9, 'stroke-linecap': 'round' });
  sv(g, 'circle', { cx: o, cy: o, r: 13, fill: VERMELHO, stroke: TINTA, 'stroke-width': 4 });
  s.style.filter = 'drop-shadow(0 14px 20px rgba(0,0,0,.35))'; s.style.opacity = 0;
  s.at = (lt, f) => {
    const ang = 60 + 900 * E.inOut(clamp(f));
    mm.setAttribute('transform', `rotate(${ang.toFixed(1)} ${o} ${o})`); hh.setAttribute('transform', `rotate(${(250 + ang / 12).toFixed(1)} ${o} ${o})`);
    const wob = f > 0 && f < 1.6 ? Math.sin(f * 9) * .16 * (1 - clamp(f / 1.6)) : 0;
    g.setAttribute('transform', `translate(${o} ${o}) scale(${(1 + wob).toFixed(3)} ${(1 - wob * .8).toFixed(3)}) translate(${-o} ${-o})`);
  };
  return s;
}
// silhueta anônima (pessoa de costas/perfil, tinta chapada): g
function silhueta(p, x, base, h = 360) {
  const k = h / 360, s = svgAbs(p, x - 90 * k, base - h, 180 * k, h);
  const g = sv(s, 'g', { transform: `scale(${k})` });
  sv(g, 'circle', { cx: 90, cy: 46, r: 40, fill: TINTA });
  sv(g, 'path', { d: 'M 40 112 Q 90 92 140 112 L 150 236 L 128 236 L 124 360 L 98 360 L 92 250 L 86 360 L 60 360 L 56 236 L 30 236 Z', fill: TINTA });
  s.style.opacity = 0;
  return s;
}
// ímã em ferradura (verde com pontas amarelas)
function ima(p, cx, cy, w) {
  const s = svgAbs(p, cx - w / 2 - 10, cy - w * .6, w + 20, w * 1.1), a = w * .2, r = w / 2 - a / 2, ox = w / 2 + 10, oy = w * .55;
  sv(s, 'path', { d: `M ${ox - r} ${oy - w * .45} L ${ox - r} ${oy} A ${r} ${r} 0 0 0 ${ox + r} ${oy} L ${ox + r} ${oy - w * .45}`, fill: 'none', stroke: VERMELHO, 'stroke-width': a, 'stroke-linecap': 'butt' });
  sv(s, 'path', { d: `M ${ox - r} ${oy - w * .45} L ${ox - r} ${oy} A ${r} ${r} 0 0 0 ${ox + r} ${oy} L ${ox + r} ${oy - w * .45}`, fill: 'none', stroke: TINTA, 'stroke-width': a + 10, 'stroke-linecap': 'butt', opacity: .0 });
  [ox - r, ox + r].forEach(x => sv(s, 'rect', { x: x - a / 2, y: oy - w * .45 - a * .9, width: a, height: a * .9, fill: BRANCO, stroke: TINTA, 'stroke-width': 5 }));
  s.style.filter = 'drop-shadow(0 14px 18px rgba(0,0,0,.4))'; s.style.opacity = 0;
  return s;
}
// seta grande com texto (GOVERNO): b; dir = -1 aponta para a esquerda
function setaTexto(p, cx, cy, w, h, txt, cor, dir) {
  const b = box(p, cx, cy, w, h, 'opacity:0;'), s = svgAbs(b, 0, 0, w, h), t = h * .5;
  const d = dir > 0 ? `M 0 ${h * .22} L ${w - t} ${h * .22} L ${w - t} 0 L ${w} ${h / 2} L ${w - t} ${h} L ${w - t} ${h * .78} L 0 ${h * .78} Z`
    : `M ${w} ${h * .22} L ${t} ${h * .22} L ${t} 0 L 0 ${h / 2} L ${t} ${h} L ${t} ${h * .78} L ${w} ${h * .78} Z`;
  sv(s, 'path', { d, fill: cor, stroke: TINTA, 'stroke-width': 6, 'stroke-linejoin': 'round' });
  el(b, 'div', `position:absolute;left:${dir > 0 ? 0 : t}px;width:${w - t}px;top:0;height:${h}px;line-height:${h}px;text-align:center;font-family:Plex;font-weight:800;font-size:${h * .3}px;letter-spacing:.14em;color:#fff;`, txt);
  b.style.filter = 'drop-shadow(0 12px 18px rgba(0,0,0,.35))';
  return b;
}
// saco de adubo (NPK) desenhado
function saco(p, cx, cy, w) {
  const h = w * 1.25, b = box(p, cx, cy, w, h, 'opacity:0;'), s = svgAbs(b, 0, 0, w, h);
  sv(s, 'path', { d: `M ${w * .1} ${h * .08} Q ${w * .5} ${h * .02} ${w * .9} ${h * .08} L ${w * .97} ${h * .92} Q ${w * .5} ${h} ${w * .03} ${h * .92} Z`, fill: '#e9e2cf', stroke: TINTA, 'stroke-width': 7, 'stroke-linejoin': 'round' });
  sv(s, 'path', { d: `M ${w * .1} ${h * .08} L ${w * .2} 0 L ${w * .3} ${h * .07} L ${w * .42} 0 L ${w * .55} ${h * .06} L ${w * .68} 0 L ${w * .8} ${h * .07} L ${w * .9} ${h * .08}`, fill: 'none', stroke: TINTA, 'stroke-width': 6 });
  el(b, 'div', `position:absolute;left:0;right:0;top:${h * .3}px;text-align:center;font-family:Morganite;font-size:${w * .3}px;letter-spacing:.06em;color:${VERMELHO};`, 'NPK');
  el(b, 'div', `position:absolute;left:0;right:0;top:${h * .6}px;text-align:center;font-family:Plex;font-weight:800;font-size:${w * .075}px;letter-spacing:.14em;color:${TINTA};`, 'FERTILIZANTE');
  b.style.filter = 'drop-shadow(0 16px 22px rgba(0,0,0,.38))'; b._rot = 3;
  return b;
}
// quadro de vagas (papel com 6 cartões): b.cards[i]
function quadroVagas(p, cx, cy, w, h) {
  const b = papel(p, cx, cy, w, h, { rot: -1 });
  el(b, 'div', `font-family:${SERIF};font-weight:700;font-size:${w * .1}px;line-height:1;color:${TINTA};text-align:center;`, 'Vagas');
  b.cards = [...Array(6)].map((_, i) => {
    const cw = (w - w * .16 - 30) / 2, chh = (h - w * .26 - 60) / 3, x = w * .08 + (i % 2) * (cw + 30), y = w * .2 + Math.floor(i / 2) * (chh + 30);
    const cd = el(b, 'div', `position:absolute;left:${x}px;top:${y}px;width:${cw}px;height:${chh}px;background:#f2f2f2;box-shadow:0 6px 10px rgba(0,0,0,.2);transform:rotate(${(hrand(i * 3) - .5) * 4}deg);`);
    for (let k = 0; k < 3; k++) el(cd, 'div', `position:absolute;left:12%;top:${22 + k * 24}%;width:${[70, 56, 64][k]}%;height:9%;border-radius:4px;background:#d9d5cb;`);
    el(cd, 'div', `position:absolute;left:50%;top:-9px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:${VERMELHO};border:3px solid ${TINTA};`);
    cd.st = inkStamp(cd, 'OCUPADA', cw / 2, chh / 2, { s: Math.min(44, cw * .12), c: VERMELHO, rot: -9 });
    return cd;
  });
  return b;
}


// ---------- peças novas deste vídeo (preto, vermelho e laranja) ----------
// câmera do mapa com zoom exponencial entre dois enquadramentos (q 0–1)
function voo(M, a, b, q) { const u = E.inOut(clamp(q)); M.set({ lon: lerp(a.lon, b.lon, u), lat: lerp(a.lat, b.lat, u), z: a.z * Math.pow(b.z / a.z, u), cy: lerp(a.cy ?? 960, b.cy ?? 960, u) }); }
// cartão de logo REAL (papel claro, logo inteira, sem cortar) + rótulo pequeno opcional embaixo
function logo(p, name, cx, cy, w, o = {}) {
  const a = AS(name), r = a.h / a.w, iw = w * (o.k ?? .8), ih = Math.min(iw * r, w * (o.hmax ?? .62)), iw2 = ih / r;
  const pad = w * (o.pad ?? .2), h = ih + pad + (o.txt ? w * .13 : 0);
  const b = box(p, cx, cy, w, h, `background:#ffffff url(${ptex('#ffffff', 18)});box-shadow:0 14px 24px rgba(0,0,0,.32);border-radius:10px;opacity:0;`);
  const im = el(b, 'img', `position:absolute;left:${((w - iw2) / 2).toFixed(1)}px;top:${(pad / 2).toFixed(1)}px;width:${iw2.toFixed(1)}px;height:${ih.toFixed(1)}px;`); im.src = a.src;
  if (o.txt) el(b, 'div', `position:absolute;left:0;right:0;bottom:${(w * .05).toFixed(0)}px;text-align:center;font-family:Plex;font-size:${(w * .075).toFixed(0)}px;color:#444;white-space:nowrap;`, o.txt);
  b._rot = o.rot ?? 0; b.h = h;
  return b;
}
// número grande + legenda em caixa alta (dado real; a fonte vai numa etiqueta à parte)
function dado(p, num, cx, cy, o = {}) {
  const g = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);opacity:0;text-align:center;white-space:nowrap;`);
  g.n = el(g, 'div', `font-family:${MORG};font-weight:700;font-size:${((o.s ?? 150) * 1.45).toFixed(0)}px;line-height:.9;letter-spacing:.01em;color:${o.c ?? BRANCO};text-shadow:-3px 5px 0 rgba(40,0,0,.18);`, num);
  if (o.sub) el(g, 'div', `margin-top:10px;font-family:Plex;font-weight:600;font-size:${o.ss ?? 28}px;letter-spacing:.14em;color:${o.sc ?? (o.c && o.c !== BRANCO ? o.c : BRANCO)};`, o.sub);
  g._base = 'translate(-50%,-50%)'; g._rot = o.rot ?? 0;
  return g;
}
// placa pendurada FECHADO / ABERTO que vira na palavra: b.at(lt, t0, t)
function placaLoja(p, cx, cy, w) {
  const h = w * .46, b = box(p, cx, cy, w, h, 'opacity:0;transform-style:preserve-3d;');
  b.f = el(b, 'div', `position:absolute;inset:0;border-radius:12px;background:#f2f2f2;border:6px solid ${TINTA};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:Plex;font-weight:800;font-size:${w * .15}px;letter-spacing:.08em;color:${TINTA};backface-visibility:hidden;box-shadow:0 12px 20px rgba(0,0,0,.3);`, 'FECHADO');
  b.a = el(b, 'div', `position:absolute;inset:0;border-radius:12px;background:${VERMELHO};border:6px solid ${TINTA};box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:Plex;font-weight:800;font-size:${w * .16}px;letter-spacing:.08em;color:#fff;backface-visibility:hidden;transform:rotateY(180deg);box-shadow:0 12px 20px rgba(0,0,0,.3);`, 'ABERTO');
  b.at = (lt, t0, t) => {
    b.style.opacity = lt >= t0 ? 1 : 0;
    const q = E.out5(clamp((lt - t) / .45)), sw = lt >= t ? Math.sin(clamp((lt - t) / 1.2) * Math.PI * 3) * 7 * (1 - clamp((lt - t) / 1.2)) : 0;
    b.style.transform = `perspective(900px) rotateY(${(180 * q).toFixed(1)}deg) rotate(${sw.toFixed(2)}deg)`;
  };
  return b;
}
// cartola preta com faixa vermelha "GOVERNO" e varinha (s.vara)
function cartola(p, cx, cy, w) {
  const h = w * 1.05, s = svgAbs(p, cx - w / 2, cy - h / 2, w, h + 40);
  sv(s, 'ellipse', { cx: w / 2, cy: h * .86, rx: w * .5, ry: h * .1, fill: PRETO });
  sv(s, 'path', { d: `M ${w * .2} ${h * .86} L ${w * .24} ${h * .12} Q ${w * .5} ${h * .04} ${w * .76} ${h * .12} L ${w * .8} ${h * .86} Z`, fill: '#222' });
  sv(s, 'ellipse', { cx: w / 2, cy: h * .12, rx: w * .26, ry: h * .05, fill: '#333' });
  sv(s, 'path', { d: `M ${w * .21} ${h * .66} L ${w * .79} ${h * .66} L ${w * .795} ${h * .78} L ${w * .205} ${h * .78} Z`, fill: VERMELHO });
  const t = sv(s, 'text', { x: w / 2, y: h * .75, 'text-anchor': 'middle', 'font-family': 'Plex', 'font-weight': 800, 'font-size': w * .075, 'letter-spacing': 4, fill: '#fff' }); t.textContent = 'GOVERNO';
  s.vara = sv(s, 'g', {});
  sv(s.vara, 'rect', { x: w * .62, y: -h * .05, width: w * .05, height: h * .55, rx: 6, fill: PRETO, transform: `rotate(35 ${w * .64} ${h * .22})` });
  sv(s.vara, 'rect', { x: w * .62, y: -h * .05, width: w * .05, height: h * .1, rx: 4, fill: '#f2f2f2', transform: `rotate(35 ${w * .64} ${h * .22})` });
  s.style.filter = 'drop-shadow(0 18px 24px rgba(0,0,0,.4))'; s.style.opacity = 0;
  return s;
}
// nuvem de chuva (tinta) com gotas animadas: s.chuva(lt)
function nuvem(p, cx, cy, w) {
  const h = w * .62, s = svgAbs(p, cx - w / 2, cy - h / 2, w, h + 260);
  sv(s, 'path', { d: `M ${w * .14} ${h * .9} C ${-w * .02} ${h * .88}, ${w * .02} ${h * .52}, ${w * .2} ${h * .55} C ${w * .2} ${h * .2}, ${w * .55} ${h * .08}, ${w * .62} ${h * .38} C ${w * .78} ${h * .2}, ${w * 1.02} ${h * .4}, ${w * .9} ${h * .62} C ${w * 1.04} ${h * .7}, ${w * .98} ${h * .92}, ${w * .86} ${h * .9} Z`, fill: '#3a3a3a', stroke: PRETO, 'stroke-width': 6 });
  const gotas = [...Array(9)].map(() => sv(s, 'line', { x1: 0, y1: 0, x2: -10, y2: 40, stroke: '#555', 'stroke-width': 6, 'stroke-linecap': 'round' }));
  s.chuva = lt => gotas.forEach((g, i) => { const u = (lt * 420 + i * 61) % 240, x = w * (.18 + i * .08), y = h * .95 + u; g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); g.setAttribute('opacity', (1 - u / 240).toFixed(2)); });
  s.style.filter = 'drop-shadow(0 16px 20px rgba(0,0,0,.35))'; s.style.opacity = 0;
  return s;
}
// sol laranja com raios girando: s.gira(lt)
function sol(p, cx, cy, R) {
  const s = svgAbs(p, cx - R * 1.8, cy - R * 1.8, R * 3.6, R * 3.6), o = R * 1.8, g = sv(s, 'g', {});
  for (let i = 0; i < 12; i++) { const a = i / 12 * 2 * Math.PI; sv(g, 'line', { x1: o + R * 1.2 * Math.cos(a), y1: o + R * 1.2 * Math.sin(a), x2: o + R * 1.65 * Math.cos(a), y2: o + R * 1.65 * Math.sin(a), stroke: BRANCO, 'stroke-width': 16, 'stroke-linecap': 'round' }); }
  sv(s, 'circle', { cx: o, cy: o, r: R, fill: BRANCO, stroke: PRETO, 'stroke-width': 8 });
  s.gira = lt => g.setAttribute('transform', `rotate(${(lt * 12).toFixed(1)} ${o} ${o})`);
  s.style.filter = 'drop-shadow(0 14px 20px rgba(0,0,0,.3))'; s.style.opacity = 0;
  return s;
}
// caneta-tinteiro desenhada (corpo preto, anel laranja, pena clara)
function caneta(p, cx, cy, L, rot = -35) {
  const h = L * .16, s = svgAbs(p, cx - L / 2, cy - h / 2, L, h);
  const g = sv(s, 'g', { transform: `rotate(${rot} ${L / 2} ${h / 2})` });
  sv(g, 'rect', { x: L * .08, y: h * .22, width: L * .62, height: h * .56, rx: h * .28, fill: PRETO });
  sv(g, 'rect', { x: L * .52, y: h * .2, width: L * .06, height: h * .6, fill: VERMELHO });
  sv(g, 'path', { d: `M ${L * .7} ${h * .25} L ${L * .92} ${h * .5} L ${L * .7} ${h * .75} Z`, fill: '#d9d4c8', stroke: TINTA, 'stroke-width': 3 });
  sv(g, 'line', { x1: L * .74, y1: h * .5, x2: L * .92, y2: h * .5, stroke: TINTA, 'stroke-width': 3 });
  s.style.overflow = 'visible'; s.style.filter = 'drop-shadow(0 14px 18px rgba(0,0,0,.4))'; s.style.opacity = 0;
  return s;
}
// megafone desenhado (preto, borda vermelha) com ondas: s.ondas(lt, t)
function megafone(p, cx, cy, w) {
  const h = w * .7, s = svgAbs(p, cx - w / 2, cy - h / 2, w * 1.4, h);
  sv(s, 'path', { d: `M ${w * .1} ${h * .38} L ${w * .32} ${h * .38} L ${w * .82} ${h * .08} L ${w * .82} ${h * .92} L ${w * .32} ${h * .62} L ${w * .1} ${h * .62} Z`, fill: PRETO });
  sv(s, 'rect', { x: w * .78, y: h * .06, width: w * .07, height: h * .88, rx: 8, fill: VERMELHO });
  sv(s, 'rect', { x: w * .18, y: h * .6, width: w * .1, height: h * .28, rx: 6, fill: '#333' });
  const on = [0, 1, 2].map(i => sv(s, 'path', { d: `M ${w * (.95 + i * .13)} ${h * (.3 - i * .08)} Q ${w * (1.04 + i * .13)} ${h * .5} ${w * (.95 + i * .13)} ${h * (.7 + i * .08)}`, fill: 'none', stroke: VERMELHO, 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0 }));
  s.ondas = (lt, t) => on.forEach((o, i) => o.setAttribute('opacity', lt < t ? 0 : (.35 + .65 * Math.abs(Math.sin((lt - t) * 6 - i))).toFixed(2)));
  s.style.filter = 'drop-shadow(0 16px 20px rgba(0,0,0,.35))'; s.style.opacity = 0;
  return s;
}
// urna eletrônica simplificada (desenho): b
function urna(p, cx, cy, w) {
  const h = w * .62, b = box(p, cx, cy, w, h, `background:#e9e5dc url(${ptex('#e9e5dc', 20)});border:7px solid ${TINTA};border-radius:16px;box-sizing:border-box;box-shadow:0 18px 30px rgba(0,0,0,.38);opacity:0;`);
  el(b, 'div', 'position:absolute;left:7%;top:12%;width:50%;height:58%;background:#2b2b2b;border-radius:6px;');
  el(b, 'div', `position:absolute;left:11%;top:34%;font-family:Plex;font-weight:800;font-size:${w * .05}px;letter-spacing:.12em;color:${VERMELHO};`, 'APURAÇÃO');
  for (let i = 0; i < 12; i++) el(b, 'div', `position:absolute;left:${64 + (i % 3) * 10}%;top:${14 + Math.floor(i / 3) * 16}%;width:7%;height:11%;background:${i === 11 ? VERMELHO : '#3a3a3a'};border-radius:3px;`);
  b._rot = -3;
  return b;
}
// bloco "de construção" (papel liso colorido, com fibra): b
const tijolo = (p, cor, x, y, w, h) => { const b = pblock(p, cor, x, y, w, h); b.style.boxShadow = '0 10px 16px rgba(0,0,0,.28)'; return b; };
const FTAG = (p, txt, x, y, o = {}) => fonte(p, txt, x, y, { s: o.s ?? 21, wrap: o.wrap, ...o });

// ============================================================================
//  V4: assinaturas da marca (brand book 2026; regras em brand_v4.md)
// ============================================================================
// fundo de virada em degradê da marca (o brand book pede degradês vermelhos como fundo de peça)
//   'vinho' = #560303 -> #8B1205 -> #C41E08 (160°); 'fogo' = #7A0A02 -> #C41E08 -> #E50914 -> #FB2E0A com luz quente no canto;
//   'tunel' = #FF481F -> #F0141E -> #280000 (vertical); 'noite' = #3D0202 -> #560303
const GRAD_V4 = {
  vinho: 'linear-gradient(160deg,#560303 0%,#8B1205 50%,#C41E08 100%)',
  fogo: 'radial-gradient(at 95% 5%,rgba(255,200,170,.55) 0%,rgba(255,140,80,.25) 22%,rgba(255,140,80,0) 50%),linear-gradient(135deg,#7A0A02 0%,#C41E08 35%,#E50914 65%,#FB2E0A 100%)',
  tunel: 'linear-gradient(180deg,#FF481F 0%,#F0141E 50%,#280000 100%)',
  noite: 'linear-gradient(180deg,#3D0202 0%,#560303 100%)',
};
function gradV4(r, tipo = 'vinho') {
  const b = el(r, 'div', `position:absolute;left:-30px;top:-30px;width:1140px;height:1980px;background:${GRAD_V4[tipo] ?? tipo};`);
  el(b, 'div', `position:absolute;inset:0;background:url(${ptex('#808080', 30)});mix-blend-mode:soft-light;opacity:.5;`);   // fibra leve, como a mesa
  return b;
}
// título de impacto em Morganite (caixa alta, condensada): use pontualmente, no máximo um por cena. o.c = cor (branco na mesa;
// amarelo só em palavra grande), o.s = corpo, o.lh = entrelinha. Pode ter <br>.
function titulo(p, txt, cx, cy, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;white-space:nowrap;text-align:${o.align ?? 'center'};font-family:${MORG};font-weight:${o.wt ?? 700};` +
    `font-size:${o.s ?? 220}px;line-height:${o.lh ?? .86};letter-spacing:.01em;text-transform:uppercase;color:${o.c ?? BRANCO};` +
    `text-shadow:-3px 5px 0 rgba(40,0,0,${o.sombra ?? .2});opacity:0;`, txt);
  e._base = 'translate(-50%,-50%)'; e._rot = 0; e.style.transform = e._base;
  return e;
}
// rótulo V4: caixa alta Plex em tarja vinho (padrão) ou branca/amarela com texto vinho
const rotV4 = (p, txt, x, y, o = {}) => rotulo(p, txt, x, y, { bg: o.bg ?? VINHO, c: o.c ?? ([BRANCO, CINZA_C, AMARELO].includes(o.bg) ? VINHO : BRANCO), ...o });

// REVERBERAÇÃO: o contorno do símbolo (retângulo de cantos arredondados, raio ≈12,5% do lado) repetido em camadas concêntricas,
// cada uma com sombra leve (regra do brand book). tipo: 'normal' (camadas translúcidas claras), 'linhas' (contornos brancos finos,
// alternando cheio e tracejado), 'grad' (camadas para dentro escurecendo até o vinho, efeito túnel). n camadas, passo em px.
//   const rv = reverb(p, 540, 960, 520, 520, {tipo: 'linhas', n: 5, passo: 70}); no update: rv.at(lt, t0, {out, vivo: true})
//   o.persp = graus de inclinação (perspectiva: piso/túnel), o.cor = cor das linhas/camadas
function reverb(p, cx, cy, w, h, o = {}) {
  const tipo = o.tipo ?? 'normal', n = o.n ?? 5, passo = o.passo ?? 64, rr = o.raio ?? Math.min(w, h) * .125;
  const g = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;width:0;height:0;${o.persp ? 'perspective:1400px;' : ''}`);
  const pl = el(g, 'div', `position:absolute;left:0;top:0;transform-style:preserve-3d;${o.persp ? `transform:rotateX(${o.persp}deg);` : ''}`);
  const cor = o.cor ?? BRANCO;
  const L = [...Array(n)].map((_, i) => {
    const k = tipo === 'grad' ? -i : i, ww = w + 2 * passo * k, hh = h + 2 * passo * k, r0 = Math.max(8, rr + passo * k * .9);
    let css;
    if (tipo === 'linhas') css = `border:${o.esp ?? 3}px ${i % 2 ? 'dashed' : 'solid'} ${cor};filter:drop-shadow(0 4px 6px rgba(40,0,0,.35));`;
    else if (tipo === 'grad') css = `background:${mixHex(o.cor ?? V4, VINHO, i / Math.max(1, n - 1) * .92)};box-shadow:0 10px 28px rgba(20,0,0,.45);`;
    else css = `background:rgba(255,255,255,${o.alfa ?? .1});border:2px solid rgba(255,255,255,.34);box-shadow:0 10px 24px rgba(60,0,0,.28), inset 0 0 40px rgba(255,255,255,.12);`;
    return { e: el(pl, 'div', `position:absolute;left:${-ww / 2}px;top:${-hh / 2}px;width:${ww}px;height:${hh}px;border-radius:${r0}px;box-sizing:border-box;opacity:0;${css}`), i };
  });
  if (tipo !== 'grad') [...L].reverse().forEach(x => pl.appendChild(x.e));   // a camada de dentro fica por cima
  g.L = L.map(x => x.e);
  // entrada camada a camada a partir do centro; vivo = as camadas "respiram" devagar (o eco); out = saída
  g.at = (lt, t, q = {}) => {
    const out = q.out !== undefined && lt > q.out ? E.in(clamp((lt - q.out) / .3)) : 0;
    g.L.forEach((e, i) => {
      const a = E.out5(clamp((lt - t - i * (q.gap ?? .07)) / (q.d ?? .45)));
      const vivo = q.vivo ? .012 * Math.sin(lt * 1.6 - i * .7) : 0;
      e.style.opacity = (a * (1 - out) * (tipo === 'linhas' ? (q.alfa ?? .8) : 1)).toFixed(3);
      e.style.transform = `scale(${(lerp(.9, 1, a) * (1 + vivo) * lerp(1, 1.08, out)).toFixed(4)})`;
    });
  };
  return g;
}
function mixHex(a, b, q) {
  const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)), A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], q)).toString(16).padStart(2, '0')).join('');
}

// LOGO OFICIAL da V4: o SVG do brand book (v4-logos.zip: LogoV4Branca/LogoV4Vermelha), inserido sem alteração pelo preparar_v4.py
// (LOGO_V4_SVG, no fim deste arquivo). Regras: versão única; branca sobre vermelho/vinho, vermelha sobre branco; nunca distorcer, mudar a
// cor, usar transparência ou girar; área de proteção = espessura do "4" (~14% da largura); mínimo 50 px. Anime só com entra() (sem
// rotação) ou corte seco; nada de pousa() (gira) nem de animar partes do símbolo.
function logoV4(p, cx, cy, w, o = {}) {
  w = Math.max(50, w);
  const h = w * 203 / 200, pad = o.area === false ? 0 : w * .14;
  const b = box(p, cx, cy, w + 2 * pad, h + 2 * pad, 'opacity:0;');
  const sv0 = (typeof LOGO_V4_SVG !== 'undefined' && LOGO_V4_SVG[o.cor ?? 'branca']) || '';
  const im = el(b, 'div', `position:absolute;left:${pad}px;top:${pad}px;width:${w}px;height:${h}px;`, sv0);
  const s = im.querySelector('svg'); if (s) { s.setAttribute('width', w); s.setAttribute('height', h); s.style.display = 'block'; }
  b._rot = 0;
  return b;
}
// cartão de vidro (liquid glass) DISCRETO: vermelho translúcido fosco com luz no canto, sem brilho neon. Só sobre fundo com textura
// (mesa ou degradê), porque o vidro precisa de algo atrás. Conteúdo: el(cartao, ...).
function vidro(p, cx, cy, w, h, o = {}) {
  return box(p, cx, cy, w, h, `border-radius:${o.raio ?? Math.min(w, h) * .14}px;overflow:hidden;opacity:0;` +
    `background:linear-gradient(135deg,rgba(255,255,255,.22) 0%,rgba(255,255,255,.06) 45%,rgba(255,72,31,.10) 100%),${o.fundo ?? 'rgba(229,9,20,.35)'};` +
    'backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);' +
    'box-shadow:inset 0 0 60px rgba(255,255,255,.18), inset 0 2px 0 rgba(255,255,255,.45), inset 0 -2px 6px rgba(80,0,0,.25), -5px 5px 20px rgba(0,0,0,.10), 0 18px 40px rgba(40,0,0,.30);');
}
// apresentador num QUADRO de cantos arredondados (o contorno do símbolo), com aro branco: mesma janela e argumentos do presBola
function presQuad(r, S, cx, cy, d = 380, z = 2.0, fy = .60, fx = .555) {
  const ph = presBola(r, S, cx, cy, d, z, fy, fx);
  ph.fr.style.borderRadius = `${(d * .14).toFixed(0)}px`;
  ph.fr.style.boxShadow = `0 0 0 8px ${BRANCO}, 0 18px 32px rgba(40,0,0,.45)`;
  return ph;
}
// foto em cor com luz "sutilmente avermelhada" (brand book): grade leve; para foto P&B de arquivo use duo(b, VINHO, '#FFEBC8')
const gradeV4 = b => { const im = b.im || b.img || b; im.style.filter = 'saturate(.92) contrast(1.04) sepia(.12) hue-rotate(-12deg)'; return b; };
