// ============================================================================
//  edit-earn — biblioteca do formato "minidocumentário em camadas" (referência: earn.edits, cientista russa, out/2026)
//  1ª parte do render/scenes.js (work/<prefixo>_a.js). Precisa do motor do Kit_Edicao_Vox_v2.
//
//  Narração grave e lenta; cada frase é um MUNDO composto em camadas (fundo + personagem + objetos) que nunca para de se mexer.
//  Sem legenda corrida: texto só nas cenas de tipografia, nos jornais e na etiqueta do nome. Malha fina de 6 px sobre tudo.
//   1. mundo em camadas: personagem entra da câmera, objetos sobem por trás, foco puxado, P&B na virada   mundo()
//   2. etiqueta vermelha com o nome, presa ao personagem                                                 (op. etiqueta)
//   3. máscara de pincel que troca o fundo                                                              (op. troca)
//   4. data/número digitado no escuro, cursor e sublinhado vermelho                                    digitado()
//   5. uma palavra por vez em serifa itálica sobre a planta azul                                       palavras()
//   6. palavras empilhando ("E a história é sombria.")                                                 pilha()
//   7. letras 3D extrudadas no papel quadriculado                                                      letras3D()
//   8. matéria impressa REAL na mesa ou nas tábuas: marca-texto, círculo vermelho, punch-in            jornal()
//   9. fotos P&B voando para a parede (2×2), flash, raios de luz                                       parede()
//  10. sala com TV (foto real) e o conteúdo dentro da TV (apresentador, clipe, foto)                  salaTV()
//  11. fechadura: a cena vista pelo buraco da fechadura                                                (op. fechadura)
//  12. apresentador limpo em tela cheia, com a etiqueta na 1ª aparição                                 presEA()
//  13. final com o perfil REAL num monitor antigo                                                      perfilEA()
//  Passagens: corte seco (padrão, com swish), 'ea:sobe' (o plano novo sobe empurrando), 'gl:sdf-iris' (íris), saída da câmera,
//  'ea:matte:<nome>' (mattes de tinta/líquido/redonda do projeto), 'ea:wipe' (Linear Wipe).
//  v3 (31/10): o movimento segue o projeto After Effects original (siberias-mysterious-lab-death): rig de câmera entrada/meio/saída com
//  as curvas do AE (aeEase, EA_ENTRA 33/100, EA_SAI 100/1,7, EA_SUAVE 75/75, EA_RAPIDA 2/100), wiggles das camadas (aeWiggle),
//  borrão 0 → 30 → 0 px em cada corte, brilho wiggle(5,10), grade e ruído do projeto, flash + onda (JerryFlow), Posterize 16 q/s.
//  motor golpe (02/11/2026, opção de cena golpes; o mesmo da vox-edit2, A/B aprovado): chicotes de câmera medidos nas refs (EA_GOLPE),
//  planos dentro da cena no tempo da palavra, chegada/saída em chicote, borrão só no pico, mola nas entradas (EA_MOLA), tranco.
//  motor foco (03/11/2026, opção de cena foco; A/B aprovado na vox-edit2 e adaptado aqui, teste_foco_earn): o olho acompanha — um
//  assunto por vez no centro, um texto por vez e PARADO (fora do mundo), câmera chegando já no assunto com no máximo um movimento por
//  frase (zoom > panorâmica), troca no lugar ('pousa'/'some'), efeitos um de cada vez, ambiente mais baixo (eaFoco, eaFocoIni, eaNumero).
// ============================================================================
const EA = { verm: '#d8102a', vermEsc: '#8e0b1c', amarelo: '#ffe14a', verde: '#57f23f', tinta: '#141414', papel: '#efe8d8',
  azul: '#24467f', l3d: ['#e3b94e', '#c8232c', '#3b6fe8'] };
const EA_SERIF = 'PlayfairItalic', EA_COND = 'Fjalla', EA_SANS = 'Poppins', EA_JORNAL = 'TimesInv';
// cores por mundo (filtro CSS no palco). A referência troca de mundo de cor a cada cena: frio, quente, verde-azulado, vermelho, P&B
// v2 (31/10, Felipe: "as cores saltam aos olhos" no original): tudo mais saturado e contrastado + luz colorida por cima (eaLuz)
const EA_COR = {
  neutro: 'contrast(1.14) saturate(1.32) brightness(1.03)',
  frio: 'contrast(1.16) saturate(1.28) hue-rotate(-8deg) brightness(1.04)',
  quente: 'contrast(1.17) saturate(1.5) sepia(.1) brightness(1.02)',
  verde: 'sepia(.55) hue-rotate(118deg) saturate(2) contrast(1.2) brightness(.88)',
  vermelho: 'sepia(.6) hue-rotate(-28deg) saturate(3.1) contrast(1.16) brightness(.85)',
  pb: 'grayscale(1) contrast(1.28) brightness(.96)',
  arquivo: 'grayscale(1) contrast(1.18) brightness(1.02) sepia(.08)',
};
const eaCor = k => EA_COR[k] ?? k ?? EA_COR.neutro;
// luz colorida por cima do mundo (soft-light + brilho em screen), andando devagar: o brilho de cinema das imagens da referência
const EA_LUZ = { frio: ['rgba(120,190,255,.55)', 'rgba(20,40,90,0)'], quente: ['rgba(255,170,80,.6)', 'rgba(80,30,0,0)'],
  verde: ['rgba(120,255,220,.38)', 'rgba(0,40,40,0)'], vermelho: ['rgba(255,60,40,.6)', 'rgba(60,0,0,0)'], neutro: ['rgba(255,235,200,.35)', 'rgba(0,0,0,0)'] };
// v3: o projeto põe em quase toda cena um ajuste "Depth" = Gradient Ramp radial (branco em (-18%, -3%) → preto em (79%, 131%),
// soft light, 20–50%) e um CC Light Sweep parado (faixa de 450 px passando por (45%, 32%), suave). eaLuz soma os dois à luz colorida.
function eaLuz(r, S, tipo) {
  const L = EA_LUZ[tipo]; if (!L) return null;
  el(r, 'div', 'position:absolute;inset:0;pointer-events:none;z-index:2;mix-blend-mode:soft-light;opacity:.45;' +
    'background:radial-gradient(ellipse 105% 90% at -18% -3%, #fff 0%, rgba(128,128,128,0) 62%, #000 118%);');
  el(r, 'div', 'position:absolute;inset:-400px;pointer-events:none;z-index:2;mix-blend-mode:screen;opacity:.16;' +
    'background:linear-gradient(120deg, rgba(255,255,255,0) 38%, rgba(255,248,235,.9) 47.5%, rgba(255,255,255,0) 57%);');
  const e = el(r, 'div', 'position:absolute;inset:-300px;pointer-events:none;z-index:2;mix-blend-mode:soft-light;');
  const g = el(r, 'div', 'position:absolute;inset:-300px;pointer-events:none;z-index:2;mix-blend-mode:screen;opacity:.22;');
  (S.upd = S.upd || []).push((S_, c) => {
    const x = 30 + 14 * Math.sin(c.lt * .45 + c.t0), y = 22 + 9 * Math.sin(c.lt * .6 + c.t0 * 2);
    e.style.background = `radial-gradient(ellipse 60% 45% at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${L[0]}, ${L[1]} 70%)`;
    g.style.background = `radial-gradient(ellipse 38% 26% at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${L[0]}, rgba(0,0,0,0) 70%)`;
  });
  return e;
}

