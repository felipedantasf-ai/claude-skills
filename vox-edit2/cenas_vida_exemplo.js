// ============================================================================
//  cenas_vida_exemplo.js (vox-edit2) = as 5 cenas do teste A/B APROVADO "vida na foto parada" (projetos/teste_vida, 02/11/2026):
//  trecho 9,55–29,17 s do founded1 (José Vinícius, "Um carro novo costuma sair da concessionária… item de coleção"), 19,6 s,
//  sem apresentador. Vem depois de <xx>_a.js, <xx>_b.js e <xx>_c.js (componentes_edit2.js, que já tem os vd*).
//  Imagens: Qwen local com "recorte": true (carros de perfil, homem de perfil com as mãos no bolso, poste) + fachada, showroom,
//  paisagem (cortada e espelhada para emendar sem costura) e salão; carro envelhecido = edição por ref do carro novo (mesma
//  posição, as rodas casam). Fotos REAIS: f_fusca_4, f_opalass_4, f_maverick_4 (Commons, do founded1).
//  Coordenadas das peças: medir_pecas.py carro|boneco <png> (confira o _pecas.jpg).
// ============================================================================
const TV = {
  novo: { src: 'g_carro_novo', rodas: [[212, 614, 72], [811, 615, 72]], base: 686 },        // base = y do chão (px da imagem)
  velho: 'g_carro_velho',
  classico: { src: 'g_carro_classico', rodas: [[269, 600, 62], [804, 603, 62]], base: 666 },
  homem: { src: 'g_homem', pescoco: [483, 185], quadril: [500, 545] },
};
// y do centro do carro (caixa quadrada w×w) para a roda tocar o chão em yChao
const tvCarroY = (car, w, yChao) => yChao - (car.base / 1024 - .5) * w;

// S1 — "Um carro novo costuma sair da concessionária já começando a perder valor." a fachada da concessionária; no "costuma" a
// porta de enrolar sobe aos trancos, o carro novo está lá dentro; no "sair" ele sai andando para a direita (rodas girando, quique na
// parada) e a câmera vai atrás; no "perder valor" o adesivo de papel nasce sobre ele
e2Cena(['B07', 'B08', 'B09'], {
  fundo: 'e2_pardo',
  golpes: c => {
    const tc = c.w('B08', 'costuma'), ts = c.w('B08', 'sair'), tp = c.w('B09', 'perder'), d = c.dur;
    return { planos: [[-1, { x: 540, y: 1300, z: 1.3, r: -3 }], [-.15, { x: 540, y: 1150, z: 1.12 }, .8], [tc - .25, { x: 540, y: 1260, z: 1.3 }, .85],
      [ts + .1, { x: 900, y: 1380, z: 1.2, r: 1 }, .8], [ts + .85, { x: 1560, y: 1380, z: 1.22, r: 0 }, .85], [tp - .25, { x: 1560, y: 1320, z: 1.4, r: -1 }, .8],
      [d - .25, { x: 2100, y: 1380, z: 1.5, r: 3 }, .9]],
      golpes: [[ts + 1.25, 7]] };
  },
  build(M, S, c) {
    const tc = c.w('B08', 'costuma'), ts = c.w('B08', 'sair'), tp = c.w('B09', 'perder');
    // calçada de papel cinza à direita da fachada (para onde o carro sai)
    const cal = e2Caixa(M, S, { x: 2000, y: 1760, w: 1800, h: 260, p: 1 }).el;
    cal.style.background = '#b9b2a6'; cal.style.boxShadow = 'inset 0 10px 0 #9d968a';
    const P = vdPorta(M, S, 'g_concessionaria', { x: 540, y: 1100, w: 1500, p: 1, porta: [128, 352, 900, 888], t: tc - .1, d: .85, dentro: 'g_showroom' });
    const yChao = 1100 - 750 + 888 * (1500 / 1024) - 14, tSai = ts + .1, tPara = ts + 1.2;
    const car = vdCarro(M, S, TV.novo.src, { x: 540, y: tvCarroY(TV.novo, 820, yChao), w: 820, p: 1, rodas: TV.novo.rodas,
      anda: lt => lt < tSai ? 0 : 1020 * (u => u * u * (3 - 2 * u))(clamp((lt - tSai) / (tPara - tSai))),
      opacidade: lt => clamp((lt - (tc + .55)) / .15) });
    vdAdesivo(M, S, null, { txt: 'perdendo <i style="color:#b3160b">valor</i>', txtOp: { s: 96, fundo: '#ffd23a' }, x: 1560, y: 1220, p: 1, rot: -4, t: tp - .05 });
    e2Legenda(M, S, c, ['B07', 'B08'], { y: 320, s: 76, cor: E2.tinta, p: .1, chave: ['novo', 'concessionaria'] });
    cue(c, 'slam', tc, { g: .2 }); cue(c, 'paper', ts + .1, { g: .3 }); cue(c, 'crinkle', tp - .05, { g: .3, d: .35 });
  },
});

