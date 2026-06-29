import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { app } from './app';
import buffers from './buffers';
import hotlists from './hotlists';
import lines from './lines';
import nicklists from './nicklists';
import { persistMiddleware, persistReducer } from './persist';
import type { MediaUploadOptions } from './settings';
import settings from './settings';

export type StoreState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;

const migrations: Record<number, (state: unknown) => unknown> = {
  0: (state) => {
    return {
      connection: {
        ...(
          state as {
            connection: {
              hostname: string | null;
              password: string | null;
              ssl: boolean;
              filterBuffers: boolean;
            };
          }
        ).connection,
        mediaUploadOptions: {
          url: '',
          basicAuth: true
        }
      }
    };
  },
  1: (state): Partial<StoreState> => {
    const {
      connection: { hostname, password, mediaUploadOptions, ...connection }
    } = state as {
      connection: {
        hostname: string | null;
        password: string | null;
        ssl: boolean;
        filterBuffers: boolean;
        mediaUploadOptions: MediaUploadOptions;
      };
    };

    let u;
    try {
      u = new URL(`ws://${hostname ?? ''}`);
      u.pathname = u.pathname === '/' ? '/weechat' : `${u.pathname}/weechat`;
    } catch {
      /* empty */
    }

    return {
      settings: {
        ...connection,
        hostname: u?.host ?? null,
        path: u?.pathname ?? null,
        password: password || null,
        mediaUploadOptions: {
          ...mediaUploadOptions,
          url: mediaUploadOptions.url || undefined
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
  settings,
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
        allowlist: ['settings'],
        version: 1,
        migrate: (
          currentState: unknown,
          currentVersion: number
        ): StoreState => {
          let state = currentState;
          for (let next = currentVersion + 1; next <= 1; next++) {
            state = migrations[next](state);
          }
          return state as StoreState;
        }
      })
    )
});
