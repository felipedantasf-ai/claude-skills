---
name: vox-editorial
description: Formato de edição "Vox editorial" do Felipe para vídeos verticais feitos com o Kit_Edicao_Vox_v2 — colagem sobre papel cinza com imagens e motions em CORES VIVAS e chamativas (recortes coloridos sobre blocos de cor complementar, fotos cinematográficas coloridas, raios, formas de papel, cortinas de cor, traços coloridos), fotos de arquivo impressas com fita, a fala como tipografia em serifa palavra por palavra integrada a cada cena, apresentador colorido e final com celular (Seguir → Seguindo). Use quando o Felipe pedir para editar um vídeo nesse modelo, "no formato Vox editorial", "igual ao Lula PIX MEI v2", "como o PT Bahia" ou "como o vídeo de exemplo do papel cinza", inclusive vídeos só com áudio (faceless).
---

# Formato Vox editorial

Modelo aprovado pelo Felipe em 13/10/2026 (vídeo **LulaPixMei_v2**, 2:14, 29 cenas), com os ajustes que ele pediu depois:
- **13/10:** apresentador colorido e cores mais fortes.
- **14/10:** imagens e motions em **cores vivas e chamativas**. Além de ilustrar a fala, cada imagem precisa **prender a atenção** de quem está rolando o feed. O PT Bahia v1 (recortes P&B sobre papel cinza) ficou "apagado": 69% dos quadros tinham menos de 12% de cor viva.

Os ajustes já estão nos componentes desta pasta. O estilo-base veio do vídeo de referência `H:\Downloads\ssstwitter.com_1791640485302.mp4` (16,8 s, sem apresentador).

Antes de planejar, abra as imagens desta pasta:
- `referencia_cores.jpg` mostra **o visual atual**: recortes e fotos coloridos, raios, formas de papel, cortina de cor, colunas vivas, foto P&B resgatada com duotone e traços amarelos.
- `referencia_formato.jpg` e `referencia_exemplo.jpg` mostram composição, legenda e ritmo. As imagens P&B delas são do visual antigo: não copie a cor delas.

Esta skill complementa o kit e não o substitui. O pipeline base (corte, beats, render, mix, entrega), as regras de checagem e as armadilhas estão em `H:\Edição Claude\Kit_Edicao_Vox_v2\CLAUDE.md`, e as preferências do Felipe estão na memória do projeto. Leia os dois.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca do formato: legenda, fundos, impressões, recortes de jornal, régua, mapa antigo, blocos de cor, carimbo, traços à mão, **raios, formas, cortina, duotone, plateCor**, apresentador. É a 1ª parte do `scenes.js`. |
| `cenas_cores.js` | 6 cenas de demonstração do visual atual (falas do PT Bahia): raios + recorte colorido, par complementar, colunas vivas, cortina entre cenas, duotone, foto colorida com traços. |
| `cenas_exemplo.js` | as 29 cenas do vídeo do Lula: modelo de composição, ritmo e sincronia. As imagens dele são P&B (visual antigo). Copie ritmo e ideias, não as cores. |
| `legenda.css` | CSS da legenda, da barra e do grão para o `render/index.html`. |
| `preparar_formato.py` | prepara um projeto novo: fontes Sitka, CSS, componentes e o pipeline melhorado. |
| `prep_prints.py` | transforma as fotos de arquivo em impressões **coloridas** com retícula leve (`print_<nome>.jpg`). `--pb` faz a impressão P&B. |
| `montar.py` | junta as partes em `render/scenes.js` e confere sintaxe, palavras-âncora e sequência de beats. |
| `previas.py` | gera folhas de prévias por cena (respeita o `lead` de cada cena). |
| `checar_cores.py` | mede a cor viva de cada quadro (prévias ou vídeo) e lista os trechos "apagados" para corrigir. |
| `versoes/` | cópias das versões anteriores da skill (v1 de 13/10). |

Rode todos os scripts com o Python do kit: `H:\Edição Claude\Kit_Edicao_Vox_v2\.venv\Scripts\python.exe`.

## Cor viva e atenção (o que mais pesa desde 14/10)
No feed vertical, a pessoa decide em meio segundo se continua assistindo. O que segura o dedo é **cor saturada e um assunto grande e claro**. Papel cinza com recorte P&B é elegante, mas para o Felipe fica apagado. O outro extremo, neon e brilho, ele chama de "slop". O alvo fica no meio: **cores chapadas e vivas com textura de papel, recortes fotográficos coloridos e contraste forte.**

