# Análise das referências da edit-avancada (07/11/2026)

O Felipe mandou 9 materiais da EarnEdits: 7 projetos After Effects e 2 tutoriais em vídeo. A skill é a soma deles, levada para o
Kit_Edicao_Vox_v2 e para as réguas do motor foco.

**Como foram lidos**
- Os `.aep` foram lidos direto do binário (scripts `aep_ler.py` e `aep_textos.py`, mesma técnica da edit-earn e da vox-edit2): comps,
  camadas, efeitos com valores, chaves com influência de ease, expressões e textos com fonte e tamanho.
- Os tutoriais foram transcritos (Whisper) e vistos em folhas de quadros.
- Os números abaixo saem dessas leituras; o motor (`motor_av.js`) cita a origem de cada técnica no comentário.

| material | o que é | números gerais |
|---|---|---|
| stripe-x-openrouter | anúncio Stripe × OpenRouter | 13 comps, 29,97 q/s, comp principal 31,1 s, 52 camadas 3D, 4 câmeras |
| twitter | história do Twitter/Elon + pacote Retro FX | 32 comps, 194 camadas 3D, 9 câmeras, 1086 expressões, comp StopMotionFX |
| earnedits-discord | Discord em pixel art | 27 comps a 30 q/s, estrada vertical 1560×3197 de 110 s |
| sony-walkman | Walkman + Bryan Johnson, pacote Texture+Sauce | 37 comps, 163 camadas 3D, 18 câmeras, comp Callouts a 12 q/s |
| microsoft-teams | Teams com calendário | 7 comps, comp Calender 2314×1557, CC Page Turn |
| high-heels | colagem stop-motion 13 q/s | base da vox-edit2 (lido em 31/10) |
| siberias-mysterious-lab-death | mistério em camadas | base da edit-earn (lido em 31/10) |
| tutorial Listerine | AE passo a passo, ~1h30 | formas como matte, máscara de papel, wiggle no passo |
| tutorial Lamborghini vs Ferrari | AE passo a passo | papel revelando, borda de adesivo, rodas e esteira, ciclo de caminhada |

## 1. Stripe × OpenRouter: o projeto mais "premium"

**Efeitos mais usados**
- Deep Glow 2 ×51, Brightness & Contrast ×39, Transform ×33, Motion Tile ×31.
- Invert ×23: é o preset **Flex**.
- Gaussian Blur ×15, Add Grain ×12, Lumetri ×10, Optics Compensation ×8.
- Shadow Studio 3 ×8 (sombra longa), 3D Glasses ×6 (RGB separado), Venetian Blinds ×4.
- CC Spotlight, Crate's Godrays, S_Vignette, S_DefocusPrism e S_Hotspots.

**Fontes**
- Inter (SemiBold, Medium, Light) como base.
- SF Pro Display Medium a 338 px com tracking −23 (abertura).
- Bowlby One SC: "$8 Billion" gigante atrás dos CEOs.
- Playfair Display Italic na ênfase; Condens.

**Curvas (influências do ease)**
- **100/17**: sai seco e desliza até parar; é a curva mais usada nos 5 projetos (`AV_C.snap` = avE(17, 100)).
- Cartões: 33/0 → 100/17, chega rápido e assenta numa cauda longa (`cartao`).

**Câmera**
- Cadeia de nulls com movimentos sobrepostos: zooms de 33% → 60–100% em 0,4–1,2 s, um começando antes do outro acabar (`nulos`).
- Chegada com giro que assenta: 10° → 0,95° → 0,37° → 0 (`chega`).
- Espiral: um null gira −121,8° e aproxima 2,4× em 1,22 s (`espiral` e a passagem `av:espiral`).
- Grua 3D: y −2292 → 0 em 0,7 s com o foco puxando (`grua`).

**Tipografia** (tudo em `avTexto`)
- Range Selector Offset −100 → 100: palavra por palavra no lugar (`offset`).
- Randomize Order com Random Seed 0 → 32: letras acendendo sorteadas nos nomes de marca (`aleatorio`).
- Máquina de escrever ~22 letras/s com cursor de bloco sobre vídeo (`digita`).
- Caixa de seleção alargando 494 → 572 → 676 px com 4 alças (`selecao`).

**Entradas**
- Cartões vêm de ~1000 px fora com giro de 13–18° e assentam em ±2°, com duas piscadas de entrada (1,0,1,0 em 0,13 s).
- Os CEOs sobem de baixo em 0,55 s (`entra.k: 'sobe'`).
- Estouro do logo: 5 formas saem do centro em 0,08 s e derivam girando por ~3,5 s, com anel de flash (`avEstouro`).

**Presets de corte**
- **Flex:** 1–3 quadros invertidos + RGB separado + superexposição e assentamento vertical com borrão.
- **Impact:** tremor de 10 Hz, 0 → 20 → 0 px em 0,34 s, com brilho e borrão no mesmo envelope.
- **Estalo:** 5 cópias alternando cor e P&B a cada 2 quadros por 0,4 s.

