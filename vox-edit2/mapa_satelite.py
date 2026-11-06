"""vox-edit2: prepara um MAPA DE SATÉLITE para as cenas `e2Mapa` (estilo da referência @rotageografica, 01/11/2026).

Baixa a imagem de satélite Sentinel-2 cloudless 2016 da EOX (CC BY 4.0: cite na lista de fontes "Sentinel-2 cloudless 2016 by EOX
IT Services GmbH, contains modified Copernicus Sentinel data 2016") em mosaicos por nível de zoom, os limites REAIS do IBGE (estados e
municípios, API de malhas v3) e as coordenadas dos lugares (sede do município pelo OpenStreetMap/Nominatim), e escreve
render/sat_<nome>.js (window.SAT['<nome>']) + render/sat/<nome>/*.jpg. Tudo fica em cache em <kit>/biblioteca/sat_cache.

uso (na raiz do kit):
  .venv\\Scripts\\python.exe ~/.claude/skills/vox-edit2/mapa_satelite.py <projeto> <nome>
      --uf "MA,PI,CE"  |  --uf NE  |  --uf BR                 estados com limite (NE = os 9 do Nordeste; BR = os 27)
      --mun "Bacabeira/MA; São Gonçalo do Amarante/CE"         municípios com limite (nome/UF)
      --pontos "Pecém=-38.83,-3.55; Suape/PE; Salgueiro/PE"   pinos: nome=lon,lat ou lugar (Município/UF = sede; outro texto = busca)
      --linha "ferrovia: Eliseu Martins/PI > Salgueiro/PE > Pecém"   linha por pontos (nomes de --pontos ou lugares)
      --estrada                                                as linhas seguem a estrada real (OSRM) em vez de reta entre pontos
      --camadas "6:BR; 8:uf; 11:auto"                           níveis de imagem (z:área). área = BR | uf | auto | lon0,lat0,lon1,lat1
                                                               (padrão: 4:largo + 6:BR + região dos estados + detalhe dos pontos + foco z12 em cada município)
      --max-detalhe 12                                        zoom máximo do detalhe (12 ≈ 38 m por pixel)

Coordenadas no JS: Web Mercator em pixels do zoom 0 (0–256). Nomes viram chaves sem acento: 'Bacabeira', 'São Gonçalo do Amarante'.
"""
import json, math, os, re, sys, time, unicodedata
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import requests
from PIL import Image
for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"): _s.reconfigure(encoding="utf-8", errors="replace")

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
CACHE = os.path.join(KIT, "biblioteca", "sat_cache")
TILE = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"
UA = {"User-Agent": "vox-kit-felipe/1.0 (edicao de video; contato felipedantasf)"}
NE = ["MA", "PI", "CE", "RN", "PB", "PE", "AL", "SE", "BA"]
BR_BB = (-74.2, -34.0, -34.6, 5.5)
MAXPX = 4096                       # lado máximo de cada pedaço de imagem


def mx(lon): return (lon + 180) / 360 * 256
def my(lat):
    s = math.sin(math.radians(max(-85, min(85, lat))))
    return (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * 256
def norm(s): return re.sub(r"[^a-z0-9]", "", "".join(c for c in unicodedata.normalize("NFD", s.lower()) if not unicodedata.combining(c)))


def get_json(url, cache_name, pausa=0):
    p = os.path.join(CACHE, "json", cache_name)
    if os.path.exists(p): return json.load(open(p, encoding="utf-8"))
    for k in range(4):
        try:
            r = requests.get(url, headers=UA, timeout=40); r.raise_for_status(); d = r.json(); break
        except Exception as e:
            if k == 3: raise SystemExit(f"falhou: {url}\n  {e}")
            time.sleep(2 + 2 * k)
    os.makedirs(os.path.dirname(p), exist_ok=True); json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    if pausa: time.sleep(pausa)
    return d


_UFS = None
def uf_info():
    global _UFS
    if _UFS is None:
        _UFS = {u["sigla"]: u for u in get_json("https://servicodados.ibge.gov.br/api/v1/localidades/estados", "ibge_estados.json")}
    return _UFS


def municipio_id(nome, uf):
    lst = get_json(f"https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios", f"ibge_mun_{uf}.json")
    alvo = norm(nome)
    for m in lst:
        if norm(m["nome"]) == alvo: return m["id"], m["nome"]
    cand = [m["nome"] for m in lst if alvo[:5] in norm(m["nome"])]
    raise SystemExit(f"município não encontrado: {nome}/{uf}. Parecidos: {cand[:8]}")


def malha(tipo, cod, qualidade="intermediaria"):
    d = get_json(f"https://servicodados.ibge.gov.br/api/v3/malhas/{tipo}/{cod}?formato=application/vnd.geo+json&qualidade={qualidade}",
                 f"ibge_malha_{tipo}_{cod}_{qualidade}.json")
    polys = []
    for f in d["features"]:
        g = f["geometry"]
        for poly in (g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]):
            polys.append(poly)
    return polys


