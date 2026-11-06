# Análise do projeto After Effects "High heels: from the battlefield to fashion" (EarnEdits), 31/10/2026

Arquivo do Felipe: `C:\Users\USER\Downloads\high-heels-from-the-battlefield-to-fashion.rar` (1,5 GB).
- **Conteúdo:** `high heels.aep` (59 MB), a pasta `(Footage)` com 710 itens e o relatório do Collect Files (`high heeks.txt`: 62 efeitos e a fonte Adobe Caslon Pro Semibold).
- **Sem render:** o vídeo renderizado (`don,e.mp4`, usado na Comp 2) ficou fora da pasta coletada. Por isso a análise é do próprio projeto, não de um vídeo.
- **Leitura do .aep:** direto do binário (RIFX) com o leitor feito para o projeto da EarnEdits anterior (edit-earn): 258 comps, todas as camadas, chaves com a curva, expressões e efeitos. A narração foi reconstruída das 23 peças da Pre-comp 1 e transcrita com o Whisper large-v3.

## Ficha técnica
| item | valor |
|---|---|
| comp principal | `Comp 1`, 1080×1920, 30 q/s, 40,37 s, **319 camadas numa linha só** (não usa uma pré-comp por cena) |
| exportação | `Comp 2` = o render da Comp 1 + `Soulful.mp3` (soul lo-fi, ~75 BPM, 2:45). Nenhum efeito sonoro |
| narração | ElevenLabs "Jessica Anne Bogart", inglês, 47 s brutos, cortada em 23 pedaços sobrepostos (corte justo, sem silêncio) → 40,4 s |
| tempo | **Posterize Time 13** + Noise 4 num ajuste por cima de tudo (0–40 s): o vídeo inteiro anda a 13 quadros/s |
| cenas | 12 câmeras (Camera 1…23, uma por cena), 1,2–5,2 s cada (média 3,3 s), sempre em corte seco |
| fontes | Tiempos Text Semibold e Adobe Caslon Pro Semibold (serifas), Domine, Bowlby One SC (pesada), Sinoreta |
| kits de terceiros | Atom **Collage Kit Constructor** (papel amassado que se abre, roupas, fundos), **Hand Drawings** (traços, marcas, linhas), RTFX **Backgrounds Grunge** (pré-renderizado), MotionBro **Typography**, texturas SHIIVAstuff e Texturelabs, telas verdes (barra de busca, brilho, chamada) |

