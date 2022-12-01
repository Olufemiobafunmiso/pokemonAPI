import {createLogger, transports, format} from 'winston';

export const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(
        format.errors({
            stack: true
        }),
        format.timestamp(),
        format.json(),
    )

    }),

  ],
  format: format.combine(
    format.json(),
    format.prettyPrint(),
    format.timestamp(),
    format.errors({
      stack: true
    })
  ),
});


