"""Ritmo do vídeo pronto contra a referência do formato edit-earn (detector ESTRITO: zoom/pan rápido não conta como corte)
e trechos PARADOS (o formato nunca para: a câmera anda o plano inteiro).

uso (Python do kit): python ritmo.py <projeto | video.mp4> [t0 t1]
  referência (earn.edits): 26,7 trocas de plano/min, plano médio 2,25 s, o mais longo 4,3 s — aceite 20–34/min, nenhum plano > 5 s
  parado: >= 0,5 s seguidos sem mudança visível na imagem (diferença média < 0,35 em 255 numa miniatura 90x160)
"""
import os, subprocess, sys
import numpy as np, cv2
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
alvo = a[0]
if not alvo.lower().endswith((".mp4", ".mov", ".mkv")):
    P = alvo if os.path.isabs(alvo) else os.path.join(KIT, "projetos", alvo)
    alvo = os.path.join(P, "out", "master.mp4")
t0 = float(a[1]) if len(a) > 2 else 0.0
FPS = 24
cmd = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-t", str(float(a[2]) - t0)] if len(a) > 2 else []) + ["-i", alvo, "-vf", f"fps={FPS},scale=90:160", "-pix_fmt", "gray", "-f", "rawvideo", "-"]
g = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.uint8).reshape(-1, 160, 90).astype(np.float32)
if len(g) < 10:
    sys.exit(f"não consegui ler {alvo}")


def melhor(x, y):
    r = 1e9
    for s in (1.0, 1.05, 1.1, .95, .9):
        for ang in (0, 4, -4):
            M = cv2.getRotationMatrix2D((45, 80), ang, s); r = min(r, float(np.mean(np.abs(cv2.warpAffine(x, M, (90, 160), borderMode=cv2.BORDER_REFLECT) - y))))
    return r


d = np.array([0] + [melhor(g[i - 1], g[i]) for i in range(1, len(g))])
cru = np.array([0] + [float(np.mean(np.abs(g[i] - g[i - 1]))) for i in range(1, len(g))])
cortes = []
for i in range(1, len(g)):
    if d[i] > 20 and d[i] > 3 * np.median(d[max(1, i - 12):i + 12]) and (not cortes or i - cortes[-1] > 3):
        cortes.append(i)
dur = len(g) / FPS
pl = np.diff([0] + cortes + [len(g)]) / FPS
print(f"{os.path.basename(alvo)} {t0:.1f}–{t0 + dur:.1f} s: {len(cortes)} trocas de plano -> {len(cortes) / dur * 60:.1f}/min (referência 26,7; aceite 20–34) | "
      f"plano médio {pl.mean():.2f} s, mediana {np.median(pl):.2f} s, o mais longo {pl.max():.2f} s (ref. 2,25 / 4,3)")
b0 = [0] + cortes
longos = [(t0 + b0[i] / FPS, p) for i, p in enumerate(pl) if p > 5.0]
print("planos > 5 s (divida em dois mundos ou ponha um evento no meio):", " ".join(f"{x:.1f}s({p:.1f})" for x, p in longos) or "nenhum")
parado, ini = [], None
for i in range(1, len(g)):
    if cru[i] < .35:
        ini = i if ini is None else ini
    else:
        if ini is not None and i - ini >= FPS // 2: parado.append((t0 + ini / FPS, (i - ini) / FPS))
        ini = None
if ini is not None and len(g) - ini >= FPS // 2: parado.append((t0 + ini / FPS, (len(g) - ini) / FPS))
print("trechos PARADOS >= 0,5 s (o formato nunca para):", " ".join(f"{x:.1f}s({p:.1f})" for x, p in parado) or "nenhum")
