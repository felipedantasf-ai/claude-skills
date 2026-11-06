@echo off
cd /d "%~dp0"
git add -A
git commit -m "Atualiza skills (%COMPUTERNAME% %DATE%)"
git pull --rebase
git push
pause
