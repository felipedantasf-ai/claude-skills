"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato edit-v4 (dossiê investigativo com a identidade da V4 Company).

uso (Python do kit, na raiz do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/edit-v4/preparar_ev4.py <projeto> [--prefixo xx] [--avatar | --real] [--sem-trilha]
  .venv\\Scripts\\python.exe ~/.claude/skills/edit-v4/preparar_ev4.py <projeto> --prefixo xx --so-biblioteca   (só atualiza work/xx_a.js)
(o kit fica em H:/Edição Claude/Kit_Edicao_Vox_v2; em outro PC, defina a variável VOX_KIT com a pasta do kit)

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo (já criado pelo pipeline.py preparar)
--prefixo  prefixo dos arquivos de cena em work/ (padrão: as 2 primeiras letras do nome)
--avatar   apresentador é avatar do HeyGen: 25–35% do vídeo, aparições SEMPRE de 2–4 s (o montar.py confere)
--real     gravação real: 30–42% do vídeo (referência 36%), aparições de 2–12 s
--sem-trilha  etapas.json sem a cama (os BAQUES dos cortes continuam: são parte da edição)

Faz (nunca apaga; guarda cópia do que troca; NÃO mexe no build_edl.py):
  1. fontes da V4 (da pasta fonts/ da skill): IBM Plex Sans + itálico, Morganite SemiBold/Bold, Fjalla One -> render/fonts
  2. render/index.html: CSS do formato (legenda.css), faces no pré-carregamento, <script> de clipn.js, olhos.js e marcas.js
  3. componentes.js + LOGO_V4_SVG (os SVG OFICIAIS de logo/, sem alteração) -> work/<prefixo>_a.js (cenas em _b.js, _c.js ...)
  4. textura t_parede (parede clara do mural), g_tv60 (TV antiga), prints de perfil da biblioteca; make_assets
  5. render/clipn.js, olhos.js (tarjas), marcas.js (marca-texto) e etapas.json (prefixo, montar, trilha, audio_final, perfil)
"""
import glob, json, os, re, shutil, subprocess, sys
import numpy as np

# edit-v4: tudo em DUOTONE da V4 (vinho #280000 nas sombras -> cinza-claro #F2F2F2 nas luzes) no lugar do P&B neutro
_V4_ESC, _V4_CLA = np.array([40, 0, 0], np.float32), np.array([242, 242, 242], np.float32)
def duo_v4(g):
    g = np.clip(np.asarray(g, np.float32), 0, 1)[..., None]
    return (_V4_ESC + (_V4_CLA - _V4_ESC) * g).astype(np.uint8)
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
    sys.exit(f"projeto não encontrado (sem render/): {P}. Rode antes: pipeline.py preparar <projeto> \"video.mp4\"")
pref = opt("--prefixo", re.sub(r"[^a-z]", "", os.path.basename(P.rstrip("/\\")).lower())[:2] or "ev")
R = lambda *p: os.path.join(P, "render", *p)


def componentes():
    """work/<pref>_a.js = componentes.js + LOGO_V4_SVG (os SVG oficiais do brand book, verbatim)"""
    wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
    dst = os.path.join(wd, f"{pref}_a.js")
    if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
    lg = {k: open(os.path.join(SK, "logo", f), encoding="utf-8").read().strip() for k, f in (("branca", "LogoV4Branca.svg"), ("vermelha", "LogoV4Vermelha.svg"))}
    s2 = open(os.path.join(SK, "componentes.js"), encoding="utf-8").read().rstrip()
    s2 += ("\n// logo OFICIAL (brand book V4 2026, assets/v4-logos.zip), inserido pelo preparar_ev4.py sem nenhuma alteração\n"
           f"const LOGO_V4_SVG = {json.dumps(lg, ensure_ascii=False)};\n")
    open(dst, "w", encoding="utf-8").write(s2)
    print(f"componentes da edit-v4 -> work/{pref}_a.js (cenas em work/{pref}_b.js, {pref}_c.js ...)")


if "--so-biblioteca" in a:
    componentes(); sys.exit(0)

# 1. fontes da V4
fd = R("fonts"); os.makedirs(fd, exist_ok=True)
for n in ("IBMPlexSans.ttf", "IBMPlexSans-Italic.ttf", "Morganite-SemiBold.ttf", "Morganite-Bold.ttf", "FjallaOne-Regular.ttf"):
    shutil.copy(os.path.join(SK, "fonts", n), os.path.join(fd, n))
print("fontes ok (IBM Plex Sans, Morganite, Fjalla One)")

# 2. index.html
ih = R("index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(R("index_antes_ev4.html")):
    shutil.copy(ih, R("index_antes_ev4.html"))
css = open(os.path.join(SK, "legenda.css"), encoding="utf-8").read()
if "==== edit-v4" in html:   # projeto já preparado: troca o bloco antigo pelo legenda.css atual (ex.: fundo branco, 29/10)
    i1 = html.index("/* ==== edit-v4")
    i2 = html.index("\n", html.index("#v4tinta", i1)) + 1
    html = html[:i1] + css + html[i2:]
else:
    i2 = html.index("</style>")
    html = html[:i2] + css + html[i2:]
faces = ["'500 40px Plex'", "'600 40px Plex'", "'700 40px Plex'", "'italic 600 40px Plex'", "'600 60px Morganite'", "'700 60px Morganite'", "'400 60px Fjalla'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "Morganite" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
for js in ("clipn.js", "olhos.js", "marcas.js"):
    if js not in html:
        html = html.replace('<script src="scenes.js"></script>', f'<script src="{js}"></script>\n<script src="scenes.js"></script>', 1)
open(ih, "w", encoding="utf-8").write(html)
print("index.html ok")

# 3. componentes
componentes()


# 4. texturas, TV e perfis
def parede(dst, n=1100, seed=5):
    """parede CLARA (fundo branco da V4), emendável (ruído periódico por FFT): reboco com manchas largas, grão fino e pintinhas"""
    rng = np.random.default_rng(seed)
    def ruido(escala):
        f = np.fft.fft2(rng.normal(0, 1, (n, n)))
        ky, kx = np.meshgrid(np.fft.fftfreq(n), np.fft.fftfreq(n), indexing="ij")
        k = np.sqrt(kx ** 2 + ky ** 2) + 1e-6
        r = np.real(np.fft.ifft2(f * np.exp(-(k * n / escala) ** 2)))
        return (r - r.mean()) / (r.std() + 1e-9)
    v = 253 + 1.8 * ruido(6) + 1.0 * ruido(40) + .7 * rng.normal(0, 1, (n, n))   # V4: parede BRANCA (~#F2F2F2 depois do duotone)
    pint = rng.random((n, n)) > .9985
    v[pint] -= rng.uniform(4, 10, pint.sum())
    Image.fromarray(duo_v4(np.clip(v, 0, 255) / 255)).save(dst, quality=90)


os.makedirs(R("assets"), exist_ok=True)
if not os.path.exists(R("assets", "t_parede.jpg")) or "--parede" in a:
    parede(R("assets", "t_parede.jpg"))
if not os.path.exists(R("assets", "g_tv60.png")):
    shutil.copy(os.path.join(SK, "modelo", "g_tv60.png"), R("assets", "g_tv60.png"))
for f in glob.glob(os.path.join(KIT, "biblioteca", "perfil_*.png")):
    if not os.path.exists(R("assets", os.path.basename(f))):
        shutil.copy(f, R("assets"))
subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True)
print("assets ok (t_parede, g_tv60, perfis)")


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
for js, var in (("olhos.js", "OLHOS"), ("marcas.js", "MARCAS")):
    if not os.path.exists(R(js)):
        open(R(js), "w", encoding="utf-8").write(f"window.{var} = {{}};\n")
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg["prefixo"] = pref
cfg["montar"] = os.path.join(SK, "montar.py").replace("\\", "/")
cfg["trilha"] = os.path.join(SK, "trilha_inv.py").replace("\\", "/")
cfg["audio_final"] = "audio/final_mix_inv.wav"
env = cfg.get("env", {})
if "--sem-trilha" in a:
    env["SEM_MUSICA"] = "1"
else:
    env.pop("SEM_MUSICA", None)
if env: cfg["env"] = env
else: cfg.pop("env", None)
if "--avatar" in a or "--real" in a:
    cfg["apresentador"] = "avatar" if "--avatar" in a else "real"
elif os.path.exists(os.path.join(P, "work", "apresentador.json")) or cfg.get("sem_rosto"):
    cfg["apresentador"] = "avatar"
cfg.pop("workers", None)
cfg["cinema"] = False          # sem a grade de cinema do kit: o look é feito no render
json.dump(cfg, open(ej, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("etapas.json:", json.dumps(cfg, ensure_ascii=False))
print("pronto. Próximo: corte e beats (pipeline.py preparar), provas.py/pagina.py, cenas em work/%s_b.js ..., safezone.py" % pref)