// ---------- utilidades ----------
const _eaC = document.createElement('canvas').getContext('2d');
function eaLarg(txt, px, fam, peso = 400, estilo = 'normal') { _eaC.font = `${estilo} ${peso} ${px}px ${fam}`; return _eaC.measureText(txt).width; }
const eaT = (c, v) => typeof v === 'function' ? v(c) : v;                       // tempo dado como número ou c => tempo
const eaRnd = (() => { let a = 777; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();   // só texturas
function eaAsset(nome) { const a = AS(nome); if (!a) throw new Error(`asset ${nome} não existe (rode make_assets.py)`); return a; }

// ---------- curvas da câmera (medidas na referência) ----------
// arranque: 60–85% do caminho no 1º quarto e chega ainda andando (nunca para); saida: acelera para dentro do corte seguinte
const EA_ARRANQUE = u => .86 * (1 - Math.pow(1 - u, 3.4)) + .14 * u;
// ---------- curvas e wiggle do After Effects (lidos do projeto .aep original da EarnEdits, 31/10/2026) ----------
// aeEase(u, influência de saída, influência de chegada): o ease temporal do AE com velocidade 0 nas pontas
// (bézier P1 = (oi, 0), P2 = (1 − ii, 1)). As três curvas que o projeto usa em TODO lugar:
//   EA_ENTRA (33%, 100%) — câmera chegando, objetos entrando: arranca macio e assenta numa cauda longa
//   EA_SAI (100%, 1,7%) — os nulls de saída da câmera: parte devagar e ACELERA até o corte (o corte some no borrão)
//   EA_SUAVE (75%, 75%) — S longo (deriva do meio do plano, wipes)
function aeEase(u, oi, ii) {
  u = clamp(u); if (u <= 0 || u >= 1) return u;
  const x2 = 1 - ii; let lo = 0, hi = 1, s_ = u;
  for (let k = 0; k < 26; k++) { s_ = (lo + hi) / 2; const x = 3 * (1 - s_) * (1 - s_) * s_ * oi + 3 * (1 - s_) * s_ * s_ * x2 + s_ * s_ * s_; if (x < u) lo = s_; else hi = s_; }
  return 3 * (1 - s_) * s_ * s_ + s_ * s_ * s_;
}
const EA_ENTRA = u => aeEase(u, .333, 1), EA_SAI = u => aeEase(u, 1, .017), EA_SUAVE = u => aeEase(u, .75, .75), EA_RAPIDA = u => aeEase(u, .02, 1);
// aeWiggle(t, freq, amp, semente) = wiggle(freq, amp) do AE (ruído suave de 1 oitava), determinístico por semente.
// O projeto usa: câmera wiggle(1,15) ou (1,25) [duas vezes: controlador + câmera]; pessoas wiggle(3,10) no Y; palavras
// wiggle(3,25) no Y; fotos soltas wiggle(.5,15) na posição + wiggle(1,3) no giro; brilho geral wiggle(5,10); glow wiggle(5,.5).
function aeWiggle(t, f, a, sem = 0) {
  const x = t * f + sem * 17.31, i = Math.floor(x), u = x - i, q = u * u * u * (u * (u * 6 - 15) + 10);
  const v = k => hrand(k * 1.618 + sem * 7.77) * 2 - 1;
  return a * lerp(v(i), v(i + 1), q);
}
const EA_CURVAS = { arranque: EA_ARRANQUE, entra: EA_ENTRA, sai: EA_SAI, ae: EA_SUAVE, rapida: EA_RAPIDA, suave: E.inOut, linear: E.lin, saida: EA_SAI, seco: E.out5 };

// ---------- motor "golpe" (02/11/2026; o mesmo da vox-edit2, cujo A/B o Felipe aprovou: "B aprovado, aplica") ----------
// Medido nas referências de motion do Felipe (earn.edits cientista, 30 q/s com borrão, e Buffett, 16 q/s): plano novo a cada
// ~0,9 s, a câmera viaja em CHICOTES (pico de velocidade em 20% do tempo, desliza até zero), borrão direcional só no pico.
// EA_GOLPE: a velocidade começa a ~45% do pico, chega ao pico em 20% do tempo e desliza até zero (metade do caminho em 36%).
// EA_MOLA: passa ~9% do ponto e assenta (entradas de camada).
const _eaGT = (() => {
  const N = 200, v = [], p = [0];
  for (let i = 0; i <= N; i++) { const u = i / N, a = u / .2; v.push(u < .2 ? .45 + .55 * a * a * (3 - 2 * a) : Math.pow(1 - (u - .2) / .8, 2.2)); }
  for (let i = 1; i <= N; i++) p.push(p[i - 1] + (v[i - 1] + v[i]) / 2);
  return p.map(x => x / p[N]);
})();
const EA_GOLPE = u => { u = clamp(u); const f = u * 200, i = Math.min(199, Math.floor(f)); return lerp(_eaGT[i], _eaGT[i + 1], f - i); };
const _eaMol1 = 1 - Math.exp(-6) * Math.cos(8);
const EA_MOLA = u => { u = clamp(u); return u >= 1 ? 1 : (1 - Math.exp(-6 * u) * Math.cos(8 * u)) / _eaMol1; };
EA_CURVAS.golpe = EA_GOLPE; EA_CURVAS.mola = EA_MOLA;
// Opção de cena golpes (mundo, jornal, digitado, palavras, letras3D, parede, salaTV, perfilEA):
//   golpes: true  -> a câmera da cena (cam) continua, mas CHEGA em chicote (começa mais perto, girada e abaixo) e SAI em chicote
//                    que o corte pega logo depois do pico; borrão só acima de ~10 px/quadro; tranco nos socos; câmera na mão.
//   golpes: c => ({planos: [[t, {x, y, z, r} | {alvo: 'trecho', dx, dy, z, r}, d]], golpes: [[t, amp]], deriva, mao, chega, sai})
//                 -> planos[0] = pose de antes (fora do quadro, de onde a câmera vem); cada plano seguinte é um chicote de d s
//                    (padrão .8) que começa em t (~.2 s antes da palavra: o pico cai nela). x, y = ponto do mundo no centro da tela,
//                    z = zoom. alvo (só no jornal) = trecho da matéria, 'titulo' ou 'foto': a câmera centra nele (regra 5).
//                    golpes = tranco [t, 6–10 px] quando algo pousa (os socos da cena já ganham tranco sozinhos).
//   deriva (zoom/s; padrão −.02 nos 55% iniciais do vídeo = recua, +.02 depois = aproxima: a regra 2), mao (px, 5),
//   chega (sem planos: {z: 1.45, r: ±6, y: 160, t: −.12, d: .8} ou false), sai ({z: .82 | 1.3, r: ±6, y: 80 | 0, t: .25, d: .8} ou false).
// Personagem centrado (regra 1): nos planos de um mundo com personagem mantenha x = 540 e ande só em y, z e r.
function eaGolpes(c, g, S, camF, alvo) {
  g = g === true ? {} : (g || {});
  const En = window.EA_ENERGIA ?? 1, sg = Math.round(c.t0 * 10) % 2 ? 1 : -1;
  const segunda = c.t0 / ((window.TIMING && TIMING.videoDur) || 1) >= .55;
  const res = q => { if (q.alvo !== undefined && alvo) { const p = alvo(q.alvo); if (p) return { ...q, x: p.x + (q.dx ?? 0), y: p.y + (q.dy ?? 0) }; } return q; };
  const P = g.planos ? g.planos.map(([t, q, d]) => [t, res(q), d]) : null;
  const mao = (g.mao ?? 5) * En, dz = (g.deriva ?? (segunda ? .02 : -.02)) * En;
  const ch = (P || g.chega === false) ? null : { z: 1.45, r: sg * 6, y: 160, x: 0, t: -.12, d: .8, ...(g.chega || {}) };
  const sai = g.sai === false ? null : { z: segunda ? 1.3 : .82, r: sg * 6, y: segunda ? 0 : 80, t: .25, d: .8, ...(g.sai || {}) };
  const sem = (c.t0 * 3.7) % 50;
  return lt => {
    const b = camF ? camF(lt) : { x: 540, y: 960, z: 1, r: 0 };
    let x, y, z, r;
    if (P) {
      ({ x, y, z } = { x: 540, y: 960, z: 1, ...P[0][1] }); r = P[0][1].r ?? 0;
      for (let i = 1; i < P.length; i++) {
        const [t, q, d] = P[i], k = EA_GOLPE((lt - t) / (d ?? .8));
        if (q.x !== undefined) x = lerp(x, q.x, k); if (q.y !== undefined) y = lerp(y, q.y, k);
        if (q.z !== undefined) z = Math.exp(lerp(Math.log(z), Math.log(q.z), k)); if (q.r !== undefined) r = lerp(r, q.r, k);
      }
    } else {
      ({ x, y, z } = b); r = b.r || 0;
      if (ch) {
        const k = (1 - EA_GOLPE((lt - ch.t) / ch.d)) * En;
        z *= Math.pow(ch.z, k); r += ch.r * k; x += ch.x * k / Math.max(.4, z); y += ch.y * k / Math.max(.4, z);
      }
    }
    z *= Math.exp(dz * lt);
    x += aeWiggle(lt, 1.3, mao, sem + 11.1); y += aeWiggle(lt, 1.1, mao, sem + 12.7); r += aeWiggle(lt, .9, .3, sem + 13.3);
    // tranco: false (motor foco) = os socos continuam como zoom de ênfase, sem o tranco que sacode a tela
    const G = (g.golpes || []).concat(g.tranco === false ? [] : (S.socos || []).map(t => [t + .02, 7]), g.tranco !== false && S.tSoco != null ? [[S.tSoco + .02, 8]] : []);
    for (const [t, a] of G) {
      const u = lt - t; if (u < 0 || u > .6) continue;
      const s = a * En * Math.exp(-u * 9);
      x += s * Math.sin(u * 55); y += s * .8 * Math.cos(u * 47); r += s * .05 * Math.sin(u * 39); z *= 1 + s * .002;
    }
    return { ...b, x, y, z, r, _golpe: { sai } };
  };
}
// liga o motor na cena (os componentes chamam logo depois de S.camF = eaKf(...)): S.camF passa a devolver a câmera do motor
function eaComGolpes(S, c, o, alvo) {
  const g = S._g !== undefined ? S._g : (typeof o.golpes === 'function' ? o.golpes(c) : o.golpes);   // S._g: já avaliado pelo eaFocoIni
  if (!g) return;
  S.golpe = true;
  S.camF = eaGolpes(c, g, S, S.camF, alvo);
}
// alvo do jornal: centro (no mundo) do trecho da matéria, ou 'titulo' / 'foto' (medido no build, antes da câmera)
// texto: true (motor foco) = o 'titulo' é o centro das LETRAS do título (título curto fica no meio da tela), não o da caixa
function eaAlvoJornal(papel, op = {}) {
  return trecho => {
    const n = trecho === 'titulo' ? papel.querySelector('[data-bloco="titulo"]') : trecho === 'foto' ? papel.querySelector('[data-foto]') :
      ([...papel.querySelectorAll('.eamk')].find(s => s.textContent === trecho) || eaMarcaSpan(papel, trecho));
    if (!n) return null;
    const rg = op.texto && trecho === 'titulo' ? document.createRange() : null; if (rg) rg.selectNodeContents(n);
    const pr = papel.getBoundingClientRect(), rs = [...(rg || n).getClientRects()], k = papel.offsetWidth / (pr.width || 1);
    if (!rs.length) return null;
    const x0 = Math.min(...rs.map(q => q.left)), x1 = Math.max(...rs.map(q => q.right)), y0 = Math.min(...rs.map(q => q.top)), y1 = Math.max(...rs.map(q => q.bottom));
    return { x: parseFloat(papel.style.left) + ((x0 + x1) / 2 - pr.left) * k, y: parseFloat(papel.style.top) + ((y0 + y1) / 2 - pr.top) * k };
  };
}

// ---------- motor "foco" (03/11/2026; A/B aprovado na vox-edit2, "B aprovado, aplica"; adaptado aqui no teste_foco_earn) ----------
// Pedido do Felipe: "a velocidade parece atrapalhar o acompanhamento... muitos efeitos se perdem na tela e não são focalizados".
// Medido (BukeleHaiti x referência earn.edits): não é a velocidade da câmera (pico e chicotes/min iguais), é o que o olho persegue:
// panorâmica em vez de zoom, o foco do olho pulando (73–90 saltos/min x 45 na referência), 2+ textos na tela 52–76% do tempo, letras
// andando e borrando no chicote, 4–6 reenquadramentos + 3–5 itens entrando pelas bordas por cena, começo de cena vazio.
// Regras (opção de cena foco):
//   1. um assunto por vez, grande e no centro;
//   2. um texto por vez, PARADO enquanto se lê: tipografia, etiqueta e número ficam FORA do mundo (não andam com a câmera nem borram
//      no chicote); no jornal o resto da página apaga (.3) e só o trecho em foco fica em tinta cheia;
//   3. a câmera chega JÁ no assunto (quadro 0 nunca vazio), no máximo um movimento por frase (≥ ~1 s), ZOOM para dar ênfase,
//      panorâmica só para trocar de assunto, deriva lenta contínua; o chicote de saída no corte continua (zoom curto);
//   4. nada entra deslizando da borda: entradas esq/dir/cima/baixo/canto viram 'pousa' (1,08 → 1 em .22 s, no lugar) e as saídas
//      viram 'some' (some no lugar); os objetos que sobem por trás da cabeça (atras) continuam subindo, um de cada vez, no centro;
//   5. os efeitos continuam (flash + onda, P&B, pincel, socos = zoom, fechadura, marca-texto, círculo), um de cada vez e no centro;
//   6. ambiente mais baixo: poeira ×.4, wiggle das camadas ×.25, vida3d ×.5, brilho tremendo e cintilação ×.4; sem tranco; o borrão de
//      corte do projeto (0 → 30 → 0 px) fica pela metade nos cortes que ENTRAM numa cena foco (pulso .5: o assunto continua visível).
// Liga com foco: true (câmera padrão do componente) | foco: c => [[t, x, y, z, d], ...] (focos da câmera) |
//   foco: {focos, mao, deriva, chega, sai, vida, vida3d, poeira, pisca, apagado, pulso, ...opções do componente} | golpes: c => eaFoco(c, focos).
const EA_FOCO = { vida: .25, vida3d: .5, poeira: .4, pisca: .4, apagado: .3, pulso: .5 };
// eaFoco(c, focos, {chega, sai, deriva, mao, base}) -> spec do motor golpe (eaGolpes) com foco: true.
//   focos = [[t, x, y, z, d], ...] ou [[t, {x, y, z, r, alvo, dx, dy}, d], ...]: x, y = ponto do mundo no CENTRO da tela (o centro do
//   assunto), z = zoom, alvo (jornal) = trecho | 'titulo' | 'foto'. O 1º foco é a chegada: a câmera vem de um pouco mais perto
//   (chega {z: 1.14, x, y, r, d: .5}, começa .12 s antes do corte: o quadro 0 já mostra o assunto); cada foco seguinte é UM movimento
//   de d s (.8) que começa .2 s antes de t. Ênfase = o mesmo x, y com z maior; outro assunto = outro x, y (uma panorâmica por frase).
//   Personagem centrado: x = 540 sempre. base: true (sem focos) = a câmera do componente (cam/chaves) segue por baixo.
//   Padrões: deriva ∓.05 de zoom por segundo (recua na 1ª metade do vídeo, aproxima depois; a referência deriva 5–30%/s; zoom não
//   tira o assunto do meio), mao 4 px, sem tranco, saída = zoom curto que o corte pega ({z: .87 | 1.16, r: ±2,5, y: 0, t: .2, d: .7});
//   sai: false = sem chicote (corte casado com a cena seguinte ou passagem que já empurra, como ea:sobe). No jornal (texto no mundo)
//   o padrão é mais calmo: deriva .02, chega 1.05, mão 3.
function eaFoco(c, focos, o = {}) {
  const sg = Math.round(c.t0 * 10) % 2 ? 1 : -1, segunda = c.t0 / ((window.TIMING && TIMING.videoDur) || 1) >= .55;
  const g = { foco: true, golpes: [], tranco: false, deriva: o.deriva ?? (segunda ? .05 : -.05), mao: o.mao ?? 4,
    sai: o.sai === false ? false : { z: segunda ? 1.16 : .87, r: sg * 2.5, y: 0, t: .2, d: .7, ...(o.sai || {}) } };
  if (o.base && !(focos && focos.length)) return { ...g, chega: false };
  const F = (focos && focos.length ? focos : [[0, 540, 960, 1.06]]).map(f => f[1] !== null && typeof f[1] === 'object'
    ? [eaT(c, f[0]), { ...f[1] }, f[2]] : [eaT(c, f[0]), { x: f[1], y: f[2], z: f[3] ?? 1.06 }, f[4]]);
  const ch = o.chega === false ? null : { z: 1.14, x: 0, y: 0, r: 0, d: .5, ...(o.chega || {}) };
  const f0 = F[0][1], pre = { ...f0, r: (f0.r ?? 0) + (ch ? ch.r : 0) };
  if (ch) {
    pre.z = (f0.z ?? 1) * ch.z;
    if (f0.alvo !== undefined) { pre.dx = (f0.dx ?? 0) + ch.x; pre.dy = (f0.dy ?? 0) + ch.y; }
    else { pre.x = (f0.x ?? 540) + ch.x; pre.y = (f0.y ?? 960) + ch.y; }
  }
  g.planos = [[-1, pre], [-.12, { r: 0, ...f0 }, ch ? ch.d : .04], ...F.slice(1).map(([t, q, d]) => [t - .2, { r: 0, ...q }, d ?? .8])];
  g.focos = F;
  return g;
}
// liga o modo foco no build (ANTES de criar os elementos): S.foco = parâmetros, S._g = spec da câmera (o golpes é avaliado uma vez só)
// padrao = câmera/opções padrão do componente ({focos, base, mao, deriva, sai, chega, ...}); o foco da cena manda por cima
function eaFocoIni(S, c, o, padrao = {}) {
  const g = typeof o.golpes === 'function' ? o.golpes(c) : o.golpes;
  S._g = g || null;
  const fo = o.foco;
  if (!fo && !(g && g.foco)) return null;
  const op = fo && typeof fo === 'object' ? fo : {};
  if (!(g && g.foco)) {
    const focos = typeof fo === 'function' ? fo(c) : op.focos ? eaT(c, op.focos) : eaT(c, padrao.focos);
    S._g = eaFoco(c, focos, { ...padrao, ...op });
  }
  S.foco = { ...EA_FOCO, ...padrao, ...op };
  return S.foco;
}
// número ou palavra gigante como O assunto do instante, FIXO no centro (fora do mundo), dentro de um mundo: o mundo escurece por
// trás, o número pousa (1,08 → 1) com o sublinhado vermelho crescendo e a fonte em letra pequena logo abaixo (o mesmo bloco).
// eaNumero(r, S, c, '~1,5 MILHÃO', 'deslocados no Haiti · OIM, set/2026', t0, t1, {y: 900, s: 150, veu: .6, fonte: EA_COND})
function eaNumero(r, S, c, txt, fonteTxt, t0, t1, o = {}) {
  t0 = eaT(c, t0); t1 = eaT(c, t1) ?? 1e9;
  const veu = el(r, 'div', 'position:absolute;inset:0;background:#0b0a09;opacity:0;z-index:3;pointer-events:none;');
  const box = el(r, 'div', `position:absolute;left:0;width:1080px;top:${o.y ?? 900}px;text-align:center;z-index:3;opacity:0;pointer-events:none;`);
  const s = o.s ?? 150, w = eaLarg(txt, s, o.fonte ?? EA_COND, 400);
  el(box, 'div', `font-family:${o.fonte ?? EA_COND};font-size:${s}px;line-height:1.05;color:#f6f4ef;letter-spacing:.01em;text-shadow:0 8px 30px rgba(0,0,0,.55);`, esc(txt));
  const sub = el(box, 'div', `margin:${(s * .08).toFixed(0)}px auto 0;height:${Math.max(5, s * .06).toFixed(1)}px;width:0;background:${EA.verm};`);
  if (fonteTxt) el(box, 'div', `margin-top:${(s * .16).toFixed(0)}px;font-family:${EA_SANS};font-weight:600;font-size:${o.sFonte ?? 32}px;color:rgba(240,238,232,.8);`, esc(fonteTxt));
  cue(c, 'slam', t0 + .02, { g: .16 });
  (S.upd = S.upd || []).push((S_, c_) => {
    const lt = c_.lt, on = lt >= t0 && lt < t1, q = clamp((lt - t0) / .22), qs = clamp((t1 - lt) / .14);
    veu.style.opacity = (on ? (o.veu ?? .6) * Math.min(q * 1.6, 1) * qs : 0).toFixed(3);
    box.style.opacity = (on ? Math.min(q * 4, 1) * qs : 0).toFixed(3);
    box.style.transform = `translateY(-50%) scale(${lerp(1.08, 1, E.out5(q)).toFixed(4)})`;
    sub.style.width = `${(w * E.out(clamp((lt - t0 - .12) / .4))).toFixed(1)}px`;
  });
}
// jornal no modo foco: cada texto da página vira um span; só o que está em foco fica em tinta cheia (o título no plano do título; o
// trecho do plano da câmera; as marcas e o círculo depois que passam), o resto apaga para S.foco.apagado (.3). Na troca de plano o
// texto do plano anterior apaga logo no começo do movimento e o novo acende quando a câmera já quase chegou (a letra não anda acesa).
// ini = quando a câmera assentou na chegada (o 1º foco acende aí; -9 = já aceso no quadro 0, corte casado). A foto da matéria fica
// a meia luz (.5) fora do plano 'foto': um assunto por vez.
function eaJornalFoco(S, papel, focos, ini = -9) {
  const tw = document.createTreeWalker(papel, NodeFilter.SHOW_TEXT), nos = []; let n;
  while ((n = tw.nextNode())) if (n.textContent.trim()) nos.push(n);
  const sp = [];
  nos.forEach(t => {
    const mk = t.parentElement.closest('.eamk');
    if (mk) { if (!sp.includes(mk)) sp.push(mk); return; }
    const s = document.createElement('span'); s.className = 'eafd'; t.parentNode.insertBefore(s, t); s.appendChild(t); sp.push(s);
  });
  const P = focos.map(([t, q, d], i) => {
    const a = q.alvo;
    const set = new Set(a === 'titulo' ? sp.filter(e => e.closest('[data-cab],[data-bloco="titulo"]')) :
      (a === undefined || a === 'foto') ? [] : sp.filter(e => e.classList.contains('eamk') && e.textContent === a));
    return { t0: i ? t - .2 : -9, t1: i ? t - .2 + .7 * (d ?? .8) : ini, set, foto: a === 'foto' };
  });
  return { sp, P, foto: papel.querySelector('[data-foto]') };
}
function eaJornalFocoAplica(S, lt) {
  const J = S.jf, A = S.foco.apagado;
  let i = 0; J.P.forEach((p, k) => { if (lt >= p.t0 - .1) i = k; });     // o texto do plano anterior apaga ANTES do movimento começar
  const p = J.P[i], ant = i ? J.P[i - 1] : null, sai = clamp((lt - p.t0 + .1) / .12), ent = clamp((lt - p.t1) / (i ? .2 : .15));
  const fim = S.jfFim != null ? clamp((lt - S.jfFim) / .12) : 0;
  if (J.foto) { const vf = x => x && x.foto ? 1 : .4; J.foto.style.opacity = lerp(ant ? vf(ant) : vf(p), vf(p), ant ? sai : 1).toFixed(3); }
  J.sp.forEach(e => {
    let v = p.set.has(e) ? lerp(ant && ant.set.has(e) ? 1 : A, 1, ent) : (ant && ant.set.has(e) ? lerp(1, A, sai) : A);
    const tk = J.tinta.get(e);
    if (tk !== undefined && lt >= tk - .04) v = Math.max(v, lerp(A, 1, clamp((lt - tk + .04) / .12)));   // marca/círculo: acendem e ficam
    v = lerp(v, Math.min(v, A), fim);                          // página caindo / saída: tudo vira textura
    e.style.opacity = v.toFixed(3);
  });
}
// eaKf(keys, padrao) -> lt => estado. keys = [[t, {x, y, z, r, ...}, 'curva'], ...]; propriedades ausentes herdam a chave anterior.
// Depois da última chave a câmera segue derivando (z +1,2%/s) até o fim: nada fica parado.
function eaKf(keys, padrao) {
  let prev = { ...padrao };
  const K = keys.map(([t, q, cv]) => { prev = { ...prev, ...q }; return [t, { ...prev }, EA_CURVAS[cv] || EA_ENTRA]; });
  const ks = Object.keys(padrao), tUlt = K[K.length - 1][0];
  return lt => {
    const o = {};
    ks.forEach(k => { o[k] = kf(lt, K.map(([t, q, cv]) => [t, q[k], cv]), EA_ENTRA); });
    if ('z' in o && !padrao._semDeriva) o.z *= 1 + .012 * Math.max(0, lt - tUlt);
    return o;
  };
}

// ---------- rig de câmera do projeto original (v3) ----------
// No .aep cada cena é uma comp 3D com uma câmera de 50 mm (zoom 1500 px) presa numa cadeia de nulls:
//   câmera ← "Camera Controller" (ENTRADA: chega de bem perto em 1,3–2 s com EA_ENTRA + wiggle(1,15)) ← null do meio
//   (deriva em S) ← null de SAÍDA (no último ~1 s, EA_SAI: acelera até o corte, afastando nas cenas da 1ª metade e
//   mergulhando nas da 2ª, com giro de até 15–30°). O corte cai no pico do borrão global (eaPulso), por isso parece contínuo.
// Por cena: rampa: false ou {zIn (quanto mais perto começa, padrão .9 = 1,9×; negativo = começa LONGE e avança, como a cena "07 History"),
//   yIn / xIn (a câmera chega descendo/andando: px de deslocamento no começo), tin, eIn (curva da entrada; padrão EA_ENTRA,
//   EA_RAPIDA = sai rápido do corte e freia devagar, como a câmera da "07 History"), rIn, zOut (fator final da saída: <1 afasta,
//   >1 mergulha), rOut, yOut, tout, wig (amplitude do wiggle em px, padrão 15), deriva (fator)}. window.EA_ENERGIA escala tudo.
function eaRampa(c, cam, o = {}) {
  if (cam._golpe) {
    // motor golpe: chegada, deriva e câmera na mão já vêm do eaGolpes; aqui só a SAÍDA em chicote. O corte pega o chicote logo
    // depois do pico (t = .25 s antes do fim de um chicote de .8 s); normalizado para chegar ao valor cheio no corte.
    const s_ = cam._golpe.sai; if (!s_ || o === false) return cam;
    const En = window.EA_ENERGIA ?? 1, durEf = c.dur + (c._trProx || 0), q0 = EA_GOLPE(s_.t / s_.d);
    const u = (c.lt - (durEf - s_.t)) / s_.d, k = u <= 0 ? 0 : Math.min(1.4, EA_GOLPE(u) / q0) * En * (c._trProx ? .6 : 1);
    if (!k) return cam;
    return { ...cam, z: cam.z * Math.pow(s_.z, k), r: cam.r + s_.r * k, y: cam.y + s_.y * k / Math.max(.4, cam.z) };
  }
  if (o === false) return cam;
  o = o || {};
  const En = window.EA_ENERGIA ?? 1, lt = c.lt, sem = (c.t0 * 3.7) % 50, sg = Math.round(c.t0 * 10) % 2 ? 1 : -1;
  const pos = c.t0 / ((window.TIMING && TIMING.videoDur) || 1), segunda = pos >= .55;
  const tin = o.tin ?? Math.min(1.6, c.dur * .6), ue = (o.eIn || EA_ENTRA)(clamp(lt / tin));
  const durEf = c.dur + (c._trProx || 0), forcaSai = c._trProx ? .5 : 1;      // passagem por matte/wipe: a saída acaba no fim dela
  const tout = Math.min(o.tout ?? 1.1, durEf * .45), us = EA_SAI(clamp((lt - (durEf - tout)) / tout)) * forcaSai;
  const zOut = o.zOut ?? (segunda ? 1.9 : .55), rOut = o.rOut ?? sg * (segunda ? 10 : 14), yOut = o.yOut ?? (segunda ? 0 : 160);
  const wig = (o.wig ?? 15) * En;                                        // wiggle(1,15) no controlador + wiggle(1,15) na câmera
  const wx = aeWiggle(lt, 1, wig, sem) + aeWiggle(lt, 1, wig, sem + 3), wy = aeWiggle(lt, 1, wig, sem + 6) + aeWiggle(lt, 1, wig, sem + 9);
  const wz = aeWiggle(lt, 1, wig, sem + 12) / 1500;                      // 15 px em z numa câmera de 1500 px ≈ 1% de escala
  const dv = (o.deriva ?? 1) * En, deriva = 1 + .04 * dv * (segunda ? lt : -Math.min(lt, 4) * .5);
  const zEntr = 1 + (o.zIn ?? .9) * En * (1 - ue), zSai = Math.pow(zOut, us * En);
  return {
    ...cam,
    z: cam.z * zEntr * zSai * deriva * (1 + wz),
    r: (cam.r || 0) + sg * (o.rIn ?? 5) * En * (1 - ue) + rOut * En * us + aeWiggle(lt, .5, .6 * En, sem + 15),
    x: cam.x + (wx + (o.xIn ?? 0) * En * (1 - ue)) / Math.max(.4, cam.z),
    y: cam.y + (wy + yOut * En * us + (o.yIn ?? 0) * En * (1 - ue)) / Math.max(.4, cam.z),
  };
}
// borrão de cena inteira para as cenas sem camadas (tipografia): mais forte na chegada e na saída
function eaBorraCena(e, c, o = {}) {
  if (o === false || !e) return;
  const En = window.EA_ENERGIA ?? 1, chegada = 1 - E.out5(clamp(c.lt / .32)), saida = c._trProx ? 0 : Math.pow(clamp((c.lt - (c.dur - .2)) / .2), 2);
  const b = (14 * chegada + 18 * saida) * En;
  e.style.filter = b > .5 ? `blur(${b.toFixed(1)}px)` : '';
}

// ---------- borrão de movimento anisotrópico (a referência borra TODO movimento rápido) ----------
let _eaMB = 0;
function eaBorrao(e, S, chave, vx, vy, extra = '') {
  S._mb = S._mb || {};
  if (!S._mb[chave]) {
    const id = 'eamb' + (_eaMB++), s_ = sv(document.body, 'svg', { width: 0, height: 0, style: 'position:absolute' });
    const f = sv(sv(s_, 'defs'), 'filter', { id, x: '-8%', y: '-8%', width: '116%', height: '116%', 'color-interpolation-filters': 'sRGB' });
    S._mb[chave] = { g: sv(f, 'feGaussianBlur', { stdDeviation: '0 0' }), id };
  }
  const k = window.EA_BORRAO ?? .7, sx = Math.min(34, Math.abs(vx) * k), sy = Math.min(34, Math.abs(vy) * k);
  if (sx < .6 && sy < .6) { e.style.filter = extra; return; }
  S._mb[chave].g.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
  e.style.filter = `${extra} url(#${S._mb[chave].id})`.trim();
}

// ---------- texturas procedurais (geradas uma vez por página; o Math.random do kit é semeado: iguais em todos os processos) ----------
const EA_TEX = {};
function eaCanvas(w, h, fn) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d'), w, h); return cv.toDataURL('image/jpeg', .9); }
function eaRuido(x, w, h, amp, a = 1) {
  const im = x.getImageData(0, 0, w, h), d = im.data;
  for (let i = 0; i < d.length; i += 4) { const v = (eaRnd() - .5) * amp; d[i] += v; d[i + 1] += v; d[i + 2] += v; }
  x.putImageData(im, 0, 0);
}
function eaRiscos(x, w, h, n, cor, larg = 1.2) {
  x.strokeStyle = cor;
  for (let i = 0; i < n; i++) {
    x.lineWidth = larg * (.4 + eaRnd()); x.beginPath();
    const x0 = eaRnd() * w, y0 = eaRnd() * h, L = 30 + eaRnd() * 260, a = -1.2 + eaRnd() * .5 + (eaRnd() < .5 ? 0 : Math.PI);
    x.moveTo(x0, y0); x.quadraticCurveTo(x0 + Math.cos(a) * L * .5 + (eaRnd() - .5) * 30, y0 + Math.sin(a) * L * .5, x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); x.stroke();
  }
}
function eaPoeira(x, w, h, n, cor) { x.fillStyle = cor; for (let i = 0; i < n; i++) { const r = eaRnd() < .9 ? .6 + eaRnd() * 1.6 : 2 + eaRnd() * 4; x.globalAlpha = .25 + eaRnd() * .6; x.beginPath(); x.arc(eaRnd() * w, eaRnd() * h, r, 0, 7); x.fill(); } x.globalAlpha = 1; }
// escuro com riscos de película (data digitada, tipografia)
function eaTexEscuro() {
  return EA_TEX.escuro || (EA_TEX.escuro = eaCanvas(1400, 2400, (x, w, h) => {
    const g = x.createRadialGradient(w * .5, h * .42, 80, w * .5, h * .5, h * .75); g.addColorStop(0, '#24272b'); g.addColorStop(1, '#0c0d0f');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(${eaRnd() < .5 ? '255,255,255' : '0,0,0'},${(.004 + eaRnd() * .01).toFixed(3)})`; x.beginPath(); x.ellipse(eaRnd() * w, eaRnd() * h, 80 + eaRnd() * 300, 60 + eaRnd() * 220, eaRnd() * 3, 0, 7); x.fill(); }
    eaRuido(x, w, h, 26); eaRiscos(x, w, h, 70, 'rgba(210,210,210,.16)'); eaPoeira(x, w, h, 420, '#cfcfcf');
  }));
}
// parede verde-escura riscada (fotos na parede, palavras empilhando)
function eaTexParede() {
  return EA_TEX.parede || (EA_TEX.parede = eaCanvas(1400, 2400, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3b4c4d'); g.addColorStop(.55, '#2a3739'); g.addColorStop(1, '#1a2324');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { x.fillStyle = `rgba(${eaRnd() < .5 ? '200,215,210' : '5,10,10'},${(.02 + eaRnd() * .05).toFixed(3)})`; x.fillRect(eaRnd() * w, 0, 2 + eaRnd() * 30, h); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(0,0,0,${(.01 + eaRnd() * .025).toFixed(3)})`; x.beginPath(); x.ellipse(eaRnd() * w, eaRnd() * h, 40 + eaRnd() * 200, 30 + eaRnd() * 260, 0, 0, 7); x.fill(); }
    eaRuido(x, w, h, 30); eaRiscos(x, w, h, 60, 'rgba(220,230,225,.12)'); eaPoeira(x, w, h, 300, '#dfe6e3');
  }));
}
// papel do jornal (amarelado, com fibras)
function eaTexPapel() {
  return EA_TEX.papel || (EA_TEX.papel = eaCanvas(900, 1260, (x, w, h) => {
    x.fillStyle = EA.papel; x.fillRect(0, 0, w, h); eaRuido(x, w, h, 18);
    x.strokeStyle = 'rgba(120,100,70,.06)'; for (let i = 0; i < 500; i++) { x.lineWidth = .6; x.beginPath(); const a = eaRnd() * w, b = eaRnd() * h; x.moveTo(a, b); x.lineTo(a + (eaRnd() - .5) * 18, b + (eaRnd() - .5) * 18); x.stroke(); }
    const g = x.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(110,80,40,.28)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
  }));
}
// malha fina de 6 px (medida na referência: 4 px no 720p, 10–26 níveis de contraste) — tile para background-repeat
function eaMalhaTile() {
  if (EA_TEX.malha) return EA_TEX.malha;
  const cv = document.createElement('canvas'); cv.width = cv.height = 6; const x = cv.getContext('2d');
  x.fillStyle = '#6a6a6a'; x.fillRect(0, 0, 6, 6);                // linhas (mais escuras; média da célula ~ cinza 50%, o overlay não clareia) ...
  x.fillStyle = '#949494'; x.fillRect(1, 1, 4, 4);                // ... e o centro da célula (mais claro)
  x.fillStyle = '#a0a0a0'; x.fillRect(2, 2, 2, 2);
  return (EA_TEX.malha = cv.toDataURL());
}
function eaGraoTile() {
  if (EA_TEX.grao) return EA_TEX.grao;
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'), im = x.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 90; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  x.putImageData(im, 0, 0); return (EA_TEX.grao = cv.toDataURL());
}

// ---------- camadas globais: malha, grão, vinheta por cena; sem legenda corrida (o formato não tem) ----------
// Por cena: S.malha (0..1, padrão .55), S.grao (padrão .07), S.vig (padrão .35), S.cap = {txt fixo} só se precisar.
// Apresentador: malha e grão 0 (fica limpo, regra do Felipe para o apresentador).
// v3: a grade e o ruído são os arquivos do projeto (texturas/ea_grade.png = "Overlay Texture 02" tingida, soft light 70%;
// ea_ruido.png = "Noise.png", soft light 100%). S.malha e S.grao são fatores 0..1 (apresentador: 0).
// Na comp Main do .aep há ainda: um ajuste com Gaussian Blur 0 → 30 → 0 px em CADA corte (±0,167 s) e o brilho com wiggle(5,10).
function eaPulso(t) {
  if (typeof SCENES === 'undefined' || window.EA_PULSO === 0) return 0;
  const P = window.EA_PULSO ?? 30, D = .167; let b = 0;
  for (let k = 1; k < SCENES.length; k++) {
    if (SCENES[k].semPulso) continue;                     // corte casado (jornal 'fixa' no modo foco, pulso: false): sem borrão
    const Sk = SCENES[k].S, kp = Sk && Sk.foco ? (Sk.foco.pulso ?? .5) : 1;   // motor foco: meio borrão (15 px), o assunto continua visível
    const dt = t - SCENES[k].t0;
    if (dt > -D && dt < 0) b = Math.max(b, kp * P * aeEase((dt + D) / D, 1, .333));
    else if (dt >= 0 && dt < D) b = Math.max(b, kp * P * (1 - aeEase(dt / D, .333, 1)));
  }
  return b;
}
renderCaptions = function (t) {
  const S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  let m = $('eamalha');
  const grade = AS('ea_grade'), ruido = AS('ea_ruido');
  if (!m) {
    m = el($('stage'), 'div', `position:absolute;inset:0;z-index:4;pointer-events:none;` + (grade ? `background:url(${grade.src}) 0 0/1080px 1920px;mix-blend-mode:soft-light;`
      : `background:url(${eaMalhaTile()}) 0 0/6px 6px;mix-blend-mode:overlay;`)); m.id = 'eamalha';
  }
  m.style.opacity = ((grade ? .7 : .42) * (S.malha ?? 1)).toFixed(3);
  const gr = $('grain');
  if (gr) {
    if (!gr._ok) { if (ruido) { gr.style.backgroundImage = `url(${ruido.src})`; gr.style.backgroundSize = '1080px 1920px'; gr.style.mixBlendMode = 'soft-light'; }
      else gr.style.backgroundImage = `url(${eaGraoTile()})`; gr._ok = 1; }
    gr.style.opacity = ((ruido ? 1 : .07) * (S.grao ?? 1)).toFixed(3);
    if (ruido) gr.style.backgroundPosition = '0 0';                       // o ruído do projeto é uma imagem parada
  }
  const sc = $('scenes'), bl = eaPulso(t), br = 1 + (window.EA_PISCA ?? .03) * (S.foco ? S.foco.pisca : 1) * aeWiggle(t, 5, 1, 99);
  sc.style.filter = `${bl > .3 ? `blur(${bl.toFixed(1)}px) ` : ''}brightness(${br.toFixed(4)})`;
  const vg = $('vig'); if (vg) vg.style.opacity = (S.vig ?? .35).toFixed(3);
  const box = $('cap'); box.style.opacity = 0;
  let po = $('eapo');
  if (!po) { po = el($('stage'), 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;z-index:4;pointer-events:none;mix-blend-mode:screen;'); po.id = 'eapo'; po.width = 540; po.height = 960; }
  const op = (S.poeira ?? .55) * (window.EA_POEIRA ?? .6), x = po.getContext('2d');
  x.clearRect(0, 0, 540, 960);
  if (op > 0) {
    for (let i = 0; i < 70; i++) {
      const vx = (hrand(i * 1.7) - .5) * 26, vy = -6 - hrand(i * 2.3) * 22, ph = hrand(i * 3.1) * 6.28;
      const px = ((hrand(i) * 540 + t * vx) % 540 + 540) % 540, py = ((hrand(i + .5) * 960 + t * vy) % 960 + 960) % 960;
      const rr = .6 + hrand(i * 4.7) * (i % 9 === 0 ? 5 : 1.6), a = op * (.25 + .55 * (.5 + .5 * Math.sin(t * (1.5 + hrand(i) * 3) + ph)));
      const g = x.createRadialGradient(px, py, 0, px, py, rr * 2.2); g.addColorStop(0, `rgba(255,244,225,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(255,244,225,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, rr * 2.2, 0, 6.29); x.fill();
    }
  }
};

// ---------- passagens próprias (envolvem o render do motor; o trgl.js envolve depois) ----------
// 'ea:sobe': o plano novo sobe de baixo como um cartão de canto arredondado e empurra o anterior (0,26 s, desacelera forte)
// 'ea:desce': o contrário. O som (swish) vem da trilha_earn.py, que lê os cortes.
// v3: 'ea:matte:<nome>' usa as mattes do projeto (texturas/mattes: center, center_liquid, ink_lr, ink_spot, ink_ud_digonal, round,
// three_liquid, up_1, up_2) como máscara da cena nova; 'ea:wipe' = Linear Wipe do AE (borda suave, EA_SUAVE, de baixo para cima,
// ou trAng). trDur escolhe a duração (padrão: a da matte). A cena velha segue viva por baixo até o fim.
const EA_MATTES = window.EA_MATTES || {};
// o Chromium só pinta um elemento com mask-image depois de carregar a máscara: as mattes ficam "aquecidas" em elementos de 2 px desde a abertura
let _eaMtOk = false;
function eaAqueceMattes() {
  if (_eaMtOk || typeof ASSETS === 'undefined') return; _eaMtOk = true;
  const box_ = el($('stage'), 'div', 'position:absolute;left:0;top:0;width:2px;height:2px;overflow:hidden;opacity:.01;z-index:0;pointer-events:none;');
  Object.values(EA_MATTES).forEach(m => (m.q || []).forEach(u => el(box_, 'div', `position:absolute;inset:0;background:#fff;-webkit-mask-image:url(${u});-webkit-mask-size:100% 100%;`)));
}
const eaQuadro = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
async function eaRodaCena(x, t) {                           // roda uma cena fora da janela do motor (como o run() do engine)
  const c = x.ctx; c.lt = t - x.t0; c.t = t; c.frame = Math.round(t * FPS);
  x.update(x.S, c);
  for (const ph of x.S.photos) await updatePhoto(ph, c.frame, ph.zoomFn ? ph.zoomFn(c.lt, c) : 1);
  for (const fn of (x.S.async || [])) await fn(c.lt, c);
}
function eaDurTr(s) {
  const tr = s.tr || '';
  if (tr.startsWith('ea:matte:')) { const m = EA_MATTES[tr.slice(9)]; return s.trDur ?? (m ? m.dur : .5); }
  if (tr === 'ea:wipe') return s.trDur ?? .55;
  return 0;
}
(() => {
  const orig = window.render;
  window.render = async function (t) {
    eaAqueceMattes();
    if (!window._eaProx && typeof SCENES !== 'undefined') { window._eaProx = 1; for (let j = 1; j < SCENES.length; j++) SCENES[j - 1].ctx._trProx = eaDurTr(SCENES[j]); }
    const k = await orig(t);
    const s = SCENES[k], prev = k > 0 ? SCENES[k - 1] : null, lt = t - s.t0;
    const tr = s.tr || '', em = prev && lt < TR && (tr === 'ea:sobe' || tr === 'ea:desce');
    s.root.style.borderRadius = '';
    s.root.style.webkitMaskImage = s.root.style.maskImage = '';
    const dTr = eaDurTr(s);
    if (prev && dTr > 0 && lt < dTr) {
      prev.root.style.display = 'block'; prev.root.style.zIndex = 1; s.root.style.zIndex = 2;
      prev.root.style.transform = ''; prev.root.style.opacity = 1; prev.root.style.filter = '';
      if (lt >= TR) await eaRodaCena(prev, t);
      s.root.style.transform = ''; s.root.style.opacity = 1; s.root.style.filter = '';
      const u = clamp(lt / dTr);
      if (tr.startsWith('ea:matte:')) {
        const nm = tr.slice(9), m = EA_MATTES[nm], n = m ? m.n : 1, fr = Math.min(n - 1, Math.floor(u * n));
        const q = m && m.q ? m.q[fr] : null;
        if (q) { s.root.style.webkitMaskImage = s.root.style.maskImage = `url(${q})`; s.root.style.webkitMaskSize = s.root.style.maskSize = '100% 100%'; await eaQuadro(); }
      } else {
        const q = EA_SUAVE(u), ang = s.trAng ?? 0, pena = 220, pos = lerp(0, 100 + pena / 19.2, q);   // % do caminho, borda de 220 px (11,5%)
        const g = `linear-gradient(${ang}deg, #000 ${(pos - pena / 19.2).toFixed(2)}%, rgba(0,0,0,0) ${pos.toFixed(2)}%)`;
        s.root.style.webkitMaskImage = s.root.style.maskImage = g;
      }
    } else if (prev && dTr > 0 && lt >= dTr) {
      prev.root.style.display = 'none';
    }
    if (em) {
      const q = E.out5(clamp(lt / TR)), sgn = tr === 'ea:sobe' ? 1 : -1, b = Math.sin(Math.PI * clamp(lt / TR)) * 7;
      s.root.style.transform = `translateY(${(sgn * (1 - q) * H).toFixed(1)}px)`;
      const rr = (44 * (1 - q)).toFixed(1);
      s.root.style.borderRadius = sgn > 0 ? `${rr}px ${rr}px 0 0` : `0 0 ${rr}px ${rr}px`;
      s.root.style.filter = b > .5 ? `blur(${b.toFixed(1)}px)` : '';
      prev.root.style.transform = `translateY(${(-sgn * q * H * .2).toFixed(1)}px)`;
      prev.root.style.filter = b > .5 ? `blur(${(b * .8).toFixed(1)}px)` : '';
      prev.root.style.opacity = 1;
    }
    return k;
  };
})();

// ---------- palco em camadas (mundo) ----------
// Coordenadas do MUNDO = tela 1080x1920 com a câmera em z=1 olhando (540, 960). Cada camada tem profundidade p
// (1 = plano de referência, >1 mais perto: anda mais; <1 mais longe). A câmera é {x, y, z, r}.
function eaPalco(r, S, o = {}) {
  const grade = el(r, 'div', `position:absolute;inset:0;overflow:hidden;background:${o.fundoCor ?? '#0b0b0b'};`);
  const pal = { el: grade, camadas: [], cam: { x: 540, y: 960, z: 1, r: 0 } };
  S.pal = pal; S._cor = eaCor(o.cor);
  grade.style.filter = S._cor;
  return pal;
}
// ---------- trecho de vídeo REAL: sempre rodando normal (03/11/2026) ----------
// Pedido do Felipe: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal". O clipe anda SEMPRE a 30 q/s (rate < 1 vira
// 1: câmera lenta por quadro repetido não; posterize da cena não chega no quadro do clipe), NUNCA fica preso no último quadro (clipe
// mais curto que o tempo na tela começa mais cedo para acabar junto com ela; se nem assim couber, volta ao início e avisa no console:
// troque o assunto antes ou use outro trecho) e nunca espera parado para começar (roda desde que aparece). Quando o clipe cabe, o quadro
// é exatamente o de antes. Régua: <kit>/ferramentas/clipe_parado.py <proj> (0 TRAVADO, 0 LENTO).
// fim do tempo em que a cena fica na tela (o fim dela + a passagem da cena seguinte, em que ela continua visível por baixo)
function eaCenaFim(c) {
  const k = typeof SCENES !== 'undefined' ? SCENES.findIndex(s => s.ctx === c) : -1, nx = k >= 0 ? SCENES[k + 1] : null;
  if (!nx) return c.dur;
  const tr = nx.tr || 'slideL', d = eaDurTr(nx);
  return c.dur + (tr === 'cut' || tr === 'match' ? 0 : d > 0 ? d : tr.startsWith('gl:') ? (nx.trDur ?? .5) : TR);
}
// quadro (0..n-1) do clipe no tempo lt: o = {de (s, quadro inicial), rate (≥ 1), tS (quando começa a rodar), fim (quando sai da tela), nome}
const _eaClipAviso = {};
function eaClipQuadro(n, lt, o) {
  const r = Math.max(1, o.rate ?? 1), tS = o.tS ?? 0, de = (o.de ?? 0) * 30, prec = Math.max(0, (o.fim ?? 0) - tS) * 30 * r;
  if ((o.rate ?? 1) < 1 && !_eaClipAviso['r' + o.nome]) { _eaClipAviso['r' + o.nome] = 1; console.warn(`edit-earn: clipe ${o.nome} com rate ${o.rate} < 1 roda a 1 (vídeo real nunca em câmera lenta)`); }
  const f0 = de + prec > n - 1 ? Math.max(0, n - 1 - prec) : de;   // curto: começa mais cedo e acaba junto com a tela
  let f = Math.round(f0 + Math.max(0, lt - tS) * 30 * r);
  if (f > n - 1) {                                                   // nem assim cabe: volta ao início (nunca preso no último quadro)
    if (!_eaClipAviso['c' + o.nome]) { _eaClipAviso['c' + o.nome] = 1; console.warn(`edit-earn: clipe ${o.nome} (${n} quadros) é mais curto que o tempo na tela (${Math.ceil(prec)} quadros): troque o assunto antes ou use outro trecho`); }
    f %= n;
  }
  return Math.max(0, f);
}
// camada: imagem (asset), recorte, trecho de vídeo ('clip:nome') ou um elemento qualquer (op.el)
// op: {x, y (centro no mundo), w | h (tamanho), cobre: true (cobre a tela inteira, fundo), p, fx, fy, rot, opacidade, sombra, foco,
//      clipe: from (s do 1º quadro), rate (≥ 1), t0 (quando começa a rodar; nunca depois de a camada aparecer)}
function eaCamada(pal, S, fonte, op = {}) {
  const L = el(pal.el, 'div', 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;');
  const lay = { L, p: op.p ?? 1, op, x: op.x ?? 540, y: op.y ?? 960, rot: op.rot ?? 0 };
  let w, h, inner;
  if (op.el) { inner = op.el; L.appendChild(inner); w = op.w ?? 1080; h = op.h ?? 1920; }
  else {
    const ehClip = typeof fonte === 'string' && fonte.startsWith('clip:');
    let iw = 1080, ih = 1920;
    if (!ehClip) { const a = eaAsset(fonte); iw = a.w; ih = a.h; }
    else { const nome = fonte.slice(5); iw = op.iw ?? 1080; ih = op.ih ?? 1920; lay.clip = nome; lay.n = (window.CLIPN && CLIPN[nome]) ?? 60; }
    if (op.cobre) { const k = Math.max(1080 / iw, 1920 / ih) * (op.folga ?? 1.18); w = iw * k; h = ih * k; }
    else if (op.w) { w = op.w; h = op.w * ih / iw; } else { h = op.h ?? 1200; w = h * iw / ih; }
    if (op.cobre && op.repete !== false) {
      // CC RepeTile do projeto ("Unfold"): a foto de fundo ganha cópias espelhadas em volta, então a câmera pode afastar
      // e girar na saída sem mostrar borda. inner vira um quadro com 3×3 imagens; lay.imgs guarda todas (trecho de vídeo).
      inner = el(L, 'div', `position:absolute;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;`);
      lay.imgs = [];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const im = el(inner, 'img', `position:absolute;left:${(dx * w).toFixed(1)}px;top:${(dy * h).toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;` +
          `transform:scale(${dx ? -1 : 1},${dy ? -1 : 1});`);
        im.decoding = 'sync';
        im.src = ehClip ? `clips/${lay.clip}/0001.jpg` : eaAsset(fonte).src;
        if (dx === 0 && dy === 0) lay.img0 = im; lay.imgs.push(im);
      }
      if (ehClip) { lay.cur = 0; lay.t0 = op.t0 ?? 0; }
    } else {
      inner = el(L, 'img', `position:absolute;display:block;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;` +
        (op.sombra ? `filter:drop-shadow(0 ${(h * .02).toFixed(0)}px ${(h * .025).toFixed(0)}px rgba(0,0,0,.55));` : ''));
      inner.decoding = 'sync';
      if (!ehClip) inner.src = eaAsset(fonte).src;
      else { inner.src = `clips/${lay.clip}/0001.jpg`; lay.cur = 0; lay.t0 = op.t0 ?? 0; }
    }
  }
  inner.style.left = `${(lay.x - w * (op.fx ?? .5)).toFixed(1)}px`; inner.style.top = `${(lay.y - h * (op.fy ?? .5)).toFixed(1)}px`;
  inner.style.position = 'absolute';
  lay.inner = inner; lay.w = w; lay.h = h;
  lay.cx = lay.x; lay.cy = lay.y;
  pal.camadas.push(lay);
  if (lay.clip) (S.async = S.async || []).push(async (lt, c) => {
    if (L.style.display === 'none') return;
    // vídeo real sempre rodando: começa a rodar quando a camada aparece (se o t0 for depois) e cabe no tempo em que ela fica na tela
    const tVis = Math.max(0, op.entra ? (op.entra._t ?? 0) : 0), tS = Math.min(lay.t0, tVis);
    const fim = Math.min(op._ate ?? 1e9, op.sai && op.sai._t !== undefined ? op.sai._t + (op.sai.d ?? .55) : 1e9, c ? eaCenaFim(c) : 1e9);
    const f = eaClipQuadro(lay.n, lt, { de: op.from, rate: op.rate, tS, fim: Math.min(fim, tS + 600), nome: lay.clip });
    if (f !== lay.cur) {
      const src = `clips/${lay.clip}/${String(f + 1).padStart(4, '0')}.jpg`;
      if (lay.imgs) { lay.imgs.forEach(im => { im.src = src; }); try { await lay.img0.decode(); } catch (e) { } }
      else { inner.src = src; try { await inner.decode(); } catch (e) { } }
      lay.cur = f;
    }
  });
  return lay;
}
// entradas de camada (medidas): 'camera' = começa ~2,7x, borrada, vinda de baixo, assenta em ~0,5 s; 'baixo'/'cima'/'esq'/'dir' =
// desliza de fora com borrão; 'foco' = só aparece desfocando; 'pop' = cresce do zero com mola
// v3: no projeto os objetos entram de fora com giro de ±20–50° em 1,3–1,9 s com EA_ENTRA (telefone, papel, carimbo, câmera,
// livro, matéria; fotos da história dos 4 cantos; tampa do caixão de lado; caixão de baixo). 'camera' fica mais curta (0,9 s).
// entra.curva ('mola', 'golpe', 'entra'...) troca a curva. Nas cenas com golpes, esq/dir/cima/baixo/canto entram com 'mola' (d .6),
// menos as camadas atras (objetos que sobem por trás da cabeça: o tempo delas foi calibrado com EA_ENTRA).
// 'pousa' (motor foco): aparece NO LUGAR, de 1,08 (s0) para 1 em .22 s, com 4 px de desfoque só nos primeiros quadros
function eaEntrada(lay, lt) {
  const e = lay.op.entra; if (!e) return { s: 1, x: 0, y: 0, b: 0, o: 1, r: 0 };
  const t = e._t ?? 0, d = e.d ?? (e.k === 'camera' ? .9 : e.k === 'pop' ? .45 : e.k === 'foco' ? .6 : e.k === 'pousa' ? .22 : 1.3);
  if (lt < t) return { s: 1, x: 0, y: 0, b: 0, o: 0, r: 0 };
  const u = clamp((lt - t) / d), q = e.curva ? (EA_CURVAS[e.curva] || EA_ENTRA)(u) : e.k === 'pop' ? E.out5(u) : e.k === 'camera' ? aeEase(u, .12, 1) : EA_ENTRA(u);
  if (e.k === 'pousa') { const p = E.out5(u); return { s: lerp(e.s0 ?? 1.08, 1, p), x: 0, y: 0, b: (1 - clamp(u * 2.5)) * 4, o: clamp(u * 5), r: (e.r0 ?? 0) * (1 - p) }; }
  if (e.k === 'camera') return { s: lerp(e.s0 ?? 2.7, 1, q), x: (e.dx ?? 0) * (1 - q), y: (e.dy ?? 520) * (1 - q), b: (1 - q) * 14 + Math.sin(Math.PI * clamp((lt - t - d * .8) / .32)) * 6 * (u >= .8 ? 1 : 0), o: clamp(u * 6), r: (e.r0 ?? 0) * (1 - q) };
  if (e.k === 'pop') return { s: lerp(0, 1, E.back(u)), x: 0, y: 0, b: 0, o: clamp(u * 4), r: 0 };
  if (e.k === 'foco') return { s: lerp(1.08, 1, q), x: 0, y: 0, b: (1 - q) * 18, o: clamp(u * 2.5), r: 0 };
  if (e.k === 'canto') return { s: lerp(e.s0 ?? 1.35, 1, q), x: (e.dx ?? 0) * (1 - q), y: (e.dy ?? 0) * (1 - q), b: (1 - q) * 20, o: 1, r: (e.r0 ?? 0) * (1 - q) };
  const dist = e.dist ?? 1500, dir = { baixo: [0, 1], cima: [0, -1], esq: [-1, 0], dir: [1, 0] }[e.k] || [0, 1];
  const r0 = e.r0 ?? (dir[0] !== 0 ? dir[0] * 22 : 18 * (hrand(lay.x * .01) > .5 ? 1 : -1));
  return { s: lerp(e.s0 ?? 1.05, 1, q), x: dir[0] * dist * (1 - q), y: dir[1] * dist * (1 - q), b: (1 - q) * 18, o: 1, r: r0 * (1 - q) };
}
// 'some' (motor foco): some no lugar em .2 s (opacidade, 4% menor, 4 px de desfoque), sem atravessar a tela
// 'afunda' (motor foco, página do jornal): a página assenta na mesa e some no lugar (14% menor, gira 4°, .4 s), em vez de cair da tela
function eaSaida(lay, lt) {
  const e = lay.op.sai; if (!e || lt < (e._t ?? 1e9)) return { x: 0, y: 0, s: 1, r: 0, b: 0 };
  if (e.k === 'some') { const u = clamp((lt - e._t) / (e.d ?? .2)); return { x: 0, y: 0, s: 1 - .04 * u, r: 0, b: 4 * u, o: 1 - E.inOut(u) }; }
  if (e.k === 'afunda') { const u = clamp((lt - e._t) / (e.d ?? .4)), q = E.inOut(u); return { x: 0, y: 0, s: 1 - .14 * q, r: (e.r ?? 4) * q, b: 6 * q, o: 1 - clamp((u - .35) / .65) }; }
  const u = clamp((lt - e._t) / (e.d ?? .55)), q = EA_SAI(u);
  const dir = { baixo: [0, 1], cima: [0, -1], esq: [-1, 0], dir: [1, 0] }[e.k] || [0, -1];
  return { x: dir[0] * (e.dist ?? 1800) * q, y: dir[1] * (e.dist ?? 1800) * q, s: 1 + (e.ds ?? 0) * q, r: (e.r ?? 0) * q, b: q * 16 };
}
// vida de cada camada = os wiggles do projeto. op.vida: false (parada), 'gente' (wiggle(3,10) no Y: pessoas do grupo),
// 'palavra' (wiggle(3,25) no Y), 'frente' (wiggle(2,15): primeiro plano), número (fator) ou padrão = objeto solto
// (wiggle(.5,15) na posição + wiggle(1,3) no giro, como as fotos da história)
function eaVida(lay, lt, i) {
  const v = lay.op.vida; if (v === false) return { x: 0, y: 0, r: 0 };
  const sem = i * 2.9 + (lay.x || 0) * .013;
  if (v === 'gente') return { x: 0, y: aeWiggle(lt, 3, 10, sem), r: 0 };
  if (v === 'palavra') return { x: 0, y: aeWiggle(lt, 3, 25, sem), r: 0 };
  if (v === 'frente') return { x: aeWiggle(lt, 2, 15, sem), y: aeWiggle(lt, 2, 15, sem + 1), r: 0 };
  const k = typeof v === 'number' ? v / 1.6 : 1;
  return { x: aeWiggle(lt, .5, 15 * k, sem), y: aeWiggle(lt, .5, 15 * k, sem + 1), r: aeWiggle(lt, 1, 3 * k, sem + 2) / .3 };
}
// aplica a câmera + entrada/saída + foco + borrão em todas as camadas (chame no update)
// motor foco: S.foco.vida escala o wiggle das camadas (.25), S.foco.vida3d o "respirar" (.5); op.apaga = {t, a, d, foco} escurece e
// desfoca a camada no lugar (o assunto anterior quando o próximo pousa)
function eaAplica(pal, S, c, cam) {
  (S.pre || []).forEach(f => f(S, c));        // vida na foto parada: posições das camadas que andam (vdMove), antes de aplicar o quadro
  const lt = c.lt, ant = pal._ant || cam, vk = S.foco ? S.foco.vida : 1;
  pal.camadas.forEach((lay, i) => {
    if (lay.op.ate !== undefined && lt >= lay.op._ate) { lay.L.style.display = 'none'; return; }
    lay.L.style.display = '';
    const p = lay.p, zl = Math.pow(cam.z, p), xl = 540 + (cam.x - 540) * p, yl = 960 + (cam.y - 960) * p;
    const en = eaEntrada(lay, lt), sa = eaSaida(lay, lt), vida = eaVida(lay, lt, i);
    const ap = lay.op._apaga, qa = ap ? E.inOut(clamp((lt - ap.t) / ap.d)) : 0;
    const ox = en.x + sa.x + vida.x * vk, oy = en.y + sa.y + vida.y * vk, s = en.s * sa.s * (lay.op.escala ? lay.op.escala(lt) : 1);
    const rr = (lay.rot + en.r + sa.r + vida.r * .3 * vk);
    // a camada gira/escala em volta do próprio centro (cx, cy) no mundo
    lay.L.style.transform = `translate(540px,960px) rotate(${cam.r.toFixed(3)}deg) scale(${zl.toFixed(5)}) translate(${(-xl).toFixed(2)}px,${(-yl).toFixed(2)}px) ` +
      `translate(${(lay.cx + ox).toFixed(2)}px,${(lay.cy + oy).toFixed(2)}px) rotate(${rr.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-lay.cx).toFixed(2)}px,${(-lay.cy).toFixed(2)}px)`;
    lay.L.style.opacity = (en.o * (sa.o ?? 1) * (lay.op.opacidade ? lay.op.opacidade(lt) : 1) * (qa ? lerp(1, ap.a, qa) : 1)).toFixed(3);
    // foco (profundidade de campo) e borrão de movimento da camada
    const foco = (lay.op.foco ? kf(lt, lay.op._foco, E.inOut) : 0) + (qa ? ap.foco * qa : 0);
    const bl = Math.max(0, foco + en.b + sa.b) / Math.max(.3, zl * s);
    const extra = [lay.op.base || '', bl > .4 ? `blur(${bl.toFixed(1)}px)` : '', lay.op.filtro ? lay.op.filtro(lt) : ''].join(' ').trim();
    if (!lay._prev) lay._prev = { X: 0, Y: 0 };
    const X = (lay.cx + ox - xl) * zl * s, Y = (lay.cy + oy - yl) * zl * s;
    const vx = X - lay._prev.X, vy = Y - lay._prev.Y, vz = (zl * s - (lay._prev.z ?? zl * s)) * 700;
    lay._prev = { X, Y, z: zl * s };
    if (lay.op.borrao === false || Math.abs(c.lt - (lay._lt ?? -9) - 1 / 30) > .02) { lay.inner.style.filter = extra; }
    else {
      let bx = (vx + vz * .3) / Math.max(.3, zl * s), by = (vy + vz * .5) / Math.max(.3, zl * s);
      if (cam._golpe) {     // motor golpe: borrão só no pico do chicote (acima de ~10 px/quadro); a deriva e o texto lido ficam nítidos
        const lim = window.EA_LIMIAR ?? 10, ex = v => Math.sign(v) * Math.max(0, Math.abs(v) - lim) * .6;
        bx = ex(bx); by = ex(by);
      }
      eaBorrao(lay.inner, S, 'c' + i, bx, by, extra);
    }
    lay._lt = c.lt;
    if (lay.op.vida3d) {      // o recorte "respira" e gira de leve em 3D (os personagens da referência nunca ficam parados)
      const a = (lay.op.vida3d === true ? 1 : lay.op.vida3d) * (S.foco ? S.foco.vida3d : 1), f = i * 1.37;
      lay.inner.style.transformOrigin = '50% 70%';
      lay.inner.style.transform = `perspective(1600px) rotateY(${(4 * a * Math.sin(lt * .85 + f)).toFixed(2)}deg) rotateX(${(1.8 * a * Math.sin(lt * 1.15 + f)).toFixed(2)}deg) ` +
        `scale(${(1 + .02 * a * Math.sin(lt * 1.7 + f)).toFixed(4)},${(1 + .028 * a * Math.sin(lt * 1.7 + f)).toFixed(4)})`;
    }
  });
  pal._ant = cam;
}

// ---------- flash + onda + posterize (presets "Flash" e "Wave V2" do JerryFlow e o Posterize Time do projeto) ----------
// flash: sólido branco em modo OVERLAY, 100% → 0 em 5 quadros (linear). onda (0,467 s): Turbulent Displace 36 → 0 px (tamanho
// 104 → 382), Motion Tile sacudindo na vertical (+3,25% → +1,5% → +0,5% → 0 da altura em 0 / 0,1 / 0,233 / 0,467 s) e
// Directional Blur 55 → 0 em 0,233 s. O projeto usa os dois juntos nas viradas DENTRO da cena ("died", o jornal trocando,
// a entrevista começando, a lâmpada acendendo). posterize: 16 = a cena anda a 16 q/s (TV e "história" no projeto).
let _eaOnda = 0;
function eaFlashOnda(r, S, c, o) {
  const fl = o.flash ? [].concat(eaT(c, o.flash)) : [], on = o.onda ? [].concat(eaT(c, o.onda)) : [];
  if (!fl.length && !on.length) return;
  const fe = el(r, 'div', 'position:absolute;inset:0;background:#fff;mix-blend-mode:overlay;opacity:0;z-index:6;pointer-events:none;');
  let filtro = null;
  if (on.length) {
    const id = 'eaonda' + (_eaOnda++), s_ = sv(document.body, 'svg', { width: 0, height: 0, style: 'position:absolute' });
    const f = sv(sv(s_, 'defs'), 'filter', { id, x: '-6%', y: '-6%', width: '112%', height: '112%', 'color-interpolation-filters': 'sRGB' });
    const tu = sv(f, 'feTurbulence', { type: 'turbulence', baseFrequency: '.008', numOctaves: 2, seed: 7, result: 'n' });
    const dm = sv(f, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' });
    const gb = sv(f, 'feGaussianBlur', { in: 'd', stdDeviation: '0 0' });
    filtro = { id, tu, dm, gb };
  }
  on.forEach(t => EVENTS.push({ t: +(c.t0 + t).toFixed(3), type: 'eaOnda' }));
  fl.forEach(t => { if (!on.some(u => Math.abs(u - t) < .05)) EVENTS.push({ t: +(c.t0 + t).toFixed(3), type: 'eaFlash' }); });
  (S.upd = S.upd || []).push((S_, c_) => {
    const lt = c_.lt;
    let a = 0; fl.forEach(t => { if (lt >= t && lt < t + .167) a = Math.max(a, 1 - (lt - t) / .167); });
    fe.style.opacity = a.toFixed(3);
    if (!filtro) return;
    const ativo = on.map(t => lt - t).find(d => d >= 0 && d < .467);
    const alvo = S_.pal ? S_.pal.el : r;
    S_._ondaY = 0; S_._ondaF = '';
    if (ativo === undefined) return;
    const u = ativo / .467, q = aeEase(u, .01, .5);
    filtro.dm.setAttribute('scale', (36 * 1.6 * (1 - q)).toFixed(2));
    filtro.tu.setAttribute('baseFrequency', (1 / (lerp(104, 382, q) * 1.15)).toFixed(5));
    const db = Math.max(0, 55 * (1 - ativo / .233)) / 3;
    filtro.gb.setAttribute('stdDeviation', `0 ${db.toFixed(2)}`);
    S_._ondaY = 1920 * kf(ativo, [[0, .0325], [.1, .015], [.233, .005], [.467, 0]], E.lin);
    S_._ondaF = `url(#${filtro.id})`;
  });
}
// aplica a onda (deslocamento + filtro) no palco depois do eaAplica
function eaOndaAplica(S, el_) {
  if (S._ondaF === undefined) return;
  // o Motion Tile do projeto espelha as bordas; aqui o palco (overflow:hidden) cresce o bastante para a sacudida não abrir faixa
  el_.style.transform = S._ondaY ? `translateY(${S._ondaY.toFixed(1)}px) scale(${(1 + Math.abs(S._ondaY) / 940).toFixed(4)})` : '';
  const base = el_._filtroBase ?? el_.style.filter.replace(/\s*url\(#eaonda\d+\)/g, '');
  el_.style.filter = S._ondaF ? `${base} ${S._ondaF}`.trim() : base;
}
const eaPoster = (c, fps) => fps ? { ...c, lt: Math.floor(c.lt * fps + 1e-6) / fps } : c;

// ---------- etiqueta vermelha com o nome (presa a uma camada) ----------
// A barra vermelha nasce fina, abre para a largura do nome e o texto entra deslizando (0,45 s no total). Fica inclinada ~2°.
// o.desliza = fração da largura que o nome desliza ao entrar (.9; no motor foco .12: o nome já nasce quase no lugar)
function eaEtiqueta(lay, S, c, o) {
  const s = o.s ?? 46, txt = o.txt, w = eaLarg(txt, s, EA_SANS, 600) + s * 1.1, h = s * 1.62;
  const box_ = el(lay.L, 'div', `position:absolute;left:${(lay.cx + (o.dx ?? 0) - w / 2).toFixed(1)}px;top:${(lay.cy + (o.dy ?? 0) - h / 2).toFixed(1)}px;` +
    `width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;transform-origin:0 50%;`);
  const barra = el(box_, 'div', `position:absolute;left:0;top:0;height:100%;width:0;background:${o.cor ?? EA.verm};border-radius:${(s * .16).toFixed(1)}px;` +
    `box-shadow:0 ${(s * .18).toFixed(0)}px ${(s * .4).toFixed(0)}px rgba(0,0,0,.35);overflow:hidden;`);
  const tx_ = el(barra, 'div', `position:absolute;left:${(s * .55).toFixed(1)}px;top:50%;transform:translateY(-52%);white-space:nowrap;font-family:${EA_SANS};font-weight:600;` +
    `font-size:${s}px;color:#fff;letter-spacing:-.01em;`, esc(txt));
  const t0 = eaT(c, o.t) ?? 0;
  cue(c, 'pop', t0, { g: .14 }); cue(c, 'whoosh', t0 + .1, { g: .16, d: .25 });
  (S.upd = S.upd || []).push((S_, c_) => {
    const lt = c_.lt, u1 = clamp((lt - t0) / .09), u2 = E.out5(clamp((lt - t0 - .07) / .24)), u3 = E.out5(clamp((lt - t0 - .16) / .26));
    barra.style.width = `${(lt < t0 ? 0 : Math.max(8 * u1, w * u2)).toFixed(1)}px`;
    box_.style.opacity = lt < t0 ? 0 : 1;
    box_.style.transform = `rotate(${(o.rot ?? -2).toFixed(1)}deg) skewX(${(o.skew ?? -2).toFixed(1)}deg)`;
    tx_.style.transform = `translate(${(-w * (o.desliza ?? .9) * (1 - u3)).toFixed(1)}px,-52%)`;
    tx_.style.filter = u3 < .98 ? `blur(${(4 * (1 - u3)).toFixed(1)}px)` : '';
  });
  return box_;
}

// ---------- máscara de pincel: a camada aparece por um círculo de borda rasgada que cresce ----------
function eaPincel(lay, t0, d, wx, wy) {
  const N = 72, sem = Array.from({ length: N }, (_, i) => hrand(i * 3.7 + wx * .01));
  const cx = wx - (parseFloat(lay.inner.style.left) || 0), cy = wy - (parseFloat(lay.inner.style.top) || 0);   // mundo -> local da imagem
  return lt => {
    const u = clamp((lt - t0) / d);
    if (u >= 1) { lay.inner.style.clipPath = ''; return; }
    const R = 2300 * E.inOut(u) / Math.max(.3, (lay._prev && lay._prev.z) || 1) + 1;   // raio na TELA: com a câmera afastando ainda cobre os cantos
    const pts = sem.map((v, i) => { const a = i / N * Math.PI * 2, rr = R * (1 + (v - .5) * .14 + Math.sin(a * 7 + v) * .03); return `${(cx + Math.cos(a) * rr).toFixed(1)}px ${(cy + Math.sin(a) * rr).toFixed(1)}px`; });
    lay.inner.style.clipPath = lt < t0 ? 'polygon(0 0,0 0,0 0)' : `polygon(${pts.join(',')})`;
  };
}

// ---------- fechadura: a cena vista pelo buraco (borda iluminada); a câmera recua e a fechadura aparece ----------
function eaFechadura(r, S, o = {}) {
  const sv_ = svgAbs(r, 0, 0, W, H, 'z-index:3;pointer-events:none;');
  const id = 'eafh' + Math.round(Math.random() * 1e6);
  const m = sv(sv(sv_, 'defs'), 'mask', { id });
  sv(m, 'rect', { x: -2000, y: -2000, width: 5080, height: 5920, fill: '#fff' });
  const furo = sv(m, 'path', { fill: '#000' });
  const gid = id + 'g', gr = sv(sv_.querySelector('defs'), 'radialGradient', { id: gid, cx: '50%', cy: '42%', r: '65%' });
  sv(gr, 'stop', { offset: '0%', 'stop-color': '#2a1a14' }); sv(gr, 'stop', { offset: '100%', 'stop-color': '#070505' });
  const escuro = sv(sv_, 'rect', { x: -2000, y: -2000, width: 5080, height: 5920, fill: `url(#${gid})`, mask: `url(#${id})` });
  const sombra = sv(sv_, 'path', { fill: 'none', stroke: 'rgba(0,0,0,.75)', 'stroke-width': 46, style: 'filter:blur(14px)' });
  const aro = sv(sv_, 'path', { fill: 'none', stroke: 'rgba(255,205,160,.95)', 'stroke-width': 10, style: 'filter:blur(4px)' });
  const forma = (cx, cy, k) => { const R = 300 * k, wB = 230 * k, hB = 760 * k;
    return `M ${cx - R * .62} ${cy + R * .78} A ${R} ${R} 0 1 1 ${cx + R * .62} ${cy + R * .78} L ${cx + wB} ${cy + hB} L ${cx - wB} ${cy + hB} Z`; };
  const t0 = o.t ?? 0;
  (S.upd = S.upd || []).push((S_, c) => {
    const u = EA_ARRANQUE(clamp((c.lt - t0) / (o.d ?? .55)));
    const k = c.lt < t0 ? 9 : lerp(o.k0 ?? 6.5, o.k ?? 1, u) * (1 + .02 * Math.max(0, c.lt - t0 - .6));
    const cx = o.cx ?? 540, cy = (o.cy ?? 720);
    const d = forma(cx, cy, k); furo.setAttribute('d', d); aro.setAttribute('d', d); sombra.setAttribute('d', d);
    sv_.style.opacity = c.lt < t0 ? 0 : 1;
    aro.setAttribute('stroke-dasharray', `${(950 * k).toFixed(0)} ${(6000 * k).toFixed(0)}`);    // luz só no lado esquerdo e no alto da borda
  });
  return sv_;
}

// =================================================================================================================
//  1. MUNDO EM CAMADAS
// =================================================================================================================
// mundo(beats, {
//   fundo: 'f_x' | 'clip:y',  fundoOp: {fx, fy, p: .85, folga, foco: [[t, px], ...]},
//   camadas: [{fonte, x, y, w|h, p, atras, entra: {t: c => tempo, k: 'camera'|'baixo'|'cima'|'esq'|'dir'|'foco'|'pop', s0, dy, d},
//              sai: {t, k, dist, r, ds}, foco: [[t, px]], etiqueta: {txt, t, dx, dy, s}, troca: {t, d, cx, cy}, ate, vida, sombra, filtro}],
//   cam: c => [[t, {x, y, z, r}, 'curva'], ...]   (padrão: recua de 1,16 para 1 com arranque e deriva),
//   pb: c => tempo (vira P&B em 0,25 s; a etiqueta escurece junto), cor: 'frio'|'quente'|'verde'|'vermelho'|'pb'|filtro CSS,
//   fechadura: {t, k0, k, cx, cy}, tr, lead, boom (som de virada de mundo no corte), malha, grao, vig, build, update,
//   retro (acabamento retrô da "vida na foto parada": true padrão | false | {blur, pisca, reticula}) })
//   No build(r, S, c): vdCarro/vdEsteira/vdBoneco/vdAdesivo/vdPorta(S.pal, S, ...) (fim do arquivo).
//   Motor foco (foco: true | c => [[t, x, y, z, d]] | {...}): entradas esq/dir/cima/baixo/canto viram 'pousa' (menos as atras), saídas
//   viram 'some', a etiqueta fica FIXA na tela (x 540, y 1240; etiqueta.y muda, fixa: false volta a prendê-la no personagem),
//   camada.apaga = {t, a: .3, d: .25, foco: 4} escurece o assunto anterior no lugar, socos sem tranco, ambiente baixo.
function mundo(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor, flashes: o.flashes, leaks: o.leaks,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o);
      const pal = eaPalco(r, S, { cor: o.cor, fundoCor: o.fundoCor });
      if (o.fundo) {
        const fo = o.fundoOp || {};
        const f = eaCamada(pal, S, o.fundo, { cobre: true, p: fo.p ?? .85, fx: fo.fx ?? .5, fy: fo.fy ?? .5, folga: fo.folga, vida: false, x: 540, y: 960, iw: fo.iw, ih: fo.ih, from: fo.from, rate: fo.rate });
        if (fo.foco) { f.op.foco = true; f.op._foco = fo.foco.map(([t, v]) => [eaT(c, t), v]); }
        S.fundo = f;
      }
      S.lay = (o.camadas || []).map(op0 => {
        const op = { ...op0 };
        if (op.entra) op.entra = { ...op.entra, _t: eaT(c, op.entra.t) ?? 0 };
        const deFora = op.entra && !op.atras && ['esq', 'dir', 'cima', 'baixo', 'canto'].includes(op.entra.k);
        if (F && deFora) op.entra = { _t: op.entra._t, k: 'pousa', s0: op.entra.s0 ?? 1.08, d: .22 };   // foco: troca no lugar
        else if (o.golpes && deFora && !op.entra.curva) op.entra = { d: .6, ...op.entra, curva: 'mola' };
        if (op.sai) op.sai = { ...op.sai, _t: eaT(c, op.sai.t) };
        if (F && op.sai && op.sai.k !== 'some') op.sai = { _t: op.sai._t, k: 'some', d: .2 };
        if (op.apaga) op._apaga = { a: F ? F.apagado : .3, d: .25, foco: 4, ...op.apaga, t: eaT(c, op.apaga.t) };
        if (op.foco) op._foco = op.foco.map(([t, v]) => [eaT(c, t), v]);
        if (op.ate !== undefined) op._ate = eaT(c, op.ate);
        if (op.alinha && S.fundo) {     // recorte do imagens_ea.py modo camadas: volta para o lugar dele sobre o próprio fundo
          const a = eaAsset(op.fonte), af = eaAsset(o.fundo), k = S.fundo.w / (a.W0 || af.w);
          op.w = a.w * k; op.x = parseFloat(S.fundo.inner.style.left) + (a.ox + a.w / 2) * k; op.y = parseFloat(S.fundo.inner.style.top) + (a.oy + a.h / 2) * k;
          if (op.tam && op.tam !== 1) {   // quadro fechado (TV): o personagem fica CENTRADO na tela (regra da referência), cabeça a ~25% da altura
            op.w *= op.tam; const hh = op.w * a.h / a.w;
            op.x = op.centra === false ? op.x + (op.dx_ ?? 0) : 540 + (op.dx_ ?? 0);
            op.y = op.base_y !== undefined ? op.base_y - hh / 2 : (op.topo ?? 470) + hh / 2;
          }
          op.p = op.p ?? 1;
        }
        if (op.vida3d === undefined && (op.alinha || (op.entra && ['camera', 'esq', 'dir'].includes(op.entra.k)))) op.vida3d = true;
        const lay = eaCamada(pal, S, op.fonte, op);
        if (op.alinha && op.fade !== false) lay.inner.style.webkitMaskImage = lay.inner.style.maskImage = `linear-gradient(to bottom, #000 ${op.fade ?? 78}%, rgba(0,0,0,0) 99%)`;
        if (op.atras && S.fundo) pal.el.insertBefore(lay.L, S.fundo.L.nextSibling);
        if (op.etiqueta && F && op.etiqueta.fixa !== false) {      // foco: a etiqueta fica FIXA na tela (não anda nem borra com a câmera)
          const et = op.etiqueta, h = el(r, 'div', 'position:absolute;left:0;top:0;width:0;height:0;z-index:3;pointer-events:none;');
          (S.etqs = S.etqs || []).push(h);
          eaEtiqueta({ L: h, cx: et.x ?? 540, cy: et.y ?? 1240 }, S, c, { desliza: 0, ...et, dx: 0, dy: 0 });   // o nome aparece no lugar (a barra abre por cima)
          (S.upd = S.upd || []).push((S_, c_) => { h.style.opacity = (1 - clamp((c_.lt - (c_.dur - .24)) / .12)).toFixed(3); });   // some antes do corte/passagem
        } else if (op.etiqueta) eaEtiqueta(lay, S, c, op.etiqueta);
        if (op.troca) { const tr_ = op.troca; lay._pincel = eaPincel(lay, eaT(c, tr_.t), tr_.d ?? .32, tr_.cx ?? 540, tr_.cy ?? 960); cue(c, 'whoosh', eaT(c, tr_.t) - .08, { g: .3, d: .4 }); }
        return lay;
      });
      const ks = o.cam ? o.cam(c) : [[0, { z: 1.3 }], [.5, { z: 1.06 }], [c.dur, { z: .95 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o);
      S.tPB = o.pb ? eaT(c, o.pb) : null;
      if (S.tPB !== null) cue(c, 'boom', S.tPB - .05, { g: .32, d: .8 });
      if (o.fechadura) eaFechadura(r, S, { ...o.fechadura, t: eaT(c, o.fechadura.t) ?? 0 });
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      if (o.drop) EVENTS.push({ t: +(c.t0 + (eaT(c, o.drop === true ? 0 : o.drop) ?? 0)).toFixed(3), type: 'eaDrop' });      // 808 da trilha
      S.socos = (o.socos ? o.socos(c) : []).map(t => { EVENTS.push({ t: +(c.t0 + t).toFixed(3), type: 'eaHit' }); return t; });
      if (o.luz !== false) eaLuz(r, S, o.luz ?? (typeof o.cor === 'string' && EA_LUZ[o.cor] ? o.cor : 'neutro'));
      S.malha = o.malha ?? 1; S.grao = o.grao ?? 1; S.vig = o.vig ?? .4; S.poeira = (o.poeira ?? .5) * (F ? F.poeira : 1); S.retro = o.retro ?? true;
      eaFlashOnda(r, S, c, o);
      if (o.build) o.build(r, S, c);
    },
    update(S, c0) {
      const c = eaPoster(c0, o.posterize);
      let cam = eaRampa(c, S.camF(c.lt), o.rampa);
      const soco = S.socos.reduce((a, t) => a * (c.lt >= t ? 1.085 - .025 * clamp((c.lt - t) / 1.2) : 1), 1);
      cam = { ...cam, z: cam.z * soco };
      eaAplica(S.pal, S, c, cam);
      S.lay.forEach(l => l._pincel && l._pincel(c.lt));
      if (S.tPB !== null) { const q = clamp((c.lt - S.tPB) / .25); S.pal.el.style.filter = q > 0 ? `${S._cor} grayscale(${q.toFixed(3)}) contrast(${(1 + .25 * q).toFixed(3)})` : S._cor;
        (S.etqs || []).forEach(h => { h.style.filter = q > 0 ? `grayscale(${q.toFixed(3)}) brightness(${(1 - .3 * q).toFixed(3)})` : ''; }); }
      else S.pal.el.style.filter = S._cor;
      (S.upd || []).forEach(f => f(S, c));
      eaOndaAplica(S, S.pal.el);
      if (o.update) o.update(S, c);
    },
  });
}

// =================================================================================================================
//  4. DIGITADO NO ESCURO (datas, anos, números que a fala diz): sans condensada branca, cursor, sublinhado vermelho
// =================================================================================================================
// digitado(beats, [['OUTUBRO, 2026', c => tempo], ['180 LOJAS', c => ...]], {s: 70, nota: 'texto pequeno (contexto/fonte)', cam, tr, lead})
// Cada linha é digitada letra a letra a partir do seu tempo (~22 letras/s), com tique de tecla; o sublinhado cresce atrás.
// Motor foco: as linhas ficam FORA do mundo, paradas no centro (y 960); só o fundo de película anda com a câmera. Cada letra já tem o
// seu lugar (a digitação acende as letras, nada desliza) e a nota fica logo abaixo da última linha (o mesmo bloco de leitura).
function digitado(beats, linhas, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o);
      const pal = eaPalco(r, S, { cor: 'neutro' });
      const fundo = el(document.createElement('div'), 'img', ''); fundo.src = eaTexEscuro(); fundo.style.cssText = 'width:1400px;height:2400px;';
      eaCamada(pal, S, null, { el: fundo, x: 540, y: 960, w: 1400, h: 2400, p: .8, vida: false, borrao: false });
      const s = o.s ?? 70, gap = s * 1.5, y0 = (o.y ?? (F ? 960 : 1000)) - (linhas.length - 1) * gap / 2;
      const fixo = F ? el(r, 'div', 'position:absolute;inset:0;z-index:3;pointer-events:none;') : null;
      S.ln = linhas.map(([txt, tf], i) => {
        const t = eaT(c, tf) ?? 0, w = eaLarg(txt, s, EA_COND, 400) * 1.02;
        const g = el(document.createElement('div'), 'div', `position:relative;width:${(w + s).toFixed(0)}px;height:${(s * 1.5).toFixed(0)}px;`);
        const tx_ = el(g, 'div', `position:absolute;left:${(s * .5).toFixed(0)}px;top:0;white-space:nowrap;font-family:${EA_COND};font-size:${s}px;color:#f4f4f2;` +
          `letter-spacing:.01em;text-shadow:0 0 18px rgba(255,255,255,.12);`);
        const cur = el(g, 'div', `position:absolute;top:${(s * .14).toFixed(0)}px;width:${(s * .07).toFixed(1)}px;height:${(s * .95).toFixed(0)}px;background:#f4f4f2;`);
        const sub = el(g, 'div', `position:absolute;left:${(s * .5).toFixed(0)}px;top:${(s * 1.28).toFixed(0)}px;height:${Math.max(3, s * .065).toFixed(1)}px;width:0;background:${EA.verm};`);
        let lay = null, letras = null;
        if (fixo) {
          fixo.appendChild(g); g.style.position = 'absolute';
          g.style.left = `${(540 - (w + s) / 2).toFixed(1)}px`; g.style.top = `${(y0 + i * gap - s * .75).toFixed(1)}px`;
          letras = [...txt].map(ch => el(tx_, 'span', 'opacity:0;', ch === ' ' ? '&nbsp;' : esc(ch)));
        } else lay = eaCamada(pal, S, null, { el: g, x: 540, y: y0 + i * gap, w: w + s, h: s * 1.5, p: 1, vida: false, borrao: false });
        const ritmo = o.ritmo ?? 22, dur = txt.length / ritmo;
        for (let k = 0; k < txt.length; k++) if (txt[k] !== ' ' && k % 2 === 0) cue(c, 'key', t + k / ritmo, { g: .12 });
        return { txt, t, tx_, cur, sub, w, dur, lay, letras };
      });
      if (o.nota) S.nota = el(r, 'div', `position:absolute;left:90px;right:90px;top:${o.notaY ?? (F ? y0 + (linhas.length - 1) * gap + s * .95 : 1460)}px;text-align:center;` +
        `font-family:${EA_SANS};font-weight:600;font-size:30px;color:rgba(235,235,235,.62);letter-spacing:.02em;line-height:1.35;opacity:0;z-index:3;`, o.nota);
      S.tNota = eaT(c, o.tNota) ?? (S.ln.length ? S.ln[S.ln.length - 1].t + .3 : .4);
      const ks = o.cam ? o.cam(c) : [[0, { x: 460, y: 1180, z: 1.22, r: -3 }], [.6, { x: 520, y: 1010, z: 1.06, r: -1.2 }], [c.dur, { x: 560, y: 930, z: .98, r: 1.5 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      S.malha = 1; S.grao = 1; S.vig = .65; S.poeira = .8 * (F ? F.poeira : 1);
    },
    update(S, c) {
      eaAplica(S.pal, S, c, eaRampa(c, S.camF(c.lt), o.rampa));
      S.ln.forEach((L, i) => {
        const n = clamp(Math.floor((c.lt - L.t) * (o.ritmo ?? 22)) + 1, 0, L.txt.length);
        if (L.letras) L.letras.forEach((e, k) => { e.style.opacity = k < n ? 1 : 0; });
        else L.tx_.textContent = L.txt.slice(0, n);
        const wTyped = n ? eaLarg(L.txt.slice(0, n), o.s ?? 70, EA_COND, 400) * 1.02 : 0, s = o.s ?? 70;
        L.cur.style.left = `${(s * .5 + wTyped + s * .06).toFixed(1)}px`;
        const ultimo = i === S.ln.length - 1 || c.lt < S.ln[i + 1].t;
        L.cur.style.opacity = c.lt < L.t - .25 ? 0 : (ultimo && (n < L.txt.length || Math.floor(c.lt * 2.4) % 2 === 0) ? 1 : 0);
        L.sub.style.width = `${(wTyped * E.out(clamp((c.lt - L.t - .08) / Math.max(.2, L.dur)))).toFixed(1)}px`;
      });
      if (S.nota) S.nota.style.opacity = (clamp((c.lt - S.tNota) / .3) * .9).toFixed(3);
    },
  });
}

// =================================================================================================================
//  5. PALAVRA POR PALAVRA na planta azul (a grade é redesenhada a cada quadro com distorção de lente nas bordas)
// =================================================================================================================
// palavras(beats, {fundo: 'planta' | 'quadriculado', s: 92, primeira: 1.35, y: 960, rot0: 26, z0: 1.55, cam, tr, lead, so: [palavras a mostrar]})
// Mostra cada palavra falada no tempo dela, uma por vez, no centro do plano. Use para frases de efeito curtas (5–12 palavras).
// Motor foco: a palavra fica FORA do mundo, parada no centro, e pousa (1,08 → 1 em .22 s) sem o wiggle; a planta gira e abre por
// baixo (a câmera do componente) e o borrão de chegada/saída fica só na planta.
function eaGrade(cv, cam, o) {
  const x = cv.getContext('2d'), Wc = cv.width, Hc = cv.height, sc = Wc / 1080;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, Wc, Hc);
  const a = cam.r * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), z = cam.z, kB = o.barril ?? .085;
  const proj = (X, Y) => {     // mundo -> tela (câmera) -> lente barril
    let u = (X - cam.x) * z, v = (Y - cam.y) * z; const xr = u * ca - v * sa, yr = u * sa + v * ca;
    const rn = (xr * xr + yr * yr) / (1100 * 1100), f = 1 + kB * rn;
    return [(540 + xr * f) * sc, (960 + yr * f) * sc];
  };
  const R = 1500 / z, X0 = cam.x - R, X1 = cam.x + R, Y0 = cam.y - R * 1.4, Y1 = cam.y + R * 1.4, passo = o.passo ?? 40;
  const linha = (pts) => { x.beginPath(); pts.forEach(([X, Y], i) => { const [px, py] = proj(X, Y); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  const amostras = (a0, a1) => { const n = 28, r_ = []; for (let i = 0; i <= n; i++) r_.push(a0 + (a1 - a0) * i / n); return r_; };
  [[1, o.menor ?? 'rgba(220,235,255,.22)', 1.1], [5, o.maior ?? 'rgba(230,240,255,.5)', 2.2]].forEach(([mult, cor, lw]) => {
    x.strokeStyle = cor; x.lineWidth = lw * sc * Math.min(1.6, Math.max(.7, z));
    const p = passo * mult;
    for (let X = Math.floor(X0 / p) * p; X <= X1; X += p) linha(amostras(Y0, Y1).map(Y => [X, Y]));
    for (let Y = Math.floor(Y0 / p) * p; Y <= Y1; Y += p) linha(amostras(X0, X1).map(X => [X, Y]));
  });
}
function palavras(beats, o = {}) {
  const planta = (o.fundo ?? 'planta') === 'planta';
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o, { base: true });
      el(r, 'div', `position:absolute;inset:0;background:${planta ? 'radial-gradient(ellipse 90% 70% at 30% 20%, #3a64ab, #22427c 55%, #142a52)' : 'radial-gradient(ellipse 90% 70% at 40% 30%, #e9eaea, #d2d4d5 60%, #b9bbbd)'};`);
      if (!planta) S.janela = el(r, 'div', 'position:absolute;inset:-200px;background:repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 210px, rgba(40,40,45,.22) 210px 250px), repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 330px, rgba(40,40,45,.2) 330px 370px);filter:blur(28px);transform:rotate(-8deg);');
      S.cv = el(r, 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;'); S.cv.width = 1080; S.cv.height = 1920; S.r = r;
      el(r, 'div', `position:absolute;inset:0;background:url(${eaTexParede()}) center/cover;mix-blend-mode:soft-light;opacity:${planta ? .35 : .18};`);
      S.txt = el(r, 'div', 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;');
      if (F) { S.txt.style.zIndex = 3; S.txt.style.transform = `translate(540px,${(o.y ?? 960)}px)`; }
      const so = o.so ? new Set(o.so.map(norm)) : null;
      const ws = beats.flatMap(id => BYID[id].words).filter(w => !so || so.has(norm(w.w)));
      S.ws = ws.map((w, i) => {
        const px = Math.round((o.s ?? 112) * (i === 0 ? (o.primeira ?? 1.3) : 1));
        // sombra longa (Shadow Studio 3 no projeto: direção 214°, comprimento 100, 20%)
        const somb = Array.from({ length: 10 }, (_, j) => `${(-(j + 1) * 3.4).toFixed(1)}px ${((j + 1) * 5).toFixed(1)}px ${(2 + j * .8).toFixed(1)}px rgba(0,0,0,${(.07 - j * .004).toFixed(3)})`).join(',');
        const e = el(S.txt, 'div', `position:absolute;left:0;top:0;white-space:nowrap;font-family:${EA_SERIF};font-style:italic;font-weight:500;font-size:${px}px;` +
          `color:#fbfbfb;transform:translate(-50%,-55%);text-shadow:${somb};filter:drop-shadow(5px 9px 5px rgba(0,0,0,${planta ? .5 : .3}));opacity:0;`, esc(w.w.replace(/[,.;:!?]+$/, '')));
        const t = F && i === 0 ? Math.min(0, w.s - c.t0 - .03) : w.s - c.t0 - .03; cue(c, 'tick', F ? Math.max(0, t) : t, { g: .07 });   // foco: a 1ª palavra já está no quadro 0
        return { e, t };
      });
      // projeto: Null 28 da câmera vai de z 1420 a 50 e de 30° a 0° em 2 s (EA_ENTRA) com wiggle(1,25) — começa colada e abre girando
      const ks = o.cam ? o.cam(c) : [[0, { x: 540, y: 960, z: o.z0 ?? 2.6, r: o.rot0 ?? 30 }], [Math.min(2, c.dur * .8), { z: 1, r: 0 }, 'entra'], [c.dur, { z: .97, y: 930 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      S.malha = 1; S.grao = 1; S.vig = .45; S.poeira = .35 * (F ? F.poeira : 1);
    },
    update(S, c) {
      const cam = eaRampa(c, S.camF(c.lt), o.rampa === undefined ? { zIn: 0, rIn: 0, wig: 25 } : o.rampa);
      eaBorraCena(S.foco ? S.cv : S.r, c, o.rampa);
      eaGrade(S.cv, cam, planta ? {} : { menor: 'rgba(80,90,100,.28)', maior: 'rgba(70,80,90,.42)', passo: 54 });
      if (!S.foco) S.txt.style.transform = `translate(540px,${(o.y ?? 960)}px) rotate(${cam.r.toFixed(3)}deg) scale(${cam.z.toFixed(4)}) translate(${(540 - cam.x).toFixed(1)}px,${(960 - cam.y).toFixed(1)}px)`;
      let k = -1; S.ws.forEach((w, i) => { if (c.lt >= w.t) k = i; });
      S.ws.forEach((w, i) => {
        const on = i === k, u = clamp((c.lt - w.t) / (S.foco ? .22 : .14));
        w.e.style.opacity = on ? 1 : 0;
        if (on && S.foco) { const b = (1 - clamp(u * 2.5)) * 3; w.e.style.transform = `translate(-50%,-55%) scale(${lerp(1.08, 1, E.out5(u)).toFixed(4)})`; w.e.style.filter = `drop-shadow(5px 9px 5px rgba(0,0,0,.5))${b > .2 ? ` blur(${b.toFixed(1)}px)` : ''}`; }
        else if (on) { w.e.style.transform = `translate(-50%,calc(-55% + ${aeWiggle(c.lt, 3, 25, i * 3.1).toFixed(1)}px)) scale(${lerp(1.14, 1, E.out5(u)).toFixed(4)})`; w.e.style.filter = `drop-shadow(5px 9px 5px rgba(0,0,0,.5))${u < 1 ? ` blur(${(5 * (1 - u)).toFixed(1)}px)` : ''}`; }
      });
      if (S.janela) S.janela.style.opacity = (1 - .7 * clamp(c.lt / 1.2)).toFixed(3);
    },
  });
}

// =================================================================================================================
//  6. PALAVRAS EMPILHANDO ("But there was a twist."): cada palavra nova entra EM CIMA, a coluna desce e as de baixo borram
// =================================================================================================================
// pilha(beats, {s: 120, rot0: -28, so: [...], tr, lead, saida: 'sobe'})
// Motor foco (foco: true | {y: 880, giro: .5}): a palavra nova POUSA parada no centro (y) e é o único texto; as anteriores descem uma
// casa e apagam (.2, desfocadas: a pilha vira textura); quem gira e abre com a câmera é a parede do fundo (giro = fração do giro).
function pilha(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o);
      S.bg = el(r, 'div', `position:absolute;inset:-300px;background:url(${eaTexParede()}) center/cover;filter:brightness(.62) saturate(.9);`);
      el(r, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 38%, rgba(255,255,255,.08), rgba(0,0,0,.55));');
      S.col = el(r, 'div', 'position:absolute;left:540px;top:960px;width:0;height:0;transform-origin:0 0;'); S.r = r;
      const so = o.so ? new Set(o.so.map(norm)) : null;
      const ws = beats.flatMap(id => BYID[id].words).filter(w => !so || so.has(norm(w.w)));
      const s = o.s ?? 120;
      S.ws = ws.map((w, i) => ({ e: el(S.col, 'div', `position:absolute;left:0;white-space:nowrap;font-family:${EA_SERIF};font-style:italic;font-weight:500;font-size:${s}px;color:#f3f3f1;` +
        `transform:translate(-50%,-50%);opacity:0;text-shadow:0 6px 24px rgba(0,0,0,.4);`, esc(w.w)), t: F && i === 0 ? Math.min(0, w.s - c.t0 - .03) : w.s - c.t0 - .03, i }));   // foco: a 1ª já no quadro 0
      S.ws.forEach(w => cue(c, 'tick', F ? Math.max(0, w.t) : w.t, { g: .06 }));
      S.passo = s * 1.25;
      if (F) S.col.style.zIndex = 3;
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      S.malha = 1; S.grao = 1; S.vig = .55; S.poeira = .8 * (F ? F.poeira : 1);
    },
    update(S, c) {
      const lt = c.lt; let n = 0; S.ws.forEach(w => { if (lt >= w.t) n = w.i + 1; });
      if (S.foco) {
        const g = S.foco.giro ?? .5, base = { x: 540, y: 960, z: lerp(1.25, 1, EA_ARRANQUE(clamp(lt / .6))) * (1 + .03 * lt), r: g * lerp(o.rot0 ?? -28, 0, EA_ARRANQUE(clamp(lt / .6))) };
        const cm = eaRampa(c, base, o.rampa === undefined ? { rIn: 0, wig: 15 * S.foco.vida * 2 } : o.rampa); eaBorraCena(S.bg, c, o.rampa);
        S.bg.style.transform = `translate(${((540 - cm.x) * cm.z).toFixed(1)}px,${((960 - cm.y) * cm.z).toFixed(1)}px) rotate(${cm.r.toFixed(2)}deg) scale(${Math.max(cm.z, 1.04).toFixed(4)})`;
        const y0 = S.foco.y ?? 880;
        S.ws.forEach(w => {
          if (lt < w.t) { w.e.style.opacity = 0; return; }
          let desce = 0, pos = 0;                                  // cada palavra que chega depois empurra esta uma casa para baixo
          S.ws.forEach(v => { if (v.i > w.i && lt >= v.t) { desce += E.inOut(clamp((lt - v.t) / .3)); pos++; } });
          const u = clamp((lt - w.t) / .22), ap = pos ? clamp((lt - S.ws[w.i + 1].t) / .034 + .01) : 0;   // apaga no quadro em que a seguinte chega, e só depois desce
          w.e.style.top = `${(y0 + desce * S.passo - 960).toFixed(1)}px`;
          w.e.style.opacity = (clamp(u * 5) * lerp(1, .2, ap) * (pos > 4 ? 0 : 1)).toFixed(3);
          w.e.style.transform = `translate(-50%,-50%) scale(${(lerp(1.08, 1, E.out5(u)) * (1 - .05 * desce)).toFixed(4)})`;
          const b = (1 - clamp(u * 2.5)) * 4 + ap * (2.5 + desce * 1.2);
          w.e.style.filter = b > .4 ? `blur(${b.toFixed(1)}px)` : '';
        });
        return;
      }
      // a coluna desce suave a cada palavra nova (a nova fica perto do centro-alto da tela)
      const alvo = 820, rol = S.ws.reduce((acc, w) => acc + S.passo * E.out5(clamp((lt - w.t) / .3)), 0);
      const base = { x: 540, y: 960, z: lerp(1.25, 1, EA_ARRANQUE(clamp(lt / .6))) * (1 + .03 * lt), r: lerp(o.rot0 ?? -28, 0, EA_ARRANQUE(clamp(lt / .6))) };
      const cm = eaRampa(c, base, o.rampa === undefined ? { rIn: 0 } : o.rampa); eaBorraCena(S.r, c, o.rampa);
      S.col.style.transform = `translate(${(540 - cm.x).toFixed(1)}px,${(960 - cm.y).toFixed(1)}px) rotate(${cm.r.toFixed(2)}deg) scale(${cm.z.toFixed(4)})`;
      S.ws.forEach(w => {
        if (lt < w.t) { w.e.style.opacity = 0; return; }
        const pos = n - 1 - w.i;                                   // 0 = a mais nova (em cima)
        const y = alvo + rol - (w.i + 1) * S.passo;
        const u = clamp((lt - w.t) / .16), b = pos * 1.8 + (1 - u) * 8, sc = 1 + pos * .07;
        w.e.style.top = `${(y - 960).toFixed(1)}px`; w.e.style.opacity = clamp(u * 3) * (pos > 5 ? 0 : 1);
        w.e.style.transform = `translate(-50%,calc(-50% + ${aeWiggle(lt, 3, 25, w.i * 2.3).toFixed(1)}px)) scale(${(sc * lerp(1.2, 1, E.out5(u))).toFixed(4)})`;
        w.e.style.filter = b > .4 ? `blur(${b.toFixed(1)}px)` : '';
      });
    },
  });
}

// =================================================================================================================
//  7. LETRAS 3D no papel quadriculado (extrusão em camadas de sombra), digitadas letra a letra com estalo
// =================================================================================================================
// letras3D(beats, [['AS EMPRESAS', c => tempo, cor?, tamanho?], ...], {fundo: 'quadriculado', cam, tr, lead})
// Motor foco (foco: true | {grupos: [[0], [1, 2]], tilt: 14}): o bloco de letras fica FORA da câmera, parado no centro e com a
// inclinação fixa; só o papel quadriculado anda. grupos = linhas de cada frase: um grupo por vez, o seguinte TROCA no lugar.
function eaExtrude(cor, n = 16) {
  const esc_ = (h, k) => { const v = parseInt(h.slice(1), 16), r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255; return `rgb(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)})`; };
  const sh = []; for (let i = 1; i <= n; i++) sh.push(`${(i * .55).toFixed(1)}px ${i}px 0 ${esc_(cor, .62 - i * .012)}`);
  sh.push(`${(n * .55 + 6).toFixed(1)}px ${n + 18}px 26px rgba(0,0,0,.38)`);
  return sh.join(',');
}
function letras3D(beats, linhas, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o, { base: true });
      el(r, 'div', 'position:absolute;inset:0;background:radial-gradient(ellipse 90% 70% at 45% 35%, #eceeef, #d6d8d9 60%, #babdbf);');
      S.janela = el(r, 'div', 'position:absolute;inset:-260px;background:repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 230px, rgba(30,32,38,.3) 230px 290px), repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 340px, rgba(30,32,38,.28) 340px 400px);filter:blur(30px);transform:rotate(-6deg);');
      S.cv = el(r, 'canvas', 'position:absolute;inset:0;width:1080px;height:1920px;'); S.cv.width = 1080; S.cv.height = 1920; S.r = r;
      S.box = el(r, 'div', 'position:absolute;left:0;top:0;width:0;height:0;transform-origin:0 0;');
      S.persp = el(S.box, 'div', 'position:absolute;left:0;top:0;perspective:1400px;');
      S.plano = el(S.persp, 'div', 'position:absolute;left:0;top:0;transform-style:preserve-3d;');
      const tam = (l, i) => l[3] ?? [124, 112, 84][i] ?? 100;
      // foco: cada grupo (frase) é montado sozinho, centrado; sem foco, todas as linhas numa coluna só (como antes)
      const grupos = F && F.grupos ? F.grupos : [linhas.map((_, i) => i)];
      const gDe = []; grupos.forEach((g, gi) => g.forEach(i => { gDe[i] = gi; }));
      const yIni = grupos.map(g => -(F && F.grupos ? g.reduce((a, i) => a + tam(linhas[i], i) * 1.02, 0) : linhas.reduce((a, l) => a + (l[3] ?? 150) * 1.02, 0)) / 2);
      S.letras = []; S.gT = grupos.map(g => Math.min(...g.map(i => eaT(c, linhas[i][1]) ?? 0)));
      linhas.forEach(([txt, tf, cor, s0], i) => {
        const s = tam(linhas[i], i), cr = cor ?? EA.l3d[i % 3], t = eaT(c, tf) ?? 0, gi = gDe[i] ?? 0, y = yIni[gi];
        const linha = el(S.plano, 'div', `position:absolute;left:0;top:${(y + s * .5).toFixed(0)}px;transform:translate(-50%,-50%);white-space:nowrap;font-family:${EA_SANS};font-weight:900;` +
          `font-size:${s}px;letter-spacing:-.02em;line-height:1;`);
        [...txt].forEach((ch, k) => {
          const sp = el(linha, 'span', `display:inline-block;color:${cr};text-shadow:${eaExtrude(cr, Math.round(s / 11))};opacity:0;`, ch === ' ' ? '&nbsp;' : esc(ch));
          const tk = t + k * (o.ritmo ?? .045);
          S.letras.push({ sp, t: tk, g: gi });
          if (ch !== ' ' && k % 2 === 0) cue(c, 'pop', tk, { g: .08 });
        });
        yIni[gi] = y + s * 1.02;
      });
      const ks = o.cam ? o.cam(c) : [[0, { x: 540, y: 960, z: 1.18, r: 0, tilt: 26 }], [.7, { z: 1.03, tilt: 16 }], [c.dur, { z: 1.08, tilt: 10 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0, tilt: 18 });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      S.malha = 1; S.grao = 1; S.vig = .3; S.poeira = .25;
    },
    update(S, c) {
      const cam = eaRampa(c, S.camF(c.lt), o.rampa === false ? false : { deriva: .5, ...(o.rampa || {}) }); eaBorraCena(S.foco ? S.cv : S.r, c, o.rampa);
      eaGrade(S.cv, cam, { menor: 'rgba(70,82,92,.34)', maior: 'rgba(70,82,92,.34)', passo: 64, barril: .11 });
      if (S.foco) {          // o bloco fica parado (fora da câmera) e com a inclinação fixa; o grupo ativo é o último que já começou
        S.box.style.transform = `translate(540px,${(o.y ?? 930)}px)`; S.box.style.zIndex = 3;
        S.plano.style.transform = `rotateX(${(S.foco.tilt ?? 14).toFixed(2)}deg)`;
        let ga = 0; S.gT.forEach((t, gi) => { if (c.lt >= t) ga = gi; });
        S.letras.forEach(L => { const u = clamp((c.lt - L.t) / .12); L.sp.style.opacity = u > 0 && L.g === ga ? 1 : 0; L.sp.style.transform = `translateY(${(-40 * (1 - E.back(u))).toFixed(1)}px) scale(${lerp(.55, 1, E.back(u)).toFixed(3)})`; });
      } else {
        S.box.style.transform = `translate(${(540 + (540 - cam.x) * cam.z).toFixed(1)}px,${((o.y ?? 930) + (960 - cam.y) * cam.z).toFixed(1)}px) rotate(${cam.r.toFixed(3)}deg) scale(${cam.z.toFixed(4)})`;
        S.plano.style.transform = `rotateX(${cam.tilt.toFixed(2)}deg)`;
        S.letras.forEach(L => { const u = clamp((c.lt - L.t) / .12); L.sp.style.opacity = u > 0 ? 1 : 0; L.sp.style.transform = `translateY(${(-40 * (1 - E.back(u))).toFixed(1)}px) scale(${lerp(.55, 1, E.back(u)).toFixed(3)})`; });
      }
      S.janela.style.opacity = (1 - .65 * clamp(c.lt / 1.0)).toFixed(3);
    },
  });
}

// =================================================================================================================
//  8. MATÉRIA IMPRESSA (texto REAL): na mesa (madeira quente) ou nas tábuas escuras; marca-texto, círculo vermelho, punch-in
// =================================================================================================================
// jornal(beats, {
//   veiculo: 'EXAME' | logo: 'lg_x', faixa: '#111' (cor da faixa do nome), linhaTopo: 'NEGÓCIOS · 8 DE JANEIRO DE 2017',
//   titulo: 'Ricardo Mansur, ex-Mappin, está na mira de juiz nos EUA', linha: 'subtítulo real', autor: 'Estadão Conteúdo',
//   corpo: ['parágrafo real', ...], foto: 'f_x' (P&B), legenda: 'legenda real', moldura: 'vermelha' | 'caixao',
//   marca: [[c => t, 'trecho exato', 'amarelo'|'verde'], ...], circulo: [c => t, 'trecho'], soco: c => t (punch-in),
//   fundo: 'mesa' | 'tabuas' | 'maos' (precisa do asset maos_jornal), entra: 'voa' | 'sobe' | 'pousa' | 'fixa' | 'impressa',
//   sai: c => t (o jornal cai girando), cam, rot0, tr, lead, boom, pulso })
// Motor foco (foco: true | c => [[t, {alvo: 'titulo' | 'trecho' | 'foto', z, dx, dy}, d], ...] | {focos, mao, ...}): a página já está
//   na mesa no quadro 0 ('voa'/'sobe' viram 'pousa': 1,05 → 1 no lugar); a câmera chega no título e vai a cada trecho UMA vez (padrão:
//   título e depois cada marca-texto, .45 s antes dela, ≥ 1 s entre os movimentos) e FICA lá; só o texto em foco fica em tinta cheia
//   (o resto apaga para .3; marcas e círculo depois que passam ficam), mão 3 px, sem tranco. 'fixa' = corte casado com a cena anterior
//   (mesmo enquadramento, sem chegada nem borrão de corte; pulso: true devolve o borrão). Com sai (página caindo) a câmera não dá
//   o chicote de saída. Marque o trecho DEPOIS que a câmera chega (t da marca ≥ t do foco + .45).
function eaJornal(o) {
  const Wp = o.largura ?? 900, pad = 46;
  const p = el(document.createElement('div'), 'div', `position:relative;width:${Wp}px;background:url(${eaTexPapel()}) center/cover;padding:${pad}px ${pad}px ${pad + 10}px;` +
    `box-shadow:0 30px 60px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.4);color:#1b1a18;font-family:${EA_JORNAL};border-radius:3px;`);
  if (o.logo && AS(o.logo)) { const fx = el(p, 'div', `background:${o.faixa ?? '#121212'};margin:-${pad}px -${pad}px 22px;padding:26px ${pad}px 22px;display:flex;align-items:center;`);
    const im = el(fx, 'img', 'height:74px;'); im.src = AS(o.logo).src; }
  else if (o.veiculo) el(p, 'div', `background:${o.faixa ?? '#121212'};color:${o.corVeiculo ?? '#fff'};margin:-${pad}px -${pad}px 22px;padding:22px ${pad}px 18px;` +
    `font-family:${o.fonteVeiculo ?? EA_SANS};font-weight:${o.fonteVeiculo ? 400 : 900};font-size:${o.sVeiculo ?? 68}px;letter-spacing:-.02em;line-height:1;` +
    (o.faixa && o.faixa !== '#121212' ? 'border-bottom:2px solid #1b1a18;' : ''), esc(o.veiculo)).dataset.cab = '1';
  if (o.linhaTopo) el(p, 'div', `font-family:${EA_SANS};font-weight:600;font-size:19px;letter-spacing:.08em;color:#555;border-bottom:2px solid #1b1a18;padding-bottom:10px;margin-bottom:16px;`, esc(o.linhaTopo)).dataset.cab = '1';
  const tit = el(p, 'div', `font-weight:700;font-size:${o.sTitulo ?? 64}px;line-height:1.04;letter-spacing:-.015em;margin-bottom:14px;border-left:${o.barra === false ? 0 : 9}px solid ${EA.verm};padding-left:${o.barra === false ? 0 : 18}px;`, esc(o.titulo || ''));
  tit.dataset.bloco = 'titulo';
  if (o.linha) el(p, 'div', 'font-style:italic;font-size:27px;line-height:1.3;color:#333;margin-bottom:12px;', esc(o.linha)).dataset.bloco = 'linha';
  if (o.autor) el(p, 'div', `font-family:${EA_SANS};font-weight:600;font-size:18px;color:#666;margin-bottom:18px;letter-spacing:.03em;`, esc(o.autor));
  const corpo = el(p, 'div', 'display:flex;gap:26px;align-items:flex-start;');
  const colTxt = el(corpo, 'div', `flex:1;font-size:${o.sCorpo ?? 25}px;line-height:1.36;text-align:justify;hyphens:auto;`);
  (o.corpo || []).forEach(par => el(colTxt, 'p', 'margin:0 0 12px;text-indent:1.2em;', esc(par)).dataset.bloco = 'corpo');
  if (o.foto && AS(o.foto)) {
    const colF = el(corpo, 'div', `width:${o.larguraFoto ?? 330}px;flex:none;`);
    const fr = el(colF, 'div', `position:relative;width:100%;height:${o.alturaFoto ?? 420}px;overflow:hidden;background:#222;` +
      (o.moldura === 'caixao' ? 'clip-path:polygon(50% 0,100% 18%,88% 100%,12% 100%,0 18%);' : ''));
    const im = el(fr, 'img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.15);');
    im.src = AS(o.foto).src; im.style.objectPosition = o.fotoPos ?? '50% 30%';
    if (o.moldura) { const svg = svgAbs(fr, 0, 0, o.larguraFoto ?? 330, o.alturaFoto ?? 420, 'z-index:2;');
      const w_ = o.larguraFoto ?? 330, h_ = o.alturaFoto ?? 420;
      const d = o.moldura === 'caixao' ? `M${w_ / 2},4 L${w_ - 4},${h_ * .18} L${w_ * .88 - 2},${h_ - 4} L${w_ * .12 + 2},${h_ - 4} L4,${h_ * .18} Z` : `M5,5 H${w_ - 5} V${h_ - 5} H5 Z`;
      sv(svg, 'path', { d, fill: 'none', stroke: EA.verm, 'stroke-width': 8 }); }
    if (o.legenda) el(colF, 'div', `font-family:${EA_SANS};font-size:16px;line-height:1.3;color:#444;margin-top:8px;`, esc(o.legenda));
    fr.dataset.foto = '1';
  }
  return p;
}
// envolve o trecho exato num <span> de marca-texto (procura no título, na linha fina e no corpo)
function eaMarcaSpan(papel, trecho) {
  for (const n of papel.querySelectorAll('[data-bloco]')) {
    const i = n.textContent.indexOf(trecho);
    if (i < 0) continue;
    const walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT); let acc = 0, tn;
    while ((tn = walker.nextNode())) {
      const L = tn.textContent.length;
      if (i >= acc && i < acc + L) {
        const off = i - acc, rng = document.createRange(); rng.setStart(tn, off); rng.setEnd(tn, Math.min(L, off + trecho.length));
        const sp = document.createElement('span'); sp.className = 'eamk'; rng.surroundContents(sp); return sp;
      }
      acc += L;
    }
  }
  console.error('edit-earn: trecho não achado na matéria: ' + trecho); return null;
}
function jornal(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const fundo = o.fundo ?? 'mesa', ent0 = o.entra ?? 'voa';
      // foco: câmera padrão = título (ou, na 'fixa', a última marca já feita) e depois cada marca-texto nova, .45 s antes dela
      const mks = (o.marca || []).map(([tf, tr_]) => [eaT(c, tf), tr_]), feitas = mks.filter(m => m[0] < 0);
      const fp = [[0, ent0 === 'fixa' && feitas.length ? { alvo: feitas[feitas.length - 1][1], z: 1.9 } : { alvo: 'titulo', z: 1.3 }]];
      mks.filter(m => m[0] >= 0).sort((a, b) => a[0] - b[0]).forEach(([t, tr_]) => { const tf = Math.max(.6, t - .45); if (tf - fp[fp.length - 1][0] >= 1) fp.push([tf, { alvo: tr_, z: 1.9 }, .8]); });
      const F = eaFocoIni(S, c, o, { focos: fp, mao: 3, deriva: (c.t0 / ((window.TIMING && TIMING.videoDur) || 1) >= .55 ? 1 : -1) * .02,
        chega: ent0 === 'fixa' ? false : { z: 1.05 }, sai: o.sai ? false : undefined });
      if (F && ent0 === 'fixa' && o.pulso !== true) this.semPulso = true;        // corte casado: sem o borrão de corte
      if (o.pulso === false) this.semPulso = true;
      const pal = eaPalco(r, S, { cor: o.cor ?? (fundo === 'mesa' ? 'quente' : 'neutro') });
      const madeira = AS(o.madeira ?? 'f_mesa_madeira');
      if (madeira) {
        const f = eaCamada(pal, S, o.madeira ?? 'f_mesa_madeira', { cobre: true, folga: 2.1, p: .9, vida: false, rot: o.rotMadeira ?? (fundo === 'mesa' ? 0 : 56) });   // tábuas: em pé, como na referência
        f.op.base = fundo === 'mesa' ? 'sepia(.9) saturate(2.4) hue-rotate(-16deg) brightness(.5) contrast(1.2)' : 'grayscale(.9) brightness(.36) contrast(1.45)';
      }
      (o.objetos || []).forEach(ob => eaCamada(pal, S, ob.fonte, { ...ob, sombra: true, vida: false }));
      const papel = eaJornal(o);
      const lay = eaCamada(pal, S, null, { el: papel, x: 540, y: 960, w: o.largura ?? 900, h: 1200, p: 1, vida: fundo === 'maos' ? 1.2 : false });
      // no build a cena está em display:block (visibility:hidden): já dá para medir a altura real e centralizar em (540, 960)
      const hp = papel.offsetHeight || 1200; lay.h = hp; papel.style.top = `${(960 - hp / 2).toFixed(1)}px`;
      S.papel = papel; S.lay = lay;
      if (fundo === 'maos' && AS('maos_jornal')) S.maos = eaCamada(pal, S, 'maos_jornal', { x: 540, y: 1180, w: 1500, p: 1, vida: 1.2 });
      S.mk = (o.marca || []).map(([tf, trecho, cor]) => {
        const sp = eaMarcaSpan(papel, trecho), t = eaT(c, tf);
        if (sp) { const cr = cor === 'verde' ? EA.verde : EA.amarelo; sp.style.cssText = `background:linear-gradient(${cr},${cr}) no-repeat 0 60%/0% 82%;box-decoration-break:clone;-webkit-box-decoration-break:clone;padding:0 2px;mix-blend-mode:multiply;`; if (t >= 0) cue(c, 'marker', t, { g: .22 }); }
        return { sp, t };
      });
      if (o.circulo) {      // círculo vermelho à mão em volta do trecho (posição pelo layout do papel, sem as transformações da câmera)
        const [tf, trecho] = o.circulo, sp = eaMarcaSpan(papel, trecho); S.circ = { t: eaT(c, tf) };
        if (sp) {
          let x0 = 0, y0 = 0, n = sp; while (n && n !== papel) { x0 += n.offsetLeft; y0 += n.offsetTop; n = n.offsetParent; }
          const w = sp.offsetWidth, hh = sp.offsetHeight, svg = svgAbs(papel, 0, 0, papel.offsetWidth, hp, 'z-index:3;pointer-events:none;');
          S.circ.p = prep(sv(svg, 'path', { d: roughCircle(x0 + w / 2, y0 + hh / 2, w / 2 + 18, hh / 2 + 12, 1.12, 7), fill: 'none', stroke: '#e0241b', 'stroke-width': 7, 'stroke-linecap': 'round' }));
        }
        if (S.circ.t >= 0) cue(c, 'marker', S.circ.t, { g: .2 });
      }
      const ent = F && (ent0 === 'voa' || ent0 === 'sobe') ? 'pousa' : ent0;
      S.tEnt = eaT(c, o.tEntra) ?? 0;
      if (ent === 'voa') { lay.op.entra = { k: 'dir', dist: 1300, r0: 34, s0: 1.18, _t: S.tEnt, d: .5 }; cue(c, 'paper', S.tEnt, { g: .4, d: .5 }); cue(c, 'whoosh', S.tEnt, { g: .26, d: .45 }); }
      else if (ent === 'sobe') { lay.op.entra = { k: 'baixo', dist: 1500, r0: -6, _t: S.tEnt, d: .55 }; cue(c, 'paper', S.tEnt + .1, { g: .3 }); }
      else if (ent === 'pousa') { lay.op.entra = { k: 'pousa', _t: S.tEnt - .06, s0: 1.03, d: .3 }; cue(c, 'paper', S.tEnt, { g: .3, d: .35 }); }   // já na mesa no quadro 0
      // 'fixa': a página já está na mesa (segundo enquadramento da mesma matéria, depois de um corte seco)
      if (o.sai) { lay.op.sai = F ? { k: 'afunda', _t: eaT(c, o.sai), d: .4 } : { k: 'baixo', dist: 2100, r: 24, _t: eaT(c, o.sai), d: .55 };   // foco: assenta e some no lugar
        if (S.maos) S.maos.op.sai = { ...lay.op.sai }; cue(c, 'paper', eaT(c, o.sai), { g: .3, d: .45 }); }
      S.tSoco = o.soco ? eaT(c, o.soco) : null;
      const r0 = o.rot0 ?? (fundo === 'mesa' ? 22 : 0);
      const ks = o.cam ? o.cam(c) : (ent === 'impressa'
        ? [[0, { x: 540, y: 960, z: 2.6, r: 0 }], [.45, { z: 1.1 }, 'seco'], [c.dur, { z: .97 }, 'linear']]
        : [[0, { x: 540, y: 980, z: 1.55, r: r0 }], [.9, { z: 1.26, r: r0 * .25 }], [c.dur, { z: 1.16, r: -r0 * .15 }, 'linear']]);
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o, eaAlvoJornal(papel, { texto: !!F }));
      if (o.golpes && !F && lay.op.entra) lay.op.entra = { ...lay.op.entra, curva: 'mola', d: .6 };     // a página pousa com mola
      if (F) {               // foco: os textos da página viram spans (depois de todas as marcas e alvos); marcas e círculo ficam em tinta depois que passam
        S.jf = eaJornalFoco(S, papel, S._g.focos || [[0, {}]], ent0 === 'fixa' ? -9 : .12);
        S.jf.tinta = new Map(S.mk.filter(m => m.sp).map(m => [m.sp, m.t]));
        if (S.circ && S.circ.p) { const cs = [...papel.querySelectorAll('.eamk')].find(e => e.textContent === o.circulo[1]); if (cs) S.jf.tinta.set(cs, S.circ.t); }
      }
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: o.boom ?? true, tr: o.tr ?? 'cut' });
      if (S.tSoco !== null) EVENTS.push({ t: +(c.t0 + S.tSoco).toFixed(3), type: 'eaHit' });
      if (o.drop) EVENTS.push({ t: +(c.t0 + (eaT(c, o.drop === true ? 0 : o.drop) ?? 0)).toFixed(3), type: 'eaDrop' });
      eaLuz(r, S, fundo === 'mesa' ? 'quente' : 'neutro');
      S.malha = 1; S.grao = 1; S.vig = fundo === 'mesa' ? .5 : .7; S.poeira = .5 * (F ? F.poeira : 1);
      eaFlashOnda(r, S, c, o);
      if (ent === 'voa') EVENTS.push({ t: +(c.t0 + S.tEnt).toFixed(3), type: 'eaSwoosh' });
    },
    update(S, c0) {
      const c = eaPoster(c0, o.posterize);
      let cam = eaRampa(c, S.camF(c.lt), o.rampa);
      if (S.tSoco !== null && c.lt >= S.tSoco) cam = { ...cam, z: cam.z * (1.2 + .02 * (c.lt - S.tSoco)) };     // punch-in seco (1 quadro)
      eaAplica(S.pal, S, c, cam);
      (S.upd || []).forEach(f => f(S, c));
      eaOndaAplica(S, S.pal.el);
      S.mk.forEach(m => { if (m.sp) m.sp.style.backgroundSize = `${(100 * E.inOut(clamp((c.lt - m.t) / .5))).toFixed(1)}% 82%`; });
      if (S.circ && S.circ.p) draw(S.circ.p, clamp((c.lt - S.circ.t) / .4));
      if (S.jf) {            // a página caindo (sai) ou o chicote de saída da câmera: o texto vira textura
        const s_ = S._g && S._g.sai;
        S.jfFim = o.sai ? eaT(c, o.sai) - .05 : s_ ? c.dur + (c._trProx || 0) - s_.t : null;
        eaJornalFocoAplica(S, c.lt);
      }
    },
  });
}

