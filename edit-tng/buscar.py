"""Catálogo de vídeos candidatos (YouTube) para a edit-tng: busca rápida + leitura dos formatos de cada vídeo.

uso (Python do kit, sempre com -I):
  python -I buscar.py <projeto> "<consulta>" [--n 12] [--cc] [--min-dur s] [--max-dur s]
  python -I buscar.py <projeto> "<consulta ou vazio>" --canal <url|@handle|UC...> [--abas videos,shorts,streams] [--n 30]

  <projeto>   pasta do projeto (caminho absoluto, ou nome dentro de Kit/projetos)
  consulta    ytsearch normal. Com --canal: sem --abas = busca DENTRO do canal (/search?query=);
              com --abas = lista as abas do canal e a consulta (se houver) filtra pelo título (todas as palavras, sem acento)
  --cc        só vídeos com licença Creative Commons (filtro da busca do YouTube + campo license conferido)
  --n         quantos vídeos por busca/aba (padrão 12)

Saída: linhas novas em <projeto>/clipes/candidatos.tsv (id já catalogado é pulado) e um resumo no terminal,
ordenado pela utilidade para o 9:16 (vertical nativo > 4K > 1440 > 1080 > 720). Colunas:
  id  dur  data  canal  titulo  res  WxH  fps  vertical  nota  licenca  views  consulta  url
  res = lado menor do melhor formato DASH (https) — é ele que limita o close 9:16: um 16:9 de 1080p dá recorte de
  só 608 px de largura; 1440p dá 810; 2160p dá 1215. Vertical nativo 1080x1920 entra inteiro, sem ampliar.
Depois: varrer.py (prévia + rostos + folha) nos melhores, baixar_hd.py só nos trechos escolhidos.
"""
import json, os, re, subprocess, sys, unicodedata, urllib.parse
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
YTDLP = os.path.join(KIT, ".venv", "Scripts", "yt-dlp.exe")
CAB = ["id", "dur", "data", "canal", "titulo", "res", "WxH", "fps", "vertical", "nota", "licenca", "views", "consulta", "url"]
SP_CC = "EgIwAQ%3D%3D"          # filtro "Creative Commons" da busca do YouTube


def projeto(p):
    return p if os.path.isabs(p) else os.path.join(KIT, "projetos", p)


def sem_acento(s):
    return unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower()


