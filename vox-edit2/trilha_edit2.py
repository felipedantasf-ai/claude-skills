"""Som do formato vox-edit2: voz + sons táteis (mix.py) + uma cama SOUL LO-FI sintetizada aqui (nada de gravação de terceiros).

O projeto After Effects de referência ("High heels", EarnEdits) exporta a comp principal com uma faixa só, "Soulful.mp3"
(soul lo-fi a ~75 BPM, energia em 120–400 Hz, piano elétrico, bateria macia), sem efeitos sonoros. O vox editorial do Felipe tem
sons táteis e, por padrão, nenhuma música. A junção: os sons táteis continuam (papel, amassado, marcador, obturador) e entra
esta cama quente bem por baixo da voz (~-17 dB RMS da fala, cedendo mais 3 dB enquanto ela fala).
Camadas: piano elétrico FM (acordes de 7ª/9ª, um por compasso), baixo redondo, bumbo macio, aro e chimbal com swing, chiado e
estalos de vinil, tudo com passa-baixa (calor de fita).

Lê render/timing.js, audio/voice.wav e audio/sfx_bus.wav (do mix.py) e trilha.json (opcional). Saída: audio/final_mix_e2.wav (-14 LUFS).
uso:  python <skill>/trilha_edit2.py [--sem-musica]      (de dentro da pasta do projeto; o pipeline.py fechar chama sozinho)
trilha.json (opcional): {"bpm": 75, "cama": -17, "tom": "re", "sem_bateria": false}
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

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
CFG = json.load(open(J("trilha.json"), encoding="utf-8")) if os.path.exists(J("trilha.json")) else {}
END = TJ["videoDur"]
N = int((END + 1.0) * SR)
rng = np.random.default_rng(7)
sos = lambda kind, f, o=2: butter(o, f, kind, fs=SR, output="sos")
lp = lambda x, f, o=2: sosfilt(sos("low", f, o), x, axis=0)
hp = lambda x, f, o=2: sosfilt(sos("high", f, o), x, axis=0)
bp = lambda x, a, b, o=2: sosfilt(sos("band", [a, b], o), x, axis=0)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)


def mavg(a, n):
    c = np.cumsum(np.insert(a, 0, 0.0)); out = (c[n:] - c[:-n]) / n
    return np.concatenate([np.full(n // 2, out[0]), out, np.full(len(a) - len(out) - n // 2, out[-1])])


def lufs(x, mask=None):
    y = x[mask] if mask is not None and mask.any() else x
    return 20 * np.log10(np.sqrt(np.mean(y ** 2)) + 1e-12)


def poe(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    a, b = max(0, i), min(len(buf), i + len(sig))
    buf[a:b] += sig[a - i:b - i] * g


# ============================ cama ============================
BPM = float(CFG.get("bpm", 75)); BEAT = 60 / BPM; BAR = 4 * BEAT
TONS = {"re": 62, "do": 60, "mi": 64, "fa": 65, "sol": 67, "la": 57}
T0 = TONS.get(CFG.get("tom", "re"), 62)
# Dm9 · G13 · Cmaj9 · A7(b9) em re menor (soul clássico); vozes do piano e baixo em semitons a partir do tom
PROG = [([0, 3, 7, 10, 14], -12), ([5, 9, 10, 16], -7), ([-2, 2, 5, 9], -14), ([-5, -1, 2, 6, 8], -9)]
cama = np.zeros(N); bai = np.zeros(N); bat = np.zeros(N)
t_bar = np.arange(int(BAR * SR)) / SR


def rhodes(f, d, vel=1.0):
    t = np.arange(int(d * SR)) / SR
    env = np.exp(-t * 1.6) * (1 - np.exp(-t * 400))
    mod = np.sin(2 * np.pi * f * t) * 1.3 * np.exp(-t * 6)                    # "tine": índice de modulação que cai rápido
    x = np.sin(2 * np.pi * f * t + mod) + .18 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3)
    return x * env * vel * (1 + .12 * np.sin(2 * np.pi * 4.6 * t))           # trêmolo leve


def baixo(f, d):
    t = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(1.4 * x) * np.exp(-t * 2.2) * (1 - np.exp(-t * 300))


def bumbo():
    t = np.arange(int(.35 * SR)) / SR
    f = 52 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def aro():
    t = np.arange(int(.18 * SR)) / SR
    return bp(rng.standard_normal(len(t)), 1200, 4200) * np.exp(-t * 32) * .8 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 45) * .4


def chimbal():
    t = np.arange(int(.06 * SR)) / SR
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * 70)


if not SEM:
    nb = int(END / BAR) + 2
    for b in range(nb):
        t0 = b * BAR
        notas, raiz = PROG[b % 4]
        for k, n in enumerate(notas):                                         # acorde "arrastado" (strum) no 1 e repetido no 3-e
            poe(cama, rhodes(hz(T0 + n), BAR * .62, .32), t0 + k * .012)
            poe(cama, rhodes(hz(T0 + n), BAR * .4, .2), t0 + 2.5 * BEAT + k * .012)
        poe(bai, baixo(hz(T0 + raiz - 12), BEAT * 1.4), t0)
        poe(bai, baixo(hz(T0 + raiz - 12), BEAT * .6), t0 + 1.5 * BEAT, .7)
        poe(bai, baixo(hz(T0 + raiz - 5), BEAT * .9), t0 + 2.5 * BEAT, .8)
        if not CFG.get("sem_bateria") and b > 0:                              # bateria entra no 2º compasso
            for q in range(8):                                                # colcheias com swing (a 2ª de cada tempo atrasa)
                sw = .58 if q % 2 else 0.0
                poe(bat, chimbal(), t0 + (q // 2 + sw) * BEAT, .22 if q % 2 else .3)
            poe(bat, bumbo(), t0, .9); poe(bat, bumbo(), t0 + 2.58 * BEAT, .55)
            poe(bat, aro(), t0 + BEAT, .5); poe(bat, aro(), t0 + 3 * BEAT, .5)
    vin = lp(hp(rng.standard_normal(N), 900), 6000) * .012                    # chiado de vinil
    clk = np.zeros(N); idx = rng.integers(0, N, int(END * 7)); clk[idx] = rng.uniform(-.5, .5, len(idx))
    vin += lp(clk, 5000) * .6
    bed = lp(cama * .9 + bai * 1.1 + bat * .8, 5200, 2) + vin
    fade = np.clip(np.arange(N) / (.4 * SR), 0, 1) * np.clip((END + .6 - np.arange(N) / SR) / 1.2, 0, 1)
    bed *= fade
else:
    bed = np.zeros(N)

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
    st = np.stack([bed, bed], 1)
    st[:, 0] = bed + .3 * lp(np.roll(bed, int(.011 * SR)), 3000); st[:, 1] = bed + .3 * lp(np.roll(bed, int(.017 * SR)), 3000)   # largura
    ativo = np.abs(bed) > 1e-7
    st *= rms_v * db(float(CFG.get("cama", -17))) / max(rms(st.mean(1)[ativo]), 1e-9)
    med = bp(st, 300, 3000)
    st = (st - med * (act * .35)[:, None]) * (1 - .3 * act)[:, None]          # cede na fala (médios ainda mais)
    mix = mix + st
pre = J("audio", "premix_e2.wav")
sf.write(pre, (mix / max(np.abs(mix).max(), 1e-9) * .9).astype(np.float32), SR)
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", pre, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                     capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
m = json.loads(out[out.rfind("{"):out.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.84:attack=2:release=50:level=false")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", pre, "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", J("audio", "final_mix_e2.wav")], check=True)
desc = "sem cama" if SEM else f"cama soul lo-fi {BPM:.0f} BPM a {float(CFG.get('cama', -17)):+.0f} dB da voz"
print(f"ok -> audio/final_mix_e2.wav ({desc})")
