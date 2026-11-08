"""(edit-avancada) Monta render/scenes.js a partir de work/<prefixo>_[a-z].js e confere:
  sintaxe (node --check); toda palavra de c.w('Bxx', 'palavra') e de em: 'Bxx:palavra' existe no beat (o motor cai na 1ª palavra sem
  avisar); a sequência de beats (uma cena pode repetir o beat da anterior quando começa no meio dele com em:); os nomes das passagens (tr);
  a mesma passagem especial em cortes seguidos (regra: a passagem nasce da fala, nunca é padrão); o APRESENTADOR; o RITMO.
  Ritmo da skill (soma das referências): Stripe corta a cada 0,7–0,8 s, Walkman/Bryan 1–2 s com cortes casados de 0,17–0,3 s,
  Listerine troca a cada 3–4 quadros nas montagens. Alvo aqui: 30–60 cortes/min, plano de 0,6 a 4 s, um estímulo novo a cada ~0,6 s
  (texto, rabisco, camada, efeito) dentro das cenas mais longas.
  Apresentador (quando há gravação/HeyGen): aparições de 1–3,5 s (gravação real até 4 s), nunca duas seguidas, só olhando a câmera.

uso: python montar.py <projeto> <prefixo> [--perfil avatar|real|sem]
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
COMP = r"(?:cenaAV|avViagem|presAV|mundo|digitado|palavras|pilha|letras3D|jornal|parede|salaTV|presEA|perfilEA|ctaSeguir)"
CENA = rf"(?:scene\(\{{|{COMP}\(\[)"
n = len(re.findall(rf"^{CENA}", src, re.M))   # só chamadas no começo da linha (as definições dos componentes são indentadas)
print("partes:", [os.path.basename(f) for f in parts], "| cenas:", n, "| sintaxe:", "ok" if r.returncode == 0 else r.stderr[:900])
tim = open(f"{P}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
norm = lambda s: re.sub(r"[^\w]", "", "".join(ch for ch in unicodedata.normalize("NFD", s) if not unicodedata.combining(ch))).lower()


def palavra(bid, k):
    """como o avW/em: do motor: a palavra inteira primeiro, depois o 1º prefixo"""
    ws = B[bid]["words"]
    return next((w for w in ws if norm(w["w"]) == norm(k)), None) or next((w for w in ws if norm(w["w"]).startswith(norm(k))), None)


bad = []
for m in re.finditer(r"(c\.w|avW)\('(B\d+)',\s*'([^']+)'", src):
    fn, bid, k = m.groups()
    if bid not in B: bad.append(f"{bid} inexistente"); continue
    if not palavra(bid, k): bad.append(f"{bid} sem '{k}': {B[bid]['text']}"); continue
    # c.w (do motor do kit) pega o 1º PREFIXO: 'que' cai no "Quem". Avisa quando o prefixo acha antes outra palavra
    pref = next(w for w in B[bid]["words"] if norm(w["w"]).startswith(norm(k)))
    if fn == "c.w" and norm(pref["w"]) != norm(k) and any(norm(w["w"]) == norm(k) for w in B[bid]["words"]):
        bad.append(f"c.w('{bid}', '{k}') pega \"{pref['w']}\" ({pref['s']:.2f}s): use avW (procura a palavra inteira) ou o índice")
for m in re.finditer(r"c\.[be]\('(B\d+)'", src):
    if m.group(1) not in B: bad.append(f"{m.group(1)} inexistente")
for m in re.finditer(r"\bem:\s*'(B\d+)(?::([^']+))?'", src):
    bid, k = m.groups()
    if bid not in B: bad.append(f"em: {bid} inexistente"); continue
    if k and not palavra(bid, k): bad.append(f"em: {bid} sem '{k}': {B[bid]['text']}")
print("palavras:", "ok" if not bad else "\n  " + "\n  ".join(sorted(set(bad))))
ABRE = rf"(?:beats:\s*\[|{COMP}\(\[)"
seq = [re.findall(r"'(B\d+)'", g) for g in re.findall(rf"{ABRE}([^\]]*)\]", src)]
flat0 = [b for s in seq for b in s]
flat = [b for i, b in enumerate(flat0) if i == 0 or b != flat0[i - 1]]      # cena que começa no meio do beat repete o beat
ids = [b["id"] for b in T["beats"]]
ok_seq = flat == ids or (flat and ids[:len(flat)] == flat)
print("beats:", "ok" if flat == ids else (f"ok até {flat[-1]} (vídeo parcial: {len(flat)} de {len(ids)} beats)" if ok_seq else
      f"DIFERENTE ({len(flat)} x {len(ids)}): " + str([(i, x, y) for i, (x, y) in enumerate(zip(flat, ids)) if x != y][:5])))

# ---- cenas: começo (lead ou em:), duração, passagem, apresentador ----
ms = list(re.finditer(rf"({ABRE})\s*'(B\d+)'", src))


def bloco(i):
    m = ms[i]
    fim = ms[i + 1].start() if i + 1 < len(ms) else len(src)
    return src[m.end():min(fim, m.end() + 4000)]


def t0_de(i):
    m, blk = ms[i], bloco(i)
    g = re.search(r"\bem:\s*'(B\d+)(?::([^']+))?'", blk)
    if g and g.group(1) in B:
        pre = re.search(r"\bpre:\s*([\d.]+)", blk)
        w = palavra(g.group(1), g.group(2)) if g.group(2) else None
        return max(0, (w["s"] if w else B[g.group(1)]["start"]) - (float(pre.group(1)) if pre else .08))
    g = re.search(r"\blead:\s*(-?[\d.]+)", blk[:900])
    return max(0, B[m.group(2)]["start"] - (float(g.group(1)) if g else .08))


def tr_de(i):
    g = re.search(r"\btr:\s*'([^']+)'", bloco(i)[:1500])
    return g.group(1) if g else "cut"


def eh_pres(i):
    m, blk = ms[i], bloco(i)
    k = m.group(1)
    if k.startswith(("presEA", "presAV", "ctaSeguir")):
        return True
    if k.startswith("salaTV") and re.search(r"conteudo:\s*'apresentador'", blk[:600]):
        return True
    return "presenter: true" in blk[:blk.find("build(") if "build(" in blk else 400]


VALIDAS = {"cut", "match", "slideL", "slideR", "slideU", "zoom", "flash", "zoomOut", "whip", "leak", "dissolve", "defocus", "zoomblur", "irisC",
           "stripes", "glitch", "dive", "whipU", "ea:sobe", "ea:desce", "ea:wipe", "av:formas", "av:pagina", "av:queima", "av:pixel", "av:espiral",
           "av:flex", "av:impacto", "av:estalo"}
fim_video = B[flat[-1]]["end"] + .4 if flat and flat != ids else T["videoDur"]
if ms and all(m.group(2) in B for m in ms):
    t0s = [0.0] + [t0_de(i) for i in range(1, len(ms))]
    t1s = t0s[1:] + [min(T["videoDur"], fim_video)]
    durs = [b - a for a, b in zip(t0s, t1s)]
    trs = [tr_de(i) for i in range(len(ms))]
    av = []
    for i, tr in enumerate(trs):
        if tr not in VALIDAS and not tr.startswith(("ea:matte:", "gl:")):
            av.append(f"S{i + 1}: passagem '{tr}' não existe")
    for i in range(1, len(trs)):
        if trs[i] == trs[i - 1] and trs[i] not in ("cut", "match"):
            av.append(f"S{i}→S{i + 1}: a mesma passagem '{trs[i]}' em cortes seguidos (a passagem nasce da fala)")
    usos = {}
    for tr in trs[1:]:
        if tr.startswith("av:"): usos[tr] = usos.get(tr, 0) + 1
    lim = max(2, round(t1s[-1] / 30))
    av += [f"'{k}' usada {v}x (máximo ~{lim} neste vídeo: a assinatura cansa)" for k, v in usos.items() if v > lim]
    neg = [f"S{i + 1}" for i, d in enumerate(durs) if d <= 0]
    if neg: av.append("cenas com duração ≤ 0 (em:/lead começando depois da seguinte): " + ", ".join(neg))
    print("passagens:", ", ".join(f"S{i + 1} {t}" for i, t in enumerate(trs) if t != "cut") or "só cortes", "| " + ("ok" if not av else "\n  " + "\n  ".join(av)))
    cfg = json.load(open(f"{P}/etapas.json", encoding="utf-8")) if os.path.exists(f"{P}/etapas.json") else {}
    perfil = sys.argv[sys.argv.index("--perfil") + 1] if "--perfil" in sys.argv else cfg.get("apresentador") or (
        "avatar" if os.path.exists(f"{P}/work/apresentador.json") or cfg.get("sem_rosto") else "real")
    vd = t1s[-1]
    if perfil == "sem":
        print("apresentador: formato sem apresentador na tela (só narração)")
    else:
        pres = [(i, t0s[i], durs[i]) for i in range(len(ms)) if eh_pres(i)]
        tot = sum(d for _, _, d in pres)
        dmin, dmax = 1.0, (3.6 if perfil == "avatar" else 4.0)
        avisos = []
        for i, t0, d in pres:
            if d > dmax and i != len(ms) - 1:
                avisos.append(f"S{i + 1} ({t0:.1f}s) dura {d:.1f}s > {dmax:.1f}s: corte para uma cena no meio")
            elif d < dmin:
                avisos.append(f"S{i + 1} ({t0:.1f}s) dura só {d:.1f}s")
        seguidas = [f"S{a + 1}+S{b + 1}" for (a, _, _), (b, _, _) in zip(pres, pres[1:]) if b == a + 1]
        if seguidas:
            avisos.append("aparições coladas (sem outra cena no meio): " + ", ".join(seguidas))
        ds = [d for _, _, d in pres]
        print(f"apresentador (perfil {perfil}): {len(pres)} aparições, {tot:.1f}s = {tot / vd:.0%} do vídeo"
              + (f", de {min(ds):.1f} a {max(ds):.1f}s" if ds else "") + (" | ok" if not avisos else "\n  " + "\n  ".join(avisos)))
    longas = [f"S{i + 1}({d:.1f}s)" for i, d in enumerate(durs) if d > 4.0]
    curtas = [f"S{i + 1}({d:.2f}s)" for i, d in enumerate(durs) if 0 < d < .6 and not ms[i].group(1).startswith("avViagem")]
    cpm = max(0, len(durs) - 1) / vd * 60
    print(f"ritmo previsto: {len(durs)} cenas em {vd:.1f}s = {cpm:.1f} cortes/min, plano médio {sum(durs) / len(durs):.2f} s "
          f"(alvo 30–60/min{'' if 30 <= cpm <= 60 else ' ← FORA'}) | > 4 s (divida ou ponha evento no meio): {', '.join(longas) or 'nenhuma'}"
          f" | < 0,6 s: {', '.join(curtas) or 'nenhuma'}")
    print("cenas: " + " ".join(f"S{i + 1}@{t:.2f}" for i, t in enumerate(t0s)))
