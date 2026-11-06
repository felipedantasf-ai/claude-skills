// ============================================================================
//  edit-founded — biblioteca do formato "história de fundador" (referência: canal FOUNDED, TikTok/Reels, Monster Energy, out/2026)
//  1ª parte do render/scenes.js (work/<prefixo>_a.js). Precisa do motor do Kit_Edicao_Vox_v2.
//
//  Narração com imagens; o apresentador aparece 10–15 vezes por 2–4 s (tela cheia ou num círculo), o resto é só imagem. Uma imagem em tela cheia por palavra forte (~100 trocas/min, plano de ~0,5 s),
//  cor de cinema (quente, saturada), legenda no MEIO da tela misturando serifa itálica e sans pesado, palavra por palavra.
//   1. rajada de planos (foto ou trecho de vídeo), corte seco a cada palavra forte          rajada(), rajadaAuto()
//   2. cartão branco ou vermelho com a frase (anos, viradas: "1989,", "he found one.")     cartaoCor()
//   3. faixa letterbox 16:9 no meio, preto em cima e embaixo (vídeo largo)                  faixa()
//   4. tríptico: 3 painéis empilhados que entram um a um                                     tripla()
//   5. produto girando sobre fundo escuro com a marca                                        produtoGira()
//   6. gráfico de alta: produto + linha verde subindo + % em serifa itálica                  alta()
//   7. print de site/loja descendo                                                           siteCor()
//   8. final: tela preta com a marca de quem fala                                            fimMarca()
//   9. apresentador 10–15 vezes, 2–4 s, em tela cheia ou num círculo sobre as imagens       presFD()
//  10. motor golpe (02/11/2026, portado da vox-edit2, A/B aprovado): toda imagem chega com a curva do chicote medida nas refs
//      (não com E.out), câmera sempre viva (deriva + mão), chicote com blur direcional nas emendas entre cenas de imagem
//      e cartões, mola nas entradas, tranco nos impactos. window.FD_MOTOR = 'golpe' (só para reeditar vídeo de 02–03/11).
//  11. motor foco (03/11/2026, PADRÃO; A/B aprovado na vox-edit2 e adaptado aqui): o olho fica num ponto só e o conteúdo vem até
//      ele. Cada plano põe o ASSUNTO (op.foco = [fx, fy] na imagem) no ponto do assunto da tela (FD_FOCO.x/y) e aproxima em volta
//      dele; legenda fixa logo abaixo (FD_FOCO.capY), sem andar nem borrar; emenda em corte seco no mesmo lugar (chicote só na
//      virada pedida, chicote: 'dir'); tríptico acende um painel por vez no lugar; tranco vira soco de zoom; número grande é o
//      assunto e a legenda some (fdNumero; op.semLegenda quando a imagem já mostra a palavra); grão e mão mais baixos.
//      window.FD_MOTOR = 'antigo' volta ao movimento de antes de 02/11.
// ============================================================================
const FD = { branco: '#fcfcfc', vermelho: '#f2212d', preto: '#050505', verde: '#29e33a', tinta: '#111111' };
const FD_SERIF = 'TimesInv', FD_SANS = 'Inter', FD_CX = .86;
// palavras de ligação (ficam em serifa itálica). Por vídeo: FD_ITALICO.add('juice'); para forçar sans: FD_FORTE.add('12')
const FD_ITALICO = new Set(('a o as os um uma uns umas de do da dos das em no na nos nas num numa e que para pra por pelo pela pelos pelas ' +
  'com sem se ao aos ja so mas ou nem me te lhe eu ele ela eles elas voce isso esse essa este esta isto foi era sao tem ha ate mais muito ' +
  'como quando onde quem qual seu sua seus suas nosso nossa la ca ai tao tambem nao ainda depois entao hoje anos ano quase cerca apenas so ' +
  'the of and in on at to a an with for from his her its was were is are had has by just this that then into nearly about').split(' '));
const FD_FORTE = new Set();
// motor foco (03/11/2026): ponto do ASSUNTO na tela (x, y; nas caixas menores vale a mesma proporção), legenda FIXA logo abaixo
// (capY), zoom máximo que o plano usa para levar o assunto ao ponto (zMax), aproximação de cada plano (zFoto/zVideo), grão e mão
// mais baixos (ambiente ~0,4 do antes), palavra-chave maior na própria legenda (chave; corChave opcional). Por vídeo: FD_FOCO.y = 720
const FD_FOCO = { x: 540, y: 760, capY: 1040, zMax: 1.25, zFoto: .09, zVideo: .05, grao: .06, mao: 2, chave: 1.22, corChave: null };
const FD_CHAVE = new Set();        // palavras-chave (sem acento, minúsculas): FD_CHAVE.add('falida') -> maior na legenda, nunca um 2º texto
const fdItal = w => { const n = norm(w.w); return !FD_FORTE.has(n) && (FD_ITALICO.has(n) || /^\$?[\d.,]+$/.test(w.w.replace(/[,.]$/, '')) && FD_ITALICO.has('#num')); };

// ---------- grão e vinheta por cena (S.grao, S.vig) ----------
let _fdGrao = null;
function fdGraoTex() {
  if (_fdGrao) return _fdGrao;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const x = c.getContext('2d'), im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 70; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0);
  return (_fdGrao = c.toDataURL());
}
const _fdC = document.createElement('canvas').getContext('2d');
function fdLarg(txt, px, fam, peso = 400, estilo = 'normal') { _fdC.font = `${estilo} ${peso} ${px}px ${fam}`; return _fdC.measureText(txt).width; }

