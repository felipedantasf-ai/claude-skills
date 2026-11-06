// ============================================================================
//  EXEMPLO COMPLETO da skill vox-fernando: as 37 cenas do LulaGanhouEmpresa (projetos/fernando5, 26/10/2026) na paleta do Fernando
//  (mesa laranja; vermelho, branco e preto). Projeto de teste: projetos/teste_fernando (prefixo tf; quadros por junção do fernando5).
//  Use como modelo de composição, ritmo, apresentador (tela dividida, círculo, tela cheia), mapas, logos, dados e final com o celular.
// ============================================================================
// ============================================================================
//  teste_fernando: cenas S01–S19 do LulaGanhouEmpresa na paleta da skill vox-fernando
// ============================================================================
// S01 — GANCHO (1,7 s, tela cheia): "O Lula ganhou. E o que acontece" a foto REAL do Lula (foto oficial, Planalto) sobre o bloco vermelho
// já no quadro 0; no "ganhou" o carimbo REELEITO e o resultado do 2º turno (aqui o Fernando olha para baixo: ele entra no S01b)
scene({
  beats: ['B01'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    if (!CH2) buildCh2(); CH2[0].s = -.3;
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, VERMELHO, 200, 560, 680, 860, -3);
    S.f = foto(S.m, 'print_lula', 540, 980, 560, { rot: 2, tape: ['tl', 'tr'] });
    S.st = inkStamp(S.m, 'REELEITO', 570, 1330, { s: 110, c: BRANCO, rot: -10 });
    S.fo = fonte(S.m, '2º turno, 25/10/2026 · Lula 51,79% × Flávio 48,21% dos votos válidos', 540, 1500, { s: 24 });
    S.cap = CT;
    S.tg = c.w('B01', 'ganhou') - .05;
    cue(c, 'stamp', S.tg + .02, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -1); pousa(S.f, lt, -1); stampIn(S.st, lt, S.tg); entra(S.fo, lt, S.tg + .4, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.07]]), 540, 1000);
  },
});

// S01b — tela dividida (3,7 s): "com a sua empresa agora? Spoiler: o mesmo que aconteceu nos últimos 20 anos." em cima, a loja com a porta de
// aço que abre no "empresa"; no "Spoiler" o carimbo; no "o mesmo" o ano corre de 2006 a 2026; embaixo, o Fernando (olhando a câmera)
scene({
  beats: ['B02', 'B03', 'B04'], tr: 'cut', bg: 'dark', camMove: camStill, lead: -.72,
  build(r, S, c) {
    S.top = el(r, 'div', 'position:absolute;left:0;top:0;width:1080px;height:960px;overflow:hidden;');
    paperBg(S.top);
    S.bk = bloco(S.top, PRETO, 300, 330, 480, 470, 2);
    S.lj = portaAco(S.top, 540, 560, 400, 300);
    S.ab = rotulo(S.top, 'SUA EMPRESA', 540, 860, { centro: true, bg: PRETO, s: 32, rot: -2 });
    S.yr = serifText(S.top, '2006', 360, 170, { s: 130, wt: 700, c: TINTA, sh: 'none' });
    S.sp = inkStamp(S.top, 'SPOILER', 800, 200, { s: 60, c: PRETO, rot: 10 });
    S.mp = presMetade(r, S, 'baixo');
    S.cap = { mode: 'glow', y: 1740 };
    S.te = c.w('B02', 'empresa') - .1; S.ts = c.b('B03') - .03; S.tm = c.b('B04');
    cue(c, 'cloth', S.te, { d: .5, g: .22 }); cue(c, 'stamp', S.ts, { g: .4 }); for (let i = 0; i < 5; i++) cue(c, 'tick', S.tm + .25 + i * .3, { g: .14 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.4); S.lj.style.opacity = 1; S.lj.at(clamp((lt - S.te) / .7)); tx(S.lj, { y: 0 });
    entra(S.ab, lt, S.te + .3, { dy: 10 });
    stampIn(S.sp, lt, S.ts);
    S.yr.style.opacity = lt >= S.tm ? 1 : 0; S.yr.textContent = String(Math.round(lerp(2006, 2026, E.inOut(clamp((lt - S.tm) / Math.max(.5, c.dur - S.tm - .3))))));
    metade(S.mp, lt, -1, c.dur + 1);
  },
});

// S03 — "Porque faz 24 anos que o PT manda e desmanda no país." a foto REAL do Palácio do Planalto sobre o bloco laranja; os carimbos
// MANDA (vermelho) e DESMANDA (preto) batem nas palavras. O "24 anos" fica fora da tela (o PT governou 2003–2016 e 2023–2026)
scene({
  beats: ['B05', 'B06'], tr: 'cut', bg: 'dark', camMove: camStill, lead: .18,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, PRETO, 70, 640, 940, 660, -1.5);
    S.f = foto(S.m, 'print_planalto', 540, 960, 880, { rot: 1, tape: ['tl', 'tr'] });
    S.lb = nota(S.m, 'Palácio do Planalto, Brasília', 540, 1310, { s: 26, centro: true });
    S.s1 = inkStamp(S.m, 'MANDA', 330, 1430, { s: 100, c: BRANCO, rot: -8 });
    S.s2 = inkStamp(S.m, 'DESMANDA', 700, 1560, { s: 86, c: PRETO, rot: 6 });
    S.cap = CTAG;
    S.t1 = c.w('B06', 'manda') - .03; S.t2 = c.w('B06', 'desmanda') - .03;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'stamp', S.t1 + .02, { g: .45 }); cue(c, 'stamp', S.t2 + .02, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); pousa(S.f, lt, -.3, { dy: -90 }); entra(S.lb, lt, .2, { dy: 6 });
    stampIn(S.s1, lt, S.t1); stampIn(S.s2, lt, S.t2);
    S.m.cam(kf(lt, [[0, 1.0], [S.t1, 1.02], [c.dur, 1.06]]), 540, kf(lt, [[0, 1000], [S.t1, 1060], [c.dur, 1160]]));
  },
});

// S04 — "E nesses 24 anos, a verdade é que a gente não virou a Venezuela. A gente continua sendo o Brasil." o mapa da América do Sul em
// papel: na "Venezuela" ela fica preta; a seta do Brasil até lá e, no "não virou", o X vermelho; no "Brasil" a câmera vai até o Brasil e
// ele fica laranja forte. O Fernando no círculo (10,3–14,0 s), no alto à esquerda (oceano Pacífico)
scene({
  beats: ['B07', 'B08', 'B09', 'B10'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.V0 = { lon: -62, lat: -10, z: 1.55, cy: 1080 }; S.V1 = { lon: -53, lat: -14, z: 2.3, cy: 1150 };
    S.M = mapaBR(r, S.V0); S.M.pinta(GEO.br.states.map(s => s.uf), BRANCO, '#c9c2b5');
    S.ve = S.M.hl('Venezuela', PRETO, { stroke: TINTA, 'stroke-width': 2 });
    S.sv = svgAbs(S.M.ui, 0, 0, W, H);
    S.rt = rotaSeta(S.sv, [-50, -12], [-66, 7], { c: TINTA, w: 8, bend: .18, dash: '3 14' });
    S.xa = traco(S.sv, 'M -40 -40 L 40 40', { c: VERMELHO, w: 16 }); S.xb = traco(S.sv, 'M 40 -40 L -40 40', { c: VERMELHO, w: 16 });
    S.lv = rotMapa(S.M, S.M.ui, 'Venezuela', [-66, 7.5], 0, -62, { s: 32 });
    S.lb = rotMapa(S.M, S.M.ui, 'Brasil', [-50, -10], 0, 0, { s: 40 });
    S.pb = presBola(r, S, 215, 590, 340);
    S.J = [c.b('B08') + .8, c.e('B10') - .53];   // 10,45–13,85 s: antes disso ele olha para baixo
    S.cap = CTAG;
    S.tv = c.w('B09', 'venezuela') - .1; S.tn = c.w('B09', 'nao') - .05; S.tb = c.w('B10', 'brasil') - .2;
    cue(c, 'pop', S.tv, { g: .2 }); cue(c, 'marker', S.tn, { g: .3 }); cue(c, 'pencil', S.tn + .35, { g: .3 }); cue(c, 'whoosh', c.b('B10'), { d: .6, g: .1 });
  },
  update(S, c) {
    const lt = c.lt;
    voo(S.M, S.V0, S.V1, (lt - c.b('B10')) / .9);
    S.ve.style.opacity = (ez(lt, S.tv, .3) * (1 - .55 * ez(lt, S.tb, .5))).toFixed(3);
    S.lv.at(lt, S.tv + .1, { out: S.tb });
    S.rt.at(S.M, ez(lt, S.tn - .35, .45)); S.rt.setAttribute('opacity', lt > S.tb ? (1 - ez(lt, S.tb, .3)).toFixed(3) : S.rt.getAttribute('opacity'));
    const P = S.rt.P ? S.rt.P(.55) : [540, 900], gx = `translate(${P[0].toFixed(1)} ${P[1].toFixed(1)})`;
    [S.xa, S.xb].forEach((g, i) => { g.setAttribute('transform', gx); g.draw(lt > S.tb ? 1 - ez(lt, S.tb, .3) : ez(lt, S.tn + .3 + i * .12, .2)); });
    if (lt >= S.tb) GEO.br.states.forEach((s, i) => S.M.uf[s.uf].setAttribute('fill', lt >= S.tb + (i % 9) * .03 ? VERMELHO : BRANCO));
    S.lb.at(lt, S.tb + .3);
    bola(S.pb, lt, S.J[0], S.J[1]);
  },
});

