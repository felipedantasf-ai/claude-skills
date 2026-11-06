// ============================================================================
//  cenas_exemplo.js (edit-earn) = demo do teste_earn com o corte "Rei do Varejo" (Fernando Miranda, fernando8), B01–B28 (0–40 s)
//  Material: quadros de arquivo do Jornal da Band (Mansur), Commons (Mappin, Mesbla, Kensington, mesa CC0, família 1958 PD),
//  biblioteca do kit (cofre, marionete, dinheiro). 0 créditos. Motor v3 (receita do projeto After Effects): flash + onda no "banco",
//  Posterize 16 na TV e na parede, ea:wipe no "NOVE MESES DEPOIS", matte center na fechadura, íris vermelha no apresentador.
// ============================================================================
// placa com logo (cartão creme) para os objetos que sobem atrás do personagem
function placaLogo(nome, w, fundo = '#f3eee2') {
  const a = AS(nome), d = el(document.createElement('div'), 'div', `position:relative;width:${w}px;background:${fundo};padding:${(w * .07).toFixed(0)}px;border-radius:10px;` +
    `box-shadow:0 26px 50px rgba(0,0,0,.55);`);
  const im = el(d, 'img', 'display:block;width:100%;'); im.src = a.src;
  return d;
}

// S1 — "O que aconteceu com o rei do varejo?" — gancho com VÍDEO REAL do Mansur andando na rua (arquivo do Jornal da Band),
// câmera mergulhando, 808 no quadro 0 (a trilha põe sozinha) e punch-in com golpe no "rei"
mundo(['B01'], {
  fundo: 'clip:mansur_rua_v', fundoOp: { p: 1, folga: 1.12, fy: .45, from: .3 },
  cam: c => [[0, { y: 960, z: .95 }], [c.dur, { y: 920, z: 1.05 }, 'linear']],
  socos: c => [c.w('B01', 'rei') - .04],
  cor: 'frio', vig: .5, rampa: { zIn: .65, rIn: 7, tin: .55 },
});

// S2 — "Esse cara era dono da Mesbla, do Mappin, era dono até de um banco."
// Mansur (recorte do quadro da Band) ENTRA DA CÂMERA sobre o próprio fundo desfocado; etiqueta no "Esse cara"; Mesbla e Mappin
// sobem por trás nas palavras (começam 0,42 s antes, escondidos atrás do corpo, e saem por cima da cabeça NA palavra); no "banco" uma
// máscara de pincel troca a rua pelo cofre no escuro (o caixão da referência).
mundo(['B02', 'B03', 'B04'], {
  fundo: 'f_mansur_fundo', fundoOp: { fx: .45, fy: .40, p: .8, foco: [[0, 18], [.55, 10], [1.5, 8]] },
  camadas: [
    { fonte: null, el: (() => { const d = el(document.createElement('div'), 'div', 'position:relative;width:4600px;height:7000px;background:radial-gradient(ellipse 884px 988px at 50% 45.5%, #3a2a22, #0d0908 70%);');
        const v = el(d, 'img', 'position:absolute;left:1850px;top:2680px;width:900px;filter:drop-shadow(0 40px 60px rgba(0,0,0,.8)) brightness(.9);'); v.src = AS('b_vault').src; return d; })(),
      x: 540, y: 980, w: 4600, h: 7000, p: .9, atras: true, vida: false, borrao: false, troca: { t: c => c.w('B04', 'banco') - .06, d: .36, cx: 540, cy: 900 } },
    { fonte: null, el: placaLogo('lg_mappin', 440), x: 540, y: 330, w: 440, h: 230, p: .92, atras: true, rot: 3,
      entra: { k: 'baixo', t: c => c.w('B03', 'Mappin') - .42, dist: 900, d: .7, r0: 14 }, sai: { k: 'baixo', t: c => c.w('B04', 'banco') - .05, d: .4 } },
    { fonte: null, el: placaLogo('lg_mesbla', 420, '#ffffff'), x: 540, y: 330, w: 420, h: 300, p: .92, atras: true, rot: -4,
      entra: { k: 'baixo', t: c => c.w('B02', 'Mesbla') - .42, dist: 900, d: .7, r0: -14 }, sai: { k: 'cima', t: c => c.w('B03', 'Mappin') - .04, d: .3, dist: 1400 } },
    { fonte: 'f_mansur_obj', alinha: true, tam: .7, topo: 470, p: 1, entra: { k: 'camera', t: 0, s0: 2.6, dy: 620 },
      foco: [[0, 0], [.48, 0], [.6, 5], [.78, 0]], etiqueta: { txt: 'Ricardo Mansur', t: c => c.b('B02') + .25, dx: 0, dy: 300, s: 50 } },
  ],
  cam: c => [[0, { x: 540, y: 990, z: 1.22 }], [.6, { z: 1.05 }], [c.dur - .32, { z: 1.0 }, 'linear'], [c.dur, { z: .92, y: 1020 }, 'saida']],
  socos: c => [c.w('B02', 'Mesbla') - .02, c.w('B03', 'Mappin') - .02],
  flash: c => c.w('B04', 'banco') - .06, onda: c => c.w('B04', 'banco') - .06,
  cor: 'frio', vig: .45,
});

