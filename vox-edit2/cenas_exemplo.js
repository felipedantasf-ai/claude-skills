// ============================================================================
//  cenas_exemplo.js (vox-edit2) = a demo do teste_edit2: trecho B19–B40 do ChinaCapitalismo (audio1031), 38 s, 7 cenas.
//  Vem depois de <xx>_a.js (vox-editorial), <xx>_b.js (premium_vox.js) e <xx>_c.js (componentes_edit2.js).
//  Trecho: o trecho B19–B40 do ChinaCapitalismo (audio1031, voz do Felipe + HeyGen P3)
//  Material REAL: impressões do audio1031 (Mao, Livro Vermelho, comuna, fornalha) e trechos de arquivo do audio1031_cinema
//  (New China TV 1949; China Leaps Forward 1958; AP Archive 1976). Dados conferidos no audio1031 (Banco Mundial; Grande Fome).
// ============================================================================

// S1 — "De 1949 a 1976, Mao Zedong aplicou na China a cartilha socialista ao pé da letra." lousa escura; a tira amarela do Collage Kit
// se abre e os anos sobem deslizando (Range Offset) com a barra vermelha crescendo entre eles; no "Mao" a câmera recua e o Mao de 1949
// (trecho REAL, 13 q/s) chega na moldura com fita, vindo da direita com sombra longa; no "cartilha" o Livro Vermelho desliza da esquerda
e2Cena(['B19', 'B20', 'B21', 'B22'], {
  fundo: 'e2_escuro1',
  rig: { mov: c => {
    const tm = c.w('B21', 'mao'), d = c.dur;
    return [[0, 1.4, { z: 1.16 }, 'cam', true], [.2, tm + .2, { y: -60 }, 'lin'], [tm - .3, tm + 1.1, { z: .95, y: 90 }, 'cam'],
      [tm + .6, d + .5, { z: 1.06, x: 20 }, 'lin'], [d - .45, d + .9, { z: 1.18 }, 'cam']];
  } },
  build(M, S, c) {
    const t49 = c.w('B19', '1949') - .12, t76 = c.w('B20', '1976') - .12, tm = c.w('B21', 'mao') - .1, tc = c.w('B21', 'cartilha') - .1;
    const sai = { t: tm - .15, para: 'esq', d: .5 };
    // abertura do projeto: as duas cortinas de papel do Collage Kit se abrem nas laterais e saem no "Mao"
    e2Kit(M, S, 'cortina_1', { x: 150, y: 900, w: 820, t: -.15, p: .9, sombra: .8, sai: { t: tm - .2, para: 'esq', d: .5 } });
    e2Kit(M, S, 'cortina_2', { x: 930, y: 900, w: 820, t: -.05, p: .9, sombra: .8, sai: { t: tm - .2, para: 'dir', d: .5 } });
    e2Kit(M, S, 'tira_4', { x: 540, y: 900, w: 1000, t: -.7, rot: -3, p: .95, sai });
    e2Anos(M, S, [[1949, t49], [1976, t76]], { x: 540, y: 860, s: 150, cor: E2.tinta, barra: E2.verm, p: 1, sai });
    e2Moldura(M, S, 'clip:mao_1949', { x: 560, y: 1130, w: 760, p: 1, rot: 3, pos: '50% 28%', clip: { t0: tm, de: 20 },
      entra: { de: 'dir', t: tm, d: 1.0, dist: 1100, r0: 14 } });
    e2Item(M, S, 'print_livro', { x: 290, y: 1590, w: 330, p: 1.05, rot: -9, borda: true, entra: { de: 'esq', t: tc, d: .8, dist: 900, r0: -20 } });
    e2Texto(M, S, 'Mao *Zedong*', { x: 540, y: 340, s: 116, cor: E2.creme, corChave: E2.amar, t: tm + .05, d: .45, sai: 'esfarela', tSai: tc - .15 });
    e2Texto(M, S, 'a *cartilha* socialista', { x: 540, y: 330, s: 96, cor: E2.creme, corChave: '#ff5a3c', t: tc, d: .5 });
    e2Texto(M, S, 'ao pé da letra', { x: 540, y: 445, s: 72, cor: E2.creme, t: c.w('B22', 'ao') - .05, d: .4, it: true });
    cue(c, 'crinkle', -.05, { g: .3, d: .4 }); cue(c, 'paper', tm, { g: .34 }); cue(c, 'shutter', tm + .5, { g: .14 }); cue(c, 'paper', tc, { g: .3 });
  },
});

