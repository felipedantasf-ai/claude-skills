---
name: edit-avancada
description: Formato "edit avançada", vertical 9:16, com o Kit_Edicao_Vox_v2. Soma dos 9 materiais da EarnEdits de 07/11/2026 (After Effects do Stripe x OpenRouter, Twitter, Discord, Walkman com Bryan Johnson, Microsoft Teams, High heels e cientista russa, tutoriais Listerine e Lamborghini) sobre o motor da edit-earn. Cada frase vira um mundo em camadas com câmera de nulls (chegada com giro, zooms sobrepostos, espiral, grua), curvas do After Effects e passo de stop-motion, vídeo real sempre a 30 q/s. A fala vira tipografia (digitada, seleção, letras sorteadas, contador, palavra gigante atrás do assunto), com rabiscos à mão que fervem, holofote, estouro de formas, fila de figuras, folhas de calendário, viagem, sombra longa e contorno que ferve. Passagens pela fala (página, queima, pixel, formas, espiral, flex, impacto, estalo), legenda doc de 1–2 palavras, looks retro, premium e pixel, réguas do motor foco. Use quando o Felipe pedir "edit avançada", "minhas edits mais avançadas" ou "o que aprendeu com a EarnEdits".
---

# Formato edit-avancada (a soma dos materiais da EarnEdits)

Em 07/11/2026 o Felipe mandou 9 materiais da EarnEdits (7 projetos After Effects e 2 tutoriais) e pediu uma skill nova, "para as minhas
edits mais avançadas, somando tudo que você aprendeu". Os `.aep` foram lidos direto do binário (efeitos com valores, chaves, curvas,
expressões, fontes). A análise com os números de cada técnica está em `ANALISE_REFERENCIA.md`.

A skill é uma **2ª camada sobre o motor da edit-earn**: o palco em camadas com profundidade, a câmera {x, y, z, r}, o vídeo real a
30 q/s, os mattes, `jornal`, `parede`, `salaTV`, `presEA` e a trilha de trap documental continuam os dela. **A edit-earn tem de estar
instalada ao lado** (`~/.claude/skills/edit-earn`). Os componentes da edit-earn funcionam dentro dos projetos desta skill.

Ela NÃO replica um vídeo só: cada técnica entra quando a fala pede (tabela "fala → técnica"). O que vale de todas as skills continua
valendo: as regras do kit, o motor foco e as réguas de leitura, o apresentador limpo olhando a câmera, e o vídeo real que nunca trava.

## Arquivos desta pasta

