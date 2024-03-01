import * as React from 'react';
import { Button } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { ParseShape } from 'react-native-parsed-text';
import BufferLine from './BufferLine';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: string;
  onLongPress: () => void;
  parseArgs: ParseShape[];
  bufferId: string;
  fetchMoreLines: (lines: number) => void;
}

const keyExtractor = (line: WeechatLine) =>
  line.pointers[line.pointers.length - 1];

interface HeaderProps {
  bufferId: string;
  lines: number;
  fetchMoreLines: (lines: number) => void;
}

const Header: React.FC<HeaderProps> = ({ bufferId, lines, fetchMoreLines }) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );
  useEffect(() => {
    setDesiredLines(Buffer.DEFAULT_LINE_INCREMENT);
  }, [bufferId]);

  if (lines < desiredLines) return;

  return (
    <Button
      title="Load more lines"
      onPress={() => {
        const next = desiredLines + Buffer.DEFAULT_LINE_INCREMENT;
        fetchMoreLines(next);
        setDesiredLines(next);
      }}
    />
  );
};

export default class Buffer extends React.PureComponent<Props> {
  static readonly DEFAULT_LINE_INCREMENT = 300;

  linesList = React.createRef<FlashList<WeechatLine>>();

  componentDidUpdate(prevProps: Props) {
    const { bufferId } = this.props;
    if (bufferId !== prevProps.bufferId) {
      this.linesList.current?.scrollToOffset({ animated: false, offset: 0 });
    }
  }

  renderBuffer: ListRenderItem<WeechatLine> = ({ item }) => {
    const { onLongPress, parseArgs, lastReadLine } = this.props;
    const marker = item.pointers.at(-1) === lastReadLine;

    return (
      <BufferLine
        line={item}
        onLongPress={onLongPress}
        parseArgs={parseArgs}
        marker={marker}
      />
    );
  };

  render() {
    const { bufferId, lines, fetchMoreLines } = this.props;
    return (
      <FlashList
        ref={this.linesList}
        data={lines}
        inverted
        keyboardDismissMode="interactive"
        keyExtractor={keyExtractor}
        renderItem={this.renderBuffer}
        ListFooterComponent={
          <Header
            bufferId={bufferId}
            lines={lines.length}
            fetchMoreLines={fetchMoreLines}
          />
        }
        estimatedItemSize={44}
      />
    );
  }
}
