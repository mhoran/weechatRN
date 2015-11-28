import { combineReducers, createStore, applyMiddleware } from 'redux';
import logger from 'redux-diff-logger';

import buffer from '../usecase/buffers/reducers/BufferReducer';


const app = (state = {}, action) => {
    return state;
};

const reducer = combineReducers({
    app,
    buffer
});


const createStoreWithMiddleware = applyMiddleware(logger)(createStore);

export default createStoreWithMiddleware(reducer);