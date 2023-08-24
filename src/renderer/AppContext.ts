import { createContext } from 'react';
import { IConfig } from '../main/common/types';
import { IAppInfo } from '../common/types/IAppInfo';
import { IConnectionState } from '../common/types/IConnectionState';
import { ICacheCommandLogEntry } from '../main/cache-manager/types';

export default createContext<{
  connection: IConnectionState;
  config: IConfig;
  appInfo: IAppInfo;
  commandsLog: ICacheCommandLogEntry[];
  setShowLoader: (v: boolean) => void;
}>(null);
