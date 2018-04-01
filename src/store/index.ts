import { combineReducers, createStore, applyMiddleware } from "redux";

import buffers, { BufferState } from "./buffers";
import lines, { LineState } from "./lines";

type AppState = {
  connected: boolean;
  currentBufferId: string | null;
};

export type StoreState = {
  app: AppState;
  buffers: BufferState;
  lines: LineState;
};

const initialState: AppState = {
  connected: false,
  currentBufferId: null
};

const app = (state: AppState = initialState, action) => {
  switch (action.type) {
    case "FETCH_VERSION":
      return {
        ...state,
        connected: true
      };
    case "CHANGE_CURRENT_BUFFER":
      return {
        ...state,
        currentBufferId: action.bufferId
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
