---
name: edit-papel
description: Formato "edit papel" para vídeos verticais 9:16 de curiosidade, ciência, história e economia, feitos com o Kit_Edicao_Vox_v2 — replica os 5 vídeos de referência do TikTok @julianealborna (out/2026). O vídeo alterna 4 mundos em corte seco, um corte a cada ~1,6 s - (1) apresentador em tela cheia com punch-in e legenda curta no peito, (2) B-roll literal trocando na palavra com a frase acumulando na tela, (3) papel creme amassado com fotos P&B em retícula e tipografia mista (sans pesadíssima, serifa fina, letra de mão) que é a própria fala, (4) escuro - pôster preto com duotone pêssego ou ícone branco luminoso com texto minúsculo. Trilha escura baixa que some nas frases de impacto. Use quando o Felipe pedir "edit papel", "formato papel amassado", "formato retícula", "igual àqueles vídeos do TikTok" / "como os vídeos de referência do papel", ou mandar esses vídeos como modelo — com gravação do apresentador ou com áudio + HeyGen (fluxo áudio primeiro).
---

# Formato edit-papel (papel amassado + retícula)

Modelo extraído, quadro a quadro e no áudio, de 5 vídeos do TikTok @julianealborna que o Felipe mandou em 24/10/2026
(`H:\Downloads\v09044g40000*.mp4`, em espanhol, 85–173 s). Os mais novos (cv749… "tu mente te miente", cvhmaf… "alergia/nocebo",
cvh0s9… "silêncio") definem o padrão; csttcs… (relatividade) e csgok1… (nocebo, legenda amarela) são versões mais antigas do canal.

**Antes de planejar, abra as duas imagens desta pasta:**
- `referencia_formato.jpg` — 24 quadros da referência, rotulados por mundo e tipo de legenda.
- `exemplo_teste.jpg` — o que estes componentes produzem (teste com o corte "Alemanha dividida", projeto `projetos/teste_papel`).

Esta skill complementa o kit: corte, beats, render, mix e entrega seguem `H:\Edição Claude\Kit_Edicao_Vox_v2\CLAUDE.md`, e as regras
fixas do Felipe estão na memória (fala nunca muda, checagem com fonte, IA nunca faz rosto de pessoa real, perfil REAL no CTA,
versões _vN sem sobrescrever, tiktok ≤ 29 MB + MASTER). Rode tudo com `H:\Edição Claude\Kit_Edicao_Vox_v2\.venv\Scripts\python.exe`.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | a biblioteca do formato (vira `work/<prefixo>_a.js`): legendas por modo, `presPunch`, `brollCena`/`seqClipes`/`clipe`, papel (`papel`, `tipoFala`, `ret`, `cartao`, `filete`, `seta`, `sublinha`, `roleta`, `barra`+`emerge`, `forma`, `onda`, `ondaCaixa`, `chicote`, `camKeys`), escuro (`poster`, `duo`, `escuro`, `icone`, `rede`, `derrete`), `fimPerfil` |
| `cenas_exemplo.js` | as 24 cenas do teste (0–68 s do corte Alemanha), uma de cada tipo, comentadas — copie a estrutura |
| `legenda.css` | fontes (Inter 400/600/900, Ink Free), legenda sem caixa, grão e vinheta controlados pela cena, sem barra de progresso |
| `preparar_formato.py` | prepara um projeto do kit: fontes, CSS, componentes, texturas, prints de perfil, `clipn.js`, `etapas.json` |
| `papel.py` | gera as texturas `t_amassado` (papel creme amassado, vincos, grão) e `t_preto` (preto com grão) — sem crédito |
| `reticula.py` | foto → retícula P&B de pontos (recorte sem fundo, pessoa, cartão, duotone pêssego, gravura) → `render/assets/r_<nome>.png` |
| `clipes.py` | trechos de vídeo → `render/clips/<nome>/` 30 fps em 9:16 (ou faixa larga), corte de logos, aviso de corte escondido |
| `trilha.py` | trilha sintetizada (arpejo menor ~115 BPM + pad + sub), drops e pancadas, ducking, mix final −14 LUFS |
| `montar.py` / `previas.py` | junta `work/<prefixo>_[a-z].js` e confere sintaxe, palavras, beats e o apresentador (tempo de tela e duração de cada aparição pelo perfil) / folhas de prévia por cena |
| `ritmo.py` | mede cortes/min e planos no vídeo pronto e compara com a referência |
| `referencia_formato.jpg`, `exemplo_teste.jpg` | referência visual e resultado do teste |

