const routerUtil = require("../util/routerUtility");
const router = routerUtil.Router();

const sample = require("../services/sample");
const validatorUtil = require("../util/validatorUtility");
const specs = require("../util/apiSpecs").external;


/**
 * Example routes
 * TODO: Replace and add actual routes, as required
 */
router.get("/", (req, res, logger, next) => {
    res.render("index", { title: "Express" });
});

router.asyncGet("/request", sample.getResponse);

router.asyncGet("/db", validatorUtil.getSpecValidator(specs.fetchFromDb), sample.fetchFromDb);

router.asyncPost("/redis", validatorUtil.getSpecValidator(specs.fetchFromRedis), sample.fetchFromRedis);

router.asyncGet("/async", sample.flowHelper);

module.exports = router;