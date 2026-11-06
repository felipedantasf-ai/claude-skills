# Análise da referência — formato TNG (The Numbers Game)

**Referência:** reel da página The Numbers Game (@thenumbersgame1, Instagram, 513 mil seguidores, 8,9 posts por semana) sobre o Mark Goldbridge (The United Stand). Publicado em 20/08/2026, dois dias depois da estreia de *Stick to United* no Disney+.

**Arquivo:** 74,8 s, 720×1280, H.264 High 3.1, 24 q/s CFR, 1,19 Mb/s, áudio HE-AAC 44,1 kHz.

**Como foi medido (04/11/2026):** 19 agentes, cada um medindo uma frente: planos em 4 trechos, tipografia, som, movimento, look, captação e roteiro, mais um crítico e 8 aprofundamentos. Todo número abaixo é medida, não impressão. As medidas e os scripts estão no scratchpad da sessão (`analise/`); as conclusões estão aqui.

---

## 1. O formato numa frase

É uma narração contínua de história de negócio, em ~3,3 palavras por segundo, sem ninguém falando para a câmera. Cada bloco de legenda de 2–3 palavras é um plano real em corte seco, e todos esses planos são material real tirado da internet (YouTube e redes, nunca IA). Dividindo o tempo de tela:

| Tipo de plano | Tempo de tela |
|---|---|
| Personagem em vídeo, com a emoção da palavra, ~34 vídeos diferentes | ~42–50% |
| Fotos reais do personagem | ~8% |
| B-roll de banco em vídeo, sem rosto | ~18–23% |
| Cartões chapados vermelho e branco | ~10% |
| Prints reais de páginas | ~7% |
| Pessoas e marcas citadas, no nome delas | ~6–7% |

Tudo anda a **12 imagens por segundo**. A trilha é um trap escuro com drops nas viradas do roteiro, e o vídeo fecha com um fade para branco.

## 2. Roteiro

- **12 blocos** em 74,8 s: gancho (0–10,35 s), revelação, origem, segredo, fundação, por que funcionou, virada, lista, números, venda, presente e fecho.
  - Tamanho: 242 tokens, 12 frases (média de 20 tokens) e 46 orações (mediana de 4 tokens).
  - Velocidade: 3,29 palavras/s (197 wpm), cerca de 5,3 sílabas/s, sem nenhuma pausa maior que 0,15–0,32 s.
- **Gancho, em 2 frases:**
  - Frase A: identidade improvável + ação escondida + assunto conhecido + lugar humilde ("from his sofa", que vira o cartão vermelho).
  - Frase B: "N anos depois" + patrimônio + evento recente com famoso.
  - O nome só aparece depois do gancho ("Meet X, real name Y"), e no nome cai o DROP da trilha.
- **Fecho:** é uma frase só, repetindo o lugar e o número do gancho. Termina no número, sem CTA, com o mesmo cartão vermelho do lugar e o fade para branco.
- **Números:** 8 menções, uma a cada ~9 s, 3 delas aproximadas ("mais de", "quase"). Na fala vão por extenso; na legenda, em algarismos com símbolo.
- **Marcadores de tempo:** 5 das 12 frases abrem com um ("12 anos depois", "Em 2014", "Então veio…").
- **Metas para pt-BR** (~70 s): 205–225 palavras. Divisão por bloco:

  | Bloco | Palavras |
  |---|---|
  | gancho | 30–37 |
  | revelação | 7–10 |
  | origem | 18–22 |
  | segredo | 20–30 |
  | fundação | 18–22 |
  | por que funcionou | 18–22 |
  | virada | 16–20 |
  | lista | 20–29 |
  | números | 9–13 |
  | negócio | 16–20 |
  | presente | 10–14 |
  | fecho | 18–25 |

## 3. Ritmo e montagem

