"""Som do formato edit-tng (The Numbers Game / TNG), todo sintetizado aqui: nada de gravação de terceiros nem faixa CC0.
Molde medido no reel "Mark Goldbridge" do TNG (04/11/2026; relatórios analise/som e analise/aprofundar_1):
- trap escuro / drill em meio-tempo, ~78 BPM, Dó menor. O 808 é sub mono (C1 32,7 · D#1 38,9 · F1 43,7 · G1 49 Hz, B0 de passagem),
  sustentado 2–3 s; ~73 % da energia da música fica abaixo de 60 Hz e ~94 % abaixo de 120 Hz. Clap nos tempos 2 e 4 (corpo em
  ~200 Hz + ruído até 8 kHz), hats em 16 avos, rolls em tercina de fusa (~64 ms), pad/sino em Dó menor natural largo (corr L/R ~0,4);
- a música começa CHEIA no quadro 0 (sem fade-in) e fica ~8 dB RMS abaixo da voz (~-11 LU), constante, SEM ducking. A dinâmica
  vem dos eventos do arranjo, presos às palavras pelo motor das cenas;
- SFX: clique de texto (~4 ms, brilhante, estéreo largo, voz -14 dB) e obturador (clique duplo mono em +51/+77 ms, voz -11 dB).
  Nada de whoosh e nada de som em corte comum.
Seções (uma nova a cada tng:drop; a grade recomeça no drop): A0 até o 1º drop (808 em Dó, hats e clap leves, quase sem kick)
· A depois do 1º (batida cheia, Dó) · B depois do 2º (hats retos, 808 em Ré) · C depois do 3º (808 em loop C–D#–F, ~2 s por nota,
+ pad em acordes); daí em diante alterna B e C.

uso (de dentro da pasta do projeto; o pipeline.py fechar chama sozinho pelo etapas.json):
  python <skill>/trilha_tng.py [--sem-musica] [--stems]
Lê out/events.json (videoDur + eventos 'tng:*' que o motor das cenas empurra; os outros tipos são ignorados), render/timing.js
(palavras: nível da voz e eventos do trilha.json por palavra), trilha.json (opcional) e audio/voice.wav + audio/sfx_bus.wav do mix.py.
Saída: audio/final_mix_tng.wav (-14 LUFS integrado, pico verdadeiro <= -1 dBTP, PCM 16 bits, 48 kHz, termina em videoDur) e
audio/musica_tng.wav (só a trilha, no nível em que está na mix, float). --stems grava audio/tng_stems/*.wav (teste).
SEM_MUSICA=1 (ou --sem-musica) = só voz + SFX.

Eventos (t em segundos da linha do tempo do vídeo):
  tng:break {t}        o grave e a bateria saem (808 corta em 40 ms; ficam hats em tercina no 1º tempo e hats bem baixos) e a
                       música fica ~24 dB abaixo da voz (pad/sino + ar) até o próximo drop
  tng:drop  {t}        kick + 808 com pico ~8,5 dB acima da cama (RMS de 100 ms) e a música volta cheia, na seção seguinte
  tng:stop  {t, d}     808 e kick mudos por d s (padrão 0,65); clap e hats seguem (na referência a bateria cai só 3–10 dB
                       no stop); drop logo depois emenda o silêncio
  tng:hit   {t, k, g}  batida avulsa: k = 'kick' (kick + 808, padrão) ou 'clap'; g = dB a mais/menos
  tng:roll  {t, d}     roll de hats em tercina de fusa (BEAT/12 ~ 64 ms) cobrindo [t, t+d], no lugar dos hats normais
  tng:fim   {t, d}     fade da música a partir de t: segura e cai, -20 dB em d s (padrão: d até videoDur). Use t = início do fade
                       para branco (~0,2 s depois da última palavra). Sem tng:fim: fade nos últimos 0,7 s
  tng:clique {t, g}    clique de texto exatamente em t (quadro em que a palavra aparece)
  tng:obturador {t, g} obturador: clique fraco em t+0,051 e forte em t+0,077 (t = corte para a foto)
  tng:rajada {t, d, g} obturadores a cada 125 ms em [t, t+d] (montagem-relâmpago), 4 dB abaixo do obturador avulso

trilha.json (opcional, na raiz do projeto):
  {"bpm": 78, "tom": "Cm",
   "cama": -7.9,        # dB RMS da música nas seções cheias (fora de break/stop) em relação ao RMS da voz nas palavras
   "quebra": -24,       # dB RMS da música no break, em relação à voz (referência: -23,5 a -25)
   "drop": 8.5, "hit": 6,                          # pico (RMS 100 ms) sobre a cama da seção
   "clique": -14, "obturador": -11, "rajada": -4,  # SFX: RMS de 10 ms em relação à mediana da voz (rajada: em relação ao obturador)
   "secoes": ["A0", "A", "B", "C"],
   "eventos": [{"type": "tng:hit", "b": "B12", "w": "youtube", "dt": 0}],   # eventos extras por beat/palavra
   "sfx_kit": true}     # false = ignora audio/sfx_bus.wav (sons do kit)
O projeto TNG precisa de "env": {"SOM_CORTE": "0", "NIVEL_SFX": "-120"} no etapas.json para o som.py do kit não pôr som nenhum.
"""
import json, os, subprocess, sys, unicodedata
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, lfilter, fftconvolve, resample_poly
from scipy.ndimage import minimum_filter1d

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.getcwd()
J = lambda *p: os.path.join(ROOT, *p)
if not os.path.exists(J("out", "events.json")):
    sys.exit("rode de dentro da pasta do projeto (falta out/events.json: rode render.py events)")
