export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export class ConsoleLogger implements ILogger {
  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(`[DEBUG] [${new Date().toISOString()}] ${message}`, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.info(`[INFO] [${new Date().toISOString()}] ${message}`, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(`[WARN] [${new Date().toISOString()}] ${message}`, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    console.error(`[ERROR] [${new Date().toISOString()}] ${message}`, meta);
  }
} 