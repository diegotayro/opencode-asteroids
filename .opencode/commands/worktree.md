---
description: Crear un git worktree bajo .worktrees/ con nombre slugificado a partir del argumento
---

!`SLUG=$(printf '%s' "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9._-]+/-/g' | sed -E 's/^-+|-+$//g'); git worktree add ".worktrees/$SLUG"`
