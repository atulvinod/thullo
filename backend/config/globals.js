require('module-alias/register');
const firebase = require('firebase/app');
const config = require('./config');
// Constants
global.constant = require('../util/constants');

// Common modules
global.config = config;
global.common = require('../util/commonUtility');
global.canonicalLog = require('../util/canonicalLoggingUtility');
common.isTrue(global.config.enablePrometheusClient) && (global.prometheus = require('../util/prometheusUtility'));

global.firebaseApp = firebase.initializeApp(config.firebaseConfig);

// Logger for system utilities
global.sysLogger = require('../lib/logger').getLogger({ serverIp: common.getServerIp() });

// Core modules
common.isSet(global.config.redisSettings) && (global.redis = require('../lib/redis'));
