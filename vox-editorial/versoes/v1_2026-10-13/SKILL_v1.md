---
name: vox-editorial
description: Formato de edição "Vox editorial" do Felipe para vídeos verticais feitos com o Kit_Edicao_Vox_v2 — papel cinza, fotos de arquivo impressas em P&B com fita, recortes P&B sobre blocos de cor forte, fotos escuras com grão, a fala como tipografia em serifa palavra por palavra integrada a cada cena, apresentador colorido e final com celular (Seguir → Seguindo). Use quando o Felipe pedir para editar um vídeo nesse modelo, "no formato Vox editorial", "igual ao Lula PIX MEI v2" ou "como o vídeo de exemplo do papel cinza".
---

# Formato Vox editorial

Modelo aprovado pelo Felipe em 13/10/2026 (vídeo **LulaPixMei_v2**, 2:14, 29 cenas), já com os dois ajustes que ele pediu depois: **apresentador colorido** e **cores mais fortes**. Os dois ajustes já estão nos componentes desta pasta.

O estilo veio do vídeo de referência `H:\Downloads\ssstwitter.com_1791640485302.mp4` (16,8 s, sem apresentador).

Antes de planejar, abra as duas imagens desta pasta:
- `referencia_exemplo.jpg`: quadros-chave do vídeo de referência.
- `referencia_formato.jpg`: o formato aplicado, com as cores e o apresentador certos.

Esta skill complementa o kit e não o substitui. O pipeline base (corte, beats, render, mix, entrega), as regras de checagem e as armadilhas estão em `H:\Edição Claude\Kit_Edicao_Vox_v2\CLAUDE.md`, e as preferências do Felipe estão na memória do projeto. Leia os dois.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca do formato (legenda nova, fundos, impressões, recortes de jornal, régua, mapa antigo, blocos de cor, carimbo, traços à mão, apresentador). É a 1ª parte do `scenes.js`. |
| `cenas_exemplo.js` | as 29 cenas do vídeo do Lula: modelo de composição, ritmo e sincronia. Copie ideias, não a composição inteira. |
| `legenda.css` | CSS da legenda, da barra e do grão para o `render/index.html`. |
| `preparar_formato.py` | prepara um projeto novo: fontes Sitka, CSS, componentes e o pipeline melhorado. |
| `prep_prints.py` | transforma as fotos de arquivo em impressões P&B com retícula (`print_<nome>.jpg`). |
| `montar.py` | junta as partes em `render/scenes.js` e confere sintaxe, palavras-âncora e sequência de beats. |
| `previas.py` | gera folhas de prévias por cena (respeita o `lead` de cada cena). |

Rode todos os scripts com o Python do kit: `H:\Edição Claude\Kit_Edicao_Vox_v2\.venv\Scripts\python.exe`.

## O que define o formato (não negociar)
1. **Fundo:** papel cinza médio com fibra (`t_papel`), grão de filme e vinheta leve. Uma cena inteira em papel colorido (`paperBg(r, {cor: K.laranja})`) só como destaque raro.
2. **Cor forte em blocos de papel liso:** `K.laranja`, `K.ciano`, `K.amarelo`, `K.verde`, `K.vermelho`, `K.rosa`, `K.azul` atrás dos recortes, em colunas de dados, faixas e trapézios. Uma cor por lado/entidade (ex.: patrão laranja × funcionário ciano). **Nada de neon, brilho (glow), degradê colorido ou etiquetas coloridas repetindo a fala.** Foi isso que o Felipe chamou de "slop".
3. **Pessoa real citada:** use as fotos de arquivo que o Felipe mandou como impressão P&B com retícula, borda de papel, fita lilás e leve rotação, caindo na tela no nome. Uma seta de laço desenhada à mão aponta para a legenda, que fica ao lado como rótulo. **Nunca recortar a pessoa nem pôr brilho** (o Felipe achou "muito ruim"). Nunca gerar rosto de pessoa real por IA.
4. **Objetos e metáforas:** recortes P&B de foto antiga (com retícula) que sobem de baixo, sobre um bloco de cor forte ou direto no papel.
5. **Clima e tensão:** foto escura cinematográfica com grão (P&B), empurrão lento, legenda `glow`. Troque de foto na palavra exata, com 2 ou 3 fotos por cena quando a fala muda.
6. **A legenda é a tipografia do vídeo:** a fala aparece em serifa (Sitka) palavra por palavra, em blocos curtos. As palavras de ligação ficam pequenas numa linha em cima e as palavras-chave grandes, em itálico, embaixo. Cada cena define onde e como a legenda aparece (`S.cap`). Não existe outra legenda.
7. **Apresentador colorido** (`pres4`): corte seco, legenda `glow` no peito (y≈1460), nunca texto nos olhos. Poucas aparições (frases de opinião ou pergunta) e o final.
8. **Dados e manchetes:** só reais e conferidos.
   - Manchete: recorte de jornal com fita e marca-texto amarelo nas palavras ditas.
   - Número: fonte e ano em letra pequena (etiqueta preta).
   - Número errado da fala não vai para a tela.
