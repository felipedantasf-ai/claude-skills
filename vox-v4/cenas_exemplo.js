// ============================================================================
//  teste_v4: demonstração da skill vox-v4 (29/10: tudo dentro da SAFE ZONE da Meta, y 420–1500) (identidade da V4 Company) sobre o áudio e o corte do teste_fernando (LulaGanhouEmpresa)
//  As cenas de demonstração são as do trecho das empresas (B49–B65) e o fim (B73–B79). B01–B48 e B66–B72 ficam numa mesa simples só
//  para a linha do tempo fechar (não fazem parte da demonstração). Dados: os mesmos conferidos no LulaGanhouEmpresa (26/10/2026).
// ============================================================================
// F0 — fora da demonstração (B01–B48): mesa vermelha com a fala
scene({
  beats: ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B17', 'B18', 'B19', 'B20',
    'B21', 'B22', 'B23', 'B24', 'B25', 'B26', 'B27', 'B28', 'B29', 'B30', 'B31', 'B32', 'B33', 'B34', 'B35', 'B36', 'B37', 'B38', 'B39', 'B40',
    'B41', 'B42', 'B43', 'B44', 'B45', 'B46', 'B47', 'B48'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) { paperBg(r); S.cap = CT; },
  update(S, c) { },
});

// D1 — VIRADA (B49–B51): "Enquanto você está olhando pesquisa eleitoral, o capitalismo brasileiro continua batendo recordes."
// degradê vinho da marca; a pesquisa é um cartão de VIDRO com duas colunas (ideia, sem números); no "capitalismo" o vidro sai e a
// REVERBERAÇÃO em linhas abre do centro; no "recordes" o título de impacto em Morganite (amarelo grande sobre vinho: par aprovado)
scene({
  beats: ['B49', 'B50', 'B51'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    gradV4(r, 'vinho');
    S.m = mesa(r);
    S.rv = reverb(S.m, 540, 1030, 300, 300, { tipo: 'linhas', n: 5, passo: 66 });
    S.vd = vidro(S.m, 540, 1000, 440, 560);
    el(S.vd, 'div', `position:absolute;left:0;right:0;top:46px;text-align:center;font-family:Plex;font-weight:600;font-size:30px;letter-spacing:.18em;color:${BRANCO};`, 'PESQUISA');
    S.bars = [[.66, BRANCO], [.56, CINZA_C]].map(([hh, cor], i) => el(S.vd, 'div', `position:absolute;left:${120 + i * 120}px;bottom:70px;width:84px;height:${(hh * 360).toFixed(0)}px;border-radius:10px 10px 0 0;background:${cor};opacity:${i ? .55 : .95};transform-origin:50% 100%;transform:scaleY(0);`));
    S.rt = rotV4(S.m, 'CAPITALISMO BRASILEIRO', 540, 800, { centro: true, bg: BRANCO, s: 30 });
    S.tt = titulo(S.m, 'Recordes', 540, 1060, { s: 300, c: AMARELO });
    S.cap = CT;
    S.tp = c.w('B49', 'pesquisa') - .2; S.tc = c.w('B50', 'capitalismo') - .1; S.tr = c.w('B51', 'recordes') - .08;
    cue(c, 'paper', S.tp, { g: .3 }); cue(c, 'whoosh', S.tc, { d: .6, g: .12 }); cue(c, 'slam', S.tr + .02, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    entra(S.vd, lt, Math.min(-.2, S.tp), { dy: 30, out: S.tc - .05 });
    S.bars.forEach((b, i) => { b.style.transform = `scaleY(${E.out5(clamp((lt - S.tp - .3 - i * .1) / .5)).toFixed(3)})`; });
    S.rv.at(lt, S.tc, { vivo: true }); entra(S.rt, lt, S.tc + .15, { dy: 10 });
    tx(S.tt, { s: lerp(1.12, 1, ez(lt, S.tr, .35)), o: ez(lt, S.tr, .14) });
    S.m.cam(kf(lt, [[0, 1.0], [S.tc, 1.02], [c.dur, 1.06]]), 540, 1020);
  },
});

// D2 — EMBRAER (B52–B55): "A Embraer lucrou mais de um bilhão de reais num único trimestre, crescendo 25%, com a maior carteira de
// pedidos da história dela." mesa vermelha; a foto REAL do E195-E2 sobre a reverberação normal;
// (duotone vinho -> creme #FFEBC8, o 1º degradê digital da marca); logo REAL em cartão branco; R$ 1,1 bi em Morganite; selo amarelo +25% no "25"; no "carteira", US$ 34,5 bi
scene({
  beats: ['B52', 'B53', 'B54', 'B55'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.rv = reverb(S.m, 370, 930, 560, 400, { tipo: 'normal', n: 3, passo: 34 });
    S.f = foto(S.m, 'print_embraer', 370, 930, 520, { rot: 0, tape: ['tl'] }); duo(S.f, VINHO, '#FFEBC8');   // P&B de arquivo -> duotone da marca
    S.lg = logo(S.m, 'lg_embraer', 540, 670, 480, { k: .86, pad: .12 });
    S.d1 = dado(S.m, 'R$ 1,1 bi', 820, 890, { s: 92, sub: 'LUCRO · 2º TRI 2026', ss: 20 });
    S.se = selo(S.m, 830, 1130, 220, '+25%', 'SOBRE O<br>2º TRI 2025', AMARELO);
    S.d2 = dado(S.m, 'US$ 34,5 bi', 540, 1300, { s: 110, sub: 'CARTEIRA DE PEDIDOS · RECORDE', ss: 24 });
    S.fo = FTAG(S.m, 'Embraer, resultado do 2º trimestre de 2026', 540, 1450);
    S.cap = CT;
    S.tb = c.w('B52', 'bilhao') - .2; S.t25 = c.w('B54', '25') - .1; S.tc = c.w('B55', 'carteira') - .2;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'type', S.tb, { n: 6, g: .24 }); cue(c, 'stamp', S.t25 + .03, { g: .4 }); cue(c, 'wood', S.tc + .1, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    S.rv.at(lt, -.4); pousa(S.f, lt, -.3, { dy: -80, r0: 0 }); entra(S.lg, lt, -.35, { dy: -20 });
    entra(S.d1, lt, S.tb, { dy: 16 }); stampIn(S.se, lt, S.t25);
    tx(S.d2, { s: lerp(1.08, 1, ez(lt, S.tc, .3)), o: ez(lt, S.tc, .2) }); entra(S.fo, lt, S.tc + .4, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [S.tc, 1.03], [S.tc + .7, 1.0], [c.dur, 1.02]]), 540, kf(lt, [[0, 960], [S.tc, 960], [S.tc + .6, 1020], [c.dur, 1020]]));
  },
});

