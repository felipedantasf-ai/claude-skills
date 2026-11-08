// ============================================================================
//  teste_avancada — demo da edit-avancada (Jack Daniel's: 0–32,2 s da gravação do Fernando, look retro)
//  20 cenas. Cada técnica entra porque a fala pede (tabela fala → técnica no SKILL.md); um efeito por vez, um texto por vez.
// ============================================================================
window.AV_LOOK = 'retro';
const DM_AM = '#ffd23f', DM_VM = '#d8342b', DM_CR = '#efe6d2';

// S1 0,00 "Me diz uma coisa, afinal de contas" — gancho no vídeo real (a mão pousando a garrafa): chegada com giro (giro grande só no
//   gancho e nas viradas). A garrafa está a 71% da largura do clipe: fx puxa para o miolo; o rótulo branco ocupa o meio-baixo, então a
//   legenda sobe para o vidro escuro do gargalo
cenaAV(['B01'], {
  fundo: 'clip:ad_garrafa', fundoOp: { from: 1.0, folga: 1.3, fx: .59 },
  legY: 430,
  cam: { chega: { r: 8, z: 1.1, d: .5 }, nulos: [[.5, .95, { z: 1.06 }, 'suave']] },
});

// S2 1,45 "quem é o tal do Jack Daniel's?" — flex no corte + boom; o recorte P&B (foto real) sobe no vermelho com borda de adesivo e
//   sombra longa; círculo amarelo que ferve no rosto; o nome gigante acende letra por letra ATRÁS do recorte
cenaAV(['B01'], {
  em: 'B01:quem', tr: 'av:flex', boom: true, fundoCor: '#b3241d',
  textos: [{ atras: true, txt: "JACK DANIEL'S?", modo: 'aleatorio', t: avW('B01', 'Jack'), d: .3, y: 640, s: 140, larg: 1060, lh: .9, cor: DM_CR, sombra: 'none' }],
  camadas: [{ fonte: 'ar_jack_fg', w: 900, x: 540, y: 1301, vida: false, pb: true, borda: 6, sombra: { tipo: 'longa', ang: 135, comp: 280, a: .35 },
    entra: { k: 'sobe', t: 0, d: .55, dist: 700 } }],
  riscos: [{ tipo: 'circulo', t: avW('B01', 'tal'), d: .4, camada: 0, rel: [.24, .1, .74, .5], cor: DM_AM, larg: 10 }],
  cam: { chega: { r: 8, z: 1.12, d: .5 }, nulos: [[0, 1.6, { z: 1.06 }, 'suave']] },
});

// S3 2,98 "Esse nome está em 14 milhões de caixas por ano no" — vídeo real que desfoca no número; contador; três caixas-adesivo caindo
//   como cartões (piscam ao entrar) e girando em degraus de stop-motion
cenaAV(['B02'], {
  fundo: 'clip:jd_barris_b', fundoOp: { from: .7, cor: 'brightness(.74) saturate(.9)', foco: [[0, 1.5], [avW('B02', '14', -.1), 1.5], [avW('B02', '14', .25), 12]] },
  textos: [{ modo: 'contador', t: avW('B02', '14'), d: .45, de: 0, ate: 14, fmt: 0, suf: ' MILHÕES', s: 116, cor: DM_AM, y: 880, sai: avW('B02', 'caixas', -.04) },
    // dado na tela = ano e fonte em letra pequena (regra 2 do kit): 14,1 mi de caixas de 9 L em 2024 (The Spirits Business)
    { modo: 'offset', txt: 'CAIXAS DE 9 L · 2024 · THE SPIRITS BUSINESS', t: avW('B02', '14'), d: .01, s: 30, fam: 'Elite', cor: DM_CR, y: 968, som: false,
      sai: avW('B02', 'caixas', -.04) }],
  camadas: [[290, 900, -8, 'esq'], [790, 930, 7, 'dir'], [540, 1020, -2, 'baixo']].map(([x, y, rot, dir], i) => ({
    fonte: 'card_jd', w: 330, x, y, rot, vida: .5, borda: 5, sombra: 'adesivo', degrau: { a: 10, passo: .26 },
    entra: { k: 'cartao', t: avW('B02', 'caixas', i * .06), d: .5, dir, pisca: true } })),
  cam: { nulos: [[0, 2.2, { z: 1.08 }, 'suave']] },
});

// S4 5,27 apresentador (gravação real; o clipe fern01 do jd_tng começa .14 s antes da palavra = boca sincronizada)
presAV(['B02'], 'clip:fern01', { em: 'B02:uisque', pre: 0, from: .14, enfase: ['uisque'] });

