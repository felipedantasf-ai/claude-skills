// ============================================================================
//  edit-founded — EXEMPLO DE CENAS NO MOTOR FOCO (padrão desde 03/11/2026). Cópia das cenas B do A/B aprovado
//  (projetos/teste_foco_founded/work/ab_foco_B.js; trecho 0–24,47 s do teste_founded, corte "Lisa Su / AMD" da Thainá).
//  Copie a ESTRUTURA: cada plano com foco: [fx, fy] (onde está o assunto na imagem), alvo/zMax só nos closes fechados,
//  semLegenda quando a imagem já é a palavra, chicote só na virada, tranco = soco de zoom. Os assets são do teste.
//  As cenas antigas (cenas_exemplo.js, sem foco) continuam funcionando: sem foco o plano fica centrado como antes.
// ============================================================================
['falindo', 'falida', 'cerebro', '2014'].forEach(p => FD_CHAVE.add(p));

// S1 — "Quando essa mulher aqui assumiu a AMD," (a protagonista no ponto do assunto; o close fechado sobe mais (alvo 600, zMax 1.42)
// para a legenda ficar abaixo do queixo; no "AMD" o logo é a palavra e a legenda some)
rajadaAuto(['B01', 'B02'], [['f_su_retrato_0012', { foco: [.42, .52], alvo: [540, 600], zMax: 1.42 }], ['clip:su_close2', { from: 0.40, foco: [.45, .47] }],
  ['f_su_vermelho_0012', { foco: [.52, .36] }], ['f_amd_logo3d_0012', { foco: [.5, .45], semLegenda: true }]]);

// S2 — "a empresa valia 3 bilhões" (tríptico: cada painel acende no lugar e os anteriores escurecem; o assunto do painel de cima
// fica embaixo dele e o do painel de baixo fica em cima: o olho anda menos)
// a bandeira começa no quadro 1 do trecho (52 q = 1,73 s): o painel fica 1,71 s na tela e o vídeo roda até o fim sem travar
// (com from .6 ele acabava em 3,57 s e ficava preso no último quadro — régua clipe_parado.py, 03/11)
tripla(['B03'], [['clip:amd_flag', { from: 0, foco: [.72, .46], alvo: [540, 420] }], ['f_amd_predio3_0012', { foco: [.35, .36] }],
  ['f_amd_placa_rua_0030', { foco: [.55, .45], alvo: [540, 220] }]],
  { ts: c => [0, c.w('B03', 'valia') - .03, c.w('B03', 'bilh') - .03] });

// S3 — "e tava quase falindo." (a silhueta é o assunto; no "falindo" a 2ª imagem é um plano mais fechado da MESMA silhueta no mesmo
// ponto (cabeça em 700, acima da legenda): a troca se vê sem o olho sair do lugar; "falindo" maior na legenda)
rajadaAuto(['B04'], [['f_amd_silh_0030', { foco: [.56, .5] }], ['clip:amd_silh_v', { from: 0.60, foco: [.45, .58], alvo: [540, 700], zMax: 1.4 }]]);

// S4 — "Hoje ela cruzou a marca" (cartão branco; a frase nasce no lugar fixo e só deriva 3%)
cartaoCor(['B05'], { cor: 'branco' });

// S5 — "de um trilhão de valor." (gráfico de alta: o número é o assunto, com a fonte logo abaixo; dado com data e fonte)
alta(['B06'], { produto: 'p_chip_ryzen', marca: 'AMD', w: 330, suf: '', valores: ['US$ 3 bi', 'US$ 100 bi', 'US$ 500 bi', 'US$ 1 tri'],
  ts: c => [0, .22, .44, c.w('B06', 'trilh')], fonte: 'valor de mercado da AMD · passou de US$ 1 trilhão em 21/09/2026 (CNBC)' });

// S6 — APRESENTADORA em tela cheia: "E o mais impressionante é que ela nem trabalha" + "na OpenAI." (a placa É a palavra: sem legenda)
presFD(['B07', 'B08'], { forma: 'cheia', z: 1.55, fy: .42 });
rajada(['B09'], [[0, 'f_openai_board_0012', { foco: [.5, .42], semLegenda: true }]]);

// S7 — "Lisa Su comanda a AMD,"
rajada(['B10'], [[0, 'f_su_studio_b_0012', { foco: [.52, .34] }], [c => c.w('B10', 'comanda'), 'clip:su_palco_amd', { foco: [.32, .40] }],
  [c => c.w('B10', 'AMD'), 'f_amd_logo3d_0030', { from: 1, foco: [.5, .45], semLegenda: true }]]);

// S8 — "uma empresa que produz chips." (faixa letterbox; o assunto no ponto do assunto da faixa)
faixa(['B11'], [[0, 'clip:fab_amarelo2', { foco: [.36, .36] }], [c => c.w('B11', 'chips'), 'f_chip_dedos_0012', { foco: [.5, .3] }]]);

// S9 — "Peças que funcionam como cérebro" (o CHIP é o assunto e o pivô do giro, a 240 px da legenda (alvo 800: chip claro longe da
// legenda fazia o olho pular entre os dois); recorte maior; a marca é textura)
produtoGira(['B12'], 'p_chip_ryzen', { marca: 'RYZEN', w: 420, foco: [.3, .34], alvo: [540, 800] });

// S10 — "dentro das maiores tecnologias do mundo." (sem tranco no "mundo": logo depois vem a virada com chicote — um efeito por vez;
// a tela do carro sobe (alvo 360, zMax 1.1) para a legenda cair no painel escuro e não na tela branca)
rajadaAuto(['B13'], [['clip:datacenter_luzes', { foco: [.5, .42] }], ['f_helios_rack_0012', { foco: [.5, .3] }], ['clip:ps5_chip', { foco: [.5, .38] }],
  ['f_tesla_tela_0012', { foco: [.7, .3], alvo: [540, 360], zMax: 1.1 }], ['f_frontier_0012', { foco: [.5, .4] }]]);

// S11 — "Só que há 10 anos" (cartão vermelho; a VIRADA: a cena anterior sai em chicote, a frase nasce parada)
cartaoCor(['B14'], { cor: 'vermelho', chicote: 'dir' });

// S12 — "essa empresa tava praticamente falida." (soco de zoom no "falida", no lugar do tranco)
rajadaAuto(['B15'], [['f_austin_l_0012', { foco: [.45, .45] }], ['f_amd_vidro_0012', { foco: [.5, .4] }], ['clip:amd_corredor', { from: 0.60, foco: [.5, .42] }],
  ['f_amd_silh_v_0027', { foco: [.45, .58], alvo: [540, 700], zMax: 1.4 }]], { trancos: c => [[c.w('B15', 'falida') + .05, 9]] });

// S13 — "Para você ter uma ideia," (rajada; o close sobe para alvo 680: o queixo fica acima da legenda) + "quando ela assumiu em 2014," (cartão branco: o ano)
rajadaAuto(['B16'], [['f_su_jovem_0012', { foco: [.5, .38], alvo: [540, 680] }], ['clip:mit_su_v', { foco: [.5, .36] }]]);
cartaoCor(['B17'], { cor: 'branco' });
