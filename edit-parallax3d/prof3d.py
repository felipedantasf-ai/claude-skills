"""(edit-parallax3d, modo WebGL) Profundidade por camada para o relevo 3D das fotos.

uso (Python do kit):  .venv\\Scripts\\python.exe prof3d.py <projeto> [nome ...]     (sem nome = todas as fotos p3_* do assets.js)
O camadas3d.py já chama isto no fim; rode à mão só em projeto antigo.

Para cada camada i de p3_<nome> grava render/assets/p3_<nome>_d<i>.png (1024 px de largura, 16 bits em R = alto, G = baixo;
1 = perto) e põe em assets.js, na entrada p3_<nome>:
  dref = profundidade típica (mediana) de cada camada -> o relevo é medido a partir dela (a camada fica no seu zs);
  pg   = grade 48 px de largura (uint8 em base64), para o JS saber a profundidade de um ponto (tela() e mira()).
Camada i: onde as camadas da frente cobrem, a profundidade é preenchida pelo entorno (senão o fundo "incha" com o formato
do carro); na borda da própria camada vale o valor mais perto (o contorno não estica para trás).
"""
import base64, glob, json, os, re, sys
import numpy as np, cv2
from PIL import Image
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
LARG, GRADE = 1024, 48


def le_assets(ajs):
    if not os.path.exists(ajs):
        return {}
    m = re.search(r"window\.ASSETS\s*=\s*(\{.*\})\s*;", open(ajs, encoding="utf-8").read(), re.S)
    return json.loads(m.group(1)) if m else {}


def faz(proj, nome, D=None, A=None):
    """D = profundidade float (H, W) 0..1 (1 = perto), opcional; A = dicionário do assets.js (é atualizado). Devolve a entrada."""
    adir = os.path.join(proj, "render", "assets")
    cams = []
    for i in range(8):
        f = [p for p in (os.path.join(adir, f"p3_{nome}_{i}.jpg"), os.path.join(adir, f"p3_{nome}_{i}.webp")) if os.path.exists(p)]
        if not f:
            break
        cams.append(f[0])
    if not cams:
        raise SystemExit(f"{nome}: sem camadas p3_{nome}_N em {adir} (rode camadas3d.py)")
    if D is None:
        D = np.asarray(Image.open(os.path.join(adir, f"p3_{nome}_prof.png")).convert("L"), np.float32) / 255
    H, W = D.shape
    h = round(H * LARG / W)
    D = cv2.resize(cv2.GaussianBlur(D.astype(np.float32), (0, 0), 2.0), (LARG, h), interpolation=cv2.INTER_AREA)
    al = [np.ones((h, LARG), np.float32)]
    for f in cams[1:]:
        a = np.asarray(Image.open(f).convert("RGBA"), np.float32)[..., 3] / 255
        al.append(cv2.resize(a, (LARG, h), interpolation=cv2.INTER_AREA))
    dref, pg = [], []
    gh = max(2, round(h * GRADE / LARG))
    for i in range(len(cams)):
        d = D.copy()
        frente = np.zeros_like(d)
        for j in range(i + 1, len(cams)):
            frente = np.maximum(frente, al[j])
        m = (frente > .2).astype(np.uint8)
        if m.any():
            m = cv2.dilate(m, np.ones((9, 9), np.uint8))
            s = 4
            dd = cv2.resize(d, (LARG // s, h // s), interpolation=cv2.INTER_AREA)
            mm = cv2.resize(m, (LARG // s, h // s), interpolation=cv2.INTER_NEAREST)
            f8 = cv2.inpaint((dd * 255).astype(np.uint8), mm, 12, cv2.INPAINT_TELEA).astype(np.float32) / 255
            f8 = cv2.GaussianBlur(cv2.resize(f8, (LARG, h), interpolation=cv2.INTER_CUBIC), (0, 0), 6)
            d = np.where(m > 0, f8, d)
        if i > 0:
            mi = (al[i] > .05).astype(np.uint8)
            k = np.ones((11, 11), np.uint8)
            d = np.where((cv2.dilate(mi, k) - cv2.erode(mi, k)) > 0, cv2.dilate(d, k), d)
        d = np.clip(d, 0, 1)
        q = (d * 65535).astype(np.uint16)
        Image.fromarray(np.dstack([(q >> 8).astype(np.uint8), (q & 255).astype(np.uint8), np.zeros_like(q, np.uint8)])).save(
            os.path.join(adir, f"p3_{nome}_d{i}.png"))
        vis = al[i] > .5
        dref.append(round(float(np.median(d[vis] if vis.any() else d)), 4))
        g = cv2.resize(d, (GRADE, gh), interpolation=cv2.INTER_AREA)
        pg.append(base64.b64encode((g * 255).round().astype(np.uint8).tobytes()).decode())
    ajs = os.path.join(proj, "render", "assets.js")
    salva = A is None
    if A is None:
        A = le_assets(ajs)
    e = A.get(f"p3_{nome}") or {"src": f"assets/{os.path.basename(cams[0])}", "w": W, "h": H, "camadas": len(cams)}
    e.update({"dref": dref, "pg": {"w": GRADE, "h": gh, "d": pg}})
    A[f"p3_{nome}"] = e
    if salva:
        open(ajs, "w", encoding="utf-8").write("window.ASSETS = " + json.dumps(A, ensure_ascii=False) + ";\n")
    return e


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
    ajs = os.path.join(P, "render", "assets.js")
    A = le_assets(ajs)
    nomes = a[1:] or sorted({re.match(r"p3_(.+)_prof\.png$", os.path.basename(f)).group(1)
                             for f in glob.glob(os.path.join(P, "render", "assets", "p3_*_prof.png"))})
    for n in nomes:
        e = faz(P, n, A=A)
        print(f"{n}: {len(e['dref'])} camadas, dref {e['dref']}")
    open(ajs, "w", encoding="utf-8").write("window.ASSETS = " + json.dumps(A, ensure_ascii=False) + ";\n")
