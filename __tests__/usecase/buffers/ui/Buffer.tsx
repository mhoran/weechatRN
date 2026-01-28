import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ScrollView, View } from 'react-native';
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
  beforeEach(() => {
    jest
      .spyOn(View.prototype, 'measure')
      .mockImplementationOnce((callback) => callback(0, 0, 68, 16.7, 0, 0));
  });

  describe('when notificationLineId is provided', () => {
    it('scrolls to the corresponding line', () => {
      const lines = [
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
        } as WeechatLine,
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
        y: 26.5
      });
    });
  });

  describe('load more lines button', () => {
    const default_line_increment = Buffer.DEFAULT_LINE_INCREMENT;

    beforeEach(() => {
      Buffer.DEFAULT_LINE_INCREMENT = default_line_increment;
    });

    it('only renders when there are more lines to load', () => {
      Buffer.DEFAULT_LINE_INCREMENT = 1;

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

    it('indicates that lines are loading', () => {
      Buffer.DEFAULT_LINE_INCREMENT = 1;

      let lines = [
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      const button = screen.getByText('Load more lines');

      fireEvent(button, 'press');

      expect(button).toHaveTextContent('Loading...');

      lines = [
        ...lines,
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

      expect(button).toHaveTextContent('Load more lines');
    });

    it('fetches more lines', () => {
      Buffer.DEFAULT_LINE_INCREMENT = 1;

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
      client.fetchBufferLines = jest.fn();

      render(
        <Buffer
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      const button = screen.getByText('Load more lines');

      fireEvent(button, 'press');

      expect(client.fetchBufferLines).toHaveBeenCalledWith('86c417600', 2);
    });
  });

  describe('scroll to end button', () => {
    it('scrolls to end', () => {
      const lines = [
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
        } as WeechatLine,
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      expect(screen.queryByLabelText('Scroll to end')).toBeNull();

      fireEvent(scrollView, 'scroll', {
        nativeEvent: {
          contentOffset: { y: 26.5 },
          contentSize: { height: 26.5 * 2 },
          layoutMeasurement: { width: 1024, height: 26.5 }
        }
      });

      expect(screen.queryByLabelText('Scroll to end')).not.toBeNull();
    });

    it('hides on buffer change', () => {
      const lines = [
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
        } as WeechatLine,
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
        />
      );

      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      fireEvent(scrollView, 'scroll', {
        nativeEvent: {
          contentOffset: { y: 26.5 },
          contentSize: { height: 26.5 * 2 },
          layoutMeasurement: { width: 1024, height: 26.5 }
        }
      });

      expect(screen.queryByLabelText('Scroll to end')).not.toBeNull();

      screen.rerender(
        <Buffer
          lines={[]}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'83a41cd80'}
          client={client}
          clearNotification={() => {}}
        />
      );

      expect(screen.queryByLabelText('Scroll to end')).toBeNull();
    });
  });

  describe('unread message notification', () => {
    it('scrolls to the last unread message', () => {
      const lines = [
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
        } as WeechatLine,
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
          lastReadLine={0}
        />
      );

      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      act(() => jest.runAllTimers());

      const button = screen.getByLabelText('Scroll to unread');

      fireEvent(button, 'press');

      expect(ScrollView.prototype.scrollTo).toHaveBeenLastCalledWith({
        animated: true,
        x: 0,
        y: 26.5
      });
    });

    it('is not displayed for viewed messages', () => {
      const lines = [
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
        } as WeechatLine,
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
          lastReadLine={1}
        />
      );

      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      act(() => jest.runAllTimers());

      expect(screen.queryByLabelText('Scroll to unread')).toBeNull();

      fireEvent(scrollView, 'scroll', {
        nativeEvent: {
          contentOffset: { y: 26.5 },
          contentSize: { height: 26.5 * 2 },
          layoutMeasurement: { width: 1024, height: 26.5 }
        }
      });

      act(() => jest.runAllTimers());

      expect(screen.queryByLabelText('Scroll to unread')).toBeNull();
    });

    it('scrolls to the end if the message is not loaded', () => {
      const lines = [
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
        } as WeechatLine,
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
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          client={client}
          clearNotification={() => {}}
          lastReadLine={2}
        />
      );

      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      act(() => jest.runAllTimers());

      const button = screen.getByLabelText('Scroll to unread');

      fireEvent(button, 'press');

      expect(ScrollView.prototype.scrollTo).toHaveBeenLastCalledWith({
        animated: true,
        x: 0,
        y: 26.5
      });
    });
  });
});