## A fala e as cenas (tempos da Comp 1)
| câmera | tempo | fala | o que acontece |
|---|---|---|---|
| 1 | 0–4,4 | "What if I told you high heels were invented by men for war?" | cortinas do Collage Kit se abrindo (0–1,3 s); jornal "HISTORY TODAY" com o gancho como manchete virando a página (CC Page Turn com `wiggle(4,40)`); soldados reais (Ucrânia) e a bota com salto vermelho; manchas de tinta; tira ciano (Paper Cuts 5) |
| 3 | 4,4–5,6 | "In the 10th century," | texto "In the 10th / century" sobre lousa escura com grunge em overlay, desfoque saindo |
| 5 | 5,6–10,8 | "Persian soldiers wore heels to lock their feet into stirrups while firing arrows on horseback." | arqueiros a cavalo (IA) entrando, grupo de cavaleiros, estepe; palavras em 3D ("Persian soldiers", "Wore", "Heels", "their feet", "into stirrups", "while firing", "arrows on horseback") presas aos recortes |
| 7 | 10,8–13,0 | "It was about stability, not style." | as botas persas deslizam da direita; caneta; página de esboços; "stability" com brilho; "Not" / "style" com faísca de tela verde |
| 9 | 13,0–14,1 | "When the trend reached Europe," | mapa antigo da Europa ("Europe anno 1400"), texto digitado |
| 11 | 14,1–18,4 | "kings and noblemen adopted high heels to appear taller and more powerful." | rei no meio, nobres entrando um de cada lado (−805 → −75 e 1908 → 1136 em 1,5 s) com o nome deles (Shine); salão de xadrez; "high heels" em papel com Displacement; "more" / "powerful" caindo com bounce sobre o quadriculado laranja |
| 13 | 18,4–21,1 | "Back then, height was a symbol of status." | transição de grunge em stop-motion; colunas subindo (pedestal), figura no pedestal; "height" / "was a symbol of status" |
| 15 | 21,0–25,1 | "Women didn't start wearing heels until centuries later. In the 1630s," | juiz, silhueta; os anos **1123 · 1376 · 1489 · 1630** entrando com Range Offset e barras crescendo (Shape Layers) |
| 17 | 25,0–28,8 | "some began adopting masculine fashion to challenge gender norms," | mulheres de 1630 com roupa masculina (6 recortes), rua de época; "masculine", "fashion", "To challenge", "gender norms" com bounce |
| 19 | 28,8–32,7 | "and heels became part of that movement. What started as a military invention" | botas em grade (papel pardo, cantos de enquadramento); Heatwave; "military" com Turbulent Displace + Scatterize; recortes com meio-tom (S_HalfTone, Cartoon, Tritone) |
| 21 | 32,7–36,0 | "became one of the most iconic symbols of women's fashion." | três damas de época (IA) num palco com cortina (Cartoon + Tint); "iconic", "symbols", "of women's fashion" |
| 23 | 36,0–40,4 | "Editors, project file on earnedits.com. Visit now and download it." | moldura com fita, polaroides, borda de tinta, papel quadriculado, névoa de chão; barra de busca digitando o site |

## A gramática (o que se repete e virou componente)
- **13 q/s (Posterize Time 13).** É a assinatura: tudo "pula" como colagem animada à mão. Junto, Noise 4. → `e2Poster`, `fps` da `e2Cena`.
- **Câmera em série de nulls.** Cada câmera é filha de 5–7 nulls; cada null faz um movimento só e eles se sobrepõem.
  - Exemplo, Camera 5 (5,6–10,8 s), um null por linha:
    - x −398 → −98 em 5,5–6,9;
    - y +99, z +177 em 5,7–7,4;
    - y +378, z +263 em 6,0–8,2;
    - z −644, y −257 em 6,7–9,5;
    - x +1438 em 6,7–9,5;
    - z +440 em 7,0–10,1;
    - z −690 em 8,0–12,1 (passa do corte);
    - x +384 em 10,3–13,3.
  - As chaves dos nulls saem com influência ~0% e chegam com 66%: arrancam rápido e freiam.
  - A saída começa antes do corte e termina depois, então o corte pega a câmera em movimento. → `e2Rig` (`mov` explícito ou o padrão de 4 nulls).
- **Recortes deslizando de fora** em 1,5–2 s, com curva quase linear (17%/17%) ou que freia (0%/66–76%), em 3D (z 274), e **sombra longa**
  (Shadow Studio 2 em 21 camadas). Dois recortes vindo um de cada lado. → `e2Item` (`entra.de`, `sombra`), `e2Sombra`.
- **Tipografia em 3D presa aos recortes.** Uma camada por frase, as letras animadas por Range Selector:
  - Offset −100 → 100 = desliza, em linear ou easy ease 33/33;
  - Start 0 → 100 = revela/digita;
  - saída por opacidade 1 → 0 ou **BCC Scatterize** (esfarela);
  - palavras que caem com a expressão de inércia (`freq`/`decay`);
  - Shine nos nomes;
  - Drop Shadow / Shadow Studio nas letras.

  → `e2Texto`, `e2Fala`.
- **Fundos:**
  - lousa escura (7 texturas 8K: 45, 60, 64, 66, 70, 90, 97.jpg) com grunge em overlay;
  - papéis: pergaminho, branco, preto com borda, quadriculado Texturelabs, pardo;
  - "Dirty Surface Texture" em *screen* no vídeo inteiro;
  - "Light-Pattern" (luz de janela) em *multiply*.

  → `e2Fundo`, sobreposições automáticas.
