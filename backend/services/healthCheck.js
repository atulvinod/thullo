const db = require('../lib/database');
const common = require('../util/commonUtility');

module.exports = async function(req, res, logger) {
    let healthStatus = {};

    if (common.isSet(process.env.REDIS_SETTINGS__HOST)) {
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