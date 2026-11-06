"""Monta o corte: tira erros de gravação, retakes, ruídos, vícios e silêncios (pausas de ~0,08 s entre frases);
gera work/edl.json, work/cut_audio.wav e work/words_out.json (palavras na nova linha do tempo)."""
import sys as _sys
if hasattr(_sys.stdout, "reconfigure"):
    _sys.stdout.reconfigure(encoding="utf-8", errors="replace")
import json
import re
import numpy as np
import soundfile as sf

FPS = 30
import os
ROOT = os.path.dirname(os.path.abspath(__file__))
P = {s["i"]: s for s in json.load(open(f"{ROOT}/src/parakeet.json", encoding="utf-8"))["segments"]}


def spoken_weight(tok):
    if re.fullmatch(r"[\d.,%]+", tok):
        digits = len(re.sub(r"\D", "", tok))
        return 4.5 * digits + (6 if "," in tok else 0) + (6 if "%" in tok else 0)
    return max(1, len(tok))


def split_glued(words):
    out = []
    for w in words:
        m = re.fullmatch(r"([A-Za-zÀ-ÿ]+)(\d[\d.,]*%?)([.,?!]*)", w["w"])
        if not m:
            out.append(dict(w))
            continue
        a, b = m.group(1), m.group(2) + m.group(3)
        wa, wb = spoken_weight(a), spoken_weight(m.group(2))
        cut = w["s"] + (w["e"] - w["s"]) * wa / (wa + wb)
        out.append({"w": a, "s": w["s"], "e": round(cut, 3)})
        out.append({"w": b, "s": round(cut, 3), "e": w["e"]})
    return out


for i in P:
    P[i]["words"] = split_glued(P[i]["words"])


def fix(i, old, new):
    """troca uma palavra (texto exato, ou índice inteiro) por uma ou mais, dividindo o tempo"""
    ws = P[i]["words"]
    k = old if isinstance(old, int) else next((k for k, w in enumerate(ws) if w["w"] == old), None)
    if k is None:
        raise KeyError((i, old))
    w = ws[k]
    parts = new if isinstance(new, list) else [new]
    if not parts:
        P[i]["words"] = ws[:k] + ws[k + 1:]
        return
    tot = sum(spoken_weight(p.strip(".,?!")) for p in parts)
    t, rep = w["s"], []
    for p in parts:
        d = (w["e"] - w["s"]) * spoken_weight(p.strip(".,?!")) / tot
        rep.append({"w": p, "s": round(t, 3), "e": round(t + d, 3)})
        t += d
    P[i]["words"] = ws[:k] + rep + ws[k + 1:]


def merge(i, first, n, new):
    """junta n palavras seguidas (a partir de `first`) numa só, ex.: "ao viver" -> "alviverde\""""
    ws = P[i]["words"]
    k = next(k for k, w in enumerate(ws) if w["w"] == first)
    P[i]["words"] = ws[:k] + [{"w": new, "s": ws[k]["s"], "e": ws[k + n - 1]["e"]}] + ws[k + n:]


# ---- correções do reconhecimento (conferir com o Whisper e com a energia do áudio)
# fix(i, "errada", "certa") · fix(i, "colada", ["duas","palavras"]) · merge(i, "6", 3, "6x1")

# ---- tomadas escolhidas
DROP = set()
KEEP = [i for i in sorted(P) if i not in DROP]
PRE, POST, POST_LONG, MERGE_GAP = 0.03, 0.05, 0.05, 0.18
LONG_AFTER = set()
MANUAL_ON, MANUAL_OFF, NO_PAD = {}, {}, set()
CUT_HEAD = {}     # {trecho: n palavras a tirar do começo}
CUT_TAIL = {}     # {trecho: n palavras a tirar do fim}
INSERE = {}

audio, SR = sf.read(f"{ROOT}/src/audio48k.wav", dtype="float32")
mono = audio.mean(axis=1)
hop = int(0.005 * SR)
env = np.sqrt(np.convolve(mono ** 2, np.ones(hop * 4) / (hop * 4), mode="same"))[::hop]
db = 20 * np.log10(env + 1e-9)
# limiares relativos ao p95 da fala da própria gravação
thr = np.percentile(db, 95) - 28
quiet = db < thr
runs, k = [], 0
while k < len(quiet):
    if quiet[k]:
        j = k
        while j < len(quiet) and quiet[j]:
            j += 1
        if (j - k) * 0.005 >= 0.10:
            runs.append((k * 0.005, j * 0.005))
        k = j
    else:
        k += 1