// D3 — RENNER (B56–B58): "A Renner separou um bilhão de reais para abrir 60 lojas em pleno ano de eleição." a foto REAL da loja e a logo
// REAL; R$ 1,05 bi; no "60" a grade de 60 quadradinhos com o canto do símbolo acende em branco; no "eleição" a câmera aproxima
scene({
  beats: ['B56', 'B57', 'B58'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, VINHO, 90, 620, 500, 420, 0);
    S.f = gradeV4(foto(S.m, 'print_renner', 340, 830, 470, { rot: 0, tape: ['tl'] }));
    S.lg = logo(S.m, 'lg_renner', 800, 700, 380, { k: .86, pad: .16 });
    S.d1 = dado(S.m, 'R$ 1,05 bi', 800, 930, { s: 74, sub: 'INVESTIMENTO EM 2026', ss: 20 });
    S.G = [...Array(60)].map((_, i) => el(S.m, 'div', `position:absolute;left:${150 + (i % 12) * 66}px;top:${1100 + Math.floor(i / 12) * 60}px;width:52px;height:52px;border-radius:9px;box-sizing:border-box;box-shadow:0 3px 6px rgba(40,0,0,.22);`));
    S.r60 = rotV4(S.m, 'ATÉ 60 LOJAS NOVAS', 540, 1408, { centro: true, s: 32 });
    S.fo = FTAG(S.m, 'Lojas Renner: previsão de 2026 (50 a 60 lojas, investimento de ~R$ 1,05 bi)', 540, 1470, { wrap: 960, s: 19 });
    S.cap = CT;
    S.tb = c.w('B56', 'bilhao') - .2; S.t60 = c.w('B57', '60') - .12; S.te = c.b('B58');
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'type', S.tb, { n: 6, g: .22 }); for (let i = 0; i < 5; i++) cue(c, 'tick', S.t60 + i * .1, { g: .16 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); pousa(S.f, lt, -.3, { dy: -80, r0: 0 }); entra(S.lg, lt, -.2, { dy: -16 }); entra(S.d1, lt, S.tb, { dy: 14 });
    S.G.forEach((g, i) => { const on = lt >= S.t60 + i * .012; g.style.background = on ? BRANCO : 'rgba(255,255,255,.14)'; g.style.border = on ? 'none' : '2px solid rgba(255,255,255,.35)'; g.style.opacity = ez(lt, -.2 + i * .004, .2); });
    entra(S.r60, lt, S.t60 + .3, { dy: 10 }); entra(S.fo, lt, S.t60 + .5, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [S.te, 1.01], [c.dur, 1.04]]), 540, 970);
  },
});

