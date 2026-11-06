// ============================================================================
//  edit-investigativa — biblioteca do formato "dossiê investigativo" (referência: TikTok @samuelszuchan, out/2026)
//  1ª parte do render/scenes.js (work/<prefixo>_a.js). Precisa do motor do Kit_Edicao_Vox_v2.
//
//  Tudo é preto e branco, menos o VERMELHO (#e41818) e o apresentador. Corte seco entre cenas; o "baque" grave de
//  cada corte e a cama escura vêm do trilha_inv.py. Nada fica parado: a câmera viaja dentro de cada cena.
//   1. apresentador colorido (tom frio + luz vermelha lateral), entra com punch-out de ~1,4x       presInv()
//   2. tipografia no escuro: serifa vermelha/branca + sans pequena + tracejados, câmera viajando   palco(), linha(), tracejado()
//   3. mural de provas: fotos P&B com percevejo e fio vermelho, câmera 3D com foco                mural(), muralCena()
//   4. documento P&B em perspectiva, faixa de foco, marca-texto vermelho no número dito          docCena()
//   5. recortes de pessoas P&B em retícula (tarja nos olhos até o nome), nome com tracejado       recorte(), nomeado()
//   6. TV de tubo no quarto escuro · mapa escuro com a região em vermelho · foto de arquivo · site tvCena(), mapaCena(), fotoCena(), siteCena()
//   7. legenda: UMA palavra por vez, serifa branca no centro (y 1371); some quando a tela já é a fala (S.cap = {modo: 'none'})
//   8. MOTOR "GOLPE" (02/11/2026, portado da vox-edit2 depois do A/B aprovado): a câmera chicoteia pela cena (plano novo a
//      cada ~0,9 s amarrado à palavra), blur direcional só no pico, mola nas entradas, tranco no baque do corte e quando um
//      item é preso. Liga por cena: camMove: camG(c => ({planos, golpes})) ou a opção golpes de muralCena/docCena/siteCena/
//      tvCena/mapaCena/fotoCena. Sem golpes, a cena fica como era (camOlha/ivKf).            ivGolpes(), camG(), IV_GOLPE, IV_MOLA
//   9. MOTOR "FOCO" (03/11/2026, aprovado na vox-edit2: "B aprovado, aplica"; padrão de cena NOVA): o olho acompanha. Um assunto
//      por vez, grande e no centro; um texto por vez, FIXO na tela (a tipografia e o número ficam fora da câmera: não andam nem
//      borram); a câmera chega já no assunto e só aproxima (no máximo um movimento por frase); o assunto seguinte pousa no mesmo
//      lugar; mural com foco num item por vez e fio desenhando com a câmera parada; documento com salto em foco (rack) de um
//      trecho marcado ao outro. Liga por cena: camMove: camF(c => focos) ou a opção focos das cenas prontas; ivFrases (tipografia),
//      ivNumero, ivAssuntos. Seção no fim do arquivo.                                         ivFocos(), camF(), IV_F
// ============================================================================
const IV = { preto: '#050505', fundo: '#0f0f0f', branco: '#e6e5e8', verm: '#e41818', marca: '#eb2528', fio: '#c8161c',
  papel: '#dcdbdd', cinza: '#8e8d91', tinta: '#141414' };
const SERIF = 'TimesInv', SANS = 'Inter', IV_CX = .86;   // a serifa da referência = Times condensada a 86%
const IV_BRILHO = {
  branco: '0 0 2px rgba(255,255,255,.45), 0 0 16px rgba(255,255,255,.30), 0 0 42px rgba(255,255,255,.12), -1.5px 0 0 rgba(255,50,70,.22), 1.5px 0 0 rgba(60,210,255,.18)',
  verm: '0 0 3px rgba(255,40,40,.55), 0 0 22px rgba(228,24,24,.55), 0 0 60px rgba(228,24,24,.25), -1.5px 0 0 rgba(255,140,140,.16), 1.5px 0 0 rgba(60,210,255,.12)',
  legenda: '0 2px 7px rgba(0,0,0,.62), 0 0 20px rgba(0,0,0,.40), 0 0 2px rgba(255,255,255,.22)',
  doc: '0 2px 6px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.65), 0 0 46px rgba(0,0,0,.40)',
  // motor foco: palavra-chave da legenda em vermelho (o destaque fica na própria legenda, sem um 2º texto repetindo a fala)
  chave: '0 2px 7px rgba(0,0,0,.70), 0 0 20px rgba(0,0,0,.40), 0 0 16px rgba(228,24,24,.45), 0 0 2px rgba(255,90,90,.35)',
};
const IV_STOP = new Set(('a o as os um uma uns umas de do da dos das em no na nos nas num numa e que para pra por pelo pela ' +
  'pelos pelas com sem se ao aos ja so mas ou nem me te lhe eu ele ela eles elas voce isso esse essa este esta isto foi vai ser sao ' +
  'tem ha ate mais muito como quando onde quem qual meu minha seu sua la ca ai tao tambem nao the of and in on at to').split(' '));
const IV_GRANDEZA = new Set('mil milhao milhoes bilhao bilhoes trilhao trilhoes reais real dolares dolar euros yuan por cento anos dias horas km quilometros'.split(' '));
const IV_MESES = new Set('janeiro fevereiro marco abril maio junho julho agosto setembro outubro novembro dezembro'.split(' '));
// grupos forçados na legenda (texto normalizado, palavras separadas por espaço): IV_UNE.add('bolsa familia')
const IV_UNE = new Set();
// motor foco: palavras-chave da legenda em vermelho no vídeo todo (normalizadas): IV_CHAVE.add('bilhoes'); por cena: S.cap.chave
const IV_CHAVE = new Set();

// ---------- medidas e serifa condensada ----------
const _ivC = document.createElement('canvas').getContext('2d');
function ivLarg(txt, px, fam = SERIF, peso = 400, ls = 0) { _ivC.font = `${peso} ${px}px ${fam}`; return _ivC.measureText(txt).width + ls * px * txt.length; }
// palavra em serifa condensada: o span tem a largura já condensada; o texto dentro é espremido (scaleX .86)
function ivSerifSpan(p, txt, px, css = '', letras = false) {
  const ls = -.012, w = ivLarg(txt, px, SERIF, 400, ls) * IV_CX;
  const s = el(p, 'span', `display:inline-block;width:${w.toFixed(1)}px;white-space:nowrap;vertical-align:baseline;${css}`);
  const inn = el(s, 'span', `display:inline-block;transform:scaleX(${IV_CX});transform-origin:0 50%;font-family:${SERIF};font-weight:400;font-size:${px}px;letter-spacing:${ls}em;line-height:1;`);
  if (letras) s.letras = [...txt].map(ch => el(inn, 'span', 'display:inline-block;', ch === ' ' ? '&nbsp;' : esc(ch)));
  else inn.textContent = txt;
  s.inn = inn; s.larg = w;
  return s;
}

// ---------- grão e vinheta por cena (S.grao 0..1, S.vig 0..1), como no edit-papel ----------
let _ivGrao = null;
function ivGraoTex() {
  if (_ivGrao) return _ivGrao;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  const c2 = document.createElement('canvas'); c2.width = c2.height = 256;                 // grão fino mas não "sal e pimenta"
  const x2 = c2.getContext('2d'); x2.filter = 'blur(0.45px)'; x2.drawImage(c, 0, 0);
  return (_ivGrao = c2.toDataURL());
}

// ---------- legenda: UMA palavra por vez (número + grandeza, data e nome próprio ficam juntos) ----------
let IV_BLOCOS = null;
function ivBlocos() {
  if (IV_BLOCOS) return IV_BLOCOS;
  const all = [];
  TIMING.beats.forEach(b => b.words.forEach(w => all.push(w)));
  const n = w => norm(w.w), cap = w => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w.w), fimFrase = w => /[.;:?!]$/.test(w.w);
  const L = [];
  for (let i = 0; i < all.length;) {
    const g = [all[i]]; let j = i + 1;
    const une = () => { g.push(all[j]); j++; };
    // grupos forçados
    for (let k = 4; k >= 2; k--) if (j - 1 + k <= all.length && IV_UNE.has(all.slice(i, i + k).map(n).join(' '))) { while (g.length < k) une(); break; }
    if (g.length === 1) {
      const w = all[i];
      if (/\d/.test(w.w) && !fimFrase(w)) {                       // 3 bilhões · 80% · 20 de dezembro de 2021 · R$ 15
        if (all[j] && /^(de|do)$/i.test(all[j].w) && all[j + 1] && IV_MESES.has(n(all[j + 1]))) {
          une(); une(); if (all[j] && /^de$/i.test(all[j].w) && all[j + 1] && /^\d{4}/.test(all[j + 1].w)) { une(); une(); }
        }
        while (all[j] && g.length < 3 && !fimFrase(g[g.length - 1]) && !/,$/.test(g[g.length - 1].w) && IV_GRANDEZA.has(n(all[j]))) une();
        if (g.length > 1 && !fimFrase(g[g.length - 1]) && all[j] && /^de$/i.test(all[j].w) && all[j + 1] && /^(reais|dolares|euros)/.test(n(all[j + 1]))) { une(); une(); }
      } else if (/^R\$|^US\$|^\$/.test(w.w) && all[j] && /\d/.test(all[j].w)) {
        une(); while (all[j] && g.length < 3 && !fimFrase(g[g.length - 1]) && IV_GRANDEZA.has(n(all[j]))) une();
      } else if (cap(w) && !IV_STOP.has(n(w)) && !fimFrase(w) && !/,$/.test(w.w)) {   // nome próprio composto
        while (all[j] && g.length < 3 && cap(all[j]) && !IV_STOP.has(n(all[j])) && !fimFrase(g[g.length - 1]) && !/,$/.test(g[g.length - 1].w)) une();
      }
    }
    L.push({ words: g }); i = j;
  }
  const cortes = SCENES.map(x => x.t0).filter(t => t > 0);
  L.forEach(c => { c.s = c.words[0].s - .02; });
  L.forEach((c, i) => {
    const nx = L[i + 1], fim = c.words[c.words.length - 1].e, ult = c.words[c.words.length - 1].s;
    const ct = cortes.find(t => t > ult + .05);
    c.e = Math.min(nx ? nx.s : fim + .7, fim + .6, ct ?? 1e9);
  });
  return (IV_BLOCOS = L);
}
let _ivKey = '';
renderCaptions = function (t) {
  const box = $('cap'), S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  const cfg = typeof S.cap === 'function' ? S.cap(t - CUR_SCENE.t0) : (S.cap || { modo: 'palavra' });
  const gr = $('grain'), vg = $('vig');
  // motor foco: grão mais baixo (ambiente que não disputa o olho)
  if (gr) { if (!gr._ok) { gr.style.backgroundImage = `url(${ivGraoTex()})`; gr._ok = 1; } gr.style.opacity = ((S.grao ?? .2) * (S._foco ? IV_F.grao : 1)).toFixed(3); }
  if (vg) vg.style.opacity = (S.vig ?? .5).toFixed(3);
  if (cfg.modo === 'none') { box.style.opacity = 0; return; }
  // motor foco: a legenda some enquanto uma frase/número FIXO é o assunto (S._capOculta = [[t0, t1]], tempos locais)
  const lt = window.CUR_SCENE ? t - CUR_SCENE.t0 : t, oc = S._capOculta || [];
  if (oc.some(([a, z]) => lt >= a && lt < z)) { box.style.opacity = 0; return; }
  const L = ivBlocos();
  let idx = -1;
  for (let i = 0; i < L.length; i++) if (t >= L[i].s && t < L[i].e) { idx = i; break; }
  if (idx < 0) { box.style.opacity = 0; return; }
  const fs = cfg.s ?? 66, txt = L[idx].words.map(w => w.w).join(' ');
  const ch = cfg.chave || IV_CHAVE.size ? L[idx].words.some(w => IV_CHAVE.has(norm(w.w)) || (cfg.chave || []).some(k => norm(w.w) === norm(k))) : false;
  const key = `${idx}|${fs}|${cfg.cor || ''}|${cfg.doc ? 1 : 0}|${ch ? 1 : 0}`;
  if (key !== _ivKey) {
    _ivKey = key;
    box.className = 'iv-cap';
    box.style.cssText = `position:absolute;z-index:5;opacity:0;background:none;box-shadow:none;padding:0;white-space:nowrap;line-height:1;` +
      `color:${ch ? IV.verm : cfg.cor || IV.branco};text-shadow:${ch ? IV_BRILHO.chave : cfg.doc ? IV_BRILHO.doc : IV_BRILHO.legenda};`;
    box.innerHTML = '';
    box._sp = ivSerifSpan(box, txt, fs);
  }
  // volta depois de uma frase fixa: entra de novo (desfocada -> nítida) em vez de surgir pronta
  const vol = window.CUR_SCENE ? Math.max(-1e9, ...oc.filter(([, z]) => z <= lt).map(([, z]) => z + CUR_SCENE.t0)) : -1e9;
  const q = E.out(clamp((t - Math.max(L[idx].s, vol)) / .12));
  box.style.opacity = q.toFixed(3);
  box.style.filter = q < .98 ? `blur(${((1 - q) * 5).toFixed(1)}px)` : '';
  box.style.left = `${cfg.x ?? 540}px`; box.style.top = `${cfg.y ?? 1371}px`;
  box.style.transform = `translate(-50%,-50%) scale(${(1.04 - .04 * q).toFixed(4)})`;
};

