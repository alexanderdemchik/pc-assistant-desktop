import winston from 'winston';

function formatter() {
  const formatters = [];

  formatters.push(
    winston.format((info) => {
      info.level = info.level.toUpperCase();
      return info;
    })()
  );

  formatters.push(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.prefix ? `[${info.prefix}]` : ''}[${info.level}]: ${info.message}`
    )
  );

  return winston.format.combine(...formatters);
}

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: formatter(),
    }),
  ],
});
