"""Som do formato edit-earn (v2, 31/10/2026), sintetizado aqui (nada de gravação de terceiros), no molde medido na referência.

Medido na referência (Demucs htdemucs + dissect): a música NÃO é um drone discreto. É uma cama escura de trap documental bem presente,
a −23 dBFS entre as palavras, só ~4,4 dB abaixo da voz (a v1 ficava ~19 dB abaixo e o Felipe achou a trilha fraca). Camadas:
- PULSO grave contínuo (40–150 Hz), golpe tipo batimento; na referência vira um pulso regular de ~118 BPM na virada (27,5–35,7 s);
- 808 SATURADO (Ré1/Dó#1 ~36 Hz, harmônicos até ~1 kHz, por isso se ouve no celular), sustentado 2–3 s, entrando seco no gancho e nas
  viradas fortes (na referência: 0,0 · 11,6 · 32,4 s), com um respiro de silêncio do pulso logo antes;
- PAD escuro em 150–900 Hz o tempo todo;
- RISER antes das viradas de mundo, IMPACTO em camadas nelas, WHOOSH com pan em todo corte, GOLPE nos punch-ins;
- tique de relógio bem baixo na metade final (tensão) e BATIDA de ~81 BPM só no CTA.
Lê render/timing.js, out/events.json ('eaCorte' {boom, tr}, 'eaDrop', 'eaHit', 'eaBoom', 'eaBatida') e trilha.json (opcional).
Voz e efeitos das cenas vêm do mix.py (audio/voice.wav, audio/sfx_bus.wav). Saída: audio/final_mix_ea.wav (-14 LUFS).

uso:  python <skill>/trilha_earn.py [--sem-musica]      (de dentro da pasta do projeto; o pipeline.py fechar chama sozinho)
trilha.json (opcional, na raiz do projeto):
  {"bpm": 118, "cama": -5.5,      # dB RMS da cama (pad + pulso) em relação ao RMS da voz; a referência fica ~-4,4
   "drop": 1, "impacto": 1, "swish": -8, "riser": -6,   # dB de cada efeito em relação ao RMS da voz
   "meio_tempo": .45,             # até essa fração do vídeo o pulso bate a cada 2 tempos; depois, em todo tempo
   "drops": ["B12"], "hits": [["B20", "palavra"]], "batida": "B40", "sem_tique": false}
SEM_MUSICA=1 (ou --sem-musica) = só voz + efeitos de corte. SEM_SWISH=1 / SEM_BOOM=1 tiram os efeitos de corte.
"""
import json, os, subprocess, sys, unicodedata
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, lfilter, fftconvolve

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.getcwd()
J = lambda *p: os.path.join(ROOT, *p)
if not os.path.exists(J("render", "timing.js")):
    sys.exit("rode de dentro da pasta do projeto (falta render/timing.js)")
SEM = "--sem-musica" in sys.argv or os.environ.get("SEM_MUSICA") == "1"
SR = 48000
_tj = open(J("render", "timing.js"), encoding="utf-8").read()
TJ = json.loads(_tj[_tj.index("{"):_tj.rindex("}") + 1])
B = {b["id"]: b for b in TJ["beats"]}
CFG = json.load(open(J("trilha.json"), encoding="utf-8")) if os.path.exists(J("trilha.json")) else {}
EVJ = json.load(open(J("out", "events.json"), encoding="utf-8")) if os.path.exists(J("out", "events.json")) else {"events": []}
_n = lambda x: "".join(ch for ch in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(ch) != "Mn")


def Wt(bid, k=0):
    ws = B[bid]["words"]
    w = ws[min(k, len(ws) - 1)] if isinstance(k, int) else next((x for x in ws if _n(x["w"]).startswith(_n(k))), ws[0])
    return w["s"]


END = TJ["videoDur"]
N = int((END + 1.5) * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(11)
lp = lambda x, f, o=2: sosfilt(butter(o, f, "low", fs=SR, output="sos"), x, axis=0)
hp = lambda x, f, o=2: sosfilt(butter(o, f, "high", fs=SR, output="sos"), x, axis=0)
bp = lambda x, a, b, o=2: sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x, axis=0)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)


