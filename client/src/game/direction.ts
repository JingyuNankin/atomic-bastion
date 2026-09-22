export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;

export type Direction = (typeof DIRECTIONS)[number];

export type Axis = {
  x: number;
  y: number;
};

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