// ---------- legenda: palavra por palavra, frase de até 3 palavras, serifa itálica + sans pesado, no MEIO da tela ----------
let FD_BLOCOS = null;
function fdBlocos() {
  if (FD_BLOCOS) return FD_BLOCOS;
  const all = []; TIMING.beats.forEach(b => b.words.forEach(w => all.push(w)));
  const cortes = SCENES.map(x => x.t0).filter(t => t > 0);
  const L = []; let cur = [];
  const push = () => { if (cur.length) L.push({ words: cur }); cur = []; };
  all.forEach((w, j) => {
    if (cur.length && cortes.some(ct => ct > cur[cur.length - 1].s + .05 && ct <= w.s + .2)) push();   // cena nova zera a frase
    const txt = cur.map(x => x.w).join(' ');
    if (cur.length >= 3 || (cur.length && txt.length + w.w.length > 19)) push();
    cur.push(w);
    if (/[.;:?!,]$/.test(w.w)) push();
  });
  push();
  L.forEach(c => { c.s = c.words[0].s - .02; });
  L.forEach((c, i) => {
    const nx = L[i + 1], fim = c.words[c.words.length - 1].e, ult = c.words[c.words.length - 1].s;
    const ct = cortes.find(t => t > ult + .05);
    c.e = Math.min(nx ? nx.s : fim + .6, fim + .5, ct ?? 1e9);
  });
  return (FD_BLOCOS = L);
}
let _fdKey = '';
renderCaptions = function (t) {
  const box = $('cap'), S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  const cfg = typeof S.cap === 'function' ? S.cap(t - CUR_SCENE.t0) : (S.cap || {});
  const gr = $('grain'), vg = $('vig');
  const Fo = fdFoco(), lt = window.CUR_SCENE ? t - CUR_SCENE.t0 : t;
  if (gr) { if (!gr._ok) { gr.style.backgroundImage = `url(${fdGraoTex()})`; gr._ok = 1; } gr.style.opacity = (S.grao ?? (Fo ? FD_FOCO.grao : .14)).toFixed(3); }
  if (vg) vg.style.opacity = (S.vig ?? .35).toFixed(3);
  // motor foco: a legenda some enquanto o assunto é a própria palavra (plano com op.semLegenda: logo, número, cartaz) ou um
  // número grande (fdNumero -> S.fdOcultas = [[t0, t1]] em tempo da cena)
  if (cfg.modo === 'none' || S.fdSemLeg || (S.fdOcultas || []).some(([a, z]) => lt >= a && lt < z)) { box.style.opacity = 0; return; }
  const L = fdBlocos();
  let idx = -1;
  for (let i = 0; i < L.length; i++) if (t >= L[i].s && t < L[i].e) { idx = i; break; }
  if (idx < 0) { box.style.opacity = 0; return; }
  const ws = L[idx].words, s = cfg.s ?? 64, cor = cfg.cor ?? '#ffffff';
  const key = `${idx}|${s}|${cor}|${Fo}`;
  if (key !== _fdKey) {
    _fdKey = key;
    box.className = 'fd-cap';
    // motor foco: sombra mais larga e macia (a legenda fixa passa por céu claro, logo branco, painel aceso) — sem caixa, como na referência
    const sombra = cor !== '#ffffff' ? 'none' : Fo ? '0 0 22px rgba(0,0,0,.55), 0 2px 8px rgba(0,0,0,.55), 0 0 2px rgba(0,0,0,.5)' : '0 2px 12px rgba(0,0,0,.45), 0 0 2px rgba(0,0,0,.35)';
    box.style.cssText = `position:absolute;z-index:5;opacity:1;background:none;box-shadow:none;padding:0;text-align:center;line-height:.98;` +
      `width:${cfg.larg ?? 620}px;color:${cor};text-shadow:${sombra};white-space:normal;`;
    box.innerHTML = '';
    box._sp = ws.map((w, i) => {
      const it = fdItal(w), txt = w.w, ch = FD_CHAVE.has(norm(w.w)), kc = ch ? FD_FOCO.chave : 1;   // palavra-chave: maior, na própria legenda
      let sp;
      if (it) {      // serifa itálica condensada (Times a 86%), um pouco maior que a sans
        const px = Math.round(s * 1.08 * kc), lw = fdLarg(txt, px, FD_SERIF, 400, 'italic') * FD_CX;
        sp = el(box, 'span', `display:inline-block;width:${lw.toFixed(1)}px;white-space:nowrap;vertical-align:baseline;`);
        el(sp, 'span', `display:inline-block;transform:scaleX(${FD_CX});transform-origin:0 50%;font-family:${FD_SERIF};font-style:italic;font-weight:400;font-size:${px}px;letter-spacing:-.01em;`, esc(txt));
      } else sp = el(box, 'span', `display:inline-block;font-family:${FD_SANS};font-weight:800;font-size:${Math.round(s * kc)}px;letter-spacing:-.045em;`, esc(txt));
      if (ch && FD_FOCO.corChave && cor === '#ffffff') sp.style.color = FD_FOCO.corChave;
      if (i < ws.length - 1) sp.style.marginRight = `${(s * .22).toFixed(1)}px`;
      sp._w = w; return sp;
    });
  }
  box._sp.forEach(sp => { const q = clamp((t - (sp._w.s - .02)) / .06); sp.style.opacity = q.toFixed(3); });   // entra seco (2 quadros)
  box.style.left = `${cfg.x ?? 540}px`; box.style.top = `${cfg.y ?? (Fo ? FD_FOCO.capY : 975)}px`;
  box.style.transform = `translate(calc(-50% + ${(cfg.dx ?? 0).toFixed(1)}px),calc(-50% + ${(cfg.dy ?? 0).toFixed(1)}px))` +   // dx/dy: entrada com mola no cartão
    (cfg.k ? ` scale(${cfg.k.toFixed(4)})` : '');                                                                       // k: deriva lenta da frase no cartão (motor foco)
  box.style.opacity = 1;
};

// ---------- cor de cinema (quente, saturada, preto denso) aplicada em cada plano ----------
const FD_COR = 'saturate(1.14) contrast(1.08) brightness(.97)';
// retícula suave: nas FOTOS ela já vem gravada pelo imagens.py; nos vídeos entra esta trama de pontos por cima (window.FD_RETICULA_VIDEO)
let _fdTrama = null;
function fdTrama() {
  if (_fdTrama) return _fdTrama;
  const c = document.createElement('canvas'); c.width = c.height = 12; const x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 12, 12); x.fillStyle = '#000';
  [[3, 3], [9, 9]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 1.9, 0, Math.PI * 2); x.fill(); });
  return (_fdTrama = c.toDataURL());
}

// ---------- motor golpe (02/11/2026) ----------
// Medição: as refs do Felipe (earn.edits) andam a ~11 px/quadro com chicotes de blur; a demo v6 andava a 3,5 px/q com o
// E.out (metade do caminho em 27% do tempo = arranque seco e cauda longa). Aqui o formato já troca de imagem a cada ~0,5 s,
// então o motor não põe mais cortes: muda COMO cada plano anda e COMO as cenas emendam.
//   - curva golpe: a velocidade começa a ~45% do pico, chega ao pico em 20% do tempo e desliza até zero (metade do caminho
//     em 36%); mola: passa ~9% do ponto e assenta. As duas iguais às da vox-edit2 (E2C.golpe / E2C.mola).
//   - cada plano: aproximação forte e curta com a curva golpe (foto 1,03 → 1,15 em .7 s; vídeo 1,03 → 1,09) + deriva contínua
//     (zoom .035/s) + câmera na mão (4 px): nunca para.
//   - chicote na emenda: a cena de imagem sai acelerando no sentido do chicote nos últimos .2 s (zoom +40% e desliza pela sobra
//     da imagem, sem mostrar borda) e a seguinte CHEGA do lado oposto no mesmo sentido em .4 s. Blur direcional (SVG) só
//     acima de ~10 px/quadro. Automático entre cenas de imagem e cartões; o apresentador e o final ficam em corte seco.
//   - tranco: trancos: [[t, 6–10 px]] na cena (impacto, número, nome que pousa).
// window.FD_MOTOR: 'foco' (padrão desde 03/11/2026) | 'golpe' (02/11) | 'antigo' (antes de 02/11)
const fdModo = () => window.FD_MOTOR ?? 'foco';
const fdMotor = () => fdModo() !== 'antigo';            // curva golpe + pose sem estado + blur (golpe e foco)
const fdFoco = () => fdModo() === 'foco';
const _fdGT = (() => {
  const N = 200, v = [], p = [0];
  for (let i = 0; i <= N; i++) { const u = i / N, a = u / .2; v.push(u < .2 ? .45 + .55 * a * a * (3 - 2 * a) : Math.pow(1 - (u - .2) / .8, 2.2)); }
  for (let i = 1; i <= N; i++) p.push(p[i - 1] + (v[i - 1] + v[i]) / 2);
  return p.map(x => x / p[N]);
})();
const _fdMol1 = 1 - Math.exp(-6) * Math.cos(8);
const FDG = {
  golpe: u => { u = clamp(u); const f = u * 200, i = Math.min(199, Math.floor(f)); return lerp(_fdGT[i], _fdGT[i + 1], f - i); },
  mola: u => { u = clamp(u); return u >= 1 ? 1 : (1 - Math.exp(-6 * u) * Math.cos(8 * u)) / _fdMol1; },
};
function fdWig(t, f, a, sem = 0) {              // wiggle(f, a) do AE: ruído suave
  const x = t * f + sem * 17.31, i = Math.floor(x), u = x - i, q = u * u * u * (u * (u * 6 - 15) + 10);
  const v = k => hrand(k * 1.618 + sem * 7.77) * 2 - 1; return a * lerp(v(i), v(i + 1), q);
}
const FD_DIR = { esq: [-1, 0], dir: [1, 0], cima: [0, -1], baixo: [0, 1] };
const FD_CHIC_SAI = .2, FD_CHIC_LONGO = .6, FD_CHIC_CHEGA = .4, FD_CHIC_ZOOM = .4;
function fdTranco(lt, L) {                      // tranco de câmera: [[t, amp]] -> deslocamento que some em ~.5 s
  let x = 0, y = 0;
  for (const [t, a] of (L || [])) { const u = lt - t; if (u < 0 || u > .6) continue; const s = a * Math.exp(-u * 9); x += s * Math.sin(u * 55); y += s * .8 * Math.cos(u * 47); }
  return { x, y };
}
// blur direcional por elemento (um filtro SVG para cada, porque o tríptico mostra 3 ao mesmo tempo)
let _fdMbN = 0;
function fdBorra(e) {
  const id = `fdmb${_fdMbN++}`, sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sv.setAttribute('width', '0'); sv.setAttribute('height', '0'); sv.style.position = 'absolute';
  sv.innerHTML = `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" edgeMode="duplicate"/></filter>`;
  document.body.appendChild(sv);
  const gb = sv.querySelector('feGaussianBlur');
  return (vx, vy, rad = 0) => {                   // velocidades em px de tela por quadro
    const sx = Math.min(28, Math.max(0, vx + rad * .5 - 10) * .45), sy = Math.min(28, Math.max(0, vy + rad * .5 - 10) * .45);
    if (sx + sy < 1.2) { if (e.style.filter) e.style.filter = ''; return; }
    gb.setAttribute('stdDeviation', `${sx.toFixed(1)} ${sy.toFixed(1)}`); e.style.filter = `url(#${id})`;
  };
}
// direção do chicote na emenda entre a cena k e a k+1 (null = corte seco). Só entre cenas de imagem e cartões; cena com
// chicote: false não chicoteia; chicote: 'esq'|'dir'|'cima'|'baixo' escolhe o sentido (o conteúdo anda para esse lado).
const FD_CHIC_SEQ = ['esq', 'dir', 'cima', 'esq', 'baixo', 'dir'];
function fdChicEmenda(k) {
  if (!fdMotor()) return null;
  const a = SCENES[k], b = SCENES[k + 1];
  if (!a || !b || a.fdChic === false || b.fdChic === false) return null;
  const ok = x => x.fdTipo === 'img' || x.fdTipo === 'cartao';
  if (!ok(a) || !ok(b) || (a.fdTipo === 'cartao' && b.fdTipo === 'cartao')) return null;
  if (fdFoco()) return typeof b.fdChic === 'string' ? b.fdChic : null;       // motor foco: corte seco no mesmo lugar; chicote só na virada pedida
  return typeof b.fdChic === 'string' ? b.fdChic : FD_CHIC_SEQ[(b.k ?? k + 1) % FD_CHIC_SEQ.length];
}
const fdCenaK = c => SCENES.findIndex(s => s.ctx === c);
// chegada e saída em chicote da cena atual: {chega: dir|null, sai: {t, dir}|null}. Motor foco: só a SAÍDA em chicote (a cena seguinte
// já começa enquadrada no assunto, sem chegar deslizando)
function fdChicCena(c) { const k = fdCenaK(c); return { chega: k > 0 && !fdFoco() ? fdChicEmenda(k - 1) : null, sai: fdChicEmenda(k) ? { t: c.dur, dir: fdChicEmenda(k) } : null }; }

