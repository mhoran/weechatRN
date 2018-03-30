import { combineReducers, createStore, applyMiddleware } from "redux";

import buffers from "./buffers";
import lines from "./lines";

const app = (state = { connected: false }, action) => {
  switch (action.type) {
    case "FETCH_VERSION":
      return {
        connected: true
      };
    default:
      return state;
  }
};

const reducer = combineReducers({
  app,
  buffers,
  lines
});

export default createStore(
  reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
