---
name: edit-parallax3d
description: Formato "edit parallax 3D" (estilo MagnatesMedia), vertical 9:16 (ou 16:9), com o Kit_Edicao_Vox_v2. O vídeo é UM PLANO CONTÍNUO, sem corte visível. Cada foto real vira 2–4 camadas de profundidade (modelo de profundidade + preenchimento LaMa) com RELEVO em WebGL na placa de vídeo, e uma câmera 3D de perspectiva anda entre elas, com dolly, travelling, órbita e foco pela distância real. A passagem de uma estação para a outra sai do roteiro (o que a fala e a foto pedem): troca na palavra, passagem vertical, recuo de dentro de um monitor (tela dentro de tela), entrar numa tela/gráfico da foto, e fumaça só quando algo na cena solta fumaça. O texto é tipografia de cinema no espaço da tela: título em sans pesado com data digitada, frase em serifa palavra por palavra com uma palavra em itálico vermelho brilhando, etiqueta mono em pílula e número contando. Grão, vinheta e cama cinematográfica. Use quando o Felipe pedir "edit parallax", "parallax 3D", "estilo MagnatesMedia", "plano contínuo", "igual ao vídeo da Apollo/Mirage", ou mandar esse vídeo como modelo — com gravação ou áudio da ElevenLabs.
---

# Formato edit-parallax3d (plano contínuo, fotos em camadas 3D, estilo MagnatesMedia)

Modelo: o vídeo que o Felipe mandou em 30/10/2026 (`C:\Users\USER\Downloads\Mirage_-_These_MagnatesMedia-style_3D_parallax_animations_are_hard_for_AI_to_c_R6Js41.mp4`,
25,8 s, 1920×1080 a 30 fps, inglês, Apollo 11). É um anúncio da ferramenta Mirage imitando o canal MagnatesMedia. Tem narração e música
(−15 LUFS) e NENHUM corte: o detector de cenas não acha nenhum.

**Antes de planejar, abra as duas imagens desta pasta:**
- `referencia_formato.jpg`: 1 quadro por segundo da referência.
- `exemplo_teste.jpg`: 1 quadro por segundo da demo (`projetos/teste_parallax3d`, CarroAntigo 0–25 s, `H:\Downloads\TesteParallax3D_demo25s_v1_*.mp4`).

Esta skill complementa o kit. Corte, beats, render, mix e entrega seguem `<kit>\CLAUDE.md`. As regras fixas do Felipe estão na memória:
fala nunca muda; dado na tela com fonte e data; IA nunca faz rosto de pessoa real; perfil REAL no CTA; versão nova `_vN`;
entrega = tiktok ≤ 29 MB + MASTER. Rode tudo com o Python do kit (`<kit>\.venv\Scripts\python.exe`); `VOX_KIT` aponta o kit em outro PC.

## Como a referência é feita (medido quadro a quadro)
| tempo | o que se vê | técnica |
|---|---|---|
| 0–2,5 s | plataforma no pôr do sol; silhuetas na frente descem mais rápido que o fundo | câmera subindo sobre 3–4 camadas |
| 2,5–4,5 s | a fumaça nasce na base e cobre a tela | **oclusão**: a estação troca atrás da fumaça |
| 4,5–9,5 s | close do foguete; a câmera desce pelo casco, régua de altitude 250→0, braço da torre passa na frente | **imagem longa** + primeiro plano |
| 9,5–11,5 s | motores acendem; fogo enche a tela | oclusão |
| 11,5–14 s | decolagem com palmeiras na frente; contador 1.270.000→7.500.000 LBS | parallax + número contando |
| 14–15,5 s | a câmera recua: a decolagem estava num monitor da sala de controle | **tela dentro de tela** (recuo) |
| 15,5–21 s | a câmera atravessa a sala e **entra no telão** com a Lua | dolly contínuo + entrar na tela |
| 21–25 s | Lua, texto final, fade para preto | câmera bem lenta |

- **Texto (não há legenda corrida):**
  - título em sans pesado ("APOLLO 11") com a data digitada embaixo;
  - etiqueta mono em pílula ("CSM COLUMBIA · CREW OF 3");
  - frase da narração em serifa, palavra por palavra, com UMA palavra em itálico vermelho com brilho ("*powerful*", "*promise*", "*kept*");
  - rótulo mono pequeno sobre número grande ("THRUST AT LIFTOFF / 7,500,000 LBS").
