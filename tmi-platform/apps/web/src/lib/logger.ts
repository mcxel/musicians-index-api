// Lightweight logger wrapper to satisfy ESLint no-console rule
export const logger = {
  log: (...args: unknown[]) => {
    // Forward to console; can be swapped for a remote logger later
    // eslint-disable-next-line no-console
    (console.log as unknown as (...a: unknown[]) => void)(...args);
  },
  info: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    (console.info as unknown as (...a: unknown[]) => void)(...args);
  },
  warn: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    (console.warn as unknown as (...a: unknown[]) => void)(...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    (console.error as unknown as (...a: unknown[]) => void)(...args);
  },
  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      (console.debug as unknown as (...a: unknown[]) => void)(...args);
    }
  },
};

export default logger;
