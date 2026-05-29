import type { Reducer } from '@reduxjs/toolkit';
import { configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import type { PersistPartial, Persistor } from '../../src/store/persist';
import {
  initializeStoreAction,
  persistMiddleware,
  persistReducer
} from '../../src/store/persist';

jest.useFakeTimers();

const testAction = createAction('persist/TEST');
const reducer = createReducer({ preloaded: false }, (builder) => {
  builder.addCase(testAction, (state) => {
    return { ...state, allowed: true, unallowed: true };
  });
});

let dummyPersistor: Persistor<Record<string, unknown>>;

beforeEach(() => {
  dummyPersistor = new (class<S> implements Persistor<S> {
    state: (S & PersistPartial) | null = null;

    getPersistedState(): Promise<(S & PersistPartial) | null> {
      return Promise.resolve(this.state);
    }

    setPersistedState(persistedKeys: string[], state: S & PersistPartial) {
      const inner = Object.fromEntries(
        persistedKeys.map((key) => [key, state[key as keyof S]])
      );

      this.state = inner as S & PersistPartial;
    }
  })();
});

it('defaults _persist state prior to rehydration', () => {
  const state = persistReducer(reducer)(undefined, { type: '@@init' });

  expect(state._persist?.version).toEqual(-1);
  expect(state._persist?.rehydrated).toEqual(false);
  expect(state.preloaded).toEqual(false);
});

it('merges _persist state with preloaded state', () => {
  const preloadedState = { preloaded: true };
  const state = persistReducer(reducer)(preloadedState, { type: '@@init' });

  expect(state._persist?.version).toEqual(-1);
  expect(state._persist?.rehydrated).toEqual(false);
  expect(state.preloaded).toEqual(true);
});

it('merges persisted state on rehydration', async () => {
  dummyPersistor.setPersistedState(['_persist', 'allowed'], {
    _persist: { version: -1, rehydrated: true },
    allowed: true
  });
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ persistor: dummyPersistor, allowlist: ['allowed'] })
      )
  });

  await jest.runAllTimersAsync();

  expect(store.getState()._persist?.version).toEqual(-1);
  expect(store.getState()._persist?.rehydrated).toEqual(true);
  expect((store.getState() as Record<string, unknown>).allowed).toEqual(true);
});

it('persists allowlisted keys on dispatch', async () => {
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ persistor: dummyPersistor, allowlist: ['allowed'] })
      )
  });

  await jest.runAllTimersAsync();

  expect(store.getState()._persist?.rehydrated).toEqual(true);

  store.dispatch(testAction());

  const persisted = await dummyPersistor.getPersistedState();
  expect(persisted).not.toBeNull();

  expect(persisted).toHaveProperty('_persist');
  expect(persisted).toHaveProperty('allowed');

  expect(persisted!._persist.version).toEqual(-1);
  expect(persisted!._persist.rehydrated).toEqual(true);
  expect(persisted!.allowed).toEqual(true);
});

it('does not persist before rehydration', async () => {
  const initializeMock = jest.fn();
  const mockPersistReducer = (baseReducer: Reducer) =>
    createReducer(
      { _persist: { rehydrated: false, version: -1 } },
      (builder) => {
        builder.addCase(initializeStoreAction, () => initializeMock());
        builder.addDefaultCase((state, action) => baseReducer(state, action));
      }
    );
  const store = configureStore({
    reducer: mockPersistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ persistor: dummyPersistor, allowlist: ['allowed'] })
      )
  });

  expect(initializeMock).not.toHaveBeenCalled();

  store.dispatch(testAction());

  const persisted = await dummyPersistor.getPersistedState();
  expect(persisted).toBeNull();
});

it('does not persist unallowed keys', async () => {
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ persistor: dummyPersistor, allowlist: ['allowed'] })
      )
  });

  await jest.runAllTimersAsync();

  store.dispatch(testAction());

  const persisted = await dummyPersistor.getPersistedState();
  expect(persisted).not.toBeNull();

  expect(persisted).toHaveProperty('allowed');
  expect(persisted).not.toHaveProperty('unallowed');
});

it('does not run migrations when there is no persisted state', async () => {
  const migrate = jest.fn();
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({
          persistor: dummyPersistor,
          allowlist: ['allowed'],
          version: 0,
          migrate
        })
      )
  });

  await jest.runAllTimersAsync();

  expect(migrate).not.toHaveBeenCalled();
  expect(store.getState()._persist.version).toEqual(0);
  expect(store.getState()._persist.rehydrated).toEqual(true);
});

it('runs necessary migrations', async () => {
  dummyPersistor.setPersistedState(['_persist', 'allowed'], {
    _persist: { version: -1, rehydrated: true },
    allowed: true
  });
  const migrate = jest.fn(() => ({
    _persist: { version: -1, rehydrated: true },
    allowed: true
  }));
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({
          persistor: dummyPersistor,
          allowlist: ['allowed'],
          version: 0,
          migrate
        })
      )
  });

  await jest.runAllTimersAsync();

  expect(migrate).toHaveBeenCalled();
  expect(store.getState()._persist.version).toEqual(0);
  expect(store.getState()._persist.rehydrated).toEqual(true);
  expect(store.getState().allowed).toEqual(true);
});
