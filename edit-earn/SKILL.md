---
name: edit-earn
description: Formato "edit earn" (minidocumentário de mistério em camadas), vertical 9:16, com o Kit_Edicao_Vox_v2. Replica o anúncio do earn.edits (cientista russa, out/2026) pela receita do projeto After Effects original. Cada frase vira um MUNDO em camadas que nunca para, com o personagem principal CENTRADO entrando da câmera sobre o fundo desfocado, com etiqueta vermelha do nome e objetos-metáfora subindo atrás dele; P&B na virada. Matérias REAIS impressas na mesa com marca-texto e círculo vermelho; tipografia (data digitada, palavra por palavra na planta azul, palavras empilhando, letras 3D); fotos P&B na parede com flash; sala com TV; fechadura; íris; push vertical. Sem legenda corrida, malha de 6 px, cores vivas. Trilha de trap documental (pulso, 808, pad) com whoosh e impactos. Motor foco (03/11/2026) — um assunto por vez no centro, um texto por vez e parado, câmera que aproxima em vez de arrastar, troca no lugar e um efeito de cada vez. Use quando o Felipe pedir "edit earn", "formato earn.edits", "minidocumentário/mistério em camadas", "igual ao vídeo da cientista russa" ou mandar esse vídeo como modelo, com gravação ou áudio da ElevenLabs + HeyGen.
---

# Formato edit-earn (minidocumentário em camadas, um mundo por frase)

Modelo medido quadro a quadro, por fluxo óptico e no áudio do vídeo que o Felipe mandou em 31/10/2026
(`C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4`, 42,7 s, 720×1280, 30 fps). É um anúncio da EarnEdits (projetos de After Effects)
feito no próprio estilo: a morte misteriosa de uma cientista russa contada com imagens geradas por IA compostas em camadas.
Depois o Felipe conseguiu o **projeto After Effects original** (`siberias-mysterious-lab-death-the-plague-scare.zip`). O `.aep` foi lido
direto do binário, com todas as chaves, curvas, expressões e efeitos, e o motor (v3) passou a seguir essa receita (seção "A receita do projeto After Effects").

**Antes de planejar, abra os três arquivos desta pasta:**
- `referencia_formato.jpg`: 21 quadros da referência, rotulados.
- `ANALISE_REFERENCIA.md`: plano a plano, câmera, cor, textura, tipografia e som, com os números.
- `exemplo_teste.jpg`: o que estes componentes produzem (projeto `projetos/teste_earn`, corte "Rei do Varejo" do Fernando, demo v9 de 40 s).

Esta skill complementa o kit. Corte, beats, render, mix e entrega seguem `<kit>\CLAUDE.md`. As regras fixas do Felipe estão na memória:
fala nunca muda; dado na tela com fonte e data; IA nunca faz rosto de pessoa real; perfil REAL no CTA; versão nova `_vN`;
entrega = tiktok ≤ 29 MB + MASTER. Rode tudo com o Python do kit (`<kit>\.venv\Scripts\python.exe`). Em outro PC, a variável `VOX_KIT`
aponta para a pasta do kit; sem ela, vale `H:\Edição Claude\Kit_Edicao_Vox_v2`.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca (vira `work/<prefixo>_a.js`): motor foco (`foco`, `eaFoco`, `eaNumero`), motor golpe (`golpes`, `EA_GOLPE`, `EA_MOLA`), `mundo`, `digitado`, `palavras`, `pilha`, `letras3D`, `jornal`, `parede`, `salaTV`, `presEA`, `perfilEA`, passagens `ea:sobe` / `ea:matte:<nome>` / `ea:wipe`, rig de câmera e curvas do AE, flash + onda, grade/ruído/vinheta |
| `cenas_foco_exemplo.js` | **as 8 cenas B do A/B "motor foco" (03/11/2026): o modelo de toda cena nova** (personagem entrando da câmera com etiqueta fixa e placa subindo atrás, foto, digitado parado, jornal com o trecho em foco e corte casado, palavras, pilha, fechadura) |
| `cenas_exemplo.js` | as 18 cenas da demo (0–40 s, antes do motor foco), comentadas. Use para ver os componentes; a estrutura de cena nova vem do `cenas_foco_exemplo.js` |
| `estilo.css` | fontes (Playfair Display Italic, Fjalla One, Poppins 600/700/900, Times do Windows), sem legenda nem barra, grão e vinheta |
| `fonts/` | as fontes livres (OFL) que o preparar copia para o projeto |
| `texturas/` | `f_mesa_madeira.jpg` (mesa, CC0), `f_tv_familia.jpg` (sala de 1958, domínio público) e, do projeto da EarnEdits, `ea_grade.png` (grade de 6 px tingida), `ea_ruido.png` (grão) e `mattes/` (10 mattes de transição). Origem e licença em `CREDITOS.txt` |
| `preparar_earn.py` | prepara o projeto: fontes, CSS, componentes, perfis, texturas, `render/eamattes.js` (mattes embutidas), `clipn.js`, `etapas.json` (montar + trilha_earn) |
| `imagens_ea.py` | `foto` (cobre a tela), `pb` (P&B de arquivo), `logo`, `camadas` (separa personagem e fundo da MESMA foto: BiRefNet + LaMa) |
| `clipes.py` | trechos de vídeo → `render/clips/<nome>/` a 30 fps em 9:16 (o mesmo do edit-founded) |
| `trilha_earn.py` | cama de trap documental (pad + pulso ~118 BPM + 808 nos drops) a ~5,5 dB da voz, whoosh em todo corte, riser + impacto nas viradas, golpe nos punch-ins, batida de 81 BPM no final; mix −14 LUFS |
| `montar.py` / `previas.py` / `ritmo.py` | montar: sintaxe, palavras, beats, apresentador, ritmo previsto. previas: folhas por cena. ritmo: trocas/min e trechos parados no vídeo pronto |
| `medir.py` | o vídeo pronto contra as metas da referência: movimento (fluxo, quadros parados, picos de mudança; no motor foco viram informação), cor e CENTRALIZAÇÃO do personagem (BiRefNet) |

## As 8 regras que fazem o formato funcionar (correções do Felipe na demo, 31/10; regra 6 em 02/11; regras 7 e 8 em 03/11)
1. **Personagem principal CENTRADO, sempre em movimento.** Na referência o centro do assunto fica a 1,6% do meio da tela na mediana
   (95% dos quadros a menos de 8%), a ~55% da altura, ocupando ~56% da altura. Tudo que importa vai para o meio: recorte com `tam` fica
   centrado (`topo` = altura da cabeça), objetos sobem ATRÁS da cabeça e centrados (um de cada vez, como o caixão), a câmera só aproxima,
   afasta e gira em volta do centro (nada de pan lateral arrastando o assunto). Trecho de vídeo real: recorte o 9:16 centrado na pessoa (`fx` do clipes.py).
2. **Nada para.** Toda cena chega de mais perto e sai acelerando para dentro do corte seguinte (`eaRampa`), e no meio do plano a câmera
   segue: RECUO contínuo nos 2/3 iniciais do vídeo e APROXIMAÇÃO no terço final, com giro lento. Recortes respiram em 3D (`vida3d`),
   poeira de luz flutua, punch-ins com golpe nas palavras fortes (`socos`). Metas: fluxo médio ≥ 1,2 px/quadro, ≤ 15% de quadros quase
   parados, ≥ 120 picos de mudança/min (`medir.py`). **No motor foco (regra 7) "nada para" = deriva de zoom contínua + o mundo andando
   por baixo do texto parado**; aí essas três metas do `medir.py` viram informação (o trecho lido fica parado de propósito) e o que vale
   é câmera parada ≤ 20% (`medir_motion.py`) e nenhum trecho parado ≥ 0,5 s (`ritmo.py`).
3. **Cor que salta:** looks saturados por mundo + luz colorida andando por cima (`eaLuz`) + fotos com contraste local e vibrance
   (`imagens_ea.py`). Personagem real se mexe com VÍDEO real (trecho de telejornal), não só foto.
4. **Trilha presente:** cama de trap documental (pulso grave tipo batimento, 808 saturado nos drops, pad escuro) a ~5 dB da voz — não um
   drone escondido. Whoosh em todo corte, riser + impacto nas viradas, golpe nos punch-ins.
5. **Texto na tela tem de ser LIDO, e o olho sabe onde focar** (regra do Felipe, 31/10). Vale para matéria, verbete, print, documento,
   digitado, palavras e letras 3D:
   - **Legível no celular:** o trecho que importa aparece com letra de pelo menos ~44 px na tela 1080×1920 (aproxime a câmera ou divida a
     página em dois planos), parado o bastante para ler (≈ 0,3 s por palavra do trecho, nunca menos de 1 s) e sem borrão de movimento
     nem onda por cima enquanto é lido. Contraste forte com o fundo; nada passando na frente.
   - **Foco guiado:** em toda página há UM ponto de foco por vez, no tempo da fala: marca-texto e/ou círculo vermelho no trecho dito, a
     câmera centrada nele (no meio da tela, regra 1) e o resto da página mais escuro ou desfocado. Título e veículo podem ser lidos de
     relance; o corpo do texto em volta é textura, não para ler.
   - Página inteira pequena, com o trecho marcado ilegível, não vale: aproxime até o trecho marcado ser a maior coisa na tela.
