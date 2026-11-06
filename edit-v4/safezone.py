"""Folha de prévias com a SAFE ZONE da Meta por cima (anúncios da V4: criativo dinâmico recorta 9:16, 4:5 e 1:1). Skill edit-v4.

uso (na raiz do kit, com o Python do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/edit-v4/safezone.py <projeto> [primeira última] [--cenas 3,5,8] [--pontos 3]
  .venv\\Scripts\\python.exe ~/.claude/skills/edit-v4/safezone.py <projeto> --so-faixas     (usa os out/prev_*.png que já existem)

Roda o montar.py (prefixo do etapas.json) e o previas.py desta skill (mesmos argumentos) e pinta em cada quadro:
  vermelho  0–286 e 1636–1920  a interface do app cobre
  cinza     286–420 e 1500–1636 some no recorte 1:1
  linhas    420 e 1500           o quadrado central: legenda, números, logos, fontes e rosto ficam ENTRE elas
Saída: out/pv/safezone_<n>.jpg. Também mede, em cada quadro, quanto "conteúdo" (diferença para o fundo liso) cai nas faixas e lista
os quadros suspeitos; a conferência final é olhar a folha.
"""
import glob, os, subprocess, sys
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image, ImageDraw, ImageFilter, ImageStat

SK = os.path.dirname(os.path.abspath(__file__))
VE = SK   # edit-v4: usa o montar.py e o previas.py desta pasta (formato investigativo)
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
Y0, Y1, M0, M1 = 420, 1500, 286, 1636
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
if "--so-faixas" not in a:
    pref = __import__("json").load(open(f"{P}/etapas.json", encoding="utf-8")).get("prefixo") if os.path.exists(f"{P}/etapas.json") else None
    if pref:
        m = subprocess.run([sys.executable, os.path.join(VE, "montar.py"), P, pref], text=True, capture_output=True, encoding="utf-8", errors="replace", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
        print("montar:", " | ".join(l for l in m.stdout.splitlines() if l.strip())[:300])
    r = subprocess.run([sys.executable, os.path.join(VE, "previas.py"), *a], text=True, capture_output=True, encoding="utf-8", errors="replace",
                       env=dict(os.environ, PYTHONIOENCODING="utf-8"))
    if r.returncode:
        sys.exit("previas.py falhou:\n" + (r.stdout + r.stderr)[-1500:])
    print((r.stdout + r.stderr).strip().splitlines()[0] if (r.stdout + r.stderr).strip() else "previas.py sem saída")
fs = sorted(glob.glob(f"{P}/out/prev_*.png"))
if not fs:
    sys.exit("nenhum out/prev_*.png: rode sem --so-faixas")

def suspeito(im):
    """detalhe (bordas) nas faixas cinzas acima do fundo: o fundo é medido na faixa vermelha do mesmo quadro (quase sempre só mesa).
    Devolve o excesso; > 6 costuma ser texto ou objeto saindo do quadrado. Apresentador em tela cheia também acusa: confira na folha."""
    g = im.convert("L").resize((270, 480)).filter(ImageFilter.FIND_EDGES)
    k = 480 / 1920
    faixa = lambda y0, y1: ImageStat.Stat(g.crop((8, int(y0 * k), 262, int(y1 * k)))).mean[0]
    base = min(faixa(30, M0 - 30), faixa(M1 + 30, 1820))
    return max(faixa(M0 + 10, Y0 - 6), faixa(Y1 + 6, M1 - 10)) - base

def faixas(im):
    im = im.convert("RGBA").resize((1080, 1920))
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    d.rectangle((0, 0, 1080, M0), fill=(229, 9, 20, 120)); d.rectangle((0, M1, 1080, 1920), fill=(229, 9, 20, 120))
    d.rectangle((0, M0, 1080, Y0), fill=(90, 90, 90, 110)); d.rectangle((0, Y1, 1080, M1), fill=(90, 90, 90, 110))
    for y in (Y0, Y1):
        for x in range(0, 1080, 40):
            d.line((x, y, x + 24, y), fill=(255, 221, 0, 255), width=5)
    return Image.alpha_composite(im, ov).convert("RGB")

alertas = []
per, cols, tw, th = 36, 9, 216, 384
os.makedirs(f"{P}/out/pv", exist_ok=True)
for si in range(0, len(fs), per):
    ch = fs[si:si + per]; rows = (len(ch) + cols - 1) // cols
    sh = Image.new("RGB", (cols * (tw + 4), rows * (th + 18)), (22, 22, 22)); d = ImageDraw.Draw(sh)
    for i, f in enumerate(ch):
        im = Image.open(f); v = suspeito(im); t = os.path.basename(f)[5:-4]
        if v > 6: alertas.append(f"{t}s ({v:.0f})")
        x, y = (i % cols) * (tw + 4), (i // cols) * (th + 18)
        sh.paste(faixas(im).resize((tw, th)), (x, y))
        d.text((x + 3, y + th + 2), f"{t}s" + ("  !" if v > 6 else ""), fill=(255, 120, 120) if v > 6 else (255, 230, 0))
    out = f"{P}/out/pv/safezone_{si // per + 1}.jpg"; sh.save(out, quality=84); print(out)
print("quadros com detalhe nas faixas cinzas (conferir na folha):", ", ".join(alertas) if alertas else "nenhum")
