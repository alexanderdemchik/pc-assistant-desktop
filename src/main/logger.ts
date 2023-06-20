import { app, ipcMain } from 'electron';
import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import chalk from 'chalk';
import { getResourcesFolderPath } from './helpers';

export let logger: winston.Logger;

function formatter(isConsole: boolean) {
    const formatters = [];

    formatters.push(
        winston.format((info) => {
            info.level = info.level.toUpperCase();
            return info;
        })()
    );

    if (isConsole) formatters.push(winston.format.colorize({ level: true }));

    formatters.push(
        winston.format.splat(),
        winston.format.timestamp(),
        winston.format.printf(
            (info) =>
                `${info.timestamp} [${chalk.green(info.isRenderer ? 'renderer' : 'main')}][${info.level}]: ${
                    info.message
                }`
        )
    );

    return winston.format.combine(...formatters);
}

export async function initMainLogger(logLevel: string) {
    logger = winston.createLogger({
        level: logLevel ?? 'debug',
        format: winston.format.json(),
        transports: [
            new winston.transports.DailyRotateFile({
                filename: path.join(
                    getResourcesFolderPath(),
                    'logs',
                    'app-%DATE%.log'
                ),
                format: formatter(false),
                datePattern: 'YYYY-MM-DD-HH',
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(
            new winston.transports.Console({
                format: formatter(true),
            })
        );
    }

    ipcMain.on('log', (event, level: 'info' | 'error' | 'debug', ...args) => {
        // @ts-ignore
        logger[level](args, { isRenderer: 1 });
    });

    return logger;
}