// S5 6,34 "Estados Unidos, e" — estalo no corte (P&B/cor a cada 2 quadros); a linha de engarrafamento real (câmera parada: o travelling da
//   prateleira da v1 dava panorâmica > 8 px/q em 94% dos quadros e estourava a régua de leitura)
cenaAV(['B02', 'B03'], {
  em: 'B02:Estados', tr: 'av:estalo',
  fundo: 'clip:jd_filler', fundoOp: { folga: 1.06 },
  cam: { nulos: [[0, .8, { z: 1.1 }, 'suave']] },
});

// S6 7,16 "quase ninguém sabe quem foi o cara" — o mosaico (anonimato) revela a foto real; holofote fecha no rosto; "?" vermelho fervendo
cenaAV(['B03'], {
  em: 'B03:quase', tr: 'av:pixel', trDur: .3, fundoCor: '#191512',
  camadas: [{ fonte: 'print_jack', w: 760, x: 540, y: 900, rot: -2.5, vida: .6, pb: true, sombra: 'suave' }],
  holofote: { t: avW('B03', 'sabe', .05), d: .55, x: 540, y: 845, r0: 950, r1: 360, a: .85 },
  riscos: [{ tipo: 'interroga', t: avW('B03', 'foi'), x: 860, y: 540, w: 240, h: 420, cor: DM_VM, larg: 18 }],
  cam: { chega: false, nulos: [[0, 1.86, { z: 1.12 }, 'suave']] },
});

// S7 9,02 "Nem a data de" — print REAL da Wikipédia na mesa, em corte seco (sem legenda: o print já é texto). Na v3 ele entrava como papel
//   rasgado da esquerda (.27 s): a troca ficava gradual, a régua não via o corte e contava o olho correndo até a foto do quadro de informações
cenaAV(['B03'], {
  em: 'B03:Nem', legenda: false,
  fundo: 'f_mesa_madeira', fundoOp: { folga: 1.1 },
  camadas: [{ fonte: 'p_wiki_a', w: 1000, x: 540, y: 960, rot: -1.2, vida: false, sombra: { tipo: 'longa', comp: 160, a: .32 } }],
  cam: { chega: { r: 0, z: 1.06, d: .3 }, sai: false, nulos: [[.3, .55, { z: 1.04 }, 'suave']] },
});

// S8 9,84 "nascimento dele existe mais. O cartório" — CORTE seco e limpo (semPulso: o desfoque de pulso entre dois enquadramentos do mesmo
//   print fazia o foco vagar pelo texto) para o detalhe, zoom 1,7× já parado (o zoom com deslocamento até a frase reprovou na régua,
//   panorâmica > 8 px/q). Enquadramento medido: a frase circulada fica em y ~830 e a do incêndio em ~1110 (277 px entre elas, abaixo dos
//   300 px de um salto; a 1,9× davam 310). Círculo na "date of birth unknown" (nascimento), xis no "existe", marca-texto no "cartório"
cenaAV(['B03', 'B04'], {
  em: 'B03:nascimento', legenda: false, semPulso: true,
  fundo: 'f_mesa_madeira', fundoOp: { folga: 1.1 },
  camadas: [{ fonte: 'p_wiki_a', w: 1000, x: 540, y: 960, rot: -1.2, vida: false, sombra: { tipo: 'longa', comp: 160, a: .32 } }],
  riscos: [{ tipo: 'circulo', t: avW('B03', 'nascimento', .05), camada: 0, rel: [.07, .17, .35, .335], w: 300, h: 110 },
    { tipo: 'xis', t: avW('B03', 'existe'), d: .3, camada: 0, rel: [.09, .2, .33, .3], larg: 8 },
    { tipo: 'marca', t: avW('B04', 'cartorio'), d: .3, camada: 0, rel: [.019, .493, .405, .546] }],
  cam: { chega: false, base: { x: 290, y: 885, z: 1.7 }, nulos: [[0, 1.79, { z: 1.04 }, 'suave']] },
});

// S9 11,63 "pegou fogo" — a cena nova nasce queimando do meio (Burn Film); fogo com tremor de calor no passo 8 e câmera na mão. A legenda
//   sobe para 1150, perto do foco das chamas (a 1330 o olho ia e voltava entre ela e o fogo)
cenaAV(['B04'], {
  em: 'B04:pegou', tr: 'av:queima', trDur: .6, legY: 1150,
  camadas: [{ fonte: 'ia_fogo', cobre: true, folga: 1.15, p: .9, vida: false, tremor: { f: 6, a: 4, fps: 8 } }],
  cam: { mao: 14, chega: { r: 0, z: 1.12, d: .5 } },
});

// S10 12,43 apresentador (fern02)
presAV(['B04'], 'clip:fern02', { em: 'B04:marca', pre: 0, from: .13 });

