"""Varredura barata de UM vídeo candidato (edit-tng): prévia ≤360p -> planos, rostos, nitidez, suspeita de logo/legenda
queimada, e (opcional) identidade e frases com SigLIP 2. Gera o JSON dos momentos e UMA folha de contato para conferir.

uso (Python do kit; com --ref/--prompt ele se reabre sozinho no .venv_ia, que tem torch + SigLIP 2):
  python -I varrer.py <projeto> <ID|URL|arquivo.mp4> [--de s --ate s] [--passo 0.25] [--max 48] [-j 8]
                      [--ref foto1.jpg foto2.jpg ...] [--prompt "smiling on stage"] [--prompt "serious face"] ...
  --de/--ate  janela da fonte (s ou mm:ss). Sem prévia inteira baixada, baixa só a janela (recodificada: tempo exato)
  --passo     intervalo de amostragem (padrão 0,25 s = 4 q/s). 1 h de keynote: ~1–2 min com -j 8
  --max-mom   momento mais longo (padrão 8 s; plano maior é dividido)
  --ref       fotos de referência do rosto (Commons, quadro limpo do canal). Nota "id" = cosseno SigLIP 2 entre o
              rosto do momento e o rosto da referência (indício, não prova: confira na folha)
  --prompt    frases em inglês (o modelo é multilíngue) pontuadas no recorte 9:16 em volta do rosto; nota = cosseno
Saída:
  <projeto>/clipes/prev/<id>.mp4                 prévia (≤360p, sem áudio)
  <projeto>/clipes/varredura/<id>.json           momentos contínuos: t0–t1 (tempo da FONTE), rosto (fração do tempo,
      altura/centro relativos ao quadro, nº de rostos), nitidez (Laplaciano global e no rosto), zoom p/ rosto 0,34 H,
      suspeita de sobreposição (logo/selo fixo entre planos; texto na faixa baixa), id, notas dos prompts, melhor_t
  <projeto>/clipes/varredura/<id>_folha.jpg      ≤48 momentos (os melhores, em ordem de tempo): quadro 16:9 com a caixa
      do rosto (verde) e a faixa 9:16 que o recorte usaria (amarelo); rótulo #n mm:ss–mm:ss · r=altura do rosto ·
      n=nitidez · id · melhor prompt; LOGO?/TEXTO? em vermelho. CONFIRA A FOLHA antes de escolher (Read no jpg).
Depois: baixar_hd.py com  nome  ID  t0-t1  dos momentos escolhidos.
"""
import json, math, os, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
YTDLP = os.path.join(KIT, ".venv", "Scripts", "yt-dlp.exe")
PYIA = os.path.join(KIT, ".venv_ia", "Scripts", "python.exe")
SIGLIP = os.environ.get("SIGLIP", "google/siglip2-so400m-patch14-384")
A = sys.argv[1:]
if len(A) < 2 or A[0].startswith("-"):
    sys.exit(__doc__)


def multi(k):
    """valores de uma opção repetível ou com vários argumentos seguidos"""
    out, i = [], 0
    while i < len(A):
        if A[i] == k:
            i += 1
            while i < len(A) and not A[i].startswith("-"):          # para em qualquer opção (-j, --passo ...)
                out.append(A[i]); i += 1
                if k == "--prompt":
                    break
        else:
            i += 1
    return out


REFS, PROMPTS = multi("--ref"), multi("--prompt")
if (REFS or PROMPTS):
    try:
        import torch  # noqa: F401
    except ImportError:
        if os.path.exists(PYIA) and os.path.normcase(sys.executable) != os.path.normcase(PYIA):
            sys.exit(subprocess.run([PYIA, "-I", os.path.abspath(__file__), *A]).returncode)
        sys.exit("SigLIP pedido (--ref/--prompt), mas não há torch neste Python nem o .venv_ia do kit")

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

cv2.setNumThreads(1)
opt = lambda k, d=None: A[A.index(k) + 1] if k in A else d


def seg(s):
    v = 0.0
    for x in str(s).split(":"):
        v = v * 60 + float(x)
    return v


