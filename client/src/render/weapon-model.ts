import type { Box } from './player-model';

const METAL: [number, number, number] = [0.32, 0.34, 0.36];
const DARK: [number, number, number] = [0.1, 0.1, 0.11];
const SLIDE: [number, number, number] = [0.55, 0.56, 0.58];
const RUST: [number, number, number] = [0.56, 0.3, 0.14];
const BRASS: [number, number, number] = [0.72, 0.56, 0.22];

const HAND_X = 0.005;
const HAND_Y = 0.82;
const HAND_Z = 0.41;

const WOOD: [number, number, number] = [0.42, 0.28, 0.14];
const LASER: [number, number, number] = [0, 1, 80 / 255];
const ORANGE: [number, number, number] = [0.9, 0.4, 0.12];
const OLIVE: [number, number, number] = [0.3, 0.38, 0.22];

export function weaponBoxes(weaponId: string): Box[] {
  switch (weaponId) {
    case 'w02-smg':
      return smgBoxes();
    case 'w03-rifle':
      return rifleBoxes();
    case 'w04-shotgun':
      return shotgunBoxes();
    case 'w05-grenade':
      return grenadeBoxes();
    case 'w06-laser':
      return laserBoxes();
    case 'w07-rocket':
      return rocketBoxes();
    case 'w08-flamethrower':
      return flamerBoxes();
    default:
      return pistolBoxes();
  }
}

export function centerBoxes(boxes: Box[]): Box[] {
  if (boxes.length === 0) {
    return [];
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (const box of boxes) {
    minX = Math.min(minX, box.cx - box.hx);
    maxX = Math.max(maxX, box.cx + box.hx);
    minY = Math.min(minY, box.cy - box.hy);
    maxY = Math.max(maxY, box.cy + box.hy);
    minZ = Math.min(minZ, box.cz - box.hz);
    maxZ = Math.max(maxZ, box.cz + box.hz);
  }

  const ox = (minX + maxX) / 2;
  const oy = (minY + maxY) / 2;
  const oz = (minZ + maxZ) / 2;

  return boxes.map((box) => ({
    ...box,
    cx: box.cx - ox,
    cy: box.cy - oy,
    cz: box.cz - oz,
  }));
}

export function boxesExtent(boxes: Box[]): number {
  let extent = 0;

  for (const box of boxes) {
    extent = Math.max(
      extent,
      Math.abs(box.cx) + box.hx,
      Math.abs(box.cy) + box.hy,
      Math.abs(box.cz) + box.hz,
    );
  }

  return extent;
}

export function recoiledWeaponBoxes(weaponId: string): Box[] {
  return weaponBoxes(weaponId).map((box) => ({
    ...box,
    cy: box.cy + 0.012,
    cz: box.cz - 0.07,
  }));
}

function pistolBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y - 0.05, cz: HAND_Z + 0.03, hx: 0.024, hy: 0.062, hz: 0.03, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.03, cz: HAND_Z + 0.13, hx: 0.028, hy: 0.026, hz: 0.11, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.052, cz: HAND_Z + 0.13, hx: 0.024, hy: 0.016, hz: 0.1, color: SLIDE },
    { cx: HAND_X, cy: HAND_Y + 0.03, cz: HAND_Z + 0.27, hx: 0.016, hy: 0.016, hz: 0.055, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.07, cz: HAND_Z + 0.2, hx: 0.01, hy: 0.014, hz: 0.012, color: DARK },
    { cx: HAND_X + 0.028, cy: HAND_Y - 0.01, cz: HAND_Z + 0.1, hx: 0.014, hy: 0.022, hz: 0.022, color: BRASS },
  ];
}

function smgBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y - 0.02, cz: HAND_Z + 0.04, hx: 0.028, hy: 0.03, hz: 0.06, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.16, hx: 0.024, hy: 0.022, hz: 0.14, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.04, cz: HAND_Z + 0.12, hx: 0.02, hy: 0.012, hz: 0.08, color: RUST },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.34, hx: 0.014, hy: 0.014, hz: 0.08, color: DARK },
    { cx: HAND_X, cy: HAND_Y - 0.08, cz: HAND_Z + 0.08, hx: 0.016, hy: 0.06, hz: 0.02, color: RUST },
    { cx: HAND_X, cy: HAND_Y + 0.01, cz: HAND_Z - 0.06, hx: 0.018, hy: 0.018, hz: 0.05, color: DARK },
  ];
}

function rifleBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y - 0.01, cz: HAND_Z + 0.02, hx: 0.022, hy: 0.028, hz: 0.05, color: WOOD },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.2, hx: 0.02, hy: 0.018, hz: 0.2, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.04, cz: HAND_Z + 0.16, hx: 0.016, hy: 0.01, hz: 0.1, color: SLIDE },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.42, hx: 0.012, hy: 0.012, hz: 0.06, color: DARK },
    { cx: HAND_X, cy: HAND_Y - 0.06, cz: HAND_Z - 0.04, hx: 0.018, hy: 0.05, hz: 0.03, color: WOOD },
    { cx: HAND_X, cy: HAND_Y - 0.05, cz: HAND_Z + 0.12, hx: 0.014, hy: 0.04, hz: 0.016, color: DARK },
  ];
}

function shotgunBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.16, hx: 0.03, hy: 0.024, hz: 0.16, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.05, cz: HAND_Z + 0.14, hx: 0.022, hy: 0.014, hz: 0.12, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.36, hx: 0.024, hy: 0.02, hz: 0.08, color: DARK },
    { cx: HAND_X, cy: HAND_Y - 0.05, cz: HAND_Z + 0.02, hx: 0.02, hy: 0.05, hz: 0.028, color: WOOD },
    { cx: HAND_X, cy: HAND_Y + 0.0, cz: HAND_Z + 0.1, hx: 0.018, hy: 0.016, hz: 0.03, color: RUST },
  ];
}

function grenadeBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.08, hx: 0.032, hy: 0.036, hz: 0.03, color: OLIVE },
    { cx: HAND_X, cy: HAND_Y + 0.06, cz: HAND_Z + 0.08, hx: 0.016, hy: 0.012, hz: 0.016, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.08, cz: HAND_Z + 0.08, hx: 0.008, hy: 0.016, hz: 0.008, color: METAL },
  ];
}

function laserBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y + 0.01, cz: HAND_Z + 0.08, hx: 0.02, hy: 0.02, hz: 0.08, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.26, hx: 0.014, hy: 0.014, hz: 0.16, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.42, hx: 0.01, hy: 0.01, hz: 0.04, color: LASER },
    { cx: HAND_X, cy: HAND_Y - 0.04, cz: HAND_Z + 0.06, hx: 0.016, hy: 0.04, hz: 0.02, color: DARK },
    { cx: HAND_X + 0.03, cy: HAND_Y + 0.0, cz: HAND_Z + 0.1, hx: 0.016, hy: 0.018, hz: 0.02, color: LASER },
  ];
}

function rocketBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y + 0.03, cz: HAND_Z + 0.2, hx: 0.036, hy: 0.036, hz: 0.2, color: OLIVE },
    { cx: HAND_X, cy: HAND_Y + 0.03, cz: HAND_Z + 0.42, hx: 0.024, hy: 0.024, hz: 0.05, color: RUST },
    { cx: HAND_X, cy: HAND_Y + 0.03, cz: HAND_Z - 0.02, hx: 0.04, hy: 0.04, hz: 0.04, color: DARK },
    { cx: HAND_X, cy: HAND_Y - 0.04, cz: HAND_Z + 0.08, hx: 0.016, hy: 0.04, hz: 0.02, color: DARK },
    { cx: HAND_X + 0.05, cy: HAND_Y + 0.03, cz: HAND_Z + 0.08, hx: 0.016, hy: 0.01, hz: 0.03, color: METAL },
  ];
}

function flamerBoxes(): Box[] {
  return [
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.16, hx: 0.022, hy: 0.02, hz: 0.12, color: METAL },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.3, hx: 0.028, hy: 0.024, hz: 0.05, color: DARK },
    { cx: HAND_X - 0.05, cy: HAND_Y + 0.0, cz: HAND_Z + 0.04, hx: 0.03, hy: 0.04, hz: 0.03, color: OLIVE },
    { cx: HAND_X, cy: HAND_Y - 0.04, cz: HAND_Z + 0.08, hx: 0.016, hy: 0.036, hz: 0.016, color: DARK },
    { cx: HAND_X, cy: HAND_Y + 0.02, cz: HAND_Z + 0.36, hx: 0.016, hy: 0.016, hz: 0.03, color: ORANGE },
  ];
}
