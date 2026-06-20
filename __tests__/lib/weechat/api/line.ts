import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../../../src/store';
import type { LineResponse } from '../../../../src/lib/weechat/api/types';
import LineAction from '../../../../src/lib/weechat/api/line';

describe(LineAction, () => {
  describe('on buffer_line_added', () => {
    const createBufferLineAddedAction = ({
      id,
      buffer_id,
      date,
      tags,
      notify_level,
      highlight,
      displayed
    }: {
      id: number;
      buffer_id: number;
      date: string;
      tags: string[];
      notify_level?: number;
      highlight?: boolean;
      displayed?: boolean;
    }) => {
      return LineAction({
        code: 0,
        event_name: 'buffer_line_added',
        buffer_id,
        body_type: 'line',
        body: {
          id,
          date,
          date_printed: date,
          tags: tags,
          notify_level,
          highlight: highlight || false,
          displayed: displayed || true
        } as LineResponse['body']
      });
    };

    it('sets id to the id provided by the relay', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = createBufferLineAddedAction({
        id: 0,
        buffer_id: 1709932823238637,
        date: '2024-11-09T00:02:07.000Z',
        tags: []
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('1709932823238637');
      const lines = store.getState().lines['1709932823238637'];
      expect(lines[0].id).toEqual(0);
    });

    it('converts notify_level to a signed integer', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = createBufferLineAddedAction({
        id: 0,
        buffer_id: 1709932823238637,
        date: '2024-11-09T00:02:07.000Z',
        tags: [],
        notify_level: -1
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('1709932823238637');
      const lines = store.getState().lines['1709932823238637'];
      expect(lines[0].notify_level).toEqual(-1);
    });

    it('updates hotlist using notify_level when provided', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      let action = createBufferLineAddedAction({
        id: 0,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: [],
        notify_level: 0,
        highlight: false
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      action = createBufferLineAddedAction({
        id: 1,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: [],
        notify_level: 1,
        highlight: false
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      action = createBufferLineAddedAction({
        id: 2,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: [],
        notify_level: 3,
        highlight: true
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      expect(store.getState().hotlists).toHaveProperty('1709932823238637');
      const hotlist = store.getState().hotlists['1709932823238637'];
      expect(hotlist.sum).toEqual(2);
      expect(hotlist.highlight).toEqual(1);
    });

    it('falls back to updating hotlist using tags', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      let action = createBufferLineAddedAction({
        id: 0,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: ['notify_none'],
        highlight: false
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      action = createBufferLineAddedAction({
        id: 1,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: [],
        highlight: false
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      action = createBufferLineAddedAction({
        id: 2,
        buffer_id: 1709932823238637,
        date: '2024-12-08T17:15:36.000Z',
        tags: [],
        highlight: true
      });
      expect(action).toBeDefined();
      store.dispatch(action!);

      expect(store.getState().hotlists).toHaveProperty('1709932823238637');
      const hotlist = store.getState().hotlists['1709932823238637'];
      expect(hotlist.sum).toEqual(2);
      expect(hotlist.highlight).toEqual(1);
    });
  });

  describe('on buffer_line_data_changed', () => {
    it('updates the line', () => {
      const preloadedState = {
        lines: { '1709932823238637': [{ id: 0 } as WeechatLine] }
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = LineAction({
        code: 0,
        event_name: 'buffer_line_data_changed',
        buffer_id: 1709932823238637,
        body_type: 'line',
        body: {
          id: 0,
          date: '2024-11-09T00:02:07.000Z',
          date_printed: '2024-11-10T17:28:48.000Z',
          message: 'Beep boop'
        } as LineResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('1709932823238637');
      const lines = store.getState().lines['1709932823238637'];
      expect(lines[0].message).toEqual('Beep boop');
    });
  });
});
