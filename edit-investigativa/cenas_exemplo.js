// ============================================================================
//  edit-investigativa — cenas de exemplo (teste de 28/10/2026: projetos/teste_investigativa, corte do audio1022
//  "Nordeste obras fantasmas", B01–B49 = 0–66 s). Uma de cada cenário, comentadas. Copie a estrutura, não os assets.
//  Assets usados: i_* / f_* / p_* (provas.py), d_gazeta / d_vermelho / d_diario (pagina.py --url, prints REAIS), t_parede, g_tv60.
// ============================================================================

// mural do vídeo: definido UMA vez; cada visita mostra o que já foi citado (desde) e acende o que entra naquela fala
const M = mural()
  .foto('lula', 'i_lula', 1850, 760, { w: 560, rot: 2, dz: -40, desde: 'B19' })
  .foto('transn', 'i_transn', 1420, 1420, { w: 640, rot: -3, dz: 30, desde: ['B22', 'Transnordestina'] })
  .foto('refin', 'i_abreu', 2260, 1260, { w: 600, rot: 2.5, dz: 0, desde: ['B24', 'refinarias'] })
  .doc('gazeta', 'd_gazeta', 2440, 2020, { w: 520, rot: -1.5, dz: 20, desde: ['B37', 'bilh'], recorte: [.04, .34] })
  .doc('vermelho', 'd_vermelho', 1160, 2140, { w: 480, rot: 1.5, dz: -20, desde: 'B40', recorte: [0, .36] })
  .doc('diario', 'd_diario', 1780, 2300, { w: 540, rot: -2, dz: 40, desde: ['B46', '2010'], recorte: [.04, .3] })
  .fio('lula', 'transn', { desde: ['B22', 'Transnordestina'] })
  .fio('lula', 'refin', { desde: ['B24', 'refinarias'] })
  .fio('refin', 'gazeta', { desde: ['B37', 'bilh'] })
  .fio('lula', 'vermelho', { desde: 'B40' })
  .fio('transn', 'diario', { desde: ['B46', '2010'] });

// S1 — "Olhe para o mapa por um segundo. O Nordeste brasileiro tem 3 mil quilômetros" (mapa escuro; o Nordeste acende em vermelho)
const NE9 = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];
mapaCena(['B01', 'B02', 'B03', 'B04'], {
  alvo: NE9,
  acende: c => Object.fromEntries(NE9.map((uf, i) => [uf, c.w('B03', 'Nordeste') - .05 + i * .04])),
  cam: c => [[0, { x: 540, y: 930, z: 1.12, r: -1.5 }], [c.w('B03', 'Nordeste') - .25, { x: 640, y: 900, z: 1.2, r: -.5 }],
    [c.w('B04', 'tem'), { x: 780, y: 840, z: 1.45, r: 0 }], [c.dur + .3, { x: 820, y: 830, z: 1.62, r: .8 }]],
  rotulos: (p, svg, S, c) => ({
    ne: linha(p, [['Nordeste', 's', { s: 76 }]], 690, 655, { alinha: 'centro' }),
    km: linha(p, [['3 mil km', 'v', { s: 66 }]], 950, 915, { alinha: 'esq' }),
    tr: tracejado(svg, curva(985, 870, 915, 790, .3), { c: IV.verm, w: 1.8, dash: 6, gap: 5 }),
  }),
  build(r, S, c) { const tN = c.w('B03', 'Nordeste') - .1; S.cap = lt => lt < tN ? { modo: 'palavra' } : { modo: 'none' }; },
  update(S, c) {
    const lt = c.lt;
    S.rot.ne.at(lt, c.w('B03', 'Nordeste') - .03);
    S.rot.km.at(lt, c.w('B04', '3') - .03, { letras: true });
    S.rot.tr.draw(clamp((lt - c.w('B04', 'quil')) / .45));
  },
});

// S2 — "das praias mais bonitas do planeta," (foto de arquivo P&B: Jericoacoara, CE)
fotoCena(['B05'], 'f_praia', { z0: 1.16, z1: 1.02, fx: .42, fy: .5 });

