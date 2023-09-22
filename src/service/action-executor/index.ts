import path from 'path';
import { actionHandler } from '../../common/action-handler';
import serviceManager from '../../common/service-manager';
import { logger, registerLogger } from '../../main/logger';
import { spawn } from 'child_process';
import { openInputDesktop } from 'native_lib';
import { ServiceClientIdEnum } from '../../common/service-manager/types';
import { DESKTOP_CHANGE_LISTENER_APP_NAME } from '../../common/constants/appNames';

registerLogger(undefined, 'logs/action-executor');

const execFolder = process.execPath.split(path.sep).slice(0, -1).join(path.sep);

async function main() {
  try {
    serviceManager.subscribe(actionHandler);
    await serviceManager.init(ServiceClientIdEnum.DESKTOP_ACTIONS_MANAGER);

    const cp = spawn(path.resolve(execFolder, DESKTOP_CHANGE_LISTENER_APP_NAME + '.exe'));

    cp.stdout.on('data', () => {
      openInputDesktop();
    });
  } catch (e) {
    logger.error('%o', e);
  }
}

main();
