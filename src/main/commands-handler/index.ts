import { distance } from 'fastest-levenshtein';
import { restart } from './restart';
import { shutdown } from './shutdown';
import { sleep } from './sleep';
import { logger } from '../logger';
import * as cacheManager from '../cache-manager';
import * as windowManager from '../window';
import { IpcEventNamesEnum } from '../../common/types/ipcEventsNames.enum';
import { ICacheCommandLogEntry } from '../cache-manager/types';

enum DefaultCommandsEnum {
  SLEEP = 'SLEEP',
  SHUTDOWN = 'SHUTDOWN',
  RESTART = 'RESTART',
}

const COMMAND_DISTANCE_ACCEPT_VALUE = 10;

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

async function addCommandToLog(command: string, executed: boolean) {
  const newLogEntry: ICacheCommandLogEntry = {
    datetime: new Date(),
    command,
    executed,
  };

  const newCommandLog = [...(await cacheManager.get('commandsLog')), newLogEntry];

  windowManager.emit(IpcEventNamesEnum.COMMANDS_LOG_CHANGE, newCommandLog);

  return await cacheManager.set('commandsLog', newCommandLog);
}

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

  if (minDistance < COMMAND_DISTANCE_ACCEPT_VALUE) {
    minDistanceEntry.handler();

    addCommandToLog(command, true);
  } else {
    addCommandToLog(command, false);
  }
}
