import { MaterialIcons } from '@expo/vector-icons';
import type { FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native';
import type { ParseShape } from 'react-native-parsed-text';
import type RelayClient from '../../../lib/weechat/client';
import BufferLine from './BufferLine';
import { styles as lineStyles } from './themes/Default';

interface Props {
  lines: WeechatLine[];
  lastReadLine?: number;
  onLongPress: (line: WeechatLine) => void;
  parseArgs: ParseShape[];
  bufferId: string;
  client: RelayClient;
  notificationLineId?: number;
  clearNotification: () => void;
}

const keyExtractor = (line: WeechatLine) => String(line.id);

interface HeaderProps {
  lines: number;
  fetchMoreLines: (lines: number) => void;
}

const Header: React.FC<HeaderProps> = ({ lines, fetchMoreLines }) => {
  const [desiredLines, setDesiredLines] = useState(
    Buffer.DEFAULT_LINE_INCREMENT
  );

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
  listHeight: number;
  showScrollToEndButton: boolean;
}

export default class Buffer extends React.PureComponent<Props, State> {
  static readonly DEFAULT_LINE_INCREMENT = 300;
  static readonly NUM_LINES_TO_RENDER = 35;

  linesList = React.createRef<FlashListRef<WeechatLine>>();

  state: State = {
    nickWidth: 0,
    listHeight: 0,
    showScrollToEndButton: false
  };

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { notificationLineId, clearNotification, lines } = this.props;

    if (
      notificationLineId !== undefined &&
      notificationLineId !== prevProps.notificationLineId
    ) {
      clearNotification();

      const index = lines.findIndex((line) => line.id === notificationLineId);
      if (index < 0) return;

      setTimeout(() => {
        void this.linesList.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5
        });
      });
    }
  }

  fetchMoreLines = (lines: number) => {
    this.props.client.fetchBufferInfo(this.props.bufferId, lines);
  };

  renderBuffer: ListRenderItem<WeechatLine> = ({ item, index }) => {
    const { onLongPress, parseArgs, lastReadLine, lines } = this.props;
    const { nickWidth } = this.state;

    let lastMessage;
    for (let i = index - 1; i >= 0; i--) {
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
        nickWidth={nickWidth}
        lastReadLine={lastReadLine}
        lastMessageDate={lastMessage?.date}
      />
    );
  };

  updateListHeight = (event: LayoutChangeEvent) =>
    this.setState({ listHeight: event.nativeEvent.layout.height });

  handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {
      nativeEvent: {
        contentOffset: { y: contentOffsetY },
        contentSize: { height: contentHeight }
      }
    } = event;

    // FIXME: layoutMeasurement.height is incorrect when backgrounded on iOS
    if (contentOffsetY + this.state.listHeight < contentHeight) {
      this.setState({ showScrollToEndButton: true });
    } else {
      this.setState({ showScrollToEndButton: false });
    }
  };

  render() {
    const { lines, bufferId } = this.props;

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
      <View style={styles.container}>
        <FlashList
          ref={this.linesList}
          accessibilityLabel="Message list"
          style={{ backgroundColor: '#222' }}
          data={lines}
          key={bufferId}
          maintainVisibleContentPosition={{
            startRenderingFromBottom: true,
            autoscrollToBottomThreshold: 0.2,
            animateAutoScrollToBottom: false
          }}
          scrollsToTop={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          keyExtractor={keyExtractor}
          renderItem={this.renderBuffer}
          ListHeaderComponent={
            <Header lines={lines.length} fetchMoreLines={this.fetchMoreLines} />
          }
          onLayout={this.updateListHeight}
          onScroll={this.handleOnScroll}
        />
        {this.state.showScrollToEndButton && (
          <View style={styles.scrollToEndButton}>
            <MaterialIcons
              name="keyboard-arrow-down"
              size={44}
              color="#fff"
              onPress={() =>
                this.linesList.current?.scrollToEnd({ animated: true })
              }
              accessibilityLabel="Scroll to end"
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollToEndButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    marginBottom: 10,
    marginRight: 10,
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: '#222'
  }
});
