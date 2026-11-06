// ============================================================================
//  edit-earn — cenas de exemplo do MOTOR FOCO (03/11/2026): o modelo de toda cena nova. São as 8 cenas B do A/B do projetos/teste_foco_earn
//  (= work/ab_foco_B.js), sobre o trecho B12–B23 do corte "Rei do Varejo" do teste_earn. Copie a estrutura; troque material e tempos.
//  Regras e opções: SKILL.md, seção "O motor foco"; código: componentes.js (eaFoco, eaFocoIni, eaNumero, opção foco dos componentes).
// ============================================================================
// ============================================================================
//  teste_foco_earn — versão B ("motor foco", 03/11/2026). O MESMO trecho do teste_earn (15,56–32,86 s, B12–B23), o MESMO material,
//  o MESMO áudio e as MESMAS cenas/cortes da ab_foco_A.js, reescritos com o motor foco (A/B aprovado na vox-edit2: "B aprovado,
//  aplica"). Pedido do Felipe (03/11): "a velocidade parece atrapalhar o acompanhamento... muitos efeitos se perdem na tela e não são
//  focalizados". O que muda em cada cena (regras no componentes.js, seção "motor foco"):
//   - um assunto por vez no centro; a câmera CHEGA já nele (quadro 0 nunca vazio) e faz no máximo UM movimento por frase, de zoom
//     sempre que dá (panorâmica só para trocar de assunto); sem tranco; deriva lenta; saída em zoom curto no corte
//   - texto parado enquanto se lê: etiqueta, digitado, palavra da planta e pilha ficam FORA do mundo; no jornal o resto da página
//     apaga e só o trecho falado fica em tinta, com a câmera parada nele
//   - nada entra pela borda: o Mansur entra da câmera (zoom centrado, como na referência), a placa sobe atrás da cabeça, a página já
//     está na mesa; efeitos um de cada vez (placa → zoom; marca → círculo → marca; punch-in depois da marca)
//   - ambiente mais baixo: poeira ×.4, wiggle ×.25, vida3d ×.5, cintilação ×.4
//  Para ativar: copie este arquivo para work/fe_b.js e rode pipeline.py fechar.
// ============================================================================
function placaLogo(nome, w, fundo = '#f3eee2') {
  const a = AS(nome), d = el(document.createElement('div'), 'div', `position:relative;width:${w}px;background:${fundo};padding:${(w * .07).toFixed(0)}px;border-radius:10px;` +
    `box-shadow:0 26px 50px rgba(0,0,0,.55);`);
  const im = el(d, 'img', 'display:block;width:100%;'); im.src = a.src;
  return d;
}

// S7 — "Ricardo Mansur compra o Mappin nos anos 90," — o Mansur ENTRA DA CÂMERA (de 2× para 1 em .5 s, centrado; o quadro 0 já o
// mostra) sobre o próprio fundo, bem desfocado e a meia luz (não disputa o olho); a etiqueta FIXA embaixo depois que ele assenta;
// a placa do Mappin sobe por trás da cabeça NA palavra e a câmera faz o único movimento da frase: recua um pouco e sobe (zoom) para
// a placa e o rosto ficarem no meio. Sem chicote de saída: a S8 entra empurrando (ea:sobe)
mundo(['B12', 'B13'], {
  fundo: 'f_mansurmp_fundo', fundoOp: { fx: .74, fy: .42, p: .82, foco: [[0, 24], [.6, 16]] },
  camadas: [
    { fonte: null, el: placaLogo('lg_mappin', 460), x: 540, y: 375, w: 460, h: 230, p: .95, atras: true, rot: -4,
      entra: { k: 'baixo', t: c => c.w('B12', 'Mappin') - .42, dist: 900, d: .7, r0: -12 } },
    { fonte: 'f_mansurmp_obj', alinha: true, tam: .66, topo: 500, p: 1, entra: { k: 'camera', t: -.12, s0: 2.0, dy: 440, d: .5 },
      etiqueta: { txt: 'Ricardo Mansur', t: .6, y: 1250, s: 52 } },
  ],
  foco: { focos: c => [[0, 540, 960, 1.08], [c.w('B12', 'Mappin'), 540, 860, .98, .9]], sai: false },
  cor: 'frio', boom: true,
  build(r, S) { S.fundo.op.base = 'brightness(.8) saturate(.85)'; },
});

// S8 — "a loja mais tradicional de São Paulo." — o prédio do Mappin sobe empurrando (ea:sobe); a câmera chega no relógio e, no
// "tradicional", recua (zoom) abrindo o prédio
mundo(['B14'], {
  tr: 'ea:sobe',
  fundo: 'f_mappin_relogio', fundoOp: { p: 1, fx: .5, fy: .5, folga: 1.12 },
  foco: c => [[0, 540, 1180, 1.42], [c.w('B14', 'tradicional'), 540, 1130, 1.2, .9]],
  cor: 'quente',
});

// S9 — "Nove meses depois," — digitado PARADO no centro (fora do mundo); só a película do fundo anda. O wipe ficou curto (.35 s):
// menos tempo com dois assuntos na tela
digitado(['B15'], [['NOVE MESES DEPOIS', c => c.b('B15') - .03]], { s: 76, ritmo: 34, tr: 'ea:wipe', trDur: .35, foco: true });

