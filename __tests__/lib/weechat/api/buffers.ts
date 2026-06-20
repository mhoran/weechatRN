import { configureStore } from '@reduxjs/toolkit';
import BuffersAction from '../../../../src/lib/weechat/api/buffers';
import type { BuffersResponse } from '../../../../src/lib/weechat/api/types';
import { reducer } from '../../../../src/store';
import type { AppState } from '../../../../src/store/app';

describe(BuffersAction, () => {
  it('removes references to buffers that have been closed', () => {
    const preloadedState = {
      hotlists: {
        '1709932823423765': {} as Hotlist,
        '1709932823238637': {} as Hotlist
      },
      nicklists: { '1709932823423765': [], '1709932823238637': [] },
      buffers: {
        '1709932823423765': {} as WeechatBuffer,
        '1709932823238637': {} as WeechatBuffer
      },
      lines: { '1709932823423765': [], '1709932823238637': [] },
      app: {
        currentBufferId: '1709932823423765'
      } as AppState
    };
    const store = configureStore({
      reducer,
      preloadedState,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = BuffersAction({
      code: 200,
      body_type: 'buffers',
      body: [{ id: 1709932823238637 } as BuffersResponse['body'][number]]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().buffers).not.toHaveProperty('1709932823423765');
    expect(store.getState().buffers).toHaveProperty('1709932823238637');

    expect(store.getState().hotlists).not.toHaveProperty('1709932823423765');
    expect(store.getState().hotlists).toHaveProperty('1709932823238637');

    expect(store.getState().nicklists).not.toHaveProperty('1709932823423765');
    expect(store.getState().nicklists).toHaveProperty('1709932823238637');

    expect(store.getState().lines).not.toHaveProperty('1709932823423765');
    expect(store.getState().lines).toHaveProperty('1709932823238637');

    expect(store.getState().app.currentBufferId).toBeNull();
  });

  it('preserves currentBufferId if the buffer is still open', () => {
    const preloadedState = {
      buffers: {
        '1709932823238637': {} as WeechatBuffer,
        '1709932823423765': {} as WeechatBuffer
      },
      app: {
        currentBufferId: '1709932823238637'
      } as AppState
    };
    const store = configureStore({
      reducer,
      preloadedState,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = BuffersAction({
      code: 200,
      body_type: 'buffers',
      body: [{ id: 1709932823238637 } as BuffersResponse['body'][number]]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().app.currentBufferId).toEqual('1709932823238637');
  });

  it('sets properties to the expected values', () => {
    const store = configureStore({
      reducer,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = BuffersAction({
      code: 200,
      body_type: 'buffers',
      body: [
        {
          id: 1730555173010842,
          name: 'irc.libera.#test'
        } as BuffersResponse['body'][number]
      ]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().buffers).toHaveProperty('1730555173010842');
    const buffer = store.getState().buffers['1730555173010842'];
    expect(buffer.id).toEqual('1730555173010842');
    expect(buffer._id).toEqual('1730555173010842');
    expect(buffer.full_name).toEqual('irc.libera.#test');
  });
});
