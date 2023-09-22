export interface IMatcher {
  match(command: string): Promise<string>;
}
