import { DIRECTIONS, type Direction } from '../game/direction';

const COLS = 3;
const ROWS = 3;
const BG_THRESHOLD = 40;

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

export type SpriteFrame = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export type PlayerSheet = {
  canvas: HTMLCanvasElement;
  frames: Record<Direction, SpriteFrame>;
};

export async function loadPlayerSheet(): Promise<PlayerSheet> {
  const image = await loadImage(
    `${import.meta.env.BASE_URL}img/sprites/p01-soldier.png`,
  );
  const canvas = knockOutSheetBackground(image);
  const frames = cropDirectionFrames(canvas);

  return { canvas, frames };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

function knockOutSheetBackground(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const br = pixels.data[0];
  const bg = pixels.data[1];
  const bb = pixels.data[2];
  const limit = BG_THRESHOLD * BG_THRESHOLD;

  for (let i = 0; i < pixels.data.length; i += 4) {
    const dr = pixels.data[i] - br;
    const dg = pixels.data[i + 1] - bg;
    const db = pixels.data[i + 2] - bb;

    if (dr * dr + dg * dg + db * db < limit) {
      pixels.data[i + 3] = 0;
    }
  }

  context.putImageData(pixels, 0, 0);
  return canvas;
}

function cropDirectionFrames(
  canvas: HTMLCanvasElement,
): Record<Direction, SpriteFrame> {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  const cellW = canvas.width / COLS;
  const cellH = canvas.height / ROWS;
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const frames = {} as Record<Direction, SpriteFrame>;

  for (const direction of DIRECTIONS) {
    const { col, row } = CELL[direction];
    frames[direction] = opaqueBounds(
      pixels,
      canvas.width,
      Math.floor(col * cellW),
      Math.floor(row * cellH),
      Math.floor(cellW),
      Math.floor(cellH),
    );
  }

  return frames;
}

function opaqueBounds(
  pixels: ImageData,
  stride: number,
  x: number,
  y: number,
  width: number,
  height: number,
): SpriteFrame {
  let minX = x + width;
  let minY = y + height;
  let maxX = x;
  let maxY = y;

  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      const alpha = pixels.data[(py * stride + px) * 4 + 3];

      if (alpha < 16) {
        continue;
      }

      if (px < minX) {
        minX = px;
      }

      if (py < minY) {
        minY = py;
      }

      if (px > maxX) {
        maxX = px;
      }

      if (py > maxY) {
        maxY = py;
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { sx: x, sy: y, sw: width, sh: height };
  }

  const pad = 1;
  const sx = Math.max(x, minX - pad);
  const sy = Math.max(y, minY - pad);
  const ex = Math.min(x + width, maxX + 1 + pad);
  const ey = Math.min(y + height, maxY + 1 + pad);

  return { sx, sy, sw: ex - sx, sh: ey - sy };
}
