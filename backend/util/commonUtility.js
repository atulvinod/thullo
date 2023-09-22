const fs = require("fs");
const dateFormat = require("dateformat");
const uuid = require("uuid");
const ipAddress = require("ip").address();


module.exports = {
    /**
     * Returns `true` if the value is defined and not null
     * @param {*} value 
     * @returns
     */
    isSet: function (value) {
        return (typeof value !== "undefined" && value !== null);
    },

    /**
     * Returns `true` if the value passed is `true`
     * @param {*} value 
     */
    isTrue: function (value) {
        return (value === true);
    },
    /**
     * Creates a directory, if it does not exist
     * @param {fs.PathLike} directory 
     */
    makeDirectoryIfNotPresent: function (directory) {
        fs.existsSync(directory) || fs.mkdirSync(directory);
    },

    /**
     * Returns `IP` address of the server running the application
     */
    getServerIp: function () {
        return ipAddress;
    },

    /**
     * Returns `timestamp` in the a specific format basis the `type` passed
     * @param {"log"|"date"|"ts"|*} type 
     * @param {Date} date - defaults to `new Date()`
     */
    getTimestamp: function (type, date = new Date()) {
        switch (type) {
            case "log":
                return dateFormat(date, "yyyy-mm-dd HH:MM:ss.l");
            case "date":
                return dateFormat(date, "yyyy-mm-dd");
            case "ts":
            default:
                return dateFormat(date, "yyyy-mm-dd HH:MM:ss");
        }
    },

    /**
     * Generates and returns a `UUID`
     * @param {1|3|4|5} version - defaults to `4`
     */
    getUuid: function (version = 4) {
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
    maskEmail: function (message) {
        const emailRegex = new RegExp(/\b(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\b/, "g")
        return message.replace(emailRegex, "_email_")
    },

    /**
     * Returns stringified JSON replacing escaped double-quotes with single-qoutes
     * @param {JSON} data 
     */
    stringifyJson(data) {
        return JSON.stringify(data).replace(/\\+"/g, "'");
    }
}