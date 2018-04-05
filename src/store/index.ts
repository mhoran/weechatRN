import { compose, combineReducers, createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import buffers, { BufferState } from "./buffers";
import lines, { LineState } from "./lines";
import hotlists, { HotListState } from "./hotlists";
import connection, { ConnectionInfo } from "./connection-info";
import nicklists, { NicklistState } from "./nicklists";

type AppState = {
  connected: boolean;
  currentBufferId: string | null;
};

export type StoreState = {
  app: AppState;
  connection: ConnectionInfo;
  buffers: BufferState;
  lines: LineState;
  hotlists: HotListState;
  nicklists: NicklistState;
};

const initialState: AppState = {
  connected: false,
  currentBufferId: null
};

const app = (state: AppState = initialState, action) => {
  switch (action.type) {
    case "DISCONNECT":
      return {
        ...state,
        connected: false
      };
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
  lines,
  connection,
  hotlists,
  nicklists
});

const composeEnhancers =
  (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  persistReducer({ storage, key: "state", whitelist: ["connection"] }, reducer),
  composeEnhancers(applyMiddleware(thunk))
);

export const persistor = persistStore(store);
