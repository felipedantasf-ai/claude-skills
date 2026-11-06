---
name: vox-fernando
description: Formato de edição dos vídeos do Fernando Miranda (@fernandomiranda777), verticais 9:16, feitos com o Kit_Edicao_Vox_v2. É o Vox editorial premium com a identidade dele. A mesa é papel LARANJA e as cores são VERMELHO, BRANCO e PRETO. O vídeo usa fotos reais impressas, logos reais das empresas citadas, dados com fonte e a fala em serifa preta. O Fernando aparece ~20 vezes, de 3 a 5 s, alternando tela dividida, círculo e tela cheia, só enquanto olha a câmera, e o final mostra o celular com o perfil real dele. Use quando chegar uma gravação do Fernando (camiseta preta, escritório laranja ou branco) ou o pedido for "skill do Fernando", "formato do Fernando" ou "vox laranja".
---

# Formato vox-fernando

Criado em 27/10/2026 a pedido do Felipe: "uma skill especial para o Fernando que é usando esse formato vox e os ajustes que já aplicamos, o que vai mudar é que o fundo cinza passa agora a ser laranja e as cores principais são vermelho, branco e preto".

A skill reúne o que deu certo nos três vídeos do Fernando:
- NordesteEmpresas (`projetos/fernando3`);
- FlavioEmpresarios (`fernando4`);
- LulaGanhouEmpresa (`fernando5`).

**Antes de planejar, abra `referencia_fernando.jpg`**: são 16 quadros do visual.

Esta skill complementa a **vox-editorial** e o **CLAUDE.md do kit**, não os substitui. A vox-editorial precisa estar instalada ao lado (`~/.claude/skills/vox-editorial`). Dela, esta skill usa:
- `componentes.js`, que vira o `<xx>_a.js`;
- `preparar_formato.py`, `montar.py`, `previas.py` e `prep_prints.py`.

No PC do Felipe, leia também as memórias:
- `vox-video-pipeline` (seções fernando3/4/5);
- `perfil-instagram-cta`;
- `presenter-olhar-camera`;
- `vox-editorial-style`.

Em outro PC essas memórias não existem. As regras que importam estão nesta página.

**O kit (`<kit>`)** é a pasta do Kit_Edicao_Vox_v2:
- no PC do Felipe, `H:\Edição Claude\Kit_Edicao_Vox_v2`;
- em outro PC, a pasta da variável de ambiente `VOX_KIT` (veja **Instalação em outro PC**).

Rode tudo na raiz do kit, com o Python do kit: `<kit>\.venv\Scripts\python.exe` se a `.venv` existir, senão `python`. Os scripts desta pasta e da vox-editorial aceitam o nome do projeto (procuram em `<kit>/projetos/`) ou o caminho completo.

## Arquivos desta pasta
| arquivo | para quê |
|---|---|
| `componentes_fernando.js` | Biblioteca do formato, que vira o `work/<xx>_b.js`. Traz a paleta, a mesa laranja, o apresentador, mapas, fotos, dados, logos, matéria, o celular com o perfil real e ~30 objetos desenhados. |
| `cenas_exemplo.js` | Exemplo completo: as 37 cenas do LulaGanhouEmpresa nesta paleta. Copie padrões daqui. As fotos e logos citadas são daquele vídeo e não vêm no pacote. Projeto de teste (só no PC do Felipe): `projetos/teste_fernando`. |
| `referencia_fernando.jpg` | O visual em 16 quadros. |
| `preparar_fernando.py` | Prepara um projeto novo: formato, biblioteca, assets, ferramentas, `etapas.json` e limpeza do `build_edl.py`. |
| `olhar.py` | Conferência do olhar do Fernando: varredura do vídeo inteiro ou faixas de 0,1 s por janela. |
| `sincronia.py` | Confere se os quadros são do corte atual e se a boca bate com o áudio, no projeto e no arquivo entregue. |
| `logos_tinta.py` | Passa as logos reais para a paleta: tinta preta, ou cor real com `:cor`. |
| `t_laranja.jpg` | Textura da mesa (fibra do papel sobre o laranja). |
| `modelo/` | Pipeline do projeto de referência (LulaGanhouEmpresa). Traz o `build_edl.py` com a configuração zerada, `mix.py`, `entregar.py`, `render/engine.js`, as texturas e os recortes do perfil real, mais `tools/` e `fotos/`. O `preparar_fernando.py` copia daqui. |

