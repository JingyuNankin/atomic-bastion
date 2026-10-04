import { getWeapon, type WeaponId } from '../weapons/catalog';

export const WEAPON_SLOT_COUNT = 4;

export type WeaponSlot = {
  weaponId: WeaponId | null;
  icon: HTMLCanvasElement | null;
};

export type VitalsHud = {
  hp: number;
  maxHp: number;
  ammoInMag: number;
  magazineSize: number;
  ammoIcon: HTMLCanvasElement | null;
  reloading: boolean;
};

export function weaponSlots(
  loadout: Array<WeaponId | null>,
  icons: Record<WeaponId, HTMLCanvasElement | undefined>,
): WeaponSlot[] {
  return Array.from({ length: WEAPON_SLOT_COUNT }, (_, index) => {
    const weaponId = loadout[index] ?? null;
    return {
      weaponId,
      icon: weaponId ? (icons[weaponId] ?? null) : null,
    };
  });
}

export function drawWeaponHud(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  weaponId: WeaponId,
  slots: WeaponSlot[],
  vitals: VitalsHud,
): void {
  drawVitals(context, width, height, vitals);
  drawWeaponSlots(context, width, height, weaponId, slots);
}

function drawVitals(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  vitals: VitalsHud,
): void {
  const barWidth = 320;
  const barHeight = 7;
  const x = Math.floor((width - barWidth) / 2);
  const y = height - 22;
  const ratio = vitals.maxHp <= 0 ? 0 : Math.max(0, Math.min(1, vitals.hp / vitals.maxHp));

  drawAmmoIcons(context, x, y - 4, barWidth, vitals);

  context.fillStyle = 'rgba(11, 15, 20, 0.72)';
  context.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

  context.fillStyle = '#3a1014';
  context.fillRect(x, y, barWidth, barHeight);

  context.fillStyle = ratio <= 0.28 ? '#ff3b3b' : '#d31f2a';
  context.fillRect(x, y, Math.floor(barWidth * ratio), barHeight);

  context.fillStyle = 'rgba(255, 255, 255, 0.16)';
  context.fillRect(x, y, Math.floor(barWidth * ratio), 2);

  context.strokeStyle = '#8a2a32';
  context.lineWidth = 1;
  context.strokeRect(x + 0.5, y + 0.5, barWidth - 1, barHeight - 1);
}

const ammoCropCache = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();

function croppedAmmoIcon(source: HTMLCanvasElement): HTMLCanvasElement {
  const cached = ammoCropCache.get(source);

  if (cached) {
    return cached;
  }

  const context = source.getContext('2d');
  const cropped = document.createElement('canvas');

  if (!context) {
    cropped.width = source.width;
    cropped.height = source.height;
    ammoCropCache.set(source, cropped);
    return cropped;
  }

  const pixels = context.getImageData(0, 0, source.width, source.height);
  let minX = source.width;
  let minY = source.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      if (pixels.data[(y * source.width + x) * 4 + 3] < 16) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    cropped.width = source.width;
    cropped.height = source.height;
    ammoCropCache.set(source, cropped);
    return cropped;
  }

  cropped.width = maxX - minX + 1;
  cropped.height = maxY - minY + 1;
  const dest = cropped.getContext('2d');

  if (dest) {
    dest.drawImage(
      source,
      minX,
      minY,
      cropped.width,
      cropped.height,
      0,
      0,
      cropped.width,
      cropped.height,
    );
  }

  ammoCropCache.set(source, cropped);
  return cropped;
}

