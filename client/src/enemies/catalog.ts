import catalog from '../../../docs/design/enemies.json';

export type EnemyId = string;
export type AttackKind = 'melee' | 'suicide';
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

const enemiesById = new Map(
  (catalog.enemies as EnemyDef[]).map((enemy) => [enemy.id, enemy]),
);

export function listEnemies(): EnemyDef[] {
  return (catalog.enemies as EnemyDef[]).filter((enemy) => enemy.enabled);
}

export function listDesignedEnemies(): EnemyDef[] {
  return catalog.enemies as EnemyDef[];
}

export function getEnemy(id: EnemyId): EnemyDef {
  const enemy = enemiesById.get(id);

  if (!enemy) {
    throw new Error(`Unknown enemy: ${id}`);
  }

  return enemy;
}
