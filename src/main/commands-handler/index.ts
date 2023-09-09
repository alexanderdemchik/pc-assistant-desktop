import { restart } from './restart';
import { shutdown } from './shutdown';
import { sleep } from './sleep';
import { logger } from '../logger';
import * as cacheManager from '../cache-manager';
import * as windowManager from '../window';
import { IpcEventNamesEnum } from '../../common/types/ipcEventsNames.enum';
import { ICacheCommandLogEntry } from '../cache-manager/types';
import { DefaultCommandsEnum } from './types';
import { NlpMatcher } from './NlpMatcher';

export const defaultCommandsHandlers = [
  {
    name: DefaultCommandsEnum.SHUTDOWN,
    handler: shutdown,
  },
  {
    name: DefaultCommandsEnum.RESTART,
    handler: restart,
  },
  {
    name: DefaultCommandsEnum.SLEEP,
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

const matcher = new NlpMatcher();

export async function handleCommand(command: string) {
  logger.debug('handle command %s', command);

  const matchedCommand = await matcher.match(command);

  if (matchedCommand) {
    defaultCommandsHandlers.find(({ name }) => name === matchedCommand).handler();

    addCommandToLog(command, true);
  } else {
    addCommandToLog(command, false);
  }
}