def onset(t, back=.4, fwd=.4):
    """início real da fala perto de t: fim do trecho silencioso mais próximo"""
    cand = [r for r in runs if t - back <= r[1] <= t + fwd]
    return min(cand, key=lambda r: abs(r[1] - t))[1] if cand else t


def offset(t, back=.4, fwd=.45):
    cand = [r for r in runs if t - back <= r[0] <= t + fwd]
    return min(cand, key=lambda r: abs(r[0] - t))[0] if cand else t


for i, n in CUT_HEAD.items():
    P[i]["words"] = P[i]["words"][n:]
    MANUAL_ON.setdefault(i, onset(P[i]["words"][0]["s"], back=.3, fwd=.15))
for i, n in CUT_TAIL.items():
    P[i]["words"] = P[i]["words"][:-n]
    MANUAL_OFF.setdefault(i, offset(P[i]["words"][-1]["e"], back=.15, fwd=.3))
print("fronteiras de repetição:", {i: round(v, 2) for i, v in {**MANUAL_ON, **MANUAL_OFF}.items()})

ON, OFF = {}, {}
for i in KEEP:
    s = P[i]
    ws = s["words"]
    # os trechos do Whisper começam segundos antes da fala (ruído de sala acima do limiar do silencedetect):
    # a fronteira sai das palavras do Parakeet, ajustada ao silêncio mais próximo
    st = ws[0]["s"] if ws else s["start"]
    en = ws[-1]["e"] if ws else s["end"]
    ON[i] = MANUAL_ON.get(i, onset(st, back=.3, fwd=.12))
    OFF[i] = MANUAL_OFF.get(i, offset(en, back=.12, fwd=.35))
    if OFF[i] <= ON[i]:
        ON[i], OFF[i] = st, en
# reposiciona as palavras entre o início e o fim reais
for i in KEEP:
    ws = P[i]["words"]
    if not ws:
        continue
    w0, w1 = ws[0]["s"], ws[-1]["e"]
    if w1 - w0 < 0.05:
        continue
    kk = (OFF[i] - ON[i]) / (w1 - w0)
    for w in ws:
        w["s"] = round(ON[i] + (w["s"] - w0) * kk, 3)
        w["e"] = round(ON[i] + (w["e"] - w0) * kk, 3)

pieces = []
for n, i in enumerate(KEEP):
    nxt = KEEP[n + 1] if n + 1 < len(KEEP) else None
    prv = KEEP[n - 1] if n else None
    pre = 0.0 if (prv, i) in NO_PAD else PRE
    post = 0.0 if (i, nxt) in NO_PAD else (POST_LONG if i in LONG_AFTER else POST)
    pieces.append([max(0.0, ON[i] - pre), OFF[i] + post, i])

merged = []
for a, b, i in pieces:
    prev = merged[-1][2][-1] if merged else None
    gap = (ON[i] - OFF[prev]) if prev is not None else 99
    if merged and prev is not None and KEEP.index(i) == KEEP.index(prev) + 1 and i == prev + 1 and gap < MERGE_GAP and prev not in LONG_AFTER and (prev, i) not in NO_PAD:
        merged[-1][1] = b
        merged[-1][2].append(i)
    else:
        merged.append([a, b, [i]])

# aperto pelo nível de energia (abaixo de -30 dB do pico): no fim de cada trecho ficam 30 ms depois da
# última fala, no começo 20 ms antes da primeira, e pausas internas >= 100 ms viram ~50 ms (+ arredondamento de quadro)
# 2ª varredura (pedido do Felipe: nenhum silêncio): nesta gravação as pausas têm respiração e ruído de sala entre
# -43 e -35 dB, que o limiar antigo (28 dB abaixo do pico) deixava passar. Agora silêncio = envelope de 30 ms
# mais de 20 dB abaixo do pico da fala por >= 0,12 s; ficam 35 ms depois da fala e 25 ms antes da próxima.
SQ_THR, SQ_MIN, KEEP_END, KEEP_START = 20, 0.08, 0.035, 0.025   # 22/10: pausas internas >= 80 ms também (Felipe: nenhum silêncio leve)
# palavras baixas que o aperto partia ou o filtro de ilhas tirava (segundos da fonte): sem corte interno nem remoção aqui
PROTEGE = []
# de ilhas tirava (26/10, reclamação do Felipe: "cortes errados"): "cha(to)", "fa(to)", "por cen(to)" · [(início, fim)] na fonte: palavras baixas sem aperto interno, sem remoção de ilha e com o final inteiro
# cortes internos à mão (fonte, s): tira só o silêncio entre palavras que ficaram dentro de uma região protegida
CORTE_MANUAL = []
protegido = lambda a, b: any(a < q1 and b > q0 for q0, q1 in PROTEGE)
GAP_BEFORE = {}   # pausa dramática proposital antes de um trecho, ex.: {68: 0.18} ("simplesmente… paz.")
HOP = 0.005


