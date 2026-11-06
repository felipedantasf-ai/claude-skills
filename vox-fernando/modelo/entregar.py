"""Gera as entregas a partir do render (out/master.mp4) + áudio (audio/final_mix.wav).

uso: python entregar.py NOME [--nvenc] [--rapido] [--partes] [--destino PASTA] [--video out/master.mp4]
  NOME_tiktok.mp4  ≤ 29 MB (x264 em 2 passagens, preset slow, AAC 96k) -> para postar
  NOME_MASTER.mp4  alta qualidade (x264 CRF 18 + AAC 192k; --nvenc usa a placa NVIDIA)
  --rapido   preset medium na versão de postar (mais rápido, um pouco menos nítido)
  --partes   também divide o master em partes de 9,5 MB + JUNTAR_*.bat (só para mandar por canal com limite)
  --destino  copia as duas entregas para outra pasta (ex.: Downloads)
Tudo vai para entrega/ dentro do projeto.
"""
import os, shutil, subprocess, sys, time
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.dirname(os.path.abspath(__file__))
a = sys.argv[1:]
if not a or a[0].startswith("--"):
    sys.exit(__doc__)
NOME = a[0]
opt = lambda k: a[a.index(k) + 1] if k in a else None
SRC = opt("--video") or os.path.join(ROOT, "out", "master.mp4")
AUD = opt("--audio") or os.path.join(ROOT, "audio", "final_mix.wav")     # --audio audio/final_mix_v2.wav (versões)
OUT = os.path.join(ROOT, "entrega")
ENC = os.path.join(ROOT, "out", "enc")
os.makedirs(OUT, exist_ok=True); os.makedirs(ENC, exist_ok=True)
for f in (SRC, AUD):
    if not os.path.exists(f):
        sys.exit(f"falta {f}")


def run(*c):
    t = time.time()
    subprocess.run(["ffmpeg", "-v", "error", "-y", *c], check=True)
    return time.time() - t


dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SRC], text=True).strip())
# versão para postar: alvo 28,6 MB (folga para o contêiner) com AAC 96k
vb = min(6000, int(28.6e6 * 8 / dur / 1000) - 110)
P = "medium" if "--rapido" in a else "slow"
tk = os.path.join(OUT, f"{NOME}_tiktok.mp4")
log = os.path.join(ENC, "hq")
print(f"duração {dur:.2f}s -> vídeo {vb}k ({P})")
t1 = run("-i", SRC, "-c:v", "libx264", "-preset", P, "-b:v", f"{vb}k", "-x264-params", "aq-mode=3", "-pass", "1", "-passlogfile", log, "-an", "-f", "null", "-")
t2 = run("-i", SRC, "-i", AUD, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", P, "-b:v", f"{vb}k", "-x264-params", "aq-mode=3",
         "-pass", "2", "-passlogfile", log, "-profile:v", "high", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "96k", "-ar", "48000",
         "-shortest", "-movflags", "+faststart", tk)
mb = os.path.getsize(tk) / 1e6
print(f"{os.path.basename(tk)}: {mb:.1f} MB em {t1 + t2:.0f}s" + ("  (ATENÇÃO: passou de 29 MB)" if mb > 29 else ""))
# master
ms = os.path.join(OUT, f"{NOME}_MASTER.mp4")
V = (["-c:v", "h264_nvenc", "-preset", "p7", "-tune", "hq", "-rc", "vbr", "-cq", "18", "-b:v", "0", "-profile:v", "high"] if "--nvenc" in a
     else ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-x264-params", "aq-mode=3", "-profile:v", "high"])
t3 = run("-i", SRC, "-i", AUD, "-map", "0:v", "-map", "1:a", *V, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
         "-shortest", "-movflags", "+faststart", ms)
print(f"{os.path.basename(ms)}: {os.path.getsize(ms) / 1e6:.1f} MB em {t3:.0f}s")
if "--partes" in a:
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_master.py"), ms, os.path.join(OUT, "partes"), "9500000"], check=True)
dst = opt("--destino")
if dst:
    os.makedirs(dst, exist_ok=True)
    for f in (tk, ms):
        shutil.copy2(f, dst)
    print("copiado para", dst)
print("pronto:", OUT)