9. **Final:** rosto do apresentador por ~0,5 s. Depois o papel sobe com a mão segurando o celular (perfil + botão **Seguir vermelho**). No "seguir", o botão vira "Seguindo ✓", com anel do toque, corações desenhados e "+1".
10. **Som:** sons táteis padrão do kit (papel, obturador, lápis/marcador, teclas de máquina, carimbo, moeda). Rode o `mix.py` sem `SOM_ESTILO=cinema` e sem trilha, salvo se o Felipe pedir.

## Recursos visuais: o que usar para cada tipo de fala
| a fala é sobre… | recurso (componentes) |
|---|---|
| uma pessoa ("Lula anuncia", "disse ele") | `printPhoto` + `dropIn` + `loopArrow`; legenda `title` ao lado da foto (`x`, `rot` ≈ −4) |
| prazo, data, "faltam N dias", "ano que vem" | régua do tempo `ruler` + número grande em `serifText`/`typeIn` (cursor piscando) |
| manchete, declaração, citação | `clipping` com o texto **real** e `mk()` na palavra dita; foto impressa ao lado; legenda `tag` |
| pesquisa, comparação, série histórica | colunas `pblock` de cor forte proporcionais (sem exagerar), valores em serifa escura, fonte em `tagL` |
| definição ou valor ("fatura até R$ 81 mil") | recorte do objeto + bloco (trapézio) que sobe; a legenda muda para `dark` e pousa no bloco |
| algo que se espalha pelo país | `oldMap` + manchas cinza crescendo (círculos com filtro `feTurbulence`, ver V20 do exemplo) |
| "em alguns lugares" | `oldMap` + pinos vermelhos que aparecem um a um |
| acusação, crise, clima | `plateBW` (foto escura) + legenda `glow`; troca de foto na palavra |
| lista de desejos ou de itens | foto escura + lista em serifa com vistos desenhados à mão |
| perdão, pago, aprovado | `inkStamp` + `stampIn` (carimbo de tinta) |
| negação ("sem devolver") | símbolo desenhado (`arcArrow`) + X vermelho riscado (`scribble`) |
| crescimento | seta em zigue-zague desenhada subindo + bloco de cor |
| dívida, pilha de papel, carga | recorte P&B (papelada, homem carregando pilha) + "a conta" caindo |
| final ("basta seguir esse perfil") | celular com perfil, Seguir → Seguindo (V29 do exemplo) |

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
   - Faça o plano de cenas: tabela cena | beats | fala | recurso | imagens | cor | legenda (`S.cap`).
6. **Imagens novas** (prompts abaixo):
   - Recortes: `tools/adesivos.py hf/g_*.png`.
   - Fotos escuras e texturas: `tools/fundo_camadas.py placa hf/q_x.png q_x` (e `t_papel`, `t_pergaminho`).
   - Fotos de arquivo: `python <esta pasta>/prep_prints.py <nome> fotos/a.jpg:0.5 fotos/b.jpg:0.6:1`. O número depois do primeiro ":" é o centro horizontal da pessoa (0 a 1); o depois do segundo ":" é a proporção do recorte (largura/altura, padrão 0,75; use 1 quando a pessoa abre os braços). O script roda o `make_assets.py` sozinho.
   - Nomes: `g_*` para recortes, `q_*` para fotos escuras, `print_*` para fotos de arquivo. Nunca use o nome de um asset de outra versão.
   - As texturas `t_papel` e `t_pergaminho` podem ser copiadas de `projetos/lula_pix_mei/render/assets/` em vez de geradas.
