import log4js from 'log4js';

//load log4js configuration from json config file
import config from '../config/log4js-config.json';
log4js.configure(config);

/**
 * Returns a logger instance where:
 * - `file` category is the source filename
 * - `method` is passed at log time to identify the caller
 *
 * @param {string} fileName - Base name of the calling module (e.g. 'prompt-flow')
 */
function getLogger(fileName:string) {
    const logger = log4js.getLogger(fileName);

    return {
        debug: (method:string, msg:string) => logger.debug(`[${method}] ${msg}`),
        info: (method:string, msg:string) => logger.info(`[${method}] ${msg}`),
        warn: (method:string, msg:string) => logger.warn(`[${method}] ${msg}`),
        error: (method:string, msg:string) => logger.error(`[${method}] ${msg}`),
    };
}

export default getLogger;


// Usage elsewhere:
// const { getLogger } = require('../utils/logger');
// const logger = getLogger('prompt-flow');
// logger.info('sendPrompt', 'Prompt submitted to ChatGPT');
// logger.error('pollResponse', 'Failed to retrieve response', err);