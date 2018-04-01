import { combineReducers, createStore, applyMiddleware } from "redux";

import buffers, { BufferState } from "./buffers";
import lines, { LineState } from "./lines";

type AppState = {
  connected: boolean;
};

export type StoreState = {
  app: AppState;
  buffers: BufferState;
  lines: LineState;
};

const app = (state: AppState = { connected: false }, action) => {
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
  (<any>window).__REDUX_DEVTOOLS_EXTENSION__ &&
    (<any>window).__REDUX_DEVTOOLS_EXTENSION__()
);
