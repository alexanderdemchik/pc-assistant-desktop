import { distance } from 'fastest-levenshtein';
import { restart } from './restart';
import { shutdown } from './shutdown';
import { sleep } from './sleep';
import { logger } from '../logger';

enum DefaultCommandsEnum {
  SLEEP = 'SLEEP',
  SHUTDOWN = 'SHUTDOWN',
  RESTART = 'RESTART',
}

const defaultCommandsList = [
  {
    name: DefaultCommandsEnum.SHUTDOWN,
    commands: ['выключи', 'выключи компьютер'],
    handler: shutdown,
  },
  {
    name: DefaultCommandsEnum.RESTART,
    commands: ['перезагрузи', 'рестарт'],
    handler: restart,
  },
  {
    name: DefaultCommandsEnum.SLEEP,
    commands: ['переведи в спящий режим', 'переведи в сон', 'сон'],
    handler: sleep,
  },
];

export function handleCommand(command: string) {
  logger.debug('handle command %s', command);
  let minDistance = Number.MAX_VALUE;
  let minDistanceEntry: (typeof defaultCommandsList)[0];

  for (const entry of defaultCommandsList) {
    const dist = Math.min(...entry.commands.map((com) => distance(command, com)));

    if (dist < minDistance) {
      minDistance = dist;
      minDistanceEntry = entry;
    }
  }

  minDistanceEntry.handler();
}