## A receita em números (medida na referência)
- **Ritmo:** 32–43 cortes por minuto; plano médio 1,4–1,8 s; mediana 1,1–1,7 s; rajadas de 0,2–0,7 s em listas.
  Plano de mais de 3,5 s só quando há animação dentro (papel com chicote, ícone que se transforma). O teste deu 36/min, média 1,62 s.
- **Tempo de tela** (referência, sem a esquete de abertura, que é do criador e **não usamos**):
  | perfil | apresentador | B-roll | papel | escuro |
  |---|---|---|---|---|
  | gravação real (`--real`) | 44–53%, aparições de 1,5–5 s | 30–37% | 10–12% | 4–12% |
  | avatar HeyGen (`--avatar`) | **~30%** (25–35%), aparições **sempre de 2–4 s** | 40–45% | 14–18% | 6–10% |
  Papel em 2–5 blocos de 1,5–6,5 s; escuro em 1–3 blocos. O `montar.py` mede o apresentador e avisa o que sair do perfil.
- **Voz:** 3,0–3,6 palavras/s. A referência deixa ~0,16 s entre frases; o Felipe prefere o corte justo do kit — mantenha o dele.
- **Áudio:** trilha estéreo ~15 dB abaixo da voz, tom menor, 115–129 BPM, arpejo "pluck" + pad + pulso grave.
  Ela **some de uma vez** em 1–3 frases de impacto (0,7–5,7 s; ex.: "e se eliminássemos todo esse ruído" fica em silêncio literal)
  e volta com uma pancada grave. Whoosh em ~15% dos cortes (entrada de papel/pôster/escuro e chicotes). Nada de som tátil em cada elemento.
  Master −14 LUFS / −1,5 dBTP (padrão do Felipe; no TikTok a referência mede −17 a −19 LUFS).
- **Cores:** papel `#d9cfc2` (creme acinzentado), tinta `#151413`, pêssego do duotone `#ecc9aa`, preto `#0d0d0d`, branco `#f6f2ea`.
  Cor forte só nas imagens de B-roll e, 1–2 vezes por vídeo, numa palavra-chave puxada da imagem (`corChave`).

## Os 4 mundos (tudo em corte seco: `tr: 'cut'`)

### 1. Apresentador — `presPunch(beats, {zooms, passos, capY, mao, lado, z0, look})`
- Tela cheia; o enquadramento **pula** a cada beat (punch-in sem transição): médio 1,0–1,1 ↔ close 1,3–1,4 ↔ close extremo 1,5–1,6,
  com leve deslocamento lateral no close e câmera na mão sutil. Contraste leve e vinheta (`look`).
- Zoom máximo pela fonte: vertical 1080p/4K até 1,6; horizontal 1080p até 1,45; 720p (HeyGen 1280×720) até 1,35 — acima disso fica mole.
- **O perfil depende do material** (regra do Felipe, 24/10/2026):
  - **Gravação real:** como a referência — 44–53% do vídeo, aparições de 1,5–5 s (a última pode ser longa, com punch-in a cada 1–2 s).
  - **Avatar do HeyGen:** aparece menos — **~30% do vídeo** — e **sempre em cortes rápidos de 2 a 4 s**, para não dar tempo de notar
    imperfeições do avatar (boca, mãos, olhar). Nunca mais de 4 s seguidos, nem no final: frase longa do apresentador = quebre com
    B-roll, papel ou escuro no meio e volte para ele. Um punch-in em cada aparição.
  - Nunca duas cenas de apresentador seguidas sem outro mundo no meio.
