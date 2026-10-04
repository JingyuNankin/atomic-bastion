import { playerBoxes, type Box, type Rgb } from './player-model';

type Mesh = {
  positions: Float32Array;
  colors: Float32Array;
};

const LIGHT = normalize([0.35, 0.82, 0.44]);
const AMBIENT = 0.42;
const DIFFUSE = 0.58;

export function buildPlayerMesh(): Mesh {
  const positions: number[] = [];
  const colors: number[] = [];

  for (const box of playerBoxes()) {
    pushBox(positions, colors, box);
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  };
}

function pushBox(positions: number[], colors: number[], box: Box): void {
  const { cx, cy, cz, hx, hy, hz, color } = box;
  const x0 = cx - hx;
  const x1 = cx + hx;
  const y0 = cy - hy;
  const y1 = cy + hy;
  const z0 = cz - hz;
  const z1 = cz + hz;

  pushFace(positions, colors, [x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0], [0, 1, 0], color);
  pushFace(positions, colors, [x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1], [0, -1, 0], color);
  pushFace(positions, colors, [x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], [1, 0, 0], color);
  pushFace(positions, colors, [x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], [-1, 0, 0], color);
  pushFace(positions, colors, [x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], [0, 0, 1], color);
  pushFace(positions, colors, [x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], [0, 0, -1], color);
}

function pushFace(
  positions: number[],
  colors: number[],
  quad: number[],
  normal: Rgb,
  color: Rgb,
): void {
  const lit = shade(color, normal);
  const index = [0, 1, 2, 0, 2, 3];

  for (const i of index) {
    positions.push(quad[i * 3], quad[i * 3 + 1], quad[i * 3 + 2]);
    colors.push(lit[0], lit[1], lit[2]);
  }
}

function shade(color: Rgb, normal: Rgb): Rgb {
  const light = Math.max(0, normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
  const factor = AMBIENT + DIFFUSE * light;
  return [
    Math.min(1, color[0] * factor),
    Math.min(1, color[1] * factor),
    Math.min(1, color[2] * factor),
  ];
}

function normalize(vector: Rgb): Rgb {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}
