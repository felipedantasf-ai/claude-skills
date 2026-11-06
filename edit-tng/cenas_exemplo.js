// ============================================================================
// cenas_exemplo.js — demo edit-tng (Lisa Su / AMD, 04/11/2026): projetos/teste_tng, B01–B42, 60,9 s, 69 planos
// Mostra: gancho com 5 fontes dela, montagem-relâmpago no 'Hoje', contador no trilhão, foto real no nome (drop),
// cartões vermelho/branco nas viradas, prints reais (comunicado 2014, gráfico da ação com pop, fatia de mercado no fim),
// salto na mesma fonte (MIT), lista com 1 plano por item, filtro/capForte onde o fundo clareava a legenda.
// ============================================================================
// ============ teste_tng — demo edit-tng (Lisa Su, B01–B42) ============
TNG.selo = 'TI';                      // Thaína Iansen
TNG.sujeito = 'lisa';
TNG.musica = [['break', 'B05:Hoje'], ['drop', 'B10:Lisa'], ['stop', 'B14:ha', .6], ['drop', 'B15'], ['hit', 'B21:despencaram'],
              ['roll', 'B33', 1.0], ['stop', 'B40:Mas', .7], ['drop', 'B41:empresa']];
TNG.troca = { 'B06:um': '1', 'B19:3': 'US$ 3.', 'B19:dol': '', 'B22:2': 'US$ 2.', 'B22:dol': '' };

