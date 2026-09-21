import { drawMenuBackdrop, drawPlayScene } from '../scenes/play';
import { mountMenu } from '../scenes/menu';

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

  function setScene(next: SceneId): void {
    scene = next;
    menu.setVisible(next === 'menu');
    backButton.hidden = next !== 'play';
  }

  backButton.addEventListener('click', () => {
    setScene('menu');
  });

  const onResize = () => {
    syncCanvasSize(canvas);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && scene === 'play') {
      event.preventDefault();
      setScene('menu');
    }
  };

  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);

  const frame = (time: number) => {
    if (scene === 'menu') {
      drawMenuBackdrop(context, canvas.width, canvas.height, time);
    } else {
      drawPlayScene(context, canvas.width, canvas.height, time);
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
