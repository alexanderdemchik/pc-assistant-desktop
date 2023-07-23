import { IConfig } from '../config';
import { Logger } from 'winston';

export interface ICommandsReceiverState {
    connected: boolean;
    error: Error;
}

export abstract class CommandsReceiver {
    protected connected: boolean = false;
    protected error: Error = null;

    constructor(
        protected config: IConfig,
        protected logger: Logger,
        protected errorHandler: (err: Error) => void,
        protected commandsHandler: (command: string) => void,
        protected stateChangeHandler: (state: ICommandsReceiverState) => void
    ) {}

    public abstract init(): Promise<void>;
    public abstract getState(): ICommandsReceiverState;
    public abstract updateConfig(config: IConfig): void;
}