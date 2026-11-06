"""Cria um projeto de TESTE com um trecho de um projeto já cortado (áudio, palavras, beats, janelas do apresentador, rosto e quadros
renumerados a partir de 0). Foi assim que nasceu o projetos/teste_edit2 (B19–B40 do audio1031, 31,41–69,66 s do corte).

uso: python trecho_de_projeto.py <origem> <destino> <t0> <t1> [prefixo]     (nomes em <kit>/projetos; t0/t1 em segundos do corte)
Depois: preparar_edit2.py <destino> --prefixo xx (e o --so-clipes se copiar trechos para render/clips/).
"""
import json, os, re, shutil, sys
import numpy as np, soundfile as sf
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
KIT = os.environ.get('VOX_KIT', 'H:/Edição Claude/Kit_Edicao_Vox_v2')
if len(sys.argv) < 5: sys.exit(__doc__)
O, D = f'{KIT}/projetos/{sys.argv[1]}', f'{KIT}/projetos/{sys.argv[2]}'
T0, T1 = float(sys.argv[3]), float(sys.argv[4])
PREF = sys.argv[5] if len(sys.argv) > 5 else 'e2'
if os.path.exists(D): sys.exit('já existe: ' + D)
os.makedirs(D)
# raiz: scripts do projeto (pipeline melhorado do vox) + tools + render (sem cenas antigas)
for f in os.listdir(O):
    p = os.path.join(O, f)
    if os.path.isfile(p) and (f.endswith('.py') or f in ('beats.json',)) and not f.endswith('.antes'):
        shutil.copy(p, D)
shutil.copytree(f'{O}/tools', f'{D}/tools')
shutil.copytree(f'{O}/render', f'{D}/render', ignore=shutil.ignore_patterns('scenes.js'))
for d in ('work', 'audio', 'out', 'entrega', 'src', 'fotos'): os.makedirs(f'{D}/{d}', exist_ok=True)
# áudio do corte
a, sr = sf.read(f'{O}/work/cut_audio.wav', dtype='float32')
seg = a[int(T0 * sr):int(T1 * sr)].copy()
n = int(.012 * sr); r = np.linspace(0, 1, n)[:, None]
seg[:n] *= r; seg[-n:] *= r[::-1]
sf.write(f'{D}/work/cut_audio.wav', seg, sr, subtype='FLOAT')
dur = round(len(seg) / sr, 3)
# palavras e beats
w = json.load(open(f'{O}/work/words_out.json', encoding='utf-8'))
w2 = [dict(x, s=round(x['s'] - T0, 3), e=round(x['e'] - T0, 3)) for x in w if x['s'] >= T0 - .01 and x['e'] <= T1 + .05]
json.dump(w2, open(f'{D}/work/words_out.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
s = open(f'{O}/render/timing.js', encoding='utf-8').read()
t = json.loads(s[s.index('{'):s.rindex('}') + 1])
bs = [b for b in t['beats'] if b['start'] >= T0 - .05 and b['end'] <= T1 + .05]
for b in bs:
    b['start'] = round(b['start'] - T0, 3); b['end'] = round(b['end'] - T0, 3)
    for x in b['words']: x['s'] = round(x['s'] - T0, 3); x['e'] = round(x['e'] - T0, 3)
t['beats'] = bs; t['videoDur'] = dur
open(f'{D}/render/timing.js', 'w', encoding='utf-8').write('window.TIMING = ' + json.dumps(t, ensure_ascii=False) + ';\n')
print('beats', bs[0]['id'], '->', bs[-1]['id'], 'dur', dur)
# janelas do apresentador
s = open(f'{O}/render/apresentador.js', encoding='utf-8').read()
ap = json.loads(s[s.index('{'):s.rindex('}') + 1])
ap2 = {k: dict(v, t0=round(max(0, v['t0'] - T0), 3), t1=round(min(dur, v['t1'] - T0), 3)) for k, v in ap.items() if v['t1'] > T0 and v['t0'] < T1}
open(f'{D}/render/apresentador.js', 'w', encoding='utf-8').write('window.APRES = ' + json.dumps(ap2) + ';\n')
print('apresentador', ap2)
# rosto (camdata) e quadros, renumerados
f0, nf = round(T0 * 30), int(round(dur * 30)) + 2
s = open(f'{O}/render/camdata.js', encoding='utf-8').read()
cx = json.loads('[' + re.search(r'cx:\s*\[(.*?)\]', s, re.S).group(1) + ']'); cy = json.loads('[' + re.search(r'cy:\s*\[(.*?)\]', s, re.S).group(1) + ']')
open(f'{D}/render/camdata.js', 'w').write(f'window.FACE = {{cx: {json.dumps(cx[f0:f0 + nf])}, cy: {json.dumps(cy[f0:f0 + nf])}}};\n')
for pasta in ('frames', 'frames_largos'):
    os.makedirs(f'{D}/work/{pasta}', exist_ok=True); k = 0
    for i in range(nf):
        src = f'{O}/work/{pasta}/{f0 + i + 1:05d}.jpg'
        if os.path.exists(src): shutil.copy(src, f'{D}/work/{pasta}/{i + 1:05d}.jpg'); k += 1
    print(pasta, k, 'quadros')
open(f'{D}/render/camdata.js', 'a').write(f'window.NFR = {nf};\n')
json.dump({"prefixo": PREF, "sem_rosto": False}, open(f'{D}/etapas.json', 'w'))
print('ok', D)