1. **Cor viva em todo quadro.** O papel cinza é a mesa; a cor é o conteúdo. A cor viva deve ocupar boa parte da tela: no mínimo 12% em qualquer quadro e 25% ou mais nos momentos fortes. Um bloco de 700×760 já ocupa 25%. Meça com `checar_cores.py`.
2. **Imagens coloridas.** Gere recortes e fotos em cores vivas e saturadas (prompts abaixo).
   - P&B só como exceção deliberada (ex.: "o passado"), e mesmo assim com duotone ou um elemento vivo por cima.
   - Asset P&B antigo (biblioteca do kit, projetos anteriores): use `duotone()`.
3. **Contraste por par complementar.** O objeto fica numa cor e o bloco ou fundo no par dela (`PAR`):
   - vermelho × ciano
   - laranja × azul
   - amarelo × roxo
   - verde × rosa

   Diga a cor dominante do objeto no prompt para combinar com o bloco planejado.
4. **Assunto grande e claro.** Um assunto por momento, ocupando 60–80% da largura e legível na tela do celular em meio segundo. Nada pequeno solto no cinza.
5. **Motions coloridos.**
   - **Traços:** amarelo por padrão; também vermelho ou ciano, de 7 a 12 px.
   - **Colunas, blocos e carimbos:** sempre em cor viva.
   - **`raios`:** atrás do assunto nos momentos mais fortes.
   - **`formas`:** estouram na palavra-chave.
   - **`cortina`:** na troca de assunto ou capítulo.
   - **`soco`:** escala na palavra-chave.
   - Sempre algo se mexendo: empurrão, flutuação, raios girando.
6. **Teste da atenção** (para cada imagem do plano):
   - a) Entende-se em 0,5 s?
   - b) Tem cor viva dominante e contraste com o fundo?
   - c) Tem algo inesperado (escala, ângulo baixo, close, metáfora visual)?
   - d) Entra com impacto na palavra exata (queda, subida ou soco, com som)?
   - e) Continua viva enquanto está na tela?
7. **Viva não é neon.** Proibido:
   - brilho (glow) e neon;
   - degradê colorido;
   - aparência de plástico 3D brilhante de IA;
   - arco-íris em tudo;
   - etiquetas coloridas repetindo a fala.

   Use no máximo 3 ou 4 cores por quadro, chapadas e com textura de papel.
8. **Dose.** Raios, formas e cortina são tempero: 2 a 4 usos de cada por vídeo, no gancho, nas viradas, nos números fortes e no final. Se tudo explode, nada se destaca.

## O que define o formato (não negociar)
1. **Fundo:**
   - Base de papel cinza médio com fibra (`t_papel`), a mesa neutra que faz a cor saltar, com grão de filme e vinheta leve.
   - Papel colorido em tela cheia (`paperBg(r, {cor})` ou bloco de tela cheia) nas viradas, capítulos e números fortes, cerca de 1 a cada 4 ou 5 cenas.
2. **Cor viva em blocos de papel liso:** `K.laranja`, `K.ciano`, `K.amarelo`, `K.verde`, `K.vermelho`, `K.rosa`, `K.azul`, `K.roxo`.
   - Ficam atrás dos recortes, em colunas de dados, faixas e trapézios.
   - Uma cor por lado ou entidade (ex.: patrão laranja × funcionário ciano).
   - O bloco fica no par complementar do objeto.
3. **Pessoa real citada:**
   - Use as fotos de arquivo que o Felipe mandou como **impressão colorida** (`prep_prints.py`: cor reforçada, retícula leve), com borda de papel, fita e leve rotação, caindo na tela no nome.
   - Um bloco de cor viva atrás da impressão ajuda a destacar.
   - A seta de laço desenhada à mão, em cor viva, aponta para a legenda, que fica ao lado como rótulo.
   - **Nunca recortar a pessoa nem pôr brilho** (o Felipe achou "muito ruim"). Rosto de pessoa real ou marca por IA só com OK do Felipe (pergunte antes).
4. **Objetos e metáforas:** recortes **coloridos** (foto editorial em cor viva), grandes, que sobem ou caem na palavra sobre um bloco da cor complementar.
5. **Clima e tensão:**
   - Foto cinematográfica **colorida** de paleta forte (`plateCor`): pôr do sol laranja, noite azul profunda com luz quente, vermelho dramático.
   - Empurrão lento e legenda `glow`.
   - Troque de foto na palavra exata, com 2 ou 3 fotos por cena quando a fala muda.
