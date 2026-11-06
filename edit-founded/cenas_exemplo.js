// ============================================================================
//  edit-founded — cenas de exemplo (teste de 30/10/2026, v5: mescla foto + vídeo ~60/40 + APRESENTADORA 3 vezes em 42 s
//  (tela cheia e círculo); projetos/teste_founded, corte da Thainá "Lisa Su / AMD", B01–B30).
// ============================================================================

// S1 — "Quando essa mulher aqui assumiu a AMD," (abre na protagonista, como a referência abre no fundador)
rajadaAuto(['B01', 'B02'], ['f_su_retrato_0012', ['clip:su_close2', { from: 0.40 }], 'f_su_vermelho_0012', 'f_amd_logo3d_0012']);

// S2 — "a empresa valia 3 bilhões" (tríptico: três painéis entram um a um)
tripla(['B03'], [['clip:amd_flag', { from: 0.60 }], 'f_amd_predio3_0012', 'f_amd_placa_rua_0030'],
  { ts: c => [0, c.w('B03', 'valia') - .03, c.w('B03', 'bilh') - .03] });

// S3 — "e tava quase falindo."
rajadaAuto(['B04'], ['f_amd_silh_0030', ['clip:amd_silh_v', { from: 0.60 }]]);

// S4 — "Hoje ela cruzou a marca" (cartão branco, legenda escura)
cartaoCor(['B05'], { cor: 'branco' });

// S5 — "de um trilhão de valor." (gráfico de alta com o chip; dado com data e fonte)
alta(['B06'], { produto: 'p_chip_ryzen', marca: 'AMD', w: 330, suf: '', valores: ['US$ 3 bi', 'US$ 100 bi', 'US$ 500 bi', 'US$ 1 tri'],
  ts: c => [0, .22, .44, c.w('B06', 'trilh')], fonte: 'valor de mercado da AMD · passou de US$ 1 trilhão em 21/09/2026 (CNBC)' });

// S6 — APRESENTADORA em tela cheia: "E o mais impressionante é que ela nem trabalha" + rajada "na OpenAI."
presFD(['B07', 'B08'], { forma: 'cheia', z: 1.55, fy: .42 });
rajada(['B09'], [[0, 'f_openai_board_0012']]);

// S7 — "Lisa Su comanda a AMD,"
rajada(['B10'], [[0, 'f_su_studio_b_0012'], [c => c.w('B10', 'comanda'), 'clip:su_palco_amd'], [c => c.w('B10', 'AMD'), 'f_amd_logo3d_0030', { from: 1 }]]);

// S8 — "uma empresa que produz chips." (faixa letterbox)
faixa(['B11'], [[0, 'clip:fab_amarelo2'], [c => c.w('B11', 'chips'), 'f_chip_dedos_0012']]);

// S9 — "Peças que funcionam como cérebro" (produto girando sobre a marca)
produtoGira(['B12'], 'p_chip_ryzen', { marca: 'RYZEN', w: 360 });

// S10 — "dentro das maiores tecnologias do mundo."
rajadaAuto(['B13'], ['clip:datacenter_luzes', 'f_helios_rack_0012', 'clip:ps5_chip', 'f_tesla_tela_0012', 'f_frontier_0012']);

// S11 — "Só que há 10 anos" (cartão vermelho)
cartaoCor(['B14'], { cor: 'vermelho' });

// S12 — "essa empresa tava praticamente falida."
rajadaAuto(['B15'], ['f_austin_l_0012', 'f_amd_vidro_0012', ['clip:amd_corredor', { from: 0.60 }], 'f_amd_silh_v_0027']);

// S13 — "Para você ter uma ideia," (rajada) + "quando ela assumiu em 2014," (cartão branco: o ano; cartão ≤ 1,5 s)
rajadaAuto(['B16'], ['f_su_jovem_0012', 'clip:mit_su_v']);
cartaoCor(['B17'], { cor: 'branco' });

// S14 — "as ações já valiam cerca de 3 dólares." (faixa com o noticiário real de 2014)
faixa(['B18', 'B19'], [[0, 'clip:wsj_su2014'], [c => c.w('B18', 'valiam'), 'f_bbg_ceo14_0012'], [c => c.w('B19', '3'), 'f_bbg_acao_0012']]);

// S15 — APRESENTADORA num círculo sobre o prédio e os chips: "E nos meses seguintes, elas despencaram"
presFD(['B20', 'B21'], { forma: 'circulo', z: 1.7, fundo: ['f_austin_0030', 'clip:chips_grade', 'f_intel_inside_0012'] });

// S16 — "para menos de 2 dólares." (cartão vermelho)
cartaoCor(['B22'], { cor: 'vermelho' });

// S17 — "A situação era tão crítica que os donos precisaram vender a sede"
rajadaAuto(['B23', 'B24', 'B25'], ['f_amd_saguao_0012', 'clip:amd_lobby', 'f_amd_entrada_0012', 'f_amd_flag_0030', 'f_amd_predio_0012', ['clip:austin', { from: 1.50 }], 'f_amd_placa_rua_0072']);

// S18 — "e ainda pagavam aluguel para continuar trabalhando no mesmo lugar."
rajadaAuto(['B26', 'B27'], ['f_escritorio_0036', 'clip:entrada_l', 'f_amd_corredor_0042', 'clip:su_lab', 'f_su_laptop_0012']);

// S19 — APRESENTADORA num círculo sobre a fábrica: "Isso tinha relação justamente com a forma com que" + rajada "o negócio vinha sendo conduzido."
presFD(['B28', 'B29'], { forma: 'circulo', z: 1.7, fundo: ['clip:fab_amarelo2', 'f_wafer_amarelo_0012', 'clip:pick_place'] });
rajadaAuto(['B30'], ['f_racks_wsj_0012', 'clip:teste_laser', 'f_chip_luzes_0012']);