// S05 — "Tá, eu sei que as coisas estão caras, eu sei que é lento, eu sei que é chato." três coisas na mesa, cada uma na sua palavra: o
// recibo comprido (CARO), o relógio (LENTO) e a pilha de formulários (CHATO)
scene({
  beats: ['B11', 'B12', 'B13'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.re = receipt(S.m, 300, 960, 450, [['arroz', 'R$ ↑'], ['luz', 'R$ ↑'], ['aluguel', 'R$ ↑'], ['gasolina', 'R$ ↑']], { head: 'NOTA', sub: 'mercado', total: 'CARO', foot: '', h: 620, rot: -4 });
    S.re.lines.forEach(l => { l.style.opacity = 1; }); S.re.tot.style.opacity = 1; S.re.tot.style.color = VERMELHO;
    S.rl = relogio(S.m, 790, 800, 150);
    S.dc = [0, 1, 2, 3].map(i => doc(S.m, 760 + i * 6, 1350 - i * 16, 380, 300, i === 3 ? 'Formulário' : '', { rot: 3 - i * 1.6, n: 3, ts: 34 }));
    S.r1 = rotulo(S.m, 'CARO', 300, 1320, { centro: true, bg: VERMELHO, s: 36, rot: -3 });
    S.r2 = rotulo(S.m, 'LENTO', 790, 1010, { centro: true, bg: PRETO, s: 36, rot: 2 });
    S.r3 = rotulo(S.m, 'CHATO', 760, 1560, { centro: true, bg: VERMELHO, s: 36, rot: -2 });
    S.cap = CT;
    S.tc = c.w('B11', 'caras') - .15; S.tl = c.w('B12', 'lento') - .15; S.th = c.w('B13', 'chato') - .15;
    cue(c, 'paper', S.tc, { g: .36 }); cue(c, 'tick', S.tl, { g: .3 }); cue(c, 'tick', S.tl + .25, { g: .22 }); cue(c, 'flick', S.th, { g: .32 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.re, lt, -.25, { dy: -120 }); entra(S.r1, lt, S.tc, { dy: 12 });
    if (lt < S.tl - .1) S.rl.style.opacity = 0; else { const q = E.out5(clamp((lt - S.tl + .1) / .4)); S.rl.style.opacity = 1; S.rl.style.transform = `translateY(${(-300 * (1 - q)).toFixed(1)}px)`; }
    S.rl.at(lt, lt < S.tl ? 0 : (lt - S.tl) / 2.5); entra(S.r2, lt, S.tl + .1, { dy: 12 });
    S.dc.forEach((d, i) => pousa(d, lt, S.th - .05 + i * .06, { dy: -110 })); entra(S.r3, lt, S.th + .2, { dy: 12 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1060);
  },
});

// S06 — Fernando em tela cheia (3,4 s): "Mas a gente continua ganhando dinheiro e é a vida. Se você abre uma empresa"
pres4(['B14', 'B15', 'B16'], { ...PT, lead: -.43 });   // entra em 18,1 s (antes ele vira a cabeça)

// S07 — "em 2003, 2010, 2023." três folhas de calendário caem, cada uma no seu ano (serifa grande, traço laranja)
scene({
  beats: ['B17'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    const anos = ['2003', '2010', '2023'];
    S.F = anos.map((a, i) => {
      const b = papel(S.m, 200 + i * 340, 1000 + (i % 2 ? 60 : -40), 300, 360, { rot: [-5, 3, -2][i] });
      el(b, 'div', `position:absolute;left:0;right:0;top:0;height:64px;background:${[VERMELHO, PRETO, VERMELHO][i]};`);
      el(b, 'div', `position:absolute;left:0;right:0;top:120px;text-align:center;font-family:${SERIF};font-weight:700;font-size:96px;color:${TINTA};`, a);
      return { b, t: c.w('B17', a) - .12 };
    });
    S.cap = { mode: 'none' };
    S.F.forEach(f => cue(c, 'paper', f.t, { g: .34 }));
  },
  update(S, c) {
    const lt = c.lt;
    S.F.forEach(f => pousa(f.b, lt, f.t, { dy: -160 }));
    S.m.cam(kf(lt, [[0, 1.04], [c.dur, 1.0]]), 540, 1000);
  },
});

// S08 — "Você já construiu tudo que você tem. Com esse mesmo estado em cima de você. E se sobreviveu até agora, você vai continuar
// sobrevivendo." os blocos de papel sobem e formam a SUA EMPRESA no "construiu"; no "estado" a laje preta ESTADO desce e pesa em cima;
// no "sobreviveu" o carimbo AINDA DE PÉ. O Fernando no círculo (23,2–26,2 s)
scene({
  beats: ['B18', 'B19', 'B20', 'B21'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.T = [[310, 1380, BRANCO], [545, 1380, VERMELHO], [310, 1245, VERMELHO], [545, 1245, BRANCO], [310, 1110, BRANCO], [545, 1110, PRETO]]
      .map(([x, y, cor], i) => ({ e: tijolo(S.m, cor, x, y, 225, 125), i }));
    S.lb = rotulo(S.m, 'SUA EMPRESA', 540, 1560, { centro: true, bg: PRETO, s: 34 });
    S.es = box(S.m, 540, 1035, 600, 130, `background:${PRETO} url(${ptex('#efece4', 30)});background-blend-mode:multiply;box-shadow:0 18px 26px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;` +
      `font-family:${SERIF};font-weight:700;font-size:70px;letter-spacing:.08em;color:#f4f1ea;`);
    S.es.textContent = 'ESTADO';
    S.st = inkStamp(S.m, 'AINDA DE PÉ', 600, 760, { s: 76, c: PRETO, rot: -8 });
    S.pb = presBola(r, S, 830, 560, 340);
    S.J = [c.b('B18') + .25, c.e('B19') - .12];
    S.cap = CT;
    S.tc = c.w('B18', 'construiu') - .25; S.te = c.w('B19', 'estado') - .2; S.ts = c.w('B20', 'sobreviveu') - .05;
    S.T.forEach(t => cue(c, 'wood', S.tc + t.i * .08, { g: .2 })); cue(c, 'slam', S.te + .35, { g: .4 }); cue(c, 'stamp', S.ts + .05, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, land = S.te + .35, sq = lt > land ? Math.exp(-(lt - land) * 7) * Math.sin((lt - land) * 30) * .03 : 0;
    S.T.forEach(t => { const q = E.out5(clamp((lt - S.tc - t.i * .08) / .35)); t.e.style.opacity = lt >= S.tc + t.i * .08 ? 1 : 0; t.e.style.transform = `translateY(${(-260 * (1 - q)).toFixed(1)}px) scaleY(${(1 - sq).toFixed(3)})`; t.e.style.transformOrigin = '50% 100%'; });
    entra(S.lb, lt, S.tc + .5, { dy: 10 });
    if (lt < S.te) S.es.style.opacity = 0; else { const q = E.in(clamp((lt - S.te) / .35)); tx(S.es, { y: -900 * (1 - q), o: 1 }); }
    stampIn(S.st, lt, S.ts);
    bola(S.pb, lt, S.J[0], S.J[1]);
    S.m.cam(kf(lt, [[0, 1.0], [S.ts, 1.02], [c.dur, 1.1]]), 540, kf(lt, [[0, 1180], [S.ts, 1180], [c.dur, 1100]]));
  },
});

// S09 — "Não porque o governo vai começar a te ajudar magicamente, mas porque você nunca precisou dele." a cartola preta GOVERNO com a
// varinha; no "magicamente" brilhos laranja saem e somem; no "nunca precisou" o X vermelho risca a cartola
scene({
  beats: ['B22', 'B23'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, BRANCO, 200, 700, 680, 720, 2);
    S.ca = cartola(S.m, 540, 1080, 520);
    S.sv = svgAbs(S.m, 0, 0, W, H);
    S.br = [[790, 720, 40], [860, 800, 26], [720, 650, 22], [900, 680, 18]].map(([x, y, rr]) => scribble(S.sv, sparkleD(x, y, rr), { c: BRANCO, w: 7 }));
    S.xa = traco(S.sv, 'M 300 830 L 780 1360', { c: VERMELHO, w: 22 }); S.xb = traco(S.sv, 'M 780 830 L 300 1360', { c: VERMELHO, w: 22 });
    S.cap = CT;
    S.tm = c.w('B22', 'magicamente') - .1; S.tn = c.w('B23', 'nunca') - .05;
    cue(c, 'paper', .02, { g: .28 }); cue(c, 'pop', S.tm, { g: .2 }); cue(c, 'marker', S.tn, { g: .35 }); cue(c, 'marker', S.tn + .2, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); S.ca.style.opacity = 1; tx(S.ca, { y: 30 * (1 - ez(lt, -.3, .4)), r: Math.sin(lt * 2) * 1.5 });
    S.ca.vara.setAttribute('transform', `rotate(${(lt >= S.tm ? Math.sin((lt - S.tm) * 14) * 8 * Math.exp(-(lt - S.tm) * 2) : 0).toFixed(2)} 330 280)`);
    S.br.forEach((g, i) => { const a = ez(lt, S.tm + i * .07, .2), b = ez(lt, S.tm + .6 + i * .05, .3); g.draw(a); g.style.opacity = (1 - b).toFixed(3); });
    S.xa.draw(ez(lt, S.tn, .25)); S.xb.draw(ez(lt, S.tn + .2, .25));
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1060);
  },
});

// S10 — tela dividida (3,4 s): "O juro vai ficar um pouco mais alto? Vai. O imposto vai ser um pouco mais alto? Vai." em cima, dois
// mostradores: JUROS e IMPOSTO; o ponteiro sobe no "alto" e o "VAI." carimba no "Vai."
scene({
  beats: ['B24', 'B25', 'B26', 'B27'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.top = el(r, 'div', 'position:absolute;left:0;top:0;width:1080px;height:960px;overflow:hidden;');
    paperBg(S.top);
    S.d1 = dial(S.top, 290, 470, 330); S.d2 = dial(S.top, 790, 470, 330);
    S.r1 = rotulo(S.top, 'JUROS', 290, 720, { centro: true, bg: PRETO, s: 38 });
    S.r2 = rotulo(S.top, 'IMPOSTO', 790, 720, { centro: true, bg: PRETO, s: 38 });
    S.v1 = inkStamp(S.top, 'VAI.', 300, 860, { s: 70, c: VERMELHO, rot: -8 }); S.v2 = inkStamp(S.top, 'VAI.', 800, 860, { s: 70, c: VERMELHO, rot: 6 });
    S.mp = presMetade(r, S, 'baixo');
    S.cap = { mode: 'glow', y: 1740 };
    S.a1 = c.w('B24', 'alto') - .1; S.a2 = c.w('B26', 'alto') - .1; S.t1 = c.b('B25') - .03; S.t2 = c.b('B27') - .03;
    cue(c, 'click', S.a1, { g: .3 }); cue(c, 'stamp', S.t1, { g: .4 }); cue(c, 'click', S.a2, { g: .3 }); cue(c, 'stamp', S.t2, { g: .4 });
  },
  update(S, c) {
    const lt = c.lt;
    [S.d1, S.d2].forEach((d, i) => { d.style.opacity = 1; d.gira(-60 + 95 * E.spring(clamp((lt - (i ? S.a2 : S.a1)) / .7)) + 2 * Math.sin(lt * 3 + i)); });
    entra(S.r1, lt, -.3, { dy: 8 }); entra(S.r2, lt, -.2, { dy: 8 });
    stampIn(S.v1, lt, S.t1); stampIn(S.v2, lt, S.t2);
    metade(S.mp, lt, -1, c.dur + 1);
  },
});

// S11 — "Só que ele já era alto na terça-feira passada, já era alto no ano passado. Nada mudou, de fato." duas folhas de calendário:
// TERÇA-FEIRA PASSADA e ANO PASSADO, cada uma leva o carimbo ALTO no "alto"; no "Nada mudou" o sinal de igual entre elas
scene({
  beats: ['B28', 'B29', 'B30'], tr: 'cut', bg: 'dark', camMove: camStill, lead: .35,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    const folha = (cx, cy, cab, txt, cor, rot) => { const b = papel(S.m, cx, cy, 400, 480, { rot }); el(b, 'div', `position:absolute;left:0;right:0;top:0;height:86px;background:${cor};color:#fff;font-family:Inter;font-weight:800;font-size:26px;letter-spacing:.14em;line-height:86px;text-align:center;`, cab);
      el(b, 'div', `position:absolute;left:0;right:0;top:170px;text-align:center;font-family:${SERIF};font-weight:700;font-size:64px;line-height:1.05;color:${TINTA};`, txt); return b; };
    S.p1 = folha(280, 980, 'CALENDÁRIO', 'terça-feira<br>passada', PRETO, -4);
    S.p2 = folha(800, 1060, 'CALENDÁRIO', 'ano<br>passado', VERMELHO, 3);
    S.s1 = inkStamp(S.m, 'ALTO', 290, 1130, { s: 84, c: VERMELHO, rot: -12 }); S.s2 = inkStamp(S.m, 'ALTO', 810, 1210, { s: 84, c: VERMELHO, rot: 8 });
    S.eq = serifText(S.m, '=', 545, 1000, { s: 220, wt: 700, c: BRANCO, sh: '-3px 5px 0 rgba(0,0,0,.2)' });
    S.cap = CT;
    S.a1 = c.w('B28', 'alto') - .05; S.a2 = c.w('B29', 'alto') - .05; S.tn = c.w('B30', 'nada') - .05; S.tp2 = c.b('B29') - .3;
    cue(c, 'stamp', S.a1 + .03, { g: .42 }); cue(c, 'paper', S.tp2, { g: .3 }); cue(c, 'stamp', S.a2 + .03, { g: .42 }); cue(c, 'slam', S.tn, { g: .25 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.p1, lt, -.35, { dy: -120 }); stampIn(S.s1, lt, S.a1);   // já na mesa no 1º quadro da cena
    pousa(S.p2, lt, S.tp2, { dy: -120 }); stampIn(S.s2, lt, S.a2);
    tx(S.eq, { s: soco(lt, S.tn + .1, .14) * lerp(1.2, 1, ez(lt, S.tn, .25)), o: ez(lt, S.tn, .15) });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1060);
  },
});

