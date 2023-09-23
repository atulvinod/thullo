const prometheus = require("prom-client");


//Adds appName to labels for all clients, by default
prometheus.register.setDefaultLabels({ appName: process.env.APP_NAME });


/**
 * Initialises a prometheus histogram client
 * @param {string} name 
 * @param {string} description 
 * @param {number[]} buckets 
 * @param {string[]} labels 
 */
function getHistogramClient (name, description, buckets, labels = []) {
    return getPrometheusClient("Histogram", { name: name, help: description, buckets: buckets, labelNames: labels });
}

/**
 * Initialises a prometheus client for the given `metricType`
 * @param {"Counter"|"Gauge"|"Histogram"|"Summary"} metricType
 * @param {JSON} config
 */
function getPrometheusClient (metricType, config) {
    return new prometheus[metricType](config);
}

/**
 * Request handler for Prometheus server's scraping request
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {*} next 
 */
async function requestHandler (req, res, next) {
    const metrics = await prometheus.register.metrics();
    res.header("content-type", prometheus.register.contentType).send(metrics);
}

module.exports = {
    getHistogramClient: getHistogramClient,
    requestHandler: requestHandler
}