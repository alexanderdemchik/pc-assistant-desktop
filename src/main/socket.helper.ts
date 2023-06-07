import { SERVER_URL } from '../constants';
import { getConfig } from './config.helper';
import io from 'socket.io-client';
import cp from 'child_process';

export async function initSocketConnection(token: string) {
    const socket = io(`${SERVER_URL}`, {
        path: '/ws',
        query: { deviceId: (await getConfig()).deviceId, token },
        transports: ['websocket'],
    }).connect();

    socket.on('connect', () => {
        console.log('connect');
    });

    socket.on('error', (e) => {
        console.log(e); // displayed ?
    });

    socket.on('command', (body) => {
        const { name } = body;

        if (name === 'shutdown') {
            switch (process.platform) {
                case 'win32':
                    return cp.execSync('shutdown /s /t 1');
                case 'darwin':
                    return cp.execSync('shutdown -h now');
                case 'linux':
                    return cp.execSync('shutdown -P now');
            }
        }
    });
}
