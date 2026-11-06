
// ============================================================================
//  MAPA DE SATÉLITE (01/11/2026): o estilo de mapa da referência @rotageografica (Rota das Emoções). preparar_edit2.py junta este
//  arquivo ao fim do work/<xx>_c.js. Imagem de satélite REAL; câmera geográfica que voa com borrão de movimento e nunca para; estados
//  e municípios (limites do IBGE) acendendo um a um em cores fortes com borda branca; pinos vermelhos que caem com onda; nomes que se
//  digitam; rota amarela se desenhando; fotos com haste saindo do ponto; sigla do estado digitada no meio; título grande com brilho
//  quente. Dados: mapa_satelite.py -> render/sat_<nome>.js (window.SAT[nome]).
//  e2Mapa(beats, {mapa, cam0, voo, ...}) é a cena; SM (4º argumento do build) desenha:
//    SM.uf('MA', {t, cor, sigla, s})        SM.mun('Bacabeira', {t, cor, rotulo})        SM.seq(['MA','PI',...], t0, passo, {tipo, cores})
//    SM.pino('Pecém' | [lon, lat], {t, rotulo, lado})                SM.rotulo('Pecém', {t, dx, dy, s, lado})
//    SM.linha('transnordestina', {t, d, cor})   SM.foto('print_x', 'Pecém', {t, dx, dy, w})   SM.titulo('600 *km*', {t, y, s, tSai})
//    SM.apaga(objeto ou lista, t)              SM.enquadra(['MA', 'CE'], {larg, alt, dy}) -> câmera que enquadra
// ============================================================================
const SATC = { arco: ['#e8202a', '#e3197a', '#c41ec4', '#6b2ad6', '#3c7fe0', '#38c2df', '#34cf7c', '#6fdb3a', '#d3d933', '#f2a227', '#f0651c'],
  uf: { vermelho: '#b9262b', verde: '#62d13a', ocre: '#d49a2d', azul: '#3c7fe0', roxo: '#6b2ad6', rosa: '#e3197a' },
  rota: '#ffc21a', pino: '#e3202a', fonte: 'Inter' };
