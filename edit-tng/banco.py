"""Banco de VÍDEO grátis e sem marca d'água para o B-roll da edit-tng (mãos, objetos, lugares, gente de costas).

uso (Python do kit, sempre com -I):
  python -I banco.py <projeto> "<consulta em inglês>" [--fonte mixkit,commons,ytcc] [--n 12] [--sa]
      -> <projeto>/clipes/banco_candidatos.tsv (acrescenta) + folha <projeto>/clipes/banco_<slug>.jpg (Read para escolher)
  python -I banco.py <projeto> --baixa <id|url> --nome <nome> [--trecho ini-fim]
      -> <projeto>/clipes/hd/<nome>.mp4 (+ .json) e uma linha em clipes/fontes.md com a licença e o crédito

Fontes (todas sem chave e sem login):
  mixkit   página de busca do mixkit.co (robots.txt libera). Cada item tem licença própria: "Free" (uso livre, sem
           crédito) ou "Restricted" (NÃO usar em anúncio/publicidade) — conferida na página do item. Grátis vem em
           720p (itens antigos) ou 1080p (novos); o 4K é pago (Envato) e NÃO é baixado.
  commons  Wikimedia Commons (API). Só PD, CC0 e CC BY entram; CC BY-SA só com --sa. Crédito vai para o fontes.md.
  ytcc     YouTube com licença Creative Commons (filtro da busca + campo license conferido no -J).
  pexels / pixabay   só se existirem as variáveis PEXELS_API_KEY / PIXABAY_API_KEY (opcional; não testado sem chave).
ids na tabela: mx:<n> (Mixkit), cm:<Arquivo.webm> (Commons), yt:<id> (YouTube), px:<n>, pb:<n>.
Regras do Felipe que continuam valendo: nada com marca d'água/logo de banco; gente genérica só de costas, silhueta ou
mãos; a imagem tem que bater LITERALMENTE com a palavra. Confira 1 quadro do meio de cada clipe baixado.
"""
import html, io, json, math, os, re, subprocess, sys, time, unicodedata, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)                       # só a pasta da skill (com -I a pasta atual não entra no caminho)
import buscar  # noqa: E402

KIT = buscar.KIT
YTDLP = buscar.YTDLP
UA_WEB = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
UA_WIKI = "edit-tng-banco/1.0 (kit de edicao local; uso pessoal)"
CAB = ["id", "fonte", "WxH", "dur", "licenca", "credito", "titulo", "pagina", "video", "consulta"]


def get(url, ua=UA_WEB, timeout=30, binario=False, hdr=None):
    rq = urllib.request.Request(url, headers={"User-Agent": ua, **(hdr or {})})
    with urllib.request.urlopen(rq, timeout=timeout) as r:
        b = r.read()
    return b if binario else b.decode("utf-8", "replace")


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", buscar.sem_acento(s)).strip("-")[:60]


def sem_html(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def wxh_de(url):
    try:
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                            "-of", "json", "-user_agent", UA_WEB, url], capture_output=True, text=True, timeout=25)
        j = json.loads(r.stdout)
        return f"{j['streams'][0]['width']}x{j['streams'][0]['height']}", float(j["format"].get("duration") or 0)
    except Exception:
        return "", 0.0


