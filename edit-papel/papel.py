"""Texturas do formato edit-papel, geradas aqui (sem crédito do Higgsfield):
  t_amassado.jpg  papel creme amassado (vincos com faces claras e escuras, fibra, manchas leves)
  t_preto.jpg     fundo preto com grão fino (pôster escuro e cenas de ícone)

uso (Python do kit): python papel.py <projeto | pasta_saida> [--semente 11] [--vincos 16] [--linhas 8] [--cor d9cfc2]
Grava em <projeto>/render/assets/ e roda o make_assets.py do projeto. 1350x2400 (folga para câmera e empurrão).
"""
import os, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = "H:/Edição Claude/Kit_Edicao_Vox_v2"
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
alvo = a[0] if os.path.isabs(a[0]) or os.path.isdir(a[0]) else os.path.join(KIT, "projetos", a[0])
proj = alvo if os.path.isdir(os.path.join(alvo, "render")) else None
out = os.path.join(alvo, "render", "assets") if proj else alvo
os.makedirs(out, exist_ok=True)
seed = int(opt("--semente", 11))
NV = int(opt("--vincos", 16))
NL = int(opt("--linhas", 8))       # quantos vincos ganham aresta visível
base = np.array([int(opt("--cor", "d9cfc2")[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255
W, H = 1350, 2400
rng = np.random.default_rng(seed)
amplia = lambda m, hh=H, ww=W: np.array(Image.fromarray(m.astype(np.float32), "F").resize((ww, hh), Image.BICUBIC), np.float32)

# ---- altura: poucos vincos longos (faces largas com aresta viva), como uma folha amassada e esticada ----
s = 2  # calcula em meia resolução e amplia
w, h = W // s, H // s
Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
alt = np.zeros((h, w), np.float32)
VINCOS = []
for i in range(NV):
    cx, cy = rng.uniform(0, 1) * w, rng.uniform(0, 1) * h
    th = rng.uniform(0, np.pi)
    nx, ny = np.cos(th), np.sin(th)
    d = (X - cx) * nx + (Y - cy) * ny                      # distância assinada até o vinco
    ao = (X - cx) * -ny + (Y - cy) * nx                    # posição ao longo do vinco
    comp = rng.uniform(.5, 1.4) * max(w, h)                # comprimento útil do vinco
    larg = rng.uniform(.25, .7) * max(w, h)                # alcance das faces
    amp = rng.uniform(.35, 1.0) * (1 if rng.random() < .5 else -1)
    k = rng.uniform(.6, 2.2)                               # raio da dobra (pequeno = aresta viva)
    v = np.sqrt(d * d + k * k)                             # |d| suavizado
    fade = np.exp(-(ao / comp) ** 4) * np.exp(-(d / larg) ** 2)
    alt += amp * v * fade / larg * 34
    VINCOS.append((cx * s, cy * s, nx, ny, comp * s, amp))
# ondulação larga e rugas finas
for sig, g in ((60, 2.2), (14, .5), (3, .12)):
    alt += ndimage.gaussian_filter(rng.normal(0, 1, (h, w)).astype(np.float32), sig) * g * sig
# ---- luz (normal pelo gradiente) ----
gy, gx = np.gradient(alt)
L = np.array([-.5, -.8, .6]); L /= np.linalg.norm(L)
nz = 1.0 / np.sqrt(gx * gx + gy * gy + 1)
lum = (-gx * L[0] - gy * L[1] + L[2]) * nz
lum = lum - np.median(lum)
lum = np.clip(lum / (np.percentile(np.abs(lum), 90) + 1e-6), -2.2, 2.2)     # faces: ~±1 no p90
lum = amplia(lum)
# ---- manchas largas, fibra e grão fino (o papel da referência é granulado) ----
geral = amplia(ndimage.gaussian_filter(rng.normal(0, 1, (12, 7)), 1.2))
# vincos em resolução cheia: aresta viva com um lado que pega luz e o outro em sombra, levemente curvos
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
linhas = np.zeros((H, W), np.float32)
TREMOR = amplia(ndimage.gaussian_filter(rng.normal(0, 1, (H // 6, W // 6)).astype(np.float32), 2.5))
TREMOR /= TREMOR.std() + 1e-6                              # vincos tremidos (papel de verdade não dobra em linha reta)
for cx, cy, nx, ny, comp, amp in VINCOS[:NL]:
    comp *= rng.uniform(.35, .9)
    ao = (XX - cx) * -ny + (YY - cy) * nx
    d = (XX - cx) * nx + (YY - cy) * ny + rng.uniform(4, 16) * np.sin(ao / rng.uniform(140, 420) + rng.uniform(0, 6.3))         + rng.uniform(1.5, 4) * np.sin(ao / rng.uniform(18, 50) + rng.uniform(0, 6.3)) + TREMOR * rng.uniform(2, 5)
    fade = np.exp(-(ao / comp) ** 4) * rng.uniform(.45, 1.0)
    dl = d * (1 if rng.random() < .5 else -1)
    wl, wd = rng.uniform(10, 34), rng.uniform(18, 60)
    lit = np.exp(-np.maximum(dl, 0) / wl) * (dl >= 0)
    sh = np.exp(-np.maximum(-dl, 0) / wd) * (dl < 0)
    linhas += fade * (lit * .9 - sh * .7 + np.exp(-(d / 1.1) ** 2) * (.5 if amp > 0 else -.4))
del YY, XX
manchas = amplia(ndimage.gaussian_filter(rng.normal(0, 1, (H // 8, W // 8)).astype(np.float32), 5))
fibra = ndimage.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), (.5, 2.0))
grao = ndimage.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), .55)
v = 1 + lum * .035 + linhas * .05 + geral * .025 + manchas * .045 + fibra * .02 + grao * .06
img = base[None, None, :] * v[..., None]
img[..., 2] -= manchas * .01                               # mancha puxa levemente para o amarelado
pts = rng.random((H, W)) < 0.00008
img[ndimage.binary_dilation(pts, iterations=1)] *= .8
img = np.clip(img, 0, 1)
Image.fromarray((img * 255 + rng.random(img.shape) * .8).astype(np.uint8)).save(os.path.join(out, "t_amassado.jpg"), quality=92)

# ---- preto com grão ----
p = 13 / 255 + ndimage.gaussian_filter(rng.normal(0, 1, (H, W)).astype(np.float32), .7) * 5 / 255 + geral * 3 / 255
p = np.clip(np.stack([p, p * .99, p * .97], -1), 0, 1)
Image.fromarray((p * 255).astype(np.uint8)).save(os.path.join(out, "t_preto.jpg"), quality=90)
print("ok:", os.path.join(out, "t_amassado.jpg"), "+ t_preto.jpg")
if proj and os.path.exists(os.path.join(proj, "make_assets.py")):
    r = subprocess.run([sys.executable, "make_assets.py"], cwd=proj, capture_output=True, text=True, encoding="utf-8", errors="replace")
    print("make_assets:", (r.stdout or r.stderr).strip()[:120])
