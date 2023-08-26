export interface IMatcher {
  match(command: string): string;
}

export enum DefaultCommandsEnum {
  SLEEP = 'SLEEP',
  SHUTDOWN = 'SHUTDOWN',
  RESTART = 'RESTART',
  NONE = 'NONE',
}