// ---------- motor foco: soco de zoom, número como assunto, marca como textura, deriva da câmera ----------
// câmera das cenas sem planos (produtoGira, alta): no motor foco chega aproximando 5% com a curva golpe (.6 s, como cada plano) e
// depois deriva .02/s em volta do ponto do assunto (nunca congela); nos outros motores, parada
const fdCamDeriva = (lt, c) => fdFoco() ? { s: (1 + .05 * FDG.golpe(lt / .6)) * Math.exp(.02 * Math.max(0, lt)), x: 0, y: 0, r: 0 } : camStill(lt, c);
// tranco do motor golpe -> soco de zoom no assunto (o assunto não sai do lugar): [[t, amp]] = +amp*0,6% em .1 s, assenta em ~.35 s
function fdSoco(lt, L) {
  let k = 1;
  for (const [t, a] of (L || [])) { const u = lt - t; if (u < 0 || u > .7) continue; k *= 1 + a * .006 * (u < .1 ? E.out(u / .1) : Math.exp(-(u - .1) * 8)); }
  return k;
}
// fdNumero(r, S, 'US$ 1 tri', 'valor de mercado · CNBC, 21/09/2026', t0, t1, {y, s, veu, cor}) — número grande no ponto do assunto,
// fonte em letra pequena logo abaixo (um bloco só), véu escurecendo a imagem; a legenda some entre t0 e t1 (tempos da cena).
// Devolve {set(txt)} para trocar o número (contador). Use no build de rajada/faixa/tripla: build: (r, S, c) => fdNumero(r, S, ...)
function fdNumero(r, S, txt, fonteTxt, t0, t1, o = {}) {
  const veu = o.veu === 0 ? null : el(r, 'div', `position:absolute;inset:0;background:#050505;opacity:0;pointer-events:none;`);
  const box = el(r, 'div', `position:absolute;left:0;width:1080px;top:${o.y ?? FD_FOCO.y - 40}px;text-align:center;opacity:0;pointer-events:none;transform:translateY(-50%);`);
  const num = el(box, 'div', `white-space:nowrap;color:${o.cor ?? '#ffffff'};text-shadow:0 2px 14px rgba(0,0,0,.5);line-height:1;`);
  if (fonteTxt) el(box, 'div', `margin:26px auto 0;width:${o.largFonte ?? 860}px;font-family:${FD_SANS};font-weight:400;font-size:${o.sFonte ?? 28}px;line-height:1.25;color:rgba(255,255,255,.7);`, esc(fonteTxt));
  let ult = null;
  const set = s => {
    if (s === ult) return; ult = s; num.innerHTML = ''; if (!s) return;
    const px = o.s ?? 150, lw = fdLarg(s, px, FD_SERIF, 400, 'italic') * FD_CX;          // serifa itálica condensada, como o % da referência
    const sp = el(num, 'span', `display:inline-block;width:${lw.toFixed(1)}px;`);
    el(sp, 'span', `display:inline-block;transform:scaleX(${FD_CX});transform-origin:0 50%;font-family:${FD_SERIF};font-style:italic;font-size:${px}px;`, esc(s));
  };
  set(txt);
  (S.fdOcultas = S.fdOcultas || []).push([t0, t1]);
  (S.async = S.async || []).push(lt => {
    const on = lt >= t0 && lt < t1, q = clamp((lt - t0) / .12), qs = clamp((t1 - lt) / .1);
    if (veu) veu.style.opacity = (on ? (o.veu ?? .55) * q * qs : 0).toFixed(3);
    box.style.opacity = (on ? Math.min(q * 2, 1) * qs : 0).toFixed(3);                     // nasce no lugar (sem deslizar)
  });
  return { set, box };
}
// marca repetida em relevo como TEXTURA (canvas -> imagem de fundo), não como texto: ela é fundo e não disputa a leitura com a
// legenda. A linha que cairia atrás da legenda (evitaY) fica de fora.
function fdMarcaFundo(r, marca, alfa = .07, evitaY = []) {
  const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; const x = cv.getContext('2d');
  x.font = `900 150px ${FD_SANS}`; x.textAlign = 'center'; x.textBaseline = 'top';
  if ('letterSpacing' in x) x.letterSpacing = '9px';
  for (let i = 0; i < 6; i++) {
    const y = -40 + i * 360;
    if (evitaY.some(v => v > y - 70 && v < y + 220)) continue;
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillText(marca, 540, y + 2); x.fillStyle = `rgba(255,255,255,${alfa})`; x.fillText(marca, 540, y);
  }
  return el(r, 'div', `position:absolute;inset:0;pointer-events:none;background:url(${cv.toDataURL()}) 0 0/1080px 1920px;`);
}

