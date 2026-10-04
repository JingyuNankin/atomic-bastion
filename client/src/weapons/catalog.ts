import catalog from '../../../docs/design/weapons.json';

export type WeaponId = string;
export type ProjectileId = string;
export type FireMode = 'semi' | 'auto';
export type ProjectileStyle =
  | 'slug'
  | 'pellet'
  | 'beam'
  | 'rocket'
  | 'grenade'
  | 'flame';

export type ProjectileDef = {
  id: ProjectileId;
  name: string;
  style: ProjectileStyle;
  tint: string;
  drawWidth: number;
  drawHeight: number;
};

export type WeaponDef = {
  id: WeaponId;
  name: string;
  nameEn: string;
  role: string;
  model: string;
  blurb: string;
  enabled: boolean;
  fireMode: FireMode;
  projectileId: ProjectileId;
  fireRate: number;
  magazineSize: number;
  damage: number;
  reloadTime: number;
  projectileSpeed: number;
  knockback: number;
  spread: number;
  penetration: number;
  projectileCount: number;
  range: number;
  blastRadius: number;
  fuseTime: number;
};

export type WeaponCatalog = {
  version: number;
  defaultWeaponId: WeaponId;
  projectiles: ProjectileDef[];
  weapons: WeaponDef[];
};

const weaponsById = new Map(
  (catalog.weapons as WeaponDef[]).map((weapon) => [weapon.id, weapon]),
);

const projectilesById = new Map(
  (catalog.projectiles as ProjectileDef[]).map((projectile) => [
    projectile.id,
    projectile,
  ]),
);

export const DEFAULT_WEAPON_ID = catalog.defaultWeaponId;

export function listWeapons(): WeaponDef[] {
  return (catalog.weapons as WeaponDef[]).filter((weapon) => weapon.enabled);
}

export function listDesignedWeapons(): WeaponDef[] {
  return catalog.weapons as WeaponDef[];
}

export function listProjectiles(): ProjectileDef[] {
  return catalog.projectiles as ProjectileDef[];
}

export function getWeapon(id: WeaponId): WeaponDef {
  const weapon = weaponsById.get(id);

  if (!weapon) {
    throw new Error(`Unknown weapon: ${id}`);
  }

  return weapon;
}

export function getProjectile(id: ProjectileId): ProjectileDef {
  const projectile = projectilesById.get(id);

  if (!projectile) {
    throw new Error(`Unknown projectile: ${id}`);
  }

  return projectile;
}

export function getWeaponProjectile(weaponId: WeaponId): ProjectileDef {
  return getProjectile(getWeapon(weaponId).projectileId);
}
