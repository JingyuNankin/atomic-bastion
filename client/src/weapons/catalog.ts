import catalog from '../../../docs/design/weapons.json';

export type WeaponId = string;

export type WeaponDef = {
  id: WeaponId;
  name: string;
  nameEn: string;
  role: string;
  fireRate: number;
  magazineSize: number;
  damage: number;
  reloadTime: number;
  projectileSpeed: number;
  knockback: number;
  spread: number;
  penetration: number;
  projectileCount: number;
};

export type WeaponCatalog = {
  version: number;
  defaultWeaponId: WeaponId;
  weapons: WeaponDef[];
};

const weaponsById = new Map(
  (catalog.weapons as WeaponDef[]).map((weapon) => [weapon.id, weapon]),
);

export const DEFAULT_WEAPON_ID = catalog.defaultWeaponId;

export function listWeapons(): WeaponDef[] {
  return catalog.weapons as WeaponDef[];
}

export function getWeapon(id: WeaponId): WeaponDef {
  const weapon = weaponsById.get(id);

  if (!weapon) {
    throw new Error(`Unknown weapon: ${id}`);
  }

  return weapon;
}