// S2 — "Depois envelhece, deprecia, fica mais barato," o carro na estrada infinita (paisagem e postes passando, asfalto correndo,
// rodas girando); no "envelhece" corte casado para a mesma foto envelhecida; cada palavra nasce como adesivo de papel
e2Cena(['B10', 'B11'], {
  fundo: 'e2_escuro_liso', tr: 'cut',
  golpes: c => {
    const te = c.w('B10', 'envelhece'), td = c.w('B10', 'deprecia'), tb = c.w('B11', 'mais'), d = c.dur;
    return { planos: [[-1, { x: 0, y: 1150, z: 1.25, r: -3 }], [-.12, { x: 540, y: 1180, z: 1.15 }, .8], [te - .2, { x: 520, y: 1100, z: 1.3, r: -1.5 }, .75],
      [td - .2, { x: 590, y: 1060, z: 1.22, r: 1.5 }, .75], [tb - .25, { x: 540, y: 1000, z: 1.1, r: 0 }, .8], [d - .22, { x: 540, y: 1950, z: 1.35, r: 3 }, .9]],
      golpes: [[te + .1, 6], [td + .1, 6]] };
  },
  build(M, S, c) {
    const te = c.w('B10', 'envelhece'), td = c.w('B10', 'deprecia'), tb = c.w('B11', 'mais');
    const vel = lt => 760 * (lt + 3);                     // px andados (o "loopOut continue" da estrada)
    vdEsteira(M, S, 'g_paisagem', { x: 540, y: 900, w: 3200, h: 1500, p: .55, dist: vel, fator: .22, tom: 'saturate(.85) contrast(1.05)' });
    vdEsteira(M, S, null, { x: 540, y: 1580, w: 3200, h: 330, p: 1, estrada: true, dist: vel, fator: 1,
      itens: { src: 'g_poste', w: 900, gap: 1150, y: -840 } });
    vdCarro(M, S, TV.novo.src, { x: 540, y: tvCarroY(TV.novo, 900, 1640), w: 900, p: 1, rodas: TV.novo.rodas, esteira: vel, troca: [[te - .05, TV.velho]] });
    const pal = [['envelhece', te, 330, 690, -5, '#f4f1ea'], ['deprecia', td, 760, 820, 4, '#f4f1ea'], ['mais <i style="color:#b3160b">barato</i>', tb, 540, 980, -2, '#ffd23a']];
    pal.forEach(([tx, t, x, y, rot, f]) => { vdAdesivo(M, S, null, { txt: tx, txtOp: { s: 92, fundo: f }, x, y, p: 1, rot, t: t - .05 }); cue(c, 'crinkle', t - .05, { g: .28, d: .3 }); });
  },
});

// S3 — "e durante anos segue exatamente esse caminho." papel quadriculado: a curva vermelha da depreciação descendo; o dono anda
// por cima dela (caminhada por fórmula, 13 q/s) e a câmera vai junto
e2Cena(['B12', 'B13'], {
  fundo: 'e2_quadriculado', fundoOp: { p: .5, folga: 2.6 },
  golpes: c => {
    const ta = c.w('B12', 'anos'), tx = c.w('B13', 'exatamente'), d = c.dur;
    return { planos: [[-1, { x: -100, y: 350, z: 1.2, r: -3 }], [-.12, { x: 100, y: 650, z: 1.1 }, .8], [ta - .55, { x: 420, y: 810, z: 1.15, r: 1 }, .85],
      [tx - .45, { x: 830, y: 1010, z: 1.2, r: -1 }, .85], [d - .25, { x: 1350, y: 1350, z: 1.3, r: 2 }, .9]], golpes: [] };
  },
  build(M, S, c) {
    // a curva: desce da esquerda para a direita (y = 700 + .5·(x+100)); traço de marcador vermelho
    const cv = e2Caixa(M, S, { x: 800, y: 1300, w: 2600, h: 2000, p: 1 }).el, sv = svgAbs(cv, 0, 0, 2600, 2000);
    const X = x => x - 800 + 1300, Y = y => y - 1300 + 1000, yL = x => 860 + .48 * (x + 100);
    S.curva = scribble(sv, `M ${X(-300)} ${Y(yL(-300))} L ${X(2100)} ${Y(yL(2100))}`, { c: E2.verm, w: 16 });
    const tw = -.2, tf = c.dur + .1, xa = -150, xb = 1300;
    S.hom = vdBoneco(M, S, TV.homem.src, { x: xa, y: yL(xa) - 272, w: 600, p: 1, ...TV.homem, anda: lt => 1, vel: 1.7, dobra: 21 });
    S.mov = lt => { const u = clamp((vdQ(lt) - tw) / (tf - tw)), x = lerp(xa, xb, u); return [x, yL(x) - 272]; };
    e2Legenda(M, S, c, ['B12', 'B13'], { y: 320, s: 80, cor: E2.tinta, p: .08, chave: ['anos', 'caminho'] });
  },
  update(S, c) { S.curva.draw(1); const [x, y] = window.VD_B ? S.mov(c.lt) : S.mov(1.3); vdMove(S.hom, x, y); },
});