// =================================================================================================================
//  9. PAREDE DE FOTOS P&B: entram voando dos 4 cantos para a grade 2×2, flash de câmera, raios de luz, saem girando
// =================================================================================================================
// parede(beats, ['f_a', 'f_b', 'f_c', 'f_d'], {ts: c => [t1, t2, t3, t4], flash: c => t, sai: c => t, cam, tr, lead, boom})
// Motor foco (foco: true | {fotos: c => [[t, i | 'todas', z], ...]}): as fotos já estão pregadas na parede no quadro 0 (com ts, cada
//   uma POUSA no lugar no tempo dela; nada voa dos cantos); fotos = UMA foto em destaque por vez (as outras escurecem e desfocam) e a
//   câmera vai até ela com zoom (z 1.5; 'todas' = recua para a grade inteira, z 1.0). O flash cai no 1º destaque (ou em flash).
function parede(beats, fotos, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const pos = [[300, 700], [780, 700], [300, 1230], [780, 1230]], de = [[-900, -900], [900, -900], [-900, 900], [900, 900]];
      const fo = o.foco && typeof o.foco === 'object' ? o.foco : {};
      const dest = fo.fotos ? eaT(c, fo.fotos).map(([t, i, z]) => [eaT(c, t), i, z]) : null;
      const fcs = dest ? dest.map(([t, i, z], k) => [k ? t : 0, i === 'todas' ? 540 : pos[i][0], i === 'todas' ? 965 : pos[i][1], z ?? (i === 'todas' ? 1.0 : 1.5), .9]) : [[0, 540, 965, 1.02]];
      const F = eaFocoIni(S, c, o, { focos: fcs, mao: 3 });
      const pal = eaPalco(r, S, { cor: 'neutro' });
      const f = el(document.createElement('div'), 'div', 'width:1400px;height:2400px;'), tex = eaTexParede();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++)
        el(f, 'img', `position:absolute;left:${dx * 1400}px;top:${dy * 2400}px;width:1400px;height:2400px;transform:scale(${dx ? -1 : 1},${dy ? -1 : 1});`).src = tex;
      eaCamada(pal, S, null, { el: f, x: 540, y: 960, w: 1400, h: 2400, p: .85, vida: false, borrao: false });
      const ts = o.ts ? o.ts(c) : F ? [-1, -1, -1, -1] : [0, .04, .08, .12];
      // destaque (foco): 1 = em destaque, 0 = escurecida; troca em .25 s, começando .1 s antes do tempo dado
      const kAt = lt => { let k = -1; (dest || []).forEach(([t], q) => { if (lt >= t - .1) k = q; }); return k; };
      const on = (k, j) => k < 0 || dest[k][1] === 'todas' || dest[k][1] === j ? 1 : 0;
      const mix = (lt, j) => { const k = kAt(lt); return k < 0 ? 1 : lerp(on(k - 1, j), on(k, j), clamp((lt - (dest[k][0] - .1)) / .25)); };
      S.fotos = fotos.slice(0, 4).map((nome, i) => {
        const a = eaAsset(nome), w = o.w ?? 380, hh = w * 1.28;
        const fr = el(document.createElement('div'), 'div', `position:relative;width:${w}px;height:${hh}px;background:#f2f0ea;padding:16px 16px 18px;box-shadow:0 18px 30px rgba(0,0,0,.55);`);
        const im = el(fr, 'img', 'width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.2) brightness(1.02);'); im.src = a.src;
        im.style.objectPosition = (o.pos && o.pos[i]) || '50% 35%';
        const lay = eaCamada(pal, S, null, { el: fr, x: pos[i][0], y: pos[i][1], w, h: hh, p: 1 + i * .04, rot: (hrand(i + 4) - .5) * 7, vida: 1.2 });
        if (F) {
          lay.op.entra = { k: 'pousa', _t: ts[i], s0: 1.1, d: .25 }; if (ts[i] >= 0) cue(c, 'paper', ts[i], { g: .18, d: .25 });
          if (dest) { lay.op.opacidade = lt => lerp(.45, 1, mix(lt, i)); lay.op.filtro = lt => { const m = mix(lt, i); return m < .98 ? `blur(${(3 * (1 - m)).toFixed(1)}px) brightness(${lerp(.7, 1, m).toFixed(3)})` : ''; }; }
        } else {
          lay.op.entra = { k: 'canto', _t: ts[i], d: o.dEntra ?? 1.6, dx: de[i][0] * 1.5, dy: de[i][1] * 1.5, s0: 1.2, r0: (i % 2 ? 1 : -1) * 20 };
          cue(c, 'whoosh', ts[i] - .04, { g: .18, d: .3 });
        }
        return lay;
      });
      S.tFlash = o.flash ? eaT(c, o.flash) : F ? (dest ? dest[0][0] : .3) : ts[3] + .25;
      cue(c, 'riser', S.tFlash - .7, { g: .16, d: .7 }); cue(c, 'shutter', S.tFlash, { g: .5 });
      S.tSai = o.sai ? eaT(c, o.sai) : null;
      S.raios = el(r, 'div', 'position:absolute;inset:-400px;pointer-events:none;mix-blend-mode:screen;opacity:0;' +
        'background:repeating-linear-gradient(115deg, rgba(255,255,255,0) 0 160px, rgba(225,240,235,.16) 160px 230px, rgba(255,255,255,0) 230px 420px);filter:blur(22px);');
      const ks = o.cam ? o.cam(c) : [[0, { z: 1.08 }], [.6, { z: 1.0 }], [c.dur, { z: 1.07 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: o.boom ?? true, tr: o.tr ?? 'cut' });
      S.malha = 1; S.grao = 1; S.vig = .6; S.poeira = .7 * (F ? F.poeira : 1);
      eaFlashOnda(r, S, c, o);
    },
    update(S, c0) {
      const c = eaPoster(c0, o.posterize), lt = c.lt;
      let cam = eaRampa(c, S.camF(lt), o.rampa === undefined ? { zIn: -.45, rIn: 0, eIn: EA_RAPIDA, tin: Math.min(3, c.dur * .85) } : o.rampa);
      if (S.tSai !== null && lt > S.tSai) { const q = Math.pow(clamp((lt - S.tSai) / .5), 2.2); cam = { ...cam, r: cam.r - 12 * q, x: cam.x + 520 * q, y: cam.y - 700 * q }; }
      eaAplica(S.pal, S, c, cam);
      (S.upd || []).forEach(f => f(S, c)); eaOndaAplica(S, S.pal.el);
      const fl = lt >= S.tFlash && lt < S.tFlash + .1 ? 1 : 0;
      S.pal.el.style.filter = fl ? 'brightness(2.6) contrast(1.25)' : S._cor;
      S.raios.style.opacity = (clamp((lt - S.tFlash) / .5) * .9 * (S.foco ? .5 : 1)).toFixed(3);
      S.raios.style.transform = `translateX(${(-140 + 60 * lt).toFixed(1)}px)`;
    },
  });
}

