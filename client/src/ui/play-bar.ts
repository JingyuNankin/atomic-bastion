import './play-bar.css';

const STARTING_CREDITS = 0;

type PlayBarHandlers = {
  onBack: () => void;
  onWeapons: () => void;
};

export type PlayBar = {
  setVisible: (visible: boolean) => void;
};

export function mountPlayBar(
  root: HTMLElement,
  handlers: PlayBarHandlers,
): PlayBar {
  const overlay = document.createElement('div');
  overlay.className = 'play-bar';
  overlay.hidden = true;
  overlay.innerHTML = `
    <button type="button" class="play-bar__btn play-bar__back">
      ${icon('back')}
      返回菜单
    </button>
    <div class="play-bar__right">
      <button type="button" class="play-bar__btn">
        ${icon('shop')}
        商店
      </button>
      <button type="button" class="play-bar__btn play-bar__weapons">
        ${icon('weapons')}
        武器
      </button>
      <div class="play-bar__credits" aria-label="货币">
        ${icon('credits', 'play-bar__icon play-bar__credits-icon')}
        <span>${STARTING_CREDITS}</span>
      </div>
    </div>
  `;

  const backButton = overlay.querySelector('.play-bar__back');
  if (!(backButton instanceof HTMLButtonElement)) {
    throw new Error('Missing play back button');
  }

  const weaponsButton = overlay.querySelector('.play-bar__weapons');
  if (!(weaponsButton instanceof HTMLButtonElement)) {
    throw new Error('Missing play weapons button');
  }

  backButton.addEventListener('click', () => {
    handlers.onBack();
  });

  weaponsButton.addEventListener('click', () => {
    handlers.onWeapons();
  });

  overlay.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (target instanceof Element) {
      target.closest('button')?.blur();
    }
  });

  root.append(overlay);

  return {
    setVisible(visible) {
      overlay.hidden = !visible;
    },
  };
}

function icon(name: 'back' | 'shop' | 'weapons' | 'credits', className = 'play-bar__icon'): string {
  return `<svg class="${className}" viewBox="0 0 16 16" aria-hidden="true">${paths[name]}</svg>`;
}

const paths = {
  back: '<path d="M10.2 2.8 4.8 8l5.4 5.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter"/>',
  shop: '<path d="M3.2 6.2 4 13.2h8L12.8 6.2zM5.4 6.2V5.1a2.6 2.6 0 0 1 5.2 0v1.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/><path d="M3 6.2h10" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  weapons:
    '<path d="M2.4 9.2h7.1l1.6-2.4H14v3.4H3.2zM5.8 10.2v2.2M8.6 10.2v1.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/>',
  credits:
    '<circle cx="8" cy="8" r="5.3" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
};
