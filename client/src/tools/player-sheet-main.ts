import { getEnemy } from '../enemies/catalog';
import {
  bakeBoxSheet,
  bakeFittedSprite,
  bakePlayerSheet,
  PLAYER_CELL,
  playerSheetToPng,
  sheetCell,
} from '../render/bake-player-sheet';
import { HYENA_CELL, HYENA_ORTHO, hyenaBoxes } from '../render/hyena-model';
import {
  createPlayer,
  drawPlayer,
  equipWeapon,
  updatePlayer,
} from '../entities/player';
import {
  drawProjectiles,
  updateProjectiles,
  type Projectile,
} from '../entities/projectile';
import { projectileBoxes } from '../render/projectile-model';
import { recoiledWeaponBoxes, weaponBoxes } from '../render/weapon-model';
import { DIRECTIONS } from '../game/direction';
import { createCombat, updateCombat } from '../systems/combat';
import { loadGameArt } from '../systems/game-art';
import { listDesignedWeapons, listProjectiles } from '../weapons/catalog';

const status = document.querySelector('#status');
const gallery = document.querySelector('#gallery');

if (!(status instanceof HTMLElement) || !(gallery instanceof HTMLElement)) {
  throw new Error('Missing sheet preview');
}

try {
  const player = bakePlayerSheet();
  const composites: HTMLCanvasElement[] = [];
  const hyena = getEnemy('e01-hyena');

  mountSheet(gallery, '角色空手', player, 'p01-soldier.png');
  mountSheet(
    gallery,
    `${hyena.name} · ${hyena.code}`,
    bakeBoxSheet(hyenaBoxes(), HYENA_CELL, HYENA_ORTHO),
    'e01-hyena.png',
  );

  for (const weapon of listDesignedWeapons()) {
    const overlay = bakeBoxSheet(weaponBoxes(weapon.id));
    const fireOverlay = bakeBoxSheet(recoiledWeaponBoxes(weapon.id));
    const icon = bakeFittedSprite(weaponBoxes(weapon.id), 64);
    const composite = compositeSheet(player, overlay);

    composites.push(composite);
    mountSheet(gallery, `${weapon.name} 图层`, overlay, `${weapon.id}.png`);
    mountSheet(gallery, `${weapon.name} 射击`, fireOverlay, `${weapon.id}-fire.png`);
    mountSheet(gallery, `${weapon.name} 合成`, composite, `${weapon.id}-held.png`);
    mountSprite(gallery, `${weapon.name} 图标`, icon);
  }

  for (const projectile of listProjectiles()) {
    mountSprite(
      gallery,
      `${projectile.name} · ${projectile.id}`,
      bakeFittedSprite(projectileBoxes(projectile), 48, Math.PI / 2),
    );
  }

  status.textContent = `${PLAYER_CELL.width}×${PLAYER_CELL.height} 格 · ${composites.length} 把武器 · ${listProjectiles().length} 种弹体`;
  void startFlightPreview();
} catch (error) {
  status.textContent = error instanceof Error ? error.message : String(error);
}

function compositeSheet(
  player: HTMLCanvasElement,
  overlay: HTMLCanvasElement,
): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  sheet.width = player.width;
  sheet.height = player.height;
  const context = sheet.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  context.imageSmoothingEnabled = false;

  for (const direction of DIRECTIONS) {
    const cell = sheetCell(direction);
    const behind = direction === 'n' || direction === 'nw' || direction === 'ne';

    if (behind) {
      context.drawImage(
        overlay,
        cell.sx,
        cell.sy,
        cell.sw,
        cell.sh,
        cell.sx,
        cell.sy,
        cell.sw,
        cell.sh,
      );
    }

    context.drawImage(
      player,
      cell.sx,
      cell.sy,
      cell.sw,
      cell.sh,
      cell.sx,
      cell.sy,
      cell.sw,
      cell.sh,
    );

    if (!behind) {
      context.drawImage(
        overlay,
        cell.sx,
        cell.sy,
        cell.sw,
        cell.sh,
        cell.sx,
        cell.sy,
        cell.sw,
        cell.sh,
      );
    }
  }

  return sheet;
}

function mountSheet(
  root: HTMLElement,
  title: string,
  sheet: HTMLCanvasElement,
  filename: string,
): void {
  const figure = document.createElement('figure');
  const heading = document.createElement('figcaption');
  heading.textContent = title;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  canvas.width = sheet.width;
  canvas.height = sheet.height;
  canvas.className = 'sheet';
  context.imageSmoothingEnabled = false;
  context.drawImage(sheet, 0, 0);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '下载 PNG';
  button.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = playerSheetToPng(sheet);
    link.download = filename;
    link.click();
  });

  figure.append(heading, canvas, button);
  root.append(figure);
}

function mountSprite(
  root: HTMLElement,
  title: string,
  sprite: HTMLCanvasElement,
): void {
  const figure = document.createElement('figure');
  const heading = document.createElement('figcaption');
  heading.textContent = title;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  canvas.width = sprite.width;
  canvas.height = sprite.height;
  canvas.className = 'sprite';
  context.imageSmoothingEnabled = false;
  context.drawImage(sprite, 0, 0);

  figure.append(heading, canvas);
  root.append(figure);
}

async function startFlightPreview(): Promise<void> {
  const canvas = document.querySelector('#flight');

  if (!(canvas instanceof HTMLCanvasElement)) {
    return;
  }

  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const art = await loadGameArt();
  const arena = { left: 0, top: 0, right: canvas.width, bottom: canvas.height };
  const pistol = createPlayer(90, 80);
  const smg = createPlayer(90, 190);
  const pistolShots: Projectile[] = [];
  const smgShots: Projectile[] = [];
  const pistolCombat = createCombat();
  const smgCombat = createCombat();

  pistol.facing = 'e';
  smg.facing = 'e';
  equipWeapon(pistol, 'w01-pistol');
  equipWeapon(smg, 'w02-smg');
  updatePlayer(pistol, 0, { x: 0, y: 0 }, arena);
  updatePlayer(smg, 0, { x: 0, y: 0 }, arena);

  let last = 0;
  let pulse = 0;

  const frame = (time: number) => {
    const dt = last === 0 ? 0 : Math.min(0.05, (time - last) / 1000);
    last = time;
    pulse += dt;

    updateCombat(pistolCombat, pistol, pistolShots, dt, pulse % 0.55 < 0.08);
    updateCombat(smgCombat, smg, smgShots, dt, true);
    updateProjectiles(pistolShots, dt, arena);
    updateProjectiles(smgShots, dt, arena);

    context.fillStyle = '#2a3038';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawPlayer(context, pistol, art);
    drawPlayer(context, smg, art);
    drawProjectiles(context, pistolShots, art);
    drawProjectiles(context, smgShots, art);

    window.requestAnimationFrame(frame);
  };

  window.requestAnimationFrame(frame);
}