6. **A legenda é a tipografia do vídeo:** a fala aparece em serifa (Sitka) palavra por palavra, em blocos curtos. As palavras de ligação ficam pequenas numa linha em cima e as palavras-chave grandes, em itálico, embaixo. Cada cena define onde e como a legenda aparece (`S.cap`). Não existe outra legenda.
7. **Apresentador colorido** (`pres4`): corte seco, legenda `glow` no peito (y≈1460), nunca texto nos olhos. Poucas aparições (frases de opinião ou pergunta) e o final.
8. **Dados e manchetes:** só reais e conferidos.
   - Manchete: recorte de jornal com fita e marca-texto amarelo nas palavras ditas.
   - Número: colunas em cor viva, com `soco` no número; fonte e ano em letra pequena (etiqueta preta).
   - Número errado da fala não vai para a tela.
9. **Final:**
   - Com apresentador: rosto por ~0,5 s.
   - Depois, o papel sobe com a mão segurando o celular (perfil + botão **Seguir vermelho**).
   - No "seguir", o botão vira "Seguindo ✓", com anel do toque, corações desenhados e "+1".
   - Raios atrás do celular no "seguir" são opcionais.
10. **Som:** sons táteis padrão do kit (papel, obturador, lápis/marcador, teclas de máquina, carimbo, moeda). Rode o `mix.py` sem `SOM_ESTILO=cinema` e sem trilha, salvo se o Felipe pedir.

## Recursos visuais: o que usar para cada tipo de fala
| a fala é sobre… | recurso (componentes) |
|---|---|
| gancho, número-bomba, virada forte | `raios` atrás de um recorte colorido grande + `formas` + `soco` na palavra (+ som pop/whoosh) |
| uma pessoa ("Lula anuncia", "disse ele") | `printPhoto` colorida + bloco de cor viva atrás + `dropIn` + `loopArrow` colorida; legenda `title` ao lado da foto (`x`, `rot` ≈ −4) |
| prazo, data, "faltam N dias", "ano que vem" | régua `ruler(p, y, {c: K.amarelo})` + número grande em `serifText`/`typeIn` + `soco` |
| manchete, declaração, citação | `clipping` com o texto **real** e `mk()` na palavra dita; foto impressa ao lado; legenda `tag` |
| pesquisa, comparação, série histórica | colunas `pblock` em cores vivas proporcionais, crescendo com mola; `soco` no número; fonte em `tagL` |
| definição ou valor ("fatura até R$ 81 mil") | recorte colorido + bloco complementar (trapézio) que sobe; a legenda muda para `dark` e pousa no bloco |
| algo que se espalha pelo país | `oldMap` + manchas vermelhas/laranja crescendo (círculos com filtro `feTurbulence`, ver V20 do exemplo) |
| "em alguns lugares" | `oldMap` + pinos vermelhos que aparecem um a um |
| acusação, crise, clima | `plateCor` (foto colorida dramática) + legenda `glow` + traço vermelho/amarelo; troca de foto na palavra |
| lista de desejos ou de itens | foto colorida + lista em serifa com vistos coloridos desenhados à mão |
| perdão, pago, aprovado | `inkStamp` em cor viva + `stampIn` (+ `formas` se for o momento forte) |
| negação ("sem devolver") | símbolo desenhado (`arcArrow`) + X vermelho grosso riscado (`scribble`) |
| crescimento | seta em zigue-zague amarela subindo + bloco verde |
| dívida, pilha de papel, carga | recorte colorido (papelada, homem carregando pilha) + "a conta" caindo |
| troca de assunto, capítulo ("Primeiro.", "Segundo.") | `cortina` com o painel na cor do capítulo + número grande + `formas` |
| imagem P&B que precisa entrar (biblioteca, foto antiga) | `duotone(img, escura, clara)` em cores vivas |
| final ("basta seguir esse perfil") | celular com perfil, Seguir → Seguindo (V29 do exemplo; V23 do PT Bahia sem rosto) |

Ritmo: um estímulo novo a cada 1,5 a 2,5 s, cada um ligado à palavra exata (`c.w('B12','palavra')`).

