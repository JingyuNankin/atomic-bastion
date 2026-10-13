const INK = '#2c2418';
const STAMP = '#a32020';

export type RadarPoint = {
  label: string;
  value: number;
};

export function paintRadarChart(
  axes: RadarPoint[],
  options: { className: string; label: string; size?: number },
): SVGSVGElement {
  const size = options.size ?? 220;
  const svg = svgEl('svg', {
    class: options.className,
    viewBox: `0 0 ${size} ${size}`,
    width: String(size),
    height: String(size),
    role: 'img',
    'aria-label': options.label,
  });

  if (axes.length < 3) {
    return svg;
  }

  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = size * 0.31;
  const labelPad = size * 0.082;
  const count = axes.length;
  const pointAt = (index: number, radius: number) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / count;
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  };
  const ring = 'rgba(44, 36, 24, 0.28)';

  for (const step of [0.25, 0.5, 0.75, 1]) {
    svg.append(
      svgEl('polygon', {
        points: polygonPoints(count, (index) => pointAt(index, maxRadius * step)),
        fill: 'none',
        stroke: ring,
        'stroke-width': '1',
        'stroke-linejoin': 'round',
      }),
    );
  }

  for (let index = 0; index < count; index += 1) {
    const tip = pointAt(index, maxRadius);
    svg.append(
      svgEl('line', {
        x1: String(cx),
        y1: String(cy),
        x2: String(tip.x),
        y2: String(tip.y),
        stroke: ring,
        'stroke-width': '1',
      }),
    );
  }

  svg.append(
    svgEl('polygon', {
      points: polygonPoints(count, (index) => {
        const radius = maxRadius * (Math.min(100, Math.max(0, axes[index]?.value ?? 0)) / 100);
        return pointAt(index, radius);
      }),
      fill: STAMP,
      'fill-opacity': '0.28',
      stroke: STAMP,
      'stroke-width': '1.5',
      'stroke-linejoin': 'round',
    }),
  );

  axes.forEach((axis, index) => {
    const labelAt = pointAt(index, maxRadius + labelPad);
    const label = svgEl('text', {
      x: String(labelAt.x),
      y: String(labelAt.y),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      fill: INK,
      'font-size': '12',
    });
    label.textContent = axis.label;
    svg.append(label);
  });

  return svg;
}

function polygonPoints(
  count: number,
  pointAt: (index: number) => { x: number; y: number },
): string {
  return Array.from({ length: count }, (_, index) => {
    const point = pointAt(index);
    return `${point.x},${point.y}`;
  }).join(' ');
}

function svgEl<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string>,
): SVGElementTagNameMap[K] {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  return element;
}
