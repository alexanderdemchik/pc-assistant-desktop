export interface IMatcher {
  match(command: string): Promise<string>;
}

export enum DefaultCommandsEnum {
  SLEEP = 'SLEEP',
  SHUTDOWN = 'SHUTDOWN',
  RESTART = 'RESTART',
  MOUSE_MOVE = 'MOUSE_MOVE',
  MOUSE_CLICK = 'MOUSE_CLICK',
}
