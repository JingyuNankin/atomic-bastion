import { createEnemy, drawEnemy, updateEnemies, type Enemy } from '../entities/enemy';
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
  DENIED_FIRE_TIME,
  resetCombat,
  updateCombat,
} from '../systems/combat';
import { resolveProjectileHits } from '../systems/hits';
import { createLoadout, firstLoadoutWeapon, type Loadout } from '../game/loadout';
import { getWeaponArt, type GameArt } from '../systems/game-art';
import { drawWeaponHud, weaponHudLayout, weaponSlots } from '../ui/hud';
import { THEME } from '../ui/theme';
import { getWeapon, listDesignedWeapons, type WeaponId } from '../weapons/catalog';

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
  const enemies: Enemy[] = [];
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
      enemies.length = 0;
      resetCombat(combat);
      const arena = arenaOf(width, height);
      updatePlayer(player, 0, { x: 0, y: 0 }, arena);
      enemies.push(
        createEnemy(
          'e01-hyena',
          player.x,
          Math.max(arena.top + 120, player.y - 320),
        ),
        createEnemy(
          'e02-drone',
          Math.min(arena.right - 90, player.x + 260),
          Math.max(arena.top + 120, player.y - 140),
        ),
      );
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
      updateEnemies(enemies, player, dt, arena);
      resolveProjectileHits(projectiles, enemies, dt);
    },
    draw(context, width, height, _time) {
      context.fillStyle = THEME.soot;
      context.fillRect(0, 0, width, height);

      const arena = arenaOf(width, height);

      context.fillStyle = THEME.concreteFloor;
      context.fillRect(
        arena.left,
        arena.top,
        arena.right - arena.left,
        arena.bottom - arena.top,
      );
      drawConcreteStains(context, arena);
      drawJoints(context, arena);
      drawArenaEdge(context, arena, width, height);

      const drawOrder = [
        {
          y: player.y,
          paint: () => {
            drawPlayer(context, player, art);
          },
        },
        ...enemies.map((enemy) => ({
          y: enemy.y,
          paint: () => {
            drawEnemy(context, enemy, art?.enemies[enemy.kind] ?? null);
          },
        })),
      ];
      drawOrder.sort((a, b) => a.y - b.y);

      for (const item of drawOrder) {
        item.paint();
      }

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
          reloadProgress:
            combat.reloadDuration <= 0
              ? 0
              : 1 - combat.reloadTimer / combat.reloadDuration,
          deniedFire:
            combat.deniedFireTimer <= 0
              ? 0
              : combat.deniedFireTimer / DENIED_FIRE_TIME,
        },
      );
    },
  };
}

export function drawMenuBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  _time?: number,
): void {
  context.fillStyle = THEME.soot;
  context.fillRect(0, 0, width, height);
  context.fillStyle = THEME.concreteDark;
  context.fillRect(48, 48, Math.max(0, width - 96), Math.max(0, height - 96));
}

function drawJoints(
  context: CanvasRenderingContext2D,
  arena: Arena,
): void {
  const step = 48;
  context.beginPath();
  context.strokeStyle = THEME.joint;
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

function drawConcreteStains(
  context: CanvasRenderingContext2D,
  arena: Arena,
): void {
  const width = arena.right - arena.left;
  const height = arena.bottom - arena.top;
  const stains = [
    [0.16, 0.2, 96, 42],
    [0.58, 0.46, 128, 56],
    [0.32, 0.7, 72, 34],
    [0.76, 0.16, 54, 54],
  ] as const;

  context.fillStyle = THEME.stain;
  for (const [nx, ny, stainWidth, stainHeight] of stains) {
    context.fillRect(
      arena.left + width * nx,
      arena.top + height * ny,
      stainWidth,
      stainHeight,
    );
  }
}

function drawArenaEdge(
  context: CanvasRenderingContext2D,
  arena: Arena,
  width: number,
  height: number,
): void {
  const lip = 4;
  const left = arena.left;
  const top = arena.top;
  const right = arena.right;
  const bottom = arena.bottom;
  const spanW = right - left;
  const spanH = bottom - top;
  const slots = weaponHudLayout(width, height);
  const pad = 16;
  const bandTop = Math.max(top + lip, slots.y - pad);
  const bandBottom = Math.min(bottom - lip, slots.y + slots.height + pad);

  context.save();
  context.globalAlpha = 0.72;
  context.fillStyle = THEME.soot;
  context.fillRect(left, top, spanW, lip);
  context.fillRect(left, bottom - lip, spanW, lip);
  context.fillRect(left, top + lip, lip, Math.max(0, spanH - lip * 2));

  if (bandTop > top + lip) {
    context.fillRect(right - lip, top + lip, lip, bandTop - (top + lip));
  }

  if (bandBottom < bottom - lip) {
    context.fillRect(right - lip, bandBottom, lip, bottom - lip - bandBottom);
  }

  context.restore();
}