- Legenda `peito` (abaixo). Palavra emocional da fala em letra de mão: `S.cap = {modo: 'peito', mao: ['corajosa']}`.
- **Fluxo áudio primeiro (HeyGen):** o apresentador só existe dentro das janelas `APRES`. Em `work/apresentador.json`, peças de 2–4 s
  (1–2 beats cada) somando ~30% do vídeo, espalhadas (gancho, perguntas, opiniões, fecho), e `presPunch` só nos beats dessas peças.
  O áudio do HeyGen fica bem menor que o vídeo, o que também corta o custo do avatar.

### 2. B-roll literal — `brollCena(beats, [[t, 'clipe', {from, fx, fy, z0, z1, rate}], ...], {cap})`
- Cada clipe mostra **exatamente** a palavra dita ("trânsito" = engarrafamento à noite; "a eletricidade" = subestação). 1–3 s.
  Listas viram rajada: um clipe por item, 0,4–0,7 s, legenda `palavra`.
- Material: arquivo e notícia reais (YouTube via `ferramentas/baixar_trechos.py`, Wikimedia), banco cinematográfico, animação 3D médica,
  vídeo caseiro/UGC. Sempre com zoom lento (`z0 1.0 → z1 1.06`, padrão). Assunto inteiro no quadro (`fx`).
- Sem logo de emissora, legenda queimada ou tarja (`area=` no `clipes.py`); fonte baixa (< 770 px de altura) não vai em tela cheia: use
  `largo` + `cartao()` no papel. Datas/créditos nos `fontes`.
- Legendas: `acumula` (frase narrativa), `nivel` (palavra-chave forte), `palavra` (lista), `tema: 'claro'` em imagem clara.

### 3. Papel — a fala vira composição
Fundo `papel(r, S)` (asset `t_amassado`, grão animado 0,16, vinheta 0,12; `flip: true` espelha a textura para variar). **Sem legenda
separada** (`S.cap` fica `none`): a tipografia é a fala, entrando palavra por palavra no tempo exato (desfocada → nítida em 0,22 s).
- **Hierarquia tipográfica** (`tipoFala(p, c, 'B12', 's s|B|r r', x, y, {alinha, k, cor, junta})`, um estilo por palavra):
  | estilo | uso | fonte |
  |---|---|---|
  | `s` | frase de ligação pequena ("lo que estás") | Inter 600, 64 px, tracking −0,03 |
  | `B` | a palavra-chave ENORME ("escuchando") | Inter 900, 172 px, tracking −0,055 |
  | `b` | chave média | Inter 800, 108 px |
  | `r` / `R` | complemento em serifa fina ("en este momento", "fuerte") | Playfair 400, 58 / 116 px |
  | `m` / `M` | grito/sintoma em letra de mão caixa alta ("HIEDRA VENENOSA") | Ink Free, 76 / 124 px |
  | `c` | pequena cinza | Inter 500, 58 px, 62% |
  `'sx2|B'` junta 2 palavras num estilo; `-` pula uma palavra; `junta: ['B16','B17']` usa dois beats; `k` escala tudo.
  Linha mais larga que 940 px encolhe sozinha. Alterne alinhamento (esquerda, direita, centro) entre blocos.
- **Layout:** texto no terço de cima (y 420–700), imagem no meio (y 850–1450), nada importante abaixo de 1600 (interface do TikTok),
  margem de 96 px nas laterais.
- **Imagens em retícula** (`reticula.py`): `ret()` recorte sem fundo com sombra suave; `cartao()` retângulo que **abre a partir de uma
  linha** (foto de fundo escuro vira o "cartão preto"); `forma()` escudo/arco/círculo cujo contorno se desenha e enche de foto;
  gravura (`modo gravura`) para órgãos, plantas, mapas antigos.
- **Traços finos:** `filete()` linha de 2 px que cresce do centro (molduras de ano e nome); `seta()` curva à mão; `sublinha()`; `barra()`
  preta como base/buraco de onde o objeto `emerge()`; `onda()` grossa desenhada; `ondaCaixa()` forma de onda de áudio numa caixinha.
