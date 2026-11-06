"""Prévia leve de candidatos (miniatura 330 px) -> prev/<chave>_<n>.jpg + .src (linha 5 = URL da miniatura grande para baixar depois).
uso: python busca_prev.py chave "busca" ... | chave "Category:Nome" (lista os arquivos da categoria)"""
import json, sys, urllib.request, urllib.parse, os, time, urllib.error
os.chdir(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "kit-vox-editor/1.0 (edicao de video jornalistico; contato felipe)"}
def get(u, tries=6):
    for k in range(tries):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read(); time.sleep(float(os.environ.get('PAUSA', '.6'))); return r
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(12 * (k + 1))
    raise RuntimeError("429 persistente")
N = int(os.environ.get("N", "6"))
for key, q in zip(sys.argv[1::2], sys.argv[2::2]):
    if q.startswith("Category:"):
        prm = dict(action="query", generator="categorymembers", gcmtitle=q, gcmtype="file", gcmlimit=N)
    else:
        prm = dict(action="query", generator="search", gsrsearch=f"filetype:bitmap {q}", gsrnamespace=6, gsrlimit=N)
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**prm, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 330, "format": "json"})
    try: pages = list(json.loads(get(u)).get("query", {}).get("pages", {}).values())
    except Exception as e: print("erro busca", key, e); continue
    pages.sort(key=lambda p: p.get("index", 0))
    for i, p in enumerate(pages):
        ii = p["imageinfo"][0]
        if ii["width"] < int(os.environ.get("MINW", "700")) or not ii["url"].split("?")[0].lower().endswith((".jpg", ".jpeg", ".png")): continue
        md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "?"); art = md.get("Artist", {}).get("value", "?")
        base = ii["url"].split("?")[0]; pre, nm = base.rsplit("/", 1)
        tw = max([w for w in (330, 500, 960, 1280) if w < ii["width"]] or [330])
        big = pre.replace("/commons/", "/commons/thumb/", 1) + f"/{nm}/{tw}px-{nm}"
        fn = os.path.join("prev", f"{key}_{i}.jpg")
        try: open(fn, "wb").write(get(ii["thumburl"]))
        except Exception as e: print("falhou", key, i, e); continue
        open(fn + ".src", "w", encoding="utf-8").write(f"{p['title']}\n{ii['descriptionurl']}\n{lic}\n{art}\n{big}\n")
        print(key, i, ii["width"], "x", ii["height"], lic, p["title"][:70], flush=True)