// S10 — "compra a Mesbla por 600 milhões de reais. parceladinhos em 10 anos," — o verbete REAL da Wikipédia (Mesbla) já está na
// mesa (pousa no lugar); a câmera chega no título "Mesbla" e, no "por", faz o único movimento: aproxima (z 1,2 → 1,9) no trecho do
// valor, onde FICA; o resto da página apaga. Um efeito de cada vez: marca no "600 milhões de reais" → círculo no "R$ 600.000.000,00"
// → marca no "a ser pagos em dez anos" no "parceladinhos". Sem chicote de saída: a S11 continua no mesmo enquadramento (corte casado)
const MESBLA_WIKI = {
  veiculo: 'WIKIPÉDIA', faixa: '#f6f3ec', corVeiculo: '#151515', fonteVeiculo: 'TimesInv', sVeiculo: 58, linhaTopo: 'PT.WIKIPEDIA.ORG/WIKI/MESBLA',
  titulo: 'Mesbla', sTitulo: 86, barra: false,
  corpo: ['Em 1997, com dívidas superiores a um bilhão de reais (R$ 1.000.000.000,00), a Mesbla pediu concordata.',
    '… o controle acionário da Mesbla foi adquirido pelo empresário Ricardo Mansur, que arrematou 51% das ações por 600 milhões de reais (R$ 600.000.000,00), a ser pagos em dez anos, além de assumir a dívida fiscal de 350 milhões de reais (R$ 350.000.000,00) da concordatária.'],
  foto: 'f_mesbla_pb', legenda: 'Prédio da Mesbla em Campinas', larguraFoto: 290, alturaFoto: 400, fotoPos: '50% 40%', sCorpo: 26,
};
const TRECHO_MESBLA = { x: 382, y: 1118, z: 1.9 };     // centro das 4 linhas do 600 ao 350 (medido na página: y 1051–1186, coluna x 136–628)
jornal(['B16', 'B17'], {
  ...MESBLA_WIKI, fundo: 'mesa',
  marca: [[c => c.w('B16', '600') + .37, '600 milhões de reais', 'verde'], [c => c.w('B17', 'parceladinhos') + .2, 'a ser pagos em dez anos', 'verde']],
  circulo: [c => c.w('B16', 'reais') + .1, 'R$ 600.000.000,00'],
  entra: 'pousa', boom: true,
  foco: { focos: c => [[0, { alvo: 'titulo', dx: 64, dy: 60, z: 1.3 }], [c.w('B16', 'por'), TRECHO_MESBLA, .8]], sai: false },   // título no meio, a foto fora do quadro
});

// S11 — "assumindo ainda 350 milhões de dívida com fisco." — a MESMA página, o MESMO enquadramento (corte casado, sem borrão de
// corte): a marca no "350 milhões de reais" e, depois dela, o punch-in seco no "dívida" (zoom de ênfase, sem tranco). A página não cai
// mais da tela (o olho ia atrás dela até a borda): sai no chicote curto de zoom, com o texto apagando
jornal(['B18'], {
  ...MESBLA_WIKI, fundo: 'mesa', entra: 'fixa', boom: false,
  marca: [[-1, '600 milhões de reais', 'verde'], [-1, 'a ser pagos em dez anos', 'verde'], [c => c.w('B18', '350') + .05, '350 milhões de reais', 'verde']],
  circulo: [-1, 'R$ 600.000.000,00'],
  soco: c => c.w('B18', 'divida') - .04,
  foco: { focos: [[0, TRECHO_MESBLA]] },
});

// S12 — "Ficou com as duas maiores redes do país, de uma única vez." — uma palavra por vez, PARADA no centro (fora do mundo), pousando;
// a planta azul gira e abre por baixo
palavras(['B19', 'B20'], { so: ['ficou', 'duas', 'maiores', 'redes', 'pais', 'unica', 'vez'], foco: true });

// S13 — "sem botar um real na mesa." — a palavra nova pousa parada no centro; as anteriores descem e apagam (a pilha vira textura);
// a parede gira por baixo
pilha(['B21'], { s: 118, foco: true });

// S14 — "Quem que estava pagando essa conta toda? Seguinte." — o cofre na luz vermelha, visto pela FECHADURA (o efeito da cena,
// sozinho e no centro); no "conta", zoom de ênfase no cofre
mundo(['B22', 'B23'], {
  fundoCor: '#140606',
  camadas: [
    { fonte: null, el: (() => { const d = el(document.createElement('div'), 'div', 'position:relative;width:1600px;height:2400px;background:radial-gradient(ellipse 50% 34% at 50% 30%, rgba(255,90,60,.95), rgba(170,25,18,.9) 42%, #4a0a08 72%, #2a0605);');
        el(d, 'div', 'position:absolute;left:0;right:0;top:1500px;bottom:0;background:linear-gradient(#5a0d0a,#1c0403);'); return d; })(),
      x: 540, y: 960, w: 1600, h: 2400, p: .85, vida: false, borrao: false },
    { fonte: 'b_vault', x: 540, y: 880, w: 560, p: 1.1, sombra: true, entra: { k: 'foco', t: -.1 }, vida: 3, vida3d: 1.4 },
  ],
  tr: 'ea:matte:center',
  fechadura: { t: .08, k0: 6.5, k: 1.12, cy: 700 },
  foco: c => [[0, 540, 1000, 1.04], [c.w('B22', 'conta'), 540, 1000, 1.16, .8]],
  cor: 'vermelho', drop: true, vig: .5,
});