- **Cor:** quente, grão de filme, vinheta forte, fundo desfocado (foco no primeiro plano).
- **Movimento:** a câmera nunca para. Cada estação dura 2–6 s e termina já dentro da transição para a próxima.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca (vira `work/p3_a.js`): `palco3d` (em WebGL = `palcoGL`, no fim do arquivo), `kf3`, `mao3`, `fumaca`, `veu3`, `titulo3`, `pilula3`, `frase3`, `numero3`, `regua3`, `grafico3`, `telaConteudo`, `vidro3`, `camFixa` |
| `prof3d.py` | relevo por camada para o WebGL (`p3_<nome>_d<i>.png` 16 bits + `dref`/`pg` no assets.js). O `camadas3d.py` já chama; à mão só em projeto antigo |
| `lib/three.min.js` | Three.js r159 (build clássica, funciona em `file://`); o preparar copia para `render/lib` |
| `cenas_exemplo.js` | as 5 cenas da demo, comentadas (as 4 transições). O vídeo inteiro está em `projetos/founded1_p3/work/p3_b.js` |
| `camadas3d.py` | foto → camadas de profundidade (Depth Anything V2 small + LaMa + ISNet) em `render/assets/p3_<nome>_N` + folha de conferência |
| `nuvem_png.py` | tufos de fumaça a partir de fotos REAIS de nuvens (o céu azul sai pela cor). As 5 prontas estão em `texturas/` (créditos em `CREDITOS.txt`) |
| `preparar_p3.py` | prepara o projeto: CSS (sem legenda corrida, grão, vinheta), fontes Sitka/Inter/mono, componentes, texturas, etapas.json |
| `montar_p3.py` | monta `render/scenes.js` e confere sintaxe, palavras de `c.w`, camadas que faltam e sequência de beats |
| `estilo.css` | o CSS que o preparar põe no `index.html` |

Modelos (uma vez, ~300 MB, na raiz do kit): `python baixar_modelos.py --sem-recorte --parallax3d`.

## Vídeo inteiro: cenas prontas (CarroAntigo completo, `projetos/founded1_p3`, 30/10)
Para um vídeo de 1–3 min, escreva quase tudo com estas 5 chamadas (exemplo completo em `projetos/founded1_p3/work/p3_b.js`, 37 cenas):
- **`estacao(beats, {nome, zs, fx, fy, ov, cor, cam, fala, tr, fumIn, fumOut, circ, troca, dof, build, update})`**: uma foto em camadas + câmera
  (`cam: [[u, {x, y, z}], ...]` com u = fração do tempo, ou função) + a fala em grupos (`fala: {destaque: [...], y}`).
  - `troca: [{t: c => c.w('B34', 'abandon') - .1, nome: 'route66', ...}]`: troca de foto NA PALAVRA, com chicote curto para o lado
    (lista "modificadas, abandonadas", "30, 40 ou 50 anos", "versão, motor").
  - `circ: {beats: ['B31'], cy: 560, d: 560}`: o apresentador num círculo sobre a estação, que continua andando atrás.
  - `fumOut` / `fumIn`: a fumaça cobre no fim desta estação e abre no começo da próxima. Só quando a foto tem de onde sair fumaça
    e a fala combina (veja "Passagens: o roteiro decide").
- **`pres3(beats, {tr, destaque, punchEm})`**: o apresentador em tela cheia, LIMPO (sem grão nem cor), com punch-in seco na palavra; a fala fica no peito.
- **`curva3(beats, {pts, cor, corSobe, tSobe, marca, prog, circ, fumIn})`**: gráfico vetorial em tela cheia com a câmera seguindo a ponta. **Sem números** quando a fala não tem dado.
- **`fim3(beats, {nome})`**: nome de quem fala + a frase do CTA (sem print, se não houver perfil no kit).
- Tela dentro de tela à mão (`scene` própria): veja S1 (Opala no monitor da bolsa) e S27→S28 (bolsa → galeria) no `p3_b.js`.
  O palco de dentro e o de fora usam **`porAltura: true`**: a mesma escala em qualquer largura, senão o quadro do corte não bate.
- **Apresentador ~10 vezes** (pedido do Felipe, 30/10): alterne tela cheia (`pres3`) e círculo (`circ`), 2–4 s cada, só em janelas olhando a câmera.
  No founded1 as janelas já conferidas foram B05–06, B14–15, B27–28, B31, B37–38, B45–46, B54–55, B65, B68–69, B71–72.
