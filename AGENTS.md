# AGENTS.md

Vanilla HTML5 canvas Asteroids clone. No dependencies, no bundler, no `package.json`, no test/lint/typecheck/build step. Everything is four files:

- `index.html` — page shell, inline CSS, fixed `<canvas>` (800×600), loads `game.js` as a classic script
- `game.js` — the entire game: input, entity classes, state machine, `update()`/`draw()`, main loop (sections marked with `// ── Name ──` dividers)
- `README.md`, `favicon.svg`

## Run / verify

```bash
npx serve .   # then open http://localhost:3000
```

Opening `index.html` directly in a browser also works (no server required). Verification is **manual**: play it and watch the browser console. Do not add a toolchain, module system, or `package.json` unless explicitly asked.

## Gotchas

- **Canvas size is duplicated**: `index.html` sets `width="800" height="600"` and `game.js` hardcodes `const W = 800; const H = 600;` used by all logic and rendering (including wrapping). Change both together.
- **Only one power-up exists**: `Velocidad` (⚡, ~20 % drop per destroyed asteroid, `THRUST` ×2 for 5 s via `ship.speedTimer`; constants `SPEED_DUR`/`DROP_CHANCE`). Don't assume other power-ups or asteroid types (e.g. "estrella fugaz") were ever implemented.
- **Spanish everywhere**: README, code comments, HUD (`SCORE`, `NIVEL`), and overlays are Spanish. Keep new user-facing strings and comments in Spanish.
- **Script, not a module**: `game.js` runs top-to-bottom on load (`initGame()` then `requestAnimationFrame(loop)`). No imports/exports; keep it one classic script.
- **Input model**: `keys[code]` is held state; `pressed(code)` is edge-triggered and consumes the flag — use it for one-shot actions (fire, restart), `keys[...]` for continuous movement (rotate, thrust).
- **Game state**: top-level `state` is `'playing' | 'dead' | 'gameover'`; `update()` and `draw()` branch on it. New states must be handled in both.
- **Entities** carry a `dead` flag and are filtered out each frame; bullets vs asteroid and ship vs asteroid collisions are resolved inline in `update()`.
- `dt` is clamped to 0.05s in `loop()` — keep that clamp to avoid physics jumps on tab refocus.
