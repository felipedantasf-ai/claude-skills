// ===== edit-parallax3d: palco 3D (fotos em camadas + câmera de perspectiva), fumaça, tela dentro de tela, tipografia =====
// Mesma ideia da câmera 3D do After Effects que o MagnatesMedia usa: cada camada da foto é um plano em Z; a câmera anda
// em X/Y/Z e os planos de perto andam mais que os de longe. As fotos vão em WebGL com relevo na placa (palcoGL, no fim
// do arquivo); sem placa ou sem three.min.js, o mesmo palco sai em CSS 3D (camadas planas).

// gl: fotos com RELEVO em WebGL (palcoGL); relevo = px de Z por unidade de profundidade (0..1) dentro da camada (0 = plano)
const P3 = { persp: 1600, gl: true, relevo: 450 };
const camFixa = () => ({ s: 1, x: 0, y: 0, r: 0 });            // desliga a câmera 2D do motor (o palco tem a sua)
const AS3 = n => { const a = ASSETS[n]; if (!a) throw new Error('asset faltando: ' + n); return a; };
const lerp3 = (a, b, u) => a + (b - a) * u;
// trajetória por chaves: kf3(lt, [[t, {x, y, z, zoom, rz}], ...], E.inOut) -> objeto interpolado (cada trecho com a sua curva)
function kf3(lt, ks, ease = E.inOut) {
  if (lt <= ks[0][0]) return { ...ks[0][1] };
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1, e1] = ks[i], [t0, v0] = ks[i - 1];
    if (lt <= t1) {
      const u = (e1 || ease)(clamp((lt - t0) / (t1 - t0)));
      const o = {};
      for (const k of new Set([...Object.keys(v0), ...Object.keys(v1)])) o[k] = lerp3(v0[k] ?? v1[k], v1[k] ?? v0[k], u);
      return o;
    }
  }
  return { ...ks[ks.length - 1][1] };
}

// palco3d(pai, {nome: 'opala', zs: [-900, -300, 0], ov: 1.2, fx, fy, w, h, x, y, persp, cor, fundo, blur: [..]})
//   nome -> assets p3_<nome>_0 (fundo, jpg) ... p3_<nome>_N (frente), feitos pelo camadas3d.py
//   zs   -> profundidade de cada camada (negativo = longe). Padrão: espalha de -900 a 0.
//   ov   -> sobra da foto além da tela (altura), para a câmera andar sem mostrar borda
//   fx/fy-> ponto da foto (0..1) que fica no centro da tela com a câmera em 0
// g.cam({x, y, z, zoom, rz, dof, foco})   g.tela(i, [x0, y0, x1, y1]) -> div no plano i (px da foto)
// g.mira(i, [x0, y0, x1, y1], {alt}) -> câmera {x, y, z} que faz o retângulo ocupar a altura da tela (dolly)
// g.plano(z) -> plano vazio na profundidade z (para elementos próprios: placas, fumaça em 3D, texto no espaço)
function palco3d(pai, o = {}) {
  if (o.nome && (o.gl ?? P3.gl) && p3gl()) return palcoGL(pai, o);
  const w = o.w ?? W, h = o.h ?? H, P = o.persp ?? P3.persp;
  const g = el(pai, 'div', `position:absolute;left:${o.x ?? 0}px;top:${o.y ?? 0}px;width:${w}px;height:${h}px;overflow:hidden;` +
    `background:${o.fundo ?? '#000'};perspective:${P}px;perspective-origin:50% 50%;${o.cor ? `filter:${o.cor};` : ''}`);
  const mundo = el(g, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-style:preserve-3d;transform-origin:50% 50%;`);
  const n = o.nome ? (AS3('p3_' + o.nome).camadas || 2) : 0;
  const zs = o.zs ?? Array.from({ length: n }, (_, i) => n === 1 ? 0 : -900 + 900 * i / (n - 1));
  g.P = P; g.w = w; g.h = h; g.mundo = mundo; g.planos = []; g.zs = [];
  let ref = null;
  if (o.nome) {
    ref = AS3('p3_' + o.nome + '_0');
    const ov = o.ov ?? 1.2;
    let ih = h * ov, iw = ih * ref.w / ref.h;
    if (!o.porAltura && iw < w * ov) { iw = w * ov; ih = iw * ref.h / ref.w; }   // porAltura: mesma escala em qualquer largura (tela dentro de tela)
    g.img = { iw, ih, left: w / 2 - (o.fx ?? .5) * iw, top: h / 2 - (o.fy ?? .5) * ih, k: iw / ref.w };
  }
  g.plano = (z, i) => {
    const c = (P - z) / P;
    const pl = el(mundo, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 50%;` +
      `transform:translateZ(${z.toFixed(1)}px) scale(${c.toFixed(5)});`);
    pl.z = z; pl.c = c; g.planos.push(pl); g.zs.push(z);
    return pl;
  };
  for (let i = 0; i < n; i++) {
    const pl = g.plano(zs[i]);
    const a = AS3(`p3_${o.nome}_${i}`);
    const im = el(pl, 'img', `position:absolute;left:${g.img.left.toFixed(1)}px;top:${g.img.top.toFixed(1)}px;` +
      `width:${g.img.iw.toFixed(1)}px;height:${g.img.ih.toFixed(1)}px;${o.blur && o.blur[i] ? `filter:blur(${o.blur[i]}px);` : ''}`);
    im.decoding = 'sync'; im.src = a.src; pl.im = im;
  }
  // px da foto -> coordenadas do plano (relativas ao centro do palco)
  g.pt = (ix, iy) => ({ u: g.img.left + ix * g.img.k - w / 2, v: g.img.top + iy * g.img.k - h / 2 });
  g.tela = (i, r, css = '') => {
    const a = g.pt(r[0], r[1]), b = g.pt(r[2], r[3]);
    const d = el(g.planos[i], 'div', `position:absolute;left:${(a.u + w / 2).toFixed(1)}px;top:${(a.v + h / 2).toFixed(1)}px;` +
      `width:${(b.u - a.u).toFixed(1)}px;height:${(b.v - a.v).toFixed(1)}px;overflow:hidden;${css}`);
    d.tw = b.u - a.u; d.th = b.v - a.v;
    return d;
  };
  g.mira = (i, r, q = {}) => {                                  // dolly até o retângulo encher a altura (ou a largura) da tela
    const z = g.zs[i], c = (P - z) / P, a = g.pt(r[0], r[1]), b = g.pt(r[2], r[3]);
    const f = q.porLargura ? (b.u - a.u) / w : (b.v - a.v) / h;
    return { x: c * (a.u + b.u) / 2, y: c * (a.v + b.v) / 2, z: (P - z) * (1 - f), zoom: 1 };
  };
  g.cam = (q = {}) => {
    const x = q.x ?? 0, y = q.y ?? 0, z = q.z ?? 0, Z = q.zoom ?? 1;
    mundo.style.transform = `scale3d(${Z.toFixed(5)},${Z.toFixed(5)},1) translate3d(${(-x).toFixed(2)}px,${(-y).toFixed(2)}px,${z.toFixed(2)}px)` +
      (q.rz ? ` rotateZ(${q.rz.toFixed(3)}deg)` : '');
    g.planos.forEach((pl, i) => {
      const dist = P - pl.z - z;                                 // distância do plano à câmera
      const op = i === 0 ? 1 : clamp((dist - 60) / 260);           // plano que passa pela câmera some antes (sem "estourar")
      pl.style.opacity = op.toFixed(3);
      pl.style.visibility = op <= 0 ? 'hidden' : 'visible';
      if (q.dof !== undefined && pl.im) {
        const bl = Math.min(q.dofMax ?? 14, Math.abs(pl.z - (q.foco ?? 0)) * q.dof / 100);
        pl.im.style.filter = bl > .3 ? `blur(${bl.toFixed(1)}px)` : '';
      }
    });
    g.q = { x, y, z, zoom: Z };
  };
  g.cam({});
  return g;
}

