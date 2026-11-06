"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-founded (história de fundador; apresentador 10–15 vezes em tela cheia ou num círculo).

uso (Python do kit):  .venv\\Scripts\\python.exe preparar_founded.py <projeto> [--prefixo xx] [--avatar | --real | --sem-apresentador] [--sem-trilha]

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo (já criado pelo pipeline.py preparar / novo_projeto.py)
--prefixo  prefixo dos arquivos de cena em work/ (padrão: as 2 primeiras letras do nome)
--sem-trilha  sem a cama de música (o padrão do formato TEM trilha cinematográfica)

Faz (nunca apaga; guarda cópia do que troca):
  1. fontes: Times New Roman (C:/Windows/Fonts/times.ttf) -> render/fonts/TimesInv.ttf; Inter 400/500/600/700 do kit
  2. render/index.html: CSS do formato (legenda.css), faces no pré-carregamento, <script> de clipn.js, olhos.js e marcas.js
  3. componentes.js -> work/<prefixo>_a.js (cenas em work/<prefixo>_b.js, _c.js ...)
  4. prints de perfil da biblioteca (fimMarca); make_assets
  5. render/clipn.js, olhos.js (tarjas), marcas.js (marca-texto) e etapas.json (prefixo, montar, trilha, audio_final, perfil)
"""
import glob, json, os, re, shutil, subprocess, sys
import numpy as np
from PIL import Image
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SK = os.path.dirname(os.path.abspath(__file__))
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}")
pref = opt("--prefixo", re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "iv")
R = lambda *p: os.path.join(P, "render", *p)

# 1. fontes
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
for src, dst in (("times.ttf", "TimesInv.ttf"), ("timesi.ttf", "TimesInvI.ttf")):
    if not os.path.exists(os.path.join(fd, dst)):
        s = "C:/Windows/Fonts/" + src
        if os.path.exists(s): shutil.copy(s, os.path.join(fd, dst))
        else: print(f"AVISO: C:/Windows/Fonts/{src} não existe — copie uma serifa transicional como fonts/{dst}")
for w in ("400", "800", "900"):
    if not os.path.exists(os.path.join(fd, f"inter-latin-{w}-normal.woff2")):
        s = os.path.join(KIT, "projeto_modelo", "render", "fonts", f"inter-latin-{w}-normal.woff2")
        if os.path.exists(s): shutil.copy(s, fd)
print("fontes ok (TimesInv normal/itálico + Inter)")

# 2. index.html
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_founded.html")):
    shutil.copy(ih, R("index_antes_founded.html"))
if "==== edit-founded" not in html:
    css = open(os.path.join(SK, "legenda.css"), encoding="utf-8").read()
    i = html.index("</style>")
    html = html[:i] + css + html[i:]
faces = ["'400 60px TimesInv'", "'italic 400 60px TimesInv'", "'400 40px Inter'", "'800 40px Inter'", "'900 40px Inter'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "TimesInv" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
for js in ("clipn.js", "marcas.js"):
    if js not in html:
        html = html.replace('<script src="scenes.js"></script>', f'<script src="{js}"></script>\n<script src="scenes.js"></script>', 1)
open(ih, "w", encoding="utf-8").write(html)
print("index.html ok")

# 3. componentes
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_a.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "componentes.js"), dst)
print(f"componentes -> work/{pref}_a.js (cenas em work/{pref}_b.js, {pref}_c.js ...)")


# 4. perfis (fimMarca)
os.makedirs(R("assets"), exist_ok=True)
for f in glob.glob(os.path.join(KIT, "biblioteca", "perfil_*.png")):
    if not os.path.exists(R("assets", os.path.basename(f))):
        shutil.copy(f, R("assets"))
subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)
print("assets ok (perfis)")


# 5. clipn.js, olhos.js, etapas.json
def clipn(proj):
    d = os.path.join(proj, "render", "clips"); n = {}
    if os.path.isdir(d):
        for c in sorted(os.listdir(d)):
            if os.path.isdir(os.path.join(d, c)):
                n[c] = len(glob.glob(os.path.join(d, c, "*.jpg")))
    open(os.path.join(proj, "render", "clipn.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(n) + ";\n")
    return n


print("clipes:", len(clipn(P)))
for js, var in (("marcas.js", "MARCAS"),):
    if not os.path.exists(R(js)):
        open(R(js), "w", encoding="utf-8").write(f"window.{var} = {{}};\n")
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg["prefixo"] = pref
cfg["montar"] = os.path.join(SK, "montar.py").replace("\\", "/")
cfg["trilha"] = os.path.join(SK, "trilha_fd.py").replace("\\", "/")
cfg["audio_final"] = "audio/final_mix_fd.wav"
env = cfg.get("env", {})
if "--sem-trilha" in a:
    env["SEM_MUSICA"] = "1"
else:
    env.pop("SEM_MUSICA", None)
if env: cfg["env"] = env
else: cfg.pop("env", None)
if "--sem-apresentador" in a:
    cfg["apresentador"] = "sem"
elif "--avatar" in a or "--real" in a:
    cfg["apresentador"] = "avatar" if "--avatar" in a else "real"
elif os.path.exists(os.path.join(P, "work", "apresentador.json")) or cfg.get("sem_rosto"):
    cfg["apresentador"] = "avatar"
else:
    cfg["apresentador"] = "real"                # presFD: 10–15 aparições de 2–4 s (tela cheia ou círculo)
cfg.pop("workers", None)
cfg["cinema"] = False          # sem a grade de cinema do kit: o look é feito no render
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print("pronto. Próximo: imagens.py (fotos/produtos), clipes.py (trechos), cenas em work/%s_b.js ..., montar.py, previas.py" % pref)
