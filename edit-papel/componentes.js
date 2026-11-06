// ============================================================================
//  edit-papel — biblioteca do formato "papel amassado + retícula" (referência: 5 vídeos de @julianealborna, TikTok)
//  1ª parte do render/scenes.js (work/<prefixo>_a.js). Precisa do motor do Kit_Edicao_Vox_v2.
//
//  O vídeo alterna 4 mundos, sempre em CORTE SECO:
//   1. apresentador em tela cheia com punch-in (médio <-> close <-> close extremo) e legenda curta no peito  presPunch()
//   2. B-roll literal em tela cheia (1–3 s; rajadas de 0,4–0,7 s em listas) com legenda acumulada no vazio      clipe(), seqClipes()
//   3. papel creme amassado com fotos em retícula P&B e tipografia mista que sai da fala                       papel(), tipoFala()...
//   4. escuro: pôster preto com moldura fina + duotone pêssego, ou ícone branco luminoso com texto minúsculo     poster(), escuro()...
//  Legendas: renderCaptions abaixo, modo por cena em S.cap = {modo, x, y, s, ...} (tabela no SKILL.md).
//  A esquete de abertura da referência NÃO é usada (é do criador); o modo 'fala' (= 'esquete') serve para falas de terceiros.
// ============================================================================
const PP = { tinta: '#151413', papel: '#d9cfc2', creme: '#ecc9aa', branco: '#f6f2ea', cinza: '#77716a', preto: '#0d0d0d' };
const SANS = 'Inter', SERIF = 'Playfair', MAO = 'InkFree';
const PP_STOP = new Set(('a o as os um uma uns umas de do da dos das em no na nos nas num numa e que para pra por pelo pela ' +
  'pelos pelas com sem se ao aos ja so mas ou nem me te lhe eu ele ela eles elas voce voces isso esse essa este esta isto ' +
  'foi vai ser sao tem ha ate mais muito como quando onde quem qual meu minha seu sua seus suas nosso nossa la ca ai tao tambem nao').split(' '));
const ppStop = w => PP_STOP.has(norm(w));
const ppNum = w => /\d/.test(w);
const ppLimpa = w => w.replace(/[,;:]$/, '').replace(/([^.])\.$/, '$1');
// palavras em letra de mão (manuscrita caixa alta). Por cena: S.cap.mao = ['venenosa']; no vídeo todo: PP_MAO.add('ruinas')
const PP_MAO = new Set();

// ---------- grão animado e vinheta por cena (S.grao 0..1, S.vig 0..1) ----------
let _ppGrao = null;
function ppGraoTex() {
  if (_ppGrao) return _ppGrao;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 190; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  return (_ppGrao = c.toDataURL());
}

