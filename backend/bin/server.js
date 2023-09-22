const app = require("../app");
const config = require("../config/config.json");
const appProcess = require("../util/appProcessUtility");
const http = require("http");


//Get port from environment and store in Express
const port = isNaN(process.env.PORT) ? config.port : Number(process.env.PORT);
app.set("port", `${port}`);

//Create an HTTP server
const server = http.createServer(app);

//Listen on provided port, on all network interfaces.
server.listen(port);

//Uncaught exception handler
appProcess.handleUncaughtError();

//Handles application exit
appProcess.handleExit(server);

//Server's event listeners
server.on("error", onError);
server.on("listening", onListening);

/**
 * Event listener for HTTP server's `error` event.
 * @param {Error} error
 */
function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    switch (error.code) {
        case "EACCES":
            console.error(`Port ${port} requires elevated privileges`);
            process.exit(1);
        case "EADDRINUSE":
            console.error(`Port ${port} is already in use`);
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server `listening` event.
 */
function onListening() {
    const addr = server.address();
    let bind;
    if (addr.family === "IPv6") {
        bind = addr.address != "::" ? `[${addr.address}]:${addr.port}` : `port: ${addr.port}`;
    } else {
        bind = addr.address != "0.0.0.0" ? `${addr.address}:${addr.port}` : `port: ${addr.port}`;
    }

    sysLogger.info(`Application started on ${bind}`);
    console.log(`Listening on ${bind}`);
}