7. **Cenas:**
   - Escreva em `work/xx_b.js`, `xx_c.js`… (`xx_a.js` já é a biblioteca).
   - Comente cada cena com `// Vn — "fala"`.
   - `python <esta pasta>/montar.py <nome> xx` deve dar sintaxe ok, palavras ok e beats ok.
8. **Prévias:** `python <esta pasta>/previas.py <nome>`, abra `out/pv/cenas_*.jpg` e corrija. Confira em tamanho maior os quadros com texto pequeno (`render.py preview t1 t2 …`).
9. **Render e áudio:**
   - `render.py events` → `render_par.py 5` → `mix.py` → `tools/qa_sheets.py` (olhe todas as folhas).
   - Entrega: `entregar.py NOME_vN --nvenc --destino "H:\Downloads"`.
   - **Versões:** nunca sobrescreva. Cada ajuste é `_v2`, `_v3`… Guarde também o master e o mix anteriores (`out/master_vN.mp4`, `audio/final_mix_vN.wav`).
10. **Mensagem final** (português, curta):
    - o que saiu e onde
    - o que mudou
    - créditos gastos
    - avisos de checagem: o que a fala diz, o valor certo e a fonte
    - **Fontes:** com os links

## Legenda: `S.cap` em cada cena
| modo | onde usar | posição típica |
|---|---|---|
| `title` | cenas no papel, com objeto ou foto no centro; palavra por palavra (ligação pequena em cima, chave em itálico) | y 300–460; ao lado da foto impressa: `x` ≈ 600, `rot` −4 |
| `tag` | mapas, recortes de jornal, quadro já cheio (etiqueta preta, bloco inteiro de uma vez) | y 1480–1640 |
| `glow` | fotos escuras e apresentador (itálico branco com sombra, bloco inteiro) | foto: y≈1500 · apresentador: y≈1460 |
| `dark` | sobre bloco de cor (serifa escura), quando a fala "pousa" no bloco | dentro do bloco |
| `none` | só se a cena for tipográfica por si | — |

- O modo pode mudar dentro da cena: `S.cap = lt >= t ? {mode:'dark', y:1395} : {mode:'title', y:360}`.
- Os blocos têm até ~22 letras, não terminam em palavra de ligação e não separam número da unidade ("5 mil reais"). Isso já vem pronto no `componentes.js`.
- O apresentador nunca recebe legenda `title` sobre o rosto.

## Regras de composição (aprendidas no vídeo do Lula)
- **Quadro 0 completo.** A 1ª cena já começa montada (ex.: régua com o número). Nenhuma cena começa vazia.
- **Troca dentro da cena:** use camadas `S.A`/`S.B` (`display` alternado na palavra) e faça a camada que sai subir (`translateY`) em 0,3 s.
- **Palavra-âncora no fim do beat:** quando a palavra é a última do beat (ex.: "agora", "desrespeito"), dê `lead: -.2` a `-.3` na cena seguinte e acenda o texto ~0,3 s antes. Sem isso ele aparece por menos de 0,3 s.
- **Um controlador de transform por elemento por quadro** (`tx`, `live`, `dropIn`, `riseIn`, `stampIn`). Quem só muda de texto ou opacidade não precisa de `tx`, porque `serifText` e `tagL` já nascem centralizados.
- **Recortes:** use `cut(r, 'g_x', cx, cy, w, {plain: true, shadow: false})` (sem borda de adesivo).
- **Margens:** 40 px. A legenda `title` não divide a tela com outro texto grande no topo.
- **Repetição:** máximo de 2 usos da mesma foto de fundo e 2 a 3 usos do mesmo recurso no vídeo.
- **Mapa:** `oldMap(r, {lon:-53, lat:-15, z:2.25, cy:900})` enquadra o Brasil. Os rótulos de oceano ficam no mar (ex.: lon −41,5 / lat −26).
- **Régua:** a marca grande cai em x=540 quando `set(px)` usa px = passo×grande×m − 740 (passo 24/grande 5 → 220; grande 10 → −20 ou 220).
- **Colunas de dados:** proporcionais ao valor real. Rótulos com as casas decimais certas ("13,75%"). Se a série cai no fim, controle você a visibilidade dos rótulos.
- **Cor de bloco trocada no meio da cena:** troque `backgroundColor` e mantenha a textura neutra (`ptex('#efece4', 30)`). Textura da mesma cor escurece o tom.
- **Transições:** quase tudo em `cut`. A mudança vem do próprio movimento: subir, cair, deslizar.