def projeto(p):
    return p if os.path.isabs(p) else os.path.join(KIT, "projetos", p)


def mmss(t):
    return f"{int(t // 60):02d}:{t % 60:04.1f}" if t < 3600 else f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"


def cascata():
    """Haar a partir de cópia na pasta temporária (OpenCV não abre caminho com acento)"""
    import shutil, tempfile
    dst = os.path.join(tempfile.gettempdir(), "vox_haar_frontalface.xml")
    if not os.path.exists(dst):
        shutil.copyfile(cv2.data.haarcascades + "haarcascade_frontalface_default.xml", dst)
    return cv2.CascadeClassifier(dst)


def ffprobe(fn):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", fn], capture_output=True, text=True)
    j = json.loads(r.stdout)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


# ---------------------------------------------------------------- fonte e prévia
P = projeto(A[0])
SRC = A[1]
DE, ATE = (seg(opt("--de")) if opt("--de") else None), (seg(opt("--ate")) if opt("--ate") else None)
PASSO = float(opt("--passo", "0.25"))
NMAX = int(opt("--max", "48"))
J = int(opt("-j", "8"))
MAXMOM = float(opt("--max-mom", "8"))
for d in ("prev", "varredura"):
    os.makedirs(os.path.join(P, "clipes", d), exist_ok=True)
t_ini = time.time()
offset = 0.0                                   # tempo da fonte no t=0 da prévia
if os.path.exists(SRC):
    prev, vid, url = SRC, os.path.splitext(os.path.basename(SRC))[0], ""
else:
    m = re.search(r"(?:v=|youtu\.be/|shorts/|live/)([\w-]{11})", SRC)
    vid = m.group(1) if m else SRC
    url = SRC if SRC.startswith("http") else f"https://www.youtube.com/watch?v={vid}"
    prev = os.path.join(P, "clipes", "prev", f"{vid}.mp4")
    if not os.path.exists(prev) and DE is not None and ATE is not None:
        prev = os.path.join(P, "clipes", "prev", f"{vid}_{int(DE)}-{int(ATE)}.mp4")
        offset = DE
    if not os.path.exists(prev):
        f = "bv*[height<=360][protocol=https]/bv*[height<=480][protocol=https]/b[height<=360]/wv*"
        cmd = [YTDLP, "--no-warnings", "-q", "--no-part", "-f", f, "-o", prev, url]
        if offset:
            cmd[1:1] = ["--download-sections", f"*{DE}-{ATE}", "--force-keyframes-at-cuts"]   # recodifica: tempo exato
        t = time.time()
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if r.returncode or not os.path.exists(prev):
            sys.exit(f"prévia falhou: {(r.stderr or '').strip()[-300:]}")
        print(f"prévia baixada em {time.time() - t:.0f} s: {prev} ({os.path.getsize(prev) / 1e6:.0f} MB)")
W0, H0, DUR = ffprobe(prev)
a = max(0.0, (DE or 0.0) - offset)
b = min(DUR, (ATE - offset) if ATE is not None else DUR)
if W0 >= H0:
    W, H = (int(round(W0 * 360 / H0 / 2)) * 2, 360) if H0 > 360 else (W0 - W0 % 2, H0 - H0 % 2)
else:
    W, H = (360, int(round(H0 * 360 / W0 / 2)) * 2) if W0 > 360 else (W0 - W0 % 2, H0 - H0 % 2)
print(f"varrendo {vid}: {mmss(a + offset)}–{mmss(b + offset)} ({(b - a) / 60:.1f} min) a cada {PASSO} s em {W}x{H}, {J} partes")

# ---------------------------------------------------------------- 1ª passada (em paralelo, por partes)
GUARDA = max(1, int(round(0.5 / PASSO)))       # guarda 1 quadro JPEG a cada 0,5 s (folha e SigLIP)
REG = {"cantoSE": (0, .16, 0, .18), "cantoSD": (0, .16, .82, 1), "cantoIE": (.82, 1, 0, .18), "cantoID": (.82, 1, .82, 1),
       "baixo": (.72, .95, .1, .9), "centro": (.3, .7, .3, .7)}


