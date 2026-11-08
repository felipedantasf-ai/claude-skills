"""(edit-avancada) Mede quanto a câmera de um clipe real se mexe (panorâmica/travelling), em janelas de 0,8 s.

uso (Python do kit): python movimento_clipe.py <projeto> <clipe> [<clipe> ...]     (clipes em render/clips/<nome>/*.jpg)
       ou            python movimento_clipe.py <pasta_de_quadros> [...]

Antes de pôr um clipe real numa cena, confira o trecho que vai usar. A régua medir_leitura reprova a janela com mais de 10% dos quadros
em panorâmica > 8 px/q, e um travelling de 1 s já estoura: na demo, a prateleira (45 px/q) deu 94% na cena e 13% na janela inteira.
Para mostrar o lugar, prefira um trecho com câmera parada ou zoom lento: escolha o 'from' pelas janelas com "> 8 px" perto de 0%.
O valor é o deslocamento global entre quadros (correlação de fase em 270x480, escala 1080; resolução de 4 px).
"""
import glob, os, sys
import numpy as np
from PIL import Image
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
if os.path.isdir(a[0]) and glob.glob(os.path.join(a[0], "*.jpg")):
    pastas = a
else:
    proj = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
    pastas = [os.path.join(proj, "render", "clips", n) for n in a[1:]]
JH, JW = np.hanning(480)[:, None], np.hanning(270)[None, :]


def cinza(f):
    x = np.asarray(Image.open(f).convert("L").resize((270, 480)), dtype=np.float32)
    return (x - x.mean()) * JH * JW


for pasta in pastas:
    fs = sorted(glob.glob(os.path.join(pasta, "*.jpg")))
    if len(fs) < 2:
        print(f"{pasta}: sem quadros"); continue
    ant, mv = cinza(fs[0]), [0.0]
    for f in fs[1:]:
        cur = cinza(f)
        F = np.fft.fft2(ant) * np.conj(np.fft.fft2(cur)); F /= np.abs(F) + 1e-6
        y, x = np.unravel_index(np.argmax(np.abs(np.fft.ifft2(F))), F.shape)
        y, x = (y - 480 if y > 240 else y), (x - 270 if x > 135 else x)
        mv.append(float(np.hypot(x, y)) * 4); ant = cur
    mv = np.array(mv)
    print(f"{os.path.basename(pasta)}: {len(fs)} quadros ({len(fs) / 30:.2f} s) | mediana {np.median(mv):.1f} px/q | > 8 px/q em {100 * np.mean(mv[1:] > 8):.0f}% dos quadros")
    for i in range(0, len(fs) - 24 + 1, 6):
        seg = mv[i + 1:i + 24]
        print(f"  from {i / 30:5.2f} s (até {(i + 24) / 30:5.2f})  mediana {np.median(seg):5.1f} px/q   > 8 px {100 * np.mean(seg > 8):5.1f}%")