// ---------- legendas ----------
// blocos por modo (cada modo quebra a fala de um jeito; a cena escolhe o modo a cada quadro)
const PP_BLOCOS = {};
function ppBlocos(modo) {
  const tipo = { peito: 'curto', palavra: 'palavra', nivel: 'nivel', papel: 'nivel', acumula: 'frase', esquete: 'frase', escuro: 'frase' }[modo] || 'curto';
  const ck = tipo === 'frase' ? modo : tipo;
  if (PP_BLOCOS[ck]) return PP_BLOCOS[ck];
  const L = [], all = [];
  TIMING.beats.forEach(b => b.words.forEach((w, i) => all.push({ w, b: b.id, fim: i === b.words.length - 1 })));
  let cur = [], cb = null;
  const cortes = SCENES.map(x => x.t0).filter(t => t > 0);
  const push = () => { if (cur.length) L.push({ words: cur, beat: cb }); cur = []; };
  const lim = { frase: modo === 'esquete' ? [8, 40] : modo === 'escuro' ? [9, 52] : [12, 64] }.frase;
  const corta = () => { let k = cur.length; while (k > 1 && ppStop(cur[k - 1].w)) k--; const resto = cur.slice(k); cur = cur.slice(0, k); push(); cur = resto; };
  all.forEach(({ w, b, fim }, j) => {
    const nx = all[j + 1] && all[j + 1].w, txt = cur.map(x => x.w).join(' ');
    if (cur.length && cortes.some(ct => ct > cur[cur.length - 1].s + .05 && ct <= w.s + .25)) push();   // corte de cena zera a legenda
    if (!cur.length) cb = b;
    if (tipo === 'palavra') {
      cur.push(w);
      if (!(ppStop(w.w) && w.w.length <= 3 && nx && !fim && !/[,.;:?!]$/.test(w.w))) push();
      return;
    }
    if (tipo === 'curto' && cur.length && (cur.length >= 3 || txt.length + w.w.length > 17)) corta();
    if (tipo === 'nivel' && cur.length) {
      const nc = cur.filter(x => !ppStop(x.w)).length;
      if (cur.length >= 4 || (nc >= 1 && !ppStop(w.w)) || txt.length + w.w.length > 22) corta();
    }
    if (tipo === 'frase' && cur.length && (cur.length >= lim[0] || txt.length + w.w.length > lim[1])) push();
    if (!cur.length) cb = b;
    cur.push(w);
    if (/[.;:?!]$/.test(w.w) || (tipo !== 'frase' && /,$/.test(w.w))) push();
    else if (fim && (tipo !== 'frase' || !nx || nx.s - w.e > .5)) push();   // frase atravessa beats (e trocas de clipe) até o ponto
  });
  push();
  const hold = tipo === 'frase' ? .85 : .45;
  L.forEach(c => { c.s = c.words[0].s - .03; });
  L.forEach((c, i) => {
    const nx = L[i + 1], end = c.words[c.words.length - 1].e, ult = c.words[c.words.length - 1].s;
    const ct = cortes.find(t => t > ult + .05);                                  // a legenda não atravessa o corte de cena
    c.e = Math.min(nx ? nx.s : end + .9, end + hold, ct ?? 1e9);
  });
  return (PP_BLOCOS[ck] = L);
}
function ppChave(ws) {    // índice da palavra-chave: número ganha; senão a mais longa que não é de ligação
  let k = -1, best = -1;
  ws.forEach((w, i) => { const sc = ppNum(w.w) ? 99 : (ppStop(w.w) ? -1 : norm(w.w).length); if (sc > best) { best = sc; k = i; } });
  return Math.max(0, k);
}
function ppEhMao(w, cfg) {
  const n = norm(w.w);
  return PP_MAO.has(n) || (cfg.mao || []).some(x => norm(x) === n);
}
let _ppKey = '';
renderCaptions = function (t) {
  const box = $('cap'), S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  const cfg = typeof S.cap === 'function' ? S.cap(t - CUR_SCENE.t0) : (S.cap || { modo: 'acumula' });
  const gr = $('grain'), vg = $('vig');
  if (gr) { if (!gr._ok) { gr.style.backgroundImage = `url(${ppGraoTex()})`; gr._ok = 1; } gr.style.opacity = (S.grao ?? 0).toFixed(3); }
  if (vg) vg.style.opacity = (S.vig ?? 0).toFixed(3);
  const modo = cfg.modo === 'fala' ? 'esquete' : (cfg.modo || 'acumula');   // 'fala' = fala de terceiro (entrevista/arquivo com áudio próprio)
  if (modo === 'none') { box.style.opacity = 0; return; }
  const L = ppBlocos(modo);
  let idx = -1;
  for (let i = 0; i < L.length; i++) if (t >= L[i].s && t < L[i].e) { idx = i; break; }
  if (idx < 0) { box.style.opacity = 0; return; }
  const ws = L[idx].words, claro = cfg.tema === 'claro' || modo === 'papel';
  const nch = w => norm(w.w).length || 1;
  const fsAuto = modo === 'palavra' ? Math.round(clamp(1500 / Math.max(...ws.filter(w => !ppStop(w.w) || ws.length === 1).map(nch), 1), 80, 135))
    : (modo === 'nivel' || modo === 'papel') ? Math.round(clamp(1020 / nch(ws[ppChave(ws)]), 88, 132)) : 0;
  const fs = cfg.s ?? (fsAuto || { peito: 54, acumula: 50, esquete: 42, escuro: 34 }[modo]);
  const key = `${modo}|${idx}|${fs}|${cfg.cor || ''}|${cfg.corChave || ''}|${claro}|${(cfg.mao || []).join()}|${cfg.larg || ''}|${cfg.alinha || ''}`;
  if (key !== _ppKey) {
    _ppKey = key;
    const cor = cfg.cor || (claro ? PP.tinta : '#fff');
    const somb = claro || modo === 'escuro' ? 'none' : '0 2px 14px rgba(0,0,0,.42), 0 1px 3px rgba(0,0,0,.3)';
    const alinha = cfg.alinha || ({ acumula: 'esq', esquete: 'esq' }[modo] || 'centro');
    box.className = 'pp-' + modo;
    box.style.cssText = `position:absolute;z-index:5;opacity:0;background:none;box-shadow:none;padding:0;text-transform:none;` +
      `font-family:${SANS};color:${cor};text-shadow:${somb};line-height:1.02;text-align:${alinha === 'esq' ? 'left' : alinha === 'dir' ? 'right' : 'center'};` +
      (['acumula', 'esquete', 'escuro'].includes(modo) ? `white-space:normal;width:${cfg.larg ?? (modo === 'escuro' ? 760 : 640)}px;` : 'white-space:nowrap;');
    const kk = ppChave(ws);
    let lastStrong = -1;
    for (let i = ws.length - 1; i >= 0; i--) if (!ppStop(ws[i].w)) { lastStrong = i; break; }
    const span = (w, i, css) => {
      const mao = ppEhMao(w, cfg);
      const txt = esc(ppLimpa(w.w));
      const fsM = ['peito', 'acumula', 'esquete'].includes(modo) ? `font-size:${Math.round(fs * 1.32)}px;line-height:.9;` : '';   // letra de mão pede corpo maior
      return `<span class="w" data-i="${i}" style="display:inline-block;${css}${mao ? `font-family:${MAO};text-transform:uppercase;font-weight:400;letter-spacing:.02em;${fsM}` : ''}">${txt}</span>`;
    };
    if (modo === 'nivel' || modo === 'papel') {
      const pre = ws.slice(0, kk), pos = ws.slice(kk + 1);
      const pk = `font-size:${fs}px;font-weight:800;letter-spacing:-.045em;${cfg.corChave ? `color:${cfg.corChave};` : ''}`;
      const ps = `font-size:${Math.round(fs * .42)}px;font-weight:${claro ? 500 : 600};letter-spacing:-.025em;`;
      const posCss = cfg.cauda === 'serif' ? `font-family:${SERIF};font-weight:400;font-size:${Math.round(fs * .4)}px;letter-spacing:0;color:${claro ? PP.cinza : 'rgba(255,255,255,.8)'};` : ps;
      box.innerHTML = (pre.length ? `<div style="margin-bottom:-.06em">${pre.map((w, i) => span(w, i, ps)).join(' ')}</div>` : '') +
        `<div style="line-height:.9">${span(ws[kk], kk, pk)}</div>` +
        (pos.length ? `<div style="margin-top:.02em">${pos.map((w, i) => span(w, kk + 1 + i, posCss)).join(' ')}</div>` : '');
    } else if (modo === 'palavra') {
      box.innerHTML = ws.map((w, i) => span(w, i, `font-size:${ppStop(w.w) && ws.length > 1 ? Math.round(fs * .5) : fs}px;font-weight:800;letter-spacing:-.045em;`)).join(' ');
    } else if (modo === 'peito') {
      box.innerHTML = ws.map((w, i) => span(w, i, `font-size:${fs}px;font-weight:600;letter-spacing:-.035em;`)).join(' ');
    } else {   // acumula / esquete / escuro: a frase cresce palavra a palavra; a última palavra forte fecha em negrito
      const forte = cfg.forte !== false && modo !== 'esquete';
      box.innerHTML = ws.map((w, i) => {
        const b = forte && (i === lastStrong || (cfg.fortes || []).some(x => norm(x) === norm(w.w)));
        const serif = modo === 'escuro' && i % 3 === 1 && !b;
        return span(w, i, `font-size:${fs}px;font-weight:${b ? 800 : (modo === 'escuro' ? 500 : 600)};letter-spacing:${serif ? '0' : '-.03em'};` +
          (serif ? `font-family:${SERIF};font-weight:400;` : '') + (b && cfg.corChave ? `color:${cfg.corChave};` : ''));
      }).join(' ');
    }
    box._spans = [...box.querySelectorAll('.w')];
  }
  const glow = modo === 'escuro';
  box._spans.forEach(s => {
    const w = ws[+s.dataset.i], q = clamp((t - (w.s - .03)) / .18), qe = E.out(q);
    s.style.opacity = qe.toFixed(3);
    const b = (1 - qe) * 7;
    s.style.filter = (b > .3 ? `blur(${b.toFixed(1)}px) ` : '') + (glow ? 'drop-shadow(0 0 6px rgba(255,255,255,.55))' : '');
    if ((modo === 'nivel' || modo === 'papel') && +s.dataset.i === ppChave(ws)) s.style.transform = `scale(${(1.1 - .1 * qe).toFixed(3)})`;
  });
  const alinha = cfg.alinha || ({ acumula: 'esq', esquete: 'esq' }[modo] || 'centro');
  const topo = ['acumula', 'esquete'].includes(modo) && cfg.ancora !== 'meio';
  const dx = alinha === 'esq' ? '0' : alinha === 'dir' ? '-100%' : '-50%';
  box.style.left = `${cfg.x ?? (alinha === 'esq' ? 110 : alinha === 'dir' ? 970 : 540)}px`;
  box.style.top = `${cfg.y ?? { peito: 1430, palavra: 960, nivel: 960, papel: 420, acumula: 700, esquete: 520, escuro: 1100 }[modo]}px`;
  box.style.transform = `translate(${dx},${topo ? '0' : '-50%'})`;
  box.style.opacity = 1;
};