// S4 — "Só que alguns modelos chegam num ponto em que essa curva para de cair e começa a subir." o dono chega ao ponto mais baixo e
// para; "alguns modelos" = três fotos REAIS de clássicos nascem como papel ao longo da curva; no "começa a subir" a curva vira
// para cima, a cabeça dele acompanha e a câmera sobe
e2Cena(['B14', 'B15', 'B16', 'B17'], {
  fundo: 'e2_quadriculado', fundoOp: { p: .5, folga: 2.6, tom: 'brightness(.97)' }, tr: 'cut',
  golpes: c => {
    const tm = c.w('B14', 'modelos'), tp = c.w('B15', 'ponto'), tcv = c.w('B16', 'curva'), ts = c.w('B17', 'comeca'), d = c.dur;
    return { planos: [[-1, { x: 300, y: 1500, z: 1.3, r: -3 }], [-.12, { x: 420, y: 1250, z: 1.15 }, .8], [tm - .2, { x: 520, y: 1050, z: .95, r: 1 }, .8],
      [tp - .25, { x: 560, y: 1320, z: 1.25, r: -1 }, .8], [tcv - .2, { x: 640, y: 1150, z: 1.0, r: 0 }, .85], [ts - .2, { x: 700, y: 1050, z: .82, r: 1.5 }, 1.0],
      [d - .25, { x: 860, y: -300, z: 1.2, r: -2 }, .9]], golpes: [[tp + .2, 8]] };
  },
  build(M, S, c) {
    const tm = c.w('B14', 'modelos'), tp = c.w('B15', 'ponto'), ts = c.w('B17', 'comeca');
    const cv = e2Caixa(M, S, { x: 540, y: 960, w: 2600, h: 3200, p: 1 }).el, sv = svgAbs(cv, 0, 0, 2600, 3200);
    const X = x => x - 540 + 1300, Y = y => y - 960 + 1600, xv = 620, yv = 1560;
    S.c1 = scribble(sv, `M ${X(-500)} ${Y(1000)} L ${X(xv)} ${Y(yv)}`, { c: E2.verm, w: 16 });
    S.c2 = scribble(sv, `M ${X(xv)} ${Y(yv)} Q ${X(xv + 160)} ${Y(yv - 40)} ${X(xv + 260)} ${Y(yv - 520)} T ${X(xv + 520)} ${Y(-500)}`, { c: E2.verm, w: 18 });
    S.ts = ts; S.tc2 = ts + .55;
    const fotos = [['f_fusca_4', 210, 1010, -6], ['f_opalass_4', 560, 900, 3], ['f_maverick_4', 900, 1050, -3]];
    fotos.forEach(([f, x, y, rot], i) => { vdAdesivo(M, S, f, { x, y, w: 380, p: 1, rot, t: tm - .1 + i * .14, fino: true, filtro: 'contrast(1.05) saturate(.9)' });
      cue(c, 'crinkle', tm - .1 + i * .14, { g: .22, d: .25 }); });
    const hx = xv - 120, ch = lt => lt < ts ? 0 : -24 * E2C.mola(clamp((lt - ts) / .5));
    S.hom = vdBoneco(M, S, TV.homem.src, { x: hx - 240, y: yv - 272, w: 600, p: 1, ...TV.homem, vel: 1.7, dobra: 21,
      anda: lt => lt < tp - .1 ? 1 : 0, cabeca: ch, corpo: lt => ch(lt) * .25 });
    S.mov = lt => { const u = clamp((vdQ(lt) + .3) / (tp - .1 + .3)); return [lerp(hx - 520, hx, u), lerp(yv - 272 - 132, yv - 272, u)]; };
    e2Legenda(M, S, c, ['B14', 'B15', 'B16', 'B17'], { y: 300, s: 76, cor: E2.tinta, p: .06, chave: ['modelos', 'ponto', 'cair', 'subir'] });
    cue(c, 'marker', ts, { g: .16, d: .5 });
  },
  update(S, c) {
    S.c1.draw(1); S.c2.draw(clamp((c.lt - S.ts) / (S.tc2 - S.ts)));
    const [x, y] = window.VD_B ? S.mov(c.lt) : S.mov(9); vdMove(S.hom, x, y);
  },
});

