"""Baixa SÓ os trechos escolhidos, na maior qualidade que o YouTube tiver (2160 > 1440 > 1080), para a edit-tng.

uso (Python do kit, sempre com -I):
  python -I baixar_hd.py <projeto> LISTA.txt [-j 4] [--margem 1] [--audio] [--aceita-baixa]
LISTA.txt, uma linha por vídeo:   nome  ID_ou_URL  ini-fim [ini-fim ...]      (# = comentário)
  tempos em segundos ou mm:ss / h:mm:ss (ex.: 61.5-64  ou  1:01.5-1:04); são os tempos do vídeo-fonte
  (os mesmos do varrer.py). Cada trecho ganha --margem s (padrão 1) de cada lado: vídeo real nunca trava.
  1º trecho -> clipes/hd/<nome>.mp4 ; 2º -> <nome>_2.mp4 ; ...
Formato: DASH (https, nunca HLS/m3u8), SDR, maior resolução até 2160 (lado menor), maior q/s
  (bv*[height<=2160][protocol=https] com -S res:2160,hdr:sdr,fps). Sem áudio (a edição é muda); --audio junta o áudio.
  Fonte com menos de 720p FALHA (alto) — use --aceita-baixa só para plano largo/cartão.
Confere cada arquivo no ffprobe e imprime  nome WxH q/s codec duração ; se existir a prévia do varrer.py
(clipes/prev/<id>.mp4) mede o início real do arquivo contra ela (o corte do DASH cai em quadro-chave).
Grava clipes/hd/<nome>.json (trecho, início real -> use  tempo_no_arquivo = tempo_na_fonte - inicio_arquivo)
e acrescenta  nome | canal | url | data de upload | trecho | licença  em clipes/fontes.md.
"""
import hashlib, json, os, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
KIT = os.environ.get("VOX_KIT", "H:/Edição Claude/Kit_Edicao_Vox_v2")
YTDLP = os.path.join(KIT, ".venv", "Scripts", "yt-dlp.exe")
_MR = os.environ.get("TNG_MAXRES", "2160")                     # TNG_MAXRES=1080: mais rápido (pedido do Felipe, 06/11)
F_HD = f"bv*[height<={_MR}][protocol=https]/bv*[protocol=https]/bv*"
SORT = f"res:{_MR},hdr:sdr,fps"


def projeto(p):
    return p if os.path.isabs(p) else os.path.join(KIT, "projetos", p)


def seg(s):
    v = 0.0
    for x in s.split(":"):
        v = v * 60 + float(x)
    return v


def url_de(x):
    return x if x.startswith("http") else f"https://www.youtube.com/watch?v={x}"


def yt(args, timeout=900):
    try:
        r = subprocess.run([YTDLP, "--no-warnings", *args], capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=timeout)
    except subprocess.TimeoutExpired:
        return 1, "", "tempo esgotado"
    return r.returncode, r.stdout, " ".join((r.stderr or "").strip().splitlines()[-1:])


def le_info(url, pasta_info):
    fn = os.path.join(pasta_info, hashlib.md5(url.encode()).hexdigest()[:12] + ".json")
    if os.path.exists(fn) and time.time() - os.path.getmtime(fn) < 4 * 3600:
        return fn, json.load(open(fn, encoding="utf-8"))
    rc, out, err = yt(["-J", "--no-playlist", url], 180)
    if rc or not out.lstrip().startswith("{"):
        return None, {"erro": err}
    open(fn, "w", encoding="utf-8").write(out)
    return fn, json.loads(out)


def melhor_p(info):
    vs = [f for f in info.get("formats") or [] if f.get("vcodec") not in (None, "none") and f.get("height") and f.get("width")]
    https = [f for f in vs if f.get("protocol") == "https"] or vs
    return max((min(f["width"], f["height"]) for f in https), default=0)


def ffprobe(fn):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=width,height,codec_name,avg_frame_rate,r_frame_rate:format=duration", "-of", "json", fn],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    try:
        j = json.loads(r.stdout)
        s = j["streams"][0]
        n, d = (s.get("avg_frame_rate") or s.get("r_frame_rate") or "0/1").split("/")
        return s["width"], s["height"], float(n) / max(float(d), 1), s["codec_name"], float(j["format"]["duration"])
    except Exception:
        return None