// S3 — "gera quase 90% da energia limpa do Brasil e tem os portos mais próximos dos Estados Unidos e da Europa."
//      (o 90% é da geração EÓLICA, não da energia limpa: na tela só "energia limpa" sem número, como na versão Vox)
scene({
  beats: ['B06', 'B07', 'B08', 'B09'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 900, z: 1.04 }], [c.w('B08', 'portos') - .35, { x: 540, y: 960, z: 1.0 }],
    [c.w('B08', 'portos') + .35, { x: 540, y: 2060, z: .98 }], [c.w('B09', 'Estados') + .2, { x: 500, y: 2240, z: .96, r: -.6 }],
    [c.dur, { x: 545, y: 2330, z: 1.0, r: .4 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [820, 380] });
    S.cap = lt => lt < c.w('B07', 'energia') - .1 ? { modo: 'palavra', y: 1520 } : { modo: 'none' };
    S.eol = impressa(r, 'i_eolica', 540, 820, 700, { rot: -2.5 });
    S.l1 = linha(r, [['parque eólico · Rio do Fogo (RN)', 'a', { s: 30, cor: IV.cinza }]], 540, 1150, { alinha: 'centro' });
    S.t1 = linha(r, [['energia', 's', { s: 130 }], ['limpa', 'v', { s: 130 }]], 540, 1340, { alinha: 'centro' });
    S.svg = svgAbs(r, 0, 0, W, 3000);
    S.fio = tracejado(S.svg, reta(540, 1400, 540, 1640), { c: IV.verm, w: 2.2 });
    S.por = impressa(r, 'i_porto', 540, 1880, 640, { rot: 2 });
    S.t2 = linha(r, [['os portos mais', 'a', { s: 50 }], ['próximos', 'A', { s: 54 }]], 540, 2190, { alinha: 'centro' });
    S.eua = linha(r, [['Estados Unidos', 's', { s: 92 }]], 345, 2420, { alinha: 'centro' });
    S.eur = linha(r, [['Europa', 'v', { s: 116 }]], 800, 2560, { alinha: 'centro' });
    S.ta = tracejado(S.svg, curva(470, 2215, 330, 2335, .25), { w: 2 });
    S.tb = tracejado(S.svg, curva(640, 2215, 790, 2460, -.3), { w: 2, c: IV.verm });
  },
  update(S, c) {
    const lt = c.lt;
    S.eol.at(lt, 0); S.l1.at(lt, .35);
    S.t1.at(lt, [c.w('B07', 'energia') - .03, c.w('B07', 'limpa') - .03]);
    S.fio.draw(clamp((lt - c.w('B08', 'portos') + .45) / .5));
    S.por.at(lt, c.w('B08', 'portos') - .15);
    S.t2.at(lt, [c.w('B08', 'os') - .03, c.w('B08', 'pr') - .03]);
    S.ta.draw(clamp((lt - c.w('B09', 'Estados') + .1) / .4)); S.eua.at(lt, c.w('B09', 'Estados') - .03);
    S.tb.draw(clamp((lt - c.w('B09', 'Europa') + .1) / .4)); S.eur.at(lt, c.w('B09', 'Europa') - .03);
  },
});

// S4 — "Pela lógica da economia, deveria ser a Califórnia brasileira, a região mais rica da nação."
scene({
  beats: ['B10', 'B11', 'B12'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 840, z: 1.06 }], [c.w('B11', 'Calif') - .2, { y: 900, z: 1.02 }], [c.dur, { x: 540, y: 1030, z: 1.08, r: .6 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [300, 1500] });
    S.t1 = linha(r, [['Pela lógica da', 'a', { s: 52 }], ['economia,', 'A', { s: 56 }]], 540, 560, { alinha: 'centro' });
    S.cal = impressa(r, 'i_california', 540, 880, 760, { rot: -1.5 });
    S.l1 = linha(r, [['Big Sur, Califórnia (EUA)', 'a', { s: 28, cor: IV.cinza }]], 540, 1135, { alinha: 'centro' });
    S.t2 = linha(r, [['Califórnia', 'S', { s: 165 }]], 540, 1320, { alinha: 'centro', letras: true });
    S.t3 = linha(r, [['brasileira,', 'V', { s: 165 }]], 540, 1465, { alinha: 'centro' });
    S.t4 = linha(r, [['a região mais', 'a', { s: 48 }], ['rica', 'A', { s: 54 }], ['da nação.', 'a', { s: 48 }]], 540, 1565, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt, [c.w('B10', 'Pela') - .03, c.w('B10', 'economia') - .03]);
    S.cal.at(lt, c.w('B11', 'deveria') - .1); S.l1.at(lt, c.w('B11', 'deveria') + .2);
    S.t2.at(lt, c.w('B11', 'Calif') - .03);
    S.t3.at(lt, c.w('B11', 'brasileira') - .03);
    S.t4.at(lt, [c.w('B12', 'a') - .03, c.w('B12', 'rica') - .03, c.w('B12', 'da') - .03]);
  },
});

