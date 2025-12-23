import type { RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { configureStore } from '@reduxjs/toolkit';
import { View } from 'react-native';
import RelayClient from '../../src/lib/weechat/client';
import { reducer } from '../../src/store';
import * as actions from '../../src/store/actions';
import type { AppState } from '../../src/store/app';
import { act, fireEvent, render, screen } from '../../src/test-utils';
import App from '../../src/usecase/App';
import type { RootStackParamList } from '../../src/usecase/Root';
import { Snackbar } from '../../src/usecase/shared/Snackbar';

jest.mock('../../src/usecase/shared/Snackbar');

describe('App', () => {
  beforeEach(() => {
    jest.mocked(Snackbar).mockReset();
  });

  describe('when connected', () => {
    it('fetches buffer info and clears hotlist for current buffer', () => {
      const bufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [bufferId]: {
              _id: '1730555173010842',
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

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={null}
        />,
        { store }
      );

      act(() => {
        store.dispatch(actions.fetchVersionAction('4.4.4'));
      });

      expect(fetchBufferInfo).toHaveBeenCalledWith(bufferId);
      expect(clearHotlistForBuffer).toHaveBeenCalledWith(bufferId);
      expect(fetchBufferInfo.mock.invocationCallOrder[0]).toBeLessThan(
        clearHotlistForBuffer.mock.invocationCallOrder[0]
      );
    });
  });

  describe('on notification', () => {
    it('changes the current buffer to the notification buffer', () => {
      const currentBufferId = '83fd7ac00';
      const notificationBufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [notificationBufferId]: {
              _id: '1730555173010842',
              full_name: 'irc.libera.#weechat',
              hidden: 0,
              id: notificationBufferId,
              local_variables: {
                channel: '#weechat',
                name: 'libera.#weechat',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 2,
              pointers: [notificationBufferId],
              short_name: '#weechat',
              title: '',
              type: 0
            },
            [currentBufferId]: {
              _id: '1765043412858698',
              full_name: 'irc.libera.#weechat-android',
              hidden: 0,
              id: currentBufferId,
              local_variables: {
                channel: '#weechat-android',
                name: 'libera.#weechat-android',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 4,
              pointers: [currentBufferId],
              short_name: '#weechat-android',
              title: '',
              type: 0
            }
          },
          app: { currentBufferId: currentBufferId } as AppState
        }
      });
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
      const fetchBufferInfo = (client.fetchBufferInfo = jest.fn());
      const clearHotlistForBuffer = (client.clearHotlistForBuffer = jest.fn());

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={null}
        />,
        {
          store
        }
      );

      act(() => {
        store.dispatch(
          actions.bufferNotificationAction({
            bufferId: notificationBufferId,
            lineId: 0,
            identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
          })
        );
      });

      expect(store.getState().app.currentBufferId).toEqual(
        notificationBufferId
      );
      expect(clearHotlistForBuffer).not.toHaveBeenCalledWith(currentBufferId);
      expect(fetchBufferInfo).toHaveBeenCalledWith(notificationBufferId);
      expect(clearHotlistForBuffer).toHaveBeenCalledWith(notificationBufferId);
      expect(fetchBufferInfo.mock.invocationCallOrder[0]).toBeLessThan(
        clearHotlistForBuffer.mock.invocationCallOrder[0]
      );
    });
  });

  describe('on buffer selection', () => {
    it('sets the selected buffer as the current buffer', () => {
      const currentBufferId = '83fd7ac00';
      const selectedBufferId = '86c417600';
      const store = configureStore({
        reducer,
        preloadedState: {
          buffers: {
            [selectedBufferId]: {
              _id: '1730555173010842',
              full_name: 'irc.libera.#weechat',
              hidden: 0,
              id: selectedBufferId,
              local_variables: {
                channel: '#weechat',
                name: 'libera.#weechat',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 2,
              pointers: [selectedBufferId],
              short_name: '#weechat',
              title: '',
              type: 0
            },
            [currentBufferId]: {
              _id: '1765043412858698',
              full_name: 'irc.libera.#weechat-android',
              hidden: 0,
              id: currentBufferId,
              local_variables: {
                channel: '#weechat-android',
                name: 'libera.#weechat-android',
                plugin: 'irc',
                type: 'channel'
              },
              notify: 3,
              number: 4,
              pointers: [currentBufferId],
              short_name: '#weechat-android',
              title: '',
              type: 0
            }
          },
          app: { currentBufferId: currentBufferId } as AppState
        }
      });
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
      const fetchBufferInfo = (client.fetchBufferInfo = jest.fn());
      const clearHotlistForBuffer = (client.clearHotlistForBuffer = jest.fn());

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={null}
        />,
        {
          store
        }
      );

      const button = screen.getByLabelText('Open buffer list');
      fireEvent(button, 'press');

      const bufferListItem = screen.getByText('#weechat');
      fireEvent(bufferListItem, 'press');

      expect(store.getState().app.currentBufferId).toEqual(selectedBufferId);
      expect(clearHotlistForBuffer).toHaveBeenNthCalledWith(1, currentBufferId);
      expect(fetchBufferInfo).toHaveBeenCalledWith(selectedBufferId);
      expect(clearHotlistForBuffer).toHaveBeenNthCalledWith(
        2,
        selectedBufferId
      );
      expect(fetchBufferInfo.mock.invocationCallOrder[0]).toBeLessThan(
        clearHotlistForBuffer.mock.invocationCallOrder[1]
      );
    });
  });

  describe('on connection error', () => {
    beforeEach(() => {
      jest
        .mocked(Snackbar)
        .mockImplementation(() => <View accessible role="alert" />);
    });

    it('displays the error', () => {
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={{ message: () => 'There was an error connecting.' }}
        />
      );

      expect(Snackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'There was an error connecting.'
        }),
        undefined
      );

      const snackbar = screen.getByRole('alert');
      expect(snackbar).toBeOnTheScreen();
    });

    it('does not display the error after being dismissed', () => {
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={{ message: () => 'There was an error connecting.' }}
        />
      );

      expect(Snackbar).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'There was an error connecting.',
          onDismiss: expect.any(Function)
        }),
        undefined
      );
      const snackbar = screen.getByRole('alert');

      act(() => jest.mocked(Snackbar).mock.calls[0][0].onDismiss());

      expect(snackbar).not.toBeOnTheScreen();
    });

    it('displays a subsequent error after a previous error was dismissed', () => {
      const store = configureStore({
        reducer
      });
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

      render(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={{ message: () => 'There was an error connecting.' }}
        />,
        {
          store
        }
      );

      act(() => jest.mocked(Snackbar).mock.calls[0][0].onDismiss());

      screen.rerender(
        <App
          route={{} as RouteProp<RootStackParamList, 'App'>}
          navigation={{} as StackNavigationProp<RootStackParamList, 'App'>}
          connect={jest.fn()}
          disconnect={jest.fn()}
          client={client}
          connectionError={{
            message: () => 'There was a different error connecting.'
          }}
        />
      );

      expect(Snackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'There was a different error connecting.'
        }),
        undefined
      );

      const snackbar = screen.getByRole('alert');
      expect(snackbar).toBeOnTheScreen();
    });
  });
});
