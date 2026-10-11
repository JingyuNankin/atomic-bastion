import { playerBoxes, type Box, type Rgb } from './player-model';

export type Mesh = {
  positions: Float32Array;
  colors: Float32Array;
};

const LIGHT = normalize([0.35, 0.82, 0.44]);
const AMBIENT = 0.42;
const DIFFUSE = 0.58;

export function buildBoxMesh(boxes: Box[]): Mesh {
  const positions: number[] = [];
  const colors: number[] = [];

  for (const box of boxes) {
    pushBox(positions, colors, box);
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  };
}

export function buildPlayerMesh(): Mesh {
  return buildBoxMesh(playerBoxes());
}

function pushBox(positions: number[], colors: number[], box: Box): void {
  const { cx, cy, cz, hx, hy, hz, color } = box;
  const x0 = cx - hx;
  const x1 = cx + hx;
  const y0 = cy - hy;
  const y1 = cy + hy;
  const z0 = cz - hz;
  const z1 = cz + hz;
  const pitch = box.pitch ?? 0;
  const jointY = box.jointY ?? cy;
  const jointZ = box.jointZ ?? cz;
  const tilt = (quad: number[], normal: Rgb): [number[], Rgb] => {
    if (pitch === 0) {
      return [quad, normal];
    }

    const spun: number[] = [];

    for (let i = 0; i < quad.length; i += 3) {
      const point = swing(quad[i], quad[i + 1], quad[i + 2], jointY, jointZ, pitch);
      spun.push(point[0], point[1], point[2]);
    }

    return [spun, swingNormal(normal, pitch)];
  };

  const top = tilt([x0, y1, z1, x1, y1, z1, x1, y1, z0, x0, y1, z0], [0, 1, 0]);
  const bottom = tilt([x0, y0, z0, x1, y0, z0, x1, y0, z1, x0, y0, z1], [0, -1, 0]);
  const right = tilt([x1, y0, z1, x1, y0, z0, x1, y1, z0, x1, y1, z1], [1, 0, 0]);
  const left = tilt([x0, y0, z0, x0, y0, z1, x0, y1, z1, x0, y1, z0], [-1, 0, 0]);
  const front = tilt([x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1], [0, 0, 1]);
  const back = tilt([x1, y0, z0, x0, y0, z0, x0, y1, z0, x1, y1, z0], [0, 0, -1]);

  pushFace(positions, colors, top[0], top[1], color);
  pushFace(positions, colors, bottom[0], bottom[1], color);
  pushFace(positions, colors, right[0], right[1], color);
  pushFace(positions, colors, left[0], left[1], color);
  pushFace(positions, colors, front[0], front[1], color);
  pushFace(positions, colors, back[0], back[1], color);
}

function swing(
  x: number,
  y: number,
  z: number,
  jointY: number,
  jointZ: number,
  pitch: number,
): [number, number, number] {
  const ly = y - jointY;
  const lz = z - jointZ;
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  return [x, jointY + ly * c - lz * s, jointZ - ly * s + lz * c];
}

function swingNormal(normal: Rgb, pitch: number): Rgb {
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  return [normal[0], normal[1] * c - normal[2] * s, -normal[1] * s + normal[2] * c];
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
