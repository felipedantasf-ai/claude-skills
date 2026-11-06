"""Quadros do corte em enquadramento LARGO para a tela dividida (pedido do Felipe: apresentador mais afastado).
Recorta 1000x889 da fonte horizontal (centro no rosto, topo da imagem) e reduz para 1080x960 -> work/frames_largos/%05d.jpg
(mesma numeração de work/frames: quadro do corte n -> n+1).
"""
import json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "src", "raw.mp4")
edl = json.load(open(os.path.join(ROOT, "work", "edl.json"), encoding="utf-8"))
out = os.path.join(ROOT, "work", "frames_largos")
SW, SH = map(int, subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0:s=x', RAW], text=True).strip().split('x'))
CX = float(sys.argv[1]) if len(sys.argv) > 1 else SW * 992.0 / 1920
CH = min(889, SH); CW = int(round(CH * 1080 / 960 / 2)) * 2   # fonte 1280x720 (alemanha): 810x720
x0 = int(min(max(0, CX - CW / 2), SW - CW))
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
sel = "+".join(f"gte(t,{e['src_in'] - .001:.3f})*lt(t,{e['src_out'] - .001:.3f})" for e in edl["edl"])
vf = f"select='{sel}',setpts=N/(30*TB),fps=30,crop={CW}:{CH}:{x0}:0,scale=1080:960:flags=lanczos,unsharp=5:5:0.6:5:5:0"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-vf", vf, "-q:v", "2", os.path.join(out, "%05d.jpg")], check=True)
print("quadros largos:", len(os.listdir(out)), "| recorte x0 =", x0)
