"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-tng (The Numbers Game: planos REAIS em corte seco, 12 imagens/s).

uso (Python do kit):  .venv\\Scripts\\python.exe preparar_tng.py <projeto> [--prefixo xx] [--selo TNG] [--sem-trilha]

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo (já criado pelo pipeline.py preparar, áudio primeiro)
--sem-trilha  sem a cama de trap (o formato TEM trilha; os cliques e o obturador continuam)

Faz (nunca apaga; guarda cópia do que troca com .antes_tng):
  1. fontes: Californian FB Italic (C:/Windows/Fonts/CALIFI.TTF) -> render/fonts/TngSerifI.ttf (números do contador);
     Inter 700 e Archivo Black já vêm no projeto_modelo
  2. render/index.html: CSS do formato (tng.css), fontes no pré-carregamento, <script> de clipn.js antes do scenes.js
  3. 24 q/s: FPS = 24 no render.py, render_par.py e engine.js do projeto; o render.py grava os 2 quadros de cada degrau de
     1/12 s com UMA captura (window.TNG_CHAVE) -> metade do tempo de render
  4. componentes.js -> work/<prefixo>_a.js (cenas em work/<prefixo>_b.js, _c.js ...)
  5. render/clipn.js (CLIPN + CLIPFPS = 24) e etapas.json (prefixo, montar, trilha, audio_final, cinema false, env)
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
pref = opt("--prefixo", re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "tn")
R = lambda *p: os.path.join(P, "render", *p)


def guarda(f):
    if os.path.exists(f) and not os.path.exists(f + ".antes_tng"):
        shutil.copy(f, f + ".antes_tng")


# 1. fontes
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
if not os.path.exists(os.path.join(fd, "TngSerifI.ttf")):
    for s in ("C:/Windows/Fonts/CALIFI.TTF", "C:/Windows/Fonts/georgiai.ttf", "C:/Windows/Fonts/timesi.ttf"):
        if os.path.exists(s):
            shutil.copy(s, os.path.join(fd, "TngSerifI.ttf")); print("serifa itálica do contador:", os.path.basename(s)); break
    else:
        print("AVISO: nenhuma serifa itálica em C:/Windows/Fonts — copie uma como render/fonts/TngSerifI.ttf")
for w in ("700",):
    if not os.path.exists(os.path.join(fd, f"inter-latin-{w}-normal.woff2")):
        shutil.copy(os.path.join(KIT, "projeto_modelo", "render", "fonts", f"inter-latin-{w}-normal.woff2"), fd)

# 2. index.html
ih = R("index.html"); guarda(ih)
html = open(ih, encoding="utf-8").read()
if "==== edit-tng" not in html:
    i = html.index("</style>")
    html = html[:i] + open(os.path.join(SK, "tng.css"), encoding="utf-8").read() + html[i:]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "TngSerifI" not in mf.group(1):
    html = html[:mf.end(1)] + ", 'italic 400 103px TngSerifI', '700 60px Inter', '400 51px Archivo'" + html[mf.end(1):]
if "clipn.js" not in html:
    html = html.replace('<script src="scenes.js"></script>', '<script src="clipn.js"></script>\n<script src="scenes.js"></script>', 1)
open(ih, "w", encoding="utf-8").write(html)
print("index.html ok (tng.css, fontes, clipn.js)")

# 3. 24 q/s
for nome, pad, novo in (("render.py", r"^FPS = 30\b", "FPS = 24"), ("render_par.py", r"^FPS = 30\b", "FPS = 24"),
                        (os.path.join("render", "engine.js"), r"FPS = 30,", "FPS = 24,")):
    f = os.path.join(P, nome)
    s = open(f, encoding="utf-8").read()
    s2 = re.sub(pad, novo, s, count=1, flags=re.M)
    if s2 != s:
        guarda(f); open(f, "w", encoding="utf-8").write(s2)
    print(f"{nome}: FPS {'24' if re.search(re.escape(novo), s2) else '??? (confira)'}")
