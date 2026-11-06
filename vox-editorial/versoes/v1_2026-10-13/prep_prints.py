"""Fotos de arquivo (as que o Felipe manda) -> impressões P&B com retícula de jornal e grão, recortadas em retrato.
Saída: render/assets/print_<nome>.jpg + folha out/prints_check.jpg; no fim roda make_assets.py.

uso: python prep_prints.py <projeto> fotos/a.jpg[:cx[:proporcao]] fotos/b.jpg ...
  cx        centro horizontal da pessoa na foto (0..1, padrão .5)
  proporcao largura/altura do recorte (padrão .75 = 3:4; use 1 para quadrado quando a pessoa abre os braços)
  --cor     mantém a cor (impressão colorida com retícula leve) em vez de P&B
Na cena: printPhoto(r, 'print_<nome>', cx, cy, largura, { rot: -6, tape: ['tl'] }) + dropIn(...)
"""
import os, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import numpy as np
from PIL import Image, ImageFilter, ImageOps

KIT = "H:/Edição Claude/Kit_Edicao_Vox_v2"
a = [x for x in sys.argv[1:] if x != "--cor"]
COR = "--cor" in sys.argv
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
OUTW = 1000

def halftone(g, period=6.0, ang=45):
    h, w = g.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.deg2rad(ang); u = (xx * np.cos(t) + yy * np.sin(t)) * 2 * np.pi / period; v = (-xx * np.sin(t) + yy * np.cos(t)) * 2 * np.pi / period
    return np.where(g / 255.0 > (np.cos(u) + np.cos(v)) / 4 + .5, 255.0, 0.0)

tiles = []
for item in a[1:]:
    parts = item.split(":")
    # caminhos com letra de unidade (H:/...) têm ":" — junta de volta
    if len(parts) > 1 and len(parts[0]) == 1:
        parts = [parts[0] + ":" + parts[1]] + parts[2:]
    path = parts[0] if os.path.isabs(parts[0]) else os.path.join(P, parts[0])
    cx = float(parts[1]) if len(parts) > 1 else .5
    ar = float(parts[2]) if len(parts) > 2 else .75
    nome = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert("RGB")
    W, H = im.size
    cw = min(W, round(H * ar)); ch = min(H, round(cw / ar)); x0 = int(min(max(cx * W - cw / 2, 0), W - cw))
    im = im.crop((x0, 0, x0 + cw, ch)).resize((OUTW, round(OUTW * ch / cw)), Image.LANCZOS)
    g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    ga = np.asarray(g).astype(np.float32)
    ht = halftone(ga)
    rng = np.random.default_rng(7)
    if COR:
        rgb = np.asarray(ImageOps.autocontrast(im, cutoff=1)).astype(np.float32)
        out = np.clip(rgb * (.84 + .16 * ht[..., None] / 255.0) + rng.normal(0, 5, rgb.shape), 0, 255)
        res = Image.fromarray(out.astype(np.uint8))
    else:
        out = np.clip(.78 * ga + .22 * ht + rng.normal(0, 6, ga.shape), 0, 255)
        res = Image.fromarray(out.astype(np.uint8)).convert("RGB")
    dst = os.path.join(P, "render", "assets", f"print_{nome}.jpg")
    res.save(dst, quality=90)
    tiles.append(res.resize((300, round(300 * res.height / res.width))))
    print(f"print_{nome}", res.size)
Wt = sum(t.width + 8 for t in tiles); Ht = max(t.height for t in tiles)
sh = Image.new("RGB", (Wt, Ht), (110, 110, 110)); x = 0
for t in tiles: sh.paste(t, (x, 0)); x += t.width + 8
os.makedirs(os.path.join(P, "out"), exist_ok=True)
sh.save(os.path.join(P, "out", "prints_check.jpg"), quality=85)
subprocess.run([sys.executable, os.path.join(P, "make_assets.py")], cwd=P)
print("folha: out/prints_check.jpg")
