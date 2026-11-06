"""(edit-parallax3d) Monta render/scenes.js a partir de work/<prefixo>_[a-z].js e confere: sintaxe (node --check), toda palavra
usada em c.w('Bxx', 'palavra') existe no beat (o motor cai na 1ª palavra sem avisar), todo asset citado existe e a sequência
de beats das cenas cobre o vídeo.

uso: python montar_p3.py <projeto> <prefixo>
"""
import glob, json, os, re, subprocess, sys, unicodedata
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
if len(sys.argv) < 3:
    sys.exit(__doc__)
P = sys.argv[1] if os.path.isabs(sys.argv[1]) else os.path.join(KIT, "projetos", sys.argv[1])
pref = sys.argv[2]
parts = sorted(glob.glob(f"{P}/work/{pref}_[a-z].js"))
if not parts:
    sys.exit(f"nenhum work/{pref}_[a-z].js em {P}")
src = "".join(open(f, encoding="utf-8").read() for f in parts)
open(f"{P}/render/scenes.js", "w", encoding="utf-8").write(src)
src = re.sub(r"(?<![:'\"])//[^\n]*", "", src)
r = subprocess.run(["node", "--check", f"{P}/render/scenes.js"], capture_output=True, text=True)
print("partes:", [os.path.basename(f) for f in parts], "| cenas:", len(re.findall(r"^(?:scene\(\{|estacao\(|pres3\(|curva3\(|fim3\()", src, re.M)),
      "| sintaxe:", "ok" if r.returncode == 0 else r.stderr[:900])
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
print("palavras:", "ok" if not bad else "\n  " + "\n  ".join(sorted(set(bad))))
aj = open(f"{P}/render/assets.js", encoding="utf-8").read()
A = json.loads(aj[aj.index("{"):aj.rindex("}") + 1])
falta = sorted({n for n in re.findall(r"nome:\s*'([\w-]+)'", src) if f"p3_{n}" not in A})
print("camadas:", "ok" if not falta else "FALTAM (rode camadas3d.py): " + ", ".join(falta))
seq = [b for g in re.findall(r"(?:^scene\(\{\s*beats:\s*\[|^(?:estacao|pres3|curva3|fim3|quadro3|curvaQ)\(\[)([^\]]*)\]", src, re.M) for b in re.findall(r"'(B\d+)'", g)]
ids = [b["id"] for b in T["beats"]]
print("beats:", "ok" if seq == ids else f"DIFERENTE: cenas {seq[:3]}... x timing {ids[:3]}... " +
      str([(i, x, y) for i, (x, y) in enumerate(zip(seq, ids)) if x != y][:5]))