// D4 — LG e SCANIA (B59–B60): "A LG inaugurou uma fábrica de um bilhão e meio no sul. A Scania botou aqui o segundo maior centro de peças
// do mundo." o mapa do Sul em branco sobre a mesa vermelha, o Paraná em vinho no "LG", o pino amarelo em Fazenda Rio Grande, a logo REAL
// e R$ 1,5 bi; o Fernando no QUADRO de cantos arredondados (o contorno do símbolo) no alto à direita. No "Scania", a foto REAL do
// caminhão sobre o bloco vinho e o selo 2º no "segundo"
scene({
  beats: ['B59', 'B60'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = camada(r); S.B = camada(r, false);
    S.V = { lon: -50.5, lat: -25.2, z: 6.2, cy: 1150 };
    S.M = mapaBR(S.A, S.V);
    S.pi = pinoMapa(S.M, S.M.ui, [-49.31, -25.66], { cor: AMARELO, r: 20 });
    S.lb = rotMapa(S.M, S.M.ui, 'Fazenda Rio Grande (PR)', [-49.31, -25.66], 0, 70, { s: 30 });
    S.lg = logo(S.M.ui, 'lg_lg', 300, 800, 330, { k: .8, pad: .14 });
    S.d1 = dado(S.M.ui, 'R$ 1,5 bi', 300, 1010, { s: 80, sub: 'FÁBRICA DE GELADEIRAS', ss: 20 });
    S.f1 = FTAG(S.M.ui, 'LG: fábrica inaugurada em 13/08/2026', 540, 1450);
    S.pq = presQuad(r, S, 820, 720, 330);
    paperBg(S.B); S.m = mesa(S.B);
    S.bk = bloco(S.m, VINHO, 120, 660, 840, 660, 0);
    S.f = gradeV4(foto(S.m, 'print_scania', 540, 990, 760, { rot: 0, tape: ['tl', 'tr'] }));
    S.lg2 = logo(S.m, 'lg_scania', 230, 690, 230, { k: .7, hmax: .7, pad: .12 });
    S.se = selo(S.m, 850, 720, 250, '2º', 'MAIOR CENTRO<br>DE PEÇAS', BRANCO);
    S.f2 = FTAG(S.m, 'Latin Parts Center, Vinhedo (SP): o 2º maior centro de peças da Scania no mundo', 540, 1430, { wrap: 860 });
    S.cap = CTAG;
    S.tl = c.w('B59', 'lg') - .15; S.tb = c.w('B59', 'bilhao') - .2; S.tS = c.b('B60') - .08; S.ts = c.w('B60', 'segundo') - .1;
    S.J = [-.3, c.e('B59') - .05];
    cue(c, 'paper', S.tl, { g: .32 }); cue(c, 'type', S.tb, { n: 5, g: .22 }); cue(c, 'paper', S.tS + .02, { g: .3 }); cue(c, 'shutter', S.tS + .14, { g: .12 }); cue(c, 'stamp', S.ts + .03, { g: .42 });
  },
  update(S, c) {
    const lt = c.lt, k = trocaC(lt, [[-9, S.A], [S.tS, S.B]]);
    if (k === 0) {
      S.M.set({ ...S.V, z: S.V.z * (1 + .05 * clamp(lt / c.dur)) });
      S.M.uf.PR.setAttribute('fill', lt >= S.tl ? VINHO : BRANCO);
      S.pi.at(lt, S.tl + .15); S.lb.at(lt, S.tl + .3);
      entra(S.lg, lt, S.tl, { dy: -16 }); entra(S.d1, lt, S.tb, { dy: 14 }); entra(S.f1, lt, S.tb + .4, { dy: 6 });
    } else {
      revela(S.bk, lt, S.tS - .2); pousa(S.f, lt, S.tS - .1, { dy: -80, r0: 0 }); entra(S.lg2, lt, S.tS, { dy: -16 });
      stampIn(S.se, lt, S.ts); entra(S.f2, lt, S.ts + .4, { dy: 6 });
      S.m.cam(kf(lt, [[S.tS, 1.0], [c.dur, 1.04]]), 540, 1000);
    }
    bola(S.pq, lt, S.J[0], S.J[1]);
    S.cap = k === 0 ? CTAG : CT;
  },
});

