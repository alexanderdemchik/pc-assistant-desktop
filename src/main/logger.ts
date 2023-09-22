import winston from 'winston';
import 'winston-daily-rotate-file';
import chalk from 'chalk';

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
        `${info.timestamp} [${chalk.green(info.isRenderer ? 'renderer' : 'main')}]${
          info.prefix ? `[${chalk.green(info.prefix)}]` : ''
        }[${info.level}]: ${info.message}`
    )
  );

  return winston.format.combine(...formatters);
}

export function registerLogger(logLevel = 'debug', logsFileName?: string) {
  const options = {
    level: logLevel,
    format: winston.format.json(),
    transports: [],
  };

  if (process.env.NODE_ENV !== 'production') {
    options.transports.push(
      new winston.transports.Console({
        format: formatter(true),
      })
    );
  }

  if (logsFileName) {
    options.transports.push(
      new winston.transports.DailyRotateFile({
        filename: logsFileName,
        format: formatter(false),
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '20m',
        maxFiles: '14d',
      })
    );
  }

  logger = winston.createLogger(options);

  return logger;
}
