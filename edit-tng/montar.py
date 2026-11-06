"""(edit-tng) Monta render/scenes.js a partir de work/<prefixo>_[a-z].js e confere antes do render:
  sintaxe (node --check); toda palavra citada ('B03:valia', 'B03#2', inclusive em TNG.musica/TNG.troca) existe no beat; a
  sequência de beats das cenas tng(); e ABRE A PÁGINA (Chromium) para medir o vídeo que vai sair:
  ritmo   cortes reais/min contando os passos da montagem-relâmpago (meta 70–80; REF 75,5), sem a montagem (62–72),
          plano mediano (0,70–0,85 s; REF 0,75) e médio (REF 0,79 s)
  tempo   por tipo de plano e do personagem (TNG.sujeito: meta 45–50%; cartões ~10%; prints ~7%)
  legenda blocos, palavras por bloco (REF 2,6–2,9), frase mais larga (≤ 716 px)
  sons    cliques, obturadores, rajadas e cues da trilha
  erros   clipe faltando/curto, asset, palavra inexistente, plano fora de ordem
uso: python montar.py <projeto> <prefixo>
"""
import asyncio, glob, json, os, re, subprocess, sys, unicodedata
from pathlib import Path
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
src = "".join(open(f, encoding="utf-8").read() + "\n" for f in parts)
open(f"{P}/render/scenes.js", "w", encoding="utf-8").write(src)
cod = re.sub(r"(?<![:'\"])//[^\n]*", "", src)
r = subprocess.run(["node", "--check", f"{P}/render/scenes.js"], capture_output=True, text=True, encoding="utf-8", errors="replace")
n = len(re.findall(r"^\s*tng\(\s*\[", cod, re.M))
print("partes:", [os.path.basename(f) for f in parts], "| cenas:", n, "| sintaxe:", "ok" if r.returncode == 0 else r.stderr[:900])

tim = open(f"{P}/render/timing.js", encoding="utf-8").read()
T = json.loads(tim[tim.index("{"):tim.rindex("}") + 1])
B = {b["id"]: b for b in T["beats"]}
nm = lambda s: re.sub(r"[^a-z0-9$%]", "", "".join(ch for ch in unicodedata.normalize("NFD", str(s)) if not unicodedata.combining(ch)).lower())
bad = []
for m in re.finditer(r"'(B\d+)([:#])([^'+]+?)(?:[+-]\d*\.?\d+)?'", cod):
    bid, k, w = m.groups()
    if bid not in B: bad.append(f"{bid} inexistente"); continue
    ws = B[bid]["words"]
    if k == "#":
        if not w.isdigit() or int(w) >= len(ws): bad.append(f"{bid}#{w}: o beat tem {len(ws)} palavras ({B[bid]['text']})")
    elif not any(nm(x["w"]).startswith(nm(w)) for x in ws):
        bad.append(f"{bid} sem '{w}': {B[bid]['text']}")
for m in re.finditer(r"'(B\d+)'", cod):
    if m.group(1) not in B: bad.append(f"{m.group(1)} inexistente")
print("palavras:", "ok" if not bad else "\n  " + "\n  ".join(sorted(set(bad))))
seq = [re.findall(r"'(B\d+)'", g) for g in re.findall(r"tng\(\s*\[([^\]]*)\]", cod)]
flat = [b for s in seq for b in s]
ids = [b["id"] for b in T["beats"]]
print("beats:", "ok" if flat == ids else f"DIFERENTE ({len(flat)} x {len(ids)}): " + str([(i, x, y) for i, (x, y) in enumerate(zip(flat, ids)) if x != y][:5])
      + (f" | faltam no fim: {ids[len(flat):][:6]}" if len(flat) < len(ids) else ""))
if r.returncode != 0 or bad:
    sys.exit(0)


async def relatorio():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--disable-gpu", "--force-color-profile=srgb"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        await pg.goto(Path(P, "render", "index.html").as_uri())
        for _ in range(2400):
            if await pg.evaluate("window.READY === true || !!window.READY_ERR"):
                break
            await asyncio.sleep(.05)
        re_ = await pg.evaluate("window.READY_ERR || null")
        rel = await pg.evaluate("window.TNG_RELATORIO ? TNG_RELATORIO() : null")
        await b.close()
        return rel, re_, errs


rel, rerr, errs = asyncio.run(relatorio())
if rerr or not rel:
    print("PÁGINA: ERRO", rerr, errs[:6]); sys.exit(1)
ok = lambda v, a, b: "ok" if a <= v <= b else "FORA"
print(f"ritmo: {rel['planos']} planos, {rel['cortes']} cortes em {rel['dur']:.1f} s = {rel['porMin']:.1f}/min ({ok(rel['porMin'], 70, 80)}; meta 70–80, REF 75,5)"
      f" | sem montagem {rel['porMinSemMontagem']:.1f}/min ({ok(rel['porMinSemMontagem'], 62, 72)}; 62–72) | plano mediano {rel['mediana']:.2f} s"
      f" ({ok(rel['mediana'], .7, .85)}; 0,70–0,85) | médio {rel['media']:.2f} s (REF 0,79)")
if rel["curtos"]: print("  planos < 0,24 s (fora de montagem):", ", ".join(rel["curtos"][:12]))
if rel["longos"]: print("  planos > 2,4 s:", ", ".join(rel["longos"][:12]))
tot = sum(rel["tipo"].values()) or 1
print("tempo por tipo:", " · ".join(f"{k} {v / tot:.0%}" for k, v in sorted(rel["tipo"].items(), key=lambda x: -x[1])))
if rel.get("sujeito") is not None:
    s = rel["sujeito"] / tot
    print(f"personagem: {s:.0%} do tempo ({ok(s, .40, .56)}; meta 45–50%, REF 50%)")
print(f"legenda: {rel['blocos']} blocos, {rel['palMedia']:.1f} palavras por bloco (REF 2,6–2,9), mais larga '{rel['maisLargo']}' = {rel['largMax']:.0f} px"
      f" ({'ok' if rel['largMax'] <= 716 else 'LARGA DEMAIS'}; ≤ 716)")
print("sons:", " · ".join(f"{k.replace('tng:', '')} {v}" for k, v in sorted(rel["eventos"].items()) if k.startswith("tng:")),
      f"| fade para branco em {rel['fim']['t0']:.2f} s (última palavra termina em {rel['fim']['ultima']:.2f} s)")
erros = list(dict.fromkeys(rel["erros"] + [e for e in errs if not e.startswith("Failed to load resource")]))
print("erros:", "nenhum" if not erros else "\n  " + "\n  ".join(erros[:20]))