// S5 — avatar P1: "Mas por que ele continua sendo a região mais pobre do país?"
presInv(['B13', 'B14']);

// S6 — "A resposta está num segredo dos últimos 20 anos que ninguém tem coragem de te contar na televisão." (TV de tubo no quarto escuro)
tvCena(['B15', 'B16', 'B17', 'B18'], {
  img: 'd_gazeta', pos: '30% 0%', rack: c => .05,
  cam: c => [[0, { x: 540, y: 1080, z: 1.0, r: -1.5 }], [c.dur, { x: 540, y: 1010, z: 1.24, r: 1.2 }]],
});

// S7 — "Em 2006, venderam o sonho de industrializar o Nordeste." (recorte com tarja: o nome só sai em S10)
scene({
  beats: ['B19', 'B20', 'B21'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 1000, z: 1.0 }], [c.dur, { x: 600, y: 920, z: 1.1, r: .5 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [800, 500] });
    S.ano = linha(r, [['Em', 'a', { s: 60 }], ['2006,', 'V', { s: 250 }]], 540, 600, { alinha: 'centro', letras: true });
    S.lula = recorte(r, 'p_lula', 470, 1500, 1060, { tarja: true });
    S.t1 = linha(r, [['venderam o', 'a', { s: 52 }], ['sonho', 's', { s: 124 }]], 560, 820, { alinha: 'centro' });
    S.t2 = linha(r, [['de industrializar o', 'a', { s: 44 }], ['Nordeste.', 'v', { s: 96 }]], 560, 950, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.ano.at(lt, [0, c.w('B19', '2006') - .03]);
    S.lula.at(lt, c.w('B20', 'venderam') - .4, { k: 'sobe', dy: 420 });
    S.t1.at(lt, [c.w('B20', 'venderam') - .03, c.w('B20', 'sonho') - .03]);
    S.t2.at(lt, [c.w('B21', 'de') - .03, c.w('B21', 'Nordeste') - .03]);
  },
});

// S8 — "Anunciaram a ferrovia Transnordestina e prometeram três refinarias gigantescas de petróleo" (1ª visita ao mural)
muralCena(['B22', 'B23', 'B24'], M, {
  cam: c => [[0, { x: 1850, y: 800, d: 960, r: -1 }], [c.w('B22', 'Transnordestina') - .55, { x: 1700, y: 1050, d: 1250 }],
    [c.w('B22', 'Transnordestina') + .3, { x: 1440, y: 1400, d: 880, r: .5 }], [c.w('B24', 'refinarias') - .5, { x: 1820, y: 1330, d: 1200 }],
    [c.w('B24', 'refinarias') + .4, { x: 2240, y: 1270, d: 900, r: 1.2 }], [c.dur, { x: 2230, y: 1260, d: 820 }]],
});

// S9 — "no Maranhão, no Ceará e em Pernambuco." (os três estados acendem um a um)
mapaCena(['B25', 'B26', 'B27'], {
  alvo: ['MA', 'CE', 'PE'],
  acende: c => ({ MA: c.w('B25', 'Maranh') - .05, CE: c.w('B26', 'Cear') - .05, PE: c.w('B27', 'Pernambuco') - .05 }),
  cam: c => [[0, { x: 770, y: 800, z: 2.0, r: -1 }], [c.dur, { x: 800, y: 790, z: 2.3, r: .5 }]],
  rotulos: (p, svg, S, c) => ({
    ma: linha(p, [['Maranhão', 's', { s: 40 }]], 705, 765, { alinha: 'centro' }),
    ce: linha(p, [['Ceará', 's', { s: 40 }]], 842, 752, { alinha: 'centro' }),
    pe: linha(p, [['Pernambuco', 's', { s: 40 }]], 860, 828, { alinha: 'centro' }),
  }),
  update(S, c) { const lt = c.lt; S.rot.ma.at(lt, c.w('B25', 'Maranh')); S.rot.ce.at(lt, c.w('B26', 'Cear')); S.rot.pe.at(lt, c.w('B27', 'Pernambuco')); },
});

