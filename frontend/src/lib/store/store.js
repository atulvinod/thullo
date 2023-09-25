import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { rootReducer } from './root.reducer';
import { applyMiddleware, compose } from 'redux';
import { legacy_createStore as createStore } from 'redux'

const middlewares = [];
if (!process.env.REACT_APP_ENV || process.env.REACT_APP_ENV.toLowerCase() == 'dev') {
    middlewares.push(logger);
}
middlewares.push(thunk)
const composedMiddlewares = compose(applyMiddleware(...middlewares));

export const store = createStore(rootReducer, undefined, composedMiddlewares);