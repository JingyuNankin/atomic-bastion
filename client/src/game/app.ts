import { createLoadout } from './loadout';
import { createPlayWorld, drawMenuBackdrop } from '../scenes/play';
import { mountMenu } from '../scenes/menu';
import { loadGameArt } from '../systems/game-art';
import { createInput } from '../systems/input';
import { WEAPON_SLOT_COUNT } from '../ui/hud';
import { mountPlayBar } from '../ui/play-bar';
import { mountWeaponLocker } from '../ui/weapon-locker';
import { listDesignedWeapons } from '../weapons/catalog';

type SceneId = 'menu' | 'play';

export function startGame(root: HTMLElement): void {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  root.append(canvas);
  syncCanvasSize(canvas);

  let scene: SceneId = 'menu';
  let lastTime = 0;
  let loadout = createLoadout();

  const world = createPlayWorld();
  const input = createInput();

  const locker = mountWeaponLocker(root, {
    onChange(slots) {
      loadout = slots;
      world.setLoadout(slots);
    },
  });
  locker.setLoadout(loadout);
  world.setLoadout(loadout);

  void loadGameArt()
    .then((art) => {
      world.setArt(art);
      locker.setIcons(
        Object.fromEntries(
          listDesignedWeapons().map((weapon) => [weapon.id, art.weapons[weapon.id]?.icon]),
        ),
      );
    })
    .catch((error: unknown) => {
      console.error(error);
    });

  const playBar = mountPlayBar(root, {
    onBack() {
      locker.close();
      setScene('menu');
    },
    onWeapons() {
      if (locker.isOpen()) {
        locker.close();
        return;
      }

      locker.open();
    },
  });

  const menu = mountMenu(root, {
    onStart() {
      setScene('play');
    },
  });

  function viewSize(): { width: number; height: number; dpr: number } {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const dpr = canvas.width / width;

    return { width, height, dpr };
  }

  function setScene(next: SceneId): void {
    scene = next;
    menu.setVisible(next === 'menu');
    playBar.setVisible(next === 'play');

    if (next !== 'play') {
      locker.close();
    }

    if (next === 'play') {
      const { width, height } = viewSize();
      world.enter(width, height);
    }
  }

  const onResize = () => {
    syncCanvasSize(canvas);

    if (scene === 'play') {
      const { width, height } = viewSize();
      world.update(0, { x: 0, y: 0 }, false, width, height);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (scene !== 'play') {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      if (locker.isOpen()) {
        locker.close();
        return;
      }

      setScene('menu');
      return;
    }

    const slotIndex = slotIndexFromCode(event.code);
    if (slotIndex === null) {
      return;
    }

    event.preventDefault();

    if (locker.isOpen()) {
      locker.assignSelected(slotIndex);
      return;
    }

    const weaponId = loadout[slotIndex];
    if (weaponId) {
      world.equip(weaponId);
    }
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);

  const frame = (time: number) => {
    const dt = lastTime === 0 ? 0 : Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    const { width, height, dpr } = viewSize();

    if (scene === 'menu') {
      drawMenuBackdrop(context, canvas.width, canvas.height, time);
    } else {
      const paused = locker.isOpen();
      world.update(
        paused ? 0 : dt,
        paused ? { x: 0, y: 0 } : input.axis(),
        paused ? false : input.firing(),
        width,
        height,
      );
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      world.draw(context, width, height, time);
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    window.requestAnimationFrame(frame);
  };

  setScene('menu');
  window.requestAnimationFrame(frame);
}

function slotIndexFromCode(code: string): number | null {
  const match = /^Digit([1-4])$/.exec(code);
  if (!match) {
    return null;
  }

  const index = Number(match[1]) - 1;
  return index >= 0 && index < WEAPON_SLOT_COUNT ? index : null;
}

function syncCanvasSize(canvas: HTMLCanvasElement): void {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(window.innerWidth * ratio));
  canvas.height = Math.max(1, Math.floor(window.innerHeight * ratio));
}