## Passo a passo
1. **Projeto e transcrição:** na raiz do kit, `python novo_projeto.py <nome> "C:/.../video.mp4"`.
2. **Formato:**
   - `python <esta pasta>/preparar_formato.py <nome> --prefixo xx`
   - Copia fontes Sitka, `legenda.css` no `index.html`, `componentes.js` em `work/xx_a.js` e o pipeline melhorado do `lula_pix_mei` (corte sem silêncios; o `build_edl.py` vem com a configuração zerada).
   - Faz cópia de segurança de tudo que substitui.
3. **Corte:**
   - Preencha `fix`/`DROP`/`CUT_HEAD`/`CUT_TAIL` no `build_edl.py` e rode `build_edl.py` e depois `quadros.py`.
   - Leia `work/cut_whisper.log`. O resultado tem de ter **0 silêncios ≥ 0,15 s** e soar contínuo.
4. **Beats:** preencha `SPLIT` em `make_beats.py` e rode `make_beats.py` e depois `align.py`. Quebre antes de nomes, números e viradas.
5. **Pesquisa e plano:**
   - Confira cada fato e guarde os links das fontes.
   - Faça o plano de cenas: tabela cena | beats | fala | recurso | imagens | **cor do assunto × cor do fundo** | legenda (`S.cap`).
   - Passe cada imagem pelo teste da atenção.
   - Marque onde entram raios, formas e cortina (2 a 4 de cada).
6. **Imagens novas** (prompts abaixo):
   - Recortes coloridos: `tools/adesivos.py hf/g_*.png`.
   - Fotos coloridas e texturas: `tools/fundo_camadas.py placa hf/q_x.png q_x` (e `t_papel`, `t_pergaminho`).
   - Fotos de arquivo: `python <esta pasta>/prep_prints.py <nome> fotos/a.jpg:0.5 fotos/b.jpg:0.6:1`.
     - Sai colorido por padrão.
     - O número depois do primeiro ":" é o centro horizontal da pessoa (0 a 1).
     - O número depois do segundo ":" é a proporção do recorte (largura/altura, padrão 0,75; use 1 quando a pessoa abre os braços).
     - O script roda o `make_assets.py` sozinho.
   - Nomes: `g_*` para recortes, `q_*` para fotos de clima, `print_*` para fotos de arquivo. Nunca use o nome de um asset de outra versão.
   - As texturas `t_papel` e `t_pergaminho` podem ser copiadas de `projetos/lula_pix_mei/render/assets/` em vez de geradas.
7. **Cenas:**
   - Escreva em `work/xx_b.js`, `xx_c.js`… (`xx_a.js` já é a biblioteca).
   - Comente cada cena com `// Vn — "fala"`.
   - `python <esta pasta>/montar.py <nome> xx` deve dar sintaxe ok, palavras ok e beats ok.
8. **Prévias:**
   - `python <esta pasta>/previas.py <nome>`, abra `out/pv/cenas_*.jpg` e corrija.
   - Rode `python <esta pasta>/checar_cores.py <nome> --previas`. Quadro abaixo de 12% de cor viva deve ser corrigido: recorte colorido maior, bloco vivo atrás, foto colorida ou duotone, papel colorido, raios ou formas no momento forte.
   - Confira em tamanho maior os quadros com texto pequeno (`render.py preview t1 t2 …`).
9. **Render e áudio:**
   - `render.py events` → `render_par.py 5` → `mix.py` → `tools/qa_sheets.py` (olhe todas as folhas).
   - Rode `checar_cores.py <nome>`: nenhum trecho de 1 s ou mais pode ficar abaixo do mínimo.
   - Entrega: `entregar.py NOME_vN --nvenc --destino "H:\Downloads\Edicoes_Claude"`.
   - **Versões:** nunca sobrescreva. Cada ajuste é `_v2`, `_v3`… Guarde também o master e o mix anteriores (`out/master_vN.mp4`, `audio/final_mix_vN.wav`).
10. **Mensagem final** (português, curta):
    - o que saiu e onde
    - o que mudou
    - créditos gastos
    - avisos de checagem: o que a fala diz, o valor certo e a fonte
    - **Fontes:** com os links

### Vídeo só com áudio (faceless)
- Crie um vídeo-suporte cinza 1080×1920 30 fps com o áudio e use-o no `novo_projeto.py`.
- Não rode o `quadros.py`. Para conferir o corte, use `ffmpeg` (16 kHz) + `tools/transcribe_whisper.py` → `work/cut_whisper.log`.
- Crie `render/camdata.js` com `window.FACE = { cx: [], cy: [] };`.
- Sem `pres4`: o final começa direto no papel com a mão e o celular.
- Exemplo completo: `projetos/pt_bahia`.