// ---------- câmera ----------
// camOlha([[t, {x, y, z, r}], ...]) — a câmera OLHA para o ponto (x, y) do mundo da cena, com zoom z (1 = tamanho real) e giro r.
// Chaves sem uma propriedade herdam a anterior. Use em scene({camMove: camOlha(...)}) ou pela opção cam das cenas prontas.
function ivChaves(keys, padrao) {
  let prev = { ...padrao };
  return keys.map(([t, q]) => { prev = { ...prev, ...q }; return [t, { ...prev }]; });
}
// Curva da referência: a câmera ARRANCA logo no começo de cada trecho (~80% do caminho no 1º quarto) e chega ainda andando
// (12% de velocidade residual), então nunca para entre as chaves. Por chave, 3º item: 'suave' (E.inOut) ou 'linear'.
const IV_ARRANQUE = u => .88 * (1 - Math.pow(1 - u, 3.2)) + .12 * u;
const IV_CURVAS = { arranque: IV_ARRANQUE, suave: E.inOut, linear: E.lin };
// ivKf(keys, padrao) -> lt => {x, y, z|d, r}; com 'z' (ou 'd') soma uma DERIVA lenta (zoom +1%/s, ou aproxima 0,8%/s) que segue até
// 4 s depois da última chave: a câmera nunca fica parada.
// ENTRADA (padrão em toda cena): a referência faz ~todo o zoom do plano logo depois do corte. A câmera começa 16% mais aberta
// (mural: mais longe) e chega à 1ª chave em ~0,55 s. window.IV_ENTRADA muda a força; 1ª chave com 3º item 'fixa' desliga.
function ivEntrada(keys, padrao) {
  const e = window.IV_ENTRADA ?? .16;
  if (!e || !keys.length || keys[0][2] === 'fixa' || keys[0][0] > .05) return keys;
  const q0 = { ...padrao, ...keys[0][1] }, ini = { ...q0 };
  if ('z' in padrao) ini.z = q0.z / (1 + e);
  if ('d' in padrao) ini.d = q0.d * (1 + e * 1.6);
  const t1 = Math.min(.55, keys.length > 1 ? keys[1][0] * .5 : .55);
  return [[0, ini], [t1, keys[0][1], 'arranque'], ...keys.slice(1)];
}
function ivKf(keys, padrao) {
  keys = ivEntrada(keys, padrao);
  const K = ivChaves(keys, padrao), ks = Object.keys(padrao);
  const curva = keys.map(k => IV_CURVAS[k[2]] || IV_ARRANQUE), tFim = keys[keys.length - 1][0] + 4;
  return lt => {
    const o = {};
    ks.forEach(k => { o[k] = kf(lt, K.map(([t, q], i) => [t, q[k], curva[i]]), IV_ARRANQUE); });
    const td = Math.min(Math.max(0, lt), tFim);
    if ('z' in o) o.z *= 1 + .01 * td;
    if ('d' in o) o.d *= 1 - .008 * td;
    return o;
  };
}
const camOlha = keys => {
  const f = ivKf(keys, { x: 540, y: 960, z: 1, r: 0 });
  return (lt, c) => { const v = f(lt); return { s: v.z, x: -v.z * (v.x - 540), y: -v.z * (v.y - 960), r: v.r }; };
};
// ---------- borrão de movimento (a referência perde ~40% da nitidez quando a câmera corre; o render do navegador não) ----------
// ivBorrao(el, S, vx, vy, vb): vx, vy = px/quadro do centro da tela; vb = px/quadro na borda por zoom/giro. Filtro SVG anisotrópico
// (borra mais na direção do movimento); S._filtroExtra entra junto (ex.: desfoque de foco). window.IV_BORRAO = força (padrão .4).
let _ivMB = 0;
function ivBorrao(el_, S, vx, vy, vb = 0) {
  if (!S._mbG) {
    const id = 'ivmb' + (_ivMB++), s_ = sv(document.body, 'svg', { width: 0, height: 0, style: 'position:absolute' });
    const f = sv(sv(s_, 'defs'), 'filter', { id, x: '-5%', y: '-5%', width: '110%', height: '110%', 'color-interpolation-filters': 'sRGB' });
    S._mbG = sv(f, 'feGaussianBlur', { stdDeviation: '0 0' }); S._mbId = id;
  }
  const k = window.IV_BORRAO ?? .4;
  let sx = Math.min(18, Math.abs(vx) * k + vb * k * .5), sy = Math.min(18, Math.abs(vy) * k + vb * k * .5);
  // motor golpe: blur direcional SÓ no pico do chicote (acima de ~10 px/quadro), some no deslize — como nas refs
  // (window.IV_BORRAO = 0 desliga também aqui: serve para medir a câmera com a régua, que não enxerga o quadro borrado)
  if (S._golpe) { const g = k / .4; sx = g * Math.min(24, Math.max(0, Math.abs(vx) + vb * .5 - 10) * .3); sy = g * Math.min(24, Math.max(0, Math.abs(vy) + vb * .5 - 10) * .3); }
  const extra = S._filtroExtra || '';
  if (S._golpe ? sx + sy < 1.6 : (sx < .6 && sy < .6)) { el_.style.filter = extra; return; }
  S._mbG.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
  el_.style.filter = `${extra} url(#${S._mbId})`.trim();
}
// toda cena com câmera própria (camMove) ganha o borrão automaticamente; cenas com câmera interna (mural, documento, site)
// marcam S._mbProprio e chamam ivBorrao no update
const _ivSceneKit = scene;
scene = function (def) {
  const up = def.update;
  def.update = function (S, c) {
    if (def.camMove && def.camMove._golpe) S._golpe = true;
    if (def.camMove && def.camMove._foco) S._foco = true;
    window._IV_G = !!S._golpe;                     // as entradas (entra) usam a mola quando a cena está no motor golpe
    window._IV_F = !!S._foco;                      // ...e pousam no lugar (sem mola nem deslizar) no motor foco
    if (up) up.call(this, S, c);
    if (S._upd) S._upd.forEach(f => f(S, c));     // motor foco: frases, número, assuntos e véu (ivFrases, ivNumero, ivAssuntos)
    if (S._mbProprio || !def.camMove || def.camMove === camStill || !def.cam) return;
    const a = def.camMove(c.lt, c), b = def.camMove(Math.max(0, c.lt - 1 / 30), c);
    ivBorrao(def.cam, S, a.x - b.x, a.y - b.y, Math.abs(a.s - b.s) * 600 + Math.abs((a.r || 0) - (b.r || 0)) * Math.PI / 180 * 600);
  };
  _ivSceneKit(def);
};
// câmera por função do contexto (para usar c.w nas chaves): camC(c => [[0, {...}], [c.w('B12','casa'), {...}]])
const camC = fn => { let f = null; return (lt, c) => (f = f || camOlha(fn(c)))(lt, c); };

// ---------- motor "golpe" (02/11/2026; portado da vox-edit2, onde o A/B foi APROVADO pelo Felipe) ----------
// Medido nas refs de motion do Felipe (earn.edits cientista 30 q/s e Buffett 16 q/s): plano novo a cada ~0,9 s SEM cortar,
// a câmera CHICOTEIA de um ponto da cena para o próximo no tempo da palavra. Curva do chicote: a velocidade começa a ~45% do
// pico, chega ao pico em 20% do tempo e desliza até zero (metade do caminho em 36% do tempo). Mola: passa ~9% e assenta.
// Liga por cena com a opção golpes (sem ela, tudo continua como antes: camOlha/ivKf com arranque + deriva).
const _ivGT = (() => {
  const N = 200, v = [], p = [0];
  for (let i = 0; i <= N; i++) { const u = i / N, a = u / .2; v.push(u < .2 ? .45 + .55 * a * a * (3 - 2 * a) : Math.pow(1 - (u - .2) / .8, 2.2)); }
  for (let i = 1; i <= N; i++) p.push(p[i - 1] + (v[i - 1] + v[i]) / 2);
  return p.map(x => x / p[N]);
})();
const IV_GOLPE = u => { u = clamp(u); const f = u * 200, i = Math.min(199, Math.floor(f)); return lerp(_ivGT[i], _ivGT[i + 1], f - i); };
const _ivMol1 = 1 - Math.exp(-6) * Math.cos(8);
const IV_MOLA = u => { u = clamp(u); return u >= 1 ? 1 : (1 - Math.exp(-6 * u) * Math.cos(8 * u)) / _ivMol1; };
IV_CURVAS.golpe = IV_GOLPE;
// ruído suave (o wiggle do AE) para a câmera na mão
function ivWiggle(t, f, a, sem = 0) {
  const x = t * f + sem * 17.31, i = Math.floor(x), u = x - i, q = u * u * u * (u * (u * 6 - 15) + 10);
  const v = k => hrand(k * 1.618 + sem * 7.77) * 2 - 1; return a * lerp(v(i), v(i + 1), q);
}
// ivGolpes({planos: [[t, {x, y, z|d, r}, dur]], golpes: [[t, amp]], deriva: .035, mao: 6, corte: .2, trancoCorte: 6}, esc) -> lt => {x, y, z|d, r}
//   planos[0] = pose ANTES de tudo (a cena chega em chicote dela até o 1º plano: ponha o 1º plano em t ≈ -.12);
//   cada plano seguinte é um chicote de dur s (padrão .8) que começa em t (~.2 s ANTES da palavra: o pico cai nela).
//   z (zoom) e d (distância do mural) andam em escala log. golpes = trancos [tempo, px]; o 1º tranco vem sozinho no BAQUE
//   do corte (corte: tempo local, padrão .2 = pico do baque do trilha_inv.py; corte: false desliga).
//   deriva = zoom contínuo (z ×e^(deriva·t), d ÷); mao = câmera na mão em px de tela. esc.mx/esc.my = unidades do mundo por px
//   (documento: 1/largura da página), esc.padrao = valores que faltam.
function ivGolpes(o, esc = {}) {
  const P = o.planos, G = (o.golpes || []).slice(), dz = o.deriva ?? .035, mao = o.mao ?? 6, mx = esc.mx ?? 1, my = esc.my ?? 1;
  if (o.corte !== false) G.push([o.corte ?? .2, o.trancoCorte ?? 6]);
  const q0 = { ...(esc.padrao || {}), ...P[0][1] }, usaD = 'd' in q0 && !('z' in q0);
  return lt => {
    const v = { ...q0 }; v.r = v.r ?? 0;
    let arco = 1;
    for (let i = 1; i < P.length; i++) {
      const [t, q, d] = P[i], k = IV_GOLPE((lt - t) / (d ?? .8));
      if (k <= 0) continue;
      for (const key in q) {
        if (key === 'arco') continue;
        if (key === 'z' || key === 'd') v[key] = Math.exp(lerp(Math.log(v[key]), Math.log(q[key]), k));
        else v[key] = lerp(v[key] ?? 0, q[key], k);
      }
      // motor foco: plano com arco = a câmera abre no meio da viagem e fecha de novo (parte do caminho vira zoom)
      if (q.arco && k < 1) arco *= 1 + q.arco * Math.sin(Math.PI * k);
    }
    if (arco !== 1) { if (usaD) v.d *= arco; else if ('z' in v) v.z /= arco; }
    if (usaD) v.d *= Math.exp(-dz * lt); else if ('z' in v) v.z *= Math.exp(dz * lt);
    const zz = usaD ? 1000 / v.d : (v.z ?? 1);                    // px de tela por unidade do mundo (mão e tranco em px de TELA)
    v.x += ivWiggle(lt, 1.3, mao, 11.1) * mx / zz; v.y += ivWiggle(lt, 1.1, mao, 12.7) * my / zz; v.r += ivWiggle(lt, .9, .3, 13.3);
    for (const [t, a] of G) {
      const u = lt - t; if (u < 0 || u > .6) continue;
      const s = a * Math.exp(-u * 9);
      v.x += s * Math.sin(u * 55) * mx / zz; v.y += s * .8 * Math.cos(u * 47) * my / zz; v.r += s * .05 * Math.sin(u * 39);
      if (usaD) v.d /= 1 + s * .002; else if ('z' in v) v.z *= 1 + s * .002;
    }
    return v;
  };
}
// câmera de cena (scene({camMove}) e opção golpes de tvCena/mapaCena) com o motor golpe: camG(c => ({planos, golpes}))
//   mesmas coordenadas do camOlha (x, y = ponto do mundo no centro; z = zoom). Liga o borrão só no pico e a mola nas entradas.
const camG = fn => {
  let f = null;
  const m = (lt, c) => { f = f || ivGolpes(fn(c), { padrao: { x: 540, y: 960, z: 1, r: 0 } }); const v = f(lt); return { s: v.z, x: -v.z * (v.x - 540), y: -v.z * (v.y - 960), r: v.r }; };
  m._golpe = true;
  return m;
};

// ---------- entradas ----------
// entra(e, lt, t, {k: 'foco'|'cresce'|'sobe'|'desce'|'lado'|'brota', d, dx, dy, out}) — mesma família do edit-papel
// No motor golpe (cena com golpes) a entrada é com MOLA (passa ~9% e assenta, d .5) e o 'foco' chega batendo de 1,22×;
// op.mola: false volta para a entrada antiga.
function entra(e, lt, t, op = {}) {
  let k = op.k ?? 'foco';
  // motor foco: nada desliza da borda nem passa do ponto — 'foco', 'sobe', 'desce' e 'lado' viram 'pousa' (op.livre: true mantém)
  const vira = window._IV_F && op.livre !== true && ['foco', 'sobe', 'desce', 'lado'].includes(k);
  if (vira) k = 'pousa';
  const mola = window._IV_G && !window._IV_F && op.mola !== false && k !== 'brota', d = vira ? .22 : op.d ?? (k === 'pousa' ? .22 : mola ? .5 : .35);
  if (lt < t) { e.style.opacity = 0; return 0; }
  const u = clamp((lt - t) / d), q = mola ? IV_MOLA(u) : E.out5(u), q1 = Math.min(1, q);
  let x = 0, y = 0, s = 1, b = 0;
  if (k === 'pousa') { const p = E.out(u); s = lerp(op.s0 ?? 1.08, 1, p); b = (1 - p) * 10; }       // pousa no lugar: 1,08 -> 1 em .22 s
  else if (k === 'foco') { s = lerp(mola ? 1.22 : 1.06, 1, q); b = (1 - q1) * 16; }
  else if (k === 'cresce') { s = lerp(.62, 1, q); b = (1 - q1) * 12; }
  else if (k === 'brota') { s = lerp(0, 1, E.back(u)); }
  else if (k === 'sobe') { y = (op.dy ?? 260) * (1 - q); b = Math.sin(Math.PI * Math.min(u, 1)) * 12; }
  else if (k === 'desce') { y = -(op.dy ?? 260) * (1 - q); b = Math.sin(Math.PI * Math.min(u, 1)) * 12; }
  else if (k === 'lado') { x = (op.dx ?? 520) * (1 - q); b = (1 - q1) * 22; }
  const out = op.out !== undefined && lt > op.out ? clamp((lt - op.out) / (op.od ?? .22)) : 0;
  const deriva = op.deriva ?? .02;
  tx(e, { x: x + (op.x ?? 0), y: y + (op.y ?? 0), s: s * (op.s ?? 1) * (1 + deriva * clamp((lt - t - d) / 3)), o: Math.min(clamp(u * 2.2), 1 - out) });
  const bb = b + out * 14;
  e.style.filter = (bb > .3 ? `blur(${bb.toFixed(1)}px) ` : '') + (e._filtro || '');
  return u;
}

