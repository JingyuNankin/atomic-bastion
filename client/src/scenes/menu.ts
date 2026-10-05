import {
  GAME_MODES,
  type GameMode,
  type GameModeId,
} from '../game/modes';
import '../ui/menu.css';
import { sealMarkup, starMarkup } from '../ui/seal';

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
    subject: '第 72 号堡垒通讯静默',
    lead: '该设施通讯静默，自动化防御单元脱离主控制域，需要技术人员渗透，优先执行核心停机。',
    body: `
      <ol class="menu__clauses">
        <li>进入第 72 号自动反应堆研究堡垒，代号「铁脉」。对外口径：<span class="menu__redact">管道泄漏，永久关停</span>。</li>
        <li>「铁脉核心」控制算法在中子辐照后崩坏，不再识别人员。所有核动力单元将人类判定为入侵目标。</li>
        <li>优先关停核心主机，回收实验记录。清除威胁列第二。必要时销毁失控机械。此条优先于 <span class="menu__struck">武装清场</span>。</li>
        <li>阅后销毁。不得向 <span class="menu__redact">科学院、地方苏维埃</span> 透露铁脉仍在运转。</li>
      </ol>
    `,
  },
  defense: {
    number: '72-031',
    subject: '核心主机舱不得失守',
    lead: '隔离闸门已引爆锁死。守住核心主机与数据柜，保全研究记录优先于歼灭机组。',
    body: `
      <ol class="menu__clauses">
        <li>进入后直趋核心主机舱，建立据点，不得撤离。</li>
        <li>守住<span class="menu__redact">铁脉核心控制棒组</span>，直至增援到达。</li>
        <li>本令尚待 <span class="menu__struck">局务委员会</span> <span class="menu__redact">处长</span> 副署，暂缓执行。</li>
      </ol>
    `,
  },
  collect: {
    number: '72-048',
    subject: '回收实验记录',
    lead: '数据保全优先。在堡垒内取回密级钥匙与实验记录后立即撤离。',
    body: `
      <ol class="menu__clauses">
        <li>寻回密级钥匙及<span class="menu__redact">自主机械集群运行日志</span>，不得遗失。</li>
        <li>档案按 <span class="menu__struck">就地销毁</span> <span class="menu__redact">专线押送监察局</span> 办理。</li>
        <li>本令尚未签发，不得提前行动。</li>
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
      <p class="menu__game-sub">BUNKER-72 · 铁脉</p>
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
      <dl class="menu__meta">
        <div>
          <dt>收件</dt>
          <dd>执行员「闸工」</dd>
        </div>
        <div>
          <dt>原名</dt>
          <dd><span class="menu__redact">阿列克谢・沃罗宁</span></dd>
        </div>
        <div>
          <dt>编制</dt>
          <dd>前核设施调试工程师</dd>
        </div>
      </dl>
      <p class="menu__subject"></p>
      <p class="menu__lead"></p>
      <div class="menu__body"></div>
      <footer class="menu__signoff">
        <p>签发</p>
        <p class="menu__rank">第三特别处置处处长</p>
        <p class="menu__sign">Н. <span class="menu__redact menu__redact--name">Соколов</span></p>
        <p class="menu__date">19██ 年 █ 月 █ 日 · 莫斯科</p>
      </footer>
      <button type="button" class="menu__start"></button>
      <div class="menu__seal">${sealMarkup('seal', {
        id: 'menu-seal-arc',
        legend: 'ОТР-3 · 绝密 · 铁脉 · BUNKER-72 ·',
      })}</div>
    </article>
  `;

  const modesNav = overlay.querySelector('.menu__modes');
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
    subject.textContent = `事由：${order.subject}`;
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