## Legenda: `S.cap` em cada cena
| modo | onde usar | posição típica |
|---|---|---|
| `title` | cenas no papel cinza, com objeto ou foto no centro; palavra por palavra (ligação pequena em cima, chave em itálico) | y 300–460; ao lado da foto impressa: `x` ≈ 600, `rot` −4 |
| `tag` | mapas, recortes de jornal, quadro já cheio (etiqueta preta, bloco inteiro de uma vez) | y 1480–1640 |
| `glow` | fotos (coloridas ou não) e apresentador (itálico branco com sombra, bloco inteiro) | foto: y≈1500 · apresentador: y≈1460 |
| `dark` | sobre bloco ou papel de cor clara (amarelo, ciano, rosa), quando a fala "pousa" no bloco | dentro do bloco, ou no topo do papel colorido |
| `none` | só se a cena for tipográfica por si | — |

- O modo pode mudar dentro da cena: `S.cap = lt >= t ? {mode:'dark', y:1395} : {mode:'title', y:360}`.
- **Legenda sobre cor:**
  - amarelo, ciano ou rosa: use `dark` (texto claro some no amarelo);
  - vermelho, azul, roxo, laranja ou verde: `title` funciona;
  - foto: `glow`.
- Os blocos têm até ~22 letras, não terminam em palavra de ligação e não separam número da unidade ("5 mil reais"). Isso já vem pronto no `componentes.js`.
- O apresentador nunca recebe legenda `title` sobre o rosto.
- Ao atrasar a cena seguinte com `lead` negativo depois de uma cena `glow`, ponha `S.cap = {mode:'none'}` a partir do início do beat seguinte. Assim a próxima legenda não pisca no modo antigo.

## Regras de composição
- **Quadro 0 completo.** A 1ª cena já começa montada (ex.: raios e recorte já na tela). Nenhuma cena começa vazia.
- **Troca dentro da cena:** use camadas `S.A`/`S.B` (`display` alternado na palavra) e faça a camada que sai subir (`translateY`) em 0,3 s. O recorte sobe **junto** com o bloco dele (no máximo 0,05 s depois). Senão o bloco aparece vazio por 0,5 a 1 s.
- **Palavra-âncora no fim do beat:** quando a palavra é a última do beat (ex.: "agora", "garantido"), dê `lead: -.15` a `-.3` na cena seguinte e acenda o elemento ~0,2 a 0,3 s antes. Sem isso ele aparece por menos de 0,3 s.
- **Um controlador de transform por elemento por quadro** (`tx`, `live`, `dropIn`, `riseIn`, `stampIn`).
  - Para dar `soco`, passe-o como `s:` do controlador que já existe.
  - Quem só muda de texto ou opacidade não precisa de `tx`, porque `serifText` e `tagL` já nascem centralizados.
- **Recortes:** `cut(r, 'g_x', cx, cy, w, {plain: true, shadow: false})` (sem borda de adesivo). Use `viva(e, 1.1, '0 22px 26px rgba(0,0,0,.35)')` para reforçar a cor e dar sombra.
- **Raios:**
  - Crie antes do recorte (ficam atrás).
  - Use um disco de raio 560–640 centrado no assunto, deixando o topo livre para a legenda.
  - `tela: true` só quando a legenda for `tag`/`dark` sobre bloco.
- **Cortina:**
  - A última cor é o painel; use a cor de fundo da cena seguinte, para a passagem ficar contínua.
  - Troque as camadas exatamente no `t` passado ao `at`.
  - Entre cenas: `at(lt, c.dur)` na que sai e `at(lt, 0)` na que entra.
- **Traços:** amarelo no papel cinza, em fotos e em blocos escuros. Em bloco amarelo, use vermelho ou `K.dark`; em bloco laranja, `K.ink` também funciona.
- **Margens:** 40 px. A legenda `title` não divide a tela com outro texto grande no topo.
- **Repetição:** máximo de 2 usos da mesma foto de fundo e 2 a 3 usos do mesmo recurso no vídeo.
- **Mapa:** `oldMap(r, {lon:-53, lat:-15, z:2.25, cy:900})` enquadra o Brasil. Os rótulos de oceano ficam no mar (ex.: lon −41,5 / lat −26). Pinte as áreas citadas em cor viva (vermelho/laranja).
- **Régua:** a marca grande cai em x=540 quando `set(px)` usa px = passo×grande×m − 740 (passo 24/grande 5 → 220; grande 10 → −20 ou 220).
- **Colunas de dados:**
  - Proporcionais ao valor real.
  - Rótulos com as casas decimais certas ("13,75%").
  - Se a série cai no fim, controle você a visibilidade dos rótulos.