- **Números:** `roleta()` — ano/valor rolando com borrão vertical (`de/para` ou `seq: ['4','6','8']`), entre dois filetes, como
  "2025 → 1962 en JAPÓN"; `digita()` para "9 → 99 → 99,99%".
- **Movimento:** a câmera nunca para — `camDeriva(.03–.05)` ou `camKeys([[t, {s, x, y}], ...])` levando o olho ao próximo elemento;
  troca de "página" na mesma folha com `chicote(A, B, lt, t, {dir})` (borrão de movimento 0,26 s) a cada 1,2–2 s; objetos crescem 2%
  depois de entrar. Entradas: `foco` (padrão), `cresce`, `brota`, `sobe`, `lado`.
- Quando usar: nome de estudo/universidade/cientista, ano, número, mecanismo explicado ("está programado para economizar energia"),
  definição, comparação. 2–5 blocos por vídeo.

### 4. Escuro
- **Pôster** — `poster(r, S)`: preto com grão + moldura fina creme; imagem duotone pêssego (`reticula.py … :duo`, `duo()`); tipografia
  creme (`tipoFala(..., {cor: PP.creme})`), seta curva creme, citação entre aspas. Para "fizeram um experimento com…", frases ditas por alguém.
- **Ícone luminoso** — `escuro(r, S)` + `icone(p, 'cerebro'|'nota'|'notas'|'olho'|'lampada'|'raio'|'coracao'|'cadeado'|'cadeadoAberto'|
  'etiqueta'|'moeda'|'pessoa'|'relogio'|'casa'|'sobe'|'desce', cx, cy, 150–250)`: ícone branco chapado com brilho, pequeno, legenda
  `escuro` minúscula logo abaixo; o ícone se transforma na palavra (`e.troca('olho')`, `derrete()`), `rede()` desenha neurônios/caminhos.
  Para ideias abstratas (mente, memória, som, emoção). 1–3 por vídeo.

## Legenda: `S.cap` em cada cena
| modo | onde | como fica (medido) | posição padrão |
|---|---|---|---|
| `peito` | apresentador | 1–3 palavras, Inter 600 54 px, branca, sombra suave, sem caixa | centro, y 1430 |
| `acumula` | B-roll narrativo | a frase cresce palavra a palavra (até 3 linhas), Inter 600 50 px, a última palavra forte em 800; limpa no ponto ou no corte | x 110, y ajustado ao vazio da imagem (`y`, `x`, `alinha`, `larg`, `ancora: 'meio'`) |
| `nivel` | B-roll com palavra forte | 3 níveis: ligação pequena / CHAVE 88–132 px (tamanho pelo nº de letras) / resto; `cauda: 'serif'` | centro, y 960 |
| `palavra` | rajadas e listas | uma palavra grande por vez (80–135 px), ligação curta pequena ao lado | centro, y 960 |
| `fala` | fala de terceiro com áudio próprio (entrevista, discurso, arquivo inserido) | pequena (42 px), à esquerda, perto da cabeça de quem fala, palavras novas cinza → brancas | x/y por plano |
| `escuro` | ícone luminoso | minúscula (34 px), sans + serifa alternadas, palavras acendendo com brilho | centro, y 1100 |
| `none` | papel e pôster | a composição já é a fala | — |
- Opções: `mao: ['palavra']` (letra de mão), `fortes: [...]`, `corChave: '#2f6bd6'` (cor puxada da imagem: azul no pôr do sol laranja,
  ciano no vermelho), `tema: 'claro'` (texto escuro), `s` (tamanho), `forte: false`. `PP_MAO.add('ruinas')` vale para o vídeo todo.
- `S.cap` pode ser função do tempo local: `S.cap = lt => lt > 1.2 ? {modo: 'nivel'} : {modo: 'acumula', y: 500}`.
- Palavras entram 0,03 s antes de serem ditas, desfocadas → nítidas. A legenda nunca atravessa um corte de cena e nunca cobre os olhos.

