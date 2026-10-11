import { GAIT_PAD, PLAYER_CELL } from './bake-player-sheet';
import { PLAYER_ORTHO, type OrthoBounds } from './player-gl';
import type { Box, Limb, Rgb } from './player-model';

const FRAME: Rgb = [0.16, 0.15, 0.14];
const PLATE: Rgb = [0.48, 0.45, 0.4];
const PLATE_DARK: Rgb = [0.3, 0.28, 0.25];
const RUST: Rgb = [0.58, 0.3, 0.14];
const BRASS: Rgb = [0.74, 0.58, 0.22];
const JAW: Rgb = [0.7, 0.67, 0.6];
const LAMP: Rgb = [0.7, 0.16, 0.13];

const CELL_WIDTH = 80;

export const HYENA_CELL = {
  width: CELL_WIDTH,
  height: PLAYER_CELL.height,
} as const;

export const HYENA_ORTHO: OrthoBounds = {
  ...PLAYER_ORTHO,
  left: PLAYER_ORTHO.left * (CELL_WIDTH / PLAYER_CELL.width),
  right: PLAYER_ORTHO.right * (CELL_WIDTH / PLAYER_CELL.width),
};

const MODEL_PX = PLAYER_CELL.height / (PLAYER_ORTHO.top - PLAYER_ORTHO.bottom);

/** 前腿摆出去会低于待机正交，多出来的像素贴在格子底部。 */
export const HYENA_GAIT_PAD = GAIT_PAD + 16;

export const HYENA_GAIT_CELL = {
  width: CELL_WIDTH,
  height: PLAYER_CELL.height + HYENA_GAIT_PAD,
} as const;

export const HYENA_GAIT_ORTHO: OrthoBounds = {
  ...HYENA_ORTHO,
  bottom: HYENA_ORTHO.bottom - HYENA_GAIT_PAD / MODEL_PX,
};

const FRONT_JOINT = { y: 0.58, z: 0.36 };
const HIND_JOINT = { y: 0.46, z: -0.42 };

export function hyenaBoxes(): Box[] {
  return [
    leg({ cx: -0.16, cy: 0.38, cz: FRONT_JOINT.z, hx: 0.058, hy: 0.2, hz: 0.055, color: FRAME }, 'front-left', 0.46, FRONT_JOINT),
    leg({ cx: 0.16, cy: 0.38, cz: FRONT_JOINT.z, hx: 0.058, hy: 0.2, hz: 0.055, color: FRAME }, 'front-right', 0.46, FRONT_JOINT),
    leg({ cx: -0.16, cy: 0.058, cz: FRONT_JOINT.z, hx: 0.07, hy: 0.122, hz: 0.09, color: FRAME }, 'front-left', 0.46, FRONT_JOINT),
    leg({ cx: 0.16, cy: 0.058, cz: FRONT_JOINT.z, hx: 0.07, hy: 0.122, hz: 0.09, color: FRAME }, 'front-right', 0.46, FRONT_JOINT),

    leg({ cx: -0.15, cy: 0.3, cz: HIND_JOINT.z, hx: 0.055, hy: 0.16, hz: 0.05, color: FRAME }, 'hind-left', -0.5, HIND_JOINT),
    leg({ cx: 0.15, cy: 0.3, cz: HIND_JOINT.z, hx: 0.055, hy: 0.16, hz: 0.05, color: FRAME }, 'hind-right', -0.5, HIND_JOINT),
    leg({ cx: -0.15, cy: 0.038, cz: HIND_JOINT.z, hx: 0.065, hy: 0.102, hz: 0.08, color: FRAME }, 'hind-left', -0.5, HIND_JOINT),
    leg({ cx: 0.15, cy: 0.038, cz: HIND_JOINT.z, hx: 0.065, hy: 0.102, hz: 0.08, color: FRAME }, 'hind-right', -0.5, HIND_JOINT),

    { cx: 0, cy: 0.5, cz: -0.34, hx: 0.17, hy: 0.14, hz: 0.16, color: PLATE_DARK },
    { cx: 0, cy: 0.44, cz: 0.02, hx: 0.14, hy: 0.1, hz: 0.26, color: FRAME },
    { cx: 0, cy: 0.72, cz: 0.26, hx: 0.2, hy: 0.18, hz: 0.2, color: PLATE },
    { cx: 0, cy: 0.9, cz: 0.14, hx: 0.17, hy: 0.14, hz: 0.18, color: PLATE },
    { cx: 0, cy: 0.7, cz: -0.08, hx: 0.15, hy: 0.11, hz: 0.16, color: PLATE_DARK },
    { cx: 0, cy: 1.02, cz: 0.02, hx: 0.04, hy: 0.035, hz: 0.32, color: FRAME },

    { cx: 0, cy: 0.76, cz: 0.5, hx: 0.11, hy: 0.11, hz: 0.11, color: FRAME },
    { cx: 0, cy: 0.88, cz: 0.7, hx: 0.15, hy: 0.14, hz: 0.16, color: PLATE },
    { cx: 0, cy: 0.74, cz: 0.9, hx: 0.1, hy: 0.075, hz: 0.13, color: PLATE_DARK },
    { cx: 0, cy: 0.6, cz: 0.88, hx: 0.085, hy: 0.05, hz: 0.13, color: JAW },
    { cx: 0, cy: 0.67, cz: 1.02, hx: 0.06, hy: 0.02, hz: 0.04, color: JAW },

    { cx: -0.1, cy: 1.08, cz: 0.64, hx: 0.032, hy: 0.1, hz: 0.028, color: FRAME },
    { cx: 0.1, cy: 1.08, cz: 0.64, hx: 0.032, hy: 0.1, hz: 0.028, color: FRAME },
    { cx: -0.07, cy: 0.94, cz: 0.84, hx: 0.028, hy: 0.022, hz: 0.016, color: LAMP },
    { cx: 0.07, cy: 0.94, cz: 0.84, hx: 0.028, hy: 0.022, hz: 0.016, color: LAMP },

    { cx: -0.14, cy: 0.98, cz: 0.26, hx: 0.028, hy: 0.028, hz: 0.028, color: BRASS },
    { cx: 0.14, cy: 0.98, cz: 0.26, hx: 0.028, hy: 0.028, hz: 0.028, color: BRASS },
    { cx: 0.12, cy: 0.64, cz: -0.22, hx: 0.05, hy: 0.045, hz: 0.07, color: RUST },

    { cx: 0, cy: 0.42, cz: -0.64, hx: 0.03, hy: 0.03, hz: 0.1, color: FRAME },
    { cx: 0.05, cy: 0.3, cz: -0.78, hx: 0.025, hy: 0.025, hz: 0.07, color: FRAME },
  ];
}

function leg(
  box: Box,
  limb: Limb,
  pitch: number,
  joint: { y: number; z: number },
): Box {
  return {
    ...box,
    limb,
    pitch,
    jointY: joint.y,
    jointZ: joint.z,
  };
}
