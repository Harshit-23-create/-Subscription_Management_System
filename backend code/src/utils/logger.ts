export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[\x1b[34mINFO\x1b[0m] [${new Date().toISOString()}] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[\x1b[33mWARN\x1b[0m] [${new Date().toISOString()}] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[\x1b[31mERROR\x1b[0m] [${new Date().toISOString()}] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[\x1b[35mDEBUG\x1b[0m] [${new Date().toISOString()}] ${message}`, ...args);
    }
  },
};

