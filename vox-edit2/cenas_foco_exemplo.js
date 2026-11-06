// ============================================================================
//  cenas_foco_exemplo.js (vox-edit2) = as 5 cenas da versão B APROVADA do teste "motor foco" (projetos/teste_foco, 03/11/2026):
//  trecho S09–S13 do BukeleHaiti (audio1103, 36,33–62,44 s do corte, 26,1 s), mesmo material e mesma voz da versão de antes.
//  Vem depois de <xx>_a.js, <xx>_b.js e <xx>_c.js (componentes_edit2.js, que já tem e2Foco, e2LegFixa, e2Numero e e2Assuntos).
//  Material REAL do audio1103: clipes gangue_rua, rua_destruida (Sky News), carro_queimado (BBC), deslocados (AFP), onu_tropas,
//  gsf_blindado; impressões print_cherizier_icg (ICG) e print_helicoptero (FAES). Dado: ~1,5 milhão de deslocados (OIM, set/2026).
//  O que olhar em cada cena: UM assunto grande no centro; a legenda é o único texto e não se mexe; cada efeito acontece sozinho e no
//  centro (tira do kit no lugar da legenda, papel nascendo, foto pousando no lugar da anterior, número como assunto); a câmera faz
//  no máximo um movimento por frase, quase sempre zoom.
// ============================================================================

// S09 — "Sem governo e sem lei, facções armadas até os dentes tomaram o controle da capital." lousa riscada; a gangue REAL andando
// armada grande no centro; a 1ª frase na tira laranja do Collage Kit, que abre no lugar da legenda; no "armadas" a câmera aproxima das
// armas; no "controle" o chefe Jimmy Chérizier NASCE EM PAPEL no centro, por cima da gangue, que escurece
e2Cena(['B17', 'B18', 'B19'], {
  fundo: 'e2_escuro_riscado',
  golpes: c => e2Foco(c, [[0, 540, 860, 1.08], [c.w('B18', 'armadas'), 600, 900, 1.3, .6], [c.w('B19', 'controle'), 540, 860, 1.1, .45]]),
  build(M, S, c) {
    const tc = c.w('B19', 'controle') - .15;
    e2Assuntos(M, S, c, [['clip:gangue_rua', 0, { pos: '42% 50%' }], ['print_cherizier_icg', tc, { papel: true, w: 700, rot: 3 }]]);
    e2LegFixa(M, S, c, [['B17', { kit: 'tira_2' }], 'B18', 'B19'], { chave: ['governo', 'lei', 'dentes', 'capital'] });
    cue(c, 'paper', -.1, { g: .26 }); cue(c, 'cloth', c.w('B18', 'armadas') - .2, { g: .16 }); cue(c, 'crinkle', tc, { g: .24, d: .3 });
  },
});

// S10 — "Porto Príncipe, cobrando pedágio nas ruas, promovendo massacres," papel cinza; a rua destruída REAL grande; no "pedágio"
// aproxima; no "promovendo" o carro queimado REAL pousa NO MESMO LUGAR; "promovendo massacres" na tira laranja
e2Cena(['B20', 'B21'], {
  fundo: 'e2_cinza', fundoOp: { tom: 'brightness(.95) contrast(1.04)' },
  golpes: c => e2Foco(c, [[0, 540, 860, 1.08], [c.w('B20', 'pedagio'), 480, 900, 1.26, .6], [c.w('B21', 'promovendo'), 540, 860, 1.12, .45]]),
  build(M, S, c) {
    const tm = c.w('B21', 'promovendo') - .12;
    e2Assuntos(M, S, c, [['clip:rua_destruida', 0, { pos: '35% 60%' }], ['clip:carro_queimado', tm, { pos: '30% 50%', rot: 2, s0: 1.12, r0: 4, d: .24 }]]);
    e2LegFixa(M, S, c, ['B20', ['B21', { kit: 'tira_2' }]], { chave: ['pedagio', 'massacres'] });
    cue(c, 'paper', -.1, { g: .26 }); cue(c, 'cloth', c.w('B20', 'pedagio') - .2, { g: .16 }); cue(c, 'shutter', tm, { g: .14 });
  },
});