// S2 — "Aboliu a propriedade privada, estatizou empresas, perseguiu a iniciativa privada e impôs a igualdade material forçada no
// campo." papel cinza (a mesa da vox): cada ação abre uma tira de papel de cor (vermelha, azul, laranja) com a frase em cima, no tempo
// dela, e um risco vermelho à mão; no "igualdade" a câmera desce até a comuna de 1958 (trecho REAL) que sobe na polaroide
e2Cena(['B23', 'B24', 'B25', 'B26'], {
  fundo: 'e2_cinza', fundoOp: { tom: 'brightness(.94) contrast(1.04)' },
  rig: { mov: c => {
    const tq = c.b('B26'), d = c.dur;
    return [[0, 1.2, { z: 1.18, r: -2 }, 'cam', true], [.2, tq + .2, { y: 120 }, 'lin'], [tq - .2, tq + 1.2, { y: 760, z: .96 }, 'cam'],
      [d - .45, d + .9, { z: 1.18 }, 'cam']];
  } },
  build(M, S, c) {
    const it = [['B23', 'tira_4', 'aboliu a *propriedade* privada', 560, -3], ['B24', 'tira_3', '*estatizou* empresas', 800, 2], ['B25', 'tira_2', 'perseguiu a *iniciativa* privada', 1040, -2]];
    S.sv = e2Caixa(M, S, { x: 540, y: 960, p: 1 }).el;
    const sv = svgAbs(S.sv, 0, 0, 1080, 1920);
    S.R = [];
    it.forEach(([b, kit, txt, y, rot], i) => {
      const t = i ? c.b(b) - .08 : -.6, claro = kit === 'tira_3';
      e2Kit(M, S, kit, { x: 540, y, w: 1040, t, rot, p: 1, sombra: .5 });
      e2Texto(M, S, txt, { x: 540, y: y - 4, s: 70, cor: claro ? '#fbf7ee' : E2.tinta, corChave: claro ? E2.amar : '#b3160b', t: Math.max(t + .32, -.05), d: .45, larg: 980,
        sombra: 'suave', rot });
      S.R.push([scribble(sv, `M 120 ${y + 48} q 400 ${16 - i * 8} 840 -6`, { c: E2.verm, w: 8 }), c.e(b) - .35]);
      cue(c, 'crinkle', t, { g: .26, d: .35 }); cue(c, 'marker', c.e(b) - .35, { d: .25, g: .14 });
    });
    const tq = c.b('B26') - .1;
    e2Moldura(M, S, 'clip:comuna58', { x: 560, y: 1850, w: 680, p: 1, rot: 2, clip: { t0: tq, de: 30 }, entra: { de: 'baixo', t: tq, d: 1.0, dist: 900 } });
    e2Fala(M, S, c, ['B26'], { x: 540, y: 1320, s: 76, chave: ['igualdade', 'forcada'], linha: 22, cor: E2.tinta });
    cue(c, 'paper', tq, { g: .32 });
  },
  update(S, c) { S.R.forEach(([r, t]) => r.draw(clamp((c.lt - t) / .3))); },
});

