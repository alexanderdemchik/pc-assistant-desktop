export enum ActionTypesEnum {
  SLEEP = 'SLEEP',
  SHUTDOWN = 'SHUTDOWN',
  RESTART = 'RESTART',
  MOUSE_MOVE = 'MOUSE_MOVE',
  MOUSE_BTN_DOWN = 'MOUSE_BTN_DOWN',
  MOUSE_BTN_UP = 'MOUSE_BTN_UP',
  MOUSE_DOUBLE_CLICK = 'MOUSE_DOUBLE_CLICK',
  KEY_BTN_DOWN = 'KEY_BTN_DOWN',
  KEY_BTN_UP = 'KEY_BTN_UP',
  NONE = 'None',
}

export interface Coords {
  x: number;
  y: number;
}

export interface ActionEvent<T extends ActionTypesEnum> {
  type: ActionTypesEnum;
  payload: ActionEventPayloadMap[T];
}

export interface ActionEventPayloadMap extends Record<ActionTypesEnum, any> {
  [ActionTypesEnum.MOUSE_MOVE]: Coords;
}
