const BACKGROUND = '#0b0f14';

export function drawMenuBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  const pulse = 0.06 + Math.sin(time / 900) * 0.03;

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);
  context.fillStyle = `rgba(120, 200, 255, ${pulse})`;
  context.fillRect(0, 0, width, height);
}

export function drawPlayScene(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
): void {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  drawGrid(context, width, height);

  const pulse = 0.04 + Math.sin(time / 800) * 0.02;
  context.fillStyle = `rgba(80, 140, 180, ${pulse})`;
  context.fillRect(0, 0, width, height);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#e8f4ff';
  context.font = `600 ${Math.round(width * 0.028)}px ui-sans-serif, system-ui, sans-serif`;
  context.fillText('生存模式', width / 2, height / 2 - height * 0.03);

  context.fillStyle = '#8aa4b8';
  context.font = `400 ${Math.round(width * 0.016)}px ui-sans-serif, system-ui, sans-serif`;
  context.fillText('游戏内容待实现', width / 2, height / 2 + height * 0.025);
}

function drawGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const step = Math.max(32, Math.round(width / 32));
  context.beginPath();
  context.strokeStyle = 'rgba(120, 160, 190, 0.12)';
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += step) {
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, height);
  }

  for (let y = 0; y <= height; y += step) {
    context.moveTo(0, y + 0.5);
    context.lineTo(width, y + 0.5);
  }

  context.stroke();
}
