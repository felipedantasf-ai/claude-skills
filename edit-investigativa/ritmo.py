"""Confere o ritmo do vídeo renderizado contra a referência do formato edit-investigativa.

uso (Python do kit): python ritmo.py <projeto | video.mp4> [t0 t1]
Mede cortes (troca brusca de imagem) e mudança contínua (animação) quadro a quadro, em miniatura:
  - cortes por minuto e duração dos planos (referência: 11,5 cortes/min, plano médio 5,0 s, mediana 4,0 s; aceite 9–15/min)
  - trechos "parados" (> 2,5 s sem corte e quase sem movimento): no formato a câmera NUNCA para (viaja, empurra, gira)
"""
import json, os, subprocess, sys
import numpy as np

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
t1 = float(a[2]) if len(a) > 2 else None
W, H = 72, 128
cmd = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-t", str(t1 - t0)] if t1 else []) + ["-i", alvo, "-vf", f"fps=30,scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"]
fr = np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.uint8).reshape(-1, H, W).astype(np.float32)
if len(fr) < 10:
    sys.exit(f"não consegui ler {alvo}")
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
hist = np.stack([np.histogram(f, bins=32, range=(0, 256))[0] for f in fr]).astype(np.float32)
hist /= hist.sum(1, keepdims=True)
hd = .5 * np.abs(np.diff(hist, axis=0)).sum(1)
cortes = []
for i in range(len(d)):
    loc = np.median(np.r_[d[max(0, i - 6):i], d[i + 1:i + 7]]) if len(d) > 1 else 0
    if (d[i] > 14 and d[i] > 3 * loc + 4) or (hd[i] > .35 and d[i] > 2 * loc + 3):
        if not cortes or i + 1 - cortes[-1] > 3:
            cortes.append(i + 1)
dur = len(fr) / 30
ts = [c / 30 for c in cortes]
planos = np.diff([0] + ts + [dur])
print(f"{os.path.basename(alvo)} {t0:.1f}–{t0 + dur:.1f} s: {len(ts)} cortes -> {len(ts) / dur * 60:.1f}/min (referência 11,5; aceite 9–15) | "
      f"plano médio {planos.mean():.2f} s, mediana {np.median(planos):.2f} s (ref. 5,0 / 4,0)")
# trechos parados: plano > 2,5 s cuja mudança média (fora dos cortes) é muito baixa
mov = np.convolve(d, np.ones(15) / 15, mode="same")
bordas = [0] + cortes + [len(fr) - 1]
parados = []
for a0, a1 in zip(bordas, bordas[1:]):
    if (a1 - a0) / 30 > 2.5:
        m = float(np.median(mov[a0 + 3:max(a0 + 4, a1 - 3)]))
        if m < .15:          # a referência tem cenas escuras de câmera lenta com 0,25–0,5: abaixo de 0,15 é imagem congelada
            parados.append((t0 + a0 / 30, t0 + a1 / 30, m))
print("parados (> 2,5 s sem corte e sem movimento):", " ".join(f"{x:.1f}–{y:.1f}s" for x, y, _ in parados) or "nenhum")
longos = [(t0 + bordas[i] / 30, p) for i, p in enumerate(planos) if p > 9]
print("planos > 9 s (a referência só tem 2: o documento de 16,6 s e o fecho de 12,2 s no apresentador):", " ".join(f"{x:.1f}s({p:.1f})" for x, p in longos) or "nenhum")