- **Cor de bloco trocada no meio da cena:** troque `backgroundColor` e mantenha a textura neutra (`ptex('#efece4', 30)`). Textura da mesma cor escurece o tom.
- **Transições:** quase tudo em `cut`. A mudança vem do próprio movimento (subir, cair, deslizar) e da `cortina` nas trocas de assunto.

## Componentes (`componentes.js`)
- **Paleta:** `K.ink` (texto claro), `K.dark`, e as cores vivas `K.laranja`, `K.ciano`, `K.amarelo`, `K.verde`, `K.vermelho`, `K.rosa`, `K.azul`, `K.roxo`.
  - `PAR` dá o par complementar de cada cor (ex.: `K[PAR.vermelho]` = ciano).
  - Fonte: `SERIF = 'Sitka'`.
- **Fundos:**
  - `paperBg(r, {cor, b})`
  - `plateCor(r, 'q_x', {k, sat, ct, b, vig})` + `.push(lt, dur, {ds, dy})`: foto colorida. Se a imagem já vier muito saturada, use `sat: 1`.
  - `plateBW(...)`: P&B, só como exceção.
  - `oldMap(r, {lon, lat, z, cy})` + `M.br`, `M.lab(txt, lon, lat)`, `M.place(e)`, `M.pt(lon, lat)`
- **Cor viva e atenção:**
  - `raios(p, cx, cy, {c1, c2, r, n, tela, vel})` + `.at(lt, t, {out})`
  - `formas(p, cx, cy, {r, n, s, cores, seed})` + `.at(lt, t, {out})`
  - `cortina(r, {cores, d, ang})` + `.at(lt, t)`
  - `soco(lt, t, a)`: passe como `s:`
  - `viva(e, k, sombra)`
  - `duotone(img, escura, clara)`
- **Papel e foto:**
  - `printPhoto(p, 'print_x', cx, cy, w, {rot, tape:['tl','tr','bl','br']})`
  - `clipping(p, {top, w, kicker, title:[[txt, chave]], body, foot, ts, rot})` + `.upd(lt, at, {out})` + `.mk(chave, q)`
  - `pblock(p, cor, x, y, w, h, {clip})`
- **Texto:**
  - `serifText(p, txt, cx, cy, {s, wt, it, c})`
  - `tagL(p, txt, cx, cy, {s})`
  - `typeIn(e, txt, lt, t0, cps)`
  - `inkStamp(p, txt, cx, cy, {s, c, rot})` + `stampIn(e, lt, t)`
- **Movimento:**
  - `dropIn(e, lt, at, {dy, r0, out, s})` (cai girando)
  - `riseIn(e, lt, at, {dy, d, out, s})` (sobe de baixo)
- **Traço à mão (num `svgAbs`; amarelo e 7 px por padrão):**
  - `scribble(svg, d, {w, c})` com `.draw(q)`
  - `loopArrow(svg, x, y, s, rot)`
  - `roughRing(svg, cx, cy, rx, ry, {c, w})`
  - `arcArrow(cx, cy, r, a0, a1)`
  - `sparkleD(x, y, r)`
  - `HEART`
- **Tempo:** `ruler(p, y, {step, big, c})` + `.set(px)`.
- **Apresentador:** `pres4(beats, {lead, capY, build(L,S,c), update(S,c), pb:true para P&B})`.
- **Do kit:** `cut`, `hero`, `live`, `tx`, `ez`, `E`, `sv`, `svgAbs`, `el`, `box`, `cue`, `stampIn`, `mapView`, `MK`/`mkSet`, `camStill`/`camPush(k)`, `hrand`.

