import { ActionTypesEnum } from '../action-handler/actionTypes';
import { IMatcher } from './types';
import { distance } from 'fastest-levenshtein';

const commandsMatchersMap = {
  [ActionTypesEnum.SHUTDOWN]: ['выключи', 'выключи компьютер'],
  [ActionTypesEnum.RESTART]: ['перезагрузи', 'рестарт'],
  [ActionTypesEnum.SLEEP]: ['переведи в спящий режим', 'переведи в сон', 'сон'],
};

export class LevensteinMatcher implements IMatcher {
  async match(command: string): Promise<string> {
    let minDistance = Number.MAX_VALUE;
    let minDistanceCommand: string;

    for (const commandId of Object.keys(commandsMatchersMap)) {
      const dist = Math.min(...commandsMatchersMap[commandId].map((com: string) => distance(command, com)));

      if (dist < minDistance) {
        minDistance = dist;
        minDistanceCommand = commandId;
      }
    }

    if (minDistance < command.length * 0.7) {
      return minDistanceCommand;
    }

    return null;
  }
}
