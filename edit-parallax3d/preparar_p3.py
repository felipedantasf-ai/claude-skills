"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-parallax3d (plano contínuo com fotos em camadas 3D).

uso (Python do kit):  .venv\\Scripts\\python.exe preparar_p3.py <projeto> [--prefixo p3]

Faz (nunca apaga; guarda cópia do que troca):
  1. render/index.html: CSS do formato (estilo.css: sem legenda corrida, grão e vinheta), faces Sitka/Inter/P3Mono no pré-carregamento
  2. componentes.js -> work/<prefixo>_a.js (cenas em work/<prefixo>_b.js, _c.js ...)
  3. texturas de fumaça (texturas/fum_*.png, nuvens reais do Commons) -> render/assets + assets.js
  4. etapas.json: prefixo, montar (montar_p3.py), "cinema": true (grade na placa)
  5. WebGL na placa: lib/three.min.js -> render/lib + <script> no index.html; render.py do projeto abre o Chromium com a
     placa (--use-angle=d3d11) em vez de --disable-gpu (cópia em render.py.antes_p3). Sem a placa, o palco cai no CSS 3D.
Depois: camadas3d.py para cada foto (já grava o relevo; projeto antigo: prof3d.py), cenas, montar_p3.py, prévias, pipeline.py fechar.
"""
import glob, json, os, re, shutil, sys
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
pref = opt("--prefixo", "p3")
R = lambda *p: os.path.join(P, "render", *p)

# 1. index.html
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_p3.html")):
    shutil.copy(ih, R("index_antes_p3.html"))
css = open(os.path.join(SK, "estilo.css"), encoding="utf-8").read()
if "/* ==== edit-parallax3d" in html:                                       # rodou antes: troca pelo CSS atual
    i = html.index("/* ==== edit-parallax3d"); j = html.index("</style>", i)
    html = html[:i] + html[j:]
i = html.rindex("</style>")
html = html[:i] + css + html[i:]
faces = ["'500 60px P3Mono'", "'500 60px Sitka'", "'italic 500 60px Sitka'", "'800 40px Inter'", "'500 40px Inter'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "P3Mono" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
open(ih, "w", encoding="utf-8").write(html)
for f in ("Sitka.ttf", "Sitka-Italic.ttf", "inter-latin-800-normal.woff2", "inter-latin-500-normal.woff2"):
    if not os.path.exists(R("fonts", f)):
        s = os.path.join(KIT, "projeto_modelo", "render", "fonts", f)
        if f.startswith("Sitka"):                                         # serifa do formato = Sitka do Windows
            s = "C:/Windows/Fonts/" + f.replace("Sitka", "SitkaVF")
        if os.path.exists(s): shutil.copy(s, R("fonts", f))
        else: print("AVISO: falta a fonte", f)
print("index.html ok")

# 2. componentes
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_a.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "componentes.js"), dst)
print(f"componentes -> work/{pref}_a.js (cenas em work/{pref}_b.js ...)")

# 3. texturas de fumaça
os.makedirs(R("assets"), exist_ok=True)
AJS = R("assets.js")
D = {}
if os.path.exists(AJS):
    m = re.search(r"window\.ASSETS\s*=\s*(\{.*\})\s*;", open(AJS, encoding="utf-8").read(), re.S)
    D = json.loads(m.group(1)) if m else {}
for f in sorted(glob.glob(os.path.join(SK, "texturas", "fum_*.png"))):
    shutil.copy(f, R("assets"))
    im = Image.open(f)
    D[os.path.splitext(os.path.basename(f))[0]] = {"src": "assets/" + os.path.basename(f), "w": im.width, "h": im.height}
open(AJS, "w", encoding="utf-8").write("window.ASSETS = " + json.dumps(D, ensure_ascii=False) + ";\n")
print("texturas de fumaça ok")

# 4. etapas.json
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg.update({"prefixo": pref, "montar": os.path.join(SK, "montar_p3.py").replace("\\", "/")})
json.dump(cfg, open(ej, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("etapas.json ok:", cfg)

# 5. WebGL na placa
os.makedirs(R("lib"), exist_ok=True)
shutil.copy(os.path.join(SK, "lib", "three.min.js"), R("lib", "three.min.js"))
html = open(ih, encoding="utf-8").read()
if "lib/three.min.js" not in html:
    html = html.replace('<script src="engine.js"></script>', '<script src="lib/three.min.js"></script>\n<script src="engine.js"></script>', 1)
    open(ih, "w", encoding="utf-8").write(html)
GPU = '"--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--allow-file-access-from-files"'
rp = os.path.join(P, "render.py")
src = open(rp, encoding="utf-8").read()
if '"--disable-gpu"' in src:
    if not os.path.exists(rp + ".antes_p3"):
        shutil.copy(rp, rp + ".antes_p3")
    open(rp, "w", encoding="utf-8").write(src.replace('"--disable-gpu"', GPU, 1))
print("WebGL ok:", "three.min.js no index.html;", "render.py com a placa" if "--use-angle=d3d11" in open(rp, encoding="utf-8").read() else "AVISO: render.py sem a placa")
