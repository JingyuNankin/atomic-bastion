import { GAME_MODES } from '../game/modes';
import '../ui/menu.css';

type MenuHandlers = {
  onStart: () => void;
};

type MenuView = {
  setVisible: (visible: boolean) => void;
};

export function mountMenu(root: HTMLElement, handlers: MenuHandlers): MenuView {
  const overlay = document.createElement('div');
  overlay.className = 'menu';
  overlay.innerHTML = `
    <div class="menu__panel">
      <p class="menu__brand">ATOMIC BASTION</p>
      <h1 class="menu__title">原子堡垒</h1>
      <button type="button" class="menu__start">开始游戏</button>
      <p class="menu__start-hint">当前开放：生存模式</p>
      <ul class="menu__modes"></ul>
    </div>
  `;

  const list = overlay.querySelector('.menu__modes');
  if (!(list instanceof HTMLElement)) {
    throw new Error('Missing menu mode list');
  }

  for (const mode of GAME_MODES) {
    const item = document.createElement('li');
    item.className = mode.available ? 'menu__mode is-open' : 'menu__mode is-locked';

    const row = document.createElement('div');
    row.className = 'menu__mode-row';

    const name = document.createElement('span');
    name.className = 'menu__mode-name';
    name.textContent = mode.name;

    const tag = document.createElement('span');
    tag.className = 'menu__mode-tag';
    tag.textContent = mode.available ? '可进入' : '未开放';

    const summary = document.createElement('p');
    summary.className = 'menu__mode-summary';
    summary.textContent = mode.summary;

    row.append(name, tag);
    item.append(row, summary);
    list.append(item);
  }

  const startButton = overlay.querySelector('.menu__start');
  if (!(startButton instanceof HTMLButtonElement)) {
    throw new Error('Missing start button');
  }

  startButton.addEventListener('click', () => {
    handlers.onStart();
  });

  root.append(overlay);

  return {
    setVisible(visible: boolean) {
      overlay.hidden = !visible;
    },
  };
}