## Instalação em outro PC (time do Felipe)
1. Copie as pastas `vox-fernando` e `vox-editorial` para `%USERPROFILE%\.claude\skills\`. As duas são obrigatórias.
2. O PC precisa do **Kit_Edicao_Vox_v2 na versão atual do Felipe**, instalado pelo `instalar_windows.bat` do kit (Python, FFmpeg, Node, Chromium e modelos). A versão precisa ter `pipeline.py preparar|fechar`, `render.py`, `make_assets.py`, `ferramentas/` e `tools/splice.py`. Kit antigo, sem o `pipeline.py`, não serve.
3. Se o kit não estiver em `H:\Edição Claude\Kit_Edicao_Vox_v2`, crie a variável `VOX_KIT` com a pasta dele e reabra o Claude Code. Exemplo: `setx VOX_KIT "C:\Edicao\Kit_Edicao_Vox_v2"`.
4. As fontes Sitka já vêm no Windows (`C:\Windows\Fonts\SitkaVF*.ttf`).
5. Para testar, rode `preparar_fernando.py` sem argumentos: ele mostra o modo de uso.

## A identidade (não negociar)
1. **Mesa laranja.**
   - O fundo de quase todas as cenas é `paperBg(r)`: papel laranja `#ee6a1f` com fibra.
   - Tela cheia de outra cor só nas viradas, com `fundo(r, PRETO)`. O final usa `fundo(S.A, VERMELHO)`.
2. **Cores:** `VERMELHO` `#d3261b`, `BRANCO` `#f7f3ec` e `PRETO` `#141414`, mais `CINZA_C` para tons neutros.
   - **Laranja é só a mesa** (e o marca-texto). Nunca use LARANJA como bloco ou objeto, porque some no fundo. Nada de amarelo, azul ou verde.
   - Bloco atrás de foto: PRETO (padrão) ou VERMELHO. Atrás de objeto preto (cartola, megafone), BRANCO.
   - Traço à mão: BRANCO sobre o laranja, PRETO ou VERMELHO sobre papel branco.
   - Carimbo: PRETO ou BRANCO sobre o laranja. VERMELHO só sobre papel branco ou foto.
   - Faixa-rótulo: PRETA com letra branca (padrão), ou VERMELHA para destaque.
   - Dados:
     - colunas em preto, branco, cinza e vermelho;
     - número grande PRETO na mesa, ou BRANCO sobre bloco preto ou vermelho;
     - selo branco com texto preto, ou vermelho com texto branco (`selo()` escolhe sozinho).
   - Mapas: Brasil BRANCO sobre o laranja, destaque VERMELHO ou PRETO, rotas pretas tracejadas.
   - Barra de progresso branca.
3. **Legenda (`S.cap`):**
   - sobre o laranja: serifa PRETA, `CT` (modo `dark`, palavra-chave em itálico);
   - em tela preta ou vermelha: `CT_CLARA`;
   - sobre foto ou sobre o Fernando: `glow` (`CGLOW`, y 1740 na tela dividida; y ≈1460 na tela cheia);
   - mapas e quadros cheios: `CTAG` (topo) ou `CTAGB` (embaixo).
4. **Fotos reais** do Commons:
   - impressas em P&B com retícula leve: `FORCA=.25 tools/meio_tom.py arq:cx:prop:pb:9`;
   - borda branca e fita creme, caindo na palavra exata;
   - créditos no fontes;
   - rosto real ou marca gerados por IA só com OK do Felipe (pergunte antes).
5. **Logos reais das empresas citadas** (pedido fixo do Felipe):
   - cartão branco `logo()` com a logo em tinta preta (`logos_tinta.py`);
   - logo já vermelha ou preta pode ficar com a cor real (`:cor`);
   - empresa sem logo livre ganha cartão com o nome em serifa.