def miniaturas(fn, ss, dur, fps=8):
    """quadros 64x36 cinza (normalizados) de [ss, ss+dur] a fps q/s"""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{max(ss, 0):.3f}", "-t", f"{dur:.3f}", "-i", fn, "-vf",
                          f"fps={fps},scale=64:36:flags=area,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 36, 64).astype(np.float32)
    return (a - a.mean(axis=(1, 2), keepdims=True)) / (a.std(axis=(1, 2), keepdims=True) + 1)


def confere_inicio(dst, prev, t_ped):
    """acha em que tempo da fonte começa o arquivo baixado, comparando com a prévia (passo 1/24 s)"""
    hd = miniaturas(dst, 0.0, 2.0, 24)
    if len(hd) < 12:
        return None
    pv = miniaturas(prev, t_ped - 6.0, 10.0, 24)
    if len(pv) < len(hd):
        return None
    k = len(hd)
    err = [float(np.mean(np.abs(pv[i:i + k] - hd))) for i in range(len(pv) - k + 1)]
    i = int(np.argmin(err))
    if err[i] > 0.35:                  # não casou (prévia diferente, cena escura...)
        return None
    return round(max(t_ped - 6.0, 0) + i / 24, 3)


def baixa(job, P, margem, audio, infos):
    nome, url, k, ini, fim = job
    fn_info, info = infos[url]
    dst = os.path.join(P, "clipes", "hd", f"{nome}.mp4" if k == 1 else f"{nome}_{k}.mp4")
    a, b = max(0.0, ini - margem), fim + margem
    if info.get("duration"):
        b = min(b, float(info["duration"]))
    t = time.time()
    if os.path.exists(dst) and os.path.getsize(dst) > 50_000:
        st = "já existia"
    else:
        fmt = F_HD.replace("bv*", "bv*", 1)
        if audio:
            fmt = "/".join(f"{x}+ba" for x in F_HD.split("/")) + "/b"
        src = ["--load-info-json", fn_info] if fn_info else [url]
        args = ["-q", "--no-part", "-f", fmt, "-S", SORT, "--download-sections", f"*{a:.3f}-{b:.3f}",
                "--merge-output-format", "mp4", "-o", dst]
        rc, _, err = yt(args + src)
        if (rc or not os.path.exists(dst)) and fn_info:
            rc, _, err = yt(args + [url])                      # página vencida: direto pela URL
        if rc or not os.path.exists(dst) or os.path.getsize(dst) < 50_000:
            if os.path.exists(dst):
                os.remove(dst)
            return nome, dst, "FALHOU", err[:200], time.time() - t, None, (a, b)
        st = "ok"
    pr = ffprobe(dst)
    vid = info.get("id") or ""
    prev = os.path.join(P, "clipes", "prev", f"{vid}.mp4")
    real = confere_inicio(dst, prev, a) if vid and os.path.exists(prev) else None
    return nome, dst, st, "", time.time() - t, (pr, real), (a, b)


