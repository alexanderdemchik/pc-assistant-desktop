import { ActionEventPayloadMap, ActionTypesEnum } from './actionTypes';
import * as mouse from './mouse';
import { restart } from './restart';
import { shutdown } from './shutdown';
import { sleep } from './sleep';

export const actionHandler = (type: ActionTypesEnum, payload: ActionEventPayloadMap[ActionTypesEnum]) => {
  const handlers = {
    [ActionTypesEnum.MOUSE_MOVE]: (payload: ActionEventPayloadMap[ActionTypesEnum.MOUSE_MOVE]) => {
      mouse.move(payload);
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

  handlers[type](payload);
};