def mavg(a, n):
    c = np.cumsum(np.insert(np.asarray(a, np.float64), 0, 0.0)); y = (c[n:] - c[:-n]) / n; p = n // 2
    return np.concatenate([np.full(p, y[0]), y, np.full(len(a) - len(y) - p, y[-1])])


def kpond(x):
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x)
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], x)


def lufs(x, sel=None):
    k = kpond(x if x.ndim == 1 else x.mean(1))
    if sel is not None:
        k = k[sel[:len(k)]]
    return -0.691 + 10 * np.log10(np.mean(k ** 2) + 1e-12)


def poe(bus, x, t, g=1.0):
    """coloca o som x (mono ou estéreo) no tempo t do bus estéreo"""
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    i0 = int(round(t * SR))
    if i0 < 0:
        x, i0 = x[-i0:], 0
    m = min(len(x), N - i0)
    if m > 0:
        bus[i0:i0 + m] += x[:m] * g


ev = EVJ["events"]
cortes = sorted([(round(e["t"], 3), bool(e.get("boom")), e.get("tr", "cut")) for e in ev if e["type"] == "eaCorte"])
booms = sorted({round(t, 2) for t, b, _ in cortes if b} | {round(e["t"], 2) for e in ev if e["type"] == "eaBoom"})
drops = sorted({0.0} | {round(e["t"], 2) for e in ev if e["type"] == "eaDrop"} | {round(B[d]["start"], 2) for d in CFG.get("drops", []) if d in B})
hits = sorted({round(e["t"], 2) for e in ev if e["type"] == "eaHit"} | {round(Wt(h[0], h[1]) - .03, 2) for h in CFG.get("hits", []) if h[0] in B})
ondas = sorted({round(e["t"], 3) for e in ev if e["type"] == "eaOnda"})        # flash + onda dentro da cena (virada)
flashes = sorted({round(e["t"], 3) for e in ev if e["type"] == "eaFlash"})
swooshes = sorted({round(e["t"], 3) for e in ev if e["type"] == "eaSwoosh"})    # papel/jornal voando para a mesa
t_batida = B[CFG["batida"]]["start"] if CFG.get("batida") in B else next((e["t"] for e in ev if e["type"] == "eaBatida"), None)
fim_mus = (t_batida if t_batida is not None else END - .25)
BPM = float(CFG.get("bpm", 118)); BEAT = 60 / BPM

# ============================ instrumentos ============================
def kick(dur=.42, f0=112, f1=46, g=1.0):
    n = int(dur * SR); s = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-s * 34)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s * 8.5) * np.minimum(s / .002, 1)
    y += lp(rng.normal(0, 1, n), 2500) * np.exp(-s * 160) * .35                       # estalo do ataque
    return np.tanh(1.6 * y) / np.tanh(1.6) * g


def oito08(dur=2.8, nota=26):
    """808 saturado: nota grave com glide de ataque e harmônicos (tanh) que aparecem no celular"""
    n = int(dur * SR); s = np.arange(n) / SR
    f = hz(nota) * (1 + 1.0 * np.exp(-s * 60)) * (1 - .015 * np.minimum(s / dur, 1))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR)
    env = np.minimum(s / .004, 1) * (0.55 + .45 * np.exp(-s * 3)) * np.exp(-s * .55) * np.clip((dur - s) / .35, 0, 1)
    y = np.tanh(3.2 * y * env) / np.tanh(3.2)
    y = lp(y, 1100, 4) + lp(rng.normal(0, 1, n), 3000) * np.exp(-s * 120) * .25
    return y


