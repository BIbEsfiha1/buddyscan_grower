export const debugLog = (...args: unknown[]) => {
  if (process.env.DEBUG === 'true') {
    console.log(...args);
  }
};
