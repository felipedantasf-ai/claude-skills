"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato vox-v4 (vídeos da V4 Company, brand book 2026).

uso (na raiz do kit, com o Python do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/vox-v4/preparar_v4.py <projeto> --prefixo xx [--rosto-x 1000] [--perfil <pasta>]
  .venv\\Scripts\\python.exe ~/.claude/skills/vox-v4/preparar_v4.py <projeto> --prefixo xx --so-biblioteca   (projeto já cortado: só o work/xx_b.js)
(o kit fica em H:/Edição Claude/Kit_Edicao_Vox_v2; em outro PC, defina a variável VOX_KIT com a pasta do kit)

Rode DEPOIS de `pipeline.py preparar <projeto> "video.mp4"` (ingestão) e ANTES de preencher o corte. Faz:
  1. o preparar_formato.py da vox-editorial (legenda, componentes -> work/<xx>_a.js, pipeline melhorado que vem em modelo/);
  2. fontes da marca em render/fonts (IBM Plex Sans + itálico, Morganite SemiBold/Bold, Fjalla One) e as @font-face no index.html;
     a legenda passa a ser IBM Plex Sans (branca sobre o vermelho, vinho sobre papel branco, tarja vinho);
  3. work/<xx>_b.js = componentes_v4.js + LOGO_V4_SVG (os SVG OFICIAIS de logo/, sem nenhuma alteração);
  4. ajustes no <xx>_a.js: SERIF = Plex, fita das fotos neutra, marca-texto amarelo V4, itálico também na legenda escura;
  5. build_edl.py limpo: PROTEGE, CORTE_MANUAL e TAIL_FIX zerados; INSERE = {} garantido;
  6. render/assets: t_v4 (mesa vermelha), t_papel, t_pergaminho; com --perfil <pasta>, perfil_avatar.png e perfil_texto.png de lá
     (recortes do print REAL do perfil de quem apresenta, para o celular do final);
  7. tools/: asr_janelas, frames_largos, meio_tom e qa_denso; fotos/: busca_prev, baixa_sel, folha e busca_logos (Commons);
  8. etapas.json: prefixo e frames_largos centrado no rosto (--rosto-x = x do rosto na fonte 1920x1080).
Não apaga nada: o que for substituído ganha cópia .antes. Projeto com corte já preenchido: recusa (use --so-biblioteca, ou --forcar).
"""
import os, re, shutil, subprocess, sys, json
for _s in (sys.stdout, sys.stderr):   # stderr também: o modo de uso e os erros saem por ele
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
SK = os.path.dirname(os.path.abspath(__file__))
VE = os.path.join(os.path.dirname(SK), "vox-editorial")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
MODELO = os.path.join(SK, "modelo")   # pipeline do projeto de referência (LulaGanhouEmpresa, 26/10/2026), vai junto com a skill
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}. Rode antes: pipeline.py preparar <projeto> \"video.mp4\"")
pref = opt("--prefixo", os.path.basename(P.rstrip("/\\"))[:2].lower())
rosto_x = opt("--rosto-x", "1000")

def biblioteca():
    """work/<pref>_b.js = componentes_v4.js + LOGO_V4_SVG (os SVG OFICIAIS de logo/, sem nenhuma alteração)"""
    wb = os.path.join(P, "work", f"{pref}_b.js")
    if os.path.exists(wb) and not os.path.exists(wb + ".antes"):
        shutil.copy(wb, wb + ".antes")
    lg = {k: open(os.path.join(SK, "logo", f), encoding="utf-8").read().strip() for k, f in (("branca", "LogoV4Branca.svg"), ("vermelha", "LogoV4Vermelha.svg"))}
    s2 = open(os.path.join(SK, "componentes_v4.js"), encoding="utf-8").read().rstrip()
    s2 += ("\n// logo OFICIAL (brand book V4 2026, assets/v4-logos.zip), inserido pelo preparar_v4.py sem nenhuma alteração\n"
           f"const LOGO_V4_SVG = {json.dumps(lg, ensure_ascii=False)};\n")
    os.makedirs(os.path.join(P, "work"), exist_ok=True)
    open(wb, "w", encoding="utf-8").write(s2)
    print(f"biblioteca da V4 -> work/{pref}_b.js (cenas em work/{pref}_c.js, {pref}_d.js ...)")

if "--so-biblioteca" in a:   # projeto já cortado: atualiza só a biblioteca da V4 (safe zone, correções), sem tocar no corte
    biblioteca(); sys.exit(0)
be0 = os.path.join(P, "build_edl.py")
if os.path.exists(be0) and "--forcar" not in a:
    t0 = open(be0, encoding="utf-8").read()
    if re.search(r"^(fix|merge)\(", t0, re.M) or re.search(r"^DROP = \{\d", t0, re.M) or re.search(r"^CUT_(HEAD|TAIL) = \{\d", t0, re.M):
        sys.exit("este projeto já tem corte no build_edl.py: rodar o preparar de novo apagaria o corte.\n"
                 f"Para atualizar só a biblioteca da V4: preparar_v4.py {a[0]} --prefixo {pref} --so-biblioteca   (ou --forcar, se é isso mesmo)")

# 1. formato vox-editorial (pipeline melhorado de modelo/)
r = subprocess.run([sys.executable, os.path.join(VE, "preparar_formato.py"), P, "--prefixo", pref, "--origem", MODELO], text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print(r.stdout.strip()); print(r.stderr.strip()) if r.returncode else None
if r.returncode:
    sys.exit("preparar_formato.py falhou")

def guarda(p):
    if os.path.exists(p) and not os.path.exists(p + ".antes"):
        shutil.copy(p, p + ".antes")

# 2. fontes da marca + legenda em IBM Plex Sans
fd = os.path.join(P, "render", "fonts"); os.makedirs(fd, exist_ok=True)
for n in ("IBMPlexSans.ttf", "IBMPlexSans-Italic.ttf", "Morganite-SemiBold.ttf", "Morganite-Bold.ttf", "FjallaOne-Regular.ttf"):
    shutil.copy(os.path.join(SK, "fonts", n), os.path.join(fd, n))
ih = os.path.join(P, "render", "index.html")
html = open(ih, encoding="utf-8").read()
FF = ("@font-face { font-family: Plex; src: url(fonts/IBMPlexSans.ttf); font-weight: 100 700; font-style: normal; }\n"
      "@font-face { font-family: Plex; src: url(fonts/IBMPlexSans-Italic.ttf); font-weight: 100 700; font-style: italic; }\n"
      "@font-face { font-family: Morganite; src: url(fonts/Morganite-SemiBold.ttf); font-weight: 600; }\n"
      "@font-face { font-family: Morganite; src: url(fonts/Morganite-Bold.ttf); font-weight: 700; }\n"
      "@font-face { font-family: Fjalla; src: url(fonts/FjallaOne-Regular.ttf); }\n")
if "font-family: Plex" not in html:
    last = [m.end() for m in re.finditer(r"@font-face[^\n]*\n", html)]
    html = html[:last[-1]] + FF + html[last[-1]:]
m = re.search(r"#cap \{.*?^#grain \{[^\n]*\n", html, re.S | re.M)
if not m:
    sys.exit("não achei o bloco #cap ... #grain no index.html")
cap = m.group(0)
for x, y in (("background: #111; color: #f3efe6;", "background: #280000; color: #ffffff;"), ("font-family: Sitka;", "font-family: Plex;"),
             ("color: #f3efe6;", "color: #ffffff;"), ("#cap.m-dark { color: #1d1d1d;", "#cap.m-dark { color: #280000;"), ("background: #f3efe6;", "background: #FFDD00;"),
             ("#cap .l2 { font-size: var(--fs, 96px); font-weight: 600; letter-spacing: -.005em;", "#cap .l2 { font-size: var(--fs, 96px); font-weight: 600; letter-spacing: -.012em;")):
    cap = cap.replace(x, y)
html = html[:m.start()] + cap + html[m.end():]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "Plex" not in mf.group(1):
    faces = ["'500 60px Plex'", "'600 60px Plex'", "'700 60px Plex'", "'italic 500 60px Plex'", "'italic 600 60px Plex'", "'600 60px Morganite'", "'700 60px Morganite'", "'400 60px Fjalla'"]
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
open(ih, "w", encoding="utf-8").write(html)
print("fontes da marca (Plex, Morganite, Fjalla) e legenda em IBM Plex Sans")

# 3. biblioteca da V4 + logo oficial (SVG do brand book, verbatim)
biblioteca()

# 4. ajustes no componentes (<pref>_a.js)
wa = os.path.join(P, "work", f"{pref}_a.js")
s = open(wa, encoding="utf-8").read()
for x, y in (("const SERIF = 'Sitka';", "const SERIF = 'Plex';   // vox-v4: a fala e os textos em IBM Plex Sans (brand book V4)"),
             ("rgba(201,192,222,.8)", "rgba(242,242,242,.86)"), ("rgba(201,192,222,.82)", "rgba(242,242,242,.86)"), ("#c9c0de", "#f2f2f2"),
             ("MK('#ffe600')", "MK('rgba(255,221,0,.62)')"),
             ("l1.length && mode === 'title' ? ' it' : ''", "l1.length && (mode === 'title' || mode === 'dark') ? ' it' : ''")):
    s = s.replace(x, y)
open(wa, "w", encoding="utf-8").write(s)
print("componentes ajustados (Plex, fita neutra, marca-texto amarelo V4, itálico na legenda escura)")

# 5. build_edl.py sem configuração de outro vídeo
be = os.path.join(P, "build_edl.py")
s = open(be, encoding="utf-8").read()
s = re.sub(r"^PROTEGE = \[\(.*$", "PROTEGE = []   # [(início, fim)] na fonte: finais baixos (\"-to\", \"-s\") que o aperto ou o filtro de ilhas comiam", s, flags=re.M)
s = re.sub(r"^CORTE_MANUAL = \[\(.*$", "CORTE_MANUAL = []", s, flags=re.M)
s = re.sub(r"^TAIL_FIX = \{\d.*$", "TAIL_FIX = {}", s, flags=re.M)
if not re.search(r"^INSERE = ", s, re.M):
    s = re.sub(r"^(CUT_TAIL = \{\}.*)$", lambda m: m.group(1) + "\nINSERE = {}   # {trecho: s de espaço antes dele} para inserir fala de terceiros com o áudio deles",
               s, count=1, flags=re.M)
open(be, "w", encoding="utf-8").write(s)
print("build_edl.py: PROTEGE/CORTE_MANUAL/TAIL_FIX zerados, INSERE ok")

# 6. assets
ad = os.path.join(P, "render", "assets"); os.makedirs(ad, exist_ok=True)
shutil.copy(os.path.join(SK, "t_v4.jpg"), os.path.join(ad, "t_v4.jpg"))
for n in ("t_papel.jpg", "t_pergaminho.jpg"):
    shutil.copy(os.path.join(MODELO, "render", "assets", n), os.path.join(ad, n))
pf = opt("--perfil")
if pf:
    for n in ("perfil_avatar.png", "perfil_texto.png"):
        src = os.path.join(pf, n) if os.path.isdir(pf) else None
        if src and os.path.exists(src):
            shutil.copy(src, os.path.join(ad, n))
        else:
            print(f"AVISO: {n} não está em {pf}: o celular do final precisa dos recortes do print REAL do perfil")
print("assets: t_v4, t_papel, t_pergaminho" + (" + perfil" if pf else " (sem perfil: final com logoV4 ou --perfil)"))

# 7. ferramentas
for n in ("asr_janelas.py", "frames_largos.py", "meio_tom.py", "qa_denso.py"):
    src, dst = os.path.join(MODELO, "tools", n), os.path.join(P, "tools", n)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
fo = os.path.join(P, "fotos")
for d in ("prev", "sel", "logos", "folhas"):
    os.makedirs(os.path.join(fo, d), exist_ok=True)
for n in ("busca_prev.py", "baixa_sel.py", "folha.py", "busca_logos.py"):
    src, dst = os.path.join(MODELO, "fotos", n), os.path.join(fo, n)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
print("tools/ e fotos/ prontos")

# 8. etapas.json
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg.update({"prefixo": pref, "quadros_extra": ["tools/frames_largos.py", str(rosto_x)]})
cfg.pop("workers", None)        # processos do render: padrão do pipeline.py (WORKERS), medido por máquina
json.dump(cfg, open(ej, "w", encoding="utf-8"))
r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print("etapas.json:", json.dumps(cfg), "| make_assets:", (r.stdout.strip().splitlines() or ["?"])[-1][:90])
print("pronto. Próximo: corte (fix/DROP/CUT_TAIL no build_edl.py) -> pipeline.py preparar <projeto> -> sincronia/olhar")
