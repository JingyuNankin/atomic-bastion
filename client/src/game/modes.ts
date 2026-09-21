export type GameModeId = 'survival' | 'defense' | 'collect';

export type GameMode = {
  id: GameModeId;
  name: string;
  summary: string;
  available: boolean;
};

export const GAME_MODES: readonly GameMode[] = [
  {
    id: 'survival',
    name: '生存模式',
    summary: '敌人源源不断涌来，比谁能撑过更多轮次，保住自己的命。',
    available: true,
  },
  {
    id: 'defense',
    name: '保卫模式',
    summary: '保卫家园。据点防守，类似塔防与无尽生存。',
    available: false,
  },
  {
    id: 'collect',
    name: '收集模式',
    summary: '在迷宫中收集钥匙等目标即可通关。',
    available: false,
  },
];
