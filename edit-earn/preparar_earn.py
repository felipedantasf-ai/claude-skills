"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-earn (minidocumentário em camadas, referência earn.edits).

uso (Python do kit):  .venv\\Scripts\\python.exe preparar_earn.py <projeto> [--prefixo xx] [--avatar | --real | --sem-apresentador] [--sem-trilha]

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo (já criado pelo pipeline.py preparar / novo_projeto.py)
--prefixo  prefixo dos arquivos de cena em work/ (padrão: as 2 primeiras letras do nome)
--sem-trilha  sem a cama grave (o padrão do formato TEM cama + swish/boom nos cortes)

Faz (nunca apaga; guarda cópia do que troca):
  1. fontes: as da skill (Playfair Display Italic, Fjalla One, Poppins 600/700/900) + Times do Windows (TimesInv normal/negrito/itálico)
  2. render/index.html: estilo.css, faces no pré-carregamento, <script> de clipn.js
  3. componentes.js -> work/<prefixo>_a.js (cenas em work/<prefixo>_b.js, _c.js ...)
  4. perfis reais da biblioteca (perfilEA) e a madeira/sala padrão da skill (texturas/), make_assets
  5. render/clipn.js e etapas.json (prefixo, montar, trilha_earn, audio_final, apresentador, sem grade de cinema)
"""
import glob, json, os, re, shutil, subprocess, sys
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
pref = opt("--prefixo", re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "ea")
R = lambda *p: os.path.join(P, "render", *p)

# 1. fontes
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
for f in glob.glob(os.path.join(SK, "fonts", "*.ttf")):
    if not os.path.exists(os.path.join(fd, os.path.basename(f))):
        shutil.copy(f, fd)
for src, dst in (("times.ttf", "TimesInv.ttf"), ("timesbd.ttf", "TimesInvB.ttf"), ("timesi.ttf", "TimesInvI.ttf")):
    if not os.path.exists(os.path.join(fd, dst)):
        s = "C:/Windows/Fonts/" + src
        if os.path.exists(s): shutil.copy(s, os.path.join(fd, dst))
        else: print(f"AVISO: C:/Windows/Fonts/{src} não existe — copie uma serifa de jornal como fonts/{dst}")
print("fontes ok (PlayfairItalic, Fjalla, Poppins, TimesInv)")

# 2. index.html
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_earn.html")):
    shutil.copy(ih, R("index_antes_earn.html"))
if "==== edit-earn" not in html:
    css = open(os.path.join(SK, "estilo.css"), encoding="utf-8").read()
    i = html.index("</style>")
    html = html[:i] + css + html[i:]
faces = ["'italic 500 60px PlayfairItalic'", "'400 60px Fjalla'", "'600 40px Poppins'", "'700 40px Poppins'", "'900 60px Poppins'",
         "'400 30px TimesInv'", "'700 60px TimesInv'", "'italic 400 30px TimesInv'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "PlayfairItalic" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
if "clipn.js" not in html:
    html = html.replace('<script src="scenes.js"></script>', '<script src="clipn.js"></script>\n<script src="scenes.js"></script>', 1)
open(ih, "w", encoding="utf-8").write(html)
print("index.html ok")

# 3. componentes
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_a.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "componentes.js"), dst)
print(f"componentes -> work/{pref}_a.js (cenas em work/{pref}_b.js, {pref}_c.js ...)")

# 4. perfis e texturas padrão
os.makedirs(R("assets"), exist_ok=True)
for f in glob.glob(os.path.join(KIT, "biblioteca", "perfil_*.png")) + glob.glob(os.path.join(SK, "texturas", "*.jpg")) + glob.glob(os.path.join(SK, "texturas", "*.png")):
    if not os.path.exists(R("assets", os.path.basename(f))):
        shutil.copy(f, R("assets"))
# mattes de transição do projeto original -> render/eamattes.js, embutidas como data: URL (o Chromium bloqueia mask-image
# vindo de file:// por CORS, então não dá para usar os PNGs soltos em assets/)
import base64, io
from PIL import Image
mt = json.load(open(os.path.join(SK, "texturas", "mattes", "mattes.json"), encoding="utf-8"))
for nome, inf in mt.items():
    q = []
    for j in range(inf["n"]):
        im = Image.open(os.path.join(SK, "texturas", "mattes", nome, f"{j:02d}.png")).convert("RGBA").resize((180, 320), Image.LANCZOS)
        b = io.BytesIO(); im.save(b, "PNG", optimize=True); q.append("data:image/png;base64," + base64.b64encode(b.getvalue()).decode())
    inf["q"] = q
open(R("eamattes.js"), "w", encoding="utf-8").write("window.EA_MATTES = " + json.dumps(mt) + ";\n")
html = open(ih, encoding="utf-8").read()
if "eamattes.js" not in html:
    html = html.replace('<script src="scenes.js"></script>', '<script src="eamattes.js"></script>\n<script src="scenes.js"></script>', 1)
    open(ih, "w", encoding="utf-8").write(html)
subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)
print(f"assets ok (perfis, mesa, sala de TV, grade e ruído do projeto) | mattes: {sum(v['n'] for v in mt.values())} quadros em render/eamattes.js")

# 5. clipn.js e etapas.json
def clipn(proj):
    d = os.path.join(proj, "render", "clips"); n = {}
    if os.path.isdir(d):
        for c in sorted(os.listdir(d)):
            if os.path.isdir(os.path.join(d, c)):
                n[c] = len(glob.glob(os.path.join(d, c, "*.jpg")))
    open(os.path.join(proj, "render", "clipn.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(n) + ";\n")
    return n


print("clipes:", len(clipn(P)))
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg["prefixo"] = pref
cfg["montar"] = os.path.join(SK, "montar.py").replace("\\", "/")
cfg["trilha"] = os.path.join(SK, "trilha_earn.py").replace("\\", "/")
cfg["audio_final"] = "audio/final_mix_ea.wav"
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
    cfg["apresentador"] = "real"
cfg["cinema"] = False          # sem a grade de cinema do kit: a cor é por mundo, feita no render
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print("pronto. Próximo: imagens_ea.py (fotos / camadas), clipes (baixar_trechos + clipes.py do edit-founded), cenas em work/%s_b.js ..., montar.py, previas.py" % pref)
