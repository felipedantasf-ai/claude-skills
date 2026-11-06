"""QA denso: 2 quadros por segundo (t = k*0.5 + 0.25), folhas 7x4."""
import glob, os, shutil, subprocess, sys
from PIL import Image, ImageDraw
v, outdir, pref = sys.argv[1], sys.argv[2], sys.argv[3]
tmp = os.path.join(outdir, "qa2_tmp"); shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
subprocess.run(["ffmpeg", "-v", "error", "-ss", "0.25", "-i", v, "-vf", "fps=2,scale=216:384", "-q:v", "3", os.path.join(tmp, "f_%04d.jpg")], check=True)
fs = sorted(glob.glob(os.path.join(tmp, "f_*.jpg")))
per, cols = 28, 7
for si in range(0, len(fs), per):
    ch = fs[si:si + per]; rows = (len(ch) + cols - 1) // cols
    sh = Image.new("RGB", (cols * 222, rows * 404), (25, 25, 25)); d = ImageDraw.Draw(sh)
    for i, f in enumerate(ch):
        x, y = (i % cols) * 222, (i // cols) * 404
        sh.paste(Image.open(f), (x, y)); d.text((x + 4, y + 388), f"{0.25 + (si + i) * 0.5:.2f}s", fill=(255, 255, 0))
    sh.save(os.path.join(outdir, f"{pref}_{si // per + 1}.jpg"), quality=86)
shutil.rmtree(tmp); print(len(fs), "quadros")
