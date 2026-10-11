import type { OperativeId } from '../operatives/catalog';
import { createLoadout } from './loadout';
import { createPlayWorld, drawMenuBackdrop } from '../scenes/play';
import { mountMenu } from '../scenes/menu';
import { loadGameArt } from '../systems/game-art';
import { createInput } from '../systems/input';
import { WEAPON_SLOT_COUNT } from '../ui/hud';
import { mountPauseMenu } from '../ui/pause';
import { mountPlayBar } from '../ui/play-bar';
import { mountStubPanel } from '../ui/stub-panel';
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

  const pauseMenu = mountPauseMenu(root, {
    onResume() {
      setPaused(false);
    },
    onMenu() {
      setPaused(false);
      locker.close();
      setScene('menu');
    },
  });

  const stub = mountStubPanel(root);
  let stubKind: 'supply' | 'orders' | null = null;

  const playBar = mountPlayBar(root, {
    onPause() {
      setPaused(!pauseMenu.isOpen());
    },
    onSupply() {
      toggleStub(
        'supply',
        '补给舱',
        '补给线路尚未接通。燃料、弹药与零件补给暂不可用。',
      );
    },
    onWeapons() {
      if (pauseMenu.isOpen()) {
        return;
      }

      closeStub();

      if (locker.isOpen()) {
        locker.close();
        return;
      }

      locker.open();
    },
    onOrders() {
      toggleStub(
        'orders',
        '任务单',
        '任务单尚未下发。当前仅开放生存模式渗透。',
      );
    },
  });

  const menu = mountMenu(root, {
    onStart(operativeId: OperativeId) {
      world.setOperative(operativeId);
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
      closeStub();
      setPaused(false);
    }

    if (next === 'play') {
      world.enter();
    }
  }

  const onResize = () => {
    syncCanvasSize(canvas);
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

      if (stub.isOpen()) {
        closeStub();
        return;
      }

      setPaused(!pauseMenu.isOpen());
      return;
    }

    if (pauseMenu.isOpen()) {
      return;
    }

    if (event.code === 'KeyJ') {
      event.preventDefault();
      toggleStub(
        'supply',
        '补给舱',
        '补给线路尚未接通。燃料、弹药与零件补给暂不可用。',
      );
      return;
    }

    if (event.code === 'KeyK') {
      event.preventDefault();
      closeStub();
      if (locker.isOpen()) {
        locker.close();
      } else {
        locker.open();
      }
      return;
    }

    if (event.code === 'KeyL') {
      event.preventDefault();
      toggleStub(
        'orders',
        '任务单',
        '任务单尚未下发。当前仅开放生存模式渗透。',
      );
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
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawMenuBackdrop(context, width, height, time);
      context.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      const paused = locker.isOpen() || pauseMenu.isOpen() || stub.isOpen();
      world.update(
        paused ? 0 : dt,
        paused ? { x: 0, y: 0 } : input.axis(),
        paused ? false : input.firing(),
      );
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      world.draw(context, width, height, time);
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    window.requestAnimationFrame(frame);
  };

  function closeStub(): void {
    stub.close();
    stubKind = null;
  }

  function toggleStub(
    kind: 'supply' | 'orders',
    title: string,
    hint: string,
  ): void {
    if (pauseMenu.isOpen()) {
      return;
    }

    locker.close();

    if (stub.isOpen() && stubKind === kind) {
      closeStub();
      return;
    }

    stubKind = kind;
    stub.open(title, hint);
  }

  function setPaused(next: boolean): void {
    if (next) {
      locker.close();
      closeStub();
    }

    pauseMenu.setOpen(next && scene === 'play');
  }

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
