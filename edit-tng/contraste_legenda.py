"""Contraste da legenda (edit-tng): em cada plano de vídeo/foto, mede o brilho da imagem ATRÁS da legenda branca (a legenda é
escondida para medir) e aponta onde ela some. Sugere o `filtro` do plano (ex.: {filtro: 'brightness(.72)'}).

uso (Python do kit): python contraste_legenda.py <projeto> [--lim 150] [--em .35]
  --lim  luma média (0–255) da faixa da legenda acima da qual a legenda branca fica fraca (padrão 150)
  TNG_SUJEITO=lisa  prefixo dos clipes do personagem: nele a sugestão é capForte (sombra forte), não escurecer o rosto
Mede na faixa da frase (caixa real das palavras do bloco, alargada 30 px), no meio do plano. Cartões e prints não entram
(legenda preta no branco e branca no vermelho já são o padrão).
"""
import asyncio, os, sys
from pathlib import Path
from io import BytesIO
import numpy as np
from PIL import Image
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
arg = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
LIM, EM = float(arg("--lim", 150)), float(arg("--em", .35))

CAIXA = """(() => { const c = document.getElementById('cap'); if (+getComputedStyle(c).opacity === 0) return null;
  const sp = [...c.querySelectorAll('span')]; if (!sp.length) return null;
  const r = sp.map(s => s.getBoundingClientRect()), x0 = Math.min(...r.map(q => q.left)), x1 = Math.max(...r.map(q => q.right));
  const y0 = Math.min(...r.map(q => q.top)), y1 = Math.max(...r.map(q => q.bottom));
  return [x0, y0, x1, y1, sp.map(s => s.textContent).join(' ')]; })()"""


async def mede():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--disable-gpu", "--force-color-profile=srgb"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        await pg.goto(Path(P, "render", "index.html").as_uri())
        for _ in range(2400):
            if await pg.evaluate("window.READY === true || !!window.READY_ERR"):
                break
            await asyncio.sleep(.05)
        L = await pg.evaluate("TNG_PLANOS.map((p, i) => ({i, t: p.t, fim: p.fim ?? TIMING.videoDur, quando: p.quando, tipo: p.tipo, "
                              "fonte: Array.isArray(p.fonte) ? 'montagem' : p.fonte, filtro: p.op.filtro || '', forte: !!p.op.capForte, semLeg: !!p.semLeg}))")
        out = []
        for x in L:
            if x["tipo"] not in ("clip", "foto", "montagem", "dividida") or x["semLeg"]:
                continue
            t = int((x["t"] + max(1 / 12, (x["fim"] - x["t"]) * EM)) * 12 + 1e-6) / 12
            await pg.evaluate(f"render({t})")
            cx = await pg.evaluate(CAIXA)
            if not cx:
                continue
            await pg.evaluate("document.getElementById('cap').style.visibility = 'hidden'")
            im = np.asarray(Image.open(BytesIO(await pg.screenshot(type="png"))).convert("L"), np.float32)
            await pg.evaluate("document.getElementById('cap').style.visibility = ''")
            x0, y0, x1, y1 = [int(round(v)) for v in cx[:4]]
            reg = im[max(0, y0 - 10):min(1920, y1 + 10), max(0, x0 - 30):min(1080, x1 + 30)]
            out.append((x, t, float(reg.mean()), float((reg > 200).mean()), cx[4]))
        await b.close()
        return out


R = asyncio.run(mede())
fraca = lambda m, cl: m > LIM or cl > .5
ruins = [r for r in R if fraca(r[2], r[3]) and not r[0]['forte']]          # capForte (sombra forte) já resolve o fundo claro
for x, t, m, cl, txt in ruins:
    k = max(.55, min(.9, (LIM - 25) / max(m, 1)))
    suj = os.environ.get('TNG_SUJEITO') and (':' + os.environ['TNG_SUJEITO']) in x['fonte']
    sug = "{capForte: true}  (personagem: não escureça o rosto)" if suj else f"{{filtro: 'brightness({k:.2f})'}}"
    print(f"FRACA  P{x['i'] + 1:<3} {x['t']:6.2f}s {x['quando']:<16} {x['fonte']:<22} luma média {m:5.1f}, {cl:4.0%} acima de 200  '{txt}'"
          f"  -> {sug}" + (f" (já tem {x['filtro']})" if x['filtro'] else ''))
print(f"{len(R)} planos de imagem com legenda; {len(ruins)} com legenda branca fraca (luma média > {LIM:.0f} ou > 50% da faixa acima de 200)")
