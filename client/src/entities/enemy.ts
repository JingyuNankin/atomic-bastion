import {
  axisToDirection,
  directionVector,
  type Direction,
} from '../game/direction';
import { getEnemy, type EnemyId } from '../enemies/catalog';
import {
  PLAYER_DISPLAY_HEIGHT,
  updatePlayer,
  type Arena,
  type Player,
} from './player';
import { PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import { HYENA_CELL } from '../render/hyena-model';

const LUNGE_TIME = 0.14;
const LUNGE_DISTANCE = 16;

export type Enemy = {
  uid: number;
  kind: EnemyId;
  x: number;
  y: number;
  facing: Direction;
  hp: number;
  hurt: number;
  attackCooldown: number;
  lunge: number;
  kx: number;
  ky: number;
  burn: number;
};

let nextUid = 1;

export function createEnemy(kind: EnemyId, x: number, y: number): Enemy {
  const def = getEnemy(kind);

  const enemy: Enemy = {
    uid: nextUid,
    kind,
    x,
    y,
    facing: 's',
    hp: def.hp,
    hurt: 0,
    attackCooldown: 0.25,
    lunge: 0,
    kx: 0,
    ky: 0,
    burn: 0,
  };
  nextUid += 1;
  return enemy;
}

export function updateEnemies(
  enemies: Enemy[],
  player: Player,
  dt: number,
  arena: Arena,
): void {
  cullEnemies(enemies);

  for (const enemy of enemies) {
    const def = getEnemy(enemy.kind);
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    enemy.burn = Math.max(0, enemy.burn - dt);
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.lunge = Math.max(0, enemy.lunge - dt / LUNGE_TIME);

    enemy.x += enemy.kx * dt;
    enemy.y += enemy.ky * dt;
    const drag = Math.exp(-10 * dt);
    enemy.kx *= drag;
    enemy.ky *= drag;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    const facing = directionFromVector(dx, dy);

    if (facing) {
      enemy.facing = facing;
    }

    const biteReach = def.attackRange + def.attackReach;

    if (def.attack === 'melee' && dist <= biteReach) {
      if (enemy.attackCooldown <= 0 && player.hp > 0 && dist > 0) {
        bite(enemy, player, arena);
      }
    } else if (dist > 0) {
      enemy.x += (dx / dist) * def.speed * dt;
      enemy.y += (dy / dist) * def.speed * dt;
    }

    if (dist > 0 && dist < 22) {
      enemy.x -= (dx / dist) * (22 - dist);
      enemy.y -= (dy / dist) * (22 - dist);
    }

    clampEnemy(enemy, arena);
  }
}

export function hurtEnemy(
  enemy: Enemy,
  damage: number,
  dirX: number,
  dirY: number,
  knockback: number,
): void {
  if (enemy.hp <= 0 || damage <= 0) {
    return;
  }

  const def = getEnemy(enemy.kind);
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hurt = 0.14;
  const push = knockback * (1 - def.knockbackResist);
  const length = Math.hypot(dirX, dirY) || 1;
  enemy.kx += (dirX / length) * push * 10;
  enemy.ky += (dirY / length) * push * 10;
}

export function enemyHitPoint(enemy: Enemy): { x: number; y: number } {
  const def = getEnemy(enemy.kind);
  return {
    x: enemy.x,
    y: enemy.y - def.hitLift,
  };
}

export function cullEnemies(enemies: Enemy[]): void {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].hp <= 0) {
      enemies.splice(i, 1);
    }
  }
}

export function drawEnemy(
  context: CanvasRenderingContext2D,
  enemy: Enemy,
  sheet: HTMLCanvasElement | null,
): void {
  if (!sheet) {
    return;
  }

  const cell = sheetCell(enemy.facing, cellOf(enemy.kind));
  const size = displaySize(enemy.kind);
  const dir = unitFacing(enemy.facing);
  const destX = enemy.x - size.width / 2 + dir.x * enemy.lunge * LUNGE_DISTANCE;
  const destY = enemy.y - size.height + dir.y * enemy.lunge * LUNGE_DISTANCE;

  context.imageSmoothingEnabled = false;
  context.drawImage(
    sheet,
    cell.sx,
    cell.sy,
    cell.sw,
    cell.sh,
    destX,
    destY,
    size.width,
    size.height,
  );

  if (enemy.hurt <= 0) {
    return;
  }

  context.save();
  context.globalAlpha = 0.55;
  context.globalCompositeOperation = 'lighter';
  context.drawImage(
    sheet,
    cell.sx,
    cell.sy,
    cell.sw,
    cell.sh,
    destX,
    destY,
    size.width,
    size.height,
  );
  context.restore();
}

function bite(enemy: Enemy, player: Player, arena: Arena): void {
  const def = getEnemy(enemy.kind);
  const dir = unitFacing(enemy.facing);
  const mouthX = enemy.x + dir.x * def.attackReach;
  const mouthY = enemy.y + dir.y * def.attackReach;
  const awayX = player.x - mouthX;
  const awayY = player.y - mouthY;
  const length = Math.hypot(awayX, awayY) || 1;

  enemy.attackCooldown = def.attackInterval;
  enemy.lunge = 1;
  player.hp = Math.max(0, player.hp - def.damage);
  player.x += (awayX / length) * def.attackKnockback;
  player.y += (awayY / length) * def.attackKnockback;
  updatePlayer(player, 0, { x: 0, y: 0 }, arena);
}

function cellOf(kind: EnemyId): { width: number; height: number } {
  if (kind === 'e01-hyena') {
    return HYENA_CELL;
  }

  return HYENA_CELL;
}

function displaySize(kind: EnemyId): { width: number; height: number } {
  const cell = cellOf(kind);
  const scale = PLAYER_DISPLAY_HEIGHT / PLAYER_CELL.height;
  return {
    width: cell.width * scale,
    height: cell.height * scale,
  };
}

function clampEnemy(enemy: Enemy, arena: Arena): void {
  const size = displaySize(enemy.kind);
  const halfW = size.width / 2;
  const minX = arena.left + halfW;
  const maxX = arena.right - halfW;
  const minY = arena.top + size.height;
  const maxY = arena.bottom;

  enemy.x =
    minX <= maxX ? clamp(enemy.x, minX, maxX) : (arena.left + arena.right) / 2;
  enemy.y = minY <= maxY ? clamp(enemy.y, minY, maxY) : arena.bottom;
}

function directionFromVector(x: number, y: number): Direction | null {
  if (x === 0 && y === 0) {
    return null;
  }

  const ax = Math.abs(x);
  const ay = Math.abs(y);
  const sx = Math.sign(x);
  const sy = Math.sign(y);

  if (ay < ax * 0.45) {
    return axisToDirection(sx, 0);
  }

  if (ax < ay * 0.45) {
    return axisToDirection(0, sy);
  }

  return axisToDirection(sx, sy);
}

function unitFacing(facing: Direction): { x: number; y: number } {
  const dir = directionVector(facing);
  const length = Math.hypot(dir.x, dir.y) || 1;
  return { x: dir.x / length, y: dir.y / length };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
