import { AuthError } from '../common/types';
import { config } from '../config';
import { EventsNamesEnum, eventsManager } from '../events';
import { logger } from '../logger';
import { CommandsReceiver, ICommandsReceiverState } from './CommandsReceiver';
import { ServiceCommandsReceiver } from './ServiceCommandsReceiver';
import { WsCommandsReceiver } from './WsCommandsReceiver';

export let remoteCommandsReceiver: CommandsReceiver;

const errorHandler = (err: Error) => {
  if (err instanceof AuthError) {
    eventsManager.emit(EventsNamesEnum.AUTH_REQUIRED);
  }
};

const commandsHandler = (command: string) => {
  console.log(command);
};

const stateChangeHandler = ({ connected }: ICommandsReceiverState) => {
  if (connected) {
    eventsManager.emit(EventsNamesEnum.CONNECTED);
  } else {
    eventsManager.emit(EventsNamesEnum.DISCONNECTED);
  }
};

export async function setupRemoteCommandsReceiver() {
  eventsManager.on(EventsNamesEnum.TOKEN_RECEIVED, () => {
    remoteCommandsReceiver.updateConfig(config);
  });
  remoteCommandsReceiver = new ServiceCommandsReceiver(
    config,
    logger,
    errorHandler,
    commandsHandler,
    stateChangeHandler
  );

  try {
    await remoteCommandsReceiver.init();
  } catch (error) {
    remoteCommandsReceiver = new WsCommandsReceiver(
      { ...config },
      logger,
      errorHandler,
      commandsHandler,
      stateChangeHandler
    );

    remoteCommandsReceiver.init();
  }
}
