// ============================================================================
//  edit-papel — CENAS DE EXEMPLO (teste de 24/10/2026: corte "Alemanha dividida", 0–68 s, projeto projetos/teste_papel)
//  Uma cena de cada tipo do formato. Os beats/palavras são desse corte: troque pelos do seu render/timing.js.
//  Assets usados: r_* (reticula.py), t_amassado/t_preto (papel.py), clipes de render/clips (clipes.py).
//  Mundos: S1/S12/S16 apresentador · S3–S6, S11, S14–S15, S17, S19–S20 B-roll · S2, S7, S9, S10, S18, S21, S23, S24 papel ·
//          S8 pôster · S13, S22 ícone luminoso
//  Apresentador: S1 tem 5,3 s (vale para gravação real). Em vídeo de AVATAR do HeyGen toda aparição fica em 2–4 s:
//  faça presPunch(['B01','B02']) e leve o B03 para um papel/B-roll — o montar.py avisa quando passar.
// ============================================================================

// ===================== TESTE do formato edit-papel: Alemanha dividida, 0–41 s =====================

// S1 — "Enquanto muita gente fala que o socialismo só não funcionou porque nunca foi testado de verdade,"
presPunch(['B01', 'B02', 'B03'], {
  zooms: [1.0, 1.28, 1.08, 1.42],
  build(L, S, c) { S.cap = { modo: 'peito', mao: ['testado'] }; },
});

