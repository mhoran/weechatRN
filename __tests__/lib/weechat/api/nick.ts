import { configureStore } from '@reduxjs/toolkit';
import NickAction from '../../../../src/lib/weechat/api/nick';
import type { NickResponse } from '../../../../src/lib/weechat/api/types';
import { reducer } from '../../../../src/store';

describe(NickAction, () => {
  describe('on _nicklist_diff', () => {
    it('synchronizes the nicklist state with the provided diff', () => {
      const preloadedState = {
        nicklists: {
          '1781915575905631': [
            {
              id: '1781925971856057',
              name: 'oldnick'
            } as WeechatNicklist
          ]
        }
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      let action = NickAction({
        code: 0,
        buffer_id: 1781915575905631,
        event_name: 'nicklist_nick_removing',
        body_type: 'nick',
        body: {
          id: 1781925971856057,
          name: 'oldnick',
          visible: true
        } as NickResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      action = NickAction({
        code: 0,
        buffer_id: 1781915575905631,
        event_name: 'nicklist_nick_added',
        body_type: 'nick',
        body: {
          id: 1781926709499807,
          name: 'newnick',
          visible: true
        } as NickResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().nicklists).toMatchObject({
        '1781915575905631': [{ name: 'newnick' }]
      });
    });
  });
});
