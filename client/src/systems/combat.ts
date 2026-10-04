import {
  muzzlePoint,
  type Player,
} from '../entities/player';
import type { Projectile } from '../entities/projectile';
import { directionAngle } from '../game/direction';
import { getWeapon, getWeaponProjectile } from '../weapons/catalog';

const MAX_SHOTS = 80;
const RECOIL_TIME = 0.11;
const FLASH_TIME = 0.07;

export const DENIED_FIRE_TIME = 0.7;

export type Combat = {
  fireCooldown: number;
  reloadTimer: number;
  reloadDuration: number;
  deniedFireTimer: number;
  wasFiring: boolean;
};

export function createCombat(): Combat {
  return {
    fireCooldown: 0,
    reloadTimer: 0,
    reloadDuration: 0,
    deniedFireTimer: 0,
    wasFiring: false,
  };
}

export function resetCombat(combat: Combat): void {
  combat.fireCooldown = 0;
  combat.reloadTimer = 0;
  combat.reloadDuration = 0;
  combat.deniedFireTimer = 0;
  combat.wasFiring = false;
}

export function updateCombat(
  combat: Combat,
  player: Player,
  projectiles: Projectile[],
  dt: number,
  firing: boolean,
): void {
  const weapon = getWeapon(player.weaponId);

  combat.fireCooldown = Math.max(0, combat.fireCooldown - dt);
  combat.deniedFireTimer = Math.max(0, combat.deniedFireTimer - dt);
  player.recoil = Math.max(0, player.recoil - dt / RECOIL_TIME);
  player.muzzleFlash = Math.max(0, player.muzzleFlash - dt / FLASH_TIME);

  if (combat.reloadTimer > 0) {
    if (firing && !combat.wasFiring) {
      combat.deniedFireTimer = DENIED_FIRE_TIME;
    }

    combat.reloadTimer = Math.max(0, combat.reloadTimer - dt);

    if (combat.reloadTimer === 0) {
      player.ammoInMag = weapon.magazineSize;
      combat.reloadDuration = 0;
    }
  } else if (player.ammoInMag <= 0) {
    combat.reloadTimer = weapon.reloadTime;
    combat.reloadDuration = weapon.reloadTime;
  }

  const wantsShot =
    combat.reloadTimer === 0 &&
    (weapon.fireMode === 'auto' ? firing : firing && !combat.wasFiring);

  if (wantsShot) {
    tryFire(combat, player, projectiles);
  }

  combat.wasFiring = firing;
}

function tryFire(
  combat: Combat,
  player: Player,
  projectiles: Projectile[],
): void {
  const weapon = getWeapon(player.weaponId);

  if (combat.fireCooldown > 0 || player.ammoInMag <= 0) {
    return;
  }

  const origin = muzzlePoint(player);
  const baseAngle = directionAngle(player.facing);
  const count = Math.max(1, weapon.projectileCount);

  for (let i = 0; i < count; i += 1) {
    if (projectiles.length >= MAX_SHOTS) {
      break;
    }

    const spread =
      count === 1
        ? (Math.random() - 0.5) * 2 * weapon.spread
        : ((i / (count - 1)) * 2 - 1) * weapon.spread;
    const angle = baseAngle + (spread * Math.PI) / 180;
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);
    const shot = getWeaponProjectile(player.weaponId);

    if (shot.style === 'beam') {
      projectiles.push({
        x: origin.x,
        y: origin.y,
        vx: dirX,
        vy: dirY,
        projectileId: weapon.projectileId,
        life: 0.14,
        maxLife: 0.14,
        length: Math.max(weapon.range, 1600),
      });
      continue;
    }

    projectiles.push({
      x: origin.x,
      y: origin.y,
      vx: dirX * weapon.projectileSpeed,
      vy: dirY * weapon.projectileSpeed,
      projectileId: weapon.projectileId,
    });
  }

  player.ammoInMag -= 1;
  combat.fireCooldown = 1 / weapon.fireRate;
  player.recoil = getWeaponProjectile(player.weaponId).style === 'beam' ? 0 : 1;
  player.muzzleFlash = 1;
}