// S2 — "Poucas pessoas conhecem o que aconteceu | no século XX,"  (papel: tipografia + cartão que abre; chicote para o "século XX")
scene({
  beats: ['B04', 'B05'], tr: 'cut', camMove: camDeriva(.04),
  build(r, S, c) {
    papel(r, S);
    S.A = pagina(r); S.B = pagina(r);
    S.t1 = tipoFala(S.A, c, 'B04', 'sx2|B|rx3', 96, 430, { alinha: 'esq' });
    S.card = cartao(S.A, 'r_jovens', 540, 1190, 930, 640);
    S.t2 = tipoFala(S.B, c, 'B05', 'sx2|B', 540, 770, { alinha: 'centro', k: 1.4 });
    S.f1 = filete(S.B, 230, 745, 850, 745); S.f2 = filete(S.B, 230, 1105, 850, 1105);
    cue(c, 'whoosh', 0, { g: .32, d: .3 });
    cue(c, 'whoosh', c.b('B05') - .14, { g: .3, d: .28 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt); S.card.abre(lt, c.w('B04', 'conhecem'));
    chicote(S.A, S.B, lt, c.b('B05') - .12);
    S.t2.at(lt); S.f1.draw(ez(lt, c.b('B05') + .05, .35)); S.f2.draw(ez(lt, c.b('B05') + .1, .35));
  },
});

// S3 — "no coração da Europa,"  (B-roll; a legenda acumula no céu)
brollCena(['B06'], [[0, 'berlim_aereo', { from: 1 }]], { cap: { modo: 'acumula', y: 560 } });

// S4 — "com o povo mais industrializado e disciplinado do mundo."  (troca de clipe na palavra)
brollCena(['B07', 'B08'], [[0, 'fabrica20', { from: 1.5 }], [c => c.w('B08', 'disciplinado') - .04, 'nva_marcha', { from: .5 }]],
  { cap: { modo: 'acumula', y: 1180 } });

// S5 — "A Alemanha."  (três níveis: palavra pequena em cima, chave enorme)
brollCena(['B09'], [[0, 'reichstag45', { from: 1 }]], { cap: { modo: 'nivel', y: 900 } });

// S6 — "Mesmo país, mesma cultura, mesmo idioma e a mesma gente,"  (rajada: uma palavra grande por clipe)
brollCena(['B10', 'B11', 'B12', 'B13'], [
  [0, 'berlim45_cor', { from: 1 }], [c => c.b('B11') - .03, 'lojas49', { from: .5 }],
  [c => c.b('B12') - .03, 'tagesschau83', { from: 1 }], [c => c.b('B13') - .03, 'fila53_mulheres', { from: 1 }],
], { cap: { modo: 'palavra', y: 960 } });

// S7 — "divididos ao meio | depois da Segunda Guerra Mundial."  (papel: a foto em retícula se parte ao meio)
scene({
  beats: ['B14', 'B15'], tr: 'cut', camMove: camDeriva(.035),
  build(r, S, c) {
    papel(r, S);
    S.t1 = tipoFala(r, c, 'B14', 'B|rx2', 540, 430, { alinha: 'centro' });
    const w = 860, h = 578, y = 1080;
    S.esq = cartao(r, 'r_ruinas45', 540 - w / 4, y, w / 2, h, { pos: '0% 50%' });
    S.dir = cartao(r, 'r_ruinas45', 540 + w / 4, y, w / 2, h, { pos: '100% 50%' });
    S.esq.img.style.width = S.dir.img.style.width = '200%';
    S.dir.img.style.left = '-100%';
    S.corte = filete(r, 540, y - h / 2 - 30, 540, y + h / 2 + 30, { w: 3, de: 'inicio' });
    S.t2 = tipoFala(r, c, 'B15', 'cx2|mx3', 540, 1440, { alinha: 'centro', k: .9 });
    cue(c, 'whoosh', 0, { g: .3, d: .3 }); cue(c, 'tear', c.w('B14', 'meio') + .02, { g: .3, d: .4 });
  },
  update(S, c) {
    const lt = c.lt, tm = c.w('B14', 'meio');
    S.t1.at(lt);
    S.esq.abre(lt, .02); S.dir.abre(lt, .02);
    S.corte.draw(ez(lt, tm - .25, .25));
    const sep = E.out5(clamp((lt - tm) / .5));
    S.esq.style.transform = `translateX(${(-40 * sep).toFixed(1)}px) rotate(${(-2.5 * sep).toFixed(2)}deg)`;
    S.dir.style.transform = `translateX(${(40 * sep).toFixed(1)}px) rotate(${(2.5 * sep).toFixed(2)}deg)`;
    S.corte.style.opacity = sep > .05 ? 0 : 1;
    S.t2.at(lt);
  },
});

// S8 — "De um lado, o leste comunista controlado pela União Soviética."  (pôster escuro: duotone pêssego + seta)
scene({
  beats: ['B16', 'B17', 'B18'], tr: 'cut', camMove: camDeriva(.03),
  build(r, S, c) {
    poster(r, S);
    S.t1 = tipoFala(r, c, 'B16', 'sx3|sx2|B', 150, 420, { alinha: 'esq', cor: PP.creme, junta: ['B16', 'B17'], k: .8 });
    S.img = duo(r, 'r_tanque53', 540, 1100, 780);
    S.sv = svgAbs(r, 0, 0, W, H);
    S.seta = seta(S.sv, 830, 600, 700, 800, { c: PP.creme, curva: -.35, w: 3 });
    S.t2 = tipoFala(r, c, 'B18', 'rx4', 540, 1380, { alinha: 'centro', cor: PP.creme, k: .95 });
    cue(c, 'whoosh', 0, { g: .3, d: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt); S.img.at(lt, .05, { k: 'cresce', d: .45 });
    S.seta.draw(ez(lt, c.w('B17', 'comunista') + .1, .4, E.out));
    S.t2.at(lt);
  },
});

// S9 — "Do outro, o oeste capitalista aliado dos Estados Unidos."  (papel: cartão + letra de mão sublinhada)
scene({
  beats: ['B19', 'B20', 'B21'], tr: 'cut', camMove: camDeriva(.035),
  build(r, S, c) {
    papel(r, S, { flip: true });
    S.t1 = tipoFala(r, c, 'B19', 'sx2|sx2|B', 984, 420, { alinha: 'dir', junta: ['B19', 'B20'], k: .82 });
    S.card = cartao(r, 'r_ponte48', 540, 1100, 900, 675);
    S.t2 = tipoFala(r, c, 'B21', 'mx4', 540, 1500, { alinha: 'centro', k: .95 });
    S.sv = svgAbs(r, 0, 0, W, H);
    const cx_ = S.t2.caixa(0); S.sub = sublinha(S.sv, cx_.x0 + 10, cx_.x1 - 10, cx_.y1 + 6, { w: 4 });
    cue(c, 'whoosh', 0, { g: .3, d: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt); S.card.abre(lt, c.w('B20', 'oeste'));
    S.t2.at(lt); S.sub.draw(ez(lt, c.w('B21', 'unidos'), .4, E.out));
  },
});

// S10 — "Em 1948,"  (o ano rola entre filetes, como o "1962 en JAPÓN" da referência)
scene({
  beats: ['B22'], tr: 'cut', camMove: camDeriva(.03),
  build(r, S, c) {
    papel(r, S);
    S.em = tipo(r, [[['Em', 's']]], 300, 912, { alinha: 'esq', k: 1.25 });
    S.ano = roleta(r, 590, 955, { de: '2025', para: '1948', s: 118 });
    S.f1 = filete(r, 270, 860, 830, 860); S.f2 = filete(r, 270, 1052, 830, 1052);
    cue(c, 'whoosh', 0, { g: .28, d: .26 }); cue(c, 'flap', .12, { g: .22, n: 7 });
  },
  update(S, c) {
    const lt = c.lt;
    S.em.at(lt, [0]); S.ano.at(lt, .1, .75);
    S.f1.draw(ez(lt, 0, .35)); S.f2.draw(ez(lt, .05, .35));
  },
});

// S11 — "os dois lados estavam em ruínas."  (B-roll; "ruínas" em letra de mão)
brollCena(['B23'], [[0, 'berlim45_ruina', { from: 2 }]], { cap: { modo: 'acumula', y: 1240, mao: ['ruinas'] } });

// S12 — "Mas o lado capitalista tomou uma decisão corajosa."
presPunch(['B24', 'B25'], { zooms: [1.14, 1.0, 1.4], build(L, S, c) { S.cap = { modo: 'peito', mao: ['corajosa'] }; } });

// S13 — "aboliu o controle de preços da noite para o dia"  (escuro: etiqueta presa num cadeado; o cadeado abre e cai)
scene({
  beats: ['B26', 'B27'], tr: 'cut', camMove: camDeriva(.03),
  build(r, S, c) {
    escuro(r, S);
    S.tag = icone(r, 'etiqueta', 540, 760, 300);
    S.lock = icone(r, 'cadeado', 640, 860, 150);
    S.relogio = icone(r, 'relogio', 540, 760, 220);
    S.cap = { modo: 'escuro', y: 1080 };
    cue(c, 'whoosh', 0, { g: .26, d: .3 }); cue(c, 'click', c.w('B26', 'aboliu') + .3, { g: .4 });
  },
  update(S, c) {
    const lt = c.lt, ta = c.w('B26', 'aboliu') + .05, tn = c.b('B27');
    S.tag.at(lt, -.1, { out: tn - .05 });
    if (lt >= ta && S.lock.nome !== 'cadeadoAberto') S.lock.troca('cadeadoAberto');
    const cai = clamp((lt - ta - .15) / .55);
    S.lock.at(lt, -.1, { y: 700 * E.in(cai), out: tn - .05 });
    S.lock.style.transform += ` rotate(${(40 * E.in(cai)).toFixed(1)}deg)`;
    S.relogio.at(lt, tn, { k: 'foco' });
    S.relogio.svg.style.transform = `rotate(${(lt > tn ? (lt - tn) * 220 : 0).toFixed(1)}deg)`;
  },
});

// S14 — "e libertou o mercado."
brollCena(['B28'], [[0, 'vitrines49', { from: .5 }]], { cap: { modo: 'nivel', y: 940 } });

// S15 — "O lado socialista estatizou tudo e tabelou cada centavo da economia."
brollCena(['B29', 'B30'], [[0, 'loja_ddr', { from: .5 }], [c => c.w('B30', 'tabelou') - .04, 'lista_precos', { from: 1 }]],
  { cap: { modo: 'acumula', y: 1150, fortes: ['cada', 'centavo'] } });

// ===================== TESTE 2 (41–68 s): componentes que faltavam =====================

// S16 — "E a realidade não perdoou."  (a trilha cai aqui: trilha.json)
presPunch(['B31'], { zooms: [1.5], build(L, S, c) { S.cap = { modo: 'peito', mao: ['perdoou'] }; } });

// S17 — "Enquanto no lado socialista, mães e trabalhadores passavam"
brollCena(['B32', 'B33'], [[0, 'fila53_mulheres', { from: .5 }], [c => c.b('B33') - .03, 'fila_ddr', { from: .5 }]],
  { cap: { modo: 'acumula', y: 380 } });

// S18 — "4, 6 até 8 horas | na fila, no frio,"  (roleta em sequência; chicote para a foto que sai da barra preta)
scene({
  beats: ['B34', 'B35'], tr: 'cut', camMove: camDeriva(.035),
  build(r, S, c) {
    papel(r, S);
    S.A = pagina(r); S.B = pagina(r);
    S.num = roleta(S.A, 480, 980, { seq: ['4', '6', '8'], s: 380, peso: 900 });
    S.ate = tipo(S.A, [[['até', 'r']]], 480, 620, { alinha: 'centro', k: 1.3 });
    S.hrs = tipo(S.A, [[['horas', 'b']]], 700, 1030, { alinha: 'esq', k: .9 });
    S.bar = barra(S.B, 190, 1150, 700, 130);
    S.foto = ret(S.B, 'r_fila', 540, 880, 760, { sombra: true });
    S.t2 = tipoFala(S.B, c, 'B35', 'sx2|Mx2', 540, 1360, { alinha: 'centro', cor: PP.tinta });
    cue(c, 'whoosh', 0, { g: .3, d: .3 }); cue(c, 'flap', c.w('B34', '6') - .02, { g: .2, n: 5 }); cue(c, 'flap', c.w('B34', '8') - .02, { g: .2, n: 5 });
    cue(c, 'whoosh', c.b('B35') - .14, { g: .3, d: .28 });
  },
  update(S, c) {
    const lt = c.lt;
    S.num.at(lt, [c.w('B34', '6') - .05, c.w('B34', '8') - .05], .45);
    S.ate.at(lt, [c.w('B34', 'ate') - .03]); S.hrs.at(lt, [c.w('B34', 'horas') - .03]);
    entra(S.num, lt, -.05, { k: 'foco', d: .25 });
    chicote(S.A, S.B, lt, c.b('B35') - .12, { dir: 'esq' });
    emerge(S.foto, 1150, lt, c.b('B35') - .02, { dy: 420, d: .5 });
    S.t2.at(lt);
  },
});

// S19 — "para tentar comprar ovos, manteiga ou um pedaço de carne,"  (lista: uma palavra grande por clipe)
brollCena(['B36', 'B37'], [
  [0, 'compras_ddr', { from: .4 }], [c => c.w('B37', 'ovos') - .03, 'ovos_edeka', { from: .3 }],
  [c => c.w('B37', 'manteiga') - .03, 'estoque_edeka', { from: .3 }], [c => c.w('B37', 'pedaco') - .03, 'carne_preco', { from: .3 }],
], { cap: { modo: 'palavra' } });

// S20 — "A poucos metros dali, no lado capitalista,"
brollCena(['B38', 'B39'], [[0, 'placa_setor', { from: .5 }]], { cap: { modo: 'acumula', y: 1250 } });

// S21 — "os supermercados estavam abarrotados. Sem filas e sem racionamento."  (forma: arco que se desenha e enche de foto)
scene({
  beats: ['B40', 'B41'], tr: 'cut', camMove: camDeriva(.04),
  build(r, S, c) {
    papel(r, S, { flip: true });
    S.t1 = tipoFala(r, c, 'B40', 'sx2|r|B', 96, 420, { alinha: 'esq', k: .82 });
    S.arco = forma(r, 'r_super', 540, 1130, 640, { tipo: 'arco', h: 720 });
    S.t2 = tipoFala(r, c, 'B41', 'mx2|mx2', 540, 1530, { alinha: 'centro', k: .85 });
    S.sv = svgAbs(r, 0, 0, W, H);
    cue(c, 'whoosh', 0, { g: .3, d: .3 }); cue(c, 'pencil', c.w('B40', 'supermercados') + .05, { g: .18, d: .4 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt); S.arco.at(lt, c.w('B40', 'supermercados'));
    S.t2.at(lt);
    if (!S.sub && lt > 0) { const b = S.t2.caixa(1); S.sub = sublinha(S.sv, b.x0, b.x1, b.y1 + 4, { w: 4 }); }
    if (S.sub) S.sub.draw(ez(lt, c.w('B41', 'racionamento'), .35, E.out));
  },
});

// S22 — "Sonhava em ter um carro? No socialismo,"  (escuro: cérebro luminoso + rede; o sonho derrete no "socialismo")
scene({
  beats: ['B42', 'B43'], tr: 'cut', camMove: camDeriva(.03),
  build(r, S, c) {
    escuro(r, S);
    S.cer = icone(r, 'cerebro', 540, 820, 230);
    S.rede = rede(r, 540, 560, 220, 9, { seed: 4 });
    S.cap = { modo: 'escuro', y: 1060 };
    cue(c, 'whoosh', 0, { g: .25, d: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    S.cer.at(lt, -.05, { k: 'foco', d: .4 });
    S.rede.at(lt, c.w('B42', 'ter'), .9);
    derrete(S.cer, lt, c.w('B43', 'socialismo'), .5);
    S.rede.style.opacity = (1 - clamp((lt - c.w('B43', 'socialismo')) / .3)).toFixed(3);
  },
});

// S23 — "você entrava numa fila do governo e esperava até 13 anos"  (onda longa = a fila; roleta 00 -> 13)
scene({
  beats: ['B44', 'B45'], tr: 'cut', camMove: camKeys([[0, { s: 1 }], [1.0, { s: 1.03, x: -20 }], [2.5, { s: 1.07, x: -40, y: -20 }]]),
  build(r, S, c) {
    papel(r, S);
    S.t1 = tipoFala(r, c, 'B44', 'sx3|bx3', 96, 430, { alinha: 'esq', k: .85 });
    S.sv = svgAbs(r, 0, 0, W, H);
    S.onda = onda(S.sv, 110, 820, 970, { amp: 26, ciclos: 7, w: 12 });
    S.t2 = tipo(r, [[['esperava até', 's']]], 540, 1040, { alinha: 'centro' });
    S.num = roleta(r, 460, 1300, { de: '00', para: '13', s: 320, peso: 900 });
    S.anos = tipo(r, [[['anos', 'R']]], 745, 1290, { alinha: 'esq' });
    cue(c, 'whoosh', 0, { g: .3, d: .3 }); cue(c, 'flap', c.w('B45', '13') - .05, { g: .22, n: 8 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt); S.onda.draw(ez(lt, c.w('B44', 'fila') - .05, .9, E.inOut));
    S.t2.at(lt, [c.w('B45', 'esperava') - .03]);
    entra(S.num, lt, c.w('B45', 'ate') - .03, { k: 'foco', d: .2 });
    S.num.at(lt, c.w('B45', '13') - .08, .55);
    S.anos.at(lt, [c.w('B45', 'anos') - .03]);
  },
});

// S24 — "para receber um Trabant, um carrinho minúsculo, feito de resina e plástico."  (recorte em retícula que brota)
scene({
  beats: ['B46', 'B47', 'B48'], tr: 'cut', camMove: camDeriva(.04),
  build(r, S, c) {
    papel(r, S, { flip: true });
    S.t1 = tipoFala(r, c, 'B46', 'sx3|B', 984, 430, { alinha: 'dir', k: .9 });
    S.car = ret(r, 'r_trabant', 540, 1060, 820);
    S.t2 = tipoFala(r, c, 'B47', 'sx2|M', 540, 1360, { alinha: 'centro', k: .9 });
    S.t3 = tipoFala(r, c, 'B48', 'r r R r R', 540, 1580, { alinha: 'centro', k: .72 });
    cue(c, 'whoosh', 0, { g: .3, d: .3 }); cue(c, 'pop', c.w('B46', 'trabant'), { g: .3 });
  },
  update(S, c) {
    const lt = c.lt;
    S.t1.at(lt);
    const encolhe = clamp((lt - c.w('B47', 'minusculo')) / .35);
    S.car.at(lt, c.w('B46', 'trabant') - .05, { k: 'brota', d: .4, s: 1 - .38 * E.inOut(encolhe) });
    S.t2.at(lt); S.t3.at(lt);
  },
});
