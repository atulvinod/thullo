'use strict';

const path = require("path");
const log4js = require("log4js");
const stackTrace = require("stack-trace");
const util = require('util');

const isTrackLogsEnabled = process.env.LOG_SETTINGS__ENABLE_TRACKING_LOGS;
const isDevEnvironment = (process.env.ENV === "DEV");
const common = require('../util/commonUtility');

const { appLogger, curlLogger, trackLogger } = initLoggers();

/** @type {util.InspectOptions} */
const LOG_INSPECT_OPTION = {
    breakLength: Infinity,
    compact: Infinity,
    depth: 5,
};

/**
 * Initialises the logger.
 * IMP: Should only be called once at app load
 */
function initLoggers() {
    addLayouts();
    configureAppenders();

    const appLogger = process.env.LOG_TO_CONSOLE === "true" && isDevEnvironment ? log4js.getLogger("console") : log4js.getLogger();
    const curlLogger = log4js.getLogger("curl");
    const trackLogger = isTrackLogsEnabled ? log4js.getLogger("tracking") : null;

    return { appLogger, trackLogger };
}

/**
 * Adds custom layouts to log4js instance
 */
function addLayouts() {
    log4js.addLayout("appLog", appLogLayout);
    log4js.addLayout("curlLog", appLogLayout);
    if (isTrackLogsEnabled) {
        log4js.addLayout("trackLog", trackLogLayout);
    }
}

/**
 * Defines a custom layout for `appLogs`
 * @param {JSON} options
 * @returns
 */
function appLogLayout(options) {
    return function (logEvent) {
        return options.stringify({
            ts: options.getTimestamp("log", logEvent.startTime),
            lv: logEvent.level.levelStr,
            id: logEvent.data[0].id,
            sIp: logEvent.data[0].serverIp,
            fl: logEvent.data[0].file,
            fn: logEvent.data[0].func,
            ln: logEvent.data[0].line,
            msg: logEvent.data[0].msg,
            ctx: logEvent.data[0].context,
        });
    }
}

/**
 * Defines a custom layout for `trackLogs`
 * @param {JSON} options
 * @returns
 */
function trackLogLayout(options) {
    return function (logEvent) {
        return options.stringify({
            ts: options.getTimestamp("log", logEvent.startTime),
            id: logEvent.data[0].id,
            sIp: logEvent.data[0].serverIp,
            type: logEvent.data[0].type,
            data: logEvent.data[0].data
        });
    }
}

/**
 * Configures log4js instance with the required appenders
 */
function configureAppenders() {
    const config = getLoggerConfiguration();
    log4js.configure(config);
}

/**
 * Generates the required `configuration` for log4js logger
 * basis the required `appenders`
 * @returns
 */
function getLoggerConfiguration() {
    const appAppender = getAppLogAppender(process.env.APP_NAME, "appLog");
    const curlAppender = getAppLogAppender(`curl_${process.env.APP_NAME}`, "curlLog");
    let config = {
        appenders: { app: appAppender, curl: curlAppender },
        categories: { 
            default: { appenders: ["app"], level: "DEBUG" },
            curl: { appenders: ["curl"], level: "INFO" } 
        }
    };

    //Adds tracking log appender if enabled
    if (isTrackLogsEnabled) {
        const trackAppender = getTrackingLogAppender();
        config.appenders.tracking = trackAppender;
        config.categories.tracking = { appenders: ["tracking"], level: "INFO" };
    }

    //Adds console log appender for DEV environment
    if (isDevEnvironment) {
        const consoleAppender = getConsoleLogAppender();
        config.appenders.console = consoleAppender;
        config.categories.console = { appenders: ["console"], level: process.env.LOG_SETTINGS__CONSOLE_LOG_LEVEL }
    }

    return config;
}

/**
 * Returns `appender` for `appLogs`
 * @param {string} fileName
 * @param {string} layoutType
 * @returns 
 */
 function getAppLogAppender(fileName, layoutType) {
     const logDirectory = path.join(__dirname, "...", process.env.LOG_SETTINGS__PATH, "appLogs");
    common.makeDirectoryIfNotPresent(logDirectory);

    //Size-based rotation
    // const optionsForSizeBasedRotation = {
    //     maxLogSize: 5 * 1024 * 1024, //Size is expected in bytes (5 MB = 5 * 1024 * 1024)
    //     backups: Infinity //Retaining all old log files
    // };
    // return getLogAppender(logDirectory, fileName, "file", optionsForSizeBasedRotation, layoutType);

    //Time-based rotation
    const optionsForDateBasedRotation = {
        pattern: "dd-MM-yyyy", //Pattern decides rotation frequency
        alwaysIncludePattern: true, //Includes pattern name in the current log file as well
    };
    return getLogAppender(logDirectory, fileName, "dateFile", optionsForDateBasedRotation, layoutType)
}

/**
 * Generates the appender configuration basis the `appenderType`
 * adding required `additionalOptions` and `layoutType`
 * @param {string} directory
 * @param {string} fileName
 * @param {"file"|"dateFile"} appenderType
 * @param {JSON} additionalOptions
 * @param {"appLog"|"trackLog"} layoutType
 * @returns
 */