// S10 — "O povo acreditou tanto que Lula ganhou com quase 80% de votos na região. Um recorde."
//       (a tarja sai no nome; na tela o número real: 77,1% dos votos válidos no Nordeste, 2º turno de 2006, TSE)
scene({
  beats: ['B28', 'B29', 'B30', 'B31'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 1120, z: 1.0 }], [c.w('B29', 'Lula') + .2, { x: 540, y: 1060, z: 1.04 }],
    [c.w('B30', '80') - .3, { x: 540, y: 960, z: 1.06 }], [c.dur, { x: 540, y: 900, z: 1.12 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [540, 600] });
    const tL = c.w('B29', 'Lula') - .1;
    S.cap = lt => lt < tL ? { modo: 'palavra', y: 1000 } : { modo: 'none' };
    S.lula = recorte(r, 'p_lula', 470, 1560, 1060, { tarja: true });
    S.nome = linha(r, [['Lula', 'V', { s: 210 }]], 540, 560, { alinha: 'centro' });
    S.t1 = linha(r, [['ganhou com quase', 'a', { s: 50 }]], 540, 680, { alinha: 'centro' });
    S.cnt = contador(r, 540, 890, { de: 0, para: 77.1, casas: 1, s: 220 });
    S.l1 = linha(r, [['dos votos válidos no Nordeste · 2º turno de 2006 · TSE', 'a', { s: 30, cor: IV.cinza }]], 540, 960, { alinha: 'centro' });
    S.t3 = linha(r, [['Um', 's', { s: 110 }], ['recorde.', 's', { s: 110 }]], 540, 1110, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.lula.at(lt, 0, { k: 'sobe', dy: 300 }); S.lula.tira(lt, c.w('B29', 'Lula'));
    S.nome.at(lt, c.w('B29', 'Lula') - .03, { letras: true });
    S.t1.at(lt, c.w('B29', 'ganhou') - .03);
    S.cnt.at(lt, c.w('B30', '80') - .3, 1.0);
    S.l1.at(lt, c.w('B30', 'votos'));
    S.t3.at(lt, [c.w('B31', 'Um') - .03, c.w('B31', 'recorde') - .03]);
  },
});

// S11 — "Milhares de pequenos comerciantes locais acreditaram e se endividaram" (fio vermelho tracejado leva a câmera para baixo)
scene({
  beats: ['B32', 'B33'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 820, z: 1.05 }], [c.w('B33', 'acreditaram') - .2, { x: 540, y: 880 }],
    [c.w('B33', 'se') + .1, { x: 540, y: 1230, z: 1.0 }], [c.dur, { y: 1290, z: 1.04 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [540, 400] });
    S.t1 = linha(r, [['Milhares', 'V', { s: 230 }]], 540, 760, { alinha: 'centro', letras: true });
    S.t2 = linha(r, [['de pequenos', 'a', { s: 52 }], ['comerciantes', 'A', { s: 56 }], ['locais', 'a', { s: 52 }]], 540, 900, { alinha: 'centro' });
    S.svg = svgAbs(r, 0, 0, W, 2400);
    S.fio = tracejado(S.svg, reta(540, 960, 540, 1250), { c: IV.verm, w: 2.4 });
    S.t3 = linha(r, [['acreditaram e', 'a', { s: 50 }]], 540, 1330, { alinha: 'centro' });
    S.t4 = linha(r, [['se endividaram', 's', { s: 140 }]], 540, 1480, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt, c.w('B32', 'Milhares') - .03, { espalha: .28 });
    S.t2.at(lt, [c.w('B32', 'de'), c.w('B32', 'comerciantes'), c.w('B32', 'locais')].map(x => x - .03));
    S.fio.draw(clamp((lt - c.w('B33', 'acreditaram') + .2) / .55));
    S.t3.at(lt, c.w('B33', 'acreditaram') - .03);
    S.t4.at(lt, c.w('B33', 'se') - .03);
  },
});

// S12 — avatar P2: "esperando os empregos chegarem. Mas sabe o que aconteceu?"
presInv(['B34', 'B35']);

// S13 — "No Maranhão e no Ceará enterraram quase 3 bilhões de reais de dinheiro público em terrenos vazios, só para fazer propaganda
//        em época de eleição." (print REAL da Gazeta do Povo, 28/01/2015: marca no "R$ 2,7 bi" e depois no "foi lançada em 2010")
docCena(['B36', 'B37', 'B38', 'B39', 'B40', 'B41'], 'd_gazeta', {
  rack: c => .05,
  cam: c => {
    const m1 = ivMarca('d_gazeta', '2,7 bi'), m2 = ivMarca('d_gazeta', 'foi lançada em 2010');
    const tb = c.w('B37', 'bilh'), te = c.w('B41', 'elei');
    return [[0, { x: .32, y: m1[1], z: 1.05, r: -1 }], [tb - .6, { x: .42, y: m1[1] + .005, z: 1.3, r: -.3 }],
      [tb + .25, { x: (m1[0] + m1[2]) / 2, y: (m1[1] + m1[3]) / 2, z: 1.75, r: 0 }], [c.w('B39', 'em') + .1, { x: .4, y: .35, z: 1.2 }],
      [te - .8, { x: (m2[0] + m2[2]) / 2 - .03, y: (m2[1] + m2[3]) / 2, z: 1.55, r: .8 }], [c.dur, { z: 1.62 }]];
  },
  marcas: c => [[...ivMarca('d_gazeta', '2,7 bi'), c.w('B37', 'bilh') - .05], [...ivMarca('d_gazeta', 'foi lançada em 2010'), c.w('B41', 'elei') - .3]],
});

