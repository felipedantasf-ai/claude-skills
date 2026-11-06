"""(edit-investigativa) Monta render/scenes.js a partir de work/<prefixo>_[a-z].js e confere: sintaxe (node --check), toda palavra
usada em c.w('Bxx', 'palavra') existe no beat (o motor cai na 1ª palavra sem avisar), a sequência de beats das cenas e o APRESENTADOR:
tempo de tela e duração de cada aparição contra o perfil do vídeo.
  perfil real   (gravação): 30–42% do vídeo (referência 36%), aparições de 2–12 s (punch-out na entrada, empurra devagar)
  perfil avatar (HeyGen): 25–35% do vídeo, aparições SEMPRE de 2–4 s, nunca duas seguidas — esconde as imperfeições do avatar
O perfil vem do etapas.json ("apresentador": "avatar" | "real"); sem a chave, é avatar se existir work/apresentador.json ou
"sem_rosto" e real nos outros casos. Também mostra o RITMO previsto: cortes/min e plano médio (referência 11,5/min, 5,0 s).

uso: python montar.py <projeto> <prefixo> [--perfil avatar|real]
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
src = re.sub(r"(?<![:'\"])//[^\n]*", "", src)   # exemplos em comentários não contam nas conferências
os.makedirs(f"{P}/out/pv", exist_ok=True)
r = subprocess.run(["node", "--check", f"{P}/render/scenes.js"], capture_output=True, text=True)
n = len(re.findall(r"^(?:scene\(\{|pres[34]\(\[|presV\(\[|presInv\(\[|muralCena\(\[|docCena\(\[|fotoCena\(\[|siteCena\(\[|tvCena\(\[|mapaCena\(\[|fimPerfilInv\(\[|ctaSeguir\(\[)", src, re.M))
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
for m in re.finditer(r"(?:c\.[be]\(|linhaFala\([^,]+,\s*c,\s*)'(B\d+)'", src):
    if m.group(1) not in B: bad.append(f"{m.group(1)} inexistente")
print("palavras:", "ok" if not bad else "\n  " + "\n  ".join(sorted(set(bad))))
seq = [re.findall(r"'(B\d+)'", g) for g in re.findall(r"(?:beats:\s*\[|pres[34]\(\[|presV\(\[|presInv\(\[|muralCena\(\[|docCena\(\[|fotoCena\(\[|siteCena\(\[|tvCena\(\[|mapaCena\(\[|fimPerfilInv\(\[|ctaSeguir\(\[)([^\]]*)\]", src)]
flat = [b for s in seq for b in s]
ids = [b["id"] for b in T["beats"]]
print("beats:", "ok" if flat == ids else f"DIFERENTE ({len(flat)} x {len(ids)}): " + str([(i, x, y) for i, (x, y) in enumerate(zip(flat, ids)) if x != y][:5]))

# ---- apresentador: tempo de tela e duração das aparições contra o perfil ----
cfg = json.load(open(f"{P}/etapas.json", encoding="utf-8")) if os.path.exists(f"{P}/etapas.json") else {}
perfil = sys.argv[sys.argv.index("--perfil") + 1] if "--perfil" in sys.argv else cfg.get("apresentador") or (
    "avatar" if os.path.exists(f"{P}/work/apresentador.json") or cfg.get("sem_rosto") else "real")
ms = list(re.finditer(r"(beats:\s*\[|pres[34]\(\[|presV\(\[|presInv\(\[|muralCena\(\[|docCena\(\[|fotoCena\(\[|siteCena\(\[|tvCena\(\[|mapaCena\(\[|fimPerfilInv\(\[|ctaSeguir\(\[)\s*'(B\d+)'", src))
def lead(m):
    blk = src[m.end():m.end() + 500]
    cuts = [i for i in (blk.find("build("), blk.find("scene("), blk.find("presInv("), blk.find("Cena(")) if i >= 0]
    blk = blk[:min(cuts)] if cuts else blk
    g = re.search(r"lead:\s*(-?[\d.]+)", blk)
    return float(g.group(1)) if g else .08
def eh_pres(m):
    k = m.group(1)
    if k.startswith(("presV", "pres3", "pres4", "presInv", "ctaSeguir")):
        return True
    blk = src[m.end():m.end() + 400]
    return "presenter: true" in blk[:blk.find("build(") if "build(" in blk else 400]
if ms and all(m.group(2) in B for m in ms):
    t0s = [0.0] + [max(0, B[m.group(2)]["start"] - lead(m)) for m in ms[1:]]
    t1s = t0s[1:] + [T["videoDur"]]
    pres = [(i, t0s[i], t1s[i] - t0s[i]) for i, m in enumerate(ms) if eh_pres(m)]
    tot = sum(d for _, _, d in pres)
    alvo, dmin, dmax = ((.25, .35), 1.8, 4.2) if perfil == "avatar" else ((.30, .42), 1.8, 12.5)
    share = tot / T["videoDur"] if T["videoDur"] else 0
    avisos = []
    for i, t0, d in pres:
        final = i == len(ms) - 1
        if d > dmax and not (perfil == "real" and final):
            avisos.append(f"S{i + 1} ({t0:.1f}s) dura {d:.1f}s > {dmax - .2:.0f}s: corte para mural/documento/tipografia no meio")
        elif d < dmin:
            avisos.append(f"S{i + 1} ({t0:.1f}s) dura só {d:.1f}s")
    seguidas = [f"S{a + 1}+S{b + 1}" for (a, _, _), (b, _, _) in zip(pres, pres[1:]) if b == a + 1]
    if seguidas:
        avisos.append("aparições coladas (sem outro cenário no meio): " + ", ".join(seguidas))
    if not (alvo[0] <= share <= alvo[1]):
        avisos.append(f"tempo de tela {share:.0%} fora do alvo {alvo[0]:.0%}–{alvo[1]:.0%}")
    ds = [d for _, _, d in pres]
    print(f"apresentador (perfil {perfil}): {len(pres)} aparições, {tot:.1f}s = {share:.0%} do vídeo"
          + (f", de {min(ds):.1f} a {max(ds):.1f}s" if ds else "") + (" | ok" if not avisos else "\n  " + "\n  ".join(avisos)))
    durs = [b - a for a, b in zip(t0s, t1s)]
    if durs:
        print(f"ritmo previsto: {len(durs)} cenas, {max(0, len(durs) - 1) / T['videoDur'] * 60:.1f} cortes/min, plano médio {sum(durs) / len(durs):.1f} s "
              f"(referência 11,5/min e 5,0 s; aceite 9–15/min) | cenas > 9 s: " + (", ".join(f"S{i + 1}({d:.1f}s)" for i, d in enumerate(durs) if d > 9) or "nenhuma"))
