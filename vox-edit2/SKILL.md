---
name: vox-edit2
description: Formato "vox-edit2", vertical 9:16, com o Kit_Edicao_Vox_v2. Junta o vox editorial premium do Felipe (papel, fotos reais impressas com fita, blocos de cor em dose, dados com fonte, apresentador colorido, celular no final) com a receita do projeto After Effects "High heels" da EarnEdits (lido do .aep em 31/10/2026). Tudo anda a 13 quadros por segundo como colagem em stop-motion; a câmera é uma série de nulls com movimentos sobrepostos que atravessam o corte; os mundos alternam lousa escura com grunge, pergaminho, papel cinza e quadriculado; fotos e recortes com sombra longa, um assunto por vez no centro; a fala vira a legenda serifada sobre tiras de papel; tiras de papel amassado se abrem, com cortinas, chamas, moldura com fita, poeira e riscos. Todo MAPA é de satélite no estilo @rotageografica (câmera geográfica voando com borrão, estados e municípios do IBGE acendendo em cores fortes, pinos, rota amarela se desenhando, foto com haste). Trilha que segue o roteiro (faixas CC0 sem crédito do banco do kit, uma por bloco de clima) por baixo dos sons táteis. Motor foco (03/11/2026) — um assunto por vez, grande e no centro; a legenda é o único texto, FIXA e baixa (não anda nem borra); a câmera aproxima com zoom e deixa a panorâmica para a troca de cena; cada efeito acontece sozinho e no centro. A foto parada ganha vida própria (carro com as rodas girando e quicando, estrada e paisagem correndo sem fim, pessoa caminhando por fórmula e virando a cabeça, porta de enrolar subindo, recortes e palavras que nascem como papel rasgado em 5 quadros) com acabamento retrô (borda desfocada, retícula, cintilação). Use quando o Felipe pedir "vox-edit2", "vox edit 2", "vox com o projeto do salto alto", "vox stop-motion" ou "vox colagem 13 fps", com gravação ou áudio da ElevenLabs + HeyGen.
---

# Formato vox-edit2 (vox editorial premium × projeto "High heels")

Pedido do Felipe em 31/10/2026: "criar uma skill chamada vox-edit2 que é a junção da vox editorial com esse projeto"
(`C:\Users\USER\Downloads\high-heels-from-the-battlefield-to-fashion.rar`, projeto After Effects da EarnEdits, 40 s, 1080×1920).

**Antes de planejar, abra nesta pasta:**
- `exemplo_teste.jpg`: o que estes componentes produzem (demo de 38 s com o trecho B19–B40 do ChinaCapitalismo).
- `ANALISE_REFERENCIA.md`: o projeto cena a cena, a câmera, as curvas, os efeitos, o som e o que virou componente.
- `cenas_exemplo.js`: as 7 cenas da demo, comentadas.

Esta skill complementa a **vox-editorial** (precisa estar instalada ao lado) e o `CLAUDE.md` do kit. Corte, beats, checagem,
render, mix e entrega seguem o kit. As regras fixas do Felipe valem (memória):
- fala nunca muda;
- dado na tela só conferido, com fonte e ano;
- IA nunca faz rosto de pessoa real;
- pessoa citada = foto ou vídeo REAL;
- perfil REAL no CTA;
- versão nova `_vN`;
- entrega = tiktok ≤ 29 MB + MASTER.

Python do kit: `<kit>\.venv\Scripts\python.exe`. Em outro PC, `VOX_KIT` aponta para a pasta do kit.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `preparar_edit2.py` | prepara o projeto. Roda o `preparar_formato.py` da vox-editorial, copia as 3 bibliotecas, as texturas, as sequências e o perfil, e escreve o `etapas.json` (montar + trilha). `--so-clipes` só recontar os clipes em `render/clips/` |
| `componentes_edit2.js` | a biblioteca do formato (vira `work/<xx>_c.js`) |
| `premium_vox.js` | os auxiliares do vox premium (vira `work/<xx>_b.js`): `mesa`, `entra`, `pousa`, `revela`, `bloco`, `materia`, `foto`/`pilha`, `rotulo`, `fonte`, `barraV`, `grade100`, `presBola`/`presMetade` + `JAN`, `celular`, `linhaDat`, `numero` |
| `montar.py` / `previas.py` | montam `render/scenes.js` (contam `e2Cena`) e geram folhas por cena (`--tempos 1.2,3.4`) |
| `trecho_de_projeto.py` | cria um projeto de teste com um trecho de um projeto já cortado (áudio, palavras, beats, apresentador, rosto e quadros renumerados): `trecho_de_projeto.py <origem> <destino> <t0> <t1> [prefixo]` |
| `<kit>/ferramentas/trilhas.py` + `trilha_roteiro.py` | **trilha padrão (01/11/2026):** banco de 213 faixas CC0 do FreePD em `<kit>/biblioteca/trilhas_cc0` (uso comercial SEM crédito), busca por significado com CLAP (`.venv_ia`). `trilhas.py clima tensao --min 60` / `busca "texto"` / `plano <proj> "B01:tensao,B16:misterio,..."` escreve `trilha_roteiro.json`; `trilha_roteiro.py` (o fechar chama) monta um bloco por clima com troca no corte, respiros, impactos graves, ducking e −14 LUFS |
| `trilha_edit2.py` | (só com `--soul`) cama soul lo-fi sintetizada (75 BPM, piano elétrico, baixo, bateria com swing, vinil) a −17 dB da voz, por baixo dos sons táteis; −14 LUFS |
| `mapa_satelite.py` + `mapa_satelite.js` | **mapas (01/11/2026)**: o .py baixa satélite Sentinel-2, limites do IBGE e lugares (OSM) → `render/sat_<nome>.js`; o .js é a cena `e2Mapa` (o preparar junta ao `_c.js`). Seção "Mapas" abaixo |
| `cenas_mapa_exemplo.js` | as 2 cenas de mapa da demo (teste_mapa_sat), comentadas |
| `cenas_foco_exemplo.js` | **as 5 cenas do A/B APROVADO "motor foco" (teste_foco, 03/11/2026): o modelo de toda cena nova** (assunto no centro, legenda fixa, tira do kit no lugar da legenda, papel nascendo, troca no lugar, número como assunto) |
| `cenas_vida_exemplo.js` | as 5 cenas do A/B aprovado "vida na foto parada" (teste_vida): porta, carro com rodas, esteira, boneco andando, adesivos que nascem |
| `medir_pecas.py` | `carro <png>` → `rodas` e `base` do vdCarro; `boneco <png>` → `pescoco` e `quadril` do vdBoneco; grava `_pecas.jpg` para conferir |
| `texturas/` | fundos `e2_*`, acentos (moldura, polaroides, manchas de tinta), `kit/` (Collage Kit, 14 peças) e `ferve/` (grunge em stop-motion). Origem e licença em `CREDITOS.txt` |

## O que o formato junta
**Do vox editorial premium** (as correções do Felipe de 13 a 15/10):
- papel como mesa;
- foto real impressa com fita, caindo na palavra;
- blocos de cor em dose (azul, amarelo, laranja, vermelho), sem neon, brilho, raios, formas nem ícones grandes;
- dados reais com fonte em letra pequena;
- apresentador colorido e limpo;
- sons táteis;
- final com o celular e o perfil real.

