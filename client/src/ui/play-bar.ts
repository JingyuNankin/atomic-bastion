import './play-bar.css';

const STARTING_CREDITS = 0;

type PlayBarHandlers = {
  onPause: () => void;
  onSupply: () => void;
  onWeapons: () => void;
  onOrders: () => void;
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
    <button type="button" class="play-bar__btn play-bar__pause" aria-keyshortcuts="Escape">
      ${icon('pause')}
      暂停
      <kbd class="play-bar__key">Esc</kbd>
    </button>
    <div class="play-bar__right">
      <button type="button" class="play-bar__btn play-bar__supply" aria-keyshortcuts="j">
        ${icon('shop')}
        补给舱
        <kbd class="play-bar__key">J</kbd>
      </button>
      <button type="button" class="play-bar__btn play-bar__weapons" aria-keyshortcuts="k">
        ${icon('weapons')}
        武器柜
        <kbd class="play-bar__key">K</kbd>
      </button>
      <button type="button" class="play-bar__btn play-bar__orders" aria-keyshortcuts="l">
        ${icon('orders')}
        任务单
        <kbd class="play-bar__key">L</kbd>
      </button>
      <div class="play-bar__credits" aria-label="货币">
        ${icon('credits', 'play-bar__icon play-bar__credits-icon')}
        <span>${STARTING_CREDITS}</span>
      </div>
    </div>
  `;

  const pauseButton = overlay.querySelector('.play-bar__pause');
  const supplyButton = overlay.querySelector('.play-bar__supply');
  const weaponsButton = overlay.querySelector('.play-bar__weapons');
  const ordersButton = overlay.querySelector('.play-bar__orders');

  if (
    !(pauseButton instanceof HTMLButtonElement) ||
    !(supplyButton instanceof HTMLButtonElement) ||
    !(weaponsButton instanceof HTMLButtonElement) ||
    !(ordersButton instanceof HTMLButtonElement)
  ) {
    throw new Error('Missing play bar button');
  }

  pauseButton.addEventListener('click', () => {
    handlers.onPause();
  });
  supplyButton.addEventListener('click', () => {
    handlers.onSupply();
  });
  weaponsButton.addEventListener('click', () => {
    handlers.onWeapons();
  });
  ordersButton.addEventListener('click', () => {
    handlers.onOrders();
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

function icon(
  name: 'pause' | 'shop' | 'weapons' | 'orders' | 'credits',
  className = 'play-bar__icon',
): string {
  return `<svg class="${className}" viewBox="0 0 16 16" aria-hidden="true">${paths[name]}</svg>`;
}

const paths = {
  pause:
    '<path d="M5 3.2h2.2v9.6H5zM8.8 3.2H11v9.6H8.8z" fill="currentColor"/>',
  shop: '<path d="M3.2 6.2 4 13.2h8L12.8 6.2zM5.4 6.2V5.1a2.6 2.6 0 0 1 5.2 0v1.1" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/><path d="M3 6.2h10" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  weapons:
    '<path d="M2.4 9.2h7.1l1.6-2.4H14v3.4H3.2zM5.8 10.2v2.2M8.6 10.2v1.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/>',
  orders:
    '<path d="M4 2.6h8v10.8H4z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M6 5.4h4M6 8h4M6 10.6h2.6" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  credits:
    '<circle cx="8" cy="8" r="5.3" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.1" fill="none" stroke="currentColor" stroke-width="1.3"/>',
};
