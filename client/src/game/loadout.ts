import { WEAPON_SLOT_COUNT } from '../ui/hud';
import { DEFAULT_WEAPON_ID, type WeaponId } from '../weapons/catalog';

export type Loadout = Array<WeaponId | null>;

export function createLoadout(): Loadout {
  return [DEFAULT_WEAPON_ID, 'w02-smg', null, null];
}

export function assignLoadoutSlot(
  slots: Loadout,
  index: number,
  weaponId: WeaponId,
): Loadout {
  if (index < 0 || index >= WEAPON_SLOT_COUNT) {
    return slots;
  }

  return slots.map((slot, slotIndex) => {
    if (slotIndex === index) {
      return weaponId;
    }

    if (slot === weaponId) {
      return null;
    }

    return slot;
  });
}

export function clearLoadoutSlot(slots: Loadout, index: number): Loadout {
  return slots.map((slot, slotIndex) => (slotIndex === index ? null : slot));
}

export function firstLoadoutWeapon(slots: Loadout): WeaponId {
  return slots.find((slot): slot is WeaponId => slot !== null) ?? DEFAULT_WEAPON_ID;
}

export function loadoutIndexOf(slots: Loadout, weaponId: WeaponId): number {
  return slots.indexOf(weaponId);
}