// S3 — "O resultado econômico foi um desastre sem precedentes." lousa que FERVE (grunge em stop-motion) com a fornalha de aço de 1958
// (trecho REAL) em P&B por trás; no "desastre" a palavra cai com bounce e as chamas de papel se abrem dos dois lados; na saída a
// palavra esfarela (Scatterize)
e2Cena(['B27', 'B28'], {
  fundo: 'ferve:concrete02', fundoOp: { tom: 'brightness(.55) contrast(1.2)' },
  rig: { z0: 1.3, dy: -40, saiZ: 1.25 },
  build(M, S, c) {
    const td = c.w('B27', 'desastre') - .1;
    e2Item(M, S, 'clip:aco58', { x: 540, y: 820, w: 1000, iw: 1080, ih: 818, p: .9, rot: -2, borda: true, filtro: 'grayscale(1) contrast(1.25) brightness(.9)',
      clip: { t0: -.2, de: 60 }, entra: { de: 'frente', t: -.2, d: .9, s0: 1.4 } });
    e2Tinta(M, S, 'e2_tinta1', { x: 540, y: 1300, w: 1300, p: 1, op: .95, inverte: true, modo: 'screen' });
    e2Kit(M, S, 'fogo_1', { x: 190, y: 1230, w: 470, t: td + .05, rot: -10, p: 1.05 });
    e2Kit(M, S, 'fogo_2', { x: 890, y: 1260, w: 440, t: td + .15, rot: 8, p: 1.05 });
    e2Texto(M, S, 'o resultado econômico foi um', { x: 540, y: 1180, s: 72, cor: E2.creme, t: c.b('B27') - .02, d: .6, larg: 1000, sai: 'some', tSai: td });
    e2Texto(M, S, 'DESASTRE', { x: 540, y: 1320, s: 164, fonte: 'disp', cor: E2.verm, t: td, anima: 'cai', d: .3, larg: 1000, sai: 'esfarela', tSai: c.dur - .35 });
    e2Texto(M, S, 'sem precedentes', { x: 540, y: 1470, s: 80, cor: E2.creme, it: true, t: c.w('B28', 'sem') - .05, d: .45, larg: 900, sai: 'esfarela', tSai: c.dur - .3 });
    cue(c, 'slam', td + .3, { g: .2 }); cue(c, 'crinkle', td + .05, { g: .24, d: .4 });
  },
});

// S4 — "A coletivização das fazendas gerou a maior fome da história humana, matando mais de 30 milhões de pessoas." pergaminho; a
// impressão REAL do refeitório da comuna desliza da esquerda com sombra longa; no "fome" a câmera desce até o número, que conta até
// 30 milhões; a fonte (estimativas de 15 a 55 milhões) entra em letra pequena
e2Cena(['B29', 'B30', 'B31'], {
  fundo: 'e2_pergaminho', fundoOp: { tom: 'saturate(.9) brightness(1.02)' }, janela: .4,
  rig: { mov: c => {
    const tf = c.w('B30', 'fome'), d = c.dur;
    return [[0, 1.3, { z: 1.2, x: -60 }, 'cam', true], [tf - .4, tf + 1.0, { y: 520, z: 1.04 }, 'cam'], [.3, d + .3, { x: 40 }, 'lin'], [d - .45, d + .9, { z: 1.2, r: 3 }, 'cam']];
  } },
  build(M, S, c) {
    const tc = -.3, t3 = c.w('B31', '30') - .1, tf = c.w('B30', 'fome') - .15;
    e2Item(M, S, 'print_comuna', { x: 540, y: 820, w: 860, p: 1, rot: -3, borda: true, filtro: 'sepia(.25) contrast(1.08)', entra: { de: 'esq', t: tc, d: 1.0, dist: 1200, r0: -12 } });
    e2Texto(M, S, 'a *coletivização* das fazendas', { x: 540, y: 340, s: 84, cor: E2.tinta, corChave: '#b3160b', t: c.w('B29', 'coletivizacao') - .1, d: .5, larg: 1000, sai: 'esfarela', tSai: tf + .3 });
    e2Texto(M, S, 'gerou a maior *fome* da história', { x: 540, y: 1270, s: 80, cor: E2.tinta, corChave: '#b3160b', t: c.w('B29', 'gerou') - .1, d: .6, larg: 1000 });
    const cx = e2Caixa(M, S, { x: 540, y: 1560, w: 1080, h: 420, p: 1 });
    S.n = serifText(cx.el, '0', 540, 150, { s: 150, c: E2.verm, sh: 'none', wt: 700 }); S.n.style.textShadow = e2SombraTxt(1.2);
    S.nf = fonte(cx.el, 'Grande Fome, 1959–1961 · estimativas dos historiadores: 15 a 55 milhões de mortes', 540, 300, { s: 24, wrap: 860 });
    S.t3 = t3;
    cue(c, 'paper', tc, { g: .32 }); cue(c, 'shutter', tc + .6, { g: .12 }); cue(c, 'flap', t3, { n: 10, g: .12 });
  },
  update(S, c) {
    numero(S.n, c.lt, S.t3, 1.1, 0, 30e6, v => fmtMil(Math.round(v / 1e5) * 1e5));
    entra(S.nf, c.lt, S.t3 + .6, { dy: 6 });
  },
});

