import { DIRECTIONS, type Direction } from '../game/direction';
import { createPlayerGlRenderer } from './player-gl';

export const PLAYER_CELL = {
  width: 56,
  height: 72,
} as const;

const CELL: Record<Direction, { col: number; row: number }> = {
  nw: { col: 0, row: 0 },
  n: { col: 1, row: 0 },
  ne: { col: 2, row: 0 },
  w: { col: 0, row: 1 },
  e: { col: 2, row: 1 },
  sw: { col: 0, row: 2 },
  s: { col: 1, row: 2 },
  se: { col: 2, row: 2 },
};

const YAW: Record<Direction, number> = {
  n: Math.PI,
  ne: (Math.PI * 3) / 4,
  e: Math.PI / 2,
  se: Math.PI / 4,
  s: 0,
  sw: (Math.PI * 7) / 4,
  w: (Math.PI * 3) / 2,
  nw: (Math.PI * 5) / 4,
};

export function bakePlayerSheet(): HTMLCanvasElement {
  const renderer = createPlayerGlRenderer();
  const sheet = document.createElement('canvas');
  sheet.width = PLAYER_CELL.width * 3;
  sheet.height = PLAYER_CELL.height * 3;
  const context = sheet.getContext('2d');

  if (!context) {
    renderer.destroy();
    throw new Error('Canvas 2D context is not available');
  }

  context.clearRect(0, 0, sheet.width, sheet.height);
  context.imageSmoothingEnabled = false;

  try {
    for (const direction of DIRECTIONS) {
      const { col, row } = CELL[direction];
      const frame = renderer.render(
        YAW[direction],
        PLAYER_CELL.width,
        PLAYER_CELL.height,
      );
      context.drawImage(frame, col * PLAYER_CELL.width, row * PLAYER_CELL.height);
    }
  } finally {
    renderer.destroy();
  }

  return sheet;
}

export function playerSheetToPng(sheet: HTMLCanvasElement): string {
  return sheet.toDataURL('image/png');
}
