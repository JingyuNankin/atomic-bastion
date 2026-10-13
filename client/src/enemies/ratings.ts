import { PX_PER_UNIT } from '../game/units';
import type { EnemyDef } from './catalog';

export type RadarAxis = {
  label: string;
  value: number;
};

const HP_CAP = 100;
const SPEED_CAP = 20;
const DAMAGE_CAP = 40;
const RANGE_CAP = 24;
const TEMPO_CAP = 1.5;

export function rateEnemy(enemy: EnemyDef): RadarAxis[] {
  const speed = enemy.speed / PX_PER_UNIT;
  const reach = enemy.attack === 'melee' ? enemy.attackReach : 0;
  const range = (enemy.attackRange + reach) / PX_PER_UNIT;
  const cycle = enemy.attackInterval + (enemy.windup ?? 0);

  return [
    { label: '耐久', value: scale(enemy.hp, HP_CAP) },
    { label: '机动', value: scale(speed, SPEED_CAP) },
    { label: '杀伤', value: scale(enemy.damage, DAMAGE_CAP) },
    { label: '距离', value: scale(range, RANGE_CAP) },
    { label: '坚固', value: scale(enemy.knockbackResist, 1) },
    { label: '频率', value: scale(1 / Math.max(cycle, 0.05), TEMPO_CAP) },
  ];
}

function scale(value: number, cap: number): number {
  if (cap <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (value / cap) * 100));
}
