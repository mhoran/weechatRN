import 'react-native';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';
import BufferContainer from '../../../../src/usecase/buffers/ui/BufferContainer';
import { act, render, screen } from '../../../../src/test-utils';
import { reducer } from '../../../../src/store';
import { configureStore } from '@reduxjs/toolkit';
import {
  bufferNotificationAction,
  changeCurrentBufferAction,
  fetchLinesAction
} from '../../../../src/store/actions';

jest.mock('../../../../src/usecase/buffers/ui/Buffer');

describe('BufferContainer', () => {
  beforeEach(() => {
    jest.mocked(Buffer).mockImplementation();
  });

  it('defers notification until buffer change and line fetch', () => {
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
        }
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    render(
      <BufferContainer
        bufferId={bufferId}
        showTopic={false}
        sendMessage={() => {}}
        fetchMoreLines={() => {}}
      />,
      { store }
    );

    const bufferContainer = screen.UNSAFE_getByType(
      BufferContainer.WrappedComponent
    );

    act(() => {
      store.dispatch(
        bufferNotificationAction({
          bufferId,
          lineId: 0,
          identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
        })
      );
    });

    expect(bufferContainer.props.notification).toBeNull();

    act(() => {
      store.dispatch(changeCurrentBufferAction(bufferId));
    });

    expect(bufferContainer.props.notification).toBeNull();

    act(() => {
      store.dispatch(
        fetchLinesAction([
          {
            id: 1730555173010842,
            buffer: '86c417600',
            date: '2024-04-05T02:40:09.000Z',
            date_printed: '2024-04-06T17:20:30.000Z',
            displayed: 1,
            highlight: 0,
            message: 'Second message',
            pointers: ['86c417600', '8580eeec0', '8580dcc40', '86c2ff040'],
            prefix: 'user',
            tags_array: ['irc_privmsg', 'notify_message']
          } as WeechatLine
        ])
      );
    });

    expect(bufferContainer.props.notification).toEqual({
      bufferId,
      lineId: 0,
      identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
    });
  });

  it('clears notification after being handled by the buffer component', () => {
    const ActualBuffer = jest.requireActual<
      typeof import('../../../../src/usecase/buffers/ui/Buffer')
    >('../../../../src/usecase/buffers/ui/Buffer').default;
    jest.mocked(Buffer).mockImplementation((props) => {
      return new ActualBuffer(props);
    });
    jest.spyOn(ActualBuffer.prototype, 'componentDidUpdate');

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
        }
      },
      enhancers: (getDefaultEnhancers) =>
        getDefaultEnhancers({ autoBatch: false })
    });

    render(
      <BufferContainer
        bufferId={bufferId}
        showTopic={false}
        sendMessage={() => {}}
        fetchMoreLines={() => {}}
      />,
      { store }
    );

    act(() => {
      store.dispatch(
        bufferNotificationAction({
          bufferId,
          lineId: 0,
          identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
        })
      );
    });

    expect(store.getState().app.notification).not.toBeNull();

    act(() => {
      store.dispatch(changeCurrentBufferAction(bufferId));
    });

    act(() => {
      store.dispatch(
        fetchLinesAction([
          {
            id: 0,
            buffer: '86c417600',
            date: '2024-04-05T02:40:09.000Z',
            date_printed: '2024-04-06T17:20:30.000Z',
            displayed: 1,
            highlight: 0,
            message: 'Second message',
            pointers: ['86c417600', '8580eeec0', '8580dcc40', '86c2ff040'],
            prefix: 'user',
            tags_array: ['irc_privmsg', 'notify_message']
          } as WeechatLine
        ])
      );
    });

    expect(ActualBuffer.prototype.componentDidUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ notificationLineId: 0 }),
      expect.anything(),
      undefined
    );
    expect(store.getState().app.notification).toBeNull();
  });
});
