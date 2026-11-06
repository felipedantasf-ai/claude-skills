"""Trilha do formato edit-papel, sintetizada aqui (nada de gravação de terceiros), no molde da referência:
arpejo "pluck" escuro em semicolcheias (~115 BPM), pad grave, pulso de sub a cada 2 tempos, harmonia menor que gira devagar;
a música fica ~15–18 dB abaixo da voz, SOME de uma vez nas frases de impacto (DROPS) e volta com uma pancada grave.
Lê render/timing.js, out/events.json (cues) e trilha.json (opcional) do projeto; voz e efeitos vêm do mix.py (audio/voice.wav,
audio/sfx_bus.wav). Saída: audio/musica_papel.wav e audio/final_mix_papel.wav (-14 LUFS, pico -1,5 dBTP).

uso (de dentro do projeto, ou pelo pipeline.py fechar via etapas.json "trilha"):  python <skill>/trilha.py [--sem-musica]
trilha.json (opcional, na raiz do projeto):
  {"bpm": 115, "tom": "Cm", "nivel": -12.5,
   "drops": [["B31", "realidade"], ["B44", 0, "B45", 0]],    # [beat, palavra] = cai na palavra e volta no beat seguinte;
                                                            # [beatA, palA, beatB, palB] = intervalo explícito
   "hits": [["B46", 0]],                                     # pancada grave extra (a volta de cada drop já tem pancada)
   "risers": [["B12", 0]],                                   # subida que termina no alvo
   "sobe": [["B40", "B52", 2]]}                              # trecho com +N dB (clímax)
Sem trilha.json: um drop automático na pausa mais longa entre 30% e 80% do vídeo e pancada na volta.
SEM_MUSICA=1 (ou --sem-musica) = só voz + efeitos (o arquivo final é o mesmo).
"""
import json, os, subprocess, sys, unicodedata
import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve, butter, sosfilt

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
_n = lambda x: "".join(ch for ch in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(ch) != "Mn")


def W(bid, k=0, fim=False):
    ws = B[bid]["words"]
    w = ws[min(k, len(ws) - 1)] if isinstance(k, int) else next((x for x in ws if _n(x["w"]).startswith(_n(k))), ws[0])
    return w["e"] if fim else w["s"]


END = TJ["videoDur"]
N = int((END + 1.0) * SR)
t_all = np.arange(N) / SR
rng = np.random.default_rng(11)
BPM = float(CFG.get("bpm", 115)); BEAT = 60 / BPM; S16 = BEAT / 4
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
lp = lambda x, f, o=2: sosfilt(butter(o, f, "low", fs=SR, output="sos"), x)
hp = lambda x, f, o=2: sosfilt(butter(o, f, "high", fs=SR, output="sos"), x)
bp = lambda x, a, b, o=2: sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x)


def mavg(a, n):
    c = np.cumsum(np.insert(np.asarray(a, np.float64), 0, 0.0)); y = (c[n:] - c[:-n]) / n; p = n // 2
    return np.concatenate([np.full(p, y[0]), y, np.full(len(a) - len(y) - p, y[-1])])


# ---------------- harmonia (menor, gira a cada 2 compassos) ----------------
TONS = {"Cm": 0, "C#m": 1, "Dm": 2, "D#m": 3, "Em": 4, "Fm": 5, "F#m": 6, "Gm": 7, "G#m": 8, "Am": 9, "A#m": 10, "Bm": 11}
T0 = 48 + TONS.get(CFG.get("tom", "Cm"), 0)                       # tônica em C3
# graus: i, VI, III, VII  (ex.: Cm, Ab, Eb, Bb) — escuro e circular, sem resolver
GRAUS = [(0, [0, 3, 7]), (-4, [0, 4, 7]), (3, [0, 4, 7]), (-2, [0, 4, 7])]
COMP = 4 * BEAT

# ---------------- drops (a música some) e pancadas ----------------
drops, hits, risers, sobe = [], [], [], []
for d in CFG.get("drops", []):
    if len(d) == 2:
        a = W(d[0], d[1]) - .04
        nxt = TJ["beats"][[b["id"] for b in TJ["beats"]].index(d[0]) + 1]["start"] if d[0] != TJ["beats"][-1]["id"] else END
        drops.append((a, nxt - .02))
    else:
        drops.append((W(d[0], d[1]) - .04, W(d[2], d[3]) - .02))
