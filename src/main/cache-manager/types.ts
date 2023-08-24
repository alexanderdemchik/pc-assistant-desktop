export interface ICacheCommandLogEntry {
  datetime: Date;
  command: string;
  executed: boolean;
}

export interface ICache {
  commandsLog?: Array<ICacheCommandLogEntry>;
}
