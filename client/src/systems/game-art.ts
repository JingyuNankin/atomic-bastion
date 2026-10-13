import { listDesignedEnemies, type EnemyId } from '../enemies/catalog';
import { getDefaultOperative, listOperatives, type OperativeId } from '../operatives/catalog';
import {
  bakeBoxSheet,
  bakeFittedSprite,
  bakeGaitSheet,
  PLAYER_CELL,
} from '../render/bake-player-sheet';
import { operativeBoxes } from '../render/operative-model';
import { arcArmBoxes } from '../render/arc-arm-model';
import { droneBoxes } from '../render/drone-model';
import {
  HYENA_GAIT_CELL,
  HYENA_GAIT_ORTHO,
  hyenaBoxes,
} from '../render/hyena-model';
import { muzzleFlashBoxes, projectileBoxes } from '../render/projectile-model';
import { PLAYER_ORTHO, type OrthoBounds } from '../render/player-gl';
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
  operatives: Record<OperativeId, HTMLCanvasElement>;
  enemies: Record<EnemyId, HTMLCanvasElement>;
  weapons: Record<WeaponId, WeaponArt>;
  projectiles: Record<ProjectileId, HTMLCanvasElement>;
  muzzleFlash: HTMLCanvasElement;
};

export async function loadGameArt(): Promise<GameArt> {
  const weapons: Record<WeaponId, WeaponArt> = {};
  const projectiles: Record<ProjectileId, HTMLCanvasElement> = {};
  const enemies: Record<EnemyId, HTMLCanvasElement> = {};
  const operatives: Record<OperativeId, HTMLCanvasElement> = {};

  for (const operative of listOperatives()) {
    operatives[operative.id] = bakeGaitSheet(operativeBoxes(operative.model));
  }

  for (const enemy of listDesignedEnemies()) {
    const bake = enemyBake(enemy.id);

    if (!bake) {
      continue;
    }

    enemies[enemy.id] = bake.gait
      ? bakeGaitSheet(bake.boxes, bake.frame, bake.ortho)
      : bakeBoxSheet(bake.boxes, bake.frame, bake.ortho);
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
    player: operatives[getDefaultOperative().id],
    operatives,
    enemies,
    weapons,
    projectiles,
    muzzleFlash: bakeFittedSprite(muzzleFlashBoxes(), 40, Math.PI / 2),
  };
}

function enemyBake(id: EnemyId): {
  boxes: Box[];
  frame: { width: number; height: number };
  ortho?: OrthoBounds;
  gait?: boolean;
} | null {
  if (id === 'e01-hyena') {
    return {
      boxes: hyenaBoxes(),
      frame: HYENA_GAIT_CELL,
      ortho: HYENA_GAIT_ORTHO,
      gait: true,
    };
  }

  if (id === 'e02-drone') {
    return { boxes: droneBoxes(), frame: PLAYER_CELL, ortho: PLAYER_ORTHO };
  }

  if (id === 'e03-arc') {
    return { boxes: arcArmBoxes(), frame: PLAYER_CELL, ortho: PLAYER_ORTHO };
  }

  return null;
}

export function getWeaponArt(
  art: GameArt | null,
  weaponId: WeaponId,
): WeaponArt | null {
  return art?.weapons[weaponId] ?? null;
}
