import { PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import {
  axisToDirection,
  directionAngle,
  directionVector,
  type Axis,
  type Direction,
} from '../game/direction';
import type { GameArt } from '../systems/game-art';
import { DEFAULT_WEAPON_ID, getWeapon, type WeaponId } from '../weapons/catalog';

export const PLAYER_SPEED = 200;
export const PLAYER_DISPLAY_HEIGHT = 96;
export const PLAYER_MAX_HP = 100;

const WEAPON_BEHIND = new Set<Direction>(['n', 'nw', 'ne']);
const RECOIL_KICK = 8;
const MUZZLE_REACH = 34;

export type Player = {
  x: number;
  y: number;
  facing: Direction;
  weaponId: WeaponId;
  ammoInMag: number;
  hp: number;
  maxHp: number;
  recoil: number;
  muzzleFlash: number;
};

export type Arena = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function createPlayer(x: number, y: number): Player {
  return {
    x,
    y,
    facing: 's',
    weaponId: DEFAULT_WEAPON_ID,
    ammoInMag: getWeapon(DEFAULT_WEAPON_ID).magazineSize,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    recoil: 0,
    muzzleFlash: 0,
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

  if (ax !== 0 || ay !== 0) {
    const facing = axisToDirection(ax, ay);

    if (facing) {
      player.facing = facing;
    }

    const length = Math.hypot(ax, ay);
    player.x += (ax / length) * PLAYER_SPEED * dt;
    player.y += (ay / length) * PLAYER_SPEED * dt;
  }

  clampPlayer(player, arena);
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

  const dest = spriteDest(player);
  const kick = unitFacing(player.facing);
  dest.x -= kick.x * player.recoil * RECOIL_KICK;
  dest.y -= kick.y * player.recoil * RECOIL_KICK;

  const weaponArt = art.weapons[player.weaponId];
  const overlay =
    player.recoil > 0.18 ? weaponArt?.fireOverlay : weaponArt?.overlay;
  const behind = WEAPON_BEHIND.has(player.facing);

  context.imageSmoothingEnabled = false;

  if (overlay && behind) {
    blitCell(context, overlay, player.facing, dest);
  }

  blitCell(context, art.player, player.facing, dest);

  if (overlay && !behind) {
    blitCell(context, overlay, player.facing, dest);
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
  const size = displaySize();
  const halfW = size.width / 2;
  const minX = arena.left + halfW;
  const maxX = arena.right - halfW;
  const minY = arena.top + size.height;
  const maxY = arena.bottom;

  player.x =
    minX <= maxX ? clamp(player.x, minX, maxX) : (arena.left + arena.right) / 2;
  player.y = minY <= maxY ? clamp(player.y, minY, maxY) : arena.bottom;
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