// S12 — "O clima está ruim agora, mas vai passar. Ele sempre passa." a nuvem de chuva escura sobre a mesa; no "passar" ela desliza para fora e o sol laranja sobe
scene({
  beats: ['B31', 'B32', 'B33'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.so = sol(S.m, 540, 1100, 170);
    S.nu = nuvem(S.m, 540, 860, 640);
    S.cap = CT;
    S.tp = c.w('B32', 'passar') - .15;
    cue(c, 'cloth', .05, { d: .6, g: .2 }); cue(c, 'whoosh', S.tp, { d: .6, g: .12 }); cue(c, 'switch', S.tp + .3, { g: .22 });
  },
  update(S, c) {
    const lt = c.lt, q = E.inOut(clamp((lt - S.tp) / .6));
    S.nu.style.opacity = 1; S.nu.chuva(lt); S.nu.style.transform = `translate(${(1200 * q + 10 * Math.sin(lt * 1.5)).toFixed(1)}px,${(30 * (1 - ez(lt, -.3, .4))).toFixed(1)}px)`;
    S.so.style.opacity = ez(lt, S.tp + .1, .3); S.so.style.transform = `translateY(${(300 * (1 - E.out5(clamp((lt - S.tp - .1) / .6)))).toFixed(1)}px)`; S.so.gira(lt);
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1000);
  },
});

// S13 — "E aí vem o detalhe que ninguém está te contando." (sai a tela cheia do Fernando: aqui ele fecha e baixa os olhos) a folha das contas
// públicas com letra miúda; a lupa desliza e para sobre a nota de rodapé no "detalhe": dentro da lente, grande, "ajuste fiscal" (abre a S14)
scene({
  beats: ['B34'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.dc = doc(S.m, 540, 1040, 720, 860, 'Contas públicas', { kicker: 'ORÇAMENTO 2027', rot: -1.5, n: 0, ts: 52 });
    for (let i = 0; i < 13; i++) el(S.dc, 'div', `height:9px;border-radius:3px;background:#dcd8cf;margin-top:18px;width:${[96, 88, 93, 80, 91, 70, 94, 85, 90, 76, 92, 84, 60][i]}%;`);
    el(S.dc, 'div', 'position:absolute;left:58px;top:600px;font-family:Elite;font-size:16px;color:#666;white-space:nowrap;', '* nota: será preciso um ajuste fiscal');
    const R = 180;
    S.lp = el(S.m, 'div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;');
    el(S.lp, 'div', `position:absolute;left:${R * .6}px;top:${R * .6}px;width:${R * .95}px;height:46px;border-radius:23px;background:${PRETO};transform-origin:0 50%;transform:rotate(45deg);box-shadow:0 14px 20px rgba(0,0,0,.35);`);
    S.lente = el(S.lp, 'div', `position:absolute;left:${-R}px;top:${-R}px;width:${2 * R}px;height:${2 * R}px;border-radius:50%;overflow:hidden;background:#fbfaf6;border:18px solid ${PRETO};box-sizing:border-box;box-shadow:0 18px 30px rgba(0,0,0,.4), inset 0 0 30px rgba(0,0,0,.12);`);
    S.big = el(S.lente, 'div', `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);white-space:nowrap;font-family:${SERIF};font-weight:700;font-size:44px;color:${VERMELHO};opacity:0;`, 'ajuste fiscal');
    S.rt = rotulo(S.m, 'O DETALHE', 540, 1580, { centro: true, bg: VERMELHO, s: 36, rot: -2 });
    S.cap = CT;
    S.td = c.w('B34', 'detalhe') - .15; S.tn = c.w('B34', 'ninguem') - .05;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'cloth', S.td - .3, { d: .4, g: .2 }); cue(c, 'pop', S.td + .2, { g: .18 });
  },
  update(S, c) {
    const lt = c.lt, q = E.inOut(clamp((lt - S.td + .35) / .5));
    pousa(S.dc, lt, -.3, { dy: -60 });
    S.lp.style.opacity = lt >= S.td - .35 ? 1 : 0;
    S.lp.style.transform = `translate(${lerp(1050, 420, q).toFixed(1)}px,${lerp(1600, 1235, q).toFixed(1)}px)`;
    S.big.style.opacity = ez(lt, S.td + .1, .25).toFixed(3);
    entra(S.rt, lt, S.tn, { dy: 12 });
    S.m.cam(kf(lt, [[0, 1.0], [S.td, 1.02], [c.dur, 1.08]]), 540, kf(lt, [[0, 1040], [c.dur, 1120]]));
  },
});

