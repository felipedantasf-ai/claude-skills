// ===== teste edit-parallax3d: CarroAntigo (founded1) 0–25 s, um plano contínuo =====
// estações: Opala (fumaça cobre) -> motor (fumaça abre; câmera desce rápido) -> concessionária (para no monitor) ->
//           bolsa (recua do monitor; sobe até o painel; entra no gráfico) -> gráfico em tela cheia (cai, para, sobe)
const COR_QUENTE = 'sepia(.22) saturate(1.25) contrast(1.08) brightness(.93)';
const COR_FRIA = 'saturate(1.05) contrast(1.12) brightness(.88)';
const OPC_LOJA = { nome: 'loja', zs: [-1000, -350, 0], ov: 1.2, fx: .36, fy: .5, cor: COR_FRIA };
const CAM_LOJA = lt => kf3(lt, [[0, { x: 200, y: -520, z: 0 }], [.7, { x: 120, y: 0, z: 60 }, E.out], [2.6, { x: -150, y: 0, z: 380 }]]);
const BOLSA_MONITOR = [1473, 486, 1732, 694];      // tela do monitor da mesa (px da foto bolsa 3200×1699)
const BOLSA_GRAFICO = [1424, 282, 1760, 456];      // painel vermelho (IDCX) da parede
const PTS_CURVA = [[0, .16], [.07, .2], [.13, .18], [.2, .29], [.26, .27], [.33, .39], [.4, .41], [.46, .5], [.5, .53],
  [.56, .62], [.62, .7], [.68, .76], [.73, .78], [.78, .78], [.83, .74], [.89, .55], [.95, .3], [1, .12]];
const OPC_CURVA = { pts: PTS_CURVA, rot: 'VALOR DE MERCADO', esp: 15 };

// S1 — "Tem carro velho no Brasil sendo tratado como ativo financeiro. E isso acontece porque,"
scene({
  beats: ['B01', 'B02', 'B03'], tr: 'cut', camMove: camFixa,
  build(r, S, c) {
    S.p = palco3d(r, { nome: 'opala', zs: [-900, -60, 0], ov: 1.15, fx: .5, fy: .5, cor: COR_QUENTE });
    S.v1 = veu3(r, 'cima', .55); S.v2 = veu3(r, 'baixo', .7);
    S.tit = titulo3(r, 'OPALA SS', 'Chevrolet · anos 70', { x: 80, y: 250, s: 150, t0: .05, tSub: .6, sai: 3.4 });
    S.fr = frase3(r, c, ['B02'], { x: 80, y: 1540, s: 76, larg: 900, destaque: ['financeiro'], sai: 3.45 });
    S.fr2 = frase3(r, c, ['B03'], { x: 80, y: 820, s: 82, larg: 900, sai: 4.55 });
    S.fum = fumaca(r, { ox: 960, oy: 1380, t0: 3.45, tc: 4.78, n: 30, sobe: 380 });
    r.appendChild(S.fr2);
  },
  update(S, c) {
    const lt = c.lt, m = mao3(lt, 1, 1);
    const k = kf3(lt, [[0, { x: -820, y: 40, z: 0 }], [4.85, { x: 560, y: 60, z: 200 }]], E.inOut);
    S.p.cam({ x: k.x + m.x, y: k.y + m.y, z: k.z });
    S.tit.upd(lt); S.fr.upd(lt); S.fr2.upd(lt); S.fum.upd(lt);
  },
});