**Do projeto "High heels"**:
- **Collage Kit, grão e poeira a 13 quadros por segundo** (Posterize Time 13 + Noise 4): é o que dá a cara de colagem feita à mão. A CÂMERA e os itens andam a 30 q/s desde o motor golpe (abaixo).
- **Câmera em série de nulls** (o projeto) → substituída em 02/11/2026 pelo **motor golpe**, abaixo. O `e2Rig` antigo (nulls em deriva lenta) fica só para reeditar vídeo antigo.

**Do motor golpe (02/11/2026, teste A/B aprovado pelo Felipe: "B aprovado, aplica")**. O Felipe achava os motions ruins e mandou duas referências: `C:\Users\USER\Downloads\earn.edits_De6bR-1OtGX.mp4` (cientista, 30 q/s com blur) e `earn.edits_DYURMKHoayc.mp4` (Buffett, 16 q/s stop-motion). A medição mostrou que a curva não era o problema; o problema era **força, ritmo e transição**:

| | vox-edit2 antes | referências | motor golpe (B aprovado) |
|---|---|---|---|
| plano médio | 2,6–3,7 s | 0,8–0,9 s | 0,96 s |
| câmera parada | 31–48% | 10–25% | 5% |
| velocidade da câmera | 2,0–2,4 px/q | ~11 px/q | 4,4 px/q |
| metade do caminho do movimento | — | 36% (cientista) · 45% (Buffett) | 36% |

- **Plano novo a cada ~0,9 s, sem cortar:** a câmera viaja pelo mundo da cena em CHICOTES de ~0,8 s, de um assunto para o próximo, no tempo da palavra. A mesma mesa vira 4–8 enquadramentos.
- **Curva do chicote (medida):** arranca já a ~45% da velocidade de pico, chega ao pico em 20% do tempo e desliza até zero (`E2C.golpe`). Nada de `E.out5` na câmera.
- **Blur direcional** só no pico do chicote (acima de ~10 px/quadro), some no deslize.
- **Entradas com mola** (`curva: 'mola'`, d .5–.6): passa ~9% do ponto e assenta.
- **Tranco** de câmera quando algo pousa (`golpes: [[t, 6–10]]`) e câmera na mão sempre viva.
- **A troca de cena é um chicote:** a cena sai em chicote que continua depois do corte (último plano em `d − .22..−.3`) e a seguinte CHEGA no mesmo sentido (`planos[0]` fora do quadro, do lado de onde a câmera vem).
- Projeto do teste: `projetos/teste_motion` (ChinaCapitalismo 28,4–39 s, cenas S08 e S09 em `work/e2_e.js`); vídeos `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMotion\TesteMotion_AB_lado_a_lado_v1.mp4`, `_A_atual_v1`, `_B_motor_novo_v1`.
**Do motor foco (03/11/2026, teste A/B aprovado pelo Felipe: "B aprovado, aplica")**. O Felipe: "a velocidade parece atrapalhar o acompanhamento... o dinamismo precisa ser perfeito para que os olhos possam acompanhar, muitos efeitos se perdem na tela e não são focalizados". A medição (BukeleHaiti_v1 contra a referência da cientista) mostrou que a câmera NÃO era mais rápida (mesmo pico, mesmos chicotes por minuto); o olho é que perseguia o conteúdo:

| no trecho S09–S13 do BukeleHaiti | antes | motor foco (B aprovado) | referência |
|---|---|---|---|
| saltos do olho por minuto | 90 | 35 | 45 |
| foco no miolo da tela | 90% | 99% | 95% |
| quadros com panorâmica > 8 px/q | 20% | 7% | 10% |
| parte do movimento que é zoom | 11% | 23% | 30% |
| 2+ textos na tela ao mesmo tempo | 76% | 0% | ~0% |
| letras se mexendo (> 3 px/q) | 38% | 0% | — |

- **Um assunto por vez, grande e no centro** (caixa 1000×760; a câmera o põe um pouco acima do meio).
- **A legenda é o ÚNICO texto e não se mexe:** fica fora do mundo (não anda com a câmera e não borra no chicote), logo abaixo do assunto. Antes ela ficava no alto, dentro do mundo, e as tiras repetiam a fala.
- **Os efeitos continuam, mas um de cada vez e no centro:** a tira do Collage Kit abre NO LUGAR da legenda; o recorte nasce em papel por cima do assunto, que escurece; a foto seguinte pousa no lugar da anterior; o número grande é o assunto (o mundo escurece e a legenda some enquanto ele está).
- **A câmera aproxima, não arrasta:** chega já no assunto (de perto, .5 s; o quadro 0 nunca é papel vazio), no máximo um movimento por frase (≥ ~1 s entre eles), zoom para dar ênfase e deriva contínua; a panorâmica fica para a troca de cena. O motor golpe continua por baixo (a curva do chicote e o blur só no pico), mas o "plano a cada 0,9 s" acabou.
- Teste: `projetos/teste_foco` (cenas em `cenas_foco_exemplo.js`); vídeos `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteFoco\TesteFoco_AB_lado_a_lado_v2.mp4`, `_A_atual_v1`, `_B_foco_v3` (a v3 é a final, já sem clipe travado; aprovada com as das outras skills: "Aprovados").
- Réguas: `<kit>/ferramentas/medir_leitura.py` (olho e câmera) e `<kit>/ferramentas/texto_na_tela.py <proj>` (texto), com as metas impressas.

- **Mundos de fundo:** lousa escura com grunge (o mais usado), pergaminho, papel branco, papel cinza, quadriculado, papel pardo e papel preto. Por cima de tudo, poeira e riscos em *screen*.
- **Recortes e impressões que deslizam de fora da tela** em 1–2 s, quase em velocidade constante, com **sombra longa** (Shadow Studio), muitas vezes em par (um da esquerda, outro da direita).
- **A fala como tipografia dentro da cena.** Serifa semibold (Tiempos/Caslon no projeto; aqui a Sitka da vox) mais uma pesada para a palavra-bomba. Cada frase entra no tempo dela:
  - `desliza`: as letras sobem de dentro de uma máscara, o Range Offset −100→100 do projeto;
  - `digita`;
  - `cai`: queda com bounce de inércia;
  - `brilho`: faixa de luz passando;
  - `escala`.

  Na saída a frase `esfarela` (BCC Scatterize), some ou sobe.
- **Collage Kit:** papel amassado que se abre em stop-motion. São tiras de cor (os blocos da vox), cortinas (a abertura do projeto), chamas e nuvens.
- **Acentos:** moldura com fita, polaroides, manchas de tinta, linha do tempo de anos com barra crescendo (a cena "1630s" do projeto), luz de janela suave em *multiply*.
- **Som:** o projeto exporta só voz + uma faixa soul lo-fi. Aqui ficam os sons táteis da vox + uma trilha que SEGUE O ROTEIRO (faixas CC0 por bloco de clima). A cama soul fixa foi reprovada pelo Felipe no vídeo da China (01/11): "o som não trazia conexão com o que eu falava".

