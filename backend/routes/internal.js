const routerUtil = require("../util/routerUtility");
const router = routerUtil.Router();

const healthCheck = require("../services/healthCheck");


//Health Check
router.get("/health", healthCheck);

module.exports = router;
