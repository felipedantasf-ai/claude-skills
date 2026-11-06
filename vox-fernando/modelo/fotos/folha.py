"""folha de contato dos candidatos: python folha.py chave1 chave2 ... -> folhas/<chave1>.jpg (tiles 360x240, legenda chave_n)"""
import glob, os, sys
from PIL import Image, ImageDraw
os.chdir(os.path.dirname(os.path.abspath(__file__)))
keys = sys.argv[1:]
tiles = []
for k in keys:
    for f in sorted(glob.glob(f"{'prev' if glob.glob(f'prev/{k}_*.jpg') else 'cand'}/{k}_*.jpg"), key=lambda s: int(s.rsplit('_', 1)[1].split('.')[0])):
        try:
            im = Image.open(f).convert("RGB"); im.thumbnail((360, 240))
            t = Image.new("RGB", (360, 262), (40, 40, 40)); t.paste(im, ((360 - im.width) // 2, 22))
            ImageDraw.Draw(t).text((6, 4), os.path.basename(f)[:-4], fill=(255, 210, 120))
            tiles.append(t)
        except Exception as e:
            print("erro", f, e)
cols = 5; rows = (len(tiles) + cols - 1) // cols
sh = Image.new("RGB", (cols * 364, max(1, rows) * 266), (20, 20, 20))
for i, t in enumerate(tiles): sh.paste(t, ((i % cols) * 364, (i // cols) * 266))
out = f"folhas/{'_'.join(keys)[:60]}.jpg"; sh.save(out, quality=85); print(out, len(tiles))