## As regras (não negociar)
1. **O olho acompanha — motor foco em TODA cena nova** (A/B aprovado em 03/11/2026; modelo: `cenas_foco_exemplo.js`):
   - **um assunto por vez, grande e no centro:** `e2Assuntos(M, S, c, [[src, t, o], ...])` (caixa 1000×760 em 540, 860). O seguinte
     TROCA NO MESMO LUGAR (pousa) ou NASCE EM PAPEL no centro (`papel: true`) por cima do anterior, que escurece. Nada entra deslizando
     da borda e nunca há duas fotos disputando o olho;
   - **câmera:** `golpes: c => e2Foco(c, [[0, x, y, z], [t, x, y, z, d], ...])` (x, y = centro do assunto). Chegada curta de perto (o
     quadro 0 já tem o assunto), no máximo UM movimento por frase e ≥ ~1 s entre eles, ZOOM para dar ênfase (mesmo x, y com z maior),
     deriva contínua; a panorâmica fica para a troca de cena. Sem `golpes` de tranco;
   - **os efeitos são os mesmos, mas um de cada vez e no centro** (tira do kit no lugar da legenda, papel nascendo, foto pousando,
     número como assunto, vida na foto parada), com tempo para serem vistos;
   - **medir no fim** as cenas de motion (`--de/--ate` fora do apresentador): `ferramentas/medir_leitura.py <master> --de T0 --ate T1`
     (saltos do olho ≤ 45/min, foco no miolo ≥ 92%, panorâmica > 8 px/q ≤ 10%, zoom ≥ 20% do movimento) e
     `ferramentas/texto_na_tela.py <proj>` (2+ textos ≤ 5%, letra ≥ 44 px, letras andando ≤ 3%). Do `medir_motion.py` só vale câmera
     parada ≤ 20% (o "plano médio" virou informação).
