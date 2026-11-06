// ============================================================================
//  edit-investigativa — cenas do MOTOR FOCO (03/11/2026): a versão B do A/B (projetos/teste_foco_inv, trecho S11–S14 do BukeleHaiti
//  em edit-investigativa, 50,31–73,09 s do corte do audio1103_inv). É o modelo de toda cena nova. Os assets (i_*, d_aljazeera, as marcas
//  do pagina.py) e os beats (B24–B34) são daquele projeto: copie a estrutura, não os nomes.
// ============================================================================
// ============================================================================
//  teste_foco_inv — versão B ("motor foco", 03/11/2026). O MESMO trecho (S11–S14 do audio1103_inv, BukeleHaiti em edit-investigativa,
//  50,31–73,09 s do corte), o MESMO material, o MESMO áudio e os MESMOS cortes da A, reescritos para o olho acompanhar.
//  Motor foco aprovado na vox-edit2 ("B aprovado, aplica") e adaptado ao dossiê:
//   1. um assunto por vez, grande e no centro (um pouco acima do meio; a legenda de 1 palavra embaixo, y 1371)
//   2. um texto por vez: a tipografia vira frase FIXA (fora da câmera: não anda nem borra), uma por vez, pousando no mesmo lugar;
//      a legenda some enquanto há frase e mostra a palavra-chave em vermelho
//   3. a câmera chega já no assunto e só aproxima; no máximo um movimento por frase; panorâmica só para trocar de item no mural
//      (abrindo no meio da viagem) e na saída em chicote do corte; sem tranco
//   4. o assunto seguinte pousa no lugar; no mural o item pousa e DEPOIS o fio desenha, com a câmera parada; o resto da parede escurece
//   5. no documento, um trecho marcado por vez, no centro; de um ao outro, salto em foco (rack) em vez de arrastar a página
// ============================================================================
const ivX = (m) => (m[0] + m[2]) / 2, ivY = (m) => (m[1] + m[3]) / 2;

// mural do vídeo (2ª visita neste trecho): pneus, Chérizier e Innocent já estavam na parede. A missão (MSS) pousa no corte (quadro 0
// nunca vazio) e o fio do Innocent até ela desenha no "missão"
const M = mural()
  .foto('pneu', 'i_haiti_pneu_fogo_icg', 1500, 820, { w: 600, rot: -2, dz: 0 })
  .foto('cher', 'i_cherizier_voa_2023', 2150, 760, { w: 520, rot: 2.5, dz: -30 })
  .foto('inno', 'i_innocent_fbi', 1980, 1330, { w: 500, rot: -3, dz: 20 })
  .foto('mss', 'i_haiti_mss_icg', 1260, 1420, { w: 560, rot: 2, dz: -20, desde: 'B24' })
  .foto('onu', 'i_onu_conselho_2024', 1540, 1960, { w: 540, rot: -1.5, dz: 30, desde: ['B24', 'onu'] })
  .foto('uh1', 'i_sv_uh1_2015', 2300, 1900, { w: 560, rot: 1.5, dz: 0, desde: ['B27', 'forca'] })
  .fio('pneu', 'cher')
  .fio('cher', 'inno')
  .fio('inno', 'mss', { desde: ['B24', 'missao'] })
  .fio('mss', 'onu', { desde: ['B24', 'onu'] })
  .fio('onu', 'uh1', { desde: ['B27', 'forca'] });

// S11 — MURAL 2: "Uma missão internacional apoiada pela ONU tentou | ajudar enviando um pequeno | efetivo ao país,"
// a câmera chega na força multinacional (MSS, ICG) já pousando; no "missão" o fio vem do Innocent até ela; salto em foco até o Conselho de
// Segurança, que pousa no "ONU" no centro (t null = no pouso), e o fio desenha depois, com a câmera parada; no "enviando" ela abre nos dois
muralCena(['B24', 'B25', 'B26'], M, {
  focos: c => [[0, 'mss'], [null, { id: 'onu', salto: true }], [c.w('B25', 'enviando'), ['mss', 'onu'], .9]],
  cap: { modo: 'palavra', chave: ['missao', 'onu', 'pequeno'] },
});