| arquivo | o que é |
|---|---|
| `motor_av.js` | O motor (vira `work/<pref>_b.js`). Seções 0–9: looks, curvas, câmera de nulls, camadas, tipografia, rabiscos, efeitos, cenas, passagens, acabamento e legenda. Cada opção tem comentário com a origem e os números. |
| `estilo_av.css` | Faces Inter e Franklin; esconde `#cap`, `#prog` e `#grain` do kit (a legenda e o grão são do motor). |
| `preparar_av.py` | Prepara o projeto: texturas, roda o `preparar_earn.py` da edit-earn, fontes, motor, `<pref>_c.js` inicial e `etapas.json` (montar desta skill, trilha da edit-earn). `--so-clipes` atualiza `clipn.js` + `make_assets` depois de copiar clipes/imagens. |
| `montar.py` | Junta `work/<pref>_[a-z].js` em `render/scenes.js` e confere: sintaxe; palavras de `c.w`, `avW` e `em:` (e avisa quando `c.w` pega OUTRA palavra pelo prefixo); sequência de beats; passagens; apresentador; ritmo. |
| `previas.py` | Folhas de prévia por cena (`--cenas`, `--pontos`, `--tempos`) em `out/pv/cenas_*.jpg`. |
| `movimento_clipe.py` | Mede a panorâmica de cada clipe real em janelas de 0,8 s (`<proj> <clipe>...`). Rode ANTES de escolher o clipe e o `from`: travelling rápido estoura a régua de leitura. |
| `texturas/` | 6 texturas em tons de cinza tiradas dos pacotes (retícula, grunge, papel, linhas, textura premium, luz de janela). Ver `CREDITOS.txt`: só vídeos do Felipe e dos clientes dele. |
| `cenas_exemplo.js` | As 20 cenas da demo (Jack Daniel's, 32 s), comentadas cena a cena com a fala e o porquê da técnica. **Leia antes de escrever cenas.** |

## As regras (valem para toda cena)

1. **Motor foco:**
   - um assunto por vez, grande e no centro (x 540; use `fx`/`fy` do fundo para centrar o assunto do clipe);
   - um texto por vez e parado (a legenda some sozinha quando a cena mostra um texto);
   - a câmera aproxima com zoom e não varre;
   - cada efeito acontece sozinho;
   - a legenda fica logo abaixo do assunto, a no máximo ~250 px do foco dele (`legY` por cena). Com a legenda em 1330 e o assunto em
     750–1000, o olho vai e volta, e cada ida passa dos 300 px de um salto na régua (na v3 da demo, 14 dos 23 saltos tinham a legenda numa das pontas).
   Zoom com deslocamento grande até um detalhe reprova na régua (panorâmica > 8 px/q). Para mostrar o detalhe, faça um **corte seco para
   o detalhe já enquadrado** (`base: {x, y, z}`), como as cenas 7 → 8 da demo.
2. **Passagem nasce da fala, nunca é padrão:** página quando "vira" a história, queima no fogo/destruição, pixel no anonimato/"ninguém
   sabe", formas na pergunta ou na revelação, espiral no mergulho no passado ou no drop da trilha, flex no susto, impacto no número forte,
   estalo na virada de tom. Uma passagem especial por emenda; o `montar.py` avisa se a mesma se repete em cortes seguidos.
3. **Vídeo real a 30 q/s do começo ao fim**, mesmo com o resto no passo:
   - o clipe tem de caber no tempo em que a cena fica na tela (cena + passagem seguinte; a pixel conta metade);
   - clipe curto pede uma de três saídas: comece a cena na palavra (`em:`), troque de assunto antes, ou use corte seco na emenda seguinte;
   - o `clipe_parado.py` roda no `fechar` e bloqueia a entrega com TRAVADO/LENTO.
4. **Apresentador limpo** (`presAV`): sem retícula, grunge ou papel, tremor e grão mínimos, só olhando a câmera.
   - 1–3,5 s por aparição (gravação real até 4 s), nunca duas seguidas.
   - A cena depois de um apresentador curto entra em **corte seco**: passagem com a cena velha visível faria o clipe dele dar a volta.
5. **Dado na tela = ano e fonte em letra pequena** (regra 2 do kit), como o contador "14 MILHÕES" da demo com
   "CAIXAS DE 9 L · 2024 · THE SPIRITS BUSINESS". Fala imprecisa fica na fala, sem reforço na tela, com aviso na mensagem final.
6. **Pessoa real em imagem gerada só com OK do Felipe** (regra 4 do kit). Sem OK, use foto de arquivo real recortada ou pessoa anônima
   (de costas, silhueta, mãos). Logo oficial de arquivo pode; logo desenhado ou gerado só com OK.
7. **Sem título dizendo o que é a imagem.** A tela mostra a palavra dita; o texto na tela é a própria fala ou um dado.

## Looks (um por vídeo, `window.AV_LOOK` no topo do `<pref>_c.js`)

| look | de onde | acabamento | legenda | passo |
|---|---|---|---|---|
| `retro` (padrão) | Walkman Texture+Sauce + Listerine + Lamborghini + Twitter | retícula overlay, grunge screen, papel, persiana, borda borrada com aberração, tremor no passo 12, vinheta, grão, flicker, pulso de borrão no corte | Poppins 600 76 px creme + Playfair itálica amarela na ênfase | 15 q/s |
| `premium` | Stripe "Premium Adjustment" + Teams | vinheta oval, bolha de brilho, flicker 10 q/s, ruído, prisma na borda, faixa de luz, textura em screen | Inter 600 70 px branca + Playfair itálica | 21 q/s |
| `pixel` | Discord | linhas de varredura, aberração forte, letra de pixel | pixel (Archivo + filtro) | 12 q/s |

- Extras por cena: `look: 'filme'` (sépia, poeira, riscos, furos de película) e `look: 'vhs'` (aberração, faixa, PLAY + contador),
  do pacote Retro FX do Twitter. Use no flashback ou no arquivo antigo, uma vez por vídeo.
- Paleta da cena: `window.AV_LOOK` dá as cores (`avLook().cores`), e a demo fixa três constantes no topo
  (`DM_AM` amarelo, `DM_VM` vermelho, `DM_CR` creme).

## O roteiro decide a técnica (fala → técnica)

| na fala | técnica | na demo |
|---|---|---|
| gancho (pergunta, "me diz uma coisa") | vídeo real com `cam.chega` de giro 8° (giro grande só no gancho e nas viradas) | S1 garrafa |
| apresenta a pessoa ("quem é o tal…") | recorte P&B com `borda` + `sombra: 'longa'` entrando `sobe`; nome gigante `atras: true` em `aleatorio`; `circulo` no rosto | S2 |
| número grande | `contador` com ano e fonte embaixo; fundo desfoca no número (`fundoOp.foco`) | S3 "14 MILHÕES" |
| coisas que caem/chegam (caixas, cartas) | camadas `entra: {k: 'cartao', pisca: true}` + `degrau` (3D stop-motion) + `sombra: 'adesivo'` | S3 caixas |
| lugar, mercado, país, escala | clipe real de câmera parada + `av:estalo` no corte | S5 linha de engarrafamento |
| "ninguém sabe", anonimato | `av:pixel` revelando a foto real; `holofote` fechando no rosto; `interroga` | S6 |
| documento, prova, página real | print REAL na mesa em corte seco; corte seco e limpo (`semPulso`) para o detalhe; `circulo`, `xis`, `marca` a < 300 px um do outro na tela | S7–S8 Wikipédia |
| fogo, destruição | `av:queima` (nasce do meio) + `tremor` de calor + `mao`; legenda perto das chamas | S9 |
| data, mês, calendário | `avFolhas` (folhas virando a cada 3 quadros) + `circulo` no mês; sem legenda (as folhas já escrevem o mês) | S11 setembro |
| "não sabe quando", lacuna | `digita` com interrogações (NASCIMENTO: ??/??/18??) sobre o vídeo desfocado + `av:formas` | S12 |
| nascimento, origem, lugar com nome | `av:espiral` + chegada aproximando com o foco puxando (`grua {y: 0}`) + `drop` da trilha; `ondas` no ponto; `selecao` no nome | S13 Tennessee |
| quantidade de pessoas, "caçula de 10" | `avFila` (figuras saltando juntas, a destacada menor e vermelha) + `circulo` nela | S14 |
| morte, perda, passado distante | `av:pagina` + `look: 'filme'` + `janela` (luz de janela) | S15 berço |
| fuga, caminhada, viagem | personagem de costas no centro com `mao`; `pb` na virada; soco de zoom `seco` | S16 menino |
| vilão, ameaça | silhueta com `contorno` que ferve + `impactos` + `av:flex` | S17 madrasta |
| nome de pessoa citada | foto inteira no fundo + recorte alinhado por cima; nome gigante ENTRE os dois (`atras`) | S19 DAN CALL |
| produto, marca, revelação final | `pb` no mundo + logo oficial em `screen` + `avEstouro` atrás + `impactos` + soco de zoom | S20 |
| viagem longa, "atravessou o país" | `avViagem` (sujeito parado, fundos trocando a cada ~0,23 s com borrão e vento) | — |
| lista falada, ranking | `selecao` palavra por palavra ou `offset` | — |

## API do motor (assinaturas e opções completas no `motor_av.js`)

**Tempos:** use `avW('B03', 'palavra', desloc)` e `avB('B03', desloc)`.
- Procuram a palavra INTEIRA primeiro e só depois o prefixo; número = índice.
- O `c.w` do kit pega o 1º prefixo e cai na 1ª palavra sem avisar: `c.w('B09', 'que')` pegava "Quem" e o texto saía antes de entrar.
- O `montar.py` confere todas as palavras e avisa a ambiguidade.
- `em: 'B05:ninguem'` = a cena começa na palavra (`pre`, padrão 0,08 s, antes dela). A cena seguinte pode repetir o beat.

**Cenas**
- `cenaAV(beats, o)`. Principais opções de `o` (lista completa no comentário do motor):
  - entrada: `em`, `pre`, `tr`, `trDur`;
  - fundo: `fundo` (asset ou `'clip:nome'`), `fundoOp {from, folga, fx, fy, foco: [[t, px]], cor (filtro só do fundo), pb, repete}`,
    `fundoCor`, `cor` (mundo inteiro);
  - conteúdo: `camadas`, `textos`, `riscos`, `holofote`, `estouros`;
  - efeitos no tempo da cena: `impactos`, `flex`, `estalos`, `flashes`, `pb`;
  - acabamento: `look`, `janela`;
  - legenda: `legenda`, `legOff`, `legY`, `legFundo`, `enfase`;
  - corte: `semPulso` (corte limpo, sem o pulso de desfoque do look, para o corte entre dois enquadramentos do mesmo print/foto);
  - som: `sons`, `boom`, `drop`;
  - código: `build(r, S, c)`, `update(S, c)`.
- `avViagem(beats, {sujeito, sujOp, fundos: [...], de, passo: .23, vel: 260, borrao, vento, ...cenaAV})`.
- `presAV(beats, 'clip:nome', {em, pre, from, lead, enfase, ...})`: `from` = ponto do clipe (s) no começo da cena. Acerte para a boca
  casar com a fala (na demo, os clipes do jd_tng começam ~.13 s antes da palavra: `em` na palavra, `pre: 0`, `from: .13`).

**Câmera** (`cam: {...}`; z multiplica, x/y/r somam)
- `base {x, y, z, r}`: onde a câmera olha.
- `nulos [[t, d, {z, x, y, r}, curva]]`: movimentos sobrepostos. Curvas: `snap` 100/17 padrão, `seco` chicote, `suave`, `sobe`, `glide`, `cartao`, `linear`.
- `chega {r, z, d}`: padrão giro 5°, z 1.1, .5 s; `false` = sem.
- `sai`: chicote até o corte; `false` em corte casado.
- `mao` (px), `espiral {t, d, r, z}`, `grua {y, z, d, foco, curva}` (`y: 0` = só aproxima com o foco puxando).

**Camadas** (sobre a `eaCamada` da edit-earn)
- `fonte`, `x`, `y`, `w|h`, `cobre`, `folga`, `p` (profundidade), `rot`, `vida`, `entra {k: 'cartao'|'sobe'|'corte'|'pop'|…, t, d, dir, pisca}`, `sai`, `ate`.
- `sombra: 'longa'|'adesivo'|'chao'|'suave'|{tipo, ang, comp, a}`, `borda` (px de adesivo branco), `contorno: cor|{cor, px}` (ferve), `pb`.
- `tremor {f, a, fps}`, `bob {a, per}`, `degrau {a, passo}`, `revela {t, d, passos, de}`, `desliza` (px/s), `fps`, `filtro: lt => css`.

**Textos** (`textos: [...]`, fixos na tela; `atras: true` = entre o fundo e as camadas)
- Modos:
  - `offset` (palavras acendendo);
  - `aleatorio` (letras sorteadas);
  - `digita` (`cps`, `apaga`; as letras já ocupam o lugar, então a linha não anda);
  - `selecao` (`caixa`, `ws`);
  - `tremido`, `mexido`;
  - `contador` (`de`, `ate`, `fmt`, `pre`, `suf`).
- Posição e tipo: `x`, `y`, `s`, `fam`, `peso`, `cor`, `larg`, `lh`, `sombra`, `css`, `sai`, `som: false`.
- `avGigante(txt, {s})` vira camada (palavra gigante atrás do recorte).

**Riscos** (`riscos: [...]`, desenham no passo 12 e fervem)
- Tipos: `circulo`, `sublinha`, `seta` (`ang`), `marca` (marca-texto), `xis`, `rabisco`, `caixa`, `ondas`, `interroga`.
- Opções: `t`, `d`, `x`, `y`, `w`, `h`, `cor`, `larg`, `sai`.
- No mundo: `camada: i, rel: [x0, y0, x1, y1]` (frações da imagem; meça os pixels da imagem antes).

**Efeitos**
- `holofote {t, d, x, y, r0, r1, a}`.
- `avEstouro(par, S, c, {t, x, y, n, tam, dist})`.
- `avFila(r, S, c, {t, n, porLinha, x, y, esp, tam, passo, destaque, cor, corDest})`: `t` negativo = já há figuras no corte.
- `avFolhas(par, S, c, {t, passo, x, y, w, h, meses})` + `avRel(lay, [x0, y0, x1, y1])` para casar com a imagem.

**Passagens** (`tr` da cena que entra)
- Com a cena velha visível:
  - `av:formas` .5 s;
  - `av:pagina` .45 s;
  - `av:queima` .9 s (os buracos nascem a ±300 × ±420 px do centro);
  - `av:pixel` .5 s (a velha só na 1ª metade);
  - `av:espiral` .45 s.
  - `trDur` ajusta. Os textos da cena velha saem no começo da passagem.
- No corte (`D = 0`): `av:flex`, `av:impacto`, `av:estalo`.
- As transições do kit (`gl:*`, `defocus`…) e as da edit-earn continuam valendo.

**Legenda doc**
- 1–2 palavras (≤ 16 letras) em y 1330 (padrão), com cada letra tremendo no passo.
- Números e as palavras de `enfase` saem em serifa itálica amarela.
- Some quando a cena mostra um texto ou tem `legenda: false`.
- Um pedaço de frase que começou numa cena que escondia a legenda (texto na tela, `legenda: false`) ou que a punha noutra altura (`legY`)
  não reaparece na cena nova. O pedaço começa 0,03 s antes da palavra e o texto entra NA palavra, então o motor dá 0,12 s de folga (sem
  ela, o "Tennessee" que a seleção cobria voltava por 2 quadros na cena seguinte). Pedaço que já estava à vista continua igual depois
  do corte, porque esconder resto curto em todo corte fazia a legenda piscar e a régua contava dois saltos de foco por emenda.
- `legY` põe a legenda logo abaixo do assunto, a ≤ 250 px do foco dele. A demo usa 1150 com o assunto em ~850–960, e 430 no gancho
  (o rótulo branco da garrafa ocupava o meio-baixo). Trocar de altura entre cenas é aceitável quando segue o assunto; o pedaço que
  começou noutra altura não reaparece.
- Fundo claro (papel creme, céu): `legFundo: true` põe um véu escuro suave atrás. O véu vira o ponto mais saliente da tela, então só
  use com o assunto perto da legenda. Em página ou calendário que já escreve a fala, prefira `legenda: false`.

## Material (ordem de preferência)

1. **Vídeo real** do assunto (trecho baixado com `ferramentas/baixar_trechos.py`, recortado 9:16, em `render/clips/<nome>/` + `preparar_av.py <proj> --so-clipes`).
   Confira marca d'água num quadro do meio e a câmera com `movimento_clipe.py` (trecho parado ou zoom lento; travelling só se a cena for a própria viagem).
2. **Foto de arquivo real** (Commons e outros acervos com licença): recorte com `ferramentas/recorte_hq.py`.
   - Use a foto inteira no fundo e o recorte ALINHADO por cima (mesma `folga`/`p`; o texto `atras` fica entre os dois).
   - Isso fica melhor que placa `_bg` reconstruída, que borra.
3. **Prints REAIS** de páginas (Wikipédia, matérias): na mesa (`f_mesa_madeira` ou outra textura), com zoom ~2× no detalhe para a letra ler no celular.
4. **Imagem gerada** só para cenas anônimas (pessoa de costas, silhueta, objeto, lugar). Qwen local primeiro (`gerar_qwen.py`, trava de estilo e ficha de câmera); Higgsfield se o Qwen não der conta ou se o Felipe pedir.
5. **Logo oficial** em arquivo (branco com `mixBlendMode: 'screen'` sobre fundo escuro).

Depois de copiar qualquer asset para `render/assets`, **rode `make_assets.py` no projeto**. Sem isso a página para com
`READY_ERR asset X não existe`, e a prévia mostra um erro confuso (`_trProx` de undefined).

## Passo a passo

1. **Projeto** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs no fluxo áudio primeiro). Corte e
   beats como no kit: beats curtos, quebrando antes de nomes, números e viradas.