// S14 — "O Lula vai ter que fazer um ajuste fiscal. Não porque ele quer," a foto oficial do Lula; a tira GASTOS na mesa e, no "ajuste",
// a tesoura corta a tira (as metades caem). O Fernando no círculo (47,85–49,9 s, só enquanto olha a câmera)
scene({
  beats: ['B35', 'B36'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, VERMELHO, 110, 450, 520, 660, -3);
    S.f = foto(S.m, 'print_lula', 360, 760, 420, { rot: -2, tape: ['tl'] });
    S.rt = rotulo(S.m, 'AJUSTE FISCAL', 800, 860, { centro: true, bg: PRETO, s: 36, rot: 3 });
    const tira = (x, w, txt, al) => { const e = el(S.m, 'div', `position:absolute;left:${x}px;top:1230px;width:${w}px;height:130px;background:#fbfaf6 url(${ptex('#fbfaf6', 18)});box-shadow:0 12px 20px rgba(0,0,0,.3);` +
      `font-family:Inter;font-weight:800;font-size:62px;letter-spacing:.1em;line-height:130px;text-align:${al};color:${TINTA};padding:0 30px;box-sizing:border-box;opacity:0;`, txt); e._rot = 0; return e; };
    S.tL = tira(110, 430, 'GAS', 'right'); S.tR = tira(540, 430, 'TOS', 'left');
    S.ts = tesoura(S.m, 720, 1295, 330);
    S.pb = presBola(r, S, 830, 560, 300);
    S.J = [c.b('B35') + .78, c.b('B37') - .1];
    S.cap = CT;
    S.ta = c.w('B35', 'ajuste') - .05;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'tear', S.ta + .05, { g: .4, d: .4 });
  },
  update(S, c) {
    const lt = c.lt, qc = E.in(clamp((lt - S.ta) / .18)), qf = E.in(clamp((lt - S.ta - .15) / .7));
    revela(S.bk, lt, -.4); pousa(S.f, lt, -.3, { dy: -80 }); entra(S.rt, lt, S.ta, { dy: 10 });
    [S.tL, S.tR].forEach((e, i) => { const sg = i ? 1 : -1; tx(e, { x: sg * 60 * qf, y: 700 * qf, r: sg * 28 * qf, o: ez(lt, -.3, .2) * (1 - clamp((lt - S.ta - .6) / .3)) }); });
    S.ts.style.opacity = lt < S.ta + .5 ? ez(lt, -.2, .2) : 1 - ez(lt, S.ta + .5, .25);
    S.ts.at(1 - qc); S.ts.style.transform = `translateX(${(lerp(260, 0, ez(lt, -.2, .5)) - 140 * clamp((lt - S.ta - .25) / .5)).toFixed(1)}px)`;
    bola(S.pb, lt, S.J[0], S.J[1]);
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1000);
  },
});

// S15 — "mas porque não tem mais dinheiro. E o Congresso eleito junto com ele é pró-ajuste." a nota de R$ 20 é puxada para fora no
// "dinheiro" e fica só o contorno; no "Congresso" a foto REAL do Congresso cai e leva o carimbo PRÓ-AJUSTE (sem o círculo: aqui ele fecha os olhos)
scene({
  beats: ['B37', 'B38'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.ol = el(S.m, 'div', `position:absolute;left:160px;top:820px;width:600px;height:300px;border:6px dashed ${TINTA};box-sizing:border-box;opacity:0;transform:rotate(-4deg);`);
    S.ce = foto(S.m, 'print_cedulas', 460, 970, 580, { rot: -4, tape: ['tl'] });
    S.bk = bloco(S.m, PRETO, 250, 900, 420, 640, 3);
    S.co = foto(S.m, 'print_congresso', 460, 1180, 380, { rot: -2, tape: ['tl', 'tr'] });
    S.st = inkStamp(S.m, 'PRÓ-AJUSTE', 600, 1560, { s: 74, c: PRETO, rot: -9 });
    S.cap = CT;
    S.td = c.w('B37', 'dinheiro') - .1; S.tc = c.w('B38', 'congresso') - .15; S.tp = c.w('B38', 'pro') - .05;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'velcro', S.td, { d: .3, g: .28 }); cue(c, 'paper', S.tc, { g: .38 }); cue(c, 'stamp', S.tp + .03, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.ce, lt, -.3, { dy: -90, out: S.td, ox: -1200, oy: -100, od: .4 });
    S.ol.style.opacity = lt > S.td + .1 && lt < S.tc + .2 ? ez(lt, S.td + .1, .2) * (1 - ez(lt, S.tc, .2)) : 0;
    revela(S.bk, lt, S.tc - .05); pousa(S.co, lt, S.tc, { dy: -150 });
    stampIn(S.st, lt, S.tp);
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, kf(lt, [[0, 1000], [S.tc, 1000], [c.dur, 1180]]));
  },
});

// S16 — "A caneta dos gastos não está só na mão" a caneta-tinteiro grande desce sobre o orçamento e risca uma linha vermelha
scene({
  beats: ['B39'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.dc = doc(S.m, 540, 1100, 620, 560, 'Orçamento', { kicker: 'GASTOS PÚBLICOS', rot: -2, n: 7 });
    S.dc.sv = svgAbs(S.dc, 0, 0, 620, 560);
    S.ri = traco(S.dc.sv, 'M 50 330 C 200 322, 400 338, 570 326', { c: VERMELHO, w: 9 });
    S.cn = caneta(S.m, 640, 820, 620, -35);
    S.cap = CT;
    S.tc = c.w('B39', 'caneta') - .15;
    cue(c, 'pencil', S.tc + .6, { g: .24, d: .4 });   // nada em cima do "caneta" (mascarava a palavra na mix)
  },
  update(S, c) {
    const lt = c.lt, q = E.out5(clamp((lt - S.tc) / .45));
    pousa(S.dc, lt, -.3, { dy: -60 });
    S.cn.style.opacity = lt >= S.tc ? 1 : 0;
    S.cn.style.transform = `translate(${(300 * (1 - q) - 260 * ez(lt, S.tc + .3, .6, E.inOut)).toFixed(1)}px,${(-400 * (1 - q) + 230).toFixed(1)}px)`;
    S.ri.draw(ez(lt, S.tc + .3, .6, E.inOut));
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1060);
  },
});

// S17 — tela dividida (3,6 s): "do Palácio do Planalto, tá na mão do Centrão. E o Centrão precisa de que exista dinheiro." em cima, a foto
// do Planalto com a caneta; no "Centrão" a caneta passa para o cartão CENTRÃO; no "dinheiro" as notas aparecem embaixo (a tela dividida sai)
scene({
  beats: ['B40', 'B41', 'B42'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.pl = foto(S.m, 'print_planalto', 300, 420, 430, { rot: -3, tape: ['tl'] });
    S.cc = papel(S.m, 790, 430, 400, 260, { rot: 3 });
    el(S.cc, 'div', `font-family:${SERIF};font-weight:700;font-size:72px;color:${TINTA};text-align:center;`, 'Centrão');
    el(S.cc, 'div', `margin-top:6px;font-family:Elite;font-size:24px;color:#555;text-align:center;`, 'bloco de partidos do Congresso');
    S.bkc = bloco(S.m, VERMELHO, 600, 280, 380, 300, -2); S.m.insertBefore(S.bkc, S.cc);
    S.cn = caneta(S.m, 300, 760, 380, -20);
    S.ce = foto(S.m, 'print_cedulas', 540, 1420, 760, { rot: -3, tape: ['tl', 'tr'] });
    S.mo = moedas(S.m, 860, 1700, 6, 170);
    S.mp = presMetade(r, S, 'baixo');
    S.J1 = c.e('B42') - .82;
    S.cap = { mode: 'glow', y: 1740 };
    S.tc = c.w('B41', 'centrao') - .15; S.td = c.w('B42', 'dinheiro') - .25;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'cloth', S.tc, { d: .4, g: .22 }); cue(c, 'coin', S.J1 + .1, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt, q = E.inOut(clamp((lt - S.tc) / .6));
    pousa(S.pl, lt, -.3, { dy: -80 }); pousa(S.cc, lt, -.15, { dy: -80 }); revela(S.bkc, lt, S.tc + .3);
    S.cn.style.opacity = 1; S.cn.style.transform = `translate(${(lerp(0, 480, q)).toFixed(1)}px,${(lerp(0, -10, q) - 60 * Math.sin(Math.PI * q)).toFixed(1)}px)`;
    pousa(S.ce, lt, S.J1 - .2, { dy: -60 }); S.mo.at(lt, S.J1);
    metade(S.mp, lt, -1, S.J1);
    S.cap = lt > S.J1 + .1 ? CTAGB : { mode: 'glow', y: 1740 };
  },
});