def geocode(q):
    m = re.match(r"^\s*(.+?)\s*/\s*([A-Z]{2})\s*$", q)
    if m:                             # Município/UF: a sede (nó admin_centre do OSM)
        nome, uf = m.groups(); est = uf_info()[uf]["nome"]
        url = f"https://nominatim.openstreetmap.org/search?city={requests.utils.quote(nome)}&state={requests.utils.quote(est)}&country=Brasil&format=json&limit=1"
    else:
        url = f"https://nominatim.openstreetmap.org/search?q={requests.utils.quote(q)}&countrycodes=br&format=json&limit=1"
    r = get_json(url, "nom_" + norm(q) + ".json", pausa=1.1)
    if not r: raise SystemExit(f"lugar não encontrado no OpenStreetMap: {q} (use nome=lon,lat)")
    return float(r[0]["lon"]), float(r[0]["lat"])


def rdp(pts, tol):
    if len(pts) < 4: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts) - 1)]
    while st:
        a, b = st.pop(); (x1, y1), (x2, y2) = pts[a], pts[b]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-12
        imax, dmax = -1, 0
        for i in range(a + 1, b):
            d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
            if d > dmax: imax, dmax = i, d
        if dmax > tol: keep[imax] = True; st += [(a, imax), (imax, b)]
    return [p for p, k in zip(pts, keep) if k]


def forma(polys, tol):
    """polígonos lon/lat -> path SVG em pixels do zoom 0, centroide (do maior anel), bbox"""
    d, best, bb = [], (0, None), [1e9, 1e9, -1e9, -1e9]
    for poly in polys:
        for k, ring in enumerate(poly):
            raw = [(mx(x), my(y)) for x, y in ring]
            if len(raw) > 3 and raw[0] == raw[-1]: raw = raw[:-1]
            h = len(raw) // 2                     # anel fechado: simplifica as duas metades (o RDP precisa de pontas diferentes)
            pts = rdp(raw[:h + 1], tol)[:-1] + rdp(raw[h:] + raw[:1], tol)[:-1]
            if len(pts) < 3: continue
            d.append("M" + "L".join(f"{x:.5f},{y:.5f}" for x, y in pts) + "Z")
            if k == 0:
                a = cx = cy = 0
                for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
                    cr = x0 * y1 - x1 * y0; a += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr
                if abs(a) > best[0]: best = (abs(a), (cx / (3 * a), cy / (3 * a)))
                for x, y in pts: bb = [min(bb[0], x), min(bb[1], y), max(bb[2], x), max(bb[3], y)]
    return {"d": "".join(d), "c": [round(best[1][0], 5), round(best[1][1], 5)], "bb": [round(v, 5) for v in bb]}


_SES = __import__("threading").local()


def baixa_tile(z, x, y):
    p = os.path.join(CACHE, "s2_2016", str(z), str(x), f"{y}.jpg")
    if os.path.exists(p) and os.path.getsize(p) > 100: return p
    os.makedirs(os.path.dirname(p), exist_ok=True)
    for k in range(5):
        try:
            s = getattr(_SES, "s", None) or requests.Session(); _SES.s = s
            r = s.get(TILE.format(z=z, x=x, y=y), headers=UA, timeout=(5, 12))
            if r.status_code == 200: open(p, "wb").write(r.content); return p
        except Exception: pass
        time.sleep(1 + k)
    return None