for h in CFG.get("hits", []):
    hits.append(W(h[0], h[1]) - .015)
for r in CFG.get("risers", []):
    risers.append(W(r[0], r[1]))
for s_ in CFG.get("sobe", []):
    sobe.append((B[s_[0]]["start"], B[s_[1]]["end"], float(s_[2])))
if not CFG.get("drops") and not CFG.get("sem_drop_auto"):
    ws = [w for b in TJ["beats"] for w in b["words"]]
    pausas = [(ws[i + 1]["s"] - ws[i]["e"], ws[i]["e"], ws[i + 1]["s"]) for i in range(len(ws) - 1)
              if .3 * END < ws[i]["e"] < .8 * END]
    if pausas:
        g, a, b = max(pausas)
        bi = next(x for x in TJ["beats"] if x["start"] <= a + .01 <= x["end"] + .3)
        drops.append((bi["start"] - .02, b - .02))
for a, b in drops:
    hits.append(b)

# ---------------- síntese ----------------
pluckL, pluckR, pad, sub, fx = (np.zeros(N) for _ in range(5))


def pluck(m, t, vel, pan):
    i0 = int(t * SR); n = min(int(.9 * SR), N - i0)
    if n <= 0 or i0 < 0:
        return
    s = np.arange(n) / SR; f = hz(m)
    y = np.zeros(n)
    for k, a in ((1, 1), (2, .45), (3, .22), (4, .1), (5, .05)):
        y += np.sin(2 * np.pi * f * k * s + rng.uniform(0, 6.28)) * a * np.exp(-s * (5.5 + 2.2 * k))
    y *= np.minimum(s / .002, 1) * vel
    pluckL[i0:i0 + n] += y * (1 - pan) / 2 * 1.4
    pluckR[i0:i0 + n] += y * (1 + pan) / 2 * 1.4


