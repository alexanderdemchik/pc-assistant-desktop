export class AuthError extends Error {}
export interface Disposable {
  dispose(): void;
}

export interface IConfig {
  deviceId?: string;
  token?: string;
  yandexClientId?: string;
  serverUrl: string;
  appUserDataPath?: string;
  [key: string]: string;
}
