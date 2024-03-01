import * as React from 'react';
import { Button, View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { ParseShape } from 'react-native-parsed-text';
import { cef } from '../../../lib/weechat/colors';
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

const Header = (props: {
  bufferId: string;
  lines: number;
  fetchMoreLines: (lines: number) => void;
}) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );
  useEffect(() => {
    setDesiredLines(Buffer.DEFAULT_LINE_INCREMENT);
  }, [props.bufferId]);

  if (props.lines < desiredLines) return;

  return (
    <Button
      title="Load more lines"
      onPress={() => {
        const next = desiredLines + Buffer.DEFAULT_LINE_INCREMENT;
        props.fetchMoreLines(next);
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
      <>
        {item.displayed !== 0 && (
          <BufferLine
            line={item}
            onLongPress={onLongPress}
            parseArgs={parseArgs}
          />
        )}
        {marker && <View style={{ borderWidth: 1, borderColor: cef[5] }} />}
      </>
    );
  };

  render(): JSX.Element {
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
