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

    if (def.style === 'beam') {
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
