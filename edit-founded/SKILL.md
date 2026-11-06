---
name: edit-founded
description: Formato "edit founded" (história de fundador/empresa), vertical 9:16, com o Kit_Edicao_Vox_v2. Replica o vídeo do canal FOUNDED sobre a Monster (out/2026). O apresentador aparece 10–15 vezes por 2–4 s, em tela cheia ou num círculo sobre as imagens; no resto, uma imagem em tela cheia por palavra forte (~100 trocas por minuto, plano de ~0,5 s), fotos e vídeos reais intercalados (~60/40) aproximando devagar, com retícula suave e cor de cinema. A legenda fica no MEIO da tela, palavra por palavra, misturando serifa itálica com sans pesado. Usa cartões branco e vermelho nas viradas e nos anos, faixa letterbox para vídeo largo, tríptico, produto girando sobre a marca, gráfico de alta com a porcentagem contando, print de loja e final com a marca de quem fala. A trilha é uma cama cinematográfica grave. Motor foco (03/11/2026, padrão) — o assunto de cada imagem fica no mesmo ponto da tela, a legenda é o único texto e fica fixa logo abaixo dele, a câmera aproxima (zoom) em vez de varrer, o tríptico acende um painel por vez e cada efeito acontece sozinho. Use quando o Felipe pedir "edit founded", "formato Founded", "estilo história de fundador/empresa", "igual ao vídeo da Monster", ou mandar esse vídeo como modelo — com gravação ou áudio da ElevenLabs + HeyGen.
---

# Formato edit-founded (história de fundador, uma imagem por palavra, apresentador 10–15 vezes)

Modelo extraído quadro a quadro e no áudio do vídeo que o Felipe mandou em 30/10/2026 (`C:\Users\USER\Downloads\DeHrWPmufP5.mp4`,
1:19, inglês, 720×1280 a 24 fps, canal FOUNDED). A história é a de Rodney Sacks: advogado sul-africano que compra uma empresa de suco
falida e cria a Monster Energy.

**Antes de planejar, abra as duas imagens desta pasta:**
- `referencia_formato.jpg`: 18 quadros da referência, rotulados.
- `exemplo_teste.jpg`: o que estes componentes produzem (projeto `projetos/teste_founded`, corte "Lisa Su / AMD" da Thainá, demo de 42 s).

Esta skill complementa o kit. Corte, beats, render, mix e entrega seguem `<kit>\CLAUDE.md`. As regras fixas do Felipe estão na memória:
fala nunca muda; dado na tela com fonte e data; IA nunca faz rosto de pessoa real; perfil REAL no CTA; versão nova `_vN`;
entrega = tiktok ≤ 29 MB + MASTER.