2. **Formato:**
   ```
   .venv\Scripts\python.exe <esta pasta>\preparar_av.py <nome> [--prefixo av] [--look retro|premium|pixel] [--real | --avatar | --sem-apresentador]
   ```
3. **Pesquisa:** cada fato com a fonte (link). O que estiver errado fica fora da tela.
4. **Plano de cenas:**
   - tabela `cena | beats | fala | técnica (da tabela acima) | material | passagem e por quê`;
   - 30–60 cortes/min, cenas de 0,6–4 s, um estímulo novo a cada ~0,6 s nas cenas longas;
   - cada técnica no máximo 1–2 vezes por minuto, para não virar catálogo.
5. **Material** (seção acima) + `make_assets.py`.
6. **Cenas** em `work/<pref>_c.js` (e `_d.js`… se ficar grande), comentadas `// S<n> <tempo> "fala" — técnica e porquê`, copiando a
   estrutura do `cenas_exemplo.js`. Depois `montar.py <nome> <pref> --perfil real|avatar|sem` (na raiz do kit, com o Python do kit).
7. **Prévias:** `previas.py <nome> --pontos 3` e abra todas as folhas.
   - Confira: assunto no centro, legenda legível e logo abaixo do assunto (≤ 250 px), texto que não se sobrepõe, clipe que não acaba antes da cena.
   - Mande a folha ao Felipe se ele estiver acompanhando.
8. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude\<Tema>"`. Faz montar, render, mix, trilha da edit-earn, checa fala, QA, clipe_parado e entrega.
9. **Conferir** (nesta ordem):
   - as emendas `out/qa_emendas_*.jpg`;
   - `ferramentas/medir_leitura.py out/master.mp4 --de T0 --ate T1`, nas janelas SEM apresentador. Metas: saltos ≤ 45/min, miolo ≥ 92%,
     panorâmica > 8 px/q ≤ 10%, zoom ≥ 20%. Janela fora da meta: liste os saltos com tempo e posição (a regra é a do `medir_leitura`:
     centroide dos 3% mais salientes andando > 300 px em 6 quadros sem corte; `--json` grava o foco de cada quadro) e veja de onde
     para onde o olho foi;
   - `ferramentas/texto_na_tela.py <nome>`. Metas: 2+ blocos ≤ 5%, letra ≥ 44 px, letras andando ≤ 3%. Com `--json` dá para achar QUAIS
     letras andam (t, y);
   - `qa_*.jpg`.
10. **Mensagem final** (português, curta): arquivos e onde estão, técnicas, avisos de fala imprecisa com fonte, o que ficou fora da tela,
    créditos de imagem, **Fontes:**.

## Armadilhas vistas na demo (não repetir)

