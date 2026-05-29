import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAction } from '@reduxjs/toolkit';
import type {
  Action,
  Dispatch,
  Middleware,
  Reducer,
  UnknownAction
} from 'redux';

export const initializeStoreAction = createAction<unknown>(
  'persist/INITIALIZE_STORE'
);

export type PersistPartial = {
  _persist: { version: number; rehydrated: boolean };
};

const DEFAULT_VERSION = -1;

export const persistReducer = <S, A extends Action = UnknownAction, P = S>(
  rootReducer: Reducer<S, A, P>
): Reducer<S & PersistPartial, A, S & Partial<PersistPartial>> => {
  return (state, action) => {
    if (initializeStoreAction.match(action)) {
      const rehydratedState: S & PersistPartial = {
        ...state,
        ...(action.payload as S & PersistPartial)
      };
      const { _persist, ...rest } = rehydratedState;
      const nextState = rootReducer(rest as S, action);

      return { ...nextState, _persist };
    } else {
      const { _persist: _, ...rest } = state || {};
      const nextState = rootReducer(state ? (rest as S) : state, action);
      const _persist = state?._persist || {
        version: DEFAULT_VERSION,
        rehydrated: false
      };

      return { ...nextState, _persist };
    }
  };
};

export class AsyncStoragePersistor<S> implements Persistor<S> {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  getPersistedState = async (): Promise<(S & PersistPartial) | null> => {
    const persisted = await AsyncStorage.getItem(`persist:${this.key}`);

    if (!persisted) return null;

    const outer = JSON.parse(persisted || '{}') as Record<string, string>;
    const parsed = Object.fromEntries(
      Object.entries(outer).map(([key, value]) => [key, JSON.parse(value)])
    );

    return parsed as S & PersistPartial;
  };

  setPersistedState = (persistedKeys: string[], state: S) => {
    const inner = Object.fromEntries(
      persistedKeys.map((key) => [key, JSON.stringify(state[key as keyof S])])
    );
    void AsyncStorage.setItem(`persist:${this.key}`, JSON.stringify(inner));
  };
}

export interface Persistor<S> {
  getPersistedState(): Promise<(S & PersistPartial) | null>;
  setPersistedState(persistedKeys: string[], state: S): void;
}

export const persistMiddleware = <
  S,
  D extends Dispatch<UnknownAction> = Dispatch<UnknownAction>
>(options: {
  persistor: Persistor<S>;
  allowlist: string[];
  version?: number;
  migrate?: (state: unknown, currentVersion: number) => S;
}): Middleware<unknown, S, D> => {
  const persistedKeys = ['_persist', ...options.allowlist];

  return (store) => {
    void options.persistor.getPersistedState().then((parsed) => {
      const migrated =
        parsed && options.migrate
          ? options.migrate(parsed, parsed._persist.version)
          : parsed;

      const _persist = {
        version: options.version ?? DEFAULT_VERSION,
        rehydrated: true
      };

      const action = initializeStoreAction({ ...migrated, _persist });
      store.dispatch(action);
    });

    return (next) => (action) => {
      const beforeState = store.getState();
      const result = next(action);
      const afterState = store.getState() as S & PersistPartial;

      const changed = persistedKeys.some(
        (key) => beforeState[key as keyof S] !== afterState[key as keyof S]
      );

      if (afterState._persist.rehydrated && changed) {
        options.persistor.setPersistedState(persistedKeys, afterState);
      }

      return result;
    };
  };
};