## Gancho, estrutura e final
- **Sem esquete.** 3 dos 5 vídeos abrem com uma cena encenada pelo criador; isso é dele, não do formato de edição, e **não usamos**
  (decisão do Felipe, 24/10/2026). O foco é a edição.
- **Gancho** (primeiros ~3 s, quadro 0 completo): a frase-gancho com o mundo mais forte para ela — B-roll impactante com a chave em
  `nivel`, ou um papel com o número/ano rolando, ou o apresentador em close (avatar: ≤ 4 s) — e o primeiro papel em até ~5 s.
- **Estrutura:** gancho → apresentador → prova no papel (estudo, universidade, ano rolando) → B-roll ilustrando cada frase → apresentador
  (opinião/pergunta) → … → escuro na virada abstrata → fecho no apresentador.
- **Decidir o mundo de cada frase:** estudo/nome/ano/número/mecanismo → papel · exemplo concreto, lugar, ação → B-roll · ideia abstrata
  (mente, som, memória) → escuro · opinião, pergunta, "você" → apresentador · citação de alguém → pôster.
- **Final:** a referência termina no apresentador, sem gráfico (o CTA é falado, com legenda). Se a fala pedir para seguir o perfil,
  use `fimPerfil(beats, {perfil: 'perfil_felipedantasf', toque: ['B40', 'seguir']})` com o print REAL de quem fala (Felipe, Renato,
  Thainá, Fernando — `biblioteca/perfil_*.png`, já copiados pelo `preparar_formato.py`); pessoa sem print = nome só.
  Com avatar, a cena final também fica em ≤ 4 s: se o CTA for mais longo, o começo dele vai em B-roll/papel e o avatar volta só no fim.

## Som (cues no `build` das cenas; o mix do kit usa `out/events.json`)
| momento | cue | ganho |
|---|---|---|
| corte para papel, pôster ou escuro | `cue(c, 'whoosh', 0, {g: .28–.32, d: .3})` | |
| chicote dentro do papel | `whoosh` 0,14 s antes da troca, `d: .28` | .3 |
| roleta de números | `flap` (`n` 5–8) | .2 |
| objeto que brota / cadeado / rasgo | `pop` / `click` / `tear` | .3–.4 |
| corte entre apresentador e B-roll | nada | |
Trilha: `trilha.json` na raiz do projeto — `{"bpm": 115, "tom": "Cm", "nivel": -12.5, "drops": [["B23", 0, "B24", 0], ["B31", "realidade"]],
"risers": [["B22", 0]], "hits": [], "sobe": [["B40", "B52", 2]]}`. `nivel` = cama em dB do RMS da voz (−12,5 deixa a música ~15 dB
abaixo, como a referência); `drops` = onde a música some (1–3 por vídeo, nas frases de impacto/silêncio); sem `drops` o script escolhe
a pausa mais longa entre 30% e 80% do vídeo. Sem música: `SEM_MUSICA=1` (ou `"env": {"SEM_MUSICA": "1"}` no `etapas.json`).
Efeito nunca em cima do começo de palavra (o `pipeline.py fechar` recusa a entrega se a mix comer palavra).

## Passo a passo
1. **Projeto e transcrição** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs no fluxo áudio primeiro).
2. **Formato:** `python <esta pasta>/preparar_formato.py <nome> --prefixo xx` (fontes, CSS, `work/xx_a.js`, `t_amassado`/`t_preto`,
   prints de perfil, `render/clipn.js`, `etapas.json` com `montar`, `trilha` e `audio_final` do formato). **`--avatar`** para vídeo de
   avatar do HeyGen, `--real` para gravação (sem os dois: avatar se houver `work/apresentador.json`); `--sem-trilha` se ele não quiser música.
3. **Corte e beats** como no kit (`build_edl.py` → `pipeline.py preparar <nome>`); beats curtos (1–2,5 s), quebrando antes de nomes, anos e números.
4. **Pesquisa e plano de cenas:** tabela `cena | beats | fala | mundo | imagem/clipe | legenda (S.cap) | som`. Confira o ritmo no papel
   antes de escrever: um mundo novo ou um punch-in a cada ~1,6 s; mundos nas proporções do perfil (avatar: apresentador ~30%, peças de
   2–4 s); 2–5 papéis; 1–3 escuros.
   Fatos, números e datas conferidos; o que estiver errado na fala NÃO vai para o papel (avise o Felipe com a fonte).
