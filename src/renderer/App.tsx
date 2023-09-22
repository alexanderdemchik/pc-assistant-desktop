import { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, styled } from '@mui/material';
import logger from './logger';
import Loader from './components/Loader';
import { theme } from './theme';
import ConnectedPage from './pages/Connected';
import { IpcEventNamesEnum } from '../common/types/ipcEventsNames.enum';
import { eventsManager, getAppInfo, getCommandsLog, getConfig, getConnectionStatus } from './api';
import AppContext from './AppContext';
import Login from './pages/Login';
import { IConnectionState } from '../common/types/IConnectionState';
import { IConfig } from '../main/common/types';
import { IAppInfo } from '../common/types/IAppInfo';
import { ICacheCommandLogEntry } from '../common/cache-manager/types';

const StyledLoaderWrapper = styled('div')(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme.palette.background.default,
}));

function App(): JSX.Element {
  const [showLoader, setShowLoader] = useState(false);
  const [connection, setConnection] = useState<IConnectionState>(null);
  const [config, setConfig] = useState({ yandexClientId: '' } as IConfig);
  const [appInfo, setAppInfo] = useState<IAppInfo>({ version: '', name: '' });
  const [commandsLog, setCommandsLog] = useState<ICacheCommandLogEntry[]>([]);

  useEffect(() => {
    eventsManager.on(IpcEventNamesEnum.STATE_CHANGE, (e, data: IConnectionState) => {
      logger.debug('[APP] onConnected');
      setConnection(data);
    });

    eventsManager.on(IpcEventNamesEnum.COMMANDS_LOG_CHANGE, (e, data: ICacheCommandLogEntry[]) => {
      setCommandsLog(data);
    });

    getConnectionStatus().then((result: any) => {
      setConnection(result);
    });

    getConfig().then((result: IConfig) => {
      setConfig(result);
    });

    getAppInfo().then((result: IAppInfo) => {
      setAppInfo(result);
    });

    getCommandsLog().then((result: ICacheCommandLogEntry[]) => setCommandsLog(result));
  }, []);

  const isLoading = connection?.loading;

  const render = () => {
    if (connection) {
      if (!connection.authorized) {
        return <Login />;
      }

      return <ConnectedPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContext.Provider value={{ connection, config, appInfo, setShowLoader, commandsLog }}>
        <CssBaseline enableColorScheme />
        {(showLoader || isLoading) && (
          <StyledLoaderWrapper>
            <Loader />
          </StyledLoaderWrapper>
        )}
        {render()}
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export default App;
