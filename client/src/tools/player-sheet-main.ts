import { bakePlayerSheet, playerSheetToPng } from '../render/bake-player-sheet';

const canvas = document.querySelector('#sheet');
const button = document.querySelector('#download');
const status = document.querySelector('#status');

if (
  !(canvas instanceof HTMLCanvasElement) ||
  !(button instanceof HTMLButtonElement) ||
  !(status instanceof HTMLElement)
) {
  throw new Error('Missing sheet preview');
}

try {
  const sheet = bakePlayerSheet();
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  canvas.width = sheet.width;
  canvas.height = sheet.height;
  context.imageSmoothingEnabled = false;
  context.drawImage(sheet, 0, 0);
  const pixels = context.getImageData(0, 0, sheet.width, sheet.height).data;
  let opaque = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 16) {
      opaque += 1;
    }
  }

  status.textContent = `${sheet.width}×${sheet.height} · ${opaque} px`;

  button.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = playerSheetToPng(sheet);
    link.download = 'p01-soldier.png';
    link.click();
  });
} catch (error) {
  status.textContent = error instanceof Error ? error.message : String(error);
}
