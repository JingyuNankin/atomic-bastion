import {
  axisToDirection,
  directionVector,
  type Direction,
} from '../game/direction';
import { getEnemy, type EnemyId } from '../enemies/catalog';
import { px } from '../game/units';
import {
  PLAYER_DISPLAY_HEIGHT,
  updatePlayer,
  type Arena,
  type Player,
} from './player';
import { PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import { HYENA_CELL } from '../render/hyena-model';
import { THEME } from '../ui/theme';

const LUNGE_TIME = 0.14;
const LUNGE_DISTANCE = px(1);
const BLAST_TIME = 0.32;
const DRONE_PHASES = [
  { time: 0.55, pace: 'hover' },
  { time: 0.8, pace: 'cruise' },
  { time: 0.45, pace: 'dash' },
] as const;

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
  fuse: number;
  blast: number;
  motionTime: number;
  stepLift: number;
  entered: boolean;
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
    fuse: -1,
    blast: 0,
    motionTime: Math.random() * 1.8,
    stepLift: 0,
    entered: false,
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
  for (const enemy of enemies) {
    if (enemy.blast > 0) {
      enemy.blast = Math.max(0, enemy.blast - dt);
    }
  }

  cullEnemies(enemies);

  for (const enemy of enemies) {
    if (enemy.hp <= 0) {
      continue;
    }

    const def = getEnemy(enemy.kind);
    enemy.hurt = Math.max(0, enemy.hurt - dt);
    enemy.burn = Math.max(0, enemy.burn - dt);
    enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
    enemy.lunge = Math.max(0, enemy.lunge - dt / LUNGE_TIME);
    enemy.motionTime += dt;

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

    if (def.attack === 'suicide') {
      steerSuicide(enemy, player, dist, dx, dy, dt, arena);
    } else if (def.attack === 'melee' && dist <= def.attackRange + def.attackReach) {
      enemy.stepLift = 0;
      if (enemy.attackCooldown <= 0 && player.hp > 0 && dist > 0) {
        bite(enemy, player, arena);
      }
    } else if (enemy.kind === 'e01-hyena' && dist > 0) {
      stepHyena(enemy, dx, dy, dist, dt);
    } else if (dist > 0) {
      enemy.stepLift = 0;
      enemy.x += (dx / dist) * def.speed * dt;
      enemy.y += (dy / dist) * def.speed * dt;
    } else {
      enemy.stepLift = 0;
    }

    const personalSpace = px(1.375);
    if (def.locomotion === 'ground' && dist > 0 && dist < personalSpace) {
      enemy.x -= (dx / dist) * (personalSpace - dist);
      enemy.y -= (dy / dist) * (personalSpace - dist);
    }

    holdInArena(enemy, arena);
  }

  separateBodies(enemies);

  for (const enemy of enemies) {
    holdInArena(enemy, arena);
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
    if (enemies[i].hp <= 0 && enemies[i].blast <= 0) {
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

  const def = getEnemy(enemy.kind);

  if (enemy.hp <= 0) {
    if (enemy.blast > 0) {
      drawBlast(context, enemy);
    }
    return;
  }

  if (def.locomotion === 'air') {
    context.save();
    context.fillStyle = 'rgba(42, 39, 34, 0.38)';
    context.beginPath();
    context.ellipse(enemy.x, enemy.y - 2, 16, 5, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  const cell = sheetCell(enemy.facing, cellOf(enemy.kind));
  const size = displaySize(enemy.kind);
  const dir = unitFacing(enemy.facing);
  const hop = enemy.stepLift * px(0.3);
  const destX = enemy.x - size.width / 2 + dir.x * enemy.lunge * LUNGE_DISTANCE;
  const destY = enemy.y - size.height + dir.y * enemy.lunge * LUNGE_DISTANCE - hop;

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

  if (enemy.hurt > 0) {
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

  if (enemy.fuse > 0 && warningLamp(enemy)) {
    const nose = unitFacing(enemy.facing);
    const lamp = enemy.fuse < def.attackInterval * 0.35 ? THEME.hpFill : THEME.stamp;
    context.fillStyle = lamp;
    context.fillRect(
      enemy.x + nose.x * 14 - 3,
      enemy.y - def.hitLift + nose.y * 8 - 3,
      6,
      6,
    );
  }
}

const HYENA_STRIDE = 2.5;
const HYENA_STEP_TIME = 0.22;

function stepHyena(enemy: Enemy, dx: number, dy: number, dist: number, dt: number): void {
  const def = getEnemy(enemy.kind);
  const stride = px(HYENA_STRIDE);
  const cycle = stride / Math.max(def.speed, 1);
  const stepTime = Math.min(HYENA_STEP_TIME, cycle * 0.7);
  const phase = enemy.motionTime % cycle;

  if (phase >= stepTime) {
    enemy.stepLift = 0;
    return;
  }

  const burst = stride / stepTime;
  enemy.x += (dx / dist) * burst * dt;
  enemy.y += (dy / dist) * burst * dt;
  enemy.stepLift = Math.sin((phase / stepTime) * Math.PI);
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

function steerSuicide(
  enemy: Enemy,
  player: Player,
  dist: number,
  dx: number,
  dy: number,
  dt: number,
  arena: Arena,
): void {
  const def = getEnemy(enemy.kind);

  if (enemy.fuse < 0 && dist <= def.attackRange && player.hp > 0) {
    enemy.fuse = def.attackInterval;
  }

  const speed = enemy.fuse > 0 ? def.speed : dronePace(def, enemy.motionTime);
  const hold = enemy.fuse > 0 && dist < 18;

  if (!hold && dist > 0 && speed > 0) {
    enemy.x += (dx / dist) * speed * dt;
    enemy.y += (dy / dist) * speed * dt;
  }

  if (enemy.fuse < 0) {
    return;
  }

  enemy.fuse -= dt;

  if (enemy.fuse > 0) {
    return;
  }

  detonate(enemy, player, arena);
}

function detonate(enemy: Enemy, player: Player, arena: Arena): void {
  const def = getEnemy(enemy.kind);
  const origin = enemyHitPoint(enemy);
  const chestX = player.x;
  const chestY = player.y - 40;
  const dx = chestX - origin.x;
  const dy = chestY - origin.y;
  const dist = Math.hypot(dx, dy);

  enemy.fuse = -1;
  enemy.hp = 0;
  enemy.blast = BLAST_TIME;

  if (player.hp <= 0 || dist > def.blastRadius) {
    return;
  }

  const away = unitFacing(enemy.facing);
  player.hp = Math.max(0, player.hp - def.damage);
  player.x += away.x * def.attackKnockback;
  player.y += away.y * def.attackKnockback;
  updatePlayer(player, 0, { x: 0, y: 0 }, arena);
}

function dronePace(
  def: ReturnType<typeof getEnemy>,
  motionTime: number,
): number {
  const cycle = DRONE_PHASES.reduce((sum, phase) => sum + phase.time, 0);
  let time = motionTime % cycle;

  for (const phase of DRONE_PHASES) {
    if (time <= phase.time) {
      if (phase.pace === 'hover') {
        return 0;
      }

      if (phase.pace === 'cruise') {
        return def.cruiseSpeed;
      }

      return def.speed;
    }

    time -= phase.time;
  }

  return 0;
}

function separateBodies(enemies: Enemy[]): void {
  for (let i = 0; i < enemies.length; i += 1) {
    const left = enemies[i];

    if (left.hp <= 0) {
      continue;
    }

    const leftDef = getEnemy(left.kind);

    for (let j = i + 1; j < enemies.length; j += 1) {
      const right = enemies[j];

      if (right.hp <= 0) {
        continue;
      }

      const rightDef = getEnemy(right.kind);

      if (leftDef.locomotion !== rightDef.locomotion) {
        continue;
      }

      const dx = right.x - left.x;
      const dy = right.y - left.y;
      const dist = Math.hypot(dx, dy) || 0.001;
      const min = leftDef.bodyRadius + rightDef.bodyRadius;

      if (dist >= min) {
        continue;
      }

      const push = (min - dist) / 2;
      const nx = dx / dist;
      const ny = dy / dist;
      left.x -= nx * push;
      left.y -= ny * push;
      right.x += nx * push;
      right.y += ny * push;
    }
  }
}

function warningLamp(enemy: Enemy): boolean {
  const def = getEnemy(enemy.kind);
  const elapsed = Math.max(0, def.attackInterval - enemy.fuse);
  const period = Math.max(0.05, 0.22 - elapsed * 0.18);
  return Math.floor(elapsed / period) % 2 === 0;
}

function drawBlast(context: CanvasRenderingContext2D, enemy: Enemy): void {
  const def = getEnemy(enemy.kind);
  const progress = 1 - enemy.blast / BLAST_TIME;
  const radius = Math.max(8, def.blastRadius) * (0.3 + 0.7 * progress);
  const origin = enemyHitPoint(enemy);

  context.save();
  context.translate(origin.x, origin.y);
  context.globalAlpha = 1 - progress;
  context.fillStyle = THEME.rust;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = THEME.stamp;
  context.beginPath();
  context.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function cellOf(kind: EnemyId): { width: number; height: number } {
  if (kind === 'e01-hyena') {
    return HYENA_CELL;
  }

  return PLAYER_CELL;
}

function displaySize(kind: EnemyId): { width: number; height: number } {
  const cell = cellOf(kind);
  const scale = PLAYER_DISPLAY_HEIGHT / PLAYER_CELL.height;
  return {
    width: cell.width * scale,
    height: cell.height * scale,
  };
}

function holdInArena(enemy: Enemy, arena: Arena): void {
  if (enemy.hp <= 0) {
    return;
  }

  if (!enemy.entered) {
    if (!fullyInside(enemy, arena)) {
      return;
    }

    enemy.entered = true;
  }

  clampEnemy(enemy, arena);
}

function fullyInside(enemy: Enemy, arena: Arena): boolean {
  const size = displaySize(enemy.kind);
  const halfW = size.width / 2;
  return (
    enemy.x >= arena.left + halfW &&
    enemy.x <= arena.right - halfW &&
    enemy.y >= arena.top + size.height &&
    enemy.y <= arena.bottom
  );
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
