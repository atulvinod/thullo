/**
 * Sample service file
 * Only for demonstration purposes
 */
const httpClient = require("../util/httpClient");
let histClient = initPrometheusClient();

module.exports = {
    getResponse: async function (req, res, logger) {
        const response = await httpClient.postRequest(logger, "https://google.com", "someData");

        if (response && response.config) {
            histClient.observe(response.config.metaData.responseTime);
        }

        if (response && response.data) {
            res.status(response.status).send(response.data);
        } else {
            res.status(502).send("Request failed");
        }
    },

    fetchFromDb: async function (req, res, logger) {
        let result;
        try {
            result = await global.db.doSelect(logger, `select * from test where id = ?`, [req.query.id]);
        } catch (error) {
            if (error === "ER_NO_SUCH_TABLE") {
                return res.send("No data found!");
            } else {
                return res.status(500).send("Some error occurred!");
            }
        }
        res.send(result);
    },

    fetchFromRedis: async function (req, res, logger) {
        const result = await global.redis.get(logger, req.body.key);

        if (result) {
            res.send(result);
        } else {
            res.send("No data found!");
        }
    },

    /**
     * Method to depict use of promise, callback and async/await
     * @param {Express.Request} req 
     * @param {Express.Response} res 
     * @param {*} logger 
     */
    flowHelper: async function (req, res, logger) {
        testPromise(100).then(() => {
            logger.info("Promise resolved after response after Callback");
        });

        testCallback(50, () => {
            logger.info("Callback resolved after response before Promise");
        });

        await testAsync(logger, 10);

        res.send("Response to client");
    }
}

async function testAsync(logger, timeout) {
    await testPromise(timeout);
    logger.info("Await resolved before response");
}

function testPromise(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("someValue");
        }, timeout)
    });
}

function testCallback(timeout, cbFunction) {
    setTimeout(cbFunction, timeout);
}

function initPrometheusClient() {
    return global.prometheus.getHistogramClient("httpRequestTime", "Time taken for HTTP request in ms", [100, 500, 1000, 1500, 2000]);
}