// =================================================================================================================
//  10. SALA COM TV (foto real; o conteúdo da TV é o apresentador, um clipe ou uma foto) — começa na TV e recua; no fim mergulha
// =================================================================================================================
// salaTV(beats, {sala: 'f_tv_familia', tela: [x0, y0, x1, y1] (retângulo da tela na foto, em px da foto), conteudo: 'apresentador' | 'clip:x' | 'f_x',
//                cor: 'verde', z0: 3.2, mergulho: c => t (empurra para dentro da TV), tr, lead, boom, fy (enquadramento do apresentador),
//                clipDe: s (1º quadro do clipe na TV)})
// Clipe na TV = vídeo real: roda sempre a 30 q/s (o posterize: 16 da cena anda só a câmera) e nunca fica preso no último quadro.
// Motor foco (foco: true): o recuo fica centrado na TV (desce 150 em vez de 260 e não anda de lado), mão 3 px, sem tranco; com
//   mergulho a câmera não dá o chicote de saída (o mergulho já é a saída).
function salaTV(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor, presenter: o.conteudo === 'apresentador',
    build(r, S, c) {
      const F = eaFocoIni(S, c, o, { base: true, mao: 3, sai: o.mergulho ? false : undefined });
      const pal = eaPalco(r, S, { cor: 'neutro' });
      const a = eaAsset(o.sala ?? 'f_tv_familia');
      const sala = eaCamada(pal, S, o.sala ?? 'f_tv_familia', { cobre: true, folga: o.folga ?? 1.0, fx: o.fx ?? .5, fy: o.fy ?? .5, p: 1, vida: false });
      sala.op.base = eaCor(o.cor ?? 'verde');
      const k = sala.w / a.w, [x0, y0, x1, y1] = o.tela, ox = parseFloat(sala.inner.style.left), oy = parseFloat(sala.inner.style.top);
      const tw = (x1 - x0) * k, th = (y1 - y0) * k, tx0 = ox + x0 * k, ty0 = oy + y0 * k;
      S.tv = { x: tx0 + tw / 2, y: ty0 + th / 2, w: tw, h: th };
      const tela = el(document.createElement('div'), 'div', `position:relative;width:${tw.toFixed(1)}px;height:${th.toFixed(1)}px;overflow:hidden;border-radius:${(tw * .09).toFixed(1)}px;background:#000;`);
      if (o.conteudo === 'apresentador') { S.ph = photo(tela, 0, 0, tw, th, { border: 0, tape: false, fy: o.fyApres ?? .36, zoom: o.zApres ?? 1.25 }); S.photos.push(S.ph); }
      else if (o.conteudo) { const ehClip = o.conteudo.startsWith('clip:'); const im = el(tela, 'img', 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;');
        if (!ehClip) im.src = eaAsset(o.conteudo).src; else { S.clipIm = im; S.clipN = (window.CLIPN || {})[o.conteudo.slice(5)] ?? 60; } }
      el(tela, 'div', 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 2px, rgba(0,0,0,0) 2px 4px);mix-blend-mode:multiply;');
      el(tela, 'div', `position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 ${(tw * .18).toFixed(0)}px rgba(0,0,0,.85);background:radial-gradient(ellipse at 50% 45%, rgba(255,255,255,.08), rgba(0,0,0,0) 60%);`);
      S.telaLay = eaCamada(pal, S, null, { el: tela, x: S.tv.x, y: S.tv.y, w: tw, h: th, p: 1, vida: false, borrao: false });
      S.brilho = el(r, 'div', 'position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:.0;');
      const zTV = Math.min(1080 / tw, 1920 / th) * .82;
      const tm = o.mergulho ? eaT(c, o.mergulho) : null;
      const ks = o.cam ? o.cam(c) : [[0, { x: S.tv.x, y: S.tv.y, z: o.z0 ?? zTV }], [.75, { x: S.tv.x + (F ? 0 : 40), y: S.tv.y + (F ? 150 : 260), z: 1.12 }],
        ...(tm !== null ? [[tm, { z: 1.2 }, 'linear'], [c.dur, { x: S.tv.x, y: S.tv.y, z: zTV * 1.6 }, 'saida']] : [[c.dur, { z: 1.2 }, 'linear']])];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0, _semDeriva: tm !== null });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: o.boom ?? true, tr: o.tr ?? 'cut' });
      S.malha = o.conteudo === 'apresentador' ? .5 : 1; S.grao = 1; S.vig = .6; S.poeira = .45 * (F ? F.poeira : 1);
      eaFlashOnda(r, S, c, o);
    },
    update(S, c0) {
      const c = eaPoster(c0, o.posterize);
      eaAplica(S.pal, S, c, eaRampa(c, S.camF(c.lt), o.mergulho ? { zOut: 1, rOut: 0, ...(o.rampa || {}) } : o.rampa));
      (S.upd || []).forEach(f => f(S, c)); eaOndaAplica(S, S.pal.el);
      // vídeo real na TV: sempre a 30 q/s no tempo da cena SEM posterize (o posterize anda só a câmera) e nunca preso no fim
      if (S.clipIm) { const f = eaClipQuadro(S.clipN, c0.lt, { de: o.clipDe, tS: 0, fim: eaCenaFim(c0), nome: o.conteudo.slice(5) }); S.clipIm.src = `clips/${o.conteudo.slice(5)}/${String(f + 1).padStart(4, '0')}.jpg`; }
    },
  });
}