**"Premium Adjustment"** (comp de acabamento a 16 q/s, virou o look `premium`)
- vinheta oval;
- bolha de brilho em add;
- flicker de exposição;
- ruído duplo;
- borda borrada com prisma;
- faixa de luz horizontal tremendo;
- textura em screen (`av_tex03`).

## 2. Twitter (+ pacote Retro FX)

- **Stop-motion de verdade:** comp StopMotionFX e camadas com passo próprio (cenas a 5, 8 e 3 q/s: opção `fps` da camada). Objetos 3D giram
  em Y por degraus, mantendo cada orientação por ~0,26 s (`degrau`).
- Prédios sobem em 1,3 s com a curva 17/100 → 100/17 (`sobe`). O chicote de câmera usa 99/1 (`seco`).
- **Sombra dura de adesivo:** opacidade 100%, direção 292°, distância 18, suavidade 14 (`sombra: 'adesivo'`).
- **Contorno que ferve:** Stroke amarelo + 2× Turbulent Displace no posterizeTime (`contorno`; a madrasta da demo).
- **Odômetro** de números rodando (`contador`).
- **Fontes:** Franklin Gothic Demi ×41 e Demi Italic ×12 (a skill copia a Franklin do Windows), Arial ×100 nas UIs falsas.
- **Efeitos:** Drop Shadow ×45, Levels ×25, Tint ×16, Black & White ×14, Wiggle-rotation ×9, Mosaic ×5, Puppet ×5, Posterize ×5,
  CC Bend It, Wave Warp, Turbulent Displace.
- **Retro FX:**
  - FilmFX: sépia, poeira, riscos, tremor no passo 20, furos de película → `look: 'filme'` por cena;
  - VHSFX: aberração 4,5 px, faixa rolando, PLAY + contador, saturação .82 → `look: 'vhs'`.
- **CC Page Turn** nas viradas de página (0,31–0,45 s) → `av:pagina`.

## 3. Discord (pixel)

- **Fonte:** Jersey 10 ×28 (letra de pixel; a skill faz com Archivo + filtro `avPixT`), Inter Bold, Geist SemiBold.
- **Efeitos:**
  - Drop Shadow ×116;
  - Turbulent Displace ×46: tudo "ferve";
  - Mosaic ×43;
  - **S_WipePixelate ×40**: a passagem `av:pixel`, mosaico crescendo na velha e diminuindo na nova;
  - Fractal Noise ×21, Glow ×20, Roughen Edges ×12, S_Shake ×3.
- **Viagem:** estrada vertical de 1560×3197 rolando por 110 s (fundo que anda para trás → `desliza` e `avViagem`).
- Look `pixel`: linhas de varredura, aberração forte, passo 12–15.

## 4. Sony Walkman + Bryan Johnson (pacote Texture+Sauce)

- **Efeitos:**
  - Slider ×235 (rig de controle);
  - Fill ×73;
  - Minimax ×70 e Shift Channels ×67: borda e aberração;
  - Roughen Edges ×34, Glow ×34, Black & White ×18, Tint ×14;
  - CC RepeTile ×11: fundo que se repete na viagem;
  - Puppet ×10, Directional Blur ×8, Quick Chromatic Aberration ×6, Venetian Blinds ×6;
  - Scribble ×5 e CC Burn Film ×3: `av:queima`, 0 → 98 em ~1 s;
  - CC Spotlight ×3: `holofote`, cone 91 → 24.
- **Fontes:** Basic Sans SemiBold ×134 (legenda), Instrument Serif Italic ×46 (ênfase), Fraunces 72pt Bold.
- **Legenda doc:** 1–2 palavras no meio-baixo, com cada letra tremendo no passo pela expressão
  `posterizeTime(fps); seedRandom(índice + 456 + floor(time*fps))`. Isso virou `renderCaptions` e o modo `tremido`. A legenda da skill usa
  Poppins 600 + Playfair itálica amarela na ênfase.
- **Callouts a 12 q/s:** trim path + posterizeTime(12) que ferve 2–3 px a cada passo (`avRisco`: círculo, seta, sublinha, marca, xis,
  caixa, rabisco). O doppler são anéis de 0 → 356 px com traço 7 → 3 (`ondas`).
- **Viagem do avião:**
  - o sujeito fica parado no centro com o passo, e os fundos trocam (deserto → montanha → mar) a cada 0,2–0,27 s;
  - borrão direcional de 12 px andando para trás;
  - vento em add + turbulência;
  - tudo isso virou `avViagem`.
- **Câmera 3D:** travessias longas com 17/95 → 90/0 (`glide`).
- **Mundo P&B com o assunto colorido:** placa "clean" P&B + recorte colorido (`pb`).
- **Sombra no chão:** CC Slant −36 + blur 33 (`sombra: 'chao'`).
- **Texture+Sauce = look `retro`:** retícula em overlay, grunge em screen, papel, persiana, borda borrada com aberração, tremor no passo
  12, vinheta, grão sorteado a cada passo, flicker de exposição e pulso de borrão em cada corte.

