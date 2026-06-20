import { configureStore } from '@reduxjs/toolkit';
import NicklistAction from '../../../../src/lib/weechat/api/nicklist';
import type { NicklistResponse } from '../../../../src/lib/weechat/api/types';
import { reducer } from '../../../../src/store';

describe(NicklistAction, () => {
  it('updates nicklists for all buffers on successful response', () => {
    const preloadedState = {
      nicklists: {},
      buffers: {
        '1709932823649184': {} as WeechatBuffer
      }
    };
    const store = configureStore({
      reducer,
      preloadedState,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = NicklistAction({
      code: 200,
      request: 'GET /api/buffers/1709932823649184/nicks',
      body_type: 'nick_group',
      body: {
        groups: [
          {
            groups: [],
            nicks: [
              {
                id: 1709932823649184,
                parent_group_id: 1709932823649181,
                name: 'alice',
                visible: true
              } as NicklistResponse['body']['groups'][number]['nicks'][number]
            ]
          }
        ]
      }
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().nicklists).toHaveProperty('1709932823649184');
    const nicklist = store.getState().nicklists['1709932823649184'];
    expect(nicklist).toHaveLength(1);
    expect(nicklist[0].name).toEqual('alice');
    expect(nicklist[0].visible).toEqual(1);
    expect(nicklist[0].group).toEqual(0);
  });
});