def yt_json(args, timeout=180):
    """roda o yt-dlp com -J e devolve (dict|None, erro)"""
    try:
        r = subprocess.run([YTDLP, "--no-warnings", "-J", *args], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, "tempo esgotado"
    if r.returncode or not r.stdout.lstrip().startswith("{"):
        return None, " ".join((r.stderr or "").strip().splitlines()[-1:])[:200]
    return json.loads(r.stdout), ""


def url_canal(c):
    c = c.strip()
    if c.startswith("http"):
        return re.sub(r"/(videos|shorts|streams|featured|search.*)/?$", "", c.rstrip("/"))
    if c.startswith("@"):
        return f"https://www.youtube.com/{c}"
    if c.startswith("UC"):
        return f"https://www.youtube.com/channel/{c}"
    return f"https://www.youtube.com/@{c}"


def lista_plana(url, n):
    """busca/aba sem abrir cada vídeo: [(id, título, duração, canal)]"""
    js, err = yt_json(["--flat-playlist", "--playlist-end", str(n), url])
    if not js:
        print(f"  ! falhou: {url} ({err})")
        return []
    out = []
    for e in js.get("entries") or []:
        if not e or not e.get("id") or len(e["id"]) != 11:     # pula canais/playlists na busca
            continue
        out.append({"id": e["id"], "titulo": e.get("title") or "", "dur": e.get("duration"),
                    "canal": e.get("channel") or e.get("uploader") or js.get("channel") or js.get("uploader") or ""})
    return out


def sonda(vid):
    """lê a página do vídeo: melhor formato DASH (https), fps, data, licença"""
    js, err = yt_json(["--no-playlist", "--skip-download", f"https://www.youtube.com/watch?v={vid}"])
    if not js:
        return {"id": vid, "erro": err}
    vs = [f for f in js.get("formats") or [] if f.get("vcodec") not in (None, "none") and f.get("height") and f.get("width")]
    dash = [f for f in vs if f.get("protocol") == "https"] or vs
    melhor = max(dash, key=lambda f: (min(f["width"], f["height"]), f.get("fps") or 0, f.get("tbr") or 0), default=None)
    d = js.get("upload_date") or ""
    return {
        "id": vid, "erro": "",
        "dur": js.get("duration"), "data": f"{d[:4]}-{d[4:6]}-{d[6:]}" if len(d) == 8 else "",
        "canal": js.get("channel") or js.get("uploader") or "", "titulo": js.get("title") or "",
        "res": min(melhor["width"], melhor["height"]) if melhor else 0,
        "WxH": f"{melhor['width']}x{melhor['height']}" if melhor else "",
        "fps": round(melhor.get("fps") or 0) if melhor else 0,
        "vertical": "sim" if melhor and melhor["height"] > melhor["width"] else "não",
        "licenca": js.get("license") or "", "views": js.get("view_count") or "",
        "live": js.get("live_status") or "", "url": js.get("webpage_url") or f"https://www.youtube.com/watch?v={vid}",
    }


def nota(r):
    p, v = r["res"], r["vertical"] == "sim"
    if r.get("live") == "is_live":
        return "AO VIVO agora (não serve)"
    if v:
        s = "vertical nativo ★" if p >= 1080 else ("vertical 720 (aceitável)" if p >= 720 else "vertical <720 FRACO")
    elif p >= 2160:
        s = "4K ★ close ok"
    elif p >= 1440:
        s = "1440 ★ close ok"
    elif p >= 1080:
        s = "1080: close só até ~1,3x"
    elif p >= 720:
        s = "720: só largo/cartão"
    else:
        s = "<720 FRACO"
    if "creative commons" in (r.get("licenca") or "").lower():
        s += " · CC"
    if r.get("live") == "was_live":
        s += " · live gravada"
    return s


def peso(r):
    return (2 if r["vertical"] == "sim" and r["res"] >= 1080 else 1 if r["res"] >= 1440 else 0, r["res"], r["fps"])


def main():
    a = sys.argv[1:]
    if len(a) < 2 or a[0].startswith("-"):
        sys.exit(__doc__)
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    P, q = projeto(a[0]), a[1]
    n = int(opt("--n", "12"))
    cc = "--cc" in a
    mn, mx = float(opt("--min-dur", "0")), float(opt("--max-dur", "1e9"))
    pasta = os.path.join(P, "clipes")
    os.makedirs(pasta, exist_ok=True)
    tsv = os.path.join(pasta, "candidatos.tsv")

    fontes = []                                           # (rótulo, url)
    if opt("--canal"):
        base = url_canal(opt("--canal"))
        if "--abas" in a or not q.strip():
            for aba in (opt("--abas") or "videos,shorts").split(","):
                fontes.append((f"canal/{aba}", f"{base}/{aba.strip()}"))
        else:
            fontes.append(("canal/busca", f"{base}/search?query={urllib.parse.quote_plus(q)}"))
    elif cc:
        fontes.append(("busca CC", f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(q)}&sp={SP_CC}"))
    else:
        fontes.append(("busca", f"ytsearch{n}:{q}"))

    vistos = set()
    if os.path.exists(tsv):
        for ln in open(tsv, encoding="utf-8"):
            vistos.add(ln.split("\t")[0])
    plano = []
    for rot, url in fontes:
        ent = lista_plana(url, n)
        if opt("--canal") and ("--abas" in a) and q.strip():
            ws = sem_acento(q).split()
            ent = [e for e in ent if all(w in sem_acento(e["titulo"]) for w in ws)]
        print(f"{rot}: {len(ent)} vídeos ({url})")
        plano += [e for e in ent if mn <= (e["dur"] or mn) <= mx]
    ids, ja = [], 0
    for e in plano:
        if e["id"] in vistos or e["id"] in ids:
            ja += e["id"] in vistos
            continue
        ids.append(e["id"])
    with ThreadPoolExecutor(8) as ex:
        rs = list(ex.map(sonda, ids))
    ok = []
    for r in rs:
        if r["erro"]:
            print(f"  ! {r['id']}: {r['erro']}")
            continue
        if cc and "creative commons" not in r["licenca"].lower():
            continue
        r["nota"], r["consulta"] = nota(r), (f"{opt('--canal')} " if opt("--canal") else "") + q
        ok.append(r)
    ok.sort(key=peso, reverse=True)
    novo = not os.path.exists(tsv)
    with open(tsv, "a", encoding="utf-8", newline="") as fh:
        if novo:
            fh.write("\t".join(CAB) + "\n")
        for r in ok:
            fh.write("\t".join(str(r.get(c, "")).replace("\t", " ").replace("\n", " ") for c in CAB) + "\n")
    for r in ok:
        dur = r["dur"] or 0
        print(f"{r['id']}  {r['res']:>4}p {r['fps']:>2}q/s {'V' if r['vertical'] == 'sim' else 'H'} "
              f"{int(dur // 60):3d}:{int(dur % 60):02d}  {r['data']}  {r['canal'][:22]:22s}  {r['titulo'][:58]:58s}  {r['nota']}")
    print(f"{len(ok)} novos em {tsv}" + (f" ({ja} já estavam no catálogo)" if ja else ""))


if __name__ == "__main__":
    main()
