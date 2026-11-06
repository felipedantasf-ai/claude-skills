"""Trechos de vídeo REAL da edit-tng -> render/clips/<nome>/0001.jpg... a 24 q/s, já em 9:16 1080x1920.
(O motor anda a 12 imagens/s em render de 24: o componente avança o índice de 2 em 2 a cada 1/12 s.)

uso (Python do kit, sempre com -I):  python -I clipes_tng.py <projeto> LISTA.txt [-j 4] [--so nome1,nome2] [--forcar]
LISTA.txt, uma linha por clipe:   nome  arquivo  início  duração  [opções]       (# = comentário)
  arquivo   vídeo (relativo ao projeto: clipes/hd/x.mp4 do baixar_hd.py, ou caminho absoluto)
  início    segundos NO ARQUIVO; ou @segundos NA FONTE (usa clipes/hd/<arquivo>.json do baixar_hd: início real conferido)
  duração   segundos da fonte lidos (na tela = duração / vel). Sobre 2 quadros além do que a cena usa.
opções:
  rosto       recorte 9:16 que SEGUE o maior rosto (Haar a cada 3 quadros + interpolação + média de 0,3 s; trava
              parado se o rosto quase não anda). Zoom FIXO no clipe: rosto com 0,34 da altura (faixa 0,31–0,43),
              olhos em 0,335 H, centro do rosto em x 0,50. Nunca anima zoom, nunca gira.
  alvo=0.40   altura do rosto desejada (padrão 0,34; 0,43 = close de emoção; produção de terceiros: 0,22–0,29)
  fx=0.4      centro horizontal fixo do recorte (0..1, padrão 0,5); um número solto também vale como fx
  fy=0.4      centro vertical quando há zoom sem rosto (padrão 0,5)
  z=1.2       zoom fixo (1 = altura cheia); com rosto, z substitui o alvo
  area=w,h,x,y | full   corte manual antes de tudo (tira tarja/legenda/selo); full = sem cropdetect
  ganho=1.1   clareia (gama) — prefira outro trecho
  vel=1.15    acelera (1,0–1,25 só para caber na frase; nunca câmera lenta)
  largo       não corta: faixa 16:9 com 1080 de largura (tela dividida, cartão, janela)
  dividida    metade de tela dividida: 1080x960 (9:8), com rosto o alvo padrão vira 0,45
Limites de qualidade: largura mínima do recorte 405 px (fonte 1080p) a 600 px (4K); o zoom para aí e avisa.
Look: Lanczos para 1080x1920; unsharp 0,35 só na luma e só se o recorte for ampliado; joelho nas altas (linear até
200, 200–255 -> 200–240) e preto em ~3-4: fonte de preto lavado (p0,1 > 8) tem o preto esticado para ~4 (preto=nao desliga);
sem LUT, grão ou vinheta.
Imprime por clipe: fonte WxH q/s, recorte, ampliação, rosto/olhos obtidos, cortes escondidos, avisos (ampliação >2,5x,
rosto perdido, suspeita de logo/legenda). Grava render/clipn.js (window.CLIPN, window.CLIPFPS = 24) e a folha
out/clipes_folha_<data>.jpg (1º/meio/último quadro de cada clipe, com marca da linha dos olhos 0,335) — CONFIRA (Read).
"""
import json, math, os, re, shutil, subprocess, sys, tempfile, time
from concurrent.futures import ThreadPoolExecutor

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
cv2.setNumThreads(2)
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
FPS = 24
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
LISTA = a[1] if os.path.isabs(a[1]) else os.path.join(P, a[1])
J = int(a[a.index("-j") + 1]) if "-j" in a else 4
SO = set(a[a.index("--so") + 1].split(",")) if "--so" in a else None
CLIPS = os.path.join(P, "render", "clips")
os.makedirs(CLIPS, exist_ok=True)
os.makedirs(os.path.join(P, "out"), exist_ok=True)
JUNCAO = os.path.normcase(os.path.realpath(CLIPS)) != os.path.normcase(os.path.abspath(CLIPS))


