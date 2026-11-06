"""Teste do trilha_tng.py contra a referência TNG ("Mark Goldbridge", 74,8 s): usa a voz da própria referência (stem vocals do
Demucs) e a linha do tempo medida (break, stops, drops, hits, rolls, cliques e obturadores de sfx_linha_do_tempo.json), roda o
trilha_tng.py num projeto falso e compara a mix com ref/ref.wav com as mesmas réguas dos relatórios (analise/som/a1).

uso: <kit>/.venv/Scripts/python.exe trilha_tng_teste.py --ref <pasta com ref.wav, stems/, words.json>
                                                         --sfx <sfx_linha_do_tempo.json> --saida <pasta de teste>
Saída: <saida>/proj (projeto falso + áudios), <saida>/comparacao.json e a tabela no terminal.
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, lfilter, butter, sosfilt

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
A = sys.argv[1:]
opt = lambda k, d: A[A.index(k) + 1] if k in A else d
SP = "C:/Users/USER/AppData/Local/Temp/claude/ab180335d60190b3/4fdab902-6664-4b55-8e94-20c8c7a3dab7/scratchpad"
REF = opt("--ref", SP + "/ref")
SFXJ = opt("--sfx", SP + "/analise/aprofundar_1/sfx_linha_do_tempo.json")
OUT = opt("--saida", SP + "/tng_som_teste")
P = os.path.join(OUT, "proj")
for d in ("render", "out", "audio"):
    os.makedirs(os.path.join(P, d), exist_ok=True)
SKILL = os.path.dirname(os.path.abspath(__file__))

# ---------------- projeto falso ----------------
mix_ref, sr_ref = sf.read(os.path.join(REF, "ref.wav"), always_2d=True)
VD = round(len(mix_ref) / sr_ref, 3)
W = json.load(open(os.path.join(REF, "words.json"), encoding="utf-8"))["words"]
tim = {"videoDur": VD, "beats": [{"id": "B01", "text": " ".join(w["w"] for w in W), "start": W[0]["s"], "end": W[-1]["e"],
                                  "words": [{"w": w["w"], "s": w["s"], "e": w["e"]} for w in W]}]}
open(os.path.join(P, "render", "timing.js"), "w", encoding="utf-8").write("window.TIMING = " + json.dumps(tim) + ";\n")
voz, _ = sf.read(os.path.join(REF, "stems", "vocals.wav"), always_2d=True)
voz48 = resample_poly(voz, 160, 147, axis=0)
sf.write(os.path.join(P, "audio", "voice.wav"), voz48.astype(np.float32), 48000, subtype="FLOAT")
sf.write(os.path.join(P, "audio", "sfx_bus.wav"), np.zeros((int(VD * 48000), 2), np.float32), 48000, subtype="FLOAT")
SF = json.load(open(SFXJ, encoding="utf-8"))
ev = [{"t": 5.65, "type": "tng:break"}, {"t": 10.40, "type": "tng:drop"},
      {"t": 26.3, "type": "tng:stop", "d": .6}, {"t": 27.0, "type": "tng:drop"},
      {"t": 44.4, "type": "tng:stop", "d": .7}, {"t": 45.2, "type": "tng:drop"},
      {"t": 17.8, "type": "tng:hit"}, {"t": 59.0, "type": "tng:hit"}, {"t": 68.0, "type": "tng:hit"},
      {"t": 54.45, "type": "tng:roll", "d": .95}, {"t": 56.908, "type": "tng:roll", "d": 2.288}, {"t": 63.7, "type": "tng:roll", "d": .8},
      {"t": 74.1, "type": "tng:fim", "d": .7},
      {"t": 5.1667, "type": "tng:rajada", "d": .875},
      {"t": 3.0, "type": "tr:cut"}, {"t": 4.0, "type": "sfx", "k": "paper", "g": 0}]          # tipos do kit no meio: devem ser ignorados
for x in SF:
    t = round(x["t_timeline_s"], 4)
    if x["sfx"].startswith("A"):
        ev.append({"t": t, "type": "tng:clique"})
    elif not (5.1 <= t <= 6.05):                                      # a montagem 5,17–6,04 é a rajada
        ev.append({"t": t, "type": "tng:obturador"})
json.dump({"videoDur": VD, "events": sorted(ev, key=lambda e: e["t"])}, open(os.path.join(P, "out", "events.json"), "w", encoding="utf-8"), indent=1)
r = subprocess.run([sys.executable, os.path.join(SKILL, "trilha_tng.py"), "--stems"], cwd=P, capture_output=True, text=True, encoding="utf-8", errors="replace")
print(r.stdout[-3000:], r.stderr[-3000:])
if r.returncode:
    sys.exit("trilha_tng.py falhou")

# ---------------- réguas (as mesmas do a1 / aprofundar_1) ----------------
import librosa  # noqa: E402


def kfilt(x, fs):
    import math
    G = 3.999843853973347; f0 = 1681.974450955533; Q = 0.7071752369554196
    K = math.tan(math.pi * f0 / fs); Vh = 10 ** (G / 20); Vb = Vh ** 0.4996667741545416; a0 = 1 + K / Q + K * K
    b = [(Vh + Vb * K / Q + K * K) / a0, 2 * (K * K - Vh) / a0, (Vh - Vb * K / Q + K * K) / a0]; a = [1, 2 * (K * K - 1) / a0, (1 - K / Q + K * K) / a0]
    y = lfilter(b, a, x, axis=0); f0 = 38.13547087602444; Q = 0.5003270373238773; K = math.tan(math.pi * f0 / fs)
    return lfilter([1, -2, 1], [1, 2 * (K * K - 1) / (1 + K / Q + K * K), (1 - K / Q + K * K) / (1 + K / Q + K * K)], y, axis=0)


def lufs_int(x, fs):
    y = kfilt(x, fs); blk = int(.4 * fs); hop = int(.1 * fs)
    z = np.array([np.mean(y[i:i + blk] ** 2, axis=0).sum() for i in range(0, len(y) - blk, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-12); g = z[l > -70]; lg = -0.691 + 10 * np.log10(g.mean())
    return -0.691 + 10 * np.log10(g[(-0.691 + 10 * np.log10(g)) > lg - 10].mean())


def ebur(path):
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    g = lambda k: float(next(l.split(":")[1].split()[0] for l in reversed(e.splitlines()) if l.strip().startswith(k + ":")))
    return g("I"), g("LRA"), g("Peak")


dbr = lambda x: 10 * np.log10(np.mean(np.square(x)) + 1e-20)


def mede(voz, bass, drums, other, mixpath, sr):
    n = min(len(voz), len(bass), len(drums), len(other)); voz, bass, drums, other = voz[:n], bass[:n], drums[:n], other[:n]
    mus = bass + drums + other; t = np.arange(n) / sr
    fala = np.zeros(n, bool)
    for w in W:
        fala[int(w["s"] * sr):int(w["e"] * sr)] = True
    vr = dbr(voz[fala]); R = {}
    R["I"], R["LRA"], R["TP"] = ebur(mixpath)
    R["voz_LUFS"] = lufs_int(voz, sr); R["mus_LUFS"] = lufs_int(mus[t < 73.9], sr); R["mus_menos_voz_LU"] = R["mus_LUFS"] - R["voz_LUFS"]
    R["mus_menos_voz_RMS"] = dbr(mus[t < 73.9]) - vr
    cheia = (t < 73.9) & ~((t >= 5.65) & (t < 10.40)) & ~((t >= 26.3) & (t < 27.0)) & ~((t >= 44.4) & (t < 45.2))
    R["cama_cheia_RMS"] = dbr(mus[cheia]) - vr
    for k, x in (("bass", bass), ("drums", drums), ("other", other)):
        R[k + "_RMS"] = dbr(x[t < 73.9]) - vr
    S_ = np.abs(librosa.stft(mus.mean(1).astype(np.float32), n_fft=8192, hop_length=4096)) ** 2
    f = librosa.fft_frequencies(sr=sr, n_fft=8192); Pw = S_.sum(1); tot = Pw.sum()
    R["pct_lt60"] = 100 * Pw[(f >= 20) & (f < 60)].sum() / tot; R["pct_lt120"] = 100 * Pw[(f >= 20) & (f < 120)].sum() / tot
    R["centroide"] = float((Pw * f).sum() / tot)
    for nm, a, b in (("intro", 0, 5.65), ("break", 5.7, 10.35), ("A", 10.45, 26.2), ("stop1", 26.3, 26.9), ("B", 27.05, 44.3),
                     ("stop2", 44.45, 45.05), ("C", 45.25, 73.9)):
        m = (t >= a) & (t < b); R["sec_" + nm] = dbr(mus[m]) - vr
    def pk(x, t0):
        i0, i1 = int((t0 - .05) * sr), int((t0 + .3) * sr); w = int(.1 * sr); y = (x[i0:i1] ** 2).mean(1)
        return 10 * np.log10(np.convolve(y, np.ones(w) / w, "valid").max() + 1e-20)
    secrms = {"A": R["sec_A"], "B": R["sec_B"], "C": R["sec_C"]}
    for nm, tt, s in (("drop1", 10.4, "A"), ("drop2", 27.0, "B"), ("drop3", 45.2, "C"), ("hit1", 17.8, "A"), ("hit2", 59.0, "C"), ("hit3", 68.0, "C")):
        R[nm + "_sobre_cama"] = pk(mus, tt) - vr - secrms[s]
        R[nm + "_drums_sobre_media"] = pk(drums, tt) - dbr(drums[t < 73.9])
    def corr(x):
        return float(np.corrcoef(x[:, 0], x[:, 1])[0, 1]) if np.std(x[:, 0]) > 0 else 1.0
    R["corr_other"], R["corr_bass"], R["corr_drums"], R["corr_musica"] = corr(other), corr(bass), corr(drums), corr(mus)
    # corte do 808 no break: nível do baixo 0,1–0,2 s depois contra 0,3 s antes
    i = lambda x: int(x * sr)
    R["break_corte_dB"] = dbr(bass[i(5.75):i(5.85)]) - dbr(bass[i(5.35):i(5.65)])
    R["fim_queda_dB"] = dbr(mus[i(74.65):i(74.78)]) - dbr(mus[i(73.95):i(74.1)])
    y = (drums + bass).mean(1).astype(np.float32); y22 = librosa.resample(y, orig_sr=sr, target_sr=22050)
    oenv = librosa.onset.onset_strength(y=y22, sr=22050, hop_length=256)
    tempo, _ = librosa.beat.beat_track(onset_envelope=oenv, sr=22050, hop_length=256, start_bpm=120)
    R["bpm_beat_track"] = float(np.atleast_1d(tempo)[0])
    ac = librosa.autocorrelate(oenv - oenv.mean(), max_size=int(22050 / 256 * 3)); lags = np.arange(len(ac)) * 256 / 22050
    mk = (lags > .25) & (lags < 2.6); j = int(np.argmax(ac * mk)); R["bpm_autocorr"] = 60 / lags[j]
    yb = librosa.resample(bass.mean(1).astype(np.float32), orig_sr=sr, target_sr=22050)
    f0, _, _ = librosa.pyin(yb, fmin=25, fmax=200, sr=22050, frame_length=4096, hop_length=1024)
    fv = f0[~np.isnan(f0)]
    u, c = np.unique(librosa.hz_to_note(fv), return_counts=True) if len(fv) else ([], [])
    R["notas_808"] = ", ".join(f"{u[k]}:{c[k]}" for k in np.argsort(-np.asarray(c))[:6]) if len(fv) else "-"
    R["f0_808_med"] = float(np.median(fv)) if len(fv) else 0
    return R


st = {k: sf.read(os.path.join(REF, "stems", k + ".wav"), always_2d=True)[0] for k in ("vocals", "bass", "drums", "other")}
print("medindo a referência...")
RR = mede(st["vocals"], st["bass"], st["drums"], st["other"], os.path.join(REF, "ref.wav"), sr_ref)
S = lambda k: sf.read(os.path.join(P, "audio", "tng_stems", k + ".wav"), always_2d=True)[0]
print("medindo a mix do trilha_tng...")
MM = mede(S("voz"), S("bass"), S("drums"), S("other"), os.path.join(P, "audio", "final_mix_tng.wav"), 48000)

# ---------------- SFX: nível (RMS 10 ms) contra a mediana da voz, forma, estéreo e tempo ----------------
vz = S("voz").mean(1); fx = S("sfx"); sr = 48000
fr = len(vz) // 480; v10 = 10 * np.log10((vz[:fr * 480].reshape(fr, 480) ** 2).mean(1) + 1e-14)
med10 = float(np.median(v10[v10 > np.percentile(v10, 99) - 30]))
def p10(x, a, b):
    y = (x[int(a * sr):int(b * sr)] ** 2).mean(1); c = np.convolve(y, np.ones(480) / 480, "valid")
    return 10 * np.log10(c.max() + 1e-20), (int(np.argmax(c)) + 240) / sr + a
cl = [round(x["t_timeline_s"], 4) for x in SF if x["sfx"].startswith("A")]
ob = [round(x["t_timeline_s"], 4) for x in SF if x["sfx"].startswith("B") and not (5.1 <= x["t_timeline_s"] <= 6.05)]
iso = [t for t in cl if all(abs(t - u) > .2 for u in ob) and not (5.1 <= t <= 6.1)]
def inicio(x, a, b):
    """1ª amostra a -20 dB do pico na janela (início do som), em s"""
    y = np.abs(x[int(a * sr):int(b * sr)]).max(1); return (int(np.argmax(y > y.max() * .1)) + int(a * sr)) / sr
lv_cl = [(p10(fx, t - .002, t + .02)[0], inicio(fx, t - .002, t + .02)) for t in iso]
lv_ob = [(p10(fx, t + .065, t + .1)[0], inicio(fx, t + .07, t + .1)) for t in ob]
lv_raj = [p10(fx, 5.1667 + k * .125 + .065, 5.1667 + k * .125 + .1) for k in range(8)]
M0 = {"obt_fraco_ms": float(np.median([(inicio(fx, t + .03, t + .07) - t) * 1000 for t in ob]))}
seg = fx[int(iso[3] * sr):int((iso[3] + .02) * sr)]
F = np.fft.rfftfreq(len(seg) * 8, 1 / sr); Pc = (np.abs(np.fft.rfft(seg, n=len(seg) * 8, axis=0)) ** 2).sum(1)
band = lambda a, b: 100 * Pc[(F >= a) & (F < b)].sum() / Pc.sum()
hpf = butter(4, 1500, "high", fs=sr, output="sos"); sh = sosfilt(hpf, seg, axis=0)
M = {"clique_rel_voz": float(np.median([l for l, _ in lv_cl]) - med10), "clique_atraso_ms": float(np.median([(tp - t) * 1000 for (_, tp), t in zip(lv_cl, iso)])),
     "obt_rel_voz": float(np.median([l for l, _ in lv_ob]) - med10), "obt_forte_ms": float(np.median([(tp - t) * 1000 for (_, tp), t in zip(lv_ob, ob)])),
     "rajada_rel_voz": float(np.median([l for l, _ in lv_raj]) - med10),
     "clique_centroide": float((Pc * F).sum() / Pc.sum()), "clique_2_8k": band(2000, 8000), "clique_8k+": band(8000, 24000), "clique_lt300": band(0, 300),
     "clique_corr_LR_hp1k5": float(np.corrcoef(sh[:, 0], sh[:, 1])[0, 1]),
     "obt_corr_LR": float(np.corrcoef(fx[int((ob[0] + .04) * sr):int((ob[0] + .11) * sr), 0], fx[int((ob[0] + .04) * sr):int((ob[0] + .11) * sr), 1])[0, 1])}
from scipy.signal import hilbert  # noqa: E402
envc = np.abs(hilbert(seg, axis=0)).sum(1); envd = 20 * np.log10(envc / envc.max() + 1e-9)
M["clique_dur_10dB_ms"] = (np.max(np.where(envd > -10)[0]) - np.min(np.where(envd > -10)[0])) / sr * 1000
M["clique_dur_20dB_ms"] = (np.max(np.where(envd > -20)[0]) - np.min(np.where(envd > -20)[0])) / sr * 1000
M.update(M0)
side = (seg[:, 0] - seg[:, 1]) / 2; mid = (seg[:, 0] + seg[:, 1]) / 2; M["clique_lado_meio_dB"] = 10 * np.log10((side ** 2).sum() / (mid ** 2).sum())

# ---------------- tabela ----------------
ALVO_SFX = {"clique_rel_voz": "-14 (coerente -14,7)", "obt_rel_voz": "-11", "rajada_rel_voz": "-13…-15 (ganho -1,4 vs +3,1 dB)", "clique_atraso_ms": "0",
            "obt_forte_ms": "+77", "clique_centroide": "~5700", "clique_2_8k": "47", "clique_8k+": "28", "clique_lt300": "2",
            "clique_corr_LR_hp1k5": "+0,15…+0,45", "obt_corr_LR": "+0,99", "clique_dur_10dB_ms": "~4", "clique_dur_20dB_ms": "~11",
            "obt_fraco_ms": "+51", "clique_lado_meio_dB": "-1…-4"}
linhas = [("mix I (LUFS)", "I"), ("mix LRA (LU)", "LRA"), ("mix pico verdadeiro (dBTP)", "TP"), ("voz LUFS", "voz_LUFS"),
          ("música − voz (LU, K)", "mus_menos_voz_LU"), ("música − voz (dB RMS, 0–73,9 s)", "mus_menos_voz_RMS"),
          ("cama cheia − voz (dB RMS, sem break/stop)", "cama_cheia_RMS"), ("baixo − voz (dB RMS)", "bass_RMS"),
          ("bateria − voz (dB RMS)", "drums_RMS"), ("other (pad/sino) − voz (dB RMS)", "other_RMS"),
          ("% energia da música < 60 Hz", "pct_lt60"), ("% energia da música < 120 Hz", "pct_lt120"), ("centroide da música (Hz)", "centroide"),
          ("seção intro − voz", "sec_intro"), ("break − voz", "sec_break"), ("seção A − voz", "sec_A"), ("stop 1 − voz", "sec_stop1"),
          ("seção B − voz", "sec_B"), ("stop 2 − voz", "sec_stop2"), ("seção C − voz", "sec_C"),
          ("drop 10,40: pico 100 ms − cama", "drop1_sobre_cama"), ("drop 27,0", "drop2_sobre_cama"), ("drop 45,2", "drop3_sobre_cama"),
          ("hit 17,8", "hit1_sobre_cama"), ("hit 59,0", "hit2_sobre_cama"), ("hit 68,0", "hit3_sobre_cama"),
          ("drop 10,40: bateria pico − média", "drop1_drums_sobre_media"), ("drop 27,0: bateria", "drop2_drums_sobre_media"),
          ("drop 45,2: bateria", "drop3_drums_sobre_media"),
          ("corte do 808 no break (0,1–0,2 s depois)", "break_corte_dB"), ("queda no fim (74,65 vs 74,0)", "fim_queda_dB"),
          ("corr L/R pad/sino (other)", "corr_other"), ("corr L/R baixo", "corr_bass"), ("corr L/R bateria", "corr_drums"),
          ("corr L/R música", "corr_musica"), ("BPM beat_track (drums+bass)", "bpm_beat_track"), ("BPM autocorrelação", "bpm_autocorr"),
          ("808: F0 mediana (Hz)", "f0_808_med"), ("808: notas (pyin)", "notas_808")]
fmt = lambda x: f"{x:+.1f}" if isinstance(x, float) and abs(x) < 1000 else (f"{x:.0f}" if isinstance(x, float) else str(x))
print(f"\n{'medida':44s} | {'referência':>22s} | {'trilha_tng':>22s}")
print("-" * 96)
for nome, k in linhas:
    print(f"{nome:44s} | {fmt(RR[k]):>22s} | {fmt(MM[k]):>22s}")
for k, v in M.items():
    print(f"{k:44s} | {ALVO_SFX[k]:>22s} | {fmt(v):>22s}")
json.dump({"referencia": RR, "trilha_tng": MM, "sfx": M}, open(os.path.join(OUT, "comparacao.json"), "w", encoding="utf-8"), indent=1, default=str)
print("ok ->", os.path.join(OUT, "comparacao.json"))
