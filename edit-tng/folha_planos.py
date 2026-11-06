"""Folha de prévias por PLANO (edit-tng): um quadro de cada plano tng(), com a fonte, o tempo e a legenda que está na tela
-> out/pv/planos_01.jpg, planos_02.jpg ... (é a folha que se olha antes do render e na revisão).

uso (Python do kit): python folha_planos.py <projeto> [--de T0] [--ate T1] [--por 10] [--larg 216] [--em .35]
  --em    onde, dentro de cada plano, tirar o quadro (fração da duração; padrão .35 = depois da 1ª palavra acender)
Abre render/index.html no Chromium (mesmo motor do render), então mostra exatamente o que vai sair (12 imagens/s).
"""
import asyncio, os, sys
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
a = sys.argv[1:]
if not a:
    sys.exit(__doc__)
arg = lambda k, d=None: a[a.index(k) + 1] if k in a else d
P = a[0] if os.path.isabs(a[0]) else os.path.join(KIT, "projetos", a[0])
DE, ATE = float(arg("--de", 0)), float(arg("--ate", 1e9))
POR, LW, EM = int(arg("--por", 10)), int(arg("--larg", 216)), float(arg("--em", .35))
LH = LW * 16 // 9


async def quadros():
    from playwright.async_api import async_playwright
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--disable-gpu", "--force-color-profile=srgb"])
        pg = await b.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
        await pg.goto(Path(P, "render", "index.html").as_uri())
        for _ in range(2400):
            if await pg.evaluate("window.READY === true || !!window.READY_ERR"):
                break
            await asyncio.sleep(.05)
        L = await pg.evaluate("""TNG_PLANOS.map((p, i) => ({i, t: p.t, fim: p.fim ?? TIMING.videoDur, quando: p.quando,
                                   fonte: Array.isArray(p.fonte) ? 'montagem (' + p.fonte.length + ')' : p.fonte}))""")
        out = []
        for x in L:
            if x["t"] < DE or x["t"] > ATE:
                continue
            t = x["t"] + max(1 / 12, (x["fim"] - x["t"]) * EM)
            t = int(t * 12 + 1e-6) / 12
            await pg.evaluate(f"render({t})")
            cap = await pg.evaluate("(() => { const c = document.getElementById('cap'); return +getComputedStyle(c).opacity > 0 ? "
                                    "[...c.querySelectorAll('span')].map(s => s.style.visibility === 'hidden' ? '·' : s.textContent).join(' ') : ''; })()")
            img = Image.open(BytesIO(await pg.screenshot(type="jpeg", quality=82))).convert("RGB").resize((LW, LH), Image.LANCZOS)
            out.append((x, t, cap, img))
        await b.close()
        return out


Q = asyncio.run(quadros())
os.makedirs(os.path.join(P, "out", "pv"), exist_ok=True)
try:
    F = ImageFont.truetype("arial.ttf", 12); FB = ImageFont.truetype("arialbd.ttf", 12)
except Exception:
    F = FB = ImageFont.load_default()
LIN = 4
for k in range(0, len(Q), POR * LIN):
    parte = Q[k:k + POR * LIN]
    rows = (len(parte) + POR - 1) // POR
    folha = Image.new("RGB", (POR * (LW + 4), rows * (LH + 44)), (18, 18, 18))
    d = ImageDraw.Draw(folha)
    for j, (x, t, cap, img) in enumerate(parte):
        r, c = divmod(j, POR)
        x0, y0 = c * (LW + 4), r * (LH + 44)
        folha.paste(img, (x0, y0))
        d.text((x0 + 3, y0 + LH + 2), f"P{x['i'] + 1} {x['t']:.2f}s {x['quando']}", fill=(255, 214, 10), font=FB)
        d.text((x0 + 3, y0 + LH + 16), str(x["fonte"])[:34], fill=(220, 220, 220), font=F)
        d.text((x0 + 3, y0 + LH + 29), cap[:36], fill=(150, 200, 255), font=F)
    fn = os.path.join(P, "out", "pv", f"planos_{k // (POR * LIN) + 1:02d}.jpg")
    folha.save(fn, quality=88)
    print(fn, len(parte), "planos")