// ---------- plano: foto (asset) ou trecho de vídeo ('clip:nome', render/clips/<nome>/0001.jpg a 30 fps) cobrindo a área ----------
// fdPlano(p, fonte, S, {w, h, mov: 'sai' | 'entra' | 'esq' | 'dir' | 'sobe' | 'fixo', z: .1 (quanto de zoom), fx, fy, from, t0, fim, dur,
//   foco, alvo, zMax, semLegenda, pousa}) — fim = quando o plano sai da tela (vídeo real roda a 30 q/s até lá; rate fica em 1)
//   MESCLA foto + vídeo (pedido do Felipe, 30/10): ~60% foto (pessoa, lugar, logo, documento) e ~40% vídeo (ação), intercalados.
//   Foto: padrão 'entra' (aproxima ~7% com desaceleração; 'sai' abre devagar). Vídeo: aproximação leve (4%) + trama de retícula
//   por cima, para os dois tipos terem a mesma textura.
function fdPlano(p, fonte, S, o = {}) {
  const Wc = o.w ?? 1080, Hc = o.h ?? 1920;
  const g = el(p, 'div', `position:absolute;left:0;top:0;width:${Wc}px;height:${Hc}px;overflow:hidden;background:#000;`);
  const img = el(g, 'img', `position:absolute;left:0;top:0;transform-origin:0 0;filter:${o.cor === false ? 'none' : FD_COR};`);
  img.decoding = 'sync';
  const ehClip = fonte.startsWith('clip:'), nome = ehClip ? fonte.slice(5) : fonte;
  if (!ehClip) { const a = AS(nome); if (!a) throw new Error(`asset ${nome} não existe`); img.src = a.src; g.iw = a.w; g.ih = a.h; }
  g.t0 = o.t0 ?? 0; g.cur = -1; g.n = ehClip ? ((window.CLIPN && CLIPN[nome]) ?? 60) : 1;
  // VÍDEO REAL RODA SEMPRE NORMAL (Felipe, 03/11/2026: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal"):
  // 30 q/s, nunca preso no último quadro, nunca câmera lenta por quadro repetido. o.fim = quando o plano sai da tela (a rajada, a
  // faixa, o tríptico e o círculo passam sozinhos). Trecho curto: o início recua para o vídeo acabar junto com o plano. Se nem do
  // quadro 1 ele cabe, ou se rate < 1, sai ERRO no console (o fechar acusa): troque o assunto antes (no mesmo lugar) ou extraia mais longo.
  const vq = 30 * (o.rate ?? 1);
  g.ini = (o.from ?? 0) * 30;
  if (ehClip && o.fim !== undefined && o.fim > g.t0 && g.t0 < 1e8) {
    const precisa = (o.fim - g.t0) * vq;
    if (g.ini + precisa > g.n - 1) g.ini = Math.max(0, g.n - 1 - precisa);
    if (precisa > g.n + 2) console.error(`CLIPE CURTO ${nome}: fica ${(o.fim - g.t0).toFixed(2)} s na tela e o trecho tem ${(g.n / 30).toFixed(2)} s — vai travar no último quadro. Troque o assunto antes ou extraia o trecho mais longo`);
  }
  if (ehClip && (o.rate ?? 1) < 1) console.error(`CLIPE LENTO ${nome}: rate ${o.rate} repete quadros (câmera lenta trava o vídeo real) — use rate 1`);
  const mov = o.mov ?? 'entra', dur = o.dur ?? 1.0, G = fdMotor() && o.motor !== false, F = G && fdFoco();
  const z = o.z ?? (F ? (ehClip ? FD_FOCO.zVideo : FD_FOCO.zFoto) : G ? (ehClip ? .06 : .12) : (ehClip ? .04 : .07));
  if (ehClip && (window.FD_RETICULA_VIDEO ?? .16) > 0) el(g, 'div', `position:absolute;inset:0;pointer-events:none;background:url(${fdTrama()}) 0 0/12px 12px;` +
    `mix-blend-mode:multiply;opacity:${window.FD_RETICULA_VIDEO ?? .16};`);
  // motor golpe: pose(lt) = posição da imagem (x, y, escala) em função do tempo da cena; sem estado, para medir a velocidade
  // entre dois quadros e dar o blur direcional. o.chega = 'esq'|... (chega em chicote), o.sai = {t, dir} (sai em chicote),
  // o.trancos = [[t, amp]] (tempos da cena), o.dEnt (.7) = duração da aproximação golpe, o.deriva (.035/s), o.mao (4 px)
  // motor foco: o.foco = [fx, fy] = o ASSUNTO na imagem (frações; rosto = entre olhos e boca, logo, produto). Ele vai para o ponto do
  // assunto (o.alvo = [x, y] na caixa; padrão FD_FOCO.x/y na proporção da caixa) e a aproximação acontece em volta dele (zoom, não
  // panorâmica). Se a imagem não tem sobra para levar o assunto até lá, o plano já começa aproximado o mínimo necessário (até
  // o.zMax/FD_FOCO.zMax). o.pousa (1.08) = troca no lugar pousando (escala 1,08 -> 1 em .22 s). Tranco vira soco de zoom (fdSoco).
  const z0 = .03, dEnt = o.dEnt ?? (o.dur ?? .5), dz = o.deriva ?? .02, mao = o.mao ?? (F ? FD_FOCO.mao : 3), sem = (g.t0 * 7.3 + (o.from ?? 0)) % 50;
  const fo = F && o.foco ? o.foco : null, alvo = o.alvo ?? [Wc * FD_FOCO.x / 1080, Hc * FD_FOCO.y / 1920];
  const kAuto = () => {
    if (!fo) return 1;
    const kb = Math.max(Wc / g.iw, Hc / g.ih), fx = clamp(fo[0], .02, .98), fy = clamp(fo[1], .02, .98);
    const wN = Math.max(alvo[0] / fx, (Wc - alvo[0]) / (1 - fx)), hN = Math.max(alvo[1] / fy, (Hc - alvo[1]) / (1 - fy));
    return clamp(Math.max(wN / (g.iw * kb), hN / (g.ih * kb)), 1, o.zMax ?? FD_FOCO.zMax);
  };
  g.pose = lt => {
    const l = lt - g.t0, q = FDG.golpe(l / dEnt);
    let k;
    if (F) { const b = Math.max(1 + z0, kAuto()); k = mov === 'sai' ? b * (1 + z * (1 - q)) : mov === 'entra' ? b * (1 + z * q) : mov === 'fixo' ? b : b * (1 + z); }
    else k = mov === 'sai' ? 1 + z0 + z * (1 - q) : mov === 'entra' ? 1 + z0 + z * q : mov === 'fixo' ? 1 + z0 : 1 + z0 + z;
    k *= Math.exp(dz * Math.max(0, l));
    if (o.pousa) k *= 1 + ((o.pousa === true ? 1.08 : o.pousa) - 1) * (1 - E.out(clamp(l / .22)));
    if (F) k *= fdSoco(lt, o.trancos);
    let ox = 0, oy = 0;                                   // deslocamento em frações da sobra da imagem (-1..1)
    if (mov === 'esq') ox = 1 - 2 * q; if (mov === 'dir') ox = -(1 - 2 * q);
    if (mov === 'sobe') oy = 1 - 2 * q; if (mov === 'desce') oy = -(1 - 2 * q);
    if (o.chega && FD_DIR[o.chega]) {                     // chega do lado oposto ao sentido do chicote, freando
      const D = FD_DIR[o.chega], p = 1 - FDG.golpe(l / (o.dChega ?? FD_CHIC_CHEGA));
      k *= 1 + FD_CHIC_ZOOM * p; ox -= D[0] * p; oy -= D[1] * p;
    }
    if (o.sai && FD_DIR[o.sai.dir]) {                     // sai acelerando: começo de um chicote que termina na cena seguinte
      const D = FD_DIR[o.sai.dir], ls = lt - (o.sai.t - FD_CHIC_SAI);
      if (ls > 0) { const p = FDG.golpe(ls / FD_CHIC_LONGO) / FDG.golpe(FD_CHIC_SAI / FD_CHIC_LONGO); k *= 1 + FD_CHIC_ZOOM * p; ox += D[0] * p; oy += D[1] * p; }
    }
    const k0 = Math.max(Wc / g.iw, Hc / g.ih) * k, w = g.iw * k0, h = g.ih * k0, sx = (w - Wc) / 2, sy = (h - Hc) / 2;
    const tr = F ? { x: 0, y: 0 } : fdTranco(lt, o.trancos);
    let x = fo ? alvo[0] - fo[0] * w : Wc / 2 - (o.fx ?? .5) * w, y = fo ? alvo[1] - fo[1] * h : Hc / 2 - (o.fy ?? .5) * h;
    x = clamp(x, Wc - w, 0); y = clamp(y, Hc - h, 0);
    x += ox * sx + fdWig(lt, 1.3, mao, sem) + tr.x; y += oy * sy + fdWig(lt, 1.1, mao, sem + 1) + tr.y;
    return { x: clamp(x, Wc - w, 0), y: clamp(y, Hc - h, 0), k0 };
  };
  if (G && (!F || o.sai || o.chega)) g.borra = fdBorra(g);       // motor foco: blur só no plano que sai/chega em chicote
  (S.async = S.async || []).push(async lt => {
    if (g.style.display === 'none') return;
    if (ehClip) {
      const f = Math.max(0, Math.min(g.n - 1, Math.round(g.ini + Math.max(0, lt - g.t0) * vq)));
      if (f !== g.cur) { img.src = `clips/${nome}/${String(f + 1).padStart(4, '0')}.jpg`; try { await img.decode(); } catch (e) { } g.cur = f; }
      g.iw = img.naturalWidth || 1080; g.ih = img.naturalHeight || 1920;
    }
    if (G) {
      const p = g.pose(lt), a = g.pose(lt - 1 / 30);
      img.style.width = `${g.iw}px`; img.style.height = `${g.ih}px`;
      img.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(${p.k0.toFixed(4)})`;
      // velocidade do centro da imagem na tela + zoom (bordas fugindo) -> blur na direção do movimento
      const cx = v => v.x + g.iw * v.k0 / 2, cy = v => v.y + g.ih * v.k0 / 2;
      if (g.borra) g.borra(Math.abs(cx(p) - cx(a)), Math.abs(cy(p) - cy(a)), Math.abs(Math.log(p.k0 / a.k0)) * 700);
      return;
    }
    const u = clamp((lt - g.t0) / dur), q = E.out(u);
    let k = { sai: 1 + z * (1 - q), entra: 1 + z * q }[mov] ?? (1 + z);
    const k0 = Math.max(Wc / g.iw, Hc / g.ih) * k, w = g.iw * k0, h = g.ih * k0;
    let x = Wc / 2 - (o.fx ?? .5) * w, y = Hc / 2 - (o.fy ?? .5) * h;
    const dx = (w - Wc) / 2 * .9, dy = (h - Hc) / 2 * .9;
    if (mov === 'esq') x += dx * (1 - 2 * q); if (mov === 'dir') x -= dx * (1 - 2 * q);
    if (mov === 'sobe') y += dy * (1 - 2 * q); if (mov === 'desce') y -= dy * (1 - 2 * q);
    x = clamp(x, Wc - w, 0); y = clamp(y, Hc - h, 0);
    img.style.width = `${g.iw}px`; img.style.height = `${g.ih}px`;
    img.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${k0.toFixed(4)})`;
  });
  return g;
}

// ---------- 1. rajada: planos em tela cheia trocando em corte seco ----------
// rajada(['B03','B04'], [[c => 0, 'f_sacks', {mov:'entra'}], [c => c.w('B04','lawyer'), 'clip:advogado'], ...], {cap})
// motor golpe: op.chicote = 'esq'|'dir'|'cima'|'baixo' num plano = a passagem do plano anterior para ele é um chicote (use
// quando a fala pede: virada, "mas", contraste). A emenda com a cena vizinha já chicoteia sozinha (fdChicEmenda).
// o.trancos = c => [[t, amp]]: tranco de câmera nos impactos. o.chicote: false = sem chicote nas emendas desta cena.
// motor foco (padrão): cada op leva foco: [fx, fy] (o assunto na imagem, vai para o ponto do assunto); semLegenda: true quando a
// imagem já mostra a palavra dita (logo "AMD" no "AMD"); as emendas são corte seco no mesmo lugar e chicote só com chicote: 'dir'
// na cena da virada; o tranco vira soco de zoom.
function fdListaPlanos(c, lista, o) {
  const tr = o.trancos ? o.trancos(c) : null, ch = fdChicCena(c);
  const L = lista.map(([tf, fonte, op = {}]) => ({ t: typeof tf === 'function' ? tf(c) : tf, fonte, op: { ...op } }));
  L.forEach((p, i) => {
    if (tr) p.op.trancos = p.op.trancos || tr;
    // motor foco: o chicote pedido dentro da rajada é só a SAÍDA do plano anterior; o novo já começa no assunto
    if (i > 0 && p.op.chicote && fdMotor()) { if (!fdFoco()) p.op.chega = p.op.chicote; L[i - 1].op.sai = { t: p.t, dir: p.op.chicote }; }
  });
  L.forEach((p, i) => { if (p.op.fim === undefined) p.op.fim = Math.min(L[i + 1] ? L[i + 1].t : c.dur, c.dur); });   // vídeo real roda até sair da tela
  if (L.length && ch.chega && !L[0].op.chega) L[0].op.chega = ch.chega;
  // motor foco: a saída em chicote vai no último plano que APARECE (no rajadaAuto, fonte a mais fica em 1e9 e nunca entra; o motor
  // golpe punha o chicote nela e a saída não se via — mantido assim no 'golpe' para reeditar vídeos antigos iguais)
  if (L.length && ch.sai) { const v = fdFoco() ? L.filter(p => p.t < c.dur) : []; (v.length ? v[v.length - 1] : L[L.length - 1]).op.sai = ch.sai; }
  return L;
}
function rajada(beats, lista, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead, fdTipo: 'img', fdChic: o.chicote,
    build(r, S, c) {
      S.planos = fdListaPlanos(c, lista, o).map(({ t, fonte, op }) => {
        const g = fdPlano(r, fonte, S, { ...op, t0: t }); g.style.display = 'none'; g._t = t; g._semLeg = !!op.semLegenda; return g;
      });
      S.planos[0]._t = Math.min(S.planos[0]._t, 0);
      S.cap = o.cap ?? {}; S.grao = o.grao ?? (fdFoco() ? FD_FOCO.grao : .14); S.vig = o.vig ?? .35;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      let k = 0; S.planos.forEach((g, i) => { if (c.lt >= g._t) k = i; });
      S.planos.forEach((g, i) => { g.style.display = i === k ? 'block' : 'none'; });
      S.fdSemLeg = S.planos[k]._semLeg;            // op.semLegenda: a imagem já mostra a palavra (logo, número) -> ela é o assunto
      if (o.update) o.update(S, c);
    },
  });
}
// rajadaAuto(beats, ['f_a', 'clip:b', ['f_c', {mov:'entra'}], ...]) — troca de plano em cada palavra FORTE (não itálica) com ≥ .3 s
//   (ou em qualquer palavra se o plano já passou de .6 s)
//   de distância (a referência troca a cada ~0,5 s). Fontes a mais são ignoradas; a menos: o último plano segue até o fim.
function fdTrocas(c, beats, min = .3) {   // referência: ~101 trocas/min, plano médio 0,59 s, mediana 0,5 s
  const ws = beats.flatMap(id => BYID[id].words);
  const ts = [0];
  ws.forEach(w => { const t = w.s - c.t0 - .03, dt = t - ts[ts.length - 1]; if ((!fdItal(w) && dt >= min) || dt >= .6) ts.push(t); });
  return ts;
}
function rajadaAuto(beats, fontes, o = {}) {
  rajada(beats, fontes.map((f, i) => [c => (o.trocas ? o.trocas(c) : fdTrocas(c, beats, o.min))[i] ?? 1e9, ...(Array.isArray(f) ? f : [f])])
    .slice(0, fontes.length), o);
}

