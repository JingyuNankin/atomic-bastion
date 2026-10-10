import type { OperativeModel } from '../operatives/catalog';
import { playerBoxes, type Box } from './player-model';
import { soldierBoxes } from './soldier-model';

export function operativeBoxes(model: OperativeModel): Box[] {
  if (model === 'soldier-1970') {
    return soldierBoxes();
  }

  return playerBoxes();
}