# ------------------------------------------------------------------ Mixkit
def mixkit(q, n):
    stop = {"a", "an", "the", "on", "in", "at", "of", "with", "and", "for", "to", "from", "by"}
    ws, cards, ja = [w for w in q.split() if w.lower() not in stop] or q.split(), [], set()
    for k in sorted({len(ws), min(3, len(ws)), min(2, len(ws))}, reverse=True):   # frase longa acha pouco: encurta
        pg = get(f"https://mixkit.co/free-stock-video/discover/{slug(' '.join(ws[:k]))}/")
        for c in re.split(r'data-algolia-analytics-object-id="video-', pg)[1:]:
            v = re.match(r"(\d+)", c).group(1)
            if v not in ja:
                ja.add(v); cards.append(c)
        if len(cards) >= n:
            break
    itens = []
    for c in cards[:n]:
        vid = re.match(r"(\d+)", c).group(1)
        href = re.search(r'href="(/free-stock-video/[^"]+?-\d+/)"', c)
        tit = re.search(r'item-grid-card__title">\s*<a[^>]*>([^<]+)</a>', c)
        th = re.search(r'<img src="([^"]+)"', c)
        itens.append({"id": f"mx:{vid}", "fonte": "mixkit", "titulo": sem_html(tit.group(1)) if tit else "",
                      "pagina": "https://mixkit.co" + href.group(1) if href else "", "thumb": th.group(1) if th else ""})

    def detalhe(it):
        n_ = it["id"][3:]
        try:
            md = get(f"https://mixkit.co/free-stock-video/download/{n_}/?context=sidebar")
            m = re.search(r'data-download--modal-url-value="([^"]+\.mp4)"', md)
            it["video"] = m.group(1) if m else ""
            pg_ = get(it["pagina"]) if it["pagina"] else ""
            lic = re.search(r'"license":"https://mixkit\.co/license/#(\w+)"', pg_)
            it["licenca"] = {"videoFree": "Mixkit Free (sem crédito)", "videoRestricted": "Mixkit RESTRICTED (não usar em anúncio)"}.get(
                lic.group(1) if lic else "", "Mixkit ? (conferir)")
            it["credito"] = "Mixkit"
            it["WxH"], it["dur"] = wxh_de(it["video"]) if it["video"] else ("", 0.0)
        except Exception as e:
            it["video"], it["licenca"], it["WxH"], it["dur"] = "", f"erro {str(e)[:40]}", "", 0.0
        return it
    with ThreadPoolExecutor(4) as ex:
        return [x for x in ex.map(detalhe, itens) if x.get("video")]


# ------------------------------------------------------------------ Wikimedia Commons
LIC_OK = re.compile(r"^(public domain|pd|cc0|cc[ -]by(?![ -]?sa)[ -]?\d?(\.\d)?)", re.I)


