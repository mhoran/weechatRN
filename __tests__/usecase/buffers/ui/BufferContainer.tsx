import { configureStore } from '@reduxjs/toolkit';
import 'react-native';
import RelayClient from '../../../../src/lib/weechat/client';
import { reducer } from '../../../../src/store';
import * as actions from '../../../../src/store/actions';
import type { AppState } from '../../../../src/store/app';
import { act, fireEvent, render, screen } from '../../../../src/test-utils';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';
import BufferContainer from '../../../../src/usecase/buffers/ui/BufferContainer';

jest.mock('../../../../src/usecase/buffers/ui/Buffer');

describe('BufferContainer', () => {
  beforeEach(() => {
    jest.mocked(Buffer).mockReset();
  });

  it('defers notification until buffer change and line fetch', async () => {
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
            notify: 'all',
            number: 2,
            pointers: [bufferId],
            short_name: '#weechat',
            title: '',
            type: 0
          }
        }
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

    await render(
      <BufferContainer bufferId={bufferId} showTopic={false} client={client} />,
      { store }
    );

    await act(() => {
      store.dispatch(
        actions.bufferNotificationAction({
          bufferId,
          lineId: 1730555173010842,
          identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
        })
      );
    });

    expect(Buffer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        notificationLineId: undefined
      }),
      undefined
    );

    await act(() => {
      store.dispatch(actions.changeCurrentBufferAction(bufferId));
    });

    expect(Buffer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        notificationLineId: undefined
      }),
      undefined
    );

    await act(() => {
      store.dispatch(
        actions.fetchLinesAction([
          {
            id: 1730555173010842,
            buffer: '86c417600',
            date: '2024-04-05T02:40:09.000Z',
            displayed: 1,
            highlight: 0,
            message: 'Second message',
            pointers: ['86c417600', '8580eeec0', '8580dcc40', '86c2ff040'],
            prefix: 'user',
            tags_array: ['irc_privmsg', 'notify_message']
          }
        ])
      );
    });

    expect(Buffer).toHaveBeenLastCalledWith(
      expect.objectContaining({
        notificationLineId: 1730555173010842
      }),
      undefined
    );
  });

  it('clears notification after being handled by the buffer component', async () => {
    const ActualBuffer = jest.requireActual<
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      typeof import('../../../../src/usecase/buffers/ui/Buffer')
    >('../../../../src/usecase/buffers/ui/Buffer').default;
    jest.mocked(Buffer).mockImplementation((props) => {
      return ActualBuffer(props);
    });

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
            notify: 'all',
            number: 2,
            pointers: [bufferId],
            short_name: '#weechat',
            title: '',
            type: 0
          }
        }
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

    await render(
      <BufferContainer bufferId={bufferId} showTopic={false} client={client} />,
      { store }
    );

    await act(() => {
      store.dispatch(
        actions.bufferNotificationAction({
          bufferId,
          lineId: 0,
          identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
        })
      );
    });

    expect(store.getState().app.notification).not.toBeNull();

    await act(() => {
      store.dispatch(actions.changeCurrentBufferAction(bufferId));
    });

    await act(() => {
      store.dispatch(
        actions.fetchLinesAction([
          {
            id: 0,
            buffer: '86c417600',
            date: '2024-04-05T02:40:09.000Z',
            displayed: 1,
            highlight: 0,
            message: 'Second message',
            pointers: ['86c417600', '8580eeec0', '8580dcc40', '86c2ff040'],
            prefix: 'user',
            tags_array: ['irc_privmsg', 'notify_message']
          }
        ])
      );
    });

    expect(Buffer).toHaveBeenCalledWith(
      expect.objectContaining({ notificationLineId: 0 }),
      undefined
    );
    expect(store.getState().app.notification).toBeNull();
  });

  it('prevents sending message when disconnected', async () => {
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
            notify: 'all',
            number: 2,
            pointers: [bufferId],
            short_name: '#weechat',
            title: '',
            type: 0
          }
        },
        app: { connected: false, currentBufferId: bufferId } as AppState
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.sendMessageToBuffer = jest.fn();

    await render(
      <BufferContainer bufferId={bufferId} showTopic={false} client={client} />,
      { store }
    );

    const textInput = screen.getByLabelText('Buffer text field');

    await fireEvent(textInput, 'onChangeText', 'Hello, world!');
    await fireEvent(textInput, 'submitEditing', {
      nativeEvent: { text: 'Hello,\nworld!' }
    });

    expect(client.sendMessageToBuffer).not.toHaveBeenCalled();
    expect(textInput.props.value).toEqual('Hello, world!');
  });

  it('preserves newlines when input_multiline is true', async () => {
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
            notify: 'all',
            number: 2,
            pointers: [bufferId],
            short_name: '#weechat',
            title: '',
            type: 0,
            input_multiline: true
          }
        },
        app: { connected: true, currentBufferId: bufferId } as AppState
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.sendMessageToBuffer = jest.fn();

    await render(
      <BufferContainer bufferId={bufferId} showTopic={false} client={client} />,
      { store }
    );

    const textInput = screen.getByLabelText('Buffer text field');

    await fireEvent(textInput, 'onChangeText', 'Hello,\nworld!');
    await fireEvent(textInput, 'submitEditing', {
      nativeEvent: { text: 'Hello,\nworld!' }
    });

    expect(client.sendMessageToBuffer).toHaveBeenCalledWith(
      { bufferId },
      'Hello,\nworld!'
    );
  });

  it('splits on newlines when input_multiline is false', async () => {
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
            notify: 'all',
            number: 2,
            pointers: [bufferId],
            short_name: '#weechat',
            title: '',
            type: 0,
            input_multiline: false
          }
        },
        app: { connected: true, currentBufferId: bufferId } as AppState
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });
    const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());
    client.sendMessageToBuffer = jest.fn();

    await render(
      <BufferContainer bufferId={bufferId} showTopic={false} client={client} />,
      { store }
    );

    const textInput = screen.getByLabelText('Buffer text field');

    await fireEvent(textInput, 'onChangeText', 'Hello,\nworld!');
    await fireEvent(textInput, 'submitEditing', {
      nativeEvent: { text: 'Hello,\nworld!' }
    });

    expect(client.sendMessageToBuffer).toHaveBeenCalledWith(
      { bufferId },
      'Hello,'
    );
    expect(client.sendMessageToBuffer).toHaveBeenCalledWith(
      { bufferId },
      'world!'
    );
  });
});
