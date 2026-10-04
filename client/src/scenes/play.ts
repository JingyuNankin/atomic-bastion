import {
  createPlayer,
  drawPlayer,
  equipWeapon,
  updatePlayer,
  type Arena,
  type Player,
} from '../entities/player';
import {
  drawProjectiles,
  updateProjectiles,
  type Projectile,
} from '../entities/projectile';
import type { Axis } from '../game/direction';
import {
  createCombat,
  resetCombat,
  updateCombat,
} from '../systems/combat';
import { createLoadout, firstLoadoutWeapon, type Loadout } from '../game/loadout';
import { getWeaponArt, type GameArt } from '../systems/game-art';
import { drawWeaponHud, weaponSlots } from '../ui/hud';
import { getWeapon, listDesignedWeapons, type WeaponId } from '../weapons/catalog';

const BACKGROUND = '#0b0f14';
const ARENA_FILL = '#121820';
const ARENA_INSET = 48;

export type PlayWorld = {
  setArt: (art: GameArt) => void;
  setLoadout: (slots: Loadout) => void;
  enter: (width: number, height: number) => void;
  equip: (weaponId: WeaponId) => void;
  update: (
    dt: number,
    axis: Axis,
    firing: boolean,
    width: number,
    height: number,
  ) => void;
  draw: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ) => void;
};

export function createPlayWorld(): PlayWorld {
  let art: GameArt | null = null;
  let loadout: Loadout = createLoadout();
  const player: Player = createPlayer(0, 0);
  const projectiles: Projectile[] = [];
  const combat = createCombat();

  const arenaOf = (width: number, height: number): Arena => ({
    left: ARENA_INSET,
    top: ARENA_INSET,
    right: Math.max(ARENA_INSET, width - ARENA_INSET),
    bottom: Math.max(ARENA_INSET, height - ARENA_INSET),
  });

  return {
    setArt(next) {
      art = next;
    },
    setLoadout(slots) {
      loadout = slots;
      if (!slots.includes(player.weaponId)) {
        equipWeapon(player, firstLoadoutWeapon(slots));
        resetCombat(combat);
      }
    },
    enter(width, height) {
      player.x = width / 2;
      player.y = height / 2;
      player.facing = 's';
      player.hp = player.maxHp;
      equipWeapon(player, firstLoadoutWeapon(loadout));
      projectiles.length = 0;
      resetCombat(combat);
      updatePlayer(player, 0, { x: 0, y: 0 }, arenaOf(width, height));
    },
    equip(weaponId) {
      getWeapon(weaponId);
      equipWeapon(player, weaponId);
      resetCombat(combat);
    },
    update(dt, axis, firing, width, height) {
      const arena = arenaOf(width, height);
      updatePlayer(player, dt, axis, arena);
      updateCombat(combat, player, projectiles, dt, firing);
      updateProjectiles(projectiles, dt, arena);
    },
    draw(context, width, height, time) {
      context.fillStyle = BACKGROUND;
      context.fillRect(0, 0, width, height);

      const arena = arenaOf(width, height);
      const pulse = 0.04 + Math.sin(time / 800) * 0.02;

      context.fillStyle = ARENA_FILL;
      context.fillRect(
        arena.left,
        arena.top,
        arena.right - arena.left,
        arena.bottom - arena.top,
      );
      drawGrid(context, arena);
      context.fillStyle = `rgba(80, 140, 180, ${pulse})`;
      context.fillRect(
        arena.left,
        arena.top,
        arena.right - arena.left,
        arena.bottom - arena.top,
      );

      context.strokeStyle = 'rgba(126, 200, 255, 0.35)';
      context.lineWidth = 2;
      context.strokeRect(
        arena.left + 1,
        arena.top + 1,
        arena.right - arena.left - 2,
        arena.bottom - arena.top - 2,
      );

      drawPlayer(context, player, art);
      drawProjectiles(context, projectiles, art);
      const equipped = getWeapon(player.weaponId);
      drawWeaponHud(
        context,
        width,
        height,
        player.weaponId,
        weaponSlots(
          loadout,
          Object.fromEntries(
            listDesignedWeapons().map((weapon) => [
              weapon.id,
              getWeaponArt(art, weapon.id)?.icon,
            ]),
          ),
        ),
        {
          hp: player.hp,
          maxHp: player.maxHp,
          ammoInMag: player.ammoInMag,
          magazineSize: equipped.magazineSize,
          ammoIcon: art?.projectiles[equipped.projectileId] ?? null,
          reloading: combat.reloadTimer > 0,
        },
      );
    },
  };
}

export function drawMenuBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  const pulse = 0.06 + Math.sin(time / 900) * 0.03;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);
  context.fillStyle = `rgba(120, 200, 255, ${pulse})`;
  context.fillRect(0, 0, width, height);
}

function drawGrid(
  context: CanvasRenderingContext2D,
  arena: Arena,
): void {
  const step = 48;
  context.beginPath();
  context.strokeStyle = 'rgba(120, 160, 190, 0.12)';
  context.lineWidth = 1;

  for (let x = arena.left; x <= arena.right; x += step) {
    context.moveTo(Math.floor(x) + 0.5, arena.top);
    context.lineTo(Math.floor(x) + 0.5, arena.bottom);
  }

  for (let y = arena.top; y <= arena.bottom; y += step) {
    context.moveTo(arena.left, Math.floor(y) + 0.5);
    context.lineTo(arena.right, Math.floor(y) + 0.5);
  }

  context.stroke();
}
