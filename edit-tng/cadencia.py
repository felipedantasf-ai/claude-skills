"""Histograma de quanto tempo cada imagem fica na tela (teste MAD<limiar entre quadros consecutivos).

uso: python -I holds.py VIDEO [--lim 1] [--de T0] [--ate T1] [--json saida.json] [--rotulo nome]
Lê o vídeo inteiro em cinza na resolução nativa (pipe rawvideo do ffmpeg), calcula a MAD (média do |diferença| em 0-255)
entre cada quadro e o anterior e junta quadros com MAD < limiar numa mesma "imagem". Imprime:
  - fps e número de quadros (ffprobe);
  - histograma das durações (em quadros) das imagens;
  - % dos quadros ímpares iguais ao anterior e % dos pares;
  - sequência das durações (para ver 2-2-2 ou 3-2-3-2).
"""
import json, subprocess, sys
import numpy as np

a = sys.argv[1:]
V = a[0]
arg = lambda k, d=None: a[a.index(k) + 1] if k in a else d
LIM = float(arg("--lim", 1))
T0, T1 = arg("--de"), arg("--ate")

pr = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                         "stream=width,height,r_frame_rate,avg_frame_rate,nb_frames", "-of", "json", V]))["streams"][0]
W, H = pr["width"], pr["height"]
num, den = map(int, pr["r_frame_rate"].split("/"))
fps = num / den
cmd = ["ffmpeg", "-v", "error"]
if T0: cmd += ["-ss", T0]
cmd += ["-i", V]
if T1: cmd += ["-t", str(float(T1) - float(T0 or 0))]
cmd += ["-f", "rawvideo", "-pix_fmt", "gray", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
fs = W * H
prev = None
mads = []
while True:
    b = p.stdout.read(fs)
    if len(b) < fs:
        break
    g = np.frombuffer(b, np.uint8).astype(np.int16)
    if prev is not None:
        mads.append(float(np.abs(g - prev).mean()))
    prev = g
p.wait()
mads = np.array(mads)              # mads[i] = MAD(quadro i+1, quadro i)
n = len(mads) + 1
same = mads < LIM
# imagens: começa nova imagem no quadro 0 e em todo quadro i+1 com mads[i] >= LIM
starts = [0] + [i + 1 for i in range(len(mads)) if not same[i]]
durs = np.diff(starts + [n])
hist = {int(k): int(v) for k, v in zip(*np.unique(durs, return_counts=True))}
idx = np.arange(1, n)
odd, even = idx % 2 == 1, idx % 2 == 0
res = {
    "video": V, "rotulo": arg("--rotulo", ""), "w": W, "h": H, "r_frame_rate": pr["r_frame_rate"], "avg_frame_rate": pr["avg_frame_rate"],
    "quadros": n, "limiar_mad": LIM, "imagens": len(durs),
    "hist_duracao_quadros": hist,
    "pct_imagens_por_duracao": {k: round(100 * v / len(durs), 2) for k, v in hist.items()},
    "pct_tempo_por_duracao": {k: round(100 * k * v / n, 2) for k, v in hist.items()},
    "pct_impares_iguais_ao_anterior": round(100 * same[odd[:len(same)]].mean(), 2),
    "pct_pares_iguais_ao_anterior": round(100 * same[even[:len(same)]].mean(), 2),
    "mad_impares_mediana": round(float(np.median(mads[odd[:len(mads)]])), 3),
    "mad_pares_mediana": round(float(np.median(mads[even[:len(mads)]])), 3),
    "inicio_imagens": starts,
    "sequencia_duracoes": [int(x) for x in durs],
    "imagens_por_s": round(len(durs) / (n / fps), 3),
    "mads": [round(float(x), 3) for x in mads],
}
print(f"{V}\n  {W}x{H} r={pr['r_frame_rate']} avg={pr['avg_frame_rate']} quadros={n} imagens={len(durs)} ({res['imagens_por_s']}/s) limiar MAD<{LIM}")
print("  durações (quadros: nº de imagens):", hist)
print("  % do tempo por duração:", res["pct_tempo_por_duracao"])
print(f"  ímpares iguais ao anterior {res['pct_impares_iguais_ao_anterior']}% (MAD med {res['mad_impares_mediana']}) | pares iguais {res['pct_pares_iguais_ao_anterior']}% (MAD med {res['mad_pares_mediana']})")
print("  sequência (primeiras 40):", "-".join(map(str, durs[:40])))
if arg("--json"):
    json.dump(res, open(arg("--json"), "w", encoding="utf-8"), indent=0)
