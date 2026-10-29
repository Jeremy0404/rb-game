# Contributing

## Workflow

One task = one branch = one PR.

1. Branch off `main`:
   - `feat/<short-name>` — new feature
   - `fix/<short-name>` — bug fix
   - `chore/<short-name>` — tooling, deps, config
2. Develop and commit using [Conventional Commits](#commits).
3. Push the branch and open a Pull Request.
4. **CI must be green** (lint + tests) before merging.
5. Squash merge into `main` — the only merge method enabled on this repo. The PR title becomes the
   squash commit message, so title it like a Conventional Commit (see below).

`main` is protected: changes land through PRs, never direct pushes.

## Local checks (same as CI)

```bash
npm ci
npm run lint
npm test
```

## Commits

`<type>: <imperative summary>` (lowercase, no trailing period), type in
`feat` / `fix` / `chore`. Examples:

- `feat: add a falling-ceiling room`
- `fix: keep the fleeing door inside the room`
- `chore: bump eslint to 10.7`

## One-time setup

### Branch protection

Settings → Branches → add a rule on `main`: require a pull request and require
the CI status checks to pass (**lint**, **test**).