// ---------- 2. cartão branco / vermelho com a frase (anos, viradas). Legenda escura no branco, branca no vermelho ----------
// Na referência o cartão dura 0,7–1,5 s: frase mais longa = parte em rajada, parte no cartão.
function cartaoCor(beats, o = {}) {
  const verm = o.cor === 'vermelho';
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead, fdTipo: 'cartao', fdChic: o.chicote,
    build(r, S, c) {
      el(r, 'div', `position:absolute;inset:0;background:${verm ? FD.vermelho : FD.branco};`);
      const cap = { cor: verm ? '#ffffff' : FD.tinta, s: o.s ?? 60 }, ch = fdChicCena(c).chega;
      // motor golpe: cartão liso não mostra movimento; quem chega em chicote é a frase (110 px, mola em .45 s), e depois fica
      // PARADA para ser lida (o cartão inteiro tem ≥ .7 s). Motor foco: a frase já nasce no lugar fixo da legenda e só deriva
      // (aproxima 3% no cartão inteiro, < 0,3 px/quadro na letra): o quadro nunca congela e a leitura não sofre
      S.cap = fdFoco() ? lt => ({ ...cap, k: 1 + .03 * clamp(lt / Math.max(.5, c.dur)) })
        : ch ? lt => { const p = 1 - FDG.mola(lt / .45), D = FD_DIR[ch]; return { ...cap, dx: -D[0] * 110 * p, dy: -D[1] * 110 * p }; } : cap;
      S.grao = .06; S.vig = 0;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) { if (o.update) o.update(S, c); },
  });
}