// S2 — "Controlava o fundo de pensão dos próprios funcionários" — mão de marionete desce e "segura" o dinheiro;
// atrás, a multidão da rua do Mappin em P&B desfocada. Entra empurrando de baixo.
mundo(['B05'], {
  tr: 'ea:sobe',
  fundo: 'f_mappin_rua', fundoOp: { p: .8, fx: .3, fy: .55, foco: [[0, 12], [1, 9]] },
  camadas: [
    { fonte: 'b_puppet', x: 540, y: 470, h: 1050, p: 1.05, entra: { k: 'cima', t: .05, dist: 1100 }, vida: 2.4 },
    { fonte: 'b_cash', x: 540, y: 1215, w: 560, p: 1.1, sombra: true, entra: { k: 'baixo', t: c => c.w('B05', 'fundo') - .12, dist: 1200, r0: 10 }, vida: 4.5 },
  ],
  cam: c => [[0, { y: 900, z: 1.22 }], [.6, { y: 930, z: 1.04 }], [c.dur, { y: 960, z: .97 }, 'linear']],
  cor: 'quente', luz: 'quente', vig: .6,
  socos: c => [c.w('B05', 'funcion') - .04],
});

// S3 — "e morava num palácio." — portão de Kensington Palace Gardens (a mansão era em Londres), câmera recuando, cor quente
mundo(['B06'], {
  fundo: 'f_kensington', fundoOp: { p: 1, fx: .53, fy: .5, folga: 1.1 },
  cam: c => [[0, { x: 540, y: 1000, z: 1.42 }], [.55, { z: 1.1 }], [c.dur, { z: 1.0 }, 'linear']],
  cor: 'quente', boom: true, vig: .5, leaks: c => [.15],
});

// S4 — "Chegou a ter 180 lojas e 28 mil funcionários." — digitado no escuro; a nota pequena dá o contexto certo (era a Mesbla nos anos 80)
digitado(['B07', 'B08'], [['180 LOJAS', c => c.w('B07', '180') - .06], ['28 MIL FUNCIONÁRIOS', c => c.w('B08', '28') - .06]], {
  s: 78, nota: 'Mesbla no auge, anos 1980 (antes do Mansur)',
});

// S5 — "Hoje tem até detetive atrás dele." — matéria REAL (Exame / Estadão Conteúdo, 08/01/2017) voando para as tábuas escuras;
// marca-texto na manchete e em "investigadores privados" no "detetive"
jornal(['B09'], {
  fundo: 'tabuas', veiculo: 'EXAME', linhaTopo: 'NEGÓCIOS · 8 DE JANEIRO DE 2017',
  titulo: 'Ricardo Mansur, ex-Mappin, está na mira de juiz nos EUA',
  linha: 'Investigadores americanos conseguiram as primeiras evidências de que o executivo brasileiro possui bens não declarados…',
  autor: 'Estadão Conteúdo',
  corpo: ['São Paulo - Dezoito anos após a falência das lojas Mappin e Mesbla, investigadores privados conseguem as primeiras evidências…',
    'O juiz deu ainda poderes para que o síndico da massa falida no exterior, o advogado Afonso Braga, investigue o empresário.'],
  foto: 'f_mansur_close_pb', moldura: 'vermelha', larguraFoto: 300, alturaFoto: 380, fotoPos: '50% 25%',
  marca: [[c => c.b('B09') + .22, 'Ricardo Mansur, ex-Mappin, está na mira de juiz nos EUA', 'amarelo'],
    [c => c.w('B09', 'detetive') - .05, 'investigadores privados', 'amarelo']],
  entra: 'voa', sai: c => c.dur - .42, drop: true,
  cam: c => [[0, { x: 540, y: 900, z: 1.32, r: -6 }], [.7, { y: 860, z: 1.12, r: -1 }], [c.dur, { y: 880, z: 1.06, r: 2 }, 'linear']],
});