ARGS = sys.argv[1:]
SEM = "--sem-musica" in ARGS or os.environ.get("SEM_MUSICA") == "1"
STEMS = "--stems" in ARGS
SR = 48000
TJ = {}
if os.path.exists(J("render", "timing.js")):
    _tj = open(J("render", "timing.js"), encoding="utf-8").read()
    TJ = json.loads(_tj[_tj.index("{"):_tj.rindex("}") + 1])
EVJ = json.load(open(J("out", "events.json"), encoding="utf-8"))
CFG = json.load(open(J("trilha.json"), encoding="utf-8")) if os.path.exists(J("trilha.json")) else {}
END = float(EVJ.get("videoDur") or TJ["videoDur"])
N = int(round(END * SR))
t_all = np.arange(N) / SR
rng = np.random.default_rng(78)
lp = lambda x, f, o=2: sosfilt(butter(o, f, "low", fs=SR, output="sos"), x, axis=0)
hp = lambda x, f, o=2: sosfilt(butter(o, f, "high", fs=SR, output="sos"), x, axis=0)
bp = lambda x, a, b, o=2: sosfilt(butter(o, [a, b], "band", fs=SR, output="sos"), x, axis=0)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
db = lambda d: 10 ** (d / 20)
rms = lambda x: float(np.sqrt(np.mean(np.square(x)))) if np.size(x) else 0.0
I = lambda t: int(np.clip(round(t * SR), 0, N))
_n = lambda x: "".join(ch for ch in unicodedata.normalize("NFD", str(x).lower()) if unicodedata.category(ch) != "Mn")
BEATS = {b["id"]: b for b in TJ.get("beats", [])}


def mavg(a, n):
    n = max(1, int(n))
    if n == 1 or len(a) <= n:
        return np.asarray(a, np.float64)
    c = np.cumsum(np.insert(np.asarray(a, np.float64), 0, 0.0)); y = (c[n:] - c[:-n]) / n; p = n // 2
    return np.concatenate([np.full(p, y[0]), y, np.full(len(a) - len(y) - p, y[-1])])


def poe(bus, x, t, g=1.0):
    """soma o som x (mono ou estéreo) no tempo t do bus"""
    if bus.ndim == 2 and x.ndim == 1:
        x = np.stack([x, x], 1)
    i0 = int(round(t * SR))
    if i0 < 0:
        x, i0 = x[-i0:], 0
    m = min(len(x), len(bus) - i0)
    if m > 0:
        bus[i0:i0 + m] += x[:m] * g


def kfilt(x):
    """ponderação K (BS.1770) a 48 kHz"""
    x = lfilter([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585], x, axis=0)
    return lfilter([1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621], x, axis=0)


def lufs(x):
    """loudness integrado BS.1770 (soma dos canais, blocos de 400 ms com 75 % de sobreposição, portas -70 e -10)"""
    y = kfilt(x if x.ndim == 2 else x[:, None]); p = (y ** 2).sum(1)
    blk, hop = int(.4 * SR), int(.1 * SR)
    c = np.cumsum(np.insert(p, 0, 0.0))
    z = np.array([(c[i + blk] - c[i]) / blk for i in range(0, len(p) - blk, hop)])
    if not len(z):
        return -70.0
    z = z[-0.691 + 10 * np.log10(z + 1e-20) > -70]
    if not len(z):
        return -70.0
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[-0.691 + 10 * np.log10(z) > rel]
    return float(-0.691 + 10 * np.log10(z.mean()))


def pico_real(x):
    """pico verdadeiro (dBTP) com sobreamostragem 4x"""
    up = resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(max(float(np.abs(up).max()), float(np.abs(x).max()), 1e-12))


def limita(x, teto_db=-1.2, look=.0015, rel=.06):
    """limitador com antecipação pelo pico verdadeiro (4x): ganho <= o necessário em toda amostra, ataque de ~3 ms, soltura de 60 ms"""
    c = db(teto_db)
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
    pk = np.maximum(up[:4 * len(x)].reshape(-1, 4).max(1)[:len(x)], np.abs(x).max(1))
    req = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    if req.min() >= 1:
        return x, 0.0
    L = max(1, int(look * SR))
    g = mavg(minimum_filter1d(req, 2 * L + 1, mode="nearest"), 2 * L + 1)
    g = np.minimum(g, req)
    r = np.clip(1 - g, 0, 1)                                  # redução; soltura exponencial: máx(r[k]·d^(n-k))
    ld = -1.0 / (rel * SR); k = np.arange(len(r))
    with np.errstate(divide="ignore"):
        lr = np.log(r) - k * ld
    r2 = np.exp(np.maximum.accumulate(lr) + k * ld)
    g = 1 - np.clip(r2, 0, 1)
    return x * g[:, None], float(20 * np.log10(g.min()))


