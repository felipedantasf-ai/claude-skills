# Instala o Kit_Edicao_Vox_v2 num computador novo, baixando do Google Drive do Felipe.
# Uso: clique duas vezes em BAIXAR_KIT.bat (na pasta das skills). Pode rodar de novo: so baixa o que mudou.
$ErrorActionPreference = 'Stop'
$env:PYTHONUTF8 = '1'
function Passo($t) { Write-Host ""; Write-Host "== $t ==" -ForegroundColor Cyan }
function Tem($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function Recarrega-Path { $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User') }

Passo "1/6 Programas (Git, uv, FFmpeg, Node, rclone)"
$pacotes = @{ git='Git.Git'; uv='astral-sh.uv'; ffmpeg='Gyan.FFmpeg'; node='OpenJS.NodeJS.LTS'; rclone='Rclone.Rclone' }
foreach ($c in $pacotes.Keys) {
  if (-not (Tem $c)) { Write-Host "Instalando $c..."; winget install -e --id $pacotes[$c] --accept-source-agreements --accept-package-agreements | Out-Host; Recarrega-Path }
}
if (-not (Tem rclone)) {
  $r = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Rclone.Rclone_*\rclone-*\rclone.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($r) { $env:Path += ';' + $r.DirectoryName }
}
foreach ($c in 'uv','ffmpeg','rclone') { if (-not (Tem $c)) { throw "O programa '$c' nao ficou disponivel. Feche esta janela e rode o BAIXAR_KIT.bat de novo." } }

Passo "2/6 Pasta H:\Edição Claude"
# As skills usam o caminho H:\Edição Claude. Sem disco H:, criamos uma letra H: apontando para C:\H (volta sozinha a cada login).
if (-not (Test-Path 'H:\')) {
  New-Item -ItemType Directory -Force 'C:\H' | Out-Null
  subst H: C:\H
  New-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'LetraH_Kit' -Value 'subst H: C:\H' -PropertyType String -Force | Out-Null
  Write-Host "Este PC nao tinha disco H:. Criei H: apontando para C:\H."
}
$KIT = 'H:\Edição Claude\Kit_Edicao_Vox_v2'
New-Item -ItemType Directory -Force $KIT, "$KIT\projetos", 'H:\Downloads\Edicoes_Claude' | Out-Null

Passo "3/6 Login no Google Drive"
$remotos = (& rclone listremotes) -join ' '
if ($remotos -notmatch 'gdrive:') {
  Write-Host "Vai abrir o navegador: entre com felipedantasf@gmail.com e autorize o rclone."
  & rclone config create gdrive drive scope=drive | Out-Host
}

Passo "4/6 Baixando o kit (~17 GB na primeira vez)"
& rclone copy "gdrive:Claude Code/Kit_Edicao_Vox_v2" $KIT --transfers 8 --stats 30s --stats-one-line -P
if ($LASTEXITCODE -ne 0) { throw "O download do kit falhou (rclone codigo $LASTEXITCODE). Rode de novo: ele continua de onde parou." }

Passo "5/6 Ambientes Python (.venv, .venv_audio, .venv_ia)"
Set-Location $KIT
$cuda = '--extra-index-url', 'https://download.pytorch.org/whl/cu128', '--index-strategy', 'unsafe-best-match'
foreach ($v in @(@('.venv','requisitos\venv.txt',$false), @('.venv_audio','requisitos\venv_audio.txt',$true), @('.venv_ia','requisitos\venv_ia.txt',$true))) {
  $nome, $req, $gpu = $v
  if (-not (Test-Path "$nome\Scripts\python.exe")) { & uv venv --python 3.12 $nome | Out-Host }
  $extra = @(); if ($gpu) { $extra = $cuda }
  # --no-deps: instala exatamente as versoes que funcionam no PC principal (a lista ja tem todas as dependencias)
  & uv pip install --python "$nome\Scripts\python.exe" --no-deps -r $req @extra | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "Falhou ao instalar os pacotes de $nome." }
}
& .venv\Scripts\python.exe -m playwright install chromium | Out-Host
setx PYTHONUTF8 1 | Out-Null
setx VOX_KIT $KIT | Out-Null

Passo "6/6 Conferindo"
$ok = $true
foreach ($p in 'pipeline.py','biblioteca','modelos\sherpa-onnx-whisper-small','modelos\faster-whisper-large-v3','.venv\Scripts\python.exe','.venv_audio\Scripts\python.exe','.venv_ia\Scripts\python.exe') {
  if (Test-Path "$KIT\$p") { Write-Host "  ok  $p" } else { Write-Host "  FALTA  $p" -ForegroundColor Red; $ok = $false }
}
& .venv_ia\Scripts\python.exe -c "import torch; print('  GPU (CUDA):', torch.cuda.is_available())"
if (-not $ok) { throw "Faltou algo acima." }
Write-Host ""
Write-Host "Kit pronto em $KIT." -ForegroundColor Green
Write-Host "Fora do kit (so se precisar): ComfyUI/Qwen (imagens locais, H:\ComfyUI) e MFA (C:\mfa) nao vem por aqui."
Write-Host "No app do Claude, aba Code: abra a pasta H:\Edição Claude e edite normalmente."
