---
name: edit-v4
description: Formato "edit V4" para os vídeos da V4 Company (anúncios na Meta), verticais 9:16, feitos com o Kit_Edicao_Vox_v2. É o formato dossiê investigativo (skill edit-investigativa, ref. TikTok @samuelszuchan) com a identidade do brand book 2026 da V4. O fundo é BRANCO da marca (#FFFFFF → #F2F2F2) em vez de preto, os textos são vinho #280000, o acento é o Vermelho V4 #E50914 e provas e prints de matéria saem em duotone vinho → #F2F2F2. A tipografia de impacto é Morganite e a legenda de UMA palavra é IBM Plex Sans. O apresentador fica com luz vermelha V4, o logo é só o SVG oficial, a reverberação é o grafismo, o final tem o botão VERDE de ação, e tudo que importa fica na safe zone da Meta (y 420–1500). Use quando o pedido for "edit-v4", "edit v4", "investigativa da V4", "dossiê da V4", "formato investigativo da V4" ou "vídeo da V4 no estilo investigativo/dossiê".
---

# Formato edit-v4 (dossiê investigativo com a identidade da V4)

Criado em 29/10/2026 a pedido do Felipe: uma segunda skill de edição para a V4, com o branding do brand book (https://v4-company-brand-book-2026.vercel.app/) e todas as regras da marca, no formato da **edit-investigativa**.
- A primeira skill da V4 é a **vox-v4** (Vox premium com mesa vermelha). Esta é a versão de caso e denúncia (dossiê), com fundo BRANCO da marca (pedido do Felipe, 29/10/2026: "o fundo preto precisa ser trocado pelo branco das cores da marca").
- Use a vox-v4 para explicar e a edit-v4 para investigar ou contar um caso.

**Antes de planejar, abra:**
- `exemplo_teste.jpg`: o que esta skill produz. É o teste `projetos/teste_ev4`, com o mesmo corte da demo da investigativa.
- `exemplo_safezone.jpg`: o mesmo teste com as faixas da Meta.
- `referencia_formato.jpg`: o vídeo-modelo do formato, em P&B, antes da identidade da V4.
- `brand_v4.md`: as regras da marca (cores, contraste, logo, fontes, tom, proibições), com links.
- `safezone_meta.jpg`: a safe zone do criativo dinâmico.

O corte, os beats, o render, a mix e a entrega seguem o `CLAUDE.md` do kit (`<kit>`):
- no PC do Felipe, `H:\Edição Claude\Kit_Edicao_Vox_v2`;
- em outro PC, a pasta da variável `VOX_KIT`.

Regras fixas do Felipe:
- a fala nunca muda;
- todo dado tem checagem com fonte;
- IA nunca faz rosto de pessoa real;
- o CTA usa o perfil REAL de quem fala ou a assinatura da V4;
- toda entrega é uma versão nova `_vN`;
- entrega = tiktok ≤ 29 MB + MASTER.

Rode tudo com `<kit>\.venv\Scripts\python.exe`, na raiz do kit.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes.js` | biblioteca do formato (vira `work/<prefixo>_a.js`, com o `LOGO_V4_SVG` oficial). É a da investigativa com a identidade da V4 (`IV`, `V4`, `VINHO`, `VERDE_CTA`, `SAFE`, camada `#v4tinta`, `ivCapSpan`), mais `logoV4`, `reverbInv` e `fimV4Inv` |
| `cenas_exemplo.js` | as 17 cenas do teste: as 16 da investigativa (0–66 s, um exemplo de cada cenário, já na safe zone) + o final `fimV4Inv` |
| `legenda.css` | fontes da marca (Plex, Morganite, Fjalla), legenda #F2F2F2, grão, vinheta, camada vinho, sem barra de progresso |
| `preparar_ev4.py` | prepara o projeto: fontes, CSS, componentes + logo, parede clara `t_parede`, TV `g_tv60`, perfis, `clipn.js`/`olhos.js`/`marcas.js`, `etapas.json`. `--so-biblioteca` só atualiza o `_a.js`. Não mexe no corte |
| `provas.py` | fotos em DUOTONE V4 com retícula fina: `foto`, `imp`, `pessoa` (recorte + olhos para a tarja), `multidao`, `doc`, `site` |
| `pagina.py` | DOCUMENTO real: print da matéria pela URL (Chromium do kit) em duotone, e a posição de cada trecho a marcar de vermelho |
| `trilha_inv.py` | cama grave sintetizada (~117 BPM, dó menor, sem drops) + baque sub-grave em cada corte + mix final −14 LUFS |
| `montar.py` / `previas.py` / `ritmo.py` | montar: junta `work/<prefixo>_[a-z].js` e confere sintaxe, palavras, beats, apresentador e ritmo. previas: folhas por cena. ritmo: cortes/min no vídeo pronto |
| `safezone.py` | monta e gera as prévias com as faixas da Meta pintadas (`out/pv/safezone_*.jpg`); lista quadros com algo nas faixas cinzas |
| `olhar.py` / `sincronia.py` | olhar do apresentador (só olhando a câmera) e sincronia boca × áudio |
| `brand_v4.md`, `fonts/`, `logo/`, `safezone_meta.jpg` | brand book resumido, fontes da marca, os SVG ORIGINAIS do logo (não edite), a safe zone da Meta |
| `modelo/g_tv60.png` | TV antiga recortada (a tela do PNG é opaca: a imagem vai por cima) |

**O que já rodou** (teste de 29/10/2026, `projetos/teste_ev4`, demo `H:\Downloads\Edicoes_Claude\_Testes e demos\TesteEditV4\TesteEditV4_demo_70s.mp4`):
- render da demo de 70 s: `presInv`, tipografia, recorte com tarja, mural, documento real, TV, mapa, foto, contador e `fimV4Inv`, com `trilha_inv.py`;
- **ainda não testados com a identidade V4:** `siteCena`, `nomeado`, `fimPerfilInv`, `tvCena` com clipe e `provas.py multidao`. O código é o da investigativa, só com as cores trocadas.

## A identidade da V4 neste formato (não negociar)
1. **Fundo BRANCO da marca** (o preto da referência NÃO entra; pedido do Felipe, 29/10/2026).
   - Palco da tipografia: branco `#FFFFFF` no centro, `#F2F2F2`/`#ECE9E9` nas bordas.
   - Também ficam claros: a parede do mural (`t_parede` ≈ `#F2F2F2`), o documento, o quarto da TV, o mapa (país `#DDD8D8`, divisas brancas) e o final.
   - Vinhetas e sombras são suaves, em grafite/vinho de baixa opacidade, nunca preto pesado.
   - A camada `#v4tinta` (lighten `#280000`) continua: só afeta os pretos que sobrarem (vídeo, TV).
   - Se a parede do mural medir < 225 no render, está cinza demais: o alvo é ~235–242.
2. **Vermelho V4 `#E50914`:** chaves da tipografia, marca-texto dos documentos, fio do mural, estados do mapa, tracejados. Os tons de apoio `#FF481F` e `#650E0F` só em luz e degradê.
3. **Texto em VINHO `#280000`** (par aprovado sobre o branco), na tipografia e na legenda. Sans pequena (fonte e ano) em `IV.cinza` (grafite claro).
   - `IV.branco` é nome herdado da investigativa e hoje vale o vinho do texto.
   - Sobre o apresentador e sobre a foto de tela cheia, a legenda volta a ser clara (`#F2F2F2` com sombra escura): `S.capClara = true`, que o `presInv` e o `fotoCena` já ligam. Ligue também em cena própria com fundo escuro.
4. **Provas em DUOTONE V4.** Fotos, recortes, prints de matéria e sites saem do `provas.py`/`pagina.py` mapeados de vinho (sombra) a `#F2F2F2` (luz), com retícula. É o equivalente do P&B da referência dentro da paleta.
5. **Apresentador:** a única cena com cor natural. Tom vinho (`frio` .35) e luz vermelha V4 de um lado: as fotos do brand book usam luz "sutilmente avermelhada" e fundo vermelho.
6. **Tipografia:**
   - estilos `V`/`v`/`S`/`s` (impacto) em **Morganite Bold**;
   - estilos `a`/`A`/`r`/`n`, legenda e textos em **IBM Plex Sans**;
   - a legenda é UMA palavra em Plex semibold 62 px.
   - A Morganite é estreita: os corpos dos estilos de impacto são 25% maiores que os da investigativa.
   - Sem Morganite, use Fjalla One.
7. **Texto nítido, SEM glow e SEM aberração cromática** (no branco, a legenda tem só um halo branco para ler sobre as provas). Ciano e rosa não são da paleta; brilho forte vira neon, e o Felipe chama isso de "slop".
8. **Amarelo `#FFDD00`:** no máximo 1 detalhe por cena; o formato quase não precisa. **Verde `#0E8420`:** só no botão de ação do final.
9. **Logo da V4: só o oficial** (`logoV4`, SVG do brand book embutido pelo preparar).
   - Sobre o fundo branco do formato: a versão VERMELHA (`{cor: 'vermelha'}`; o `fimV4Inv` já usa). A branca só sobre vermelho ou vinho.
   - Reto, opaco, inteiro, com área de proteção e ≥ 50 px.
   - **Nunca** distorcer, recolorir, girar, deixar transparente parado, redesenhar, gerar por IA ou animar por partes.
   - Lugar natural: o final (`fimV4Inv`) e, se fizer sentido, a cena "a V4 entrou".
10. **Reverberação** (`reverbInv`): os contornos concêntricos do símbolo, em vermelho fino sobre o branco, cheio e tracejado, com sombra leve. Vai atrás do logo, de um número-chave ou de uma prova-chave, 1 a 3 vezes por vídeo.
11. **Contraste do brand book sobre o branco** (tabela no `brand_v4.md`):
    - aprovados em qualquer tamanho: grafite `#312D2D`, vinho `#280000` e Vermelho V4;
    - **nunca** amarelo ou `#F2F2F2` sobre o branco: o selo amarelo, se houver, leva texto vinho dentro.
12. **Tom V4:** direto e reto, número grande com fonte, verbo de ação. Case de cliente da V4 só com dado que a V4 tenha publicado ou que o Felipe confirme.

## Safe zone da Meta (não negociar)
Os vídeos da V4 rodam como **anúncio na Meta** (criativo dinâmico, recortes 9:16 → 4:5 → 1:1). No quadro 1080×1920:
| faixa (y) | o que acontece |
|---|---|
| 0–286 e 1636–1920 | a interface do app cobre |
| 286–420 e 1500–1636 | somem no recorte 1:1 |
| **420–1500** | **o quadrado central: a única faixa que aparece em todos** |

- **Legenda, números, nomes, rótulos, documentos, rosto do apresentador, pessoa revelada, logo e botão** ficam entre y 420 e 1500 no momento em que importam.
- A legenda de uma palavra (y 1371) e a do final (1452) já estão dentro.
- Use `S.cap` com `y` ≤ 1460; o teste tinha uma cena com y 1520, corrigida.
- **Recortes de pessoa:** o rosto acima de 1500. No teste, o Lula subiu de cy 1500 para 1330, com w 1000.
- **Tipografia com câmera viajando:** a composição pode ser maior que a tela. Na chave em que um elemento é a informação, ele precisa estar no quadrado. O que sai pela borda enquanto a câmera desce ("cancelaram" subindo) tudo bem.
- Linhas de fonte longas estouram a largura: até ~52 caracteres a 28 px.
- Confira SEMPRE com `safezone.py <projeto>` no lugar do `previas.py`, e nas QA.

## A receita em números (medida na referência)
- **Ritmo lento de corte, rápido por dentro.** São 30 cortes em 153 s: 11,5–11,8 cortes/min, plano médio 5,0 s e mediana 4,0 s (de 2,0 a 16,6 s).
  O olho nunca fica parado. Dentro de cada plano, algo novo acontece a cada 0,6–1,2 s: a palavra que entra, o item que é preso no
  mural, o marca-texto, a câmera que viaja ou o foco que muda. Aceite 9–15 cortes/min. O teste deu 13,7/min.
- **Tempo de tela:**
  | cenário | tempo |
  |---|---|
  | apresentador | 36%, em 8 aparições de 2,1–12,2 s |
  | documentos e sites | 36% |
  | tipografia (no branco, na V4) | 13% |
  | mural | 9% |
  | TV, foto de arquivo e mapa | 7% |

  Com avatar do HeyGen, o apresentador fica em **25–35% e sempre em peças de 2–4 s** (regra do Felipe: esconde as imperfeições do avatar).
- **Voz:** 2,5 palavras/s e corte justo (só 6 s de pausas ≥ 150 ms em 153 s). Mantenha o corte apertado do kit.
- **Cor** (medida em pixels):
  - vermelho do texto `#E50914` (V4); marca-texto `#E50914`; região do mapa `#E50914` com textura;
  - na V4: vinho `#280000` (a camada `#v4tinta` faz isso), mais escuro nos cantos pela vinheta;
  - branco do texto `#F2F2F2` (nunca branco puro);
  - papel do documento claro (duotone até `#F2F2F2`) no centro, com os cantos a ~40% do brilho do centro.
  - O apresentador é a única coisa colorida: na V4, tom vinho (não azul), luz VERMELHA V4 de um lado, topo escuro.
- **Tipografia:**
  - Na V4: impacto = Morganite Bold (corpos 25% maiores que a Times da referência); sans = IBM Plex Sans 400/600.
  - Todo texto tem brilho contido; a V4 não usa aberração cromática.
- **Legenda:**
  - UMA palavra por vez, sem caixa. Ficam juntos número + grandeza ("3 bilhões de reais"), datas e nomes próprios ("Felipe Dantas").
  - IBM Plex Sans semibold 62 px, VINHO `#280000` com halo branco no fundo branco (clara `#F2F2F2` com sombra escura sobre o apresentador e foto de tela cheia), no **centro, y 1371, em todas as cenas**.
  - Some quando a tela já escreve a fala: tipografia, mapa e revelação de nome.
- **Som:**
  - Cama grave: 87% da energia abaixo de 250 Hz, pulso a ~117 BPM em dó menor, **nível constante e sem drops** (~19 LU abaixo da voz).
  - **Baque sub-grave** (~40 Hz) em 28 dos 30 cortes, com pico 0,2–0,35 s depois do corte, a −6,6 dB da fala.
  - Nenhum whoosh nem som tátil.
  - Master −14 LUFS (padrão do Felipe).
- **Câmera:**
  - Nunca parada: push-in de 3–30%/s, pans de 200–900 px por plano e giro de 1–5°.
  - **Arranque + deriva:** ~todo o zoom do plano acontece no 1º quarto, logo depois do corte (mediana 97% dos planos com zoom).
    Depois a câmera só deriva devagar. Ela para e recomeça ~19 vezes por minuto, sem parar entre um ponto e outro.
  - **Borrão de movimento:** quando a câmera corre, a imagem perde ~40% da nitidez (razão nitidez correndo/parada 0,60).
  - Documentos, TV e site entram desfocados e focam em ~0,5 s (rack focus).
  - O apresentador entra fechado (~1,4×) e desfocado e abre em 0,45 s.
- **Grão:** fino e leve, medido em ~1 nível de desvio nos meios-tons da referência. Grão forte dobra o tamanho do arquivo e borra no TikTok.

## Os cenários (tudo em corte seco; cada corte ganha o baque do `trilha_inv.py`)

### 1. Apresentador: `presInv(beats, {z0, empurra, passos, luz, forca, frio, fy, capY})`
- Tela cheia, plano médio (cabeça e ombros). É a ÚNICA cena colorida. O tom é frio (`frio` .5) com luz vermelha de um lado
  (`luz: 'dir'|'esq'|false`, `forca` .55) e topo escuro.
- A entrada é um **punch-out**: começa a 1,42× e desfocado e abre em 0,45 s. Depois o zoom NÃO fica parado: muda de nível em cada
  beat (e no meio de beat > 2,6 s), alternando fechar e abrir (1,12 → 1,04 → 1,15...), com arranque de 0,5 s e borrão no salto, mais um
  empurrão lento (`empurra` .06) e uma câmera na mão leve (`mao: false` desliga). `passos: c => [[t, nível]]` escolhe os momentos,
  `niveis: [...]` os níveis, `passos: false` desliga.
- A legenda de uma palavra vai no peito (y 1371). Mostre o apresentador **só olhando para a câmera** (regra do Felipe: confira o olhar em cada janela).
- Fluxo áudio primeiro (HeyGen): o `presInv` só pode cair nos beats das peças do `work/apresentador.json`.

### 2. Tipografia no branco: `palco(r, S)` + `linha`/`linhaFala` + `tracejado` + `contador` + `impressa`
- `palco` faz o fundo escuro parado (vinho, pela camada `#v4tinta`), com o centro levantado e um brilho vermelho ambiente (`brilho: [x, y]`). Ele já põe `S.cap` em `none`.
- **Estilos** (`IV_EST`, em px a 1080 de largura):

  | estilo | uso | fonte e cor |
  |---|---|---|
  | `V` | chave vermelha enorme ("350", "lowest", "2006,") | Morganite 250, Vermelho V4 |
  | `v` | chave vermelha ("worked from", "Nordeste.") | Morganite 165, Vermelho V4 |
  | `S` | Morganite branca enorme | Morganite 250, #F2F2F2 |
  | `s` | Morganite branca ("Wei,", "one-person", nome no mapa) | Morganite 165, #F2F2F2 |
  | `a` | ligação pequena ("8 at", "salary rate in China is") | Plex 400, 54 px |
  | `A` | ligação forte ("night", "viewers") | Plex 600, 58 px |
  | `r` | sans vermelha pequena ("companies on") | Plex 500, 54 px, vermelho |
  | `n` | nome ao lado da foto | Plex 500, 48 px |

  Opções por parte: `{s, cor, marca: true (fundo vermelho, como em "Viya."), letras: true, p (peso)}`.
- `linha(p, [['The','a'], ['lowest','V']], x, y, {alinha, letras})`: y é a linha de base. `.at(lt, [t1, t2])` revela cada parte
  desfocada → nítida. Com `letras: true`, as letras surgem fora de ordem (o "low t" da referência). `.marca(i, lt, t)` acende o fundo vermelho.
  `linhaFala(p, c, 'B12', 'a a|V', x, y)` monta pelos tempos da fala.
- **Ligações:**
  - `tracejado(svg, curva(x0,y0,x1,y1,k) | reta(...), {c, w})` + `.draw(q)`;
  - o fio vermelho tracejado vertical leva a câmera para baixo ("she set up → one-person companies");
  - a curva tracejada liga o rótulo ao objeto.
- **Números:** `contador(p, x, y, {de, para, casas, pre, suf, s})` + `.at(lt, t, d)` conta com borrão (0% → 3%). A fonte e o ano
  vão logo abaixo, em sans 30 px cinza: a regra do kit é que **todo dado na tela tenha ano e fonte**.
- **Câmera:** `camMove: camC(c => [[t, {x, y, z, r}], ...])`. A câmera OLHA para o ponto (x, y) do mundo da cena.
  Monte a composição maior que a tela (3000 px de altura) e faça a câmera viajar até o elemento novo.
  - Todas as câmeras do formato (`camOlha`/`camC`, mural, documento e site) já fazem o movimento da referência:
    - **entrada:** começa 16% mais aberta (mural: mais longe) e chega à 1ª chave em ~0,55 s;
    - **arranque:** cada trecho faz ~80% do caminho no começo e chega ainda andando, sem parar;
    - **deriva:** zoom +1%/s até 4 s depois da última chave;
    - **borrão de movimento** automático na direção do movimento.
  - Ajustes:
    - 3º item da chave: `'suave'` (acelera e freia), `'linear'` ou `'fixa'` (na 1ª chave: sem entrada);
    - `window.IV_ENTRADA` (padrão .16) e `window.IV_BORRAO` (padrão .4; 0 desliga).
  - Coloque a chave de chegada logo depois da palavra: a câmera chega cedo e deriva.
- **Fotos soltas no escuro:** `impressa(p, 'i_x', cx, cy, w, {rot})` + `.at(lt, t)` é a foto em duotone com borda branca, canto dobrado e
  percevejo. A legenda do lugar vai embaixo em sans 30 px cinza.

### 3. Pessoas: `recorte(p, 'p_x', cx, cy, w, {tarja})` + `nomeado(...)`
- Pessoa recortada em duotone V4 com retícula (`provas.py modo pessoa`). O pé some no preto (`funde`) e há um brilho leve na borda.
  Ela entra subindo com borrão (`.at(lt, t, {k: 'sobe'})`).
- **Tarja preta nos olhos** (`tarja: true` usa os olhos achados pelo `provas.py`) enquanto a pessoa ainda não foi nomeada.
  `.tira(lt, c.w('B29','Lula'))` tira a tarja NO NOME, e o nome entra em Morganite vermelha em cima (a revelação "Huang Wei,").
  Use a tarja como recurso de narrativa e reutilize o mesmo recorte: na referência, a mesma pessoa aparece com tarja em 2 cenas antes do nome.
- Anônimos (multidão, "os espectadores") vão com tarja em todos: `provas.py modo multidao`.
- **Fila de pessoas citadas:** um recorte por pessoa, com `nomeado(p, svg, 'Fan Bingbing', xT, yT, xAlvo, yAlvo)` (nome em sans +
  tracejado curvo até a pessoa). A câmera passa de uma pessoa para a outra.

### 4. Mural de provas: `mural()` + `muralCena(beats, M, {cam})`
- O fio do vídeo. Defina UM mural no `_b.js`:
  - `M.foto(id, 'i_x', x, y, {w, rot, dz, desde})`;
  - `M.doc(id, 'd_x', x, y, {w, recorte: [fy0, fy1]})`;
  - `M.fio(a, b, {desde})`.

  Cada visita mostra o que já foi citado. O que entra naquela fala é **preso na palavra** (`desde: ['B22', 'Transnordestina']`):
  aparece com escala e foco, e o fio vermelho desenha.
  A referência volta ao mural 5 vezes e ele vai crescendo. Faça de 3 a 5 visitas.
- **Câmera 3D:** `cam: c => [[t, {x, y, d, r}]]`, onde (x, y) é o ponto da parede no centro e `d` a distância (1000 = tamanho real;
  800–1250 é o bom; 1500 dá a vista geral).
  - O foco vai sozinho para o item perto do centro; os outros desfocam pela profundidade (`dz`) e pela distância do centro.
  - A luz é um poço no meio e a parede fica levemente mais cinza nas bordas (vinheta suave).
  - Itens de 480–650 px de largura.
- A parede `t_parede` é CLARA na V4 (reboco liso ~#F2F2F2; no render, 231–239 nas bordas). Na referência ela era escura (42/255).

### 5. Documento: `docCena(beats, 'd_x', {cam, inclina, faixa, rack, marcas})`
- **Use print REAL**, do pedido fixo do Felipe: manchetes e dados reais, com marca-texto no que ele diz.
  `pagina.py <proj> nome --url URL --marca "2,7 bi" --marca "foi lançada em 2010"` abre a página no Chromium do kit e faz assim:
  1. rola a página para carregar tudo;
  2. esconde o que é fixo (barras, cookies, anúncios);
  3. começa ~960 px acima do título;
  4. converte para duotone V4 de xerox;
  5. grava a posição de cada `--marca` em `render/marcas.js`.

  Site que não abre limpo (paywall, página vazia): use `--texto pagina.json` com o título e os trechos reais (reprodução).
  Nesse caso, diga nas fontes que é reprodução e dê o link.
- A página fica num plano inclinado (`inclina` 13°): o topo foge, há uma **faixa nítida no meio** (`faixa` [.34, .66]) e o resto fica desfocado.
  A vinheta é forte. A câmera `cam: c => [[t, {x, y, z, r}]]` usa **frações da página**.
  `[[0, {x: .32, y: m[1], z: 1.05}], [t, {x: (m[0]+m[2])/2, y: (m[1]+m[3])/2, z: 1.75}]]` empurra até o número.
- `rack: c => .05`: entra desfocada e foca. `marcas: c => [[...ivMarca('d_x', '2,7 bi'), c.w('B37', 'bilh')]]`: o marca-texto
  vermelho (multiply) passa da esquerda para a direita no tempo da palavra.
- A legenda continua, com sombra forte (`{modo: 'palavra', doc: true}`, padrão).
- Uma página pode ser lida descendo: a referência fica 16 s num documento, indo de um trecho marcado a outro.

### 6. Site impresso: `siteCena(beats, 'w_x', {w, inclina, rack, cam, marcas})`
- É o print de site com borda rasgada (`provas.py modo site`), num plano inclinado sobre uma cópia gigante e desfocada dele mesmo
  (o bokeh da referência). Entra desfocado e foca. Serve para a "página oficial que vende o esquema".

### 7. TV de tubo: `tvCena(beats, {img: 'd_x' | clipe: 'nome', pos, rack, cam})`
- Ambiente claro, a TV antiga em duotone e a prova na tela (print ou clipe de telejornal em `render/clips/`), com linhas de varredura.
  A luz da tela vaza na parede. Entra desfocada e a câmera empurra e gira de leve. Use para "na televisão", "a imprensa noticiou".
  `pos: '30% 0%'` escolhe o pedaço do print que aparece.

### 8. Mapa claro: `mapaCena(beats, {alvo: ['MA','CE'], acende, cam, rotulos})`
- O Brasil fica cinza-claro sobre o branco, com divisas brancas, estados, traços de "relevo" e retícula. Os estados-alvo acendem em vermelho (piscando 0,18 s) na palavra,
  com brilho. Os rótulos são Morganite branca (`linha(p, [['Maranhão','s',{s:40}]], x, y)` nas coordenadas do mapa, que acompanham o zoom),
  mais um tracejado vermelho até o lugar. O Brasil inteiro ocupa x 90–940, y 510–1380, e o Nordeste enche a tela com z ≈ 2.
- A legenda some (`S.cap` none); para mostrar a frase antes do rótulo, use `S.cap = lt => lt < t ? {modo:'palavra'} : {modo:'none'}`.

### 9. Foto de arquivo em tela cheia: `fotoCena(beats, 'f_x', {z0: 1.12, z1: 1.0, fx, fy})`
- Foto em duotone V4 com retícula fina e zoom lento. A referência ABRE (zoom out), mas empurrar também vale. Use para lugar, obra ou cena real.
  O `provas.py modo foto` já gera a imagem no tamanho que cobre a tela, para a retícula ficar fina (1:1).

### 10. Final
- **V4 (CTA "clica no link", "marca uma reunião", vídeo da marca):** `fimV4Inv(beats, {toque: ['Bxx', 'clica'], feito: ['Byy', 'reuniao'], botao: 'Marcar reunião', ok: 'Reunião marcada ✓', handle: '@v4company'})`. Parede BRANCA, a reverberação abre em volta do LOGO OFICIAL vermelho, o @ real da marca e o botão VERDE apertado na palavra. Tudo na safe zone.
- A referência termina no apresentador e corta para preto. Se a fala pedir para seguir o perfil, use
  `fimPerfilInv(beats, {perfil: 'perfil_felipedantasf', toque: ['B129', 'seguir']})`: o print REAL do perfil fica preso na parede
  com percevejo e o botão VERDE (cor de ação da V4) Seguir → Seguindo. Pessoa sem print: `nome`.

## Decidir o cenário de cada frase
| a frase traz | cenário |
|---|---|
| pergunta, opinião, "você", virada | apresentador |
| número, data, prazo, comparação | tipografia (+ contador) |
| quem fez, nome de alguém | recorte (tarja até o nome) |
| algo que entra na história (obra, empresa, pessoa, documento) | mural (prende o item novo) |
| "a matéria", "o documento", "o governo publicou", valor exato | documento real com marca-texto |
| "na TV", "a imprensa" | TV de tubo |
| lugar | mapa claro |
| paisagem ou obra | foto de arquivo |

**Gancho** (primeiros ~3 s, quadro 0 completo): a frase-gancho na tipografia com o número em vermelho e o protagonista recortado com
tarja, ou o mapa acendendo. Antes dos ~12 s, o apresentador.

**Estrutura da referência:** gancho → apresentador → prova (foto presa) → documento → nome revelado → mural → TV → apresentador →
mural → documentos (o mecanismo) → mapa → apresentador → documentos → número → apresentador → site oficial → documento final →
apresentador (fecho).

## Legenda: `S.cap` em cada cena
- `{modo: 'palavra'}` (padrão): uma palavra por vez, centro, y 1371. Opções: `y`, `x`, `s` (tamanho), `cor`, `doc: true` (sombra forte em fundo claro).
- `{modo: 'none'}`: tipografia, mapa e fim. Pode ser uma função do tempo local (`lt => ...`) para trocar no meio da cena.
- Grupos forçados para o vídeo todo: `IV_UNE.add('bolsa familia')` (texto normalizado, sem acento).
- A legenda nunca atravessa o corte de cena e entra desfocada → nítida em 0,12 s, 0,02 s antes da palavra.

## Som
- `trilha_inv.py` (pelo `pipeline.py fechar`, via `etapas.json`). Opcional, `trilha.json` na raiz do projeto:
  `{"bpm": 117, "tom": "Cm", "nivel": -19, "baque": -3, "sem_baque": ["B44"], "hits": [["B46", "2010"]], "sobe": [["B40", "B52", 2]]}`.
  - `nivel` = LU da cama em relação à voz (ponderação K).
  - `baque` = dB do baque contra o RMS da voz.
  - Nas cenas, `EVENTS.push({t: c.t0 + lt, type: 'semBaque'})` tira o baque de um corte e `{type: 'baque'}` põe um extra.
- Sem música: `--sem-trilha` no preparar (ou `SEM_MUSICA=1`). Os baques continuam, porque fazem parte da edição. Sem baques: `SEM_BAQUE=1`.
- Efeito tátil do kit (`cue`): quase nada. A referência não tem whoosh. Se usar, nunca em cima do começo de palavra.
- O teste mediu baque a −6,3 dB (referência −6,6), pico 0,23 s depois do corte e checa_fala com 0 palavra perdida por efeito.

## Passo a passo
1. **Projeto e transcrição** (raiz do kit): `pipeline.py preparar <nome> "C:/.../video.mp4"` (ou o mp3 da ElevenLabs no fluxo áudio primeiro).
2. **Formato:** `python ~/.claude/skills/edit-v4/preparar_ev4.py <nome> --prefixo xx [--avatar | --real] [--sem-trilha]`.
3. **Corte e beats** como no kit. Os beats são de 1–2,5 s e quebram antes de nomes, valores e datas.
4. **Pesquisa:** cada fato, número e data, com a fonte primária. **Ache as páginas reais** (matéria, diário oficial, relatório do TCU,
   site do órgão) para os documentos e anote a URL e a data. O que estiver errado na fala NÃO vai para a tela: vai a legenda, mas nenhum
   número, documento ou selo repete o erro. Avise o Felipe com a fonte.
5. **Plano de cenas:** tabela `cena | beats | fala | cenário | prova (fonte) | âncora | câmera`. Confira:
   - ~11,5 cortes/min, cenas de 2–8 s com algo novo a cada ~1 s;
   - apresentador no perfil (real ~36%; avatar 25–35% em peças de 2–4 s);
   - documentos reais em ~1/3 do tempo;
   - mural visitado 3–5 vezes, crescendo.
6. **Provas:**
   - fotos → `export MSYS_NO_PATHCONV=1` e `python provas.py <nome> fotos/x.jpg:pessoa fotos/y.jpg:imp fotos/z.jpg:foto`
     (Commons, Agência Brasil, as fotos que o Felipe mandar; saem em duotone V4);
   - páginas → `python pagina.py <nome> gazeta --url "https://..." --marca "R$ 2,7 bi"`;
   - pessoas reais: só foto real (nunca IA).
7. **Cenas** em `work/xx_b.js`, `xx_c.js`... (copie de `cenas_exemplo.js`). Comente cada uma com `// Sn — "fala"`.
   `python montar.py <nome> xx` deve dar sintaxe, palavras e beats ok, apresentador no perfil e o ritmo previsto.
8. **Prévias:** `python ~/.claude/skills/edit-v4/safezone.py <nome>` (ou `--cenas 3,8,13`). Abra `out/pv/safezone_*.jpg` e confira a safe zone, a paleta e o logo.
9. **Fechar:** `pipeline.py fechar <nome> NOME --destino "H:\Downloads\Edicoes_Claude"`. Ele roda montar → render → mix + `trilha_inv.py` →
   checa_fala → QA → entrega `_vN`.
10. **Conferir:** `python ritmo.py <nome>` (9–15 cortes/min, nenhum trecho parado) e todas as `out/qa_*.jpg`.
11. **Mensagem final** (português, curta):
    - arquivos e onde estão;
    - créditos gastos (o formato é 0 crédito quando só usa fotos e prints reais);
    - avisos de checagem com fonte;
    - **Fontes:** com os links das matérias printadas (veículo e data), das fotos (autor e licença) e dos dados.

## Componentes — assinaturas
- Legenda: `S.cap = {modo: 'palavra'|'none', x, y, s, cor, doc}`; `IV_UNE`.
- Câmera: `camOlha([[t, {x, y, z, r}, 'arranque'|'suave'|'linear'|'fixa']])`, `camC(c => keys)`, `ivKf(keys, padrao)`, `IV_ARRANQUE`,
  `ivBorrao(el, S, vx, vy, vb)` (cena com câmera interna: `S._mbProprio = true` e chame no update), `window.IV_ENTRADA`, `window.IV_BORRAO`.
- Apresentador: `presInv(beats, {z0, dEntra, empurra, passos: c => [[t, nível]] | false, niveis, mao, luz, forca, frio, sat, fy, capY, vig, grao, build(L,S,c), update(S,c)})`.
- Palco: `palco(r, S, {brilho, cap, vig, grao})`, `linha(p, partes, x, y, {alinha, k, letras})` + `.at(lt, ts, {d, blur, espalha, out})` +
  `.marca(i, lt, t)` + `.caixa()`, `linhaFala(p, c, beat, spec, x, y, {entre, junta, de})` + `.at(lt)`, `tracejado(svg, d, {c, w, dash, gap})` +
  `.draw(q)`, `reta()`, `curva(x0, y0, x1, y1, k)`, `contador(p, x, y, {de, para, casas, pre, suf, s, alinha})` + `.at(lt, t, d)`,
  `tarja(p, x, y, w, h)` + `.at(lt, t0, t1)`, `impressa(p, 'i_x', cx, cy, w, {rot, tipo, dobra, pino, recorte})` + `.at(lt, t, {k})`.
- Pessoas: `recorte(p, 'p_x', cx, cy, w, {tarja, funde, fundeDe})` + `.at()` + `.tira(lt, t)`, `nomeado(p, svg, txt, x, y, x1, y1, {estilo, alinha, curva})` + `.at(lt, t)`.
- Mural: `mural().foto(id, asset, x, y, {w, rot, dz, desde, borda, dobra}).doc(...).fio(a, b, {desde})`, `muralCena(beats, M, {cam, foco, luz, cap, build, update})`.
- Documento: `docCena(beats, 'd_x', {cam, inclina, faixa, rack, marcas, larg, cap})`, `ivMarca('d_x', 'trecho')`; site: `siteCena(beats, 'w_x', {w, inclina, rack, cam, marcas})`.
- TV, mapa, foto e fim: `tvCena(beats, {img | clipe, from, pos, rack, cam, w})`, `clipe(p, nome, S, {from, rate, fx, fy, z0, z1, w, h, pb})`,
  `mapaCena(beats, {alvo, acende, cam, rotulos(p, svg, S, c), cap})`, `fotoCena(beats, 'f_x', {z0, z1, fx, fy, cap})`,
  `fimPerfilInv(beats, {perfil, toque, nome})`, `fimV4Inv(beats, {toque, feito, botao, ok, handle})`; V4: `logoV4(p, cx, cy, w, {cor, area})`, `reverbInv(p, cx, cy, w, h, {n, passo, cor, esp})` + `.at(lt, t, {out, vivo})`.
- Entrada genérica: `entra(e, lt, t, {k: 'foco'|'cresce'|'sobe'|'desce'|'lado'|'brota', d, dx, dy, out})`. Do kit: `scene`, `el`, `box`, `svgAbs`,
  `sv`, `tx`, `kf`, `E`, `clamp`, `lerp`, `cue`, `AS`, `c.b/c.e/c.w`.

## Armadilhas (vistas no teste)
- **Espaço da Morganite é estreito:** "The Best Açaí" ou "R$ 1 bi" numa parte só (ainda mais com `letras: true`) sai grudado ("TheBestAçaí", "R$1bi").
  Ponha cada palavra numa parte da `linha` (`[['R$','V'],['1','V'],['bi','V']]`): o espaço entre partes é o da Plex.
- **Contador de 0 a 1** mostra "R$ 0 bi" no caminho: para valor pequeno, revele o número direto na palavra (`linha` estilo `V`).
- **Cor errada:** fundo preto ou cinza-escuro = cena feita à mão com cor fixa da investigativa (`#0a0a0a`, `#070707`...); use `IV.fundo`/`palco()`. Prova em P&B neutro = gerada pela edit-investigativa: gere de novo aqui (duotone).
- **Projeto preparado antes de 29/10 (fundo escuro):** rode o `preparar_ev4.py <proj> --prefixo xx --parede`. Ele troca o bloco de CSS, o `_a.js` e a parede clara; não mexe no corte.
- **Preparar de novo:** o `preparar_ev4.py` não mexe no corte; para só atualizar a biblioteca, use `--so-biblioteca`.
- **`g_tv60.png` tem a tela OPACA:** desenhe a TV primeiro e a imagem por cima (o `tvCena` já faz isso). A tela preta na prévia vinha daí.
- **Print começando no título deixa preto em cima da página** quando a câmera centra o título. O `pagina.py` já começa 960 px acima.
  Se a página não tiver isso de topo, aceite a borda do papel no alto (a referência mostra a borda) ou foque um pouco abaixo.
- **Foto de tela cheia em 1400 px é ampliada 2×** para cobrir 1080×1920, e a retícula fica grossa. O `provas.py modo foto` já gera
  no tamanho certo; se passar `largura` à mão, use a que cobre a tela.
- **Movimento "flutuando" (v1 do teste, 29/10):** com `E.inOut` entre as chaves, a câmera parava em cada ponto (37 paradas/min contra
  19 na referência). Só 10% do zoom acontecia no começo do plano e nada tinha borrão, então a demo parecia menos dinâmica com a MESMA
  velocidade média. Depois do arranque + entrada + deriva + borrão: 16 paradas/min, 52% do zoom no 1º quarto e borrão 0,61 (ref. 0,60).
  O resto é proposital: as viagens da câmera até o elemento citado acontecem na palavra. Não volte para `E.inOut` como padrão.
- **Filtro na camada da câmera:** o borrão usa `filter` no `r` da cena. Cena que precisa de outro filtro nessa camada (foco da TV)
  põe o valor em `S._filtroExtra`; se escrever `r.style.filter` direto, o borrão apaga.
- **Grão forte:** ±100 com opacidade .2 deixava o MASTER da demo com 248 MB em 66 s. Com o grão atual (±45, suavizado) caiu para 126 MB,
  e o tiktok 2 passadas (1,15 Mb/s) ficou limpo. Não suba `S.grao` acima de ~.25.
- **Mural longe demais** (d ≥ 1400 o tempo todo) deixa as fotos pequenas e a parede preta. Fique em d 800–1250 e itens de 480–650 px. A parede
  precisa da luz no meio (`t_parede` a ~30/255 + o poço de luz).
- **`c.w` cai na 1ª palavra do beat** se não achar: o `montar.py` avisa. Use prefixos sem acento ('Maranh', 'bilh').
- **`linha` mede o texto na hora do build:** as fontes precisam estar no pré-carregamento (o preparar já põe a Morganite e a Plex na lista `faces`).
- **Rótulo fora do quadro:** composição maior que a tela + câmera viajando. Confira cada palavra nas prévias: "Estados Unidos" em x 300 saiu cortado.
- **Câmera da ÚLTIMA cena com `c.dur`:** a última cena vai até o fim do áudio. Numa demo parcial, ou se houver cauda, o movimento se
  espalha e a cena fica parada. Ancore a última chave numa palavra (`c.e('B49') + .4`).
- **O mesmo print em duas cenas seguidas** (manchete → parágrafo da mesma matéria) fica melhor como UMA `docCena` que desce a página.
- **Componente novo no skill:** copie de novo `componentes.js` para `work/<prefixo>_a.js` (o preparar faz isso) antes de montar.
  Senão aparece "X is not defined".
- **Abreu e Lima (PE) foi construída e opera.** Não use a foto dela como "refinaria cancelada". Confira o que cada foto mostra antes de pôr
  numa frase.
- Git Bash troca `a:b:c` por lista de caminhos: `export MSYS_NO_PATHCONV=1` antes do `provas.py`.

## Checklist antes de entregar
- [ ] `ritmo.py`: 9–15 cortes/min (referência 11,5) e nenhum trecho parado. A câmera arranca logo depois do corte, deriva sem parar e tem borrão quando corre; algo novo a cada ~1 s.
- [ ] Fundo BRANCO da marca, texto vinho, provas em duotone vinho→#F2F2F2 + Vermelho V4. Só o apresentador tem cor (tom vinho + luz vermelha V4) e só aparece olhando a câmera.
- [ ] Perfil do apresentador ok no `montar.py` (avatar: 25–35%, peças de 2–4 s).
- [ ] Documentos REAIS (print da página) com marca-texto vermelho no trecho dito, no tempo da palavra. Data, veículo e link nas fontes.
- [ ] Mural visitado 3–5 vezes e crescendo; cada item preso na palavra que o cita; fio vermelho ligando.
- [ ] Tarja nos olhos só até o nome (e em todo anônimo); nome em Morganite vermelha na revelação.
- [ ] Número na tela = dado conferido, com ano e fonte em sans pequena. Nada do que está errado na fala aparece como gráfico.
- [ ] Legenda de UMA palavra (números, datas e nomes juntos) em todas as cenas, menos tipografia e mapa; nada cobre os olhos.
- [ ] Cama grave constante + baque em cada corte. −14 LUFS. checa_fala sem palavra perdida por efeito.
- [ ] **Safe zone da Meta:** legenda, números, nomes, documentos, rosto, logo e botão entre y 420 e 1500 (`safezone.py` + QA).
- [ ] Logo da V4 só o oficial, intacto (reto, opaco, área de proteção); verde só no botão; amarelo ≤ 1 por cena; sem aberração cromática nem neon.
- [ ] Final no apresentador, `fimPerfilInv` com o perfil REAL ou `fimV4Inv` (assinatura da V4 + botão verde). Versão nova `_vN` em `entrega/` e `H:\Downloads\Edicoes_Claude`; fontes com links.
