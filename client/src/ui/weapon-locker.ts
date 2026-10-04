import {
  assignLoadoutSlot,
  clearLoadoutSlot,
  loadoutIndexOf,
  type Loadout,
} from '../game/loadout';
import {
  getWeapon,
  listDesignedWeapons,
  type WeaponId,
} from '../weapons/catalog';
import { rateWeapon } from '../weapons/ratings';
import './weapon-locker.css';

type LockerHandlers = {
  onChange: (slots: Loadout) => void;
};

export type WeaponLocker = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  assignSelected: (index: number) => void;
  setIcons: (icons: Record<WeaponId, HTMLCanvasElement | undefined>) => void;
  setLoadout: (slots: Loadout) => void;
};

export function mountWeaponLocker(
  root: HTMLElement,
  handlers: LockerHandlers,
): WeaponLocker {
  const overlay = document.createElement('div');
  overlay.className = 'locker';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="locker__backdrop"></div>
    <div class="locker__panel" role="dialog" aria-modal="true" aria-labelledby="locker-title">
      <div class="locker__top">
        <div>
          <p class="locker__brand">ATOMIC BASTION</p>
          <h2 class="locker__title" id="locker-title">武器柜</h2>
        </div>
        <button type="button" class="locker__close">
          <svg class="locker__close-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6"/>
          </svg>
          关闭
        </button>
      </div>
      <p class="locker__hint">先在左侧点选武器查看，再点右侧卡槽放入。同一把枪只占一格；数字键 1–4 对应战场快捷键。</p>
      <div class="locker__main">
        <section class="locker__col locker__col--arsenal">
          <h3 class="locker__col-title">编制</h3>
          <div class="locker__arsenal"></div>
        </section>
        <section class="locker__col locker__col--detail">
          <h3 class="locker__col-title">详情</h3>
          <div class="locker__detail"></div>
        </section>
        <section class="locker__col locker__col--slots">
          <h3 class="locker__col-title">常用卡槽</h3>
          <div class="locker__slots"></div>
        </section>
      </div>
    </div>
  `;

  const backdrop = overlay.querySelector('.locker__backdrop');
  const closeButton = overlay.querySelector('.locker__close');
  const slotsEl = overlay.querySelector('.locker__slots');
  const arsenalEl = overlay.querySelector('.locker__arsenal');
  const detailEl = overlay.querySelector('.locker__detail');

  if (
    !(backdrop instanceof HTMLElement) ||
    !(closeButton instanceof HTMLButtonElement) ||
    !(slotsEl instanceof HTMLElement) ||
    !(arsenalEl instanceof HTMLElement) ||
    !(detailEl instanceof HTMLElement)
  ) {
    throw new Error('Missing weapon locker');
  }

  let open = false;
  let slots: Loadout = [null, null, null, null];
  let selectedId: WeaponId = listDesignedWeapons()[0]?.id ?? '';
  let icons: Record<WeaponId, HTMLCanvasElement | undefined> = {};

  const close = () => {
    open = false;
    overlay.hidden = true;
  };

  const render = () => {
    renderSlots(slotsEl, slots, selectedId, icons, {
      onPick(index) {
        if (!selectedId) {
          return;
        }

        commit(assignLoadoutSlot(slots, index, selectedId));
      },
      onClear(index) {
        if (slots.filter(Boolean).length <= 1) {
          return;
        }

        commit(clearLoadoutSlot(slots, index));
      },
    });
    renderArsenal(arsenalEl, slots, selectedId, icons, (weaponId) => {
      selectedId = weaponId;
      render();
    });
    renderDetail(detailEl, slots, selectedId, icons);
  };

  const commit = (next: Loadout) => {
    slots = next;
    handlers.onChange(slots);
    render();
  };

  backdrop.addEventListener('click', close);
  closeButton.addEventListener('click', close);
  overlay.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (target instanceof Element) {
      target.closest('button')?.blur();
    }
  });

  root.append(overlay);
  render();

  return {
    open() {
      open = true;
      overlay.hidden = false;
      render();
    },
    close,
    isOpen() {
      return open;
    },
    assignSelected(index) {
      if (!selectedId) {
        return;
      }

      commit(assignLoadoutSlot(slots, index, selectedId));
    },
    setIcons(next) {
      icons = next;
      if (open) {
        render();
      }
    },
    setLoadout(next) {
      slots = next;
      if (open) {
        render();
      }
    },
  };
}

function renderSlots(
  root: HTMLElement,
  slots: Loadout,
  selectedId: WeaponId,
  icons: Record<WeaponId, HTMLCanvasElement | undefined>,
  handlers: {
    onPick: (index: number) => void;
    onClear: (index: number) => void;
  },
): void {
  root.replaceChildren();

  slots.forEach((weaponId, index) => {
    const row = document.createElement('div');
    row.className = weaponId ? 'locker__slot is-filled' : 'locker__slot is-empty';
    if (weaponId === selectedId) {
      row.classList.add('is-active');
    }

    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'locker__slot-pick';

    const badge = document.createElement('span');
    badge.className = 'locker__slot-index';
    badge.textContent = String(index + 1);
    pick.append(badge);

    if (weaponId) {
      const weapon = getWeapon(weaponId);
      const body = document.createElement('div');
      body.className = 'locker__slot-body';
      const name = document.createElement('p');
      name.className = 'locker__slot-name';
      name.textContent = weapon.name;
      const model = document.createElement('p');
      model.className = 'locker__slot-model';
      model.textContent = weapon.model;
      body.append(name, model);
      pick.append(iconNode(icons[weaponId]), body);
    } else {
      const hint = document.createElement('p');
      hint.className = 'locker__slot-hint';
      hint.textContent = '放入所选';
      pick.append(hint);
    }
    pick.addEventListener('click', () => {
      handlers.onPick(index);
    });
    row.append(pick);

    if (weaponId && slots.filter(Boolean).length > 1) {
      const clear = document.createElement('button');
      clear.type = 'button';
      clear.className = 'locker__clear';
      clear.textContent = '卸下';
      clear.addEventListener('click', () => {
        handlers.onClear(index);
      });
      row.append(clear);
    }

    root.append(row);
  });
}

function renderArsenal(
  root: HTMLElement,
  slots: Loadout,
  selectedId: WeaponId,
  icons: Record<WeaponId, HTMLCanvasElement | undefined>,
  onSelect: (weaponId: WeaponId) => void,
): void {
  root.replaceChildren();

  for (const weapon of listDesignedWeapons()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'locker__card';
    if (weapon.id === selectedId) {
      button.classList.add('is-selected');
    }

    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'locker__card-name';
    name.textContent = weapon.name;
    const model = document.createElement('p');
    model.className = 'locker__card-model';
    model.textContent = weapon.model;
    body.append(name, model);

    button.append(iconNode(icons[weapon.id]), body);

    const slotIndex = loadoutIndexOf(slots, weapon.id);
    if (slotIndex >= 0) {
      const badge = document.createElement('span');
      badge.className = 'locker__card-badge';
      badge.textContent = String(slotIndex + 1);
      button.append(badge);
    }

    button.addEventListener('click', () => {
      onSelect(weapon.id);
    });

    root.append(button);
  }
}

function renderDetail(
  root: HTMLElement,
  slots: Loadout,
  selectedId: WeaponId,
  icons: Record<WeaponId, HTMLCanvasElement | undefined>,
): void {
  root.replaceChildren();

  if (!selectedId) {
    return;
  }

  const weapon = getWeapon(selectedId);
  const ratings = rateWeapon(weapon);
  const equippedAt = loadoutIndexOf(slots, selectedId);

  const head = document.createElement('div');
  head.className = 'locker__detail-head';

  const copy = document.createElement('div');
  const model = document.createElement('p');
  model.className = 'locker__detail-model';
  model.textContent = weapon.model;
  const name = document.createElement('h3');
  name.className = 'locker__detail-name';
  name.textContent = weapon.name;
  const role = document.createElement('p');
  role.className = 'locker__detail-role';
  role.textContent = weapon.role;
  copy.append(model, name, role);

  const detailIcon = iconNode(icons[weapon.id], 'locker__icon locker__detail-icon');
  head.append(detailIcon, copy);

  const blurb = document.createElement('p');
  blurb.className = 'locker__blurb';
  blurb.textContent = weapon.blurb;

  const stats = document.createElement('div');
  stats.className = 'locker__stats';
  for (const [label, value] of [
    ['射速', ratings.fireRate],
    ['威力', ratings.power],
    ['射程', ratings.range],
    ['装填', ratings.reload],
    ['射击', ratings.fireMode],
    ['特性', ratings.trait],
  ] as const) {
    const item = document.createElement('div');
    item.className = 'locker__stat';
    const caption = document.createElement('span');
    caption.className = 'locker__stat-label';
    caption.textContent = label;
    const figure = document.createElement('span');
    figure.className = 'locker__stat-value';
    figure.textContent = value;
    item.append(caption, figure);
    stats.append(item);
  }

  const note = document.createElement('p');
  note.className = 'locker__place-hint';
  note.textContent =
    equippedAt >= 0
      ? `已在卡槽 ${equippedAt + 1}。点右侧其他槽可挪过去。`
      : '点右侧卡槽放入。';

  root.append(head, blurb, stats, note);
}

function iconNode(
  source: HTMLCanvasElement | undefined,
  className = 'locker__icon',
): HTMLElement {
  if (!source) {
    const placeholder = document.createElement('span');
    placeholder.className = className;
    return placeholder;
  }

  const copy = document.createElement('canvas');
  copy.className = className;
  copy.width = source.width;
  copy.height = source.height;
  copy.getContext('2d')?.drawImage(source, 0, 0);
  return copy;
}
