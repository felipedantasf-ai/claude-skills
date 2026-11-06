"""Fotos e gravuras em RETÍCULA (meio-tom P&B de pontos grossos), o visual das cenas de papel do formato edit-papel.

uso (Python do kit): python reticula.py <projeto> ARQ[:opções] [ARQ2[:opções] ...]
  opções separadas por ':' na ordem  modo:largura:periodo:gama:cx:proporcao   (vazio = padrão)
  modo      recorte  objeto sem fundo (ISNet do kit), pontos pretos sobre transparente             (padrão)
            pessoa   gente sem fundo (U2Net humano do kit; melhor que o ISNet para pessoas)
            cartao   retângulo inteiro (foto de fundo escuro vira o "cartão preto" da referência)
            duo      pôster escuro: pontos CREME/PÊSSEGO sobre transparente (vai em cima do t_preto)
            gravura  traço de gravura/xilogravura (imagem já em linhas): limiar suave, sem pontos
            mascara=<png>  recorte com a máscara dada (branco = fica)
  largura   px da imagem final (padrão 900)        periodo  px entre pontos (padrão 5.5; 4 = fino, 8 = grosso)
  gama      <1 clareia, >1 escurece (padrão 1)     cx       centro horizontal 0..1 para cortar na proporção
  proporcao largura/altura do corte (padrão: a da foto)
Grava render/assets/r_<nome>.png (nome do arquivo sem extensão) e roda o make_assets.py do projeto.
Ex.: python reticula.py teste_papel fotos/sel/erhard.jpg:recorte:820 fotos/sel/ruinas45.jpg:cartao:900:7:1.1:.5:.8
Dica (Git Bash): export MSYS_NO_PATHCONV=1 antes, senão "a:b:c" vira lista de caminhos.
"""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = "H:/Edição Claude/Kit_Edicao_Vox_v2"
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
OUT = os.path.join(P, "render", "assets")
os.makedirs(OUT, exist_ok=True)
TINTA = (21, 20, 19)          # preto de impressão (não 100%)
DUO = (236, 201, 170)         # pêssego/creme do pôster escuro (v3: "hicieron un experimento", espaguete)
SS = 3                        # supersampling dos pontos (anti-serrilhado)
_SESS = {}


def _birefnet(img):
    """BiRefNet_HR na placa (ferramentas/recorte_hq.py do kit); None = sem ambiente de IA, usa o modelo antigo abaixo"""
    try:
        sys.path.insert(0, os.path.join(KIT, "ferramentas"))
        from recorte_hq import mascara
        return mascara(img)
    except Exception:
        return None


