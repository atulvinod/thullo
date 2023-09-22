const http_status_codes = require('http-status-codes');

class RequestError extends Error {
    /**
     * @param {string} message
     * @param {number} status_code
     * @param {JSON?} data
     */
    constructor(message = undefined, status_code = 400, data = undefined) {
        status_code = Number(status_code) || 400;
        const name = http_status_codes.getReasonPhrase(status_code);
        message = message || name;
        super(message);
        this.status_code = status_code;
        this.name = name;
        this.data = data;
    }
}

module.exports = RequestError;
