import { bakeBoxSheet, bakeFittedSprite, bakePlayerSheet } from '../render/bake-player-sheet';
import { muzzleFlashBoxes, projectileBoxes } from '../render/projectile-model';
import { recoiledWeaponBoxes, weaponBoxes } from '../render/weapon-model';
import {
  listDesignedWeapons,
  listProjectiles,
  type ProjectileId,
  type WeaponId,
} from '../weapons/catalog';

export type WeaponArt = {
  overlay: HTMLCanvasElement;
  fireOverlay: HTMLCanvasElement;
  icon: HTMLCanvasElement;
};

export type GameArt = {
  player: HTMLCanvasElement;
  weapons: Record<WeaponId, WeaponArt>;
  projectiles: Record<ProjectileId, HTMLCanvasElement>;
  muzzleFlash: HTMLCanvasElement;
};

export async function loadGameArt(): Promise<GameArt> {
  const weapons: Record<WeaponId, WeaponArt> = {};
  const projectiles: Record<ProjectileId, HTMLCanvasElement> = {};

  for (const weapon of listDesignedWeapons()) {
    weapons[weapon.id] = {
      overlay: bakeBoxSheet(weaponBoxes(weapon.id)),
      fireOverlay: bakeBoxSheet(recoiledWeaponBoxes(weapon.id)),
      icon: bakeFittedSprite(weaponBoxes(weapon.id), 40),
    };
  }

  for (const projectile of listProjectiles()) {
    projectiles[projectile.id] = bakeFittedSprite(
      projectileBoxes(projectile),
      48,
      Math.PI / 2,
    );
  }

  return {
    player: bakePlayerSheet(),
    weapons,
    projectiles,
    muzzleFlash: bakeFittedSprite(muzzleFlashBoxes(), 40, Math.PI / 2),
  };
}

export function getWeaponArt(
  art: GameArt | null,
  weaponId: WeaponId,
): WeaponArt | null {
  return art?.weapons[weaponId] ?? null;
}