> **VÍDEO REAL RODA SEMPRE NORMAL** (Felipe, 03/11/2026: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal").
> Todo trecho (`'clip:x'`) anda a 30 q/s (`rate` 1) do primeiro ao último instante em que aparece: nunca preso no último quadro, nunca
> câmera lenta por quadro repetido. Trecho mais curto que o tempo na tela = troque o assunto (no mesmo lugar) antes de ele acabar,
> comece mais cedo no trecho, use outro trecho ou extraia o trecho mais longo (`clipes.py`). Régua: `ferramentas\clipe_parado.py <proj>`
> tem de dar **0 TRAVADO e 0 LENTO**. O motor ajuda (abaixo), mas a régua é que decide.

Rode tudo com o Python do kit (`<kit>\.venv\Scripts\python.exe`). Em outro PC, a variável `VOX_KIT` aponta para a pasta do kit;
sem ela, vale `H:\Edição Claude\Kit_Edicao_Vox_v2`.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca (vira `work/<prefixo>_a.js`): legenda no meio, `rajada`/`rajadaAuto`, `cartaoCor`, `faixa`, `tripla`, `produtoGira`, `alta`, `siteCor`, `fimMarca`, `fdPlano`; **motor foco** (padrão: `FD_FOCO`, `op.foco`/`alvo`/`zMax`/`semLegenda`/`pousa`, `fdNumero`, `fdSoco`, `fdMarcaFundo`, `FD_CHAVE`); motor golpe (`FDG.golpe`, `FDG.mola`, chicote, `trancos`). Antes do motor foco: `componentes.js.antes_foco` |
| `cenas_exemplo_foco.js` | **copie este** para cenas novas: as 15 cenas do A/B do motor foco (0–24,5 s), cada plano com `foco` |
| `cenas_exemplo.js` | as 20 cenas do teste (0–42 s), comentadas, de antes do motor foco (sem `foco`; continuam funcionando) |
| `legenda.css` | fontes (TimesInv normal e itálico = Times New Roman do Windows; Inter 400/800/900), legenda sem caixa, grão e vinheta |
| `preparar_founded.py` | prepara o projeto: fontes, CSS, componentes, perfis, `clipn.js`, `marcas.js`, `etapas.json` (montar + trilha_fd, sem apresentador) |
| `imagens.py` | fotos no tamanho que cobre a tela (`foto`), para a faixa (`faixa`), e recorte de produto sem fundo (`produto`, ISNet do kit) |
| `clipes.py` | trechos de vídeo → `render/clips/<nome>/` 30 fps em 9:16 (ou `largo` para a faixa) — o mesmo do edit-papel |
| `pagina.py` | print de site/loja REAL pela URL, em cor (`--pb` = xerox), com a posição de trechos em `render/marcas.js` |
| `trilha_fd.py` | cama cinematográfica sintetizada (~76 BPM, mi menor, ~14 LU abaixo da voz) e mix final −14 LUFS |
| `montar.py` / `previas.py` / `ritmo.py` | montar: sintaxe, palavras e beats. previas: folhas por cena. ritmo: trocas/min no vídeo pronto, com detector estrito que não conta zoom rápido como corte |

## A receita em números (medida na referência)
- **Ritmo:** 101 trocas de imagem por minuto (130 cortes em 77 s), plano médio 0,59 s, mediana 0,50 s, 10% dos planos com ≤ 0,17 s
  (entradas de tríptico, rajadas). Cada palavra forte troca a imagem. Só o gráfico de alta, o produto girando e o final passam de 1,6 s.
  O teste v1 (com vídeos) deu 92/min, média 0,64 s e mediana 0,54 s.
- **Voz:** 2,7 palavras/s, narração contínua.
- **Apresentador** (pedido do Felipe, 30/10; a referência não tem): aparece **10–15 vezes** num vídeo de ~2:30, **2–4 s** cada
  (gravação real até 5 s), nunca duas aparições seguidas. Alterna **tela cheia** (punch-in leve numa palavra forte) e **círculo**
  (cabeça e ombros num círculo de aro branco na metade de cima, com as fotos e vídeos da história trocando atrás em tela cheia).
  O chroma foi testado e reprovado pelo Felipe (30/10: "não ficou bom"); não use recorte do apresentador.
  Fica nas perguntas, opiniões, viradas e no fecho; o resto é imagem. Só entra em janela em que ele olha para a câmera.
  O apresentador fica LIMPO (Felipe, 30/10: "não precisa ter os mesmos efeitos das fotos"): sem retícula, cor de cinema, grão, vinheta
  nem aproximação lenta, só a cor da gravação e um punch-in seco numa palavra forte.
- **MESCLA de fotos e vídeos** (decisão do Felipe, 30/10: "a ideia é mesclar imagens com vídeos"):
  - ~60% FOTO (pessoa, lugar, logo, documento, produto parado) e ~40% VÍDEO (ação: andar, falar no palco, mãos trabalhando, máquina,
    plateia, bandeira tremulando), INTERCALADOS: nunca mais de 2 planos seguidos do mesmo tipo.
  - Histórico: a demo v1 era quase só vídeo ("quase não vi fotos"); a v2 era quase só foto. A certa é a v3, com a mescla (38% de vídeo).
  - Se só houver vídeo de um assunto, tire FOTOS dele: `imagens.py render/clips/<trecho>/0040.jpg:foto` vira a foto `f_<trecho>_0040`.
    Use o mesmo trecho também como vídeo em outro momento (`'clip:nome'` com outro `from`).
  - Vídeo sempre a 30 q/s até sair da tela: confira que o trecho (a partir do `from`) é mais longo que o tempo do plano na tela —
    no tríptico o painel fica até o fim da cena e no círculo o fundo fica até a próxima troca.
- **Aproximação:** todo plano entra aproximando (padrão do `fdPlano`: `mov: 'entra'`). Desde 03/11 é o **motor foco** (abaixo):
  o assunto da imagem fica no ponto do assunto (540, 760) e a aproximação é em volta dele (foto +9%, vídeo +5% em 0,5 s com a curva
  golpe, depois deriva lenta). As trocas, dentro da rajada e nas emendas, são corte seco no mesmo lugar; chicote só na virada.
  Histórico: motor golpe 02/11 (foto 1,03 → 1,15, chicote com blur em toda emenda; `FD_MOTOR = 'golpe'`), antes foto ~7% e vídeo 4%
  com `E.out` em 1 s (`FD_MOTOR = 'antigo'`).
- **Retícula suave:** pontos finos (~6 px na tela, a 45°) sobre a imagem INTEIRA e em cor. Não é P&B, é só uma textura de impressão.
  O `imagens.py` grava a retícula na foto (`RETICULA=.24`, `PERIODO=6`). Os vídeos ganham uma trama de pontos por cima
  (`window.FD_RETICULA_VIDEO = .16`), para foto e vídeo terem a mesma textura.
- **Cor:** de cinema, quente e saturada (laranja/âmbar com sombras verdes-azuladas), preto denso. Não é P&B. Cartões em branco `#fcfcfc`
  e vermelho `#f2212d`; verde vivo `#29e33a` só no gráfico de alta.
- **Legenda:**
  - fica no MEIO da tela e mostra palavra por palavra (entra seca), em grupos de até 3 palavras / ~19 letras. Na referência
    y ≈ 975; no motor foco ela é FIXA em y 1040 (`FD_FOCO.capY`), logo abaixo do assunto, em todas as cenas de imagem, faixa,
    tríptico, produto e cartão (o apresentador continua com a legenda no peito);
  - mistura **serifa itálica condensada** (Times itálico a 86%) nas palavras de ligação com **sans pesado** (Inter 800, apertado)
    nas palavras fortes, ex.: "*This South* **African**", "**he** *found* **one.**", "*with no clear* **plan.**";
  - branca com sombra leve; preta no cartão branco e branca no vermelho. ~64 px.
- **Cartões:** 7 em 79 s, de 0,7–1,5 s cada:
  - branco nas viradas e nos anos ("1989,", "he found one.", "So in 2002,", "Not bad for");
  - vermelho na virada ruim ("A struggling", "collapsed.").
- **Som:**
  - cama cinematográfica grave e estéreo, ~76 BPM, mi menor, presente (~14 LU abaixo da voz), constante;
  - sem efeito nos cortes; só um tique no contador do gráfico;
  - master −14 LUFS (a referência também mede −14).
- **Final:** "Follow FOUNDED for more." e tela preta com a marca do canal (caixa branca com o nome, 1,6 s).

## Motor foco (03/11/2026, PADRÃO para cenas novas; A/B aprovado pelo Felipe: "Aprovados")
**Aprovado pelo Felipe na vox-edit2 em 03/11/2026** ("B aprovado, aplica"; `projetos/teste_foco`, lado a lado em
`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\TesteFoco_AB_lado_a_lado_v1.mp4`) e adaptado aqui no mesmo dia.
Pedido dele: "a velocidade parece atrapalhar o acompanhamento... o dinamismo precisa ser perfeito para que os olhos possam
acompanhar, muitos efeitos se perdem na tela e não são focalizados". O problema medido não era a velocidade da câmera: era o que o
olho tinha de perseguir (panorâmica, assunto mudando de lugar, texto demais, legenda andando e borrando, itens entrando pelas bordas).

**A/B desta skill** (`projetos/teste_foco_founded`, trecho 0–24,47 s do `teste_founded`, mesmo material, áudio e tempo; cenas em
`work/ab_foco_A.js` e `work/ab_foco_B.js`, biblioteca da A em `work/lib_golpe_antes_foco.js`). Pasta
`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\`: `TesteFoco_founded_AB_lado_a_lado_v4.mp4` (A à esquerda, B à direita),
`TesteFoco_founded_A_v1_MASTER.mp4`, `TesteFoco_founded_B_v6_MASTER.mp4` (B v6 = a v5 com a bandeira do tríptico rodando até o fim;
B v1–v5 e lado a lado v1–v3 = passadas anteriores).
Medido sem o apresentador (0–7,95 + 10,11–24,47 s, 22,3 s):

| régua | A (motor golpe) | B (motor foco) | meta |
|---|---|---|---|
| saltos do olho (`medir_leitura`) | 37,7/min | 21,6/min | ≤ 45 |
| foco no miolo | 96,3% | 93,4% | ≥ 92 |
| quadros com panorâmica > 8 px/q | 1,1% | 0,6% | ≤ 10 |
| parte de zoom no movimento | 49,6% | 47,5% | ≥ 20 |
| viagem do olho | ~380 px/s | ~230 px/s | informação |
| quadros com o foco borrado | 31% | 25% | informação |
| 2+ blocos de texto (`texto_na_tela`) | 13,8% | 0% | ≤ 5 |
| letra mediana | 77 px | 77 px | ≥ 44 |
| letras andando > 3 px/q | 0,4% | 0% | ≤ 3 |
| câmera parada (`medir_motion`) | 25% + 14% (17,8% no total) | 27% + 15% (19,7% no total) | ≤ 20 |
| vídeo travado/lento (`clipe_parado`, vídeo inteiro) | 1 travado (0,63 s) | 0 / 0 | 0 / 0 |

O formato já era de zoom e corte (a A passava nas réguas de câmera). O ganho medido está no texto, nos saltos e na viagem do olho;
o resto aparece no vídeo: a legenda saiu de cima dos rostos, o logo que é a palavra aparece sozinho, o tríptico não desliza, o cartão
não traz a frase voando e o número do gráfico virou o assunto. O "miolo" caiu porque o assunto subiu para 760 (antes ficava no meio,
debaixo da legenda), e continua na meta.

**As regras, como ficaram neste formato**
1. **Um assunto por vez, grande, no ponto do assunto.** Cada plano diz onde está o assunto na imagem (`foco: [fx, fy]`, frações; rosto
   = entre os olhos e a boca; logo; produto) e o plano o põe em (540, 760) (`FD_FOCO.x/y`; em faixa e tríptico, a mesma proporção da
   caixa). Se a imagem não tem sobra para isso, o plano já começa aproximado o mínimo necessário (até `FD_FOCO.zMax` 1,25). O ritmo de
   uma imagem por palavra forte (~0,5 s) FICA: é o formato. O que muda é que o olho não precisa procurar o assunto a cada troca.
   Por que 760 e não o meio: a legenda fica no meio, e na referência o rosto fica na metade de cima com a legenda no peito; com o
   assunto no meio a legenda caía em cima do rosto (no teste, "Quando" no nariz, "Para você" na boca).
2. **Um texto por vez.** A legenda é o único texto e fica FIXA em y 1040 (`FD_FOCO.capY`), fora da câmera, sem andar nem borrar,
   com sombra larga e macia (sem caixa). Palavra-chave fica maior na própria legenda (`FD_CHAVE.add('falida')`, 1,22×), nunca num
   segundo texto. Quando a imagem já é a palavra (logo "AMD" no "AMD", placa "OpenAI"), o plano leva `semLegenda: true` e a legenda
   some. Número grande é o assunto daquele instante (`fdNumero`, a legenda some). A marca repetida em relevo do `produtoGira` e da
   `alta` virou textura (não é texto para ler) e sai de trás da legenda.
3. **A câmera chega já no assunto e aproxima.** Quadro 0 de cada cena já cheio (o 1º painel do tríptico já está aceso). Cada plano
   aproxima em volta do assunto (zoom, curva golpe) e deriva; a panorâmica (`mov: 'esq'|'dir'|'sobe'|'desce'`) não é mais usada.
   Emenda = corte seco no mesmo lugar. Chicote só na virada da fala, e só a SAÍDA: `chicote: 'dir'` na cena que chega (ex.: o cartão
   "Só que"); a cena seguinte já começa enquadrada. Tranco virou soco de zoom no assunto (`trancos` iguais, +amp×0,6%).
4. **Nada entra pela borda.** Tríptico: o painel acende no próprio lugar (pousa 1,06 → 1 em 0,22 s) e os anteriores escurecem
   (brilho 0,42), um por vez, de cima para baixo. Cartão: a frase nasce no lugar fixo (sem a mola de 110 px) e só deriva 3%.
5. **Efeito um por vez, no centro, com tempo.** Se dois caem juntos, fica um (no A/B o tranco do "mundo" saiu porque 0,3 s depois
   vem o chicote da virada "Só que"). Gráfico de alta: número + fonte no ponto do assunto, linha verde na metade de baixo, produto em cima dela.
   Produto girando: o ponto claro do recorte (chip, lata) no ponto do assunto e como pivô do giro; balanço caiu para 1/3, o giro fica.
6. **Ambiente mais baixo:** grão 0,06 (antes 0,14; mexe a cada quadro), câmera na mão 2 px (antes 3), sem blur fora do chicote.
7. **Vídeo real roda normal** (03/11, depois do A/B: "esse efeito de travar o vídeo é ruim"): 30 q/s do começo ao fim do plano, nunca
   preso no último quadro, nunca em câmera lenta. Cada componente diz ao `fdPlano` quando o plano sai da tela (`fim`); se o trecho
   acaba antes, o início recua sozinho para o vídeo acabar junto com o plano. Se nem do quadro 1 ele cabe, ou se alguém pôs
   `rate` < 1, sai `CLIPE CURTO`/`CLIPE LENTO` no console e o `fechar` acusa erro de JavaScript: troque o assunto antes do fim
   ou extraia mais longo. No A/B, a bandeira do tríptico (`amd_flag`, 52 quadros, `from` .6) acabava em 3,57 s e ficava presa
   0,63 s no último quadro (na A também); com `from: 0` roda até o fim.

**O que continua do motor golpe:** a curva golpe em cada aproximação (velocidade começa a ~45% do pico, pico em 20% do tempo,
desliza até zero), a mola onde algo nasce no lugar (pop do círculo do apresentador), o blur direcional SÓ no pico de um chicote e o
apresentador limpo em corte seco. **O que o motor foco substitui:** chicote automático em toda emenda (agora corte seco), a chegada
deslizando da cena seguinte, os painéis do tríptico deslizando com mola, a frase do cartão voando, o tranco de 6–10 px (agora soco de
zoom), aproximação de 12% na foto (agora 9%) e a legenda no centro exato sobre o rosto (agora fixa abaixo do assunto).

**API do motor foco** (tudo aditivo; cena antiga sem `foco` continua funcionando, centrada):
- `window.FD_MOTOR = 'foco'` (padrão) | `'golpe'` (motor de 02/11, quadro a quadro igual ao de antes) | `'antigo'` (antes de 02/11).
- `FD_FOCO = {x: 540, y: 760, capY: 1040, zMax: 1.25, zFoto: .09, zVideo: .05, grao: .06, mao: 2, chave: 1.22, corChave: null}`
  (mude por vídeo no topo das cenas: `FD_FOCO.capY = 1060`).
- Em todo op de plano (`rajada`, `rajadaAuto`, `faixa`, `tripla`, fundo do círculo do `presFD`):
  `{foco: [fx, fy], alvo: [x, y] (na caixa; padrão o ponto do assunto), zMax, semLegenda: true, pousa: 1.08, z, mov, from, ...}`.
- `produtoGira(beats, 'p_x', {marca, w, foco: [fx, fy] (no recorte), alvo: [x, y]})`.
- `fdNumero(r, S, 'US$ 1 tri', 'fonte · data', t0, t1, {y, s: 150, veu: .55, cor, sFonte: 28, largFonte: 860})` → `{set(txt), box}`;
  use no `build` de `rajada`/`faixa`/`tripla`: `build: (r, S, c) => fdNumero(r, S, '1,5 milhão', 'OIM, set/2026', c.w('B12', 'milh'), c.e('B13'))`
  (só dado conferido, com fonte e data, como no gráfico).
- `FD_CHAVE.add('palavra')` (sem acento, minúsculas): maior na legenda; `FD_FOCO.corChave = '#...'` pinta (só legenda branca).
- `fdSoco(lt, [[t, amp]])`, `fdMarcaFundo(r, 'MARCA', alfa, [y a evitar])`, `fdCamDeriva` (câmera das cenas sem planos) — internos.
- Legenda por cena (`S.cap`) ganhou `k` (escala; o cartão usa para a deriva de 3%).
- Op de plano `fim` (s da cena em que o plano sai da tela): os componentes já passam; só informe em cena própria com `fdPlano`.
  `rate` fica em 1 (abaixo de 1 é erro).

**Onde cada efeito acontece agora:** troca de imagem = corte seco com o assunto no mesmo ponto (y 760); aproximação = em volta do
assunto; chicote = só na saída de uma cena de imagem antes da virada pedida; soco = no assunto, no impacto; tríptico = de cima para
baixo, no lugar; número = no ponto do assunto, sobre véu; legenda = sempre y 1040, some quando a imagem ou um número é a palavra;
produto/gráfico = no ponto do assunto, a marca só como textura; apresentador = como antes (legenda no peito, círculo com pop).

## Motor golpe (02/11/2026, substituído pelo motor foco como padrão em 03/11; `window.FD_MOTOR = 'golpe'`)
**A/B desta skill APROVADO pelo Felipe em 02/11/2026** (`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_founded_AB_v1.mp4`). Desde 03/11 o padrão é
o motor foco (acima); `FD_MOTOR = 'golpe'` reproduz este motor quadro a quadro (conferido em 28 quadros do A/B do foco), menos o
trecho de vídeo que travava no último quadro (agora o início recua, em todos os motores), e `'antigo'` fica para reeditar vídeo de
antes de 02/11.
O Felipe achava os motions fracos e mandou duas referências do earn.edits (`C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4`,
cientista a 30 q/s com blur; `earn.edits_DYURMKHoayc.mp4`, Buffett a 16 q/s). Aqui o formato JÁ troca de imagem a cada ~0,5 s, então o
motor NÃO põe mais cortes. Ele muda como cada plano anda e como as cenas emendam:

| janela 16,4–26,8 s do teste (sem apresentador) | demo v6 (antes) | motor golpe | meta |
|---|---|---|---|
| plano médio | 0,80 s | 0,61 s | ≤ 1,2 s |
| câmera parada | 5% | 13% (a faixa letterbox mede baixo: 2/3 da tela são preto) | ≤ 20% |
| velocidade da câmera | 3,5 px/q | 4,9 px/q | ≥ 4 px/q |
| metade do caminho do movimento | 27% (`E.out`: arranque seco, cauda longa) | 36% | 28–45% |

- **Curva golpe** (`FDG.golpe`, a mesma `E2C.golpe` da vox-edit2): a velocidade começa a ~45% do pico, chega ao pico em 20% do tempo
  e desliza até zero. Ela substitui o `E.out`/`E.out5` na aproximação dos planos e no punch-in do apresentador.
- **Cada plano** (`fdPlano`): aproximação forte e CURTA (0,5 s, `dEnt`) que termina dentro do plano de ~0,5 s. Com 0,7 s a aproximação
  não terminava antes do próximo corte e o movimento virava um platô (metade do caminho em 45%). Depois vem a deriva (zoom .02/s) e a
  câmera na mão (3 px): nunca para.
- **Chicote na emenda** (automático): a cena de imagem sai acelerando nos últimos 0,2 s (zoom +40% e desliza pela sobra da imagem, sem
  mostrar borda preta) e a seguinte chega do lado oposto, freando em 0,4 s. Os sentidos alternam (esq, dir, cima, esq, baixo, dir).
  - Vale entre `rajada`, `faixa`, `tripla` e `cartaoCor`.
  - O apresentador (`presFD`), o final, o `produtoGira`, a `alta` e o `siteCor` ficam em corte seco.
  - No cartão liso não se vê movimento: quem chega é a frase (110 px, com mola em 0,45 s). Depois ela fica parada para ser lida.
- **Blur direcional** (filtro SVG por plano): só acima de ~10 px/quadro, então aparece no pico do chicote e some no deslize. A legenda
  é outra camada e NUNCA borra.
- **Mola** (`FDG.mola`, passa ~9% e assenta) nas entradas: painéis do tríptico deslizando de lados alternados, pop do círculo do
  apresentador e frase do cartão.
- **Tranco** nos impactos: `trancos: c => [[c.w('B15', 'falida') + .05, 9]]` (6–10 px) em `rajada`/`rajadaAuto`/`faixa`/`tripla`.
- **Opções:**
  - `chicote: false` na cena: sem chicote nas emendas dela.
  - `chicote: 'esq'|'dir'|'cima'|'baixo'` na cena: escolhe o sentido do chicote com que ela CHEGA.
  - `{chicote: 'dir'}` no op de um plano da `rajada`: chicote também DENTRO da rajada, do plano anterior para esse. Use só quando a fala
    pede ("mas", virada, contraste).
  - `{dEnt, deriva, mao, motor: false}` no op do plano.
  - `window.FD_MOTOR = 'antigo'` desliga o motor no vídeo inteiro.
- **Projetos antigos** têm a cópia velha da biblioteca em `work/<prefixo>_a.js` e não mudam. Copiando a nova, as cenas antigas
  funcionam sem mexer, já no motor foco (centradas, sem `foco`); para manter o golpe, `window.FD_MOTOR = 'golpe'` no topo das cenas.
- **No motor foco** estas opções mudam de sentido: `chicote: 'dir'` na cena = a cena ANTERIOR sai em chicote para a direita (a cena
  não chega deslizando); `{chicote: 'dir'}` no plano = só a saída do plano anterior; `trancos` = soco de zoom.
- **Teste:** `projetos/teste_founded`, janela 16,4–26,8 s (`out/motor_A.mp4`, `out/motor_B.mp4`, folhas `out/folha_motor_B*.jpg`;
  cenas originais em `work/*.bak_motor`). Lado a lado: `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_founded_AB_v1.mp4`.
- **Medir:** `<kit>\.venv\Scripts\python.exe ferramentas\medir_motion.py <proj> --de T0 --ate T1`. Meça janelas SEM o apresentador
  (ele fica limpo e de propósito quase parado). Desde 03/11 mandam as réguas de leitura (seção do motor foco); desta régua só vale a
  câmera parada ≤ 20%.

## Os componentes
- **`rajada(beats, [[c => t, fonte, op], ...])`** e **`rajadaAuto(beats, [fontes])`**: o miolo do formato. Planos em tela cheia trocando em corte seco.
  Intercale FOTO (`f_x`) e VÍDEO (`'clip:x'`), ~60/40; os dois já aproximam sozinhos.
  - `fonte` = asset (`f_x`, foto) ou `'clip:nome'` (trecho em `render/clips/`).
  - `op` = `{foco: [fx, fy], alvo, zMax, semLegenda, mov: 'entra'|'sai'|'fixo', z, from (s dentro do trecho), dur}`. Não use `rate`
    (vídeo real só a 30 q/s; `rate` < 1 dá erro). O `from` recua sozinho se o trecho acabaria antes do plano sair da tela.
    **`foco` em TODO plano** (motor foco): o ponto do assunto na imagem (frações da imagem inteira; foto de `imagens.py` = 1188×2112,
    trecho = 1080×1920). Monte uma folha das fontes com grade de 10% para ler os pontos (rosto = entre olhos e boca). `mov: 'esq'|'dir'|
    'sobe'|'desce'` (panorâmica) e `fx/fy` são do motor antigo; ainda funcionam, mas não use em cena nova.
  - O `rajadaAuto` troca sozinho em cada palavra forte com ≥ 0,3 s (ou em qualquer palavra depois de 0,6 s). Passe fontes suficientes:
    ~1 por palavra forte. Fonte a menos = o último plano estica.
  - Use partes diferentes do mesmo trecho (`from`) para variar sem repetir o quadro.
- **`cartaoCor(beats, {cor: 'branco'|'vermelho', chicote})`**: tela lisa com a legenda no lugar fixo (deriva 3%, sem mola). No máximo 1,5 s:
  frase mais longa vai metade em rajada. `chicote: 'dir'` no cartão de virada ("Só que", "Mas") = a cena anterior sai em chicote.
- **`faixa(beats, [[t, fonte, op], ...], {build})`**: faixa 16:9 no meio, preta em cima e embaixo. É o lugar do vídeo largo (telejornal, Bloomberg,
  entrevista) e de "momentos" (dinheiro, mãos). Trechos `largo` do `clipes.py` caem aqui sem corte. O `foco` vai para ~40% da altura
  da faixa (y ~900 na tela), acima da legenda (y 1040, dentro da faixa).
- **`tripla(beats, [f1, f2, f3] | [[f1, op], ...], {ts: c => [t1, t2, t3], build})`**: três painéis 1080×640 empilhados que acendem um a
  um no lugar (motor foco), de cima para baixo, os anteriores escurecendo. Use para "3 bilhões", listas e variações de produto. Para o
  olho andar menos: assunto do painel de cima embaixo dele (`alvo: [540, 420]`) e do painel de baixo em cima (`alvo: [540, 220]`).
- **`produtoGira(beats, 'p_x', {marca: 'RYZEN', w, foco: [fx, fy], alvo})`**: recorte do produto (`imagens.py modo produto`) flutuando e
  girando sobre fundo escuro com a marca repetida em relevo (textura). `foco` = o ponto claro do recorte (o chip, a lata), que vai para
  o ponto do assunto e é o pivô do giro; com ponto muito claro use `alvo: [540, 800]` (≤ ~250 px da legenda). No teste: w 420.
- **`alta(beats, {produto, marca, valores: ['US$ 3 bi', ..., 'US$ 1 tri'] | [56, 722, ...], suf, ts, fonte, s})`**: o número em serifa
  itálica trocando é o ASSUNTO (no ponto do assunto, com a fonte logo abaixo; tique em cada troca); a linha verde em degraus sobe na
  metade de baixo, atrás do produto. **`fonte` é obrigatória** (dado com data e fonte).
- **`siteCor(beats, 'd_loja', {y0, y1, rolar})`**: print de loja/site real (`pagina.py --url`). Motor foco: NÃO rola (seria panorâmica):
  o trecho `y0` (fração da página) fica no ponto do assunto e aproxima 7%; `rolar: true` volta a descer até `y1`. Use para preço e lançamento.
- **`fimMarca(beats, {nome: 'FELIPE DANTAS', perfil: 'perfil_felipedantasf', t: c => tempo})`**: tela preta com a marca de quem fala
  (caixa branca recortada, como o "FOUNDED"). O print REAL do perfil fica embaixo.
- **`presFD(beats, {forma: 'cheia'|'circulo', fundo: [fontes], z, punch: 1.08, fy, capY, d: 640, cx: 540, cy: 620, aro})`**: o apresentador.
  - **Tela cheia:** `z` aproxima (gravação aberta: z 1,5–1,6, `fy` .40–.45) e dá um punch-in de 8% numa palavra forte depois de ~1 s.
  - **Círculo:** diâmetro `d` 640 centrado em (540, 620), aro branco e sombra, entra com um pop curto; `z`/`fy` enquadram cabeça e
    ombros (plano aberto: z 1,7, fy .42); `fundo` = fotos/vídeos da frase em tela cheia, trocando nas palavras fortes.
  - Os dois sem efeito de foto no apresentador (presFD já faz). Tela cheia: legenda no peito (y 1440). Círculo: legenda logo abaixo dele (y = cy + d/2 + 190 ≈ 1130). Nunca no rosto.
  - Avatar do HeyGen: as peças do `apresentador.json` são as janelas do presFD, com 10–15 peças de 2–4 s.
- Legenda por cena: `S.cap = {y, x, s, cor, larg, k, modo: 'none'}` (no motor foco não mude `y` nas cenas de imagem: ela é fixa).
  Palavras: `FD_ITALICO.add('juice')` força itálico, `FD_FORTE.add('12')` força sans, `FD_CHAVE.add('falida')` deixa maior (chave).
- `fdPlano(p, fonte, S, op)` monta um plano dentro de qualquer caixa (para cenas próprias); `fdNumero(r, S, txt, fonte, t0, t1, o)` põe um
  número grande como assunto (véu, fonte embaixo, legenda some) no `build` de qualquer cena.

## Imagens: de onde vêm ~100 planos por minuto
O trabalho pesado do formato é juntar material. Para 2:30 são ~250 planos. Na ordem de preferência:
1. **Fotos reais** (o grosso): fundador, produto, lugares, escritório, notícias. Fontes: Commons, imprensa, sites das empresas,
   as que o Felipe mandar. Use `imagens.py ARQ:foto` (tamanho de tela + retícula suave).
2. **Fotos tiradas de vídeo real** (entrevista, telejornal, evento, propaganda): baixe o trecho (`ferramentas/baixar_trechos.py` +
   `clipes.py`) e pegue 2–4 quadros DIFERENTES de cada um como foto (`imagens.py render/clips/<trecho>/NNNN.jpg:foto`).
   Quadro de vídeo largo vai como `:faixa` para a `faixa`. Fotos seguidas do mesmo trecho precisam ser bem diferentes (outro ângulo ou
   assunto), senão parece que não trocou.
   Os trechos com AÇÃO ficam como VÍDEO (`'clip:nome'`), ~40% dos planos, intercalados com as fotos.
3. **Produto recortado** (`imagens.py ARQ:produto`) para `produtoGira`/`alta`.
4. **Prints reais** de loja, site e matéria (`pagina.py --url`).
5. **Imagem gerada:** primeiro no **Qwen local** (`gerar_qwen.py`, `Kit_Edicao_Vox_v2/guias/prompts_imagens.md` §2, `"modelo": "base"` para foto
   realista); Higgsfield só se o Qwen não der conta. **Vídeo gerado** continua no Higgsfield. Os dois só para cenas genéricas sem pessoa real (advogado de costas, sala de reunião,
   mãos com dinheiro), como faz a referência. Rosto de pessoa real ou marca por IA só com OK do Felipe (pergunte antes).

Cada imagem mostra a palavra dita: "lawyer" = advogado de costas, "bankrupt" = lata velha do produto, "California" = palmeiras no pôr do sol.
A primeira imagem é a pessoa ou o produto de que a frase fala.

## Passo a passo
1. **Projeto** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs). Com gravação, só o áudio entra
   no vídeo.
2. **Formato:** `python <esta pasta>/preparar_founded.py <nome> --prefixo xx [--avatar | --real | --sem-apresentador] [--sem-trilha]`.
3. **Corte e beats** como no kit (beats curtos, quebrando antes de nomes, anos e valores).
4. **Pesquisa:** cada fato, número e data com a fonte. O que estiver errado na fala NÃO vai para cartão nem gráfico (a legenda mostra a fala).
5. **Lista de planos** (marque as 10–15 aparições do apresentador primeiro, espalhadas, alternando cheia e círculo): tabela `cena | beats | fala | componente | fontes (uma por palavra forte)`. Confira 85–115 trocas/min,
   cartões ≤ 1,5 s, 5–8 cartões por minuto e meio, 1–2 faixas, 1 tríptico, produto girando e alta onde houver produto e número.
6. **Material:** trechos (`clipes.py`), fotos (`imagens.py`), prints (`pagina.py`). `export MSYS_NO_PATHCONV=1` antes no Git Bash.
7. **Cenas** em `work/xx_b.js`... (copie de `cenas_exemplo_foco.js`), com o comentário `// Sn — "fala"` e `foco` em todo plano (leia os
   pontos numa folha das fontes com grade). Depois `python montar.py <nome> xx`.
8. **Prévias:** `python previas.py <nome> --pontos 2`; abra `out/pv/cenas_*.jpg`. Confira em cada plano: assunto no ponto (y ~760), a
   legenda fora dos olhos e da boca (close fechado: `alvo` mais alto), legenda legível (fundo claro: suba o assunto), quadro 0 cheio,
   um efeito por vez.
9. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"`.
10. **Conferir:** `python ritmo.py <nome>` (85–115/min, plano mediano ~0,5 s), as réguas de leitura em janelas sem o apresentador
    (`ferramentas/medir_leitura.py out/master.mp4 --de T0 --ate T1`, `ferramentas/texto_na_tela.py <nome> --de T0 --ate T1`,
    `ferramentas/medir_motion.py`) e todas as `out/qa_emendas_*.jpg` e `out/qa_*.jpg`.
11. **Mensagem final** (português, curta): arquivos, créditos, avisos de checagem com fonte, **Fontes:** trechos (canal e data), fotos (autor e licença), prints.

## Armadilhas (vistas no teste)
- **Detector de cortes comum conta zoom rápido como corte:** ele dá 138/min na referência, quando o real é 101. Use o `ritmo.py` desta skill (estrito).
- **`rajadaAuto` com ≥ 0,38 s entre trocas deu 75/min** (lento). O padrão agora é 0,3 s + troca forçada após 0,6 s, e deu 92/min.
  Faltando fontes, o último plano estica: conte as palavras fortes.
- **Cartão longo parece parado:** "Para você ter uma ideia, quando ela assumiu em 2014," num cartão só deu 2,8 s. Divida: rajada + cartão.
- **Faixa letterbox:** o detector de cortes mal vê troca dentro da faixa (muito preto). Troque de trecho a cada ~0,7 s mesmo assim.
- **Chroma foi reprovado** (30/10): o apresentador recortado na frente das imagens "não ficou bom". A forma sobre as imagens é o círculo.
- **Gravação em plano aberto** (a Thainá no teste): tela cheia com z 1,55 e círculo com z 1,7. Sem isso ela fica pequena.
- **Proporção foto/vídeo:** v1 quase só vídeo e v2 quase só foto, as duas erradas. O Felipe quer MESCLA (v3, ~60/40). Conte antes de renderizar.
- **Fotos seguidas do mesmo trecho:** o `ritmo.py` não conta a troca (e o olho também quase não vê). Varie o assunto.
- **Recorte de produto com mão:** o ISNet mantém a mão que segura o produto. Combina com o formato (latas na mão da referência).
  Para produto solto, use foto de catálogo/fundo liso.
- **Dado no gráfico de alta precisa de data e fonte:** "passou de US$ 1 trilhão em 21/09/2026 (CNBC)". Se o dado mudou desde a gravação,
  avise o Felipe.
- **Última cena com câmera/zoom por `c.dur`:** a última cena vai até o fim do áudio. Numa demo parcial, ancore o tempo numa palavra.
- **Motor golpe, aproximação longa demais:** com `dEnt` .7 a aproximação não termina no plano de 0,5 s e o movimento vira um platô
  (régua: metade do caminho 45%). O certo é .5. Deriva .035 + mão 4 px emendavam tudo num movimento só; agora são .02 e 3 px.
- **Motor golpe, legenda sobre blur claro:** no pico do chicote, uma palavra itálica branca sobre céu borrado quase some (1–2 quadros).
  Como é a 1ª palavra da frase e ela fica na tela, passa; numa palavra-chave, escolha um plano mais escuro ou use `chicote: false`.
- **Componente novo:** copie de novo `componentes.js` para `work/<prefixo>_a.js` (o preparar faz isso) antes de montar.
- **Motor foco, close fechado:** com o rosto ocupando a tela (`f_su_retrato`, `f_su_jovem` no teste), o ponto do assunto padrão deixa a
  legenda na boca ou no queixo. Suba o rosto: `alvo: [540, 600–680]` e, se precisar, `zMax: 1.4`. Em close muito fechado a legenda
  ainda encosta no queixo; olhos e boca ficam livres. Prefira plano médio (rosto + ombros), como a referência.
- **Motor foco, duas imagens parecidas seguidas:** com o assunto no mesmo ponto, duas fotos da mesma cena (as duas silhuetas da AMD no
  "falindo") ficam quase iguais e a troca some (o `ritmo.py` não conta). Faça a 2ª um plano mais FECHADO do mesmo assunto no mesmo
  ponto (`alvo: [540, 700], zMax: 1.4`): vira um punch-in que se vê, sem o olho sair do lugar. Melhor ainda: assunto diferente.
- **Motor foco, `ritmo.py` mais baixo que antes:** no A/B deu A 81/min e B 74/min com as MESMAS trocas: o detector contava cada chicote
  de emenda 2–3 vezes na A (o borrão parece corte). Para o ritmo real, conte as trocas do plano de cenas.
- **Vídeo preso no último quadro / câmera lenta:** trecho curto no tríptico (o painel fica até o fim da cena), no fundo do círculo ou
  num plano longo da rajada acabava e ficava parado (o motor prendia em n−1). Agora o início recua; se nem assim cabe, sai `CLIPE
  CURTO` no console. `clipe_parado.py` acha o resto. Em 03/11, `founded1` e `fernando9` deram 0 travado e 0 lento.
- **Motor foco, ponto muito claro longe da legenda:** chip, lata metálica ou letreiro aceso a > 300 px da legenda fazem o olho pular
  entre os dois a cada palavra (a régua marca salto). Deixe o ponto claro a ≤ ~250 px da legenda (`alvo` y ~800 no `produtoGira`).
- **Motor foco, tríptico:** acender os painéis de cima para baixo custa 2 saltos do olho por tríptico (o assunto muda de lugar de
  propósito) e a câmera mede "parada" enquanto 2/3 da tela estão pretos. Faz parte do formato: um tríptico por vídeo basta.
- **Motor foco, cartão e câmera parada:** cartão liso mede 100% de câmera parada (não há textura para o fluxo óptico; a deriva da frase
  não aparece). Com cartões de ≤ 1,5 s e o tríptico, conte a câmera parada no vídeo inteiro sem o apresentador (no teste: 20,0%,
  no limite; a A tinha 17,8% porque a frase do cartão voava e os painéis deslizavam). Não tire o grão para enganar a régua.
- **Motor foco, imagem que já é a palavra:** logo, placa ou manchete que mostra a palavra dita + a legenda com a mesma palavra = dois
  textos iguais. Use `semLegenda: true` nesse plano.
- **Motor foco, `rajadaAuto` com fonte sobrando:** a fonte a mais fica em 1e9 e nunca aparece; o motor foco põe a saída em chicote no
  último plano que APARECE (no motor golpe o chicote ia para a fonte sobrando e a saída não se via; mantido assim no `'golpe'`).
- **Motor foco, marca em relevo como texto:** as 6 linhas "RYZEN"/"AMD" eram texto no DOM e contavam como 6 blocos na régua
  (`texto_na_tela` 13,8% com 2+ blocos na A). No motor foco elas são uma imagem (`fdMarcaFundo`) e a linha atrás da legenda sai.

## Checklist antes de entregar
- [ ] `ritmo.py`: 85–115 trocas/min, plano mediano ~0,5 s; só contador, produto girando e final passam de 1,6 s.
- [ ] Motor foco (padrão) em janelas SEM o apresentador (`--de/--ate`): `medir_leitura.py` saltos do olho ≤ 45/min, foco no miolo
      ≥ 92%, quadros com panorâmica > 8 px/q ≤ 10%, zoom ≥ 20% do movimento; `texto_na_tela.py` 2+ blocos ≤ 5%, letra mediana
      ≥ 44 px, letras andando > 3 px/q ≤ 3%; `medir_motion.py` só a câmera parada ≤ 20% (no vídeo inteiro sem apresentador).
- [ ] `ferramentas\clipe_parado.py <proj>`: **0 TRAVADO, 0 LENTO** (vídeo real a 30 q/s até sair da tela, nunca preso no último
      quadro; o console da prévia não pode ter `CLIPE CURTO`/`CLIPE LENTO`).
- [ ] Todo plano com `foco`; assunto no mesmo ponto (y ~760); legenda fixa em y 1040 fora dos olhos e da boca; `semLegenda` onde a
      imagem é a palavra; emendas em corte seco; chicote só na virada pedida; tranco = soco; tríptico acendendo no lugar; um efeito por vez.
- [ ] Cada palavra forte com a sua imagem, literal; a primeira imagem é a pessoa ou o produto citado; rosto real gerado por IA só com OK do Felipe (pergunte antes).
- [ ] Fotos e vídeos intercalados (~60/40, nunca 3 seguidos do mesmo tipo), todos com aproximação e retícula suave; cor de cinema (não P&B); cartões de 0,7–1,5 s.
- [ ] Apresentador 10–15 vezes (montar.py confere), 2–4 s cada, alternando tela cheia e círculo, sempre olhando a câmera, nunca duas aparições seguidas.
- [ ] Legenda no meio, palavra por palavra, itálico + sans pesado; nas aparições, no peito (nunca no rosto).
- [ ] Número na tela = dado conferido, com fonte e data.
- [ ] Cama cinematográfica, −14 LUFS, checa_fala sem palavra perdida.
- [ ] Final com `fimMarca` (marca + perfil REAL de quem fala). Versão `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
