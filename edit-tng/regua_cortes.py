"""Regua de cortes CALIBRADA (formato TNG / Mark Goldbridge, 04/11/2026) — conta trocas de plano reais, nao movimento.

uso (Python do kit): python -I regua_cortes.py <video.mp4> [--de T0] [--ate T1] [--json saida.json] [--sem-mascara] [--lista]
  meta (REF, 93 fronteiras-ouro em 73,92 s antes do fade): 75,5/min -> aceite 70-80/min; sem os passos da montagem-relampago 67,4/min
  plano: media 0,79 s, mediana 0,75 s (REF)

Como decide (por par de IMAGENS UNICAS consecutivas, 360x640 cinza + 90x160 cor; selo TNG e faixa da legenda mascarados):
  1. quadro repetido (MAD < 0,8) nao e imagem nova (o formato anda a 12 imagens/s; serve para 24 e 30 q/s)
  2. ORB 3000 pontos + crossCheck + RANSAC de semelhanca (escala, giro, deslocamento) entre a e b
  3. IDENT (>= 100 inliers, transformacao ~identidade e |d luma| >= 0,6 MAD) = mesma imagem com outro brilho (fade) -> nunca corte
  4. COR     histograma HSV com correlacao < 0,5 e MAD > 12                                -> corte (troca de fonte)
  5. PONTOS  < 25 inliers e MAD > 20 e (residuo apos alinhar > 20 ou sem transformacao)   -> corte (fonte parecida na cor)
  6. SALTO   >= 25 inliers, passo grande (|ln escala| > 0,08 ou giro > 6 graus ou deslocamento > 55 px@360) e
             >= 3x o passo dos pares vizinhos -> corte (punch-in / reenquadre); movimento sustentado (futebol, deslize) nao conta
Nao conta (por desenho, igual ao gabarito da REF): pulo de tempo no MESMO enquadramento e reenquadre sutil (< 8% de escala,
< 6 graus, < 15% da largura). Validado na REF (93/93, 0 falso) e em 2 renders de teste do kit com lista de planos conhecida
(teste A 27/27; teste B 27/29, perdeu so os 2 saltos sutis plantados), a 24 e a 30 q/s.
"""
import json, math, subprocess, sys
import numpy as np, cv2

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
arg = lambda k, d=None: a[a.index(k) + 1] if k in a else d
v = a[0]
de, ate = arg("--de"), arg("--ate")
META = (70.0, 80.0)
H_, I_, M_, R_, T_, MC_, RAZ_ = .5, 25, 20, 20, 55, 12, 3
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "json", v],
                               capture_output=True, text=True).stdout)["streams"][0]
n_, d_ = pr["r_frame_rate"].split("/"); fps = float(n_) / float(d_)
W, H = 360, 640
cut = (["-ss", de] if de else []) + ["-i", v] + (["-t", str(float(ate) - float(de or 0))] if ate else [])


def ff(vf, w, h, fmt):
    b = subprocess.run(["ffmpeg", "-v", "error"] + cut + ["-vf", vf, "-pix_fmt", fmt, "-f", "rawvideo", "-"], capture_output=True).stdout
    return np.frombuffer(b, np.uint8).reshape(-1, h, w, 3) if fmt == "rgb24" else np.frombuffer(b, np.uint8).reshape(-1, h, w)


g = ff(f"scale={W}:{H}:flags=area", W, H, "gray")
c = ff("scale=90:160:flags=area", 90, 160, "rgb24")
N = min(len(g), len(c))
if N < 10:
    sys.exit(f"não consegui ler {v}")
mask = np.full((H, W), 255, np.uint8)
if "--sem-mascara" not in a:
    mask[76:108, 42:104] = 0      # selo TNG (left 141 top 243 153x66 @1080)
    mask[272:352, :] = 0          # faixa da legenda (centro y ~937 @1080)
mask_s = (cv2.resize(mask, (90, 160), interpolation=cv2.INTER_NEAREST) > 0).astype(np.uint8)
uniq = [0] + [i for i in range(1, N) if float(np.abs(g[i].astype(np.int16) - g[i - 1]).mean()) >= 0.8]
orb = cv2.ORB_create(3000, fastThreshold=7)
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
kd = {}


def pontos(i):
    if i not in kd:
        kd[i] = orb.detectAndCompute(g[i], mask)
    return kd[i]


def hist(i):
    h = cv2.calcHist([cv2.cvtColor(c[i], cv2.COLOR_RGB2HSV)], [0, 1, 2], mask_s, [12, 6, 6], [0, 180, 0, 256, 0, 256])
    return cv2.normalize(h, h).flatten()