def palavra_t(bid, w=0):
    ws = BEATS[bid]["words"]
    x = ws[min(w, len(ws) - 1)] if isinstance(w, int) else next((p for p in ws if _n(p["w"]).startswith(_n(w))), None)
    if x is None:
        sys.exit(f"trilha.json: a palavra '{w}' não está no beat {bid}")
    return float(x["s"])


# ============================ eventos ============================
EV = [dict(e) for e in EVJ.get("events", []) if str(e.get("type", "")).startswith("tng:")]
for e in CFG.get("eventos", []):
    e = dict(e)
    if "t" not in e:
        if e.get("b") not in BEATS:
            sys.exit(f"trilha.json: beat {e.get('b')} não existe em render/timing.js")
        e["t"] = palavra_t(e["b"], e.get("w", 0)) + float(e.get("dt", 0))
    if not str(e.get("type", "")).startswith("tng:"):
        e["type"] = "tng:" + str(e.get("type"))
    EV.append(e)
CONHECIDOS = {"tng:break", "tng:drop", "tng:stop", "tng:hit", "tng:roll", "tng:fim", "tng:clique", "tng:obturador", "tng:rajada"}
estranhos = sorted({e["type"] for e in EV} - CONHECIDOS)
lista = lambda tipo: sorted((e for e in EV if e["type"] == tipo and 0 <= float(e["t"]) < END), key=lambda e: float(e["t"]))
drops = sorted({round(float(e["t"]), 4) for e in lista("tng:drop")})
breaks = [float(e["t"]) for e in lista("tng:break")]
stops = [(float(e["t"]), float(e.get("d", .65))) for e in lista("tng:stop")]
hits = [(float(e["t"]), str(e.get("k", "kick")), float(e.get("g") or 0)) for e in lista("tng:hit")]
rolls = [(float(e["t"]), float(e.get("d", .8))) for e in lista("tng:roll")]
fins = lista("tng:fim")
cliques = [(float(e["t"]), float(e.get("g") or 0)) for e in lista("tng:clique")]
obtur = [(float(e["t"]), float(e.get("g") or 0)) for e in lista("tng:obturador")]
rajadas = [(float(e["t"]), float(e.get("d") or .875), float(e.get("g") or 0)) for e in lista("tng:rajada")]

# ============================ voz (nível de referência de tudo) ============================
def le(nome, obrig=True):
    p = J("audio", nome)
    if not os.path.exists(p):
        if obrig:
            sys.exit(f"falta audio/{nome} (rode o mix.py antes)")
        return np.zeros((N, 2)), False
    x, sr = sf.read(p, dtype="float64", always_2d=True)
    if sr != SR:
        x = resample_poly(x, SR // np.gcd(SR, sr), sr // np.gcd(SR, sr), axis=0)
    x = x[:, :2] if x.shape[1] >= 2 else np.repeat(x, 2, 1)
    y = np.zeros((N, 2)); y[:min(N, len(x))] = x[:N]
    return y, True


v, _ = le("voice.wav")
v *= db(-14 - lufs(v))                                        # voz a -14 LUFS, como no mix.py (os sons do kit são calibrados assim)
vm = v.mean(1)
pal = [(float(w["s"]), float(w["e"])) for b in TJ.get("beats", []) for w in b.get("words", [])]
fala = np.zeros(N, bool)
for a, b in pal:
    fala[I(a):I(b)] = True
if fala.sum() < SR:                                           # sem palavras no timing.js: atividade pela energia
    act = mavg(np.clip(mavg(np.abs(vm), 2400) / (np.abs(vm).max() * .05 + 1e-12), 0, 1), 7200)
    fala = act > .5
rms_v = rms(v[fala]) if fala.any() else .05
fim_fala = max((b for _, b in pal), default=None) or (np.nonzero(fala)[0][-1] / SR if fala.any() else END)
fr = len(vm) // 480
v10 = 10 * np.log10((vm[:fr * 480].reshape(fr, 480) ** 2).mean(1) + 1e-14)
med10 = float(np.median(v10[v10 > np.percentile(v10, 99) - 30]))   # mediana do RMS de 10 ms da voz ativa (régua dos SFX)

# ============================ instrumentos ============================
def o808(m, dur):
    """808 sub: seno com 2º e 3º harmônicos (78/20/2 % da energia, como o stem da referência), ataque 1 semitom acima"""
    n = max(int(dur * SR), 32); s = np.arange(n) / SR
    f = hz(m) * 2 ** (np.exp(-s / .03) / 12)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + .5 * np.sin(2 * ph + .4) + .14 * np.sin(3 * ph + 1.1)
    return y * np.minimum(s / .004, 1) * (.74 + .26 * np.exp(-s / .3)) * np.clip((dur - s) / .07, 0, 1)


def kick(f0=110., f1=41., tau=.2, dur=.55):
    """kick de 808: varredura curta até ~41 Hz (63 % da energia da bateria abaixo de 60 Hz na referência)"""
    n = int(dur * SR); s = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-s / .022)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s / tau) * np.minimum(s / .0015, 1)
    y += hp(rng.normal(0, 1, n), 2500) * np.exp(-s / .002) * .25
    return y * np.clip((dur - s) / .02, 0, 1)