## Componentes (`componentes.js`)
- **Paleta:** `K.ink` (texto claro), `K.dark`, `K.laranja`, `K.ciano`, `K.amarelo`, `K.verde`, `K.vermelho`, `K.rosa`, `K.azul`. Fonte: `SERIF = 'Sitka'`.
- **Fundos:**
  - `paperBg(r, {cor, b})`
  - `plateBW(r, 'q_x', {k, b, cor:true})` + `.push(lt, dur, {ds, dy})`
  - `oldMap(r, {lon, lat, z, cy})` + `M.br`, `M.lab(txt, lon, lat)`, `M.place(e)`, `M.pt(lon, lat)`
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
  - `dropIn(e, lt, at, {dy, r0, out})` (cai girando)
  - `riseIn(e, lt, at, {dy, d, out})` (sobe de baixo)
- **Traço à mão (num `svgAbs`):**
  - `scribble(svg, d, {w, c})` com `.draw(q)`
  - `loopArrow(svg, x, y, s, rot)`
  - `roughRing(svg, cx, cy, rx, ry)`
  - `arcArrow(cx, cy, r, a0, a1)`
  - `sparkleD(x, y, r)`
  - `HEART`
- **Tempo:** `ruler(p, y, {step, big})` + `.set(px)`.
- **Apresentador:** `pres4(beats, {lead, capY, build(L,S,c), update(S,c), pb:true para P&B})`.
- **Do kit:** `cut`, `hero`, `live`, `tx`, `ez`, `E`, `sv`, `svgAbs`, `el`, `box`, `cue`, `stampIn`, `mapView`, `MK`/`mkSet`, `camStill`/`camPush(k)`.

## Prompts-base para imagens (Higgsfield)
- **Parâmetros:** `gpt_image_2_5`, `variant: flare`, `quality: high`, `resolution: 2k`. Para recortes, acrescente `background: transparent`. Custa 2,75 créditos por imagem.
- **Limites:** lotes de até 4, no máximo 8 imagens gerando ao mesmo tempo.
- **Registro:** anote os gastos em `hf/gastos.txt` e baixe com `curl.exe`.

**Recorte P&B (1:1, 3:4 ou 9:16):**
> Isolated cutout on a fully transparent background: <objeto/cena, vista, tudo visível com margem>. Vintage black-and-white photograph, high contrast, fine film grain and subtle halftone print texture, documentary editorial collage style, crisp edges. No text, no logos, no watermark, no color.

Para pessoas geradas, acrescente: "seen from behind / face not visible" (só anônimas).

**Foto escura 9:16:**
> <cena, ângulo>. Black-and-white cinematic documentary photograph, dramatic low-key lighting, deep shadows, fine film grain, moody editorial look, vertical composition with the subject in the center. No text, no logos, no watermark, no color.

**Texturas (uma vez; ou copie do `lula_pix_mei`):**
- `t_papel`: "Flat top-down texture of plain medium gray construction paper, fine fibers and subtle grain, evenly lit, uniform, seamless. No objects, no text."
- `t_pergaminho`: "Flat top-down texture of aged cream parchment paper like an antique map sheet, subtle stains and fibers, evenly lit, nothing printed on it."

## Checklist antes de entregar
- [ ] Apresentador colorido, cores fortes, nenhum neon ou brilho, nenhuma etiqueta repetindo a fala.
- [ ] Fotos de arquivo só como impressão com fita, no momento em que a pessoa é citada.
- [ ] Legenda em todas as cenas e nunca sobre os olhos.
- [ ] Toda manchete e todo dado são reais e têm fonte e ano.
- [ ] Zero silêncios ≥ 0,15 s.
- [ ] Som em −14 LUFS e pico −2 dBTP.
- [ ] TikTok ≤ 29 MB.
- [ ] Versão nova `_vN` em `entrega/` e em `H:\Downloads`.
