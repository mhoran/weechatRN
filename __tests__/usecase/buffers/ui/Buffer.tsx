import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import RelayClient from '../../../../src/lib/weechat/client';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';

jest.useFakeTimers();

jest.mock('@shopify/flash-list/dist/recyclerview/utils/measureLayout', () => {
  const originalModule = jest.requireActual(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout'
  );
  return {
    ...originalModule,
    measureParentSize: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 1024,
      height: 26.5
    })),
    measureFirstChildLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 1024,
      height: 0
    })),
    measureItemLayout: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      width: 1024,
      height: 26.5
    }))
  };
});

describe(Buffer, () => {
  const measureNickWidth = () => {
    const nickWidthText = screen.getByText('aaaaaaaa', { hidden: true });
    fireEvent(nickWidthText, 'layout', {
      nativeEvent: {
        layout: { height: 16.7, width: 68, x: 0, y: 0 }
      }
    });
  };

  describe('when notificationLineId is provided', () => {
    it('scrolls to the corresponding line', () => {
      const lines = [
        {
          id: 0,
          buffer: '86c417600',
          date: '2024-04-05T02:40:09.000Z',
          date_printed: '2024-04-06T17:20:30.000Z',
          displayed: 1,
          highlight: 1,
          message: 'First message',
          pointers: ['86c417600', '8580eeec0', '8580dcf80', '86c2fefd0'],
          prefix: 'user',
          tags_array: ['irc_privmsg', 'notify_message']
        } as WeechatLine,
        {
          id: 1,
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
      ];
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

      render(
        <Buffer
          lines={[]}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      measureNickWidth();

      screen.rerender(
        <Buffer
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
          notificationLineId={0}
        />
      );

      act(() => jest.runAllTimers());

      expect(ScrollView.prototype.scrollTo).toHaveBeenLastCalledWith({
        animated: true,
        x: 0,
        y: 0
      });
    });
  });

  describe('load more lines button', () => {
    const default_line_increment = Buffer.DEFAULT_LINE_INCREMENT;

    beforeEach(() => {
      Object.defineProperty(Buffer, 'DEFAULT_LINE_INCREMENT', {
        value: default_line_increment,
        writable: false
      });
    });

    it('only renders when there are more lines to load', () => {
      Object.defineProperty(Buffer, 'DEFAULT_LINE_INCREMENT', {
        value: 1,
        writable: false
      });

      const lines = [
        {
          id: 0,
          buffer: '86c417600',
          date: '2024-04-05T02:40:09.000Z',
          date_printed: '2024-04-06T17:20:30.000Z',
          displayed: 1,
          highlight: 1,
          message: 'First message',
          pointers: ['86c417600', '8580eeec0', '8580dcf80', '86c2fefd0'],
          prefix: 'user',
          tags_array: ['irc_privmsg', 'notify_message']
        } as WeechatLine
      ];
      const client = new RelayClient(jest.fn(), jest.fn(), jest.fn());

      render(
        <Buffer
          lines={[]}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      measureNickWidth();

      expect(screen.queryByLabelText('Message list')).not.toBeNull();

      expect(screen.queryByText('Load more lines')).toBeNull();

      screen.rerender(
        <Buffer
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      expect(screen.queryByText('Load more lines')).not.toBeNull();
    });
  });
});
