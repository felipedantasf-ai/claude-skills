"""SAFE ZONE ORGÂNICA (Reels/TikTok): mede quanto texto, rosto e conteúdo de cada quadro cai sob a interface do app.

uso (Python do kit, sempre com -I):
  python -I safezone_organica.py <video.mp4> [--saida DIR] [--fps 12] [--de T0] [--ate T1] [--perfil organico|meta]
                                             [--folha N] [--sem-rosto] [--nome X]
  python -I safezone_organica.py --dom <projeto> [--passo 0.1] [--de T0] [--ate T1] [--saida DIR] [--perfil organico|meta]
      (modo DOM: abre <projeto>/render/index.html no Chromium do kit e mede a caixa EXATA de todo texto visível que nós
       pusemos na cena — legenda, número, rótulo, fonte, texto de cartão — sem falso positivo. Só grava no projeto
       (out/safezone_dom) quando falta --saida. Meta: texto-chave sob a UI <= 1% do tempo e nenhuma janela > 0,3 s.)
Saídas em DIR (padrão: <pasta do vídeo>/safezone_<nome>; no modo DOM <projeto>/out/safezone_dom só se --saida faltar):
  quadros.json  uma linha por quadro amostrado: linhas de texto, rostos, bordas e conteúdo em cada máscara (coordenadas @1080x1920)
  resumo.json   % do tempo com texto / rosto / conteúdo em cada máscara e fora do envelope + janelas suspeitas
  folha_*.jpg   folhas com as máscaras pintadas por cima (vermelho = UI, amarelo = envelope, verde = texto, azul = rosto)

Máscaras @1080x1920 (perfil "organico", Reels + TikTok, conservador = união dos dois apps):
  TOPO   y 0–220            título/abas e ícones do app
  BASE   y 1500–1920        @usuario, seguir, legenda do post, áudio
  TRILHO x 950–1080, y 900–1650   curtir, comentar, compartilhar, salvar, disco
  ENVELOPE x 140–940, y 240–1440  onde a informação-chave deve ficar (margem de 20–60 px para as máscaras)
Perfil "meta" (anúncio, criativo dinâmico, do safezone_meta.jpg da vox-v4): UI y 0–286 e 1636–1920; 1:1 = y 420–1500.

O que conta como invasão (a régua decide sozinha, a folha confirma):
  texto  linha de texto detectada (top-hat/black-hat + glifos alinhados) com >= 30% da altura dentro da máscara
  rosto  caixa do Haar (frontal alt2) com >= 25% da área dentro da máscara
  borda  densidade de bordas Canny na máscara (só indício: textura de fundo também acusa)
Texto de fonte (placa, camisa, tela dentro do vídeo) também acusa: confira na folha se é informação-chave.
"""
import json, os, shutil, subprocess, sys, tempfile
import numpy as np
import cv2

for _s in (sys.stdout, sys.stderr):
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")

AW, AH = 720, 1280          # resolução de análise (todo vídeo é lido nela; as saídas voltam para @1080)
K = 1080 / AW               # 1,5

PERFIS = {
    "organico": {"TOPO": (0, 0, 1080, 220), "BASE": (0, 1500, 1080, 1920), "TRILHO": (950, 900, 1080, 1650)},
    "meta": {"TOPO": (0, 0, 1080, 286), "BASE": (0, 1636, 1080, 1920)},
}
ENVELOPE = (140, 240, 940, 1440)
QUADRADO_META = (0, 420, 1080, 1500)


def args(a):
    g = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    return g


