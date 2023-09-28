import path from 'path';
import { actionHandler } from '../../common/action-handler';
import serviceManager from '../../common/service-manager';
import { logger, registerLogger } from '../../main/logger';
import { spawn } from 'child_process';
import { openInputDesktop } from 'native_lib';
import { ServiceClientIdEnum } from '../../common/service-manager/types';
import { DESKTOP_CHANGE_LISTENER_APP_NAME } from '../../common/constants/appNames';
import { ServiceMessageTypeEnum } from '../../common/service-manager/ServiceManager';
import { ActionTypesEnum } from '../../common/action-handler/actionTypes';

registerLogger(undefined, 'logs/action-executor-%DATE%.log');

const execFolder = process.execPath.split(path.sep).slice(0, -1).join(path.sep);

const serviceMessages = Object.values(ServiceMessageTypeEnum);

function isServiceMessage(type: ServiceMessageTypeEnum | ActionTypesEnum): type is ServiceMessageTypeEnum {
  return serviceMessages.includes(type as ServiceMessageTypeEnum);
}

function serviceMessageHandler(type: ServiceMessageTypeEnum | ActionTypesEnum, payload: any) {
  if (isServiceMessage(type)) {
    switch (type) {
      case ServiceMessageTypeEnum.CONFIG:
        break;
    }
    return;
  }

  return actionHandler(type, payload);
}

async function main() {
  try {
    serviceManager.subscribe(serviceMessageHandler);
    await serviceManager.init(ServiceClientIdEnum.DESKTOP_ACTIONS_MANAGER);

    const cp = spawn(path.resolve(execFolder, DESKTOP_CHANGE_LISTENER_APP_NAME + '.exe'));

    cp.stdout.on('data', () => {
      openInputDesktop();
    });

    openInputDesktop();
  } catch (e) {
    logger.error('%o', e);
  }
}

main();