def parte(k):
    s0 = a + (b - a) * k / J
    s1 = a + (b - a) * (k + 1) / J
    casc = cascata()
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{s0:.3f}", "-t", f"{s1 - s0:.3f}", "-i", prev, "-an", "-vf",
           f"fps=1/{PASSO},scale={W}:{H}:flags=area", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    nb = W * H * 3
    out = {"t": [], "mini": [], "rosto": [], "nr": [], "nit": [], "nitr": [], "reg": [], "jpg": {}}
    soma_borda, nfr, i = np.zeros((90, 160), np.float32), 0, 0
    ms = max(18, int(0.06 * H))
    while True:
        buf = pr.stdout.read(nb)
        if len(buf) < nb:
            break
        fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        t = s0 + i * PASSO
        g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        out["t"].append(t)
        out["mini"].append(cv2.resize(g, (64, 36), interpolation=cv2.INTER_AREA))
        fs = casc.detectMultiScale(g, scaleFactor=1.12, minNeighbors=5, minSize=(ms, ms))
        fs = [f for f in fs if f[3] >= 0.07 * H]
        lap = cv2.Laplacian(g, cv2.CV_32F)
        out["nit"].append(float(lap.var()))
        if len(fs):
            x, y, w, h = max(fs, key=lambda f: f[2] * f[3])
            out["rosto"].append((x / W, y / H, w / W, h / H))
            out["nitr"].append(float(lap[y:y + h, x:x + w].var()))
        else:
            out["rosto"].append(None)
            out["nitr"].append(0.0)
        out["nr"].append(len(fs))
        e = cv2.Canny(cv2.resize(g, (160, 90), interpolation=cv2.INTER_AREA), 80, 160) > 0
        soma_borda += e
        out["reg"].append([float(e[int(r0 * 90):int(r1 * 90), int(c0 * 160):int(c1 * 160)].mean()) for r0, r1, c0, c1 in REG.values()])
        if i % GUARDA == 0:
            out["jpg"][round(t, 3)] = (cv2.imencode(".jpg", fr, [cv2.IMWRITE_JPEG_QUALITY, 82])[1], out["rosto"][-1])
        nfr += 1; i += 1
    pr.wait()
    out["borda"], out["n"] = soma_borda, nfr
    return out


t = time.time()
with ThreadPoolExecutor(J) as ex:
    partes = list(ex.map(parte, range(J)))
T = np.array([x for p in partes for x in p["t"]]) + offset
MINI = np.array([x for p in partes for x in p["mini"]], np.float32)
ROSTO = [x for p in partes for x in p["rosto"]]
NR = np.array([x for p in partes for x in p["nr"]])
NIT = np.array([x for p in partes for x in p["nit"]])
NITR = np.array([x for p in partes for x in p["nitr"]])
REGV = np.array([x for p in partes for x in p["reg"]])
JPG = {k + offset: v for p in partes for k, v in p["jpg"].items()}
N = len(T)
if N < 2:
    sys.exit("prévia vazia ou curta demais")
print(f"1ª passada: {N} amostras em {time.time() - t:.0f} s ({N / max(time.time() - t, 1e-3):.0f} amostras/s)")

# ---------------------------------------------------------------- planos (corte = salto grande na miniatura)
d = np.r_[0, np.abs(np.diff(MINI, axis=0)).mean(axis=(1, 2))]
med = np.array([np.median(d[max(0, i - 20):i + 21]) for i in range(N)])
corte = (d > np.maximum(18, 4 * med + 6))
corte[0] = True
for i in range(1, N):                                         # quebra de parte/salto de tempo também separa
    if T[i] - T[i - 1] > 2.5 * PASSO:
        corte[i] = True
ini_plano = list(np.flatnonzero(corte)) + [N]

