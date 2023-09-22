import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { rootReducer } from './root.reducer';
import { applyMiddleware, compose } from 'redux';
import { legacy_createStore as createStore } from 'redux'


const middlewares = [logger, thunk];
const composedMiddlewares = compose(applyMiddleware(...middlewares));

export const store = createStore(rootReducer, undefined, composedMiddlewares);