- **Sem título de imagem** (Felipe, 30/10): nada de "OPALA SS / anos 70", "MOTOR 250", "BOLSA · SÃO PAULO". Na tela só a fala.
  `titulo3`/`pilula3` ficam para o nome de quem fala no fim ou para um dado que a própria fala diz.
- **A imagem é a palavra:** "concessionária" = carro zero no salão; "perder valor" = a cor sai e uma linha vermelha cai; "destruídas" = carros
  esmagados; "desaparecem" = carro engolido pelo mato; "quantidade produzida" = linha de montagem de época; "versão" = emblema;
  "parecido com arte" = galeria; "dois carros parecidos" = dois iguais lado a lado. Busque no Commons com `tools/busca_commons.py`
  (folha de contato por busca; `fotos/orig/*.src` guarda autor e licença) e ESCOLHA OLHANDO.
- **Vertical mostra ~30% de uma foto 3:2:** enquadre `fx` na parte que identifica o objeto (frente do carro, logo, farol). Na Kombi,
  `fx .5` mostrou só janelas e `.8` mostrou a traseira; o certo foi `.16`. Confira cada estação numa prévia.
- Números: 37 cenas, 1:53, render 109 s com 12 processos (em CSS); −14,1 LUFS com `trilha_fd.py` e baque só nas 2 fumaças.

## Modo WebGL: fotos com relevo na placa (padrão desde 31/10/2026)
No CSS 3D cada camada era um cartão plano: a câmera deslizava cartões. Agora `palco3d` desenha as fotos em WebGL (`palcoGL`):
cada camada vira uma malha deslocada pela profundidade, então o carro tem volume, a câmera pode contornar (órbita de x ±400) e o
foco (`dof`) borra cada pixel pela distância real. A interface é a MESMA (`cam`, `tela`, `mira`, `plano`, `pt`): cenas antigas rodam sem mudança.
- **Liga sozinho** quando há `render/lib/three.min.js` e o Chromium abre com a placa. O `preparar_p3.py` faz as duas coisas
  (troca `--disable-gpu` por `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist --allow-file-access-from-files` no `render.py`
  do projeto; cópia em `render.py.antes_p3`). Sem isso, cai no CSS 3D. Com WebGL sem placa (SwiftShader) o console avisa: ~20x mais lento.
- **`P3.relevo`** (padrão 450): px de Z por unidade de profundidade dentro da camada; `relevo: 0` no palco = camadas planas como antes.
  `zs` continua dizendo onde fica cada camada (a profundidade típica dela, `dref`, cai exatamente no `zs`).
- **`P3.gl = false`** (ou `gl: false` no palco) volta ao CSS. Opções novas do palco: `relevo`, `seg` (malha, 320), `corte` (.07, rasgo nas bordas de profundidade).
- **Tela dentro de tela:** `g.tela()` e `g.mira()` usam a profundidade REAL do retângulo (grade `pg` do prof3d). As camadas na frente
  de uma tela vão para um 2º canvas por cima dela (a cadeira continua passando na frente do monitor).
- **Velocidade:** demo de 25 s em 10 s com 12 processos (era 24 s em CSS): a placa acelera a página inteira. Só 6 fotos ficam na placa
  ao mesmo tempo por processo (`P3GL_VIVOS`); as outras são soltas e recarregadas quando voltam.
- **Comparação:** `projetos/teste_parallax3d/out/cmp_css_webgl.mp4` (esquerda CSS, direita WebGL).

## Os componentes
- **`palco3d(r, {nome, zs, ov, fx, fy, cor, w, h})`**: o coração. É o mesmo princípio da câmera 3D do After Effects que o MagnatesMedia usa.
  - Cada camada `p3_<nome>_i` é um plano em `translateZ(zs[i])`, compensado em escala para que, com a câmera em 0, a foto fique igual à original.
  - **`zs`**: fundo bem longe (−900 a −1100), meio (−250 a −450), objeto na frente (0). **Chão e objeto que se tocam ficam com z próximos**
    (Opala: carro 0, chão −60). Senão o carro "patina" sobre o chão.
  - `ov` 1,15–1,25 (sobra para a câmera andar); `fx`/`fy` = ponto da foto no centro; `cor` = filtro CSS do look (quente/frio).
  - **`g.cam({x, y, z, zoom, rz, dof, foco, dofMax})`**: `z` positivo = dolly para dentro. Plano que passa pela câmera some sozinho.
    `dof` desfoca as camadas longe do `foco` (use ~.9 com `dofMax` 7: pesa no render).
  - **`g.tela(i, [x0, y0, x1, y1])`**: div presa ao plano i sobre um retângulo da foto (px da foto já redimensionada; veja o tamanho em `assets.js`).
  - **`g.mira(i, rect)`**: câmera que faz o retângulo encher a altura da tela (`{porLargura: true}` = largura).
  - `g.plano(z)`: plano vazio para elementos próprios.
