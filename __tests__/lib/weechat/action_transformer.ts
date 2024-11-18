import { UnknownAction, configureStore } from '@reduxjs/toolkit';
import { StoreState, reducer } from '../../../src/store';
import { transformToReduxAction } from '../../../src/lib/weechat/action_transformer';
import { ThunkAction } from 'redux-thunk';
import * as actions from '../../../src/store/actions';
import { AppState } from '../../../src/store/app';

describe('transformToReduxAction', () => {
  describe('on buffers', () => {
    it('removes references to buffers that have been closed', () => {
      const preloadedState = {
        hotlists: { '8578d9c00': {} as Hotlist, '83a41cd80': {} as Hotlist },
        nicklists: { '8578d9c00': [], '83a41cd80': [] },
        buffers: {
          '8578d9c00': {} as WeechatBuffer,
          '83a41cd80': {} as WeechatBuffer
        },
        lines: { '8578d9c00': [], '83a41cd80': [] },
        app: {
          currentBufferId: '8578d9c00'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'buffers',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).not.toHaveProperty('8578d9c00');
      expect(store.getState().buffers).toHaveProperty('83a41cd80');

      expect(store.getState().hotlists).not.toHaveProperty('8578d9c00');
      expect(store.getState().hotlists).toHaveProperty('83a41cd80');

      expect(store.getState().nicklists).not.toHaveProperty('8578d9c00');
      expect(store.getState().nicklists).toHaveProperty('83a41cd80');

      expect(store.getState().lines).not.toHaveProperty('8578d9c00');
      expect(store.getState().lines).toHaveProperty('83a41cd80');

      expect(store.getState().app.currentBufferId).toBeNull();
    });

    it('first removes closed buffers, then updates buffers', () => {
      const action = transformToReduxAction({
        id: 'buffers',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: []
          }
        ]
      });
      expect(action).toBeDefined();

      const thunk = action as ThunkAction<
        void,
        StoreState,
        void,
        UnknownAction
      >;
      const dispatch = jest.fn();
      thunk(
        dispatch,
        jest.fn(() => ({ buffers: {} }) as StoreState)
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        actions.fetchBuffersRemovedAction([])
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        actions.fetchBuffersAction({})
      );
    });

    it('preserves currentBufferId if the buffer is still open', () => {
      const preloadedState = {
        buffers: {
          '8578d9c00': {} as WeechatBuffer,
          '83a41cd80': {} as WeechatBuffer
        },
        app: {
          currentBufferId: '8578d9c00'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'buffers',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['8578d9c00'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().app.currentBufferId).toEqual('8578d9c00');
    });

    it('sets _id to the id provided by the relay', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'buffers',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ id: '1730555173010842', pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('83a41cd80');
      const buffer = store.getState().buffers['83a41cd80'];
      expect(buffer._id).toEqual(1730555173010842);
    });

    it('defaults _id to the buffer pointer', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'buffers',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('83a41cd80');
      const buffer = store.getState().buffers['83a41cd80'];
      expect(buffer._id).toEqual(parseInt('83a41cd80', 16));
    });
  });

  describe('on _buffer_opened', () => {
    it('sets _id to the id provided by the relay', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_opened',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ id: '1730555173010842', pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('83a41cd80');
      const buffer = store.getState().buffers['83a41cd80'];
      expect(buffer._id).toEqual(1730555173010842);
    });

    it('defaults _id to the buffer pointer', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_opened',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toHaveProperty('83a41cd80');
      const buffer = store.getState().buffers['83a41cd80'];
      expect(buffer._id).toEqual(parseInt('83a41cd80', 16));
    });
  });

  describe('on _buffer_closing', () => {
    it('removes references to buffers that have been closed', () => {
      const preloadedState = {
        hotlists: { '8578d9c00': {} as Hotlist, '83a41cd80': {} as Hotlist },
        nicklists: { '8578d9c00': [], '83a41cd80': [] },
        buffers: {
          '8578d9c00': {} as WeechatBuffer,
          '83a41cd80': {} as WeechatBuffer
        },
        lines: { '8578d9c00': [], '83a41cd80': [] },
        app: {
          currentBufferId: '83a41cd80'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_closing',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['83a41cd80'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).not.toHaveProperty('83a41cd80');
      expect(store.getState().buffers).toHaveProperty('8578d9c00');

      expect(store.getState().hotlists).not.toHaveProperty('83a41cd80');
      expect(store.getState().hotlists).toHaveProperty('8578d9c00');

      expect(store.getState().nicklists).not.toHaveProperty('83a41cd80');
      expect(store.getState().nicklists).toHaveProperty('8578d9c00');

      expect(store.getState().lines).not.toHaveProperty('83a41cd80');
      expect(store.getState().lines).toHaveProperty('8578d9c00');

      expect(store.getState().app.currentBufferId).toBeNull();
    });

    it('preserves currentBufferId if the buffer is still open', () => {
      const preloadedState = {
        buffers: {
          '8578d9c00': {} as WeechatBuffer,
          '83a41cd80': {} as WeechatBuffer
        },
        lines: { '8578d9c00': [], '83a41cd80': [] },
        app: {
          currentBufferId: '83a41cd80'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_closing',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [{ pointers: ['8578d9c00'] }]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().app.currentBufferId).toEqual('83a41cd80');
    });
  });

  describe('on last_read_lines', () => {
    it('merges the last read line with buffer state', () => {
      const preloadedState = {
        buffers: {
          '83d204d80': { full_name: 'irc.libera.#weechat' } as WeechatBuffer
        }
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'last_read_lines',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                buffer: '83d204d80',
                pointers: ['83d204d80', '83c016280', '838a65900', '83c000420']
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().buffers).toMatchObject({
        '83d204d80': {
          full_name: 'irc.libera.#weechat',
          last_read_line: '83c000420'
        }
      });
    });
  });

  describe('on _nicklist_diff', () => {
    it('synchronizes the nicklist state with the provided diff', () => {
      const preloadedState = {
        nicklists: {
          '84ed37600': [
            {
              name: 'oldnick',
              pointers: ['84ed37600', '85139f000']
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

      const action = transformToReduxAction({
        id: '_nicklist_diff',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                _diff: 45,
                group: 0,
                name: 'oldnick',
                pointers: ['84ed37600', '85139f000']
              },
              {
                _diff: 43,
                group: 0,
                name: 'newnick',
                pointers: ['84ed37600', '85139f000']
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().nicklists).toMatchObject({
        '84ed37600': [{ name: 'newnick', pointers: ['84ed37600', '85139f000'] }]
      });
    });
  });

  describe('on lines', () => {
    it('sets id to the id provided by the relay', () => {
      const preloadedState = {
        app: {
          version: '4.4.0'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'lines',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                id: 0,
                buffer: '83a41cd80',
                pointers: ['83a41cd80', '8493d36c0', '84d806c20', '85d064440'],
                date: new Date('2024-11-09T00:02:07.000Z'),
                date_printed: new Date('2024-11-10T17:28:48.000Z')
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('83a41cd80');
      const lines = store.getState().lines['83a41cd80'];
      expect(lines[0].id).toEqual(0);
    });

    it('defaults id to the line pointer', () => {
      const preloadedState = {
        app: {
          version: '3.7.0'
        } as AppState
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'lines',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                buffer: '83a41cd80',
                pointers: ['83a41cd80', '8493d36c0', '84d806c20', '85d064440'],
                date: new Date('2024-11-09T00:02:07.000Z'),
                date_printed: new Date('2024-11-10T17:28:48.000Z')
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('83a41cd80');
      const lines = store.getState().lines['83a41cd80'];
      expect(lines[0].id).toEqual(parseInt('85d064440', 16));
    });
  });

  describe('on _buffer_line_added', () => {
    it('sets id to the id provided by the relay', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_line_added',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                id: 0,
                buffer: '83a41cd80',
                pointers: ['83a41cd80', '8493d36c0', '84d806c20', '85d064440'],
                date: new Date('2024-11-09T00:02:07.000Z'),
                date_printed: new Date('2024-11-10T17:28:48.000Z'),
                tags_array: []
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('83a41cd80');
      const lines = store.getState().lines['83a41cd80'];
      expect(lines[0].id).toEqual(0);
    });

    it('defaults id to the line pointer', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_line_added',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                buffer: '83a41cd80',
                pointers: ['83a41cd80', '8493d36c0', '84d806c20', '85d064440'],
                date: new Date('2024-11-09T00:02:07.000Z'),
                date_printed: new Date('2024-11-10T17:28:48.000Z'),
                tags_array: []
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('83a41cd80');
      const lines = store.getState().lines['83a41cd80'];
      expect(lines[0].id).toEqual(parseInt('85d064440', 16));
    });
  });

  describe('on buffer_line_data_changed', () => {
    it('updates the line', () => {
      const preloadedState = {
        lines: { '83d204d80': [{ id: 0 } as WeechatLine] }
      };
      const store = configureStore({
        reducer,
        preloadedState,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: '_buffer_line_data_changed',
        header: { compression: 0, length: 0 },
        objects: [
          {
            type: 'hda',
            content: [
              {
                id: 0,
                buffer: '83d204d80',
                pointers: ['83d204d80', '83c016280', '838a65900', '83c000420'],
                date: new Date('2024-11-09T00:02:07.000Z'),
                date_printed: new Date('2024-11-10T17:28:48.000Z'),
                message: 'Beep boop'
              }
            ]
          }
        ]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().lines).toHaveProperty('83d204d80');
      const lines = store.getState().lines['83d204d80'];
      expect(lines[0].message).toEqual('Beep boop');
    });
  });

  describe('on version', () => {
    it('stores the version', () => {
      const store = configureStore({
        reducer,
        enhancers: (getDefaultEnhancers) =>
          getDefaultEnhancers({ autoBatch: false })
      });

      const action = transformToReduxAction({
        id: 'version',
        header: { compression: 0, length: 0 },
        objects: [{ content: { key: 'version', value: '4.4.3' }, type: 'inf' }]
      });
      expect(action).toBeDefined();

      store.dispatch(action!);

      expect(store.getState().app.version).toEqual('4.4.3');
    });
  });
});
