const redis = require("redis");
const common = require('../util/commonUtility');

let redisClient, isClientConnected, connectionError;

/**
 * Connects and maintains a static client for `Redis`
 */
function connect() {
    //Initialise to default values
    isClientConnected = false, connectionError = "Client not connected";

    redisClient = getConnectionClient();

    redisClient.on("connect", function onConnect() {
        isClientConnected = true;
        connectionError = undefined;
        sysLogger.info("Redis connected!");
    });

    redisClient.on("error", function onError(error) {
        isClientConnected = false;
        connectionError = error.message;
        const logMessage = `Error in redis connection: ${error.message}`;
        sysLogger.error(logMessage);
        console.error(logMessage);
    });
}

/**
 * Initialises and returns a `redis` connection client
 * IMP: If prefix is enabled, it will be used for all commands except KEYS
 * Reference: https://github.com/NodeRedis/node-redis#options-object-properties
 */
function getConnectionClient() {
    let clientOptions;
    if (process.env.REDIS_SETTINGS__HOST) {

        clientOptions = {
            host: process.env.REDIS_SETTINGS__HOST,
            port: Number(process.env.REDIS_SETTINGS__PORT),
            auth_pass: process.env.REDIS_SETTINGS__AUTH_PASS,
            prefix: getPrefix(),
            retry_strategy: getRetryStrategy()
        };
    }

    return redis.createClient(clientOptions);
}

/**
 * Validates and returns `keyPrefix` added to config
 * @returns 
 * @throws for invalid key prefix
 */
function getPrefix() {
    if (process.env.REDIS_SETTINGS__KEY_PREFIX && typeof process.env.REDIS_SETTINGS__KEY_PREFIX === "string") {
        return `${process.env.REDIS_SETTINGS__KEY_PREFIX}`;
    } else {
        throw new Error("Key prefix must be a valid string");
    }
}

/**
 * Returns the `retryStrategy` for re-connection attempts, if enabled
 * @returns 
 */
function getRetryStrategy() {
    if (common.isSet(process.env.REDIS_SETTINGS__RETRY_STRATEGY__RETRY_COUNT) && common.isSet(process.env.REDIS_SETTINGS__RETRY_STRATEGY__RETRY_DELAY_IN_MS)) {
        return function(options) {
            if (process.env.REDIS_SETTINGS__RETRY_STRATEGY__RETRY_COUNT > 0 && options.attempt > process.env.REDIS_SETTINGS__RETRY_STRATEGY__RETRY_COUNT) {
                //Stop retrying for a connection
                return undefined;
            }

            //Retry after returned milliseconds
            return process.env.REDIS_SETTINGS__RETRY_STRATEGY__RETRY_DELAY_IN_MS;
        }
    }
}

/**
 * Validates the current `redis' connection`.
 * @param {*} logger 
 */
async function validateConnection(logger) {
    let connected = false;
    if (isClientConnected) {
        await module.exports.get(logger, "test")
            .then((value) => {
                connected = true;
            }).catch((error) => {
                connectionError = error.message;
            });
    }
    return {
        isConnected: connected,
        connectionError: connectionError
    }
}

/**
 * Sets `value` in redis for `key` with the given `timeout`
 * @param {string} key 
 * @param {string} value 
 * @param {number} timeout - default `global.config.redisSettings.defaultTtl`
 * @returns {Promise<string|Error>}
 */
function set(logger, key, value, timeout = process.env.REDIS_SETTINGS__DEFAULT_TTL) {
    canonicalLog.incrementRedisCounter(logger);
    return new Promise(function setWrapper(resolve, reject) {
        redisClient.set(key, value, "EX", timeout, (error, value) => {
            if (error) {
                logger.error(`Failed to set value for '${key}': ${error.stack}`);
                reject(error);
            }
            else {
                resolve(value);
            }
        });
    });
}

/**
 * Gets `value` from redis stored against `key`
 * and executes the `callback` function with the `value` and `args`, if any
 * @param {string} key 
 * @returns {Promise<string|Error>}
 */
function get(logger, key) {
    canonicalLog.incrementRedisCounter(logger);
    return new Promise(function getWrapper(resolve, reject) {
        redisClient.get(key, (error, value) => {
            if (error) {
                logger.error(`Failed to get value for '${key}': ${error.stack}`);
                reject(error);
            }
            else {
                resolve(value);
            }
        });
    });
}

/**
 * Deletes the `key` from redis
 * @param {string} key 
 * @returns {Promise<string|Error>}
 */
function del(logger, key) {
    canonicalLog.incrementRedisCounter(logger);
    return new Promise(function delWrapper(resolve, reject) {
        redisClient.del(key, (error, value) => {
            if (error) {
                logger.error(`Failed to delete value for '${key}': ${error.stack}`);
                reject(error);
            }
            else {
                resolve(value);
            }
        });
    });
}

/**
 * Closes the client connection
 * @returns {Promise<string|Error>}
 */
function quit() {
    return new Promise(function quitWrapper(resolve, reject) {
        redisClient.quit((error, value) => {
            if (error) {
                sysLogger.error(`Failed to close redis connection: ${error.stack}`);
                reject(error);
            } else {
                resolve(value);
            }
        });
    });
}

module.exports = {
    connect: connect,
    validateConnection: validateConnection,
    set: set,
    get: get,
    del: del,
    quit: quit
}