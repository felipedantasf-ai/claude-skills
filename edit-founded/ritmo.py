"""Ritmo do vídeo pronto contra a referência do formato edit-founded (detector ESTRITO: zoom/pan rápido não conta como corte).

uso (Python do kit): python ritmo.py <projeto | video.mp4> [t0 t1]
  referência (Monster/FOUNDED): 101 trocas/min, plano médio 0,59 s, mediana 0,50 s — aceite 85–115/min
  trechos parados: > 1,6 s sem troca (o cartão mais longo da referência tem ~1,5 s; telas de contador/final à parte)
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
cmd = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-t", str(float(a[2]) - t0)] if len(a) > 2 else []) + ["-i", alvo, "-vf", "fps=24,scale=90:160", "-pix_fmt", "gray", "-f", "rawvideo", "-"]
g = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.uint8).reshape(-1, 160, 90).astype(np.float32)
if len(g) < 10:
    sys.exit(f"não consegui ler {alvo}")
def melhor(x, y):
    r = 1e9
    for s in (1.0, 1.04, 1.08, .96, .92):
        M = cv2.getRotationMatrix2D((45, 80), 0, s); r = min(r, float(np.mean(np.abs(cv2.warpAffine(x, M, (90, 160), borderMode=cv2.BORDER_REFLECT) - y))))
    return r
d = np.array([0] + [melhor(g[i - 1], g[i]) for i in range(1, len(g))])
cortes = []
for i in range(1, len(g)):
    if d[i] > 22 and d[i] > 3 * np.median(d[max(1, i - 12):i + 12]) and (not cortes or i - cortes[-1] > 2):
        cortes.append(i)
dur = len(g) / 24
pl = np.diff([0] + cortes + [len(g)]) / 24
print(f"{os.path.basename(alvo)} {t0:.1f}–{t0 + dur:.1f} s: {len(cortes)} trocas -> {len(cortes) / dur * 60:.0f}/min (referência 101; aceite 85–115) | "
      f"plano médio {pl.mean():.2f} s, mediana {np.median(pl):.2f} s (ref. 0,59 / 0,50)")
b0 = [0] + cortes
longos = [(t0 + b0[i] / 24, p) for i, p in enumerate(pl) if p > 1.6]
print("planos > 1,6 s (só contador, produto girando ou final podem):", " ".join(f"{x:.1f}s({p:.1f})" for x, p in longos) or "nenhum")