// respiração de câmera de mão (bem leve), para nunca ficar parado
const mao3 = (lt, a = 1, s = 1) => ({ x: a * 6 * Math.sin(lt * .9 + s) + a * 2.5 * Math.sin(lt * 2.3 + s * 3), y: a * 4 * Math.sin(lt * .7 + s * 2) });

// ---------- fumaça / nuvem que cobre a tela (transição por oclusão) ----------
// fumaca(pai, {ox, oy, t0, tc, modo: 'cobre'|'revela', n, tom, esc, sobe, semente, dur})
//  'cobre' : tufos nascem em (ox, oy) a partir de t0 e às tc já tampam a tela inteira
//  'revela': começa tampado e os tufos se abrem para fora até t0 + dur, mostrando a cena (use no início da cena seguinte)
// tom = filtro CSS que dá a cor (as texturas são cinza): quente 'sepia(.5) saturate(1.6) brightness(.95)', fria 'brightness(.8)'
const FUM_CINZA = 'grayscale(.5) sepia(.2) brightness(.62) contrast(1.6)';           // fumaça de motor/pneu
const FUM_QUENTE = 'sepia(.7) saturate(2) brightness(.72) contrast(1.5)';           // fumaça com fogo/pôr do sol
function fumaca(pai, o = {}) {
  const N = o.n ?? 26, seed = o.semente ?? 7, modo = o.modo ?? 'cobre';
  const tex = Object.keys(ASSETS).filter(k => /^fum_\d+$/.test(k));
  const box = el(pai, 'div', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;overflow:hidden;` +
    `filter:${o.tom ?? FUM_CINZA};`);
  const fill = el(box, 'div', `position:absolute;inset:-40px;background:${o.fundo ?? 'radial-gradient(ellipse at 50% 38%, #f0ece6, #d2ccc4 55%, #aaa49c)'};opacity:0;z-index:2;`);   // por cima dos tufos: no corte a tela é só este tom, igual dos dois lados
  const P = [];
  for (let i = 0; i < N; i++) {
    const r = k => hrand(seed * 31 + i * 7.13 + k);
    const a = AS3(tex[i % tex.length]);
    const im = el(box, 'img', `position:absolute;left:0;top:0;width:${a.w}px;height:${a.h}px;transform-origin:50% 50%;opacity:0;`);
    im.decoding = 'sync'; im.src = a.src;
    const ang = (r(1) - .5) * Math.PI * 1.6 - Math.PI / 2;              // espalha mais para cima e para os lados
    P.push({ im, w: a.w, h: a.h, ang, vel: .6 + r(2) * .8, nasce: r(3), esc: (o.esc ?? 1) * (.9 + r(4) * 1.4), rot: (r(5) - .5) * 40, vr: (r(6) - .5) * 14, flip: r(7) > .5 ? -1 : 1 });
  }
  box.upd = lt => {
    const ox = o.ox ?? 540, oy = o.oy ?? 1100;
    if (modo === 'cobre') {
      const t0 = o.t0 ?? 0, tc = o.tc ?? t0 + 1;
      const u = clamp((lt - t0) / (tc - t0));
      P.forEach(p => {
        const v = clamp((u - p.nasce * .6) / .75);                   // cada tufo nasce numa hora
        const d = E.out(v) * 640 * p.vel;
        const s = (.05 + 1.55 * Math.pow(v, 1.5)) * p.esc;              // nasce pequeno no ponto e incha
        const x = ox + Math.cos(p.ang) * d - p.w / 2, y = oy + Math.sin(p.ang) * d * .8 - (o.sobe ?? 260) * E.out(v) - p.h / 2;
        p.im.style.opacity = clamp(v * 3).toFixed(3);
        p.im.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(p.rot + p.vr * lt).toFixed(2)}deg) scale(${(s * p.flip).toFixed(4)},${s.toFixed(4)})`;
      });
      fill.style.opacity = E.in(clamp((u - .62) / .33)).toFixed(3);
      box.style.visibility = lt < t0 - .01 ? 'hidden' : 'visible';
    } else {
      const t0 = o.t0 ?? 0, dur = o.dur ?? 1.1;
      const u = clamp((lt - t0) / dur), e = E.inOut(u);
      P.forEach(p => {
        const d = 200 + e * 1300 * p.vel;
        const s = (1.9 + 1.2 * e) * p.esc;
        const x = 540 + Math.cos(p.ang) * d - p.w / 2, y = 960 + Math.sin(p.ang) * d * .9 - 300 * e - p.h / 2;
        p.im.style.opacity = (1 - clamp((u - .35 - p.nasce * .3) / .4)).toFixed(3);
        p.im.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(p.rot + p.vr * lt).toFixed(2)}deg) scale(${(s * p.flip).toFixed(4)},${s.toFixed(4)})`;
      });
      fill.style.opacity = (1 - E.out(clamp((u - .04) / .4))).toFixed(3);
      box.style.visibility = u >= 1 ? 'hidden' : 'visible';
    }
  };
  box.upd(0);
  return box;
}

// véu escuro atrás do texto (a serifa fina some em foto clara): veu3(r, 'baixo'|'cima', força 0..1)
function veu3(p, onde = 'baixo', f = .75) {
  const g = onde === 'cima' ? `linear-gradient(180deg, rgba(0,0,0,${f}) 0%, rgba(0,0,0,${f * .55}) 22%, rgba(0,0,0,0) 42%)`
    : `linear-gradient(0deg, rgba(0,0,0,${f}) 0%, rgba(0,0,0,${f * .6}) 28%, rgba(0,0,0,0) 50%)`;
  const v = el(p, 'div', `position:absolute;inset:0;pointer-events:none;background:${g};`);
  v.set = a => { v.style.opacity = clamp(a).toFixed(3); };
  return v;
}
// ---------- tipografia (espaço da tela, como na referência) ----------
const F3 = { sans: 'Inter', serif: 'Sitka', mono: 'P3Mono', branco: '#f3efe8', verm: '#e8473b' };
// título grande em sans pesado + linha de baixo digitada (data, lugar). titulo3(p, 'OPALA SS', 'Chevrolet, 1974', {x, y, s, t0, tSub, sai})
function titulo3(p, txt, sub, o = {}) {
  const g = el(p, 'div', `position:absolute;left:${o.x ?? 80}px;top:${o.y ?? 300}px;white-space:nowrap;`);
  const t = el(g, 'div', `font-family:${F3.sans};font-weight:800;font-size:${o.s ?? 150}px;letter-spacing:-.02em;line-height:.95;color:${F3.branco};` +
    `text-shadow:0 6px 30px rgba(0,0,0,.55), 0 2px 4px rgba(0,0,0,.4);`);
  const L = [...txt].map(ch => el(t, 'span', 'display:inline-block;white-space:pre;', esc(ch)));
  const s = el(g, 'div', `font-family:${F3.sans};font-weight:500;font-size:${o.ss ?? 46}px;color:${F3.branco};margin-top:14px;letter-spacing:.01em;` +
    `text-shadow:0 2px 14px rgba(0,0,0,.6);`);
  g.upd = lt => {
    const t0 = o.t0 ?? 0;
    L.forEach((sp, i) => {
      const u = clamp((lt - t0 - i * .035) / .45), e = E.out5(u);
      sp.style.opacity = u.toFixed(3);
      sp.style.filter = u < 1 ? `blur(${((1 - e) * 14).toFixed(1)}px)` : '';
      sp.style.transform = `translateY(${((1 - e) * 24).toFixed(1)}px)`;
    });
    const ts = o.tSub ?? t0 + .5, nch = Math.floor(clamp((lt - ts) / ((o.dSub ?? .05) * sub.length)) * sub.length);
    s.textContent = sub.slice(0, nch);
    const sa = o.sai !== undefined ? 1 - clamp((lt - o.sai) / .35) : 1;
    g.style.opacity = sa.toFixed(3);
    g.style.filter = sa < 1 ? `blur(${((1 - sa) * 10).toFixed(1)}px)` : '';
  };
  return g;
}
// etiqueta mono em pílula: pilula3(p, 'MOTOR 250 · 6 CILINDROS', x, y, {t0, sai})
function pilula3(p, txt, x, y, o = {}) {
  const e = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;font-family:${F3.mono};font-size:${o.s ?? 30}px;` +
    `letter-spacing:.14em;color:#ece8e1;padding:.42em .9em .38em;border-radius:999px;background:rgba(12,12,12,.62);` +
    `border:1.5px solid rgba(255,255,255,.22);box-shadow:0 8px 24px rgba(0,0,0,.35);`);
  e.upd = lt => {
    const t0 = o.t0 ?? 0, u = clamp((lt - t0) / .25);
    e.textContent = txt.slice(0, Math.floor(clamp((lt - t0) / (txt.length * .028)) * txt.length)) || ' ';
    const sa = o.sai !== undefined ? 1 - clamp((lt - o.sai) / .3) : 1;
    e.style.opacity = (u * sa).toFixed(3);
    e.style.transform = `translateY(${((1 - E.out(u)) * 10).toFixed(1)}px)`;
  };
  return e;
}
// frase em serifa, palavra por palavra no tempo da fala, com palavra-destaque em itálico vermelho com brilho.
// frase3(p, c, ['B01', 'B02'], {x, y, s, larg, destaque: ['financeiro'], linhas: [['Tem', 'carro'], ...] (opcional), sai, alinha})
function frase3(p, c, beats, o = {}) {
  const ws = beats.flatMap(id => BYID[id].words.map(w => ({ w: w.w, t: w.s - c.t0 })));
  const g = el(p, 'div', `position:absolute;left:${o.x ?? 80}px;top:${o.y ?? 1180}px;width:${o.larg ?? 760}px;text-align:${o.alinha ?? 'left'};` +
    `font-family:${F3.serif};font-size:${o.s ?? 84}px;line-height:1.12;color:${F3.branco};`);
  const dest = new Set((o.destaque || []).map(norm));
  const S = ws.map((w, i) => {
    const d = dest.has(norm(w.w));
    const sp = el(g, 'span', `display:inline-block;margin-right:.24em;white-space:nowrap;` + (d
      ? `font-style:italic;color:${F3.verm};text-shadow:0 0 18px rgba(232,71,59,.55), 0 0 2px rgba(0,0,0,.6);`
      : `text-shadow:0 3px 18px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.5);`), esc(w.w.replace(/[,;:]$/, (o.virgula ?? true) ? '$&' : '')));
    if ((o.quebras || []).includes(i)) el(g, 'br', '');
    return { sp, t: w.t };
  });
  g.upd = lt => {
    S.forEach(({ sp, t }) => {
      const u = clamp((lt - t + .04) / .32), e = E.out5(u);
      sp.style.opacity = u.toFixed(3);
      sp.style.filter = u < 1 ? `blur(${((1 - e) * 10).toFixed(1)}px)` : '';
      sp.style.transform = `translateY(${((1 - e) * 18).toFixed(1)}px)`;
    });
    const sa = o.sai !== undefined ? 1 - clamp((lt - o.sai) / .24) : 1;
    g.style.opacity = sa.toFixed(3);
  };
  return g;
}
// rótulo mono pequeno + número grande contando: numero3(p, 'ALTURA · SATURN V', x, y, {de, ate, t0, t1, fmt, suf, t0r})
function numero3(p, rot, x, y, o = {}) {
  const g = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;text-align:${o.alinha ?? 'left'};`);
  const r = el(g, 'div', `font-family:${F3.mono};font-size:${o.rs ?? 24}px;letter-spacing:.2em;color:#ddd6cc;padding-bottom:8px;` +
    `border-bottom:2px solid ${F3.verm};display:inline-block;`, esc(rot));
  const nn = el(g, 'div', `font-family:${F3.sans};font-weight:800;font-size:${o.s ?? 118}px;letter-spacing:-.02em;color:${F3.branco};` +
    `text-shadow:0 6px 26px rgba(0,0,0,.55);margin-top:6px;`);
  const fmt = o.fmt ?? (v => Math.round(v).toLocaleString('pt-BR'));
  g.upd = lt => {
    const t0 = o.t0 ?? 0, u = E.out(clamp((lt - t0) / ((o.t1 ?? t0 + 1) - t0)));
    nn.textContent = fmt(lerp3(o.de ?? 0, o.ate ?? 100, u)) + (o.suf ?? '');
    const a = clamp((lt - t0 + .15) / .3), sa = o.sai !== undefined ? 1 - clamp((lt - o.sai) / .3) : 1;
    g.style.opacity = (a * sa).toFixed(3);
  };
  return g;
}
// régua vertical com marcas e números passando (altitude, anos): regua3(p, x, {de, ate, passo, px}).set(valorNoCentro)
function regua3(p, x, o = {}) {
  const g = el(p, 'div', `position:absolute;left:${x}px;top:0;width:120px;height:${H}px;overflow:hidden;` +
    `-webkit-mask-image:linear-gradient(180deg,transparent,#000 22%,#000 78%,transparent);`);
  const tira = el(g, 'div', 'position:absolute;left:0;top:0;width:120px;');
  const de = o.de ?? 0, ate = o.ate ?? 300, passo = o.passo ?? 10, px = o.px ?? 26;
  el(tira, 'div', `position:absolute;left:0;top:0;width:2px;height:${((ate - de) / passo) * px}px;background:rgba(255,255,255,.55);`);
  for (let v = de, i = 0; v <= ate; v += passo, i++) {
    const y = ((ate - v) / passo) * px, big = i % 5 === 0;
    el(tira, 'div', `position:absolute;left:0;top:${y}px;width:${big ? 26 : 12}px;height:2px;background:rgba(255,255,255,${big ? .85 : .5});`);
    if (big) el(tira, 'div', `position:absolute;left:34px;top:${y - 14}px;font-family:${F3.mono};font-size:22px;color:rgba(255,255,255,.8);`, String(v));
  }
  g.set = v => { tira.style.transform = `translateY(${(960 - ((ate - v) / passo) * px).toFixed(1)}px)`; };
  g.set(de);
  return g;
}
// sem legenda corrida (a frase em serifa é o texto do formato); grão e vinheta por cena: S.grao (padrão .2), S.vig (padrão .7)
let _p3Grao = null;
function p3GraoTex() {
  if (_p3Grao) return _p3Grao;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const x = cv.getContext('2d'), im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 80; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  return (_p3Grao = cv.toDataURL());
}
renderCaptions = function () {
  const S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  $('cap').style.opacity = 0;
  const gr = $('grain'), vg = $('vig');
  if (gr) { if (!gr._ok) { gr.style.backgroundImage = `url(${p3GraoTex()})`; gr._ok = 1; } gr.style.opacity = (S.grao ?? .2).toFixed(3); }
  if (vg) vg.style.opacity = (S.vig ?? .7).toFixed(3);
};

