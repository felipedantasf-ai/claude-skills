// ============================================================================
//  v4acai_ev: "The Best Açaí" (publi V4, Fernando Miranda) no formato edit-v4 — DEMO dos primeiros ~14 s (B01–B12)
//  Dados checados em 28/10/2026 (work/fontes.md): R$ 1 bi = faturamento do GRUPO em 2025; "Sérgio Kendy"; os R$ 800 no cartão não têm
//  fonte escrita (ficam só na fala). Safe zone da Meta: tudo que importa entre y 420 e 1500.
// ============================================================================

// mural do vídeo (cresce a cada visita): a logo REAL da The Best e o pote de açaí (Commons), presos na palavra
const M = mural()
  .foto('tb', 'i_thebest_card', 1480, 900, { w: 620, rot: -2, dz: -20, desde: 'B08' })
  .foto('acai', 'i_acai2', 1930, 1380, { w: 600, rot: 2.5, dz: 20, desde: ['B10', 'vendendo'] })
  .fio('tb', 'acai', { desde: ['B10', 'vendendo'] });

// S1 — GANCHO (2,3 s, tipografia no escuro): "Um dos fundadores da The Best Açaí não tinha nenhum real," o nome da empresa em Morganite
// branca já no quadro 0; o fio vermelho leva a câmera para baixo até "nenhum real" em vermelho enorme
scene({
  beats: ['B01', 'B02'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 820, z: 1.06 }, 'fixa'], [c.w('B02', 'n') - .25, { x: 540, y: 860, z: 1.02 }],
    [c.w('B02', 'nenhum') + .1, { x: 540, y: 1090, z: 1.04 }], [c.dur + .4, { x: 545, y: 1110, z: 1.1, r: .5 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [760, 700] });
    S.t1 = linha(r, [['Um dos', 'a', { s: 54 }], ['fundadores', 'A', { s: 58 }], ['da', 'a', { s: 54 }]], 540, 700, { alinha: 'centro' });
    S.t2 = linha(r, [['The', 'S', { s: 210 }], ['Best', 'S', { s: 210 }], ['Açaí', 'S', { s: 210 }]], 540, 900, { alinha: 'centro' });   // palavras separadas: o espaço da Morganite é estreito
    S.svg = svgAbs(r, 0, 0, W, 3000);
    S.fio = tracejado(S.svg, reta(540, 950, 540, 1150), { c: IV.verm, w: 2.2 });
    S.t3 = linha(r, [['não tinha', 'a', { s: 56 }]], 540, 1200, { alinha: 'centro' });
    S.t4 = linha(r, [['nenhum real', 'V', { s: 230 }]], 540, 1410, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt, [-.5, -.5, c.w('B01', 'da') - .03]);
    S.t2.at(lt, [-.5, -.5, -.5]);
    S.fio.draw(clamp((lt - c.w('B02', 'n') + .3) / .4));
    S.t3.at(lt, c.w('B02', 'n') - .03);
    S.t4.at(lt, c.w('B02', 'nenhum') - .03, { letras: true });
  },
});

// S2 — Fernando (3,2 s; olha a câmera em 2,2–5,5 s): "pega 800 reais no cartão de crédito do amigo pra entrar na sociedade."
// punch-out de entrada, tom vinho e luz vermelha V4 do lado direito
presInv(['B03', 'B04', 'B05']);