2. **Um texto por vez, e ele não se mexe** (regra do Felipe, 31/10, completada pelo motor foco): a legenda é o ÚNICO texto:
   `e2LegFixa(M, S, c, beats, {chave, oculta})`, FIXA fora do mundo (não anda com a câmera, não borra no chicote), em y 1420, logo
   abaixo do assunto (o Felipe já tinha pedido a legenda embaixo no PobreComeDolar: "a legenda está muito na parte de cima, vai acabar
   se perdendo"). A frase inteira aparece no começo do beat e as palavras acendem quando ditas; chave em itálico vermelho.
   - **Frase-chave:** pinta a tira (`cor: 'lar'|'amar'|'azul'`) ou abre a tira do Collage Kit NO LUGAR da legenda (`kit: 'tira_2'|'tira_4'`).
     Nunca uma segunda tira ou adesivo repetindo a fala.
   - **Número ou palavra gigante:** é o assunto daquele instante (`e2Numero`, ou `e2Texto` no centro) e a legenda se esconde
     (`oculta: [[t0, t1]]`).
   - Letra ≥ ~44 px; nada passa por cima enquanto se lê.
3. **A fala é a legenda:** a fala exata vem da `e2LegFixa`; `S.cap` fica `none`. `e2Legenda`/`e2Fala` (tipografia dentro do mundo)
   ficam só para reeditar vídeo de antes de 03/11.
4. **Pessoa citada = foto ou vídeo REAL** (Commons, Agência Brasil, arquivo de telejornal com crédito), impressa (`e2Item` com `borda`) ou
   na moldura/polaroide (`e2Moldura`, aceita `clip:` andando a 13 q/s). Nunca recorte de pessoa com brilho; rosto real ou marca por IA só com OK do Felipe (pergunte antes).
5. **Cor em dose:** as tiras do Collage Kit são os blocos da vox. Use 4: amarela `tira_4`, azul `tira_3`, laranja `tira_2`, e o vermelho
   no risco à mão e nas chaves. Evite a verde (`tira_7`) e a rosa fora de contexto. Sem neon, brilho ou degradê colorido. O Deep Glow
   do projeto NÃO entra (regra do Felipe).
6. **Mundo escuro × claro:** alterne. Lousa escura para clima, morte e virada; papel cinza, pergaminho e quadriculado para lista, documento
   e dado. Nunca o mesmo fundo em mais de 2 cenas seguidas.
7. **Apresentador:** 2–4 s, nunca seguidas, só olhando a câmera. Formas da vox premium: círculo `presBola`, dividida `presMetade`, cheia
   `pres4`. Nas cenas dele use `limpo: true` (tira poeira, grão e vinheta).
8. **Dados e manchetes reais**, com marca-texto ou digitação na palavra dita. Número errado da fala não vai para a tela.
9. **Foto parada tem vida própria** (A/B "vida na foto parada", aprovado em 02/11/2026): o que a fala põe em ação ANDA dentro da foto, não só a câmera em volta dela.
   - carro anda com as rodas girando (`vdCarro`);
   - pessoa caminha (`vdBoneco`);
   - estrada e paisagem correm (`vdEsteira`);
   - porta se abre (`vdPorta`);
   - recorte, impressão ou palavra-chave NASCE como papel (`vdAdesivo`).

   Ponha pelo menos um desses por cena de motion quando a fala tiver ação, objeto ou lugar, sempre como O assunto daquele momento (no centro, um de cada vez). As imagens são geradas JÁ PENSANDO na animação (seção abaixo).
10. **Vídeo real roda normal e nunca trava** (Felipe, 03/11/2026: "esse efeito de travar o vídeo é ruim, mantém o vídeo rodando normal").
    Todo trecho de vídeo REAL anda a 30 q/s (`rate` 1). Ele nunca fica preso no último quadro e nunca vira câmera lenta por quadro
    repetido. Clipe mais curto que o tempo na tela tem três saídas:
    - troque o assunto NO LUGAR antes de ele acabar (`e2Assuntos`);
    - comece o clipe junto com a cena;
    - use outro plano da fonte.

    Esticar o clipe com `rate` < 1 não vale. O `fechar` roda `ferramentas/clipe_parado.py` e não entrega com TRAVADO ou LENTO.

## Os componentes (`componentes_edit2.js`; tempos aceitam número ou `c => t`, locais à cena)
**Motor foco (03/11/2026) — use em toda cena nova** (`cenas_foco_exemplo.js` mostra as 5 cenas aprovadas):
- **`e2Foco(c, [[t, x, y, z, d], ...], {dy (110), chega (200), sai (360), deriva (.032), mao (6), golpes})`** → vai no `golpes:` da `e2Cena`.
  - `x, y` = centro do ASSUNTO no mundo; a câmera fica `dy` abaixo (o assunto aparece acima do meio e a legenda cabe embaixo).
  - O 1º foco é a chegada (de perto, .5 s); cada seguinte é UM movimento que começa .2 s antes de `t` (`d` padrão .7).
  - Zoom de ênfase = mesmo `x, y` com `z` maior (1,08 → 1,2–1,4); "ir a um detalhe" = `x, y` do detalhe com `z` 1,3–1,4.
  - A saída é um chicote curto que atravessa o corte (`sai: 0` = sai sem andar de lado).
- **`e2Assuntos(M, S, c, [[src, t, o], ...], {x, y, w})`**: o assunto e as trocas.
  - `src` = `'clip:nome'` (caixa 1000×760 com cover; `o.pos` escolhe o recorte, ex. `'40% 50%'`) ou um asset de imagem (mesma caixa).
  - O 1º já está na tela; cada seguinte entra no tempo `t` NO MESMO LUGAR: pousa (escala `s0` 1,08 → 1 em `d` .22 s, giro `r0`) e o
    anterior some .3 s depois. Com `papel: true` (só imagem) nasce em papel (vdAdesivo, `w` 700) por cima do anterior, que escurece.
  - `o`: `{pos, rot, r0, s0, d, filtro, clip: {t0, de, rate}, papel, w, sombra}`.
- **`e2LegFixa(M, S, c, lista, {chave: ['palavra'], oculta: [[t0, t1]], y (1420), s (74)})`**: a legenda fixa.
  - `lista` = beats da cena: `'B17'` ou o par `['B18', {cor: 'lar'|'amar'|'azul'|'papel', kit: 'tira_2'|'tira_4', rot}]`.
  - `kit`: a tira do Collage Kit abre no lugar da legenda (~.3 s, começa .24 s antes do beat, som crinkle). A tira azul do kit é estreita
    demais para a legenda; use `cor: 'azul'` (tira de papel azul, texto creme, chave em amarelo).
- **`e2Numero(M, S, c, '~1,5 milhão', 'fonte · ano', t0, t1, {y (840), s (150), veu (.6)})`**: número grande FIXO no centro do assunto,
  com a fonte pequena embaixo; o mundo escurece por trás. Esconda a legenda no mesmo tempo (`oculta`).
- **`E2ASS`** / **`E2F`**: a caixa do assunto e as cores e medidas da legenda.

**Os de antes** (continuam valendo dentro do motor foco):
- **`e2Cena(beats, {fundo, fundoOp, golpes, rig, fps, janela, limpo, poeira, cap, tr, lead, build(M, S, c), update(S, c, cam)})`**: a cena.
  - `golpes: c => ({planos: [[t, {x, y, z, r}, d]], golpes: [[t, amp]], deriva, mao})` liga o motor golpe (padrão): 30 q/s,
    blur direcional, fundo com `folga` 2.2. `planos[0]` = pose de antes (fora do quadro); cada plano seguinte é um chicote de `d` s
    (.75–.9; 1.0 para aproximação lenta) que começa em `t`. `x, y` = ponto do mundo no centro da tela, `z` = zoom (1,0 = mundo
    inteiro; 1,3–1,5 = um assunto). `golpes` = tranco [tempo, 6–10 px]. `deriva` (.022) = zoom contínuo; `mao` (5 px) = câmera na mão.
    Exemplo do motor golpe puro (S09 do teste_motion, 02/11, ANTES do motor foco; em cena nova use `golpes: c => e2Foco(c, focos)`):
    ```js
    golpes: c => {
      const t49 = c.w('B19', '1949'), t76 = c.w('B20', '1976'), tm = c.w('B21', 'mao'), tc = c.w('B21', 'cartilha'), ta = c.w('B22', 'ao'), d = c.dur;
      return { planos: [[-1, { x: -300, y: 860, z: 1.6, r: -5 }], [-.12, { x: 340, y: 880, z: 1.45 }, .8], [t76 - .22, { x: 760, y: 880, z: 1.45, r: 1.5 }, .75],
        [t76 + .95, { x: 540, y: 900, z: 1.08, r: 0 }, .8], [tm - .25, { x: 560, y: 820, z: 1.25, r: -1 }, .8], [tm + 1.0, { x: 560, y: 900, z: 1.4, r: 1 }, 1.0],
        [tc - .2, { x: 500, y: 1020, z: 1.04, r: -1 }, .75], [ta - .3, { x: 520, y: 900, z: 1.16, r: .5 }, .9], [d - .22, { x: 540, y: 1900, z: 1.4, r: 3 }, .9]],
        golpes: [[t49 + .15, 6], [t76 + .15, 6], [tm + .4, 10], [tc + .35, 8]] };
    },
    ```
    Confira cada plano: a janela vista é `x ± 540/z`, `y ± 960/z` (com `p` < 1 o item anda menos que a câmera).
  - `fundo`: `'e2_escuro1..4'`, `'e2_escuro_liso'`, `'e2_escuro_riscado'`, `'e2_escuro_luz'`, `'e2_pergaminho'`, `'e2_branco'`, `'e2_cinza'`,
    `'e2_quadriculado'`, `'e2_pardo'`, `'e2_papel_preto'`, `'t_papel'` ou `'ferve:concrete01'` (grunge em stop-motion: `concrete01/02/03/05`,
    `dirt03/04`, `paper01`).
  - `fundoOp`: `{p: .6, folga: 1.45, tom: 'brightness(.9)', cor}`. Panorâmica longa: `p` menor (.2–.4) e `folga` maior (1.6).
  - `fps: 0` = 30 q/s na cena.
  - `janela`: luz de janela, 0–.6.
  - `limpo`: sem sobreposições.
- **`e2Rig(c, {z0, y0, x0, r0, dy, dz, saiZ, saiX, saiR, lado, mov})`**: a câmera ANTIGA (usada quando a cena não tem `golpes`; só para reeditar vídeo de antes de 02/11).
  - O padrão chega de perto (`z0` 1,2), sobe devagar (`dy`), aproxima no meio (`dz`) e empurra na saída (`saiZ`).
  - Para uma cena com viagem (descer até outro objeto, andar até a sala ao lado), passe `mov: c => [[t0, t1, {x, y, z, r}, 'cam'|'lin', volta], ...]`.
    Cada linha é um null: z multiplica, x/y/r somam; `volta: true` = já começa feito e se desfaz (a chegada).
- **`e2Item(M, S, 'print_x' | 'g_x' | 'clip:nome' | elemento, {x, y, w, p, rot, borda, sombra, filtro, pos, entra, sai, ate, vida, clip})`**.
  - `entra: {de: 'esq'|'dir'|'cima'|'baixo'|'frente'|'cai'|'pop', t, d (1,2), dist, curva, r0, s0}`.
  - `sai: {t, para, d}`.
  - `vida`: o `wiggle(.5,15)` das fotos do projeto; `false` = parado.
  - `clip: {t0, de, rate}` + `iw`/`ih`.
- **`e2Moldura(M, S, 'print_x' | 'clip:nome', {tipo: 'moldura' | 'polaroid', x, y, w, pos, ...})`**: a foto dentro da moldura com fita.
- **`e2Texto(M, S, 'texto com *chave*', {...})`**: a frase em 3D com sombra longa.
  - `x, y, s, larg, fonte: 'serif'|'disp', cor, corChave, it`;
  - `anima: 'desliza'|'digita'|'cai'|'brilho'|'escala'|'surge'`, `t`, `d`;
  - `sai: 'esfarela'|'some'|'sobe'`, `tSai`;
  - `sombra: 'suave'|false`, `rot`;
  - `etiqueta: '#f4f1ea'`: tira de papel atrás de cada linha, que entra com a 1ª palavra e sai com o texto. Use sobre mapa de pontos,
    foto ou mapa claro em fundo escuro.
- **`e2Fala(M, S, c, ['B12'], {x, y, s, chave: ['palavra'], linha: 16, ate, sai})`**: a fala do beat inteira, palavra por palavra no tempo
  dela, quebrando em linhas.
- **`e2Legenda(M, S, c, ['B01', 'B02'], {y: 300, s: 74, cor, corChave, chave, etiqueta, linha: 20, p: .25})`**: a fala INTEIRA da cena
  como tipografia em 3D, um bloco por beat que sai logo antes do próximo. É a legenda do formato; com ela, a fala toda fica na tela,
  como na vox. `p` baixo deixa o texto quase fixo enquanto a câmera anda.
- **`e2Kit(M, S, nome, {x, y, w, t, rot, txt, txtOp, fps})`**: peça do Collage Kit que se abre em stop-motion, com texto opcional em cima.
  - `tira_1` rosa, `tira_2` laranja rasgada, `tira_3` azul rasgada, `tira_4` amarela, `tira_5` ciano com dobra, `tira_6` rosa fina,
    `tira_7` verde, `tira_8` círculo marrom;
  - `cortina_1/2` (abertura: uma de cada lado);
  - `fogo_1/2`, `nuvem_1/2`.
- **`e2Anos(M, S, [[1949, t], [1976, t]], {x, y, s, cor, barra})`**: anos que sobem deslizando + barra vermelha crescendo entre eles.
- **`e2Tinta(M, S, 'e2_tinta1|2|3|e2_tinta_borda', {x, y, w, modo, op, inverte})`**: mancha de tinta. Em fundo escuro use `inverte: true, modo: 'screen'`.
- **`e2Caixa(M, S, {x, y, w, h, p, entra})`**: div no mundo para desenhar com os auxiliares da vox (`papel`, `barraV`, `grade100`, `fonte`,
  `rotulo`, `serifText`...) em coordenadas locais.
- **`e2Clip(img, S, nome, {t0, de, rate, n})`**: põe um trecho REAL (`render/clips/<nome>/0001.jpg…`) numa `<img>`.
- **Curvas e expressões do AE:** `aeEase(u, influênciaSaída, influênciaEntrada)`, `E2C.cam` (0/66), `.lin` (17/17), `.suave` (33/33),
  `.entra` (33/100), `.sai` (100/1,7), `.pousa`; do motor golpe, `.golpe` (chicote medido nas refs) e `.mola` (overshoot ~9%).
  `e2Golpes(c, o)` (a câmera), `e2Borra(S, rig, lt)` (blur direcional, chamado sozinho pela `e2Cena`), `aeWiggle(t, freq, amp)`,
  `e2Sombra(k)`, `e2SombraTxt(k)`, `e2Poster(c, fps)`.
- **Sobreposições automáticas** em toda `e2Cena`, direto no `#stage`:
  - poeira e riscos em *screen* pulando a 13 q/s;
  - grão em *overlay*;
  - luz de janela em *multiply*;
  - vinheta.

Sons: `crinkle` na tira abrindo, `paper` no item que desliza, `shutter` na foto, `marker` no risco, `type` na digitação, `cloth` na
câmera que anda, `slam` na palavra-bomba que cai.

## Vida na foto parada (02/11/2026, A/B aprovado: "B aprovado, aplica")
Vem do tutorial de 51 min do projeto After Effects "Lamborghini vs Ferrari" da EarnEdits (`C:\Users\USER\Downloads\Lamborghini vs Ferrari The Insult That Started a Legend - Earnedits.mp4`). O projeto inteiro é "máscaras + expressões" sobre imagens de IA geradas EM PEÇAS.

Teste: `projetos/teste_vida`, com as cenas em `cenas_vida_exemplo.js`. Vídeos em `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteVida\`: `TesteVida_AB_lado_a_lado_v1`, `_A_motor_atual_v1`, `_B_tecnicas_tutorial_v1`. Os bonecos andam a 13 q/s; a câmera continua no motor golpe.

**Imagem gerada para ser animada.** Use o Qwen local com `"recorte": true` (fundo liso → BiRefNet); o tutorial gera no verde e usa Keylight.
- **Carro.** Peça "exact side profile facing right, camera at wheel height, both wheels perfectly round and fully visible, no logos, no badges, no license plate" e rode `medir_pecas.py carro`.
  - A versão envelhecida ou batida sai de uma edição por `ref` do MESMO carro ("same position, same size and same wheels") e entra como `troca` (corte casado).
- **Pessoa.** Peça "full body, exact side profile facing right, both hands inside his trouser pockets, standing upright with legs straight and together" e rode `medir_pecas.py boneco`.
  - Com as mãos no bolso, os braços não precisam de peça.
  - Com as pernas juntas de perfil, a mesma peça serve de perna da frente e de trás (a de trás mais escura).
  - Pessoa gerada só anônima (regra 4 do kit).
- **Fachada com porta** (de enrolar, de garagem, de loja), frontal e simétrica. Meça o retângulo da porta em px da imagem e confira na prévia.
- **Paisagem para esteira:** lateral, sem estrada. Corte a faixa de baixo e espelhe; imagem + espelho emendam sem costura.
- NÃO use `make_assets.py --trim` nessas imagens: as coordenadas das peças são da imagem inteira.

**Componentes** (em `componentes_edit2.js`; `window.VD_B = false` volta ao antigo para um novo A/B):
- **`vdAdesivo(M, S, 'asset' | null, {x, y, w, p, rot, t, fino, sombra, filtro, txt, txtOp: {s, fundo, cor, fonte, it}})`**: o item que nasce como papel.
  - Nasce em 5 quadros (polígono torto crescendo). A borda de papel rasgada (filtro SVG `vdBorda`: alfa dilatado + ruído) aparece 1 quadro depois.
  - Com `txt`, vira palavra recortada em papel: `fundo` '#f4f1ea' ou '#ffd23a', e `<i style="color:#b3160b">` para a chave.
  - Serve para foto REAL impressa (`fino: true`), recorte PNG e palavra-bomba. Use no lugar do `pop`.
- **`vdCarro(M, S, 'asset', {x, y, w, p, rodas, anda: lt => px, esteira: lt => px, troca: [[t, 'asset']], quique, motor, sombra, opacidade})`**: o carro de uma foto.
  - `anda`: o carro anda na tela.
  - `esteira`: o chão corre e o carro fica parado. Use a MESMA função do `vdEsteira`.
  - As rodas giram pela distância; o corpo inclina e quica pela aceleração.
  - `tvCarroY(car, w, yChao)` (no exemplo) põe a roda no chão.
- **`vdEsteira(M, S, 'asset' | null, {x, y, w, h, p, dist: lt => px, fator, tom, estrada: true, itens: {src, w, gap, y}})`**: faixa infinita (Motion Tile + loopOut).
  - `estrada: true` desenha o asfalto com a faixa tracejada.
  - `itens` são postes passando; o `y` deles é relativo ao topo da faixa.
  - Paisagem atrás com `fator` .2–.3 (paralaxe).
- **`vdBoneco(M, S, 'asset', {x, y, w, p, pescoco, quadril, anda: lt => 0..1, vel (1.7), dobra (21), cabeca: lt => graus, corpo: lt => graus})`**: a pessoa de uma foto.
  - Caminhada: `Math.sin(tempo × vel) × dobra` nas pernas e `cos` no tronco.
  - `cabeca` negativa olha para cima.
  - Para andar pelo mundo, calcule a posição no `update` da cena e chame `vdMove(lay, x, y)`.
- **`vdPorta(M, S, 'fachada', {x, y, w, p, porta: [x0, y0, x1, y1], t, d, dentro: 'interior'})`**: a porta recortada sobe aos trancos e mostra o interior.
  - O carro que sai é uma camada criada DEPOIS (por cima), com `opacidade` 0 até a porta abrir.
- **`vdMove(lay, x, y)`**: move uma camada.
  - ATENÇÃO: no `e2Aplica`, `lay.x` é só o pivô; mudar `lay.x` não move nada.
  - Posições que andam vão no `update` da cena ou em `S.pre`. A `e2Cena` chama `S.pre` antes de aplicar o quadro.
- **Acabamento retrô** em toda `e2Cena`, direto no `#stage`: borda desfocada por máscara invertida (centro nítido), retícula em overlay e cintilação de exposição a 13 q/s.
  - `e2Cena({retro: false})` desliga; `limpo: true` (apresentador) também desliga.
- O que o tutorial tem e NÃO entrou:
  - glow (regra do Felipe);
  - distorção de lente (sem jeito barato no navegador);
  - braços balançando.

**Tradução fala → vida:**
- "sair/chegar/andar/dirigir" → vdCarro com `anda`.
- "durante anos/o caminho/segue" → vdEsteira, ou vdBoneco andando sobre a curva.
- "abrir/revelar/por trás" → vdPorta.
- Palavras de uma lista ("envelhece, deprecia, mais barato") → uma vdAdesivo por palavra, no tempo dela.
- "alguns modelos/exemplos" → fotos REAIS em vdAdesivo `fino`.
- "olhar para/perceber" → `cabeca` do vdBoneco.

## Mapas: satélite no estilo @rotageografica (pedido do Felipe, 01/11/2026)
Referência: `C:\Users\USER\Downloads\rotageografica_DcpMRVrOKMU.mp4` (Rota das Emoções, 71 s). **Toda cena com lugar, região, estado,
cidade, rota, distância ou "olhe o mapa" usa `e2Mapa`**; os mapas de papel antigos (`mapaPapel`, `mapView`, `pontosPais`) só se o
Felipe pedir. O que a referência faz e o componente que replica:

| na referência | aqui |
|---|---|
| imagem de satélite real, mar azul-marinho escuro, verde saturado | Sentinel-2 cloudless 2016 em camadas de zoom (4 largo, 6 Brasil, região, detalhe, z12 em cada município) + `grade` |
| câmera que voa (mergulho Brasil → região → cidade), com borrão forte no movimento rápido, e nunca para | `cam0` + `voo: [[t0, t1, câmera, curva]]` (curva `cam` = sai rápido e freia); borrão por 2–6 amostras dentro do quadro; `deriva` (aproxima .045 de zoom por s) |
| inclinação 3D em alguns trechos | `tilt` (graus, 15–28) e `rot` na câmera |
| estados/municípios com limite real acendendo UM A UM, cor forte (vermelho → rosa → roxo → azul → ciano → verde → amarelo → laranja), borda branca, entram crescendo e mais claros | `SM.seq([...], t0, passo .06–.1)`, `SM.uf`, `SM.mun` (`cor`, `op`; paleta `SATC.arco`, estados `SATC.uf`) |
| sigla grande no meio do estado, digitada | `SM.uf('MA', {sigla: true, s: 96})` |
| pino vermelho que cai com onda + nome branco digitado | `SM.pino('Pecém', {rotulo: true, lado: 'cima'})` (`esq`/`dir`/`baixo`), `SM.rotulo` |
| rota amarela se desenhando por cima | `SM.linha('nome', {t, d})` (linha do `--linha`; `--estrada` segue a estrada real) |
| foto real em cartão arredondado com haste saindo do ponto | `SM.foto('print_x', 'lugar', {dx, dy, w, tSai})` |
| número/título grande branco com brilho quente, letras fechando o espaço | `SM.titulo('600 *km*', {t, y, s, tSai})` (`\|` quebra linha; `*itálico*`) |
| um plano contínuo entre frases | `continua: true` na cena seguinte (começa onde a anterior parou: corte invisível) |

Regras do mapa:
- **É a exceção da regra 5** (cor em dose, sem brilho): no mapa vale a paleta forte e o brilho leve da referência, porque o Felipe pediu
  esse estilo. Fora do mapa, a regra 5 continua.
- **30 q/s, sem poeira** (`e2Mapa` já faz): a 13 q/s o voo trava. Legenda (motor foco, 03/11/2026): `e2LegFixa(M, S, c, beats, {chave})`
  (funciona dentro da `e2Mapa`: fixa, não voa com o satélite), por baixo; o `SM.titulo` é a palavra gigante do momento — esconda a
  legenda enquanto ele está na tela (`oculta: [[t, tSai]]`), um texto por vez; nada sobre a legenda. (Cena de mapa antiga: `e2Legenda`
  y 1520–1560, cor creme, `corChave: SATC.rota`.)
- **Um evento a cada ~0,5–1 s**: estado acende → pino cai → nome digita → foto sobe → câmera anda. Palavra de lugar = o lugar acende NA palavra.
  Frase sem lugar dentro da cena de mapa (ex.: "três refinarias gigantescas") também ganha evento: pinos caindo, foto, título.
- **Limites reais do IBGE e lugares reais.** Traçado sem dado oficial (ferrovia planejada, rota aproximada) é "esquemático": diga no aviso.
- Enquadre com `SM.enquadra(['MA', 'CE'], {larg, alt, dy, tilt, rot})`; com `tilt` a parte de baixo cresce, então use `larg`/`alt`
  menores (640/760). Pino e rótulo a ≥ 40 px da borda. Rótulo ≥ 44 px.
- **Crédito obrigatório na lista de fontes** (CC BY 4.0): "Sentinel-2 cloudless 2016 by EOX IT Services GmbH (contains modified
  Copernicus Sentinel data 2016)"; limites IBGE; lugares © OpenStreetMap. Só a camada 2016 é CC BY (as de 2018+ são não comerciais).