// S5 — "Quando Mao morreu, os dados do Banco Mundial mostravam uma realidade brutal." papel preto; o luto de 1976 (trecho REAL da AP)
// numa polaroide inclinada; no "Banco Mundial" a folha de dados desliza por cima da direita; "realidade brutal" digitado em vermelho
e2Cena(['B32', 'B33', 'B34'], {
  fundo: 'e2_papel_preto', fundoOp: { tom: 'brightness(.8)' },
  rig: { z0: 1.22, dy: 50, saiZ: 1.15, saiX: 60 },
  build(M, S, c) {
    const tb = c.w('B33', 'banco') - .12;
    e2Moldura(M, S, 'clip:mao_choro', { x: 540, y: 1060, w: 800, p: 1, rot: -4, clip: { t0: -.1, de: 40 }, entra: { de: 'cima', t: -.3, d: .8, dist: 900, r0: -8 },
      sai: { t: tb + .4, para: 'esq', d: .6 } });
    e2Texto(M, S, 'quando *Mao* morreu', { x: 540, y: 330, s: 100, cor: E2.creme, corChave: E2.amar, t: c.b('B32') - .02, d: .45, larg: 960, sai: 'sobe', tSai: tb });
    const cx = e2Caixa(M, S, { x: 560, y: 1000, w: 820, h: 760, p: 1.02, rot: 3, entra: { de: 'dir', t: tb, d: .8, dist: 1100, r0: 10 } });
    const d = papel(cx.el, 410, 380, 780, 700, { rot: 0 }); d.style.opacity = 1; d.style.filter = e2Sombra(.8);
    el(d, 'div', `font-family:Inter;font-weight:800;font-size:24px;letter-spacing:.2em;color:#777;`, 'BANCO MUNDIAL');
    el(d, 'div', `margin-top:12px;font-family:${SERIF};font-weight:700;font-size:52px;line-height:1.08;color:${TINTA};`, 'China: pobreza extrema e renda por pessoa');
    linhas(d, 3);
    S.L = linhaDat(d, 'realidade brutal', { s: 58, mt: 36, cor: 'rgba(232,25,14,.35)' });
    S.tr = c.w('B34', 'realidade') - .12;
    cue(c, 'paper', -.05, { g: .3 }); cue(c, 'paper', tb, { g: .32 }); cue(c, 'type', S.tr, { n: 8, g: .12 });
  },
  update(S, c) { S.L.at(c.lt, S.tr, 22); },
});

