"""Som do formato edit-investigativa, sintetizado aqui (nada de gravação de terceiros), no molde da referência:
- cama escura e GRAVE (87% da energia abaixo de 250 Hz): pulso de baixo a cada tempo (~117 BPM), drone menor filtrado, ar baixo;
  nível constante ~19 LU abaixo da voz (sem drops: a referência não some com a música);
- BAQUE sub-grave (~70 -> 40 Hz, pico ~0,25 s depois do corte) em CADA corte de cena (28 de 30 cortes na referência).
Lê render/timing.js, out/events.json (cortes 'tr:*', cues do kit e os eventos 'baque'/'semBaque' das cenas) e trilha.json
(opcional). Voz e efeitos vêm do mix.py (audio/voice.wav, audio/sfx_bus.wav).
Saída: audio/musica_inv.wav e audio/final_mix_inv.wav (-14 LUFS, pico -1,5 dBTP).

uso (de dentro do projeto, ou pelo pipeline.py fechar via etapas.json "trilha"):  python <skill>/trilha_inv.py [--sem-musica]
trilha.json (opcional, na raiz do projeto):
  {"bpm": 117, "tom": "Cm", "nivel": -19,        # nivel = LU da cama em relação à voz (ponderação K)
   "baque": -3,                                  # dB do baque em relação ao RMS da voz (0 = sem baques)
   "sem_baque": ["B44", ...],                    # cenas que começam nesses beats não ganham baque
   "hits": [["B46", 0]],                         # baque extra numa palavra (beat, índice ou palavra)
   "sobe": [["B40", "B52", 2]]}                  # trecho com +N dB na cama (clímax)
SEM_MUSICA=1 (ou --sem-musica) = só voz + efeitos + baques. SEM_BAQUE=1 tira os baques.
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


def W(bid, k=0):
    ws = B[bid]["words"]
    w = ws[min(k, len(ws) - 1)] if isinstance(k, int) else next((x for x in ws if _n(x["w"]).startswith(_n(k))), ws[0])
    return w["s"]


END = TJ["videoDur"]
N = int((END + 1.0) * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)
BPM = float(CFG.get("bpm", 117)); BEAT = 60 / BPM
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b, o=2: sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)


def mavg(a, n):
    c = np.cumsum(np.insert(np.asarray(a, np.float64), 0, 0.0)); y = (c[n:] - c[:-n]) / n; p = n // 2
    return np.concatenate([np.full(p, y[0]), y, np.full(len(a) - len(y) - p, y[-1])])


def kpond(x):
    """ponderação K (BS.1770, 48 kHz)"""
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x)
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], x)


def lufs(x, sel=None):
    k = kpond(x if x.ndim == 1 else x.mean(1))
    if sel is not None:
        k = k[sel[:len(k)]]
    return -0.691 + 10 * np.log10(np.mean(k ** 2) + 1e-12)


# ---------------- cortes e baques ----------------
cortes = sorted({round(e["t"], 3) for e in EVJ["events"] if e["type"].startswith("tr:") and e["t"] > .2})
sem = []
for b in CFG.get("sem_baque", []):
    if b in B:
        sem.append(B[b]["start"])
sem += [e["t"] for e in EVJ["events"] if e["type"] == "semBaque"]
baques = [t for t in cortes if not any(abs(t - s) < .35 for s in sem)]
baques += [e["t"] for e in EVJ["events"] if e["type"] == "baque"]
for h in CFG.get("hits", []):
    baques.append(W(h[0], h[1]) - .2)
GB = float(CFG.get("baque", -3))
if os.environ.get("SEM_BAQUE") == "1" or GB == 0:
    baques = []

# ---------------- cama: pulso grave + drone menor + ar ----------------
TONS = {"Cm": 0, "C#m": 1, "Dm": 2, "D#m": 3, "Em": 4, "Fm": 5, "F#m": 6, "Gm": 7, "G#m": 8, "Am": 9, "A#m": 10, "Bm": 11}
T0 = 36 + TONS.get(CFG.get("tom", "Cm"), 0)                      # tônica em C2
GRAUS = [(0, [0, 3, 7]), (0, [0, 3, 7]), (-4, [0, 4, 7]), (-4, [0, 4, 7]), (5, [0, 3, 7]), (5, [0, 3, 7]), (-5, [0, 4, 7]), (0, [0, 3, 7])]
COMP = 4 * BEAT
pulso, padL, padR, ar = (np.zeros(N) for _ in range(4))
t = 0.0; k = 0
while t < END + .5:
    raiz, tri = GRAUS[k % len(GRAUS)]
    for b_ in range(4):                                             # pulso a cada tempo, acento no 1
        j0 = int((t + b_ * BEAT) * SR); m = min(int(.6 * SR), N - j0)
        if m > 0:
            s = np.arange(m) / SR
            f = hz(T0 + raiz) * (1 + .25 * np.exp(-s * 40))
            ph = 2 * np.pi * np.cumsum(f) / SR
            y = (np.sin(ph) + .9 * np.sin(ph / 2) + .35 * np.sin(2 * ph) + .12 * np.sin(3 * ph)) * np.exp(-s * (5.5 if b_ else 3.8)) * np.minimum(s / .006, 1)
            pulso[j0:j0 + m] += y * (1.0 if b_ == 0 else .62)
    i0, i1 = int(t * SR), min(N, int((t + COMP + .8) * SR)); n = i1 - i0
    s = np.arange(n) / SR
    env = np.minimum(s / .9, 1) * np.clip((COMP + .8 - s) / .8, 0, 1)
    pulso[i0:i1] += np.sin(2 * np.pi * hz(T0 - 12 + raiz) * s) * .22 * env      # drone sub (C1): a referência tem ~16 dB de sub sob a fala
    for mm in [T0 + 12 + raiz + x for x in tri] + [T0 + raiz]:
        for det, alvo in ((-.08, padL), (.08, padR), (0, padL), (0, padR)):
            alvo[i0:i1] += (2 * ((s * hz(mm) * 2 ** (det / 12) + rng.uniform(0, 1)) % 1) - 1) * .03 * env
    t += COMP; k += 1
padL, padR = lp(lp(padL, 420), 420), lp(lp(padR, 420), 420)
ar = bp(rng.normal(0, 1, N), 220, 900) * (.5 + .5 * np.sin(2 * np.pi * t_all / (8 * BEAT))) * .02
pulso = lp(pulso, 240)


def ir(seed, dur=2.2):
    r = np.random.default_rng(seed); n = int(dur * SR); s = np.arange(n) / SR
    return lp(r.normal(0, 1, n), 3000) * np.exp(-s * 2.6) * .018


wetL = fftconvolve(padL + pulso * .25, ir(1))[:N]; wetR = fftconvolve(padR + pulso * .25, ir(2))[:N]
mus = np.stack([pulso + padL + ar + wetL, pulso + padR + ar * .9 + wetR], 1)
lv = np.zeros(N)
for a_, b_, d_ in [(B[x[0]]["start"], B[x[1]]["end"], float(x[2])) for x in CFG.get("sobe", [])]:
    lv[int(a_ * SR):int(b_ * SR)] += d_
g = 10 ** (mavg(lv, SR // 2) / 20)
g *= np.clip(t_all / .6, 0, 1) * np.clip((END - .3 - t_all) / .9, 0, 1)
mus *= g[:, None]

# ---------------- baques: varredura 72 -> 40 Hz com 2º harmônico (aparece no celular), pico ~0,2 s após o corte ----------------
bq = np.zeros(N)
for tb in baques:
    i0 = int(tb * SR); n = min(int(.75 * SR), N - i0)
    if n <= 0 or i0 < 0:
        continue
    s = np.arange(n) / SR
    f = 40 + 32 * np.exp(-s * 7)
    ph = 2 * np.pi * np.cumsum(f) / SR
    env = np.where(s < .25, np.sin(np.pi / 2 * s / .25) ** 2, np.exp(-(s - .25) * 9.5))   # pico ~0,25 s depois do corte (ref. 0,2–0,35)
    y = (np.sin(ph) + .32 * np.sin(2 * ph + .4) + .08 * np.sin(3 * ph)) * env
    y += lp(rng.normal(0, 1, n), 160) * np.exp(-s * 18) * .25 * np.minimum(s / .01, 1)
    bq[i0:i0 + n] += y
if not SEM:
    sf.write(J("audio", "musica_inv.wav"), (mus / max(np.abs(mus).max(), 1e-9) * .9).astype(np.float32), SR)


# ---------------- mix: voz + efeitos (do mix.py) + cama com ducking leve + baques ----------------
def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1); y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]; return y


v, sv_ = sf.read(J("audio", "voice.wav")); x, sx = sf.read(J("audio", "sfx_bus.wav"))
if sv_ != SR or sx != SR:
    sys.exit(f"voice.wav/sfx_bus.wav precisam estar em {SR} Hz")
v, x = fit(v), fit(x)
vm = v.mean(1)
act = mavg(np.clip(mavg(np.abs(vm), 2400) / (np.abs(vm).max() * .05), 0, 1), 7200)
fala = act > .5
Lv = lufs(vm, fala)
mix = v + x
NIVEL = float(CFG.get("nivel", -19))
if not SEM:
    Lm = lufs(mus.mean(1), g > .5)
    mus *= 10 ** ((Lv + NIVEL - Lm) / 20) * (1 - .3 * act)[:, None]     # cede ~3 dB enquanto ele fala
    mix = mix + mus
if baques:
    rms_v = np.sqrt(np.mean(vm[fala] ** 2)) if fala.any() else .05
    w_ = int(.05 * SR); pk = np.sqrt(np.max(mavg(bq ** 2, w_))) if np.any(bq) else 1
    bq *= rms_v / max(pk, 1e-9) * 10 ** (GB / 20)
    mix = mix + bq[:, None]
pre = J("audio", "premix_inv.wav")
sf.write(pre, (mix / max(np.abs(mix).max(), 1e-9) * .9).astype(np.float32), SR)
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
m = json.loads(out[out.rfind("{"):out.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.84:attack=2:release=50:level=false")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", J("audio", "final_mix_inv.wav")], check=True)
desc = "sem música" if SEM else f"cama {NIVEL:+.0f} LU da voz, {BPM:.0f} BPM, {CFG.get('tom', 'Cm')}"
print(f"ok -> audio/final_mix_inv.wav ({desc}) | baques: {len(baques)} de {len(cortes)} cortes ({GB:+.0f} dB)")
