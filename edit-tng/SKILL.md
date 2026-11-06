---
name: edit-tng
description: Formato "edit TNG" (The Numbers Game, história de negócio narrada), vertical 9:16, com o Kit_Edicao_Vox_v2. Replica o reel da página The Numbers Game (@thenumbersgame1) sobre o Mark Goldbridge (ago/2026). Narração contínua sem apresentador na tela; cada bloco de legenda de 2–3 palavras é um plano REAL em corte seco (~75 cortes por minuto) - vídeos do próprio personagem com a emoção da palavra (45–50% do tempo, dezenas de vídeos diferentes), fotos reais dele, a pessoa ou a marca citada no nome dela, B-roll de banco em vídeo sem rosto, prints reais de páginas e cartões chapados vermelho e branco com a própria legenda. Tudo anda a 12 imagens por segundo. Legenda Inter 700 no meio da tela acendendo palavra por palavra no lugar, contador com número em serifa itálica, selo fixo, poeira nas bordas, fade para branco no fim. Trilha de trap escuro com break, drops e stops no roteiro, clique de texto no gancho e obturador nas fotos. Inclui o método de extração de material real em alta qualidade (busca no YouTube e bancos gratuitos, varredura barata, download só do trecho em 4K/1440p, recorte 9:16 seguindo o rosto). Use quando o Felipe pedir "edit TNG", "formato The Numbers Game", "igual ao vídeo do Mark Goldbridge", ou mandar esse vídeo como modelo, com áudio da ElevenLabs.
---

# Formato edit-TNG (The Numbers Game: planos reais em corte seco, 12 imagens por segundo)

**Referência:** o reel que o Felipe mandou em 04/11/2026, `C:\Users\USER\Downloads\DcQj40WNSk7.mp4` (74,8 s, 24 q/s). É o Mark Goldbridge da página The Numbers Game.

**Medição:** quadro a quadro e por stems de áudio, com 19 agentes. A receita completa, com todos os números e as correções, está em **`ANALISE_REFERENCIA.md`**; leia antes do primeiro vídeo.

**Material sempre REAL**, tirado do YouTube e de outras redes: vídeos e fotos do personagem, entrevistas, keynotes, vídeos oficiais, banco de vídeo gratuito. Nunca IA.

O Felipe quer o método de extração de alta qualidade replicado: material novo a cada vídeo, nada reaproveitado de projeto antigo.

## Arquivos desta pasta

| arquivo | o que é |
|---|---|
| `ANALISE_REFERENCIA.md` | a receita medida: roteiro, ritmo, cadência, captação, look, movimento, tipografia, som, safe zone, réguas |
| `componentes.js` | o motor do formato (1ª parte do `render/scenes.js`): `tng()`, legenda, cartões, contador, prints, montagem, sons, poeira, selo, fade, cadência de 12 q/s |
| `tng.css` | legenda, selo e poeira (o `preparar_tng.py` injeta no `index.html`) |
| `preparar_tng.py` | prepara o projeto: fontes, CSS, **24 q/s** no render, 1 captura por degrau de 1/12 s, `etapas.json` |
| `buscar.py`, `varrer.py`, `baixar_hd.py`, `clipes_tng.py`, `banco.py` | o método de extração (seção "Material") |
| `montar.py` | junta as cenas e abre a página para medir ritmo, tipos de plano, tempo do personagem, legenda, sons e erros |
| `folha_planos.py` | folha com 1 quadro de CADA plano (fonte, tempo, legenda na tela) → `out/pv/planos_*.jpg`: a prévia de todo vídeo |
| `contraste_legenda.py` | mede o fundo atrás da legenda branca em cada plano e diz onde usar `filtro` (B-roll) ou `capForte` (personagem) |
| `trilha_tng.py` | trap sintetizado + cliques + obturador, nos cues das cenas; mix final em −14 LUFS |
| `regua_cortes.py` | régua de cortes CALIBRADA (93/93 na referência): meta 70–80 cortes reais/min |
| `cadencia.py` | confere no master: 24/1, cada imagem 2 quadros (`holds`) |
| `safezone_organica.py` | safe zone do Reels/TikTok (`--dom <projeto>` mede a caixa exata do nosso texto) |
| `cenas_exemplo.js` | exemplo completo (demo da Lisa Su) |

