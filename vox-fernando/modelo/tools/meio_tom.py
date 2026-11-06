"""Impressões com MEIO-TOM visível (halftone dots), pedido do Felipe (17/10/2026, vídeo da Alemanha): pontos de retícula a 45°
que crescem nas sombras, sobre papel creme. Duas tintas:
  pb  -> pontos pretos sobre papel creme (fotos históricas P&B)
  cor -> pontos na cor da própria foto sobre papel creme (fotos coloridas)
Desenha em 2x e reduz (pontos redondos, sem serrilhado). Saída: render/assets/print_<nome>.jpg (1000 px de largura) + folha.

uso: python tools/meio_tom.py ARQ[:cx[:proporcao[:modo[:periodo[:gama]]]]] ...
  cx (0..1, padrão .5), proporcao largura/altura do recorte (padrão .75; 1.33 = paisagem), modo pb|cor (padrão: detecta),
  periodo = tamanho da célula em px na saída de 1000 px (padrão 11)
"""
import os, subprocess, sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTW, SS = 1000, 2
PAPEL = np.array([240, 234, 220], np.float32)       # creme
TINTA = np.array([24, 22, 22], np.float32)

def tela(h, w, period, ang):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = np.deg2rad(ang); u = (xx * np.cos(t) + yy * np.sin(t)) * 2 * np.pi / period; v = (-xx * np.sin(t) + yy * np.cos(t)) * 2 * np.pi / period
    return (np.cos(u) + np.cos(v)) / 4 + .5          # 0..1: limiar que forma pontos redondos

tiles = []
for item in sys.argv[1:]:
    parts = item.split(":")
    if len(parts) > 1 and len(parts[0]) == 1: parts = [parts[0] + ":" + parts[1]] + parts[2:]
    path = parts[0] if os.path.isabs(parts[0]) else os.path.join(P, parts[0])
    cx = float(parts[1]) if len(parts) > 1 and parts[1] else .5
    ar = float(parts[2]) if len(parts) > 2 and parts[2] else .75
    modo = parts[3] if len(parts) > 3 and parts[3] else None
    per = float(parts[4]) if len(parts) > 4 and parts[4] else 11.0
    gama = float(parts[5]) if len(parts) > 5 and parts[5] else 1.0   # < 1 clareia os meios-tons (foto escura)
    nome = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path).convert("RGB")
    W, H = im.size
    cw = min(W, round(H * ar)); ch = min(H, round(cw / ar)); x0 = int(min(max(cx * W - cw / 2, 0), W - cw)); y0 = int((H - ch) * .35)
    im = im.crop((x0, y0, x0 + cw, y0 + ch))
    if modo is None:   # foto colorida ou P&B?
        a = np.asarray(im.resize((200, round(200 * ch / cw)))).astype(np.float32); modo = "cor" if np.mean(np.std(a, axis=2)) > 9 else "pb"
    w2 = OUTW * SS; h2 = round(w2 * ch / cw)
    big = im.resize((w2, h2), Image.LANCZOS)
    g = np.asarray(ImageOps.autocontrast(ImageOps.grayscale(big), cutoff=1).filter(ImageFilter.GaussianBlur(per * SS * .18))).astype(np.float32) / 255.0
    g = g ** gama
    T = tela(h2, w2, per * SS, 45)
    tinta = (g < T * .96 + .02).astype(np.float32)          # 1 = ponto de tinta (maior onde é escuro)
    if modo == "pb":
        out = PAPEL * (1 - tinta[..., None]) + TINTA * tinta[..., None]
    else:
        rgb = np.asarray(ImageEnhance.Color(ImageOps.autocontrast(big, cutoff=1)).enhance(1.25)).astype(np.float32)
        cor = np.clip(rgb * .78, 0, 255)                      # a tinta é a cor da foto, um pouco mais escura
        base = PAPEL * .55 + rgb * .45                         # papel levemente tingido (a foto continua legível de longe)
        out = base * (1 - tinta[..., None]) + cor * tinta[..., None]
    # força do meio-tom (env FORCA, 0..1): mistura a retícula com a foto tonalizada; 1 = só pontos (forte), ~.25 = textura leve (pedido 17/10)
    F = float(os.environ.get("FORCA", "1"))
    if F < 1:
        g0 = np.asarray(ImageOps.autocontrast(ImageOps.grayscale(big), cutoff=1)).astype(np.float32) / 255.0
        if modo == "pb":
            g0 = g0 ** gama; tom = PAPEL * g0[..., None] + TINTA * (1 - g0[..., None])
        else:
            tom = np.asarray(ImageEnhance.Color(ImageOps.autocontrast(big, cutoff=1)).enhance(1.1)).astype(np.float32)
        out = tom * (1 - F) + out * F
    res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).resize((OUTW, round(OUTW * ch / cw)), Image.LANCZOS)
    dst = os.path.join(P, "render", "assets", f"print_{nome}.jpg")
    res.save(dst, quality=92)
    tiles.append(res.resize((300, round(300 * res.height / res.width))))
    print(f"print_{nome}", res.size, modo)
if tiles:
    Wt = sum(t.width + 8 for t in tiles); Ht = max(t.height for t in tiles)
    sh = Image.new("RGB", (Wt, Ht), (110, 110, 110)); x = 0
    for t in tiles: sh.paste(t, (x, 0)); x += t.width + 8
    os.makedirs(os.path.join(P, "out"), exist_ok=True); sh.save(os.path.join(P, "out", "meio_tom_check.jpg"), quality=85)
    subprocess.run([sys.executable, os.path.join(P, "make_assets.py")], cwd=P)