def main():
    a = sys.argv[1:]
    if len(a) < 2 or a[0].startswith("-"):
        sys.exit(__doc__)
    opt = lambda k, d=None: a[a.index(k) + 1] if k in a else d
    P = projeto(a[0])
    lista = a[1] if os.path.isabs(a[1]) else os.path.join(P, a[1]) if os.path.exists(os.path.join(P, a[1])) else a[1]
    nj, margem = int(opt("-j", "4")), float(opt("--margem", "1"))
    audio, baixa_ok = "--audio" in a, "--aceita-baixa" in a
    for d in ("hd", "info"):
        os.makedirs(os.path.join(P, "clipes", d), exist_ok=True)
    jobs = []
    for ln in open(lista, encoding="utf-8"):
        p = ln.split("#")[0].split()
        if len(p) < 3:
            continue
        for k, s in enumerate(p[2:], 1):
            i, f = s.split("-")
            jobs.append((p[0], url_de(p[1]), k, seg(i), seg(f)))
    t0 = time.time()
    urls = sorted({j[1] for j in jobs})
    with ThreadPoolExecutor(nj) as ex:
        infos = dict(zip(urls, ex.map(lambda u: le_info(u, os.path.join(P, "clipes", "info")), urls)))
    ruins = set()
    for u, (fn, info) in infos.items():
        if not fn:
            print(f"FALHOU  {u}: página não abriu ({info.get('erro')})")
            ruins.add(u)
            continue
        p = melhor_p(info)
        if p < 720 and not baixa_ok:
            print(f"FALHOU  {u}: só existe {p}p (< 720p). Troque a fonte ou use --aceita-baixa (só largo/cartão).")
            ruins.add(u)
    jobs = [j for j in jobs if j[1] not in ruins]
    fontes = os.path.join(P, "clipes", "fontes.md")
    linhas, n_err = [], len(ruins)
    with ThreadPoolExecutor(nj) as ex:
        futs = [ex.submit(baixa, j, P, margem, audio, infos) for j in jobs]
        for fu in futs:
            nome, dst, st, err, dt, extra, (ta, tb) = fu.result()
            info = infos[[j for j in jobs if j[0] == nome][0][1]][1]
            base = os.path.basename(dst)[:-4]
            if st == "FALHOU":
                n_err += 1
                print(f"FALHOU  {base:20s} {ta:.1f}-{tb:.1f}  {err}")
                continue
            pr, real = extra
            if not pr:
                n_err += 1
                print(f"FALHOU  {base:20s} ffprobe não leu o arquivo")
                continue
            W, H, fps, cod, dur = pr
            av = []
            if min(W, H) < 720:
                av.append("ABAIXO DE 720p")
            if real is not None and abs(real - ta) > 0.08:
                av.append(f"arquivo começa em {real:.2f} s da fonte (pedido {ta:.2f}) -> use o início real")
            ini_arq = real if real is not None else ta
            print(f"{st:10s} {base:20s} {W}x{H} {fps:6.3f} q/s {cod:5s} {dur:6.2f} s  fonte {ta:.2f}-{tb:.2f}  "
                  f"({dt:.0f} s)" + (f"  início conferido {real:.2f}" if real is not None else "  (sem prévia p/ conferir)")
                  + ("  AVISO: " + "; ".join(av) if av else ""), flush=True)
            json.dump({"nome": base, "url": info.get("webpage_url"), "id": info.get("id"), "canal": info.get("channel"),
                       "trecho_fonte": [round(ta, 3), round(tb, 3)], "inicio_arquivo": ini_arq, "inicio_conferido": real is not None,
                       "WxH": f"{W}x{H}", "fps": round(fps, 3), "codec": cod, "duracao": round(dur, 3)},
                      open(dst[:-4] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            d = info.get("upload_date") or ""
            linhas.append(" | ".join([base, info.get("channel") or info.get("uploader") or "", info.get("webpage_url") or "",
                                      f"{d[:4]}-{d[4:6]}-{d[6:]}" if len(d) == 8 else "", f"{ta:.1f}-{tb:.1f} s",
                                      info.get("license") or "YouTube padrão (uso editorial, crédito ao canal)"]))
    if linhas and os.path.exists(fontes):                          # rodar de novo não repete o crédito de quem já está lá
        ja = {l.split(' | ')[0].strip() for l in open(fontes, encoding='utf-8') if ' | ' in l}
        linhas = [l for l in linhas if l.split(' | ')[0].strip() not in ja]
    if linhas:
        novo = not os.path.exists(fontes)
        with open(fontes, "a", encoding="utf-8") as fh:
            if novo:
                fh.write("# Fontes dos clipes (edit-tng)\n\nnome | canal | url | data de upload | trecho | licença\n---|---|---|---|---|---\n")
            fh.write("\n".join(linhas) + "\n")
    print(f"{len(linhas)} ok, {n_err} falharam em {time.time() - t0:.0f} s -> {os.path.join(P, 'clipes', 'hd')}")
    sys.exit(1 if n_err else 0)


if __name__ == "__main__":
    main()