# ---------------------------------------------------------------- sobreposição fixa (logo/selo/tarja) entre planos
borda = sum(p["borda"] for p in partes) / max(1, sum(p["n"] for p in partes))
n_planos = len(ini_plano) - 1
caixas = []
if n_planos >= 4:
    msk = (borda >= 0.55).astype(np.uint8)
    msk[int(.16 * 90):int(.72 * 90), int(.18 * 160):int(.82 * 160)] = 0          # só bordas, cantos e faixa baixa
    nc, lab, st, _ = cv2.connectedComponentsWithStats(msk, 8)
    for c in range(1, nc):
        x, y, w, h, area = st[c]
        if area >= 6:
            caixas.append({"x": round(x / 160, 3), "y": round(y / 90, 3), "w": round(w / 160, 3), "h": round(h / 90, 3), "px": int(area)})
RMED = np.median(REGV, axis=0) + 1e-3

# ---------------------------------------------------------------- momentos
def faixa916(cx):
    """faixa horizontal (0..1) que um recorte 9:16 de altura cheia ocuparia, centrada em cx"""
    w = min(1.0, (9 / 16) * H / W)
    x0 = min(max(cx - w / 2, 0), 1 - w)
    return x0, x0 + w


momentos = []
for p0, p1 in zip(ini_plano[:-1], ini_plano[1:]):
    tem = np.array([ROSTO[i] is not None for i in range(p0, p1)])
    if len(tem) >= 5:                                         # suaviza presença (tira piscadas de 1 amostra)
        tem = np.array([np.mean(tem[max(0, i - 2):i + 3]) >= 0.5 for i in range(len(tem))])
    cortes_int, i0 = [], p0
    for i in range(p0 + 1, p1):
        if tem[i - p0] != tem[i - p0 - 1] and (i - i0) * PASSO >= 1.0:
            cortes_int.append(i); i0 = i
    bordas = [p0] + cortes_int + [p1]
    for q0, q1 in zip(bordas[:-1], bordas[1:]):
        dur = (q1 - q0) * PASSO
        n_div = max(1, math.ceil(dur / MAXMOM))
        for k in range(n_div):
            r0 = q0 + (q1 - q0) * k // n_div
            r1 = q0 + (q1 - q0) * (k + 1) // n_div
            if r1 <= r0:
                continue
            idx = np.arange(r0, r1)
            fr = [ROSTO[i] for i in idx if ROSTO[i] is not None]
            frac = len(fr) / len(idx)
            mo = {"t0": round(float(T[r0]), 2), "t1": round(float(T[r1 - 1] + PASSO), 2)}
            mo["dur"] = round(mo["t1"] - mo["t0"], 2)
            if fr and frac >= 0.3:
                bx = np.median(np.array(fr), axis=0)
                h = float(bx[3])
                mo["rosto"] = {"frac": round(frac, 2), "h": round(h, 3), "cx": round(float(bx[0] + bx[2] / 2), 3),
                               "cy": round(float(bx[1] + bx[3] / 2), 3), "caixa": [round(float(v), 3) for v in bx],
                               "n_rostos": int(np.median(NR[idx])), "zoom_p_034": round(0.34 / max(h, 1e-3), 2)}
                cx = mo["rosto"]["cx"]
                mo["nit_rosto"] = round(float(np.median(NITR[idx][NITR[idx] > 0])), 1) if (NITR[idx] > 0).any() else 0.0
            else:
                mo["rosto"] = None
                cx = 0.5
            mo["nitidez"] = round(float(np.median(NIT[idx])), 1)
            x0, x1 = faixa916(cx)
            av = []
            for c in caixas:
                if c["x"] < x1 and c["x"] + c["w"] > x0:
                    av.append(f"LOGO? fixo em x{c['x']:.2f} y{c['y']:.2f}")
                    break
            rg = REGV[idx].mean(axis=0) / RMED
            bx_, ce_ = REGV[idx, 4], REGV[idx, 5]                     # faixa baixa x centro DO PRÓPRIO momento
            if (rg[4] > 2.2 and bx_.mean() > 0.06 and bx_.mean() > 2.0 * ce_.mean()
                    and bx_.std() / (bx_.mean() + 1e-6) < 0.35):
                av.append("TEXTO? na faixa baixa")
            mo["sobreposicao"] = av
            mo["_idx"] = (int(r0), int(r1))
            momentos.append(mo)

