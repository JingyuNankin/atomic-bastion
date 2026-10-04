import { bakeBoxSheet, bakeFittedSprite, bakePlayerSheet } from '../render/bake-player-sheet';
import { projectileBoxes, weaponBoxes } from '../render/weapon-model';
import { listWeapons, type WeaponId } from '../weapons/catalog';

export type WeaponArt = {
  overlay: HTMLCanvasElement;
  icon: HTMLCanvasElement;
  projectile: HTMLCanvasElement;
};

export type GameArt = {
  player: HTMLCanvasElement;
  weapons: Record<WeaponId, WeaponArt>;
};

export async function loadGameArt(): Promise<GameArt> {
  const weapons: Record<WeaponId, WeaponArt> = {};

  for (const weapon of listWeapons()) {
    weapons[weapon.id] = {
      overlay: bakeBoxSheet(weaponBoxes(weapon.id)),
      icon: bakeFittedSprite(weaponBoxes(weapon.id), 40),
      projectile: bakeFittedSprite(projectileBoxes(weapon.id), 16),
    };
  }

  return {
    player: bakePlayerSheet(),
    weapons,
  };
}

export function getWeaponArt(
  art: GameArt | null,
  weaponId: WeaponId,
): WeaponArt | null {
  return art?.weapons[weaponId] ?? null;
}
