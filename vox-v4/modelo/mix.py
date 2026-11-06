"""Áudio final: voz tratada + efeitos táteis (sem trilha). Resultado em -14 LUFS, pico -2 dBTP.

uso:
  python mix.py                 voz + sons táteis (roda som.py antes, se audio/sfx_bus.wav não existir ou estiver velho)
  python mix.py --so-voz        só a voz
  python mix.py --nivel 3       repassa o ajuste de volume dos efeitos para o som.py (dB; negativo = mais discreto)
Saída: audio/final_mix.wav (PCM 16 bits, 48 kHz, estéreo) + medição EBU R128 impressa no fim.
"""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ROOT, "audio")
os.makedirs(A, exist_ok=True)
args = sys.argv[1:]
SO_VOZ = "--so-voz" in args
NIVEL = args[args.index("--nivel") + 1] if "--nivel" in args else None
# trilha (opcional): python mix.py --trilha audio/trilha_v2.wav [--trilha-db -17] [--saida audio/final_mix_v2.wav]
#   a música fica X LU abaixo da voz e abaixa mais 5 dB enquanto ele fala (ducking com ataque 60 ms / soltura 400 ms)
TRILHA = args[args.index("--trilha") + 1] if "--trilha" in args else None
TRILHA_DB = float(args[args.index("--trilha-db") + 1]) if "--trilha-db" in args else -17.0
SAIDA = args[args.index("--saida") + 1] if "--saida" in args else None


def ff(*a, capture=False):
    r = subprocess.run(["ffmpeg", "-hide_banner", *a], capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        sys.exit(r.stderr[-2000:])
    return r.stderr if capture else None


def loud_json(path):
    err = ff("-i", path, "-af", "loudnorm=I=-14:TP=-2:LRA=11:print_format=json", "-f", "null", "-", capture=True)
    return json.loads(err[err.rfind("{"):err.rfind("}") + 1])


tim = open(os.path.join(ROOT, "render", "timing.js"), encoding="utf-8").read()
VD = float(re.search(r'videoDur"?\s*:\s*([0-9.]+)', tim).group(1))
voice = os.path.join(A, "voice.wav")
# 1) voz: mesmo tratamento de todas as edições (passa-altas, EQ leve, compressor suave)
ff("-v", "error", "-y", "-i", os.path.join(ROOT, "work", "cut_audio.wav"), "-af",
   "pan=mono|c0=0.5*c0+0.5*c1,highpass=f=70,equalizer=f=250:t=q:w=1.0:g=-1.5,equalizer=f=3500:t=q:w=1.2:g=1.5,"
   f"acompressor=threshold=-20dB:ratio=2.5:attack=8:release=100:makeup=1,pan=stereo|c0=c0|c1=c0,apad=whole_dur={VD},atrim=0:{VD}",
   "-ar", "48000", "-c:a", "pcm_f32le", voice)
v, sr = sf.read(voice, dtype="float64")
if v.ndim == 1:
    v = np.stack([v, v], 1)
# 2) voz sozinha em -14 LUFS (ganho linear); os efeitos entram com nível absoluto por baixo dela
vi = float(loud_json(voice)["input_i"])
g = 10 ** ((-14 - vi) / 20)
mix = v * g
if not SO_VOZ:
    bus = os.path.join(A, "sfx_bus.wav")
    ev = os.path.join(ROOT, "out", "events.json")
    if NIVEL is not None or not os.path.exists(bus) or (os.path.exists(ev) and os.path.getmtime(ev) > os.path.getmtime(bus)):
        subprocess.run([sys.executable, os.path.join(ROOT, "som.py")] + ([NIVEL] if NIVEL is not None else []), check=True)
    s, _ = sf.read(bus, dtype="float64")
    n = min(len(mix), len(s))
    mix = mix[:n] + s[:n]
if TRILHA and not SO_VOZ:
    tm, tsr = sf.read(TRILHA, dtype="float64")
    if tm.ndim == 1:
        tm = np.stack([tm, tm], 1)
    if tsr != sr:
        sys.exit(f"trilha precisa estar em {sr} Hz")
    tm = np.pad(tm, ((0, max(0, len(mix) - len(tm))), (0, 0)))[:len(mix)]
    ti = float(loud_json(TRILHA)["input_i"])
    gm = 10 ** ((-14 + TRILHA_DB - ti) / 20)
    # ducking: voz ativa (envelope de 50 ms acima de -38 dBFS) suavizado a 100 Hz
    vm = (v[:, 0] * g) ** 2
    hop = sr // 100
    e = np.sqrt(np.add.reduceat(vm, np.arange(0, len(vm), hop)) / hop)
    act = (20 * np.log10(e + 1e-9) > -38).astype(float)
    sm, cur = np.zeros_like(act), 0.0
    for k, a in enumerate(act):
        cur += (a - cur) * (1 - np.exp(-1 / (6 if a > cur else 40)))      # 60 ms sobe / 400 ms desce
        sm[k] = cur
    duck = 10 ** (-5 * np.interp(np.arange(len(mix)) / hop, np.arange(len(sm)), sm) / 20)
    mix = mix + tm * gm * duck[:, None]
    print(f"trilha {ti:.1f} LUFS -> {-14 + TRILHA_DB:.1f} LUFS (abaixa 5 dB na fala)")
pre = os.path.join(A, "premix.wav")
sf.write(pre, mix.astype(np.float32), sr, subtype="FLOAT")
print(f"voz {vi:.1f} LUFS -> ganho {20 * np.log10(g):+.1f} dB" + ("" if SO_VOZ else " + sons táteis"))
# 3) normalização final (2 passagens, linear) + limitador
d = loud_json(pre)
out = SAIDA or os.path.join(A, "final_mix.wav")
ff("-v", "error", "-y", "-i", pre, "-af",
   f"loudnorm=I=-14:TP=-2:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:"
   f"measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true,alimiter=limit=0.78:attack=2:release=50:level=false",
   "-ar", "48000", "-c:a", "pcm_s16le", out)
rep = ff("-i", out, "-af", "ebur128=peak=true", "-f", "null", "-", capture=True)
for ln in rep.splitlines():
    if re.match(r"^\s+(I:|Peak:|LRA:)", ln):
        print(" ".join(ln.split()))
print("ok", out)
