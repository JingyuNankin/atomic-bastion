import { createPlayWorld, drawMenuBackdrop } from '../scenes/play';
import { mountMenu } from '../scenes/menu';
import { loadGameArt } from '../systems/game-art';
import { createInput } from '../systems/input';

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

  const world = createPlayWorld();
  const input = createInput();

  void loadGameArt()
    .then((art) => {
      world.setArt(art);
    })
    .catch((error: unknown) => {
      console.error(error);
    });

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.className = 'play-back';
  backButton.textContent = '返回菜单';
  backButton.hidden = true;
  root.append(backButton);

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
    backButton.hidden = next !== 'play';

    if (next === 'play') {
      const { width, height } = viewSize();
      world.enter(width, height);
    }
  }

  backButton.addEventListener('click', () => {
    setScene('menu');
  });

  const onResize = () => {
    syncCanvasSize(canvas);

    if (scene === 'play') {
      const { width, height } = viewSize();
      world.update(0, { x: 0, y: 0 }, width, height);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (scene !== 'play') {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setScene('menu');
      return;
    }

    if (event.code === 'Digit1') {
      event.preventDefault();
      world.equip('w01-pistol');
    }

    if (event.code === 'Digit2') {
      event.preventDefault();
      world.equip('w02-smg');
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
      world.update(dt, input.axis(), width, height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      world.draw(context, width, height, time);
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    window.requestAnimationFrame(frame);
  };

  setScene('menu');
  window.requestAnimationFrame(frame);
}

function syncCanvasSize(canvas: HTMLCanvasElement): void {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(window.innerWidth * ratio));
  canvas.height = Math.max(1, Math.floor(window.innerHeight * ratio));
}
