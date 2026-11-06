"""Trechos de vídeo do formato edit-founded: trechos de vídeo -> render/clips/<nome>/0001.jpg... (30 fps), já no enquadramento 9:16.

uso (Python do kit): python clipes.py <projeto> LISTA.txt [-j 4] [--so nome1,nome2] [--forcar]
LISTA.txt, uma linha por clipe:   nome  arquivo  início  duração  [fx]  [area=w,h,x,y | full]  [ganho=1.1]  [largo]
  arquivo  caminho do vídeo (relativo ao projeto: ex. clipes/hd/fabrica_12.mp4, baixado com ferramentas/baixar_trechos.py)
  fx       centro horizontal do recorte 9:16 (0..1, padrão .5) — ponha o assunto INTEIRO no quadro
  area     corte manual antes do 9:16 (tira logo de emissora, legenda queimada, tarja); full = sem cropdetect
  ganho    >1 clareia (gama) cenas escuras demais — prefira escolher outro trecho
  largo    não corta para 9:16: guarda 1080 de largura (faixa 16:9 para usar dentro de cartão/janela)
  # = comentário
Escreve render/clipn.js (quadros por clipe, lido pelo clipe()) e imprime cortes de plano escondidos em cada trecho
(use só trechos contínuos: clipe(..., {from}) começa onde você mandar).
"""
import json, os, re, shutil, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
LISTA = a[1] if os.path.isabs(a[1]) else os.path.join(P, a[1])
J = int(a[a.index("-j") + 1]) if "-j" in a else 4
SO = set(a[a.index("--so") + 1].split(",")) if "--so" in a else None
CLIPS = os.path.join(P, "render", "clips")
os.makedirs(CLIPS, exist_ok=True)
JUNCAO = os.path.normcase(os.path.realpath(CLIPS)) != os.path.normcase(os.path.abspath(CLIPS))


def le_lista():
    out = []
    for ln in open(LISTA, encoding="utf-8"):
        ln = ln.split("#")[0].strip()
        if not ln:
            continue
        p = ln.split()
        nome, arq, ss, dur = p[0], p[1], float(p[2]), float(p[3])
        op = {"fx": .5, "area": None, "ganho": 1.0, "largo": False}
        for x in p[4:]:
            if x.startswith("area="):
                v = x[5:]
                op["area"] = "full" if v == "full" else tuple(int(float(q)) for q in v.split(","))
            elif x.startswith("ganho="):
                op["ganho"] = float(x[6:])
            elif x == "largo":
                op["largo"] = True
            else:
                op["fx"] = float(x)
        out.append((nome, arq, ss, dur, op))
    return out


def extrai(item):
    nome, arq, ss, dur, op = item
    src = arq if os.path.isabs(arq) else os.path.join(P, arq)
    if not os.path.exists(src):
        return f"{nome:16s} FALTA {src}"
    W, H = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                             "-of", "csv=p=0:s=x", src], text=True).split()[0].strip("x").split("x")[:2])
    area = op["area"]
    if area == "full":
        cw, ch, cx0, cy0 = W, H, 0, 0
    elif area:
        cw, ch, cx0, cy0 = area
    else:
        cd = subprocess.run(["ffmpeg", "-ss", str(ss), "-t", str(min(dur, 3)), "-i", src, "-vf", "cropdetect=24:2:0", "-f", "null", "-"],
                            capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
        m = re.findall(r"crop=(\d+):(\d+):(\d+):(\d+)", cd)
        cw, ch, cx0, cy0 = map(int, m[-1]) if m else (W, H, 0, 0)
        if cw < W * .5 or ch < H * .5:
            cw, ch, cx0, cy0 = W, H, 0, 0
    g = op["ganho"]
    eq = f",eq=gamma={g:.2f}:contrast={1 + .1 * (g - 1):.3f}" if g != 1 else ""
    if op["largo"]:
        vf = f"fps=30,crop={cw}:{ch}:{cx0}:{cy0},scale=1080:-2:flags=lanczos,unsharp=5:5:0.5:5:5:0{eq}"
        rec = f"{cw}x{ch} (largo)"
    else:
        vw = min(cw, int(round(ch * 9 / 16 / 2)) * 2)
        x0 = int(min(max(cx0, cx0 + op["fx"] * cw - vw / 2), cx0 + cw - vw))
        vf = f"fps=30,crop={vw}:{ch}:{x0}:{cy0},scale=1080:1920:flags=lanczos,unsharp=5:5:0.5:5:5:0{eq}"
        rec = f"{vw}x{ch} x={x0}" + ("  AVISO: fonte baixa, ampliação >2,5x (use largo/cartão)" if ch < 1920 / 2.5 else "")
    out = os.path.join(CLIPS, nome)
    if JUNCAO and os.path.exists(out) and "--forcar" not in a:          # render/clips aponta para outro projeto: não apaga o dele
        return f"{nome:16s} PULADO: render/clips é junção para {os.path.realpath(CLIPS)} e o clipe já existe lá (use outro nome ou --forcar)"
    shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", src, "-vf", vf, "-q:v", "3",
                    os.path.join(out, "%04d.jpg")], check=True)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(out, "%04d.jpg"), "-vf", "scale=54:96,format=gray", "-f", "rawvideo", "-"],
                         capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 96, 54).astype(np.float32)
    d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2)) if len(fr) > 1 else np.zeros(1)
    cortes = [round((i + 1) / 30, 2) for i, v in enumerate(d) if v > max(25, 6 * np.median(d) + 8)]
    return f"{nome:16s} {W}x{H} área {cw}x{ch}+{cx0}+{cy0} -> {rec} | {len(fr)} quadros | cortes (s): {cortes or 'nenhum'}"


itens = [x for x in le_lista() if not SO or x[0] in SO]
with ThreadPoolExecutor(J) as ex:
    for linha in ex.map(extrai, itens):
        print(linha, flush=True)
n = {c: len([f for f in os.listdir(os.path.join(CLIPS, c)) if f.endswith(".jpg")]) for c in sorted(os.listdir(CLIPS)) if os.path.isdir(os.path.join(CLIPS, c))}
open(os.path.join(P, "render", "clipn.js"), "w", encoding="utf-8").write("window.CLIPN = " + json.dumps(n) + ";\n")
print(f"render/clipn.js: {len(n)} clipes")