function getLogAppender(directory, fileName, appenderType, additionalOptions, layoutType) {
    let appender = {
        type: appenderType,
        filename: `${directory}/${fileName}.log`,
        keepFileExt: true,
        compress: true,
        layout: { type: layoutType, getTimestamp: common.getTimestamp, stringify: common.stringifyJson }
    };

    for (const option in additionalOptions) {
        appender[option] = additionalOptions[option];
    }

    return appender;
}

/**
 * Returns `appender` for `trackLogs`
 * @returns
 */
function getTrackingLogAppender() {
    const logDirectory = path.join(__dirname, "...", process.env.LOG_SETTINGS__PATH, "trackLogs");
    const fileName = "tracking";
    const layoutType = "trackLog";
    common.makeDirectoryIfNotPresent(logDirectory);

    //Size-based rotation
    // const optionsForSizeBasedRotation = {
    //     maxLogSize: 5 * 1024 * 1024, //Size is expected in bytes (5 MB = 5 * 1024 * 1024)
    //     backups: Infinity //Retaining all old log files
    // };
    // return getLogAppender(logDirectory, fileName, "file", optionsForSizeBasedRotation, layoutType);

    //Time-based rotation
    const optionsForDateBasedRotation = {
        pattern: "dd-MM-yyyy", //Pattern decides rotation frequency
        alwaysIncludePattern: true, //Includes pattern name in the current file as well
    };
    return getLogAppender(logDirectory, fileName, "dateFile", optionsForDateBasedRotation, layoutType)
}

/**
 * Returns `appender` for `appLogs` for logging to console
 * @returns
 */
function getConsoleLogAppender() {
    return {
        type: "console",
        layout: { type: "appLog", getTimestamp: common.getTimestamp, stringify: common.stringifyJson }
    }
}

/**
 * Returns app logger with the added metadata from `logParams` and trace data
 * @param {{id?: string, serverIp?: string}} logParams
 * @param {Express.Request|null} req
 */
function getLogger(logParams = {}, req = null) {
    let logger = {
        req: req,
        info: getAppLoggerForLevel("info", req, logParams),
        error: getAppLoggerForLevel("error", req, logParams),
        warn: getAppLoggerForLevel("warn", req, logParams),
        debug: getAppLoggerForLevel("debug", req, logParams),
        curlLog: getCurlLoggerForLevel(req, logParams)
    };

    if (isTrackLogsEnabled) {
        logger.httpLog = getTrackLoggerForType("http", logParams);
        logger.latencyLog = getTrackLoggerForType("latency", logParams)
    } else {
        logger.httpLog = logger.latencyLog = function () {
            throw new Error("Logging a track log despite being disabled from config. Either enable tracking logs or remove all function calls");
        }
    }

    return logger;
}

/**
 * Returns `log function` for the specified log `level`
 * @param {"info"|"error"|"warn"|"debug"} level
 * @param {Express.Request} req
 * @param {JSON} metaData
 * @returns {LoggerFunction}
 */
function getAppLoggerForLevel(level, req, metaData) {
    return function (logMessage, options = {}) {
        options.trace = options.trace || stackTrace.get()[1];
        const log = getAppLog(metaData, logMessage, options);
        canonicalLog.incrementAppLogCounter({ req });
        appLogger[level](log);
    }
}

/**
 * Generates and returns `app log` basis the `metaData`, `stackTrace`, and `message` passed
 * @param {JSON} metaData
 * @param {string} message
 * @param {LoggerOptions} [options]
 */
function getAppLog(metaData, message, options = {}) {
    message = typeof message === 'string' ? message : util.inspect(message, LOG_INSPECT_OPTION);
    const { trace } = options;
    return {
        id: metaData.id,
        serverIp: metaData.serverIp,
        file: path.basename(trace.getFileName()),
        func: trace.getFunctionName(),
        line: trace.getLineNumber(),
        msg: maskLogMessage(message),
        context: options?.context,
    }
}

/**
 * Returns `log function` for the curl logger
 * @param {Express.Request} req 
 * @param {JSON} metaData 
 * @returns 
 */
function getCurlLoggerForLevel(req, metaData) {
    return function (logMessage, trace = stackTrace.get()[1]) {
        const log = getAppLog(metaData, trace, logMessage);
        canonicalLog.incrementAppLogCounter({ req });
        curlLogger.info(log);
    }
}

/**
 * Returns `tracking log function` for the specified log `type`
 * @param {"http"|"latency"} type
 * @param {JSON} metaData
 * @returns
 */
function getTrackLoggerForType(type, metaData) {
    return function (logData) {
        trackLogger.info(getTrackLog(type, metaData, logData));
    }
}

/**
 * Generates and returns `app log` basis the `metaData`, `stackTrace`, and `message` passed
 * @param {"http"|"latency"} type
 * @param {JSON} metaData
 * @param {*} logData
 * @returns
 */
function getTrackLog(type, metaData, logData) {
    return {
        id: metaData.id,
        serverIp: metaData.serverIp,
        type: type,
        data: logData
    };
};

/**
 * Mask sensitive data in log `message`
 * @param {string} message
 */
function maskLogMessage(message) {
    //Skip masking for DEV environment
    if (!isDevEnvironment) {
        //TODO: Mask sensitive data here and return final message
        message = common.maskEmail(message);
    }
    return message;
}

/**
 * Shuts down the logger.
 * To be used while application shutdown
 * @param {Function} callback
 */
function closeLogger(callback) {
    log4js.shutdown(callback);
}

module.exports = {
    getLogger: getLogger,
    closeLogger: closeLogger
}