def commons(q, n, sa=False):
    api = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6"
           f"&gsrlimit={min(50, n * 3)}&gsrsearch={urllib.parse.quote(q + ' filetype:video')}&prop=imageinfo"
           "&iiprop=url|size|mime|extmetadata&iiextmetadatafilter=LicenseShortName|Artist|LicenseUrl|DateTimeOriginal&iiurlwidth=320")
    js = json.loads(get(api, UA_WIKI))
    out = []
    for p in sorted((js.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = (p.get("imageinfo") or [{}])[0]
        em = ii.get("extmetadata") or {}
        lic = sem_html((em.get("LicenseShortName") or {}).get("value", ""))
        if not (LIC_OK.match(lic) or (sa and "sa" in lic.lower())):
            continue
        if not ii.get("height") or ii.get("height", 0) < 480:
            continue
        out.append({"id": "cm:" + p["title"][5:].replace(" ", "_"), "fonte": "commons", "titulo": p["title"][5:],
                    "pagina": ii.get("descriptionurl", ""), "video": ii.get("url", "").split("?")[0], "thumb": ii.get("thumburl", ""),
                    "WxH": f"{ii.get('width')}x{ii.get('height')}", "dur": float(ii.get("duration") or 0),
                    "licenca": lic, "credito": sem_html((em.get("Artist") or {}).get("value", ""))[:80] + " / Wikimedia Commons"})
        if len(out) >= n:
            break
    return out


# ------------------------------------------------------------------ YouTube Creative Commons
def ytcc(q, n):
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote_plus(q)}&sp={buscar.SP_CC}"
    ent = buscar.lista_plana(url, n)
    with ThreadPoolExecutor(8) as ex:
        rs = list(ex.map(buscar.sonda, [e["id"] for e in ent]))
    out = []
    for r in rs:
        if r.get("erro") or "creative commons" not in (r.get("licenca") or "").lower():
            continue
        out.append({"id": "yt:" + r["id"], "fonte": "ytcc", "titulo": r["titulo"], "pagina": r["url"], "video": r["url"],
                    "thumb": f"https://i.ytimg.com/vi/{r['id']}/mqdefault.jpg", "WxH": r["WxH"], "dur": float(r["dur"] or 0),
                    "licenca": "CC BY (YouTube)", "credito": f"{r['canal']} (YouTube, CC BY)"})
    return out


# ------------------------------------------------------------------ opcionais com chave
def pexels(q, n):
    k = os.environ.get("PEXELS_API_KEY")
    js = json.loads(get(f"https://api.pexels.com/videos/search?query={urllib.parse.quote(q)}&per_page={n}", hdr={"Authorization": k}))
    out = []
    for v in js.get("videos", []):
        fs = sorted([f for f in v.get("video_files", []) if f.get("width")], key=lambda f: -(f["width"] * f["height"]))
        fs = [f for f in fs if min(f["width"], f["height"]) <= 2160] or fs
        if not fs:
            continue
        out.append({"id": f"px:{v['id']}", "fonte": "pexels", "titulo": v.get("url", "").rstrip("/").split("/")[-1], "pagina": v.get("url", ""),
                    "video": fs[0]["link"], "thumb": v.get("image", ""), "WxH": f"{fs[0]['width']}x{fs[0]['height']}",
                    "dur": float(v.get("duration") or 0), "licenca": "Pexels License (sem crédito obrigatório)",
                    "credito": (v.get("user") or {}).get("name", "") + " / Pexels"})
    return out


def pixabay(q, n):
    k = os.environ.get("PIXABAY_API_KEY")
    js = json.loads(get(f"https://pixabay.com/api/videos/?key={k}&q={urllib.parse.quote(q)}&per_page={max(3, n)}"))
    out = []
    for v in js.get("hits", []):
        vs = v.get("videos", {})
        f = vs.get("large") if (vs.get("large") or {}).get("url") else vs.get("medium", {})
        out.append({"id": f"pb:{v['id']}", "fonte": "pixabay", "titulo": v.get("tags", ""), "pagina": v.get("pageURL", ""),
                    "video": f.get("url", ""), "thumb": f.get("thumbnail", ""), "WxH": f"{f.get('width')}x{f.get('height')}",
                    "dur": float(v.get("duration") or 0), "licenca": "Pixabay Content License (sem crédito obrigatório)",
                    "credito": v.get("user", "") + " / Pixabay"})
    return out


# ------------------------------------------------------------------ folha
def folha(itens, fn, titulo):
    from PIL import Image, ImageDraw, ImageFont
    try:
        f1, f2 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14), ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    except OSError:
        f1 = f2 = ImageFont.load_default()
    cols, tw, th, lab = 4, 320, 180, 40
    rows = max(1, math.ceil(len(itens) / cols))
    sh = Image.new("RGB", (cols * tw, 30 + rows * (th + lab)), (18, 18, 18))
    d = ImageDraw.Draw(sh)
    d.text((8, 7), titulo, fill=(255, 220, 0), font=f1)

    def thumb(it):
        try:
            im = Image.open(io.BytesIO(get(it["thumb"], UA_WIKI if it["fonte"] == "commons" else UA_WEB, 20, True))).convert("RGB")
            im.thumbnail((tw - 4, th - 4))
            return im
        except Exception:
            return None
    with ThreadPoolExecutor(6) as ex:
        ims = list(ex.map(thumb, itens))
    for k, (it, im) in enumerate(zip(itens, ims)):
        X, Y = (k % cols) * tw, 30 + (k // cols) * (th + lab)
        if im:
            sh.paste(im, (X + (tw - im.width) // 2, Y + (th - im.height) // 2))
        cor = (255, 90, 90) if "RESTRICTED" in it["licenca"] or "?" in it["licenca"] else (200, 200, 200)
        d.text((X + 3, Y + th + 2), f"{k + 1}. {it['id'][:36]}", fill=(240, 240, 240), font=f1)
        d.text((X + 3, Y + th + 20), f"{it['WxH']} {it['dur']:.0f}s {it['licenca'][:30]}", fill=cor, font=f2)
    sh.save(fn, quality=88)


def busca(P, q, fontes, n, sa):
    pasta = os.path.join(P, "clipes")
    os.makedirs(pasta, exist_ok=True)
    tudo = []
    for f in fontes:
        t = time.time()
        try:
            if f in ("pexels", "pixabay") and not os.environ.get(f.upper() + "_API_KEY"):
                print(f"{f}: sem {f.upper()}_API_KEY, pulado"); continue
            r = {"mixkit": lambda: mixkit(q, n), "commons": lambda: commons(q, n, sa), "ytcc": lambda: ytcc(q, n),
                 "pexels": lambda: pexels(q, n), "pixabay": lambda: pixabay(q, n)}[f]()
        except Exception as e:
            print(f"{f}: falhou ({str(e)[:120]})"); continue
        print(f"{f}: {len(r)} candidatos ({time.time() - t:.0f} s)")
        tudo += r
    tsv = os.path.join(pasta, "banco_candidatos.tsv")
    vistos = {ln.split("\t")[0] for ln in open(tsv, encoding="utf-8")} if os.path.exists(tsv) else set()
    novo = not os.path.exists(tsv)
    with open(tsv, "a", encoding="utf-8", newline="") as fh:
        if novo:
            fh.write("\t".join(CAB) + "\n")
        for it in tudo:
            it["consulta"] = q
            if it["id"] not in vistos:
                fh.write("\t".join(str(it.get(c, "")).replace("\t", " ").replace("\n", " ") for c in CAB) + "\n")
    for k, it in enumerate(tudo, 1):
        print(f"{k:2d}. {it['id'][:44]:44s} {it['WxH']:>10s} {it['dur']:5.1f}s  {it['licenca'][:38]:38s} {it['titulo'][:50]}")
    fn = os.path.join(pasta, f"banco_{slug(q)}.jpg")
    if tudo:
        folha(tudo, fn, f'"{q}"  ({", ".join(fontes)})  — baixar: banco.py <projeto> --baixa <id> --nome <nome>')
        print(f"folha: {fn}")
    print(f"tabela: {tsv}")


# ------------------------------------------------------------------ download
def baixa(P, alvo, nome, trecho):
    tsv = os.path.join(P, "clipes", "banco_candidatos.tsv")
    it = None
    if os.path.exists(tsv):
        for ln in open(tsv, encoding="utf-8"):
            c = ln.rstrip("\n").split("\t")
            if len(c) >= len(CAB) and (c[0] == alvo or c[7] == alvo or c[8] == alvo):
                it = dict(zip(CAB, c))
    if it is None:                                     # URL ou id direto
        if alvo.startswith(("yt:", "http")) and ("youtu" in alvo):
            vid = alvo[3:] if alvo.startswith("yt:") else alvo
            r = buscar.sonda(re.search(r"([\w-]{11})(?:[?&]|$)", vid).group(1) if "http" in vid else vid)
            it = {"id": "yt:" + r["id"], "fonte": "ytcc", "pagina": r["url"], "video": r["url"], "titulo": r["titulo"],
                  "licenca": r["licenca"] or "YouTube padrão", "credito": r["canal"]}
        elif "mixkit.co" in alvo or alvo.startswith("mx:"):
            n_ = re.search(r"(\d+)/?$", alvo.rstrip("/")).group(1)
            pg = get(f"https://mixkit.co/free-stock-video/download/{n_}/?context=sidebar")
            m = re.search(r'data-download--modal-url-value="([^"]+\.mp4)"', pg)
            it = {"id": f"mx:{n_}", "fonte": "mixkit", "pagina": alvo if alvo.startswith("http") else "", "video": m.group(1) if m else "",
                  "titulo": "", "licenca": "Mixkit (conferir na página)", "credito": "Mixkit"}
        else:
            sys.exit(f"não achei {alvo} em {tsv}: rode a busca antes ou passe a URL")
    hd = os.path.join(P, "clipes", "hd")
    os.makedirs(hd, exist_ok=True)
    dst = os.path.join(hd, f"{nome}.mp4")
    t = time.time()
    if it["fonte"] == "ytcc":
        args = ["-q", "--no-part", "-f", "bv*[height<=2160][protocol=https]/bv*", "-S", "res:2160,hdr:sdr,fps", "-o", dst]
        if trecho:
            args += ["--download-sections", f"*{trecho}"]
        r = subprocess.run([YTDLP, "--no-warnings", *args, it["video"]], capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode:
            sys.exit(f"FALHOU: {(r.stderr or '').strip()[-200:]}")
    else:
        url = it["video"]
        ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or ".mp4"
        tmp = os.path.join(hd, f"{nome}_original{ext}")
        ua = UA_WIKI if it["fonte"] == "commons" else UA_WEB
        rq = urllib.request.Request(url, headers={"User-Agent": ua})
        with urllib.request.urlopen(rq, timeout=60) as r, open(tmp, "wb") as fh:
            while True:
                b = r.read(1 << 20)
                if not b:
                    break
                fh.write(b)
        cod = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name", "-of", "csv=p=0", tmp],
                             capture_output=True, text=True).stdout.strip()
        corte = ["-ss", trecho.split("-")[0], "-to", trecho.split("-")[1]] if trecho else []
        if ext == ".mp4" and not trecho:
            os.replace(tmp, dst)
        else:
            vc = ["-c:v", "copy"] if cod in ("h264", "hevc", "vp9", "av1") and not trecho else ["-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p"]
            r = subprocess.run(["ffmpeg", "-v", "error", "-y", *corte, "-i", tmp, "-an", *vc, "-movflags", "+faststart", dst])
            if r.returncode or not os.path.exists(dst):
                sys.exit(f"FALHOU a conversão para mp4 (original mantido em {tmp})")
            os.remove(tmp)
    pr = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,codec_name,avg_frame_rate:format=duration",
                         "-of", "json", dst], capture_output=True, text=True)
    j = json.loads(pr.stdout)
    s = j["streams"][0]
    nn, dd = s["avg_frame_rate"].split("/")
    print(f"{nome}  {s['width']}x{s['height']}  {float(nn) / max(float(dd), 1):.3f} q/s  {s['codec_name']}  {float(j['format']['duration']):.2f} s"
          f"  ({time.time() - t:.0f} s)  licença: {it['licenca']}")
    if min(s["width"], s["height"]) < 720:
        print("AVISO: abaixo de 720p — só para plano pequeno/cartão")
    if "RESTRICTED" in it["licenca"]:
        print("AVISO: licença Mixkit RESTRICTED — não use em anúncio/publicidade (V4, Meta ads)")
    json.dump({**it, "nome": nome, "trecho": trecho or "inteiro", "inicio_arquivo": float(trecho.split("-")[0]) if trecho else 0.0},
              open(os.path.join(hd, f"{nome}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    fontes = os.path.join(P, "clipes", "fontes.md")
    novo = not os.path.exists(fontes)
    with open(fontes, "a", encoding="utf-8") as fh:
        if novo:
            fh.write("# Fontes dos clipes (edit-tng)\n\nnome | canal | url | data de upload | trecho | licença\n---|---|---|---|---|---\n")
        fh.write(" | ".join([nome, it.get("credito", ""), it.get("pagina") or it.get("video", ""), time.strftime("baixado %Y-%m-%d"),
                             trecho or "inteiro", it["licenca"]]) + "\n")


def main():
    a = sys.argv[1:]
    if len(a) < 2 or a[0].startswith("-"):
        sys.exit(__doc__)
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    P = buscar.projeto(a[0])
    if "--baixa" in a:
        if not opt("--nome"):
            sys.exit("falta --nome")
        baixa(P, opt("--baixa"), opt("--nome"), opt("--trecho"))
    else:
        busca(P, a[1], [f.strip() for f in (opt("--fonte") or "mixkit,commons,ytcc").split(",")], int(opt("--n", "12")), "--sa" in a)


if __name__ == "__main__":
    main()
