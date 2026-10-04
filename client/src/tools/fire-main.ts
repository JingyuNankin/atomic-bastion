import { createPlayWorld } from '../scenes/play';
import { loadGameArt } from '../systems/game-art';

const canvas = document.querySelector('#view');
const status = document.querySelector('#status');

if (!(canvas instanceof HTMLCanvasElement) || !(status instanceof HTMLElement)) {
  throw new Error('Missing fire preview');
}

const view = canvas;
const maybeContext = view.getContext('2d');

if (!maybeContext) {
  throw new Error('Canvas 2D context is not available');
}

const context: CanvasRenderingContext2D = maybeContext;

const world = createPlayWorld();
let last = 0;
let weapon: 'w01-pistol' | 'w02-smg' = 'w01-pistol';
let elapsed = 0;

void loadGameArt()
  .then((art) => {
    world.setArt(art);
    world.enter(view.width, view.height);
    status.textContent = '空格射击预览 · 左半手枪 · 右半冲锋枪';
    window.requestAnimationFrame(frame);
  })
  .catch((error: unknown) => {
    status.textContent = error instanceof Error ? error.message : String(error);
  });

function frame(time: number): void {
  const dt = last === 0 ? 0 : Math.min(0.05, (time - last) / 1000);
  last = time;
  elapsed += dt;

  const next = elapsed % 3 < 1.5 ? 'w01-pistol' : 'w02-smg';

  if (next !== weapon) {
    weapon = next;
    world.equip(weapon);
  }

  const firing = weapon === 'w02-smg' || elapsed % 0.5 < 0.08;
  world.update(dt, { x: 1, y: 0 }, firing, view.width, view.height);
  world.draw(context, view.width, view.height, time);
  window.requestAnimationFrame(frame);
}
