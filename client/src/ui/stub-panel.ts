import './stub-panel.css';

type StubPanel = {
  open: (title: string, hint: string) => void;
  close: () => void;
  isOpen: () => boolean;
};

export function mountStubPanel(root: HTMLElement): StubPanel {
  const overlay = document.createElement('div');
  overlay.className = 'stub';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="stub__backdrop"></div>
    <div class="stub__panel" role="dialog" aria-modal="true" aria-labelledby="stub-title">
      <p class="stub__brand">ОТР-3 · 第三特别处置处</p>
      <h2 class="stub__title" id="stub-title"></h2>
      <p class="stub__hint"></p>
      <button type="button" class="stub__close">关闭</button>
    </div>
  `;

  const titleEl = overlay.querySelector('.stub__title');
  const hintEl = overlay.querySelector('.stub__hint');
  const closeButton = overlay.querySelector('.stub__close');
  const backdrop = overlay.querySelector('.stub__backdrop');

  if (
    !(titleEl instanceof HTMLElement) ||
    !(hintEl instanceof HTMLElement) ||
    !(closeButton instanceof HTMLButtonElement) ||
    !(backdrop instanceof HTMLElement)
  ) {
    throw new Error('Missing stub panel');
  }

  let open = false;

  const close = () => {
    open = false;
    overlay.hidden = true;
  };

  closeButton.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  overlay.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (target instanceof Element) {
      target.closest('button')?.blur();
    }
  });

  root.append(overlay);

  return {
    open(title, hint) {
      titleEl.textContent = title;
      hintEl.textContent = hint;
      open = true;
      overlay.hidden = false;
    },
    close,
    isOpen() {
      return open;
    },
  };
}