- **`kf3(lt, [[t, {x, y, z}, ease], ...])`**: trajetória por chaves, cada trecho com a sua curva. **`mao3(lt, força, semente)`**: respiração de câmera na mão.
- **`fumaca(r, {modo: 'cobre'|'revela', ox, oy, t0, tc, dur, n, sobe, tom: FUM_CINZA|FUM_QUENTE, semente})`**:
  - `cobre`: os tufos nascem pequenos no ponto (pneu, motor, chaminé) e incham até cobrir tudo em `tc` (~1,3 s depois de `t0`);
  - `revela`: no começo da cena seguinte, a tela começa coberta e abre em `dur`.
  - No quadro do corte, as duas cenas mostram só o mesmo tom de fumaça (camada lisa POR CIMA dos tufos), e o corte não aparece.
- **`frase3(r, c, ['B05', 'B06'], {x, y, s: 84, larg, destaque: ['obedecer'], sai})`**: a narração em serifa (Sitka), palavra por palavra
  no tempo da fala (desfoque → nítido, subindo). A palavra do `destaque` sai em itálico vermelho `#e8473b` com brilho. Use UMA por frase.
- **`titulo3(r, 'OPALA SS', 'Chevrolet · anos 70', {x, y, s: 150, t0, tSub, sai})`**: título letra a letra + linha digitada.
- **`pilula3(r, 'MOTOR 250 · 6 CILINDROS', x, y, {t0, sai})`**: etiqueta mono (Consolas) digitada numa pílula escura.
- **`numero3(r, 'RÓTULO', x, y, {de, ate, t0, t1, suf, fmt})`** e **`regua3(r, x, {de, ate, passo}).set(v)`**: contador e régua da referência.
  Número na tela = dado conferido, com fonte (regra do kit).
- **`veu3(r, 'baixo'|'cima', força).set(a)`**: escurece atrás do texto. A serifa fina some em foto clara, então use em toda frase.
- **`grafico3(caixa, w, h, {pts, rot, esp})`**: linha vetorial com brilho e ponta. `g.set(u, cor)`, `g.cab(u)` dá a ponta (para a câmera seguir),
  `g.uX(fx)`, `g.marca(u)`. É vetorial, então continua nítido quando a câmera entra na tela.
- **`telaConteudo(tela)`** + **`vidro3(tela).set(a)`**: tela dentro de tela (abaixo).

## Passagens: o roteiro decide (Felipe, 31/10/2026)
"A animação de fumaça não tem que ser um padrão: ela fez sentido para o vídeo da NASA, mas tem que combinar com o que o roteiro pede."
- O plano contínuo é o formato; a FORMA de cada passagem vem da fala e das fotos daquele trecho. Nada de passagem fixa nem de cota
  ("uma fumaça a cada X"). Para cada emenda, responda: o que a fala diz neste ponto e o que existe nas duas fotos?
- **Fumaça (oclusão)** só quando algo na cena solta fumaça e a fala combina: foguete, motor, escapamento, pneu, chaminé, fogo, explosão,
  incêndio, fábrica. Num vídeo sem nada disso, não use nenhuma.
- **Tela dentro de tela / entrar na tela** quando a fala passa de "o objeto" para "o mercado, a notícia, o gráfico, a TV" (a coisa
  estava NUMA tela) ou quando a foto seguinte tem monitor, TV, telão, celular, painel.
- **Passagem vertical** para subir/descer de nível ("lá em cima", "afundou", céu → chão, prédio → rua, antes → depois na mesma linha).
- **Troca na palavra** (`troca`, chicote curto) para listas e enumerações dentro da mesma ideia.
- Outras que o roteiro pedir valem mais que estas (luz estourando num farol, câmera entrando no objeto que a fala nomeia, forma igual
  de uma foto para a outra). Teste numa prévia antes de usar no vídeo todo.
- No plano de estações, a coluna "passagem" traz o PORQUÊ ("fumaça: o motor liga na fala").

