import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
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
import { app } from './app';

export type StoreState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

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
