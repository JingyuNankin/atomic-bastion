import { mat4Multiply, mat4Ortho, mat4RotateX, mat4RotateY } from './math';
import { playerBoxes, type Box } from './player-model';
import { buildBoxMesh } from './player-mesh';

const VERTEX_SOURCE = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform mat4 u_mvp;
varying vec3 v_color;

void main() {
  gl_Position = u_mvp * vec4(a_position, 1.0);
  v_color = a_color;
}
`;

const FRAGMENT_SOURCE = `
precision mediump float;
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1.0);
}
`;

const ELEVATION = Math.PI / 4;

export type OrthoBounds = {
  left: number;
  right: number;
  bottom: number;
  top: number;
};

export const PLAYER_ORTHO: OrthoBounds = {
  left: -0.85,
  right: 0.85,
  bottom: -0.15,
  top: 1.65,
};

export type BoxGlRenderer = {
  render: (yaw: number, width: number, height: number) => HTMLCanvasElement;
  destroy: () => void;
};

export function createPlayerGlRenderer(): BoxGlRenderer {
  return createBoxGlRenderer(playerBoxes());
}

export function createBoxGlRenderer(
  boxes: Box[],
  ortho: OrthoBounds = PLAYER_ORTHO,
): BoxGlRenderer {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 80;
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: true,
    preserveDrawingBuffer: true,
    premultipliedAlpha: false,
  });

  if (!gl) {
    throw new Error('WebGL is not available');
  }

  const program = createProgram(gl, VERTEX_SOURCE, FRAGMENT_SOURCE);
  const mesh = buildBoxMesh(boxes);
  const position = gl.createBuffer();
  const color = gl.createBuffer();
  const vertexCount = mesh.positions.length / 3;

  if (!position || !color) {
    throw new Error('Failed to create WebGL buffers');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, position);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, color);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.colors, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'a_position');
  const aColor = gl.getAttribLocation(program, 'a_color');
  const uMvp = gl.getUniformLocation(program, 'u_mvp');

  return {
    render(yaw, width, height) {
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, position);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, color);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

      const projection = mat4Ortho(
        ortho.left,
        ortho.right,
        ortho.bottom,
        ortho.top,
        -8,
        8,
      );
      const view = mat4RotateX(ELEVATION);
      const model = mat4RotateY(yaw);
      const mvp = mat4Multiply(projection, mat4Multiply(view, model));
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

      return readFrame(gl, width, height);
    },
    destroy() {
      gl.deleteBuffer(position);
      gl.deleteBuffer(color);
      gl.deleteProgram(program);
    },
  };
}

function readFrame(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
): HTMLCanvasElement {
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  const frame = document.createElement('canvas');
  frame.width = width;
  frame.height = height;
  const context = frame.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available');
  }

  const image = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    const src = (height - 1 - y) * width * 4;
    image.data.set(pixels.subarray(src, src + width * 4), y * width * 4);
  }

  context.putImageData(image, 0, 0);
  return frame;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Failed to create WebGL program');
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'link failed';
    gl.deleteProgram(program);
    throw new Error(log);
  }

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return program;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Failed to create WebGL shader');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'compile failed';
    gl.deleteShader(shader);
    throw new Error(log);
  }

  return shader;
}