Preparar (na raiz do kit; ~1 min na 1ª vez, depois cache em `biblioteca/sat_cache`):
```
.venv\Scripts\python.exe ~/.claude/skills/vox-edit2/mapa_satelite.py <projeto> ne --uf NE --mun "Bacabeira/MA; Ipojuca/PE"
    --pontos "Pecém=-38.83,-3.545; Salgueiro/PE" --linha "ferrovia: Eliseu Martins/PI > Salgueiro/PE > Pecém" [--estrada] [--foco "Pecém"]
```
`--uf NE` / `BR` / `"MA,PI"`; `Município/UF` = sede pelo OSM (confira a longitude impressa); `nome=lon,lat` para ponto exato; `--foco`
dá camada z12 a um ponto (municípios já ganham). Vários mapas no mesmo vídeo: um `<nome>` por região.

```js
e2Mapa(['B19', 'B20', 'B21', 'B22'], {
  mapa: 'ne', cam0: { lon: -51, lat: -13.5, zoom: 4.75 },          // quadro 0 já voando
  voo: (c, SM) => [[-.1, 2.6, SM.enquadra(NE9, { larg: 980, alt: 1250, dy: 40 }), 'cam'],
    [c.b('B22') - .15, c.b('B22') + 1.3, SM.enquadra(['Eliseu Martins', 'Pecém', 'Suape'], { larg: 640, alt: 760, tilt: 22, rot: -4 }), 'cam']],
  build(M, S, c, SM) {
    SM.titulo('2006', { t: .02, y: 330, s: 190, tSai: c.b('B22') - .25 });
    SM.apaga(SM.seq(NE9, c.w('B21', 'nordeste') - .06, .065), c.b('B22') + .1);
    SM.linha('transnordestina', { t: c.w('B22', 'ferrovia'), d: 1.15 });
    SM.pino('Pecém', { t: c.w('B22', 'ferrovia') + 1, rotulo: true });
    SM.foto('print_transn', 'Salgueiro', { t: c.w('B22', 'transn') + .15, dx: -150, dy: -360, w: 260 });
    e2Legenda(M, S, c, ['B19', 'B20', 'B21', 'B22'], { y: 1520, s: 66, cor: '#fbf7ee', corChave: SATC.rota });
  },
});
```
Teste: `projetos/teste_mapa_sat` (prefixo `ms`, trecho B19–B27 do audio1022, 10,4 s), demo `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteMapaSatelite\TesteMapaSatelite_v3_tiktok.mp4` (APROVADA pelo Felipe em 01/11/2026: é o padrão).
Render de 313 quadros em 16 s (12 processos).