// ---------- gráfico de linha vetorial (fica nítido em qualquer zoom: use dentro de uma tela do palco e depois em tela cheia) ----------
// grafico3(pai, w, h, {pts: [[0..1, 0..1(0 = topo)], ...], fundo, grade, cor, corSobe, rot}) -> g.set(u) desenha até a fração u;
// g.cab(u) -> {x, y} da ponta (px do gráfico), para a câmera seguir; g.marca(u, t, lt) acende um ponto na curva
function grafico3(pai, w, h, o = {}) {
  const g = el(pai, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;overflow:hidden;background:${o.fundo ?? 'radial-gradient(ellipse at 50% 40%, #102030, #060b12 75%)'};`);
  const s = sv(g, 'svg', { width: w, height: h, viewBox: `0 0 ${w} ${h}` });
  s.style.cssText = 'position:absolute;left:0;top:0;overflow:visible;';
  const nl = o.grade ?? 8;
  for (let i = 1; i < nl; i++) {
    sv(s, 'line', { x1: 0, x2: w, y1: h * i / nl, y2: h * i / nl, stroke: 'rgba(160,200,255,.10)', 'stroke-width': Math.max(1, h / 700) });
    sv(s, 'line', { y1: 0, y2: h, x1: w * i / nl, x2: w * i / nl, stroke: 'rgba(160,200,255,.07)', 'stroke-width': Math.max(1, h / 700) });
  }
  const pts = (o.pts ?? [[0, .2], [1, .8]]).map(([x, y]) => [x * w, y * h]);
  // curva suave (Catmull-Rom) amostrada: guarda os pontos para achar a ponta
  const am = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 24; k++) {
      const t = k / 24, t2 = t * t, t3 = t2 * t;
      am.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  am.push(pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < am.length; i++) len.push(len[i - 1] + Math.hypot(am[i][0] - am[i - 1][0], am[i][1] - am[i - 1][1]));
  const L = len[len.length - 1];
  const d = 'M' + am.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
  const sw = o.esp ?? h / 110;
  const brilho = sv(s, 'path', { d, fill: 'none', stroke: o.cor ?? '#ff5a4a', 'stroke-width': sw * 3.2, 'stroke-linecap': 'round', opacity: .28 });
  brilho.style.filter = `blur(${(sw * 1.4).toFixed(1)}px)`;
  const linha = sv(s, 'path', { d, fill: 'none', stroke: o.cor ?? '#ff5a4a', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const cab = sv(s, 'circle', { r: sw * 1.6, fill: '#fff' });
  cab.style.filter = `drop-shadow(0 0 ${sw * 2}px ${o.cor ?? '#ff5a4a'})`;
  const ponta = u => { const tl = u * L; let i = 1; while (i < len.length - 1 && len[i] < tl) i++; const f = (tl - len[i - 1]) / Math.max(1e-6, len[i] - len[i - 1]); return { x: lerp3(am[i - 1][0], am[i][0], f), y: lerp3(am[i - 1][1], am[i][1], f) }; };
  g.cab = ponta;
  g.uX = fx => { let a = 0, b = 1; for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (ponta(m).x < fx * w) a = m; else b = m; } return a; };   // fração da linha cuja ponta está em x = fx
  g.set = (u, cor) => {
    u = clamp(u);
    for (const p of [linha, brilho]) { p.setAttribute('stroke-dasharray', `${(u * L).toFixed(1)} ${L.toFixed(1)}`); if (cor) p.setAttribute('stroke', cor); }
    const q = ponta(u); cab.setAttribute('cx', q.x.toFixed(1)); cab.setAttribute('cy', q.y.toFixed(1));
    if (cor) cab.style.filter = `drop-shadow(0 0 ${sw * 2}px ${cor})`;
  };
  const marcas = [];
  g.marca = (u, cor = '#fff') => {
    const q = ponta(u);
    const c1 = sv(s, 'circle', { cx: q.x, cy: q.y, r: sw * 2.4, fill: 'none', stroke: cor, 'stroke-width': sw * .5, opacity: 0 });
    const m = { c1, upd: a => { c1.setAttribute('opacity', clamp(a).toFixed(3)); c1.setAttribute('r', (sw * (2.4 + 1.6 * (1 - clamp(a)))).toFixed(1)); } };
    marcas.push(m); return m;
  };
  if (o.rot) el(g, 'div', `position:absolute;left:${w * .04}px;top:${h * .05}px;font-family:${F3.mono};font-size:${(h / 28).toFixed(0)}px;letter-spacing:.2em;color:rgba(220,235,255,.75);`, esc(o.rot));
  g.set(0);
  return g;
}

// ---------- tela dentro de tela ----------
// telaConteudo(tela) -> caixa VIRTUAL com a altura da tela do vídeo (1920) e a proporção da tela da foto, já encolhida para
// caber nela. Monte ali dentro o mesmo palco/gráfico da cena vizinha (mesmas opções e mesma câmera): com g.mira() a câmera
// enche a tela com essa caixa, e o quadro fica idêntico ao da cena vizinha (é o que faz o corte sumir).
function telaConteudo(tela, alt = H) {
  const wv = alt * tela.tw / tela.th;
  const v = el(tela, 'div', `position:absolute;left:0;top:0;width:${wv.toFixed(1)}px;height:${alt}px;transform-origin:0 0;transform:scale(${(tela.th / alt).toFixed(5)});`);
  v.w = wv; v.h = alt;
  return v;
}
// vidro do monitor por cima do conteúdo (linhas, reflexo, tom): vidro3(tela).set(a) — a = 0 no quadro em que a tela enche o vídeo
function vidro3(tela, o = {}) {
  const v = el(tela, 'div', `position:absolute;inset:0;pointer-events:none;opacity:0;` +
    `background:repeating-linear-gradient(180deg, rgba(0,0,0,.22) 0 1px, rgba(0,0,0,0) 1px 3px),` +
    `linear-gradient(125deg, rgba(255,255,255,.16), rgba(255,255,255,0) 38%), ${o.tom ?? 'rgba(80,140,255,.10)'};`);
  v.set = a => { v.style.opacity = clamp(a).toFixed(3); };
  return v;
}

// ======================= cenas prontas (vídeo inteiro) =======================
const COR_P3 = 'sepia(.18) saturate(1.2) contrast(1.08) brightness(.94)';
const COR_PB = 'grayscale(1) sepia(.25) contrast(1.15) brightness(.95)';     // foto de arquivo
// grupos de fala: junta beats até fechar frase (. ? !) ou passar de ~9 palavras; cada grupo some quando o próximo começa
function gruposFala(beats, max = 9) {
  const G = []; let cur = [], n = 0;
  beats.forEach(id => {
    const b = BYID[id]; cur.push(id); n += b.words.length;
    if (/[.?!]$/.test(b.text.trim()) || n >= max) { G.push(cur); cur = []; n = 0; }
  });
  if (cur.length) G.push(cur);
  return G;
}
// falas3(r, c, beats, {y, s, destaque, larg, x, grupos}) -> uma frase3 por grupo, em sequência; .upd(lt)
function falas3(r, c, beats, o = {}) {
  const G = o.grupos ?? gruposFala(beats, o.max ?? 9);
  const F = G.map((g, i) => {
    const prox = G[i + 1] ? c.b(G[i + 1][0]) - .3 : o.sai;            // some antes da próxima frase entrar (sem sobrepor)
    return frase3(r, c, g, { x: o.x ?? 80, y: o.y ?? 1400, s: o.s ?? 84, larg: o.larg ?? 920, destaque: o.destaque, sai: prox, alinha: o.alinha });
  });
  return { upd: lt => F.forEach(f => f.upd(lt)), F };
}
// apresentador num círculo por cima da estação (a estação continua andando atrás): circ3(r, S, c, ['B14', 'B15'], {cx, cy, d, z, fy})
function circ3(r, S, c, beats, o = {}) {
  const d = o.d ?? 600, cx = o.cx ?? 540, cy = o.cy ?? 600;
  const halo = el(r, 'div', `position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,.55) ${(d * .45).toFixed(0)}px, rgba(0,0,0,0) ${(d * .95).toFixed(0)}px);`);
  const ph = photo(r, cx - d / 2, cy - d / 2, d, d, { border: 0, tape: false, fy: o.fy ?? .42 });
  ph.zoomFn = () => o.z ?? 1.25;
  S.photos.push(ph);
  ph.fr.style.borderRadius = ph.inner.style.borderRadius = '50%';
  ph.fr.style.boxShadow = `0 0 0 ${Math.round(d * .014)}px #f3efe8, 0 24px 50px rgba(0,0,0,.6)`;
  const t0 = c.b(beats[0]) - .06, t1 = c.e(beats[beats.length - 1]) + .12;
  return {
    t0, t1,
    upd: lt => {
      const a = clamp((lt - t0) / .28), b = 1 - clamp((lt - t1) / .22), v = Math.min(a, b);
      ph.fr.style.opacity = v.toFixed(3); halo.style.opacity = v.toFixed(3);
      ph.fr.style.transform = `scale(${(lt < t1 ? lerp(.82, 1, E.back(a)) : lerp(1, .9, 1 - b)).toFixed(4)})`;
      ph.fr.style.visibility = v <= 0 ? 'hidden' : 'visible';
    },
  };
}
// estacao(beats, {nome, zs, ov, fx, fy, cor, cam, mao, dof, foco, fala: {y, destaque, s} | false, veu, tr, lead,
//                 fumIn, fumOut: {ox, oy, d, tom}, circ: {beats, cx, cy, d, z, fy}, troca: [{t: c => tempo, nome, zs, fx, fy, ov, cor, cam}],
//                 build(r, S, c), update(S, c)})
//   cam = [[u, {x, y, z, zoom}, ease], ...] com u = fração do tempo da foto (0..1), ou função (lt, c, S) -> {x, y, z}
function estacao(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', camMove: camFixa, lead: o.lead,
    build(r, S, c) {
      const mk = q => { const g = palco3d(r, { nome: q.nome, zs: q.zs, ov: q.ov ?? 1.2, fx: q.fx ?? .5, fy: q.fy ?? .5, porAltura: q.porAltura, cor: q.cor ?? o.cor ?? COR_P3 }); g.q = q; return g; };
      S.ps = [mk(o), ...(o.troca || []).map(mk)];
      S.ts = [-1, ...(o.troca || []).map(q => q.t(c))];
      if (o.build) o.build(r, S, c);
      const falaY = o.fala?.y ?? (o.circ ? (o.circ.cy ?? 600) + (o.circ.d ?? 600) / 2 + 110 : 1400);
      S.veu = o.veu === false ? null : veu3(r, o.veu ?? (falaY < 900 ? 'cima' : 'baixo'), o.veuF ?? .72);
      if (o.circ) S.circ = circ3(r, S, c, o.circ.beats, o.circ);
      if (o.fala !== false) S.fala = falas3(r, c, o.fala?.beats ?? beats, { ...(o.fala || {}), y: falaY, sai: o.fala?.sai ?? c.dur - .12 });
      if (o.fumIn) S.fi = fumaca(r, { modo: 'revela', t0: 0, dur: o.fumIn.dur ?? 1.05, n: 26, semente: o.fumIn.semente ?? 5, tom: o.fumIn.tom });
      if (o.fumOut) S.fo = fumaca(r, { ox: o.fumOut.ox, oy: o.fumOut.oy, t0: c.dur - (o.fumOut.d ?? 1.3), tc: c.dur - .04, n: 30, sobe: o.fumOut.sobe ?? 340, tom: o.fumOut.tom });
      S.grao = o.grao ?? .2; S.vig = o.vig ?? .7;
    },
    update(S, c) {
      const lt = c.lt;
      S.ps.forEach((g, i) => {
        // troca na palavra: a nova entra da direita com borrão (chicote curto), a velha sai para a esquerda
        const t = S.ts[i], tn = S.ts[i + 1] ?? 1e9;
        const vis = lt >= t - .001 && lt < tn + .2;
        g.style.display = vis ? 'block' : 'none';
        if (!vis) return;
        const ent = i === 0 ? 1 : clamp((lt - t) / .2), sai = clamp((lt - tn) / .2);
        const x = (1 - E.out(ent)) * 1080 - E.in(sai) * 1080, bl = (i ? Math.sin(Math.PI * ent) * 26 : 0) + Math.sin(Math.PI * sai) * 26;
        g.style.transform = Math.abs(x) > .5 ? `translateX(${x.toFixed(1)}px)` : '';
        g.style.filter = (g.q.cor ?? o.cor ?? COR_P3) + (bl > .5 ? ` blur(${bl.toFixed(1)}px)` : '');
        const q = g.q, t0 = i === 0 ? 0 : t, t1 = i === S.ps.length - 1 ? c.dur : tn + .2, u = clamp((lt - t0) / Math.max(.3, t1 - t0));
        const cam = typeof q.cam === 'function' ? q.cam(lt - t0, c, S) : q.cam ? kf3(u, q.cam) : { x: lerp3(-120, 120, E.inOut(u)), y: 0, z: lerp3(0, 260, E.inOut(u)) };
        const m = mao3(lt, q.mao ?? 1, i + 3);
        g.cam({ x: cam.x + m.x, y: cam.y + m.y, z: cam.z ?? 0, zoom: cam.zoom, dof: q.dof, foco: q.foco ?? 0, dofMax: q.dofMax ?? 8 });
      });
      if (S.veu) S.veu.set(1);
      if (S.circ) S.circ.upd(lt);
      if (S.fala) S.fala.upd(lt);
      if (S.fi) S.fi.upd(lt);
      if (S.fo) S.fo.upd(lt);
      if (o.update) o.update(S, c);
    },
  });
}
// apresentador em tela cheia, LIMPO (sem grão nem cor de cinema), punch-in seco numa palavra: pres3(beats, {z, fy, punch, punchEm, tr, destaque})
function pres3(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', camMove: camFixa, lead: o.lead, presenter: true,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:#000;');
      S.ph = photo(r, -40, -30, 1160, 1980, { border: 0, tape: false, fy: o.fy ?? .40 });
      S.photos.push(S.ph);
      const tp = o.punchEm ? o.punchEm(c) : Math.min(c.dur * .45, 1.1);
      S.ph.zoomFn = lt => (o.z ?? 1.05) * lerp(1, o.punch ?? 1.08, E.out5(clamp((lt - tp) / .16)));
      S.veu = veu3(r, 'baixo', .5);
      S.fala = falas3(r, c, beats, { y: o.falaY ?? 1450, s: 80, destaque: o.destaque, sai: c.dur - .1 });
      S.grao = 0; S.vig = .15;
    },
    update(S, c) { S.veu.set(1); S.fala.upd(c.lt); },
  });
}
// curva (gráfico vetorial em tela cheia, a câmera segue a ponta):
// curva3(beats, {pts, cor, corSobe, tSobe: c => t, marca: {u, t: c => t}, circ, prog: (lt, c, S) => u, abre: c => t, destaque, falaY, tr})
function curva3(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', camMove: camFixa, lead: o.lead,
    build(r, S, c) {
      el(r, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, #102030, #060b12 75%);`);
      S.gw = o.gw ?? 2400;
      S.cx = el(r, 'div', `position:absolute;left:0;top:0;width:${S.gw}px;height:${H}px;transform-origin:0 0;`);
      S.g = grafico3(S.cx, S.gw, H, { pts: o.pts, esp: 15, cor: o.cor, fundo: 'transparent' });
      S.tS = o.tSobe ? o.tSobe(c) : 1e9;
      if (o.marca) { S.mk = S.g.marca(o.marca.u); S.tm = o.marca.t(c); }
      S.veu = veu3(r, 'cima', .5);
      if (o.circ) S.circ = circ3(r, S, c, o.circ.beats, o.circ);
      S.fala = falas3(r, c, beats, { y: o.falaY ?? 1500, destaque: o.destaque, sai: c.dur - .1 });
      if (o.fumIn) S.fi = fumaca(r, { modo: 'revela', t0: 0, dur: o.fumIn.dur ?? 1.05, n: 26, semente: 9 });
      S.grao = .14; S.vig = .5;
    },
    update(S, c) {
      const lt = c.lt, u = o.prog ? o.prog(lt, c, S) : E.inOut(clamp((lt + .1) / (c.dur - .2)));
      S.g.set(u, lt > S.tS ? (o.corSobe ?? '#f2c14e') : null);
      if (S.mk) S.mk.upd(clamp((lt - S.tm) / .3));
      const q = S.g.cab(u), sa = 1080 / S.gw * 1.06, ab = o.abre ? E.inOut(clamp((lt - o.abre(c)) / 1.2)) : 0;
      const x = lerp3(600 - q.x, 540 - S.gw * .5 * sa, ab), y = lerp3(1000 - q.y, 1040 - H * .5 * sa, ab), s = lerp3(1, sa, ab);
      S.cx.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
      S.veu.set(1); if (S.circ) S.circ.upd(lt); S.fala.upd(lt); if (S.fi) S.fi.upd(lt);
    },
  });
}
// final: nome de quem fala em sans pesado + "siga" (sem print de perfil quando não houver): fim3(beats, {nome, sub})
function fim3(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', camMove: camFixa, lead: o.lead,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%, #1a1a1a, #000 75%);');
      S.t = titulo3(r, o.nome, o.sub ?? '', { x: 80, y: 760, s: 120, t0: .05, tSub: .6 });
      S.fala = falas3(r, c, beats, { y: 1200, destaque: o.destaque, sai: c.dur });
      S.grao = .14; S.vig = .6;
    },
    update(S, c) { S.t.upd(c.lt); S.fala.upd(c.lt); },
  });
}

