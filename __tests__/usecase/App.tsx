import 'react-native';
import App from '../../src/usecase/App';

import { act, render } from '../../src/test-utils';
import { configureStore } from '@reduxjs/toolkit';
import { reducer } from '../../src/store';
import { AppState } from '../../src/store/app';
import {
  bufferNotificationAction,
  changeCurrentBufferAction
} from '../../src/store/actions';

jest.mock('react-native-drawer-layout');

describe('App', () => {
  describe('on notification', () => {
    it('changes the current buffer to the notification buffer', () => {
      const bufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [bufferId]: {
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
      const clearHotlistForBuffer = jest.fn();
      const fetchBufferInfo = jest.fn();

      render(
        <App
          disconnect={() => {}}
          fetchBufferInfo={fetchBufferInfo}
          sendMessageToBuffer={() => {}}
          clearHotlistForBuffer={clearHotlistForBuffer}
        />,
        { store }
      );

      act(() => {
        store.dispatch(
          bufferNotificationAction({
            bufferId,
            lineId: '8580dcc40',
            identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
          })
        );
      });

      expect(store.getState().app.currentBufferId).toEqual(bufferId);
      expect(clearHotlistForBuffer).toHaveBeenCalledWith(null);
      expect(fetchBufferInfo).toHaveBeenCalledWith(bufferId);
    });

    it('fetches buffer info if the notification is for the current buffer', () => {
      const bufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [bufferId]: {
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
          }
        }
      });
      const fetchBufferInfo = jest.fn();
      const clearHotlistForBuffer = jest.fn();

      render(
        <App
          disconnect={() => {}}
          fetchBufferInfo={fetchBufferInfo}
          sendMessageToBuffer={() => {}}
          clearHotlistForBuffer={clearHotlistForBuffer}
        />,
        { store }
      );

      act(() => {
        store.dispatch(changeCurrentBufferAction(bufferId));
        store.dispatch(
          bufferNotificationAction({
            bufferId,
            lineId: '8580dcc40',
            identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
          })
        );
      });

      expect(fetchBufferInfo).toHaveBeenCalledWith(bufferId);
      expect(clearHotlistForBuffer).not.toHaveBeenCalled();
    });
  });
});
