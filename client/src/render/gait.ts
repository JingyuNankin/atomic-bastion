import type { Box, Limb } from './player-model';

export const WALK_POSES = ['stand', 'left', 'right'] as const;

export type WalkPose = (typeof WALK_POSES)[number];

/** 绕髋部的转角，弧度。迈左、迈右各自写，不由另一侧翻出来。 */
const LEFT_STEP: Partial<Record<Limb, number>> = {
  'left-leg': 0.72,
  'right-leg': -0.58,
  'front-left': 0.36,
  'hind-right': 0.32,
  'front-right': -0.3,
  'hind-left': -0.28,
};

const RIGHT_STEP: Partial<Record<Limb, number>> = {
  'left-leg': -0.58,
  'right-leg': 0.72,
  'front-right': 0.34,
  'hind-left': 0.3,
  'front-left': -0.28,
  'hind-right': -0.32,
};

export function poseBoxes(boxes: Box[], pose: WalkPose): Box[] {
  if (pose === 'stand') {
    return boxes;
  }

  const pitch = pose === 'left' ? LEFT_STEP : RIGHT_STEP;
  const joints = new Map<Limb, { y: number; z: number }>();

  return boxes.map((box) => {
    const angle = box.limb ? pitch[box.limb] : undefined;

    if (!box.limb || angle === undefined) {
      return box;
    }

    let joint = joints.get(box.limb);

    if (!joint) {
      joint = limbJoint(boxes, box.limb);
      joints.set(box.limb, joint);
    }

    return {
      ...box,
      pitch: (box.pitch ?? 0) + angle,
      jointY: joint.y,
      jointZ: joint.z,
    };
  });
}

function limbJoint(boxes: Box[], limb: Limb): { y: number; z: number } {
  let y = 0;
  let z = 0;
  let found = false;

  for (const box of boxes) {
    if (box.limb !== limb) {
      continue;
    }

    const top = box.cy + box.hy;

    if (!found || top > y) {
      y = top;
      z = box.cz;
      found = true;
    }
  }

  return { y, z };
}
