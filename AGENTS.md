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

## Features añadidas vía worktrees

Feature branches live as worktrees under `.worktrees/` (gitignored); each one added a feature, all merged into `02-union-worktrees` (the branch checked out in the main directory):

| Worktree / rama | Feature | Dónde vive en `game.js` |
| --------------- | ------- | ------------------------ |
| `shield` | 🛡 Escudo power-up: burbuja que repele asteroides en vez de matar | `Ship.shieldUp()`, bloque de burbuja en `Ship.draw()`, rama de colisión nave↔asteroide, sección `// ── Power-ups ──` |
| `skins` | 5 skins de nave, ciclo con `C`, persistencia en `localStorage` | bloque `// ── Skins de la nave ──` (antes de `Ship`), silueta en `Ship.draw()`, `drawLifeIcon()` |
| `triple-shot` | ∴ Triple power-up: 3 balas en abanico (±4°) | `Ship.tripleShot()`, `tryShoot()`, sección `// ── Power-ups ──` |

Otras features llegaron por commits directos en la línea principal: `feature velocidad` (⚡), `estrella fugaz` (`ShootingStar`), `/init`.

No borres worktrees ni ramas: el usuario los elimina a mano. Si vas a editar una feature, hazlo en su worktree y rama, no en la de integración.

## Gotchas

- **Canvas size is duplicated**: `index.html` sets `width="800" height="600"` and `game.js` hardcodes `const W = 800; const H = 600;` used by all logic and rendering (including wrapping). Change both together.
- **Three power-ups, one API**: `PowerUp(x, y, kind)` where `kind` is `'speed' | 'shield' | 'triple'` (`POWERUP_KINDS`, ~20 % total drop per destroyed asteroid, uniform pick). The ship carries `speedTimer` / `shieldTimer` / `tripleTimer` (+ `shieldFlash`), all 5 s (`SPEED_DUR` / `SHIELD_DUR` / `TRIPLE_DUR`); shield repels instead of killing, triple fires ±4° extra bullets (`TRIPLE_SPREAD`). Adding a kind means touching: the constants, `PowerUp.draw()`, the drop pick, the pickup branch in `update()`, and the HUD block — they are separate code sites.
- **Skins are mostly cosmetic**: `SKINS` array, cycled with `C` (`cycleSkin()`, persisted in `localStorage` key `asteroids.skin`). Every silhouette must keep the nose at x≈20 and the tail at x≈-12 — `tryShoot()` uses `NOSE = 21 × skinScale()` and collision uses `radius = 12 × skinScale()`. Two optional per-skin fields break the "purely cosmetic" rule: `scale` (multiplies drawing, nose, collision radius, shield bubble and life icons) and `scoreMul` (multiplies points in the bullet-vs-asteroid branch of `update()`); the helpers `skinScale()` / `scoreMul()` default both to 1. Skin `Titán` (index 5) ships with `scale: 2` + `scoreMul: 2`.
- **Estrella fugaz**: `ShootingStar extends Asteroid` (spawns on `STAR_GAP`). Level completion is `asteroids.every(a => a instanceof ShootingStar)` — a living star must not block the level.
- **Spanish everywhere**: README, code comments, HUD (`SCORE`, `NIVEL`), and overlays are Spanish. Keep new user-facing strings and comments in Spanish.
- **Script, not a module**: `game.js` runs top-to-bottom on load (`initGame()` then `requestAnimationFrame(loop)`). No imports/exports; keep it one classic script.
- **Input model**: `keys[code]` is held state; `pressed(code)` is edge-triggered and consumes the flag — use it for one-shot actions (fire, restart, `C`), `keys[...]` for continuous movement (rotate, thrust).
- **Game state**: top-level `state` is `'playing' | 'dead' | 'gameover'`; `update()` and `draw()` branch on it. New states must be handled in both.
- **Entities** carry a `dead` flag and are filtered out each frame; bullets vs asteroid and ship vs asteroid collisions are resolved inline in `update()`.
- `dt` is clamped to 0.05s in `loop()` — keep that clamp to avoid physics jumps on tab refocus.
