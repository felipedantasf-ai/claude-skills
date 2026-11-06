// ============================================================================
//  edit-tng — formato "The Numbers Game" (TNG, Instagram @thenumbersgame1; reel do Mark Goldbridge, 20/08/2026)
//  1ª parte do render/scenes.js (work/<prefixo>_a.js). Precisa do motor do Kit_Edicao_Vox_v2 com o projeto a 24 q/s
//  (o preparar_tng.py troca o FPS do projeto e faz o render.py reaproveitar o 2º quadro de cada degrau de 1/12 s).
//
//  Narração contínua, ninguém fala para a câmera. Cada BLOCO de legenda (2–3 palavras) é um PLANO REAL em corte seco: vídeo do
//  próprio personagem (45–50% do tempo, ~34 vídeos diferentes em 75 s, emoção casando com a palavra), foto real dele, a pessoa
//  ou a marca citada no nome dela, B-roll de banco em VÍDEO (sem rosto: costas, mãos, silhuetas), print real de página e cartões
//  chapados vermelho/branco com a própria legenda. TUDO anda a 12 imagens por segundo (cada imagem fica 2 quadros a 24 q/s),
//  inclusive o vídeo real (Felipe, 04/11/2026: a regra "vídeo real nunca trava" não vale para esta skill); só o esmaecimento
//  final para branco anda a 24.
//
//   tng(beats, planos, o)   uma cena = lista de planos [quando, fonte, op]; cada plano entra numa palavra (corte seco) e abre
//                           um bloco de legenda. quando: 'B03' (1ª palavra do beat), 'B03:valia' (prefixo, sem acento),
//                           'B03#2' (índice), 'B03:valia+.2' (desvio em s) ou número (s absolutos).
//   fontes   'clip:nome'      vídeo real extraído a 24 q/s pelo clipes_tng.py (render/clips/nome/0001.jpg…, CLIPFPS = 24)
//            'foto:nome'      foto real (render/assets/nome.jpg): parada ou deslizando para a direita com freio exponencial
//            'vermelho' | 'branco'   cartão chapado com a legenda (vermelho = frase sem imagem literal, virada; branco = ano)
//            'contador'       cartão com o número em serifa itálica contando (op: de, ate, casas, antes, depois, depoisEm)
//            'print:nome'     página real sobre o branco, sobe e assenta; op.pop = palavra do soco ×1,246
//            'celular:nome'   print de celular subindo e rolando, legenda preta acima
//            ['foto:a', 'foto:b', ...]   montagem-relâmpago: 1 imagem a cada 1/12 s (op.passos = [2,2,1,1,...])
//            'dividida'       tela dividida 50/50 (op.de = ['clip:a', 'clip:b'])
//   op comuns: leg (false = sem legenda; 'continua' = não abre bloco novo), from (s dentro do trecho), rate (1–1,25),
//              foco [fx, fy] (assunto na foto), desliza (px, 0 = parada), dir (1 = conteúdo anda para a direita), sai (saída
//              acelerando até o corte), obturador (false = sem som de foto), capCor
//   TNG.selo, TNG.sujeito, TNG.musica (cues da trilha nas palavras), TNG.troca (texto da legenda por palavra), TNG.cliqueAte
// ============================================================================
const TNG = {
  verm: '#E70123', branco: '#FDFCFC', papel: '#FCFBFB', seloCor: '#EC0033',
  cad: 12,                                   // imagens por segundo (a referência inteira anda a 12)
  capTop: 908, capPx: 60, capLarg: 716,      // legenda: Inter 700 60 px, linha de base em y 959, frase de no máx. 716 px
  capMaxPal: 4, capMaxCar: 26,               // bloco: 2–3 palavras (74% na referência), no máx. 4 palavras / 26 letras aqui
  revela: .10,                               // palavras seguintes do bloco: início da palavra + .10 s (grade de 1/12 s)
  sombra: '1.5px 1.5px 3px rgba(0,0,0,.45), 0 0 12px rgba(0,0,0,.28)',  // só sobre vídeo/foto (a da REF, .35, + halo leve p/ fundo claro)
  sombraForte: '0 0 18px rgba(0,0,0,.55), 0 0 6px rgba(0,0,0,.45), 1.5px 1.5px 3px rgba(0,0,0,.6)',  // op.capForte (fundo claro atrás da legenda)
  cliqueAte: null,                           // fim do gancho (ref ou s): palavras antes disso ganham clique. null = 1º drop
  selo: 'TNG',                               // sigla do selo vermelho fixo (null = sem selo)
  sujeito: null,                             // prefixo dos clipes/fotos do personagem (ex.: 'lisa') para medir o tempo dele
  fimApos: .34, fimDur: .46, fimBranco: .42, // fade para branco: começa .34 s depois do fim da última palavra
  musica: [],                                // [['break','B05:Hoje'], ['drop','B10:Lisa'], ['stop','B17:2014+.4', .6], ['hit','B22'], ['roll','B12', .9]]
  troca: {},                                 // {'B06:um': '1', 'B19:dolares': ''} -> texto da legenda daquela palavra ('' some)
  poeira: true,                              // poeira fixa nas bordas (screen), tremendo a 8 Hz
  serif: 'TngSerifI',                        // números do contador (Californian FB Italic, a mais parecida instalada)
};
const TNG_ERROS = [];
const tngQ = t => Math.round(t * TNG.cad) / TNG.cad;                     // degrau mais próximo
const tngQc = t => Math.ceil(t * TNG.cad - 1e-6) / TNG.cad;              // próximo degrau
const _tngBeat = {}; TIMING.beats.forEach(b => { _tngBeat[b.id] = b; });
const _tngNorm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9$%]/g, '');
function tngPal(ref) {
  if (typeof ref === 'number') return { t: ref, w: null };
  const m = String(ref).match(/^(B\d+)(?:([:#])(.+?))?([+-]\d*\.?\d+)?$/);
  if (!m || !_tngBeat[m[1]]) { TNG_ERROS.push(`referência inválida: ${ref}`); console.error(`TNG REF ${ref}`); return { t: 0, w: null }; }
  const b = _tngBeat[m[1]], ws = b.words;
  let i = 0;
  if (m[2] === '#') i = Math.min(+m[3], ws.length - 1);
  else if (m[2] === ':') {
    const k = _tngNorm(m[3]);
    i = ws.findIndex(w => _tngNorm(w.w).startsWith(k));
    if (i < 0) { TNG_ERROS.push(`${ref}: palavra não existe em "${b.text}"`); console.error(`TNG PALAVRA ${ref}`); i = 0; }
  }
  return { t: ws[i].s + (m[4] ? +m[4] : 0), w: ws[i] };
}

// ---------- registro dos planos ----------
const TNG_PLANOS = [];
const TNG_CARTOES = new Set(['vermelho', 'branco', 'contador']);
const TNG_SEM_LEG = new Set(['contador', 'print']);            // print de página: a imagem já mostra o que é dito
const tngTipo = f => Array.isArray(f) ? 'montagem' : (f.includes(':') ? f.slice(0, f.indexOf(':')) : f);
function tng(beats, lista, o = {}) {
  const P = lista.map(([quando, fonte, op = {}]) => {
    const r = tngPal(quando);
    const p = { quando, t: tngQ(r.t), w: r.w, fonte, tipo: tngTipo(fonte), op: { ...op } };
    if (Array.isArray(fonte)) p.op.imagens = fonte;
    return p;
  });
  P.forEach((p, i) => {
    if (i && p.t <= P[i - 1].t) { TNG_ERROS.push(`plano ${p.quando} não vem depois de ${P[i - 1].quando}`); console.error(`TNG ORDEM ${p.quando}`); }
  });
  if (TNG_PLANOS.length) TNG_PLANOS[TNG_PLANOS.length - 1].fim = P[0].t;
  P.forEach((p, i) => { p.fim = i < P.length - 1 ? P[i + 1].t : null; TNG_PLANOS.push(p); });
  const b0 = _tngBeat[beats[0]];
  scene({
    beats, tr: 'cut', bg: 'dark', camMove: camStill, lead: b0.start - (P[0].t - 1e-4), tngP: P,
    build(r, S, c) {
      P.forEach(p => { if (p.fim == null) p.fim = tngFim().t0 + TNG.fimDur + TNG.fimBranco; });
      S.els = P.map(p => tngMonta(r, p));
      S.k = -1;
      (S.async = S.async || []).push(async (lt, c2) => { const g = S.els[S.k]; if (g && g.upd) await g.upd(c2.t); });
      if (o.build) o.build(r, S, c);
    },
    update(S, c) {
      let k = 0; P.forEach((p, i) => { if (c.t >= p.t - 1e-4) k = i; });
      if (k !== S.k) { S.els.forEach((g, i) => { g.style.display = i === k ? 'block' : 'none'; }); S.k = k; }
      if (o.update) o.update(S, c);
    },
  });
}
function tngPlanoEm(t) {
  let a = null;
  for (const p of TNG_PLANOS) { if (p.t - 1e-4 <= t) a = p; else break; }
  return a || TNG_PLANOS[0];
}

// ---------- planos ----------
const tngCaixa = (r, fundo = '#000') => el(r, 'div', `position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;background:${fundo};display:none;`);
// escala para cobrir a caixa com folga (px a mais em x/y para o deslize), assunto (foco) no alvo, sem mostrar borda
function tngCobre(iw, ih, W, H, foco = [.5, .5], alvo = [W / 2, H / 2], zoom = 1, folga = [0, 0]) {
  const k = Math.max((W + folga[0]) / iw, (H + folga[1]) / ih) * zoom, w = iw * k, h = ih * k;
  const x = clamp(alvo[0] - foco[0] * w, W - w + folga[0] / 2, -folga[0] / 2), y = clamp(alvo[1] - foco[1] * h, H - h + folga[1] / 2, -folga[1] / 2);
  return { k, w, h, x, y };
}
const tngFalta = (r, o) => { TNG_ERROS.push(`asset ${o} não existe (render/assets + make_assets.py)`); console.error(`TNG ASSET ${o}`); const g = tngCaixa(r, '#3a0008'); el(g, 'div', 'position:absolute;left:0;right:0;top:560px;text-align:center;font:700 44px Inter;color:#fff;', esc('FALTA ' + o)); return g; };
function tngClip(r, nome, p) {
  const o = p.op, g = tngCaixa(r), img = el(g, 'img', 'position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;');
  img.decoding = 'sync';
  const n = (window.CLIPN && CLIPN[nome]) || 0, fps = window.CLIPFPS || 24, rate = clamp(o.rate ?? 1, 1, 1.25);
  if (!n) { TNG_ERROS.push(`clipe ${nome} não existe (clipes_tng.py)`); console.error(`TNG CLIPE FALTANDO ${nome}`); }
  if ((o.rate ?? 1) < 1) console.error(`CLIPE LENTO ${nome}: rate ${o.rate} (a referência nunca usa câmera lenta)`);
  if (o.foco) img.style.objectPosition = `${(o.foco[0] * 100).toFixed(1)}% ${(o.foco[1] * 100).toFixed(1)}%`;
  if (o.filtro) img.style.filter = o.filtro;              // ex.: 'brightness(.72)' no B-roll claro demais para a legenda branca
  let ini = Math.round((o.from ?? 0) * fps);
  g.upd = async tAbs => {
    if (g.ini === undefined) {                       // trecho curto: recua o início para o vídeo acabar junto com o plano
      const precisa = (p.fim - p.t) * fps * rate;
      if (ini + precisa > n - 1) {
        if (precisa > n + 1) { TNG_ERROS.push(`clipe ${nome} curto: ${(p.fim - p.t).toFixed(2)} s na tela, trecho de ${(n / fps).toFixed(2)} s`); console.error(`CLIPE CURTO ${nome}`); }
        ini = Math.max(0, Math.floor(n - 1 - precisa));
      }
      g.ini = ini;
    }
    const f = clamp(g.ini + Math.round(Math.max(0, tAbs - p.t) * fps * rate), 0, Math.max(0, n - 1));
    if (f !== g.cur && n) { img.src = `clips/${nome}/${String(f + 1).padStart(4, '0')}.jpg`; try { await img.decode(); } catch (e) { } g.cur = f; }
  };
  return g;
}
// saída acelerando até o corte (2 por vídeo na referência): px por passo dobrando a cada 2 passos, de 2 até 20
function tngSaida(tAbs, p) {
  const V = [2, 2, 4, 4, 8, 8, 16, 16, 20, 20], resta = Math.round((p.fim - tAbs) * TNG.cad), feito = V.length - resta;
  let s = 0; for (let j = 0; j < Math.min(feito, V.length); j++) s += V[j]; return feito > 0 ? s : 0;
}
function tngFoto(r, nome, p) {
  const a = AS(nome); if (!a) return tngFalta(r, nome);
  const o = p.op, g = tngCaixa(r), img = el(g, 'img', 'position:absolute;left:0;top:0;transform-origin:0 0;');
  img.decoding = 'sync'; img.src = a.src; img.style.width = `${a.w}px`; img.style.height = `${a.h}px`;
  if (o.filtro) img.style.filter = o.filtro;
  const A = o.desliza ?? 110, dir = o.dir ?? 1, tau = o.tau ?? .3;
  const C = tngCobre(a.w, a.h, 1080, 1920, o.foco ?? [.5, .42], o.alvo ?? [540, 760], o.z ?? 1, [Math.abs(A) + (o.sai ? 110 : 0) + 8, 0]);
  g.upd = tAbs => {
    const l = tAbs - p.t + 1 / TNG.cad;                                   // o deslize já vem andando 1 passo antes do corte
    let dx = A ? dir * (A * (1 - Math.exp(-Math.max(0, l) / tau)) - A / 2) : 0;
    if (o.sai) dx += dir * tngSaida(tAbs, p);
    img.style.transform = `translate(${(C.x + dx).toFixed(1)}px,${C.y.toFixed(1)}px) scale(${C.k.toFixed(5)})`;
  };
  return g;
}
const tngCartao = (r, p) => tngCaixa(r, p.tipo === 'branco' ? TNG.branco : TNG.verm);
function tngNum(v, casas, prefixo = '', sufixo = '') {
  const s = Number(v).toFixed(casas).split('.'), int = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${prefixo}${int}${s[1] ? ',' + s[1] : ''}${sufixo}`;
}
const _tngCv = document.createElement('canvas').getContext('2d');
const tngLarg = (txt, font, ls = 0) => { _tngCv.font = font; return _tngCv.measureText(txt).width + ls * txt.length; };
const tngLargCap = txt => tngLarg(txt, `700 ${TNG.capPx}px Inter`, -0.068 * TNG.capPx);
// contador: 'antes' sobe 80 px com fade; o número (serifa itálica, 1,66× a maiúscula) entra .25 s depois e conta em passos iguais
// de 1/12 s durante 1 s; 'depois' entra seco quando é falado. Clique na entrada do número e na do 'depois'.
function tngContador(r, p) {
  const o = p.op, br = o.cor === 'branco', g = tngCaixa(r, br ? TNG.branco : TNG.verm), cor = br ? '#000' : '#fff';
  const ln = el(g, 'div', `position:absolute;left:0;right:0;top:${TNG.capTop}px;height:60px;line-height:60px;text-align:center;white-space:nowrap;color:${cor};`);
  const sans = 'display:inline-block;vertical-align:baseline;font:700 60px/60px Inter;letter-spacing:-.068em;';
  const sA = el(ln, 'span', sans, esc(o.antes ?? ''));
  const fim = tngNum(o.ate, o.casasFim ?? o.casas ?? 1, o.prefixo, o.sufixo), px = o.numPx ?? 103, fN = `italic 400 ${px}px ${TNG.serif}`;
  const passos = Math.max(1, Math.round((o.dur ?? 1) * TNG.cad));
  // a vaga do número é a do valor MAIS LARGO da contagem ("0,9" é mais largo que o "1" final): nada invade a unidade
  const vals = [fim]; for (let j = 0; j < passos; j++) vals.push(tngNum((o.de ?? 0) + (o.ate - (o.de ?? 0)) * j / passos, o.casas ?? 1, o.prefixo, o.sufixo));
  const larg = Math.max(...vals.map(v => tngLarg(v, fN)));
  const sN = el(ln, 'span', `display:inline-block;vertical-align:baseline;font:${fN};line-height:60px;text-align:center;` +
    `margin:0 ${o.antes ? 20 : 0}px 0 ${o.antes ? 22 : 0}px;width:${Math.ceil(larg) + 6}px;`, esc(fim));
  const sD = el(ln, 'span', sans + 'visibility:hidden;', esc(o.depois ?? ''));
  const tN = tngQ(p.t + (o.numApos ?? .25)), tD = o.depoisEm ? tngQc(tngPal(o.depoisEm).t + TNG.revela) : tngQ(tN + (o.dur ?? 1));
  EVENTS.push({ t: tN, type: 'tng:clique', g: 0 }); if (o.depois) EVENTS.push({ t: tD, type: 'tng:clique', g: 0 });   // g: 0 = ganho extra (o motor de ajustes copia o g)
  g.upd = tAbs => {
    const la = Math.max(0, tAbs - p.t), ua = 1 - Math.exp(-la / .35);
    sA.style.transform = `translateY(${(80 * (1 - ua)).toFixed(1)}px)`; sA.style.opacity = (.31 + .69 * ua).toFixed(3);
    const lnum = tAbs - tN;
    if (lnum < -1e-4) sN.style.visibility = 'hidden';
    else {
      const un = 1 - Math.exp(-lnum / .35), j = Math.min(passos, Math.floor(lnum * TNG.cad + 1e-6));
      sN.style.visibility = 'visible'; sN.style.transform = `translateY(${(64 * (1 - un)).toFixed(1)}px)`; sN.style.opacity = (.31 + .69 * un).toFixed(3);
      sN.textContent = j >= passos ? fim : tngNum((o.de ?? 0) + (o.ate - (o.de ?? 0)) * j / passos, o.casas ?? 1, o.prefixo, o.sufixo);
    }
    sD.style.visibility = tAbs >= tD - 1e-4 ? 'visible' : 'hidden';
  };
  return g;
}
// print de página (desktop) sobre o branco: 618 px de largura, entra do branco em 2 passos subindo 150 px (freio τ .33 s);
// op.pop = palavra do soco ×1,246 com o x voltando de −94 a 0 em .333 s. Sem legenda por padrão (op.leg: true mostra, preta).
function tngPrint(r, nome, p) {
  const a = AS(nome); if (!a) return tngFalta(r, nome);
  const o = p.op, g = tngCaixa(r, TNG.papel), L = o.larg ?? 618, Hh = a.h * L / a.w, cy = o.cy ?? 1083;
  const fo = o.popFoco ?? [.5, .5];                                         // ponto da página que o soco aproxima (frações)
  const box = el(g, 'div', `position:absolute;left:${540 - L / 2}px;top:${(cy - Hh / 2).toFixed(1)}px;width:${L}px;height:${Hh.toFixed(1)}px;` +
    `transform-origin:${(fo[0] * 100).toFixed(1)}% ${(fo[1] * 100).toFixed(1)}%;`);
  const img = el(box, 'img', `display:block;width:${L}px;height:${Hh.toFixed(1)}px;`); img.decoding = 'sync'; img.src = a.src;
  const tPop = o.pop ? tngQ(tngPal(o.pop).t) : null;
  g.upd = tAbs => {
    const l = Math.max(0, tAbs - p.t), y = 150 * Math.exp(-l / (o.tau ?? .33));
    let s = 1, x = 0, yp = 0;
    if (tPop != null && tAbs >= tPop - 1e-4) { s = 1.246; x = [-94, -45, -20, -7, 0][Math.min(4, Math.round((tAbs - tPop) * TNG.cad))]; yp = -21; }
    box.style.opacity = clamp(.5 + l * TNG.cad / 2).toFixed(3);
    box.style.transform = `translate(${x}px,${(y + yp).toFixed(1)}px) scale(${s})`;
    p.capY = Math.max(250, cy - Hh / 2 + y + yp + (1 - s) * fo[1] * Hh - 96);  // se tiver legenda: preta, colada acima (acompanha o soco)
  };
  return g;
}
// print de celular (página do canal no app): 450 px, sobe 155 px (τ .29 s) girando levemente presa à esquerda, a lista rola
// (318 px de salto + 912 px/s freando, τ .5 s); legenda preta logo acima, acompanhando
function tngCelular(r, nome, p) {
  const a = AS(nome); if (!a) return tngFalta(r, nome);
  const o = p.op, g = tngCaixa(r, TNG.papel), L = o.larg ?? 450, J = o.janela ?? 860, k = L / a.w, top0 = o.top ?? 660;
  const box = el(g, 'div', `position:absolute;left:${540 - L / 2}px;top:${top0}px;width:${L}px;height:${J}px;overflow:hidden;transform-origin:0 50%;`);
  const img = el(box, 'img', `position:absolute;left:0;top:0;width:${L}px;height:${(a.h * k).toFixed(1)}px;`); img.decoding = 'sync'; img.src = a.src;
  const maxR = Math.max(0, a.h * k - J);
  g.upd = tAbs => {
    const l = Math.max(0, tAbs - p.t), sobe = 155 * Math.exp(-l / .29);
    const rola = Math.min(maxR, (o.rola ?? 1) * (318 + 456 * (1 - Math.exp(-l / .5))));
    box.style.transform = `perspective(1300px) translateY(${sobe.toFixed(1)}px) rotateY(${(7 * Math.exp(-l / .3)).toFixed(2)}deg)`;
    img.style.transform = `translateY(${(-rola).toFixed(1)}px)`;
    p.capY = top0 + sobe - 100;
  };
  return g;
}
// montagem-relâmpago: imagens diferentes, 1 por passo de 1/12 s (op.passos = [2,2,1,1,1,1,1] para acelerar); a legenda segue
function tngMontagem(r, p) {
  const o = p.op, g = tngCaixa(r), L = o.imagens || [];
  const ims = L.map(f => {
    const im = el(g, 'img', 'position:absolute;left:0;top:0;width:1080px;height:1920px;object-fit:cover;display:none;'); im.decoding = 'sync';
    if (f.startsWith('foto:')) { const a = AS(f.slice(5)); if (!a) { TNG_ERROS.push(`asset ${f} não existe`); console.error(`TNG ASSET ${f}`); } else im.src = a.src; }
    else if (f.startsWith('clip:')) im.src = `clips/${f.slice(5)}/${String(1 + Math.round((o.from ?? 0) * (window.CLIPFPS || 24))).padStart(4, '0')}.jpg`;
    return im;
  });
  const pas = o.passos ?? L.map(() => 1), acum = []; pas.reduce((s, x, i) => (acum[i] = s + x), 0);
  p.passosTot = acum[acum.length - 1] || 1;
  g.upd = tAbs => {
    const k = Math.floor((tAbs - p.t) * TNG.cad + 1e-6); let j = acum.findIndex(a => k < a); if (j < 0) j = L.length - 1;
    ims.forEach((im, i) => { im.style.display = i === j ? 'block' : 'none'; });
  };
  return g;
}
// tela dividida 50/50 (dois clipes, costura no meio)
function tngDividida(r, p) {
  const o = p.op, g = tngCaixa(r), fps = window.CLIPFPS || 24;
  const L = (o.de || []).map((f, i) => {
    const nome = f.slice(5), n = (window.CLIPN && CLIPN[nome]) || 0;
    const im = el(g, 'img', `position:absolute;left:0;top:${i * 960}px;width:1080px;height:960px;object-fit:cover;`); im.decoding = 'sync';
    if (o.foco && o.foco[i]) im.style.objectPosition = `${o.foco[i][0] * 100}% ${o.foco[i][1] * 100}%`;
    return { im, nome, n, ini: Math.round(((o.from && o.from[i]) || 0) * fps), cur: -1 };
  });
  g.upd = async tAbs => {
    for (const c of L) {
      const f = clamp(c.ini + Math.round(Math.max(0, tAbs - p.t) * fps), 0, Math.max(0, c.n - 1));
      if (f !== c.cur && c.n) { c.im.src = `clips/${c.nome}/${String(f + 1).padStart(4, '0')}.jpg`; try { await c.im.decode(); } catch (e) { } c.cur = f; }
    }
  };
  return g;
}
function tngMonta(r, p) {
  const nome = typeof p.fonte === 'string' && p.fonte.includes(':') ? p.fonte.slice(p.fonte.indexOf(':') + 1) : null;
  switch (p.tipo) {
    case 'clip': return tngClip(r, nome, p);
    case 'foto': return tngFoto(r, nome, p);
    case 'vermelho': case 'branco': return tngCartao(r, p);
    case 'contador': return tngContador(r, p);
    case 'print': return tngPrint(r, nome, p);
    case 'celular': return tngCelular(r, nome, p);
    case 'montagem': return tngMontagem(r, p);
    case 'dividida': return tngDividida(r, p);
  }
  TNG_ERROS.push(`fonte desconhecida: ${p.fonte}`); return tngCaixa(r, '#300');
}

// ---------- legenda: bloco = plano; a frase inteira é diagramada e cada palavra acende no lugar, seca ----------
let TNG_BLOCOS = null;
function tngTexto(w, fimBloco) {
  const k = `${w._bid}#${w._i}`;
  if (TNG._troca && k in TNG._troca) return TNG._troca[k];
  let s = w.w.replace(/["“”«»]/g, '').replace(/^[-–—]+|[-–—]+$/g, '');
  return fimBloco ? s.replace(/[,;:]+$/, '.') : s.replace(/[,;:.]+$/, '');   // vírgula que fecha o bloco vira ponto; nunca vírgula
}
function tngQuebra(ws) {                         // divide as palavras de um plano em blocos de legenda
  const out = []; let cur = [];
  ws.forEach((w, i) => {
    cur.push(w);
    if (/[.?!]$/.test(w.w) || i === ws.length - 1) { out.push(cur); cur = []; }
  });
  const res = [];
  out.forEach(seg => {
    const txt = s => s.map(w => w.w).join(' ');
    const cabe = s => s.length <= TNG.capMaxPal && txt(s).length <= TNG.capMaxCar && tngLargCap(txt(s)) <= TNG.capLarg;
    const parte = s => {
      if (cabe(s)) { res.push(s); return; }
      let j = s.findIndex((w, i) => i > 0 && i < s.length - 1 && /[,;:]$/.test(w.w));     // corta na vírgula
      if (j < 0) j = Math.ceil(s.length / 2) - 1; else if (j < 1) j = 1;
      parte(s.slice(0, j + 1)); parte(s.slice(j + 1));
    };
    if (seg.length) parte(seg);
  });
  return res;
}
function tngBlocos() {
  if (TNG_BLOCOS) return TNG_BLOCOS;
  const W = []; TIMING.beats.forEach(b => b.words.forEach((w, i) => { w._bid = b.id; w._i = i; W.push(w); }));
  TNG._troca = {}; Object.entries(TNG.troca).forEach(([ref, txt]) => { const r = tngPal(ref); if (r.w) TNG._troca[`${r.w._bid}#${r.w._i}`] = txt; });
  const P = TNG_PLANOS, idx = P.map(p => p.w ? W.indexOf(p.w) : W.findIndex(w => w.s >= p.t - .06));
  const segs = [];
  P.forEach((p, k) => {
    const a = idx[k], z = k < P.length - 1 ? idx[k + 1] : W.length, ws = a >= 0 ? W.slice(a, Math.max(a, z)) : [];
    p.semLeg = p.op.leg === false || (p.op.leg === undefined && TNG_SEM_LEG.has(p.tipo));
    if (p.semLeg) return;
    if (p.op.leg === 'continua' && segs.length) { segs[segs.length - 1].ws.push(...ws); return; }
    segs.push({ p, ws, s: p.t });
  });
  const B = [];
  segs.forEach(sg => tngQuebra(sg.ws).forEach((ws, j) => {
    const s = j === 0 ? sg.s : Math.max(sg.s, tngQc(ws[0].s + .04));
    B.push({ s, rev: ws.map((w, i) => [w, i === 0 ? s : Math.max(s, tngQc(w.s + TNG.revela)), tngTexto(w, i === ws.length - 1)]).filter(x => x[2] !== '') });
  }));
  const semLegT = P.filter(p => p.semLeg).map(p => p.t);
  B.forEach((b, i) => {
    const nx = i < B.length - 1 ? B[i + 1].s : tngFim().t0 + TNG.fimDur + TNG.fimBranco;
    const sl = semLegT.find(t => t > b.s + 1e-4 && t < nx);
    b.e = sl ?? nx;
  });
  // toda palavra acende pelo menos 2 degraus antes do fim do bloco (senão a última palavra cai no corte e nunca aparece)
  B.forEach(b => { const lim = Math.max(b.s, Math.floor(b.e * TNG.cad + 1e-6) / TNG.cad - 2 / TNG.cad); b.rev.forEach(r => { if (r[1] > lim) r[1] = lim; }); });
  return (TNG_BLOCOS = B);
}
let _tngKey = -1;
renderCaptions = function (t) {
  const box = $('cap'), B = tngBlocos(), pl = tngPlanoEm(t);
  let i = -1; for (let k = 0; k < B.length; k++) if (t >= B[k].s - 1e-4 && t < B[k].e - 1e-4) { i = k; break; }
  if (i < 0 || !pl || pl.semLeg || t >= tngFim().t0 + TNG.fimDur) { box.style.opacity = 0; return; }
  const b = B[i];
  if (i !== _tngKey) {
    _tngKey = i; box.className = 'tng-cap'; box.innerHTML = '';
    box._sp = b.rev.map(([w, tr, txt], j) => {
      const sp = el(box, 'span', 'visibility:hidden;', esc(txt)); sp._tr = tr;
      if (j < b.rev.length - 1) box.appendChild(document.createTextNode(' '));
      return sp;
    });
  }
  const claro = pl.tipo === 'branco' || pl.tipo === 'print' || pl.tipo === 'celular' || (pl.tipo === 'contador' && pl.op.cor === 'branco');
  const cor = pl.op.capCor ?? (claro ? '#000000' : '#ffffff');
  const sombra = cor === '#ffffff' && !TNG_CARTOES.has(pl.tipo) ? (pl.op.capForte ? TNG.sombraForte : TNG.sombra) : 'none';
  box.style.cssText = `opacity:1;top:${(pl.capY ?? TNG.capTop).toFixed(1)}px;color:${cor};text-shadow:${sombra};`;
  box._sp.forEach(sp => { sp.style.visibility = t >= sp._tr - 1e-4 ? 'visible' : 'hidden'; });
};

// ---------- fim, sons, selo, poeira, cadência ----------
let TNG_FIM = null;
function tngFim() {
  if (TNG_FIM) return TNG_FIM;
  const bs = TIMING.beats, ult = bs[bs.length - 1].words.slice(-1)[0];
  return (TNG_FIM = { ultima: ult.e, t0: TNG.fimEm ?? tngQ(ult.e + TNG.fimApos) });
}
function tngFadeAlfa(t) {                    // fade para branco medido: .02 .20 .50 .68 .79 .86 .91 .95 … a cada 1/24 s
  const l = t - tngFim().t0;
  return l <= 0 ? 0 : l >= TNG.fimDur ? 1 : clamp(1 - Math.exp(-Math.max(0, l - .03) / .105));
}
function tngEventos() {
  const B = tngBlocos();
  const drop = TNG.musica.find(m => m[0] === 'drop');
  const ate = TNG.cliqueAte == null ? (drop ? tngQ(tngPal(drop[1]).t) : 10) : typeof TNG.cliqueAte === 'number' ? TNG.cliqueAte : tngQ(tngPal(TNG.cliqueAte).t);
  B.forEach(b => b.rev.forEach(([w, tr]) => {
    const pl = tngPlanoEm(tr);
    if (tr < ate - 1e-4 || TNG_CARTOES.has(pl.tipo)) EVENTS.push({ t: tr, type: 'tng:clique' });
  }));
  TNG_PLANOS.forEach(p => {
    if (p.tipo === 'foto' && p.op.obturador !== false) EVENTS.push({ t: p.t, type: 'tng:obturador' });
    if (p.tipo === 'montagem' && p.op.rajada !== false) EVENTS.push({ t: p.t, type: 'tng:rajada', d: +((p.passosTot || (p.op.imagens || []).length) / TNG.cad).toFixed(3) });
  });
  TNG.musica.forEach(([tipo, ref, d]) => EVENTS.push({ t: tngQ(tngPal(ref).t), type: 'tng:' + tipo, ...(d ? { d } : {}) }));
  const F = tngFim();
  EVENTS.push({ t: F.t0, type: 'tng:fim', d: TNG.fimDur, ultima: F.ultima });
  // (sem ordenar: o motor de ajustes do kit guarda o índice de cada som por cena)
}
function tngPoeira() {                        // poeira/fumaça branca FIXA só nas bordas (topo y<144 e base y>1490), modo screen
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const x = c.getContext('2d'); let sd = 20261104;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const grao = (cx, cy, r, a) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(255,255,255,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  };
  const alfa = () => Math.min(.32, .03 + .07 * -Math.log(1 - rnd() * .97));     // p50 ~.08, p90 ~.19
  const ponto = (cx, cy, r, a) => { x.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); };
  // véu quase invisível (a referência é poeira de grão nítido, não nuvem)
  [[540, 10, 230, .045], [430, 50, 150, .03], [660, 0, 170, .035]].forEach(a => grao(...a)); grao(1010, 1890, 260, .025);
  const gTopo = () => [rnd() < .79 ? 360 + rnd() * 360 : rnd() * 1080, rnd() < .92 ? rnd() * 96 : 96 + rnd() * 48];
  const gBase = () => [rnd() < .63 ? 900 + rnd() * 180 : rnd() * 900, 1920 - 430 * Math.pow(rnd(), 1.4)];
  for (const [n, pos] of [[260, gTopo], [200, gBase]]) for (let i = 0; i < n; i++) {
    const [px, py] = pos(), r = .7 + rnd() * 2.3;
    if (rnd() < .6) ponto(px, py, r * .7, alfa()); else grao(px, py, r * 1.6, alfa());
    if (rnd() < .08) for (let j = 0; j < 4; j++) ponto(px + (rnd() - .5) * 14, py + (rnd() - .5) * 10, .6 + rnd(), alfa() * .8);   // aglomerado
  }
  x.lineWidth = 1;
  [[840, 0, 885, 80, .14], [610, 4, 590, 46, .09], [960, 1700, 990, 1790, .1], [180, 1860, 205, 1915, .08]].forEach(([a, b, c2, d, al]) => {
    x.strokeStyle = `rgba(255,255,255,${al})`; x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke();
  });
  return c.toDataURL();
}
const TNG_TREME = (() => {                    // a camada inteira treme ~1 px, rígida, a 8 Hz (AR medido)
  let sd = 77, x = 0, y = 0; const rn = () => (sd = (sd * 48271) % 2147483647) / 2147483647;
  const g = () => Math.sqrt(-2 * Math.log(rn() + 1e-9)) * Math.cos(6.2831853 * rn());
  const L = []; for (let j = 0; j < 6000; j++) { x = clamp(.85 * x + 1.1 * g(), -4.5, 4.5); y = clamp(.85 * y + .68 * g(), -3, 3); L.push([x, y]); }
  return L;
})();
let _tngOk = false;
function tngInicia() {
  if (_tngOk) return; _tngOk = true;
  tngBlocos(); tngEventos();
  const st = $('stage');
  if (TNG.poeira) { const d = el(st, 'div', ''); d.id = 'tng-poeira'; d.style.backgroundImage = `url(${tngPoeira()})`; }
  if (TNG.selo) { const s = el(st, 'div', '', esc(TNG.selo)); s.id = 'tng-selo'; s.style.background = TNG.seloCor; }
  $('fade').style.background = '#fff';
}
// cadência: o conteúdo só muda a cada 1/12 s (o render.py grava os 2 quadros de cada degrau com uma captura só, via TNG_CHAVE)
window.TNG_CHAVE = t => t >= tngFim().t0 - 1e-4 ? 'f' + Math.round(t * 24) : 'q' + Math.floor(t * TNG.cad + 1e-6);
const _tngRender = window.render;
window.render = async function (t) {
  tngInicia();
  const tq = Math.floor(t * TNG.cad + 1e-6) / TNG.cad;
  const k = await _tngRender(Math.min(tq, TIMING.videoDur - 1e-3));
  $('fade').style.opacity = tngFadeAlfa(t).toFixed(3);
  const po = $('tng-poeira');
  if (po) { const j = TNG_TREME[Math.min(TNG_TREME.length - 1, Math.floor(tq * 8 + 1e-6))]; po.style.transform = `translate(${j[0].toFixed(2)}px,${j[1].toFixed(2)}px)`; }
  return k;
};
// relatório para o montar.py: ritmo, tipos, legenda, erros
window.TNG_RELATORIO = () => {
  tngInicia();
  const P = TNG_PLANOS, F = tngFim(), d = P.map((p, i) => (i < P.length - 1 ? P[i + 1].t : F.t0) - p.t);
  const passos = P.filter(p => p.tipo === 'montagem').reduce((s, p) => s + Math.max(0, (p.op.imagens || []).length - 1), 0);
  const ds = [...d].sort((a, b) => a - b), med = ds.length ? ds[ds.length >> 1] : 0;
  const tipo = {}; P.forEach((p, i) => { tipo[p.tipo] = (tipo[p.tipo] || 0) + d[i]; });
  const suj = TNG.sujeito ? P.reduce((s, p, i) => s + (String(p.fonte).includes(':' + TNG.sujeito) ? d[i] : 0), 0) : null;
  const B = tngBlocos(), npal = B.map(b => b.rev.length), txt = B.map(b => b.rev.map(x => x[2]).join(' '));
  const ev = {}; EVENTS.forEach(e => { ev[e.type] = (ev[e.type] || 0) + 1; });
  return {
    planos: P.length, cortes: P.length - 1 + passos, passosMontagem: passos, dur: F.t0, porMin: (P.length - 1 + passos) / F.t0 * 60,
    porMinSemMontagem: (P.length - 1) / F.t0 * 60, mediana: med, media: d.reduce((a, b) => a + b, 0) / Math.max(1, d.length),
    curtos: P.filter((p, i) => d[i] < .24 && p.tipo !== 'montagem').map(p => p.quando), longos: P.filter((p, i) => d[i] > 2.4).map((p, i) => p.quando),
    tipo, sujeito: suj, blocos: B.length, palMedia: npal.reduce((a, b) => a + b, 0) / Math.max(1, npal.length),
    maisLargo: txt.reduce((m, s) => tngLargCap(s) > tngLargCap(m) ? s : m, ''), largMax: Math.max(0, ...txt.map(tngLargCap)),
    eventos: ev, erros: TNG_ERROS, fim: F,
  };
};
