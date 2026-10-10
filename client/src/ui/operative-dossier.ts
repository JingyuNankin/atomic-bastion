import type { AptitudeAxis, OperativeDef } from '../operatives/catalog';
import { sealMarkup } from './seal';

const ROSE_COLORS = ['#a32020', '#b8923a', '#6a3a28', '#2c2418', '#8a2a32', '#5c5346'];

export function renderOperativeDossier(root: HTMLElement, operative: OperativeDef): void {
  root.replaceChildren();

  const head = document.createElement('header');
  head.className = 'menu__dossier-head';
  const kicker = document.createElement('p');
  kicker.className = 'menu__dossier-kicker';
  kicker.textContent = 'ЛИЧНОЕ ДЕЛО';
  const title = document.createElement('h3');
  title.className = 'menu__dossier-title';
  title.textContent = '个人档案';
  const file = document.createElement('p');
  file.className = 'menu__dossier-file';
  file.textContent = operative.fileNo;
  head.append(kicker, title, file);

  const identity = document.createElement('p');
  identity.className = 'menu__dossier-identity';
  identity.textContent = `${operative.code} · ${operative.codeEn}`;

  const role = document.createElement('p');
  role.className = 'menu__dossier-role';
  role.textContent = operative.role;

  const roseLabel = document.createElement('p');
  roseLabel.className = 'menu__dossier-label';
  roseLabel.textContent = operative.aptitudeProvisional ? '素质概算 · 未核定' : '素质概算';

  const rose = document.createElement('canvas');
  rose.className = 'menu__rose';
  rose.setAttribute('aria-label', '素质玫瑰图样张');
  paintRose(rose, operative.aptitude);

  const roseNote = document.createElement('p');
  roseNote.className = 'menu__rose-note';
  roseNote.textContent = '样张。移速、体力、换弹、回收尚不进入战斗。';

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
  });

  root.append(head, identity, role, roseLabel, rose, roseNote, grid, serviceLabel, service, noteLabel, note, seal);
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
  head.append(kicker, heading);

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

function paintRose(canvas: HTMLCanvasElement, axes: AptitudeAxis[]): void {
  const size = 200;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context || axes.length === 0) {
    return;
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 62;
  const count = axes.length;

  context.clearRect(0, 0, size, size);
  context.strokeStyle = 'rgba(44, 36, 24, 0.28)';
  context.lineWidth = 1;

  for (const step of [0.25, 0.5, 0.75, 1]) {
    context.beginPath();
    context.arc(cx, cy, maxRadius * step, 0, Math.PI * 2);
    context.stroke();
  }

  axes.forEach((axis, index) => {
    const start = -Math.PI / 2 + (index * Math.PI * 2) / count;
    const end = start + (Math.PI * 2) / count;
    const radius = Math.max(10, maxRadius * (clamp(axis.value, 0, 100) / 100));
    context.beginPath();
    context.moveTo(cx, cy);
    context.arc(cx, cy, radius, start, end);
    context.closePath();
    context.globalAlpha = 0.82;
    context.fillStyle = ROSE_COLORS[index % ROSE_COLORS.length] ?? ROSE_COLORS[0];
    context.fill();
    context.globalAlpha = 1;
    context.strokeStyle = '#2c2418';
    context.stroke();

    const mid = (start + end) / 2;
    context.fillStyle = '#2c2418';
    context.font = '12px "PingFang SC", "Microsoft YaHei", sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(axis.label, cx + Math.cos(mid) * (maxRadius + 22), cy + Math.sin(mid) * (maxRadius + 22));
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
