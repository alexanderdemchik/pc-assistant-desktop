import { config } from './config';
import io, { Socket } from 'socket.io-client';
import { logger } from './logger';
import { eventsManager } from './events';
import { EventsNamesEnum } from '../types/eventsNames.enum';
import { restart, shutdown, sleep } from './pc-helpers';

export let isConnected = false;
export let isConnecting = false;
export let error: Error;
export let isErrorShown = true;

let socket: Socket = null;

export function init() {
    socket = io(`${config.serverUrl}`, {
        path: '/ws',
        query: { deviceId: config.deviceId },
        auth: {
            token: config.token,
        },
        transports: ['websocket'],
    }).connect();

    isConnecting = true;

    socket.on('connect', () => {
        logger.info('WS Connected');

        isConnected = true;
        isConnecting = false;
        isErrorShown = true;
        error = null;

        eventsManager.emit(EventsNamesEnum.WS_CONNECTED);
    });

    socket.on('connect_error', (e) => {
        logger.info('WS Connect Error %o', e);

        error = e;
        isConnecting = false;
        isErrorShown = false;

        eventsManager.emit(EventsNamesEnum.WS_CONNECT_ERROR, e);
    });

    socket.on('message', (message) => {
        if (message.command) {
            handleCommand(message.command);
        }
    });
}

export function destroy() {
    socket?.close();
    isConnected = false;
    isConnecting = false;
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
