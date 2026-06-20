import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../../../src/store';
import type { AppState } from '../../../../src/store/app';
import HotlistAction from '../../../../src/lib/weechat/api/hotlist';

describe(HotlistAction, () => {
  it('updates hotlists for all buffers except the current buffer', () => {
    const preloadedState = {
      hotlists: {},
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

    const action = HotlistAction({
      code: 200,
      body_type: 'hotlist',
      body: [
        { buffer_id: 1709932823238637, count: [0, 1, 0, 0] },
        { buffer_id: 1709932823423765, count: [0, 1, 0, 1] }
      ]
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().hotlists).not.toHaveProperty('1709932823238637');
    expect(store.getState().hotlists).toHaveProperty('1709932823423765');
    const hotlist = store.getState().hotlists['1709932823423765'];
    expect(hotlist.message).toEqual(1);
    expect(hotlist.message).toEqual(1);
    expect(hotlist.sum).toEqual(2);
    expect(hotlist.buffer).toEqual('1709932823423765');
  });
});
