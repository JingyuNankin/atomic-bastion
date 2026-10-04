import {
  bakeBoxSheet,
  bakeFittedSprite,
  bakePlayerSheet,
  PLAYER_CELL,
  playerSheetToPng,
  sheetCell,
} from '../render/bake-player-sheet';
import { projectileBoxes, weaponBoxes } from '../render/weapon-model';
import { DIRECTIONS } from '../game/direction';
import { listWeapons } from '../weapons/catalog';

const status = document.querySelector('#status');
const gallery = document.querySelector('#gallery');

if (!(status instanceof HTMLElement) || !(gallery instanceof HTMLElement)) {
  throw new Error('Missing sheet preview');
}

try {
  const player = bakePlayerSheet();
  const composites: HTMLCanvasElement[] = [];

  mountSheet(gallery, '角色空手', player, 'p01-soldier.png');

  for (const weapon of listWeapons()) {
    const overlay = bakeBoxSheet(weaponBoxes(weapon.id));
    const icon = bakeFittedSprite(weaponBoxes(weapon.id), 64);
    const projectile = bakeFittedSprite(projectileBoxes(weapon.id), 32);
    const composite = compositeSheet(player, overlay);

    composites.push(composite);
    mountSheet(gallery, `${weapon.name} 图层`, overlay, `${weapon.id}.png`);
    mountSheet(gallery, `${weapon.name} 合成`, composite, `${weapon.id}-held.png`);
    mountSprite(gallery, `${weapon.name} 图标`, icon);
    mountSprite(gallery, `${weapon.name} 弹体`, projectile);
  }

  status.textContent = `${PLAYER_CELL.width}×${PLAYER_CELL.height} 格 · ${composites.length} 把武器`;
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