// ---------- apresentador ----------
// presInv(['B13','B14'], {z0: 1.42 (punch-out de entrada), empurra: .06, passos: c => [[t, zoom]], luz: 'dir'|'esq'|false,
//                         forca: .55 (luz vermelha), frio: .5 (tom frio), fy: .40, capY: 1371, build(L,S,c), update(S,c)})
// Entra fechado e desfocado (~1,4x) e abre em 0,45 s para o plano médio; depois empurra devagar. A cor do vídeo é a do
// apresentador: pele e camisa frias, luz vermelha de um lado, topo escuro. É a ÚNICA cena colorida do formato.
function presInv(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', presenter: true, camMove: camStill, lead: o.lead,
    build(r, S, c) {
      S.ph = photo(r, -60, -40, 1200, 2000, { border: 0, tape: false, fy: o.fy ?? .40 });
      S.photos.push(S.ph);
      S.filtro = `saturate(${o.sat ?? .8}) contrast(1.1) brightness(.93)`;
      S.ph.img.style.filter = S.filtro;
      el(r, 'div', `position:absolute;inset:0;background:#1b3a55;mix-blend-mode:soft-light;opacity:${o.frio ?? .5};`);
      const lado = o.luz ?? 'dir';
      if (lado) {
        const px = lado === 'esq' ? '0%' : '100%';
        el(r, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse 62% 72% at ${px} 58%, rgba(255,36,26,.95) 0%, rgba(255,36,26,.35) 38%, rgba(255,36,26,0) 72%);` +
          `mix-blend-mode:screen;opacity:${(o.forca ?? .55) * .55};`);
        el(r, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse 58% 70% at ${px} 58%, rgba(255,30,20,.9) 0%, rgba(255,30,20,0) 66%);` +
          `mix-blend-mode:overlay;opacity:${o.forca ?? .55};`);
      }
      el(r, 'div', 'position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 78%,rgba(0,0,0,.35) 100%);');
      // passos = níveis de zoom ao longo do plano (a referência muda o zoom ~a cada 1,5–2 s: 1,0 -> 1,15 -> 1,05 ...).
      // Padrão: um nível novo em cada beat depois do 1º (e no meio de beat > 2,6 s), alternando fechar/abrir; passos: false desliga.
      let ps = o.passos === false ? [] : o.passos ? o.passos(c) : null;
      if (!ps) {
        ps = []; const nv = o.niveis || [1.12, 1.04, 1.15, 1.06, 1.13, 1.03];
        beats.forEach((id, i) => {
          const t0 = c.b(id), d = c.e(id) - c.b(id);
          if (i > 0) ps.push(t0 - .03);
          if (d > 2.6) { const ws = BYID[id].words; ps.push(ws[Math.floor(ws.length / 2)].s - c.t0 - .03); }
        });
        ps = ps.filter(t => t > .7).map((t, i) => [t, nv[i % nv.length]]);
      }
      S.passos = ps;
      S.zoom = lt => {
        const q = E.out5(clamp(lt / (o.dEntra ?? .45)));
        let nivel = 1;
        ps.forEach(([t, zz]) => { nivel = lerp(nivel, zz, IV_ARRANQUE(clamp((lt - t) / .5))); });
        return lerp(o.z0 ?? 1.42, 1, q) * nivel * (1 + (o.empurra ?? .06) * E.inOut(clamp(lt / Math.max(1, c.dur))));
      };
      S.ph.zoomFn = lt => S.zoom(lt);
      S.cap = { modo: 'palavra', y: o.capY ?? 1371 };
      S.vig = o.vig ?? .6; S.grao = o.grao ?? .16;
      const L = S.L = el(r.parentNode, 'div', 'position:absolute;inset:0;z-index:3;pointer-events:none;');
      if (o.build) o.build(L, S, c);
    },
    update(S, c) {
      const lt = c.lt, q = E.out5(clamp(lt / (o.dEntra ?? .45)));
      const vz = Math.abs(S.zoom(lt) - S.zoom(Math.max(0, lt - 1 / 30))) * 700;          // borrão do salto de zoom
      S.ph.img.style.filter = S.filtro + (q < .97 ? ` blur(${((1 - q) * 7).toFixed(1)}px)` : (vz > 1.5 ? ` blur(${Math.min(5, vz * .3).toFixed(1)}px)` : ''));
      if (o.mao !== false) S.ph.fr.style.transform = `translate(${(5 * Math.sin(lt * 1.1 + 1) + 2.5 * Math.sin(lt * 2.6)).toFixed(1)}px,` +
        `${(4 * Math.sin(lt * 1.37 + 2) + 2 * Math.sin(lt * 3.1)).toFixed(1)}px) rotate(${(.25 * Math.sin(lt * .9)).toFixed(3)}deg)`;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- palco escuro (tipografia, recortes, mapa) ----------
// palco(r, S, {brilho: [x, y] (brilho vermelho ambiente, em px da tela) | false, cap: {modo:'none'}, mundo: .14}) — o fundo fica
// PARADO (fora da câmera); o que vai em r anda com ela. mundo (motor foco): uma fumaça escura bem fraca DENTRO da câmera — a
// tipografia fixa (ivFrases) fica parada e nítida e o mundo anda e aproxima por trás (a "câmera viajando" sem arrastar a letra).
function palco(r, S, o = {}) {
  const f = document.createElement('div');
  r.parentNode.insertBefore(f, r);
  const br = o.brilho === false ? '' : `radial-gradient(circle at ${(o.brilho || [760, 520])[0]}px ${(o.brilho || [760, 520])[1]}px, rgba(228,24,24,.09) 0%, rgba(228,24,24,0) 34%),`;
  f.style.cssText = `position:absolute;inset:0;background:${br}radial-gradient(ellipse 72% 56% at 50% 46%, #181818 0%, #0c0c0c 55%, #040404 100%);`;
  if (S) { S.grao = o.grao ?? .22; S.vig = o.vig ?? .45; S.cap = o.cap ?? { modo: 'none' }; }
  if (o.mundo) {
    const m = el(r, 'div', `position:absolute;left:-1800px;top:-2400px;width:4680px;height:6720px;pointer-events:none;` +
      `background:url(${ivFumacaTex()}) 0 0/640px 640px repeat;opacity:${o.mundo};`);
    r.insertBefore(m, r.firstChild);
  }
  return f;
}
// fumaça escura que emenda sem costura (640 px): manchas suaves em 4 escalas, branco com alfa (o palco escuro fica por baixo)
let _ivFum = null;
function ivFumacaTex() {
  if (_ivFum) return _ivFum;
  const N = 640, c = document.createElement('canvas'); c.width = c.height = N;
  const x = c.getContext('2d');
  [[5, .5], [10, .32], [20, .2], [40, .12]].forEach(([g, a], k) => {
    const s = document.createElement('canvas'); s.width = s.height = g;
    const sx = s.getContext('2d'), im = sx.createImageData(g, g);
    for (let i = 0; i < g * g; i++) { const v = hrand(i * 3.17 + k * 101.3); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = 255; im.data[i * 4 + 3] = Math.round(255 * v * v); }
    sx.putImageData(im, 0, 0);
    const s3 = document.createElement('canvas'); s3.width = s3.height = g * 3;               // 3×3 cópias -> amplia e borra de uma vez ->
    const s3x = s3.getContext('2d');                                                           // recorta o meio: emenda sem costura
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s3x.drawImage(s, i * g, j * g);
    const t = document.createElement('canvas'); t.width = t.height = N * 3;
    const tc = t.getContext('2d'); tc.imageSmoothingEnabled = true; tc.filter = `blur(${(N / g * .45).toFixed(1)}px)`;
    tc.drawImage(s3, 0, 0, N * 3, N * 3);
    x.globalAlpha = a; x.drawImage(t, N, N, N, N, 0, 0, N, N);
  });
  return (_ivFum = c.toDataURL());
}
// estilos de texto (tamanho em px a 1080 de largura). Serifa = Times condensada; sans = Inter.
const IV_EST = {
  V: { f: 'serif', s: 200, cor: IV.verm, br: 'verm' },        // chave vermelha enorme ("350", "lowest")
  v: { f: 'serif', s: 132, cor: IV.verm, br: 'verm' },        // chave vermelha ("worked from", "Huang")
  S: { f: 'serif', s: 200, cor: IV.branco, br: 'branco' },    // serifa branca enorme
  s: { f: 'serif', s: 132, cor: IV.branco, br: 'branco' },    // serifa branca ("Wei,", "one-person", nome no mapa)
  a: { f: 'sans', p: 400, s: 54, cor: IV.branco, br: 'branco' },   // ligação pequena ("8 at", "salary rate in China is")
  A: { f: 'sans', p: 600, s: 58, cor: IV.branco, br: 'branco' },   // ligação forte ("night", "viewers")
  r: { f: 'sans', p: 500, s: 54, cor: IV.verm, br: 'verm' },       // sans vermelha pequena ("companies on")
  n: { f: 'sans', p: 500, s: 48, cor: IV.branco, br: 'branco' },   // nome ao lado da foto
};
// linha(p, [['The','a'], ['lowest','V', {s: 230}], ['Viya.','a', {marca: true}]], x, y, {alinha:'esq'|'centro'|'dir', k:1, letras:false})
//   -> g; g.at(lt, [t1, t2, ...] | t, {d, blur, letras, out}) revela cada parte (desfocada -> nítida) no tempo da palavra;
//   g.marca(i, lt, t) acende o fundo vermelho da parte i; g.caixa() = {x0, x1, y0, y1} na cena. y = linha de base.
function linha(p, partes, x, y, o = {}) {
  const al = o.alinha ?? 'esq', k = o.k ?? 1;
  const g = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;line-height:1;`);
  g.ws = partes.map(([txt, st, op = {}], i) => {
    const E_ = IV_EST[st] || IV_EST.a, px = (op.s ?? E_.s) * k, cor = op.cor ?? E_.cor;
    const gap = i < partes.length - 1 ? `margin-right:${(op.esp ?? (E_.f === 'serif' ? .2 : .26)).toFixed(2)}em;` : '';
    let sp;
    if (E_.f === 'serif') { sp = ivSerifSpan(g, txt, px, `color:${cor};text-shadow:${IV_BRILHO[E_.br]};font-size:${px}px;${gap}opacity:0;`, o.letras || op.letras); }
    else {
      sp = el(g, 'span', `display:inline-block;vertical-align:baseline;font-family:${SANS};font-weight:${op.p ?? E_.p};font-size:${px}px;letter-spacing:-.025em;` +
        `color:${cor};text-shadow:${IV_BRILHO[E_.br]};${gap}opacity:0;`);
      if (o.letras || op.letras) sp.letras = [...txt].map(ch => el(sp, 'span', 'display:inline-block;', ch === ' ' ? '&nbsp;' : esc(ch)));
      else sp.textContent = txt;
    }
    if (op.marca) { sp.style.padding = '0 .12em'; sp.style.background = `linear-gradient(${IV.verm},${IV.verm}) no-repeat 0 55%/0% 86%`; sp._marca = true; }
    return sp;
  });
  const W_ = g.scrollWidth, H_ = g.offsetHeight;
  const dx = al === 'esq' ? 0 : al === 'dir' ? -W_ : -W_ / 2;
  g._base = `translate(${dx.toFixed(1)}px,${(-H_ * .78).toFixed(1)}px)`;
  g.style.transform = g._base;
  g.caixa = () => ({ x0: x + dx, x1: x + dx + W_, y0: y - H_ * .78, y1: y + H_ * .22 });
  g.at = (lt, ts, op = {}) => g.ws.forEach((sp, i) => {
    const t = Array.isArray(ts) ? ts[Math.min(i, ts.length - 1)] : ts + i * (op.passo ?? .12);
    if (t === null || t === undefined) return;
    const d = op.d ?? .26, out = op.out !== undefined ? clamp((lt - op.out) / .25) : 0;
    if (sp.letras) {
      sp.style.opacity = lt >= t - .01 ? (1 - out).toFixed(3) : 0;
      sp.letras.forEach((L_, j) => {
        const tj = t + hrand(j * 7.3 + i * 3.1 + x * .01) * (op.espalha ?? .3), q = E.out(clamp((lt - tj) / .16));
        L_.style.opacity = q.toFixed(3); L_.style.filter = q < .98 ? `blur(${((1 - q) * 9).toFixed(1)}px)` : '';
      });
      return;
    }
    const q = E.out(clamp((lt - t) / d)), b = (1 - q) * (op.blur ?? 14) + out * 12;
    sp.style.opacity = (q * (1 - out)).toFixed(3);
    sp.style.filter = b > .3 ? `blur(${b.toFixed(1)}px)` : '';
    sp.style.transform = q < 1 ? `scale(${(1.05 - .05 * q).toFixed(4)})` : '';
  });
  g.marca = (i, lt, t, d = .22) => { const sp = g.ws[i]; if (sp && sp._marca) sp.style.backgroundSize = `${(E.out(clamp((lt - t) / d)) * 100).toFixed(1)}% 86%`; };
  return g;
}
// texto falado: linhaFala(p, c, 'B12', 'a a|V', x, y, o) — as palavras do beat, na ordem, com um estilo cada ('-' pula uma palavra,
// 'Vx2' junta 2 palavras num estilo, '|' = nova linha com o.entre px abaixo); g.at(lt) já usa os tempos da fala.
// Sufixos (03/11): '*' = letras fora de ordem ('Vx3*'), '@170' = tamanho em px ('Vx3*@170').
function linhaFala(p, c, beat, spec, x, y, o = {}) {
  const ids = o.junta || [beat];
  const ws = ids.flatMap(id => BYID[id].words).slice(o.de ?? 0);
  const linhas = [], ts = [];
  let i = 0;
  spec.split('|').forEach(ln => {
    const L_ = [], T_ = [];
    ln.trim().split(/\s+/).forEach(tok => {
      if (!tok) return;
      if (tok === '-') { i++; return; }
      const m = tok.match(/^([a-zA-Z])(?:x(\d+))?(\*)?(?:@(\d+))?$/), n = m && m[2] ? +m[2] : 1, st = m ? m[1] : tok;
      const grupo = ws.slice(i, i + n);
      if (!grupo.length) return;
      L_.push([grupo.map(w => w.w).join(' ').replace(/[,;:]$/, ''), st, { ...(m && m[3] ? { letras: true } : {}), ...(m && m[4] ? { s: +m[4] } : {}) }]);
      T_.push(grupo[0].s - c.t0 - .03);
      i += n;
    });
    if (L_.length) { linhas.push(L_); ts.push(T_); }
  });
  const al = o.alinha ?? 'esq', gs = linhas.map((L_, j) => linha(p, L_, x, y + j * (o.entre ?? 150), { ...o, alinha: al }));
  const g = { gs, ts };
  g.at = (lt, op = {}) => gs.forEach((gg, j) => gg.at(lt, ts[j].map(t => t - (op.adianta ?? 0)), op));
  return g;
}
// tracejado(svg, 'M.. Q..', {c, w, dash, gap, brilho}) -> path com .draw(q) (desenha do começo ao fim, mantendo os traços)
function tracejado(svg, d, o = {}) {
  const cor = o.c ?? 'rgba(232,231,234,.85)';
  const p = sv(svg, 'path', { d, fill: 'none', stroke: cor, 'stroke-width': o.w ?? 2.6, 'stroke-linecap': 'round' });
  if (o.brilho !== false) p.style.filter = `drop-shadow(0 0 5px ${o.sombra ?? (cor.includes('228') || cor === IV.verm ? 'rgba(228,24,24,.7)' : 'rgba(255,255,255,.45)')})`;
  const L = p.getTotalLength(), dash = o.dash ?? 10, gap = o.gap ?? 9;
  p.draw = q => {
    q = clamp(q);
    const n = Math.floor(q * L / (dash + gap)), resto = q * L - n * (dash + gap), arr = [];
    for (let i = 0; i < n; i++) arr.push(dash, gap);
    arr.push(Math.max(.01, Math.min(dash, resto)), L + 20);
    p.setAttribute('stroke-dasharray', arr.join(' '));
    p.style.visibility = q > .002 ? 'visible' : 'hidden';
  };
  p.draw(0);
  return p;
}
// caminhos prontos: reta(x0,y0,x1,y1) · curva(x0,y0,x1,y1, k=.3) (curva para a esquerda do sentido; k negativo = para a direita)
const reta = (x0, y0, x1, y1) => `M${x0},${y0} L${x1},${y1}`;
function curva(x0, y0, x1, y1, k = .3) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0;
  return `M${x0},${y0} Q${(mx - dy * k).toFixed(1)},${(my + dx * k).toFixed(1)} ${x1},${y1}`;
}
// número vermelho que conta (0% -> 3%): contador(p, x, y, {de: 0, para: 3, casas: 0, pre: '', suf: '%', s: 300, alinha})
//   -> g.at(lt, t, d=.9): conta com borrão vertical; o último quadro fica no valor exato
function contador(p, x, y, o = {}) {
  const px = o.s ?? 300, al = o.alinha ?? 'centro';
  const g = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;color:${o.cor ?? IV.verm};text-shadow:${IV_BRILHO.verm};opacity:0;`);
  const fmt = v => (o.pre ?? '') + v.toFixed(o.casas ?? 0).replace('.', o.virgula === false ? '.' : ',') + (o.suf ?? '%');
  let ult = '';
  const pinta = s => { if (s === ult) return; ult = s; g.innerHTML = ''; g.sp = ivSerifSpan(g, s, px); };
  pinta(fmt(o.para ?? 3));
  const W_ = g.scrollWidth;
  g._dx = al === 'esq' ? 0 : al === 'dir' ? -W_ : -W_ / 2;
  g.at = (lt, t, d = .9) => {
    if (lt < t) { g.style.opacity = 0; return; }
    const u = clamp((lt - t) / d), v = lerp(o.de ?? 0, o.para ?? 3, E.out(u));
    pinta(fmt(u >= 1 ? (o.para ?? 3) : (o.casas ? v : Math.floor(v + 1e-6))));
    g.style.opacity = E.out(clamp((lt - t) / .15)).toFixed(3);
    const vel = u < 1 ? Math.sin(Math.PI * u) * 6 : 0;
    g.style.transform = `translate(${g._dx.toFixed(1)}px,-78%)`;
    g.style.filter = vel > .4 ? `blur(${(vel * .5).toFixed(1)}px)` : '';
  };
  return g;
}
// tarja preta nos olhos: tarja(p, x, y, w, h) -> g.at(lt, t0, t1) (visível entre t0 e t1; sai de corte, como na referência)
function tarja(p, x, y, w, h, o = {}) {
  const g = el(p, 'div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${o.c ?? '#030303'};`);
  g.at = (lt, t0 = -1, t1 = 1e9) => { g.style.opacity = lt >= t0 && lt < t1 ? 1 : 0; };
  return g;
}

// ---------- pessoas recortadas (P&B em retícula; provas.py modo pessoa -> p_<nome>.png) ----------
// recorte(p, 'p_nome', cx, cy, w, {tarja: true (olhos de OLHOS[nome], do provas.py) | [fx0, fy0, fx1, fy1], funde: true})
//   -> e; e.at(lt, t, {k:'sobe'|'lado'|'foco', ...}) entra; e.tira(lt, t) tira a tarja no tempo t (a revelação do nome)
function recorte(p, nome, cx, cy, w, o = {}) {
  const a = AS(nome);
  if (!a) throw new Error(`asset ${nome} não existe (rode provas.py e make_assets.py)`);
  const h = w * a.h / a.w;
  const e = box(p, cx, cy, w, h, 'opacity:0;');
  const mk = o.funde === false ? '' : `-webkit-mask-image:linear-gradient(180deg,#000 ${o.fundeDe ?? 64}%,rgba(0,0,0,0) 98%);mask-image:linear-gradient(180deg,#000 ${o.fundeDe ?? 64}%,rgba(0,0,0,0) 98%);`;
  e.img = el(e, 'img', `position:absolute;inset:0;width:100%;height:100%;${mk}`);
  e.img.decoding = 'sync'; e.img.src = a.src; e.w = w; e.h = h;
  e._filtro = 'drop-shadow(0 0 26px rgba(255,255,255,.10))';
  const ol = Array.isArray(o.tarja) ? o.tarja : (o.tarja && window.OLHOS ? OLHOS[nome] : null);
  if (ol) {
    const bw = (ol[2] - ol[0]) * w, bh = Math.max((ol[3] - ol[1]) * h, bw * .2);
    e.tarja = el(e, 'div', `position:absolute;left:${(ol[0] * w - bw * .12).toFixed(1)}px;top:${((ol[1] + ol[3]) / 2 * h - bh / 2).toFixed(1)}px;` +
      `width:${(bw * 1.24).toFixed(1)}px;height:${bh.toFixed(1)}px;background:#030303;`);
  }
  e.at = (lt, t, op = {}) => entra(e, lt, t, { k: 'sobe', dy: 320, d: .4, ...op });
  e.tira = (lt, t) => { if (e.tarja) e.tarja.style.opacity = lt >= t ? 0 : 1; };
  return e;
}
// nome ao lado da pessoa com tracejado curvo até ela: nomeado(p, svg, 'Fan Bingbing', xTexto, yTexto, xAlvo, yAlvo, {estilo:'n', k})
//   -> g.at(lt, t): o nome entra e o tracejado desenha até a pessoa
function nomeado(p, svg, txt, x, y, x1, y1, o = {}) {
  const t_ = linha(p, [[txt, o.estilo ?? 'n']], x, y, { alinha: o.alinha ?? 'esq' });
  const b = t_.caixa();
  const x0 = o.alinha === 'dir' ? b.x0 - 14 : (o.alinha === 'centro' ? (b.x0 + b.x1) / 2 : b.x0 + 30), y0 = b.y1 + 16;
  const tr = tracejado(svg, curva(x0, y0, x1, y1, o.curva ?? -.35), { w: 2.4 });
  return { t: t_, tr, at(lt, t) { t_.at(lt, t); tr.draw(clamp((lt - t - .1) / .45)); } };
}

// ---------- folha impressa: foto com borda branca e canto dobrado, ou documento; percevejo no topo ----------
// ivFolha(e, asset, w, 'foto'|'doc', {borda: .045, base: .04, dobra: .13 (0 = sem), pino: true, recorte: [fy0, fy1] (doc: fatia da página)})
//   -> altura; monta dentro do container e (que ganha width/height)
function ivFolha(e, a, w, tipo, o = {}) {
  const borda = tipo === 'foto' ? (o.borda ?? .045) : 0;
  const fat = o.recorte || [0, 1], iw = w - 2 * w * borda, ihTot = iw * a.h / a.w, ih = ihTot * (fat[1] - fat[0]);
  const h = ih + 2 * w * borda + (tipo === 'foto' ? w * (o.base ?? .04) : 0);
  e.style.width = `${w}px`; e.style.height = `${h.toFixed(1)}px`;
  const dobra = (o.dobra ?? .13) * w;
  const papel = el(e, 'div', `position:absolute;inset:0;overflow:hidden;background:${tipo === 'foto' ? '#e7e6e2' : IV.papel};` +
    (o.dobra === 0 ? '' : `clip-path:polygon(0 0,100% 0,100% ${(h - dobra).toFixed(1)}px,${(w - dobra).toFixed(1)}px 100%,0 100%);`));
  const vis = el(papel, 'div', `position:absolute;left:${w * borda}px;top:${w * borda}px;width:${iw}px;height:${ih.toFixed(1)}px;overflow:hidden;`);
  const im = el(vis, 'img', `position:absolute;left:0;top:${(-fat[0] * ihTot).toFixed(1)}px;width:${iw}px;height:${ihTot.toFixed(1)}px;filter:contrast(1.06) brightness(.96);`);
  im.decoding = 'sync'; im.src = a.src;
  if (o.dobra !== 0) el(e, 'div', `position:absolute;left:${(w - dobra).toFixed(1)}px;top:${(h - dobra).toFixed(1)}px;width:${dobra.toFixed(1)}px;height:${dobra.toFixed(1)}px;` +
    'background:linear-gradient(135deg,#f2f1ee 0%,#c9c8c4 55%,#8d8c88 100%);clip-path:polygon(0 0,100% 0,0 100%);filter:drop-shadow(-3px -2px 4px rgba(0,0,0,.45));');
  if (o.pino !== false) el(e, 'div', `position:absolute;left:${w / 2 - 13}px;top:${h * .045 - 13}px;width:26px;height:26px;border-radius:50%;` +
    'background:radial-gradient(circle at 36% 32%,#ffffff 0%,#b9b9b9 32%,#5c5c5c 66%,#2a2a2a 100%);box-shadow:4px 7px 7px rgba(0,0,0,.65);');
  e.style.filter = 'drop-shadow(0 18px 26px rgba(0,0,0,.65))';
  return h;
}
// foto/documento impresso solto no palco escuro: impressa(p, 'i_x', cx, cy, w, {rot, tipo: 'foto'|'doc', dobra, pino, recorte})
//   -> e; e.at(lt, t, {k: 'foco'|'sobe'|'lado'|..., out}) (mesma entrada das outras peças)
function impressa(p, nome, cx, cy, w, o = {}) {
  const a = AS(nome);
  if (!a) throw new Error(`asset ${nome} não existe (provas.py modo imp/doc)`);
  const e = el(p, 'div', 'position:absolute;opacity:0;transform-origin:50% 50%;');
  const h = ivFolha(e, a, w, o.tipo ?? (nome.startsWith('d_') ? 'doc' : 'foto'), o);
  e.style.left = `${(cx - w / 2).toFixed(1)}px`; e.style.top = `${(cy - h / 2).toFixed(1)}px`;
  e._rot = o.rot ?? 0; e.w = w; e.h = h;
  e._filtro = 'drop-shadow(0 18px 26px rgba(0,0,0,.65))';
  e.at = (lt, t, op = {}) => entra(e, lt, t, { k: 'foco', ...op });
  return e;
}

// ---------- mural de provas ----------
// const M = mural();                                         (defina UMA vez no work/<prefixo>_b.js; as cenas reaproveitam)
// M.foto('lula', 'i_lula', 1500, 1200, {w: 440, rot: -3, dz: 0, desde: ['B19', '2006']})   foto P&B com borda branca e canto dobrado
// M.doc('tcu', 'd_tcu', 2000, 900, {w: 380, desde: 'B37'})                               folha de documento (sem borda)
// M.fio('lula', 'tcu', {desde: ['B37', 'bilhões']})                                       fio vermelho entre os percevejos
//   desde = beat (ou [beat, palavra]) em que o item aparece pela 1ª vez: nas cenas seguintes ele já está na parede.
//   dz = profundidade (+ perto da câmera, - longe): dá paralaxe e foco diferente entre os itens.
function mural(o = {}) {
  return {
    itens: [], fios: [], o,
    foto(id, asset, x, y, op = {}) { this.itens.push({ id, tipo: 'foto', asset, x, y, ...op }); return this; },
    doc(id, asset, x, y, op = {}) { this.itens.push({ id, tipo: 'doc', asset, x, y, ...op }); return this; },
    fio(a, b, op = {}) { this.fios.push({ a, b, ...op }); return this; },
  };
}
function ivQuando(desde, c, beats) {   // tempo local em que o item aparece; null = já estava; undefined = ainda não existe
  if (!desde) return null;
  const [b, w] = Array.isArray(desde) ? desde : [desde, null];
  if (!BYID[b]) throw new Error(`mural: beat ${b} não existe`);
  const iLast = BYID[beats[beats.length - 1]].i, iFirst = BYID[beats[0]].i, ib = BYID[b].i;
  if (ib < iFirst) return null;
  if (ib > iLast) return undefined;
  return (w === null ? c.b(b) : c.w(b, w)) - .06;
}
// muralCena(beats, M, {cam: c => [[t, {x, y, d, r}], ...]  (x, y = ponto da parede no centro; d = distância, 1000 = tamanho real),
//                      cap, foco: 'id' (força o foco), luz: .55, build(r, S, c), update(S, c)})
function muralCena(beats, M, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      const wall = el(r, 'div', `position:absolute;left:0;top:0;width:14000px;height:14000px;transform-origin:0 0;` +
        `background:#0a0a0a url(${AS('t_parede') ? AS('t_parede').src : ''}) 0 0/1100px 1100px repeat;`);
      S.wall = wall;
      S.itens = [];
      M.itens.forEach(it => {
        const ta = ivQuando(it.desde, c, beats);
        if (ta === undefined) return;
        const a = AS(it.asset);
        if (!a) throw new Error(`mural: asset ${it.asset} não existe`);
        const w = it.w ?? 420;
        const e = el(r, 'div', `position:absolute;left:0;top:0;transform-origin:50% 50%;`);
        const h = ivFolha(e, a, w, it.tipo, it);
        S.itens.push({ ...it, e, w, h, ta, pinY: h * .045, rot: it.rot ?? 0, dz: it.dz ?? 0 });
      });
      S.svg = svgAbs(r, 0, 0, W, H);
      S.fios = M.fios.map(f => {
        const A = S.itens.find(x => x.id === f.a), B = S.itens.find(x => x.id === f.b);
        if (!A || !B) return null;
        const ta = ivQuando(f.desde, c, beats);
        if (ta === undefined) return null;
        const p = sv(S.svg, 'path', { fill: 'none', stroke: IV.fio, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: .92 });
        p.style.filter = 'drop-shadow(0 0 3px rgba(228,24,24,.55)) drop-shadow(2px 6px 4px rgba(0,0,0,.55))';
        return { A, B, ta, p };
      }).filter(Boolean);
      S.luz = el(r, 'div', 'position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;background:radial-gradient(ellipse 62% 46% at 50% 46%, rgba(255,255,255,.11), rgba(255,255,255,.03) 55%, rgba(0,0,0,0) 80%);');
      if (o.focos) {                               // motor foco: a câmera vai a UM item (ou a um grupo) por vez; os outros escurecem
        S.itens.forEach(it => { if (it.ta !== null && it.ta < .25) it.ta = -.1; });                    // preso no começo = já no quadro 0
        const alvo = a => {
          if (typeof a === 'string') a = { ids: [a] }; else if (Array.isArray(a)) a = { ids: a }; else if (a.id) a = { ...a, ids: [a.id] };
          const its = (a.ids || []).map(id => S.itens.find(x => x.id === id)).filter(Boolean);
          if (!its.length) return { q: { x: a.x ?? 1500, y: a.y ?? 1500, d: a.d ?? 1000, r: a.r ?? 0 }, ids: null };
          const x0 = Math.min(...its.map(i => i.x - i.w / 2)), x1 = Math.max(...its.map(i => i.x + i.w / 2));
          const y0 = Math.min(...its.map(i => i.y - i.h / 2)), y1 = Math.max(...its.map(i => i.y + i.h / 2)), dzm = its.reduce((s, i) => s + i.dz, 0) / its.length;
          const d = a.d ?? (its.length === 1 ? 1000 * its[0].w / IV_F.largMural + dzm : Math.max(1000 * (x1 - x0) / 960, 1000 * (y1 - y0) / 720) + dzm);
          return { q: { x: (x0 + x1) / 2, y: (y0 + y1) / 2, d, r: a.r ?? 0, ...(a.salto ? { salto: true } : {}) }, ids: its.map(i => i.id), ta: its.length === 1 ? its[0].ta : null };
        };
        // t = null: a câmera chega no item quando ele POUSA (a viagem começa ~.5 s antes; o salto em foco pula logo depois do pouso,
        // então o item novo já está no centro quando a imagem volta a focar) — nunca num lugar vazio
        const L = o.focos(c).map(([t, a, dur]) => { const f = alvo(a), ta = f.ta ?? null; return { ...f, t: t ?? (ta !== null ? (f.q.salto ? ta + .13 : ta - .29) : 0), dur }; });
        const F = ivFocos(c, L.map(f => [f.t, f.q, f.dur]), { dy: (q, px) => px * q.d / 1000, dx: (q, px) => px * q.d / 1000, zk: 'd' },
          { deriva: .045, ...(o.focoOp || {}) });   // parede: deriva .045 (a parede desfocada esconde a deriva lenta; a câmera nunca para)
        S.cam = ivGolpes(F, { padrao: { x: 1500, y: 1500, d: 1400, r: 0 } });
        S._golpe = true; S._foco = true; S._saltos = F.saltos;
        // o foco troca no meio da viagem (no salto, no pulo)
        S.focoSets = L.map((f, i) => ({ t: i ? (f.q.salto ? f.t - .08 : f.t - .2 + (f.dur ?? .7) * .45) : -1, ids: f.ids }));
      } else if (o.golpes) {                       // motor golpe: chicotes pela parede + tranco quando cada item é PRESO
        const g = o.golpes(c), tr = S.itens.filter(it => it.ta !== null).map(it => [it.ta + .12, g.trancoItem ?? 7]);
        S.cam = ivGolpes({ ...g, golpes: [...(g.golpes || []), ...tr] }, { padrao: { x: 1500, y: 1500, d: 1400, r: 0 } });
        S._golpe = true;
      } else S.cam = ivKf(o.cam ? o.cam(c) : [[0, { x: S.itens[0]?.x ?? 1500, y: S.itens[0]?.y ?? 1500, d: 1400 }]], { x: 1500, y: 1500, d: 1400, r: 0 });
      S.r = r; S._mbProprio = true;
      S.cap = o.cap ?? { modo: 'palavra' };
      S.vig = o.vig ?? .75; S.grao = o.grao ?? .2;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      const lt = c.lt;
      const k0 = S.cam(lt), d = k0.d, cx = k0.x, cy = k0.y, rr = (k0.r || 0) * Math.PI / 180;
      // motor foco: salto em foco de um item ao outro (a parede desfoca, a câmera pula, o item novo pousa no centro)
      const js = S._saltos ? S._saltos.reduce((m, tj) => Math.max(m, 1 - Math.abs(lt - tj) / .18), 0) : 0;
      if (js > 0) { S._filtroExtra = `blur(${(js * 9).toFixed(1)}px) brightness(${(1 - .25 * js).toFixed(3)})`; ivBorrao(S.r, S, 0, 0, 0); }
      else { if (S._saltos) S._filtroExtra = ''; const p0 = S.cam(Math.max(0, lt - 1 / 30)), kk = 1000 / d;
        ivBorrao(S.r, S, (cx - p0.x) * kk, (cy - p0.y) * kk, Math.abs(1000 / d - 1000 / p0.d) / kk * 600 + Math.abs(k0.r - p0.r) * Math.PI / 180 * 600); }
      // (cx, cy) = ponto da parede no centro da tela; escala de cada item = 1000 / (d - dz)
      const proj = (x, y, dz) => {
        const k = 1000 / Math.max(120, d - dz);
        let sx = (x - cx) * k, sy = (y - cy) * k;
        const ux = sx * Math.cos(rr) - sy * Math.sin(rr), uy = sx * Math.sin(rr) + sy * Math.cos(rr);
        return [540 + ux, 960 + uy, k];
      };
      // foco: média ponderada da profundidade dos itens perto do centro da câmera
      let sw = 0, sdz = 0;
      // motor foco: peso de foco de cada item (1 = o assunto) — os da lista do foco atual; num ponto livre, o que está no lugar do assunto
      let pf = null;
      if (S.focoSets) {
        let i = 0; S.focoSets.forEach((f, j) => { if (lt >= f.t) i = j; });
        const cur = S.focoSets[i].ids, ant = i ? S.focoSets[i - 1].ids : cur, w = i ? clamp((lt - S.focoSets[i].t) / .3) : 1;
        const em = (ids, it, sx, sy) => ids ? (ids.includes(it.id) ? 1 : 0) : Math.exp(-(((sx - 540) ** 2 + (sy - 960 + IV_F.dy) ** 2) / (300 * 300)));
        pf = it => { const [sx, sy] = proj(it.x, it.y, it.dz); return lerp(em(ant, it, sx, sy), em(cur, it, sx, sy), w); };
        S.itens.forEach(it => { it._pf = pf(it); sw += it._pf + 1e-4; sdz += (it._pf + 1e-4) * it.dz; });
      } else S.itens.forEach(it => { const ww = Math.exp(-(((it.x - cx) ** 2 + (it.y - cy) ** 2) / (300 * 300))); sw += ww; sdz += ww * it.dz; });
      const dzF = o.foco ? (S.itens.find(x => x.id === o.foco)?.dz ?? 0) : (sw > 1e-6 ? sdz / sw : 0);
      const kw = 1000 / (d + 380), wx = 540 + (-7000 - cx) * kw, wy = 960 + (-7000 - cy) * kw;
      S.wall.style.transform = `translate(${wx.toFixed(1)}px,${wy.toFixed(1)}px) scale(${kw.toFixed(4)})`;
      S.wall.style.filter = `blur(${Math.min(6, Math.abs(-380 - dzF) * .01).toFixed(1)}px)`;
      if (pf) S.itens.forEach(it => {                 // motor foco: o item em foco nítido e claro; os outros escuros e desfocados
        const [sx, sy, k] = proj(it.x, it.y, it.dz), fo = it._pf;
        const ap = it.ta === null ? 1 : E.out(clamp((lt - it.ta) / .22));                      // preso: POUSA (1,08 -> 1), sem mola
        it.e.style.transform = `translate(${(sx - it.w / 2).toFixed(1)}px,${(sy - it.h / 2).toFixed(1)}px) rotate(${(it.rot + (k0.r || 0)).toFixed(2)}deg) scale(${(k * (1 + .08 * (1 - ap))).toFixed(4)})`;
        it.e.style.opacity = (it.ta === null ? 1 : clamp((lt - it.ta) / .1)).toFixed(3);
        const rho = Math.hypot(sx - 540, sy - 900);
        const bl = clamp((Math.abs(it.dz - dzF) * .03 + Math.max(0, rho - 380) * .009 + 4) * (1 - fo), 0, 10) + (1 - ap) * 8;
        const brl = lerp(IV_F.escuro, 1, fo) * (1 - (o.luz ?? .55) * clamp((rho - 260) / 900) * (1 - fo));
        it.e.style.filter = `drop-shadow(0 18px 26px rgba(0,0,0,.65)) brightness(${brl.toFixed(3)})` + (bl > .35 ? ` blur(${bl.toFixed(1)}px)` : '');
        it.sx = sx; it.sy = sy; it.k = k;
      });
      else S.itens.forEach(it => {
        const [sx, sy, k] = proj(it.x, it.y, it.dz);
        // golpe: o item chega batendo na parede (1,3× -> mola); antigo: 1,12× -> out5
        const ap = it.ta === null ? 1 : S._golpe ? IV_MOLA(clamp((lt - it.ta) / .5)) : E.out5(clamp((lt - it.ta) / .32));
        const s = k * (1 + (S._golpe ? .3 : .12) * (1 - ap));
        it.e.style.transform = `translate(${(sx - it.w / 2).toFixed(1)}px,${(sy - it.h / 2).toFixed(1)}px) rotate(${(it.rot + (k0.r || 0)).toFixed(2)}deg) scale(${s.toFixed(4)})`;
        it.e.style.opacity = (it.ta === null ? 1 : clamp((lt - it.ta) / .12)).toFixed(3);
        const rho = Math.hypot(sx - 540, sy - 900);
        const bl = clamp(Math.abs(it.dz - dzF) * .03 + Math.max(0, rho - 380) * .009, 0, 10) + Math.max(0, 1 - ap) * 10;
        const brl = 1 - (o.luz ?? .55) * clamp((rho - 260) / 900);
        it.e.style.filter = `drop-shadow(0 18px 26px rgba(0,0,0,.65)) brightness(${brl.toFixed(3)})` + (bl > .35 ? ` blur(${bl.toFixed(1)}px)` : '');
        it.sx = sx; it.sy = sy; it.k = k;
      });
      const pino = it => { const oy = -it.h / 2 + it.pinY, th = it.rot * Math.PI / 180; return proj(it.x - oy * Math.sin(th), it.y + oy * Math.cos(th), it.dz); };
      S.fios.forEach(f => {
        const pa = pino(f.A), pb = pino(f.B);
        // motor foco: o fio desenha DEPOIS do item pousar, com a câmera parada nele (.3 s depois, em .6 s)
        const q = f.ta === null ? 1 : S.focoSets ? E.inOut(clamp((lt - f.ta - IV_F.fio) / .6)) : E.inOut(clamp((lt - f.ta) / .5));
        const ex = lerp(pa[0], pb[0], q), ey = lerp(pa[1], pb[1], q), len = Math.hypot(ex - pa[0], ey - pa[1]);
        const mx = (pa[0] + ex) / 2, my = (pa[1] + ey) / 2 + len * .07;
        f.p.setAttribute('d', `M${pa[0].toFixed(1)},${pa[1].toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`);
        f.p.setAttribute('stroke-width', (2.6 * Math.sqrt((pa[2] + pb[2]) / 2)).toFixed(2));
        f.p.style.visibility = q > .01 ? 'visible' : 'hidden';
      });
      if (o.update) o.update(S, c);
    },
  });
}

