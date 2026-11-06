"""Logos no Wikimedia Commons (SVG/PNG): python busca_logos.py chave "termo" ... -> logos/<chave>_<n>.png (PNG renderizado, 600 px) + .src"""
import json, sys, urllib.request, urllib.parse, os, time, urllib.error
os.chdir(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "kit-vox-editor/1.0 (edicao de video jornalistico)"}
def get(u):
    for k in range(6):
        try:
            r = urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read(); time.sleep(.6); return r
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(12 * (k + 1))
    raise RuntimeError("429")
N = int(os.environ.get("N", "5"))
for key, q in zip(sys.argv[1::2], sys.argv[2::2]):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(dict(action="query", generator="search", gsrsearch=q, gsrnamespace=6, gsrlimit=N,
        prop="imageinfo", iiprop="url|size|extmetadata", iiurlwidth=600, format="json"))
    try: pages = sorted(json.loads(get(u)).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    except Exception as e: print("erro", key, e); continue
    for i, p in enumerate(pages):
        ii = p["imageinfo"][0]; md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "?")
        fn = os.path.join("logos", f"{key}_{i}.png")
        try: open(fn, "wb").write(get(ii["thumburl"]))
        except Exception as e: print("falhou", key, i, e); continue
        open(fn + ".src", "w", encoding="utf-8").write(f"{p['title']}\n{ii['descriptionurl']}\n{lic}\n")
        print(key, i, lic, p["title"][:80], flush=True)
