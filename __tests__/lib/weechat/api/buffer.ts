import { configureStore } from '@reduxjs/toolkit';
import BufferAction from '../../../../src/lib/weechat/api/buffer';
import type { BufferResponse } from '../../../../src/lib/weechat/api/types';
import { reducer } from '../../../../src/store';
import type { AppState } from '../../../../src/store/app';

describe(BufferAction, () => {
  it('updates the buffer on successful request', () => {
    const preloadedState = {
      buffers: {
        '1730555173010842': {} as WeechatBuffer
      }
    };
    const store = configureStore({
      reducer,
      preloadedState,
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    const action = BufferAction({
      code: 200,
      request: 'GET /buffers/1730555173010842',
      body_type: 'buffer',
      body: {
        id: 1730555173010842,
        last_read_line_id: 1,
        name: 'irc.libera.#test'
      } as BufferResponse['body']
    });
    expect(action).toBeDefined();

    store.dispatch(action!);

    expect(store.getState().buffers).toHaveProperty('1730555173010842');
    const buffer = store.getState().buffers['1730555173010842'];
    expect(buffer.last_read_line).toEqual(1);
    expect(buffer.full_name).toEqual('irc.libera.#test');
  });

  describe('on buffer_opened', () => {
    it('sets _id to the id provided by the relay', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_opened',
        buffer_id: 1730555173010842,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1730555173010842');
      const buffer = store.getState().buffers['1730555173010842'];
      expect(buffer._id).toEqual('1730555173010842');
    });
  });

  describe('on buffer_cleared', () => {
    it('clears lines for the given buffer', () => {
      const preloadedState = {
        buffers: {
          '1730555173010842': {} as WeechatBuffer
        },
        lines: {
          '1730555173010842': [
            {
              id: 0,
              buffer: '1730555173010842',
              date: '2024-11-09T00:02:07.000Z',
              date_printed: '2024-11-10T17:28:48.000Z',
              message: 'Beep boop'
            } as WeechatLine
          ]
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_cleared',
        buffer_id: 1730555173010842,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('1730555173010842');
      const lines = store.getState().lines['1730555173010842'];
      expect(lines).toEqual([]);
    });
  });

  describe('on buffer_closing', () => {
    it('removes references to buffers that have been closed', () => {
      const preloadedState = {
        hotlists: {
          '1709932823238637': {} as Hotlist,
          '1709932823423765': {} as Hotlist
        },
        nicklists: { '1709932823238637': [], '1709932823423765': [] },
        buffers: {
          '1709932823238637': {} as WeechatBuffer,
          '1709932823423765': {} as WeechatBuffer
        },
        lines: { '1709932823238637': [], '1709932823423765': [] },
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

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_closing',
        buffer_id: 1709932823423765,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
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
        lines: { '1709932823238637': [], '1709932823423765': [] },
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

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_closing',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().app.currentBufferId).toEqual('1709932823423765');
    });
  });

  describe('on buffer_renamed', () => {
    it('updates the buffer name', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': {} as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_renamed',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {
          short_name: '#wee'
        } as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.short_name).toEqual('#wee');
    });
  });

  describe('on buffer_moved', () => {
    it('updates the buffer number', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': {} as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_moved',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {
          number: 2
        } as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.number).toEqual(2);
    });
  });

  describe('on buffer_hidden', () => {
    it('sets the buffer to hidden', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': { hidden: 0 } as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_hidden',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.hidden).toEqual(1);
    });
  });

  describe('on buffer_unhidden', () => {
    it('sets the buffer to unhidden', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': { hidden: 1 } as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_unhidden',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {} as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.hidden).toEqual(0);
    });
  });

  describe('on buffer_localvar_removed', () => {
    it('removes omitted local variables', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': {
            local_variables: {
              type: 'channel'
            }
          } as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_localvar_removed',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {
          local_variables: {
            type: 'channel'
          }
        } as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.local_variables).not.toHaveProperty('test');
    });
  });

  describe('on buffer_title_changed', () => {
    it('updates the buffer title', () => {
      const preloadedState = {
        buffers: {
          '1709932823238637': {
            title: 'The best channel on Freenode'
          } as WeechatBuffer
        }
      };
      const store = configureStore({
        preloadedState,
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = BufferAction({
        code: 0,
        event_name: 'buffer_title_changed',
        buffer_id: 1709932823238637,
        body_type: 'buffer',
        body: {
          title: 'The best channel on Libera.Chat'
        } as BufferResponse['body']
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('1709932823238637');
      const buffer = store.getState().buffers['1709932823238637'];
      expect(buffer.title).toEqual('The best channel on Libera.Chat');
    });
  });
});
