import { getWeapon, type WeaponId } from '../weapons/catalog';

export function drawWeaponHud(
  context: CanvasRenderingContext2D,
  height: number,
  weaponId: WeaponId,
  ammoInMag: number,
  icon: HTMLCanvasElement | null,
): void {
  const weapon = getWeapon(weaponId);
  const left = 16;
  const bottom = height - 16;
  const panelWidth = 220;
  const panelHeight = 64;
  const x = left;
  const y = bottom - panelHeight;
  const iconSize = 40;
  const iconX = x + 10;
  const iconY = y + (panelHeight - iconSize) / 2;
  const textX = icon ? iconX + iconSize + 10 : x + 10;

  context.fillStyle = 'rgba(11, 15, 20, 0.72)';
  context.strokeStyle = 'rgba(138, 164, 184, 0.5)';
  context.lineWidth = 1;
  context.fillRect(x, y, panelWidth, panelHeight);
  context.strokeRect(x + 0.5, y + 0.5, panelWidth - 1, panelHeight - 1);

  if (icon) {
    context.imageSmoothingEnabled = false;
    context.drawImage(icon, iconX, iconY, iconSize, iconSize);
  }

  context.textAlign = 'left';
  context.textBaseline = 'top';
  context.fillStyle = '#8aa4b8';
  context.font = '12px ui-sans-serif, system-ui, sans-serif';
  context.fillText('当前武器', textX, y + 8);

  context.fillStyle = '#e8f4ff';
  context.font = '600 15px ui-sans-serif, system-ui, sans-serif';
  context.fillText(weapon.name, textX, y + 24);

  context.fillStyle = '#8aa4b8';
  context.font = '12px ui-sans-serif, system-ui, sans-serif';
  context.fillText(
    `弹匣 ${ammoInMag} / ${weapon.magazineSize}`,
    textX,
    y + 42,
  );
}
