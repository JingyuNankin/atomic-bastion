import type { Arena } from './player';
import type { GameArt } from '../systems/game-art';
import { getProjectile, type ProjectileId } from '../weapons/catalog';

export type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  projectileId: ProjectileId;
  life?: number;
  maxLife?: number;
  length?: number;
  spread?: number;
  age?: number;
  flightTime?: number;
  fuseTime?: number;
  hop?: number;
  startHop?: number;
  spin?: number;
  blastRadius?: number;
  damage?: number;
  knockback?: number;
  pierce?: number;
  hitInterval?: number;
  boomed?: boolean;
  struck?: number[];
};

const DESPAWN_PAD = 48;
const BEAM_RGB = { r: 0, g: 255, b: 80 };

export function updateProjectiles(
  projectiles: Projectile[],
  dt: number,
  arena: Arena,
): void {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    const def = getProjectile(shot.projectileId);

    if (shot.life !== undefined) {
      shot.life -= dt;
      if (shot.life <= 0) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    if (def.style === 'beam' || def.style === 'flame') {
      continue;
    }

    if (def.style === 'grenade') {
      updateGrenade(shot, dt, arena);
      continue;
    }

    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;

    if (
      shot.x < arena.left - DESPAWN_PAD ||
      shot.x > arena.right + DESPAWN_PAD ||
      shot.y < arena.top - DESPAWN_PAD ||
      shot.y > arena.bottom + DESPAWN_PAD
    ) {
      projectiles.splice(i, 1);
    }
  }
}

export function drawProjectiles(
  context: CanvasRenderingContext2D,
  projectiles: Projectile[],
  art: GameArt | null,
): void {
  context.imageSmoothingEnabled = false;

  for (const shot of projectiles) {
    const def = getProjectile(shot.projectileId);

    if (def.style === 'beam') {
      drawBeam(context, shot);
      continue;
    }

    if (def.style === 'flame') {
      drawFlame(context, shot);
      continue;
    }

    if (def.style === 'grenade') {
      drawGrenade(context, shot, art);
      continue;
    }

    if (!art) {
      continue;
    }

    const sprite = art.projectiles[shot.projectileId];

    if (!sprite) {
      continue;
    }

    context.save();
    context.translate(shot.x, shot.y);
    context.rotate(Math.atan2(shot.vy, shot.vx));
    context.drawImage(
      sprite,
      -def.drawWidth / 2,
      -def.drawHeight / 2,
      def.drawWidth,
      def.drawHeight,
    );
    context.restore();
  }
}

function drawBeam(context: CanvasRenderingContext2D, shot: Projectile): void {
  const fade =
    shot.maxLife && shot.maxLife > 0
      ? Math.max(0, Math.min(1, (shot.life ?? 0) / shot.maxLife))
      : 1;
  const length = shot.length ?? 1400;
  const angle = Math.atan2(shot.vy, shot.vx);
  const { r, g, b } = BEAM_RGB;

  context.save();
  context.translate(shot.x, shot.y);
  context.rotate(angle);
  context.globalCompositeOperation = 'lighter';
  context.lineCap = 'square';

  stroke(context, length, `rgba(${r}, ${g}, ${b}, ${0.1 * fade})`, 16);
  stroke(context, length, `rgba(${r}, ${g}, ${b}, ${0.28 * fade})`, 7);
  stroke(context, length, `rgba(${r}, ${g}, ${b}, ${0.75 * fade})`, 3);
  stroke(context, length, `rgba(210, 255, 220, ${0.95 * fade})`, 1.25);

  context.restore();
}

function drawFlame(context: CanvasRenderingContext2D, shot: Projectile): void {
  const fade =
    shot.maxLife && shot.maxLife > 0
      ? Math.max(0, Math.min(1, (shot.life ?? 0) / shot.maxLife))
      : 1;
  const range = shot.length ?? 170;
  const half = ((shot.spread ?? 25) * Math.PI) / 360;
  const angle = Math.atan2(shot.vy, shot.vx);
  const flicker = 0.82 + ((shot.x + shot.y) % 7) * 0.02;

  context.save();
  context.translate(shot.x, shot.y);
  context.rotate(angle);
  context.globalCompositeOperation = 'lighter';

  fillSector(context, range, -half, half, `rgba(255, 72, 10, ${0.2 * fade * flicker})`);
  fillSector(
    context,
    range * 0.74,
    -half * 0.86,
    half * 0.86,
    `rgba(255, 132, 22, ${0.34 * fade})`,
  );
  fillSector(
    context,
    range * 0.46,
    -half * 0.58,
    half * 0.58,
    `rgba(255, 196, 64, ${0.52 * fade})`,
  );
  fillSector(
    context,
    range * 0.22,
    -half * 0.36,
    half * 0.36,
    `rgba(255, 240, 190, ${0.78 * fade})`,
  );

  context.restore();
}

