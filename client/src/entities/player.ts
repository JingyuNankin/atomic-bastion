import { axisToDirection, type Axis, type Direction } from '../game/direction';
import type { PlayerSheet } from '../systems/player-sheet';

export const PLAYER_SPEED = 200;
export const PLAYER_DISPLAY_HEIGHT = 96;

export type Player = {
  x: number;
  y: number;
  facing: Direction;
};

export type Arena = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export function createPlayer(x: number, y: number): Player {
  return { x, y, facing: 's' };
}

export function updatePlayer(
  player: Player,
  dt: number,
  axis: Axis,
  arena: Arena,
  sheet: PlayerSheet | null,
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

  clampPlayer(player, arena, sheet);
}

export function drawPlayer(
  context: CanvasRenderingContext2D,
  player: Player,
  sheet: PlayerSheet | null,
): void {
  if (!sheet) {
    return;
  }

  const frame = sheet.frames[player.facing];
  const scale = PLAYER_DISPLAY_HEIGHT / frame.sh;
  const width = frame.sw * scale;
  const height = frame.sh * scale;

  context.imageSmoothingEnabled = false;
  context.drawImage(
    sheet.canvas,
    frame.sx,
    frame.sy,
    frame.sw,
    frame.sh,
    player.x - width / 2,
    player.y - height,
    width,
    height,
  );
}

function clampPlayer(
  player: Player,
  arena: Arena,
  sheet: PlayerSheet | null,
): void {
  const size = displaySize(player, sheet);
  const halfW = size.width / 2;
  const minX = arena.left + halfW;
  const maxX = arena.right - halfW;
  const minY = arena.top + size.height;
  const maxY = arena.bottom;

  player.x =
    minX <= maxX ? clamp(player.x, minX, maxX) : (arena.left + arena.right) / 2;
  player.y = minY <= maxY ? clamp(player.y, minY, maxY) : arena.bottom;
}

function displaySize(
  player: Player,
  sheet: PlayerSheet | null,
): { width: number; height: number } {
  if (!sheet) {
    return { width: 32, height: PLAYER_DISPLAY_HEIGHT };
  }

  const frame = sheet.frames[player.facing];
  const scale = PLAYER_DISPLAY_HEIGHT / frame.sh;

  return { width: frame.sw * scale, height: frame.sh * scale };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
