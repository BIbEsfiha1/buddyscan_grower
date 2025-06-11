const isLoggingEnabled = import.meta.env.MODE !== 'production';

export const logger = {
  log: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isLoggingEnabled) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  }
};

export default logger;