## As passagens prontas
1. **Oclusão (fumaça):** a cena A termina com `fumaca({modo: 'cobre', t0, tc})` nascendo de algo da foto; a cena B começa com
   `fumaca({modo: 'revela'})`, com `tr: 'cut'`. Dê ~1,3 s para cobrir e ~1,1 s para abrir. O texto da cena A sai antes do corte.
2. **Passagem vertical:** a câmera da cena A acelera para baixo nos últimos 0,45 s (`E.in`); a cena B entra com `tr: 'whipU'` e a câmera
   desacelerando (vem de `y` negativo). Parece um tilt único.
3. **Tela dentro de tela (recuo):** a cena A é a imagem que vai aparecer NUM MONITOR da foto da cena B.
   - Guarde as opções do palco de A (`OPC_LOJA`) e a câmera (`CAM_LOJA`) em constantes. A câmera de A precisa PARAR no fim: a chave final antes do fim da cena.
   - Na cena B: `const mon = S.p.tela(0, RECT_MONITOR)`; `palco3d(telaConteudo(mon), {...OPC_A, w: mon.tw * H / mon.th, h: H}).cam(CAM_A(99))`.
   - Câmera de B: começa em `S.p.mira(0, RECT_MONITOR)`, **segura 0,12 s** e só então recua (curva que começa devagar).
     Assim o quadro do corte fica idêntico. `vidro3` sobe de 0 a .9 depois.
   - O texto de A sai antes do fim da cena, senão "some" no corte.
4. **Entrar na tela (avanço):** o inverso. Ponha conteúdo vetorial (gráfico) ou um palco numa `tela` da foto. Termine a cena com a câmera
   em `S.p.mira(0, RECT)` (a tela enchendo o vídeo). A cena seguinte começa com o MESMO conteúdo em tela cheia, no mesmo enquadramento.
   Na demo, a S5 recria o gráfico com a proporção do painel e começa com a ponta da linha no mesmo ponto.

## Passo a passo
1. **Projeto:** `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs), depois corte e beats como no kit.
2. **Formato:** `python <esta pasta>/preparar_p3.py <nome>`.
3. **Pesquisa:** cada fato, número e data com fonte. O que estiver errado na fala NÃO vai para título, pílula ou número.
4. **Roteiro de estações:** tabela `estação | beats | foto | camadas (zs) | câmera | texto | passagem para a próxima (e por quê)`.
   - Uma estação a cada 2–6 s, nunca duas passagens iguais seguidas.
   - **A passagem sai da fala** (seção "Passagens: o roteiro decide"). Depois de decidir, procure a foto que permite fazê-la:
     um monitor/TV para a tela dentro de tela, algo que solte fumaça só se a fala falar disso.
     A demo achou os dois monitores na foto da bolsa: grade no recorte para medir o retângulo.
   - **Câmera com relevo:** contorne o objeto (x de −300 a +400 com o alvo no objeto) em vez de só deslizar; confira as bordas da foto numa prévia.
5. **Fotos:** reais (Commons, imprensa, as do Felipe), **grandes** (≥ 2500 px; baixe o original do Commons pela API, `iiurlwidth=3200`).
   O vertical mostra só ~40% da largura de uma foto 4:3. Rosto de pessoa real ou marca por IA só com OK do Felipe (pergunte antes).
6. **Camadas:** `python camadas3d.py <proj> fotos/x.jpg --nome x [--objeto] [--cortes .5,.78]` e abra `out/p3_x_folha.jpg`.
   - Carro, pessoa ou produto: `--objeto`. O objeto vira a camada da frente com borda limpa, e o corte separa o resto (Opala: `--objeto --cortes .38`).
   - Paisagem/sala: 2 cortes. Objeto partido em duas camadas = mude os cortes.
   - Ele já grava o relevo do WebGL (`prof3d`). Projeto feito antes de 31/10: `python prof3d.py <proj>` uma vez.
7. **Cenas** em `work/p3_b.js` (copie `cenas_exemplo.js`): `camMove: camFixa`, `tr: 'cut'` (ou `'whipU'`), comentário `// Sn — "fala"`.
   Depois `python montar_p3.py <nome> p3`.
8. **Prévias:** `python render.py preview ...` nos instantes de cada passagem: 0,05 s antes e depois de cada corte (têm de ser IGUAIS),
   meio da fumaça e meio do recuo. Folha com `tools/sheet.py`.
