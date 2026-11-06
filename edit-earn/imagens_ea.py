"""Imagens do formato edit-earn (a cor de cada mundo vem do CSS do componente; aqui só tamanho, P&B e camadas).

uso (Python do kit): python imagens_ea.py <projeto> ARQ:modo[:nome] [...]
  modo  foto     foto que cobre a tela com folga para a câmera andar, com contraste local + vibrance (VIVO=0 desliga) -> f_<nome>.jpg
        pb       a mesma, em P&B de arquivo (contraste alto) -> f_<nome>.jpg (para parede de fotos e matérias)
        logo     logo/PNG com transparência -> lg_<nome>.png (até 1200 px)
        camadas  separa PERSONAGEM e FUNDO da MESMA foto (é assim que a referência faz: o recorte entra da câmera sobre o próprio
                 fundo, que fica desfocado): BiRefNet (matting de pessoa) + LaMa no buraco ->
                 f_<nome>_fundo.jpg (fundo preenchido) e f_<nome>_obj.webp (só o personagem, recortado na caixa dele;
                 o assets.js guarda ox, oy, W0, H0 para o mundo() alinhar sozinho com o fundo: camada {fonte, alinha: true})
                 Abra out/camadas_<nome>.jpg e confira o recorte (cabelo, mãos, ombros). Recorte ruim = use a foto inteira.
        Variáveis: LIMIAR=.5 (corte da máscara), OBJETO=1 (máscara de objeto, borda firme, em vez de pessoa)
Ex.: python imagens_ea.py teste_earn fotos/sel/mansur_rua.jpg:camadas:mansur fotos/sel/mappin_rua.jpg:foto fotos/sel/mesbla.jpg:pb
Dica (Git Bash): export MSYS_NO_PATHCONV=1 antes, senão "a:b:c" vira lista de caminhos.
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageFilter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")   # em outro PC: variável VOX_KIT = pasta do kit
a = sys.argv[1:]
if len(a) < 2:
    sys.exit(__doc__)
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
OUT = os.path.join(P, "render", "assets"); os.makedirs(OUT, exist_ok=True)
AJS = os.path.join(P, "render", "assets.js")
LADO = 2600            # maior lado das fotos de tela cheia: cobre 1080x1920 com folga para zoom até ~1,4x


def assets_js(novos):
    D0 = {}
    if os.path.exists(AJS):
        mm = re.search(r"window\.ASSETS\s*=\s*(\{.*\})\s*;", open(AJS, encoding="utf-8").read(), re.S)
        D0 = json.loads(mm.group(1)) if mm else {}
    D0.update(novos)
    open(AJS, "w", encoding="utf-8").write("window.ASSETS = " + json.dumps(D0, ensure_ascii=False) + ";\n")


def no_tamanho(img):
    """cobre a tela: a altura do recorte 9:16 tem de passar de ~2300 px; aumenta (com nitidez leve) se a foto for pequena"""
    w, h = img.size
    alvo = max(2300 / h, 2300 * 9 / 16 / w, 1.0) if min(w, h) < 2300 else 1.0
    k = min(alvo, LADO / max(w, h)) if max(w, h) * alvo > LADO else alvo
    if k > 1.01:
        img = img.resize((round(w * k), round(h * k)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
    elif max(w, h) > LADO:
        k = LADO / max(w, h); img = img.resize((round(w * k), round(h * k)), Image.LANCZOS)
    return img


def vivo(img):
    """v2 (Felipe: "as cores saltam aos olhos"): contraste local (CLAHE no L do Lab), vibrance (satura mais o que é pouco saturado)
    e nitidez leve. Foto de arquivo apagada ganha o "brilho" das imagens da referência. VIVO=0 desliga; VIVO=1.5 força mais."""
    import cv2
    f = float(os.environ.get("VIVO", "1"))
    if f <= 0:
        return img
    a = np.asarray(img.convert("RGB"))
    lab = cv2.cvtColor(a, cv2.COLOR_RGB2LAB)
    L = cv2.createCLAHE(clipLimit=1.6 + .8 * f, tileGridSize=(8, 8)).apply(lab[..., 0])
    lab[..., 0] = np.clip(lab[..., 0] * (1 - .55 * min(f, 1)) + L * (.55 * min(f, 1)), 0, 255).astype(np.uint8)
    hsv = cv2.cvtColor(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB), cv2.COLOR_RGB2HSV).astype(np.float32)
    s_ = hsv[..., 1] / 255
    hsv[..., 1] = np.clip(255 * (s_ + .28 * f * s_ * (1 - s_) * 2), 0, 255)
    out = Image.fromarray(cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB))
    return out.filter(ImageFilter.UnsharpMask(2, int(40 * f), 2))


def pb(img):
    g = np.asarray(img.convert("L"), np.float32) / 255
    lo, hi = np.percentile(g, 1.5), np.percentile(g, 98.5)
    g = np.clip((g - lo) / max(hi - lo, 1e-3), 0, 1)
    g = g ** .92
    g = .5 + (g - .5) * 1.12
    return Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8)).convert("RGB")


# ---------- camadas: personagem + fundo preenchido (LaMa) ----------
LAMA = None


def lama(im, buraco):
    """LaMa num recorte quadrado em volta do buraco, colado de volta só dentro do buraco (como o camadas3d do edit-parallax3d)"""
    global LAMA
    import cv2, onnxruntime as ort
    H, W = buraco.shape
    if buraco.sum() < 50:
        return im
    if LAMA is None:
        so = ort.SessionOptions(); so.intra_op_num_threads = max(2, (os.cpu_count() or 4) // 2)
        LAMA = ort.InferenceSession(os.path.join(KIT, "modelos", "lama_fp32.onnx"), so, providers=["CPUExecutionProvider"])
    ys, xs = np.nonzero(buraco)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    lado = int(max(y1 - y0, x1 - x0) * 1.35) + 64
    lado = min(max(lado, 512), max(W, H))
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    X0 = int(np.clip(cx - lado // 2, 0, max(0, W - lado))); Y0 = int(np.clip(cy - lado // 2, 0, max(0, H - lado)))
    X1, Y1 = min(W, X0 + lado), min(H, Y0 + lado)
    crop, mc = im[Y0:Y1, X0:X1], buraco[Y0:Y1, X0:X1]
    ci = cv2.resize(crop, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255
    mi = (cv2.resize(mc.astype(np.uint8), (512, 512), interpolation=cv2.INTER_NEAREST) > 0).astype(np.float32)
    out = LAMA.run(None, {"image": ci.transpose(2, 0, 1)[None], "mask": mi[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5:
        out = out * 255
    out = cv2.resize(np.clip(out, 0, 255).astype(np.uint8), (X1 - X0, Y1 - Y0), interpolation=cv2.INTER_CUBIC)
    al = cv2.GaussianBlur(cv2.dilate(mc.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 3)[..., None]
    r = im.copy()
    r[Y0:Y1, X0:X1] = (crop * (1 - al) + out * al).astype(np.uint8)
    return r


def camadas(img, nome):
    import cv2
    sys.path.insert(0, os.path.join(KIT, "ferramentas"))
    from recorte_hq import mascara
    m = mascara(img, pessoa=os.environ.get("OBJETO") != "1")
    if m is None:
        sys.exit("camadas precisa do BiRefNet (ambiente .venv_ia do kit)")
    al = np.asarray(m, np.float32) / 255
    W0, H0 = img.size
    obj = al > float(os.environ.get("LIMIAR", ".5"))
    n, lab, st, _ = cv2.connectedComponentsWithStats(obj.astype(np.uint8), 8)
    if n > 1:                                                     # fica só o maior pedaço (o personagem)
        k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA])); obj = lab == k
        al = al * cv2.dilate((lab == k).astype(np.uint8), np.ones((15, 15), np.uint8))
    rgb = np.asarray(vivo(img.convert("RGB")))
    buraco = cv2.dilate(obj.astype(np.uint8), np.ones((max(9, W0 // 120),) * 2, np.uint8)) > 0
    fundo = lama(rgb, buraco)
    ys, xs = np.nonzero(al > .02)
    pad = 6
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(H0, ys.max() + pad), max(0, xs.min() - pad), min(W0, xs.max() + pad)
    rgba = np.dstack([rgb, (al * 255).astype(np.uint8)])[y0:y1, x0:x1]
    Image.fromarray(fundo).save(os.path.join(OUT, f"f_{nome}_fundo.jpg"), quality=92)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"f_{nome}_obj.webp"), quality=94, method=4)
    novos = {f"f_{nome}_fundo": {"src": f"assets/f_{nome}_fundo.jpg", "w": W0, "h": H0},
             f"f_{nome}_obj": {"src": f"assets/f_{nome}_obj.webp", "w": int(x1 - x0), "h": int(y1 - y0), "ox": int(x0), "oy": int(y0), "W0": W0, "H0": H0}}
    # folha: foto | fundo preenchido | recorte sobre cinza
    th = 520; tw = round(W0 * th / H0)
    fol = Image.new("RGB", (tw * 3 + 20, th), (30, 30, 30))
    fol.paste(img.convert("RGB").resize((tw, th)), (0, 0)); fol.paste(Image.fromarray(fundo).resize((tw, th)), (tw + 10, 0))
    cz = Image.new("RGB", (W0, H0), (128, 128, 128)); cz.paste(Image.fromarray(rgb), (0, 0), Image.fromarray((al * 255).astype(np.uint8)))
    fol.paste(cz.resize((tw, th)), (2 * tw + 20, 0))
    os.makedirs(os.path.join(P, "out"), exist_ok=True); fol.save(os.path.join(P, "out", f"camadas_{nome}.jpg"), quality=88)
    return novos


novos = {}
for spec in a[1:]:
    partes = spec.split(":")
    if len(partes) >= 2 and len(partes[0]) == 1 and partes[1].startswith(("/", "\\")):   # C:/... virou ["C", "/..."]
        partes = [partes[0] + ":" + partes[1]] + partes[2:]
    arq, modo = partes[0], partes[1] if len(partes) > 1 else "foto"
    arq = arq if os.path.isabs(arq) else os.path.join(P, arq)
    nome = partes[2] if len(partes) > 2 else os.path.splitext(os.path.basename(arq))[0]
    img = Image.open(arq)
    if modo in ("foto", "pb"):
        im = no_tamanho(img.convert("RGB"))
        im = pb(im) if modo == "pb" else vivo(im)
        im.save(os.path.join(OUT, f"f_{nome}.jpg"), quality=92)
        novos[f"f_{nome}"] = {"src": f"assets/f_{nome}.jpg", "w": im.width, "h": im.height}
        print(f"f_{nome}: {im.width}x{im.height} ({modo})")
    elif modo == "logo":
        im = img.convert("RGBA")
        if max(im.size) > 1200: k = 1200 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im.save(os.path.join(OUT, f"lg_{nome}.png"))
        novos[f"lg_{nome}"] = {"src": f"assets/lg_{nome}.png", "w": im.width, "h": im.height}
        print(f"lg_{nome}: {im.width}x{im.height}")
    elif modo == "camadas":
        im = img.convert("RGB")
        if max(im.size) < 1800:                       # foto pequena (quadro de TV): aumenta antes do recorte para a borda sair limpa
            k = 1800 / max(im.size); im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 50, 2))
        novos.update(camadas(im, nome))
        print(f"f_{nome}_fundo + f_{nome}_obj (veja out/camadas_{nome}.jpg)")
    else:
        sys.exit(f"modo desconhecido: {modo}")
assets_js(novos)
