import { createEnemy, drawEnemy, updateEnemies, type Enemy } from '../entities/enemy';
import {
  createPlayer,
  drawPlayer,
  equipWeapon,
  PLAYER_DISPLAY_HEIGHT,
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
import { ARENA, cameraFor, MAP_HEIGHT, MAP_WIDTH } from '../game/map';
import { px } from '../game/units';
import {
  createCombat,
  DENIED_FIRE_TIME,
  resetCombat,
  updateCombat,
} from '../systems/combat';
import { resolveProjectileHits } from '../systems/hits';
import { createLoadout, firstLoadoutWeapon, type Loadout } from '../game/loadout';
import type { OperativeId } from '../operatives/catalog';
import { getWeaponArt, type GameArt } from '../systems/game-art';
import { drawWeaponHud, weaponHudLayout, weaponSlots } from '../ui/hud';
import { THEME } from '../ui/theme';
import { getWeapon, listDesignedWeapons, type WeaponId } from '../weapons/catalog';

export type PlayWorld = {
  setArt: (art: GameArt) => void;
  setOperative: (operativeId: OperativeId) => void;
  setLoadout: (slots: Loadout) => void;
  enter: () => void;
  equip: (weaponId: WeaponId) => void;
  update: (dt: number, axis: Axis, firing: boolean) => void;
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

  return {
    setArt(next) {
      art = next;
    },
    setOperative(operativeId) {
      player.operativeId = operativeId;
    },
    setLoadout(slots) {
      loadout = slots;
      if (!slots.includes(player.weaponId)) {
        equipWeapon(player, firstLoadoutWeapon(slots));
        resetCombat(combat);
      }
    },
    enter() {
      player.x = px(MAP_WIDTH) / 2;
      player.y = px(MAP_HEIGHT) / 2;
      player.facing = 's';
      player.hp = player.maxHp;
      equipWeapon(player, firstLoadoutWeapon(loadout));
      projectiles.length = 0;
      enemies.length = 0;
      resetCombat(combat);
      updatePlayer(player, 0, { x: 0, y: 0 }, ARENA);
      enemies.push(
        createEnemy('e01-hyena', px(MAP_WIDTH) / 2, ARENA.top - px(3)),
        createEnemy('e02-drone', ARENA.right + px(4), px(MAP_HEIGHT) * 0.35),
      );
    },
    equip(weaponId) {
      getWeapon(weaponId);
      equipWeapon(player, weaponId);
      resetCombat(combat);
    },
    update(dt, axis, firing) {
      updatePlayer(player, dt, axis, ARENA);
      updateCombat(combat, player, projectiles, dt, firing);
      updateProjectiles(projectiles, dt, ARENA);
      updateEnemies(enemies, player, dt, ARENA);
      resolveProjectileHits(projectiles, enemies, dt);
    },
    draw(context, width, height, _time) {
      context.fillStyle = THEME.soot;
      context.fillRect(0, 0, width, height);

      const camera = cameraFor(
        width,
        height,
        player.x,
        player.y - PLAYER_DISPLAY_HEIGHT * 0.4,
      );

      context.save();
      context.translate(-camera.x, -camera.y);
      context.fillStyle = THEME.concreteFloor;
      context.fillRect(
        ARENA.left,
        ARENA.top,
        ARENA.right - ARENA.left,
        ARENA.bottom - ARENA.top,
      );
      drawConcreteStains(context, ARENA);
      drawJoints(context, ARENA);
      drawArenaEdge(context, ARENA, camera, width, height);

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
      context.restore();
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
  const mapW = ARENA.right - ARENA.left;
  const mapH = ARENA.bottom - ARENA.top;
  context.fillStyle = THEME.concreteDark;
  context.fillRect((width - mapW) / 2, (height - mapH) / 2, mapW, mapH);
}

function drawJoints(
  context: CanvasRenderingContext2D,
  arena: Arena,
): void {
  const step = px(3);
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
    [0.16, 0.2, px(6), px(2.625)],
    [0.58, 0.46, px(8), px(3.5)],
    [0.32, 0.7, px(4.5), px(2.125)],
    [0.76, 0.16, px(3.375), px(3.375)],
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
  camera: { x: number; y: number },
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
  const edgeScreenX = right - camera.x;
  const overlapsHud =
    edgeScreenX >= slots.x - pad && edgeScreenX <= width;
  const bandTop = slots.y + camera.y - pad;
  const bandBottom = slots.y + slots.height + camera.y + pad;

  context.save();
  context.globalAlpha = 0.72;
  context.fillStyle = THEME.soot;
  context.fillRect(left, top, spanW, lip);
  context.fillRect(left, bottom - lip, spanW, lip);
  context.fillRect(left, top + lip, lip, Math.max(0, spanH - lip * 2));

  if (!overlapsHud) {
    context.fillRect(right - lip, top + lip, lip, Math.max(0, spanH - lip * 2));
  } else {
    const gapTop = Math.max(top + lip, bandTop);
    const gapBottom = Math.min(bottom - lip, bandBottom);

    if (gapTop > top + lip) {
      context.fillRect(right - lip, top + lip, lip, gapTop - (top + lip));
    }

    if (gapBottom < bottom - lip) {
      context.fillRect(right - lip, gapBottom, lip, bottom - lip - gapBottom);
    }
  }

  context.restore();
}