// S11 13,55 "aniversário no mês de setembro inteiro, porque" — folhas do calendário virando a cada 3 quadros até setembro (calendário
//   americano do século 19: SEPTEMBER é diegético; os dias já vêm circulados = o mês inteiro); círculo no mês. Sem legenda: as folhas já
//   escrevem os meses (um texto por vez). As folhas virando levam o olho de baixo para cima a cada folha (3–4 saltos na régua, com ou
//   sem legenda): uma vez por vídeo, com o resto da janela limpo
cenaAV(['B04'], {
  em: 'B04:aniversario', legenda: false,
  camadas: [{ fonte: 'ia_setembro', cobre: true, repete: false, folga: 1.18, p: .85, vida: false }],
  riscos: [{ tipo: 'circulo', t: avW('B04', 'setembro'), camada: 0, rel: [.17, .30, .82, .39], cor: DM_VM, larg: 10 }],
  build(r, S, c) {
    const q = avRel(S.lay[0], [.15, .232, .835, .845]);
    avFolhas(S.lay[0].L, S, c, { t: avW('B04', 'setembro', -.87), passo: .1, x: q.x, y: q.y, w: q.w, h: q.h });
  },
  cam: { chega: { r: 0, z: 1.08, d: .45 }, nulos: [[0, 1.94, { z: 1.06 }, 'suave']] },
});

// S12 15,49 "ninguém sabe quando Jack Daniel nasceu" — formas coloridas crescem e o círculo revela; o quadro antigo (vídeo real) desfoca e
//   a data de nascimento se datilografa com interrogações
//   A legenda fica em 1150, logo abaixo da data (y 960): a 1330 o olho saltava dela para a data e de volta
cenaAV(['B05'], {
  em: 'B05:ninguem', tr: 'av:formas', legY: 1150,
  fundo: 'clip:jd_quadro', fundoOp: { folga: 1.06, cor: 'brightness(.72)', foco: [[0, 0], [avW('B05', 'quando', -.15), 0], [avW('B05', 'quando', .2), 9]] },
  textos: [{ modo: 'digita', txt: 'NASCIMENTO: ??/??/18??', t: avW('B05', 'quando'), cps: 20, fam: 'Elite', s: 96, larg: 760, lh: 1.04, cor: '#f3ead6', y: 960,
    css: 'min-height:2.08em;' }],          // duas linhas com altura fixa desde a 1ª letra: o texto não pula quando quebra
  cam: { nulos: [[0, 2.16, { z: 1.08 }, 'suave']] },
});

// S13 17,65 "Jack Daniel nasceu no Tennessee" — espiral no corte + a câmera chega aproximando com o foco puxando (o drop da trilha); ondas
//   no lugar onde ele nasceu; caixa de seleção no nome do estado. Na v3 a grua descia do céu e o nascer do sol claro no topo (y ~340) virou o
//   foco: 30 quadros fora do miolo e 3 saltos. Agora a cabana fica no meio (base y 1070, z 1,5) e o céu claro fica acima do quadro
cenaAV(['B06'], {
  tr: 'av:espiral', trDur: .35, drop: true, legY: 1150,
  camadas: [{ fonte: 'ia_cabana', cobre: true, folga: 1.15, p: .9, vida: false }],
  riscos: [{ tipo: 'ondas', t: avW('B06', 'nasceu'), d: 1.0, camada: 0, rel: [.4, .45, .6, .59], w: 420, h: 420, cor: DM_AM }],
  textos: [{ modo: 'selecao', txt: 'TENNESSEE', t: avW('B06', 'Tennessee'), ws: [avW('B06', 'Tennessee')], fam: 'Inter', peso: 900, s: 110, y: 680, caixa: DM_AM }],
  cam: { chega: false, base: { x: 540, y: 1070, z: 1.5 }, grua: { y: 0, z: .95, d: .8, foco: 10, curva: 'suave' } },
});

// S14 19,37 "caçula de 10 irmãos" — dez figuras pulando uma a uma; a última, menor e vermelha, ganha o círculo
cenaAV(['B06'], {
  em: 'B06:cacula', fundoCor: '#191512',
  // as dez figuras saltam juntas (passo .015) e o círculo destaca a caçula: uma a uma, a cada .05 s, o olho dava 10 saltos (régua)
  //   legenda em 1150, logo abaixo da fila (a 1330 o olho saltava da caçula para ela)
  legY: 1150,
  build(r, S, c) { avFila(r, S, c, { t: -.06, n: 10, porLinha: 5, x: 540, y: 850, esp: 175, tam: 115, passo: .015, destaque: 9, cor: DM_CR, corDest: DM_VM }); },
  riscos: [{ tipo: 'circulo', t: avW('B06', 'irmaos'), x: 890, y: 955, w: 190, h: 250, cor: DM_AM }],
  cam: { chega: false },
});