// ---------- apresentador com punch-in ----------
// presPunch(['B01','B02'], { zooms: [1, 1.3, 1, 1.55], passos: c => [[0, 1], [c.w('B02','casa') - .03, 1.4]], capY: 1430, fy: .40,
//                            mao: true (câmera na mão), look: true (contraste/vinheta), build(L, S, c), update(S, c) })
// Cada passo = um "corte" de enquadramento (sem transição). Padrão: um passo por beat (beat > 2,6 s ganha um passo no meio).
function presPunch(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', presenter: true, camMove: camStill, lead: o.lead,
    build(r, S, c) {
      S.ph = photo(r, -70, -40, 1220, 2000, { border: 0, tape: false, fy: o.fy ?? .40 });   // folga: câmera na mão não mostra borda
      S.photos.push(S.ph);
      if (o.look !== false) S.ph.img.style.filter = 'contrast(1.06) saturate(.93) brightness(.97)';
      const zs = o.zooms || [1.0, 1.3, 1.08, 1.55, 1.18, 1.42];
      let ps = o.passos ? o.passos(c) : null;
      if (!ps) {
        ps = [];
        beats.forEach(id => {
          const t0 = Math.max(0, c.b(id)), d = c.e(id) - c.b(id);
          ps.push(t0);
          if (d > 2.6) { const ws = BYID[id].words, mid = ws[Math.floor(ws.length / 2)]; ps.push(mid.s - c.t0 - .03); }
        });
        ps[0] = 0;
        ps = ps.map((t, i) => [t, zs[(i + (o.z0 ?? 0)) % zs.length], i % 2 ? 1 : -1]);
      } else ps = ps.map((p, i) => [p[0], p[1], p[2] ?? (i % 2 ? 1 : -1)]);
      S.passos = ps;
      S.ph.zoomFn = lt => { let z = ps[0]; for (const p of ps) if (lt >= p[0]) z = p; return z[1] * (1 + .018 * clamp((lt - z[0]) / 2.5)); };
      S.cap = { modo: 'peito', y: o.capY ?? 1430 };
      S.vig = o.look === false ? 0 : .55;
      const L = S.L = el(r.parentNode, 'div', 'position:absolute;inset:0;z-index:3;pointer-events:none;');
      if (o.build) o.build(L, S, c);
    },
    update(S, c) {
      const lt = c.lt;
      let z = S.passos[0]; for (const p of S.passos) if (lt >= p[0]) z = p;
      const m = o.mao === false ? { x: 0, y: 0, r: 0 } : { x: 6 * Math.sin(lt * 1.13 + 1) + 3 * Math.sin(lt * 2.7), y: 5 * Math.sin(lt * 1.41 + 2) + 2 * Math.sin(lt * 3.1), r: .22 * Math.sin(lt * .93) };
      S.ph.fr.style.transform = `translate(${(m.x + z[2] * (o.lado ?? 26) * (z[1] > 1.2 ? 1 : 0)).toFixed(1)}px,${m.y.toFixed(1)}px) rotate(${m.r.toFixed(3)}deg)`;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- B-roll: clipe em tela cheia (render/clips/<nome>/0001.jpg, 30 fps, qualquer tamanho -> cobre 1080x1920) ----------
// g = clipe(r, 'nome', S, { from: 0 (s dentro do clipe), rate: 1, fx: .5, fy: .5, z0: 1.0, z1: 1.06, t0: 0 (início local), n })
function clipe(p, nome, S, o = {}) {
  const g = el(p, 'div', 'position:absolute;inset:0;overflow:hidden;background:#000;');
  const img = el(g, 'img', 'position:absolute;left:0;top:0;transform-origin:0 0;');
  img.decoding = 'sync';
  g.img = img; g.cur = -1; g.t0 = o.t0 ?? 0; g.from = o.from ?? 0; g.rate = o.rate ?? 1;
  g.n = o.n ?? (window.CLIPN && CLIPN[nome]) ?? 90;
  (S.async = S.async || []).push(async lt => {
    if (g.style.display === 'none') return;
    const f = Math.max(0, Math.min(g.n - 1, Math.round(g.from * 30 + Math.max(0, lt - g.t0) * 30 * g.rate)));
    if (f !== g.cur) { img.src = `clips/${nome}/${String(f + 1).padStart(4, '0')}.jpg`; try { await img.decode(); } catch (e) { } g.cur = f; }
    const iw = img.naturalWidth || 1080, ih = img.naturalHeight || 1920;
    const u = clamp((lt - g.t0) / (o.dur ?? 3)), z = lerp(o.z0 ?? 1.0, o.z1 ?? 1.06, E.inOut(u));
    const k = Math.max(1080 / iw, 1920 / ih) * z, w = iw * k, h = ih * k;
    const x = clamp(540 - (o.fx ?? .5) * w, 1080 - w, 0), y = clamp(960 - (o.fy ?? .5) * h, 1920 - h, 0);
    img.style.width = `${iw}px`; img.style.height = `${ih}px`;
    img.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(4)})`;
  });
  return g;
}
// troca de clipes na palavra: seqClipes(r, S, c, [[tempoLocal, 'nome', {opts}], ...]) — cada clipe começa do seu 'from' quando entra
function seqClipes(p, S, c, lista) {
  const gs = lista.map(([t, nome, op = {}]) => { const g = clipe(p, nome, S, { ...op, t0: t }); g.style.display = 'none'; g._t = t; return g; });
  (S.async = S.async || []).unshift(async lt => {
    let k = 0; gs.forEach((g, i) => { if (lt >= g._t) k = i; });
    gs.forEach((g, i) => { g.style.display = i === k ? 'block' : 'none'; });
  });
  return gs;
}
// cena de B-roll pronta: brollCena(['B07','B08'], [[c => 0, 'fabrica20', {from: 2}], [c => c.w('B08','disciplinado'), 'nva_marcha']], {cap: {...}})
function brollCena(beats, lista, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      seqClipes(r, S, c, lista.map(([tf, nome, op]) => [typeof tf === 'function' ? tf(c) : tf, nome, op]));
      if (o.sombra !== false) el(r, 'div', 'position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.18),rgba(0,0,0,0) 30%,rgba(0,0,0,0) 62%,rgba(0,0,0,.28));');
      S.cap = o.cap || { modo: 'acumula' };
      if (o.build) o.build(r, S, c);
    },
    update(S, c) { if (o.update) o.update(S, c); },
  });
}

// ---------- mundo de papel ----------
// fundo de papel amassado DENTRO da câmera (anda com ela). Precisa do asset t_amassado (papel.py). S.grao .16 por padrão.
function papel(r, S, o = {}) {
  const g = el(r, 'div', `position:absolute;left:-135px;top:-240px;width:1350px;height:2400px;background:${PP.papel} url(${AS('t_amassado') ? AS('t_amassado').src : ''}) center/cover;`);
  if (o.flip) g.style.transform = 'scaleX(-1)';
  if (S) { S.grao = o.grao ?? .16; S.vig = o.vig ?? .12; S.cap = S.cap || { modo: 'none' }; }
  return g;
}
// camada de composição (para trocar de "página" com chicote na mesma folha)
const pagina = (r, css = '') => el(r, 'div', `position:absolute;inset:0;${css}`);
// chicote: a página sai para cima/baixo/lado com borrão de movimento e a outra entra (mesma folha). Use no update.
function chicote(saindo, entrando, lt, t, o = {}) {
  const d = o.d ?? .26, u = clamp((lt - t) / d), p = E.inOut5(u), dir = o.dir ?? 'cima';
  const v = dir === 'cima' || dir === 'baixo' ? 1920 : 1080, sg = dir === 'cima' || dir === 'esq' ? -1 : 1;
  const ax = dir === 'cima' || dir === 'baixo' ? 'Y' : 'X';
  const bl = Math.sin(Math.PI * u) * (o.blur ?? 26);
  const f = b => b > .5 ? `blur(${b.toFixed(1)}px)` : '';
  if (lt < t) { saindo.style.display = 'block'; entrando.style.display = 'none'; saindo.style.transform = ''; saindo.style.filter = ''; return 0; }
  if (u >= 1) { saindo.style.display = 'none'; entrando.style.display = 'block'; entrando.style.transform = ''; entrando.style.filter = ''; return 1; }
  saindo.style.display = entrando.style.display = 'block';
  saindo.style.transform = `translate${ax}(${(sg * p * v).toFixed(1)}px)`; saindo.style.filter = f(bl);
  entrando.style.transform = `translate${ax}(${(-sg * (1 - p) * v).toFixed(1)}px)`; entrando.style.filter = f(bl);
  return u;
}
// câmera por quadros-chave: camKeys([[0, {s:1}], [1.2, {s:1.08, y:-40}], [2.0, {x:-300, s:1.1}]]) -> camMove
const camKeys = keys => (lt, c) => {
  const v = k => kf(lt, keys.map(([t, q]) => [t, q[k] ?? (k === 's' ? 1 : 0)]), E.inOut);
  return { s: v('s'), x: v('x'), y: v('y'), r: v('r') };
};
const camDeriva = (k = .05) => (lt, c) => { const u = clamp(lt / c.dur); return { s: 1 + k * E.inOut(u), x: -10 * u, y: -14 * u, r: 0 }; };

// ---------- tipografia mista (a fala vira a composição) ----------
// estilos: s = sans pequena (600) · b = sans média forte (800) · B = sans enorme (900, apertada) · r = serifa fina pequena
//          R = serifa fina grande · m = mão (caixa alta) · M = mão grande · c = sans pequena cinza
const PP_TIPO = {   // tamanhos medidos na referência (576x1024 -> 1080x1920)
  s: k => `font-family:${SANS};font-weight:600;font-size:${64 * k}px;letter-spacing:-.03em;`,
  c: k => `font-family:${SANS};font-weight:500;font-size:${58 * k}px;letter-spacing:-.025em;opacity:.62;`,
  b: k => `font-family:${SANS};font-weight:800;font-size:${108 * k}px;letter-spacing:-.045em;`,
  B: k => `font-family:${SANS};font-weight:900;font-size:${172 * k}px;letter-spacing:-.055em;line-height:.86;`,
  r: k => `font-family:${SERIF};font-weight:400;font-size:${58 * k}px;letter-spacing:.005em;`,
  R: k => `font-family:${SERIF};font-weight:400;font-size:${116 * k}px;letter-spacing:-.005em;`,
  m: k => `font-family:${MAO};font-weight:400;font-size:${76 * k}px;text-transform:uppercase;letter-spacing:.03em;`,
  M: k => `font-family:${MAO};font-weight:400;font-size:${124 * k}px;text-transform:uppercase;letter-spacing:.03em;`,
};
// tipo(p, [[['pero las','s']], [['pruebas','B']], [['demostraron','r']]], x, y, {alinha:'esq'|'centro'|'dir', k:1, cor})
//   -> g; g.ws = spans na ordem; g.at(lt, [t1, t2, ...]) revela cada span em foco (desfocado -> nítido)
function tipo(p, linhas, x, y, o = {}) {
  const al = o.alinha ?? 'esq', k = o.k ?? 1;
  const g = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;text-align:${al === 'esq' ? 'left' : al === 'dir' ? 'right' : 'center'};` +
    `color:${o.cor ?? PP.tinta};line-height:1.0;`);
  g._base = `translate(${al === 'esq' ? '0' : al === 'dir' ? '-100%' : '-50%'},0)`;
  g.style.transform = g._base;
  g.ws = [];
  linhas.forEach(ln => {
    const d = el(g, 'div', `margin:${o.entre ?? -.04}em 0 0;`);
    ln.forEach(([txt, st], j) => {   // espaço entre palavras na medida da própria palavra (o espaço do pai seria minúsculo)
      const sp = el(d, 'span', `display:inline-block;${(PP_TIPO[st] || PP_TIPO.s)(k)}opacity:0;${j < ln.length - 1 ? 'margin-right:.26em;' : ''}`, esc(txt));
      g.ws.push(sp);
    });
  });
  const maxW = o.larg ?? 940;
  g.linhas = [...g.children];
  g.linhas.forEach(d => {
    const lw = d.scrollWidth;
    if (lw > maxW) d.querySelectorAll('span').forEach(sp => { sp.style.fontSize = `${(parseFloat(sp.style.fontSize) * maxW / lw).toFixed(1)}px`; });
  });
  g.caixa = i => {   // {x0, x1, y0, y1} da linha i em coordenadas da cena (antes de qualquer tx)
    const d = g.linhas[i], wl = d.scrollWidth, x0 = al === 'esq' ? x : al === 'dir' ? x - wl : x - wl / 2;
    return { x0, x1: x0 + wl, y0: y + d.offsetTop, y1: y + d.offsetTop + d.offsetHeight };
  };
  g.at = (lt, ts, op = {}) => g.ws.forEach((sp, i) => {
    const t = ts[Math.min(i, ts.length - 1)];
    if (t === null || t === undefined) return;
    const q = E.out(clamp((lt - t) / (op.d ?? .22))), b = (1 - q) * (op.blur ?? 12);
    const out = op.out !== undefined ? clamp((lt - op.out) / .2) : 0;
    sp.style.opacity = (q * (1 - out)).toFixed(3);
    sp.style.filter = b + out * 10 > .3 ? `blur(${(b + out * 10).toFixed(1)}px)` : '';
    sp.style.transform = op.lado ? `translateX(${((1 - q) * op.lado).toFixed(1)}px)` : '';
  });
  return g;
}
// tipoFala(p, c, 'B12', 's s|B|r r', x, y, o) — as palavras do beat, na ordem, entram no tempo em que são ditas.
//   spec: linhas separadas por '|', um estilo por palavra; '-' pula a palavra; 'x2' junta 2 palavras num estilo (ex.: 'sx2|B')
//   layout: texto no terço de cima (y 420–700), imagem no meio (y 850–1450); nada importante abaixo de 1600 (interface do TikTok)
//   g.at(lt) já usa os tempos certos.  o.de = índice da 1ª palavra do beat (padrão 0); o.junta = ['B16','B17'] junta beats
function tipoFala(p, c, beat, spec, x, y, o = {}) {
  const ids = o.junta || [beat];
  const ws = ids.flatMap(id => BYID[id].words).slice(o.de ?? 0);
  const linhas = [], ts = [];
  let i = 0;
  spec.split('|').forEach(ln => {
    const L = [];
    ln.trim().split(/\s+/).forEach(tok => {
      if (!tok) return;
      if (tok === '-') { i++; return; }
      const m = tok.match(/^([a-zA-Z])x(\d+)$/), n = m ? +m[2] : 1, st = m ? m[1] : tok;
      const grupo = ws.slice(i, i + n);
      if (!grupo.length) return;
      L.push([grupo.map(w => ppLimpa(w.w)).join(' ').replace(/[.]$/, ''), st]);
      ts.push(grupo[0].s - c.t0 - .03);
      i += n;
    });
    if (L.length) linhas.push(L);
  });
  if (o.colado !== false && ts.length && ts[0] < .3) ts[0] = Math.min(ts[0], 0);   // 1ª palavra já entra no corte (sem quadro vazio)
  const g = tipo(p, linhas, x, y, o);
  const at0 = g.at;
  g.ts = ts;
  g.at = (lt, op = {}) => at0(lt, op.ts || ts.map(t => t + (op.adianta ? -op.adianta : 0)), op);
  return g;
}

// ---------- traços finos ----------
// filete(p, x0, y0, x1, y1, {w:2, c}) -> g.draw(q) cresce do centro (o.de: 'inicio')
function filete(p, x0, y0, x1, y1, o = {}) {
  const len = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
  const g = el(p, 'div', `position:absolute;left:${x0}px;top:${y0 - (o.w ?? 2.2) / 2}px;width:${len}px;height:${o.w ?? 2.2}px;background:${o.c ?? PP.tinta};` +
    `transform-origin:0 50%;transform:rotate(${ang}deg) scaleX(0);`);
  g.draw = q => { q = clamp(q); g.style.transform = `rotate(${ang}deg) ${o.de === 'inicio' ? '' : `translateX(${(len * (1 - q) / 2).toFixed(1)}px)`} scaleX(${q.toFixed(4)})`; };
  return g;
}
// seta à mão (fina, curva, com ponta): seta(svg, x0, y0, x1, y1, {curva:.35, c, w:3.2}) -> g.draw(q)
function seta(svg, x0, y0, x1, y1, o = {}) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, k = o.curva ?? .35;
  const cx = mx - dy * k, cy = my + dx * k;
  const g = sv(svg, 'g', {});
  const st = { fill: 'none', stroke: o.c ?? PP.tinta, 'stroke-width': o.w ?? 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  const corpo = prep(sv(g, 'path', { d: `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`, ...st }));
  const a = Math.atan2(y1 - cy, x1 - cx), L = o.ponta ?? 22;
  const ponta = prep(sv(g, 'path', { d: `M${x1 - L * Math.cos(a - .45)},${y1 - L * Math.sin(a - .45)} L${x1},${y1} L${x1 - L * Math.cos(a + .45)},${y1 - L * Math.sin(a + .45)}`, ...st }));
  g.draw = q => { draw(corpo, clamp(q / .8)); draw(ponta, clamp((q - .8) / .2)); };
  return g;
}
// sublinhado à mão: sublinha(svg, x0, x1, y, {c, w}) -> g.draw(q)
function sublinha(svg, x0, x1, y, o = {}) {
  const n = 6, pts = [];
  for (let i = 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), y + Math.sin(i * 1.7 + (o.seed ?? 1)) * 3 + (i / n) * (o.cai ?? 4)]);
  const d = 'M' + pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' L');
  const pth = prep(sv(svg, 'path', { d, fill: 'none', stroke: o.c ?? PP.tinta, 'stroke-width': o.w ?? 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return { draw: q => draw(pth, q), el: pth };
}

// ---------- imagens em retícula (render/assets/r_<nome>.png do reticula.py) ----------
// ret(p, 'r_x', cx, cy, w, {sombra:true, rot}) -> e; e.at(lt, t, {k:'foco'|'cresce'|'sobe'|'lado'|'brota', d, dx, dy, out})
function ret(p, nome, cx, cy, w, o = {}) {
  const a = AS(nome);
  if (!a) throw new Error(`asset ${nome} não existe (rode reticula.py e make_assets.py)`);
  const h = w * a.h / a.w;
  const e = box(p, cx, cy, w, h, 'opacity:0;');
  e.img = el(e, 'img', `position:absolute;inset:0;width:100%;height:100%;${o.sombra === false ? '' : 'filter:drop-shadow(0 18px 22px rgba(40,30,20,.28));'}`);
  e.img.decoding = 'sync'; e.img.src = a.src; e.w = w; e.h = h; e._rot = o.rot ?? 0;
  e.at = (lt, t, op = {}) => entra(e, lt, t, op);
  return e;
}
// entrada padrão do formato: 'foco' (desfocado e um pouco maior -> nítido), 'cresce' (do centro, escala 0.6 -> 1 com foco),
// 'sobe'/'desce'/'lado' (desliza com borrão de movimento), 'brota' (escala 0 -> 1 com mola leve)
function entra(e, lt, t, op = {}) {
  const k = op.k ?? 'foco', d = op.d ?? .35;
  if (lt < t) { e.style.opacity = 0; return 0; }
  const u = clamp((lt - t) / d), q = E.out5(u);
  let x = 0, y = 0, s = 1, b = 0;
  if (k === 'foco') { s = lerp(1.06, 1, q); b = (1 - q) * 16; }
  else if (k === 'cresce') { s = lerp(.62, 1, q); b = (1 - q) * 12; }
  else if (k === 'brota') { s = lerp(0, 1, E.back(u)); }
  else if (k === 'sobe') { y = (op.dy ?? 260) * (1 - q); b = Math.sin(Math.PI * Math.min(u, 1)) * 10; }
  else if (k === 'desce') { y = -(op.dy ?? 260) * (1 - q); b = Math.sin(Math.PI * Math.min(u, 1)) * 10; }
  else if (k === 'lado') { x = (op.dx ?? 520) * (1 - q); b = (1 - q) * 22; }
  const out = op.out !== undefined && lt > op.out ? clamp((lt - op.out) / (op.od ?? .22)) : 0;
  const deriva = op.deriva ?? .02;   // nada fica parado: crescimento lento depois de entrar
  tx(e, { x: x + (op.x ?? 0), y: y + (op.y ?? 0) - out * (op.oy ?? 0), s: s * (op.s ?? 1) * (1 + deriva * clamp((lt - t - d) / 3)), o: Math.min(clamp(u * 2.2), 1 - out) });
  const bb = b + out * 14;
  e.style.filter = bb > .3 ? `blur(${bb.toFixed(1)}px)` : '';
  return u;
}
// cartão: retângulo com a foto em retícula (foto de fundo escuro vira o "cartão preto"), abre a partir de uma linha
// cartao(p, 'r_x', cx, cy, w, h, {fundo:'transparent'|'#111', pos:'50% 40%'}) -> g; g.abre(lt, t) (linha 0,1 s -> abre 0,28 s)
function cartao(p, nome, cx, cy, w, h, o = {}) {
  const a = AS(nome);
  const g = box(p, cx, cy, w, h, `overflow:hidden;background:${o.fundo ?? 'transparent'};opacity:0;${o.sombra === false ? '' : 'box-shadow:0 22px 36px rgba(30,22,14,.25);'}`);
  g.img = el(g, 'img', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${o.pos ?? '50% 50%'};transform-origin:50% 50%;`);
  g.img.decoding = 'sync'; g.img.src = a.src;
  g.linha = box(p, cx, cy, w, 6, `background:${PP.tinta};opacity:0;`);
  g.abre = (lt, t, op = {}) => {
    const u1 = clamp((lt - t) / .1), u2 = clamp((lt - t - .1) / (op.d ?? .28)), q = E.out5(u2);
    g.linha.style.opacity = lt >= t && u2 < 1 ? 1 : 0;
    g.linha.style.transform = `scaleX(${E.out(u1).toFixed(3)})`;
    g.style.opacity = u2 > 0 ? 1 : 0;
    g.style.transform = `scaleY(${Math.max(.003, q).toFixed(4)})`;
    const z = (op.zoom ?? .14) * (1 - q) + (op.deriva ?? .05) * clamp((lt - t) / 3);
    g.img.style.transform = `scale(${(1 + z).toFixed(4)})`;
    g.img.style.filter = u2 < 1 ? `blur(${((1 - q) * 10).toFixed(1)}px)` : '';
  };
  return g;
}
// barra preta (mesa/sombra/buraco) de onde o objeto sai: barra(p, x, y, w, h) + emerge(obj, lt, t, {dy}) com corte na borda de cima
function barra(p, x, y, w, h, o = {}) {
  return el(p, 'div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${o.c ?? PP.tinta};${o.r ? `border-radius:${o.r};` : ''}`);
}
function emerge(e, yCorte, lt, t, o = {}) {   // e = elemento posicionado; sobe de trás do corte (clip-path)
  const u = clamp((lt - t) / (o.d ?? .45)), q = E.out5(u), dy = (o.dy ?? 320) * (1 - q);
  e.style.opacity = lt >= t ? 1 : 0;
  const top = parseFloat(e.style.top), hh = e.h || e.offsetHeight;
  const corte = Math.max(0, yCorte - (top + dy));             // quanto do elemento fica acima do corte
  e.style.clipPath = `inset(0 0 ${Math.max(0, hh - corte).toFixed(1)}px 0)`;
  tx(e, { y: dy });
}

// ---------- números ----------
// roleta de dígitos (ano/valor rolando com borrão vertical): roleta(p, cx, cy, {de:'2025', para:'1948', s:96, peso:800})
//   g.at(lt, t0, d=.7) — cada dígito gira até o novo valor (sempre para a frente; dá a volta se precisar)
//   sequência: roleta(p, cx, cy, {seq: ['4', '6', '8']}) + g.at(lt, [t1, t2], d) — rola 4 -> 6 em t1 e 6 -> 8 em t2
function roleta(p, cx, cy, o = {}) {
  const seq = (o.seq || [o.de ?? '2025', o.para ?? '1948']).map(String), s = o.s ?? 96;
  const n = Math.max(...seq.map(v => v.length)), V = seq.map(v => v.padStart(n, ' '));
  const g = el(p, 'div', `position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);display:flex;font-family:${SANS};font-weight:${o.peso ?? 800};` +
    `font-size:${s}px;letter-spacing:-.04em;color:${o.cor ?? PP.tinta};line-height:1.1;`);
  g._base = 'translate(-50%,-50%)';
  g.cols = [...Array(n)].map((_, i) => {
    const chs = V.map(v => v[i]), dig = chs.every(ch => /\d/.test(ch));
    const col = el(g, 'div', 'position:relative;height:1.1em;overflow:hidden;');
    const fita = el(col, 'div', 'position:relative;');
    let pos = [];
    if (dig) { pos = [+chs[0]]; for (let k = 1; k < chs.length; k++) { const a = +chs[k - 1], b = +chs[k]; pos.push(pos[k - 1] + ((b - a + 10) % 10 || (a === b ? 0 : 10))); } }
    else pos = chs.map((_, k) => k);
    const fim = dig ? Math.max(...pos) + 2 : chs.length;
    for (let k = 0; k < fim; k++) el(fita, 'div', 'height:1.1em;text-align:center;', dig ? String(k % 10) : (chs[k] === ' ' ? '&nbsp;' : chs[k]));
    return { fita, pos };
  });
  g.at = (lt, ts, d = .7) => {
    const T = Array.isArray(ts) ? ts : [ts];
    g.cols.forEach((c, i) => {
      let p = c.pos[0], vel = 0;
      T.forEach((t, k) => {
        const u = clamp((lt - t - i * .06) / d);
        if (u > 0) { p = lerp(c.pos[k], c.pos[k + 1], E.inOut(u)); vel = Math.abs(c.pos[k + 1] - c.pos[k]) * Math.sin(Math.PI * u) / d; }
      });
      c.fita.style.transform = `translateY(${(-p * 1.1).toFixed(3)}em)`;
      c.fita.style.filter = vel > .5 ? `blur(${Math.min(9, vel * .6).toFixed(1)}px)` : '';
    });
  };
  return g;
}
// número "digitado" (9 -> 99 -> 99,9 -> 99,99%): digita(e, '99,99%', lt, t0, cps=8)
function digita(e, txt, lt, t0, cps = 8) {
  const n = Math.max(0, Math.min(txt.length, Math.floor((lt - t0) * cps)));
  const s = txt.slice(0, n);
  if (e._txt !== s) { e.textContent = s; e._txt = s; }
}

// ---------- ondas e som ----------
// onda grossa desenhada (sonda, vibração): onda(svg, x0, y, x1, {amp:40, ciclos:4, w:22}) -> g.draw(q)
function onda(svg, x0, y, x1, o = {}) {
  const n = 80, amp = o.amp ?? 40, cic = o.ciclos ?? 4, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(x0, x1, u), y + Math.sin(u * cic * Math.PI * 2) * amp * (o.cresce ? u : 1)]); }
  const pth = prep(sv(svg, 'path', { d: 'M' + pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' L'), fill: 'none', stroke: o.c ?? PP.tinta, 'stroke-width': o.w ?? 22, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  return { draw: q => draw(pth, q), el: pth };
}
// caixinha com forma de onda de áudio desenhando (borda fina): ondaCaixa(p, cx, cy, w, h, {tema:'claro'|'escuro', seed}) -> g.at(lt, t, d)
function ondaCaixa(p, cx, cy, w, h, o = {}) {
  const esc_ = o.tema === 'escuro';
  const g = box(p, cx, cy, w, h, `border:2px solid ${esc_ ? 'rgba(255,255,255,.55)' : 'rgba(20,20,20,.45)'};background:${esc_ ? PP.tinta : 'rgba(240,234,224,.55)'};opacity:0;` +
    `${esc_ ? 'box-shadow:0 18px 30px rgba(0,0,0,.35);' : ''}`);
  const s = svgAbs(g, 0, 0, w, h);
  const pts = [], n = 120;
  for (let i = 0; i <= n; i++) {
    const u = i / n, env = Math.pow(Math.sin(Math.PI * u), .6) * (.35 + .65 * Math.abs(Math.sin(u * 7.3 + (o.seed ?? 1)) * Math.sin(u * 2.1)));
    const a = (hrand(i * 3.7 + (o.seed ?? 1)) - .5) * 2 * env * h * .38;
    pts.push([w * .06 + u * w * .88, h / 2 + (i % 2 ? a : -a)]);
  }
  const pth = prep(sv(s, 'path', { d: 'M' + pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' L'), fill: 'none', stroke: esc_ ? '#f2efe8' : PP.tinta, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  g.at = (lt, t, d = .5) => { entra(g, lt, t, { k: 'foco', d: .25 }); draw(pth, clamp((lt - t) / d)); };
  return g;
}

// ---------- forma que se desenha e se enche de foto (escudo, círculo) ----------
// forma(p, 'r_x', cx, cy, w, {tipo:'escudo'|'circulo'|'arco'}) -> g.at(lt, t): contorno desenha (0,4 s) e a foto entra recortada
function forma(p, nome, cx, cy, w, o = {}) {
  const h = o.h ?? w * 1.12, g = box(p, cx, cy, w, h, '');
  const paths = {
    escudo: `M2,2 L${w - 2},2 L${w - 2},${h * .55} Q${w - 2},${h * .82} ${w / 2},${h - 2} Q2,${h * .82} 2,${h * .55} Z`,
    circulo: `M${w / 2},2 A${w / 2 - 2},${h / 2 - 2} 0 1 1 ${w / 2 - .1},2 Z`,
    arco: `M2,${h - 2} L2,${w / 2} A${w / 2 - 2},${w / 2 - 2} 0 0 1 ${w - 2},${w / 2} L${w - 2},${h - 2} Z`,
  };
  const d = paths[o.tipo ?? 'escudo'];
  const cid = uid('fm');
  const s = svgAbs(g, 0, 0, w, h);
  const cp = sv(sv(s, 'defs'), 'clipPath', { id: cid }); sv(cp, 'path', { d });
  const im = sv(s, 'image', { href: AS(nome).src, x: 0, y: 0, width: w, height: h, preserveAspectRatio: 'xMidYMid slice', 'clip-path': `url(#${cid})` });
  const ct = prep(sv(s, 'path', { d, fill: o.cheio ?? 'rgba(20,20,20,.08)', stroke: PP.tinta, 'stroke-width': 3 }));
  g.at = (lt, t) => {
    draw(ct, clamp((lt - t) / .4)); ct.style.fill = 'none';
    const q = E.out(clamp((lt - t - .3) / .35));
    im.style.opacity = q.toFixed(3); im.style.filter = q < 1 ? `blur(${((1 - q) * 10).toFixed(1)}px)` : '';
    g.style.transform = `scale(${(1 + .03 * clamp((lt - t) / 3)).toFixed(4)})`;
  };
  return g;
}

// ---------- mundo escuro ----------
// poster(r, S, {moldura:true}) — fundo preto com grão + moldura fina creme (o "pôster" da referência)
function poster(r, S, o = {}) {
  const g = el(r, 'div', `position:absolute;left:-135px;top:-240px;width:1350px;height:2400px;background:${PP.preto} url(${AS('t_preto') ? AS('t_preto').src : ''}) center/cover;`);
  if (o.moldura !== false) el(r, 'div', `position:absolute;left:${o.mx ?? 96}px;top:${o.my ?? 300}px;right:${o.mx ?? 96}px;bottom:${o.mb ?? 420}px;border:2.5px solid rgba(236,214,190,.75);`);
  if (S) { S.grao = o.grao ?? .2; S.vig = 0; S.cap = S.cap || { modo: 'none' }; }
  return g;
}
function escuro(r, S, o = {}) { const g = poster(r, S, { moldura: false, grao: o.grao ?? .22 }); if (S) S.cap = S.cap || { modo: 'escuro' }; return g; }
// imagem duotone (pêssego sobre preto; reticula.py modo duo): duo(p, 'r_x', cx, cy, w) -> e.at(...)
const duo = (p, nome, cx, cy, w, o = {}) => ret(p, nome, cx, cy, w, { sombra: false, ...o });

// ícones brancos chapados com brilho (desenhados aqui; viewBox 100x100). Cores: fundo = PP.preto para os vincos.
const PP_ICONES = {
  cerebro: (c, f) => `<path fill="${c}" d="M30 74c-12 1-20-8-18-18-7-5-6-18 3-22 0-11 11-17 20-13 4-9 18-11 25-4 8-5 21-1 23 9 10 0 17 10 13 19 6 6 3 17-6 19 0 9-9 15-18 12-3 5-9 6-13 3-5 4-12 3-14-2-3 1-6 0-8-3z"/>` +
    `<path fill="none" stroke="${f}" stroke-width="3.2" stroke-linecap="round" d="M48 20c-4 6 0 12 6 12M30 34c6-2 11 2 11 8M62 30c6 0 10 6 7 12M22 52c6-3 13 0 14 7M44 48c5-4 12-2 14 4M70 50c-4 4-3 10 2 13M38 66c4-4 10-4 13 0M58 64c3-3 9-2 11 2M50 74c0 5 3 10 8 12"/>` +
    `<path fill="${c}" d="M55 78c3 8 4 12 10 16l-8 1c-4-4-6-9-7-15z"/>`,
  nota: c => `<ellipse cx="34" cy="76" rx="15" ry="11" transform="rotate(-22 34 76)" fill="${c}"/><rect x="44" y="16" width="6" height="60" fill="${c}"/><path fill="${c}" d="M50 16c8 10 22 12 22 30-3-9-11-12-22-14z"/>`,
  notas: c => `<ellipse cx="26" cy="78" rx="13" ry="9.5" transform="rotate(-22 26 78)" fill="${c}"/><ellipse cx="70" cy="70" rx="13" ry="9.5" transform="rotate(-22 70 70)" fill="${c}"/>` +
    `<rect x="35" y="22" width="5.5" height="56" fill="${c}"/><rect x="79" y="14" width="5.5" height="56" fill="${c}"/><path fill="${c}" d="M35 22 84 14v11L35 33z"/>`,
  olho: (c, f) => `<path fill="${c}" d="M4 50C20 24 80 24 96 50 80 76 20 76 4 50z"/><circle cx="50" cy="50" r="17" fill="${f}"/><circle cx="50" cy="50" r="8" fill="${c}"/>`,
  lampada: (c, f) => `<path fill="${c}" d="M50 8c-18 0-30 13-30 29 0 12 7 18 12 25 3 4 4 8 4 12h28c0-4 1-8 4-12 5-7 12-13 12-25C80 21 68 8 50 8z"/><rect x="36" y="78" width="28" height="6" rx="2" fill="${c}"/><rect x="39" y="87" width="22" height="6" rx="3" fill="${c}"/>`,
  raio: c => `<path fill="${c}" d="M58 4 18 56h26l-8 40 46-56H54z"/>`,
  coracao: c => `<path fill="${c}" d="M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56z"/>`,
  cadeado: (c, f) => `<path fill="none" stroke="${c}" stroke-width="9" d="M30 46V32a20 20 0 0 1 40 0v14"/><rect x="18" y="44" width="64" height="48" rx="7" fill="${c}"/><circle cx="50" cy="64" r="7" fill="${f}"/><rect x="47" y="66" width="6" height="14" fill="${f}"/>`,
  cadeadoAberto: (c, f) => `<path fill="none" stroke="${c}" stroke-width="9" d="M30 46V24a20 20 0 0 1 40 0"/><rect x="18" y="44" width="64" height="48" rx="7" fill="${c}"/><circle cx="50" cy="64" r="7" fill="${f}"/><rect x="47" y="66" width="6" height="14" fill="${f}"/>`,
  etiqueta: (c, f) => `<path fill="${c}" d="M8 44 44 8h44v44L52 88a6 6 0 0 1-8 0L8 52a6 6 0 0 1 0-8z"/><circle cx="72" cy="24" r="7" fill="${f}"/>`,
  moeda: (c, f) => `<circle cx="50" cy="50" r="42" fill="${c}"/><circle cx="50" cy="50" r="32" fill="none" stroke="${f}" stroke-width="3"/><text x="50" y="64" text-anchor="middle" font-family="Inter" font-weight="800" font-size="40" fill="${f}">$</text>`,
  pessoa: c => `<circle cx="50" cy="28" r="17" fill="${c}"/><path fill="${c}" d="M18 92c0-24 14-40 32-40s32 16 32 40z"/>`,
  relogio: (c, f) => `<circle cx="50" cy="50" r="42" fill="${c}"/><path stroke="${f}" stroke-width="6" stroke-linecap="round" d="M50 50V24M50 50l16 10"/>`,
  casa: c => `<path fill="${c}" d="M50 8 6 46h12v44h24V64h16v26h24V46h12z"/>`,
  sobe: c => `<path fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M8 80 36 52l18 16 36-40"/><path fill="${c}" d="M92 18 66 22l22 22z"/>`,
  desce: c => `<path fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" d="M8 22l28 28 18-16 36 40"/><path fill="${c}" d="M92 84 66 80l22-22z"/>`,
};
// icone(p, 'cerebro', cx, cy, 150, {cor, brilho:1}) -> e (entra com e.at(lt, t, {k:'foco'})); e.troca('olho') muda o desenho
function icone(p, nome, cx, cy, tam, o = {}) {
  const e = box(p, cx, cy, tam, tam, 'opacity:0;');
  const cor = o.cor ?? PP.branco, fundo = o.fundo ?? PP.preto, br = o.brilho ?? 1;
  e.svg = el(e, 'div', `position:absolute;inset:0;${br ? `filter:drop-shadow(0 0 ${8 * br}px rgba(255,255,255,.6)) drop-shadow(0 0 ${26 * br}px rgba(255,255,255,.28));` : ''}`);
  e.troca = n => { e.nome = n; e.svg.innerHTML = `<svg viewBox="0 0 100 100" width="${tam}" height="${tam}" style="overflow:visible">${PP_ICONES[n](cor, fundo)}</svg>`; };
  e.troca(nome);
  e.at = (lt, t, op = {}) => entra(e, lt, t, { k: 'foco', ...op });
  return e;
}
// derrete/deforma um ícone (a nota "derretendo"): derrete(e, lt, t, d) — turbulência SVG animada
function derrete(e, lt, t, d = .6) {
  if (!e._fid) {
    e._fid = uid('dr');
    const s = sv(document.body, 'svg', { width: 0, height: 0, style: 'position:absolute' });
    const f = sv(sv(s, 'defs'), 'filter', { id: e._fid, x: '-40%', y: '-40%', width: '180%', height: '180%' });
    sv(f, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '.035', numOctaves: 2, seed: 3, result: 'n' });
    e._dm = sv(f, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' });
  }
  const q = clamp((lt - t) / d);
  e._dm.setAttribute('scale', (E.inOut(q) * 60).toFixed(1));
  e.style.filter = q > 0 ? `url(#${e._fid})` : '';
}
// rede de pontos e linhas finas (neurônios/caminhos): rede(p, cx, cy, raio, n=9, {seed}) -> g.at(lt, t, d) desenha nó a nó
function rede(p, cx, cy, raio, n = 9, o = {}) {
  const s = svgAbs(p, 0, 0, W, H, `filter:drop-shadow(0 0 6px rgba(255,255,255,.5));`);
  const nos = [...Array(n)].map((_, i) => { const a = hrand(i * 7.1 + (o.seed ?? 1)) * Math.PI * 2, r = raio * (.25 + .75 * hrand(i * 3.3 + (o.seed ?? 1))); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * .8]; });
  const lig = [];
  nos.forEach((a, i) => { const j = (i + 1 + Math.floor(hrand(i * 5.5) * 2)) % n; lig.push([a, nos[j]]); });
  const ls = lig.map(([a, b]) => prep(sv(s, 'path', { d: `M${a[0]},${a[1]} L${b[0]},${b[1]}`, stroke: o.c ?? PP.branco, 'stroke-width': 2, opacity: .8 })));
  const cs = nos.map(([x, y]) => sv(s, 'circle', { cx: x, cy: y, r: o.r ?? 7, fill: o.c ?? PP.branco, opacity: 0 }));
  s.at = (lt, t, d = 1.2) => {
    cs.forEach((c, i) => { c.setAttribute('opacity', E.out(clamp((lt - t - i * d / n) / .2)).toFixed(3)); });
    ls.forEach((l, i) => draw(l, clamp((lt - t - (i + .5) * d / n) / .3)));
  };
  return s;
}

// ---------- final opcional: cartão de perfil REAL em papel (só se a fala pedir para seguir) ----------
// fimPerfil(['B40','B41'], {perfil:'perfil_felipedantasf', toque:['B41','seguir']}) — apresentador continua falando; o cartão
// sobe de baixo (sem cobrir o rosto) com o print real do perfil (asset copiado da biblioteca do kit) e o botão Seguir -> Seguindo.
function fimPerfil(beats, o = {}) {
  presPunch(beats, {
    ...o,
    build(L, S, c) {
      const last = beats[beats.length - 1], [tb, tw] = o.toque || [last, 'seguir'];
      S.tT = c.w(tb, tw); S.tIn = Math.max(.3, S.tT - 1.1);
      S.cap = lt => lt >= S.tIn - .1 ? { modo: 'none' } : { modo: 'peito', y: o.capY ?? 1430 };
      const a = AS(o.perfil || 'perfil_felipedantasf');
      const cw = 900, ch = a ? cw * a.h / a.w + 210 : 520;
      S.card = box(L, 540, 1920 - ch / 2 - 150, cw + 60, ch, `background:${PP.papel} url(${AS('t_amassado') ? AS('t_amassado').src : ''}) center/cover;box-shadow:0 30px 60px rgba(0,0,0,.45);opacity:0;`);
      if (a) { const im = el(S.card, 'img', `position:absolute;left:30px;top:30px;width:${cw}px;mix-blend-mode:multiply;`); im.src = a.src; }
      S.btn = el(S.card, 'div', `position:absolute;left:50%;bottom:44px;transform:translateX(-50%);min-width:420px;padding:22px 40px;border-radius:999px;text-align:center;` +
        `font-family:${SANS};font-weight:800;font-size:54px;letter-spacing:-.03em;background:${PP.tinta};color:#fff;`, 'Seguir');
      cue(c, 'whoosh', S.tIn, { g: .3, d: .3 }); cue(c, 'click', S.tT, { g: .55 });
      if (o.build2) o.build2(L, S, c);
    },
    update(S, c) {
      const lt = c.lt;
      entra(S.card, lt, S.tIn, { k: 'sobe', dy: 700, d: .45 });
      const on = lt >= S.tT;
      S.btn.textContent = on ? 'Seguindo ✓' : 'Seguir';
      S.btn.style.background = on ? '#e9e4da' : PP.tinta; S.btn.style.color = on ? PP.tinta : '#fff';
      S.btn.style.transform = `translateX(-50%) scale(${(1 - .08 * Math.sin(Math.PI * clamp((lt - S.tT + .08) / .2))).toFixed(3)})`;
    },
  });
}
