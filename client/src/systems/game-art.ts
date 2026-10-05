import { listDesignedEnemies, type EnemyId } from '../enemies/catalog';
import { bakeBoxSheet, bakeFittedSprite, bakePlayerSheet } from '../render/bake-player-sheet';
import { HYENA_CELL, HYENA_ORTHO, hyenaBoxes } from '../render/hyena-model';
import { muzzleFlashBoxes, projectileBoxes } from '../render/projectile-model';
import type { Box } from '../render/player-model';
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
  enemies: Record<EnemyId, HTMLCanvasElement>;
  weapons: Record<WeaponId, WeaponArt>;
  projectiles: Record<ProjectileId, HTMLCanvasElement>;
  muzzleFlash: HTMLCanvasElement;
};

export async function loadGameArt(): Promise<GameArt> {
  const weapons: Record<WeaponId, WeaponArt> = {};
  const projectiles: Record<ProjectileId, HTMLCanvasElement> = {};
  const enemies: Record<EnemyId, HTMLCanvasElement> = {};

  for (const enemy of listDesignedEnemies()) {
    const boxes = enemyBoxes(enemy.id);

    if (!boxes) {
      continue;
    }

    enemies[enemy.id] = bakeBoxSheet(boxes, HYENA_CELL, HYENA_ORTHO);
  }

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
    enemies,
    weapons,
    projectiles,
    muzzleFlash: bakeFittedSprite(muzzleFlashBoxes(), 40, Math.PI / 2),
  };
}

function enemyBoxes(id: EnemyId): Box[] | null {
  if (id === 'e01-hyena') {
    return hyenaBoxes();
  }

  return null;
}

export function getWeaponArt(
  art: GameArt | null,
  weaponId: WeaponId,
): WeaponArt | null {
  return art?.weapons[weaponId] ?? null;
}
