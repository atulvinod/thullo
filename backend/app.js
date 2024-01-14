
const createError = require('http-errors');
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('./config/globals');

const boards = require('@src/routes/boards');
const userRouter = require('@src/routes/user');
const fileUploadsRouter = require('@src/routes/files');
const multer = require('multer');
const upload = multer();

const auth = require('@lib/auth');
const serverUtil = require('./util/serverUtility');

const app = express();
const cors = require('cors');
const database = require('@lib/database');

// Init app components (conditionally)
common.isSet(process.env.REDIS_SETTINGS__HOST) && global.redis.connect();

// Expose metrics if prometheus client is enabled
common.isTrue(process.env.ENABLE_PROMETHEUS_CLIENT) && app.use('/metrics', global.prometheus.requestHandler);


app.use(cors());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Request body parsers for different contentTypes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Remove X-Powered-By header
app.disable('x-powered-by');

// Setting access logger
app.use(serverUtil.accessLogger());

// Setting metadata to request object
app.use(serverUtil.setRequestMetadata);

// Logging HTTP API request and response
app.use(serverUtil.logRequestBody);
app.use(serverUtil.logResponseBody);

// Serving static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(upload.any());

app.use('/v1/user', userRouter);
app.use(auth.authenticate);

app.use('/v1/boards', boards);
app.use('/v1/files', fileUploadsRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// HTTP Error handler
app.use(serverUtil.handleHTTPError);

database.validateConnection(global.sysLogger).then(result => {
    if (result.isConnected) {
        console.log('Database Connected');
    } else {
        console.error(result.connectionError);
    }
});

module.exports = app;