// S3 — "Hoje, a empresa fatura mais de um bilhão de reais por ano." tipografia: R$ 1 bi em Morganite vermelha no "bilhão" (o faturamento do GRUPO em 2025,
// com a fonte embaixo); a REVERBERAÇÃO do símbolo abre atrás do número (o grafismo da V4)
scene({
  beats: ['B06', 'B07'], tr: 'cut', bg: 'dark',
  camMove: camC(c => [[0, { x: 540, y: 900, z: 1.08 }], [c.w('B07', 'bilh') - .2, { x: 540, y: 960, z: 1.0 }], [c.dur + .3, { x: 540, y: 980, z: 1.08, r: -.6 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [540, 980] });
    S.rv = reverbInv(r, 540, 990, 380, 300, { n: 4, passo: 54 });
    S.t1 = linha(r, [['Hoje, a empresa', 'a', { s: 56 }], ['fatura', 'A', { s: 62 }]], 540, 640, { alinha: 'centro' });
    S.cnt = linha(r, [['R$', 'V', { s: 280 }], ['1', 'V', { s: 280 }], ['bi', 'V', { s: 280 }]], 540, 1090, { alinha: 'centro' });   // partes separadas (o espaço da Morganite é estreito); contar de 0 a 1 mostraria 'R$ 0 bi'
    S.l1 = linha(r, [['faturamento do grupo em 2025 · Portal do Franchising', 'a', { s: 28, cor: IV.cinza }]], 540, 1180, { alinha: 'centro' });
    S.t2 = linha(r, [['por ano.', 's', { s: 120 }]], 540, 1340, { alinha: 'centro' });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt, [-.5, c.w('B06', 'fatura') - .03]);   // quadro 0 já completo
    S.rv.at(lt, -.3, { vivo: true });
    { const t = c.w('B07', 'bilh') - .12; S.cnt.at(lt, [t, t + .08, t + .16]); }
    S.l1.at(lt, c.w('B07', 'reais'));
    S.t2.at(lt, c.w('B07', 'por') - .03);
  },
});

// S4 — "Como que a The Best Açaí fatura mais de um bilhão de reais vendendo açaí?" 1ª visita ao MURAL: a logo REAL da The Best é presa
// no "The"; no "vendendo açaí" a câmera desce e o pote de açaí (Commons) é preso com o fio vermelho
muralCena(['B08', 'B09', 'B10'], M, {
  cam: c => [[0, { x: 1480, y: 920, d: 1180, r: -1 }], [c.w('B08', 'The') + .25, { x: 1480, y: 910, d: 900 }],
    [c.w('B10', 'vendendo') - .45, { x: 1700, y: 1150, d: 1230, r: .4 }], [c.w('B10', 'vendendo') + .35, { x: 1920, y: 1370, d: 880, r: 1 }],
    [c.dur + .3, { x: 1915, y: 1365, d: 820 }]],
});

// S5 — "Sérgio Kendy foi visitar o pai em Marília." o mapa escuro: a câmera desce sobre o Sudeste; no "Marília" São Paulo acende em
// vermelho e o rótulo com tracejado aponta a cidade (Marília ≈ x 610, y 1123 nas coordenadas do mapa). O nome vai na legenda
mapaCena(['B11', 'B12'], {
  alvo: ['SP'],
  acende: c => c.w('B12', 'Mar') - .05,
  cam: c => [[0, { x: 560, y: 980, z: 1.25, r: -1 }], [c.w('B12', 'foi'), { x: 600, y: 1080, z: 1.9 }],
    [c.w('B12', 'Mar') + .1, { x: 610, y: 1110, z: 2.6, r: 0 }], [c.e('B12') + .4, { x: 612, y: 1112, z: 2.75, r: .6 }]],   // última cena da demo: ancorada na palavra, não no c.dur
  rotulos: (p, svg, S, c) => ({
    nm: linha(p, [['Marília', 's', { s: 34 }], ['(SP)', 'a', { s: 16 }]], 655, 1080, { alinha: 'esq' }),
    tr: tracejado(svg, curva(652, 1074, 614, 1118, .35), { c: IV.branco, w: 1, dash: 4, gap: 3 }),
    pt: (() => { const e = el(p, 'div', `position:absolute;left:606px;top:1118px;width:10px;height:10px;border-radius:50%;background:${IV.branco};box-shadow:0 0 8px rgba(255,255,255,.6);opacity:0;`); return e; })(),
  }),
  build(r, S, c) { const tM = c.w('B12', 'Mar') - .05; S.cap = lt => lt < tM ? { modo: 'palavra' } : { modo: 'none' }; },
  update(S, c) {
    const lt = c.lt, tM = c.w('B12', 'Mar');
    S.rot.pt.style.opacity = ez(lt, tM + .05, .15);
    S.rot.tr.draw(clamp((lt - tM - .05) / .3));
    S.rot.nm.at(lt, tM + .15);
  },
});