// S18 — "Ele vai indicar os amigos dele" a foto REAL do Supremo Tribunal Federal; o ponto de interrogação vermelho no "amigos"
scene({
  beats: ['B43'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, PRETO, 90, 680, 900, 640, -1.5);
    S.f = foto(S.m, 'print_stf', 540, 990, 860, { rot: 1.5, tape: ['tl', 'tr'] });
    S.lb = nota(S.m, 'Supremo Tribunal Federal, Brasília', 540, 1340, { s: 26, centro: true });
    S.q = serifText(S.m, '?', 860, 760, { s: 260, wt: 700, c: VERMELHO, sh: '-3px 5px 0 rgba(0,0,0,.2)' });
    S.cap = CTAG;
    S.ta = c.w('B43', 'amigos') - .1;
    cue(c, 'paper', .02, { g: .32 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'pop', S.ta, { g: .25 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); pousa(S.f, lt, -.3, { dy: -80 }); entra(S.lb, lt, .1, { dy: 6 });
    tx(S.q, { s: E.back(clamp((lt - S.ta) / .3)), o: lt >= S.ta ? 1 : 0, r: 8 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1000);
  },
});

// S19 — Fernando em tela cheia (2,7 s): "pro STF, Fernando? Talvez. E a gente vai engolir."
pres4(['B44', 'B45', 'B46'], { ...PT, lead: -.14 });   // entra em 61,5 s

// ============================================================================
//  teste_fernando (exemplo da skill vox-fernando: o LulaGanhouEmpresa na paleta laranja/vermelho/branco/preto) — cenas S20–S37 (os recordes das empresas e o final)
// ============================================================================

// S20 — "Só que isso mexe muito menos no seu caixa" a caixa registradora antiga (foto REAL) sobre o bloco laranja; a etiqueta SEU CAIXA
scene({
  beats: ['B47'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, PRETO, 110, 640, 860, 700, 2);
    S.f = foto(S.m, 'print_caixa', 540, 990, 820, { rot: -1.5, tape: ['tl', 'tr'] });
    S.rt = rotulo(S.m, 'SEU CAIXA', 540, 1420, { centro: true, bg: PRETO, s: 38, rot: -2 });
    S.cap = CT;
    S.tc = c.w('B47', 'caixa') - .12;
    cue(c, 'paper', .02, { g: .32 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'coin', S.tc + .05, { g: .28 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); pousa(S.f, lt, -.3, { dy: -90 }); entra(S.rt, lt, S.tc, { dy: 12 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1020);
  },
});

// S21 — "do que a mídia faz parecer. Enquanto você está olhando pesquisa eleitoral," o megafone MÍDIA gritando; no "pesquisa" o celular com
// um gráfico de barras genérico (sem números). O Fernando no círculo (66,0–68,5 s)
scene({
  beats: ['B48', 'B49'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, VERMELHO, 120, 760, 520, 420, -3);
    S.mg = megafone(S.m, 420, 980, 460);
    S.rm = rotulo(S.m, 'MÍDIA', 330, 1260, { centro: true, bg: PRETO, s: 40, rot: -3 });
    S.ph = box(S.m, 780, 1330, 300, 560, `background:#151515;border-radius:40px;box-shadow:0 24px 36px rgba(0,0,0,.45);opacity:0;`);
    const sc = el(S.ph, 'div', 'position:absolute;left:14px;right:14px;top:16px;bottom:16px;border-radius:30px;background:#f4f1ea;overflow:hidden;');
    el(sc, 'div', `position:absolute;left:0;right:0;top:40px;text-align:center;font-family:Inter;font-weight:800;font-size:22px;letter-spacing:.14em;color:${TINTA};`, 'PESQUISA');
    S.bars = [[.62, VERMELHO], [.55, PRETO]].map(([hh, cor], i) => { const b = el(sc, 'div', `position:absolute;left:${60 + i * 100}px;bottom:70px;width:70px;height:${(hh * 340).toFixed(0)}px;background:${cor};transform-origin:50% 100%;transform:scaleY(0);`); return b; });
    S.pb = presBola(r, S, 830, 560, 340);
    S.J = [c.b('B48') + .27, c.w('B49', 'pesquisa') + .62];
    S.cap = CT;
    S.tm = c.w('B48', 'midia') - .1; S.tp = c.w('B49', 'pesquisa') - .2;
    cue(c, 'paper', .02, { g: .26 }); cue(c, 'pop', S.tm, { g: .2 }); cue(c, 'paper', S.tp, { g: .32 }); cue(c, 'tick', S.tp + .35, { g: .2 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); S.mg.style.opacity = 1; tx(S.mg, { y: 40 * (1 - ez(lt, -.3, .4)), r: -4 + 3 * Math.sin(lt * 9) * clamp((lt - S.tm) * 3) * (1 - clamp((lt - S.tm - 1) * 2)) });
    S.mg.ondas(lt, S.tm); entra(S.rm, lt, S.tm, { dy: 12 });
    pousa(S.ph, lt, S.tp, { dy: 300, r0: -6 });
    S.bars.forEach((b, i) => { b.style.transform = `scaleY(${(E.out5(clamp((lt - S.tp - .35 - i * .1) / .5)) * (1 + .03 * Math.sin(lt * 6 + i))).toFixed(3)})`; });
    bola(S.pb, lt, S.J[0], S.J[1]);
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1080);
  },
});

// S22 — "o capitalismo brasileiro. Continua batendo recordes." colunas vermelhas e laranja sobem (ideia, sem números); carimbo RECORDES
scene({
  beats: ['B50', 'B51'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.B = [[150, 200, CINZA_C], [330, 330, BRANCO], [510, 470, '#8a8378'], [690, 620, VERMELHO], [870, 820, PRETO]].map(([x, h, cor]) => barraV(S.m, x - 70, 1520, 140, h, cor));
    S.base = el(S.m, 'div', `position:absolute;left:60px;top:1520px;width:960px;height:8px;background:${TINTA};`);
    S.st = inkStamp(S.m, 'RECORDES', 470, 640, { s: 110, c: PRETO, rot: -8 });
    S.cap = CT;
    S.tr = c.w('B51', 'recordes') - .1;
    S.B.forEach((b, i) => cue(c, 'wood', .1 + i * .18, { g: .2 })); cue(c, 'stamp', S.tr + .03, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    S.B.forEach((b, i) => b.at(E.out5(clamp((lt + .35 - i * .18) / .5)) * (i === 4 ? lerp(1, 1.08, ez(lt, S.tr, .4)) : 1)));
    stampIn(S.st, lt, S.tr);
    S.m.cam(kf(lt, [[0, 1.05], [c.dur, 1.0]]), 540, 1100);
  },
});

// S23 — tela dividida (3,9 s): "A Embraer lucrou mais de um bilhão de reais num único trimestre, crescendo 25%, com a maior carteira de
// pedidos da história dela." em cima, a logo REAL da Embraer, a foto REAL do E195-E2 e o lucro do 2º tri de 2026 (R$ 1,1 bi, +25% sobre
// os R$ 890 mi do 2T25); quando a tela dividida sai, a carteira recorde: US$ 34,5 bi
scene({
  beats: ['B52', 'B53', 'B54', 'B55'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.lg = logo(S.m, 'lg_embraer', 540, 130, 560, { k: .86, pad: .12 });
    S.f = foto(S.m, 'print_embraer', 350, 470, 500, { rot: -2, tape: ['tl'] });
    S.d1 = dado(S.m, 'R$ 1,1 bi', 820, 400, { s: 96, sub: 'LUCRO · 2º TRI 2026', ss: 20 });
    S.se = selo(S.m, 830, 640, 230, '+25%', 'SOBRE O<br>2º TRI 2025', VERMELHO);
    S.fo = FTAG(S.m, 'Embraer, resultado do 2º trimestre de 2026', 540, 905);
    S.d2 = dado(S.m, 'US$ 34,5 bi', 540, 1330, { s: 120, c: PRETO, sub: 'CARTEIRA DE PEDIDOS · RECORDE', ss: 26 });
    S.f2 = FTAG(S.m, 'maior carteira da história da Embraer (2º tri de 2026)', 540, 1500);
    S.mp = presMetade(r, S, 'baixo');
    S.J1 = c.e('B54') + .07;
    S.cap = { mode: 'glow', y: 1740 };
    S.tb = c.w('B52', 'bilhao') - .2; S.t25 = c.w('B54', '25') - .1; S.tc = c.w('B55', 'carteira') - .2;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'type', S.tb, { n: 6, g: .24 }); cue(c, 'stamp', S.t25 + .03, { g: .4 }); cue(c, 'wood', S.tc + .1, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.lg, lt, -.35, { dy: -50 }); pousa(S.f, lt, -.25, { dy: -80 });
    entra(S.d1, lt, S.tb, { dy: 16 }); stampIn(S.se, lt, S.t25); entra(S.fo, lt, S.tb + .4, { dy: 6 });
    metade(S.mp, lt, -1, S.J1);
    tx(S.d2, { s: soco(lt, S.tc + .25, .1) * lerp(1.08, 1, ez(lt, S.tc, .3)), o: ez(lt, S.tc, .2) }); entra(S.f2, lt, S.tc + .4, { dy: 6 });
    S.cap = lt > S.J1 + .1 ? { mode: 'tag', y: 1660, fs: 46 } : { mode: 'glow', y: 1740 };
  },
});

// S24 — "A Renner separou um bilhão de reais para abrir 60 lojas" a foto REAL de uma loja Renner (Rio Sul) e a logo REAL (vermelha);
// no "bilhão" R$ 1,05 bi (investimento previsto para 2026); no "60" a grade de 60 lojinhas acende em laranja
scene({
  beats: ['B56', 'B57'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.f = foto(S.m, 'print_renner', 330, 770, 520, { rot: -3, tape: ['tl'] });
    S.lg = logo(S.m, 'lg_renner', 800, 620, 400, { k: .86, pad: .16 });
    S.d1 = dado(S.m, 'R$ 1,05 bi', 800, 870, { s: 76, sub: 'INVESTIMENTO EM 2026', ss: 20 });
    S.G = [...Array(60)].map((_, i) => el(S.m, 'div', `position:absolute;left:${150 + (i % 12) * 66}px;top:${1150 + Math.floor(i / 12) * 66}px;width:52px;height:52px;background:#d6d1c6;border-radius:4px;box-shadow:0 3px 5px rgba(0,0,0,.18);`));
    S.r60 = rotulo(S.m, 'ATÉ 60 LOJAS NOVAS', 540, 1520, { centro: true, bg: PRETO, s: 32 });
    S.fo = FTAG(S.m, 'Lojas Renner: previsão de 2026 (50 a 60 lojas, investimento de ~R$ 1,05 bi)', 540, 1610, { wrap: 860 });
    S.cap = CT;
    S.tb = c.w('B56', 'bilhao') - .2; S.t60 = c.w('B57', '60') - .12;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'type', S.tb, { n: 6, g: .22 }); for (let i = 0; i < 5; i++) cue(c, 'tick', S.t60 + i * .1, { g: .16 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.f, lt, -.3, { dy: -80 }); pousa(S.lg, lt, -.15, { dy: -60 }); entra(S.d1, lt, S.tb, { dy: 14 });
    S.G.forEach((g, i) => { g.style.background = lt >= S.t60 + i * .012 ? VERMELHO : BRANCO; g.style.opacity = ez(lt, -.2 + i * .004, .2); });
    entra(S.r60, lt, S.t60 + .3, { dy: 10 }); entra(S.fo, lt, S.t60 + .5, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.04]]), 540, 1000);
  },
});

