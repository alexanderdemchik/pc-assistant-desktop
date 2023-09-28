import { logger } from '../../main/logger';
import { ActionEventPayloadMap, ActionTypesEnum } from './actionTypes';
import * as mouse from './mouse';
import { restart } from './restart';
import { shutdown } from './shutdown';
import { sleep } from './sleep';

export const actionHandler = async (type: ActionTypesEnum, payload: ActionEventPayloadMap[ActionTypesEnum]) => {
  logger.info(`Hadle action ${type} with payload %o`, payload);
  const handlers = {
    [ActionTypesEnum.MOUSE_MOVE]: (payload: ActionEventPayloadMap[ActionTypesEnum.MOUSE_MOVE]) => {
      if (payload.coords) {
        mouse.move(payload.coords);
      } else {
        mouse.moveWithDirection(payload.direction, payload.distance);
      }
    },
    [ActionTypesEnum.SLEEP]: () => {
      sleep();
    },
    [ActionTypesEnum.SHUTDOWN]: () => {
      shutdown();
    },
    [ActionTypesEnum.RESTART]: () => {
      restart();
    },
  };

  try {
    await handlers[type](payload);
  } catch (e) {
    logger.error('%o', e);
  }
};