// posição de um trecho achado pelo pagina.py (--marca): ivMarca('d_x', 'R$ 2,7 bi') -> [fx0, fy0, fx1, fy1] (fração da página)
function ivMarca(nome, trecho) {
  const m = window.MARCAS && MARCAS[nome] && MARCAS[nome][trecho];
  if (!m) throw new Error(`MARCAS sem ${nome} / "${trecho}" (rode pagina.py com --marca "${trecho}")`);
  return m;
}
// ---------- documento P&B em perspectiva com faixa de foco ----------
// docCena(beats, 'd_x', {cam: c => [[t, {x, y, z, r}], ...]  (x, y em FRAÇÃO da página: 0..1; z = zoom; r = giro),
//   inclina: 13 (graus, topo foge), faixa: [.36, .64] (faixa nítida na tela, 0..1), rack: c => t (tudo desfocado até t),
//   marcas: c => [[fx0, fy0, fx1, fy1, t], ...] (marca-texto vermelho em fração da página), larg: 1180, cap, build, update)
function docCena(beats, nome, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      const a = AS(nome);
      if (!a) throw new Error(`asset ${nome} não existe (provas.py modo doc)`);
      const W0 = o.larg ?? 1180, H0 = W0 * a.h / a.w;
      S.W0 = W0; S.H0 = H0;
      el(r, 'div', 'position:absolute;inset:0;background:#1d1d1e;');
      const faixa = o.faixa ?? [.34, .66];
      const copia = nitida => {
        const wrap = el(r, 'div', `position:absolute;inset:0;perspective:1500px;perspective-origin:50% 50%;` + (nitida ?
          `-webkit-mask-image:linear-gradient(180deg,rgba(0,0,0,0) ${(faixa[0] - .16) * 100}%,#000 ${faixa[0] * 100}%,#000 ${faixa[1] * 100}%,rgba(0,0,0,0) ${(faixa[1] + .16) * 100}%);` +
          `mask-image:linear-gradient(180deg,rgba(0,0,0,0) ${(faixa[0] - .16) * 100}%,#000 ${faixa[0] * 100}%,#000 ${faixa[1] * 100}%,rgba(0,0,0,0) ${(faixa[1] + .16) * 100}%);` : ''));
        const pg = el(wrap, 'div', `position:absolute;left:${540 - W0 / 2}px;top:0;width:${W0}px;height:${H0}px;background:${IV.papel};box-shadow:0 0 80px rgba(0,0,0,.6);`);
        const im = el(pg, 'img', 'position:absolute;inset:0;width:100%;height:100%;');
        im.decoding = 'sync'; im.src = a.src;
        pg.marcas = (o.marcas ? o.marcas(c) : []).map(([x0, y0, x1, y1, t]) => {
          const m = el(pg, 'div', `position:absolute;left:${x0 * W0 - 6}px;top:${y0 * H0}px;width:${(x1 - x0) * W0 + 12}px;height:${(y1 - y0) * H0}px;` +
            `background:${IV.marca};mix-blend-mode:multiply;border-radius:6px 3px 7px 4px;transform-origin:0 50%;transform:scaleX(0);`);
          m._t = t; return m;
        });
        if (!nitida) pg.style.filter = 'blur(9px) brightness(.97)';
        return { wrap, pg };
      };
      S.b = copia(false); S.n = copia(true);
      el(r, 'div', 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 62% at 50% 48%, rgba(0,0,0,0) 42%, rgba(0,0,0,.5) 100%);');
      // golpes: x, y em fração da página (como cam); a mão e o tranco viram px de tela pela largura/altura da página
      if (o.focos) {                               // motor foco: um trecho marcado por vez, no centro; de um trecho ao outro, salto em foco
        const alvo = a => {
          if (typeof a === 'string') a = { trecho: a };
          if (!a.trecho) return { r: 0, ...a };
          const m = ivMarca(nome, a.trecho);
          return { x: (m[0] + m[2]) / 2, y: (m[1] + m[3]) / 2, z: a.z ?? clamp(IV_F.largDoc / ((m[2] - m[0]) * W0), 1.2, 2.2), r: a.r ?? 0, salto: a.salto };
        };
        const F = ivFocos(c, o.focos(c).map(([t, a, dur]) => [t, alvo(a), dur]), { dy: (q, px) => px / (H0 * q.z), dx: (q, px) => px / (W0 * q.z), zk: 'z' }, { deriva: .04, ...(o.focoOp || {}) });   // página: deriva .04 (a câmera para no trecho para ler; a deriva a mantém viva)
        S.cam = ivGolpes(F, { padrao: { x: .5, y: .3, z: 1, r: 0 }, mx: 1 / W0, my: 1 / H0 }); S._golpe = true; S._foco = true; S._saltos = F.saltos;
      } else if (o.golpes) { S.cam = ivGolpes(o.golpes(c), { padrao: { x: .5, y: .3, z: 1, r: 0 }, mx: 1 / W0, my: 1 / H0 }); S._golpe = true; }
      else S.cam = ivKf(o.cam ? o.cam(c) : [[0, { x: .5, y: .3, z: 1 }], [c.dur, { z: 1.08 }]], { x: .5, y: .3, z: 1, r: 0 });
      S.r = r; S._mbProprio = true;
      S.rack = o.rack ? o.rack(c) : null;
      if (o.focos && S.rack !== null) S.rack = Math.min(S.rack, -.2);       // motor foco: o quadro 0 já sai quase em foco
      S.cap = o.cap ?? { modo: 'palavra', doc: true };
      S.vig = o.vig ?? .8; S.grao = o.grao ?? .2;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      const lt = c.lt, k = S.cam(lt), z = k.z;
      const X = k.x * S.W0, Y = k.y * S.H0;                      // ponto da página (em fração) que fica no centro da tela
      // motor foco: salto em foco (a faixa nítida some, a página pula de trecho desfocada e foca de novo em ~.36 s)
      const js = S._saltos ? S._saltos.reduce((m, tj) => Math.max(m, 1 - Math.abs(lt - tj) / .18), 0) : 0;
      if (js > 0) { S._filtroExtra = `blur(${(js * 7).toFixed(1)}px)`; ivBorrao(S.r, S, 0, 0, 0); }
      else { S._filtroExtra = ''; const p0 = S.cam(Math.max(0, lt - 1 / 30));
        ivBorrao(S.r, S, (k.x - p0.x) * S.W0 * z, (k.y - p0.y) * S.H0 * z, Math.abs(z - p0.z) / z * 600 + Math.abs(k.r - p0.r) * Math.PI / 180 * 600); }
      [S.b, S.n].forEach(({ pg }) => {
        pg.style.transformOrigin = `${X.toFixed(1)}px ${Y.toFixed(1)}px`;
        pg.style.transform = `translate(${(S.W0 / 2 - X).toFixed(1)}px,${(960 - Y).toFixed(1)}px) rotateX(${o.inclina ?? 13}deg) rotateZ(${(k.r || 0).toFixed(2)}deg) scale(${z.toFixed(4)})`;
        pg.marcas.forEach(m => { m.style.transform = `scaleX(${E.out(clamp((lt - m._t) / .3)).toFixed(4)})`; });
      });
      S.n.wrap.style.opacity = ((S.rack === null ? 1 : E.inOut(clamp((lt - S.rack) / .45))) * (1 - E.inOut(js))).toFixed(3);
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- foto de arquivo em tela cheia (P&B em retícula; provas.py modo foto -> f_<nome>.jpg) ----------
// fotoCena(beats, 'f_x', {z0: 1.12, z1: 1.0 (a referência abre devagar), fx: .5, fy: .45, cap, build, update})
function fotoCena(beats, nome, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      const a = AS(nome);
      if (!a) throw new Error(`asset ${nome} não existe (provas.py modo foto)`);
      S.img = el(r, 'img', 'position:absolute;left:0;top:0;transform-origin:0 0;filter:contrast(1.05);');
      S.img.decoding = 'sync'; S.img.src = a.src; S.a = a;
      el(r, 'div', 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 78% 64% at 50% 46%, rgba(0,0,0,0) 44%, rgba(0,0,0,.6) 100%);');
      S.cap = o.cap ?? { modo: 'palavra', doc: true };
      S.vig = o.vig ?? .7; S.grao = o.grao ?? .2;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      // golpes: c => ({planos: [[t, {x: fx, y: fy, z}, d]]}) — x, y em fração da foto, z ≥ 1 (a foto sempre cobre a tela)
      if (o.golpes && !S.cam) {
        const k0 = Math.max(1080 / S.a.w, 1920 / S.a.h);
        S.cam = ivGolpes(o.golpes(c), { padrao: { x: o.fx ?? .5, y: o.fy ?? .45, z: o.z0 ?? 1.12, r: 0 }, mx: 1 / (S.a.w * k0), my: 1 / (S.a.h * k0) });
        S._golpe = true; S._mbProprio = true; S._filtroExtra = 'contrast(1.05)';
      }
      // motor foco: focos: c => [[t, {x, y, z}]] — o ponto da foto que é o assunto (fração), z ≥ 1; zoom de ênfase, sem panorâmica
      if (o.focos && !S.cam) {
        const k0 = Math.max(1080 / S.a.w, 1920 / S.a.h), U = { dy: (q, px) => px / (S.a.h * k0 * q.z), dx: (q, px) => px / (S.a.w * k0 * q.z), zk: 'z' };
        S.cam = ivGolpes(ivFocos(c, o.focos(c), U, { chega: 0, sai: 0, ...o.focoOp }), { padrao: { x: o.fx ?? .5, y: o.fy ?? .45, z: o.z0 ?? 1.12, r: 0 }, mx: 1 / (S.a.w * k0), my: 1 / (S.a.h * k0) });
        S._golpe = true; S._foco = true; S._mbProprio = true; S._filtroExtra = 'contrast(1.05)';
      }
      const g = S.cam ? S.cam(c.lt) : null;
      const pos = lt => {
        const v = S.cam ? S.cam(lt) : null;
        const z = v ? Math.max(1, v.z) : lerp(o.z0 ?? 1.12, o.z1 ?? 1.0, E.inOut(clamp(lt / Math.max(1, c.dur))));
        const k = Math.max(1080 / S.a.w, 1920 / S.a.h) * z, w = S.a.w * k, h = S.a.h * k;
        return [k, clamp(540 - (v ? v.x : o.fx ?? .5) * w, 1080 - w, 0), clamp(960 - (v ? v.y : o.fy ?? .45) * h, 1920 - h, 0)];
      };
      const [k, x, y] = pos(c.lt);
      S.img.style.width = `${S.a.w}px`; S.img.style.height = `${S.a.h}px`;
      S.img.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(4)})`;
      if (g) { const [k1, x1, y1] = pos(c.lt - 1 / 30); ivBorrao(S.img, S, x - x1, y - y1, Math.abs(k / k1 - 1) * 600); }
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- site / página impressa com borda rasgada (provas.py modo site -> w_<nome>.png) ----------
// siteCena(beats, 'w_x', {w: 980, inclina: 10, rack: c => 0, cam: c => [[t, {x, y, z}]], marcas: c => [[fx0, fy0, fx1, fy1, t]], cap})
//   a impressão fica num plano inclinado sobre uma cópia gigante desfocada dela mesma (o "bokeh" da referência)
function siteCena(beats, nome, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      const a = AS(nome);
      if (!a) throw new Error(`asset ${nome} não existe (provas.py modo site)`);
      const w = o.w ?? 980, h = w * a.h / a.w;
      const fundo = el(r, 'img', `position:absolute;left:${540 - 1500}px;top:${960 - 1500 * a.h / a.w}px;width:3000px;filter:blur(26px) brightness(.55) contrast(.9);`);
      fundo.decoding = 'sync'; fundo.src = a.src;
      S.wrap = el(r, 'div', 'position:absolute;inset:0;perspective:1500px;perspective-origin:50% 48%;');
      S.pg = el(S.wrap, 'div', `position:absolute;left:${540 - w / 2}px;top:${960 - h / 2}px;width:${w}px;height:${h}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.7));`);
      const im = el(S.pg, 'img', 'position:absolute;inset:0;width:100%;height:100%;');
      im.decoding = 'sync'; im.src = a.src;
      S.marcas = (o.marcas ? o.marcas(c) : []).map(([x0, y0, x1, y1, t]) => {
        const m = el(S.pg, 'div', `position:absolute;left:${x0 * w - 5}px;top:${y0 * h}px;width:${(x1 - x0) * w + 10}px;height:${(y1 - y0) * h}px;` +
          `background:${IV.marca};mix-blend-mode:multiply;border-radius:5px 3px 6px 4px;transform-origin:0 50%;transform:scaleX(0);`);
        m._t = t; return m;
      });
      S.w = w; S.h = h;
      el(r, 'div', 'position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,.6) 100%);');
      if (o.focos) {                               // motor foco: alvo {x, y, z} em fração do print, ou a caixa [fx0, fy0, fx1, fy1] de um trecho
        const alvo = a => Array.isArray(a) ? { x: (a[0] + a[2]) / 2, y: (a[1] + a[3]) / 2, z: clamp(IV_F.largDoc / ((a[2] - a[0]) * w), 1, 2.2), r: 0 } : { r: 0, ...a };
        const F = ivFocos(c, o.focos(c).map(([t, a, dur]) => [t, alvo(a), dur]), { dy: (q, px) => px / (h * q.z), dx: (q, px) => px / (w * q.z), zk: 'z' }, o.focoOp);
        S.cam = ivGolpes(F, { padrao: { x: .5, y: .5, z: 1, r: 0 }, mx: 1 / w, my: 1 / h }); S._golpe = true; S._foco = true;
      } else if (o.golpes) { S.cam = ivGolpes(o.golpes(c), { padrao: { x: .5, y: .5, z: 1, r: 0 }, mx: 1 / w, my: 1 / h }); S._golpe = true; }
      else S.cam = ivKf(o.cam ? o.cam(c) : [[0, { x: .5, y: .5, z: 1 }], [c.dur, { z: 1.07 }]], { x: .5, y: .5, z: 1, r: 0 });
      S.r = r; S._mbProprio = true;
      S.rack = o.rack ? o.rack(c) : 0;
      if (o.focos && S.rack !== null) S.rack = Math.min(S.rack, -.25);      // motor foco: o quadro 0 já sai quase em foco
      S.cap = o.cap ?? { modo: 'palavra' };
      S.vig = o.vig ?? .8; S.grao = o.grao ?? .2;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      const lt = c.lt, k = S.cam(lt), z = k.z;
      const X = k.x * S.w, Y = k.y * S.h;
      { const p0 = S.cam(Math.max(0, lt - 1 / 30));
        ivBorrao(S.r, S, (k.x - p0.x) * S.w * z, (k.y - p0.y) * S.h * z, Math.abs(z - p0.z) / z * 600 + Math.abs(k.r - p0.r) * Math.PI / 180 * 600); }
      S.pg.style.transformOrigin = `${X.toFixed(1)}px ${Y.toFixed(1)}px`;
      S.pg.style.transform = `translate(${(S.w / 2 - X).toFixed(1)}px,${(S.h / 2 - Y).toFixed(1)}px) rotateX(${o.inclina ?? 10}deg) rotateZ(${(k.r || 0).toFixed(2)}deg) scale(${z.toFixed(4)})`;
      const q = S.rack === null ? 1 : E.inOut(clamp((lt - S.rack) / .5));
      S.pg.style.filter = `drop-shadow(0 30px 40px rgba(0,0,0,.7))` + (q < .98 ? ` blur(${((1 - q) * 14).toFixed(1)}px)` : '');
      S.marcas.forEach(m => { m.style.transform = `scaleX(${E.out(clamp((lt - m._t) / .3)).toFixed(4)})`; });
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- TV de tubo no quarto escuro ----------
// tvCena(beats, {img: 'i_x' (print na tela; pos: '50% 0%' = recorte) | clipe: 'nome' (render/clips/<nome>/, toca na tela), from, cam: c => [[t, {x, y, z, r}]],
//                rack: c => 0, cap, build, update}) — asset g_tv60 (vem do modelo/ da skill pelo preparar)
function tvCena(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', lead: o.lead,
    camMove: o.focos ? camF(o.focos, o.focoOp) : o.golpes ? camG(o.golpes) : o.cam ? camC(o.cam) : camOlha([[0, { x: 560, y: 1000, z: 1.0, r: -1.2 }], [6, { z: 1.12, r: .8 }]]),
    build(r, S, c) {
      el(r, 'div', 'position:absolute;left:-600px;top:-600px;width:2280px;height:3120px;background:' +
        'radial-gradient(ellipse 34% 22% at 50% 52%, rgba(205,210,220,.13), rgba(0,0,0,0) 70%),' +
        'linear-gradient(180deg,#0c0c0c 0%,#121212 47%,#191919 47.4%,#0e0e0e 70%,#060606 100%);');
      el(r, 'div', 'position:absolute;left:-600px;top:-600px;width:1000px;height:3120px;background:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0));transform:skewY(-8deg);');
      const tw = o.w ?? 860, th = tw * 964 / 1100, cx = 540, cy = 1080, x0 = cx - tw / 2, y0 = cy - th / 2;
      const sx = x0 + .088 * tw, sy = y0 + .125 * th, sw = (.739 - .088) * tw, sh = (.668 - .125) * th;
      const tv = el(r, 'img', `position:absolute;left:${x0}px;top:${y0}px;width:${tw}px;filter:grayscale(1) brightness(.5) contrast(1.2) drop-shadow(0 40px 50px rgba(0,0,0,.8));`);
      tv.decoding = 'sync'; tv.src = AS('g_tv60') ? AS('g_tv60').src : '';         // a tela do PNG é opaca: a imagem vai POR CIMA
      S.tela = el(r, 'div', `position:absolute;left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;border-radius:9%;overflow:hidden;background:#111;`);
      if (o.clipe) S.cl = clipe(S.tela, o.clipe, S, { from: o.from ?? 0, z0: 1, z1: 1.04, w: sw, h: sh, ate: c.dur + .05 });   // roda até o corte
      else {
        const a = AS(o.img); if (!a) throw new Error(`asset ${o.img} não existe`);
        const im = el(S.tela, 'img', `position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${o.pos ?? '50% 50%'};filter:brightness(1.1) contrast(1.12);`);
        im.decoding = 'sync'; im.src = a.src;
      }
      el(S.tela, 'div', 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, rgba(0,0,0,0) 2px 5px),' +
        'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,.14) 0%, rgba(0,0,0,0) 45%), radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%);');
      el(r, 'div', `position:absolute;left:${sx - 60}px;top:${sy - 60}px;width:${sw + 120}px;height:${sh + 120}px;border-radius:30%;` +
        'background:radial-gradient(ellipse, rgba(220,225,235,.10), rgba(0,0,0,0) 70%);mix-blend-mode:screen;pointer-events:none;');
      S.rack = o.rack ? o.rack(c) : 0;
      if (o.focos && S.rack !== null) S.rack = Math.min(S.rack, -.25);      // motor foco: o quadro 0 já sai quase em foco
      S.cap = o.cap ?? { modo: 'palavra' };
      S.vig = o.vig ?? .8; S.grao = o.grao ?? .26;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      const q = S.rack === null ? 1 : E.inOut(clamp((c.lt - S.rack) / .55));
      S._filtroExtra = q < .98 ? `blur(${((1 - q) * 12).toFixed(1)}px)` : '';
      S.tela.parentNode.style.filter = S._filtroExtra;                      // o embrulho do scene() soma o borrão de movimento
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- clipe de vídeo (render/clips/<nome>/0001.jpg, 30 fps) — na TV ou em tela cheia P&B ----------
// g = clipe(p, 'nome', S, {from, rate, fx, fy, z0, z1, dur, t0, ate, n, w, h, pb: true})
// VÍDEO REAL RODA SEMPRE NORMAL (regra do Felipe, 03/11/2026: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal"):
//   - nunca preso no último quadro: com `ate` (tempo local em que ele sai da tela), o trecho começa antes (from menor) para acabar junto
//     com a cena; se mesmo assim for curto, ele volta ao começo (pulo, nunca quadro parado) — o certo é trocar o assunto antes do fim
//     ou usar outro trecho;
//   - visível antes de t0 (com from > 0): roda desde antes, em vez de esperar parado no 1º quadro;
//   - nunca câmera lenta por quadro repetido: rate < 1 vale 1 (câmera lenta só de clipe já gravado assim).
function clipe(p, nome, S, o = {}) {
  const Wc = o.w ?? 1080, Hc = o.h ?? 1920;
  const g = el(p, 'div', `position:absolute;left:0;top:0;width:${Wc}px;height:${Hc}px;overflow:hidden;background:#000;`);
  const img = el(g, 'img', `position:absolute;left:0;top:0;transform-origin:0 0;${o.pb === false ? '' : 'filter:grayscale(1) contrast(1.15);'}`);
  img.decoding = 'sync';
  g.img = img; g.cur = -1; g.t0 = o.t0 ?? 0; g.from = o.from ?? 0; g.rate = Math.max(1, o.rate ?? 1);
  g.n = o.n ?? (window.CLIPN && CLIPN[nome]) ?? 90;
  if (o.ate !== undefined) {                         // começa já rodando para não acabar antes de sair da tela
    const prec = (o.ate - g.t0) * 30 * g.rate;
    if (g.from * 30 + prec > g.n - 1) g.from = Math.max(0, (g.n - 1 - prec) / 30);
  }
  (S.async = S.async || []).push(async (lt, cc) => {
    if (g.style.display === 'none') return;
    // 1 quadro do clipe por quadro do vídeo, pelo contador inteiro (cc.frame): o arredondamento de tempo com fração ,5 repetia um
    // quadro e pulava o seguinte (vídeo engasgando)
    const kq = cc && cc.frame !== undefined ? cc.frame - Math.round((cc.t0 + g.t0) * 30) : (lt - g.t0) * 30;
    let f = Math.max(0, Math.round(g.from * 30) + Math.round(kq * g.rate));
    if (f > g.n - 1) f %= g.n;                       // acabou: volta ao começo (nunca preso no último quadro)
    if (f !== g.cur) { img.src = `clips/${nome}/${String(f + 1).padStart(4, '0')}.jpg`; try { await img.decode(); } catch (e) { } g.cur = f; }
    const iw = img.naturalWidth || 1080, ih = img.naturalHeight || 1920;
    const u = clamp((lt - g.t0) / (o.dur ?? 3)), z = lerp(o.z0 ?? 1.0, o.z1 ?? 1.06, E.inOut(u));
    const k = Math.max(Wc / iw, Hc / ih) * z, w = iw * k, h = ih * k;
    const x = clamp(Wc / 2 - (o.fx ?? .5) * w, Wc - w, 0), y = clamp(Hc / 2 - (o.fy ?? .5) * h, Hc - h, 0);
    img.style.width = `${iw}px`; img.style.height = `${ih}px`;
    img.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k.toFixed(4)})`;
  });
  return g;
}

// ---------- mapa escuro do Brasil com estados em vermelho (BRGEO do kit) ----------
// mapaCena(beats, {alvo: ['MA','CE'], acende: c => t (ou {MA: t1, CE: t2}), cam: c => [[t, {x, y, z, r}]] (coordenadas do mapa,
//   Brasil inteiro ≈ x 90–990, y 510–1380), rotulos: (p, svg, S, c) => [...] (use linha()/tracejado() nas coordenadas do mapa), cap})
function mapaCena(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', lead: o.lead,
    camMove: o.focos ? camF(o.focos, o.focoOp) : o.golpes ? camG(o.golpes) : o.cam ? camC(o.cam) : camOlha([[0, { x: 560, y: 900, z: 1.0 }], [5, { z: 1.15 }]]),
    build(r, S, c) {
      el(r, 'div', 'position:absolute;left:-3000px;top:-3000px;width:7080px;height:7920px;background:#070707;');
      const s = svgAbs(r, 0, 0, W, H);
      const defs = sv(s, 'defs');
      const pid = uid('pt'), cid = uid('cl');
      const pt = sv(defs, 'pattern', { id: pid, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
      sv(pt, 'circle', { cx: 3.5, cy: 3.5, r: 1.15, fill: 'rgba(0,0,0,.35)' });
      const cp = sv(defs, 'clipPath', { id: cid }); sv(cp, 'path', { d: BRGEO.country });
      const land = sv(s, 'g', {});
      land.style.filter = 'drop-shadow(0 0 1px rgba(255,255,255,.25)) drop-shadow(0 12px 20px rgba(0,0,0,.8))';
      sv(land, 'path', { d: BRGEO.country, fill: '#323235' });
      // "relevo": traços finos aleatórios dentro do país (estradas/rios estilizados)
      const ruas = sv(land, 'g', { 'clip-path': `url(#${cid})`, stroke: '#46464b', 'stroke-width': .9, fill: 'none', opacity: .9 });
      for (let i = 0; i < 160; i++) {
        let x = 90 + hrand(i * 1.7) * 900, y = 510 + hrand(i * 2.9 + 1) * 870, d = `M${x.toFixed(1)},${y.toFixed(1)}`;
        for (let j = 0; j < 6; j++) { x += (hrand(i * 13 + j) - .5) * 60; y += (hrand(i * 7 + j * 3) - .5) * 60; d += ` L${x.toFixed(1)},${y.toFixed(1)}`; }
        sv(ruas, 'path', { d });
      }
      sv(land, 'rect', { x: 0, y: 0, width: W, height: H, fill: `url(#${pid})`, 'clip-path': `url(#${cid})` });
      S.uf = {};
      BRGEO.states.forEach(z => {
        const pth = sv(land, 'path', { d: z.d, fill: 'none', stroke: '#141416', 'stroke-width': 1.6 });
        S.uf[z.uf] = { z, pth };
      });
      S.alvos = (o.alvo || []).map(uf => {
        const z = S.uf[uf].z, g = sv(s, 'g', {});
        g.style.filter = 'drop-shadow(0 0 10px rgba(228,24,24,.65)) drop-shadow(0 0 30px rgba(228,24,24,.3))';
        sv(g, 'path', { d: z.d, fill: '#c8261f' });
        sv(g, 'path', { d: z.d, fill: `url(#${pid})` });
        sv(g, 'path', { d: z.d, fill: 'none', stroke: '#ff4a3c', 'stroke-width': 1.2, opacity: .7 });
        g.setAttribute('opacity', 0);
        return { uf, g };
      });
      const ac = o.acende ? o.acende(c) : 0;
      S.acende = uf => (typeof ac === 'number' ? ac : (ac[uf] ?? 0));
      S.svg = sv(s, 'g', {});
      S.rot = o.rotulos ? o.rotulos(r, S.svg, S, c) : [];
      S.cap = o.cap ?? { modo: 'none' };
      S.vig = o.vig ?? .65; S.grao = o.grao ?? .22;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      S.alvos.forEach(a => {
        const t = S.acende(a.uf), u = clamp((c.lt - t) / .18);
        const pisca = u > 0 && u < 1 ? (Math.sin(u * 22) > 0 ? 1 : .35) : (u >= 1 ? 1 : 0);
        a.g.setAttribute('opacity', pisca.toFixed(3));
      });
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- final: perfil REAL preso na parede, botão Seguir -> Seguindo (só se a fala pedir para seguir) ----------
// fimPerfilInv(['B128','B129'], {perfil: 'perfil_felipedantasf', toque: ['B129', 'seguir'], nome: 'Felipe Dantas'})
function fimPerfilInv(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', lead: o.lead,
    camMove: (lt, c) => { const u = E.inOut(clamp(lt / Math.max(1, c.dur))); return { s: 1 + .07 * u, x: 0, y: -10 * u, r: lerp(-.6, .4, u) }; },
    build(r, S, c) {
      el(r, 'div', `position:absolute;left:-200px;top:-200px;width:1480px;height:2320px;background:#0a0a0a url(${AS('t_parede') ? AS('t_parede').src : ''}) 0 0/1100px 1100px repeat;`);
      const [tb, tw] = o.toque || [beats[beats.length - 1], 'seguir'];
      S.tT = c.w(tb, tw); S.tIn = Math.max(0, Math.min(.25, S.tT - .9));
      const a = AS(o.perfil || 'perfil_felipedantasf');
      const cw = 820, ch = a ? cw * a.h / a.w : 520;
      S.card = box(r, 540, 860, cw + 56, ch + 56 + 170, 'background:#e7e6e2;opacity:0;filter:drop-shadow(0 26px 36px rgba(0,0,0,.7));');
      if (a) { const im = el(S.card, 'img', `position:absolute;left:28px;top:28px;width:${cw}px;filter:grayscale(1) contrast(1.08);`); im.src = a.src; }
      else el(S.card, 'div', `position:absolute;left:28px;top:60px;width:${cw}px;text-align:center;font-family:${SANS};font-weight:700;font-size:64px;color:${IV.tinta};`, esc(o.nome || ''));
      el(S.card, 'div', `position:absolute;left:${(cw + 56) / 2 - 15}px;top:10px;width:30px;height:30px;border-radius:50%;` +
        'background:radial-gradient(circle at 36% 32%,#fff 0%,#bbb 32%,#5c5c5c 66%,#2a2a2a 100%);box-shadow:4px 7px 7px rgba(0,0,0,.65);');
      S.btn = el(S.card, 'div', `position:absolute;left:50%;bottom:44px;transform:translateX(-50%);min-width:440px;padding:22px 40px;border-radius:999px;text-align:center;` +
        `font-family:${SANS};font-weight:700;font-size:54px;letter-spacing:-.02em;background:${IV.verm};color:#fff;box-shadow:0 0 30px rgba(228,24,24,.5);`, 'Seguir');
      S.cap = lt => lt >= S.tIn - .05 ? { modo: 'none' } : { modo: 'palavra' };
      S.vig = .7; S.grao = .2;
      cue(c, 'click', S.tT, { g: .5 });
    },
    update(S, c) {
      const lt = c.lt;
      entra(S.card, lt, S.tIn, { k: 'foco', d: .4 });
      const on = lt >= S.tT;
      S.btn.textContent = on ? 'Seguindo ✓' : 'Seguir';
      S.btn.style.background = on ? '#2a2a2a' : IV.verm; S.btn.style.boxShadow = on ? 'none' : '0 0 30px rgba(228,24,24,.5)';
      S.btn.style.transform = `translateX(-50%) scale(${(1 - .08 * Math.sin(Math.PI * clamp((lt - S.tT + .08) / .2))).toFixed(3)})`;
    },
  });
}

