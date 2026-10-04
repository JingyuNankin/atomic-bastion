import type { Arena } from './player';
import type { GameArt } from '../systems/game-art';
import { getProjectile, type ProjectileId } from '../weapons/catalog';

export type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  projectileId: ProjectileId;
};

const DESPAWN_PAD = 48;

export function updateProjectiles(
  projectiles: Projectile[],
  dt: number,
  arena: Arena,
): void {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
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
  if (!art) {
    return;
  }

  context.imageSmoothingEnabled = false;

  for (const shot of projectiles) {
    const def = getProjectile(shot.projectileId);
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
