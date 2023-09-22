const db = require('../lib/database');

module.exports = async function(req, res, logger) {
    let healthStatus = {};

    if (common.isSet(global.config.redisSettings)) {
        healthStatus["redis"] = await global.redis.validateConnection(logger);
    }

    healthStatus["db"] = await db.validateConnection(logger);

    for (const component in healthStatus) {
        if (!healthStatus[component].isConnected) {
            res.status(500);
            break;
        }
    }

    res.json(healthStatus);
}