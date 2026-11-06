"""Páginas de DOCUMENTO para o docCena/mural do formato edit-investigativa: print da página REAL (URL) ou reconstrução de uma
notícia/documento com o texto real, em P&B de xerox -> render/assets/d_<nome>.jpg, e a posição de cada trecho a marcar de
vermelho em render/marcas.js (window.MARCAS = {d_nome: {"R$ 2,7 bi": [fx0, fy0, fx1, fy1]}}), para o marca-texto cair em cima.

uso (Python do kit):
  python pagina.py <projeto> <nome> --url URL [--marca "trecho" ...] [--css "seletor{...}"] [--altura 3200] [--largura 1080] [--y0 0]
      print da página real (Chromium do kit, sem login): rola para carregar, esconde o que é fixo (barras, cookies, anúncios) e
      começa ~960 px acima do título da matéria (h1; --antes N muda), para o título caber no meio da tela sem fundo preto
      em cima; --y0 N força o começo; --altura = px de página a partir dali. Site que não abre limpo
      (paywall, página vazia): use --texto com o título e os trechos reais.
  python pagina.py <projeto> <nome> --texto pagina.json
      reconstrução: {"estilo": "jornal" | "oficial" | "site", "veiculo": "Gazeta do Povo", "secao": "Economia", "data": "28/01/2015",
                     "titulo": "...", "fina": "...", "autor": "...", "foto": "fotos/sel/x.jpg", "legenda": "...",
                     "paragrafos": ["...", "..."], "marcas": ["R$ 2,7 bi"]}
      Use SÓ texto real (título exato, trechos do documento) — é a página que o espectador vai ler; diga nas fontes que é
      reprodução e dê o link.
Depois: docCena(beats, 'd_<nome>', {marcas: c => [[...MARCAS.d_nome['R$ 2,7 bi'], c.w('B37','bilhões')]]}) — ou ivMarca('d_nome', 'R$ 2,7 bi', t).
"""
import json, os, re, subprocess, sys, tempfile, pathlib, html as H
import numpy as np
from PIL import Image
from scipy import ndimage

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 3:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
NOME = "d_" + re.sub(r"^d_", "", a[1])
opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
marcas = [a[i + 1] for i, x in enumerate(a) if x == "--marca"]
LARG = int(opt("--largura", 1080))
OUT = os.path.join(P, "render", "assets")
os.makedirs(OUT, exist_ok=True)

JS_MARCAS = """(ms) => {
  const out = {}, H = document.documentElement.scrollHeight, W = document.documentElement.scrollWidth;
  const norm = s => s.replace(/\\s+/g, ' ').toLowerCase();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n; while ((n = walker.nextNode())) if (n.nodeValue.trim()) nodes.push(n);
  ms.forEach(m => {
    const alvo = norm(m);
    for (const nd of nodes) {
      const i = norm(nd.nodeValue).indexOf(alvo);
      if (i < 0) continue;
      const r = document.createRange(); r.setStart(nd, i); r.setEnd(nd, Math.min(nd.nodeValue.length, i + m.length));
      const b = r.getBoundingClientRect();
      if (b.width < 2) continue;
      out[m] = [b.left / W, (b.top + window.scrollY) / H, b.right / W, (b.bottom + window.scrollY) / H];
      break;
    }
  });
  return {out, W, H};
}"""
CSS_LIMPA = """[class*=cookie],[id*=cookie],[class*=Cookie],[class*=consent],[id*=consent],[class*=paywall],[id*=paywall],[class*=banner-ad],
[class*=newsletter],[class*=popup],[id*=popup],[class*=modal],[class*=overlay],iframe,[aria-modal=true],[class*=publicidade],[class*=advert],
[id*=google_ads],[class*=ad-slot],[class*=adslot]{display:none !important} body{overflow:visible !important}"""
JS_LIMPA = """() => {   // some com tudo que é fixo/grudado (barras, banners) e devolve o topo do título da matéria
  document.querySelectorAll('*').forEach(e => { const p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') e.style.setProperty('display', 'none', 'important'); });
  const h = document.querySelector('article h1, main h1, h1');
  return h ? Math.max(0, h.getBoundingClientRect().top + window.scrollY - 60) : 0;
}"""