// ============================================================================
//  MOTOR FOCO (03/11/2026) — portado da vox-edit2, onde o A/B foi APROVADO pelo Felipe ("B aprovado, aplica"), e adaptado ao dossiê.
//  Pedido: "a velocidade parece atrapalhar o acompanhamento... o dinamismo precisa ser perfeito para que os olhos possam acompanhar,
//  muitos efeitos se perdem na tela e não são focalizados". A câmera não era mais rápida que a referência; o olho é que perseguia o
//  conteúdo: panorâmica demais, 2+ textos na tela, letras andando e borrando no chicote, itens entrando juntos e pelas bordas.
//   1. um assunto por vez, grande e no centro (IV_F.dy acima do meio; a legenda de 1 palavra fica embaixo, em y 1371)
//   2. um texto por vez: a legenda (já fixa, fora da câmera) é o único texto corrido, com a chave em vermelho na própria legenda; a
//      tipografia vira FRASES FIXAS, uma por vez (ivFrases); o número grande vira o assunto (ivNumero); a legenda some enquanto isso
//   3. a câmera chega já no assunto (de perto, .5 s; quadro 0 nunca vazio), no máximo UM movimento por frase (>= ~1 s entre eles),
//      zoom para dar ênfase, deriva contínua; panorâmica só na troca de assunto do mural e na saída em chicote do corte; sem tranco
//   4. nada desliza da borda: o assunto seguinte POUSA no mesmo lugar (1,08 -> 1 em .22 s) e o anterior sai ou escurece
//   5. efeitos um de cada vez e no centro: no mural o item pousa e DEPOIS o fio desenha, com a câmera parada nele; no documento o
//      marca-texto passa com a página parada e a troca de trecho é um salto em foco (rack), sem arrastar a página
//   6. ambiente mais baixo: grão ×.65, sem tranco, sem mola, câmera na mão 5 px
//   7. vídeo REAL roda normal (30 q/s): o clipe() nunca para no último quadro nem anda em câmera lenta (veja o clipe())
// ============================================================================
const IV_F = {
  dy: 80,               // o assunto fica dy px acima do centro da tela (a legenda de 1 palavra cabe embaixo, y 1371)
  chega: 0,             // chegada: 10% mais perto, assenta em .5 s (só zoom: o quadro 0 já mostra o assunto); > 0 = vem de lado (px)
  sai: 120, saiZoom: 1.3,   // saída no corte: chicote que MERGULHA (zoom ×1,3 + 120 px de lado) — o assunto fica no centro; sai: 0 = sem saída
  deriva: .03, mao: 5,  // zoom contínuo por segundo e câmera na mão (px de tela)
  arco: .22,            // numa viagem de um assunto a outro (> 150 px, mesmo zoom), a câmera abre 22% no meio e fecha de novo
  yFrase: 880,          // centro das frases fixas, do número e dos assuntos
  largMural: 820,       // largura na tela de um item do mural em foco
  largDoc: 880,         // largura na tela de um trecho marcado em foco
  escuro: .38,          // brilho dos itens do mural fora de foco
  fio: .3,              // no mural, o fio desenha .3 s depois de o item pousar (em .6 s)
  grao: .65,            // grão do motor foco (× S.grao)
};

