"""Transcreve janelas curtas de um wav com Whisper small e Parakeet (duas opiniões) para conferir trechos duvidosos.
uso: asr_janelas.py arquivo.wav 13.2-13.8 23.3-24.2 ...   (segundos)"""
import os, subprocess, sys, tempfile
import numpy as np, soundfile as sf, sherpa_onnx
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..")
WM, PM = os.path.join(KIT, "modelos", "sherpa-onnx-whisper-small"), os.path.join(KIT, "modelos", "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")
src = sys.argv[1]
tmp = os.path.join(tempfile.gettempdir(), "_asr16k.wav")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "16000", tmp], check=True)
a, sr = sf.read(tmp, dtype="float32")
wh = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{WM}/small-encoder.int8.onnx", decoder=f"{WM}/small-decoder.int8.onnx",
        tokens=f"{WM}/small-tokens.txt", language="pt", task="transcribe", num_threads=8, tail_paddings=800)
pk = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{PM}/encoder.int8.onnx", decoder=f"{PM}/decoder.int8.onnx", joiner=f"{PM}/joiner.int8.onnx",
        tokens=f"{PM}/tokens.txt", num_threads=8, model_type="nemo_transducer", decoding_method="greedy_search")
def run(rec, s, e):
    st = rec.create_stream(); x = a[int(max(0, s) * sr):int(e * sr)]
    st.accept_waveform(sr, np.concatenate([np.zeros(int(.2 * sr), np.float32), x, np.zeros(int(.3 * sr), np.float32)])); rec.decode_stream(st)
    return st.result.text.strip()
for w in sys.argv[2:]:
    s, e = map(float, w.split("-"))
    x = a[int(s * sr):int(e * sr)]; pk_db = 20 * np.log10(np.abs(x).max() + 1e-9) if len(x) else -99
    print(f"{s:7.2f}-{e:7.2f} (pico {pk_db:5.1f} dB)\n   whisper:  {run(wh, s, e)}\n   parakeet: {run(pk, s, e)}", flush=True)
