import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore
} from 'redux-persist';

import buffers, { BufferState } from './buffers';
import connection, { ConnectionInfo } from './connection-info';
import hotlists, { HotListState } from './hotlists';
import lines, { LineState } from './lines';
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

const app = (
  state: AppState = initialState,
  action: { type: string; bufferId?: string }
) => {
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

export const store = configureStore({
  reducer: persistReducer(
    { storage: AsyncStorage, key: 'state', whitelist: ['connection'] },
    reducer
  ),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // https://github.com/rt2zz/redux-persist/issues/988
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // The following actions send the raw relay payload to the reducer,
          // which may contain non-serializable data.
          // FIXME: actions should be serializable.
          'FETCH_HOTLISTS',
          'FETCH_LINES',
          'BUFFER_LINE_ADDED'
        ],
        // The following state entries contain the raw relay payload which may
        // contain non-serializable data. The data is not persisted.
        // FIXME: state should be serializable.
        ignoredPaths: [/^lines\.*'/, /^hotlists\./, /^lines\./]
      }
    })
});

export const persistor = persistStore(store);
