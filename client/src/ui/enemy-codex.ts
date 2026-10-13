import { listEnemies, type EnemyDef, type EnemyId } from '../enemies/catalog';
import { rateEnemy } from '../enemies/ratings';
import { PX_PER_UNIT } from '../game/units';
import { gaitCell, sheetCell } from '../render/bake-player-sheet';
import { HYENA_GAIT_CELL } from '../render/hyena-model';
import { paintRadarChart } from './radar';
import { starMarkup } from './seal';
import './enemy-codex.css';

export type EnemyCodex = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  setSheets: (sheets: Record<string, HTMLCanvasElement | undefined>) => void;
};

export function mountEnemyCodex(root: HTMLElement): EnemyCodex {
  const overlay = document.createElement('div');
  overlay.className = 'codex';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="codex__backdrop"></div>
    <div class="codex__panel" role="dialog" aria-modal="true" aria-labelledby="codex-title">
      <div class="codex__filehead">
        <span class="codex__classif">内部</span>
        <span>机组图鉴 АБ-E</span>
      </div>
      <div class="codex__top">
        <div>
          <p class="codex__brand">ОТР-3 · 铁脉机组</p>
          <h2 class="codex__title" id="codex-title">${starMarkup('star')}失控机械图鉴</h2>
        </div>
        <button type="button" class="codex__close">
          <svg class="codex__close-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="1.6"/>
          </svg>
          关闭
        </button>
      </div>
      <p class="codex__hint">左侧点选机组。雷达按编制上限计分，换一条仍是同一把尺子。</p>
      <div class="codex__main">
        <section class="codex__col">
          <h3 class="codex__col-title">机组</h3>
          <div class="codex__list"></div>
        </section>
        <section class="codex__col">
          <h3 class="codex__col-title">详情</h3>
          <div class="codex__detail"></div>
        </section>
      </div>
    </div>
  `;

  const backdrop = overlay.querySelector('.codex__backdrop');
  const closeButton = overlay.querySelector('.codex__close');
  const listEl = overlay.querySelector('.codex__list');
  const detailEl = overlay.querySelector('.codex__detail');

  if (
    !(backdrop instanceof HTMLElement) ||
    !(closeButton instanceof HTMLButtonElement) ||
    !(listEl instanceof HTMLElement) ||
    !(detailEl instanceof HTMLElement)
  ) {
    throw new Error('Missing enemy codex');
  }

  let open = false;
  let selectedId: EnemyId = listEnemies()[0]?.id ?? '';
  let sheets: Record<string, HTMLCanvasElement | undefined> = {};

  const close = () => {
    open = false;
    overlay.hidden = true;
  };

  const render = () => {
    const enemies = listEnemies();
    if (!enemies.some((enemy) => enemy.id === selectedId)) {
      selectedId = enemies[0]?.id ?? '';
    }

    renderList(listEl, enemies, selectedId, sheets, (id) => {
      selectedId = id;
      render();
    });

    const selected = enemies.find((enemy) => enemy.id === selectedId);
    renderDetail(detailEl, selected, sheets[selectedId]);
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
    setSheets(next) {
      sheets = next;
      if (open) {
        render();
      }
    },
  };
}

function renderList(
  root: HTMLElement,
  enemies: EnemyDef[],
  selectedId: EnemyId,
  sheets: Record<string, HTMLCanvasElement | undefined>,
  onSelect: (id: EnemyId) => void,
): void {
  root.replaceChildren();

  for (const enemy of enemies) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'codex__card';
    if (enemy.id === selectedId) {
      button.classList.add('is-selected');
    }

    const copy = document.createElement('span');
    copy.className = 'codex__card-copy';
    const name = document.createElement('span');
    name.className = 'codex__card-name';
    name.textContent = enemy.name;
    const chip = document.createElement('span');
    chip.className = 'codex__card-chip';
    chip.textContent = enemy.role;
    copy.append(name, chip);

    button.append(thumb(sheets[enemy.id], enemy.id, 'codex__thumb'), copy);
    button.addEventListener('click', () => {
      onSelect(enemy.id);
    });
    root.append(button);
  }
}

function renderDetail(
  root: HTMLElement,
  enemy: EnemyDef | undefined,
  sheet: HTMLCanvasElement | undefined,
): void {
  root.replaceChildren();

  if (!enemy) {
    return;
  }

  const head = document.createElement('div');
  head.className = 'codex__head';
  const copy = document.createElement('div');
  const code = document.createElement('p');
  code.className = 'codex__code';
  code.textContent = `${enemy.code} · ${enemy.nameEn}`;
  const name = document.createElement('h3');
  name.className = 'codex__name';
  name.textContent = enemy.name;
  const role = document.createElement('p');
  role.className = 'codex__role';
  role.textContent = `${enemy.tier} · ${enemy.role} · ${enemy.locomotion === 'air' ? '空中' : '地面'}`;
  copy.append(code, name, role);
  head.append(thumb(sheet, enemy.id, 'codex__portrait'), copy);

  const blurb = document.createElement('p');
  blurb.className = 'codex__blurb';
  blurb.textContent = enemy.blurb;

  const axes = rateEnemy(enemy);
  const radarRow = document.createElement('div');
  radarRow.className = 'codex__radar-row';
  const radar = paintRadarChart(axes, {
    className: 'codex__radar',
    label: `${enemy.name}性能雷达`,
  });

  const stats = document.createElement('div');
  stats.className = 'codex__stats';
  const reach = enemy.attack === 'melee' ? enemy.attackRange + enemy.attackReach : enemy.attackRange;
  const rows: Array<[string, string]> = [
    ['生命', String(enemy.hp)],
    ['移速', `${formatUnits(enemy.speed)} 单位/秒`],
    ['攻击', enemy.attackName],
    ['伤害', String(enemy.damage)],
    ['距离', `${formatUnits(reach)} 单位`],
    ['间隔', enemy.windup ? `${enemy.attackInterval} 秒，预警 ${enemy.windup} 秒` : `${enemy.attackInterval} 秒`],
  ];

  for (const [label, value] of rows) {
    const item = document.createElement('div');
    item.className = 'codex__stat';
    const caption = document.createElement('span');
    caption.className = 'codex__stat-label';
    caption.textContent = label;
    const figure = document.createElement('span');
    figure.textContent = value;
    item.append(caption, figure);
    stats.append(item);
  }

  radarRow.append(radar, stats);
  root.append(head, blurb, radarRow);
}

function thumb(
  sheet: HTMLCanvasElement | undefined,
  enemyId: EnemyId,
  className: string,
): HTMLCanvasElement {
  const cell = enemyId === 'e01-hyena' ? gaitCell('s', 'stand', HYENA_GAIT_CELL) : sheetCell('s');
  const canvas = document.createElement('canvas');
  canvas.className = className;
  canvas.width = cell.sw;
  canvas.height = cell.sh;
  const context = canvas.getContext('2d');

  if (context && sheet) {
    context.imageSmoothingEnabled = false;
    context.drawImage(sheet, cell.sx, cell.sy, cell.sw, cell.sh, 0, 0, cell.sw, cell.sh);
  }

  return canvas;
}

function formatUnits(pixels: number): string {
  const units = Math.round((pixels / PX_PER_UNIT) * 1000) / 1000;
  return String(units);
}