Armadilhas do mapa (vistas no teste):
- **Inclinação cobre tudo:** sem o `filter` na pilha do mapa, o `rotateX` passava na frente dos pinos, da foto e da legenda
  (`overflow:hidden` e `isolation` não bastam no Chromium). Já está no `mapa_satelite.js`; não tire.
- **Borda preta no voo largo:** a camada de satélite precisa cobrir a tela inteira na câmera mais aberta (a z4 cobre a América do Sul e o Atlântico).
- **Foto com haste** cobre pino vizinho ou a legenda: escolha `dx`/`dy` olhando a prévia; tire a foto (`tSai`) antes do próximo lugar.
- **A câmera que anda para o próximo estado** corta o anterior: com 3 estados ditos em 1,5 s, enquadre os três e só derive.
- **A prévia não mostra o borrão** (ele vem das amostras dentro do quadro e aparece no vídeo). Confira o voo no vídeo, não só na prévia.
- `_c.js` montado antes de atualizar o `mapa_satelite.js` fica velho: rode o `preparar_edit2.py` (ou concatene de novo) depois de mudar a biblioteca.

## O roteiro decide a cena (tradução fala → cena)
| na fala | cena | demo |
|---|---|---|
| datas, período, "de X a Y" | lousa + cortinas + tira amarela + `e2Anos` | "De 1949 a 1976" |
| pessoa citada | foto/vídeo REAL como assunto no centro (`e2Assuntos`; nasce em papel quando entra sobre outra imagem); o nome vem na legenda | Mao 1949 (arquivo); Chérizier no "controle" (teste_foco) |
| objeto-símbolo | impressão com borda que pousa NO LUGAR do assunto anterior | o Livro Vermelho; o carro queimado no "promovendo" (teste_foco) |
| lista de ações | um assunto por item trocando no lugar; o item dito na legenda, na tira de cor do kit | "aboliu… estatizou… perseguiu…" |
| desastre, virada negativa | lousa que ferve + vídeo REAL P&B + palavra-bomba que cai + chamas de papel; esfarela na saída | "desastre sem precedentes" |
| número de vítimas, contagem | o número é o assunto (`e2Numero` com a fonte) sobre a imagem REAL escurecida; a legenda some | ~1,5 milhão (teste_foco) |
| morte, luto | papel preto + vídeo REAL na moldura | o luto de 1976 |
| fonte de dado | folha da instituição deslizando + digitação na palavra | Banco Mundial, "realidade brutal" |
| porcentagem, comparação | quadriculado em duas salas: grade de 100 na tira amarela → câmera anda → colunas | 88% · 166 × 475 |
| opinião, conclusão | apresentador (círculo) + impressão REAL embaixo + frase final | "igualdade na fome" |
| lugar, estado, cidade, região, "olhe o mapa" | `e2Mapa`: satélite voando até lá, o lugar acende NA palavra com sigla/nome, pino caindo | "Nordeste"; "no Maranhão, no Ceará e em Pernambuco" (teste_mapa_sat) |
| rota, ferrovia, distância, "X km" | `e2Mapa`: linha amarela se desenhando + pinos nas pontas + título grande do número | Transnordestina |
| fecho, siga | celular com o perfil REAL (`celular` da premium) | — |

