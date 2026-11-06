"""Olhar do apresentador: o Fernando só aparece enquanto olha a câmera (pedido do Felipe, 25/10/2026).

uso (Python do kit):
  olhar.py <projeto> varredura              -> out/olhar_N.jpg: o corte inteiro, um quadro a cada 0,3 s, recorte dos olhos
  olhar.py <projeto> 10.4-13.9 18.1-21 ...  -> out/janelas_N.jpg: cada janela a cada 0,1 s (verde = dentro; vermelho = 0,3 s de margem)

O recorte segue o rosto rastreado (render/camdata.js) nos quadros do corte (work/frames). Rode DEPOIS do `pipeline.py preparar`
(com os quadros do corte atual: confira com sincronia.py). Como ler:
  - piscada (olhos fechados por 1–3 quadros, até ~0,3 s) é normal: pode ficar;
  - olhar para baixo, cabeça virada ou olhos fechados por 0,4 s ou mais: tire esse trecho da janela (mude o lead da cena ou S.J) ou
    troque a aparição por uma cena visual.
"""
import os, re, sys
from PIL import Image, ImageDraw
for _s in (sys.stdout, sys.stderr):   # stderr também: o modo de uso e os erros saem por ele
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
t = open(os.path.join(P, "render", "camdata.js"), encoding="utf-8").read()
cx = [float(v) for v in re.search(r"cx:\s*\[([^\]]*)\]", t).group(1).split(",")]
cy = [float(v) for v in re.search(r"cy:\s*\[([^\]]*)\]", t).group(1).split(",")]
fdir = os.path.join(P, "work", "frames")
N = len([f for f in os.listdir(fdir) if f.endswith(".jpg")])
os.makedirs(os.path.join(P, "out"), exist_ok=True)

def olhos(tt, tw, th):
    f = min(N, max(1, int(tt * 30) + 1)); s = min(len(cx) - 1, f - 1)
    x0, y0 = cx[s] - 200, cy[s] - 105
    return Image.open(os.path.join(fdir, f"{f:05d}.jpg")).crop((int(x0), int(y0), int(x0 + 400), int(y0 + 150))).resize((tw - 3, th - 3))

if a[1] == "varredura":
    tw, th, cols, per = 300, 110, 8, 104
    ts = [round(i * .3, 1) for i in range(int(N / 30 / .3) + 1)]
    for k in range(0, len(ts), per):
        ch = ts[k:k + per]; rows = (len(ch) + cols - 1) // cols
        sh = Image.new("RGB", (cols * tw, rows * th), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for j, tt in enumerate(ch):
            x, y = (j % cols) * tw, (j // cols) * th
            sh.paste(olhos(tt, tw, th), (x, y)); d.rectangle((x, y, x + 44, y + 16), fill=(0, 0, 0)); d.text((x + 3, y + 2), f"{tt:.1f}", fill=(255, 255, 0))
        fn = os.path.join(P, "out", f"olhar_{k // per}.jpg"); sh.save(fn, quality=85); print(fn)
else:
    J = []
    for w in a[1:]:
        x0, x1 = map(float, w.split("-")); J.append((x0, x1))
    tw, th, cols = 230, 86, 10
    rows = []
    for k, (x0, x1) in enumerate(J):
        ts = [round(x0 - .3 + i * .1, 2) for i in range(int((x1 - x0 + .6) / .1) + 1)]
        for i in range(0, len(ts), cols):
            rows.append((k, ts[i:i + cols], x0, x1))
    for part in range(0, len(rows), 18):
        R = rows[part:part + 18]
        sh = Image.new("RGB", (cols * tw + 90, len(R) * th), (20, 20, 20)); d = ImageDraw.Draw(sh)
        for r, (k, ts, x0, x1) in enumerate(R):
            d.text((4, r * th + 36), f"J{k + 1}", fill=(255, 220, 0))
            for j, tt in enumerate(ts):
                x, y = 90 + j * tw, r * th
                sh.paste(olhos(tt, tw, th), (x, y))
                d.rectangle((x, y, x + 46, y + 14), fill=(0, 110, 0) if x0 <= tt <= x1 else (130, 0, 0)); d.text((x + 3, y + 2), f"{tt:.1f}", fill=(255, 255, 255))
        fn = os.path.join(P, "out", f"janelas_{part // 18}.jpg"); sh.save(fn, quality=88); print(fn)