6. **Foto parada tem vida própria quando a fala tem ação** (02/11, aprovado): carro anda com as rodas girando, estrada e paisagem
   correm, pessoa caminha e vira a cabeça, porta sobe, recorte e palavra nascem como papel (seção "Vida na foto parada").
7. **O olho acompanha: motor foco em TODA cena nova** (03/11, A/B aprovado na vox-edit2 e adaptado aqui; seção "O motor foco"): um
   assunto por vez, grande e no centro; um texto por vez e PARADO enquanto se lê; a câmera chega já no assunto e faz no máximo um
   movimento por frase, de ZOOM (panorâmica só para trocar de assunto); nada entra pela borda (troca no lugar); cada efeito sozinho e
   no centro; ambiente mais baixo. Medir com `medir_leitura.py` e `texto_na_tela.py`.
8. **Vídeo REAL roda sempre normal** (03/11, o Felipe: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal"). Um trecho
   de vídeo real (`clip:`) anda sempre a 30 q/s:
   - nunca fica preso no último quadro;
   - nunca anda em câmera lenta por quadro repetido (`rate` < 1 vira 1);
   - nunca fica parado esperando começar;
   - nunca anda em posterize/stop-motion (o `posterize` da cena anda só a câmera, nunca o quadro do clipe; na TV também).

   Clipe mais curto que o tempo na tela: troque o assunto antes de ele acabar, comece a cena com ele já rodando (`from`) ou use outro
   trecho. O motor puxa o começo para trás para o clipe acabar junto com a tela e, se nem assim couber, volta ao início (avisa no
   console). Isso é o último recurso, não o plano.
   Régua: `<kit>\ferramentas\clipe_parado.py <proj>`, com meta de 0 TRAVADO e 0 LENTO.

## A receita em números (medida na referência)
- **Fala:** narrador grave e lento, 2,2 palavras/s. As frases terminam com 0,3–0,8 s de respiro, e a passagem cai nesse respiro.
  O corte do Felipe continua justo; use `GAP_BEFORE` (0,18–0,3 s) só em 2–4 viradas de mundo, onde entra um boom.
- **Ritmo:** 19 planos em 42,7 s (**26,7 por minuto, média 2,25 s, o mais longo 4,3 s**). Dentro de cada plano há eventos
  (camada entrando, etiqueta, palavra, marca-texto, círculo): **um estímulo novo a cada ~0,65 s**. Plano sem evento passa de 2,5 s? Ponha um.
- **Câmera:** nunca para. O começo do plano é forte (60–85% do movimento no 1º quarto), depois a câmera deriva devagar e muitas vezes
  acelera de novo no fim para dentro do corte seguinte. Nos 2/3 iniciais domina o RECUO (começa perto e revela); no terço final, a
  APROXIMAÇÃO (close, fechadura, CTA). Mesas e planos vistos de cima giram 20–35°. Borrão de movimento em todo movimento rápido.
- **Personagem:** a camada recortada entra da câmera (começa ~2,6× maior, borrada, vinda de baixo) e assenta em ~0,5 s, com o foco
  puxando. Na referência ele se mexe porque é vídeo gerado a partir da imagem (gesto discreto); aqui o movimento vem de vídeo REAL
  (trecho de telejornal) ou do parallax das camadas.
- **Texto:** só ~20% do tempo e só em tipografia, jornal e etiqueta. **Sem legenda corrida.**
- **Cor:** cada cena tem um mundo de cor (frio, quente, verde-azulado, vermelho). **P&B = morte, dúvida, negação**; o vermelho é o único
  acento que sobrevive. Vinheta forte nas cenas escuras.
- **Textura:** malha regular de 6 px sobre TODAS as imagens (10–26 níveis de contraste na referência). O apresentador fica sem malha e sem grão.
- **Som** (separado com Demucs; a 1ª leitura, só pelos lados do estéreo, não via a bateria e o baixo, que ficam no centro):
  bateria e baixo a −18 dB RMS, mais fortes que a voz em energia. É uma cama de trap documental: pulso grave contínuo (40–150 Hz) que vira
  um pulso regular de ~118 BPM na virada; 808 saturado (Ré1/Dó#1, harmônicos até 1 kHz) sustentado 2–3 s no gancho (0 s), no jornal
  (11,6 s) e no close P&B (32,4 s); pad escuro em 150–600 Hz. A cama fica a −23 dBFS entre as palavras, ~4,4 dB abaixo da voz (dissect).
  Swish em quase todo corte, boom nas viradas, papel voando, sopro subindo antes do flash e disparo no flash; batida de 81 BPM só no CTA.
  Referência −15 LUFS; o kit entrega −14.

## A receita do projeto After Effects (lida do .aep em 31/10; o motor v3 copia)
O `.aep` (RIFX) foi lido direto: 33 comps, 156 efeitos, todas as chaves com a curva e as expressões (`wiggle` em quase toda camada).
Resumo do que ele ensina e onde está no motor (detalhes e números em `ANALISE_REFERENCIA.md`):
- **Comp Main (42,6 s):** as 12 comps de cena em sequência, quase sempre em corte seco; só 3 passagens têm efeito (Linear Wipe de 1 s,
  CC Light Wipe de 1 s na virada e na entrevista). Por cima de tudo: "Overlay Texture 02" (grade de 6 px tingida para 209,233,255) em
  soft light a 70%, "Noise.png" em soft light, **Gaussian Blur 0 → 30 → 0 px em ±0,167 s em CADA corte** e Brightness com `wiggle(5,10)`.
  → `renderCaptions` (grade e ruído do projeto, `eaPulso`, brilho tremendo).
- **Câmera = rig de 3 níveis** (câmera 50 mm, zoom 1500 px): o Camera Controller faz a ENTRADA (≈1,3 s, curva 33%→100%: chega de cima
  e de perto e assenta), um null do meio faz o RECUO contínuo (75%/75%) e o null de cima faz a SAÍDA no último 1 s (curva 100%→1,7%:
  acelera recuando, descendo e girando 15–20° para dentro do corte). Nulls com `wiggle(1,15)`, câmera com `wiggle(.5,25)`. → `eaRampa`
  e as curvas `EA_ENTRA`, `EA_SAI`, `EA_SUAVE`, `EA_RAPIDA` (bézier do AE com velocidade 0, em `aeEase`).
- **Toda camada treme** com wiggle: pessoas `wiggle(3,10)` no Y, palavras `wiggle(3,25)`, primeiro plano `wiggle(2,15)`, objetos e fotos
  `wiggle(.5,15)` + giro `wiggle(1,3)`; bonecos com cabeça, mãos e boca em `loopOut()` (±7–10° em 1,5–2,5 s). → `eaVida` + `aeWiggle`.
- **Fundos com CC RepeTile (cópias espelhadas)** para a câmera recuar e girar sem mostrar borda. → `repete` (padrão em camada `cobre`).
- **Viradas dentro da cena = Flash + Wave V2 (JerryFlow):** sólido branco em overlay 100% → 0 em 5 quadros + Turbulent Displace 36 → 0 px,
  Motion Tile sacudindo (+3,25% da altura → 0 em 0,467 s, bordas espelhadas) e Directional Blur 55 → 0. → opções `flash` / `onda`.
- **TV e "história" a 16 q/s** (Posterize Time). → `posterize: 16`.
- **Looks:** CC Light Sweep (faixa larga), Gradient Ramp radial em soft light ("Depth"), Glow e Light Rays, Shadow Studio (sombra longa
  de fotos e recortes), Curves/Looks quentes ou frios. → `eaLuz`, `luz`, `cor`.
- **Parede ("07 History"):** a câmera começa LONGE (z −1940 → 0 em 3 s, curva 2%→100%: dispara no corte e freia devagar), as 4 fotos voam
  dos cantos em 2 s (33%→100%, giro ±20° → 0) e só aparecem ~0,45 s depois do corte; no fim recua 490 e gira 20°. → `parede`.
- **10 mattes de transição** (pasta "Transitions": tinta, líquido, centro, redonda, "up"; 0,27–2,3 s). → `tr: 'ea:matte:<nome>'`.

## O motor foco (03/11/2026, A/B aprovado pelo Felipe: "Aprovados") — padrão de TODA cena nova
**Aprovado pelo Felipe na vox-edit2 em 03/11/2026 ("B aprovado, aplica") e adaptado aqui** (A/B em `projetos/teste_foco_earn`). O pedido:
"a velocidade parece atrapalhar o acompanhamento... o dinamismo precisa ser perfeito para que os olhos possam acompanhar, muitos efeitos
se perdem na tela e não são focalizados". A medição (BukeleHaiti_v1 contra a referência deste formato, a cientista do earn.edits) mostrou
que NÃO era a velocidade da câmera (mesmo pico de chicote, mesmos chicotes por minuto). Era o que o olho tinha de perseguir: panorâmica em
vez de zoom, o foco do olho pulando, dois ou mais textos ao mesmo tempo, letras andando e borrando no chicote, itens entrando pelas bordas
com mola e o começo de cena vazio enquanto as coisas chegavam.

A/B nesta skill: trecho 15,56–32,86 s do `teste_earn` (S7–S14: Mansur + placa do Mappin, relógio, "NOVE MESES DEPOIS", verbete da Mesbla
em dois planos, planta azul, pilha, fechadura), com o mesmo material, o mesmo áudio e os mesmos cortes.
| medida (régua) | A, como era | B, motor foco | meta | referência |
|---|---|---|---|---|
| saltos do olho por minuto (`medir_leitura.py`) | 79,8 | 34,7 | ≤ 45 | 45 |
| foco no miolo da tela | 78,6% | 99,2% | ≥ 92% | 95% |
| quadros com panorâmica > 8 px/q | 16,3% | 3,3% | ≤ 10% | 10% |
| parte do movimento da câmera que é zoom | 31,4% | 39,7% | ≥ 20% | 30% |
| quadros com o foco borrado (informação) | 36,8% | 24,3% | — | — |
| 2+ blocos de texto ao mesmo tempo (`texto_na_tela.py`) | 0,6% | 0% | ≤ 5% | — |
| letras andando > 3 px/q | 58,3% | 1,4% | ≤ 3% | — |
| câmera parada (`medir_motion.py`) | 15% | 9% | ≤ 20% | 10–25% |
| `medir.py`: fluxo / quase parados / picos por min (informação no foco) | 1,35 / 25% / 156 | 0,67 / 43% / 59 | — | 1,48 / 15% / 183 |
| `medir.py`: assunto centrado (desvio mediano / quadros a < 8%) | 0,004 / 100% | 0,010 / 92% | ≤ 0,025 / ≥ 90% | 0,016 / 95% |

Vídeos em `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\`: `TesteFoco_earn_AB_lado_a_lado_v1.mp4` (A à esquerda, B à direita, áudio da
B), `TesteFoco_earn_A_v1_MASTER.mp4` e `TesteFoco_earn_B_v4_MASTER.mp4` (a B final; v1–v3 foram as rodadas de ajuste). Cenas: `cenas_foco_exemplo.js`
(= `projetos/teste_foco_earn/work/ab_foco_B.js`; a A em `ab_foco_A.js`).

**As regras, como ficaram neste formato:**
1. **Um assunto por vez, grande e no centro.** O personagem continua entrando DA CÂMERA (é zoom centrado, fica), com `t: -.12` para o
   quadro 0 já mostrá-lo. Os objetos-metáfora (camadas `atras`) continuam subindo por trás da cabeça, um de cada vez, no centro. Fundo
   bem desfocado e a meia luz (não disputa o olho). A foto da matéria fica a meia luz fora do plano `'foto'`.
2. **Um texto por vez, PARADO enquanto se lê.** Etiqueta do nome, digitado, palavra da planta, pilha, letras 3D, número gigante e barra do
   perfil ficam FORA do mundo: não andam com a câmera nem borram no chicote, e só o mundo de fundo anda. No `jornal` (o texto É o mundo),
   a câmera vai ao trecho e FICA, e o resto da página apaga para .3. Ficam em tinta só o título no plano do título, o trecho do plano da
   câmera e as marcas e o círculo depois que passam. Durante o movimento nada fica aceso: a letra nunca anda acesa.
3. **A câmera chega já no assunto** (de 1,14× para o foco em .5 s, começando .12 s antes do corte) e faz no máximo UM movimento por frase,
   ≥ ~1 s depois do anterior. ZOOM para dar ênfase (mesmo x, y com z maior); panorâmica só para trocar de assunto. Deriva contínua de zoom
   (∓5%/s; no jornal 2%/s), mão 4 px (jornal 3), sem tranco; os socos continuam como zoom de ênfase. A saída é um zoom curto que o corte
   pega (`sai: false` quando a passagem seguinte já empurra, como `ea:sobe`, ou no corte casado do jornal).
4. **Nada entra pela borda.**
   - Entradas `esq/dir/cima/baixo/canto` viram `'pousa'` (1,08 → 1 em .22 s, no lugar) e as saídas viram `'some'` (some no lugar).
   - A página do jornal já está na mesa no quadro 0 (`'pousa'` 1,03) e, quando sai, `'afunda'` (assenta e some) em vez de cair da tela.
   - Na parede, as fotos estão pregadas desde o quadro 0.
   - O assunto anterior escurece no lugar (`apaga`).
5. **Os efeitos continuam, um de cada vez e no centro, com tempo para ser vistos.** Continuam flash + onda, P&B, pincel e fechadura. No
   jornal a ordem é marca-texto → círculo → marca, sempre depois que a câmera chegou, e o punch-in vem depois da marca. A placa sobe
   junto com o movimento da frase. As passagens (`ea:sobe`, matte, wipe, íris) continuam; o wipe fica curto (`trDur` .35) para não haver
   dois assuntos na tela por muito tempo.
6. **Ambiente mais baixo:** poeira ×.4, wiggle das camadas ×.25, `vida3d` ×.5, brilho tremendo e cintilação retrô ×.4. O borrão de corte
   do projeto fica pela metade (15 px) nos cortes que entram numa cena foco, e some no corte casado do jornal.
7. **Vídeo real roda sempre normal** (regra 8): o assunto que é um trecho de vídeo tem de durar até a troca seguinte ou o fim da cena,
   a 30 q/s. Não use `posterize`, `rate` < 1 nem um `t0` depois de a camada aparecer para "esticar" um clipe curto: troque o assunto
   no lugar antes de ele acabar. Confira com `clipe_parado.py <proj>` (0 TRAVADO, 0 LENTO).

**Como ligar:** opção de cena `foco` em `mundo`, `digitado`, `palavras`, `pilha`, `letras3D`, `jornal`, `parede`, `salaTV` e `perfilEA`.
- `foco: true`: câmera padrão do componente.
- `foco: c => [[t, x, y, z, d], ...]`: os focos da câmera. `x, y` = ponto do mundo no centro da tela (o centro do ASSUNTO), `z` = zoom,
  `d` = duração do movimento (.8). O 1º foco é a chegada; cada seguinte começa .2 s antes de `t`. Personagem: `x = 540` sempre.
- `foco: {focos: c => [...], mao, deriva, chega: {z, x, y, r, d} | false, sai: {...} | false, vida, vida3d, poeira, pisca, apagado, pulso}`,
  mais as opções do componente (`grupos`/`tilt` no letras3D, `fotos` na parede, `y`/`giro` na pilha).
- `golpes: c => eaFoco(c, focos, op)` também liga o modo foco (o mesmo padrão da vox-edit2 com `e2Foco`).
- No jornal o foco aceita `[t, {alvo: 'titulo' | 'trecho exato' | 'foto', dx, dy, z}, d]` ou x, y explícitos. Num corte casado, use os
  mesmos x, y nas duas cenas (exemplo: `TRECHO_MESBLA` no `cenas_foco_exemplo.js`).

**Componentes e opções novos** (fim da seção do motor golpe no `componentes.js`; assinaturas exatas):
- **`eaFoco(c, focos, {chega, sai, deriva, mao, base})`** → spec do motor golpe com `foco: true`. Padrões: `chega {z: 1.14, d: .5}`,
  `deriva` ∓.05, `mao` 4, `sai {z: .87 | 1.16, r: ±2,5, y: 0, t: .2, d: .7}`; `base: true` = sem focos (a câmera do componente segue por baixo).
- **`eaNumero(r, S, c, 'TEXTO', 'fonte · ano', t0, t1, {y: 900, s: 150, veu: .6, fonte: EA_COND, sFonte: 32})`** (no `build` de um `mundo`):
  número ou palavra gigante como O assunto do instante. Fica fixo no centro, com o mundo escurecido por trás, o sublinhado vermelho
  crescendo e a fonte pequena no mesmo bloco.
- **Camada:** `entra: {k: 'pousa', t, s0: 1.08, d: .22, r0}`; `sai: {k: 'some', t, d: .2}` ou `{k: 'afunda', t, d: .4, r: 4}`;
  `apaga: {t, a: .3, d: .25, foco: 4}` (escurece e desfoca o assunto anterior no lugar; vale também nas camadas vd*).
- **`mundo` foco:** `etiqueta: {txt, t, x: 540, y: 1240, s, fixa}` fica FIXA na tela. O nome aparece no lugar (a barra abre por cima) e
  some .24 s antes do fim da cena; `fixa: false` volta a prendê-la no personagem. Ponha `t` depois que ele assentou (≥ .5 s).
- **`digitado` foco:** linhas paradas no centro (y 960), letras já no lugar (a digitação só acende), nota logo abaixo da última linha.
- **`palavras` foco:** a palavra fica parada no centro e pousa; a 1ª já está no quadro 0; a planta gira e abre por baixo (`z0`, `rot0` valem).
- **`pilha` foco (`{y: 880, giro: .5}`):** a palavra nova pousa parada no centro. As anteriores apagam (.2) no quadro em que a seguinte
  chega e só depois descem; a parede gira por baixo.
- **`letras3D` foco (`{grupos: [[0], [1, 2]], tilt: 14}`):** um grupo (frase) por vez, trocando no lugar, com inclinação fixa e o bloco parado.
- **`jornal` foco:** o padrão é o título e depois cada marca-texto, .45 s antes dela (≥ 1 s entre movimentos). Entrada `'pousa'`.
  Com `'fixa'` é corte casado: sem chegada nem borrão de corte (`pulso: true` devolve o borrão). Com `sai`, a página `'afunda'` e a
  câmera não dá chicote. `alvo: 'titulo'` centra nas letras do título, não na caixa.
- **`parede` foco (`{fotos: c => [[t, i | 'todas', z], ...]}`):** fotos pregadas no quadro 0 (com `ts`, cada uma pousa no lugar) e uma em
  destaque por vez (as outras a .45 e desfocadas). A câmera vai até a foto com zoom (z 1,5; `'todas'` recua para a grade inteira).
- **`salaTV` foco:** recuo centrado na TV, mão 3; com `mergulho`, sem chicote de saída.
- **`perfilEA` foco:** barra de endereço com letra de 40 px (letras no lugar). O botão Seguir pousa .7 s antes do toque e a barra apaga.
- Todos os componentes aceitam `trDur`/`trCor` (antes, só `mundo` e `presEA`).

**O que o motor foco substitui:** do motor golpe saem o "plano a cada ~0,8 s" (planos em toda palavra), o tranco, a mola nas entradas
laterais, a chegada em chicote de longe e o chicote de saída grande (r ±6°, y 80). Ficam a curva `EA_GOLPE` (usada nos movimentos e na
saída), o borrão só no pico e a mão. Do motor v3 ficam o rig e as curvas do AE (por baixo das chaves das tipografias), os wiggles (mais
baixos), flash + onda, mattes, grade e ruído e o borrão de corte (pela metade). Cenas sem `foco` funcionam exatamente como antes: o A do
teste sai idêntico pixel a pixel e com os mesmos eventos de som com a biblioteca antiga e a nova.

**Medir** (cenas sem apresentador, `--de/--ate`):
- `<kit>\ferramentas\medir_leitura.py <master>`: saltos ≤ 45/min, miolo ≥ 92%, panorâmica > 8 px/q ≤ 10%, zoom ≥ 20%.
- `<kit>\ferramentas\texto_na_tela.py <proj>`, com as cenas do vídeo ativas: 2+ blocos ≤ 5%, letra ≥ 44 px, letras andando > 3 px/q ≤ 3%.
- `medir_motion.py`: câmera parada ≤ 20%.
- `medir.py`: centro (o movimento vira informação).
- `ritmo.py`: nenhum trecho parado ≥ 0,5 s.

## O motor golpe (02/11/2026; o mesmo da vox-edit2, onde o A/B foi aprovado: "B aprovado, aplica")
**A/B desta skill APROVADO pelo Felipe em 02/11/2026** (`H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_earn_AB_v1.mp4`). **Desde 03/11 a cena nova
usa `foco`** (seção acima), que roda em cima deste motor. `golpes` com planos explícitos fica para reeditar vídeo de 02–03/11 ou para um
movimento que o foco não faça; sem `golpes` nem `foco`, só ao reeditar vídeo de antes de 02/11.
O Felipe achava os motions fracos e mandou duas referências de motion do earn.edits: a própria cientista
(`C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4`, 30 q/s com borrão nos chicotes) e o Buffett (`earn.edits_DYURMKHoayc.mp4`,
16 q/s em stop-motion). A régua `<kit>\ferramentas\medir_motion.py` mostrou que a demo v9 já tinha velocidade (o rig do AE), mas a
FORMA estava errada: a entrada `EA_ENTRA` e a saída `EA_SAI` levam 64–73% do tempo para fazer metade do caminho (a referência faz em 36%),
cada cena era um enquadramento só e o borrão ia em todo movimento, até no texto que se lê. O motor golpe complementa o motor v3
(rig, wiggles das camadas, flash + onda, mattes, borrão de corte e grade continuam iguais):
- **Chicote medido (`EA_GOLPE`, curva `'golpe'`):** arranca a ~45% da velocidade de pico, pico em 20% do tempo, desliza até zero.
- **Planos dentro da cena:** a câmera viaja em chicotes de ~0,8 s de um assunto para o próximo, começando ~0,2 s antes da palavra
  (`planos`). Num `jornal`, `{alvo: 'trecho'}` centra a câmera no trecho marcado (ou `'titulo'`/`'foto'`).
- **Chegada e saída em chicote:** a cena chega perto do pico (`planos[0]` = pose de antes) e sai num chicote que o corte pega logo
  depois do pico (padrão `sai: {z: .82 nos 55% iniciais | 1.3 depois, r ±6, y 80}`), no lugar da rampa lenta do AE.
- **Borrão direcional só acima de ~10 px/quadro** (`window.EA_LIMIAR`): a deriva e o texto lido ficam nítidos.
- **Mola nas entradas** (`EA_MOLA`, `entra.curva: 'mola'`; passa ~9% e assenta): padrão nas cenas com golpes para `esq/dir/cima/baixo/canto`
  e para a página do `jornal`, menos nas camadas `atras` (os objetos que sobem por trás da cabeça mantêm o tempo calibrado com `EA_ENTRA`).
- **Tranco** na câmera (`golpes: [[t, 6–10]]`); os `socos` e o `soco` do jornal já ganham tranco sozinhos. Câmera na mão (`mao`, 5 px).
- **A deriva da regra 2 continua:** recua (−2%/s) nos 55% iniciais do vídeo e aproxima (+2%/s) depois.

Como ligar: opção de cena `golpes` em `mundo`, `jornal`, `digitado`, `palavras`, `letras3D`, `parede`, `salaTV` e `perfilEA`. Sem ela a cena
fica exatamente como no motor v3, então projetos antigos não mudam.
- `golpes: true`: a `cam` da cena continua, com chegada e saída em chicote, borrão só no pico e tranco. Bom para cena curta (digitado de 0,8 s).
- `golpes: c => ({planos: [[t, {x, y, z, r}, d]], golpes: [[t, amp]], deriva, mao, chega, sai})`: enquadramentos explícitos (a `cam` é
  ignorada). `x, y` = ponto do mundo no centro da tela, `z` = zoom, `d` = duração do chicote (.7–.9). Exemplo do teste (S10 do
  `teste_earn`, verbete da Mesbla):
  ```js
  golpes: c => {
    const t6 = c.w('B16', '600'), t10 = c.w('B17', '10');
    return { planos: [[-1, { x: 700, y: 760, z: 1.7, r: 24 }], [-.12, { x: 470, y: 900, z: 1.45, r: 6 }, .8],
      [t6 - .22, { alvo: '600 milhões de reais', z: 2.0, r: 2 }, .9], [t10 - .22, { alvo: 'a ser pagos em dez anos', z: 2.0, r: -1 }, .7]],
      golpes: [[.45, 7]] };
  },
  ```

Regras do motor neste formato:
1. **Personagem centrado (regra 1):** num `mundo` com personagem, os planos ficam em `x: 540` e andam só em `y`, `z` e `r` (ex.: subir para
   mostrar o logo que nasce atrás da cabeça e voltar a ele, como a S7 do teste).
2. **Leitura (regra 5):** o plano que mostra um trecho fica parado (só deslizando) ≥ 1 s antes do próximo chicote; nenhum chicote no meio de
   frase lida. No jornal, corpo de 25–26 px pede `z` ≈ 2,0 (letra ~50 px); com `soco` (×1,2) use ~1,5 para a coluna não encostar na borda.
3. **Chicote do tamanho certo:** foto e página têm muita textura; um chicote que junta zoom grande (> ~1,4×) e pan longo vira 0,3 s de
   borrão. Prefira 1,2–1,4× de zoom ou ~300 px de pan por chicote.
4. **Medir** a janela: `medir_motion.py <proj> --de T0 --ate T1` (metas: câmera parada ≤ 20%, velocidade ≥ 4 px/q, metade do caminho em
   28–45%). O "plano médio" da régua conta QUADROS com mudança forte; nas cenas de foto e página do earn (grão + malha + textura) cada
   chicote soma vários, então aqui ele sai baixo (~0,3 s) sem estar errado. Confira o borrão olhando os quadros.

## Vida na foto parada (02/11/2026, aprovado)
Portado da vox-edit2, onde o A/B foi aprovado pelo Felipe ("B aprovado, aplica"; projeto `projetos/teste_vida`, cenas de exemplo em
`C:\Users\USER\.claude\skills\vox-edit2\cenas_vida_exemplo.js`). Vem do tutorial do projeto After Effects "Lamborghini vs Ferrari" da EarnEdits
("máscaras + expressões" sobre imagens de IA geradas EM PEÇAS). Os bonecos andam a 13 q/s (stop-motion); a câmera (`golpes`, `eaRampa`) não muda.

**Imagem gerada para ser animada** (Qwen local com `"recorte": true`, fundo liso → BiRefNet):
- **Carro:** "exact side profile facing right, camera at wheel height, both wheels perfectly round and fully visible, no logos, no badges,
  no license plate". Meça com `<kit>\.venv\Scripts\python.exe C:\Users\USER\.claude\skills\vox-edit2\medir_pecas.py carro render/assets/g_x.png`
  (abra o `_pecas.jpg`; em carro clássico o Hough erra, ajuste à mão). Versão envelhecida/batida = edição por `ref` do MESMO carro
  ("same position, same size and same wheels") e entra como `troca` (corte casado).
- **Pessoa:** "full body, exact side profile facing right, both hands inside his trouser pockets, standing upright with legs straight and
  together" + `medir_pecas.py boneco`. Mãos no bolso = braço sem peça; pernas juntas = a mesma peça é perna da frente e de trás. Só anônima (regra 4).
- **Fachada com porta** (de enrolar, garagem, loja), frontal e simétrica: meça o retângulo da porta em px da imagem e confira na prévia.
- **Paisagem para esteira:** lateral, sem estrada; corte a faixa de baixo e espelhe (imagem + espelho emendam sem costura).
- NÃO use `make_assets.py --trim` nessas imagens (as coordenadas das peças são da imagem inteira).

**Componentes** (fim do `componentes.js`). Sempre no `build(r, S, c)` de um `mundo`, sobre o palco `S.pal`; ficam por cima das `camadas`
(ou atrás do personagem com `atras: true`). Tempos aceitam número ou `c => tempo`. Toda camada aceita `p`, `vida`, `ate`, `opacidade`, `base`, `foco`.
- **`vdAdesivo(S.pal, S, 'asset' | null, {x, y, w, p, rot, t, fino, sombra, filtro, txt, txtOp: {s, fundo, cor, fonte, peso}})`**: nasce
  como papel em 5 quadros (polígono torto crescendo) e a borda de papel rasgada (filtro SVG `vdBorda`) aparece 1 quadro depois. Com `txt`
  vira palavra recortada: Poppins 900 sobre creme `'#f4f1ea'` ou `EA.amarelo`; chave com `<i style="font-family:PlayfairItalic;color:#d8102a">`.
  Foto REAL impressa = `fino: true`. Use no lugar do `pop`. A palavra-adesivo é texto: regra 5 (≥ 44 px, parada ≥ 1 s).
- **`vdCarro(S.pal, S, 'asset', {x, y, w, p, rodas, anda: lt => px, esteira: lt => px, troca: [[t, 'asset']], quique, motor, sombra, opacidade})`**:
  `anda` = o carro anda na tela; `esteira` = o chão corre e o carro fica (a MESMA função do `vdEsteira`). Rodas giram pela distância; o corpo
  inclina e quica pela aceleração. Roda no chão: `y = yChao - (base / 1024 - .5) * w` (imagem quadrada 1024).
- **`vdEsteira(S.pal, S, 'asset' | null, {x, y, w, h, p, dist: lt => px, fator, tom, estrada: true, itens: {src, w, gap, y}})`**: faixa
  infinita (Motion Tile + loopOut). `estrada: true` desenha o asfalto; `itens` = postes passando (`y` relativo ao topo da faixa);
  paisagem atrás com `p` .55 e `fator` .2–.3. Faça a faixa bem mais larga que a tela (3400 px) e sem buraco até a borda de baixo (a câmera recua).
- **`vdBoneco(S.pal, S, 'asset', {x, y, w, p, pescoco, quadril, anda: lt => 0..1, vel (1.7), dobra (21), cabeca: lt => graus, corpo, rota: lt => [x, y]})`**:
  caminhada `Math.sin(t × vel) × dobra` nas pernas e `cos` no tronco; `cabeca` negativa olha para cima; `rota` anda pelo mundo.
- **`vdPorta(S.pal, S, 'fachada', {x, y, w, p, porta: [x0, y0, x1, y1], t, d, dentro: 'interior'})`** → `{lay, caixa, k, jan}`: a porta
  sobe aos trancos e mostra o interior. O carro que sai = `vdCarro` criado DEPOIS, com `opacidade` 0 até a porta abrir.
- **`vdMove(lay, x, y)`**: move uma camada do palco (o `inner` vai por left/top; o pivô `cx/cy` e o borrão acompanham). Posições que andam
  vão em `S.pre` (`(S.pre = S.pre || []).push((S, c) => vdMove(...))`): o `eaAplica` roda `S.pre` ANTES de aplicar o quadro. O `update` do
  `mundo` roda depois do `eaAplica` (moveria com 1 quadro de atraso).
- **Acabamento retrô** em todo `mundo` (`retro: false` desliga; `retro: {blur, pisca, reticula}` ajusta): borda desfocada por máscara
  invertida (centro nítido) e cintilação de exposição a 13 q/s, abaixo da grade de 6 px. **Mais leve que na vox-edit2** (blur 5 px em vez de 7,
  cintilação ×0,6) porque o earn já tem grade, ruído, brilho tremendo e vinheta; a **retícula fica desligada** por padrão (7 px sobre a grade
  de 6 px faz moiré). Tipografia, `jornal` (regra 5) e apresentador ficam sem.
- Não entrou: glow (regra do Felipe), distorção de lente, braços balançando, a chave `VD_B` do A/B (aqui é sempre o B aprovado).

**Tradução fala → vida:** "sair/chegar/andar/dirigir" → `vdCarro` com `anda`; "durante anos/o caminho/segue" → `vdEsteira` ou `vdBoneco`
com `rota`; "abrir/revelar/por trás" → `vdPorta`; palavras de uma lista ("envelhece, deprecia, mais barato") → uma `vdAdesivo` por palavra no
tempo dela; "alguns modelos/exemplos" → fotos REAIS em `vdAdesivo` `fino`; "olhar para/perceber" → `cabeca` do `vdBoneco`.

Teste (02/11): cena temporária no S2b do `teste_earn` (B05; guardada em `work/ea_vida_teste.js.bak`): paisagem + estrada infinitas, postes,
carro novo com as rodas girando que vira o velho no "funcionários", homem andando na calçada, "fundo de pensão" e "funcionários" nascendo
como papel. Folhas: `out/pv/vida_teste_1.jpg`, `vida_teste_zoom.jpg` (rodas e pernas quadro a quadro) e `vida_teste_intactas.jpg` (as outras cenas iguais).

## Os componentes (assinaturas completas em `componentes.js`)
Tempos aceitam número ou `c => tempo` (com `c.b`, `c.e`, `c.w` locais à cena; **nunca subtraia c.t0**). Toda cena aceita `tr`, `lead`, `boom`.
- **Toda cena com câmera aceita `foco`** (motor foco, o padrão de cena nova) **e `golpes`** (motor golpe); seções acima.
- **`mundo(beats, {fundo, fundoOp, camadas, cam, golpes, pb, cor, fechadura})`**: o coração do formato. Fundo cobrindo a tela (desfocado por
  `fundoOp.foco`) + camadas com profundidade `p` (parallax).
  - Trecho de vídeo (`fundo: 'clip:x'` com `fundoOp: {from, rate}`, ou camada `fonte: 'clip:x'` com `from`, `rate`, `t0`) roda a 30 q/s
    (regra 8): `from` = segundo do 1º quadro, `rate` ≥ 1, e o clipe roda desde que a camada aparece. Clipe curto: troque o assunto antes.
  - Camada: `{fonte | el, x, y, w|h, p, atras, entra: {t, k: 'camera'|'baixo'|'cima'|'esq'|'dir'|'foco'|'pop'|'canto'|'pousa'}, sai: {t, k
    (também 'some' | 'afunda')}, apaga: {t, a, d, foco}, foco: [[t, px]], etiqueta: {txt, t, dx, dy, s} (no motor foco: {txt, t, x, y, s}, fixa
    na tela), troca: {t, d, cx, cy} (máscara de pincel), base (filtro CSS fixo), vida, sombra}`.
    `entra.curva` troca a curva da entrada (`'mola'`, `'golpe'`, `'entra'`…).
  - Recorte do `imagens_ea.py ... :camadas:<nome>`: `{fonte: 'f_<nome>_obj', alinha: true}` volta sozinho para o lugar dele sobre
    `fundo: 'f_<nome>_fundo'`. Quadro fechado (TV, entrevista): `tam: .55` diminui e apoia na base da tela.
  - Objetos-metáfora que sobem por trás (o caixão da referência): camada `atras: true` com
    `entra: {k: 'baixo', t: c => c.w(...) - .42, dist: 900, d: .7}`. O objeto sobe escondido atrás do corpo e aparece por cima da cabeça NA
    palavra (com a curva do AE, os últimos 3% do caminho levam ~1/4 do tempo; entrando na própria palavra, ele só aparece depois dela).
  - `pb: c => tempo` vira P&B em 0,25 s (a etiqueta escurece junto) e dá um boom. `cor`: `'frio'|'quente'|'verde'|'vermelho'|'pb'|'arquivo'` ou filtro CSS.
  - `cam: c => [[t, {x, y, z, r}, 'curva'], ...]` (curvas do AE `entra` 33/100 padrão, `sai` 100/1,7, `ae` 75/75, `rapida` 2/100; e
    `arranque`, `suave`, `linear`, `saida` acelera, `seco`; do motor golpe, `golpe` e `mola`).
  - `flash: c => t` e `onda: c => t` (Flash + Wave V2 do projeto, numa palavra de virada DENTRO da cena; valem também em `jornal`,
    `parede` e `salaTV`), `posterize: 16` (a cena anda a 16 q/s, como a TV e a "história" do projeto).
  - `fechadura: {t, k0: 6.5, k: 1.1, cy}`: a cena passa a ser vista pelo buraco da fechadura (sombra interna e luz na borda).
- **`digitado(beats, [[texto, t], ...], {s, nota, ritmo})`**: fundo escuro com riscos de película, texto em sans condensada branca
  digitado letra a letra (tique de tecla), cursor piscando e sublinhado vermelho crescendo; câmera derivando. Só para o que a fala diz:
  datas, anos, números, "nove meses depois". `nota` = contexto/fonte em letra pequena (ex.: a correção de um dado).
- **`palavras(beats, {so, s, primeira, rot0, z0, fundo: 'planta'|'quadriculado'})`**: uma palavra falada por vez, em Playfair itálica com
  sombra, sobre a planta azul cuja grade é redesenhada a cada quadro com distorção de lente. O plano gira de 26° para 0° e recua.
  `so` = só as palavras fortes (5–8 por frase; a referência mostra ~1 a cada 0,35 s).
- **`pilha(beats, {s, so})`**: palavras empilhando no verde-escuro (a nova entra EM CIMA, a coluna desce e as de baixo borram). Para a virada
  ("Mas houve uma reviravolta", "E a história é sombria", "sem botar um real na mesa").
- **`letras3D(beats, [[texto, t, cor, tamanho], ...])`**: letras extrudadas (amarelo/vermelho/azul) digitadas com estalo no papel quadriculado
  com sombra de janela. Para a frase de efeito e o CTA. Tamanhos 90–124 px: cada linha cabe em ~950 px.
- **`jornal(beats, {veiculo | logo, linhaTopo, titulo, linha, autor, corpo, foto, moldura, legenda, marca, circulo, soco, fundo, entra, sai})`**:
  matéria REAL impressa (título, veículo, data, autor e trecho de verdade) em papel envelhecido.
  - `fundo: 'mesa'` (madeira quente, gira) ou `'tabuas'` (escuras, em pé) ou `'maos'` (precisa do asset `maos_jornal`).
  - `marca: [[t, 'trecho exato', 'amarelo'|'verde']]` passa o marca-texto no tempo da palavra; `circulo: [t, 'trecho']` desenha o círculo
    vermelho à mão; `soco: t` dá o punch-in seco; `entra: 'voa'|'sobe'|'pousa'|'fixa'`; `sai: t` derruba o papel (no foco: `'afunda'`).
  - Página longa: divida em dois planos (o segundo com `entra: 'fixa'`, `cam` perto do parágrafo e as marcas antigas com t = -1).
  - Regra 5: o plano que mostra o trecho marcado tem a câmera (`cam`) centrada nele e perto o bastante para a letra ficar ≥ ~44 px.
- **`parede(beats, [4 fotos], {ts, flash, sai, pos, dEntra, posterize, rampa})`**: a "07 History" do projeto. A câmera começa longe
  (`rampa` padrão `{zIn: -.45, rIn: 0, eIn: EA_RAPIDA}`) sobre a parede riscada (3×3 cópias espelhadas, nunca mostra borda), as fotos P&B
  com borda branca voam dos 4 cantos para a grade 2×2 (`dEntra` 1,6 s) e chegam ~0,5 s depois do corte, como no original; flash de câmera
  (2 quadros) com disparo; raios de luz; o grupo sai girando. Para "na história", listas, exemplos, "as empresas dele".
- **`salaTV(beats, {sala: 'f_tv_familia', tela: [1147, 1280, 1387, 1486], conteudo: 'apresentador'|'clip:x'|'f_x', cor: 'verde', mergulho, clipDe})`**:
  sala real (foto de 1958, domínio público) com o conteúdo dentro da TV (efeito de tubo). Começa colada na TV, recua mostrando a família e
  no `mergulho` empurra de volta para dentro. Para "a notícia se espalhou", "o Brasil inteiro viu" e para o apresentador. Clipe na TV
  (`clip:x`, `clipDe` = segundo do 1º quadro) roda a 30 q/s mesmo com `posterize: 16`: o posterize anda só a câmera.
- **`presEA(beats, {z, fy, punch, tPunch, etiqueta, fechadura})`**: apresentador limpo em tela cheia (sem malha, grão nem cor do formato),
  punch-in seco numa palavra; `etiqueta: {txt: 'Fernando Miranda'}` na 1ª aparição.
- **`perfilEA(beats, {perfil: 'perfil_<usuario>', usuario, tDigita, tSeguir})`**: final com o perfil REAL num monitor antigo, a barra de endereço
  digitando o @ e a batida de 81 BPM (o CTA da referência). Antes dele, `letras3D` com a frase do "siga".
- **Passagens:** corte seco (padrão; a trilha põe o swish e o motor o borrão de ±0,167 s), `tr: 'ea:sobe'` (o plano novo sobe como cartão
  de canto arredondado e empurra o anterior), `tr: 'gl:sdf-iris', trCor: '#ff3b30', trDur: .45` (íris vermelha, o CC Light Wipe da entrevista),
  `tr: 'ea:matte:<nome>'` (matte do projeto: `center` 0,53 s, `center_liquid` 0,77, `round` 0,57, `three_liquid` 0,53, `up_1` 0,27,
  `up_2` 0,3, `ink_lr` 1,3, `ink_lr_2` 0,93, `ink_ud_digonal` 1,27, `ink_spot` 2,3; `trDur` muda), `tr: 'ea:wipe'` (Linear Wipe de baixo
  para cima com borda suave, 0,55 s; `trAng` gira) e saídas pela câmera (`'saida'` na última chave). Na matte e no wipe a cena velha segue
  viva por baixo e a saída da câmera dela termina junto com a passagem.
- **Energia (em toda cena, automático) = o rig do projeto:** `eaRampa` faz a entrada (de perto, curva 33%→100%, ~1,3 s, girando ±5°),
  o recuo (primeiros 55% do vídeo) ou a aproximação (depois) contínuos, a saída acelerando (curva 100%→1,7%, último ~1 s: recua para .55
  girando 14° e descendo; depois dos 55%, mergulha para 1,9) e dois `wiggle(1,15)` na posição + z e giro. Por cena `rampa: false` ou
  `{zIn (negativo = começa longe), yIn, xIn, tin, eIn, rIn, zOut, rOut, yOut, tout, wig, deriva}`; `window.EA_ENERGIA` escala tudo.
  Nas cenas de tipografia, `eaBorraCena` borra a chegada.
- **Vida e brilho:** `socos: c => [tempos]` (punch-in de 8,5% com golpe na trilha), `drop: true | t` (808 da trilha), `luz: 'frio'|'quente'|
  'verde'|'vermelho'|false`, `poeira: 0..1` (partículas de luz), `vida3d` (recorte respirando; liga sozinho nos recortes que entram),
  `leaks`/`flashes` (do motor). Recorte centrado: `{alinha: true, tam: .7, topo: 470, dx_}` (a base do recorte some em degradê a partir
  de 78%, `fade` muda ou `false` desliga, para a borda reta do quadro cortado não aparecer quando a câmera recua).
- **`vida` de cada camada (os wiggles do projeto):** padrão = objeto solto (`wiggle(.5,15)` + giro `wiggle(1,3)`), `'gente'` (`wiggle(3,10)` no Y),
  `'palavra'` (`wiggle(3,25)`), `'frente'` (`wiggle(2,15)`), número (fator) ou `false` (parada: fundos, telas).

## O roteiro decide a cena (tabela de tradução fala → cena)
| na fala | cena | exemplo da demo |
|---|---|---|
| apresenta a pessoa da história ("esse cara", o nome) | `mundo` com o recorte entrando da câmera + etiqueta com o nome | "Esse cara era dono…" → Mansur + "Ricardo Mansur" |
| o que a pessoa tem ou faz | objetos sobem por trás dela; máscara de pincel troca o fundo | Mesbla e Mappin sobem; no "banco", o cofre |
| morte, queda, negação, "não" | vira P&B (`pb`), moldura vermelha | — |
| data, ano, número, tempo | `digitado` | "180 LOJAS / 28 MIL FUNCIONÁRIOS", "NOVE MESES DEPOIS" |
| número forte no meio de uma cena de imagem (motor foco) | `eaNumero` no `build` do `mundo`: o número vira o assunto, com o mundo escurecido | "~1,5 MILHÃO" sobre os deslocados |
| lista de 2+ frases curtas em letras 3D (motor foco) | `letras3D` com `foco: {grupos}`: uma frase por vez, trocando no lugar | "QUAIS EMPRESAS?" → "AS EMPRESAS DO MANSUR" |
| fato com fonte (matéria, documento) | `jornal` com o trecho marcado na palavra | "detetive" → "investigadores privados" |
| frase de efeito curta | `palavras` (planta azul) ou `letras3D` | "Ficou com as duas maiores redes…" |
| virada | `pilha` | "sem botar um real na mesa." |
| pergunta ("quem pagava?", "o que matou?") | `fechadura` | o cofre na luz vermelha |
| controle, manipulação | mão de marionete da biblioteca | "Controlava o fundo de pensão…" |
| "na história", lista de casos, "as empresas dele" | `parede` | as lojas em P&B, flash no "empresas" |
| a notícia se espalha, opinião, "vou explicar" | `salaTV` (apresentador ou clipe na TV) | Fernando na TV de 1958 |
| fecho, siga | `letras3D` + `perfilEA` | — |

Cada imagem mostra a palavra dita (sem título dizendo o que é a foto: regra do Felipe). **Passagens também saem do roteiro, nunca de uma cota**
(regra do Felipe de 31/10): push vertical quando o assunto "sobe" ou continua; íris quando entra alguém de surpresa; corte seco + boom na
virada de mundo; mergulho na TV quando a próxima cena é "dentro" da notícia.

## Material: de onde vêm as imagens (Qwen local primeiro; Higgsfield só se o Qwen não der conta)
A referência é 100% imagem gerada. Para os vídeos do Felipe, na ordem:
1. **Pessoa real citada:** foto ou vídeo REAL (Commons, Agência Brasil, quadro de telejornal com crédito na tela e no fontes.md).
   `imagens_ea.py FOTO:camadas:<nome>` separa o personagem do fundo da mesma foto (o recorte entra da câmera sobre o próprio fundo, como
   na referência). Confira `out/camadas_<nome>.jpg`: cabelo, mãos e ombros inteiros; recorte ruim = use a foto inteira, sem recorte.
   Movimento do personagem = trecho de vídeo real (`clipes.py` + camada `fonte: 'clip:<nome>'`). **Nunca vídeo gerado de pessoa real.**
2. **Lugares, prédios, objetos:** fotos reais (Commons) com `imagens_ea.py :foto` ou `:pb`; logos com `:logo`.
3. **Metáforas:** biblioteca do kit (`biblioteca/recortes/*.webp`: cofre, marionete, dinheiro, martelo, cadeado, xadrez…), copiadas como `b_<nome>.webp`.
4. **Imagem gerada: Qwen local primeiro** (`gerar_qwen.py`, `Kit_Edicao_Vox_v2/guias/prompts_imagens.md` §2). Serve para cenas anônimas sem rosto:
   multidão de costas, mãos segurando o jornal (asset `maos_jornal`, com `"recorte": true` = PNG com transparência), sala, mesa com objetos.
   O Higgsfield fica só para a imagem que o Qwen não der conta e para o **vídeo** gerado dessas cenas (Kling), que dá o gesto dos personagens anônimos.
5. **Texturas:** procedurais no `componentes.js` (escuro riscado, parede verde, planta azul, papel quadriculado, papel de jornal). 0 crédito.

## Apresentador (a referência não tem)
Com gravação ou HeyGen: **8–12 aparições num vídeo de ~2:30** (proporcional), 2–4 s cada (gravação real até 5 s), nunca duas seguidas,
nas perguntas, opiniões e viradas; só em janela em que ele olha para a câmera (confira quadro a quadro). Formas: `presEA` (tela cheia
limpa, etiqueta com o nome na 1ª vez), `salaTV` com `conteudo: 'apresentador'` (dentro da TV) e a íris vermelha para entrar de surpresa.
O apresentador fica LIMPO (regra do Felipe): sem malha, grão, cor do formato nem aproximação lenta. Sem apresentador:
`preparar_earn.py --sem-apresentador` (faceless, como a referência).

## Passo a passo
1. **Projeto** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs). Corte e beats como no kit
   (beats curtos, quebrando antes de nomes, datas, valores e perguntas).
2. **Formato:** `python <esta pasta>/preparar_earn.py <nome> --prefixo xx [--real | --avatar | --sem-apresentador] [--sem-trilha]`.
3. **Pesquisa:** cada fato, número e data com a fonte. Manchete = matéria real (título, veículo, data, trecho). O que estiver errado na
   fala NÃO vai para `digitado`, `jornal` nem `letras3D` (a nota pequena do `digitado` corrige o contexto, como na demo).
4. **Plano de cenas** (tabela `cena | beats | fala | componente | material | passagem e por quê | som`): 20–34 cortes/min, nenhuma cena > 5 s,
   um evento a cada ~0,65 s, 1–2 mundos por pessoa citada, 1 `digitado` por data/número forte, 1–2 `jornal` por minuto, 1 `palavras`
   e 1 `pilha` por minuto no máximo, `parede`/`salaTV`/`fechadura` onde a fala pedir. Marque antes as aparições do apresentador.
5. **Material:** `export MSYS_NO_PATHCONV=1`; `imagens_ea.py` (fotos, P&B, camadas, logos), biblioteca, trechos (`ferramentas/baixar_trechos.py` +
   `clipes.py`), depois `make_assets.py` (mantém `ox/oy/W0/H0` das camadas).
6. **Cenas** em `work/xx_b.js`… (copie a estrutura do `cenas_foco_exemplo.js`: motor foco em TODA cena), com o comentário `// Sn — "fala"`.
   Depois `python montar.py <nome> xx`.
7. **Prévias:** `python previas.py <nome> --pontos 3` (ou `--tempos 2.4,12.6`); abra `out/pv/cenas_*.jpg`. Mande a folha ao Felipe.
8. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"` (o etapas.json já aponta montar e trilha desta skill).
9. **Conferir:**
   - Réguas de leitura do motor foco (nas janelas sem apresentador, `--de/--ate`): `<kit>\ferramentas\medir_leitura.py <master>` e
     `<kit>\ferramentas\texto_na_tela.py <nome>`, com as metas da seção "O motor foco".
   - `python medir.py <nome>`: centralização "ok"; a linha "assunto fora do centro em (s)" aponta os planos a corrigir. Movimento, quadros
     parados e picos são informação no motor foco.
   - `python ritmo.py <nome>`: nenhum trecho parado ≥ 0,5 s.
   - As emendas do qa_lint (`out/qa_emendas_*.jpg`) e todas as `out/qa_*.jpg`.
10. **Mensagem final** (português, curta): arquivos, créditos (0 se só fotos reais), avisos de checagem com fonte, **Fontes:** matérias
    (veículo e data), fotos (autor e licença), trechos (canal e data).

## Teste (31/10/2026)
`projetos/teste_earn` (prefixo `ea`): corte "Rei do Varejo" do Fernando (fernando8) até o B28, quadros por junção (`work/frames`,
`work/frames_largos` → fernando8; remova só com `cmd //c rmdir`), áudio e timing cortados em 40,07 s. 17 cenas, 2 aparições do Fernando
(TV de 1958 e tela cheia com etiqueta), 0 créditos. `fechar` em 1m16s (render de 1.202 quadros em 29 s com 12 processos), −14 LUFS,
checa_fala sem palavra perdida, qa_lint 0 problema. `ritmo.py`: 32,9 trocas/min, plano mediano 1,67 s, o mais longo 4,2 s, nenhum trecho
parado. Malha medida no vídeo: período 6,00 px, 18 níveis no cinza médio (referência 10–26). Entrega: `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteEarn\TesteEarn_demo40s_v1_tiktok.mp4`
(28,5 MB) + `_MASTER.mp4`.
- **v1 → v6 (mesmo dia, correções do Felipe: "o original é muito mais dinâmico… personagens em constante movimento… cores saltam… trilha
  melhor" e "o personagem principal fica destacado no centro"):** medido com `medir.py` contra a referência. Fluxo médio 0,80 → 1,16 px/q
  (ref. 1,48), quadros quase parados 42% → 13% (ref. 15%), picos de mudança 76 → 126/min (ref. 183), saturação .31 → .41, assunto a 1,3%
  do meio na mediana com 93% dos quadros centrados (ref. 1,5% e 95%), cama de 19 dB → 5,5 dB abaixo da voz com 3 drops de 808, e o
  Mansur se mexendo com vídeo real (trechos do Jornal da Band). Entrega: `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteEarn\TesteEarn_demo40s_v6_tiktok.mp4` + `_MASTER.mp4`.
- **v7–v9 (mesmo dia, depois do projeto After Effects):** motor v3 com o rig de câmera, as curvas e os wiggles do .aep, borrão em cada corte,
  grade e ruído do projeto, flash + onda no "banco", Posterize 16 na TV e na parede, matte `center` na fechadura, `ea:wipe` no "NOVE MESES
  DEPOIS", parede com a câmera vindo de longe. `medir.py`: fluxo 1,30 px/q (ref. 1,48), 12% parados (ref. 15%), 202 picos/min (ref. 183),
  saturação .43, assunto a 1,5% do meio com 95% dos quadros centrados. Render de 1.202 quadros em ~100 s, −14,0 LUFS, checa_fala 0.
  v8 corrigiu o wipe (a borda começava fora da tela) e v9 o tempo dos logos que sobem atrás do Mansur. Entrega final:
  `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteEarn\TesteEarn_demo40s_v9_tiktok.mp4` + `_MASTER.mp4`.

- **Motor golpe (02/11, janela 15,55–26,6 s: Mansur + Mappin, relógio, "NOVE MESES DEPOIS", verbete da Mesbla em dois planos):** cenas
  S7–S11 com `golpes` (as cenas de antes em `work/ea_b.js.bak_antes_golpe`). `medir_motion.py` na mesma janela, A (v9) → B: metade do
  caminho 64% → 36% (ref. cientista 36%), velocidade 14,4 → 11,7 px/q (ref. 11,1), câmera parada 2% → 2% (ref. 10%). Nos quadros: o
  verbete passou de página inteira pequena (corpo ilegível) a trecho marcado centrado com letra ~50 px, o 350 sem cortar na borda, o
  Mappin nascendo atrás do Mansur com ele centrado e nítido, borrão só nos chicotes. Lado a lado: `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_earn_AB_v1.mp4`.

- **Motor foco (03/11, `projetos/teste_foco_earn`, prefixo `fe`):** trecho 15,56–32,86 s do `teste_earn` (B12–B23, 17,3 s, sem
  apresentador), fatiado com o áudio, as palavras e os beats. A = `work/ab_foco_A.js` (S7–S14 do `teste_earn` exatamente como estão);
  B = `work/ab_foco_B.js` (ativo em `work/fe_b.js`; cópia no `cenas_foco_exemplo.js`). Números na tabela da seção "O motor foco".
  - Rodadas da B: a v1 já passava miolo, panorâmica e zoom, mas tinha 59 saltos/min e 6,4% de letras andando. Essas sobras vinham de:
    a etiqueta deslizando e sendo empurrada pelo `ea:sobe`; o título ainda andando na chegada da página; a palavra antiga da pilha
    descendo acesa; a página caindo da tela; o 1º quadro da planta e da pilha sem a palavra; a foto da matéria disputando com o título;
    o borrão de corte de 30 px apagando o assunto.
  - A v2–v4 corrigiu isso tudo na biblioteca. A v4 tem deriva de zoom ∓5%/s em vez de 3%/s, porque a referência deriva 5–30%/s e o
    zoom não tira o assunto do meio.
  - Render de 519 quadros em ~45 s; `fechar` em ~1m10s.

## Armadilhas (vistas no teste)
- **Céu estourado na foto de fundo** vira um retângulo cinza chapado quando a câmera começa perto (zoom 1,2+ e foco 12). Enquadre pelo
  lado dos prédios (`fundoOp.fx` .24) ou escolha outra foto.
- **Malha × peso do tiktok:** a malha de 6 px é detalhe fino; 40 s deram 28,5 MB a 5.600 kbps. Em vídeo longo o entregar baixa o
  bitrate; se a malha tremer ou fizer moiré no tiktok, use `S.malha` .3 (ou `malha: .3` no `mundo`).
- **Filtro de cor fixo numa camada some** se for posto em `inner.style.filter`: o foco/borrão reescreve o filtro a cada quadro. Use `base`.
- **Quadro de TV recortado fica enorme** (a pessoa enche o quadro 4:3). `tam: .55` diminui e apoia na base; os objetos que sobem por trás
  vão para cima/lados da cabeça (x 250 e 830, y 520–640), senão somem atrás dela.
- **Foto de paisagem com `fy` longe de .5** deixa faixa preta quando a câmera recua. Mantenha `fy` .5 e mova a câmera (`cam` y), ou aumente `folga`.
- **Letras 3D acima de ~124 px** passam da largura em linhas de 11 letras.
- **Marca/círculo com t = -1** (marca já feita no plano anterior) não toca som; com t ≥ 0 toca o marcador.
- **Prévia não tem borrão de movimento** (ele depende do quadro anterior). Julgue o movimento no vídeo.
- **Demo parcial:** corte o `work/cut_audio.wav` e o `render/timing.js` no fim do último beat (como em `teste_earn`), senão a última cena
  estica até o fim do áudio.
- **`montar.py` só conta cenas no começo da linha** (as definições dos componentes ficam indentadas).
- **`mask-image` com arquivo do disco não funciona** (o Chromium bloqueia por CORS em file://): as mattes vão embutidas como data: URL em
  `render/eamattes.js` (o `preparar_earn.py` gera), aquecidas em elementos de 2 px, e cada quadro espera dois `requestAnimationFrame`
  (o lint_cenas avisa dessa linha; é de propósito).
- **Câmera começando longe ou recuando muito mostra a borda** de fundo pequeno: use camada `cobre` (já vem com as cópias espelhadas) ou
  um fundo bem maior que a tela (o cofre da demo tem 4600×7000).
- **Sacudida da onda abria faixa** no alto: o palco tem `overflow:hidden`; o motor cresce o palco junto com a sacudida (o Motion Tile do AE espelha).
- **Pincel (`troca`) perto do fim da cena:** o raio é medido na tela, então cobre os cantos mesmo com a câmera recuando na saída.
- **Matte/wipe e a saída da câmera:** a cena velha continua rodando por baixo da passagem (`_trProx`); sem isso ela congelava borrada no meio da matte.

- **Motor golpe + `salaTV` com `mergulho`:** a saída em chicote soma ao mergulho; nessas cenas use `golpes: {sai: false}` ou `planos` próprios.
- **`parede` com golpes:** a chegada automática começa PERTO (`chega.z` 1,45), o contrário da câmera vindo de longe da "07 History";
  passe `chega: {z: .6}` ou `planos` para manter a câmera vindo de longe.
- **`alvo` de trecho que quebra linha** centra na coluna inteira (a união das linhas), não no começo do trecho.
- **`pilha`** não tem `cam` própria (a câmera é calculada no update) e ignora `golpes`. No motor foco, a coluna fica parada e é a parede do
  fundo que gira (`giro`).

- **Motor foco, jornal:** marque o trecho DEPOIS que a câmera chega (t da marca ≥ t do foco + ~.45 s), senão o marca-texto corre com a
  página andando. Um plano com x, y explícitos não tem trecho em foco: só acendem as marcas e o círculo no tempo deles. Use `alvo` para
  acender um trecho sem marca.
- **Motor foco, corte casado** (jornal `'fixa'` continuando a cena anterior): use os mesmos x, y e z nos dois planos e `sai: false` na
  primeira. O `ritmo.py` passa a ver as duas cenas como um plano só (6,7 s no teste), o que é esperado: há evento a cada ~.5–1 s.
- **Motor foco, etiqueta:** a posição é da TELA (padrão y 1240), não do personagem. Confira nas prévias se fica no peito ou na cintura.
  Etiqueta e placa subindo ficam a ~600 px uma da outra e o olho salta 1–2 vezes ali; é aceitável, mas não junte um terceiro efeito.
- **`texto_na_tela.py` mede a "letra" pela caixa do nó de texto:** o parágrafo inteiro do jornal entra como uma letra de ~120 px. Confira a
  letra real nas prévias (corpo 26 px × z 1,9 ≈ 49 px). A régua lê as cenas que estão em `work/<pref>_b.js`: rode logo depois do render
  da versão que quer medir.
- **`medir.py` no motor foco:** "assunto fora do centro" no plano do título da matéria é esperado. A câmera centra nas letras do título,
  que é alinhado à esquerda, então a página fica à direita; o assunto desse plano é o título.
- **Iterar uma versão B:** use `pipeline.py fechar <proj> NOME --ate qa`, porque cada `fechar` completo entrega uma versão nova no destino.
  Entregue só a final.
- **Clipe travado ou lento** (regra 8): antes de 03/11, o motor prendia o clipe no último quadro quando ele era mais curto que o tempo na
  tela. `rate` < 1 repetia quadros, um `t0` depois de a camada aparecer deixava o 1º quadro parado, e o clipe da TV andava no
  `posterize` (16 q/s).
  - Hoje o motor roda tudo a 30 q/s, puxa o começo do clipe curto para trás e, só se nem assim couber, volta ao início, com aviso no
    console. Quando o clipe cabe, o quadro é o mesmo de antes.
  - Projeto antigo tem a biblioteca copiada e não muda: meça com `clipe_parado.py`. Medido em 03/11, o `renato_earn` tinha 1 LENTO
    (`noticia_br` na TV com posterize 16).

## Checklist antes de entregar
- [ ] Motor foco em TODA cena nova (`foco`): um assunto no centro, um texto por vez e parado (fora do mundo; no jornal, o resto da página
      apagado), no máximo 1 movimento por frase (zoom; panorâmica só para trocar de assunto), nada entrando pela borda, um efeito de cada
      vez, quadro 0 já com o assunto.
- [ ] Réguas de leitura (janelas sem apresentador): `medir_leitura.py` com saltos ≤ 45/min, miolo ≥ 92%, panorâmica > 8 px/q ≤ 10% e
      zoom ≥ 20%; `texto_na_tela.py` com 2+ blocos ≤ 5%, letra ≥ 44 px e letras andando > 3 px/q ≤ 3%; `medir_motion.py` com câmera
      parada ≤ 20%.
- [ ] `medir.py`: assunto centrado ≤ 2,5% do meio e ≥ 90% dos quadros. Fluxo, quadros parados e picos são informação no motor foco; as
      metas antigas valem só para cena sem `foco`.
- [ ] `ritmo.py`: nenhum trecho parado ≥ 0,5 s, nenhuma cena > 5 s; a câmera deriva em todos os planos.
- [ ] Cena antiga com `golpes` (reedição): chicotes na palavra, `medir_motion.py` com metade do caminho em 28–45%, texto parado ≥ 1 s, borrão só no pico.
- [ ] Vídeo real rodando normal (regra 8): `<kit>\ferramentas\clipe_parado.py <proj>` com 0 TRAVADO e 0 LENTO, e nenhum aviso
      "clipe ... é mais curto que o tempo na tela" no console do render. Clipe curto: troque o assunto antes de ele acabar.
- [ ] Pessoa citada = foto/vídeo REAL com etiqueta do nome quando a fala não diz o nome; rosto real gerado por IA só com OK do Felipe (pergunte antes).
- [ ] Matérias reais (título, veículo, data, trecho), marca-texto na palavra dita; número na tela = dado conferido.
- [ ] Todo texto que importa é LEGÍVEL no celular (≥ ~44 px, parado ≥ 1 s, sem borrão por cima) e tem UM foco destacado por vez
      (marca-texto/círculo + câmera centrada no trecho, resto escurecido ou desfocado). Confira nas prévias em tamanho real.
- [ ] Sem legenda corrida; texto só em tipografia, jornal e etiqueta; nenhum título dizendo o que é a foto.
- [ ] Fala com ação (sair, andar, abrir, durante anos, lista de palavras) = vida na foto parada (`vdCarro`/`vdEsteira`/`vdBoneco`/`vdPorta`/
      `vdAdesivo`); nas prévias seguidas (0,08 s) as rodas giram, as pernas mudam e o adesivo nasce com a borda rasgada; nenhuma faixa vazia na borda.
- [ ] Malha de 6 px nas imagens; apresentador limpo; P&B só na virada negativa; um mundo de cor por cena.
- [ ] Apresentador (se houver): 8–12 por 2:30, 2–4 s, olhando a câmera, nunca seguidas.
- [ ] Passagens escolhidas pela fala (corte seco + borrão por padrão; matte, wipe, íris ou `ea:sobe` só onde o roteiro pede).
- [ ] Som: cama grave, swish nos cortes, boom nas viradas, −14 LUFS, checa_fala sem palavra perdida.
- [ ] Final com o perfil REAL de quem fala. Versão `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
