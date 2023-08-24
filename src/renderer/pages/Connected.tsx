import { AppBar, Grid, Paper, Typography, styled } from '@mui/material';
import { useContext } from 'react';
import AppContext from '../AppContext';
import { Check, Close, ExitToApp } from '@mui/icons-material';

const StyledConnectedPage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  '.header': {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  '.connected': {
    display: 'block',
    width: 10,
    height: 10,
    marginRight: 4,
    borderRadius: '50%',
    background: 'green',
  },
  '.disconnected': {
    display: 'block',
    width: 10,
    height: 10,
    marginRight: 4,
    borderRadius: '50%',
    background: 'red',
  },
  '.status-info-wrapper': {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  '.commands-log-wrapper': {
    maxHeight: 'calc(100vh - 260px)',
    overflow: 'auto',
    overflowX: 'clip',
  },
  '.commands-log': {
    padding: 20,
    background: '#000',
    color: '#fff',
    position: 'relative',
    '& .log-success': {
      fill: 'green',
    },
    '& .log-error': {
      fill: 'red',
    },
    '& p': {
      fontFamily: 'arial, "lucida console", sans-serif',
      display: 'flex',
      alignItems: 'center',
    },
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    '& > div': {
      padding: '5px 20px',
    },
  },
  section: {
    margin: 20,
  },
});

function ConnectedPage(): JSX.Element {
  const { connection, appInfo, config, commandsLog } = useContext(AppContext);

  return (
    <StyledConnectedPage>
      <AppBar className="header" position="static">
        <div className="status-info-wrapper">
          <span className={connection.connected ? 'connected' : 'disconnected'} />
          {connection.connected ? 'Подключено' : 'Отключено'}
        </div>
        <span>
          <ExitToApp />
        </span>
      </AppBar>

      <section>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography variant="body2">ID Устройства: {config.deviceId}</Typography>
          </Grid>
        </Grid>
      </section>

      <section style={{ position: 'relative' }}>
        Логи:
        <div className="commands-log-wrapper">
          <Grid container direction={'column'} className="commands-log">
            <Grid item>
              <Typography variant="body2">
                Здесь отображены последние 100 комманд отправленные на это устройство...
              </Typography>
            </Grid>
            {commandsLog.map(({ command, executed, datetime }) => (
              <Grid item key={datetime.getTime()}>
                <Typography variant="body2">
                  [{datetime.toISOString()}]: {command}{' '}
                  {executed ? <Check className="log-success" /> : <Close className="log-error" />}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </div>
      </section>

      <footer>
        <Paper>
          <Typography variant="caption">{`${appInfo.name} v${appInfo.version}`}</Typography>
        </Paper>
      </footer>
    </StyledConnectedPage>
  );
}

export default ConnectedPage;