def html_reconstrucao(d):
    e = d.get("estilo", "jornal")
    def marca(t):
        t = H.escape(t)
        for m in d.get("marcas", []):
            t = t.replace(H.escape(m), f'<span class="m">{H.escape(m)}</span>')
        return t
    foto = ""
    if d.get("foto"):
        fp = d["foto"] if os.path.isabs(d["foto"]) else os.path.join(P, d["foto"])
        foto = f'<figure><img src="{pathlib.Path(fp).resolve().as_uri()}"><figcaption>{H.escape(d.get("legenda", ""))}</figcaption></figure>'
    ps = "".join(f"<p>{marca(p)}</p>" for p in d.get("paragrafos", []))
    if e == "oficial":
        corpo = (f'<div class="of-top">{H.escape(d.get("veiculo", "DIÁRIO OFICIAL"))}</div><div class="of-sub">{H.escape(d.get("secao", ""))} · {H.escape(d.get("data", ""))}</div>'
                 f'<h1 class="of">{marca(d.get("titulo", ""))}</h1>{ps}')
    else:
        corpo = (f'<div class="mast">{H.escape(d.get("veiculo", ""))}</div><div class="sec">{H.escape(d.get("secao", ""))}</div>'
                 f'<h1>{marca(d.get("titulo", ""))}</h1>' + (f'<h2>{marca(d.get("fina", ""))}</h2>' if d.get("fina") else "") +
                 f'<div class="by">{H.escape(d.get("autor", ""))}{" · " if d.get("autor") else ""}{H.escape(d.get("data", ""))}</div>{foto}{ps}')
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;background:#fff;color:#111;width:{LARG}px;font-family:Georgia,'Times New Roman',serif}}
.pg{{padding:70px 78px 90px}}
.mast{{font:900 64px/1 'Times New Roman',serif;letter-spacing:-.02em;border-bottom:3px solid #111;padding-bottom:18px}}
.sec{{font:700 22px Arial,sans-serif;text-transform:uppercase;letter-spacing:.12em;margin:22px 0 10px;color:#444}}
h1{{font:700 62px/1.1 Georgia,serif;letter-spacing:-.015em;margin:8px 0 22px}}
h2{{font:400 32px/1.35 Arial,sans-serif;color:#333;margin:0 0 24px}}
.by{{font:400 22px Arial,sans-serif;color:#555;border-top:1px solid #bbb;border-bottom:1px solid #bbb;padding:12px 0;margin-bottom:30px}}
figure{{margin:0 0 30px}} figure img{{width:100%;display:block;filter:grayscale(1)}} figcaption{{font:400 20px Arial,sans-serif;color:#666;margin-top:8px}}
p{{font:400 33px/1.55 Georgia,serif;margin:0 0 26px}}
.of-top{{font:700 40px 'Times New Roman',serif;text-align:center;border-top:4px double #111;border-bottom:4px double #111;padding:16px}}
.of-sub{{font:400 22px 'Courier New',monospace;text-align:center;margin:14px 0 40px}}
h1.of{{font:700 40px/1.3 'Times New Roman',serif;text-align:center;text-transform:uppercase}}
.m{{}}
</style></head><body><div class="pg">{corpo}</div></body></html>"""


def xerox(png, dst):
    """cinza com contraste de xerox, papel #dcdbdd (mesmo tratamento do provas.py modo doc)"""
    img = Image.open(png).convert("L")
    k = 1400 / img.width
    img = img.resize((1400, round(img.height * k)), Image.LANCZOS)
    g = np.asarray(img, np.float32) / 255
    lo, hi = np.percentile(g, 2), np.percentile(g, 99.2)
    g = np.clip((g - lo) / max(hi - lo, 1e-3), 0, 1) ** 1.15
    g = np.clip(g + .5 * (g - ndimage.gaussian_filter(g, 1.2)), 0, 1)
    g = .06 + g * .86
    Image.fromarray((g * 255).astype(np.uint8), "L").convert("RGB").save(dst, quality=92)
    return img.size


from playwright.sync_api import sync_playwright
tmp = os.path.join(tempfile.gettempdir(), f"pagina_{NOME}.png")
with sync_playwright() as pw:
    br = pw.chromium.launch()
    pg = br.new_page(viewport={"width": LARG, "height": 1600}, device_scale_factor=1)
    if "--url" in a:
        pg.goto(opt("--url"), wait_until="domcontentloaded", timeout=45000)
        try: pg.wait_for_load_state("networkidle", timeout=12000)
        except Exception: pass
        for yy in range(0, 9000, 900):                                  # rola para carregar o que é preguiçoso
            pg.evaluate(f"window.scrollTo(0, {yy})"); pg.wait_for_timeout(250)
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(500)
        pg.add_style_tag(content=CSS_LIMPA + (opt("--css") or ""))
        topo = pg.evaluate(JS_LIMPA)
        pg.wait_for_timeout(500)
        lista = marcas
        fonte = opt("--url")
    else:
        d = json.load(open(opt("--texto") if os.path.isabs(opt("--texto")) else os.path.join(P, opt("--texto")), encoding="utf-8"))
        hp = os.path.join(tempfile.gettempdir(), f"pagina_{NOME}.html")
        open(hp, "w", encoding="utf-8").write(html_reconstrucao(d))
        pg.goto(pathlib.Path(hp).as_uri()); pg.wait_for_timeout(500)
        lista = marcas + d.get("marcas", [])
        fonte = "reconstrução (" + d.get("veiculo", "") + ")"
    info = pg.evaluate(JS_MARCAS, lista)
    altura = min(int(opt("--altura", 3200)), info["H"])
    y0 = int(opt("--y0")) if opt("--y0") else (max(0, int(topo) - int(opt("--antes", 960))) if "--url" in a else 0)   # URL: ~960 px acima do título
    altura = min(info["H"], int(opt("--altura", 3200)) + y0)                # --altura = px de página a partir do começo
    pg.screenshot(path=tmp, full_page=True, clip={"x": 0, "y": y0, "width": LARG, "height": altura - y0})
    br.close()
w, h = xerox(tmp, os.path.join(OUT, NOME + ".jpg"))
hp_ = info["H"]
mk = {}
for k, (x0, yy0, x1, yy1) in info["out"].items():
    Y0, Y1 = yy0 * hp_ - y0, yy1 * hp_ - y0
    if 0 <= Y0 and Y1 <= altura - y0:
        mk[k] = [round(x0, 4), round(Y0 / (altura - y0), 4), round(x1, 4), round(Y1 / (altura - y0), 4)]
mj = os.path.join(P, "render", "marcas.js")
M = {}
if os.path.exists(mj):
    m = re.search(r"window\.MARCAS\s*=\s*(\{.*\})", open(mj, encoding="utf-8").read(), re.S)
    if m: M = json.loads(m.group(1))
M[NOME] = mk
open(mj, "w", encoding="utf-8").write("window.MARCAS = " + json.dumps(M, ensure_ascii=False) + ";\n")
falta = [m for m in lista if m not in mk]
print(f"{NOME}: {w}x{h} de {fonte} | marcas: {list(mk)}" + (f" | NÃO achei: {falta}" if falta else ""))
r = subprocess.run([sys.executable, "make_assets.py"], cwd=P, capture_output=True, text=True, encoding="utf-8", errors="replace")
print("make_assets:", (r.stdout or r.stderr).strip()[:80], "...")