# ---------------------------------------------------------------- SigLIP 2 (opcional): identidade e frases
def quadros_do(mo, k=3):
    ts = sorted(JPG)
    t0, t1 = mo["t0"], mo["t1"]
    dentro = [t for t in ts if t0 <= t < t1] or [min(ts, key=lambda t: abs(t - (t0 + t1) / 2))]
    if len(dentro) > k:
        dentro = [dentro[int(round(j))] for j in np.linspace(0, len(dentro) - 1, k)]
    return dentro


def img_de(t):
    return cv2.imdecode(JPG[t][0], cv2.IMREAD_COLOR)


_CASC = []


def recorte_rosto(fr, caixa=None):
    """quadrado 1,6x em volta do maior rosto (ou da caixa dada); None se não houver rosto"""
    hh, ww = fr.shape[:2]
    if caixa is None:
        if not _CASC:
            _CASC.append(cascata())
        g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
        fs = _CASC[0].detectMultiScale(g, 1.1, 5, minSize=(max(18, int(.05 * hh)),) * 2)
        if not len(fs):
            return None
        x, y, w, h = max(fs, key=lambda f: f[2] * f[3])
    else:
        x, y, w, h = caixa[0] * ww, caixa[1] * hh, caixa[2] * ww, caixa[3] * hh
    s = 1.6 * max(w, h)
    cx, cy = x + w / 2, y + h / 2
    x0, y0 = int(max(0, cx - s / 2)), int(max(0, cy - s / 2))
    x1, y1 = int(min(ww, cx + s / 2)), int(min(hh, cy + s / 2))
    return fr[y0:y1, x0:x1] if x1 - x0 > 8 and y1 - y0 > 8 else None


def recorte_916(fr, cx):
    hh, ww = fr.shape[:2]
    w = min(ww, int(hh * 9 / 16))
    x0 = int(min(max(cx * ww - w / 2, 0), ww - w))
    return fr[:, x0:x0 + w]


