"""(edit-avancada) Prévias de todas as cenas (entrada, meio, fim) em folhas de contato com o número da cena -> out/pv/cenas_*.jpg

uso: python previas.py <projeto> [primeira última] [--cenas 3,5,8] [--pontos 3] [--tempos 1.2,3.4]
Respeita o lead e o em: de cada cena. Rode o montar.py antes (as prévias leem render/scenes.js).
A prévia mostra cada instante sozinho: borrão de movimento e o que depende do quadro anterior só aparecem no vídeo.
"""
import glob, json, os, re, subprocess, sys, unicodedata
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image, ImageDraw, ImageFont

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
PROJ = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
py = sys.executable
src = re.sub(r"(?<![:'\"])//[^\n]*", "", open(f"{PROJ}/render/scenes.js", encoding="utf-8").read())
tim = open(f"{PROJ}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
norm = lambda s: re.sub(r"[^\w]", "", "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))).lower()
COMP = r"(?:cenaAV|avViagem|presAV|mundo|digitado|palavras|pilha|letras3D|jornal|parede|salaTV|presEA|perfilEA|ctaSeguir)"
ms = list(re.finditer(rf"(?:beats:\s*\[|{COMP}\(\[)\s*'(B\d+)'", src))


def t0_de(i):
    m = ms[i]
    blk = src[m.end():ms[i + 1].start() if i + 1 < len(ms) else len(src)][:4000]
    g = re.search(r"\bem:\s*'(B\d+)(?::([^']+))?'", blk)
    if g and g.group(1) in B:
        pre = re.search(r"\bpre:\s*([\d.]+)", blk)
        ws, k = B[g.group(1)]["words"], norm(g.group(2) or "")      # palavra inteira primeiro, depois prefixo (igual ao motor)
        w = (next((w for w in ws if norm(w["w"]) == k), None) or next((w for w in ws if norm(w["w"]).startswith(k)), None)) if g.group(2) else None
        return max(0, (w["s"] if w else B[g.group(1)]["start"]) - (float(pre.group(1)) if pre else .08))
    g = re.search(r"\blead:\s*(-?[\d.]+)", blk[:900])
    return max(0, B[m.group(1)]["start"] - (float(g.group(1)) if g else .08))


t0s = [0.0] + [t0_de(i) for i in range(1, len(ms))]
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
            t = round(s0 + .1 + (s1 - s0 - .16) * j / max(1, npts - 1), 2) if npts > 1 else round((s0 + s1) / 2, 2)
            pts.append(t); lab[f"{t:07.2f}"] = f"S{k + 1}"
for f in glob.glob(f"{PROJ}/out/prev_*.png"):
    os.remove(f)
r = subprocess.run([py, "render.py", "preview"] + [f"{t:.2f}" for t in pts], cwd=PROJ, capture_output=True, text=True, encoding="utf-8", errors="replace")
if r.returncode != 0:
    sys.exit("render.py preview falhou:\n" + (r.stderr or r.stdout)[-2500:])
ims = sorted(glob.glob(f"{PROJ}/out/prev_*.png"))
fnt = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 22)
Wt, Ht, cols = 270, 480, 6
for f in glob.glob(f"{PROJ}/out/pv/cenas_*.jpg"):
    os.remove(f)
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
