import { handleCommand } from '../commands-handler';
import { AuthError } from '../common/types';
import { config } from '../config';
import { EventsNamesEnum, eventsManager } from '../events';
import { logger } from '../logger';
import { CommandsReceiver } from './CommandsReceiver';
import { ServiceCommandsReceiver } from './ServiceCommandsReceiver';
import { WsCommandsReceiver } from './WsCommandsReceiver';

export let remoteCommandsReceiver: CommandsReceiver;

const errorHandler = (err: Error) => {
  if (err instanceof AuthError) {
    eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
  }
};

const serviceErrorHandler = (err: Error) => {
  if (err instanceof AuthError) {
    eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
  } else {
    logger.debug('Service error %o', err);
    remoteCommandsReceiver.dispose();
    remoteCommandsReceiver = new WsCommandsReceiver(
      { ...config },
      logger,
      errorHandler,
      commandsHandler,
      stateChangeHandler
    );
    remoteCommandsReceiver.init();
  }
};

const commandsHandler = (command: string) => {
  handleCommand(command);
};

const stateChangeHandler = () => {
  eventsManager.emit(EventsNamesEnum.REMOTE_COMMANDS_RECEIVER_STATE_CHANGE);
};

export async function setupRemoteCommandsReceiver() {
  eventsManager.on(EventsNamesEnum.TOKEN_RECEIVED, () => {
    remoteCommandsReceiver.updateConfig(config);
  });
  remoteCommandsReceiver = new ServiceCommandsReceiver(
    config,
    logger,
    serviceErrorHandler,
    commandsHandler,
    stateChangeHandler
  );

  try {
    await remoteCommandsReceiver.init();
  } catch (error) {
    remoteCommandsReceiver.dispose();
    remoteCommandsReceiver = new WsCommandsReceiver(
      { ...config },
      logger,
      errorHandler,
      commandsHandler,
      stateChangeHandler
    );

    remoteCommandsReceiver.init();
  }

  stateChangeHandler();
}