def impacto(dur=1.9):
    n = int(dur * SR); s = np.arange(n) / SR
    f = 31 + 32 * np.exp(-s * 5)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(s / .006, 1) * np.exp(-s * 2.1)
    soco = lp(rng.normal(0, 1, n), 900) * np.exp(-s * 26) * .9 * np.minimum(s / .002, 1)
    estalo = hp(rng.normal(0, 1, n), 5000) * np.exp(-s * 90) * .35
    cauda = bp(rng.normal(0, 1, n), 80, 1400) * np.exp(-s * 2.3) * .18
    nuvem = bp(rng.normal(0, 1, n), 200, 900) * np.minimum(s / .02, 1) * np.exp(-s * 4.2) * .32
    cauda = cauda + nuvem
    L = np.tanh(1.4 * (sub + soco + estalo + cauda))
    R = np.tanh(1.4 * (sub + np.roll(soco, int(.004 * SR)) + estalo + np.roll(cauda, int(.013 * SR))))
    return np.stack([L, R], 1)


def whoosh(dur=.42, pico=.3, pan=(-0.8, .8)):
    """ar passando: ruído num passa-banda que sobe e desce (pico no corte) e atravessa o estéreo"""
    n = int(dur * SR); s = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    cen = 600 + 2900 * np.exp(-((s - pico) / (dur * .28)) ** 2)
    y = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        c = float(cen[min(i + blk // 2, n - 1)])
        y[i:i + blk] = bp(x[max(0, i - 2048):i + blk], c * .6, min(c * 1.6, 15000))[-min(blk, n - i):]
    env = np.exp(-((s - pico) / (dur * .3)) ** 2)
    y *= env
    pn = np.interp(s, [0, dur], pan); th = (pn + 1) * np.pi / 4
    return np.stack([y * np.cos(th), y * np.sin(th)], 1)


def riser(dur=1.0):
    n = int(dur * SR); s = np.arange(n) / SR
    u = s / dur
    ru = bp(rng.normal(0, 1, n), 300, 9000) * u ** 2.4
    f = 160 + 900 * u ** 2
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * u ** 3 * .5 * (1 + .3 * np.sin(2 * np.pi * (6 + 18 * u) * s))
    y = ru + tom
    return np.stack([y, np.roll(y, int(.009 * SR))], 1)


def swoosh_desce(dur=.85):
    """papel voando para a mesa: ruído num passa-banda que DESCE de ~6 kHz para ~500 Hz (o jornal da referência)"""
    n = int(dur * SR); s = np.arange(n) / SR; u = s / dur
    x = rng.normal(0, 1, n); y = np.zeros(n); blk = 512
    cen = 6000 * (500 / 6000) ** u
    for i in range(0, n, blk):
        c = float(cen[min(i + blk // 2, n - 1)])
        y[i:i + blk] = bp(x[max(0, i - 2048):i + blk], c * .55, min(c * 1.7, 15000))[-min(blk, n - i):]
    env = np.minimum(s / .04, 1) * np.exp(-u * 2.2)
    y *= env
    return np.stack([y, np.roll(y, int(.007 * SR))], 1)


def onda_som(dur=.6):
    """virada dentro da cena (flash + onda): ar subindo rápido + baque curto"""
    n = int(dur * SR); s = np.arange(n) / SR
    sobe = whoosh(.35, .3, (-.4, .4))
    out = np.zeros((n, 2)); out[:len(sobe)] += sobe * .8
    k = kick(.4, 150, 45, 1.0); i0 = int(.3 * SR); m = min(len(k), n - i0); out[i0:i0 + m] += np.stack([k[:m], k[:m]], 1) * .9
    return out, .3


def tique(dur=.06):
    n = int(dur * SR); s = np.arange(n) / SR
    return hp(rng.normal(0, 1, n), 6000) * np.exp(-s * 140)


# ============================ cama: pad + pulso + 808 + tique ============================
cama = np.zeros((N, 2)); o808 = np.zeros((N, 2))
if not SEM:
    # pad escuro (Ré menor com nona), filtro andando devagar
    pad = np.zeros((N, 2))
    for m, g in ((38, .30), (50, .55), (53, .42), (57, .40), (64, .22), (62, .18)):
        for ch, det in ((0, -.08), (1, .08)):
            f = hz(m) * 2 ** (det / 12)
            saw = 2 * ((f * t_all + rng.uniform(0, 1)) % 1) - 1
            pad[:, ch] += (np.sin(2 * np.pi * f * t_all) * .5 + saw * .5) * g * (.75 + .25 * np.sin(2 * np.pi * t_all / (4.3 + m % 5) + ch))
    lfo = .5 + .5 * np.sin(2 * np.pi * t_all / 9.0)
    pad = lp(pad, 520, 2) * (1 - lfo[:, None] * .35) + lp(pad, 1000, 2) * (lfo[:, None] * .35)
    pad *= np.clip(t_all / .3, 0, 1)[:, None]
    # pulso grave tipo batimento: meio tempo no começo, todo tempo depois; respiro antes de cada drop
    pul = np.zeros(N)
    mt = float(CFG.get("meio_tempo", .45)) * END
    k = 0
    while k * BEAT < fim_mus - .05:
        tb = k * BEAT
        livre = all(not (d - .45 <= tb < d + .3) for d in drops)
        if livre and (tb >= mt or k % 2 == 0):
            y = kick(g=1.0 if (k % 4 == 0) else .8)
            i0 = int(tb * SR); m = min(len(y), N - i0); pul[i0:i0 + m] += y[:m]
            if tb >= mt and k % 8 == 7:                                         # batimento duplo no fim do compasso
                y2 = kick(g=.55); i1 = int((tb + .19) * SR); m2 = min(len(y2), N - i1); pul[i1:i1 + m2] += y2[:m2]
        k += 1
    pul = lp(pul, 220)
    # tique de relógio na metade final (tensão)
    tq = np.zeros(N)
    if not CFG.get("sem_tique"):
        k = 0
        while k * BEAT / 2 < fim_mus - .05:
            tb = k * BEAT / 2
            if tb >= mt and all(not (d - .45 <= tb < d + .3) for d in drops):
                y = tique() * (.9 if k % 2 else .5); i0 = int(tb * SR); m = min(len(y), N - i0); tq[i0:i0 + m] += y[:m]
            k += 1
    # 808 nos drops (o gancho começa com ele), Ré1 e Dó#1 alternados
    for j, d in enumerate(drops):
        prox = next((x for x in drops if x > d + .1), END)
        y = oito08(dur=min(3.0, max(.8, prox - d - .05)), nota=26 if j % 2 == 0 else 25)
        poe(o808, y, d)
    cama = pad * .22 + np.stack([pul, pul], 1) * .75 + np.stack([tq, tq], 1) * .05
    fade = np.clip((fim_mus + .05 - t_all) / .12, 0, 1) * np.clip((END + .4 - t_all) / .8, 0, 1)
    cama *= fade[:, None]; o808 *= fade[:, None]

# ============================ efeitos de corte ============================
fx = np.zeros((N, 2))
if os.environ.get("SEM_SWISH") != "1":
    gs = db(float(CFG.get("swish", -8)))
    for i, (t, b, tr) in enumerate(cortes):
        sgn = 1 if i % 2 else -1
        poe(fx, whoosh(.42, .3, (-.85 * sgn, .85 * sgn)), t - .3, gs)
        x = hp(rng.normal(0, 1, int(.08 * SR)), 3500) * np.exp(-np.arange(int(.08 * SR)) / SR * 45)
        poe(fx, x, t, gs * .8)
if os.environ.get("SEM_BOOM") != "1":
    for t in booms:
        if any(abs(t - d) < .2 for d in drops):
            continue                                                           # no drop quem bate é o 808
        poe(fx, riser(.95), t - .95, db(float(CFG.get("riser", -6))))
        poe(fx, impacto(), t - .005, db(float(CFG.get("impacto", 1))))
    for d in drops[1:]:
        poe(fx, riser(.9), d - .9, db(float(CFG.get("riser", -6)) - 1))
    for t in hits:
        poe(fx, kick(.36, 140, 52, 1.0), t, db(-3)); poe(fx, whoosh(.2, .15, (-.3, .3)), t - .15, db(-12))
    for t in ondas:
        x_, off = onda_som(); poe(fx, x_, t - off, db(-3))
    for t in flashes:
        n_ = int(.08 * SR); s_ = np.arange(n_) / SR; z = hp(rng.normal(0, 1, n_), 4000) * np.exp(-s_ * 60)
        poe(fx, np.stack([z, z], 1), t, db(-8))
    for t in swooshes:
        poe(fx, swoosh_desce(), t - .05, db(-7))

# ============================ batida do final (~81 BPM) ============================
bat = np.zeros((N, 2))
if t_batida is not None and not SEM:
    BB = 60 / 81.0; t = t_batida; k = 0
    while t < END:
        for sub in range(4):
            tt = t + sub * BB / 2
            if tt >= END: break
            if sub in (0, 3) and not (k % 2 and sub == 3): poe(bat, kick(.45, 120, 48), tt, .9)
            if sub == 2:
                n = int(.25 * SR); s = np.arange(n) / SR; poe(bat, bp(rng.normal(0, 1, n), 900, 4000) * np.exp(-s * 18), tt, .45)
            poe(bat, tique(.05), tt, .18)
        nota = [33, 33, 36, 31][k % 4]; n = int(2 * BB * SR); s = np.arange(n) / SR; f = hz(nota)
        poe(bat, lp(np.sin(2 * np.pi * f * s) + .4 * np.sign(np.sin(2 * np.pi * f * s)), 500) * np.exp(-s * 1.2) * .35, t)
        t += 2 * BB; k += 1

# ============================ mix ============================
def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1); y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]; return y


v, sv_ = sf.read(J("audio", "voice.wav")); x, sx = sf.read(J("audio", "sfx_bus.wav"))
if sv_ != SR or sx != SR:
    sys.exit(f"voice.wav/sfx_bus.wav precisam estar em {SR} Hz")
v, x = fit(v), fit(x)
vm = v.mean(1)
act = mavg(np.clip(mavg(np.abs(vm), 2400) / (np.abs(vm).max() * .05), 0, 1), 7200)
fala = act > .5
rms = lambda a: float(np.sqrt(np.mean(a ** 2))) if len(a) else 1e-9
rms_v = rms(vm[fala]) if fala.any() else .05
mix = v + x
if not SEM:
    ativo = np.abs(cama.mean(1)) > 1e-7
    cama *= rms_v * db(float(CFG.get("cama", -5.5))) / max(rms(cama.mean(1)[ativo]), 1e-9)
    # ducking: a cama cede ~3 dB na fala, e os médios (300 Hz–3 kHz, onde a voz mora) cedem mais ~4 dB
    med = bp(cama, 300, 3000)
    cama = cama - med * (act * .37)[:, None]
    cama *= (1 - .3 * act)[:, None]
    o808 *= rms_v * db(float(CFG.get("drop", 1))) / max(rms(o808.mean(1)[np.abs(o808.mean(1)) > 1e-4]), 1e-9)
    mix = mix + cama + o808 * (1 - .2 * act)[:, None]
pk_fx = np.max(np.abs(fx)) if np.any(fx) else 1
mix = mix + fx * rms_v * 2.2
if np.any(bat):
    Lb = lufs(bat.mean(1), np.abs(bat.mean(1)) > 1e-6); Lv = lufs(vm, fala)
    mix = mix + bat * 10 ** ((Lv - 9 - Lb) / 20)
pre = J("audio", "premix_ea.wav")
sf.write(pre, (mix / max(np.abs(mix).max(), 1e-9) * .9).astype(np.float32), SR)
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
m = json.loads(out[out.rfind("{"):out.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.84:attack=2:release=50:level=false")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", J("audio", "final_mix_ea.wav")], check=True)
desc = "sem cama" if SEM else f"cama {float(CFG.get('cama', -5.5)):+.1f} dB da voz, pulso {BPM:.0f} BPM, {len(drops)} drop(s) de 808"
print(f"ok -> audio/final_mix_ea.wav ({desc}) | whoosh: {len(cortes)} cortes | impacto: {len([b for b in booms if not any(abs(b - d) < .2 for d in drops)])} | "
      f"golpes: {len(hits)} | ondas: {len(ondas)} | swoosh de papel: {len(swooshes)} | batida: {'sim' if np.any(bat) else 'não'}")