// =================================================================================================================
//  12. APRESENTADOR limpo em tela cheia (sem malha, grão nem cor do formato), punch-in seco numa palavra, etiqueta na 1ª vez
// =================================================================================================================
// presEA(beats, {z: 1.0, fy: .40, punch: 1.08, tPunch: c => t, etiqueta: {txt: 'Fernando Miranda', t: c => t, x, y}, fechadura: {...}, tr, lead})
function presEA(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'cut', bg: 'dark', presenter: true, camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const tp = o.tPunch ? eaT(c, o.tPunch) : Math.min(1.0, c.dur * .45);
      S.ph = photo(r, -40, -30, 1160, 1980, { border: 0, tape: false, fy: o.fy ?? .40 });
      S.photos.push(S.ph); S.ph.zoomFn = lt => (o.z ?? 1) * lerp(1, o.punch ?? 1.08, E.out5(clamp((lt - tp) / .16))) * (o.z0 ? lerp(o.z0, 1, EA_ARRANQUE(clamp(lt / .5))) : 1);
      if (o.etiqueta) {
        const et = o.etiqueta, s = et.s ?? 50, w = eaLarg(et.txt, s, EA_SANS, 600) + s * 1.1;
        const fake = { L: el(r, 'div', 'position:absolute;left:0;top:0;width:0;height:0;z-index:2;'), cx: et.x ?? 540, cy: et.y ?? 1330 };
        eaEtiqueta(fake, S, c, { ...et, dx: 0, dy: 0, s });
      }
      if (o.fechadura) eaFechadura(r, S, { ...o.fechadura, t: eaT(c, o.fechadura.t) ?? 0 });
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: !!o.boom, tr: o.tr ?? 'cut' });
      S.malha = 0; S.grao = 0; S.vig = o.fechadura ? .5 : 0; S.poeira = 0;
    },
    update(S, c) { (S.upd || []).forEach(f => f(S, c)); if (o.update) o.update(S, c); },
  });
}

