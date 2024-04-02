import 'react-native';
import BufferContainer from '../../../../src/usecase/buffers/ui/BufferContainer';
import { act, render } from '../../../../src/test-utils';
import { reducer } from '../../../../src/store';
import { configureStore } from '@reduxjs/toolkit';
import {
  bufferNotificationAction,
  changeCurrentBufferAction,
  fetchLinesAction
} from '../../../../src/store/actions';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';

jest.mock('.../../../../src/usecase/buffers/ui/Buffer');

describe('BufferContainer', () => {
  it('scrolls to line and clears notification after fetching lines', () => {
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

    Buffer.prototype.scrollToLine = jest.fn();

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
          lineId: '8580dcc40',
          identifier: '1fb4fc1d-530b-466f-85be-de27772de0a9'
        })
      );
    });

    expect(Buffer.prototype.scrollToLine).not.toHaveBeenCalled();

    act(() => {
      store.dispatch(changeCurrentBufferAction(bufferId));
      store.dispatch(
        fetchLinesAction([
          {
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

    expect(Buffer.prototype.scrollToLine).toHaveBeenCalledWith('8580dcc40');
    expect(store.getState().app.notification).toBeNull();
  });
});
