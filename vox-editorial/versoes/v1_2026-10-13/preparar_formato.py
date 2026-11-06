"""Prepara um projeto do Kit_Edicao_Vox_v2 para o formato vox-editorial.

uso (com o Python do kit):
  ..\\..\\.venv\\Scripts\\python.exe preparar_formato.py <projeto> [--prefixo xx] [--origem lula_pix_mei] [--sem-pipeline]

<projeto>  nome em Kit_Edicao_Vox_v2/projetos/ ou caminho completo
--prefixo  prefixo dos arquivos de cena em work/ (padrão: as 2 primeiras letras do nome)
--origem   projeto de onde vêm as melhorias do pipeline (corte sem silêncios, mix com --trilha/--saida,
           entregar com --audio, engine com S.capY). Padrão: lula_pix_mei
--sem-pipeline  não copia build_edl.py/mix.py/entregar.py/engine.js

Faz:
  1. copia as fontes Sitka (C:/Windows/Fonts/SitkaVF*.ttf) para render/fonts/Sitka.ttf e Sitka-Italic.ttf
  2. render/index.html: @font-face da Sitka, troca o bloco #cap ... #grain pelo legenda.css, pré-carrega as faces
  3. copia componentes.js para work/<prefixo>_a.js (primeira parte do scenes.js)
  4. copia o pipeline melhorado da origem; o build_edl.py vem com a configuração de corte zerada para preencher
Não apaga nada: faz cópia de segurança de index.html (index_antes_formato.html) e dos arquivos substituídos (*.antes).
"""
import os, re, shutil, sys
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
pref = opt("--prefixo", os.path.basename(P.rstrip("/\\"))[:2].lower())
ORIG = opt("--origem", "lula_pix_mei")
ORIG = ORIG if os.path.isabs(ORIG) else os.path.join(KIT, "projetos", ORIG)

# 1. fontes
fd = os.path.join(P, "render", "fonts"); os.makedirs(fd, exist_ok=True)
for src, dst in (("SitkaVF.ttf", "Sitka.ttf"), ("SitkaVF-Italic.ttf", "Sitka-Italic.ttf")):
    s = os.path.join("C:/Windows/Fonts", src)
    if not os.path.exists(os.path.join(fd, dst)):
        if os.path.exists(s): shutil.copy(s, os.path.join(fd, dst))
        else: print(f"AVISO: {s} não existe — copie uma serifa com itálico como fonts/{dst}")
print("fontes ok")

# 2. index.html
ih = os.path.join(P, "render", "index.html")
html = open(ih, encoding="utf-8").read()
if not os.path.exists(os.path.join(P, "render", "index_antes_formato.html")):
    shutil.copy(ih, os.path.join(P, "render", "index_antes_formato.html"))
ff = ("@font-face { font-family: Sitka; src: url(fonts/Sitka.ttf); font-weight: 100 900; font-style: normal; }\n"
      "@font-face { font-family: Sitka; src: url(fonts/Sitka-Italic.ttf); font-weight: 100 900; font-style: italic; }\n")
if "font-family: Sitka" not in html:
    last = [m.end() for m in re.finditer(r"@font-face[^\n]*\n", html)]
    html = html[:last[-1]] + ff + html[last[-1]:] if last else html.replace("<style>\n", "<style>\n" + ff, 1)
css = open(os.path.join(SK, "legenda.css"), encoding="utf-8").read()
m = re.search(r"^(/\*[^\n]*formato[^\n]*\n(?:[^\n]*\n)*?)?#cap \{.*?^#grain \{[^\n]*\n", html, re.S | re.M)
if not m:
    sys.exit("não achei o bloco #cap ... #grain no index.html — insira legenda.css à mão no <style>")
html = html[:m.start()] + css.rstrip("\n") + "\n" + html[m.end():]
faces = ["'500 60px Sitka'", "'600 60px Sitka'", "'700 60px Sitka'", "'italic 600 60px Sitka'", "'italic 500 60px Sitka'"]
mf = re.search(r"const faces = \[(.*?)\];", html, re.S)
if mf and "Sitka" not in mf.group(1):
    html = html[:mf.end(1)] + ", " + ", ".join(faces) + html[mf.end(1):]
open(ih, "w", encoding="utf-8").write(html)
print("index.html ok")

# 3. componentes
wd = os.path.join(P, "work"); os.makedirs(wd, exist_ok=True)
dst = os.path.join(wd, f"{pref}_a.js")
if os.path.exists(dst): shutil.copy(dst, dst + ".antes")
shutil.copy(os.path.join(SK, "componentes.js"), dst)
print(f"componentes -> work/{pref}_a.js (cenas em work/{pref}_b.js, {pref}_c.js ...)")

# 4. pipeline melhorado
if "--sem-pipeline" not in a and os.path.isdir(ORIG) and os.path.abspath(ORIG) != os.path.abspath(P):
    for f in ("mix.py", "entregar.py", "render/engine.js"):
        s, d = os.path.join(ORIG, f), os.path.join(P, f)
        if os.path.exists(s):
            if os.path.exists(d): shutil.copy(d, d + ".antes")
            shutil.copy(s, d)
    s = open(os.path.join(ORIG, "build_edl.py"), encoding="utf-8").read()
    i, j = s.find("# ---- correções do reconhecimento"), s.find("audio, SR = sf.read(")
    if i > 0 and j > i:
        CFG = ('# ---- correções do reconhecimento (conferir com o Whisper e com a energia do áudio)\n'
               '# fix(i, "errada", "certa") · fix(i, "colada", ["duas","palavras"]) · merge(i, "6", 3, "6x1")\n\n'
               '# ---- tomadas escolhidas\n'
               'DROP = set()\n'
               'KEEP = [i for i in sorted(P) if i not in DROP]\n'
               'PRE, POST, POST_LONG, MERGE_GAP = 0.03, 0.05, 0.05, 0.18\n'
               'LONG_AFTER = set()\n'
               'MANUAL_ON, MANUAL_OFF, NO_PAD = {}, {}, set()\n'
               'CUT_HEAD = {}     # {trecho: n palavras a tirar do começo}\n'
               'CUT_TAIL = {}     # {trecho: n palavras a tirar do fim} (tropeços "impostos justos e... | e acima")\n\n')
        d = os.path.join(P, "build_edl.py")
        if os.path.exists(d): shutil.copy(d, d + ".antes")
        open(d, "w", encoding="utf-8").write(s[:i] + CFG + s[j:])
        print("pipeline melhorado copiado de", os.path.basename(ORIG), "(build_edl.py com configuração zerada)")
    else:
        print("AVISO: build_edl.py da origem sem os marcadores esperados — não copiado")
print("pronto. Próximo: imagens (prompts no SKILL.md), prep_prints.py para fotos de arquivo, make_assets.py, cenas e montar.py")