// S12 — "incluindo quatro técnicos da Força Aérea | de El Salvador que estavam lá apenas para fazer evacuações | médicas e salvar vidas."
// a frase "incluindo 4 técnicos" (4 vermelho enorme) já está no quadro 0, parada, e o mundo escuro aproxima atrás no "quatro"; no "da" o
// helicóptero da FAES pousa no mesmo lugar e a legenda volta (EVACUAÇÕES em vermelho); zoom no "Salvador"; no "médicas" a foto escurece
// e "médicas e salvar vidas." é o assunto
scene({
  beats: ['B27', 'B28', 'B29'], tr: 'cut', bg: 'dark',
  camMove: camF(c => [[0, { x: 540, y: 880, z: 1.0 }], [c.w('B27', 'quatro'), { x: 540, y: 880, z: 1.08 }],
    [c.w('B28', 'salvador'), { x: 480, y: 870, z: 1.2 }], [c.w('B28', 'evacuacoes'), { x: 500, y: 880, z: 1.1 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [760, 600], mundo: .14 });
    S.cap = { modo: 'palavra', chave: ['evacuacoes'] };
    ivAssuntos(r, S, c, [['i_sv_uh1_2015', c.w('B27', 'da') - .1, { rot: 1.5 }]], { x: 540, y: 880, w: 880 });
    ivFrases(r, S, c, [
      { linhas: [[['incluindo', 's', { s: 100 }]], [['4', 'V', { s: 300 }], ['técnicos', 's', { s: 130 }]]], entre: 270,
        ts: [[-.3], [c.w('B27', 'quatro') - .03, c.w('B27', 'tecnicos') - .03]], t1: c.w('B27', 'da') - .1 },
      { b: 'B29', spec: 'Ax2 sx2@130', veu: .78 },
    ]);
  },
});

// S13 — "Só que, no dia 18 de outubro, | as gangues haitianas cometeram o maior erro | da vida delas." tipografia no escuro, UMA frase
// por vez no centro, palavra por palavra na fala: "Só que no dia / 18 de outubro" (letras fora de ordem) → "as gangues haitianas /
// cometeram" → "o maior ERRO / da vida delas." (tracejado vermelho desenha sob o "erro" com tudo parado). A letra não anda: quem
// anda é a fumaça escura do mundo, que aproxima uma vez por frase (no "18", no "cometeram", no "erro")
scene({
  beats: ['B30', 'B31', 'B32'], tr: 'cut', bg: 'dark',
  camMove: camF(c => [[0, { x: 540, y: 880, z: 1.0 }], [c.w('B30', '18'), { x: 540, y: 880, z: 1.1 }],
    [c.w('B31', 'cometeram'), { x: 540, y: 880, z: 1.02 }], [c.w('B31', 'erro'), { x: 540, y: 880, z: 1.16 }]]),
  build(r, S, c) {
    palco(r, S, { brilho: [540, 760], mundo: .14 });
    ivFrases(r, S, c, [
      { b: 'B30', spec: 's@96 s@96 s@96 s@96|Vx3*@170', entre: 175 },
      { b: 'B31', spec: 'A A A|s@150', entre: 150 },
      { b: ['B31', 'B32'], de: 4, spec: 'Ax2@64 V@230|Ax3', entre: 120, traco: { linha: 0, parte: 1, t: c.w('B31', 'erro') + .2 } },
    ]);
  },
});

// S14 — "Emboscaram um veículo blindado e sequestraram | os quatro militares de El Salvador." a matéria REAL da Al Jazeera (19/10/2026):
// a câmera chega no trecho "managed to flee the burning vehicle in Croix-des-Bouquets" e fica; o marca-texto passa no "blindado" com
// a página parada; no "os", salto em foco até "ambush of four aviation technicians", marcado no "quatro"
docCena(['B33', 'B34'], 'd_aljazeera', {
  rack: c => -.2,
  focos: c => [[0, 'managed to flee the burning vehicle in Croix-des-Bouquets'],
    [c.w('B34', 'os') - .1, { trecho: 'ambush of four aviation technicians', salto: true }]],
  marcas: c => [[...ivMarca('d_aljazeera', 'managed to flee the burning vehicle in Croix-des-Bouquets'), c.w('B33', 'blindado') - .1],
    [...ivMarca('d_aljazeera', 'ambush of four aviation technicians'), c.w('B34', 'quatro') - .1]],
  cap: { modo: 'palavra', doc: true, chave: ['blindado', 'quatro'] },
});
