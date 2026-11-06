# Brand book da V4 Company (2026): o que vale para os vídeos

Fonte: https://v4-company-brand-book-2026.vercel.app/ (lido inteiro em 28/10/2026, seções `#brand` a `#text_on_background`).
O site é renderizado por JS; as imagens das regras estão em `https://v4-company-brand-book-2026.vercel.app/assets/<arquivo>.png`, com os nomes citados abaixo.

Âncoras das seções: [Marca](https://v4-company-brand-book-2026.vercel.app/#brand) · [Posicionamento](https://v4-company-brand-book-2026.vercel.app/#positioning) · [Proposta de valor](https://v4-company-brand-book-2026.vercel.app/#value_proposition) · [Personalidade](https://v4-company-brand-book-2026.vercel.app/#personality) · [Logo](https://v4-company-brand-book-2026.vercel.app/#logo_main_version) · [Cores](https://v4-company-brand-book-2026.vercel.app/#color_palette) · [Tipografia](https://v4-company-brand-book-2026.vercel.app/#typography) · [Fotografia](https://v4-company-brand-book-2026.vercel.app/#photography) · [Grafismos](https://v4-company-brand-book-2026.vercel.app/#graphics) · [Ícones](https://v4-company-brand-book-2026.vercel.app/#iconography) · [Faça e não faça](https://v4-company-brand-book-2026.vercel.app/#do_and_dont) · [Usos indevidos do logo](https://v4-company-brand-book-2026.vercel.app/#logo_misuse) · [Guia de contraste](https://v4-company-brand-book-2026.vercel.app/#contrast_guide) · [Textos sobre fundo](https://v4-company-brand-book-2026.vercel.app/#text_on_background)

## 1. Cores

### Principal
**Vermelho V4 `#E50914`** (RGB 229 9 20, CMYK 0 99 96 0). Nas palavras do brand book, é a cor que "deve ser sempre a primeira opção na construção de qualquer composição".

### Sistema cromático
| papel | hex | uso |
|---|---|---|
| principal | `#E50914` | fundo e cor dominante |
| secundária | `#FFFFFF` | branco: texto sobre vermelho, cartões |
| secundária | `#F2F2F2` | cinza-claro: papel, fundos claros |
| secundária | `#312D2D` | grafite: texto sobre claro |
| secundária | `#280000` | vinho quase preto: o "preto" da marca, fundos escuros |
| terciária | `#FFDD00` | amarelo: "detalhes e ativação" |

**Proporção.** Medi as áreas do quadro "Sistema cromático" do site:
- vermelho ≈ 58% (830×342 px);
- os quatro neutros ≈ 8% cada, 32% somados (199×198 px cada);
- amarelo ≈ 9% (uma faixa fina de 830×54 px).

Regra prática para o vídeo: **vermelho domina; neutros estruturam; amarelo é só detalhe.**

### CTA (só elementos de ação)
- **Verde `#0E8420`**: o CTA padrão de conversão (botões, links, interações decisórias).
  - O site tem uma divergência. O hex e a cor renderizada são `#0E8420`, mas o RGB escrito é 0 168 107 (= `#00A86B`) e o Pantone é 7724 C.
  - A skill usa **`#0E8420`**, o valor que a página pinta.
- **Amarelo `#FFDD00`**: acento pontual de ativação (Pantone 108 C).
- No digital, o hover do CTA pode migrar para o laranja de apoio.

### Gradientes digitais (fundos de peça, "em tons de vermelho")
Os seis degradês verticais do site, de cima para baixo:
1. `#FFEBC8 → #FFB4A0 → #B4B4BE`
2. `#FF481F → #F0141E → #280000`
3. `#E1DCDC → #E88A70 → #F0141E → #280000`
4. `#FF481F → #650E0F`
5. `#FF481F → #C41E08 → #280001`
6. `#E1DCDC → #E88A70 → #C41E08 → #280001`

O próprio site também usa (CSS):
- títulos: `linear-gradient(to left, #FB2E0A 0%, #E50914 25%, #7A0A02 70%, #560303 100%)`;
- painéis: `linear-gradient(120deg|135deg, #7A0A02, #C41E08 35%, #E50914 65%, #FB2E0A)`, com luz quente `radial-gradient(at 95% 5%, rgba(255,200,170,.85), rgba(255,140,80,.4) 22%, transparent 50%)`;
- fundo escuro: `linear-gradient(160deg, #560303, #8B1205 50%, #C41E08)` e `linear-gradient(#3D0202, #560303)`.

Gradientes impressos (Pantone): 3516 C, 3546 C, 2449 C, 664 C, 486 C, 1815 C. O site avisa que é preciso teste de cor antes de imprimir.

### Contraste aprovado: texto sobre fundo liso (`Coressobrefundoerradas.png`)
| fundo | texto corrido (pequeno/normal) | texto GRANDE |
|---|---|---|
| vermelho `#E50914` | só `#FFFFFF` | `#FFFFFF`, `#F2F2F2`, `#FFDD00`, `#280000` |
| vinho `#280000` | `#FFFFFF`, `#F2F2F2`, `#FFDD00` | `#FFFFFF`, `#F2F2F2`, `#FFDD00`, `#E50914` |
| branco `#FFFFFF` | `#312D2D`, `#280000`, `#E50914` | `#312D2D`, `#280000`, `#E50914` |

Reprovados:
- **sobre vermelho**: `#F2F2F2`, amarelo, `#312D2D` e `#280000` em texto corrido; `#312D2D` mesmo grande;
- **sobre vinho**: vermelho em texto corrido; `#312D2D`;
- **sobre branco**: amarelo e `#F2F2F2`.

O guia geral de contraste (`Contrasteerrado.png`) marca vermelho sobre `#312D2D`/`#280000` e amarelo sobre branco/cinza como reprovados, e alguns pares só para "componentes gráficos e textos grandes".

## 2. Tipografia
- **IBM Plex Sans**: a tipografia de sistema, para tudo. A hierarquia vem de peso e tamanho.
  - Exemplo do site: "Apenas resultado importa."
  - Google Fonts: https://fonts.google.com/specimen/IBM+Plex+Sans (OFL).
  - Na skill: `fonts/IBMPlexSans.ttf` e `IBMPlexSans-Italic.ttf`, variáveis (wght 100–700, wdth).
- **Morganite**: "títulos de impacto" e chamadas comerciais. Condensada, em caixa alta, usada **pontualmente** e em contraste com a Plex.
  - Exemplo do site: "GROWTH IS THE NEW BLACK".
  - O botão "BAIXAR MORGANITE" leva a https://befonts.com/morganite-font-family.html. A fonte é de Rajesh Rajput, 2018, distribuída como gratuita.
  - O próprio brand book serve os arquivos: `assets/fonts/Morganite-Bold.ttf` e `Morganite-SemiBold.ttf`. Estão na skill em `fonts/`.
- **Fjalla One**: a alternativa oficial à Morganite, quando ela não estiver disponível.
  - Google Fonts: https://fonts.google.com/specimen/Fjalla+One. Na skill: `fonts/FjallaOne-Regular.ttf`.
- A submarca "Inimigos da Inércia" (link no topo do site) usa só a IBM Plex Sans.

**Não é preciso pedir fonte ao Felipe:** as três estão na skill.

## 3. Logo
- **Versão única** (o símbolo "V4": quadrado arredondado com o V e o 4 vazados).
  - Pode ir sobre qualquer cor da paleta institucional.
  - Aplicações mostradas: branco sobre preto, branco sobre vermelho, vermelho sobre branco (`APlicacoestodas.png`, `logofotos.png`).
- **Arquivos oficiais:** o botão "BAIXAR AS LOGOS" baixa https://v4-company-brand-book-2026.vercel.app/assets/v4-logos.zip.
  - Na skill: `logo/LogoV4Branca.svg` e `logo/LogoV4Vermelha.svg` (`#E50914`), mais o zip original.
  - O site avisa: "Sempre utilize os originais eletrônicos".
- **Área de proteção** (`Foto_Luegos.png`): a margem livre em volta do logo é **x = espessura do "4"**, cerca de 14% da largura do símbolo.
- **Tamanho mínimo:** 0,7 mm no impresso (provável erro do site; o valor esperado seria ~7 mm) e **50 px** no digital.
- **Usos indevidos** (`Naologo.png`), além de "não modificar nem acrescentar elementos":
  - não distorcer;
  - não alterar a cor (o exemplo mostra o logo em laranja);
  - não usar transparência;
  - não rotacionar.
- **Na skill:**
  - o logo só entra pelos SVG oficiais (`logoV4()`): branco sobre vermelho/vinho, vermelho sobre branco;
  - sempre reto, opaco e com área de proteção;
  - nunca redesenhado, recortado, gerado ou animado por partes (só entra inteiro: corte, desfoque ou escala uniforme).

## 4. Fotografia
- Profissionalismo e excelência, em dois formatos:
  - **posada**, com direção e acabamento refinado;
  - **ambientada e espontânea**, com naturalidade e contexto real.
- **Fotos oficiais de colaboradores:**
  - meio-corpo, rosto bem legível, olhar para a câmera no institucional;
  - fundo em **degradê radial vermelho**, com recorte limpo;
  - versões retangular (materiais e site) e **circular** (avatares);
  - figurino neutro (preto, cinza, vinho e vermelho fechado aparecem nos exemplos), luz uniforme e natural, sem filtros.
- **Luz:**
  - nas ambientadas, natural;
  - nas posadas, bem distribuída, sem sombra dura;
  - "brancas ou **sutilmente avermelhadas**".
  - Exemplos: `luzfoto.png`, `figurinofoto.png`, `actingfoto.png`, `DiretrizesFotosOficiaisBig.png`, `Fueto.png` (silhueta contra fundo vermelho segurando o símbolo em vidro).

## 5. Grafismos
- **Reverberação** (`#graphics_reverb`): o contorno do símbolo (quadrado/retângulo de cantos arredondados) repetido em camadas concêntricas, como um eco que dá movimento. O site pede **"uma leve sombra em cada camada"**. Três variantes:
  - **Normal** (`ReverbFoto.png`): camadas translúcidas claras empilhadas sobre o vermelho, cada uma com sombra suave.
  - **Gradiente** (`Reverbgradiente.png`): camadas que escurecem para o vinho, como um túnel.
  - **Linhas** (`grafismolinhas.png`): só contornos brancos finos, alternando linha cheia e tracejada.
- **Perspectiva** (`PerspectiveGrafismofoto.png`): a mesma reverberação em perspectiva, como túnel ou piso. Dá profundidade.
- **Liquid Glass** (`#graphics_glass`): o símbolo ou as formas em vidro vermelho translúcido.
  - Receita do Figma: 4 inner shadows brancas em overlay (blur 150/10/10/100), Glass (luz −45° 80%, refração 92, profundidade 23, dispersão 100, frost 5) e drop shadow X−5 Y5 blur 20 a 10%.
  - Para IA: "red translucent glass/acrylic, glossy, frosted diffused glass, translucent refraction, light diffusion, glassmorphism, 3D render, hyperrealistic, studio/gradient/red background".
  - **Os botões "BAIXAR COMPONENTE HTML" (`v4-glass-effect.html`, `v4-reverb-*.html`) dão 404 no site (testado em 28/10/2026).**
- A **textura** da marca é a do degradê e do vidro. O brand book não tem papel, grão ou retícula: isso é do formato Vox. A skill mantém o grão leve do kit.

## 6. Ícones
Quatro estilos, do mais ilustrativo ao mais funcional (`IconesFuetos.png`):
- **Ilustrativo** (vidro vermelho);
- **Híbrido** (pasta vermelha com contorno branco);
- **Outline**;
- **Fill**.

O sistema base é o Google Material Symbols **Rounded**, com peso e grade ajustáveis (`IconesSistema.png`): https://fonts.google.com/icons. Ícones em branco sobre vinho ou vermelho.

## 7. Tom de voz e personalidade
- **Propósito:** "Destravar a receita".
- **Pilares operacionais:** DIAGNOSTICA → PLANEJA → EXECUTA → GERE EM LOOP.
  - "Quatro tempos. Toda operação V4 passa pelos quatro antes de declarar receita previsível."
  - "Cadência semanal, dado antes de opinião, execução até virar resultado."
- **Personalidade:**
  - **DIRETO E RETO**: prefere o que funciona ao marketing bonito que não vende; não enrola nem complica: "a gente vai e faz".
  - **SANGUE NOS OLHOS**: joga para ganhar; o que move é ver o número, as vendas e os empreendedores crescerem.
  - **SEMPRE À FRENTE**: olha para o que ainda dá para fazer; lidera e leva os empreendedores junto.
- **Assinaturas do site:** "Apenas resultado importa.", "Growth is the new black", "Inimigos da inércia".
- **Na edição:**
  - frases curtas na tela;
  - números grandes com fonte;
  - verbos de ação;
  - nada de floreio, nada de "marketing bonito".
- **Submarca "Inimigos da Inércia"** (https://inimigosdainercia-bb.vercel.app/): é a coleção de roupas da cultura V4, não a marca dos vídeos. Tom: "Atitude & Movimento", "Sistêmica & Código", "Elite & Exclusividade"; barras duplas "//" como trilhos; vermelho `#EE1A00`. **Não usar nos vídeos**, salvo pedido.

## 8. O que a marca proíbe (resumo)
1. Modificar o logo ou somar elementos a ele: distorcer, mudar a cor, transparência, rotação. Usar outro arquivo que não o original.
2. Texto em combinação de contraste reprovada (seção 1).
3. Verde ou amarelo fora de CTA, detalhe ou ativação. O verde é **só** botão ou ação.
4. Fotos com filtro, luz dura, figurino com ruído ou fundo fora do padrão nas fotos oficiais.
5. Grafismo sem a leve sombra por camada (reverberação).
6. Morganite em texto corrido. Ela é pontual, para impacto.

## 9. Como a skill traduz isso para o Vox premium
- **Mesa:** papel VERMELHO V4 (`t_v4.jpg`): a fibra do papel sobre `#E50914`, com uma luz quente fraca no canto de cima e o degradê da marca escurecendo para `#650E0F` no canto de baixo.
- **Viradas:** tela VINHO `#280000` (ou o degradê escuro `#560303 → #8B1205 → #C41E08`).
- **Papéis e cartões:** brancos (`#FFFFFF`/`#F2F2F2`).
- **Fala:**
  - IBM Plex Sans BRANCA sobre o vermelho (o único par aprovado para qualquer tamanho);
  - VINHO sobre papel branco;
  - destaque em AMARELO só em palavra-chave grande.
- **Impacto:** números e títulos de impacto em Morganite, pontuais (1 por cena no máximo).
- **Grafismo-assinatura:** reverberação (`reverb()`) atrás de dados, fotos e do logo; o liquid glass só discreto (`vidro()`), sem brilho neon.
- **Logo:** só os SVG oficiais (`logoV4()`), no fim e, se fizer sentido, no início.
- **Verde `#0E8420`:** só no botão Seguir do final.
