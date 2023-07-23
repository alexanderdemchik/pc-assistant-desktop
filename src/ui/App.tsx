import { createContext, useEffect, useState } from 'react';
import Login from './pages/Login';
import logger from './logger';
import Loader from './components/Loader';
import { CssBaseline, ThemeProvider, createTheme, styled } from '@mui/material';
import { theme } from './theme';
import ConnectedPage from './pages/Connected';
import { IpcEventNamesEnum } from '../types/ipcEventsNames.enum';
import { eventsManager, getConfig, getConnectionStatus } from './api';

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

export const AppContext = createContext<{
    connection: {
        connected: boolean;
        authorized: boolean;
    };
    config: {
        yandexClientId: string;
    };
    setShowLoader: (v: boolean) => void;
}>(null);

function App() {
    const [showLoader, setShowLoader] = useState(false);
    const [connection, setConnection] = useState(null);
    const [config, setConfig] = useState({ yandexClientId: '' });

    useEffect(() => {
        eventsManager.on(IpcEventNamesEnum.CONNECTED, () => {
            logger.debug('[APP] onConnected');
            setConnection({ connected: true, authorized: true });
        });

        eventsManager.on(IpcEventNamesEnum.AUTH_REQUIRED, () => {
            logger.debug('[APP] onRequireAuth');
            setConnection({ connected: false, authorized: false });
        });

        eventsManager.on(IpcEventNamesEnum.AUTH_SUCCESS, () => {
            setConnection({ ...connection, authorized: true });
        });

        getConnectionStatus().then((result: any) => {
            setConnection(result);
        });
        getConfig().then((result: any) => {
            setConfig(result);
        });
    }, []);

    const isLoading = !connection || (connection.authorized && !connection.connected);

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
            <AppContext.Provider value={{ connection, config, setShowLoader }}>
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