// S5 — "É aí que o carro deixa de ser apenas um meio de transporte e começa a virar um item de coleção." o clássico na estrada
// (meio de transporte: rodas, quique, estrada correndo); no "virar" a câmera chicoteia para cima até o salão escuro do colecionador,
// onde o mesmo carro já está parado no palco, sob o holofote que acende no "item"
e2Cena(['B18', 'B19', 'B20'], {
  fundo: 'e2_escuro1', tr: 'cut',
  golpes: c => {
    const tcar = c.w('B18', 'carro'), tt = c.w('B19', 'transporte'), tv = c.w('B20', 'virar'), ti = c.w('B20', 'item'), d = c.dur;
    return { planos: [[-1, { x: 540, y: 2300, z: 1.3, r: 3 }], [-.12, { x: 540, y: 1900, z: 1.1 }, .85], [tcar - .2, { x: 560, y: 1980, z: 1.3, r: -1 }, .8],
      [tt - .25, { x: 500, y: 1940, z: 1.12, r: 1 }, .8], [tv - .3, { x: 540, y: 380, z: .98, r: 0 }, .9], [ti - .1, { x: 540, y: 500, z: 1.25, r: -.5 }, 1.0],
      [d - .25, { x: 540, y: 500, z: 1.6, r: 0 }, .9]], golpes: [[tv + .45, 9]] };
  },
  build(M, S, c) {
    const tv = c.w('B20', 'virar'), ti = c.w('B20', 'item');
    const vel = lt => 900 * (lt + 2);
    // estrada embaixo (y ~ 1900): paisagem + asfalto + postes
    vdEsteira(M, S, 'g_paisagem', { x: 540, y: 1650, w: 3200, h: 1300, p: 1, dist: vel, fator: .25, tom: 'saturate(.8) brightness(.9)' });
    vdEsteira(M, S, null, { x: 540, y: 2260, w: 3200, h: 330, p: 1, estrada: true, dist: vel, itens: { src: 'g_poste', w: 900, gap: 1150, y: -840 } });
    vdCarro(M, S, TV.classico.src, { x: 540, y: tvCarroY(TV.classico, 900, 2320), w: 900, p: 1, rodas: TV.classico.rodas, esteira: vel });
    // salão em cima (y ~ 400): o mesmo carro parado no palco, holofote acendendo no "item"
    const SW = 1800, SY = 380, yPlat = SY - SW / 2 + 790 * SW / 1024;
    const sal = e2Item(M, S, 'g_salao', { x: 540, y: SY, w: SW, p: 1, sombra: false, vida: false });
    S.luz = e2Caixa(M, S, { x: 540, y: SY, w: SW, h: SW, p: 1 }).el;
    S.luz.style.background = 'radial-gradient(ellipse 30% 46% at 50% 44%, rgba(255,240,205,.55), rgba(255,240,205,0) 70%)'; S.luz.style.mixBlendMode = 'screen';
    S.vela = e2Caixa(M, S, { x: 540, y: SY, w: SW, h: SW, p: 1 }).el; S.vela.style.background = '#000';
    vdCarro(M, S, TV.classico.src, { x: 540, y: tvCarroY(TV.classico, 900, yPlat), w: 900, p: 1, rodas: TV.classico.rodas, sombra: .4 });
    S.ti = ti;
    e2Legenda(M, S, c, ['B18', 'B19'], { y: 330, s: 78, cor: E2.tinta, p: .06, chave: ['carro', 'transporte'], etiqueta: '#f4f1ea', ateFim: tv - .35 });
    e2Texto(M, S, 'um *item* de coleção', { x: 540, y: 90, s: 104, cor: E2.creme, corChave: E2.amar, t: ti - .05, d: .45, p: 1 });
    cue(c, 'slam', ti, { g: .22 });
  },
  update(S, c) {
    const lt = window.VD_B ? vdQ(c.lt) : c.lt, u = clamp((lt - S.ti) / .5);
    // holofote: no B acende piscando (exposição), no A só aparece
    const pisca = window.VD_B && u > 0 && u < 1 ? (hrand(Math.floor(lt * 13)) > .45 ? 1 : .2) : 1;
    S.vela.style.opacity = (.62 * (1 - u * pisca)).toFixed(3);
    S.luz.style.opacity = (u * pisca).toFixed(3);
  },
});
