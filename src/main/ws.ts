import { config } from './config';
import io from 'socket.io-client';
import { logger } from './logger';
import { eventsManager } from './events';
import { EventsNamesEnum } from '../types/eventsNames.enum';
import { restart, shutdown, sleep } from './pc-helpers';

export let isConnected = false;
export let isConnecting = false;

export function init() {
    const socket = io(`${config.serverUrl}`, {
        path: '/ws',
        query: { deviceId: config.deviceId },
        auth: {
            token: config.token,
        },
        transports: ['websocket'],
    }).connect();

    socket.on('connect', () => {
        logger.info('WS Connected');

        isConnected = true;
        isConnecting = false;

        eventsManager.emit(EventsNamesEnum.WS_CONNECTED);
    });

    socket.on('connect_error', (e) => {
        logger.info('WS Connect Error %o', e);

        isConnecting = false;

        eventsManager.emit(EventsNamesEnum.WS_CONNECT_ERROR);
    });

    socket.on('message', (message) => {
        if (message.command) {
            handleCommand(message.command);
        }
    });
}

function handleCommand(command: string) {
    logger.debug(command);
    if (command.includes('выключи')) {
        shutdown();
        return;
    }

    if (command.includes('перезагрузи')) {
        restart();
        return;
    }

    if (command.includes('переведи в спящий режим')) {
        sleep();
        return;
    }
}