## Passo a passo
1. **Projeto:** `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs; fluxo HeyGen: memória `fluxo-audio-primeiro`).
   Corte e beats como no kit.
2. **Formato:** `<kit>\.venv\Scripts\python.exe ~/.claude/skills/vox-edit2/preparar_edit2.py <nome> --prefixo xx [--sem-trilha]`.
3. **Pesquisa:** cada fato com fonte. O que estiver errado na fala não vai para a tela (avise o Felipe).
4. **Plano de cenas:**
   - a tabela `cena | beats | fala | mundo | itens (de onde entram) | texto em 3D | peça do kit | câmera | som`;
   - 5–8 s por cena, com um evento a cada 1–2 s dentro dela;
   - alterne mundo escuro e claro.
5. **Material:**
   - fotos reais com `prep_prints.py` (vox-editorial) ou direto em `render/assets/print_*.jpg`;
   - trechos REAIS em `render/clips/<nome>/` (`baixar_trechos.py` + `clipes.py` do edit-founded), depois `preparar_edit2.py <nome> --so-clipes`;
   - `make_assets.py`;
   - mapas: `mapa_satelite.py <nome> <mapa> --uf ... --mun ... --pontos ... --linha ...` (seção Mapas).
6. **Cenas** em `work/xx_d.js`… (copie de `cenas_foco_exemplo.js`), comentário `// Sn — "fala"`.
7. **Montar:** `montar.py <nome> xx` (sintaxe, palavras, beats).
8. **Prévias:** `previas.py <nome> --pontos 3` e abra `out/pv/cenas_*.jpg`. Confira as regras 1 e 2 (um assunto no centro, um texto, efeitos um de cada vez) e o quadro 0 de cada cena.
9. **Trilha pelo roteiro** (antes do fechar):
   - divida o vídeo em 8–14 blocos de clima no corte de cena (gancho/tensão, mistério, tragédia, virada, épico, investigação, conclusão), um bloco a cada ~15–25 s;
   - `<kit>\.venv_ia\Scripts\python.exe <kit>/ferramentas/trilhas.py plano <nome> "B01:tensao,B08:misterio,..."` (clima de `CLIMAS` ou frase em inglês); ouça/troque faixas com `busca`; nunca a mesma faixa em dois blocos;
   - no `trilha_roteiro.json`: `impactos` nas 4–6 palavras mais fortes (`B27:desastre`), `respiros` de .3–.45 s antes de 2–4 delas, `cama` −10 (−15 ficou baixo demais na China), `offset`/`ganho` por bloco;
   - o banco não tem música chinesa/étnica real (o clima `oriental` acha pouco); FreePD é CC0, não precisa crédito, mas cite "FreePD (CC0)" no arquivo de fontes.
10. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"` (o etapas.json já aponta o montar e a trilha desta skill).
11. **Conferir:**
    - `ferramentas/medir_leitura.py <master> --de T0 --ate T1` nas cenas de motion e `ferramentas/texto_na_tela.py <nome>` (metas na regra 1);
    - `out/qa_emendas_*.jpg` e todas as `out/qa_*.jpg`;
    - fundo cobrindo a tela em toda panorâmica;
    - nenhum texto cortado na borda.
12. **Mensagem final** (português, curta):
    - arquivos;
    - avisos de checagem com fonte;
    - **Fontes:** matérias, fotos (autor/licença) e trechos (canal, data).

## Teste (31/10/2026)
`projetos/teste_edit2` (prefixo `e2`).
- **Corte:** trecho B19–B40 (31,41–69,66 s) do corte do audio1031 (ChinaCapitalismo, voz do Felipe + HeyGen P3), com áudio, timing,
  quadros e rosto renumerados (`trecho_de_projeto.py audio1031 teste_edit2 31.41 69.66`).
