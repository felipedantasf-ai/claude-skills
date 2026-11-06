// ============================================================================
//  EXEMPLO COMPLETO do formato vox-editorial: as 29 cenas do vídeo "Lula, PIX MEI" (2:14), já com cores fortes
//  e apresentador colorido. Use como modelo de composição, ritmo e sincronia (c.w('Bxx','palavra')).
//  Assets usados: print_lula_* (prep_prints.py), g_* (recortes P&B), q_* (fotos escuras), t_papel, t_pergaminho.
// ============================================================================

// ============================================================================
//  Parte B: V1–V15 (B01–B33)
// ============================================================================
// (arcArrow, sparkleD e HEART estão em componentes.js)

// V1 — GANCHO: "Faltando 12 dias para o segundo turno, Lula anuncia que vai pagar 5 mil reais para o empreendedor MEI."
// régua do tempo em contagem regressiva (30 -> 12; hoje 13/out e o 2º turno 25/out) -> foto de arquivo impressa com fita + seta;
// recibo de R$ 5.000 sai de trás da foto; a lojinha (MEI) sobe de baixo
scene({
  beats: ['B01', 'B02', 'B03'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    const T = S.T = { n12: c.w('B01', '12'), seg: c.w('B01', 'segundo'), lula: c.w('B02', 'lula'), cinco: c.w('B02', '5'), emp: c.w('B03', 'empreendedor') };
    S.A = el(r, 'div', 'position:absolute;inset:0;');
    S.ru = ruler(S.A, 1000, { step: 24, big: 5 });
    S.num = serifText(S.A, '30', 540, 830, { s: 300 });
    S.sv1 = svgAbs(S.A, 0, 0, W, H);
    S.brk = scribble(S.sv1, 'M 540 985 C 600 925, 770 925, 828 985', { w: 5 });
    S.l13 = serifText(S.A, 'hoje, 13 out', 540, 1135, { s: 40, wt: 500, it: true });
    S.l25 = serifText(S.A, '2º turno, 25 out', 840, 1135, { s: 40, wt: 500, it: true });
    S.tk = el(S.A, 'div', `position:absolute;left:822px;top:968px;width:12px;height:96px;background:${K.laranja};box-shadow:-1px 2px 0 rgba(0,0,0,.25);opacity:0;`);
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;');
    S.slip = el(S.B, 'div', `position:absolute;left:700px;top:1000px;width:330px;height:170px;background:#f3f0e9 url(${ptex('#f3f0e9', 20)});box-shadow:0 16px 26px rgba(0,0,0,.35);` +
      'font-family:Elite;color:#1d1d1d;padding:22px 26px;opacity:0;');
    el(S.slip, 'div', 'font-size:22px;letter-spacing:.12em;color:#555;border-bottom:2px dashed #777;padding-bottom:8px;', 'PAGAMENTO');
    el(S.slip, 'div', 'font-size:54px;margin-top:14px;', 'R$ 5.000,00');
    S.ph = printPhoto(S.B, 'print_lula_chapeu_branco', 410, 1090, 540, { rot: -7 });
    S.sv2 = svgAbs(S.B, 0, 0, W, H);
    S.ar = loopArrow(S.sv2, 745, 600, 1.05, 14);
    S.loja = cut(S.B, 'g_loja', 790, 1560, 470, { plain: true, shadow: false });
    S.cap = { mode: 'title', y: 410 };
    for (let i = 0; i < 7; i++) cue(c, 'tick', .02 + i * .065, { g: .4 });
    cue(c, 'pencil', T.seg - .05, { d: .5, g: .55 });
    cue(c, 'shutter', T.lula - .08, { g: .6 }); cue(c, 'paper', T.lula, { g: .6 });
    cue(c, 'pencil', T.lula + .35, { d: .5, g: .5 });
    cue(c, 'flick', T.cinco - .05, { g: .5 });
    cue(c, 'whoosh', T.emp - .15, { d: .4, g: .35 }); cue(c, 'paper', T.emp + .2, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, T = S.T, swap = T.lula - .12;
    S.A.style.display = lt < swap + .3 ? 'block' : 'none'; S.B.style.display = lt >= swap ? 'block' : 'none';
    if (lt < swap + .3) {
      const q = E.out(clamp(lt / Math.max(.2, T.n12 + .02)));
      S.num.textContent = String(Math.round(30 - 18 * q)); S.num.style.opacity = 1;
      S.ru.style.opacity = 1; S.ru.set(18 * 24 * q - 212);     // no fim, marca grande em x=540 (hoje) e 12 marcas até 828 (2º turno)
      const out = E.in(clamp((lt - swap) / .3));
      S.A.style.transform = `translateY(${(-500 * out).toFixed(1)}px)`; S.A.style.opacity = (1 - out).toFixed(3);
      S.brk.draw(ez(lt, T.seg - .05, .5, E.inOut));
      [S.l13, S.l25].forEach((e, i) => tx(e, { y: 20 * (1 - ez(lt, T.seg + i * .15, .3)), o: ez(lt, T.seg + i * .15, .3) }));
      S.tk.style.opacity = ez(lt, T.seg + .1, .2).toFixed(3);
    }
    if (lt >= swap) {
      dropIn(S.ph, lt, swap, { dy: -1200, r0: 14, seed: 2, amp: 1.5 });
      S.ar.draw(ez(lt, T.lula + .35, .5, E.inOut));
      const qs = ez(lt, T.cinco - .05, .45, E.out5);
      S.slip.style.opacity = lt > T.cinco - .05 ? 1 : 0;
      S.slip.style.transform = `translate(${(-260 * (1 - qs)).toFixed(1)}px,${(-40 * (1 - qs)).toFixed(1)}px) rotate(${(5 - 8 * (1 - qs)).toFixed(2)}deg)`;
      riseIn(S.loja, lt, T.emp - .15, { dy: 700, seed: 4 });
      S.cap = { mode: 'title', y: 455, x: 600, rot: -4 };
    } else S.cap = { mode: 'title', y: 410 };
  },
});

// V2 — "E é por isso que muita gente odeia esse governo." (apresentador em P&B, como foto documental)
pres4(['B04', 'B05']);

// V3 — "Enquanto as pesquisas mostram o atual presidente muito atrás de Flávio," (Datafolha real: 49% x 45%, margem de 2 pontos)
// colunas de papel sobem do pé da tela na proporção certa (sem exagerar a diferença)
scene({
  beats: ['B06', 'B07'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    const k = 1100 / 50, base = 1920;
    S.cols = [[49, K.laranja, 150, 'Flávio'], [45, K.ciano, 570, 'Lula']].map(([v, col, x, nm]) => {
      const b = pblock(r, col, x, base - v * k, 360, v * k + 40);
      b.v = serifText(b, '', 180, 100, { s: 112, c: K.dark, sh: 'none', wt: 600 });
      b.n = serifText(b, nm, 180, 205, { s: 54, c: K.dark, sh: 'none', wt: 500, it: true });
      b.val = v; b.h0 = v * k + 40;
      return b;
    });
    S.src = tagL(r, 'Datafolha · 6 a 8/out/2026 · votos totais · margem de 2 pontos', 540, 640, { s: 27 });
    S.sv = svgAbs(r, 0, 0, W, H);
    const y49 = base - 49 * k, y45 = base - 45 * k;
    S.brk = scribble(S.sv, `M 948 ${y49 + 4} C 975 ${y49 + 10}, 975 ${y45 - 10}, 948 ${y45 - 4}`, { w: 5 });
    S.dif = serifText(r, '4 pontos', 960, y49 - 50, { s: 38, wt: 500, it: true });
    S.cap = { mode: 'title', y: 360 };
    const tp = c.w('B06', 'pesquisas');
    cue(c, 'whoosh', tp - .1, { d: .4, g: .4 }); cue(c, 'paper', tp + .05, { g: .5 }); cue(c, 'paper', tp + .17, { g: .45 });
    cue(c, 'pencil', c.w('B07', 'muito'), { d: .4, g: .45 });
  },
  update(S, c) {
    const lt = c.lt, tp = c.w('B06', 'pesquisas'), tm = c.w('B07', 'muito');
    S.cols.forEach((b, i) => {
      const q = riseIn(b, lt, Math.min(.02, tp - .1) + i * .12, { dy: b.h0, d: .7, amp: 0 });
      b.v.style.opacity = q > .5 ? 1 : 0; b.v.textContent = `${Math.round(b.val * clamp(q * 1.2))}%`;
      b.n.style.opacity = clamp(q * 1.5 - .3).toFixed(3); b.v.style.transform = b.n.style.transform = 'translate(-50%,-50%)';
    });
    tx(S.src, { o: ez(lt, .5, .3) });
    S.brk.draw(ez(lt, tm, .4, E.inOut));
    tx(S.dif, { o: ez(lt, tm + .3, .3), y: 10 * (1 - ez(lt, tm + .3, .3)) });
  },
});

// V4 — "hoje Lula anunciou o perdão de 12,6 bilhões de reais em dívidas de MEI." (recorte real do Terra com marca-texto + foto de arquivo + número)
scene({
  beats: ['B08', 'B09', 'B10'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.cl = clipping(r, { top: 170, w: 940, kicker: 'Terra · 13/10/2026', ts: 50, rot: -1.2,
      title: [['Lula anuncia projeto de ‘Pix MEI’ de R$ 5 mil e ', null], ['perdão a R$ 12,6 bi de dívidas', 'p'], [' a 12 dias da eleição', null]] });
    S.ph = printPhoto(r, 'print_lula_palanque', 300, 1130, 400, { rot: 5, tape: ['tr'] });
    S.n = serifText(r, '', 740, 1080, { s: 150 });
    S.cap = { mode: 'tag', y: 1570 };
    const tl = c.w('B08', 'lula'), tpd = c.w('B08', 'perdao'), t12 = c.w('B09', '12');
    cue(c, 'paper', .02, { g: .5 });
    cue(c, 'shutter', tl - .05, { g: .55 }); cue(c, 'paper', tl, { g: .5 });
    cue(c, 'marker', tpd - .05, { d: .6, g: .6 });
    for (let i = 0; i < 6; i++) cue(c, 'key', t12 + i * .08, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, tl = c.w('B08', 'lula'), tpd = c.w('B08', 'perdao'), t12 = c.w('B09', '12');
    S.cl.upd(lt, -.1);
    S.cl.mk('p', ez(lt, tpd - .05, .6, E.inOut));
    dropIn(S.ph, lt, tl - .1, { dy: 1300, r0: -10, seed: 5, amp: 1.5 });
    typeIn(S.n, 'R$ 12,6 bi', lt, t12 - .05, 13);
    S.n.style.transform = 'translate(-50%,-50%) rotate(-3deg)';
  },
});

// V5 — "MEI é o microempreendedor individual, aquele que fatura até R$ 81 mil por ano."
// lojinha recortada com faixa pêssego atrás; bloco ciano sobe e a fala vai para cima dele (como o "pure water" do exemplo)
scene({
  beats: ['B11', 'B12'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.bar = pblock(r, K.laranja, 250, -40, 160, 1000);
    S.loja = cut(r, 'g_loja', 540, 860, 640, { plain: true, shadow: false });
    S.agua = pblock(r, K.ciano, -60, 1190, 1200, 780, { clip: 'polygon(7% 0, 93% 0, 100% 100%, 0 100%)' });
    S.nota = el(S.agua, 'div', `position:absolute;left:0;right:0;top:470px;text-align:center;font-family:${SERIF};font-style:italic;font-weight:500;font-size:32px;color:#2a2a2a;`, 'limite anual de faturamento do MEI, mantido em 2026');
    S.cap = { mode: 'title', y: 360 };
    const t12 = c.b('B12');
    cue(c, 'whoosh', .0, { d: .35, g: .3 }); cue(c, 'paper', .1, { g: .4 });
    cue(c, 'whoosh', t12 - .2, { d: .45, g: .4 }); cue(c, 'paper', t12 + .1, { g: .4 });
  },
  update(S, c) {
    const lt = c.lt, t12 = c.b('B12');
    riseIn(S.bar, lt, -.3, { dy: -1000, d: .6, amp: 0 });
    riseIn(S.loja, lt, -.2, { dy: 800, seed: 3 });
    riseIn(S.agua, lt, t12 - .2, { dy: 780, d: .5, amp: 0 });
    S.cap = lt >= t12 - .03 ? { mode: 'dark', y: 1395 } : { mode: 'title', y: 360 };
  },
});

// V6 — "Junto veio o tal PIX MEI. Até 5 mil reais por pessoa sem precisar devolver." (mão com celular: notificação do Pix; seta de devolver riscada)
scene({
  beats: ['B13', 'B14', 'B15'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    const w = 700, h = w * 1100 / 710;
    S.ph = cut(r, 'g_celular', 650, 1190, w, { plain: true, shadow: false });
    const sx = .478 * w, sy = .035 * h, sw = (.866 - .478) * w, sh = (.552 - .035) * h;
    const scr = el(S.ph, 'div', `position:absolute;left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;border-radius:30px;overflow:hidden;background:linear-gradient(180deg,#1b1b1b,#0b0b0b);`);
    S.note = el(scr, 'div', 'position:absolute;left:12px;right:12px;top:80px;padding:16px 16px 14px;border-radius:18px;background:#ecebe6;box-shadow:0 8px 18px rgba(0,0,0,.4);opacity:0;');
    el(S.note, 'div', 'font-family:Inter;font-weight:700;font-size:15px;letter-spacing:.1em;color:#555;', 'PIX RECEBIDO');
    S.amt = el(S.note, 'div', `font-family:${SERIF};font-weight:700;font-size:36px;color:#111;margin-top:4px;white-space:nowrap;`, 'R$ 0,00');
    el(S.note, 'div', 'font-family:Inter;font-weight:500;font-size:14px;color:#666;margin-top:2px;', 'Pix MEI · por pessoa');
    S.sv = svgAbs(r, 0, 0, W, H);
    S.ret = scribble(S.sv, arcArrow(250, 1000, 100, -70, 215), { w: 6 });
    S.x1 = scribble(S.sv, 'M 120 870 L 380 1130', { w: 9, c: K.vermelho }); S.x2 = scribble(S.sv, 'M 380 870 L 120 1130', { w: 9, c: K.vermelho });
    S.cap = { mode: 'title', y: 360 };
    const tp = c.w('B13', 'pix'), t5 = c.w('B14', '5'), tpr = c.w('B15', 'precisar'), td = c.w('B15', 'devolver');
    cue(c, 'whoosh', 0, { d: .35, g: .3 });
    cue(c, 'ping', t5 - .2, { g: .55 }); cue(c, 'coin', t5 + .35, { g: .45 });
    cue(c, 'pencil', tpr - .05, { d: .5, g: .5 }); cue(c, 'marker', td - .02, { d: .35, g: .55 });
  },
  update(S, c) {
    const lt = c.lt, t5 = c.w('B14', '5'), tpr = c.w('B15', 'precisar'), td = c.w('B15', 'devolver');
    riseIn(S.ph, lt, -.25, { dy: 900, seed: 2 });
    const pn = ez(lt, t5 - .25, .4, E.out5);
    S.note.style.opacity = lt > t5 - .25 ? 1 : 0; S.note.style.transform = `translateY(${(-120 * (1 - pn)).toFixed(1)}px)`;
    S.amt.textContent = 'R$ ' + Math.round(5000 * ez(lt, t5 - .1, .8, E.out)).toLocaleString('pt-BR') + ',00';
    S.ret.draw(ez(lt, tpr - .05, .5, E.inOut));
    S.x1.draw(ez(lt, td - .02, .15, E.lin)); S.x2.draw(ez(lt, td + .13, .15, E.lin));
  },
});

// V7 — "Vamos ajudar vocês a saírem do sufoco, disse ele." (trecho real da reportagem com marca-texto + foto de arquivo impressa)
scene({
  beats: ['B16'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.aspas = serifText(r, '“', 215, 1080, { s: 420, c: K.laranja, sh: 'none', wt: 700 });
    S.cl = clipping(r, { top: 190, w: 940, kicker: 'Diário do Grande ABC · 13/10/2026', ts: 40, bs: 30, rot: 1.2,
      title: [['Lula anuncia PL para perdão dívidas dos MEIs e, sem detalhar, ‘Pix MEI’ de R$ 5 mil', null]],
      body: [['…disse que o governo pretende ajudar os microempreendedores a ', null], ['sair do sufoco', 's'], [' e dar “oxigênio” às empresas.', null]] });
    S.ph = printPhoto(r, 'print_lula_chapeu_preto', 700, 1150, 440, { rot: 4, tape: ['tl', 'tr'] });
    S.cap = { mode: 'tag', y: 1610 };
    const ts = c.w('B16', 'sairem');
    cue(c, 'paper', 0, { g: .5 }); cue(c, 'shutter', .25, { g: .5 });
    cue(c, 'marker', ts - .1, { d: .6, g: .6 });
  },
  update(S, c) {
    const lt = c.lt, ts = c.w('B16', 'sairem');
    S.cl.upd(lt, -.1);
    S.cl.mk('s', ez(lt, ts - .1, .55, E.inOut));
    dropIn(S.ph, lt, .2, { dy: 1300, r0: -10, seed: 6, amp: 1.5 });
    tx(S.aspas, { o: ez(lt, .35, .3), y: 30 * (1 - ez(lt, .35, .4)) });
  },
});

// V8 — "Tudo isso ainda precisa ser aprovado pelo Congresso e deve valer só no ano que vem." (Congresso recortado -> régua anda de 2026 para 2027)
scene({
  beats: ['B17', 'B18'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.A = el(r, 'div', 'position:absolute;inset:0;');
    S.sky = pblock(S.A, K.laranja, 100, 600, 880, 560);
    S.cg = cut(S.A, 'g_congresso', 540, 1120, 960, { plain: true, shadow: false });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;');
    S.ru = ruler(S.B, 1000, { step: 24, big: 10 });
    S.yr = serifText(S.B, '2026', 540, 820, { s: 280 });
    S.cap = { mode: 'title', y: 360 };
    const tv = c.w('B18', 'valer'), ta = c.w('B18', 'ano');
    cue(c, 'whoosh', .0, { d: .4, g: .35 }); cue(c, 'paper', .15, { g: .45 });
    cue(c, 'whoosh', tv - .15, { d: .35, g: .4 });
    for (let i = 0; i < 4; i++) cue(c, 'key', ta + i * .07, { g: .5 });
  },
  update(S, c) {
    const lt = c.lt, tv = c.w('B18', 'valer'), ta = c.w('B18', 'ano'), sw = tv - .12;
    S.A.style.display = lt < sw + .3 ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    riseIn(S.sky, lt, -.3, { dy: 700, d: .6, amp: 0 });
    riseIn(S.cg, lt, -.2, { dy: 900, seed: 3 });
    const out = E.in(clamp((lt - sw) / .3));
    S.A.style.transform = `translateY(${(-600 * out).toFixed(1)}px)`;
    if (lt >= sw) {
      const qin = E.out5(clamp((lt - sw) / .4));
      S.B.style.transform = `translateY(${(700 * (1 - qin)).toFixed(1)}px)`;
      S.ru.style.opacity = 1;
      S.ru.set(240 * ez(lt, ta - .15, .5, E.inOut) - 20);       // marca grande no centro: 2026 -> 2027
      if (lt < ta - .05) { S.yr.textContent = '2026'; S.yr.style.opacity = 1; } else typeIn(S.yr, '2027', lt, ta - .05, 14);
    }
  },
});

// V9 — "Mas, estranhamente, foi anunciado agora." (apresentador)
pres4(['B19'], { lead: -.2 });

// V10 — "Para quem não tem memória, isso parece muito bonito." (presente embrulhado em P&B, bloco pêssego, brilhos desenhados à mão)
scene({
  beats: ['B20', 'B21'], tr: 'cut', bg: 'dark', camMove: camPush(.05), lead: -.25,
  build(r, S, c) {
    paperBg(r);
    S.blk = pblock(r, K.laranja, 300, 660, 480, 620);
    S.g = cut(r, 'g_presente', 540, 1010, 580, { plain: true, shadow: false });
    S.sv = svgAbs(r, 0, 0, W, H);
    S.sp = [[255, 770, 46], [835, 830, 38], [810, 1330, 44], [280, 1290, 34]].map(([x, y, rr]) => scribble(S.sv, sparkleD(x, y, rr), { w: 5 }));
    S.cap = { mode: 'title', y: 380 };
    const tb = c.w('B21', 'bonito');
    cue(c, 'paper', .02, { g: .45 }); cue(c, 'pencil', tb - .1, { d: .5, g: .5 });
  },
  update(S, c) {
    const lt = c.lt, tm = c.w('B20', 'memoria'), tb = c.w('B21', 'bonito');
    riseIn(S.blk, lt, -.2, { dy: 700, d: .5, amp: 0 });
    dropIn(S.g, lt, -.15, { dy: -900, r0: 8, seed: 1, amp: 2 });
    // "memória": o presente some e volta como lembrança apagada
    const gl = lt > tm - .05 && lt < tm + .35;
    S.g.style.opacity = gl ? (.25 + .2 * Math.sin(lt * 60)).toFixed(3) : 1;
    S.sp.forEach((s, i) => s.draw(ez(lt, tb - .12 + i * .07, .25, E.out)));
  },
});

// V11 — "Mas esse governo passou os últimos anos atacando os empreendedores." (tribuna vazia no escuro -> dono da loja de costas)
scene({
  beats: ['B22', 'B23'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = el(r, 'div', 'position:absolute;inset:0;'); S.pa = plateBW(S.A, 'q_tribuna');
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;'); S.pb = plateBW(S.B, 'q_dono', { b: .95 });
    S.cap = { mode: 'glow', y: 1500 };
    const ta = c.w('B23', 'atacando');
    cue(c, 'whoosh', 0, { d: .4, g: .3 }); cue(c, 'slam', ta, { g: .4 });
  },
  update(S, c) {
    const lt = c.lt, ta = c.w('B23', 'atacando');
    const sw = ta - .05;
    S.A.style.display = lt < sw ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    S.pa.push(lt, sw, { ds: .1, dy: -20 });
    S.pb.push(lt - sw, c.dur - sw, { s0: 1.06, ds: .06, dy: -10 });
  },
});

// V12 — "Durante todo o mandato, a estratégia foi alimentar uma guerra constante entre patrão e funcionário."
// régua 2023–2026 com chave desenhada -> cabo de guerra recortado (terno x macacão) com blocos pêssego e ciano atrás
scene({
  beats: ['B24', 'B25', 'B26'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.A = el(r, 'div', 'position:absolute;inset:0;');
    S.ru = ruler(S.A, 1000, { step: 24, big: 10 });
    S.yrs = ['2023', '2024', '2025', '2026'].map((y, i) => serifText(S.A, y, 180 + i * 240, 1130, { s: 54, wt: 500 }));
    S.sv = svgAbs(S.A, 0, 0, W, H);
    S.brk = scribble(S.sv, 'M 180 960 C 180 900, 300 905, 540 890 C 780 905, 900 900, 900 960', { w: 5 });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;');
    S.pL = pblock(S.B, K.laranja, -20, 760, 560, 900); S.pR = pblock(S.B, K.ciano, 540, 760, 560, 900);
    S.cabo = cut(S.B, 'g_cabo', 540, 1110, 1000, { plain: true, shadow: false });
    S.tP = tagL(S.B, 'patrão', 300, 1560, { s: 40 }); S.tF = tagL(S.B, 'funcionário', 790, 1560, { s: 40 });
    S.cap = { mode: 'title', y: 380 };
    const tm = c.w('B24', 'mandato'), te = c.w('B25', 'estrategia'), tg = c.w('B25', 'guerra');
    cue(c, 'tick', .05, { g: .35 }); cue(c, 'pencil', tm - .1, { d: .5, g: .5 });
    cue(c, 'whoosh', te - .15, { d: .4, g: .4 }); cue(c, 'paper', te + .1, { g: .45 });
    cue(c, 'cloth', tg, { g: .5 });
    cue(c, 'pop', c.w('B26', 'patrao') - .05, { g: .45 }); cue(c, 'pop', c.w('B26', 'funcionario') - .05, { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, tm = c.w('B24', 'mandato'), te = c.w('B25', 'estrategia'), tg = c.w('B25', 'guerra'), sw = te - .15;
    S.A.style.display = lt < sw + .3 ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    S.ru.style.opacity = 1; S.ru.set(100);                      // marcas grandes em 180/420/660/900 (os anos)
    S.yrs.forEach((e, i) => tx(e, { o: ez(lt, .05 + i * .1, .25), y: 16 * (1 - ez(lt, .05 + i * .1, .25)) }));
    S.brk.draw(ez(lt, tm - .1, .55, E.inOut));
    S.A.style.transform = `translate(${(-8 * lt).toFixed(1)}px,${(-600 * E.in(clamp((lt - sw) / .3))).toFixed(1)}px)`;
    if (lt >= sw) {
      riseIn(S.cabo, lt, sw, { dy: 900, seed: 2, x: 6 * Math.sin(lt * 3.2) });
      riseIn(S.pL, lt, tg - .1, { dy: 950, d: .5, amp: 0 }); riseIn(S.pR, lt, tg - .02, { dy: 950, d: .5, amp: 0 });
      live(S.tP, lt, c.w('B26', 'patrao') - .05, { k: 'pop', seed: 1, amp: 1 });
      live(S.tF, lt, c.w('B26', 'funcionario') - .05, { k: 'pop', seed: 2, amp: 1 });
    }
  },
});

// V13 — "O presidente atacou a classe empresarial mais de uma vez," (foto de arquivo impressa + manchete real do Poder360 com marca-texto)
scene({
  beats: ['B27'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.ph = printPhoto(r, 'print_lula_stf', 380, 830, 500, { rot: -5 });
    S.cl = clipping(r, { cx: 590, top: 1160, w: 860, kicker: 'Poder360 · 25/06/2025', ts: 50, rot: 2,
      title: [['Empresários reclamam de impostos', 'r'], [', mas esquecem desonerações, diz Lula', null]] });
    S.cap = { mode: 'title', y: 300 };
    const tc = c.w('B27', 'classe');
    cue(c, 'shutter', 0, { g: .5 }); cue(c, 'paper', .05, { g: .5 }); cue(c, 'paper', .5, { g: .45 });
    cue(c, 'marker', tc - .05, { d: .6, g: .6 });
  },
  update(S, c) {
    const lt = c.lt, tc = c.w('B27', 'classe');
    dropIn(S.ph, lt, -.1, { dy: -1200, r0: 12, seed: 3, amp: 1.5 });
    S.cl.upd(lt, .4);
    S.cl.mk('r', ez(lt, tc - .05, .6, E.inOut));
  },
});

// V14 — "pintando quem gera emprego como o grande vilão da história, quase como um inimigo direto do trabalhador." (homem de terno sob holofote; círculo à mão no "vilão")
scene({
  beats: ['B28', 'B29', 'B30'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.p = plateBW(r, 'q_vilao');
    S.sv = svgAbs(r, 0, 0, W, H);
    S.ring = roughRing(S.sv, 540, 850, 190, 400, { w: 6, seed: 2 });
    S.cap = { mode: 'glow', y: 1560 };
    const tv = c.w('B29', 'vilao');
    cue(c, 'whoosh', 0, { d: .4, g: .3 }); cue(c, 'pencil', tv - .05, { d: .6, g: .55 });
  },
  update(S, c) {
    const lt = c.lt, tv = c.w('B29', 'vilao'), ti = c.w('B30', 'inimigo');
    S.p.push(lt, c.dur, { ds: .1, dy: -10 });
    S.ring.draw(ez(lt, tv - .05, .6, E.inOut));
    S.p.img.style.filter = `grayscale(1) contrast(1.06) brightness(${(.92 - .12 * ez(lt, ti - .1, .4)).toFixed(3)})`;
  },
});

// V15 — "Quando o debate era arrecadação, a fala era de que o empresário só chora e não quer pagar imposto."
// pilha de guias de imposto recortada sobre bloco mostarda + citação real (Poder360) com marca-texto
scene({
  beats: ['B31', 'B32', 'B33'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.bar = pblock(r, K.amarelo, 140, 880, 330, 1100);
    S.pap = cut(r, 'g_papelada', 305, 1270, 410, { plain: true, shadow: false });
    S.cl = clipping(r, { cx: 600, top: 300, w: 880, kicker: 'Lula · 25/06/2025 · Poder360', ts: 54, rot: -1.5,
      title: [['“…eu tô ', null], ['cansado de ver empresário falar da carga tributária', 'q'], ['.”', null]] });
    S.cap = { mode: 'tag', y: 1630 };
    const tf = c.w('B32', 'fala'), tch = c.w('B32', 'chora');
    cue(c, 'whoosh', 0, { d: .35, g: .3 }); cue(c, 'paper', .1, { g: .45 });
    cue(c, 'paper', tf - .1, { g: .5 }); cue(c, 'marker', tch - .25, { d: .8, g: .6 });
  },
  update(S, c) {
    const lt = c.lt, tf = c.w('B32', 'fala'), tch = c.w('B32', 'chora');
    riseIn(S.bar, lt, -.25, { dy: 1100, d: .6, amp: 0 });
    riseIn(S.pap, lt, -.15, { dy: 900, seed: 4 });
    S.cl.upd(lt, tf - .2);
    S.cl.mk('q', ez(lt, tch - .25, .8, E.inOut));
  },
});

// ============================================================================
//  Parte C: V16–V29 (B34–B72)
// ============================================================================

// V16 — "Quando a pauta da escala 6x1 explodiu, jogaram toda a conta nas costas de quem contrata."
// semana de papel (6 dias de trabalho + 1 de folga) se espalha no "explodiu"; homem com a pilha nas costas; a conta cai em cima
scene({
  beats: ['B34', 'B35'], tr: 'cut', bg: 'dark', camMove: camStill,
  shake: c => [[c.w('B34', 'explodiu') + .02, 12], [c.w('B35', 'costas') + .05, 8]],
  build(r, S, c) {
    paperBg(r);
    S.days = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((d, i) => {
      const off = i === 6, col = off ? K.ciano : K.laranja;
      const b = el(r, 'div', `position:absolute;left:${64 + i * 136}px;top:830px;width:124px;height:150px;background:${col} url(${ptex('#efece4', 30)});background-blend-mode:multiply;` +
        `box-shadow:0 10px 18px rgba(0,0,0,.25);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:${SERIF};color:#1d1d1d;opacity:0;`);
      el(b, 'div', 'font-size:42px;font-weight:600;', d);
      el(b, 'div', 'font-size:21px;font-style:italic;margin-top:6px;', off ? 'folga' : 'trabalho');
      b.vx = (i - 3) * 240 + (hrand(i * 7) - .5) * 220; b.vy = -(420 + hrand(i * 3) * 520); b.vr = (hrand(i * 11) - .5) * 720;
      return b;
    });
    S.man = cut(r, 'g_fardo', 560, 1110, 330, { plain: true, shadow: false });
    S.bill = el(r, 'div', `position:absolute;left:450px;top:470px;width:220px;height:140px;background:#f3f0e9 url(${ptex('#f3f0e9', 20)});box-shadow:0 10px 18px rgba(0,0,0,.3);` +
      'font-family:Elite;color:#222;padding:14px 18px;opacity:0;');
    el(S.bill, 'div', 'font-size:24px;letter-spacing:.12em;border-bottom:2px dashed #777;padding-bottom:6px;', 'A CONTA');
    [150, 118, 166].forEach(w => el(S.bill, 'div', `height:8px;margin-top:12px;width:${w}px;background:#bdb7aa;`));
    S.cap = { mode: 'title', y: 360 };
    const te = c.w('B34', 'explodiu'), tj = c.w('B35', 'jogaram'), tc = c.w('B35', 'conta'), tco = c.w('B35', 'costas');
    for (let i = 0; i < 7; i++) cue(c, 'paper', .05 + i * .07, { g: .3 });
    cue(c, 'tear', te - .02, { g: .6 }); cue(c, 'flap', te + .02, { n: 6, g: .5 });
    cue(c, 'whoosh', tj - .2, { d: .4, g: .35 });
    cue(c, 'paper', tc - .1, { g: .45 }); cue(c, 'slam', tco + .03, { g: .5 });
  },
  update(S, c) {
    const lt = c.lt, te = c.w('B34', 'explodiu'), tj = c.w('B35', 'jogaram'), tc = c.w('B35', 'conta'), tco = c.w('B35', 'costas');
    S.days.forEach((b, i) => {
      const t0 = .05 + i * .07;
      if (lt < t0 || lt > te + 1.1) { b.style.opacity = 0; return; }
      const d = Math.max(0, lt - te), q = E.out5(clamp((lt - t0) / .35));
      b.style.opacity = 1;
      b.style.transform = `translate(${(b.vx * d).toFixed(1)}px,${(b.vy * d + 1500 * d * d + 300 * (1 - q)).toFixed(1)}px) rotate(${(b.vr * d + (i - 3) * 1.2 * (1 - d)).toFixed(1)}deg)`;
    });
    const sag = lt > tco + .03 ? 20 * Math.exp(-(lt - tco - .03) * 6) * Math.abs(Math.sin((lt - tco - .03) * 16)) : 0;
    riseIn(S.man, lt, tj - .2, { dy: 1000, seed: 1, y: sag, x: -14 * clamp((lt - tj) / 3) });
    dropIn(S.bill, lt, tc - .1, { dy: -900, d: Math.max(.3, tco + .03 - (tc - .1)), r0: -20, seed: 2, amp: 1, y: sag, x: -14 * clamp((lt - tj) / 3) });
  },
});

// V17 — "Como se o dono do negócio fosse um explorador, ignorando completamente o custo absurdo que é manter uma folha de pagamento no Brasil."
// dono da loja de costas (foto escura) -> holerite real com os encargos do regime geral, linha a linha
scene({
  beats: ['B36', 'B37', 'B38'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = el(r, 'div', 'position:absolute;inset:0;'); S.pa = plateBW(S.A, 'q_dono', { k: 1.18, b: .9 });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;'); paperBg(S.B);
    S.hol = el(S.B, 'div', `position:absolute;left:100px;top:380px;width:880px;padding:42px 48px 36px;background:#f1eee6 url(${ptex('#f1eee6', 30)});color:#1b1b1b;box-shadow:0 26px 40px rgba(0,0,0,.4);opacity:0;`);
    S.fh = el(el(S.hol, 'div', `font-family:${SERIF};font-weight:700;font-size:60px;line-height:1.1;`), 'span', MK('#ffe600') + 'padding:0 .05em;', 'Folha de pagamento');
    el(S.hol, 'div', 'font-family:Inter;font-weight:500;font-size:24px;color:#555;margin:10px 0 18px;', 'o que a empresa paga além do salário (CLT, lucro presumido ou real)');
    S.rows = [['INSS patronal', '20%'], ['FGTS', '8%'], ['Sistema S e outros', '5,8%'], ['Seguro acidente (RAT)', '1% a 3%'], ['13º salário', '+1 salário/ano'], ['Adicional de férias', '+1/3 do salário']].map(([a, b]) => {
      const rw = el(S.hol, 'div', 'display:flex;justify-content:space-between;align-items:baseline;padding:14px 2px;border-top:1px dashed #9a948a;font-family:Elite;opacity:0;');
      el(rw, 'div', 'font-size:34px;color:#222;', a);
      el(rw, 'div', 'font-size:36px;color:#111;font-weight:700;', b);
      return rw;
    });
    el(S.hol, 'div', 'font-family:Inter;font-weight:500;font-size:19px;color:#777;margin-top:16px;', 'Lei 8.212/1991 · Lei 8.036/1990 · Constituição, art. 7º · terceiros variam por setor');
    [[300, -3], [600, 4]].forEach(([x, rr]) => el(S.hol, 'div', `position:absolute;left:${x}px;top:-20px;width:150px;height:46px;transform:rotate(${rr}deg);background:rgba(201,192,222,.82) url(${ptex('#c9c0de', 30)});background-blend-mode:multiply;` +
      'clip-path:polygon(0 8%,4% 0,9% 9%,14% 2%,20% 8%,80% 6%,86% 0,91% 8%,96% 1%,100% 9%,100% 92%,95% 100%,90% 91%,84% 99%,78% 92%,22% 94%,16% 100%,10% 92%,5% 99%,0 91%);'));
    S.cap = { mode: 'glow', y: 1500 };
    const tcu = c.w('B37', 'custo'), tf = c.w('B38', 'folha');
    cue(c, 'whoosh', 0, { d: .4, g: .3 });
    cue(c, 'paper', tcu - .15, { g: .55 });
    for (let i = 0; i < 6; i++) { cue(c, 'key', tcu + .12 + i * .22, { g: .4 }); cue(c, 'key', tcu + .19 + i * .22, { g: .3 }); }
    cue(c, 'marker', tf - .05, { d: .5, g: .55 });
  },
  update(S, c) {
    const lt = c.lt, tcu = c.w('B37', 'custo'), tf = c.w('B38', 'folha'), sw = tcu - .15;
    S.A.style.display = lt < sw ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    S.pa.push(lt, sw, { ds: .09, dy: -14 });
    if (lt >= sw) {
      const q = E.out5(clamp((lt - sw) / .45));
      S.hol.style.opacity = 1;
      S.hol.style.transform = `translateY(${(-1000 * (1 - q)).toFixed(1)}px) rotate(${(-1.2 + 5 * (1 - q) + .25 * Math.sin(lt * .8)).toFixed(2)}deg)`;
      S.rows.forEach((rw, i) => { const qq = ez(lt, tcu + .1 + i * .22, .16); rw.style.opacity = qq.toFixed(3); rw.style.transform = `translateX(${(30 * (1 - qq)).toFixed(1)}px)`; });
      mkSet(S.fh, ez(lt, tf - .05, .5, E.inOut));
      S.cap = { mode: 'tag', y: 1620 };
    } else S.cap = { mode: 'glow', y: 1500 };
  },
});

// V18 — "Mas enquanto o discurso oficial batia em quem produz, a economia real destruía o caixa das empresas." (tribuna -> caixa vazio)
scene({
  beats: ['B39', 'B40'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = el(r, 'div', 'position:absolute;inset:0;'); S.pa = plateBW(S.A, 'q_tribuna', { k: 1.3 });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;'); S.pb = plateBW(S.B, 'q_caixa');
    S.cap = { mode: 'glow', y: 1500 };
    const te = c.w('B40', 'economia'), tb = c.w('B39', 'batia');
    cue(c, 'whoosh', 0, { d: .4, g: .3 }); cue(c, 'slam', tb, { g: .35 });
    cue(c, 'whoosh', te - .15, { d: .35, g: .35 }); cue(c, 'coin', c.w('B40', 'caixa'), { g: .4 });
  },
  update(S, c) {
    const lt = c.lt, te = c.w('B40', 'economia'), sw = te - .1;
    S.A.style.display = lt < sw ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    S.pa.push(lt, sw, { ds: .06, dy: 30 });
    S.pb.push(lt - sw, c.dur - sw, { s0: 1.02, ds: .1, dy: -10 });
  },
});

// V19 — "Foram anos sufocados por juros nas alturas, aumento atrás de aumento de impostos, e o resultado mais amargo disso tudo."
// colunas de papel com a Selic real no fim de cada ano (Banco Central); 2025 = 15%, maior desde 2006; dois aumentos de imposto reais
scene({
  beats: ['B41', 'B42', 'B43', 'B44'], tr: 'cut', bg: 'dark', camMove: camPush(.04),
  build(r, S, c) {
    paperBg(r);
    S.lab = serifText(r, 'Selic, em % ao ano', 540, 480, { s: 42, wt: 500, it: true });
    const pts = [['2022', 13.75], ['2023', 11.75], ['2024', 12.25], ['2025', 15], ['2026', 13.75]];
    const base = 1240, kk = 520 / 15, cw = 150, gap = 36, x0 = 93;
    S.cols = pts.map(([y, v], i) => {
      const x = x0 + i * (cw + gap), hh = v * kk;
      const b = pblock(r, K.ciano, x, base - hh, cw, hh, { css: 'transform-origin:50% 100%;' });
      b.v = serifText(r, v.toLocaleString('pt-BR') + '%', x + cw / 2, base - hh - 42, { s: 44 });
      b.yl = serifText(r, y, x + cw / 2, base + 46, { s: 40, wt: 500 });
      return b;
    });
    S.base = el(r, 'div', `position:absolute;left:70px;right:70px;top:${base}px;height:4px;background:${K.ink};box-shadow:-1px 2px 0 rgba(0,0,0,.25);opacity:0;`);
    S.src = serifText(r, 'Banco Central · fim de cada ano (2026: setembro)', 540, base + 112, { s: 27, wt: 500, it: true });
    const cx5 = x0 + 3 * (cw + gap) + cw / 2, y5 = base - 15 * kk - 42;
    S.sv = svgAbs(r, 0, 0, W, H);
    S.ring = roughRing(S.sv, cx5, y5, 112, 48, { w: 5, seed: 3 });
    S.top = serifText(r, 'maior desde 2006', cx5 - 40, y5 - 92, { s: 36, wt: 500, it: true });
    S.t1 = tagL(r, 'alta do IOF · 2025', 540, 1470, { s: 40 }); S.t2 = tagL(r, 'reoneração da folha · 2025', 540, 1560, { s: 40 });
    S.cap = { mode: 'title', y: 310 };
    const tj = c.w('B42', 'juros'), ta = c.w('B42', 'alturas'), tau = c.w('B43', 'aumento'), ti = c.w('B43', 'impostos');
    for (let i = 0; i < 5; i++) cue(c, 'paper', .1 + i * .18, { g: .35 });
    cue(c, 'pencil', ta - .05, { d: .5, g: .5 });
    cue(c, 'paper', tau - .05, { g: .45 }); cue(c, 'paper', ti - .1, { g: .45 });
    void tj;
  },
  update(S, c) {
    const lt = c.lt, ta = c.w('B42', 'alturas'), tau = c.w('B43', 'aumento'), ti = c.w('B43', 'impostos');
    S.base.style.opacity = ez(lt, 0, .2).toFixed(3);
    tx(S.lab, { o: ez(lt, .05, .3) });
    S.cols.forEach((b, i) => {
      const q = E.out5(clamp((lt - .1 - i * .18) / .5));
      b.style.opacity = q > 0 ? 1 : 0; b.style.transform = `scaleY(${q.toFixed(4)})`;
      tx(b.v, { o: ez(lt, .35 + i * .18, .2), y: 12 * (1 - ez(lt, .35 + i * .18, .2)) }); tx(b.yl, { o: ez(lt, .1 + i * .18, .2) });
      if (i === 3) { const pe = lt > ta - .05; if (b._pe !== pe) { b._pe = pe; const col = pe ? K.laranja : K.ciano; b.style.backgroundColor = col; b.style.backgroundImage = `url(${ptex('#efece4', 30)})`; } }
    });
    tx(S.src, { o: ez(lt, .9, .3) });
    S.ring.draw(ez(lt, ta - .05, .5, E.inOut));
    tx(S.top, { o: ez(lt, ta + .25, .3), y: 10 * (1 - ez(lt, ta + .25, .3)) });
    live(S.t1, lt, tau - .05, { k: 'left', seed: 1, amp: 1 }); live(S.t2, lt, ti - .1, { k: 'right', seed: 2, amp: 1 });
  },
});

// V20 — "O Brasil batendo recorde histórico de recuperações judiciais e empresas fechando as portas."
// recorte real (IstoÉ Dinheiro) -> mapa antigo do Brasil com manchas que se espalham (como a febre do exemplo) -> porta de aço fechada
const CIDADES = [[-46.6, -23.5, 120], [-43.2, -22.9, 100], [-43.9, -19.9, 90], [-47.9, -15.8, 80], [-38.5, -13.0, 90], [-34.9, -8.05, 80], [-38.5, -3.7, 80], [-49.3, -25.4, 85],
  [-51.2, -30.0, 90], [-60.0, -3.1, 70], [-48.5, -1.45, 70], [-49.3, -16.7, 75], [-47.0, -22.9, 80], [-48.5, -27.6, 70], [-56.1, -15.6, 65], [-54.6, -20.4, 70], [-35.2, -5.8, 60], [-44.3, -2.5, 60], [-40.3, -20.3, 65], [-42.8, -5.1, 60]];
scene({
  beats: ['B45', 'B46', 'B47'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = el(r, 'div', 'position:absolute;inset:0;'); paperBg(S.A);
    S.cl = clipping(S.A, { top: 560, w: 940, kicker: 'IstoÉ Dinheiro · 07/04/2026', ts: 50, rot: 1.2,
      title: [['Brasil no vermelho: número de recuperações judiciais ', null], ['bate recorde', 'r'], [' e encosta em 2,5 mil', null]],
      foot: 'Serasa Experian: 2.466 empresas em recuperação judicial em 2025, “recorde para a série histórica”' });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;');
    S.M = oldMap(S.B, { lon: -53, lat: -15, z: 2.25, cy: 930 });
    S.labs = [S.M.lab('BRASIL', -52.5, -10.5, 60, '.32em'), S.M.lab('OCEANO', -41.5, -25.4, 30, '.24em'), S.M.lab('ATLÂNTICO', -41.5, -27.8, 30, '.24em')];
    S.svB = svgAbs(S.B, 0, 0, W, H); S.svB.style.mixBlendMode = 'multiply';
    const f = sv(sv(S.svB, 'defs', {}), 'filter', { id: 'rgh20', x: '-40%', y: '-40%', width: '180%', height: '180%' });
    sv(f, 'feTurbulence', { type: 'fractalNoise', baseFrequency: '0.035', numOctaves: '2', seed: '4', result: 'n' });
    sv(f, 'feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: '40', xChannelSelector: 'R', yChannelSelector: 'G' });
    S.bl = CIDADES.map(([lon, lat, R], i) => { const ci = sv(S.svB, 'circle', { r: 0, fill: 'rgba(64,64,74,.42)', filter: 'url(#rgh20)' }); ci.ll = [lon, lat]; ci.R = R * 1.2; ci.d = i * .045; return ci; });
    S.dado = tagL(S.B, '2.466 empresas em recuperação judicial em 2025 · Serasa', 540, 330, { s: 30 });
    S.C = el(r, 'div', 'position:absolute;inset:0;display:none;'); S.pc = plateBW(S.C, 'q_porta');
    S.cap = { mode: 'tag', y: 1480 };
    const tr2 = c.w('B45', 'recorde'), trj = c.w('B46', 'recuperacoes'), tf = c.w('B47', 'fechando');
    cue(c, 'paper', 0, { g: .5 }); cue(c, 'marker', tr2 - .05, { d: .5, g: .6 });
    cue(c, 'whoosh', trj - .15, { d: .4, g: .35 }); cue(c, 'crinkle', trj + .1, { g: .4 });
    cue(c, 'whoosh', tf - .15, { d: .35, g: .3 }); cue(c, 'slam', tf + .4, { g: .55 });
  },
  update(S, c) {
    const lt = c.lt, tr2 = c.w('B45', 'recorde'), trj = c.w('B46', 'recuperacoes'), tf = c.w('B47', 'fechando');
    const s1 = trj - .12, s2 = tf - .12;
    S.A.style.display = lt < s1 ? 'block' : 'none'; S.B.style.display = lt >= s1 && lt < s2 ? 'block' : 'none'; S.C.style.display = lt >= s2 ? 'block' : 'none';
    S.cl.upd(lt, -.1); S.cl.mk('r', ez(lt, tr2 - .05, .5, E.inOut));
    if (lt >= s1 && lt < s2) {
      const u = lt - s1;
      S.M.set({ z: 2.25 * (1 + .05 * u) });
      S.M.br.style.opacity = 1;
      S.labs.forEach(e => { S.M.place(e); e.style.opacity = ez(u, .1, .3).toFixed(3); });
      S.bl.forEach(ci => { const [x, y] = S.M.pt(...ci.ll); ci.setAttribute('cx', x.toFixed(1)); ci.setAttribute('cy', y.toFixed(1)); ci.setAttribute('r', (ci.R * E.out(clamp((u - .1 - ci.d) / .7))).toFixed(1)); });
      live(S.dado, u, .15, { k: 'pop', seed: 2, amp: 0, s0: .7 });
    }
    S.pc.push(lt - s2, c.dur - s2, { s0: 1.02, ds: .08, dy: -10 });
    S.cap = lt >= s2 ? { mode: 'glow', y: 1500 } : { mode: 'tag', y: lt >= s1 ? 1560 : 1480 };
  },
});

// V21 — "Legal o governo querer perdoar a dívida de quem ficou sufocado com esses impostos absurdos." (pilha de dívidas + carimbo PERDÃO em tinta vermelha)
scene({
  beats: ['B48', 'B49'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.blk = pblock(r, K.verde, 250, 640, 580, 940);
    S.pap = cut(r, 'g_papelada', 540, 1090, 520, { plain: true, shadow: false });
    S.st = inkStamp(r, 'PERDÃO', 540, 1040, { s: 118, rot: -11 });
    S.tg = tagL(r, 'R$ 12,6 bi em dívidas de MEI', 540, 1620, { s: 36 });
    S.cap = { mode: 'title', y: 360 };
    const tp = c.w('B48', 'perdoar');
    cue(c, 'paper', .02, { g: .45 }); cue(c, 'stamp', tp + .08, { g: .8 });
    cue(c, 'paper', c.w('B48', 'divida') - .05, { g: .4 }); cue(c, 'crinkle', c.w('B49', 'sufocado'), { g: .45 });
  },
  update(S, c) {
    const lt = c.lt, tp = c.w('B48', 'perdoar'), ts = c.w('B49', 'sufocado');
    riseIn(S.blk, lt, -.25, { dy: 950, d: .55, amp: 0 });
    const sq = lt > ts ? .06 * Math.abs(Math.sin((lt - ts) * 9)) * Math.exp(-(lt - ts) * 2) : 0;
    riseIn(S.pap, lt, -.15, { dy: 1000, seed: 2, s: 1 - sq });
    stampIn(S.st, lt, tp + .08);
    live(S.tg, lt, c.w('B48', 'divida') - .05, { k: 'pop', seed: 4, amp: 0, s0: .7 });
  },
});

// V22 — "Mas e aquele empreendedor que se lascou para pagar todos os impostos em dia? Botando muitas vezes sua saúde em jogo,
//        tendo que equilibrar diversos pratos ao mesmo tempo?" (madrugada no escritório -> 12 guias carimbadas PAGO -> eletro -> pratos girando)
scene({
  beats: ['B50', 'B51', 'B52', 'B53'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.A = el(r, 'div', 'position:absolute;inset:0;'); S.pa = plateBW(S.A, 'q_madrugada');
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;'); paperBg(S.B);
    S.slips = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'].map((m, i) => {
      const x = 84 + (i % 4) * 234, y = 560 + Math.floor(i / 4) * 160;
      const b = el(S.B, 'div', `position:absolute;left:${x}px;top:${y}px;width:210px;height:136px;background:#f2efe8 url(${ptex('#f2efe8', 20)});box-shadow:0 8px 14px rgba(0,0,0,.28);font-family:Elite;color:#222;padding:12px 16px;opacity:0;`);
      el(b, 'div', 'font-size:30px;letter-spacing:.08em;', m);
      [130, 100].forEach(w => el(b, 'div', `height:7px;margin-top:12px;width:${w}px;background:#c4bfb3;`));
      b.st = inkStamp(b, 'PAGO', 120, 82, { s: 40, c: K.verde, rot: -14 });
      b.st.style.borderWidth = '5px'; b.st.style.padding = '2px 14px 0';
      b._rot = (hrand(i * 5) - .5) * 5;
      return b;
    });
    S.svB = svgAbs(S.B, 0, 0, W, H);
    S.ecg = scribble(S.svB, 'M 60 980 L 320 980 L 360 920 L 400 1060 L 440 860 L 490 1100 L 530 980 L 690 980 L 720 950 L 750 1010 L 780 980 L 1020 980', { w: 6 });
    S.pratos = [210, 430, 650, 870].map((x, i) => {
      const g = sv(S.svB, 'g', { opacity: 0 });
      g.stick = scribble(g, `M ${x} 1010 L ${x + (i % 2 ? 4 : -4)} 1420`, { w: 5 });
      g.pl = sv(g, 'ellipse', { cx: x, cy: 1000, rx: 86, ry: 22, fill: 'none', stroke: K.ink, 'stroke-width': 5, style: 'filter:drop-shadow(-1px 2px 0 rgba(0,0,0,.28))' });
      g.x = x; return g;
    });
    S.plab = ['impostos', 'folha', 'fornecedores', 'clientes'].map((t, i) => serifText(S.B, t, 210 + i * 220, 1470, { s: 32, wt: 500, it: true }));
    S.cap = { mode: 'glow', y: 1480 };
    const tp = c.w('B51', 'pagar'), ts = c.w('B52', 'saude'), te = c.w('B53', 'equilibrar');
    cue(c, 'whoosh', 0, { d: .4, g: .3 });
    for (let i = 0; i < 12; i++) cue(c, 'stamp', tp + .05 + i * .085, { g: i % 2 ? .35 : .5 });
    cue(c, 'pencil', ts - .2, { d: .8, g: .5 });
    for (let i = 0; i < 4; i++) cue(c, 'wood', te - .05 + i * .12, { g: .35 });
  },
  update(S, c) {
    const lt = c.lt, tp = c.w('B51', 'pagar'), ts = c.w('B52', 'saude'), te = c.w('B53', 'equilibrar'), sw = tp - .15;
    S.A.style.display = lt < sw ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    S.pa.push(lt, sw, { ds: .1, dy: -14 });
    const sOut = ts - .3, eOut = te - .2;
    S.slips.forEach((b, i) => {
      const q = E.out5(clamp((lt - sw - i * .03) / .35)), out = E.in(clamp((lt - sOut) / .3));
      b.style.opacity = lt > sw ? 1 : 0;
      b.style.transform = `translateY(${(-900 * (1 - q) + 1400 * out).toFixed(1)}px) rotate(${b._rot.toFixed(2)}deg)`;
      stampIn(b.st, lt, tp + .05 + i * .085);
    });
    S.ecg.draw(ez(lt, ts - .2, .8, E.lin));
    S.ecg.style.opacity = (1 - ez(lt, eOut, .25)).toFixed(3);
    S.pratos.forEach((g, i) => {
      const t0 = te - .05 + i * .12;
      g.setAttribute('opacity', lt > t0 ? 1 : 0);
      g.stick.draw(ez(lt, t0, .25, E.out));
      const wob = Math.sin(lt * (5 + i) + i) * 8;
      g.pl.setAttribute('rx', (86 * (.82 + .18 * Math.cos(lt * 13 + i))).toFixed(1));
      g.pl.setAttribute('transform', `rotate(${wob.toFixed(2)} ${g.x} 1000)`);
    });
    S.plab.forEach((e, i) => tx(e, { o: ez(lt, te + .1 + i * .12, .25) }));
    S.cap = lt >= sw ? { mode: 'title', y: 360 } : { mode: 'glow', y: 1480 };
  },
});

// V23 — "Quando é que vão devolver o dinheiro dele?" (apresentador)
pres4(['B54']);

// V24 — "A verdade é que quem assume risco todo dia. Não quer esmola ou perdão de véspera de eleição."
// equilibrista na corda bamba (risco) -> copo com moeda (esmola) + foto de arquivo impressa + página de calendário do 2º turno
scene({
  beats: ['B55', 'B56'], tr: 'cut', bg: 'dark', camMove: camStill, lead: -.2,
  build(r, S, c) {
    paperBg(r);
    S.eq = cut(r, 'g_equilibrista', 540, 930, 1200, { plain: true, shadow: false });
    S.copo = cut(r, 'g_copo', 280, 1220, 290, { plain: true, shadow: false });
    S.ph = printPhoto(r, 'print_lula_camisa_brasil', 730, 1060, 470, { rot: 6, tape: ['tl', 'br'] });
    S.cal = el(r, 'div', `position:absolute;left:150px;top:520px;width:250px;height:270px;background:#f3f0e9 url(${ptex('#f3f0e9', 20)});box-shadow:0 14px 22px rgba(0,0,0,.32);text-align:center;opacity:0;overflow:hidden;`);
    el(S.cal, 'div', `background:${K.vermelho};color:#f3efe6;font-family:Inter;font-weight:700;font-size:22px;letter-spacing:.16em;padding:10px 0;`, 'OUTUBRO');
    S.n25 = el(S.cal, 'div', `font-family:${SERIF};font-weight:700;font-size:130px;line-height:1.05;color:#1b1b1b;margin-top:8px;`, '25');
    el(S.cal, 'div', `font-family:${SERIF};font-style:italic;font-size:28px;color:#333;`, '2º turno');
    S.sv = svgAbs(r, 0, 0, W, H);
    S.ring = roughRing(S.sv, 275, 685, 92, 72, { w: 6, c: K.vermelho, seed: 5 });
    S.cap = { mode: 'title', y: 360 };
    const tn = c.w('B56', 'nao'), te = c.w('B56', 'esmola'), tpe = c.w('B56', 'perdao'), tv = c.w('B56', 'vespera'), tel = c.w('B56', 'eleicao');
    cue(c, 'whoosh', 0, { d: .4, g: .3 });
    cue(c, 'whoosh', tn - .15, { d: .35, g: .35 }); cue(c, 'coin', te + .1, { g: .6 });
    cue(c, 'shutter', tpe - .15, { g: .5 }); cue(c, 'paper', tpe - .1, { g: .45 });
    cue(c, 'paper', tv - .1, { g: .4 }); cue(c, 'marker', tel - .05, { d: .5, g: .5 });
  },
  update(S, c) {
    const lt = c.lt, tn = c.w('B56', 'nao'), te = c.w('B56', 'esmola'), tpe = c.w('B56', 'perdao'), tv = c.w('B56', 'vespera'), tel = c.w('B56', 'eleicao');
    const sw = tn - .1;
    if (lt < sw + .35) {
      const out = E.in(clamp((lt - sw) / .35));
      tx(S.eq, { x: 10 * Math.sin(lt * 1.4), y: -900 * out, r: 1.6 * Math.sin(lt * 1.9), o: ez(lt, -.3, .3) });
    } else S.eq.style.opacity = 0;
    riseIn(S.copo, lt, te - .2, { dy: 800, seed: 3 });
    dropIn(S.ph, lt, tpe - .15, { dy: -1300, r0: -12, seed: 4, amp: 1.5 });
    dropIn(S.cal, lt, tv - .1, { dy: -900, r0: 10, seed: 6, amp: 1 });
    S.ring.draw(ez(lt, tel - .05, .5, E.inOut));
  },
});

// V25 — "O empresário quer respeito. Quer um ambiente de negócios próspero. Previsibilidade. Impostos justos. E acima de tudo,"
// cidade ao amanhecer (foto escura) + lista que se escreve com vistos à mão
scene({
  beats: ['B57', 'B58', 'B59', 'B60', 'B61'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.p = plateBW(r, 'q_cidade', { b: .7 });
    const items = [['respeito', 'B57', 'respeito'], ['ambiente de negócios próspero', 'B58', 'ambiente'], ['previsibilidade', 'B59', 0], ['impostos justos', 'B60', 'impostos']];
    S.sv = svgAbs(r, 0, 0, W, H);
    S.items = items.map(([t, b, w], i) => {
      const y = 560 + i * 140;
      const e = el(r, 'div', `position:absolute;left:190px;top:${y}px;white-space:nowrap;font-family:${SERIF};font-weight:600;font-size:62px;color:${K.ink};` +
        'text-shadow:-2px 3px 0 rgba(0,0,0,.4), 0 8px 18px rgba(0,0,0,.4);transform:translateY(-50%);opacity:0;', t);
      e.t = c.w(b, w) - .1;
      e.chk = scribble(S.sv, `M 92 ${y - 4} L 118 ${y + 24} L 160 ${y - 34}`, { w: 7 });
      return e;
    });
    S.acima = el(r, 'div', `position:absolute;left:190px;top:1150px;white-space:nowrap;font-family:${SERIF};font-style:italic;font-weight:500;font-size:52px;color:${K.laranja};` +
      'text-shadow:-2px 3px 0 rgba(0,0,0,.4);transform:translateY(-50%);opacity:0;', 'e acima de tudo…');
    S.cap = { mode: 'tag', y: 1580 };
    items.forEach(([, b, w]) => cue(c, 'pencil', c.w(b, w) - .05, { d: .3, g: .45 }));
    cue(c, 'whoosh', 0, { d: .4, g: .3 }); cue(c, 'paper', c.w('B61', 'acima') - .1, { g: .4 });
  },
  update(S, c) {
    const lt = c.lt, ta = c.w('B61', 'acima');
    S.p.push(lt, c.dur, { ds: .1, dy: -24 });
    S.items.forEach(e => { const q = ez(lt, e.t, .3); e.style.opacity = q.toFixed(3); e.style.transform = `translate(${(24 * (1 - q)).toFixed(1)}px,-50%)`; e.chk.draw(ez(lt, e.t + .05, .25, E.out)); });
    const qa = ez(lt, ta - .1, .3); S.acima.style.opacity = qa.toFixed(3); S.acima.style.transform = `translate(${(24 * (1 - qa)).toFixed(1)}px,-50%)`;
  },
});

// V26 — "Um governo que pare de enxergar quem trabalha como inimigo e passe a ver o empreendedor como o que ele realmente é.
//        Um parceiro indispensável para o crescimento do país." (mira vermelha na lojinha -> some; aperto de mão + linha que sobe)
scene({
  beats: ['B62', 'B63', 'B64', 'B65'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    paperBg(r);
    S.A = el(r, 'div', 'position:absolute;inset:0;');
    S.verde = pblock(S.A, K.verde, 220, 640, 640, 760);
    S.loja = cut(S.A, 'g_loja', 540, 1010, 580, { plain: true, shadow: false });
    S.svA = svgAbs(S.A, 0, 0, W, H);
    S.mira = sv(S.svA, 'g', {});
    S.m1 = roughRing(S.mira, 540, 1010, 340, 340, { w: 7, c: K.vermelho, seed: 7 });
    S.m2 = scribble(S.mira, 'M 540 600 L 540 760 M 540 1260 L 540 1420 M 130 1010 L 290 1010 M 790 1010 L 950 1010', { w: 7, c: K.vermelho });
    S.B = el(r, 'div', 'position:absolute;inset:0;display:none;');
    S.pe = pblock(S.B, K.laranja, 140, 860, 800, 520);
    S.svB = svgAbs(S.B, 0, 0, W, H);
    S.sobe = scribble(S.svB, 'M 150 800 L 320 690 L 450 740 L 620 560 L 760 600 L 930 420 M 868 422 L 930 420 L 916 482', { w: 7 });
    S.mao = cut(S.B, 'g_aperto', 540, 1110, 920, { plain: true, shadow: false });
    S.cap = { mode: 'title', y: 360 };
    const te = c.w('B63', 'enxergar'), tem = c.w('B64', 'empreendedor'), tp = c.w('B65', 'parceiro'), tc = c.w('B65', 'crescimento');
    cue(c, 'paper', .02, { g: .4 }); cue(c, 'marker', te - .05, { d: .6, g: .55 });
    cue(c, 'whoosh', tem - .15, { d: .35, g: .35 }); cue(c, 'paper', tem, { g: .4 });
    cue(c, 'whoosh', tp - .2, { d: .4, g: .35 }); cue(c, 'paper', tp, { g: .45 }); cue(c, 'pencil', tc - .1, { d: .6, g: .5 });
  },
  update(S, c) {
    const lt = c.lt, te = c.w('B63', 'enxergar'), ti = c.w('B63', 'inimigo'), tpv = c.w('B64', 'passe'), tem = c.w('B64', 'empreendedor'), tp = c.w('B65', 'parceiro'), tc = c.w('B65', 'crescimento');
    const sw = tp - .12;
    S.A.style.display = lt < sw + .3 ? 'block' : 'none'; S.B.style.display = lt >= sw ? 'block' : 'none';
    riseIn(S.loja, lt, -.2, { dy: 900, seed: 2 });
    S.m1.draw(ez(lt, te - .05, Math.max(.4, ti - te), E.inOut)); S.m2.draw(ez(lt, ti - .1, .3, E.out));
    S.mira.setAttribute('opacity', (1 - ez(lt, tpv, .3)).toFixed(3));
    riseIn(S.verde, lt, tem - .15, { dy: 800, d: .5, amp: 0 });
    S.A.style.transform = `translateY(${(-900 * E.in(clamp((lt - sw) / .3))).toFixed(1)}px)`;
    if (lt >= sw) {
      riseIn(S.mao, lt, sw, { dy: 900, seed: 3 });
      riseIn(S.pe, lt, sw + .1, { dy: 600, d: .5, amp: 0 });
      S.sobe.draw(ez(lt, tc - .1, .7, E.inOut));
    }
  },
});

// V27 — "Em alguns lugares, você até vai encontrar gente que muda de voto por algum auxílio." (mapa antigo com marcas -> urna e copo, seta à mão)
scene({
  beats: ['B66', 'B67', 'B68'], tr: 'cut', bg: 'dark', camMove: camStill,
  build(r, S, c) {
    S.M = oldMap(r, { lon: -53, lat: -15, z: 2.25, cy: 880 });
    S.lab = S.M.lab('BRASIL', -52.5, -10.5, 60, '.32em');
    S.pins = [[-38.5, -9.5], [-44, -5.5], [-36.5, -7.2], [-42, -12.5], [-61, -4.5], [-48, -3]].map(ll => { const e = el(r, 'div', `position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:${K.vermelho};box-shadow:0 0 0 4px #f3efe6, 0 4px 8px rgba(0,0,0,.35);opacity:0;`); e.ll = ll; return e; });
    S.urna = cut(r, 'g_urna', 300, 1340, 400, { plain: true, shadow: false });
    S.copo = cut(r, 'g_copo', 800, 1290, 230, { plain: true, shadow: false });
    S.sv = svgAbs(r, 0, 0, W, H);
    S.seta = scribble(S.sv, 'M 470 1250 C 560 1150, 640 1160, 700 1230 M 668 1196 L 702 1232 L 655 1240', { w: 6, c: '#3b2d16' });
    S.cap = { mode: 'tag', y: 1640 };
    const tl = c.w('B66', 'lugares'), tv = c.w('B68', 'voto'), ta = c.w('B68', 'auxilio');
    cue(c, 'paper', 0, { g: .35 });
    for (let i = 0; i < 6; i++) cue(c, 'pop', tl - .1 + i * .12, { g: .3 });
    cue(c, 'paper', tv - .1, { g: .45 }); cue(c, 'pencil', c.w('B68', 'algum') - .1, { d: .4, g: .45 }); cue(c, 'coin', ta + .1, { g: .5 });
  },
  update(S, c) {
    const lt = c.lt, tl = c.w('B66', 'lugares'), tv = c.w('B68', 'voto'), tal = c.w('B68', 'algum'), ta = c.w('B68', 'auxilio');
    S.M.set({ z: 2.25 * (1 + .06 * clamp(lt / c.dur)) });
    S.M.br.style.opacity = 1;
    S.M.place(S.lab); S.lab.style.opacity = ez(lt, .05, .3).toFixed(3);
    S.pins.forEach((e, i) => { const [x, y] = S.M.pt(...e.ll); e.style.left = `${x.toFixed(1)}px`; e.style.top = `${y.toFixed(1)}px`; const q = ez(lt, tl - .1 + i * .12, .25, E.back); e.style.opacity = clamp(q * 3).toFixed(3); e.style.transform = `scale(${q.toFixed(3)})`; });
    riseIn(S.urna, lt, tv - .15, { dy: 800, seed: 2 });
    S.seta.draw(ez(lt, tal - .1, .4, E.inOut));
    riseIn(S.copo, lt, ta - .1, { dy: 800, seed: 4 });
  },
});

// V28 — "Mas empreendedor de verdade vê esse tipo de atitude como desrespeito." (apresentador)
pres4(['B69', 'B70'], { lead: -.25 });

// V29 — FINAL: "Para entender o que acontece no Brasil, basta seguir esse perfil." (rosto ~0,5 s; papel sobe com a mão segurando o celular; toque no SEGUIR)
pres4(['B71', 'B72'], {
  tr: 'cut', lead: -.3,
  build(L, S, c) {
    const T = S.T = { in: .45, basta: c.w('B72', 'basta'), tap: c.w('B72', 'seguir') + .06 };
    S.ov = el(L, 'div', 'position:absolute;inset:0;opacity:0;');
    paperBg(S.ov);
    const w = 760, h = w * 1100 / 710;
    S.ph = cut(S.ov, 'g_celular', 600, 1190, w, { plain: true, shadow: false });
    const sx = .478 * w, sy = .035 * h, sw = (.866 - .478) * w, sh = (.552 - .035) * h;
    const scr = el(S.ph, 'div', `position:absolute;left:${sx}px;top:${sy}px;width:${sw}px;height:${sh}px;border-radius:32px;overflow:hidden;background:#ecebe6;`);
    S.av = el(scr, 'div', `position:absolute;left:50%;top:76px;width:136px;height:136px;margin-left:-68px;border-radius:50%;background:#e6d9b1 url(${ptex('#e6d9b1', 40)});box-shadow:0 0 0 4px #1a1a1a;overflow:hidden;`);
    S.gs = svgAbs(S.av, 0, 0, 136, 136);
    S.mer = [0, 1, 2, 3, 4].map(() => sv(S.gs, 'ellipse', { cx: 68, cy: 68, ry: 60, fill: 'none', stroke: '#5a4220', 'stroke-width': 2.5 }));
    [-30, 0, 30].forEach(dy => sv(S.gs, 'line', { x1: 8, x2: 128, y1: 68 + dy, y2: 68 + dy, stroke: '#5a4220', 'stroke-width': 2 }));
    [[60, 236, 22], [90, 270, 14]].forEach(([m, y, hh]) => el(scr, 'div', `position:absolute;left:${m}px;right:${m}px;top:${y}px;height:${hh}px;border-radius:7px;background:#c9c5bb;`));
    S.btn = el(scr, 'div', `position:absolute;left:26px;right:26px;top:320px;height:66px;border-radius:33px;background:${K.vermelho};color:#fff;display:flex;align-items:center;justify-content:center;font-family:${SERIF};font-weight:600;font-size:34px;`, 'Seguir');
    S.ok = el(scr, 'div', `position:absolute;left:26px;right:26px;top:320px;height:66px;border-radius:33px;background:#d6d2c8;color:#1b1b1b;display:flex;align-items:center;justify-content:center;font-family:${SERIF};font-weight:600;font-size:34px;opacity:0;`, 'Seguindo ✓');
    [0, 1, 2, 3, 4, 5].forEach(i => el(scr, 'div', `position:absolute;left:${16 + (i % 3) * ((sw - 32) / 3)}px;top:${420 + Math.floor(i / 3) * 100}px;width:${(sw - 32) / 3 - 8}px;height:92px;background:#cfcabe;`));
    S.bx = 600 - w / 2 + sx + sw / 2; S.by = 1190 - h / 2 + sy + 353;
    S.sv = svgAbs(S.ov, 0, 0, W, H);
    S.rip = sv(S.sv, 'circle', { cx: S.bx, cy: S.by, r: 0, fill: 'none', stroke: K.ink, 'stroke-width': 5, opacity: 0 });
    S.hearts = [[-260, -40, 1], [240, -90, .8], [-200, -260, .7], [300, -280, .9], [40, -330, .75]].map(([dx, dy, s]) => { const g = scribble(S.sv, HEART, { w: 5 }); g.dx = dx; g.dy = dy; g.s = s; return g; });
    S.mais = serifText(S.ov, '+1', S.bx + 200, S.by - 150, { s: 110, it: true });
    cue(c, 'whoosh', T.in - .05, { d: .4, g: .45 }); cue(c, 'paper', T.in + .1, { g: .5 });
    cue(c, 'click', T.tap, { g: .9 }); cue(c, 'pop', T.tap + .05, { g: .5 }); cue(c, 'pencil', T.tap + .1, { d: .5, g: .4 });
  },
  update(S, c) {
    const lt = c.lt, T = S.T, p = E.out5(clamp((lt - T.in) / .4));
    S.ov.style.opacity = lt > T.in ? 1 : 0;
    S.ov.style.transform = `translateY(${(1920 * (1 - p)).toFixed(1)}px)`;
    tx(S.ph, { y: 10 * Math.sin(lt * 1.4), r: .6 * Math.sin(lt * 1.1), o: 1 });
    S.mer.forEach((e, i) => e.setAttribute('rx', Math.abs(60 * Math.cos(lt * 1.6 + i * Math.PI / 5)).toFixed(1)));
    const done = lt > T.tap + .04;
    S.btn.style.opacity = done ? 0 : 1; S.ok.style.opacity = done ? 1 : 0;
    S.btn.style.transform = `scale(${(1 + .03 * Math.max(0, Math.sin(lt * 8))).toFixed(3)})`;
    const d = lt - T.tap;
    S.rip.setAttribute('opacity', d > 0 && d < .5 ? (1 - d / .5).toFixed(3) : 0); S.rip.setAttribute('r', d > 0 ? (40 + 260 * E.out(clamp(d / .5))).toFixed(1) : 0);
    S.hearts.forEach((g, i) => {
      const q = clamp((d - .08 - i * .06) / .5);
      g.draw(E.out(q));
      g.setAttribute('transform', `translate(${(S.bx + g.dx).toFixed(1)} ${(S.by + g.dy - 120 * E.out(clamp(d / 1.4))).toFixed(1)}) scale(${g.s}) translate(-50 -50)`);
      g.setAttribute('opacity', d > 0 ? 1 : 0);
    });
    tx(S.mais, { o: ez(lt, T.tap + .12, .25), y: -60 * ez(lt, T.tap + .12, 1) });
    S.cap = lt > T.in + .1 ? { mode: 'title', y: 360 } : { mode: 'glow', y: 1460 };
  },
});
