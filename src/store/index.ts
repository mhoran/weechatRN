import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { AnyAction, combineReducers } from 'redux';
import {
  FLUSH,
  MigrationManifest,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createMigrate,
  persistReducer,
  persistStore
} from 'redux-persist';

import buffers from './buffers';
import connection from './connection-info';
import hotlists from './hotlists';
import lines from './lines';
import nicklists from './nicklists';

type AppState = {
  connected: boolean;
  currentBufferId: string | null;
};

export type StoreState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

const initialState: AppState = {
  connected: false,
  currentBufferId: null
};

const app = (state: AppState = initialState, action: AnyAction): AppState => {
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
    case 'BUFFER_CLOSED':
      return {
        ...state,
        currentBufferId:
          action.bufferId === state.currentBufferId
            ? null
            : state.currentBufferId
      };
    case 'FETCH_BUFFERS_REMOVED':
      return {
        ...state,
        currentBufferId:
          state.currentBufferId &&
          action.payload.includes(state.currentBufferId)
            ? null
            : state.currentBufferId
      };
    case 'UPGRADE': {
      return { ...state, currentBufferId: null };
    }
    default:
      return state;
  }
};

// FIXME: https://github.com/rt2zz/redux-persist/issues/1065
const migrations: MigrationManifest = {
  0: (state) => {
    if (!state) return;
    const storeState = state as unknown as StoreState;
    return {
      ...state,
      connection: {
        ...storeState.connection,
        mediaUploadOptions: {
          url: '',
          basicAuth: true
        }
      }
    };
  }
};

const listenerMiddleware = createListenerMiddleware();

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
    {
      storage: AsyncStorage,
      key: 'state',
      whitelist: ['connection'],
      version: 0,
      migrate: createMigrate(migrations, {
        debug: false
      })
    },
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
          REGISTER
        ]
      }
    }).prepend(listenerMiddleware.middleware)
});

export const persistor = persistStore(store);