- **Cortes reais: 75,5 por minuto** (93 fronteiras em 73,9 s), contando os 10 passos da montagem-relâmpago. Sem ela são 67,4/min; só trocas de fonte, ~64/min.
  - Plano mediano de 0,75 s e médio de 0,79 s; o menor tem 83 ms.
  - A régua calibrada é a `regua_cortes.py`: os detectores MAD do kit contam movimento rápido como corte (o `ritmo.py` dá 94/min e mediana de 0,58 s na mesma referência).
- **Curva do vídeo:**
  - O gancho é o trecho mais rápido: 98,5/min com a montagem, 23 fronteiras em 10,35 s.
  - O miolo anda a 69–76/min.
  - O fim desacelera para ~57/min, com planos de 1,0 s e as provas segurando 2,1–2,3 s.
- **1 bloco de legenda = 1 plano:**
  - 83% dos inícios de frase caem num corte (13% por acaso), e o corte cai no 1º quadro do bloco.
  - A mediana do corte em relação à 1ª palavra do bloco é +10 ms, e 97% dos cortes ficam dentro de 200 ms.
  - A imagem que ilustra uma palavra do meio do bloco já entra no começo dele (a polícia aparece 640 ms antes de "Police").
- **O corte segue a fala, não a música:** a distância até a batida é igual ao acaso (p = 0,59).
- **Escolha da imagem, em ordem:**
  1. nome próprio → a entidade literal (22 de 25 menções, ±0,3 s; pessoas famosas, 3/3 no nome);
  2. ação filmável → o personagem fazendo;
  3. emoção → o personagem naquela emoção;
  4. abstrato → B-roll literal;
  5. número ou ano → cartão;
  6. o resto → outro vídeo do personagem.
- **Lista:** um plano literal por item. A trinca métrica de 0,5 s por plano tem a legenda acumulando.
- **Salto de tempo ("N anos depois"):** uma montagem-relâmpago de 11 fotos DIFERENTES de 2 quadros cada (83 ms), 0,92 s ao todo. É a única do vídeo.

## 4. Cadência de 12 imagens por segundo

- 99,3% dos quadros ímpares repetem o par anterior, e 744 de 779 imagens ficam exatamente 2 quadros.
  - Vale para tudo: vídeo real, legenda, contador e deslizes.
  - Todo corte e toda palavra caem em quadro par; só o fade final para branco muda a cada quadro.
- **Na skill:**
  - O render é a 24 q/s, com o tempo da página quantizado em 1/12 s (`floor(t·12)/12`).
  - Clipes extraídos a 24 q/s em tempo real, com índice = início + 2 por degrau.
  - A 30 q/s cada imagem ficaria 3-2-3-2 quadros e o movimento tremeria ±20%.
  - O `render.py` grava os 2 quadros de cada degrau com uma captura só, o que corta o tempo de render pela metade.
- A regra do Felipe "vídeo real nunca trava" **não vale para esta skill** (04/11/2026). A velocidade do vídeo é 1,0×, com aceleração até 1,25× só para caber na frase; câmera lenta, nunca.

## 5. Captação: de onde vem cada imagem (tudo REAL)

| classe | tempo | como é |
|---|---|---|
| personagem em vídeo | 42% (31,4 s) | **34 vídeos-fonte distintos** (cenário + roupa), média de 0,92 s por fonte (mediana 0,75, máx. 2,42), quase sem repetição; lives/reações, estúdio, vlog, podcast, TV, evento; mudo sob a narração |
| fotos posadas do personagem | 8% (6,0 s) | ensaio, evento e divulgação; status e dinheiro ("worth £7.5M" fica 1,67 s, o plano mais longo do gancho) |
| B-roll genérico | 18–23% | **≥75% do tempo em VÍDEO** (86% na REF): banco sem marca (caneta, notas, rua, mãos, teclado, fogos); pessoa genérica só de costas, silhueta ou mãos (0 rostos frontais em 20 planos) |
| pessoas citadas | ~6% | vídeo ou foto REAL delas, no nome (±0,2 s) |
| contexto (clube, empresa, lugar) | ~7% | vídeo oficial vertical do clube ou empresa, celular de torcedor, taça; nunca transmissão com placar |
| telas | ~7% | página do canal no app, página de vídeo com os inscritos sublinhados, carrossel 3D de Shorts reais com views, busca digitada |
| cartões | ~10% | vermelho/branco chapados |