// ======================= palcoGL: as mesmas fotos em camadas, mas com RELEVO (WebGL na placa) =======================
// Mesma interface do palco3d (cam, tela, mira, pt, plano, planos, zs, img). Cada camada vira uma malha deslocada pela
// profundidade (p3_<nome>_d<i>.png do prof3d.py): o carro tem volume e a câmera contorna, em vez de deslizar cartões.
// O foco (dof) usa a distância de cada pixel. Os planos CSS continuam existindo (vazios), alinhados à mesma câmera:
// tela(), plano() e o que se põe neles ficam por cima, e as camadas da FRENTE de uma tela vão para um 2º canvas
// (a cadeira continua passando na frente do monitor). Desenho: depois de cada render(t), só os palcos visíveis.
// Precisa de render/lib/three.min.js e do Chromium com a placa (o preparar_p3.py põe as duas coisas).
let _p3gl;
function p3gl() {
  if (_p3gl !== undefined) return _p3gl;
  _p3gl = null;
  if (!window.THREE) { console.warn('edit-parallax3d: sem three.min.js, usando CSS 3D'); return null; }
  try {
    const cv = document.createElement('canvas');
    const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(1); r.outputColorSpace = THREE.LinearSRGBColorSpace; r.setClearColor(0x000000, 0); r.autoClear = false;
    const g = r.getContext(), ext = g.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? g.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '?';
    if (/SwiftShader|llvmpipe/i.test(gpu)) console.warn('edit-parallax3d: WebGL SEM a placa (' + gpu + '): render ~20x mais lento; rode o preparar_p3.py');
    _p3gl = { r, cv, gpu, RW: 0, RH: 0, palcos: [], vivos: [] };
  } catch (e) { console.warn('edit-parallax3d: WebGL falhou, usando CSS 3D', e); }
  return _p3gl;
}
const P3GL_VIVOS = 6;                                            // fotos que ficam na placa ao mesmo tempo (o resto é solto)
const P3GL_VS = `
uniform sampler2D dmap; uniform float P, z0, dref, relevo, texel; uniform vec4 ret;   // ret = esquerda, topo, larg, alt (px do palco, centro = 0)
varying vec2 vUv; varying float vWz, vEst, vDist;
float prof(vec2 u){ vec3 c = texture2D(dmap, u).rgb; return (c.r * 65280. + c.g * 255.) / 65535.; }
float zz(float d){ return min(z0 + relevo * (d - dref), P - 40.); }
void main(){
  vUv = uv; float z = zz(prof(uv)), k = (P - z) / P;
  float dx = abs(zz(prof(uv + vec2(texel, 0.))) - zz(prof(uv - vec2(texel, 0.))));
  float dy = abs(zz(prof(uv + vec2(0., texel))) - zz(prof(uv - vec2(0., texel))));
  vEst = max(dx, dy) / (P - z);                                  // salto de profundidade = triângulo esticado
  vec3 p = vec3((ret.x + uv.x * ret.z) * k, -(ret.y + (1. - uv.y) * ret.w) * k, z);
  vec4 mv = modelViewMatrix * vec4(p, 1.); vWz = z; vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const P3GL_FS = `
