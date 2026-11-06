"""vox-edit2: monta render/scenes.js a partir de work/<prefixo>_[a-z].js e confere: sintaxe (node --check), toda palavra usada
em c.w('Bxx', 'palavra') existe no beat (o motor cai na 1ª palavra sem avisar) e a sequência de beats das cenas.

uso: python montar.py <projeto> <prefixo>
"""
import glob, json, os, re, subprocess, sys, unicodedata
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
if len(sys.argv) < 3:
    sys.exit(__doc__)
P = sys.argv[1] if os.path.isabs(sys.argv[1]) else os.path.join(KIT, "projetos", sys.argv[1])
pref = sys.argv[2]
parts = sorted(glob.glob(f"{P}/work/{pref}_[a-z].js"))
if not parts:
    sys.exit(f"nenhum work/{pref}_[a-z].js em {P}")
src = "".join(open(f, encoding="utf-8").read() for f in parts)
open(f"{P}/render/scenes.js", "w", encoding="utf-8").write(src)
os.makedirs(f"{P}/out/pv", exist_ok=True)
r = subprocess.run(["node", "--check", f"{P}/render/scenes.js"], capture_output=True, text=True)
n = len(re.findall(r"^(?:scene\(\{|e2Cena\(\[|e2Mapa\(\[|pres[34]\(\[|presV\(\[|ctaSeguir\(\[)", src, re.M))
print("partes:", [os.path.basename(f) for f in parts], "| cenas:", n, "| sintaxe:", "ok" if r.returncode == 0 else r.stderr[:900])
tim = open(f"{P}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
norm = lambda s: re.sub(r"[^\w]", "", "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))).lower()
bad = []
for m in re.finditer(r"c\.w\('(B\d+)',\s*'([^']+)'\)", src):
    bid, k = m.groups()
    if bid not in B: bad.append(f"{bid} inexistente"); continue
    if not any(norm(w["w"]).startswith(norm(k)) for w in B[bid]["words"]):
        bad.append(f"{bid} sem '{k}': {B[bid]['text']}")
for m in re.finditer(r"c\.[be]\('(B\d+)'\)", src):
    if m.group(1) not in B: bad.append(f"{m.group(1)} inexistente")
print("palavras:", "ok" if not bad else "\n  " + "\n  ".join(sorted(set(bad))))
seq = [re.findall(r"'(B\d+)'", g) for g in re.findall(r"(?:beats:\s*\[|e2Cena\(\[|e2Mapa\(\[|pres[34]\(\[|presV\(\[|ctaSeguir\(\[)([^\]]*)\]", src)]
flat = [b for s in seq for b in s]
ids = [b["id"] for b in T["beats"]]
print("beats:", "ok" if flat == ids else f"DIFERENTE ({len(flat)} x {len(ids)}): " + str([(i, x, y) for i, (x, y) in enumerate(zip(flat, ids)) if x != y][:5]))