if REFS or PROMPTS:
    for k_, v_ in (("HF_HUB_OFFLINE", "1"), ("TRANSFORMERS_VERBOSITY", "error"), ("HF_HUB_DISABLE_PROGRESS_BARS", "1")):
        os.environ.setdefault(k_, v_)
    import torch
    from transformers import AutoModel, AutoProcessor
    try:
        from transformers.utils import logging as _tl
        _tl.disable_progress_bar()
    except Exception:
        pass
    t = time.time()
    model = proc = None
    for kw in ({}, {"cache_dir": os.path.join(KIT, "modelos", "hf", "hub")}):
        try:
            model = AutoModel.from_pretrained(SIGLIP, torch_dtype=torch.float16, **kw).to("cuda").eval()
            proc = AutoProcessor.from_pretrained(SIGLIP, **kw)
            break
        except Exception as e:
            print("  SigLIP não abriu em", kw or "cache padrão", str(e)[:100])
    if model is None:
        sys.exit("SigLIP 2 não encontrado (nenhum download novo é feito por este script)")
    V = lambda o: o if hasattr(o, "float") else (o.pooler_output if getattr(o, "pooler_output", None) is not None else o[0])

    def emb_imgs(bgrs):
        out = []
        for i in range(0, len(bgrs), 64):
            ims = [Image.fromarray(cv2.cvtColor(x, cv2.COLOR_BGR2RGB)) for x in bgrs[i:i + 64]]
            x = proc(images=ims, return_tensors="pt").to("cuda")
            with torch.no_grad():
                e = V(model.get_image_features(pixel_values=x["pixel_values"].half()))
            out.append(torch.nn.functional.normalize(e.float(), dim=-1).cpu().numpy())
        return np.concatenate(out) if out else np.zeros((0, 1))

    ref_e = None
    if REFS:
        crs = []
        for rf in REFS:
            im = cv2.imdecode(np.fromfile(rf, np.uint8), cv2.IMREAD_COLOR)
            if im is None:
                print("  ! referência ilegível:", rf); continue
            c = recorte_rosto(im)
            crs.append(c if c is not None else im)
            print(f"  referência {os.path.basename(rf)}: " + ("rosto achado" if c is not None else "sem rosto (uso a imagem inteira)"))
        ref_e = emb_imgs(crs) if crs else None
    txt_e = None
    if PROMPTS:
        x = proc(text=PROMPTS, padding="max_length", max_length=64, return_tensors="pt").to("cuda")
        with torch.no_grad():
            txt_e = torch.nn.functional.normalize(V(model.get_text_features(**x)).float(), dim=-1).cpu().numpy()
    caras, quem_c, cenas, quem_s = [], [], [], []
    for n, mo in enumerate(momentos):
        for tq in quadros_do(mo):
            fr = img_de(tq)
            if ref_e is not None and mo["rosto"] and JPG[tq][1] is not None:
                c = recorte_rosto(fr, JPG[tq][1])             # caixa achada na 1ª passada (sem novo Haar)
                if c is not None:
                    caras.append(c); quem_c.append(n)
            if txt_e is not None:
                cenas.append(recorte_916(fr, mo["rosto"]["cx"] if mo["rosto"] else .5)); quem_s.append((n, tq))
    if caras:
        sim = emb_imgs(caras) @ ref_e.T
        best = sim.max(axis=1)
        for n in set(quem_c):
            v = best[np.array(quem_c) == n]
            momentos[n]["id"] = round(float(v.max()), 3)
    if cenas:
        sc = emb_imgs(cenas) @ txt_e.T
        for n in set(q[0] for q in quem_s):
            sel = np.array([q[0] == n for q in quem_s])
            v = sc[sel]
            momentos[n]["prompts"] = {p: round(float(v[:, j].max()), 4) for j, p in enumerate(PROMPTS)}
            j = int(np.argmax(v.max(axis=1)))
            momentos[n]["melhor_t"] = [q[1] for q in quem_s if q[0] == n][j]
    print(f"SigLIP 2: {len(caras)} rostos e {len(cenas)} recortes em {time.time() - t:.0f} s")

# ---------------------------------------------------------------- melhor quadro e ranking
nit_ref = np.percentile([m["nitidez"] for m in momentos], 75) + 1e-3
for m in momentos:
    r0, r1 = m.pop("_idx")
    if "melhor_t" not in m:
        idx = np.arange(r0, r1)
        sc = NIT[idx] / nit_ref + np.array([3 * ROSTO[i][3] if ROSTO[i] else 0 for i in idx])
        m["melhor_t"] = round(float(T[idx[int(np.argmax(sc))]]), 2)
    s = 0.0
    if m["rosto"]:
        s += m["rosto"]["frac"] * (0.6 + min(m["rosto"]["h"], 0.4) / 0.4)
    s += 0.4 * min(m["nitidez"] / nit_ref, 1.5)
    s -= 0.8 * bool(m["sobreposicao"])
    s -= 0.6 * (m["dur"] < 0.75)
    m["_s"] = s


def z(v):
    v = np.array(v, float)
    return (v - v.mean()) / (v.std() + 1e-6)


if any("id" in m for m in momentos):
    zz = z([m.get("id", np.nan) if "id" in m else 0 for m in momentos])
    for m, q in zip(momentos, zz):
        if "id" in m:
            m["_s"] += 0.8 * q
if PROMPTS:
    zz = z([max(m.get("prompts", {"": 0}).values()) for m in momentos])
    for m, q in zip(momentos, zz):
        m["_s"] += 0.8 * q
for n, m in enumerate(momentos, 1):
    m["n"] = n
esc = sorted(sorted(momentos, key=lambda m: -m["_s"])[:NMAX], key=lambda m: m["t0"])

# ---------------------------------------------------------------- folha de contato
def fonte(sz, bold=False):
    for f in (("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"), "C:/Windows/Fonts/segoeui.ttf"):
        try:
            return ImageFont.truetype(f, sz)
        except OSError:
            pass
    return ImageFont.load_default()


