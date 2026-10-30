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

## Scripts

- `npm run lint` — lint the game and the tests with ESLint.
- `npm test` — replay the recorded winning routes of every room against the real update loop and
  run the targeted trap checks.

## Playing on a phone

Open the game in your browser. Landscape gives the most room: direction buttons sit on the
left and jump on the right, outside the playfield. Slide between directions and hold jump
longer for a higher jump. Portrait is also supported.

The game pauses when you switch apps or rotate the screen; tap **Reprendre** to continue.
The pause menu lets you show or hide touch controls and request fullscreen when supported.
On desktop, **Escape** toggles pause; the existing movement keys still work.

`npm test` also checks simultaneous input sources, touch cancellation, direction sliding,
and pause/resume. Real-device checks on iPhone and Android are still needed for touch comfort
and system gestures; browser viewport checks alone do not establish those.
