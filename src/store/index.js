import { combineReducers, createStore, applyMiddleware } from "redux";

import buffer from "../usecase/buffers/reducers/BufferReducer";

const app = (state = {}, action) => {
  return state;
};

const reducer = combineReducers({
  app,
  buffer
});

export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