const GRENADE_HOP = 44;
const GRENADE_BOOM = 0.28;

function updateGrenade(
  shot: Projectile,
  dt: number,
  arena: Arena,
): void {
  const age = (shot.age ?? 0) + dt;
  const flightTime = shot.flightTime ?? 0.52;
  const fuseTime = shot.fuseTime ?? 0.85;
  const justLanded = (shot.age ?? 0) < flightTime && age >= flightTime;
  shot.age = age;

  if (age < flightTime) {
    const t = age / flightTime;
    const startHop = shot.startHop ?? GRENADE_HOP;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.hop = startHop * (1 - t) + 4 * GRENADE_HOP * t * (1 - t);
    shot.spin = (shot.spin ?? 0) + 16 * dt;
  } else if (age < fuseTime) {
    if (justLanded) {
      const speed = Math.hypot(shot.vx, shot.vy);
      const scale = speed > 1 ? 78 / speed : 0;
      shot.vx *= scale;
      shot.vy *= scale;
    }

    shot.hop = 0;

    const drag = Math.exp(-5.2 * dt);
    shot.vx *= drag;
    shot.vy *= drag;
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.spin = (shot.spin ?? 0) + 6 * dt;
  } else {
    shot.vx = 0;
    shot.vy = 0;
    shot.hop = 0;
  }

  shot.x = Math.min(arena.right, Math.max(arena.left, shot.x));
  shot.y = Math.min(arena.bottom, Math.max(arena.top, shot.y));
}

function drawGrenade(
  context: CanvasRenderingContext2D,
  shot: Projectile,
  art: GameArt | null,
): void {
  const age = shot.age ?? 0;
  const fuseTime = shot.fuseTime ?? 0.85;

  if (age >= fuseTime) {
    drawGrenadeBlast(context, shot, (age - fuseTime) / GRENADE_BOOM);
    return;
  }

  const hop = shot.hop ?? 0;
  const def = getProjectile(shot.projectileId);
  const sprite = art?.projectiles[shot.projectileId] ?? null;

  context.save();
  context.translate(shot.x, shot.y);
  context.fillStyle = `rgba(42, 39, 34, ${0.22 + hop / 220})`;
  context.beginPath();
  context.ellipse(0, 4, 7 + hop * 0.04, 3.2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.save();
  context.translate(shot.x, shot.y - hop);
  context.rotate(shot.spin ?? 0);

  if (sprite) {
    context.imageSmoothingEnabled = false;
    context.drawImage(
      sprite,
      -def.drawWidth / 2,
      -def.drawHeight / 2,
      def.drawWidth,
      def.drawHeight,
    );
  } else {
    context.fillStyle = '#4a6a3a';
    context.beginPath();
    context.arc(0, 0, 5, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawGrenadeBlast(
  context: CanvasRenderingContext2D,
  shot: Projectile,
  progress: number,
): void {
  const t = Math.max(0, Math.min(1, progress));
  const radius = (shot.blastRadius ?? 108) * (0.28 + 0.72 * t);
  const fade = 1 - t;

  context.save();
  context.translate(shot.x, shot.y);
  context.globalCompositeOperation = 'lighter';

  context.fillStyle = `rgba(210, 86, 22, ${0.22 * fade})`;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = `rgba(255, 176, 64, ${0.7 * fade})`;
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = `rgba(255, 230, 170, ${0.55 * fade})`;
  context.beginPath();
  context.arc(0, 0, radius * (0.22 + 0.08 * (1 - t)), 0, Math.PI * 2);
  context.fill();

  context.restore();
}

function fillSector(
  context: CanvasRenderingContext2D,
  radius: number,
  start: number,
  end: number,
  color: string,
): void {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, radius, start, end);
  context.closePath();
  context.fill();
}

function stroke(
  context: CanvasRenderingContext2D,
  length: number,
  color: string,
  width: number,
): void {
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(length, 0);
  context.stroke();
}