6. **Premium Vox:**
   - movimento pela câmera (`mesa().cam`) e pelas entradas `pousa`, `entra` e `revela`;
   - um estímulo novo a cada 1,5–2,5 s, ligado à palavra exata;
   - sem raios, formas, cortina, neon, brilho ou ícone grande.
7. **Som:** sons táteis do kit, **sem música** (só se o Felipe pedir).

## O Fernando na tela (pedidos do Felipe)
- **~20 aparições de 3 a 5 s no máximo.**
  - Alterne tela dividida (`presMetade`/`metade`), círculo (`presBola`/`bola`) e tela cheia (`pres4(beats, PT)`).
  - Nunca duas cenas seguidas com ele.
  - Distribua pelo vídeo, nas frases de opinião, nas perguntas, nas viradas e no fim.
- **Só enquanto ele olha a câmera** (25/10).
  - Piscada de até ~0,3 s tudo bem.
  - Olhar para baixo, cabeça virada ou olhos fechados por 0,4 s ou mais saem da janela. Para isso:
    - na tela cheia: `lead` negativo no `pres4`, ou `lead` maior na cena seguinte;
    - no círculo: `S.J`;
    - na tela dividida: o fim (`J1`) ou o `lead` da cena.
  - Ele lê o roteiro abaixo da câmera com frequência. Se não houver trechos limpos para ~20, faça menos e avise o Felipe: no FlavioEmpresarios ficaram 14, no LulaGanhouEmpresa 15. Não force.
- **Texto nunca sobre os olhos.** O círculo fica no alto (y 450–650), no canto oposto ao assunto e longe da legenda do topo.
- **Enquadramento.** A gravação é horizontal, 1920×1080 a 30 fps, com o rosto em x ≈1000–1090. Confira num quadro de `work/frames_largos`, porque muda com o cenário.
  - `--rosto-x` do preparar centraliza os quadros largos: 980 no escritório laranja, 1040 no branco.
  - `presBola(r, S, cx, cy, d, z, fy, fx)`: o padrão é z 2.0, fy .60, fx .555 (cabeça, ombros e peito). No escritório branco (fernando4) foi z 2.1, fy .66.
  - `presMetade(r, S, 'baixo', {z, fy, yt})`: o padrão é z 1.12, fy .56, yt 420.
- **Final.**
  - Celular com o **perfil REAL** sobre papel vermelho. Usa `celular()` com os recortes `perfil_avatar` e `perfil_texto`, que o preparar copia de `modelo/`. O print inteiro fica em `biblioteca/perfil_fernandomiranda777.png`, no kit do Felipe.
  - "Seguir" vira "Seguindo ✓" na última palavra forte.
  - Ele costuma fechar com "Meu nome é Fernando Miranda" e "bora construir Brasil". No nome, a faixa com nome e @ (exemplo no FlavioEmpresarios v2, S40).

## Passo a passo
1. **Ingestão:** `pipeline.py preparar <nome> "<pasta>/<arquivo>.mp4"` (no PC do Felipe, os vídeos chegam em `H:/Downloads`).
2. **Formato:** `preparar_fernando.py <nome> --prefixo xx --rosto-x <x>`.
3. **Corte**, preenchendo o `build_edl.py`:
   - `fix`, `DROP` e `CUT_TAIL` para retakes e falsos começos;
   - `MANUAL_ON`/`MANUAL_OFF`;
   - `PROTEGE` para finais baixos ("cha-to", "por cen-to") que o aperto comia;
   - `TAIL_FIX` para a última palavra.

   Depois rode `pipeline.py preparar <nome>`. A meta é zero silêncio ≥ 0,15 s; confira as palavras de borda com `tools/asr_janelas.py`.
   - **Depois de QUALQUER mudança no `build_edl.py`, rode `pipeline.py preparar <nome>` de novo** (ele refaz os quadros quando o corte muda) e depois `sincronia.py <nome>`.
   - Nunca rode `build_edl.py` sozinho. Os quadros ficam do corte antigo e a boca escorrega: isso aconteceu no LulaGanhouEmpresa v1.
4. **Olhar:** `olhar.py <nome> varredura` e anote os trechos em que ele olha a câmera.
5. **Checagem dos fatos ANTES do plano.**
   - Pesquise cada número, empresa, data e resultado, e guarde os links.
   - Número errado não vai para a tela (a fala não muda).
   - Liste os avisos: o que a fala diz, o valor certo e a fonte.