// S1 — gancho: "Quando essa mulher aqui assumiu a AMD, a empresa valia 3 bilhões e tava quase falindo."
tng(['B01', 'B02', 'B03', 'B04'], [
  ['B01', 'clip:lisa_p01'],
  ['B01:mulher', 'clip:lisa_p02'],
  ['B02', 'clip:lisa_m16', { capForte: true, filtro: 'brightness(.82)' }],                             // Computex 2016: o começo dela
  ['B02:AMD', 'clip:amd_p03'],
  ['B03', 'clip:lisa_p04'],
  ['B03:3', 'clip:br_p05', { filtro: 'brightness(.65)' }],
  ['B04', 'vermelho'],
]);
// S2 — "Hoje ela cruzou a marca de um trilhão de valor." (break: salto de tempo em montagem-relâmpago; contador no trilhão)
tng(['B05', 'B06'], [
  ['B05', ['foto:mont_p07_01', 'foto:mont_p07_02', 'foto:mont_p07_03', 'foto:mont_p07_04', 'foto:mont_p07_05', 'foto:mont_p07_06',
           'foto:mont_p07_07', 'foto:mont_p07_08', 'foto:mont_p07_09', 'foto:mont_p07_10']],
  ['B05:cruzou', 'clip:lisa_p08'],
  ['B06', 'contador', { antes: 'de', de: .1, ate: 1, casas: 1, casasFim: 0, depois: 'trilhão de valor.', depoisEm: 'B06:trilh', dur: .8 }],
]);
// S3 — "E o mais impressionante é que ela nem trabalha na OpenAI."
tng(['B07', 'B08', 'B09'], [
  ['B07', 'clip:lisa_p10'],
  ['B07:impressionante', 'clip:lisa_m19b'],             // Computex 2019
  ['B08', 'clip:lisa_p11'],
  ['B09', 'clip:altman_p12'],
]);
// S4 — DROP no nome: "Lisa Su comanda a AMD, uma empresa que produz chips."
tng(['B10', 'B11'], [
  ['B10', 'foto:lisa_foto_sxsw', { desliza: 110, foco: [.45, .3], alvo: [540, 600], capForte: true }],   // foto posada real (SXSW 2024, CC BY 4.0) no nome: deslize + obturador
  ['B10:comanda', 'clip:lisa_p14', { capForte: true }],
  ['B11', 'clip:amd_p15'],
  ['B11:que', 'clip:lisa_p16'],
]);
// S5 — "Peças que funcionam como cérebro dentro das maiores tecnologias do mundo."
tng(['B12', 'B13'], [
  ['B12', 'clip:br_p17', { filtro: 'brightness(.65)' }],
  ['B12:funcionam', 'clip:br_p18'],
  ['B13', 'clip:br_p19'],
  ['B13:maiores', 'clip:br_p20'],
  ['B13:do', 'clip:br_p21', { leg: false }],             // a imagem já mostra o nome (FRONTIER): sem legenda, como na REF
]);
// S6 — virada de tempo: "Só que há 10 anos essa empresa tava praticamente falida."
tng(['B14', 'B15'], [
  ['B14', 'vermelho'],
  ['B14:ha', 'branco'],
  ['B15', 'clip:amd_p24'],
  ['B15:tava', 'clip:br_p25', { filtro: 'brightness(.63)' }],
]);
// S7 — "Para você ter uma ideia, quando ela assumiu em 2014, as ações já valiam cerca de 3 dólares."
tng(['B16', 'B17', 'B18', 'B19'], [
  ['B16', 'clip:lisa_p26'],
  ['B16:ter', 'clip:lisa_m20'],                         // CES 2020 (4K)
  ['B17', 'clip:lisa_p27'],
  ['B17:em', 'print:print_ceo2014', { larg: 940, cy: 960 }],
  ['B18', 'print:print_acao2015', { leg: true, larg: 700, cy: 1150, pop: 'B19:3', popFoco: [.7, .82] }],
]);
// S8 — "E nos meses seguintes, elas despencaram para menos de 2 dólares."
tng(['B20', 'B21', 'B22'], [
  ['B20', 'clip:lisa_p31', { capForte: true }],
  ['B20:seguintes', 'clip:lisa_m21', { capForte: true }],                   // CES 2021
  ['B21', 'clip:br_p32'],
  ['B22', 'clip:br_p33'],
]);
// S9 — "A situação era tão crítica que os donos precisaram vender a sede e ainda pagavam aluguel para continuar trabalhando no mesmo lugar."
tng(['B23', 'B24', 'B25', 'B26', 'B27'], [
  ['B23', 'clip:lisa_p34'],
  ['B23:tao', 'clip:br_p35'],
  ['B24', 'clip:lisa_p36'],
  ['B24:precisaram', 'clip:lisa_m19a'],                 // CES 2019
  ['B25', 'clip:amd_p37', { filtro: 'brightness(.68)' }],
  ['B26', 'clip:br_p38'],
  ['B26:aluguel', 'clip:br_p39', { filtro: 'brightness(.75)' }],
  ['B27', 'clip:lisa_m23'],                             // 2023
  ['B27:trabalhando', 'clip:lisa_p40'],                 // ela trabalhando no servidor
  ['B27:no', 'vermelho'],
]);
// S10 — "Isso tinha relação justamente com a forma com que o negócio vinha sendo conduzido."
tng(['B28', 'B29', 'B30'], [
  ['B28', 'clip:lisa_p42'],
  ['B28:rela', 'clip:lisa_p42', { from: 1.4 }],          // salto na mesma fonte (MIT): 0,73 s depois, mesmo enquadramento
  ['B29', 'clip:lisa_p43', { capForte: true }],
  ['B30', 'clip:lisa_p44'],
  ['B30:conduzido', 'clip:br_p45'],
]);
// S11 — "Até aquele momento, a empresa só tentava sobreviver."
tng(['B31', 'B32'], [
  ['B31', 'clip:lisa_p46', { capForte: true }],
  ['B31:momento', 'clip:lisa_m19c', { capForte: true }],                    // Hot Chips 2019
  ['B32', 'clip:lisa_p47'],
  ['B32:tentava', 'clip:lisa_m22'],                     // CES 2022
  ['B32:sobreviver', 'clip:br_p48'],
]);
// S12 — lista: "Demitia funcionários, fechava divisões inteiras e lançava peças baratas só pra conseguir pagar as contas do mês."
tng(['B33', 'B34', 'B35', 'B36'], [
  ['B33', 'clip:br_p49'],
  ['B34', 'clip:br_p50'],
  ['B35', 'clip:br_p51'],
  ['B36', 'clip:br_p52', { filtro: 'brightness(.68)' }],
  ['B36:as', 'vermelho'],
]);
// S13 — "Basicamente, a estratégia só funcionava para não quebrar de vez."
tng(['B37', 'B38', 'B39'], [
  ['B37', 'clip:lisa_p54'],
  ['B37:a', 'clip:lisa_m24'],                           // Advancing AI 2024 (4K)
  ['B38', 'clip:lisa_p55'],
  ['B39', 'clip:br_p56', { filtro: 'brightness(.6)' }],
]);
// S14 — fecho: "Mas o maior problema é que a empresa continuava irrelevante e perdendo espaço no mercado." (stop -> drop; print até o fade)
tng(['B40', 'B41', 'B42'], [
  ['B40', 'clip:lisa_p57'],
  ['B41', 'clip:lisa_p58'],
  ['B41:continuava', 'clip:br_p59'],
  ['B42', 'print:print_mercado', { leg: true, larg: 960, cy: 1180 }],
]);
