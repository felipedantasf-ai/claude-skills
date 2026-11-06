// ============================================================================
//  DEMO do ajuste "cores vivas e chamativas" (skill vox-editorial, 14/10/2026) — usa as falas do PT Bahia
//  Imagens novas: g_megafone_cor, g_prato_cor (recortes coloridos), q_comicio_cor (foto colorida 9:16).
//  q_familia é a foto P&B do PT Bahia "resgatada" com duotone.
// ============================================================================

// D1 — "O PT governa a Bahia há 20 anos prometendo acabar com a pobreza."
// gancho: raios ciano/azul atrás do megafone VERMELHO (par complementar) + formas de papel + ondas amarelas no "prometendo"
scene({
  beats: ['B01', 'B02', 'B03'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.ra = raios(r, 500, 1130, { r: 600, c1: K.ciano, c2: K.azul, n: 18 });
    S.fo = formas(r, 500, 1130, { r: 470, n: 8, seed: 2, cores: [K.amarelo, K.rosa, K.laranja, K.verde, K.amarelo, K.roxo] });
    S.mega = cut(r, 'g_megafone_cor', 480, 1130, 800, { plain: true, shadow: false }); viva(S.mega, 1.1, '0 26px 30px rgba(0,0,0,.35)');
    S.sv = svgAbs(r, 0, 0, W, H);
    S.ondas = [0, 1, 2].map(i => scribble(S.sv, `M ${905 + i * 36} ${960 - i * 50} Q ${955 + i * 48} 1130 ${905 + i * 36} ${1300 + i * 50}`, { w: 11 }));
    S.cap = { mode: 'title', y: 330 };
    const tp = c.w('B03', 'prometendo');
    cue(c, 'paper', 0, { g: .4 }); cue(c, 'whoosh', tp - .15, { d: .4, g: .3 }); cue(c, 'pop', tp - .05, { g: .5 });
  },
  update(S, c) {
    const lt = c.lt, tp = c.w('B03', 'prometendo');
    S.ra.at(lt, -1);
    riseIn(S.mega, lt, -1, { dy: 900, seed: 1, s: soco(lt, tp - .05, .12) });
    S.fo.at(lt, tp - .05);
    S.ondas.forEach((o, i) => { const u = ((lt - tp) * 1.6 - i * .3) % 1; o.draw(lt > tp ? E.out(clamp(u)) : 0); });
  },
});