- **Clipe × passagem:**
  - a cena fica na tela até o fim da passagem seguinte (a pixel conta metade; flex, impacto e estalo contam zero);
  - o motor já desconta isso no `eaCenaFim`, mas clipe curto ainda pode não caber; confira com o `clipe_parado`.
- **`fundoOp.cor` vs `cor`:** `cor` escurece o MUNDO inteiro, inclusive cartões e recortes por cima. Para escurecer só o vídeo de fundo, use `fundoOp.cor`.
- **Assunto embaixo da legenda** (rótulo branco da garrafa, S1) → `legY` acima dele. Regra geral: legenda logo abaixo do assunto.
- **Legenda longe do assunto** (1330 com o assunto em 750–1000): o olho vai e volta. Na v3, 14 dos 23 saltos tinham a legenda numa das pontas;
  com `legY: 1150` nas cenas de assunto no meio, as janelas caíram de 59, 46 e 52 para 20, 42 e 26 saltos/min (junto com as
  correções abaixo).
- **Véu da legenda em papel claro** (`legFundo`): é um borrão escuro que puxa o olho. Só use com o assunto perto da legenda; se a cena
  já escreve a fala (calendário, página), prefira `legenda: false`.
- **Corte entre dois enquadramentos do mesmo print:** o pulso de desfoque do look retro faz o foco vagar pelo texto, e a régua não vê
  o corte (a diferença entre os quadros é pequena). Use `semPulso: true` na cena do detalhe.