// D5 — O PLACAR DAS EMPRESAS (B61–B65): "A Pague Menos está multiplicando o lucro, o Movida crescendo quase 60%. E até a Ambev, que vem de
// cerveja, tá crescendo. O Nubank virou uma das maiores empresas de tecnologia do mundo, com o Lula e Dilma na presidência,"
// quatro cartões de VIDRO vermelho (liquid glass discreto) acendem um a um na palavra, cada um com a logo REAL e o número em Morganite
scene({
  beats: ['B61', 'B62', 'B63', 'B64', 'B65'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.rv = reverb(S.m, 540, 1030, 880, 840, { tipo: 'linhas', n: 2, passo: 30, esp: 2 });
    const C = [['lg_paguemenos', '+76%', 'LUCRO · 1º SEM. 2026', 'pague', 'B61'], ['lg_movida', '+59%', 'LUCRO · 1º TRI 2026', 'movida', 'B62'],
      ['lg_ambev', '+24,5%', 'LUCRO · 2º TRI 2026', 'ambev', 'B63'], ['lg_nubank', '2013', 'ANO DE FUNDAÇÃO', 'nubank', 'B64']];
    S.C = C.map(([lg, n, sub, w, b], i) => {
      const x = 310 + (i % 2) * 460, y = 820 + Math.floor(i / 2) * 420;
      const v = vidro(S.m, x, y, 420, 390);
      const l = logo(S.m, lg, x, y - 80, 280, { k: .8, hmax: .42, pad: .14 });
      const d = dado(S.m, n, x, y + 95, { s: 86, sub, ss: 18 });
      return { v, l, d, t: c.w(b, w) - .15 };
    });
    S.fo = FTAG(S.m, 'resultados divulgados pelas empresas; Nubank fundado em 2013, no governo Dilma', 540, 1475, { wrap: 960, s: 19 });
    S.cap = CT;
    S.td = c.w('B65', 'dilma') - .15;
    S.C.forEach(k => { cue(c, 'paper', k.t, { g: .3 }); cue(c, 'pop', k.t + .35, { g: .16 }); });
  },
  update(S, c) {
    const lt = c.lt;
    S.rv.at(lt, -.5, { vivo: true });
    S.C.forEach(k => { entra(k.v, lt, Math.min(k.t, k === S.C[0] ? -.25 : k.t) - .05, { dy: 20 }); entra(k.l, lt, k.t, { dy: -14 }); entra(k.d, lt, k.t + .3, { dy: 14 }); });
    entra(S.fo, lt, S.td, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.03], [c.dur, 1.0]]), 540, 1000);
  },
});

// F1 — fora da demonstração (B66–B72): mesa vermelha com a reverberação parada e a fala
scene({
  beats: ['B66', 'B67', 'B68', 'B69', 'B70', 'B71', 'B72'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) { paperBg(r); S.rv = reverb(r, 540, 1050, 400, 400, { tipo: 'normal', n: 4, passo: 60 }); S.cap = CT; },
  update(S, c) { S.rv.at(c.lt, -1, { vivo: true }); },
});

// D6 — o apresentador em tela cheia (B73–B75): "ele cresce apesar dele. Então, bora, abre a loja, liga pra cliente e segue o baile."
pres4(['B73', 'B74', 'B75'], { ...PT, lead: -.12 });

// D7 — FINAL / ASSINATURA (B76–B79): "Não andem ansiosos por coisa alguma. Bora continuar acreditando naquilo que sempre deu certo.
// Nosso próprio trabalho." degradê 'fogo' da marca; a reverberação normal abre em volta do LOGO OFICIAL (SVG do brand book, branco,
// reto, opaco, com área de proteção); no "trabalho" o @ real da marca (instagram.com/v4company)
scene({
  beats: ['B76', 'B77', 'B78', 'B79'], tr: 'cut', bg: 'dark', camMove: camStill, lead: .4,
  build(r, S, c) {
    gradV4(r, 'fogo');
    S.m = mesa(r);
    S.rv = reverb(S.m, 540, 980, 380, 386, { tipo: 'normal', n: 4, passo: 74 });
    S.lg = logoV4(S.m, 540, 980, 300, { cor: 'branca' });
    S.at = el(S.m, 'div', `position:absolute;left:540px;top:1400px;transform:translate(-50%,-50%);white-space:nowrap;font-family:Plex;font-weight:600;font-size:46px;letter-spacing:.02em;color:${BRANCO};opacity:0;`, '@v4company');
    S.at._base = 'translate(-50%,-50%)';
    S.cap = CT;
    S.tb = c.w('B78', 'bora') - .1; S.tt = c.w('B79', 'trabalho') - .15;
    cue(c, 'whoosh', .3, { d: .7, g: .1 }); cue(c, 'pop', S.tt, { g: .2 });
  },
  update(S, c) {
    const lt = c.lt;
    S.rv.at(lt, .3, { vivo: true, gap: .09 }); entra(S.lg, lt, .2, { dy: 0, s0: 1.04 });
    entra(S.at, lt, S.tt, { dy: 10 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1000);
  },
});
