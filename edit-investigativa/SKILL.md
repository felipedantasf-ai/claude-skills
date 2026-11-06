---
name: edit-investigativa
description: Formato "edit investigativa" (dossiê) para vídeos verticais 9:16 de denúncia, caso, escândalo, dinheiro público e impostos, feitos com o Kit_Edicao_Vox_v2. Replica o vídeo do TikTok @samuelszuchan (out/2026, caso Viya). Tudo P&B com retícula fina e um acento VERMELHO; só o apresentador tem cor (tom frio, luz vermelha lateral, punch-out na entrada). Cenários — tipografia no escuro (serifa condensada vermelha/branca, tracejados, câmera viajando), mural de provas (fotos com percevejo, fio vermelho, câmera 3D com foco), prints REAIS de matérias com marca-texto vermelho no número dito, pessoas recortadas com tarja nos olhos até o nome, TV de tubo, mapa escuro com a região em vermelho. Legenda de UMA palavra em serifa; cama grave + baque sub-grave em cada corte. Motor foco (03/11/2026) — um assunto por vez, grande e no centro; um texto por vez, fixo na tela (a tipografia não anda nem borra); a câmera aproxima e só troca de lugar em salto de foco; cada efeito sozinho no centro. Use quando o Felipe pedir "edit investigativa", "formato investigativo", "dossiê", "mural com fio vermelho", "igual ao vídeo da streamer chinesa", ou mandar esse vídeo como modelo — com gravação real ou áudio + HeyGen.
---

# Formato edit-investigativa (dossiê escuro P&B + vermelho)

Modelo extraído quadro a quadro e no áudio do vídeo que o Felipe mandou em 28/10/2026
(`C:\Users\USER\Downloads\samuelszuchan_7686765046055161101.mp4`, 2:36, em inglês, 720×1280). O caso é o da Viya (Huang Wei),
a maior live streamer da China, multada por sonegação.

**Antes de planejar, abra as duas imagens desta pasta:**
- `referencia_formato.jpg`: 18 quadros da referência, rotulados por cenário.
- `exemplo_teste.jpg`: o que estes componentes produzem. É o teste com o corte "Nordeste obras fantasmas" (`projetos/teste_investigativa`, demo de 66 s).

