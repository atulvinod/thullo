require('dotenv').config();
require('module-alias/register');
const firebase = require('firebase/app');
const common = require('../util/commonUtility');
// Constants
global.constant = require('../util/constants');

// Common modules
global.common =  common;
global.canonicalLog = require('../util/canonicalLoggingUtility');
common.isTrue(process.env.ENABLE_PROMETHEUS_CLIENT) && (global.prometheus = require('../util/prometheusUtility'));

const firebaseConfig = {
    apiKey: process.env.FIREBASE_CONFIG__API_KEY,
    authDomain: process.env.FIREBASE_CONFIG__AUTH_DOMAIN,
    projectId: process.env.FIREBASE_CONFIG__PROJECT_ID,
    storageBucket: process.env.FIREBASE_CONFIG__STORAGE_BUCKET,
    messageSenderId: process.env.FIREBASE_CONFIG__MESSAGE_SENDER_ID,
    apiId: process.env.FIREBASE_CONFIG__API_ID,
};

global.firebaseApp = firebase.initializeApp(firebaseConfig);

// Logger for system utilities
global.sysLogger = require('../lib/logger').getLogger({ serverIp: common.getServerIp() });

// Core modules
common.isSet(process.env.REDIS_SETTINGS__HOST) && (global.redis = require('../lib/redis'));
