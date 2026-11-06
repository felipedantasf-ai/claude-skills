"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato vox-edit2 (vox editorial premium + a gramática do projeto After Effects
"High heels", EarnEdits).

uso (na raiz do kit, com o Python do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/vox-edit2/preparar_edit2.py <projeto> --prefixo xx [--sem-trilha | --soul]
(em outro PC, a variável VOX_KIT aponta para a pasta do kit)

Rode DEPOIS de `pipeline.py preparar <projeto> "video.mp4"` (ou do mp3 da ElevenLabs). Precisa da vox-editorial instalada ao lado
(~/.claude/skills/vox-editorial). Faz (nunca apaga; o que troca ganha cópia .antes):
  1. preparar_formato.py da vox-editorial com --sem-pipeline: fontes Sitka, legenda, componentes.js -> work/<xx>_a.js
  2. work/<xx>_b.js = premium_vox.js (mesa, entradas, matéria, fotos em pilha, círculo/dividida do HeyGen, celular)
     work/<xx>_c.js = componentes_edit2.js (13 q/s, câmera em nulls, fundos, sombra longa, tipografia 3D, Collage Kit, sobreposições)
                      + mapa_satelite.js (e2Mapa: mapa de satélite no estilo @rotageografica; dados com mapa_satelite.py)
  3. render/assets: texturas do formato (e2_*), t_papel, t_pergaminho e o perfil REAL do @felipedantasf (perfil_avatar/perfil_texto;
     outro apresentador: troque os dois pelo print dele); render/e2kit e render/e2ferve (sequências) + render/e2kit.js
  4. etapas.json: prefixo, trilha = ferramentas/trilha_roteiro.py do kit (faixas CC0 sem crédito escolhidas por bloco do roteiro,
     plano em <projeto>/trilha_roteiro.json; sem plano = sem música), audio_final, sem grade de cinema.
     --soul volta à cama soul lo-fi sintetizada (trilha_edit2.py); o Felipe achou que ela não conversa com roteiro investigativo.
Cenas em work/<xx>_d.js, _e.js ... (copie de cenas_exemplo.js).
"""
import glob, json, os, shutil, subprocess, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"): _s.reconfigure(encoding="utf-8", errors="replace")
SK = os.path.dirname(os.path.abspath(__file__))
VE = os.path.join(os.path.dirname(SK), "vox-editorial")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}. Rode antes: pipeline.py preparar <projeto> \"video.mp4\"")
if not os.path.isdir(VE):
    sys.exit(f"falta a skill vox-editorial em {VE}")
pref = opt("--prefixo", os.path.basename(P.rstrip("/\\"))[:2].lower())
R = lambda *p: os.path.join(P, "render", *p)


def guarda(p):
    if os.path.exists(p) and not os.path.exists(p + ".antes"): shutil.copy(p, p + ".antes")


SO_CLIPES = "--so-clipes" in a
# 1. vox-editorial (fontes, legenda, componentes)
if not SO_CLIPES:
    r = subprocess.run([sys.executable, os.path.join(VE, "preparar_formato.py"), P, "--prefixo", pref, "--sem-pipeline"], text=True,
                       capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
    print(r.stdout.strip())
    if r.returncode:
        print(r.stderr.strip()); sys.exit("preparar_formato.py falhou")
# 2. bibliotecas
for src, suf in (() if SO_CLIPES else (("premium_vox.js", "b"), ("componentes_edit2.js", "c"))):
    d = os.path.join(P, "work", f"{pref}_{suf}.js"); guarda(d); shutil.copy(os.path.join(SK, src), d)
    if suf == "c":       # o mapa de satélite (estilo @rotageografica, 01/11/2026) vai junto, no fim da biblioteca do formato
        open(d, "a", encoding="utf-8").write("\n" + open(os.path.join(SK, "mapa_satelite.js"), encoding="utf-8").read())
if not SO_CLIPES: print(f"bibliotecas -> work/{pref}_b.js (premium) e {pref}_c.js (edit2); cenas em work/{pref}_d.js, {pref}_e.js ...")
# 3. assets e sequências
T = os.path.join(SK, "texturas"); os.makedirs(R("assets"), exist_ok=True)
for f in glob.glob(os.path.join(T, "*.*")):
    if f.lower().endswith((".jpg", ".png", ".webp")): shutil.copy(f, R("assets"))
for sub in ("kit", "ferve"):
    dst = R("e2" + sub)
    if os.path.isdir(dst): shutil.rmtree(dst)
    shutil.copytree(os.path.join(T, sub), dst)
KITJ = json.load(open(os.path.join(T, "kit", "kit.json"))); FERJ = json.load(open(os.path.join(T, "ferve", "ferve.json")))
CLIPN = {c: len(glob.glob(R("clips", c, "*.jpg"))) for c in (os.listdir(R("clips")) if os.path.isdir(R("clips")) else []) if os.path.isdir(R("clips", c))}
open(R("e2kit.js"), "w", encoding="utf-8").write(f"window.E2KIT = {json.dumps(KITJ)};\nwindow.E2FERVE = {json.dumps(FERJ)};\n"
                                                  f"window.CLIPN = Object.assign(window.CLIPN || {{}}, {json.dumps(CLIPN)});\n")
if SO_CLIPES:
    sys.exit(f"render/e2kit.js atualizado: {len(CLIPN)} clipes")
ih = R("index.html"); html = open(ih, encoding="utf-8").read()
if "e2kit.js" not in html:
    html = html.replace('<script src="scenes.js"></script>', '<script src="e2kit.js"></script>\n<script src="scenes.js"></script>', 1)
    open(ih, "w", encoding="utf-8").write(html)
r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print(f"assets ok ({len(glob.glob(R('assets', 'e2_*')))} texturas e2_*, {sum(KITJ.values())} quadros de Collage Kit, {sum(FERJ.values())} de grunge)")
# 4. etapas.json
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
if "--soul" in a: tr, af = os.path.join(SK, "trilha_edit2.py"), "audio/final_mix_e2.wav"
else: tr, af = os.path.join(KIT, "ferramentas", "trilha_roteiro.py"), "audio/final_mix_tr.wav"
cfg.update({"prefixo": pref, "montar": os.path.join(SK, "montar.py").replace("\\", "/"), "trilha": tr.replace("\\", "/"), "audio_final": af, "cinema": False})
env = cfg.get("env", {})
if "--sem-trilha" in a: env["SEM_MUSICA"] = "1"
else: env.pop("SEM_MUSICA", None)
if env: cfg["env"] = env
else: cfg.pop("env", None)
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print("pronto. Próximo: imagens (prep_prints.py da vox-editorial para fotos reais), cenas em work/%s_d.js, montar.py, previas.py" % pref)
