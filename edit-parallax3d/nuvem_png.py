"""Tufos de fumaça/nuvem a partir de FOTOS REAIS de cúmulos em céu azul (o céu sai pela cor).

uso: python nuvem_png.py PASTA_SAIDA foto1.jpg[:x0,y0,x1,y1] foto2.jpg ... [--lado 1024]
  -> PASTA_SAIDA/fum_0.png, fum_1.png ... (RGBA em tons de cinza; a cor vem do CSS em fumaca())
O recorte opcional (px da foto) tira árvores/chão. Cada nuvem grande (componente conectado) vira um tufo.
As 5 texturas prontas desta skill (texturas/) vieram de fotos do Commons (créditos em texturas/CREDITOS.txt).
"""
import os, sys
import numpy as np
import cv2
from PIL import Image

a = [x for x in sys.argv[1:]]
if len(a) < 2:
    sys.exit(__doc__)
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
LADO = int(opt("--lado", 1024))
OUT = a[0]; os.makedirs(OUT, exist_ok=True)
fotos = [x for x in a[1:] if not x.startswith("--") and x != opt("--lado", None)]
n = 0
for arg in fotos:
    path, _, rc = arg.partition(":") if not (len(arg) > 1 and arg[1] == ":") else (arg[:2] + arg[2:].partition(":")[0], None, arg[2:].partition(":")[2])
    im = Image.open(path).convert("RGB")
    if rc:
        im = im.crop(tuple(int(v) for v in rc.split(",")))
    x = np.array(im).astype(np.float32) / 255
    R, G, B = x[..., 0], x[..., 1], x[..., 2]
    azul = (B - R) / (B + 1e-3)                              # céu: azul bem maior que vermelho; nuvem: cinza
    lum = x.mean(2)
    al = 1 - np.clip((azul - .07) / .16, 0, 1)
    al *= np.clip((lum - .25) / .2, 0, 1)                    # nada escuro demais (árvores, chão)
    al = cv2.GaussianBlur(al, (0, 0), 1.2)
    cinza = np.clip((lum - azul * .3), 0, 1)                 # tira o azul que vaza nas bordas
    m = (al > .5).astype(np.uint8)
    k, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    H, W = m.shape
    for i in np.argsort(-st[1:, cv2.CC_STAT_AREA])[:4] + 1:
        x0, y0, w, h, area = st[i]
        if area < W * H * .03:
            continue
        pad = int(max(w, h) * .06)
        X0, Y0, X1, Y1 = max(0, x0 - pad), max(0, y0 - pad), min(W, x0 + w + pad), min(H, y0 + h + pad)
        reg = (cv2.dilate((lab == i).astype(np.uint8), np.ones((15, 15), np.uint8)) > 0)[Y0:Y1, X0:X1]
        A = al[Y0:Y1, X0:X1] * cv2.GaussianBlur(reg.astype(np.float32), (0, 0), 6)
        yy, xx = np.mgrid[0:A.shape[0], 0:A.shape[1]]
        bord = np.minimum.reduce([xx, yy, A.shape[1] - 1 - xx, A.shape[0] - 1 - yy]).astype(np.float32)
        A *= np.clip(bord / max(4, pad * .8), 0, 1)              # some antes da borda do retângulo
        ex = ((xx / A.shape[1] - .5) / .5) ** 2 + ((yy / A.shape[0] - .5) / .5) ** 2
        A *= np.clip((1.05 - ex) / .45, 0, 1) ** .7              # e nos cantos (sem aresta reta de foto cortada)
        C = (cinza[Y0:Y1, X0:X1] * 255).astype(np.uint8)
        out = Image.fromarray(np.dstack([C, C, C, (A * 255).astype(np.uint8)]), "RGBA")
        out.thumbnail((LADO, LADO), Image.LANCZOS)
        out.save(os.path.join(OUT, f"fum_{n}.png")); n += 1
print(n, "tufos em", OUT)
