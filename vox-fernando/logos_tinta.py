"""Logos REAIS das empresas citadas, na paleta do Fernando: tinta PRETA (as partes brancas da logo continuam brancas).
Logos que já são vermelhas ou pretas podem manter a cor real com ":cor".

uso (Python do kit):  logos_tinta.py <projeto> fotos/logos/lg_embraer.png:embraer fotos/logos/lg_renner.png:renner:cor ...
  -> render/assets/lg_<chave>.png ; depois rode make_assets.py (o script já roda) e use logo(p, 'lg_<chave>', cx, cy, w) nas cenas.
De onde vêm as logos: Commons ("Logotipo da X.svg", fotos/busca_logos.py) ou a página da empresa na pt/en.wikipedia
(api.php?action=query&titles=<Empresa>&prop=pageimages&piprop=original), baixando por
https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/<Arquivo>.svg&width=900 (PNG de 960 px com transparência).
"""
import os, subprocess, sys
import numpy as np
from PIL import Image
for _s in (sys.stdout, sys.stderr):   # stderr também: o modo de uso e os erros saem por ele
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
for item in a[1:]:
    parts = item.split(":")
    if len(parts) > 1 and len(parts[0]) == 1:   # "H:/..." (letra de unidade)
        parts = [parts[0] + ":" + parts[1]] + parts[2:]
    src, chave = parts[0], parts[1]
    cor = len(parts) > 2 and parts[2] == "cor"
    src = src if os.path.isabs(src) else os.path.join(P, src)
    im = Image.open(src).convert("RGBA"); x = np.asarray(im).astype(np.float32)
    if not cor:
        lum = x[..., :3] @ np.array([.299, .587, .114], np.float32)
        branco = np.clip((lum - 200) / 40, 0, 1)[..., None]   # o que é branco na logo continua branco
        x[..., :3] = np.array([20, 20, 20], np.float32) * (1 - branco) + 250 * branco
    dst = os.path.join(P, "render", "assets", f"lg_{chave}.png")
    Image.fromarray(x.astype(np.uint8), "RGBA").save(dst)
    print(f"lg_{chave}.png ({'cor real' if cor else 'tinta preta'})")
r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print((r.stdout.strip().splitlines() or ["make_assets: ?"])[-1][:120])