def ffprobe(path):
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,r_frame_rate:format=duration", "-of", "json", path],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    j = json.loads(o.stdout)
    s = j["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(n) / float(d), float(j["format"]["duration"])


def quadros(path, fps, t0=0.0, t1=None):
    """gera (t, bgr 720x1280) amostrando a fps quadros por segundo (ffmpeg em pipe: aceita caminho com acento)"""
    vf = f"fps={fps},scale={AW}:{AH}:flags=area"
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-i", path]
    if t1 is not None:
        cmd += ["-t", f"{t1 - t0:.3f}"]
    cmd += ["-vf", vf, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    n = AW * AH * 3
    i = 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield t0 + i / fps, np.frombuffer(b, np.uint8).reshape(AH, AW, 3)
        i += 1
    p.wait()


def cascata(saida):
    """copia o XML do Haar para uma pasta sem acento (o cv2 não abre caminho com 'ç')"""
    dst = os.path.join(saida, "haar_alt2.xml")
    if not os.path.exists(dst):
        shutil.copy(os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_alt2.xml"), dst)
    c = cv2.CascadeClassifier(dst)
    if c.empty():
        tmp = os.path.join(tempfile.gettempdir(), "haar_alt2.xml")
        shutil.copy(dst, tmp)
        c = cv2.CascadeClassifier(tmp)
    return c


def linhas_texto(bgr):
    """linhas de texto candidatas: glifos (top-hat claro ou black-hat escuro) de altura parecida, alinhados na base.
    Devolve [(x0, y0, x1, y1, polaridade, n_glifos, h_mediana)] em px de análise (720x1280)."""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    ker = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    out = []
    for pol, m in (("claro", cv2.morphologyEx(g, cv2.MORPH_TOPHAT, ker)), ("escuro", cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, ker))):
        bw = (m > 60).astype(np.uint8)
        n, lab, st, _ = cv2.connectedComponentsWithStats(bw, 8)
        if n <= 1:
            continue
        x, y, w, h, a = st[1:, 0], st[1:, 1], st[1:, 2], st[1:, 3], st[1:, 4]
        ok = (h >= 7) & (h <= 70) & (w >= 2) & (w <= 70) & (a >= 10) & (a / (w * h) > 0.12) & (w / np.maximum(h, 1) < 3.0)
        idx = np.nonzero(ok)[0]
        if len(idx) < 3 or len(idx) > 6000:
            continue
        gx0, gy0, gw, gh = x[idx], y[idx], w[idx], h[idx]
        gx1, gy1 = gx0 + gw, gy0 + gh
        # agrupa glifos vizinhos na mesma linha (union-find por janela de x)
        ordem = np.argsort(gx0)
        gx0, gy0, gx1, gy1, gh = gx0[ordem], gy0[ordem], gx1[ordem], gy1[ordem], gh[ordem]
        pai = list(range(len(gx0)))

        def acha(i):
            while pai[i] != i:
                pai[i] = pai[pai[i]]
                i = pai[i]
            return i
        for i in range(len(gx0)):
            j = i + 1
            lim = gx1[i] + 0.9 * gh[i]
            while j < len(gx0) and gx0[j] <= lim:
                hmax, hmin = max(gh[i], gh[j]), min(gh[i], gh[j])
                ov = min(gy1[i], gy1[j]) - max(gy0[i], gy0[j])
                base = abs(int(gy1[i]) - int(gy1[j]))
                if hmax <= 1.8 * hmin and ov > 0.5 * hmin and base <= 0.35 * hmax:
                    pai[acha(i)] = acha(j)
                j += 1
        grupos = {}
        for i in range(len(gx0)):
            grupos.setdefault(acha(i), []).append(i)
        for mem in grupos.values():
            if len(mem) < 3:
                continue
            mem = np.array(mem)
            hs = gh[mem]
            hm = float(np.median(hs))
            x0, x1 = int(gx0[mem].min()), int(gx1[mem].max())
            y0, y1 = int(gy0[mem].min()), int(gy1[mem].max())
            if (x1 - x0) < 2.2 * hm:
                continue
            cv_h = float(hs.std() / max(hm, 1))
            bases = gy1[mem]
            if cv_h > 0.45 or float(np.std(bases)) > 0.3 * hm:
                continue
            # densidade de glifos ao longo da linha (texto real: glifos cobrem boa parte da largura)
            cob = float(np.sum(gx1[mem] - gx0[mem])) / max(1, x1 - x0)
            if cob < 0.35:
                continue
            out.append((x0, y0, x1, y1, pol, int(len(mem)), round(hm, 1)))
    return out


def rostos(casc, bgr):
    g = cv2.equalizeHist(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY))
    fs = casc.detectMultiScale(g, scaleFactor=1.1, minNeighbors=5, minSize=(48, 48))
    return [tuple(int(v) for v in f) for f in (fs if len(fs) else [])]


def inter(a, b):
    x0, y0, x1, y1 = max(a[0], b[0]), max(a[1], b[1]), min(a[2], b[2]), min(a[3], b[3])
    return max(0, x1 - x0) * max(0, y1 - y0)


def texto_invade(b, m):
    """linha de texto b invade a máscara m: >= 30% da altura dentro E largura dentro >= min(40 px, 15% da linha)
    (uma linha que só encosta 2–3 px no trilho não conta; uma letra inteira escondida conta)"""
    iw = max(0, min(b[2], m[2]) - max(b[0], m[0]))
    ih = max(0, min(b[3], m[3]) - max(b[1], m[1]))
    return ih >= 0.3 * (b[3] - b[1]) and iw >= min(40, 0.15 * (b[2] - b[0]))


def para1080(r):
    return tuple(int(round(v * K)) for v in r)


def mede(bgr, casc, mascaras):
    """todas as medidas de um quadro, em coordenadas @1080"""
    linhas = [(para1080(l[:4]), l[4], l[5], l[6] * K) for l in linhas_texto(bgr)]
    fs = [para1080((x, y, x + w, y + h)) for (x, y, w, h) in (rostos(casc, bgr) if casc is not None else [])]
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    ed = cv2.Canny(cv2.GaussianBlur(g, (3, 3), 0), 60, 140)
    r = {"linhas": [list(b) + [p, n, round(h, 1)] for (b, p, n, h) in linhas], "rostos": [list(f) for f in fs], "masc": {}}
    for nome, m in mascaras.items():
        a0 = [int(v / K) for v in m]
        dens = float(ed[a0[1]:a0[3], a0[0]:a0[2]].mean() / 255) if a0[3] > a0[1] and a0[2] > a0[0] else 0.0
        txt = []
        for (b, p, n, h) in linhas:
            if texto_invade(b, m):
                txt.append(list(b))
        ros = [list(f) for f in fs if inter(f, m) >= 0.25 * (f[2] - f[0]) * (f[3] - f[1])]
        olh = [list(f) for f in fs if m[0] <= (f[0] + f[2]) / 2 <= m[2] and m[1] <= f[1] + 0.38 * (f[3] - f[1]) <= m[3]]
        r["masc"][nome] = {"borda": round(dens, 4), "texto": txt, "rosto": ros, "olhos": olh}
    # fora do envelope: linhas de texto ou rostos que saem dele
    E = ENVELOPE
    r["fora_env"] = {
        "texto": [list(b) for (b, p, n, h) in linhas if b[0] < E[0] or b[2] > E[2] or b[1] < E[1] or b[3] > E[3]],
        "rosto": [list(f) for f in fs if f[0] < E[0] or f[2] > E[2] or f[1] < E[1] or f[3] > E[3]],
    }
    return r


def pinta(bgr, reg, mascaras, rotulo=""):
    """miniatura 1080-> 270x480 com máscaras e detecções"""
    im = cv2.resize(bgr, (1080, 1920), interpolation=cv2.INTER_AREA)
    ov = im.copy()
    for m in mascaras.values():
        cv2.rectangle(ov, (m[0], m[1]), (m[2], m[3]), (40, 40, 230), -1)
    im = cv2.addWeighted(ov, 0.30, im, 0.70, 0)
    E = ENVELOPE
    cv2.rectangle(im, (E[0], E[1]), (E[2], E[3]), (0, 220, 255), 4)
    for l in reg["linhas"]:
        cv2.rectangle(im, (l[0], l[1]), (l[2], l[3]), (60, 230, 60), 4)
    for f in reg["rostos"]:
        cv2.rectangle(im, (f[0], f[1]), (f[2], f[3]), (255, 160, 30), 5)
    im = cv2.resize(im, (270, 480), interpolation=cv2.INTER_AREA)
    if rotulo:
        cv2.rectangle(im, (0, 0), (270, 22), (0, 0, 0), -1)
        cv2.putText(im, rotulo, (4, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    return im


def folhas(miniaturas, saida, prefixo, col=10, por=40):
    paths = []
    for s in range(0, len(miniaturas), por):
        ch = miniaturas[s:s + por]
        rows = (len(ch) + col - 1) // col
        sh = np.full((rows * 484, col * 274, 3), 24, np.uint8)
        for i, m in enumerate(ch):
            r, c = divmod(i, col)
            sh[r * 484:r * 484 + 480, c * 274:c * 274 + 270] = m
        p = os.path.join(saida, f"{prefixo}_{s // por + 1}.jpg")
        cv2.imencode(".jpg", sh, [cv2.IMWRITE_JPEG_QUALITY, 86])[1].tofile(p)
        paths.append(p)
    return paths


def iou(a, b):
    i = inter(a, b)
    return i / max(1, (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i)


def filtra_rostos(regs, mascaras, wmin=100):
    """rosto só vale se tiver >= wmin px @1080 de largura e reaparecer no quadro amostrado vizinho (IoU >= 0,3):
    tira o falso positivo que pisca (escudo, mão, textura). Refaz as marcas de rosto/olhos por máscara."""
    for i, r in enumerate(regs):
        viz = [regs[j]["rostos"] for j in (i - 1, i + 1) if 0 <= j < len(regs)]
        ok = [f for f in r["rostos"] if (f[2] - f[0]) >= wmin and any(iou(f, g) >= 0.3 for vs in viz for g in vs)]
        r["rostos_ok"] = ok
        for nome, m in mascaras.items():
            r["masc"][nome]["rosto"] = [f for f in ok if inter(f, m) >= 0.25 * (f[2] - f[0]) * (f[3] - f[1])]
            r["masc"][nome]["olhos"] = [f for f in ok if m[0] <= (f[0] + f[2]) / 2 <= m[2] and m[1] <= f[1] + 0.38 * (f[3] - f[1]) <= m[3]]
        E = ENVELOPE
        r["fora_env"]["rosto"] = [f for f in ok if f[0] < E[0] or f[2] > E[2] or f[1] < E[1] or f[3] > E[3]]


def janelas(ts, flags, passo):
    """junta quadros marcados consecutivos em janelas [t0, t1]"""
    out, ini = [], None
    for t, f in zip(ts, flags):
        if f and ini is None:
            ini = t
        if not f and ini is not None:
            out.append([round(ini, 2), round(t, 2)]); ini = None
    if ini is not None:
        out.append([round(ini, 2), round(ts[-1] + passo, 2)])
    return out


JS_TEXTO = r"""(() => {
  const st = document.getElementById('stage') || document.body, sr = st.getBoundingClientRect(), k = 1080 / sr.width, out = [];
  const w = document.createTreeWalker(st, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const tx = n.textContent.trim(); if (!tx) continue;
    let vis = true, op = 1;
    for (let e = n.parentElement; e && e !== st.parentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden') { vis = false; break; }
      op *= parseFloat(cs.opacity);
    }
    if (!vis || op < .35) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const b of r.getClientRects()) {
      if (b.width < 3 || b.height < 6) continue;
      const x0 = (b.left - sr.left) * k, y0 = (b.top - sr.top) * k, x1 = (b.right - sr.left) * k, y1 = (b.bottom - sr.top) * k;
      if (x1 < 0 || x0 > 1080 || y1 < 0 || y0 > 1920) continue;
      out.push([Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), tx.slice(0, 40)]);
    }
  }
  return out;
})()"""


def blocos_dom(rs):
    """une caixas de texto vizinhas (mesma linha ou linha de baixo) em blocos; devolve [x0,y0,x1,y1,texto]"""
    n = len(rs); pai = list(range(n))
    def acha(i):
        while pai[i] != i:
            pai[i] = pai[pai[i]]; i = pai[i]
        return i
    for i in range(n):
        for j in range(i + 1, n):
            a, b = rs[i], rs[j]
            ha, hb = a[3] - a[1], b[3] - b[1]
            h = max(ha, hb)
            if h > 1.6 * min(ha, hb):          # tamanhos muito diferentes (legenda x palavra gigante de fundo): blocos separados
                continue
            if min(a[3], b[3]) - max(a[1], b[1]) > -0.6 * h and min(a[2], b[2]) - max(a[0], b[0]) > -1.2 * h:
                pai[acha(i)] = acha(j)
    g = {}
    for i in range(n):
        g.setdefault(acha(i), []).append(rs[i])
    out = []
    for m in g.values():
        tx = " ".join(dict.fromkeys(r[4] for r in m))
        out.append([min(r[0] for r in m), min(r[1] for r in m), max(r[2] for r in m), max(r[3] for r in m), tx[:60]])
    return out


def modo_dom(a, g):
    import asyncio
    from pathlib import Path
    from playwright.async_api import async_playwright
    kit = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
    P = g("--dom")
    P = P if os.path.isabs(P) else os.path.join(kit, "projetos", P)
    idx = Path(P, "render", "index.html")
    if not idx.exists():
        sys.exit(f"sem {idx}")
    saida = g("--saida", os.path.join(P, "out", "safezone_dom"))
    os.makedirs(saida, exist_ok=True)
    perfil = g("--perfil", "organico")
    mascaras = dict(PERFIS[perfil])
    passo = float(g("--passo", 0.1))

    async def roda():
        async with async_playwright() as p:
            b = await p.chromium.launch(args=["--disable-gpu", "--force-color-profile=srgb", "--disable-lcd-text", "--font-render-hinting=none"])
            pg = await b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
            await pg.goto(idx.as_uri())
            for _ in range(1600):
                if await pg.evaluate("window.READY === true || !!window.READY_ERR"):
                    break
                await asyncio.sleep(0.05)
            dur = await pg.evaluate("(window.TIMING && TIMING.videoDur) || 0")
            t0, t1 = float(g("--de", 0)), float(g("--ate", dur))
            reg, t = [], t0
            while t < t1:
                await pg.evaluate(f"render({t:.3f})")
                reg.append({"t": round(t, 3), "blocos": blocos_dom(await pg.evaluate(JS_TEXTO))})
                t += passo
            await b.close()
            return reg, dur
    reg, dur = asyncio.run(roda())
    E = ENVELOPE
    res = {"projeto": P, "perfil": perfil, "passo_s": passo, "instantes": len(reg), "por_mascara": {}, "fora_envelope": {}, "piores": {}}
    for nm, m in mascaras.items():
        fl = [(r["t"], bl) for r in reg for bl in r["blocos"] if texto_invade(bl, m)]
        ts = sorted({t for t, _ in fl})
        res["por_mascara"][nm] = {"pct_tempo": round(100 * len(ts) / max(1, len(reg)), 1),
                                  "janelas": janelas([r["t"] for r in reg], [r["t"] in set(ts) for r in reg], passo),
                                  "textos": sorted({bl[4] for _, bl in fl})[:40]}
    GIG = 150      # caixa de texto >= 150 px de altura = palavra gigante de fundo (tipografia decorativa), fora da conta de chave
    chave_ts = set()
    for nm, m in mascaras.items():
        tsn = {r["t"] for r in reg for bl in r["blocos"] if texto_invade(bl, m) and (bl[3] - bl[1]) < GIG}
        res["por_mascara"][nm]["chave_pct_tempo"] = round(100 * len(tsn) / max(1, len(reg)), 1)
        res["por_mascara"][nm]["chave_textos"] = sorted({bl[4] for r in reg for bl in r["blocos"] if texto_invade(bl, m) and (bl[3] - bl[1]) < GIG})[:40]
        chave_ts |= tsn
    res["chave_sob_ui_pct_tempo"] = round(100 * len(chave_ts) / max(1, len(reg)), 1)
    res["chave_sob_ui_s"] = round(len(chave_ts) * passo, 2)
    res["chave_janelas"] = janelas([r["t"] for r in reg], [r["t"] in chave_ts for r in reg], passo)
    res["meta_skill"] = "texto-chave sob a UI <= 1% do tempo e nenhuma janela > 0,3 s (REF: 0% da camada editorial; só entrada de print 0,25 s)"
    res["passou"] = res["chave_sob_ui_pct_tempo"] <= 1.0 and all(b - a <= 0.3 + 1e-6 for a, b in res["chave_janelas"])
    fe = [(r["t"], bl) for r in reg for bl in r["blocos"] if bl[0] < E[0] or bl[2] > E[2] or bl[1] < E[1] or bl[3] > E[3]]
    tsf = {t for t, _ in fe}
    res["fora_envelope"] = {"pct_tempo": round(100 * len(tsf) / max(1, len(reg)), 1),
                            "textos": sorted({(bl[4], bl[0], bl[1], bl[2], bl[3]) for _, bl in fe}, key=lambda x: x[2])[:60]}
    todos = [bl for r in reg for bl in r["blocos"]]
    if todos:
        arr = np.array([bl[:4] for bl in todos])
        res["extremos"] = {"x0_min": int(arr[:, 0].min()), "y0_min": int(arr[:, 1].min()), "x1_max": int(arr[:, 2].max()), "y1_max": int(arr[:, 3].max()),
                           "y1_p99": int(np.percentile(arr[:, 3], 99)), "x1_p99": int(np.percentile(arr[:, 2], 99))}
        for nome, chave, rev in (("mais_baixos", 3, True), ("mais_altos", 1, False), ("mais_a_direita", 2, True)):
            res["piores"][nome] = [bl for bl in sorted(todos, key=lambda b: b[chave], reverse=rev)[:200]][::20]
    with open(os.path.join(saida, "dom.json"), "w", encoding="utf-8") as f:
        json.dump({"resumo": res, "instantes": reg}, f, ensure_ascii=False)
    print(json.dumps({k: res[k] for k in ("projeto", "perfil", "instantes", "chave_sob_ui_pct_tempo", "chave_sob_ui_s", "chave_janelas", "passou", "meta_skill")},
                     ensure_ascii=False, indent=1))
    for nm, v in res["por_mascara"].items():
        print(f"  {nm:7s} chave {v['chave_pct_tempo']:5.1f}%  (com palavra gigante {v['pct_tempo']:5.1f}%)  {', '.join(v['chave_textos'][:8])}")
    if "extremos" in res:
        print("  extremos do texto:", res["extremos"])
    print("  ->", "OK" if res["passou"] else "CORRIGIR: suba/encolha o texto das janelas acima (legenda <= y 1440, fonte/crédito <= 1440, nada em x > 940 entre y 900 e 1650)")


def main():
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    g = args(a)
    if "--dom" in a:
        return modo_dom(a, g)
    video = a[0]
    nome = g("--nome", os.path.splitext(os.path.basename(video))[0])
    saida = g("--saida", os.path.join(os.path.dirname(os.path.abspath(video)), f"safezone_{nome}"))
    os.makedirs(saida, exist_ok=True)
    fps = float(g("--fps", 12))
    perfil = g("--perfil", "organico")
    mascaras = dict(PERFIS[perfil])
    W, H, vfps, dur = ffprobe(video)
    t0, t1 = float(g("--de", 0)), float(g("--ate", dur))
    casc = None if "--sem-rosto" in a else cascata(saida)
    nfolha = int(g("--folha", 80))
    regs, minis = [], {}
    passo_reg = max(1, int(round(fps)))
    for i, (t, bgr) in enumerate(quadros(video, fps, t0, t1)):
        r = mede(bgr, casc, mascaras)
        r["t"] = round(t, 3)
        regs.append(r)
        marcado = any(r["masc"][m]["texto"] or r["masc"][m]["rosto"] for m in mascaras)
        if i % passo_reg == 0 or (marcado and len(minis) < 900):
            minis[i] = pinta(bgr, r, mascaras, f"{r['t']:.2f}s")
    ts = [r["t"] for r in regs]
    passo = 1 / fps
    filtra_rostos(regs, mascaras)
    res = {"video": video, "perfil": perfil, "mascaras": mascaras, "envelope": ENVELOPE, "fps_amostra": fps,
           "quadros": len(regs), "dur_s": round(len(regs) * passo, 2), "por_mascara": {}, "janelas": {}}
    alguma_txt = np.zeros(len(regs), bool); algum_ros = np.zeros(len(regs), bool); algum_olho = np.zeros(len(regs), bool)
    for nome_m in mascaras:
        ft = np.array([bool(r["masc"][nome_m]["texto"]) for r in regs])
        fr = np.array([bool(r["masc"][nome_m]["rosto"]) for r in regs])
        algum_olho |= np.array([bool(r["masc"][nome_m]["olhos"]) for r in regs])
        bd = np.array([r["masc"][nome_m]["borda"] for r in regs])
        alguma_txt |= ft; algum_ros |= fr
        res["por_mascara"][nome_m] = {"texto_pct_tempo": round(100 * ft.mean(), 1), "rosto_pct_tempo": round(100 * fr.mean(), 1),
                                      "borda_mediana": round(float(np.median(bd)), 4), "borda_p90": round(float(np.percentile(bd, 90)), 4)}
        res["janelas"][nome_m] = {"texto": janelas(ts, ft, passo), "rosto": janelas(ts, fr, passo)}
    fe_t = np.array([bool(r["fora_env"]["texto"]) for r in regs]); fe_r = np.array([bool(r["fora_env"]["rosto"]) for r in regs])
    res["qualquer_mascara"] = {"texto_pct_tempo": round(100 * alguma_txt.mean(), 1), "rosto_pct_tempo": round(100 * algum_ros.mean(), 1),
                               "olhos_pct_tempo": round(100 * algum_olho.mean(), 1),
                               "texto_ou_rosto_pct_tempo": round(100 * (alguma_txt | algum_ros).mean(), 1),
                               "janelas_olhos": janelas(ts, algum_olho, passo),
                               "nota": "pixel = indício: texto de camiseta/placa e textura também acusam; decida na folha. Meta da skill: olhos 0%, chave <= 1%"}
    res["fora_envelope"] = {"texto_pct_tempo": round(100 * fe_t.mean(), 1), "rosto_pct_tempo": round(100 * fe_r.mean(), 1),
                            "janelas_texto": janelas(ts, fe_t, passo), "janelas_rosto": janelas(ts, fe_r, passo)}
    with open(os.path.join(saida, "quadros.json"), "w", encoding="utf-8") as f:
        json.dump(regs, f, ensure_ascii=False)
    with open(os.path.join(saida, "resumo.json"), "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
    # folhas: todos os quadros marcados (até nfolha) + uma amostra regular
    marc = [i for i in range(len(regs)) if alguma_txt[i] or algum_ros[i]]
    if len(marc) > nfolha:
        marc = [marc[int(k)] for k in np.linspace(0, len(marc) - 1, nfolha)]
    marc = [i for i in marc if i in minis]
    ps = folhas([minis[i] for i in marc], saida, "folha_marcados") if marc else []
    reg_idx = [i for i in range(0, len(regs), passo_reg) if i in minis][:120]
    ps += folhas([minis[i] for i in reg_idx], saida, "folha_1s")
    print(json.dumps({k: res[k] for k in ("quadros", "dur_s", "por_mascara", "qualquer_mascara", "fora_envelope")}, ensure_ascii=False)[:3000])
    print("folhas:", *ps, sep="\n  ")


if __name__ == "__main__":
    main()