5. **Imagens:**
   - fotos de arquivo (Commons, Bundesarchiv, Agência Brasil…) → `export MSYS_NO_PATHCONV=1` e
     `python reticula.py <nome> fotos/x.jpg:recorte:820 fotos/y.jpg:cartao:1000 fotos/z.jpg:duo:900 fotos/w.jpg:pessoa:760`
     (`modo:largura:período:gama:cx:proporção`; período 5,5 padrão, 4 fino, 8 grosso; fonte pequena = período maior);
   - objetos sem foto real: **Qwen local primeiro**. Com `gerar_qwen.py` (ver `Kit_Edicao_Vox_v2/guias/prompts_imagens.md` §2), use
     `"recorte": true` e o prompt "<objeto>, black and white documentary photograph, high contrast, no text"; sai um `_rgba.png`,
     que vai para `reticula.py` (modo recorte). O Higgsfield (`gpt_image_2_5`, 2,75 cr, "isolated cutout on transparent background, …")
     fica só se o Qwen não der conta, e esse molde é só para objeto: pessoa se gera na cena e se recorta depois (03/11/2026).
     Pessoa real ou marca por IA só com OK do Felipe (pergunte antes);
   - clipes: `ferramentas/baixar_trechos.py lista.txt -j 4` → `python clipes.py <nome> clipes/lista.txt` (linha: `nome arquivo início
     duração [fx] [area=w,h,x,y|full] [ganho=1.1] [largo]`). Use só trechos sem corte escondido (o script lista).
6. **Cenas** em `work/xx_b.js`, `xx_c.js`… (copie de `cenas_exemplo.js`; comente cada uma com `// Sn — "fala"`).
   `python montar.py <nome> xx` → sintaxe ok, palavras ok, beats ok.
7. **Prévias:** `python previas.py <nome>` (ou `--cenas 3,5,8`) e abra `out/pv/cenas_*.jpg`; texto pequeno: `render.py preview t1 t2`.
8. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"` (montar → render → mix + trilha.py → checa fala → QA → entrega _vN).
9. **Conferir:** `python ritmo.py <nome>` (cortes/min e planos) e todas as `out/qa_*.jpg`.
10. **Mensagem final** (português, curta): arquivos e onde estão, créditos gastos, avisos de checagem com fonte, e **Fontes:** com links
    (fotos, clipes com canal e data, estudos).

## Componentes — assinaturas
- Legenda: `S.cap = {modo, x, y, s, alinha: 'esq'|'centro'|'dir', larg, ancora, mao, fortes, corChave, tema, cauda, forte}`; `PP_MAO`.
- Cena pronta: `presPunch(beats, {zooms, passos: c => [[t, zoom, lado]], capY, fy, mao, lado, z0, look, build(L,S,c), update(S,c)})`,
  `brollCena(beats, lista, {cap, sombra, lead, build, update})`, `fimPerfil(beats, {perfil, toque, capY})`.
