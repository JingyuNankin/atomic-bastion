import './pause.css';

type PauseHandlers = {
  onResume: () => void;
  onMenu: () => void;
  onCodex: () => void;
};

export type PauseMenu = {
  setOpen: (open: boolean) => void;
  isOpen: () => boolean;
};

export function mountPauseMenu(
  root: HTMLElement,
  handlers: PauseHandlers,
): PauseMenu {
  const overlay = document.createElement('div');
  overlay.className = 'pause';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="pause__backdrop"></div>
    <div class="pause__panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
      <p class="pause__brand">ОТР-3 · 第三特别处置处</p>
      <h2 class="pause__title" id="pause-title">任务暂停</h2>
      <p class="pause__hint">存档尚未接通。可继续执行，或撤回菜单。</p>
      <div class="pause__actions">
        <button type="button" class="pause__btn pause__btn--primary pause__resume">
          继续任务
          <kbd class="pause__key">Esc</kbd>
        </button>
        <button type="button" class="pause__btn pause__codex">失控机械图鉴</button>
        <button type="button" class="pause__btn pause__menu">返回菜单</button>
        <button type="button" class="pause__btn pause__save" disabled>
          保存存档
          <span class="pause__tag">未开放</span>
        </button>
      </div>
    </div>
  `;

  const resume = overlay.querySelector('.pause__resume');
  const codex = overlay.querySelector('.pause__codex');
  const menu = overlay.querySelector('.pause__menu');
  const backdrop = overlay.querySelector('.pause__backdrop');

  if (
    !(resume instanceof HTMLButtonElement) ||
    !(codex instanceof HTMLButtonElement) ||
    !(menu instanceof HTMLButtonElement) ||
    !(backdrop instanceof HTMLElement)
  ) {
    throw new Error('Missing pause menu');
  }

  let open = false;

  resume.addEventListener('click', () => {
    handlers.onResume();
  });
  codex.addEventListener('click', () => {
    handlers.onCodex();
  });
  menu.addEventListener('click', () => {
    handlers.onMenu();
  });
  backdrop.addEventListener('click', () => {
    handlers.onResume();
  });

  overlay.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (target instanceof Element) {
      target.closest('button')?.blur();
    }
  });

  root.append(overlay);

  return {
    setOpen(next) {
      open = next;
      overlay.hidden = !next;
    },
    isOpen() {
      return open;
    },
  };
}
