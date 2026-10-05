import type { Box, Rgb } from './player-model';

const FRAME: Rgb = [0.16, 0.15, 0.14];
const PLATE: Rgb = [0.46, 0.44, 0.4];
const BRASS: Rgb = [0.74, 0.58, 0.22];
const ROTOR: Rgb = [0.24, 0.23, 0.21];
const LAMP: Rgb = [0.64, 0.13, 0.13];

const ALT = 0.84;

export function droneBoxes(): Box[] {
  return [
    { cx: 0, cy: ALT, cz: 0.02, hx: 0.16, hy: 0.07, hz: 0.18, color: PLATE },
    { cx: 0, cy: ALT - 0.01, cz: 0.22, hx: 0.07, hy: 0.05, hz: 0.08, color: FRAME },
    { cx: 0, cy: ALT + 0.02, cz: 0.3, hx: 0.028, hy: 0.028, hz: 0.028, color: LAMP },
    { cx: 0, cy: ALT - 0.1, cz: 0, hx: 0.055, hy: 0.035, hz: 0.07, color: BRASS },
    { cx: -0.1, cy: ALT - 0.16, cz: 0.02, hx: 0.018, hy: 0.016, hz: 0.14, color: FRAME },
    { cx: 0.1, cy: ALT - 0.16, cz: 0.02, hx: 0.018, hy: 0.016, hz: 0.14, color: FRAME },
    { cx: 0, cy: ALT + 0.05, cz: 0, hx: 0.32, hy: 0.018, hz: 0.03, color: FRAME },
    { cx: 0, cy: ALT + 0.05, cz: 0, hx: 0.03, hy: 0.018, hz: 0.32, color: FRAME },
    ...rotor(0.3, 0.3),
    ...rotor(-0.3, 0.3),
    ...rotor(0.3, -0.3),
    ...rotor(-0.3, -0.3),
  ];
}

function rotor(x: number, z: number): Box[] {
  return [
    { cx: x, cy: ALT + 0.1, cz: z, hx: 0.1, hy: 0.012, hz: 0.028, color: ROTOR },
    { cx: x, cy: ALT + 0.1, cz: z, hx: 0.028, hy: 0.012, hz: 0.1, color: ROTOR },
    { cx: x, cy: ALT + 0.07, cz: z, hx: 0.022, hy: 0.028, hz: 0.022, color: BRASS },
  ];
}
