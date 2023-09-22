const express = require('express');
const _logger = require('../lib/logger');

/**
 * Returns custom express `Router`
 * @param {express.RouterOptions|undefined} options
 */
function Router(options) {
    const router = express.Router(options);
    overrideApiRouters(router);
    return router;
}

/**
 * Overrides `router` original route methods and adds new route methods for `async` handlers
 * @param {express.Router} router
 */
function overrideApiRouters(router) {
    const routeMethods = ['all', 'get', 'post', 'put', 'delete', 'patch', 'options', 'head'];
    const defaultFunctions = {};

    for (const method of routeMethods) {
        defaultFunctions[method] = router[method];
        // Overriding routeMethod and adding corresponding async routeMethod
        router[method] = getRouter(router, defaultFunctions[method]);
    }
}


/**
 * Returns a wrapper function over `handler` for passing extra `logger` param
 * @param {function} handler
 */
function getCustomHandler(handler) {
    return async (req, res, next) => {
        try {
            await handler(req, res, _logger.getLogger(req.logParams, req), next);
        } catch (error) {
            next(error);
        }
    };
}

/**
 * Returns an overriden `routeMethod` for the `originalFunction` passed
 * @param {express.Router} router
 * @param {function} originalFunction
 * @param {boolean} isSync
 */
function getRouter(router, originalFunction, isSync = true) {
    return (path, ...handlers) => {
        const updatedHandlers = [];
        for (const handler of handlers) {
            const updatedHandler = getCustomHandler(handler);
            updatedHandlers.push(updatedHandler);
        }
        return originalFunction.apply(router, [path, ...updatedHandlers]);
    };
}

module.exports = {
    Router,
};
