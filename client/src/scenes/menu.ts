import {
  GAME_MODES,
  type GameMode,
  type GameModeId,
} from '../game/modes';
import '../ui/menu.css';
import { sealMarkup, starMarkup } from '../ui/seal';
import { bakePlayerSheet, PLAYER_CELL, sheetCell } from '../render/bake-player-sheet';

type MenuHandlers = {
  onStart: () => void;
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

const ORDERS: Record<GameModeId, OrderCopy> = {
  survival: {
    number: '72-014',
    subject: '关于第 72 号堡垒失联之处置命令',
    lead: '第 72 号自动反应堆研究堡垒（代号「铁脉」）通讯中断。自动化单元已脱离控制。',
    body: `
      <ol class="menu__clauses">
        <li>由技术执行员「闸工」进入隔离区，查明事故原因。</li>
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
        <li>未经另行命令，不得进入核心主机舱。</li>
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
        <li>档案回收须待隔离区解除封锁后执行。</li>
      </ol>
    `,
  },
};

export function mountMenu(root: HTMLElement, handlers: MenuHandlers): MenuView {
  const overlay = document.createElement('div');
  overlay.className = 'menu';
  overlay.innerHTML = `
    <aside class="menu__rail">
      <p class="menu__game-en">${starMarkup('star')}ATOMIC BASTION</p>
      <p class="menu__game">原子堡垒</p>
      <p class="menu__rail-kicker">封存设施 · 禁止外传</p>
      <p class="menu__game-sub">BUNKER-72 · 铁脉</p>
      <div class="menu__portrait" aria-label="执行员闸工的角色立绘">
        <canvas class="menu__portrait-canvas" aria-hidden="true"></canvas>
        <span class="menu__portrait-label">人员档案 / ОТР-3</span>
      </div>
      <div class="menu__personnel">
        <p class="menu__personnel-label">执行员档案 / 72—А</p>
        <p class="menu__personnel-name">闸工 <span>GATEKEEPER</span></p>
        <p class="menu__personnel-role">核设施设备调试工程师</p>
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
          <dd>执行员「闸工」</dd>
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
  `;

  const modesNav = overlay.querySelector('.menu__modes');
  const portrait = overlay.querySelector('.menu__portrait-canvas');
  const orderNo = overlay.querySelector('.menu__order-no');
  const subject = overlay.querySelector('.menu__subject');
  const lead = overlay.querySelector('.menu__lead');
  const body = overlay.querySelector('.menu__body');
  const startButton = overlay.querySelector('.menu__start');

  if (
    !(modesNav instanceof HTMLElement) ||
    !(orderNo instanceof HTMLElement) ||
    !(subject instanceof HTMLElement) ||
    !(lead instanceof HTMLElement) ||
    !(body instanceof HTMLElement) ||
    !(startButton instanceof HTMLButtonElement)
  ) {
    throw new Error('Missing menu order sheet');
  }

  if (portrait instanceof HTMLCanvasElement) {
    try {
      const sheet = bakePlayerSheet();
      const frame = sheetCell('s', PLAYER_CELL);
      portrait.width = PLAYER_CELL.width;
      portrait.height = PLAYER_CELL.height;
      portrait.getContext('2d')?.drawImage(
        sheet,
        frame.sx, frame.sy, frame.sw, frame.sh,
        0, 0, PLAYER_CELL.width, PLAYER_CELL.height,
      );
    } catch (error) {
      console.warn('Could not render the menu personnel portrait.', error);
    }
  }

  let selectedId: GameModeId =
    GAME_MODES.find((mode) => mode.available)?.id ?? GAME_MODES[0].id;

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

  const renderOrder = (mode: GameMode) => {
    const order = ORDERS[mode.id];
    orderNo.textContent = `处置令 № ${order.number}`;
    subject.textContent = order.subject;
    lead.textContent = order.lead;
    body.innerHTML = order.body;
    startButton.textContent = mode.available ? '受领并进入' : '命令未下达';
    startButton.disabled = !mode.available;
  };

  const render = () => {
    const mode = GAME_MODES.find((item) => item.id === selectedId) ?? GAME_MODES[0];
    renderModes();
    renderOrder(mode);
  };

  startButton.addEventListener('click', () => {
    const mode = GAME_MODES.find((item) => item.id === selectedId);
    if (!mode?.available) {
      return;
    }

    handlers.onStart();
  });

  render();
  root.append(overlay);

  return {
    setVisible(visible: boolean) {
      overlay.hidden = !visible;
    },
  };
}
