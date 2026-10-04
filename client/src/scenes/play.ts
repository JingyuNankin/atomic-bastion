import {
  createPlayer,
  drawPlayer,
  equipWeapon,
  updatePlayer,
  type Arena,
  type Player,
} from '../entities/player';
import type { Axis } from '../game/direction';
import { getWeaponArt, type GameArt } from '../systems/game-art';
import { drawWeaponHud } from '../ui/hud';
import { DEFAULT_WEAPON_ID, getWeapon, type WeaponId } from '../weapons/catalog';

const BACKGROUND = '#0b0f14';
const ARENA_FILL = '#121820';
const ARENA_INSET = 48;

export type PlayWorld = {
  setArt: (art: GameArt) => void;
  enter: (width: number, height: number) => void;
  equip: (weaponId: WeaponId) => void;
  update: (dt: number, axis: Axis, width: number, height: number) => void;
  draw: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
  ) => void;
};

export function createPlayWorld(): PlayWorld {
  let art: GameArt | null = null;
  const player: Player = createPlayer(0, 0);

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
    enter(width, height) {
      player.x = width / 2;
      player.y = height / 2;
      player.facing = 's';
      equipWeapon(player, DEFAULT_WEAPON_ID);
      updatePlayer(player, 0, { x: 0, y: 0 }, arenaOf(width, height));
    },
    equip(weaponId) {
      getWeapon(weaponId);
      equipWeapon(player, weaponId);
    },
    update(dt, axis, width, height) {
      updatePlayer(player, dt, axis, arenaOf(width, height));
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
      drawWeaponHud(
        context,
        height,
        player.weaponId,
        player.ammoInMag,
        getWeaponArt(art, player.weaponId)?.icon ?? null,
      );

      context.textAlign = 'right';
      context.textBaseline = 'top';
      context.fillStyle = '#8aa4b8';
      context.font = '13px ui-sans-serif, system-ui, sans-serif';
      context.fillText('生存模式 · WASD 移动 · 1/2 切枪', width - 16, 16);
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