pares = []
for j in range(1, len(uniq)):
    ia, ib = uniq[j - 1], uniq[j]
    (ka, da), (kb, db) = pontos(ia), pontos(ib)
    A, B = g[ia].astype(np.float32), g[ib].astype(np.float32)
    p = {"b": ib, "mad": float(np.abs(A - B)[mask > 0].mean()), "hist": float(cv2.compareHist(hist(ia), hist(ib), cv2.HISTCMP_CORREL)),
         "dlum": float(B[mask > 0].mean() - A[mask > 0].mean()),
         "inl": 0, "geo": None, "res": None}
    if da is not None and db is not None and len(ka) >= 8 and len(kb) >= 8:
        m = bf.match(da, db)
        if len(m) >= 6:
            s = np.float32([ka[x.queryIdx].pt for x in m]); t = np.float32([kb[x.trainIdx].pt for x in m])
            M, inl = cv2.estimateAffinePartial2D(s, t, method=cv2.RANSAC, ransacReprojThreshold=3.0, maxIters=4000, confidence=0.995)
            if M is not None:
                sc = float(np.hypot(M[0, 0], M[1, 0]))
                p["inl"] = int(inl.sum())
                p["geo"] = (abs(math.log(max(sc, 1e-3))), abs(math.degrees(math.atan2(M[1, 0], M[0, 0]))), float(np.hypot(M[0, 2], M[1, 2])))
                wp = cv2.warpAffine(A, M, (W, H), flags=cv2.INTER_LINEAR)
                val = (cv2.warpAffine(np.full((H, W), 255, np.uint8), M, (W, H), flags=cv2.INTER_NEAREST) > 0) & (mask > 0)
                dd = np.abs(wp - B)[val]
                p["res"] = float(dd.mean()) if dd.size > 1000 else None
    pares.append(p)
passo = lambda p: p["geo"][2] + 360 * p["geo"][0] + 6 * p["geo"][1]
# mesma geometria (>= 100 inliers, ~identidade) E mudanca so de brilho (|d luma| >= 0,6 MAD) = fade -> nunca corte.
# Mesma geometria com troca LOCAL (outro texto/foto no mesmo molde) continua podendo ser corte pela cor.
ident = [p["inl"] >= 100 and p["geo"] is not None and p["geo"][0] < .01 and p["geo"][1] < .5 and p["geo"][2] < 4
         and abs(p["dlum"]) >= .6 * p["mad"] for p in pares]
tipo = [None] * len(pares)
for j, p in enumerate(pares):
    if ident[j]:
        continue
    if p["hist"] < H_ and p["mad"] > MC_:
        tipo[j] = "cor"
    elif p["inl"] < I_ and p["mad"] > M_ and (p["res"] is None or p["res"] > R_):
        tipo[j] = "pontos"
for j, p in enumerate(pares):
    if tipo[j] or ident[j] or p["inl"] < I_ or p["geo"] is None:
        continue
    gg = p["geo"]
    if not (gg[0] > .08 or gg[1] > 6 or gg[2] > T_):
        continue
    viz = [pares[k] for k in (j - 1, j + 1) if 0 <= k < len(pares) and not tipo[k] and pares[k]["inl"] >= I_ and pares[k]["geo"] is not None]
    if viz and all(passo(q) <= passo(p) / RAZ_ for q in viz):
        tipo[j] = "salto"
t0 = float(de or 0)
cortes = [(pares[j]["b"] / fps, tipo[j]) for j in range(len(pares)) if tipo[j]]
dur = N / fps
# fade final (luma subindo/descendo com a mesma imagem) fica fora da conta do ritmo: acha onde o quadro vira so cor chapada
lum = g.reshape(N, -1).mean(1)
fim = dur
k = N - 1
while k > 0 and (abs(lum[k] - lum[k - 1]) > .3 or g[k].std() < 4):
    k -= 1
if dur - k / fps > .25:
    fim = (k + 1) / fps
ct = [t for t, _ in cortes if t < fim]
pl = np.diff([0] + ct + [fim])
curto = pl < .12                                               # plano de 1 imagem (83 ms a 24 q/s; 67-100 ms a 30 q/s)
corridas = sum(1 for i in range(len(curto)) if curto[i] and (i == 0 or not curto[i - 1]))
mont = int(curto.sum()) - corridas                             # passos DENTRO das montagens-relampago (11 imagens = 10 passos)
taxa = len(ct) / fim * 60
print(f"{v.replace(chr(92), '/').split('/')[-1]} {t0:.1f}–{t0 + dur:.1f} s: {len(ct)} cortes em {fim:.2f} s (antes do fade) -> {taxa:.1f}/min "
      f"[{'ok' if META[0] <= taxa <= META[1] else 'FORA DA META'} {META[0]:.0f}–{META[1]:.0f}; REF 75,5] | sem passos de montagem "
      f"{(len(ct) - mont) / fim * 60:.1f}/min (REF 67,4) | plano médio {pl.mean():.2f} s, mediana {np.median(pl):.2f} s (REF 0,79 / 0,75)")
from collections import Counter
print("  tipos:", dict(Counter(tp for t, tp in cortes if t < fim)), f"| imagens únicas/s {len(uniq) / dur:.1f} | planos > 2 s:",
      " ".join(f"{t0 + x:.1f}s({p_:.1f})" for x, p_ in zip([0] + ct, pl) if p_ > 2) or "nenhum")
if "--lista" in a:
    print("  cortes:", " ".join(f"{t0 + t:.3f}{'' if tp == 'cor' else '/' + tp}" for t, tp in cortes))
if arg("--json"):
    json.dump({"video": v, "fps": fps, "dur": dur, "fim_sem_fade": fim, "t": [round(t0 + t, 4) for t, _ in cortes],
               "tipos": [tp for _, tp in cortes], "por_min": round(taxa, 2)}, open(arg("--json"), "w"), indent=0)
