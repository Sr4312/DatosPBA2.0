---
name: git-workflow
description: Git branching strategy, commit conventions, and PR best practices
---

# Git Workflow Skill

Clean git history makes codebases easier to maintain and bugs easier to trace. Follow these conventions consistently.

## Branch Naming

```
feature/short-description
fix/short-description
chore/short-description
docs/short-description
```

Branch from `main` (or `develop` if the project uses it). Never commit directly to `main`.

## Commit Messages

Format: `<type>: <short summary in present tense>`

Types:
- `feat` — new feature
- `fix` — bug fix
- `refactor` — restructure without behavior change
- `chore` — tooling, deps, config
- `docs` — documentation only
- `test` — adding or fixing tests
- `perf` — performance improvement

Rules:
- Summary line: max 72 characters, imperative mood ("add X", not "added X")
- No period at the end
- If more context is needed, add a blank line then a body paragraph

Good: `fix: handle null user in session middleware`
Bad: `fixed stuff`, `WIP`, `update`

## Pull Requests

1. One PR = one logical change. Don't bundle unrelated fixes.
2. PR title follows the same commit convention.
3. Description must include: what changed, why it changed, how to test it.
4. Keep PRs small — under 400 lines of diff where possible.
5. Rebase or merge `main` before requesting review.
6. Don't force-push to shared branches after review has started.

## Common Commands

```bash
# Start a feature
git checkout -b feature/my-feature

# Stage specific files (never -A blindly)
git add src/specific-file.js

# Amend last commit (only if not pushed)
git commit --amend --no-edit

# Rebase onto latest main
git fetch origin
git rebase origin/main

# Undo last commit, keep changes staged
git reset --soft HEAD~1

# View clean log
git log --oneline --graph --decorate
```

## What NOT to Do

- Never force-push `main`
- Never commit `.env`, secrets, or build artifacts
- Never skip pre-commit hooks (`--no-verify`) — fix the underlying issue
- Never use `git add .` without reviewing what's staged first