// S25 — "em pleno ano de eleição. A LG inaugurou uma fábrica de um bilhão e meio no sul." o mapa do Sul: o Paraná acende no "LG", o pino em
// Fazenda Rio Grande, a logo REAL da LG e R$ 1,5 bi (fábrica de geladeiras inaugurada em 13/08/2026). O Fernando no círculo (82,0–85,7 s)
scene({
  beats: ['B58', 'B59'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.V = { lon: -50.5, lat: -25.2, z: 6.2, cy: 1150 };
    S.M = mapaBR(r, S.V); S.M.pinta(['SP', 'SC', 'RS', 'MS'], '#ddd8cd', '#f4f1ea');
    S.ur = urna(S.M.ui, 740, 640, 340);
    S.pi = pinoMapa(S.M, S.M.ui, [-49.31, -25.66], { cor: VERMELHO, r: 20 });
    S.lb = rotMapa(S.M, S.M.ui, 'Fazenda Rio Grande (PR)', [-49.31, -25.66], 0, 70, { s: 30 });
    S.lg = logo(S.M.ui, 'lg_lg', 300, 820, 330, { k: .8, pad: .14 });
    S.d1 = dado(S.M.ui, 'R$ 1,5 bi', 330, 1010, { s: 80, sub: 'FÁBRICA DE GELADEIRAS', ss: 20 });
    S.fo = FTAG(S.M.ui, 'LG: fábrica inaugurada em 13/08/2026', 540, 1520);
    S.pb = presBola(r, S, 820, 560, 330);
    S.J = [c.b('B58') + .15, c.e('B59') - .05];
    S.cap = CTAG;
    S.te = c.w('B58', 'eleicao') - .1; S.tl = c.w('B59', 'lg') - .15; S.tb = c.w('B59', 'bilhao') - .2;
    cue(c, 'pop', S.te, { g: .22 }); cue(c, 'paper', S.tl, { g: .32 }); cue(c, 'type', S.tb, { n: 5, g: .22 });
  },
  update(S, c) {
    const lt = c.lt;
    S.M.set({ ...S.V, z: S.V.z * (1 + .05 * clamp(lt / c.dur)) });
    pousa(S.ur, lt, S.te, { dy: -90, out: S.tl - .1, oy: -300 });
    S.M.uf.PR.setAttribute('fill', lt >= S.tl ? VERMELHO : '#ddd8cd');
    S.pi.at(lt, S.tl + .15); S.lb.at(lt, S.tl + .3);
    pousa(S.lg, lt, S.tl, { dy: -60 }); entra(S.d1, lt, S.tb, { dy: 14 }); entra(S.fo, lt, S.tb + .4, { dy: 6 });
    bola(S.pb, lt, S.J[0], S.J[1]);
  },
});

// S26 — "A Scania botou aqui o segundo maior centro de peças do mundo." o caminhão Scania (foto REAL) e a logo REAL; no "segundo" o selo
// 2º e a nota: centro de peças de Vinhedo (SP), o 2º maior da Scania no mundo
scene({
  beats: ['B60'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, PRETO, 120, 660, 840, 660, -2);
    S.f = foto(S.m, 'print_scania', 540, 990, 760, { rot: 1.5, tape: ['tl', 'tr'] });
    S.lg = logo(S.m, 'lg_scania', 230, 560, 230, { k: .7, hmax: .7, pad: .12 });
    S.se = selo(S.m, 850, 640, 250, '2º', 'MAIOR CENTRO<br>DE PEÇAS', BRANCO);
    S.fo = FTAG(S.m, 'Latin Parts Center, Vinhedo (SP): o 2º maior centro de peças da Scania no mundo', 540, 1420, { wrap: 860 });
    S.cap = CT;
    S.ts = c.w('B60', 'segundo') - .1;
    cue(c, 'paper', .02, { g: .3 }); cue(c, 'shutter', .14, { g: .12 }); cue(c, 'stamp', S.ts + .03, { g: .42 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); pousa(S.f, lt, -.3, { dy: -80 }); pousa(S.lg, lt, -.1, { dy: -50 });
    stampIn(S.se, lt, S.ts); entra(S.fo, lt, S.ts + .4, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1020);
  },
});

// S27 — "A Pague Menos está multiplicando o lucro, o Movida crescendo quase 60%." as logos REAIS, cada uma na palavra, com o dado real:
// Pague Menos +76% de lucro no 1º semestre de 2026; Movida +59% de lucro no 1º trimestre de 2026
scene({
  beats: ['B61', 'B62'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.b1 = bloco(S.m, VERMELHO, 100, 520, 420, 520, -2); S.b2 = bloco(S.m, PRETO, 560, 860, 420, 520, 2);
    S.l1 = logo(S.m, 'lg_paguemenos', 310, 640, 360, { k: .8, pad: .16 });
    S.d1 = dado(S.m, '+76%', 310, 860, { s: 110, c: '#fff', sub: 'LUCRO · 1º SEMESTRE 2026', ss: 18, sc: '#fff' });
    S.l2 = logo(S.m, 'lg_movida', 770, 980, 360, { k: .8, pad: .16 });
    S.d2 = dado(S.m, '+59%', 770, 1200, { s: 110, c: '#fff', sub: 'LUCRO · 1º TRI 2026', ss: 18, sc: '#fff' });
    S.fo = FTAG(S.m, 'resultados divulgados pelas empresas (lucro ajustado da Pague Menos; lucro líquido da Movida)', 540, 1520, { wrap: 860 });
    S.cap = CT;
    S.tp = c.w('B61', 'pague') - .15; S.tm = c.w('B62', 'movida') - .15; S.t6 = c.w('B62', '60') - .1;
    cue(c, 'paper', S.tp, { g: .32 }); cue(c, 'paper', S.tm, { g: .32 }); cue(c, 'pop', S.t6, { g: .2 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.b1, lt, S.tp - .05); pousa(S.l1, lt, S.tp, { dy: -60 }); entra(S.d1, lt, S.tp + .4, { dy: 14 });
    revela(S.b2, lt, S.tm - .05); pousa(S.l2, lt, S.tm, { dy: -60 }); tx(S.d2, { s: soco(lt, S.t6 + .1, .12), o: ez(lt, S.tm + .4, .2) });
    entra(S.fo, lt, S.tm + .5, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.04]]), 540, kf(lt, [[0, 900], [S.tm, 900], [S.tm + .6, 1060], [c.dur, 1060]]));
  },
});