uniform sampler2D map; uniform float modo, corte, fundo; varying vec2 vUv; varying float vWz, vEst, vDist;
void main(){
  vec4 c = texture2D(map, vUv);
  if (fundo < .5 && vEst > corte) discard;
  float a = c.a * (fundo > .5 ? 1. : clamp((vDist - 60.) / 260., 0., 1.));    // camada que passa pela câmera some antes
  if (modo > .5) { if (a < .5) discard; gl_FragColor = vec4(vWz, 0., 0., 1.); return; }
  gl_FragColor = vec4(c.rgb, a);
}`;
// foco: borra cada pixel pela distância em Z ao plano de foco, como o blur do palco CSS (dof px por 100 de Z, até dofMax)
const P3GL_DOF = `
uniform sampler2D tC, tD; uniform vec2 esc, px; uniform float foco, dof, dofMax; varying vec2 vUv;
float rz(float z){ return dof <= 0. ? 0. : min(dofMax, abs(z - foco) * dof / 100.) * 2.; }
void main(){
  vec2 u = vUv * esc; vec4 c0 = texture2D(tC, u); vec4 d0 = texture2D(tD, u);
  bool vazio = d0.a < .5; float z0 = vazio ? -1e5 : d0.r, r0 = vazio ? dofMax * 2. : rz(d0.r);
  if (dof <= 0. || r0 < .6) { gl_FragColor = c0; return; }
  vec4 acc = c0; float wt = 1.;
  for (int i = 1; i < 48; i++) {
    float fi = float(i), ang = fi * 2.39996, rr = sqrt(fi / 48.) * r0;
    vec2 o = vec2(cos(ang), sin(ang)) * rr * px;
    vec4 di = textureLod(tD, u + o, 0.); bool cheio = di.a > .5;
    float ri = cheio ? rz(di.r) : 0., zi = cheio ? di.r : -1e5;
    float w = zi > z0 + .5 ? smoothstep(rr - 1., rr + 1., ri) : (vazio ? 0. : 1.);
    acc += textureLod(tC, u + o, 0.) * w; wt += w;
  }
  gl_FragColor = acc / wt;
}`;
let _p3glQuad;
function p3glPasse() {
  if (_p3glQuad) return _p3glQuad;
  const m = new THREE.ShaderMaterial({
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }', fragmentShader: P3GL_DOF,
    uniforms: { tC: { value: null }, tD: { value: null }, esc: { value: new THREE.Vector2() }, px: { value: new THREE.Vector2() }, foco: { value: 0 }, dof: { value: 0 }, dofMax: { value: 8 } },
    depthTest: false, depthWrite: false, blending: THREE.NoBlending,
  });
  const s = new THREE.Scene(), me = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), m);
  me.frustumCulled = false; s.add(me);
  return (_p3glQuad = { m, s, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) });
}
function p3glTamanho(w, h) {                                     // canvas e alvos compartilhados, do tamanho do maior palco
  const G = _p3gl;
  if (w <= G.RW && h <= G.RH) return;
  G.RW = Math.max(G.RW, Math.ceil(w)); G.RH = Math.max(G.RH, Math.ceil(h));
  G.r.setSize(G.RW, G.RH, false);
  if (G.rtC) { G.rtC.dispose(); G.rtD.dispose(); }
  G.rtC = new THREE.WebGLRenderTarget(G.RW, G.RH, { type: THREE.HalfFloatType, samples: 4 });
  G.rtD = new THREE.WebGLRenderTarget(G.RW, G.RH, { type: THREE.HalfFloatType });
}
// profundidade (0..1, 1 = perto) de um ponto da foto pela grade do prof3d.py; ix, iy em px da foto
function p3glProf(nome, i, ix, iy) {
  const a = AS3('p3_' + nome), pg = a.pg;
  if (!pg) return null;
  if (!pg._d) pg._d = pg.d.map(b => Uint8Array.from(atob(b), ch => ch.charCodeAt(0)));
  const d = pg._d[Math.min(i, pg._d.length - 1)];
  const x = clamp(ix / a.w * pg.w - .5, 0, pg.w - 1), y = clamp(iy / a.h * pg.h - .5, 0, pg.h - 1);
  const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, pg.w - 1), y1 = Math.min(y0 + 1, pg.h - 1), fx = x - x0, fy = y - y0;
  const v = (xx, yy) => d[yy * pg.w + xx];
  return (v(x0, y0) * (1 - fx) * (1 - fy) + v(x1, y0) * fx * (1 - fy) + v(x0, y1) * (1 - fx) * fy + v(x1, y1) * fx * fy) / 255;
}
function palcoGL(pai, o = {}) {
  const w = o.w ?? W, h = o.h ?? H, P = o.persp ?? P3.persp, G = _p3gl;
  const g = el(pai, 'div', `position:absolute;left:${o.x ?? 0}px;top:${o.y ?? 0}px;width:${w}px;height:${h}px;overflow:hidden;` +
    `background:${o.fundo ?? '#000'};perspective:${P}px;perspective-origin:50% 50%;${o.cor ? `filter:${o.cor};` : ''}`);
  const cvA = el(g, 'canvas', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;`);
  const mundo = el(g, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-style:preserve-3d;transform-origin:50% 50%;`);
  const cvB = el(g, 'canvas', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;display:none;`);
  cvA.width = cvB.width = Math.ceil(w); cvA.height = cvB.height = Math.ceil(h);
  const meta = AS3('p3_' + o.nome), n = meta.camadas || 2;
  const zs = o.zs ?? Array.from({ length: n }, (_, i) => n === 1 ? 0 : -900 + 900 * i / (n - 1));
  const relevo = meta.dref ? (o.relevo ?? P3.relevo) : 0;
  if (!meta.dref) console.warn(`edit-parallax3d: p3_${o.nome} sem relevo (rode prof3d.py <projeto> ${o.nome})`);
  g.P = P; g.w = w; g.h = h; g.mundo = mundo; g.planos = []; g.zs = []; g.telas = []; g.gl = true;
  const ref = AS3('p3_' + o.nome + '_0'), ov = o.ov ?? 1.2;
  let ih = h * ov, iw = ih * ref.w / ref.h;
  if (!o.porAltura && iw < w * ov) { iw = w * ov; ih = iw * ref.h / ref.w; }
  g.img = { iw, ih, left: w / 2 - (o.fx ?? .5) * iw, top: h / 2 - (o.fy ?? .5) * ih, k: iw / ref.w };
  const novoPlano = z => el(mundo, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 50%;` +
    `transform:translateZ(${z.toFixed(1)}px) scale(${((P - z) / P).toFixed(5)});`);
  g.plano = z => { const pl = novoPlano(z); pl.z = z; pl.c = (P - z) / P; g.planos.push(pl); g.zs.push(z); return pl; };
  for (let i = 0; i < n; i++) g.plano(zs[i]);
  // Z real de um ponto da foto na camada i (já com o relevo) e o Z médio de um retângulo (5 x 5 pontos)
  g.zDe = (i, ix, iy) => { const d = relevo ? p3glProf(o.nome, i, ix, iy) : null; return d == null ? zs[i] : Math.min(zs[i] + relevo * (d - meta.dref[i]), P - 40); };
  const zRet = (i, r) => {
    let s = 0;
    for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) s += g.zDe(i, lerp3(r[0], r[2], (a + .5) / 5), lerp3(r[1], r[3], (b + .5) / 5));
    return s / 25;
  };
  g.pt = (ix, iy) => ({ u: g.img.left + ix * g.img.k - w / 2, v: g.img.top + iy * g.img.k - h / 2 });
  g.tela = (i, r, css = '') => {                                 // a tela fica num plano próprio, na profundidade real do retângulo
    const z = zRet(i, r), pl = novoPlano(z);
    pl.z = z; pl.camada = i; g.telas.push(pl);
    const a = g.pt(r[0], r[1]), b = g.pt(r[2], r[3]);
    const d = el(pl, 'div', `position:absolute;left:${(a.u + w / 2).toFixed(1)}px;top:${(a.v + h / 2).toFixed(1)}px;` +
      `width:${(b.u - a.u).toFixed(1)}px;height:${(b.v - a.v).toFixed(1)}px;overflow:hidden;${css}`);
    d.tw = b.u - a.u; d.th = b.v - a.v;
    return d;
  };
  g.mira = (i, r, q = {}) => {                                   // dolly até o retângulo encher a altura (ou a largura) da tela
    const z = zRet(i, r), c = (P - z) / P, a = g.pt(r[0], r[1]), b = g.pt(r[2], r[3]);
    const f = q.porLargura ? (b.u - a.u) / w : (b.v - a.v) / h;
    return { x: c * (a.u + b.u) / 2, y: c * (a.v + b.v) / 2, z: (P - z) * (1 - f), zoom: 1 };
  };
  // ---- WebGL: criado só quando o palco aparece; no máximo P3GL_VIVOS fotos ficam na placa ----
  const mk = () => {
    const cena = new THREE.Scene(), raiz = new THREE.Group(); cena.add(raiz);
    const cam = new THREE.PerspectiveCamera(2 * Math.atan(h / 2 / P) * 180 / Math.PI, w / h, 5, 30000);
    const camadas = [], imgs = [];
    for (let i = 0; i < n; i++) {
      const im = new Image(); im.src = AS3(`p3_${o.nome}_${i}`).src; imgs.push(im);
      const tx = new THREE.Texture(im); tx.colorSpace = THREE.NoColorSpace; tx.anisotropy = 8;
      let td;
      if (relevo) {
        const dm = new Image(); dm.src = `assets/p3_${o.nome}_d${i}.png`; imgs.push(dm);
        td = new THREE.Texture(dm); td.generateMipmaps = false; td.minFilter = td.magFilter = THREE.LinearFilter;
      } else td = new THREE.DataTexture(new Uint8Array([128, 0, 0, 255]), 1, 1);
      td.colorSpace = THREE.NoColorSpace;
      const seg = o.seg ?? 320, geo = new THREE.PlaneGeometry(1, 1, seg, Math.round(seg * ref.h / ref.w));
      const mat = new THREE.ShaderMaterial({
        vertexShader: P3GL_VS, fragmentShader: P3GL_FS, side: THREE.DoubleSide, transparent: true,
        uniforms: {
          map: { value: tx }, dmap: { value: td }, P: { value: P }, z0: { value: zs[i] }, dref: { value: meta.dref ? meta.dref[i] : 0 },
          relevo: { value: relevo }, texel: { value: 1.5 / 1024 }, ret: { value: new THREE.Vector4(g.img.left - w / 2, g.img.top - h / 2, iw, ih) },
          modo: { value: 0 }, corte: { value: o.corte ?? .07 }, fundo: { value: i === 0 ? 1 : 0 },
        },
      });
      const me = new THREE.Mesh(geo, mat); me.frustumCulled = false; me.renderOrder = i; raiz.add(me);
      camadas.push(me);
    }
    const pronto = Promise.all(imgs.map(x => x.decode().catch(() => console.error('edit-parallax3d: não carregou ' + x.src))))
      .then(() => camadas.forEach(me => { me.material.uniforms.map.value.needsUpdate = true; if (relevo) me.material.uniforms.dmap.value.needsUpdate = true; }));
    return { cena, raiz, cam, camadas, pronto };
  };
  g._gl = null;
  g._solta = () => {
    if (!g._gl) return;
    g._gl.camadas.forEach(me => { me.geometry.dispose(); me.material.uniforms.map.value.dispose(); me.material.uniforms.dmap.value.dispose(); me.material.dispose(); });
    g._gl = null;
  };
  g._desenha = async () => {
    G.vivos = G.vivos.filter(x => x !== g); G.vivos.push(g);
    if (!g._gl) { g._gl = mk(); while (G.vivos.length > P3GL_VIVOS) G.vivos.shift()._solta(); }
    await g._gl.pronto;
    const X = g._gl, q = g.q;
    X.cam.position.set(q.x, -q.y, P - q.z); X.cam.zoom = q.zoom; X.cam.updateProjectionMatrix();
    X.raiz.rotation.z = -q.rz * Math.PI / 180;
    // camadas na frente de uma tela (ou de algo posto num plano da foto) vão para o canvas de cima
    let corte = n - 1;
    for (const pl of g.telas) corte = Math.min(corte, pl.camada);
    for (let i = 0; i < n; i++) if (g.planos[i].childElementCount) corte = Math.min(corte, i);
    p3glTamanho(w, h);
    const R = G.r, Q = p3glPasse(), wi = Math.ceil(w), hi = Math.ceil(h);
    const grupo = (cv, de, ate) => {
      X.camadas.forEach((me, i) => { me.visible = i >= de && i <= ate; });
      for (const [rt, modo] of [[G.rtC, 0], [G.rtD, 1]]) {
        X.camadas.forEach(me => { me.material.uniforms.modo.value = modo; me.material.blending = modo ? THREE.NoBlending : THREE.NormalBlending; });
        rt.viewport.set(0, 0, wi, hi); rt.scissor.set(0, 0, wi, hi); rt.scissorTest = true;
        R.setRenderTarget(rt); R.clear(); R.render(X.cena, X.cam);
      }
      const U = Q.m.uniforms;
      U.tC.value = G.rtC.texture; U.tD.value = G.rtD.texture; U.esc.value.set(wi / G.RW, hi / G.RH); U.px.value.set(1 / G.RW, 1 / G.RH);
      U.dof.value = q.dof ?? 0; U.foco.value = q.foco; U.dofMax.value = q.dofMax ?? 14;
      R.setRenderTarget(null); R.setViewport(0, 0, wi, hi); R.setScissor(0, 0, wi, hi); R.setScissorTest(true);
      R.clear(); R.render(Q.s, Q.cam); R.setScissorTest(false);
      const ctx = cv._c || (cv._c = cv.getContext('2d'));
      ctx.clearRect(0, 0, wi, hi);
      ctx.drawImage(G.cv, 0, G.RH - hi, wi, hi, 0, 0, wi, hi);
    };
    grupo(cvA, 0, corte);
    cvB.style.display = corte < n - 1 ? 'block' : 'none';
    if (corte < n - 1) grupo(cvB, corte + 1, n - 1);
  };
  g.cam = (q = {}) => {
    const x = q.x ?? 0, y = q.y ?? 0, z = q.z ?? 0, Z = q.zoom ?? 1;
    mundo.style.transform = `scale3d(${Z.toFixed(5)},${Z.toFixed(5)},1) translate3d(${(-x).toFixed(2)}px,${(-y).toFixed(2)}px,${z.toFixed(2)}px)` +
      (q.rz ? ` rotateZ(${q.rz.toFixed(3)}deg)` : '');
    // plano CSS vazio fica escondido: perto da câmera ele vira uma camada de ~18 mil px e, com o filtro de cor do palco,
    // passa do limite da placa e o Chromium apaga o palco inteiro (cinza no recuo do monitor)
    [...g.planos, ...g.telas].forEach((pl, i) => {
      if (!pl.childElementCount) { pl.style.visibility = 'hidden'; return; }
      const op = i === 0 ? 1 : clamp((P - pl.z - z - 60) / 260);
      pl.style.opacity = op.toFixed(3); pl.style.visibility = op <= 0 ? 'hidden' : 'visible';
    });
    g.q = { x, y, z, zoom: Z, rz: q.rz || 0, dof: q.dof, foco: q.foco ?? 0, dofMax: q.dofMax };
  };
  g.cam({});
  G.palcos.push(g);
  return g;
}
// depois de cada quadro: desenha os palcos WebGL visíveis (o motor já rodou os update() e as câmeras)
(() => {
  const orig = window.render;
  if (!orig || orig._p3gl) return;
  const novo = async t => {
    const k = await orig(t);
    if (_p3gl) for (const g of _p3gl.palcos) if (g.offsetParent !== null) await g._desenha();
    return k;
  };
  novo._p3gl = true;
  window.render = novo;
})();