// =================================================================================================================
//  13. FINAL: perfil REAL num monitor antigo, barra de endereço digitando o @ e o botão Seguir -> Seguindo
// =================================================================================================================
// perfilEA(beats, {perfil: 'perfil_fernandomiranda777', usuario: 'fernandomiranda777', tDigita: c => t, tSeguir: c => t, tr, lead})
// Motor foco (foco: true): a barra de endereço tem letra de 40 px e cada letra já tem o seu lugar (a digitação acende, nada anda);
//   o botão Seguir só pousa .7 s antes do toque e a barra apaga (.3) quando ele aparece: um texto por vez.
function perfilEA(beats, o = {}) {
  scene({
    beats, tr: o.tr ?? 'ea:sobe', bg: 'dark', camMove: camStill, lead: o.lead, trDur: o.trDur, trCor: o.trCor,
    build(r, S, c) {
      const F = eaFocoIni(S, c, o, { focos: [[0, 540, 900, 1.06]] });
      const pal = eaPalco(r, S, { cor: 'neutro' });
      const f = el(document.createElement('div'), 'img', ''); f.src = eaTexParede(); f.style.cssText = 'width:1400px;height:2400px;filter:sepia(.4) hue-rotate(60deg) saturate(1.2) brightness(.7);';
      eaCamada(pal, S, null, { el: f, x: 540, y: 960, w: 1400, h: 2400, p: .8, vida: false, borrao: false });
      const mon = el(document.createElement('div'), 'div', 'position:relative;width:860px;height:1180px;background:linear-gradient(#dcd3bd,#bfb49a);border-radius:46px;padding:60px 54px 150px;box-shadow:0 40px 80px rgba(0,0,0,.6), inset 0 -10px 30px rgba(0,0,0,.25);');
      const tela = el(mon, 'div', 'position:relative;width:100%;height:100%;border-radius:30px;overflow:hidden;background:#0d0d0d;box-shadow:inset 0 0 60px rgba(0,0,0,.9);');
      const a = AS(o.perfil ?? 'perfil_fernandomiranda777');
      if (a) { const hp = 752 * a.h / a.w, y0 = 470 - hp / 2 - 40;            // print centrado na tela, botão Seguir logo abaixo
        const im = el(tela, 'img', `position:absolute;left:0;top:${y0.toFixed(0)}px;width:100%;`); im.src = a.src; S.pf = im;
        S.bt = el(tela, 'div', `position:absolute;left:120px;right:120px;top:${(y0 + hp + 36).toFixed(0)}px;height:78px;border-radius:16px;background:#0095f6;color:#fff;` +
          `font-family:${EA_SANS};font-weight:700;font-size:36px;line-height:78px;text-align:center;`, 'Seguir'); }
      const sb = F ? 40 : 26, hb = F ? 76 : 56;
      S.barra = el(tela, 'div', `position:absolute;left:26px;right:26px;top:18px;height:${hb}px;border-radius:${hb / 2}px;background:rgba(255,255,255,.14);backdrop-filter:blur(6px);` +
        `font-family:${EA_SANS};font-weight:600;font-size:${sb}px;color:#fff;line-height:${hb}px;padding-left:26px;white-space:nowrap;overflow:hidden;`);
      el(tela, 'div', 'position:absolute;inset:0;background:repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 2px, rgba(0,0,0,0) 2px 4px);pointer-events:none;');
      eaCamada(pal, S, null, { el: mon, x: 540, y: 900, w: 860, h: 1180, p: 1, vida: 1 });
      S.url = `instagram.com/${o.usuario ?? 'fernandomiranda777'}`;
      if (F) {               // foco: letras no lugar (a digitação acende) e o cursor é uma barra fina, não texto
        S.lUrl = [...S.url].map(ch => el(S.barra, 'span', 'opacity:0;', esc(ch)));
        S.cur = el(S.barra, 'div', `position:absolute;top:${(hb * .2).toFixed(0)}px;width:3px;height:${(hb * .6).toFixed(0)}px;background:#fff;`);
        S.sb = sb;
      }
      S.tDig = eaT(c, o.tDigita) ?? .5; S.tSeg = o.tSeguir ? eaT(c, o.tSeguir) : null;
      for (let k = 0; k < S.url.length; k += 2) cue(c, 'key', S.tDig + k / 24, { g: .1 });
      if (S.tSeg !== null) cue(c, 'click', S.tSeg, { g: .4 });
      if (o.batida !== false) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaBatida' });       // batida de ~81 BPM só no final (trilha_earn.py)
      const ks = o.cam ? o.cam(c) : [[0, { z: 1.25, y: 1000 }], [.6, { z: 1.04, y: 940 }], [c.dur, { z: 1.12, y: 900 }, 'linear']];
      S.camF = eaKf(ks, { x: 540, y: 960, z: 1, r: 0 });
      eaComGolpes(S, c, o);
      if (c.t0 > 0) EVENTS.push({ t: +c.t0.toFixed(3), type: 'eaCorte', boom: o.boom ?? true, tr: o.tr ?? 'ea:sobe' });
      S.malha = 1; S.grao = 1; S.vig = .5;
    },
    update(S, c) {
      eaAplica(S.pal, S, c, eaRampa(c, S.camF(c.lt), o.rampa));
      const n = clamp(Math.floor((c.lt - S.tDig) * 24) + 1, 0, S.url.length);
      if (S.lUrl) {
        S.lUrl.forEach((e, k) => { e.style.opacity = k < n ? 1 : 0; });
        S.cur.style.left = `${(26 + eaLarg(S.url.slice(0, n), S.sb, EA_SANS, 600) + 3).toFixed(1)}px`;
        S.cur.style.opacity = n < S.url.length && c.lt > S.tDig - .3 ? 1 : 0;
      } else S.barra.textContent = S.url.slice(0, n) + (n < S.url.length && c.lt > S.tDig - .3 ? '|' : '');
      if (S.bt) { const seg = S.tSeg !== null && c.lt >= S.tSeg; S.bt.textContent = seg ? 'Seguindo' : 'Seguir'; S.bt.style.background = seg ? '#3a3a3c' : '#0095f6';
        let sc = S.tSeg !== null ? 1 - .06 * Math.sin(Math.PI * clamp((c.lt - S.tSeg + .08) / .16)) : 1;
        if (S.foco && S.tSeg !== null) {      // foco: o botão pousa .7 s antes do toque e a barra vira textura
          const u = clamp((c.lt - (S.tSeg - .7)) / .22); S.bt.style.opacity = clamp(u * 5).toFixed(3); sc *= lerp(1.08, 1, E.out5(u));
          S.barra.style.opacity = lerp(1, S.foco.apagado, clamp((c.lt - (S.tSeg - .7)) / .15)).toFixed(3);
        }
        S.bt.style.transform = `scale(${sc.toFixed(3)})`; }
    },
  });
}

