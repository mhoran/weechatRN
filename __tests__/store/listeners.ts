import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import RelayClient from '../../src/lib/weechat/client';
import type { AppDispatch, StoreState } from '../../src/store';
import { reducer } from '../../src/store';
import * as actions from '../../src/store/actions';
import { PendingBufferNotificationListener } from '../../src/store/listeners';

jest.useFakeTimers();

describe(PendingBufferNotificationListener, () => {
  it('ensures that the relay is connected before dispatching the notification', async () => {
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.isConnected = jest.fn(() => true);
    client.ping = jest.fn();

    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
      reducer,
      preloadedState: {
        buffers: {
          ['83a41cd80']: {
            _id: 1730555173010842,
            full_name: 'irc.libera.#weechat',
            hidden: 0,
            id: '83a41cd80',
            local_variables: {
              channel: '#weechat',
              name: 'libera.#weechat',
              plugin: 'irc',
              type: 'channel'
            },
            notify: 3,
            number: 2,
            pointers: ['83a41cd80'],
            short_name: '#weechat',
            title: '',
            type: 0
          }
        }
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    listenerMiddleware.startListening.withTypes<StoreState, AppDispatch>()(
      PendingBufferNotificationListener(client)
    );

    store.dispatch(
      actions.pendingBufferNotificationAction({
        identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9',
        bufferId: 1730555173010842,
        lineId: 0
      })
    );

    store.dispatch(actions.pongAction());
    await jest.runAllTimersAsync();

    expect(client.isConnected).toHaveBeenCalled();
    expect(client.ping).toHaveBeenCalled();
    expect(store.getState().app.notification).not.toBeNull();
    expect(store.getState().app.notification!.identifier).toEqual(
      '1fb4fc1d-530b-466f-85be-de27772de0a9'
    );
    expect(store.getState().app.notification!.bufferId).toEqual('83a41cd80');
    expect(store.getState().app.notification!.lineId).toEqual(0);
  });

  it('refreshes the buffer list when disconnected before dispatching the notification', async () => {
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.isConnected = jest.fn(() => false);
    client.ping = jest.fn();

    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    listenerMiddleware.startListening.withTypes<StoreState, AppDispatch>()(
      PendingBufferNotificationListener(client)
    );

    store.dispatch(
      actions.pendingBufferNotificationAction({
        identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9',
        bufferId: 1730555173010842,
        lineId: 0
      })
    );

    store.dispatch(
      actions.fetchBuffersAction({
        ['83a41cd80']: {
          _id: 1730555173010842,
          full_name: 'irc.libera.#weechat',
          hidden: 0,
          id: '83a41cd80',
          local_variables: {
            channel: '#weechat',
            name: 'libera.#weechat',
            plugin: 'irc',
            type: 'channel'
          },
          notify: 3,
          number: 2,
          pointers: ['83a41cd80'],
          short_name: '#weechat',
          title: '',
          type: 0
        }
      })
    );
    await jest.runAllTimersAsync();

    expect(client.isConnected).toHaveBeenCalled();
    expect(store.getState().app.notification).not.toBeNull();
    expect(store.getState().app.notification!.identifier).toEqual(
      '1fb4fc1d-530b-466f-85be-de27772de0a9'
    );
    expect(store.getState().app.notification!.bufferId).toEqual('83a41cd80');
    expect(store.getState().app.notification!.lineId).toEqual(0);
  });

  it('does not dispatch the notification if the buffer is not in the buffer list', async () => {
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.isConnected = jest.fn(() => false);
    client.ping = jest.fn();

    const listenerMiddleware = createListenerMiddleware();
    const store = configureStore({
      reducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(listenerMiddleware.middleware),
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    listenerMiddleware.startListening.withTypes<StoreState, AppDispatch>()(
      PendingBufferNotificationListener(client)
    );

    store.dispatch(
      actions.pendingBufferNotificationAction({
        identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9',
        bufferId: 1730555173010842,
        lineId: 0
      })
    );

    store.dispatch(actions.fetchBuffersAction({}));
    await jest.runAllTimersAsync();

    expect(client.isConnected).toHaveBeenCalled();
    expect(store.getState().app.notification).toBeNull();
  });
});
