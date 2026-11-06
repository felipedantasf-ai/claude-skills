"""baixa a miniatura grande (linha 5 do .src da prévia) dos escolhidos: python baixa_sel.py nome=chave_prev ..."""
import sys, os, time, urllib.request, urllib.error, shutil
os.chdir(os.path.dirname(os.path.abspath(__file__)))
UA = {"User-Agent": "kit-vox-editor/1.0 (edicao de video jornalistico)"}
for par in sys.argv[1:]:
    nome, k = par.split("=")
    src = open(f"prev/{k}.jpg.src", encoding="utf-8").read().splitlines()
    for t in range(7):
        try:
            dat = urllib.request.urlopen(urllib.request.Request(src[4], headers=UA), timeout=60).read(); break
        except urllib.error.HTTPError as e:
            if e.code != 429: print("erro", nome, e); dat = None; break
            time.sleep(15 * (t + 1))
    if not dat: continue
    open(f"sel/{nome}.jpg", "wb").write(dat); shutil.copy(f"prev/{k}.jpg.src", f"sel/{nome}.jpg.src")
    print(nome, k, len(dat) // 1024, "KB", flush=True); time.sleep(1.0)