def movavg(x, n):
    c = np.cumsum(np.insert(x.astype(np.float64), 0, 0.0))
    y = (c[n:] - c[:-n]) / n
    pad = n // 2
    return np.concatenate([np.full(pad, y[0]), y, np.full(len(x) - len(y) - pad, y[-1])])


db30 = 20 * np.log10(np.sqrt(np.maximum(movavg(mono ** 2, int(0.03 * SR)), 0))[::hop] + 1e-9)
P95 = np.percentile(db, 95)
qs = db30 < (P95 - SQ_THR)


def sq_runs(a, b):
    i0, i1 = int(round(a / HOP)), min(len(qs), int(round(b / HOP)))
    out, k = [], i0
    while k < i1:
        if qs[k]:
            j = k
            while j < i1 and qs[j]:
                j += 1
            out.append((k * HOP, j * HOP))
            k = j
        else:
            k += 1
    return out


tight, n_in = [], 0
for a, b, ids in merged:
    R = sq_runs(a, b)
    if R and R[0][0] <= a + HOP:
        a = max(a, R[0][1] - KEEP_START); R = R[1:]
    if ids[0] in GAP_BEFORE:
        a -= GAP_BEFORE[ids[0]] - KEEP_START - KEEP_END
    if R and R[-1][1] >= b - HOP:
        fp = next((q1 for q0, q1 in PROTEGE if q0 <= R[-1][0] < q1), None)   # final baixo protegido fica inteiro
        b = min(b, (fp if fp else R[-1][0]) + KEEP_END); R = R[:-1]
    cur = a
    for r0, r1 in R:
        if r1 - r0 >= SQ_MIN and r0 > cur and not protegido(r0, r1):
            tight.append([cur, r0 + KEEP_END, ids]); cur = r1 - KEEP_START; n_in += 1
    tight.append([cur, b, ids])
print('pausas internas apertadas:', n_in)
# ilhas que não são fala saem do corte: pedaço sem nada acima de 13 dB abaixo do pico (respiração, ruído de sala)
# ou pedaço curto (< 0,25 s) sem nenhuma palavra (estalo)
spans = [(w["s"], w["e"]) for i in KEEP for w in P[i]["words"]]
pk_of = lambda a, b: db30[int(a / HOP):max(int(a / HOP) + 1, int(b / HOP))].max()
ilhas = [p for p in tight if not protegido(p[0], p[1]) and (pk_of(p[0], p[1]) < P95 - 13) or not protegido(p[0], p[1]) and (p[1] - p[0] < .25 and not any(s0 < p[1] and e0 > p[0] for s0, e0 in spans))]
for a, b, ids in ilhas:
    print(f"  ilha sem fala {a:7.2f}-{b:7.2f} ({b - a:.2f}s, pico {pk_of(a, b):.0f} dB) trecho {ids[0]}")
print("ilhas removidas:", len(ilhas))
tight = [p for p in tight if p not in ilhas]
for c0, c1 in CORTE_MANUAL:
    for k_, p in enumerate(tight):
        if p[0] < c0 and c1 < p[1]:
            tight[k_:k_ + 1] = [[p[0], c0, p[2]], [c1, p[1], p[2]]]; print(f'  corte manual {c0:.2f}-{c1:.2f}'); break
# finais comidos pelo aperto (Whisper no trecho atual x estendido, tools/caudas_whisper.py; "s" finais com >70% de alta freq.):
TAIL_FIX = {}   # {src_out antigo: novo fim} para finais comidos pelo aperto (conferir com ferramentas/checagens.py corte)
for p in tight:
    for k_, v_ in TAIL_FIX.items():
        if int(np.ceil(p[1] * FPS - 1e-6)) == round(k_ * FPS):
            print(f"  final estendido {p[1]:.2f} -> {v_:.2f}"); p[1] = v_
merged = tight