// S15 20,64 "a mãe morre logo depois do parto" — vira a página; berço P&B com o look de filme antigo (sépia, poeira, riscos, furos) e luz de janela
cenaAV(['B06'], {
  em: 'B06:mae', tr: 'av:pagina', look: 'filme',
  fundo: 'ia_berco', fundoOp: { pb: true, folga: 1.12 },
  janela: { a: .4 },
  cam: { chega: false, nulos: [[0, 1.65, { z: 1.1 }, 'suave']] },
});

// S16 22,29 "e ele foge de casa ainda criança porque não estava" — o menino indo embora pela estrada (de costas: a casa fica atrás da câmera);
//   aproximação contínua, soco de zoom no "ainda criança" e o mundo perde a cor no "porque"
cenaAV(['B07', 'B08'], {
  fundo: 'ia_menino', fundoOp: { folga: 1.12, fx: .446 },
  pb: avW('B08', 'porque'),
  cam: { chega: { r: 0, z: 1.06, d: .4 }, mao: 6, nulos: [[0, 2.92, { z: 1.08 }, 'linear'], [avW('B07', 'ainda', -.06), .3, { z: 1.32 }, 'seco']] },
});

// S17 25,21 "suportando mais a madrasta" — flex no corte; a silhueta ganha o contorno amarelo que ferve; impacto na palavra
cenaAV(['B08'], {
  em: 'B08:suportando', tr: 'av:flex',
  fundo: 'ia_madrasta', fundoOp: { folga: 1.18, p: .85 },
  camadas: [{ fonte: 'ia_madrasta_fg', cobre: true, repete: false, folga: 1.18, p: .85, vida: false, contorno: { cor: '#ffd400', px: 6 } }],
  impactos: [avW('B08', 'madrasta')],
  cam: { chega: { r: 6, z: 1.12, d: .45 } },
});

// S18 26,50 apresentador (fern03; a cena seguinte entra em corte seco porque o clipe acaba junto com ela)
presAV(['B09'], 'clip:fern03', { lead: 0, from: 0 });

// S19 27,55 "foi um pastor chamado Dan Call, que pregava no domingo" — a foto original no fundo, o recorte do pastor alinhado por cima e
//   o nome gigante ENTRE os dois (atrás do pastor, na frente da igreja)
//   A legenda sobe para 1150, nas costas do pastor (casaco escuro): a 1330 ela era o foco e o olho saltava ao pastor quando o nome entrava
cenaAV(['B09'], {
  em: 'B09:foi', pre: 0, legY: 1150,
  fundo: 'ia_pastor', fundoOp: { folga: 1.15, p: .9 },
  textos: [{ atras: true, txt: 'DAN CALL', modo: 'aleatorio', t: avW('B09', 'Dan'), d: .3, s: 140, x: 490, y: 470, cor: DM_AM, sombra: '0 6px 0 rgba(0,0,0,.35)', sai: avW('B09', 'que') }],   // x 490: a mão erguida só encosta no último L
  camadas: [{ fonte: 'ia_pastor_fg', cobre: true, repete: false, folga: 1.15, p: .9, vida: false }],
  cam: { chega: { r: 0, z: 1.08, d: .4 }, nulos: [[0, 2.41, { z: 1.07 }, 'suave']] },
});

// S20 29,96 "e destilava o uísque durante a semana" — alambique; no "uísque": impacto, o mundo perde a cor, a marca surge (branco em screen)
//   com o estouro de formas por trás e a câmera dá um soco de zoom
//   A legenda fica em 1150, logo abaixo da marca (que diminuiu para 700 px): a 1330 o olho saltava da legenda para a marca no "uísque"
cenaAV(['B10'], {
  legY: 1150,
  camadas: [{ fonte: 'ia_alambique', cobre: true, folga: 1.15, p: .9, vida: false },
    { fonte: 'lg_jd', w: 700, x: 540, y: 840, vida: false, entra: { k: 'pop', t: avW('B10', 'uisque'), d: .4 } }],
  impactos: [avW('B10', 'uisque')],
  enfase: ['uisque'],
  build(r, S, c) {
    const tU = c.w('B10', 'uisque');
    S.lay[0].op.filtro = lt => lt >= tU ? `grayscale(1) contrast(1.15) brightness(${(1 - .3 * clamp((lt - tU) / .25)).toFixed(3)})` : '';
    S.lay[1].L.style.mixBlendMode = 'screen';
    const b = avEstouro(S.pal.el, S, c, { t: tU, x: 540, y: 840, n: 6, tam: 90, dist: 560 });
    b.style.zIndex = 'auto'; S.pal.el.insertBefore(b, S.lay[1].L);          // as formas ficam entre o alambique e a marca
  },
  cam: { nulos: [[0, 2.24, { z: 1.05 }, 'suave'], [avW('B10', 'uisque'), .35, { z: 1.12 }, 'snap']] },
});
