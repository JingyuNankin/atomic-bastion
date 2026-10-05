import { enemyHitPoint, hurtEnemy, type Enemy } from '../entities/enemy';
import type { Projectile } from '../entities/projectile';
import { getEnemy } from '../enemies/catalog';
import { getProjectile } from '../weapons/catalog';

export function resolveProjectileHits(
  projectiles: Projectile[],
  enemies: Enemy[],
  dt: number,
): void {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    const style = getProjectile(shot.projectileId).style;
    let remove = false;

    if (style === 'grenade') {
      splashGrenade(shot, enemies);
    } else if (style === 'flame') {
      burnCone(shot, enemies);
    } else if (style === 'beam') {
      strikeBeam(shot, enemies);
    } else {
      remove = strikeKinetic(shot, enemies, dt);
    }

    if (remove) {
      projectiles.splice(i, 1);
    }
  }
}

function strikeKinetic(shot: Projectile, enemies: Enemy[], dt: number): boolean {
  const prevX = shot.x - shot.vx * dt;
  const prevY = shot.y - shot.vy * dt;
  let closest: { enemy: Enemy; dist: number } | null = null;

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || shot.struck?.includes(enemy.uid)) {
      continue;
    }

    const point = enemyHitPoint(enemy);
    const dist = distanceToSegment(point.x, point.y, prevX, prevY, shot.x, shot.y);

    if (dist <= getEnemy(enemy.kind).hitRadius && (closest === null || dist < closest.dist)) {
      closest = { enemy, dist };
    }
  }

  if (!closest) {
    return false;
  }

  const point = enemyHitPoint(closest.enemy);
  hurtEnemy(
    closest.enemy,
    shot.damage ?? 0,
    shot.vx || point.x - prevX,
    shot.vy || point.y - prevY,
    shot.knockback ?? 0,
  );
  shot.struck = [...(shot.struck ?? []), closest.enemy.uid];

  const radius = shot.blastRadius ?? 0;

  if (radius > 0) {
    splashAt(shot.x, shot.y, radius, shot, enemies, closest.enemy.uid);
  }

  const pierce = shot.pierce ?? 0;

  if (pierce <= 0) {
    return true;
  }

  shot.pierce = pierce - 1;
  return false;
}

function strikeBeam(shot: Projectile, enemies: Enemy[]): void {
  const length = shot.length ?? 0;
  const x2 = shot.x + shot.vx * length;
  const y2 = shot.y + shot.vy * length;

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || shot.struck?.includes(enemy.uid)) {
      continue;
    }

    const point = enemyHitPoint(enemy);

    if (distanceToSegment(point.x, point.y, shot.x, shot.y, x2, y2) > getEnemy(enemy.kind).hitRadius) {
      continue;
    }

    hurtEnemy(enemy, shot.damage ?? 0, shot.vx, shot.vy, shot.knockback ?? 0);
    shot.struck = [...(shot.struck ?? []), enemy.uid];
  }
}

function burnCone(shot: Projectile, enemies: Enemy[]): void {
  const length = shot.length ?? 0;
  const spread = ((shot.spread ?? 25) * Math.PI) / 180;
  const aim = Math.atan2(shot.vy, shot.vx);

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || enemy.burn > 0) {
      continue;
    }

    const point = enemyHitPoint(enemy);
    const dx = point.x - shot.x;
    const dy = point.y - shot.y;
    const dist = Math.hypot(dx, dy);

    if (dist > length || dist < 1) {
      continue;
    }

    const delta = wrapAngle(Math.atan2(dy, dx) - aim);

    if (Math.abs(delta) > spread / 2) {
      continue;
    }

    hurtEnemy(enemy, shot.damage ?? 0, shot.vx, shot.vy, shot.knockback ?? 0);
    enemy.burn = shot.hitInterval ?? 0.09;
  }
}

function splashGrenade(shot: Projectile, enemies: Enemy[]): void {
  const fuse = shot.fuseTime ?? 0.85;

  if ((shot.age ?? 0) < fuse || shot.boomed) {
    return;
  }

  shot.boomed = true;
  splashAt(shot.x, shot.y, shot.blastRadius ?? 0, shot, enemies);
}

function splashAt(
  x: number,
  y: number,
  radius: number,
  shot: Projectile,
  enemies: Enemy[],
  ignoreUid?: number,
): void {
  for (const enemy of enemies) {
    if (enemy.hp <= 0 || enemy.uid === ignoreUid) {
      continue;
    }

    const point = enemyHitPoint(enemy);
    const dx = point.x - x;
    const dy = point.y - y;

    if (Math.hypot(dx, dy) > radius) {
      continue;
    }

    hurtEnemy(enemy, shot.damage ?? 0, dx, dy, shot.knockback ?? 0);
  }
}

function distanceToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSq = abx * abx + aby * aby;

  if (lengthSq <= 0.0001) {
    return Math.hypot(px - bx, py - by);
  }

  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSq));
  return Math.hypot(px - (ax + abx * t), py - (ay + aby * t));
}

function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}