// S6 — "E a história é sombria. Eu vou explicar." — sala de 1958 (foto real, domínio público) com o FERNANDO na TV;
// começa colada na TV, recua mostrando a família e no "explicar" mergulha de volta na TV
salaTV(['B10', 'B11'], {
  tela: [1147, 1280, 1387, 1486], conteudo: 'apresentador', cor: 'verde', fyApres: .34, zApres: 1.18,
  mergulho: c => c.w('B11', 'explicar') - .1, boom: true, posterize: 16,
});

// S7 — "Ricardo Mansur compra o Mappin nos anos 90," — o recorte dele (quadro da Band com a placa do Mappin) entra pela esquerda
// sobre o próprio fundo e respira em 3D; a placa do Mappin sobe por trás no "Mappin"; etiqueta no nome
mundo(['B12', 'B13'], {
  fundo: 'f_mansurmp_fundo', fundoOp: { fx: .74, fy: .42, p: .82, foco: [[0, 14], [.6, 8]] },
  camadas: [
    { fonte: null, el: placaLogo('lg_mappin', 460), x: 540, y: 330, w: 460, h: 230, p: .95, atras: true, rot: -4,
      entra: { k: 'baixo', t: c => c.w('B12', 'Mappin') - .12, dist: 1200, r0: -12 } },
    { fonte: 'f_mansurmp_obj', alinha: true, tam: .66, topo: 500, p: 1, entra: { k: 'esq', t: .02, dist: 1000, s0: 1.3, d: .5 }, foco: [[0, 0], [.5, 0], [.62, 4], [.8, 0]],
      etiqueta: { txt: 'Ricardo Mansur', t: c => c.b('B12') + .1, dx: 0, dy: 300, s: 50 } },
  ],
  cam: c => [[0, { x: 540, y: 960, z: 1.2 }], [.6, { z: 1.04 }], [c.dur, { z: 1.0 }, 'linear']],
  cor: 'frio', boom: true, socos: c => [c.w('B12', 'Mappin') - .02],
});

// S8 — "a loja mais tradicional de São Paulo." — o prédio do Mappin com o relógio; sobe empurrando, câmera recua do relógio
mundo(['B14'], {
  tr: 'ea:sobe',
  fundo: 'f_mappin_relogio', fundoOp: { p: 1, fx: .5, fy: .5, folga: 1.12 },
  cam: c => [[0, { x: 540, y: 1180, z: 1.45 }], [.6, { y: 1060, z: 1.12 }], [c.dur, { y: 1000, z: 1.02 }, 'linear']],
  cor: 'quente',
});

// S9 — "Nove meses depois," — digitado rápido
digitado(['B15'], [['NOVE MESES DEPOIS', c => c.b('B15') - .03]], { s: 76, ritmo: 34, tr: 'ea:wipe' });

// S10 — "compra a Mesbla por 600 milhões de reais. parceladinhos em 10 anos," — o verbete REAL da Wikipédia (Mesbla) voa para a mesa
// de madeira; marca-texto verde no valor e círculo vermelho à mão no "R$ 600.000.000,00"
const MESBLA_WIKI = {
  veiculo: 'WIKIPÉDIA', faixa: '#f6f3ec', corVeiculo: '#151515', fonteVeiculo: 'TimesInv', sVeiculo: 58, linhaTopo: 'PT.WIKIPEDIA.ORG/WIKI/MESBLA',
  titulo: 'Mesbla', sTitulo: 86, barra: false,
  corpo: ['Em 1997, com dívidas superiores a um bilhão de reais (R$ 1.000.000.000,00), a Mesbla pediu concordata.',
    '… o controle acionário da Mesbla foi adquirido pelo empresário Ricardo Mansur, que arrematou 51% das ações por 600 milhões de reais (R$ 600.000.000,00), a ser pagos em dez anos, além de assumir a dívida fiscal de 350 milhões de reais (R$ 350.000.000,00) da concordatária.'],
  foto: 'f_mesbla_pb', legenda: 'Prédio da Mesbla em Campinas', larguraFoto: 290, alturaFoto: 400, fotoPos: '50% 40%', sCorpo: 26,
};
jornal(['B16', 'B17'], {
  ...MESBLA_WIKI, fundo: 'mesa',
  marca: [[c => c.w('B16', '600') - .08, '600 milhões de reais', 'verde'], [c => c.w('B17', '10') - .08, 'a ser pagos em dez anos', 'verde']],
  circulo: [c => c.w('B16', '600') + .3, 'R$ 600.000.000,00'],
  entra: 'voa', boom: true,
});

