"""Confere se o vídeo tem COR VIVA o tempo todo (pedido do Felipe em 14/10/2026: imagens e motions em cores vivas e chamativas).

uso: python checar_cores.py <projeto> [--video out/master.mp4 | --previas] [--passo .5] [--min .12]

Para cada quadro amostrado mede a fração da tela com cor viva: pixels com saturação >= 0,45 e brilho >= 0,30 (HSV),
sem contar a faixa da barra de progresso. Papel cinza, foto P&B, traço branco e legenda clara não contam.
  --video   vídeo a medir (padrão out/master.mp4)
  --previas mede as prévias out/prev_*.png (antes do render; rode depois do previas.py ou do render.py preview)
  --passo   intervalo entre quadros no vídeo (s, padrão 0,5)
  --min     fração mínima de cor viva por quadro (padrão 0,12 = 12% da tela)
Saída: média, trechos abaixo do mínimo (corrija os de 1 s ou mais) e out/cores_baixas.jpg com esses quadros.
Como corrigir: recorte colorido maior, bloco de cor viva atrás do assunto, foto colorida (ou duotone), raios/formas
no momento forte, fundo de papel colorido, traços em cor viva.
"""
import glob, os, re, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import numpy as np
from PIL import Image, ImageDraw

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
PASSO, MIN = float(opt("--passo", .5)), float(opt("--min", .12))
TW, TH = 144, 256


def viva(rgb):
    x = rgb.astype(np.float32) / 255.0
    mx, mn = x.max(2), x.min(2)
    s = (mx - mn) / np.maximum(mx, 1e-6)
    m = (s >= .45) & (mx >= .30)
    return float(m[: int(TH * .965)].mean())     # ignora a barra de progresso (y > 1850)


quadros = []                                      # (tempo, fração, miniatura)
if "--previas" in a:
    for f in sorted(glob.glob(os.path.join(P, "out", "prev_*.png"))):
        t = float(re.search(r"prev_([\d.]+)\.png", f).group(1))
        im = Image.open(f).convert("RGB").resize((TW, TH))
        quadros.append((t, viva(np.asarray(im)), im))
else:
    v = opt("--video", os.path.join(P, "out", "master.mp4"))
    v = v if os.path.isabs(v) else os.path.join(P, v)
    if not os.path.exists(v):
        sys.exit(f"vídeo não encontrado: {v} (use --previas antes do render)")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vf", f"fps=1/{PASSO},scale={TW}:{TH}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         capture_output=True).stdout
    n = len(raw) // (TW * TH * 3)
    arr = np.frombuffer(raw[: n * TW * TH * 3], np.uint8).reshape(n, TH, TW, 3)
    for i in range(n):
        quadros.append(((i + .5) * PASSO, viva(arr[i]), Image.fromarray(arr[i])))
if not quadros:
    sys.exit("nenhum quadro para medir")

fr = np.array([q[1] for q in quadros])
baixos = [q for q in quadros if q[1] < MIN]
print(f"{len(quadros)} quadros | cor viva média {fr.mean() * 100:.0f}% da tela | abaixo de {MIN * 100:.0f}%: {len(baixos)} ({len(baixos) / len(quadros) * 100:.0f}%)")

# trechos contínuos abaixo do mínimo (no vídeo); nas prévias, cada quadro é um ponto
trechos, cur = [], None
passo = PASSO if "--previas" not in a else 0
for t, f, _ in quadros:
    if f < MIN:
        if cur and (passo == 0 or t - cur[1] <= passo * 1.01):
            cur[1] = t; cur[2] = min(cur[2], f)
        else:
            cur = [t, t, f]; trechos.append(cur)
    else:
        cur = None
corrigir = [tr for tr in trechos if passo == 0 or tr[1] - tr[0] + passo >= 1.0]
for t0, t1, f in trechos:
    dur = t1 - t0 + passo
    marca = "CORRIGIR" if (passo == 0 or dur >= 1.0) else "ok (curto)"
    print(f"  {t0 - passo / 2:7.2f}–{t1 + passo / 2:7.2f}s  ({dur:4.1f} s)  mínimo {f * 100:3.0f}%  {marca}")
print("cor: ok" if not corrigir else f"cor: {len(corrigir)} trecho(s) para corrigir")

if baixos:
    cols, sel = 10, baixos[:60]
    rows = (len(sel) + cols - 1) // cols
    sh = Image.new("RGB", (cols * (TW + 4), rows * (TH + 16)), (22, 22, 22)); d = ImageDraw.Draw(sh)
    for i, (t, f, im) in enumerate(sel):
        x, y = (i % cols) * (TW + 4), (i // cols) * (TH + 16)
        sh.paste(im, (x, y)); d.text((x + 3, y + TH + 2), f"{t:.1f}s {f * 100:.0f}%", fill=(255, 210, 0))
    os.makedirs(os.path.join(P, "out"), exist_ok=True)
    out = os.path.join(P, "out", "cores_baixas.jpg"); sh.save(out, quality=84); print("folha:", out)
