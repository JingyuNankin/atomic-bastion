import { PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import { axisToDirection, type Axis, type Direction } from '../game/direction';
import type { GameArt } from '../systems/game-art';
import { DEFAULT_WEAPON_ID, getWeapon, type WeaponId } from '../weapons/catalog';

export const PLAYER_SPEED = 200;
export const PLAYER_DISPLAY_HEIGHT = 96;

const WEAPON_BEHIND = new Set<Direction>(['n', 'nw', 'ne']);

export type Player = {
  x: number;
  y: number;
  facing: Direction;
  weaponId: WeaponId;
  ammoInMag: number;
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
  };
}

export function equipWeapon(player: Player, weaponId: WeaponId): void {
  player.weaponId = weaponId;
  player.ammoInMag = getWeapon(weaponId).magazineSize;
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

export function drawPlayer(
  context: CanvasRenderingContext2D,
  player: Player,
  art: GameArt | null,
): void {
  if (!art) {
    return;
  }

  const dest = spriteDest(player);
  const overlay = art.weapons[player.weaponId]?.overlay;
  const behind = WEAPON_BEHIND.has(player.facing);

  context.imageSmoothingEnabled = false;

  if (overlay && behind) {
    blitCell(context, overlay, player.facing, dest);
  }

  blitCell(context, art.player, player.facing, dest);

  if (overlay && !behind) {
    blitCell(context, overlay, player.facing, dest);
  }
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