- **Emoção casando com a palavra:** os 9,16 s de grito e surto cobrem 100% das palavras de emoção. Status e dinheiro vão em foto posada; humor e parceria, em riso; o nome, em plano limpo olhando a câmera.
  - O SigLIP 2 já instalado separa grito de fala calma com AUC de 0,84 (`sim("screaming furiously…") − sim("calmly talking…")`).
- **Fontes, por prioridade:**
  1. Shorts verticais nativos;
  2. estúdio 16:9 em 1440 ou 2160p (o crop 9:16 de um 1080p tem só 608 px de largura);
  3. live 1080p;
  4. TV.

  Baixe só os TRECHOS escolhidos, com 1 s de margem, em DASH (não HLS).
- **Personagem bom para o formato:** tem acervo grande (canal, lives, podcasts, entrevistas e keynotes). A meta é ~34 vídeos-fonte por 75 s.
- **A referência erra a moeda:** mostra notas de dólar com a fala em libras. Use a moeda da fala.

## 6. Qualidade e look

- **Conversão para 9:16:**
  - Sempre crop de altura cheia, centrado no rosto: nunca letterbox nem fundo desfocado.
  - Tela dividida 50/50 só quando a fonte já é dividida (costura no meio).
- **Enquadramento do personagem:**
  - Rosto com 0,31–0,43 da altura (mediana 0,347), centro em x 0,46–0,55, olhos em y 0,30–0,38 e respiro acima da cabeça de 0,10–0,17.
  - A legenda em y ≈ 0,49 cai sobre a boca/queixo, e é assim mesmo.
  - Foto posada: rosto com 0,15–0,17 da altura, olhos em 0,25–0,29.
- **Nitidez aceita:** a referência aceita a fonte macia do personagem, inclusive os clipes de grito, que são o pico emocional. A régua, medida em 720:

  | Fonte | Laplaciano | Borda 10–90% | Largura efetiva |
  |---|---|---|---|
  | webcam e YouTube | 45 | 2,9 px | ~520 de 720 |
  | retratos e prints | ~390 | 1,5 px | 651 |

- **Mínimos de qualidade da skill:**
  - Crop de pelo menos 405 px de largura em fonte 1080p, ou 600 px em 4K; o zoom extra de 1,15–2× só no close de emoção.
  - Lanczos, e `unsharp` só na luma quando a imagem é ampliada.
- **Tom, sem LUT:**
  - Cada fonte mantém a própria cor.
  - O traço comum é o joelho nas altas: mídia ≤ Y 244 (p99,9 mediano de 218) e preto p0,1 em 3–5.
  - Webcam com croma médio de 14–25; foto de imprensa dessaturada (croma 6–17, altas quentes b* +6 a +14).
  - Sem grão animado e sem vinheta.
- **Cartões chapados:** vermelho #E70123 (231, 0, 35) e branco #FDFCFC, sem textura, gradiente nem vinheta.

## 7. Movimento

- **Na filmagem, o editor não aplica zoom, pan nem tremor** (escala por plano de 0,97–1,01). O movimento vem da própria fonte.
- **Fotos e prints:** deslize horizontal para a DIREITA (11 de 13), com freio exponencial: x(t) = A·(1 − e^(−t/τ)), τ 0,17–0,43 s (padrão 0,3).
  - Amplitude de 60–150 px nas fotos e ~300 px nas telas.
  - O movimento já começa 1 passo antes do corte.
  - Foto parada também vale (9% do tempo, 0,4–1,3 s).
  - Push-in, só 1 no vídeo inteiro (+2,4%/s).
