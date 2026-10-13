import { render, screen } from '@testing-library/react-native';
import BufferListItem from '../../../../src/usecase/buffers/ui/BufferListItem';

describe(BufferListItem, () => {
  describe('for the current buffer', () => {
    it('always shows the buffer in the buffer list', async () => {
      const buffer = {
        hidden: 1,
        short_name: '#general',
        local_variables: { type: 'channel' }
      } as WeechatBuffer;
      const hotlist = {
        highlight: 0,
        sum: 0
      } as Hotlist;

      await render(
        <BufferListItem
          buffer={buffer}
          hotlist={hotlist}
          isCurrentBuffer={true}
          onSelectBuffer={jest.fn()}
          filterBuffers={false}
        />
      );

      expect(screen.queryByText('#general')).not.toBeNull();
    });
  });

  describe('for other buffers', () => {
    it('hides the buffer if it is hidden', async () => {
      const buffer = {
        hidden: 1,
        short_name: '#general',
        local_variables: { type: 'channel' }
      } as WeechatBuffer;
      const hotlist = {
        highlight: 0,
        sum: 0
      } as Hotlist;

      await render(
        <BufferListItem
          buffer={buffer}
          hotlist={hotlist}
          isCurrentBuffer={false}
          onSelectBuffer={jest.fn()}
          filterBuffers={false}
        />
      );

      expect(screen.queryByText('#general')).toBeNull();
    });

    it('hides the core buffer if filterBuffers is true', async () => {
      const buffer = {
        hidden: 0,
        short_name: 'weechat',
        local_variables: {}
      } as WeechatBuffer;
      const hotlist = {
        highlight: 0,
        sum: 0
      } as Hotlist;

      await render(
        <BufferListItem
          buffer={buffer}
          hotlist={hotlist}
          isCurrentBuffer={false}
          onSelectBuffer={jest.fn()}
          filterBuffers={true}
        />
      );

      expect(screen.queryByText('weechat')).toBeNull();
    });

    it('shows the core buffer if filterBuffers is false', async () => {
      const buffer = {
        hidden: 0,
        short_name: 'weechat',
        local_variables: {}
      } as WeechatBuffer;
      const hotlist = {
        highlight: 0,
        sum: 0
      } as Hotlist;

      await render(
        <BufferListItem
          buffer={buffer}
          hotlist={hotlist}
          isCurrentBuffer={false}
          onSelectBuffer={jest.fn()}
          filterBuffers={false}
        />
      );

      expect(screen.queryByText('weechat')).not.toBeNull();
    });
  });
});
