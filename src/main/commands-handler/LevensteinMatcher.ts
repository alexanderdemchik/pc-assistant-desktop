import { DefaultCommandsEnum, IMatcher } from './types';
import { distance } from 'fastest-levenshtein';

const commandsMatchersMap = {
  [DefaultCommandsEnum.SHUTDOWN]: ['выключи', 'выключи компьютер'],
  [DefaultCommandsEnum.RESTART]: ['перезагрузи', 'рестарт'],
  [DefaultCommandsEnum.SLEEP]: ['переведи в спящий режим', 'переведи в сон', 'сон'],
};

export class LevensteinMatcher implements IMatcher {
  match(command: string): string {
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