// S14 — "E logo depois cancelaram as duas refinarias sem produzir uma única gota de combustível."
scene({
  beats: ['B42', 'B43', 'B44'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 760, z: 1.06 }], [c.w('B44', 'sem') - .2, { x: 540, y: 820, z: 1.02 }],
    [c.w('B44', 'uma') + .2, { x: 540, y: 1280, z: 1.0 }], [c.dur, { x: 540, y: 1330, z: 1.06 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [760, 560] });
    S.t0 = linha(r, [['E logo depois', 'a', { s: 50 }]], 540, 520, { alinha: 'centro' });
    S.t1 = linha(r, [['cancelaram', 'V', { s: 200 }]], 540, 720, { alinha: 'centro', letras: true });
    S.t2 = linha(r, [['as duas', 'a', { s: 52 }], ['refinarias', 'A', { s: 56 }]], 540, 850, { alinha: 'centro' });
    S.svg = svgAbs(r, 0, 0, W, 2400);
    S.fio = tracejado(S.svg, reta(540, 900, 540, 1180), { c: IV.verm, w: 2.4 });
    S.t3 = linha(r, [['sem produzir', 'a', { s: 50 }]], 540, 1250, { alinha: 'centro' });
    S.t4 = linha(r, [['uma única', 's', { s: 120 }], ['gota', 'v', { s: 120 }]], 540, 1400, { alinha: 'centro' });
    S.t5 = linha(r, [['de combustível.', 'a', { s: 50 }]], 540, 1500, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.t0.at(lt, 0);
    S.t1.at(lt, c.w('B43', 'cancelaram') - .03, { espalha: .25 });
    S.t2.at(lt, [c.w('B43', 'as') - .03, c.w('B43', 'refinarias') - .03]);
    S.fio.draw(clamp((lt - c.w('B44', 'sem') + .25) / .5));
    S.t3.at(lt, c.w('B44', 'sem') - .03);
    S.t4.at(lt, [c.w('B44', 'uma') - .03, c.w('B44', 'gota') - .03]);
    S.t5.at(lt, c.w('B44', 'combust') - .1);
  },
});

// S15 — "E a ferrovia prometida para 2010 virou um buraco negro" (2ª visita ao mural: ele cresceu; entra o print do Diario de Pernambuco)
muralCena(['B45', 'B46', 'B47'], M, {
  cam: c => [[0, { x: 2000, y: 1620, d: 1500, r: .8 }], [c.w('B45', 'ferrovia') + .1, { x: 1450, y: 1440, d: 960, r: -.5 }],
    [c.w('B46', '2010') - .3, { x: 1600, y: 1800, d: 1150 }], [c.w('B46', '2010') + .5, { x: 1770, y: 2260, d: 860, r: .6 }],
    [c.dur, { x: 1780, y: 2280, d: 790 }]],
});

// S16 — "de 15 bilhões de reais que nunca fica pronta." (orçamento atual da Transnordestina: ~R$ 15 bi, Diario de Pernambuco 31/10/2025)
scene({
  beats: ['B48', 'B49'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 900, z: 1.0 }], [c.e('B49') + .4, { x: 540, y: 960, z: 1.26 }]]),   // última cena: c.dur iria até o fim do áudio
  build(r, S, c) {
    palco(r, S, { brilho: [540, 820] });
    S.cnt = contador(r, 540, 900, { de: 0, para: 15, pre: 'R$ ', suf: ' bi', s: 240 });
    S.l1 = linha(r, [['orçamento atual da Transnordestina · Diario de Pernambuco, out/2025', 'a', { s: 30, cor: IV.cinza }]], 540, 985, { alinha: 'centro' });
    S.t1 = linha(r, [['que nunca fica', 'a', { s: 52 }], ['pronta.', 's', { s: 130 }]], 540, 1200, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.cnt.at(lt, c.w('B48', '15') - .1, .9);
    S.l1.at(lt, c.w('B48', 'reais'));
    S.t1.at(lt, [c.w('B49', 'que') - .03, c.w('B49', 'pronta') - .03]);
  },
});
