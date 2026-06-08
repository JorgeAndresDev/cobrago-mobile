const LOG_LEVELS = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  SYNC: "SYNC"
};

export const logger = {
  info: (message: string, data?: any) => logger.log(LOG_LEVELS.INFO, message, data),
  warn: (message: string, data?: any) => logger.log(LOG_LEVELS.WARN, message, data),
  error: (message: string, data?: any) => logger.log(LOG_LEVELS.ERROR, message, data),
  sync: (message: string, data?: any) => logger.log(LOG_LEVELS.SYNC, message, data),

  log: (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const dataString = data ? ` | Data: ${JSON.stringify(data)}` : "";
    console.log(`[${timestamp}] [${level}] ${message}${dataString}`);
  }
};

export const errorHandler = {
  handle: (error: any, context: string) => {
    const message = error?.response?.data?.detail || error?.message || "Error desconocido";
    logger.error(`Error in ${context}: ${message}`, error);
    // Aquí podrías integrar un servicio como Sentry o Bugsnag en el futuro
    return message;
  }
};