- **Material:** 7 cenas, 38,25 s, 0 crédito; material REAL do audio1031 e do audio1031_cinema.
- **Resultado:** `fechar` em 1m20s (render de 1.148 quadros em 53 s), −14 LUFS, checa_fala sem palavra perdida, qa_lint 0.
- **Entrega:** `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteVoxEdit2\TesteVoxEdit2_demo38s_v2_tiktok.mp4` + `_MASTER.mp4` (a v1 tinha 3,5 s só de tira no começo e a 2ª sala do
  quadriculado sem fundo).

## Reeditar um vídeo vox que já existe (ChinaCapitalismo, 01/11/2026)
A reedição completa do ChinaCapitalismo é o projeto `audio1031_edit2`.
- **Números:** 3:29, 45 cenas, 11 peças do HeyGen, `ChinaCapitalismo_voxedit2_v1`.
- **Preparação:** `trecho_de_projeto.py audio1031 audio1031_edit2 0 209.433` + `preparar_edit2.py`, com o mesmo corte, os mesmos beats e os mesmos dados conferidos.
- **Bibliotecas:** `e2_b.js` foi trocado pelas ORIGINAIS do projeto (ch_b..ch_e: mapas, balança, fatura, muro de tarifa, celular…). Em `e2_d.js`
  ficaram os auxiliares que estavam antes das cenas (constantes, `mapaPapel`, `pontosPais`, `silhueta`, `peso`).
- **Cada cena** vira `e2Cena` com um mundo de fundo; a composição original vai para dentro de `G = e2Caixa(M, S, {p: 1}).el`:
  - troque `r`/`S.m` por `G`;
  - apague o `paperBg` e o `S.m.cam` (a câmera agora é o `e2Rig`);
  - ponha `e2Legenda` no lugar do `S.cap`.
- **Alternância de mundos:** lousa, pergaminho, cinza, quadriculado, pardo, branco, papel preto. Fotos viram `e2Item`/`e2Moldura`
  deslizando, com trechos REAIS de arquivo onde havia foto parada. O apresentador cheio fica `pres4`; dividido e círculo ficam `e2Cena` com `limpo`.
- **Elementos que nascem invisíveis** (`serifText`, `silhueta`, `rotulo`) precisavam do `entra(...)` do update original. Sem ele, o "1" e o "2" gigantes sumiram.
- **Ordem das camadas = ordem de criação.** Crie a tira (`e2Kit`) ANTES da `caixa`, senão ela cobre a folha, a grade ou o celular.
- **Mapa claro com texto creme em cima** fica ilegível. Use a legenda escura ou `etiqueta`. Sobre mapa de pontos, sempre `etiqueta`.
- **Olhar do apresentador nas janelas cheias:** o P9 olhava para baixo nos primeiros 0,3 s. A correção foi `pres4(['B100'], {...PT, lead: -.32})`.
  Confira as primeiras quadros de cada peça.

## Armadilhas (vistas no teste)
- **Contêiner com z-index isola o `mix-blend-mode`:** a poeira em *screen* virou imagem escura e apagou o vídeo inteiro (fundo 161 → 46).
  As sobreposições ficam soltas no `#stage`, cada uma com o próprio z-index.
- **A luz de janela forte parece grade de cela.** Use `janela` ≤ .5 (a biblioteca ainda divide por 2), só em papel claro.
- **Fundo acaba na panorâmica:** a câmera que anda 1.000 px passa da borda. Use `fundoOp {p: .2, folga: 1.6}` (o fundo anda 20% da câmera).
- **Anos e palavras grandes na borda:** a caixa do `e2Anos` tem 980 px. Com `s` 150 os anos ficam em 250 e 730, e a câmera de chegada (`z0` 1,2) corta o que passar disso.
- **Quadro 0 vazio:** item que entra na palavra deixa o começo da cena só com o fundo. Ponha um item com `entra.t` −.3 ou uma tira com `t` −.6.
- **Duas frases no mesmo lugar:** a anterior precisa de `sai`/`tSai` antes da próxima entrar (ex.: "30 anos…" sobe quando entra "igualdade na fome").
- **As tiras ocupam ~85% da largura do quadro da peça:** `w` 1.000–1.100 para uma tira de tela inteira. Texto em cima com `s` 64–72.
- **`presBola`** recebe o nó da cena (`M.el.parentNode`) para ficar por cima do mundo. Cena do apresentador com `limpo: true`.
- **Clipes:** depois de copiar trechos para `render/clips/`, rode `preparar_edit2.py <nome> --so-clipes` (senão o trecho para no quadro 90).
- **Clipe que trava ou dá "travadinha":**
  - Na fonte, um plano costuma ter só 2–4 s: o deslocados do BukeleHaiti tinha 3 s, e o próximo plano já era outra cena. No motor
    foco o assunto fica mais tempo na tela, então confira a duração de cada clipe contra o tempo até a próxima troca.
  - A conta do quadro do `e2Clip` precisava de `+ 1e-6`: sem isso, a cena que começa alinhada ao quadro repetia e pulava quadros
    (25, 25, 27, 27…). Foi corrigido em 03/11; projeto antigo com o `e2Clip` velho pode ter essa travadinha.

## Checklist antes de entregar
- [ ] Motor foco em todas as cenas de motion: `e2Assuntos` (um assunto no centro, troca no lugar), `e2Foco` (≤ 1 movimento por frase, zoom
      para ênfase), `e2LegFixa` (o único texto, fixo e baixo), efeitos um de cada vez; medir_leitura e texto_na_tela dentro das metas;
      Collage Kit a 13 q/s;
      quadro 0 de cada cena já com o assunto na tela; do `medir_motion.py` só vale câmera parada ≤ 20%.
- [ ] Vídeo real rodando normal: `ferramentas/clipe_parado.py <proj>` com 0 TRAVADO e 0 LENTO (o `fechar` já bloqueia a entrega).
- [ ] Vida na foto parada: o que a fala põe em ação anda dentro da foto (vdCarro/vdBoneco/vdEsteira/vdPorta); recortes e palavras-chave
      nascem como papel (vdAdesivo); peças medidas com `medir_pecas.py` e conferidas no `_pecas.jpg`; retrô ligado fora do apresentador.
- [ ] Texto legível (≥ 44 px, parado ≥ 1 s), uma frase por vez, chave em itálico na cor de destaque; nada cortado na borda.
- [ ] Pessoa citada = foto/vídeo REAL; nenhum rosto por IA; sem brilho/neon/raios/ícones grandes.
- [ ] Tiras de cor só da paleta (amarelo, azul, laranja; vermelho no risco). Mapas: satélite `e2Mapa` (paleta forte só ali), limites IBGE, crédito Sentinel-2/EOX na lista de fontes.
- [ ] Mundos alternando escuro e claro; nenhum fundo em mais de 2 cenas seguidas; fundo cobrindo a tela nas panorâmicas.
- [ ] Dados reais com fonte e ano; manchete real.
- [ ] Apresentador 2–4 s, olhando a câmera, `limpo: true`.
- [ ] Som: sons táteis + trilha CC0 por bloco do roteiro (cama −10, respiros, impactos), −14 LUFS, checa_fala sem palavra perdida.
- [ ] Final com o perfil REAL. Versão `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