// ---------- som: a trilha_earn.py lê os eventos 'eaCorte' (swish em todo corte, boom nas viradas de mundo) ----------
// Para forçar um boom fora de corte: EVENTS.push({t: c.t0 + tempo, type: 'eaBoom'}) dentro do build.
function eaBoom(c, t, g = 1) { EVENTS.push({ t: +(c.t0 + t).toFixed(3), type: 'eaBoom', g }); }

// ============================================================================
//  VIDA NA FOTO PARADA (02/11/2026; portado da vox-edit2, onde o A/B foi aprovado: "B aprovado, aplica"; teste projetos/teste_vida)
//  Lições do tutorial do projeto After Effects "Lamborghini vs Ferrari" da EarnEdits ("mask layers + expressions"), no palco do mundo:
//   - vdAdesivo   recorte/impressão/palavra que NASCE como papel em 5 quadros (máscara torta redesenhada quadro a quadro) +
//                 borda branca irregular (Simple Choker −50 + Roughen Edges "cut") que aparece 1 quadro depois
//   - vdCarro     carro de UMA foto de perfil: rodas recortadas em círculo girando pela distância andada, quique e inclinação
//                 pela aceleração, tremida do motor, sombra de contato; troca = corte casado (a mesma foto envelhecida)
//   - vdEsteira   fundo/estrada infinitos (Motion Tile + loopOut("continue")), postes passando
//   - vdBoneco    personagem de UMA foto de perfil: cabeça, tronco e pernas por máscara; caminhada por fórmula (sen/cos do
//                 tempo × velocidade, perna ±20°, tronco quicando) e cabeça girando no pescoço; rota: lt => [x, y] anda pelo mundo
//   - vdPorta     porta de enrolar recortada da fachada subindo aos trancos, com o interior atrás
//   - vdMove      move uma camada do palco (eaCamada põe o inner por left/top e gira em volta de cx/cy): use em S.pre
//   - acabamento retrô em todo mundo (retro: false desliga): borda desfocada (máscara invertida com feather) e cintilação de
//                 exposição a 13 q/s, MAIS LEVES que na vox-edit2 (o earn já tem grade de 6 px, ruído, brilho tremendo e vinheta);
//                 a retícula fica DESLIGADA por padrão (7 px sobre a grade de 6 px faz moiré): retro: {reticula: .1} liga
//  Uso: no build(r, S, c) do mundo, vdX(S.pal, S, 'asset', {...}); tempos aceitam número ou c => tempo. O eaAplica chama S.pre antes
//  de aplicar o quadro (posições que andam). Os bonecos andam a 13 q/s (stop-motion); a câmera (golpes/eaRampa) não muda.
// ============================================================================
const VD = { fps: 13 };
const vdQ = lt => Math.floor(lt * VD.fps + 1e-6) / VD.fps;          // tempo em stop-motion
const vdSombra = (k = 1, a = 1) => `drop-shadow(${(9 * k).toFixed(0)}px ${(13 * k).toFixed(0)}px ${(3 * k).toFixed(0)}px rgba(0,0,0,${(.34 * a).toFixed(2)})) ` +
  `drop-shadow(${(24 * k).toFixed(0)}px ${(34 * k).toFixed(0)}px ${(12 * k).toFixed(0)}px rgba(0,0,0,${(.22 * a).toFixed(2)})) ` +
  `drop-shadow(${(46 * k).toFixed(0)}px ${(64 * k).toFixed(0)}px ${(28 * k).toFixed(0)}px rgba(0,0,0,${(.14 * a).toFixed(2)}))`;
