const fsr = require('file-stream-rotator');
const morgan = require('morgan');
const path = require('path');
const RequestError = require('@errors/RequestError');
const _logger = require('../lib/logger');

/**
 * Returns middleware for logging access logs
 */
function accessLogger() {
    const logDirectory = path.join(process.env.LOG_SETTINGS__PATH, 'accessLogs');
    common.makeDirectoryIfNotPresent(logDirectory);

    const logStream = fsr.getStream({
        date_format: 'DD-MM-YYYY',
        filename: path.join(logDirectory, 'access.%DATE%.log'),
        frequency: 'daily',
        verbose: false,
        // Retaining access logs for 7 days
        max_logs: '7d',
    });

    // Returning custom log format
    return morgan((tokens, req, res) => [
        tokens['remote-addr'](req, res),
        '-', tokens['remote-user'](req, res),
        common.getTimestamp('log'),
        tokens.method(req, res),
        tokens.url(req, res),
        'HTTP/', tokens['http-version'](req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-', tokens['response-time'](req, res), 'ms',
    ].join(' '), { stream: logStream });
}

/**
 * Middleware for adding metadata to request for context and logging
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {*} next
 */
function setRequestMetadata(req, res, next) {
    req.logParams = {
        id: common.getUuid().replace(/-/g, ''),
        serverIp: common.getServerIp(),
    };
    req.metaData = {
        startTime: new Date(),
        endTime: null,
    };
    req.canonicalLogBuffer = [];

    next();
}

/**
 * Middleware for logging request received by the application
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {*} next
 */
function logRequestBody(req, res, next) {
    const logger = _logger.getLogger(req.logParams, req);

    const request = {
        type: req.method,
        url: req.originalUrl,
        clientIp: getClientIp(req),
        headers: req.headers,
        body: req.body && Object.keys(req.body).length > 0 ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : null,
        query: req.query && Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : null,
    };

    const logMsg = `${request.type} request received from IP: ${request.clientIp} with ${request.body ? `body: ${request.body}, ` : ''}`
        + `${request.query ? `query params: ${request.query}, ` : ''}headers: ${JSON.stringify(request.headers)} on endpoint: ${request.url}`;

    logger.info(logMsg);
    next();
}

/**
 * Returns IP address of client sending the request (if found)
 * @param {Express.Request} req
 */
function getClientIp(req) {
    return ((req.headers['x-forwarded-for'] || '').split(',').pop() || req.connection.remoteAddress
        || req.socket.remoteAddress || req.connection.socket.remoteAddress);
}

/**
 * Middleware for logging response sent from the application
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {*} next
 */
function logResponseBody(req, res, next) {
    // Overriding default write and end functions to log data before sending response
    const defaultWrite = res.write; const
        defaultEnd = res.end;
    const logger = _logger.getLogger(req.logParams, req);

    // Array for holding response data buffer(s)
    const dataChunks = [];
    res.write = function (data) {
        dataChunks.push(data);
        // Calling original function as-is
        defaultWrite.apply(res, arguments);
    };
    res.end = function (data) {
        try {
            if (data) { dataChunks.push(data); }

            const responseBody = Buffer.concat(dataChunks).toString('utf8');
            logger.info(`Response sent with statusCode: ${res.statusCode}, body: ${responseBody} and headers: ${JSON.stringify(res.getHeaders())}`);
        } catch (err) {
            logger.error(`Error occurred while logging response body: ${JSON.stringify(err)}`);
        } finally {
            logLatencyAndCanonicalData(logger, req);
            // Calling original function as-is
            defaultEnd.apply(res, arguments);
        }
    };

    next();
}

/**
 * Logs API `latency` log and `canonical` log line
 * @param {*} logger
 * @param {Express.Request} req
 */
function logLatencyAndCanonicalData(logger, req) {
    req.metaData.endTime = new Date();
    req.metaData.responseTime = (req.metaData.endTime - req.metaData.startTime);
    logger.latencyLog({ url: req.originalUrl, responseTimeInMs: req.metaData.responseTime });
    canonicalLog.write(logger);
}

/**
 * Middleware for handling HTTP error codes
 * @param {Error} error
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {*} next
 */
function handleHTTPError(error, req, res, next) {
    if (error) {
        let status = error.status_code ? error.status_code : 500;
        let result;
        const logger = _logger.getLogger(req.logParams, req);

        switch (status) {
            case 400:
                result = error.message ?? 'Bad Request';
                break;
            case 404:
                result = error.message ?? 'Resource not found';
                break;
            default:
                status = 500;
                result = error.message ?? 'Technical failure';
                logger.error(error.stack);
        }


        // Not sending response since it has already been sent
        if (res.headersSent) {
            next(error);
        } else {
            res.status(status).send(result);
        }
    } else {
        next();
    }
}

module.exports = {
    accessLogger,
    setRequestMetadata,
    logRequestBody,
    logResponseBody,
    handleHTTPError,
};
