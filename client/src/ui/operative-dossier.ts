import type { OperativeDef } from '../operatives/catalog';
import { paintRadarChart } from './radar';
import { sealMarkup } from './seal';

export function renderOperativeDossier(root: HTMLElement, operative: OperativeDef): void {
  root.replaceChildren();

  const head = document.createElement('header');
  head.className = 'menu__dossier-head';
  const copy = document.createElement('div');
  copy.className = 'menu__dossier-copy';
  const kicker = document.createElement('p');
  kicker.className = 'menu__dossier-kicker';
  kicker.textContent = 'ЛИЧНОЕ ДЕЛО';
  const title = document.createElement('h3');
  title.className = 'menu__dossier-title';
  title.textContent = '个人档案';
  const file = document.createElement('p');
  file.className = 'menu__dossier-file';
  file.textContent = operative.fileNo;
  const identity = document.createElement('p');
  identity.className = 'menu__dossier-identity';
  identity.textContent = `${operative.code} · ${operative.codeEn}`;
  const role = document.createElement('p');
  role.className = 'menu__dossier-role';
  role.textContent = operative.role;
  const heading = document.createElement('div');
  heading.className = 'menu__dossier-heading';
  heading.append(kicker, title, file);
  copy.className = 'menu__dossier-copy';
  copy.append(identity, role);
  const identityBlock = document.createElement('div');
  identityBlock.className = 'menu__dossier-id';
  identityBlock.append(copy, photoFrame());
  head.append(heading, identityBlock);

  const aptitudeLabel = document.createElement('p');
  aptitudeLabel.className = 'menu__dossier-label';
  aptitudeLabel.textContent = operative.aptitudeProvisional ? '素质概算 · 未核定' : '素质概算';

  const aptitude = document.createElement('div');
  aptitude.className = 'menu__aptitude';
  aptitude.append(
    paintRadarChart(operative.aptitude, {
      className: 'menu__radar',
      label: '素质雷达',
      size: 176,
    }),
    aptitudeFigures(operative),
  );

  const aptitudeNote = document.createElement('p');
  aptitudeNote.className = 'menu__aptitude-note';
  aptitudeNote.textContent = '样张。移速、体力、换弹、回收尚不进入战斗。';

  const grid = document.createElement('dl');
  grid.className = 'menu__dossier-grid';
  for (const field of operative.fields) {
    const row = document.createElement('div');
    const label = document.createElement('dt');
    label.textContent = field.label;
    const value = document.createElement('dd');
    if (field.redacted) {
      value.append(redaction(field.label.length + 3));
    } else {
      value.textContent = field.value;
    }
    row.append(label, value);
    grid.append(row);
  }

  const serviceLabel = document.createElement('p');
  serviceLabel.className = 'menu__dossier-label';
  serviceLabel.textContent = '履历';

  const service = document.createElement('ol');
  service.className = 'menu__service';
  for (const entry of operative.service) {
    const item = document.createElement('li');
    const years = document.createElement('span');
    years.className = 'menu__service-years';
    years.textContent = entry.years;
    item.append(years);
    if (entry.redacted) {
      item.append(redaction(8));
    } else {
      const post = document.createElement('span');
      post.textContent = entry.post;
      item.append(post);
    }
    service.append(item);
  }

  const noteLabel = document.createElement('p');
  noteLabel.className = 'menu__dossier-label';
  noteLabel.textContent = '鉴定';
  const note = document.createElement('p');
  note.className = 'menu__dossier-note';
  note.textContent = operative.note;

  const seal = document.createElement('div');
  seal.className = 'menu__dossier-seal';
  seal.innerHTML = sealMarkup('seal', {
    id: `dossier-seal-${operative.id}`,
    legend: 'ОТР-3 · 个人档案 · 绝密 ·',
    inked: true,
  });

  identityBlock.append(seal);

  root.append(
    head,
    aptitudeLabel,
    aptitude,
    aptitudeNote,
    grid,
    serviceLabel,
    service,
    noteLabel,
    note,
  );
}