def camada(dst, nome, z, bb):
    """mosaico do zoom z cobrindo bb (pixels z0) em pedaços de até MAXPX; devolve a descrição para o JS"""
    k = 2 ** z; n = 2 ** z
    tx0, ty0 = max(0, int(bb[0] * k // 256)), max(0, int(bb[1] * k // 256))
    tx1, ty1 = min(n - 1, int(bb[2] * k // 256)), min(n - 1, int(bb[3] * k // 256))
    W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256
    tiles = [(x, y) for y in range(ty0, ty1 + 1) for x in range(tx0, tx1 + 1)]
    print(f"  camada z{z}: {tx1 - tx0 + 1}x{ty1 - ty0 + 1} tiles ({W}x{H} px) ...", flush=True)
    t0 = time.time()
    with ThreadPoolExecutor(16) as ex: paths = list(ex.map(lambda t: baixa_tile(z, *t), tiles))
    print(f"    {len(tiles)} tiles em {time.time() - t0:.0f} s", flush=True)
    falta = sum(p is None for p in paths)
    if falta: print(f"    aviso: {falta} tiles não baixaram (ficam escuros)")
    pedacos = []
    tpp = MAXPX // 256
    for cy0 in range(ty0, ty1 + 1, tpp):
        for cx0 in range(tx0, tx1 + 1, tpp):
            cx1, cy1 = min(tx1, cx0 + tpp - 1), min(ty1, cy0 + tpp - 1)
            im = Image.new("RGB", ((cx1 - cx0 + 1) * 256, (cy1 - cy0 + 1) * 256), (12, 24, 38))
            for (x, y), p in zip(tiles, paths):
                if p and cx0 <= x <= cx1 and cy0 <= y <= cy1:
                    try: im.paste(Image.open(p).convert("RGB"), ((x - cx0) * 256, (y - cy0) * 256))
                    except Exception: pass
            fn = f"z{z}_{cx0}_{cy0}.jpg"; im.save(os.path.join(dst, fn), quality=88, optimize=True)
            pedacos.append({"src": f"sat/{nome}/{fn}", "x": cx0 * 256 / k, "y": cy0 * 256 / k, "w": im.width / k, "h": im.height / k, "pw": im.width, "ph": im.height})
    return {"z": z, "bb": [tx0 * 256 / k, ty0 * 256 / k, (tx1 + 1) * 256 / k, (ty1 + 1) * 256 / k], "img": pedacos}


def zoom_que_cabe(bb, maxpx, zmax):
    for z in range(zmax, 2, -1):
        if max(bb[2] - bb[0], bb[3] - bb[1]) * 2 ** z <= maxpx: return z
    return 3


def expande(bb, f, minimo=0.0):
    w, h = bb[2] - bb[0], bb[3] - bb[1]; cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    w, h = max(w * f, minimo), max(h * f, minimo * 16 / 9)
    if w * 16 / 9 < h: w = h * 9 / 16             # tela em pé: garante largura para enquadrar
    return [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]


def main():
    a = sys.argv[1:]
    if len(a) < 2 or a[0].startswith("--"): sys.exit(__doc__)
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
    nome = a[1]
    if not os.path.isdir(os.path.join(P, "render")): sys.exit(f"projeto sem render/: {P}")
    dst = os.path.join(P, "render", "sat", nome); os.makedirs(dst, exist_ok=True)
    out = {"uf": {}, "mun": {}, "pontos": {}, "linhas": {}, "camadas": []}
    tol = 0.35 / 2 ** 11
    ufs = (opt("--uf") or "").strip()
    ufs = NE if ufs.upper() == "NE" else list(uf_info()) if ufs.upper() == "BR" else [u.strip().upper() for u in ufs.split(",") if u.strip()]
    for u in ufs:
        out["uf"][u] = forma(malha("estados", uf_info()[u]["id"]), tol); out["uf"][u]["nome"] = uf_info()[u]["nome"]
    for item in [s.strip() for s in (opt("--mun") or "").split(";") if s.strip()]:
        nm, uf = [x.strip() for x in item.split("/")]
        cod, oficial = municipio_id(nm, uf.upper())
        f = forma(malha("municipios", cod), tol / 4); f["nome"] = oficial; f["uf"] = uf.upper()
        try: lon, lat = geocode(f"{oficial}/{uf.upper()}"); f["sede"] = [round(mx(lon), 6), round(my(lat), 6)]
        except SystemExit: f["sede"] = f["c"]
        out["mun"][oficial] = f
    lugares = {}
    def lugar(q):
        q = q.strip()
        if q in lugares: return lugares[q]
        m = re.match(r"^(.+?)=\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)$", q)
        if m: k, lon, lat = m.group(1).strip(), float(m.group(2)), float(m.group(3))
        else: k = q.split("/")[0].strip(); lon, lat = geocode(q)
        lugares[q] = lugares[k] = (k, [round(mx(lon), 6), round(my(lat), 6)], (lon, lat))
        return lugares[q]
    for item in [s for s in (opt("--pontos") or "").split(";") if s.strip()]:
        k, xy, _ = lugar(item); out["pontos"][k] = xy
    for item in [s for s in (opt("--linha") or "").split(";") if s.strip()]:
        nm, seq = item.split(":", 1) if ":" in item else (f"linha{len(out['linhas']) + 1}", item)
        pts = [lugar(s) for s in seq.split(">")]
        for k, xy, _ in pts: out["pontos"].setdefault(k, xy)
        coords = [p[2] for p in pts]
        if "--estrada" in a:
            q = ";".join(f"{lo:.5f},{la:.5f}" for lo, la in coords)
            r = get_json(f"https://router.project-osrm.org/route/v1/driving/{q}?overview=full&geometries=geojson", "osrm_" + norm(q)[:120] + ".json", pausa=1)
            coords = r["routes"][0]["geometry"]["coordinates"]
        xy = rdp([(mx(lo), my(la)) for lo, la in coords], tol / 2)
        out["linhas"][nm.strip()] = [[round(x, 6), round(y, 6)] for x, y in xy]
    # áreas
    def bbox_de(objs):
        bb = [1e9, 1e9, -1e9, -1e9]
        for o in objs:
            b = o["bb"] if isinstance(o, dict) else [o[0], o[1], o[0], o[1]]
            bb = [min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3])]
        return bb if bb[0] < 1e8 else None
    pts_all = list(out["pontos"].values()) + [p for L in out["linhas"].values() for p in L]
    bb_uf = bbox_de(list(out["uf"].values()))
    bb_det = bbox_de(list(out["mun"].values()) + pts_all)
    bb_br = [mx(BR_BB[0]), my(BR_BB[3]), mx(BR_BB[2]), my(BR_BB[1])]
    if opt("--camadas"):
        specs = []
        for s in opt("--camadas").split(";"):
            z, ar = s.split(":"); ar = ar.strip()
            bb = bb_br if ar == "BR" else expande(bb_uf, 1.25) if ar == "uf" else expande(bb_det, 1.6, 2.2 / 2 ** int(z) * 1080 / 256) if ar == "auto" else None
            if bb is None:
                lo0, la0, lo1, la1 = map(float, ar.split(",")); bb = [mx(lo0), my(la1), mx(lo1), my(la0)]
            specs.append((int(z), bb))
    else:
        specs = [(4, [mx(-100), my(22), mx(-10), my(-52)]), (6, bb_br)]     # fundo largo (oceano em volta) + Brasil
        if bb_uf:
            bu = expande(bb_uf, 1.3); specs.append((zoom_que_cabe(bu, 5200, 10), bu))
        if bb_det:
            zd = int(opt("--max-detalhe", 12)); bd = expande(bb_det, 1.5, 1080 * 1.3 / 2 ** zd)
            z = zoom_que_cabe(bd, 9000, zd)
            if z > specs[-1][0]: specs.append((z, bd))
        zf = int(opt("--max-detalhe", 12))          # foco: cada município (e --foco) ganha a própria camada nítida para o mergulho
        focos = [m["bb"] for m in out["mun"].values()] + [[*out["pontos"][k.strip()]] * 2 for k in (opt("--foco") or "").split(";") if k.strip()]
        zbase = specs[-1][0]
        for b in focos:
            bf = expande(b, 2.4, 1080 * 1.7 / 2 ** zf)
            z = zoom_que_cabe(bf, 6000, zf)
            if z > zbase: specs.append((z, bf))
    for z, bb in sorted(specs):
        out["camadas"].append(camada(dst, nome, z, bb))
    js = os.path.join(P, "render", f"sat_{nome}.js")
    open(js, "w", encoding="utf-8").write(f"window.SAT = window.SAT || {{}};\nwindow.SAT[{json.dumps(nome)}] = {json.dumps(out, ensure_ascii=False)};\n")
    ih = os.path.join(P, "render", "index.html"); html = open(ih, encoding="utf-8").read()
    tag = f'<script src="sat_{nome}.js"></script>'
    if tag not in html:
        html = html.replace('<script src="scenes.js"></script>', tag + '\n<script src="scenes.js"></script>', 1)
        open(ih, "w", encoding="utf-8").write(html)
    print(f"ok render/sat_{nome}.js ({os.path.getsize(js) // 1024} KB): {len(out['uf'])} estados, {len(out['mun'])} municípios, "
          f"{len(out['pontos'])} pontos, {len(out['linhas'])} linhas, camadas z{[c['z'] for c in out['camadas']]}")
    for k, v in out["pontos"].items(): print(f"   ponto {k}: lon {v[0] / 256 * 360 - 180:.4f}")
    print("Fonte da imagem (lista de fontes): Sentinel-2 cloudless 2016 by EOX IT Services GmbH (CC BY 4.0), contains modified Copernicus "
          "Sentinel data 2016. Limites: IBGE (malhas territoriais). Lugares: OpenStreetMap (ODbL).")


if __name__ == "__main__":
    main()
