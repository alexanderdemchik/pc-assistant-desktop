import { createContext, useEffect, useState } from 'react';
import Login from './pages/Login';
import logger from './logger';
import Loader from './components/Loader';
import { CssBaseline, ThemeProvider, createTheme, styled } from '@mui/material';
import { theme } from './theme';
import ConnectedPage from './pages/Connected';

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
        loading: boolean;
        connected: boolean;
    };
    config: {
        yandexClientId: string;
    };
    setShowLoader: (v: boolean) => void;
}>(null);

function App() {
    const [showLoader, setShowLoader] = useState(false);
    const [connection, setConnection] = useState({
        loading: true,
        connected: false,
    });
    const [config, setConfig] = useState({ yandexClientId: '' });

    useEffect(() => {
        API.onConnected(() => {
            logger.debug('[APP] onConnected');
            setConnection({ loading: false, connected: true });
        });

        API.onRequireAuth(() => {
            logger.debug('[APP] onRequireAuth');
            setConnection({ loading: false, connected: false });
        });

        (() => {
            API.getConnectionStatus().then((result: any) => {
                setConnection(result);
            });
            API.getConfig().then((result: any) => {
                setConfig(result);
            });
        })();
    }, []);

    const render = () => {
        if (!connection.connected) {
            return <Login />;
        }

        return <ConnectedPage />;
    };

    return (
        <ThemeProvider theme={theme}>
            <AppContext.Provider value={{ connection, config, setShowLoader }}>
                <CssBaseline enableColorScheme />
                {(showLoader || connection.loading) && (
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
