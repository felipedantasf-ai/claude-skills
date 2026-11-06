"""(vox-edit2) Prévias de todas as cenas (entrada, meio, fim) em folhas de contato com o número da cena -> out/pv/cenas_*.jpg

uso: python previas.py <projeto> [primeira última] [--cenas 3,5,8] [--pontos 3] [--tempos 1.2,3.4]
Respeita o "lead" de cada cena. Rode o montar.py antes (as prévias leem render/scenes.js).
Atenção: borrão de movimento só aparece no vídeo (ele depende do quadro anterior); a prévia mostra cada instante sozinho.
"""
import glob, json, os, re, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image, ImageDraw, ImageFont

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
PROJ = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
py = sys.executable
src = re.sub(r"(?<![:'\"])//[^\n]*", "", open(f"{PROJ}/render/scenes.js", encoding="utf-8").read())
tim = open(f"{PROJ}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
COMP = r"(?:e2Cena|e2Mapa|pres4|presV|ctaSeguir)"
ms = list(re.finditer(rf"(?:beats:\s*\[|{COMP}\(\[)\s*'(B\d+)'", src))
def lead(m):
    blk = src[m.end():m.end() + 700]
    nx = re.search(rf"{COMP}\(\[|scene\(", blk)
    blk = blk[:nx.start()] if nx else blk
    g = re.search(r"lead:\s*(-?[\d.]+)", blk)
    return float(g.group(1)) if g else .08
t0s = [0.0] + [max(0, B[m.group(1)]["start"] - lead(m)) for m in ms[1:]]
ult = re.findall(r"'(B\d+)'", re.findall(rf"(?:beats:\s*\[|{COMP}\(\[)([^\]]*)\]", src)[-1])[-1]
t1s = t0s[1:] + [min(T["videoDur"], B[ult]["end"] + .4)]
rest = a[1:]
pos = [x for i, x in enumerate(rest) if not x.startswith("--") and (i == 0 or rest[i - 1] not in ("--cenas", "--pontos", "--tempos"))]
s_from, s_to = (int(pos[0]), int(pos[1])) if len(pos) >= 2 else (1, len(t0s))
npts = int(rest[rest.index("--pontos") + 1]) if "--pontos" in rest else 3
sel = [int(x) - 1 for x in rest[rest.index("--cenas") + 1].split(",")] if "--cenas" in rest else range(s_from - 1, s_to)
pts, lab = [], {}
if "--tempos" in rest:
    for t in rest[rest.index("--tempos") + 1].split(","):
        t = round(float(t), 2); pts.append(t); k = max(i for i, x in enumerate(t0s) if x <= t + 1e-6); lab[f"{t:07.2f}"] = f"S{k + 1}"
else:
    for k in sel:
        s0, s1 = t0s[k], t1s[k]
        for j in range(npts):
            t = round(s0 + .12 + (s1 - s0 - .2) * j / max(1, npts - 1), 2) if npts > 1 else round((s0 + s1) / 2, 2)
            pts.append(t); lab[f"{t:07.2f}"] = f"S{k + 1}"
for f in glob.glob(f"{PROJ}/out/prev_*.png"):
    os.remove(f)
r = subprocess.run([py, "render.py", "preview"] + [f"{t:.2f}" for t in pts], cwd=PROJ, capture_output=True, text=True, encoding="utf-8", errors="replace")
if r.returncode != 0:
    sys.exit("render.py preview falhou:\n" + (r.stderr or r.stdout)[-2500:])
ims = sorted(glob.glob(f"{PROJ}/out/prev_*.png"))
fnt = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
Wt, Ht, cols = 270, 480, 6
for p0 in range(0, len(ims), cols * 3):
    lote = ims[p0:p0 + cols * 3]
    rows = (len(lote) + cols - 1) // cols
    sh = Image.new("RGB", (cols * Wt, rows * (Ht + 30)), (20, 20, 20)); d = ImageDraw.Draw(sh)
    for i, f in enumerate(lote):
        im = Image.open(f).convert("RGB").resize((Wt, Ht))
        x, y = (i % cols) * Wt, (i // cols) * (Ht + 30)
        sh.paste(im, (x, y + 30))
        t = os.path.basename(f)[5:-4]
        d.text((x + 6, y + 4), f"{lab.get(t, '?')}  {float(t):.2f}s", fill=(255, 220, 0), font=fnt)
    out = f"{PROJ}/out/pv/cenas_{p0 // (cols * 3) + 1:02d}.jpg"; sh.save(out, quality=88); print(out)
