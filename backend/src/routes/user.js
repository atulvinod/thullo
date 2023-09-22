const router = require('@util/routerUtility').Router();
const RequestError = require('@errors/RequestError');
const User = require('@src/models/User');
const http_status_codes = require('http-status-codes');

router.post('/login', async (req, res, logger) => {
    const user_model = new User(logger);
    const data = await user_model.authenticateUser(req.body.email, req.body.password);
    return res.json({ data });
});

router.post('/register', async (req, res, logger) => {
    const { name, password, email } = req.body;
    const [image] = req.files;
    const user_model = new User(logger);
    const user_data = await user_model.createUser(name, email, password, image);

    return res.json({
        data: {
            ...user_data,
        },
    }).status(http_status_codes.StatusCodes.CREATED);
});

router.get('/search', async (req, res, logger) => {
    const query = req.query.name;
    if (!query) {
        throw new RequestError('Search name is required', http_status_codes.StatusCodes.BAD_REQUEST);
    }
    const user_model = new User(logger);
    const users = await user_model.findManyByName(query);
    return res.json({ data: users });
});

module.exports = router;