- **Riscos no print com zoom:** as marcas de uma cena ficam a < 300 px uma da outra NA TELA (distância em `rel` × altura do print ×
  zoom). A 1,9× o círculo e a marca da demo ficavam a 310 px; a 1,7×, a 277.
- **`revela` (papel rasgado) como entrada de cena:** a troca vira gradual, a régua não vê o corte e o olho corre com a borda até o
  ponto mais saliente da página. Use o `revela` numa camada que entra no meio da cena.
- **Céu claro no topo** (nascer do sol, janela): vira o foco e sai do miolo (30 quadros fora na v3). Enquadre o assunto no meio com o
  céu fora do quadro (`base {y, z}`); grua vertical só quando o topo for escuro.
- **Queima pela tela toda:** o olho pulava de um buraco para outro. O motor agora abre os buracos perto do centro.
- **Print pequeno não se lê:** página inteira só como plano de abertura (< 1 s). O detalhe vem num corte para z ~1,9–2.
- **Folha de calendário:** o verso é papel liso (sem o texto espelhado) e o mês some quando a folha começa a subir. Cada folha que
  sobe leva o olho de baixo para cima: na demo foram 3–4 saltos em 1,9 s, com ou sem legenda (tirar a legenda e a caixa não mudou
  a conta da cena). A janela passou porque o resto estava limpo, então use as folhas uma vez por vídeo e longe de outro efeito grande.