Esta skill complementa o kit. O corte, os beats, o render, a mix e a entrega seguem `H:\Edição Claude\Kit_Edicao_Vox_v2\CLAUDE.md`.
As regras fixas do Felipe estão na memória:
- a fala nunca muda;
- todo dado tem checagem com fonte;
- IA nunca faz rosto de pessoa real;
- o CTA usa o perfil REAL de quem fala;
- toda entrega é uma versão nova `_vN`, sem sobrescrever;
- entrega = tiktok ≤ 29 MB + MASTER;
- **vídeo REAL roda sempre normal** (03/11/2026: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal"): 30 q/s do
  começo ao fim do tempo na tela, nunca preso no último quadro, nunca em câmera lenta por quadro repetido, nunca em stop-motion. Vale
  para a TV de tubo e para qualquer `clipe()`. Clipe curto = trocar o assunto antes de ele acabar, começar a cena com ele já rodando ou
  pegar outro trecho. Régua: `<kit>\ferramentas\clipe_parado.py <proj>` (0 TRAVADO, 0 LENTO).

Rode tudo com o Python do kit (`<kit>\.venv\Scripts\python.exe`). Em outro PC, a variável de ambiente `VOX_KIT` aponta para a pasta
do kit (o `INSTALAR_edit-investigativa.bat` do pacote da equipe configura); sem ela, vale `H:\Edição Claude\Kit_Edicao_Vox_v2`.
Onde este texto diz `H:\Edição Claude\Kit_Edicao_Vox_v2`, leia a pasta do kit da máquina.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca do formato (vira `work/<prefixo>_a.js`). Tem a legenda de 1 palavra, `presInv`, `palco`/`linha`/`linhaFala`/`tracejado`/`contador`/`tarja`/`impressa`, `recorte`/`nomeado`, `mural`/`muralCena`, `docCena`/`ivMarca`, `siteCena`, `tvCena`/`clipe`, `mapaCena`, `fotoCena`, `fimPerfilInv`, as câmeras `camOlha`/`camC`, o motor golpe (`camG`, `ivGolpes`, opção `golpes`) e o **motor foco** (`camF`, `ivFocos`, opção `focos` das cenas prontas, `ivFrases`, `ivNumero`, `ivAssuntos`, `palco({mundo})`, legenda com `chave`) |
| `cenas_foco_exemplo.js` | **as 4 cenas da versão B do A/B "motor foco" (03/11/2026): o modelo de toda cena nova** (mural com foco num item e salto, tipografia em frase fixa, foto pousando no lugar, documento com salto entre trechos marcados) |
| `cenas_exemplo.js` | as 16 cenas do teste de 28/10 (0–66 s), uma de cada cenário, comentadas. Serve para ver cada cenário; a câmera e a tipografia de cena nova seguem o `cenas_foco_exemplo.js` |
| `legenda.css` | fontes (TimesInv = Times New Roman do Windows; Inter 400–700), legenda sem caixa, grão e vinheta por cena, sem barra de progresso |
| `preparar_investigativa.py` | prepara um projeto: fontes, CSS, componentes, parede `t_parede`, TV `g_tv60`, perfis, `clipn.js`/`olhos.js`/`marcas.js`, `etapas.json` |
| `provas.py` | fotos em P&B com retícula fina: `foto` (tela cheia), `imp` (impressa do mural), `pessoa` (recorte + olhos para a tarja), `multidao` (tarja em todo rosto), `doc`, `site` (borda rasgada) |
| `pagina.py` | DOCUMENTO real: print da matéria pela URL (Chromium do kit) ou reconstrução com o texto real. Guarda onde está cada trecho a marcar de vermelho (`render/marcas.js`) |
| `trilha_inv.py` | cama grave sintetizada (~117 BPM, dó menor, sem drops) + baque sub-grave em cada corte + mix final −14 LUFS |
| `montar.py` / `previas.py` / `ritmo.py` | montar: junta `work/<prefixo>_[a-z].js` e confere sintaxe, palavras, beats, apresentador e ritmo previsto. previas: folhas por cena. ritmo: cortes/min no vídeo pronto |
| `diagnostico_mundo.js` | só para MEDIR a câmera na tipografia no escuro (motor foco, "Medir neste formato"): vira `work/<prefixo>_z.js` por um render e sai |
| `modelo/g_tv60.png` | TV antiga recortada (a tela do PNG é opaca: a imagem vai por cima) |

**O que já rodou** (teste de 28/10/2026):
- **no render da demo:** `presInv`, `palco`/`linha`/`tracejado`/`contador`/`impressa`, `recorte` com tarja, `muralCena`, `docCena` com print real,
  `tvCena` com print, `mapaCena`, `fotoCena`, `trilha_inv.py`;
- **só em prévia:** `siteCena`, `nomeado`, `pagina.py --texto`, `fimPerfilInv` (`work/teste_extra/iv_c_componentes.js`);
- **ainda não testados:** `provas.py` modo `multidao` (o `tvCena` com clipe já rodou no BukeleHaiti, `projetos/audio1103_inv`).

**Motor foco** (teste de 03/11/2026, `projetos/teste_foco_inv`):
- **no render do A/B:** `muralCena` com `focos` (item, grupo e `salto`), `scene` + `camF` + `ivFrases` + `ivAssuntos` + `palco({mundo})`, `docCena` com `focos` e `salto`, legenda com `chave`;
- **só em prévia** (`work/teste_extra_foco.js`): `ivNumero`, `ivAssuntos` com pessoa (tarja, `tira`, `escurece`), `focos` de `tvCena`, `mapaCena`, `fotoCena` e `siteCena`.

## A receita em números (medida na referência)
- **Ritmo lento de corte, rápido por dentro.** São 30 cortes em 153 s: 11,5–11,8 cortes/min, plano médio 5,0 s e mediana 4,0 s (de 2,0 a 16,6 s).
  O olho nunca fica parado. Dentro de cada plano, algo novo acontece a cada 0,6–1,2 s: a palavra que entra, o item que é preso no
  mural, o marca-texto, a câmera que viaja ou o foco que muda. Aceite 9–15 cortes/min. O teste deu 13,7/min.
- **Tempo de tela:**
  | cenário | tempo |
  |---|---|
  | apresentador | 36%, em 8 aparições de 2,1–12,2 s |
  | documentos e sites | 36% |
  | tipografia no escuro | 13% |
  | mural | 9% |
  | TV, foto de arquivo e mapa | 7% |

  Com avatar do HeyGen, o apresentador fica em **25–35% e sempre em peças de 2–4 s** (regra do Felipe: esconde as imperfeições do avatar).
- **Voz:** 2,5 palavras/s e corte justo (só 6 s de pausas ≥ 150 ms em 153 s). Mantenha o corte apertado do kit.
- **Cor** (medida em pixels):
  - vermelho do texto `#e41818`; marca-texto `#eb2528`; região do mapa `#b93530` com textura;
  - preto `#050505` nos cantos e `#131313` no centro (vinheta);
  - branco do texto `#d8d7d9` (nunca branco puro);
  - papel do documento `#dbdadc` no centro, com os cantos a ~40% do brilho do centro.
  - O apresentador é a única coisa colorida: pele e camisa frias (lavanda/azuladas), luz VERMELHA de um lado, topo escuro.
- **Tipografia:**
  - Serifa = Times condensada a 86% (`TimesInv`), apertada. Sans = Inter 400/600.
  - Todo texto tem brilho (glow) e uma aberração cromática leve.
- **Legenda:**
  - UMA palavra por vez, sem caixa. Ficam juntos número + grandeza ("3 bilhões de reais"), datas e nomes próprios ("Felipe Dantas").
  - Serifa 66 px `#e6e5e8` com sombra escura, no **centro, y 1371, em todas as cenas**.
  - Some quando a tela já escreve a fala: tipografia, mapa e revelação de nome.
- **Som:**
  - Cama grave: 87% da energia abaixo de 250 Hz, pulso a ~117 BPM em dó menor, **nível constante e sem drops** (~19 LU abaixo da voz).
  - **Baque sub-grave** (~40 Hz) em 28 dos 30 cortes, com pico 0,2–0,35 s depois do corte, a −6,6 dB da fala.
  - Nenhum whoosh nem som tátil.
  - Master −14 LUFS (padrão do Felipe).
- **Câmera:**
  - Nunca parada: push-in de 3–30%/s, pans de 200–900 px por plano e giro de 1–5°.
  - **Arranque + deriva:** ~todo o zoom do plano acontece no 1º quarto, logo depois do corte (mediana 97% dos planos com zoom).
    Depois a câmera só deriva devagar. Ela para e recomeça ~19 vezes por minuto, sem parar entre um ponto e outro.
  - **Borrão de movimento:** quando a câmera corre, a imagem perde ~40% da nitidez (razão nitidez correndo/parada 0,60).
  - Documentos, TV e site entram desfocados e focam em ~0,5 s (rack focus).
  - O apresentador entra fechado (~1,4×) e desfocado e abre em 0,45 s.
- **Grão:** fino e leve, medido em ~1 nível de desvio nos meios-tons da referência. Grão forte dobra o tamanho do arquivo e borra no TikTok.

## Motor foco: o olho acompanha (03/11/2026, padrão para cena NOVA; A/B aprovado pelo Felipe: "Aprovados")
O Felipe, em 03/11/2026: "a velocidade parece atrapalhar o acompanhamento... o dinamismo precisa ser perfeito para que os olhos possam
acompanhar, muitos efeitos se perdem na tela e não são focalizados". Medido contra a referência dele (`C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4`):
a câmera NÃO era mais rápida (mesmo pico e mesmos chicotes por minuto). O olho é que perseguia o conteúdo: panorâmica demais, 2+ textos
na tela, letra andando e borrando no chicote, itens entrando juntos e pelas bordas, começo de cena vazio ou borrado.
O A/B foi feito e **APROVADO na vox-edit2 em 03/11/2026** ("B aprovado, aplica"; `projetos/teste_foco`,
`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\TesteFoco_AB_lado_a_lado_v1.mp4`). Ele pediu o mesmo aqui.
Esta seção é o porte para o dossiê, provado num A/B desta skill (abaixo). **Toda cena nova usa o motor foco**, menos o apresentador
(`presInv` tem o punch-out próprio). Cena sem `focos`/`camF` roda como antes; projeto antigo não muda (a biblioteca é copiada no preparar).

**As regras, no dossiê:**
1. **Um assunto por vez, grande e no centro.** O assunto fica `IV_F.dy` (80 px) acima do meio; a legenda de 1 palavra continua em y 1371,
   logo abaixo. Item do mural a ~820 px de largura, trecho marcado do documento a ~880 px, foto impressa de 860–880 px.
2. **Um texto por vez, parado.** A legenda já é fixa (fora da câmera: não anda nem borra). A palavra-chave fica em VERMELHO na própria
   legenda (`chave`), sem um segundo texto repetindo a fala. A tipografia no escuro vira **frase fixa** (`ivFrases`), uma por vez, no
   centro. O número grande vira o assunto (`ivNumero`). A legenda some sozinha enquanto há frase ou número na tela.
3. **A câmera chega já no assunto e só aproxima.**
   - Chegada: 10% mais perto, assenta em 0,5 s (só zoom; o quadro 0 nunca é vazio nem borrado).
   - No máximo UM movimento por frase, ≥ ~1 s entre eles, de zoom.
   - Para trocar de lugar dentro da cena (outro item do mural, outro trecho do documento), **salto em foco**: a imagem desfoca, a câmera
     pula e o assunto novo pousa no centro (~0,36 s). Viagem com panorâmica só quando o espaço importa (a vista do mural com 2 itens).
   - Deriva contínua (zoom .03/s; mural .045; documento .04) e câmera na mão de 5 px: nunca congela.
   - A saída no corte é um chicote que MERGULHA (zoom ×1,3 + 120 px de lado), com o blur do motor golpe.
   - Sem tranco, sem mola.
4. **Nada entra pela borda.** O assunto seguinte POUSA no mesmo lugar (1,08 → 1 em 0,22 s); o anterior sai ou escurece atrás. As
   entradas `foco`, `sobe`, `desce` e `lado` viram `pousa` sozinhas numa cena do motor foco (`livre: true` mantém a antiga).
5. **Efeitos um de cada vez, no centro e com tempo de ver.** No mural, o item pousa e DEPOIS o fio vermelho desenha (0,3 s depois, em 0,6 s),
   com a câmera parada nele; os outros itens ficam a 38% do brilho e desfocam. No documento, o marca-texto passa com a página parada. Na
   tipografia, o tracejado vermelho desenha sob a palavra com tudo parado; as letras fora de ordem continuam (`*` no spec).
6. **Ambiente mais baixo:** grão ×0,65; sem tranco no baque (o BAQUE do som continua em todo corte).
7. **Vídeo real roda normal** (pedido do Felipe ao ver os A/B, 03/11): 30 q/s enquanto está na tela; nada de quadro preso nem câmera
   lenta. O `clipe()` já cuida do padrão:
   - com `ate` (o `tvCena` passa o fim da cena), o trecho começa mais cedo para acabar junto com o corte;
   - se ainda assim for curto, ele volta ao começo (pulo) em vez de parar no último quadro. O pulo também é defeito (a régua marca
     LENTO): troque o assunto antes do fim do trecho ou use um trecho mais longo (`CLIPN[nome]` / 30 = duração em segundos);
   - visível antes de `t0` com `from > 0`, roda desde antes;
   - o quadro do clipe anda pelo contador do vídeo: 1 por quadro, sem repetir nem pular por arredondamento (com o início caindo em
     fração ,5 de quadro, o motor antigo engasgava);
   - `rate < 1` vale 1.
   Confira com `<kit>\ferramentas\clipe_parado.py <proj>`: 0 TRAVADO (mesmo quadro ≥ 0,25 s na tela) e 0 LENTO (menos de 0,85× da
   velocidade normal ou quadros repetidos). O `pipeline.py fechar` já roda essa régua na etapa qa e não entrega com problema.
   Os TV de tubo do BukeleHaiti investigativa (`audio1103_inv`) ficaram presos no último quadro por 0,6–2,6 s, porque as cenas eram
   mais longas que os trechos de ~4,5 s.

**O que o foco substitui do motor golpe:** plano novo a cada ~0,9 s (agora: um movimento por frase), chicote de um ponto da composição a
outro (agora: zoom ou salto em foco), mola nas entradas (agora: pousa), trancos (agora: nenhum), chegada em chicote vindo de fora do
quadro (agora: chegada de perto, só zoom), composição maior que a tela com a câmera viajando de uma linha a outra (agora: uma frase por
vez, fixa). **Continua do golpe:** a curva `IV_GOLPE` em todo movimento, o blur só no pico, a deriva e a câmera na mão, a saída em
chicote que atravessa o corte e as regras de leitura (frase, print e marca-texto parados ≥ 1 s; nada cortado na borda).

**Como ligar:**
| cena | opção | `focos` = centro do ASSUNTO a cada frase |
|---|---|---|
| `scene()` (tipografia, recorte, foto impressa) | `camMove: camF(c => [[t, {x, y, z}], ...])` | `{x, y, z}` do mundo da cena (como o `camOlha`) |
| `muralCena` | `focos: c => [[t, alvo, dur], ...]` | alvo = `'id'` (um item), `['id', 'id']` (o grupo inteiro), `{id, salto: true}`, `{x, y, d}`; `t: null` = a câmera chega quando o item POUSA |
| `docCena` | `focos: c => [[t, alvo, dur], ...]` | alvo = `'trecho'` do `--marca` (centra e dá o zoom pela largura), `{trecho, z, salto: true}`, `{x, y, z}` em fração |
| `siteCena` | `focos: c => [[t, alvo]]` | `{x, y, z}` em fração, ou a caixa `[fx0, fy0, fx1, fy1]` de um trecho |
| `tvCena` / `mapaCena` | `focos: c => [[t, {x, y, z}]]` | como o `cam` delas (a tela da TV fica em ~x 470, y 1000) |
| `fotoCena` | `focos: c => [[t, {x, y, z}]]` | x, y em fração da foto, z ≥ 1 (só zoom) |

O 1º foco é a chegada (t ignorado). Cada seguinte começa 0,2 s antes de t e dura `dur` (0,7). `salto: true` pula em foco em vez de viajar.
Ajustes por cena: `focoOp: {dy, chega, sai, saiZoom, deriva, mao, arco, golpes, corte}`. Com `focos`, o rack de documento, site e TV começa
antes do corte (-0,2 a -0,25 s): a prova já entra quase em foco.

**Componentes novos** (assinaturas na seção de assinaturas, abaixo; modelo em `cenas_foco_exemplo.js`):
- `ivFrases(r, S, c, [frase, ...], {y, entre, larg})` — a tipografia do motor foco. Frase falada `{b: 'B30' | ['B31', 'B32'], de, spec: 's s s s|Vx3*@170'}`
  (spec do `linhaFala`; novos sufixos `*` = letras fora de ordem e `@170` = tamanho em px) ou texto livre `{linhas: [[[txt, estilo, op], ...]], ts: [[t, ...]]}`.
  Por frase: `t0`, `t1`, `y`, `entre`, `veu` (o mundo escurece atrás: frase sobre foto), `traco: {linha, parte, t}` (tracejado vermelho sob a
  parte). A frase pousa no lugar, cada parte acende na sua palavra, sai em cruz quando a próxima pousa, deriva +2%/s; a 1ª da cena já está
  nítida no quadro 0; linha larga demais encolhe para 960 px.
- `palco(r, S, {..., mundo: .14})` — fumaça escura bem fraca DENTRO da câmera: a frase fixa fica parada e nítida, e o mundo aproxima atrás
  dela (é a "câmera viajando" do formato sem arrastar a letra). Use em toda tipografia com `camF`.
- `ivNumero(r, S, c, {t, ate, para, de, casas, pre, suf, s, fonte, y, veu, conta})` — número que conta, FIXO no centro, com a fonte e o ano
  embaixo (mesmo bloco); o mundo escurece e a legenda some até `ate`.
- `ivAssuntos(r, S, c, [['i_x' | 'p_x', t, {w, rot, dy, tarja, tira, escurece}], ...], {x, y, w})` — um assunto por vez no mesmo ponto do
  mundo (ponha o `camF` nele): impressa ou pessoa recortada (tarja até `tira`), pousando; o anterior sai (ou escurece a 35%).
- Legenda: `S.cap = {modo: 'palavra', chave: ['missao', 'onu']}` (vermelha) ou `IV_CHAVE.add('bilhoes')` para o vídeo todo.
- Constantes em `IV_F` (`dy`, `chega`, `sai`, `saiZoom`, `deriva`, `mao`, `arco`, `yFrase`, `largMural`, `largDoc`, `escuro`, `fio`, `grao`).

**Onde cada efeito acontece agora:**
| cenário | motor golpe (antes) | motor foco |
|---|---|---|
| tipografia | 4–5 linhas empilhadas, a câmera desce chicoteando de uma a outra | uma frase fixa no centro por vez, pousando no lugar; o mundo (fumaça) aproxima atrás; tracejado sob a palavra |
| recorte com tarja | sobe de baixo com mola, ao lado das linhas | `ivAssuntos`: pousa no centro; tarja sai no nome; o nome vira frase fixa |
| mural | câmera voando por 4–6 enquadramentos, itens presos batendo, fio junto | um item por vez (os outros escuros e desfocados); pousa → fio desenha; salto em foco para o próximo; no fim, a vista do grupo |
| documento | chicote de um trecho a outro, rack de 0,5 s no começo | chega já no trecho (quase em foco); marca-texto com a página parada; salto em foco até o outro trecho |
| número | `contador` dentro da composição, junto de outras linhas | `ivNumero`: o número é o assunto, com a fonte embaixo, mundo escuro, sem legenda |
| foto impressa | entra batendo de 1,22× ao lado do texto | pousa grande no centro; a legenda corre embaixo; zoom de ênfase |
| TV, mapa, foto de arquivo | chicotes | chegada de perto, zoom de ênfase, saída mergulhando |

**A/B desta skill (03/11/2026):** `projetos/teste_foco_inv`, trecho 50,31–73,09 s do BukeleHaiti em edit-investigativa (`audio1103_inv`,
S11–S14: mural, foto + tipografia, tipografia pura, matéria da Al Jazeera; 22,8 s, sem apresentador; mesmo áudio nas duas, diferença 0).
A = `work/ab_foco_A.js` (as cenas como estavam), B = `work/ab_foco_B.js` (= `cenas_foco_exemplo.js`). Vídeos em
`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\`: `TesteFoco_investigativa_AB_lado_a_lado_v2.mp4` (A | B, som da B),
`TesteFoco_investigativa_A_v1_MASTER.mp4` e `TesteFoco_investigativa_B_v4_MASTER.mp4` (B v1–v3 e lado a lado v1 = passadas anteriores).

| régua (vídeo · cópia clareada) | A como é hoje | B motor foco | meta |
|---|---|---|---|
| saltos do olho por minuto | 58 · 55 | 21 · 18 | ≤ 45 |
| foco no miolo da tela | 96,6% · 96,5% | 99,3% · 99,4% | ≥ 92% |
| quadros com panorâmica > 8 px/q | 1,8% · 1,6% (diag. 16%) | 0% · 0% (diag. 1,3%) | ≤ 10% |
| parte do movimento que é zoom | 9,9% · 11,8% (diag. 6%) | 35,5% · 37% (diag. 42%) | ≥ 20% |
| quadros com o foco borrado | 34% · 37% | 12% · 13% | — |
| 2+ blocos de texto na tela | 40% | 0% | ≤ 5% |
| letra mediana | 114 px | 73 px | ≥ 44 px |
| letras andando > 3 px/q | 30% | 0% | ≤ 3% |
| câmera parada (`medir_motion`) | 32% · 38% (diag. 4%) | 33% · 32% (diag. 5%) | ≤ 20% |

**Medir neste formato:** `medir_leitura.py <master> --json x.json`, `texto_na_tela.py <proj>` e `medir_motion.py <master>` (só "câmera
parada" vale), em janelas sem apresentador (`--de/--ate`). Meça também uma cópia clareada (`ffmpeg -i x.mp4 -vf "eq=gamma=1.6:brightness=.08" x_claro.mp4`).
**A régua de câmera é cega na tipografia no escuro:** o fluxo óptico só vê preto liso e acha a câmera parada, com ou sem movimento (na A,
que chicoteia o tempo todo, a tipografia deu 55–75% de "câmera parada"). Para ver a câmera de verdade, faça o **diagnóstico** (não entregue):
copie `diagnostico_mundo.js` desta pasta para `work/<prefixo>_z.js` (ele redefine o `palco()` com uma textura visível dentro da câmera),
rode `montar.py` + `render_par.py`, meça o `out/master.mp4` e APAGUE o `_z.js` (depois, `montar.py` de novo). É o "diag." da tabela. Os
números de olho e de texto valem no vídeo normal.

**Exemplo** (`cenas_foco_exemplo.js`):
```js
// mural: chega no item que pousa no corte; salto em foco até o próximo quando ele pousa; no fim, a vista dos dois com o fio
muralCena(['B24', 'B25', 'B26'], M, {
  focos: c => [[0, 'mss'], [null, { id: 'onu', salto: true }], [c.w('B25', 'enviando'), ['mss', 'onu'], .9]],
  cap: { modo: 'palavra', chave: ['missao', 'onu', 'pequeno'] },
});
// tipografia: uma frase fixa por vez; a fumaça do mundo aproxima uma vez por frase
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
// documento: um trecho marcado por vez; salto em foco até o outro
docCena(['B33', 'B34'], 'd_aljazeera', {
  rack: c => -.2,
  focos: c => [[0, 'managed to flee the burning vehicle in Croix-des-Bouquets'],
    [c.w('B34', 'os') - .1, { trecho: 'ambush of four aviation technicians', salto: true }]],
  marcas: c => [[...ivMarca('d_aljazeera', 'managed to flee the burning vehicle in Croix-des-Bouquets'), c.w('B33', 'blindado') - .1],
    [...ivMarca('d_aljazeera', 'ambush of four aviation technicians'), c.w('B34', 'quatro') - .1]],
  cap: { modo: 'palavra', doc: true, chave: ['blindado', 'quatro'] },
});
```

## Motor golpe: câmera em chicotes (02/11/2026; desde 03/11 roda por baixo do motor foco)
**A/B desta skill APROVADO pelo Felipe em 02/11/2026** (`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_investigativa_AB_v1.mp4`).
Desde 03/11/2026, cena nova usa o **motor foco** (seção acima), que usa a curva, o blur e a deriva deste motor, mas troca o plano a cada
~0,9 s, os chicotes pela composição, a mola e os trancos por zoom, salto em foco e pouso no lugar. Use `golpes` só ao reeditar vídeo de
02/11 a 03/11; sem `golpes` nem `focos`, só vídeo de antes de 02/11.
O Felipe achava os motions fracos. Medimos as referências de motion dele (earn.edits: `C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4`,
cientista a 30 q/s com blur nos chicotes; `earn.edits_DYURMKHoayc.mp4`, Buffett a 16 q/s) contra os nossos vídeos. Nas refs o plano
dura 0,8–0,9 s; nos nossos durava ~3 s. A câmera das refs anda 4–5× mais rápido e chicoteia com blur. O motor foi criado na vox-edit2,
o A/B foi APROVADO ("B aprovado, aplica") e ele pediu o mesmo aqui. **Toda cena nova usa o motor golpe**, menos o apresentador
(`presInv` tem o punch-out próprio). Sem a opção `golpes`, a cena roda como antes (arranque + deriva); projeto antigo não muda.

**O que ele faz no dossiê:**
- **Plano novo a cada ~0,9 s sem cortar.** A câmera CHICOTEIA pela composição: tipografia → recorte, foto presa → outra foto do mural,
  manchete → número marcado. Cada chicote dura ~0,8 s e começa ~0,2 s ANTES da palavra que ele mostra, com o pico caindo nela.
  A mesma cena vira 3–6 enquadramentos.
- **Curva do chicote (medida nas refs, `IV_GOLPE`):** a câmera arranca já a ~45% da velocidade de pico, chega ao pico em 20% do
  tempo e desliza até zero. Metade do caminho é feita em 36% do tempo.
- **Blur direcional só no pico** (feGaussianBlur na direção do movimento, acima de ~10 px/quadro); no deslize a imagem volta nítida.
- **Mola nas entradas** (`IV_MOLA`, passa ~9% e assenta). Fotos e prints (`impressa`, entrada `foco`) chegam batendo de 1,22×.
  As pessoas (`recorte`, entrada `sobe`) sobem e assentam. Os itens do mural são PRESOS batendo na parede (1,3× → mola).
  Na cena com golpes, `entra` usa a mola sozinho; `mola: false` volta para a entrada antiga.
- **Tranco** (câmera treme ~0,5 s e assenta):
  - sozinho no BAQUE do corte (`corte: .2` = pico do baque do `trilha_inv.py`; `corte: false` desliga);
  - sozinho quando um item do mural é preso naquela visita (`trancoItem`, 7 px);
  - nos impactos que você marca: `golpes: [[t, 6–10]]` (número que conta, nome revelado, estado que acende, tarja que sai).
- **Câmera nunca parada:** deriva de zoom (`deriva` .035/s) + câmera na mão (`mao` 6 px de tela). Os valores são um pouco acima dos
  da vox-edit2 (.022 e 5) porque o fundo escuro esconde o movimento lento.
- **A troca de cena é um chicote.** A cena sai em chicote (último plano em `d − .12` a `d − .25`, que continua depois do corte), e
  a seguinte CHEGA no mesmo sentido: `planos[0]` fica fora do quadro, do lado de onde a câmera vem. Saiu para a direita? A próxima
  chega da esquerda (x menor). O foco e a profundidade do mural continuam iguais (foco no item perto do centro, os outros desfocam).

**Como ligar:**
| cena | opção | coordenadas dos planos |
|---|---|---|
| `scene()` de tipografia/recorte (`palco`) | `camMove: camG(c => ({planos, golpes}))` (no lugar do `camC`) | `{x, y, z, r}` do mundo da cena, como o `camOlha` |
| `muralCena` | `golpes: c => ({planos, golpes, trancoItem})` (no lugar do `cam`) | `{x, y, d, r}` da parede; `d` = distância (800–1400) |
| `docCena` / `siteCena` | `golpes: c => ({...})` | `{x, y, z, r}` em FRAÇÃO da página |
| `tvCena` / `mapaCena` | `golpes: c => ({...})` | como o `cam` delas (`camG` por dentro) |
| `fotoCena` | `golpes: c => ({...})` | `{x, y, z}`: x, y em fração da foto, z ≥ 1 |

`planos: [[t, {…}, dur]]`: `planos[0]` = pose de antes (fora do quadro, t qualquer); o 1º plano em `t = -.12` (a cena chega em chicote
no corte); cada plano seguinte começa em `t` e dura `dur` (padrão .8; .85–.9 para recuo maior). `z` e `d` andam em escala log.
Opções: `golpes` (trancos), `deriva` (.035), `mao` (6), `corte` (.2), `trancoCorte` (6), `trancoItem` (7, mural).

**Regras de leitura (regra 2 do Felipe, a mesma da vox-edit2):**
- o plano que mostra uma frase, um número marcado ou um print fica PARADO (só deslizando) **≥ 1 s** antes do próximo chicote;
- nenhum chicote no meio de uma frase sendo lida: o chicote vem ~.2 s antes da frase, nunca depois de ela começar;
- marca-texto: o chicote chega no trecho ANTES do marca-texto passar e a página fica parada enquanto ele passa
  (no doc: chicote em `tb − .25` com a marca em `tb − .05`; o 2º trecho, ~1 s antes da marca);
- enquadre o texto inteiro com margem ≥ 60 px. Confira `x ± 540/z`, `y ± 960/z`; no mural, a janela é `x ± 540·d/1000`.
  O blur do chicote deixa o texto ilegível, então o que corta na borda no plano parado é erro;
- a saída da cena pode chicotear só depois da última palavra lida (`d − .12` se a frase acaba colada no corte);
- rótulos de uma palavra (estados no mapa) podem trocar a cada ~0,7 s, porque são a própria fala. Prefira um plano que mostre 2 rótulos.

**Exemplo** (teste de 02/11, `projetos/teste_investigativa/work/iv_b.js`, S7 tipografia + recorte e S8 mural):
```js
// S7 — "Em 2006, venderam o sonho de industrializar o Nordeste."
camMove: camG(c => {
  const t06 = c.w('B19', '2006'), tv = c.w('B20', 'venderam'), td = c.w('B21', 'de'), tn = c.w('B21', 'Nordeste'), d = c.dur;
  return { planos: [[-1, { x: 540, y: 250, z: 1.6, r: -4 }], [-.12, { x: 540, y: 640, z: 1.4, r: -1 }, .8],
    [tv - .22, { x: 560, y: 900, z: 1.08, r: .6 }, .8], [td - .2, { x: 560, y: 905, z: 1.25, r: -.4 }, .8],
    [d - .12, { x: 1350, y: 900, z: 1.4, r: 2 }, .85]],                 // sai para a DIREITA...
    golpes: [[t06 + .15, 6], [tv - .4 + .45, 9], [tn + .1, 6]] };      // ...o Lula pousa com tranco
}),
// S8 — mural: "Anunciaram a ferrovia Transnordestina e prometeram três refinarias gigantescas de petróleo"
golpes: c => {
  const tt = c.w('B22', 'Transnordestina'), tp = c.w('B23', 'prometeram'), tr = c.w('B24', 'refinarias'), tg = c.w('B24', 'gigantescas'), d = c.dur;
  return { planos: [[-1, { x: 900, y: 760, d: 1150, r: -3 }], [-.12, { x: 1850, y: 820, d: 950, r: -1 }, .8],   // chega da ESQUERDA
    [tt - .22, { x: 1440, y: 1400, d: 900, r: .5 }, .8], [tp - .22, { x: 1640, y: 1130, d: 1250, r: 0 }, .8],
    [tr - .22, { x: 2240, y: 1270, d: 880, r: 1.2 }, .8], [tg - .2, { x: 1880, y: 1140, d: 1380, r: .3 }, .85],
    [d - .25, { x: 1950, y: 1900, d: 1150, r: 2 }, .85]] };            // trancos de Transnordestina e refinaria: automáticos
},
```
S9 (mapa, os 3 estados) e S13 (documento com 2 marca-textos) no mesmo arquivo.

**Medir:** `ferramentas/medir_motion.py <proj> --de T0 --ate T1` em janelas sem apresentador. Metas: plano ≤ 1,2 s, câmera parada
≤ 20%, velocidade ≥ 4 px/q, metade do caminho em 28–45%. **Neste formato a régua engana:** o fluxo óptico não enxerga o preto liso
nem o quadro borrado do chicote. A mesma janela deu 1,8 px/q no vídeo e 8,0 px/q depois de clarear. Meça também uma cópia clareada:
`ffmpeg -i x.mp4 -vf "eq=gamma=1.8:contrast=1.3,unsharp=5:5:1.0" x_claro.mp4`.
Para ver só a câmera, ponha `window.IV_BORRAO = 0` num `work/<prefixo>_z.js` temporário, que desliga o blur também no motor golpe.

**Teste A/B (02/11/2026):** a janela 25,3–35,6 s do teste (tipografia + recorte, mural e mapa) está em
`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_investigativa_AB_v1.mp4` (A atual | B motor novo). Medida na cópia clareada:

| | A atual | B motor golpe | metas |
|---|---|---|---|
| plano médio | 3,43 s | 0,94 s | ≤ 1,2 |
| câmera parada | 4% | 13% | ≤ 20% |
| velocidade | 5,1 px/q | 8,0 px/q | ≥ 4 |
| chicotes | 6 (35/min) | 10 (58/min) | — |
| metade do caminho | 36% | 27% | 28–45% |

No documento (S13, 46,8–54,6 s), a velocidade média CAI: 3,2 → 1,6 px/q (parada 6% → 15%). O motivo são as paradas de ≥ 1 s para
ler o número marcado. Não é erro: a regra de leitura vence. Para mais vida, ponha mais planos entre os trechos marcados
(recuo no parágrafo, chicote na palavra seguinte), nunca durante a marca.

## Os cenários (tudo em corte seco; cada corte ganha o baque do `trilha_inv.py`)

### 1. Apresentador: `presInv(beats, {z0, empurra, passos, luz, forca, frio, fy, capY})`
- Tela cheia, plano médio (cabeça e ombros). É a ÚNICA cena colorida. O tom é frio (`frio` .5) com luz vermelha de um lado
  (`luz: 'dir'|'esq'|false`, `forca` .55) e topo escuro.
- A entrada é um **punch-out**: começa a 1,42× e desfocado e abre em 0,45 s. Depois o zoom NÃO fica parado: muda de nível em cada
  beat (e no meio de beat > 2,6 s), alternando fechar e abrir (1,12 → 1,04 → 1,15...), com arranque de 0,5 s e borrão no salto, mais um
  empurrão lento (`empurra` .06) e uma câmera na mão leve (`mao: false` desliga). `passos: c => [[t, nível]]` escolhe os momentos,
  `niveis: [...]` os níveis, `passos: false` desliga.
- A legenda de uma palavra vai no peito (y 1371). Mostre o apresentador **só olhando para a câmera** (regra do Felipe: confira o olhar em cada janela).
- Fluxo áudio primeiro (HeyGen): o `presInv` só pode cair nos beats das peças do `work/apresentador.json`.

### 2. Tipografia no escuro: `palco(r, S)` + `linha`/`linhaFala` + `tracejado` + `contador` + `impressa`
- **Cena nova (motor foco):** `palco(r, S, {brilho, mundo: .14})` + `camMove: camF(...)` + `ivFrases(...)`. UMA frase fixa por vez no centro
  (kicker pequeno + chave grande), pousando no lugar; nada de 4–5 linhas empilhadas com a câmera descendo. Os estilos, as letras fora de
  ordem (`*`), o fundo vermelho (`marca`) e o tracejado (`traco`) continuam. O que vem abaixo (`linha` solta no mundo + câmera viajando) é o
  modo antigo, para reeditar vídeo de antes de 03/11.
- `palco` faz o fundo preto parado, com o centro levantado e um brilho vermelho ambiente (`brilho: [x, y]`). Ele já põe `S.cap` em `none`.
- **Estilos** (`IV_EST`, em px a 1080 de largura):

  | estilo | uso | fonte e cor |
  |---|---|---|
  | `V` | chave vermelha enorme ("350", "lowest", "2006,") | serifa 200, vermelho |
  | `v` | chave vermelha ("worked from", "Nordeste.") | serifa 132, vermelho |
  | `S` | serifa branca enorme | serifa 200, branco |
  | `s` | serifa branca ("Wei,", "one-person", nome no mapa) | serifa 132, branco |
  | `a` | ligação pequena ("8 at", "salary rate in China is") | Inter 400, 54 px |
  | `A` | ligação forte ("night", "viewers") | Inter 600, 58 px |
  | `r` | sans vermelha pequena ("companies on") | Inter 500, 54 px, vermelho |
  | `n` | nome ao lado da foto | Inter 500, 48 px |

  Opções por parte: `{s, cor, marca: true (fundo vermelho, como em "Viya."), letras: true, p (peso)}`.
- `linha(p, [['The','a'], ['lowest','V']], x, y, {alinha, letras})`: y é a linha de base. `.at(lt, [t1, t2])` revela cada parte
  desfocada → nítida. Com `letras: true`, as letras surgem fora de ordem (o "low t" da referência). `.marca(i, lt, t)` acende o fundo vermelho.
  `linhaFala(p, c, 'B12', 'a a|V', x, y)` monta pelos tempos da fala.
- **Ligações:**
  - `tracejado(svg, curva(x0,y0,x1,y1,k) | reta(...), {c, w})` + `.draw(q)`;
  - o fio vermelho tracejado vertical leva a câmera para baixo ("she set up → one-person companies");
  - a curva tracejada liga o rótulo ao objeto.
- **Números:** `contador(p, x, y, {de, para, casas, pre, suf, s})` + `.at(lt, t, d)` conta com borrão (0% → 3%). A fonte e o ano
  vão logo abaixo, em sans 30 px cinza: a regra do kit é que **todo dado na tela tenha ano e fonte**. Cena nova: `ivNumero` (o número é o
  assunto, fixo no centro, com a fonte embaixo; o mundo escurece e a legenda some).
- **Câmera:** cena nova usa o motor foco, `camMove: camF(c => [[t, {x, y, z}], ...])` (seção acima). `camG` (motor golpe) é para
  reeditar vídeo de 02 a 03/11 e o `camC` abaixo, para vídeo de antes de 02/11. `camMove: camC(c => [[t, {x, y, z, r}], ...])`: a câmera OLHA para o ponto (x, y) do mundo da cena.
  Monte a composição maior que a tela (3000 px de altura) e faça a câmera viajar até o elemento novo.
  - Todas as câmeras do formato (`camOlha`/`camC`, mural, documento e site) já fazem o movimento da referência:
    - **entrada:** começa 16% mais aberta (mural: mais longe) e chega à 1ª chave em ~0,55 s;
    - **arranque:** cada trecho faz ~80% do caminho no começo e chega ainda andando, sem parar;
    - **deriva:** zoom +1%/s até 4 s depois da última chave;
    - **borrão de movimento** automático na direção do movimento.
  - Ajustes:
    - 3º item da chave: `'suave'` (acelera e freia), `'linear'` ou `'fixa'` (na 1ª chave: sem entrada);
    - `window.IV_ENTRADA` (padrão .16) e `window.IV_BORRAO` (padrão .4; 0 desliga).
  - Coloque a chave de chegada logo depois da palavra: a câmera chega cedo e deriva.
- **Fotos soltas no escuro:** `impressa(p, 'i_x', cx, cy, w, {rot})` + `.at(lt, t)` é a foto P&B com borda branca, canto dobrado e
  percevejo. Sem rótulo com o nome do lugar ou da foto (regra do Felipe, 30/10): só a fala. Cena nova: `ivAssuntos` (a foto grande no
  centro, pousando no lugar, com a legenda embaixo).

### 3. Pessoas: `recorte(p, 'p_x', cx, cy, w, {tarja})` + `nomeado(...)`
- Pessoa recortada em P&B com retícula (`provas.py modo pessoa`). O pé some no preto (`funde`) e há um brilho leve na borda.
  Ela entra subindo com borrão (`.at(lt, t, {k: 'sobe'})`). Cena nova: `ivAssuntos(r, S, c, [['p_x', t, {tarja: true, tira: tNome, dy}]])`
  — pousa no centro, a tarja sai no nome e o nome entra como frase fixa (`ivFrases`). Deixe a cabeça acima de y ~1150 (`dy`): a legenda
  fica em 1371 e não pode cobrir o rosto.
- **Tarja preta nos olhos** (`tarja: true` usa os olhos achados pelo `provas.py`) enquanto a pessoa ainda não foi nomeada.
  `.tira(lt, c.w('B29','Lula'))` tira a tarja NO NOME, e o nome entra em serifa vermelha em cima (a revelação "Huang Wei,").
  Use a tarja como recurso de narrativa e reutilize o mesmo recorte: na referência, a mesma pessoa aparece com tarja em 2 cenas antes do nome.
- Anônimos (multidão, "os espectadores") vão com tarja em todos: `provas.py modo multidao`.
- **Fila de pessoas citadas:** um recorte por pessoa, com `nomeado(p, svg, 'Fan Bingbing', xT, yT, xAlvo, yAlvo)` (nome em sans +
  tracejado curvo até a pessoa). A câmera passa de uma pessoa para a outra.

### 4. Mural de provas: `mural()` + `muralCena(beats, M, {cam})`
- O fio do vídeo. Defina UM mural no `_b.js`:
  - `M.foto(id, 'i_x', x, y, {w, rot, dz, desde})`;
  - `M.doc(id, 'd_x', x, y, {w, recorte: [fy0, fy1]})`;
  - `M.fio(a, b, {desde})`.

  Cada visita mostra o que já foi citado. O que entra naquela fala é **preso na palavra** (`desde: ['B22', 'Transnordestina']`):
  aparece com escala e foco, e o fio vermelho desenha.
  A referência volta ao mural 5 vezes e ele vai crescendo. Faça de 3 a 5 visitas.
- **Cena nova (motor foco):** `focos: c => [[0, 'id1'], [null, {id: 'id2', salto: true}], [t, ['id1', 'id2'], .9]]`. Um item por vez a
  ~820 px, os outros escuros e desfocados; o item pousa e o fio desenha depois, com a câmera parada; `t: null` = a câmera chega quando o
  item pousa (nunca num lugar vazio); `salto` troca de item em foco, sem arrastar a parede; o grupo (`['a', 'b']`) é a vista que mostra o
  fio. Item preso nos primeiros 0,25 s já está pousando no quadro 0. Defina o fio do item antigo para o novo (`M.fio(antigo, novo)`): a
  ponta chega no assunto.
- **Câmera 3D:** `cam: c => [[t, {x, y, d, r}]]`, onde (x, y) é o ponto da parede no centro e `d` a distância (1000 = tamanho real;
  800–1250 é o bom; 1500 dá a vista geral).
  - O foco vai sozinho para o item perto do centro; os outros desfocam pela profundidade (`dz`) e pela distância do centro.
  - A luz é um poço no meio e a parede escurece nas bordas.
  - Itens de 480–650 px de largura.
- A parede `t_parede` é escura, com reboco visível, e fica a ~30–45/255 no centro (o mural da referência mede 42).

### 5. Documento: `docCena(beats, 'd_x', {cam, inclina, faixa, rack, marcas})`
- **Use print REAL**, do pedido fixo do Felipe: manchetes e dados reais, com marca-texto no que ele diz.
  `pagina.py <proj> nome --url URL --marca "2,7 bi" --marca "foi lançada em 2010"` abre a página no Chromium do kit e faz assim:
  1. rola a página para carregar tudo;
  2. esconde o que é fixo (barras, cookies, anúncios);
  3. começa ~960 px acima do título;
  4. converte para P&B de xerox;
  5. grava a posição de cada `--marca` em `render/marcas.js`.

  Site que não abre limpo (paywall, página vazia): use `--texto pagina.json` com o título e os trechos reais (reprodução).
  Nesse caso, diga nas fontes que é reprodução e dê o link.
- A página fica num plano inclinado (`inclina` 13°): o topo foge, há uma **faixa nítida no meio** (`faixa` [.34, .66]) e o resto fica desfocado.
  A vinheta é forte. A câmera `cam: c => [[t, {x, y, z, r}]]` usa **frações da página**.
  `[[0, {x: .32, y: m[1], z: 1.05}], [t, {x: (m[0]+m[2])/2, y: (m[1]+m[3])/2, z: 1.75}]]` empurra até o número.
- `rack: c => .05`: entra desfocada e foca. `marcas: c => [[...ivMarca('d_x', '2,7 bi'), c.w('B37', 'bilh')]]`: o marca-texto
  vermelho (multiply) passa da esquerda para a direita no tempo da palavra.
- A legenda continua, com sombra forte (`{modo: 'palavra', doc: true}`, padrão).
- Uma página pode ser lida descendo: a referência fica 16 s num documento, indo de um trecho marcado a outro.
- **Cena nova (motor foco):** `focos: c => [[0, 'trecho 1'], [t, {trecho: 'trecho 2', salto: true}]]` — o nome do `--marca` centra o trecho e
  escolhe o zoom pela largura (~880 px, entre 1,2 e 2,2×). A câmera chega já no trecho, o marca-texto passa com a página parada e a troca
  de trecho é um salto em foco (~0,36 s) no lugar da viagem pela página. Ponha o salto ~0,2 s antes da frase do trecho 2 e a marca dele
  depois do salto. O rack começa antes do corte (-0,2 s).

### 6. Site impresso: `siteCena(beats, 'w_x', {w, inclina, rack, cam, marcas})`
- É o print de site com borda rasgada (`provas.py modo site`), num plano inclinado sobre uma cópia gigante e desfocada dele mesmo
  (o bokeh da referência). Entra desfocado e foca. Serve para a "página oficial que vende o esquema".
- Cena nova: `focos: c => [[0, [fx0, fy0, fx1, fy1]], [t, {x, y, z}]]` (a caixa de um trecho centra e dá o zoom); o rack começa em -0,25 s.

### 7. TV de tubo: `tvCena(beats, {img: 'd_x' | clipe: 'nome', pos, rack, cam})`
- Quarto escuro, a TV antiga em P&B e a prova na tela (print ou clipe de telejornal em `render/clips/`), com linhas de varredura.
  A luz da tela vaza na parede. Entra desfocada e a câmera empurra e gira de leve. Use para "na televisão", "a imprensa noticiou".
  `pos: '30% 0%'` escolhe o pedaço do print que aparece.
- Cena nova: `focos: c => [[0, {x: 470, y: 1000, z: 1.05}], [t, {x: 470, y: 1000, z: 1.3}]]` (a tela da TV no centro, um zoom de ênfase por
  frase; rack em -0,25 s).
- **O clipe roda normal até o corte** (30 q/s, nunca parado no último quadro): o `tvCena` faz o trecho começar mais cedo se ele acabaria
  antes da cena. Escolha um trecho pelo menos tão longo quanto a cena (`CLIPN[nome] / 30` s, a partir do `from`); se não houver, corte para
  outro cenário antes de ele acabar.

### 8. Mapa escuro: `mapaCena(beats, {alvo: ['MA','CE'], acende, cam, rotulos})`
- O Brasil fica escuro, com estados, traços de "relevo" e retícula. Os estados-alvo acendem em vermelho (piscando 0,18 s) na palavra,
  com brilho. Os rótulos são serifa branca (`linha(p, [['Maranhão','s',{s:40}]], x, y)` nas coordenadas do mapa, que acompanham o zoom),
  mais um tracejado vermelho até o lugar. O Brasil inteiro ocupa x 90–940, y 510–1380, e o Nordeste enche a tela com z ≈ 2.
- A legenda some (`S.cap` none); para mostrar a frase antes do rótulo, use `S.cap = lt => lt < t ? {modo:'palavra'} : {modo:'none'}`.
- Cena nova: `focos: c => [[0, {x, y, z}], [t, {x, y, z}]]` — a câmera já chega na região que acende (no centro) e só aproxima; um rótulo
  por vez, perto do estado.

### 9. Foto de arquivo em tela cheia: `fotoCena(beats, 'f_x', {z0: 1.12, z1: 1.0, fx, fy})`
- Foto P&B com retícula fina e zoom lento. A referência ABRE (zoom out), mas empurrar também vale. Use para lugar, obra ou cena real.
  O `provas.py modo foto` já gera a imagem no tamanho que cobre a tela, para a retícula ficar fina (1:1).
- Cena nova: `focos: c => [[0, {x: .5, y: .45, z: 1.1}], [t, {x, y, z: 1.3}]]` (só zoom, sem panorâmica nem saída).

### 10. Final
- A referência termina no apresentador e corta para preto. Se a fala pedir para seguir o perfil, use
  `fimPerfilInv(beats, {perfil: 'perfil_felipedantasf', toque: ['B129', 'seguir']})`: o print REAL do perfil fica preso na parede
  com percevejo e o botão vermelho Seguir → Seguindo. Pessoa sem print: `nome`.

## Decidir o cenário de cada frase
| a frase traz | cenário |
|---|---|
| pergunta, opinião, "você", virada | apresentador |
| número, data, prazo, comparação | tipografia (+ contador) |
| quem fez, nome de alguém | recorte (tarja até o nome) |
| algo que entra na história (obra, empresa, pessoa, documento) | mural (prende o item novo) |
| "a matéria", "o documento", "o governo publicou", valor exato | documento real com marca-texto |
| "na TV", "a imprensa" | TV de tubo |
| lugar | mapa escuro |
| paisagem ou obra | foto de arquivo |

**Gancho** (primeiros ~3 s, quadro 0 completo): a frase-gancho na tipografia com o número em vermelho e o protagonista recortado com
tarja, ou o mapa acendendo. Antes dos ~12 s, o apresentador.

**Estrutura da referência:** gancho → apresentador → prova (foto presa) → documento → nome revelado → mural → TV → apresentador →
mural → documentos (o mecanismo) → mapa → apresentador → documentos → número → apresentador → site oficial → documento final →
apresentador (fecho).

## Legenda: `S.cap` em cada cena
- `{modo: 'palavra'}` (padrão): uma palavra por vez, centro, y 1371. Opções: `y`, `x`, `s` (tamanho), `cor`, `doc: true` (sombra forte em fundo claro).
- `{modo: 'none'}`: tipografia, mapa e fim. Pode ser uma função do tempo local (`lt => ...`) para trocar no meio da cena.
- Grupos forçados para o vídeo todo: `IV_UNE.add('bolsa familia')` (texto normalizado, sem acento).
- A legenda nunca atravessa o corte de cena e entra desfocada → nítida em 0,12 s, 0,02 s antes da palavra.
- **Motor foco:** a legenda é o único texto corrido e já é fixa (fora da câmera). A palavra-chave sai em VERMELHO na própria legenda:
  `chave: ['missao', 'onu']` no `S.cap` (ou no `cap` das cenas prontas) ou `IV_CHAVE.add('bilhoes')` para o vídeo todo. Ela some sozinha
  enquanto uma frase do `ivFrases` ou um `ivNumero` está na tela (`S._capOculta`) e volta entrando desfocada → nítida. Não ponha rótulo
  nem segundo texto junto dela.

## Som
- `trilha_inv.py` (pelo `pipeline.py fechar`, via `etapas.json`). Opcional, `trilha.json` na raiz do projeto:
  `{"bpm": 117, "tom": "Cm", "nivel": -19, "baque": -3, "sem_baque": ["B44"], "hits": [["B46", "2010"]], "sobe": [["B40", "B52", 2]]}`.
  - `nivel` = LU da cama em relação à voz (ponderação K).
  - `baque` = dB do baque contra o RMS da voz.
  - Nas cenas, `EVENTS.push({t: c.t0 + lt, type: 'semBaque'})` tira o baque de um corte e `{type: 'baque'}` põe um extra.
- Sem música: `--sem-trilha` no preparar (ou `SEM_MUSICA=1`). Os baques continuam, porque fazem parte da edição. Sem baques: `SEM_BAQUE=1`.
- Efeito tátil do kit (`cue`): quase nada. A referência não tem whoosh. Se usar, nunca em cima do começo de palavra.
- O teste mediu baque a −6,3 dB (referência −6,6), pico 0,23 s depois do corte e checa_fala com 0 palavra perdida por efeito.

## Passo a passo
1. **Projeto e transcrição** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs no fluxo áudio primeiro).
2. **Formato:** `python <esta pasta>/preparar_investigativa.py <nome> --prefixo xx [--avatar | --real] [--sem-trilha]`.
3. **Corte e beats** como no kit. Os beats são de 1–2,5 s e quebram antes de nomes, valores e datas.
4. **Pesquisa:** cada fato, número e data, com a fonte primária. **Ache as páginas reais** (matéria, diário oficial, relatório do TCU,
   site do órgão) para os documentos e anote a URL e a data. O que estiver errado na fala NÃO vai para a tela: vai a legenda, mas nenhum
   número, documento ou selo repete o erro. Avise o Felipe com a fonte.
5. **Plano de cenas:** tabela `cena | beats | fala | cenário | prova (fonte) | âncora | câmera`. Confira:
   - ~11,5 cortes/min, cenas de 2–8 s com algo novo a cada ~1 s;
   - apresentador no perfil (real ~36%; avatar 25–35% em peças de 2–4 s);
   - documentos reais em ~1/3 do tempo;
   - mural visitado 3–5 vezes, crescendo.
6. **Provas:**
   - fotos → `export MSYS_NO_PATHCONV=1` e `python provas.py <nome> fotos/x.jpg:pessoa fotos/y.jpg:imp fotos/z.jpg:foto`
     (Commons, Agência Brasil, as fotos que o Felipe mandar);
   - páginas → `python pagina.py <nome> gazeta --url "https://..." --marca "R$ 2,7 bi"`;
   - pessoas reais: só foto real (nunca IA).
7. **Cenas** em `work/xx_b.js`, `xx_c.js`... no **motor foco** (copie a estrutura de `cenas_foco_exemplo.js`; `cenas_exemplo.js` mostra
   cada cenário). Comente cada uma com `// Sn — "fala"`. Por frase: qual é O assunto, qual texto está na tela (só um) e qual é o único
   movimento. `python montar.py <nome> xx` deve dar sintaxe, palavras e beats ok, apresentador no perfil e o ritmo previsto.
8. **Prévias:** `python previas.py <nome>` (ou `--cenas 3,8,13`). Abra `out/pv/cenas_*.jpg`. Confira também o quadro 0 de cada cena
   (`render.py preview <t0 da cena>`): o assunto já está lá, nítido.
9. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"`. Ele roda montar → render → mix + `trilha_inv.py` →
   checa_fala → QA → entrega `_vN`.
10. **Conferir:** `python ritmo.py <nome>` (9–15 cortes/min, nenhum trecho parado), todas as `out/qa_*.jpg` e as réguas de leitura
    (`<kit>/ferramentas/medir_leitura.py`, `texto_na_tela.py`, `medir_motion.py`; seção "Medir neste formato" do motor foco).
11. **Mensagem final** (português, curta):
    - arquivos e onde estão;
    - créditos gastos (o formato é 0 crédito quando só usa fotos e prints reais);
    - avisos de checagem com fonte;
    - **Fontes:** com os links das matérias printadas (veículo e data), das fotos (autor e licença) e dos dados.

## Componentes — assinaturas
- Legenda: `S.cap = {modo: 'palavra'|'none', x, y, s, cor, doc, chave: [...]}`; `IV_UNE`, `IV_CHAVE`.
- Motor foco: `camF(c => [[t, {x, y, z}, dur], ...], {dy, chega, sai, saiZoom, deriva, mao, arco, golpes, corte})`; opção
  `focos: c => [[t, alvo, dur], ...]` (+ `focoOp: {...}`) em `muralCena` (alvo `'id'` | `['id', ...]` | `{id, d, salto}` | `{x, y, d}`; `t: null`
  = no pouso), `docCena` (`'trecho'` | `{trecho, z, salto}` | `{x, y, z}`), `siteCena` (`{x, y, z}` | `[fx0, fy0, fx1, fy1]`), `tvCena`,
  `mapaCena`, `fotoCena` (`{x, y, z}`); `ivFocos(c, focos, U, o)` (o planejador por baixo); `ivFrases(r, S, c, [{b, spec, de} | {linhas, ts}
  + {t0, t1, y, entre, veu, traco: {linha, parte, t, d}}], {y, entre, larg})`; `ivNumero(r, S, c, {t, ate, para, de, casas, pre, suf, s, fonte,
  y, veu, conta, virgula})`; `ivAssuntos(r, S, c, [[asset, t, {w, rot, dy, tarja, tira, escurece, tipo, dobra, pino}]], {x, y, w})`;
  `palco(r, S, {..., mundo})`; `ivFixo(r, S)` (camada fixa), `ivVeu(r, S)` + `S._veus`, `S._capOculta`, `S._upd`; `entra(..., {k: 'pousa', s0})`
  (`livre: true` mantém 'sobe'/'lado'... no motor foco); spec com `*` (letras) e `@px` (tamanho); `IV_F`.
- Motor golpe: `camG(c => ({planos: [[t, {x, y, z, r}, dur]], golpes: [[t, amp]], deriva, mao, corte, trancoCorte}))`;
  `golpes: c => ({...})` em `muralCena` (`{x, y, d, r}`, + `trancoItem`), `docCena`/`siteCena` (fração da página), `tvCena`, `mapaCena`,
  `fotoCena`; `ivGolpes(o, {padrao, mx, my})`; curvas `IV_GOLPE`, `IV_MOLA` (também `'golpe'` como 3º item do `camOlha`); `entra(..., {mola: false})`.
- Câmera: `camOlha([[t, {x, y, z, r}, 'arranque'|'suave'|'linear'|'fixa']])`, `camC(c => keys)`, `ivKf(keys, padrao)`, `IV_ARRANQUE`,
  `ivBorrao(el, S, vx, vy, vb)` (cena com câmera interna: `S._mbProprio = true` e chame no update), `window.IV_ENTRADA`, `window.IV_BORRAO`.
- Apresentador: `presInv(beats, {z0, dEntra, empurra, passos: c => [[t, nível]] | false, niveis, mao, luz, forca, frio, sat, fy, capY, vig, grao, build(L,S,c), update(S,c)})`.
- Palco: `palco(r, S, {brilho, cap, vig, grao})`, `linha(p, partes, x, y, {alinha, k, letras})` + `.at(lt, ts, {d, blur, espalha, out})` +
  `.marca(i, lt, t)` + `.caixa()`, `linhaFala(p, c, beat, spec, x, y, {entre, junta, de})` + `.at(lt)`, `tracejado(svg, d, {c, w, dash, gap})` +
  `.draw(q)`, `reta()`, `curva(x0, y0, x1, y1, k)`, `contador(p, x, y, {de, para, casas, pre, suf, s, alinha})` + `.at(lt, t, d)`,
  `tarja(p, x, y, w, h)` + `.at(lt, t0, t1)`, `impressa(p, 'i_x', cx, cy, w, {rot, tipo, dobra, pino, recorte})` + `.at(lt, t, {k})`.
- Pessoas: `recorte(p, 'p_x', cx, cy, w, {tarja, funde, fundeDe})` + `.at()` + `.tira(lt, t)`, `nomeado(p, svg, txt, x, y, x1, y1, {estilo, alinha, curva})` + `.at(lt, t)`.
- Mural: `mural().foto(id, asset, x, y, {w, rot, dz, desde, borda, dobra}).doc(...).fio(a, b, {desde})`, `muralCena(beats, M, {cam, foco, luz, cap, build, update})`.
- Documento: `docCena(beats, 'd_x', {cam, inclina, faixa, rack, marcas, larg, cap})`, `ivMarca('d_x', 'trecho')`; site: `siteCena(beats, 'w_x', {w, inclina, rack, cam, marcas})`.
- TV, mapa, foto e fim: `tvCena(beats, {img | clipe, from, pos, rack, cam, w})`, `clipe(p, nome, S, {from, rate (≥ 1), fx, fy, z0, z1, dur, t0, ate, n, w, h, pb})`,
  `mapaCena(beats, {alvo, acende, cam, rotulos(p, svg, S, c), cap})`, `fotoCena(beats, 'f_x', {z0, z1, fx, fy, cap})`,
  `fimPerfilInv(beats, {perfil, toque, nome})`.
- Entrada genérica: `entra(e, lt, t, {k: 'pousa'|'foco'|'cresce'|'sobe'|'desce'|'lado'|'brota', d, dx, dy, out, livre})`. Do kit: `scene`, `el`, `box`, `svgAbs`,
  `sv`, `tx`, `kf`, `E`, `clamp`, `lerp`, `cue`, `AS`, `c.b/c.e/c.w`.

## Armadilhas (vistas no teste)
- **`g_tv60.png` tem a tela OPACA:** desenhe a TV primeiro e a imagem por cima (o `tvCena` já faz isso). A tela preta na prévia vinha daí.
- **Print começando no título deixa preto em cima da página** quando a câmera centra o título. O `pagina.py` já começa 960 px acima.
  Se a página não tiver isso de topo, aceite a borda do papel no alto (a referência mostra a borda) ou foque um pouco abaixo.
- **Foto de tela cheia em 1400 px é ampliada 2×** para cobrir 1080×1920, e a retícula fica grossa. O `provas.py modo foto` já gera
  no tamanho certo; se passar `largura` à mão, use a que cobre a tela.
- **Movimento "flutuando" (v1 do teste, 29/10):** com `E.inOut` entre as chaves, a câmera parava em cada ponto (37 paradas/min contra
  19 na referência). Só 10% do zoom acontecia no começo do plano e nada tinha borrão, então a demo parecia menos dinâmica com a MESMA
  velocidade média. Depois do arranque + entrada + deriva + borrão: 16 paradas/min, 52% do zoom no 1º quarto e borrão 0,61 (ref. 0,60).
  O resto é proposital: as viagens da câmera até o elemento citado acontecem na palavra. Não volte para `E.inOut` como padrão.
- **Filtro na camada da câmera:** o borrão usa `filter` no `r` da cena. Cena que precisa de outro filtro nessa camada (foco da TV)
  põe o valor em `S._filtroExtra`; se escrever `r.style.filter` direto, o borrão apaga.
- **Grão forte:** ±100 com opacidade .2 deixava o MASTER da demo com 248 MB em 66 s. Com o grão atual (±45, suavizado) caiu para 126 MB,
  e o tiktok 2 passadas (1,15 Mb/s) ficou limpo. Não suba `S.grao` acima de ~.25.
- **Mural longe demais** (d ≥ 1400 o tempo todo) deixa as fotos pequenas e a parede preta. Fique em d 800–1250 e itens de 480–650 px. A parede
  precisa da luz no meio (`t_parede` a ~30/255 + o poço de luz).
- **`c.w` cai na 1ª palavra do beat** se não achar: o `montar.py` avisa. Use prefixos sem acento ('Maranh', 'bilh').
- **`linha` mede o texto na hora do build:** as fontes precisam estar no pré-carregamento (o preparar já põe `TimesInv` e Inter na lista `faces`).
- **Rótulo fora do quadro:** composição maior que a tela + câmera viajando. Confira cada palavra nas prévias: "Estados Unidos" em x 300 saiu cortado.
- **Câmera da ÚLTIMA cena com `c.dur`:** a última cena vai até o fim do áudio. Numa demo parcial, ou se houver cauda, o movimento se
  espalha e a cena fica parada. Ancore a última chave numa palavra (`c.e('B49') + .4`).
- **O mesmo print em duas cenas seguidas** (manchete → parágrafo da mesma matéria) fica melhor como UMA `docCena` que desce a página.
- **Componente novo no skill:** copie de novo `componentes.js` para `work/<prefixo>_a.js` (o preparar faz isso) antes de montar.
  Senão aparece "X is not defined".
- **Abreu e Lima (PE) foi construída e opera.** Não use a foto dela como "refinaria cancelada". Confira o que cada foto mostra antes de pôr
  numa frase.
- Git Bash troca `a:b:c` por lista de caminhos: `export MSYS_NO_PATHCONV=1` antes do `provas.py`.
- **Régua de câmera cega no escuro (motor foco, 03/11):** a tipografia no preto dá "câmera parada" alta mesmo com a câmera andando (a A,
  que chicoteava, deu 55–75%). Não tente "consertar" pondo movimento na letra: meça com o `diagnostico_mundo.js` (seção do motor foco).
- **`linha()` centrada puxa a serifa ~7% para a esquerda:** o `scrollWidth` conta a serifa antes de condensar. O `ivFrases` centra pela
  largura visível; numa `linha` solta (`alinha: 'centro'`), confira a centragem na prévia.
- **Elemento criado com `display:none` no build não tem medida:** o `linha()`/`contador()` saem com largura 0 (frase começando no meio da
  tela). Crie visível (opacidade 0) e esconda depois de medir, como o `ivFrases`.
- **Câmera chegando num lugar vazio do mural:** item que é preso numa palavra depois da chegada deixa a parede vazia por alguns décimos.
  Use `t: null` no foco (a câmera chega no pouso) e, no 1º item da visita, `desde` no começo do beat (já pousando no quadro 0).
- **Palavra por palavra num kicker longo:** a 1ª palavra aparece sozinha à esquerda e puxa o olho. Em ligação curta tudo bem (dá ritmo:
  algo novo a cada ~0,3 s); em 4+ palavras longas, junte (`Ax4`).
- **Frase sobre foto clara:** use `veu` .75–.8 no `ivFrases` (com .6 o branco some no céu claro).

## Checklist antes de entregar
- [ ] `ritmo.py`: 9–15 cortes/min (referência 11,5) e nenhum trecho parado; algo novo a cada ~1 s.
- [ ] Motor foco em toda cena nova (menos o apresentador): um assunto por vez, grande e no centro, já no quadro 0; um texto por vez
  (legenda com a chave em vermelho, ou UMA frase fixa do `ivFrases`, ou o `ivNumero`); no máximo um movimento por frase, de zoom; troca de
  item/trecho em salto de foco; o próximo pousa no lugar; no mural, pousa e depois o fio; marca-texto com a página parada; sem tranco.
- [ ] Réguas (cenas sem apresentador, vídeo e cópia clareada): `medir_leitura.py` saltos do olho ≤ 45/min, foco no miolo ≥ 92%, panorâmica
  > 8 px/q ≤ 10%, zoom ≥ 20% do movimento; `texto_na_tela.py` 2+ blocos ≤ 5%, letra mediana ≥ 44 px, letras andando > 3 px/q ≤ 3%;
  `medir_motion.py` câmera parada ≤ 20% (na tipografia no escuro, pelo `diagnostico_mundo.js`). Frase, print e marca-texto parados ≥ 1 s;
  nada cortado na borda.
- [ ] Tudo P&B + vermelho. Só o apresentador tem cor (tom frio + luz vermelha) e só aparece olhando a câmera.
- [ ] Perfil do apresentador ok no `montar.py` (avatar: 25–35%, peças de 2–4 s).
- [ ] Documentos REAIS (print da página) com marca-texto vermelho no trecho dito, no tempo da palavra. Data, veículo e link nas fontes.
- [ ] Mural visitado 3–5 vezes e crescendo; cada item preso na palavra que o cita; fio vermelho ligando.
- [ ] Tarja nos olhos só até o nome (e em todo anônimo); nome em serifa vermelha na revelação.
- [ ] Número na tela = dado conferido, com ano e fonte em sans pequena. Nada do que está errado na fala aparece como gráfico.
- [ ] Legenda de UMA palavra (números, datas e nomes juntos) em todas as cenas, menos tipografia e mapa; nada cobre os olhos nem o rosto
  de quem está no recorte; nenhum rótulo junto dela.
- [ ] Cama grave constante + baque em cada corte. −14 LUFS. checa_fala sem palavra perdida por efeito.
- [ ] `<kit>\ferramentas\clipe_parado.py <proj>`: 0 TRAVADO, 0 LENTO (todo vídeo real a 30 q/s enquanto está na tela; TV de tubo inclusive).
- [ ] Final no apresentador ou `fimPerfilInv` com o perfil REAL. Versão nova `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
