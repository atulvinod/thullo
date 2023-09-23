const isCanonicalLogEnabled = process.env.LOG_SETTINGS__ENABLE_CANONICAL_LOGS;

const dataKeys = {
    APP_LOG: "appLog",
    API: "api",
    REDIS: "redis",
    COUNT: "count",
    QUERIES: "queries",
    QUERY: {
        SELECT: "select",
        UPDATE: "update",
        INSERT: "insert",
        DELETE: "delete"
    }
}

const keyValueSeparator = "=";
const delimiter = " ";

module.exports = {
    
    /**
     * Adds `data` passed as `key`, `value` or `JSON` object to canonicalLog buffer
     * @param {*} logger 
     * @param {string|JSON} key
     * @param {string|JSON|null} value - defaults to `null`
     */
    addData: function(logger, key, value = null) {
        if (shouldWriteToLog(logger)) {
            let stringifiedValue;
            if (common.isSet(value)) {
                stringifiedValue = typeof value === "object"? JSON.stringify(value): value;
                logger.req.canonicalLogBuffer.push(`${key}${keyValueSeparator}${stringifiedValue}`);
            } else {
                let data = typeof key === "object" ? key: {};
                for (const prop in data) {
                    stringifiedValue = typeof data[prop] === "object"? JSON.stringify(data[prop]): data[prop];
                    logger.req.canonicalLogBuffer.push(`${prop}${keyValueSeparator}${stringifiedValue}`);
                }
            }
        }
    },

    /**
     * Increments `apiRequest` counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementApiCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.COUNT, dataKeys.API);
        }
    },

    /**
     * Increments `redis` operation counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementRedisCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.COUNT, dataKeys.REDIS);
        }
    },

    incrementQueryCounter: function (logger, method) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.QUERIES, method);
        }
    },

    /**
     * Increments `select` query counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementSelectCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.QUERIES, dataKeys.QUERY.SELECT);
        }
    },

    /**
     * Increments `update` query counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementUpdateCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.QUERIES, dataKeys.QUERY.UPDATE);
        }
    },

    /**
     * Increments `insert` query counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementInsertCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.QUERIES, dataKeys.QUERY.INSERT);
        }
    },

    /**
     * Increments `delete` query counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementDeleteCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.QUERIES, dataKeys.QUERY.DELETE);
        }
    },

    /**
     * Increments `appLog` counter by 1 (for writing to canonicalLog line)
     * @param {*} logger 
     */
    incrementAppLogCounter: function (logger) {
        if (shouldWriteToLog(logger)) {
            incrementCounter(logger, dataKeys.COUNT, dataKeys.APP_LOG);
        }
    },

    /**
     * Writes canonical log line to file
     * @param {*} logger 
     */
    write: function(logger) {
        if (shouldWriteToLog(logger)) {
            module.exports.incrementAppLogCounter(logger);
            addRequestMetaData(logger);
            const canonicalLogLine = logger.req.canonicalLogBuffer.join(delimiter);
            logger.info(canonicalLogLine);
        }
    }
}

/**
 * Returns `true` if canonicalLog is enabled and can be written to; and `false` otherwise
 * @param {*} logger 
 * @returns 
 */
function shouldWriteToLog(logger) {
    return (isCanonicalLogEnabled && logger.req);
}

/**
 * Increments counter for `apis`, `query`, `redis` and `logs`
 * @param {*} logger 
 * @param {"count"|"queries"} parentKey 
 * @param {string} childKey 
 */
function incrementCounter(logger, parentKey, childKey) {
    let value;
    if (logger.req.metaData[parentKey]) {
        value = logger.req.metaData[parentKey][childKey];
    } else {
        logger.req.metaData[parentKey] = {};
    }

    logger.req.metaData[parentKey][childKey] = value ? (value + 1) : 1;
}

/**
 * Adds request's type, metaData and response statusCode to canonicalLog
 * @param {*} logger 
 */
function addRequestMetaData(logger) {
    //Add all counters' data
    const counters = logger.req.metaData[dataKeys.COUNT];
    for (const counter in counters) {
        logger.req.canonicalLogBuffer.push(`${counter}Count${keyValueSeparator}${counters[counter]}`);
    }
    //Add all query data
    if (logger.req.metaData[dataKeys.QUERIES]) {
        logger.req.canonicalLogBuffer.push(`${dataKeys.QUERIES}${keyValueSeparator}${JSON.stringify(logger.req.metaData[dataKeys.QUERIES])}`);
    }
    //Add all request data
    logger.req.canonicalLogBuffer.push(`startTime${keyValueSeparator}${common.getTimestamp("log", logger.req.metaData.startTime)}`);
    logger.req.canonicalLogBuffer.push(`responseTimeInMs${keyValueSeparator}${logger.req.metaData.responseTime}`);
    logger.req.canonicalLogBuffer.push(`httpPath${keyValueSeparator}${logger.req.originalUrl}`);
    logger.req.canonicalLogBuffer.push(`httpMethod${keyValueSeparator}${logger.req.method}`);
    logger.req.canonicalLogBuffer.push(`httpStatus${keyValueSeparator}${logger.req.res.statusCode}`);
}