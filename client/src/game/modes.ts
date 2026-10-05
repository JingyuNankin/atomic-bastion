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
    summary: '闸工渗透铁脉隔离区，对抗脱离主控制域的自动化单元，比谁能撑过更多轮次。',
    available: true,
  },
  {
    id: 'defense',
    name: '保卫模式',
    summary: '守住核心主机舱或隔离闸门。据点防守，类似塔防与无尽生存。',
    available: false,
  },
  {
    id: 'collect',
    name: '收集模式',
    summary: '在堡垒内回收实验记录或密级钥匙即可通关。',
    available: false,
  },
];