// S11 — "assumindo ainda 350 milhões de dívida com fisco." — corte seco para perto da mesma página; punch-in no "350"
jornal(['B18'], {
  ...MESBLA_WIKI, fundo: 'mesa', entra: 'fixa', boom: false,
  marca: [[-1, '600 milhões de reais', 'verde'], [-1, 'a ser pagos em dez anos', 'verde'], [c => c.w('B18', '350') - .06, '350 milhões de reais', 'verde']],
  circulo: [-1, 'R$ 600.000.000,00'],
  soco: c => c.w('B18', '350') - .06, sai: c => c.dur - .4,
  cam: c => [[0, { x: 360, y: 1030, z: 2.0, r: -6 }], [.5, { x: 420, z: 1.78, r: -3 }], [c.w('B18', '350'), { x: 560, y: 1090, z: 1.7 }, 'suave'], [c.dur, { x: 640, y: 1120, z: 1.62, r: 1 }, 'linear']],
});

// S12 — "Ficou com as duas maiores redes do país, de uma única vez." — uma palavra por vez na planta azul (só as fortes)
palavras(['B19', 'B20'], { so: ['ficou', 'duas', 'maiores', 'redes', 'pais', 'unica', 'vez'] });

// S13 — "sem botar um real na mesa." — palavras empilhando no verde-escuro
pilha(['B21'], { s: 118 });

// S14 — "Quem que estava pagando essa conta toda? Seguinte." — o cofre na luz vermelha, visto pela FECHADURA
mundo(['B22', 'B23'], {
  fundoCor: '#140606',
  camadas: [
    { fonte: null, el: (() => { const d = el(document.createElement('div'), 'div', 'position:relative;width:1600px;height:2400px;background:radial-gradient(ellipse 50% 34% at 50% 30%, rgba(255,90,60,.95), rgba(170,25,18,.9) 42%, #4a0a08 72%, #2a0605);');
        el(d, 'div', 'position:absolute;left:0;right:0;top:1500px;bottom:0;background:linear-gradient(#5a0d0a,#1c0403);'); return d; })(),
      x: 540, y: 960, w: 1600, h: 2400, p: .85, vida: false, borrao: false },
    { fonte: 'b_vault', x: 540, y: 880, w: 560, p: 1.1, sombra: true, entra: { k: 'foco', t: 0 }, vida: 3, vida3d: 1.4 },
  ],
  tr: 'ea:matte:center',
  fechadura: { t: .08, k0: 6.5, k: 1.12, cy: 700 },
  cam: c => [[0, { y: 900, z: 1.15 }], [.6, { z: 1.0 }], [c.dur, { z: 1.08 }, 'linear']],
  cor: 'vermelho', drop: true, vig: .5,
});

// S15 — "O Mansur era dono de um banco, o Crefisul," — FERNANDO em tela cheia, limpo, entra pela íris vermelha; etiqueta com o nome
presEA(['B24'], {
  tr: 'gl:sdf-iris', trCor: '#ff3b30', trDur: .45,
  etiqueta: { txt: 'Fernando Miranda', t: .35, x: 540, y: 1420 },
  tPunch: c => c.w('B24', 'Crefisul') - .05,
});

// S16 — "que captava dinheiro dos clientes e emprestava para empresas." — as fotos P&B das lojas voam para a parede; flash no "empresas"
parede(['B25', 'B26'], ['f_mappin_rua_pb', 'f_mesbla_pb', 'f_relogio_pb', 'f_mansur_mappin_pb'], {
  ts: c => [.04, .12, .2, .28],
  flash: c => c.w('B26', 'empresas') - .02, pos: ['50% 40%', '50% 35%', '50% 55%', '70% 30%'], posterize: 16,
});

// S17 — "Quais empresas? As empresas do Mansur." — letras 3D no papel quadriculado, digitadas na fala
letras3D(['B27', 'B28'], [['QUAIS EMPRESAS?', c => c.b('B27'), EA.l3d[0], 90], ['AS EMPRESAS', c => c.b('B28'), EA.l3d[1], 124], ['DO MANSUR', c => c.w('B28', 'Mansur') - .2, EA.l3d[2], 116]]);
