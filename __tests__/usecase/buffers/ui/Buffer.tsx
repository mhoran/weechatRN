import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';
import { CellContainer } from '@shopify/flash-list';

jest.useFakeTimers();

describe(Buffer, () => {
  const measureNickWidth = () => {
    const nickWidthText = screen.getByText('aaaaaaaa', { hidden: true });
    fireEvent(nickWidthText, 'layout', {
      nativeEvent: {
        layout: { height: 16.7, width: 68, x: 0, y: 0 }
      }
    });
  };

  describe('scrollToLine', () => {
    it('retries when the target line has not yet been measured', async () => {
      const bufferRef = React.createRef<Buffer>();
      render(
        <Buffer
          ref={bufferRef}
          lines={[
            {
              buffer: '86c417600',
              date: '2024-04-05T02:40:09.000Z',
              date_printed: '2024-04-06T17:20:30.000Z',
              displayed: 1,
              highlight: 0,
              message:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
              pointers: ['86c417600', '8580eeec0', '8580dcc40', '86c2ff040'],
              prefix: 'user',
              tags_array: ['irc_privmsg', 'notify_message']
            } as WeechatLine,
            {
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
          ]}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={''}
          fetchMoreLines={() => {}}
          clearNotification={() => {}}
        />
      );

      measureNickWidth();

      // Simulate layout event for the ScrollView
      const scrollView = screen.UNSAFE_getByType(ScrollView);
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      // Simulate layout event for first line
      let messageCell = screen
        .UNSAFE_getAllByType(CellContainer)
        .find((container) =>
          within(container).queryByText(
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          )
        );
      expect(messageCell).toBeDefined();
      fireEvent(messageCell, 'layout', {
        nativeEvent: {
          layout: { height: 43, width: 1024, x: 0, y: 0 }
        }
      });

      jest.advanceTimersToNextTimer();

      bufferRef.current?.scrollToLine('86c2fefd0');

      expect(ScrollView.prototype.scrollTo).toHaveBeenNthCalledWith(1, {
        animated: false,
        x: 0,
        y: 43
      });

      // Simulate scroll event in response to scrollTo
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentInset: { bottom: 0, left: 0, right: 0, top: 0 },
          contentOffset: { x: 0, y: 43 },
          contentSize: { height: 43, width: 1024 },
          layoutMeasurement: { height: 26.5, width: 1024 }
        }
      });

      // Simulate layout event for second line
      messageCell = screen
        .UNSAFE_getAllByType(CellContainer)
        .find((container) => within(container).queryByText('First message'));
      expect(messageCell).toBeDefined();
      fireEvent(messageCell, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 43 }
        }
      });

      await waitFor(() => {
        expect(ScrollView.prototype.scrollTo).toHaveBeenNthCalledWith(2, {
          animated: false,
          x: 0,
          y: 43
        });
      });
    });
  });
});