// S28 — tela dividida (3,3 s): "E até a Ambev, que vem de cerveja, tá crescendo. O Nubank virou uma das maiores empresas de tecnologia
// do mundo," em cima, a logo REAL da Ambev (lucro +24,5% no 2º tri de 2026); no "Nubank" a logo REAL do Nubank; quando a tela dividida
// sai, embaixo: fundado em 2013, ações na Bolsa de Nova York desde 2021
scene({
  beats: ['B63', 'B64'], tr: 'cut', bg: 'dark', camMove: camStill, lead: -.02,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.A = camada(S.m); S.B = camada(S.m, false);
    S.bk1 = bloco(S.A, PRETO, 160, 180, 760, 560, -2);
    S.l1 = logo(S.A, 'lg_ambev', 540, 380, 560, { k: .8, pad: .16 });
    S.d1 = dado(S.A, '+24,5%', 540, 620, { s: 110, sub: 'LUCRO · 2º TRI 2026', ss: 22 });
    S.f1 = FTAG(S.A, 'Ambev, resultado do 2º trimestre de 2026', 540, 840);
    S.bk2 = bloco(S.B, VERMELHO, 160, 180, 760, 560, 2);
    S.l2 = logo(S.B, 'lg_nubank', 540, 450, 420, { k: .6, hmax: .45, pad: .16 });
    S.n1 = dado(S.m, '2013', 540, 1290, { s: 130, c: PRETO, sub: 'NUBANK É FUNDADO EM SÃO PAULO', ss: 24 });
    S.n2 = FTAG(S.m, 'ações na Bolsa de Nova York desde dezembro de 2021', 540, 1450);
    S.mp = presMetade(r, S, 'baixo');
    S.J1 = c.w('B64', 'maiores') - .01;   // em 95,7 s ele fecha os olhos
    S.cap = { mode: 'glow', y: 1740 };
    S.ta = c.w('B63', 'ambev') - .2; S.tc = c.w('B63', 'crescendo') - .1; S.tn = c.w('B64', 'nubank') - .2;
    cue(c, 'paper', S.ta, { g: .32 }); cue(c, 'type', S.tc, { n: 5, g: .22 }); cue(c, 'paper', S.J1 + .1, { g: .26 });
  },
  update(S, c) {
    const lt = c.lt, k = trocaC(lt, [[-9, S.A], [S.tn, S.B]]);
    if (k === 0) { revela(S.bk1, lt, S.ta - .1); pousa(S.l1, lt, S.ta, { dy: -60 }); entra(S.d1, lt, S.tc, { dy: 14 }); entra(S.f1, lt, S.tc + .3, { dy: 6 }); }
    else { revela(S.bk2, lt, S.tn - .05); pousa(S.l2, lt, S.tn, { dy: -60 }); }
    metade(S.mp, lt, -1, S.J1);
    entra(S.n1, lt, S.J1 + .1, { dy: 14 }); entra(S.n2, lt, S.J1 + .4, { dy: 6 });
    S.cap = lt > S.J1 + .1 ? { mode: 'tag', y: 1660, fs: 46 } : { mode: 'glow', y: 1740 };
  },
});

// S29 — "com o Lula e Dilma na presidência," as fotos oficiais do Lula e da Dilma lado a lado, com os anos dos mandatos (Lula 2003–2010,
// Dilma 2011–2016) e a nota: o Nubank nasceu em 2013
scene({
  beats: ['B65'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.f1 = foto(S.m, 'print_lula', 300, 900, 380, { rot: -4, tape: ['tl'] });
    S.f2 = foto(S.m, 'print_dilma', 780, 930, 380, { rot: 3, tape: ['tr'] });
    S.a1 = rotulo(S.m, 'LULA · 2003–2010', 300, 1240, { centro: true, bg: PRETO, s: 28 });
    S.a2 = rotulo(S.m, 'DILMA · 2011–2016', 780, 1270, { centro: true, bg: VERMELHO, s: 28 });
    S.fo = FTAG(S.m, 'Nubank fundado em 2013, no governo Dilma', 540, 1400);
    S.cap = CTAG;
    S.tl = c.w('B65', 'lula') - .15; S.td = c.w('B65', 'dilma') - .15;
    cue(c, 'paper', S.tl, { g: .34 }); cue(c, 'paper', S.td, { g: .34 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.f1, lt, Math.min(-.1, S.tl), { dy: -90 }); pousa(S.f2, lt, S.td, { dy: -90 });
    entra(S.a1, lt, S.tl + .2, { dy: 8 }); entra(S.a2, lt, S.td + .2, { dy: 8 }); entra(S.fo, lt, S.td + .4, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1060);
  },
});

// S30 — "e a WEG continua vendendo motor para o planeta inteiro a partir de Jaraguá do Sul." o mapa-múndi: Santa Catarina acende, o pino
// em Jaraguá do Sul, a logo REAL da WEG; no "planeta" as rotas laranja saem para o mundo. O Fernando no círculo (98,5–101,2 s)
scene({
  beats: ['B66', 'B67'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.V = { lon: -20, lat: 2, z: .62, cy: 1150 };
    S.M = mapaBR(r, S.V); S.M.pinta(GEO.br.states.map(s => s.uf), BRANCO, '#c9c2b5'); S.M.pinta(['SC'], VERMELHO, '#f4f1ea');
    S.sv = svgAbs(S.M.ui, 0, 0, W, H);
    S.R = [[-95, 38], [10, 50], [80, 25], [115, 32], [25, -28], [-70, -33]].map(([lo, la], i) => rotaSeta(S.sv, [-49.07, -26.49], [lo, la], { c: PRETO, w: 6, bend: i % 2 ? .2 : -.2, dash: '3 14' }));
    S.pi = pinoMapa(S.M, S.M.ui, [-49.07, -26.49], { cor: VERMELHO, r: 16 });
    S.lb = rotMapa(S.M, S.M.ui, 'Jaraguá do Sul (SC)', [-49.07, -26.49], 30, 60, { s: 28 });
    S.lg = logo(S.M.ui, 'lg_weg', 300, 680, 240, { k: .6, hmax: .62, pad: .14 });
    S.pb = presBola(r, S, 830, 560, 330);
    S.J = [c.b('B66') + .02, c.e('B66') - .15];
    S.cap = CTAG;
    S.tw = c.w('B66', 'weg') - .15; S.tp = c.w('B66', 'planeta') - .1; S.tj = c.w('B67', 'jaragua') - .15;
    cue(c, 'paper', S.tw, { g: .3 }); cue(c, 'whoosh', S.tp, { d: .7, g: .12 }); cue(c, 'pop', S.tj, { g: .2 });
  },
  update(S, c) {
    const lt = c.lt;
    S.M.set({ ...S.V, z: S.V.z * (1 + .06 * clamp(lt / c.dur)) });
    pousa(S.lg, lt, S.tw, { dy: -60 }); S.pi.at(lt, S.tw + .2);
    S.R.forEach((p, i) => p.at(S.M, ez(lt, S.tp + i * .08, .6, E.inOut)));
    S.lb.at(lt, S.tj);
    bola(S.pb, lt, S.J[0], S.J[1]);
  },
});

// S31 — "O desemprego está na mínima histórica." 5,4%: a menor taxa da série do IBGE (PNAD Contínua, desde 2012), no trimestre até junho
// de 2026; a seta vermelha desce
scene({
  beats: ['B68'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.bk = bloco(S.m, PRETO, 140, 700, 800, 600, -2);
    S.d = dado(S.m, '5,4%', 540, 960, { s: 230, c: '#fff', sub: 'DESEMPREGO', ss: 34, sc: BRANCO });
    S.sv = svgAbs(S.m, 0, 0, W, H);
    S.se = traco(S.sv, 'M 880 760 C 890 860, 885 980, 880 1120 M 840 1080 L 880 1126 L 920 1080', { c: BRANCO, w: 14 });
    S.fo = FTAG(S.m, 'IBGE, PNAD Contínua: trimestre até junho de 2026, a menor taxa da série (desde 2012)', 540, 1400, { wrap: 860 });
    S.cap = CT;
    S.tm = c.w('B68', 'minima') - .1;
    cue(c, 'slam', .02, { g: .22 }); cue(c, 'marker', S.tm, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    revela(S.bk, lt, -.5); tx(S.d, { s: lerp(1.08, 1, ez(lt, -.2, .4)), o: 1 }); S.se.draw(ez(lt, S.tm, .4)); entra(S.fo, lt, .3, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1000);
  },
});

// S32 — "E a abertura de negócios bateu recorde esse ano." seis placas FECHADO viram ABERTO uma a uma; o dado real: 2,96 milhões de pequenos
// negócios abertos no 1º semestre de 2026, +12% (DataSebrae). A palavra "recorde" não vai para a tela (não há confirmação nacional)
scene({
  beats: ['B69'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.P = [...Array(6)].map((_, i) => ({ e: placaLoja(S.m, 300 + (i % 2) * 480, 640 + Math.floor(i / 2) * 230, 380), i }));
    S.d = dado(S.m, '2,96 milhões', 540, 1370, { s: 100, c: PRETO, sub: 'PEQUENOS NEGÓCIOS ABERTOS · 1º SEM. 2026 · +12%', ss: 22 });
    S.fo = FTAG(S.m, 'DataSebrae, com dados da Receita Federal (MEI, micro e pequenas empresas)', 540, 1530, { wrap: 860 });
    S.cap = CT;
    S.ta = c.w('B69', 'abertura') - .1;
    S.P.forEach(p => cue(c, 'click', S.ta + p.i * .14, { g: .22 }));
  },
  update(S, c) {
    const lt = c.lt;
    S.P.forEach(p => p.e.at(lt, -.3, S.ta + p.i * .14));
    entra(S.d, lt, S.ta + .6, { dy: 14 }); entra(S.fo, lt, S.ta + .9, { dy: 6 });
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1000);
  },
});

// S33 — tela dividida (3,6 s): "Nenhuma empresa tem que esperar a apuração para decidir se vai crescer." em cima, a urna (APURAÇÃO) e a
// placa ABERTO; no "esperar" o X vermelho risca a urna; no "crescer" a seta laranja sobe
scene({
  beats: ['B70', 'B71'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.top = el(r, 'div', 'position:absolute;left:0;top:0;width:1080px;height:960px;overflow:hidden;');
    paperBg(S.top);
    S.ur = urna(S.top, 330, 470, 440);
    S.pl = placaLoja(S.top, 800, 380, 340);
    S.sv = svgAbs(S.top, 0, 0, 1080, 960);
    S.xa = traco(S.sv, 'M 140 300 L 520 640', { c: VERMELHO, w: 18 }); S.xb = traco(S.sv, 'M 520 300 L 140 640', { c: VERMELHO, w: 18 });
    S.se = scribble(S.sv, 'M 650 800 L 720 690 L 780 740 L 900 540 M 860 556 L 904 532 L 914 582', { c: BRANCO, w: 16 });
    S.mp = presMetade(r, S, 'baixo');
    S.cap = { mode: 'glow', y: 1740 };
    S.te = c.w('B70', 'esperar') - .05; S.tc = c.w('B71', 'crescer') - .15; S.tf = c.e('B70') + .02;   // placa vira entre "apuração" e "para"
    cue(c, 'paper', .02, { g: .28 }); cue(c, 'marker', S.te, { g: .26 }); cue(c, 'click', S.tf, { g: .2 }); cue(c, 'marker', S.tc, { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.ur, lt, -.3, { dy: -60 }); S.pl.at(lt, -.2, S.tf);
    S.xa.draw(ez(lt, S.te, .25)); S.xb.draw(ez(lt, S.te + .15, .25)); S.se.draw(ez(lt, S.tc, .45));
    metade(S.mp, lt, -1, c.dur + 1);
  },
});

// S34 — "O empresário brasileiro não cresce por causa do governo," a laje preta GOVERNO em cima da mesa; no "cresce" a seta laranja rompe a
// laje de baixo para cima e ela racha
scene({
  beats: ['B72'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.sv = svgAbs(S.m, 0, 0, W, H);
    S.se = scribble(S.sv, 'M 540 1500 L 540 560 M 490 610 L 540 552 L 590 610', { c: BRANCO, w: 26 });
    S.la = box(S.m, 540, 900, 760, 190, `background:${PRETO} url(${ptex('#efece4', 30)});background-blend-mode:multiply;box-shadow:0 20px 30px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;` +
      `font-family:${SERIF};font-weight:700;font-size:92px;letter-spacing:.1em;color:#f4f1ea;`);
    S.la.textContent = 'GOVERNO';
    S.sv2 = svgAbs(S.m, 0, 0, W, H);
    S.rc = traco(S.sv2, 'M 560 806 L 530 860 L 575 905 L 520 960 L 560 994', { c: '#f4f1ea', w: 6 });
    S.cap = CT;
    S.tc = c.w('B72', 'cresce') - .1;
    cue(c, 'slam', .05, { g: .25 }); cue(c, 'tear', S.tc + .35, { g: .35, d: .3 });
  },
  update(S, c) {
    const lt = c.lt, sh = lt > S.tc + .35 ? Math.sin((lt - S.tc) * 40) * 6 * Math.exp(-(lt - S.tc - .35) * 6) : 0;
    tx(S.la, { y: 40 * (1 - ez(lt, -.3, .35)) + (lt > S.tc + .35 ? -30 * ez(lt, S.tc + .35, .3) : 0), r: sh * .3, o: 1 });
    S.se.draw(ez(lt, S.tc, .5, E.inOut)); S.rc.draw(ez(lt, S.tc + .35, .2));
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.05]]), 540, 1000);
  },
});

