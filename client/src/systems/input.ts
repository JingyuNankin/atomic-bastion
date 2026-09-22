import type { Axis } from '../game/direction';

const MOVE_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);

export type Input = {
  axis: () => Axis;
  destroy: () => void;
};

export function createInput(): Input {
  const held = new Set<string>();

  const onKeyDown = (event: KeyboardEvent) => {
    if (!MOVE_CODES.has(event.code)) {
      return;
    }

    event.preventDefault();
    held.add(event.code);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    held.delete(event.code);
  };

  const onBlur = () => {
    held.clear();
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);

  return {
    axis() {
      let x = 0;
      let y = 0;

      if (held.has('KeyA')) {
        x -= 1;
      }

      if (held.has('KeyD')) {
        x += 1;
      }

      if (held.has('KeyW')) {
        y -= 1;
      }

      if (held.has('KeyS')) {
        y += 1;
      }

      return { x, y };
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
