"""Prepara um projeto do Kit_Edicao_Vox_v2 para a skill edit-avancada (soma dos 9 materiais da EarnEdits, 07/11/2026).
Depende da skill edit-earn instalada ao lado (~/.claude/skills/edit-earn): o motor daqui é a 2ª camada sobre o componentes.js dela.

uso (Python do kit):
  .venv\\Scripts\\python.exe preparar_av.py <projeto> [--prefixo xx] [--look retro|premium|pixel] [--avatar | --real | --sem-apresentador] [--sem-trilha]
  .venv\\Scripts\\python.exe preparar_av.py <projeto> --so-clipes      (depois de copiar trechos para render/clips/ ou imagens para render/assets/)

Faz (nunca apaga; guarda cópia do que troca):
  1. texturas da skill (av_reticula, av_grunge, av_papel, av_linha, av_tex03, av_janela) -> render/assets
  2. roda o preparar_earn.py da edit-earn: fontes, estilo.css, mattes, componentes.js -> work/<prefixo>_a.js, make_assets, clipn.js, etapas.json
  3. fontes: Franklin Gothic do Windows (Franklin, Franklin itálica, FranklinCond) + Inter 400/600/900 do kit; estilo_av.css e faces no
     pré-carregamento do index.html
  4. motor_av.js -> work/<prefixo>_b.js; cria work/<prefixo>_c.js com o look se ainda não existir (cenas em _c.js, _d.js ...)
  5. etapas.json: montar = montar.py desta skill (a trilha_earn.py, o áudio final e o resto continuam os da edit-earn); look
"""
import glob, json, os, re, shutil, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SK = os.path.dirname(os.path.abspath(__file__))
EARN = os.path.join(os.path.dirname(SK), "edit-earn")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}")
if not os.path.exists(os.path.join(EARN, "preparar_earn.py")):
    sys.exit(f"a skill edit-earn não está instalada em {EARN} (a edit-avancada usa o motor dela)")
R = lambda *p: os.path.join(P, "render", *p)
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
pref = opt("--prefixo", cfg.get("prefixo") or re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "av")


def clipn(proj):
    d = os.path.join(proj, "render", "clips"); n = {}
    if os.path.isdir(d):
        for c in sorted(os.listdir(d)):
            if os.path.isdir(os.path.join(d, c)):
                n[c] = len(glob.glob(os.path.join(d, c, "*.jpg")))
    open(os.path.join(proj, "render", "clipn.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(n) + ";\n")
    return n


if "--so-clipes" in a:
    n = clipn(P)
    subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)
    print(f"clipn.js: {len(n)} clipes ({', '.join(f'{k} {v}' for k, v in n.items())}) | make_assets ok")
    sys.exit(0)

# 1. texturas (antes do preparar_earn, que roda o make_assets no fim)
os.makedirs(R("assets"), exist_ok=True)
for f in glob.glob(os.path.join(SK, "texturas", "av_*.jpg")):
    d = R("assets", os.path.basename(f))
    if not os.path.exists(d) or os.path.getsize(d) != os.path.getsize(f):
        shutil.copy(f, d)
print("texturas da skill -> render/assets")

# 2. edit-earn
args = [sys.executable, os.path.join(EARN, "preparar_earn.py"), P, "--prefixo", pref] + [x for x in a[1:] if x in ("--avatar", "--real", "--sem-apresentador", "--sem-trilha")]
r = subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")
print("---- preparar_earn.py ----\n" + (r.stdout or "") + (r.stderr or ""))
if r.returncode != 0:
    sys.exit("preparar_earn.py falhou")

# 3. fontes + estilo + faces
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
for src, dst in (("framd.ttf", "FranklinM.ttf"), ("framdit.ttf", "FranklinMI.ttf"), ("FRAMDCN.TTF", "FranklinCond.ttf")):
    s = "C:/Windows/Fonts/" + src
    if not os.path.exists(os.path.join(fd, dst)):
        if os.path.exists(s): shutil.copy(s, os.path.join(fd, dst))
        else: print(f"AVISO: {s} não existe — a Franklin cai na fonte padrão (use Archivo/Inter)")
for w in (400, 600, 900):
    f = f"inter-latin-{w}-normal.woff2"
    if not os.path.exists(os.path.join(fd, f)):
        s = os.path.join(KIT, "projeto_modelo", "render", "fonts", f)
        if os.path.exists(s): shutil.copy(s, fd)
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_av.html")):
    shutil.copy(ih, R("index_antes_av.html"))
if "==== edit-avancada" not in html:
    css = open(os.path.join(SK, "estilo_av.css"), encoding="utf-8").read()
    i = html.index("</style>")
    html = html[:i] + css + html[i:]
faces = ["'400 40px Inter'", "'600 40px Inter'", "'900 60px Inter'", "'400 60px Franklin'", "'italic 400 60px Franklin'", "'400 60px FranklinCond'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "Franklin" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
open(ih, "w", encoding="utf-8").write(html)
print("fontes (Franklin, FranklinCond, Inter 400/600/900) + estilo_av.css + faces ok")

# 4. motor e arquivo de cenas inicial
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_b.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "motor_av.js"), dst)
look = opt("--look", cfg.get("look", "retro"))
cen = os.path.join(wd, f"{pref}_c.js")
if not os.path.exists(cen):
    open(cen, "w", encoding="utf-8").write(
        f"// ============ {os.path.basename(P.rstrip('/'))} — edit-avancada (look {look}) ============\n"
        f"window.AV_LOOK = '{look}';\n\n// cenas: cenaAV / avViagem / presAV (e os componentes da edit-earn). Exemplos em ~/.claude/skills/edit-avancada/cenas_exemplo.js\n")
print(f"motor -> work/{pref}_b.js | cenas em work/{pref}_c.js (look {look})")

# 5. etapas.json
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg["montar"] = os.path.join(SK, "montar.py").replace("\\", "/")
cfg["look"] = look
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print(f"pronto. Próximo: imagens/clipes (render/assets, render/clips + preparar_av.py {os.path.basename(P.rstrip('/'))} --so-clipes), "
      f"cenas em work/{pref}_c.js, montar.py, previas.py, pipeline.py fechar")