def clap():
    """clap: 3 estalos a ~9 ms + cauda, ruído 0,9–8 kHz meio largo, corpo em ~200 Hz"""
    n = int(.34 * SR); s = np.arange(n) / SR
    env = sum((s >= o) * np.exp(-np.maximum(s - o, 0) / (.0045 if k < 3 else .065)) * (.7 if k < 3 else 1.)
              for k, o in enumerate((0, .009, .018, .027)))
    com = rng.normal(0, 1, n)
    nz = np.stack([bp(.8 * com + .6 * rng.normal(0, 1, n), 900, 8000) * env for _ in range(2)], 1) * .6
    corpo = (bp(rng.normal(0, 1, n), 160, 280) * 1.8 + np.sin(2 * np.pi * 205 * s) * .5) * np.exp(-s / .045) * np.minimum(s / .001, 1)
    return nz + corpo[:, None]


def tique(dec, dur=.07):
    n = int(dur * SR); s = np.arange(n) / SR
    x = hp(rng.normal(0, 1, n), 6500, 4) * np.exp(-s / dec) * np.minimum(s / .0004, 1)
    x += bp(rng.normal(0, 1, n), 8500, 13000) * np.exp(-s / (dec * .6)) * .6
    return x / np.abs(x).max()


def pan(x, p):
    th = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], 1) * np.sqrt(2)


def sino(m, dur=3.0):
    """sino FM discreto: uma voz igual nos dois lados + uma desafinada diferente em cada (corr L/R ~0,5)"""
    n = int(dur * SR); s = np.arange(n) / SR; out = np.zeros((n, 2))
    voz_ = lambda f: (np.sin(2 * np.pi * f * s + 1.8 * np.exp(-s / .22) * np.sin(2 * np.pi * 3.5 * f * s)) * np.exp(-s / .85)
                      + .25 * np.sin(2 * np.pi * 2 * f * s) * np.exp(-s / .35))
    out += .7 * voz_(hz(m))[:, None]
    for ch, det in ((0, -.07), (1, .07)):
        out[:, ch] += .7 * voz_(hz(m) * 2 ** (det / 12))
    return out * (np.minimum(s / .004, 1) * np.clip((dur - s) / .3, 0, 1))[:, None]


def pad(notas, dur):
    """pad escuro: serra central igual em L e R + serras desafinadas diferentes em cada lado (corr ~0,4), passa-baixa ~1 kHz"""
    dur += .6; n = int(dur * SR); s = np.arange(n) / SR; out = np.zeros((n, 2))
    for m in notas:
        out += (2 * ((hz(m) * s + rng.uniform()) % 1) - 1)[:, None]
        for ch, d in ((0, -.1), (1, .1)):
            out[:, ch] += 2 * ((hz(m) * 2 ** (d / 12) * s + rng.uniform()) % 1) - 1
    out = lp(lp(out, 900), 1400) / max(len(notas), 1)
    return out * (np.minimum(s / .5, 1) * np.clip((dur - s) / .6, 0, 1))[:, None]


def impacto(m):
    """drop/hit: kick grande + 808 que cai de ~2,5x para a nota da seção (pico nos primeiros ~0,2 s)"""
    n = int(1.1 * SR); s = np.arange(n) / SR
    f = hz(m) * (1 + 1.5 * np.exp(-s / .03))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = (np.sin(ph) + .4 * np.sin(2 * ph + .3)) * np.minimum(s / .002, 1) * np.exp(-s / .32) * np.clip((1.1 - s) / .2, 0, 1)
    k = kick(140, 41, .22, .6); y[:len(k)] += k * 1.1
    return y


# ============================ seções, mudos e padrões ============================
TONS = {"Cm": 0, "C#m": 1, "Dbm": 1, "Dm": 2, "D#m": 3, "Ebm": 3, "Em": 4, "Fm": 5, "F#m": 6, "Gbm": 6, "Gm": -5, "G#m": -4, "Abm": -4,
        "Am": -3, "A#m": -2, "Bbm": -2, "Bm": -1}
