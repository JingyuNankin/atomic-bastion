import { DIRECTIONS, type Direction } from '../game/direction';
import { createBoxGlRenderer } from './player-gl';
import { playerBoxes, type Box } from './player-model';
import { boxesExtent, centerBoxes } from './weapon-model';

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

export function sheetCell(direction: Direction): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  const { col, row } = CELL[direction];
  return {
    sx: col * PLAYER_CELL.width,
    sy: row * PLAYER_CELL.height,
    sw: PLAYER_CELL.width,
    sh: PLAYER_CELL.height,
  };
}

export function bakeBoxSheet(boxes: Box[]): HTMLCanvasElement {
  const renderer = createBoxGlRenderer(boxes);
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

export function bakePlayerSheet(): HTMLCanvasElement {
  return bakeBoxSheet(playerBoxes());
}

export function bakeFittedSprite(
  boxes: Box[],
  size: number,
  yaw: number = YAW.se,
): HTMLCanvasElement {
  const centered = centerBoxes(boxes);
  const pad = Math.max(0.08, boxesExtent(centered) * 1.35);
  const renderer = createBoxGlRenderer(centered, {
    left: -pad,
    right: pad,
    bottom: -pad,
    top: pad,
  });

  try {
    return renderer.render(yaw, size, size);
  } finally {
    renderer.destroy();
  }
}

export function playerSheetToPng(sheet: HTMLCanvasElement): string {
  return sheet.toDataURL('image/png');
}
