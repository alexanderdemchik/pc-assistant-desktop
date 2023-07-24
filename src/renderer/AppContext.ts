import { createContext } from 'react';

export default createContext<{
  connection: {
    connected: boolean;
    authorized: boolean;
  };
  config: {
    yandexClientId: string;
  };
  setShowLoader: (v: boolean) => void;
}>(null);