- **Datilografado:** a caixa tem altura fixa desde a 1ª letra (`css: 'min-height:2.08em;'` em duas linhas), senão o texto pula quando quebra.
- **Comentário `//` no meio de uma linha** de cena comenta o resto dela. Ponha o comentário no FIM da linha. O `montar.py` acusa a sintaxe.
- **Quadro estourado antes do flex:** corrigido no motor (o efeito só conta depois do corte).
- **Figuras/itens que entram um a um:** comece com `t` levemente negativo, para o corte nunca cair num quadro vazio. Na fila de figuras
  use `passo` ~.015 (saltam juntas) e deixe o destaque para o `circulo`: dez entradas seguidas são dez saltos de olho na régua.
- **Clipe real com travelling** (a prateleira da v1, 45 px/q): sozinho, estourou a panorâmica da janela inteira. Meça com
  `movimento_clipe.py` e use trecho de câmera parada (a linha de engarrafamento entrou no lugar).
- **Tremor de calor** (`tremor` no fogo): amplitude 4 px no passo 8. Com 8 px a imagem inteira salta e o foco pula junto.
- **Texto `atras` com a mão do recorte por cima:** desloque o texto (`x`) para a mão só encostar na última letra.

## Checklist antes de entregar

- [ ] `montar.py` sem aviso (palavras, beats, passagens, apresentador, ritmo).
- [ ] Prévias de todas as cenas vistas; legenda legível e a ≤ 250 px do assunto em todas; nada importante na borda (margem 40 px).
- [ ] Cada passagem com motivo na fala, escrito no comentário da cena.
- [ ] Dado na tela com ano e fonte; nada da fala imprecisa reforçado na tela.
- [ ] Pessoa real só em foto real (ou com OK do Felipe); logo só oficial (ou com OK).
- [ ] `fechar` sem PROBLEMA no qa_lint e com 0 TRAVADO / 0 LENTO.
- [ ] Réguas: `medir_leitura` nas janelas sem apresentador e `texto_na_tela` dentro das metas. Se algo ficar fora, diga qual, quanto e por quê.
- [ ] Mensagem final com fontes.

## Demo (07/11/2026)

- **Projeto:** `projetos/teste_avancada` (prefixo av, look retro). Os primeiros 32,2 s da gravação do Fernando sobre o Jack Daniel's
  (corte do fernando11, B01–B10), 20 cenas e 3 aparições do Fernando de 1,1 s.
- **Material:**
  - clipes reais do jd_tng: garrafa, barris, linha de engarrafamento, quadro antigo e as janelas do Fernando;
  - foto real do Jack Daniel;
  - print real da Wikipédia em inglês;
  - logo oficial;
  - imagens anônimas geradas no jd_tng (fogo no arquivo, calendário, cabana, berço, menino de costas, madrasta em silhueta, pastor de costas, alambique).
- **Entrega:** `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteAvancada\`.
- **Réguas e correções:** os números finais estão na memória `edit-avancada-skill`. As correções que a régua pediu viraram regra:
  - corte para o detalhe no lugar do zoom com deslocamento;
  - datilografado sem recentralizar;
  - textos da cena velha saindo na passagem;
  - legenda logo abaixo do assunto (`legY` 1150 em seis cenas) e sem legenda no calendário;
  - corte limpo (`semPulso`) entre a página inteira e o detalhe, com as marcas a < 300 px uma da outra;
  - queima nascendo do meio; cabana no meio com o céu claro fora do quadro.
