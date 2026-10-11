import type { Arena } from '../entities/player';
import { px } from './units';

/** 当前试玩舱，单位。有限，与窗口无关。 */
export const MAP_WIDTH = 80;
export const MAP_HEIGHT = 45;

export const ARENA: Arena = {
  left: 0,
  top: 0,
  right: px(MAP_WIDTH),
  bottom: px(MAP_HEIGHT),
};

export function cameraFor(
  viewWidth: number,
  viewHeight: number,
  focusX: number,
  focusY: number,
): { x: number; y: number } {
  const mapW = ARENA.right - ARENA.left;
  const mapH = ARENA.bottom - ARENA.top;
  const x =
    mapW <= viewWidth
      ? (mapW - viewWidth) / 2
      : clamp(focusX - viewWidth / 2, ARENA.left, ARENA.right - viewWidth);
  const y =
    mapH <= viewHeight
      ? (mapH - viewHeight) / 2
      : clamp(focusY - viewHeight / 2, ARENA.top, ARENA.bottom - viewHeight);

  return { x: Math.round(x), y: Math.round(y) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
