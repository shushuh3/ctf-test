import pino, { type Logger } from 'pino';

const isDev = process.env['NODE_ENV'] === 'development';
const level = process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info');

export const logger: Logger = pino({
  level,
  base: { app: 'cft-audit-portal' },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss.l', singleLine: true },
        },
      }
    : {}),
});

export function childLogger(bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}