9. **Render:** `python render_par.py 12` (demo: 750 quadros em 10 s com WebGL na RTX 5070 Ti; 24 s em CSS).
10. **Som:** `python render.py events`; voz + cama. A demo usou `edit-founded/trilha_fd.py` com `trilha.json`
    `{"baque": -4, "sem_baque": [beats do recuo e da entrada na tela], "sobe": [["B16", "B17", 3]]}`: baque grave na fumaça e na passagem,
    nada nas passagens "invisíveis". Sem `mix.py`, crie `audio/sfx_bus.wav` silencioso do tamanho do vídeo.
11. **Entrega:** `ferramentas/entregar.py <proj> NOME --video out/master.mp4 --audio audio/final_mix_fd.wav --destino "H:\Downloads\Edicoes_Claude"`.
    Depois, folha 2 quadros/s do tiktok e confira cada passagem.

## Armadilhas (vistas no teste)
- **Fumaça procedural (desenhada em código) não convenceu:** ficou pedra ou bola. A boa é foto REAL de nuvem com o céu removido (`nuvem_png.py`).
- **Fumaça grande demais cedo:** com escala alta desde o início, a tela fica creme em 0,4 s e parece céu. Os tufos nascem em 5% e incham
  com `v^1.5`. A camada lisa de fumaça fica POR CIMA dos tufos e com tom claro (filtrado ela escurece). Escura demais parece fade para preto.
- **Fundo creme do motor vazando** (gráfico subindo, fumaça): o `estilo.css` esconde o `.sbg`. Se rodar o preparar de novo, ele troca o CSS.
- **Recuo do monitor com `E.out5`:** a câmera já anda 10% no 1º quadro e o conteúdo pula ~50 px no corte. Segure 0,12 s e use curva que começa devagar.
- **Camada que passa pela câmera:** a cadeira da bolsa vira um borrão gigante por ~0,2 s ao "entrar" no recuo. Na referência é o mesmo
  (a moldura do monitor), mas se incomodar ponha z mais longe ou recue menos.
- **Serifa fina sobre foto clara (motor):** sem `veu3` não se lê.
- **Texto da cena anterior no corte da tela-na-tela:** o `sai` da frase tem de acabar antes do fim da cena (o monitor da cena seguinte não tem texto).
- **`--objeto` antes somava o ISNet à profundidade** e o chão entrava junto com o carro. Agora o objeto é só o ISNet, numa camada a mais.
- **WebGL: palco cinza no recuo do monitor (31/10):** com a câmera perto, um plano CSS vazio virava uma camada de ~18 mil px; com o
  filtro `cor` do palco, passava do limite da placa e o Chromium apagava o palco. O `palcoGL` esconde planos vazios: não ponha
  elementos grandes em planos que passam rente à câmera.
- **WebGL: borda da foto e borrão do LaMa:** contornando o objeto, a câmera mostra a borda da foto ou o preenchimento atrás do objeto
  da frente (fica borrado). Feche o `fov`/aumente `ov` e não deixe a câmera passar POR CIMA do objeto da frente.
- **OpenCV e caminho com acento:** `camadas3d.py` lê com PIL; não troque por `cv2.imread`.
- **Imagem gerada:** primeiro o **Qwen local** (`gerar_qwen.py`, `Kit_Edicao_Vox_v2/guias/prompts_imagens.md` §2, `"modelo": "base"`), e o
  Higgsfield só se o Qwen não der conta. Na demo de 30/10 não havia crédito no Higgsfield, então só entraram fotos reais. Dá para gerar estações genéricas sem pessoa real
  (sala, céu, objetos), sempre em camadas pelo `camadas3d.py`.

## Checklist antes de entregar
- [ ] Nenhum corte visível: os quadros 0,05 s antes e depois de cada passagem são iguais (fumaça lisa ou tela enchendo o vídeo).
- [ ] Cada passagem tem um porquê no roteiro; fumaça só onde algo da cena solta fumaça.
- [ ] O console do render não avisa "WebGL SEM a placa" nem "sem relevo".
- [ ] A câmera nunca para; cada estação tem parallax real (frente anda mais que o fundo) e nenhuma borda de foto aparece.
- [ ] Toda frase com `veu3` e legível; UMA palavra vermelha por frase; título/pílula/número só com dado conferido e fonte.
- [ ] Fotos reais com crédito (autor e licença) na mensagem final; rosto de pessoa real gerado só com OK do Felipe (pergunte antes).
- [ ] −14 LUFS; baque só nas passagens de fumaça/vertical; versão `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`.
