import * as React from 'react';
import { Button, Text, View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useEffect, useState } from 'react';
import { ParseShape } from 'react-native-parsed-text';
import BufferLine from './BufferLine';
import { styles as lineStyles } from './themes/Default';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: string;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  bufferId: string;
  fetchMoreLines: (lines: number) => void;
  notificationLineId?: string;
  clearNotification: () => void;
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

interface State {
  nickWidth: number;
}

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;

  linesList = React.createRef<FlashList<WeechatLine>>();

  state: State = {
    nickWidth: 0
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { notificationLineId, clearNotification } = this.props;
    if (
      notificationLineId &&
      notificationLineId !== prevProps.notificationLineId
    ) {
      this.linesList.current?.clearLayoutCacheOnUpdate();
      this.linesList.current?.forceUpdate(() => {
        this.scrollToLine(notificationLineId);
      });
      clearNotification();
    }
  }

  scrollToLine = (lineId: string) => {
    const index = this.props.lines.findIndex(
      (line) => line.pointers[line.pointers.length - 1] === lineId
    );
    if (index < 0) return;

    this.scrollToIndex(index);
  };

  scrollToIndex = async (index: number) => {
    const listView = this.linesList.current?.recyclerlistview_unsafe;
    if (!listView) return;

    while (!listView.getLayout(index)?.isOverridden) {
      this.linesList.current?.scrollToIndex({
        index: index,
        animated: false
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.linesList.current?.scrollToIndex({
      index: index,
      animated: false,
      viewPosition: 0.5
    });
  };

  renderBuffer: ListRenderItem<WeechatLine> = ({ item, index }) => {
    const { onLongPress, parseArgs, lastReadLine, lines } = this.props;
    let lastMessage;
    for (let i = index + 1; i < lines.length; i++) {
      if (lines[i].displayed) {
        lastMessage = lines[i];
        break;
      }
    }

    return (
      <BufferLine
        line={item}
        onLongPress={onLongPress}
        parseArgs={parseArgs}
        nickWidth={this.state.nickWidth}
        lastReadLine={lastReadLine}
        lastMessageDate={lastMessage?.date}
      />
    );
  };

  render() {
    const { bufferId, lines, fetchMoreLines } = this.props;

    if (!this.state.nickWidth) {
      return (
        <View style={{ flex: 1, opacity: 0 }} aria-hidden>
          <Text
            onLayout={(layout) => {
              this.setState({ nickWidth: layout.nativeEvent.layout.width });
            }}
            style={[lineStyles.text, { position: 'absolute' }]}
          >
            aaaaaaaa
          </Text>
        </View>
      );
    }

    return (
      <FlashList
        ref={this.linesList}
        data={lines}
        key={bufferId}
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
        estimatedItemSize={26.5}
      />
    );
  }
}