f = os.path.join(P, "render.py"); s = open(f, encoding="utf-8").read()
if "TNG_CHAVE" not in s:
    m = re.search(r"( +)for f in range\(f0, f1\):\n( +)await pg\.evaluate\(f\"render\(\{f / FPS\}\)\"\)\n +await trgl_quadro\(pg, cdp\)\n"
                  r" +(r = await cdp\.send\(\"Page\.captureScreenshot\".*?\))\n +ff\.stdin\.write\(base64\.b64decode\(r\[\"data\"\]\)\)\n", s)
    if m:
        i0, i1 = m.group(1), m.group(2)
        novo = (f"{i0}_ch, _jpg = None, None\n"
                f"{i0}for f in range(f0, f1):\n"
                f"{i1}ch = await pg.evaluate(f\"window.TNG_CHAVE ? TNG_CHAVE({{f / FPS}}) : {{f}}\")   # edit-tng: 1 captura por degrau de 1/12 s\n"
                f"{i1}if ch != _ch or _jpg is None:\n"
                f"{i1}    await pg.evaluate(f\"render({{f / FPS}})\")\n"
                f"{i1}    await trgl_quadro(pg, cdp)\n"
                f"{i1}    {m.group(3)}\n"
                f"{i1}    _jpg, _ch = base64.b64decode(r[\"data\"]), ch\n"
                f"{i1}ff.stdin.write(_jpg)\n")
        guarda(f); open(f, "w", encoding="utf-8").write(s[:m.start()] + novo + s[m.end():])
        print("render.py: 1 captura por degrau (TNG_CHAVE)")
    else:
        print("AVISO: render.py diferente do modelo — o reaproveitamento por degrau não foi ligado (render sai igual, só mais lento)")

# 4. componentes
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_a.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "componentes.js"), dst)
print(f"componentes -> work/{pref}_a.js (cenas em work/{pref}_b.js, {pref}_c.js ...)")
os.makedirs(R("assets"), exist_ok=True)
subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)

# 5. clipn.js, camdata.js (formato sem apresentador: o index.html do kit carrega o arquivo mesmo assim), etapas.json
if not os.path.exists(R("camdata.js")):
    open(R("camdata.js"), "w", encoding="utf-8").write("window.FACE = {cx: [540], cy: [760], s: [1]};   // edit-tng: sem apresentador\n")
d = R("clips"); n = {}
if os.path.isdir(d):
    for c in sorted(os.listdir(d)):
        if os.path.isdir(os.path.join(d, c)):
            n[c] = len(glob.glob(os.path.join(d, c, "*.jpg")))
open(R("clipn.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(n) + ";\nwindow.CLIPFPS = 24;\n")
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg.update({"prefixo": pref, "montar": os.path.join(SK, "montar.py").replace("\\", "/"),
            "trilha": os.path.join(SK, "trilha_tng.py").replace("\\", "/"), "audio_final": "audio/final_mix_tng.wav",
            "cinema": False, "apresentador": "sem"})
env = cfg.get("env", {})
env["SOM_CORTE"] = "0"                   # o corte seco não tem som (72% dos cortes da referência são secos)
env["NIVEL_SFX"] = "-120"                # o som do formato é todo do trilha_tng.py (clique, obturador, trilha): o bus tátil do kit fica mudo
env["SEM_PAN"] = "1"                     # os sons do formato não usam o pan pela tela do render.py events
if "--sem-trilha" in a: env["SEM_MUSICA"] = "1"
else: env.pop("SEM_MUSICA", None)
cfg["env"] = env
cfg.pop("workers", None)
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
if opt("--selo"):
    print(f"selo: ponha TNG.selo = '{opt('--selo')}' no topo de work/{pref}_b.js")
print(f"pronto. Próximo: material (buscar/varrer/baixar_hd/clipes_tng/banco), cenas em work/{pref}_b.js ..., montar.py, previas")
