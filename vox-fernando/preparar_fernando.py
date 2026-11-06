"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato vox-fernando (vídeos do Fernando Miranda).

uso (na raiz do kit, com o Python do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/vox-fernando/preparar_fernando.py <projeto> --prefixo xx [--rosto-x 1000]
(o kit fica em H:/Edição Claude/Kit_Edicao_Vox_v2; em outro PC, defina a variável VOX_KIT com a pasta do kit)

Rode DEPOIS de `pipeline.py preparar <projeto> "video.mp4"` (ingestão) e ANTES de preencher o corte. Faz:
  1. o preparar_formato.py da vox-editorial (fontes Sitka, legenda, componentes -> work/<xx>_a.js, pipeline melhorado que vem em modelo/);
  2. work/<xx>_b.js = componentes_fernando.js (paleta laranja/vermelho/branco/preto, apresentador, mapas, logos, celular, peças);
  3. ajustes no <xx>_a.js: fita das fotos neutra, marca-texto laranja, palavra-chave em itálico também na legenda escura;
  4. build_edl.py limpo: PROTEGE, CORTE_MANUAL e TAIL_FIX zerados; INSERE = {} garantido;
  5. render/assets: t_laranja (mesa), t_papel, perfil_avatar e perfil_texto (print REAL do @fernandomiranda777);
  6. tools/: asr_janelas, frames_largos, meio_tom e qa_denso; fotos/: busca_prev, baixa_sel, folha e busca_logos (Commons);
  7. etapas.json: prefixo e frames_largos centrado no rosto (--rosto-x = x do rosto na fonte 1920x1080).
Não apaga nada: o que for substituído ganha cópia .antes.
"""
import os, re, shutil, subprocess, sys, json
for _s in (sys.stdout, sys.stderr):   # stderr também: o modo de uso e os erros saem por ele
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
SK = os.path.dirname(os.path.abspath(__file__))
VE = os.path.join(os.path.dirname(SK), "vox-editorial")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
MODELO = os.path.join(SK, "modelo")   # arquivos do projeto de referência (LulaGanhouEmpresa, 26/10/2026), vão junto com a skill
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if not os.path.isdir(os.path.join(P, "render")):
    sys.exit(f"projeto não encontrado (sem render/): {P}. Rode antes: pipeline.py preparar <projeto> \"video.mp4\"")
pref = opt("--prefixo", os.path.basename(P.rstrip("/\\"))[:2].lower())
rosto_x = opt("--rosto-x", "1000")

# 1. formato vox-editorial (pipeline melhorado de modelo/)
r = subprocess.run([sys.executable, os.path.join(VE, "preparar_formato.py"), P, "--prefixo", pref, "--origem", MODELO], text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print(r.stdout.strip()); print(r.stderr.strip()) if r.returncode else None
if r.returncode:
    sys.exit("preparar_formato.py falhou")

def guarda(p):
    if os.path.exists(p) and not os.path.exists(p + ".antes"):
        shutil.copy(p, p + ".antes")

# 2. biblioteca do Fernando
wb = os.path.join(P, "work", f"{pref}_b.js")
guarda(wb); shutil.copy(os.path.join(SK, "componentes_fernando.js"), wb)
print(f"biblioteca do Fernando -> work/{pref}_b.js (cenas em work/{pref}_c.js, {pref}_d.js ...)")

# 3. ajustes no componentes (<pref>_a.js)
wa = os.path.join(P, "work", f"{pref}_a.js")
s = open(wa, encoding="utf-8").read()
for x, y in (("rgba(201,192,222,.8)", "rgba(236,226,196,.86)"), ("rgba(201,192,222,.82)", "rgba(236,226,196,.86)"), ("#c9c0de", "#ece2c4"),
             ("MK('#ffe600')", "MK('rgba(238,106,31,.45)')"),
             ("l1.length && mode === 'title' ? ' it' : ''", "l1.length && (mode === 'title' || mode === 'dark') ? ' it' : ''")):
    s = s.replace(x, y)
open(wa, "w", encoding="utf-8").write(s)
print("componentes ajustados (fita neutra, marca-texto laranja, itálico na legenda escura)")

# 4. build_edl.py sem configuração de outro vídeo
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

# 5. assets
ad = os.path.join(P, "render", "assets"); os.makedirs(ad, exist_ok=True)
shutil.copy(os.path.join(SK, "t_laranja.jpg"), os.path.join(ad, "t_laranja.jpg"))
for n in ("t_papel.jpg", "t_pergaminho.jpg", "perfil_avatar.png", "perfil_texto.png"):
    shutil.copy(os.path.join(MODELO, "render", "assets", n), os.path.join(ad, n))
print("assets: t_laranja, t_papel, t_pergaminho, perfil_avatar, perfil_texto")

# 6. ferramentas
for n in ("asr_janelas.py", "frames_largos.py", "meio_tom.py", "qa_denso.py"):
    src, dst = os.path.join(MODELO, "tools", n), os.path.join(P, "tools", n)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
fd = os.path.join(P, "fotos"); os.makedirs(os.path.join(fd, "prev"), exist_ok=True); os.makedirs(os.path.join(fd, "sel"), exist_ok=True)
os.makedirs(os.path.join(fd, "logos"), exist_ok=True); os.makedirs(os.path.join(fd, "folhas"), exist_ok=True)
for n in ("busca_prev.py", "baixa_sel.py", "folha.py", "busca_logos.py"):
    src, dst = os.path.join(MODELO, "fotos", n), os.path.join(fd, n)
    if os.path.exists(src) and not os.path.exists(dst):
        shutil.copy(src, dst)
print("tools/ e fotos/ prontos")

# 7. etapas.json
ej = os.path.join(P, "etapas.json")
cfg = json.load(open(ej, encoding="utf-8")) if os.path.exists(ej) else {}
cfg.update({"prefixo": pref, "quadros_extra": ["tools/frames_largos.py", str(rosto_x)]})
cfg.pop("workers", None)        # processos do render: padrão do pipeline.py (WORKERS), medido por máquina
json.dump(cfg, open(ej, "w", encoding="utf-8"))
r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
print("etapas.json:", json.dumps(cfg), "| make_assets:", (r.stdout.strip().splitlines() or ["?"])[-1][:90])
print("pronto. Próximo: corte (fix/DROP/CUT_TAIL no build_edl.py) -> pipeline.py preparar <projeto> -> sincronia.py e olhar.py varredura")
