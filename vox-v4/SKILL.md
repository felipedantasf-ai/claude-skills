---
name: vox-v4
description: Formato de edição dos vídeos da V4 Company (anúncios na Meta), verticais 9:16, feitos com o Kit_Edicao_Vox_v2, com tudo que importa dentro da safe zone da Meta (y 420–1500). É o Vox editorial premium com a identidade do brand book 2026 da V4. A mesa é papel VERMELHO V4 (#E50914), os neutros são branco, #F2F2F2, grafite e vinho #280000, e o amarelo #FFDD00 entra só como detalhe. A fala vai em IBM Plex Sans branca, números e títulos de impacto em Morganite, a reverberação do símbolo é o grafismo-assinatura e o logo é só o SVG oficial. O vídeo usa fotos e logos reais, dados com fonte e movimento de câmera. Use quando o pedido for "vídeo da V4", "skill da V4", "formato V4", "edita no padrão da V4", ou quando chegar gravação ou áudio para a V4 Company.
---

# Formato vox-v4

Criado em 28/10/2026 a pedido do Felipe. A skill é derivada da `vox-editorial` (o "Vox premium") e é exclusiva para vídeos da **V4 Company**. Toda a identidade vem do brand book oficial: https://v4-company-brand-book-2026.vercel.app/

**Antes de planejar:**
- abra `brand_v4.md`, o resumo do brand book com os hex, a proporção, o contraste aprovado, o logo, os grafismos, o tom e as proibições;
- abra `referencia_v4.jpg`, a folha de prévias do projeto de teste, e `referencia_safezone.jpg`, a mesma folha com as faixas da Meta;
- abra `safezone_meta.jpg`: os vídeos da V4 são **anúncios na Meta** e TUDO que importa fica no quadrado central (seção **Safe zone da Meta**).

Esta skill complementa a **vox-editorial** e o **CLAUDE.md do kit**, não os substitui. A vox-editorial precisa estar instalada ao lado (`~/.claude/skills/vox-editorial`). Dela, esta skill usa:
- `componentes.js`, que vira o `<xx>_a.js`;
- `preparar_formato.py`, `montar.py`, `previas.py` e `prep_prints.py`.

O fluxo de corte, olhar, sincronia e entrega é o mesmo da **vox-fernando**. Os scripts `olhar.py` e `sincronia.py` vêm dela e estão nesta pasta; funcionam em qualquer projeto. No PC do Felipe, leia também as memórias `vox-video-pipeline`, `perfil-instagram-cta`, `presenter-olhar-camera` e `vox-editorial-style`.

**O kit (`<kit>`)** é a pasta do Kit_Edicao_Vox_v2:
- no PC do Felipe, `H:\Edição Claude\Kit_Edicao_Vox_v2`;
- em outro PC, a pasta da variável de ambiente `VOX_KIT`.

Rode tudo na raiz do kit, com o Python do kit: `<kit>\.venv\Scripts\python.exe`.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `brand_v4.md` | O brand book da V4 resumido, com os links das seções e das imagens das regras. |
| `componentes_v4.js` | Biblioteca do formato, que vira o `work/<xx>_b.js`. É a biblioteca da vox-fernando com a paleta e as fontes da V4, mais `gradV4`, `titulo`, `rotV4`, `reverb`, `logoV4`, `vidro`, `presQuad` e `gradeV4`. As funções e assinaturas são as mesmas da vox-fernando: cenas de lá funcionam aqui trocando só as cores. |
| `preparar_v4.py` | Prepara um projeto novo: formato, fontes da marca, legenda em Plex, biblioteca, logo oficial embutido, assets, ferramentas e `etapas.json`. |
| `cenas_exemplo.js` | As cenas do projeto de teste (`projetos/teste_v4`). Copie padrões daqui. |
| `referencia_v4.jpg` | A folha de prévias aprovada do teste. |
| `safezone_meta.jpg`, `referencia_safezone.jpg` | A safe zone da Meta (criativo dinâmico) que o Felipe mandou em 29/10/2026 e o teste com as faixas por cima. |
| `olhar.py`, `sincronia.py` | Conferência do olhar do apresentador e da sincronia boca × áudio (vêm da vox-fernando; aqui para a skill não depender dela). |
| `safezone.py` | Monta o projeto e gera a folha de prévias com as faixas da Meta pintadas (`out/pv/safezone_*.jpg`); lista os quadros com algo nas faixas cinzas. |
| `fonts/` | IBM Plex Sans + itálico (variáveis, Google Fonts, OFL), Morganite SemiBold e Bold (servidas pelo próprio brand book) e Fjalla One (alternativa oficial à Morganite). |
| `logo/` | `LogoV4Branca.svg` e `LogoV4Vermelha.svg`, os ORIGINAIS do `v4-logos.zip` do brand book. Não edite estes arquivos. |
| `t_v4.jpg` | Textura da mesa: a fibra do papel sobre `#E50914`, com luz quente fraca no alto e o degradê da marca para `#650E0F` embaixo. |
| `modelo/` | O pipeline de referência (`build_edl.py` zerado, `mix.py`, `entregar.py`, `engine.js`, texturas, `tools/` e `fotos/`), sem perfil de ninguém. |

## Instalação em outro PC (time do Felipe)
1. Rode o `INSTALAR.bat` do pacote `vox-v4_instalador.zip`. Ele copia `vox-v4` e `vox-editorial` para `%USERPROFILE%\.claude\skills\` e grava a variável `VOX_KIT` com a pasta do kit. As duas skills são obrigatórias.
2. O PC precisa do **Kit_Edicao_Vox_v2 na versão atual do Felipe**, instalado pelo `instalar_windows.bat` do kit (Python, FFmpeg, Node, Chromium e modelos), com `pipeline.py preparar|fechar`.
3. As fontes da V4 vêm dentro da skill (`fonts/`); o `preparar_v4.py` copia para cada projeto. Não é preciso instalar nada no Windows.
4. Fora do PC do Felipe não existem as memórias nem os projetos `teste_v4`/`v4acai`: as regras que importam estão nesta página e no `brand_v4.md`. A pasta de entrega é a que a pessoa escolher (`--destino`).
5. **Projeto já cortado:** o `preparar_v4.py` recusa rodar de novo (ele reescreveria o `build_edl.py` e o corte se perderia). Para atualizar só a biblioteca da V4 (correções, safe zone), use `preparar_v4.py <projeto> --prefixo xx --so-biblioteca`.

## Safe zone da Meta (não negociar)
Os vídeos da V4 rodam como **anúncio na Meta** (criativo dinâmico), que recorta o 9:16 em 4:5 e 1:1. Pedido do Felipe, 29/10/2026: "se não vai cortar informação quando rodar na meta". No quadro 1080×1920:
| faixa (y) | o que acontece |
|---|---|
| 0–286 e 1636–1920 (vermelho) | a interface do app cobre |
| 286–420 e 1500–1636 (cinza) | some no recorte 1:1 (o 4:5 vai de 286 a 1636) |
| **420–1500 (preto)** | o quadrado central 1080×1080: **a única faixa que aparece em todos os formatos** |

- **Legenda, números, logos, selos, rótulos, fontes (`FTAG`), rosto do apresentador e botão de CTA ficam entre y 420 e 1500.** Fora disso só fundo, textura, mapa e grafismo (reverberação, degradê).
- Já vem certo em `componentes_v4.js` (constante `SAFE`): `CT` y 505 (a legenda ocupa ≈425–580), `CTAG` 470, `CTAGB` 1450, `CGLOW` 1430, `PT.capY` 1430 (tela cheia) e o rosto da tela dividida em y ≈1190 (`presMetade` com `yt` 230).
- **Desenhe as cenas para a faixa de conteúdo y ≈600–1480** (abaixo da legenda). A câmera `mesa().cam(s, 540, py)` põe `py` em y 960, o centro do quadrado: use `py` 960–1020 e `s` ≤ 1,04, senão o conteúdo sobe para a legenda.
- Tela dividida: em cima só 420–960 aparece no 1:1 (conteúdo em ≈480–900); embaixo o rosto em ≈1190 e a legenda em 1430.
- Círculo/quadro do apresentador (`presBola`/`presQuad`): `cy − d/2 ≥ 600` (abaixo da legenda) e `cy + d/2 ≤ 1500`.
- A barra de progresso (y 1876) fica na faixa vermelha: é enfeite, pode sumir no anúncio.
- Confira SEMPRE com `safezone.py <projeto>` (no lugar do `previas.py`) e nas folhas de QA.

## A identidade (não negociar)
1. **Mesa vermelha.**
   - O fundo de quase todas as cenas é `paperBg(r)`: papel vermelho V4.
   - Nas viradas, use o degradê da marca, `gradV4(r, 'vinho' | 'fogo' | 'tunel' | 'noite')`, ou tela VINHO com `fundo(r, VINHO)`.
   - Papel e cartão são brancos.
   - **O vermelho domina** (o brand book dá ~58% da composição a ele); os neutros estruturam.
2. **Cores:**
   - `V4`/`VERMELHO` `#E50914`, `VINHO`/`PRETO` `#280000`, `GRAFITE`/`TINTA` `#312D2D`, `BRANCO` `#FFFFFF`, `CINZA_C` `#F2F2F2`;
   - `AMARELO` `#FFDD00` **só como detalhe ou ativação**: um elemento por cena no máximo (selo, título-chave, pino, marca-texto, barra de progresso);
   - `VERDE_CTA` `#0E8420` **só no botão de ação** (o Seguir do celular), nunca em dado ou objeto;
   - nada de laranja, azul ou outro verde. Os tons de apoio `V4_LUZ` `#FF481F` e `V4_E` `#650E0F` só em degradê e sombra.
   - **Contraste do brand book** (tabela completa em `brand_v4.md`):
     - sobre o vermelho, texto pequeno só BRANCO; grande pode ser branco, `#F2F2F2`, amarelo ou vinho;
     - sobre o vinho: branco, `#F2F2F2` e amarelo; vermelho só grande;
     - sobre o branco: grafite, vinho e vermelho;
     - nunca amarelo ou `#F2F2F2` sobre branco, e nunca grafite sobre vermelho.
   - Bloco atrás de foto: VINHO (padrão).
   - Rótulo: `rotV4`, com tarja vinho e letra branca, ou tarja branca com letra vinho.
   - Selo: branco com texto vinho, vinho com texto branco, ou amarelo com texto vinho (`selo()` escolhe a cor do texto).
   - Mapas: Brasil BRANCO sobre o vermelho, destaque VINHO, pino amarelo ou vermelho, rótulo em tarja vinho.
3. **Tipografia:**
   - **fala e textos:** IBM Plex Sans (`SERIF` vira `'Plex'` no preparar);
   - **números e títulos de impacto:** Morganite (`dado()`, `selo()`, `titulo()`), pontuais, no máximo **1 título** por cena;
   - Morganite nunca em texto corrido; sem Morganite, use Fjalla One;
   - fonte de dado (`FTAG`): Plex pequena em etiqueta `#F2F2F2`.
4. **Legenda (`S.cap`):**
   - sobre o vermelho ou o vinho: `CT`, Plex BRANCA com a palavra-chave em itálico;
   - sobre papel branco de tela cheia: `CT_ESCURA` (vinho);
   - sobre foto ou apresentador: `CGLOW`;
   - mapas e quadros cheios: `CTAG`/`CTAGB` (tarja vinho).
   - as posições já respeitam a safe zone da Meta: não use mais y 330/1660/1740 de outras skills.
   - O kit mostra as palavras ainda não ditas em baixa opacidade: em cima do vermelho elas parecem rosadas, e é assim mesmo.
5. **Grafismo-assinatura: a REVERBERAÇÃO** (`reverb()`): o contorno do símbolo repetido em camadas concêntricas, com sombra leve em cada uma, como o brand book pede.
   - `'normal'`: camadas translúcidas atrás de fotos e do logo.
   - `'linhas'`: contornos brancos finos (cheio e tracejado) que abrem do centro nas viradas.
   - `'grad'`: túnel que escurece para o vinho.
   - `persp`: em perspectiva.
   - Use 1 a 3 vezes a cada ~10 cenas, não em todas.
6. **Liquid glass só discreto** (`vidro()`): cartão de vidro vermelho fosco sobre a mesa ou o degradê (placar de empresas, pesquisa). **Sem brilho, sem neon, sem reflexo forte**; o Felipe chama isso de "slop".
7. **Logo da V4: só o oficial** (`logoV4(p, cx, cy, w, {cor: 'branca' | 'vermelha'})`).
   - O preparar embute os SVG de `logo/` sem nenhuma alteração.
   - Branco sobre vermelho, vinho ou degradê; vermelho sobre branco.
   - Sempre **reto, opaco, inteiro**, com a área de proteção (espessura do "4") e no mínimo 50 px.
   - **Nunca** distorcer, mudar a cor, girar, aplicar transparência permanente, recortar, redesenhar, gerar por IA ou animar por partes.
   - Entra com `entra()` ou corte seco, nunca com `pousa()` (que gira).
   - Lugar natural: a assinatura do final e, se fizer sentido, o gancho.
8. **Fotos reais.** Do Commons, de fontes oficiais ou as que o Felipe mandar.
   - **Coloridas:** `gradeV4(foto(...))`, luz "sutilmente avermelhada" como pede o brand book.
   - **P&B de arquivo:** em duotone da marca, `duo(foto, VINHO, '#FFEBC8')`.
   - Borda branca e fita neutra; créditos no fontes.
   - Nenhum rosto gerado por IA. Imagem gerada só no estilo liquid glass da marca (prompt-base em `brand_v4.md`), nunca de pessoa.
9. **Logos de terceiros reais** (empresas citadas): cartão branco `logo()` com a logo real. Empresa sem logo livre ganha cartão com o nome em Plex.
10. **Premium Vox:**
    - movimento pela câmera (`mesa().cam`) e pelas entradas `entra`, `pousa` e `revela`;
    - um estímulo novo a cada 1,5–2,5 s, ligado à palavra exata;
    - sem raios, formas, cortina, neon ou ícone grande;
    - ícones, se precisar, pequenos (Material Symbols Rounded, como o brand book).
11. **Tom V4 na tela:** "direto e reto", "sangue nos olhos", "sempre à frente".
    - Na tela, frase curta, verbo de ação e número grande com fonte.
    - Nada de floreio. A fala não muda; isso vale para rótulos, títulos e selos.
12. **Som:** sons táteis do kit, **sem música** (só se o Felipe pedir).

## O apresentador
É quem gravar para a V4 (pode ser vídeo real ou o HeyGen no fluxo áudio primeiro).
- Valem as mesmas regras da vox-fernando:
  - **aparições de 3 a 5 s**, alternando tela dividida (`presMetade`/`metade`), quadro (`presQuad`/`bola`), círculo (`presBola`/`bola`) e tela cheia (`pres4`);
  - nunca duas cenas seguidas com ele;
  - **só enquanto olha a câmera** (`olhar.py` desta pasta);
  - texto nunca sobre os olhos.
- **`presQuad`** é a forma da V4: o rosto num quadro com os cantos do símbolo e aro branco. O brand book usa o círculo para avatares, então o `presBola` também vale.
- Tela dividida: a emenda é branca; o rosto fica em y ≈1190 (`yt` 230) para caber na safe zone com a legenda embaixo.
- `--rosto-x` do preparar: o x do rosto na gravação 1920×1080.

## Final
Há dois finais; pergunte ao Felipe qual se não estiver claro.
- **Perfil de quem apresenta:** o celular (`celular()`) com o **perfil REAL** dele (regra fixa do Felipe; prints em `biblioteca/perfil_*.png`).
  - Recorte `perfil_avatar.png` e `perfil_texto.png` do print, ponha numa pasta e rode o preparar com `--perfil <pasta>`.
  - O botão Seguir é VERDE CTA e vira "Seguindo ✓" na última palavra forte.
- **Assinatura da V4** (vídeo institucional): degradê `fogo`, a reverberação abrindo em volta do `logoV4` branco e o @ real da marca, **@v4company** (https://www.instagram.com/v4company/). Exemplo no teste, cena D7.

## Passo a passo
1. **Ingestão:** `pipeline.py preparar <nome> "<pasta>/<arquivo>.mp4"`. No fluxo áudio primeiro, use o mp3 e o HeyGen (CLAUDE.md do kit).
2. **Formato:** `preparar_v4.py <nome> --prefixo xx --rosto-x <x> [--perfil <pasta>]`.
3. **Corte:** como na vox-fernando, com `fix`/`DROP`/`CUT_TAIL`/`PROTEGE`/`TAIL_FIX` e depois `pipeline.py preparar <nome>`.
   - **Depois de QUALQUER mudança no corte, rode `pipeline.py preparar` de novo.**
   - Depois, `~/.claude/skills/vox-v4/sincronia.py <nome>`.
4. **Olhar** (se houver gravação): `~/.claude/skills/vox-v4/olhar.py <nome> varredura`; depois `olhar.py <nome> t0-t1 …` nas janelas escolhidas.
5. **Checagem dos fatos ANTES do plano:**
   - número, empresa, data e cliente, com links;
   - número errado não vai para a tela;
   - case de cliente da V4 só com dado que a V4 tenha publicado ou que o Felipe confirme.
6. **Plano de cenas:**
   - o fio visual é a reverberação;
   - o vermelho domina e o vinho marca as viradas;
   - amarelo é 1 detalhe por cena no máximo;
   - Morganite no número que importa;
   - copie de `cenas_exemplo.js` (os objetos desenhados — cofre, engrenagens, placa ABERTO, urna etc. — já estão em `componentes_v4.js`).
7. **Imagens:**
   - fotos: `fotos/busca_prev.py` → `folha.py` → `baixa_sel.py` → `tools/meio_tom.py` (ou cor + `gradeV4`);
   - logos de terceiros: `fotos/busca_logos.py`;
   - no fim, `make_assets.py`.
8. **Cenas** em `work/xx_c.js`, `xx_d.js`…
   - Depois: `vox-editorial/montar.py <nome> xx` → `previas.py <nome>`.
   - Prefira `~/.claude/skills/vox-v4/safezone.py <nome>` (monta e gera as prévias com as faixas da Meta).
   - Abra as folhas e confira safe zone (nada importante fora de 420–1500), contraste, proporção de vermelho, amarelo ≤ 1 por cena, o logo intacto e a legenda legível.
9. **Render, QA e entrega:**
   - `pipeline.py fechar <nome> <Nome> --ate qa`;
   - olhe TODAS as `out/qa_*.jpg`;
   - corrija e rode `--desde mix --destino "H:/Downloads/Edicoes_Claude"`.
   - Entrega: `<Nome>_vN_tiktok.mp4`, `_MASTER.mp4` e `_fontes.md`. Nunca sobrescreva.
10. **Mensagem final** (português, curta):
    - o que saiu e onde;
    - aparições do apresentador;
    - custo;
    - avisos de fala imprecisa com o valor certo e a fonte;
    - **Fontes:** em links.

## Componentes (`componentes_v4.js`)
Os da vox-fernando, com as cores da V4: paleta e mesa (`paperBg`, `fundo`, `bloco`, `camada`, `trocaC`), câmera (`mesa().cam`), entradas (`pousa`, `entra`, `revela`, `cresce`), apresentador (`pres4`, `presMetade`+`metade`, `presBola`+`bola`, `JB`), papel e texto (`papel`, `nota`, `rotulo`, `fonte`/`FTAG`, `materia`), fotos (`foto`, `pilha`, `duo`), dados (`barraH`, `barraV`, `selo`, `dado`, `logo`), mapas (`mapaBR` com `.pinta`, `pinoMapa`, `rotMapa`, `rotaSeta`), `celular` e ~30 objetos desenhados. Mais:
- `gradV4(r, tipo)`: fundo de virada no degradê oficial (`GRAD_V4`: `vinho`, `fogo`, `tunel`, `noite`).
- `titulo(p, txt, cx, cy, {s, c, lh})`: título de impacto em Morganite (caixa alta).
- `rotV4(p, txt, x, y, {bg, c, s, centro})`: rótulo com tarja vinho ou branca.
- `reverb(p, cx, cy, w, h, {tipo, n, passo, esp, cor, alfa, persp})` com `.at(lt, t, {out, vivo, gap, d})`: a reverberação.
- `logoV4(p, cx, cy, w, {cor, area})`: o logo oficial com área de proteção.
- `vidro(p, cx, cy, w, h, {raio, fundo})`: cartão liquid glass discreto.
- `presQuad(r, S, cx, cy, d, z, fy, fx)` + `bola(...)`: o apresentador no quadro do símbolo.
- `gradeV4(foto)`: luz levemente avermelhada em foto colorida.
- `dado()` e `selo()` em Morganite: no `dado`, branco por padrão; `o.c` muda a cor. `celular()` tem o botão verde CTA.

## Armadilhas
- **Contraste:**
  - grafite sobre vermelho e amarelo sobre branco são reprovados pelo brand book;
  - legenda `CT` (branca) sobre papel branco some: use `CT_ESCURA`.
- **Vermelho sobre vermelho:** bloco ou objeto VERMELHO some na mesa. Destaque sobre a mesa é VINHO ou BRANCO.
- **Amarelo demais vira "promoção":** é detalhe. Mais de um elemento amarelo por cena, corte.
- **Vidro com brilho = slop.** Nada de glow, reflexo especular forte ou borda neon. O `vidro()` já vem no limite.
- **Logo:** nunca `pousa()` (gira), nunca opacidade parcial parada, nunca em cima de foto sem contraste, nunca recolorido. Se o brand book mudar, baixe o zip de novo e troque os arquivos de `logo/`.
- **Câmera empurrando conteúdo para a legenda ou para fora da safe zone:** `mesa().cam(s, 540, py)` com zoom e py alto sobe o conteúdo (no teste, a logo da Renner encostou na legenda). Mantenha `s` ≤ 1,04 e `py` 960–1020.
- **Copiar cena de outra skill** (vox-fernando, vox-editorial): lá a legenda fica em y 330 e as peças vão de 300 a 1650. Reposicione tudo para 600–1480 antes de usar.
- As do kit e da vox-fernando valem todas: quadros de outro corte, som sobre a fala, cena que abre vazia, âncora em palavra inexistente (o `montar.py` confere), junções só com `cmd //c rmdir`.

## Checklist antes de entregar
- [ ] Vermelho dominante; neutros da paleta; amarelo ≤ 1 por cena; verde só no botão; nada fora da paleta.
- [ ] **Safe zone da Meta:** legenda, números, logos, fontes, rosto e CTA entre y 420 e 1500 em todas as cenas (`safezone.py` e QA).
- [ ] Todo texto em par de contraste aprovado (tabela do `brand_v4.md`); legenda legível em toda cena.
- [ ] Plex na fala e nos textos; Morganite só em número ou título de impacto.
- [ ] Logo oficial intacto (reto, opaco, área de proteção, ≥ 50 px), se aparecer.
- [ ] Reverberação com sombra por camada; vidro discreto; sem neon.
- [ ] Fotos e logos reais com créditos; todo número com fonte e ano; nada errado na tela.
- [ ] Apresentador: 3 a 5 s, olhando a câmera, nunca seguido.
- [ ] Zero silêncio ≥ 0,15 s; mix em −14 LUFS e pico −2 dBTP, sem música.
- [ ] Final com o perfil REAL de quem apresenta ou com a assinatura da V4.
- [ ] `_vN` nova na pasta de entrega, com o `_fontes.md`.