def cascata():
    dst = os.path.join(tempfile.gettempdir(), "vox_haar_frontalface.xml")
    if not os.path.exists(dst):
        shutil.copyfile(cv2.data.haarcascades + "haarcascade_frontalface_default.xml", dst)
    return cv2.CascadeClassifier(dst)


def le_lista():
    out = []
    for ln in open(LISTA, encoding="utf-8"):
        ln = ln.split("#")[0].strip()
        if not ln:
            continue
        p = ln.split()
        op = {"rosto": False, "alvo": None, "fx": .5, "fy": .5, "z": None, "area": None, "ganho": 1.0, "vel": 1.0,
              "largo": False, "dividida": False}
        for x in p[4:]:
            k, _, v = x.partition("=")
            if x == "rosto":
                op["rosto"] = True
            elif x in ("largo", "dividida"):
                op[x] = True
            elif k == "preto":                                  # preto=nao: não mexe no ponto de preto da fonte
                op["preto"] = v.lower() not in ("nao", "não", "0", "no")
            elif x == "full" or (k == "area" and v == "full"):
                op["area"] = "full"
            elif k == "area":
                op["area"] = tuple(int(float(q)) for q in v.split(","))
            elif k in ("alvo", "fx", "fy", "z", "ganho", "vel"):
                op[k] = float(v)
            else:
                op["fx"] = float(x)
        out.append((p[0], p[1], p[2], float(p[3]), op))
    return out


def probe(src):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,avg_frame_rate,r_frame_rate:stream_side_data=rotation", "-of", "json", src],
                       capture_output=True, text=True)
    s = json.loads(r.stdout)["streams"][0]
    n, d = (s.get("avg_frame_rate") or s.get("r_frame_rate")).split("/")
    return s["width"], s["height"], float(n) / max(float(d), 1)


def lut_tom(g=1.0, preto=0.0):
    """preto ~3, linear até 200, joelho 200–255 -> 200–240 (Hermite, contínuo e monótono); gama opcional antes.
    preto = p0,1 medido na fonte: se a fonte tem o preto lavado (keynote, live), estica só a parte de baixo para o p0,1 cair
    em ~4 (meta da referência) e o 200 continuar em 200; as altas não mudam."""
    x = np.arange(256, dtype=np.float64)
    if g != 1:
        x = 255 * (x / 255) ** (1 / g)
    if preto > 8:
        b = min(preto + 2, 60)
        x = np.where(x < 200, np.clip((x - b) * 200 / (200 - b), 0, None), x)
    lin = 3 + x * (197 / 200)
    u = np.clip((x - 200) / 55, 0, 1)
    m0, m1 = (197 / 200) * 55 / 40, 0.25
    f = (u ** 3 - 2 * u ** 2 + u) * m0 + (-2 * u ** 3 + 3 * u ** 2) + (u ** 3 - u ** 2) * m1
    y = np.where(x <= 200, lin, 200 + 40 * f)
    return np.clip(np.round(y), 0, 255).astype(np.uint8)