// S35 — Fernando em tela cheia (3,9 s): "ele cresce apesar dele. Então, bora, abre a loja, liga pra cliente e segue o baile."
pres4(['B73', 'B74', 'B75'], { ...PT, lead: -.12 });   // entra em 112,95 s

// S36 — "Não andem ansiosos por coisa alguma." a citação bíblica (Filipenses 4,6) num cartão de papel com a fita vermelha de marcador
scene({
  beats: ['B76', 'B77'], tr: 'cut', bg: 'dark', camMove: camStill, lead: .4,
  build(r, S, c) {
    paperBg(r);
    S.m = mesa(r);
    S.cd = papel(S.m, 540, 1000, 700, 820, { rot: -2 });
    el(S.cd, 'div', `position:absolute;left:0;right:0;top:140px;text-align:center;font-family:${SERIF};font-style:italic;font-size:62px;line-height:1.2;color:${TINTA};`, '“Não andeis<br>ansiosos de<br>coisa alguma”');
    el(S.cd, 'div', `position:absolute;left:0;right:0;top:520px;text-align:center;font-family:Inter;font-weight:800;font-size:30px;letter-spacing:.2em;color:${VERMELHO};`, 'FILIPENSES 4,6');
    S.fi = el(S.m, 'div', `position:absolute;left:760px;top:560px;width:60px;height:0;background:${VERMELHO};clip-path:polygon(0 0,100% 0,100% 100%,50% 88%,0 100%);box-shadow:0 6px 10px rgba(0,0,0,.25);`);
    S.cap = { mode: 'tag', y: 1660, fs: 46 };
    cue(c, 'paper', .3, { g: .34 }); cue(c, 'peel', .7, { g: .2, d: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    pousa(S.cd, lt, .25, { dy: -100 }); S.fi.style.height = `${(380 * E.out5(clamp((lt - .6) / .6))).toFixed(1)}px`;
    S.m.cam(kf(lt, [[0, 1.0], [c.dur, 1.06]]), 540, 1000);
  },
});

// S37 — FINAL: "Bora continuar acreditando naquilo que sempre deu certo. Nosso próprio trabalho." o papel laranja sobe com o celular e o
// perfil REAL do Fernando (@fernandomiranda777); no "trabalho" o botão Seguir vira "Seguindo ✓"
scene({
  beats: ['B78', 'B79'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = camada(r); fundo(S.A, VERMELHO);
    S.m = mesa(S.A);
    S.cel = celular(S.m, 600, 540, 1080);
    S.nm = el(S.A, 'div', `position:absolute;left:50%;top:1820px;transform:translateX(-50%);white-space:nowrap;font-family:${SERIF};font-style:italic;font-size:36px;color:${TINTA};opacity:0;`, 'Fernando Miranda · @fernandomiranda777');
    S.cap = { mode: 'title', y: 230 };   // serifa clara sobre o papel vermelho
    S.ts = c.w('B79', 'trabalho') - .05;
    cue(c, 'paper', 0, { g: .45 }); cue(c, 'click', S.ts, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, qa = E.out5(clamp((lt + .05) / .4));
    S.A.style.transform = `translateY(${lerp(1950, 0, qa).toFixed(1)}px)`;
    S.cel.style.opacity = 1; tx(S.cel, { r: 0 });
    const v = lt >= S.ts, q = lt >= S.ts && lt < S.ts + .12 ? .94 : 1;
    S.cel.bt.style.transform = `scale(${q})`; S.cel.bt.style.background = v ? '#e9e5dc' : VERMELHO; S.cel.bt.style.color = v ? TINTA : '#fff'; S.cel.bt.textContent = v ? 'Seguindo ✓' : 'Seguir';
    let e = S.rg; if (!e) e = S.rg = sv(S.cel.sv, 'circle', { cx: 300, cy: S.cel.pos.seguir.toFixed(1), r: 0, fill: 'none', stroke: TINTA, 'stroke-width': 6 });
    const qq = ez(lt, S.ts, .5, E.out); e.setAttribute('r', (20 + 120 * qq).toFixed(1)); e.setAttribute('opacity', v ? (1 - qq).toFixed(3) : 0);
    const yb = S.cel.pos.seguir + 1080 - 615;
    S.m.cam(kf(lt, [[0, 1.0], [S.ts - .5, 1.12], [c.dur, 1.12]]), 540, kf(lt, [[0, 1080], [S.ts - .5, yb - 150], [c.dur, yb - 150]]));
  },
});
