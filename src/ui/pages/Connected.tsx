import { Paper, Typography, styled } from '@mui/material';
import React from 'react';

const StyledConnectedPage = styled('div')({
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

function ConnectedPage() {
    return (
        <StyledConnectedPage>
            <Paper sx={{ m: 2, p: 2 }}>
                <Typography variant="body2">Вы успешно авторизировались! Теперь можете закрыть это окно, приложение продолжит работать в фоне</Typography>
            </Paper>
        </StyledConnectedPage>
    );
}

export default ConnectedPage;