6. **Plano de cenas:** as ~20 aparições nos trechos com olhar, alternando as formas; o resto com fotos reais, logos, dados, mapas e objetos desenhados (copie de `cenas_exemplo.js`).
7. **Imagens:**
   - fotos do Commons: `fotos/busca_prev.py` → `folha.py` → `baixa_sel.py` → `tools/meio_tom.py` (`export MSYS_NO_PATHCONV=1` no Git Bash);
   - logos: `fotos/busca_logos.py`, ou a `pageimages` da Wikipedia + `Special:Redirect/file`, e depois `logos_tinta.py`;
   - no fim, `make_assets.py`.
8. **Cenas** em `work/xx_c.js`, `xx_d.js`… Depois: `montar.py <nome> xx` (da vox-editorial) → `previas.py <nome>`. Abra as folhas, corrija e confira o olhar das janelas finais: `olhar.py <nome> t0-t1 t0-t1 …`.
9. **Render e QA:**
   - `pipeline.py fechar <nome> <Nome> --ate qa`;
   - olhe TODAS as folhas `out/qa_*.jpg`;
   - conserte só os trechos com `render.py video T0 T1 out/seg.mp4` + `tools/splice.py out/master.mp4 … seg:QUADRO`;
   - rode `render.py events`;
   - entregue com `pipeline.py fechar <nome> <Nome> --desde mix --destino "<pasta de entrega>"` (`H:/Downloads/Edicoes_Claude` no PC do Felipe).
   - Se a checagem da mix recusar ("palavra perdida com efeito perto"), tire o som do início da palavra e rode `--desde mix` de novo.
10. **Entrega** na pasta de entrega (`H:\Downloads\Edicoes_Claude` no PC do Felipe):
    - `<Nome>_vN_tiktok.mp4`, `_MASTER.mp4` e `_fontes.md` (checagem, avisos e créditos de fotos e logos);
    - confira com `sincronia.py <nome> "<pasta de entrega>/<Nome>_vN_tiktok.mp4"`;
    - nunca sobrescreva: cada ajuste é uma `_vN` nova.
11. **Mensagem final** para quem pediu (português, curta):
    - o que saiu e onde;
    - quantas aparições do Fernando (e por que, se menos de 20);
    - custo;
    - avisos com o valor certo e a fonte;
    - **Fontes:** em links.

## Componentes (`componentes_fernando.js`)
- **Paleta e mesa:**
  - `LARANJA`, `VERMELHO`, `VERM_E`, `PRETO`, `TINTA`, `BRANCO`, `CINZA_C`, `MKL` (marca-texto);
  - `paperBg(r, {cor, b})`, `fundo(r, cor)`, `bloco(p, cor, x, y, w, h, rot)`, `camada`, `trocaC`;
  - legendas: `CT`, `CT_CLARA`, `CTAG`, `CTAGB`, `CGLOW`.
- **Movimento:**
  - câmera: `mesa(r)` com `.cam(s, px, py)`;
  - entradas: `pousa`, `entra`, `revela`, `cresce`.
- **Apresentador:**
  - `pres4(beats, PT)` ou `pres4(beats, {...PT, lead})`;
  - `presMetade(r, S, 'baixo', o)` + `metade(ph, lt, t0, t1)`;
  - `presBola(r, S, cx, cy, d, z, fy, fx)` + `bola(ph, lt, t0, t1)`;
  - `JB(c, b0, b1)`.
- **Papel e texto:** `papel`, `linhas`, `doc`, `nota`, `rotulo`, `fonte`, `FTAG`, `materia(p, cx, cy, w, h, {veiculo, secao, titulo, fina, corpo})` com `.mk(k, q)`, `posDe`.
- **Fotos:** `foto(p, 'print_x', cx, cy, w, {rot, tape})`, `pilha` + `pilhaAt` + `pilhaSom`, `fotoTopo`, `duo` (duotone).
- **Dados:** `barraH`, `barraV`, `selo`, `dado(p, num, cx, cy, {s, c, sub, sc})`, `tijolo`, `logo(p, 'lg_x', cx, cy, w)`.
- **Mapas:**
  - `mapaBR(r, {lon, lat, z, cy})` com `.pinta(UFs, cor)` e `.uf.SP`;
  - `M.hl('Venezuela', cor)`, `pinoMapa`, `rotMapa`, `rotaSeta`, `voo`, `TODAS_UF()`.
