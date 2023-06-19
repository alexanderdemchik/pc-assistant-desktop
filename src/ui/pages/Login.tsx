import { useContext, useEffect } from 'react';
import { YANDEX_CREDENTIALS } from '../../constants';
import { AppContext } from '../App';
import { Paper, styled } from '@mui/material';

const StyledLoginPage = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
});

function Login() {
    const { config, setShowLoader } = useContext(AppContext);
    useEffect(() => {
        setShowLoader(true);
        if (config.yandexClientId) {
            //@ts-ignore
            YaAuthSuggest.init(
                {
                    client_id: config.yandexClientId,
                    response_type: 'token',
                    redirect_uri: YANDEX_CREDENTIALS.REDIRECT_URI,
                },
                YANDEX_CREDENTIALS.REDIRECT_URI,
                {
                    view: 'button',
                    parentId: 'login-container',
                    buttonView: 'main',
                    buttonTheme: 'light',
                    buttonSize: 'm',
                    buttonBorderRadius: 0,
                }
                //@ts-ignore
            ).then(({ handler }) => {
                handler();
                setShowLoader(false);
            });
        }
    }, [config.yandexClientId]);

    return (
        <StyledLoginPage>
            <Paper sx={{ m: 2, p: 2, textAlign: 'center' }}>
                <p>Войдите с помощью аккаунта Яндекс для продолжения</p>
                <div id="login-container"></div>
            </Paper>
        </StyledLoginPage>
    );
}

export default Login;
