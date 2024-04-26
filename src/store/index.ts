import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { app } from './app';
import buffers from './buffers';
import connection from './connection-info';
import hotlists from './hotlists';
import lines from './lines';
import nicklists from './nicklists';
import { persistMiddleware, persistReducer } from './persist';

export type StoreState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

const migrations: Record<number, (state: unknown) => StoreState> = {
  0: (state) => {
    return {
      ...(state as object),
      connection: {
        ...(state as { connection: object }).connection,
        mediaUploadOptions: {
          url: '',
          basicAuth: true
        }
      }
    } as StoreState;
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
  reducer: persistReducer<StoreState>(reducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(
      listenerMiddleware.middleware,
      persistMiddleware<StoreState>({
        key: 'state',
        allowlist: ['connection'],
        version: 0,
        migrate: (state: unknown, currentVersion: number): StoreState => {
          if (currentVersion !== 0) {
            return migrations[0](state);
          }
          return state as StoreState;
        }
      })
    )
});
