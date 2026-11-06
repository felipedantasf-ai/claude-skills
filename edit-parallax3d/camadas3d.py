"""Camadas de profundidade de uma foto para o palco 3D (edit-parallax3d).

A foto vira 2–4 camadas em PNG/WebP com transparência, do fundo para a frente. O fundo e as camadas do meio têm o buraco
atrás de quem está na frente preenchido pelo LaMa, então a câmera pode passar de lado sem abrir "sombra".

uso: python camadas3d.py <projeto> FOTO --nome x [--cortes .45,.72] [--objeto] [--limiar .5] [--recorte x0,y0,x1,y1] [--lado 3200]
  -> render/assets/p3_<x>_0.jpg (fundo), p3_<x>_1.webp ... (frente), out/p3_<x>_folha.jpg (prévia), e render/assets.js
--cortes   onde a profundidade corta (0 = longe, 1 = perto, em percentis da foto). 1 corte = 2 camadas, 2 cortes = 3 camadas
           (padrão .5,.78). Abra a folha e ajuste: o carro/pessoa principal tem de cair INTEIRO numa camada só.
--objeto   o objeto principal (recorte do ISNet, borda limpa) vira uma camada a mais, na frente de tudo; os cortes
           separam o resto (chão, meio, fundo). Use para carro, pessoa, produto.
--limiar   corte da máscara do ISNet (padrão .5)
--recorte  usa só um pedaço da foto (px da original)
--lado     maior lado final (padrão 3200; o palco precisa de ~1,3× a altura da tela)
Modelos (uma vez, na raiz do kit): python baixar_modelos.py --sem-recorte --parallax3d
"""
import json, os, sys
import numpy as np
import cv2
import onnxruntime as ort
from PIL import Image

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
a = sys.argv[1:]
if len(a) < 2 or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
PROJ = os.path.abspath(a[0])
FOTO = a[1] if os.path.isabs(a[1]) else os.path.join(PROJ, a[1])
NOME = opt("--nome", os.path.splitext(os.path.basename(FOTO))[0])
CORTES = [float(x) for x in opt("--cortes", ".5,.78").split(",")]
LADO = int(opt("--lado", 3200))
KIT = os.environ.get("VOX_KIT", r"H:\Edição Claude\Kit_Edicao_Vox_v2")
M = os.path.join(KIT, "modelos")
ASSETS = os.path.join(PROJ, "render", "assets")
AJS = os.path.join(PROJ, "render", "assets.js")
os.makedirs(ASSETS, exist_ok=True); os.makedirs(os.path.join(PROJ, "out"), exist_ok=True)
for f in ("depth_anything_v2_small.onnx", "lama_fp32.onnx"):
    if not os.path.exists(os.path.join(M, f)):
        sys.exit(f"falta {f} em {M}: rode  python baixar_modelos.py --sem-recorte --parallax3d  na raiz do kit")