- **Collage Kit (Atom):** pré-comps de 8 quadros a ~13 q/s com papel amassado que se abre: tiras de cor (Paper Cuts 1–8), cortinas,
  fogo, nuvens, além de roupas e fundos. → `e2Kit` (14 peças em `texturas/kit`).
- **Grunge em stop-motion (RTFX pré-renderizado):** 4–6 quadros de concreto, sujeira ou papel trocando, usados de fundo e de transição. → `fundo: 'ferve:<nome>'`.
- **Linha do tempo de anos** (cena 15). → `e2Anos`.
- **Acentos:** moldura com fita, polaroides, manchas de tinta da SHIIVAstuff, cantos de enquadramento. → `e2Moldura`, `e2Tinta`, `e2_cantos`.
- **Looks:** Looks por cena, CC Vignette, Tritone, Cartoon + S_HalfTone nos recortes, Deep Glow e Glow, aberração cromática, Heatwave. O
  Deep Glow e o brilho ficaram de fora (o Felipe chama de "slop"); a vinheta e o meio-tom das impressões da vox ficaram.

## Curvas medidas (contagem dos pares de chaves da Comp 1)
| uso | influência saída / entrada | no motor |
|---|---|---|
| nulls de câmera | ~0% / 66% (e 41–48% / 86–96%) | `E2C.cam` |
| texto | 33% / 33% (39 pares) ou linear | `E2C.suave`, `E2C.reta` |
| recortes e outros | 17% / 17% (35), linear (29), 0% / 66–76% (23) | `E2C.lin`, `E2C.pousa` |

## Som
- A comp de exportação tem só duas faixas, o render e "Soulful.mp3". Os dois estão a −16 LUFS, sem chave de volume no projeto.
- A música é soul lo-fi a ~75 BPM (autocorrelação: 150 = colcheias), com energia em 120–400 Hz.
- A vox mantém os sons táteis. A `trilha_edit2.py` sintetiza uma cama no mesmo espírito:
  - piano elétrico FM em Dm9–G13–Cmaj9–A7(b9);
  - baixo redondo;
  - bumbo, aro e chimbal com swing;
  - vinil;
  - passa-baixa.

  A cama fica a −17 dB da voz e cede mais na fala. Não usamos a gravação de terceiros.

## O que muda para os vídeos do Felipe
- Pessoas e personagens históricos: **foto ou vídeo REAL** (Commons, arquivo de telejornal), nunca recorte gerado de pessoa real; o
  projeto usa personagens gerados por IA (reis, soldados, damas), que no vox ficam só para figuras anônimas.
- O jornal do gancho do projeto é inventado ("HISTORY TODAY"). Na vox, manchete só real (matéria com veículo e data) ou a folha da
  instituição com o dado verdadeiro.
- As tiras do Collage Kit são os blocos de cor da vox, então seguem a paleta (amarelo, azul, laranja; vermelho no risco).
- O apresentador (o projeto não tem) entra em círculo, dividida ou cheia, limpo e a 30 q/s.
- A cena tem 5–8 s (a fala do Felipe é mais densa que a narração lenta do projeto), com eventos internos a cada 1–2 s.

## Demo (projetos/teste_edit2)
`trecho_de_projeto.py audio1031 teste_edit2 31.41 69.66` (B19–B40 do ChinaCapitalismo) + `preparar_edit2.py teste_edit2 --prefixo e2`
+ 6 trechos de arquivo do audio1031_cinema em `render/clips/` (`--so-clipes`) + `cenas_exemplo.js`. Fontes dos trechos: New China TV
(30/09/2019, "Birth of new China"), Nuclear Vault ("China Leaps Forward", 1958), AP Archive (09/09/2016, "Mao Zedong Dies - 1976").
