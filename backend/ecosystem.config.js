const config = require("./config/config.json");

module.exports = {
    apps: [{
        name: config.appName,
        script: "npm",
        args: "start",
        error_file: `${config.logSettings.path}/pm2Logs/error.log`,
        out_file: `${config.logSettings.path}/pm2Logs/out.log`,
        log_file: `${config.logSettings.path}/pm2Logs/combined.log`,
        log_date_format: "YYYY-MM-DD HH:mm:ss.SSS",
        env: {}
    }]
};