t = 0.0; k = 0
while t < END + .5:
    raiz, tri = GRAUS[(k // 2) % len(GRAUS)]
    notas = [T0 + 12 + raiz + x for x in tri] + [T0 + 24 + raiz + tri[0]]
    padrao = [0, 1, 2, 3, 2, 1, 0, 2]                               # sobe e desce, 8 semicolcheias
    for j in range(16):
        tt = t + j * S16
        m = notas[padrao[j % 8]] + (12 if j in (6, 14) else 0)
        pluck(m, tt, .38 if j % 4 == 0 else .24, np.sin(j * .9) * .55)
    i0, i1 = int(t * SR), min(N, int((t + COMP + .6) * SR)); n = i1 - i0
    s = np.arange(n) / SR
    env = np.minimum(s / .5, 1) * np.clip((COMP + .6 - s) / .6, 0, 1)
    for m in [T0 + raiz + x for x in tri]:
        for det in (-.07, .07):
            pad[i0:i1] += (2 * ((s * hz(m) * 2 ** (det / 12) + rng.uniform(0, 1)) % 1) - 1) * .035 * env
    for b_ in range(0, 4, 2):                                       # pulso de sub a cada 2 tempos
        j0 = int((t + b_ * BEAT) * SR); m2 = min(int(.5 * SR), N - j0)
        if m2 > 0:
            sk = np.arange(m2) / SR
            sub[j0:j0 + m2] += np.sin(2 * np.pi * np.cumsum(hz(T0 - 12 + raiz) * (1 + .6 * np.exp(-sk * 30))) / SR) * np.exp(-sk * 5) * .55
    t += COMP; k += 1
pad = lp(pad, 900)
pluckL, pluckR = lp(pluckL, 3800), lp(pluckR, 3800)
for a in risers:
    d = 1.4; i0 = int((a - d) * SR); n = int(d * SR)
    if i0 > 0:
        s = np.arange(n) / SR; u = s / d
        fx[i0:i0 + n] += hp(rng.normal(0, 1, n), 1200) * u ** 2.4 * .12
for h in hits:
    i0 = int(h * SR); n = min(int(1.4 * SR), N - i0)
    if n > 0:
        s = np.arange(n) / SR
        fx[i0:i0 + n] += np.sin(2 * np.pi * np.cumsum(62 * np.exp(-s * 5) + 34) / SR) * np.exp(-s * 2.6) * .9 + lp(rng.normal(0, 1, n), 1500) * np.exp(-s * 22) * .22


def ir(seed, dur=1.8):
    r = np.random.default_rng(seed); n = int(dur * SR); s = np.arange(n) / SR
    return lp(r.normal(0, 1, n), 6000) * np.exp(-s * 3.4) * .02


wetL = fftconvolve(pluckL + pad * .6, ir(1))[:N]; wetR = fftconvolve(pluckR + pad * .6, ir(2))[:N]
mus = np.stack([pluckL + pad + sub + wetL, pluckR + pad + sub + wetR], 1)
# nível por trecho, drops com rampa curta (sai em 40 ms, volta em 25 ms junto da pancada)
lv = np.zeros(N)
for a, b, d in sobe:
    lv[int(a * SR):int(b * SR)] += d
lv = mavg(lv, SR // 2)
g = 10 ** (lv / 20)
for a, b in drops:
    ia, ib = int(a * SR), int(b * SR); ra, rb = int(.04 * SR), int(.025 * SR)
    g[ia:ib] = 0; g[max(0, ia - ra):ia] *= np.linspace(1, 0, min(ra, ia)); g[ib:ib + rb] *= np.linspace(0, 1, len(g[ib:ib + rb]))
g *= np.clip(t_all / .25, 0, 1) * np.clip((END - t_all) / .6, 0, 1)
mus *= g[:, None]
fxs = np.stack([fx + fftconvolve(fx, ir(3, 1.2) * .5)[:N], fx + fftconvolve(fx, ir(4, 1.2) * .5)[:N]], 1)
if not SEM:
    sf.write(J("audio", "musica_papel.wav"), (mus / max(np.abs(mus).max(), 1e-9) * .9).astype(np.float32), SR)

# ---------------- mix: voz + efeitos (do mix.py) + música com ducking ----------------
def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1); y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]; return y


v, sv_ = sf.read(J("audio", "voice.wav")); x, sx = sf.read(J("audio", "sfx_bus.wav"))
if sv_ != SR or sx != SR:
    sys.exit(f"voice.wav/sfx_bus.wav precisam estar em {SR} Hz")
v, x = fit(v), fit(x)
vm = v.mean(1)
rms = lambda a: np.sqrt(np.mean(a[np.abs(a) > 1e-4] ** 2)) if np.any(np.abs(a) > 1e-4) else 1e-9
act = mavg(np.clip(mavg(np.abs(vm), 2400) / (np.abs(vm).max() * .05), 0, 1), 7200)
NIVEL = float(CFG.get("nivel", -12.5))                              # dB da cama em relação à voz (medido no RMS)
mix = v + x
if not SEM:
    base = mus.mean(1); r_mus = rms(base[g > .5]) if np.any(g > .5) else rms(base)
    mus *= rms(vm) / r_mus * 10 ** (NIVEL / 20) * (1 - .35 * act)[:, None]   # cede ~4 dB enquanto ele fala
    fxs *= rms(vm) / max(rms(fxs.mean(1)), 1e-9) * 10 ** ((NIVEL + 5) / 20)
    mix = mix + mus + fxs
pre = J("audio", "premix_papel.wav")
sf.write(pre, (mix / max(np.abs(mix).max(), 1e-9) * .9).astype(np.float32), SR)
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
m = json.loads(out[out.rfind("{"):out.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.84:attack=2:release=50:level=false")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", J("audio", "final_mix_papel.wav")], check=True)
desc = "sem música" if SEM else f"cama {NIVEL:+.1f} dB da voz, {BPM:.0f} BPM, {CFG.get('tom', 'Cm')}"
print(f"ok -> audio/final_mix_papel.wav ({desc}) | drops: {[(round(a, 2), round(b, 2)) for a, b in drops]} | pancadas: {[round(h, 2) for h in hits]}")