// S2 — "em determinado momento, alguns carros param de obedecer a lógica normal da indústria automotiva."
scene({
  beats: ['B04', 'B05', 'B06'], tr: 'cut', camMove: camFixa,
  build(r, S, c) {
    S.p = palco3d(r, { nome: 'motor', zs: [-700, 0], ov: 1.25, fx: .6, fy: .4, cor: COR_QUENTE });
    S.v = veu3(r, 'baixo', .85);
    S.pil = pilula3(r, 'MOTOR 250 · 6 CILINDROS', 80, 330, { t0: .9, sai: 4.25 });
    S.fr = frase3(r, c, ['B04', 'B05', 'B06'], { x: 80, y: 1180, s: 70, larg: 920, destaque: ['obedecer'], sai: 4.3 });
    S.fum = fumaca(r, { modo: 'revela', t0: 0, dur: 1.15, n: 26, semente: 3 });
  },
  update(S, c) {
    const lt = c.lt, m = mao3(lt, .8, 2);
    const k = kf3(lt, [[0, { x: -260, y: -60, z: 260 }], [c.dur - .45, { x: 180, y: 40, z: 40 }, E.inOut], [c.dur, { x: 200, y: 760, z: 0 }, E.in]]);
    S.p.cam({ x: k.x + m.x, y: k.y + m.y, z: k.z, dof: .9, foco: 0, dofMax: 7 });
    S.pil.upd(lt); S.fr.upd(lt); S.fum.upd(lt);
  },
});

// S3 — "Um carro novo costuma sair da concessionária" (entra pela passagem vertical; termina parado: é a imagem do monitor)
scene({
  beats: ['B07', 'B08'], tr: 'whipU', camMove: camFixa,
  build(r, S, c) {
    S.p = palco3d(r, OPC_LOJA);
    S.v = veu3(r, 'baixo', .7);
    S.fr = frase3(r, c, ['B07', 'B08'], { x: 80, y: 1400, s: 76, larg: 900, destaque: ['novo'], sai: c.dur - .45 });
  },
  update(S, c) {
    S.p.cam(CAM_LOJA(c.lt));
    S.v.set(1 - clamp((c.lt - (c.dur - .45)) / .35));                   // some junto com o texto: o último quadro é o do monitor
    S.fr.upd(c.lt);
  },
});

// S4 — "já começando a perder valor. Depois envelhece, deprecia, fica mais barato, e durante anos segue exatamente esse caminho."
// recua do monitor (a concessionária estava NELE), sobe até o painel da parede e entra no gráfico
scene({
  beats: ['B09', 'B10', 'B11', 'B12', 'B13'], tr: 'cut', camMove: camFixa,
  build(r, S, c) {
    S.p = palco3d(r, { nome: 'bolsa', zs: [-1100, -420, 0], ov: 1.15, fx: .5, fy: .42, cor: COR_FRIA });
    const mon = S.p.tela(0, BOLSA_MONITOR, 'background:#000;');
    S.dentro = palco3d(telaConteudo(mon), { ...OPC_LOJA, w: mon.tw * H / mon.th, h: H });
    S.dentro.cam(CAM_LOJA(99));
    S.vid = vidro3(mon);
    const pg = S.p.tela(0, BOLSA_GRAFICO, 'background:#000;');
    const cv = telaConteudo(pg);
    S.g = grafico3(cv, cv.w, cv.h, OPC_CURVA);
    S.uMeio = S.g.uX(.5);
    S.vid2 = vidro3(pg, { tom: 'rgba(255,90,60,.06)' });
    S.camMon = S.p.mira(0, BOLSA_MONITOR);
    S.camGraf = S.p.mira(0, BOLSA_GRAFICO);
    S.v = veu3(r, 'baixo', .75);
    S.fr1 = frase3(r, c, ['B09'], { x: 80, y: 1480, s: 76, larg: 900, destaque: ['perder'], sai: c.b('B10') - .1 });
    S.fr2 = frase3(r, c, ['B10', 'B11'], { x: 80, y: 1430, s: 76, larg: 900, destaque: ['deprecia'], sai: c.b('B12') - .1 });
    S.fr3 = frase3(r, c, ['B12', 'B13'], { x: 80, y: 1430, s: 74, larg: 900, sai: c.dur - .35 });
    S.pil = pilula3(r, 'BOLSA · SÃO PAULO', 80, 330, { t0: 1.1, sai: c.b('B12') - .2 });
  },
  update(S, c) {
    const lt = c.lt, M = S.camMon, G = S.camGraf, m = mao3(lt, .7, 4);
    const tEntra = c.b('B12') + .1;
    const k = kf3(lt, [
      [0, M], [.12, M],                                                    // segura 4 quadros: emenda exata com a S3
      [1.9, { x: M.x, y: M.y + 120, z: 260 }, t => E.inOut(t) * .5 + E.out(t) * .5],   // recua do monitor (começa devagar: o 1º quadro é a S3)
      [tEntra, { x: G.x * .6, y: G.y + 260, z: 520 }, E.inOut],             // sobe até a parede
      [c.dur - .02, G, t => E.in(t) * .35 + E.inOut(t) * .65],              // entra no gráfico (termina com a tela enchendo o vídeo)
    ]);
    const a = clamp(lt / 1.6), b = clamp((c.dur - .02 - lt) / 1.4);
    S.p.cam({ x: k.x + m.x * a * b, y: k.y + m.y * a * b, z: k.z });
    S.vid.set(E.out(clamp(lt / .9)) * .9); S.v.set(clamp((lt - .3) / .5));
    S.vid2.set(b * .8);
    S.g.set(S.uMeio * E.inOut(clamp((lt - .5) / (c.dur - .6))));
    S.fr1.upd(lt); S.fr2.upd(lt); S.fr3.upd(lt); S.pil.upd(lt);
  },
});