- **Saída acelerando:** 2 por vídeo, de 2 a 20 px por passo, dobrando a cada 2 passos até o corte.
- **Salto na mesma fonte:** no máx. 3 por vídeo, só no bloco de emoção ou na lista. São 2 pedaços da mesma tomada com ≥0,7 s de salto no tempo e com a pose ou a expressão mudando forte. Na demo de 04/11, um salto numa frase neutra com o mesmo enquadramento pareceu soluço do vídeo e saiu.
  - Não há rotação nem zoom do editor: o "×1,10 + 3–8°" que apareceu nas primeiras medidas era a pessoa se mexendo ou a selfie mudando de ângulo.
  - O enquadramento pode mudar até 230 px de lado.
- **Pop no print:** 1 por vídeo, ×1,246 no meio da palavra, com o x voltando −94 → −45 → −20 → −7 → 0 px em 0,333 s.
- **Transições:** só corte seco. Sem whip, dissolve, glitch nem quadro de flash.
  - Única exceção: o print entra do branco em 2 passos (0,17 s).
  - O fim tem fade para branco começando ~0,34 s depois da última palavra, em 0,46 s (α a cada 1/24 s: .02 .20 .50 .68 .79 .86 .91 .95…), seguido de ~0,42 s de branco puro.
- **Telas animadas:**
  - Print de celular: 435–466 px de largura, sobe 155 px (τ 0,29 s) com leve rotateY presa à esquerda. A lista rola 318 px de saída e depois 912 px/s freando (τ 0,5 s).
  - Print de desktop: 618 px, entra do branco subindo 150 px (τ 0,33 s).
  - Carrossel 3D: parede côncava de miniaturas 9:16 no preto, painel central 489×880–910, gira 307 px (τ 0,43 s), views contando AO VIVO em todos os painéis (120K → 946K em 2 s).
  - Busca digitada: 12 letras/s, a vista seguindo o cursor.

## 8. Tipografia

- **Legenda:**
  - Fonte Inter 700, 60 px, letter-spacing −0,068em, linha de base em y = 959 (`top: 908px; line-height: 60px`), centralizada, nunca em 2 linhas, frase de no máx. 716 px.
  - Branca com sombra quase invisível sobre vídeo (`1.5px 1.5px 3px rgba(0,0,0,.35)`).
  - Branca sem sombra no vermelho; preta no branco e nos prints.
- **Revelação:**
  - A frase inteira já é diagramada e cada palavra acende no lugar, seca (100% da tinta no 1º quadro), sem recentralizar.
  - A 1ª palavra entra no corte; as seguintes, ~+0,15 s depois do início falado (na grade de 1/12 s).
  - A frase fica até a próxima entrar, sem quadro vazio.
- **Texto:**
  - Ponto só no fim de oração: a vírgula que fecha a frase vira ponto, e no meio a vírgula some.
  - Algarismos e moeda como prefixo ("R$ 7,5 milhões").
  - Sem legenda quando a imagem já mostra o que é dito (~10% do tempo): página de vídeo, carrossel, logo e cenário com nome, TV com a marca.
- **Contador (1 por vídeo, o número grande):**
  - "Mais de" sobe 80 px com fade 0,31 → 1 em ~1,3 s.
  - O número entra 0,25 s depois, em serifa itálica fina (algarismo 1,66× a maiúscula da sans; Instrument Serif provável, aqui Californian FB Italic), e conta em passos iguais de 1/12 s durante 1 s.
  - A unidade entra seca quando é falada.
- **Selo:** 153×68 px em (141, 242), #EC0033, sigla em Archivo Black 51 px com tracking de 2,7 px. Fica fixo e sempre por cima até o fade.

## 9. Som

- **Voz:**
  - Masculina e grave (F0 ~130 Hz), seca, muito comprimida.
  - Mix a −14,5 LUFS; pausas de 0,16–0,18 s, máx. 0,32 s, sem respiração (cara de TTS).