export function renderReservedDossier(root: HTMLElement, title: string, detail: string): void {
  root.replaceChildren();
  const head = document.createElement('header');
  head.className = 'menu__dossier-head';
  const kicker = document.createElement('p');
  kicker.className = 'menu__dossier-kicker';
  kicker.textContent = 'ЛИЧНОЕ ДЕЛО';
  const heading = document.createElement('h3');
  heading.className = 'menu__dossier-title';
  heading.textContent = title;
  const block = document.createElement('div');
  block.className = 'menu__dossier-heading';
  block.append(kicker, heading);
  const photo = photoFrame();
  photo.classList.add('is-empty');
  const identityBlock = document.createElement('div');
  identityBlock.className = 'menu__dossier-id';
  identityBlock.append(photo);
  head.append(block, identityBlock);

  const note = document.createElement('p');
  note.className = 'menu__dossier-note';
  note.textContent = `${detail}。栏位留空，档案尚未建档。`;

  root.append(head, note);
}

function redaction(widthEm: number): HTMLSpanElement {
  const bar = document.createElement('span');
  bar.className = 'menu__redact';
  bar.style.width = `${widthEm}em`;
  bar.setAttribute('aria-label', '涂黑');
  return bar;
}

function photoFrame(): HTMLElement {
  const photo = document.createElement('div');
  photo.className = 'menu__photo';
  photo.innerHTML = scallopMarkup();
  const canvas = document.createElement('canvas');
  canvas.className = 'menu__photo-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  photo.append(canvas);
  return photo;
}

const PHOTO_W = 80;
const PHOTO_H = 100;
const PHOTO_R = 5;

function scallopMarkup(): string {
  return `
    <svg class="menu__photo-paper" viewBox="0 0 ${PHOTO_W} ${PHOTO_H}" overflow="visible" aria-hidden="true">
      <path d="${scallopPath(PHOTO_W, PHOTO_H, PHOTO_R)}" fill="#f3ead6" stroke="#2c2418" stroke-opacity="0.4" stroke-width="0.6"/>
    </svg>
  `;
}

function scallopPath(width: number, height: number, radius: number): string {
  const diameter = radius * 2;
  const innerW = width - diameter;
  const innerH = height - diameter;
  const across = Math.round(innerW / diameter);
  const down = Math.round(innerH / diameter);
  const sx = innerW / across;
  const sy = innerH / down;
  const left = radius;
  const top = radius;
  const right = radius + innerW;
  const bottom = radius + innerH;
  const cmds = [`M ${left} ${top}`];

  for (let index = 0; index < across; index += 1) {
    cmds.push(`A ${sx / 2} ${radius} 0 0 0 ${left + (index + 1) * sx} ${top}`);
  }
  for (let index = 0; index < down; index += 1) {
    cmds.push(`A ${radius} ${sy / 2} 0 0 1 ${right} ${top + (index + 1) * sy}`);
  }
  for (let index = 0; index < across; index += 1) {
    cmds.push(`A ${sx / 2} ${radius} 0 0 1 ${right - (index + 1) * sx} ${bottom}`);
  }
  for (let index = 0; index < down; index += 1) {
    cmds.push(`A ${radius} ${sy / 2} 0 0 1 ${left} ${bottom - (index + 1) * sy}`);
  }

  cmds.push('Z');
  return cmds.join(' ');
}

function aptitudeFigures(operative: OperativeDef): HTMLElement {
  const list = document.createElement('div');
  list.className = 'menu__aptitude-list';

  for (const axis of operative.aptitude) {
    const row = document.createElement('p');
    row.className = 'menu__aptitude-row';
    const label = document.createElement('span');
    label.textContent = axis.label;
    const value = document.createElement('span');
    value.className = 'menu__aptitude-value';
    value.textContent = String(axis.value);
    row.append(label, value);
    list.append(row);
  }

  return list;
}