## A receita em 12 linhas (números em `ANALISE_REFERENCIA.md`)

1. **Bloco de legenda = plano.** Corte seco na 1ª palavra do bloco (2–3 palavras), ~75 cortes reais por minuto, plano mediano de 0,75 s. O gancho é mais rápido (~98/min) e o fim mais lento (~57/min).
2. **12 imagens por segundo em TUDO**, inclusive o vídeo real, que roda a 1,0× (até 1,25× para caber na frase; câmera lenta, nunca). Só o fade final anda a 24.
3. **O personagem fica ~45–50% do tempo** em ~34 vídeos diferentes por 75 s. Cada fonte fica ≤ 2,5 s no total, sem repetir cenário em planos seguidos, mudo, com a emoção da palavra:
   - grito/surto → palavra de emoção;
   - foto posada → status/dinheiro;
   - riso → humor;
   - plano limpo olhando a câmera → o nome dele.
4. **Nome próprio → a entidade literal** no nome (±0,2 s): a pessoa REAL citada em vídeo/foto; a empresa/clube em vídeo oficial, logo, sede ou cenário.
5. **Abstrato → B-roll literal de banco, em VÍDEO** (≥75% do tempo de B-roll), pessoa genérica só de costas, silhueta ou mãos.
6. **Cartão VERMELHO (#E70123):** ~1 a cada 12 s. Recebe o fim de frase sem imagem literal, a virada ("Até que", 0,25 s), o número grande e o motivo do gancho, que volta no fecho. **Cartão BRANCO** logo depois de um vermelho, para o ano.
7. **Um contador por vídeo** no número grande: "Mais de" sobe; o número, em serifa itálica, conta em 1 s; a unidade entra seca quando é falada.
8. **Print real de página** (canal, vídeo, gráfico) sobe do branco; um pop ×1,246 no número. Celular rolando com a legenda preta acima. Sem legenda quando a imagem já mostra o que é dito.
9. **Salto de tempo ("N anos depois", "Hoje") → montagem-relâmpago** de 8–11 imagens DIFERENTES, 1/12 s cada, com rajada de obturador.
10. **Movimento:**
    - Fotos deslizam para a DIREITA com freio exponencial (τ 0,3 s), já andando no corte.
    - O vídeo real não leva zoom, pan nem tremor do editor.
    - Só corte seco, sem whip nem dissolve.
11. **Legenda:** Inter 700, 60 px, no meio da tela (linha de base y 959), frase diagramada inteira e cada palavra acendendo seca no lugar. Ponto só no fim de oração, nunca vírgula, algarismos com a moeda na frente.
12. **Som:**
    - Trap escuro de 78 BPM que começa cheio, ~8 dB abaixo da voz.
    - BREAK no salto de tempo do gancho; DROP no nome do personagem; STOP antes das viradas de tempo; hits; rolls nas listas.
    - Clique de texto em cada palavra do gancho e dos cartões; obturador no corte para foto. Corte comum é seco.
    - Fecho: fade para branco ~0,34 s depois da última palavra, sem CTA (perfil real só se o Felipe pedir).

## Os componentes (`componentes.js`)

```js
TNG.selo = 'TI';                       // sigla do selo vermelho fixo (null = sem selo)
TNG.sujeito = 'lisa';                  // prefixo dos clipes/fotos do personagem (o montar.py mede o tempo dele)
TNG.musica = [['break', 'B05:Hoje'], ['drop', 'B10:Lisa'], ['stop', 'B14:anos', .6], ['drop', 'B15'], ['hit', 'B22:menos'], ['roll', 'B33', 1.6]];
TNG.troca = { 'B06:um': '1', 'B19:dolares': '' };        // texto da legenda por palavra ('' some)

tng(['B01', 'B02'], [                   // uma cena = beats + lista de planos; cada plano entra numa palavra e abre um bloco
  ['B01',          'clip:lisa_ces26_a'],                       // 1ª palavra do beat
  ['B01:mulher',   'clip:lisa_bloom_b', { from: .4 }],         // prefixo da palavra, sem acento
  ['B02',          'foto:amd_sede', { desliza: 120, foco: [.5, .45] }],
]);
tng(['B03', 'B04'], [
  ['B03',          'clip:amd_campus'],
  ['B03:3',        'contador', { antes: 'valia', de: .2, ate: 3, casas: 1, casasFim: 0, depois: 'bilhões', depoisEm: 'B03:bilh' }],
  ['B04',          'vermelho'],                                // a frase vira o cartão
]);
tng(['B05'], [['B05', ['foto:m1', 'foto:m2', 'foto:m3', 'foto:m4', 'foto:m5', 'foto:m6', 'foto:m7', 'foto:m8']],   // montagem 1/12 s cada
              ['B05:cruzou', 'clip:lisa_palco']]);
```

### Quando o plano entra

- `'B03'` é a 1ª palavra do beat; `'B03:valia'` é um prefixo sem acento; `'B03#2'` é o índice; `'B03:valia+.2'` aplica um desvio em segundos.
- O corte cai no degrau de 1/12 s mais perto do início da palavra.
- O `montar.py` confere toda referência.

### Fontes

| fonte | o que é | opções |
|---|---|---|
| `'clip:nome'` | vídeo real (`render/clips/nome/`, 24 q/s, já em 9:16 pelo `clipes_tng.py`) | `from` (s no trecho), `rate` (1–1,25), `foco` [fx, fy] |
| `'foto:nome'` | foto real (`render/assets/nome.jpg`), desliza para a direita com freio | `desliza` px (0 = parada; padrão 110), `dir` (−1 = esquerda), `tau`, `foco`, `alvo`, `z`, `sai` (saída acelerando), `obturador: false` |
| `'vermelho'` / `'branco'` | cartão chapado com a legenda (branca / preta) | — |
| `'contador'` | número grande contando | `antes`, `de`, `ate`, `casas`, `casasFim`, `prefixo`, `sufixo`, `depois`, `depoisEm`, `dur` (1 s), `cor: 'branco'` |
| `'print:nome'` | página real (desktop, 618 px) subindo do branco; sem legenda por padrão | `pop: 'B20:3'` (soco ×1,246), `popFoco: [fx, fy]` (ponto que o soco aproxima), `larg`, `cy`, `leg: true` (legenda preta acima) |
| `'celular:nome'` | print de celular (450 px) subindo e rolando, legenda preta acima | `larg`, `janela`, `top`, `rola` |
| `['foto:a', 'clip:b', …]` | montagem-relâmpago, 1 imagem a cada 1/12 s, rajada de obturador | `passos: [2,2,1,1,1,1,1]` (acelerando), `rajada: false` |
| `'dividida'` | tela dividida 50/50 | `de: ['clip:a', 'clip:b']`, `foco: [[fx,fy],[fx,fy]]` |

**Opções comuns:**
- `leg: false`: sem legenda, porque a imagem já mostra o que é dito (nome/logo/cenário com o nome).
- `leg: 'continua'`: o plano não abre bloco novo; a legenda segue, como na trinca métrica.
- `capCor`.
- `capForte: true`: sombra forte na legenda quando o fundo atrás dela é claro e o plano é do personagem (não escureça o rosto).
- `filtro: 'brightness(.7)'`: escurece um B-roll claro demais para a legenda branca. A régua `contraste_legenda.py` diz onde e quanto.

### O que o motor faz sozinho

- **Blocos:** um bloco por plano, quebrado em ponto final; acima de 4 palavras, 26 letras ou 716 px, quebra na vírgula ou no meio.
- **Revelação:** a 1ª palavra entra no corte e as seguintes no início falado + 0,10 s, sempre na grade de 1/12 s.
- **Sons:**
  - clique em toda palavra do gancho (até o 1º `drop` ou `TNG.cliqueAte`) e dos cartões;
  - obturador no corte para foto;
  - rajada na montagem;
  - cues de `TNG.musica`;
  - fim.

  Tudo vai para o `out/events.json` via `render.py events`.
- **Visual e entrega:** selo, poeira, fade para branco (`TNG.fimApos` .34 s, `fimDur` .46, `fimBranco` .42: `videoDur` = última palavra + 1,22 s). O `window.TNG_CHAVE` faz o render.py capturar 1 vez por degrau.

## Material: o método de extração (sempre material NOVO)

Ferramentas da skill, com o Python do kit; o `<pasta>` é o projeto. Downloads vão para pastas próprias (`clipes/prev`, `clipes/hd`); nunca rode nada de dentro delas.

1. **Catálogo:** `buscar.py <pasta> "<consulta>" [--n 12] [--canal @handle --abas videos,shorts,streams] [--cc]`.
   - Grava `clipes/candidatos.tsv`: id, duração, data, canal, título, **maior altura disponível**, vertical e url.
   - Preferência: canal oficial da pessoa/empresa, entrevistas de veículos grandes, keynotes, podcasts. Shorts verticais > estúdio 16:9 em 1440/2160 > 1080.
   - Para cada personagem, faça 6–10 buscas com tipos diferentes: keynote, entrevista, podcast, palestra, vlog/bastidor, prêmio, depoimento. A meta é ~25–35 fontes por 60–75 s.
2. **Varredura barata:** `varrer.py <pasta> <id> [--de --ate] [--ref fotos/ref_*.jpg] [--prompt "smiling on stage"]`.
   - Prévia em ≤ 360p; rostos, nitidez e cortes de plano; selo/logo/legenda queimada; identidade (SigLIP 2 contra fotos de referência) e emoção.
   - Gera `clipes/varredura/<id>.json` e a folha `<id>_folha.jpg`. **Olhe a folha**: pessoa certa, olhando bem, emoção da palavra, sem marca d'água.
3. **Só o trecho, em alta:** `baixar_hd.py <pasta> lista.txt`, com linhas `nome ID ini-fim`.
   - DASH 2160 → 1440 → 1080, com 1 s de margem.
   - Grava `clipes/hd/<nome>.mp4` e a linha de crédito em `clipes/fontes.md`.
   - O trecho DASH começa no keyframe anterior (1,4–4,4 s antes do pedido). O `baixar_hd` mede o início real contra a prévia (`inicio_arquivo` no .json); por isso, na LISTA do recorte, use `@<segundo da fonte>`.
4. **Recorte 9:16:** `clipes_tng.py <pasta> clipes/LISTA.txt`, com linhas `nome arquivo início duração [rosto] [alvo=.34] [fx=] [z=] [vel=] [area=] [largo] [dividida]`.
   - Extrai a 24 q/s com crop de altura cheia SEGUINDO O ROSTO (rosto ~0,34 da altura, olhos em ~0,335, zoom constante, sem giro).
   - Usa Lanczos, `unsharp` só na luma quando amplia, joelho nas altas. O tom fica na cor da fonte, sem LUT.
   - Grava `render/clipn.js` com `CLIPFPS = 24` e a folha `out/clipes_folha_*.jpg`. **Olhe a folha.**
5. **B-roll sem marca:** `banco.py <pasta> "<consulta em inglês>" [--fonte mixkit,commons,ytcc]`, e `--baixa <id> --nome <nome>`.
   - Fontes gratuitas: Mixkit (licença livre, sem crédito), Wikimedia Commons (registre o crédito) e YouTube Creative Commons.
   - Mixkit grátis = 720p (ids antigos) ou 1080p (ids novos); o 4K é pago e nunca baixa.
   - Item **Restricted** do Mixkit não pode ir em anúncio (o `banco.py` mostra em vermelho): use só **Free**.
   - O YouTube CC é quase sempre reupload de "free stock": confira a marca d'água no quadro do meio.
   - Pexels/Pixabay só com `PEXELS_API_KEY` / `PIXABAY_API_KEY`.
6. **Fotos reais** (`render/assets/<nome>.jpg`, ≥ 1920 px de altura depois do crop):
   - personagem: imprensa, evento, oficial da empresa;
   - pessoas citadas;
   - logos oficiais.

   Use a `imagens.py`/`pagina.py` da edit-founded, Commons e as páginas oficiais.
7. **Prints:** página REAL (canal, vídeo viral, gráfico de ação) pelo `pagina.py` da edit-founded, na resolução nativa (nunca amplie > 1,0×), com marcação real no número dito.

**Sempre:**
- Sem marca d'água, logo de agência/banco ou selo de emissora. O crop 9:16 central costuma tirar o selo; se não tirar, use `area=` ou descarte.
- Sem legenda queimada; pessoa genérica sem rosto.
- Registre canal, URL, data e trecho de cada clipe em `clipes/fontes.md`.

## Passo a passo

1. **Áudio:** `pipeline.py preparar <nome> "audio.mp3"` (fluxo áudio primeiro, sem rosto), depois o corte, os beats e o `align`, como sempre.
   - Beats curtos (1–2,5 s), quebrando antes de números, nomes e viradas.
   - Confira os fatos ANTES (regras 1–3 do kit). Número que vai para contador, print ou cartão tem que estar conferido.
2. `.venv\Scripts\python.exe <skill>/preparar_tng.py <nome> --prefixo xx`
3. **Plano de planos:** uma tabela `bloco | fala | classe | fonte` (SUJ / SUJ_EMO / SUJ_LIT / PESSOA / MARCA / BROLL / TELA / VERM / BRANCO / CONTADOR / MONT).
   - Quebre a fala em blocos de 2–3 palavras: cada bloco é um plano.
   - Marque o gancho (5 fontes do personagem em ~3 s), o nome (drop), o salto de tempo (montagem), o número grande (contador), as viradas (cartões) e a lista (1 plano por item).
4. **Material** (seção acima). Em paralelo, com subagentes por bloco do roteiro, cada um com as ferramentas e a lista do que achar. Olhe as folhas antes de usar.
5. **Cenas** em `work/xx_b.js`… com `tng()`, comentando cada uma com `// S<n> — "fala"`. Exemplo em `cenas_exemplo.js`.
6. `montar.py <nome> xx`. Mira:

   | medida | meta |
   |---|---|
   | ritmo | 70–80/min |
   | plano mediano | 0,70–0,85 s |
   | personagem | 40–56% |
   | palavras por bloco | 2,6–2,9 |
   | erros | 0 |

7. **Prévias:**
   - `folha_planos.py <nome>` gera um quadro de cada plano, com fonte e legenda, em `out/pv/planos_*.jpg`. **Olhe todas.**
   - `TNG_SUJEITO=<prefixo> contraste_legenda.py <nome>` deve dar 0 legendas fracas.
   - Para um instante específico: `render.py preview t`.
8. `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude\<Tema>"`. O `etapas.json` já chama o `montar.py` e o `trilha_tng.py` e desliga o som de corte e o pan.
9. **Réguas no master:**
   - `regua_cortes.py out/master.mp4`: 70–80/min.
   - `cadencia.py out/master.mp4`: ≥ 99% ímpares repetidos.
   - `safezone_organica.py --dom <proj>`: ≤ 1%.

## Som (`trilha_tng.py`)

Roda sozinho no `fechar`, depois do `mix.py`. Lê os eventos `tng:*` do `out/events.json` (o motor põe, a partir das cenas e do `TNG.musica`) e grava `audio/final_mix_tng.wav` (−14 LUFS, TP ≤ −1 dBTP, termina no `videoDur`).

Conferido contra a referência, usando a voz dela e a linha do tempo medida: mix −14,0 LUFS, LRA 2,0; cama −7,9 dB da voz; 75% abaixo de 60 Hz; drops +8,5 dB; clique em voz −14 dB; obturador +51/+77 ms em voz −11 dB.

| evento | o que faz |
|---|---|
| `break` | 808 e bumbo saem, música −24 dB da voz até o próximo drop |
| `drop` | bumbo + 808 (+8,5 dB sobre a cama) e seção seguinte (A → B → C: hats retos em Ré; loop do 808 C–D#–F + pad) |
| `stop` (d) | 808 e bumbo mudos por d s (clap e hats seguem, como na referência) |
| `hit` | uma batida +6 dB |
| `roll` (d) | rufo de hat em fusa de tercina (~64 ms) cobrindo [t, t+d] |
| `fim` | a música cai −20 dB junto com o fade para branco |
| `clique`, `obturador`, `rajada` (d) | SFX nos tempos exatos |

- **`trilha.json` opcional:** `bpm`, `tom`, `cama` (−7,9), `quebra` (−24), `drop`, `hit`, `clique`, `obturador`, `rajada`, `secoes`, `sfx_kit`, `eventos` (extras por beat/palavra).
- **Sem trilha:** `SEM_MUSICA=1` deixa só voz + SFX.
- **Sons do kit:** o `preparar_tng.py` põe `SOM_CORTE=0` e `NIVEL_SFX=-120` no `etapas.json`, para o bus tátil do kit ficar mudo.
  - Se mudar o env depois de uma mix, apague `audio/sfx_bus.wav` uma vez.
  - O `trilha_tng.py` avisa na última linha se o bus tiver som.

## Armadilhas

- **YouTube bloqueia o IP com downloads demais ao mesmo tempo:** "Sign in to confirm you're not a bot" / HTTP 429, uns 10 min. Aconteceu no teste de 04/11 com 3 agentes baixando juntos, e o Mixkit e o Commons também devolveram 429.
  - Use no máximo 2 frentes de busca em paralelo.
  - Varra janelas (`--de/--ate`) em vez do keynote inteiro.
  - Se bloquear, espere; nunca use cookies para contornar.
- **`camdata.js`:** o `index.html` do kit carrega esse arquivo. Sem apresentador, o `preparar_tng.py` cria um vazio; sem ele, o `fechar` para no `render.py events`.
- **Legenda branca sobre fundo claro** (céu, parede, papel, calculadora) some. Rode `contraste_legenda.py` (com `TNG_SUJEITO=<prefixo>`) depois do `montar.py` e use `filtro`/`capForte` até dar 0.
- **Ritmo:** meça no master com `regua_cortes.py` (a calibrada), não só no `montar.py`. Passos da montagem com imagens parecidas (ela no palco) contam menos na régua; para chegar a 70–80/min:
  - divida os planos longos do personagem com um 2º vídeo dele (outro evento, 0,5 s; nunca o mesmo cenário de 3 planos antes);
  - salto na mesma fonte (`from` ≥ 0,7 s depois) **só** no bloco de emoção ou na lista e com pose/expressão bem diferente. Em frase neutra, com o mesmo enquadramento, ele parece um soluço do vídeo (revisão de 04/11).
- **Emoção do personagem:** confira a cara dele em cada palavra. Sorriso em "situação crítica" ou "precisaram vender" estraga a frase. Use `varrer.py --prompt "serious face, not smiling" --prompt "smiling"` para achar o trecho sério.
- **Prova que contradiz a fala:** o print/gráfico tem que acabar onde a fala acaba. Um gráfico até 2026 numa fala sobre 2016 mostra o contrário; corte a página no período dito, com título e legenda da própria página.
- **Contador com a unidade logo depois:** use `numApos: .1, dur: .5` para o número pousar antes da unidade acender. O motor já reserva a vaga do valor mais largo da contagem.
- **Projeto a 24 q/s:** o `render.py`, o `render_par.py` e o `engine.js` do projeto ficam com FPS 24 (`preparar_tng.py`).
  - Não use `grade_gpu.py`, que fixa 30 q/s, desfaz as duplicatas e põe o grão.
  - Não use `medir_leitura.py`/`medir_motion.py` para contar cortes.
- **Clipe curto:** o motor recua o início para o vídeo acabar junto com o plano. Se nem assim cabe, o console acusa `CLIPE CURTO` e o kit `clipe_parado.py` reprova: extraia o trecho mais longo ou troque o plano antes.
- **Palavra que não existe** no beat cai na 1ª palavra. O `montar.py` lista todas; corrija antes do render.
- **Selo:** em anúncio da Meta, o topo da interface vai até y 286 e cobre o selo. Use `TNG.selo = null` ou mova o selo para baixo.
- **A legenda some nos planos `print` e `contador`:** é de propósito, como na referência. O texto que importa tem que estar na imagem ou no contador.

## Checklist antes de entregar

- [ ] Material 100% real e novo, com fonte registrada em `clipes/fontes.md`, sem marca d'água e sem legenda queimada.
- [ ] Personagem em ~45–50% do tempo, com dezenas de fontes diferentes e a emoção casando com a palavra; nome próprio com a imagem literal.
- [ ] 70–80 cortes reais/min (régua calibrada), corte na 1ª palavra de cada bloco.
- [ ] 12 q/s: `cadencia.py` com ≥ 99% dos ímpares repetidos.
- [ ] Cartões, contador, print e montagem nos lugares da receita; fade para branco no fim.
- [ ] Mix em −14 LUFS: break, drop no nome, stops nas viradas, cliques no gancho e obturador nas fotos.
- [ ] Fatos conferidos; o que estiver impreciso na fala vai no aviso da mensagem final (fala não muda).