so = ort.SessionOptions(); so.intra_op_num_threads = max(2, (os.cpu_count() or 4) // 2)
sess = lambda f: ort.InferenceSession(os.path.join(M, f), so, providers=["CPUExecutionProvider"])

img = Image.open(FOTO).convert("RGB")
if opt("--recorte"):
    img = img.crop(tuple(int(v) for v in opt("--recorte").split(",")))
if max(img.size) > LADO:
    k = LADO / max(img.size); img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
W, H = img.size
rgb = np.array(img)


def profundidade():
    """Depth Anything V2 small: devolve 0..1 (1 = perto), no tamanho da foto, normalizado por percentis"""
    s = 518 / max(W, H)
    w14, h14 = max(14, round(W * s / 14) * 14), max(14, round(H * s / 14) * 14)
    x = np.array(img.resize((w14, h14), Image.BICUBIC)).astype(np.float32) / 255
    x = (x - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    d = sess("depth_anything_v2_small.onnx").run(None, {"pixel_values": x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0]
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    d = cv2.bilateralFilter(d.astype(np.float32), 9, float(d.std() * .5), 9)        # suaviza sem borrar as bordas
    lo, hi = np.percentile(d, 2), np.percentile(d, 98)
    return np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)


def _birefnet(img):
    """BiRefNet_HR na placa (ferramentas/recorte_hq.py do kit); None = sem ambiente de IA, usa o modelo antigo abaixo"""
    try:
        sys.path.insert(0, os.path.join(KIT, "ferramentas"))
        from recorte_hq import mascara
        return mascara(img)
    except Exception:
        return None


def isnet():
    m = _birefnet(img)
    if m is not None:
        return cv2.resize(np.asarray(m, np.float32) / 255, (W, H), interpolation=cv2.INTER_LINEAR)
    x = np.array(img.resize((1024, 1024), Image.LANCZOS)).astype(np.float32)
    x = (x / max(x.max(), 1e-6) - [0.485, 0.456, 0.406]) / 1.0
    s = sess("isnet-general-use.onnx")
    o = s.run(None, {s.get_inputs()[0].name: x.transpose(2, 0, 1)[None].astype(np.float32)})[0][0, 0]
    o = (o - o.min()) / (o.max() - o.min() + 1e-9)
    return cv2.resize(o, (W, H), interpolation=cv2.INTER_LINEAR)


LAMA = None


def preenche(im, buraco):
    """LaMa num recorte em volta do buraco (512×512), colado de volta só dentro do buraco (com borda suave)"""
    global LAMA
    if buraco.sum() < 50:
        return im
    LAMA = LAMA or sess("lama_fp32.onnx")
    ys, xs = np.nonzero(buraco)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    lado = int(max(y1 - y0, x1 - x0) * 1.35) + 64
    lado = min(max(lado, 512), max(W, H))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    X0 = int(np.clip(cx - lado // 2, 0, max(0, W - lado))); Y0 = int(np.clip(cy - lado // 2, 0, max(0, H - lado)))
    X1, Y1 = min(W, X0 + lado), min(H, Y0 + lado)
    crop, mc = im[Y0:Y1, X0:X1], buraco[Y0:Y1, X0:X1]
    ci = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    mi = (cv2.resize(mc.astype(np.uint8), (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    out = LAMA.run(None, {"image": ci.transpose(2, 0, 1)[None], "mask": mi[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5:
        out = out * 255
    out = cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (X1 - X0, Y1 - Y0), interpolation=cv2.INTER_CUBIC)
    a = cv2.GaussianBlur(cv2.dilate(mc.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 3)[..., None]
    r = im.copy()
    r[Y0:Y1, X0:X1] = (crop * (1 - a) + out * a).astype(np.uint8)
    return r


def limpa(m, area=600):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= area
    return keep[lab]


D = profundidade()
if "--objeto" in a:
    CORTES = CORTES + [1.0]                                 # o objeto vira uma camada a mais, na frente
q = [float(np.percentile(D, min(c, .999) * 100)) for c in CORTES]
obj = isnet() > float(opt("--limiar", .5)) if "--objeto" in a else None
# máscara de cada camada da frente: tudo que está mais perto que o corte (a frente inclui as da frente dela)
masks = []
for i, t in enumerate(q):
    m = D >= t
    if obj is not None and i == len(q) - 1:
        m = obj                                             # frente = só o objeto (o chão não "rasga" junto)
    m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8)) > 0
    masks.append(limpa(m, int(W * H * 4e-4)))
for i in range(len(masks) - 2, -1, -1):                     # camada de trás contém as da frente
    masks[i] = masks[i] | masks[i + 1]

dil = lambda m, px: cv2.dilate(m.astype(np.uint8), np.ones((px, px), np.uint8)) > 0
pena = max(2, W // 900)
camadas = []
# fundo: sem a primeira máscara (dilatada, para não sobrar halo), preenchido
fundo = preenche(rgb, dil(masks[0], 2 * pena + 9))
camadas.append((fundo, None))
for i, m in enumerate(masks):
    im = rgb if i == len(masks) - 1 else preenche(rgb, dil(masks[i + 1], 2 * pena + 9))
    al = cv2.GaussianBlur(dil(m, pena + 1).astype(np.float32), (0, 0), pena * .8)
    camadas.append((im, al))

meta = {"w": W, "h": H, "n": len(camadas), "cortes": CORTES}
novos = {}
for i, (im, al) in enumerate(camadas):
    if al is None:
        fn = f"p3_{NOME}_{i}.jpg"
        Image.fromarray(im).save(os.path.join(ASSETS, fn), quality=92)
    else:
        fn = f"p3_{NOME}_{i}.webp"
        Image.fromarray(np.dstack([im, (al * 255).astype(np.uint8)]), "RGBA").save(os.path.join(ASSETS, fn), quality=92, method=4)
    novos[f"p3_{NOME}_{i}"] = {"src": f"assets/{fn}", "w": W, "h": H}
novos[f"p3_{NOME}"] = {"src": f"assets/p3_{NOME}_0.jpg", "w": W, "h": H, "camadas": len(camadas), "cortes": CORTES}
Image.fromarray((D * 255).astype(np.uint8)).save(os.path.join(ASSETS, f"p3_{NOME}_prof.png"))

# assets.js
import re
D0 = {}
if os.path.exists(AJS):
    mm = re.search(r"window\.ASSETS\s*=\s*(\{.*\})\s*;", open(AJS, encoding="utf-8").read(), re.S)
    D0 = json.loads(mm.group(1)) if mm else {}
D0.update(novos)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from prof3d import faz as prof3d                            # relevo por camada para o modo WebGL (p3_<nome>_d<i>.png, dref, pg)
prof3d(PROJ, NOME, D, A=D0)
open(AJS, "w", encoding="utf-8").write("window.ASSETS = " + json.dumps(D0, ensure_ascii=False) + ";\n")

# folha: foto | profundidade com cortes | cada camada sobre xadrez
th = 420; tw = round(W * th / H)
chk = np.indices((H, W)).sum(0) // max(8, W // 60) % 2
chk = np.where(chk[..., None] == 1, 200, 120).astype(np.uint8).repeat(3, 2)
dv = cv2.applyColorMap((D * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)[..., ::-1]
for t in q:
    dv[np.abs(D - t) < .006] = (0, 255, 120)
tiles = [rgb, dv] + [im if al is None else (im * al[..., None] + chk * (1 - al[..., None])).astype(np.uint8) for im, al in camadas]
sh = Image.new("RGB", ((tw + 6) * len(tiles), th), (15, 15, 15))
for i, t in enumerate(tiles):
    sh.paste(Image.fromarray(t).resize((tw, th)), (i * (tw + 6), 0))
sh.save(os.path.join(PROJ, "out", f"p3_{NOME}_folha.jpg"), quality=86)
print(f"{NOME}: {len(camadas)} camadas {W}x{H}  cortes {CORTES} -> out/p3_{NOME}_folha.jpg")