// ---------- 3. faixa letterbox 16:9 no meio (vídeo largo: noticiário, entrevista) ----------
// faixa(beats, [[t, fonte, op], ...] | fonte, {h: 608}) — preto em cima e embaixo; legenda dentro da faixa
function faixa(beats, lista, o = {}) {
  const L_ = Array.isArray(lista) ? lista : [[0, lista, {}]];
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead, fdTipo: 'img', fdChic: o.chicote,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:#000;');
      const h = o.h ?? 608, box_ = el(r, 'div', `position:absolute;left:0;top:${960 - h / 2}px;width:1080px;height:${h}px;overflow:hidden;`);
      // motor foco: z padrão do fdPlano (zFoto/zVideo) e o assunto no ponto do assunto DA FAIXA (mesma proporção, ~40% da altura)
      S.planos = fdListaPlanos(c, L_, o).map(({ t, fonte, op }) => {
        const g = fdPlano(box_, fonte, S, { mov: 'entra', ...(fdFoco() ? {} : { z: fdMotor() ? .14 : .05 }), ...op, t0: t, w: 1080, h }); g.style.display = 'none'; g._t = t; g._semLeg = !!op.semLegenda; return g;
      });
      S.planos[0]._t = Math.min(S.planos[0]._t, 0);
      S.cap = o.cap ?? { s: 58 }; S.grao = fdFoco() ? FD_FOCO.grao : .14; S.vig = 0;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      let k = 0; S.planos.forEach((g, i) => { if (c.lt >= g._t) k = i; });
      S.planos.forEach((g, i) => { g.style.display = i === k ? 'block' : 'none'; });
      S.fdSemLeg = S.planos[k]._semLeg;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 4. tríptico: 3 painéis 1080x640 empilhados, entram um a um (0,15 s) ----------
// tripla(beats, ['f_a', 'clip:b', 'f_c'], {ts: c => [0, .15, .3]})
function tripla(beats, fontes, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead, fdTipo: 'img', fdChic: o.chicote,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:#000;');
      const ts = o.ts ? o.ts(c) : [0, .15, .3], G = fdMotor(), F = fdFoco(), ch = G ? fdChicCena(c) : {}, tr = o.trancos ? o.trancos(c) : null;
      S.pn = fontes.map((f, i) => {
        const [fonte, op] = Array.isArray(f) ? f : [f, {}];
        const box_ = el(r, 'div', `position:absolute;left:0;top:${i * 640}px;width:1080px;height:640px;overflow:hidden;opacity:0;`);
        fdPlano(box_, fonte, S, { mov: 'entra', z: .08, fim: c.dur, ...(ch.sai ? { sai: ch.sai } : {}), ...(tr ? { trancos: tr } : {}), ...op, t0: ts[i], w: 1080, h: 640 }); box_._t = ts[i];   // painel fica na tela até o fim
        // motor golpe: cada painel desliza de um lado (alternando; o 1º vem do lado do chicote da emenda) com mola em .45 s
        // motor foco: o painel ACENDE no próprio lugar (pousa 1,06 -> 1 em .22 s) e os anteriores escurecem: o olho desce um por vez
        if (G && !F) { box_._lado = i === 0 && ch.chega ? -(FD_DIR[ch.chega][0] || 1) : (i % 2 ? -1 : 1); box_._borra = fdBorra(box_); }
        if (F) { box_._foco = 1; box_.style.transformOrigin = '540px 320px'; }
        return box_;
      });
      S.cap = o.cap ?? {}; S.grao = F ? FD_FOCO.grao : .14; S.vig = .2;
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      if (S.pn[0] && S.pn[0]._foco) {
        S.pn.forEach((b, i) => {
          const on = c.lt >= b._t || i === 0, nx = S.pn[i + 1], u = clamp((c.lt - b._t) / .22);
          b.style.opacity = !on ? 0 : i === 0 ? 1 : clamp((c.lt - b._t) / .07).toFixed(3);           // o 1º já está no quadro 0
          b.style.transform = `scale(${(1 + .06 * (1 - E.out(u))).toFixed(4)})`;
          const esc = nx && c.lt >= nx._t ? clamp((c.lt - nx._t) / .15) : 0;
          b.style.filter = esc > 0 ? `brightness(${(1 - .58 * esc).toFixed(3)}) saturate(${(1 - .4 * esc).toFixed(3)})` : '';
        });
        if (o.update) o.update(S, c);
        return;
      }
      S.pn.forEach(b => {
        b.style.opacity = c.lt >= b._t ? 1 : 0;
        if (b._lado === undefined) return;
        const x = l => b._lado * 1080 * (1 - FDG.mola((l - b._t) / .45));
        b.style.transform = `translateX(${x(c.lt).toFixed(1)}px)`;
        b._borra(c.lt >= b._t ? Math.abs(x(c.lt) - x(Math.max(b._t, c.lt - 1 / 30))) : 0, 0);
      });
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 5. produto girando sobre fundo escuro com a marca repetida em relevo ----------
// produtoGira(beats, 'p_lata', {marca: 'MONSTER', w: 330}) — recorte do produto (imagens.py modo produto)
function produtoGira(beats, nome, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: fdCamDeriva, lead: o.lead,
    build(r, S, c) {
      const F = fdFoco();
      if (F) r.style.transformOrigin = `${FD_FOCO.x}px ${FD_FOCO.y}px`;                // a deriva da câmera é em volta do assunto
      el(r, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% ${F ? 40 : 48}%, #2a2a2a, #121212 70%, #070707);`);
      // motor foco: a marca vira textura (não é texto para ler) e sai de trás da legenda; o produto fica no ponto do assunto com a
      // legenda fixa logo abaixo; o balanço cai para ~1/3 (o giro, que é o efeito, fica)
      if (o.marca && F) fdMarcaFundo(r, o.marca, .09, [FD_FOCO.capY]);
      else if (o.marca) for (let i = 0; i < 6; i++) el(r, 'div', `position:absolute;left:-60px;top:${-40 + i * 360}px;width:1200px;text-align:center;font-family:${FD_SANS};` +
        `font-weight:900;font-size:150px;letter-spacing:.06em;color:rgba(255,255,255,.07);white-space:nowrap;text-shadow:0 2px 0 rgba(0,0,0,.6);`, esc(o.marca));
      const a = AS(nome); if (!a) throw new Error(`asset ${nome} não existe`);
      // motor foco: o.foco = [fx, fy] no recorte (o chip na mão, a lata) vai para o ponto do assunto (o.alvo = [x, y], padrão
      // FD_FOCO.x/y) e é o pivô do giro; sem foco, o recorte fica centrado acima da legenda. Recorte com ponto muito claro (chip,
      // lata metálica): alvo y ~800, a <= ~250 px da legenda, senão o olho pula entre os dois a cada palavra
      const w = o.w ?? 330, h = w * a.h / a.w, fo = F && o.foco ? o.foco : null, al = o.alvo ?? [FD_FOCO.x, FD_FOCO.y];
      const x0 = fo ? al[0] - fo[0] * w : 540 - w / 2, y0 = fo ? al[1] - fo[1] * h : (F ? Math.min(FD_FOCO.y, FD_FOCO.capY - 75 - h / 2) : 960) - h / 2;
      S.p = el(r, 'img', `position:absolute;left:${x0}px;top:${y0}px;width:${w}px;filter:drop-shadow(0 30px 40px rgba(0,0,0,.7)) ${FD_COR};` +
        (fo ? `transform-origin:${(fo[0] * 100).toFixed(0)}% ${(fo[1] * 100).toFixed(0)}%;` : ''));
      S.p.src = a.src; S.fdF = F;
      S.cap = o.cap ?? (F ? {} : { y: 1500 }); S.grao = F ? FD_FOCO.grao : .12; S.vig = .5;
    },
    update(S, c) {
      const lt = c.lt, a = Math.sin(lt * 2.2) * .5, kb = S.fdF ? .33 : 1;
      S.p.style.transform = `translateY(${(Math.sin(lt * 1.6) * 18 * kb).toFixed(1)}px) rotate(${(Math.sin(lt * 1.3) * 8 * kb).toFixed(2)}deg) scaleX(${(.82 + .18 * Math.cos(a)).toFixed(3)})`;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 6. gráfico de alta: produto no centro, linha verde em degraus subindo, % em serifa itálica contando ----------
// alta(beats, {produto: 'p_lata', marca: 'MONSTER', valores: [56, 722, 1389, 2056, 2722, 3000] (ou textos), suf: '%', ts: c => [...], fonte: 'texto pequeno'})
function alta(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: fdCamDeriva, lead: o.lead,
    build(r, S, c) {
      const F = fdFoco(); S.fdF = F;
      if (F) r.style.transformOrigin = `${FD_FOCO.x}px ${FD_FOCO.y}px`;
      el(r, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse 70% 55% at 50% 50%, #262626, #101010 75%);');
      if (o.marca && F) fdMarcaFundo(r, o.marca, .09, [FD_FOCO.y - 40]);          // motor foco: marca = textura (relevo visível, como na referência), fora de trás do número
      else if (o.marca) for (let i = 0; i < 6; i++) el(r, 'div', `position:absolute;left:-60px;top:${-40 + i * 360}px;width:1200px;text-align:center;font-family:${FD_SANS};` +
        `font-weight:900;font-size:150px;letter-spacing:.06em;color:rgba(255,255,255,.06);white-space:nowrap;`, esc(o.marca));
      const svg = svgAbs(r, 0, 0, W, H);
      // motor foco: a linha sobe na metade de baixo (de 1720 até ~950), por trás do produto, e não cruza o número nem a fonte
      let x = -20, y = F ? 1720 : 1500, d = `M${x},${y}`;
      for (let i = 0; i < 9; i++) { y -= (70 + hrand(i + 3) * 70) * (F ? .8 : 1); d += ` L${x},${y}`; x += 90 + hrand(i * 2.3) * 50; d += ` L${x},${y}`; }
      S.linha = prep(sv(svg, 'path', { d, fill: 'none', stroke: FD.verde, 'stroke-width': 30, 'stroke-linejoin': 'miter', 'stroke-linecap': 'square' }));
      S.linha.style.filter = 'drop-shadow(0 0 14px rgba(41,227,58,.45))';
      // motor foco: o NÚMERO é o assunto (no ponto do assunto, com a fonte logo abaixo, um bloco só); o produto fica embaixo, menor
      if (o.produto) { const a = AS(o.produto); const w = (o.w ?? 300) * (F ? .85 : 1), h = w * a.h / a.w, py = F ? 1290 : 1020;
        S.p = el(r, 'img', `position:absolute;left:${540 - w / 2}px;top:${py - h / 2}px;width:${w}px;filter:drop-shadow(0 26px 34px rgba(0,0,0,.75)) ${FD_COR};`); S.p.src = a.src; }
      S.ts = o.ts ? o.ts(c) : o.valores.map((_, i) => .25 + i * (Math.max(1, c.dur - .6) / o.valores.length));
      S.ultimo = '';
      (o.valores || []).forEach((_, i) => cue(c, 'flap', S.ts[i], { g: .16, n: 3 }));
      if (F) S.nf = fdNumero(r, S, '', o.fonte, -1, 1e9, { veu: 0, s: o.s ?? 150 });
      else {
        S.num = el(r, 'div', `position:absolute;left:540px;top:560px;transform:translate(-50%,-50%);white-space:nowrap;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.5);`);
        if (o.fonte) el(r, 'div', `position:absolute;left:540px;top:1480px;transform:translateX(-50%);width:900px;text-align:center;font-family:${FD_SANS};font-weight:400;` +
          `font-size:28px;color:rgba(255,255,255,.62);`, esc(o.fonte));                     // dado na tela = fonte e data (regra do kit)
      }
      S.cap = { modo: 'none' }; S.grao = F ? FD_FOCO.grao : .1; S.vig = .45;
    },
    update(S, c) {
      const lt = c.lt; let k = -1; S.ts.forEach((t, i) => { if (lt >= t) k = i; });
      draw(S.linha, clamp(lt / Math.max(.5, S.ts[S.ts.length - 1] + .3)));
      const txt = k < 0 ? '' : `${o.valores[k]}${o.suf ?? '%'}.`;
      if (S.nf) { S.nf.set(txt); if (S.p) S.p.style.transform = `scale(${(1 + .04 * clamp(lt / c.dur)).toFixed(4)})`; if (o.update) o.update(S, c); return; }
      if (txt !== S.ultimo) { S.ultimo = txt; S.num.innerHTML = '';
        if (txt) { const px = o.s ?? 130, lw = fdLarg(txt, px, FD_SERIF, 400, 'italic') * FD_CX;
          const sp = el(S.num, 'span', `display:inline-block;width:${lw.toFixed(1)}px;`); el(sp, 'span', `display:inline-block;transform:scaleX(${FD_CX});transform-origin:0 50%;font-family:${FD_SERIF};font-style:italic;font-size:${px}px;`, esc(txt)); } }
      if (S.p) S.p.style.transform = `scale(${(1 + .04 * clamp(lt / c.dur)).toFixed(4)})`;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 7. print de site/loja em cor, descendo (pagina.py --cor -> d_<nome>.jpg) ----------
// siteCor(beats, 'd_loja', {y0: 0, y1: .25 (fração da página onde termina), cap})
function siteCor(beats, nome, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:#f4f4f4;');
      const a = AS(nome); if (!a) throw new Error(`asset ${nome} não existe (pagina.py --cor)`);
      S.w = o.w ?? 1080; S.h = S.w * a.h / a.w;
      S.img = el(r, 'img', `position:absolute;left:${540 - S.w / 2}px;top:0;width:${S.w}px;`); S.img.src = a.src;
      S.cap = o.cap ?? (fdFoco() ? { cor: FD.tinta } : { y: 1500, cor: FD.tinta }); S.grao = .05; S.vig = .15;
    },
    update(S, c) {
      const u = E.inOut(clamp(c.lt / Math.max(.8, c.dur)));
      if (fdFoco() && !o.rolar) {          // motor foco: a página NÃO rola (panorâmica); aproxima devagar no trecho y0, que fica no ponto do assunto
        const y = (o.y0 ?? 0) * S.h; S.img.style.transformOrigin = `${(S.w / 2).toFixed(0)}px ${(y + FD_FOCO.y).toFixed(0)}px`;
        S.img.style.transform = `translateY(${(-y).toFixed(1)}px) scale(${(1 + .07 * u).toFixed(4)})`;
        if (o.update) o.update(S, c); return;
      }
      const y = lerp(o.y0 ?? 0, o.y1 ?? .2, u) * S.h;
      S.img.style.transform = `translateY(${(-y).toFixed(1)}px) scale(${(1 + .05 * u).toFixed(4)})`;
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 9. apresentador: 10–15 aparições de 2–4 s, em TELA CHEIA ou num CÍRCULO sobre as imagens da história ----------
// presFD(beats, {forma: 'cheia' | 'circulo', fundo: ['f_x', 'clip:y', ...] (círculo: trocam nas palavras fortes, como a rajada),
//               z: 1.0, punch: 1.08 (zoom no meio da fala), fy: .40, capY,
//               círculo: d: 640 (diâmetro), cx: 540, cy: 620 (centro), aro: '#fcfcfc'})
//   O apresentador fica LIMPO (pedido do Felipe, 30/10): sem os efeitos das fotos (retícula, cor de cinema, grão, vinheta,
//   aproximação lenta). Só o punch-in seco numa palavra forte.
//   cheia: o vídeo do apresentador em tela cheia, com punch-in na 1ª palavra forte depois de ~1 s. Legenda no peito (y 1440), nunca no rosto.
//   circulo: a foto/vídeo da história em tela cheia atrás (aproxima e troca como numa rajada) e o apresentador num círculo com
//           aro branco e sombra na metade de cima; o círculo entra com um pop curto. Legenda logo abaixo (y = cy + d/2 + 190).
//           z/fy enquadram cabeça e ombros (plano aberto da Thainá: z 1.7, fy .42).
//   Só use janelas em que ele OLHA para a câmera (regra do Felipe). Com avatar do HeyGen: só dentro das peças do apresentador.json.
function presFD(beats, o = {}) {
  const forma = o.forma ?? 'cheia';
  scene({
    beats, tr: 'cut', bg: 'dark', presenter: true, camMove: camStill, lead: o.lead,
    build(r, S, c) {
      const ts = fdTrocas(c, beats, .9), tp = ts.find(t => t > 1.0) ?? 1e9;          // punch-in numa palavra forte depois de ~1 s
      const zoom = lt => (o.z ?? 1) * lerp(1, o.punch ?? 1.08, fdMotor() ? FDG.golpe((lt - tp) / .3) : E.out5(clamp((lt - tp) / .18)));
      if (forma === 'cheia') {
        S.ph = photo(r, -40, -30, 1160, 1980, { border: 0, tape: false, fy: o.fy ?? .40 });
        S.photos.push(S.ph); S.ph.zoomFn = lt => zoom(lt);
        S.cap = o.cap ?? { y: o.capY ?? 1440 }; S.vig = 0;
      } else {
        const fundos = (o.fundo || ['f_fundo']).map(f => Array.isArray(f) ? f : [f, {}]);
        S.planos = fundos.map(([fonte, op], i) => { const g = fdPlano(r, fonte, S, { fim: i + 1 < fundos.length ? Math.min(ts[i + 1] ?? c.dur, c.dur) : c.dur, ...op, t0: ts[i] ?? 1e9 }); g.style.display = 'none'; g._t = i ? (ts[i] ?? 1e9) : -1; return g; });
        const d = o.d ?? 640, cx = o.cx ?? 540, cy = o.cy ?? 620;
        el(r, 'div', `position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at ${cx}px ${cy}px, rgba(0,0,0,.5) ${(d * .45).toFixed(0)}px, rgba(0,0,0,0) ${(d * .95).toFixed(0)}px);`);
        S.ph = photo(r, cx - d / 2, cy - d / 2, d, d, { border: 0, tape: false, fy: o.fy ?? .42 });
        S.photos.push(S.ph); S.ph.zoomFn = lt => zoom(lt);
        S.ph.fr.style.borderRadius = S.ph.inner.style.borderRadius = '50%';
        S.ph.fr.style.boxShadow = `0 0 0 ${Math.round(d * .016)}px ${o.aro ?? '#fcfcfc'}, 0 24px 50px rgba(0,0,0,.6)`;
        S.circ = S.ph.fr;
        S.cap = o.cap ?? { y: o.capY ?? Math.round(cy + d / 2 + 190) }; S.vig = .3;      // vinheta só pesa nas bordas da imagem de trás
      }
      S.grao = 0;                                                                      // o grão é da tela inteira: cobriria o apresentador
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      if (S.planos) { let k = 0; S.planos.forEach((g, i) => { if (c.lt >= g._t) k = i; }); S.planos.forEach((g, i) => { g.style.display = i === k ? 'block' : 'none'; }); }
      if (S.circ) S.circ.style.transform = `scale(${lerp(.8, 1, fdMotor() ? FDG.mola((c.lt + .04) / .45) : E.back(clamp((c.lt + .04) / .3))).toFixed(4)})`;     // pop de entrada (mola no motor golpe)
      if (o.update) o.update(S, c);
    },
  });
}

// ---------- 8. final: tela preta com a marca de quem fala (o "FOUNDED" da referência) ----------
// fimMarca(beats, {nome: 'FELIPE DANTAS', perfil: 'perfil_felipedantasf' (print real, opcional), t: c => tempo de entrada})
function fimMarca(beats, o = {}) {
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: o.lead,
    build(r, S, c) {
      el(r, 'div', 'position:absolute;inset:0;background:#000;');
      S.logo = el(r, 'div', `position:absolute;left:540px;top:${o.perfil ? 700 : 960}px;transform:translate(-50%,-50%);background:#fff;color:#000;padding:20px 34px 46px;` +
        `font-family:${FD_SANS};font-weight:900;font-size:64px;letter-spacing:-.02em;white-space:nowrap;clip-path:polygon(0 0,100% 0,100% 74%,62% 74%,62% 100%,0 100%);opacity:0;`, esc(o.nome || 'FELIPE DANTAS'));
      if (o.perfil && AS(o.perfil)) { const a = AS(o.perfil); S.pf = el(r, 'img', `position:absolute;left:${540 - 400}px;top:880px;width:800px;border-radius:24px;opacity:0;`); S.pf.src = a.src; }
      S.t = o.t ? o.t(c) : 0;
      S.cap = lt => lt < S.t ? {} : { modo: 'none' }; S.grao = .08; S.vig = 0;
    },
    update(S, c) {
      const q = clamp((c.lt - S.t) / .08);
      S.logo.style.opacity = q; if (S.pf) S.pf.style.opacity = clamp((c.lt - S.t - .3) / .3);
      if (o.update) o.update(S, c);
    },
  });
}
