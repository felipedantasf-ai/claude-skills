"""(edit-earn) Mede o vídeo pronto contra os números da referência (earn.edits): dinamismo, cor e CENTRALIZAÇÃO do personagem.

uso (Python do kit): python medir.py <projeto | video.mp4> [--sem-centro]
Metas (medidas na referência, 31/10/2026):
  movimento   fluxo óptico médio >= 1,2 px/quadro (ref. 1,48) · quadros quase parados <= 15% (ref. 15%) · picos de mudança >= 120/min (ref. 183)
  centro      centro do assunto principal a <= 2,5% do meio na horizontal (mediana; ref. 1,6%) · >= 90% dos quadros a menos de 8% do meio
              (ref. 93%) · centro vertical na mediana entre 50% e 60% da altura (ref. 55%) · altura do assunto 45–65% do quadro (ref. 56%)
  cor         saturação média >= .30 (ref. .31) — mais viva é permitido (pedido do Felipe: "as cores saltam aos olhos")
O assunto principal é achado pelo BiRefNet do kit (ferramentas/recorte_hq.py, ambiente .venv_ia) em quadros a 2 q/s;
quadros sem assunto claro (tipografia, textura) não entram na conta. --sem-centro pula essa parte (mais rápido).
"""
import glob, os, shutil, subprocess, sys, tempfile
import numpy as np, cv2
from PIL import Image
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


def le(v, fps, w, h):
    raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", v, "-vf", f"fps={fps},scale={w}:{h}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)


ok = lambda c: "ok" if c else "ABAIXO DA META"
fr = le(alvo, 30, 180, 320)
g = [cv2.cvtColor(f, cv2.COLOR_RGB2GRAY) for f in fr]
flow = []
for x, y in zip(g, g[1:]):
    F = cv2.calcOpticalFlowFarneback(x, y, None, .5, 3, 15, 3, 5, 1.2, 0)
    med = np.median(F.reshape(-1, 2), axis=0)
    flow.append((np.hypot(F[..., 0], F[..., 1]).mean(), np.hypot(*med)))
flow = np.array(flow)
mad = np.array([np.abs(x.astype(np.float32) - y).mean() for x, y in zip(g, g[1:])])
picos = int(np.sum((mad[1:-1] > mad[:-2]) & (mad[1:-1] > mad[2:]) & (mad[1:-1] > 6)))
dur = len(fr) / 30
parado = float(np.mean(flow[:, 0] < .15))
hsv = np.array([cv2.cvtColor(f, cv2.COLOR_RGB2HSV) for f in fr[::3]]).astype(np.float32)
sat = float(hsv[..., 1].mean() / 255)
print(f"{os.path.basename(alvo)} ({dur:.1f} s)")
print(f"  movimento: fluxo médio {flow[:, 0].mean():.2f} px/q [{ok(flow[:, 0].mean() >= 1.2)}] · câmera {flow[:, 1].mean():.2f} (ref. .60) · "
      f"quase parados {parado:.0%} [{ok(parado <= .15)}] · picos de mudança {picos / dur * 60:.0f}/min [{ok(picos / dur * 60 >= 120)}]")
print(f"  cor: saturação {sat:.2f} [{ok(sat >= .30)}]")
if "--sem-centro" in a:
    sys.exit(0)
d = tempfile.mkdtemp(prefix="ea_medir_")
try:
    q = le(alvo, 2, 540, 960)
    fs = []
    for i, f in enumerate(q):
        fn = os.path.join(d, f"{i:04d}.jpg"); Image.fromarray(f).save(fn, quality=90); fs.append(fn)
    py_ia = os.path.join(KIT, ".venv_ia", "Scripts", "python.exe")
    r = subprocess.run([py_ia, os.path.join(KIT, "ferramentas", "recorte_hq.py"), *fs, "--saida", d], capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    ms = sorted(glob.glob(os.path.join(d, "*_mask.png")))
    if not ms:
        sys.exit("  centro: BiRefNet indisponível (" + (r.stderr or r.stdout)[-200:] + ")")
    cx, cy, alt, fora = [], [], [], []
    for i, f in enumerate(ms):
        m = np.asarray(Image.open(f).convert("L"), np.float32) / 255
        if m.mean() < .01 or m.mean() > .85:
            continue
        h, w = m.shape; ys, xs = np.mgrid[0:h, 0:w]; s = m.sum()
        x0, y0 = (m * xs).sum() / s / w, (m * ys).sum() / s / h
        rows = np.where(m.max(1) > .5)[0]
        cx.append(x0); cy.append(y0); alt.append((rows.max() - rows.min()) / h if len(rows) else 0)
        if abs(x0 - .5) >= .08: fora.append(i / 2)
    cx, cy, alt = map(np.array, (cx, cy, alt))
    dx = np.abs(cx - .5)
    print(f"  centro: {len(cx)}/{len(ms)} quadros com assunto · desvio horizontal mediano {np.median(dx):.3f} [{ok(np.median(dx) <= .025)}] · "
          f"{np.mean(dx < .08):.0%} a menos de 8% do meio [{ok(np.mean(dx < .08) >= .9)}] · centro vertical {np.median(cy):.2f} "
          f"[{ok(.5 <= np.median(cy) <= .6)}] · altura do assunto {np.median(alt):.2f} [{ok(.45 <= np.median(alt) <= .65)}]")
    if fora:
        print("  assunto fora do centro em (s):", " ".join(f"{t:.1f}" for t in fora))
finally:
    shutil.rmtree(d, ignore_errors=True)
