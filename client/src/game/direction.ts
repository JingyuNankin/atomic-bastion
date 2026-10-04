export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

export type Direction = (typeof DIRECTIONS)[number];

export type Axis = {
  x: number;
  y: number;
};

const VECTOR: Record<Direction, Axis> = {
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 },
};

export function directionVector(direction: Direction): Axis {
  return VECTOR[direction];
}

export function directionAngle(direction: Direction): number {
  const { x, y } = VECTOR[direction];
  return Math.atan2(y, x);
}

export function axisToDirection(x: number, y: number): Direction | null {
  if (x === 0 && y === 0) {
    return null;
  }

  if (y < 0 && x === 0) {
    return 'n';
  }

  if (y < 0 && x > 0) {
    return 'ne';
  }

  if (y === 0 && x > 0) {
    return 'e';
  }

  if (y > 0 && x > 0) {
    return 'se';
  }

  if (y > 0 && x === 0) {
    return 's';
  }

  if (y > 0 && x < 0) {
    return 'sw';
  }

  if (y === 0 && x < 0) {
    return 'w';
  }

  return 'nw';
}
