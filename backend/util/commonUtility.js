const fs = require('fs');
const dateFormat = require('dateformat');
const uuid = require('uuid');
const ipAddress = require('ip').address();

module.exports = {
    /**
     * Returns `true` if the value is defined and not null
     * @param {*} value
     * @returns
     */
    isSet(value) {
        return (typeof value !== 'undefined' && value !== null);
    },

    /**
     * Returns `true` if the value passed is `true`
     * @param {*} value
     */
    isTrue(value) {
        return (value === true);
    },
    /**
     * Creates a directory, if it does not exist
     * @param {fs.PathLike} directory
     */
    makeDirectoryIfNotPresent(directory) {
        fs.existsSync(directory) || fs.mkdirSync(directory);
    },

    /**
     * Returns `IP` address of the server running the application
     */
    getServerIp() {
        return ipAddress;
    },

    /**
     * Returns `timestamp` in the a specific format basis the `type` passed
     * @param {"log"|"date"|"ts"|*} type
     * @param {Date} date - defaults to `new Date()`
     */
    getTimestamp(type, date = new Date()) {
        switch (type) {
            case 'log':
                return dateFormat(date, 'yyyy-mm-dd HH:MM:ss.l');
            case 'date':
                return dateFormat(date, 'yyyy-mm-dd');
            case 'ts':
            default:
                return dateFormat(date, 'yyyy-mm-dd HH:MM:ss');
        }
    },

    /**
     * Generates and returns a `UUID`
     * @param {1|3|4|5} version - defaults to `4`
     */
    getUuid(version = 4) {
        switch (version) {
            case 1:
                return uuid.v1();
            case 3:
                return uuid.v3();
            case 5:
                return uuid.v5();
            case 4:
            default:
                return uuid.v4();
        }
    },

    /**
     * Masks `emailId` and returns the masked message
     * @param {string} message
     */
    maskEmail(message) {
        const emailRegex = new RegExp(/\b(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/, 'g');
        return message.replace(emailRegex, '_email_');
    },

    /**
     * Returns stringified JSON replacing escaped double-quotes with single-qoutes
     * @param {JSON} data
     */
    stringifyJson(data) {
        return JSON.stringify(data).replace(/\\+"/g, "'");
    },
    validateENV() {
        const require_env_variables = [
            'APP_NAME',
            'PORT',
            'ENV',
            'AUTH_SALT_ROUNDS',
            'CLUSTER_SETTING__INSTANCE_COUNT',
            'LOG_SETTINGS__PATH',
            'LOG_SETTINGS__ENABLE_TRACKING_LOGS',
            'LOG_SETTINGS__ENABLE_CANONICAL_LOGS',
            'REDIS_SETTINGS__HOST',
            'REDIS_SETTINGS__PORT',
            'REDIS_SETTINGS__PASSWORD',
            'REDIS_SETTINGS__DEFAULT_TTL',
            'REDIS_SETTINGS__KEY_PREFIX',
            'REDIS_SETTINGS__RETRY_STRATEGY__RETRY_COUNT',
            'REDIS_SETTINGS__RETRY_DELAY_IN_MS',
            'DB__SETTINGS__ENABLE_SELECT_QUERY_LOGS',
            'DB__CONNECTIONS__MASTER__HOST',
            'DB__CONNECTIONS__MASTER__PORT',
            'DB__CONNECTIONS__MASTER__DATABASE',
            'DB__CONNECTIONS__MASTER__USERNAME',
            'DB__CONNECTIONS__MASTER__PASSWORD',
            'DB__CONNECTIONS__MASTER__MAX_CONNECTIONS',
            'DB__CONNECTIONS__SLAVE__HOST',
            'DB__CONNECTIONS__SLAVE__PORT',
            'DB__CONNECTIONS__SLAVE__DATABASE',
            'DB__CONNECTIONS__SLAVE__USERNAME',
            'DB__CONNECTIONS__SLAVE__PASSWORD',
            'DB__CONNECTIONS__SLAVE__MAX_CONNECTIONS',
            'HTTP_CLIENT_SETTINGS__TIMEOUT_MS',
            'HTTP_CLIENT_SETTINGS__RETRY_COUNT',
            'HTTP_CLIENT_SETTINGS__LOG_REQUEST_HEADERS',
            'ENABLE_PROMETHEUS_CLIENT',
            'JWT_AUTH_OPTIONS__SECRET_OR_KEY',
            'JWT_AUTH_OPTIONS__ISSUER',
            'JWT_AUTH_OPTIONS__AUDIENCE',
            'JWT_AUTH_OPTIONS__EXPIRY',
            'FIREBASE_CONFIG__API_KEY',
            'FIREBASE_CONFIG__AUTH_DOMAIN',
            'FIREBASE_CONFIG__PROJECT_ID',
            'FIREBASE_CONFIG__STORAGE_BUCKET',
            'FIREBASE_CONFIG__MESSAGE_SENDER_ID',
            'FIREBASE_CONFIG__API_ID',
        ];
        const non_set_variables = [];
        for (const env of require_env_variables) {
            if (!process.env[env]) {
                non_set_variables.push(env);
            } else {
                console.log(`ENV SET: ${env} -> ${process.env[env]}`);
            }
        }
        if (non_set_variables.length) {
            console.log(non_set_variables);
            throw new Error('Some environment variables are not set');
        }
    },
};