// ivFocos(c, focos, U, o) -> opções do ivGolpes. focos: [[t, {x, y, z|d, r, salto}, dur], ...] = o CENTRO DO ASSUNTO a cada frase.
//   O 1º é a chegada (t ignorado); cada seguinte é UM movimento que começa .2 s antes de t (dur padrão .7). Assunto que muda de lugar
//   (> 150 px, sem mudar o zoom) faz a câmera abrir no meio da viagem (arco). salto: true = pulo em foco (docCena, muralCena), sem
//   viagem. A saída é um chicote que mergulha (zoom) e atravessa o corte. U = conversão de px de tela para o mundo da cena:
//   {dy(q, px), dx(q, px), zk: 'z'|'d'}. o: {dy, chega, sai, saiZoom, deriva, mao, arco, golpes: [[t, px]] (tranco de propósito),
//   corte: .2 (tranco no baque; padrão: nenhum)}
function ivFocos(c, focos, U, o) {
  o = o || {};
  const d = c.dur, dy = o.dy ?? IV_F.dy, ch = o.chega ?? IV_F.chega, sa = o.sai ?? IV_F.sai, ar = o.arco ?? IV_F.arco, sz = o.saiZoom ?? IV_F.saiZoom;
  const zr = (a, b) => U.zk === 'd' ? Math.max(a.d / b.d, b.d / a.d) : Math.max((a.z ?? 1) / (b.z ?? 1), (b.z ?? 1) / (a.z ?? 1));
  const perto = (q, f) => U.zk === 'd' ? { d: q.d / f } : { z: (q.z ?? 1) * f };
  const pos = q => { const p = { ...q }; delete p.salto; p.y = q.y + U.dy(q, dy); p.r = q.r ?? 0; return p; };
  const pl = [], saltos = [], f0 = pos(focos[0][1]);
  pl.push([-1, { ...f0, x: f0.x - U.dx(f0, ch), ...perto(f0, 1.1), r: -1.5 }]);
  pl.push([-.12, f0, focos[0][2] ?? .5]);
  let ant = f0;
  focos.slice(1).forEach(([t, q, dd]) => {
    const p = pos(q);
    if (q.salto) { pl.push([t - .1, p, .04]); saltos.push(t - .08); ant = p; return; }
    const px = Math.hypot(p.x - ant.x, p.y - ant.y) / Math.max(1e-9, U.dx(p, 1));
    pl.push([t - .2, px > 150 && ar && zr(p, ant) < 1.3 ? { ...p, arco: ar } : p, dd ?? .7]);
    ant = p;
  });
  if (sa) pl.push([d - .18, { ...ant, x: ant.x + U.dx(ant, sa), ...perto(ant, sz), r: 2 }, .5]);
  return { planos: pl, golpes: o.golpes ?? [], deriva: o.deriva ?? IV_F.deriva, mao: o.mao ?? IV_F.mao, corte: o.corte ?? false, saltos };
}
// camF(c => [[t, {x, y, z}], ...], o) — câmera de scene() no motor foco (no lugar do camG/camC). x, y = CENTRO DO ASSUNTO no mundo
//   da cena, z = zoom (1 = tamanho real). Também é a câmera da opção focos de tvCena e mapaCena (mesmas coordenadas do cam delas).
const camF = (fn, o = {}) => {
  let f = null;
  const m = (lt, c) => {
    f = f || ivGolpes(ivFocos(c, fn(c), { dy: (q, px) => px / (q.z ?? 1), dx: (q, px) => px / (q.z ?? 1), zk: 'z' }, o), { padrao: { x: 540, y: 960, z: 1, r: 0 } });
    const v = f(lt); return { s: v.z, x: -v.z * (v.x - 540), y: -v.z * (v.y - 960), r: v.r };
  };
  m._golpe = true; m._foco = true;
  return m;
};