// S6 — "Quase 90% de toda a população da China vivia na extrema miséria, mais pobre que a média da África subsaariana." papel
// quadriculado em duas salas: na 1ª a tira amarela se abre e 88 dos 100 pontos escurecem (88% em 1981, Banco Mundial); no "mais
// pobre" a câmera anda para a direita até as colunas do PIB por pessoa em 1976 (China 166 × África Subsaariana 475, US$ correntes)
e2Cena(['B35', 'B36', 'B37', 'B38'], {
  fundo: 'e2_quadriculado', fundoOp: { folga: 1.6, p: .2 }, janela: .3,
  rig: { mov: c => {
    const tp = c.w('B37', 'mais') - .15, d = c.dur;
    return [[0, 1.2, { z: 1.2 }, 'cam', true], [.2, tp, { y: 60, z: 1.04 }, 'lin'], [tp - .1, tp + 1.0, { x: 1180 }, 'cam'], [tp + .9, d + .3, { z: 1.05 }, 'lin'],
      [d - .45, d + .9, { z: 1.18 }, 'cam']];
  } },
  build(M, S, c) {
    const t9 = c.w('B35', '90') - .1, tp = c.w('B37', 'mais') - .15, ta = c.w('B37', 'africa') - .1;
    e2Kit(M, S, 'tira_4', { x: 540, y: 960, w: 1200, t: -.3, rot: -2, p: .98, sombra: .5 });
    const g = e2Caixa(M, S, { x: 540, y: 960, w: 1080, h: 1920, p: 1 });
    S.g = grade100(g.el, 225, 600, 66, '#b3160b', 88);
    S.n = serifText(g.el, '88%', 540, 1390, { s: 150, c: E2.tinta, sh: 'none', wt: 700 });
    S.nf = fonte(g.el, '1981 · abaixo de US$ 1,90 por dia · Banco Mundial', 540, 1520, { s: 24 });
    e2Texto(M, S, 'na extrema *miséria*', { x: 540, y: 360, s: 92, cor: E2.tinta, t: c.w('B36', 'extrema') - .1, d: .5, larg: 960 });
    const b = e2Caixa(M, S, { x: 1720, y: 960, w: 1080, h: 1920, p: 1 });
    const base = 1300, hMax = 640;
    S.bc = barraV(b.el, 230, base, 260, hMax, E2.verm); S.ba = barraV(b.el, 590, base, 260, hMax, E2.lar);
    S.vc = serifText(b.el, 'US$ 166', 360, base - hMax * 166 / 475 - 60, { s: 64, c: E2.tinta, sh: 'none', wt: 700 });
    S.va = serifText(b.el, 'US$ 475', 720, base - hMax - 60, { s: 64, c: E2.tinta, sh: 'none', wt: 700 });
    S.lc = tagL(b.el, 'China', 360, base + 50, { s: 34 }); S.la = tagL(b.el, 'África Subsaariana', 720, base + 50, { s: 34 });
    S.bf = fonte(b.el, 'PIB por pessoa em 1976, ano da morte de Mao · US$ correntes · Banco Mundial', 540, 1480, { s: 22, wrap: 860 });
    e2Texto(M, S, 'mais *pobre* que a África', { x: 1720, y: 400, s: 88, cor: E2.tinta, t: tp + .2, d: .5, larg: 960 });
    Object.assign(S, { t9, tp, ta });
    cue(c, 'crinkle', -.05, { g: .26, d: .35 }); cue(c, 'flap', t9, { n: 8, g: .12 }); cue(c, 'cloth', tp, { d: .3, g: .3 }); cue(c, 'pop', ta + .1, { g: .1 });
  },
  update(S, c) {
    const lt = c.lt;
    S.g.at(lt, -1, S.t9);
    if (lt >= S.t9 + .4) { S.n.style.opacity = 1; tx(S.n, { s: soco(lt, S.t9 + .5, .12), r: -2 }); } else S.n.style.opacity = 0;
    entra(S.nf, lt, S.t9 + .7, { dy: 6 });
    S.bc.at(E.out5(clamp((lt - S.tp - .6) / .6)) * 166 / 475); S.ba.at(E.out5(clamp((lt - S.ta) / .7)));
    entra(S.vc, lt, S.tp + .9, { dy: 6 }); entra(S.va, lt, S.ta + .4, { dy: 6 });
    entra(S.lc, lt, S.tp + .7, { dy: 0 }); entra(S.la, lt, S.ta, { dy: 0 }); entra(S.bf, lt, S.ta + .3, { dy: 6 });
  },
});

// S7 — P3 (círculo, 3,7 s): "30 anos de comunismo puro produziram apenas igualdade na fome." o Felipe no círculo no alto (limpo, sem
// as sobreposições); embaixo a fornalha de quintal do Grande Salto (1958, impressão REAL) desliza com sombra longa sobre a lousa;
// "igualdade na fome" sobe no fim
e2Cena(['B39', 'B40'], {
  fundo: 'e2_escuro3', limpo: true,
  rig: { z0: 1.12, dy: 30, saiZ: 1.0 },
  build(M, S, c) {
    S.J = JAN('P3', c);
    e2Item(M, S, 'print_fornalha', { x: 540, y: 1580, w: 600, p: 1, rot: -3, borda: true, filtro: 'contrast(1.1)', entra: { de: 'baixo', t: -.2, d: .9, dist: 900 } });
    const tg = c.w('B40', 'igualdade') - .08;
    e2Texto(M, S, '30 anos de comunismo puro', { x: 540, y: 960, s: 74, cor: E2.creme, t: c.w('B39', '30') - .05, d: .5, larg: 1000, sai: 'sobe', tSai: tg - .1 });
    e2Texto(M, S, 'igualdade na *fome*', { x: 540, y: 1020, s: 104, cor: E2.creme, corChave: '#ff5a3c', t: tg, d: .45, larg: 960 });
    S.b = presBola(M.el.parentNode, S, 540, 560, 520);
    cue(c, 'paper', .1, { g: .3 });
  },
  update(S, c) { bola(S.b, c.lt, Math.max(-.05, S.J[0]), S.J[1]); },
});
