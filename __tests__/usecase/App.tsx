import 'react-native';
import App from '../../src/usecase/App';

import { configureStore } from '@reduxjs/toolkit';
import RelayClient from '../../src/lib/weechat/client';
import { reducer } from '../../src/store';
import * as actions from '../../src/store/actions';
import type { AppState } from '../../src/store/app';
import { act, render } from '../../src/test-utils';

jest.mock('react-native-drawer-layout');

describe('App', () => {
  describe('on mount', () => {
    it('fetches buffer info and clears hotlist for current buffer', () => {
      const bufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [bufferId]: {
              _id: 1730555173010842,
              full_name: 'irc.libera.#weechat',
              hidden: 0,
              id: bufferId,
              local_variables: {
                channel: '#weechat',
                name: 'libera.#weechat',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 2,
              pointers: [bufferId],
              short_name: '#weechat',
              title: '',
              type: 0
            }
          },
          app: { currentBufferId: bufferId } as AppState
        }
      });
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
      const fetchBufferInfo = (client.fetchBufferInfo = jest.fn());
      const clearHotlistForBuffer = (client.clearHotlistForBuffer = jest.fn());

      render(<App disconnect={() => {}} client={client} />, { store });

      expect(fetchBufferInfo).toHaveBeenCalledWith(bufferId);
      expect(clearHotlistForBuffer).toHaveBeenCalledWith(bufferId);
      expect(fetchBufferInfo.mock.invocationCallOrder[0]).toBeLessThan(
        clearHotlistForBuffer.mock.invocationCallOrder[0]
      );
    });
  });

  describe('on notification', () => {
    it('changes the current buffer to the notification buffer', () => {
      const bufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [bufferId]: {
              _id: 1730555173010842,
              full_name: 'irc.libera.#weechat',
              hidden: 0,
              id: bufferId,
              local_variables: {
                channel: '#weechat',
                name: 'libera.#weechat',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 2,
              pointers: [bufferId],
              short_name: '#weechat',
              title: '',
              type: 0
            }
          },
          app: { currentBufferId: null } as AppState
        }
      });
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
      const fetchBufferInfo = (client.fetchBufferInfo = jest.fn());
      const clearHotlistForBuffer = (client.clearHotlistForBuffer = jest.fn());

      render(<App disconnect={() => {}} client={client} />, { store });

      act(() => {
        store.dispatch(
          actions.bufferNotificationAction({
            bufferId,
            lineId: 0,
            identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
          })
        );
      });

      expect(store.getState().app.currentBufferId).toEqual(bufferId);
      expect(fetchBufferInfo).toHaveBeenCalledWith(bufferId);
      expect(clearHotlistForBuffer).toHaveBeenCalledWith(bufferId);
      expect(fetchBufferInfo.mock.invocationCallOrder[0]).toBeLessThan(
        clearHotlistForBuffer.mock.invocationCallOrder[0]
      );
    });
  });
});