- Clipes: `clipe(p, nome, S, {from, rate, fx, fy, z0, z1, dur, t0, n})`, `seqClipes(p, S, c, [[t, nome, op]])`.
- Papel: `papel(r, S, {flip, grao, vig})`, `pagina(r)`, `chicote(A, B, lt, t, {dir: 'cima'|'baixo'|'esq'|'dir', d, blur})`,
  `camDeriva(k)`, `camKeys(keys)`, `tipo(p, linhas, x, y, o)` + `.at(lt, ts)` + `.caixa(i)`, `tipoFala(p, c, beat, spec, x, y, o)` + `.at(lt)`,
  `filete(p, x0, y0, x1, y1, {w, c, de})` + `.draw(q)`, `seta(svg, x0, y0, x1, y1, {curva, c, w})`, `sublinha(svg, x0, x1, y, {w})`,
  `ret(p, 'r_x', cx, cy, w, {sombra, rot})` + `.at(lt, t, {k, d, s, out})`, `entra(e, lt, t, op)`, `cartao(p, 'r_x', cx, cy, w, h, {pos, fundo})`
  + `.abre(lt, t)`, `barra(p, x, y, w, h)` + `emerge(e, yCorte, lt, t, {dy, d})`, `forma(p, 'r_x', cx, cy, w, {tipo, h})` + `.at(lt, t)`,
  `roleta(p, cx, cy, {de, para | seq, s, peso})` + `.at(lt, t | [t1, t2], d)`, `digita(e, txt, lt, t0, cps)`,
  `onda(svg, x0, y, x1, {amp, ciclos, w})`, `ondaCaixa(p, cx, cy, w, h, {tema})` + `.at(lt, t, d)`.
- Escuro: `poster(r, S, {moldura, mx, my, mb})`, `duo(p, 'r_x', cx, cy, w)`, `escuro(r, S)`, `icone(p, nome, cx, cy, tam, {cor, brilho})`
  + `.at()` + `.troca(nome)`, `derrete(e, lt, t, d)`, `rede(p, cx, cy, raio, n, {seed})` + `.at(lt, t, d)`.
- Do kit: `scene`, `el`, `box`, `svgAbs`, `sv`, `tx`, `ez`, `kf`, `E`, `clamp`, `lerp`, `cue`, `photo`, `AS`, `c.b/c.e/c.w`.

## Armadilhas (vistas no teste)
- `c.w('B12', 'palavra')` cai na 1ª palavra do beat se não achar: o `montar.py` avisa; confira as palavras em `render/timing.js`.
- No `tipoFala`, cada estilo consome uma palavra do beat na ordem; spec com estilos a mais simplesmente para; com a menos, corta a frase.
- Páginas com `chicote`: crie `S.A = pagina(r)` e `S.B = pagina(r)` e ponha cada elemento na sua página.
- `emerge()` precisa de elemento com altura conhecida (`ret`/`cartao`); a barra fica na frente do corte.
- `render/clips` como junção (`mklink /J`) para clipes de outro projeto: o `clipes.py` não apaga clipe que já exista lá (use nome novo).
- Num `while read` do Bash, `ffmpeg` sem `-nostdin` come a lista e troca os arquivos. Use `-nostdin`.
- Git Bash troca `a:b:c` por lista de caminhos: `export MSYS_NO_PATHCONV=1` antes do `reticula.py`.
- Foto pequena (< 700 px) em retícula fica mole: período 7–8 e largura menor; não faça cartão de tela inteira com ela.
- Um "risco" vertical numa foto pode ser da própria foto (poste): olhe a original antes de caçar defeito de render.

## Checklist antes de entregar
- [ ] `ritmo.py`: 32–43 cortes/min, plano médio 1,4–1,8 s; nenhum trecho parado sem motivo.
- [ ] `montar.py` sem aviso de apresentador: perfil certo (avatar ~30%, toda aparição de 2–4 s; real 44–53%, 1,5–5 s), nenhuma aparição colada em outra.
- [ ] Os 4 mundos presentes; 2–5 papéis; 1–3 escuros; nada da esquete de abertura da referência.
- [ ] Papel: a tipografia mostra as palavras ditas, na hora; chave enorme + ligação pequena + serifa/mão; retícula em toda foto; câmera em movimento.
- [ ] Legenda em todo apresentador e B-roll, no modo certo, sem cobrir olhos nem passar do corte.
- [ ] B-roll literal, sem logo/tarja, assunto inteiro no quadro, zoom lento; datas e créditos nos fontes.
- [ ] Trilha baixa com 1–3 drops; whoosh só nas entradas de papel/escuro e chicotes; −14 LUFS; checa_fala sem palavra perdida.
- [ ] Final no apresentador ou `fimPerfil` com o perfil REAL de quem fala.
- [ ] Versão nova `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