## 5. Microsoft Teams

- Comp Calender de 2314×1557 com CC Page Turn ×4: folhas de calendário virando, que viraram `avFolhas` (na demo, até setembro).
- Cursor Shape ×2 e CC Light Sweep ×2: cursor clicando e brilho passando, guardados para telas de app.
- 4-Color Gradient ×10 (fundos de gradiente vivo), Noise HLS ×5, Optics Compensation ×4.
- Google Sans: a UI do produto; na skill fica Inter.

## 6. High heels e Russia plague (já estudados)

- **High heels:**
  - 13 q/s de stop-motion;
  - câmera de nulls sobrepostos;
  - sombras longas (Shadow Studio, 145–1012 px);
  - mundos de papel;
  - é a base da vox-edit2.
- **Russia plague:**
  - mundo em camadas com profundidade e câmera {x, y, z, r} (eaPalco/eaCamada);
  - vídeo real a 30 q/s;
  - mattes;
  - jornal, parede e sala com TV;
  - é a base da edit-earn.
- A edit-avancada **usa o motor da edit-earn como 1ª camada** (`work/<pref>_a.js` = componentes.js dela). Tudo acima é a 2ª camada.

## 7. Tutorial Listerine

- **Formas como matte:** hexágono, pentágono, quadrado e triângulo coloridos crescem com 1–3 quadros de diferença ("revealed exactly at
  the difference of one, two, three frames"). A última forma, um círculo, é a matte da cena seguinte → `av:formas` (0,5 s).
- **Papel revelando:** máscara redesenhada a cada 2 quadros (`revela`, 0,27 s em 4 passos).
- **Garrafa tremendo:** `posterizeTime(5); wiggle(8,10)` (`tremor: {f: 8, a: 10, fps: 5}`). No texto, wiggle(3,10).
- **Wiggly selector:** posição 4–6 px e giro 6° por letra no passo 8 (`mexido`).
- **Ritmo de montagem:** uma troca a cada 3 quadros (`avFolhas` com passo .1).
- **Sombra:** cópia preta desfocada e deslocada ("just blur it to make enough shadow") → `sombra: 'suave'`.
- Câmera 3D com nó de órbita e camadas em 3D (renderizador Cinema 4D) = o palco da edit-earn com `p` e câmera.

## 8. Tutorial Lamborghini vs Ferrari (memória tutorial-earn-lamborghini)

- Papel revelando a cena por máscara.
- Borda branca de adesivo: Simple Choker −50 + Roughen + Fill (`borda`).
- Rodas girando e chão em esteira (na vox-edit2).
- Ciclo de caminhada por fórmula.
- Acabamento retrô.

## O que os 9 têm em comum (vira regra da skill)

1. **Tudo anda no passo:** 12–16 q/s no acabamento, 5–13 em objetos, 12 nos rabiscos, enquanto o vídeo real roda a 30 q/s (`avPost`, `fps`).
2. **Curva 100/17 em quase tudo:** sai seco, desliza até parar. Ease simétrico quase não aparece.
3. **Câmera em cadeia de nulls:** cada movimento num null, sobrepostos. Os giros grandes ficam no gancho e nas viradas.
4. **Profundidade por camadas:** fundo desfocado, assunto recortado com sombra longa ou de adesivo, textura por cima.
5. **A fala vira tipografia em momentos escolhidos** (digitar, seleção, sorteio, contador, palavra gigante atrás do assunto); no resto,
   legenda doc de 1–2 palavras.
6. **Rabiscos à mão que fervem** apontam o que importa (círculo, seta, marca-texto, xis).
7. **Passagens com textura** (página, queima, pixel, formas, espiral) e **golpes no corte** (flex, impacto, estalo), um por emenda,
   escolhidos pela fala.
8. **Acabamento único por vídeo:** retícula, grunge, grão, flicker, borda com aberração e vinheta, sempre o mesmo look do começo ao fim.

## O que ficou de fora e por quê

- **Glow forte (Deep Glow ×51 do Stripe):** brilho neon é "slop" para o Felipe (memória vox-editorial-style). Ficou só a bolha suave do look premium.
- **3D de verdade (C4D, Puppet):** caro, e o palco 2,5D da edit-earn resolve. Puppet de pessoa real fica proibido (rosto real deformado).
- **Velocidade do Stripe** (corte a cada 0,7–0,8 s): as réguas do motor foco reprovam. A skill mira 30–60 cortes/min, com um estímulo
  novo a cada ~0,6 s dentro das cenas.
- **Adaptados para o olho (régua de leitura da demo):**
  - os buracos do Burn Film nascem perto do centro, porque pela tela toda o olho pulava de um para outro;
  - o pulso de borrão do Texture+Sauce sai no corte entre dois enquadramentos do mesmo print (`semPulso`);
  - a legenda doc fica logo abaixo do assunto (`legY`), e não sempre no mesmo meio-baixo.
- **UIs falsas** (cursor, Teams, Twitter): só com OK do Felipe (marca de terceiro desenhada = regra 6 do kit).
