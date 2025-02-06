// lib/logger.js

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor(module) {
        this.module = module;
        this.logLevel = LOG_LEVELS.INFO; // Default log level
    }

    setLogLevel(level) {
        this.logLevel = level;
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${this.module}] [${level}]: ${message}`;
    }

    error(message, error = null) {
        if (this.logLevel >= LOG_LEVELS.ERROR) {
            console.error(this.formatMessage('ERROR', message));
            if (error) {
                console.error(error);
            }
        }
    }

    warn(message) {
        if (this.logLevel >= LOG_LEVELS.WARN) {
            console.warn(this.formatMessage('WARN', message));
        }
    }

    info(message) {
        if (this.logLevel >= LOG_LEVELS.INFO) {
            console.log(this.formatMessage('INFO', message));
        }
    }

    debug(message) {
        if (this.logLevel >= LOG_LEVELS.DEBUG) {
            console.log(this.formatMessage('DEBUG', message));
        }
    }
}

module.exports = {
    Logger,
    LOG_LEVELS
};