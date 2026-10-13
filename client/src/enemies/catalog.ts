import catalog from '../../../docs/design/enemies.json';
import { px } from '../game/units';

export type EnemyId = string;
export type AttackKind = 'melee' | 'suicide' | 'ranged';
export type Locomotion = 'ground' | 'air';
export type EnemyTier = '杂兵' | '射手' | '坦克';

export type EnemyDef = {
  id: EnemyId;
  name: string;
  nameEn: string;
  code: string;
  role: string;
  blurb: string;
  enabled: boolean;
  tier: EnemyTier;
  locomotion: Locomotion;
  hp: number;
  speed: number;
  cruiseSpeed: number;
  attack: AttackKind;
  attackName: string;
  damage: number;
  attackRange: number;
  attackReach: number;
  attackInterval: number;
  /** 远程攻击出手前的预警时间，秒。 */
  windup?: number;
  attackKnockback: number;
  blastRadius: number;
  knockbackResist: number;
  hitRadius: number;
  hitLift: number;
  bodyRadius: number;
};

export type EnemyCatalog = {
  version: number;
  enemies: EnemyDef[];
};

const WORLD_LENGTHS = [
  'speed',
  'cruiseSpeed',
  'attackRange',
  'attackReach',
  'attackKnockback',
  'blastRadius',
  'hitRadius',
  'hitLift',
  'bodyRadius',
] as const satisfies readonly (keyof EnemyDef)[];

function toPixels(enemy: EnemyDef): EnemyDef {
  const next = { ...enemy };

  for (const key of WORLD_LENGTHS) {
    next[key] = px(enemy[key]);
  }

  return next;
}

const enemies = (catalog.enemies as EnemyDef[]).map(toPixels);

const enemiesById = new Map(enemies.map((enemy) => [enemy.id, enemy]));

export function listEnemies(): EnemyDef[] {
  return enemies.filter((enemy) => enemy.enabled);
}

export function listDesignedEnemies(): EnemyDef[] {
  return enemies;
}

export function getEnemy(id: EnemyId): EnemyDef {
  const enemy = enemiesById.get(id);

  if (!enemy) {
    throw new Error(`Unknown enemy: ${id}`);
  }

  return enemy;
}
