"""Confere se os quadros do vídeo são do corte atual e se a boca bate com o áudio (LulaGanhouEmpresa v1, 26/10/2026: o corte
mudou, os quadros não foram refeitos e a boca escorregou; "cortes errados" apareciam porque a imagem era de outro corte).

uso (Python do kit):  sincronia.py <projeto> [video.mp4]
  1. quadros em work/frames e work/frames_largos == round(duração do work/edl.json × 30)? Se não: os quadros são de outro corte
     -> rode `pipeline.py preparar <projeto>` (refaz os quadros quando o corte muda). NUNCA rode build_edl.py sozinho.
  2. correlação entre o movimento da boca (recorte no rosto rastreado) e o nível do áudio do corte, atrasos de -15 a +15 quadros:
     pico claro em 0 ou ±1 quadro = sincronizado; pico longe de 0 ou curva sem pico = quadros fora do corte.
  3. com [video.mp4] (entrega ou out/master.mp4): conta os quadros do vídeo e mede o atraso do áudio dele contra o work/cut_audio.wav.
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np, soundfile as sf
from PIL import Image
for _s in (sys.stdout, sys.stderr):   # stderr também: o modo de uso e os erros saem por ele
    if hasattr(_s, "reconfigure"):
        _s.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
edl = json.load(open(os.path.join(P, "work", "edl.json"), encoding="utf-8"))
esp = round(edl["duration"] * 30)
ok = True
for d in ("frames", "frames_largos"):
    p = os.path.join(P, "work", d)
    if os.path.isdir(p):
        n = len([f for f in os.listdir(p) if f.endswith(".jpg")])
        print(f"work/{d}: {n} quadros | esperado {esp} -> {'ok' if n == esp else 'DIFERENTE: rode pipeline.py preparar ' + os.path.basename(P)}")
        ok &= n == esp
t = open(os.path.join(P, "render", "camdata.js"), encoding="utf-8").read()
cx = [float(v) for v in re.search(r"cx:\s*\[([^\]]*)\]", t).group(1).split(",")]
cy = [float(v) for v in re.search(r"cy:\s*\[([^\]]*)\]", t).group(1).split(",")]
fd = os.path.join(P, "work", "frames"); files = sorted(f for f in os.listdir(fd) if f.endswith(".jpg")); N = min(len(files), len(cx))
m, prev = np.zeros(N), None
for f in range(N):
    im = Image.open(os.path.join(fd, files[f])).convert("L").crop((int(cx[f] - 100), int(cy[f] + 70), int(cx[f] + 100), int(cy[f] + 220))).resize((50, 38))
    x = np.asarray(im, np.float32); m[f] = np.abs(x - prev).mean() if prev is not None else 0; prev = x
au, sr = sf.read(os.path.join(P, "work", "cut_audio.wav"), dtype="float32"); au = au.mean(1) if au.ndim > 1 else au
hop = sr // 30; A = 20 * np.log10(np.array([np.sqrt((au[i * hop:(i + 1) * hop] ** 2).mean() + 1e-12) for i in range(N)]) + 1e-6)
mask = np.ones(N, bool)
for e in edl["edl"]:
    mask[max(0, e["o_in"] - 2):min(N, e["o_in"] + 3)] = False   # fora dos saltos de corte
z = lambda v: (v - v[mask].mean()) / (v[mask].std() + 1e-9)
mz, az = z(m), z(A)
res = []
for L in range(-15, 16):
    if L >= 0: p, q, k = mz[L:], az[:N - L], mask[L:] & mask[:N - L]
    else: p, q, k = mz[:L], az[-L:], mask[:L] & mask[-L:]
    res.append((L, float((p[k] * q[k]).mean())))
best = max(res, key=lambda r: r[1])
print("boca x áudio: " + " ".join(f"{L}:{c:.3f}" for L, c in res if -6 <= L <= 6))
sinc = abs(best[0]) <= 1 and best[1] > .05
if N < 900:   # menos de 30 s: o ritmo das sílabas (~5 por segundo) faz picos a cada ~6 quadros e o pico verdadeiro se perde
    print(f"pico em {best[0]} quadro(s) (correlação {best[1]:.3f}) -> corte curto ({N / 30:.1f} s): este teste só vale a partir de 30 s; confira vendo o vídeo")
else:
    print(f"pico em {best[0]} quadro(s) (correlação {best[1]:.3f}) -> {'SINCRONIZADO' if sinc else 'SUSPEITO: confira os quadros (pipeline.py preparar) e veja o vídeo'}")
    ok &= sinc
if len(a) > 1:
    v = a[1]
    n = int(subprocess.check_output(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", v]).strip())
    def load(p):
        tmp = os.path.join(tempfile.gettempdir(), "_sinc.wav"); subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p, "-ac", "1", "-ar", "16000", tmp], check=True)
        return sf.read(tmp, dtype="float32")[0]
    r0, r1 = load(os.path.join(P, "work", "cut_audio.wav")), load(v); k = min(len(r0), len(r1))
    F, G = np.fft.rfft(r0[:k], 2 * k), np.fft.rfft(r1[:k], 2 * k); cc = np.fft.irfft(np.conj(F) * G)
    lag = np.concatenate([np.arange(0, 8000), np.arange(-8000, 0)]); vals = np.concatenate([cc[:8000], cc[-8000:]])
    ms = lag[int(np.argmax(vals))] / 16
    print(f"{os.path.basename(v)}: {n} quadros ({n / 30:.2f} s) | áudio {ms:+.1f} ms em relação ao corte")
    ok &= abs(ms) <= 20
print("RESULTADO:", "ok" if ok else "PROBLEMA (veja acima)")
