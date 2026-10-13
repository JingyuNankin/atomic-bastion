import type { Box, Rgb } from './player-model';

const FRAME: Rgb = [0.16, 0.15, 0.14];
const PLATE: Rgb = [0.42, 0.4, 0.36];
const PLATE_DARK: Rgb = [0.28, 0.26, 0.24];
const BRASS: Rgb = [0.74, 0.58, 0.22];
const COIL: Rgb = [0.62, 0.32, 0.14];
const LAMP: Rgb = [0.7, 0.16, 0.13];

export function arcArmBoxes(): Box[] {
  return [
    { cx: -0.24, cy: 0.055, cz: 0, hx: 0.07, hy: 0.055, hz: 0.18, color: FRAME },
    { cx: 0.24, cy: 0.055, cz: 0, hx: 0.07, hy: 0.055, hz: 0.18, color: FRAME },
    { cx: 0, cy: 0.2, cz: -0.02, hx: 0.2, hy: 0.09, hz: 0.2, color: PLATE_DARK },
    { cx: 0, cy: 0.38, cz: -0.02, hx: 0.09, hy: 0.1, hz: 0.09, color: FRAME },
    { cx: 0, cy: 0.58, cz: 0, hx: 0.16, hy: 0.12, hz: 0.15, color: PLATE },
    { cx: 0, cy: 0.62, cz: 0.32, hx: 0.042, hy: 0.042, hz: 0.2, color: FRAME },
    { cx: 0, cy: 0.62, cz: 0.56, hx: 0.03, hy: 0.03, hz: 0.08, color: BRASS },
    { cx: -0.055, cy: 0.62, cz: 0.68, hx: 0.012, hy: 0.012, hz: 0.055, color: COIL },
    { cx: 0.055, cy: 0.62, cz: 0.68, hx: 0.012, hy: 0.012, hz: 0.055, color: COIL },
    { cx: 0.15, cy: 0.52, cz: 0.06, hx: 0.045, hy: 0.045, hz: 0.045, color: COIL },
    { cx: 0, cy: 0.74, cz: -0.02, hx: 0.035, hy: 0.028, hz: 0.035, color: LAMP },
    { cx: 0, cy: 0.72, cz: 0.22, hx: 0.016, hy: 0.028, hz: 0.03, color: BRASS },
  ];
}
