import {
  GAME_MODES,
  type GameMode,
  type GameModeId,
} from '../game/modes';
import {
  getDefaultOperative,
  getOperative,
  listOperatives,
  type OperativeDef,
  type OperativeId,
} from '../operatives/catalog';
import { bakeBoxSheet, bakeDirection, PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';
import { operativeBoxes } from '../render/operative-model';
import { renderOperativeDossier, renderReservedDossier } from '../ui/operative-dossier';
import '../ui/menu.css';
import { sealMarkup, starMarkup } from '../ui/seal';

type MenuHandlers = {
  onStart: (operativeId: OperativeId) => void;
};

type MenuView = {
  setVisible: (visible: boolean) => void;
};

type OrderCopy = {
  number: string;
  subject: string;
  lead: string;
  body: string;
};

type ReservedSlotId = 'custom' | 'community';

type ReservedSlot = {
  id: ReservedSlotId;
  title: string;
  detail: string;
};

type PickerDraft =
  | { kind: 'operative'; id: OperativeId }
  | { kind: 'reserved'; id: ReservedSlotId };

const RECIPIENT = '{name} · 「{code}」';

const ORDERS: Record<GameModeId, OrderCopy> = {
  survival: {
    number: '72-014',
    subject: '关于第 72 号堡垒失联之处置命令',
    lead: '第 72 号自动反应堆研究堡垒（代号「铁脉」）通讯中断。自动化单元已脱离控制。',
    body: `
      <ol class="menu__clauses">
        <li>由{role}「{code}」进入隔离区，查明事故原因。</li>
        <li>立即切断「铁脉核心」控制系统，回收实验记录。</li>
        <li>自动化单元均按敌对目标处置。仅在妨碍任务时予以摧毁。</li>
        <li>行动及回收资料列为绝密，不得对外披露。</li>
      </ol>
    `,
  },
  defense: {
    number: '72-031',
    subject: '关于核心主机舱警戒之补充命令',
    lead: '核心主机舱须保持封锁，研究记录优先保全。',
    body: `
      <ol class="menu__clauses">
        <li>本项行动尚未下达。</li>
        <li>未经另行命令，「{code}」不得进入核心主机舱。</li>
      </ol>
    `,
  },
  collect: {
    number: '72-048',
    subject: '关于回收实验记录之补充命令',
    lead: '铁脉研究档案须完整移交监察局。',
    body: `
      <ol class="menu__clauses">
        <li>本项行动尚未下达。</li>
        <li>档案回收须待隔离区解除封锁后，由「{code}」执行。</li>
      </ol>
    `,
  },
};

const RESERVED_SLOTS: ReservedSlot[] = [
  {
    id: 'custom',
    title: '自定义',
    detail: '自定皮肤、名字与职业',
  },
  {
    id: 'community',
    title: '社区',
    detail: '使用社区皮肤',
  },
];

export function mountMenu(root: HTMLElement, handlers: MenuHandlers): MenuView {
  const overlay = document.createElement('div');
  overlay.className = 'menu';
  overlay.innerHTML = `
    <aside class="menu__rail">
      <p class="menu__game-en">${starMarkup('star')}ATOMIC BASTION</p>
      <p class="menu__game">原子堡垒</p>
      <p class="menu__rail-kicker">封存设施 · 禁止外传</p>
      <p class="menu__game-sub">BUNKER-72 · 铁脉</p>
      <button type="button" class="menu__portrait" aria-haspopup="dialog" aria-controls="operative-picker">
        <canvas class="menu__portrait-canvas" aria-hidden="true"></canvas>
        <span class="menu__portrait-label">更换执行员</span>
      </button>
      <div class="menu__personnel">
        <p class="menu__personnel-label">执行员档案 / 72—А</p>
        <p class="menu__personnel-name"></p>
        <p class="menu__personnel-role"></p>
        <button type="button" class="menu__personnel-change">更换指派</button>
      </div>
      <nav class="menu__modes" aria-label="任务模式"></nav>
    </aside>
    <article class="menu__panel">
      <header class="menu__letterhead">
        <p class="menu__org-ru">ОТР-3</p>
        <p class="menu__org">全联盟辐射技术监察局</p>
        <p class="menu__org-sub">第三特别处置处</p>
      </header>
      <div class="menu__filehead">
        <span class="menu__classif">绝密</span>
        <span class="menu__order-no"></span>
      </div>
      <h1 class="menu__subject"></h1>
      <dl class="menu__meta">
        <div>
          <dt>收件人</dt>
          <dd class="menu__recipient"></dd>
        </div>
        <div>
          <dt>任务地点</dt>
          <dd>第 72 号堡垒 · 铁脉</dd>
        </div>
      </dl>
      <p class="menu__section-label">情况</p>
      <p class="menu__lead"></p>
      <p class="menu__section-label menu__section-label--orders">命令</p>
      <div class="menu__body"></div>
      <footer class="menu__signoff">
        <p class="menu__rank">第三特别处置处处长</p>
        <p class="menu__sign">Н. Соколов</p>
        <p class="menu__date">莫斯科 · 19██ 年 █ 月 █ 日</p>
      </footer>
      <div class="menu__action-row">
        <button type="button" class="menu__start"></button>
        <span class="menu__action-hint">命令签发后执行</span>
      </div>
      <div class="menu__seal">${sealMarkup('seal', {
        id: 'menu-seal-arc',
        legend: 'ОТР-3 · 绝密 · 铁脉 · BUNKER-72 ·',
      })}</div>
    </article>
    <div class="menu__picker" id="operative-picker" hidden>
      <div class="menu__picker-backdrop"></div>
      <div class="menu__picker-panel" role="dialog" aria-modal="true" aria-labelledby="operative-picker-title">
        <div class="menu__picker-top">
          <div>
            <p class="menu__picker-kicker">ОТР-3 · 人员指派</p>
            <h2 class="menu__picker-title" id="operative-picker-title">执行员名册</h2>
          </div>
          <button type="button" class="menu__picker-cancel">收回</button>
        </div>
        <p class="menu__picker-hint">左侧点选人员。自定义与社区栏位留空，尚未开放。</p>
        <div class="menu__picker-main">
          <section class="menu__picker-col">
            <h3 class="menu__picker-col-title">名册</h3>
            <div class="menu__picker-list"></div>
          </section>
          <section class="menu__picker-col">
            <h3 class="menu__picker-col-title">档案</h3>
            <div class="menu__dossier"></div>
          </section>
        </div>
        <div class="menu__picker-actions">
          <button type="button" class="menu__picker-confirm">按此指派</button>
        </div>
      </div>
    </div>
  `;

  const modesNav = overlay.querySelector('.menu__modes');
  const portraitButton = overlay.querySelector('.menu__portrait');
  const portrait = overlay.querySelector('.menu__portrait-canvas');
  const personnelName = overlay.querySelector('.menu__personnel-name');
  const personnelRole = overlay.querySelector('.menu__personnel-role');
  const personnelChange = overlay.querySelector('.menu__personnel-change');
  const orderNo = overlay.querySelector('.menu__order-no');
  const subject = overlay.querySelector('.menu__subject');
  const recipient = overlay.querySelector('.menu__recipient');
  const lead = overlay.querySelector('.menu__lead');
  const body = overlay.querySelector('.menu__body');
  const startButton = overlay.querySelector('.menu__start');
  const picker = overlay.querySelector('.menu__picker');
  const pickerList = overlay.querySelector('.menu__picker-list');
  const pickerBackdrop = overlay.querySelector('.menu__picker-backdrop');
  const pickerConfirm = overlay.querySelector('.menu__picker-confirm');
  const pickerCancel = overlay.querySelector('.menu__picker-cancel');
  const dossier = overlay.querySelector('.menu__dossier');

  if (
    !(modesNav instanceof HTMLElement) ||
    !(portraitButton instanceof HTMLButtonElement) ||
    !(portrait instanceof HTMLCanvasElement) ||
    !(personnelName instanceof HTMLElement) ||
    !(personnelRole instanceof HTMLElement) ||
    !(personnelChange instanceof HTMLButtonElement) ||
    !(orderNo instanceof HTMLElement) ||
    !(subject instanceof HTMLElement) ||
    !(recipient instanceof HTMLElement) ||
    !(lead instanceof HTMLElement) ||
    !(body instanceof HTMLElement) ||
    !(startButton instanceof HTMLButtonElement) ||
    !(picker instanceof HTMLElement) ||
    !(pickerList instanceof HTMLElement) ||
    !(pickerBackdrop instanceof HTMLElement) ||
    !(pickerConfirm instanceof HTMLButtonElement) ||
    !(pickerCancel instanceof HTMLButtonElement) ||
    !(dossier instanceof HTMLElement)
  ) {
    throw new Error('Missing menu order sheet');
  }

  const sheets = new Map<OperativeId, HTMLCanvasElement>();
  const portraits = new Map<OperativeId, HTMLCanvasElement>();

  try {
    for (const operative of listOperatives()) {
      const boxes = operativeBoxes(operative.model);
      sheets.set(operative.id, bakeBoxSheet(boxes));
      portraits.set(operative.id, bakeDirection(boxes, 'sw'));
    }
  } catch (error) {
    console.warn('Could not render operative portraits.', error);
  }

  const pickButtons = new Map<string, HTMLButtonElement>();

  for (const operative of listOperatives()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu__pick';

    const thumb = document.createElement('canvas');
    thumb.className = 'menu__pick-canvas';
    thumb.setAttribute('aria-hidden', 'true');
    const sheet = sheets.get(operative.id);
    if (sheet) {
      paintSouth(thumb, sheet);
    }

    const copy = document.createElement('span');
    copy.className = 'menu__pick-copy';
    const title = document.createElement('span');
    title.className = 'menu__pick-title';
    title.textContent = operative.name;
    const chip = document.createElement('span');
    chip.className = 'menu__pick-chip';
    chip.textContent = operative.role;
    copy.append(title, chip);

    button.append(thumb, copy);
    button.addEventListener('click', () => {
      draft = { kind: 'operative', id: operative.id };
      showDraft();
    });
    pickButtons.set(operative.id, button);
    pickerList.append(button);
  }

  for (const slot of RESERVED_SLOTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'menu__pick is-reserved';

    const mark = document.createElement('span');
    mark.className = 'menu__pick-mark';
    mark.textContent = '留空';

    const copy = document.createElement('span');
    copy.className = 'menu__pick-copy';
    const title = document.createElement('span');
    title.className = 'menu__pick-title';
    title.textContent = slot.title;
    const chip = document.createElement('span');
    chip.className = 'menu__pick-chip';
    chip.textContent = '未开放';
    copy.append(title, chip);

    button.append(mark, copy);
    button.addEventListener('click', () => {
      draft = { kind: 'reserved', id: slot.id };
      showDraft();
    });
    pickButtons.set(slot.id, button);
    pickerList.append(button);
  }

  let selectedId: GameModeId =
    GAME_MODES.find((mode) => mode.available)?.id ?? GAME_MODES[0].id;
  let operativeId = getDefaultOperative().id;
  let draft: PickerDraft = { kind: 'operative', id: operativeId };
  let pickerOpen = false;

  const renderModes = () => {
    modesNav.replaceChildren();

    for (const mode of GAME_MODES) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu__mode';
      if (mode.id === selectedId) {
        button.classList.add('is-selected');
      }
      if (!mode.available) {
        button.classList.add('is-locked');
      }

      const name = document.createElement('span');
      name.className = 'menu__mode-name';
      name.textContent = mode.name;

      const tag = document.createElement('span');
      tag.className = 'menu__mode-tag';
      tag.textContent = mode.available ? '可执行' : '未下达';

      button.append(name, tag);
      button.addEventListener('click', () => {
        selectedId = mode.id;
        render();
      });
      modesNav.append(button);
    }
  };

  const renderPersonnel = (operative: OperativeDef) => {
    personnelName.replaceChildren();
    personnelName.append(document.createTextNode(`${operative.code} `));
    const en = document.createElement('span');
    en.textContent = operative.codeEn.toUpperCase();
    personnelName.append(en);
    personnelRole.textContent = operative.role;
    portraitButton.setAttribute(
      'aria-label',
      `更换执行员，当前为${operative.code}`,
    );

    const sheet = sheets.get(operative.id);
    if (sheet) {
      paintSouth(portrait, sheet);
    }
  };

  const renderOrder = (mode: GameMode, operative: OperativeDef) => {
    const order = ORDERS[mode.id];
    orderNo.textContent = `处置令 № ${order.number}`;
    subject.textContent = fillOrder(order.subject, operative);
    recipient.textContent = fillOrder(RECIPIENT, operative);
    lead.textContent = fillOrder(order.lead, operative);
    body.innerHTML = fillOrder(order.body, operative, true);
    startButton.textContent = mode.available ? '受领并进入' : '命令未下达';
    startButton.disabled = !mode.available;
  };

  const render = () => {
    const mode = GAME_MODES.find((item) => item.id === selectedId) ?? GAME_MODES[0];
    renderModes();
    const operative = getOperative(operativeId);
    renderPersonnel(operative);
    renderOrder(mode, operative);
  };

  const showDraft = () => {
    const draftKey = draft.id;
    for (const [id, button] of pickButtons) {
      button.classList.toggle('is-selected', id === draftKey);
    }

    if (draft.kind === 'operative') {
      const operative = getOperative(draft.id);
      renderOperativeDossier(dossier, operative);
      const portrait = portraits.get(operative.id);
      const photo = dossier.querySelector('.menu__photo-canvas');
      if (portrait && photo instanceof HTMLCanvasElement) {
        paintPortrait(photo, portrait);
      }
      pickerConfirm.disabled = false;
      pickerConfirm.textContent = '按此指派';
      return;
    }

    const slot = RESERVED_SLOTS.find((item) => item.id === draft.id);
    renderReservedDossier(dossier, slot?.title ?? '留空', slot?.detail ?? '');
    pickerConfirm.disabled = true;
    pickerConfirm.textContent = '尚未开放';
  };

  const setPickerOpen = (open: boolean) => {
    pickerOpen = open;
    picker.hidden = !open;
    if (open) {
      draft = { kind: 'operative', id: operativeId };
      showDraft();
      pickButtons.get(operativeId)?.focus();
    }
  };

  portraitButton.addEventListener('click', () => {
    setPickerOpen(true);
  });
  personnelChange.addEventListener('click', () => {
    setPickerOpen(true);
  });
  pickerBackdrop.addEventListener('click', () => {
    setPickerOpen(false);
  });
  pickerCancel.addEventListener('click', () => {
    setPickerOpen(false);
    portraitButton.focus();
  });
  pickerConfirm.addEventListener('click', () => {
    if (draft.kind !== 'operative') {
      return;
    }

    operativeId = draft.id;
    setPickerOpen(false);
    render();
    portraitButton.focus();
  });
  overlay.addEventListener('keydown', (event) => {
    if (!pickerOpen || event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    setPickerOpen(false);
    portraitButton.focus();
  });

  startButton.addEventListener('click', () => {
    const mode = GAME_MODES.find((item) => item.id === selectedId);
    if (!mode?.available || pickerOpen) {
      return;
    }

    handlers.onStart(operativeId);
  });

  render();
  root.append(overlay);

  return {
    setVisible(visible: boolean) {
      overlay.hidden = !visible;
      if (!visible) {
        setPickerOpen(false);
      }
    },
  };
}

function fillOrder(template: string, operative: OperativeDef, html = false): string {
  const fields: Record<string, string> = {
    code: operative.code,
    codeEn: operative.codeEn,
    name: operative.name,
    role: operative.role,
  };

  return template.replaceAll(/\{(code|codeEn|name|role)\}/g, (_match, key: string) => {
    const value = fields[key] ?? '';
    return html ? escapeHtml(value) : value;
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function paintPortrait(canvas: HTMLCanvasElement, portrait: HTMLCanvasElement): void {
  canvas.width = portrait.width;
  canvas.height = portrait.height;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(portrait, 0, 0);
}

function paintSouth(canvas: HTMLCanvasElement, sheet: HTMLCanvasElement): void {
  const frame = sheetCell('s', PLAYER_CELL);
  canvas.width = PLAYER_CELL.width;
  canvas.height = PLAYER_CELL.height;
  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    sheet,
    frame.sx,
    frame.sy,
    frame.sw,
    frame.sh,
    0,
    0,
    canvas.width,
    canvas.height,
  );
}
