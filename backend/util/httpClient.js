const { default: axios, AxiosRequestConfig, AxiosResponse } = require("axios");
const axiosRetry = require("axios-retry");
const stackTrace = require("stack-trace");
const commonUtility = require("./commonUtility");


const HEADERS = {
    CONTENT_TYPE: {
        JSON: 'application/json',
        FORM_URL_ENCODED: 'application/x-www-form-urlencoded'
    }
}

/**
 * Processes a POST request and returns the `response`, if received
 * @param {*} logger 
 * @param {string} url 
 * @param {JSON} headers 
 * @param {*} data 
 * @param {{timeoutInMs?: number, retryCount?: number, retryDelayInMs?: number}} config - defaults to `null`
 */
async function postRequest(logger, url, data, headers = null, config = null) {
    return (await _request(logger, url, "POST", data, headers, config));
}

/**
 * Sends a request to the given `url` with provided `headers` and `data` and returns the `response`, if received
 * @param {*} logger 
 * @param {string} url 
 * @param {"GET"|"POST"|"DELETE"|"HEAD"|"OPTIONS"|"PUT"|"PATCH"} method
 * @param {*} data
 * @param {JSON|null} headers 
 * @param {{timeoutInMs?: number, retryCount?: number, retryDelayInMs?: number}} config
 */
async function _request(logger, url, method, data, headers, config) {
    try {
        const trace = stackTrace.get()[2]; //Passing stack trace for calling function
        const client = _getRetryClient(logger, url, config, trace);
        const response = await client.request({ url: url, method: method, headers: headers || {} , data: data });
        return response;
    } catch (error) {
        logger.error(`Error occurred while sending request to ${url}: ${error}`);
    }
}

/**
 * Creates and returns a retry client set basis the config
 * @param {*} logger 
 * @param {string} requestUrl 
 * @param {{timeoutInMs?: number, retryCount?: number, retryDelayInMs?: number}} requestConfig
 * @param {stackTrace.StackFrame} stackTrace
 */
function _getRetryClient(logger, requestUrl, requestConfig, stackTrace) {
    const clientSettings = {...global.config.httpClientSettings, ...requestConfig};
    const axiosClient = _getAxiosClient(logger, clientSettings.timeoutInMs, stackTrace);

    axiosRetry(axiosClient, {
        retries: Number(clientSettings.retryCount),
        retryDelay: () => { return clientSettings.retryDelayInMs },
        retryCondition: _retryCondition.bind({ logger: logger, url: requestUrl }),
        shouldResetTimeout: true
    });

    return axiosClient;
}

/**
 * Creates and returns a new Axios instance
 * @param {*} logger
 * @param {number} timeoutInMs 
 * @param {stackTrace.StackFrame} stackTrace
 */
function _getAxiosClient(logger, timeoutInMs, stackTrace) {
    const client = axios.create({ timeout: timeoutInMs });

    client.interceptors.request.use((config) => {
        _requestInterceptor(logger, config, stackTrace);
        return config;
    });

    client.interceptors.response.use((response) => {
        _responseInterceptor(logger, response, stackTrace);
        return response;
    }, (error) => {
        error.config.metaData.responseTime = Date.now() - error.config.metaData.requestStartTime;
        logger.httpLog({ url: error.config.url, responseTimeInMs: error.config.metaData.responseTime, statusCode: error.response?.status });
        return Promise.reject(error);
    });

    return client;
}

/**
 * Interceptor for Axios HTTP request 
 * @param {*} logger 
 * @param {AxiosRequestConfig} config 
 * @param {stackTrace.StackFrame} stackTrace 
 */
 function _requestInterceptor(logger, config, stackTrace) {
    canonicalLog.incrementApiCounter(logger);
    config.metaData = config.metaData || {};
    config.metaData.requestStartTime = Date.now();
    config.metaData.id = commonUtility.getUuid();
    let message = `Sending ${config.method.toUpperCase()} request to URL: ${config.baseURL ? (config.baseURL + config.url): config.url} with ID: ${config.metaData.id}`;
    logger.info(message, {trace: stackTrace});
    config.data && (message += `, Data: ${typeof config.data === "object"? JSON.stringify(config.data) : config.data.toString()}`);
    config.params && (message += `, Params: ${JSON.stringify(config.params)}`);
    logger.curlLog(message, stackTrace);
}

/**
 * Interceptor for Axios HTTP response 
 * @param {*} logger 
 * @param {AxiosResponse} response 
 * @param {stackTrace.StackFrame} stackTrace 
 */
function _responseInterceptor(logger, response, stackTrace) {
    response.config.metaData.responseTime = Date.now() - response.config.metaData.requestStartTime;
    const responseDataLog = typeof response.data === "object" ? JSON.stringify(response.data) : response.data;
    logger.httpLog({ url: response.config.url, id: response.config.metaData.id, responseTimeInMs: response.config.metaData.responseTime, statusCode: response.status });
    let message = `Response received for request ID ${response.config.metaData.id} in ${response.config.metaData.responseTime} ms - Status: ${response.status}`;
    logger.info(message, {trace: stackTrace});
    logger.curlLog(`${message} with Data: ${responseDataLog}, Headers: ${JSON.stringify(response.headers)}`, stackTrace);
}


/**
 * Returns condition for retrying the request
 * @param {Error} error 
 */
function _retryCondition(error) {
    this.logger.error(`HTTP request to ${this.url} failed with error: ${error.stack ? error.stack : error}`);
    return (!error.response || (error.response.status >= 500 && error.response.status <= 599));
}

module.exports = {
    HEADERS,
    postRequest
}