TR = TONS.get(CFG.get("tom", "Cm"), 0)
BPM = float(CFG.get("bpm", 78)); BEAT = 60 / BPM; STEP = BEAT / 4; ROLL = BEAT / 12; CICLO = 32 * STEP
C1, B0, D1, Ds1, F1, G1 = 24, 23, 26, 27, 29, 31
CL = [(4, 1.), (12, 1.), (20, 1.), (28, 1.)]
PAD = {  # 32 passos de 16 avos (2 compassos). 808 (passo, nota, duração em passos); sino (passo, nota); pad (passo, notas, passos)
    "A0": dict(b808=[(0, C1, 15), (16, C1, 15)], kick=[], clap=[(p, .6) for p, _ in CL], hats=(1., .45, .7, .45), dobra=(),
               sino=[(0, 79), (6, 87), (12, 86), (20, 79), (26, 84)], pad=[(0, (60, 63, 67), 32)]),
    "A": dict(b808=[(0, C1, 14), (14, B0, 2), (16, C1, 10), (26, G1, 6)], kick=[0, 8, 14, 16, 24, 26], clap=CL, hats=(1., .45, .7, .45),
              dobra=(15, 31), sino=[(0, 79), (12, 86), (20, 87)], pad=[(0, (60, 63, 67), 32)]),
    "B": dict(b808=[(0, D1, 11), (11, D1, 5), (16, D1, 8), (24, C1, 2), (26, D1, 6)], kick=[0, 8, 11, 16, 24, 26], clap=CL,
              hats=(.95, .8, .9, .8), dobra=(), sino=[(8, 87), (24, 87)], pad=[(0, (69, 81), 32)]),
    "C": dict(b808=[(0, C1, 11), (11, Ds1, 11), (22, F1, 10)], kick=[0, 8, 11, 22, 24], clap=CL, hats=(1., 0, .7, 0), dobra=(),
              sino=[(0, 79), (22, 84)], pad=[(0, (60, 63, 67, 72), 11), (11, (63, 67, 70), 11), (22, (65, 68, 72), 10)]),
}
ALVO = {  # dB RMS de cada parte em relação ao RMS da voz, por seção (stems da referência; 'other' ~1 dB abaixo por causa do vazamento)
    "A0": {"bass": -8.7, "drums": -28.3, "other": -22.0},     # bateria 0,5 dB abaixo do stem: drops, hits e rolls somam por cima
    "A": {"bass": -7.5, "drums": -15.0, "other": -26.5},
    "B": {"bass": -10.4, "drums": -12.5, "other": -29.5},
    "C": {"bass": -11.8, "drums": -13.3, "other": -26.0},
}
SEQ = [s for s in CFG.get("secoes", ["A0", "A", "B", "C"]) if s in PAD] or ["A0", "A", "B", "C"]


def tipo_secao(i):
    if i < len(SEQ):
        return SEQ[i]
    cauda = SEQ[-2:] if len(SEQ) >= 2 else SEQ
    return cauda[(i - len(SEQ)) % len(cauda)]


off = 1 if any(d <= .02 for d in drops) else 0
lim = [0.0] + [d for d in drops if d > .02]
secoes = [(a, lim[i + 1] if i + 1 < len(lim) else END, tipo_secao(i + off)) for i, a in enumerate(lim)]
mudos = []                                                    # (início, fim, 'break'|'stop'): grave, kick e clap fora
for tb in breaks:
    mudos.append((tb, next((d for d in drops if d > tb + 1e-3), END), "break"))
for ts, d in stops:
    f = ts + d
    prox = next((x for x in drops if x > ts + 1e-3), None)
    if prox is not None and prox - f < .35:
        f = prox                                              # stop emendado no drop seguinte
    mudos.append((ts, min(f, END), "stop"))
em_mudo = lambda t: next((k for a, b, k in mudos if a <= t < b), None)
prox_mudo = lambda t: min([a for a, _, _ in mudos if a > t + 1e-4] + [END])
em_roll = lambda t: any(a <= t < a + d for a, d in rolls)

