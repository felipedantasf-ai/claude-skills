// ============================================================================
//  cenas_mapa_exemplo.js (vox-edit2) = projetos/teste_mapa_sat/work/ms_d.js: demo do MAPA DE SATÉLITE da vox-edit2 (estilo @rotageografica), trecho B19–B27 do NordesteObrasFantasmas
//  (audio1022), 10,4 s. Fatos conferidos no audio1022: Premium I em Bacabeira-MA, Premium II no Pecém (São Gonçalo do Amarante-CE),
//  Abreu e Lima em Ipojuca-PE; Transnordestina Eliseu Martins–Salgueiro–Pecém e Salgueiro–Suape (traçado esquemático).
//  Dados: mapa_satelite.py teste_mapa_sat ne --uf NE --mun ... --pontos ... --linha ...
// ============================================================================
const NE9 = ['MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'BA'];

// S1 — "Em 2006, venderam o sonho de industrializar o Nordeste. Anunciaram a ferrovia Transnordestina" o Brasil inteiro de satélite já
// voando no quadro 0; "2006" grande com brilho; a câmera mergulha no Nordeste e, no "Nordeste", os 9 estados acendem um a um nas cores
// da referência; no "Anunciaram" os estados se apagam e a câmera inclina sobre o sertão; no "ferrovia" a linha amarela se desenha de
// Eliseu Martins ao Pecém e a Suape, os pinos caem e a foto REAL das obras sobe na haste
e2Mapa(['B19', 'B20', 'B21', 'B22'], {
  mapa: 'ne',
  cam0: { lon: -51, lat: -13.5, zoom: 4.75 },
  voo: (c, SM) => [
    [-.1, 2.6, SM.enquadra(NE9, { larg: 980, alt: 1250, dy: 40 }), 'cam'],
    [c.b('B22') - .15, c.b('B22') + 1.3, SM.enquadra(['Eliseu Martins', 'Pecém', 'Suape'], { larg: 640, alt: 760, dy: 30, tilt: 22, rot: -4 }), 'cam'],
  ],
  build(M, S, c, SM) {
    const tN = c.w('B21', 'nordeste') - .06, tA = c.b('B22'), tF = c.w('B22', 'ferrovia') - .05, tT = c.w('B22', 'transnordestina');
    SM.titulo('2006', { t: .02, y: 330, s: 190, tSai: tA - .25 });
    const est = SM.seq(NE9, tN, .065);
    SM.apaga(est, tA + .1);
    SM.linha('transnordestina', { t: tF, d: 1.15 });
    SM.linha('transnordestina2', { t: tF + .35, d: .9 });
    SM.pino('Eliseu Martins', { t: tF - .05, rotulo: true, lado: 'cima', dx: 60, s: 44 });
    SM.pino('Pecém', { t: tF + 1.0, rotulo: true, s: 42 });
    SM.pino('Suape', { t: tF + 1.1, rotulo: true, s: 42 });
    SM.foto('print_transn', 'Salgueiro', { t: tT + .15, dx: -150, dy: -360, w: 260 });
    SM.titulo('*Transnordestina*', { t: tT - .05, y: 330, s: 108, rot: -2 });
    e2Legenda(M, S, c, ['B19', 'B20', 'B21', 'B22'], { y: 1520, s: 66, cor: '#fbf7ee', corChave: SATC.rota, linha: 20, chave: ['2006', 'nordeste', 'ferrovia'] });
    cue(c, 'whoosh', 0, { g: .3 }); cue(c, 'whoosh', tA - .1, { g: .28 });
    NE9.forEach((u, i) => cue(c, 'flick', tN + i * .065, { g: .12 }));
    cue(c, 'marker', tF, { g: .16, d: 1.1 }); [tF - .05, tF + 1.0, tF + 1.1].forEach(t => cue(c, 'ping', t + .3, { g: .12 }));
  },
});

// S2 — "e prometeram três refinarias gigantescas de petróleo no Maranhão, no Ceará e em Pernambuco." continua o voo da cena anterior
// (corte invisível): a câmera recua até ver MA–PE inteiro e segue derivando para leste; "3 refinarias" grande; no "refinarias" os 3
// pinos caem nos lugares das obras (Bacabeira, Pecém, Ipojuca); no "gigantescas" a foto REAL da Abreu e Lima sobe na haste; em cada
// estado dito ele acende com a sigla digitada e o município da refinaria acende por cima com o nome
e2Mapa(['B23', 'B24', 'B25', 'B26', 'B27'], {
  mapa: 'ne', continua: true,
  voo: (c, SM) => [
    [0, 1.5, SM.enquadra(['MA', 'CE', 'PE'], { larg: 960, alt: 900, dy: 140 }), 'cam'],
    [1.5, c.dur + .5, SM.enquadra(['MA', 'CE', 'PE'], { larg: 960, alt: 900, dy: 140, rot: 4 }), 'lin'],
  ],
  deriva: .05,
  build(M, S, c, SM) {
    const tR = c.w('B24', 'refinarias') - .05, tG = c.w('B24', 'gigantescas') - .05, tM = c.w('B25', 'maranhao') - .04,
      tC = c.w('B26', 'ceara') - .04, tP = c.w('B27', 'pernambuco') - .04;
    SM.titulo('3 *refinarias*', { t: c.w('B24', 'tres') - .05, y: 330, s: 132, tSai: tM - .15 });
    const pinos = [['Bacabeira', 'cima', 0], ['Pecém', 'cima', .12], ['Ipojuca', 'baixo', .24]].map(([k, lado, d]) => SM.pino(k, { t: tR + d, w: 52 }));
    const foto = SM.foto('print_abreu', 'Ipojuca', { t: tG, dx: 10, dy: -70, w: 250, tSai: tP - .1 });
    SM.uf('MA', { t: tM, cor: SATC.uf.vermelho, sigla: true, s: 96 });
    SM.mun('Bacabeira', { t: tM + .15, cor: '#ff4040', op: .95, rotulo: true, lado: 'cima', s: 44 });
    SM.uf('CE', { t: tC, cor: SATC.uf.ocre, sigla: true, s: 96 });
    SM.mun('São Gonçalo do Amarante', { t: tC + .15, cor: '#ffd23a', op: .95 });
    SM.rotulo('Pecém', { t: tC + .2, lado: 'cima', s: 44 });
    SM.uf('PE', { t: tP, cor: SATC.uf.verde, sigla: true, s: 84, siglaEm: [-38.2, -8.3] });
    SM.mun('Ipojuca', { t: tP + .15, cor: '#c4ff6a', op: .95 });
    SM.rotulo('Ipojuca', { t: tP + .2, lado: 'baixo', s: 44, dx: -40 });
    e2Legenda(M, S, c, ['B23', 'B24', 'B25', 'B26', 'B27'], { y: 1560, s: 66, cor: '#fbf7ee', corChave: SATC.rota, linha: 20,
      chave: ['refinarias', 'maranhao', 'ceara', 'pernambuco'] });
    cue(c, 'whoosh', 0, { g: .22 });
    [0, .12, .24].forEach(d => cue(c, 'ping', tR + d + .3, { g: .13 })); cue(c, 'paper', tG + .1, { g: .2 });
    [tM, tC, tP].forEach(t => cue(c, 'flick', t, { g: .2 }));
  },
});
