import EventEmitter from 'events';

export enum EventsNamesEnum {
    TOKEN_RECEIVED = 'TOKEN_RECEIVED',
    TOKEN_RECEIVE_ERROR = 'TOKEN_RECEIVE_ERROR',
    AUTH_REQUIRED = 'AUTH_REQUIRED',
    CONNECTED = 'CONNECTED',
    DISCONNECTED = 'DISCONNECTED',
}

export let eventsManager = new EventEmitter();