cols = 6
tw = 256
th = int(round(tw * H / W)) if W >= H else 256
lab = 38
rows = max(1, math.ceil(len(esc) / cols))
folha = Image.new("RGB", (cols * tw, 34 + rows * (th + lab)), (18, 18, 18))
dr = ImageDraw.Draw(folha)
f1, f2 = fonte(14, True), fonte(13)
dr.text((8, 8), f"{vid}  {mmss(T[0])}–{mmss(T[-1] + PASSO)}  {len(momentos)} momentos, {len(esc)} na folha"
        + (f"  · prompts: " + " | ".join(f'p{j + 1}={p}' for j, p in enumerate(PROMPTS)) if PROMPTS else ""),
        fill=(255, 220, 0), font=f1)
ts_jpg = sorted(JPG)
for k, m in enumerate(esc):
    tq = min(ts_jpg, key=lambda t: abs(t - m["melhor_t"]))
    fr = cv2.cvtColor(img_de(tq), cv2.COLOR_BGR2RGB)
    im = Image.fromarray(fr).resize((tw, th), Image.BILINEAR)
    d2 = ImageDraw.Draw(im)
    cx = m["rosto"]["cx"] if m["rosto"] else .5
    x0, x1 = faixa916(cx)
    d2.rectangle([x0 * tw, 0, x1 * tw - 1, th - 1], outline=(255, 210, 0), width=1)
    if m["rosto"]:
        bx = m["rosto"]["caixa"]
        d2.rectangle([bx[0] * tw, bx[1] * th, (bx[0] + bx[2]) * tw, (bx[1] + bx[3]) * th], outline=(0, 255, 90), width=2)
    X, Y = (k % cols) * tw, 34 + (k // cols) * (th + lab)
    folha.paste(im, (X, Y))
    dr.text((X + 3, Y + th + 1), f"#{m['n']} {mmss(m['t0'])}–{mmss(m['t1'])}", fill=(240, 240, 240), font=f1)
    l2 = (f"r{m['rosto']['h']:.2f}" + (f"×{m['rosto']['n_rostos']}" if m['rosto']['n_rostos'] > 1 else "") if m["rosto"] else "sem rosto")
    l2 += f" n{m['nitidez']:.0f}"
    if "id" in m:
        l2 += f" id{m['id']:.2f}"
    if m.get("prompts"):
        j = int(np.argmax(list(m["prompts"].values())))
        l2 += f" p{j + 1} {list(m['prompts'].values())[j]:.3f}"
    dr.text((X + 3, Y + th + 19), l2, fill=(170, 170, 170), font=f2)
    if m["sobreposicao"]:
        dr.text((X + tw - 62, Y + th + 19), "LOGO?" if "LOGO" in m["sobreposicao"][0] else "TEXTO?", fill=(255, 70, 70), font=f1)
base = os.path.join(P, "clipes", "varredura", vid + (f"_{int(DE)}-{int(ATE)}" if DE is not None and ATE is not None else ""))
folha.save(base + "_folha.jpg", quality=88)
for m in momentos:
    m.pop("_s", None)
json.dump({"fonte": url or os.path.abspath(prev), "id": vid, "previa": os.path.abspath(prev), "previa_WxH": f"{W0}x{H0}",
           "janela": [round(float(T[0]), 2), round(float(T[-1] + PASSO), 2)], "passo": PASSO, "planos": n_planos,
           "sobreposicao_fixa": caixas, "refs": REFS, "prompts": PROMPTS, "na_folha": [m["n"] for m in esc],
           "momentos": momentos}, open(base + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
com = [m for m in momentos if m["rosto"]]
print(f"{n_planos} planos, {len(momentos)} momentos ({len(com)} com rosto"
      + (f", {sum(1 for m in com if m['rosto']['h'] >= .15)} com rosto ≥0,15 H" if com else "") + ")"
      + (f"; sobreposição fixa: {len(caixas)} caixa(s)" if caixas else ""))
print(f"json : {base}.json\nfolha: {base}_folha.jpg  ({len(esc)} momentos)\ntotal {time.time() - t_ini:.0f} s")
