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

## Atenção

12 skills chamam o **Kit_Edicao_Vox_v2** em `H:\` (scripts, biblioteca, modelos, .venv).
Sem o kit no outro PC, o Claude lê e entende as skills, mas não consegue renderizar.
O kit é grande demais para o GitHub — copie pelo HD externo/Drive (ver `H:\Edição Claude\migracao_pc_novo`).
