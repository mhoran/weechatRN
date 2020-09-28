import { combineReducers, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import buffers, { BufferState } from './buffers';
import lines, { LineState } from './lines';
import hotlists, { HotListState } from './hotlists';
import connection, { ConnectionInfo } from './connection-info';
import nicklists, { NicklistState } from './nicklists';

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
    case 'DISCONNECT':
      return {
        ...state,
        connected: false
      };
    case 'FETCH_VERSION':
      return {
        ...state,
        connected: true
      };
    case 'CHANGE_CURRENT_BUFFER':
      return {
        ...state,
        currentBufferId: action.bufferId
      };
    default:
      return state;
  }
};

export const reducer = combineReducers({
  app,
  buffers,
  lines,
  connection,
  hotlists,
  nicklists
});

export const store = createStore(
  persistReducer({ storage, key: 'state', whitelist: ['connection'] }, reducer),
  composeWithDevTools(applyMiddleware(thunk))
);

export const persistor = persistStore(store);
