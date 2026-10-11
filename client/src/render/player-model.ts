export type Rgb = readonly [number, number, number];

export type Limb =
  | 'left-leg'
  | 'right-leg'
  | 'front-left'
  | 'front-right'
  | 'hind-left'
  | 'hind-right';

export type Box = {
  cx: number;
  cy: number;
  cz: number;
  hx: number;
  hy: number;
  hz: number;
  color: Rgb;
  limb?: Limb;
  /** 绕髋部、平行于 x 轴的转角。正值把脚摆向身前。 */
  pitch?: number;
  jointY?: number;
  jointZ?: number;
};

const HAIR: Rgb = [0.12, 0.12, 0.13];
const SKIN: Rgb = [0.83, 0.69, 0.55];
const SHIRT: Rgb = [0.95, 0.95, 0.93];
const TIE: Rgb = [0.79, 0.64, 0.16];
const PANTS: Rgb = [0.1, 0.1, 0.11];
const BOOT: Rgb = [0.06, 0.06, 0.07];
const EYE: Rgb = [0.08, 0.08, 0.09];

export function playerBoxes(): Box[] {
  return [
    { cx: -0.11, cy: 0.055, cz: 0.03, hx: 0.075, hy: 0.055, hz: 0.11, color: BOOT, limb: 'left-leg' },
    { cx: 0.11, cy: 0.055, cz: 0.03, hx: 0.075, hy: 0.055, hz: 0.11, color: BOOT, limb: 'right-leg' },
    { cx: -0.1, cy: 0.26, cz: 0.01, hx: 0.07, hy: 0.16, hz: 0.07, color: PANTS, limb: 'left-leg' },
    { cx: 0.1, cy: 0.26, cz: 0.01, hx: 0.07, hy: 0.16, hz: 0.07, color: PANTS, limb: 'right-leg' },
    { cx: 0, cy: 0.48, cz: 0.01, hx: 0.17, hy: 0.08, hz: 0.09, color: PANTS },
    { cx: 0, cy: 0.78, cz: 0.02, hx: 0.16, hy: 0.22, hz: 0.1, color: SHIRT },
    { cx: 0, cy: 0.76, cz: 0.14, hx: 0.035, hy: 0.16, hz: 0.03, color: TIE },
    { cx: 0, cy: 1.03, cz: 0.02, hx: 0.05, hy: 0.04, hz: 0.05, color: SKIN },
    { cx: 0, cy: 1.18, cz: 0.03, hx: 0.1, hy: 0.11, hz: 0.1, color: SKIN },
    { cx: 0, cy: 1.28, cz: -0.01, hx: 0.11, hy: 0.06, hz: 0.1, color: HAIR },
    { cx: 0, cy: 1.2, cz: -0.06, hx: 0.11, hy: 0.1, hz: 0.07, color: HAIR },
    { cx: -0.035, cy: 1.19, cz: 0.135, hx: 0.022, hy: 0.016, hz: 0.014, color: EYE },
    { cx: 0.035, cy: 1.19, cz: 0.135, hx: 0.022, hy: 0.016, hz: 0.014, color: EYE },
    { cx: -0.2, cy: 0.9, cz: 0.02, hx: 0.055, hy: 0.055, hz: 0.055, color: SHIRT },
    { cx: 0.2, cy: 0.9, cz: 0.02, hx: 0.055, hy: 0.055, hz: 0.055, color: SHIRT },
    { cx: -0.15, cy: 0.86, cz: 0.14, hx: 0.05, hy: 0.05, hz: 0.1, color: SHIRT },
    { cx: 0.15, cy: 0.86, cz: 0.14, hx: 0.05, hy: 0.05, hz: 0.1, color: SHIRT },
    { cx: -0.07, cy: 0.83, cz: 0.3, hx: 0.04, hy: 0.04, hz: 0.1, color: SKIN },
    { cx: 0.07, cy: 0.81, cz: 0.3, hx: 0.04, hy: 0.04, hz: 0.1, color: SKIN },
    { cx: -0.03, cy: 0.83, cz: 0.41, hx: 0.035, hy: 0.035, hz: 0.04, color: SKIN },
    { cx: 0.04, cy: 0.81, cz: 0.41, hx: 0.035, hy: 0.035, hz: 0.04, color: SKIN },
  ];
}