- **Trilha:**
  - Trap/drill escuro em meio-tempo, ~78 BPM (77–80), Dó menor.
  - 808 sub com 73,6% da energia abaixo de 60 Hz; clap nos tempos 2 e 4; hats em 16 avos.
  - Começa CHEIA no quadro 0, sem fade-in. Fica ~8 dB RMS abaixo da voz (−11 LU), constante, sem ducking.
- **A trilha segue o roteiro, não os cortes:**
  - BREAK no "N anos depois" do gancho (a música cai 25 dB) e DROP no nome do personagem.
  - STOP de 0,6–0,7 s antes das viradas ("Em 2014", "Então veio…") e DROP na palavra seguinte.
  - Hits em 3 frases-chave.
  - Rolls de hat (fusa em tercina, 64 ms) cobrindo listas de números, o carrossel e as rajadas.
- **SFX:**
  - Clique de texto (~4 ms, agudo, estéreo largo, voz −14 dB) em cada palavra do gancho e em cada palavra ou número dos cartões.
  - Obturador duplo (mono, +51 e +77 ms, voz −11 dB) no corte para foto parada e em rajada a cada 125 ms na montagem.
  - 72% dos cortes são secos: sem whoosh e sem som de corte.
- **Mix final:** −14,1 LUFS, LRA 2,0, TP −0,9. A música segue 0,9 s depois da última palavra e cai junto com o fade para branco.

## 10. Safe zone (Reels/TikTok)

- Tudo que a edição põe (legenda, números, cartões, prints, carrossel, créditos) assenta em **x 140–940 × y 240–1440**; só animação de entrada passa disso, por ≤0,25 s.
- Olhos do personagem entre y 300 e 1300. Fonte de tela dividida precisa de reenquadramento: esse é o único erro de chave da referência (0,67 s).
- Anúncio na Meta: selo em top ≥ 300 ou sem selo.

## 11. Poeira

- É uma camada única e FIXA de poeira e fumaça branca em modo screen, só nas bordas: topo (y < 144) e base (y > 1490).
  - Visível no vermelho e no escuro, invisível no branco.
  - Treme rígida ~1 px a 8 Hz; nunca troca nem pisca.
- Vale para toda a mídia e os cartões, por baixo da legenda e do selo.

## 12. Réguas e metas (QA da skill)

| régua | meta |
|---|---|
| `regua_cortes.py` (calibrada: 93/93 na REF) | 70–80 cortes reais/min (62–72 sem montagem), plano mediano 0,70–0,85 s |
| `montar.py` (página aberta) | personagem 40–56% · cartões ~10% · blocos de 2,6–2,9 palavras · frase ≤ 716 px · 0 erros |
| `cadencia.py` (no master) | r_frame_rate 24/1 · ≥99% dos ímpares repetidos · nenhuma imagem começando em quadro ímpar fora do fade |
| `safezone_organica.py --dom` | texto-chave sob a UI ≤1% do tempo, nenhuma janela > 0,3 s |
| kit `clipe_parado.py` (lê CLIPFPS) | 0 TRAVADO (clipe curto) |
| mix | −14 LUFS, TP ≤ −1 |

O `medir_motion.py` e o `medir_leitura.py` do kit **não servem para contar cortes** neste formato: contam deslize de foto como corte e o `medir_leitura` fixa 30 q/s, inflando 1,25× um vídeo de 24.

## 13. O que as primeiras medidas erraram (corrigido pelos aprofundamentos)

| primeira leitura | o que é |
|---|---|
| 85–95 cortes/min, mediana 0,58 s | detector contando movimento; real 75,5/min, 0,75 s |
| punch-in ×1,10–1,12 com giro de 3–8° | salto de tempo sem zoom do editor |
| B-roll = "film still" com deslize | ≥75% é vídeo |
| sem SFX | clique de texto + obturador em 28% dos cortes |
| cartões sem textura nenhuma | poeira fixa nas bordas por cima |
| "£1 million" = rajada de 7 cortes | um clipe só (máquina de notas) |
| renderizar a 30 q/s | 3-2-3-2 tremido; tem que ser 24 |