def segmenta(img, qual="isnet"):
    """máscara do objeto principal ou de gente: BiRefNet_HR na placa; sem ele, ISNet geral (1024) ou U2Net humano (320)"""
    m = _birefnet(img)
    if m is not None:
        return m
    import onnxruntime as ort
    arq, lado, std = {"isnet": ("isnet-general-use.onnx", 1024, (1.0, 1.0, 1.0)),
                      "pessoa": ("u2net_human_seg.onnx", 320, (0.229, 0.224, 0.225))}[qual]
    if qual not in _SESS:
        so = ort.SessionOptions(); so.intra_op_num_threads = max(2, (os.cpu_count() or 4) // 2)
        _SESS[qual] = ort.InferenceSession(os.path.join(KIT, "modelos", arq), so, providers=["CPUExecutionProvider"])
    sess = _SESS[qual]
    im = np.array(img.convert("RGB").resize((lado, lado), Image.LANCZOS)).astype(np.float32)
    im = (im / max(im.max(), 1e-6) - np.array([0.485, 0.456, 0.406])) / np.array(std)
    out = sess.run(None, {sess.get_inputs()[0].name: im.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
    out = (out - out.min()) / (out.max() - out.min() + 1e-9)
    return Image.fromarray((out * 255).astype(np.uint8), "L").resize(img.size, Image.LANCZOS)


def meio_tom(cob, periodo, ang=45.0):
    """cob = cobertura de tinta 0..1 (HxW). Devolve a cobertura dos PONTOS (0..1), pontos redondos que se fundem no escuro."""
    h, w = cob.shape
    H2, W2 = h * SS, w * SS
    y, x = np.mgrid[0:H2, 0:W2].astype(np.float32) / SS
    c, s = np.cos(np.radians(ang)), np.sin(np.radians(ang))
    u, v = (x * c + y * s) / periodo, (-x * s + y * c) / periodo
    cu, cv = np.floor(u) + .5, np.floor(v) + .5
    du, dv = u - cu, v - cv
    # cor da célula: amostra a imagem suavizada no centro da célula
    xs, ys = (cu * c - cv * s) * periodo, (cu * s + cv * c) * periodo
    suave = ndimage.gaussian_filter(cob, periodo * .45)
    k = ndimage.map_coordinates(suave, [np.clip(ys, 0, h - 1), np.clip(xs, 0, w - 1)], order=1, mode="nearest")
    t = (du * du + dv * dv) / .5                                     # 0 no centro, 1 nos cantos
    lim = np.where(k <= np.pi / 4, 2 * k / np.pi, .5 + .5 * (k - np.pi / 4) / (1 - np.pi / 4))
    tinta = (t < lim).astype(np.float32)
    return tinta.reshape(h, SS, w, SS).mean((1, 3))


def processa(spec):
    parts = spec.split(":")
    if len(parts) > 1 and len(parts[0]) == 1 and parts[1].startswith(("\\", "/")):   # C:\... (letra de unidade)
        parts = [parts[0] + ":" + parts[1]] + parts[2:]
    arq = parts[0] if os.path.isabs(parts[0]) else os.path.join(P, parts[0])
    op = (parts[1:] + [""] * 6)[:6]
    modo = op[0] or "recorte"
    larg = int(op[1] or 900)
    per = float(op[2] or 5.5)
    gama = float(op[3] or 1)
    cx = float(op[4]) if op[4] else None
    prop = float(op[5]) if op[5] else None
    nome = "r_" + os.path.splitext(os.path.basename(arq))[0]
    img = Image.open(arq).convert("RGB")
    if prop:                                                          # corte na proporção, centrado em cx
        W0, H0 = img.size
        if W0 / H0 > prop:
            nw = int(H0 * prop); x0 = int(np.clip((cx if cx is not None else .5) * W0 - nw / 2, 0, W0 - nw))
            img = img.crop((x0, 0, x0 + nw, H0))
        else:
            nh = int(W0 / prop); img = img.crop((0, (H0 - nh) // 2, W0, (H0 - nh) // 2 + nh))
    masc = None
    if modo in ("recorte", "pessoa"):
        masc = segmenta(img, "isnet" if modo == "recorte" else "pessoa")
    elif modo.startswith("mascara="):
        mp = modo.split("=", 1)[1]
        masc = Image.open(mp if os.path.isabs(mp) else os.path.join(P, mp)).convert("L").resize(img.size, Image.LANCZOS)
    if masc is not None:                                              # recorta no objeto + margem
        bb = masc.point(lambda q: 255 if q > 40 else 0).getbbox()
        if bb:
            m = int(.03 * max(img.size))
            bb = (max(0, bb[0] - m), max(0, bb[1] - m), min(img.width, bb[2] + m), min(img.height, bb[3] + m))
            img, masc = img.crop(bb), masc.crop(bb)
    k = larg / img.width
    img = img.resize((larg, max(1, round(img.height * k))), Image.LANCZOS)
    if masc is not None:
        masc = masc.resize(img.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
    g = np.asarray(img.convert("L"), np.float32) / 255
    sel = np.asarray(masc, np.float32) / 255 > .5 if masc is not None else np.ones_like(g, bool)
    lo, hi = np.percentile(g[sel], 1.5), np.percentile(g[sel], 98.5)  # contraste de impressão
    g = np.clip((g - lo) / max(hi - lo, 1e-3), 0, 1) ** gama
    if modo == "duo":
        g = np.clip(g + .6 * (g - ndimage.gaussian_filter(g, 2.2)), 0, 1)
    if modo == "gravura":
        cob = np.clip((1 - g - .25) / .5, 0, 1)                      # traço preto, papel limpo
        cob = ndimage.gaussian_filter(cob, .6)
        rgb, alfa = TINTA, cob
    elif modo == "duo":
        cob = meio_tom(g, per)                                        # pontos = LUZ (creme sobre o preto)
        rgb, alfa = DUO, cob
    else:
        g = np.clip(g + .7 * (g - ndimage.gaussian_filter(g, 2.2)), 0, 1)   # realce de borda: a retícula não vira borrão
        cob = meio_tom(1 - g, per)                                    # pontos = TINTA
        rgb, alfa = TINTA, cob
    if masc is not None:
        alfa = alfa * np.asarray(masc, np.float32) / 255
    out = np.zeros((*alfa.shape, 4), np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = rgb
    out[..., 3] = np.clip(alfa * 255, 0, 255).astype(np.uint8)
    dst = os.path.join(OUT, nome + ".png")
    Image.fromarray(out, "RGBA").save(dst, optimize=True)
    print(f"{nome}: {modo} {out.shape[1]}x{out.shape[0]} período {per:g} -> render/assets/{nome}.png")


for spec in a[1:]:
    processa(spec)
if os.path.exists(os.path.join(P, "make_assets.py")):
    r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print("make_assets:", (r.stdout or r.stderr).strip()[:100], "...")
