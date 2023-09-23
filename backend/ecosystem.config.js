module.exports = {
    apps: [{
        name: process.env.APP_NAME,
        script: 'npm',
        args: 'start',
        error_file: `${process.env.LOG_SETTINGS__PATH}/pm2Logs/error.log`,
        out_file: `${process.env.LOG_SETTINGS__PATH}/pm2Logs/out.log`,
        log_file: `${process.env.LOG_SETTINGS__PATH}/pm2Logs/combined.log`,
        log_date_format: 'YYYY-MM-DD HH:mm:ss.SSS',
        env: {},
    }],
};
