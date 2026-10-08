'use strict';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const W = 800;
const H = 600;

// ── Input ─────────────────────────────────────────────────────────────────────
const keys = {};
const justPressed = {};

window.addEventListener('keydown', e => {
  justPressed[e.code] = !keys[e.code];
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
    e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function pressed(code) {
  const val = justPressed[code];
  justPressed[code] = false;
  return val;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
const wrap  = (v, max) => ((v % max) + max) % max;
const dist  = (a, b)   => Math.hypot(a.x - b.x, a.y - b.y);
const rand  = (min, max) => min + Math.random() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));

// ── Bullet ────────────────────────────────────────────────────────────────────
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    const SPEED = 520;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;
    this.ttl  = 1.1;
    this.radius = 2;
    this.dead = false;
  }

  update(dt) {
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Asteroid ──────────────────────────────────────────────────────────────────
const RADII  = [0, 16, 30, 50];   // por tamaño 1, 2, 3
const SPEEDS = [0, 85, 55, 32];   // velocidad base por tamaño
const POINTS = [0, 100, 50, 20];  // puntos por tamaño

class Asteroid {
  constructor(x, y, size = 3) {
    this.x    = x;
    this.y    = y;
    this.size = size;
    this.radius = RADII[size];
    this.dead = false;

    const angle = rand(0, Math.PI * 2);
    const speed = SPEEDS[size] + rand(-15, 15);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-1.2, 1.2);
    this.rot = rand(0, Math.PI * 2);

    // Polígono irregular
    const n = randInt(8, 13);
    this.verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = this.radius * rand(0.6, 1.0);
      this.verts.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  }

  update(dt) {
    this.x   = wrap(this.x + this.vx * dt, W);
    this.y   = wrap(this.y + this.vy * dt, H);
    this.rot += this.rotSpeed * dt;
  }

  split() {
    if (this.size <= 1) return [];
    return [
      new Asteroid(this.x, this.y, this.size - 1),
      new Asteroid(this.x, this.y, this.size - 1),
    ];
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

// ── Estrella fugaz ────────────────────────────────────────────────────────────
const STAR_SPEED = 300;      // px/s — mucho más rápido que cualquier asteroide
const STAR_DUR   = 6;        // segundos de vida antes de desaparecer
const STAR_GAP   = [6, 12];  // segundos entre apariciones

class ShootingStar extends Asteroid {
  constructor(x, y, size = 2, ttl = STAR_DUR) {
    super(x, y, size);
    // Sobrescribe la velocidad base: mucho más rápida
    const angle = rand(0, Math.PI * 2);
    const speed = STAR_SPEED + rand(-30, 30);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.rotSpeed = rand(-2.5, 2.5);
    this.ttl = ttl;
  }

  update(dt) {
    super.update(dt);
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  split() {
    if (this.size <= 1) return [];
    // Los fragmentos heredan el tiempo restante de la estrella madre
    return [
      new ShootingStar(this.x, this.y, this.size - 1, this.ttl),
      new ShootingStar(this.x, this.y, this.size - 1, this.ttl),
    ];
  }

  draw() {
    // Parpadeo en el último segundo
    if (this.ttl < 1 && Math.floor(this.ttl * 8) % 2 === 0) return;
    const alpha = Math.min(1, this.ttl / 1.5);

    ctx.save();

    // Estela hacia atrás
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = '#ffdf6b';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.15, this.y - this.vy * 0.15);
    ctx.stroke();

    // Cuerpo: mismo polígono irregular que el asteroide, en ámbar
    ctx.globalAlpha = alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.strokeStyle = '#ffdf6b';
    ctx.lineWidth   = 1.5;
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(this.verts[0][0], this.verts[0][1]);
    for (let i = 1; i < this.verts.length; i++)
      ctx.lineTo(this.verts[i][0], this.verts[i][1]);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}

// ── Skins de la nave ──────────────────────────────────────────────────────────
// Casi todas son pura cosmética. Dos campos opcionales (por defecto 1) rompen
// eso: `scale` amplía la nave (dibujo, nariz y radio de colisión) y `scoreMul`
// multiplica los puntos ganados. Cada silueta mantiene la nariz en x≈20 y la
// cola en x≈-12: NOSE y el radio de colisión son 21/12 × scale.
const SKINS = [
  { name: 'Clásica', line: '#fff',    flame: 'rgba(255,130,0,0.85)',
    verts: [[20, 0], [-12, -9], [-7, 0], [-12, 9]] },
  { name: 'Bisturí', line: '#0ff',    flame: 'rgba(0,255,255,0.85)',
    verts: [[21, 0], [-11, -5], [-5, 0], [-11, 5]] },
  { name: 'Cuña', line: '#ffdf6b', flame: 'rgba(255,200,60,0.85)',
    verts: [[20, 0], [-2, -5], [-13, -12], [-9, 0], [-13, 12], [-2, 5]] },
  { name: 'Cometa', line: '#ff5f9e', flame: 'rgba(255,95,158,0.85)',
    verts: [[20, 0], [6, -5], [-4, -4], [-13, -12], [-9, 0],
            [-13, 12], [-4, 4], [6, 5]] },
  { name: 'Trueno', line: '#9f7bff', flame: 'rgba(160,120,255,0.85)',
    verts: [[20, 0], [0, -9], [-12, -4], [-6, 0], [-12, 4], [0, 9]] },
  // Titán: 2× de tamaño (y de objetivo para los asteroides) pero doble de puntos
  { name: 'Titán', line: '#a020f0', flame: 'rgba(160,32,240,0.85)',
    scale: 2, scoreMul: 2,
    verts: [[20, 0], [4, -7], [-12, -12], [-8, 0], [-12, 12], [4, 7]] },
];

const SKIN_KEY = 'asteroids.skin';
let skinIndex     = 0;
let skinMsgTimer  = 0;   // aviso temporal al cambiar de skin con C

try {
  const saved = parseInt(localStorage.getItem(SKIN_KEY), 10);
  if (Number.isInteger(saved) && saved >= 0 && saved < SKINS.length)
    skinIndex = saved;
} catch (e) { /* sin localStorage (file:// o modo privado): skin 0 */ }

function cycleSkin() {
  skinIndex = (skinIndex + 1) % SKINS.length;
  skinMsgTimer = 1.5;
  try { localStorage.setItem(SKIN_KEY, String(skinIndex)); } catch (e) {}
}

// Tamaño y multiplicador de la skin activa (1 = solo cosmética)
const skinScale = () => SKINS[skinIndex].scale || 1;
const scoreMul  = () => SKINS[skinIndex].scoreMul || 1;

// ── Ship ──────────────────────────────────────────────────────────────────────
class Ship {
  constructor() { this.reset(); }

  // Radio de colisión: escala con la skin (Titán → 12 × 2 = 24 px)
  get radius() { return 12 * skinScale(); }

  reset() {
    this.x      = W / 2;
    this.y      = H / 2;
    this.angle  = -Math.PI / 2;
    this.vx     = 0;
    this.vy     = 0;
    this.thrusting     = false;
    this.invincible    = 3;
    this.shootCooldown = 0;
    this.speedTimer    = 0;
    this.shieldTimer   = 0;
    this.shieldFlash   = 0;   // destello de la burbuja al recibir un impacto
    this.tripleTimer   = 0;
    this.dead          = false;
  }

  update(dt) {
    if (this.dead) return;
    if (this.invincible    > 0) this.invincible    -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.speedTimer    > 0) this.speedTimer    -= dt;
    if (this.shieldTimer   > 0) this.shieldTimer   -= dt;
    if (this.shieldFlash   > 0) this.shieldFlash   -= dt;
    if (this.tripleTimer   > 0) this.tripleTimer   -= dt;

    const ROT   = 3.5;   // rad/s
    const THRUST = 260;  // px/s²
    const DRAG   = 0.987;
    // Power-up Velocidad: doble empuje durante 5 s (el giro no cambia)
    const boost = this.speedTimer > 0 ? 2 : 1;

    if (keys['ArrowLeft'])  this.angle -= ROT * dt;
    if (keys['ArrowRight']) this.angle += ROT * dt;

    this.thrusting = !!keys['ArrowUp'];
    if (this.thrusting) {
      this.vx += Math.cos(this.angle) * THRUST * boost * dt;
      this.vy += Math.sin(this.angle) * THRUST * boost * dt;
    }

    this.vx *= DRAG;
    this.vy *= DRAG;
    this.x = wrap(this.x + this.vx * dt, W);
    this.y = wrap(this.y + this.vy * dt, H);
  }

  tryShoot() {
    if (this.shootCooldown > 0 || this.dead) return [];
    this.shootCooldown = 0.2;
    const NOSE = 21 * skinScale();   // la nariz escala con la skin
    const ox = this.x + Math.cos(this.angle) * NOSE;
    const oy = this.y + Math.sin(this.angle) * NOSE;
    // Power-up Triple: 3 balas en abanico estrecho (±4°) desde la nariz
    if (this.tripleTimer > 0) {
      return [
        new Bullet(ox, oy, this.angle - TRIPLE_SPREAD),
        new Bullet(ox, oy, this.angle),
        new Bullet(ox, oy, this.angle + TRIPLE_SPREAD),
      ];
    }
    return [new Bullet(ox, oy, this.angle)];
  }

  // Power-up Velocidad: 5 s de doble empuje (reinicia si ya estaba activo)
  speedUp() {
    this.speedTimer = SPEED_DUR;
  }

  // Power-up Escudo: SHIELD_DUR s de inmunidad a impactos (reinicia si ya estaba activo)
  shieldUp() {
    this.shieldTimer = SHIELD_DUR;
    this.shieldFlash = 0;
  }

  // Power-up Triple: 5 s de disparo en abanico (reinicia si ya estaba activo)
  tripleShot() {
    this.tripleTimer = TRIPLE_DUR;
  }

  draw() {
    if (this.dead) return;

    // Burbuja del escudo: se ve incluso mientras la nave parpadea
    if (this.shieldTimer > 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.beginPath();
      ctx.arc(0, 0, 24 * skinScale(), 0, Math.PI * 2);
      if (this.shieldFlash > 0) {
        // Destello blanco al absorber un impacto
        ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, 0.5 + this.shieldFlash * 2).toFixed(2)})`;
        ctx.lineWidth   = 2.5;
      } else {
        // Pulso suave magenta
        ctx.strokeStyle = `rgba(255,102,255,${(0.55 + Math.sin(this.shieldTimer * 6) * 0.15).toFixed(2)})`;
        ctx.lineWidth   = 1.5;
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,102,255,0.07)';
      ctx.fill();
      ctx.restore();
    }

    // Parpadeo durante invencibilidad de reaparición
    if (this.invincible > 0 && Math.floor(this.invincible * 8) % 2 === 0) return;

    const skin = SKINS[skinIndex];
    const s = skinScale();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(s, s);
    ctx.strokeStyle = skin.line;
    ctx.lineWidth   = 1.5 / s;   // compensa el scale → 1.5 px efectivos
    ctx.lineJoin    = 'round';

    // Silueta de la skin activa
    ctx.beginPath();
    ctx.moveTo(skin.verts[0][0], skin.verts[0][1]);
    for (let i = 1; i < skin.verts.length; i++)
      ctx.lineTo(skin.verts[i][0], skin.verts[i][1]);
    ctx.closePath();
    ctx.stroke();

    // Llama del propulsor
    if (this.thrusting && Math.random() > 0.35) {
      ctx.beginPath();
      ctx.moveTo(-8, -4);
      ctx.lineTo(-8 - rand(6, 14), 0);
      ctx.lineTo(-8,  4);
      ctx.strokeStyle = skin.flame;
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ── Partículas (explosión) ────────────────────────────────────────────────────
class Particle {
  constructor(x, y) {
    this.x  = x;
    this.y  = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(30, 130);
    this.vx   = Math.cos(angle) * speed;
    this.vy   = Math.sin(angle) * speed;
    this.life = rand(0.4, 1.1);
    this.ttl  = this.life;
    this.dead = false;
  }

  update(dt) {
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.ttl -= dt;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    const alpha = this.ttl / this.life;
    ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.05, this.y - this.vy * 0.05);
    ctx.stroke();
  }
}

// ── Power-ups ─────────────────────────────────────────────────────────────────
const SPEED_DUR     = 5;                 // segundos de doble empuje (⚡ Velocidad)
const SHIELD_DUR    = 5;                 // segundos de inmunidad a impactos (🛡 Escudo)
const TRIPLE_DUR    = 5;                 // segundos de disparo en abanico (∴ Triple)
const TRIPLE_SPREAD = 4 * Math.PI / 180; // ±4° de dispersión del triple shot
const DROP_CHANCE   = 0.2;               // probabilidad de drop al destruir un asteroide
const POWERUP_KINDS = ['speed', 'shield', 'triple'];  // tipo al azar (uniforme)

class PowerUp {
  constructor(x, y, kind = 'speed') {
    this.x = x;
    this.y = y;
    this.kind = kind;      // 'speed' (⚡) | 'shield' (🛡) | 'triple' (∴)
    this.radius = 14;
    this.ttl    = 10;      // si nadie lo toma, desaparece
    this.phase  = rand(0, Math.PI * 2);
    this.dead   = false;
  }

  update(dt) {
    this.ttl   -= dt;
    this.phase += dt * 5;
    if (this.ttl <= 0) this.dead = true;
  }

  draw() {
    // Parpadeo en los últimos 2 s
    if (this.ttl < 2 && Math.floor(this.ttl * 8) % 2 === 0) return;

    const isTriple = this.kind === 'triple';

    const s = 1 + Math.sin(this.phase) * 0.1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(s, s);

    // Círculo contenedor: cian = Velocidad, magenta = Escudo / Triple
    ctx.strokeStyle = this.kind === 'speed' ? '#0ff' : (isTriple ? '#f0f' : '#f6f');
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (this.kind === 'shield') {
      // Glifo de escudo
      ctx.strokeStyle = '#f6f';
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(-7, -8);
      ctx.lineTo( 7, -8);
      ctx.lineTo( 7,  1);
      ctx.lineTo( 0,  9);
      ctx.lineTo(-7,  1);
      ctx.closePath();
      ctx.stroke();
    } else if (isTriple) {
      // Abanico de 3 líneas divergentes desde la nariz
      ctx.strokeStyle = '#fff';
      ctx.lineWidth   = 1.5;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.lineTo(-6, -7);
      ctx.moveTo(0, 9);
      ctx.lineTo(0, -8);
      ctx.moveTo(0, 9);
      ctx.lineTo(6, -7);
      ctx.stroke();
    } else {
      // Rayo amarillo
      ctx.fillStyle = '#ff0';
      ctx.beginPath();
      ctx.moveTo( 2, -10);
      ctx.lineTo(-8,   2);
      ctx.lineTo(-1,   2);
      ctx.lineTo( -2, 10);
      ctx.lineTo(  8, -2);
      ctx.lineTo(  1, -2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

// ── Estado del juego ──────────────────────────────────────────────────────────
let ship, bullets, asteroids, particles, powerups;
let score, lives, level;
let state;      // 'playing' | 'dead' | 'gameover'
let deadTimer;
let starTimer;  // cuenta atrás para la próxima estrella fugaz

// Punto aleatorio a distancia segura de la nave (para spawneos)
function safePos() {
  const SAFE_DIST = 130;
  let x, y;
  do {
    x = rand(0, W);
    y = rand(0, H);
  } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
  return { x, y };
}

function spawnAsteroids(count) {
  for (let i = 0; i < count; i++) {
    const p = safePos();
    asteroids.push(new Asteroid(p.x, p.y, 3));
  }
}

function spawnShootingStar() {
  const p = safePos();
  asteroids.push(new ShootingStar(p.x, p.y));
}

function initGame() {
  ship          = new Ship();
  bullets   = [];
  asteroids = [];
  particles = [];
  powerups  = [];
  score  = 0;
  lives  = 3;
  level  = 1;
  state  = 'playing';
  starTimer = rand(...STAR_GAP);
  spawnAsteroids(4);
}

function nextLevel() {
  level++;
  bullets   = [];
  particles = [];
  powerups  = [];
  asteroids = [];   // las estrellas fugaces no sobreviven al cambio de nivel
  ship.reset();
  spawnAsteroids(3 + level);
}

function explode(x, y, count = 8) {
  for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
}

function killShip() {
  explode(ship.x, ship.y, 14);
  ship.dead = true;
  lives--;
  if (lives <= 0) {
    state = 'gameover';
  } else {
    state     = 'dead';
    deadTimer = 2;
  }
}

// ── Update ────────────────────────────────────────────────────────────────────
function update(dt) {
  // Cambio de skin con C: disponible en cualquier estado
  if (pressed('KeyC')) cycleSkin();
  skinMsgTimer = Math.max(0, skinMsgTimer - dt);

  if (state === 'gameover') {
    if (pressed('Space')) initGame();
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    return;
  }

  if (state === 'dead') {
    deadTimer -= dt;
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => !p.dead);
    asteroids.forEach(a => a.update(dt));
    asteroids = asteroids.filter(a => !a.dead);  // estrellas que expiran durante la pausa
    if (deadTimer <= 0) { state = 'playing'; ship.reset(); }
    return;
  }

  // Disparar
  if (pressed('Space')) {
    bullets.push(...ship.tryShoot());
  }

  ship.update(dt);
  bullets.forEach(b => b.update(dt));
  asteroids.forEach(a => a.update(dt));
  particles.forEach(p => p.update(dt));
  powerups.forEach(p => p.update(dt));

  // Estrella fugaz: aparición periódica (más frecuente en niveles altos)
  starTimer -= dt;
  if (starTimer <= 0) {
    spawnShootingStar();
    starTimer = rand(...STAR_GAP) * Math.max(0.6, 1 - (level - 1) * 0.08);
  }

  bullets   = bullets.filter(b => !b.dead);
  particles = particles.filter(p => !p.dead);
  powerups  = powerups.filter(p => !p.dead);

  // Bala vs asteroide
  const newAsteroids = [];
  for (const b of bullets) {
    for (const a of asteroids) {
      if (!a.dead && !b.dead && dist(b, a) < a.radius) {
        b.dead = true;
        a.dead = true;
        score += POINTS[a.size] * scoreMul();   // Titán: doble de puntos
        explode(a.x, a.y, a.size * 5);
        if (Math.random() < DROP_CHANCE) {
          const kind = POWERUP_KINDS[Math.floor(Math.random() * POWERUP_KINDS.length)];
          powerups.push(new PowerUp(a.x, a.y, kind));
        }
        newAsteroids.push(...a.split());
      }
    }
  }
  asteroids = asteroids.filter(a => !a.dead).concat(newAsteroids);
  bullets   = bullets.filter(b => !b.dead);

  // Nave vs asteroide
  if (ship.invincible <= 0) {
    for (const a of asteroids) {
      if (dist(ship, a) < ship.radius + a.radius * 0.82) {
        if (ship.shieldTimer > 0) {
          // Escudo activo: repele al asteroide en vez de matar la nave.
          // Empujón fijo (no se acumula) con cooldown para evitar slingshots
          if (ship.shieldFlash <= 0) {
            const dx = a.x - ship.x;
            const dy = a.y - ship.y;
            const d  = Math.hypot(dx, dy) || 1;
            a.vx = (dx / d) * 260;
            a.vy = (dy / d) * 260;
            ship.shieldFlash = 0.25;
          }
        } else {
          killShip();
          break;
        }
      }
    }
  }

  // Power-up vs nave
  for (const p of powerups) {
    if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
      p.dead = true;
      if (p.kind === 'shield') ship.shieldUp();
      else if (p.kind === 'triple') ship.tripleShot();
      else ship.speedUp();
    }
  }
  powerups = powerups.filter(p => !p.dead);

  // Nivel completado: las estrellas fugaces no lo bloquean
  // (vacío o solo estrellas → nivel superado)
  if (asteroids.every(a => a instanceof ShootingStar)) nextLevel();
}

// ── Draw ──────────────────────────────────────────────────────────────────────
function drawLifeIcon(x, y) {
  const skin = SKINS[skinIndex];
  const s = 0.45 * skinScale();   // Titán: icono proporcional a la nave
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(s, s);
  ctx.strokeStyle = skin.line;
  ctx.lineWidth   = 1.2 / s;   // compensa el scale → 1.2 px efectivos
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(skin.verts[0][0], skin.verts[0][1]);
  for (let i = 1; i < skin.verts.length; i++)
    ctx.lineTo(skin.verts[i][0], skin.verts[i][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#fff';
  ctx.font = '15px monospace';

  ctx.textAlign = 'left';
  const scoreText = `SCORE  ${score}`;
  ctx.fillText(scoreText, 14, 26);

  // Multiplicador de la skin activa (Titán: ×2)
  if (scoreMul() > 1) {
    ctx.fillStyle = SKINS[skinIndex].line;
    ctx.fillText(` ×${scoreMul()}`, 14 + ctx.measureText(scoreText).width, 26);
    ctx.fillStyle = '#fff';
  }

  ctx.textAlign = 'center';
  ctx.fillText(`NIVEL ${level}`, W / 2, 26);

  const lifeGap = 22 * skinScale();   // Titán: iconos más grandes, más separación
  for (let i = 0; i < lives; i++)
    drawLifeIcon(W - 16 - i * lifeGap, 18);

  // Power-ups activos (🛡 Escudo, ⚡ Velocidad y ∴ Triple)
  if (state === 'playing') {
    ctx.textAlign = 'left';
    ctx.font = '13px monospace';
    let y = 44;
    if (ship.shieldTimer > 0) {
      ctx.fillStyle = '#f6f';
      ctx.fillText(`🛡 ${ship.shieldTimer.toFixed(1)}s`, 14, y);
      y += 18;
    }
    if (ship.speedTimer > 0) {
      ctx.fillStyle = '#0ff';
      ctx.fillText(`⚡ x2 ${ship.speedTimer.toFixed(1)}s`, 14, y);
      y += 18;
    }
    if (ship.tripleTimer > 0) {
      ctx.fillStyle = '#f0f';
      ctx.fillText(`∴ x3 ${ship.tripleTimer.toFixed(1)}s`, 14, y);
    }
  }

  // Aviso de cambio de skin (tecla C)
  if (skinMsgTimer > 0) {
    const skin = SKINS[skinIndex];
    const bonus = skin.scoreMul > 1 ? `  ×${skin.scoreMul} PTS` : '';
    ctx.textAlign   = 'center';
    ctx.font        = '13px monospace';
    ctx.fillStyle   = `rgba(255,255,255,${Math.min(1, skinMsgTimer / 0.5).toFixed(2)})`;
    ctx.fillText(`SKIN  ${skin.name}${bonus}`, W / 2, 44);
  }
}

function drawOverlay(title, sub) {
  ctx.textAlign   = 'center';
  ctx.fillStyle   = '#fff';
  ctx.font        = 'bold 46px monospace';
  ctx.fillText(title, W / 2, H / 2 - 18);
  ctx.font        = '18px monospace';
  ctx.fillStyle   = 'rgba(255,255,255,0.65)';
  ctx.fillText(sub, W / 2, H / 2 + 22);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  particles.forEach(p => p.draw());
  asteroids.forEach(a => a.draw());
  bullets.forEach(b => b.draw());
  powerups.forEach(p => p.draw());
  ship.draw();

  drawHUD();

  if (state === 'gameover')
    drawOverlay('GAME OVER', `PUNTAJE: ${score}   —   ESPACIO PARA REINICIAR`);
}

// ── Loop principal ────────────────────────────────────────────────────────────
let lastTime = null;

function loop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

initGame();
requestAnimationFrame(loop);