def suaviza(v, k):
    """média móvel centrada aplicada 2x (triangular), bordas seguras"""
    if len(v) < 3 or k < 3:
        return v
    k = min(k, len(v) - (1 - len(v) % 2))
    k += 1 - k % 2
    for _ in range(2):
        v = np.convolve(np.pad(v, (k // 2, k // 2), mode="edge"), np.ones(k) / k, mode="valid")
    return v


def rastreia(src, ss, dur, vel, area, n_out):
    """rosto por quadro do trecho (na grade de 24 q/s de saída): devolve (cx, topo, h) em px da ÁREA, por quadro, e a fração achada"""
    cw, ch, cx0, cy0 = area
    sh = 540 if ch > 540 else ch
    sw = int(round(cw * sh / ch / 2)) * 2
    k = ch / sh
    vf = f"setpts=(PTS-STARTPTS)/{vel},fps={FPS},crop={cw}:{ch}:{cx0}:{cy0},scale={sw}:{sh}:flags=area,format=gray"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an", "-vf", vf,
                          "-frames:v", str(n_out), "-f", "rawvideo", "-"], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, sh, sw)
    casc = cascata()
    ms = max(24, int(0.08 * sh))
    det = {}
    for i in range(0, len(fr), 3):
        fs = casc.detectMultiScale(fr[i], scaleFactor=1.08, minNeighbors=6, minSize=(ms, ms))
        if len(fs):
            x, y, w, h = max(fs, key=lambda f: f[2] * f[3])
            det[i] = ((x + w / 2) * k, y * k, h * k)
    n_amostras = len(range(0, len(fr), 3))
    if not det:
        return None, 0.0, len(fr)
    idx = np.array(sorted(det))
    D = np.array([det[i] for i in idx])
    med = np.median(D, axis=0)
    bom = (np.abs(D[:, 2] - med[2]) < 0.45 * med[2]) & (np.abs(D[:, 0] - med[0]) < 1.5 * med[2])   # tira falso positivo
    if bom.sum() >= 2:
        idx, D = idx[bom], D[bom]
    if len(D) >= 5:                                                     # mediana móvel de 5 amostras (tira picos)
        D = np.array([np.median(D[max(0, j - 2):j + 3], axis=0) for j in range(len(D))])
    n = max(len(fr), n_out)
    full = np.stack([np.interp(np.arange(n), idx, D[:, c]) for c in range(3)], axis=1)
    return full, len(idx) / max(1, n_amostras), len(fr)


def prova_rosto(src, ss, vel, area, trilha, crop_w, crop_h, olho, OW, OH):
    """altura do rosto (fração de OH) que o recorte daria, medida como na conferência da saída; None se não achar"""
    cw, ch, cx0, cy0 = area
    casc, hs = cascata(), []
    n = len(trilha)
    for j in sorted({n // 6, n // 2, (5 * n) // 6}):
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ss + j / FPS * vel:.3f}", "-i", src, "-frames:v", "1", "-an",
                              "-vf", f"crop={cw}:{ch}:{cx0}:{cy0},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
        if len(raw) < cw * ch:
            continue
        g = np.frombuffer(raw[:cw * ch], np.uint8).reshape(ch, cw)
        x0 = int(min(max(trilha[j, 0] - crop_w / 2, 0), cw - crop_w))
        y0 = int(min(max(trilha[j, 1] + 0.36 * trilha[j, 2] - olho * crop_h, 0), ch - crop_h))
        sub = cv2.resize(g[y0:y0 + crop_h, x0:x0 + crop_w], (OW // 2, OH // 2), interpolation=cv2.INTER_AREA)
        fs = casc.detectMultiScale(sub, 1.08, 6, minSize=(60, 60))
        if len(fs):
            hs.append(max(fs, key=lambda f: f[2] * f[3])[3] / sub.shape[0])
    return float(np.median(hs)) if hs else None


def extrai(item):
    nome, arq, ini, dur, op = item
    src = arq if os.path.isabs(arq) else os.path.join(P, arq)
    if not os.path.exists(src):
        return {"nome": nome, "linha": f"{nome:16s} FALTA {src}"}
    if ini.startswith("@"):                                           # tempo da fonte -> tempo no arquivo
        js = os.path.splitext(src)[0] + ".json"
        if not os.path.exists(js):
            return {"nome": nome, "linha": f"{nome:16s} início @fonte pedido, mas falta {js} (do baixar_hd.py)"}
        ss = float(ini[1:]) - float(json.load(open(js, encoding="utf-8"))["inicio_arquivo"])
    else:
        ss = float(ini)
    ss = max(0.0, ss)
    avisos = []
    vel = op["vel"]
    if not 1.0 <= vel <= 1.25:
        avisos.append(f"vel {vel} fora de 1,0–1,25: usei {min(max(vel, 1.0), 1.25)}")
        vel = min(max(vel, 1.0), 1.25)
    W, H, sfps = probe(src)
    n_out = max(1, int(round(dur / vel * FPS)))
    # ---- área útil (cropdetect tira tarja preta)
    if op["area"] == "full":
        area = (W, H, 0, 0)
    elif op["area"]:
        area = op["area"]
    else:
        cd = subprocess.run(["ffmpeg", "-ss", f"{ss:.3f}", "-t", str(min(dur, 3)), "-i", src, "-vf", "cropdetect=24:2:0",
                             "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
        m = re.findall(r"crop=(\d+):(\d+):(\d+):(\d+)", cd)
        area = tuple(map(int, m[-1])) if m else (W, H, 0, 0)
        if area[0] < W * .5 or area[1] < H * .5:
            area = (W, H, 0, 0)
    cw, ch, cx0, cy0 = area
    # ---- formato de saída
    if op["largo"]:
        OW, OH = 1080, int(round(1080 * ch / cw / 2)) * 2
    elif op["dividida"]:
        OW, OH = 1080, 960
    else:
        OW, OH = 1080, 1920
    asp = OW / OH
    pcls = min(cw, ch)
    min_w = float(np.interp(pcls, [1080, 2160], [405, 600]))
    alvo = op["alvo"] or (0.45 if op["dividida"] else 0.34)
    olho = 0.40 if op["dividida"] else 0.335
    # ---- trajetória do recorte (px da área)
    trilha = None
    frac = 1.0
    if op["largo"]:
        crop_h, crop_w = ch, cw
    else:
        crop_h = ch
        if op["rosto"]:
            trilha, frac, _ = rastreia(src, ss, dur, vel, area, n_out)
            if trilha is None or frac < 0.2:
                avisos.append("rosto não achado: recorte fixo em fx" if trilha is None else f"rosto em só {frac:.0%} dos quadros: recorte fixo")
                trilha = None
        if trilha is not None:
            fh = float(np.median(trilha[:, 2]))
            crop_h = fh / alvo if op["z"] is None else ch / op["z"]
        elif op["z"]:
            crop_h = ch / op["z"]
        for tent in (0, 1, 2):
            crop_h = min(crop_h, ch, cw / asp)
            crop_w = crop_h * asp
            lim = crop_w < min_w
            if lim:
                crop_w, crop_h = min_w, min_w / asp
            crop_w, crop_h = int(round(crop_w / 2)) * 2, int(round(crop_h / 2)) * 2
            if tent == 2 or trilha is None or op["z"] is not None or lim:
                break
            # prova: 3 quadros em resolução cheia, recortados e medidos como na saída (o Haar na escala de análise
            # erra o tamanho do rosto em ~10–20%); corrige o zoom uma vez
            fator = prova_rosto(src, ss, vel, area, trilha, crop_w, crop_h, olho, OW, OH)
            if not fator or abs(fator / alvo - 1) <= 0.08:
                break
            crop_h = crop_h * fator / alvo
        if lim:
            avisos.append(f"zoom limitado (recorte mín. {min_w:.0f} px de largura)")
    if trilha is not None:
        n = len(trilha)
        cxs = trilha[:, 0] - crop_w / 2
        cys = trilha[:, 1] + 0.36 * trilha[:, 2] - olho * crop_h            # olhos ~0,36 da caixa do Haar
        k = int(round(0.3 * FPS)) | 1
        cxs, cys = suaviza(cxs, k), suaviza(cys, k)
        if np.ptp(cxs) < 0.03 * crop_w and np.ptp(cys) < 0.03 * crop_h:   # quase parado: trava (fica mais limpo)
            cxs[:], cys[:] = np.median(cxs), np.median(cys)
            modo = "rosto (travado)"
        else:
            modo = f"rosto (segue {np.ptp(cxs):.0f}px)"
        X0 = np.clip(cxs, 0, cw - crop_w)
        Y0 = np.clip(cys, 0, ch - crop_h)
        if (np.abs(X0 - cxs) > 0.08 * crop_w).mean() > .3 or (np.abs(Y0 - cys) > 0.08 * crop_h).mean() > .3:
            avisos.append("rosto encostado na borda da fonte: enquadramento não chega no alvo")
    else:
        modo = "largo" if op["largo"] else "fixo"
        X0 = np.full(n_out, min(max(op["fx"] * cw - crop_w / 2, 0), cw - crop_w))
        Y0 = np.full(n_out, min(max(op["fy"] * ch - crop_h / 2, 0), ch - crop_h))
    # ---- caixa que contém todos os recortes (o ffmpeg corta isso; o resto é por quadro aqui)
    ux0, uy0 = int(math.floor(X0.min())) & ~1, int(math.floor(Y0.min())) & ~1
    ux1 = min(cw, int(math.ceil(X0.max() + crop_w)))
    uy1 = min(ch, int(math.ceil(Y0.max() + crop_h)))
    uw, uh = (ux1 - ux0) & ~1, (uy1 - uy0) & ~1
    out = os.path.join(CLIPS, nome)
    if JUNCAO and os.path.exists(out) and "--forcar" not in a:
        return {"nome": nome, "linha": f"{nome:16s} PULADO: render/clips é junção e o clipe já existe lá (use outro nome ou --forcar)"}
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    vf = f"setpts=(PTS-STARTPTS)/{vel},fps={FPS},crop={uw}:{uh}:{cx0 + ux0}:{cy0 + uy0},format=rgb24"
    pr = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an", "-vf", vf,
                           "-frames:v", str(n_out), "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
    # ponto de preto da fonte (passada rápida em baixa resolução no mesmo recorte); 'preto=nao' na LISTA desliga
    p_fonte = 0.0
    if op.get("preto", True):
        vf0 = f"setpts=(PTS-STARTPTS)/{vel},fps=6,crop={uw}:{uh}:{cx0 + ux0}:{cy0 + uy0},scale=160:-2,format=gray"
        r0 = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ss:.3f}", "-t", f"{dur:.3f}", "-i", src, "-an", "-vf", vf0, "-f", "rawvideo", "-"],
                            capture_output=True)
        if r0.stdout:
            p_fonte = float(np.percentile(np.frombuffer(r0.stdout, np.uint8), 0.1))
    lut = lut_tom(op["ganho"], p_fonte)
    amp = OW / crop_w
    interp = cv2.INTER_LANCZOS4 if amp > 1.0 else cv2.INTER_AREA
    mini, med, i = [], [], 0
    nb = uw * uh * 3
    while True:
        buf = pr.stdout.read(nb)
        if len(buf) < nb:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(uh, uw, 3)
        j = min(i, len(X0) - 1)
        x0, y0 = int(round(X0[j])) - ux0, int(round(Y0[j])) - uy0
        x0, y0 = min(max(x0, 0), uw - crop_w), min(max(y0, 0), uh - crop_h)
        sub = fr[y0:y0 + crop_h, x0:x0 + crop_w]
        im = cv2.resize(sub, (OW, OH), interpolation=interp)
        if amp > 1.0:                                                  # unsharp 5x5 0,35 só na luma
            ycc = cv2.cvtColor(im, cv2.COLOR_RGB2YCrCb)
            y = ycc[:, :, 0]
            ycc[:, :, 0] = cv2.addWeighted(y, 1.35, cv2.GaussianBlur(y, (5, 5), 0), -0.35, 0)
            im = cv2.cvtColor(ycc, cv2.COLOR_YCrCb2RGB)
        im = cv2.LUT(im, lut)
        bgr = cv2.cvtColor(im, cv2.COLOR_RGB2BGR)
        cv2.imencode(".jpg", bgr, [cv2.IMWRITE_JPEG_QUALITY, 93])[1].tofile(os.path.join(out, f"{i + 1:04d}.jpg"))
        g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
        mini.append(cv2.resize(g, (54, int(round(54 * OH / OW))), interpolation=cv2.INTER_AREA))
        med.append(cv2.resize(g, (135, int(round(135 * OH / OW))), interpolation=cv2.INTER_AREA))
        i += 1
    pr.wait()
    nq = i
    if nq == 0:
        return {"nome": nome, "linha": f"{nome:16s} ERRO: nenhum quadro (início {ss:.2f} além do fim?)"}
    if nq < n_out - 1:
        avisos.append(f"só {nq} de {n_out} quadros (trecho acaba antes)")
    # ---- cortes escondidos
    fr = np.array(mini, np.float32)
    dd = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)) if len(fr) > 1 else np.zeros(1)
    cortes = [round((k + 1) / FPS * vel, 2) for k, v in enumerate(dd) if v > max(25, 6 * np.median(dd) + 8)]
    # ---- sobreposição fixa (logo/selo/legenda) dentro do recorte
    M = np.array(med, np.float32)
    sd = M.std(axis=0)
    gx = cv2.Sobel(M.mean(axis=0), cv2.CV_32F, 1, 0); gy = cv2.Sobel(M.mean(axis=0), cv2.CV_32F, 0, 1)
    est = (sd < 2.5) & (np.hypot(gx, gy) > 60)
    hh, ww = est.shape
    reg = {"canto sup. esq.": est[:int(.1 * hh), :int(.25 * ww)], "canto sup. dir.": est[:int(.1 * hh), int(.75 * ww):],
           "canto inf. esq.": est[int(.88 * hh):, :int(.25 * ww)], "canto inf. dir.": est[int(.88 * hh):, int(.75 * ww):],
           "faixa baixa": est[int(.74 * hh):int(.92 * hh), int(.1 * ww):int(.9 * ww)]}
    centro = est[int(.3 * hh):int(.7 * hh), int(.25 * ww):int(.75 * ww)].mean()
    mexe = np.median(sd[int(.3 * hh):int(.7 * hh), int(.25 * ww):int(.75 * ww)]) > 3.0
    if mexe and len(M) >= 12:
        sus = [k for k, v in reg.items() if v.mean() > max(0.03, 3 * centro)]
        if sus:
            avisos.append("suspeita de logo/legenda fixa: " + ", ".join(sus) + " (confira na folha)")
    # ---- rosto e tons obtidos
    casc = cascata()
    rh, ry, rx = [], [], []
    amostra = list(range(0, nq, 6)) or [0]
    for k in amostra:
        g = cv2.imdecode(np.fromfile(os.path.join(out, f"{k + 1:04d}.jpg"), np.uint8), cv2.IMREAD_GRAYSCALE)
        g = cv2.resize(g, (OW // 2, OH // 2), interpolation=cv2.INTER_AREA)
        fs = casc.detectMultiScale(g, 1.08, 6, minSize=(60, 60))
        if len(fs):
            x, y, w, h = max(fs, key=lambda f: f[2] * f[3])
            rh.append(h / g.shape[0]); ry.append((y + 0.36 * h) / g.shape[0]); rx.append((x + w / 2) / g.shape[1])
    Ys = np.concatenate([m.ravel() for m in med[::4]])
    p01, p999 = np.percentile(Ys, 0.1), np.percentile(Ys, 99.9)
    if trilha is not None and frac < 0.6:
        avisos.append(f"rosto perdido em {1 - frac:.0%} das amostras (trilha interpolada)")
    if amp > 2.5:
        avisos.append(f"AMPLIAÇÃO {amp:.1f}x (> 2,5x): fica mole — fonte maior ou plano mais aberto")
    if op["rosto"] and rh and not (0.29 <= np.median(rh) <= 0.45) and not op["dividida"] and not op["alvo"]:
        avisos.append(f"rosto saiu {np.median(rh):.2f} H (alvo 0,31–0,43)")
    ros = (f"rosto {np.median(rh):.2f}H olhos {np.median(ry):.3f} cx {np.median(rx):.2f} ({len(rh)}/{len(amostra)})"
           if rh else ("sem rosto na saída" if op["rosto"] else "-"))
    linha = (f"{nome:16s} {W}x{H}@{sfps:.2f} -> recorte {crop_w}x{crop_h} [{modo}] ampl {amp:.2f}x | {nq} quadros "
             f"({nq / FPS:.2f} s na tela) | {ros} | Y p0,1 {p01:.0f} (fonte {p_fonte:.0f}) p99,9 {p999:.0f} | cortes: {cortes or 'nenhum'}"
             + (" | AVISOS: " + "; ".join(avisos) if avisos else ""))
    return {"nome": nome, "linha": linha, "dir": out, "nq": nq, "OW": OW, "OH": OH, "olho": olho,
            "rotulo": [f"{nome}  {W}x{H}  recorte {crop_w}px  {amp:.2f}x", (f"r{np.median(rh):.2f} olhos {np.median(ry):.3f}" if rh else "sem rosto")
                       + (f"  cortes {cortes}" if cortes else ""), "; ".join(avisos)[:70]]}


def folha(res):
    ok = [r for r in res if r.get("dir")]
    if not ok:
        return []
    try:
        f1, f2 = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14), ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    except OSError:
        f1 = f2 = ImageFont.load_default()
    tw, th, lab, por_linha, linhas = 170, 302, 54, 3, 4
    saidas = []
    stamp = time.strftime("%Y%m%d_%H%M%S")
    for s in range(0, len(ok), por_linha * linhas):
        grupo = ok[s:s + por_linha * linhas]
        rows = math.ceil(len(grupo) / por_linha)
        sh = Image.new("RGB", (por_linha * (3 * tw + 12), rows * (th + lab)), (18, 18, 18))
        d = ImageDraw.Draw(sh)
        for g, r in enumerate(grupo):
            X, Y = (g % por_linha) * (3 * tw + 12), (g // por_linha) * (th + lab)
            for c, k in enumerate(sorted({1, (r["nq"] + 1) // 2, r["nq"]})):
                im = Image.open(os.path.join(r["dir"], f"{k:04d}.jpg")).convert("RGB")
                hh = int(round(tw * r["OH"] / r["OW"]))
                im = im.resize((tw, min(th, hh)), Image.BILINEAR)
                sh.paste(im, (X + c * tw, Y))
                ye = Y + int(r["olho"] * im.height)
                d.line([(X + c * tw, ye), (X + c * tw + 10, ye)], fill=(0, 230, 255), width=2)
                d.line([(X + c * tw + tw - 10, ye), (X + c * tw + tw, ye)], fill=(0, 230, 255), width=2)
            for q, txt in enumerate(r["rotulo"]):
                d.text((X + 3, Y + th + 2 + q * 16), txt, fill=(255, 220, 0) if q == 0 else (255, 90, 90) if q == 2 else (200, 200, 200),
                       font=f1 if q == 0 else f2)
        fn = os.path.join(P, "out", f"clipes_folha_{stamp}" + (f"_{s // (por_linha * linhas) + 1}" if len(ok) > por_linha * linhas else "") + ".jpg")
        sh.save(fn, quality=88)
        saidas.append(fn)
    return saidas


t0 = time.time()
itens = [x for x in le_lista() if not SO or x[0] in SO]
with ThreadPoolExecutor(J) as ex:
    res = list(ex.map(extrai, itens))
for r in res:
    print(r["linha"], flush=True)
n = {c: len([f for f in os.listdir(os.path.join(CLIPS, c)) if f.endswith(".jpg")]) for c in sorted(os.listdir(CLIPS))
     if os.path.isdir(os.path.join(CLIPS, c))}
open(os.path.join(P, "render", "clipn.js"), "w", encoding="utf-8").write(
    "window.CLIPN = " + json.dumps(n) + ";\nwindow.CLIPFPS = 24;\n")
for fn in folha(res):
    print("folha:", fn)
print(f"render/clipn.js: {len(n)} clipes a 24 q/s ({time.time() - t0:.0f} s)")
