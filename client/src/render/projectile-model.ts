import type { Box, Rgb } from './player-model';
import type { ProjectileDef } from '../weapons/catalog';

const FLASH: Rgb = [1, 0.78, 0.28];
const FLASH_HOT: Rgb = [1, 0.94, 0.7];

export function projectileBoxes(def: ProjectileDef): Box[] {
  const tint = parseTint(def.tint);

  switch (def.style) {
    case 'pellet':
      return pelletBoxes(tint);
    case 'beam':
      return beamBoxes(tint);
    case 'rocket':
      return rocketBoxes(tint);
    case 'grenade':
      return grenadeBoxes(tint);
    case 'flame':
      return flameBoxes(tint);
    default:
      return slugBoxes(tint);
  }
}

export function muzzleFlashBoxes(): Box[] {
  return [
    { cx: 0, cy: 0, cz: 0, hx: 0.04, hy: 0.03, hz: 0.06, color: FLASH },
    { cx: 0, cy: 0, cz: 0.08, hx: 0.02, hy: 0.016, hz: 0.05, color: FLASH_HOT },
    { cx: 0.05, cy: 0, cz: 0.02, hx: 0.03, hy: 0.012, hz: 0.02, color: FLASH },
    { cx: -0.05, cy: 0, cz: 0.02, hx: 0.03, hy: 0.012, hz: 0.02, color: FLASH },
  ];
}

function slugBoxes(tint: Rgb): Box[] {
  return [
    { cx: 0, cy: 0, cz: 0, hx: 0.016, hy: 0.016, hz: 0.055, color: tint },
    {
      cx: 0,
      cy: 0,
      cz: 0.06,
      hx: 0.012,
      hy: 0.012,
      hz: 0.02,
      color: shade(tint, 1.15),
    },
  ];
}

function pelletBoxes(tint: Rgb): Box[] {
  return [{ cx: 0, cy: 0, cz: 0, hx: 0.022, hy: 0.022, hz: 0.022, color: tint }];
}

function beamBoxes(tint: Rgb): Box[] {
  return [
    { cx: 0, cy: 0, cz: 0, hx: 0.01, hy: 0.01, hz: 0.14, color: tint },
    {
      cx: 0,
      cy: 0,
      cz: 0,
      hx: 0.004,
      hy: 0.004,
      hz: 0.16,
      color: shade(tint, 1.45),
    },
  ];
}

function rocketBoxes(tint: Rgb): Box[] {
  const nose: Rgb = [0.82, 0.28, 0.16];
  const fin: Rgb = [0.22, 0.22, 0.24];
  return [
    { cx: 0, cy: 0, cz: -0.02, hx: 0.028, hy: 0.028, hz: 0.07, color: tint },
    { cx: 0, cy: 0, cz: 0.08, hx: 0.02, hy: 0.02, hz: 0.04, color: nose },
    { cx: 0.04, cy: 0, cz: -0.06, hx: 0.02, hy: 0.006, hz: 0.03, color: fin },
    { cx: -0.04, cy: 0, cz: -0.06, hx: 0.02, hy: 0.006, hz: 0.03, color: fin },
  ];
}

function grenadeBoxes(tint: Rgb): Box[] {
  return [
    { cx: 0, cy: 0, cz: 0, hx: 0.03, hy: 0.03, hz: 0.034, color: tint },
    { cx: 0, cy: 0.028, cz: 0, hx: 0.012, hy: 0.01, hz: 0.012, color: shade(tint, 0.7) },
  ];
}

function flameBoxes(tint: Rgb): Box[] {
  return [
    { cx: 0, cy: 0, cz: 0, hx: 0.03, hy: 0.026, hz: 0.04, color: tint },
    { cx: 0, cy: 0.02, cz: 0.02, hx: 0.02, hy: 0.02, hz: 0.03, color: shade(tint, 1.25) },
  ];
}

function parseTint(hex: string): Rgb {
  const value = hex.replace('#', '');

  if (value.length !== 6) {
    return [0.75, 0.6, 0.28];
  }

  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}

function shade(color: Rgb, factor: number): Rgb {
  return [
    Math.min(1, color[0] * factor),
    Math.min(1, color[1] * factor),
    Math.min(1, color[2] * factor),
  ];
}