const satCor = (i, n) => SATC.arco[Math.round(i * (SATC.arco.length - 1) / Math.max(1, n - 1))];
const satMx = lon => (lon + 180) / 360 * 256;
const satMy = lat => { const s = Math.sin(Math.max(-85, Math.min(85, lat)) * Math.PI / 180); return (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * 256; };

function satMapa(M, S, nome, o = {}) {
  const D = (window.SAT || {})[nome]; if (!D) throw new Error(`SAT['${nome}'] não existe: rode mapa_satelite.py e confira o <script> no index.html`);
  const NB = 6, PERS = o.perspectiva ?? 1700;
  const root = el(M.el, 'div', `position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;background:${o.mar ?? '#0b1a29'};`);
  // o filtro na pilha achata o 3D: sem ele o mapa inclinado (rotateX) passa na frente dos rótulos, da foto e da legenda
  // (overflow:hidden e isolation NÃO bastam no Chromium)
  const pilha = el(root, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden;filter:contrast(1.0001);');
  const ui = el(root, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;');
  const grade = o.grade ?? 'saturate(1.2) contrast(1.07) brightness(.96)';
  // NB cópias do mapa (imagem + vetores): várias posições da câmera dentro do mesmo quadro = borrão de movimento de verdade
  const G = [];
  for (let k = 0; k < NB; k++) {
    const g = el(pilha, 'div', 'position:absolute;left:0;top:0;width:1080px;height:1920px;');
    const ims = el(g, 'div', `position:absolute;left:0;top:0;width:0;height:0;filter:${grade};`);
    const imgs = [];
    D.camadas.forEach((L, li) => L.img.forEach(p => {
      const im = el(ims, 'img', `position:absolute;left:0;top:0;width:${p.pw}px;height:${p.ph}px;transform-origin:0 0;display:none;`);
      im.src = p.src; im._p = p; im._L = L; im._li = li;
      if (li > 0) {           // borda suave só nos lados externos da camada (a de baixo continua por trás)
        const f = 4, e = [p.x <= L.bb[0] + 1e-6, p.x + p.w >= L.bb[2] - 1e-6, p.y <= L.bb[1] + 1e-6, p.y + p.h >= L.bb[3] - 1e-6];
        const m = `linear-gradient(to right, transparent 0, #000 ${e[0] ? f : 0}%, #000 ${e[1] ? 100 - f : 100}%, transparent 100%),` +
          `linear-gradient(to bottom, transparent 0, #000 ${e[2] ? f : 0}%, #000 ${e[3] ? 100 - f : 100}%, transparent 100%)`;
        im.style.webkitMaskImage = im.style.maskImage = m; im.style.webkitMaskComposite = 'source-in'; im.style.maskComposite = 'intersect';
      }
      imgs.push(im);
    }));
    const svg = svgAbs(g, -1080, -1920, 3240, 5760); svg.setAttribute('viewBox', '-1080 -1920 3240 5760');
    const cam = sv(svg, 'g', {});
    G.push({ g, imgs, cam, uf: sv(cam, 'g', {}), mun: sv(cam, 'g', {}), lin: sv(cam, 'g', {}) });
  }
  const SM = { D, root, ui, objs: [] };
  const ponto = q => {
    if (Array.isArray(q)) return q[0] > 0 && q[0] < 256 && q[1] > 0 ? q : [satMx(q[0]), satMy(q[1])];   // [x, y] z0 ou [lon, lat]
    if (D.pontos[q]) return D.pontos[q];
    if (D.mun[q]) return D.mun[q].sede || D.mun[q].c;
    if (D.uf[q]) return D.uf[q].c;
    throw new Error(`ponto '${q}' não existe em SAT['${nome}']`);
  };
  SM.ponto = ponto;
  // câmera: {lon, lat, zoom, rot, tilt, cy} | {em: 'MA' | 'Bacabeira' | [lon, lat], zoom} | {x, y, zoom} (de SM.enquadra)
  const camN = v => { const r = { rot: 0, tilt: 0, cy: 960, ...v }; if (v.em !== undefined) [r.x, r.y] = ponto(v.em); else if (v.lon !== undefined) { r.x = satMx(v.lon); r.y = satMy(v.lat); } return r; };
  SM.enquadra = (nomes, o2 = {}) => {
    let bb = [1e9, 1e9, -1e9, -1e9];
    [].concat(nomes).forEach(n => { const ob = D.mun[n] || D.uf[n]; const b = ob ? ob.bb : (([x, y]) => [x, y, x, y])(ponto(n)); bb = [Math.min(bb[0], b[0]), Math.min(bb[1], b[1]), Math.max(bb[2], b[2]), Math.max(bb[3], b[3])]; });
    const w = Math.max(bb[2] - bb[0], 1e-4), h = Math.max(bb[3] - bb[1], 1e-4);
    const zoom = Math.log2(Math.min((o2.larg ?? 860) / w, (o2.alt ?? 1150) / h)) + (o2.dz ?? 0);
    return { x: (bb[0] + bb[2]) / 2, y: (bb[1] + bb[3]) / 2 - (o2.dy ?? 0) / Math.pow(2, zoom), zoom, rot: o2.rot ?? 0, tilt: o2.tilt ?? 0, cy: o2.cy ?? 960 };
  };
  SM.camEm = (c, lt) => {
    if (!SM._voo) {
      SM._c0 = camN(typeof o.cam0 === 'function' ? o.cam0(c, SM) : o.cam0);
      SM._voo = (o.voo ? o.voo(c, SM) : []).map(([t0, t1, v, cv]) => [t0, t1, camN(v), cv]);
    }
    let a = SM._c0;
    for (const [t0, t1, b, cv] of SM._voo) {
      if (lt <= t0) break;
      const u = (E2C[cv] || E.inOut)(clamp((lt - t0) / Math.max(.01, t1 - t0)));
      a = { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), zoom: lerp(a.zoom, b.zoom, u), rot: lerp(a.rot, b.rot, u), tilt: lerp(a.tilt, b.tilt, u), cy: lerp(a.cy, b.cy, u) };
      if (lt < t1) break;
    }
    const dr = o.deriva ?? .045;                       // a câmera nunca para: aproximação lenta e contínua (o "drift" da referência)
    return { ...a, zoom: a.zoom + dr * lt, rot: a.rot + (o.giro ?? 0) * lt };
  };
  // mundo (z0) -> tela, com rotação e inclinação (perspective + rotateX, igual ao CSS da pilha)
  const proj = (cm, wx, wy) => {
    const s = Math.pow(2, cm.zoom), a = cm.rot * Math.PI / 180, dx = (wx - cm.x) * s, dy = (wy - cm.y) * s;
    const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
    const tl = cm.tilt * Math.PI / 180, w = 1 - ry * Math.sin(tl) / PERS;
    return [540 + rx / w, cm.cy + ry * Math.cos(tl) / w, 1 / w];
  };
  SM.proj = proj;
  const aplicaCam = (gr, cm) => {
    const s = Math.pow(2, cm.zoom), a = cm.rot * Math.PI / 180, ca = Math.cos(a) * s, sa = Math.sin(a) * s;
    gr.cam.setAttribute('transform', `matrix(${ca} ${sa} ${-sa} ${ca} ${540 - (ca * cm.x - sa * cm.y)} ${cm.cy - (sa * cm.x + ca * cm.y)})`);
    const mw = 900 / s, mh = 1500 / s * (1 + cm.tilt / 30);             // meia tela em pixels z0 (folga para giro e inclinação)
    gr.imgs.forEach(im => {
      const p = im._p, k = s * p.w / p.pw;
      const vis = im._L.z <= cm.zoom + 2.4 && p.x < cm.x + mw && p.x + p.w > cm.x - mw && p.y < cm.y + mh && p.y + p.h > cm.y - mh;
      im.style.display = vis ? '' : 'none'; if (!vis) return;
      const X = 540 + ((p.x - cm.x) * Math.cos(a) - (p.y - cm.y) * Math.sin(a)) * s, Y = cm.cy + ((p.x - cm.x) * Math.sin(a) + (p.y - cm.y) * Math.cos(a)) * s;
      im.style.transform = `translate(${X.toFixed(2)}px,${Y.toFixed(2)}px) rotate(${cm.rot.toFixed(3)}deg) scale(${k.toFixed(6)})`;
    });
    gr.g.style.transformOrigin = `540px ${cm.cy.toFixed(1)}px`;
    gr.g.style.transform = cm.tilt ? `perspective(${PERS}px) rotateX(${cm.tilt.toFixed(3)}deg)` : '';
  };
  // ---- polígonos (estado / município): um path por cópia, animados juntos
  const poli = (tipo, k, o2) => {
    const ob = D[tipo][k]; if (!ob) throw new Error(`${tipo} '${k}' não existe em SAT['${nome}']`);
    const cor = o2.cor ?? SATC.arco[SM.objs.length % SATC.arco.length];
    const ps = G.map(gr => {
      const wrap = sv(gr[tipo], 'g', {});
      sv(wrap, 'path', { d: ob.d, fill: cor, 'fill-opacity': o2.op ?? (tipo === 'uf' ? .78 : .8), 'fill-rule': 'evenodd', stroke: o2.borda ?? '#ffffff',
        'stroke-opacity': .92, 'stroke-width': o2.esp ?? (tipo === 'uf' ? 2.6 : 2.2), 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' });
      return wrap;
    });
    const obj = { tipo, k, ob, ps, t: o2.t ?? 0, tOut: o2.tSai, kind: 'poli', anima: o2.anima ?? 'pop' };
    SM.objs.push(obj);
    if (o2.sigla) obj.sig = SM.rotulo(o2.sigla === true ? k : o2.sigla, { em: o2.siglaEm ?? ob.c, t: o2.t ?? 0, s: o2.s ?? 96, centro: true, tSai: o2.tSai, digita: .35 });
    if (o2.rotulo) obj.rot = SM.rotulo(o2.rotulo === true ? (ob.nome || k) : o2.rotulo, { em: ob.sede || ob.c, t: (o2.t ?? 0) + .15, tSai: o2.tSai, dx: o2.dx, dy: o2.dy, lado: o2.lado });
    return obj;
  };
  SM.uf = (k, o2 = {}) => poli('uf', k, o2);
  SM.mun = (k, o2 = {}) => poli('mun', k, o2);
  SM.seq = (lista, t0, passo, o2 = {}) => lista.map((k, i) => poli(o2.tipo ?? (D.uf[k] ? 'uf' : 'mun'), k, { ...o2, t: t0 + i * passo, cor: (o2.cores || satCor)(i, lista.length) }));
  SM.apaga = (obj, t) => { [].concat(obj).forEach(ob => { ob.tOut = t; if (ob.sig) ob.sig.tOut = t; if (ob.rot) ob.rot.tOut = t; }); };
  // ---- linha (rota/ferrovia) que se desenha: halo + traço
  SM.linha = (k, o2 = {}) => {
    const pts = Array.isArray(k) ? k.map(ponto) : D.linhas[k]; if (!pts) throw new Error(`linha '${k}' não existe`);
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const at = { fill: 'none', stroke: o2.cor ?? SATC.rota, 'vector-effect': 'non-scaling-stroke', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const ps = G.map(gr => [sv(gr.lin, 'path', { ...at, 'stroke-opacity': .3, 'stroke-width': (o2.esp ?? 5) * 2.8 }), sv(gr.lin, 'path', { ...at, 'stroke-width': o2.esp ?? 5 })]);
    const obj = { kind: 'linha', pts, cum, ps, t: o2.t ?? 0, d: o2.d ?? 1.2, tOut: o2.tSai };
    SM.objs.push(obj); return obj;
  };
  // ---- pino vermelho que cai com onda no chão
  SM.pino = (q, o2 = {}) => {
    const w = o2.w ?? 46, e = el(ui, 'div', 'position:absolute;left:0;top:0;width:0;height:0;opacity:0;');
    const onda = el(e, 'div', `position:absolute;left:${-w * .55}px;top:${-w * .2}px;width:${w * 1.1}px;height:${w * .4}px;border-radius:50%;border:3px solid ${SATC.pino};box-sizing:border-box;opacity:0;`);
    const gota = el(e, 'div', `position:absolute;left:${-w / 2}px;top:${-w * 1.3}px;width:${w}px;height:${w * 1.3}px;transform-origin:50% 100%;filter:drop-shadow(0 4px 5px rgba(0,0,0,.5));`,
      `<svg viewBox="0 0 40 52" width="${w}" height="${w * 1.3}"><path d="M20 51 C14 40 3 31 3 19 A17 17 0 1 1 37 19 C37 31 26 40 20 51 Z" fill="${o2.cor ?? SATC.pino}" stroke="#fff" stroke-width="2"/><circle cx="20" cy="19" r="6.5" fill="#fff"/></svg>`);
    const obj = { kind: 'pino', e, onda, gota, xy: ponto(q), t: o2.t ?? 0, tOut: o2.tSai };
    SM.objs.push(obj);
    if (o2.rotulo) obj.rot = SM.rotulo(o2.rotulo === true ? q : o2.rotulo, { em: obj.xy, t: (o2.t ?? 0) + .12, tSai: o2.tSai, lado: o2.lado, dx: o2.dx, dy: o2.dy, s: o2.s });
    return obj;
  };
  // ---- nome preso ao mapa, digitado letra a letra (Inter 800 branca com sombra escura e brilho leve)
  SM.rotulo = (txt, o2 = {}) => {
    const s = o2.s ?? 46;
    const e = el(ui, 'div', `position:absolute;left:0;top:0;white-space:nowrap;font-family:${SATC.fonte};font-weight:800;font-size:${s}px;line-height:1;color:#fff;letter-spacing:-.01em;` +
      `text-shadow:0 2px 3px rgba(0,0,0,.55),0 4px 14px rgba(0,0,0,.55),0 0 ${(s * .4).toFixed(0)}px rgba(255,255,255,${o2.brilho ?? .28});`);
    const ch = [...String(txt)].map(cc => el(e, 'span', 'opacity:0;', cc === ' ' ? '&nbsp;' : esc(cc)));
    const obj = { kind: 'rotulo', e, ch, xy: ponto(o2.em ?? txt), t: o2.t ?? 0, tOut: o2.tSai, dig: o2.digita ?? Math.min(.45, .035 * ch.length + .1),
      centro: !!o2.centro, lado: o2.lado ?? 'dir', dx: o2.dx, dy: o2.dy, s };
    SM.objs.push(obj); return obj;
  };
  // ---- foto com haste saindo do ponto (cartão arredondado com borda branca); a haste cresce e a foto salta
  SM.foto = (src, q, o2 = {}) => {
    const w = o2.w ?? 250, a = AS(src), h = o2.h ?? Math.min(w * 1.1, w * a.h / a.w);
    const sv0 = svgAbs(ui, 0, 0, 1080, 1920);
    const ln = sv(sv0, 'line', { stroke: '#fff', 'stroke-width': 3.2, 'stroke-linecap': 'round', opacity: 0 });
    const card = el(ui, 'div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;border-radius:${w * .07}px;overflow:hidden;border:4px solid rgba(255,255,255,.95);box-sizing:border-box;` +
      `box-shadow:0 14px 30px rgba(0,0,0,.5);transform-origin:50% 100%;opacity:0;`);
    const im = el(card, 'img', `width:100%;height:100%;object-fit:cover;object-position:${o2.pos ?? '50% 50%'};`); im.src = a.src;
    const obj = { kind: 'foto', ln, card, xy: ponto(q), t: o2.t ?? 0, tOut: o2.tSai, w, h, dx: o2.dx ?? 150, dy: o2.dy ?? -300 };
    SM.objs.push(obj); return obj;
  };
  // ---- título grande (tela): as letras fecham o espaçamento saindo do desfoque, brilho quente; '|' quebra linha, *x* em itálico
  SM.titulo = (txt, o2 = {}) => {
    const s = o2.s ?? 150, e = el(ui, 'div', `position:absolute;left:${o2.x ?? 540}px;top:${o2.y ?? 360}px;transform:translate(-50%,-50%) rotate(${o2.rot ?? -2}deg);text-align:${o2.alin ?? 'center'};` +
      `white-space:nowrap;font-family:${SATC.fonte};font-weight:800;font-size:${s}px;line-height:.98;color:#fff;letter-spacing:-.02em;`);
    const ch = [], br = o2.brilho ?? .7;
    const sh = `0 3px 4px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.4),0 0 ${(s * .22).toFixed(0)}px rgba(255,176,64,${br}),0 0 ${(s * .5).toFixed(0)}px rgba(255,150,40,${(br * .45).toFixed(2)})`;
    txt.split('|').forEach((linha, li) => {
      const L = el(e, 'div', li ? `font-size:${o2.s2 ?? s * .78}px;` : '');
      linha.split(/(\*[^*]+\*)/).forEach(seg => {
        const sp = el(L, 'span', /^\*.*\*$/.test(seg) ? 'font-style:italic;font-weight:700;' : '');
        [...seg.replace(/\*/g, '')].forEach(cc => ch.push(el(sp, 'span', `display:inline-block;text-shadow:${sh};opacity:0;`, cc === ' ' ? '&nbsp;' : esc(cc))));
      });
    });
    const obj = { kind: 'titulo', e, ch, t: o2.t ?? 0, tOut: o2.tSai, d: o2.d ?? .55, s };
    SM.objs.push(obj); return obj;
  };
  // ---- quadro: câmera (com amostras de borrão), polígonos, linhas, pinos, rótulos, fotos, títulos
  SM.at = (c) => {
    const lt = c.lt, cm = SM.camEm(c, lt), cp = SM.camEm(c, lt - 1 / 30);
    const [px, py] = proj(cp, cm.x, cm.y), v = Math.hypot(px - 540, py - cm.cy) + Math.abs(cm.zoom - cp.zoom) * 900 + Math.abs(cm.rot - cp.rot) * 14;
    const nb = o.borrao === false || v < 5 ? 1 : Math.min(NB, 2 + Math.floor(v / 14));
    G.forEach((gr, k) => {
      if (k >= nb) { gr.g.style.display = 'none'; return; }
      gr.g.style.display = ''; gr.g.style.opacity = (1 / (k + 1)).toFixed(4);
      aplicaCam(gr, k === 0 ? cm : SM.camEm(c, lt - (o.obturador ?? 1.2) / 30 * k / (nb - 1)));
    });
    const sai = ob => ob.tOut === undefined ? 1 : 1 - clamp((lt - e2T(c, ob.tOut)) / .3);
    for (const ob of SM.objs) {
      const t = e2T(c, ob.t), q = lt - t;
      if (ob.kind === 'poli') {
        const u = clamp(q / .42), op = (q < 0 ? 0 : 1) * sai(ob), sc = ob.anima === 'pop' ? (u >= 1 ? 1 : lerp(.82, 1, E.back(u))) : 1;
        const fl = q >= 0 && q < .45 ? 1 + .9 * (1 - q / .45) : 1;            // acende mais claro e assenta
        const [cx, cy] = ob.ob.c;
        ob.ps.forEach((w, k) => { if (k >= nb) return; w.setAttribute('opacity', (op * clamp(u * 3)).toFixed(3));
          w.setAttribute('transform', sc === 1 ? '' : `translate(${cx} ${cy}) scale(${sc.toFixed(4)}) translate(${-cx} ${-cy})`);
          w.style.filter = fl > 1.01 ? `brightness(${fl.toFixed(2)})` : ''; });
      } else if (ob.kind === 'linha') {
        const u = E2C.suave(clamp(q / ob.d)), Lt = ob.cum[ob.cum.length - 1] * u, op = sai(ob);
        let d = 'M0,0';
        if (u > 0) { d = `M${ob.pts[0][0]},${ob.pts[0][1]}`; for (let i = 1; i < ob.pts.length; i++) {
          if (ob.cum[i] <= Lt) d += `L${ob.pts[i][0]},${ob.pts[i][1]}`;
          else { const f = (Lt - ob.cum[i - 1]) / (ob.cum[i] - ob.cum[i - 1]); d += `L${lerp(ob.pts[i - 1][0], ob.pts[i][0], f)},${lerp(ob.pts[i - 1][1], ob.pts[i][1], f)}`; break; } } }
        ob.ps.forEach(([h, l], k) => { if (k >= nb) return; h.setAttribute('d', d); l.setAttribute('d', d); h.style.opacity = l.style.opacity = u > 0 ? op : 0; });
      } else if (ob.kind === 'titulo') {
        const n = ob.ch.length, op = sai(ob);
        ob.ch.forEach((sp, i) => {
          const u = clamp((q - (i / n) * ob.d * .6) / (ob.d * .55)), k = E.out5(u), mid = i - (n - 1) / 2;
          sp.style.opacity = (u > 0 ? Math.min(1, u * 2.5) * op : 0).toFixed(3);
          sp.style.transform = `translateX(${((1 - k) * mid * ob.s * .35).toFixed(1)}px) scale(${lerp(1.25, 1, k).toFixed(3)})`;
          sp.style.filter = u < 1 && u > 0 ? `blur(${((1 - k) * 10).toFixed(1)}px)` : '';
        });
      } else {
        const p = proj(cm, ob.xy[0], ob.xy[1]), op = sai(ob);
        if (ob.kind === 'pino') {
          ob.e.style.opacity = q < 0 ? 0 : op; if (q < 0) continue;
          ob.e.style.transform = `translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px)`;
          const cai = clamp(q / .32), y = -(1 - cai * cai) * 160, b = q > .32 ? Math.sin((q - .32) * 24) * Math.exp(-(q - .32) * 9) * .22 : 0;
          ob.gota.style.transform = `translateY(${y.toFixed(1)}px) scale(${(1 + b).toFixed(3)},${(1 - b).toFixed(3)})`;
          const ow = clamp((q - .3) / .7); ob.onda.style.opacity = q > .3 ? ((1 - ow) * .9).toFixed(3) : 0; ob.onda.style.transform = `scale(${(.4 + 1.8 * ow).toFixed(3)})`;
        } else if (ob.kind === 'rotulo') {
          ob.ch.forEach((sp, i) => { sp.style.opacity = q >= ob.dig * i / ob.ch.length ? op : 0; });
          const W = ob.e.offsetWidth, H = ob.s;
          let X = p[0], Y = p[1];
          if (ob.centro) { X -= W / 2; Y -= H / 2; }
          else if (ob.lado === 'esq') { X -= W + 34; Y -= H * .95; } else if (ob.lado === 'cima') { X -= W / 2; Y -= H + 78; } else if (ob.lado === 'baixo') { X -= W / 2; Y += 22; } else { X += 30; Y -= H * .95; }
          ob.e.style.transform = `translate(${(X + (ob.dx ?? 0)).toFixed(1)}px,${(Y + (ob.dy ?? 0)).toFixed(1)}px)`;
        } else if (ob.kind === 'foto') {
          const q1 = clamp(q / .22), q2 = clamp((q - .14) / .4), fx = p[0] + ob.dx, fy = p[1] + ob.dy + aeWiggle(lt, .6, 6, ob.dx);
          ob.ln.setAttribute('x1', p[0]); ob.ln.setAttribute('y1', p[1]); ob.ln.setAttribute('x2', lerp(p[0], fx, E.out(q1))); ob.ln.setAttribute('y2', lerp(p[1], fy, E.out(q1)));
          ob.ln.setAttribute('opacity', q < 0 ? 0 : op);
          ob.card.style.opacity = q2 > 0 ? op : 0;
          ob.card.style.transform = `translate(${(fx - ob.w / 2).toFixed(1)}px,${(fy - ob.h).toFixed(1)}px) scale(${(q2 >= 1 ? 1 : Math.max(0, E.back(q2))).toFixed(3)})`;
        }
      }
    }
  };
  return SM;
}
// a cena do mapa: e2Cena com o satélite no fundo, 30 q/s (o voo precisa ser liso), sem poeira e sem a câmera de nulls (a câmera é a
// geográfica). e2Mapa(beats, {mapa: 'ne', cam0: {em, zoom} | (c, SM) => ..., voo: (c, SM) => [[t0, t1, {...}, curva]], deriva (.045 de
// zoom por s), giro (graus por s), borrao (true), obturador (1.2 quadro), grade (filtro CSS), continua (true = a câmera começa onde a
// cena de mapa anterior parou), tr, lead, cap, build(M, S, c, SM), update(S, c, SM)})
function e2Mapa(beats, o = {}) {
  e2Cena(beats, {
    fps: o.fps ?? 0, poeira: o.poeira ?? 0, tr: o.tr, lead: o.lead, cap: o.cap, limpo: o.limpo,
    rig: { mov: () => [] },
    build(M, S, c) {
      const ant = window._e2MapaFim;                  // continua: começa exatamente onde a cena de mapa anterior terminou (corte invisível)
      if (o.continua && ant) o.cam0 = ant;
      const SM = S.SM = satMapa(M, S, o.mapa, o);
      window._e2MapaFim = SM.camEm(c, c.dur);
      S.upd.unshift((S_, cc) => SM.at(cc));
      if (o.build) o.build(M, S, c, SM);
    },
    update(S, c) { if (o.update) o.update(S, c, S.SM); },
  });
}
