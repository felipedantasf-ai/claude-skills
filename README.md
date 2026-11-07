# Skills do Claude Code — Felipe

Repositório **privado** com as skills de edição (pasta `~/.claude/skills`).

## Usar num computador novo (uma vez)

1. Instale o Git e o GitHub CLI (PowerShell):
   ```
   winget install --id Git.Git -e
   winget install --id GitHub.cli -e
   ```
2. Entre na conta `felipedantasf-ai`: `gh auth login --web`
3. Baixe as skills para a pasta do Claude:
   ```
   gh repo clone felipedantasf-ai/claude-skills "$HOME\.claude\skills"
   ```
   (Se a pasta `skills` já existir, renomeie-a antes.)
4. Abra o Claude Code: as skills aparecem sozinhas.

## No dia a dia

- `SALVAR.bat` — envia para o GitHub o que mudou nas skills neste PC.
- `ATUALIZAR.bat` — baixa o que foi mudado em outro PC.

Rode ATUALIZAR antes de começar e SALVAR depois de mexer nas skills, para os dois PCs não divergirem.

## O kit (obrigatório para editar)

12 skills chamam o **Kit_Edicao_Vox_v2** em `H:\Edição Claude\` (scripts, biblioteca, modelos, ambientes Python).
Ele fica no Google Drive (`Claude Code/Kit_Edicao_Vox_v2`, ~17 GB, sem os projetos).

No computador novo, depois de clonar as skills, clique duas vezes em **BAIXAR_KIT.bat**. Ele:
instala Git/uv/FFmpeg/Node/rclone, cria `H:` se o PC não tiver (aponta para `C:\H`), pede o login do Google,
baixa o kit, recria `.venv`, `.venv_audio` e `.venv_ia` (CUDA 12.8) e confere tudo. Rodar de novo baixa só o que mudou.

Não vêm por aqui: ComfyUI/Qwen (`H:\ComfyUI`, imagens locais) e MFA (`C:\mfa`).

No PC principal, depois de mudar o kit, clique em `H:\Edição Claude\Kit_Edicao_Vox_v2\SUBIR_KIT_DRIVE.bat` (ou peça ao Claude: "sobe o kit pro Drive").
