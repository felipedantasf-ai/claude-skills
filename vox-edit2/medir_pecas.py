"""(vox-edit2, vida na foto parada) mede as peças de uma imagem gerada para os componentes vd*:

  medir_pecas.py carro foto_rgba.png      -> rodas [[cx, cy, r], [cx, cy, r]] e base (y do chão) para vdCarro
  medir_pecas.py boneco foto_rgba.png     -> pescoco [x, y] e quadril [x, y] para vdBoneco (pessoa de perfil, mãos no bolso)

Grava <foto>_pecas.jpg com os círculos/linhas desenhados: ABRA e confira (o Hough erra em carro clássico; ajuste à mão).
Coordenadas em px da imagem original (não use make_assets --trim nessas imagens: o corte muda as coordenadas).
"""
import sys
import numpy as np
import cv2
from PIL import Image, ImageDraw

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if len(sys.argv) < 3:
    sys.exit(__doc__)
modo, f = sys.argv[1], sys.argv[2]
im = Image.open(f).convert("RGBA")
A = np.asarray(im)[..., 3] > 128
ys, xs = np.where(A)
W, H = im.size
out = im.convert("RGB")
d = ImageDraw.Draw(out)

if modo == "carro":
    g = cv2.medianBlur(cv2.cvtColor(np.asarray(im.convert("RGB")), cv2.COLOR_RGB2GRAY), 5)
    base = int(ys.max())
    larg = xs.max() - xs.min()
    rodas = []
    for lado in (0, 1):                                   # traseira (metade esquerda) e dianteira (metade direita)
        x0 = xs.min() + (lado * larg) // 2
        sub = g[:, x0:x0 + larg // 2]
        cs = cv2.HoughCircles(sub, cv2.HOUGH_GRADIENT, dp=1, minDist=larg, param1=100, param2=25,
                              minRadius=int(larg * .05), maxRadius=int(larg * .1))
        if cs is None:
            continue
        cands = [c for c in cs[0] if abs((c[1] + c[2]) - base) < c[2] * .35] or list(cs[0])   # roda toca o chão
        x, y, r = cands[0]
        rodas.append([int(x + x0), int(y)])
    if rodas:                                             # as duas rodas têm o mesmo raio e tocam o chão: R = base − centro
        R = float(np.median([base - y for _, y in rodas]))
        rodas = [[x, int(base - R), int(R * .97)] for x, _ in rodas]
    for x, y, r in rodas:
        d.ellipse((x - r, y - r, x + r, y + r), outline="red", width=3)
        d.line((x - 8, y, x + 8, y), fill="red"); d.line((x, y - 8, x, y + 8), fill="red")
    d.line((0, base, W, base), fill="blue", width=2)
    print(f"rodas: {rodas}, base: {base}")
elif modo == "boneco":
    topo, pe = int(ys.min()), int(ys.max())
    larg = np.array([(np.ptp(np.where(A[y])[0]) if A[y].any() else 0) for y in range(H)])
    alt = pe - topo
    # pescoço = linha mais estreita entre 8% e 22% da altura; quadril = onde a largura cai (barra do paletó) entre 45% e 62%
    a, b = topo + int(alt * .08), topo + int(alt * .22)
    yn = a + int(np.argmin(larg[a:b]))
    a, b = topo + int(alt * .45), topo + int(alt * .62)
    yq = a + int(np.argmin(np.diff(larg[a:b])))
    cx = lambda y: int(np.where(A[y])[0].mean())
    pesc, quad = [cx(yn), yn], [cx(yq + 6), yq + 6]
    for (x, y), cor in ((pesc, "red"), (quad, "blue")):
        d.line((0, y, W, y), fill=cor, width=2); d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=cor)
    print(f"pescoco: {pesc}, quadril: {quad}  (topo {topo}, pé {pe}; pé em caixa w: centro + (pé/{W} - .5)·w)")
else:
    sys.exit(__doc__)
p = f.rsplit(".", 1)[0] + "_pecas.jpg"
out.save(p, quality=88)
print("conferir:", p)
