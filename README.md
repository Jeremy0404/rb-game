# RB Game

A small 2D trap platformer with three controls (left, right, jump): discover a trap, die, and try
again knowing how it works.

## Prerequisites

- Node.js 22 and npm (lint and tests only; the game itself has no build step)
- Docker (optional, to serve the game the way it is deployed)

## Getting started

```bash
npm ci
python3 -m http.server 8080 --directory public
```

Then open http://localhost:8080. To serve it from the production image instead:

```bash
docker build -t rb-game .
docker run --rm -p 8080:8080 rb-game
```

## Deploy

The game is served at https://rbgame.jerco.fr from the `mediaserver` host: a read-only
`nginx-unprivileged` container on the `scoobydoo` network, behind Nginx Proxy Manager, with
`public/` bind-mounted from `~/rb-game/` on the server. From an up-to-date, clean `main`:

```bash
./deploy/ship.sh
```

It copies `deploy/` and `public/` to the server with `rsync`, starts the container or reloads
nginx, and fails unless the public URL answers 200.

## Scripts

- `npm run lint` — lint the game and the tests with ESLint.
- `npm test` — replay the recorded winning routes of every room against the real update loop and
  run the targeted trap checks.
