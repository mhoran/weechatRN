import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Reducer,
  configureStore,
  createAction,
  createReducer
} from '@reduxjs/toolkit';
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

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
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
  await AsyncStorage.setItem(
    'persist:state',
    JSON.stringify({
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
      allowed: JSON.stringify(true)
    })
  );
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ key: 'state', allowlist: ['allowed'] })
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
        persistMiddleware({ key: 'state', allowlist: ['allowed'] })
      )
  });

  await jest.runAllTimersAsync();

  expect(store.getState()._persist?.rehydrated).toEqual(true);

  store.dispatch(testAction());

  await jest.runAllTimersAsync();

  const persisted = await AsyncStorage.getItem('persist:state');
  expect(persisted).not.toBeNull();

  const outer = JSON.parse(persisted!);

  expect(outer).toHaveProperty('_persist');
  expect(outer).toHaveProperty('allowed');

  const _persist = JSON.parse(outer['_persist']);
  const allowed = JSON.parse(outer['allowed']);

  expect(_persist.version).toEqual(-1);
  expect(_persist.rehydrated).toEqual(true);
  expect(allowed).toEqual(true);
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
        persistMiddleware({ key: 'state', allowlist: ['allowed'] })
      )
  });

  expect(initializeMock).not.toHaveBeenCalled();

  store.dispatch(testAction());

  await jest.runAllTimersAsync();

  const persisted = await AsyncStorage.getItem('persist:state');
  expect(persisted).toBeNull();
});

it('does not persist unallowed keys', async () => {
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({ key: 'state', allowlist: ['allowed'] })
      )
  });

  await jest.runAllTimersAsync();

  store.dispatch(testAction());

  await jest.runAllTimersAsync();

  const persisted = await AsyncStorage.getItem('persist:state');
  expect(persisted).not.toBeNull();

  const outer = JSON.parse(persisted!);

  expect(outer).toHaveProperty('allowed');
  expect(outer).not.toHaveProperty('unallowed');
});

it('does not run migrations when there is no persisted state', async () => {
  const migrate = jest.fn();
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({
          key: 'state',
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
  await AsyncStorage.setItem(
    'persist:state',
    JSON.stringify({
      _persist: JSON.stringify({ version: -1, rehydrated: true }),
      allowed: JSON.stringify(true)
    })
  );
  const migrate = jest.fn(() => ({
    _persist: { version: -1, rehydrated: true },
    allowed: true
  }));
  const store = configureStore({
    reducer: persistReducer(reducer),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(
        persistMiddleware({
          key: 'state',
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
