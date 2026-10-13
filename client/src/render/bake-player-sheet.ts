import { DIRECTIONS, type Direction } from '../game/direction';
import { poseBoxes, WALK_POSES, type WalkPose } from './gait';
import { createBoxGlRenderer, PLAYER_ORTHO, type OrthoBounds } from './player-gl';
import { playerBoxes, type Box } from './player-model';
import { boxesExtent, centerBoxes } from './weapon-model';

export const PLAYER_CELL = {
  width: 56,
  height: 72,
} as const;

/** 迈步时前脚会探出待机正交的下沿，多出来的像素贴在格子底部。 */
export const GAIT_PAD = 8;

const MODEL_PX =
  PLAYER_CELL.height / (PLAYER_ORTHO.top - PLAYER_ORTHO.bottom);

export const GAIT_CELL = {
  width: PLAYER_CELL.width,
  height: PLAYER_CELL.height + GAIT_PAD,
} as const;

export const GAIT_ORTHO: OrthoBounds = {
  ...PLAYER_ORTHO,
  bottom: PLAYER_ORTHO.bottom - GAIT_PAD / MODEL_PX,
};

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

export function sheetCell(
  direction: Direction,
  cell: { width: number; height: number } = PLAYER_CELL,
): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  const { col, row } = CELL[direction];
  return {
    sx: col * cell.width,
    sy: row * cell.height,
    sw: cell.width,
    sh: cell.height,
  };
}

export function gaitCell(
  direction: Direction,
  pose: WalkPose,
  cell: { width: number; height: number } = GAIT_CELL,
): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  return {
    sx: DIRECTIONS.indexOf(direction) * cell.width,
    sy: WALK_POSES.indexOf(pose) * cell.height,
    sw: cell.width,
    sh: cell.height,
  };
}

export function bakeGaitSheet(
  boxes: Box[],
  frame: { width: number; height: number } = GAIT_CELL,
  ortho: OrthoBounds = GAIT_ORTHO,
): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  sheet.width = frame.width * DIRECTIONS.length;
  sheet.height = frame.height * WALK_POSES.length;
  const context = sheet.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  context.clearRect(0, 0, sheet.width, sheet.height);
  context.imageSmoothingEnabled = false;

  for (const [row, pose] of WALK_POSES.entries()) {
    const renderer = createBoxGlRenderer(poseBoxes(boxes, pose), ortho);

    try {
      for (const [col, direction] of DIRECTIONS.entries()) {
        const frameImage = renderer.render(YAW[direction], frame.width, frame.height);
        context.drawImage(frameImage, col * frame.width, row * frame.height);
      }
    } finally {
      renderer.destroy();
    }
  }

  return sheet;
}

export function bakeBoxSheet(
  boxes: Box[],
  frame: { width: number; height: number } = PLAYER_CELL,
  ortho?: OrthoBounds,
): HTMLCanvasElement {
  const renderer = createBoxGlRenderer(boxes, ortho);
  const sheet = document.createElement('canvas');
  sheet.width = frame.width * 3;
  sheet.height = frame.height * 3;
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
      const frameImage = renderer.render(YAW[direction], frame.width, frame.height);
      context.drawImage(frameImage, col * frame.width, row * frame.height);
    }
  } finally {
    renderer.destroy();
  }

  return sheet;
}

export function bakePlayerSheet(): HTMLCanvasElement {
  return bakeBoxSheet(playerBoxes());
}

export function bakeDirection(
  boxes: Box[],
  direction: Direction,
  frame: { width: number; height: number } = PLAYER_CELL,
): HTMLCanvasElement {
  const renderer = createBoxGlRenderer(boxes);
  try {
    return renderer.render(YAW[direction], frame.width, frame.height);
  } finally {
    renderer.destroy();
  }
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
