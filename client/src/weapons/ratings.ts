import type { WeaponDef } from './catalog';

export type Tier = '高' | '中' | '低';
export type Tempo = '快' | '中' | '慢';
export type Reach = '远' | '中' | '近';

export type WeaponRatings = {
  fireRate: Tempo;
  power: Tier;
  range: Reach;
  reload: Tempo;
  fireMode: '点射' | '连发';
  trait: string;
};

export function rateWeapon(weapon: WeaponDef): WeaponRatings {
  const burst = weapon.damage * weapon.projectileCount;

  return {
    fireRate: weapon.fireRate >= 8 ? '快' : weapon.fireRate >= 4 ? '中' : '慢',
    power: burst >= 40 ? '高' : burst >= 11 ? '中' : '低',
    range: weapon.range >= 560 ? '远' : weapon.range >= 360 ? '中' : '近',
    reload: weapon.reloadTime <= 1.4 ? '快' : weapon.reloadTime <= 1.9 ? '中' : '慢',
    fireMode: weapon.fireMode === 'auto' ? '连发' : '点射',
    trait: weaponTrait(weapon),
  };
}

function weaponTrait(weapon: WeaponDef): string {
  if (weapon.id === 'w08-flamethrower') {
    return '灼烧';
  }

  if (weapon.blastRadius >= 60) {
    return '爆炸';
  }

  if (weapon.projectileCount > 1) {
    return '散射';
  }

  if (weapon.penetration > 0) {
    return '穿透';
  }

  return '单体';
}