## Prompts-base para imagens (Qwen local primeiro; Higgsfield só se o Qwen não der conta)
- **Qwen local (PRIORIDADE, regra do Felipe de 01/11/2026):** `H:\ComfyUI\.venv\Scripts\python.exe H:\ComfyUI\gerar_qwen.py --lote work/imagens.json --saida hf`. O script liga e desliga o ComfyUI sozinho. Detalhes e critérios para ir ao Higgsfield: `guias/prompts_imagens.md` §2 do kit.
  - Gere 3–4 versões por imagem (Turbo, ~3 s) e escolha a melhor.
  - Para a foto colorida de tela cheia, use `"modelo": "base"`.
  - Para recortes, use `"recorte": true`: o assunto é gerado na cena (luz real, fundo desfocado) e sai `_rgba.png` pelo BiRefNet. Não escreva "transparent background" nem "isolated" no prompt; com pessoa isso piora rosto e luz (03/11/2026).
  - Trava de estilo do vídeo: `{"estilo": "...", "itens": [...]}` no lote (ver `guias/prompts_imagens.md`, "Direção de arte").
  - Os prompts abaixo servem para os dois.
- **Higgsfield (só se o Qwen não der conta):**
  - Parâmetros: `gpt_image_2_5`, `variant: flare`, `quality: high`, `resolution: 2k`. Para recortes, acrescente `background: transparent`. Custa 2,75 créditos por imagem.
  - Limites: lotes de até 4, no máximo 8 imagens gerando ao mesmo tempo.
  - Registro: anote os gastos em `hf/gastos.txt` e baixe com `curl.exe`.

**Recorte colorido (1:1, 3:4 ou 9:16):**
> Isolated cutout on a fully transparent background: <objeto/cena, vista, tudo visível com margem>, <cor dominante viva + material e detalhes>. Vivid saturated colors, punchy contrast, crisp studio light, sharp detail, photographic editorial collage style with a subtle halftone print texture, clean edges, the object large and filling the frame. No text, no logos, no watermark, no glow, no neon, no gradient.

- Testado em 14/10: "a vintage hand-held megaphone, glossy fire-engine red body…" e "an empty enamel metal plate in vivid cobalt blue with a dark navy rim and a few chips…" (ver `referencia_cores.jpg`).
- Nomeie a cor dominante para casar com o bloco complementar.
- Objetos com marca de uso (lascado, gasto, antigo) parecem mais reais e menos "banco de imagem de IA".
- Ângulo baixo, close e escala inesperada chamam mais atenção.

**Foto cinematográfica colorida 9:16:**
> <cena, ângulo dramático>. Vivid color cinematic photograph, bold saturated palette dominated by <cor> with <cor complementar> accents, dramatic directional light, strong contrast, one clear focal point <onde>, fine film grain, editorial documentary look, vertical composition. All people anonymous and seen from behind, no faces visible. No text, no logos, no watermark, no neon, no glow.

- Testado em 14/10: comício ao pôr do sol, bandeiras vermelhas sem símbolo, céu laranja e magenta.
- Saiu bem saturado, então use `plateCor(..., {sat: 1})`.

Pessoas geradas: só anônimas (de costas, mãos, silhuetas, multidão de costas).

**Texturas (uma vez; ou copie do `lula_pix_mei`):**
- `t_papel`: "Flat top-down texture of plain medium gray construction paper, fine fibers and subtle grain, evenly lit, uniform, seamless. No objects, no text."
- `t_pergaminho`: "Flat top-down texture of aged cream parchment paper like an antique map sheet, subtle stains and fibers, evenly lit, nothing printed on it."

## Checklist antes de entregar
- [ ] `checar_cores.py`: nenhum trecho de 1 s ou mais abaixo de 12% de cor viva (salvo escolha deliberada, avisada ao Felipe).
- [ ] Recortes e fotos coloridos, par complementar objeto × fundo, assunto grande; cada imagem passou no teste da atenção.
- [ ] Motions coloridos; raios, formas e cortina com moderação (2 a 4 de cada).
- [ ] Nenhum neon, brilho, degradê colorido, plástico 3D ou etiqueta repetindo a fala.
- [ ] Apresentador colorido.
- [ ] Fotos de arquivo só como impressão com fita, no momento em que a pessoa é citada.
- [ ] Legenda em todas as cenas, legível sobre a cor e nunca sobre os olhos.
- [ ] Toda manchete e todo dado são reais e têm fonte e ano.
- [ ] Zero silêncios ≥ 0,15 s.
- [ ] Som em −14 LUFS e pico −2 dBTP.
- [ ] TikTok ≤ 29 MB.
- [ ] Versão nova `_vN` em `entrega/` e em `H:\Downloads\Edicoes_Claude`.
