/**
 * @typedef {Object} LoggerOptions
 * @property {import('stack-trace').StackFrame} [trace]
 * @property {string} [context]
 */

/**
 * @callback LoggerFunction
 * @param {string} message
 * @param {LoggerOptions} [options]
 */

/**
 * @typedef {Object} Logger
 * @property {LoggerFunction} info
 * @property {LoggerFunction} warn
 * @property {LoggerFunction} error
 * @property {LoggerFunction} debug
 */
