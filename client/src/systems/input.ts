import type { Axis } from '../game/direction';

const MOVE_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
const FIRE_CODE = 'Space';

export type Input = {
  axis: () => Axis;
  firing: () => boolean;
  destroy: () => void;
};

export function createInput(): Input {
  const held = new Set<string>();

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.code !== FIRE_CODE && !MOVE_CODES.has(event.code)) {
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
    firing() {
      return held.has(FIRE_CODE);
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