# ============================ síntese (buses crus) ============================
b808 = np.zeros(N); kk = np.zeros(N); cl = np.zeros((N, 2)); ht = np.zeros((N, 2)); ot = np.zeros((N, 2)); rl = np.zeros((N, 2))
HATS = [tique(.008) for _ in range(6)]
TICS = [tique(.0065, .05) for _ in range(6)]
if not SEM:
    nh = 0
    for a, b, tipo in secoes:
        P = PAD[tipo]; j = 0
        while a + j * CICLO < b - 1e-6:
            c0 = a + j * CICLO
            for s0, m, L in P["b808"]:
                ts = c0 + s0 * STEP
                if ts < b - .02 and not em_mudo(ts):
                    dur = min(L * STEP, b - ts, prox_mudo(ts) - ts + .04)
                    poe(b808, o808(m + TR, dur), ts)
            for s0 in P["kick"]:
                ts = c0 + s0 * STEP
                if ts < b - .02 and not em_mudo(ts):
                    poe(kk, kick(), ts)
            for s0, g in P["clap"]:                       # o clap segue no stop (sai só no break)
                ts = c0 + s0 * STEP
                if ts < b - .02 and em_mudo(ts) != "break":
                    poe(cl, clap(), ts, g)
            for s0, m in P["sino"]:
                ts = c0 + s0 * STEP
                if ts < b - .02:
                    poe(ot, sino(m + TR), ts, .5)
            for s0, notas, L in P["pad"]:
                ts = c0 + s0 * STEP
                if ts < b - .02:
                    poe(ot, pad([x + TR for x in notas], min(L * STEP, b - ts)), ts, .32)
            for s0 in range(32):
                ts = c0 + s0 * STEP
                if ts >= b - 1e-6:
                    break
                vel = P["hats"][s0 % 4]
                k = em_mudo(ts)
                if vel <= 0 or em_roll(ts):
                    continue
                if k == "break":
                    tb = max(x for x, _, kk_ in mudos if kk_ == "break" and x <= ts)
                    if ts - tb < BEAT:
                        continue                              # o 1º tempo do break é da tercina (abaixo)
                    vel *= .35                                # no stop os hats seguem (a referência tem "drums leves" ali)
                poe(ht, pan(HATS[nh % 6], .22 * np.sin(nh * 1.7)), ts, vel * .5); nh += 1
                if s0 in P["dobra"]:
                    poe(ht, pan(HATS[nh % 6], -.2), ts + STEP / 2, vel * .3); nh += 1
            j += 1
    for tb in breaks:                                         # hats em tercina no 1º tempo do break, caindo
        for k in range(6):
            if not em_roll(tb + k * BEAT / 6):
                poe(ht, pan(HATS[k % 6], .25 if k % 2 else -.25), tb + k * BEAT / 6, .45 * (1 - k / 7))
    for a, d in rolls:                                        # roll em tercina de fusa, crescendo
        n_ = int(np.floor(d / ROLL + 1e-6)) + 1
        for k in range(n_):
            poe(rl, pan(TICS[k % 6], .18 if k % 2 else -.18), a + k * ROLL, .4 * (.55 + .45 * k / max(n_ - 1, 1)))
    # sala: IR com parte comum aos dois lados (corr ~0,3) + "textura aguda" de ar (5–10 kHz) bem baixa, que fica no break
    n_ir = int(2.2 * SR); com = rng.normal(0, 1, n_ir)
    ir = np.stack([.55 * com + .835 * rng.normal(0, 1, n_ir) for _ in range(2)], 1) * np.exp(-np.arange(n_ir) / SR / .45)[:, None]
    ir = lp(ir, 5000); ir[:int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
    ot = ot + .5 * np.stack([fftconvolve(ot[:, c], ir[:, c])[:N] for c in range(2)], 1)
    ar = bp(.6 * rng.normal(0, 1, N)[:, None] + .8 * rng.normal(0, 1, (N, 2)), 5000, 10000) * (.6 + .4 * np.sin(2 * np.pi * t_all / 5.3))[:, None]
    ot += ar * rms(ot) * db(-9.5) / max(rms(ar), 1e-12)

# ============================ níveis: seção por seção, em relação à voz ============================
tid = np.zeros(N, np.int8); NOMES = sorted({t for _, _, t in secoes})
for a, b, tipo in secoes:
    tid[I(a):I(b)] = NOMES.index(tipo)
mud = np.zeros(N, bool)
for a, b, _ in mudos:
    mud[I(a):I(b)] = True


def env_mudo(tipos):
    """1 fora dos mudos; nos mudos desses tipos cai em 40 ms (cosseno), fica em 0 e volta em 2 ms"""
    g = np.ones(N); f = int(.04 * SR)
    for a, b, k in mudos:
        if k not in tipos:
            continue
        i0, i1 = I(a), I(b)
        seg = g[i0:min(i0 + f, N)]
        g[i0:i0 + len(seg)] = np.minimum(seg, np.cos(np.linspace(0, np.pi / 2, f))[:len(seg)])
        g[min(i0 + f, N):i1] = 0
        r_ = g[i1:min(i1 + 96, N)]; g[i1:i1 + len(r_)] = np.minimum(r_, np.linspace(0, 1, 96)[:len(r_)])
    return g


gm, gmc = env_mudo(("break", "stop")), env_mudo(("break",))   # 808 e kick saem no break e no stop; o clap só no break
bass = b808 * gm
drums = (kk * gm)[:, None] + cl * gmc[:, None] + ht
G = {}
if not SEM:
    for nome in NOMES:
        sel = (tid == NOMES.index(nome)) & ~mud
        if sel.sum() < .3 * SR:
            sel = tid == NOMES.index(nome)
        al = ALVO[nome]
        G[nome] = {p: (rms_v * db(al[p]) / max(rms(x[sel]), 1e-9) if rms(x[sel]) > 1e-9 else 0.0)
                   for p, x in (("bass", bass), ("drums", drums), ("other", ot))}
    env = lambda p, n: mavg(np.array([G[x][p] for x in NOMES])[tid], n)
    gb, gd, go = env("bass", .01 * SR), env("drums", .01 * SR), env("other", .15 * SR)
    bass = bass * gb; drums = drums * gd[:, None]; ot = ot * go[:, None]; rl = rl * gd[:, None]
    gq = np.ones(N)                                           # break: o que sobra (hats + pad/sino) fica em "quebra" dB da voz
    for a, b, k in mudos:
        if k != "break" or b - a < .2:
            continue
        i0, i1 = I(a), I(b)
        r_ = rms((drums + ot + rl)[i0:i1] + bass[i0:i1, None])
        if r_ > 1e-9:
            gq[i0:i1] = np.clip(rms_v * db(float(CFG.get("quebra", -24))) / r_, db(-15), db(6))
    gq = mavg(gq, .03 * SR)
    drums *= gq[:, None]; ot *= gq[:, None]; rl *= gq[:, None]
mus = bass[:, None] + drums + ot + rl
cama = {nome: rms(mus[(tid == NOMES.index(nome)) & ~mud]) for nome in NOMES} if not SEM else {}

# ============================ drops e hits (calibrados pelo pico de 100 ms) ============================
imp = np.zeros((N, 2))


def pk100(x):
    p = (x ** 2).mean(1) if x.ndim == 2 else x ** 2
    return float(np.sqrt(np.max(mavg(p, .1 * SR)))) if len(p) else 0.0


def calibra(y, t, alvo):
    """ganho do impacto para o pico (RMS de 100 ms) da música em [t-0,05; t+0,35] chegar ao alvo"""
    i0, i1 = I(t - .05), I(t + .35)
    base = mus[i0:i1] + imp[i0:i1]
    yy = np.zeros((i1 - i0, 2)); poe(yy, y, t - i0 / SR)
    lo, hi = -80.0, 30.0
    for _ in range(36):
        mid = (lo + hi) / 2
        if pk100(base + db(mid) * yy) < alvo:
            lo = mid
        else:
            hi = mid
    return db((lo + hi) / 2)


n_imp = 0
if not SEM:
    for d in drops:
        nome = next((tp for a, _, tp in secoes if abs(a - d) < 1e-3), NOMES[tid[min(I(d), N - 1)]])
        nota = PAD[nome]["b808"][0][1] + TR
        y = impacto(nota)
        g = calibra(y, d, cama.get(nome, rms_v * db(-8)) * db(float(CFG.get("drop", 8.5))))
        poe(imp, y, d, g); n_imp += 1
    for t, k, gdb in hits:
        nome = NOMES[tid[min(I(t), N - 1)]]
        y = clap() if k == "clap" else impacto(PAD[nome]["b808"][0][1] + TR)
        g = calibra(y, t, cama.get(nome, rms_v * db(-8)) * db(float(CFG.get("hit", 6)) + gdb))
        poe(imp, y, t, g); n_imp += 1
    mus = mus + imp
    # cama total nas seções cheias (fora de break/stop, até a última palavra) -> "cama" dB da voz
    sel = ~mud & (t_all < fim_fala)
    trim = rms_v * db(float(CFG.get("cama", -7.9))) / max(rms(mus[sel]), 1e-9)
    for x in (bass, drums, ot, rl, imp, mus):
        x *= trim
    # fim: -20 dB em d s (linear em dB) junto com o fade para branco; sem fade-in no começo (só 3 ms contra estalo)
    if fins:
        tf = float(fins[-1]["t"]); df = float(fins[-1].get("d", END - tf)) or .7
    else:
        tf, df = max(0.0, END - .7), .7
    gf = np.where(t_all < tf, 1.0, db(-20 * np.clip((t_all - tf) / max(df, .05), 0, 2) ** 3))   # segura e cai no fim (-20 dB em d)
    gf[:int(.003 * SR)] *= np.linspace(0, 1, int(.003 * SR))
    k_ = min(N, int(.01 * SR)); gf[N - k_:] *= np.linspace(1, 0, k_)
    bass *= gf
    for x in (drums, ot, rl, imp, mus):
        x *= gf[:, None]
else:
    trim = 1.0

# ============================ SFX: clique de texto e obturador ============================
def clique_som(c=.35):
    """~4 ms brilhante (centroide ~5,7 kHz: 23 % em 0,3–2 kHz, 47 % em 2–8 kHz, 28 % acima de 8 kHz), sem grave, sempre a mesma
    amostra; L e R com correlação exata c (lado ~3 dB abaixo do meio, como na referência)"""
    r = np.random.default_rng(1104); n = int(.025 * SR); s = np.arange(n) / SR
    env = np.minimum(s / .0002, 1) * (np.exp(-s / .0032) + .15 * np.exp(-s / .01)) * np.clip((.025 - s) / .003, 0, 1)
    forma = lambda x: 1.0 * bp(x * env, 300, 2000) + .96 * bp(x * env, 2000, 8000) + .42 * bp(x * env, 8000, 16000)
    L = forma(r.normal(0, 1, n)); R = forma(r.normal(0, 1, n))
    R -= (R @ L) / (L @ L) * L                                # ortogonal a L (Gram-Schmidt) -> correlação final = c
    R = c * L + np.sqrt(1 - c * c) * R * np.sqrt((L @ L) / (R @ R))
    return np.stack([L, R], 1)


def tok(seed):
    """um clique do obturador: médios (0,5–1,3 kHz) + um pouco de agudo, ~5 ms, mono"""
    r = np.random.default_rng(seed); n = int(.03 * SR); s = np.arange(n) / SR
    x = r.normal(0, 1, n) * np.exp(-s / .0022) * np.minimum(s / .0002, 1)
    y = bp(x, 450, 1400, 2) + .3 * hp(x, 4000, 2) + np.sin(2 * np.pi * 950 * s) * np.exp(-s / .004) * .25
    return y


def pico10(x):
    p = (x ** 2).mean(1) if x.ndim == 2 else x ** 2
    return float(np.sqrt(np.max(mavg(p, .01 * SR)))) if len(p) else 1e-9


A_SFX = clique_som()
A_SFX *= db(med10 + float(CFG.get("clique", -14))) / pico10(A_SFX)
t1, t2 = tok(7), tok(8)
t2 *= db(med10 + float(CFG.get("obturador", -11))) / pico10(t2)
t1 *= db(med10 + float(CFG.get("obturador", -11)) - 3.5) / pico10(t1)
B_SFX = np.zeros(int(.11 * SR)); poe(B_SFX, t1, .051); poe(B_SFX, t2, .077)
fx = np.zeros((N, 2)); n_raj = 0
for t, g in cliques:
    poe(fx, A_SFX, t, db(g))
for t, g in obtur:
    poe(fx, B_SFX, t, db(g))
for t, d, g in rajadas:
    k = 0
    while k * .125 <= d + 1e-6:
        poe(fx, B_SFX, t + k * .125, db(g + float(CFG.get("rajada", -4)))); k += 1; n_raj += 1

# ============================ sons do kit (som.py) ============================
kit, tem_kit = le("sfx_bus.wav", obrig=False)
usa_kit = bool(CFG.get("sfx_kit", True)) and tem_kit
pk_kit = 20 * np.log10(np.abs(kit).max() + 1e-12) if tem_kit else -200
ev_all = EVJ.get("events", [])
n_cue = sum(1 for e in ev_all if e.get("type") == "sfx" and float(e.get("g") if e.get("g") is not None else .6) > 0)
n_tr = sum(1 for e in ev_all if str(e.get("type", "")).startswith("tr:") and e["type"] != "tr:cut")
if not usa_kit:
    kit = np.zeros((N, 2))
    nota_kit = "sons do kit: ignorados (sfx_kit false)" if tem_kit else "sons do kit: sem audio/sfx_bus.wav"
elif pk_kit < -60:
    nota_kit = "sons do kit: nenhum"
else:
    nota_kit = (f"AVISO sons do kit no sfx_bus ({pk_kit:.0f} dBFS: {n_cue} cues sfx, {n_tr} transições não secas); "
                "use env SOM_CORTE=0 e NIVEL_SFX=-120 no etapas.json")

# ============================ mix final: -14 LUFS, pico verdadeiro <= -1 dBTP ============================
mix = v + kit + fx + (0 if SEM else mus)
Lm = lufs(mix); g0 = db(-14 - Lm)
out, red = limita(mix * g0, -1.2)
for _ in range(2):                                            # o limitador tira um pouco de loudness: compensa e limita de novo
    L2 = lufs(out)
    if abs(L2 + 14) < .05:
        break
    g0 *= db(-14 - L2); out, red = limita(mix * g0, -1.2)
tp = pico_real(out)
if tp > -1.0:
    out *= db(-1.05 - tp)
os.makedirs(J("audio"), exist_ok=True)
sf.write(J("audio", "final_mix_tng.wav"), np.clip(out, -1, 1), SR, subtype="PCM_16")
if not SEM:
    sf.write(J("audio", "musica_tng.wav"), (mus * g0).astype(np.float32), SR, subtype="FLOAT")
if STEMS:
    os.makedirs(J("audio", "tng_stems"), exist_ok=True)
    for nome, x in (("voz", v), ("bass", bass), ("drums", drums + rl + imp), ("other", ot), ("sfx", fx), ("kit", kit),
                    ("musica", mus)):
        x = np.stack([x, x], 1) if np.ndim(x) == 1 else x
        sf.write(J("audio", "tng_stems", nome + ".wav"), (x * g0).astype(np.float32), SR, subtype="FLOAT")
rep = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", J("audio", "final_mix_tng.wav"), "-af", "ebur128=peak=true",
                      "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
pega = lambda k: next((l.split(":")[1].split()[0] for l in reversed(rep.splitlines()) if l.strip().startswith(k + ":")), "?")
if not SEM:
    print("seções: " + " · ".join(f"{tp_}@{a:.2f}" for a, _, tp_ in secoes)
          + " | cama por seção (dB RMS da voz): " + " ".join(f"{k} {20 * np.log10(c * trim / rms_v):+.1f}" for k, c in cama.items())
          + f" | ajuste geral {20 * np.log10(trim):+.1f} dB")
if estranhos:
    print("eventos tng desconhecidos (ignorados):", ", ".join(estranhos))
desc = "sem música" if SEM else (f"cama {float(CFG.get('cama', -7.9)):+.1f} dB RMS da voz, {BPM:.0f} BPM, {CFG.get('tom', 'Cm')}, "
                                 f"{len(drops)} drop, {len(breaks)} break, {len(stops)} stop, {len(hits)} hit, {len(rolls)} roll")
print(f"ok -> audio/final_mix_tng.wav ({desc}) | I {pega('I')} LUFS, LRA {pega('LRA')} LU, pico {pega('Peak')} dBTP"
      f"{f', limitador {red:.1f} dB' if red < -.05 else ''} | SFX: {len(cliques)} cliques, {len(obtur)} obturadores, "
      f"{len(rajadas)} rajadas ({n_raj} disparos) | {nota_kit}")