// S5 — "Só que alguns modelos chegam num ponto em que essa curva para de cair e começa a subir."
scene({
  beats: ['B14', 'B15', 'B16', 'B17'], tr: 'cut', camMove: camFixa,
  build(r, S, c) {
    el(r, 'div', `position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%, #102030, #060b12 75%);`);
    S.cx = el(r, 'div', `position:absolute;left:0;top:0;width:${(H * 1.93).toFixed(1)}px;height:${H}px;transform-origin:0 0;`);
    S.gw = 336 / 174 * H;                                                 // mesma proporção do painel da bolsa
    S.cx.style.width = S.gw.toFixed(1) + 'px';
    S.g = grafico3(S.cx, S.gw, H, OPC_CURVA);
    S.u0 = S.g.uX(.5); S.uFundo = S.g.uX(.755); S.uFim = 1;
    S.mk = S.g.marca(S.uFundo, '#ffffff');
    S.fr1 = frase3(r, c, ['B14', 'B15'], { x: 80, y: 300, s: 76, larg: 900, destaque: ['ponto'], sai: c.b('B16') - .1 });
    S.fr2 = frase3(r, c, ['B16', 'B17'], { x: 80, y: 300, s: 76, larg: 900, destaque: ['subir'] });
  },
  update(S, c) {
    const lt = c.lt;
    const tFundo = c.w('B15', 'ponto'), tSobe = c.w('B17', 'comeca');
    const u = lt < tFundo ? lerp3(S.u0, S.uFundo, E.inOut(clamp(lt / tFundo)))
      : lt < tSobe ? lerp3(S.uFundo, S.g.uX(.8), E.inOut(clamp((lt - tFundo) / (tSobe - tFundo))))
        : lerp3(S.g.uX(.8), S.uFim, E.out(clamp((lt - tSobe) / .95)));
    S.g.set(u, lt > tSobe ? '#f2c14e' : null);
    S.mk.upd(clamp((lt - tFundo + .1) / .3) * (1 - clamp((lt - tSobe - .6) / .4)));
    // câmera 2D sobre o gráfico: segue a ponta, depois abre para mostrar a curva inteira
    const q = S.g.cab(u);
    const fol = { x: 540 - q.x, y: 1020 - q.y };                         // no 1º quadro = o painel enchendo a tela (fim da S4)
    const sa = 1080 / S.gw * 1.06;                                        // aberto: a curva inteira na largura
    const aberto = { x: 540 - S.gw * .5 * sa, y: 1060 - H * .5 * sa };
    const ab = E.inOut(clamp((lt - tSobe - .2) / 1.3));
    const s = lerp3(1, sa, ab), x = lerp3(fol.x, aberto.x, ab), y = lerp3(fol.y, aberto.y, ab);
    S.cx.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(4)})`;
    S.fr1.upd(lt); S.fr2.upd(lt);
  },
});
