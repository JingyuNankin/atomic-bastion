import { GAIT_CELL, gaitCell, PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import type { WalkPose } from '../render/gait';
import {
  axisToDirection,
  directionAngle,
  directionVector,
  type Axis,
  type Direction,
} from '../game/direction';
import type { GameArt } from '../systems/game-art';
import { getDefaultOperative, type OperativeId } from '../operatives/catalog';
import { px } from '../game/units';
import { DEFAULT_WEAPON_ID, getWeapon, type WeaponId } from '../weapons/catalog';

/** 身高，世界单位。 */
export const PLAYER_HEIGHT = 6;
/** 足底碰撞正方形的边长，世界单位。整块留在地图内。 */
export const PLAYER_FOOT_SIZE = 1.5;
/** 移速，世界单位/秒。 */
export const PLAYER_SPEED = 12.5;
/** 左、立、右、立走完一圈的路程，世界单位。 */
const WALK_CYCLE = 4;
const WALK_BEAT: readonly WalkPose[] = ['left', 'stand', 'right', 'stand'];
export const PLAYER_DISPLAY_HEIGHT = px(PLAYER_HEIGHT);
export const PLAYER_MAX_HP = 100;

const WEAPON_BEHIND = new Set<Direction>(['n', 'nw', 'ne']);
const RECOIL_KICK = 8;
const MUZZLE_REACH = px(2.125);

export type Player = {
  x: number;
  y: number;
  facing: Direction;
  operativeId: OperativeId;
  weaponId: WeaponId;
  ammoInMag: number;
  hp: number;
  maxHp: number;
  recoil: number;
  muzzleFlash: number;
  /** 累计路程，像素。停下不清零，下次迈步接着走。 */
  travel: number;
  walk: WalkPose;
};

export type Arena = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function createPlayer(
  x: number,
  y: number,
  operativeId: OperativeId = getDefaultOperative().id,
): Player {
  return {
    x,
    y,
    facing: 's',
    operativeId,
    weaponId: DEFAULT_WEAPON_ID,
    ammoInMag: getWeapon(DEFAULT_WEAPON_ID).magazineSize,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    recoil: 0,
    muzzleFlash: 0,
    travel: 0,
    walk: 'stand',
  };
}

export function equipWeapon(player: Player, weaponId: WeaponId): void {
  player.weaponId = weaponId;
  player.ammoInMag = getWeapon(weaponId).magazineSize;
  player.recoil = 0;
  player.muzzleFlash = 0;
}

export function updatePlayer(
  player: Player,
  dt: number,
  axis: Axis,
  arena: Arena,
): void {
  const { x: ax, y: ay } = axis;
  const originX = player.x;
  const originY = player.y;

  if (ax !== 0 || ay !== 0) {
    const facing = axisToDirection(ax, ay);

    if (facing) {
      player.facing = facing;
    }

    const length = Math.hypot(ax, ay);
    const speed = px(PLAYER_SPEED);
    player.x += (ax / length) * speed * dt;
    player.y += (ay / length) * speed * dt;
  }

  clampPlayer(player, arena);

  if (ax === 0 && ay === 0) {
    if (dt > 0) {
      player.walk = 'stand';
    }
    return;
  }

  const moved = Math.hypot(player.x - originX, player.y - originY);

  if (moved > 0) {
    player.travel += moved;
    player.walk = walkAt(player.travel);
  } else {
    player.walk = 'stand';
  }
}

export function muzzlePoint(player: Player): { x: number; y: number } {
  const size = displaySize();
  const dir = unitFacing(player.facing);
  return {
    x: player.x + dir.x * MUZZLE_REACH,
    y: player.y - size.height * 0.4 + dir.y * MUZZLE_REACH * 0.55,
  };
}

export function footPoint(player: Player): { x: number; y: number } {
  const dir = unitFacing(player.facing);
  const reach = MUZZLE_REACH * 0.45;
  return {
    x: player.x + dir.x * reach,
    y: player.y + dir.y * reach,
  };
}

export function drawPlayer(
  context: CanvasRenderingContext2D,
  player: Player,
  art: GameArt | null,
): void {
  if (!art) {
    return;
  }

  const body = bodyDest(player);
  const weapon = spriteDest(player);
  const kick = unitFacing(player.facing);
  const kickX = kick.x * player.recoil * RECOIL_KICK;
  const kickY = kick.y * player.recoil * RECOIL_KICK;
  body.x -= kickX;
  body.y -= kickY;
  weapon.x -= kickX;
  weapon.y -= kickY;

  const weaponArt = art.weapons[player.weaponId];
  const overlay =
    player.recoil > 0.18 ? weaponArt?.fireOverlay : weaponArt?.overlay;
  const behind = WEAPON_BEHIND.has(player.facing);

  context.imageSmoothingEnabled = false;

  if (overlay && behind) {
    blitCell(context, overlay, player.facing, weapon);
  }

  blitWalk(
    context,
    art.operatives[player.operativeId] ?? art.player,
    player.facing,
    player.walk,
    body,
  );

  if (overlay && !behind) {
    blitCell(context, overlay, player.facing, weapon);
  }

  if (player.muzzleFlash > 0) {
    drawMuzzleFlash(context, player, art.muzzleFlash);
  }
}

function drawMuzzleFlash(
  context: CanvasRenderingContext2D,
  player: Player,
  flash: HTMLCanvasElement,
): void {
  const muzzle = muzzlePoint(player);
  const size = 16 + player.muzzleFlash * 12;

  context.save();
  context.translate(muzzle.x, muzzle.y);
  context.rotate(directionAngle(player.facing));
  context.globalAlpha = 0.35 + player.muzzleFlash * 0.65;
  context.drawImage(flash, -size / 2, -size / 2, size, size);
  context.restore();
}

function blitWalk(
  context: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  facing: Direction,
  pose: WalkPose,
  dest: { x: number; y: number; width: number; height: number },
): void {
  const cell = gaitCell(facing, pose);
  context.drawImage(
    sheet,
    cell.sx,
    cell.sy,
    cell.sw,
    cell.sh,
    dest.x,
    dest.y,
    dest.width,
    dest.height,
  );
}

function blitCell(
  context: CanvasRenderingContext2D,
  sheet: HTMLCanvasElement,
  facing: Direction,
  dest: { x: number; y: number; width: number; height: number },
): void {
  const cell = sheetCell(facing);
  context.drawImage(
    sheet,
    cell.sx,
    cell.sy,
    cell.sw,
    cell.sh,
    dest.x,
    dest.y,
    dest.width,
    dest.height,
  );
}

function clampPlayer(player: Player, arena: Arena): void {
  const half = px(PLAYER_FOOT_SIZE) / 2;

  player.x = clamp(player.x, arena.left + half, arena.right - half);
  player.y = clamp(player.y, arena.top + half, arena.bottom - half);
}

function bodyDest(player: Player): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const scale = PLAYER_DISPLAY_HEIGHT / PLAYER_CELL.height;
  const width = GAIT_CELL.width * scale;
  const height = GAIT_CELL.height * scale;
  return {
    x: player.x - width / 2,
    y: player.y - PLAYER_DISPLAY_HEIGHT,
    width,
    height,
  };
}

function walkAt(travel: number): WalkPose {
  const cycle = px(WALK_CYCLE);
  const index = Math.floor((travel % cycle) / (cycle / WALK_BEAT.length));
  return WALK_BEAT[index] ?? 'stand';
}

function spriteDest(player: Player): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const size = displaySize();
  return {
    x: player.x - size.width / 2,
    y: player.y - size.height,
    width: size.width,
    height: size.height,
  };
}

function displaySize(): { width: number; height: number } {
  const scale = PLAYER_DISPLAY_HEIGHT / PLAYER_CELL.height;
  return {
    width: PLAYER_CELL.width * scale,
    height: PLAYER_DISPLAY_HEIGHT,
  };
}

function unitFacing(facing: Direction): { x: number; y: number } {
  const dir = directionVector(facing);
  const length = Math.hypot(dir.x, dir.y) || 1;
  return { x: dir.x / length, y: dir.y / length };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