// move uma camada do palco: o inner vai por left/top, o pivô (cx, cy) acompanha e o _prev do borrão também (a camada andando
// sozinha não borra; só a câmera borra, como antes)
function vdMove(lay, x, y = lay.cy) {
  const dx = x - lay.cx, dy = y - lay.cy, fx = lay.op.fx ?? .5, fy = lay.op.fy ?? .5;
  lay.x = lay.cx = x; lay.y = lay.cy = y;
  lay.inner.style.left = `${(x - lay.w * fx).toFixed(1)}px`; lay.inner.style.top = `${(y - lay.h * fy).toFixed(1)}px`;
  if (lay._prev && lay._prev.z) { lay._prev.X += dx * lay._prev.z; lay._prev.Y += dy * lay._prev.z; }
}
// camada de um elemento no palco (eaCamada com op.el), com entra/sai/ate/foco resolvidos no 1º quadro (como o mundo faz nas camadas)
function vdCamada(pal, S, e, o, w, h) {
  const op = { ...o, el: e, w, h, base: [o.base || '', o._base || ''].join(' ').trim() || undefined };
  delete op._base;
  const lay = eaCamada(pal, S, null, op);
  if (o.atras && S.fundo) pal.el.insertBefore(lay.L, S.fundo.L.nextSibling);
  (S.pre = S.pre || []).push((S_, c) => {
    if (op._ok) return; op._ok = 1;
    if (op.entra) op.entra = { ...op.entra, _t: eaT(c, op.entra.t) ?? 0 };
    if (op.sai) op.sai = { ...op.sai, _t: eaT(c, op.sai.t) };
    if (op.apaga) op._apaga = { a: S_.foco ? S_.foco.apagado : .3, d: .25, foco: 4, ...op.apaga, t: eaT(c, op.apaga.t) };   // motor foco
    if (op.foco) op._foco = op.foco.map(([t, v]) => [eaT(c, t), v]);
    if (op.ate !== undefined) op._ate = eaT(c, op.ate);
  });
  return lay;
}

// ---------- filtros SVG: borda de papel irregular ----------
function vdDefs() {
  if (document.getElementById('vdDefs')) return;
  const s_ = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s_.id = 'vdDefs'; s_.setAttribute('width', '0'); s_.setAttribute('height', '0'); s_.style.position = 'absolute';
  // borda: alfa dilatado (choker negativo) + ruído deslocando a borda (roughen edges) + cor de papel; o recorte vai por cima
  const borda = (id, r, esc, freq) => `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="${r}" result="d"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="7" result="n"/>` +
    `<feDisplacementMap in="d" in2="n" scale="${esc}" xChannelSelector="R" yChannelSelector="G" result="rd"/>` +
    `<feFlood flood-color="#f4f1ea"/><feComposite in2="rd" operator="in"/></filter>`;
  s_.innerHTML = borda('vdBorda', 14, 26, .03) + borda('vdBordaF', 9, 18, .045);
  document.body.appendChild(s_);
}
// polígono torto do quadro k da revelação (0..3; 4 = inteiro): 11 pontos em volta do centro, raio crescendo
function vdPoli(k, sem, cx = 50, cy = 50) {
  const R = [16, 38, 62, 86][k], n = 11, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + hrand(sem + k * 3.1) * .5, r = R * (.72 + hrand(sem + i * 1.7 + k * 9.3) * .56);
    pts.push(`${(cx + Math.cos(a) * r * 1.05).toFixed(1)}% ${(cy + Math.sin(a) * r).toFixed(1)}%`);
  }
  return `polygon(${pts.join(',')})`;
}
// quadro da revelação no tempo lt (−1 = ainda não nasceu, 4 = inteiro)
const vdQuadro = (lt, t) => lt < t ? -1 : Math.min(4, Math.floor((lt - t) * VD.fps + 1e-6));

// ---------- vdAdesivo: recorte (PNG com alfa) ou impressão que nasce como papel ----------
// vdAdesivo(pal, S, 'asset' | null, {x, y, w, p, rot, t (nascer), fino (borda fina: foto REAL impressa), sombra, vida, ate, filtro, atras,
//           txt: 'html' (adesivo de palavra), txtOp: {s, cor, fundo, fonte, peso, it}})
// Palavra: Poppins 900 na tinta sobre papel creme ('#f4f1ea') ou amarelo (EA.amarelo); chave com <i style="font-family:PlayfairItalic;color:#d8102a">
function vdAdesivo(pal, S, src, o = {}) {
  vdDefs();
  const t = o.t ?? 0;
  let w = o.w ?? 600, h, mk;
  const box = el(document.createElement('div'), 'div', '');
  if (o.txt) {            // palavra: o "recorte" é o próprio bloco de texto (fundo de papel com alfa nas bordas)
    const so = o.txtOp || {};
    mk = () => el(box, 'div', `position:absolute;left:0;top:0;padding:.1em .35em .18em;white-space:nowrap;font-family:${so.fonte ?? EA_SANS};` +
      `font-weight:${so.peso ?? 900};font-size:${so.s ?? 90}px;line-height:1.05;color:${so.cor ?? EA.tinta};${so.it ? 'font-style:italic;' : ''}` +
      `background:${so.fundo ?? '#f4f1ea'};`, o.txt);
    const med = mk(); med.style.visibility = 'hidden'; document.body.appendChild(box); w = med.offsetWidth; h = med.offsetHeight; box.remove(); med.remove();
  } else { const a = eaAsset(src); h = w * a.h / a.w; mk = () => { const im = el(box, 'img', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;`); im.src = a.src; if (o.filtro) im.style.filter = o.filtro; return im; }; }
  box.style.cssText = `width:${w}px;height:${h}px;`;
  const borda = mk(), fig = mk();
  borda.style.filter = `url(#${o.fino ? 'vdBordaF' : 'vdBorda'})`;
  if (o.txt) borda.style.color = 'transparent';
  const lay = vdCamada(pal, S, box, { vida: 1, ...o, filtro: undefined, entra: undefined, _base: o.sombra === false ? '' : vdSombra(o.sombra ?? .8) }, w, h);
  const sem = (o.x ?? 540) * .031 + (o.y ?? 960) * .017, r0 = o.rot ?? 0;
  S.pre.push((S_, c) => {
    const tt = eaT(c, t), kf_ = vdQuadro(c.lt, tt), kb = vdQuadro(c.lt, tt + 1 / VD.fps);
    box.style.visibility = kf_ < 0 ? 'hidden' : 'visible';
    fig.style.clipPath = kf_ >= 4 || kf_ < 0 ? '' : vdPoli(kf_, sem);
    borda.style.clipPath = kb >= 4 ? '' : kb < 0 ? 'inset(50%)' : vdPoli(kb, sem + .5);
    lay.rot = r0 + (kf_ >= 0 && kf_ < 4 ? (hrand(sem + kf_) - .5) * 7 : 0);      // a mão ajeitando o papel enquanto nasce
  });
  return lay;
}

// ---------- vdEsteira: faixa infinita (Motion Tile + loopOut("continue")) ----------
// vdEsteira(pal, S, 'asset' | null, {x, y, w, h, p, dist: lt => px andados, fator (paralaxe, 1), tom (filtro CSS), estrada: true
//           (asfalto desenhado), itens: {src, w, gap, y (relativo ao topo da faixa)} (postes passando)})
function vdEsteira(pal, S, src, o = {}) {
  const w = o.w ?? 1600, h = o.h ?? 400, f = o.fator ?? 1;
  const d = el(document.createElement('div'), 'div', `width:${w}px;height:${h}px;overflow:${o.itens ? 'visible' : 'hidden'};`);
  if (o.estrada) {
    d.style.background = `linear-gradient(180deg, #5d5a55 0 7%, #8c877d 7% 10%, #2f2e2c 10% 100%)`;
    const ruido = el(d, 'div', `position:absolute;inset:0;opacity:.45;mix-blend-mode:overlay;background-image:url(${eaGraoTile()});background-size:256px 256px;`);
    const faixa = el(d, 'div', `position:absolute;left:-400px;right:-400px;top:${(h * .56).toFixed(0)}px;height:${Math.round(h * .05)}px;` +
      `background:repeating-linear-gradient(90deg, #e9e3d2 0 160px, rgba(0,0,0,0) 160px 300px);opacity:.9;`);
    d._mov = [[ruido, .5, 256], [faixa, 1, 300]];
  } else {
    const a = eaAsset(src);
    d.style.backgroundImage = `url(${a.src})`; d.style.backgroundSize = `${(h * a.w / a.h).toFixed(0)}px ${h}px`; d.style.backgroundRepeat = 'repeat-x';
    d._mov = [[d, 1, h * a.w / a.h, true]];
  }
  const itens = [];
  if (o.itens) {
    const it = o.itens, a = eaAsset(it.src), iw = it.w, ih = iw * a.h / a.w, n = Math.ceil(w / it.gap) + 2;
    for (let i = 0; i < n; i++) { const im = el(d, 'img', `position:absolute;top:${(it.y ?? h - ih).toFixed(0)}px;width:${iw}px;height:${ih.toFixed(0)}px;`); im.src = a.src; itens.push(im); }
    d._it = { gap: it.gap, n };
  }
  const lay = vdCamada(pal, S, d, { vida: false, ...o, _base: o.tom || '' }, w, h);
  S.pre.push((S_, c) => {
    const x = (o.dist ? o.dist(vdQ(c.lt)) : 0) * f;
    d._mov.forEach(([e, k, per, bg]) => { const v = -((x * k) % per); if (bg) e.style.backgroundPosition = `${v.toFixed(1)}px 0`; else e.style.transform = `translateX(${v.toFixed(1)}px)`; });
    if (d._it) { const { gap, n } = d._it; itens.forEach((im, i) => { const px = ((i * gap - x) % (n * gap) + n * gap) % (n * gap) - gap; im.style.left = `${px.toFixed(1)}px`; }); }
  });
  return lay;
}

// ---------- vdCarro: carro de foto parada com as rodas girando ----------
// vdCarro(pal, S, 'asset', {x, y, w, p, rodas: [[cx, cy, r], ...] em px da imagem (medir_pecas.py carro), anda: lt => deslocamento x
//         (px), esteira: lt => px que a estrada andou (o carro parado e o chão correndo; a MESMA função do vdEsteira), quique (1),
//         motor (tremida, 1), troca: [[t, 'asset']] (corte casado: a mesma foto envelhecida), sombra, opacidade: lt => 0..1})
function vdCarro(pal, S, src, o = {}) {
  const a = eaAsset(src), w = o.w ?? 900, k = w / a.w, h = a.h * k;
  const box = el(document.createElement('div'), 'div', `width:${w}px;height:${h}px;`);
  const somb = el(box, 'div', `position:absolute;left:6%;right:6%;bottom:${(-h * .02).toFixed(0)}px;height:${(h * .09).toFixed(0)}px;border-radius:50%;` +
    `background:radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.55), rgba(0,0,0,0) 70%);filter:blur(6px);`);
  const corpo = el(box, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;transform-origin:50% 92%;`);
  const im = el(corpo, 'img', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;`); im.src = a.src;
  const rodas = [];
  (o.rodas || []).forEach(([cx, cy, r]) => {
    const R = r * k * (o.rRoda ?? .97), d = el(box, 'div', `position:absolute;left:${(cx * k - R).toFixed(1)}px;top:${(cy * k - R).toFixed(1)}px;width:${(2 * R).toFixed(1)}px;` +
      `height:${(2 * R).toFixed(1)}px;border-radius:50%;background-image:url(${a.src});background-size:${w}px ${h.toFixed(1)}px;` +
      `background-position:${(-(cx * k - R)).toFixed(1)}px ${(-(cy * k - R)).toFixed(1)}px;`);
    rodas.push({ d, R });
  });
  if (o.sombra !== false) corpo.style.filter = vdSombra(o.sombra ?? .5);
  const lay = vdCamada(pal, S, box, { vida: false, ...o }, w, h);
  const x0 = lay.cx, troca = (o.troca || []).map(([t, s]) => [t, eaAsset(s).src]);
  const D = lt => (o.anda ? o.anda(lt) : 0) + (o.esteira ? o.esteira(lt) : 0);
  S.pre.push((S_, c) => {
    const lt = vdQ(c.lt);
    vdMove(lay, x0 + (o.anda ? o.anda(lt) : 0));
    let s_ = a.src; troca.forEach(([t, s]) => { if (lt >= eaT(c, t)) s_ = s; });
    if (im._s !== s_) { im.src = s_; im._s = s_; rodas.forEach(r => r.d.style.backgroundImage = `url(${s_})`); }
    const ang = D(lt) / (rodas[0]?.R || 60) * 57.2958;
    rodas.forEach(r => { r.d.style.transform = `rotate(${ang.toFixed(1)}deg)`; });
    // aceleração (diferença finita no relógio da cena, 13 q/s) -> inclinação e quique da suspensão
    const dt = 1 / VD.fps, v = D(lt) - D(lt - dt), v0 = D(lt - dt) - D(lt - 2 * dt), acc = (v - v0) / dt;
    const alvo = clamp(-acc * .0016 * (o.quique ?? 1), -4, 4), motor = (o.motor ?? 1) * (Math.abs(v) > .5 ? 1.6 : .8) * Math.sin(lt * 97);
    corpo.style.transform = `translateY(${(motor - Math.abs(alvo) * 2.2).toFixed(2)}px) rotate(${alvo.toFixed(2)}deg)`;
    somb.style.transform = `scaleX(${(1 + Math.abs(alvo) * .01).toFixed(3)})`;
  });
  return lay;
}

// ---------- vdBoneco: personagem de uma foto, em partes ----------
// vdBoneco(pal, S, 'asset', {x, y, w, p, pescoco: [px, py], quadril: [px, py] (px da imagem; medir_pecas.py boneco), anda: lt => 0..1
//          (intensidade da caminhada), vel (passos/s, 1.7), dobra (graus da perna, 21), cabeca: lt => graus (negativo = olha para cima),
//          corpo: lt => graus, rota: lt => [x, y] (anda pelo mundo; no tempo de stop-motion), sombra})
function vdBoneco(pal, S, src, o = {}) {
  const a = eaAsset(src), w = o.w ?? 500, k = w / a.w, h = a.h * k;
  const box = el(document.createElement('div'), 'div', `width:${w}px;height:${h}px;`);
  const [nx, ny] = o.pescoco.map(v => v * k), [hx, hy] = o.quadril.map(v => v * k);
  const parte = (clip, ox, oy, extra = '') => { const d = el(box, 'div', `position:absolute;inset:0;transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px;clip-path:${clip};${extra}`);
    el(d, 'img', `position:absolute;inset:0;width:100%;height:100%;`).src = a.src; return d; };
  const pernaT = parte(`inset(${(hy - 6).toFixed(0)}px 0 0 0)`, hx, hy, 'filter:brightness(.72) saturate(.9);');
  const pernaF = parte(`inset(${(hy - 6).toFixed(0)}px 0 0 0)`, hx, hy);
  const tronco = el(box, 'div', `position:absolute;inset:0;transform-origin:${hx.toFixed(1)}px ${hy.toFixed(1)}px;`);
  const corpo = parte(`inset(${(ny - 4).toFixed(0)}px 0 ${(h - hy - 18).toFixed(0)}px 0)`, hx, hy); tronco.appendChild(corpo);
  const cab = parte(`inset(0 0 ${(h - ny - 10).toFixed(0)}px 0)`, nx, ny); tronco.appendChild(cab);
  const lay = vdCamada(pal, S, box, { vida: .4, ...o, _base: o.sombra === false ? '' : vdSombra(o.sombra ?? .6) }, w, h);
  const vel = o.vel ?? 1.7, dob = o.dobra ?? 21;
  S.pre.push((S_, c) => {
    const lt = vdQ(c.lt), A = o.anda ? o.anda(lt) : 0, ph = lt * vel * Math.PI * 2;
    if (o.rota) { const [x, y] = o.rota(lt); vdMove(lay, x, y); }
    const th = Math.sin(ph) * dob * A;                          // perna: Math.sin(time * speed) * amount (Z rotation do tutorial)
    pernaF.style.transform = `rotate(${(-th).toFixed(2)}deg)`; pernaT.style.transform = `rotate(${th.toFixed(2)}deg)`;
    const bob = -Math.abs(Math.cos(ph)) * 9 * A;                 // tronco: Math.cos no Y, sobe a cada passo
    tronco.style.transform = `translateY(${bob.toFixed(2)}px) rotate(${((o.corpo ? o.corpo(lt) : 0) + Math.sin(ph * 2) * .8 * A).toFixed(2)}deg)`;
    cab.style.transform = `rotate(${((o.cabeca ? o.cabeca(lt) : 0) + Math.sin(ph + .6) * 1.5 * A).toFixed(2)}deg)`;
  });
  return lay;
}

// ---------- vdPorta: fachada com a porta de enrolar recortada subindo ----------
// vdPorta(pal, S, 'fachada', {x, y, w, p, porta: [x0, y0, x1, y1] (px da imagem), t (abre), d (s, .9), dentro: 'asset' (o interior)})
// devolve {lay, caixa (div DENTRO da porta, em px da fachada na tela), k, jan}. O carro que sai = vdCarro criado DEPOIS, com opacidade.
function vdPorta(pal, S, src, o = {}) {
  const a = eaAsset(src), w = o.w ?? 1080, k = w / a.w, h = a.h * k;
  const [x0, y0, x1, y1] = o.porta.map(v => v * k);
  const box = el(document.createElement('div'), 'div', `width:${w}px;height:${h.toFixed(0)}px;`);
  const jan = el(box, 'div', `position:absolute;left:${x0.toFixed(0)}px;top:${y0.toFixed(0)}px;width:${(x1 - x0).toFixed(0)}px;height:${(y1 - y0).toFixed(0)}px;overflow:hidden;background:#0d0c0b;`);
  if (o.dentro) { const ad = eaAsset(o.dentro); const di = el(jan, 'img', `position:absolute;left:50%;top:50%;width:${((y1 - y0) * 1.25 * ad.w / ad.h).toFixed(0)}px;height:${((y1 - y0) * 1.25).toFixed(0)}px;transform:translate(-50%,-52%);`); di.src = ad.src; }
  const caixa = el(jan, 'div', `position:absolute;inset:0;`);
  const folha = el(jan, 'div', `position:absolute;inset:0;background-image:url(${a.src});background-size:${w}px ${h.toFixed(1)}px;background-position:${(-x0).toFixed(1)}px ${(-y0).toFixed(1)}px;`);
  const sombraP = el(jan, 'div', `position:absolute;left:0;right:0;height:40px;background:linear-gradient(180deg, rgba(0,0,0,.6), rgba(0,0,0,0));`);
  const fach = el(box, 'img', `position:absolute;left:0;top:0;width:${w}px;height:${h.toFixed(0)}px;` +
    `clip-path:path(evenodd, 'M0 0 H${w} V${h.toFixed(0)} H0 Z M${x0.toFixed(0)} ${y0.toFixed(0)} H${x1.toFixed(0)} V${y1.toFixed(0)} H${x0.toFixed(0)} Z');`);
  fach.src = a.src;
  const lay = vdCamada(pal, S, box, { vida: false, ...o }, w, h);
  const H_ = y1 - y0;
  S.pre.push((S_, c) => {
    const lt = vdQ(c.lt), t = eaT(c, o.t ?? 0), u = clamp((lt - t) / (o.d ?? .9));
    const q = EA_ENTRA(u), trem = u > 0 && u < 1 ? Math.sin(lt * 61) * 3 : 0;   // a porta sobe aos trancos
    folha.style.transform = `translateY(${(-q * H_ * 1.02 + trem).toFixed(1)}px)`;
    sombraP.style.top = `${(H_ * (1 - q) - 2).toFixed(1)}px`; sombraP.style.opacity = q > 0 && q < 1 ? 1 : 0;
  });
  return { lay, caixa, k, jan: [x0, y0, x1, y1] };
}

// ---------- acabamento retrô (padrão em todo mundo; retro: false desliga): borda desfocada e cintilação; retícula opcional ----------
// mundo({retro: {blur: 5, pisca: .6, reticula: 0}}): blur = px da borda desfocada (vox-edit2: 7), pisca = fator da cintilação de
// exposição a 13 q/s (vox-edit2: 1), reticula = opacidade da retícula em overlay (vox-edit2: .16; aqui 0 porque a grade de 6 px já
// está por cima e 7 px sobre 6 px faz moiré). Direto no #stage, abaixo da grade (z 3): a grade e o ruído continuam nítidos.
// Só nas cenas mundo (S.retro); tipografia, jornal (regra 5) e apresentador (limpo) ficam sem.
const _vdRC = renderCaptions;
renderCaptions = function (t) {
  _vdRC(t);
  const S = (window.CUR_SCENE && CUR_SCENE.S) || {};
  let o = window._vdSob;
  if (!o) {
    const st = $('stage'), mk = (tag, css) => el(st, tag, 'position:absolute;pointer-events:none;display:none;' + css);
    o = window._vdSob = {
      b: mk('div', 'inset:0;z-index:3;' +
        '-webkit-mask-image:radial-gradient(ellipse 62% 54% at 50% 48%, rgba(0,0,0,0) 62%, #000 100%);mask-image:radial-gradient(ellipse 62% 54% at 50% 48%, rgba(0,0,0,0) 62%, #000 100%);'),
      h: mk('div', 'inset:0;z-index:3;mix-blend-mode:overlay;background-image:radial-gradient(circle at 50% 50%, #000 0 34%, rgba(0,0,0,0) 36%);background-size:7px 7px;'),
      f: mk('div', 'inset:0;z-index:3;mix-blend-mode:soft-light;'),
    };
  }
  const R = S.retro, on = !!R && !!S.pal;
  const op = { blur: 5, pisca: .6 * (S.foco && typeof R !== 'object' ? S.foco.pisca : 1), reticula: 0, ...(typeof R === 'object' ? R : {}) };   // foco: cintilação ×.4
  o.b.style.display = on && op.blur > 0 ? 'block' : 'none'; o.h.style.display = on && op.reticula > 0 ? 'block' : 'none'; o.f.style.display = on && op.pisca > 0 ? 'block' : 'none';
  if (!on) return;
  if (o.b._bl !== op.blur) { o.b.style.backdropFilter = o.b.style.webkitBackdropFilter = `blur(${op.blur}px)`; o.b._bl = op.blur; }
  o.h.style.opacity = op.reticula;
  const f = Math.floor(t * VD.fps), v = (hrand(f * 1.37 + 4.2) - .5) * 2 * op.pisca;
  o.f.style.background = v > 0 ? `rgba(255,248,230,${(v * .16).toFixed(3)})` : `rgba(0,0,0,${(-v * .14).toFixed(3)})`;
};
