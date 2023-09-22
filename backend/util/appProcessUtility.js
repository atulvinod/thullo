const _logger = require("../lib/logger");


let isShuttingDown = false;

module.exports = {
    /**
     * Adds listeners for any uncaught exception(s) in the app (to prevent app from crashing)
     */
    handleUncaughtError: function () {
        process.on("unhandledRejection", logUncaughtError);
        process.on("uncaughtException", logUncaughtError);
    },

    /**
     * Adds listeners for exit events for clean-up before exiting
     * @param {http.Server} server
     */
    handleExit: function (server) {
        process.on("exit", () => console.log("Application exited"));

        ["SIGHUP", "SIGINT", "SIGTERM"].map((signalType) => {
            process.on(signalType, () => shutDown(server));
        });
    }
};

/**
 * Logs uncaught error to application logs
 * @param {Error} error 
 */
function logUncaughtError(error) {
    const msg = error.stack ? error.stack : error;
    sysLogger.error(`Unhandled error occurred: ${msg}`);
}

/**
 * Gracefully shuts down the server and all its components 
 * @param {http.Server} server 
 */
function shutDown(server) {
    if (!isShuttingDown) {
        isShuttingDown = true;
        console.log("Application shutting down...");

        server.close((serverClosingError) => {
            if (serverClosingError) {
                console.error("Error in closing server: ", serverClosingError);
            }

            //Shutdown resources and cleanup temp data
            _logger.closeLogger((error) => {
                if (error) {
                    console.error("Error in closing logger: ", error);
                }
                
                isShuttingDown = false;
                const exitCode = (serverClosingError || error)? 1: 0;
                process.exit(exitCode);
            });
        });
    }
}