edl, out_t = [], 0
for k2, (a, b, ids) in enumerate(merged):
    fa, fb = int(np.floor((a + 0.010) * FPS + 1e-6)), int(np.ceil((b - 0.010) * FPS - 1e-6))   # para fora, podendo comer até 10 ms da folga
    if k2 and fa < edl[-1]["f_out"]:
        fa = edl[-1]["f_out"]
    if fb <= fa:
        continue
    if ids[0] in INSERE and not any(e.get("gap") for e in edl if e.get("antes") == ids[0]):
        G = int(round(INSERE[ids[0]] * FPS))   # entrada de 0 s na fonte (quadros congelados), G quadros de silêncio no corte
        edl.append({"src_in": fa / FPS, "src_out": fa / FPS, "f_in": fa, "f_out": fa, "out_in": out_t / FPS, "out_out": (out_t + G) / FPS,
                    "o_in": out_t, "segs": [], "gap": G, "antes": ids[0]})
        print(f"  inserção montada: {G / FPS:.2f}s de silêncio em {out_t / FPS:.2f}s do corte (antes do trecho {ids[0]})")
        out_t += G
    nfr = fb - fa
    edl.append({"src_in": fa / FPS, "src_out": fb / FPS, "f_in": fa, "f_out": fb,
                "out_in": out_t / FPS, "out_out": (out_t + nfr) / FPS, "o_in": out_t, "segs": ids})
    out_t += nfr
total = out_t / FPS

FADE = int(0.006 * SR)
chunks = []
for e in edl:
    if e.get("gap"):
        chunks.append(np.zeros((int(round(e["gap"] / FPS * SR)), audio.shape[1]), dtype=audio.dtype)); continue
    x = audio[int(round(e["src_in"] * SR)): int(round(e["src_out"] * SR))].copy()
    nn = int(round((e["src_out"] - e["src_in"]) * SR))
    x = x[:nn] if len(x) >= nn else np.pad(x, ((0, nn - len(x)), (0, 0)))
    ramp = np.linspace(0, 1, FADE)[:, None]
    x[:FADE] *= ramp
    x[-FADE:] *= ramp[::-1]
    chunks.append(x)
sf.write(f"{ROOT}/work/cut_audio.wav", np.concatenate(chunks), SR, subtype="FLOAT")
# conferência: silêncios que ainda sobraram no corte (>= 0,15 s abaixo do limiar)
_c = np.concatenate(chunks).mean(axis=1)
_d = 20 * np.log10(np.sqrt(np.maximum(movavg(_c ** 2, int(0.03 * SR)), 0))[::hop] + 1e-9)
_q, _r, _k = _d < (P95 - SQ_THR), [], 0
while _k < len(_q):
    if _q[_k]:
        _j = _k
        while _j < len(_q) and _q[_j]:
            _j += 1
        if (_j - _k) * HOP >= .15:
            _r.append((round(_k * HOP, 2), round((_j - _k) * HOP, 2)))
        _k = _j
    else:
        _k += 1
print("silêncios restantes >= 0,15 s:", len(_r), _r[:20])


def piece_of(t):
    for e in edl:
        if not e.get("gap") and e["src_in"] - 1e-6 <= t <= e["src_out"] + 1e-6:
            return e
    return None


words = []
for i in KEEP:
    for w in P[i]["words"]:
        ws_, we_ = w["s"], min(w["e"], w["s"] + 1.6)
        e = piece_of((ws_ + we_) / 2) or piece_of(ws_) or piece_of(we_)
        if e is None:
            # palavra num trecho que o aperto removeu (estalo/murmúrio): encosta no começo do trecho seguinte
            nx = next((x for x in edl if not x.get("gap") and x["src_in"] >= ws_), None)
            if nx is None:
                print("palavra fora do corte:", i, w)
                continue
            print("palavra encostada no trecho seguinte:", i, w["w"])
            words.append({"w": w["w"], "s": round(nx["out_in"], 3), "e": round(nx["out_in"] + .06, 3), "seg": i})
            continue
        ws_, we_ = max(ws_, e["src_in"]), min(we_, e["src_out"])
        words.append({"w": w["w"], "s": round(e["out_in"] + ws_ - e["src_in"], 3),
                      "e": round(e["out_in"] + we_ - e["src_in"], 3), "seg": i})
json.dump({"fps": FPS, "duration": total, "edl": edl}, open(f"{ROOT}/work/edl.json", "w", encoding="utf-8"), indent=1)
json.dump(words, open(f"{ROOT}/work/words_out.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"trechos no corte: {len(edl)}; duração final {total:.2f}s; palavras {len(words)}")
segtxt = {}
for w in words:
    segtxt.setdefault(w["seg"], []).append(w)
for i in sorted(segtxt):
    ws = segtxt[i]
    print(f"{i:02d} {ws[0]['s']:6.2f}-{ws[-1]['e']:6.2f} " + " ".join(w["w"] for w in ws))