// S11 — "sequestros e expulsando mais de um milhão e meio de pessoas de suas próprias casas." quadriculado; os deslocados REAIS
// grandes; no "milhão" o mundo escurece e "~1,5 milhão" (com a fonte) é o assunto até o "pessoas", com a legenda escondida. O plano dos
// deslocados tem 3 s na fonte: atrás do número ele troca NO LUGAR pelo abrigo REAL (Reuters), que roda até o fim (vídeo nunca trava)
e2Cena(['B22', 'B23'], {
  fundo: 'e2_quadriculado',
  golpes: c => e2Foco(c, [[0, 540, 860, 1.08], [c.w('B22', 'milhao'), 540, 860, 1.24, .5], [c.w('B23', 'pessoas'), 540, 860, 1.06, .9]], { sai: 0 }),
  build(M, S, c) {
    const tm = c.w('B22', 'milhao') - .08, tp = c.w('B23', 'pessoas') - .1;
    e2Assuntos(M, S, c, [['clip:deslocados', 0, { pos: '40% 50%' }], ['clip:abrigo', tm + .2, { pos: '45% 50%' }]]);
    e2Numero(M, S, c, '~1,5 milhão', 'deslocados internos no Haiti · OIM, set/2026', tm, tp, { y: 840 });
    e2LegFixa(M, S, c, [['B22', { cor: 'azul' }], 'B23'], { chave: ['sequestros', 'casas'], oculta: [[tm, tp]] });
    cue(c, 'paper', -.1, { g: .26 }); cue(c, 'slam', tm + .05, { g: .16 });
  },
});

// S12 — "Uma missão internacional apoiada pela ONU tentou ajudar enviando um pequeno efetivo ao país," papel branco; a força
// multinacional REAL grande; no "internacional" aproxima; no "tentou" o blindado da GSF pousa no mesmo lugar (o plano das tropas tem
// 2,8 s na fonte: a troca vem antes de ele acabar); no "efetivo" aproxima; "efetivo ao país" na tira amarela
e2Cena(['B24', 'B25', 'B26'], {
  fundo: 'e2_branco',
  golpes: c => e2Foco(c, [[0, 540, 860, 1.08], [c.w('B24', 'internacional'), 540, 840, 1.18, .7], [c.w('B25', 'ajudar'), 540, 860, 1.16, .5], [c.w('B26', 'efetivo'), 560, 880, 1.28, .6]]),
  build(M, S, c) {
    const ta = c.w('B24', 'tentou') - .1;
    e2Assuntos(M, S, c, [['clip:onu_tropas', 0, { pos: '40% 45%' }], ['clip:gsf_blindado', ta, { pos: '45% 55%' }]]);
    e2LegFixa(M, S, c, ['B24', 'B25', ['B26', { kit: 'tira_4' }]], { chave: ['missao', 'onu', 'efetivo'] });
    cue(c, 'paper', -.1, { g: .26 }); cue(c, 'shutter', ta, { g: .14 }); cue(c, 'cloth', c.w('B26', 'efetivo') - .2, { g: .14 });
  },
});

// S13 — "incluindo quatro técnicos da Força Aérea de El Salvador que estavam lá apenas para fazer evacuações médicas e salvar vidas."
// pergaminho; o helicóptero REAL da FAES grande; no "quatro" a câmera vai à cabine; no "que" recua; no "evacuações" aproxima de novo.
// A 1ª frase na tira azul; "médicas e salvar vidas" na amarela do kit
e2Cena(['B27', 'B28', 'B29'], {
  fundo: 'e2_pergaminho',
  golpes: c => e2Foco(c, [[0, 540, 860, 1.08], [c.w('B27', 'quatro'), 640, 880, 1.4, .6], [c.w('B28', 'que'), 540, 860, 1.06, .9], [c.w('B28', 'evacuacoes'), 560, 870, 1.22, .7]]),
  build(M, S, c) {
    e2Assuntos(M, S, c, [['print_helicoptero', 0, { pos: '50% 55%' }]]);
    e2LegFixa(M, S, c, [['B27', { cor: 'azul' }], 'B28', ['B29', { kit: 'tira_4' }]], { chave: ['quatro', 'tecnicos', 'salvador', 'evacuacoes', 'vidas'] });
    cue(c, 'paper', -.1, { g: .26 }); cue(c, 'cloth', c.w('B27', 'quatro') - .2, { g: .16 }); cue(c, 'cloth', c.w('B28', 'evacuacoes') - .2, { g: .14 });
  },
});
