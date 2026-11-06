"""Busca no Commons e monta folhas de contato para escolher fotos (só arquivos grandes).

uso: python tools/busca_commons.py chave "consulta" [chave2 "consulta2" ...] [--min 1800] [--n 12]
  -> out/busca/<chave>.jpg (miniaturas numeradas) e out/busca/<chave>.json (título, tamanho, url)
"""
import json, os, sys, time, urllib.parse, urllib.request, io
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "busca"); os.makedirs(OUT, exist_ok=True)
a = sys.argv[1:]
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
MIN, N = int(opt("--min", 1800)), int(opt("--n", 12))
a = [x for i, x in enumerate(a) if not x.startswith("--") and (i == 0 or not a[i - 1].startswith("--"))]
UA = {"User-Agent": "VoxKit/1.0 (personal video edit; felipe)"}


def get(u):
    for i in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read()
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(8 * (i + 1)); continue
            raise


for chave, q in zip(a[0::2], a[1::2]):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "generator": "search", "gsrsearch": q + " filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 40,
        "prop": "imageinfo", "iiprop": "url|size", "iiurlwidth": 360, "format": "json"})
    pages = sorted(json.loads(get(u)).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    res = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("width", 0) >= MIN and ii.get("thumburl"):
            res.append({"t": p["title"], "w": ii["width"], "h": ii["height"], "th": ii["thumburl"]})
        if len(res) >= N:
            break
    tw, thh, cols = 360, 270, 6
    sh = Image.new("RGB", (cols * tw, ((len(res) + cols - 1) // cols or 1) * (thh + 34)), "white")
    d = ImageDraw.Draw(sh)
    for i, r in enumerate(res):
        try:
            im = Image.open(io.BytesIO(get(r["th"]))).convert("RGB"); im.thumbnail((tw, thh))
        except Exception:
            continue
        x, y = (i % cols) * tw, (i // cols) * (thh + 34)
        sh.paste(im, (x, y))
        d.text((x + 3, y + thh + 2), f"{i} {r['w']}x{r['h']}", fill="black")
        d.text((x + 3, y + thh + 16), r["t"][5:52], fill="black")
        time.sleep(.3)
    sh.save(os.path.join(OUT, f"{chave}.jpg"), quality=82)
    json.dump(res, open(os.path.join(OUT, f"{chave}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(chave, len(res), flush=True)
    time.sleep(2)
