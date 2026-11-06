"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-papel (papel amassado + retícula).

uso (Python do kit):  .venv\\Scripts\\python.exe preparar_formato.py <projeto> [--prefixo xx] [--avatar | --real] [--sem-trilha]

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo (já criado pelo pipeline.py preparar / novo_projeto.py)
--prefixo  prefixo dos arquivos de cena em work/ (padrão: as 2 primeiras letras do nome)
--avatar   apresentador é avatar do HeyGen: ~30% do vídeo, aparições sempre de 2–4 s (o montar.py confere)
--real     gravação real do apresentador: 40–55% do vídeo, aparições de 1,5–5 s
           (sem os dois: avatar se houver work/apresentador.json ou "sem_rosto" no etapas.json; senão real)
--sem-trilha  etapas.json sem a trilha sintetizada (o padrão do formato TEM trilha baixa por baixo da voz)

Faz (nunca apaga; guarda cópia *.antes do que troca):
  1. fontes: Ink Free (C:/Windows/Fonts/Inkfree.ttf) -> render/fonts/InkFree.ttf (Inter e Playfair já vêm no kit)
  2. render/index.html: CSS do formato (legenda.css) no fim do <style>, faces no pré-carregamento, <script clipn.js>
  3. componentes.js -> work/<prefixo>_a.js (cenas em work/<prefixo>_b.js, _c.js ...)
  4. texturas t_amassado + t_preto (papel.py) e os prints de perfil da biblioteca do kit em render/assets; make_assets.py
  5. render/clipn.js (quadros de cada clipe em render/clips) e etapas.json (prefixo, montar e trilha do formato)
"""
import glob, json, os, re, shutil, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SK = os.path.dirname(os.path.abspath(__file__))
KIT = "H:/Edição Claude/Kit_Edicao_Vox_v2"
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}")
pref = opt("--prefixo", re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "pp")
R = lambda *p: os.path.join(P, "render", *p)

# 1. fontes
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
if not os.path.exists(os.path.join(fd, "InkFree.ttf")):
    s = "C:/Windows/Fonts/Inkfree.ttf"
    if os.path.exists(s): shutil.copy(s, os.path.join(fd, "InkFree.ttf"))
    else: print("AVISO: C:/Windows/Fonts/Inkfree.ttf não existe — copie uma manuscrita caixa alta como fonts/InkFree.ttf")
falta = [w for w in ("400", "600", "900") if not os.path.exists(os.path.join(fd, f"inter-latin-{w}-normal.woff2"))]
if falta:
    for w in falta:
        s = os.path.join(KIT, "projeto_modelo", "render", "fonts", f"inter-latin-{w}-normal.woff2")
        if os.path.exists(s): shutil.copy(s, fd)
print("fontes ok")

# 2. index.html
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_papel.html")):
    shutil.copy(ih, R("index_antes_papel.html"))
if "==== edit-papel" not in html:
    css = open(os.path.join(SK, "legenda.css"), encoding="utf-8").read()
    i = html.index("</style>")
    html = html[:i] + css + html[i:]
faces = ["'400 40px Inter'", "'600 40px Inter'", "'900 40px Inter'", "'400 60px Playfair'", "'400 60px InkFree'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "InkFree" not in mf.group(1):
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

# 4. texturas e perfis
os.makedirs(R("assets"), exist_ok=True)
if not os.path.exists(R("assets", "t_amassado.jpg")):
    subprocess.run([sys.executable, os.path.join(SK, "papel.py"), P], check=False)
for f in glob.glob(os.path.join(KIT, "biblioteca", "perfil_*.png")):
    if not os.path.exists(R("assets", os.path.basename(f))):
        shutil.copy(f, R("assets"))
subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)
print("assets ok (t_amassado, t_preto, perfis)")

# 5. clipn.js + etapas.json
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
if "--sem-trilha" in a:
    cfg.pop("trilha", None); cfg.pop("audio_final", None)
else:
    cfg["trilha"] = os.path.join(SK, "trilha.py").replace("\\", "/")
    cfg["audio_final"] = "audio/final_mix_papel.wav"
if "--avatar" in a or "--real" in a:
    cfg["apresentador"] = "avatar" if "--avatar" in a else "real"
elif os.path.exists(os.path.join(P, "work", "apresentador.json")) or cfg.get("sem_rosto"):
    cfg["apresentador"] = "avatar"
cfg.pop("workers", None)        # processos do render: padrão do pipeline.py (WORKERS), medido por máquina
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print("pronto. Próximo: fotos -> reticula.py, clipes -> clipes.py, cenas em work/%s_b.js ..., montar.py, previas.py" % pref)