// camada FIXA da cena (fora da câmera: não anda, não borra no chicote, não treme) — frases e número do motor foco
function ivFixo(r, S) {
  if (!S.fixo) S.fixo = el(r.parentNode, 'div', 'position:absolute;inset:0;z-index:2;pointer-events:none;');
  S._foco = true;
  return S.fixo;
}
// véu: o mundo (câmera) escurece por trás de uma frase/número fixo. S._veus = [[t0, t1, opacidade]]
function ivVeu(r, S) {
  if (S.veu) return S.veu;
  S.veu = el(r.parentNode, 'div', 'position:absolute;inset:0;z-index:1;pointer-events:none;background:#050505;opacity:0;');
  S._veus = S._veus || [];
  (S._upd = S._upd || []).push((S_, cc) => {
    const lt = cc.lt; let v = 0;
    S._veus.forEach(([a, z, op]) => { if (lt >= a - .05 && lt < z + .1) v = Math.max(v, op * clamp((lt - a + .05) / .25) * clamp((z + .1 - lt) / .15)); });
    S.veu.style.opacity = v.toFixed(3);
  });
  return S.veu;
}

// ivFrases(r, S, c, [frase, ...], {y, entre, larg}) — TIPOGRAFIA do motor foco: UMA frase por vez, FIXA na tela, no centro.
//   frase falada: {b: 'B30' | ['B31', 'B32'], spec: 'ax4|Vx3*@170', de}   (spec do linhaFala: um estilo por palavra, 'Vx3' junta 3,
//                 '*' letras fora de ordem, '@170' tamanho, '-' pula, '|' linha nova; de = 1ª palavra)
//   texto livre:  {linhas: [[['incluindo', 'a', {s: 56}], ['4', 'V', {s: 300}]], ...], ts: [[t, t], ...]}   (tempos locais)
//   por frase:    {t0 (pousa; padrão .07 s antes da 1ª parte), t1 (sai; padrão: quando a próxima pousa), y, entre,
//                  veu: .6 (o mundo escurece atrás: frase por cima de uma foto), traco: {linha, parte, t, d} (tracejado vermelho sob
//                  a parte, desenhando com tudo parado)}
//   A frase pousa no lugar (1,06 -> 1 em .2 s), cada parte acende na sua palavra e ela sai (.1 s, em cruz) quando a próxima pousa. Deriva lenta
//   (+2%/s) para nunca congelar. A legenda some enquanto há frase; a 1ª frase da cena já está no quadro 0; linha mais larga que larg
//   (960) encolhe no centro. -> [{w, gs, ts, t0, t1}]
function ivFrases(r, S, c, lista, o = {}) {
  const P = ivFixo(r, S), larg = o.larg ?? 960;
  S._capOculta = S._capOculta || [];
  const fr = lista.map(f => {
    const w = el(P, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;');   // visível no build: o linha() mede
    const entre = f.entre ?? o.entre ?? 160;
    let gs, ts;
    if (f.linhas) { gs = f.linhas.map((L_, j) => linha(w, L_, 540, j * entre, { alinha: 'centro' })); ts = f.ts.map(x => x.slice()); }
    else {
      const bs = Array.isArray(f.b) ? f.b : [f.b];
      const lf = linhaFala(w, c, bs[0], f.spec, 540, 0, { alinha: 'centro', entre, junta: bs, de: f.de });
      gs = lf.gs; ts = lf.ts;
    }
    gs.forEach(g => {
      // centra pela largura VISÍVEL (o scrollWidth do linha() conta a serifa antes de condensar e puxa a linha ~7% para a esquerda)
      const u = g.ws[g.ws.length - 1], W_ = u.offsetLeft + u.offsetWidth, H_ = g.offsetHeight;
      g._base = `translate(${(-W_ / 2).toFixed(1)}px,${(-H_ * .78).toFixed(1)}px)`;
      g.caixa = () => ({ x0: 540 - W_ / 2, x1: 540 + W_ / 2, y0: parseFloat(g.style.top) - H_ * .78, y1: parseFloat(g.style.top) + H_ * .22 });
      g._k = W_ > larg ? larg / W_ : 1;
      g.style.transformOrigin = `${(W_ / 2).toFixed(1)}px ${(H_ * .78).toFixed(1)}px`;
      g.style.transform = g._base + (g._k < 1 ? ` scale(${g._k.toFixed(4)})` : '');
    });
    const cx = gs.map(g => g.caixa()), y0 = Math.min(...cx.map(b => b.y0)), y1 = Math.max(...cx.map(b => b.y1));
    const F = { f, w, gs, ts, oy: (y0 + y1) / 2, dy: (f.y ?? o.y ?? IV_F.yFrase) - (y0 + y1) / 2 };
    F.t0 = f.t0 ?? Math.min(...ts.flat().filter(x => x !== null && x !== undefined)) - .07;
    if (f.traco) {
      const j = f.traco.linha ?? gs.length - 1, g = gs[j], sp = g.ws[f.traco.parte ?? g.ws.length - 1], b = cx[j], k = g._k;
      const xa = 540 + (b.x0 + sp.offsetLeft - 540) * k, xb = 540 + (b.x0 + sp.offsetLeft + sp.offsetWidth - 540) * k, yb = j * entre + 26 * k;
      F.tr = tracejado(svgAbs(w, 0, 0, 1080, 1920), reta(xa.toFixed(1), yb.toFixed(1), xb.toFixed(1), yb.toFixed(1)), { c: IV.verm, w: 3.2, dash: 14, gap: 10 });
    }
    w.style.display = 'none';
    return F;
  });
  fr.forEach((F, i) => { F.t1 = F.f.t1 ?? (fr[i + 1] ? fr[i + 1].t0 : 1e9); });
  // a 1ª parte de cada frase acende junto com o pouso (troca em cruz, sem quadro vazio entre uma frase e a outra)
  fr.forEach(F => { if (F.ts[0] && F.ts[0].length && F.ts[0][0] !== null && F.ts[0][0] !== undefined) F.ts[0][0] = Math.min(F.ts[0][0], F.t0 + .02); });
  if (fr.length && fr[0].t0 < .25 && fr[0].f.t0 === undefined) {           // 1ª frase da cena: já nítida no quadro 0
    fr[0].t0 = -.1; if (fr[0].ts[0] && fr[0].ts[0].length) fr[0].ts[0][0] = Math.min(fr[0].ts[0][0], -.3);
  }
  fr.forEach(F => { S._capOculta.push([F.t0, F.t1 + .1]); if (F.f.veu) { ivVeu(r, S); S._veus.push([F.t0, F.t1, F.f.veu]); } });   // legenda volta depois da saída
  (S._upd = S._upd || []).push((S_, cc) => {
    const lt = cc.lt;
    fr.forEach(F => {
      const vis = lt >= F.t0 && lt < F.t1 + .1;
      F.w.style.display = vis ? 'block' : 'none';
      if (!vis) return;
      const q = E.out(clamp((lt - F.t0) / .2)), sai = clamp((lt - F.t1) / .1);
      F.w.style.opacity = (clamp((lt - F.t0) / .08) * (1 - sai)).toFixed(3);
      F.w.style.transformOrigin = `540px ${F.oy.toFixed(1)}px`;
      F.w.style.transform = `translate(0px,${F.dy.toFixed(1)}px) scale(${(lerp(1.06, 1, q) * (1 + .02 * Math.max(0, lt - F.t0))).toFixed(4)})`;
      F.w.style.filter = sai > 0 ? `blur(${(sai * 8).toFixed(1)}px)` : '';
      F.gs.forEach((g, j) => g.at(lt, F.ts[j], { d: .2 }));
      if (F.tr) F.tr.draw(clamp((lt - F.f.traco.t) / (F.f.traco.d ?? .4)));
    });
  });
  return fr;
}

// ivNumero(r, S, c, {t, ate, para, de: 0, casas: 0, pre: '', suf: '', s: 240, fonte: 'o que é · fonte, ano', y, veu: .6, conta: .9})
//   número grande FIXO no centro = o assunto daquele instante: conta até o valor a partir de t (com borrão), a fonte e o ano em sans
//   pequena logo abaixo (mesmo bloco); o mundo escurece por trás e a legenda some até `ate`. -> {n, f, w}
function ivNumero(r, S, c, o) {
  const P = ivFixo(r, S), y = o.y ?? IV_F.yFrase, px = o.s ?? 240, base = y + px * .3;
  const w = el(P, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;opacity:0;');   // visível no build: o contador mede
  const n = contador(w, 540, base, { de: o.de ?? 0, para: o.para, casas: o.casas, pre: o.pre, suf: o.suf ?? '', s: px, virgula: o.virgula });
  const f = o.fonte ? linha(w, [[o.fonte, 'a', { s: 30, cor: IV.cinza }]], 540, base + 64, { alinha: 'centro' }) : null;
  w.style.display = 'none';
  const t0 = o.t - .1, t1 = o.ate ?? 1e9;
  (S._capOculta = S._capOculta || []).push([t0, t1 + .1]);
  if (o.veu !== 0) { ivVeu(r, S); S._veus.push([t0, t1, o.veu ?? .6]); }
  (S._upd = S._upd || []).push((S_, cc) => {
    const lt = cc.lt, vis = lt >= t0 && lt < t1 + .1;
    w.style.display = vis ? 'block' : 'none';
    if (!vis) return;
    const q = E.out(clamp((lt - t0) / .2)), sai = clamp((lt - t1) / .1);
    w.style.opacity = (clamp((lt - t0) / .08) * (1 - sai)).toFixed(3);
    w.style.transformOrigin = `540px ${y}px`;
    w.style.transform = `scale(${(lerp(1.06, 1, q) * (1 + .015 * Math.max(0, lt - t0))).toFixed(4)})`;
    n.at(lt, o.t, o.conta ?? .9);
    if (f) f.at(lt, o.t + (o.conta ?? .9) * .6);
  });
  return { n, f, w };
}

// ivAssuntos(r, S, c, [['i_x' | 'p_x', t, {w, rot, dy, tarja, tira, escurece}], ...], {x: 540, y: 880, w}) — um assunto por vez,
//   grande, no ponto (x, y) do mundo (ponha o foco do camF nele). O 1º aparece em t (null = já no quadro 0); cada seguinte POUSA no
//   mesmo lugar e o anterior sai .22 s depois (escurece: true = fica atrás a 35%). 'p_' = pessoa recortada (tarja até tira = tempo
//   do nome), o resto = impressa (foto com borda e percevejo). -> [e, ...]
function ivAssuntos(r, S, c, lista, o = {}) {
  S._foco = true;
  const X = o.x ?? 540, Y = o.y ?? IV_F.yFrase;
  const es = lista.map(([nome, t, op = {}]) => {
    const pessoa = nome.startsWith('p_'), w = op.w ?? o.w ?? (pessoa ? 760 : 860);
    const e = pessoa ? recorte(r, nome, X, Y + (op.dy ?? 0), w, { tarja: op.tarja, funde: op.funde, fundeDe: op.fundeDe })
      : impressa(r, nome, X, Y + (op.dy ?? 0), w, { rot: op.rot ?? 0, tipo: op.tipo, dobra: op.dobra, pino: op.pino });
    e._t = t ?? -.1; e._op = op; e._f0 = e._filtro || '';
    return e;
  });
  es.forEach((e, i) => { e._prox = es[i + 1] ? es[i + 1]._t : null; });
  if (es.length && es[0]._t < .25) es[0]._t = -.1;
  (S._upd = S._upd || []).push((S_, cc) => {
    const lt = cc.lt;
    es.forEach(e => {
      const esc = e._op.escurece && e._prox !== null && lt > e._prox + .22;
      e._filtro = e._f0 + (esc ? ' brightness(.35)' : '');
      entra(e, lt, e._t, { k: 'pousa', out: e._prox !== null && !e._op.escurece ? e._prox + .22 : undefined, od: .22 });
      if (e.tira && e._op.tira !== undefined) e.tira(lt, e._op.tira);
    });
  });
  return es;
}