// D2 — "Fome, fila no posto e medo de sair na rua."
// prato de ágata AZUL caindo num bloco LARANJA (par complementar) + anel desenhado
scene({
  beats: ['B30', 'B31', 'B32'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.bl = pblock(r, K.laranja, 110, 620, 860, 940);
    S.prato = cut(r, 'g_prato_cor', 540, 1090, 720, { plain: true, shadow: false }); viva(S.prato, 1.05, '0 22px 26px rgba(0,0,0,.35)');
    S.sv = svgAbs(r, 0, 0, W, H);
    S.anel = roughRing(S.sv, 540, 1090, 390, 360, { w: 10, seed: 3, c: K.ink });
    S.cap = { mode: 'title', y: 330 };
    cue(c, 'paper', 0, { g: .4 }); cue(c, 'pop', .15, { g: .4 }); cue(c, 'marker', .45, { d: .4, g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    riseIn(S.bl, lt, -.3, { dy: 900, d: .45, amp: 0 });
    dropIn(S.prato, lt, -.15, { dy: -1100, r0: 14, seed: 2, amp: 1.2 });
    S.anel.draw(ez(lt, .45, .45, E.inOut));
  },
});

// D4 — "Quase 1 em cada 10 adultos baianos não conseguem ler um bilhete. No Brasil inteiro, é 1 em cada 20."
// colunas vivas proporcionais (vermelho × ciano) com soco no número; a cortina colorida fecha a cena e abre a próxima
scene({
  beats: ['B37', 'B38', 'B39'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    const base = 1430, k = 88;
    S.cols = [[K.vermelho, 330, 9.5, '9,5%', 'Bahia'], [K.ciano, 750, 4.9, '4,9%', 'Brasil']].map(([cor, x, v, txt, nome]) => {
      const h = v * k, b = pblock(r, cor, x - 170, base - h, 340, h);
      b.style.transformOrigin = '50% 100%';
      return { b, n: serifText(r, txt, x, base - h - 90, { s: 130, wt: 700 }), l: serifText(r, nome, x, base + 70, { s: 60, wt: 600, it: true }) };
    });
    S.src = tagL(r, 'analfabetismo, 15 anos ou mais · IBGE, PNAD Contínua 2025', 540, 1610, { s: 30 });
    S.wp = cortina(r, { cores: [K.amarelo, K.rosa, K.ciano] });
    S.cap = { mode: 'title', y: 300 };
    const t1 = c.w('B37', '10'), t2 = c.w('B39', '20');
    cue(c, 'pop', t1 - .1, { g: .5 }); cue(c, 'pop', t2 - .1, { g: .5 }); cue(c, 'whoosh', c.dur - .3, { d: .4, g: .35 });
  },
  update(S, c) {
    const lt = c.lt, t1 = c.w('B37', '10'), t2 = c.w('B39', '20');
    S.cols.forEach((o, i) => {
      const t = i ? t2 : t1, g = E.back(clamp((lt - t + .15) / .5));
      o.b.style.opacity = lt > t - .15 ? 1 : 0; o.b.style.transform = `scaleY(${g.toFixed(4)})`;
      tx(o.n, { o: ez(lt, t + .15, .2), s: soco(lt, t + .15, .18) });
      tx(o.l, { o: ez(lt, t - .1, .2) });
    });
    tx(S.src, { o: ez(lt, t2 + .4, .3) });
    S.wp.at(lt, c.dur);
  },
});

// D3 — "Segundo." — a cortina termina de passar e revela o capítulo 2 em ciano (painel da cortina = cor do capítulo)
scene({
  beats: ['B53', 'B54'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.bl = pblock(r, K.ciano, -30, -30, 1140, 1980); S.bl.style.opacity = 1;
    S.fo = formas(r, 540, 960, { r: 430, n: 7, seed: 5, cores: [K.amarelo, K.rosa, K.laranja, K.ink, K.roxo] });
    S.n = serifText(r, '2', 540, 960, { s: 560, wt: 600, c: '#fff', sh: '-8px 12px 0 rgba(0,0,0,.2)' });
    S.wp = cortina(r, { cores: [K.amarelo, K.rosa, K.ciano] });
    S.cap = { mode: 'dark', y: 330 };
    cue(c, 'pop', .2, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    tx(S.n, { o: 1, s: lerp(1.15, 1, E.out5(clamp(lt / .3))) });
    S.fo.at(lt, .2);
    S.wp.at(lt, 0);
  },
});

// D5 — "Gente pobre o bastante para depender. E esse insumo continua garantido."
// a foto P&B do PT Bahia resgatada com duotone (índigo → amarelo) + carimbo GARANTIDO
scene({
  beats: ['B65', 'B66'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.pb = plateCor(r, 'q_familia', { sat: 1, vig: .35 }); duotone(S.pb.img, '#1d1060', K.amarelo);
    S.st = inkStamp(r, 'GARANTIDO', 540, 640, { s: 120, c: K.vermelho, rot: -9 });
    S.cap = { mode: 'glow', y: 1500 };
    cue(c, 'stamp', c.w('B66', 'garantido') - .22, { g: .8 });
  },
  update(S, c) {
    const lt = c.lt;
    S.pb.push(lt, 6, { s0: 1.03, ds: .07, dy: -12 });
    stampIn(S.st, lt, c.w('B66', 'garantido') - .22);
  },
});

// D6 — "A dúvida que fica é quando o povo do Nordeste vai perceber que aqueles que vivem prometendo melhora"
// foto COLORIDA do comício (de costas) + seta e anel amarelos (motion colorido)
scene({
  beats: ['B88', 'B89', 'B90'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.pa = plateCor(r, 'q_comicio_cor', { sat: 1.05, vig: .35 });
    S.sv = svgAbs(r, 0, 0, W, H);
    S.seta = scribble(S.sv, 'M 400 1250 C 395 1150, 430 1070, 478 1022 M 445 1031 L 478 1022 L 469 1055', { w: 9 });
    S.anel = roughRing(S.sv, 509, 935, 135, 88, { w: 9, seed: 4 });
    S.cap = { mode: 'glow', y: 1500 };
    cue(c, 'pencil', c.w('B89', 'perceber') - .1, { d: .45, g: .45 }); cue(c, 'marker', c.w('B90', 'aqueles') - .15, { d: .4, g: .45 });
  },
  update(S, c) {
    const lt = c.lt;
    S.pa.push(lt, 6, { ds: .04, dy: -8 });
    S.seta.draw(ez(lt, c.w('B89', 'perceber') - .1, .45, E.inOut)); S.anel.draw(ez(lt, c.w('B90', 'aqueles') - .15, .45, E.inOut));
  },
});
