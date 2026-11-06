"""Imagens do formato edit-founded (cor de cinema; a cor final vem do CSS do componente, aqui só tamanho e recorte).

uso (Python do kit): python imagens.py <projeto> ARQ:modo[:largura[:cx[:proporcao]]] [...]
  modo     foto     foto em tela cheia -> f_<nome>.jpg, no tamanho que COBRE 1080x1920 com folga de zoom (padrão),
                    com a RETÍCULA SUAVE da referência gravada (RETICULA=.24 força, PERIODO=6 px na tela; RETICULA=0 desliga)
           (quadro de trecho: render/clips/<trecho>/0040.jpg vira f_<trecho>_0040 — foto tirada do vídeo)
           faixa    foto para a faixa letterbox 16:9 -> f_<nome>.jpg com 1600 px de largura
           produto  recorte do produto/objeto sem fundo (ISNet do kit) -> p_<nome>.png (para produtoGira / alta)
  cx, proporcao  corte na proporção largura/altura centrado em cx (0..1), ex.: :::.5:.5625 = 9:16 no centro
Ex.: python imagens.py teste_founded fotos/sacks.jpg:foto fotos/lata.png:produto
Dica (Git Bash): export MSYS_NO_PATHCONV=1 antes, senão "a:b:c" vira lista de caminhos.
"""
import os, subprocess, sys
import numpy as np
from PIL import Image, ImageFilter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
OUT = os.path.join(P, "render", "assets")
os.makedirs(OUT, exist_ok=True)


RETICULA = float(os.environ.get("RETICULA", ".24"))     # força da retícula suave (0 = sem); referência: pontos finos e leves
PERIODO = float(os.environ.get("PERIODO", "6"))         # px entre pontos NA TELA (1080 de largura); a foto é gerada já no tamanho da tela


def reticula_suave(img, per, ang=45.0):
    """retícula de pontos em cima da foto colorida, sem perder a cor (a textura fina da referência)"""
    from scipy import ndimage
    a = np.asarray(img, np.float32) / 255
    L = a @ np.array([.299, .587, .114], np.float32)
    h, w = L.shape; SS = 2
    y, x = np.mgrid[0:h * SS, 0:w * SS].astype(np.float32) / SS
    c, s = np.cos(np.radians(ang)), np.sin(np.radians(ang))
    u, v = (x * c + y * s) / per, (-x * s + y * c) / per
    du, dv = u - np.floor(u) - .5, v - np.floor(v) - .5
    xs, ys = ((np.floor(u) + .5) * c - (np.floor(v) + .5) * s) * per, ((np.floor(u) + .5) * s + (np.floor(v) + .5) * c) * per
    k = ndimage.map_coordinates(ndimage.gaussian_filter(1 - L, per * .45), [np.clip(ys, 0, h - 1), np.clip(xs, 0, w - 1)], order=1, mode="nearest")
    t = (du * du + dv * dv) / .5
    lim = np.where(k <= np.pi / 4, 2 * k / np.pi, .5 + .5 * (k - np.pi / 4) / (1 - np.pi / 4))
    tinta = (t < lim).astype(np.float32).reshape(h, SS, w, SS).mean((1, 3))
    tinta = ndimage.gaussian_filter(tinta, .35)
    # pontos escurecem (multiplica) e o fundo entre eles clareia um pouco: média preservada, cor da foto mantida
    m = (1 - L)[..., None]
    out = a * (1 - RETICULA * (tinta[..., None] - m))
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))


def _birefnet(img):
    """BiRefNet_HR na placa (ferramentas/recorte_hq.py do kit); None = sem ambiente de IA, usa o modelo antigo abaixo"""
    try:
        sys.path.insert(0, os.path.join(KIT, "ferramentas"))
        from recorte_hq import mascara
        return mascara(img)
    except Exception:
        return None


def isnet(img):
    m = _birefnet(img)
    if m is not None:
        return m
    import onnxruntime as ort
    so = ort.SessionOptions(); so.intra_op_num_threads = max(2, (os.cpu_count() or 4) // 2)
    sess = ort.InferenceSession(os.path.join(KIT, "modelos", "isnet-general-use.onnx"), so, providers=["CPUExecutionProvider"])
    im = np.array(img.convert("RGB").resize((1024, 1024), Image.LANCZOS)).astype(np.float32)
    im = im / max(im.max(), 1e-6) - np.array([0.485, 0.456, 0.406])
    out = sess.run(None, {sess.get_inputs()[0].name: im.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
    out = (out - out.min()) / (out.max() - out.min() + 1e-9)
    return Image.fromarray((out * 255).astype(np.uint8), "L").resize(img.size, Image.LANCZOS)


for spec in a[1:]:
    parts = spec.split(":")
    if len(parts) > 1 and len(parts[0]) == 1 and parts[1].startswith(("\\", "/")):
        parts = [parts[0] + ":" + parts[1]] + parts[2:]
    arq = parts[0] if os.path.isabs(parts[0]) else os.path.join(P, parts[0])
    op = (parts[1:] + [""] * 4)[:4]
    modo = op[0] or "foto"
    img = Image.open(arq)
    base = os.path.splitext(os.path.basename(arq))[0]
    if os.path.basename(os.path.dirname(os.path.dirname(arq))) == "clips":       # quadro de um trecho -> f_<trecho>_<quadro>
        base = os.path.basename(os.path.dirname(arq)) + "_" + base
    if op[3]:
        prop, cx = float(op[3]), float(op[2] or .5); W0, H0 = img.size
        if W0 / H0 > prop:
            nw = int(H0 * prop); x0 = int(np.clip(cx * W0 - nw / 2, 0, W0 - nw)); img = img.crop((x0, 0, x0 + nw, H0))
        else:
            nh = int(W0 / prop); img = img.crop((0, (H0 - nh) // 2, W0, (H0 - nh) // 2 + nh))
    if modo == "produto":
        img = img.convert("RGBA")
        if img.getchannel("A").getextrema()[0] > 250:                 # sem transparência: recorta com o ISNet
            m = isnet(img).filter(ImageFilter.GaussianBlur(.8)); img.putalpha(m)
        bb = img.getchannel("A").point(lambda q: 255 if q > 20 else 0).getbbox()
        if bb: img = img.crop(bb)
        larg = int(op[1] or 900); img = img.resize((larg, round(img.height * larg / img.width)), Image.LANCZOS)
        img.save(os.path.join(OUT, f"p_{base}.png"), optimize=True); print(f"p_{base}: produto {img.size}")
        continue
    img = img.convert("RGB")
    if op[1]: larg = int(op[1])
    elif modo == "faixa": larg = 1600
    else: larg = round(img.width * max(1188 / img.width, 2112 / img.height))
    img = img.resize((larg, round(img.height * larg / img.width)), Image.LANCZOS)
    if RETICULA > 0:
        img = reticula_suave(img, PERIODO * larg / 1188 if modo != "faixa" else PERIODO * larg / 1080)
    img.save(os.path.join(OUT, f"f_{base}.jpg"), quality=93); print(f"f_{base}: {modo} {img.size} retícula {RETICULA:g}")
if os.path.exists(os.path.join(P, "make_assets.py")):
    r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print("make_assets:", (r.stdout or r.stderr).strip()[:90], "...")