- **Final:** `celular(p, w, cx, cy)`, que expõe `.bt` (botão), `.pos.seguir` e `.sv`.
- **Objetos desenhados:**
  - `buraco`, `termometro`, `campo` + `ficha`, `dial`, `balanca`, `cofre`, `cheque`, `etiqueta` (`.seta`);
  - `tesoura`, `moedas`, `portaAco`, `placaPrecisa`, `relogio`, `silhueta`, `ima`, `setaTexto`, `saco`;
  - `quadroVagas`, `placaLoja`, `cartola`, `nuvem`, `sol`, `caneta`, `megafone`, `urna`, `engrenagens`.
- **Do kit e da vox-editorial:** `printPhoto`, `inkStamp` + `stampIn`, `serifText`, `typeIn`, `scribble`, `roughRing`, `sparkleD`, `receipt`, `clipping`, `kf`, `ez`, `E`, `tx`, `soft`, `cue`.

## Armadilhas já resolvidas (não repetir)
- **Quadros de outro corte.** Boca fora de sincronia e "cortes errados" vêm daí. Rode sempre `pipeline.py preparar` depois de mexer no corte e confira com `sincronia.py`.
- **O apresentador conferido nos quadros errados.** Refazer os quadros obriga a refazer a conferência do olhar.
- **Cor que some no fundo.**
  - Bloco ou objeto LARANJA some na mesa.
  - Objeto preto sobre bloco preto também (a cartola do exemplo vai sobre bloco branco).
  - Legenda `dark` sobre vermelho ou preto também: use `CT_CLARA`.
- **Som sobre a fala.** Som em cima do começo de uma palavra mascara a fala, e a checagem da mix recusa a entrega ("a apuração", "caneta", "atraídos"). Ponha o som entre palavras.
- **Cena que abre vazia.** O 1º quadro de cada cena deve vir completo: o elemento principal já entra em `lt` −0,3. Uma cena com `lead` positivo e a 1ª peça em `lt` 0,2 deixou 0,2 s de mesa vazia.
- **Âncora na última palavra de um beat.** Dê `lead` negativo à cena seguinte, senão o elemento aparece por menos de 0,3 s.
- **Câmera da mesa na tela dividida.** `mesa.cam(s, px, py)` centraliza em y 960: na metade de cima, use escala com `transform-origin: 540px 480px`.
- **Transform sobrescrito.** `tx()`/`live()` reescrevem o transform: um controlador por elemento. Para centralizar, `e._base = 'translate(-50%,-50%)'`.
- **Palavra-âncora que não existe.** `c.w('Bxx', 'palavra')` devolve a 1ª palavra do beat sem avisar. O `montar.py` confere.
- **Junções.** Projetos ligados por junção (`mklink /J`) só se apagam com `cmd //c rmdir`, nunca com `rm -rf`.

## Checklist antes de entregar
- [ ] `sincronia.py`: quadros == corte, boca × áudio no 0 ou ±1, arquivo entregue com áudio a ±20 ms.
- [ ] Fernando: ~20 aparições (ou menos, avisado), de 3 a 5 s, formas alternadas, nunca seguidas, todas olhando a câmera (`olhar.py` nas janelas finais).
- [ ] Só laranja (mesa), vermelho, branco e preto; nenhum bloco laranja; legenda legível em toda cena.
- [ ] Fotos e logos reais, com créditos; todo número com fonte e ano; nada errado na tela.
- [ ] Zero silêncio ≥ 0,15 s e palavras de borda inteiras.
- [ ] Mix em −14 LUFS e pico −2 dBTP, sem música; checagem da mix sem palavra mascarada.
- [ ] Perfil real no celular do final.
- [ ] `_vN` nova em `entrega/` e na pasta de entrega, com o `_fontes.md`.