function drawAmmoIcons(
  context: CanvasRenderingContext2D,
  left: number,
  bottom: number,
  maxWidth: number,
  vitals: VitalsHud,
): void {
  const count = Math.max(0, vitals.magazineSize);
  const compact = count > 16;
  const iconW = compact ? 4 : 5;
  const iconH = compact ? 10 : 12;
  const gap = 1;
  const step = iconW + gap;
  const perRow = Math.max(1, Math.floor((maxWidth + gap) / step));
  const rows = Math.max(1, Math.ceil(count / perRow));
  const top = bottom - rows * (iconH + 2) + 2;
  const icon = vitals.ammoIcon ? croppedAmmoIcon(vitals.ammoIcon) : null;

  context.imageSmoothingEnabled = false;

  for (let i = 0; i < count; i += 1) {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    const x = left + col * step;
    const y = top + row * (iconH + 2);
    const filled = !vitals.reloading && i < vitals.ammoInMag;

    context.globalAlpha = filled ? 1 : 0.22;

    if (icon) {
      context.save();
      context.translate(x + iconW / 2, y + iconH / 2);
      context.rotate(-Math.PI / 2);
      context.drawImage(icon, -iconH / 2, -iconW / 2, iconH, iconW);
      context.restore();
    } else {
      context.fillStyle = '#d4a03a';
      context.fillRect(x + 2, y + 1, iconW - 4, iconH - 2);
    }
  }

  context.globalAlpha = 1;

  if (vitals.reloading) {
    context.textAlign = 'left';
    context.textBaseline = 'bottom';
    context.fillStyle = '#8aa4b8';
    context.font = '12px ui-sans-serif, system-ui, sans-serif';
    context.fillText('装填中', left, top - 4);
  }
}

function drawWeaponSlots(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  weaponId: WeaponId,
  slots: WeaponSlot[],
): void {
  const slotWidth = 108;
  const slotHeight = 32;
  const gap = 6;
  const stack = slots.length * slotHeight + (slots.length - 1) * gap;
  const x = width - 10 - slotWidth;
  let y = Math.max(56, (height - stack) / 2);

  slots.forEach((slot, index) => {
    drawSlot(context, x, y, slotWidth, slotHeight, index + 1, slot, weaponId);
    y += slotHeight + gap;
  });
}

function drawSlot(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  index: number,
  slot: WeaponSlot,
  activeId: WeaponId,
): void {
  const filled = slot.weaponId !== null;
  const active = filled && slot.weaponId === activeId;
  const iconSize = 28;
  const iconX = x + width - iconSize;
  const iconY = y + (height - iconSize) / 2;

  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.globalAlpha = active ? 0.9 : filled ? 0.45 : 0.22;
  context.fillStyle = active ? '#e8f4ff' : '#8aa4b8';
  context.font = active
    ? '600 12px ui-sans-serif, system-ui, sans-serif'
    : '12px ui-sans-serif, system-ui, sans-serif';
  context.fillText(
    filled && slot.weaponId ? getWeapon(slot.weaponId).name : '空',
    iconX - 8,
    y + height / 2,
  );
  context.globalAlpha = 1;

  context.imageSmoothingEnabled = false;
  context.globalAlpha = active ? 0.92 : filled ? 0.42 : 0.18;

  if (slot.icon) {
    context.drawImage(slot.icon, iconX, iconY, iconSize, iconSize);
  } else {
    context.strokeStyle = '#8aa4b8';
    context.lineWidth = 1;
    context.strokeRect(iconX + 3.5, iconY + 3.5, iconSize - 7, iconSize - 7);
  }

  context.globalAlpha = 1;
  drawIndexBadge(context, iconX + iconSize - 10, iconY - 2, index, active);
}

function drawIndexBadge(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  index: number,
  active: boolean,
): void {
  const size = 11;
  context.fillStyle = active
    ? 'rgba(126, 200, 255, 0.92)'
    : 'rgba(11, 15, 20, 0.7)';
  context.fillRect(x, y, size, size);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = active ? '#0b0f14' : 'rgba(196, 214, 226, 0.75)';
  context.font = '600 9px ui-sans-serif, system-ui, sans-serif';
  context.fillText(String(index), x + size / 2, y + size / 2 + 0.5);
}
