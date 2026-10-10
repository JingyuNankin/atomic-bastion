import type { Box, Rgb } from './player-model';

const SKIN: Rgb = [0.76, 0.58, 0.44];
const EYE: Rgb = [0.08, 0.08, 0.09];
const KHAKI: Rgb = [0.52, 0.48, 0.32];
const KHAKI_DARK: Rgb = [0.4, 0.36, 0.24];
const CAP: Rgb = [0.34, 0.4, 0.22];
const BAND: Rgb = [0.78, 0.12, 0.1];
const VISOR: Rgb = [0.07, 0.06, 0.05];
const HAIR: Rgb = [0.12, 0.11, 0.1];
const BOOT: Rgb = [0.07, 0.06, 0.05];
const BELT: Rgb = [0.24, 0.15, 0.09];
const BRASS: Rgb = [0.68, 0.52, 0.22];
const STAR: Rgb = [0.62, 0.15, 0.12];
const BOARD: Rgb = [0.58, 0.16, 0.13];

export function soldierBoxes(): Box[] {
  return [
    { cx: -0.11, cy: 0.13, cz: 0.02, hx: 0.08, hy: 0.13, hz: 0.11, color: BOOT },
    { cx: 0.11, cy: 0.13, cz: 0.02, hx: 0.08, hy: 0.13, hz: 0.11, color: BOOT },
    { cx: -0.11, cy: 0.28, cz: 0.01, hx: 0.09, hy: 0.045, hz: 0.085, color: KHAKI_DARK },
    { cx: 0.11, cy: 0.28, cz: 0.01, hx: 0.09, hy: 0.045, hz: 0.085, color: KHAKI_DARK },
    { cx: -0.1, cy: 0.4, cz: 0.01, hx: 0.075, hy: 0.09, hz: 0.075, color: KHAKI },
    { cx: 0.1, cy: 0.4, cz: 0.01, hx: 0.075, hy: 0.09, hz: 0.075, color: KHAKI },
    { cx: 0, cy: 0.5, cz: 0.01, hx: 0.17, hy: 0.07, hz: 0.09, color: KHAKI },
    { cx: 0, cy: 0.78, cz: 0.02, hx: 0.17, hy: 0.22, hz: 0.11, color: KHAKI },
    { cx: -0.07, cy: 0.86, cz: 0.135, hx: 0.035, hy: 0.03, hz: 0.012, color: KHAKI_DARK },
    { cx: 0.07, cy: 0.86, cz: 0.135, hx: 0.035, hy: 0.03, hz: 0.012, color: KHAKI_DARK },
    { cx: 0, cy: 0.6, cz: 0.1, hx: 0.175, hy: 0.022, hz: 0.045, color: BELT },
    { cx: 0, cy: 0.6, cz: 0.15, hx: 0.028, hy: 0.022, hz: 0.012, color: BRASS },
    { cx: -0.16, cy: 0.56, cz: -0.05, hx: 0.04, hy: 0.05, hz: 0.032, color: KHAKI_DARK },
    { cx: 0, cy: 1.02, cz: 0.03, hx: 0.075, hy: 0.04, hz: 0.07, color: KHAKI_DARK },
    { cx: -0.055, cy: 1.03, cz: 0.1, hx: 0.016, hy: 0.022, hz: 0.01, color: BOARD },
    { cx: 0.055, cy: 1.03, cz: 0.1, hx: 0.016, hy: 0.022, hz: 0.01, color: BOARD },
    { cx: 0, cy: 1.16, cz: 0.05, hx: 0.09, hy: 0.09, hz: 0.08, color: SKIN },
    { cx: -0.035, cy: 1.17, cz: 0.135, hx: 0.02, hy: 0.014, hz: 0.012, color: EYE },
    { cx: 0.035, cy: 1.17, cz: 0.135, hx: 0.02, hy: 0.014, hz: 0.012, color: EYE },
    { cx: 0, cy: 1.16, cz: -0.04, hx: 0.085, hy: 0.035, hz: 0.03, color: HAIR },
    { cx: -0.09, cy: 1.14, cz: 0.02, hx: 0.016, hy: 0.03, hz: 0.025, color: HAIR },
    { cx: 0.09, cy: 1.14, cz: 0.02, hx: 0.016, hy: 0.03, hz: 0.025, color: HAIR },
    { cx: -0.1, cy: 1.14, cz: 0.03, hx: 0.014, hy: 0.024, hz: 0.015, color: SKIN },
    { cx: 0.1, cy: 1.14, cz: 0.03, hx: 0.014, hy: 0.024, hz: 0.015, color: SKIN },
    { cx: 0, cy: 1.268, cz: 0.02, hx: 0.112, hy: 0.038, hz: 0.108, color: BAND },
    { cx: 0, cy: 1.268, cz: 0.132, hx: 0.024, hy: 0.024, hz: 0.01, color: BRASS },
    { cx: 0, cy: 1.268, cz: 0.144, hx: 0.014, hy: 0.014, hz: 0.008, color: STAR },
    { cx: -0.112, cy: 1.26, cz: 0.02, hx: 0.012, hy: 0.012, hz: 0.012, color: BRASS },
    { cx: 0.112, cy: 1.26, cz: 0.02, hx: 0.012, hy: 0.012, hz: 0.012, color: BRASS },
    { cx: 0, cy: 1.348, cz: 0.015, hx: 0.1, hy: 0.038, hz: 0.092, color: CAP },
    { cx: 0, cy: 1.392, cz: 0.012, hx: 0.122, hy: 0.012, hz: 0.112, color: CAP },
    { cx: 0, cy: 1.222, cz: 0.145, hx: 0.132, hy: 0.01, hz: 0.052, color: VISOR },
    { cx: -0.2, cy: 0.9, cz: 0.02, hx: 0.055, hy: 0.055, hz: 0.055, color: KHAKI },
    { cx: 0.2, cy: 0.9, cz: 0.02, hx: 0.055, hy: 0.055, hz: 0.055, color: KHAKI },
    { cx: -0.2, cy: 0.968, cz: 0.02, hx: 0.05, hy: 0.014, hz: 0.03, color: BOARD },
    { cx: 0.2, cy: 0.968, cz: 0.02, hx: 0.05, hy: 0.014, hz: 0.03, color: BOARD },
    { cx: -0.15, cy: 0.86, cz: 0.14, hx: 0.05, hy: 0.05, hz: 0.1, color: KHAKI },
    { cx: 0.15, cy: 0.86, cz: 0.14, hx: 0.05, hy: 0.05, hz: 0.1, color: KHAKI },
    { cx: -0.07, cy: 0.83, cz: 0.3, hx: 0.04, hy: 0.04, hz: 0.1, color: SKIN },
    { cx: 0.07, cy: 0.81, cz: 0.3, hx: 0.04, hy: 0.04, hz: 0.1, color: SKIN },
    { cx: -0.03, cy: 0.83, cz: 0.41, hx: 0.035, hy: 0.035, hz: 0.04, color: SKIN },
    { cx: 0.04, cy: 0.81, cz: 0.41, hx: 0.035, hy: 0.035, hz: 0.04, color: SKIN },
  ];
}
