import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { ScrollView } from 'react-native';
import Buffer from '../../../../src/usecase/buffers/ui/Buffer';

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
    it('scrolls to the corresponding line', async () => {
      const bufferRef = React.createRef<Buffer>();
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

      render(
        <Buffer
          ref={bufferRef}
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          fetchMoreLines={() => {}}
          clearNotification={() => {}}
        />
      );

      measureNickWidth();

      screen.rerender(
        <Buffer
          ref={bufferRef}
          lines={lines}
          onLongPress={() => {}}
          parseArgs={[]}
          bufferId={'86c417600'}
          fetchMoreLines={() => {}}
          clearNotification={() => {}}
          notificationLineId={0}
        />
      );

      // Simulate layout event for the ScrollView
      const scrollView = screen.getByLabelText('Message list');
      fireEvent(scrollView, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      // Simulate layout event for first line
      let message = screen.getByTestId('renderCell(0)');
      fireEvent(message, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 0 }
        }
      });

      // Simulate layout event for second line
      message = screen.getByTestId('renderCell(1)');
      fireEvent(message, 'layout', {
        nativeEvent: {
          layout: { height: 26.5, width: 1024, x: 0, y: 26.5 }
        }
      });

      expect(ScrollView.prototype.scrollTo).toHaveBeenCalledWith({
        animated: true,
        y: 26.5
      });
    });
  });
});
