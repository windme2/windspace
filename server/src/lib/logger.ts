import winston from 'winston';
import path from 'path';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

/**
 * JSON format for production
 */
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: process.env.NODE_ENV === 'production' ? jsonFormat : logFormat,
  defaultMeta: { service: 'windspace-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
      ),
    }),
  ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  const logsDir = process.env.LOGS_DIR || 'logs';
  
  // Error log file
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Combined log file
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true,
    })
  );

  // Access log file
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      tailable: true,
    })
  );
}

/**
 * HTTP request logger middleware for Express
 */
export const httpLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', logData);
    } else {
      logger.http('Request completed', logData);
    }
  });

  next();
};

/**
 * Log API errors with context
 */
export const logApiError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

/**
 * Log database operations
 */
export const logDbOperation = (operation: string, table: string, duration?: number, details?: Record<string, any>) => {
  logger.debug(`DB ${operation}`, {
    table,
    duration: duration ? `${duration}ms` : undefined,
    ...details,
  });
};

/**
 * Log authentication events
 */
export const logAuthEvent = (event: string, success: boolean, details?: Record<string, any>) => {
  const level = success ? 'info' : 'warn';
  logger[level](`Auth: ${event}`, {
    success,
    ...details,
  });
};

/**
 * Log security events
 */
export const logSecurityEvent = (event: string, details?: Record<string, any>) => {
  logger.warn(`Security: ${event}`, details);
};

/**
 * Application startup log
 */
export const logStartup = (port: number, env: string) => {
  logger.info('🚀 Server started', {
    port,
    environment: env,
    nodeVersion: process.version,
    pid: process.pid,
  });
};

/**
 * Application shutdown log
 */
export const logShutdown = (reason: string) => {
  logger.info('Server shutting down', { reason });
};

export default logger;
