"""Prévias de todas as cenas (entrada, meio, fim) em folhas de contato com o número da cena -> out/pv/cenas_*.jpg

uso: python previas.py <projeto> [primeira última] [--cenas 3,5,8] [--pontos 3]
Respeita o "lead" de cada cena (lead negativo atrasa o começo).
"""
import glob, json, os, re, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image, ImageDraw

KIT = "H:/Edição Claude/Kit_Edicao_Vox_v2"
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
PROJ = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
py = sys.executable
src = open(f"{PROJ}/render/scenes.js", encoding="utf-8").read()
tim = open(f"{PROJ}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
ms = list(re.finditer(r"(?:beats:\s*\[|presV\(\[|pres[34]\(\[|ctaSeguir\(\[)\s*'(B\d+)'", src))
def lead(m):
    blk = src[m.end():m.end() + 400]
    cuts = [i for i in (blk.find("build("), blk.find("scene("), blk.find("pres4(")) if i >= 0]
    blk = blk[:min(cuts)] if cuts else blk
    g = re.search(r"lead:\s*(-?[\d.]+)", blk)
    return float(g.group(1)) if g else .08
t0s = [0.0] + [max(0, B[m.group(1)]["start"] - lead(m)) for m in ms[1:]]
t1s = t0s[1:] + [T["videoDur"]]
rest = a[1:]
pos = [x for i, x in enumerate(rest) if not x.startswith("--") and (i == 0 or rest[i - 1] not in ("--cenas", "--pontos"))]
s_from, s_to = (int(pos[0]), int(pos[1])) if len(pos) >= 2 else (1, len(t0s))
npts = int(rest[rest.index("--pontos") + 1]) if "--pontos" in rest else 3
sel = [int(x) - 1 for x in rest[rest.index("--cenas") + 1].split(",")] if "--cenas" in rest else range(s_from - 1, s_to)
pts, lab = [], {}
for k in sel:
    s0, s1 = t0s[k], t1s[k]
    for j in range(npts):
        t = round(s0 + .3 + (s1 - s0 - .42) * j / max(1, npts - 1), 2) if npts > 1 else round((s0 + s1) / 2, 2)
        pts.append(t); lab[f"{t:07.2f}"] = f"S{k + 1}"
for f in glob.glob(f"{PROJ}/out/prev_*.png"):
    os.remove(f)
r = subprocess.run([py, f"{PROJ}/render.py", "preview", *map(str, pts)], capture_output=True, text=True, encoding="utf-8", errors="replace", cwd=PROJ)
errs = [l for l in (r.stdout + r.stderr).splitlines() if "ERRO" in l or "Error" in l or "Traceback" in l]
print("\n".join(errs[:10]) if errs else "sem erros", "|", len(pts), "quadros")
fs = sorted(glob.glob(f"{PROJ}/out/prev_*.png"))
os.makedirs(f"{PROJ}/out/pv", exist_ok=True)
per, cols, tw, th = 36, 9, 216, 384
for si in range(0, len(fs), per):
    ch = fs[si:si + per]; rows = (len(ch) + cols - 1) // cols
    sh = Image.new("RGB", (cols * (tw + 4), rows * (th + 18)), (22, 22, 22)); d = ImageDraw.Draw(sh)
    for i, f in enumerate(ch):
        x, y = (i % cols) * (tw + 4), (i // cols) * (th + 18)
        sh.paste(Image.open(f).convert("RGB").resize((tw, th)), (x, y))
        key = os.path.basename(f)[5:-4]
        d.text((x + 3, y + th + 2), f"{lab.get(key, '?')}  {key}s", fill=(255, 230, 0))
    out = f"{PROJ}/out/pv/cenas_{s_from:02d}_{si // per + 1}.jpg"
    sh.save(out, quality=84); print(out)
